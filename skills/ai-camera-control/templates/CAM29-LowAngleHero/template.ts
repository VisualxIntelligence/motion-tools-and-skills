// CAM29-LowAngleHero
// Copied from engine/cinematic/src/templates/cameras2.ts (lines 68-70 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh CAM29-LowAngleHero
import * as THREE from "three";
import { smoother, ramp } from "../util";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, SAM, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";

make({ id: "CAM29-LowAngleHero", name: "Low angle (power shot)", says: "They are bigger than the room: strength, threat, a hero.", use: "A leader, a villain's entrance, anyone who should loom.", numbers: "Locked tripod 1.1 m below eye level, 24 mm, MS looking up about 25 degrees, the ceiling or sky behind the head.", avoid: "Going so low the face is all chin: keep the eyes in the frame." },
    [stand(0, 0, 0.2)],
    (P) => [{ start: 0, end: 6, label: "24mm  LOW ANGLE", rig: "TRIPOD · LOW MOUNT", subject: "ALEX", size: "MS", stop: 4, cam: rig.locked(P("ALEX"), { size: "MS", mm: 24, deg: 15, rise: -1.15 }, 3), cut: "Opens the template" }]),
