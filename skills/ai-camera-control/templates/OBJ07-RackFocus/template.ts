// OBJ07-RackFocus
// Copied from engine/cinematic/src/templates/objects.ts (lines 49-54 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh OBJ07-RackFocus
import * as THREE from "three";
import { planner, scenePiece, type SceneSpec, type ShotDef } from "../kit/stage";
import type { ActorSpec } from "../kit/actors";
import { lag, rig } from "../kit/rigs";
import { aimFor } from "../framer";
import { ramp, smoother } from "../util";
import { buildLab } from "./lab";
import type { Piece } from "../piece";
import { CAMERA_INFO, type TemplateInfo } from "./cameras";

make({ id: "OBJ07-RackFocus", name: "Rack focus", says: "Look here, now there: the lens moves our attention without the camera moving.", use: "Linking a clue to a person, revealing who is behind, a shift in what matters.", numbers: "50 mm at T1.4, the camera low between a near object and a far one;  hold, then pull focus over 0.6–1 s on a motivated beat.", avoid: "Racking with deep focus (wide lens, small stop): nothing changes." },
    [prop("CASE", "Suitcase", "suitcase", [0.45, 4.6], 0.3), ALEX([-0.8, -4], 0.15)],
    () => {
      const pos = V(0.2, 0.55, 7.3), mid = V(-0.1, 0.95, -1);
      return [{ start: 0, end: 6, label: "50mm  RACK FOCUS · CASE TO ALEX", rig: "TRIPOD", subject: (t) => (t < 3.2 ? "CASE" : "ALEX"), size: "WS", stop: 1.4, cam: () => ({ pos: pos.clone(), target: aimFor(pos, mid, 50, [0, 0]), mm: 50 }), focus: (t) => ["CASE", "ALEX", smoother(ramp(t, 2.8, 3.6))], cut: "Opens the template", flags: ["centre"] }];
    }),
