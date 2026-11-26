// Low-poly mannequins, posed by joint angles. A figure faces +z; its left is +x. Angles are in radians and named for
// what they do ("forward", "bend"), so poses read like stage directions.
import * as THREE from "three";
import { lerp } from "./util";

const clayGrey = (c: string) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.95 });

export type Pose = {
  crouch: number;      // pelvis drop (m)
  lean: number;        // whole-body pitch forward
  spine: number; twist: number; neck: number; head: number; headYaw: number;
  lArm: number; lAbd: number; lElbow: number; lWrist: number;
  rArm: number; rAbd: number; rElbow: number; rWrist: number;
  lHip: number; lKnee: number; rHip: number; rKnee: number;
};
export const REST: Pose = {
  crouch: 0, lean: 0, spine: 0, twist: 0, neck: 0, head: 0, headYaw: 0,
  lArm: 0, lAbd: 0.08, lElbow: 0.15, lWrist: 0, rArm: 0, rAbd: 0.08, rElbow: 0.15, rWrist: 0,
  lHip: 0, lKnee: 0, rHip: 0, rKnee: 0,
};
export const pose = (p: Partial<Pose>): Pose => ({ ...REST, ...p });
export function mix(a: Pose, b: Pose, w: number): Pose {
  const o = {} as Pose;
  for (const k of Object.keys(a) as (keyof Pose)[]) o[k] = lerp(a[k], b[k], w);
  return o;
}
export function add(a: Pose, b: Partial<Pose>): Pose {
  const o = { ...a };
  for (const k of Object.keys(b) as (keyof Pose)[]) o[k] += b[k]!;
  return o;
}

export type Build = {
  thigh: number; shin: number; foot: number; torso: number; neck: number; headR: number; headLen: number;
  shoulderW: number; upper: number; fore: number; hipW: number;
  limbR: number; torsoR: number; native: boolean;
  style?: "suit" | "runner" | "captain" | "navigator" | "plain";   // plain: a faceless clay mannequin (previs placeholder)
};
export const HUMAN: Build = { thigh: 0.45, shin: 0.45, foot: 0.08, torso: 0.56, neck: 0.07, headR: 0.135, headLen: 0.02, shoulderW: 0.2, upper: 0.3, fore: 0.28, hipW: 0.1, limbR: 0.06, torsoR: 0.16, native: false };
export const NATIVE: Build = { thigh: 0.8, shin: 0.82, foot: 0.1, torso: 0.82, neck: 0.3, headR: 0.15, headLen: 0.16, shoulderW: 0.25, upper: 0.56, fore: 0.54, hipW: 0.12, limbR: 0.065, torsoR: 0.17, native: true };

export const hipHeight = (b: Build) => b.thigh + b.shin + b.foot;

function cap(r: number, len: number, mat: THREE.Material, seg = 8) {
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, Math.max(0.001, len - 2 * r), 4, seg), mat);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}
/** a limb segment hanging down from its joint */
function segment(parent: THREE.Object3D, r: number, len: number, mat: THREE.Material, r2 = r) {
  const j = new THREE.Group();
  parent.add(j);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r2, len, 8), mat);
  m.position.y = -len / 2; m.castShadow = true; m.receiveShadow = true;
  j.add(m);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(r * 1.05, 10, 8), mat);
  ball.castShadow = true; j.add(ball);
  const end = new THREE.Group(); end.position.y = -len; j.add(end);
  return { j, end };
}

