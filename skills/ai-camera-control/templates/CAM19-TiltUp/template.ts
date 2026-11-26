// CAM19-TiltUp
// Copied from engine/cinematic/src/templates/cameras2.ts (lines 28-30 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh CAM19-TiltUp
import * as THREE from "three";
import { smoother, ramp } from "../util";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, SAM, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";

make({ id: "CAM19-TiltUp", name: "Tilt up", says: "We meet them from the ground up: boots, body, then the face.", use: "A hero introduction, a character entrance, scale.", numbers: "Fixed low position 2 m out, 24 mm, the head tilts from the boots to the eyes over 4 s, then holds the face for 2 s.", avoid: "Tilting past the head into empty sky." },
    [stand(0, 0, 0.2)],
    (P) => { const m = P("ALEX")(0), pos = framed(m, { size: "MS", mm: 24, deg: 0, rise: -0.8 }).pos; return [{ start: 0, end: 7, label: "24mm  TILT UP · BOOTS TO FACE", rig: "TRIPOD · FLUID HEAD", subject: "ALEX", size: "MS", sizeEnd: "MCU", stop: 4, cam: rig.tiltReveal(pos, m.sole.clone().add(V(0, 0.15, 0)), m.eye, 24, 0.3, 4.6, 0.3), cut: "Opens the template" }]; }),
