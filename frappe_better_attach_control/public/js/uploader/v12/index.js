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
            opts.restrictions && Object.keys(opts.restrictions).length
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
        up.restrictions.as_public = opts.restrictions.as_public;
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
        up.add_files = function(file_array, custom) {
            let files = Array.from(file_array);
            if (custom) {
                files = files.map(function(f) {
                    if (!f.name) {
                        f.name = f.file_name || get_filename(f.file_url);
                        f.type = get_file_type(get_file_ext(f.file_url)) || '';
                        f.size = null;
                    }
                    return f;
                });
            }
            
            var me = this;
            files = files.filter(this.check_restrictions)
                .map(function(file) {
                    let is_image =  file.type.startsWith('image');
                    return {
                        file_obj: file,
                        name: file.name,
                        doc: null,
                        progress: 0,
                        total: 0,
                        failed: false,
                        uploading: false,
                        private: me.restrictions.as_public ? false : !is_image
                    };
                });
            
            let _max_number_of_files = this.restrictions.max_number_of_files;
            if (_max_number_of_files && files.length > _max_number_of_files) {
                files.slice(_max_number_of_files).forEach(function(file) {
                    me.show_max_files_number_warning(file, _max_number_of_files);
                });
                files = files.slice(0, _max_number_of_files);
            }
            
            if (custom) return files;
            
            this.files = this.files.concat(files);
        };
        up.upload_via_web_link = function() {
            let file_url = this.$refs.web_link.url;
            if (!file_url) {
                frappe.msgprint(__('Invalid URL'));
                return Promise.reject();
            }
            file_url = decodeURI(file_url);
            return this.upload_file({file_url: file_url}, null, true);
        };
        up._upload_file = up.upload_file;
        up.upload_file = function(file, i, custom) {
            if (custom) {
                file = this.add_files([file], custom);
                if (!file.length) return;
                file = file[0];
            }
            this._upload_file(file, i);
        };
    }
    _override_file_browser(opts) {
        var fb = this.uploader.$refs.file_browser;
        fb._restrictions = opts;
        fb.check_restrictions = function(file) {
            if (file.is_folder) return true;
            let { max_file_size, allowed_file_types = [] } = this._restrictions;
            
            let is_correct_type = true;
            let valid_file_size = true;
            
            if (allowed_file_types && allowed_file_types.length) {
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
            var me = this;
            return frappe.call(
                'frappe_better_attach_control.api.get_files_in_folder',
                {folder}
            ).then(function(r) {
                let files = r.message || [];
                files = files.filter(me.check_restrictions);
                files.sort(function(a, b) {
                    if (a.is_folder && b.is_folder) {
                        return a.modified < b.modified ? -1 : 1;
                    }
                    if (a.is_folder) {
                        return -1;
                    }
                    if (b.is_folder) {
                        return 1;
                    }
                    return 0;
                });
                return files.map(function(file) {
                    let filename = file.file_name || file.name;
                    return {
                        label: frappe.utils.file_name_ellipsis(filename, 40),
                        filename: filename,
                        file_url: file.file_url,
                        value: file.name,
                        is_leaf: !file.is_folder,
                        fetched: !file.is_folder, // fetched if node is leaf
                        children: [],
                        open: false,
                        fetching: false,
                        filtered: true
                    };
                });
            });
        };
    }
};