// CAM32-RunAndGun
// Copied from engine/cinematic/src/templates/cameras2.ts (lines 80-82 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh CAM32-RunAndGun
import * as THREE from "three";
import { smoother, ramp } from "../util";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, SAM, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";

make({ id: "CAM32-RunAndGun", name: "Run and gun", says: "We are running with them, and the camera is not steady either.", use: "Chases, escapes, war films, anything where the operator should be in danger.", numbers: "28 mm, MWS from behind at 3 m, hand-held with a strong shake (amount 3), following a jog at about 2.4 m/s.", avoid: "Shaking the frame so hard the subject leaves it: the shake is on the camera, the subject stays framed." },
    [ALEX([{ t: 0.3, at: [0, 9] }, { t: 6.8, at: [0, -6] }])],
    (P) => [{ start: 0, end: 7, label: "28mm  RUN AND GUN", rig: "HANDHELD", subject: "ALEX", size: "MWS", stop: 2.8, cam: rig.shake(rig.follow(P("ALEX"), { size: "MWS", mm: 28, deg: 180, rise: 0.1 }, 0.35), 3, 4), cut: "Opens the template", flags: ["enters-moving", "exits-moving"] }]),
