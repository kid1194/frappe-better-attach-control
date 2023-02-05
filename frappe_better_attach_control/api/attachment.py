# Frappe Better Attach Control © 2023
# Author:  Ameen Ahmed
# Company: Level Up Marketing & Software Development Services
# Licence: Please refer to LICENSE file


import frappe

from .common import parse_json_if_valid


_FILE_DOCTYPE_ = "File"


@frappe.whitelist(methods=["POST"])
def remove_files(files):
    if files and isinstance(files, str):
        files = parse_json_if_valid(files)
    
    if not files or not isinstance(files, list):
        return 0
    
    if (names := frappe.get_all(
        _FILE_DOCTYPE_,
        fields=["name"],
        filters={"file_url": ["in", files]},
        pluck="name"
    )):
        for name in names:
            frappe.delete_doc(_FILE_DOCTYPE_, name)
    
        return 1
    
    return 0