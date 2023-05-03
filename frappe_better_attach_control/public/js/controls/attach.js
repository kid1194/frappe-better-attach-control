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
    log,
    error
} from './../utils';
import {
    get_filename,
    get_file_ext,
    get_file_type,
    set_file_info,
    to_images_list,
    is_ext_image
} from './../filetypes';


frappe.ui.form.ControlAttach = class ControlAttach extends frappe.ui.form.ControlAttach {
    make() {
        super.make();
        this._setup_control();
        this._update_options();
    }
    make_input() {
        this._setup_control();
        this._update_options();
        super.make_input();
        this._toggle_remove_button();
        this._setup_display();
    }
    clear_attachment() {
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
        this.parse_validate_and_set_in_model(null);
        this.refresh();
        if (!this._value.length) {
            this._reset_value();
            this.refresh();
            this.frm.doc.docstatus == 1 ? this.frm.save('Update') : this.frm.save();
            // To allow changing value from within set_input function
            this._prevent_input = false;
            return;
        }
        this._remove_files(this._value, function(ret) {
            if (!cint(ret)) {
                error('Unable to clear the uploaded attachments.');
                return;
            }
            if (me.frm.attachments) {
                each(me._value, function(v) {
                    let fid = me.frm.attachments.get_file_id_from_file_url(v);
                    if (fid) me.frm.attachments.remove_fileid(fid);
                });
            }
            me.frm.sidebar && me.frm.sidebar.reload_docinfo();
            me.parse_validate_and_set_in_model(null)
            .then(function() {
                me._reset_value();
                me.refresh();
                me.frm.doc.docstatus == 1 ? me.frm.save('Update') : me.frm.save();
                // To allow changing value from within set_input function
                me._prevent_input = false;
            })
            .catch(function() {
                // To allow changing value from within set_input function before failure
                me._prevent_input = false;
            });
        }, function() {
            // To allow changing value from within set_input function before failure
            me._prevent_input = false;
        });
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
        if (!this.image_upload_options) {
            this.image_upload_options = (function(options) {
                var opts = deepClone(options);
                if (isEmpty(opts.restrictions.allowed_file_types))
                    opts.restrictions.allowed_file_types = ['image/*'];
                else
                    opts.restrictions.allowed_file_types = to_images_list(toArray(
                        opts.restrictions.allowed_file_types
                    ));
                var extra = [];
                each(opts.extra.allowed_file_types, function(v) {
                    if (
                        (isRegExp(v) && is_ext_image('' + v.source))
                        || (isString(v) && is_ext_image(v))
                    ) extra.push(v);
                });
                opts.extra.allowed_file_types = extra;
                if (!opts.restrictions.crop_image_aspect_ratio)
                    opts.restrictions.crop_image_aspect_ratio = 1;
                return opts;
            }(this.upload_options));
        }
        this.file_uploader = new frappe.ui.FileUploader(this.image_upload_options);
    }
    set_upload_options() {
        if (this.upload_options) return;
        this._update_options();
        if (this._options) this.df.options = this._options;
        super.set_upload_options();
        if (this._options) this.df.options = this._df_options;
    }
    set_value(value, force_set_value=false) {
        // Prevent changing value if called from event
        if (this._prevent_input) return Promise.resolve();
        value = this._set_value(value);
        if (!this.frm) this._updating_input = true;
        return super.set_value(value, force_set_value);
    }
    set_input(value, dataurl) {
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
        let val = toArray(value, null);
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
                this._multiple_values = true;
                each(val, function(v) {
                    if (!isEmpty(v) && isString(v) && me._value.indexOf(value) < 0) {
                        me._set_value(v);
                        update = 1;
                    }
                });
            }
            if (update) this._update_input();
            this._multiple_values = false;
            this._process_files();
            return;
        }
        if (!isString(value)) return;
        this.value = this._set_value(value);
        this._update_input(value, dataurl);
    }
    async on_upload_complete(attachment) {
        if (this.frm) {
            await this.parse_validate_and_set_in_model(attachment.file_url);
            if (this.frm.attachments)
                this.frm.attachments.update_attachment(attachment);
            if (this._allow_multiple) {
                let up = this.file_uploader && this.file_uploader.uploader;
                if (up && up.files && up.files.every(function(file) { return !file.failed && file.request_succeeded; })) {
                    this.frm.doc.docstatus == 1 ? this.frm.save('Update') : this.frm.save();
                }
            } else {
                this.frm.doc.docstatus == 1 ? this.frm.save('Update') : this.frm.save();
            }
        }
        this.set_value(attachment.file_url);
    }
    toggle_reload_button() {
        if (!this.$value) return;
        let show = this._allow_reload && this.file_uploader
            && this.file_uploader.uploader.files
            && this.file_uploader.uploader.files.length > 0;
        this.$value.find('[data-action="reload_attachment"]').toggle(show);
    }
    refresh() {
        super.refresh();
        if (this._df_options !== this.df.options) this._df_options = this.df.options;
        this._update_options();
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
    set_options(opts) {
        if (isPlainObject(opts)) {
            this.df.better_attach_options = $.extend(true, {},
                isPlainObject(this.df.better_attach_options) ? this.df.better_attach_options : {},
                opts
            );
            this._update_options();
        }
    }
    // Private Methods
    _setup_control() {
        if (this._is_better) return;
        this._is_better = 1;
        this._df_options = this.df.options;
        this._options = null;
        this._latest_options = null;
        this._value = [];
        this._files = [];
        this._allow_multiple = false;
        this._max_attachments = {};
        this._allow_reload = true;
        this._allow_remove = true;
        this._display_ready = false;
        this._unprocessed_files = [];
        frappe.realtime.on('better_attach_console', function(ret) {
            console.log(ret);
        });
    }
    _update_options() {
        if (
            (isEmpty(this._options) && isEmpty(this.df.better_attach_options))
            || (!isEmpty(this._options) && this._latest_options === this.df.better_attach_options)
        ) return;
        this._latest_options = this.df.better_attach_options;
        let opts = !isEmpty(this._latest_options) && parseJson(this._latest_options);
        opts = !isEmpty(opts) && isPlainObject(opts) ? this._parse_options(opts) : {};
        this._options = opts.options || null;
        this._reload_control(opts);
    }
    _parse_options(opts) {
        var tmp = {options: {restrictions: {}, extra: {}}};
        tmp.allow_reload = toBool(ifNull(opts.allow_reload, true));
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
                ['disable_file_browser', 'b'], ['dialog_title', 's'],
            ], function(k) {
                tmp.options[k[0]] = parseVal(opts[k[0]], k[1]);
            }
        );
        each(
            [
                ['max_file_size', 'i'], ['allowed_file_types', 'a'],
                ['max_number_of_files', 'i'], ['crop_image_aspect_ratio', 'i'],
                ['as_public', 'b'],
            ],
            function(k) {
                tmp.options.restrictions[k[0]] = parseVal(opts[k[0]], k[1]);
            }
        );
        each(
            [
                ['allowed_filename', 'r'],
            ],
            function(k) {
                tmp.options.extra[k[0]] = parseVal(opts[k[0]], k[1]);
            }
        );
        if (tmp.options.dialog_title == null) delete tmp.options.dialog_title;
        this._parse_allowed_file_types(tmp.options);
        return tmp;
    }
    _parse_allowed_file_types(opts) {
        var types = [];
        if (!isEmpty(opts.restrictions.allowed_file_types)) {
            each(opts.restrictions.allowed_file_types, function(t, i) {
                if (isRegExp(t)) {
                    opts.restrictions.allowed_file_types.splice(i, 1);
                } else if (isString(t)) {
                    if (!t.length) {
                        opts.restrictions.allowed_file_types.splice(i, 1);
                        return;
                    }
                    if (t[0] === '$' || t.includes('/*')) {
                        if (t[0] === '$') {
                            opts.restrictions.allowed_file_types.splice(i, 1);
                            t = t.substring(1);
                        }
                        t = t.replace('/*', '/(.*?)');
                        t = new RegExp(t);
                    }
                }
                types.push(t);
            });
        }
        opts.extra.allowed_file_types = types;
    }
    _toggle_remove_button() {
        var show = this._allow_remove;
        this.$value && this.$value.find('[data-action="clear_attachment"]').toggle(show);
        if (this._$list)
            this._$list_group.find('.ba-actions').each(function(i, el) {
                if (!show) $(el).addClass('ba-hidden');
                else $(el).removeClass('ba-hidden');
            });
    }
    _reload_control(opts) {
        if (this.upload_options)
            this.upload_options = this.image_upload_options = null;
        
        if (ifNull(opts.allow_reload, true) !== this._allow_reload) {
            if (!this._allow_reload) this.enable_reload();
            else this.disable_reload();
        }
        if (ifNull(opts.allow_remove, true) !== this._allow_remove) {
            if (!this._allow_remove) this.enable_remove();
            else this.disable_remove();
        }
        
        let allow_multiple = ifNull((this._options || {}).allow_multiple, false);
        if (allow_multiple === this._allow_multiple) return;
        this._allow_multiple = allow_multiple;
        this._set_max_attachments();
        if (!this._display_ready) return;
        this._setup_display(true);
        if (!this._value.length) return;
        let value = this._value.pop();
        if (!this._allow_multiple && this._value.length) {
            var failed = 0;
            this._remove_files(this._value, function(ret) {
                if (!cint(ret)) failed++;
            });
            if (failed) error('Unable to delete the uploaded attachments.');
        }
        this._reset_value();
        this.set_input(value);
    }
    _set_max_attachments() {
        if (!this.frm) return;
        let meta = frappe.get_meta(this.frm.doctype);
        if (
            !this._allow_multiple || !isPlainObject(this._options)
            || isEmpty(this._options.restrictions.max_number_of_files)
        ) {
            if (meta && this._max_attachments.meta != null)
                meta.max_attachments = this._max_attachments.meta;
            if (this.frm.meta && this._max_attachments.fmeta != null)
                this.frm.meta.max_attachments = this._max_attachments.fmeta;
            return;
        }
        let val = this._options.restrictions.max_number_of_files;
        if (meta && val > cint(meta.max_attachments)) {
            if (this._max_attachments.meta == null)
                this._max_attachments.meta = meta.max_attachments;
            meta.max_attachments = val;
        }
        if (this.frm.meta && val > cint(this.frm.meta.max_attachments)) {
            if (this._max_attachments.fmeta == null)
                this._max_attachments.fmeta = this.frm.meta.max_attachments;
            this.frm.meta.max_attachments = val;
        }
    }
    _set_value(value) {
        if (this._value.indexOf(value) >= 0) return value;
        this._value.push(value);
        if (this._allow_multiple) {
            this.value = toJson(this._value);
            this._add_file(value, this._value.length - 1);
            value = this.value;
        } else if (!this._images_only) {
            this._add_file(value, this._value.length - 1);
        }
        return value;
    }
    _setup_display(reset) {
        if (this._allow_multiple) {
            if (reset) this._destroy_popover();
            this._setup_list();
        } else {
            if (reset) {
                this._destroy_list();
                if (this._files.length) clear(this._files);
            }
            this._setup_popover();
        }
        this._display_ready = true;
    }
    _setup_popover() {
        if (this._popover_ready) return;
        var me = this;
        this.$value.find('.attached-file-link')
        .popover({
            trigger: 'hover',
            placement: 'top',
            content: function() {
                let file = !me._images_only ? me._files[me._files.length - 1] : null,
                url = file ? file.file_url : me.value;
                if ((file && file.class === 'image') || me._images_only) {
                    return '<div>'
                        + '<img src="' + url +'" style="width:150px!important;height:auto;object-fit:contain"/>'
                    + '</div>';
                }
                if (file) {
                    if (file.class === 'video') {
                        return '<video style="width:150px!important;height:100px!important;" controls>'
                            + '<source src="' + url + '" type="' + file.type + '"/>'
                            + __("Your browser does not support the video element.")
                        + '</video>';
                    }
                    if (file.class === 'audio') {
                        return '<audio style="width:150px!important;height:60px!important;" controls>'
                            + '<source src="' + url + '" type="' + file.type + '"/>'
                            + __("Your browser does not support the audio element.")
                        + '</audio>';
                    }
                }
                return '<div>'
                    + __("This file type has no preview.")
                + '</div>';
            },
            html: true
        });
        this._popover_ready = true;
    }
    _destroy_popover() {
        if (this._popover_ready)
            this.$value.find('.attached-file-link').popover('dispose');
        this._popover_ready = null;
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
        if (this.file_uploader && this.file_uploader.uploader) {
            each(this.file_uploader.uploader.files || [], function(f) {
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
            if (!this._multiple_values) this._process_files(idx);
            else this._unprocessed_files.push(idx);
        } else {
            if (isEmpty(val.name)) val.name = val.file_name;
            this._add_list_file(val, idx);
        }
    }
    _process_files(idx) {
        if (!idx && !this._unprocessed_files.length) return;
        var me = this;
        if (idx) {
            frappe.db.get_value('File', {file_url: this._files[idx].file_url}, 'name', function(ret) {
                if (isPlainObject(ret) && ret.name) {
                    me._files[idx].name = ret.name;
                    if (me.frm && me.frm.attachments)
                        me.frm.attachments.update_attachment(me._files[idx]);
                }
                me._add_list_file(me._files[idx], idx);
            });
            return;
        }
        var urls = [];
        each(this._unprocessed_files, function(idx) {
            urls.push(me._files[idx].file_url);
        });
        frappe.db.get_list('File', {
            fields: ['name', 'file_url'],
            filters: {
                file_url: ['in', urls],
            },
            limit: urls.length
        }).then(function(ret) {
            ret = toArray(ret);
            each(me._unprocessed_files, function(idx, i) {
                if (ret.length) {
                    each(ret, function(val) {
                        if (isPlainObject(val) && me._files[idx].file_url === val.file_url) {
                            me._files[idx].name = val.name;
                            if (me.frm && me.frm.attachments)
                                me.frm.attachments.update_attachment(me._files[idx]);
                            return false;
                        }
                    });
                }
                me._unprocessed_files.splice(i, 1);
                me._add_list_file(me._files[idx], idx);
            });
            if (me._unprocessed_files.length) clear(me._unprocessed_files);
        });
    }
    _add_list_file(file, idx) {
        // Check if allowed multiple files or not
        if (!this._allow_multiple || !this._$list) return;
        let meta = '',
        rem = !this._allow_remove ? ' ba-hidden' : '';
        if (file.size && file.size_str) {
            meta = '<div class="ba-meta">' + file.size_str + '</div>';
        }
        this._$list_group.append($(
            '<li class="list-group-item ba-attachment" data-file-idx="' + idx + '">'
                + '<div class="row align-items-center">'
                    + '<div class="col ba-hidden-overflow">'
                        + '<div class="flex align-center">'
                            + '<div class="ba-file ba-' + file.class + '"></div>'
                            + '<a href="' + file.file_url + '" class="ba-link" target="__blank">'
                                + file.file_name
                            + '</a>'
                            + meta
                        + '</div>'
                    + '</div>'
                    + '<div class="col-auto ba-actions">'
                        + '<button type="button" class="ba-remove btn btn-danger btn-xs mx-0' + rem + '">'
                            + '<span class="fa fa-times fa-fw"></span>'
                        + '</button>'
                    + '</div>'
                + '</div>'
            + '</li>'
        ));
    }
    _remove_files(data, callback, error) {
        if (!isArray(data)) data = [data];
        request('remove_files', {files: data}, callback, error);
    }
    _remove_file_by_idx(idx) {
        let len = this._value.length;
        if (!this._allow_multiple || (len - 1) < idx) return;
        let url = this._value[idx];
        this._value.splice(idx, 1);
        if (this._allow_multiple) this._files.splice(idx, 1);
        len--;
        this.value = len ? toJson(this._value) : null;
        if (this._allow_multiple && this._$list) {
            let child = this._$list_group.find('li[data-file-idx="' + idx + '"]');
            if (child.length) child.remove();
        }
        this._remove_file_by_url(url);
    }
    _remove_file_by_url(url) {
        if (!this.frm || !this.frm.attachments) {
            this._remove_files(url, function(ret) {
                if (!cint(ret)) error('Unable to remove the uploaded attachment ({0}).', [url]);
            });
            return;
        }
        var me = this;
        this.frm.attachments.remove_attachment_by_filename(
            url,
            function() {
                me.parse_validate_and_set_in_model(me.value)
                .then(function() {
                    me.refresh();
                    me.frm.doc.docstatus == 1 ? me.frm.save('Update') : me.frm.save();
                });
            }
        );
    }
    _setup_list() {
        if (this._$list) return;
        $(this.$value.children()[0]).children().each(function(i, el) {
            $(el).addClass('ba-hidden');
        });
        this._$list = $(
            '<div class="attached-file row align-center mt-4 ba-hidden">'
                + '<div class="col-12">'
                    + '<ul class="list-group">'
                    + '</ul>'
                + '</div>'
            + '</div>'
        ).appendTo(this.input_area);
        this._$list_group = this._$list.find('ul.list-group');
        this._$list_group.click('.ba-remove', function() {
            let $el = $(this);
            if (!$el.hasClass('ba-remove')) return;
            let $parent = $el.parents('.ba-attachment');
            if (!$parent.length) return;
            let idx = $parent.attr('data-file-idx');
            if (!idx || !/[0-9]+/.test('' + idx)) return;
            idx = cint(idx);
            if (idx >= 0) _remove_file_by_idx(idx);
        });
    }
    _destroy_list() {
        if (this._$list) {
            this._$list.remove();
            $(this.$value.children()[0]).children().each(function(i, el) {
                $(el).removeClass('ba-hidden');
            });
        }
        this._$list = this._$list_group = null;
    }
    _update_input(value, dataurl) {
        value = value || this._value[this._value.length - 1];
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
            if (this._$list && this._$list.hasClass('ba-hidden'))
                this._$list.removeClass('ba-hidden');
        } else {
            $link.html(filename).attr('href', dataurl || value);
        }
    }
    _reset_input() {
        this.dataurl = null;
        this.fileobj = null;
        this.set_input(null);
        this.parse_validate_and_set_in_model(null);
        this.refresh();
    }
    _reset_value() {
        this.value = null;
        this.$input.toggle(true);
        this.$value.toggle(false);
        clear(this._value);
        if (this._allow_multiple) {
            clear(this._files);
            if (this._$list) {
                this._$list_group.children().each(function(i, el) {
                    $(el).remove();
                });
            }
        }
    }
};
