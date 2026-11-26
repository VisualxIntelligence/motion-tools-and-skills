// The blocking: where everyone is at every moment, as pure functions of time (seconds). The world draws it and the
// cameras frame it, both from here, so a shot never disagrees with the action it covers.
import * as THREE from "three";
import { clamp, lerp, ramp, smooth, track, v3, window_ } from "./util";
import { HUMAN, NATIVE, Pose, add, crouchLand, idle, kneel, mix, pose, walk } from "./figures";

export const FPS = 30;
export const DURATION = 60;

// ---- geography ----
export const U = new THREE.Vector3(0.2402, 0, 0.9707);      // the drilled root runs out of the spire along U
export const PP = new THREE.Vector3(0.9707, 0, -0.2402);    // its side, toward where Ines stands
export const rootR = (d: number) => 2.4 * Math.exp(-d / 15) + 0.45;
export const rootY = (d: number, startD = 2) => rootR(d) * 0.9 + 3 * Math.exp(-(d - startD) / 3);
const at = (d: number, side: number, y: number) => U.clone().multiplyScalar(d).add(PP.clone().multiplyScalar(side)).setY(y);
export const DRILL_D = 17;
export const D = at(DRILL_D, Math.sqrt(rootR(DRILL_D) ** 2 - 0.15 ** 2), rootY(DRILL_D) + 0.15); // the wound
export const S = at(DRILL_D, rootR(DRILL_D) + 1.12, 0);          // Ines drilling
export const S_BACK = at(DRILL_D + 0.6, rootR(DRILL_D) + 2.9, 0); // Ines after stepping back
export const K_I = at(DRILL_D + 0.72, rootR(DRILL_D) + 0.62, 0);  // Ines kneeling
export const K_W = at(DRILL_D - 0.95, rootR(DRILL_D) + 1.05, 0);  // warden kneeling
export const W = at(14.4, rootR(14.4) + 1.5, 0);                 // warden landing
export const B = new THREE.Vector3(2.15, 23.85, 10.4);           // warden's perch on the branch
export const SHIP = new THREE.Vector3(10, 0, 31);
export const PILOT = new THREE.Vector3(12.4, 0, 23.4);
export const T_BITE = 25.0;     // the drill bites: the light drains from D
export const T_RETURN = 50.9;   // the light comes back from under their hands
export const T_ROAR = 37.5;

export const yawTo = (from: THREE.Vector3, to: THREE.Vector3) => Math.atan2(to.x - from.x, to.z - from.z);
const FACE_ROOT = Math.atan2(-PP.x, -PP.z);

// ---- ship ----
const shipPos = track([
  { t: 0, v: [-95, 92, -46] }, { t: 3.2, v: [-52, 56, -6] }, { t: 6.2, v: [-10, 22, 26] },
  { t: 8.2, v: [7.5, 5.2, 32.5] }, { t: 9.5, v: [10, 0, 31] },
], { startVel: "free" });
const shipYaw = track([{ t: 0, v: [0.95] }, { t: 5, v: [0.75] }, { t: 8.0, v: [0.15] }, { t: 9.6, v: [0] }], { startVel: "free" });
export function ship(t: number) {
  const p = shipPos(t), q = shipPos(t + 0.1);
  const vel = new THREE.Vector3(q[0] - p[0], q[1] - p[1], q[2] - p[2]).multiplyScalar(10);
  return {
    pos: v3(p), yaw: shipYaw(t)[0],
    pitch: -0.12 * window_(t, 2, 4, 6, 7.5) + 0.1 * window_(t, 7.2, 8.4, 8.8, 9.6),
    bank: 0.18 * window_(t, 1, 3, 5, 7.5),
    nacelle: lerp(1.35, 0, ramp(t, 3.5, 7.5)),     // 1.35 rad = thrusting forward, 0 = straight down
    thrust: 1 - ramp(t, 9.6, 10.6),
    ramp: ramp(t, 9.9, 10.9),                       // 0 closed, 1 down
    touch: ramp(t, 9.35, 9.6), vel,
  };
}

