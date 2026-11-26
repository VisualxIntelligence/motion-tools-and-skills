// ANG31-KneeLevel
// Copied from engine/cinematic/src/templates/angles.ts (lines 83-84 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh ANG31-KneeLevel
import * as THREE from "three";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";
import { LOCATIONS, ENVIRONMENTS } from "./locations";

make({ id: "ANG31-KneeLevel", name: "Knee level", says: "Low and close to the floor: a creeping, watchful or comic point of view.", use: "A character sneaking, a pet's or child's view, a person who is bigger than the room.", numbers: "28 mm, FS from 0.5 m off the ground, 1.15 m below eye level.", avoid: "Going so low the face is lost: the head must stay in frame." },
    [stand(0, 0)], hold("28mm  KNEE LEVEL", "TRIPOD · LOW", "FS", (P) => rig.locked(P("ALEX"), { size: "FS", mm: 28, deg: 15, rise: -1.15 }, 3))),
