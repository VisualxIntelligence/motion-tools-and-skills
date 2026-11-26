// ANG10-EyeLevel
// Copied from engine/cinematic/src/templates/angles.ts (lines 38-39 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh ANG10-EyeLevel
import * as THREE from "three";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";
import { LOCATIONS, ENVIRONMENTS } from "./locations";

make({ id: "ANG10-EyeLevel", name: "Eye level", says: "Neutral: we stand where they stand and judge nothing.", use: "Honest coverage, conversation, anything that should feel real.", numbers: "40 mm, MS, the lens at the subject's eye height, level.", avoid: "Mistaking it for dull: a still, level frame is a choice." },
    [stand(0, 0)], hold("40mm  EYE LEVEL", "TRIPOD", "MS", (P) => rig.locked(P("ALEX"), { size: "MS", mm: 40, deg: 15, rise: 0 }, 3))),
