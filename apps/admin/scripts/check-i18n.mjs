import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('../src/', import.meta.url).pathname;
const files = [];
function walk(dir) { for (const entry of readdirSync(dir, { withFileTypes: true })) entry.isDirectory() ? walk(join(dir, entry.name)) : /\.(tsx|ts)$/.test(entry.name) && files.push(join(dir, entry.name)); }
walk(root);
const vietnamese = /[ăâêôơưđĂÂÊÔƠƯ]/;
const violations = files.flatMap((file) => readFileSync(file, 'utf8').split('\n').flatMap((line, index) => vietnamese.test(line) ? [`${file}:${index + 1}: Vietnamese text detected`] : []));
if (violations.length) { console.error(violations.join('\n')); process.exit(1); }
console.log('i18n check passed');
