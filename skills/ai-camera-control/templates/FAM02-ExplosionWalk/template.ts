// FAM02-ExplosionWalk
// Copied from engine/cinematic/src/templates/famous/f02-explosion-walk.ts (all of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh FAM02-ExplosionWalk
// FAM02-ExplosionWalk: the hero walks calmly at the lens while a car goes up behind them, and never looks back.
// Measured from two clips (a film scene and a home parody): a long lens straight in front at hip height, rock steady,
// the walker centred, the blast straight behind the head, playback at about a quarter speed. The film cuts from a
// normal-speed wide to the slow-motion shots; this is one take, so one speed ramp does that cut's job: 2 s of calm walk
// at normal speed, the blast, then slow motion to the end. Camera and world share the clock (an overcranked camera
// slows its own dolly too): it backs away at 15% of the walker's pace, so the walker gains on it, knees-up to waist-up.
// +z is toward the lens; the hero ends at z 0 and the car stands 22 m behind that. Render the pill version with
// --subframes 1 (with more, the sub-frame passes draw the person, not the capsule).
import * as THREE from "three";
import { getInputProps } from "remotion";
import { speedRamp } from "../../kit/stage";
import { GREY, clay, shadeAll } from "../../kit/clay";
import { barrel, building, car, crate, dress, ground } from "../../kit/props";
import { aimFor } from "../../framer";
import { lerp, noise2, rng, smooth } from "../../util";
import type { Cam } from "../../shots";
import type { Piece } from "../../piece";
import { makeProduct, V, type ActorSpec, type KitWorld, type PathKey } from "../products/shared";

// ---------------- time: normal speed through the blast, then a quarter speed to the end ----------------
const END = 10, SLOW = 0.25;
const T_BLAST = 2.0;                             // world seconds (the clock is still 1:1 here, so film seconds too)
const CLOCK = speedRamp([[0, 1], [2.4, 1], [3.0, SLOW], [END, SLOW]]);
const W_END = CLOCK(END);                        // 4.53 s of world time in 10 s of film

// ---------------- the hero: a straight walk at the clip's own pace, so the feet hold ----------------
const PACE = 0.97;                               // m/s: 4.39 m walked in the shot
const heroZ = (w: number) => PACE * (w - W_END);
const HERO_PATH: PathKey[] = Array.from({ length: 14 }, (_, i) => ({ t: i - 3, at: [0, heroZ(i - 3)] as [number, number], ...(i ? {} : { yaw: 0 }) }));
// the stand-in capsule is fitted to the trunk, not the swinging arms: a narrower pill hides less of the blast
const HERO: ActorSpec = { id: "HERO", name: "Hero", kind: "human", tint: "ochre", path: HERO_PATH, capsule: "trunk" };
const HEAD_TOP = 1.78;

// ---------------- the camera: 85 mm on a dolly, straight in front, backing away slower than the walk ----------------
const MM = 85;
const D0 = 8.58, D1 = 4.85;                      // lens to hero: a 1.52 m tall frame at the start, 0.86 m at the end
const H0 = 1.0, H1 = 1.3;                        // lens height: hip to chest, so the ground under the blast stays in frame
const dolly = (w: number): Cam => {
  const p = w / W_END, k = smooth(p);
  const pos = V(0, lerp(H0, H1, k), heroZ(w) + lerp(D0, D1, p));
  // the head top rides 19% down the frame at the start (as in the reference) and 14% at the end
  return { pos, target: aimFor(pos, V(0, HEAD_TOP, heroZ(w)), MM, [0, lerp(0.62, 0.72, k)]), mm: MM };
};
const camera = (t: number): Cam => dolly(CLOCK(t));

// ---------------- the blast, in seconds after it goes off (world clock) ----------------
const SITE = V(0, 0, -22), G = 9.81;
const grow = (tau: number, k: number) => (tau <= 0 ? 0 : 1 - Math.exp(-tau / k));
/** metres risen per m/s of final speed: starts from rest, reaches speed in about half a second */
const lift = (tau: number) => (tau <= 0 ? 0 : tau - 0.45 * (1 - Math.exp(-tau / 0.45)));
const HOT = new THREE.Color("#f1efe9"), SMOKE = new THREE.Color("#73726e"), DUST = new THREE.Color("#c6c4be");

