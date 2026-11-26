// ANG05-Medium
// Copied from engine/cinematic/src/templates/angles.ts (lines 28-29 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh ANG05-Medium
import * as THREE from "three";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";
import { LOCATIONS, ENVIRONMENTS } from "./locations";

make({ id: "ANG05-Medium", name: "Medium shot", says: "The default: person and surroundings in balance.", use: "Dialogue, ordinary coverage, anything that should feel natural.", numbers: "50 mm, MS from the waist up at about 3 m, eyes on the upper third.", avoid: "Using it for everything: it needs closer and wider shots around it." },
    [stand(0, 0)], hold("50mm  MEDIUM SHOT", "TRIPOD", "MS", (P) => rig.locked(P("ALEX"), { size: "MS", mm: 50, deg: 25 }, 3))),
