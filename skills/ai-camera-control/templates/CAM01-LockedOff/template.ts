// CAM01-LockedOff
// Copied from engine/cinematic/src/templates/cameras.ts (lines 25-27 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh CAM01-LockedOff
import * as THREE from "three";
import { planner, scenePiece, type SceneSpec, type ShotDef } from "../kit/stage";
import type { ActorSpec } from "../kit/actors";
import { around, framed, lag, leadRoom, rig } from "../kit/rigs";
import { aimFor } from "../framer";
import { buildLab } from "./lab";
import type { Piece } from "../piece";

make({ id: "CAM01-LockedOff", name: "Locked-off", says: "Observation. The world moves, the camera does not judge it.", use: "Entrances and exits, comedy timing, tableaux, any beat where the action should carry the frame.", numbers: "Tripod, 24–35 mm, eye level. Hold at least 3 s on a wide.", avoid: "A static frame with nothing moving in it: give it a crossing or a moving layer." },
    [ALEX([{ t: 0.4, at: [-2.6, 1] }, { t: 6.8, at: [4.6, 1] }])],
    (P) => [{ start: 0, end: 7, label: "24mm  LOCKED-OFF WIDE", rig: "TRIPOD", subject: "ALEX", size: "WS", stop: 5.6, cam: rig.locked(P("ALEX"), { size: "WS", mm: 24, deg: -90, rise: 0.1 }, 3.6), flags: ["centre"], cut: "Opens the template" }]),
