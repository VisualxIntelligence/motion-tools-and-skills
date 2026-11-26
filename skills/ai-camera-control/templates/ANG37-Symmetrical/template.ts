// ANG37-Symmetrical
// Copied from engine/cinematic/src/templates/angles.ts (lines 98-100 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh ANG37-Symmetrical
import * as THREE from "three";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";
import { LOCATIONS, ENVIRONMENTS } from "./locations";

make({ id: "ANG37-Symmetrical", name: "Symmetrical shot", says: "Everything is balanced round the person in the middle: calm, ceremony, a trap.", use: "A formal portrait, a hallway, a still moment before something breaks the balance.", numbers: "28 mm, FS from the middle of the nave, level, the person on the centre line with a column on each side.", avoid: "Almost symmetrical: it has to be exact or it looks like a mistake." },
    [ALEX([{ t: 0, at: [0, -11], yaw: 0 }])],
    () => [{ start: 0, end: 6, label: "28mm  SYMMETRICAL", rig: "TRIPOD", subject: "ALEX", size: "FS", stop: 6, cam: () => ({ pos: V(0, 1.5, 2.5), target: V(0, 1.4, -14), mm: 28 }), cut: "Opens the template" }]),
