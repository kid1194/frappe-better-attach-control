# Frappe Better Attach Control

A small plugin for Frappe that adds the support of customizations to the attach control.

---

### Table of Contents
- [Requirements](#requirements)
- [Setup](#setup)
  - [Install](#install)
  - [Update](#update)
  - [Uninstall](#uninstall)
- [Usage](#usage)
- [Available Options](#available-options)
- [Supported Fields](#supported-fields)
- [Issues](#issues)
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

5. Check the usage section below

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
3. Scroll down to the form fields area and create an *Attach* or *Attach Image* field or edit an existing custom field
4. In the *options* property of the fields, add a JSON object of the customizations you want. Example:
```
{"allowed_file_types": ["jpg", "png", "gif"]}
```

ℹ️ **Note: You can't modify the original fields of a doctype, so create a new field or clone and modify the entire doctype.**

---

### Available Options
<table>
    <tr>
        <td><code>upload_notes</code></td>
        <td>
            <p>Upload text to be displayed.</p>
            <p><i>Example: <code>"Only allowed to upload images and video, with maximum size of 2MB"</code></i></p>
            <p><i>Default: <code>""</code></i></p>
        </td>
    </tr>
    <tr>
        <td><code>allow_multiple</code></td>
        <td>
            <p>Allow multiple uploads.</p>
            <p>⚠️<i>(Field value is a JSON array of files url)</i></p>
            <p><i>Default: <code>false</code></i></p>
        </td>
    </tr>
    <tr>
        <td><code>max_file_size</code></td>
        <td>
            <p>Maximum file size (in bytes) that is allowed to be uploaded.</p>
            <p><i>Example: <code>2048</code> for <code>2KB</code></i></p>
            <p><i>Default: <code>Value of maximum file size in Frappe's settings</code></i></p>
        </td>
    </tr>
    <tr>
        <td><code>allowed_file_types</code></td>
        <td>
            <p>Array of allowed file types (mimes) or extensions to upload.</p>
            <p><i>Example: <code>["image/*", "video/*", ".pdf", ".doc"]</code></i></p>
            <p><i>Default: <code>null</code> or <code>["image/*"]</code></i></p>
        </td>
    </tr>
    <tr>
        <td><code>max_number_of_files</code></td>
        <td>
            <p>Maximum number of files allowed to be uploaded if multiple upload is allowed.</p>
            <p>⚠️<i>(Bypassing the maximum attachments of doctype might not work)</i></p>
            <p><i>Example: <code>4</code></i></p>
            <p><i>Default: <code>Value of maximum attachments set for the doctype</code></i></p>
        </td>
    </tr>
    <tr>
        <td><code>crop_image_aspect_ratio</code></td>
        <td>
            <p>Crop aspect ratio for images (Frappe >= v14.0.0).</p>
            <p><i>Example: <code>1</code> or <code>16/9</code> or <code>4/3</code></i></p>
            <p><i>Default: <code>1</code></i></p>
        </td>
    </tr>
    <tr>
        <td><code>as_public</code></td>
        <td>
            <p>Force uploads to be saved in public folder</p>
            <p><i>Default: <code>false</code></i></p>
        </td>
    </tr>
</table>

---

### Supported Fields
- Attach
- Attach Image

---

### Issues
If you find bug in the plugin, please create a [bug report](https://github.com/kid1194/frappe-better-attach-control/issues/new?assignees=&labels=&template=bug_report.md&title=) and let us know about it.

---

### License
This repository has been released under the [MIT License](https://github.com/kid1194/frappe-better-attach-control/blob/main/LICENSE).
