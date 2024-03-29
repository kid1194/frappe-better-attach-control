/*
*  Frappe Better Attach Control © 2023
*  Author:  Ameen Ahmed
*  Company: Level Up Marketing & Software Development Services
*  Licence: Please refer to LICENSE file
*/

import is_audio from './audio.js';
import is_compressed from './compressed.js';
import is_image from './image.js';
import is_pdf from './pdf.js';
import is_presentation from './presentation.js';
import is_spreadsheet from './spreadsheet.js';
import is_text from './text.js';
import is_video from './video.js';
import is_word from './word.js';

import get_type from './types.js';

export function get_filename(path) {
    return ((path.split('#')[0]).split('?')[0]).split('/').pop();
}

export function get_file_ext(path) {
    return get_filename(path).split('.').pop();
}

var _CLASSES = [
    'audio', 'compressed', 'image',
    'pdf', 'presentation', 'spreadsheet',
    'video', 'word', 'text', 'other'
];

function get_icon_class(ext) {
    if (is_audio(ext)) return _CLASSES[0];
    if (is_compressed(ext)) return _CLASSES[1];
    if (is_image(ext)) return _CLASSES[2];
    if (is_pdf(ext)) return _CLASSES[3];
    if (is_presentation(ext)) return _CLASSES[4];
    if (is_spreadsheet(ext)) return _CLASSES[5];
    if (is_video(ext)) return _CLASSES[6];
    if (is_word(ext)) return _CLASSES[7];
    if (is_text(ext)) return _CLASSES[8];
    return _CLASSES[9];
}

export function set_file_info(obj) {
    obj.class = get_icon_class(obj.extension);
    obj.can_preview = [0, 2, 6].indexOf(_CLASSES.indexOf(obj.class));
    return obj;
}

export function to_images_list(v) {
    var ret = [];
    v.forEach(function(d) {
        if (objectType(d) === 'String' && d.length) {
            d = d.toLowerCase();
            if (ret.indexOf(d) < 0 && is_ext_image(v)) ret.push(d);
        }
    });
    return ret;
}

export function is_ext_image(v) {
    if (v[0] === '.') v = v.substring(1, v.length);
    return v.length && (v.includes('image/') || is_image(v));
}

export function get_file_type(ext) {
    return get_type(ext);
}

function objectType(v) {
    if (v == null) return v === undefined ? 'Undefined' : 'Null';
    let t = Object.prototype.toString.call(v).slice(8, -1);
    return t === 'Number' && isNaN(v) ? 'NaN' : t;
}