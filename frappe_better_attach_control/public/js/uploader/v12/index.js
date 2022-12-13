/*
*  Frappe Better Attach Control © 2022
*  Author:  Ameen Ahmed
*  Company: Level Up Marketing & Software Development Services
*  Licence: Please refer to LICENSE file
*/


import {
    isObject,
    isPlainObject,
    isEmpty,
    fn,
    error
} from './../../utils';
import {
    get_filename,
    get_file_ext,
    get_file_type
} from './../../filetypes';


frappe.ui.FileUploader = class FileUploader extends frappe.ui.FileUploader {
    constructor(opts) {
        super(opts || {});
        if (!this.uploader) return;
        this._override_uploader(opts);
        this._override_file_browser(
            !isEmpty(opts.restrictions)
            ? opts.restrictions
            : {
                max_file_size: null,
                max_number_of_files: null,
                allowed_file_types: []
            }
        );
    }
    _override_uploader(opts) {
        var up = this.uploader;
        up.restrictions.as_public = !!opts.restrictions.as_public;
        up.dropfiles = function(e) {
			this.is_dragging = false;
			if (isObject(e) && isObject(e.dataTransfer))
			    this.add_files(e.dataTransfer.files);
		};
        up.show_max_files_number_warning = function(file, max_number_of_files) {
            console.warn(
                `File skipped because it exceeds the allowed specified limit of ${max_number_of_files} uploads`,
                file
            );
            if (this.doctype) {
                MSG = __('File "{0}" was skipped because only {1} uploads are allowed for DocType "{2}"',
                    [file.name, max_number_of_files, this.doctype]);
            } else {
                MSG = __('File "{0}" was skipped because only {1} uploads are allowed',
                    [file.name, max_number_of_files]);
            }
            frappe.show_alert({
                message: MSG,
                indicator: "orange",
            });
        };
        up.prepare_files = function(file_array) {
            let is_single = isPlainObject(file_array),
            files = is_single ? [file_array] : Array.from(file_array);
            files = files.map(function(f) {
                if (f.name == null) f.name = f.file_name || get_filename(f.file_url);
                if (f.type == null) f.type = get_file_type(get_file_ext(f.file_url)) || '';
                if (f.size == null) f.size = 0;
                return f;
            });
            files = files.filter(this.check_restrictions);
            if (isEmpty(files)) return !is_single ? [] : null;
            files = files.map(fn(function(file) {
                let is_image =  file.type.startsWith('image');
                return {
                    file_obj: file,
                    is_image,
                    name: file.name,
                    doc: null,
                    progress: 0,
                    total: 0,
                    failed: false,
                    uploading: false,
                    private: !this.restrictions.as_public || !is_image,
                };
            }, this));
            return !is_single ? files : files[0];
        };
        up.add_files = function(file_array) {
            let files = this.prepare_files(file_array),
            max_number_of_files = this.restrictions.max_number_of_files;
            if (max_number_of_files) {
                let uploaded = (this.files || []).length,
                total = uploaded + files.length;
                if (total > max_number_of_files) {
                    let slice_index = max_number_of_files - uploaded - 1;
                    files.slice(slice_index).forEach(fn(function(file) {
                        this.show_max_files_number_warning(file, max_number_of_files);
                    }, this));
                    files = files.slice(0, max_number_of_files);
                }
            }
            this.files = this.files.concat(files);
        };
        up.upload_via_web_link = function() {
            let file_url = this.$refs.web_link.url;
            if (!file_url) {
                error('Invalid URL');
                return Promise.reject();
            }
            file_url = decodeURI(file_url);
            let file = this.prepare_files({file_url});
            return file ? this.upload_file(file) : Promise.reject();
        };
    }
    _override_file_browser(opts) {
        var fb = this.uploader.$refs.file_browser;
        fb._restrictions = opts;
        fb.check_restrictions = function(file) {
            if (file.is_folder) return true;
            let { max_file_size, allowed_file_types = [] } = this._restrictions,
            is_correct_type = true,
            valid_file_size = true;
            if (!isEmpty(allowed_file_types)) {
                is_correct_type = allowed_file_types.some(function(type) {
                    if (type.includes('/')) {
                        if (!file.type) return false;
                        return file.type.match(type);
                    }
                    if (type[0] === '.') {
                        return (file.name || file.file_name).endsWith(type);
                    }
                    return false;
                });
            }
            if (max_file_size && file.size != null && file.size) {
                valid_file_size = file.size < max_file_size;
            }
            return is_correct_type && valid_file_size;
        };
        fb.get_files_in_folder = function(folder) {
            return frappe.call(
                'frappe_better_attach_control.api.get_files_in_folder',
                {folder}
            ).then(fn(function(r) {
                let files = r.message || [];
                if (!isEmpty(files)) {
                    files = files.map(function(f) {
                        if (f.name == null) f.name = f.file_name || get_filename(f.file_url);
                        if (f.type == null) f.type = get_file_type(get_file_ext(f.file_url)) || '';
                        if (f.size == null) f.size = 0;
                        return f;
                    });
                    files = files.filter(this.check_restrictions);
                    files.sort(function(a, b) {
                        if (a.is_folder && b.is_folder) {
                            return a.modified < b.modified ? -1 : 1;
                        }
                        if (a.is_folder) return -1;
                        if (b.is_folder) return 1;
                        return 0;
                    });
                    files = files.map(function(file) {
                        let filename = file.file_name || file.name;
                        return {
                            label: frappe.utils.file_name_ellipsis(filename, 40),
                            filename: filename,
                            file_url: file.file_url,
                            value: file.name,
                            is_leaf: !file.is_folder,
                            fetched: !file.is_folder,
                            children: [],
                            open: false,
                            fetching: false,
                            filtered: true
                        };
                    });
                }
                return files;
            }, this));
        };
    }
};