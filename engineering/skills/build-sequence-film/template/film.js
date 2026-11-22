// Build-sequence film: a GLB goes up element by element in build order, in one isometric take.
// Everything on screen is a pure function of t (seconds): window.renderFrame(t) draws frame t.
// Look: a line drawing (white solids, blue ink edges, blue-tinted shade) that warms into the
// model's own colours near the end, so the eye follows the build, not the materials.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const Q = new URLSearchParams(location.search);
const CFG = {
  model: Q.get('model') || 'model.glb',
  timeline: Q.get('timeline') || 'timeline.json',
  width: +(Q.get('w') || 1920), height: +(Q.get('h') || 1080),
  duration: +(Q.get('duration') || 30), fps: +(Q.get('fps') || 30),
  paper: '#f4f1ea', ink: '#2f5fb3', shade: '#9db4dc',
};

// ---- stage rules (used when there is no timeline.json) ---------------------------------------
// Names like "L03|IfcColumn|C-A1" (brief-to-ifc) or any name containing a keyword.
const STAGES = ['foundations', 'structure', 'services', 'envelope', 'roof', 'fitout'];
const MOTION = { foundations: 'rise', structure: 'rise', services: 'slide', envelope: 'slide', roof: 'drop', fitout: 'fade' };
function stageOf(name) {
  const n = name.toLowerCase();
  // three.js turns spaces in node names into underscores, so match both.
  if (/ifcfooting|ifcpile|base[ _]?slab|foundation|footing|pile/.test(n)) return 'foundations';
  if (/roof|parapet/.test(n)) return 'roof';
  if (/ifcwindow|ifccurtainwall|ifcplate|facade|façade|window|glaz|curtain|cladding|panel/.test(n)) return 'envelope';
  if (/ifcwall/.test(n) && !/core/.test(n)) return 'envelope';
  if (/ifcduct|ifcpipe|ifcflow|duct|pipe|mep|service|plant|cable/.test(n)) return 'services';
  if (/ifcfurnish|furniture|fitout|fit-out|interior|ifcdoor|door/.test(n)) return 'fitout';
  return 'structure';
}
function levelOf(name, minY) {
  const m = name.match(/(?:^|\|)L(\d+)\|/) || name.match(/\b(?:level|lvl|floor)[ _-]?(\d+)/i);
  return m ? +m[1] : null;
}

// Construction order: foundations, then floor by floor the frame goes up; the envelope follows
// two floors behind the frame, services one floor behind; the roof closes it; fit-out last.
function autoTimeline(items, duration) {
  const levels = [...new Set(items.map(i => i.level))].sort((a, b) => a - b);
  const groups = [];
  const take = (stage, lvl) => items.filter(i => i.stage === stage && (lvl === undefined || i.level === lvl));
  groups.push(take('foundations'));
  levels.forEach((L, k) => {
    groups.push(take('structure', L));
    if (k >= 1) groups.push(take('services', levels[k - 1]));
    if (k >= 2) groups.push(take('envelope', levels[k - 2]));
  });
  levels.slice(-1).forEach(L => groups.push(take('services', L)));
  levels.slice(-2).forEach(L => groups.push(take('envelope', L)));
  groups.push(take('roof'), take('fitout'));
  const gs = groups.filter(g => g.length);
  const t0 = 1.0, t1 = duration * 0.78;               // build window; colour and hold come after
  const weights = gs.map(g => Math.sqrt(g.length));
  const total = weights.reduce((a, b) => a + b, 0);
  let t = t0;
  const out = [];
  gs.forEach((g, gi) => {
    const span = (t1 - t0) * weights[gi] / total;
    // within a group: bottom to top, then along the longest horizontal axis
    g.sort((a, b) => (a.minY - b.minY) || (a.sweep - b.sweep));
    const dur = Math.min(0.9, Math.max(0.35, span * 0.6));
    g.forEach((it, k) => {
      const s = t + (g.length > 1 ? (span - dur) * k / (g.length - 1) : 0) * 0.98;
      out.push({ node: it.name, stage: it.stage, level: it.level, start: +s.toFixed(3), end: +(s + dur).toFixed(3), motion: MOTION[it.stage] });
    });
    t += span * 0.85;                                   // groups overlap a little, like a real site
  });
  // stretch so the last element lands at t1, then warm into colour and hold
  const last = Math.max(...out.map(e => e.end)), f = (t1 - t0) / Math.max(1e-3, last - t0);
  out.forEach(e => { e.start = +(t0 + (e.start - t0) * f).toFixed(3); e.end = +(t0 + (e.end - t0) * f).toFixed(3); });
  return { duration, fps: CFG.fps, colour_from: +(t1 + 0.4).toFixed(2), colour_to: +(t1 + 0.4 + duration * 0.1).toFixed(2), elements: out };
}

