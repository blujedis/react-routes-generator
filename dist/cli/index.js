"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
var generator_1 = require("../generator");
var ansi_colors_1 = require("ansi-colors");
var parser_1 = require("./parser");
var flags = parser_1.parsed.flags;
var title = ansi_colors_1.blue("React Routes Generator");
var usage = ansi_colors_1.dim("usage: $ rrg [options]");
var options = ansi_colors_1.cyan("Options:");
var help = "\n" + title + "\n\n" + usage + "\n\n" + options + "\n  -m, --mode            Determines output file type         (default: ts)\n  -r, --root-dir        The project root directory          (default: src)\n  -p, --pages-dir       Relative to root pages directory    (default: pages)\n  -i, --ignore-keys     When present in filename ignore     (default: test,ignore)\n  -l, --lazy-key        Denotes component loads lazily      (default: lazy)\n  -c, --root-component  Root component name                 (default: home)\n  -o, --output-name     The name of the output file         (default: routes)\n  -f, --force           When true forces overwrite          (default: false)\n";
if (flags.h || flags.help) {
    console.log(help);
}
else {
    var options_1 = {};
    var map = {
        r: 'rootDir',
        m: 'mode',
        p: 'pagesDir',
        i: 'ignoreKeys',
        l: 'lazyKey',
        c: 'rootComponent',
        o: 'outputName',
        f: 'force'
    };
    var allowedKeys_1 = __spreadArray(['mode', 'rootDir', 'pagesDir', 'ignoreKeys', 'lazyKey', 'rootComponent', 'outputName', 'force'], Object.keys(map));
    // Map to camelcase names.
    for (var k in flags) {
        if (map[k])
            options_1[map[k]] = flags[k];
        else
            options_1[k] = flags[k];
    }
    var unknownKeys = Object.keys(options_1).filter(function (k) {
        return !allowedKeys_1.includes(k);
    });
    if (unknownKeys.length) {
        var msg = "\nError: the following invalid options detected [" + unknownKeys.join(', ') + "]\n";
        console.log(ansi_colors_1.red(msg));
        process.exit();
    }
    generator_1.generator(options_1).generate();
}
