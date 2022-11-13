/*
*  Frappe Better Attach Control © 2022
*  Author:  Ameen Ahmed
*  Company: Level Up Marketing & Software Development Services
*  Licence: Please refer to LICENSE file
*/

var EXTS = (
    'csv gsheet ods ots xla xlam xlc xlm xls xlsb xlsm xlsx xlt xltm xltx xlw xml'
).split(' ');

export default function is_spreadsheet(ext) {
    return EXTS.indexOf(ext) >= 0;
}