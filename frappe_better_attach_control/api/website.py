# Frappe Better Attach Control © 2024
# Author:  Ameen Ahmed
# Company: Level Up Marketing & Software Development Services
# Licence: Please refer to LICENSE file


import os

import frappe
from frappe import _


def website_context(context):
    if (
        not context.get("doc", "") or
        not hasattr(context.doc, "doctype") or
        not hasattr(context.doc, "name") or
        context.doc.doctype != "Web Form" or
        not context.doc.name
    ):
        return 0
    
    from .common import error
    
    try:
        fields = frappe.get_all(
            "Web Form Field",
            fields=["fieldname", "options"],
            filters={
                "parent": context.doc.name,
                "parenttype": "Web Form",
                "parentfield": "web_form_fields",
                "fieldtype": ["in", ["Attach", "Attach Image"]],
            }
        )
        if not fields:
            return 0
        
        options = {}
        for field in fields:
            if (
                field["options"] and
                isinstance(field["options"], str) and
                field["options"][0] == "{"
            ):
                options[field["fieldname"]] = field["options"]
        
        if not options:
            return 0
        
        from .common import to_json_if_valid
        
        options = to_json_if_valid(options, "")
        if not options:
            return 0
        
        script = "frappe.provide('frappe.BAC');"
        script = f"{script}\nfrappe.BAC.webform = true;"
        script = f"{script}\nfrappe.BAC.options = {options};"
        set_context(context, "script", script)
    except Exception:
        error(_("Unable to get the Attach fields of the web form."), throw=False)
        return 0
    
    app_name = "frappe_better_attach_control"
    bundled_js = get_bundled_file_path(app_name, "js")
    js_loaded = False
    if has_file(bundled_js):
        try:
            scripts = read_file(bundled_js)
            js = bundled_js.strip("/").split("/")[-1]
            scripts = f"// {js}\n{scripts}"
            set_context(context, "script", scripts)
            js_loaded = True
        except Exception:
            error(_("Unable to inject the js bundled file to context."), throw=False)
    
    if not js_loaded:
        try:
            js_files = frappe.get_hooks("better_webform_include_js", default=None, app_name=app_name)
            if not js_files:
                error(_("Unable to inject the js files to context."), throw=False)
            else:
                if not isinstance(js_files, list):
                    js_files = [js_files]
                
                scripts = []
                for js in js_files:
                    path = get_file_path(app_name, js)
                    if has_file(path):
                        data = read_file(path)
                        scripts.append(f"// {js}\n{data}")
                    else:
                        error(_("Unable to inject the js file \"{0}\" to context.").format(js), throw=False)
                
                if scripts:
                    scripts = clean_js_script("\n\n\n".join(scripts))
                    scripts = "(function() {\n\n" + scripts + "\n\n}());"
                    write_file(bundled_js, scripts)
                    set_context(context, "script", scripts)
        except Exception:
            error(_("Unable to inject the js files to context."), throw=False)
    
    try:
        css_files = frappe.get_hooks("better_webform_include_css", default=None, app_name=app_name)
        if not css_files:
            error(_("Unable to inject the css files to context."), throw=False)
        else:
            if not isinstance(css_files, list):
                css_files = [css_files]
            
            styles = []
            for css in css_files:
                path = get_file_path(app_name, css)
                if has_file(path):
                    data = read_file(path)
                    styles.append(f"// {css}\n{data}")
                else:
                    error(_("Unable to inject the css file \"{0}\" to context.").format(css), throw=False)
            
            if styles:
                set_context(context, "style", "\n\n\n".join(styles))
    except Exception:
        error(_("Unable to inject the css files to context."), throw=False)


def set_context(context, key, data):
    value = context.get(key, "")
    if value:
        context[key] = "\n\n\n".join([value, data])
    else:
        context[key] = data


def get_bundled_file_path(app, ext):
    from .common import __frappe_base_ver__ as version
    
    filename = f"better_attach_v{version}.bundle.{ext}"
    path = f"/assets/frappe_better_attach_control/{ext}/{filename}"
    return get_file_path(app, path)


def get_file_path(app, path):
    return frappe.get_app_path(app, *path.strip("/").split("/"))


def has_file(app, path):
    if os.path.exists(path):
        return True
    
    return False


def read_file(path):
    tmp = open(path)
    data = tmp.read()
    tmp.close()
    return data


def write_file(path, data):
    tmp = open(path, "w")
    tmp.write(data)
    tmp.close()


def clean_js_script(data):
    import re
    
    rgx = [
        "import([\s\n\r]+|)(.*?)([\s\n\r]+|)from([\s\n\r]+|)(.*?)([\s\n\r]+|)\;",
        "import([\s\n\r]+|)(.*?)([\s\n\r]+|)\;",
        "import([\s\n\r]+|)\{([\s\n\r]+|)*(([\s\n\r]+|)(.*?)([\s\n\r]+|))*([\s\n\r]+|)\}([\s\n\r]+|)from([\s\n\r]+|)(.*?)([\s\n\r]+|)\;",
        "export([\s\n\r]+|)default([\s\n\r]+|)(.*?)([\s\n\r]+|)\;",
        "export([\s\n\r]+|)"
    ]
    data = re.sub("(" + "|".join(rgx) + ")", "", data)
    data = re.sub("^([\s\n\r]+)", "", data)
    data = re.sub("([\n\r]{3,})", "\n\n\n", data)
    return data