// ---- Ines ----
const inesPath = [new THREE.Vector3(10, 1.32, 27.8), new THREE.Vector3(10, 1.32, 26.5), new THREE.Vector3(10, 0.02, 23.45), new THREE.Vector3(8.2, 0, 19.6), S.clone()];
function along(path: THREE.Vector3[], s: number) {
  let rem = s;
  for (let i = 0; i < path.length - 1; i++) {
    const L = path[i].distanceTo(path[i + 1]);
    if (rem <= L || i === path.length - 2) { const k = clamp(rem / L); return { p: path[i].clone().lerp(path[i + 1], k), dir: path[i + 1].clone().sub(path[i]).normalize() }; }
    rem -= L;
  }
  return { p: path[path.length - 1].clone(), dir: new THREE.Vector3(0, 0, 1) };
}
const inesLen = inesPath.slice(1).reduce((a, p, i) => a + p.distanceTo(inesPath[i]), 0);
const inesS = track([{ t: 10.6, v: [0] }, { t: 11.5, v: [1.1] }, { t: 17.3, v: [inesLen - 0.75] }, { t: 18.1, v: [inesLen] }]);
export const T_OFF_RAMP = (() => { const ramp = inesPath[0].distanceTo(inesPath[1]) + inesPath[1].distanceTo(inesPath[2]); for (let t = 10.6; t < 18; t += 1 / 120) if (inesS(t)[0] >= ramp) return t; return 13; })();

const drillHold = pose({ rArm: 1.05, rAbd: 0.05, rElbow: 0.75, lArm: 1.0, lAbd: -0.25, lElbow: 0.95, spine: 0.22, neck: 0.12, head: 0.1, lHip: 0.15, rHip: -0.1, lKnee: 0.2, rKnee: 0.1, crouch: 0.03 });
const lookUp = pose({ neck: -0.45, head: -0.5, spine: -0.12, lArm: 0.15, rArm: 0.1 });
export function ines(t: number) {
  let pos: THREE.Vector3, yaw: number, p: Pose;
  if (t < 18.1) {
    const s = inesS(t)[0];
    const a = along(inesPath, s), b2 = along(inesPath, Math.min(inesLen, s + 0.8));
    pos = a.p;
    yaw = t < 10.6 ? Math.PI : yawTo(a.p, b2.p.clone().add(a.dir.clone().multiplyScalar(0.01)));
    const speed = (inesS(t + 0.05)[0] - inesS(t - 0.05)[0]) * 10;
    p = mix(idle(t), walk(s / 1.45 * Math.PI * 2, clamp(speed / 1.4)), clamp(speed / 0.5));
    p = add(p, { rArm: 0.15, rElbow: 0.5 }); // carrying the drill
    if (a.dir.y < -0.1) p = add(p, { spine: 0.05 });
    const turn = ramp(t, 17.3, 18.1);
    yaw = lerpAngle(yaw, FACE_ROOT, turn);
  } else if (t < 25.3) {
    pos = S.clone(); yaw = FACE_ROOT;
    const push = ramp(t, 22.4, 24.8) * (1 - ramp(t, 25.0, 25.3));
    const buzz = t > 22.6 && t < 25.3 ? 0.01 * Math.sin(t * 90) : 0;
    p = mix(add(idle(t), { rArm: 0.15, rElbow: 0.5 }), drillHold, ramp(t, 18.3, 19.8));
    p = add(p, { spine: 0.1 * push + buzz, lean: 0.06 * push, lHip: 0.12 * push, rHip: -0.1 * push, rKnee: 0.15 * push });
  } else if (t < 46.4) {
    // she lets go and steps back; then watches
    const k = ramp(t, 25.3, 27.3);
    pos = S.clone().lerp(S_BACK, k);
    const back = window_(t, 25.3, 25.7, 26.9, 27.3);
    p = mix(drillHold, idle(t), ramp(t, 25.3, 26.2));
    p = mix(p, walk(-k * 2.0 * Math.PI * 2, 0.7), back);
    yaw = FACE_ROOT + 0.35 * k;
    // scanning the roots as they go dark, then up, then following the drop
    const scan = 0.6 * Math.sin((t - 26.5) * 1.6) * window_(t, 26.5, 27.2, 28.8, 29.6);
    p.headYaw += scan;
    p = mix(p, add(p, lookUp), ramp(t, 29.7, 30.3) * (1 - ramp(t, 31.2, 32.4)));
    const toW = yawTo(pos, W);
    yaw = lerpAngle(yaw, toW, ramp(t, 31.0, 32.6));
    p.neck += -0.25 * ramp(t, 32.2, 33.2) * (1 - ramp(t, 37.2, 37.8));   // the warden is tall: she looks up at him
    // the roar: flinch and turn to the ray
    const flinch = window_(t, T_ROAR, T_ROAR + 0.15, T_ROAR + 0.5, T_ROAR + 1.2);
    p = add(p, { spine: -0.18 * flinch, lArm: 0.5 * flinch, lElbow: 0.9 * flinch, rArm: 0.4 * flinch, rElbow: 0.9 * flinch });
    const toRay = yawTo(pos, ray(Math.max(t, T_ROAR)).pos);
    yaw = lerpAngle(yaw, toRay, ramp(t, T_ROAR + 0.1, T_ROAR + 1.1));
    p.neck += -0.3 * ramp(t, T_ROAR, T_ROAR + 1) * (1 - ramp(t, 43, 45.5));
    yaw = lerpAngle(yaw, yawTo(pos, K_W), ramp(t, 45.4, 46.4));
  } else {
    const k = ramp(t, 46.4, 48.0);
    pos = S_BACK.clone().lerp(K_I, k);
    const walking = window_(t, 46.4, 46.8, 47.6, 48.0);
    yaw = lerpAngle(yawTo(S_BACK, K_I), FACE_ROOT, ramp(t, 47.4, 48.2));
    p = mix(idle(t), walk(k * 2.6 * Math.PI * 2, 0.8), walking);
    p = mix(p, kneel(HUMAN), ramp(t, 48.0, 48.9));
    // her right hand to the root, beside his
    const reach = ramp(t, 49.2, 50.2);
    p = add(p, { rArm: 1.25 * reach, rAbd: -0.12 * reach, rElbow: -0.1 * reach, rWrist: -0.7 * reach, spine: 0.12 * reach, headYaw: -0.25 * ramp(t, 48.6, 49.4) });
    p.headYaw += 0.35 * ramp(t, 51.0, 52.5);   // she looks up as the light climbs
    p.neck += -0.35 * ramp(t, 52, 54);
  }
  return { pos, yaw, pose: p };
}

