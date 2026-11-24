#!/usr/bin/env node
// Canonical Claude skills -> portable Codex mirrors. No symlinks required.
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, '.claude/skills');
const target = join(root, '.agents/skills');
const check = process.argv.includes('--check');
let count = 0;
let failures = 0;
function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    if (['__pycache__', 'node_modules', '.DS_Store'].includes(e.name) || e.name.endsWith('.pyc')) return [];
    const p = join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}
const expected = new Set();
for (const p of walk(source)) {
  const rel = relative(source, p);
  expected.add(rel);
  const dest = join(target, rel);
  // Only instructions change runtime paths; helpers and resources remain identical.
  const bytes = p.endsWith('.md')
    ? Buffer.from(readFileSync(p, 'utf8').replaceAll('.claude/skills/', '.agents/skills/'))
    : readFileSync(p);
  if (check) {
    if (!existsSync(dest) || !readFileSync(dest).equals(bytes)) {
      console.error(`Out of sync: ${rel}`); failures++;
    }
  } else {
    mkdirSync(dirname(dest), { recursive: true }); writeFileSync(dest, bytes);
  }
  count++;
}
if (existsSync(target)) for (const p of walk(target)) {
  if (!expected.has(relative(target, p))) {
    console.error(`Extra mirror file: ${relative(target, p)} (archive manually if obsolete)`); failures++;
  }
}
console.log(`${check ? 'Checked' : 'Synced'} ${count} skill files; ${failures} discrepancies.`);
process.exitCode = failures ? 1 : 0;
