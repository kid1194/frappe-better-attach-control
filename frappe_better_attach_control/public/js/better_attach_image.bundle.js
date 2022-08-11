frappe.ui.form.ControlAttachImage = class ControlAttachImage extends frappe.ui.form.ControlAttachImage {
    set_upload_options() {
        super.set_upload_options();
        if (this.upload_options.restrictions.allowed_file_types == null) {
            this.upload_options.restrictions.allowed_file_types = ['image/*'];
        }
    }
};
