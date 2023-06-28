# Frappe Better Attach Control © 2023
# Author:  Ameen Ahmed
# Company: Level Up Marketing & Software Development Services
# Licence: Please refer to LICENSE file


import frappe

from .common import send_console_log


_FIELD_DOCTYPE_ = "DocField"


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
    
    options = frappe.db.get_value(
        _FIELD_DOCTYPE_,
        {
            "fieldname": name,
            "parent": doctype,
            "parenttype": "DocType",
            "parentfield": "fields",
            "parentfield": "fields",
            "fieldtype": ["in", ["Attach", "Attach Image"]]
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