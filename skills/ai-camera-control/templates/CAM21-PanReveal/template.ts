// CAM21-PanReveal
// Copied from engine/cinematic/src/templates/cameras2.ts (lines 36-38 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh CAM21-PanReveal
import * as THREE from "three";
import { smoother, ramp } from "../util";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, SAM, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";

make({ id: "CAM21-PanReveal", name: "Pan reveal", says: "We look away from the person, and the turn of the camera brings them in.", use: "Introducing someone who has been there all along; a hidden presence.", numbers: "Fixed position at 4 m, 40 mm, a 40 degree pan over 3.5 s from an empty wall of the plaza onto the person, then a held MS.", avoid: "Panning past the subject and coming back: land on them once." },
    [stand(-3, -4, Math.PI * 0.85)],
    (P) => { const pos = V(2.5, 1.5, 3.5), m = P("ALEX")(0); return [{ start: 0, end: 7, label: "40mm  PAN REVEAL", rig: "TRIPOD · FLUID HEAD", subject: "ALEX", size: "MS", stop: 4, cam: rig.tiltReveal(pos, V(9, 1.5, -9), aimFor(pos, m.eye, 40, [0.15, 1 / 3]), 40, 0.8, 4.2, 0.4), cut: "Opens the template" }]; }),
