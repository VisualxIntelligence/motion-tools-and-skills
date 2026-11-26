// CAM09-SteadicamFollow
// Copied from engine/cinematic/src/templates/cameras.ts (lines 60-62 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh CAM09-SteadicamFollow
import * as THREE from "three";
import { planner, scenePiece, type SceneSpec, type ShotDef } from "../kit/stage";
import type { ActorSpec } from "../kit/actors";
import { around, framed, lag, leadRoom, rig } from "../kit/rigs";
import { aimFor } from "../framer";
import { buildLab } from "./lab";
import type { Piece } from "../piece";

make({ id: "CAM09-SteadicamFollow", name: "Steadicam follow", says: "We go with them, into their world, sharing their point of view.", use: "Walking into a new space, following toward a destination, immersion.", numbers: "32 mm, MS from behind, 3–4 m back, lagging the subject by a beat (about 0.5 s).", avoid: "Following the back of someone's head for too long: cut to their face or the destination." },
    [ALEX([{ t: 0.3, at: [0, 7.5] }, { t: 7, at: [0, -1.8] }])],
    (P) => [{ start: 0, end: 7, label: "32mm  STEADICAM FOLLOW", rig: "STEADICAM", subject: "ALEX", size: "MS", stop: 2.8, cam: rig.follow(P("ALEX"), { size: "MS", mm: 32, deg: 180, rise: 0.2 }), cut: "Opens the template", flags: ["enters-moving", "exits-moving", "centre"] }]),
