// A scene from data: the set (built from the kit), the actors and their paths, the studio light, one moving layer of
// drifting motes (placeholders cannot act, so something in every frame should move), and the shots. `scenePiece`
// turns a scene and its shots into a piece the renderer, the measured pass and the exporters all understand.
import * as THREE from "three";
import { Actor, PROP_EYE, type ActorSpec } from "./actors";
import { RIG_EXTRA, RIG_FILE, loadRigBrowser } from "./rig";
import { GREY, clay, studio, type Sky } from "./clay";
import { piece, type Piece, type PieceWorld } from "../piece";
import type { Cam, Flag, Plan, Shot, Size } from "../shots";
import type { Mark } from "../marks";
import { rng } from "../util";

export type SceneSpec = {
  id: string; title: string; sky: Sky; keyDir?: [number, number, number]; /** bloom / exposure / warmth for this scene (lit sets glow more) */ look?: { bloom?: number; exposure?: number; warm?: number };
  /** dress the set */
  build: (w: KitWorld) => void;
  actors: ActorSpec[];
  /** the moving layer: motes drifting through a box (centre, size), and their drift in m/s */
  motes?: { center: [number, number, number]; size: [number, number, number]; count?: number; drift?: [number, number, number] };
  /** per-frame extras (a road running past a car, a turning sign…) */
  tick?: (w: KitWorld, t: number) => void;
  /** the world's clock against the film's: everything in the set runs on clock(t) while the camera runs on t, so a
   *  speed ramp slows the action and a frozen moment can be orbited (see speedRamp) */
  clock?: (t: number) => number;
};

/** a speed ramp: [film time, playback rate] marks (1 = real time, 0.1 = ten times slow, 0 = frozen), rates eased between
 *  marks and integrated, so the world's clock never jumps */
export function speedRamp(marks: [number, number][]) {
  const step = 1 / 240, table: number[] = [0];
  const end = marks[marks.length - 1][0] + 60;
  const rate = (t: number) => {
    if (t <= marks[0][0]) return marks[0][1];
    for (let i = 1; i < marks.length; i++) if (t < marks[i][0]) { const [a, ra] = marks[i - 1], [b, rb] = marks[i], k = (t - a) / (b - a); return ra + (rb - ra) * k * k * (3 - 2 * k); }
    return marks[marks.length - 1][1];
  };
  for (let t = step; t <= end; t += step) table.push(table[table.length - 1] + rate(t - step / 2) * step);
  return (t: number) => { if (t <= 0) return t * marks[0][1]; const x = t / step, i = Math.min(Math.floor(x), table.length - 2); return table[i] + (table[i + 1] - table[i]) * (x - i); };
}

export class KitWorld implements PieceWorld {
  scene = new THREE.Scene();
  light: ReturnType<typeof studio>;
  actors = new Map<string, Actor>();
  /** anything the scene's build wants to move later, by name */
  parts = new Map<string, THREE.Object3D>();
  private motes?: { mesh: THREE.InstancedMesh; seeds: { p: THREE.Vector3; s: number; ph: number }[] };
  private tmp = new THREE.Object3D();
  constructor(public spec: SceneSpec) {
    this.light = studio(this.scene, spec.sky, spec.keyDir ? new THREE.Vector3(...spec.keyDir) : undefined);
    spec.build(this);
    for (const a of spec.actors) { const actor = new Actor(a); this.actors.set(a.id, actor); this.scene.add(actor.root); }
    for (const a of this.actors.values()) a.others = this.actors;
    // the paving the set's build laid (see `paving`): every body rides on it, keeping its own path offsets
    for (const a of this.actors.values()) a.floor = this.paving;
    if (spec.motes) {
      const n = spec.motes.count ?? 260, r = rng(17), [sx, sy, sz] = spec.motes.size;
      const seeds = Array.from({ length: n }, () => ({ p: new THREE.Vector3((r() - 0.5) * sx, (r() - 0.5) * sy, (r() - 0.5) * sz), s: 0.004 + r() * 0.008, ph: r() * 6.28 }));
      const mesh = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), clay(GREY.paper, 0.8, { emissive: "#ffffff", ei: 0.12 }), n);
      mesh.castShadow = false; mesh.frustumCulled = false; mesh.userData.noPathTrace = true; this.scene.add(mesh);
      this.motes = { mesh, seeds };
    }
  }
  /** how high the set's walking surface sits above y 0 at a point (a plaza disc, a raised floor); 0 by default */
  paving: (x: number, z: number) => number = () => 0;
  add(o: THREE.Object3D, name?: string) { this.scene.add(o); if (name) this.parts.set(name, o); return o; }
  update(film: number, shadow: { center: THREE.Vector3; size: number }) {
    const t = this.spec.clock ? this.spec.clock(film) : film;
    this.light.fit(shadow.center, shadow.size);
    for (const a of this.actors.values()) a.update(t, this.actors);
    if (this.motes && this.spec.motes) {
      const [cx, cy, cz] = this.spec.motes.center, [sx, sy, sz] = this.spec.motes.size, [dx, dy, dz] = this.spec.motes.drift ?? [0.12, 0.02, 0.05];
      const wrap = (v: number, s: number) => ((((v + s / 2) % s) + s) % s) - s / 2;
      this.motes.seeds.forEach((m, i) => {
        this.tmp.position.set(cx + wrap(m.p.x + dx * t + 0.15 * Math.sin(t * 0.4 + m.ph), sx), cy + wrap(m.p.y + dy * t + 0.1 * Math.sin(t * 0.3 + m.ph * 2), sy), cz + wrap(m.p.z + dz * t, sz));
        this.tmp.scale.setScalar(m.s); this.tmp.updateMatrix(); this.motes!.mesh.setMatrixAt(i, this.tmp.matrix);
      });
      this.motes.mesh.instanceMatrix.needsUpdate = true;
    }
    this.spec.tick?.(this, t);
  }
}

