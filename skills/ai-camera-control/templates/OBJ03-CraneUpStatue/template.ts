// OBJ03-CraneUpStatue
// Copied from engine/cinematic/src/templates/objects.ts (lines 33-35 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh OBJ03-CraneUpStatue
import * as THREE from "three";
import { planner, scenePiece, type SceneSpec, type ShotDef } from "../kit/stage";
import type { ActorSpec } from "../kit/actors";
import { lag, rig } from "../kit/rigs";
import { aimFor } from "../framer";
import { ramp, smoother } from "../util";
import { buildLab } from "./lab";
import type { Piece } from "../piece";
import { CAMERA_INFO, type TemplateInfo } from "./cameras";

make({ id: "OBJ03-CraneUpStatue", name: "Crane up a monument", says: "Scale and awe: we rise with it to see how big it is, and what it watches over.", use: "Monuments, buildings, giant machines; the arrival at a destination.", numbers: "28 mm, starting low at the base (a low angle adds weight), rising 6 m over 6–8 s.", avoid: "Starting high: the rise is the reveal." },
    [prop("STATUE", "Statue", "statue", [0, -2], 0, "stone")],
    (P) => [{ start: 0, end: 7, label: "28mm  CRANE UP · LOW TO HIGH", rig: "TECHNOCRANE", subject: "STATUE", size: "FS", sizeEnd: "WS", stop: 4, cam: rig.crane(P("STATUE"), { size: "FS", mm: 28, deg: 20 }, -1.3, 5, 0, 7, 1.5), cut: "Opens the template", flags: ["compound"] }]),
