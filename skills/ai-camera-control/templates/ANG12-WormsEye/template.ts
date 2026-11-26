// ANG12-WormsEye
// Copied from engine/cinematic/src/templates/angles.ts (lines 43-45 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh ANG12-WormsEye
import * as THREE from "three";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";
import { LOCATIONS, ENVIRONMENTS } from "./locations";

make({ id: "ANG12-WormsEye", name: "Worm's-eye (ground level)", says: "The camera lies on the ground and the person towers over it.", use: "Power, threat, a child's view, a dramatic entrance.", numbers: "18 mm at 0.12 m off the ground, 2 m from the feet, the aim 40 degrees up at the face.", avoid: "Hiding the face: the eyes should still be readable." },
    [stand(0, 0)],
    hold("18mm  WORM'S-EYE", "GROUND MOUNT", "MS", (P) => () => { const m = P("ALEX")(0), c = framed(m, { size: "FS", mm: 18, deg: 8 }); const pos = c.pos.clone().setY(0.12); return { pos, target: m.eye.clone().add(V(0, 0.15, 0)), mm: 18 }; })),