type Lobe = { dir: THREE.Vector3; reach: number; r: number; up: number; cool: number; axis: THREE.Vector3; roll: number; swell: number };
/** the fireball: overlapping lumps thrown out of the core. The low heart stays white hot; the body cools to smoke lump
 *  by lump; the cap rises fastest and turns to smoke first */
const LOBES: Lobe[] = (() => {
  const r = rng(23), out: Lobe[] = [];
  const band = (n: number, el: [number, number], reach: [number, number], rad: [number, number], up: [number, number], cool: [number, number]) => {
    for (let i = 0; i < n; i++) {
      const az = (i / n) * Math.PI * 2 + r() * 0.8, e = lerp(el[0], el[1], r());
      out.push({ dir: V(Math.cos(e) * Math.sin(az), Math.sin(e), Math.cos(e) * Math.cos(az)), reach: lerp(reach[0], reach[1], r()), r: lerp(rad[0], rad[1], r()), up: lerp(up[0], up[1], r()),
        cool: lerp(cool[0], cool[1], r()), swell: 0.22 + 0.14 * lerp(up[0], up[1], 0.5), axis: V(r() - 0.5, r() - 0.5, r() - 0.5).normalize(), roll: (0.5 + r()) * (r() < 0.5 ? -1 : 1) });
    }
  };
  band(12, [0.05, 0.4], [0.8, 2.2], [0.7, 1.0], [0.1, 0.5], [99, 99]);         // the heart: wide and low, it stays on the ground
  band(16, [0.3, 0.9], [0.8, 1.5], [0.7, 1.0], [0.5, 1.3], [0.9, 2.8]);        // the body
  band(14, [0.9, 1.5], [0.5, 1.1], [0.75, 1.05], [1.7, 2.4], [0.6, 1.5]);      // the cap: it climbs out of the top and swells
  return out;
})();
type Puff = { az: number; reach: number; r: number; cool: number };
/** the ground burst: low lumps racing out along the ground, cooling to dust */
const SKIRT: Puff[] = (() => { const r = rng(31); return Array.from({ length: 26 }, (_, i) => ({ az: (i / 26) * Math.PI * 2 + r() * 0.2, reach: 2.2 + r() * 1.2, r: 0.4 + r() * 0.4, cool: 0.5 + r() * 1.4 })); })();
type Plume = { born: number; x: number; z: number; r: number; up: number; shade: string };
/** the smoke column: lumps born inside the fireball that climb out of its top */
const PLUME: Plume[] = (() => { const r = rng(37), tones = [GREY.mid, GREY.dark, GREY.ink, GREY.dark]; return Array.from({ length: 13 }, (_, i) => ({ born: 0.22 + i * 0.15, x: (r() - 0.5) * 1.6, z: (r() - 0.5) * 1.6, r: 1.0 + r() * 0.6, up: 2.7 + r() * 0.9, shade: tones[i % 4] })); })();

const coreAt = (tau: number) => ({ y: 0.8 + 1.2 * lift(tau), r: 1.7 * grow(tau, 0.045) * (1 - 0.3 * smooth((tau - 0.4) / 1.5)) });
const ringAt = (tau: number) => ({ r: 10.5 * grow(tau, 0.32), h: 0.2 * grow(tau, 0.03) * (1 - smooth((tau - 0.3) / 1.6)) });
/** the light the blast throws: a flash, then the fireball's glow */
const glowAt = (tau: number) => (tau <= 0 ? 0 : 1.4 * grow(tau, 0.012) * Math.exp(-tau / 0.11) + grow(tau, 0.08) * (1 - 0.4 * smooth(tau / 2.4)));

