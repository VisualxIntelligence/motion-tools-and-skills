// ANG22-Fisheye
// Copied from engine/cinematic/src/templates/angles.ts (lines 64-65 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh ANG22-Fisheye
import * as THREE from "three";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";
import { LOCATIONS, ENVIRONMENTS } from "./locations";

make({ id: "ANG22-Fisheye", name: "Fisheye (8 mm)", says: "The whole world bends round the person at the centre.", use: "Skate videos, hip-hop videos, panic, a character losing grip.", numbers: "8 mm fisheye, MS from 1 m: straight lines curve toward the edges, the centre stays natural.", avoid: "A fisheye on every shot: it needs a reason to bend the world." },
    [stand(0, 0)], hold("8mm  FISHEYE", "TRIPOD", "MS", (P) => withFish(rig.locked(P("ALEX"), { size: "MS", mm: 8, deg: 12 }, 3), 1))),
