// ACT06-HeroLowArc
// Copied from engine/cinematic/src/templates/action.ts (lines 308-317 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh ACT06-HeroLowArc
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

make({ id: "ACT06-HeroLowArc", name: "Hero low arc", says: "Here they come: bigger than life, and time bends round them.", use: "The hero's entrance, the walk to the fight, the team reveal.", numbers: "21 mm, lens 0.45 m off the ground, medium-wide looking up about 30°; an 80° arc round the front at a steady 9°/s; world clock eased to 0.3 for 1.5 s at the middle of the arc.", avoid: "Speed-ramping a walk with nothing else moving: the dust and the camera must keep real time to sell it." },
    [human("ALEX", "Alex", "ochre", A6)],
    (P) => [{ start: 0, end: 8, label: "21mm  LOW ARC · SPEED RAMP", rig: "STEADICAM · LOW MODE", subject: "ALEX", size: "MWS", stop: 2.8, cam: (t) => {
      // an arc round the front at a held size; the move is eased over a longer span than the shot so it never stalls in it
      const A = P("ALEX"), m = A(t), deg = lerp(40, -40, clamp((t + 0.5) / 9));
      const c = frameFor(m, { size: "MWS", mm: 21, from: around(A(0), deg), rise: -1.19 });
      const pos = m.eye.clone().add(c.pos.clone().sub(m.eye).multiplyScalar(1.12));
      return { pos, target: aimFor(pos, m.eye, 21, [0, 0.45]), mm: 21 };
    }, flags: ["compound", "centre", "enters-moving", "exits-moving"], cut: "Opens the template", note: "Clock 0.3 from 3.3 to 4.8 s" }],
    { clock: clock6 }),
