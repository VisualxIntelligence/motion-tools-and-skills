// OBJ10-CrashZoom
// Copied from engine/cinematic/src/templates/objects.ts (lines 67-69 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh OBJ10-CrashZoom
import * as THREE from "three";
import { planner, scenePiece, type SceneSpec, type ShotDef } from "../kit/stage";
import type { ActorSpec } from "../kit/actors";
import { lag, rig } from "../kit/rigs";
import { aimFor } from "../framer";
import { ramp, smoother } from "../util";
import { buildLab } from "./lab";
import type { Piece } from "../piece";
import { CAMERA_INFO, type TemplateInfo } from "./cameras";

make({ id: "OBJ10-CrashZoom", name: "Crash zoom", says: "Shock or punchline: the lens slams in on the thing that matters.", use: "Comedy beats, sudden realisations, 70s-style energy; a deliberate stylistic flourish.", numbers: "Fixed camera, 24 → 150 mm in 0.3–0.4 s, a held frame on both sides.", avoid: "Using it as a dolly: a zoom flattens space and reads as a style choice." },
    [prop("STATUE", "Statue", "statue", [0, -10], 0, "sand")],
    (P) => [{ start: 0, end: 5, label: "24>150mm  CRASH ZOOM", rig: "TRIPOD · ZOOM", subject: "STATUE", size: "WS", stop: 4, cam: rig.zoom(P("STATUE"), { size: "WS", mm: 24, deg: 15 }, 150, 2.2, 2.6, 2.5, 0), cut: "Opens the template", flags: ["whip", "centre"] }]),
