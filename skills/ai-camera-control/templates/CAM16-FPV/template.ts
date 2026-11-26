// CAM16-FPV
// Copied from engine/cinematic/src/templates/cameras.ts (lines 96-98 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh CAM16-FPV
import * as THREE from "three";
import { planner, scenePiece, type SceneSpec, type ShotDef } from "../kit/stage";
import type { ActorSpec } from "../kit/actors";
import { around, framed, lag, leadRoom, rig } from "../kit/rigs";
import { aimFor } from "../framer";
import { buildLab } from "./lab";
import type { Piece } from "../piece";

make({ id: "CAM16-FPV", name: "FPV drone", says: "Raw speed, danger, a body moving fast through space.", use: "Chases, runs, flights through tight gaps; one burst inside an action scene.", numbers: "16–20 mm, 2–3 m behind, under a metre above the subject, weaving; the rig banks into turns.", avoid: "FPV for a whole sequence: it tires fast; cut back to a stable wide." },
    [ALEX([{ t: 0, at: [-13, 6] }, { t: 2.6, at: [-4, -3] }, { t: 5.2, at: [6, -5] }, { t: 7, at: [12, 1] }])],
    (P) => [{ start: 0, end: 7, label: "18mm  FPV RUN", rig: "FPV DRONE", subject: "ALEX", size: "WS", stop: 2.8, cam: rig.fpv(P("ALEX"), 4.2, 0.35, 18, 0.7), cut: "Opens the template", flags: ["enters-moving", "exits-moving", "centre", "compound"] }]),
