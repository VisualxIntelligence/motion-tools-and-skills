// CAM38-PushToCloseUp
// Copied from engine/cinematic/src/templates/cameras2.ts (lines 104-106 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh CAM38-PushToCloseUp
import * as THREE from "three";
import { smoother, ramp } from "../util";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, SAM, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";

make({ id: "CAM38-PushToCloseUp", name: "Push to the close-up", says: "We go in until nothing is left but the face.", use: "The moment of decision, a lie being told, a tear.", numbers: "85 mm, MCU to CU over 6 s, a slow dolly, the eyes kept on the upper third.", avoid: "Pushing past the face into a detail: stop while both eyes are still in frame." },
    [ALEX([{ t: 0, at: [0, 0], yaw: 0.35 }], [{ kind: "lookDown", t0: 1.5, t1: 4 }])],
    (P) => [{ start: 0, end: 7, label: "85mm  PUSH TO THE CLOSE-UP", rig: "DOLLY", subject: "ALEX", size: "MCU", sizeEnd: "CU", stop: 2, cam: rig.dolly(P("ALEX"), { size: "MCU", mm: 85, deg: 15 }, "CU", 0.3, 6.7, 0.6), cut: "Opens the template" }]),
