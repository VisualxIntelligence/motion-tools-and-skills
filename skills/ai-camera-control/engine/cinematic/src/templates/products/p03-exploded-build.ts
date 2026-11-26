// PRD03-ExplodedBuild: the pill hangs over its plinth cut into slices; the camera flies through the widest gap, whips
// round on the far side, and the slices snap shut behind it from the bottom up into the finished pill.
// The lens passes 4.6 cm (real) from the cut faces, so this world is built 5 times real size: the pill is 1.2 m here.
// Every length in this file is in built metres; divide by 5 for the real figure.
import * as THREE from "three";
import { pill } from "../../kit/pill";
import { GREY, clay, shadeAll } from "../../kit/clay";
import { clamp, smoother } from "../../util";
import type { Cam } from "../../shots";
import type { Piece } from "../../piece";
import { V, makeProduct, pillActor, plinth, studioFloor, type KitWorld } from "./shared";

const rad = THREE.MathUtils.degToRad;
const N = 5, H = 0.24 * N, R = 0.06 * N;
const PT = 0.4;                                          // the plinth's top
const CUT = [0, 0.3, 0.45, 0.6, 0.9, 1.2];               // the slices: dome, ring, ring, face ring (it carries the dot), dome
const EX = [0.28, 0.56, 1.08, 1.36, 1.64];               // how far each hangs above its place; the 0.52 gap is the one flown through
const LAND = [4.75, 4.93, 5.11, 5.29, 5.47], CLOSE = 0.42;   // when each lands, and how long its closing takes
const SPIN = [-9, 16, -12, 14, 7], OFF = [25, -35, 30, -27, -22];   // adrift: deg/s, and degrees out of line when the closing starts
const CORE = 0.18;                                       // the rings are hollow: the loose bits end up in this core
const GAP_Y = PT + CUT[2] + (EX[1] + EX[2]) / 2;         // the middle of the flown gap
const FAR = 67, FRONT = 0, AE = rad(FRONT);              // degrees round the pill: the side the camera flies out on, and the beauty angle (the pill's front)

/** slice i at world time t: its height above its place, its turn about the axis, and how much drift it has left */
export function slice(i: number, t: number) {
  const t0 = LAND[i] - CLOSE, u = clamp((t - t0) / CLOSE), free = 1 - smoother(u / 0.85);
  // the closing accelerates all the way and stops dead on contact (a snap, no settle)
  const lift = EX[i] * (1 - Math.pow(u, 2.4)) + 0.02 * Math.sin(t * (1.5 + 0.23 * i) + i * 1.9) * free;
  return { lift, turn: rad(OFF[i] + SPIN[i] * (t - t0)) * free, free };
}

/** the part of a geometry between two heights, cut cleanly (positions, normals and UVs carried across the cut) */
function slab(src: THREE.BufferGeometry, y0: number, y1: number) {
  const g = src.index ? src.toNonIndexed() : src, P = g.attributes.position, Nn = g.attributes.normal, U = g.attributes.uv, out: number[][] = [];
  const cut = (poly: number[][], y: number, above: boolean) => {
    const res: number[][] = [], inside = (v: number[]) => (above ? v[1] >= y - 1e-9 : v[1] <= y + 1e-9);
    poly.forEach((a, i) => {
      const b = poly[(i + 1) % poly.length];
      if (inside(a)) res.push(a);
      if (inside(a) !== inside(b)) { const k = (y - a[1]) / (b[1] - a[1]); res.push(a.map((v, j) => v + (b[j] - v) * k)); }
    });
    return res;
  };
  for (let i = 0; i < P.count; i += 3) {
    const tri = [0, 1, 2].map((j) => [P.getX(i + j), P.getY(i + j), P.getZ(i + j), Nn.getX(i + j), Nn.getY(i + j), Nn.getZ(i + j), U.getX(i + j), U.getY(i + j)]);
    const poly = cut(cut(tri, y0, true), y1, false);
    for (let j = 1; j + 1 < poly.length; j++) out.push(poly[0], poly[j], poly[j + 1]);
  }
  const o = new THREE.BufferGeometry();
  o.setAttribute("position", new THREE.Float32BufferAttribute(out.flatMap((v) => v.slice(0, 3)), 3));
  o.setAttribute("normal", new THREE.Float32BufferAttribute(out.flatMap((v) => v.slice(3, 6)), 3));
  o.setAttribute("uv", new THREE.Float32BufferAttribute(out.flatMap((v) => v.slice(6, 8)), 2));
  return o;
}

