/*
*  Frappe Better Attach Control © 2022
*  Author:  Ameen Ahmed
*  Company: Level Up Marketing & Software Development Services
*  Licence: Please refer to license.txt
*/

import deepCloneObject from './../utils';
import { get_icon_class, make_images_list } from './../filetypes';

frappe.ui.form.ControlAttach = class ControlAttach extends frappe.ui.form.ControlAttach {
    make() {
        super.make();
        this._parse_options();
    }
     make_input() {
        this._parse_options();
        let me = this;
        this.$input = $('<button class="btn btn-default btn-sm btn-attach">')
            .html(__('Attach'))
            .prependTo(this.input_area)
            .on({
                click: function() { me.on_attach_click(); },
                attach_doc_image: function() { me.on_attach_doc_image(); }
            });
        
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
    clear_attachment() {
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
    on_attach_click() {
        this.set_upload_options();
        this.file_uploader = new frappe.ui.FileUploader(!this._images_only ? this.upload_options : this.image_upload_options);
    }
    on_attach_doc_image() {
        this.set_upload_options();
        this.file_uploader = new frappe.ui.FileUploader(this.image_upload_options);
    }
    set_upload_options() {
        this._parse_options();
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
        if ($.isPlainObject(this._options)) {
            Object.assign(options, this._options);
        }
        this.upload_options = options;
        this.image_upload_options = deepCloneObject(options);
        this._parse_image_types(this.image_upload_options.restrictions);
        if (!this.image_upload_options.restrictions.crop_image_aspect_ratio) {
            this.image_upload_options.restrictions.crop_image_aspect_ratio = 1;
        }
    }
    set_value(value, force_set_value=false) {
        return super.set_value(this._append_value(value), force_set_value);
    }
    set_input(value, dataurl) {
        if (value) {
            let _value = this._value_to_array(value, value);
            if (Array.isArray(_value)) {
                if (!this._allow_multiple) this.set_input(_value[0] || null);
                else {
                    var me = this;
                    _value.forEach(function(v) { me.set_input(v); });
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
            let file_url_parts = value.match(/^([^:]+),(.+):(.+)$/),
            filename = null;
            if (file_url_parts) {
                filename = file_url_parts[1];
                dataurl = file_url_parts[2] + ':' + file_url_parts[3];
            }
            if (!filename) filename = dataurl ? value : value.split('/').pop();
            let $link = this.$value.toggle(true).find('.attached-file-link');
            if (this._allow_multiple) {
                let val_data = [filename, dataurl || value];
                if (this._values.indexOf(val_data) < 0) {
                    this._values.push(val_data);
                    let file_name = this._values[0][0];
                    if (this._values.length > 1) {
                        file_name = this._values.length + ' ' + __('files');
                    }
                    $link.html(file_name);
                }
            } else {
                $link.html(filename).attr('href', dataurl || value);
            }
        } else {
            this.value = null;
            this._values = [];
            this.$input.toggle(true);
            this.$value.toggle(false);
        }
    }
    async on_upload_complete(attachment) {
        if (this.frm) {
            await this.parse_validate_and_set_in_model(this._append_value(attachment.file_url));
            this.frm.attachments.update_attachment(attachment);
            this.frm.doc.docstatus == 1 ? this.frm.save('Update') : this.frm.save();
        }
        this.set_value(attachment.file_url);
    }
    toggle_reload_button() {
        this.$value.find('[data-action="reload_attachment"]')
        .toggle(this._values.length > 0);
    }
    _parse_options() {
        if (!this._is_better) {
            this._is_better = true;
            this._def_options = null;
            this._options = null;
            this._values = [];
            this._allow_multiple = false;
            this._max_number_of_files = 0;
        }
        if (!this.df.options || this.df.options === this._def_options) return;
        if (frappe.utils.is_json(this.df.options)) {
            this.df.options = frappe.utils.parse_json(this.df.options);
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
        this._max_number_of_files = opts.restrictions.max_number_of_files || 0;
        if (this.frm && this._allow_multiple && this._max_number_of_files
            && (
                this._max_number_of_files > frappe.get_meta(this.frm.doctype).max_attachments
                || this._max_number_of_files > (this.frm.meta.max_attachments || 0)
            )
        ) {
            frappe.get_meta(this.frm.doctype).max_attachments = this.frm.meta.max_attachments = this._max_number_of_files;
        }
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
                row = $('<div>').addClass('row').appendTo(
                    $('<div>').addClass('container-fluid p-1').appendTo(dialog.body).get(0)
                );
                dialog.$wrapper.addClass('modal-dialog-scrollable');
                dialog.get_primary_btn().removeClass('btn-primary').addClass('btn-danger');
                me._values.forEach(function(v) {
                    let name = v[0],
                    url = v[1],
                    _class = !me._images_only ? get_icon_class(url) : 'ba-image',
                    is_image = _class === 'ba-image',
                    href = url,
                    attr = '';
                    if (is_image) {
                        href = '#';
                        attr = ' data-ba-image="' + url + '"';
                    }
                    $(`
                        <div class="col-lg-3 col-md-4 col-6 p-1">
                            <a href="${href}" class="ba-link" target="__blank"${attr}>
                                <div class="card h-100">
                                    <div class="icon card-img-top pt-3 ba-file ${_class}"></div>
                                    <div class="card-body py-1">
                                        <div class="card-title display-4 ba-filename">${name}</div>
                                    </div>
                                </div>
                            </a>
                        </div>
                    `).appendTo(row);
                });
                row.find('a[data-ba-image]').each(function(i, dom) {
                    dom = $(dom);
                    me._on_setup_display(dom, dom.attr('data-ba-image'));
                });
                dialog.show();
            });
        }
    }
    _on_setup_display(dom, url) {
        dom = dom || this.$value.find('.attached-file-link');
        url = url || this.value;
        dom.popover({
            trigger: 'hover',
            placement: 'top',
            content: function() {
                return `<div><img src="${url}" width="150px" style="object-fit:contain"/></div>`;
            },
            html: true
        });
    }
    _parse_image_types(opts) {
        if (opts.allowed_file_types == null) opts.allowed_file_types = [];
        else if (!Array.isArray(opts.allowed_file_types)) opts.allowed_file_types = [opts.allowed_file_types];
        opts.allowed_file_types = make_images_list(opts.allowed_file_types);
        if (!opts.allowed_file_types.length) opts.allowed_file_types = ['image/*'];
    }
    _value_to_array(value, def) {
        let val = value;
        if (!Array.isArray(val)) val = frappe.utils.parse_json(val) || def || [];
        return val;
    }
    _append_value(value) {
        if (this._allow_multiple) {
            let _value = this._value_to_array(this.value);
            if (_value.indexOf(value) < 0) {
                _value.push(value);
                this.value = value = JSON.stringify(_value);
            } else {
                value = this.value;
            }
        }
        return value;
    }
};