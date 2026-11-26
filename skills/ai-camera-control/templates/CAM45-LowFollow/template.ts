// CAM45-LowFollow
// Copied from engine/cinematic/src/templates/cameras2.ts (lines 132-134 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh CAM45-LowFollow
import * as THREE from "three";
import { smoother, ramp } from "../util";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, SAM, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";

make({ id: "CAM45-LowFollow", name: "Low follow", says: "We follow at the height of their feet: weight, pace, intent.", use: "A walk to a confrontation, a character defined by how they move.", numbers: "24 mm, FS from behind at 3 m, 0.85 m below eye level, a Steadicam low-mode following a walk at 1.3 m/s.", avoid: "Going so low the ground fills the frame: the body stays in it." },
    [ALEX([{ t: 0.3, at: [0, 7] }, { t: 7, at: [0, -2.6] }])],
    (P) => [{ start: 0, end: 7, label: "24mm  LOW FOLLOW", rig: "STEADICAM · LOW MODE", subject: "ALEX", size: "FS", stop: 2.8, cam: rig.follow(P("ALEX"), { size: "FS", mm: 24, deg: 180, rise: -0.85 }), cut: "Opens the template", flags: ["enters-moving", "exits-moving"] }]),
