// CAM11-TrackingSide
// Copied from engine/cinematic/src/templates/cameras.ts (lines 68-70 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh CAM11-TrackingSide
import * as THREE from "three";
import { planner, scenePiece, type SceneSpec, type ShotDef } from "../kit/stage";
import type { ActorSpec } from "../kit/actors";
import { around, framed, lag, leadRoom, rig } from "../kit/rigs";
import { aimFor } from "../framer";
import { buildLab } from "./lab";
import type { Piece } from "../piece";

make({ id: "CAM11-TrackingSide", name: "Tracking alongside", says: "We travel with them as an equal; the world streams past behind.", use: "Journeys, chases, conversations on the move; showing speed with foreground passing.", numbers: "50 mm, MS side-on, matched speed, leading the subject by half a metre.", avoid: "Losing lead room: keep space in front of the subject." },
    [ALEX([{ t: 0.3, at: [-6.5, 4] }, { t: 7, at: [3, 4] }])],
    (P) => [{ start: 0, end: 7, label: "50mm  TRACKING ALONGSIDE", rig: "DOLLY · TRACK", subject: "ALEX", size: "MS", stop: 2.8, cam: rig.track(P("ALEX"), { size: "MS", mm: 50, rise: 0.05 }, -1, 0.5), cut: "Opens the template", flags: ["enters-moving", "exits-moving"] }]),
