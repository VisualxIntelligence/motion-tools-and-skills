// FAM01-Booth360: the 360 photo booth. One person on a small round platform, a camera on a rotating arm circling them
// at arm's length with a very wide lens, played back with speed ramps. Measured from a booth company's showreel:
// the arm turns clockwise seen from above (the room slides right to left), 50 to 90°/s where the playback is at
// normal speed and 10 to 15°/s in the slow-motion stretches, about 360° in 9 s, lens at chest height, level.
// Camera and world share one clock: the arm turns at a constant 70°/s of world time and the ramp slows both together.
// Azimuths are degrees round the platform, 0 = +z (the way the hero faces), 90 = +x.
import * as THREE from "three";
import { speedRamp } from "../../kit/stage";
import { GREY, clay, shadeAll } from "../../kit/clay";
import { chair, room, table } from "../../kit/props";
import { Actor } from "../../kit/actors";
import { rigReady } from "../../kit/rig";
import { ramp, rng } from "../../util";
import type { Cam } from "../../shots";
import type { Piece } from "../../piece";
import { makeProduct, V, type ActorSpec, type KitWorld, type PathKey } from "../products/shared";

const RAD = Math.PI / 180;
const PLAT_R = 0.5, PLAT_H = 0.17;             // the platform: 1 m across, 17 cm high
const MM = 10.5, ARM_R = 1.6, LENS_Y = 1.28;   // the lens: 1.6 m from the platform's axis, 1.11 m above its top, level

// ---------------- time: normal speed, slow motion for the jump, normal speed round the back, slow motion to the end ----------------
const SLOW1 = 0.16, SLOW2 = 0.18, END = 10.7;
const HANG: [number, number] = [1.1, 3.5];     // the first slow stretch, film seconds
const CLOCK = speedRamp([[0, 1], [0.6, 1], [HANG[0], SLOW1], [HANG[1], SLOW1], [4.0, 1], [7.8, 1], [8.3, SLOW2], [END, SLOW2]]);

// ---------------- the arm: 70° per world second, clockwise from above ----------------
const OMEGA = 70;
const LEAD = (OMEGA * (CLOCK(HANG[0]) + CLOCK(HANG[1]))) / 2 - 9.5;      // degrees left of face-on at the start: the hang straddles the face
const azimuth = (t: number) => (LEAD - OMEGA * CLOCK(t)) * RAD;
const booth = (t: number): Cam => {
  const a = azimuth(t);
  return { pos: V(Math.sin(a) * ARM_R, LENS_Y, Math.cos(a) * ARM_R), target: V(0, LENS_Y, 0), mm: MM };
};

// ---------------- the hero: a standing jump whose flight sits across the first slow stretch (world seconds) ----------------
const VY = 2.5, FLIGHT = (2 * VY) / 9.81;                          // 0.32 m of rise, 0.51 s in the air
const APEX = (CLOCK(HANG[0]) + CLOCK(HANG[1])) / 2, T_TAKE = APEX - FLIGHT / 2, T_LAND = APEX + FLIGHT / 2;
const HERO_PATH: PathKey[] = (() => {
  // held still on the platform until the toes leave (the path is measured from the platform's top)
  const keys: PathKey[] = [{ t: -0.5, at: [0, 0, 0], yaw: 0 }, { t: 0.3, at: [0, 0, 0] }, { t: T_TAKE - 0.03, at: [0, 0, 0] }];
  for (let k = 0; k <= 24; k++) { const s = (FLIGHT * k) / 24; keys.push({ t: T_TAKE + s, at: [0, Math.max(0, VY * s - 4.905 * s * s), 0] }); }
  keys.push({ t: T_LAND + 1 / 24, at: [0, 0, 0] }, { t: T_LAND + 1.5, at: [0, 0, 0], yaw: 0 }, { t: 6, at: [0, 0, 0], yaw: 0 });
  return keys;
})();
const clip = (c: string, t0: number, t1?: number, ease = 0.15) => ({ kind: "clip" as const, clip: c, t0, t1, ease });
const HERO: ActorSpec = {
  id: "HERO", name: "Hero", kind: "human", tint: "ochre", capsule: "trunk", path: HERO_PATH,
  // Jump_Start's toes leave 0.22 s into the clip; the open-armed air pose takes over for the flight; then the landing.
  // Afterwards only clips that keep the standing feet where they are: a thumbs-up, then a raised palm for the lens
  acts: [clip("Jump_Start", T_TAKE - 0.22, T_TAKE + 0.02, 0.3), clip("Jump_Loop", T_TAKE + 0.17, T_LAND - 0.22, 0.15), clip("Jump_Land", T_LAND - 0.12, T_LAND + 1.1, 0.2),
    clip("Yes", T_LAND + 1.3, T_LAND + 3.1, 0.25), clip("Spell_Simple_Idle_Loop", CLOCK(7.6), undefined, 0.45)],
};

