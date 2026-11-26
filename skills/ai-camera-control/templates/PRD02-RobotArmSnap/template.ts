// PRD02-RobotArmSnap
// Copied from engine/cinematic/src/templates/products/p02-robot-arm-snap.ts (all of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh PRD02-RobotArmSnap
// PRD02-RobotArmSnap: a motion-control arm (the Bolt) rockets in from across the studio and stops dead on the pill,
// then snaps to two more angles. Each stop lands on a beat: 2.0, 4.0 and 6.0 s (120 bpm).
import * as THREE from "three";
import { aimFor } from "../../framer";
import { GREY, clay, shadeAll } from "../../kit/clay";
import { crate } from "../../kit/props";
import type { Cam } from "../../shots";
import type { Piece } from "../../piece";
import { clamp, lerp } from "../../util";
import { makeProduct, pillActor, plinth, studioFloor, V, type KitWorld } from "./shared";

// ---------------- the pill and the three stops ----------------
const TOP = 0.9;                                   // plinth top
const MID = V(0, TOP + 0.12, 0);                   // the pill's middle
const DOT = V(0, TOP + 0.24 * 0.62, 0.0624);       // the face of its white dot (the pill faces +z)

type Pose = { az: number; el: number; d: number; mm: number; look: THREE.Vector3; at: [number, number] };
const RAD = Math.PI / 180;
/** a camera position from the pill's middle: `az` degrees round from its front, `el` degrees up, `d` metres out */
const sph = (az: number, el: number, d: number) => MID.clone().add(V(Math.sin(az * RAD) * Math.cos(el * RAD), Math.sin(el * RAD), Math.cos(az * RAD) * Math.cos(el * RAD)).multiplyScalar(d));
const mix = (a: Pose, b: Pose, k: number): Pose => ({ az: lerp(a.az, b.az, k), el: lerp(a.el, b.el, k), d: lerp(a.d, b.d, k), mm: a.mm * Math.pow(b.mm / a.mm, k), look: a.look.clone().lerp(b.look, k), at: [lerp(a.at[0], b.at[0], k), lerp(a.at[1], b.at[1], k)] });
const shoot = (p: Pose, pos = sph(p.az, p.el, p.d)): Cam => ({ pos, target: aimFor(pos, p.look, p.mm, p.at), mm: p.mm });

// A: wide and far, 6 m back and 2.4 m up. 1: macro on the dot, 0.40 m off its face. 2: high three-quarter. 3: low hero.
const WIDE: Pose = { az: -22, el: 13.3, d: 6.0, mm: 24, look: DOT, at: [0, -0.12] };
const MACRO: Pose = { az: 0, el: 3.56, d: 0.4633, mm: 50, look: DOT, at: [0, 0] };
const HIGH: Pose = { az: 45, el: 38, d: 1.25, mm: 35, look: MID, at: [0, 0.1] };
const HERO: Pose = { az: 0, el: -8.3, d: 0.626, mm: 24, look: MID, at: [0, -0.16] };

// ---------------- timing ----------------
// The shutter is 1/48 s centred on each frame, so a move that ends half a frame before its beat leaves the frame on
// the beat fully still.
const LAND = 1 / 48;
const M1 = [2 - LAND - 0.7, 2 - LAND], M2 = [4 - LAND - 0.5, 4 - LAND], M3 = [6 - LAND - 0.6, 6 - LAND];

/** a robot move's progress, 0 to 1: speed ramps up over the first `a` of the move, holds, and ramps down over the last
 *  `b` (smoothstep ramps, so neither speed nor acceleration jumps) */
function snap(t: number, [t0, t1]: number[], a: number, b: number) {
  const x = clamp((t - t0) / (t1 - t0)), area = 1 - a / 2 - b / 2, I = (y: number) => y * y * y - (y * y * y * y) / 2;
  if (x < a) return (a * I(x / a)) / area;
  if (x > 1 - b) return 1 - (b * I((1 - x) / b)) / area;
  return (a / 2 + x - a) / area;
}

// move 1's path: a curve that leaves the wide frame toward the pill's axis, joins it and comes straight in along the
// lens axis, walked by distance so the speed is the profile's
const PATH1 = (() => {
  const p0 = sph(WIDE.az, WIDE.el, WIDE.d), p3 = sph(MACRO.az, MACRO.el, MACRO.d);
  const c = new THREE.CubicBezierCurve3(p0, p0.clone().lerp(V(0, 1.3, 2.5), 0.55), p3.clone().add(V(0, 0, 1.9)), p3);
  const n = 800, pts = c.getPoints(n), len = [0];
  for (let i = 1; i <= n; i++) len.push(len[i - 1] + pts[i].distanceTo(pts[i - 1]));
  const L = len[n];
  return { L, at: (k: number) => { const s = clamp(k) * L; let i = 1; while (i < n && len[i] < s) i++; return pts[i - 1].clone().lerp(pts[i], (s - len[i - 1]) / Math.max(1e-9, len[i] - len[i - 1])); } };
})();

