frappe.ui.form.ControlAttachImage = class ControlAttachImage extends frappe.ui.form.ControlAttach {
    _parse_options() {
        if (!this._is_better) this._images_only = true;
        super._parse_options();
    }
    _on_setup_display(dom, url) {
        var me = this;
        if (!dom) dom = this.$value.find('.attached-file-link');
        dom.popover({
            trigger: 'hover',
            placement: 'top',
            content: () => {
                return '<div><img src="' + (url || me.value) + '" width="150px" style="object-fit: contain;"/></div>';
            },
            html: true
        });
    }
};
