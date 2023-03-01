# Frappe Better Attach Control © 2023
# Author:  Ameen Ahmed
# Company: Level Up Marketing & Software Development Services
# Licence: Please refer to LICENSE file


import frappe
from frappe import _
from frappe.custom.doctype.custom_field.custom_field import create_custom_field


def after_install():
    dt = "DocField"
    if create_custom_field(
        dt,
        {
            "label": _("Better Attach Options"),
            "fieldname": "better_attach_options",
            "fieldtype": "Small Text",
            "module": "Frappe Better Attach Control",
            "depends_on": "eval:in_list(['Attach', 'Attach Image'], doc.fieldtype)",
            "insert_after": "options",
            "ignore_user_permissions": 1,
            "print_hide": 1,
            "no_copy": 1,
            "report_hide": 1,
            "allow_in_quick_entry": 1,
        },
        ignore_validate=True
    ):
        frappe.clear_cache(doctype=dt)
        frappe.db.updatedb(dt)