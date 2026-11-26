// Frame check without rendering.
//   PIECE=CAM06-Orbit tools/check.sh          -> the measured pass: every check at the in, middle and out of every shot
//   PIECE=CAM06-Orbit tools/check.sh 3 5 15   -> where each subject lands at those times, and what blocks it
// The measured pass follows the skill's frame-qa table (cinematic-previs/references/frame-qa.md). A shot's plan
// (src/shots.ts `Plan`) says what it is meant to be; its flags turn off the checks it breaks on purpose.
import * as THREE from "three";
import fs from "fs";
import { KF } from "./kf-root.mjs";
import { PIECES } from "../src/pieces";
import { loadRigNode } from "./rig-node";
await loadRigNode();
import { measure, place } from "../src/camera";
import { lens } from "../src/util";
import { marksOf, sizeIn, type Mark, type Marks } from "../src/marks";
import { SIZES, type Flag, type Shot, type Size } from "../src/shots";
import { frameFor } from "../src/framer";

const pid = process.env.PIECE;
if (!pid || !PIECES[pid]) { console.error(`set PIECE to a template id, for example PIECE=CAM06-Orbit tools/check.sh${pid ? ` (no template called ${pid})` : ""}`); process.exit(2); }
const piece = PIECES[pid];
const world: any = piece.makeWorld({});
const SHOTS = piece.shots;
const cam = new THREE.PerspectiveCamera();
const rc = new THREE.Raycaster();
const args = process.argv.slice(2);

// ---- the scene, posed at a time and seen through the shot camera ----
const subjects: Record<string, Mark> = piece.subjects?.(world) ?? {};
const owner = new Map<THREE.Object3D, string>();
for (const [n, m] of Object.entries(subjects)) { const o = m.fig?.root ?? m.rig?.root ?? m.obj; if (o) owner.set(o, n); }
const ownerOf = (o: THREE.Object3D) => { let p: THREE.Object3D | null = o; while (p) { const n = owner.get(p); if (n) return n; p = p.parent; } return null; };
const shown = (o: THREE.Object3D) => { let p: THREE.Object3D | null = o; while (p) { if (!p.visible) return false; p = p.parent; } return true; };
const meshes: THREE.Mesh[] = [];
world.scene.traverse((o: any) => {
  if (!o.isMesh) return;
  const mat = o.material as THREE.Material & { opacity?: number };
  if (o.geometry?.parameters?.radius >= 2000) return;                                    // the sky dome
  if (mat.transparent && ((mat.opacity ?? 1) < 0.5 || mat.blending === THREE.AdditiveBlending || !mat.depthWrite)) return;   // glow, haze
  meshes.push(o);
});
const meshName = (o: THREE.Object3D) => ownerOf(o) ?? ((o as any).isInstancedMesh ? "inst:" : "set:") + (o as THREE.Mesh).geometry.type.replace("Geometry", "");

function pose(shot: Shot, t: number) {
  const c = shot.cam(t);
  world.setCamera?.(c.pos, c.target);
  world.update(t, shot.shadow(t));
  world.scene.updateMatrixWorld(true);
  place(cam, c);
  return c;
}
const ndc = (p: THREE.Vector3) => { const v = p.clone().project(cam); const z = p.clone().applyMatrix4(cam.matrixWorldInverse).z; return { x: v.x, y: v.y, front: z < 0 }; };
const inFrame = (q: { x: number; y: number; front: boolean }, m = 1) => q.front && Math.abs(q.x) <= m && Math.abs(q.y) <= m;
const subjectName = (shot: Shot, t: number) => { const s = shot.plan?.subject; return typeof s === "function" ? s(t) : s ?? shot.subject?.(t).name; };
const marksAt = (name?: string) => (name && subjects[name] ? marksOf(name, subjects[name]) : null);
const deg = (r: number) => (r * 180) / Math.PI;
const hfovOf = (mm: number) => 2 * Math.atan(18 / mm);
const vfovOf = (mm: number) => THREE.MathUtils.degToRad(lens(mm));

