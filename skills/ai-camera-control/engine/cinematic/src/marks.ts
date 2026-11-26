// What the camera frames, as points in the world: a figure's eyes, head top, chin and joints, or an object's bounds.
// The measured pass (tools/frame-check.ts) and the bounding-box framer (src/framer.ts) both read these.
import * as THREE from "three";
import type { Figure } from "./figures";
import type { RigFigure } from "./kit/rig";
import type { Size } from "./shots";

/** how a piece names something the camera can frame: a figure, an object, or a point with a height */
export type Mark = { fig?: Figure; rig?: RigFigure; obj?: THREE.Object3D; point?: () => THREE.Vector3; height?: number; /** an object's point of interest as a share of its height (default its centre) */ eyeAt?: number };
export type Marks = {
  name: string; visible: boolean;
  /** the point of interest: the eyes on a figure, the centre of anything else */
  eye: THREE.Vector3; top: THREE.Vector3; sole: THREE.Vector3; height: number;
  facing?: THREE.Vector3;
  /** which way the body travels or points (facing is where the head looks) */
  heading?: THREE.Vector3;
  /** the body, top to bottom, for reading the shot size from where the frame's bottom edge falls */
  ladder?: { chin: THREE.Vector3; chest: THREE.Vector3; waist: THREE.Vector3; thigh: THREE.Vector3; ankle: THREE.Vector3 };
  /** joints the frame edge must not cut through */
  joints: { name: string; p: THREE.Vector3 }[];
  box?: THREE.Box3;
};

const at = (o: THREE.Object3D, x = 0, y = 0, z = 0) => o.localToWorld(new THREE.Vector3(x, y, z));
const mid = (a: THREE.Vector3, b: THREE.Vector3, k = 0.5) => a.clone().lerp(b, k);
const shown = (o: THREE.Object3D) => { let p: THREE.Object3D | null = o; while (p) { if (!p.visible) return false; p = p.parent; } return true; };

/** read a mark now (call after the world is updated and its matrices are current) */
export function marksOf(name: string, m: Mark): Marks {
  if (m.rig) {
    const r = m.rig.marks();
    let shownR = true; let o: THREE.Object3D | null = m.rig.root; while (o) { if (!o.visible) shownR = false; o = o.parent; }
    return { name, visible: shownR, eye: r.eye, top: r.top, sole: r.sole, height: r.top.y - r.sole.y, facing: r.facing, joints: r.joints, ladder: { chin: r.chin, chest: r.chest, waist: r.waist, thigh: r.thigh, ankle: r.ankle } };
  }
  if (m.fig) {
    const f = m.fig, b = f.b;
    const headTop = b.native ? 2.3 * b.headR + b.headLen + 0.06 : 2 * b.headR + 0.04;
    const eye = at(f.headJ, 0, b.headR + (b.native ? 0.06 : 0.05), b.headR * 0.8);
    const top = at(f.headJ, 0, headTop, 0);
    const chin = at(f.headJ, 0, 0.02, b.headR * 0.5);
    const shoulder = mid(at(f.lArm), at(f.rArm));
    const waist = at(f.spine, 0, b.torso * 0.3, 0);
    const knee = mid(at(f.lKnee), at(f.rKnee));
    const ankle = mid(at(f.lKnee, 0, -b.shin, 0), at(f.rKnee, 0, -b.shin, 0));
    const sole = ankle.clone().add(new THREE.Vector3(0, -b.foot, 0));
    const hip = at(f.pelvis);
    const facing = at(f.headJ, 0, 0, 1).sub(at(f.headJ));
    const joints = [
      ["neck", at(f.neckJ)], ["elbow", at(f.lElbow)], ["elbow", at(f.rElbow)], ["wrist", at(f.lHand)], ["wrist", at(f.rHand)],
      ["waist", waist], ["knee", at(f.lKnee)], ["knee", at(f.rKnee)], ["ankle", ankle],
    ].map(([n, p]) => ({ name: n as string, p: p as THREE.Vector3 }));
    return {
      name, visible: shown(f.root), eye, top, sole, height: top.distanceTo(sole), facing: facing.normalize(), joints,
      ladder: { chin, chest: mid(shoulder, waist), waist, thigh: mid(hip, knee, 0.5), ankle },
    };
  }
  if (m.obj) {
    const box = new THREE.Box3().setFromObject(m.obj);
    const c = box.getCenter(new THREE.Vector3());
    if (m.eyeAt !== undefined) c.y = box.min.y + (box.max.y - box.min.y) * m.eyeAt;
    return { name, visible: shown(m.obj), eye: c, top: new THREE.Vector3(c.x, box.max.y, c.z), sole: new THREE.Vector3(c.x, box.min.y, c.z), height: box.max.y - box.min.y, joints: [], box };
  }
  const p = m.point!(), h = m.height ?? 1;
  return { name, visible: true, eye: p, top: p.clone().add(new THREE.Vector3(0, h / 2, 0)), sole: p.clone().add(new THREE.Vector3(0, -h / 2, 0)), height: h, joints: [] };
}

/** the shot size this frame actually is, read from where the bottom edge falls on the subject */
export function sizeIn(m: Marks, ndc: (p: THREE.Vector3) => { x: number; y: number; front: boolean }): Size | "OFF" {
  const top = ndc(m.top), sole = ndc(m.sole);
  if (!top.front && !sole.front) return "OFF";
  if (m.ladder) {
    const L = m.ladder;
    if (ndc(m.eye).y < -1) return "OFF";
    const order: [Size, THREE.Vector3][] = [["ECU", L.chin], ["CU", L.chest], ["MCU", L.waist], ["MS", L.thigh], ["MWS", L.ankle], ["FS", m.sole]];
    for (const [s, p] of order) if (ndc(p).y < -1) return s;
  }
  let hi = top.y, lo = sole.y, wide = 0;
  if (m.box) {
    // an object fills the frame in whichever direction it is bigger (a flat head fills it sideways)
    const b = m.box, ys: number[] = [], xs: number[] = [];
    for (const x of [b.min.x, b.max.x]) for (const y of [b.min.y, b.max.y]) for (const z of [b.min.z, b.max.z]) { const q = ndc(new THREE.Vector3(x, y, z)); ys.push(q.y); xs.push(q.x); }
    hi = Math.max(...ys); lo = Math.min(...ys);
    const r = Math.max(...xs), l = Math.min(...xs);
    if (r < -1 || l > 1) return "OFF";
    if (r > 1 && l < -1) return "CU";
    wide = (Math.min(1, r) - Math.max(-1, l)) / 2;
  }
  if (lo > 1 || hi < -1) return "OFF";
  if (hi > 1 && lo < -1) return "CU";
  const share = Math.max(wide, (Math.min(1, hi) - Math.max(-1, lo)) / 2);
  return share >= 0.72 ? "FS" : share >= 0.1 ? "WS" : "EWS";
}
