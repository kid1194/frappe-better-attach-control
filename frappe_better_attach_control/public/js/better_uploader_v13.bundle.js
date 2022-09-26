import { get_image_type } from './utils/mime.js';

frappe.ui.FileUploader = class FileUploader extends frappe.ui.FileUploader {
    constructor({
        wrapper,
        method,
        on_success,
        doctype,
        docname,
        fieldname,
        files,
        folder,
        restrictions,
        upload_notes,
        allow_multiple,
        as_dataurl,
        disable_file_browser,
        frm
    } = {}) {
        super({
            wrapper,
            method,
            on_success,
            doctype,
            docname,
            fieldname,
            files,
            folder,
            restrictions,
            upload_notes,
            allow_multiple,
            as_dataurl,
            disable_file_browser,
            frm
        });
        
        this.uploader.add_files = function(file_array, ret) {
            if (ret) {
                file_array = Array.from(file_array)
                    .map(file => {
                        if (!file.name) {
                            let path = file.file_url.toLowerCase().split('?')[0];
                            file.name = file.file_name || path.split('/').pop();
                            file.type = get_image_type(path.split('.').pop()) || '';
                        }
                        return file;
                    });
            }
            let files = Array.from(file_array)
                .filter(this.check_restrictions)
                .map(file => {
                    let is_image = file.type.startsWith('image');
                    return {
                        file_obj: file,
                        name: file.name,
                        doc: null,
                        progress: 0,
                        total: 0,
                        failed: false,
                        uploading: false,
                        private: !is_image
                    }
                });
            if (ret) return files;
            this.files = this.files.concat(files);
        };
        this.uploader.upload_via_file_browser = function() {
            let selected_file = this.$refs.file_browser.selected_node;
            if (!selected_file.value) {
                frappe.msgprint(__('Click on a file to select it.'));
                return Promise.reject();
            }
            return this.upload_file({
                file_url: selected_file.file_url
            }, true);
        };
        this.uploader.upload_via_web_link = function() {
            let file_url = this.$refs.web_link.url;
            if (!file_url) {
                frappe.msgprint(__('Invalid URL'));
                return Promise.reject();
            }
            file_url = decodeURI(file_url)
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
                dialog.show();
            }
        };
    }
};