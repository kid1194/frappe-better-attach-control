# Frappe Better Attach Control © 2024
# Author:  Ameen Ahmed
# Company: Level Up Marketing & Software Development Services
# Licence: Please refer to LICENSE file


import frappe
from frappe import _, is_whitelisted
from frappe.utils import cint

from .common import (
    is_version_gt,
    parse_json_if_valid,
    send_console_log
)


_FILE_DOCTYPE_ = "File"
# For version > 13
_ALLOWED_MIMETYPES_ = (
    "image/png",
    "image/jpeg",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.oasis.opendocument.text",
    "application/vnd.oasis.opendocument.spreadsheet",
    "text/plain",
)


@frappe.whitelist(allow_guest=True)
def upload_file():
    user = None
    ignore_permissions = False
    
    if is_version_gt(12):
        if frappe.session.user == "Guest":
            if frappe.get_system_settings("allow_guests_to_upload_files"):
                ignore_permissions = True
            else:
                raise frappe.PermissionError
        else:
            user = frappe.get_doc("User", frappe.session.user)
            ignore_permissions = False
    
    files = frappe.request.files
    is_private = frappe.form_dict.is_private
    doctype = frappe.form_dict.doctype
    docname = frappe.form_dict.docname
    fieldname = frappe.form_dict.fieldname
    file_url = frappe.form_dict.file_url
    folder = frappe.form_dict.folder or "Home"
    method = frappe.form_dict.method
    filename = None
    optimize = False
    content = None
    
    if is_version_gt(13):
        filename = frappe.form_dict.file_name
        optimize = frappe.form_dict.optimize
    
    if is_version_gt(12):
        import mimetypes
    
    if "file" in files:
        file = files["file"]
        content = file.stream.read()
        filename = file.filename
        
        if is_version_gt(13):
            content_type = mimetypes.guess_type(filename)[0]
            if optimize and content_type.startswith("image/"):
                args = {"content": content, "content_type": content_type}
                if frappe.form_dict.max_width:
                    args["max_width"] = int(frappe.form_dict.max_width)
                if frappe.form_dict.max_height:
                    args["max_height"] = int(frappe.form_dict.max_height)
                
                from frappe.utils.image import optimize_image
                content = optimize_image(**args)
    
    frappe.local.uploaded_file = content
    frappe.local.uploaded_filename = filename
    
    if is_version_gt(13):
        if not file_url and content is not None and (
            frappe.session.user == "Guest" or (user and not user.has_desk_access())
        ):
            filetype = mimetypes.guess_type(filename)[0]
            if filetype not in _ALLOWED_MIMETYPES_:
                frappe.throw(_("You can only upload JPG, PNG, PDF, TXT or Microsoft documents."))
    
    elif is_version_gt(12):
        if not file_url and frappe.session.user == "Guest" or (user and not user.has_desk_access()):
            filetype = mimetypes.guess_type(filename)[0]

    if method:
        method = frappe.get_attr(method)
        is_whitelisted(method)
        return method()
    else:
        ret = frappe.get_doc({
            "doctype": _FILE_DOCTYPE_,
            "attached_to_doctype": doctype,
            "attached_to_name": docname,
            "attached_to_field": fieldname,
            "folder": folder,
            "file_name": filename,
            "file_url": file_url,
            "is_private": cint(is_private),
            "content": content,
        })
        if is_version_gt(12):
            ret.save(ignore_permissions=ignore_permissions)
        else:
            ret.save()
        
        return ret


@frappe.whitelist(methods=["POST"], allow_guest=True)
def remove_files(files):
    if files and isinstance(files, str):
        files = parse_json_if_valid(files)
    
    if not files or not isinstance(files, list):
        send_console_log({
            "message": "Invalid files list",
            "data": files
        })
        return 0
    
    file_urls = []
    file_names = []
    for file in files:
        if file.startswith("http"):
            pass
        
        if file.startswith(("files/", "private/files/")):
            file = "/" + file
        
        if file.startswith(("/files/", "/private/files/")):
            file_urls.append(file)
        else:
            file_names.append(file)
    
    if not file_urls and not file_names:
        send_console_log({
            "message": "Invalid files path",
            "data": files
        })
        return 2
    
    filters = None
    or_filters = None
    if file_urls:
        filters = {"file_url": ["in", file_urls]}
        if file_names:
            or_filters = {"file_name": ["in", file_names]}
    else:
        filters = {"file_name": ["in", file_names]}
    
    names = frappe.get_all(
        _FILE_DOCTYPE_,
        fields=["name"],
        filters=filters,
        or_filters=or_filters,
        pluck="name"
    )
    if names:
        for name in names:
            frappe.delete_doc(_FILE_DOCTYPE_, name)
        
        return 1
    
    send_console_log({
        "message": "Files not found",
        "data": files
    })
    return 3