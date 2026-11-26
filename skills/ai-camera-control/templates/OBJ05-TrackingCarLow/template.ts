// OBJ05-TrackingCarLow
// Copied from engine/cinematic/src/templates/objects.ts (lines 41-43 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh OBJ05-TrackingCarLow
import * as THREE from "three";
import { planner, scenePiece, type SceneSpec, type ShotDef } from "../kit/stage";
import type { ActorSpec } from "../kit/actors";
import { lag, rig } from "../kit/rigs";
import { aimFor } from "../framer";
import { ramp, smoother } from "../util";
import { buildLab } from "./lab";
import type { Piece } from "../piece";
import { CAMERA_INFO, type TemplateInfo } from "./cameras";

make({ id: "OBJ05-TrackingCarLow", name: "Low tracking (vehicle)", says: "Speed and power: low to the ground, matched to it, the road streaming past.", use: "Car chases, vehicles at speed, a character on a bike or horse.", numbers: "35 mm, 0.4 m off the ground, matched speed, side-on and a little ahead.", avoid: "Matching too exactly with nothing in the background: speed reads from what streams past." },
    [prop("CAR", "Car", "car", [0, 0], 0, "slate", [{ t: 0, at: [-9, 2] }, { t: 7, at: [27, 2] }])],
    (P) => [{ start: 0, end: 7, label: "35mm  LOW TRACKING · CAR", rig: "CAMERA CAR · LOW MOUNT", subject: "CAR", size: "WS", stop: 4, cam: rig.track(P("CAR"), { size: "WS", mm: 35, rise: -0.45 }, 1, 1.2), cut: "Opens the template", flags: ["enters-moving", "exits-moving", "centre"] }]),
