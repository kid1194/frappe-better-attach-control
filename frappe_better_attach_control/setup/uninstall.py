# Frappe Better Attach Control © 2023
# Author:  Ameen Ahmed
# Company: Level Up Marketing & Software Development Services
# Licence: Please refer to LICENSE file


import frappe


def after_uninstall():
    doctype = "Custom Field"
    dt = "DocField"
    fieldname = "better_attach_options"
    existing = frappe.db.get_value(doctype, {"dt": dt, "fieldname": fieldname})
    if existing:
        db_doc = frappe.qb.DocType(doctype)
        (
            frappe.qb.from_(db_doc)
            .delete()
            .where(db_doc.dt == dt)
            .where(db_doc.fieldname == fieldname)
        ).run()