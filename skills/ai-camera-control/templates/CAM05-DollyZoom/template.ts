// CAM05-DollyZoom
// Copied from engine/cinematic/src/templates/cameras.ts (lines 44-46 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh CAM05-DollyZoom
import * as THREE from "three";
import { planner, scenePiece, type SceneSpec, type ShotDef } from "../kit/stage";
import type { ActorSpec } from "../kit/actors";
import { around, framed, lag, leadRoom, rig } from "../kit/rigs";
import { aimFor } from "../framer";
import { buildLab } from "./lab";
import type { Piece } from "../piece";

make({ id: "CAM05-DollyZoom", name: "Dolly zoom", says: "The ground shifts under them: dread, vertigo, a realisation that changes everything.", use: "Once per film at most: the moment the world turns.", numbers: "Hold the subject's size while the focal length runs 32 → 90 mm and the camera travels back in proportion (distance ∝ focal length).", avoid: "Keying the lens and the move apart: the subject's size drifts and the effect reads as a mistake." },
    [ALEX([{ t: 0, at: [0, 3], yaw: 0 }])],
    (P) => [{ start: 0, end: 6, label: "32>90mm  DOLLY ZOOM", rig: "DOLLY · ZOOM", subject: "ALEX", size: "MCU", stop: 4, cam: rig.dollyZoom(P("ALEX"), "MCU", 32, 90, 0, 0, 6, 0.6), cut: "Opens the template", flags: ["compound"] }]),
