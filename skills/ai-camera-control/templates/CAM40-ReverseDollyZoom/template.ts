// CAM40-ReverseDollyZoom
// Copied from engine/cinematic/src/templates/cameras2.ts (lines 112-114 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh CAM40-ReverseDollyZoom
import * as THREE from "three";
import { smoother, ramp } from "../util";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, SAM, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";

make({ id: "CAM40-ReverseDollyZoom", name: "Reverse dolly zoom", says: "The room opens up behind them while they stay the same size: the world is leaving.", use: "Release, shock after the event, someone stepping out of something.", numbers: "Hold MCU while the lens goes 90 to 32 mm and the camera pulls out to match, over 5 s.", avoid: "Letting the subject change size: that is the whole trick." },
    [stand(0, 3, 0)],
    (P) => [{ start: 0, end: 6, label: "90>32mm  REVERSE DOLLY ZOOM", rig: "DOLLY · ZOOM", subject: "ALEX", size: "MCU", stop: 4, cam: rig.dollyZoom(P("ALEX"), "MCU", 90, 32, 0, 0, 6, 0.6), cut: "Opens the template", flags: ["compound"] }]),
