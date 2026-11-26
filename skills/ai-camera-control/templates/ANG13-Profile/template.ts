// ANG13-Profile
// Copied from engine/cinematic/src/templates/angles.ts (lines 46-47 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh ANG13-Profile
import * as THREE from "three";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";
import { LOCATIONS, ENVIRONMENTS } from "./locations";

make({ id: "ANG13-Profile", name: "Profile", says: "Seen from the side: a person in thought, in line with something else.", use: "Two people facing each other, a stern portrait, a figure about to turn.", numbers: "70 mm, MCU at 90 degrees to the face, level.", avoid: "Losing the eye line: leave room in front of the face." },
    [stand(0, 0, 0)], hold("70mm  PROFILE", "TRIPOD", "MCU", (P) => rig.locked(P("ALEX"), { size: "MCU", mm: 70, deg: 90 }, 3))),