/** a swing from one stop to the next (round the pill, by angle, distance and lens), walked by the turn of the view so
 *  the head turns at the profile's rate and never faster */
function swing(a: Pose, b: Pose) {
  const n = 400, at = (u: number) => shoot(mix(a, b, u)), dir = (c: Cam) => c.target.clone().sub(c.pos).normalize(), turn = [0];
  for (let i = 1; i <= n; i++) turn.push(turn[i - 1] + dir(at(i / n)).angleTo(dir(at((i - 1) / n))));
  return (k: number): Cam => { const s = clamp(k) * turn[n]; let i = 1; while (i < n && turn[i] < s) i++; return at((i - 1 + (s - turn[i - 1]) / Math.max(1e-12, turn[i] - turn[i - 1])) / n); };
}
const SWING2 = swing(MACRO, HIGH), SWING3 = swing(HIGH, HERO);

function cam(t: number): Cam {
  if (t < M1[1]) { const k = snap(t, M1, 0.26, 0.26); return shoot(mix(WIDE, MACRO, k), PATH1.at(k)); }
  if (t < M2[1]) return SWING2(snap(t, M2, 0.28, 0.28));
  return SWING3(snap(t, M3, 0.3, 0.3));
}

// ---------------- the set: an open studio with things at every depth ----------------
const UP = V(0, 1, 0);
const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, ry = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), clay(c)); m.position.set(x, y, z); m.rotation.y = ry; return m; };
/** a round bar from a to b */
const strut = (a: THREE.Vector3, b: THREE.Vector3, r = 0.016, c: string = GREY.dark) => {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, a.distanceTo(b), 10), clay(c));
  m.position.copy(a).lerp(b, 0.5); m.quaternion.setFromUnitVectors(UP, b.clone().sub(a).normalize()); return m;
};
/** a light stand of height h at the origin: three legs, a pole, and a head (a softbox or a flag) */
function stand(h: number, head: "soft" | "flag" | "none") {
  const g = new THREE.Group();
  g.add(strut(V(0, 0.3, 0), V(0, h, 0), 0.02));
  for (let i = 0; i < 3; i++) { const a = (i * 2 * Math.PI) / 3 + 0.4; g.add(strut(V(0, 0.42, 0), V(Math.sin(a) * 0.5, 0.012, Math.cos(a) * 0.5), 0.012)); }
  if (head === "soft") { g.add(box(0.75, 0.75, 0.3, GREY.paper, 0, h, 0.1), box(0.8, 0.8, 0.04, GREY.set, 0, h, -0.06)); }
  if (head === "flag") { g.add(strut(V(0, h - 0.05, 0), V(0.5, h - 0.05, 0), 0.01), box(0.9, 0.6, 0.02, GREY.mid, 0.75, h - 0.3, 0)); }
  return shadeAll(g);
}
/** a boom: a stand whose arm reaches `reach` metres along +x and holds a hanging panel */
function boom(h: number, reach: number) {
  const g = stand(h, "none");
  g.add(strut(V(-0.5, h + 0.12, 0), V(reach, h - 0.1, 0), 0.016), box(0.22, 0.16, 0.16, GREY.dark, -0.55, h + 0.12, 0));
  for (const s of [-0.3, 0.3]) g.add(strut(V(reach + s - 0.35, h - 0.1, 0), V(reach + s - 0.35, h - 0.3, 0), 0.006));
  g.add(box(0.9, 0.55, 0.02, GREY.mid, reach - 0.35, h - 0.575, 0));
  return shadeAll(g);
}
/** a studio flat: a wall panel on two braces */
function flat(w: number, h: number) {
  const g = new THREE.Group();
  g.add(box(w, h, 0.07, GREY.light, 0, h / 2, 0));
  for (const s of [-1, 1]) g.add(strut(V(s * w * 0.3, h * 0.7, -0.04), V(s * w * 0.3, 0.03, -1.1), 0.025, GREY.mid), box(0.1, 0.06, 1.1, GREY.mid, s * w * 0.3, 0.03, -0.55));
  return shadeAll(g);
}
const put = (w: KitWorld, o: THREE.Object3D, x: number, z: number, ry = 0, y = 0) => { o.position.set(x, y, z); o.rotation.y = ry; return w.add(o); };