const sizeOf = (m: Marks) => sizeIn(m, ndc);
const idx = (s: Size | "OFF") => (s === "INSERT" ? 1 : SIZES.indexOf(s as (typeof SIZES)[number]));
const TIGHT: Size[] = ["MS", "MCU", "CU"];

// ---- the framer's own check: place every figure at every size, then measure what came out ----
if (args[0] === "--framer") {
  const t = Number(args[1] ?? piece.shots[0].start);
  const shot = piece.shotAt(t);
  pose(shot, t);
  const LENS: Record<string, number> = { CU: 85, MCU: 65, MS: 50, MWS: 40, FS: 35, WS: 32 };
  console.log(`${piece.id} at τ ${t}: frameFor(size, lens, 3/4 front, eye level, eyes on the upper third)\n`);
  for (const [n, mk] of Object.entries(subjects)) {
    if (!mk.fig) continue;
    const row: string[] = [];
    for (const size of Object.keys(LENS) as Size[]) {
      const m = marksOf(n, mk);
      const from = m.facing!.clone().setY(0).normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 6);
      const c = frameFor(m, { size, mm: LENS[size], from });
      place(cam, c);
      const got = sizeOf(m), q = ndc(m.eye);
      row.push(`${size}@${LENS[size]}mm→${got} eyes ${((1 - q.y) * 50).toFixed(0)}% ${m.eye.distanceTo(c.pos).toFixed(1)}m`);
    }
    console.log(`${n.padEnd(8)} ${row.join("  |  ")}`);
  }
  process.exit(0);
}

// ---- the time-list mode (kept as it was) ----
if (args.length && !args[0].startsWith("--")) {
  for (const t of args.map(Number)) {
    const shot = piece.shotAt(t); const c = pose(shot, t);
    const out: string[] = [];
    for (const n of Object.keys(subjects)) {
      const m = marksAt(n)!; if (!m.visible) continue;
      const q = ndc(m.eye); if (!inFrame(q)) continue;
      const d = m.eye.distanceTo(c.pos);
      rc.set(c.pos, m.eye.clone().sub(c.pos).normalize()); rc.far = d;
      const hits = rc.intersectObjects(meshes, false).filter((h) => shown(h.object) && h.distance < d - 0.4 && ownerOf(h.object) !== n);
      out.push(`${n}(${q.x.toFixed(2)},${q.y.toFixed(2)} d${d.toFixed(1)} ${sizeOf(m)}${hits.length ? " BLOCKED by " + meshName(hits[0].object) + "@" + hits[0].distance.toFixed(1) : ""})`);
    }
    rc.set(c.pos, c.target.clone().sub(c.pos).normalize()); rc.far = 4000;
    const h = rc.intersectObjects(meshes, false).find((x) => shown(x.object));
    if (process.env.HUD) for (const [k, v] of measure(shot, t, piece.fps).lines) console.log(`      ${k.padEnd(6)} ${v}`);
    console.log(`t${t.toFixed(1)} SH${shot.id} cam(${c.pos.toArray().map((x) => x.toFixed(1))}) centre:${h ? meshName(h.object) + "@" + h.distance.toFixed(1) : "sky"} | ${out.join(" ")}`);
  }
  process.exit(0);
}

// ---- the measured pass ----
type Status = "pass" | "FAIL" | "flag" | "n/a";
type Row = Record<string, { s: Status; d: string }>;
const COLS = ["SAFE", "BLOCK", "HEAD", "JOINT", "SIZE", "LEAD", "OTS", "REV", "DIST", "AXIS", "30°", "PAN", "1AXIS", "HOLD", "LEN"] as const;
const rows: { shot: Shot; r: Row }[] = [];
const has = (shot: Shot, f: Flag) => !!shot.plan?.flags?.includes(f);
const put = (r: Row, k: string, s: Status, d = "") => {
  const o = r[k];
  if (!o || o.s === "n/a" || (s === "FAIL" && o.s !== "FAIL")) r[k] = { s, d };
  else if (s === "FAIL" && o.s === "FAIL") o.d += " " + d;
  else if (s === "pass" && o.s === "pass" && d && !o.d) o.d = d;
};

