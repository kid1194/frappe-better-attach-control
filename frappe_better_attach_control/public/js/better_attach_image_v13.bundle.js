frappe.ui.form.ControlAttachImage = frappe.ui.form.ControlAttach.extend({
    _parse_options: function() {
        if (!this._is_better) this._images_only = true;
        this._super();
    },
    _on_setup_display: function(dom, url) {
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
});