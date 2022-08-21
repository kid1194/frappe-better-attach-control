import {
    isArray,
    isDataObject,
    deepCloneObject
} from './utils/check.js';
import {
    to_images_list
} from './utils/mime.js';

frappe.ui.form.ControlAttach = class ControlAttach extends frappe.ui.form.ControlAttach {
    constructor(opts) {
        $log('Initializing');
        super(opts);
    }
    make() {
        super.make();
        this._parse_options();
    }
    _parse_options() {
        if (!this._is_better) {
            this._is_better = true;
            this._is_table = this.frm ? isArray(this.frm.doc[this.df.fieldname]) : false;
            this._def_options = null;
            this._options = null;
            this._values = [];
            this._allow_multiple = false;
            this._max_number_of_files = 0;
        }
        if (!this.df.options || this._def_options === this.df.options) return;
        this._def_options = this.df.options;
        if (frappe.utils.is_json(this.df.options)) {
            this.df.options = frappe.utils.parse_json(this.df.options);
        }
        if (isDataObject(this.df.options)) {
            $log('Parsing options');
            var opts = {restrictions: {}},
            keys = ['upload_notes', 'allow_multiple', 'max_file_size', 'allowed_file_types', 'max_number_of_files', 'crop_image_aspect_ratio'];
            for (var k in this.df.options) {
                let idx = keys.indexOf(k);
                if (idx >= 0) {
                    if (idx < 2) opts[k] = this.df.options[k];
                    else opts.restrictions[k] = this.df.options[k];
                }
            }
            this._options = opts;
            this._allow_multiple = opts.allow_multiple || false;
            this._max_number_of_files = opts.restrictions.max_number_of_files || 0;
            if (this._allow_multiple && this._max_number_of_files && this.frm
                && (
                    this._max_number_of_files > frappe.get_meta(this.frm.doctype).max_attachments
                    || this._max_number_of_files > (this.frm.meta.max_attachments || 0)
                )
            ) {
                frappe.get_meta(this.frm.doctype).max_attachments = this.frm.meta.max_attachments = this._max_number_of_files;
            }
        }
    }
    _parse_image_types(opts) {
        opts.allowed_file_types = isArray(opts.allowed_file_types)
            ? to_images_list(opts.allowed_file_types) : [];
        if (!opts.allowed_file_types.length) opts.allowed_file_types = ['image/*'];
    }
    make_input() {
        this._parse_options();
        $log('Making attachment button');
        let me = this;
        this.$input = $('<button class="btn btn-default btn-sm btn-attach">')
            .html(__('Attach'))
            .prependTo(this.input_area)
            .on({
                click: function() {
                    me.on_attach_click();
                },
                attach_doc_image: function() {
                    me.on_attach_doc_image();
                }
            });
        
        $log('Making attachments list item');
        this.$value = $(`
                <div class="attached-file flex justify-between align-center">
                    <div class="ellipsis">
                        <i class="fa fa-paperclip"></i>
                        <a class="attached-file-link" target="_blank"></a>
                    </div>
                    <div>
                        <a class="btn btn-xs btn-default" data-action="reload_attachment">${__('Reload File')}</a>
                        <a class="btn btn-xs btn-default" data-action="clear_attachment">${__('Clear')}</a>
                    </div>
                </div>
            `)
            .appendTo(this.input_area)
            .toggle(false);
        frappe.utils.bind_actions_with_object(this.$value, this);
        this.toggle_reload_button();
        
        this._setup_display();
        
        this.input = this.$input.get(0);
        this.set_input_attributes();
        this.has_input = true;
    }
    _setup_display() {
        if (!this._allow_multiple) {
             if (this._images_only) this._on_setup_display();
        } else {
            this.$value.find('.attached-file-link')
            .on('click', function(e) {
                var dialog = new frappe.ui.Dialog({
                    title: me.df.label,
                    primary_action_label: 'Close',
                    primary_action() {
                        dialog.hide();
                    }
                }),
                body = dialog.$wrapper.find('.modal-body'),
                cont = $('<div>').addClass('container-fluid').appendTo(body);
                dialog.$wrapper.addClass('modal-dialog-scrollable');
                me._values.forEach(function(v) {
                    let name = v[0],
                    url = v[1],
                    dom = $(`
                        <div class="row">
                            <div class="col col-12 frappe-control" data-fieldtype="Attach">
                                <div class="attached-file flex justify-between align-center">
                                    <div class="ellipsis">
                                        <i class="fa fa-paperclip"></i>
                                        <a class="attached-file-link" target="_blank"></a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).appendTo(cont).find('.attached-file-link').html(name).attr('href', url);
                    if (me._images_only) me._on_setup_display(dom, url);
                });
                dialog.show();
            });
        }
    }
    clear_attachment() {
        $log('Clearing attachments');
        if (this.frm) {
            this.parse_validate_and_set_in_model(null);
            this.refresh();
            var me = this,
            callback = async function() {
                await me.parse_validate_and_set_in_model(null);
                me.refresh();
                me.frm.doc.docstatus == 1 ? me.frm.save('Update') : me.frm.save();
            };
            if (this._allow_multiple) {
                let _vals = this._value_to_array(this.value);
                for (var i = 0, l = _vals.length, last = l - 1; i < l; i++) {
                    this.frm.attachments.remove_attachment_by_filename(_vals[i], i === last ? callback : null);
                }
            } else {
                this.frm.attachments.remove_attachment_by_filename(this.value, callback);
            }
        } else {
            this.dataurl = null;
            this.fileobj = null;
            this.set_input(null);
            this.parse_validate_and_set_in_model(null);
            this.refresh();
        }
    }
    reload_attachment() {
        $log('Reloading attachments');
        super.reload_attachment();
    }
    on_attach_click() {
        $log('Attaching file');
        this.set_upload_options();
        this.file_uploader = new frappe.ui.FileUploader(!this._images_only ? this.upload_options : this.image_upload_options);
    }
    on_attach_doc_image() {
        $log('Attaching image');
        this.set_upload_options();
        if (!this.image_upload_options.restrictions.crop_image_aspect_ratio)
            this.image_upload_options.restrictions.crop_image_aspect_ratio = 1;
        this.file_uploader = new frappe.ui.FileUploader(this.image_upload_options);
    }
    set_upload_options() {
        this._parse_options();
        $log('Setting upload options');
        if (this.upload_options) return;
        let options = {
            allow_multiple: false,
            on_success: file => {
                this.on_upload_complete(file);
                this.toggle_reload_button();
            },
            restrictions: {}
        };
        if (this.frm) {
            options.doctype = this.frm.doctype;
            options.docname = this.frm.docname;
            options.fieldname = this.df.fieldname;
        }
        if (isDataObject(this._options)) {
            Object.assign(options, this._options);
        }
        this.upload_options = options;
        this.image_upload_options = deepCloneObject(options);
        this._parse_image_types(this.image_upload_options.restrictions);
    }
    _value_to_array(value, def) {
        let val = value;
        if (!isArray(val)) val = frappe.utils.parse_json(val) || def || [];
        return val;
    }
    _append_value(value) {
        if (this._allow_multiple) {
            let _value = this._value_to_array(this.value);
            if (_value.indexOf(value) < 0) _value.push(value);
            this.value = value = JSON.stringify(_value);
        }
        return value;
    }
    set_value(value, force_set_value=false) {
        return super.set_value(this._append_value(value), force_set_value);
    }
    set_input(value, dataurl) {
        if (value) {
            let _value = this._value_to_array(value, value);
            if (isArray(_value) && _value.length) {
                if (!this._allow_multiple) this.set_input(_value[0]);
                else {
                    var me = this;
                    _value.forEach(function(v) {
                        me.set_input(v);
                    });
                }
                return;
            }
            if (this._allow_multiple) {
                let val_len = this._value_to_array(this.value).length;
                if (this._max_number_of_files && val_len === this._max_number_of_files) {
                    let err = 'The file was skipped because only {1} uploads are allowed';
                    if (this.frm) err += ' for DocType "{2}"';
                    frappe.throw(__(err, [this._max_number_of_files, this.frm.doctype]));
                    return;
                }
                this._append_value(value);
            } else {
                this.value = value;
            }
            this.$input.toggle(false);
            // value can also be using this format: FILENAME,DATA_URL
            // Important: We have to be careful because normal filenames may also contain ","
            let file_url_parts = value.match(/^([^:]+),(.+):(.+)$/);
            let filename;
            if (file_url_parts) {
                filename = file_url_parts[1];
                dataurl = file_url_parts[2] + ':' + file_url_parts[3];
            }
            let $link = this.$value.toggle(true).find('.attached-file-link');
            if (this._allow_multiple) {
                this._values.push([filename || value, dataurl || value]);
                let file_name = this._values[0];
                if (this._values.length > 1) {
                    file_name += ' ' + _('and {0} more', {0: this._values.length - 1});
                }
                $link.html(file_name);
            } else {
                $link.html(filename || value)
                .attr('href', dataurl || value);
            }
        } else {
            this.value = null;
            this.$input.toggle(true);
            this.$value.toggle(false);
        }
    }
    async on_upload_complete(attachment) {
        $log('Attachment uploaded');
        if (this.frm) {
            await this.parse_validate_and_set_in_model(this._append_value(attachment.file_url));
            this.frm.attachments.update_attachment(attachment);
            this.frm.doc.docstatus == 1 ? this.frm.save('Update') : this.frm.save();
        }
        this.set_value(attachment.file_url);
    }
    toggle_reload_button() {
        this.$value.find('[data-action="reload_attachment"]')
        .toggle(this.file_uploader && this.file_uploader.uploader.files.length > 0);
    }
};

function $log(txt) {
    console.log('[Better Attach Control] ' + txt);
}
