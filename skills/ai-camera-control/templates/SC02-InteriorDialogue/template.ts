// SC02-InteriorDialogue
// Copied from engine/cinematic/src/templates/scenes.ts (lines 96-109 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh SC02-InteriorDialogue
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

make({ id: "SC02-InteriorDialogue", name: "Interior dialogue", pattern: "Master two-shot → OTS → reverse OTS → close-up at the turn → master from a new angle", says: "Two people talk; the camera tells us whose moment it is.", use: "Any two-person scene: a confession, an argument, an interview.", numbers: "Master 28 mm, OTS pair 75 mm matched, close-up 65 mm, every camera on one side of the line between them.", avoid: "Crossing the line, or cutting in to the close-up before the turn of the scene." },
    { sky: "interior", build: buildRoom, keyDir: [0.25, 0.6, -0.76], motes: { center: [0, 1.4, 0], size: [6, 2.6, 5], count: 140, drift: [0.03, 0.01, 0.02] },
      actors: [human("ALEX", "Alex", "ochre", [{ t: 0, at: [-1.45, 0.9], yaw: Math.PI / 2 }], { acts: [{ kind: "sit", t0: -1 }, { kind: "talk", t0: 7, t1: 14.5 }], look: "SAM" }),
        human("SAM", "Sam", "slate", [{ t: 0, at: [1.6, -1.2], yaw: -2.2 }], { look: "ALEX", acts: [{ kind: "talk", t0: 0, t1: 7.5 }] })] },
    (P) => {
      const mid = V(0.1, 1.15, -0.15), M1 = V(2.85, 1.55, 2.4), M2 = V(-2.3, 1.45, 2.3);
      return [
        { start: 0, end: 4, label: "24mm  MASTER TWO-SHOT", rig: "TRIPOD", subject: "SAM", size: "MWS", stop: 4, pair: ["ALEX", "SAM"], cam: () => ({ pos: M1.clone(), target: aimFor(M1, mid, 24, [0, 0]), mm: 24 }), cut: "Opens on the master", flags: ["centre"] },
        { start: 4, end: 7.5, label: "75mm  OTS · ALEX ON SAM", rig: "STEADICAM", subject: "SAM", size: "MS", stop: 2, ots: "ALEX", pair: ["ALEX", "SAM"], cam: rig.ots(P("ALEX"), P("SAM"), 75, 1, 2.4, 0.72), cut: "CUT in over her shoulder" },
        { start: 7.5, end: 11, label: "75mm  REVERSE OTS · SAM ON ALEX", rig: "STEADICAM", subject: "ALEX", size: "MS", stop: 2, ots: "SAM", pair: ["ALEX", "SAM"], reverse: 2, cam: rig.ots(P("SAM"), P("ALEX"), 75, -1, 2.4, 0.72), cut: "CUT to the reverse, same side of the line" },
        { start: 11, end: 14, label: "65mm  CLOSE-UP · THE TURN", rig: "DOLLY", subject: "ALEX", size: "MCU", sizeEnd: "CU", stop: 2, pair: ["ALEX", "SAM"], cam: rig.dolly(P("ALEX"), { size: "MCU", mm: 65, deg: -10 }, "CU", 11, 14, 0.4), cut: "CUT in tighter: the turn of the scene" },
        { start: 14, end: 17.5, label: "28mm  MASTER · NEW ANGLE", rig: "TRIPOD", subject: "SAM", size: "WS", stop: 4, pair: ["ALEX", "SAM"], cam: () => ({ pos: M2.clone(), target: aimFor(M2, mid, 28, [0, 0]), mm: 28 }), cut: "CUT back out to the master, 30°+ from the first", flags: ["centre"] },
      ];
    }),
