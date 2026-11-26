// CAM41-DroneOrbitHigh
// Copied from engine/cinematic/src/templates/cameras2.ts (lines 116-118 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh CAM41-DroneOrbitHigh
import * as THREE from "three";
import { smoother, ramp } from "../util";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, SAM, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";

make({ id: "CAM41-DroneOrbitHigh", name: "Drone orbit (high)", says: "We circle above the place and the person is where everything meets.", use: "Establishing a location, a gathering, an arrival from above.", numbers: "24 mm, WS from 9 m up, a 180 degree orbit over 8 s at a steady radius, the subject kept central.", avoid: "Orbiting too fast: a drone orbit should feel like weather." },
    [stand(0, 0, 0.2)],
    (P) => [{ start: 0, end: 9, label: "24mm  DRONE ORBIT HIGH", rig: "DRONE · GIMBAL", subject: "ALEX", size: "WS", stop: 4, cam: rig.orbit(P("ALEX"), { size: "WS", mm: 24, rise: 9 }, 20, 200, 0.4, 8.6, 9, 0.5), cut: "Opens the template", flags: ["compound"] }]),
