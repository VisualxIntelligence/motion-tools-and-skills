// ANG32-GroundLevelWalk
// Copied from engine/cinematic/src/templates/angles.ts (lines 85-87 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh ANG32-GroundLevelWalk
import * as THREE from "three";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";
import { LOCATIONS, ENVIRONMENTS } from "./locations";

make({ id: "ANG32-GroundLevelWalk", name: "Ground level walk", says: "We see where they are going by their feet, and nothing of their face.", use: "A mysterious walker, a hit, a delivery, a character we should not know yet.", numbers: "24 mm, 0.2 m off the ground, following a walk from behind at 2.5 m, the shoes and legs only.", avoid: "Cutting to the face right after: keep the withholding going." },
    [ALEX([{ t: 0.3, at: [0, 7] }, { t: 7, at: [0, -2.6] }])],
    (P) => [{ start: 0, end: 7, label: "24mm  GROUND LEVEL WALK", rig: "GROUND MOUNT · DOLLY", subject: "ALEX", size: "FS", stop: 4, cam: rig.follow(P("ALEX"), { size: "MWS", mm: 24, deg: 180, rise: -1.45 }), cut: "Opens the template", flags: ["enters-moving", "exits-moving"] }]),
