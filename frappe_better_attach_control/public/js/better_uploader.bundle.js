import { get_image_type } from './utils/mime.js';

frappe.ui.FileUploader = class FileUploader extends frappe.ui.FileUploader {
    constructor(opts) {
        super(opts || {});
        
        this.uploader.add_files = function(file_array, ret) {
            if (ret) {
                file_array = Array.from(file_array)
                    .map(file => {
                        if (!file.name) {
                            let path = file.file_url.toLowerCase().split('?')[0];
                            file.name = file.file_name || path.split('/').pop();
                            file.type = get_image_type(path.split('.').pop()) || '';
                            file.size = 0;
                        }
                        return file;
                    });
            }
            let files = Array.from(file_array)
                .filter(this.check_restrictions)
                .map(file => {
                    let is_image =  file.type.startsWith('image');
                    let size_kb = file.size / 1024;
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
                        private: true
                    };
                });

            // pop extra files as per FileUploader.restrictions.max_number_of_files
            max_number_of_files = this.restrictions.max_number_of_files;
            if (max_number_of_files && files.length > max_number_of_files) {
                files.slice(max_number_of_files).forEach(file => {
                    this.show_max_files_number_warning(file, this.doctype);
                });

                files = files.slice(0, max_number_of_files);
            }
            
            if (ret) return files;

            this.files = this.files.concat(files);
            // if only one file is allowed and crop_image_aspect_ratio is set, open cropper immediately
            if (this.files.length === 1 && !this.allow_multiple && this.restrictions.crop_image_aspect_ratio != null) {
                if (!this.files[0].file_obj.type.includes('svg')) {
                    this.toggle_image_cropper(0);
                }
            }
        };
        this.uploader.upload_via_file_browser = function() {
            let selected_file = this.$refs.file_browser.selected_node;
            if (!selected_file.value) {
                frappe.msgprint(__('Click on a file to select it.'));
                this.close_dialog = true;
                return Promise.reject();
            }
            this.close_dialog = true;
            return this.upload_file({
                file_url: selected_file.file_url
            }, true);
        };
        this.uploader.upload_via_web_link = function() {
            let file_url = this.$refs.web_link.url;
            if (!file_url) {
                frappe.msgprint(__('Invalid URL'));
                this.close_dialog = true;
                return Promise.reject();
            }
            file_url = decodeURI(file_url);
            this.close_dialog = true;
            return this.upload_file({
                file_url
            }, true);
        };
        var old_upload_file = this.uploader.upload_file;
        this.uploader.upload_file = function(file, i) {
            if (i === true) {
                i = undefined;
                file = this.add_files([file], true);
                if (!file.length) return;
                file = file[0];
            }
            old_upload_file.call(this, file);
        };
        this.uploader.google_drive_callback = function(data) {
            if (data.action == google.picker.Action.PICKED) {
                this.upload_file({
                    file_url: data.docs[0].url,
                    file_name: data.docs[0].name
                }, true);
            } else if (data.action == google.picker.Action.CANCEL) {
                cur_frm.attachments.new_attachment();
            }
        };
    }
};