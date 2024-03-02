# Frappe Better Attach Control © 2023
# Author:  Ameen Ahmed
# Company: Level Up Marketing & Software Development Services
# Licence: Please refer to LICENSE file


import frappe

from .common import send_console_log


@frappe.whitelist(methods=["POST"], allow_guest=True)
def get_options(doctype, name):
    if not doctype or not isinstance(doctype, str):
        send_console_log({
            "message": "Empty or invalid field doctype",
            "data": [doctype, name]
        })
        return ""
    
    if not name or not isinstance(name, str):
        send_console_log({
            "message": "Empty or invalid field name",
            "data": [doctype, name]
        })
        return ""
    
    fieldtypes = ["in", ["Attach", "Attach Image"]]
    options = frappe.db.get_value(
        "DocField",
        {
            "fieldname": name,
            "parent": doctype,
            "parenttype": "DocType",
            "parentfield": "fields",
            "fieldtype": fieldtypes
        },
        "options"
    )
    
    if options and isinstance(options, str):
        return options
    
    options = frappe.db.get_value(
        "Custom Field",
        {
            "fieldname": name,
            "dt": doctype,
            "fieldtype": fieldtypes
        },
        "options"
    )
    
    if options and isinstance(options, str):
        return options
    
    options = frappe.db.get_value(
        "Web Form Field",
        {
            "fieldname": name,
            "parent": doctype,
            "parenttype": "Web Form",
            "parentfield": "web_form_fields",
            "fieldtype": fieldtypes
        },
        "options"
    )
    
    if options and isinstance(options, str):
        return options
    
    send_console_log({
        "message": "Empty or invalid field options",
        "data": [doctype, name, options]
    })
    return ""