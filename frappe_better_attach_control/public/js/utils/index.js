/*
*  Frappe Better Attach Control © 2022
*  Author:  Ameen Ahmed
*  Company: Level Up Marketing & Software Development Services
*  Licence: Please refer to license.txt
*/

export function deepCloneObject(v) {
    var ret = {};
    if (!$.isPlainObject(v)) return ret;
    for (var k in v) {
        let y = v[k];
        if ($.isPlainObject(y)) y = deepCloneObject(y);
        else if (Array.isArray(y)) y = deepCloneArray(y);
        ret[k] = y;
    }
    return ret;
}

export function deepCloneArray(v) {
    var ret = [];
    if (!Array.isArray(v)) return ret;
    v.forEach(function(d) {
        let y = d;
        if (Array.isArray(y)) y = deepCloneArray(y);
        else if ($.isPlainObject(y)) y = deepCloneObject(y);
        ret.push(y);
    });
    return ret;
}

export function valToArray(v, def, loose) {
    if (!Array.isArray(v)) {
        if (frappe.utils.is_json(v)) {
            try {
                v = JSON.parse(v);
            } catch(e) {
                v = null;
            }
        }
    }
    if (!loose && !Array.isArray(def)) def = [];
    if (!Array.isArray(v)) v = def;
    return v;
}

var FILE_SIZES = ['B', 'KB', 'MB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

export function formatSize(v) {
    v = parseFloat(v);
    if (!v) return '0 ' + FILE_SIZES[0];
    var k = 1024,
    i = Math.floor(Math.log(v) / Math.log(k)),
    t = v / Math.pow(k, i);
    if ((k - t) < 1) {
        i++;
        t = v / Math.pow(k, i);
    }
    return flt(t, 2, '#,###.##') + ' ' + FILE_SIZES[i];
}