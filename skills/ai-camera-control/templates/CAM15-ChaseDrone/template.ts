// CAM15-ChaseDrone
// Copied from engine/cinematic/src/templates/cameras.ts (lines 92-94 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh CAM15-ChaseDrone
import * as THREE from "three";
import { planner, scenePiece, type SceneSpec, type ShotDef } from "../kit/stage";
import type { ActorSpec } from "../kit/actors";
import { around, framed, lag, leadRoom, rig } from "../kit/rigs";
import { aimFor } from "../framer";
import { buildLab } from "./lab";
import type { Piece } from "../piece";

make({ id: "CAM15-ChaseDrone", name: "Chase drone", says: "Speed and freedom: we fly with them.", use: "Flight, vehicles, big landscapes on the move; the geography wide in an action scene.", numbers: "28 mm, 18–22 m behind and 5–7 m above, matched speed, banking into turns.", avoid: "Chasing too far back: the subject becomes a dot and the speed disappears." },
    [{ id: "GLIDER", name: "Glider", kind: "flyer", tint: "plum", span: 12, path: [{ t: 0, at: [-45, 7, 34] }, { t: 4, at: [-6, 5.5, 4] }, { t: 8, at: [36, 8, -26] }] }],
    (P) => [{ start: 0, end: 8, label: "28mm  CHASE DRONE", rig: "CHASE DRONE · GIMBAL", subject: "GLIDER", size: "WS", stop: 4, cam: rig.chase(P("GLIDER"), 21, 6, 28, 2, 0.9), cut: "Opens the template", flags: ["enters-moving", "exits-moving", "centre", "compound"], shadow: 40 }]),
