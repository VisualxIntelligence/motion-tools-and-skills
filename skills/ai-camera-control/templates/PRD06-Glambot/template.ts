// PRD06-Glambot
// Copied from engine/cinematic/src/templates/products/p06-glambot.ts (all of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh PRD06-Glambot
// PRD06-Glambot: the red-carpet robot-arm shot, timed from a real Glambot take, with a higher start so the move reads.
// It is one playback speed ramp over one robot move. The lens starts 5.5 m up, almost overhead, looking down 60° at
// carpet, rope and the star small in frame. It drops first and closes in last, so it levels out on the way down (the
// press, the curtain and the horizon rise into frame) and lands on a hips-up frame, then carries on round the star to
// a chest-up. Camera and world share one clock: normal speed for 1.3 s, then slow motion to the end, so the dive is
// fast and the rest is a slow creep that never stops.
// Azimuths are degrees round the star, 0 = +z (the lens side), 90 = +x; the press and the curtain are at -z.
import * as THREE from "three";
import { speedRamp } from "../../kit/stage";
import { GREY, clay, shadeAll } from "../../kit/clay";
import { pill } from "../../kit/pill";
import { CAPSULE } from "../../standins";
import { aimFor } from "../../framer";
import { lerp, rng, smoother } from "../../util";
import type { Cam } from "../../shots";
import type { Piece } from "../../piece";
import { makeProduct, personPill, studioFloor, V, type KitWorld, type PathKey } from "./shared";

const RAD = Math.PI / 180;
const CARPET_Y = 0.015;                        // the carpet's pile: the star stands on it
const EYE_Y = CARPET_Y + 1.75 * 0.925;         // the face dot's centre
const MM = 20;

// ---------------- time: normal speed for 1.3 s, then slow motion to the end ----------------
const SLOW = 0.08, END = 15;
const CLOCK = speedRamp([[0, 1], [1.3, 1], [2.1, SLOW], [END, SLOW]]);
const W_END = CLOCK(END);                      // 2.76 s of world time in 15 s of film

// ---------------- the robot's move, in WORLD seconds ----------------
const AZ0 = -23.5, AZ1 = 23.5;                 // the second leg drifts 47° to the camera's right
const R0 = 2.8, R2 = 1.6, R8 = 1.32;           // metres from the star's axis: the top, the end of the dive, the last frame
const H0 = 5.5, H2 = 1.64, H8 = 1.59;          // lens height at the same three moments
const DIVE = { up: [0.05, 0.45], down: [1.1, 1.7] };        // 0.4 s to reach speed, 0.6 s to brake into the arc
const ARC = { up: [1.45, 1.75] };                           // the arc takes over under the end of the braking
/** the dive's line at q 0..1, as [metres out, metres up]: it drops first and closes in last, so the lens levels out as it comes down */
const line = (q: number): [number, number] => [R0 + (R2 - R0) * q * q, H0 + (H2 - H0) * (1 - (1 - q) * (1 - q))];
// distance along that line, so the arm's speed follows its own timing and nothing else
const LINE = (() => {
  const N = 2000, len = [0]; let prev = line(0);
  for (let i = 1; i <= N; i++) { const p = line(i / N); len.push(len[i - 1] + Math.hypot(p[0] - prev[0], p[1] - prev[1])); prev = p; }
  return (k: number) => { const s = Math.min(1, Math.max(0, k)) * len[N]; let lo = 0, hi = N; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (len[m] < s) lo = m; else hi = m; } return line((lo + (s - len[lo]) / Math.max(1e-9, len[hi] - len[lo])) / N); };
})();
/** time spent at speed by w, for a speed that rises 0 to 1 between a and b and stays there */
const run = (w: number, a: number, b: number) => { const s = Math.min(1, Math.max(0, (w - a) / (b - a))); return (b - a) * (s * s * s - (s * s * s * s) / 2) + Math.max(0, w - b); };
/** how far down the dive the arm is, 0..1 of its length */
const dive = (w: number) => (run(w, DIVE.up[0], DIVE.up[1]) - run(w, DIVE.down[0], DIVE.down[1])) / (DIVE.down[1] - DIVE.up[1] - (DIVE.down[1] - DIVE.down[0]) / 2 + (DIVE.up[1] - DIVE.up[0]) / 2);
/** the arc round the star: it holds its speed to the last frame and past it */
const arc = (w: number) => run(w, ARC.up[0], ARC.up[1]) / run(W_END, ARC.up[0], ARC.up[1]);

