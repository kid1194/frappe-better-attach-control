/*
*  Frappe Better Attach Control © 2022
*  Author:  Ameen Ahmed
*  Company: Level Up Marketing & Software Development Services
*  Licence: Please refer to LICENSE file
*/

var EXTS = (
    'pdf ps eps'
).split(' ');

export default function is_pdocument(ext) {
    return EXTS.indexOf(ext) >= 0;
}