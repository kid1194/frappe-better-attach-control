/*
*  Frappe Better Attach Control © 2022
*  Author:  Ameen Ahmed
*  Company: Level Up Marketing & Software Development Services
*  Licence: Please refer to LICENSE file
*/


// Helpers
function objectType(v) {
    if (v == null) return v === undefined ? 'Undefined' : 'Null';
    let t = Object.prototype.toString.call(v).slice(8, -1);
    return t === 'Number' && isNaN(v) ? 'NaN' : t;
}
function ofType(v, t) {
    return objectType(v) === t;
}
function ofAny(v, t) {
    return t.split(' ').indexOf(objectType(v)) >= 0;
}
function propertyOf(v, k) {
    return Object.prototype.hasOwnProperty.call(v, k);
}
function isObjectLike(v) {
    return v != null && typeof v === 'object';
}

export function getVersion() {
    frappe.provide('frappe.boot.versions');
    var ver = frappe.boot.versions.frappe || '0';
    return cint(ver.split('.')[0]);
}

export function isArray(v) {
    return v != null && $.isArray(v);
}

export function isObject(v) {
    return isObjectLike(v)
        && isObjectLike(Object.getPrototypeOf(Object(v)) || {})
        && !ofAny(v, 'String Number Boolean Array RegExp Date URL');
}

export function isPlainObject(v) {
    return v != null && $.isPlainObject(v);
}

export function isFunction(v) {
    return v != null && $.isFunction(v);
}

export function isIteratable(v) {
    return isArray(v) || isObject(v);
}

export function isJson(v) {
    try {
		JSON.parse(v);
	} catch(e) {
		return false;
	}
	return true;
}

export function deepClone(v) {
    return isIteratable(v)
        ? JSON.parse(JSON.stringify(v))
        : v;
}

export function each(data, fn, bind) {
    bind = bind || null;
    if (isArray(data)) {
        for (var i = 0, l = data.length; i < l; i++) {
            if (fn.apply(bind, [data[i], i]) === false) return;
        }
    } else if (isObject(data)) {
        for (var k in data) {
            if (fn.apply(bind, [data[k], k]) === false) return;
        }
    }
}

export function clear(d) {
    if (isArray(d)) d.splice(0, d.length);
    else if (isObject(d)) {
        for (let k in d) {
            if (propertyOf(d, k)) delete d[k];
        }
    }
    return d;
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

export function fn(fn, cls) {
    return function() {
        var args = arguments;
        if (this != null) Array.prototype.push.call(args, this);
        return isFunction(fn) && fn.apply(cls, args);
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