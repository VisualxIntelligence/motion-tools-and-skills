// CAM13-WhipPan
// Copied from engine/cinematic/src/templates/cameras.ts (lines 79-86 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh CAM13-WhipPan
import * as THREE from "three";
import { planner, scenePiece, type SceneSpec, type ShotDef } from "../kit/stage";
import type { ActorSpec } from "../kit/actors";
import { around, framed, lag, leadRoom, rig } from "../kit/rigs";
import { aimFor } from "../framer";
import { buildLab } from "./lab";
import type { Piece } from "../piece";

make({ id: "CAM13-WhipPan", name: "Whip pan", says: "Sudden attention: something pulls our eyes, or one thought snaps to another.", use: "Joining two people or places with energy; a hidden cut; comedy timing.", numbers: "50 mm, a 0.3–0.4 s swing between two held frames; the motion blur carries the join.", avoid: "Whipping to a frame that is not composed: the landing must be a clean shot." },
    [ALEX([{ t: 0, at: [-3.2, -1], yaw: Math.PI / 2 }], undefined, "SAM"), SAM([{ t: 0, at: [3.2, -1], yaw: -Math.PI / 2 }], undefined, "ALEX")],
    (P) => {
      const pos = V(0, 1.6, 1.7);
      const onA = (t: number) => ({ pos: pos.clone(), target: aimFor(pos, P("ALEX")(t).eye, 50, [0.2, 1 / 3]), mm: 50 });
      const onB = (t: number) => ({ pos: pos.clone(), target: aimFor(pos, P("SAM")(t).eye, 50, [-0.2, 1 / 3]), mm: 50 });
      return [{ start: 0, end: 6, label: "50mm  WHIP PAN · ALEX TO SAM", rig: "TRIPOD · FLUID HEAD", subject: (t) => (t < 2.75 ? "ALEX" : "SAM"), size: "MS", stop: 2.8, cam: rig.whip(onA, onB, 2.6, 0.36), flags: ["whip", "short-side"], cut: "Opens the template" }];
    }),
