// Camera templates: one named move each, on the camera lab set, with what the move says, when to use it, and the
// numbers it runs at (rulebook §1–§3). Two clay mannequins (Alex in ochre, Sam in slate) and a glider are the subjects.
import * as THREE from "three";
import { planner, scenePiece, type SceneSpec, type ShotDef } from "../kit/stage";
import type { ActorSpec } from "../kit/actors";
import { around, framed, lag, leadRoom, rig } from "../kit/rigs";
import { aimFor } from "../framer";
import { buildLab } from "./lab";
import type { Piece } from "../piece";

export type TemplateInfo = { id: string; name: string; says: string; use: string; numbers: string; avoid: string };
export const CAMERA_INFO: TemplateInfo[] = [];

export const ALEX = (path: ActorSpec["path"], acts?: ActorSpec["acts"], look?: ActorSpec["look"]): ActorSpec => ({ id: "ALEX", name: "Alex", kind: "human", tint: "ochre", path, acts, look });
export const SAM = (path: ActorSpec["path"], acts?: ActorSpec["acts"], look?: ActorSpec["look"]): ActorSpec => ({ id: "SAM", name: "Sam", kind: "human", tint: "slate", path, acts, look });
export const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

export function make(info: TemplateInfo, actors: ActorSpec[], shots: (P: ReturnType<typeof planner>) => ShotDef[], set?: { build: SceneSpec["build"]; sky: SceneSpec["sky"] }): Piece {
  const spec: SceneSpec = { id: info.id, title: info.name.toUpperCase(), sky: set?.sky ?? "studio", build: set?.build ?? buildLab, ...((set as { keyDir?: [number, number, number] } | undefined)?.keyDir ? { keyDir: (set as { keyDir: [number, number, number] }).keyDir } : {}), ...((set as { look?: object } | undefined)?.look ? { look: (set as { look: object }).look } : {}), actors, motes: { center: [0, 2.5, 0], size: [40, 6, 40], count: 200 } };
  CAMERA_INFO.push(info);
  return scenePiece(spec, shots(planner(spec)), { scene: "lab" });
}

