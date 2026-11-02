// Build the web astronaut: Meshy rigged mesh + PBR maps from the static Meshy model (same UV atlas)
// + walk / run / idle clips merged from the separate Meshy animation exports.
//   node examples/artemis/tools/build-astro.mjs <out.glb>
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const out = process.argv[2];
const R = 'assets/raw/artemis-astro.';
const doc = await io.read(R + 'rigged_character_glb.glb');
const root = doc.getRoot();
const stat = await io.read(R + 'glb');
const sm = stat.getRoot().listMaterials()[0];
const mat = root.listMaterials()[0];
const copyTex = (t, name) => { const n = doc.createTexture(name).setImage(t.getImage().slice()).setMimeType(t.getMimeType()); return n; };
mat.setNormalTexture(copyTex(sm.getNormalTexture(), 'normal'));
mat.setMetallicRoughnessTexture(copyTex(sm.getMetallicRoughnessTexture(), 'mr'));
mat.setMetallicFactor(1).setRoughnessFactor(1);
console.log('static mat', sm.getName(), 'normalScale', sm.getNormalScale());
for (const a of root.listAnimations()) a.dispose();
const byName = new Map(root.listNodes().map(n => [n.getName(), n]));
const srcs = [['walk', R + 'walking_armature_glb.glb'], ['run', R + 'running_armature_glb.glb'], ['idle', R + 'animation_glb.glb']];
const buf = root.listBuffers()[0];
for (const [name, file] of srcs) {
  const s = await io.read(file);
  for (const a of s.getRoot().listAnimations()) {
    const na = doc.createAnimation(name);
    for (const c of a.listChannels()) {
      const node = byName.get(c.getTargetNode().getName());
      if (!node) { console.log('missing node', c.getTargetNode().getName()); continue; }
      const path = c.getTargetPath();
      if (name === 'idle' && c.getTargetNode().getName() === 'Hips' && path === 'scale') continue;
      const sp = c.getSampler();
      const cp = acc => doc.createAccessor().setArray(acc.getArray().slice()).setType(acc.getType()).setNormalized(acc.getNormalized()).setBuffer(buf);
      const samp = doc.createAnimationSampler().setInput(cp(sp.getInput())).setOutput(cp(sp.getOutput())).setInterpolation(sp.getInterpolation());
      na.addSampler(samp).addChannel(doc.createAnimationChannel().setTargetNode(node).setTargetPath(path).setSampler(samp));
    }
    console.log('clip', name, na.listChannels().length);
  }
}
await io.write(out, doc);
console.log('wrote', out);
