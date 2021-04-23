import glob from 'fast-glob';
import { parse, relative } from 'path';
import { writeFileSync, existsSync } from 'fs';
import { IParsedRoutes } from './types';
import { yellow } from 'ansi-colors';
import { Options, merge } from './defaults';

export function generator(options: Options = {} as Options) {

  options = merge(options); // merge with defaults and pkg json defaults.

  const { lazyKey, pagesPath, rootComponent, globFilters, outputPath } = options;

  const importEager = (name: string, path: string) => {
    return `import ${name} from '${path}';`;
  };

  const importLazy = (name: string, path: string) => {
    return `const ${name} = React.lazy(() => import('${path}'));`;
  };

  function toComponentName(dir: string, name: string) {
    return [...dir.split('/'), name]
      .map(v => {
        v = v.replace(/:/g, '');
        return v.charAt(0).toUpperCase() + v.slice(1).toLowerCase()
      }).join('');
  }

  function filterRoutes(filters: string | string[]) {
    if (typeof filters === 'undefined')
      return [];
    if (!Array.isArray(filters))
      filters = [filters];
    return glob.sync(filters);
  }

  function parseRoutes(paths: string[]) {

    paths.reverse();

    return paths.reduce((a, c) => {

      c = relative(pagesPath, c);

      const fullPath = c;
      let { dir, name } = parse(c);
      name = name.split('.')[0];
      let path = dir;
      let params = [] as string[];
      let exact = false; // set paths at page root as exact.
      let ComponentName: any;
      let isLazy = c.includes(lazyKey);

      const pathParams = path.match(/\[.+\]/g) || [];

      if (pathParams.length) { // path itself contains params.
        path = path.replace(/\[/g, ':').replace(/\]/g, '');
        params = pathParams.map(v => v.replace(/(\[|\])/g, ''));
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

      let importPath = `./pages/${fullPath}`.replace(/\.tsx?$/, '');
      let routePath = '/' + path;

      routePath = routePath === `/${rootComponent}` ? '/' : routePath;
      importPath = /\/index$/.test(importPath) ? importPath.replace(/\/index$/, '') : importPath;

      a.configs[routePath] = {
        path: routePath,
        exact,
        params,
        isLazy,
        component: ComponentName
      };

      if (isLazy)
        a.lazy.push(importLazy(ComponentName, importPath));
      else
        a.imports.push(importEager(ComponentName, importPath));

      return a;

    }, { configs: {}, imports: [], lazy: [] } as IParsedRoutes);

  }

  function generate(parsed?: IParsedRoutes) {

    if (existsSync(options.outputPath) && !options.force) {
      const msg = `\nWarning: cannot overwrite existing file:\n${options.outputPath},\n\nPass -f or --force options to ignore this warning.\n`
      console.log(yellow(msg));
      return;
    }

    if (!parsed) {
      const paths = filterRoutes(globFilters);
      console.log(paths);
      parsed = parseRoutes(paths);
    }

    const { configs, imports, lazy } = parsed;

    return;

    let json = JSON.stringify(configs, null, 2).slice(1);
    json = json.slice(0, json.length - 1);
    let jsonLines = json.split('\n');

    json = jsonLines.map((v, i) => {

      if (v.includes('{') || v.includes('}') || i === 0 || i === json.length - 1)
        return v;

      let [key, val] = v.split(': ');

      // Remove strings from Component name.
      if (key.includes('component'))
        val = val.replace(/("|')/g, '');

      if (key.includes('params') && options.mode === 'ts')
        val = val + ' as string[]';

      return key + ': ' + val;

    }).join('\n');

    if (lazy.length)
      lazy[0] = '\n' + lazy[0];

    let lines = [
      ...imports,
      ...lazy,
      `\nexport const routes = {${json}};\n`
    ];

    const types = [
      'export type Routes = typeof routes;',
      'export type RouteKey = keyof Routes;',
    ]

    if (options.mode === 'ts')
      lines = [...lines, ...types];

    // Lazy needs access to React namespace.
    if (lazy.length)
      lines.unshift(`import React from 'react';`)

    writeFileSync(outputPath, lines.join('\n'));

  }

  return {
    filter: filterRoutes,
    parse: parseRoutes,
    generate
  };

}