export const CAMERA_TEMPLATES: Piece[] = [
  make({ id: "CAM01-LockedOff", name: "Locked-off", says: "Observation. The world moves, the camera does not judge it.", use: "Entrances and exits, comedy timing, tableaux, any beat where the action should carry the frame.", numbers: "Tripod, 24–35 mm, eye level. Hold at least 3 s on a wide.", avoid: "A static frame with nothing moving in it: give it a crossing or a moving layer." },
    [ALEX([{ t: 0.4, at: [-2.6, 1] }, { t: 6.8, at: [4.6, 1] }])],
    (P) => [{ start: 0, end: 7, label: "24mm  LOCKED-OFF WIDE", rig: "TRIPOD", subject: "ALEX", size: "WS", stop: 5.6, cam: rig.locked(P("ALEX"), { size: "WS", mm: 24, deg: -90, rise: 0.1 }, 3.6), flags: ["centre"], cut: "Opens the template" }]),

  make({ id: "CAM02-PanWith", name: "Pan with", says: "We are standing in the world, turning our head to follow someone.", use: "Following a crossing from one spot; showing where someone goes; a reveal by turning.", numbers: "Fixed position, 50 mm. A pan that holds the subject may run faster than the frame width ÷ 7 s rule; the background must not judder.", avoid: "Panning across nothing: always pan with a motivated subject or look." },
    [ALEX([{ t: 0.3, at: [-3.8, -2.0] }, { t: 6.7, at: [3.6, 2.1] }])],
    (P) => {
      const pos = V(7.5, 1.6, 12.5), A = P("ALEX");
      return [{ start: 0, end: 7, label: "50mm  PAN WITH", rig: "TRIPOD · FLUID HEAD", subject: "ALEX", size: "FS", stop: 4, cam: (t) => { const e = lag((x) => A(x).eye, t, 0.1); return { pos: pos.clone(), target: aimFor(pos, e, 50, leadRoom(pos, A(t), 0.22)), mm: 50 }; }, cut: "Opens the template", flags: ["exits-moving"] }];
    }),

  make({ id: "CAM03-PushIn", name: "Push in", says: "Something is dawning on them. We lean in with the thought.", use: "A realisation, a decision, rising tension; the reaction before the reveal (the Spielberg face).", numbers: "50 mm, MS to MCU over 4–8 s, about 0.15–0.4 m/s, eased, with a held frame at each end.", avoid: "Pushing on every shot: save it for the beat that turns." },
    [ALEX([{ t: 0, at: [0, 0], yaw: 0.45 }], [{ kind: "lookDown", t0: 1.2, t1: 3.4 }])],
    (P) => [{ start: 0, end: 7, label: "50mm  PUSH IN · MS TO MCU", rig: "DOLLY", subject: "ALEX", size: "MS", sizeEnd: "MCU", stop: 2, cam: rig.dolly(P("ALEX"), { size: "MS", mm: 50, deg: 28 }, "MCU", 0, 7, 0.8), cut: "Opens the template" }]),

  make({ id: "CAM04-PullOutReveal", name: "Pull out (reveal)", says: "We discover where they are, and how small they are in it.", use: "Endings, isolation, a reveal of scale or of what surrounds the subject.", numbers: "60 mm (a close-up nearer than 1.5 m distorts the face), CU to WS over 5–8 s, eased; let the world enter the frame in layers.", avoid: "Pulling out to an empty frame: the reveal needs something new at the end." },
    [ALEX([{ t: 0, at: [0, 0], yaw: 2.6 }], [{ kind: "lookUp", t0: 1.0 }])],
    (P) => [{ start: 0, end: 8, label: "60mm  PULL OUT · CU TO WS", rig: "DOLLY · TECHNOCRANE", subject: "ALEX", size: "CU", sizeEnd: "WS", stop: 2.8, cam: rig.dolly(P("ALEX"), { size: "CU", mm: 60, deg: 25 }, "WS", 0, 8, 0.7), cut: "Opens the template" }]),

  make({ id: "CAM05-DollyZoom", name: "Dolly zoom", says: "The ground shifts under them: dread, vertigo, a realisation that changes everything.", use: "Once per film at most: the moment the world turns.", numbers: "Hold the subject's size while the focal length runs 32 → 90 mm and the camera travels back in proportion (distance ∝ focal length).", avoid: "Keying the lens and the move apart: the subject's size drifts and the effect reads as a mistake." },
    [ALEX([{ t: 0, at: [0, 3], yaw: 0 }])],
    (P) => [{ start: 0, end: 6, label: "32>90mm  DOLLY ZOOM", rig: "DOLLY · ZOOM", subject: "ALEX", size: "MCU", stop: 4, cam: rig.dollyZoom(P("ALEX"), "MCU", 32, 90, 0, 0, 6, 0.6), cut: "Opens the template", flags: ["compound"] }]),

  make({ id: "CAM06-Orbit", name: "Orbit", says: "Everything turns around this person: a standoff, a decision, a hero moment.", use: "A character at the centre of a turning point; showing the space around them in one move.", numbers: "35 mm, MS, 120° over 7 s (about 17°/s on average, peak near 58°/s), eased, no rise.", avoid: "Orbiting just for motion: it says this person is the axis of the scene." },
    [ALEX([{ t: 0, at: [0, 0], yaw: 0 }])],
    (P) => [{ start: 0, end: 7, label: "35mm  ORBIT 120", rig: "TECHNOCRANE ORBIT", subject: "ALEX", size: "MS", stop: 2.8, cam: rig.orbit(P("ALEX"), { size: "MS", mm: 35, rise: 0 }, 20, 140, 0, 7, 0.6), cut: "Opens the template", flags: ["compound"] }]),

  make({ id: "CAM07-CraneUp", name: "Crane up", says: "Release: we rise above them and see what they are heading into.", use: "Ends of scenes, the start of a journey, showing the destination.", numbers: "28 mm, WS, rise 0 → 7 m over 6–8 s, eased; the head tilts down to keep the subject.", avoid: "Craning with no destination to reveal at the top." },
    [ALEX([{ t: 0.5, at: [-6, 1.4] }, { t: 4.5, at: [-11.4, 1.4] }])],
    (P) => [{ start: 0, end: 7, label: "28mm  CRANE UP", rig: "TECHNOCRANE", subject: "ALEX", size: "WS", stop: 4, cam: rig.crane(P("ALEX"), { size: "WS", mm: 28, deg: 160 }, 0.1, 7, 0, 7, 1.35), cut: "Opens the template", flags: ["compound"] }]),

  make({ id: "CAM08-CraneDown", name: "Crane down (arrival)", says: "We arrive in the world from above and come down to meet the person in it.", use: "Openings and establishing shots: geography first, then the subject.", numbers: "28 mm, from 10 m above to eye level over 6–8 s, eased in to a held medium.", avoid: "Landing on nothing: the move must end on the subject of the next beat." },
    [SAM([{ t: 0, at: [0, 0], yaw: 0.3 }])],
    (P) => [{ start: 0, end: 7, label: "28mm  CRANE DOWN", rig: "TECHNOCRANE", subject: "SAM", size: "WS", sizeEnd: "MWS", stop: 4, cam: rig.crane(P("SAM"), { size: "FS", mm: 28, deg: 15 }, 10, 0.05, 0, 7, 0.62), cut: "Opens the template", flags: ["compound"] }]),

  make({ id: "CAM09-SteadicamFollow", name: "Steadicam follow", says: "We go with them, into their world, sharing their point of view.", use: "Walking into a new space, following toward a destination, immersion.", numbers: "32 mm, MS from behind, 3–4 m back, lagging the subject by a beat (about 0.5 s).", avoid: "Following the back of someone's head for too long: cut to their face or the destination." },
    [ALEX([{ t: 0.3, at: [0, 7.5] }, { t: 7, at: [0, -1.8] }])],
    (P) => [{ start: 0, end: 7, label: "32mm  STEADICAM FOLLOW", rig: "STEADICAM", subject: "ALEX", size: "MS", stop: 2.8, cam: rig.follow(P("ALEX"), { size: "MS", mm: 32, deg: 180, rise: 0.2 }), cut: "Opens the template", flags: ["enters-moving", "exits-moving", "centre"] }]),

  make({ id: "CAM10-SteadicamLead", name: "Steadicam lead", says: "They are coming at us: purpose, confrontation, a walk-and-talk.", use: "Walk-and-talks, a character striding with intent, an approach.", numbers: "40 mm, MS from the front, the operator walking backwards at the subject's pace.", avoid: "Leading with nothing ahead of them in their eyeline: they need somewhere to look." },
    [ALEX([{ t: 0.3, at: [0, -7] }, { t: 7, at: [0, 2.4] }])],
    (P) => [{ start: 0, end: 7, label: "40mm  STEADICAM LEAD", rig: "STEADICAM", subject: "ALEX", size: "MS", stop: 2.8, cam: rig.follow(P("ALEX"), { size: "MS", mm: 40, deg: 0, rise: 0.05 }), cut: "Opens the template", flags: ["enters-moving", "exits-moving", "centre"] }]),

  make({ id: "CAM11-TrackingSide", name: "Tracking alongside", says: "We travel with them as an equal; the world streams past behind.", use: "Journeys, chases, conversations on the move; showing speed with foreground passing.", numbers: "50 mm, MS side-on, matched speed, leading the subject by half a metre.", avoid: "Losing lead room: keep space in front of the subject." },
    [ALEX([{ t: 0.3, at: [-6.5, 4] }, { t: 7, at: [3, 4] }])],
    (P) => [{ start: 0, end: 7, label: "50mm  TRACKING ALONGSIDE", rig: "DOLLY · TRACK", subject: "ALEX", size: "MS", stop: 2.8, cam: rig.track(P("ALEX"), { size: "MS", mm: 50, rise: 0.05 }, -1, 0.5), cut: "Opens the template", flags: ["enters-moving", "exits-moving"] }]),

  make({ id: "CAM12-OTSPair", name: "Over the shoulder (pair)", says: "A conversation: whose turn it is, who holds the power.", use: "Dialogue coverage: master, then OTS pair, then singles.", numbers: "75 mm both ways from about 3.5 m behind the shoulder (a long lens keeps the shoulder to about a quarter of the frame), both cameras on one side of the line, matched distance.", avoid: "Crossing the line between them, or a shoulder that fills half the frame." },
    [ALEX([{ t: 0, at: [-1.1, 0], yaw: Math.PI / 2 }], undefined, "SAM"), SAM([{ t: 0, at: [1.1, 0], yaw: -Math.PI / 2 }], undefined, "ALEX")],
    (P) => [
      { start: 0, end: 3.5, label: "75mm  OTS · ALEX ON SAM", rig: "STEADICAM", subject: "SAM", size: "MCU", stop: 2, ots: "ALEX", pair: ["ALEX", "SAM"], cam: rig.ots(P("ALEX"), P("SAM"), 75, 1, 3.6, 0.6), cut: "Opens the template" },
      { start: 3.5, end: 7, label: "75mm  REVERSE OTS · SAM ON ALEX", rig: "STEADICAM", subject: "ALEX", size: "MCU", stop: 2, ots: "SAM", pair: ["ALEX", "SAM"], reverse: 1, cam: rig.ots(P("SAM"), P("ALEX"), 75, -1, 3.6, 0.6), cut: "CUT to the reverse, same side of the line" },
    ]),

  make({ id: "CAM13-WhipPan", name: "Whip pan", says: "Sudden attention: something pulls our eyes, or one thought snaps to another.", use: "Joining two people or places with energy; a hidden cut; comedy timing.", numbers: "50 mm, a 0.3–0.4 s swing between two held frames; the motion blur carries the join.", avoid: "Whipping to a frame that is not composed: the landing must be a clean shot." },
    [ALEX([{ t: 0, at: [-3.2, -1], yaw: Math.PI / 2 }], undefined, "SAM"), SAM([{ t: 0, at: [3.2, -1], yaw: -Math.PI / 2 }], undefined, "ALEX")],
    (P) => {
      const pos = V(0, 1.6, 1.7);
      const onA = (t: number) => ({ pos: pos.clone(), target: aimFor(pos, P("ALEX")(t).eye, 50, [0.2, 1 / 3]), mm: 50 });
      const onB = (t: number) => ({ pos: pos.clone(), target: aimFor(pos, P("SAM")(t).eye, 50, [-0.2, 1 / 3]), mm: 50 });
      return [{ start: 0, end: 6, label: "50mm  WHIP PAN · ALEX TO SAM", rig: "TRIPOD · FLUID HEAD", subject: (t) => (t < 2.75 ? "ALEX" : "SAM"), size: "MS", stop: 2.8, cam: rig.whip(onA, onB, 2.6, 0.36), flags: ["whip", "short-side"], cut: "Opens the template" }];
    }),

  make({ id: "CAM14-Handheld", name: "Handheld", says: "We are there, unsteady with them: urgency, nerves, documentary truth.", use: "Panic, intimacy, chaos, found-footage; contrast with a calm locked-off scene.", numbers: "40 mm, MCU, rotation shake mostly (0.3–3.5 Hz layered), small amplitude; breathing, not earthquakes.", avoid: "Shake on a long lens or on every shot of a film: it stops meaning anything." },
    [ALEX([{ t: 0, at: [0, 0], yaw: 0.2 }], [{ kind: "lookUp", t0: 2.5, t1: 4.8 }])],
    (P) => [{ start: 0, end: 6, label: "40mm  HANDHELD MCU", rig: "HANDHELD", subject: "ALEX", size: "MCU", stop: 2, cam: rig.locked(P("ALEX"), { size: "MCU", mm: 40, deg: 22, rise: 0.05 }, 3), cut: "Opens the template" }]),

  make({ id: "CAM15-ChaseDrone", name: "Chase drone", says: "Speed and freedom: we fly with them.", use: "Flight, vehicles, big landscapes on the move; the geography wide in an action scene.", numbers: "28 mm, 18–22 m behind and 5–7 m above, matched speed, banking into turns.", avoid: "Chasing too far back: the subject becomes a dot and the speed disappears." },
    [{ id: "GLIDER", name: "Glider", kind: "flyer", tint: "plum", span: 12, path: [{ t: 0, at: [-45, 7, 34] }, { t: 4, at: [-6, 5.5, 4] }, { t: 8, at: [36, 8, -26] }] }],
    (P) => [{ start: 0, end: 8, label: "28mm  CHASE DRONE", rig: "CHASE DRONE · GIMBAL", subject: "GLIDER", size: "WS", stop: 4, cam: rig.chase(P("GLIDER"), 21, 6, 28, 2, 0.9), cut: "Opens the template", flags: ["enters-moving", "exits-moving", "centre", "compound"], shadow: 40 }]),

  make({ id: "CAM16-FPV", name: "FPV drone", says: "Raw speed, danger, a body moving fast through space.", use: "Chases, runs, flights through tight gaps; one burst inside an action scene.", numbers: "16–20 mm, 2–3 m behind, under a metre above the subject, weaving; the rig banks into turns.", avoid: "FPV for a whole sequence: it tires fast; cut back to a stable wide." },
    [ALEX([{ t: 0, at: [-13, 6] }, { t: 2.6, at: [-4, -3] }, { t: 5.2, at: [6, -5] }, { t: 7, at: [12, 1] }])],
    (P) => [{ start: 0, end: 7, label: "18mm  FPV RUN", rig: "FPV DRONE", subject: "ALEX", size: "WS", stop: 2.8, cam: rig.fpv(P("ALEX"), 4.2, 0.35, 18, 0.7), cut: "Opens the template", flags: ["enters-moving", "exits-moving", "centre", "compound"] }]),
];
void around; void framed;
