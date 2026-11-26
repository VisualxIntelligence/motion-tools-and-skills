// ANG20-SuperWide
// Copied from engine/cinematic/src/templates/angles.ts (lines 60-61 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh ANG20-SuperWide
import * as THREE from "three";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";
import { LOCATIONS, ENVIRONMENTS } from "./locations";

make({ id: "ANG20-SuperWide", name: "Super wide (14 mm)", says: "The lens pushes the space away from the centre and makes near things huge.", use: "Cramped rooms, action that needs to feel close, a hand coming at us.", numbers: "14 mm, MS from 1.4 m: the face is big, the background stretches, lines lean at the edges.", avoid: "Putting a face at the edge of the frame: it stretches." },
    [stand(0, 0)], hold("14mm  SUPER WIDE", "TRIPOD", "MS", (P) => rig.locked(P("ALEX"), { size: "MS", mm: 14, deg: 12 }, 3))),
