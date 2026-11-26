// CAM25-ArcAndRise
// Copied from engine/cinematic/src/templates/cameras2.ts (lines 52-54 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh CAM25-ArcAndRise
import * as THREE from "three";
import { smoother, ramp } from "../util";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, SAM, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";

make({ id: "CAM25-ArcAndRise", name: "Arc and rise", says: "We circle them and lift away at once: a moment growing into a landscape.", use: "The end of a big beat, a character left alone in the world, a hero reveal.", numbers: "28 mm, MWS, a 120 degree arc while the arm rises 3 m over 7 s, aim held on the eyes.", avoid: "Rising first and arcing second: both axes have to start and stop together." },
    [stand(0, 0, 0.2)],
    (P) => [{ start: 0, end: 8, label: "28mm  ARC AND RISE", rig: "TECHNOCRANE", subject: "ALEX", size: "MWS", sizeEnd: "WS", stop: 3, cam: rig.orbit(P("ALEX"), { size: "MWS", mm: 28 }, 20, 140, 0.3, 7.7, 3, 0.6), cut: "Opens the template", flags: ["compound"] }]),
