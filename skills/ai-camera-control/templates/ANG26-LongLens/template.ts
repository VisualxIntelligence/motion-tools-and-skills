// ANG26-LongLens
// Copied from engine/cinematic/src/templates/angles.ts (lines 75-76 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh ANG26-LongLens
import * as THREE from "three";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";
import { LOCATIONS, ENVIRONMENTS } from "./locations";

make({ id: "ANG26-LongLens", name: "Long lens (135 mm)", says: "Far away, and flattened: the person and the background are glued together.", use: "Stalking, a crowd, a person lost in a city, a runner who is going nowhere.", numbers: "135 mm, MS from 14 m: the depth is compressed and the trees behind sit flat against the head.", avoid: "Forgetting to leave something sharp: shallow focus does the rest." },
    [stand(0, 0)], hold("135mm  LONG LENS", "TRIPOD", "MS", (P) => rig.locked(P("ALEX"), { size: "MS", mm: 135, deg: 18 }, 3))),
