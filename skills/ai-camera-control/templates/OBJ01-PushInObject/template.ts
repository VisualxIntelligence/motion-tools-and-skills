// OBJ01-PushInObject
// Copied from engine/cinematic/src/templates/objects.ts (lines 25-27 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh OBJ01-PushInObject
import * as THREE from "three";
import { planner, scenePiece, type SceneSpec, type ShotDef } from "../kit/stage";
import type { ActorSpec } from "../kit/actors";
import { lag, rig } from "../kit/rigs";
import { aimFor } from "../framer";
import { ramp, smoother } from "../util";
import { buildLab } from "./lab";
import type { Piece } from "../piece";
import { CAMERA_INFO, type TemplateInfo } from "./cameras";

make({ id: "OBJ01-PushInObject", name: "Push in on an object", says: "This thing matters: the clue, the weapon, the letter.", use: "Plant an object the story will pay off; turn attention from people to a thing.", numbers: "50 mm, from a wide that shows where it is to an insert that fills the frame, 5–7 s, eased, looking slightly down.", avoid: "An insert with no geography first: the audience must know where the object is." },
    [prop("CASE", "Suitcase", "suitcase", [0, 0], 0.5)],
    (P) => [{ start: 0, end: 7, label: "50mm  PUSH IN · WIDE TO INSERT", rig: "DOLLY", subject: "CASE", size: "EWS", sizeEnd: "INSERT", stop: 2.8, cam: rig.dolly(P("CASE"), { size: "EWS", mm: 50, deg: 35, rise: 1.4 }, "INSERT", 0, 7, 0.6), cut: "Opens the template" }]),
