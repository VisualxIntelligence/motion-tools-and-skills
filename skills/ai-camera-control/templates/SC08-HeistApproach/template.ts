// SC08-HeistApproach
// Copied from engine/cinematic/src/templates/scenes2.ts (lines 338-360 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh SC08-HeistApproach
import * as THREE from "three";
import { planner, scenePiece, speedRamp, type KitWorld, type SceneSpec, type ShotDef } from "../kit/stage";
import type { ActorSpec } from "../kit/actors";
import { GREY, clay, shadeAll } from "../kit/clay";
import { around, lag, rig, type Subj } from "../kit/rigs";
import { RIG_POSES } from "../kit/rig";
import { BakedSet } from "../kit/physics";
import { aimFor } from "../framer";
import { barrel, building, crate, ground, lampPost, shelf } from "../kit/props";
import { rng, smoother, ramp, lerp } from "../util";
import type { Piece } from "../piece";
import type { Cam } from "../shots";
import type { TemplateInfo } from "./cameras";
import { SCENE_INFO } from "./scenes";
import { BLAST, BRICK_AT, CAR_KEYS, CRASH, KB_IN, KEGS, KNOCK, densePath, kbLift, phys } from "./physics-specs";

make({ id: "SC08-HeistApproach", name: "Heist approach", pattern: "Crane over the wall → crouch-walk tracking → locked at the door → POV through the doorway → hold on the lookout → high wide as he slips in",
    says: "Getting in unseen: the wall, the walk, the door, and the one who keeps watch.", use: "Heists, infiltrations, stealth, any scene where being seen is the threat.",
    numbers: "Crane over the wall 28 mm from 5.3 m outside to 2.1 m inside, tracking 40 mm on the crouch-walk (0.72 m/s, paced to the clip), locked 32 mm at the door, POV 32 mm handheld at crouched eye height, the door frame in the frame, lookout hold 85 mm, high wide 40 mm from over the wall.",
    avoid: "Showing the guard before the POV: the doorway is where we learn he is there." },
    { sky: "dusk", build: buildCompound, keyDir: [0.6, 0.55, -0.6], motes: { center: [0, 1.5, -5], size: [20, 3, 16], count: 220, drift: [0.06, 0.01, -0.04] },
      actors: [
        human("NYX", "Nyx", "sage", nyxPath, { acts: [clip("Crouch_Fwd_Loop", -2, NYX_AT, 0.15), clip("Crouch_Idle_Loop", NYX_AT + 0.05, 15.8, 0.3)] }),
        human("ASH", "Ash", "plum", ashPath, { acts: [clip("Crouch_Fwd_Loop", -2, ASH_AT, 0.15)], look: [-7.5, 1.3, 0.6], lookFrom: 14.5 }),
        human("GUARD", "Guard", "rose", walkPath([{ t0: 6.2, t1: 17.4, from: [9.6, -14.6], to: [-1.8, -14.6] }], -1, 21)),
      ] },
    (P) => {
      const crouchN = (t: number) => (t < 15.8 ? 1 : 1 - smoother((t - 15.8) / 0.4)), crouchA = (t: number) => (t < ASH_AT ? 1 : 1 - smoother((t - ASH_AT) / 0.3));
      const N = lowered(P("NYX"), crouchN), A = lowered(P("ASH"), crouchA), G = P("GUARD");
      const POV = V(2, 0.95, -7.98), HIGH = V(-6, 5.2, 1.6), C0 = V(-6.8, 4.95, 3.4), C1 = V(-5.4, 2.4, -1.4);
      return [
        { start: 0, end: 4.5, label: "28mm  CRANE OVER THE WALL", rig: "TECHNOCRANE", subject: "NYX", size: "WS", stop: 2.8, cam: (t) => { const pos = C0.clone().lerp(C1, smoother(ramp(t, 0.35, 4.25))), e = lag((x) => N(x).eye, t, 0.3); return { pos, target: aimFor(pos, e, 28, [0, 0]), mm: 28 }; }, cut: "Opens outside the wall: the crane rises over it and drops in on them", flags: ["compound", "centre"] },
        { start: 4.5, end: 7.8, label: "40mm  TRACKING · CROUCH-WALK", rig: "DOLLY · HANDHELD HEAD", subject: "NYX", size: "FS", stop: 2, cam: rig.shake(rig.track(N, { size: "FS", mm: 40, rise: 0.25 }, -1, 0.5), 1, 7), cut: "CUT down beside him: low, at their pace", flags: ["enters-moving", "exits-moving"] },
        { start: 7.8, end: 11.0, label: "32mm  LOCKED · THE DOOR", rig: "TRIPOD", subject: "NYX", size: "FS", stop: 2.8, cam: rig.locked(N, { size: "FS", mm: 32, deg: -85, rise: 0.25 }, 10.6), cut: "CUT ahead to the door: he crouch-walks into his frame and stops on his mark", flags: ["centre"] },
        { start: 11.0, end: 14.0, label: "32mm  POV · THROUGH THE DOORWAY", rig: "HANDHELD", subject: "GUARD", size: "WS", stop: 2, cam: rig.shake((t) => { const look = V(2, 1.2, -16).lerp(lag((x) => G(x).eye, t, 0.8), 0.45); return { pos: POV.clone(), target: aimFor(POV, look, 32, [0, 0]), mm: 32 }; }, 1.2, 9), cut: "CUT to what he sees: someone inside", flags: ["centre"] },
        { start: 14.0, end: 16.4, label: "85mm  HOLD · THE LOOKOUT", rig: "TRIPOD", subject: "ASH", size: "MCU", stop: 2, cam: rig.locked(drop(A, 0.03), { size: "MCU", mm: 85, deg: 70, rise: 0 }, 14.0), cut: "CUT to her: she holds, then her head turns to the gate" },
        { start: 16.4, end: 19.25, label: "40mm  HIGH WIDE · IN", rig: "TECHNOCRANE · LOCKED", subject: (t) => (t < 18.4 ? "NYX" : "ASH"), size: "WS", stop: 4, cam: fixed(HIGH, V(0.6, 0.9, -9.6), 40), cut: "CUT high over the wall: he rises and slips into the dark; she stays", flags: ["centre"] },
      ];
    }),
