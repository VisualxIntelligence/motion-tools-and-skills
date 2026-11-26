// ANG34-HighThreeQuarter
// Copied from engine/cinematic/src/templates/angles.ts (lines 92-93 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh ANG34-HighThreeQuarter
import * as THREE from "three";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";
import { LOCATIONS, ENVIRONMENTS } from "./locations";

make({ id: "ANG34-HighThreeQuarter", name: "High three-quarter", says: "We look down on them from above and to one side: small, but still a person, not a symbol.", use: "A character who is being watched, a figure in a courtyard, a quiet defeat with some dignity left.", numbers: "28 mm, FS from 3 m above eye level and 45 degrees round, looking down about 35 degrees.", avoid: "Going to full overhead: the face has to stay readable." },
    [stand(0, 0)], hold("28mm  HIGH 3/4", "TRIPOD · HIGH", "FS", (P) => rig.locked(P("ALEX"), { size: "FS", mm: 28, deg: 45, rise: 3 }, 3))),
