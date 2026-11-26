// ACT05-ParkourTrack
// Copied from engine/cinematic/src/templates/action.ts (lines 294-305 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh ACT05-ParkourTrack
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

make({ id: "ACT05-ParkourTrack", name: "Parkour track", says: "We run with them and see the whole body solve the obstacle: skill, speed, flow.", use: "Chases on foot, parkour, any action where the body's line through the set is the point.", numbers: "35 mm full shot side-on, a real tracking-vehicle move (track_alongside_1, E.T. dataset) scaled to 5 m off; the rig does not hop with the runner (height smoothed over 1.4 s).", avoid: "Cutting the move into pieces: one side-on take shows that the stunt was real." },
    [human("ALEX", "Alex", "ochre", A5.keys, [clip("ClimbUp_1m", A5.tc, A5.tc + 0.67, 0.12), clip("NinjaJump_Idle_Loop", A5.te + 0.02, A5.tl - 0.1, 0.1), clip("Roll", A5.tl - 0.04, A5.tl + 0.68, 0.12)])],
    (P) => [{ start: 0, end: 7, label: "35mm  TRACKING · CLIMB, DROP, ROLL", rig: "TRACKING VEHICLE · REMOTE HEAD", subject: "ALEX", size: "FS", stop: 4, cam: (() => {
      // the vehicle's path is a real operator's (track_alongside_1); the remote head keeps the body framed, a beat behind
      const S = P("ALEX"), B = body(S.actor), F = rig.filmPath("track_alongside_1", settle(S), { size: "FS", mm: 35, deg: -25, rise: -1.4 }, 0);
      return (t: number): Cam => { const c = F(t), p = lag((x) => { const b = B(x); return b.waist.lerp(b.eye, 0.15); }, t, 0.3); return { ...c, target: aimFor(c.pos, p, c.mm, [leadRoom(c.pos, S(t), 0.18)[0], 0]) }; };
    })(), flags: ["enters-moving", "exits-moving", "compound", "whip"], cut: "Opens the template", note: "PAN exempt: the head follows the drop off the block" }],
    { build: (k) => {
      labWithBlock(A5.block.x, A5.z, A5.block.w, 1.0, 1.4)(k);
      // set dressing: the lamp post at the end of the run-out stands in the swing of the runner's arm; move it off the lane
      for (const o of k.scene.children) if (Math.abs(o.position.x - 16.5) < 0.05 && Math.abs(o.position.z - 2) < 0.05) o.position.z += 1.2;
    } }),
