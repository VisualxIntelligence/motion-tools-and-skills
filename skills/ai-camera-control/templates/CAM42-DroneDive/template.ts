// CAM42-DroneDive
// Copied from engine/cinematic/src/templates/cameras2.ts (lines 120-122 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh CAM42-DroneDive
import * as THREE from "three";
import { smoother, ramp } from "../util";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, SAM, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";

make({ id: "CAM42-DroneDive", name: "Drone dive", says: "We fall out of the sky onto them.", use: "A reveal of the hero, an arrival, a rooftop to a face.", numbers: "From 25 m up and 14 m out, diving to a 3.4 m MWS over 6 s, the lens tightening from 24 to 50 mm, gravity-eased.", avoid: "Stopping short: the dive ends on the subject, composed." },
    [stand(0, 0, 0.2)],
    (P) => [{ start: 0, end: 7, label: "24>50mm  DRONE DIVE", rig: "DRONE · GIMBAL", subject: "ALEX", size: "WS", sizeEnd: "MWS", stop: 4, cam: rig.dive(P("ALEX"), V(-9, 25, 11), V(-2.2, 1.9, 2.6), 24, 50, 0.4, 6.4), cut: "Opens the template" }]),