type Sample = { t: number; tag: string; name?: string; m: Marks | null; size: Size | "OFF" | null; cam: THREE.Vector3; mm: number; eyeQ?: ReturnType<typeof ndc> };
const samples = new Map<Shot, Sample[]>();

for (const shot of SHOTS) {
  const r: Row = {}; for (const k of COLS) r[k] = { s: "n/a", d: "" };
  const plan = shot.plan ?? {};
  const list: Sample[] = [];
  const e = 0.02;
  for (const [tag, t] of [["i", shot.start + e], ["m", (shot.start + shot.end) / 2], ["o", shot.end - e]] as [string, number][]) {
    const c = pose(shot, t);
    const name = subjectName(shot, t);
    const mk = marksAt(name), m = mk?.visible ? mk : null;   // a subject not yet in the scene is not framed
    const smp: Sample = { t, tag, name, m, size: null, cam: c.pos.clone(), mm: c.mm };
    list.push(smp);
    if (!m) continue;
    const q = ndc(m.eye); smp.eyeQ = q;
    const size = sizeOf(m); smp.size = size;
    // a move that changes size is checked at its start size going in, its end size coming out, either in between
    const want = plan.sizeEnd && tag === "o" ? plan.sizeEnd : plan.size;
    const wantAlt = plan.sizeEnd && tag === "m" ? plan.sizeEnd : undefined;
    const at = `${tag}`;
    // on screen, inside action safe
    put(r, "SAFE", inFrame(q, 0.9) ? "pass" : "FAIL", `${at}:${name}(${q.x.toFixed(2)},${q.y.toFixed(2)})`);
    // nothing between the lens and the point of interest
    if (q.front) {
      const d = m.eye.distanceTo(c.pos);
      rc.set(c.pos, m.eye.clone().sub(c.pos).normalize()); rc.far = d;
      const hit = rc.intersectObjects(meshes, false).find((h) => shown(h.object) && h.distance < d - 0.3 && ownerOf(h.object) !== name);
      if (has(shot, "wipe")) put(r, "BLOCK", "flag"); else put(r, "BLOCK", hit ? "FAIL" : "pass", hit ? `${at}:${meshName(hit.object)}@${hit.distance.toFixed(1)}m` : "");
    }
    const tight = (want && TIGHT.includes(want)) || (!want && TIGHT.includes(size as Size));
    // headroom: eyes on the upper third
    if (m.ladder && tight) {
      const fy = (1 - q.y) / 2;
      put(r, "HEAD", Math.abs(fy - 1 / 3) <= 0.05 ? "pass" : "FAIL", `${at}:eyes ${(fy * 100).toFixed(0)}%`);
    }
    // the frame edge never cuts a joint
    if (m.ladder && !(plan.sizeEnd && tag === "m")) {
      const hidden = (p: THREE.Vector3) => { const d = p.distanceTo(c.pos); rc.set(c.pos, p.clone().sub(c.pos).normalize()); rc.far = d; return rc.intersectObjects(meshes, false).some((h) => shown(h.object) && h.distance < d - 0.15 && ownerOf(h.object) !== name); };
      const cut = m.joints.map((j) => ({ j, p: ndc(j.p) })).filter(({ j, p }) => p.front && Math.abs(p.x) <= 1 && (Math.abs(p.y - 1) < 0.08 || Math.abs(p.y + 1) < 0.08) && !hidden(j.p));
      put(r, "JOINT", cut.length ? "FAIL" : "pass", cut.length ? `${at}:${[...new Set(cut.map(({ j, p }) => `${j.name}@${p.y > 0 ? "top" : "bottom"}`))].join(",")}` : "");
    }
    // the size is the one planned (one step either way passes)
    if (want) {
      if (want === "INSERT") put(r, "SIZE", size === "CU" || size === "FS" ? "pass" : "FAIL", `${at}:INSERT got ${size}`);
      else {
        const near = (w: Size) => size !== "OFF" && Math.abs(idx(size) - idx(w)) <= 1;
        const between = wantAlt && size !== "OFF" && idx(size) >= Math.min(idx(want), idx(wantAlt)) && idx(size) <= Math.max(idx(want), idx(wantAlt));
        put(r, "SIZE", near(want) || (wantAlt && near(wantAlt)) || between ? "pass" : "FAIL", `${at}:plan ${want}${wantAlt ? "→" + wantAlt : ""} got ${size}`);
      }
    }
    // lead room: the subject sits on the third opposite its facing
    if (m.facing && m.ladder && (tight || size === "MWS")) {
      if (has(shot, "short-side") || has(shot, "centre")) put(r, "LEAD", "flag");
      else {
        const q2 = ndc(m.eye.clone().add(m.facing.clone().setY(0).normalize().multiplyScalar(0.5)));
        const dx = q2.x - q.x, len = Math.hypot(q2.x - q.x, q2.y - q.y);
        if (len > 1e-4 && Math.abs(dx) / len > 0.35) {
          const ok = q.x * Math.sign(dx) <= 0.05;
          put(r, "LEAD", ok ? "pass" : "FAIL", `${at}:x ${q.x.toFixed(2)} faces ${dx > 0 ? "R" : "L"}`);
        }
      }
    }
    // the OTS shoulder: a quarter to a third of the frame
    if (plan.ots && subjects[plan.ots]) {
      // the foreground figure's real meshes: each one's box, projected and clipped to the frame; the share is the
      // width their union covers
      const root = subjects[plan.ots].fig?.root ?? subjects[plan.ots].rig?.root ?? subjects[plan.ots].obj!;
      const spans: [number, number][] = [];
      root.traverse((o: any) => {
        if (!o.isMesh || !shown(o)) return;
        // the mesh's real vertices (a box is far wider than a limb seen up close), in frame rows only
        const pa = o.geometry.attributes.position as THREE.BufferAttribute, v = new THREE.Vector3();
        let lo = Infinity, hi = -Infinity;
        const step = pa.count > 4000 ? 3 : 1;
        for (let i = 0; i < pa.count; i += step) {
          // a skinned body is measured as posed: getVertexPosition applies the bones
          const q = ndc((o.isSkinnedMesh ? o.getVertexPosition(i, v) : v.fromBufferAttribute(pa, i)).applyMatrix4(o.matrixWorld));
          if (!q.front || q.y < -1 || q.y > 1) continue;
          lo = Math.min(lo, q.x); hi = Math.max(hi, q.x);
        }
        if (hi < -1 || lo > 1 || lo === Infinity) return;
        spans.push([Math.max(-1, lo), Math.min(1, hi)]);
      });
      spans.sort((a, b) => a[0] - b[0]);
      let cover = 0, end = -Infinity;
      for (const [a, b] of spans) { if (b <= end) continue; cover += b - Math.max(a, end); end = b; }
      const share = cover / 2;
      put(r, "OTS", share >= 0.2 && share <= 0.33 ? "pass" : "FAIL", `${at}:${plan.ots} ${(share * 100).toFixed(0)}%`);
    }
    // the camera stays at least 1.5 m from a face it holds close
    if (m.ladder && (["ECU", "CU", "MCU"].includes(want ?? "") || (!want && ["ECU", "CU", "MCU"].includes(size as string)))) {
      const d = m.eye.distanceTo(c.pos);
      put(r, "DIST", d >= 1.5 ? "pass" : "FAIL", `${at}:${d.toFixed(2)} m`);
    }
  }
  samples.set(shot, list);

  // ---- moves, sampled every frame at 24 fps ----
  const dt = 1 / 24;
  const parts = { track: 0, dolly: 0, truck: 0, boom: 0, pan: 0, tilt: 0, zoom: 0 };
  const motion: { t: number; amt: number }[] = [];
  let maxPan = 0, maxTilt = 0, panAt = 0, limPan = 0, limTilt = 0;
  let prev = shot.cam(shot.start), prevSub = subjectName(shot, shot.start), prevSubPos: THREE.Vector3 | null = null;
  {
    pose(shot, shot.start);
    const m = marksAt(prevSub); prevSubPos = m ? m.eye.clone() : null;
  }
  for (let t = shot.start + dt; t <= shot.end + 1e-6; t += dt) {
    const c = pose(shot, t);
    const name = subjectName(shot, t), m = marksAt(name);
    const sp = m ? m.eye.clone() : null;
    const D = Math.max(0.5, sp ? sp.distanceTo(c.pos) : c.pos.distanceTo(c.target));
    const fwd = c.target.clone().sub(c.pos).normalize(), fwdP = prev.target.clone().sub(prev.pos).normalize();
    const right = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0, 1, 0)).normalize(), up = new THREE.Vector3().crossVectors(right, fwd);
    let v = c.pos.clone().sub(prev.pos);
    // travelling with the subject is one move (tracking), not a dolly or truck
    let tracked = 0;
    if (sp && prevSubPos && name === prevSub) { const sv = sp.clone().sub(prevSubPos); if (sv.length() / dt > 1 && v.clone().sub(sv).length() < 0.45 * sv.length()) { v = v.sub(sv); tracked = sv.length() / D; } }
    const hf = hfovOf(c.mm), vf = vfovOf(c.mm);
    const yaw = (f: THREE.Vector3) => Math.atan2(f.x, f.z), pitch = (f: THREE.Vector3) => Math.asin(Math.max(-1, Math.min(1, f.y)));
    let dyaw = yaw(fwd) - yaw(fwdP); if (dyaw > Math.PI) dyaw -= 2 * Math.PI; if (dyaw < -Math.PI) dyaw += 2 * Math.PI;
    const dpitch = pitch(fwd) - pitch(fwdP);
    const step = {
      track: tracked, dolly: Math.abs(v.dot(fwd)) / D, truck: Math.abs(v.dot(right)) / D / hf, boom: Math.abs(v.dot(up)) / D / vf,
      pan: Math.abs(dyaw) * Math.cos(pitch(fwd)) / hf, tilt: Math.abs(dpitch) / vf, zoom: Math.abs(Math.log(c.mm / prev.mm)),
    };
    for (const k of Object.keys(parts) as (keyof typeof parts)[]) parts[k] += step[k];
    motion.push({ t, amt: Object.values(step).reduce((a, b) => a + b, 0) });
    // pan speed: a pan that holds a moving subject in place is a follow, which the 7-second rule exempts
    let follow = false;
    if (m && sp && prevSubPos && name === prevSub) {
      const now = ndc(sp); place(cam, prev); const was = ndc(prevSubPos); place(cam, c);
      // a static point would slide by the turn itself; a followed subject slides by far less than that
      const bg = Math.abs(dyaw) / (hf / 2) + Math.abs(dpitch) / (vf / 2);
      follow = Math.hypot(now.x - was.x, now.y - was.y) < 0.35 * bg;   // the subject holds still on screen while the frame turns
    }
    const pr = deg(Math.abs(dyaw) * Math.cos(pitch(fwd))) / dt, tr = deg(Math.abs(dpitch)) / dt;
    if (!follow) {
      // the limit is one frame width (or height) every 7 seconds; keep the worst frame against it
      if (!limPan || pr / (deg(hf) / 7) > maxPan / limPan) { maxPan = pr; limPan = deg(hf) / 7; panAt = t; }
      if (!limTilt || tr / (deg(vf) / 7) > maxTilt / limTilt) { maxTilt = tr; limTilt = deg(vf) / 7; }
    }
    prev = c; prevSub = name; prevSubPos = sp;
  }
  if (has(shot, "whip")) put(r, "PAN", "flag", `whip`);
  else {
    const okP = maxPan <= limPan + 0.05, okT = maxTilt <= limTilt + 0.05;
    put(r, "PAN", okP && okT ? "pass" : "FAIL", `${!okP ? `pan ${maxPan.toFixed(1)}°/s>${limPan.toFixed(1)} @${panAt.toFixed(1)}` : ""}${!okT ? ` tilt ${maxTilt.toFixed(1)}°/s>${limTilt.toFixed(1)}` : ""}`.trim());
  }
  // one primary axis; a second at most 30% of it
  const ranked = Object.entries(parts).sort((a, b) => b[1] - a[1]);
  const [p1, p2] = ranked;
  if (p1[1] < 0.08) put(r, "1AXIS", "pass", "static");
  else if (has(shot, "compound")) put(r, "1AXIS", "flag", `${p1[0]}+${p2[0]}`);
  else put(r, "1AXIS", p2[1] <= 0.3 * p1[1] ? "pass" : "FAIL", `${p1[0]} ${p1[1].toFixed(2)} + ${p2[0]} ${p2[1].toFixed(2)}`);
  // holds: the move starts and ends on a composed frame (0.5 s with almost no motion)
  const win = (a: number, b: number) => motion.filter((x) => x.t > a && x.t <= b).reduce((s, x) => s + x.amt, 0);
  const hin = win(shot.start, shot.start + 0.5), hout = win(shot.end - 0.5, shot.end);
  const hi = has(shot, "enters-moving") ? "flag" : hin <= 0.04 ? "pass" : "FAIL";
  const ho = has(shot, "exits-moving") ? "flag" : hout <= 0.04 ? "pass" : "FAIL";
  put(r, "HOLD", hi === "FAIL" || ho === "FAIL" ? "FAIL" : hi === "flag" && ho === "flag" ? "flag" : "pass", [hi === "FAIL" ? `in ${hin.toFixed(2)}` : "", ho === "FAIL" ? `out ${hout.toFixed(2)}` : ""].filter(Boolean).join(" "));
  // shot length against the readability floor
  const sz = plan.size ?? list[1].size;
  if (sz && sz !== "OFF") {
    const floor = ["ECU", "CU", "MCU", "INSERT"].includes(sz) ? 12 : ["MS", "MWS"].includes(sz) ? 18 : 36;
    const frames = Math.round((shot.end - shot.start) * 24);
    put(r, "LEN", frames >= floor ? "pass" : "FAIL", `${frames}f<${floor}f`);
  }
  rows.push({ shot, r });
}

