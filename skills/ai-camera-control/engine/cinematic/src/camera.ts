// The camera as a director reads it: placed from a rig, then measured. Every number on the HUD comes from here,
// computed from the same camera that renders the frame (never typed in).
import * as THREE from "three";
import type { Cam, Shot } from "./shots";
import { ASPECT, lens, noise2 } from "./util";

export const SENSOR_W = 36;           // mm, full frame
export const COC = 0.03;              // mm, full-frame circle of confusion
export const PIC_W = 1920;

export function place(cam: THREE.PerspectiveCamera, c: Cam) {
  cam.position.copy(c.pos);
  cam.up.set(0, 1, 0);
  cam.lookAt(c.target);
  if (c.shake) { cam.rotateY(c.shake[0]); cam.rotateX(c.shake[1]); }
  if (c.roll) cam.rotateZ(c.roll);
  cam.fov = lens(c.mm);
  cam.aspect = ASPECT;
  const d = c.pos.distanceTo(c.target);
  cam.near = d < 12 ? 0.05 : 0.3;
  cam.far = 16000;
  cam.updateProjectionMatrix();
  cam.updateMatrixWorld();
}

// ---- the camera as a physical object: an operator's spring on the aim, the rig's own float, a focus puller ----
type RigFeel = { w: number; zeta: number; rot: number; pos: number; freq: number; bank: number; fw: number };
const FEEL: Record<string, RigFeel> = {
  crane: { w: 3.2, zeta: 1.0, rot: 0.0, pos: 0.0, freq: 0.35, bank: 0, fw: 5 },       // Technocrane / remote head: glassy
  dolly: { w: 3.8, zeta: 1.0, rot: 0.0, pos: 0.0, freq: 0.5, bank: 0, fw: 6 },
  steadicam: { w: 4.5, zeta: 0.85, rot: 0.06, pos: 0.006, freq: 0.3, bank: 0, fw: 6 },  // a slow float, a little sway
  skiff: { w: 3.6, zeta: 0.9, rot: 0.05, pos: 0.02, freq: 0.25, bank: 0, fw: 5 },          // a vehicle mount: bob
  drone: { w: 4.2, zeta: 0.85, rot: 0.06, pos: 0.02, freq: 0.4, bank: 0.003, fw: 6 },           // gimbal on a chase drone: wind
  fpv: { w: 7.5, zeta: 0.72, rot: 0.15, pos: 0.02, freq: 1.2, bank: 0.006, fw: 8 },             // FPV: fast, banks into turns
  handheld: { w: 6, zeta: 0.8, rot: 0.32, pos: 0.012, freq: 0.35, bank: 0, fw: 7 },            // shoulder rig: breathing sway + a fast tremor layer
  locked: { w: 4, zeta: 1, rot: 0, pos: 0, freq: 0.3, bank: 0, fw: 6 },                         // tripod: no float at all
};
export function rigKind(rig = "") {
  const r = rig.toUpperCase();
  if (r.includes("FPV")) return "fpv";
  if (r.includes("HANDHELD") || r.includes("SHOULDER")) return "handheld";
  if (r.includes("TRIPOD") || r.includes("LOCKED")) return "locked";
  if (r.includes("DRONE")) return "drone";
  if (r.includes("STEADICAM")) return "steadicam";
  if (r.includes("SKIFF") || r.includes("SHIP")) return "skiff";
  if (r.includes("DOLLY") || r.includes("UNDERSLUNG")) return "dolly";
  return "crane";
}
const rad = (x: number) => (x * Math.PI) / 180;
const cache = new Map<string, { F: THREE.Vector3; V: THREE.Vector3; f: number; fv: number }[]>();
/** the camera that actually shot this frame: the rig's authored path, run through the operator and the puller */
export function realCam(shot: Shot, t: number, fps: number): { cam: Cam; focus: number; raw: Cam } {
  const raw = shot.cam(t);
  const feel = FEEL[rigKind(shot.rig)];
  const dt = 1 / 60;
  const key = `${shot.id}:${shot.start}`;
  let st = cache.get(key);
  const fdist = (x: number) => { const c = shot.cam(x); return shot.focus ? c.pos.distanceTo(shot.focus(x).pos) : c.pos.distanceTo(c.target); };
  // the operator works in the camera's own frame (the aim relative to the rig), so a moving platform never drags it
  const rel = (c: Cam) => c.target.clone().sub(c.pos);
  if (!st) {
    const a = shot.cam(shot.start), b = shot.cam(Math.min(shot.end, shot.start + dt));
    const f0 = fdist(shot.start);
    st = [{ F: rel(a), V: rel(b).sub(rel(a)).multiplyScalar(1 / dt), f: f0, fv: 0 }];
    cache.set(key, st);
  }
  const n = -1;
  for (let i = st.length; i <= n; i++) {
    const p = st[i - 1], x = shot.start + i * dt;
    const T = rel(shot.cam(x));
    const w = feel.w, z = feel.zeta;
    const acc = T.clone().sub(p.F).multiplyScalar(w * w).sub(p.V.clone().multiplyScalar(2 * z * w));
    const V = p.V.clone().add(acc.multiplyScalar(dt));
    const F = p.F.clone().add(V.clone().multiplyScalar(dt));
    const fw = feel.fw;
    const fa = fw * fw * (fdist(x) - p.f) - 2 * 0.95 * fw * p.fv;
    const fv = p.fv + fa * dt;
    st.push({ F, V, f: p.f + fv * dt, fv });
  }
  // the camera is the keyframed rig, exactly: aim and focus land on their marks (no operator lag)
  void st;
  const F = raw.target.clone();
  const focus = fdist(t);
  // the rig's own life: low-frequency float and rotation noise, deterministic in time
  const sid = shot.id * 7.31;
  // two layers of float; handheld adds the operator's fast tremor (Cinemachine-style: ~0.35, ~1, ~3.5 Hz)
  const hh = rigKind(shot.rig) === "handheld";
  const n2 = (a: number, b: number) => noise2(t * feel.freq + a, sid + b) + 0.35 * noise2(t * feel.freq * 2.7 + b, sid - a) + (hh ? 0.12 * noise2(t * 3.5 + a * 1.7, sid + b * 0.3) : 0);
  const moveSpeed = raw.pos.distanceTo(shot.cam(Math.max(shot.start, t - dt)).pos) / dt;
  const windy = feel.bank > 0.004 ? 1 + Math.min(0.5, moveSpeed / 50) : 1;
  const pos = raw.pos.clone().add(new THREE.Vector3(n2(1, 2), n2(3, 4), n2(5, 6)).multiplyScalar(feel.pos * windy));
  // the rig's own shake (rig.shake: an operator's hands written into the move) rides on top of the support's float
  const shake: [number, number] = [rad(feel.rot * windy) * n2(11, 12) + (raw.shake?.[0] ?? 0), rad(feel.rot * windy * 0.8) * n2(13, 14) + (raw.shake?.[1] ?? 0)];
  // a drone banks into lateral acceleration
  let roll = raw.roll ?? 0;
  if (feel.bank > 0) {
    const h = 0.12, pA = shot.cam(Math.max(shot.start, t - h)).pos, pB = shot.cam(Math.min(shot.end, t + h)).pos;
    const accel = pB.clone().add(pA).sub(raw.pos.clone().multiplyScalar(2)).multiplyScalar(1 / (h * h));
    const fwd = F.clone().sub(raw.pos).normalize(), right = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0, 1, 0)).normalize();
    roll += Math.max(-0.35, Math.min(0.35, -accel.dot(right) * feel.bank)) + rad(feel.rot * 0.6) * n2(15, 16);
  }
  // focus breathing: the image grows a touch as focus comes closer
  const breathe = 1 - 0.012 * Math.max(0, Math.min(1, 3 / Math.max(0.5, focus)));
  return { cam: { pos, target: F, mm: raw.mm / breathe, roll, shake }, focus, raw };
}

