import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
for (const f of process.argv.slice(2)) {
  const doc = await io.read(f);
  const r = doc.getRoot();
  console.log('==', f);
  console.log(' meshes', r.listMeshes().map(m => m.getName() + ':' + m.listPrimitives().map(p => (p.getIndices()?.getCount() / 3) + 'tris attrs=' + p.listSemantics().join(',')).join('|')));
  console.log(' skins', r.listSkins().map(s => s.getName() + ' joints=' + s.listJoints().length));
  console.log(' joints', r.listSkins()[0]?.listJoints().map(j => j.getName()).join(' '));
  console.log(' anims', r.listAnimations().map(a => a.getName() + ' ch=' + a.listChannels().length + ' dur=' + Math.max(...a.listSamplers().map(s => { const i = s.getInput(); return i.getElement(i.getCount() - 1, [])[0]; })).toFixed(3)));
  console.log(' mats', r.listMaterials().map(m => m.getName() + ' base=' + !!m.getBaseColorTexture() + ' n=' + !!m.getNormalTexture() + ' mr=' + !!m.getMetallicRoughnessTexture() + ' metal=' + m.getMetallicFactor() + ' rough=' + m.getRoughnessFactor()));
  console.log(' tex', r.listTextures().map(t => t.getMimeType() + ' ' + t.getSize()?.join('x')));
  console.log(' nodes', r.listNodes().length, r.listNodes().slice(0,5).map(n => n.getName() + ' s=' + n.getScale().map(v=>v.toFixed(3)) + ' r=' + n.getRotation().map(v=>v.toFixed(3)) + ' t=' + n.getTranslation().map(v=>v.toFixed(3))));
  const a = r.listAnimations()[0];
  if (a) { const ch = a.listChannels().slice(0, 4).map(c => c.getTargetNode().getName() + '.' + c.getTargetPath() + ' n=' + c.getSampler().getInput().getCount()); console.log(' ch0', ch); }
  const acc = r.listMeshes()[0]?.listPrimitives()[0]?.getAttribute('POSITION');
  if (acc) console.log(' posMin', acc.getMin([]).map(v=>v.toFixed(3)), 'posMax', acc.getMax([]).map(v=>v.toFixed(3)));
}
