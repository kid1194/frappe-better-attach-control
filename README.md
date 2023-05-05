# Frappe Better Attach Control

A small plugin for Frappe that adds customization to the attach control.
It supports RTL layout and dark mode out of the box.

⚠️ **v2 is still in BETA stage** ⚠️

---

**If you would like to buy me a cup of coffee 😎**

[![](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=ZWZ4TK5PG7G8W)

---

### Status
- **Desk**: 🔵 Testing
- **Web Form**: 🔵 Testing

---

### Special Thanks 
**A simple display of gratitude and appreciation to those who provided helped and kind support.**
#### Version 2
- [MohsinAli](https://github.com/mohsinalimat) (Testing - Debugging - Bug Fixing)
- [Robert C](https://github.com/robert1112) (Testing - Debugging)
#### Version 1
- [CA. B.C.Chechani](https://github.com/chechani) (Testing - Debugging)

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
- [License](#license)

---

### Requirements
- Frappe >= v12.0.0

---

### Setup

⚠️ *Do not forget to replace [sitename] with the name of your site in all commands.* ⚠️

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
2. Enter the form doctype (Ex: 'User')
3. Scroll down to the fields area
4. Create an **Attach** or **Attach Image** field or edit an existing custom field
5. Inside the field's **Options** property, add the options you want as a JSON string.

    Ex: `{"allowed_file_types": [".jpg", ".png", ".gif"]}`

##### Remember
You can't modify the original fields of a doctype, so create a new field or clone and modify the entire doctype.

---

### Available Field Options
| Option | Description |
| :--- | :--- |
| `dialog_title` 🔴 | Upload dialog title to be displayed (✴️Frappe >= v14.0.0).<br/><br/>- Example: `"Upload Images"`<br/>- Default: `"Upload"` |
| `upload_notes` | Upload text to be displayed.<br/><br/>- Example: `"Only images and videos, with maximum size of 2MB, are allowed to be uploaded"`<br/>- Default: `""` |
| `disable_file_browser` 🔴 | Disable file browser uploads.<br/><br/>⚠️ *(File browser is always disabled in Web Form)*<br/><br/>- Default: `false` |
| `allow_multiple` | Allow multiple uploads.<br/><br/>⚠️ *(Field value is a JSON array of files url)*<br/><br/>- Default: `false` |
| `max_file_size` | Maximum file size (in bytes) that is allowed to be uploaded.<br/><br/>- Example: `2048` for `2KB`<br/>- Default: `Value of maximum file size in Frappe's settings` |
| `allowed_file_types` | Array of allowed file types (mimes) or extensions to upload. Prefix escaped RegExp string types with **$**.<br/><br/>⚠️ *(File extensions must have a leading dot ".")*<br/>⚠️ *(RegExp string types will not be used to in HTML accept attribute)*<br/><br/>- Example: `["image/*", "video/*", ".pdf", ".doc", "$audio\/([a-z]+)"]`<br/>- Default: `null` or `["image/*"]` |
| `max_number_of_files` | Maximum number of files allowed to be uploaded if multiple upload is allowed.<br/><br/>⚠️ *(Bypassing the maximum attachments of doctype might not work)*<br/><br/>- Example: `4`<br/>- Default: `Value of maximum attachments set for the doctype` |
| `crop_image_aspect_ratio` | Crop aspect ratio for images (✴️Frappe >= v14.0.0).<br/><br/>- Example: `1` or `16/9` or `4/3`<br/>- Default: `null` |
| `as_public` | Force uploads to be saved in public folder by default.<br/><br/>- Default: `false` |
| `allowed_filename` 🔴 | Only allow files that match a specific file name to be uploaded.<br/><br/>- Example: (String)`"picture.png"` or (RegExp String)`"/picture\-([0-9]+)\.png/"`<br/>- Default: `null` |
| `allow_reload` | Allow reloading attachments (✴️Frappe >= v13.0.0).<br/><br/>ℹ️ Affect the visibility of the reload button.ℹ️<br/><br/>- Default: `true` |
| `allow_remove` | Allow removing and clearing attachments.<br/><br/>ℹ️ Affect the visibility of the remove and clear buttons.ℹ️<br/><br/>- Default: `true` |

---

### Available JavaScript Methods
| Method | Description |
| :--- | :--- |
| `enable_reload()` | Allow reloading attachments and show the reload button (Frappe >= v13.0.0). |
| `disable_reload()` | Deny reloading attachments and hide reload button (Frappe >= v13.0.0). |
| `enable_remove()` | Allow removing and clearing attachments and show the clear and remove buttons. |
| `disable_remove()` | Deny removing and clearing attachments and hide the clear and remove buttons. |
| `set_options(JSON)` | Set or change the plugin current options.  |

---

### Supported Fields
- Attach
- Attach Image

---

### Issues
If you find bug in the plugin, please create a [bug report](https://github.com/kid1194/frappe-better-attach-control/issues/new?assignees=kid1194&labels=bug&template=bug_report.md&title=%5BBUG%5D) and let us know about it.

---

### License
This repository has been released under the [MIT License](https://github.com/kid1194/frappe-better-attach-control/blob/main/LICENSE).
