// ANG04-Cowboy
// Copied from engine/cinematic/src/templates/angles.ts (lines 26-27 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh ANG04-Cowboy
import * as THREE from "three";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";
import { LOCATIONS, ENVIRONMENTS } from "./locations";

make({ id: "ANG04-Cowboy", name: "Cowboy shot (medium wide)", says: "From the thigh up: the hands and the face are both in play.", use: "Standoffs, gunslingers, anyone whose hands matter as much as their eyes.", numbers: "40 mm, MWS from about 4 m, the frame edge at mid-thigh.", avoid: "Cutting at the knee: the edge should fall between joints." },
    [stand(0, 0)], hold("40mm  COWBOY SHOT", "TRIPOD", "MWS", (P) => rig.locked(P("ALEX"), { size: "MWS", mm: 40, deg: 25 }, 3))),
