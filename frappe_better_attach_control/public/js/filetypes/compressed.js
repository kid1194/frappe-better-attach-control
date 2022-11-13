/*
*  Frappe Better Attach Control © 2022
*  Author:  Ameen Ahmed
*  Company: Level Up Marketing & Software Development Services
*  Licence: Please refer to LICENSE file
*/

var EXTS = (
    'zip rar gz tar 7z ace cab cfs dgc gca lha lzh boz bz bz2'
).split(' ');

export default function is_compressed(ext) {
    return EXTS.indexOf(ext) >= 0;
}