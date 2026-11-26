// CAM27-DutchPush
// Copied from engine/cinematic/src/templates/cameras2.ts (lines 60-62 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh CAM27-DutchPush
import * as THREE from "three";
import { smoother, ramp } from "../util";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, SAM, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";

make({ id: "CAM27-DutchPush", name: "Dutch push-in", says: "The tilt grows as we close in: something is going wrong in their head.", use: "A breakdown, a build to violence, a held panic.", numbers: "35 mm, MS to MCU over 6 s, the roll builds from 0 to 16 degrees as we push.", avoid: "Rolling back to level at the end: the room should not recover." },
    [ALEX([{ t: 0, at: [0, 0], yaw: 0.4 }], [{ kind: "lookDown", t0: 1.2, t1: 3.4 }])],
    (P) => [{ start: 0, end: 7, label: "35mm  DUTCH PUSH-IN", rig: "DOLLY · TILTED HEAD", subject: "ALEX", size: "MS", sizeEnd: "MCU", stop: 3, cam: withRoll(rig.dolly(P("ALEX"), { size: "MS", mm: 35, deg: 28 }, "MCU", 0.3, 6.7, 0.5), (t) => (16 * Math.PI / 180) * smoother(ramp(t, 0.3, 6.7))), cut: "Opens the template", flags: ["compound"] }]),
