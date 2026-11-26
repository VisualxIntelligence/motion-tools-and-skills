// CAM47-HandheldPushIn
// Copied from engine/cinematic/src/templates/cameras2.ts (lines 140-142 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh CAM47-HandheldPushIn
import * as THREE from "three";
import { smoother, ramp } from "../util";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, SAM, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";

make({ id: "CAM47-HandheldPushIn", name: "Handheld push-in", says: "We lean in with a shaking body: fear, a secret, something we should not see.", use: "Documentary tension, a confession, a character cornered.", numbers: "40 mm, MS to MCU over 6 s, a handheld shake of amount 2, eyes on the upper third.", avoid: "A shake so big it looks like a fault: it should feel like breath." },
    [ALEX([{ t: 0, at: [0, 0], yaw: 0.4 }], [{ kind: "lookDown", t0: 1.2, t1: 3.4 }])],
    (P) => [{ start: 0, end: 7, label: "40mm  HANDHELD PUSH-IN", rig: "HANDHELD", subject: "ALEX", size: "MS", sizeEnd: "MCU", stop: 3, cam: rig.shake(rig.dolly(P("ALEX"), { size: "MS", mm: 40, deg: 28 }, "MCU", 0.3, 6.7, 0.5), 2, 6), cut: "Opens the template" }]),
