// CAM35-OTSPushIn
// Copied from engine/cinematic/src/templates/cameras2.ts (lines 92-94 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh CAM35-OTSPushIn
import * as THREE from "three";
import { smoother, ramp } from "../util";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, SAM, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";

make({ id: "CAM35-OTSPushIn", name: "Over the shoulder push-in", says: "The listener is shut out, and we move in on the one who speaks.", use: "A confession, an ultimatum, the line everything turns on.", numbers: "75 mm over the shoulder from 4.6 m back, closing by 1.8 m over 6.5 s; the shoulder grows from about a third to 40% of the frame.", avoid: "Pushing so far the shoulder leaves the frame: it should still be there at the end." },
    [ALEX([{ t: 0, at: [-1.1, 0], yaw: Math.PI / 2 }], undefined, "SAM"), SAM([{ t: 0, at: [1.1, 0], yaw: -Math.PI / 2 }], undefined, "ALEX")],
    (P) => [{ start: 0, end: 7, label: "75mm  OTS PUSH-IN", rig: "DOLLY", subject: "SAM", size: "MCU", stop: 2, ots: "ALEX", pair: ["ALEX", "SAM"], cam: rig.ots(P("ALEX"), P("SAM"), 75, 1, 4.6, 0.5, 1.8, 0.5, 6.5), cut: "Opens the template" }]),