// ---------------- debris: rigid pieces on ballistic paths, tumbling about one level axis ----------------
type Body = { name: string; kind: Kind; make: () => THREE.Object3D; p0: THREE.Vector3; size: [number, number, number]; v: THREE.Vector3; axis: "x" | "z"; spin: number };
type Flight = Body & { hy: number; hp: number; t1: number; vy1: number; hop: number; th1: number; thK: number };
const BOUNCE = 0.28, REACH = 9.5;                // a landing keeps 28% of its fall speed; nothing travels further than REACH from the site
/** the height of a tumbling box's centre when its lowest corner is on the ground */
const support = (f: { hy: number; hp: number }, th: number) => f.hy * Math.abs(Math.cos(th)) + f.hp * Math.abs(Math.sin(th));
function flight(b: Body): Flight {
  const hy = b.size[1] / 2, hp = (b.axis === "x" ? b.size[2] : b.size[0]) / 2;
  const spin = Math.sign(b.spin) * Math.min(Math.abs(b.spin), (0.7 * b.v.y) / hp);       // it must leave the ground before a corner swings down
  const gap = (tau: number) => b.p0.y + b.v.y * tau - 0.5 * G * tau * tau - support({ hy, hp }, spin * tau);
  let lo = 0.02; while (lo < 20 && gap(lo + 0.004) > 0) lo += 0.004;
  let hi = lo + 0.004; for (let i = 0; i < 24; i++) { const m = (lo + hi) / 2; if (gap(m) > 0) lo = m; else hi = m; }
  const t1 = lo, vy1 = b.v.y - G * t1, hop = (2 * BOUNCE * Math.abs(vy1)) / G, th1 = spin * t1;
  // it comes to rest on a broad face: the nearest one to where the spin would carry it
  const flat = hy <= hp ? 0 : Math.PI / 2, thK = flat + Math.PI * Math.round((th1 + 0.5 * spin * hop - flat) / Math.PI);
  // keep it inside the debris field
  const run = Math.hypot(b.v.x, b.v.z) * (t1 + 0.45 * hop), far = Math.hypot(b.p0.x - SITE.x, b.p0.z - SITE.z), s = Math.min(1, Math.max(0.05, REACH - far) / Math.max(1e-6, run));
  return { ...b, v: V(b.v.x * s, b.v.y, b.v.z * s), spin, hy, hp, t1, vy1, hop, th1, thK };
}
function flightAt(f: Flight, tau: number, pos: THREE.Vector3) {
  if (tau <= 0) { pos.copy(f.p0); return 0; }
  if (tau < f.t1) { pos.set(f.p0.x + f.v.x * tau, f.p0.y + f.v.y * tau - 0.5 * G * tau * tau, f.p0.z + f.v.z * tau); return f.spin * tau; }
  // one short hop, the tumble running out on a flat face, then rest
  const u = Math.min(tau - f.t1, f.hop), k = f.hop > 0 ? u / f.hop : 1, th = f.th1 + (f.thK - f.th1) * (1 - (1 - k) * (1 - k));
  const run = f.t1 + 0.45 * u;
  pos.set(f.p0.x + f.v.x * run, support(f, th) + Math.max(0, BOUNCE * Math.abs(f.vy1) * u - 0.5 * G * u * u), f.p0.z + f.v.z * run);
  return th;
}

const box = (w: number, h: number, d: number, c: string, rough = 0.92) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), clay(c, rough));
const put = <T extends THREE.Object3D>(o: T, x: number, y: number, z: number, ry = 0) => { o.position.set(x, y, z); o.rotation.y = ry; return o; };
/** a kit prop re-centred on its middle, so it can tumble */
const centred = (o: THREE.Object3D, h: number, ry = 0) => { const g = new THREE.Group(); g.add(put(o, 0, -h / 2, 0, ry)); return g; };

