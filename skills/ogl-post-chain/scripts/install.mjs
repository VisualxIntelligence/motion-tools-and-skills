// install.mjs: add the post chain to an ogl-time-pure project. Cross-platform (no bash, no rsync).
//
//   node install.mjs <project-dir> [--no-example]
//
// Copies chain/chain.js → <project>/src/post/chain.js and examples/post-demo.js → <project>/scenes/post-demo.js.
// Never overwrites a file you have changed without --force. Then set `scene: 'post-demo'` in src/config.js.
import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const dest = args.find((a) => !a.startsWith('--'));
if (!dest) { console.error('usage: node install.mjs <project-dir> [--no-example] [--force]'); process.exit(1); }
const proj = resolve(dest);
if (!existsSync(join(proj, 'vendor/ogl/src/index.js')) || !existsSync(join(proj, 'src/stage.js'))) {
  console.error(`${proj} does not look like an ogl-time-pure project (missing vendor/ogl/src or src/stage.js).`);
  console.error('Copy starters/ogl-time-pure first, then run this again.');
  process.exit(1);
}

const jobs = [['chain/chain.js', 'src/post/chain.js']];
if (!flags.has('--no-example')) jobs.push(['examples/post-demo.js', 'scenes/post-demo.js']);
for (const [from, to] of jobs) {
  const src = join(here, from), out = join(proj, to);
  if (existsSync(out) && !flags.has('--force') && readFileSync(out, 'utf8') !== readFileSync(src, 'utf8')) {
    console.log(`skip   ${to} (exists and differs; use --force to overwrite)`); continue;
  }
  mkdirSync(dirname(out), { recursive: true }); copyFileSync(src, out); console.log(`wrote  ${to}`);
}
console.log("\nNext: set scene: 'post-demo' in src/config.js, then `npm run check` and `npm run sheet`.");
