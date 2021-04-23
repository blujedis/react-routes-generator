"use strict";
/**
 * Ultra simple command line parser.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsed = exports.argv = void 0;
exports.argv = process.argv.slice(2);
var parseType = function (val) {
    if (/^\d*(?:\.\d{1,})?$/.test(val))
        return parseFloat(val);
    if (/^(true|false|yes|no)/.test(val))
        return /^(true|yes)/.test(val) ? true : false;
    return val;
};
var parseValue = function (val) {
    if (val.includes(','))
        return val.trim().split(',').map(parseType);
    return parseType(val);
};
var camelCase = function (val) {
    return val.replace(/^--?/, '').split('-').map(function (v, i) {
        if (i === 0)
            v = v.toLowerCase();
        else
            v = v.charAt(0).toUpperCase() + v.slice(1);
        return v;
    }).join('');
};
exports.parsed = exports.argv.reduce(function (a, c, i, arr) {
    if (a.skip.includes(i))
        return a;
    if (!/^--?/.test(c)) {
        a.cmds.push(c);
        return a;
    }
    var isLongFlag = /^--/.test(c);
    var next = arr[i + 1];
    var key = c.replace(/^--?/, '');
    var val = true + '';
    var nextIsFlag = /^--?/.test(next);
    var isKeyVal = key.includes('=');
    var isRepeatKey = !isLongFlag && /(.)\1/.test(key);
    val = !nextIsFlag ? next || val : val;
    if (!nextIsFlag && !isKeyVal)
        a.skip.push(i + 1);
    if (isKeyVal) {
        var _a = key.split('='), newKey = _a[0], newVal = _a[1];
        key = newKey;
        val = newVal;
    }
    else if (isRepeatKey) {
        var len = key.length + ''; // we'll convert to number later.
        key = key.charAt(0);
        val = len;
    }
    key = camelCase(key); // convert key to camel
    if (typeof a.flags[key] !== 'undefined') { // convert to array.
        if (!Array.isArray(a.flags[key]))
            a.flags[key] = [a.flags[key]];
        a.flags[key].push(parseValue(val));
    }
    else {
        a.flags[key] = parseValue(val);
    }
    return a;
}, { flags: {}, cmds: [], skip: [] });
