// OBJ11-TiltUpTall
// Copied from engine/cinematic/src/templates/objects.ts (lines 71-73 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh OBJ11-TiltUpTall
import * as THREE from "three";
import { planner, scenePiece, type SceneSpec, type ShotDef } from "../kit/stage";
import type { ActorSpec } from "../kit/actors";
import { lag, rig } from "../kit/rigs";
import { aimFor } from "../framer";
import { ramp, smoother } from "../util";
import { buildLab } from "./lab";
import type { Piece } from "../piece";
import { CAMERA_INFO, type TemplateInfo } from "./cameras";

make({ id: "OBJ11-TiltUpTall", name: "Tilt up (height reveal)", says: "How tall it is: from the base, we look up and up.", use: "Trees, towers, giants, buildings; the first sight of something huge.", numbers: "18 mm from low near the base, tilting up about 45° over 8–9 s, eased (slow enough not to judder at 24 fps).", avoid: "Tilting past the top into empty sky; land on the top." },
    [prop("TREE", "Pine", "pine", [0, 0], 0, "sage")],
    () => [{ start: 0, end: 9, label: "18mm  TILT UP · BASE TO TOP", rig: "TRIPOD · FLUID HEAD", subject: "TREE", size: "CU", stop: 5.6, cam: rig.tiltReveal(V(0.5, 0.5, 11), V(0, 3.2, 0), V(0, 11, 0), 18, 0, 9), cut: "Opens the template", flags: ["centre"] }]),
