// ANG25-SecurityCam
// Copied from engine/cinematic/src/templates/angles.ts (lines 72-74 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh ANG25-SecurityCam
import * as THREE from "three";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";
import { LOCATIONS, ENVIRONMENTS } from "./locations";

make({ id: "ANG25-SecurityCam", name: "Security camera", says: "Nobody is meant to see this: a camera in a corner, a person who thinks they are alone.", use: "Surveillance, found footage, a crime seen afterwards.", numbers: "12 mm half-fisheye from a corner 3.6 m up, looking down 30 degrees, a person crossing the room.", avoid: "Cutting from it to a clean shot without a reason." },
    [ALEX([{ t: 0.3, at: [-5, 1] }, { t: 6.7, at: [4.5, -3] }])],
    () => [{ start: 0, end: 7, label: "12mm  SECURITY CAMERA", rig: "WALL MOUNT", subject: "ALEX", size: "WS", stop: 4, cam: withFish((): Cam => ({ pos: V(7, 3.6, 8), target: V(-0.5, 0.6, -1), mm: 12 }), 0.6), cut: "Opens the template", flags: ["enters-moving", "exits-moving"] }]),