/** the pill render (--boxes): thrown props become plain flat-coloured blocks that carry only size and motion */
const pillMode = () => { if (typeof window === "undefined") return false; try { return !!(getInputProps() as { boxes?: boolean }).boxes; } catch { return false; } };
const BLOCK = { car: "#ff7a00", drum: "#00c8d7", crate: "#1fa84a", parked: "#9b30d9" };
const block = (w: number, h: number, d: number, hex: string) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshBasicMaterial({ color: hex })); m.castShadow = true; return m; };
type Kind = "car" | "drum" | "crate" | "frag";
const FLIGHTS: Flight[] = (() => {
  const r = rng(53), out: Body[] = [];
  // the car: broadside across the road, thrown up and toward the lens side, cartwheeling in the picture plane
  out.push({ name: "car", kind: "car", make: () => centred(car(GREY.light), 1.52, Math.PI / 2), p0: V(0, 0.76, SITE.z), size: [4.4, 1.52, 1.8], v: V(1.7, 8.2, 1.9), axis: "z", spin: -2.3 });
  // barrels and crates stood beside it, each thrown its own way (bearing in degrees from the lens axis, level speed, lift)
  const stood: [number, number, "barrel" | "crate", number, number, number][] = [[-3.0, 0.5, "barrel", -35, 3.4, 6.5], [-3.75, 0.05, "barrel", -80, 4.6, 5.4], [-3.3, -0.6, "barrel", -120, 3.6, 7.6],
    [-4.5, -0.45, "barrel", -100, 5.2, 8.2], [3.1, 0.55, "crate", 58, 4.2, 6.0], [3.6, -0.7, "crate", 115, 3.8, 7.2], [4.5, 0.1, "barrel", 78, 5.0, 5.6]];
  stood.forEach(([x, dz, kind, deg, sp, vy], i) => {
    const az = (deg * Math.PI) / 180, s = kind === "barrel" ? 0.67 : 1.02;
    out.push({ name: kind + i, kind: kind === "barrel" ? "drum" : "crate", make: () => centred(kind === "barrel" ? barrel(1) : crate(1), 1), p0: V(x, 0.5, SITE.z + dz), size: [s, 1, s], v: V(Math.sin(az) * sp, vy, Math.cos(az) * sp),
      axis: i % 2 ? "x" : "z", spin: (2.5 + r() * 3) * (r() < 0.5 ? -1 : 1) });
  });
  // fragments: they start inside the car's body, so nothing appears from nowhere
  const tones = [GREY.dark, GREY.mid, GREY.ink, GREY.set];
  for (let i = 0; i < 34; i++) {
    const size: [number, number, number] = [0.16 + r() * 0.34, 0.04 + r() * 0.2, 0.14 + r() * 0.3];
    // a third fly toward the lens on low arcs and land short; the rest go every way
    const lens = i % 3 === 0, az = lens ? (r() - 0.5) * 1.9 : r() * Math.PI * 2, el = lens ? 0.6 + r() * 0.35 : 0.45 + r() * 0.75, sp = lens ? 6 + r() * 2.6 : 5.5 + r() * 4.5;
    const tone = tones[i % 4];
    out.push({ name: "frag" + i, kind: "frag", make: () => box(size[0], size[1], size[2], tone), p0: V((r() - 0.5) * 3.4, 0.6, SITE.z + (r() - 0.5) * 0.9), size,
      v: V(Math.cos(el) * Math.sin(az) * sp, Math.sin(el) * sp, Math.cos(el) * Math.cos(az) * sp), axis: r() < 0.5 ? "x" : "z", spin: (4 + r() * 7) * (r() < 0.5 ? -1 : 1) });
  }
  return out.map(flight);
})();

// ---------------- smoke trails: six fragments each draw a thin line of smoke along their arc; it thins out behind them ----------------
const TRAIL_N = 16, TRAIL_DT = 0.07, TRAIL_LIFE = 1.5;
const TRAILS = FLIGHTS.filter((f) => f.name.startsWith("frag") && Math.abs(f.v.x) > 1.4 && f.v.y > 4.5 && f.v.y < 8.8).filter((_, i) => i % 2 === 0).slice(0, 6);
const pa = new THREE.Vector3(), pb = new THREE.Vector3(), Z = V(0, 0, 1);
/** link k of a trail: a stretched lump from where the fragment was at the link's start to where it was at its end (the
 *  newest link ends on the fragment), swelling, drifting up and thinning to nothing with age; false when there is none */
function trailLink(f: Flight, k: number, tau: number, o: THREE.Object3D) {
  const t0 = 0.04 + TRAIL_DT * k, t1 = Math.min(tau, t0 + TRAIL_DT, f.t1), a = tau - t0;
  if (t1 - t0 < 1e-3) return false;
  flightAt(f, t0, pa); flightAt(f, t1, pb); pa.y += 0.2 * a; pb.y += 0.2 * Math.max(0, tau - t1);
  const len = pa.distanceTo(pb), r = (0.05 + 0.1 * grow(a, 0.5)) * (1 - smooth((a - 0.3) / TRAIL_LIFE));
  if (r < 2e-3) return false;
  o.position.copy(pa).add(pb).multiplyScalar(0.5); o.quaternion.setFromUnitVectors(Z, pb.sub(pa).normalize()); o.scale.set(r, r, len * 0.9 + r);   // long enough to bury the joints between links
  return true;
}

