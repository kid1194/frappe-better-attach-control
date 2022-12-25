# Frappe Better Attach Control © 2022
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


is_frappe_above_v14 = int(frappe_version.split('.')[0]) >= 14
is_frappe_above_v13 = int(frappe_version.split('.')[0]) > 13
is_frappe_above_v12 = int(frappe_version.split('.')[0]) > 12

print("is_frappe_above_v14 : {0}".format( is_frappe_above_v14))

app_include_css = [
    'better_attach.bundle.css'
] if is_frappe_above_v13 else [
    '/assets/frappe_better_attach_control/css/better_attach.css'
]

app_include_js = [
    'better_attach_v14.bundle.js'
] if is_frappe_above_v14  else ([
    'better_attach.bundle.js'
] if is_frappe_above_v13 else ([
    '/assets/frappe_better_attach_control/js/better_attach.js'
] if is_frappe_above_v12 else [
    '/assets/frappe_better_attach_control/js/better_attach_v12.js'
]))