/** focus distance (m) measured along the lens axis to the plane of the focus target */
export function focusDistance(cam: THREE.PerspectiveCamera, p: THREE.Vector3) {
  const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(cam.quaternion);
  return Math.max(0.3, p.clone().sub(cam.position).dot(fwd));
}

/** thin-lens depth of field: near and far limits of acceptable sharpness (m), and blur of infinity in pixels */
export function dof(mm: number, stop: number, s: number) {
  const f = mm, S = s * 1000;
  const H = (f * f) / (stop * COC) + f;
  const near = (S * (H - f)) / (H + S - 2 * f) / 1000;
  const far = S < H ? (S * (H - f)) / (H - S) / 1000 : Infinity;
  const cocInf = (f * f) / (stop * Math.max(1, S - f));        // mm on the sensor
  return { near, far, hyperfocal: H / 1000, bgBlurPx: (cocInf / SENSOR_W) * PIC_W };
}

const deg = (r: number) => (r * 180) / Math.PI;
const fmt = (x: number, d = 1) => (Math.abs(x) >= 100 ? x.toFixed(0) : x.toFixed(d));
const dist = (m: number) => (m === Infinity ? "INF" : m >= 1000 ? `${(m / 1000).toFixed(1)} km` : m >= 100 ? `${m.toFixed(0)} m` : `${m.toFixed(1)} m`);

