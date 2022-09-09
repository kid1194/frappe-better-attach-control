/*
*  Frappe Better Attach Control © 2022
*  Author:  Ameen Ahmed
*  Company: Level Up Marketing & Software Development Services
*  Licence: Please refer to license.txt
*/

export default function deepCloneObject(v) {
    var ret = {};
    if (!$.isPlainObject(v)) return ret;
    for (var k in v) {
        if ($.isPlainObject(v[k])) ret[k] = deepCloneObject(v[k]);
        else ret[k] = v[k];
    }
    return ret;
}