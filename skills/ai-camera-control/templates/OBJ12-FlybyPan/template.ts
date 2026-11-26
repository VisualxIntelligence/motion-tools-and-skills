// OBJ12-FlybyPan
// Copied from engine/cinematic/src/templates/objects.ts (lines 75-80 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh OBJ12-FlybyPan
import * as THREE from "three";
import { planner, scenePiece, type SceneSpec, type ShotDef } from "../kit/stage";
import type { ActorSpec } from "../kit/actors";
import { lag, rig } from "../kit/rigs";
import { aimFor } from "../framer";
import { ramp, smoother } from "../util";
import { buildLab } from "./lab";
import type { Piece } from "../piece";
import { CAMERA_INFO, type TemplateInfo } from "./cameras";

make({ id: "OBJ12-FlybyPan", name: "Flyby pan", says: "It roars past us: speed, scale, a near miss.", use: "Spacecraft, planes, trains or cars passing the camera; a beat of spectacle.", numbers: "35 mm on a fixed head, panning with a subject at 20+ m/s that passes within 10–15 m.", avoid: "Leading the subject off-frame: let it pass through and exit." },
    [{ id: "SHIP", name: "Spacecraft", kind: "prop", model: "ship", tint: "plum", path: [{ t: 0, at: [-70, 7, -18] }, { t: 6, at: [70, 9, 6] }] }],
    (P) => {
      const pos = V(0, 1.8, 14);
      return [{ start: 0, end: 6, label: "35mm  FLYBY PAN", rig: "TRIPOD · FLUID HEAD", subject: "SHIP", size: "WS", stop: 5.6, cam: (t) => { const e = lag((x) => P("SHIP")(x).eye, t, 0.12); return { pos: pos.clone(), target: aimFor(pos, e, 35, [0, 0]), mm: 35 }; }, cut: "Opens the template", flags: ["centre", "enters-moving", "exits-moving", "compound"], shadow: 40 }];
    }),
