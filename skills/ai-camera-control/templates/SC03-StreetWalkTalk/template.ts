// SC03-StreetWalkTalk
// Copied from engine/cinematic/src/templates/scenes.ts (lines 111-120 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh SC03-StreetWalkTalk
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

make({ id: "SC03-StreetWalkTalk", name: "Street walk-and-talk", pattern: "High establishing → Steadicam lead two-shot → tracking single → low-angle wide", says: "Two people on the move, talking; the city carries on around them.", use: "Walk-and-talks, chases on foot, arrivals in a city.", numbers: "Establishing 24 mm from 8 m up over the road, lead 32 mm, long-lens tracking 85 mm from across the road (over the parked cars), low wide 20 mm.", avoid: "Losing screen direction: they keep walking the same way in every shot." },
    { sky: "day", build: buildStreet, keyDir: [0.55, 0.7, 0.45], motes: { center: [5, 2, 4], size: [24, 5, 40], count: 200 },
      actors: [human("ALEX", "Alex", "ochre", [{ t: 0.2, at: [6.7, 14] }, { t: 14.6, at: [6.7, -6.5] }], { look: "SAM", lookFrom: 4, lookTo: 7 }),
        human("SAM", "Sam", "slate", [{ t: 0.2, at: [7.55, 14.4] }, { t: 14.6, at: [7.55, -6.1] }], { look: "ALEX", lookFrom: 8, lookTo: 11 })] },
    (P) => [
      { start: 0, end: 4, label: "24mm  HIGH ESTABLISHING", rig: "TECHNOCRANE", subject: "ALEX", size: "WS", stop: 5.6, cam: () => { const pos = V(2.2, 9.5, 27); return { pos, target: V(5.8, 1, 4), mm: 24 }; }, cut: "Opens high on the street", flags: ["centre"] },
      { start: 4, end: 8, label: "32mm  STEADICAM LEAD · TWO-SHOT", rig: "STEADICAM", subject: "ALEX", size: "FS", stop: 2.8, cam: rig.follow(P("ALEX"), { size: "FS", mm: 32, deg: 18, rise: 0.05 }), cut: "CUT to the front: they walk at us", flags: ["enters-moving", "exits-moving", "short-side"] },
      { start: 8, end: 11, label: "85mm  LONG-LENS TRACKING", rig: "CAMERA CAR · ACROSS THE ROAD", subject: "ALEX", size: "MS", stop: 2.8, cam: rig.track(P("ALEX"), { size: "MS", mm: 85, rise: 0.55 }, 1, 0.6), cut: "CUT to the side: same direction of travel", flags: ["enters-moving", "exits-moving"] },
      { start: 11, end: 14.5, label: "20mm  LOW-ANGLE WIDE", rig: "TRIPOD · LOW HAT", subject: "ALEX", size: "WS", stop: 4, cam: rig.locked(P("ALEX"), { size: "FS", mm: 20, deg: -25, rise: -0.62 }, 13.8), cut: "CUT low ahead of them: they walk into the frame", flags: ["centre"] },
    ]),
