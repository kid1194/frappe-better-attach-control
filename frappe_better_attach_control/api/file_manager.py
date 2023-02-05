# Frappe Better Attach Control © 2023
# Author:  Ameen Ahmed
# Company: Level Up Marketing & Software Development Services
# Licence: Please refer to LICENSE file


import os

import frappe
from frappe import _
from frappe.utils import flt, cint, cstr, get_url, get_files_path
from frappe.utils.file_manager import is_safe_path
from frappe.core.doctype.file.file import URL_PREFIXES

from .common import error, get_cached_value


_FILE_DOCTYPE_ = "File"
_FILE_FIELDS_ = [
    "name", "file_name", "file_url", "is_folder",
    "modified", "is_private", "file_size"
]


@frappe.whitelist()
def get_files_in_folder(folder, start=0, page_length=20):
    result = _get_files_in_folder(folder, start, page_length)
    result["files"] = _prepare_files(result["files"])
    return result


@frappe.whitelist()
def get_files_by_search_text(text):
    files = _get_files_by_search_text(text)
    files = _prepare_files(files)
    return files


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


def _get_files_by_search_text(text):
    if not text:
        return []

    text = "%" + cstr(text).lower() + "%"
    
    return frappe.get_all(
        _FILE_DOCTYPE_,
        fields=_FILE_FIELDS_,
        filters={"is_folder": False},
        or_filters={
            "name": ["like", text],
            "file_name": ["like", text],
            "file_url": ["like", text],
        },
        order_by="modified desc",
        limit=20,
    )


def _prepare_files(files):
    for i in range(len(files)):
        file = files[i]
        file["size"] = 0
        if not cint(file["is_folder"]):
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