// ---- checks across cuts: the axis, the 30° rule, reverse matches ----
for (let i = 0; i < rows.length; i++) {
  const { shot, r } = rows[i];
  const plan = shot.plan ?? {};
  const mid = samples.get(shot)![1];
  if (plan.pair && plan.scene) {
    const prevRow = rows.slice(0, i).reverse().find((x) => x.shot.plan?.scene === plan.scene && x.shot.plan?.pair && [...x.shot.plan.pair].sort().join() === [...plan.pair!].sort().join());
    const side = (s: Shot) => {
      const t = (s.start + s.end) / 2; const c = pose(s, t);
      const A = marksAt(plan.pair![0])!.eye, B = marksAt(plan.pair![1])!.eye;
      return Math.sign(new THREE.Vector3().crossVectors(B.clone().sub(A).setY(0), c.pos.clone().sub(A).setY(0)).y);
    };
    if (prevRow) {
      if (has(shot, "cross-line")) put(r, "AXIS", "flag");
      else { const a = side(prevRow.shot), b = side(shot); put(r, "AXIS", a === b ? "pass" : "FAIL", `crosses ${plan.pair.join("-")} line from SH${String(prevRow.shot.id).padStart(2, "0")}`); }
    }
  }
  if (i > 0) {
    const prevShot = rows[i - 1].shot;
    const a = samples.get(prevShot)![2], b = samples.get(shot)![0];
    if (a.name && a.name === b.name && a.m && b.m) {
      if (has(shot, "jump")) put(r, "30°", "flag");
      else {
        pose(shot, b.t); const S = marksAt(b.name)!.eye;
        const u = a.cam.clone().sub(S).setY(0).normalize(), w = b.cam.clone().sub(S).setY(0).normalize();
        const ang = deg(Math.acos(Math.max(-1, Math.min(1, u.dot(w)))));
        const steps = a.size && b.size && a.size !== "OFF" && b.size !== "OFF" ? Math.abs(idx(a.size) - idx(b.size)) : 0;
        put(r, "30°", ang >= 30 || steps >= 2 ? "pass" : "FAIL", `${ang.toFixed(0)}° and ${steps} size steps from SH${String(prevShot.id).padStart(2, "0")}`);
      }
    }
  }
  if (plan.reverse) {
    const other = rows.find((x) => x.shot.id === plan.reverse)?.shot;
    if (other) {
      const read = (s: Shot) => {
        const t = (s.start + s.end) / 2; const c = pose(s, t); const m = marksAt(subjectName(s, t))!;
        const hs = Math.abs(ndc(m.top).y - ndc(m.ladder?.chin ?? m.sole).y) / 2;
        return { mm: c.mm, d: m.eye.distanceTo(c.pos), hs };
      };
      const A = read(other), B = read(shot);
      const off = (x: number, y: number) => Math.abs(x - y) / Math.max(x, y);
      const bad = [off(A.mm, B.mm) > 0.1 ? `lens ${A.mm.toFixed(0)}/${B.mm.toFixed(0)}mm` : "", off(A.d, B.d) > 0.1 ? `distance ${A.d.toFixed(1)}/${B.d.toFixed(1)}m` : "", off(A.hs, B.hs) > 0.1 ? `head ${(A.hs * 100).toFixed(0)}/${(B.hs * 100).toFixed(0)}%` : ""].filter(Boolean);
      put(r, "REV", bad.length ? "FAIL" : "pass", `vs SH${String(other.id).padStart(2, "0")}: ${bad.join(", ")}`);
    }
  }
  void mid;
}

