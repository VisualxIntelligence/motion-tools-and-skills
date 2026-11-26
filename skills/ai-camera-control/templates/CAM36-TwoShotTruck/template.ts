// CAM36-TwoShotTruck
// Copied from engine/cinematic/src/templates/cameras2.ts (lines 96-98 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh CAM36-TwoShotTruck
import * as THREE from "three";
import { smoother, ramp } from "../util";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, SAM, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";

make({ id: "CAM36-TwoShotTruck", name: "Two-shot truck", says: "We slide along the space between two people and see who is closer.", use: "Dialogue in profile, a stand-off, a negotiation.", numbers: "35 mm, both in profile, the camera trucks 4 m sideways at 7.5 m distance over 6 s, aim held parallel.", avoid: "Letting one person leave the frame: both stay in for the whole move." },
    [ALEX([{ t: 0, at: [-1.3, 0], yaw: Math.PI / 2 }], undefined, "SAM"), SAM([{ t: 0, at: [1.3, 0], yaw: -Math.PI / 2 }], undefined, "ALEX")],
    () => [{ start: 0, end: 7, label: "35mm  TWO-SHOT TRUCK", rig: "DOLLY · TRACK", subject: "ALEX", size: "MWS", stop: 4, cam: rig.truck(V(-2.2, 1.5, 7.5), V(2.2, 1.5, 7.5), V(0, 0, -1), 35, 0.3, 6.7, undefined, 0.5), cut: "Opens the template" }]),