// The standing feet stay where they stand: the crouch into the jump and the later gestures would drag them a few
// centimetres. The ankles are held over the idle stance (measured, metres from the platform's axis) until the push-off
// and again once the landing has settled.
const STANCE = { l: [0.195, 0.127], r: [-0.162, -0.267] } as const;
function plant(hero: Actor | undefined, t: number) {
  if (!hero?.rig) return;
  const k = Math.max(1 - ramp(t, T_TAKE - 0.14, T_TAKE - 0.03), ramp(t, T_LAND + 0.9, T_LAND + 1.2));
  if (k > 0) for (const f of ["l", "r"] as const) { const a = hero.rig.bone["foot_" + f].getWorldPosition(new THREE.Vector3()); hero.rig.pinFoot(f, V(STANCE[f][0], a.y, STANCE[f][1]), k); }
}

// ---------------- the guests: a loose ring 4 to 5 m back, turned to the platform ----------------
const face = (x: number, z: number) => Math.atan2(-x, -z);
const guest = (id: string, tint: ActorSpec["tint"], x: number, z: number, c?: string): ActorSpec =>
  ({ id, name: "Guest", kind: "human", tint, capsule: "trunk", path: [{ t: -0.5, at: [x, 0, z], yaw: face(x, z) }], acts: c ? [clip(c, -0.4, undefined, 0.05)] : undefined });
const GUESTS: ActorSpec[] = [
  guest("G1", "slate", -1.5, -4.4, "Idle_FoldArms_Loop"), guest("G2", "sage", 0.6, -4.7, "Idle_Lantern_Loop"), guest("G3", "rose", 3.4, -3.6),
  guest("G4", "plum", 4.6, -0.5, "Yes"), guest("G5", "stone", 3.9, 1.4, "Idle_Lantern_Loop"), guest("G6", "plum", 0.9, 4.1),
  guest("G7", "slate", -1.2, 4.0, "Idle_FoldArms_Loop"), guest("G8", "sage", -4.4, -0.4, "Idle_Lantern_Loop"), guest("G9", "rose", -3.6, -3.0),
];

// ---------------- confetti: paper let go from a drop box over the platform, falling at its own speed on the world clock ----------------
const BOX_Y = 3.4;                             // the drop box's open underside
type Flake = { x: number; z: number; out: number; v: number; amp: number; w: number; ph: number; s: number; rest: number; axis: THREE.Vector3; spin: number };
const flakeAt = (f: Flake, w: number, o: THREE.Vector3) => {
  if (w < f.out) return o.set(f.x, BOX_Y + 0.12, f.z);                                    // still in the box
  const tau = Math.min(w - f.out, (BOX_Y - f.rest) / f.v);                                  // it stops where it lands
  return o.set(f.x + f.amp * Math.sin(f.w * tau + f.ph), BOX_Y - f.v * tau, f.z + f.amp * Math.cos(f.w * 0.83 * tau + 2 * f.ph));
};
const FLAKES: Flake[] = (() => {
  const r = rng(73), out: Flake[] = [], p = new THREE.Vector3(), line = new THREE.Line3(), near = new THREE.Vector3();
  const times = Array.from({ length: END * 96 + 1 }, (_, i) => i / 96), cams = times.map((t) => booth(t).pos), ws = times.map(CLOCK);
  const slow = times.map((t) => (t > HANG[0] - 0.1 && t < HANG[1] + 0.1) || t > 8.2);
  for (let tries = 0; out.length < 700 && tries < 30000; tries++) {
    const a = r() * 6.2832, d = 0.42 + 0.6 * Math.sqrt(r());
    const f: Flake = { x: Math.sin(a) * d, z: Math.cos(a) * d, out: -1.5 + r() * 7.5, v: 1.0 + r() * 0.55, amp: 0.03 + r() * 0.03, w: 4 + r() * 3.5, ph: r() * 6.28, s: 0.024 + r() * 0.016, rest: 0.003,
      axis: V(r() - 0.5, r() - 0.5, r() - 0.5).normalize(), spin: (5 + r() * 8) * (r() < 0.5 ? -1 : 1) };
    if (Math.abs(d - PLAT_R) < f.amp + 0.04) continue;                                    // never clipping the platform's edge
    if (d < PLAT_R) f.rest = PLAT_H + 0.003;
    // never at the lens; and in the slow stretches never hanging between the lens and the face
    if (times.some((_, i) => {
      flakeAt(f, ws[i], p); if (p.distanceTo(cams[i]) < 0.45) return true;
      return slow[i] && line.set(cams[i], V(0, PLAT_H + 1.64, 0.09)).closestPointToPoint(p, true, near).distanceTo(p) < 0.1;
    })) continue;
    out.push(f);
  }
  return out;
})();

