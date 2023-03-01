# Frappe Better Attach Control © 2023
# Author:  Ameen Ahmed
# Company: Level Up Marketing & Software Development Services
# Licence: Please refer to LICENSE file


import frappe


def after_uninstall():
    doctype = "Custom Field"
    filters = {"dt": "DocField", "fieldname": "better_attach_options"}
    if frappe.db.get_value(doctype, filters):
        frappe.db.delete(doctype, filters)