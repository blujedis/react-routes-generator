"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generator = void 0;
var fast_glob_1 = __importDefault(require("fast-glob"));
var path_1 = require("path");
var fs_1 = require("fs");
var ansi_colors_1 = require("ansi-colors");
var defaults_1 = require("./defaults");
function generator(options) {
    if (options === void 0) { options = {}; }
    options = defaults_1.merge(options); // merge with defaults and pkg json defaults.
    var lazyKey = options.lazyKey, pagesPath = options.pagesPath, rootComponent = options.rootComponent, globFilters = options.globFilters, outputPath = options.outputPath;
    var importEager = function (name, path) {
        return "import " + name + " from '" + path + "';";
    };
    var importLazy = function (name, path) {
        return "const " + name + " = React.lazy(() => import('" + path + "'));";
    };
    function toComponentName(dir, name) {
        return __spreadArray(__spreadArray([], dir.split('/')), [name]).map(function (v) {
            v = v.replace(/:/g, '');
            return v.charAt(0).toUpperCase() + v.slice(1).toLowerCase();
        }).join('');
    }
    function filterRoutes(filters) {
        if (typeof filters === 'undefined')
            return [];
        if (!Array.isArray(filters))
            filters = [filters];
        return fast_glob_1.default.sync(filters);
    }
    function parseRoutes(paths) {
        paths.reverse();
        return paths.reduce(function (a, c) {
            c = path_1.relative(pagesPath, c);
            var fullPath = c;
            var _a = path_1.parse(c), dir = _a.dir, name = _a.name;
            name = name.split('.')[0];
            var path = dir;
            var params = [];
            var exact = false; // set paths at page root as exact.
            var ComponentName;
            var isLazy = c.includes(lazyKey);
            var pathParams = path.match(/\[.+\]/g) || [];
            if (pathParams.length) { // path itself contains params.
                path = path.replace(/\[/g, ':').replace(/\]/g, '');
                params = pathParams.map(function (v) { return v.replace(/(\[|\])/g, ''); });
            }
            if (name !== 'index') { // index just uses root dir.
                if (name.startsWith('[')) {
                    name = name.replace(/\[|\]/g, '').replace(/^\.{3}/, '');
                    params.push(name);
                    path += '/:' + name;
                }
                else {
                    path += '/' + name;
                }
                ComponentName = toComponentName(dir, name);
            }
            else {
                exact = !params.length ? true : false;
                ComponentName = toComponentName(dir, '');
            }
            var importPath = ("./pages/" + fullPath).replace(/\.tsx?$/, '');
            var routePath = '/' + path;
            routePath = routePath === "/" + rootComponent ? '/' : routePath;
            importPath = /\/index$/.test(importPath) ? importPath.replace(/\/index$/, '') : importPath;
            a.configs[routePath] = {
                path: routePath,
                exact: exact,
                params: params,
                isLazy: isLazy,
                component: ComponentName
            };
            if (isLazy)
                a.lazy.push(importLazy(ComponentName, importPath));
            else
                a.imports.push(importEager(ComponentName, importPath));
            return a;
        }, { configs: {}, imports: [], lazy: [] });
    }
    function generate(parsed) {
        if (fs_1.existsSync(options.outputPath) && !options.force) {
            var msg = "\nWarning: cannot overwrite existing file:\n" + options.outputPath + ",\n\nPass -f or --force options to ignore this warning.\n";
            console.log(ansi_colors_1.yellow(msg));
            return;
        }
        if (!parsed) {
            var paths = filterRoutes(globFilters);
            console.log(paths);
            parsed = parseRoutes(paths);
        }
        var configs = parsed.configs, imports = parsed.imports, lazy = parsed.lazy;
        return;
        var json = JSON.stringify(configs, null, 2).slice(1);
        json = json.slice(0, json.length - 1);
        var jsonLines = json.split('\n');
        json = jsonLines.map(function (v, i) {
            if (v.includes('{') || v.includes('}') || i === 0 || i === json.length - 1)
                return v;
            var _a = v.split(': '), key = _a[0], val = _a[1];
            // Remove strings from Component name.
            if (key.includes('component'))
                val = val.replace(/("|')/g, '');
            if (key.includes('params') && options.mode === 'ts')
                val = val + ' as string[]';
            return key + ': ' + val;
        }).join('\n');
        if (lazy.length)
            lazy[0] = '\n' + lazy[0];
        var lines = __spreadArray(__spreadArray(__spreadArray([], imports), lazy), [
            "\nexport const routes = {" + json + "};\n"
        ]);
        var types = [
            'export type Routes = typeof routes;',
            'export type RouteKey = keyof Routes;',
        ];
        if (options.mode === 'ts')
            lines = __spreadArray(__spreadArray([], lines), types);
        // Lazy needs access to React namespace.
        if (lazy.length)
            lines.unshift("import React from 'react';");
        fs_1.writeFileSync(outputPath, lines.join('\n'));
    }
    return {
        filter: filterRoutes,
        parse: parseRoutes,
        generate: generate
    };
}
exports.generator = generator;
