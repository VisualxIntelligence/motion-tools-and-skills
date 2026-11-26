// CAM14-Handheld
// Copied from engine/cinematic/src/templates/cameras.ts (lines 88-90 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh CAM14-Handheld
import * as THREE from "three";
import { planner, scenePiece, type SceneSpec, type ShotDef } from "../kit/stage";
import type { ActorSpec } from "../kit/actors";
import { around, framed, lag, leadRoom, rig } from "../kit/rigs";
import { aimFor } from "../framer";
import { buildLab } from "./lab";
import type { Piece } from "../piece";

make({ id: "CAM14-Handheld", name: "Handheld", says: "We are there, unsteady with them: urgency, nerves, documentary truth.", use: "Panic, intimacy, chaos, found-footage; contrast with a calm locked-off scene.", numbers: "40 mm, MCU, rotation shake mostly (0.3–3.5 Hz layered), small amplitude; breathing, not earthquakes.", avoid: "Shake on a long lens or on every shot of a film: it stops meaning anything." },
    [ALEX([{ t: 0, at: [0, 0], yaw: 0.2 }], [{ kind: "lookUp", t0: 2.5, t1: 4.8 }])],
    (P) => [{ start: 0, end: 6, label: "40mm  HANDHELD MCU", rig: "HANDHELD", subject: "ALEX", size: "MCU", stop: 2, cam: rig.locked(P("ALEX"), { size: "MCU", mm: 40, deg: 22, rise: 0.05 }, 3), cut: "Opens the template" }]),