// ---- the drill ----
/** 0 = in her hand, 1 = set in the root; then pulled out and dropped */
export function drillState(t: number) {
  return {
    set: ramp(t, 19.6, 20.8),
    depth: 0.05 + 0.22 * ramp(t, 22.6, T_BITE + 0.2) - 0.27 * ramp(t, 47.7, 48.3),
    pulled: ramp(t, 47.7, 48.3),
    dropped: ramp(t, 48.3, 48.9),
    buzz: t > 22.6 && t < 25.3 ? 1 : 0,
  };
}

// ---- the warden ----
const fallT0 = 30.6, fallT1 = 32.3;
const palm = pose({ rArm: 1.55, rAbd: 0.25, rElbow: 0.1, rWrist: -1.2, lArm: 0.15, lAbd: 0.25, spine: -0.05, neck: -0.25 });
export function warden(t: number) {
  let pos: THREE.Vector3, yaw: number, p: Pose;
  const perchYaw = yawTo(B, S);
  if (t < fallT0) {
    pos = B.clone();
    yaw = perchYaw;
    p = mix(crouchLand(NATIVE, 0.9), crouchLand(NATIVE, 1.0), 0.5 + 0.5 * Math.sin(t * 0.8));
    p.neck += 0.55; p.head += 0.45;                   // looking down at her
    p.headYaw = 0.15 * Math.sin(t * 0.6) + 0.25 * ramp(t, 25.0, 26.0);
    const coil = ramp(t, 29.9, 30.6);
    p = add(p, { crouch: 0.12 * coil, spine: 0.15 * coil, lArm: -0.5 * coil, rArm: -0.5 * coil });
  } else if (t < fallT1) {
    const s = (t - fallT0) / (fallT1 - fallT0);
    const hz = smooth(s);
    pos = B.clone().lerp(W, hz);
    pos.y = lerp(B.y, 0, s * s) + 1.4 * Math.sin(Math.PI * Math.min(1, s * 1.6)) * (1 - s);
    yaw = lerpAngle(perchYaw, yawTo(W, S_BACK), s);
    p = pose({ lHip: 0.6, rHip: 0.2, lKnee: 0.9, rKnee: 0.5, lArm: 0.8, lAbd: 1.2, rArm: 0.6, rAbd: 1.3, lElbow: 0.3, rElbow: 0.3, spine: 0.2, neck: 0.2 });
    p = mix(p, crouchLand(NATIVE, 0.8), ramp(s, 0.75, 1));
  } else if (t < 46.0) {
    pos = W.clone();
    const rise = ramp(t, 32.6, 34.0);
    yaw = yawTo(W, S_BACK);
    p = mix(crouchLand(NATIVE, 1.15 - 0.35 * ramp(t, fallT1, 32.6)), idle(t), rise);
    p.neck += -0.15 * rise;
    p.head += 0.25 * rise * (1 - ramp(t, T_ROAR, T_ROAR + 0.6));         // looking down at the small human
    // the roar: he turns to the ray, then raises an open palm
    const rp = ray(Math.max(t, T_ROAR)).pos;
    yaw = lerpAngle(yaw, yawTo(W, rp), ramp(t, T_ROAR + 0.1, T_ROAR + 1.2));
    p.neck += -0.35 * ramp(t, T_ROAR, T_ROAR + 1.0) * (1 - ramp(t, 43.5, 45.5));
    p = mix(p, add(palm, { neck: p.neck }), ramp(t, 40.2, 41.3) * (1 - ramp(t, 45.3, 46.0)));
    const step = window_(t, T_ROAR + 0.1, T_ROAR + 0.4, T_ROAR + 0.8, T_ROAR + 1.2);
    p = add(p, { lHip: 0.3 * step, lKnee: 0.4 * step });
  } else {
    const k = ramp(t, 46.0, 47.0);
    pos = W.clone().lerp(K_W, k);
    yaw = lerpAngle(yawTo(W, K_W), FACE_ROOT, ramp(t, 46.6, 47.2));
    p = mix(idle(t), walk(k * 1.6 * Math.PI * 2, 0.8, NATIVE), window_(t, 46.0, 46.3, 46.7, 47.0));
    p = mix(p, kneel(NATIVE), ramp(t, 46.9, 47.6));
    p.spine += 0.2 * ramp(t, 46.9, 47.6);
    // right hand pulls the drill and sets it down; left palm onto the wound
    const pull = window_(t, 47.4, 47.7, 48.3, 48.9);
    p = add(p, { rArm: 1.0 * pull, rElbow: 0.4 * pull - 0.3 * ramp(t, 47.7, 48.3) * pull, rAbd: 0.25 * pull });
    const hand = ramp(t, 48.7, 49.6);
    p = add(p, { lArm: 1.05 * hand, lAbd: -0.05 * hand, lElbow: 0.1 * hand, lWrist: -0.9 * hand, spine: 0.15 * hand, neck: 0.25 * hand });
    p.neck += -0.4 * ramp(t, 51.2, 53.2);                       // he looks up as the light climbs
    p.headYaw += 0.3 * ramp(t, 49.4, 50.4) * (1 - ramp(t, 51.0, 52.0));  // a glance at her
  }
  return { pos, yaw, pose: p };
}

