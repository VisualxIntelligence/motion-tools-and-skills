// ANG27-TelephotoCloseUp
// Copied from engine/cinematic/src/templates/angles.ts (lines 77-78 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh ANG27-TelephotoCloseUp
import * as THREE from "three";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";
import { LOCATIONS, ENVIRONMENTS } from "./locations";

make({ id: "ANG27-TelephotoCloseUp", name: "Telephoto close-up (200 mm)", says: "Watched from a long way off: a stranger who does not know we are there.", use: "Surveillance, a long wait, a candid portrait.", numbers: "200 mm, CU from 30 m, the background a smear of colour.", avoid: "Shaking: at 200 mm every tremor becomes a swing." },
    [stand(0, 0)], hold("200mm  TELEPHOTO CLOSE-UP", "TRIPOD", "CU", (P) => rig.locked(P("ALEX"), { size: "CU", mm: 200, deg: 14 }, 3))),
