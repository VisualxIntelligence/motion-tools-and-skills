// CAM20-TiltDown
// Copied from engine/cinematic/src/templates/cameras2.ts (lines 32-34 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh CAM20-TiltDown
import * as THREE from "three";
import { smoother, ramp } from "../util";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, SAM, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";

make({ id: "CAM20-TiltDown", name: "Tilt down", says: "We start on the face and are taken down to what they are standing on, or holding.", use: "Revealing a weapon, a gift, a body, a clue below the eyeline.", numbers: "Fixed position 3 m out, 35 mm, the head tilts from the eyes to the boots over 4 s.", avoid: "Showing the answer at the start: the face has to give nothing away." },
    [stand(0, 0, 0.2)],
    (P) => { const m = P("ALEX")(0), pos = framed(m, { size: "MS", mm: 35, deg: 0, rise: 0.1 }).pos; return [{ start: 0, end: 7, label: "35mm  TILT DOWN · FACE TO BOOTS", rig: "TRIPOD · FLUID HEAD", subject: "ALEX", size: "MS", sizeEnd: "FS", stop: 4, cam: rig.tiltReveal(pos, m.eye, m.sole.clone().add(V(0, 0.1, 0)), 35, 1, 4.8, 0.3), cut: "Opens the template" }]; }),
