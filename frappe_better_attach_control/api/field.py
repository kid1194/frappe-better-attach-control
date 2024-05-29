# Frappe Better Attach Control © 2024
# Author:  Ameen Ahmed
# Company: Level Up Marketing & Software Development Services
# Licence: Please refer to LICENSE file


import frappe


@frappe.whitelist(methods=["POST"], allow_guest=True)
def get_options(doctype, name, webform):
    if not doctype or not isinstance(doctype, str):
        _send_console_log({
            "message": "Empty or invalid field doctype",
            "data": [doctype, name]
        })
        return ""
    
    if not name or not isinstance(name, str):
        _send_console_log({
            "message": "Empty or invalid field name",
            "data": [doctype, name]
        })
        return ""
    
    fieldtypes = ["in", ["Attach", "Attach Image"]]
    options = None
    
    if webform:
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
    
    else:
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
        if not options or not isinstance(options, str):
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
    
    _send_console_log({
        "message": "Empty or invalid field options",
        "data": [doctype, name, options]
    })
    return ""


# [Internal]
def _send_console_log(data):
    from .common import send_console_log
    
    send_console_log(data)