/** a small panel light on a stand (a tabletop set at this scale), its face toward +z */
function panelLight(wd = 1.6, ht = 2.2, lift = 1.5) {
  const g = new THREE.Group(), dark = clay(GREY.dark, 0.9);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, lift + ht / 2, 12), dark); pole.position.set(0, (lift + ht / 2) / 2, -0.2); g.add(pole);
  for (let i = 0; i < 3; i++) { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 1.1), dark); leg.rotation.y = (i * Math.PI * 2) / 3; leg.position.set(Math.sin(leg.rotation.y) * 0.5, 0.03, -0.2 + Math.cos(leg.rotation.y) * 0.5); g.add(leg); }
  const back = new THREE.Mesh(new THREE.BoxGeometry(wd, ht, 0.3), dark); back.position.y = lift + ht / 2; g.add(back);
  const face = new THREE.Mesh(new THREE.BoxGeometry(wd * 0.92, ht * 0.92, 0.04), clay(GREY.paper, 0.8, { emissive: "#ffffff", ei: 0.45 })); face.position.set(0, lift + ht / 2, 0.16); g.add(face);
  return shadeAll(g);
}

function build(w: KitWorld) {
  studioFloor(w);
  // a tabletop: a round stage with ticks on its rim and seams in the floor (the ground reads as moving under the camera)
  const stage = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.25, 0.05, 96), clay(GREY.paper, 0.9)); stage.position.y = 0.025; stage.receiveShadow = true; w.add(stage);
  for (let i = 0; i < 36; i++) { const a = (i / 36) * Math.PI * 2, n = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.012, 0.32), clay(GREY.mid)); n.position.set(Math.sin(a) * 2.95, 0.054, Math.cos(a) * 2.95); n.rotation.y = a; w.add(n); }
  for (let i = -8; i <= 8; i++) for (const turn of [0, Math.PI / 2]) { if (i === 0) continue; const s = new THREE.Mesh(new THREE.BoxGeometry(48, 0.01, 0.035), clay(GREY.set, 0.95)); s.position.set(turn ? i * 3 : 0, 0.005, turn ? 0 : i * 3); s.rotation.y = turn; w.add(s); }
  w.add(plinth(PT, 0.85));
  for (const [deg, r] of [[37, 9], [103, 10.5], [158, 10], [-63, 9]] as const) { const p = panelLight(); p.position.set(Math.sin(rad(deg)) * r, 0, Math.cos(rad(deg)) * r); p.rotation.y = rad(deg) + Math.PI; w.add(p); }

  // the pill itself (the kit's own, at 5x), cut into five slices: same skin, same stripes, the dot on the face ring
  const src = pill(H, R), body = src.children[0] as THREE.Mesh, dot = src.children[1] as THREE.Mesh;
  const skin = body.material as THREE.Material, white = dot.material as THREE.Material, bore = clay(GREY.mid, 0.9, { side: THREE.BackSide });
  const whole = (body.geometry as THREE.BufferGeometry).clone().translate(0, H / 2, 0);
  const stack = new THREE.Group(); stack.position.y = PT; stack.rotation.y = AE;
  for (let i = 0; i < 5; i++) {
    const y0 = CUT[i], y1 = CUT[i + 1], mid = (y0 + y1) / 2, ring = i > 0 && i < 4, g = new THREE.Group();
    g.add(new THREE.Mesh(slab(whole, y0, y1).translate(0, -mid, 0), skin));
    // the cut faces (off-white, like the dot); a ring's are open in the middle and it has a bore
    const face = (y: number, up: boolean) => { const f = new THREE.Mesh(ring ? new THREE.RingGeometry(CORE, R, 64) : new THREE.CircleGeometry(R, 64), white); f.rotation.x = up ? -Math.PI / 2 : Math.PI / 2; f.position.y = y - mid; f.name = up ? "up" : "down"; g.add(f); };
    if (i > 0) face(y0, false);
    if (i < 4) face(y1, true);
    if (ring) g.add(new THREE.Mesh(new THREE.CylinderGeometry(CORE, CORE, y1 - y0, 48, 1, true), bore));
    if (i === 3) { const d = dot.clone(); d.position.y -= mid; g.add(d); }
    g.userData.mid = mid; stack.add(shadeAll(g));
  }
  // the loose bits, striped like the pill: a disc under the rings, three pins through them, a disc on top
  const bit = (r: number, h: number) => new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 32), skin);
  const lower = bit(0.14, 0.05), upper = bit(0.14, 0.05), pins = new THREE.Group();
  for (let i = 0; i < 3; i++) { const p = bit(0.03, 0.48), a = (i / 3) * Math.PI * 2; p.position.set(Math.sin(a) * 0.1, 0, Math.cos(a) * 0.1); pins.add(p); }
  stack.add(shadeAll(lower), shadeAll(upper), shadeAll(pins));
  w.add(stack, "stack");
}

