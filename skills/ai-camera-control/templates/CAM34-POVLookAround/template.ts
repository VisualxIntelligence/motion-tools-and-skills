// CAM34-POVLookAround
// Copied from engine/cinematic/src/templates/cameras2.ts (lines 88-90 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh CAM34-POVLookAround
import * as THREE from "three";
import { smoother, ramp } from "../util";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, SAM, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";

make({ id: "CAM34-POVLookAround", name: "POV look around", says: "Someone standing still turns their head, and we turn with it.", use: "Entering a room, checking for danger, a search from one spot.", numbers: "24 mm at eye height, a head turn of 100 degrees left to right over 6 s, a small pause at each end.", avoid: "A whip: heads turn, then stop, then turn again." },
    [stand(0, 0, 0.3)],
    (P) => [{ start: 0, end: 7, label: "24mm  POV LOOK AROUND", rig: "BODY RIG · POV", subject: "ALEX", size: "WS", stop: 2.8, cam: (t: number): Cam => { const m = P("ALEX")(t), f = (m.heading ?? m.facing ?? V(0, 0, 1)).clone().setY(0).normalize(); const a = (-50 + 100 * smoother(ramp(t, 0.8, 6.2))) * Math.PI / 180; const pos = m.eye.clone().add(f.clone().multiplyScalar(0.4)); return { pos, target: pos.clone().add(f.applyAxisAngle(V(0, 1, 0), a).multiplyScalar(8)).add(V(0, -0.3, 0)), mm: 24 }; }, cut: "Opens the template" }]),
