import { join, relative, parse } from 'path';
import { readFileSync } from 'fs';

export type Options = typeof DEFAULTS;

export const PKG = JSON.parse(readFileSync(join(process.cwd(), 'package.json')).toString());
const { reactRoutesGenerator } = (PKG || {});

const DEFAULTS = {
  force: false,
  mode: 'ts' as 'ts' | 'js',
  rootDir: 'src',
  pagesDir: 'pages',
  ignoreKeys: ['ignore', 'test', 'spec'],
  lazyKey: 'lazy',
  rootComponent: 'home',
  outputName: 'routes',
  outputPath: '',
  pagesPath: '',
  importBasePath: '',
  globFilters: [] as string[]
};

const defaults = {
  ...DEFAULTS,
  ...reactRoutesGenerator
} as Options;

///////////////////////////////////////
// DERIVED CONSTANTS
///////////////////////////////////////

function merge(options: Options = {} as Options): Options {

  options = {
    ...defaults,
    ...options
  } as Options;

  const extKeys = '(' + [options.mode, options.mode + 'x'].join('|') + ')';

  options.outputPath =
    join(process.cwd(), options.rootDir, `${options.outputName}.${options.mode}`);
  options.pagesPath = join(options.rootDir, options.pagesDir);
  options.importBasePath = relative(parse(options.outputPath).dir, options.pagesPath);

  const ignorePaths = options.ignoreKeys.map(k => {
    return `!${options.pagesPath}/**/*${k}*`
  });

  options.globFilters = [
    ...ignorePaths,
    `${options.pagesPath}/**/*.${extKeys}`
  ];

  return options as unknown as Options;

}

export { defaults, merge };