function build(w: KitWorld) {
  studioFloor(w);
  // the pill's stage: a low round riser and a slim plinth
  const riser = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.04, 72), clay(GREY.set, 0.9)); riser.position.y = 0.02; riser.castShadow = riser.receiveShadow = true; w.add(riser);
  w.add(plinth(TOP, 0.26));
  // in front, beside the camera's way in: these streak past the lens on the first move
  put(w, boom(2.9, 1.75), 1.9, 3.2, Math.PI);
  put(w, stand(2.1, "soft"), -2.9, 2.6, 2.2);
  put(w, stand(1.9, "soft"), 1.9, 2.0, -2.3);
  put(w, crate(0.5), -1.25, 1.7, 0.3); put(w, crate(0.6), 1.0, 2.4, -0.25);
  // beside and behind the pill
  put(w, stand(2.2, "soft"), -1.7, -1.5, 0.8);
  put(w, stand(2.4, "flag"), 2.6, -1.3, 0.3);
  put(w, flat(2.4, 3.0), -2.5, -3.7, 0.35);
  put(w, flat(2.4, 3.0), 3.0, -4.7, -0.5);
  put(w, crate(0.9), -1.6, -6.2, 0.4); put(w, crate(0.55), -1.55, -6.15, 0.9, 0.9);
  put(w, crate(0.6), -3.3, -0.9, 0.2);
  // low boxes on the floor by the riser: what the high angle looks down on
  w.add(shadeAll(box(0.5, 0.2, 0.3, GREY.set, -1.35, 0.1, -0.55, 0.5))); w.add(shadeAll(box(0.5, 0.1, 0.3, GREY.mid, -1.33, 0.25, -0.56, 0.75)));
  // far back: a rail of hanging rods
  const rail = new THREE.Group();
  rail.add(strut(V(-2.6, 0, 0), V(-2.6, 3.6, 0), 0.03), strut(V(2.6, 0, 0), V(2.6, 3.6, 0), 0.03), strut(V(-2.7, 3.6, 0), V(2.7, 3.6, 0), 0.03));
  [1.3, 0.8, 1.5, 1.0, 1.4, 0.7, 1.2].forEach((l, i) => rail.add(strut(V(-1.95 + i * 0.65, 3.6, 0), V(-1.95 + i * 0.65, 3.6 - l, 0), 0.035, GREY.mid)));
  put(w, shadeAll(rail), 0.3, -6.6, 0.08);
}

/** the kit's stripe texture is 64 px and stair-steps when the pill fills the frame: the same stripes, same two colours,
 *  redrawn once at 1024 px and filtered */
function crispStripes(w: KitWorld) {
  const root = w.actors.get("PILL")!.root; if (root.userData.crisp) return; root.userData.crisp = true;
  root.traverse((o) => {
    const mat = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined, old = mat?.map;
    if (!mat || !old || !(old as THREE.DataTexture).isDataTexture) return;
    const src = old.image.data as Uint8Array, m = old.image.width as number, n = 1024, px = new Uint8Array(n * n * 4);
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { const from = ((x + y) % (n / 2)) < n / 4 ? 0 : (m / 4) * 4, i = (y * n + x) * 4; px[i] = src[from]; px[i + 1] = src[from + 1]; px[i + 2] = src[from + 2]; px[i + 3] = 255; }
    const t = new THREE.DataTexture(px, n, n); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.copy(old.repeat); t.colorSpace = old.colorSpace;
    t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearMipmapLinearFilter; t.generateMipmaps = true; t.anisotropy = 8; t.needsUpdate = true;
    mat.map = t; mat.needsUpdate = true;
  });
}

/** the key's shadow: the shared fit spans 600 m of depth, so its bias is worth 12 cm and eats the shadow where a small
 *  product touches its plinth. Here the depth is cut to the studio (22 m) and the offsets set for a 12 cm pill */
function tick(w: KitWorld) {
  crispStripes(w);
  const s = w.light.key.shadow, c = s.camera as THREE.OrthographicCamera;
  c.near = 214 - 12; c.far = 214 + 10; c.updateProjectionMatrix();   // the key sits 214 m out (shadow 7): keep only the studio's depth
  s.normalBias = 0.004; s.bias = -0.00012;
}

export const PIECE: Piece = makeProduct(
  { id: "PRD02-RobotArmSnap", name: "Robot-arm snap", says: "Three angles on three beats: the camera crosses the studio in under a second, stops dead on the product, then snaps twice more.", use: "Launch films cut to music (sneakers, phones, drinks): any product that should feel fast and exact. The stops land at 2.0, 4.0 and 6.0 s, so a 120 bpm track drops straight under it.", numbers: "Held wide for 1.28 s: 24 mm, 6.0 m from the pill, lens 2.4 m up. Move 1: 5.7 m in 0.70 s on a descending curve, peak 11.0 m/s, 24 to 50 mm, dead still from 1.98 s on a macro of the dot, 0.40 m off its face. Move 2: 45° round and up in 0.50 s (view turns 57°, peak 159°/s) to 35 mm, 1.25 m out, looking down 39°. Move 3: 0.60 s (66°, peak 157°/s) down to 3 cm above the plinth top, 24 mm, 0.63 m out, looking up 11°, held 2.0 s. Inside the Bolt's 12 m/s and 180°/s.", avoid: "A soft landing or a settle after the stop: the frame on the beat is already still. Three stops that look alike: change distance, height and lens every time." },
  { sky: "studio", build, tick },
  [pillActor([0, TOP, 0], 0)],
  () => [{ start: 0, end: 8, label: "24>50>35>24mm  ROBOT-ARM SNAP x3", rig: "MOTION CONTROL ARM · BOLT", subject: "PILL", size: "WS", sizeEnd: "FS", stop: 8, shadow: 7, cam, cut: "Opens the template", flags: ["centre", "compound", "whip"] }],
);
