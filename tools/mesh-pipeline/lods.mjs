#!/usr/bin/env node
// Build a LOD chain from one glTF/GLB with glTF-Transform + meshoptimizer, outside Blender.
//
//   node lods.mjs in.glb outdir [--ratios 1,0.5,0.25,0.1] [--error 0.01] [--lock-border] [--compress]
//
// Writes outdir/<name>_lod0.glb … one file per ratio (ratio = share of triangles to aim for;
// 1 = the welded original) and prints a JSON report with triangles, vertices, bytes and the
// ratio actually reached per level. meshoptimizer stops early when the next collapse would
// exceed --error (a fraction of the mesh's size), so a low ratio with a tight error may not be
// reached: raise --error, or accept the level it reports.
// --compress adds EXT_meshopt_compression (three.js needs MeshoptDecoder set on GLTFLoader).
// Named nodes and the scene graph are kept, so objects stay addressable for animation.
//
// Needs: npm i @gltf-transform/core @gltf-transform/extensions @gltf-transform/functions meshoptimizer
import { Logger, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { weld, simplify, dedup, prune, meshopt } from '@gltf-transform/functions';
import { MeshoptSimplifier, MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer';
import { mkdirSync, statSync } from 'node:fs';
import { basename, extname, join } from 'node:path';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(`--${k}`); return i < 0 ? d : args[i + 1]; };
const flag = (k) => args.includes(`--${k}`);
const pos = args.filter((a, i) => !a.startsWith('--') && !['--ratios', '--error'].includes(args[i - 1]));
if (pos.length < 2) {
  console.error('usage: node lods.mjs in.glb outdir [--ratios 1,0.5,0.25,0.1] [--error 0.01] [--lock-border] [--compress]');
  process.exit(2);
}
const [input, outdir] = pos;
const ratios = opt('ratios', '1,0.5,0.25,0.1').split(',').map(Number);
const error = Number(opt('error', '0.01'));

await Promise.all([MeshoptSimplifier.ready, MeshoptEncoder.ready, MeshoptDecoder.ready]);
// glTF-Transform logs info lines to stdout, which would corrupt the JSON report: keep warnings only.
const logger = new Logger(Logger.Verbosity.WARN);
const io = new NodeIO()
  .setLogger(logger)
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder });

function count(doc) {
  let tris = 0, verts = 0;
  for (const mesh of doc.getRoot().listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      if (prim.getMode() !== 4) continue; // triangles only
      const idx = prim.getIndices();
      const n = prim.getAttribute('POSITION')?.getCount() ?? 0;
      verts += n;
      tris += (idx ? idx.getCount() : n) / 3;
    }
  }
  return { triangles: tris, vertices: verts };
}

mkdirSync(outdir, { recursive: true });
const name = basename(input, extname(input));
const report = { input, error, levels: [] };
let base = null;
for (const [i, ratio] of ratios.entries()) {
  const doc = await io.read(input);
  doc.setLogger(logger);
  const steps = [weld()];
  if (ratio < 1) {
    steps.push(simplify({ simplifier: MeshoptSimplifier, ratio, error, lockBorder: flag('lock-border') }));
  }
  steps.push(dedup(), prune());
  if (flag('compress')) steps.push(meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
  await doc.transform(...steps);
  const c = count(doc);
  if (i === 0) base = c.triangles;
  const out = join(outdir, `${name}_lod${i}.glb`);
  await io.write(out, doc);
  report.levels.push({
    lod: i, target_ratio: ratio, ...c,
    reached_ratio: base ? +(c.triangles / base).toFixed(3) : 1,
    bytes: statSync(out).size, file: out,
  });
}
console.log(JSON.stringify(report, null, 2));