// ---- scene ---------------------------------------------------------------------------------
const canvas = document.getElementById('c');
canvas.width = CFG.width; canvas.height = CFG.height;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(CFG.width, CFG.height, false);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
scene.background = new THREE.Color(CFG.paper);
const hemi = new THREE.HemisphereLight(0xffffff, new THREE.Color(CFG.shade), 1.6);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff, 1.4);
sun.castShadow = true;
sun.shadow.mapSize.set(4096, 4096);
sun.shadow.bias = -0.0004;
scene.add(sun, sun.target);

const ground = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShadowMaterial({ color: new THREE.Color(CFG.ink), opacity: 0.16 }));
ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true;
scene.add(ground);

const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 5000);
const els = [];      // {obj, base, mat, edge, rec}
let bounds, timeline;

function ease(x) { return 1 - Math.pow(1 - x, 3); }
function clamp(x) { return Math.max(0, Math.min(1, x)); }
function smooth(x) { x = clamp(x); return x * x * (3 - 2 * x); }

async function load() {
  const gltf = await new GLTFLoader().loadAsync(CFG.model);
  const root = gltf.scene;
  scene.add(root);
  root.updateMatrixWorld(true);
  bounds = new THREE.Box3().setFromObject(root);
  const size = bounds.getSize(new THREE.Vector3()), centre = bounds.getCenter(new THREE.Vector3());
  const long = size.x >= size.z ? 'x' : 'z';
  // one entry per mesh-bearing node, keyed by its name
  const items = [];
  root.traverse(o => {
    if (!o.isMesh) return;
    const node = o.name ? o : o.parent;
    const name = node.name || o.uuid;
    const box = new THREE.Box3().setFromObject(o);
    const lvl = levelOf(name);
    const src = o.material;
    const colour = (src.color ? src.color.clone() : new THREE.Color(0xdddddd));
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 1 });
    o.material = mat; o.castShadow = true; o.receiveShadow = true;
    const edge = new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry, 25),
      new THREE.LineBasicMaterial({ color: new THREE.Color(CFG.ink), transparent: true, opacity: 1 }));
    o.add(edge);
    els.push({ obj: o, name, base: o.position.clone(), mat, edge, colour, size: box.getSize(new THREE.Vector3()), centre: box.getCenter(new THREE.Vector3()) });
    items.push({ name, stage: stageOf(name), level: lvl ?? Math.round((box.min.y - bounds.min.y) / 3), minY: box.min.y, sweep: box.getCenter(new THREE.Vector3())[long] });
  });
  try {
    const r = await fetch(CFG.timeline, { cache: 'no-store' });
    timeline = r.ok ? await r.json() : null;
  } catch { timeline = null; }
  if (!timeline || !timeline.elements) timeline = autoTimeline(items, CFG.duration);
  const byName = new Map(timeline.elements.map(e => [e.node, e]));
  els.forEach(e => { e.rec = byName.get(e.name) || { start: 0, end: 0.01, motion: 'fade' }; });

  // site, light and camera sized from the model
  const span = Math.max(size.x, size.z) * 4;
  ground.scale.set(span, span, 1); ground.position.set(centre.x, bounds.min.y - 0.01, centre.z);
  const r = size.length();
  sun.position.set(centre.x - r * 0.6, centre.y + r * 1.2, centre.z + r * 0.9);
  sun.target.position.copy(centre);
  Object.assign(sun.shadow.camera, { left: -r, right: r, top: r, bottom: -r, near: 0.1, far: r * 4 });
  sun.shadow.camera.updateProjectionMatrix();
  window.timeline = timeline;
  window.PROJECT = { len: timeline.duration, fps: timeline.fps };
}