export class Figure {
  root = new THREE.Group();
  pelvis = new THREE.Group();
  spine = new THREE.Group();
  neckJ = new THREE.Group();
  headJ = new THREE.Group();
  lArm: THREE.Group; lElbow: THREE.Group; lHand: THREE.Group;
  rArm: THREE.Group; rElbow: THREE.Group; rHand: THREE.Group;
  lHip: THREE.Group; lKnee: THREE.Group; rHip: THREE.Group; rKnee: THREE.Group;
  // a face that talks: eyes that aim, brows, a mouth and a jaw that open with the voice
  eyes: THREE.Mesh[] = []; brows: THREE.Mesh[] = []; mouth?: THREE.Mesh; jaw?: THREE.Mesh; goggles?: THREE.Group;
  constructor(public b: Build, mats: { body: THREE.Material; accent: THREE.Material; dark: THREE.Material; glow?: THREE.Material; skin?: THREE.Material; legs?: THREE.Material }) {
    const { body, accent, dark } = mats;
    const style = b.style ?? "suit";
    this.root.add(this.pelvis);
    this.pelvis.position.y = hipHeight(b);
    // pelvis block
    const hips = cap(b.torsoR * 0.85, b.hipW * 2 + b.torsoR, body);
    hips.rotation.z = Math.PI / 2; this.pelvis.add(hips);
    this.pelvis.add(this.spine);
    // torso: a waist and a chest
    const waist = new THREE.Mesh(new THREE.CylinderGeometry(b.torsoR * (b.native ? 0.62 : 0.8), b.torsoR * 0.85, b.torso * 0.45, 10), body);
    waist.position.y = b.torso * 0.22; waist.castShadow = true; this.spine.add(waist);
    const chest = new THREE.Mesh(new THREE.CylinderGeometry(b.torsoR * (b.native ? 1.25 : 1.15), b.torsoR * (b.native ? 0.7 : 0.85), b.torso * 0.6, 10), body);
    chest.position.y = b.torso * 0.68; chest.scale.z = 0.72; chest.castShadow = true; this.spine.add(chest);
    if (!b.native && style !== "suit" && style !== "plain") {
      // a coat: a belt and a long skirt below the waist
      const belt = new THREE.Mesh(new THREE.CylinderGeometry(b.torsoR * 0.9, b.torsoR * 0.9, 0.06, 12), dark);
      belt.position.y = b.torso * 0.36; belt.scale.z = 0.8; this.spine.add(belt);
      if (style === "captain") {
        const tail = new THREE.Mesh(new THREE.CylinderGeometry(b.torsoR * 0.95, b.torsoR * 1.35, 0.55, 12, 1, true), body);
        tail.position.y = 0.02; tail.scale.z = 0.8; tail.castShadow = true; this.pelvis.add(tail);
      }
    }
    if (!b.native && style === "suit") {
      // suit marks: a chest band and a backpack
      const band = new THREE.Mesh(new THREE.CylinderGeometry(b.torsoR * 1.07, b.torsoR * 0.98, 0.07, 12), accent);
      band.position.y = b.torso * 0.62; band.scale.z = 0.76; this.spine.add(band);
      const pack = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.38, 0.16), dark);
      pack.position.set(0, b.torso * 0.66, -0.17); pack.castShadow = true; this.spine.add(pack);
      const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.32, 8), accent);
      tank.position.set(0.08, b.torso * 0.68, -0.27); this.spine.add(tank);
    }
    this.neckJ.position.y = b.torso; this.spine.add(this.neckJ);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(b.limbR * (b.native ? 0.8 : 1.1), b.limbR * 1.2, b.neck + 0.04, 8), body);
    neck.position.y = (b.neck + 0.04) / 2; neck.castShadow = true; this.neckJ.add(neck);
    this.headJ.position.y = b.neck; this.neckJ.add(this.headJ);
    if (b.native) {
      // long skull tipped back, a fan crest, freckles
      const skull = cap(b.headR, b.headR * 2 + b.headLen, body, 10);
      skull.position.set(0, b.headR + 0.04, 0.02); skull.rotation.x = -0.35; skull.scale.x = 0.82; this.headJ.add(skull);
      const jaw = new THREE.Mesh(new THREE.ConeGeometry(b.headR * 0.62, 0.18, 8), body);
      jaw.position.set(0, 0.07, 0.11); jaw.rotation.x = Math.PI * 0.62; jaw.castShadow = true; this.headJ.add(jaw);
      for (let i = 0; i < 5; i++) {
        const fin = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.42 + 0.12 * (2 - Math.abs(i - 2)), 0.1), accent);
        const a = -0.9 + i * 0.45;
        const holder = new THREE.Group();
        holder.position.set(0, b.headR + 0.1, -0.08); holder.rotation.set(-1.0, 0, a);
        fin.position.y = 0.24; fin.castShadow = true; holder.add(fin); this.headJ.add(holder);
      }
      for (const s of [-1, 1]) {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 6), mats.glow ?? dark);
        eye.position.set(0.06 * s, b.headR + 0.06, b.headR * 0.78); this.headJ.add(eye);
      }
    } else if (style === "plain") {
      // a mannequin head: an egg, no face, and a soft nose so which way it looks still reads
      const head = new THREE.Mesh(new THREE.SphereGeometry(b.headR * 0.95, 24, 16), body);
      head.position.y = b.headR + 0.02; head.scale.set(0.88, 1.12, 0.96); head.castShadow = true; this.headJ.add(head);
      const nose = new THREE.Mesh(new THREE.SphereGeometry(b.headR * 0.16, 12, 8), body);
      nose.position.set(0, b.headR + 0.01, b.headR * 0.9); nose.scale.set(0.8, 1.15, 1); nose.castShadow = true; this.headJ.add(nose);
    } else if (style !== "suit") {
      const skin = mats.skin ?? body;
      const head = new THREE.Mesh(new THREE.SphereGeometry(b.headR * 0.92, 16, 12), skin);
      head.position.y = b.headR + 0.02; head.scale.set(0.9, 1.05, 0.95); head.castShadow = true; this.headJ.add(head);
      const ink = new THREE.MeshStandardMaterial({ color: "#1b1310", roughness: 0.4 });
      const hy = b.headR + 0.02, fz = b.headR * 0.86;
      for (const s of [-1, 1]) {
        const white = new THREE.Mesh(new THREE.SphereGeometry(0.024, 10, 8), new THREE.MeshStandardMaterial({ color: "#f2ece2", roughness: 0.5 }));
        white.position.set(0.042 * s, hy + 0.03, fz - 0.012); white.scale.z = 0.6; this.headJ.add(white);
        const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), ink);
        pupil.position.set(0.042 * s, hy + 0.03, fz + 0.002); this.headJ.add(pupil); this.eyes.push(pupil);
        const brow = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.009, 0.012), ink);
        brow.position.set(0.044 * s, hy + 0.064, fz - 0.004); brow.rotation.z = -0.12 * s; this.headJ.add(brow); this.brows.push(brow);
      }
      this.mouth = new THREE.Mesh(new THREE.CircleGeometry(0.026, 16), new THREE.MeshBasicMaterial({ color: "#2a0f0c" }));
      this.mouth.position.set(0, hy - 0.052, fz + 0.006); this.mouth.scale.set(1.2, 0.18, 1); this.headJ.add(this.mouth);
      this.jaw = new THREE.Mesh(new THREE.SphereGeometry(b.headR * 0.5, 12, 8), skin);
      this.jaw.position.set(0, hy - 0.075, fz - 0.05); this.jaw.scale.set(1.1, 0.55, 0.75); this.jaw.castShadow = true; this.headJ.add(this.jaw);
      if (style === "navigator") {
        // round spectacles and a short white beard; no hat
        for (const s of [-1, 1]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.005, 6, 16), mats.accent); ring.position.set(0.042 * s, hy + 0.03, fz + 0.012); this.headJ.add(ring); }
        const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.004, 0.004), mats.accent); bridge.position.set(0, hy + 0.034, fz + 0.014); this.headJ.add(bridge);
      }
      if (style === "navigator" || style === "captain") {
        const beard = new THREE.Mesh(new THREE.ConeGeometry(b.headR * 0.55, 0.14, 10), clayGrey(style === "captain" ? "#7a7068" : "#e4ddd2"));
        beard.position.set(0, hy - 0.11, fz - 0.03); beard.rotation.x = Math.PI + 0.25; this.jaw.add(beard);
        beard.position.set(0, -0.06, 0.02); beard.scale.set(1 / 1.1, 1 / 0.55, 1 / 0.75);
      }
      if (style === "runner") {
        // goggles pushed up and a scarf
        // goggles on a hinge at the temples: pushed up on the forehead, or pulled down over the eyes (goggle(k))
        this.goggles = new THREE.Group(); this.goggles.position.y = b.headR + 0.02; this.headJ.add(this.goggles);
        const band = new THREE.Mesh(new THREE.TorusGeometry(b.headR * 0.9, 0.018, 6, 24), dark);
        band.rotation.x = Math.PI / 2; this.goggles.add(band);
        for (const s of [-1, 1]) { const g = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.035, 12), accent); g.rotation.x = Math.PI / 2; g.position.set(0.045 * s, 0, b.headR * 0.88); this.goggles.add(g);
          const lens = new THREE.Mesh(new THREE.CircleGeometry(0.028, 12), new THREE.MeshStandardMaterial({ color: "#3b6f7a", roughness: 0.15, metalness: 0.4 })); lens.position.set(0.045 * s, 0, b.headR * 0.88 + 0.019); this.goggles.add(lens); }
        this.goggle(0);
        const scarf = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.035, 6, 14), accent); scarf.rotation.x = Math.PI / 2; scarf.position.y = 0.02; this.headJ.add(scarf);
        const tail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.35), accent); tail.position.set(0.04, 0.03, -0.2); tail.rotation.x = 0.3; this.headJ.add(tail);
      } else if (style === "captain") {
        // a tricorn
        const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.025, 3), dark);
        brim.position.y = b.headR * 1.75; brim.rotation.y = Math.PI / 6; this.headJ.add(brim);
        const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.1, 12), dark);
        crown.position.y = b.headR * 1.75 + 0.06; this.headJ.add(crown);
        const patch = new THREE.Mesh(new THREE.CircleGeometry(0.028, 12), dark); patch.position.set(-0.042, b.headR + 0.05, b.headR * 0.87); this.headJ.add(patch);
        const strap = new THREE.Mesh(new THREE.TorusGeometry(b.headR * 0.9, 0.006, 4, 24), dark); strap.position.y = b.headR + 0.06; strap.rotation.set(Math.PI / 2 - 0.3, 0.35, 0); this.headJ.add(strap);
      }
    } else {
      const helm = new THREE.Mesh(new THREE.SphereGeometry(b.headR, 16, 12), body);
      helm.position.y = b.headR + 0.02; helm.castShadow = true; this.headJ.add(helm);
      const visor = new THREE.Mesh(new THREE.SphereGeometry(b.headR * 1.02, 16, 10, Math.PI * 0.18, Math.PI * 0.64, Math.PI * 0.3, Math.PI * 0.32), dark);
      visor.position.y = b.headR + 0.02; this.headJ.add(visor);
    }
    // arms
    const arm = (side: 1 | -1) => {
      const sh = new THREE.Group();
      sh.position.set(side * b.shoulderW, b.torso * 0.92, 0);
      this.spine.add(sh);
      const pad = new THREE.Mesh(new THREE.SphereGeometry(b.limbR * (style === "suit" ? 1.6 : 1.25), 10, 8), b.native || style !== "suit" ? body : accent);
      pad.castShadow = true; sh.add(pad);
      if (b.native && mats.glow) for (let i = 0; i < 4; i++) {
        const d = new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 4), mats.glow);
        d.position.set(side * (0.03 + i * 0.012), 0.08 - i * 0.03, 0.06 - i * 0.02); sh.add(d);
      }
      const up = segment(sh, b.limbR * 1.05, b.upper, body, b.limbR * 0.9);
      const lo = segment(up.end, b.limbR * 0.9, b.fore, body, b.limbR * 0.7);
      const hand = new THREE.Group(); lo.end.add(hand);
      if (b.native) {
        const palm = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.12, 0.1), body);
        palm.position.y = -0.06; hand.add(palm);
        for (let i = 0; i < 4; i++) {
          const f = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.008, 0.13, 5), body);
          f.position.set(0, -0.18, -0.035 + i * 0.024); hand.add(f);
        }
      } else {
        const glove = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.14, 0.1), dark);
        glove.position.y = -0.07; glove.castShadow = true; hand.add(glove);
      }
      return { sh, el: lo.j, hand };
    };
    const L = arm(1), R = arm(-1);
    this.lArm = L.sh; this.lElbow = L.el; this.lHand = L.hand;
    this.rArm = R.sh; this.rElbow = R.el; this.rHand = R.hand;
    // legs
    const leg = (side: 1 | -1) => {
      const hp = new THREE.Group(); hp.position.set(side * b.hipW, 0, 0); this.pelvis.add(hp);
      const lm = mats.legs ?? body;
      const th = segment(hp, b.limbR * 1.35, b.thigh, lm, b.limbR * 1.05);
      const sh = segment(th.end, b.limbR * 1.05, b.shin, lm, b.limbR * 0.8);
      const foot = new THREE.Mesh(new THREE.BoxGeometry(b.limbR * 2.2, b.foot, b.native ? 0.3 : 0.26), b.native ? body : dark);
      foot.position.set(0, -b.foot / 2, b.native ? 0.08 : 0.06); foot.castShadow = true; sh.end.add(foot);
      return { hp: th.j as THREE.Group, kn: sh.j as THREE.Group };
    };
    const LL = leg(1), RL = leg(-1);
    this.lHip = LL.hp; this.lKnee = LL.kn; this.rHip = RL.hp; this.rKnee = RL.kn;
    this.root.traverse((o) => { if ((o as THREE.Mesh).isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  }
  /** two-bone reach: the wrist goes to a world point, the elbow bends toward `pole` (world direction). w blends from the pose */
  reach(side: "l" | "r", target: THREE.Vector3, w: number, pole = new THREE.Vector3(0, -1, -0.3)) {
    if (w <= 0) return;
    const sh = side === "l" ? this.lArm : this.rArm, el = side === "l" ? this.lElbow : this.rElbow;
    this.root.updateMatrixWorld(true);
    const parent = sh.parent!;
    const tl = parent.worldToLocal(target.clone()).sub(sh.position);
    const pq = new THREE.Quaternion(); parent.getWorldQuaternion(pq);
    const pl = pole.clone().applyQuaternion(pq.invert()).normalize();
    const L1 = this.b.upper, L2 = this.b.fore;
    const d = Math.min(Math.max(tl.length(), Math.abs(L1 - L2) + 0.01), L1 + L2 - 0.001);
    const a = tl.clone().normalize();
    const yv = a.clone().negate();
    const zv = pl.clone().sub(a.clone().multiplyScalar(pl.dot(a))).normalize().negate();
    const xv = new THREE.Vector3().crossVectors(yv, zv).normalize();
    zv.crossVectors(xv, yv).normalize();
    const q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(xv, yv, zv));
    const alpha = Math.acos(THREE.MathUtils.clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
    const inner = Math.acos(THREE.MathUtils.clamp((L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2), -1, 1));
    q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), alpha));
    sh.quaternion.slerp(q, w);
    const eq = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -(Math.PI - inner));
    el.quaternion.slerp(eq, w);
  }
  /** aim the head (and the eyes, for what the head leaves) at a world point; w blends it in */
  look(target: THREE.Vector3, w = 1) {
    if (w <= 0) return;
    this.root.updateMatrixWorld(true);
    const hp = new THREE.Vector3(); this.headJ.getWorldPosition(hp); hp.y += this.b.headR;
    const inv = new THREE.Matrix4().copy(this.neckJ.parent!.matrixWorld).invert();
    const d = target.clone().applyMatrix4(inv).sub(hp.clone().applyMatrix4(inv));
    const yaw = Math.atan2(d.x, d.z), pitch = -Math.atan2(d.y, Math.hypot(d.x, d.z));
    const cy = THREE.MathUtils.clamp(yaw, -1.2, 1.2), cp = THREE.MathUtils.clamp(pitch, -0.6, 0.6);
    this.neckJ.rotation.y = THREE.MathUtils.lerp(this.neckJ.rotation.y, cy * 0.45, w);
    this.headJ.rotation.y = THREE.MathUtils.lerp(this.headJ.rotation.y, cy * 0.55, w);
    this.headJ.rotation.x = THREE.MathUtils.lerp(this.headJ.rotation.x, cp * 0.8 + this.headJ.rotation.x * 0.3, w);
    // the eyes take the rest
    const ey = THREE.MathUtils.clamp((yaw - cy) * 0.02 + yaw * 0.004, -0.008, 0.008);
    for (const [i, e] of this.eyes.entries()) { e.position.x = (i ? 1 : -1) * 0.042 + ey; e.position.y = this.b.headR + 0.05 - THREE.MathUtils.clamp(pitch * 0.006, -0.005, 0.005); }
  }
  /** 0 = goggles up on the forehead, 1 = down over the eyes */
  goggle(k: number) {
    if (!this.goggles) return;
    this.goggles.position.y = this.b.headR + 0.02 + lerp(0.035, 0.03, k);
    this.goggles.rotation.x = lerp(-0.55, 0, k);
  }
  /** open 0..1 (from the voice), brow raise 0..1 */
  face(open: number, brow = 0) {
    if (this.mouth) this.mouth.scale.set(1.2 - 0.3 * open, 0.18 + 1.25 * open, 1);
    if (this.jaw) { this.jaw.position.y = this.b.headR + 0.02 - 0.075 - 0.028 * open; this.jaw.rotation.x = 0.25 * open; }
    for (const b of this.brows) b.position.y = this.b.headR + 0.02 + 0.064 + 0.012 * brow;
  }
  /** place on the ground at (x, y, z) facing yaw (0 = +z), posed */
  set(p: Pose, x: number, y: number, z: number, yaw: number) {
    const b = this.b;
    this.root.position.set(x, y, z);
    this.root.rotation.set(0, yaw, 0);
    this.pelvis.position.y = hipHeight(b) - p.crouch;
    this.pelvis.rotation.set(p.lean, 0, 0);
    this.spine.rotation.set(p.spine, p.twist, 0);
    this.neckJ.rotation.set(p.neck, p.headYaw * 0.4, 0);
    this.headJ.rotation.set(p.head, p.headYaw * 0.6, 0);
    this.lArm.rotation.set(-p.lArm, 0, p.lAbd);
    this.rArm.rotation.set(-p.rArm, 0, -p.rAbd);
    this.lElbow.rotation.set(-p.lElbow, 0, 0);
    this.rElbow.rotation.set(-p.rElbow, 0, 0);
    this.lHand.rotation.set(-p.lWrist, 0, 0);
    this.rHand.rotation.set(-p.rWrist, 0, 0);
    this.lHip.rotation.set(-p.lHip, 0, 0);
    this.rHip.rotation.set(-p.rHip, 0, 0);
    this.lKnee.rotation.set(p.lKnee, 0, 0);
    this.rKnee.rotation.set(p.rKnee, 0, 0);
  }
}