// ---------------- the star: a 50° turn that leads the lens round, begun at normal speed and ended in slow motion ----------------
const YAW1 = AZ1 * RAD, YAW0 = YAW1 - 50 * RAD;  // starts 3° off the first camera position, ends facing the last
const TURN = { t0: 0.9, dur: 1.8 };             // world seconds: film 0.9 s to about 14 s, a few degrees ahead of the lens all the way
const yawAt = (w: number) => lerp(YAW0, YAW1, smoother((w - TURN.t0) / TURN.dur));
const STAR_AT: [number, number, number] = [0, CARPET_Y, 0];
// a prop's yaw chases its nearest key (8% each 1/60 s), so two keys give a turn that starts with a jerk. These keys
// sit a step apart and lead the curve by that lag, so the planned facing follows yawAt; tick sets the exact angle
const STAR_PATH: PathKey[] = (() => {
  const keys: PathKey[] = [{ t: 0, at: STAR_AT, yaw: YAW0 }];
  for (let n = Math.floor(TURN.t0 * 60) - 1; n <= Math.ceil((TURN.t0 + TURN.dur) * 60) + 2; n++) {
    const a = yawAt((n - 1) / 60), b = yawAt(n / 60);
    keys.push({ t: n / 60, at: STAR_AT, yaw: a + (b - a) / 0.08 });
  }
  return keys;
})();

const TOP = V(0, CARPET_Y + 1.75, 0);                                    // the aim holds the head top: a third up the frame from overhead, 17% down once close
const FACE = V(Math.sin(YAW1) * 0.27, EYE_Y, Math.cos(YAW1) * 0.27);     // the dot where the turn ends
const robot = (w: number): Cam => {
  const k = dive(w), c = arc(w), [rd, hd] = LINE(k);
  // the angle runs a little faster as the radius closes, so the lens keeps one speed round the arc
  const a = lerp(AZ0, AZ1, Math.log(R2 / (R2 + (R8 - R2) * c)) / Math.log(R2 / R8)) * RAD, r = rd + (R8 - R2) * c;
  const pos = V(Math.sin(a) * r, hd + (H8 - H2) * c, Math.cos(a) * r);
  return { pos, target: aimFor(pos, TOP, MM, [0, lerp(0.32, 0.66, k)]), mm: MM };
};
/** the film's camera: the robot's move played through the speed ramp */
const glambot = (t: number): Cam => robot(CLOCK(t));

// ---------------- confetti: paper falling at its own speed on the world clock ----------------
type Flake = { x: number; y: number; z: number; v: number; amp: number; w: number; ph: number; s: number; axis: THREE.Vector3; spin: number };
const REST = CARPET_Y + 0.003;
const flakeAt = (f: Flake, w: number, out: THREE.Vector3) => {
  const tau = Math.min(Math.max(0, w), (f.y - REST) / f.v);          // it stops where it lands
  return out.set(f.x + f.amp * Math.sin(f.w * tau + f.ph), f.y - f.v * tau, f.z + f.amp * Math.cos(f.w * 0.83 * tau + 2 * f.ph));
};
const FLAKES: Flake[] = (() => {
  const r = rng(41), out: Flake[] = [], p = new THREE.Vector3(), line = new THREE.Line3(), near = new THREE.Vector3();
  const times = Array.from({ length: END * 96 + 1 }, (_, i) => i / 96), cams = times.map((t) => glambot(t).pos), ws = times.map(CLOCK);
  for (let tries = 0; out.length < 900 && tries < 14000; tries++) {
    const f: Flake = { x: (r() - 0.5) * 9, y: 0.1 + r() * 8.4, z: -2.2 + r() * 5.6, v: 0.9 + r() * 0.45, amp: 0.03 + r() * 0.03, w: 4 + r() * 3.5, ph: r() * 6.28, s: 0.022 + r() * 0.02,
      axis: V(r() - 0.5, r() - 0.5, r() - 0.5).normalize(), spin: (5 + r() * 8) * (r() < 0.5 ? -1 : 1) };
    if (Math.hypot(f.x, f.z) < 0.27 + f.amp + 0.09) continue;                                   // never onto the star
    // never at the lens, and never hanging between the lens and the face
    if (times.some((_, i) => { flakeAt(f, ws[i], p); return p.distanceTo(cams[i]) < 0.6 || line.set(cams[i], FACE).closestPointToPoint(p, true, near).distanceTo(p) < 0.2; })) continue;
    out.push(f);
  }
  return out;
})();

