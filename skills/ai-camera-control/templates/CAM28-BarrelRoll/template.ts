// CAM28-BarrelRoll
// Copied from engine/cinematic/src/templates/cameras2.ts (lines 64-66 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh CAM28-BarrelRoll
import * as THREE from "three";
import { smoother, ramp } from "../util";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, SAM, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";

make({ id: "CAM28-BarrelRoll", name: "Barrel roll", says: "The whole world turns over around them.", use: "Disorientation, a fall, a crash, a leap into something new.", numbers: "28 mm, MS, a full 360 degree roll about the lens axis over 5 s, eased, the subject kept centred.", avoid: "Doing it fast: a slow roll reads as a dream, a quick one as a stunt." },
    [stand(0, 0, 0.25)],
    (P) => [{ start: 0, end: 7, label: "28mm  BARREL ROLL 360", rig: "ROLL RIG", subject: "ALEX", size: "MS", stop: 4, cam: withRoll(rig.locked(P("ALEX"), { size: "MS", mm: 28, deg: 20 }, 3), (t) => Math.PI * 2 * smoother(ramp(t, 0.8, 5.8))), cut: "Opens the template", flags: ["compound"] }]),
