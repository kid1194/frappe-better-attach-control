/*
*  Frappe Better Attach Control © 2022
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
    return path.toLowerCase().split('#')[0].split('?')[0].split('/').pop();
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
        d = d.toLowerCase();
        if (d[0] === '.') d = d.substring(1, d.length);
        if (is_image(d) && ret.indexOf(d) < 0) {
            ret.push(d);
            ret.push(get_type(d));
        }
    });
    return ret;
}

export function get_file_type(ext) {
    return get_type(ext);
}