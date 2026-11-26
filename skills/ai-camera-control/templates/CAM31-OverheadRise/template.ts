// CAM31-OverheadRise
// Copied from engine/cinematic/src/templates/cameras2.ts (lines 76-78 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh CAM31-OverheadRise
import * as THREE from "three";
import { smoother, ramp } from "../util";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, SAM, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";

make({ id: "CAM31-OverheadRise", name: "Overhead rise", says: "We lift off them and look straight down at where they stand.", use: "A character left alone, a map of a place, an ending that goes cold.", numbers: "28 mm, the camera rises from 0.5 to 14 m over 7 s and swings in until it looks straight down, the figure kept central.", avoid: "Losing the subject at the top: keep them in the middle of the frame as it climbs." },
    [stand(0, 0, 0.2)],
    (P) => [{ start: 0, end: 8, label: "28mm  OVERHEAD RISE", rig: "TECHNOCRANE · DRONE", subject: "ALEX", size: "FS", sizeEnd: "WS", stop: 4, cam: rig.crane(P("ALEX"), { size: "FS", mm: 28, deg: 30 }, 0.5, 14, 0.3, 7.7, 0.15, 0.5), cut: "Opens the template", flags: ["compound"] }]),
