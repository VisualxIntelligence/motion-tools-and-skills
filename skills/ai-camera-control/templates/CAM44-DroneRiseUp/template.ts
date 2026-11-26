// CAM44-DroneRiseUp
// Copied from engine/cinematic/src/templates/cameras2.ts (lines 128-130 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh CAM44-DroneRiseUp
import * as THREE from "three";
import { smoother, ramp } from "../util";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, SAM, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";

make({ id: "CAM44-DroneRiseUp", name: "Drone rise up", says: "We lift straight up off the spot and see how small it all is.", use: "Endings, a character in a vast place, a long look at the ground.", numbers: "24 mm, the camera rises from 1 m to 24 m over 8 s looking down, the subject centred.", avoid: "Drifting sideways while it rises: the lift is vertical." },
    [stand(0, 0, 0.2)],
    (P) => [{ start: 0, end: 9, label: "24mm  DRONE RISE UP", rig: "DRONE · GIMBAL", subject: "ALEX", size: "WS", stop: 4, cam: rig.crane(P("ALEX"), { size: "WS", mm: 24, deg: 30 }, 1, 24, 0.4, 8.6, 0.4, 0.5), cut: "Opens the template", flags: ["compound"] }]),
