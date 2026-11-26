// Camera angles and lenses: still frames that each say one thing by where the camera sits and what it sees through.
// Shot sizes from extreme wide to extreme close-up, the power angles (high, low, worm's-eye, bird's-eye, profile, from
// behind), and the lens looks (super wide, fisheye, long lens compression). Same lab set, same rules as cameras.ts.
import * as THREE from "three";
import { aimFor } from "../framer";
import { framed, rig } from "../kit/rigs";
import type { Cam } from "../shots";
import { ALEX, V, make as baseMake } from "./cameras";
import { stageFor } from "./studios";
const make: typeof baseMake = (info, actors, shots) => baseMake(info, actors, shots, stageFor(info.id));
import type { Piece } from "../piece";

const stand = (x = 0, z = 0, yaw = 0.25) => ALEX([{ t: 0, at: [x, z], yaw }]);
const withRoll = (cam: (t: number) => Cam, roll: number) => (t: number): Cam => ({ ...cam(t), roll });
const withFish = (cam: (t: number) => Cam, fish: number) => (t: number): Cam => ({ ...cam(t), fish });
const hold = (label: string, rigName: string, size: any, cam: (P: any) => (t: number) => Cam, end = 6) => (P: any) => [{ start: 0, end, label, rig: rigName, subject: "ALEX", size, stop: 4, cam: cam(P), cut: "Opens the template" }];