// ---- the pilot ----
const rifleLow = pose({ rArm: 0.45, rElbow: 0.95, lArm: 0.7, lAbd: -0.35, lElbow: 1.25 });
const rifleAim = pose({ rArm: 1.45, rAbd: 0.1, rElbow: 0.3, lArm: 1.45, lAbd: -0.45, lElbow: 0.55, neck: 0.05, spine: 0.04, lHip: 0.2, rHip: -0.15 });
// he follows her out of the ship a beat later and takes his post by the ramp
const pilotPath = [new THREE.Vector3(10, 1.32, 28.2), new THREE.Vector3(10, 1.32, 26.5), new THREE.Vector3(10, 0.02, 23.45), PILOT.clone()];
const pilotLen = pilotPath.slice(1).reduce((a, p, i) => a + p.distanceTo(pilotPath[i]), 0);
const pilotS = track([{ t: 12.6, v: [0] }, { t: 13.3, v: [0.8] }, { t: 15.4, v: [pilotLen - 0.5] }, { t: 16.0, v: [pilotLen] }]);
export function pilot(t: number) {
  const s = pilotS(t)[0];
  const a = along(pilotPath, s), b2 = along(pilotPath, Math.min(pilotLen, s + 0.8));
  const pos = a.p;
  const speed = (pilotS(t + 0.05)[0] - pilotS(t - 0.05)[0]) * 10;
  const walkYaw = yawTo(a.p, b2.p.clone().add(a.dir.clone().multiplyScalar(0.01)));
  let yaw = lerpAngle(walkYaw, yawTo(PILOT, S), ramp(t, 15.6, 16.4));
  const rp = ray(Math.max(t, 35.6)).pos;
  yaw = lerpAngle(yaw, yawTo(PILOT, rp), ramp(t, 35.6, 36.6));
  yaw = lerpAngle(yaw, yawTo(PILOT, W), ramp(t, 41.2, 42.4) * 0.6);
  let p = add(mix(idle(t + 2), walk(s / 1.45 * Math.PI * 2, clamp(speed / 1.4)), clamp(speed / 0.5)), rifleLow);
  const aim = ramp(t, 35.8, 36.7) * (1 - ramp(t, 42.0, 43.4));
  p = mix(p, rifleAim, aim);
  p.neck += -0.3 * aim * ramp(t, 36, 37.5);
  p.head += -0.25 * aim * ramp(t, 36, 37.5);
  return { pos, yaw, pose: p, aim };
}

