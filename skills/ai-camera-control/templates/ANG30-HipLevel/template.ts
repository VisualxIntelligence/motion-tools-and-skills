// ANG30-HipLevel
// Copied from engine/cinematic/src/templates/angles.ts (lines 81-82 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh ANG30-HipLevel
import * as THREE from "three";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";
import { LOCATIONS, ENVIRONMENTS } from "./locations";

make({ id: "ANG30-HipLevel", name: "Hip level", says: "The camera sits where the hands are: something is about to be drawn.", use: "Gunslingers, a hand on a holster, a fight about to start, a person who looks calm and is not.", numbers: "35 mm, MS from 1 m off the ground, 0.65 m below eye level, level.", avoid: "Losing the face: tilt up a little so the eyes stay in the top third." },
    [stand(0, 0)], hold("35mm  HIP LEVEL", "TRIPOD · LOW", "MS", (P) => rig.locked(P("ALEX"), { size: "MS", mm: 35, deg: 15, rise: -0.65 }, 3))),
