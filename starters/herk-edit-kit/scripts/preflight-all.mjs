import { readdirSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
let failed = 0;
for (const entry of readdirSync(join(root, 'video-projects'), { withFileTypes: true })) {
  const project = join(root, 'video-projects', entry.name);
  if (!entry.isDirectory() || !existsSync(join(project, 'index.html'))) continue;
  const result = spawnSync(process.execPath, [join(root, 'scripts/preflight.mjs'), project], { stdio: 'inherit' });
  if (result.status !== 0) failed++;
}
process.exitCode = failed ? 1 : 0;