// ---------------- the press: ten photographers 3.5 to 4.2 m behind the star; flashes in world seconds ----------------
const WHITE = "#f0f0ec";
const PRESS: { at: [number, number]; hex: string; fire: number[] }[] = [
  { at: [-8.6, -3.8], hex: WHITE, fire: [0.75] },
  { at: [-6.9, -4.1], hex: CAPSULE.slate.hex, fire: [2.55] },
  { at: [-5.2, -3.7], hex: CAPSULE.rose.hex, fire: [0.2, 2.23, 2.71] },
  { at: [-3.9, -3.5], hex: CAPSULE.sage.hex, fire: [1.2, 2.07, 2.47] },
  { at: [-1.4, -4.2], hex: WHITE, fire: [1.45, 1.66, 1.91] },
  { at: [0.8, -4.1], hex: CAPSULE.plum.hex, fire: [2.39, 2.63] },
  { at: [1.6, -3.6], hex: CAPSULE.stone.hex, fire: [0.95, 1.99, 2.31] },
  { at: [4.2, -4.0], hex: CAPSULE.slate.hex, fire: [1.83, 2.15] },
  { at: [6.4, -3.7], hex: CAPSULE.rose.hex, fire: [0.5, 1.6] },
  { at: [11.4, -4.1], hex: CAPSULE.sage.hex, fire: [1.05, 1.72] },
];
const pop = (w: number, fire: number[]) => { let e = 0; for (const f of fire) { const d = w - f; if (d >= 0) e = Math.max(e, d < 0.006 ? d / 0.006 : Math.exp(-(d - 0.006) / 0.028)); } return e; };

// ---------------- the set ----------------
const box = (w: number, h: number, d: number, c: string) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), clay(c));
const cyl = (r: number, h: number, c: string, seg = 20) => new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), clay(c));
const put = <T extends THREE.Object3D>(o: T, x: number, y: number, z: number) => { o.position.set(x, y, z); return o; };
const faceStar = (x: number, z: number) => Math.atan2(-x, -z);

/** a rope post, its base on the carpet */
function post() {
  const g = new THREE.Group();
  g.add(put(cyl(0.17, 0.025, GREY.dark, 28), 0, 0.0125, 0), put(cyl(0.022, 0.93, GREY.light, 14), 0, 0.49, 0));
  g.add(put(new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 12), clay(GREY.light)), 0, 0.98, 0));
  return g;
}
/** a rope hung between two post tops */
function rope(a: THREE.Vector3, b: THREE.Vector3) {
  const pts = Array.from({ length: 13 }, (_, i) => { const k = i / 12, p = a.clone().lerp(b, k); p.y -= 0.2 * 4 * k * (1 - k); return p; });
  return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.016, 8), clay(GREY.dark));
}
/** a backlight on a tall stand: a lamp housing with a near-white disc on its face (+z) */
function backlight(h: number) {
  const g = new THREE.Group();
  g.add(put(cyl(0.025, h, GREY.dark, 10), 0, h / 2, 0), put(cyl(0.3, 0.03, GREY.dark, 24), 0, 0.015, 0));
  const can = cyl(0.23, 0.3, GREY.dark, 28); can.rotation.x = Math.PI / 2; g.add(put(can, 0, h, 0));
  shadeAll(g);
  g.add(put(new THREE.Mesh(new THREE.CircleGeometry(0.2, 32), clay(GREY.paper, 0.6, { emissive: "#ffffff", ei: 2.4 })), 0, h, 0.152));
  return g;
}
/** a tall pleated curtain, its folds toward +z */
function curtain(w: number, h: number) {
  const geo = new THREE.PlaneGeometry(w, h, Math.round(w * 24), 1), p = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i); p.setZ(i, 0.045 * Math.sin(x * 7.3) + 0.03 * Math.sin(x * 16.9 + 1) + 0.03 * Math.sin(x * 3.1 + 2)); }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, clay(GREY.set, 0.96, { side: THREE.DoubleSide })); m.position.y = h / 2; m.receiveShadow = true;
  return m;
}

function build(w: KitWorld) {
  studioFloor(w);
  const set = new THREE.Group();
  // the carpet: 32 m long, from the rope line (z -2.65) to well behind the camera's start (z 7)
  const carpet = put(new THREE.Mesh(new THREE.BoxGeometry(32, CARPET_Y, 9.65), clay(GREY.dark, 0.98)), 0, CARPET_Y / 2, 2.175); carpet.receiveShadow = true; set.add(carpet);
  // rope posts along the carpet's far edge, between the star and the press
  const posts = new THREE.Group();
  for (let i = 0; i < 19; i++) { const x = -13.6 + i * 1.6; posts.add(put(post(), x, CARPET_Y, -2.5)); if (i) posts.add(rope(V(x - 1.6, CARPET_Y + 0.9, -2.5), V(x, CARPET_Y + 0.9, -2.5))); }
  set.add(shadeAll(posts));
  // the curtain behind everything, and two backlights high in front of it, turned to the star
  set.add(put(curtain(46, 9), 0, 0, -6.6));
  for (const x of [-6.6, 5.2]) { const b = backlight(2.5); b.position.set(x, 0, -5.6); b.rotation.y = faceStar(x, -5.6); set.add(b); }
  // the press: person pills behind the rope, each with a camera and a flash that pops
  PRESS.forEach((p, i) => {
    const g = new THREE.Group(); g.add(pill(1.75, 0.27, p.hex, 0.925));
    g.add(put(box(0.2, 0.13, 0.1, GREY.dark), 0, 1.36, 0.33), put(box(0.1, 0.07, 0.06, GREY.set), 0, 1.47, 0.34));
    const lens = cyl(0.045, 0.08, GREY.ink, 16); lens.rotation.x = Math.PI / 2; g.add(put(lens, 0, 1.36, 0.42));
    shadeAll(g);
    const glow = new THREE.Mesh(new THREE.CircleGeometry(0.15, 24), new THREE.MeshStandardMaterial({ color: "#f4f4f2", roughness: 0.6, emissive: "#ffffff", emissiveIntensity: 0 }));
    glow.position.set(0, 1.47, 0.375); glow.scale.setScalar(0.3); g.add(glow); w.parts.set("flash" + i, glow);
    g.position.set(p.at[0], 0, p.at[1]); g.rotation.y = faceStar(p.at[0], p.at[1]); set.add(g);
  });
  w.add(set);
  const flakes = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), clay("#e6e5e0", 0.85, { side: THREE.DoubleSide, emissive: "#ffffff", ei: 0.08 }), FLAKES.length);
  flakes.castShadow = false; flakes.frustumCulled = false; flakes.userData.noPathTrace = true;
  w.add(flakes, "confetti");
}

