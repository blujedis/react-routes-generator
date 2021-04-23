import glob from 'fast-glob';
import { parse, relative, join } from 'path';
import { writeFileSync } from 'fs';

// const glob = require('fast-glob');
// const { parse, relative, join } = require('path');
// const { writeFileSync } = require('fs');

const BASE_PATH = 'src';
const IGNORE_KEY = 'ignore';
const TEST_KEY = 'test';
const LAZY_KEY = 'lazy';
const PAGES_KEY = 'pages';
const ROOT_COMPONNENT = 'home';             // need root component for root_path.

const OUTPUT_PATH = join(process.cwd(), BASE_PATH, 'routes.ts');
const PAGES_PATH = join(BASE_PATH, PAGES_KEY);
const ROOT_COMPONENT_PATH = `/${ROOT_COMPONNENT}`;    // when detected convert to '/' path.

const RELATIVE_IMPORT_BASE_PATH = relative(parse(OUTPUT_PATH).dir, PAGES_PATH);


const ROUTE_EXP = [
  `!${PAGES_PATH}/**/*${TEST_KEY}*`,     // ignore tests
  `!${PAGES_PATH}/**/*${IGNORE_KEY}*`,   // ignored paths.
  `${PAGES_PATH}/**/*.(ts|tsx)`
];

console.log(ROUTE_EXP);
console.log(RELATIVE_IMPORT_BASE_PATH);

process.exit();

const importEager = (name: string, path: string) => `import ${name} from '${path}';`;
const importLazy = (name: string, path: string) => `const ${name} = React.lazy(() => import('${path}'));`;

function toComponentName(dir: string, name: string) {

  return [...dir.split('/'), name]
    .map(v => {
      v = v.replace(/:/g, '');
      return v.charAt(0).toUpperCase() + v.slice(1).toLowerCase()
    }).join('');

}

function filterRoutes(exp: string | string[]) {

  if (typeof exp === 'undefined') return [];
  if (!Array.isArray(exp))
    exp = [exp];

  return glob.sync(exp);

}

interface IRouteConfig {
  path: string;
  exact: boolean;
  params: string[];
  isLazy: boolean;
  component: any;
}

interface IRouteConfigs {
  [key: string]: IRouteConfig;
}

interface IParsedRoutes {
  configs: IRouteConfigs;
  imports: string[];
  lazy: string[];
}

function parseRoutes(routes: string[]) {

  routes.reverse();

  return routes.reduce((a, c) => {

    c = relative(PAGES_PATH, c);

    const fullPath = c;
    let { dir, name } = parse(c);
    name = name.split('.')[0];
    let path = dir;
    let params = [] as string[];
    let exact = false; // set paths at page root as exact.
    let ComponentName: any;
    let isLazy = c.includes(LAZY_KEY);

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

    routePath = routePath === ROOT_COMPONENT_PATH ? '/' : routePath;
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

  }, {} as IParsedRoutes);

}

function writeRoutes({ configs, imports, lazy }: IParsedRoutes) {

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
    return key + ': ' + val;

  }).join('\n');

  if (lazy.length)
    lazy[0] = '\n' + lazy[0];

  const lines = [
    ...imports,
    ...lazy,
    `\nexport const routes = {${json}};\n`,
    'export type Routes = typeof routes;',
    'export type RouteKey = keyof Routes;',
  ];

  if (lazy.length)
    lines.unshift(`import React from 'react';`)

  writeFileSync(OUTPUT_PATH, lines.join('\n'));

}

const found = filterRoutes(ROUTE_EXP);
const normalized = parseRoutes(found);

writeRoutes(normalized);

