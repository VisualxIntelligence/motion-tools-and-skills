// CAM37-SliderPortrait
// Copied from engine/cinematic/src/templates/cameras2.ts (lines 100-102 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh CAM37-SliderPortrait
import * as THREE from "three";
import { smoother, ramp } from "../util";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, SAM, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";

make({ id: "CAM37-SliderPortrait", name: "Slider on the face", says: "A small, slow slide across a face: the thought moving behind the eyes.", use: "Close-ups that need life without a push: interviews, quiet beats.", numbers: "85 mm, MCU, a 0.9 m slide over 6 s, the aim held on the eyes so the background shifts behind them.", avoid: "A fast slide: it should be felt, not noticed." },
    [stand(0, 0, 0.3)],
    (P) => { const m = P("ALEX")(0), pos0 = framed(m, { size: "MCU", mm: 85, deg: 12 }).pos, sd = side(pos0, m.eye); return [{ start: 0, end: 7, label: "85mm  SLIDER", rig: "SLIDER", subject: "ALEX", size: "MCU", stop: 2, cam: rig.truck(pos0.clone().add(sd.clone().multiplyScalar(-0.45)), pos0.clone().add(sd.clone().multiplyScalar(0.45)), V(0, 0, -1), 85, 0.3, 6.7, () => P("ALEX")(0).eye, 0.4), cut: "Opens the template" }]; }),