const tmp = new THREE.Object3D(), FLAT = new THREE.Quaternion().setFromAxisAngle(V(1, 0, 0), -Math.PI / 2), qa = new THREE.Quaternion();
function tick(w: KitWorld, t: number) {
  const star = w.actors.get("STAR"); if (star) star.root.rotation.y = yawAt(t);          // the exact turn (the path keys carry it to within the table's step)
  const flakes = w.parts.get("confetti") as THREE.InstancedMesh | undefined;
  if (flakes) {
    FLAKES.forEach((f, i) => {
      flakeAt(f, t, tmp.position);
      const tau = Math.max(0, t);
      if (tau >= (f.y - REST) / f.v) tmp.quaternion.setFromAxisAngle(V(0, 1, 0), f.ph).multiply(FLAT);      // lying where it fell
      else tmp.quaternion.setFromAxisAngle(f.axis, f.spin * tau + f.ph).multiply(qa.setFromAxisAngle(V(0, 1, 0), f.ph * 3));
      tmp.scale.setScalar(f.s); tmp.updateMatrix(); flakes.setMatrixAt(i, tmp.matrix);
    });
    flakes.instanceMatrix.needsUpdate = true;
  }
  PRESS.forEach((p, i) => {
    const glow = w.parts.get("flash" + i) as THREE.Mesh | undefined; if (!glow) return;
    const e = pop(t, p.fire);
    (glow.material as THREE.MeshStandardMaterial).emissiveIntensity = 9 * e; glow.scale.setScalar(0.3 + 0.7 * Math.sqrt(e));
  });
}

export const PIECE: Piece = makeProduct(
  { id: "PRD06-Glambot", name: "Glambot",
    says: "The red-carpet robot shot: the lens drops in on a pose and time falls into slow motion as it arrives, so the move never stops.",
    use: "A person arriving or being revealed at an event, a fashion or beauty moment, a presenter with a product: one gesture, one take.",
    numbers: "20 mm throughout, 15 s. The arm travels 5.5 m in 2.8 s of real time, peaking at 3.8 m/s. It starts 5.5 m up and 2.8 m out, looking down 60° (carpet, rope and the star at 23% of frame height, no horizon), drops first and closes in last so the tilt eases to 32° down at 1.0 s and 10° down at 1.5 s (the horizon enters at 1.2 s), and lands on a hips-up frame at eye height 1.3 m off by 1.9 s. Then 47° round the star to a chest-up frame 1.05 m off. Camera and world share one clock: normal speed to 1.3 s, eased to 0.08 by 2.1 s, so the rest is a steady 0.084 m/s creep, still moving on the last frame. The star turns 50° with the lens from 0.9 s.",
    avoid: "A hold at either end, a level start (it reads as a plain push in) or a second gesture: the arm never stops, and the slow motion has room for one move of the body." },
  { sky: "studio", build, tick, clock: CLOCK },
  [personPill("STAR", "Star", STAR_AT, YAW0, STAR_PATH)],
  () => [{ start: 0, end: END, label: "20mm  GLAMBOT DIVE AND CREEP", rig: "HIGH-SPEED ROBOT ARM", subject: "STAR", size: "WS", sizeEnd: "MCU", stop: 8, shadow: 26, cam: glambot,
    flags: ["compound", "centre", "exits-moving"], cut: "Opens the template", note: "One speed ramp: clock 1 to 1.3 s, 0.08 from 2.1 s. Camera and world share it; the robot never stops" }],
);
