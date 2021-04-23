"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.merge = exports.defaults = exports.PKG = void 0;
var path_1 = require("path");
var fs_1 = require("fs");
exports.PKG = JSON.parse(fs_1.readFileSync(path_1.join(process.cwd(), 'package.json')).toString());
var reactRoutesGenerator = (exports.PKG || {}).reactRoutesGenerator;
var DEFAULTS = {
    force: false,
    mode: 'ts',
    rootDir: 'src',
    pagesDir: 'pages',
    ignoreKeys: ['ignore', 'test', 'spec'],
    lazyKey: 'lazy',
    rootComponent: 'home',
    outputName: 'routes',
    outputPath: '',
    pagesPath: '',
    importBasePath: '',
    globFilters: []
};
var defaults = __assign(__assign({}, DEFAULTS), reactRoutesGenerator);
exports.defaults = defaults;
///////////////////////////////////////
// DERIVED CONSTANTS
///////////////////////////////////////
function merge(options) {
    if (options === void 0) { options = {}; }
    options = __assign(__assign({}, defaults), options);
    var extKeys = '(' + [options.mode, options.mode + 'x'].join('|') + ')';
    options.outputPath =
        path_1.join(process.cwd(), options.rootDir, options.outputName + "." + options.mode);
    options.pagesPath = path_1.join(options.rootDir, options.pagesDir);
    options.importBasePath = path_1.relative(path_1.parse(options.outputPath).dir, options.pagesPath);
    var ignorePaths = options.ignoreKeys.map(function (k) {
        return "!" + options.pagesPath + "/**/*" + k + "*";
    });
    options.globFilters = __spreadArray(__spreadArray([], ignorePaths), [
        options.pagesPath + "/**/*." + extKeys
    ]);
    return options;
}
exports.merge = merge;
