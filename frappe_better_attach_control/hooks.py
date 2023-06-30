# Frappe Better Attach Control © 2023
# Author:  Ameen Ahmed
# Company: Level Up Marketing & Software Development Services
# Licence: Please refer to LICENSE file


from . import __version__ as app_version
from frappe import __version__ as frappe_version


app_name = "frappe_better_attach_control"
app_title = "Frappe Better Attach Control"
app_publisher = "Ameen Ahmed (Level Up)"
app_description = "Frappe attach control that supports customization."
app_icon = "octicon octicon-paperclip"
app_color = "blue"
app_email = "kid1194@gmail.com"
app_license = "MIT"


is_frappe_above_v13 = int(frappe_version.split('.')[0]) > 13
is_frappe_above_v12 = int(frappe_version.split('.')[0]) > 12


app_include_css = [
    'better_attach.bundle.css'
] if is_frappe_above_v13 else [
    '/assets/frappe_better_attach_control/css/better_attach.css'
]
better_webform_include_css = [
    '/assets/frappe_better_attach_control/css/better_attach.bundle.css'
]


app_include_js = [
    'better_attach.bundle.js'
] if is_frappe_above_v13 else ([
    '/assets/frappe_better_attach_control/js/better_attach.js'
] if is_frappe_above_v12 else [
    '/assets/frappe_better_attach_control/js/better_attach_v12.js'
])
better_webform_include_js = [
    '/assets/frappe_better_attach_control/js/better_attach_webform.js'
] if is_frappe_above_v13 else ([
    '/assets/frappe_better_attach_control/js/better_attach_webform_v13.js'
] if is_frappe_above_v12 else [
    '/assets/frappe_better_attach_control/js/better_attach_webform_v12.js'
])


update_website_context = "frappe_better_attach_control.api.website.website_context"