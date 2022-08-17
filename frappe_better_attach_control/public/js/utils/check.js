
function isVal(v) { return v != null; }

function getType(v) {
    if (!isVal(v)) return v === undefined ? 'Undefined' : 'Null';
    var type = Object.prototype.toString.call(v).slice(8, -1);
    return type === 'Number' && isNaN(v) ? 'NaN' : type;
}

function ucFirst(v) {
    v = String(v);
    return v.charAt(0).toUpperCase() + v.slice(1)
}

function ofType(v, type) { return getType(v) === ucFirst(type); }

function ofAnyType(v, type) {
    type = type.split(' ');
    for (var i = 0, l = type.length; i < l; i++) {
        if (ofType(v, type[i])) return true;
    }
    return false;
}

function getProtoOf(v) { return Object.getPrototypeOf(Object(v)); }

function isOwnProp(v, key) { return Object.prototype.hasOwnProperty.call(v, key); }

function isString(v) { return ofType(v, 'String'); }

function isFunction(v) { return /(Function|^Proxy)$/.test(getType(v)); }

function isObjectLike(v) { return isVal(v) && typeof v === 'object'; }

function isObject(v) {
    return isObjectLike(v) && isObjectLike(getProtoOf(v) || {})
    && !ofAnyType(v, 'Boolean Number String Array RegExp Date URL');
}
function isDataObject(v) {
    if (!ofType(v, 'Object')) return false;
    var p = getProtoOf(v), k = 'constructor';
    return !p || (isOwnProp(p, k) && p[k] && isFunction(p[k])
    && Function.prototype.toString.call(p[k]) === Function.prototype.toString.call(Object));
}

function isArray(v) {
    return isFunction(Array.isArray) ? Array.isArray(v) : ofType(v, 'Array') && ofType(v.length, 'Number');
}

function deepCloneObject(v) {
    var ret = {};
    for (var k in v) {
        if (isDataObject(v[k])) ret[k] = deepCloneObject(v[k]);
        else ret[k] = v[k];
    }
    return ret;
}

export {
    isVal,
    getType,
    ucFirst,
    ofType,
    ofAnyType,
    isString,
    isFunction,
    isObjectLike,
    isObject,
    isDataObject,
    isArray,
    deepCloneObject
};
