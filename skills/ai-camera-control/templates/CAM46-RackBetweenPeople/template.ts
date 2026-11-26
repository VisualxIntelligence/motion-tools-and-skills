// CAM46-RackBetweenPeople
// Copied from engine/cinematic/src/templates/cameras2.ts (lines 136-138 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh CAM46-RackBetweenPeople
import * as THREE from "three";
import { smoother, ramp } from "../util";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, SAM, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";

make({ id: "CAM46-RackBetweenPeople", name: "Rack focus (people)", says: "Who is listening, and who is the one who matters now.", use: "A reaction behind the speaker, a power shift in a two-shot.", numbers: "85 mm at T1.4, a locked two-shot, Alex near and sharp, Sam far and soft; focus pulls to Sam over 0.8 s at 3.2 s.", avoid: "Moving the camera too: the focus is the move." },
    [ALEX([{ t: 0, at: [-0.5, 1.6], yaw: Math.PI * 0.9 }]), SAM([{ t: 0, at: [0.7, -2.4], yaw: 0.1 }])],
    () => { const pos = V(0.2, 1.5, 6.2); return [{ start: 0, end: 7, label: "85mm  RACK FOCUS · ALEX TO SAM", rig: "TRIPOD", subject: (t) => (t < 3.2 ? "ALEX" : "SAM"), size: "MS", stop: 1.4, cam: () => ({ pos: pos.clone(), target: aimFor(pos, V(0.1, 1.5, -0.4), 85, [0, 0]), mm: 85 }), focus: (t) => ["ALEX", "SAM", smoother(ramp(t, 2.8, 3.6))], cut: "Opens the template" }]; }),
