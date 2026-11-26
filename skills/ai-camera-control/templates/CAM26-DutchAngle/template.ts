// CAM26-DutchAngle
// Copied from engine/cinematic/src/templates/cameras2.ts (lines 56-58 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh CAM26-DutchAngle
import * as THREE from "three";
import { smoother, ramp } from "../util";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, SAM, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";

make({ id: "CAM26-DutchAngle", name: "Dutch angle", says: "The world is tilted, and so is whoever is in it.", use: "Unease, madness, a threat, a drug or a drink gone wrong.", numbers: "Locked tripod, 28 mm, MS, the horizon rolled 14 degrees for the whole shot.", avoid: "Using it for a whole scene: it turns into wallpaper. A beat, then back to level." },
    [stand(0, 0, 0.25)],
    (P) => [{ start: 0, end: 6, label: "28mm  DUTCH ANGLE 14", rig: "TRIPOD · TILTED HEAD", subject: "ALEX", size: "MS", stop: 4, cam: withRoll(rig.locked(P("ALEX"), { size: "MS", mm: 28, deg: 25, rise: -0.2 }, 3), () => (14 * Math.PI) / 180), cut: "Opens the template" }]),
