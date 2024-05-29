/*
*  Frappe Better Attach Control © 2024
*  Author:  Ameen Ahmed
*  Company: Level Up Marketing & Software Development Services
*  Licence: Please refer to LICENSE file
*/


var Helpers = {
    $type: function(v) {
        if (v == null) return v === void 0 ? 'Undefined' : 'Null';
        var t = Object.prototype.toString.call(v).slice(8, -1);
        return t === 'Number' && isNaN(v) ? 'NaN' : t;
    },
    $of: function(v, t) { return this.$type(v) === t; },
    $ofAny: function(v, t) { return t.split(' ').indexOf(this.$type(v)) >= 0; },
    $propOf: function(v, k) { return Object.prototype.hasOwnProperty.call(v, k); },
    
    // Common Checks
    isString: function(v) { return this.$of(v, 'String'); },
    isObjectLike: function(v) { return v != null && typeof v === 'object'; },
    isNumber: function(v) { return this.$of(v, 'Number') && !isNaN(v); },
    isLength: function(v) {
        return this.isNumber(v) && v >= 0 && v % 1 == 0 && v <= 9007199254740991;
    },
    isInteger: function(v) { return this.isNumber(v) && v === Number(parseInt(v)); },
    isArrayLike: function(v) {
        return v && !this.isString(v) && !$.isFunction(v) && !$.isWindow(v)
        && this.isObjectLike(v) && !this.isInteger(v.nodeType) && this.isLength(v.length);
    },
    isFunction: function(v) { return v && $.isFunction(v); },
    
    // Checks
    isArray: function(v) { return v && $.isArray(v); },
    isObject: function(v) {
        return this.isObjectLike(v)
            && this.isObjectLike(Object.getPrototypeOf(Object(v)) || {})
            && !this.$ofAny(v, 'String Number Boolean Array RegExp Date URL');
    },
    isPlainObject: function(v) { return v && $.isPlainObject(v); },
    isIteratable: function(v) { return this.isArrayLike(v) || this.isObject(v); },
    isEmpty: function(v) {
        if (v == null) return true;
        if (this.isString(v) || this.isArrayLike(v)) return !v.length;
        if (this.isObject(v)) {
            for (var k in v) if (this.$propOf(v, k)) return false;
        }
        return !v;
    },
    isJson: function(v) { return this.parseJson(v, null) !== null; },
    isRegExp: function(v) { return this.$of(v, 'RegExp'); },
    
    // Json
    parseJson: function(v, d) {
        try { return JSON.parse(v); } catch(_) {}
        return d === void 0 ? v : d;
    },
    toJson: function(v) {
        try { return JSON.stringify(v); } catch(_) {}
        return '';
    },
    
    // Control
    ifNull: function(v, d) { return v != null ? v : d; },
    
    // Data
    each: function(data, fn, bind) {
        fn = this.fnBind(fn, bind || this);
        if (this.isArrayLike(data)) {
            for (var i = 0, l = data.length; i < l; i++) {
                if (fn(data[i], i) === false) return;
            }
        } else if (this.isObject(data)) {
            for (var k in data) {
                if (fn(data[k], k) === false) return;
            }
        }
    },
    filter: function(data, fn, bind) {
        if (!this.isIteratable(data)) return;
        fn = this.fnBind(fn, bind || this);
        var arr = this.isArrayLike(data),
        ret = arr ? [] : {};
        this.each(data, function(v, k) {
            if (fn(v, k) !== false) arr ? ret.push(v) : (ret[k] = v);
        });
        return ret;
    },
    map: function(data, fn, bind) {
        if (!this.isIteratable(data)) return;
        fn = this.fnBind(fn, bind || this);
        this.each(data, function(v, k) { data[k] = fn(v, k); });
        return data;
    },
    clear: function(d) {
        if (this.isArray(d)) d.splice(0, d.length);
        else if (this.isObject(d)) {
            for (var k in d) {
                if (this.$propOf(d, k)) delete d[k];
            }
        }
        return d;
    },
    deepClone: function(v) {
        if (!this.isIteratable(v)) return v;
        var arr = this.isArrayLike(v),
        ret = arr ? [] : {};
        this.each(v, function(y, x) {
            if (this.isIteratable(y)) y = this.deepClone(y);
            arr ? ret.push(y) : (ret[x] = y);
        });
        return ret;
    },
    isEqual: function(data, base) {
        if (!this.isIteratable(data) || !this.isIteratable(base)) return data == base;
        var ret = true;
        this.each(data, function(v, k) {
            if (!this.isEqual(v, base[k])) return (ret = false);
        });
        return ret;
    },
    
    // Converter
    toBool: function(v) { return [true, 'true', 1, '1'].indexOf(v) >= 0; },
    toArray: function(v, def) {
        if (def === void 0) def = [];
        if (v == null) return def;
        if (this.isArray(v)) return v;
        if (this.isObject(v)) return Object.values(v);
        if (!this.isJson(v)) return [v];
        v = this.parseJson(v, null);
        return this.isArray(v) ? v : def;
    },
    
    // Function
    fnCall: function(fn, a, o) {
        if (!this.isFunction(fn)) return;
        a = this.toArray(a);
        o = o || this;
        switch (a.length) {
            case 0: return fn.call(o);
            case 1: return fn.call(o, a[0]);
            case 2: return fn.call(o, a[0], a[1]);
            case 3: return fn.call(o, a[0], a[1], a[2]);
            case 4: return fn.call(o, a[0], a[1], a[2], a[3]);
            case 5: return fn.call(o, a[0], a[1], a[2], a[3], a[4]);
            default: return fn.apply(o, a);
        }
    },
    fnBind: function(f, b) {
        if (!this.isFunction(f)) return;
        var me = this;
        return function() { return me.fnCall(f, arguments, b); };
    },
    
    // Format
    FILE_SIZES: ['B', 'KB', 'MB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
    formatSize: function(v) {
        v = parseFloat(v);
        if (!v) return '0 ' + this.FILE_SIZES[0];
        var k = 1024,
        i = Math.floor(Math.log(v) / Math.log(k)),
        t = v / Math.pow(k, i);
        if ((k - t) < 1) {
            i++;
            t = v / Math.pow(k, i);
        }
        return flt(t, 2, '#,###.##') + ' ' + this.FILE_SIZES[i];
    },
    
    // Error
    log: function() {
        var pre = '[Better Attach]: ';
        this.each(arguments, function(v) {
            if (this.isString(v)) console.log(pre + v);
            else console.log(pre, v);
        });
    },
    elog: function() {
        var pre = '[Better Attach]: ';
        this.each(arguments, function(v) {
            if (this.isString(v)) console.error(pre + v);
            else console.error(pre, v);
        });
    },
    error: function(text, args, _throw) {
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
    },
    
    // Call
    request: function(method, args, success, failed, always) {
        if (args && this.isFunction(args)) {
            if (this.isFunction(failed)) always = failed;
            if (this.isFunction(success)) failed = success;
            success = args;
            args = null;
        }
        var data = {type: 'GET'};
        if (args != null) {
            data.type = 'POST';
            if (!this.isPlainObject(args)) data.args = {'data': args};
            else {
                data.args = args;
                if (args.type && args.args) {
                    data.type = args.type;
                    data.args = args.args;
                }
            }
        }
        if (this.isString(method)) {
            data.method = 'frappe_better_attach_control.api.' + method;
        } else if (this.isArray(method)) {
            data.doc = method[0];
            data.method = method[1];
        } else {
            this.elog('The method passed is invalid', arguments);
            return;
        }
        data.error = this.fnBind(function(e) {
            this.fnCall(failed);
            this.elog('Call error.', e);
            this.error('Unable to make the call to {0}', [data.method]);
        });
        if (this.isFunction(success)) {
            data.callback = this.fnBind(function(ret) {
                if (ret && this.isPlainObject(ret)) ret = ret.message || ret;
                try {
                    this.fnCall(success, ret);
                } catch(e) { this.error(e); }
            });
        }
        if (this.isFunction(always)) data.always = always;
        try {
            return frappe.call(data);
        } catch(e) {
            this.error(e);
        }
    }
};


export default Helpers;