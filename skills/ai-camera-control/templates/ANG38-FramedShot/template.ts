// ANG38-FramedShot
// Copied from engine/cinematic/src/templates/angles.ts (lines 101-103 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh ANG38-FramedShot
import * as THREE from "three";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";
import { LOCATIONS, ENVIRONMENTS } from "./locations";

make({ id: "ANG38-FramedShot", name: "Frame within a frame", says: "The person is held inside something else: a doorway, a gap, a pair of columns.", use: "Isolation, being trapped or watched, drawing the eye to one figure.", numbers: "35 mm from 10 m, level, the person standing in the gap between two columns of the nave.", avoid: "A frame that is brighter than the subject: it pulls the eye away." },
    [ALEX([{ t: 0, at: [0, -12.5], yaw: 0 }])],
    () => [{ start: 0, end: 6, label: "35mm  FRAME WITHIN A FRAME", rig: "TRIPOD", subject: "ALEX", size: "FS", stop: 6, cam: () => ({ pos: V(0, 1.5, -2), target: V(0, 1.3, -14), mm: 35 }), cut: "Opens the template" }]),
