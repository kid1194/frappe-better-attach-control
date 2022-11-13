/*
*  Frappe Better Attach Control © 2022
*  Author:  Ameen Ahmed
*  Company: Level Up Marketing & Software Development Services
*  Licence: Please refer to LICENSE file
*/

import is_audio from './audio.js';
import is_compressed from './compressed.js';
import is_image from './image.js';
import is_pdocument from './pdocument.js';
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

export function get_icon_class(path) {
    var ext = get_file_ext(path);
    if (is_audio(ext)) return 'audio';
    if (is_compressed(ext)) return 'compressed';
    if (is_image(ext)) return 'image';
    if (is_pdocument(ext)) return 'pdf';
    if (is_presentation(ext)) return 'presentation';
    if (is_spreadsheet(ext)) return 'spreadsheet';
    if (is_video(ext)) return 'video';
    if (is_word(ext)) return 'word';
    if (is_text(ext)) return 'text';
    return 'other';
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