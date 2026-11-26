// CAM12-OTSPair
// Copied from engine/cinematic/src/templates/cameras.ts (lines 72-77 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh CAM12-OTSPair
import * as THREE from "three";
import { planner, scenePiece, type SceneSpec, type ShotDef } from "../kit/stage";
import type { ActorSpec } from "../kit/actors";
import { around, framed, lag, leadRoom, rig } from "../kit/rigs";
import { aimFor } from "../framer";
import { buildLab } from "./lab";
import type { Piece } from "../piece";

make({ id: "CAM12-OTSPair", name: "Over the shoulder (pair)", says: "A conversation: whose turn it is, who holds the power.", use: "Dialogue coverage: master, then OTS pair, then singles.", numbers: "75 mm both ways from about 3.5 m behind the shoulder (a long lens keeps the shoulder to about a quarter of the frame), both cameras on one side of the line, matched distance.", avoid: "Crossing the line between them, or a shoulder that fills half the frame." },
    [ALEX([{ t: 0, at: [-1.1, 0], yaw: Math.PI / 2 }], undefined, "SAM"), SAM([{ t: 0, at: [1.1, 0], yaw: -Math.PI / 2 }], undefined, "ALEX")],
    (P) => [
      { start: 0, end: 3.5, label: "75mm  OTS · ALEX ON SAM", rig: "STEADICAM", subject: "SAM", size: "MCU", stop: 2, ots: "ALEX", pair: ["ALEX", "SAM"], cam: rig.ots(P("ALEX"), P("SAM"), 75, 1, 3.6, 0.6), cut: "Opens the template" },
      { start: 3.5, end: 7, label: "75mm  REVERSE OTS · SAM ON ALEX", rig: "STEADICAM", subject: "ALEX", size: "MCU", stop: 2, ots: "SAM", pair: ["ALEX", "SAM"], reverse: 1, cam: rig.ots(P("SAM"), P("ALEX"), 75, -1, 3.6, 0.6), cut: "CUT to the reverse, same side of the line" },
    ]),
