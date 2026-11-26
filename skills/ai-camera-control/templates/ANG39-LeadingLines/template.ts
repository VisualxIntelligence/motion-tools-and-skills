// ANG39-LeadingLines
// Copied from engine/cinematic/src/templates/angles.ts (lines 104-106 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh ANG39-LeadingLines
import * as THREE from "three";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";
import { LOCATIONS, ENVIRONMENTS } from "./locations";

make({ id: "ANG39-LeadingLines", name: "Leading lines", says: "Every line in the ground runs to one person.", use: "Directing the eye without a cut, a long approach, a destination.", numbers: "24 mm at 0.7 m height, centred on a paving joint, the person 16 m away where the lines meet.", avoid: "Lines that run past the subject: they must end on them." },
    [ALEX([{ t: 0, at: [0, -9], yaw: 0 }])],
    () => [{ start: 0, end: 6, label: "24mm  LEADING LINES", rig: "GROUND MOUNT", subject: "ALEX", size: "WS", stop: 8, cam: () => ({ pos: V(0, 0.7, 7), target: V(0, 0.9, -9), mm: 24 }), cut: "Opens the template" }]),
