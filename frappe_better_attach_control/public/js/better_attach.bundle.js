frappe.ui.form.ControlAttach = class ControlAttach extends frappe.ui.form.ControlAttach {
    make() {
        // parent element
        super.make();
        
        this.__is_custom = true;
        if (this.df.options) {
            if (frappe.utils.is_json(this.df.options)) {
                let opts = frappe.utils.parse_json(this.df.options);
                this.df.options = {};
                if (opts) {
                    let keys = ['upload_notes', 'allow_multiple', 'max_file_size', 'allowed_file_types', 'max_number_of_files', 'crop_image_aspect_ratio'];
                    for (var k in opts) {
                        let idx = keys.indexOf(k);
                        if (idx >= 0) {
                            if (idx < 2) this.df.options[k] = opts[k];
                            else {
                                if (!this.df.options.restrictions) this.df.options.restrictions = {};
                                this.df.options.restrictions[k] = opts[k];
                            }
                        }
                    }
                }
                if (!Object.keys(this.df.options).length) this.df.options = null;
            } else {
                this.df.options = null;
            }
        }
        if ((this.df.options || {}).allow_multiple) this.value_list = [];
    }
    make_input() {
        super.make_input();
        if (this.value_list) {
            // @todo: make upload inputs list this.$value
        }
    }
    clear_attachment() {
        let me = this;
        if (this.frm) {
            me.parse_validate_and_set_in_model(null);
            me.refresh();
            if (me.value_list) {
                var promises = [];
                for (var i = 0, l = me.value_list.length; i < l; i++) {
                    promises.push(new Promise((resolve, reject) => {
                        me.frm.attachments.remove_attachment_by_filename(me.value_list[i], resolve);
                    }));
                }
                Promise.all(promises)
                .then(async () => {
                    await me.parse_validate_and_set_in_model(null);
                    me.refresh();
                    me.frm.doc.docstatus == 1 ? me.frm.save('Update') : me.frm.save();
                });
            } else {
                me.frm.attachments.remove_attachment_by_filename(me.value, async () => {
                    await me.parse_validate_and_set_in_model(null);
                    me.refresh();
                    me.frm.doc.docstatus == 1 ? me.frm.save('Update') : me.frm.save();
                });
            }
        } else {
            this.dataurl = null;
            this.fileobj = null;
            this.set_input(null);
            this.parse_validate_and_set_in_model(null);
            this.refresh();
        }
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
    set_input(value, dataurl) {
        if (value && this.value_list) {
            this.value_list.push(value);
        }
        super.set_input(value, dataurl);
    }
    get_value() {
        return this.value_list ? JSON.stringify(this.value_list) : this.value || null;
    }
};
