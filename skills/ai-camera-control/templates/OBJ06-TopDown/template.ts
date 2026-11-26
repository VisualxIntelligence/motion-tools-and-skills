// OBJ06-TopDown
// Copied from engine/cinematic/src/templates/objects.ts (lines 45-47 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh OBJ06-TopDown
import * as THREE from "three";
import { planner, scenePiece, type SceneSpec, type ShotDef } from "../kit/stage";
import type { ActorSpec } from "../kit/actors";
import { lag, rig } from "../kit/rigs";
import { aimFor } from "../framer";
import { ramp, smoother } from "../util";
import { buildLab } from "./lab";
import type { Piece } from "../piece";
import { CAMERA_INFO, type TemplateInfo } from "./cameras";

make({ id: "OBJ06-TopDown", name: "Top-down (god's eye)", says: "Pattern and fate: we look down like a map; the people below are pieces.", use: "Showing layout and geography, a body or an object on the ground, transitions between scenes.", numbers: "35 mm straight down from 10–15 m, a slow rotation of 20–30° over 6 s.", avoid: "Overhead for emotion: it distances; use it to explain space." },
    [prop("CAR", "Car", "car", [0, 0], 0.6, "slate"), ALEX([2.6, 1.2], -1.8)],
    () => [{ start: 0, end: 6, label: "35mm  TOP-DOWN · SLOW ROTATE", rig: "TECHNOCRANE · REMOTE HEAD", subject: "CAR", size: "WS", stop: 5.6, cam: (t) => { const a = 0.55 * smoother(t / 6); return { pos: V(Math.sin(a) * 0.2, 14, Math.cos(a) * 0.2), target: V(0, 0, 0), mm: 35, roll: -a }; }, cut: "Opens the template", flags: ["centre"] }]),