// ---- the report ----
const mark = (s: Status) => (s === "pass" ? "·" : s === "FAIL" ? "✗" : s === "flag" ? "f" : " ");
const label = (s: Shot) => `SH${String(s.id).padStart(2, "0")} ${(s.label ?? "").slice(0, 34).padEnd(34)}`;
console.log(`${piece.id}: measured pass, ${SHOTS.length} shots (· pass  ✗ fail  f flagged exception  blank n/a)\n`);
console.log(`${"".padEnd(39)}${COLS.map((c) => c.padEnd(6)).join("")}`);
for (const { shot, r } of rows) console.log(`${label(shot)} ${COLS.map((c) => mark(r[c].s).padEnd(6)).join("")}`);
const fails = rows.flatMap(({ shot, r }) => COLS.filter((c) => r[c].s === "FAIL").map((c) => ({ id: shot.id, check: c, detail: r[c].d })));
console.log(`\n${fails.length} fails:`);
process.on("exit", (c) => { if (process.env.STRICT && fails.length && c === 0) process.exitCode = 1; });   // STRICT=1: any FAIL makes the exit code non-zero (for CI)
for (const f of fails) console.log(`  SH${String(f.id).padStart(2, "0")}  ${f.check.padEnd(6)} ${f.detail}`);
const outDir = `${KF}/out/${piece.id.toLowerCase()}`;
try {
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(`${outDir}/framecheck.json`, JSON.stringify(rows.map(({ shot, r }) => ({ id: shot.id, label: shot.label, start: shot.start, end: shot.end, plan: { ...shot.plan, subject: typeof shot.plan?.subject === "function" ? "varies" : shot.plan?.subject }, checks: r })), null, 1));
  console.log(`\n${outDir}/framecheck.json`);
} catch (e) { console.error(String(e)); }
