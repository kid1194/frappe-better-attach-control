# Frappe Better Attach Control © 2023
# Author:  Ameen Ahmed
# Company: Level Up Marketing & Software Development Services
# Licence: Please refer to LICENSE file


import frappe

from .common import error


def website_context(context):
    if context.get("web_form_doc"):
        app_name = "frappe_better_attach_control"
        
        try:
            js_files = frappe.get_hooks("better_webform_include_js", default=None, app_name=app_name)
            if js_files:
                if not isinstance(js_files, list):
                    js_files = [js_files]
                
                script = context.get("script", "")
                for path in js_files:
                    path = frappe.get_app_path(app_name, *path.strip("/").split("/"))
                    custom_js = frappe.render_template(open(path).read(), context)
                    script = "\n\n".join([script, custom_js])
                    
                context.script = script
        except Exception:
            error("Unable to inject the js files to context.", throw=False)
        
        try:
            css_files = frappe.get_hooks("better_webform_include_css", default=None, app_name=app_name)
            if css_files:
                if not isinstance(css_files, list):
                    css_files = [css_files]
                
                style = context.get("style", "")
                for path in css_files:
                    path = frappe.get_app_path(app_name, *path.strip("/").split("/"))
                    custom_css = open(path).read()
                    style = "\n\n".join([style, custom_css])
                    
                context.style = style
        
        except Exception:
            error("Unable to inject the css files to context.", throw=False)