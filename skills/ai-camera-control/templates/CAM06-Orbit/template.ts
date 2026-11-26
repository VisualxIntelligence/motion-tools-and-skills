// CAM06-Orbit
// Copied from engine/cinematic/src/templates/cameras.ts (lines 48-50 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh CAM06-Orbit
import * as THREE from "three";
import { planner, scenePiece, type SceneSpec, type ShotDef } from "../kit/stage";
import type { ActorSpec } from "../kit/actors";
import { around, framed, lag, leadRoom, rig } from "../kit/rigs";
import { aimFor } from "../framer";
import { buildLab } from "./lab";
import type { Piece } from "../piece";

make({ id: "CAM06-Orbit", name: "Orbit", says: "Everything turns around this person: a standoff, a decision, a hero moment.", use: "A character at the centre of a turning point; showing the space around them in one move.", numbers: "35 mm, MS, 120° over 7 s (about 17°/s on average, peak near 58°/s), eased, no rise.", avoid: "Orbiting just for motion: it says this person is the axis of the scene." },
    [ALEX([{ t: 0, at: [0, 0], yaw: 0 }])],
    (P) => [{ start: 0, end: 7, label: "35mm  ORBIT 120", rig: "TECHNOCRANE ORBIT", subject: "ALEX", size: "MS", stop: 2.8, cam: rig.orbit(P("ALEX"), { size: "MS", mm: 35, rise: 0 }, 20, 140, 0, 7, 0.6), cut: "Opens the template", flags: ["compound"] }]),
