# Frappe Better Attach Control © 2023
# Author:  Ameen Ahmed
# Company: Level Up Marketing & Software Development Services
# Licence: Please refer to LICENSE file


import frappe

from .common import (
    parse_json_if_valid,
    send_console_log
)


_FILE_DOCTYPE_ = "File"


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
        if file.startswith(("files/", "private/files/")):
            file = "/" + file
        
        if file.startswith(("/files/", "/private/files/")):
            file_urls.append(file)
        else:
            file_names.append(file)
    
    if file_urls or file_names:
        or_filters = None
        if file_urls:
            filters = {"file_url": ["in", file_urls]}
            if file_names:
                or_filters = {"file_name": ["in", file_names]}
        else:
            filters = {"file_name": ["in", file_names]}
        
        if (names := frappe.get_all(
            _FILE_DOCTYPE_,
            fields=["name"],
            filters=filters,
            or_filters=or_filters,
            pluck="name"
        )):
            for name in names:
                frappe.delete_doc(_FILE_DOCTYPE_, name)
        
            return 1
    
    send_console_log({
        "message": "Files not found",
        "data": files
    })
    return 2