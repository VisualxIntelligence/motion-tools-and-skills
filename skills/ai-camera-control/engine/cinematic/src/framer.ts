// The bounding-box framer: place a camera from the subject, the lens and the shot size, so a planned MCU is an MCU
// before anyone tunes it. Distance = (frame height the size needs) × focal ÷ sensor height; the aim is a look-at that
// puts the eyes on the upper third (or any point on any screen position).
// After RobLe3/cc-blender-skill `blender-cameras` (MIT): distance = subject height ÷ frame share × focal ÷ sensor height.
import * as THREE from "three";
import type { Cam, Size } from "./shots";
import type { Marks } from "./marks";
import { ASPECT } from "./util";

export const SENSOR_H = 36 / ASPECT;   // mm: the 2.39 extraction of a 36 mm wide sensor

/** where the frame's bottom edge sits on the body, as a share of standing height from the head top (centre of each band) */
const CUT: Record<string, number> = { ECU: 0.1, CU: 0.2, MCU: 0.3, MS: 0.48, MWS: 0.66 };
/** full-figure sizes: the figure's share of frame height */
const SHARE: Record<string, number> = { FS: 0.82, WS: 0.5, EWS: 0.07, INSERT: 0.75 };

export type FrameSpec = {
  size: Size;
  mm: number;
  /** direction from the subject to the camera, horizontal (the framer keeps the camera's height separately) */
  from: THREE.Vector3;
  /** camera height relative to the eyes, in metres (0 = eye level; negative = low angle) */
  rise?: number;
  /** where the eyes land in the frame, NDC (-1..1): x +1/3 is the right third; y defaults to the upper third */
  at?: [number, number];
};

// [upper mark, lower mark, how far down between them]: each edge sits clear of the joints the frame must not cut
// (MS just above the belt, clear of hanging hands; MCU across the chest, above the elbows; the cowboy below mid-thigh)
const BAND: Record<string, [keyof NonNullable<Marks["ladder"]> | "eye", keyof NonNullable<Marks["ladder"]>, number]> = {
  ECU: ["eye", "chin", 0.5], CU: ["chin", "chest", 0.5], MCU: ["chin", "chest", 0.75], MS: ["chest", "waist", 0.6], MWS: ["thigh", "ankle", 0.06],
};

/** frame height (m) at the subject that gives this size */
export function frameHeight(m: Marks, size: Size) {
  if (size in CUT) {
    // eyes on the upper third: the frame's bottom edge is two thirds of a frame below them
    const L = m.ladder;
    const edge = L ? (() => { const [a, b, k] = BAND[size]; const ya = (a === "eye" ? m.eye : L[a]).y; return ya + (L[b].y - ya) * k; })() : m.top.y - CUT[size] * m.height;
    return 1.5 * Math.max(0.05, m.eye.y - edge);
  }
  return m.height / SHARE[size];
}

/** the camera for a planned shot. Close sizes put the eyes on the upper third; full-figure sizes centre the figure */
import { getInputProps } from "remotion";
/** the blockout can be rendered looser (the first blockouts were judged too close): every shot size keeps its lens and move but the camera stands this many times further back, so the capsule reads as a person and not as a giant dome. 1 = the template as designed */
const loosen = () => { if (typeof window === "undefined") return 1; try { const v = Number((getInputProps() as { loosen?: number }).loosen); return v > 0 ? v : 1; } catch { return 1; } };
export function frameFor(m: Marks, s: FrameSpec): Cam {
  const F = frameHeight(m, s.size) * loosen();
  const d = (F * s.mm) / SENSOR_H;
  const from = s.from.clone().setY(0).normalize();
  const full = !(s.size in CUT);
  const aim = full ? m.top.clone().lerp(m.sole, 0.5) : m.eye;
  const pos = aim.clone().add(from.multiplyScalar(d)).add(new THREE.Vector3(0, s.rise ?? 0, 0));
  return { pos, target: aimFor(pos, aim, s.mm, s.at ?? (full ? [0, 0] : [0, 1 / 3])), mm: s.mm };
}

/** a look-at target that puts world point p at screen position ndc (no roll) */
export function aimFor(pos: THREE.Vector3, p: THREE.Vector3, mm: number, ndc: [number, number]) {
  const tanV = SENSOR_H / 2 / mm, tanH = tanV * ASPECT;
  const dir = p.clone().sub(pos);
  const yaw = Math.atan2(dir.x, dir.z), pitch = Math.atan2(dir.y, Math.hypot(dir.x, dir.z));
  // turn the lens away from p by the angle that p must sit off-axis
  const a = Math.atan(ndc[0] * tanH), b = Math.atan((ndc[1] * tanV) / Math.sqrt(1 + (ndc[0] * tanH) ** 2));
  const y2 = yaw + a, p2 = pitch - b;
  return pos.clone().add(new THREE.Vector3(Math.sin(y2) * Math.cos(p2), Math.sin(p2), Math.cos(y2) * Math.cos(p2)).multiplyScalar(dir.length()));
}
