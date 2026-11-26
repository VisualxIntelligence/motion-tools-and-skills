// CAM10-SteadicamLead
// Copied from engine/cinematic/src/templates/cameras.ts (lines 64-66 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh CAM10-SteadicamLead
import * as THREE from "three";
import { planner, scenePiece, type SceneSpec, type ShotDef } from "../kit/stage";
import type { ActorSpec } from "../kit/actors";
import { around, framed, lag, leadRoom, rig } from "../kit/rigs";
import { aimFor } from "../framer";
import { buildLab } from "./lab";
import type { Piece } from "../piece";

make({ id: "CAM10-SteadicamLead", name: "Steadicam lead", says: "They are coming at us: purpose, confrontation, a walk-and-talk.", use: "Walk-and-talks, a character striding with intent, an approach.", numbers: "40 mm, MS from the front, the operator walking backwards at the subject's pace.", avoid: "Leading with nothing ahead of them in their eyeline: they need somewhere to look." },
    [ALEX([{ t: 0.3, at: [0, -7] }, { t: 7, at: [0, 2.4] }])],
    (P) => [{ start: 0, end: 7, label: "40mm  STEADICAM LEAD", rig: "STEADICAM", subject: "ALEX", size: "MS", stop: 2.8, cam: rig.follow(P("ALEX"), { size: "MS", mm: 40, deg: 0, rise: 0.05 }), cut: "Opens the template", flags: ["enters-moving", "exits-moving", "centre"] }]),