function tick(w: KitWorld, t: number) {
  // the actor stays as the subject (planner, focus, measuring) but the slices are the picture: hidden, at 5x, on the plinth
  const actor = w.actors.get("PILL")!.root; actor.visible = false; actor.scale.setScalar(N); actor.position.y = PT;
  const kids = w.parts.get("stack")!.children, s = [0, 1, 2, 3, 4].map((i) => slice(i, t));
  s.forEach((q, i) => {
    const g = kids[i];
    g.position.y = g.userData.mid + q.lift;
    g.rotation.set(rad(2) * Math.sin(t * 1.3 + i * 2.1) * q.free, q.turn, rad(2) * Math.sin(t * 1.1 + i * 1.3 + 1) * q.free);
    // two cut faces that have met are inside the pill: hidden, so the seam cannot sparkle
    const up = g.getObjectByName("up"), down = g.getObjectByName("down");
    if (up) up.visible = s[i + 1].lift - q.lift > 1e-6;
    if (down) down.visible = q.lift - s[i - 1].lift > 1e-6;
  });
  // each bit rides between its two neighbours, so it is boxed in as they close and never touches them
  const [lower, upper, pins] = [kids[5], kids[6], kids[7]];
  lower.position.y = 0.325 + (s[0].lift + s[1].lift) / 2; lower.rotation.set(rad(6) * Math.sin(t * 1.7) * s[1].free, t * 0.5 * s[1].free, rad(6) * Math.cos(t * 1.4) * s[1].free);
  upper.position.y = 0.87 + (s[3].lift + s[4].lift) / 2; upper.rotation.set(rad(6) * Math.sin(t * 1.5 + 2) * s[4].free, -t * 0.4 * s[4].free, rad(6) * Math.cos(t * 1.2 + 1) * s[4].free);
  pins.position.y = 0.6 + (s[2].lift + s[3].lift) / 2; pins.rotation.y = rad(20) * (t - LAND[3]) * s[3].free;
  pins.children.forEach((p, i) => { p.position.y = 0.012 * Math.sin(t * 2.1 + i * 2.2) * s[3].free; });
}

// ---------------- the camera ----------------
/** a curve through [time, value] keys that never overshoots, flat before and after, softened over ±blur seconds */
function mono(keys: [number, number][], blur = 0.1) {
  const n = keys.length, h: number[] = [], s: number[] = [], d: number[] = new Array(n).fill(0);
  for (let i = 0; i < n - 1; i++) { h.push(keys[i + 1][0] - keys[i][0]); s.push((keys[i + 1][1] - keys[i][1]) / h[i]); }
  for (let i = 1; i < n - 1; i++) if (s[i - 1] * s[i] > 0) { const a = 2 * h[i] + h[i - 1], b = h[i] + 2 * h[i - 1]; d[i] = (a + b) / (a / s[i - 1] + b / s[i]); }
  const raw = (t: number) => {
    if (t <= keys[0][0]) return keys[0][1];
    if (t >= keys[n - 1][0]) return keys[n - 1][1];
    let i = 0; while (t > keys[i + 1][0]) i++;
    const x = (t - keys[i][0]) / h[i], x2 = x * x, x3 = x2 * x;
    return (2 * x3 - 3 * x2 + 1) * keys[i][1] + (x3 - 2 * x2 + x) * h[i] * d[i] + (-2 * x3 + 3 * x2) * keys[i + 1][1] + (x3 - x2) * h[i] * d[i + 1];
  };
  return soft(raw, blur);
}
/** f averaged over ±w seconds (a tent), so its speed has no corners */
const soft = (f: (t: number) => number, w = 0.1) => (t: number) => { let o = 0; for (let k = -6; k <= 6; k++) o += f(t + (w * k) / 6) * (7 - Math.abs(k)); return o / 49; };

