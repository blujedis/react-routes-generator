/**
 * Ultra simple command line parser.
 */

export const argv = process.argv.slice(2);

export type ParseType = string | number | boolean;

const parseType = (val: string): ParseType => {
  if (/^\d*(?:\.\d{1,})?$/.test(val))
    return parseFloat(val);
  if (/^(true|false|yes|no)/.test(val))
    return /^(true|yes)/.test(val) ? true : false;
  return val;
};

const parseValue = (val: string): ParseType | ParseType[] => {
  if (val.includes(','))
    return val.trim().split(',').map(parseType);
  return parseType(val);
};

const camelCase = (val: string) => {
  return val.replace(/^--?/, '').split('-').map((v, i) => {
    if (i === 0)
      v = v.toLowerCase();
    else
      v = v.charAt(0).toUpperCase() + v.slice(1);
    return v;
  }).join('');
}

export const parsed = argv.reduce((a, c, i, arr) => {

  if (a.skip.includes(i))
    return a;

  if (!/^--?/.test(c)) {
    a.cmds.push(c);
    return a;
  }

  const isLongFlag = /^--/.test(c);
  let next = arr[i + 1] as any;
  let key = c.replace(/^--?/, '');
  let val = true + '';

  const nextIsFlag = /^--?/.test(next);
  const isKeyVal = key.includes('=');
  const isRepeatKey = !isLongFlag && /(.)\1/.test(key);
  val = !nextIsFlag ? next || val : val;

  if (!nextIsFlag && !isKeyVal)
    a.skip.push(i + 1);

  if (isKeyVal) {
    const [newKey, newVal] = key.split('=');
    key = newKey;
    val = newVal;
  }
  else if (isRepeatKey) {
    const len = key.length + ''; // we'll convert to number later.
    key = key.charAt(0);
    val = len;
  }

  key = camelCase(key); // convert key to camel

  if (typeof a.flags[key] !== 'undefined') { // convert to array.
    if (!Array.isArray(a.flags[key]))
      a.flags[key] = [a.flags[key] as any];
    (a.flags[key] as any).push(parseValue(val));
  }

  else {
    a.flags[key] = parseValue(val);
  }

  return a;

}, { flags: {} as { [key: string]: ParseType | ParseType[] }, cmds: [] as string[], skip: [] as number[] });
