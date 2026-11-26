// The rigged mannequin: Quaternius "Universal Animation Library" 1 and 2 (CC0, one skeleton), a faceless clay figure with
// about 80 captured clips: locomotion, sitting and driving, and the action set (jumps, rolls, slides, climbs, punches,
// hits, knockbacks, falls, pistol and sword work, throws).
// Clips are sampled, never played: every frame sets each clip's time from the actor's own clock (the walk from the
// distance walked, so the feet never slide), sets the blend weights, and evaluates once. A frame is a pure function of t.
import * as THREE from "three";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { GREY, TINT, clay, type Tint } from "./clay";
import { smoother } from "../util";

export const RIG_FILE = "kit/UAL1_Standard.glb";
/** the second library's clips (its mesh is not used: same skeleton, same bone names) */
export const RIG_EXTRA = "kit/UAL2_Standard.glb";
let asset: GLTF | null = null;
export const setRigAsset = (g: GLTF, extra?: GLTF) => {
  asset = g;
  if (extra) for (const c of extra.animations) if (!g.animations.some((a) => a.name === c.name)) g.animations.push(c);
};
/** every clip by name, for acts that play one directly */
export const rigClips = () => (asset?.animations ?? []).map((a) => ({ name: a.name, duration: a.duration }));
export const rigReady = () => !!asset;

/** where the body is, in metres above the feet, in each held pose (measured from the clips at scale 1) */
export const RIG_POSES = {
  stand: { eye: 1.64, top: 1.78, chin: 1.5, chest: 1.2, waist: 1.01, hip: 0.87, thigh: 0.7, ankle: 0.1 },
  sit: { eye: 1.3, top: 1.43, chin: 1.16, chest: 0.87, waist: 0.68, hip: 0.54, thigh: 0.53, ankle: 0.1 },
  kneel: { eye: 0.96, top: 1.01, chin: 0.82, chest: 0.68, waist: 0.54, hip: 0.41, thigh: 0.43, ankle: 0.1 },
  crouch: { eye: 0.95, top: 1.06, chin: 0.81, chest: 0.7, waist: 0.58, hip: 0.47, thigh: 0.5, ankle: 0.1 },
};
export type RigPose = keyof typeof RIG_POSES;

/** the clips each state uses, and the ground each moving clip covers per cycle (m), measured with the planted foot held
 *  still (tools/scratch/calib.ts): walk 0.97 m/s, jog 5.1 m/s (a long-stride run), sprint 6.1 m/s at the clip's own pace */
const CLIP = { idle: "Idle_Loop", talk: "Idle_Talking_Loop", walk: "Walk_Loop", jog: "Jog_Fwd_Loop", sprint: "Sprint_Loop", sit: "Sitting_Idle_Loop", sitTalk: "Sitting_Talking_Loop", drive: "Driving_Loop", kneel: "Fixing_Kneeling", crouch: "Crouch_Idle_Loop", point: "Interact", palm: "Spell_Simple_Idle_Loop", fall: "Jump_Loop", push: "Push_Loop" } as const;
export type ClipKey = keyof typeof CLIP;
/** a weight key: one of the named states above, or any clip by its own name */
type WeightKey = ClipKey | string;
type Foot = "l" | "r";
/** a gait's feet through one cycle: the skid correction for each foot, and whether it is on the floor */
type GaitTable = { fix: Record<Foot, THREE.Vector3[]>; down: Record<Foot, boolean[]> };
const TABLE_N = 240;
export const STRIDE = { walk: 1.3, jog: 4.8, sprint: 4.1 } as const;
export type Gait = keyof typeof STRIDE;
export const CLIP_LEN: Record<Gait, number> = { walk: 1.333, jog: 0.933, sprint: 0.667 };

