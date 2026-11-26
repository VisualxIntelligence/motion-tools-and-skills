// ANG08-ExtremeCloseUp
// Copied from engine/cinematic/src/templates/angles.ts (lines 34-35 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh ANG08-ExtremeCloseUp
import * as THREE from "three";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";
import { LOCATIONS, ENVIRONMENTS } from "./locations";

make({ id: "ANG08-ExtremeCloseUp", name: "Extreme close-up", says: "A detail so near it becomes the whole story: the eyes, a lip, a twitch.", use: "A moment of fear, a lie, a tear, a thing about to happen.", numbers: "100 mm, ECU on both eyes from about 1 m, razor-thin focus.", avoid: "Going beyond the eyes into a single pupil unless the story needs it." },
    [stand(0, 0)], hold("100mm  EXTREME CLOSE-UP", "TRIPOD", "ECU", (P) => rig.locked(P("ALEX"), { size: "ECU", mm: 100, deg: 12 }, 3))),