/** everything the HUD says about this frame */
export function measure(shot: Shot, t: number, fps: number) {
  const rc = realCam(shot, t, fps);
  const c = rc.cam;
  const cam = new THREE.PerspectiveCamera(); place(cam, c);
  const dt = 1 / fps;
  const tp = Math.max(shot.start, t - dt);
  const cp = realCam(shot, tp, fps).cam;
  const camP = new THREE.PerspectiveCamera(); place(camP, cp);
  const span = Math.max(1e-6, t - tp);
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(cam.quaternion);
  const up = new THREE.Vector3(0, 1, 0).applyQuaternion(cam.quaternion);
  const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(cam.quaternion);
  const fwdP = new THREE.Vector3(0, 0, -1).applyQuaternion(camP.quaternion);

  // lens and exposure
  const mm = rc.raw.mm, stop = shot.stop ? shot.stop(t) : 8;
  const hfov = deg(2 * Math.atan(SENSOR_W / 2 / mm));
  const shutter = `180° · 1/${Math.round(fps * 2)}`;
  const zoomRate = (c.mm - cp.mm) / span;

  // focus
  const fp = shot.focus ? shot.focus(t) : { pos: c.target, name: "TARGET" };
  const s = rc.focus;
  const sPrev = realCam(shot, tp, fps).focus;
  const D = dof(mm, stop, s);
  const racking = Math.abs((s - sPrev) / span) > Math.max(2, s * 0.6) && fp.name !== (shot.focus ? shot.focus(Math.max(shot.start, t - 0.8)).name : fp.name);
  const image = D.bgBlurPx < 1.5 ? "DEEP FOCUS · BACKGROUND SHARP" : D.bgBlurPx < 6 ? `BACKGROUND SOFT · ${fmt(D.bgBlurPx)} px` : `SHALLOW · BACKGROUND BOKEH ${fmt(D.bgBlurPx, 0)} px`;

  // framing: size, vertical angle, side, dutch
  const sub = shot.subject?.(t);
  let size = "", angle = "", side = "";
  if (sub) {
    const d = sub.pos.distanceTo(c.pos);
    const frameH = 2 * d * Math.tan(THREE.MathUtils.degToRad(lens(mm)) / 2);
    const frac = sub.height / frameH;
    size = frac > 2.2 ? "EXTREME CLOSE-UP" : frac > 1.1 ? "CLOSE-UP" : frac > 0.75 ? "MEDIUM CLOSE-UP" : frac > 0.5 ? "MEDIUM SHOT" : frac > 0.33 ? "MEDIUM WIDE" : frac > 0.15 ? "WIDE SHOT" : "EXTREME WIDE";
    const rel = c.pos.clone().sub(sub.pos);
    const va = deg(Math.atan2(rel.y, Math.hypot(rel.x, rel.z)));
    angle = va > 60 ? "OVERHEAD" : va > 22 ? "HIGH ANGLE" : va > 8 ? "SLIGHT HIGH" : va < -45 ? "WORM'S-EYE" : va < -18 ? "LOW ANGLE" : va < -6 ? "SLIGHT LOW" : "EYE LEVEL";
    angle += ` ${va >= 0 ? "+" : ""}${va.toFixed(0)}°`;
    if (sub.facing) {
      const h = new THREE.Vector3(rel.x, 0, rel.z).normalize(), f = sub.facing.clone().setY(0).normalize();
      const a = deg(Math.acos(Math.max(-1, Math.min(1, h.dot(f)))));
      const lr = new THREE.Vector3().crossVectors(f, h).y > 0 ? "L" : "R";   // which of the subject's sides we see
      side = a < 25 ? "FRONT" : a < 65 ? `3/4 FRONT ${lr}` : a < 115 ? `PROFILE ${lr}` : a < 155 ? `3/4 BACK ${lr}` : "BACK";
    }
  }
  const tilt = deg(Math.asin(Math.max(-1, Math.min(1, fwd.y))));
  const dutch = deg(c.roll ?? 0);

  // movement in the camera's own axes, and relative to the subject when we travel with it
  const vel = c.pos.clone().sub(cp.pos).multiplyScalar(1 / span);
  const parts: string[] = [];
  let rv = vel.clone();
  if (sub && shot.subject) {
    const sp = shot.subject(tp);
    const sv = sub.pos.clone().sub(sp.pos).multiplyScalar(1 / span);
    if (sv.length() > 2 && vel.clone().sub(sv).length() < 0.45 * sv.length() && sub.name === sp.name) { parts.push(`TRACKING ${fmt(sv.length(), 0)} m/s`); rv = vel.clone().sub(sv); }
  }
  const vf = rv.dot(fwd), vr = rv.dot(right), vu = rv.dot(up);
  const th = 0.25;
  if (vf > th) parts.push(`DOLLY IN ${fmt(vf)}`); else if (vf < -th) parts.push(`DOLLY OUT ${fmt(-vf)}`);
  if (vr > th) parts.push(`TRUCK R ${fmt(vr)}`); else if (vr < -th) parts.push(`TRUCK L ${fmt(-vr)}`);
  if (vu > th) parts.push(`BOOM UP ${fmt(vu)}`); else if (vu < -th) parts.push(`BOOM DOWN ${fmt(-vu)}`);
  const hA = fwdP.clone().setY(0).normalize(), hB = fwd.clone().setY(0).normalize();
  let pan = deg(Math.acos(Math.max(-1, Math.min(1, hA.dot(hB))))) / span;
  if (hB.clone().sub(hA).dot(right) < 0) pan = -pan;   // positive = pan right
  const tiltRate = (tilt - deg(Math.asin(Math.max(-1, Math.min(1, fwdP.y))))) / span;
  if (Math.abs(pan) > 120) parts.push(`WHIP PAN ${pan > 0 ? "R" : "L"} ${fmt(Math.abs(pan), 0)}°/s`);
  else if (Math.abs(pan) > 1.5) parts.push(`PAN ${pan > 0 ? "R" : "L"} ${fmt(Math.abs(pan))}°/s`);
  if (Math.abs(tiltRate) > 120) parts.push(`WHIP TILT ${tiltRate > 0 ? "UP" : "DOWN"} ${fmt(Math.abs(tiltRate), 0)}°/s`);
  else if (Math.abs(tiltRate) > 1.5) parts.push(`TILT ${tiltRate > 0 ? "UP" : "DOWN"} ${fmt(Math.abs(tiltRate))}°/s`);
  if (Math.abs(zoomRate) > 0.5) parts.push(`ZOOM ${zoomRate < 0 ? "OUT" : "IN"} ${fmt(Math.abs(zoomRate))} mm/s`);
  if (!parts.length) parts.push("STATIC");

  return {
    mm, stop, hfov, shutter, s, D, racking, image, size, angle, side, tilt, dutch, focusName: fp.name, moves: parts.join(" · "),
    lines: [
      ["RIG", shot.rig ?? ""],
      ["LENS", `${mm.toFixed(0)} mm · HFOV ${hfov.toFixed(1)}° · T${stop.toFixed(1).replace(/\.0$/, "")} · ${shutter}`],
      ["FOCUS", `${dist(s)} → ${fp.name}${racking ? " · RACKING" : ""} · DOF ${dist(D.near)}–${dist(D.far)}`],
      ["IMAGE", image],
      ["FRAME", [size, angle, side, `TILT ${tilt >= 0 ? "+" : ""}${tilt.toFixed(0)}°`, Math.abs(dutch) > 1.5 ? `DUTCH ${dutch.toFixed(0)}°` : ""].filter(Boolean).join(" · ")],
      ["MOVE", parts.join(" · ")],
    ] as [string, string][],
  };
}
