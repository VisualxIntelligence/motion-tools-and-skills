// Product templates: hero moves on a product, 7 to 10 s each. The product is always the striped pill (kit/pill.ts), so
// a video model reads its place, size and front without a shape to copy. Each template lives in its own file here.
import * as THREE from "three";
import { planner, scenePiece, type KitWorld, type SceneSpec, type ShotDef } from "../../kit/stage";
import type { ActorSpec, PathKey } from "../../kit/actors";
import { GREY, clay } from "../../kit/clay";
import { ground } from "../../kit/props";
import type { Piece } from "../../piece";
import { CAMERA_INFO, type TemplateInfo } from "../cameras";

export const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
export type Spec = Omit<SceneSpec, "id" | "title" | "actors">;
export type { KitWorld, ShotDef, ActorSpec, PathKey, TemplateInfo };

/** a product template: `shots` gets the planner (P("PILL")(t) are the pill's marks at film time t) and the world clock W */
export function makeProduct(info: TemplateInfo, spec: Spec, actors: ActorSpec[], shots: (P: ReturnType<typeof planner>, W: (t: number) => number) => ShotDef[]): Piece {
  const full: SceneSpec = { id: info.id, title: info.name.toUpperCase(), ...spec, actors };
  CAMERA_INFO.push(info);
  const W = (t: number) => (full.clock ? full.clock(t) : t);
  return scenePiece(full, shots(planner(full), W), { scene: info.id });
}

/** the product pill (24 cm tall, 12 cm across, base at `at`, front along yaw); pass a path to move it */
export const pillActor = (at: [number, number, number], yaw = 0, path?: PathKey[]): ActorSpec =>
  ({ id: "PILL", name: "Product", kind: "prop", model: "pill", tint: "plum", path: path ?? [{ t: 0, at, yaw }] });
/** the person-sized pill (1.75 m, the white dot at eye height) */
export const personPill = (id: string, name: string, at: [number, number, number], yaw = 0, path?: PathKey[]): ActorSpec =>
  ({ id, name, kind: "prop", model: "pillPerson", tint: "ochre", path: path ?? [{ t: 0, at, yaw }] });

/** an open studio: a flat light floor to the horizon */
export function studioFloor(w: KitWorld) { w.add(ground(600, 0, 600, GREY.light)); }
/** a round plinth, its top at `h` */
export function plinth(h = 0.9, r = 0.35) {
  const g = new THREE.Group();
  const col = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 64), clay(GREY.set, 0.9)); col.position.y = h / 2; col.castShadow = col.receiveShadow = true; g.add(col);
  return g;
}
