// ANG06-MediumCloseUp
// Copied from engine/cinematic/src/templates/angles.ts (lines 30-31 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh ANG06-MediumCloseUp
import * as THREE from "three";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";
import { LOCATIONS, ENVIRONMENTS } from "./locations";

make({ id: "ANG06-MediumCloseUp", name: "Medium close-up", says: "Close enough to read the face, far enough to keep the body language.", use: "Interviews, the heart of a scene, reaction shots.", numbers: "65 mm, MCU from the chest up at about 2.5 m.", avoid: "Letting the shoulders crop awkwardly: the edge falls at the chest." },
    [stand(0, 0)], hold("65mm  MEDIUM CLOSE-UP", "TRIPOD", "MCU", (P) => rig.locked(P("ALEX"), { size: "MCU", mm: 65, deg: 22 }, 3))),
