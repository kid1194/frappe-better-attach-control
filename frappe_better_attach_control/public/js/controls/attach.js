/*
*  Frappe Better Attach Control © 2022
*  Author:  Ameen Ahmed
*  Company: Level Up Marketing & Software Development Services
*  Licence: Please refer to LICENSE file
*/


import {
    isArray,
    isObject,
    isPlainObject,
    isEmpty,
    toBool,
    toArray,
    ifNull,
    each,
    clear,
    deepClone,
    parseJson,
    toJson,
    fn,
    formatSize,
    request,
    error
} from './../utils';
import {
    get_filename,
    get_file_ext,
    get_file_type,
    set_file_info,
    to_images_list
} from './../filetypes';


frappe.ui.form.ControlAttach = class ControlAttach extends frappe.ui.form.ControlAttach {
    make() {
        super.make();
        this._parse_options();
    }
     make_input() {
        this._parse_options();
        super.make_input();
        this._toggle_remove_button();
        this._setup_display();
    }
    clear_attachment() {
        if (!this._allow_remove) return;
        if (!this._value.length) {
            this._reset_input();
            return;
        }
        if (!this.frm) {
            request('remove_files', {files: this._value}, fn(function(ret) {
                if (!cint(ret)) error('Unable to remove the uploaded files.');
                else this._reset_input();
            }, this));
            return;
        }
        this.parse_validate_and_set_in_model(null);
        this.refresh();
        request('remove_files', {files: this._value}, fn(function(ret) {
            if (!cint(ret)) {
                error('Unable to remove the uploaded files.');
                return;
            }
            each(this._value, function(v) {
                let fid = !isEmpty(v.name) ? v.name
                    : this.frm.attachments.get_file_id_from_file_url(v);
                if (fid) this.frm.attachments.remove_fileid(fid);
            }, this);
            this.frm.sidebar.reload_docinfo();
            this.parse_validate_and_set_in_model(null).then(fn(function() {
                this._reset_input(1);
                this.refresh();
                this.frm.doc.docstatus == 1 ? this.frm.save('Update') : this.frm.save();
            }, this));
        }, this));
    }
    reload_attachment() {
        if (this._allow_reload) super.reload_attachment();
    }
    on_attach_click() {
        if (this._images_only) this.on_attach_doc_image();
        else super.on_attach_click();
    }
    on_attach_doc_image() {
        this.set_upload_options();
        this.file_uploader = new frappe.ui.FileUploader(this.image_upload_options);
    }
    set_upload_options() {
        if (this.upload_options) return;
        this._parse_options();
        this.df.options = this._options;
        super.set_upload_options();
        this.df.options = this._latest_options;
        this.image_upload_options = this._make_image_options();
    }
    set_value(value, force_set_value=false) {
        return super.set_value(this._set_value(value), force_set_value);
    }
    set_input(value, dataurl) {
        if (
            isEmpty(value) || value === this.value
            || value === this._value || this._value.indexOf(value) >= 0
        ) {
            value == null && this._reset_value();
            return;
        }
        let val = toArray(value, null);
        if (isArray(val)) {
            if (!this._allow_multiple) this.set_input(val[0] || null);
            else {
                let last = val.pop();
                each(val, function(v) { this._set_value(v); }, this);
                this.set_input(last);
            }
            return;
        }
        this.value = this._set_value(value);
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
            $link.html(this._value.length > 1
                ? this._value.length + ' ' + __('files uploaded')
                : filename
            ).attr('href', '#');
        } else {
            $link.html(filename).attr('href', dataurl || value);
        }
    }
    toggle_reload_button() {
        if (!this.$value) return;
        let show = this._allow_reload && this.file_uploader
            && this.file_uploader.uploader.files.length > 0;
        this.$value.find('[data-action="reload_attachment"]').toggle(show);
    }
    refresh() {
        super.refresh();
        if (this.df.options && this.df.options !== this._latest_options) {
            this._parse_options();
        }
    }
    // Custom Methods
    enable_reload() {
        this._allow_reload = true;
        this.toggle_reload_button();
    }
    disable_reload() {
        this._allow_reload = false;
        this.toggle_reload_button();
    }
    enable_remove() {
        this._allow_remove = true;
        this._toggle_remove_button();
    }
    disable_remove() {
        this._allow_remove = false;
        this._toggle_remove_button();
    }
    show_files() {
        this._dialog && this._dialog.show();
    }
    _set_value(value) {
        let ret = !isEmpty(value) ? value : null,
        idx = ret ? this._value.indexOf(ret) : 0;
        if (!ret || (idx < 0 && !this._allow_multiple && this._value.length)) {
            this._remove_file_by_url(this._value.pop());
            this._reset_value();
        }
        if (idx < 0) {
            this._value.push(ret);
            if (this._allow_multiple) {
                this.value = toJson(this._value);
                this._add_file(ret, this._value.length - 1);
                ret = this.value;
            }
        }
        return ret;
    }
    _parse_options() {
        if (!this._is_better) {
            this._is_better = 1;
            this._latest_options = null;
            this._options = null;
            this._value = [];
            this._files = [];
            this._allow_multiple = false;
            this._max_attachments = [];
            this._allow_reload = true;
            this._allow_remove = true;
            this._display_ready = false;
        }
        if (isEmpty(this.df.options) || this.df.options === this._latest_options) return;
        this._latest_options = this.df.options;
        let opts = parseJson(this.df.options);
        if (!isPlainObject(opts) || isEmpty(opts)) {
            if (this._allow_multiple) this.clear_attachment();
            this._options = null;
            this._allow_multiple = false;
            if (!this._allow_reload) this.enable_reload();
            if (!this._allow_remove) this.enable_remove();
            return;
        }
        if (!this._options) this._options = {restrictions: {}};
        this._allow_reload = toBool(ifNull(opts.allow_reload, false));
        this._allow_remove = toBool(ifNull(opts.allow_remove, false));
        each(
            [
                'upload_notes', 'allow_multiple',
                'max_file_size', 'allowed_file_types',
                'max_number_of_files', 'crop_image_aspect_ratio',
                'as_public',
            ],
            function(k, i) {
                let v = opts[k];
                if (isEmpty(v)) v = null;
                if (v && i === 0) {
                    v = cstr(v);
                    v = v.length ? v : null;
                }
                else if (i === 1 || i === 6) v = toBool(ifNull(v, false));
                else if (v && [2, 4, 5].indexOf(i) >= 0) {
                    v = cint(v);
                    if (isNaN(v) || v < 1) v = null;
                }
                else if (i === 3) v = toArray(v);
                if (i < 2) this._options[k] = v;
                else this._options.restrictions[k] = v;
            },
            this
        );
        if (this._allow_multiple !== this._options.allow_multiple) {
            this._allow_multiple = this._options.allow_multiple;
            if (this._display_ready) {
                this._setup_display();
                let len = this._value.length;
                if (len) {
                    if (this._allow_multiple && len < 2) {
                        this.set_input(this._value[0]);
                    } else if (!this._allow_multiple && len > 1) {
                        each(this._value.splice(1, len), function(v, i) {
                            if (i > 0) this._remove_file_by_idx(i);
                        }, this);
                        this.set_input(this._value[0]);
                    }
                }
            }
            this._set_max_attachments();
        }
        if (this._display_ready) {
            if (this._allow_reload) this.enable_reload();
            else this.disable_reload();
            if (this._allow_remove) this.enable_remove();
            else this.disable_remove();
        }
        if (this.upload_options) {
            this.upload_options = null;
            this.image_upload_options = null;
        }
    }
    _set_max_attachments() {
        if (!this.frm) return;
        if (!this._allow_multiple) {
            let meta = frappe.get_meta(this.frm.doctype);
            if (meta) meta.max_attachments = this._max_attachments[0];
            if (this.frm.meta) this.frm.meta.max_attachments = this._max_attachments[1];
            return;
        }
        let val = this._options.restrictions.max_number_of_files,
        meta = frappe.get_meta(this.frm.doctype);
        if (meta && val > cint(meta.max_attachments)) {
            if (this._max_attachments[0] == null)
                this._max_attachments[0] = meta.max_attachments;
            meta.max_attachments = val;
        }
        if (this.frm.meta && val > cint(this.frm.meta.max_attachments)) {
            if (this._max_attachments[1] == null)
                this._max_attachments[1] = this.frm.meta.max_attachments;
            this.frm.meta.max_attachments = val;
        }
    }
    _setup_display() {
        this._display_ready = true;
        if (this._allow_multiple) {
            this._setup_dialog();
            return;
        }
        if (this._images_only) this._setup_popover();
        else this._setup_preview();
    }
    _setup_popover() {
        $(this.$value.find('a.attached-file-link').get(0))
        .popover({
            trigger: 'hover',
            placement: 'top',
            content: fn(function() {
                let url = this.value;
                return `<div>
                    <img src="${url}" style="width:150px!important;height:auto;object-fit:contain"/>
                </div>`;
            }, this),
            html: true
        });
    }
    _make_image_options() {
        let opts = deepClone(this.upload_options),
        rest = opts.restrictions;
        if (isEmpty(rest.allowed_file_types)) {
            rest.allowed_file_types = ['image/*'];
        } else {
            rest.allowed_file_types = to_images_list(toArray(rest.allowed_file_types));
        }
        if (!rest.crop_image_aspect_ratio) rest.crop_image_aspect_ratio = 1;
        return opts;
    }
    _add_file(value, idx) {
        var val = {
            name: null,
            file_name: get_filename(value),
            file_url: value,
            extension: null,
            type: null,
            size: 0,
            size_str: '',
            'class': 'other',
        };
        this._files[idx] = val;
        if (this.file_uploader) {
            each(this.file_uploader.uploader.files, function(f) {
                if (f.doc && f.doc.file_url === val.file_url) {
                    val.name = f.doc.name;
                    if (f.file_obj) {
                        if (!isEmpty(f.file_obj.file_name)) {
                            val.file_name = f.file_obj.file_name;
                            val.extension = get_file_ext(val.file_name);
                            if (isEmpty(f.file_obj.type)) {
                                val.type = get_file_type(val.extension);
                            }
                            val = set_file_info(val);
                        }
                        if (!isEmpty(f.file_obj.type)) {
                            val.type = f.file_obj.type.toLowerCase().split(';')[0];
                        }
                        if (!isEmpty(f.file_obj.size)) {
                            val.size = f.file_obj.size;
                            val.size_str = formatSize(val.size);
                        }
                    }
                    return false;
                }
            });
        }
        if (isEmpty(val.extension)) {
            val.extension = get_file_ext(val.file_name);
            val = set_file_info(val);
        }
        if (isEmpty(val.type)) {
            val.type = get_file_type(val.extension);
        }
        if (isEmpty(val.name) && this.frm) {
            frappe.db.get_value('File', {file_url: val.file_url}, 'name', fn(function(ret) {
                if (isPlainObject(ret) && ret.name) {
                    val.name = ret.name;
                    this.frm.attachments.update_attachment(val);
                    this.frm.doc.docstatus == 1 ? this.frm.save('Update') : this.frm.save();
                }
                this._add_file_to_dialog(val, idx);
            }, this));
        }
        else this._add_file_to_dialog(val, idx);
    }
    _add_file_to_dialog(file, idx) {
        let meta = [];
        if (file.size && file.size_str) meta.push(__('Size') + ': ' + file.size_str);
        if (file.type) meta.push(__('Type') + ': ' + file.type);
        if (meta.length) {
            meta = meta.join('  -  ');
            meta = `<div class="d-block ba-meta mt-1">${meta}</div>`;
        } else {
            meta = '';
        }
        let dom = $(`
            <div class="col-12 p-1 ba-attachment" data-file-idx="${idx}">
                <div class="card">
                    <div class="card-body p-1">
                        <div class="row d-flex align-items-center">
                            <div class="col">
                                <div class="row">
                                    <div class="col-auto d-flex align-items-center">
                                        <div class="ba-file ba-${file.class}"></div>
                                    </div>
                                    <div class="col p-0 d-flex flex-column justify-content-center">
                                        <div class="d-block">
                                            <a href="${file.file_url}" class="ba-link ba-filename" target="__blank">
                                                <span class="fa fa-link ba-file-link"></span>
                                                ${file.file_name}
                                            </a>
                                        </div>
                                        ${meta}
                                    </div>
                                </div>
                            </div>
                            <div class="col-auto px-4">
                                <button type="button" class="ba-preview btn btn-info btn-xs mx-0 px-2">
                                    <span class="fa fa-search text-white"></span>
                                </button>
                                <button type="button" class="ba-remove btn btn-danger btn-xs mx-0">
                                    <span class="fa fa-times text-white"></span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).appendTo(this._files_row)
        .data('idx', idx);
        if (!file.can_preview) {
            dom.find('div.ba-preview').addClass('disabled').data('disabled', 1);
        }
        if (!this._allow_remove) {
            dom.find('div.ba-remove').addClass('disabled').data('disabled', 1);
        }
    }
    _remove_file_by_idx(idx) {
        let len = this._value.length;
        if (!this._allow_multiple || (len - 1) < idx) return;
        let url = this._value[idx];
        this._value.splice(idx, 1);
        this._files.splice(idx, 1);
        len--;
        this.value = len ? toJson(this._value) : null;
        this._files_row.find('div[data-file-idx="' + idx + '"]').remove();
        this._remove_file_by_url(url);
    }
    _remove_file_by_url(url) {
        if (!this.frm) {
            request('remove_files', {files: [url]}, function(ret) {
                if (!cint(ret)) error('Unable to remove the uploaded file ({0}).', [url]);
            });
            return;
        }
        this.frm.attachments.remove_attachment_by_filename(
            url,
            fn(function() {
                this.parse_validate_and_set_in_model(this.value)
                .then(fn(function() {
                    this.refresh();
                    this.frm.doc.docstatus == 1 ? this.frm.save('Update') : this.frm.save();
                }, this));
            }, this)
        );
    }
    _toggle_remove_button() {
        let show = this._allow_remove;
        this.$value && this.$value.find('[data-action="clear_attachment"]').toggle(show);
        this._files_row && this._files_row.find('div.ba-remove')
            .toggleClass('disabled', !show).data('disabled', show ? 0 : 1);
    }
    _setup_dialog() {
        if (this._dialog) {
            if (this._is_preview_dialog) {
                this._is_preview_dialog = false;
                this._dialog_fn._reset_preview();
                this._files_row.children().remove();
                each(this._files, function(f, i) {
                    this._add_file_to_dialog(f, i);
                }, this);
            }
            return;
        }
        this._dialog_fn = {};
        this._dialog = new frappe.ui.Dialog({
            title: __(this.df.label),
            indicator: 'blue',
        });
        let wrapper = this._dialog.$wrapper.addClass('modal-dialog-scrollable'),
        body = wrapper.find('.modal-body'),
        container = $('<div class="container-fluid p-1"></div>').appendTo(body);
        this._dialog_title = wrapper.find('.modal-title');
        this._dialog_title.parent().addClass('align-items-center');
        this._dialog_back = $('<span class="fa fa-chevron-left fa-fw mr-2 hide"></span>').before(this._dialog_title);
        this._files_row = $('<div class="row"></div>').appendTo(container);
        this._preview_row = $('<div class="row hide"></div>').appendTo(container);
        this._preview_holder = $('<div class="col img_preview d-flex align-items-center justify-content-center"></div>')
            .appendTo(this._preview_row);
        this._file_preview = null;
        this._dialog_fn._setup_preview = fn(function(file) {
            if (file.class === 'image') {
                this._file_preview = $(`<img>`).addClass('img-responsive')
                    .attr('src', file.file_url)
                    .attr('alt', file.file_name)
                    .appendTo(this._preview_holder);
            } else if (file.class === 'video') {
                this._file_preview = $(`<video width="480" height="320" controls>
                        <source src="${file.file_url}" type="${file.type}"/>
                        ${__("Your browser does not support the video element.")}
                    </video>`)
                    .appendTo(this._preview_holder);
            } else if (file.class === 'audio') {
                this._file_preview = $(`<audio width="480" height="60" controls>
                        <source src="${file.file_url}" type="${file.type}"/>
                        ${__("Your browser does not support the audio element.")}
                    </audio>`)
                    .appendTo(this._preview_holder);
            }
            if (this._file_preview) {
                this._dialog_title.html(file.file_name);
                if (!this._is_preview_dialog) {
                    this._dialog_fn._preview_toggle(true);
                } else this._dialog.show();
            } else {
                window.open(file.file_url, '_blank');
            }
        }, this);
        this._dialog_fn._preview_toggle = fn(function(show) {
            this._files_row.toggleClass('hide', show);
            this._dialog_back.toggleClass('hide', !show);
            this._preview_row.toggleClass('hide', !show);
        }, this);
        this._dialog_fn._reset_preview = fn(function(show) {
            this._preview_toggle(false);
            this._dialog_title.html(__(this.df.label));
            this._file_preview && this._file_preview.remove();
            this._file_preview = null;
        }, this);
        this._dialog_back.click(fn(function(e) {
            isObject(e) && e.preventDefault();
            if (!this._is_preview_dialog) this._dialog_fn._reset_preview();
        }, this));
        var me = this;
        this._files_row.on('click', 'button.ba-preview', function(e) {
            isObject(e) && e.preventDefault();
            if (!$(this).data('disabled') && !me._is_preview_dialog) {
                let parent = $($(this).closest('div.ba-attachment').get(0)),
                idx = parent.data('idx');
                if (idx == null) idx = parent.attr('data-file-idx');
                if (idx != null) {
                    idx = cint(idx);
                    let file = me._files.length > idx ? me._files[idx] : null;
                    if (file) me._dialog_fn._setup_preview(file);
                }
            }
        });
        this._files_row.on('click', 'button.ba-remove', function(e) {
            isObject(e) && e.preventDefault();
            if (!$(this).data('disabled') && !me._is_preview_dialog) {
                let parent = $($(this).closest('div.ba-attachment').get(0)),
                idx = parent.data('idx');
                if (idx == null) idx = parent.attr('data-file-idx');
                if (idx != null && me._allow_remove) {
                    me._remove_file_by_idx(cint(idx));
                    parent.remove();
                }
            }
        });
        this.$value.find('a.attached-file-link')
        .on('click', function(e) {
            isObject(e) && e.preventDefault();
            if (me._is_preview_dialog) {
                me._dialog_fn._setup_preview(this._files[0]);
            } else me._dialog.show();
        });
    }
    _setup_preview() {
        if (this._is_preview_dialog) return;
        this._is_preview_dialog = true;
        this._setup_dialog();
        this._files_row.addClass('hide');
        this._preview_row.removeClass('hide');
    }
    _reset_input(ref) {
        this.dataurl = null;
        this.fileobj = null;
        if (!ref) {
            this.set_input(null);
            this.parse_validate_and_set_in_model(null);
            this.refresh();
        }
    }
    _reset_value() {
        this.value = null;
        this.$input.toggle(true);
        this.$value.toggle(false);
        clear(this._value);
        clear(this._files);
    }
};