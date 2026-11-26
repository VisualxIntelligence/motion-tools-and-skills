// CAM08-CraneDown
// Copied from engine/cinematic/src/templates/cameras.ts (lines 56-58 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh CAM08-CraneDown
import * as THREE from "three";
import { planner, scenePiece, type SceneSpec, type ShotDef } from "../kit/stage";
import type { ActorSpec } from "../kit/actors";
import { around, framed, lag, leadRoom, rig } from "../kit/rigs";
import { aimFor } from "../framer";
import { buildLab } from "./lab";
import type { Piece } from "../piece";

make({ id: "CAM08-CraneDown", name: "Crane down (arrival)", says: "We arrive in the world from above and come down to meet the person in it.", use: "Openings and establishing shots: geography first, then the subject.", numbers: "28 mm, from 10 m above to eye level over 6–8 s, eased in to a held medium.", avoid: "Landing on nothing: the move must end on the subject of the next beat." },
    [SAM([{ t: 0, at: [0, 0], yaw: 0.3 }])],
    (P) => [{ start: 0, end: 7, label: "28mm  CRANE DOWN", rig: "TECHNOCRANE", subject: "SAM", size: "WS", sizeEnd: "MWS", stop: 4, cam: rig.crane(P("SAM"), { size: "FS", mm: 28, deg: 15 }, 10, 0.05, 0, 7, 0.62), cut: "Opens the template", flags: ["compound"] }]),
