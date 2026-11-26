// Actors: who is in the scene and what they do, as data. A path of timed marks, and acts (kneel, point, look up…)
// with in and out times. Walking, heading and wing beats come from the path itself: the stride is integrated over the
// distance walked and the heading follows the velocity, so a figure never skates or snaps round.
import * as THREE from "three";
import { Figure, HUMAN, add, crouchLand, hipHeight, idle, kneel, mix, pose, walk, type Build, type Pose } from "../figures";
import { GREY, TINT, clay, figureMats, shadeAll, type Tint } from "./clay";
import { barrel, bench, car, crate, lampPost, pine, ship } from "./props";
import { Flyer, Quadruped } from "./creatures";
import { pill } from "./pill";
import { CLIP_LEN, RIG_POSES, RigFigure, STRIDE, rigReady, type ClipKey, type Gait } from "./rig";
import type { Marks } from "../marks";
import { clamp, lerp, ramp, track } from "../util";

export type Kind = "human" | "giant" | "child" | "flyer" | "quad" | "prop";
/** a mark on the path: where the actor is at t (x, z on the ground, or x, y, z), and optionally which way it faces */
export type PathKey = { t: number; at: [number, number] | [number, number, number]; yaw?: number };
export type ActKind = "kneel" | "crouch" | "sit" | "drive" | "talk" | "point" | "palm" | "push" | "lookUp" | "lookDown" | "armsUp" | "fall" | "clip";
/** an act: a held state, or `kind: "clip"` with any captured clip by name (Roll, Jump_Start, Punch_Cross, Hit_Knockback,
 *  Slide_Loop, ClimbUp_1m, Pistol_Shoot, Sword_Regular_Combo…), played from t0 and held on its last frame unless it loops */
export type Act = { kind: ActKind; t0: number; t1?: number; ease?: number; clip?: string; /** start this far into the clip (s) */ from?: number; };
export type ActorSpec = {
  id: string; name: string; kind: Kind; tint: Tint; path: PathKey[]; acts?: Act[];
  /** what the head turns to: another actor's id or a world point, from `lookFrom` on */
  look?: string | [number, number, number]; lookFrom?: number; lookTo?: number;
  /** a flyer: wing span (m); `land` is when it settles [t0, t1] */
  span?: number; land?: [number, number];
  /** a prop: which kit model it is (see PROPS) */
  model?: keyof typeof PROPS;
  /** a person's stand-in capsule: "trunk" fits it to the body without the arms (a prop carried at the side stays visible) */
  capsule?: "trunk";
  /** a prop's label colour in a stand-in (--boxes) render: the whole prop in one flat loud colour, like a capsule */
  label?: string;
};

/** where a prop's point of interest sits, as a share of its height (the middle unless it has a head) */
export const PROP_EYE: Record<string, number> = { statue: 0.9, pill: 0.5, pillPerson: 0.925 };

/** the objects a camera can treat as a subject, by name */
export const PROPS = {
  car: () => car(GREY.set), crate: () => crate(1), barrel: () => barrel(1), ship: () => ship(GREY.light), lamp: () => lampPost(4.6),
  statue: () => statue(), pine: () => pine(16, 7), monolith: () => monolith(), doorway: () => doorway(), suitcase: () => suitcase(), bench: () => bench(),
  briefcase: () => briefcase(), drone: () => drone(), sheet: () => sheet(),
  // marks in the sand: a round footprint, and a drag scrape (a short streak) left by a dragging foot
  print: () => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.014, 24), new THREE.MeshStandardMaterial({ color: "#4a4036", roughness: 1 })); m.scale.set(1.1, 1, 2.3); return m; },
  scrape: () => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.014, 0.44), new THREE.MeshStandardMaterial({ color: "#3f362d", roughness: 1 })); m.rotation.y = 0.12; return m; },
  // a roll-down shutter as one dark slab, 4 m wide and 2.4 m tall, origin at its base (it lifts along a path)
  shutterPanel: () => { const g = new THREE.Group(); const m = new THREE.Mesh(new THREE.BoxGeometry(4, 2.4, 0.14), new THREE.MeshStandardMaterial({ color: "#4f4a45", roughness: 0.9 })); m.position.y = 1.2; m.castShadow = m.receiveShadow = true; g.add(m); return g; },
  fist: () => { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.SphereGeometry(0.065, 16, 12), new THREE.MeshStandardMaterial({ color: "#c8a27c", roughness: 0.9 }))); return g; },
  // a small brass key standing upright, tip down (it goes into a floor lock from above and turns on its own axis): a shaft, a ring bow on top, a tooth
  key: () => { const g = new THREE.Group(), br = new THREE.MeshStandardMaterial({ color: "#d4a63a", roughness: 0.45, metalness: 0.4 }); const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.1, 0.014), br); const bow = new THREE.Mesh(new THREE.TorusGeometry(0.026, 0.007, 8, 20), br); bow.position.y = 0.074; const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.014, 0.014), br); tooth.position.set(0.012, -0.03, 0); g.add(shaft, bow, tooth); return g; },
  // the product stand-in (a striped pill, 24 cm) and the same pill at a person's size (1.75 m, the dot at eye height)
  pill: () => pill(), pillPerson: () => pill(1.75, 0.27, "#e3261f", 0.925),
};

