// ACT04-SprintDollyZoom
// Copied from engine/cinematic/src/templates/action.ts (lines 281-291 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh ACT04-SprintDollyZoom
import * as THREE from "three";
import { planner, scenePiece, speedRamp, type KitWorld, type SceneSpec, type ShotDef } from "../kit/stage";
import type { Act, Actor, ActorSpec, PathKey } from "../kit/actors";
import { around, lag, leadRoom, rig, type Subj } from "../kit/rigs";
import { aimFor, frameFor, frameHeight, SENSOR_H } from "../framer";
import { GREY, clay } from "../kit/clay";
import { broadTree, building, column, ground, pine, scatter } from "../kit/props";
import { buildLab } from "./lab";
import { clamp, lerp, ramp } from "../util";
import type { Piece } from "../piece";
import type { Cam } from "../shots";
import type { Marks } from "../marks";
import { CAMERA_INFO, type TemplateInfo } from "./cameras";

make({ id: "ACT04-SprintDollyZoom", name: "Sprint dolly zoom", says: "They run and the world chases them: the far end looms closer the harder they run.", use: "A flight from something enormous, a run toward a deadline, the moment a chase turns hopeless.", numbers: "Camera car leading the runner (5.2 m/s); 24 → 85 mm over 5.6 s while it pulls back from 3.5 to 12 m in proportion, hip high and level, so the runner holds a full shot and the far gate grows 3.5×.", avoid: "Keying the lens and the distance apart, or a background with no lines: it needs a far shape to loom." },
    [human("ALEX", "Alex", "ochre", runPath(new THREE.LineCurve3(V(0, 0, -33.4), V(0, 0, 60)), [[-1.6, 0], [-0.2, 5.2], [7.2, 5.2]]))],
    (P) => [{ start: 0, end: 6.5, label: "24>85mm  DOLLY ZOOM · SPRINT", rig: "CAMERA CAR · DOLLY ZOOM", subject: "ALEX", size: "FS", stop: 4, cam: (t) => {
      // the lens and the distance driven together (distance ∝ focal length), the camera at hip height and level, so the
      // runner holds a full shot and only the space behind changes
      const A = P("ALEX"), m = A(t), k = ramp(t, 0.45, 6.05), mm = 24 * Math.pow(85 / 24, k);
      const mid = m.top.clone().lerp(m.sole, 0.5), d = (frameHeight(m, "FS") * mm) / SENSOR_H;
      const pos = mid.clone().add(around(A(0), 0).multiplyScalar(d)).add(V(0, -0.15, 0));
      return { pos, target: aimFor(pos, mid, mm, [0, 0]), mm };
    }, flags: ["enters-moving", "exits-moving", "compound", "centre"], cut: "Opens the template" }],
    { build: buildAvenue, motes: { center: [0, 2.5, -10], size: [12, 5, 70], count: 260 } }),
