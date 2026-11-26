// OBJ08-WipeReveal
// Copied from engine/cinematic/src/templates/objects.ts (lines 56-58 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh OBJ08-WipeReveal
import * as THREE from "three";
import { planner, scenePiece, type SceneSpec, type ShotDef } from "../kit/stage";
import type { ActorSpec } from "../kit/actors";
import { lag, rig } from "../kit/rigs";
import { aimFor } from "../framer";
import { ramp, smoother } from "../util";
import { buildLab } from "./lab";
import type { Piece } from "../piece";
import { CAMERA_INFO, type TemplateInfo } from "./cameras";

make({ id: "OBJ08-WipeReveal", name: "Wipe reveal", says: "A curtain opens: something near the lens passes and the subject is there.", use: "Hidden cuts, reveals, transitions between scenes or times.", numbers: "35 mm, a lateral move behind a near object (1–2 m from the lens) that fills the frame for a moment.", avoid: "A wipe object that is too far: it must fill the frame to hide or reveal." },
    [prop("MONO", "Monolith", "monolith", [0, 5.6], 0, "stone"), prop("STATUE", "Statue", "statue", [0.4, -4], 0, "sand")],
    (P) => [{ start: 0, end: 6, label: "35mm  WIPE REVEAL", rig: "DOLLY · TRACK", subject: "STATUE", size: "FS", stop: 4, cam: rig.truck(V(-3.4, 1.6, 7.4), V(3.4, 1.6, 7.4), V(0, 0, -1), 35, 0, 6, (t) => P("STATUE")(t).eye), cut: "Opens the template", flags: ["centre", "wipe", "compound"] }]),
