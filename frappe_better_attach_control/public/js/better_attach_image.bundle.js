frappe.ui.form.ControlAttachImage = class ControlAttachImage extends frappe.ui.form.ControlAttachImage {
    make_input() {
        super.make_input();
        if (!this.__is_custom) {
            console.error('The Attach Image control doesn\'t extend the plugin Attach control.');
        }
        
        // @todo: Bellow support for multiple files upload
        /*let $file_link = this.$value.find('.attached-file-link');
        $file_link.popover({
            trigger: 'hover',
            placement: 'top',
            content: () => {
                return `<div>
                    <img src="${this.get_value()}"
                        width="150px"
                        style="object-fit: contain;"
                    />
                </div>`;
            },
            html: true
        });*/
    }
    set_upload_options() {
        super.set_upload_options();
    }
};
