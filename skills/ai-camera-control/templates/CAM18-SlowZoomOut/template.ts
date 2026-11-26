// CAM18-SlowZoomOut
// Copied from engine/cinematic/src/templates/cameras2.ts (lines 24-26 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh CAM18-SlowZoomOut
import * as THREE from "three";
import { smoother, ramp } from "../util";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, SAM, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";

make({ id: "CAM18-SlowZoomOut", name: "Slow zoom out", says: "We pull back from the thought and see the room it happens in.", use: "Isolation, a reveal of who else is there, the end of a scene.", numbers: "Locked tripod, 100 down to 35 mm over 6 s, CU to MS, eased at both ends.", avoid: "Stopping half way. The move has to land on a composed wide." },
    [stand(0, 0, 0.3)],
    (P) => [{ start: 0, end: 7, label: "100>35mm  SLOW ZOOM OUT", rig: "TRIPOD · ZOOM", subject: "ALEX", size: "CU", sizeEnd: "MS", stop: 4, cam: rig.zoom(P("ALEX"), { size: "CU", mm: 100, deg: 25 }, 35, 0.4, 6.6, 0, 0.6), cut: "Opens the template" }]),
