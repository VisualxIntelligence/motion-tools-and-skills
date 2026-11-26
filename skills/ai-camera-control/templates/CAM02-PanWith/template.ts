// CAM02-PanWith
// Copied from engine/cinematic/src/templates/cameras.ts (lines 29-34 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh CAM02-PanWith
import * as THREE from "three";
import { planner, scenePiece, type SceneSpec, type ShotDef } from "../kit/stage";
import type { ActorSpec } from "../kit/actors";
import { around, framed, lag, leadRoom, rig } from "../kit/rigs";
import { aimFor } from "../framer";
import { buildLab } from "./lab";
import type { Piece } from "../piece";

make({ id: "CAM02-PanWith", name: "Pan with", says: "We are standing in the world, turning our head to follow someone.", use: "Following a crossing from one spot; showing where someone goes; a reveal by turning.", numbers: "Fixed position, 50 mm. A pan that holds the subject may run faster than the frame width ÷ 7 s rule; the background must not judder.", avoid: "Panning across nothing: always pan with a motivated subject or look." },
    [ALEX([{ t: 0.3, at: [-3.8, -2.0] }, { t: 6.7, at: [3.6, 2.1] }])],
    (P) => {
      const pos = V(7.5, 1.6, 12.5), A = P("ALEX");
      return [{ start: 0, end: 7, label: "50mm  PAN WITH", rig: "TRIPOD · FLUID HEAD", subject: "ALEX", size: "FS", stop: 4, cam: (t) => { const e = lag((x) => A(x).eye, t, 0.1); return { pos: pos.clone(), target: aimFor(pos, e, 50, leadRoom(pos, A(t), 0.22)), mm: 50 }; }, cut: "Opens the template", flags: ["exits-moving"] }];
    }),
