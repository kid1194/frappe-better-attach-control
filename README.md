# Frappe Better Attach Control

A small plugin for Frappe that adds the support of customizations to the attach control.

⚠️ **v2 is still in BETA stage** ⚠️

---

### Status
- **Desk**: 🔴 Working
- **Web Form**: 🔵 Testing

---

### Table of Contents
- [Requirements](#requirements)
- [Setup](#setup)
  - [Install](#install)
  - [Update](#update)
  - [Uninstall](#uninstall)
- [Usage](#usage)
- [Available Field Options](#available-field-options)
- [Available JavaScript Methods](#available-javascript-methods)
- [Supported Fields](#supported-fields)
- [Issues](#issues)
- [Contributors](#contributors)
- [License](#license)

---

### Requirements
- Frappe >= v12.0.0

---

### Setup

⚠️ *Important* ⚠️

*Do not forget to replace [sitename] with the name of your site in all commands.*

#### Install
1. Go to bench directory

```
cd ~/frappe-bench
```

2. Get plugin from Github

*(Required only once)*

```
bench get-app https://github.com/kid1194/frappe-better-attach-control
```

3. Build plugin

*(Required only once)*

```
bench build --app frappe_better_attach_control
```

4. Install plugin on a specific site

```
bench --site [sitename] install-app frappe_better_attach_control
```

5. Check the [usage](#usage) section below

#### Update
1. Go to app directory

```
cd ~/frappe-bench/apps/frappe_better_attach_control
```

2. Get updates from Github

```
git pull
```

3. Go to bench directory

```
cd ~/frappe-bench
```

4. Build plugin

```
bench build --app frappe_better_attach_control
```

5. Update a specific site

```
bench --site [sitename] migrate
```

6. (Optional) Restart bench

```
bench restart
```

#### Uninstall
1. Go to bench directory

```
cd ~/frappe-bench
```

2. Uninstall plugin from a specific site

```
bench --site [sitename] uninstall-app frappe_better_attach_control
```

3. Remove plugin from bench

```
bench remove-app frappe_better_attach_control
```

4. (Optional) Restart bench

```
bench restart
```

---

### Usage
1. Go to Customization > Customize Form
2. Enter the form type/name (Ex: 'User')
3. Scroll down to the form fields area
4. Create an **Attach** or **Attach Image** field or edit an existing custom field
5. Inside the field's custom property, **Better Attach Options**, add a JSON object of the customizations you want. Example:
```
{"allowed_file_types": ["jpg", "png", "gif"]}
```

ℹ️ **Notes**
1. **You can't modify the original fields of a doctype, so create a new field or clone and modify the entire doctype.**
2. **The plugin creates a custom field property called Better Attach Options to protect the plugin customizations from any modification and to make the plugin work in web forms.**

---

### Available Field Options
| Option | Description |
| :--- | :--- |
| `dialog_title` 🔴 | Upload dialog title to be displayed (✴️Frappe >= v14.0.0).<br/><br/>- Example: `"Upload Images"`<br/>- Default: `"Upload"` |
| `upload_notes` | Upload text to be displayed.<br/><br/>- Example: `"Only images and videos, with maximum size of 2MB, are allowed to be uploaded"`<br/>- Default: `""` |
| `disable_file_browser` 🔴 | Disable file browser uploads.<br/><br/>- Default: `false` |
| `allow_multiple` | Allow multiple uploads.<br/><br/>⚠️ *(Field value is a JSON array of files url)*<br/>- Default: `false` |
| `max_file_size` | Maximum file size (in bytes) that is allowed to be uploaded.<br/><br/>- Example: `2048` for `2KB`<br/>- Default: `Value of maximum file size in Frappe's settings` |
| `allowed_file_types` | Array of allowed file types (mimes) or extensions to upload.<br/><br/>- Example: `["image/*", "video/*", ".pdf", ".doc"]`<br/>- Default: `null` or `["image/*"]` |
| `max_number_of_files` | Maximum number of files allowed to be uploaded if multiple upload is allowed.<br/><br/>⚠️ *(Bypassing the maximum attachments of doctype might not work)*<br/>- Example: `4`<br/>- Default: `Value of maximum attachments set for the doctype` |
| `crop_image_aspect_ratio` | Crop aspect ratio for images (Frappe >= v14.0.0).<br/><br/>- Example: `1` or `16/9` or `4/3`<br/>- Default: `null` |
| `as_public` | Force uploads to be saved in public folder by default.<br/><br/>- Default: `false` |
| `allowed_filename` 🔴 | Only allow files that match a specific file name to be uploaded.<br/><br/>- Example: (String)`"picture.png"` or (RegExp String)`"/picture\-([0-9]+)\.png/"` or (RegExp)`/picture\-([0-9]+)\.png/`<br/>- Default: `null` |
| `allow_reload` | Allow reloading attachments (✴️Frappe >= v13.0.0).<br>ℹ️ Affect the visibility of the reload button.ℹ️<br/><br/>- Default: `true` |
| `allow_remove` | Allow removing and clearing attachments.<br>ℹ️ Affect the visibility of the remove and clear buttons.ℹ️<br/><br/>- Default: `true` |

---

### Available JavaScript Methods
| Method | Description |
| :--- | :--- |
| `enable_reload()` | Allow reloading attachments and show the reload button (Frappe >= v13.0.0). |
| `disable_reload()` | Deny reloading attachments and hide reload button (Frappe >= v13.0.0). |
| `enable_remove()` | Allow removing and clearing attachments and show the clear and remove buttons. |
| `disable_remove()` | Deny removing and clearing attachments and hide the clear and remove buttons. |
| `show_files()` | Show the list of uploaded files in a dialog (Only when multiple files is allowed). |

---

### Supported Fields
- Attach
- Attach Image

---

### Issues
If you find bug in the plugin, please create a [bug report](https://github.com/kid1194/frappe-better-attach-control/issues/new?assignees=kid1194&labels=bug&template=bug_report.md&title=%5BBUG%5D) and let us know about it.

---

### Contributors
**The list of people who deserves more than a simple thank you.**
- [CA. B.C.Chechani](https://github.com/chechani) ✌ (v1 Testing & Debugging)
- [MohsinAli](https://github.com/mohsinalimat) ❤ (v2 Testing & Debugging)
- [Robert C](https://github.com/robert1112) 👍 (v2 Testing & Debugging)

---

### License
This repository has been released under the [MIT License](https://github.com/kid1194/frappe-better-attach-control/blob/main/LICENSE).