/** one shot of a scene: when, which rig, how it is framed and what it is for */
export type ShotDef = {
  start: number; end: number; label: string; rig: string; cam: (t: number) => Cam;
  /** who the shot is about (an actor id): focus, the HUD and the measured pass read it */
  subject: string | ((t: number) => string); size?: Size; sizeEnd?: Size;
  /** who the lens is focused on, if not the subject (a rack focus moves it from one actor to another) */
  focus?: (t: number) => string | [string, string, number]; stop?: number; ots?: string; flags?: Flag[]; cut?: string; note?: string;
  pair?: [string, string]; reverse?: number;
  /** half the side of the key light's shadow square, metres (defaults from the shot size) */
  shadow?: number;
};

const SHADOW: Record<string, number> = { ECU: 4, CU: 5, MCU: 6, MS: 8, MWS: 10, FS: 12, WS: 22, EWS: 60, INSERT: 4 };

/** a scene and its shots as a piece: 24 fps, clay look, camera report in the bars */
export function scenePiece(spec: SceneSpec, defs: ShotDef[], opts: { scene?: string; version?: string } = {}): Piece {
  let world: KitWorld | null = null;
  const sub = (d: ShotDef, t: number) => (typeof d.subject === "function" ? d.subject(t) : d.subject);
  // the actors exist before the world does (cameras plan from their paths); they read the scene's clock
  const plan = clocked(spec), W = (t: number) => (spec.clock ? spec.clock(t) : t);
  const shots: Shot[] = defs.map((d, i) => {
    const marks = (t: number) => plan.get(sub(d, t))!.marks(W(t));
    const p: Plan = { subject: d.subject, size: d.size, sizeEnd: d.sizeEnd, ots: d.ots, flags: d.flags, cut: d.cut, pair: d.pair, reverse: d.reverse, scene: d.pair ? opts.scene ?? spec.id : undefined };
    return {
      id: i + 1, start: d.start, end: d.end, label: d.label, rig: d.rig, cam: d.cam, note: d.note, plan: p,
      stop: () => d.stop ?? 2.8,
      focus: (t: number) => {
        const f = d.focus ? d.focus(t) : sub(d, t);
        if (typeof f === "string") return { pos: plan.get(f)!.marks(W(t)).eye, name: plan.get(f)!.spec.name.toUpperCase() };
        // a rack: the focus travels from one actor to the other as k goes 0 -> 1
        const [a, b, k] = f; return { pos: plan.get(a)!.marks(W(t)).eye.lerp(plan.get(b)!.marks(W(t)).eye, k), name: (k < 0.5 ? plan.get(a)! : plan.get(b)!).spec.name.toUpperCase() };
      },
      subject: (t: number) => { const m = marks(t); return { pos: m.top.clone().lerp(m.sole, 0.5), height: m.height, facing: m.facing, name: plan.get(sub(d, t))!.spec.name.toUpperCase() }; },
      shadow: (t: number) => ({ center: plan.get(sub(d, t))!.pos(W(t)), size: d.shadow ?? SHADOW[d.size ?? "WS"] ?? 20 }),
    };
  });
  const duration = defs[defs.length - 1].end;
  return piece({
    id: spec.id, title: spec.title, duration, shots, shotAt: (t) => shots.find((s) => t < s.end) ?? shots[shots.length - 1],
    makeWorld: () => (world = new KitWorld(spec)),
    preload: (url) => loadRigBrowser(url(RIG_FILE), url(RIG_EXTRA)),
    look: () => ({ bloom: spec.look?.bloom ?? 0.06, exposure: spec.look?.exposure ?? 1.0, warm: spec.look?.warm ?? 0, dof: true, ao: 0.9 }),
    hud: true, fade: false, version: opts.version ?? "TEMPLATE", titleAt: [1e9, 1e9 + 1, 1e9 + 2, 1e9 + 3],
    subjects: (w) => {
      const kw = w as KitWorld, out: Record<string, Mark> = {};
      for (const [id, a] of kw.actors) {
        if (a.rig) out[id] = { rig: a.rig };
        else if (a.fig) out[id] = { fig: a.fig };
        else if (a.prop) out[id] = { obj: a.root, eyeAt: PROP_EYE[a.spec.model ?? ""] };
        else if (a.flyer || a.quad) { out[id] = { obj: a.root }; out[id + "HEAD"] = { obj: (a.flyer ?? a.quad)!.head }; }
      }
      return out;
    },
  });
  void world;
}

/** the analytic marks of an actor, for planning a camera before the world exists */
export function planner(spec: SceneSpec) {
  const m = clocked(spec), W = (t: number) => (spec.clock ? spec.clock(t) : t);
  return (id: string) => {
    const a = m.get(id)!;
    return Object.assign((t: number) => a.marks(W(t)), { actor: a });
  };
}

/** the scene's actors for planning, standing on the set's paving (read from a throwaway build of the set) */
function clocked(spec: SceneSpec) {
  const m = new Map(spec.actors.map((a) => [a.id, new Actor(a)]));
  for (const a of m.values()) a.others = m;
  const stub = { scene: new THREE.Scene(), parts: new Map<string, THREE.Object3D>(), paving: (() => 0) as (x: number, z: number) => number, add(o: THREE.Object3D) { return o; } };
  try { spec.build(stub as unknown as KitWorld); } catch { /* a set that needs the full world: plan on flat ground */ }
  for (const a of m.values()) a.floor = stub.paving;
  return m;
}