const SCALE: Record<string, number> = { human: 1, giant: 1.75, child: 0.62 };
/** how much of each gait a body uses at a speed (m/s, at scale 1) */
const gaitWeights = (sp: number) => {
  const S = THREE.MathUtils.smoothstep;
  return { walk: S(sp, 0.03, 0.2) * (1 - S(sp, 2.4, 3.4)), jog: S(sp, 2.4, 3.4) * (1 - S(sp, 5.4, 6.2)), sprint: S(sp, 5.4, 6.2) };
};
const yawLerp = (a: number, b: number, k: number) => { const d = ((b - a + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI; return a + d * k; };

export class Actor {
  fig?: Figure; rig?: RigFigure; flyer?: Flyer; quad?: Quadruped; prop?: THREE.Object3D; private box?: THREE.Box3;
  /** people use the captured-motion mannequin's proportions for planning (and its body once the rig is loaded) */
  private rigged: boolean;
  root: THREE.Object3D;
  scale: number; build: Build = HUMAN;
  private posT: (t: number) => number[];
  private t0: number; private t1: number;
  private tab: { yaw: number; dist: number; walk: number; jog: number; sprint: number; speed: number; beat: number }[] = [];
  private static DT = 1 / 60;
  constructor(public spec: ActorSpec) {
    const keys = spec.path.map((k) => ({ t: k.t, v: k.at.length === 2 ? [k.at[0], 0, k.at[1]] : [...k.at] }));
    this.posT = track(keys);
    this.t0 = keys[0].t - 1; this.t1 = keys[keys.length - 1].t + 1;
    this.scale = SCALE[spec.kind] ?? 1;
    if (spec.kind === "flyer") { this.flyer = new Flyer(spec.tint, spec.span ?? 14); this.root = this.flyer.g; }
    else if (spec.kind === "quad") { this.quad = new Quadruped(spec.tint); this.root = this.quad.g; }
    else if (spec.kind === "prop") {
      // a prop takes its subject's tint on its main body, so the hero object still reads apart from the set
      this.prop = PROPS[spec.model ?? "crate"](); this.root = this.prop;
      this.prop.traverse((o: any) => { if (o.isMesh && o.material?.color && o.material.color.getHexString() === new THREE.Color(GREY.set).getHexString()) o.material = clay(TINT[spec.tint], 0.85); });
      this.box = new THREE.Box3().setFromObject(this.prop);
    }
    else if (rigReady()) { this.rig = new RigFigure(spec.tint); this.rig.root.scale.setScalar(this.scale); this.root = this.rig.root; }
    else { this.fig = new Figure({ ...HUMAN, style: "plain" }, figureMats(spec.tint)); this.fig.root.scale.setScalar(this.scale); this.root = this.fig.root; }
    this.root.name = spec.id;
    this.rigged = !["flyer", "quad", "prop"].includes(spec.kind);
    // the heading, the distance walked and the wing beat, sampled once (pure functions of time afterwards)
    let yaw = spec.path.find((k) => k.yaw !== undefined)?.yaw ?? 0, dist = 0, beat = 0; const cyc = { walk: 0, jog: 0, sprint: 0, run: 0 };
    const firstMove = this.firstMoveYaw(); if (spec.path[0].yaw === undefined && firstMove !== null) yaw = firstMove;
    for (let t = this.t0; t <= this.t1 + 1e-6; t += Actor.DT) {
      const p = this.pos(t), q = this.pos(t + Actor.DT);
      const v = q.clone().sub(p); const flat = Math.hypot(v.x, v.z) / Actor.DT, speed = v.length() / Actor.DT;
      if (flat > 0.15) yaw = yawLerp(yaw, Math.atan2(v.x, v.z), clamp(flat / 1.5) * 0.12);
      const k = this.keyYaw(t);
      if (k !== null) yaw = yawLerp(yaw, k, clamp(1 - flat / 0.8) * 0.08);
      dist += flat * Actor.DT;
      // each gait's cycle clock: the distance walked over that clip's measured stride, so the planted foot stays put,
      // but never under 80% of the clip's own cadence (72% for the long-stride run clip), so a slow walk takes shorter steps at a human pace instead of playing
      // in slow motion; starting and stopping (under ~0.6 m/s) stay locked to the ground so the feet never skate
      const sp = flat / this.scale;
      const rate = (g: "walk" | "jog" | "sprint") => Math.max(sp, (g === "jog" ? 0.72 : 0.8) * (STRIDE[g] / CLIP_LEN[g]) * THREE.MathUtils.smoothstep(sp, 0.55, 0.9)) / STRIDE[g];
      // walk, jog and sprint share one stepping clock, its rate blended as they crossfade, and each clip is offset so
      // its left foot lands at the same moment: on their own clocks a blend mixes two points of the stride and the
      // feet slide or drag (slowing from a run to a stop passes through every blend)
      if (sp > 0.05) {
        const g = gaitWeights(sp), tot = g.walk + g.jog + g.sprint || 1;
        cyc.run += ((g.walk * rate("walk") + g.jog * rate("jog") + g.sprint * rate("sprint")) / tot) * Actor.DT;
      }
      if (this.rig) for (const g of ["walk", "jog", "sprint"] as const) cyc[g] = cyc.run + this.rig.landing(g);
      else cyc.walk = cyc.jog = cyc.sprint = cyc.run;
      const hover = clamp(1 - speed / 10);
      beat += lerp(5.2, 3.4, hover) * Actor.DT;
      this.tab.push({ yaw, dist, walk: cyc.walk, jog: cyc.jog, sprint: cyc.sprint, speed, beat });
    }
  }
  private firstMoveYaw() {
    for (let t = this.t0; t < this.t1; t += 0.05) { const v = this.pos(t + 0.05).sub(this.pos(t)); if (Math.hypot(v.x, v.z) > 0.01) return Math.atan2(v.x, v.z); }
    return null;
  }
  /** the yaw a mark asks for, while the actor stands near that mark's time */
  private keyYaw(t: number): number | null {
    let best: number | null = null, bd = 1e9;
    for (const k of this.spec.path) if (k.yaw !== undefined && t >= k.t - 0.2) { const d = Math.abs(t - k.t); if (d < bd) { bd = d; best = k.yaw; } }
    return best;
  }
  /** the table at t, interpolated between samples, so renders a fraction of a sample apart (sub-frames) still differ */
  private at(t: number) {
    const x = clamp((t - this.t0) / Actor.DT, 0, this.tab.length - 1), i = Math.floor(x), j = Math.min(i + 1, this.tab.length - 1), f = x - i;
    const a = this.tab[i], b = this.tab[j];
    return { yaw: yawLerp(a.yaw, b.yaw, f), dist: lerp(a.dist, b.dist, f), walk: lerp(a.walk, b.walk, f), jog: lerp(a.jog, b.jog, f), sprint: lerp(a.sprint, b.sprint, f), speed: lerp(a.speed, b.speed, f), beat: lerp(a.beat, b.beat, f) };
  }
  pos(t: number) { const v = this.posT(t), p = new THREE.Vector3(v[0], v[1], v[2]); if (this.floor && this.rigged) p.y += this.floor(p.x, p.z); return p; }
  yaw(t: number) { return this.at(t).yaw; }
  facing(t: number) {
    const y = this.yaw(t), body = new THREE.Vector3(Math.sin(y), 0, Math.cos(y));
    const L = this.spec.look;
    if (!L || !this.fig || t < (this.spec.lookFrom ?? -1e9) + 0.3 || t > (this.spec.lookTo ?? 1e9) - 0.3 || typeof L !== "string" || !this.others?.get(L)) return body;
    const to = this.others.get(L)!.pos(t).sub(this.pos(t)).setY(0).normalize();
    return body.clone().lerp(to, 0.7).normalize();                      // the head turns most of the way to the one it looks at
  }
  /** which way the body points (the head may look elsewhere) */
  heading(t: number) { const y = this.yaw(t); return new THREE.Vector3(Math.sin(y), 0, Math.cos(y)); }
  /** the other actors (for planning where this one looks) */
  others?: Map<string, Actor>;
  speed(t: number) { return this.at(t).speed; }

  /** how much of an act is on at t (0..1) */
  act(kind: ActKind, t: number) {
    let w = 0;
    for (const a of this.spec.acts ?? []) if (a.kind === kind) { const e = a.ease ?? 0.6; w = Math.max(w, ramp(t, a.t0, a.t0 + e) * (a.t1 === undefined ? 1 : 1 - ramp(t, a.t1 - e, a.t1))); }
    return w;
  }
  /** the figure's pose at t, from its walk and its acts */
  pose(t: number): Pose {
    const b = this.build, s = this.at(t);
    const amt = clamp(s.speed / 1.4);
    let p = mix(idle(t + this.spec.id.length), walk((s.dist / (1.45 * this.scale)) * Math.PI * 2, amt, b), clamp(s.speed / 0.4));
    const w = (k: ActKind) => this.act(k, t);
    if (w("kneel")) p = mix(p, kneel(b), w("kneel"));
    if (w("crouch")) p = mix(p, crouchLand(b, 0.7), w("crouch"));
    if (w("sit")) p = mix(p, pose({ crouch: hipHeight(b) - 0.47, lHip: 1.5, rHip: 1.5, lKnee: 1.55, rKnee: 1.55, spine: 0.05, lArm: 0.35, rArm: 0.35, lElbow: 0.9, rElbow: 0.9 }), w("sit"));
    if (w("fall")) p = mix(p, pose({ lHip: 0.6, rHip: 0.2, lKnee: 0.9, rKnee: 0.5, lArm: 0.8, lAbd: 1.2, rArm: 0.6, rAbd: 1.3, spine: 0.2 }), w("fall"));
    if (w("point")) p = add(p, { rArm: 1.45 * w("point"), rAbd: 0.1 * w("point"), rElbow: -0.1 * w("point") });
    if (w("palm")) p = add(p, { rArm: 1.5 * w("palm"), rAbd: 0.2 * w("palm"), rElbow: -0.05 * w("palm"), rWrist: -1.1 * w("palm") });
    if (w("armsUp")) p = add(p, { lArm: 2.6 * w("armsUp"), rArm: 2.6 * w("armsUp"), lAbd: 0.25 * w("armsUp"), rAbd: 0.25 * w("armsUp") });
    if (w("lookUp")) p = add(p, { neck: -0.4 * w("lookUp"), head: -0.4 * w("lookUp"), spine: -0.08 * w("lookUp") });
    if (w("lookDown")) p = add(p, { neck: 0.35 * w("lookDown"), head: 0.3 * w("lookDown") });
    return p;
  }

  /** pose the model for t; `others` resolves look targets */
  /** the set's paving height under a point (set by the world): a path at y 0 over an 8 cm plaza walks on the plaza;
   *  a body's path is measured from the paving, so every offset (a jump, a lift) is kept */
  floor?: (x: number, z: number) => number;
  update(t: number, others: Map<string, Actor>) {
    const p = this.pos(t), yaw = this.yaw(t);
    if (this.rig) {
      this.rig.root.position.copy(p); this.rig.root.rotation.set(0, yaw, 0);
      const s = this.at(t), sp = s.speed / this.scale;
      // the legs: idle, walk, jog or sprint by speed, crossfaded
      // standing feet are fixed to the body, so they drag the moment it moves: the walk takes over within 0.2 m/s
      const { walk, jog, sprint } = gaitWeights(sp);
      const idle = 1 - THREE.MathUtils.smoothstep(sp, 0.03, 0.2);
      const w = (k: ActKind) => this.act(k, t);
      const acts: Partial<Record<ClipKey, number>> = { sit: w("sit") * (1 - w("talk")), sitTalk: w("sit") * w("talk"), drive: w("drive"), kneel: w("kneel"), crouch: w("crouch"), point: w("point"), palm: w("palm"), fall: w("fall"), push: w("push") };
      const clips: Record<string, number> = {}, clipStart: Record<string, number> = {};
      for (const a of this.spec.acts ?? []) if (a.kind === "clip" && a.clip) {
        const e = a.ease ?? 0.15, wt = ramp(t, a.t0 - e, a.t0) * (a.t1 === undefined ? 1 : 1 - ramp(t, a.t1, a.t1 + e));
        if (wt > (clips[a.clip] ?? 0)) { clips[a.clip] = wt; clipStart[a.clip] = a.t0 - (a.from ?? 0); }
      }
      const held = Math.min(1, [...Object.values(acts), ...Object.values(clips)].reduce((a, b) => a + (b ?? 0), 0));
      const base = 1 - held;
      const weights: Record<string, number> = { idle: idle * base * (1 - w("talk")), talk: idle * base * w("talk"), walk: walk * base, jog: jog * base, sprint: sprint * base, ...acts, ...clips };
      const start: Record<string, number> = { ...clipStart };
      for (const a of this.spec.acts ?? []) if (a.kind !== "clip") start[a.kind] = a.t0;
      this.rig.pose(weights, { walk: s.walk, jog: s.jog, sprint: s.sprint }, t, start);
      // the planted foot stays where it landed: the leading gait's measured landing skid is taken back out of the leg by IK
      const gaits = { walk: walk * base, jog: jog * base, sprint: sprint * base } as const;
      const [g, gw] = (Object.entries(gaits) as [Gait, number][]).sort((x, y) => y[1] - x[1])[0];
      if (gw > 0.05) for (const f of ["l", "r"] as const) {
        const off = this.rig.skid(g, f, s[g]);
        if (off.lengthSq() < 1e-8) continue;
        const now = this.rig.bone["foot_" + f].getWorldPosition(new THREE.Vector3());
        this.rig.pinFoot(f, now.add(off.multiplyScalar(this.scale).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw)), gw);
      }
      const L = this.spec.look;
      const lw = L ? ramp(t, this.spec.lookFrom ?? -1e9, (this.spec.lookFrom ?? -1e9) + 0.6) * (1 - ramp(t, (this.spec.lookTo ?? 1e9) - 0.6, this.spec.lookTo ?? 1e9)) : 0;
      const pitch = -0.45 * w("lookUp") + 0.4 * w("lookDown");
      const target = L ? (typeof L === "string" ? others.get(L)?.eye(t) : new THREE.Vector3(...L)) : undefined;
      if (target && lw > 0) this.rig.look(target, lw, pitch);
      else if (pitch) this.rig.look(this.eye(t).add(this.heading(t).multiplyScalar(5)), 0, pitch);
    } else if (this.fig) {
      this.fig.set(this.pose(t), p.x, p.y, p.z, yaw);
      const L = this.spec.look;
      if (L) {
        const w = ramp(t, this.spec.lookFrom ?? -1e9, (this.spec.lookFrom ?? -1e9) + 0.6) * (1 - ramp(t, (this.spec.lookTo ?? 1e9) - 0.6, this.spec.lookTo ?? 1e9));
        const target = typeof L === "string" ? others.get(L)?.eye(t) : new THREE.Vector3(...L);
        if (target && w > 0) this.fig.look(target, w);
      }
    } else if (this.flyer) {
      const s = this.at(t), v = this.pos(t + 0.15).sub(this.pos(t - 0.15)).multiplyScalar(1 / 0.3);
      const hover = clamp(1 - s.speed / 10), land = this.spec.land ? ramp(t, this.spec.land[0], this.spec.land[1]) : 0;
      const turn = ((this.yaw(t + 0.2) - this.yaw(t - 0.2) + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      this.flyer.pose(p, yaw, { beat: s.beat, amp: lerp(0.45, 0.75, hover) * (1 - land), fold: land, pitch: -0.25 * clamp(v.y / 12, -1, 1), bank: clamp(-turn * 1.2, -0.5, 0.5) * (1 - land), t });
    } else if (this.prop) {
      this.prop.position.copy(p); this.prop.rotation.set(0, yaw, 0);
    } else if (this.quad) {
      const s = this.at(t);
      this.quad.pose(p, yaw, (s.dist / 1.3) * Math.PI * 2, clamp(s.speed / 1.2), t);
    }
  }

  // ---- analytic marks for planning cameras (the measured pass checks the real geometry afterwards) ----
  eye(t: number) {
    const p = this.pos(t), s = this.scale, b = this.build;
    if (this.flyer) { const k = (this.spec.span ?? 14) / 22; return p.add(new THREE.Vector3(0, 0.1 * k, 3.3 * k).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw(t))); }
    if (this.quad) return p.add(new THREE.Vector3(0, 1.65, 1.25).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw(t)));
    if (this.box) {
      // a prop's point of interest: its middle, or its head for a figure-like prop
      const c = this.box.getCenter(new THREE.Vector3()); c.y = this.box.min.y + (this.box.max.y - this.box.min.y) * (PROP_EYE[this.spec.model ?? ""] ?? 0.5);
      return p.add(c.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw(t)));
    }
    if (this.rigged) return p.add(new THREE.Vector3(0, this.rigPose(t).eye * s, 0)).add(this.heading(t).multiplyScalar(0.09 * s));
    const crouch = this.pose(t).crouch;
    return p.add(new THREE.Vector3(0, (hipHeight(b) - crouch + b.torso + b.neck + b.headR + 0.05) * s, 0)).add(this.facing(t).multiplyScalar(0.1 * s));
  }
  /** the rig's landmark heights for this moment: standing, or blended toward a held pose */
  private rigPose(t: number) {
    const out = { ...RIG_POSES.stand } as Record<string, number>;
    const mix = (pose: keyof typeof RIG_POSES, w: number) => { if (w > 0) for (const k of Object.keys(out)) out[k] += (RIG_POSES[pose][k as keyof typeof RIG_POSES.stand] - out[k]) * w; };
    mix("sit", Math.max(this.act("sit", t), this.act("drive", t))); mix("kneel", this.act("kneel", t)); mix("crouch", this.act("crouch", t));
    return out as typeof RIG_POSES.stand;
  }
  /** the shape of Marks that the framer reads */
  marks(t: number): Marks {
    const s = this.scale, b = this.build, p = this.pos(t), e = this.eye(t);
    if (this.box) {
      const c = this.eye(t), h = this.box.max.y - this.box.min.y;
      return { name: this.spec.id, visible: true, eye: c, top: new THREE.Vector3(c.x, p.y + this.box.max.y, c.z), sole: new THREE.Vector3(c.x, p.y + this.box.min.y, c.z), height: h, facing: this.facing(t), heading: this.heading(t), joints: [] };
    }
    if (this.flyer || this.quad) {
      const h = this.flyer ? (this.spec.span ?? 14) * 0.3 : 1.7;
      return { name: this.spec.id, visible: true, eye: e, top: e.clone().add(new THREE.Vector3(0, h * 0.4, 0)), sole: e.clone().add(new THREE.Vector3(0, -h * 0.6, 0)), height: h, facing: this.facing(t), heading: this.heading(t), joints: [] };
    }
    const y = (v: number) => new THREE.Vector3(e.x, v, e.z);
    if (this.rigged) {
      const r = this.rigPose(t), at = (k: keyof typeof r) => y(p.y + r[k] * s);
      return { name: this.spec.id, visible: true, eye: e, top: at("top"), sole: y(p.y), height: r.top * s, facing: this.facing(t), heading: this.heading(t), joints: [],
        ladder: { chin: at("chin"), chest: at("chest"), waist: at("waist"), thigh: at("thigh"), ankle: at("ankle") } };
    }
    const hip = p.y + (hipHeight(b) - this.pose(t).crouch) * s;
    return {
      name: this.spec.id, visible: true, eye: e, top: y(e.y + 0.125 * s), sole: y(p.y), height: e.y + 0.125 * s - p.y, facing: this.facing(t), heading: this.heading(t), joints: [],
      ladder: { chin: y(e.y - 0.165 * s), chest: y(hip + b.torso * 0.62 * s), waist: y(hip + b.torso * 0.3 * s), thigh: y(hip - b.thigh * 0.5 * s), ankle: y(p.y + b.foot * s) },
    };
  }
}