export const ANGLE_TEMPLATES: Piece[] = [
  // ---------------------------------------------------------------- shot sizes
  make({ id: "ANG01-ExtremeWide", name: "Extreme wide shot", says: "The place is the subject, and the person is small inside it.", use: "Opening a scene, loneliness, scale, a journey's end.", numbers: "24 mm, EWS from 40 m, locked off. The figure fills about a twentieth of the frame height.", avoid: "Cutting to it with nothing to read: the figure must still be findable." },
    [stand(0, 0)], hold("24mm  EXTREME WIDE", "TRIPOD", "EWS", (P) => rig.locked(P("ALEX"), { size: "EWS", mm: 24, deg: 25, rise: 1.5 }, 3))),
  make({ id: "ANG02-Wide", name: "Wide shot", says: "Who they are, and where they are.", use: "Establishing a person in a place, the first shot after an extreme wide.", numbers: "28 mm, WS: the whole body with the set around it, locked at eye height.", avoid: "Leaving it on screen so long nothing has changed." },
    [stand(0, 0)], hold("28mm  WIDE SHOT", "TRIPOD", "WS", (P) => rig.locked(P("ALEX"), { size: "WS", mm: 28, deg: 25 }, 3))),
  make({ id: "ANG03-Full", name: "Full shot", says: "The whole body, head to toe: how they stand, how they carry themselves.", use: "Costume, posture, a walk, a fight stance.", numbers: "35 mm, FS from about 6 m, the feet just inside the bottom edge.", avoid: "Cutting the feet at the ankle: either show them or go wider." },
    [stand(0, 0)], hold("35mm  FULL SHOT", "TRIPOD", "FS", (P) => rig.locked(P("ALEX"), { size: "FS", mm: 35, deg: 25 }, 3))),
  make({ id: "ANG04-Cowboy", name: "Cowboy shot (medium wide)", says: "From the thigh up: the hands and the face are both in play.", use: "Standoffs, gunslingers, anyone whose hands matter as much as their eyes.", numbers: "40 mm, MWS from about 4 m, the frame edge at mid-thigh.", avoid: "Cutting at the knee: the edge should fall between joints." },
    [stand(0, 0)], hold("40mm  COWBOY SHOT", "TRIPOD", "MWS", (P) => rig.locked(P("ALEX"), { size: "MWS", mm: 40, deg: 25 }, 3))),
  make({ id: "ANG05-Medium", name: "Medium shot", says: "The default: person and surroundings in balance.", use: "Dialogue, ordinary coverage, anything that should feel natural.", numbers: "50 mm, MS from the waist up at about 3 m, eyes on the upper third.", avoid: "Using it for everything: it needs closer and wider shots around it." },
    [stand(0, 0)], hold("50mm  MEDIUM SHOT", "TRIPOD", "MS", (P) => rig.locked(P("ALEX"), { size: "MS", mm: 50, deg: 25 }, 3))),
  make({ id: "ANG06-MediumCloseUp", name: "Medium close-up", says: "Close enough to read the face, far enough to keep the body language.", use: "Interviews, the heart of a scene, reaction shots.", numbers: "65 mm, MCU from the chest up at about 2.5 m.", avoid: "Letting the shoulders crop awkwardly: the edge falls at the chest." },
    [stand(0, 0)], hold("65mm  MEDIUM CLOSE-UP", "TRIPOD", "MCU", (P) => rig.locked(P("ALEX"), { size: "MCU", mm: 65, deg: 22 }, 3))),
  make({ id: "ANG07-CloseUp", name: "Close-up", says: "Nothing but the face: this is what they feel.", use: "A reaction, a choice, the line that matters.", numbers: "85 mm, CU from about 2 m, shallow focus, the eyes on the upper third.", avoid: "Using it too early: a close-up has to be earned." },
    [stand(0, 0)], hold("85mm  CLOSE-UP", "TRIPOD", "CU", (P) => rig.locked(P("ALEX"), { size: "CU", mm: 85, deg: 18 }, 3))),
  make({ id: "ANG08-ExtremeCloseUp", name: "Extreme close-up", says: "A detail so near it becomes the whole story: the eyes, a lip, a twitch.", use: "A moment of fear, a lie, a tear, a thing about to happen.", numbers: "100 mm, ECU on both eyes from about 1 m, razor-thin focus.", avoid: "Going beyond the eyes into a single pupil unless the story needs it." },
    [stand(0, 0)], hold("100mm  EXTREME CLOSE-UP", "TRIPOD", "ECU", (P) => rig.locked(P("ALEX"), { size: "ECU", mm: 100, deg: 12 }, 3))),

  // ---------------------------------------------------------------- angles
  make({ id: "ANG10-EyeLevel", name: "Eye level", says: "Neutral: we stand where they stand and judge nothing.", use: "Honest coverage, conversation, anything that should feel real.", numbers: "40 mm, MS, the lens at the subject's eye height, level.", avoid: "Mistaking it for dull: a still, level frame is a choice." },
    [stand(0, 0)], hold("40mm  EYE LEVEL", "TRIPOD", "MS", (P) => rig.locked(P("ALEX"), { size: "MS", mm: 40, deg: 15, rise: 0 }, 3))),
  make({ id: "ANG11-BirdsEye", name: "Bird's-eye (straight down)", says: "We are above it all, looking straight down at someone crossing the ground.", use: "Detachment, fate, a map of a movement, an overhead insert.", numbers: "24 mm from 14 m directly above, locked, a person walking across the frame about 6 m.", avoid: "Letting it run long without a reason: it gets abstract." },
    [ALEX([{ t: 0.3, at: [-3.5, 0.5] }, { t: 6.3, at: [3.5, -0.5] }])],
    hold("24mm  BIRD'S-EYE", "DRONE · DOWN", "WS", (P) => (t: number): Cam => { void P; const pos = V(0, 14, 0.4); return { pos, target: V(0, 0, 0), mm: 24 }; }, 7)),
  make({ id: "ANG12-WormsEye", name: "Worm's-eye (ground level)", says: "The camera lies on the ground and the person towers over it.", use: "Power, threat, a child's view, a dramatic entrance.", numbers: "18 mm at 0.12 m off the ground, 2 m from the feet, the aim 40 degrees up at the face.", avoid: "Hiding the face: the eyes should still be readable." },
    [stand(0, 0)],
    hold("18mm  WORM'S-EYE", "GROUND MOUNT", "MS", (P) => () => { const m = P("ALEX")(0), c = framed(m, { size: "FS", mm: 18, deg: 8 }); const pos = c.pos.clone().setY(0.12); return { pos, target: m.eye.clone().add(V(0, 0.15, 0)), mm: 18 }; })),
  make({ id: "ANG13-Profile", name: "Profile", says: "Seen from the side: a person in thought, in line with something else.", use: "Two people facing each other, a stern portrait, a figure about to turn.", numbers: "70 mm, MCU at 90 degrees to the face, level.", avoid: "Losing the eye line: leave room in front of the face." },
    [stand(0, 0, 0)], hold("70mm  PROFILE", "TRIPOD", "MCU", (P) => rig.locked(P("ALEX"), { size: "MCU", mm: 70, deg: 90 }, 3))),
  make({ id: "ANG14-ThreeQuarter", name: "Three-quarter", says: "The most flattering view of a face: it has depth and still looks at us.", use: "Portraits, interviews, a character introduced warmly.", numbers: "70 mm, MCU at 40 degrees to the face, slightly above eye level.", avoid: "Turning past 60 degrees: it becomes a profile." },
    [stand(0, 0, 0)], hold("70mm  THREE-QUARTER", "TRIPOD", "MCU", (P) => rig.locked(P("ALEX"), { size: "MCU", mm: 70, deg: 40, rise: 0.1 }, 3))),
  make({ id: "ANG15-FromBehind", name: "From behind", says: "We stay behind them, facing what they face.", use: "A decision about to be made, an entrance into a room, a long look at something we cannot see yet.", numbers: "40 mm, MS from behind at 3 m, level, the shoulders filling the lower third.", avoid: "Showing the face at the end: the choice to withhold it is the point." },
    [stand(0, 0, 0)], hold("40mm  FROM BEHIND", "TRIPOD", "MS", (P) => rig.locked(P("ALEX"), { size: "MS", mm: 40, deg: 180 }, 3))),
  make({ id: "ANG16-DutchLow", name: "Dutch and low", says: "The room is crooked and they loom: a threat who is off balance too.", use: "A villain who has lost control, a hallucination, a hero in trouble.", numbers: "20 mm, MS from 1.1 m below eye level, rolled 14 degrees.", avoid: "Doing it with a calm face: the actor has to carry the unease too." },
    [stand(0, 0)], hold("20mm  DUTCH LOW", "TRIPOD · TILTED HEAD", "MS", (P) => withRoll(rig.locked(P("ALEX"), { size: "MS", mm: 20, deg: 15, rise: -1.1 }, 3), (14 * Math.PI) / 180))),
  make({ id: "ANG17-UpsideDown", name: "Upside-down", says: "The world has flipped, and so has the person in it.", use: "Dreams, falling, a mind turned over, a stunt.", numbers: "28 mm, MS, the camera rolled 180 degrees and held, the horizon at the top.", avoid: "Using it as a gag: it works when the story has flipped too." },
    [stand(0, 0)], hold("28mm  UPSIDE-DOWN", "TRIPOD · ROLLED", "MS", (P) => withRoll(rig.locked(P("ALEX"), { size: "MS", mm: 28, deg: 20 }, 3), Math.PI))),
  make({ id: "ANG18-TwoThirdsHigh", name: "High angle (looking down)", says: "We look down on them: small, watched, caught.", use: "Vulnerability, defeat, being observed.", numbers: "28 mm from 3.5 m above eye level, FS looking down about 40 degrees.", avoid: "Going full overhead: that is a bird's-eye, and says something else." },
    [stand(0, 0)], hold("28mm  HIGH ANGLE", "TRIPOD · HIGH", "FS", (P) => rig.locked(P("ALEX"), { size: "FS", mm: 28, deg: 20, rise: 3.5 }, 3))),

  // ---------------------------------------------------------------- lenses
  make({ id: "ANG20-SuperWide", name: "Super wide (14 mm)", says: "The lens pushes the space away from the centre and makes near things huge.", use: "Cramped rooms, action that needs to feel close, a hand coming at us.", numbers: "14 mm, MS from 1.4 m: the face is big, the background stretches, lines lean at the edges.", avoid: "Putting a face at the edge of the frame: it stretches." },
    [stand(0, 0)], hold("14mm  SUPER WIDE", "TRIPOD", "MS", (P) => rig.locked(P("ALEX"), { size: "MS", mm: 14, deg: 12 }, 3))),
  make({ id: "ANG21-UltraWideCloseUp", name: "Ultra wide close-up (10 mm)", says: "A face that is too close: grotesque, funny, frightening.", use: "Comedy, paranoia, a character breaking down, a point-of-view from a hole.", numbers: "10 mm, CU from 0.5 m, the nose large and the ears falling away.", avoid: "Holding it past the joke or the fright." },
    [stand(0, 0)], hold("10mm  ULTRA WIDE CLOSE-UP", "TRIPOD", "CU", (P) => rig.locked(P("ALEX"), { size: "CU", mm: 10, deg: 10 }, 3))),
  make({ id: "ANG22-Fisheye", name: "Fisheye (8 mm)", says: "The whole world bends round the person at the centre.", use: "Skate videos, hip-hop videos, panic, a character losing grip.", numbers: "8 mm fisheye, MS from 1 m: straight lines curve toward the edges, the centre stays natural.", avoid: "A fisheye on every shot: it needs a reason to bend the world." },
    [stand(0, 0)], hold("8mm  FISHEYE", "TRIPOD", "MS", (P) => withFish(rig.locked(P("ALEX"), { size: "MS", mm: 8, deg: 12 }, 3), 1))),
  make({ id: "ANG23-FisheyeLow", name: "Fisheye low (skate-cam)", says: "The ground rushes past and the person walks above it.", use: "Skating, street culture, a hero walk with attitude.", numbers: "8 mm fisheye 0.9 m below eye level, following a walk from behind at 2 m with a little hand shake.", avoid: "Keeping the horizon level: let it bow." },
    [ALEX([{ t: 0.3, at: [0, 7] }, { t: 7, at: [0, -2.6] }])],
    (P) => [{ start: 0, end: 7, label: "8mm  FISHEYE LOW FOLLOW", rig: "HANDHELD · LOW", subject: "ALEX", size: "FS", stop: 4, cam: withFish(rig.shake(rig.follow(P("ALEX"), { size: "FS", mm: 8, deg: 180, rise: -0.9 }), 1.5, 5), 1), cut: "Opens the template", flags: ["enters-moving", "exits-moving"] }]),
  make({ id: "ANG24-Peephole", name: "Peephole", says: "We are on the other side of the door, watching someone arrive.", use: "A thriller, a doorstep, a character who should not open the door.", numbers: "5 mm fisheye at 1.5 m height looking out, the visitor walking in from 8 m to 2 m over 6 s.", avoid: "Showing the visitor's face too soon: let them grow." },
    [ALEX([{ t: 0.3, at: [0, -9], yaw: Math.PI }, { t: 6.6, at: [0, -2.2], yaw: Math.PI }])],
    () => [{ start: 0, end: 7, label: "5mm  PEEPHOLE", rig: "DOOR MOUNT", subject: "ALEX", size: "WS", stop: 4, cam: withFish((): Cam => ({ pos: V(0, 1.55, 3.2), target: V(0, 1.4, -6), mm: 5 }), 1), cut: "Opens the template" }]),
  make({ id: "ANG25-SecurityCam", name: "Security camera", says: "Nobody is meant to see this: a camera in a corner, a person who thinks they are alone.", use: "Surveillance, found footage, a crime seen afterwards.", numbers: "12 mm half-fisheye from a corner 3.6 m up, looking down 30 degrees, a person crossing the room.", avoid: "Cutting from it to a clean shot without a reason." },
    [ALEX([{ t: 0.3, at: [-5, 1] }, { t: 6.7, at: [4.5, -3] }])],
    () => [{ start: 0, end: 7, label: "12mm  SECURITY CAMERA", rig: "WALL MOUNT", subject: "ALEX", size: "WS", stop: 4, cam: withFish((): Cam => ({ pos: V(7, 3.6, 8), target: V(-0.5, 0.6, -1), mm: 12 }), 0.6), cut: "Opens the template", flags: ["enters-moving", "exits-moving"] }]),
  make({ id: "ANG26-LongLens", name: "Long lens (135 mm)", says: "Far away, and flattened: the person and the background are glued together.", use: "Stalking, a crowd, a person lost in a city, a runner who is going nowhere.", numbers: "135 mm, MS from 14 m: the depth is compressed and the trees behind sit flat against the head.", avoid: "Forgetting to leave something sharp: shallow focus does the rest." },
    [stand(0, 0)], hold("135mm  LONG LENS", "TRIPOD", "MS", (P) => rig.locked(P("ALEX"), { size: "MS", mm: 135, deg: 18 }, 3))),
  make({ id: "ANG27-TelephotoCloseUp", name: "Telephoto close-up (200 mm)", says: "Watched from a long way off: a stranger who does not know we are there.", use: "Surveillance, a long wait, a candid portrait.", numbers: "200 mm, CU from 30 m, the background a smear of colour.", avoid: "Shaking: at 200 mm every tremor becomes a swing." },
    [stand(0, 0)], hold("200mm  TELEPHOTO CLOSE-UP", "TRIPOD", "CU", (P) => rig.locked(P("ALEX"), { size: "CU", mm: 200, deg: 14 }, 3))),

  // ---------------------------------------------------------------- heights
  make({ id: "ANG30-HipLevel", name: "Hip level", says: "The camera sits where the hands are: something is about to be drawn.", use: "Gunslingers, a hand on a holster, a fight about to start, a person who looks calm and is not.", numbers: "35 mm, MS from 1 m off the ground, 0.65 m below eye level, level.", avoid: "Losing the face: tilt up a little so the eyes stay in the top third." },
    [stand(0, 0)], hold("35mm  HIP LEVEL", "TRIPOD · LOW", "MS", (P) => rig.locked(P("ALEX"), { size: "MS", mm: 35, deg: 15, rise: -0.65 }, 3))),
  make({ id: "ANG31-KneeLevel", name: "Knee level", says: "Low and close to the floor: a creeping, watchful or comic point of view.", use: "A character sneaking, a pet's or child's view, a person who is bigger than the room.", numbers: "28 mm, FS from 0.5 m off the ground, 1.15 m below eye level.", avoid: "Going so low the face is lost: the head must stay in frame." },
    [stand(0, 0)], hold("28mm  KNEE LEVEL", "TRIPOD · LOW", "FS", (P) => rig.locked(P("ALEX"), { size: "FS", mm: 28, deg: 15, rise: -1.15 }, 3))),
  make({ id: "ANG32-GroundLevelWalk", name: "Ground level walk", says: "We see where they are going by their feet, and nothing of their face.", use: "A mysterious walker, a hit, a delivery, a character we should not know yet.", numbers: "24 mm, 0.2 m off the ground, following a walk from behind at 2.5 m, the shoes and legs only.", avoid: "Cutting to the face right after: keep the withholding going." },
    [ALEX([{ t: 0.3, at: [0, 7] }, { t: 7, at: [0, -2.6] }])],
    (P) => [{ start: 0, end: 7, label: "24mm  GROUND LEVEL WALK", rig: "GROUND MOUNT · DOLLY", subject: "ALEX", size: "FS", stop: 4, cam: rig.follow(P("ALEX"), { size: "MWS", mm: 24, deg: 180, rise: -1.45 }), cut: "Opens the template", flags: ["enters-moving", "exits-moving"] }]),
  make({ id: "ANG33-ShoulderLevel", name: "Shoulder level", says: "A natural, reportage height: slightly below the eyes, so the person is a little taller than us.", use: "Everyday coverage, documentary walks, anything that should feel real but a touch heroic.", numbers: "40 mm, MS with the lens 0.3 m below eye level.", avoid: "Mixing it with true eye-level shots in one scene without a reason." },
    [stand(0, 0)], hold("40mm  SHOULDER LEVEL", "TRIPOD", "MS", (P) => rig.locked(P("ALEX"), { size: "MS", mm: 40, deg: 15, rise: -0.3 }, 3))),

  // ---------------------------------------------------------------- from the reference sheets
  make({ id: "ANG34-HighThreeQuarter", name: "High three-quarter", says: "We look down on them from above and to one side: small, but still a person, not a symbol.", use: "A character who is being watched, a figure in a courtyard, a quiet defeat with some dignity left.", numbers: "28 mm, FS from 3 m above eye level and 45 degrees round, looking down about 35 degrees.", avoid: "Going to full overhead: the face has to stay readable." },
    [stand(0, 0)], hold("28mm  HIGH 3/4", "TRIPOD · HIGH", "FS", (P) => rig.locked(P("ALEX"), { size: "FS", mm: 28, deg: 45, rise: 3 }, 3))),
  make({ id: "ANG35-LowThreeQuarter", name: "Low three-quarter", says: "They rise above us at an angle, and the sky is behind them.", use: "A hero against a skyline, a leader on a step, a person who should look larger than life.", numbers: "24 mm, MS from 1 m below eye level and 45 degrees round, looking up about 25 degrees.", avoid: "Letting the chin hide the eyes." },
    [stand(0, 0)], hold("24mm  LOW 3/4", "TRIPOD · LOW", "MS", (P) => rig.locked(P("ALEX"), { size: "MS", mm: 24, deg: 45, rise: -1 }, 3))),
  make({ id: "ANG36-OverTheHead", name: "Over the head", says: "We are behind and above them, looking down past their head at what they face.", use: "A person at a table, a look at a map, a reveal that the viewer shares with them.", numbers: "28 mm from 2.4 m above eye level, directly behind, looking down about 45 degrees, the head and shoulders in the lower frame.", avoid: "Hiding what they look at: it has to be in the frame." },
    [stand(0, 0, 0)], hold("28mm  OVER THE HEAD", "TRIPOD · HIGH", "MS", (P) => rig.locked(P("ALEX"), { size: "MS", mm: 28, deg: 180, rise: 2.4 }, 3))),
  make({ id: "ANG37-Symmetrical", name: "Symmetrical shot", says: "Everything is balanced round the person in the middle: calm, ceremony, a trap.", use: "A formal portrait, a hallway, a still moment before something breaks the balance.", numbers: "28 mm, FS from the middle of the nave, level, the person on the centre line with a column on each side.", avoid: "Almost symmetrical: it has to be exact or it looks like a mistake." },
    [ALEX([{ t: 0, at: [0, -11], yaw: 0 }])],
    () => [{ start: 0, end: 6, label: "28mm  SYMMETRICAL", rig: "TRIPOD", subject: "ALEX", size: "FS", stop: 6, cam: () => ({ pos: V(0, 1.5, 2.5), target: V(0, 1.4, -14), mm: 28 }), cut: "Opens the template" }]),
  make({ id: "ANG38-FramedShot", name: "Frame within a frame", says: "The person is held inside something else: a doorway, a gap, a pair of columns.", use: "Isolation, being trapped or watched, drawing the eye to one figure.", numbers: "35 mm from 10 m, level, the person standing in the gap between two columns of the nave.", avoid: "A frame that is brighter than the subject: it pulls the eye away." },
    [ALEX([{ t: 0, at: [0, -12.5], yaw: 0 }])],
    () => [{ start: 0, end: 6, label: "35mm  FRAME WITHIN A FRAME", rig: "TRIPOD", subject: "ALEX", size: "FS", stop: 6, cam: () => ({ pos: V(0, 1.5, -2), target: V(0, 1.3, -14), mm: 35 }), cut: "Opens the template" }]),
  make({ id: "ANG39-LeadingLines", name: "Leading lines", says: "Every line in the ground runs to one person.", use: "Directing the eye without a cut, a long approach, a destination.", numbers: "24 mm at 0.7 m height, centred on a paving joint, the person 16 m away where the lines meet.", avoid: "Lines that run past the subject: they must end on them." },
    [ALEX([{ t: 0, at: [0, -9], yaw: 0 }])],
    () => [{ start: 0, end: 6, label: "24mm  LEADING LINES", rig: "GROUND MOUNT", subject: "ALEX", size: "WS", stop: 8, cam: () => ({ pos: V(0, 0.7, 7), target: V(0, 0.9, -9), mm: 24 }), cut: "Opens the template" }]),
  make({ id: "ANG40-SlightLowCloseUp", name: "Slight low-angle close-up", says: "We look up at a face a little: sure of itself, or looking at something above us.", use: "Awe, hope, a hero looking at the sky, a gentle sense of power.", numbers: "70 mm, CU from 0.35 m below eye level, looking up about 10 degrees.", avoid: "Going lower: it becomes a power shot and loses the tenderness." },
    [stand(0, 0, 0.1)], hold("70mm  SLIGHT LOW CU", "TRIPOD", "CU", (P) => rig.locked(P("ALEX"), { size: "CU", mm: 70, deg: 15, rise: -0.35 }, 3))),
];
void aimFor; void THREE;

