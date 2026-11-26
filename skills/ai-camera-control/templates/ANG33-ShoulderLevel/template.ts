// ANG33-ShoulderLevel
// Copied from engine/cinematic/src/templates/angles.ts (lines 88-89 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh ANG33-ShoulderLevel
import * as THREE from "three";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";
import { LOCATIONS, ENVIRONMENTS } from "./locations";

make({ id: "ANG33-ShoulderLevel", name: "Shoulder level", says: "A natural, reportage height: slightly below the eyes, so the person is a little taller than us.", use: "Everyday coverage, documentary walks, anything that should feel real but a touch heroic.", numbers: "40 mm, MS with the lens 0.3 m below eye level.", avoid: "Mixing it with true eye-level shots in one scene without a reason." },
    [stand(0, 0)], hold("40mm  SHOULDER LEVEL", "TRIPOD", "MS", (P) => rig.locked(P("ALEX"), { size: "MS", mm: 40, deg: 15, rise: -0.3 }, 3))),
