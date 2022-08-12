# Frappe Better Attach Control
A small plugin for Frappe that adds the support of customizations to the attach control.

### Table of Contents
<ul>
    <li><a href="#requirements">Requirements</a></li>
    <li>
    <a href="#setup">Setup</a>
        <ul>
            <li><a href="#install">Install</a></li>
            <li><a href="#update">Update</a></li>
            <li><a href="#uninstall">Uninstall</a></li>
        </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#available-options">Available Options</a></li>
    <li><a href="#supported-fields">Supported Fields</a></li>
    <li><a href="#todo">ToDo</a></li>
    <li><a href="#license">License</a></li>
</ul>

---

### Requirements
- Frappe >= v13.0.0

---

### Setup

#### Install
1. Get the plugin from Github

*(Required only once)*

`bench get-app https://github.com/kid1194/frappe-better-attach-control`

2. Install the plugin on any instance/site you want

`bench --site [sitename] install-app frappe_better_attach_control`

3. Check the usage section below

#### Update
1. Go to the app directory (frappe-bench/apps/frappe_better_attach_control) and execute:

`git pull`

2. Go back to the frappe-bench directory and execute:

`bench --site [sitename] migrate`

3. *In case you need to restart bench, execute:*

`bench restart`

#### Uninstall
1. Uninstall the plugin from the instance/site

`bench --site [sitename] uninstall-app frappe_better_attach_control`

2. Uninstall the plugin from bench

`bench remove-app frappe_better_attach_control`

---

### Usage
1. Go to Customization > Customize Form
2. Enter the form type/name (Ex: 'User')
3. Scroll down to the form fields area and edit the `Attach` or `Attach Image` fields you want
4. In the `options` property of the fields, add a JSON object of the customizations you want. Example: `{"allowed_file_types": ["jpg", "png", "gif"]}`

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
            <p><i>(Not fully supported)</i></p>
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
</table>

---

### Supported Fields
- Attach
- Attach Image

---

### ToDo
- HTML display for multiple files upload in `Attach` control
- Display popover for multiple files upload in `Attach Image` control

---

### License
MIT