// ---------------- the set: a service road at dusk, grey on grey, so a near-white blast reads ----------------
const SKY = { top: "#55565a", horizon: "#7d7c79" };
/** one lumpy sphere for every fire, smoke and dust lump */
const LUMP = (() => {
  const g = new THREE.SphereGeometry(1, 36, 24), p = g.attributes.position as THREE.BufferAttribute, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const n = 1 + 0.15 * noise2(v.x * 2.1 + 4 + v.y, v.z * 2.1 - v.y * 1.3) + 0.05 * noise2(v.x * 5.5 + v.z, v.y * 5.5 - v.z * 2); p.setXYZ(i, v.x * n, v.y * n, v.z * n); }
  g.computeVertexNormals();
  return g;
})();
const lump = (hex: string, glow = 0) => { const m = new THREE.Mesh(LUMP, new THREE.MeshStandardMaterial({ color: hex, roughness: 0.95, emissive: "#ffffff", emissiveIntensity: glow })); m.visible = false; return m; };
/** a concrete road barrier, 2.4 m long along z */
const barrier = () => shadeAll(new THREE.Group().add(put(box(0.6, 0.26, 2.4, GREY.set), 0, 0.13, 0), put(box(0.26, 0.56, 2.4, GREY.set), 0, 0.54, 0)));
/** a light pole with an arm over the road (the arm points to -x when s is 1) */
const pole = (s: number) => shadeAll(new THREE.Group().add(put(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 7, 12), clay(GREY.dark)), 0, 3.5, 0), put(box(1.4, 0.1, 0.12, GREY.dark), -s * 0.65, 6.95, 0), put(box(0.5, 0.14, 0.26, GREY.paper), -s * 1.25, 6.86, 0)));

