// More camera moves on the camera lab set: the rest of the film-school list. Zooms, tilts, pedestals, arcs, canted and
// rolling cameras, power angles, point of view, handheld, a slider, a rack focus, and the drone moves. Same rules as
// cameras.ts: one named move each, what it says, when to use it, and the numbers it runs at.
import * as THREE from "three";
import { smoother, ramp } from "../util";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, SAM, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
const make: typeof baseMake = (info, actors, shots) => baseMake(info, actors, shots, stageFor(info.id));
import type { Piece } from "../piece";

const withRoll = (cam: (t: number) => Cam, roll: (t: number) => number) => (t: number): Cam => ({ ...cam(t), roll: roll(t) });
const stand = (x = 0, z = 0, yaw = 0) => ALEX([{ t: 0, at: [x, z], yaw }]);
/** the perpendicular on the ground to the line from the camera to the subject */
const side = (pos: THREE.Vector3, at: THREE.Vector3) => { const d = at.clone().sub(pos).setY(0).normalize(); return V(-d.z, 0, d.x); };

export const CAMERA2_TEMPLATES: Piece[] = [
  make({ id: "CAM17-SlowZoomIn", name: "Slow zoom in", says: "Something is closing in on them, and they do not know it.", use: "Dread, a held thought, a stare that goes on a beat too long (the Kubrick creep).", numbers: "Locked tripod, 35 to 85 mm over 6 s, MS to MCU, eased at both ends. Nothing in the frame moves but the lens.", avoid: "A fast zoom (that is a crash zoom) or a zoom while the subject walks at us: it reads as a mistake." },
    [stand(0, 0, 0.3)],
    (P) => [{ start: 0, end: 7, label: "35>85mm  SLOW ZOOM IN", rig: "TRIPOD · ZOOM", subject: "ALEX", size: "MS", sizeEnd: "MCU", stop: 4, cam: rig.zoom(P("ALEX"), { size: "MS", mm: 35, deg: 25 }, 85, 0.4, 6.6, 0, 0.6), cut: "Opens the template" }]),

  make({ id: "CAM18-SlowZoomOut", name: "Slow zoom out", says: "We pull back from the thought and see the room it happens in.", use: "Isolation, a reveal of who else is there, the end of a scene.", numbers: "Locked tripod, 100 down to 35 mm over 6 s, CU to MS, eased at both ends.", avoid: "Stopping half way. The move has to land on a composed wide." },
    [stand(0, 0, 0.3)],
    (P) => [{ start: 0, end: 7, label: "100>35mm  SLOW ZOOM OUT", rig: "TRIPOD · ZOOM", subject: "ALEX", size: "CU", sizeEnd: "MS", stop: 4, cam: rig.zoom(P("ALEX"), { size: "CU", mm: 100, deg: 25 }, 35, 0.4, 6.6, 0, 0.6), cut: "Opens the template" }]),

  make({ id: "CAM19-TiltUp", name: "Tilt up", says: "We meet them from the ground up: boots, body, then the face.", use: "A hero introduction, a character entrance, scale.", numbers: "Fixed low position 2 m out, 24 mm, the head tilts from the boots to the eyes over 4 s, then holds the face for 2 s.", avoid: "Tilting past the head into empty sky." },
    [stand(0, 0, 0.2)],
    (P) => { const m = P("ALEX")(0), pos = framed(m, { size: "MS", mm: 24, deg: 0, rise: -0.8 }).pos; return [{ start: 0, end: 7, label: "24mm  TILT UP · BOOTS TO FACE", rig: "TRIPOD · FLUID HEAD", subject: "ALEX", size: "MS", sizeEnd: "MCU", stop: 4, cam: rig.tiltReveal(pos, m.sole.clone().add(V(0, 0.15, 0)), m.eye, 24, 0.3, 4.6, 0.3), cut: "Opens the template" }]; }),

  make({ id: "CAM20-TiltDown", name: "Tilt down", says: "We start on the face and are taken down to what they are standing on, or holding.", use: "Revealing a weapon, a gift, a body, a clue below the eyeline.", numbers: "Fixed position 3 m out, 35 mm, the head tilts from the eyes to the boots over 4 s.", avoid: "Showing the answer at the start: the face has to give nothing away." },
    [stand(0, 0, 0.2)],
    (P) => { const m = P("ALEX")(0), pos = framed(m, { size: "MS", mm: 35, deg: 0, rise: 0.1 }).pos; return [{ start: 0, end: 7, label: "35mm  TILT DOWN · FACE TO BOOTS", rig: "TRIPOD · FLUID HEAD", subject: "ALEX", size: "MS", sizeEnd: "FS", stop: 4, cam: rig.tiltReveal(pos, m.eye, m.sole.clone().add(V(0, 0.1, 0)), 35, 1, 4.8, 0.3), cut: "Opens the template" }]; }),

  make({ id: "CAM21-PanReveal", name: "Pan reveal", says: "We look away from the person, and the turn of the camera brings them in.", use: "Introducing someone who has been there all along; a hidden presence.", numbers: "Fixed position at 4 m, 40 mm, a 40 degree pan over 3.5 s from an empty wall of the plaza onto the person, then a held MS.", avoid: "Panning past the subject and coming back: land on them once." },
    [stand(-3, -4, Math.PI * 0.85)],
    (P) => { const pos = V(2.5, 1.5, 3.5), m = P("ALEX")(0); return [{ start: 0, end: 7, label: "40mm  PAN REVEAL", rig: "TRIPOD · FLUID HEAD", subject: "ALEX", size: "MS", stop: 4, cam: rig.tiltReveal(pos, V(9, 1.5, -9), aimFor(pos, m.eye, 40, [0.15, 1 / 3]), 40, 0.8, 4.2, 0.4), cut: "Opens the template" }]; }),

  make({ id: "CAM22-PedestalUp", name: "Pedestal up", says: "We rise gently to meet their eyes, or to look down on what they have done.", use: "A character standing up, a rising mood, finding the eyeline.", numbers: "50 mm, MCU, the camera rises from 0.6 m below to 0.9 m above eye level over 6 s at a steady distance.", avoid: "Letting the distance change: it is a rise, not a push." },
    [stand(0, 0, 0.35)],
    (P) => [{ start: 0, end: 7, label: "50mm  PEDESTAL UP", rig: "PEDESTAL · DOLLY", subject: "ALEX", size: "MCU", stop: 3, cam: rig.crane(P("ALEX"), { size: "MCU", mm: 50, deg: 25 }, -0.6, 0.9, 0.3, 6.7, 1, 0.5), cut: "Opens the template" }]),

  make({ id: "CAM23-PedestalDown", name: "Pedestal down", says: "We drop from above their eyes to meet them, or to sit beneath their weight.", use: "Someone sitting, losing, lowering, giving in.", numbers: "50 mm, MCU, the camera falls from 0.9 m above to 0.6 m below eye level over 6 s at a steady distance.", avoid: "Ending lower than the chin: the frame turns into a power shot you did not mean." },
    [stand(0, 0, 0.35)],
    (P) => [{ start: 0, end: 7, label: "50mm  PEDESTAL DOWN", rig: "PEDESTAL · DOLLY", subject: "ALEX", size: "MCU", stop: 3, cam: rig.crane(P("ALEX"), { size: "MCU", mm: 50, deg: 25 }, 0.9, -0.6, 0.3, 6.7, 1, 0.5), cut: "Opens the template" }]),

  make({ id: "CAM24-ShortArc", name: "Short arc", says: "We swing a little way round them to see who they really are facing.", use: "Dialogue emphasis, a character realising, a small turn of perspective.", numbers: "35 mm, MS, an arc of 60 degrees over 6 s at a held distance, eyes kept on the upper third.", avoid: "Going all the way round: that is an orbit, and says something bigger." },
    [stand(0, 0, 0.2)],
    (P) => [{ start: 0, end: 7, label: "35mm  SHORT ARC 60", rig: "DOLLY · CURVED TRACK", subject: "ALEX", size: "MS", stop: 2.8, cam: rig.orbit(P("ALEX"), { size: "MS", mm: 35 }, 15, 75, 0.3, 6.7, 0, 0.6), cut: "Opens the template", flags: ["compound"] }]),

  make({ id: "CAM25-ArcAndRise", name: "Arc and rise", says: "We circle them and lift away at once: a moment growing into a landscape.", use: "The end of a big beat, a character left alone in the world, a hero reveal.", numbers: "28 mm, MWS, a 120 degree arc while the arm rises 3 m over 7 s, aim held on the eyes.", avoid: "Rising first and arcing second: both axes have to start and stop together." },
    [stand(0, 0, 0.2)],
    (P) => [{ start: 0, end: 8, label: "28mm  ARC AND RISE", rig: "TECHNOCRANE", subject: "ALEX", size: "MWS", sizeEnd: "WS", stop: 3, cam: rig.orbit(P("ALEX"), { size: "MWS", mm: 28 }, 20, 140, 0.3, 7.7, 3, 0.6), cut: "Opens the template", flags: ["compound"] }]),

  make({ id: "CAM26-DutchAngle", name: "Dutch angle", says: "The world is tilted, and so is whoever is in it.", use: "Unease, madness, a threat, a drug or a drink gone wrong.", numbers: "Locked tripod, 28 mm, MS, the horizon rolled 14 degrees for the whole shot.", avoid: "Using it for a whole scene: it turns into wallpaper. A beat, then back to level." },
    [stand(0, 0, 0.25)],
    (P) => [{ start: 0, end: 6, label: "28mm  DUTCH ANGLE 14", rig: "TRIPOD · TILTED HEAD", subject: "ALEX", size: "MS", stop: 4, cam: withRoll(rig.locked(P("ALEX"), { size: "MS", mm: 28, deg: 25, rise: -0.2 }, 3), () => (14 * Math.PI) / 180), cut: "Opens the template" }]),

  make({ id: "CAM27-DutchPush", name: "Dutch push-in", says: "The tilt grows as we close in: something is going wrong in their head.", use: "A breakdown, a build to violence, a held panic.", numbers: "35 mm, MS to MCU over 6 s, the roll builds from 0 to 16 degrees as we push.", avoid: "Rolling back to level at the end: the room should not recover." },
    [ALEX([{ t: 0, at: [0, 0], yaw: 0.4 }], [{ kind: "lookDown", t0: 1.2, t1: 3.4 }])],
    (P) => [{ start: 0, end: 7, label: "35mm  DUTCH PUSH-IN", rig: "DOLLY · TILTED HEAD", subject: "ALEX", size: "MS", sizeEnd: "MCU", stop: 3, cam: withRoll(rig.dolly(P("ALEX"), { size: "MS", mm: 35, deg: 28 }, "MCU", 0.3, 6.7, 0.5), (t) => (16 * Math.PI / 180) * smoother(ramp(t, 0.3, 6.7))), cut: "Opens the template", flags: ["compound"] }]),

  make({ id: "CAM28-BarrelRoll", name: "Barrel roll", says: "The whole world turns over around them.", use: "Disorientation, a fall, a crash, a leap into something new.", numbers: "28 mm, MS, a full 360 degree roll about the lens axis over 5 s, eased, the subject kept centred.", avoid: "Doing it fast: a slow roll reads as a dream, a quick one as a stunt." },
    [stand(0, 0, 0.25)],
    (P) => [{ start: 0, end: 7, label: "28mm  BARREL ROLL 360", rig: "ROLL RIG", subject: "ALEX", size: "MS", stop: 4, cam: withRoll(rig.locked(P("ALEX"), { size: "MS", mm: 28, deg: 20 }, 3), (t) => Math.PI * 2 * smoother(ramp(t, 0.8, 5.8))), cut: "Opens the template", flags: ["compound"] }]),

  make({ id: "CAM29-LowAngleHero", name: "Low angle (power shot)", says: "They are bigger than the room: strength, threat, a hero.", use: "A leader, a villain's entrance, anyone who should loom.", numbers: "Locked tripod 1.1 m below eye level, 24 mm, MS looking up about 25 degrees, the ceiling or sky behind the head.", avoid: "Going so low the face is all chin: keep the eyes in the frame." },
    [stand(0, 0, 0.2)],
    (P) => [{ start: 0, end: 6, label: "24mm  LOW ANGLE", rig: "TRIPOD · LOW MOUNT", subject: "ALEX", size: "MS", stop: 4, cam: rig.locked(P("ALEX"), { size: "MS", mm: 24, deg: 15, rise: -1.15 }, 3), cut: "Opens the template" }]),

  make({ id: "CAM30-HighAngle", name: "High angle", says: "They are small, watched, or about to be caught.", use: "Vulnerability, surveillance, a character who has lost.", numbers: "Locked camera 3 m above eye level, 28 mm, FS looking down about 40 degrees, the ground filling the frame.", avoid: "Going to a full top-down: that is a map, not a power shot." },
    [stand(0, 0, 0.2)],
    (P) => [{ start: 0, end: 6, label: "28mm  HIGH ANGLE", rig: "TRIPOD · HIGH MOUNT", subject: "ALEX", size: "FS", stop: 4, cam: rig.locked(P("ALEX"), { size: "FS", mm: 28, deg: 20, rise: 3.2 }, 3), cut: "Opens the template" }]),

  make({ id: "CAM31-OverheadRise", name: "Overhead rise", says: "We lift off them and look straight down at where they stand.", use: "A character left alone, a map of a place, an ending that goes cold.", numbers: "28 mm, the camera rises from 0.5 to 14 m over 7 s and swings in until it looks straight down, the figure kept central.", avoid: "Losing the subject at the top: keep them in the middle of the frame as it climbs." },
    [stand(0, 0, 0.2)],
    (P) => [{ start: 0, end: 8, label: "28mm  OVERHEAD RISE", rig: "TECHNOCRANE · DRONE", subject: "ALEX", size: "FS", sizeEnd: "WS", stop: 4, cam: rig.crane(P("ALEX"), { size: "FS", mm: 28, deg: 30 }, 0.5, 14, 0.3, 7.7, 0.15, 0.5), cut: "Opens the template", flags: ["compound"] }]),

  make({ id: "CAM32-RunAndGun", name: "Run and gun", says: "We are running with them, and the camera is not steady either.", use: "Chases, escapes, war films, anything where the operator should be in danger.", numbers: "28 mm, MWS from behind at 3 m, hand-held with a strong shake (amount 3), following a jog at about 2.4 m/s.", avoid: "Shaking the frame so hard the subject leaves it: the shake is on the camera, the subject stays framed." },
    [ALEX([{ t: 0.3, at: [0, 9] }, { t: 6.8, at: [0, -6] }])],
    (P) => [{ start: 0, end: 7, label: "28mm  RUN AND GUN", rig: "HANDHELD", subject: "ALEX", size: "MWS", stop: 2.8, cam: rig.shake(rig.follow(P("ALEX"), { size: "MWS", mm: 28, deg: 180, rise: 0.1 }, 0.35), 3, 4), cut: "Opens the template", flags: ["enters-moving", "exits-moving"] }]),

  make({ id: "CAM33-POVWalk", name: "POV walk", says: "We are them: we see only what they see.", use: "Horror, a search, a subjective beat, a game-like walk into danger.", numbers: "24 mm at their eye height, a step bob of 2 cm, the aim a little below the horizon, walking about 1.7 m/s.", avoid: "Showing their hands or breath unless it is the point: a clean POV has no body in it." },
    [ALEX([{ t: 0.3, at: [0, 8] }, { t: 7, at: [0, -3.5] }])],
    (P) => [{ start: 0, end: 7, label: "24mm  POV WALK", rig: "BODY RIG · POV", subject: "ALEX", size: "WS", stop: 2.8, cam: (t: number): Cam => { const m = P("ALEX")(t), f = (m.heading ?? m.facing ?? V(0, 0, 1)).clone().setY(0).normalize(), bob = Math.abs(Math.sin(t * 3.4)) * 0.025; const pos = m.eye.clone().add(f.clone().multiplyScalar(0.4)).add(V(0, bob, 0)); return { pos, target: pos.clone().add(f.multiplyScalar(8)).add(V(0, -0.5, 0)), mm: 24 }; }, cut: "Opens the template", flags: ["enters-moving", "exits-moving"] }]),

  make({ id: "CAM34-POVLookAround", name: "POV look around", says: "Someone standing still turns their head, and we turn with it.", use: "Entering a room, checking for danger, a search from one spot.", numbers: "24 mm at eye height, a head turn of 100 degrees left to right over 6 s, a small pause at each end.", avoid: "A whip: heads turn, then stop, then turn again." },
    [stand(0, 0, 0.3)],
    (P) => [{ start: 0, end: 7, label: "24mm  POV LOOK AROUND", rig: "BODY RIG · POV", subject: "ALEX", size: "WS", stop: 2.8, cam: (t: number): Cam => { const m = P("ALEX")(t), f = (m.heading ?? m.facing ?? V(0, 0, 1)).clone().setY(0).normalize(); const a = (-50 + 100 * smoother(ramp(t, 0.8, 6.2))) * Math.PI / 180; const pos = m.eye.clone().add(f.clone().multiplyScalar(0.4)); return { pos, target: pos.clone().add(f.applyAxisAngle(V(0, 1, 0), a).multiplyScalar(8)).add(V(0, -0.3, 0)), mm: 24 }; }, cut: "Opens the template" }]),

  make({ id: "CAM35-OTSPushIn", name: "Over the shoulder push-in", says: "The listener is shut out, and we move in on the one who speaks.", use: "A confession, an ultimatum, the line everything turns on.", numbers: "75 mm over the shoulder from 4.6 m back, closing by 1.8 m over 6.5 s; the shoulder grows from about a third to 40% of the frame.", avoid: "Pushing so far the shoulder leaves the frame: it should still be there at the end." },
    [ALEX([{ t: 0, at: [-1.1, 0], yaw: Math.PI / 2 }], undefined, "SAM"), SAM([{ t: 0, at: [1.1, 0], yaw: -Math.PI / 2 }], undefined, "ALEX")],
    (P) => [{ start: 0, end: 7, label: "75mm  OTS PUSH-IN", rig: "DOLLY", subject: "SAM", size: "MCU", stop: 2, ots: "ALEX", pair: ["ALEX", "SAM"], cam: rig.ots(P("ALEX"), P("SAM"), 75, 1, 4.6, 0.5, 1.8, 0.5, 6.5), cut: "Opens the template" }]),

  make({ id: "CAM36-TwoShotTruck", name: "Two-shot truck", says: "We slide along the space between two people and see who is closer.", use: "Dialogue in profile, a stand-off, a negotiation.", numbers: "35 mm, both in profile, the camera trucks 4 m sideways at 7.5 m distance over 6 s, aim held parallel.", avoid: "Letting one person leave the frame: both stay in for the whole move." },
    [ALEX([{ t: 0, at: [-1.3, 0], yaw: Math.PI / 2 }], undefined, "SAM"), SAM([{ t: 0, at: [1.3, 0], yaw: -Math.PI / 2 }], undefined, "ALEX")],
    () => [{ start: 0, end: 7, label: "35mm  TWO-SHOT TRUCK", rig: "DOLLY · TRACK", subject: "ALEX", size: "MWS", stop: 4, cam: rig.truck(V(-2.2, 1.5, 7.5), V(2.2, 1.5, 7.5), V(0, 0, -1), 35, 0.3, 6.7, undefined, 0.5), cut: "Opens the template" }]),

  make({ id: "CAM37-SliderPortrait", name: "Slider on the face", says: "A small, slow slide across a face: the thought moving behind the eyes.", use: "Close-ups that need life without a push: interviews, quiet beats.", numbers: "85 mm, MCU, a 0.9 m slide over 6 s, the aim held on the eyes so the background shifts behind them.", avoid: "A fast slide: it should be felt, not noticed." },
    [stand(0, 0, 0.3)],
    (P) => { const m = P("ALEX")(0), pos0 = framed(m, { size: "MCU", mm: 85, deg: 12 }).pos, sd = side(pos0, m.eye); return [{ start: 0, end: 7, label: "85mm  SLIDER", rig: "SLIDER", subject: "ALEX", size: "MCU", stop: 2, cam: rig.truck(pos0.clone().add(sd.clone().multiplyScalar(-0.45)), pos0.clone().add(sd.clone().multiplyScalar(0.45)), V(0, 0, -1), 85, 0.3, 6.7, () => P("ALEX")(0).eye, 0.4), cut: "Opens the template" }]; }),

  make({ id: "CAM38-PushToCloseUp", name: "Push to the close-up", says: "We go in until nothing is left but the face.", use: "The moment of decision, a lie being told, a tear.", numbers: "85 mm, MCU to CU over 6 s, a slow dolly, the eyes kept on the upper third.", avoid: "Pushing past the face into a detail: stop while both eyes are still in frame." },
    [ALEX([{ t: 0, at: [0, 0], yaw: 0.35 }], [{ kind: "lookDown", t0: 1.5, t1: 4 }])],
    (P) => [{ start: 0, end: 7, label: "85mm  PUSH TO THE CLOSE-UP", rig: "DOLLY", subject: "ALEX", size: "MCU", sizeEnd: "CU", stop: 2, cam: rig.dolly(P("ALEX"), { size: "MCU", mm: 85, deg: 15 }, "CU", 0.3, 6.7, 0.6), cut: "Opens the template" }]),

  make({ id: "CAM39-WhipTilt", name: "Whip tilt", says: "The eye is dragged up and away: a thought snapping to somewhere else.", use: "A transition to the sky, a hidden cut up into the next scene.", numbers: "35 mm on a locked tripod, a 0.35 s vertical whip from MS up to the sky, then the shot ends in blur.", avoid: "Slowing down: a whip is a whip only at speed." },
    [stand(0, 0, 0.25)],
    (P) => { const pos = framed(P("ALEX")(0), { size: "MS", mm: 35, deg: 20 }).pos; const a = (t: number): Cam => ({ pos: pos.clone(), target: aimFor(pos, P("ALEX")(t).eye, 35, [0, 1 / 3]), mm: 35 }); const b = (): Cam => ({ pos: pos.clone(), target: V(pos.x + 2, 60, pos.z - 10), mm: 35 }); return [{ start: 0, end: 4.5, label: "35mm  WHIP TILT UP", rig: "TRIPOD · FLUID HEAD", subject: "ALEX", size: "MS", stop: 4, cam: rig.whip(a, b, 3.2, 0.35), cut: "Opens the template" }]; }),

  make({ id: "CAM40-ReverseDollyZoom", name: "Reverse dolly zoom", says: "The room opens up behind them while they stay the same size: the world is leaving.", use: "Release, shock after the event, someone stepping out of something.", numbers: "Hold MCU while the lens goes 90 to 32 mm and the camera pulls out to match, over 5 s.", avoid: "Letting the subject change size: that is the whole trick." },
    [stand(0, 3, 0)],
    (P) => [{ start: 0, end: 6, label: "90>32mm  REVERSE DOLLY ZOOM", rig: "DOLLY · ZOOM", subject: "ALEX", size: "MCU", stop: 4, cam: rig.dollyZoom(P("ALEX"), "MCU", 90, 32, 0, 0, 6, 0.6), cut: "Opens the template", flags: ["compound"] }]),

  make({ id: "CAM41-DroneOrbitHigh", name: "Drone orbit (high)", says: "We circle above the place and the person is where everything meets.", use: "Establishing a location, a gathering, an arrival from above.", numbers: "24 mm, WS from 9 m up, a 180 degree orbit over 8 s at a steady radius, the subject kept central.", avoid: "Orbiting too fast: a drone orbit should feel like weather." },
    [stand(0, 0, 0.2)],
    (P) => [{ start: 0, end: 9, label: "24mm  DRONE ORBIT HIGH", rig: "DRONE · GIMBAL", subject: "ALEX", size: "WS", stop: 4, cam: rig.orbit(P("ALEX"), { size: "WS", mm: 24, rise: 9 }, 20, 200, 0.4, 8.6, 9, 0.5), cut: "Opens the template", flags: ["compound"] }]),

  make({ id: "CAM42-DroneDive", name: "Drone dive", says: "We fall out of the sky onto them.", use: "A reveal of the hero, an arrival, a rooftop to a face.", numbers: "From 25 m up and 14 m out, diving to a 3.4 m MWS over 6 s, the lens tightening from 24 to 50 mm, gravity-eased.", avoid: "Stopping short: the dive ends on the subject, composed." },
    [stand(0, 0, 0.2)],
    (P) => [{ start: 0, end: 7, label: "24>50mm  DRONE DIVE", rig: "DRONE · GIMBAL", subject: "ALEX", size: "WS", sizeEnd: "MWS", stop: 4, cam: rig.dive(P("ALEX"), V(-9, 25, 11), V(-2.2, 1.9, 2.6), 24, 50, 0.4, 6.4), cut: "Opens the template" }]),

  make({ id: "CAM43-DroneRevealOverTerrace", name: "Drone reveal", says: "We rise over the edge of something and the place is revealed.", use: "The first view of a location, a reveal of scale, a journey's end.", numbers: "24 mm, a programmed path from low behind a tall stack at the west side up to 14 m over the floor over 8 s, eyes kept on the person.", avoid: "Revealing the subject first: the place comes before the person." },
    [stand(0, 0, 0.2)],
    (P) => { void P; const look = V(0, 1.2, 0); return [{ start: 0, end: 9, label: "24mm  DRONE REVEAL", rig: "DRONE · PROGRAMMED", subject: "ALEX", size: "WS", stop: 4, cam: rig.spline([{ t: 0.3, pos: V(-30, 2.2, 0), look: V(-8, 8, 0), mm: 24 }, { t: 4, pos: V(-18, 10, 2), look, mm: 24 }, { t: 8.7, pos: V(2, 14, 9), look, mm: 24 }]), cut: "Opens the template", flags: ["compound"] }]; }),

  make({ id: "CAM44-DroneRiseUp", name: "Drone rise up", says: "We lift straight up off the spot and see how small it all is.", use: "Endings, a character in a vast place, a long look at the ground.", numbers: "24 mm, the camera rises from 1 m to 24 m over 8 s looking down, the subject centred.", avoid: "Drifting sideways while it rises: the lift is vertical." },
    [stand(0, 0, 0.2)],
    (P) => [{ start: 0, end: 9, label: "24mm  DRONE RISE UP", rig: "DRONE · GIMBAL", subject: "ALEX", size: "WS", stop: 4, cam: rig.crane(P("ALEX"), { size: "WS", mm: 24, deg: 30 }, 1, 24, 0.4, 8.6, 0.4, 0.5), cut: "Opens the template", flags: ["compound"] }]),

  make({ id: "CAM45-LowFollow", name: "Low follow", says: "We follow at the height of their feet: weight, pace, intent.", use: "A walk to a confrontation, a character defined by how they move.", numbers: "24 mm, FS from behind at 3 m, 0.85 m below eye level, a Steadicam low-mode following a walk at 1.3 m/s.", avoid: "Going so low the ground fills the frame: the body stays in it." },
    [ALEX([{ t: 0.3, at: [0, 7] }, { t: 7, at: [0, -2.6] }])],
    (P) => [{ start: 0, end: 7, label: "24mm  LOW FOLLOW", rig: "STEADICAM · LOW MODE", subject: "ALEX", size: "FS", stop: 2.8, cam: rig.follow(P("ALEX"), { size: "FS", mm: 24, deg: 180, rise: -0.85 }), cut: "Opens the template", flags: ["enters-moving", "exits-moving"] }]),

  make({ id: "CAM46-RackBetweenPeople", name: "Rack focus (people)", says: "Who is listening, and who is the one who matters now.", use: "A reaction behind the speaker, a power shift in a two-shot.", numbers: "85 mm at T1.4, a locked two-shot, Alex near and sharp, Sam far and soft; focus pulls to Sam over 0.8 s at 3.2 s.", avoid: "Moving the camera too: the focus is the move." },
    [ALEX([{ t: 0, at: [-0.5, 1.6], yaw: Math.PI * 0.9 }]), SAM([{ t: 0, at: [0.7, -2.4], yaw: 0.1 }])],
    () => { const pos = V(0.2, 1.5, 6.2); return [{ start: 0, end: 7, label: "85mm  RACK FOCUS · ALEX TO SAM", rig: "TRIPOD", subject: (t) => (t < 3.2 ? "ALEX" : "SAM"), size: "MS", stop: 1.4, cam: () => ({ pos: pos.clone(), target: aimFor(pos, V(0.1, 1.5, -0.4), 85, [0, 0]), mm: 85 }), focus: (t) => ["ALEX", "SAM", smoother(ramp(t, 2.8, 3.6))], cut: "Opens the template" }]; }),

  make({ id: "CAM47-HandheldPushIn", name: "Handheld push-in", says: "We lean in with a shaking body: fear, a secret, something we should not see.", use: "Documentary tension, a confession, a character cornered.", numbers: "40 mm, MS to MCU over 6 s, a handheld shake of amount 2, eyes on the upper third.", avoid: "A shake so big it looks like a fault: it should feel like breath." },
    [ALEX([{ t: 0, at: [0, 0], yaw: 0.4 }], [{ kind: "lookDown", t0: 1.2, t1: 3.4 }])],
    (P) => [{ start: 0, end: 7, label: "40mm  HANDHELD PUSH-IN", rig: "HANDHELD", subject: "ALEX", size: "MS", sizeEnd: "MCU", stop: 3, cam: rig.shake(rig.dolly(P("ALEX"), { size: "MS", mm: 40, deg: 28 }, "MCU", 0.3, 6.7, 0.5), 2, 6), cut: "Opens the template" }]),

  make({ id: "CAM48-OrbitWalk", name: "Orbit a walker", says: "They walk, and the whole world swings round them as they go.", use: "A hero walk, a character arriving at a decision while still moving.", numbers: "35 mm, MS, the subject walks 6 m at 1 m/s while the camera arcs 130 degrees round them over 7 s.", avoid: "Orbiting at the walker's speed: the arc has to be slower, or it looks like a turntable." },
    [ALEX([{ t: 0.3, at: [-3, 2.5] }, { t: 7.2, at: [3, -3] }])],
    (P) => [{ start: 0, end: 8, label: "35mm  ORBIT A WALKER", rig: "TECHNOCRANE ORBIT", subject: "ALEX", size: "MS", stop: 2.8, cam: rig.orbit(P("ALEX"), { size: "MS", mm: 35 }, 20, 150, 0.3, 7.5, 0, 0.5), cut: "Opens the template", flags: ["enters-moving", "exits-moving", "compound"] }]),
];
