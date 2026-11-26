// ANG02-Wide
// Copied from engine/cinematic/src/templates/angles.ts (lines 22-23 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh ANG02-Wide
import * as THREE from "three";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";
import { LOCATIONS, ENVIRONMENTS } from "./locations";

make({ id: "ANG02-Wide", name: "Wide shot", says: "Who they are, and where they are.", use: "Establishing a person in a place, the first shot after an extreme wide.", numbers: "28 mm, WS: the whole body with the set around it, locked at eye height.", avoid: "Leaving it on screen so long nothing has changed." },
    [stand(0, 0)], hold("28mm  WIDE SHOT", "TRIPOD", "WS", (P) => rig.locked(P("ALEX"), { size: "WS", mm: 28, deg: 25 }, 3))),