// along the flight line: metres from the pill's axis (negative on the near side); it crosses the axis at 3.4 s
const along = mono([[0.7, -6.0], [2.4, -4.85], [3.4, 0], [3.62, 1.0], [4.3, 2.1], [5.1, 2.75], [5.8, 3.0]]);
const height = mono([[0.7, 2.0], [3.0, GAP_Y], [3.7, GAP_Y], [5.8, 1.55]]);
const aimBefore = mono([[0.7, 1.55], [2.8, GAP_Y]]);                   // the height looked at on the way in: the whole stack, then the gap
const aimAfter = mono([[3.7, GAP_Y], [4.4, 1.5], [5.6, 0.92]]);        // and on the way round: it follows the stack down to the pill
const azim = mono([[3.4, FAR], [3.9, 56], [4.5, 28], [5.1, 8], [5.8, FRONT]]);   // the arc from the far side round to the beauty angle, degrees
const whip = soft((t) => smoother((t - 3.38) / 0.75), 0.06);              // the look whips back to the pill as the lens leaves the gap

function camera(mm: number) {
  return (t: number): Cam => {
    const r = along(t), a = rad(azim(t)), y = height(t), b = whip(t);
    const pos = V(Math.sin(a) * r, y, Math.cos(a) * r);
    const yaw = a - Math.PI * b;
    const pitch = r < 0 ? Math.atan2(aimBefore(t) - y, -r) : b * Math.atan2(aimAfter(t) - y, Math.max(r, 0.25));
    const dir = V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
    return { pos, target: pos.clone().add(dir.multiplyScalar(clamp(Math.abs(r), 2, 11))), mm };
  };
}

export const PIECE: Piece = makeProduct(
  { id: "PRD03-ExplodedBuild", name: "Exploded build",
    says: "It is made of parts and every part has its place: we go through the middle of it, and it closes into one thing behind us.",
    use: "A product whose build is the selling point (layers, ingredients, components). The reveal after the features, ending on the pack shot.",
    numbers: "21 mm probe lens on a motion-control arm, T8. Built 5 times real size so the lens clears the parts; real-scale figures: opens 1.2 m out and holds 0.6 s, pushes 0.23 m in 1.8 s, then accelerates to 1.2 m/s and crosses the pill's axis at 3.4 s through a 10.4 cm gap, 4.6 cm from each cut face. A 180° whip in 0.75 s (peak 474°/s) as it brakes, then a 67° arc out to 0.6 m while the five slices land 0.18 s apart (4.75 to 5.47 s, each closing in 0.42 s to a dead stop). Still from 5.9 s, 12° above the pill, held 2.1 s. Path 2.07 m.",
    avoid: "A tight gap or a slow pass: the fly-through reads only when both cut faces streak past the lens. Never end on a side the front is not facing." },
  { sky: "studio", build, tick, keyDir: [-0.45, 0.77, 0.45], motes: { center: [0, 1.6, -4], size: [5.6, 3, 5], count: 70, drift: [0.02, 0.006, 0.012] } },
  [pillActor([0, PT + H / 2 - 0.12, 0], AE)],
  () => [{ start: 0, end: 8, label: "21mm  THROUGH THE GAP > WHIP ROUND > BEAUTY", rig: "MOTION CONTROL ARM · PROBE LENS", subject: "PILL", size: "WS", sizeEnd: "FS", stop: 8, shadow: 3.9,
    cam: camera(21), cut: "Opens the template", flags: ["centre", "compound", "whip", "wipe"] }],
);
