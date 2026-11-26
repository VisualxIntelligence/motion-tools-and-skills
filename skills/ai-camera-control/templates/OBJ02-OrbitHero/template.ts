// OBJ02-OrbitHero
// Copied from engine/cinematic/src/templates/objects.ts (lines 29-31 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh OBJ02-OrbitHero
import * as THREE from "three";
import { planner, scenePiece, type SceneSpec, type ShotDef } from "../kit/stage";
import type { ActorSpec } from "../kit/actors";
import { lag, rig } from "../kit/rigs";
import { aimFor } from "../framer";
import { ramp, smoother } from "../util";
import { buildLab } from "./lab";
import type { Piece } from "../piece";
import { CAMERA_INFO, type TemplateInfo } from "./cameras";

make({ id: "OBJ02-OrbitHero", name: "Hero orbit (object)", says: "Admire it: the reveal of a hero vehicle, a product, a prize.", use: "Introducing a vehicle, a machine or a product; showing every side in one move.", numbers: "35 mm, full shot, 180° over 6–8 s, eased, camera slightly above the roofline.", avoid: "Orbiting so fast the background smears; keep it under about 30°/s." },
    [prop("CAR", "Car", "car", [0, 0], 0, "slate")],
    (P) => [{ start: 0, end: 8, label: "35mm  HERO ORBIT 180", rig: "TECHNOCRANE ORBIT", subject: "CAR", size: "WS", stop: 4, cam: rig.orbit(P("CAR"), { size: "WS", mm: 35, rise: 1.1 }, 30, 210, 0, 8, 1.4, 0.5), cut: "Opens the template", flags: ["compound"] }]),
