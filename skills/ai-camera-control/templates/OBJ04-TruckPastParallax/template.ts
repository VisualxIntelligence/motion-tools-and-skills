// OBJ04-TruckPastParallax
// Copied from engine/cinematic/src/templates/objects.ts (lines 37-39 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh OBJ04-TruckPastParallax
import * as THREE from "three";
import { planner, scenePiece, type SceneSpec, type ShotDef } from "../kit/stage";
import type { ActorSpec } from "../kit/actors";
import { lag, rig } from "../kit/rigs";
import { aimFor } from "../framer";
import { ramp, smoother } from "../util";
import { buildLab } from "./lab";
import type { Piece } from "../piece";
import { CAMERA_INFO, type TemplateInfo } from "./cameras";

make({ id: "OBJ04-TruckPastParallax", name: "Truck past (parallax)", says: "Depth and travel: the world is layered, and we are moving through it.", use: "Establishing a space with depth; passing foreground that frames the subject; showing speed.", numbers: "35 mm, a sideways slide of 10–12 m over 6–8 s, aim held parallel; foreground 1–3 m away, subject 10+ m.", avoid: "An empty foreground: parallax needs near objects to pass the lens." },
    [prop("MONO", "Monolith", "monolith", [0.5, -7], 0, "plum"), prop("C1", "Crate", "crate", [-4, 4.5], 0.4), prop("C2", "Barrel", "barrel", [-0.6, 4.2]), prop("C3", "Crate", "crate", [3.2, 4.8], 1.1), prop("C4", "Barrel", "barrel", [6, 4.4])],
    () => [{ start: 0, end: 7, label: "35mm  TRUCK RIGHT · PARALLAX", rig: "DOLLY · TRACK", subject: "MONO", size: "WS", stop: 5.6, cam: rig.truck(V(-5.5, 1.3, 8), V(5.5, 1.3, 8), V(0.04, -0.05, -1), 35, 0, 7), cut: "Opens the template", flags: ["centre"] }]),
