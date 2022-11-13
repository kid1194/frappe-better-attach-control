/*
*  Frappe Better Attach Control © 2022
*  Author:  Ameen Ahmed
*  Company: Level Up Marketing & Software Development Services
*  Licence: Please refer to LICENSE file
*/

var EXTS = (
    'conf def in ini list log text txt'
).split(' ');

export default function is_text(ext) {
    return EXTS.indexOf(ext) >= 0;
}