// ---- the sky-ray ----
const rayPos = track([
  { t: 32.0, v: [-70, -6, -86] }, { t: 34.6, v: [-44, 6, -46] }, { t: 36.4, v: [-18, 22, -8] },
  { t: T_ROAR, v: [-7.5, 16, 7] }, { t: 39.0, v: [-5.5, 13.5, 9.6] }, { t: 42.0, v: [-5.0, 12.2, 10.2] },
  { t: 44.0, v: [-4.9, 7.8, 10.0] }, { t: 45.6, v: [-4.8, 4.3, 9.9] }, { t: 60, v: [-4.8, 4.3, 9.9] },
], { startVel: "free" });
const rayHover = (t: number) => { const a = rayPos(t), b = rayPos(t + 0.2); return clamp(1 - Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) * 5 / 10); };
/** the wing-beat phase, integrated: the beat slows as the ray hovers, so the phase is the sum of its rate, never
 *  time × rate (that races whenever the rate changes) */
const FLAP_T0 = 30, FLAP_DT = 1 / 240;
const flapTable = (() => {
  const out = [0];
  for (let i = 1; FLAP_T0 + i * FLAP_DT <= 61; i++) out.push(out[i - 1] + lerp(5.2, 3.6, rayHover(FLAP_T0 + (i - 0.5) * FLAP_DT)) * FLAP_DT);
  return out;
})();
const flapPhase = (t: number) => {
  const x = (clamp(t, FLAP_T0, 61) - FLAP_T0) / FLAP_DT, i = Math.min(flapTable.length - 2, Math.floor(x));
  return lerp(flapTable[i], flapTable[i + 1], x - i) + 5.2 * Math.min(0, t - FLAP_T0);
};
export function ray(t: number) {
  const p = v3(rayPos(t)), q = v3(rayPos(t + 0.2));
  const vel = q.clone().sub(p).multiplyScalar(5);
  const speed = vel.length();
  const hover = clamp(1 - speed / 10);
  const flyYaw = Math.atan2(vel.x, vel.z || 1e-6);
  const faceYaw = yawTo(p, W);
  const yaw = lerpAngle(flyYaw, faceYaw, smooth(hover));
  const landed = ramp(t, 44.6, 45.8);
  const bob = 0.35 * Math.sin(t * 2.2) * hover * (1 - landed);
  p.y += bob;
  return {
    pos: p, yaw,
    pitch: -0.25 * clamp(vel.y / 12, -1, 1) - 0.15 * window_(t, T_ROAR - 0.3, T_ROAR, T_ROAR + 0.8, T_ROAR + 1.6),
    flap: flapPhase(t), flapAmp: lerp(0.45, 0.75, hover) * (1 - landed),
    fold: landed,
    roar: window_(t, T_ROAR - 0.2, T_ROAR + 0.15, T_ROAR + 1.0, T_ROAR + 1.6),
    vel,
  };
}

/** distant rays circling the valley */
export function farRay(t: number, i: number) {
  const r = 150 + i * 60, w = 0.11 + i * 0.03, a = t * w + i * 2.4;
  const c = new THREE.Vector3(-30 + i * 40, 70 + i * 22, -90 + i * 20);
  const pos = new THREE.Vector3(c.x + Math.cos(a) * r, c.y + 6 * Math.sin(t * 0.4 + i), c.z + Math.sin(a) * r);
  return { pos, yaw: Math.atan2(-Math.sin(a), Math.cos(a)), pitch: 0, flap: t * 3.5 + i, flapAmp: 0.4, fold: 0, roar: 0 };
}

/** the living light: 1 = glowing, 0 = drained; x is world position */
export function lifeAt(t: number, x: THREE.Vector3) {
  const d = x.distanceTo(D);
  const drained = clamp(((t - T_BITE) * 22 - d) / 4);
  const back = clamp(((t - T_RETURN) * 14 - d) / 5);
  return 1 - drained * (1 - back);
}

export function lerpAngle(a: number, b: number, k: number) {
  let d = ((b - a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
  return a + d * k;
}