// ---- props made for the camera templates ----
function statue() {
  const g = new THREE.Group(), m = clay(GREY.set, 0.85);
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.2, 1.4), clay(GREY.light)); plinth.position.y = 0.6; g.add(plinth);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.45, 1.6, 20), m); body.position.y = 2.0; g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 24, 16), m); head.position.y = 3.05; head.scale.set(0.9, 1.1, 0.95); g.add(head);
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.1, 10), m); arm.position.set(0.45, 2.6, 0.2); arm.rotation.z = -0.9; g.add(arm);
  return shadeAll(g);
}
function monolith() { const m = new THREE.Mesh(new THREE.BoxGeometry(1.1, 3.4, 0.35), clay(GREY.set, 0.7)); m.position.y = 1.7; return shadeAll(m.parent ? m : new THREE.Group().add(m)); }
function doorway() {
  const g = new THREE.Group(), m = clay(GREY.set);
  for (const x of [-1.05, 1.05]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.4, 2.8, 0.5), m); p.position.set(x, 1.4, 0); g.add(p); }
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.45, 0.5), m); lintel.position.y = 3.0; g.add(lintel);
  for (const x of [-3.2, 3.2]) { const w = new THREE.Mesh(new THREE.BoxGeometry(3.8, 3.2, 0.4), clay(GREY.light)); w.position.set(x, 1.6, 0); g.add(w); }
  return shadeAll(g);
}
function suitcase() {
  const g = new THREE.Group(), m = clay(GREY.set, 0.7);
  const b = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.5, 0.25), m); b.position.y = 0.27; g.add(b);
  const h = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.018, 6, 16, Math.PI), clay(GREY.dark)); h.position.y = 0.52; g.add(h);
  return shadeAll(g);
}