export class RigFigure {
  root = new THREE.Group();
  private mixer: THREE.AnimationMixer;
  private actions = new Map<string, THREE.AnimationAction>();
  private tables: Partial<Record<Gait, GaitTable>> = {};
  bone: Record<string, THREE.Object3D> = {};
  /** the clip's neck and head rotations before look() turned them: the mixer only rewrites a bone whose clip value
   *  changed, so a look left on the bones would stack up over repeated poses at nearby times */
  private beforeLook: [THREE.Object3D, THREE.Quaternion][] = [];
  private model: THREE.Object3D;
  /** the sole vertices (within 6 cm of the ground at bind), read after every pose to keep the feet out of the floor */
  private soles: [THREE.SkinnedMesh, number[]][] = [];
  private shell: [THREE.SkinnedMesh, number[]][] = [];
  constructor(tint: Tint) {
    if (!asset) throw new Error("the mannequin rig is not loaded");
    const model = cloneSkinned(asset.scene);
    this.model = model;
    model.traverse((o: any) => {
      if (!o.isMesh) return;
      o.castShadow = true; o.receiveShadow = true; o.frustumCulled = false;
      // clay: the body in the actor's tint, the joints a shade darker
      o.material = o.material.name === "M_Joints" ? clay("#" + new THREE.Color(TINT[tint]).multiplyScalar(0.72).getHexString(), 0.9) : clay(TINT[tint], 0.88);
    });
    this.root.add(model);
    model.updateMatrixWorld(true);
    model.traverse((o: any) => {
      if (!o.isSkinnedMesh) return;
      const pos = o.geometry.attributes.position, v = new THREE.Vector3(), ids: number[] = [];
      for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld); if (v.y < 0.06) ids.push(i); }
      if (ids.length) this.soles.push([o, ids]);
      // and a sparse shell of the whole body, so a roll or a fall cannot press a back or a shoulder into the floor
      const shell: number[] = []; for (let i = 0; i < pos.count; i += 12) shell.push(i);
      this.shell.push([o, shell]);
    });
    for (const n of ["Head", "neck_01", "spine_01", "spine_03", "pelvis", "upperarm_l", "upperarm_r", "lowerarm_l", "lowerarm_r", "hand_l", "hand_r", "thigh_l", "thigh_r", "calf_l", "calf_r", "foot_l", "foot_r"]) this.bone[n] = model.getObjectByName(n)!;
    this.mixer = new THREE.AnimationMixer(model);
    for (const [k, name] of Object.entries(CLIP) as [ClipKey, string][]) this.action(k, name);
    for (const g of Object.keys(STRIDE) as Gait[]) this.tables[g] = this.table(g);
  }
  private action(key: string, name = key) {
    let a = this.actions.get(key);
    if (a) return a;
    const c = asset!.animations.find((x) => x.name === name);
    if (!c) return undefined;
    a = this.mixer.clipAction(c); a.play(); a.setEffectiveWeight(0); this.actions.set(key, a);
    return a;
  }
  /** sample a gait once and measure its landing skid: the clip's heel touches down still moving, so the vertex on the
   *  floor slides a few centimetres before the roll takes over. For each foot this is the correction (figure frame) that
   *  holds the touching point still, accumulated through the stance and let go over the swing */
  private table(g: Gait): GaitTable {
    const a = this.actions.get(g)!, d = a.getClip().duration, v = STRIDE[g] / d, dt = d / TABLE_N;
    for (const x of this.actions.values()) x.setEffectiveWeight(0);
    a.setEffectiveWeight(1);
    const side = (m: THREE.SkinnedMesh, i: number) => { const p = new THREE.Vector3().fromBufferAttribute(m.geometry.attributes.position as THREE.BufferAttribute, i).applyMatrix4(m.matrixWorld); return p.x > 0 ? "l" : "r"; };
    this.model.updateMatrixWorld(true);
    const soles: Record<Foot, [THREE.SkinnedMesh, number][]> = { l: [], r: [] };
    for (const [m, ids] of this.soles) for (const i of ids) soles[side(m, i)].push([m, i]);
    const inv = new THREE.Matrix4(), q = new THREE.Vector3();
    const sample = (k: number) => {
      a.time = (((k % TABLE_N) + TABLE_N) % TABLE_N) / TABLE_N * d; this.mixer.update(0); this.root.updateMatrixWorld(true); inv.copy(this.root.matrixWorld).invert();
      const out = {} as Record<Foot, THREE.Vector3[]>;
      for (const f of ["l", "r"] as Foot[]) out[f] = soles[f].map(([m, i]) => { m.getVertexPosition(i, q); return q.clone().applyMatrix4(m.matrixWorld).applyMatrix4(inv); });
      return out;
    };
    const S = Array.from({ length: TABLE_N + 1 }, (_, k) => sample(k));
    a.setEffectiveWeight(0);
    const fix = { l: [] as THREE.Vector3[], r: [] as THREE.Vector3[] }, down = { l: [] as boolean[], r: [] as boolean[] };
    for (const f of ["l", "r"] as Foot[]) {
      const lo = Math.min(...S.slice(0, TABLE_N).map((s) => Math.min(...s[f].map((p) => p.y))));
      const low = S.map((s) => { let b = 0; s[f].forEach((p, i) => { if (p.y < s[f][b].y) b = i; }); return b; });
      // down from 5 cm above the floor: the heel is slowed into the ground in its last few centimetres, so it lands still
      for (let k = 0; k < TABLE_N; k++) down[f].push(S[k][f][low[k]].y < lo + 0.05);
      // a gap shorter than 8% of the cycle is the heel rising mid-stance, not a lift-off: bridge it (a restart would jump)
      for (let k = 0; k < TABLE_N; k++) if (down[f][k] && !down[f][(k + 1) % TABLE_N]) {
        let n = 1; while (!down[f][(k + n) % TABLE_N] && n < TABLE_N) n++;
        if (n < 0.08 * TABLE_N) for (let m = 1; m < n; m++) down[f][(k + m) % TABLE_N] = true;
      }
      // run two cycles so a stance that wraps past the clip's end starts from its landing
      let off = new THREE.Vector3(), since = 1e9;
      const acc: THREE.Vector3[] = new Array(TABLE_N);
      // the correction is let go through the swing and is gone exactly at the next landing (a sprint's swing is short)
      const until = (k: number) => { let n = 0; while (!down[f][(k + n) % TABLE_N] && n < TABLE_N) n++; return n; };
      for (let n = 0; n < 2 * TABLE_N; n++) {
        const k = n % TABLE_N;
        if (down[f][k]) {
          if (!down[f][(k - 1 + TABLE_N) % TABLE_N]) off = new THREE.Vector3();
          const now = S[k][f][low[k]], next = S[k + 1][f][low[k]];
          // a point fixed to the floor moves backward at the body's speed in the figure's frame; the rest is skid
          off.add(new THREE.Vector3(-(next.x - now.x), 0, -(next.z - now.z) - v * dt));
          since = 0;
        } else since++;
        const left = down[f][k] ? 1 : until(k);
        acc[k] = off.clone().multiplyScalar(down[f][k] ? 1 : smoother(left / (left + since)));
      }
      fix[f] = acc;
    }
    return { fix, down };
  }
  /** the phase at which a gait's left foot lands: added to a shared clock, two gaits land together */
  landing(g: Gait) {
    const d = this.tables[g]!.down.l;
    for (let k = 0; k < TABLE_N; k++) if (d[k] && !d[(k - 1 + TABLE_N) % TABLE_N]) return k / TABLE_N;
    return 0;
  }
  /** the landing-skid correction for a gait's foot at this phase, in the figure's frame */
  skid(g: Gait, f: Foot, phase: number) {
    const T = this.tables[g]!, x = (((phase % 1) + 1) % 1) * TABLE_N, i = Math.floor(x) % TABLE_N, j = (i + 1) % TABLE_N;
    return T.fix[f][i].clone().lerp(T.fix[f][j], x - Math.floor(x));
  }
  /** two-bone leg IK: move the ankle toward a world point (by w), keeping the knee's plane and the foot's own angle */
  pinFoot(f: Foot, target: THREE.Vector3, w: number) {
    if (w <= 0) return;
    this.root.updateMatrixWorld(true);
    const thigh = this.bone["thigh_" + f], calf = this.bone["calf_" + f], foot = this.bone["foot_" + f];
    const H = thigh.getWorldPosition(new THREE.Vector3()), K = calf.getWorldPosition(new THREE.Vector3()), A = foot.getWorldPosition(new THREE.Vector3());
    const T = A.clone().lerp(target, w);
    if (T.distanceTo(A) < 1e-4) return;
    const footQ = foot.getWorldQuaternion(new THREE.Quaternion());
    const a = H.distanceTo(K), b = K.distanceTo(A), c = THREE.MathUtils.clamp(H.distanceTo(T), Math.abs(a - b) + 1e-3, a + b - 1e-3);
    // the knee: in the plane of hip, target and the current knee, at the angle the lengths allow
    const ht = T.clone().sub(H).normalize(), toK = K.clone().sub(H);
    const side = toK.clone().sub(ht.clone().multiplyScalar(toK.dot(ht))).normalize();
    const cosA = (a * a + c * c - b * b) / (2 * a * c), sinA = Math.sqrt(Math.max(0, 1 - cosA * cosA));
    const K2 = H.clone().add(ht.clone().multiplyScalar(a * cosA)).add(side.multiplyScalar(a * sinA));
    const turn = (bone: THREE.Object3D, from: THREE.Vector3, to: THREE.Vector3) => {
      const q = new THREE.Quaternion().setFromUnitVectors(from.clone().normalize(), to.clone().normalize());
      const world = bone.getWorldQuaternion(new THREE.Quaternion()).premultiply(q);
      const parent = bone.parent!.getWorldQuaternion(new THREE.Quaternion()).invert();
      bone.quaternion.copy(parent.multiply(world)); bone.updateMatrixWorld(true);
    };
    turn(thigh, K.clone().sub(H), K2.clone().sub(H));
    const K3 = calf.getWorldPosition(new THREE.Vector3()), A3 = foot.getWorldPosition(new THREE.Vector3());
    turn(calf, A3.clone().sub(K3), T.clone().sub(K3));
    // the foot keeps the angle the clip gave it, so the sole stays flat on the floor
    const parent = foot.parent!.getWorldQuaternion(new THREE.Quaternion()).invert();
    foot.quaternion.copy(parent.multiply(footQ)); foot.updateMatrixWorld(true);
  }
  /** pose for time t: `weights` per clip (normalised here), the cycles each gait has run (its own clock, from the actor's
   *  path) and the clock for the rest */
  pose(weights: Partial<Record<WeightKey, number>>, cycles: Partial<Record<Gait, number>>, t: number, startOf: Partial<Record<WeightKey, number>> = {}) {
    for (const k of Object.keys(weights)) if ((weights[k] ?? 0) > 0 && !this.actions.has(k)) this.action(k);
    for (const [b, q] of this.beforeLook) b.quaternion.copy(q);
    this.beforeLook = [];
    const total = Object.values(weights).reduce<number>((a, b) => a + (b ?? 0), 0) || 1;
    for (const [k, a] of this.actions) {
      const w = (weights[k] ?? 0) / total;
      a.setEffectiveWeight(w);
      if (w <= 0) continue;
      const d = a.getClip().duration;
      const c = cycles[k as Gait], name = a.getClip().name;
      // gaits by their own cycle clock; a named clip from its act's start, held on its last frame unless it loops;
      // the held states loop on the clock
      const time = c !== undefined ? (((c % 1) + 1) % 1) * d
        : !(k in CLIP) ? (/Loop/.test(name) ? (t - (startOf[k] ?? 0)) % d : THREE.MathUtils.clamp(t - (startOf[k] ?? 0), 0, d - 1e-3))
        : (t - (startOf[k] ?? 0) + 0.4) % d;
      a.time = Math.max(0, time);
    }
    this.mixer.update(0);
    this.ground();
  }
  /** the clips' toes dip a few centimetres below the floor at heel-off and heel-strike (and a roll's back does): lift
   *  the body by exactly that */
  private ground() {
    this.model.position.y = 0;
    this.root.updateMatrixWorld(true);
    const inv = new THREE.Matrix4().copy(this.root.matrixWorld).invert(), v = new THREE.Vector3();
    let low = Infinity;
    for (const [m, ids] of [...this.soles, ...this.shell]) {
      const toRoot = new THREE.Matrix4().multiplyMatrices(inv, m.matrixWorld);
      for (const i of ids) { m.getVertexPosition(i, v); v.applyMatrix4(toRoot); if (v.y < low) low = v.y; }
    }
    if (low < 0) { this.model.position.y = -low; this.root.updateMatrixWorld(true); }
  }
  /** turn the head (and a little of the neck) toward a world point, over the clip; w blends it in */
  look(target: THREE.Vector3, w: number, extraPitch = 0) {
    this.root.updateMatrixWorld(true);
    const head = this.bone.Head, neck = this.bone.neck_01;
    if (!this.beforeLook.length) this.beforeLook = [[neck, neck.quaternion.clone()], [head, head.quaternion.clone()]];
    const hp = head.getWorldPosition(new THREE.Vector3());
    const inv = new THREE.Matrix4().copy(this.root.matrixWorld).invert();
    const d = target.clone().applyMatrix4(inv).sub(hp.clone().applyMatrix4(inv));
    const yaw = THREE.MathUtils.clamp(Math.atan2(d.x, d.z), -1.2, 1.2) * w;
    const pitch = THREE.MathUtils.clamp(-Math.atan2(d.y, Math.hypot(d.x, d.z)), -0.6, 0.6) * w + extraPitch;
    // rotations about the figure's own up and side axes, applied in the parent frames of the neck and head
    const turn = (bone: THREE.Object3D, y: number, p: number) => {
      const parentQ = bone.parent!.getWorldQuaternion(new THREE.Quaternion()), rootQ = this.root.getWorldQuaternion(new THREE.Quaternion());
      const toLocal = parentQ.clone().invert().multiply(rootQ);
      const up = new THREE.Vector3(0, 1, 0).applyQuaternion(toLocal), side = new THREE.Vector3(1, 0, 0).applyQuaternion(toLocal);
      bone.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(up, y)).premultiply(new THREE.Quaternion().setFromAxisAngle(side, p));
    };
    turn(neck, yaw * 0.35, pitch * 0.35); neck.updateMatrixWorld(true);
    turn(head, yaw * 0.65, pitch * 0.65);
  }
  /** the landmarks the camera and the measured pass read, in world space */
  marks() {
    this.root.updateMatrixWorld(true);
    const b = this.bone, at = (o: THREE.Object3D, x = 0, y = 0, z = 0) => o.localToWorld(new THREE.Vector3(x, y, z));
    const s = this.root.scale.y;
    // the head bone sits at the base of the skull with its axes level with the body's: offsets are in its frame
    const hq = b.Head.getWorldQuaternion(new THREE.Quaternion());
    const off = (x: number, y: number, z: number) => b.Head.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(x, y, z).multiplyScalar(s).applyQuaternion(hq));
    const eye = off(0, 0.12, 0.09), top = off(0, 0.26, 0.0), chin = off(0, -0.02, 0.08);
    const shoulder = at(b.upperarm_l).lerp(at(b.upperarm_r), 0.5), waist = at(b.spine_01), hip = at(b.pelvis);
    const knee = at(b.calf_l).lerp(at(b.calf_r), 0.5), ankle = at(b.foot_l).lerp(at(b.foot_r), 0.5);
    const sole = ankle.clone().setY(this.root.getWorldPosition(new THREE.Vector3()).y);
    const facing = new THREE.Vector3(0, 0, 1).applyQuaternion(hq).setY(0).normalize();
    return {
      eye, top, chin, chest: shoulder.clone().lerp(waist, 0.5), waist, thigh: hip.clone().lerp(knee, 0.5), ankle, sole, facing,
      joints: [["neck", at(b.neck_01)], ["elbow", at(b.lowerarm_l)], ["elbow", at(b.lowerarm_r)], ["wrist", at(b.hand_l)], ["wrist", at(b.hand_r)], ["waist", waist], ["knee", at(b.calf_l)], ["knee", at(b.calf_r)], ["ankle", ankle], ["footL", at(b.foot_l)], ["footR", at(b.foot_r)], ["hipL", at(b.thigh_l)], ["hipR", at(b.thigh_r)]].map(([n, p]) => ({ name: n as string, p: p as THREE.Vector3 })),
    };
  }
}

export async function loadRigBrowser(url: string, extraUrl?: string) {
  if (asset) return;
  const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
  const [g, x] = await Promise.all([new GLTFLoader().loadAsync(url), extraUrl ? new GLTFLoader().loadAsync(extraUrl) : Promise.resolve(undefined)]);
  setRigAsset(g, x);
}
void GREY;
