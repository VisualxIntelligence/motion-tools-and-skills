// ANG23-FisheyeLow
// Copied from engine/cinematic/src/templates/angles.ts (lines 66-68 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh ANG23-FisheyeLow
import * as THREE from "three";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";
import { LOCATIONS, ENVIRONMENTS } from "./locations";

make({ id: "ANG23-FisheyeLow", name: "Fisheye low (skate-cam)", says: "The ground rushes past and the person walks above it.", use: "Skating, street culture, a hero walk with attitude.", numbers: "8 mm fisheye 0.9 m below eye level, following a walk from behind at 2 m with a little hand shake.", avoid: "Keeping the horizon level: let it bow." },
    [ALEX([{ t: 0.3, at: [0, 7] }, { t: 7, at: [0, -2.6] }])],
    (P) => [{ start: 0, end: 7, label: "8mm  FISHEYE LOW FOLLOW", rig: "HANDHELD · LOW", subject: "ALEX", size: "FS", stop: 4, cam: withFish(rig.shake(rig.follow(P("ALEX"), { size: "FS", mm: 8, deg: 180, rise: -0.9 }), 1.5, 5), 1), cut: "Opens the template", flags: ["enters-moving", "exits-moving"] }]),
