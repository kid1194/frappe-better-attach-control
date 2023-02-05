/*
*  Frappe Better Attach Control © 2023
*  Author:  Ameen Ahmed
*  Company: Level Up Marketing & Software Development Services
*  Licence: Please refer to LICENSE file
*/

var EXTS = (
    'abw clkw doc docm docx dot dotm dotx gdoc '
    + 'kwd kwt lwp odt ott wpd'
).split(' ');

export default function is_word(ext) {
    return EXTS.indexOf(ext) >= 0;
}