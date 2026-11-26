// CAM17-SlowZoomIn
// Copied from engine/cinematic/src/templates/cameras2.ts (lines 20-22 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh CAM17-SlowZoomIn
import * as THREE from "three";
import { smoother, ramp } from "../util";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, SAM, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";

make({ id: "CAM17-SlowZoomIn", name: "Slow zoom in", says: "Something is closing in on them, and they do not know it.", use: "Dread, a held thought, a stare that goes on a beat too long (the Kubrick creep).", numbers: "Locked tripod, 35 to 85 mm over 6 s, MS to MCU, eased at both ends. Nothing in the frame moves but the lens.", avoid: "A fast zoom (that is a crash zoom) or a zoom while the subject walks at us: it reads as a mistake." },
    [stand(0, 0, 0.3)],
    (P) => [{ start: 0, end: 7, label: "35>85mm  SLOW ZOOM IN", rig: "TRIPOD · ZOOM", subject: "ALEX", size: "MS", sizeEnd: "MCU", stop: 4, cam: rig.zoom(P("ALEX"), { size: "MS", mm: 35, deg: 25 }, 85, 0.4, 6.6, 0, 0.6), cut: "Opens the template" }]),