/** the flakes that never touch the hero: each one checked against the posed body through the whole take */
function clearOfHero(all: Flake[]) {
  if (!rigReady()) return all;
  const A = new Actor(HERO), none = new Map<string, Actor>(), bad = new Set<number>();
  A.floor = () => PLAT_H;
  const B = (n: string) => A.rig!.bone[n].getWorldPosition(new THREE.Vector3());
  const seg = new THREE.Line3(), q = new THREE.Vector3(), p = new THREE.Vector3();
  for (let t = -0.1; t <= CLOCK(END) + 0.02; t += 1 / 60) {
    A.update(t, none); plant(A, t); A.root.updateMatrixWorld(true);
    const head = B("Head"), limbs: [THREE.Vector3, THREE.Vector3, number][] = [[head, head.clone().add(V(0, 0.2, 0)), 0.14], [B("neck_01"), B("pelvis"), 0.2]];
    for (const s of ["l", "r"]) limbs.push([B("upperarm_" + s), B("lowerarm_" + s), 0.08], [B("lowerarm_" + s), B("hand_" + s), 0.1], [B("thigh_" + s), B("calf_" + s), 0.11], [B("calf_" + s), B("foot_" + s), 0.1]);
    all.forEach((f, i) => {
      if (bad.has(i) || t < f.out) return;
      flakeAt(f, t, p);
      for (const [a, b, r] of limbs) if (seg.set(a, b).closestPointToPoint(p, true, q).distanceTo(p) < r + f.s) { bad.add(i); break; }
    });
  }
  return all.filter((_, i) => !bad.has(i));
}
let LIVE: Flake[] = FLAKES;

// ---------------- the set: a function room ----------------
const box = (w: number, h: number, d: number, c: string) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), clay(c));
const cyl = (r: number, h: number, c: string, seg = 24) => new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), clay(c));
const put = <T extends THREE.Object3D>(o: T, x: number, y: number, z: number, ry = 0) => { o.position.set(x, y, z); o.rotation.y = ry; return o; };
const glow = (ei: number) => clay(GREY.paper, 0.6, { emissive: "#ffffff", ei });
const ROOM = { cx: 0.6, cz: -0.4, w: 13, d: 11, h: 3.8 };

