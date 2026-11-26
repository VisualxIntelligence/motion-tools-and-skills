// ANG07-CloseUp
// Copied from engine/cinematic/src/templates/angles.ts (lines 32-33 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh ANG07-CloseUp
import * as THREE from "three";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";
import { LOCATIONS, ENVIRONMENTS } from "./locations";

make({ id: "ANG07-CloseUp", name: "Close-up", says: "Nothing but the face: this is what they feel.", use: "A reaction, a choice, the line that matters.", numbers: "85 mm, CU from about 2 m, shallow focus, the eyes on the upper third.", avoid: "Using it too early: a close-up has to be earned." },
    [stand(0, 0)], hold("85mm  CLOSE-UP", "TRIPOD", "CU", (P) => rig.locked(P("ALEX"), { size: "CU", mm: 85, deg: 18 }, 3))),
