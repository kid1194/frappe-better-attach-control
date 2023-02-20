# Frappe Better Attach Control © 2023
# Author:  Ameen Ahmed
# Company: Level Up Marketing & Software Development Services
# Licence: Please refer to LICENSE file


import frappe
from frappe import _
from frappe.custom.doctype.custom_field.custom_field import create_custom_field


def after_install():
    dt = "DocField"
    field = {
        "label": _("Better Attach Options"),
        "fieldname": "better_attach_options",
        "fieldtype": "Small Text",
        "no_copy": 1,
        "depends_on": "eval:in_list(['Attach', 'Attach Image'], doc.fieldtype)",
        "insert_after": "options",
    }
    existing = frappe.db.get_value("Custom Field", {"dt": dt, "fieldname": field["fieldname"]})
    if not existing:
        create_custom_field(dt, field, is_system_generated=False)
        frappe.clear_cache(doctype=dt)
        frappe.db.updatedb(dt)