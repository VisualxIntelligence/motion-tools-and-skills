// CAM33-POVWalk
// Copied from engine/cinematic/src/templates/cameras2.ts (lines 84-86 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh CAM33-POVWalk
import * as THREE from "three";
import { smoother, ramp } from "../util";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, SAM, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";

make({ id: "CAM33-POVWalk", name: "POV walk", says: "We are them: we see only what they see.", use: "Horror, a search, a subjective beat, a game-like walk into danger.", numbers: "24 mm at their eye height, a step bob of 2 cm, the aim a little below the horizon, walking about 1.7 m/s.", avoid: "Showing their hands or breath unless it is the point: a clean POV has no body in it." },
    [ALEX([{ t: 0.3, at: [0, 8] }, { t: 7, at: [0, -3.5] }])],
    (P) => [{ start: 0, end: 7, label: "24mm  POV WALK", rig: "BODY RIG · POV", subject: "ALEX", size: "WS", stop: 2.8, cam: (t: number): Cam => { const m = P("ALEX")(t), f = (m.heading ?? m.facing ?? V(0, 0, 1)).clone().setY(0).normalize(), bob = Math.abs(Math.sin(t * 3.4)) * 0.025; const pos = m.eye.clone().add(f.clone().multiplyScalar(0.4)).add(V(0, bob, 0)); return { pos, target: pos.clone().add(f.multiplyScalar(8)).add(V(0, -0.5, 0)), mm: 24 }; }, cut: "Opens the template", flags: ["enters-moving", "exits-moving"] }]),
