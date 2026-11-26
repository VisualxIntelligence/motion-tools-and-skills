// SC01-ForestClearing
// Copied from engine/cinematic/src/templates/scenes.ts (lines 84-94 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh SC01-ForestClearing
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

make({ id: "SC01-ForestClearing", name: "Forest clearing", pattern: "Arrival → follow → reaction push → reverse on the discovery → release", says: "A person arrives somewhere and finds something.", use: "Openings, discoveries, any scene where a character enters a new place.", numbers: "Crane down 28 mm, Steadicam follow 32 mm, push-in 50 mm MCU→CU, reverse OTS 50 mm, crane up 24 mm.", avoid: "Showing the discovery before the reaction: the face comes first (rulebook §5)." },
    { sky: "day", build: buildForest, keyDir: [-0.5, 0.72, 0.42], motes: { center: [0, 2.5, 6], size: [30, 6, 30], count: 220 },
      actors: [human("ALEX", "Alex", "ochre", [{ t: 0.3, at: [0.5, 17.6] }, { t: 10.3, at: [0.4, 3.8], yaw: Math.PI }], { acts: [{ kind: "lookUp", t0: 10.6, t1: 13.6 }] }),
        { id: "STONE", name: "Standing stone", kind: "prop", model: "monolith", tint: "plum", path: [{ t: 0, at: [0, -3.5], yaw: 0 }] }] },
    (P) => [
      { start: 0, end: 5, label: "28mm  CRANE DOWN · ARRIVAL", rig: "TECHNOCRANE", subject: "ALEX", size: "EWS", sizeEnd: "WS", stop: 5.6, cam: rig.crane(P("ALEX"), { size: "WS", mm: 28, deg: 200 }, 5.5, 1.2, 0, 5, 1.25), cut: "FADE IN on the forest", flags: ["compound", "exits-moving"] },
      { start: 5, end: 10, label: "32mm  STEADICAM FOLLOW", rig: "STEADICAM", subject: "ALEX", size: "MWS", stop: 2.8, cam: rig.follow(P("ALEX"), { size: "MWS", mm: 32, deg: 180, rise: 0.2 }), cut: "CUT in behind her: same direction of travel", flags: ["enters-moving", "exits-moving", "centre"] },
      { start: 10, end: 13.5, label: "55mm  PUSH IN · REACTION", rig: "DOLLY", subject: "ALEX", size: "MCU", sizeEnd: "CU", stop: 2, cam: rig.dolly(P("ALEX"), { size: "MCU", mm: 55, deg: 18 }, "CU", 10, 13.5, 0.4), cut: "CUT round to her face: she stops and looks up" },
      { start: 13.5, end: 17.5, label: "50mm  REVERSE OTS · THE STONE", rig: "STEADICAM", subject: "STONE", size: "FS", stop: 2.8, ots: "ALEX", cam: rig.ots(P("ALEX"), P("STONE"), 50, 1, 2.4, 0.6), cut: "CUT to what she sees, over her shoulder", flags: ["centre"] },
      { start: 17.5, end: 22, label: "24mm  CRANE UP · RELEASE", rig: "TECHNOCRANE", subject: "ALEX", size: "WS", sizeEnd: "EWS", stop: 5.6, cam: rig.crane(P("ALEX"), { size: "WS", mm: 24, deg: 150 }, 0.8, 11, 17.5, 22, 1.8), cut: "CUT wide: the release", flags: ["compound"] },
    ]),
