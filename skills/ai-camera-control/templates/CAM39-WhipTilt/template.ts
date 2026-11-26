// CAM39-WhipTilt
// Copied from engine/cinematic/src/templates/cameras2.ts (lines 108-110 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh CAM39-WhipTilt
import * as THREE from "three";
import { smoother, ramp } from "../util";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, SAM, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";

make({ id: "CAM39-WhipTilt", name: "Whip tilt", says: "The eye is dragged up and away: a thought snapping to somewhere else.", use: "A transition to the sky, a hidden cut up into the next scene.", numbers: "35 mm on a locked tripod, a 0.35 s vertical whip from MS up to the sky, then the shot ends in blur.", avoid: "Slowing down: a whip is a whip only at speed." },
    [stand(0, 0, 0.25)],
    (P) => { const pos = framed(P("ALEX")(0), { size: "MS", mm: 35, deg: 20 }).pos; const a = (t: number): Cam => ({ pos: pos.clone(), target: aimFor(pos, P("ALEX")(t).eye, 35, [0, 1 / 3]), mm: 35 }); const b = (): Cam => ({ pos: pos.clone(), target: V(pos.x + 2, 60, pos.z - 10), mm: 35 }); return [{ start: 0, end: 4.5, label: "35mm  WHIP TILT UP", rig: "TRIPOD · FLUID HEAD", subject: "ALEX", size: "MS", stop: 4, cam: rig.whip(a, b, 3.2, 0.35), cut: "Opens the template" }]; }),
