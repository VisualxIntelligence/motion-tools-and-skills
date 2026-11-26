// CAM24-ShortArc
// Copied from engine/cinematic/src/templates/cameras2.ts (lines 48-50 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh CAM24-ShortArc
import * as THREE from "three";
import { smoother, ramp } from "../util";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, SAM, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";

make({ id: "CAM24-ShortArc", name: "Short arc", says: "We swing a little way round them to see who they really are facing.", use: "Dialogue emphasis, a character realising, a small turn of perspective.", numbers: "35 mm, MS, an arc of 60 degrees over 6 s at a held distance, eyes kept on the upper third.", avoid: "Going all the way round: that is an orbit, and says something bigger." },
    [stand(0, 0, 0.2)],
    (P) => [{ start: 0, end: 7, label: "35mm  SHORT ARC 60", rig: "DOLLY · CURVED TRACK", subject: "ALEX", size: "MS", stop: 2.8, cam: rig.orbit(P("ALEX"), { size: "MS", mm: 35 }, 15, 75, 0.3, 6.7, 0, 0.6), cut: "Opens the template", flags: ["compound"] }]),
