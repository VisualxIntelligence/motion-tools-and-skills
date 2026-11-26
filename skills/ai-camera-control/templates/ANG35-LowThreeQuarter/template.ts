// ANG35-LowThreeQuarter
// Copied from engine/cinematic/src/templates/angles.ts (lines 94-95 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh ANG35-LowThreeQuarter
import * as THREE from "three";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";
import { LOCATIONS, ENVIRONMENTS } from "./locations";

make({ id: "ANG35-LowThreeQuarter", name: "Low three-quarter", says: "They rise above us at an angle, and the sky is behind them.", use: "A hero against a skyline, a leader on a step, a person who should look larger than life.", numbers: "24 mm, MS from 1 m below eye level and 45 degrees round, looking up about 25 degrees.", avoid: "Letting the chin hide the eyes." },
    [stand(0, 0)], hold("24mm  LOW 3/4", "TRIPOD · LOW", "MS", (P) => rig.locked(P("ALEX"), { size: "MS", mm: 24, deg: 45, rise: -1 }, 3))),
