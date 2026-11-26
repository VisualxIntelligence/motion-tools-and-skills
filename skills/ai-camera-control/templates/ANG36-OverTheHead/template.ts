// ANG36-OverTheHead
// Copied from engine/cinematic/src/templates/angles.ts (lines 96-97 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh ANG36-OverTheHead
import * as THREE from "three";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";
import { LOCATIONS, ENVIRONMENTS } from "./locations";

make({ id: "ANG36-OverTheHead", name: "Over the head", says: "We are behind and above them, looking down past their head at what they face.", use: "A person at a table, a look at a map, a reveal that the viewer shares with them.", numbers: "28 mm from 2.4 m above eye level, directly behind, looking down about 45 degrees, the head and shoulders in the lower frame.", avoid: "Hiding what they look at: it has to be in the frame." },
    [stand(0, 0, 0)], hold("28mm  OVER THE HEAD", "TRIPOD · HIGH", "MS", (P) => rig.locked(P("ALEX"), { size: "MS", mm: 28, deg: 180, rise: 2.4 }, 3))),
