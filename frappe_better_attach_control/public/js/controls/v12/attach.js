/*
*  Frappe Better Attach Control © 2023
*  Author:  Ameen Ahmed
*  Company: Level Up Marketing & Software Development Services
*  Licence: Please refer to LICENSE file
*/


import {
    isArray,
    isObject,
    isPlainObject,
    isEmpty,
    isRegExp,
    isString,
    toBool,
    toArray,
    ifNull,
    each,
    clear,
    deepClone,
    parseJson,
    toJson,
    formatSize,
    request,
    error
} from './../../utils';
import {
    get_filename,
    get_file_ext,
    get_file_type,
    set_file_info,
    to_images_list
} from './../../filetypes';


frappe.ui.form.ControlAttach = frappe.ui.form.ControlAttach.extend({
    make: function() {
        this._super();
        this._setup_control();
        this._update_options();
    },
    make_input: function() {
        this._setup_control();
        this._update_options();
        this._super();
        this._toggle_remove_button();
        this._setup_display();
    },
    clear_attachment: function() {
        if (!this._allow_remove) return;
        var me = this;
        if (!this.frm) {
            if (this._value.length) {
                this._remove_files(this._value, function(ret) {
                    if (!cint(ret)) error('Unable to clear the uploaded attachments.');
                    else me._reset_input();
                });
            } else this._reset_input();
            return;
        }
        // To prevent changing value from within set_input function
        this._prevent_input = true;
        this._remove_files(this._value, function(ret) {
            if (!cint(ret)) {
                error('Unable to clear the uploaded attachments.');
                return;
            }
            each(me._value, function(v) {
                let fid = me.frm.attachments.get_file_id_from_file_url(v);
                if (fid) me.frm.attachments.remove_fileid(fid);
            });
            me.frm.sidebar.reload_docinfo();
            me.parse_validate_and_set_in_model(null);
            // To allow changing value from within set_input function
            me._prevent_input = false;
            me._reset_value();
            me.refresh();
            me.frm.doc.docstatus == 1 ? me.frm.save('Update') : me.frm.save();
        }, function() {
            // To allow changing value from within set_input function before failure
            me._prevent_input = false;
        });
    },
    on_attach_click: function() {
        this.set_upload_options();
        this.file_uploader = new frappe.ui.FileUploader(this.upload_options);
    },
    set_upload_options: function() {
        if (this.upload_options) return;
        this._update_options();
        if (this._options) this.df.options = this._options;
        this._super();
        if (this._options) this.df.options = this._df_options;
        if (this._images_only) {
            this.upload_options = (function(options) {
                let opts = deepClone(options);
                if (isEmpty(opts.restrictions.allowed_file_types)) {
                    opts.restrictions.allowed_file_types = ['image/*'];
                } else {
                    opts.restrictions.allowed_file_types = to_images_list(toArray(opts.restrictions.allowed_file_types));
                }
                return opts;
            }(this.upload_options));
        }
    },
    set_value: function(value, force_set_value=false) {
        // Prevent changing value if called from event
        if (this._prevent_input) return Promise.resolve();
        value = this._set_value(value);
        if (!this.frm) this._updating_input = true;
        return this._super(value, force_set_value);
    },
    set_input: function(value, dataurl) {
        // Prevent changing value if called from event
        if (this._prevent_input) return;
        if (this._updating_input) {
            this._updating_input = false;
            if (this._value.length) this._update_input();
            return;
        }
        var me = this;
        if (value === null) {
            if (this._value.length) {
                this._remove_files(this._value, function(ret) {
                    if (!cint(ret)) error('Unable to delete the uploaded attachments.');
                    else me._reset_value();
                });
            } else this._reset_value();
            return;
        }
        if (isEmpty(value)) return;
        var val = toArray(value, null);
        if (isArray(val)) {
            if (!val.length) return;
            let update = 0;
            if (!this._allow_multiple) {
                value = val[0];
                if (!isEmpty(value) && isString(value) && this._value.indexOf(value) < 0) {
                    this._set_value(value);
                    update = 1;
                }
            } else {
                each(val, function(v) {
                    if (!isEmpty(v) && isString(v) && me._value.indexOf(value) < 0) {
                        me._set_value(v);
                        update = 1;
                    }
                });
            }
            if (update) this._update_input();
            return;
        }
        if (!isString(value)) return;
        this.value = this._set_value(value);
        this._update_input(value, dataurl);
    },
    on_upload_complete: function(attachment) {
		if (this.frm) {
			this.parse_validate_and_set_in_model(attachment.file_url);
			this.frm.attachments.update_attachment(attachment);
			if (this._allow_multiple) {
                var up = this.file_uploader && this.file_uploader.uploader;
                if (up && up.files && up.files.every(function(file) { return !file.failed; })) {
                    this.frm.doc.docstatus == 1 ? this.frm.save('Update') : this.frm.save();
                }
            } else {
                this.frm.doc.docstatus == 1 ? this.frm.save('Update') : this.frm.save();
            }
		}
		this.set_input(attachment.file_url);
	},
    refresh: function() {
        this._super();
        if (
            !isEmpty(this.df.options) && isPlainObject(this.df.options)
            && this._df_options !== this.df.options
        ) this._df_options = this.df.options;
        this._update_options();
        this.set_input(toArray(this.value));
    },
    // Custom Methods
    enable_remove: function() {
        this._allow_remove = true;
        this._toggle_remove_button();
    },
    disable_remove: function() {
        this._allow_remove = false;
        this._toggle_remove_button();
    },
    show_files: function() {
        this._dialog && this._dialog.show();
    },
    // Private Methods
    _setup_control: function() {
        if (this._is_better) return;
        if (isEmpty(this.df.better_attach_options) && !isEmpty(this.df.options))
            this.df.better_attach_options = this.df.options;
        this._is_better = 1;
        this._df_options = this.df.options;
        this._options = null;
        this._latest_options = null;
        this._value = [];
        this._files = [];
        this._allow_multiple = false;
        this._max_attachments = [];
        this._allow_remove = true;
        this._display_ready = false;
        this._prevent_input = false;
        this._updating_input = false;
    },
    _update_options: function() {
        if (
            (
                isEmpty(this.df.better_attach_options)
                || isPlainObject(this.df.better_attach_options)
            )
            && this._latest_options !== this.df.better_attach_options
        ) {
            this._latest_options = this.df.better_attach_options;
            let opts = !isEmpty(this.df.better_attach_options)
                && parseJson(this.df.better_attach_options);
            if (isEmpty(opts) && this._options == null) return;
            if (isPlainObject(opts)) opts = this._parse_options(opts);
            else opts = {};
            this._reload_control(opts);
            this._options = opts.options || null;
        }
    },
    _parse_options: function(opts) {
        var tmp = {options: {restrictions: {}}};
        tmp.allow_remove = toBool(ifNull(opts.allow_remove, true));
        function parseVal(v, t) {
            if (isEmpty(v)) v = null;
            if (t === 's' && v) {
                v = cstr(v);
                v = v.length ? v : null;
            }
            else if (t === 'b') v = toBool(ifNull(v, false));
            else if (t === 'i' && v) {
                v = cint(v);
                if (isNaN(v) || v < 1) v = null;
            }
            else if (t === 'a') v = toArray(v);
            else if (t === 'r' && v && !isRegExp(v)) {
                v = cstr(v);
                if (v.length) v = v[0] === '/' ? new RegExp(v) : v;
                else v = null;
            }
            return v;
        }
        each(
            [
                ['upload_notes', 's'], ['allow_multiple', 'b'],
                ['disable_file_browser', 'b'],
            ], function(k) {
                tmp.options[k[0]] = parseVal(opts[k[0]], k[1]);
            }
        );
        each(
            [
                ['max_file_size', 'i'], ['allowed_file_types', 'a'],
                ['max_number_of_files', 'i'], ['as_public', 'b'],
                ['allowed_filename', 'r'],
            ],
            function(k) {
                tmp.options.restrictions[k[0]] = parseVal(opts[k[0]], k[1]);
            }
        );
        if (!isEmpty(tmp.options.restrictions.allowed_file_types)) {
            var types = [];
            each(tmp.options.restrictions.allowed_file_types, function(t) {
                if (isRegExp(t)) types.push(t);
                else if (isString(t)) {
                    if (t[0] === '.') types.push(t);
                    else if (t.includes('/')) {
                        if (t.includes('*')) {
                            t = t.replace('*', '(.*?)');
                            types.push(new RegExp(t));
                        } else types.push(t);
                    }
                }
            });
            tmp.options.restrictions.allowed_file_types = types;
        }
        return tmp;
    },
    _reload_control: function(opts) {
        if (this.upload_options) this.upload_options = null;
        if (this._display_ready) {
            if (ifNull(opts.allow_remove, true) !== this._allow_remove) {
                if (!this._allow_remove) this.enable_remove();
                else this.disable_remove();
            }
        }
        var allow_multiple = opts.options && toBool(opts.options.allow_multiple);
        if (allow_multiple === this._allow_multiple) return;
        this._allow_multiple = allow_multiple;
        this._set_max_attachments();
        if (!this._display_ready) return;
        this._setup_display();
        if (!this._value.length) return;
        var value = this._value.pop();
        if (this._allow_multiple) {
            this._reset_value();
            this.set_input(value);
        } else {
            if (this._value.length) {
                var failed = 0;
                this._remove_files(this._value, function(ret) {
                    if (!cint(ret)) failed++;
                });
                if (failed) error('Unable to delete the uploaded attachments.');
            }
            this._reset_value();
            this.set_input(value);
        }
    },
    _set_value: function(value) {
        if (this._value.indexOf(value) >= 0) return value;
        this._value.push(value);
        if (this._allow_multiple) {
            this.value = toJson(this._value);
            this._add_file(value, this._value.length - 1);
            value = this.value;
        }
        return value;
    },
    _set_max_attachments: function() {
        if (!this.frm) return;
        if (!this._allow_multiple) {
            var meta = frappe.get_meta(this.frm.doctype);
            if (meta) meta.max_attachments = this._max_attachments[0];
            if (this.frm.meta) this.frm.meta.max_attachments = this._max_attachments[1];
            return;
        }
        var val = this._options.restrictions.max_number_of_files,
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
    },
    _setup_display: function() {
        this._display_ready = true;
        if (this._allow_multiple) {
            this._setup_dialog();
            return;
        }
        if (this._images_only) this._setup_popover();
        else this._setup_preview();
    },
    _setup_popover: function() {
        var url = this.value;
        $(this.$value.find('a.attached-file-link').get(0))
        .popover({
            trigger: 'hover',
            placement: 'top',
            content: function() {
                return `<div>
                    <img src="${url}" style="width:150px!important;height:auto;object-fit:contain"/>
                </div>`;
            },
            html: true
        });
    },
    _add_file: function(value, idx) {
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
            var me = this;
            frappe.db.get_value('File', {file_url: val.file_url}, 'name', function(ret) {
                if (isPlainObject(ret) && ret.name) {
                    val.name = ret.name;
                    me.frm.attachments.update_attachment(val);
                }
                me._add_file_to_dialog(val, idx);
            });
        }
        else this._add_file_to_dialog(val, idx);
    },
    _add_file_to_dialog: function(file, idx) {
        var meta = [];
        if (file.size && file.size_str) meta.push(__('Size') + ': ' + file.size_str);
        if (file.type) meta.push(__('Type') + ': ' + file.type);
        if (meta.length) {
            meta = meta.join('  -  ');
            meta = `<div class="d-block ba-meta mt-1">${meta}</div>`;
        } else {
            meta = '';
        }
        var dom = $(`
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
    },
    _remove_files: function(data, callback, error) {
        request('remove_files', {files: data}, callback, error);
    },
    _remove_file_by_idx: function(idx) {
        var len = this._value.length;
        if (!this._allow_multiple || (len - 1) < idx) return;
        var url = this._value[idx];
        this._value.splice(idx, 1);
        this._files.splice(idx, 1);
        len--;
        this.value = len ? toJson(this._value) : null;
        this._files_row && this._files_row.find('div[data-file-idx="' + idx + '"]').remove();
        this._remove_file_by_url(url);
    },
    _remove_file_by_url: function(url) {
        if (!this.frm) {
            this._remove_files([url], function(ret) {
                if (!cint(ret)) error('Unable to remove the uploaded attachment ({0}).', [url]);
            });
            return;
        }
        var me = this;
        this.frm.attachments.remove_attachment_by_filename(
            url,
            function() {
                me.parse_validate_and_set_in_model(me.value);
                me.refresh();
                me.frm.doc.docstatus == 1 ? me.frm.save('Update') : me.frm.save();
            }
        );
    },
    _toggle_remove_button: function() {
        var show = this._allow_remove;
        this.$value && this.$value.find('[data-action="clear_attachment"]').toggle(show);
        this._files_row && this._files_row.find('div.ba-remove')
            .toggleClass('disabled', !show).data('disabled', show ? 0 : 1);
    },
    _setup_dialog: function() {
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
        var wrapper = this._dialog.$wrapper.addClass('modal-dialog-scrollable'),
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
        var me = this;
        this._dialog_fn._setup_preview = function(file) {
            if (file.class === 'image') {
                me._file_preview = $(`<img>`).addClass('img-responsive')
                    .attr('src', file.file_url)
                    .attr('alt', file.file_name)
                    .appendTo(me._preview_holder);
            } else if (file.class === 'video') {
                me._file_preview = $(`<video width="480" height="320" controls>
                        <source src="${file.file_url}" type="${file.type}"/>
                        ${__("Your browser does not support the video element.")}
                    </video>`)
                    .appendTo(me._preview_holder);
            } else if (file.class === 'audio') {
                me._file_preview = $(`<audio width="480" height="60" controls>
                        <source src="${file.file_url}" type="${file.type}"/>
                        ${__("Your browser does not support the audio element.")}
                    </audio>`)
                    .appendTo(me._preview_holder);
            }
            if (me._file_preview) {
                me._dialog_title.html(file.file_name);
                if (!me._is_preview_dialog) {
                    me._dialog_fn._preview_toggle(true);
                } else me._dialog.show();
            } else {
                window.open(file.file_url, '_blank');
            }
        };
        this._dialog_fn._preview_toggle = function(show) {
            me._files_row.toggleClass('hide', show);
            me._dialog_back.toggleClass('hide', !show);
            me._preview_row.toggleClass('hide', !show);
        };
        this._dialog_fn._reset_preview = function(show) {
            me._dialog_fn._preview_toggle(false);
            me._dialog_title.html(__(me.df.label));
            me._file_preview && me._file_preview.remove();
            me._file_preview = null;
        };
        this._dialog_back.click(function(e) {
            isObject(e) && e.preventDefault();
            if (!me._is_preview_dialog) me._dialog_fn._reset_preview();
        });
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
        this.$value.find('a.attached-file-link').on('click', function(e) {
            isObject(e) && e.preventDefault();
            if (me._is_preview_dialog) {
                me._dialog_fn._setup_preview(this._files[0]);
            } else me._dialog.show();
        });
    },
    _setup_preview: function() {
        if (this._is_preview_dialog) return;
        this._is_preview_dialog = true;
        this._setup_dialog();
        this._files_row.addClass('hide');
        this._preview_row.removeClass('hide');
    },
    _update_input: function(value, dataurl) {
        value = value || this._value[this._value.length - 1];
        this.$input.toggle(false);
        var filename = null;
        if (value.indexOf(',') !== -1) {
            var parts = value.split(',');
            filename = parts[0];
            dataurl = parts[1];
        }
        if (!filename) filename = dataurl ? value : value.split('/').pop();
        var $link = this.$value.toggle(true).find('.attached-file-link');
        if (this._allow_multiple) {
            $link.html(this._value.length > 1
                ? this._value.length + ' ' + __('files uploaded')
                : filename
            ).attr('href', '#');
        } else {
            $link.html(filename).attr('href', dataurl || value);
        }
    },
    _reset_input: function(ref) {
        this.dataurl = null;
        this.fileobj = null;
        this.set_input(null);
        this.refresh();
    },
    _reset_value: function() {
        this.value = null;
        this.$input.toggle(true);
        this.$value.toggle(false);
        clear(this._value);
        clear(this._files);
         if (this._dialog) {
            if (this._is_preview_dialog) {
                this._is_preview_dialog = false;
                this._dialog_fn._reset_preview();
            }
            this._files_row.children().remove();
        }
    }
});