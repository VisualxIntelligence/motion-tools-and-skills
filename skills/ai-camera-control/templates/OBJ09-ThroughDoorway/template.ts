// OBJ09-ThroughDoorway
// Copied from engine/cinematic/src/templates/objects.ts (lines 60-65 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh OBJ09-ThroughDoorway
import * as THREE from "three";
import { planner, scenePiece, type SceneSpec, type ShotDef } from "../kit/stage";
import type { ActorSpec } from "../kit/actors";
import { lag, rig } from "../kit/rigs";
import { aimFor } from "../framer";
import { ramp, smoother } from "../util";
import { buildLab } from "./lab";
import type { Piece } from "../piece";
import { CAMERA_INFO, type TemplateInfo } from "./cameras";

make({ id: "OBJ09-ThroughDoorway", name: "Through a doorway", says: "Crossing a threshold: we enter their world, their room, their story.", use: "Entering a space, discovering someone inside, transitions from outside to in.", numbers: "28 mm, a dolly through the frame of the door over 5–7 s; the door frame wipes past the edges.", avoid: "Stopping in the doorway: the move is the crossing." },
    [prop("DOOR", "Doorway", "doorway", [0, 2], 0, "stone"), ALEX([0.3, -4.5], 0)],
    (P) => {
      const a = V(0.1, 1.55, 10), b = V(0.15, 1.55, -0.6);
      return [{ start: 0, end: 7, label: "28mm  DOLLY THROUGH DOORWAY", rig: "STEADICAM", subject: "ALEX", size: "WS", sizeEnd: "MS", stop: 4, cam: (t) => { const k = smoother(ramp(t, 0.4, 6.6)); const pos = a.clone().lerp(b, k); return { pos, target: aimFor(pos, P("ALEX")(t).eye, 28, [0, 1 / 3]), mm: 28 }; }, cut: "Opens the template", flags: ["centre"] }];
    }),
