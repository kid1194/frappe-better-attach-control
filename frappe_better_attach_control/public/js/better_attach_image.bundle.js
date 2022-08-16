import isArray from './utils/check';
import to_images_list from './utils/mime';

frappe.provide('frappe.ui.form');

frappe.ui.form.ControlAttachImage = class ControlAttachImage extends frappe.ui.form.ControlAttach {
    set_upload_options() {
        super.set_upload_options();
        if (isArray(this.upload_options.restrictions.allowed_file_types)) {
            this.upload_options.restrictions.allowed_file_types = to_images_list(
                this.upload_options.restrictions.allowed_file_types
            );
        } else {
            this.upload_options.restrictions.allowed_file_types = ['image/*'];
        }
    }
    _make_value_dom() {
        super._make_value_dom();
        let val = this._value_to_array(this.value).pop();
        let $file_link = this.$value.find('.attached-file-link');
        $file_link.popover({
            trigger: 'hover',
            placement: 'top',
            content: () => {
                return `<div>
                    <img src="${val}"
                        width="150px"
                        style="object-fit: contain;"
                    />
                </div>`;
            },
            html: true
        });
    }
};
