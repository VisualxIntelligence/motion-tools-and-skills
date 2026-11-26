// What a piece is: its world, shots, frame rate and look. Kept apart from the list of pieces so scene modules can build
// pieces without importing that list.
import * as THREE from "three";
import type { Shot } from "./shots";
import type { Mark } from "./marks";

/** new pieces render at 24 fps with a 180° shutter (rulebook §3) */
export const DEFAULT_FPS = 24;

export type PieceWorld = { scene: THREE.Scene; update: (t: number, shadow: { center: THREE.Vector3; size: number }) => void };
export type Look = { bloom: number; exposure: number; warm: number; dof: boolean; ao?: number };
export type Piece = {
  id: string; title: string; fps: number; duration: number; shots: Shot[]; shotAt: (t: number) => Shot;
  textures?: Record<string, string>;
  makeWorld: (tex: Record<string, THREE.Texture>) => PieceWorld;
  look: (t: number) => Look;
  hud: boolean; titleAt: [number, number, number, number];
  /** an opening title card, in film seconds */
  openAt?: [number, number, number, number];
  /** story time = film time - offset (a piece may open before its own τ = 0) */
  offset?: number;
  audio?: { file: string; at: number; vol?: number; loop?: boolean }[];
  subtitle?: (t: number) => string | null;
  sun?: THREE.Vector3;
  /** load what the world needs before it is built (e.g. the mannequin rig); `url` maps a public path to its URL */
  preload?: (url: (p: string) => string) => Promise<void>;
  /** false: no fade from and to black (templates and single shots) */
  fade?: boolean;
  /** the previs version on the slate */
  version?: string;
  /** everything the measured pass can frame, by the names shot plans use */
  subjects?: (world: PieceWorld) => Record<string, Mark>;
};
/** a new piece: 24 fps unless it says otherwise */
export const piece = (p: Omit<Piece, "fps"> & { fps?: number }): Piece => ({ ...p, fps: p.fps ?? DEFAULT_FPS });

