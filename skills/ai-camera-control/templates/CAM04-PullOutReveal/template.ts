// CAM04-PullOutReveal
// Copied from engine/cinematic/src/templates/cameras.ts (lines 40-42 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh CAM04-PullOutReveal
import * as THREE from "three";
import { planner, scenePiece, type SceneSpec, type ShotDef } from "../kit/stage";
import type { ActorSpec } from "../kit/actors";
import { around, framed, lag, leadRoom, rig } from "../kit/rigs";
import { aimFor } from "../framer";
import { buildLab } from "./lab";
import type { Piece } from "../piece";

make({ id: "CAM04-PullOutReveal", name: "Pull out (reveal)", says: "We discover where they are, and how small they are in it.", use: "Endings, isolation, a reveal of scale or of what surrounds the subject.", numbers: "60 mm (a close-up nearer than 1.5 m distorts the face), CU to WS over 5–8 s, eased; let the world enter the frame in layers.", avoid: "Pulling out to an empty frame: the reveal needs something new at the end." },
    [ALEX([{ t: 0, at: [0, 0], yaw: 2.6 }], [{ kind: "lookUp", t0: 1.0 }])],
    (P) => [{ start: 0, end: 8, label: "60mm  PULL OUT · CU TO WS", rig: "DOLLY · TECHNOCRANE", subject: "ALEX", size: "CU", sizeEnd: "WS", stop: 2.8, cam: rig.dolly(P("ALEX"), { size: "CU", mm: 60, deg: 25 }, "WS", 0, 8, 0.7), cut: "Opens the template" }]),
