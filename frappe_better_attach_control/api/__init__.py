# Frappe Better Attach Control © 2022
# Author:  Ameen Ahmed
# Company: Level Up Marketing & Software Development Services
# Licence: Please refer to LICENSE file


import os
import json
import mimetypes

import frappe
from frappe import _
from frappe.utils import cint, cstr, get_url, get_files_path
from frappe.utils.file_manager import is_safe_path
from frappe.core.doctype.file.file import URL_PREFIXES


def error(msg, throw=True):
    title = "Better Attach Control"
    frappe.log_error(title, msg)
    if throw:
        frappe.throw(msg, title=title)


def get_cached_value(dt, filters, field, as_dict=False):
    _as_dict = as_dict
    
    if isinstance(filters, str):
        if as_dict and isinstance(field, str):
            as_dict = False
        
        val = frappe.get_cached_value(dt, filters, field, as_dict=as_dict)
        if val and isinstance(val, list) and not isinstance(field, list):
            val = val.pop()
    else:
        val = frappe.db.get_value(dt, filters, field, as_dict=as_dict)
    
    if not val:
        error(_("Unable to get get the value or values of {0} from {1}, filtered by {2}").format(
            to_json_if_valid(field),
            dt,
            to_json_if_valid(
                filters.keys() if isinstance(filters, dict) else filters
            )
        ))
    
    if _as_dict and not isinstance(val, dict):
        if isinstance(field, list) and isinstance(val, list):
            val = frappe._dict(zip(field, val))
        elif isinstance(field, str):
            val = frappe._dict(zip([field], [val]))
    
    return val


def to_json_if_valid(data, default=None):
    if not data:
        return data
    
    if default is None:
        default = data
    
    try:
        return json.dumps(data)
    except Exception:
        return default


def parse_json_if_valid(data, default=None):
    if not data:
        return data
    
    if default is None:
        default = data
    
    try:
        return json.loads(data)
    except Exception:
        return default


@frappe.whitelist()
def get_files_in_folder(folder, start=0, page_length=20):
    result = _get_files_in_folder(folder, start, page_length)
    result["files"] = _prepare_files(result["files"])
    return result


_FILE_DOCTYPE_ = "File"
_FILE_FIELDS_ = ["name", "file_name", "file_url", "is_folder", "modified", "is_private", "file_size"]


def _get_files_in_folder(folder, start, page_length):
    start = cint(start)
    page_length = cint(page_length)
    
    files = frappe.get_all(
        _FILE_DOCTYPE_,
        fields=_FILE_FIELDS_,
        filters={"folder": folder},
        start=start,
        page_length=page_length + 1
    )

    if folder == "Home":
        attachment_folder = get_cached_value(
            _FILE_DOCTYPE_,
            "Home/Attachments",
            _FILE_FIELDS_,
            as_dict=1
        )
        if attachment_folder not in files:
            files.insert(0, attachment_folder)

    return {
        "files": files[:page_length],
        "has_more": len(files) > page_length,
    }


@frappe.whitelist()
def get_files_by_search_text(text):
    files = _get_files_by_search_text(text)
    files = _prepare_files(files)
    return files


def _get_files_by_search_text(text):
    if not text:
        return []

    text = "%" + cstr(text).lower() + "%"
    return frappe.get_all(
        _FILE_DOCTYPE_,
        fields=_FILE_FIELDS_,
        filters={"is_folder": False},
        or_filters={
            "file_name": ["like", text],
            "file_url": text,
            "name": ["like", text],
        },
        order_by="modified desc",
        limit=20,
    )


def _prepare_files(files):
    for i in range(len(files)):
        file = files[i]
        file["type"] = ""
        file["size"] = 0
        if not cint(file["is_folder"]):
            file["type"] = mimetypes.guess_type(f.file_url)[0] or ""
            file["size"] = flt(file["file_size"])
            if not file["size"]:
                try:
                    file["size"] = os.path.getsize(_get_full_path(file))
                except Exception:
                    file["size"] = 0
        
        del file["is_private"]
        del file["file_size"]
        
        files[i] = file
    
    return files


def _get_full_path(file):
    file_path = file["file_url"] or file["file_name"]

    site_url = get_url()
    if "/files/" in file_path and file_path.startswith(site_url):
        file_path = file_path.split(site_url, 1)[1]

    if "/" not in file_path:
        if file["is_private"]:
            file_path = f"/private/files/{file_path}"
        else:
            file_path = f"/files/{file_path}"

    if file_path.startswith("/private/files/"):
        file_path = get_files_path(*file_path.split("/private/files/", 1)[1].split("/"), is_private=1)

    elif file_path.startswith("/files/"):
        file_path = get_files_path(*file_path.split("/files/", 1)[1].split("/"))

    elif file_path.startswith(URL_PREFIXES):
        pass

    elif not file["file_url"]:
        error(_("There is some problem with the file url: {0}").format(file_path))

    if not is_safe_path(file_path):
        error(_("Cannot access file path {0}").format(file_path))

    if os.path.sep in file["file_name"]:
        error(_("File name cannot have {0}").format(os.path.sep))

    return file_path


def delete_attach_files(doctype, name, files):
    if not files:
        return 0
    
    files = parse_json_if_valid(files)
    
    if not files or not isinstance(files, list):
        return 0
    
    if (file_names := frappe.get_all(
        _FILE_DOCTYPE_,
        fields=["name"],
        filters=[
            ["file_url", "in", files],
            ["attached_to_doctype", "=", doctype],
            ["ifnull(`attached_to_name`,\"\")", "in", [name, ""]]
        ],
        pluck="name"
    )):
        for file in file_names:
            (frappe.get_doc(_FILE_DOCTYPE_, file)
                .delete(ignore_permissions=True))
    
    return 1