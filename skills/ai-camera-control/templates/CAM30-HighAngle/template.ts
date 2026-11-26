// CAM30-HighAngle
// Copied from engine/cinematic/src/templates/cameras2.ts (lines 72-74 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh CAM30-HighAngle
import * as THREE from "three";
import { smoother, ramp } from "../util";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, SAM, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";

make({ id: "CAM30-HighAngle", name: "High angle", says: "They are small, watched, or about to be caught.", use: "Vulnerability, surveillance, a character who has lost.", numbers: "Locked camera 3 m above eye level, 28 mm, FS looking down about 40 degrees, the ground filling the frame.", avoid: "Going to a full top-down: that is a map, not a power shot." },
    [stand(0, 0, 0.2)],
    (P) => [{ start: 0, end: 6, label: "28mm  HIGH ANGLE", rig: "TRIPOD · HIGH MOUNT", subject: "ALEX", size: "FS", stop: 4, cam: rig.locked(P("ALEX"), { size: "FS", mm: 28, deg: 20, rise: 3.2 }, 3), cut: "Opens the template" }]),