function build(w: KitWorld) {
  // the dusk sky a few steps darker, the fog matched to it, no colour
  w.scene.background = new THREE.Color(SKY.horizon);
  if (w.scene.fog) (w.scene.fog as THREE.FogExp2).color.set(SKY.horizon);
  w.scene.traverse((o) => { const u = ((o as THREE.Mesh).material as THREE.ShaderMaterial | undefined)?.uniforms; if (u?.top && u?.horizon) { u.top.value.set(SKY.top); u.horizon.value.set(SKY.horizon); } });
  if (w.scene.userData.sky) Object.assign(w.scene.userData.sky, SKY);

  w.add(ground(600, 0, 600, GREY.dark));
  const set = new THREE.Group();
  // road paint: two edge lines running to the car
  for (const x of [-1.75, 1.75]) { const l = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 110), clay(GREY.paper, 0.9)); l.rotation.x = -Math.PI / 2; l.position.set(x, 0.004, -45); l.receiveShadow = true; set.add(l); }
  // barriers at the sides, 2 m clear of the walk and outside the debris field (over 11 m from the car)
  for (const s of [-1, 1]) for (const z of [-9.2, -6.4]) set.add(put(barrier(), s * 2.15, 0, z));
  // light poles: one near on the left, two far ones past the car
  set.add(put(pole(-1), -2.75, 0, -10.8), put(pole(1), 4.6, 0, -33), put(pole(-1), -6.2, 0, -47));
  // behind the blast: two sheds with a gap of sky between them, a parked car, a long wall on the horizon
  set.add(put(building(13, 9, 4.6, 5, GREY.dark), -9.5, 0, -56), put(building(11, 10, 3.8, 8, GREY.mid), 10, 0, -64), put(shadeAll(box(70, 3.2, 0.5, GREY.dark)), 0, 1.6, -84));
  const blocks = pillMode();
  if (blocks) set.add(put(block(4.4, 1.52, 1.8, BLOCK.parked), -8.5, 0.76, -34)); else set.add(put(car(GREY.mid), -8.5, 0, -34, Math.PI / 2));
  w.add(set);

  // the blast, all of it hidden until it goes off. Everything that is fire, smoke or dust sits in one group tagged as
  // scenery, so --no-scenery renders a reference with no fire shape to copy (the lights and the solid debris stay)
  const blast = new THREE.Group(), fire = dress(new THREE.Group()); blast.add(fire);
  const core = lump("#ffffff", 2.4); fire.add(core); w.parts.set("core", core);
  LOBES.forEach((_, i) => { const m = lump("#f1efe9", 0.32); fire.add(m); w.parts.set("lobe" + i, m); });
  SKIRT.forEach((_, i) => { const m = lump("#f1efe9", 0.32); fire.add(m); w.parts.set("skirt" + i, m); });
  PLUME.forEach((p, i) => { const m = lump(p.shade); fire.add(m); w.parts.set("plume" + i, m); });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.045, 12, 120), clay("#dcdbd5", 0.95)); ring.rotation.x = Math.PI / 2; ring.visible = false; fire.add(ring); w.parts.set("ring", ring);
  const trails = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 14, 10), new THREE.MeshStandardMaterial({ color: "#c2c1bb", roughness: 0.95 }), TRAILS.length * TRAIL_N);
  trails.frustumCulled = false; trails.castShadow = false; fire.add(trails); w.parts.set("trails", trails);
  const light = new THREE.PointLight("#fff8ee", 0, 0, 1); blast.add(light); w.parts.set("light", light);
  // the fireball is a wide source, so its light wraps round the walker: two kickers behind the shoulders carry that rim
  for (const s of [-1, 1]) { const k = new THREE.PointLight("#fff8ee", 0, 0, 1); blast.add(k); w.parts.set("kick" + s, k); }
  w.add(blast);
  // everything thrown exists twice: a standing copy shown until the blast (the layout behind the hero), and the flying
  // copy, shown from the blast on. In the clay render the flying copies sit in a group tagged as scenery, so
  // --no-scenery shows no flying or fallen object; in the pill render each is a flat coloured block (one colour per
  // kind, no fragments) and an ordinary object, so it stays with --no-scenery. Fragments start hidden inside the car,
  // so they need no standing copy
  const thrown = blocks ? new THREE.Group() : dress(new THREE.Group());
  const make = (f: Flight) => (blocks ? block(f.size[0], f.size[1], f.size[2], f.kind === "car" ? BLOCK.car : f.kind === "drum" ? BLOCK.drum : BLOCK.crate) : shadeAll(f.make()));
  for (const f of FLIGHTS) {
    if (blocks && f.kind === "frag") continue;
    const o = make(f); o.position.copy(f.p0); o.visible = false; thrown.add(o); w.parts.set(f.name, o);
    if (f.kind !== "frag") { const rest = make(f); rest.position.copy(f.p0); w.add(rest, f.name + "_rest"); }
  }
  w.add(thrown);
}

