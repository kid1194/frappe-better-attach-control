import {
    get_filename,
    get_file_ext,
    get_file_type
} from './../filetypes';


frappe._ba = {
    log: function(text) {
        console.log('[Better Attach]: ' + text);
    }
};

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
                allowed_file_types: [],
                crop_image_aspect_ratio: null
            }
        );
    }
    _override_uploader(opts) {
        var up = this.uploader;
        up.restrictions.as_public = opts.restrictions.as_public;
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
                    let size_kb = file.size ? file.size / 1024 : 0;
                    return {
                        file_obj: file,
                        cropper_file: file,
                        crop_box_data: null,
                        optimize: size_kb > 200 && is_image && !(file.type || '').includes('svg'),
                        name: file.name,
                        doc: null,
                        progress: 0,
                        total: 0,
                        failed: false,
                        request_succeeded: false,
                        error_message: null,
                        uploading: false,
                        private: me.restrictions.as_public ? false : true
                    };
                });
            
            let max_number_of_files = this.restrictions.max_number_of_files;
            if (max_number_of_files && files.length > max_number_of_files) {
                files.slice(max_number_of_files).forEach(function(file) {
                    me.show_max_files_number_warning(file, me.doctype);
                });
                files = files.slice(0, max_number_of_files);
            }
            
            if (custom) return files;
            
            this.files = this.files.concat(files);
            if (
                this.files.length === 1 && !this.allow_multiple
                && this.restrictions.crop_image_aspect_ratio != null
            ) {
                if (!this.files[0].file_obj.type.includes('svg')) {
                    this.toggle_image_cropper(0);
                }
            }
        };
        up.upload_via_web_link = function() {
            let file_url = this.$refs.web_link.url;
            if (!file_url) {
                frappe.msgprint(__('Invalid URL'));
                this.close_dialog = true;
                return Promise.reject();
            }
            file_url = decodeURI(file_url);
            this.close_dialog = true;
            frappe._ba.log('Uploading via web link.');
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
        up.google_drive_callback = function(data) {
            if (data.action == google.picker.Action.PICKED) {
                frappe._ba.log('Uploading via google drive.');
                this.upload_file({
                    file_url: data.docs[0].url,
                    file_name: data.docs[0].name
                }, null, true);
            } else if (data.action == google.picker.Action.CANCEL) {
                cur_frm.attachments.new_attachment();
            }
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
        fb.get_files_in_folder = function(folder, start) {
            var me = this;
            return frappe.call(
                'frappe_better_attach_control.api.handler.get_files_in_folder',
                {
					folder,
					start,
					page_length: this.page_length
				}
			).then(function(r) {
				let { files = [], has_more = false } = r.message || {};
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
				files = files.map(function(file) { return me.make_file_node(file); });
				return { files, has_more };
			});
        };
        fb.search_by_name = frappe.utils.debounce(function() {
			if (this.search_text === '') {
				this.node = this.folder_node;
				return;
			}
			if (this.search_text.length < 3) return;
			var me = this;
			frappe.call(
				'frappe_better_attach_control.api.handler.get_files_by_search_text',
				{text: this.search_text}
			).then(function(r) {
				let files = r.message || [];
				files = files.filter(me.check_restrictions)
				    .map(function(file) { return me.make_file_node(file); });
				if (!me.folder_node) {
					me.folder_node = me.node;
				}
				me.node = {
					label: __('Search Results'),
					value: '',
					children: files,
					by_search: true,
					open: true,
					filtered: true
				};
			});
		}, 300);
    }
};