// Camera templates on objects: the same named moves, with a prop as the subject (a suitcase, a car, a statue, a
// spacecraft, a doorway). What the move says does not change with what it is pointed at.
import * as THREE from "three";
import { planner, scenePiece, type SceneSpec, type ShotDef } from "../kit/stage";
import type { ActorSpec } from "../kit/actors";
import { lag, rig } from "../kit/rigs";
import { aimFor } from "../framer";
import { ramp, smoother } from "../util";
import { buildLab } from "./lab";
import type { Piece } from "../piece";
import { CAMERA_INFO, type TemplateInfo } from "./cameras";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const prop = (id: string, name: string, model: ActorSpec["model"], at: [number, number] | [number, number, number], yaw = 0, tint: ActorSpec["tint"] = "sand", path?: ActorSpec["path"]): ActorSpec =>
  ({ id, name, kind: "prop", model, tint, path: path ?? [{ t: 0, at, yaw }] });
const ALEX = (at: [number, number], yaw: number): ActorSpec => ({ id: "ALEX", name: "Alex", kind: "human", tint: "ochre", path: [{ t: 0, at, yaw }] });

function make(info: TemplateInfo, actors: ActorSpec[], shots: (P: ReturnType<typeof planner>) => ShotDef[]): Piece {
  const spec: SceneSpec = { id: info.id, title: info.name.toUpperCase(), sky: "studio", build: buildLab, actors, motes: { center: [0, 2.5, 0], size: [40, 6, 40], count: 200 } };
  CAMERA_INFO.push(info);
  return scenePiece(spec, shots(planner(spec)), { scene: "lab" });
}

