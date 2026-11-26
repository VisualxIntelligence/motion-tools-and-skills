// ANG17-UpsideDown
// Copied from engine/cinematic/src/templates/angles.ts (lines 54-55 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh ANG17-UpsideDown
import * as THREE from "three";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";
import { LOCATIONS, ENVIRONMENTS } from "./locations";

make({ id: "ANG17-UpsideDown", name: "Upside-down", says: "The world has flipped, and so has the person in it.", use: "Dreams, falling, a mind turned over, a stunt.", numbers: "28 mm, MS, the camera rolled 180 degrees and held, the horizon at the top.", avoid: "Using it as a gag: it works when the story has flipped too." },
    [stand(0, 0)], hold("28mm  UPSIDE-DOWN", "TRIPOD · ROLLED", "MS", (P) => withRoll(rig.locked(P("ALEX"), { size: "MS", mm: 28, deg: 20 }, 3), Math.PI))),
