// What a labelled contact sheet says about each frame, read from the same camera that renders it:
// the shot and how we cut into it, lens and rig, shot size and angle, the move (and an arrow for where the frame
// travels), and a tag on every character in view (projected, and dropped when the set hides them).
//   PIECE=Rootsong node sheet-data.mjs 1.0,5.0,7.4 > frames.json   (x, y in pixels of the 1920x804 picture)
import * as THREE from "three";
import { PIECES } from "../src/pieces";
import { loadRigNode } from "./rig-node";
await loadRigNode();
import { measure, place, realCam } from "../src/camera";
import { marksOf, sizeIn } from "../src/marks";

const piece = PIECES[process.env.PIECE ?? "Rootsong"];
const off = piece.offset ?? 0;
const world: any = piece.makeWorld({});
const subjects = piece.subjects?.(world) ?? {};
/** who each subject is, as the sheet names them */
const NAMES: Record<string, string> = JSON.parse(process.env.NAMES ?? "{}");
const cam = new THREE.PerspectiveCamera(), rc = new THREE.Raycaster();
const owner = new Map<THREE.Object3D, string>();
for (const [n, m] of Object.entries(subjects)) { const o = m.fig?.root ?? m.rig?.root ?? m.obj; if (o) owner.set(o, n); }
const ownerOf = (o: THREE.Object3D | null) => { while (o) { const n = owner.get(o); if (n) return n; o = o.parent; } return null; };
const meshes: THREE.Object3D[] = [];
world.scene.traverse((o: any) => { if (o.isMesh && !(o.geometry?.parameters?.radius >= 2000) && !o.material?.transparent) meshes.push(o); });
const ndc = (p: THREE.Vector3) => { const v = p.clone().project(cam); return { x: v.x, y: v.y, front: p.clone().applyMatrix4(cam.matrixWorldInverse).z < 0 }; };
const deg = (r: number) => (r * 180) / Math.PI;

const pose = (t: number) => {
  const shot = piece.shotAt(t);
  const rcam = realCam(shot, t, piece.fps);
  world.setCamera?.(rcam.cam.pos, rcam.cam.target);
  world.update(t, shot.shadow(t));
  world.scene.updateMatrixWorld(true);
  place(cam, rcam.cam);
  return { shot, rcam };
};

const out: any[] = [];
for (const film of process.argv[2].split(",").map(Number)) {
  const t = film - off;
  const { shot, rcam } = pose(t);
  const c = rcam.cam, m = measure(shot, t, piece.fps);
  const plan = shot.plan ?? {};
  const subj = typeof plan.subject === "function" ? plan.subject(t) : plan.subject;
  // size and angle on the subject of the shot
  let size = "", angle = "", side = "";
  if (subj && subjects[subj]) {
    const mk = marksOf(subj, subjects[subj]);
    size = sizeIn(mk, ndc);
    const rel = c.pos.clone().sub(mk.eye), va = deg(Math.atan2(rel.y, Math.hypot(rel.x, rel.z)));
    angle = `${va > 45 ? "OVERHEAD" : va > 20 ? "HIGH ANGLE" : va > 7 ? "SLIGHT HIGH" : va < -40 ? "WORM'S-EYE" : va < -18 ? "LOW ANGLE" : va < -7 ? "SLIGHT LOW" : "EYE LEVEL"} ${va >= 0 ? "+" : ""}${va.toFixed(0)}°`;
    if (mk.facing && mk.ladder) {
      const h = rel.clone().setY(0).normalize(), f = mk.facing.clone().setY(0).normalize();
      const a = deg(Math.acos(Math.max(-1, Math.min(1, h.dot(f)))));
      side = a < 25 ? "FRONT" : a < 65 ? "3/4 FRONT" : a < 115 ? "PROFILE" : a < 155 ? "3/4 BACK" : "BACK";
    }
  }
  // where the frame travels over the next quarter second: a point at the subject's distance, seen from now and then
  const D = Math.max(1, rcam.focus);
  const p0 = c.pos.clone().add(c.target.clone().sub(c.pos).normalize().multiplyScalar(D));
  const t1 = Math.min(shot.end - 1e-3, t + 0.25), t0 = t1 - 0.25;
  const a0 = realCam(shot, t0, piece.fps).cam, a1 = realCam(shot, t1, piece.fps).cam;
  place(cam, a0); const q0 = p0.clone().project(cam);
  place(cam, a1); const q1 = p0.clone().project(cam);
  const push = (a1.pos.distanceTo(p0) - a0.pos.distanceTo(p0)) / D + Math.log(a0.mm / a1.mm);
  place(cam, c);
  const arrow = { dx: -(q1.x - q0.x), dy: -(q1.y - q0.y), push: +push.toFixed(3) };
  // characters in view
  const items: any[] = [];
  for (const [n, mk0] of Object.entries(subjects)) {
    if (!NAMES[n]) continue;
    const mk = marksOf(n, mk0);
    if (!mk.visible) continue;
    // the eyes; for a figure whose head is out of frame (a foreground shoulder), the chest or the waist
    const pts = mk.ladder ? [mk.eye, mk.ladder.chest, mk.ladder.waist, ...mk.joints.map((j) => j.p)] : [mk.eye];
    const p = pts.find((x) => { const q = ndc(x); return q.front && Math.abs(q.x) <= 0.97 && Math.abs(q.y) <= 0.97; });
    if (!p) continue;
    const q = ndc(p);
    const d = p.distanceTo(c.pos);
    rc.set(c.pos, p.clone().sub(c.pos).normalize()); rc.far = d; rc.near = 0.05;
    // the set and the ship hide a character; another character in front does not
    const hit = rc.intersectObjects(meshes, false).find((h) => { const o = ownerOf(h.object); return o !== n && (!o || o === "SHIP") && h.distance < d - 0.4; });
    if (hit) continue;
    items.push({ key: n, name: NAMES[n], x: Math.round(((q.x + 1) / 2) * 1920), y: Math.round(((1 - q.y) / 2) * 804), dist: +d.toFixed(1) });
  }
  out.push({
    film, shot: shot.id, label: shot.label, start: shot.start + off, end: shot.end + off,
    cut: plan.cut ?? "", lens: `${rcam.raw.mm.toFixed(0)} mm`, rig: shot.rig ?? "", size, angle, side, move: m.moves,
    focus: m.lines[2][1], arrow, items,
  });
}
console.log(JSON.stringify(out));
