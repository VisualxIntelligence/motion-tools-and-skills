// SC04-CarInterior
// Copied from engine/cinematic/src/templates/scenes.ts (lines 122-136 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh SC04-CarInterior
import * as THREE from "three";
import { planner, scenePiece, type KitWorld, type SceneSpec, type ShotDef } from "../kit/stage";
import type { ActorSpec } from "../kit/actors";
import { GREY, clay } from "../kit/clay";
import { lag, rig } from "../kit/rigs";
import { aimFor } from "../framer";
import { asteroid, bench, broadTree, building, bush, car, carInterior, floorLamp, ground, lampPost, pine, planet, rock, room, scatter, shelf, sofa, table } from "../kit/props";
import { rng } from "../util";
import type { Piece } from "../piece";
import type { TemplateInfo } from "./cameras";

make({ id: "SC04-CarInterior", name: "Car interior", pattern: "Windshield two-shot → driver single → passenger single → POV of the road", says: "Two people trapped together in motion: intimacy, tension, a confession.", use: "Dialogue in a moving vehicle; road trips; an escape.", numbers: "Windshield two-shot 28 mm, singles 32 mm from the windshield corners (both in front: one side of the line), POV 24 mm.", avoid: "A static world outside: the road must move or the car reads as parked." },
    { sky: "day", build: buildCar, tick: tickCar, keyDir: [0.4, 0.65, 0.65],
      actors: [human("ALEX", "Alex", "ochre", [{ t: 0, at: [-0.38, 0.1, 0.06], yaw: 0 }], { acts: [{ kind: "drive", t0: -1 }], look: "SAM", lookFrom: 2.2, lookTo: 3.8 }),
        human("SAM", "Sam", "slate", [{ t: 0, at: [0.38, 0.1, 0.06], yaw: 0 }], { acts: [{ kind: "sit", t0: -1 }, { kind: "talk", t0: 6.5, t1: 10 }], look: "ALEX", lookFrom: 7.5, lookTo: 9.5 }),
        { id: "LEAD", name: "Car ahead", kind: "prop", model: "car", tint: "sand", path: [{ t: 0, at: [0.1, 24], yaw: 0 }] }] },
    (P) => {
      const W = V(0, 1.15, 2.9), D = V(0.55, 1.2, 1.75), Ps = V(-0.55, 1.2, 1.75), POV = V(0, 1.2, -0.05);
      const mid = V(0, 1.12, 0.05);
      return [
        { start: 0, end: 4, label: "28mm  WINDSHIELD TWO-SHOT", rig: "HOOD MOUNT", subject: "ALEX", size: "MS", stop: 2.8, pair: ["ALEX", "SAM"], cam: () => ({ pos: W.clone(), target: aimFor(W, mid, 28, [0, -0.06]), mm: 28 }), cut: "Opens through the windshield", flags: ["centre"] },
        { start: 4, end: 7, label: "32mm  DRIVER SINGLE", rig: "HOOD MOUNT · OFFSET", subject: "ALEX", size: "MCU", stop: 2, pair: ["ALEX", "SAM"], cam: (t) => ({ pos: D.clone(), target: aimFor(D, lag((x) => P("ALEX")(x).eye, t, 0.8), 32, [0.3, 1 / 3]), mm: 32 }), cut: "CUT to the driver from the windshield, on the passenger side" },
        { start: 7, end: 10, label: "32mm  PASSENGER SINGLE", rig: "HOOD MOUNT · OFFSET", subject: "SAM", size: "MCU", stop: 2, pair: ["ALEX", "SAM"], reverse: 2, cam: (t) => ({ pos: Ps.clone(), target: aimFor(Ps, lag((x) => P("SAM")(x).eye, t, 0.8), 32, [-0.3, 1 / 3]), mm: 32 }), cut: "CUT to the passenger: the reverse, same side of the line" },
        { start: 10, end: 13, label: "24mm  POV · THE ROAD", rig: "HANDHELD", subject: "LEAD", size: "WS", stop: 5.6, cam: () => ({ pos: POV.clone(), target: V(0, 1.0, 30), mm: 24 }), cut: "CUT to what they see: the road ahead", flags: ["centre"] },
      ];
    }),