// ---- pose library ----
export function walk(phase: number, amt = 1, b: Build = HUMAN): Pose {
  const s = Math.sin(phase), c = Math.cos(phase);
  const k = (x: number) => Math.max(0, x);
  return pose({
    lHip: 0.42 * s * amt, rHip: -0.42 * s * amt,
    lKnee: (0.08 + 0.75 * k(-Math.sin(phase - 0.9))) * amt, rKnee: (0.08 + 0.75 * k(Math.sin(phase - 0.9))) * amt,
    lArm: -0.32 * s * amt, rArm: 0.32 * s * amt, lElbow: 0.25 + 0.15 * amt, rElbow: 0.25 + 0.15 * amt,
    crouch: (0.02 + 0.025 * Math.abs(c)) * amt * (b.thigh / 0.45), spine: 0.06 * amt, twist: 0.08 * s * amt,
  });
}
export const idle = (t: number) => pose({ spine: 0.02 * Math.sin(t * 1.3), lArm: 0.03 * Math.sin(t * 1.3), rArm: 0.03 * Math.sin(t * 1.3 + 1), neck: 0.02 * Math.sin(t * 0.7) });

/** kneel on the right knee, left foot planted */
export function kneel(b: Build): Pose {
  const hipY = b.thigh * Math.cos(0.15) + b.limbR * 1.2;
  const a = Math.acos(Math.min(1, (hipY - b.shin - b.foot * 0.5) / b.thigh));
  return pose({ crouch: hipHeight(b) - hipY, rHip: 0.15, rKnee: Math.PI / 2 + 0.05, lHip: a, lKnee: a, spine: 0.25 });
}
export function crouchLand(b: Build, depth = 1): Pose {
  const a = 1.15 * depth;
  const hipY = (b.thigh + b.shin) * Math.cos(a * 0.62) * 0.92 + b.foot;
  return pose({ crouch: hipHeight(b) - hipY, lHip: a, rHip: a * 0.9, lKnee: a * 1.6, rKnee: a * 1.5, spine: 0.55 * depth, lean: 0.1 * depth, neck: -0.3 * depth, head: -0.2 * depth, lArm: 0.4 * depth, lAbd: 0.7 * depth, rArm: 0.6 * depth, rAbd: 0.5 * depth, lElbow: 0.5, rElbow: 0.4 });
}
