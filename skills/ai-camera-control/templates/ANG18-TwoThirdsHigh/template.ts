// ANG18-TwoThirdsHigh
// Copied from engine/cinematic/src/templates/angles.ts (lines 56-57 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh ANG18-TwoThirdsHigh
import * as THREE from "three";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";
import { LOCATIONS, ENVIRONMENTS } from "./locations";

make({ id: "ANG18-TwoThirdsHigh", name: "High angle (looking down)", says: "We look down on them: small, watched, caught.", use: "Vulnerability, defeat, being observed.", numbers: "28 mm from 3.5 m above eye level, FS looking down about 40 degrees.", avoid: "Going full overhead: that is a bird's-eye, and says something else." },
    [stand(0, 0)], hold("28mm  HIGH ANGLE", "TRIPOD · HIGH", "FS", (P) => rig.locked(P("ALEX"), { size: "FS", mm: 28, deg: 20, rise: 3.5 }, 3))),
