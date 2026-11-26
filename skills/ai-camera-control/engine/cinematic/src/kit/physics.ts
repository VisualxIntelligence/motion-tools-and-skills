// Baked physics: debris, crates, barrels and bodies that fall, tumble and collide. A scene declares its rigid bodies and
// what drives them (a car on its path, a release time); tools/bake-physics.ts runs Rapier once in node and stores every
// body's transform at 120 Hz in src/kit/bakes.json. The render only reads that table, so a frame stays a pure function of t
// and the same in every render, on every machine.
import * as THREE from "three";
import { GREY, TINT, clay, type Tint } from "./clay";
import BAKES from "./bakes.json";

export type Shape = { kind: "box"; size: [number, number, number] } | { kind: "ball"; r: number } | { kind: "cyl"; r: number; h: number };
export type PhysBody = {
  id: string; shape: Shape; at: [number, number, number]; yaw?: number;
  /** launch velocity and spin, applied at release */
  vel?: [number, number, number]; spin?: [number, number, number];
  /** density (kg/m³-ish; crates ~400, stone ~2000) and bounce */
  density?: number; bounce?: number; friction?: number;
  /** held still until this time, then let go (a wall that a car hits stays put until it is hit anyway) */
  release?: number;
  tint?: Tint | "set" | "dark";
};
/** something that pushes but is not pushed: a car on its path, a swinging door. Sampled in node while baking */
export type Driver = { id: string; shape: Shape; path: (t: number) => { pos: [number, number, number]; yaw: number } };
export type PhysSpec = { id: string; dur: number; bodies: PhysBody[]; drivers?: Driver[]; ground?: number; gravity?: number };
export type Bake = { hz: number; ids: string[]; frames: number[][][] };

const bakes = BAKES as unknown as Record<string, Bake>;

/** the bodies of a baked set as clay meshes, posed from the table at any t */
export class BakedSet {
  group = Object.assign(new THREE.Group(), { userData: { dynamic: true } });
  private meshes: THREE.Mesh[] = [];
  private bake?: Bake;
  constructor(public spec: PhysSpec) {
    this.bake = bakes[spec.id];
    for (const b of spec.bodies) {
      const g = b.shape.kind === "box" ? new THREE.BoxGeometry(...b.shape.size) : b.shape.kind === "ball" ? new THREE.IcosahedronGeometry(b.shape.r, 2) : new THREE.CylinderGeometry(b.shape.r, b.shape.r, b.shape.h, 18);
      const col = b.tint === "dark" ? GREY.dark : b.tint && b.tint !== "set" ? TINT[b.tint] : GREY.set;
      const m = new THREE.Mesh(g, clay(col, 0.85)); m.castShadow = true; m.receiveShadow = true; m.name = b.id;
      m.position.set(...b.at); m.rotation.y = b.yaw ?? 0;
      this.meshes.push(m); this.group.add(m);
    }
  }
  get baked() { return !!this.bake; }
  update(t: number) {
    const B = this.bake;
    if (!B) return;
    const x = THREE.MathUtils.clamp(t * B.hz, 0, B.frames.length - 1), i = Math.floor(x), j = Math.min(i + 1, B.frames.length - 1), k = x - i;
    const qa = new THREE.Quaternion(), qb = new THREE.Quaternion();
    this.meshes.forEach((m, n) => {
      const a = B.frames[i][n], b = B.frames[j][n];
      m.position.set(a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k);
      m.quaternion.copy(qa.set(a[3], a[4], a[5], a[6]).slerp(qb.set(b[3], b[4], b[5], b[6]), k));
    });
  }
}
