// CAM48-OrbitWalk
// Copied from engine/cinematic/src/templates/cameras2.ts (lines 144-146 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh CAM48-OrbitWalk
import * as THREE from "three";
import { smoother, ramp } from "../util";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, SAM, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";

make({ id: "CAM48-OrbitWalk", name: "Orbit a walker", says: "They walk, and the whole world swings round them as they go.", use: "A hero walk, a character arriving at a decision while still moving.", numbers: "35 mm, MS, the subject walks 6 m at 1 m/s while the camera arcs 130 degrees round them over 7 s.", avoid: "Orbiting at the walker's speed: the arc has to be slower, or it looks like a turntable." },
    [ALEX([{ t: 0.3, at: [-3, 2.5] }, { t: 7.2, at: [3, -3] }])],
    (P) => [{ start: 0, end: 8, label: "35mm  ORBIT A WALKER", rig: "TECHNOCRANE ORBIT", subject: "ALEX", size: "MS", stop: 2.8, cam: rig.orbit(P("ALEX"), { size: "MS", mm: 35 }, 20, 150, 0.3, 7.5, 0, 0.5), cut: "Opens the template", flags: ["enters-moving", "exits-moving", "compound"] }]),
