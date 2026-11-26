// ACT03-CrashZoomFight
// Copied from engine/cinematic/src/templates/action.ts (lines 252-278 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh ACT03-CrashZoomFight
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

make({ id: "ACT03-CrashZoomFight", name: "Crash zoom and whip (fight)", says: "That one landed: the zoom slams in on the hit and the whip throws us after the body.", use: "The decisive blow of a fight, comedy violence, a shock beat; once per sequence.", numbers: "Handheld 35 mm two-shot; crash zoom 35 → 85 mm in 0.2 s as the cross lands in the chest; hold 1 s on fist and head while the legs go; whip 0.28 s down with the fall, landing on 45 mm; cut to a low 24 mm wide on the same side of the line.", avoid: "Zooming before the blow lands (it telegraphs), or whipping to a frame that is not composed." },
    [
      human("ALEX", "Alex", "ochre", [{ t: 0, at: [-0.5, 0], yaw: Math.PI / 2 }, { t: 1.5, at: [-0.5, 0], yaw: Math.PI / 2 }, { t: 2.3, at: [-0.35, 0], yaw: Math.PI / 2 }],
        [clip("Hit_Head", 1.27, 1.75, 0.08), ...strike("Punch_Cross", 2.3, 6.0, 0.45, 0.7)]),
      human("SAM", "Sam", "slate", lying(0.5, 0, -Math.PI / 2, DEATH_LIFT, KO3),
        [...strike("Punch_Jab", 1.1, 2.45, 0.6, 0.06), clip("Hit_Chest", 2.6, 2.8, 0.04), clip("Death01", KO3, undefined, 0.12)]),
    ],
    (P) => {
      const S = P("SAM"), B = body(S.actor), A = body(P("ALEX").actor);
      const pos = V(0.05, 1.5, 3.3);
      // the two-shot's centre, the blow (Alex's fist at Sam's jaw), and the body on the floor
      const pair = (t: number) => A(t).eye.lerp(B(t).eye, 0.5).add(V(0, -0.25, 0));
      const hit = (t: number) => V(0.36, 1.38, 0).lerp(B(t).eye, 0.45);
      const zoom = (t: number): Cam => {
        const k = ramp(t, 2.42, 2.62), mm = 35 * Math.pow(85 / 35, k);
        return reaim({ pos: pos.clone(), target: aimFor(pos, pair(t), 35, [0, 0]), mm }, hit(t), [0, 0], k);
      };
      const floor = (t: number) => { const b = B(t); return b.waist.lerp(b.eye, 0.35); };
      const onFloor = (t: number): Cam => ({ pos: pos.clone(), target: aimFor(pos, floor(t), 45, [0.05, -0.05]), mm: 45 });
      const low = V(2.6, 0.35, 2.4);
      return [
        { start: 0, end: 5, label: "35>85mm  CRASH ZOOM · WHIP TO FALL", rig: "HANDHELD", subject: "SAM", size: "MWS", sizeEnd: "WS", stop: 2.8, pair: ["ALEX", "SAM"],
          cam: rig.whip(zoom, onFloor, 3.62, 0.28), flags: ["whip", "compound", "short-side"], cut: "Opens the template", note: "Crash zoom 2.42–2.62 as the cross lands; whip 3.62–3.90 with the fall" },
        { start: 5, end: 7.5, label: "24mm  LOW WIDE · STANDING OVER", rig: "TRIPOD", subject: "ALEX", size: "FS", stop: 4, pair: ["ALEX", "SAM"],
          cam: () => ({ pos: low.clone(), target: aimFor(low, V(0.35, 0.8, 0), 24, [0, 0.05]), mm: 24 }), flags: ["centre"], cut: "CUT on the stillness after the fall: same side of the line, low and wide" },
      ];
    }),
