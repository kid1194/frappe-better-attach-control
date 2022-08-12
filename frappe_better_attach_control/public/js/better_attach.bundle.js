frappe.ui.form.ControlAttach = class ControlAttach extends frappe.ui.form.ControlAttach {
    on_attach_click() {
        this.set_upload_options();
        this.file_uploader = new frappe.ui.FileUploader(this.upload_options);
    }
    on_attach_doc_image() {
        this.set_upload_options();
        if (this.upload_options.restrictions.allowed_file_types == null) {
            this.upload_options.restrictions.allowed_file_types = ['image/*'];
        }
        if (this.upload_options.restrictions.crop_image_aspect_ratio == null) {
            this.upload_options.restrictions.crop_image_aspect_ratio = 1;
        }
        this.file_uploader = new frappe.ui.FileUploader(this.upload_options);
    }
    set_upload_options() {
        super.set_upload_options();
        let options = this._JSON_options;
        if (!options && this.df.options && typeof this.df.options === 'string'
            && this.df.options.length > 2 && this.df.options[0] === '{'
            && this.df.options[this.df.options.length - 1] === '}') {
            try {
                this._JSON_options = JSON.parse(this.df.options);
            } catch(e) {}
        }
        if (options) {
            let keys = ['upload_notes', 'allow_multiple', 'max_file_size', 'allowed_file_types', 'max_number_of_files', 'crop_image_aspect_ratio'];
            for (var k in options) {
                if (keys.indexOf(k) >= 0) this.upload_options.restrictions[k] = options[k];
            }
        }
    }
};
