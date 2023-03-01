# Frappe Better Attach Control © 2023
# Author:  Ameen Ahmed
# Company: Level Up Marketing & Software Development Services
# Licence: Please refer to LICENSE file


import os

import frappe
from frappe import _

from .common import error


def website_context(context):
    if context.get("doc") and context.doc.doctype == "Web Form" and context.doc.name:
        fields = 0
        
        try:
            fields = frappe.db.count(
                "Web Form Field",
                {
                    "parent": context.doc.name,
                    "parenttype": "Web Form",
                    "parentfield": "web_form_fields",
                    "fieldtype": ["in", ["Attach", "Attach Image"]],
                }
            )
        except Exception:
            fields = 0
            error(_("Unable to get the Attach fields of the web form."), throw=False)
        
        if fields > 0:
            app_name = "frappe_better_attach_control"
            
            try:
                js_files = frappe.get_hooks("better_webform_include_js", default=None, app_name=app_name)
                if js_files:
                    if not isinstance(js_files, list):
                        js_files = [js_files]
                    
                    script = context.get("script", "")
                    for js in js_files:
                        path = frappe.get_app_path(app_name, *js.strip("/").split("/"))
                        if os.path.exists(path):
                            custom_js = frappe.render_template(open(path).read(), context)
                            script = "\n\n".join([script, custom_js])
                        else:
                            error(_("Unable to inject the js file \"{0}\" to context.").format(js), throw=False)
                        
                    context.script = script
            except Exception:
                error(_("Unable to inject the js files to context."), throw=False)
            
            try:
                css_files = frappe.get_hooks("better_webform_include_css", default=None, app_name=app_name)
                if css_files:
                    if not isinstance(css_files, list):
                        css_files = [css_files]
                    
                    style = context.get("style", "")
                    for css in css_files:
                        path = frappe.get_app_path(app_name, *css.strip("/").split("/"))
                        if os.path.exists(path):
                            custom_css = open(path).read()
                            style = "\n\n".join([style, custom_css])
                        else:
                            error(_("Unable to inject the css file \"{0}\" to context.").format(css), throw=False)
                        
                    context.style = style
            
            except Exception:
                error(_("Unable to inject the css files to context."), throw=False)
