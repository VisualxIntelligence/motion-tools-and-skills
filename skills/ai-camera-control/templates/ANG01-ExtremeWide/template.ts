// ANG01-ExtremeWide
// Copied from engine/cinematic/src/templates/angles.ts (lines 20-21 of that file).
// The set builders, rigs and stand-ins it calls live in engine/cinematic/src and kit/.
// Render it: cd engine/cinematic && tools/render-pill.sh ANG01-ExtremeWide
import * as THREE from "three";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
import type { Piece } from "../piece";
import { LOCATIONS, ENVIRONMENTS } from "./locations";

make({ id: "ANG01-ExtremeWide", name: "Extreme wide shot", says: "The place is the subject, and the person is small inside it.", use: "Opening a scene, loneliness, scale, a journey's end.", numbers: "24 mm, EWS from 40 m, locked off. The figure fills about a twentieth of the frame height.", avoid: "Cutting to it with nothing to read: the figure must still be findable." },
    [stand(0, 0)], hold("24mm  EXTREME WIDE", "TRIPOD", "EWS", (P) => rig.locked(P("ALEX"), { size: "EWS", mm: 24, deg: 25, rise: 1.5 }, 3))),
