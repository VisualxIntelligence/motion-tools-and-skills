// ACT01-BulletTimeOrbit
// Copied from engine/cinematic/src/templates/action.ts (lines 212-226 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh ACT01-BulletTimeOrbit
import * as THREE from "three";
import { planner, scenePiece, speedRamp, type KitWorld, type SceneSpec, type ShotDef } from "../kit/stage";
import type { Act, Actor, ActorSpec, PathKey } from "../kit/actors";
import { around, lag, leadRoom, rig, type Subj } from "../kit/rigs";
import { aimFor, frameFor, frameHeight, SENSOR_H } from "../framer";
import { GREY, clay } from "../kit/clay";
import { broadTree, building, column, ground, pine, scatter } from "../kit/props";
import { buildLab } from "./lab";
import { clamp, lerp, ramp } from "../util";
import type { Piece } from "../piece";
import type { Cam } from "../shots";
import type { Marks } from "../marks";
import { CAMERA_INFO, type TemplateInfo } from "./cameras";

make({ id: "ACT01-BulletTimeOrbit", name: "Bullet-time orbit", says: "Time stops for this one moment: we walk round it while the world hangs.", use: "The peak of a leap, a hit or a near miss that the story turns on; once per film.", numbers: "28 mm, full shot with the block in it, world clock eased to 0.02 over 0.3 s at the apex, held 3.8 s while the camera orbits 180° (about 47°/s), eased back to real time for the landing.", avoid: "Freezing a pose that tells nothing: freeze the instant before the outcome, not after it." },
    [human("ALEX", "Alex", "ochre", A1.keys, A1.acts)],
    (P, W) => {
      const A = P("ALEX"), m0 = A(0), mm = 28, B = body(A.actor);
      const cam = (t: number): Cam => {
        const m = A(t), b = B(W(t)), mid = b.waist.clone().lerp(b.eye, 0.25);
        const deg = 70 - 180 * ramp(t, 1.55, 5.75);
        const d = (1.25 * frameHeight(m, "FS") * mm) / SENSOR_H;
        const pos = mid.clone().add(around(m0, deg).multiplyScalar(d));
        pos.y = 1.55 + 1.1 * ramp(t, 1.05, 2.0) - 1.45 * ramp(t, 5.5, 6.6);
        return { pos, target: aimFor(pos, mid, mm, [0, 0.08]), mm };
      };
      return [{ start: 0, end: 8, label: "28mm  BULLET-TIME ORBIT 180", rig: "VIRTUAL CAMERA ARRAY · ORBIT", subject: "ALEX", size: "FS", stop: 4, cam, flags: ["compound", "centre", "whip"], cut: "Opens the template", note: "PAN exempt: the tilt follows the drop to the landing. Clock 1 → 0.02 at the apex, held through the orbit, back to 1 for the landing" }];
    },
    { build: labWithBlock(0, -1.45, 1.4, 1.0, 1.2), clock: clock1 }),
