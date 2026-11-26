// OBJ13-MacroSlider
// Copied from engine/cinematic/src/templates/oners.ts (lines 282-287 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh OBJ13-MacroSlider
import * as THREE from "three";
import { planner, scenePiece, type KitWorld, type SceneSpec, type ShotDef } from "../kit/stage";
import type { ActorSpec, PathKey } from "../kit/actors";
import { GREY, clay, shadeAll } from "../kit/clay";
import { framed, lag, rig, type Subj } from "../kit/rigs";
import { aimFor } from "../framer";
import { barrel, bench, broadTree, building, crate, floorLamp, ground, lampPost, pine, rock, scatter, shelf, sofa, table } from "../kit/props";
import { buildLab } from "./lab";
import { lerp, ramp, rng, smooth, smoother } from "../util";
import type { Marks } from "../marks";
import type { Piece } from "../piece";
import type { Cam } from "../shots";
import { CAMERA_INFO, type TemplateInfo } from "./cameras";

make({ id: "OBJ13-MacroSlider", name: "Macro slider", says: "Look closely: a small thing, made precious by the time we take over it.", use: "Product details, clues, keepsakes; the insert before someone opens or takes it.", numbers: "100 mm at T2, the lens 0.25 m above the case top and 4.2 m from it (the case half the frame width), a 0.72 m slide over 7 s (0.08 m/s, a creep) with the aim held parallel, so the case drifts across a third of the frame; bottles 2.7 m from the lens pass through the bottom of the frame as soft shapes.", avoid: "Sliding past nothing: without foreground or background layers a slider reads as a pan." },
    { ...LAB, build: buildSlider, motes: { center: [0, 0.7, 0.6], size: [4, 1.2, 4], count: 160, drift: [0.02, 0.006, 0.01] } },
    [{ id: "CASE", name: "Suitcase", kind: "prop", model: "suitcase", tint: "rose", path: [{ t: 0, at: [0.02, 0.68, 0.0], yaw: 0.55 }] }],
    () => [{ start: 0, end: 7, label: "100mm  MACRO SLIDER", rig: "SLIDER", subject: "CASE", size: "INSERT", stop: 2, shadow: 4,
      cam: rig.truck(V(-0.36, 1.25, 4.2), V(0.36, 1.25, 4.2), V(0.0, -0.045, -1), 100, 0, 7, undefined, 0.7),
      cut: "Opens the template", flags: ["centre", "wipe"] }]),
