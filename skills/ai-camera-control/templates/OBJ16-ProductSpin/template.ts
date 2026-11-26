// OBJ16-ProductSpin
// Copied from engine/cinematic/src/templates/oners.ts (lines 319-327 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh OBJ16-ProductSpin
import * as THREE from "three";
import { planner, scenePiece, type KitWorld, type SceneSpec, type ShotDef } from "../kit/stage";
import type { ActorSpec, PathKey } from "../kit/actors";
import { GREY, clay, shadeAll } from "../kit/clay";
import { framed, lag, rig, type Subj } from "../kit/rigs";
import { aimFor } from "../framer";
import { barrel, bench, broadTree, building, crate, floorLamp, ground, lampPost, pine, rock, scatter, shelf, sofa, table } from "../kit/props";
import { buildLab } from "./lab";
import { lerp, ramp, rng, smooth, smoother } from "../util";
import type { Marks } from "../marks";
import type { Piece } from "../piece";
import type { Cam } from "../shots";
import { CAMERA_INFO, type TemplateInfo } from "./cameras";

make({ id: "OBJ16-ProductSpin", name: "Product spin", says: "Look at it from every side, fast, then let it settle: this is the one.", use: "Product and vehicle reveals, the hero object of an ad, the end card before a logo.", numbers: "40 mm low (0.9 m, just under the roofline), the turntable arriving at 0.9 rev/s and braking on a cubic to a dead stop at 4.7 s, while the camera creeps 1.2 m in; held 1.8 s on the three-quarter front.", avoid: "A spin that stops on a side-on or a rear angle: the brake lands on the beauty angle, decided first." },
    { sky: "studio", build: buildStudio, tick: tickSpin, keyDir: [-0.6, 0.72, 0.35], motes: { center: [0, 2, 0], size: [14, 4, 14], count: 140 } },
    [{ id: "CAR", name: "Car", kind: "prop", model: "car", tint: "slate", path: [{ t: 0, at: [0, 0], yaw: SPIN_END }] }],
    () => {
      const a = V(5.5, 0.95, 9.0), b = V(4.85, 0.85, 7.95), aim = V(0, 0.78, 0);
      return [{ start: 0, end: 7, label: "40mm  TURNTABLE SPIN > BEAUTY", rig: "DOLLY · LOW HAT", subject: "CAR", size: "WS", sizeEnd: "WS", stop: 4,
        cam: (t) => { const k = smoother(ramp(t, 0, 5.2)), pos = a.clone().lerp(b, k); return { pos, target: aimFor(pos, aim, 40, [0, -0.12]), mm: 40 }; },
        cut: "Opens the template", flags: ["centre", "enters-moving"] }];
    }),
