// ANG24-Peephole
// Copied from engine/cinematic/src/templates/angles.ts (lines 69-71 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh ANG24-Peephole
import * as THREE from "three";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";
import { LOCATIONS, ENVIRONMENTS } from "./locations";

make({ id: "ANG24-Peephole", name: "Peephole", says: "We are on the other side of the door, watching someone arrive.", use: "A thriller, a doorstep, a character who should not open the door.", numbers: "5 mm fisheye at 1.5 m height looking out, the visitor walking in from 8 m to 2 m over 6 s.", avoid: "Showing the visitor's face too soon: let them grow." },
    [ALEX([{ t: 0.3, at: [0, -9], yaw: Math.PI }, { t: 6.6, at: [0, -2.2], yaw: Math.PI }])],
    () => [{ start: 0, end: 7, label: "5mm  PEEPHOLE", rig: "DOOR MOUNT", subject: "ALEX", size: "WS", stop: 4, cam: withFish((): Cam => ({ pos: V(0, 1.55, 3.2), target: V(0, 1.4, -6), mm: 5 }), 1), cut: "Opens the template" }]),
