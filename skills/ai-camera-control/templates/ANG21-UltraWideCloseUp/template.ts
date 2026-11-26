// ANG21-UltraWideCloseUp
// Copied from engine/cinematic/src/templates/angles.ts (lines 62-63 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh ANG21-UltraWideCloseUp
import * as THREE from "three";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";
import { LOCATIONS, ENVIRONMENTS } from "./locations";

make({ id: "ANG21-UltraWideCloseUp", name: "Ultra wide close-up (10 mm)", says: "A face that is too close: grotesque, funny, frightening.", use: "Comedy, paranoia, a character breaking down, a point-of-view from a hole.", numbers: "10 mm, CU from 0.5 m, the nose large and the ears falling away.", avoid: "Holding it past the joke or the fright." },
    [stand(0, 0)], hold("10mm  ULTRA WIDE CLOSE-UP", "TRIPOD", "CU", (P) => rig.locked(P("ALEX"), { size: "CU", mm: 10, deg: 10 }, 3))),
