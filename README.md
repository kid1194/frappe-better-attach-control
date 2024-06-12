# Frappe Better Attach Control

A small plugin for Frappe that adds customization to the attach control.
It supports RTL layout and dark mode out of the box.

⚠️ **v2 is still in BETA stage** ⚠️

![v2 Beta17](https://img.shields.io/badge/v2_Beta17-2024/06/13-green?style=plastic)

**Apologies in advance for any problem or bug you face with this module.**
**Please report any problem or bug you face so it can be fixed.**

---

<p align="center">
    <img src="https://github.com/kid1194/frappe-better-attach-control/blob/main/images/screenshot_1.png?raw=true" alt="Better Attach Control"/>
</p>
<p align="center">
    <img src="https://github.com/kid1194/frappe-better-attach-control/blob/main/images/screenshot_2.png?raw=true" alt="Better Attach Control"/>
</p>
<p align="center">
    <img src="https://github.com/kid1194/frappe-better-attach-control/blob/main/images/screenshot_3.png?raw=true" alt="Better Attach Control"/>
</p>

---

### Status
- **Desk**: 🔵 Testing
- **Web Form**: 🔵 Testing

---

### Special Thanks 
**A simple display of gratitude and appreciation to those who provided helped and kind support.**
#### Version 2
- [![MohsinAli](https://img.shields.io/badge/MohsinAli-Debug_%7C_Test_%7C_Fix-red?style=plastic)](https://github.com/mohsinalimat)
- [![Robert C](https://img.shields.io/badge/Robert_C-Debug_%7C_Test-blue?style=plastic)](https://github.com/robert1112)
- [![NirajRegmi](https://img.shields.io/badge/NirajRegmi-Debug_%7C_Test-blue?style=plastic)](https://github.com/NirajRegmi)
- [![galaxlabs](https://img.shields.io/badge/galaxlabs-Enhancement-a2eeef?style=plastic)](https://github.com/galaxlabs)
#### Version 1
- [![CA. B.C.Chechani](https://img.shields.io/badge/CA._B.C.Chechani-Debug_%7C_Test-blue?style=plastic)](https://github.com/chechani)

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

⚠️ **Do not forget to replace [sitename] with the name of your site in all commands.** ⚠️

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

6. (Optional) Restart bench to clear cache

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

4. (Optional) Restart bench to clear cache

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

    Ex: ```{"allowed_file_types": [".jpg", ".png", ".gif"]}```

##### ⚠️ Remember
You can't modify the original fields of a doctype, so create a new field or clone and modify the entire doctype.

---

### Available Field Options
| Option | Description |
| :--- | :--- |
| **dialog_title** | Upload dialog title to be displayed ️(🔶Frappe >= v14.0.0).<br /><br />🔹Example: **"Upload Images"**<br />🔹Default: **"Upload"** |
| **upload_notes** | Upload text to be displayed.<br /><br />🔹Example: **"Only images and videos, with maximum size of 2MB, are allowed to be uploaded"**<br />🔹Default: **""** |
| **disable_auto_save** | Disable form auto save after upload.<br /><br />🔹Default: **false** |
| **disable_file_browser** | Disable file browser uploads.<br /><br />⚠️ *(File browser is always disabled in Web Form)*<br /><br />🔹Default: **false** |
| **allow_multiple** | Allow multiple uploads.<br /><br />⚠️ *(Field value is a JSON array of files url)*<br /><br />🔹Default: **false** |
| **max_file_size** | Maximum file size (in bytes) that is allowed to be uploaded.<br /><br />🔹Example: **2048** for **2KB**<br />🔹Default: **Value of maximum file size in Frappe's settings** |
| **allowed_file_types** | Array of allowed file types (mimes) or extensions to upload. Prefix escaped RegExp string types with **$**.<br /><br />⚠️ *(File extensions must have a leading dot ".")*<br />⚠️ *(RegExp string types will not be used to in HTML accept attribute)*<br /><br />🔹Example: **["image/*", "video/*", ".pdf", ".doc", "$audio\/([a-z]+)"]**<br />🔹Default: **null** or **["image/*"]** |
| **max_number_of_files** | Maximum number of files allowed to be uploaded if multiple upload is allowed.<br /><br />⚠️ *(Bypassing the maximum attachments of doctype might not work)*<br /><br />🔹Example: **4**<br />🔹Default: **Value of maximum attachments set for the doctype** |
| **crop_image_aspect_ratio** | Crop aspect ratio for images (🔶Frappe >= v14.0.0).<br /><br />🔹Example: **1** or **16/9** or **4/3**<br />🔹Default: **null** |
| **as_public** | Force uploads to be saved in public folder by default.<br /><br />🔹Default: **false** |
| **allowed_filename** | Only allow files that match a specific file name to be uploaded.<br /><br />🔹Example: (String)**"picture.png"** or (RegExp String)**"/picture\-([0-9]+)\.png/"**<br />🔹Default: **null** |
| **allow_reload** | Allow reloading attachments (🔶Frappe >= v13.0.0).<br /><br />🔶 Affect the visibility of the reload button.🔶<br /><br />🔹Default: **true** |
| **allow_remove** | Allow removing and clearing attachments.<br /><br />🔶 Affect the visibility of the remove and clear buttons.🔶<br /><br />🔹Default: **true** |
| **users** 🔴 | Array of custom options for a specific user or group of users.<br /><br />🔹Example: **[{"for": "Guest", "disabled": true}, {"for": ["Administrator", "user"], "allow_multiple": true}]**<br />🔹Default: **null** |
| **roles** 🔴 | Array of custom options for a specific role or group of roles.<br />⚠️ *(Custom options for users is prioritized over roles.)*<br /><br />🔹Example: **[{"for": ["Administrator", "System"], "allow_multiple": true}]**<br />🔹Default: **null** |

🔴 New - 🔶 Changed

---

### Available JavaScript Methods
| Method | Description |
| :--- | :--- |
| **toggle_auto_save(enable: Boolean !Optional)** 🔶 | Enable/Disable form auto save after upload. |
| **toggle_reload(allow: Boolean !Optional)** | Allow/Deny reloading attachments and toggle the reload button (🔶Frappe >= v13.0.0). |
| **toggle_remove(allow: Boolean !Optional)** | Allow/Deny removing and clearing attachments and toggle the clear and remove buttons. |
| **set_options(options: JSON Object)** | Set or change the plugin options.  |

🔴 New - 🔶 Changed

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