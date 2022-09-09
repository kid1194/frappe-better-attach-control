/*
*  Frappe Better Attach Control © 2022
*  Author:  Ameen Ahmed
*  Company: Level Up Marketing & Software Development Services
*  Licence: Please refer to license.txt
*/

import is_audio from './audio.js';
import is_compressed from './compressed.js';
import { is_image, to_images_list } from './image.js';
import is_presentation from './presentation.js';
import is_spreadsheet from './spreadsheet.js';
import is_video from './video.js';
import is_word from './word.js';
import is_text from './text.js';

export function get_icon_class(url) {
    let ext = url.split('.').pop();
    if (is_audio(ext)) return 'ba-audio';
    if (is_compressed(ext)) return 'ba-compressed';
    if (is_image(ext)) return 'ba-image';
    if (['pdf', 'ps', 'eps'].indexOf(ext) >= 0) return 'ba-pdf';
    if (is_presentation(ext)) return 'ba-presentation';
    if (is_spreadsheet(ext)) return 'ba-spreadsheet';
    if (is_video(ext)) return 'ba-video';
    if (is_word(ext)) return 'ba-word';
    if (is_text(ext)) return 'ba-text';
    return 'ba-other';
}

export function make_images_list(data) {
    return to_images_list(data);
}