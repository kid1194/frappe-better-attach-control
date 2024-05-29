# Frappe Better Attach Control © 2024
# Author:  Ameen Ahmed
# Company: Level Up Marketing & Software Development Services
# Licence: Please refer to LICENSE file


from .version import is_version_gt


app_name = "frappe_better_attach_control"
app_title = "Frappe Better Attach Control"
app_publisher = "Ameen Ahmed (Level Up)"
app_description = "Frappe attach control that supports customization."
app_icon = "octicon octicon-paperclip"
app_color = "blue"
app_email = "kid1194@gmail.com"
app_license = "MIT"


app_include_css = [
    "better_attach.bundle.css"
] if is_version_gt(13) else [
    "/assets/frappe_better_attach_control/css/better_attach.css"
]


better_webform_include_css = [
    "/assets/frappe_better_attach_control/css/better_attach.bundle.css"
]


app_include_js = [
    "better_attach.bundle.js"
] if is_version_gt(13) else ([
    "/assets/frappe_better_attach_control/js/better_attach_v13.bundle.js"
] if is_version_gt(12) else [
    "/assets/frappe_better_attach_control/js/better_attach_v12.bundle.js"
])


better_webform_include_js = [
    "/assets/frappe_better_attach_control/js/utils/index.js",
    "/assets/frappe_better_attach_control/js/filetypes/index.js",
    "/assets/frappe_better_attach_control/js/uploader/index.js",
    "/assets/frappe_better_attach_control/js/controls/attach.js",
    "/assets/frappe_better_attach_control/js/controls/attach_image.js"
] if is_version_gt(13) else ([
    "/assets/frappe_better_attach_control/js/utils/index.js",
    "/assets/frappe_better_attach_control/js/filetypes/index.js",
    "/assets/frappe_better_attach_control/js/uploader/v13/index.js",
    "/assets/frappe_better_attach_control/js/controls/v13/attach.js",
    "/assets/frappe_better_attach_control/js/controls/v13/attach_image.js"
] if is_version_gt(12) else [
    "/assets/frappe_better_attach_control/js/utils/index.js",
    "/assets/frappe_better_attach_control/js/filetypes/index.js",
    "/assets/frappe_better_attach_control/js/uploader/v12/index.js",
    "/assets/frappe_better_attach_control/js/controls/v12/attach.js",
    "/assets/frappe_better_attach_control/js/controls/v12/attach_image.js"
])


update_website_context = "frappe_better_attach_control.api.website.website_context"