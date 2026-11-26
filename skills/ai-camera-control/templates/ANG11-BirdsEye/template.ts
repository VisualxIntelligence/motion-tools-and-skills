// ANG11-BirdsEye
// Copied from engine/cinematic/src/templates/angles.ts (lines 40-42 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh ANG11-BirdsEye
import * as THREE from "three";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";
import { LOCATIONS, ENVIRONMENTS } from "./locations";

make({ id: "ANG11-BirdsEye", name: "Bird's-eye (straight down)", says: "We are above it all, looking straight down at someone crossing the ground.", use: "Detachment, fate, a map of a movement, an overhead insert.", numbers: "24 mm from 14 m directly above, locked, a person walking across the frame about 6 m.", avoid: "Letting it run long without a reason: it gets abstract." },
    [ALEX([{ t: 0.3, at: [-3.5, 0.5] }, { t: 6.3, at: [3.5, -0.5] }])],
    hold("24mm  BIRD'S-EYE", "DRONE · DOWN", "WS", (P) => (t: number): Cam => { void P; const pos = V(0, 14, 0.4); return { pos, target: V(0, 0, 0), mm: 24 }; }, 7)),
