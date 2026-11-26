// CAM23-PedestalDown
// Copied from engine/cinematic/src/templates/cameras2.ts (lines 44-46 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh CAM23-PedestalDown
import * as THREE from "three";
import { smoother, ramp } from "../util";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, SAM, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";

make({ id: "CAM23-PedestalDown", name: "Pedestal down", says: "We drop from above their eyes to meet them, or to sit beneath their weight.", use: "Someone sitting, losing, lowering, giving in.", numbers: "50 mm, MCU, the camera falls from 0.9 m above to 0.6 m below eye level over 6 s at a steady distance.", avoid: "Ending lower than the chin: the frame turns into a power shot you did not mean." },
    [stand(0, 0, 0.35)],
    (P) => [{ start: 0, end: 7, label: "50mm  PEDESTAL DOWN", rig: "PEDESTAL · DOLLY", subject: "ALEX", size: "MCU", stop: 3, cam: rig.crane(P("ALEX"), { size: "MCU", mm: 50, deg: 25 }, 0.9, -0.6, 0.3, 6.7, 1, 0.5), cut: "Opens the template" }]),
