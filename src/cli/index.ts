import { Options } from '../defaults';
import { generator } from '../generator';
import { red, blue, cyan, dim } from 'ansi-colors';
import { parsed } from './parser';

const { flags } = parsed;
const title = blue(`React Routes Generator`);
const usage = dim(`usage: $ rrg [options]`);
const options = cyan(`Options:`);

const help = `
${title}

${usage}

${options}
  -m, --mode            Determines output file type         (default: ts)
  -r, --root-dir        The project root directory          (default: src)
  -p, --pages-dir       Relative to root pages directory    (default: pages)
  -i, --ignore-keys     When present in filename ignore     (default: test,ignore)
  -l, --lazy-key        Denotes component loads lazily      (default: lazy)
  -c, --root-component  Root component name                 (default: home)
  -o, --output-name     The name of the output file         (default: routes)
  -f, --force           When true forces overwrite          (default: false)
`;

if (flags.h || flags.help) {
  console.log(help);
}

else {

  const options = {};

  const map = {
    r: 'rootDir',
    m: 'mode',
    p: 'pagesDir',
    i: 'ignoreKeys',
    l: 'lazyKey',
    c: 'rootComponent',
    o: 'outputName',
    f: 'force'
  };

  const allowedKeys = ['mode', 'rootDir', 'pagesDir', 'ignoreKeys', 'lazyKey', 'rootComponent', 'outputName', 'force', ...Object.keys(map)];

  // Map to camelcase names.
  for (const k in flags) {
    if (map[k])
      options[map[k]] = flags[k];
    else
      options[k] = flags[k];
  }

  const unknownKeys = Object.keys(options).filter(k => {
    return !allowedKeys.includes(k);
  });

  if (unknownKeys.length) {
    const msg = `\nError: the following invalid options detected [${unknownKeys.join(', ')}]\n`
    console.log(red(msg));
    process.exit();
  }

  generator(options as Options).generate();

}