const tmp = new THREE.Vector3(), dummy = new THREE.Object3D(), AX = { x: V(1, 0, 0), z: V(0, 0, 1) };
function tick(w: KitWorld, t: number) {
  const tau = t - T_BLAST;
  const show = (m: THREE.Object3D, r: number) => { m.visible = r > 1e-3; if (m.visible) m.scale.setScalar(r); return m.visible; };
  const heat = (m: THREE.Object3D, k: number, cold: THREE.Color) => { const mat = (m as THREE.Mesh).material as THREE.MeshStandardMaterial; mat.color.copy(cold).lerp(HOT, k); mat.emissiveIntensity = 0.32 * k; };
  const core = w.parts.get("core"), c = coreAt(tau);
  if (core && show(core, c.r)) core.position.set(SITE.x, c.y, SITE.z);
  LOBES.forEach((l, i) => {
    const m = w.parts.get("lobe" + i); if (!m || !show(m, l.r * grow(tau, 0.12) * (1 + l.swell * tau))) return;
    m.position.copy(SITE).addScaledVector(l.dir, l.reach * (grow(tau, 0.16) + 0.14 * lift(tau))); m.position.y += 0.6 + l.up * lift(tau);
    m.quaternion.setFromAxisAngle(l.axis, l.roll * tau + i);
    heat(m, 1 - smooth((tau - l.cool) / 0.8), SMOKE);
  });
  SKIRT.forEach((s, i) => {
    const m = w.parts.get("skirt" + i), r = s.r * grow(tau, 0.2) * (1 + 0.3 * tau); if (!m || !show(m, r)) return;
    const d = s.reach * grow(tau, 0.28);
    m.scale.y = r * 0.5; m.position.set(SITE.x + Math.sin(s.az) * d, r * 0.4, SITE.z + Math.cos(s.az) * d); m.rotation.y = s.az + tau * 0.6;
    heat(m, 1 - smooth((tau - s.cool) / 0.5), DUST);
  });
  PLUME.forEach((p, i) => {
    const m = w.parts.get("plume" + i), a = tau - p.born; if (!m || !show(m, p.r * grow(a, 0.35) * (1 + 0.3 * Math.max(0, a)))) return;
    m.position.set(SITE.x + p.x, 1.1 + 1.2 * lift(p.born) + p.up * lift(a), SITE.z + p.z); m.rotation.set(a * 0.5, i, a * 0.3);
  });
  const ring = w.parts.get("ring"), rg = ringAt(tau);
  if (ring) { ring.visible = rg.h > 2e-3; if (ring.visible) { ring.scale.set(rg.r, rg.r, rg.h / 0.045); ring.position.set(SITE.x, rg.h, SITE.z); } }
  const trails = w.parts.get("trails") as THREE.InstancedMesh | undefined;
  if (trails) {
    TRAILS.forEach((f, i) => { for (let k = 0; k < TRAIL_N; k++) { if (!trailLink(f, k, tau, dummy)) dummy.scale.setScalar(0); dummy.updateMatrix(); trails.setMatrixAt(i * TRAIL_N + k, dummy.matrix); } });
    trails.instanceMatrix.needsUpdate = true;
  }
  const light = w.parts.get("light") as THREE.PointLight | undefined;
  if (light) { light.intensity = 70 * glowAt(tau); light.position.set(SITE.x, c.y + 1.2, SITE.z + 1.5); }
  for (const s of [-1, 1]) { const k = w.parts.get("kick" + s) as THREE.PointLight | undefined; if (k) { k.intensity = 20 * glowAt(tau); k.position.set(s * 5.5, 2.4, heroZ(t) - 4.5); } }
  for (const f of FLIGHTS) {
    const o = w.parts.get(f.name), rest = w.parts.get(f.name + "_rest"); if (rest) rest.visible = tau <= 0;
    if (!o) continue;
    o.visible = tau > 0; const th = flightAt(f, tau, tmp); o.position.copy(tmp); o.quaternion.setFromAxisAngle(AX[f.axis], th);
  }
}

export const PIECE: Piece = makeProduct(
  { id: "FAM02-ExplosionWalk", name: "Walk away from the explosion",
    says: "Nothing behind them is worth a look: the hero walks at us, the world goes up, and they do not turn.",
    use: "The exit after the job is done: someone leaving a thing burning behind them. Once per film, as the last beat of a sequence.",
    numbers: "85 mm straight in front, lens 1.0 m rising to 1.3 m, 8.6 m from the walker closing to 4.85 m (the dolly backs away at 15% of the 0.97 m/s walk): knees-up to waist-up. The car goes up 22 m behind the end mark at 2.0 s; clock 1 to 2.4 s, eased to 0.25 by 3.0 s and held to 10 s. No shake.",
    avoid: "A look back, a flinch or a quicker step: the calm is the shot. No camera shake, and no debris near the walker." },
  { sky: "dusk", build, tick, clock: CLOCK, motes: { center: [0, 1.6, -6], size: [9, 3.2, 16], count: 140 } },
  [HERO],
  () => [{ start: 0, end: END, label: "85mm  WALK FROM THE BLAST · SLOW MOTION", rig: "DOLLY · LONG LENS · 96 FPS", subject: "HERO", size: "MWS", sizeEnd: "MS", stop: 8, shadow: 30, cam: camera,
    flags: ["centre", "enters-moving", "exits-moving"], cut: "Opens the template", note: "One speed ramp: clock 1 to 2.4 s, 0.25 from 3.0 s. Blast at 2.0 s. Camera and world share the clock" }],
);
