from . import __version__ as app_version
from frappe import __version__ as frappe_version

app_name = "frappe_better_attach_control"
app_title = "Frappe Better Attach Control"
app_publisher = "Ameen Ahmed (Level Up)"
app_description = "Frappe attach control that supports customization."
app_icon = "octicon octicon-file-directory"
app_color = "blue"
app_email = "kid1194@gmail.com"
app_license = "MIT"
is_frappe_above_v13 = int(frappe_version.split('.')[0]) > 13

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/frappe_better_attach_control/css/select.css"
# app_include_js = "/assets/frappe_better_attach_control/js/select.js"

app_include_js = [
    'better_attach.bundle.js',
    'better_attach_image.bundle.js'
] if is_frappe_above_v13 else [
    '/assets/frappe_better_attach_control/js/better_attach.js',
    '/assets/frappe_better_attach_control/js/better_attach_image.js'
]

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "frappe_better_attach_control/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
#	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# 	"methods": "frappe_better_attach_control.utils.jinja_methods",
# 	"filters": "frappe_better_attach_control.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "frappe_better_attach_control.install.before_install"
# after_install = "frappe_better_attach_control.install.after_install"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "frappe_better_attach_control.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

# override_doctype_class = {
# 	"ToDo": "custom_app.overrides.CustomToDo"
# }

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
#	}
# }

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"frappe_better_attach_control.tasks.all"
# 	],
# 	"daily": [
# 		"frappe_better_attach_control.tasks.daily"
# 	],
# 	"hourly": [
# 		"frappe_better_attach_control.tasks.hourly"
# 	],
# 	"weekly": [
# 		"frappe_better_attach_control.tasks.weekly"
# 	],
# 	"monthly": [
# 		"frappe_better_attach_control.tasks.monthly"
# 	],
# }

# Testing
# -------

# before_tests = "frappe_better_attach_control.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "frappe_better_attach_control.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "frappe_better_attach_control.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]


# User Data Protection
# --------------------

# user_data_fields = [
# 	{
# 		"doctype": "{doctype_1}",
# 		"filter_by": "{filter_by}",
# 		"redact_fields": ["{field_1}", "{field_2}"],
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_2}",
# 		"filter_by": "{filter_by}",
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_3}",
# 		"strict": False,
# 	},
# 	{
# 		"doctype": "{doctype_4}"
# 	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# 	"frappe_better_attach_control.auth.validate"
# ]

