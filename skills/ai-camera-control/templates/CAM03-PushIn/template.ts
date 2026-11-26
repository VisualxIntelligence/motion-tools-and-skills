// CAM03-PushIn
// Copied from engine/cinematic/src/templates/cameras.ts (lines 36-38 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh CAM03-PushIn
import * as THREE from "three";
import { planner, scenePiece, type SceneSpec, type ShotDef } from "../kit/stage";
import type { ActorSpec } from "../kit/actors";
import { around, framed, lag, leadRoom, rig } from "../kit/rigs";
import { aimFor } from "../framer";
import { buildLab } from "./lab";
import type { Piece } from "../piece";

make({ id: "CAM03-PushIn", name: "Push in", says: "Something is dawning on them. We lean in with the thought.", use: "A realisation, a decision, rising tension; the reaction before the reveal (the Spielberg face).", numbers: "50 mm, MS to MCU over 4–8 s, about 0.15–0.4 m/s, eased, with a held frame at each end.", avoid: "Pushing on every shot: save it for the beat that turns." },
    [ALEX([{ t: 0, at: [0, 0], yaw: 0.45 }], [{ kind: "lookDown", t0: 1.2, t1: 3.4 }])],
    (P) => [{ start: 0, end: 7, label: "50mm  PUSH IN · MS TO MCU", rig: "DOLLY", subject: "ALEX", size: "MS", sizeEnd: "MCU", stop: 2, cam: rig.dolly(P("ALEX"), { size: "MS", mm: 50, deg: 28 }, "MCU", 0, 7, 0.8), cut: "Opens the template" }]),
