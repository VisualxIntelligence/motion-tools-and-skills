// Photo parallax: one photo, rebuilt as depth meshes, filmed with a moving camera.
// Time-pure: renderFrame(t) draws second t from nothing but t, so any frame can be rendered in any order.
//
// Query: ?layers=layers/  move=dolly-in|dolly-out|truck-left|truck-right|crane-up|orbit|vertigo
//        amount=1 (scales the move)  duration=6  fps=30  w=1920  h=1080  zoom=1.06 (overscan so moves never
//        show the photo's edge)  ease=inout|in|out|linear  hold=0.4 (seconds still at each end)  t=<seconds>
//        fx, fy = where the frame sits in the photo, 0..1 (default: centred on the nearest card, as far as the
//        photo allows; matters when the output's shape differs from the photo's, e.g. 9:16 from a 4:3 photo)
//
// The camera starts where the photo was taken, with the photo's own lens, so the first frame of dolly, crane and
// vertigo is the photo itself (cropped and overscanned). Truck and orbit swing both ways and pass through that point
// at mid-shot, which keeps the distortion on each side small.
import * as THREE from 'three';

const Q = new URLSearchParams(location.search);
const DIR = (Q.get('layers') || 'layers/').replace(/\/?$/, '/');
const MOVE = Q.get('move') || 'dolly-in';
const AMOUNT = +(Q.get('amount') || 1);
const DURATION = +(Q.get('duration') || 6), FPS = +(Q.get('fps') || 30);
const OW = +(Q.get('w') || 1920), OH = +(Q.get('h') || 1080);
const FX = Q.get('fx'), FY = Q.get('fy');
const ZOOM = +(Q.get('zoom') || 1.06), HOLD = +(Q.get('hold') || 0.4), EASE = Q.get('ease') || 'inout';
window.timeline = { duration: DURATION, fps: FPS, move: MOVE, amount: AMOUNT, size: [OW, OH] };

const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(OW, OH, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
const camera = new THREE.PerspectiveCamera(50, OW / OH, 0.05, 1e6);

let L, baseFov, zSubject, zBack, crop, pivot;

const tex = (url) => new Promise((ok, no) => new THREE.TextureLoader().load(url, (t) => {
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.generateMipmaps = true; ok(t);
}, undefined, () => no(new Error(`cannot load ${url}`))));
const f32 = async (url) => { const r = await fetch(url); if (!r.ok) throw new Error(`cannot load ${url}`); return new Float32Array(await r.arrayBuffer()); };

// A grid mesh over a box of the photo [x0,y0,x1,y1], each vertex pushed out along its camera ray to depth z.
function depthMesh(z, gw, gh, box, map, transparent) {
  const [W, H] = L.size, f = L.focal_px, [x0, y0, x1, y1] = box;
  const geo = new THREE.PlaneGeometry(1, 1, gw - 1, gh - 1);
  const pos = geo.attributes.position, uv = geo.attributes.uv;
  for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) {
    const k = j * gw + i;                                      // PlaneGeometry: rows top to bottom, columns left to right
    const px = x0 + (x1 - x0) * i / (gw - 1), py = y0 + (y1 - y0) * j / (gh - 1), d = z[k];
    pos.setXYZ(k, (px - W / 2) * d / f, -(py - H / 2) * d / f, -d);
    uv.setXY(k, i / (gw - 1), 1 - j / (gh - 1));
  }
  geo.computeBoundingSphere();
  const mat = new THREE.MeshBasicMaterial({ map, transparent, alphaTest: transparent ? 0.02 : 0, depthWrite: !transparent, side: THREE.DoubleSide });
  return new THREE.Mesh(geo, mat);
}

async function load() {
  L = await (await fetch(DIR + 'layers.json')).json();
  const [W, H] = L.size, f = L.focal_px;
  // The camera has the photo's own frustum (focal length, full picture); the output frame is a window into it
  // (setViewOffset), the largest one of the output's shape, overscanned by zoom. No letterbox, no distortion.
  baseFov = 2 * Math.atan(H / 2 / f) * 180 / Math.PI;
  camera.aspect = W / H;
  const cw0 = Math.min(W, H * OW / OH);
  crop = { w0: cw0, h0: cw0 * OH / OW };
  const plateMap = await tex(DIR + (L.fill ? L.plate.filled : L.plate.file)).catch(() => tex(DIR + L.plate.file));
  const plate = depthMesh(await f32(DIR + L.plate.depth), ...L.plate.grid, [0, 0, W, H], plateMap, false);
  plate.renderOrder = 0;
  scene.add(plate);
  let order = 1;
  for (const c of L.cards) {                                  // sorted far to near by layers.py
    const m = depthMesh(await f32(DIR + c.depth), ...c.grid, c.box, await tex(DIR + c.file), true);
    m.renderOrder = order++;
    scene.add(m);
  }
  // Pivot and scale of the moves: the nearest card's depth (the subject), the plate's median (the background).
  zBack = L.plate.median_z;
  const near = L.cards[L.cards.length - 1];
  zSubject = near ? near.median_z : zBack * 0.5;
  crop.fx = FX != null ? +FX : near ? (near.centre ? near.centre[0] : (near.box[0] + near.box[2]) / 2) / W : 0.5;
  crop.fy = FY != null ? +FY : 0.5;
  const px = crop.fx * W, py = crop.fy * H;                  // orbit and crane pivot: the subject, at the frame's centre
  pivot = new THREE.Vector3((px - W / 2) * zSubject / f, -(py - H / 2) * zSubject / f, -zSubject);
}

