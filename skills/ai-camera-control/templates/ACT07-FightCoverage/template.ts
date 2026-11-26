// ACT07-FightCoverage
// Copied from engine/cinematic/src/templates/action.ts (lines 320-342 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh ACT07-FightCoverage
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

make({ id: "ACT07-FightCoverage", name: "Fight coverage", says: "Who hits whom, in order: a wide for the geography, then closer as the fight decides itself.", use: "Any short exchange of blows: master, the pair of overs, an insert on the blow that matters.", numbers: "28 mm handheld master (real operator drift, handheld_drift_1), a 50 mm OTS on Alex, an 85 mm insert on the jab, a 32 mm single on Sam for the knockdown, all from one side of the line; cut on the start of each blow, never during it.", avoid: "Cutting before a blow completes, or crossing the line: the audience loses who is hitting." },
    [
      human("ALEX", "Alex", "ochre", [{ t: 0, at: [-0.5, 0], yaw: Math.PI / 2 }, { t: 1.8, at: [-0.5, 0], yaw: Math.PI / 2 }, { t: 2.3, at: [-0.43, 0], yaw: Math.PI / 2 }, { t: 6, at: [-0.43, 0], yaw: Math.PI / 2 }],
        [clip("Hit_Head", 1.38, 1.85, 0.08), ...strike("Punch_Cross", 2.3, 3.5, 0.45, 0.1), clip("Punch_Jab", 3.6, 4.2, 0.1), ...strike("Punch_Cross", 4.3, 6.6, 0.1, 0.7)]),
      human("SAM", "Sam", "slate", lying(0.5, 0, -Math.PI / 2, KNOCK_LIFT, KO7),
        [...strike("Punch_Jab", 1.2, 2.45, 0.6, 0.1), clip("Hit_Chest", 2.55, 3.6, 0.1), clip("Hit_Head", 3.78, KO7 - 0.03, 0.08), clip("Hit_Knockback", KO7, undefined, 0.03)]),
    ],
    (P) => {
      const S = P("SAM"), B = body(S.actor), A = body(P("ALEX").actor);
      const drift = rig.filmPath("handheld_drift_1", P("ALEX"), { size: "FS", mm: 28, deg: 90, rise: -0.6 }, 0);
      const master = (t: number): Cam => { const c = drift(t); return { ...c, target: aimFor(c.pos, A(t).waist.lerp(B(t).waist, 0.5).add(V(0, 0.1, 0)), c.mm, [0, 0]) }; };
      const ots2 = rig.ots(S, P("ALEX"), 50, -1, 2.6, 2.0), aim2 = A(2.3).eye;
      const ins = V(-0.8, 1.5, 2.95);
      const single = V(-0.5, 1.55, 2.6);
      const down = (t: number) => { const b = B(t); return b.waist.lerp(b.eye, 0.4); };
      return [
        { start: 0, end: 2.25, label: "28mm  WIDE MASTER · HANDHELD", rig: "HANDHELD", subject: "ALEX", size: "FS", stop: 4, pair: ["ALEX", "SAM"], cam: master, flags: ["compound", "centre", "enters-moving", "exits-moving"], cut: "Opens the template: the jab lands in the wide" },
        { start: 2.25, end: 3.55, label: "50mm  OTS · SAM ON ALEX", rig: "HANDHELD", subject: "ALEX", size: "MS", stop: 2.8, ots: "SAM", pair: ["ALEX", "SAM"], cam: (t) => { const c = ots2(t); return { ...c, target: aimFor(c.pos, aim2, 50, [-0.3, 0.42]) }; }, cut: "CUT on Alex starting the cross" },
        { start: 3.55, end: 4.25, label: "85mm  INSERT · THE JAB LANDS", rig: "TRIPOD", subject: "SAM", size: "INSERT", stop: 2, cam: () => ({ pos: ins.clone(), target: aimFor(ins, V(0.4, 1.52, 0), 85, [0.25, 0]), mm: 85 }), flags: ["short-side"], cut: "CUT on the jab's start, tight on where it lands" },
        { start: 4.25, end: 7.25, label: "32mm  SINGLE · SAM GOES DOWN", rig: "HANDHELD", subject: "SAM", size: "MWS", sizeEnd: "WS", stop: 2.8, pair: ["ALEX", "SAM"],
          cam: (t) => { const c: Cam = { pos: single.clone(), target: aimFor(single, B(t).eye, 32, [0.25, 0.45]), mm: 32 }; return reaim(c, down(t), [0.1, -0.1], ramp(t, 4.62, 5.25)); }, flags: ["compound", "whip", "short-side", "enters-moving"], note: "PAN exempt: the head follows the body down", cut: "CUT on the final cross's start: Sam's single takes him down" },
      ];
    }),
