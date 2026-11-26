// ANG14-ThreeQuarter
// Copied from engine/cinematic/src/templates/angles.ts (lines 48-49 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh ANG14-ThreeQuarter
import * as THREE from "three";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";
import { LOCATIONS, ENVIRONMENTS } from "./locations";

make({ id: "ANG14-ThreeQuarter", name: "Three-quarter", says: "The most flattering view of a face: it has depth and still looks at us.", use: "Portraits, interviews, a character introduced warmly.", numbers: "70 mm, MCU at 40 degrees to the face, slightly above eye level.", avoid: "Turning past 60 degrees: it becomes a profile." },
    [stand(0, 0, 0)], hold("70mm  THREE-QUARTER", "TRIPOD", "MCU", (P) => rig.locked(P("ALEX"), { size: "MCU", mm: 70, deg: 40, rise: 0.1 }, 3))),
