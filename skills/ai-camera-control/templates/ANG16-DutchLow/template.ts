// ANG16-DutchLow
// Copied from engine/cinematic/src/templates/angles.ts (lines 52-53 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh ANG16-DutchLow
import * as THREE from "three";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";
import { LOCATIONS, ENVIRONMENTS } from "./locations";

make({ id: "ANG16-DutchLow", name: "Dutch and low", says: "The room is crooked and they loom: a threat who is off balance too.", use: "A villain who has lost control, a hallucination, a hero in trouble.", numbers: "20 mm, MS from 1.1 m below eye level, rolled 14 degrees.", avoid: "Doing it with a calm face: the actor has to carry the unease too." },
    [stand(0, 0)], hold("20mm  DUTCH LOW", "TRIPOD · TILTED HEAD", "MS", (P) => withRoll(rig.locked(P("ALEX"), { size: "MS", mm: 20, deg: 15, rise: -1.1 }, 3), (14 * Math.PI) / 180))),