/** a light on a tripod stand, its white panel facing +z */
function lightStand(h = 2.0) {
  const g = new THREE.Group();
  g.add(put(cyl(0.018, h, GREY.dark, 10), 0, h / 2, 0));
  for (let i = 0; i < 3; i++) { const leg = cyl(0.012, 0.75, GREY.dark, 8); leg.rotation.z = 0.95; const k = new THREE.Group(); k.add(put(leg, 0.3, 0.22, 0)); k.rotation.y = (i * 2 * Math.PI) / 3; g.add(k); }
  g.add(put(box(0.42, 0.3, 0.1, GREY.dark), 0, h, 0));
  shadeAll(g);
  g.add(put(new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.24), glow(2.6)), 0, h, 0.052));
  return g;
}
/** a round banquet table with chairs */
function banquet(seats = 6) {
  const g = new THREE.Group();
  g.add(put(cyl(0.8, 0.04, GREY.paper, 40), 0, 0.75, 0), put(cyl(0.06, 0.71, GREY.dark, 12), 0, 0.375, 0), put(cyl(0.32, 0.03, GREY.dark, 24), 0, 0.015, 0));
  for (let i = 0; i < seats; i++) { const a = (i * 2 * Math.PI) / seats + 0.3; g.add(put(chair(), Math.sin(a) * 1.15, 0, Math.cos(a) * 1.15, a + Math.PI)); }
  return shadeAll(g);
}
/** a cluster of globe lamps on a stem from the ceiling */
function globes(drop = 0.8) {
  const g = new THREE.Group();
  g.add(shadeAll(put(cyl(0.015, drop, GREY.dark, 8), 0, -drop / 2, 0)), shadeAll(put(cyl(0.34, 0.03, GREY.dark, 24), 0, -drop, 0)));
  for (let i = 0; i < 7; i++) { const a = (i * 2 * Math.PI) / 6, k = i < 6 ? 0.34 : 0; g.add(put(new THREE.Mesh(new THREE.SphereGeometry(0.11, 20, 14), glow(1.6)), Math.sin(a) * k, -drop - 0.13, Math.cos(a) * k)); }
  return g;
}
/** a pleated drape, its folds toward +z */
function drape(w: number, h: number) {
  const geo = new THREE.PlaneGeometry(w, h, Math.round(w * 24), 1), p = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i); p.setZ(i, 0.045 * Math.sin(x * 7.3) + 0.03 * Math.sin(x * 16.9 + 1) + 0.03 * Math.sin(x * 3.1 + 2)); }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, clay(GREY.set, 0.96, { side: THREE.DoubleSide })); m.position.y = h / 2; m.receiveShadow = true;
  return m;
}

function build(w: KitWorld) {
  const { cx, cz, w: rw, d: rd, h } = ROOM, x0 = cx - rw / 2, x1 = cx + rw / 2, z0 = cz - rd / 2, z1 = cz + rd / 2;
  const set = new THREE.Group();
  // the room: three tall windows in the far wall, a doorway and a window in the right wall
  set.add(put(room(rw, rd, h, [
    { wall: "n", at: -3.6, width: 1.9, bottom: 0.85, top: 3.0 }, { wall: "n", at: 0, width: 1.9, bottom: 0.85, top: 3.0 }, { wall: "n", at: 3.6, width: 1.9, bottom: 0.85, top: 3.0 },
    { wall: "e", at: -2.6, width: 1.9, bottom: 0.85, top: 3.0 }, { wall: "e", at: 2.2, width: 1.8, bottom: 0, top: 2.5 },
  ], GREY.ground, GREY.light), cx, 0, cz));
  // ceiling beams, a rail and pictures on the blank walls, a drape down the left wall
  for (let i = 0; i < 6; i++) set.add(put(box(0.24, 0.22, rd, GREY.set), x0 + ((i + 0.5) * rw) / 6, h - 0.11, cz));
  for (const z of [z0 + 0.14, z1 - 0.14]) set.add(put(box(rw, 0.3, 0.28, GREY.set), cx, h - 0.15, z));
  set.add(put(box(rw, 0.07, 0.05, GREY.set), cx, 1.0, z1 - 0.025));
  for (let i = 0; i < 5; i++) set.add(put(box(0.7, 0.9, 0.04, i % 2 ? GREY.mid : GREY.set), x0 + 1.6 + i * 2.45, 1.9, z1 - 0.03));
  set.add(put(drape(8, 3.5), x0 + 0.09, 0, cz - 0.6, Math.PI / 2));
  // tables: three round ones near the corners, a long one against the near wall
  set.add(put(banquet(), 5.3, 0, -3.7), put(banquet(5), 5.4, 0, 2.7), put(banquet(), -4.2, 0, 3.3, 0.5), put(table(2.6, 0.8), 3.0, 0, z1 - 0.55));
  // two lights on stands turned to the platform, two globe clusters under the ceiling
  set.add(put(lightStand(), 2.4, 0, -1.7, face(2.4, -1.7)), put(lightStand(), -2.6, 0, 1.5, face(-2.6, 1.5)));
  set.add(put(globes(), 3.3, h, -0.3), put(globes(0.7), -3.0, h, -1.4));
  // the booth: the platform, and the confetti drop box hung over it
  const plat = new THREE.Group();
  plat.add(put(cyl(PLAT_R, PLAT_H - 0.02, GREY.dark, 64), 0, (PLAT_H - 0.02) / 2, 0), put(cyl(PLAT_R - 0.015, 0.02, GREY.paper, 64), 0, PLAT_H - 0.01, 0));
  set.add(shadeAll(plat));
  const drop = new THREE.Group();
  drop.add(put(box(2.3, 0.3, 2.3, GREY.set), 0, BOX_Y + 0.15, 0));
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) drop.add(put(cyl(0.01, h - BOX_Y - 0.3, GREY.dark, 6), x, (h + BOX_Y + 0.3) / 2, z));
  set.add(shadeAll(drop));
  w.add(set);
  // lit like a room, not a roofless box: nothing overhead and no lamp throws the key light's shadow
  set.traverse((o: any) => { if (o.isMesh && (o.position.y > 3 || o.parent?.position.y > 3 || o.material?.emissiveIntensity > 0.5)) o.castShadow = false; });
  w.paving = (x, z) => (Math.hypot(x, z) < PLAT_R ? PLAT_H : 0);
  LIVE = clearOfHero(FLAKES);
  const flakes = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), clay("#e6e5e0", 0.85, { side: THREE.DoubleSide, emissive: "#ffffff", ei: 0.08 }), LIVE.length);
  flakes.castShadow = false; flakes.frustumCulled = false;
  w.add(flakes, "confetti");
}