// ---- frame t ---------------------------------------------------------------------------------
function renderFrame(t) {
  const size = bounds.getSize(new THREE.Vector3()), c = bounds.getCenter(new THREE.Vector3());
  const D = timeline.duration;
  // one take: isometric, a slow drift of 10 degrees and a gentle push in
  const az = THREE.MathUtils.degToRad(-35 + 10 * smooth(t / D)), el = THREE.MathUtils.degToRad(32);
  const dist = size.length() * 2;
  camera.position.set(c.x + dist * Math.cos(el) * Math.sin(az), c.y + dist * Math.sin(el), c.z + dist * Math.cos(el) * Math.cos(az));
  camera.up.set(0, 1, 0); camera.lookAt(c);
  // fit the whole model in frame from this angle (projected box corners, 8% margin), then push in 5%
  camera.updateMatrixWorld();
  const aspect = CFG.width / CFG.height;
  let need = 0;
  for (let i = 0; i < 8; i++) {
    const v = new THREE.Vector3(i & 1 ? bounds.max.x : bounds.min.x, i & 2 ? bounds.max.y : bounds.min.y, i & 4 ? bounds.max.z : bounds.min.z)
      .applyMatrix4(camera.matrixWorldInverse);
    need = Math.max(need, Math.abs(v.y), Math.abs(v.x) / aspect);
  }
  const half = need * 1.08 * (1.05 - 0.05 * smooth(t / D));
  Object.assign(camera, { left: -half * aspect, right: half * aspect, top: half, bottom: -half });
  camera.updateProjectionMatrix();

  const warm = smooth((t - timeline.colour_from) / (timeline.colour_to - timeline.colour_from));
  const lift = size.y * 0.35;
  for (const e of els) {
    const { start, end, motion } = e.rec;
    const p = clamp((t - start) / Math.max(1e-3, end - start)), k = ease(p);
    e.obj.visible = p > 0;
    if (!e.obj.visible) continue;
    const off = new THREE.Vector3();
    if (motion === 'rise') off.y = -(1 - k) * Math.max(e.size.y * 1.2, lift * 0.15);
    else if (motion === 'drop') off.y = (1 - k) * lift * 0.4;
    else if (motion === 'slide') {
      const out = new THREE.Vector3(e.centre.x - c.x, 0, e.centre.z - c.z);
      if (Math.abs(out.x) / size.x > Math.abs(out.z) / size.z) out.set(Math.sign(out.x), 0, 0); else out.set(0, 0, Math.sign(out.z) || 1);
      off.copy(out.multiplyScalar((1 - k) * Math.max(size.x, size.z) * 0.12));
    }
    // positions are in the parent's space; offsets are small and axis-aligned, fine for a Y-up export
    e.obj.position.copy(e.base).add(off);
    const a = smooth(p * 1.6);
    e.mat.opacity = a; e.mat.transparent = a < 1; e.mat.depthWrite = a > 0.5;
    e.mat.color.setRGB(1, 1, 1).lerp(e.colour, warm);
    e.edge.material.opacity = a * (1 - 0.7 * warm);
  }
  hemi.intensity = 1.6 - 0.3 * warm;
  renderer.render(scene, camera);
}

window.renderFrame = renderFrame;
window.renderAt = (t, type = 'image/jpeg', q = 0.94) => { renderFrame(t); return canvas.toDataURL(type, q); };
load().then(() => { renderFrame(Q.has('t') ? +Q.get('t') : 0); window.ready = true; })
  .catch(err => { document.body.dataset.error = String(err); window.loadError = String(err); console.error(err); });
