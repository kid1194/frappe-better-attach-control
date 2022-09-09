/*
*  Frappe Better Attach Control © 2022
*  Author:  Ameen Ahmed
*  Company: Level Up Marketing & Software Development Services
*  Licence: Please refer to license.txt
*/

var EXTS = (
    'abw clkw doc docm docx dot dotm dotx gdoc '
    + 'kwd kwt lwp odt ott wpd'
).split(' ');

export default function is_word(ext) {
    return EXTS.indexOf(ext) >= 0;
}