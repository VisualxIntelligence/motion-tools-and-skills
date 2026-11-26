// ANG15-FromBehind
// Copied from engine/cinematic/src/templates/angles.ts (lines 50-51 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh ANG15-FromBehind
import * as THREE from "three";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";
import { LOCATIONS, ENVIRONMENTS } from "./locations";

make({ id: "ANG15-FromBehind", name: "From behind", says: "We stay behind them, facing what they face.", use: "A decision about to be made, an entrance into a room, a long look at something we cannot see yet.", numbers: "40 mm, MS from behind at 3 m, level, the shoulders filling the lower third.", avoid: "Showing the face at the end: the choice to withhold it is the point." },
    [stand(0, 0, 0)], hold("40mm  FROM BEHIND", "TRIPOD", "MS", (P) => rig.locked(P("ALEX"), { size: "MS", mm: 40, deg: 180 }, 3))),
