// ANG03-Full
// Copied from engine/cinematic/src/templates/angles.ts (lines 24-25 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh ANG03-Full
import * as THREE from "three";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";
import { LOCATIONS, ENVIRONMENTS } from "./locations";

make({ id: "ANG03-Full", name: "Full shot", says: "The whole body, head to toe: how they stand, how they carry themselves.", use: "Costume, posture, a walk, a fight stance.", numbers: "35 mm, FS from about 6 m, the feet just inside the bottom edge.", avoid: "Cutting the feet at the ankle: either show them or go wider." },
    [stand(0, 0)], hold("35mm  FULL SHOT", "TRIPOD", "FS", (P) => rig.locked(P("ALEX"), { size: "FS", mm: 35, deg: 25 }, 3))),