// ---- props made for the showcase ----
/** a hard suitcase that opens: the inner half (base) and the outer half (the lid, group "lid", hinged on the seam's
 *  bottom edge, opening toward +z), a handle on top (its grip at y 0.61) and two clasps on the lid. Long axis x,
 *  0.7 x 0.5 x 0.25 m */
function briefcase() {
  const g = new THREE.Group(), m = clay(GREY.set, 0.7), inner = clay(GREY.dark, 0.95);
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.5, 0.13), m); base.position.set(0, 0.27, -0.065); g.add(base);
  const well = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.44, 0.004), inner); well.position.set(0, 0.27, -0.001); g.add(well);
  const h = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.018, 6, 16, Math.PI), clay(GREY.dark)); h.position.y = 0.52; g.add(h);
  const lid = new THREE.Group(); lid.name = "lid"; lid.position.set(0, 0.02, 0); g.add(lid);
  const shell = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.5, 0.12), m); shell.position.set(0, 0.25, 0.06); lid.add(shell);
  const lining = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.44, 0.004), inner); lining.position.set(0, 0.25, 0.001); lid.add(lining);
  for (const x of [-0.2, 0.2]) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.035, 0.02), clay(GREY.paper, 0.4)); c.name = "clasp"; c.position.set(x, 0.45, 0.125); lid.add(c); }
  return shadeAll(g);
}
/** a quadcopter about 1.2 m across (a heavy security drone): body, crossed arms, four rotor discs, a camera ball underneath */
function drone() {
  const g = new THREE.Group(), m = clay(GREY.set, 0.6), d = clay(GREY.dark, 0.8);
  const b = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.09, 0.3), m); g.add(b);
  for (const a of [Math.PI / 4, -Math.PI / 4]) { const arm = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.03, 0.045), d); arm.rotation.y = a; g.add(arm); }
  for (const [x, z] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.012, 24), clay(GREY.mid, 0.5)); r.position.set(x * 0.275, 0.06, z * 0.275); g.add(r); const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.06, 10), d); hub.position.set(x * 0.275, 0.03, z * 0.275); g.add(hub); }
  const cam = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 10), d); cam.position.set(0, -0.07, 0.1); g.add(cam);
  g.scale.setScalar(1.55);
  return shadeAll(new THREE.Group().add(g));
}
/** one sheet of paper (A4), lying flat */
function sheet() { const m = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.0015, 0.297), clay(GREY.paper, 0.85)); return shadeAll(new THREE.Group().add(m)); }
