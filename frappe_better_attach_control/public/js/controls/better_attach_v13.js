/*
*  Frappe Better Attach Control © 2022
*  Author:  Ameen Ahmed
*  Company: Level Up Marketing & Software Development Services
*  Licence: Please refer to license.txt
*/

import { deepCloneObject, valToArray, formatSize } from './../utils';
import { get_icon_class, make_images_list } from './../filetypes';

frappe.ui.form.ControlAttach = frappe.ui.form.ControlAttach.extend({
    make: function() {
        this._super();
        this._parse_options();
    },
    make_input: function() {
        this._parse_options();
        let me = this;
        this.$input = $('<button class="btn btn-default btn-sm btn-attach">')
            .html(__('Attach'))
            .prependTo(this.input_area)
            .on('click', function() { me.on_attach_click(); });
		
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
    },
    clear_attachment: function() {
        if (this.frm) {
            this.parse_validate_and_set_in_model(null);
            this.refresh();
            var me = this,
            callback = function() {
                me.parse_validate_and_set_in_model(null);
                me.refresh();
                me.frm.doc.docstatus == 1 ? me.frm.save('Update') : me.frm.save();
            };
            if (this._allow_multiple) {
                let _vals = valToArray(this.value);
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
    },
    on_attach_click: function() {
        this.set_upload_options();
        this.file_uploader = new frappe.ui.FileUploader(this.upload_options);
    },
    set_upload_options: function() {
        this._parse_options();
        if (this.upload_options) return;
        var me = this;
        let options = {
            allow_multiple: false,
            on_success: function(file) {
                me.on_upload_complete(file);
                me.toggle_reload_button();
            },
            restrictions: {}
        };
        if (this.frm) {
            options.doctype = this.frm.doctype;
            options.docname = this.frm.docname;
            options.fieldname = this.df.fieldname;
        }
        if ($.isPlainObject(this._options)) {
            Object.assign(options, this._options);
        }
        this.upload_options = options;
        if (this._images_only) this._parse_image_types(this.upload_options.restrictions);
    },
    set_value: function(value, force_set_value=false) {
        return this._super(this._prepare_value(value), force_set_value);
    },
    set_input: function(value, dataurl) {
        if (value) {
            let _value = valToArray(value, value, true);
            if (Array.isArray(_value)) {
                if (!this._allow_multiple) this.set_input(_value[0] || null);
                else {
                    var me = this;
                    _value.forEach(function(v) { me.set_input(v); });
                }
                return;
            }
            this.value = this._allow_multiple ? this._prepare_value(value) : value;
            
            this.$input.toggle(false);
            let file_url_parts = value.match(/^([^:]+),(.+):(.+)$/),
            filename = null;
            if (file_url_parts) {
                filename = file_url_parts[1];
                dataurl = file_url_parts[2] + ':' + file_url_parts[3];
            }
            if (!filename) filename = dataurl ? value : value.split('/').pop();
            let $link = this.$value.toggle(true).find('.attached-file-link');
            if (this._allow_multiple) {
                let vals = valToArray(this.value),
                file_name = filename;
                if (vals.length > 1) file_name = vals.length + ' ' + __('files');
                $link.html(file_name);
            } else {
                $link.html(filename).attr('href', dataurl || value);
            }
        } else {
            this.value = null;
            this._files = [];
            this.$input.toggle(true);
            this.$value.toggle(false);
        }
    },
    on_upload_complete: function(attachment) {
        this._add_file(attachment);
        if (this.frm) {
            this.parse_validate_and_set_in_model(this._prepare_value(attachment.file_url));
            this.frm.attachments.update_attachment(attachment);
            this.frm.doc.docstatus == 1 ? this.frm.save('Update') : this.frm.save();
        }
        this.set_value(attachment.file_url);
    },
    _parse_options: function() {
        if (!this._is_better) {
            this._is_better = true;
            this._def_options = null;
            this._options = null;
            this._files = [];
            this._allow_multiple = false;
        }
        if (!this.df.options || this.df.options === this._def_options) return;
        if (frappe.utils.is_json(this.df.options)) {
            try {
                this.df.options = JSON.parse(this.df.options);
            } catch(e) {
                this.df.options = null;
            }
        }
        this._def_options = this.df.options;
        if (!$.isPlainObject(this.df.options)) return;
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
        let max_number_of_files = opts.restrictions.max_number_of_files || 0;
        if (this.frm && this._allow_multiple && max_number_of_files
            && (
                max_number_of_files > frappe.get_meta(this.frm.doctype).max_attachments
                || max_number_of_files > (this.frm.meta.max_attachments || 0)
            )
        ) {
            frappe.get_meta(this.frm.doctype).max_attachments = this.frm.meta.max_attachments = max_number_of_files;
        }
    },
    _setup_display: function() {
        if (!this._allow_multiple) {
             if (this._images_only) this._on_setup_display();
        } else {
            var me = this;
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
                row = $('<div>').addClass('row').appendTo(
                    $('<div>').addClass('container-fluid p-1').appendTo(dialog.body).get(0)
                );
                dialog.$wrapper.addClass('modal-dialog-scrollable');
                dialog.get_primary_btn().removeClass('btn-primary').addClass('btn-danger');
                me._files.forEach(function(f) {
                    let href = !f.is_image ? f.url : '#',
                    attr = '',
                    meta = '';
                    if (f.size_str || f.width || f.height) {
                        let mdata = [];
                        if (f.size_str) mdata.push(__('Size') + ': ' + f.size_str);
                        if (f.width && f.height) mdata.push(__('Dimensions') + ': ' + f.width + 'x' + f.height);
                        mdata = mdata.join('    ');
                        meta = `<div class="display-4 ba-filesize">${mdata}</div>`;
                    }
                    let file = $(`
                        <div class="col-lg-3 col-md-4 col-6 p-1">
                            <a href="${href}" class="ba-link" target="__blank"${attr}>
                                <div class="card h-100">
                                    <div class="icon card-img-top pt-3 ba-file ${f.class}"></div>
                                    <div class="card-body py-1">
                                        <div class="card-title display-4 ba-filename">${f.name}</div>
                                        ${meta}
                                    </div>
                                </div>
                            </a>
                        </div>
                    `).appendTo(row);
                    if (f.is_image) me._on_setup_display(file, f.url);
                });
                dialog.show();
            });
        }
    },
    _on_setup_display: function(dom, url) {
        dom = dom || this.$value.find('.attached-file-link');
        url = url || this.value;
        dom.popover({
            trigger: 'hover',
            placement: 'top',
            content: function() {
                return '<div><img src="' + url + '" width="150px" style="object-fit:contain"/></div>';
            },
            html: true
        });
    },
    _parse_image_types: function(opts) {
        if (opts.allowed_file_types == null) opts.allowed_file_types = [];
        else if (!Array.isArray(opts.allowed_file_types)) opts.allowed_file_types = [opts.allowed_file_types];
        opts.allowed_file_types = make_images_list(opts.allowed_file_types);
        if (!opts.allowed_file_types.length) opts.allowed_file_types = ['image/*'];
    },
    _prepare_value: function(value) {
        if (this._allow_multiple) {
            let vals = valToArray(this.value);
            if (vals.indexOf(value) < 0) {
                vals.push(value);
                value = JSON.stringify(vals);
            } else {
                value = this.value;
            }
        }
        return value;
    },
    _add_file: function(value) {
        var val = deepCloneObject(value);
        val.name = val.file_name;
        val.url = val.file_url;
        val.class = !this._images_only ? get_icon_class(val.url) : 'ba-image';
        val.is_image = this._images_only || val.class === 'ba-image';
        if (val.is_image) {
            $('<img>', {
                src: val.url,
                onload: function() {
                    val.width = this.width;
                    val.height = this.height;
                }
            });
        }
        if (this.file_uploader) {
            let uf = this.file_uploader.uploader.files;
            for (var i = 0, l = uf.length; i < l; i++) {
                let f = uf[i];
                if (f.file_obj && f.doc && f.doc.file_url === val.url) {
                    val.size = f.file_obj.size;
                    val.size_str = formatSize(val.size);
                    val.extension = f.file_obj.name.toLowerCase().split('.').pop();
                    val.mime = f.file_obj.type.toLowerCase().split(';')[0];
                    break;
                }
            }
        }
        this._files.push(val);
    }
});