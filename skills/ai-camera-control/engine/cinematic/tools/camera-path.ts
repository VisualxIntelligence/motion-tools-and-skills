// The camera measured against its subject, for a video model's prompt: where the camera is (distance, height, side), where it
// looks, the lens, and where the subject sits in frame, at each time asked for. Numbers come from the shot's own camera and
// the posed body, never typed in.
//   tools/camera-path.sh <piece> [--step 0.5 | t1 t2 ...]   -> one line per time, then JSON on the last line
import * as THREE from "three";
import { loadRigNode } from "./rig-node";
await loadRigNode();
import { PIECES } from "../src/pieces";
import { place } from "../src/camera";
import { marksOf, type Mark } from "../src/marks";

const [id, ...rest] = process.argv.slice(2);
const piece = PIECES[id]; if (!piece) throw new Error("no piece " + id);
const world: any = piece.makeWorld({});
const subjects: Record<string, Mark> = piece.subjects?.(world) ?? {};
const cam = new THREE.PerspectiveCamera();
const step = rest[0] === "--step" ? +rest[1] : 0;
const times = step ? Array.from({ length: Math.floor(piece.duration / step) + 1 }, (_, i) => +(i * step).toFixed(3)).filter((t) => t < piece.duration) : rest.map(Number);
const deg = (r: number) => Math.round((r * 180) / Math.PI);
const UP = new THREE.Vector3(0, 1, 0);

function side(a: number) {   // a: degrees from straight in front of the subject, + toward their right
  const s = Math.abs(a), lr = a >= 0 ? "right" : "left";
  if (s < 15) return "straight in front";
  if (s < 60) return `front-${lr}`;
  if (s < 120) return `${lr} side`;
  if (s < 165) return `back-${lr}`;
  return "straight behind";
}

const out: any[] = [];
for (const t of times) {
  const shot = piece.shotAt(t); const c = shot.cam(t);
  world.setCamera?.(c.pos, c.target); world.update(t, shot.shadow(t)); world.scene.updateMatrixWorld(true); place(cam, c);
  const ps = shot.plan?.subject; const name = typeof ps === "function" ? ps(t) : ps ?? shot.subject?.(t)?.name;
  const row: any = { t, shot: shot.id, mm: Math.round(c.mm) };
  const look = new THREE.Vector3(0, 0, -1).applyQuaternion(cam.quaternion);
  row.tilt = deg(Math.asin(THREE.MathUtils.clamp(look.y, -1, 1)));       // + looking up
  if (name && subjects[name]) {
    const m = marksOf(name, subjects[name]);
    const mid = m.sole.clone().lerp(m.top, 0.5), to = c.pos.clone().sub(mid); to.y = 0;
    const f = (m.facing ?? new THREE.Vector3(0, 0, 1)).clone(); f.y = 0; f.normalize();
    const right = f.clone().cross(UP).normalize();
    const az = deg(Math.atan2(to.clone().normalize().dot(right), to.clone().normalize().dot(f)));
    // the camera's height above the ground under it, and against the subject's eyes (a jump lifts the eyes, not the camera)
    const rc = new THREE.Raycaster(c.pos.clone().setY(c.pos.y + 50), new THREE.Vector3(0, -1, 0)); const hit = rc.intersectObjects(world.scene.children, true).find((i: any) => !(i.object.userData?.noPathTrace) && i.point.y < c.pos.y);
    const h = c.pos.y - (hit ? hit.point.y : 0), dEye = c.pos.y - m.eye.y;
    const pt = m.top.clone().project(cam), pb = m.sole.clone().project(cam), pm = mid.clone().project(cam);
    Object.assign(row, { subject: name, dist: +to.length().toFixed(2), height: +h.toFixed(2), eyeDiff: +dEye.toFixed(2), az, side: side(az),
      frameX: +((pm.x + 1) / 2).toFixed(2), frameH: +((pt.y - pb.y) / 2).toFixed(2) });
  }
  row.pos = [+c.pos.x.toFixed(3), +c.pos.y.toFixed(3), +c.pos.z.toFixed(3)];
  out.push(row);
  const across = row.frameX == null ? "" : row.frameX < 0.4 ? "left of centre" : row.frameX > 0.6 ? "right of centre" : "centred";
  console.log(row.subject
    ? `${t.toFixed(2)} s  shot ${row.shot}: ${row.side} of ${row.subject} (${row.az}°), ${row.dist} m away, ${row.height} m off the ground, ${Math.abs(row.eyeDiff) < 0.2 ? "level with " + row.subject + "'s eyes" : Math.abs(row.eyeDiff) + " m " + (row.eyeDiff > 0 ? "above " : "below ") + row.subject + "'s eyes"}, ${row.tilt > 4 ? "looking up " + row.tilt + "°" : row.tilt < -4 ? "looking down " + -row.tilt + "°" : "level"}, ${row.mm} mm; ${row.subject} ${across}, ${Math.round(row.frameH * 100)}% of frame height`
    : `${t.toFixed(2)} s  shot ${row.shot}: no subject, ${row.mm} mm, tilt ${row.tilt}°`);
}
// camera speed between the samples (needs two or more times, ideally --step 0.5 or smaller)
const speeds: number[] = [];
for (let i = 1; i < out.length; i++) {
  const a = out[i - 1], b = out[i], dt = b.t - a.t;
  if (dt > 0 && a.pos && b.pos) { const d = Math.hypot(b.pos[0] - a.pos[0], b.pos[1] - a.pos[1], b.pos[2] - a.pos[2]); b.speed = +(d / dt).toFixed(3); speeds.push(b.speed); }
}
if (speeds.length) console.log(`camera speed between samples: average ${(speeds.reduce((x, y) => x + y, 0) / speeds.length).toFixed(2)} m/s, peak ${Math.max(...speeds).toFixed(2)} m/s`);
console.log(JSON.stringify(out));
