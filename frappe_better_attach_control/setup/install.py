# Frappe Better Attach Control © 2023
# Author:  Ameen Ahmed
# Company: Level Up Marketing & Software Development Services
# Licence: Please refer to LICENSE file


import frappe


def after_install():
    dt = "Custom Field"
    target = "DocField"
    filters = {
        "dt": target,
        "fieldname": "better_attach_options"
    }
    if frappe.db.get_value(dt, filters):
        frappe.db.delete(dt, filters)
        frappe.clear_cache(doctype=target)
        frappe.db.updatedb(target)