// ---------------------------------------------------------------- location previews (three views of each place, for checking the sets; not part of the library)
import { LOCATIONS, ENVIRONMENTS } from "./locations";
type View = [number[], number[], number];   // camera position, target, lens (mm)
const VIEWS: Record<string, View[]> = {
  parking: [[[6, 1.6, 12], [-2, 1.4, -8], 28], [[-4, 1.6, -10], [4, 1.4, 10], 28], [[2, 0.4, 6], [-8, 0.9, 6], 28]],
  darkRoom: [[[0.5, 1.4, 3.4], [-1.5, 1.0, -3], 28], [[-2.8, 1.4, -2.8], [3.9, 1.2, 0.5], 24], [[0.5, 2.6, 0.5], [0, 0, 0], 20]],
  austere: [[[1.2, 1.4, 2.9], [-1.8, 0.8, -2.6], 28], [[-1.5, 1.4, -2.8], [3.1, 1.5, 0.4], 24], [[0.8, 0.45, 2], [-1.8, 0.5, -2], 28]],
  platform: [[[-1, 1.6, 10], [6, 1.5, -10], 28], [[3, 1.6, -12], [-2, 1.8, 20], 28], [[0.5, 0.4, 6], [4, 1.2, -15], 28]],
  corridor: [[[0, 1.5, 10], [0, 1.4, -30], 35], [[0.2, 1.5, -8], [0, 1.4, 30], 35], [[0.5, 0.4, 5], [0, 0.8, -20], 28]],
  plaza: [[[4, 1.7, 10], [0, 8, -80], 24], [[-3, 1.7, -8], [-6, 3, 40], 24], [[2, 0.5, 18], [-4, 2, 34], 28]],
  coast: [[[5, 1.7, 6], [0, 2, -60], 28], [[-4, 1.6, -6], [-10, 3, 30], 28], [[-0.5, 0.8, -0.5], [3, 0.7, -3], 35]],
  hotel: [[[0, 1.5, 8], [0, 1.5, -17], 28], [[0.3, 1.5, -6], [0, 1.5, 12.5], 28], [[0.5, 0.4, 4], [0, 1.2, -17], 24]],
  workshop: [[[2.5, 1.5, -3], [0, 1, 0.5], 28], [[-2.8, 1.5, 2.8], [0, 1, -3], 28], [[0.3, 2.6, 0.3], [0, 0.9, 1], 24]],
  lake: [[[2.6, 1.6, 6], [0, 1.3, -14], 35], [[-3, 1.3, -6], [0, 2.2, 22], 35], [[7, 9, 12], [0, 0, 0], 35]],
  mountain: [[[6, 1.8, 8], [0, 6, -60], 35], [[-3, 1.5, -8], [0, 8, 40], 35], [[4, 0.6, 6], [0, 5, -50], 28]],
  street: [[[0, 1.7, 9], [0, 3, -40], 35], [[2, 1.7, -9], [0, 3, 40], 35], [[3, 0.5, 4], [0, 3, -30], 28]],
  forest: [[[3, 1.7, 7], [0, 3, -20], 35], [[-4, 1.7, -6], [0, 3, 25], 35], [[1, 0.5, 3], [0, 12, -10], 28]],
  rooftop: [[[2, 1.6, 6], [0, 6, -60], 35], [[-3, 1.6, -6], [0, 5, 40], 35], [[6, 6, 7], [0, 0, 0], 28]],
  road: [[[1.5, 1.6, 6], [0, 3, -80], 35], [[2, 1.6, -6], [0, 3, 80], 35], [[0.6, 0.4, 5], [0, 2, -60], 28]],
  windowRoom: [[[2.5, 1.5, 4.5], [0, 1.6, -5], 35], [[-2, 1.5, -4.5], [0, 1.8, 5.6], 28], [[0.8, 0.4, 3], [0, 1.8, -5.5], 28]],
  deskRoom: [[[2.8, 1.5, 3.5], [0, 1.2, -3.6], 35], [[-1.5, 1.4, -3], [0.5, 1.2, 4.8], 28], [[3.5, 2.6, 3.5], [0, 0.8, -2], 28]],
  cafe: [[[4, 1.5, 5], [-4, 1.6, -2], 35], [[-6, 1.5, -4], [4, 1.3, 3], 35], [[-2, 0.5, 3], [-7.4, 2, -2], 28]],
  bus: [[[0, 1.35, 6.5], [0, 1.3, -9], 28], [[0, 1.35, -6.5], [0, 1.3, 9], 28], [[0.3, 0.3, 3], [0, 1.2, -9], 24]],
  kitchen: [[[-1.5, 1.5, 2.8], [1, 1.2, -2.5], 28], [[1, 1.5, -1.5], [-1, 1.3, 3.5], 24], [[-0.3, 1.0, -0.8], [-0.6, 1.0, -3.1], 35]],
  bedroom: [[[1.8, 1.4, 3.6], [0, 1.3, -4.2], 28], [[-0.5, 1.4, -3.2], [0, 1.3, 4.5], 24], [[0.5, 0.45, 1], [0, 1.5, -4.2], 28]],
  subway: [[[0, 1.7, 12], [0, 3, -15], 28], [[0, 1.7, -3], [0, 2.5, 20], 24], [[0, 6, 10], [0, 0, -14], 28]],
  bathroom: [[[1.8, 1.5, 2.3], [-0.8, 1, -1], 24], [[-1.8, 1.6, -2], [1.5, 1, 1.5], 24], [[0.2, 2.55, 0.2], [0, 0, 0], 20]],
  lot: [[[4, 1.7, 8], [0, 3, -24], 35], [[-3, 1.7, -8], [0, 3, 40], 28], [[2, 0.5, 6], [0, 3, -24], 28]],
};
const keyOf = (set: unknown) => Object.keys(LOCATIONS).find((k) => LOCATIONS[k] === set || LOCATIONS[k].name === (set as { name: string }).name) as string;
export const PREVIEW_TEMPLATES: Piece[] = Object.entries(ENVIRONMENTS).flatMap(([envId, L]) => VIEWS[keyOf(L)].map(([p, t, mm], n) =>
  baseMake({ id: `ENV-${envId.slice(0, 2)}-${n + 1}`, name: `${envId} ${n + 1}`, says: L.light, use: "Checking the set.", numbers: L.palette, avoid: "" }, [stand(0, 0)],
    () => [{ start: 0, end: 6, label: `${mm}mm  ${envId.slice(3).toUpperCase()}`, rig: "TRIPOD", subject: "ALEX", size: "WS", stop: 4, cam: () => ({ pos: new THREE.Vector3(p[0], p[1], p[2]), target: new THREE.Vector3(t[0], t[1], t[2]), mm }), cut: "Opens the template" }], L)));
