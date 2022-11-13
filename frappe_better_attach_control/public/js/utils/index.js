/*
*  Frappe Better Attach Control © 2022
*  Author:  Ameen Ahmed
*  Company: Level Up Marketing & Software Development Services
*  Licence: Please refer to LICENSE file
*/


export function getVersion() {
    frappe.provide('frappe.boot.versions');
    var ver = frappe.boot.versions.frappe || '0';
    return cint(ver.split('.')[0]);
}

export function isArray(v) { return Array.isArray(v); }

export function isObject(v) { return $.isPlainObject(v); }

export function isClass(v) { return v && typeof v === 'object'; }

export function isJson(v) {
    try {
		JSON.parse(v);
	} catch(e) {
		return false;
	}
	return true;
}

export function deepClone(v) {
    return isArray(v) || isObject(v)
        ? JSON.parse(JSON.stringify(v))
        : v;
}

export function each(data, fn, bind) {
    bind = bind || null;
    if (isArray(data)) {
        for (var i = 0, l = data.length; i < l; i++) {
            if (fn.apply(bind, [data[i], i]) === false) return;
        }
    } else if (isClass(data)) {
        for (var k in data) {
            if (fn.apply(bind, [data[k], k]) === false) return;
        }
    }
}

export function parseJson(v) {
	try {
		return JSON.parse(v);
	} catch(e) {
		return v;
	}
}

export function toJson(v) {
	try {
		return JSON.stringify(v);
	} catch(e) {
	    return '';
	}
}

export function toArray(v, def, loose) {
    if (!isArray(v)) v = parseJson(v);
    if (isArray(v)) return v;
    return !loose && !isArray(def) ? [] : def;
}

export function bindFn(fn, cls) {
    return function() {
        return fn && fn.apply(cls, arguments);
    };
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