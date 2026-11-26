// The films this project renders. Each piece brings its world, its shots, its frame rate and its look.
import * as THREE from "three";
import { World } from "./world";
import { SHOTS, shotAt, type Shot } from "./shots";

export { DEFAULT_FPS, piece, type Look, type Piece, type PieceWorld } from "./piece";
import type { Piece } from "./piece";
import { SHOW_PIECES, TEMPLATE_PIECES } from "./templates";

const camPath = (at: (t: number) => Shot, duration: number, from = 0) => {
  const out: THREE.Vector3[] = [];
  for (let t = from; t < from + duration; t += 0.1) out.push(at(t).cam(t).pos);
  return out;
};

export const PIECES: Record<string, Piece> = {
  Rootsong: {
    id: "Rootsong", title: "ROOTSONG", fps: 30, duration: 60, shots: SHOTS, shotAt,
    makeWorld: () => new World(),
    look: () => ({ bloom: 0, exposure: 1, warm: 0, dof: false }),
    hud: false, titleAt: [56.6, 57.8, 59.0, 59.5],
    subjects: (w) => { const x = w as World; return { INES: { fig: x.ines }, WARDEN: { fig: x.warden }, PILOT: { fig: x.pilot }, SHIP: { obj: x.ship.g }, RAY: { obj: x.ray.g }, RAYHEAD: { obj: x.ray.head }, DRILL: { obj: x.drill } }; },
  },
  ...TEMPLATE_PIECES,
  ...SHOW_PIECES,
};
