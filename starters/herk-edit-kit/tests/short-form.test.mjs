import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, cpSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { validatePlan } from '../.claude/skills/short-form-edit/scripts/validate-plan.mjs';
import { validateFootage } from '../.claude/skills/short-form-edit/scripts/validate-footage.mjs';

const root = resolve(import.meta.dirname, '..');
const fixture = join(root, 'examples/short-form');
const read = name => JSON.parse(readFileSync(join(fixture, 'assets', name)));
function planCheck(change = () => {}) {
  const plan = read('plan.json'), transcript = read('transcript.json'), edl = read('edit-decisions.json');
  change(plan, transcript, edl);
  return validatePlan(plan, transcript, edl);
}
test('short-form fixture has complete source-mapped captions and scenes', () => {
  assert.equal(planCheck().ok, true);
});
test('a caption that drifts from the retained word is rejected', () => {
  const result = planCheck(p => { p.captions[0].words[0].start += .1; });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some(e => e.includes('timing differs')));
});
test('word source timestamps from the wrong edit are rejected', () => {
  const result = planCheck((p, t) => { t.words[0].sourceStart += .1; });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some(e => e.includes('source mapping')));
});
test('scene gaps and duplicate scene identifiers are rejected', () => {
  const result = planCheck(p => { p.scenes[1].start += .1; p.scenes[1].id = p.scenes[0].id; });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some(e => e.includes('gap or overlap')));
  assert.ok(result.errors.some(e => e.includes('Duplicate scene')));
});
test('footage cannot reuse a scene or overlap source ranges under a new name', () => {
  const row = { sourceSceneId: 'source-1', sha256: 'a'.repeat(64), sourceStart: 0, sourceEnd: 2 };
  assert.equal(validateFootage([row]).ok, true);
  assert.equal(validateFootage([row, { ...row }]).ok, false);
  assert.equal(validateFootage([row, { ...row, sourceSceneId: 'source-2', sourceStart: 1 }]).ok, false);
});
test('CLI accepts no-footage edits and rejects missing or changed footage', () => {
  const work = mkdtempSync(join(tmpdir(), 'short-form-kit-'));
  cpSync(fixture, work, { recursive: true });
  const run = script => spawnSync(process.execPath, [join(root, '.claude/skills/short-form-edit/scripts', script), work], { encoding: 'utf8' });
  assert.equal(run('validate-plan.mjs').status, 0);
  assert.equal(run('validate-footage.mjs').status, 0);
  const plan = read('plan.json');
  plan.scenes[1].layout = 'broll'; plan.scenes[1].kind = 'garden';
  writeFileSync(join(work, 'assets/plan.json'), JSON.stringify(plan));
  assert.equal(run('validate-footage.mjs').status, 1);
  // Hash-validation fixture only; these bytes deliberately are not a video.
  const bytes = Buffer.from('synthetic footage hash fixture');
  writeFileSync(join(work, 'assets/garden.mp4'), bytes);
  const ledger = [{ scene: 's01', sourceSceneId: 'garden-one', asset: 'assets/garden.mp4', sha256: createHash('sha256').update(bytes).digest('hex'), sourceStart: 0, sourceEnd: 2 }];
  writeFileSync(join(work, 'assets/footage-ledger.json'), JSON.stringify(ledger));
  assert.equal(run('validate-footage.mjs').status, 0);
  writeFileSync(join(work, 'assets/garden.mp4'), 'changed');
  assert.equal(run('validate-footage.mjs').status, 1);
});
