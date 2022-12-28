/*
*  Frappe Better Attach Control © 2022
*  Author:  Ameen Ahmed
*  Company: Level Up Marketing & Software Development Services
*  Licence: Please refer to LICENSE file
*/


frappe.ui.form.ControlAttachImage = frappe.ui.form.ControlAttach.extend({
    _setup_control: function() {
        this._images_only = true;
        this._super();
    }
});