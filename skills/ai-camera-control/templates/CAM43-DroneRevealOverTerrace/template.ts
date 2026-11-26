// CAM43-DroneRevealOverTerrace
// Copied from engine/cinematic/src/templates/cameras2.ts (lines 124-126 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh CAM43-DroneRevealOverTerrace
import * as THREE from "three";
import { smoother, ramp } from "../util";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, SAM, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";

make({ id: "CAM43-DroneRevealOverTerrace", name: "Drone reveal", says: "We rise over the edge of something and the place is revealed.", use: "The first view of a location, a reveal of scale, a journey's end.", numbers: "24 mm, a programmed path from low behind a tall stack at the west side up to 14 m over the floor over 8 s, eyes kept on the person.", avoid: "Revealing the subject first: the place comes before the person." },
    [stand(0, 0, 0.2)],
    (P) => { void P; const look = V(0, 1.2, 0); return [{ start: 0, end: 9, label: "24mm  DRONE REVEAL", rig: "DRONE · PROGRAMMED", subject: "ALEX", size: "WS", stop: 4, cam: rig.spline([{ t: 0.3, pos: V(-30, 2.2, 0), look: V(-8, 8, 0), mm: 24 }, { t: 4, pos: V(-18, 10, 2), look, mm: 24 }, { t: 8.7, pos: V(2, 14, 9), look, mm: 24 }]), cut: "Opens the template", flags: ["compound"] }]; }),