const tmp = new THREE.Object3D(), FLAT = new THREE.Quaternion().setFromAxisAngle(V(1, 0, 0), -Math.PI / 2), qa = new THREE.Quaternion();
function tick(w: KitWorld, t: number) {
  plant(w.actors.get("HERO"), t);
  const flakes = w.parts.get("confetti") as THREE.InstancedMesh | undefined; if (!flakes) return;
  LIVE.forEach((f, i) => {
    flakeAt(f, t, tmp.position);
    const tau = Math.max(0, t - f.out);
    if (tau >= (BOX_Y - f.rest) / f.v) tmp.quaternion.setFromAxisAngle(V(0, 1, 0), f.ph).multiply(FLAT);      // lying where it fell
    else tmp.quaternion.setFromAxisAngle(f.axis, f.spin * tau + f.ph).multiply(qa.setFromAxisAngle(V(0, 1, 0), f.ph * 3));
    tmp.scale.setScalar(f.s); tmp.updateMatrix(); flakes.setMatrixAt(i, tmp.matrix);
  });
  flakes.instanceMatrix.needsUpdate = true;
}

export const PIECE: Piece = makeProduct(
  { id: "FAM01-Booth360", name: "360 booth spin",
    says: "The 360 party booth: the camera swings round them at arm's length, time drops to slow motion while they hang in a jump, then it comes round again and slows on the face.",
    use: "Someone showing off for the lens at a party, a wedding or a launch. Put one clear action (a jump, a throw) in the first slow stretch.",
    numbers: "10.5 mm, level, lens 1.6 m from the platform's axis and 1.28 m off the floor. The arm turns 70°/s clockwise seen from above, 426° in 10.7 s. Clock 1 until 0.6 s, 0.16 from 1.1 to 3.5 s (11°/s, a 0.32 m jump hangs), 1 from 4.0 to 7.8 s, 0.18 from 8.3 s (13°/s), ending square on the face.",
    avoid: "Slowing the person but not the arm: in a real booth the room slows with them. No tilt, no change of radius; the rig cannot do either." },
  { sky: "interior", keyDir: [-0.25, 0.93, 0.2], build, tick, clock: CLOCK },
  [HERO, ...GUESTS],
  () => [{ start: 0, end: END, label: "10.5mm  360 BOOTH ARM", rig: "360 BOOTH ARM", subject: "HERO", size: "FS", stop: 5.6, shadow: 9, cam: booth,
    flags: ["compound", "centre", "whip", "enters-moving", "exits-moving", "wipe"], cut: "Opens the template", note: "The arm turns 70°/s of world time; the clock runs 1, 0.16 (1.1 to 3.5 s), 1, 0.18 (from 8.3 s). Camera and world share it" }],
);
