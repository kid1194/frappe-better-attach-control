frappe.provide('frappe.ui.form');

frappe.ui.form.ControlAttachImage = class ControlAttachImage extends frappe.ui.form.ControlAttach {
    _parse_options() {
        if (!this._is_better) this._images_only = true;
        super._parse_options();
    }
    _make_value_dom() {
        super._make_value_dom();
        let val = this._value_to_array(this.value).pop();
        let $file_link = this.$value.find('.attached-file-link');
        $file_link.popover({
            trigger: 'hover',
            placement: 'top',
            content: () => {
                return '<div><img src="${val}" width="150px" style="object-fit: contain;"/></div>';
            },
            html: true
        });
    }
};