// The output window into the photo at zoom k, kept inside the picture.
function view(k) {
  const [W, H] = L.size, w = crop.w0 / k, h = crop.h0 / k;
  const cx = Math.min(W - w / 2, Math.max(w / 2, crop.fx * W)), cy = Math.min(H - h / 2, Math.max(h / 2, crop.fy * H));
  return [W, H, cx - w / 2, cy - h / 2, w, h];
}

const ease = (u) => ({ linear: u, in: u * u * u, out: 1 - (1 - u) ** 3,
  inout: u < 0.5 ? 4 * u ** 3 : 1 - (-2 * u + 2) ** 3 / 2 })[EASE] ?? u;

// Camera at time t: position, rotation and lens. Distances scale with the subject's depth, so amount=1 reads about
// the same on any photo. Rotations turn about the subject (pivot), so the subject stays put in frame.
function cameraAt(t) {
  const span = Math.max(1e-6, DURATION - 2 * HOLD);
  const u = ease(Math.min(1, Math.max(0, (t - HOLD) / span)));
  const s = zSubject * AMOUNT, p = new THREE.Vector3(), q = new THREE.Quaternion();
  let fov = baseFov;
  const around = (axis, a) => { q.setFromAxisAngle(axis, a); p.copy(pivot).negate().applyQuaternion(q).add(pivot); };
  switch (MOVE) {
    case 'dolly-in': p.set(0, 0, -0.12 * s * u); break;
    case 'dolly-out': p.set(0, 0, -0.12 * s * (1 - u)); break;
    case 'truck-left': p.set(-0.06 * s * (u - 0.5) * 2, 0, 0); break;
    case 'truck-right': p.set(0.06 * s * (u - 0.5) * 2, 0, 0); break;
    case 'crane-up': around(new THREE.Vector3(1, 0, 0), -0.05 * AMOUNT * u); break;   // rise on an arc, looking down at the subject
    case 'orbit': around(new THREE.Vector3(0, 1, 0), (u - 0.5) * 2 * 0.05 * AMOUNT); break;
    case 'vertigo': {                                       // dolly back while zooming in: the subject holds its size, the background looms
      const dz = 0.5 * s * u;                               // (the reverse, dolly in + widen, would need picture outside the photo)
      p.set(0, 0, dz);
      fov = 2 * Math.atan(Math.tan(baseFov * Math.PI / 360) * zSubject / (zSubject + dz)) * 180 / Math.PI;
      break;
    }
    default: throw new Error(`unknown move ${MOVE}`);
  }
  return { p, q, fov };
}

function place(c, k) {
  camera.position.copy(c.p);
  camera.quaternion.copy(c.q);
  camera.fov = c.fov;
  camera.setViewOffset(...view(k));
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
}

// One overscan for the whole shot: the smallest extra zoom that keeps the photo's border out of every frame.
let guard = 1, border = [];
function coverZoom(c, k0) {
  place(c, k0);
  let k = 1;
  const v = new THREE.Vector3();
  for (const [b, side] of border) {
    v.copy(b).project(camera);
    if (v.z > 1) continue;
    const along = side === 'l' || side === 'r' ? v.y : v.x, across = side === 'l' || side === 'r' ? v.x : v.y;
    if (Math.abs(along) > 1.15) continue;                   // only the part of the border that faces the frame
    const inside = side === 'l' || side === 'b' ? -across : across;
    if (inside < 1 && inside > 0) k = Math.max(k, 1 / inside);
    if (inside <= 0) k = Math.max(k, 4);                    // border past the centre: give up and zoom a lot (move too big)
  }
  return k;
}
function shotGuard() {
  const plate = scene.children[0], pos = plate.geometry.attributes.position, [gw, gh] = L.plate.grid;
  for (let i = 0; i < gw; i += 2) { border.push([new THREE.Vector3().fromBufferAttribute(pos, i), 't'], [new THREE.Vector3().fromBufferAttribute(pos, (gh - 1) * gw + i), 'b']); }
  for (let j = 0; j < gh; j += 2) { border.push([new THREE.Vector3().fromBufferAttribute(pos, j * gw), 'l'], [new THREE.Vector3().fromBufferAttribute(pos, j * gw + gw - 1), 'r']); }
  for (let pass = 0; pass < 2; pass++) {                   // twice: zooming changes which border points are in view
    let k = 1;
    for (let t = 0; t <= DURATION + 1e-6; t += 0.1) k = Math.max(k, coverZoom(cameraAt(t), ZOOM * guard));
    guard *= k * (k > 1 ? 1.01 : 1);
  }
  window.timeline.guard = +guard.toFixed(4);
}
function renderFrame(t) {
  place(cameraAt(t), ZOOM * guard);
  renderer.render(scene, camera);
}

window.renderFrame = renderFrame;
window.renderAt = (t, type = 'image/jpeg', q = 0.94) => { renderFrame(t); return canvas.toDataURL(type, q); };
load().then(() => { shotGuard(); renderFrame(Q.has('t') ? +Q.get('t') : 0); window.ready = true; })
  .catch(err => { document.body.dataset.error = String(err); window.loadError = String(err); console.error(err); });
