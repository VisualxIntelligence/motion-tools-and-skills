// CAM07-CraneUp
// Copied from engine/cinematic/src/templates/cameras.ts (lines 52-54 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh CAM07-CraneUp
import * as THREE from "three";
import { planner, scenePiece, type SceneSpec, type ShotDef } from "../kit/stage";
import type { ActorSpec } from "../kit/actors";
import { around, framed, lag, leadRoom, rig } from "../kit/rigs";
import { aimFor } from "../framer";
import { buildLab } from "./lab";
import type { Piece } from "../piece";

make({ id: "CAM07-CraneUp", name: "Crane up", says: "Release: we rise above them and see what they are heading into.", use: "Ends of scenes, the start of a journey, showing the destination.", numbers: "28 mm, WS, rise 0 → 7 m over 6–8 s, eased; the head tilts down to keep the subject.", avoid: "Craning with no destination to reveal at the top." },
    [ALEX([{ t: 0.5, at: [-6, 1.4] }, { t: 4.5, at: [-11.4, 1.4] }])],
    (P) => [{ start: 0, end: 7, label: "28mm  CRANE UP", rig: "TECHNOCRANE", subject: "ALEX", size: "WS", stop: 4, cam: rig.crane(P("ALEX"), { size: "WS", mm: 28, deg: 160 }, 0.1, 7, 0, 7, 1.35), cut: "Opens the template", flags: ["compound"] }]),
