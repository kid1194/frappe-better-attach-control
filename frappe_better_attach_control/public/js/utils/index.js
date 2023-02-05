/*
*  Frappe Better Attach Control © 2023
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

// Common Checks
function isString(v) {
    return v != null && ofType(v, 'String');
}
function isObjectLike(v) {
    return v != null && typeof v === 'object';
}
function isNumber(v) {
    return v != null && ofType(v, 'Number') && !isNaN(v);
}
function isLength(v) {
    return isNumber(v) && v >= 0 && v % 1 == 0 && v <= 9007199254740991;
}
function isInteger(v) {
    return isNumber(v) && v === Number(parseInt(v));
}
function isArrayLike(v) {
    return v != null && !$.isFunction(v) && isObjectLike(v)
    && !$.isWindow(v) && !isInteger(v.nodeType) && isLength(v.length);
}
function isFunction(v) {
    return v != null && $.isFunction(v);
}

// Checks
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
export function isIteratable(v) {
    return isArray(v) || isObject(v);
}
export function isEmpty(v) {
    if (v == null) return true;
    if (isString(v) || isArray(v)) return !v.length;
    if (isObject(v)) return $.isEmptyObject(v);
    return !v;
}
export function isJson(v) {
    return isString(v) && parseJson(v) !== v;
}

// Json
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

// Control
export function ifNull(v, d) {
    return v != null ? v : d;
}

// Data
export function deepClone(v) {
    return isIteratable(v) ? parseJson(toJson(v)) : v;
}
export function each(data, fn, bind) {
    bind = bind || null;
    if (isArrayLike(data)) {
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

// Converter
export function toBool(v) {
    return [true, 'true', 1, '1'].indexOf(v) >= 0;
}
export function toArray(v, def) {
    if (isArray(v)) return v;
    if (def === undefined) def = [];
    if (isEmpty(v)) return def;
    if (isObject(v)) return Object.values(v);
    if (isJson(v)) {
        v = parseJson(v);
        return isArray(v) ? v : def;
    }
    return [v];
}

// Function
function fnCall(f, a, b) {
    if (isFunction(f)) return f.apply(b, toArray(a));
}

// Format
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

// Error
function elog() {
    var pre = '[Better Attach]: ';
    each(arguments, function(v) {
        if (isString(v)) console.error(pre + v);
        else console.error(pre, v);
    });
}
export function error(text, args, _throw) {
    if (_throw == null && args === true) {
        _throw = args;
        args = null;
    }
    text = '[Better Attach]: ' + text;
    if (_throw) {
        frappe.throw(__(text, args));
        return;
    }
    frappe.msgprint({
        title: __('Error'),
        indicator: 'Red',
        message: __(text, args),
    });
}

// Call
export function request(method, args, success, failed, always) {
    if (args && isFunction(args)) {
        if (isFunction(failed)) always = failed;
        if (isFunction(success)) failed = success;
        success = args;
        args = null;
    }
    let data = {type: args != null ? 'POST' : 'GET'};
    if (args != null) {
        if (!isPlainObject(args)) data.args = {'data': args};
        else {
            data.args = args;
            if (args.type && args.args) {
                data.type = args.type;
                data.args = args.args;
            }
        }
    }
    if (isString(method)) {
        data.method = 'frappe_better_attach_control.api.' + method;
    } else if (isArray(method)) {
        data.doc = method[0];
        data.method = method[1];
    } else {
        elog('The method passed is invalid', arguments);
        return;
    }
    data.error = function(e) {
        fnCall(failed);
        elog('Call error.', e);
        error('Unable to make the call to {0}', [data.method]);
    };
    if (isFunction(success)) {
        data.callback = function(ret) {
            if (ret && isPlainObject(ret)) ret = ret.message || ret;
            try {
                fnCall(success, ret);
            } catch(e) { error(e); }
        };
    }
    if (isFunction(always)) data.always = always;
    try {
        return frappe.call(data);
    } catch(e) {
        error(e);
    }
}