export const OBJECT_TEMPLATES: Piece[] = [
  make({ id: "OBJ01-PushInObject", name: "Push in on an object", says: "This thing matters: the clue, the weapon, the letter.", use: "Plant an object the story will pay off; turn attention from people to a thing.", numbers: "50 mm, from a wide that shows where it is to an insert that fills the frame, 5–7 s, eased, looking slightly down.", avoid: "An insert with no geography first: the audience must know where the object is." },
    [prop("CASE", "Suitcase", "suitcase", [0, 0], 0.5)],
    (P) => [{ start: 0, end: 7, label: "50mm  PUSH IN · WIDE TO INSERT", rig: "DOLLY", subject: "CASE", size: "EWS", sizeEnd: "INSERT", stop: 2.8, cam: rig.dolly(P("CASE"), { size: "EWS", mm: 50, deg: 35, rise: 1.4 }, "INSERT", 0, 7, 0.6), cut: "Opens the template" }]),

  make({ id: "OBJ02-OrbitHero", name: "Hero orbit (object)", says: "Admire it: the reveal of a hero vehicle, a product, a prize.", use: "Introducing a vehicle, a machine or a product; showing every side in one move.", numbers: "35 mm, full shot, 180° over 6–8 s, eased, camera slightly above the roofline.", avoid: "Orbiting so fast the background smears; keep it under about 30°/s." },
    [prop("CAR", "Car", "car", [0, 0], 0, "slate")],
    (P) => [{ start: 0, end: 8, label: "35mm  HERO ORBIT 180", rig: "TECHNOCRANE ORBIT", subject: "CAR", size: "WS", stop: 4, cam: rig.orbit(P("CAR"), { size: "WS", mm: 35, rise: 1.1 }, 30, 210, 0, 8, 1.4, 0.5), cut: "Opens the template", flags: ["compound"] }]),

  make({ id: "OBJ03-CraneUpStatue", name: "Crane up a monument", says: "Scale and awe: we rise with it to see how big it is, and what it watches over.", use: "Monuments, buildings, giant machines; the arrival at a destination.", numbers: "28 mm, starting low at the base (a low angle adds weight), rising 6 m over 6–8 s.", avoid: "Starting high: the rise is the reveal." },
    [prop("STATUE", "Statue", "statue", [0, -2], 0, "stone")],
    (P) => [{ start: 0, end: 7, label: "28mm  CRANE UP · LOW TO HIGH", rig: "TECHNOCRANE", subject: "STATUE", size: "FS", sizeEnd: "WS", stop: 4, cam: rig.crane(P("STATUE"), { size: "FS", mm: 28, deg: 20 }, -1.3, 5, 0, 7, 1.5), cut: "Opens the template", flags: ["compound"] }]),

  make({ id: "OBJ04-TruckPastParallax", name: "Truck past (parallax)", says: "Depth and travel: the world is layered, and we are moving through it.", use: "Establishing a space with depth; passing foreground that frames the subject; showing speed.", numbers: "35 mm, a sideways slide of 10–12 m over 6–8 s, aim held parallel; foreground 1–3 m away, subject 10+ m.", avoid: "An empty foreground: parallax needs near objects to pass the lens." },
    [prop("MONO", "Monolith", "monolith", [0.5, -7], 0, "plum"), prop("C1", "Crate", "crate", [-4, 4.5], 0.4), prop("C2", "Barrel", "barrel", [-0.6, 4.2]), prop("C3", "Crate", "crate", [3.2, 4.8], 1.1), prop("C4", "Barrel", "barrel", [6, 4.4])],
    () => [{ start: 0, end: 7, label: "35mm  TRUCK RIGHT · PARALLAX", rig: "DOLLY · TRACK", subject: "MONO", size: "WS", stop: 5.6, cam: rig.truck(V(-5.5, 1.3, 8), V(5.5, 1.3, 8), V(0.04, -0.05, -1), 35, 0, 7), cut: "Opens the template", flags: ["centre"] }]),

  make({ id: "OBJ05-TrackingCarLow", name: "Low tracking (vehicle)", says: "Speed and power: low to the ground, matched to it, the road streaming past.", use: "Car chases, vehicles at speed, a character on a bike or horse.", numbers: "35 mm, 0.4 m off the ground, matched speed, side-on and a little ahead.", avoid: "Matching too exactly with nothing in the background: speed reads from what streams past." },
    [prop("CAR", "Car", "car", [0, 0], 0, "slate", [{ t: 0, at: [-9, 2] }, { t: 7, at: [27, 2] }])],
    (P) => [{ start: 0, end: 7, label: "35mm  LOW TRACKING · CAR", rig: "CAMERA CAR · LOW MOUNT", subject: "CAR", size: "WS", stop: 4, cam: rig.track(P("CAR"), { size: "WS", mm: 35, rise: -0.45 }, 1, 1.2), cut: "Opens the template", flags: ["enters-moving", "exits-moving", "centre"] }]),

  make({ id: "OBJ06-TopDown", name: "Top-down (god's eye)", says: "Pattern and fate: we look down like a map; the people below are pieces.", use: "Showing layout and geography, a body or an object on the ground, transitions between scenes.", numbers: "35 mm straight down from 10–15 m, a slow rotation of 20–30° over 6 s.", avoid: "Overhead for emotion: it distances; use it to explain space." },
    [prop("CAR", "Car", "car", [0, 0], 0.6, "slate"), ALEX([2.6, 1.2], -1.8)],
    () => [{ start: 0, end: 6, label: "35mm  TOP-DOWN · SLOW ROTATE", rig: "TECHNOCRANE · REMOTE HEAD", subject: "CAR", size: "WS", stop: 5.6, cam: (t) => { const a = 0.55 * smoother(t / 6); return { pos: V(Math.sin(a) * 0.2, 14, Math.cos(a) * 0.2), target: V(0, 0, 0), mm: 35, roll: -a }; }, cut: "Opens the template", flags: ["centre"] }]),

  make({ id: "OBJ07-RackFocus", name: "Rack focus", says: "Look here, now there: the lens moves our attention without the camera moving.", use: "Linking a clue to a person, revealing who is behind, a shift in what matters.", numbers: "50 mm at T1.4, the camera low between a near object and a far one;  hold, then pull focus over 0.6–1 s on a motivated beat.", avoid: "Racking with deep focus (wide lens, small stop): nothing changes." },
    [prop("CASE", "Suitcase", "suitcase", [0.45, 4.6], 0.3), ALEX([-0.8, -4], 0.15)],
    () => {
      const pos = V(0.2, 0.55, 7.3), mid = V(-0.1, 0.95, -1);
      return [{ start: 0, end: 6, label: "50mm  RACK FOCUS · CASE TO ALEX", rig: "TRIPOD", subject: (t) => (t < 3.2 ? "CASE" : "ALEX"), size: "WS", stop: 1.4, cam: () => ({ pos: pos.clone(), target: aimFor(pos, mid, 50, [0, 0]), mm: 50 }), focus: (t) => ["CASE", "ALEX", smoother(ramp(t, 2.8, 3.6))], cut: "Opens the template", flags: ["centre"] }];
    }),

  make({ id: "OBJ08-WipeReveal", name: "Wipe reveal", says: "A curtain opens: something near the lens passes and the subject is there.", use: "Hidden cuts, reveals, transitions between scenes or times.", numbers: "35 mm, a lateral move behind a near object (1–2 m from the lens) that fills the frame for a moment.", avoid: "A wipe object that is too far: it must fill the frame to hide or reveal." },
    [prop("MONO", "Monolith", "monolith", [0, 5.6], 0, "stone"), prop("STATUE", "Statue", "statue", [0.4, -4], 0, "sand")],
    (P) => [{ start: 0, end: 6, label: "35mm  WIPE REVEAL", rig: "DOLLY · TRACK", subject: "STATUE", size: "FS", stop: 4, cam: rig.truck(V(-3.4, 1.6, 7.4), V(3.4, 1.6, 7.4), V(0, 0, -1), 35, 0, 6, (t) => P("STATUE")(t).eye), cut: "Opens the template", flags: ["centre", "wipe", "compound"] }]),

  make({ id: "OBJ09-ThroughDoorway", name: "Through a doorway", says: "Crossing a threshold: we enter their world, their room, their story.", use: "Entering a space, discovering someone inside, transitions from outside to in.", numbers: "28 mm, a dolly through the frame of the door over 5–7 s; the door frame wipes past the edges.", avoid: "Stopping in the doorway: the move is the crossing." },
    [prop("DOOR", "Doorway", "doorway", [0, 2], 0, "stone"), ALEX([0.3, -4.5], 0)],
    (P) => {
      const a = V(0.1, 1.55, 10), b = V(0.15, 1.55, -0.6);
      return [{ start: 0, end: 7, label: "28mm  DOLLY THROUGH DOORWAY", rig: "STEADICAM", subject: "ALEX", size: "WS", sizeEnd: "MS", stop: 4, cam: (t) => { const k = smoother(ramp(t, 0.4, 6.6)); const pos = a.clone().lerp(b, k); return { pos, target: aimFor(pos, P("ALEX")(t).eye, 28, [0, 1 / 3]), mm: 28 }; }, cut: "Opens the template", flags: ["centre"] }];
    }),

  make({ id: "OBJ10-CrashZoom", name: "Crash zoom", says: "Shock or punchline: the lens slams in on the thing that matters.", use: "Comedy beats, sudden realisations, 70s-style energy; a deliberate stylistic flourish.", numbers: "Fixed camera, 24 → 150 mm in 0.3–0.4 s, a held frame on both sides.", avoid: "Using it as a dolly: a zoom flattens space and reads as a style choice." },
    [prop("STATUE", "Statue", "statue", [0, -10], 0, "sand")],
    (P) => [{ start: 0, end: 5, label: "24>150mm  CRASH ZOOM", rig: "TRIPOD · ZOOM", subject: "STATUE", size: "WS", stop: 4, cam: rig.zoom(P("STATUE"), { size: "WS", mm: 24, deg: 15 }, 150, 2.2, 2.6, 2.5, 0), cut: "Opens the template", flags: ["whip", "centre"] }]),

  make({ id: "OBJ11-TiltUpTall", name: "Tilt up (height reveal)", says: "How tall it is: from the base, we look up and up.", use: "Trees, towers, giants, buildings; the first sight of something huge.", numbers: "18 mm from low near the base, tilting up about 45° over 8–9 s, eased (slow enough not to judder at 24 fps).", avoid: "Tilting past the top into empty sky; land on the top." },
    [prop("TREE", "Pine", "pine", [0, 0], 0, "sage")],
    () => [{ start: 0, end: 9, label: "18mm  TILT UP · BASE TO TOP", rig: "TRIPOD · FLUID HEAD", subject: "TREE", size: "CU", stop: 5.6, cam: rig.tiltReveal(V(0.5, 0.5, 11), V(0, 3.2, 0), V(0, 11, 0), 18, 0, 9), cut: "Opens the template", flags: ["centre"] }]),

  make({ id: "OBJ12-FlybyPan", name: "Flyby pan", says: "It roars past us: speed, scale, a near miss.", use: "Spacecraft, planes, trains or cars passing the camera; a beat of spectacle.", numbers: "35 mm on a fixed head, panning with a subject at 20+ m/s that passes within 10–15 m.", avoid: "Leading the subject off-frame: let it pass through and exit." },
    [{ id: "SHIP", name: "Spacecraft", kind: "prop", model: "ship", tint: "plum", path: [{ t: 0, at: [-70, 7, -18] }, { t: 6, at: [70, 9, 6] }] }],
    (P) => {
      const pos = V(0, 1.8, 14);
      return [{ start: 0, end: 6, label: "35mm  FLYBY PAN", rig: "TRIPOD · FLUID HEAD", subject: "SHIP", size: "WS", stop: 5.6, cam: (t) => { const e = lag((x) => P("SHIP")(x).eye, t, 0.12); return { pos: pos.clone(), target: aimFor(pos, e, 35, [0, 0]), mm: 35 }; }, cut: "Opens the template", flags: ["centre", "enters-moving", "exits-moving", "compound"], shadow: 40 }];
    }),
];
