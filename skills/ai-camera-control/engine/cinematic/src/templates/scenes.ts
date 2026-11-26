// Scene templates: ready worlds, each with a short coverage pattern that shows how a scene of that kind is shot.
// Every set is built from the kit; every camera from the named rigs; every frame passes the measured pass.
import * as THREE from "three";
import { planner, scenePiece, type KitWorld, type SceneSpec, type ShotDef } from "../kit/stage";
import type { ActorSpec } from "../kit/actors";
import { GREY, clay } from "../kit/clay";
import { lag, rig } from "../kit/rigs";
import { aimFor } from "../framer";
import { asteroid, bench, broadTree, building, bush, car, carInterior, floorLamp, ground, lampPost, pine, planet, rock, room, scatter, shelf, sofa, table } from "../kit/props";
import { rng } from "../util";
import type { Piece } from "../piece";
import type { TemplateInfo } from "./cameras";

export const SCENE_INFO: (TemplateInfo & { pattern: string })[] = [];
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const make = (info: TemplateInfo & { pattern: string }, spec: Omit<SceneSpec, "id" | "title">, shots: (P: ReturnType<typeof planner>) => ShotDef[]): Piece => {
  SCENE_INFO.push(info);
  const full: SceneSpec = { id: info.id, title: info.name.toUpperCase(), ...spec };
  return scenePiece(full, shots(planner(full)), { scene: info.id });
};
const human = (id: string, name: string, tint: ActorSpec["tint"], path: ActorSpec["path"], extra: Partial<ActorSpec> = {}): ActorSpec => ({ id, name, kind: "human", tint, path, ...extra });

// ---------------- forest clearing: arrival and discovery ----------------
function buildForest(w: KitWorld) {
  w.add(ground(700, 3.5, 13, GREY.ground, 11));
  const keep: [number, number, number][] = [[0, 0, 12.5], [0.4, 15, 3.8], [0.4, 21, 4.2], [0.3, 27, 4.5]];
  const g = new THREE.Group(); w.add(g);
  scatter(g, 150, 13, 90, (i) => (i % 4 === 0 ? broadTree(8 + (i % 5), 40 + i) : pine(10 + (i % 6) * 1.6, 60 + i)), 5, keep);
  scatter(g, 70, 11, 60, (i) => (i % 3 ? rock(200 + i, 0.6 + (i % 5) * 0.5) : bush(1 + (i % 3) * 0.5, 300 + i)), 8, keep);
  const log = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 6, 14), clay(GREY.mid)); log.rotation.z = Math.PI / 2; log.rotation.y = 0.4; log.position.set(6, 0.35, 3.5); log.castShadow = log.receiveShadow = true; w.add(log);
}
// ---------------- interior: a living room ----------------
function buildRoom(w: KitWorld) {
  w.add(ground(200, 0, 50, GREY.mid));
  w.add(room(6.4, 5.2, 2.7, [{ wall: "n", at: 0.6, width: 2.2, bottom: 0.9, top: 2.2 }, { wall: "e", at: 1.3, width: 0.95, bottom: 0, top: 2.1 }]));
  const s = sofa(2.1); s.position.set(-1.75, 0, 0.9); s.rotation.y = Math.PI / 2; w.add(s);
  const tb = table(1.0, 0.6, 0.42); tb.position.set(-0.4, 0, 0.6); w.add(tb);
  const sh = shelf(1.3, 2.0); sh.position.set(-3.0, 0, -1.5); sh.rotation.y = Math.PI / 2; w.add(sh);
  const lp = floorLamp(1.6); lp.position.set(-2.7, 0, 2.2); w.add(lp);
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 2), clay(GREY.set, 0.98)); rug.rotation.x = -Math.PI / 2; rug.position.set(-0.4, 0.005, 0.5); rug.receiveShadow = true; w.add(rug);
  // outside the window: a few trees so the window reads
  for (let i = 0; i < 5; i++) { const t = broadTree(6 + i, 90 + i); t.position.set(-6 + i * 3.2, 0, -9 - (i % 2) * 3); w.add(t); }
}
// ---------------- city street ----------------
function buildStreet(w: KitWorld) {
  w.add(ground(600, 0, 300, GREY.mid));
  const road = new THREE.Mesh(new THREE.PlaneGeometry(8, 400), clay(GREY.dark, 0.95)); road.rotation.x = -Math.PI / 2; road.position.y = 0.01; road.receiveShadow = true; w.add(road);
  for (const s of [-1, 1]) {
    const walk = new THREE.Mesh(new THREE.BoxGeometry(5, 0.16, 400), clay(GREY.set, 0.95)); walk.position.set(s * 6.5, 0.08, 0); walk.receiveShadow = true; w.add(walk);
    w.paving = (x) => (Math.abs(x) > 4 && Math.abs(x) < 9 ? 0.16 : 0);         // the sidewalks: walkers step up the kerb
    const r = rng(s > 0 ? 3 : 4);
    // each block: a random frontage along the street (its width, once turned to face the road), a fixed 10 m depth
    for (let z = -150; z < 150; ) { const f = 10 + r() * 8, h = 12 + r() * 26; const b = building(f, 10, h, Math.floor(r() * 1000), r() > 0.5 ? GREY.light : GREY.set); b.position.set(s * 14.2, 0.16, z + f / 2); b.rotation.y = -s * Math.PI / 2; w.add(b); z += f + 0.4; }
    for (let z = -140; z < 140; z += 16) { const l = lampPost(5); l.position.set(s * 4.4, 0.16, z); l.rotation.y = s > 0 ? -Math.PI / 2 : Math.PI / 2; w.add(l); }
    for (let i = 0; i < 9; i++) { const c = car(GREY.set); c.position.set(s * 2.9, 0, -60 + i * 14 + (s > 0 ? 5 : 0)); c.rotation.y = s > 0 ? Math.PI : 0; w.add(c); }
  }
  for (let x = -3.4; x <= 3.4; x += 0.8) { const st = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.012, 3), clay(GREY.paper, 0.9)); st.position.set(x, 0.02, -12); w.add(st); }
  for (let z = -190; z < 190; z += 6) { const d = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.012, 2.6), clay(GREY.light, 0.9)); d.position.set(0, 0.02, z); w.add(d); }
  const bn = bench(); bn.position.set(8.2, 0.16, 34); bn.rotation.y = -Math.PI / 2; w.add(bn);
}
// ---------------- car interior, on the move ----------------
function buildCar(w: KitWorld) {
  const cab = carInterior(GREY.set); w.add(cab);
  const hood = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.25, 1.5), clay(GREY.set, 0.6)); hood.position.set(0, 0.75, 1.85); hood.castShadow = true; w.add(hood);
  // the world streams past at 14 m/s: road, dashes, poles, trees and blocks in a looping strip
  const strip = new THREE.Group(); w.add(strip, "strip");
  const road = new THREE.Mesh(new THREE.PlaneGeometry(9, 600), clay(GREY.dark, 0.95)); road.rotation.x = -Math.PI / 2; road.position.y = -0.02; road.receiveShadow = true; w.add(road);
  w.add(ground(900, 2, 12, GREY.ground, 21)).position.y = -0.05;
  const r = rng(7);
  for (let z = -300; z < 300; z += 8) { const d = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.01, 3), clay(GREY.light)); d.position.set(-1.9, 0, z); strip.add(d); }
  for (let z = -300; z < 300; z += 22) for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 6, 8), clay(GREY.mid)); p.position.set(s * 6.5, 3, z + s * 6); p.castShadow = true; strip.add(p); }
  for (let z = -300; z < 300; z += 9) for (const s of [-1, 1]) if (r() > 0.35) { const t = r() > 0.4 ? pine(8 + r() * 6, Math.floor(r() * 99)) : broadTree(7 + r() * 4, Math.floor(r() * 99)); t.position.set(s * (11 + r() * 18), 0, z); strip.add(t); }
}
const tickCar = (w: KitWorld, t: number) => { const s = w.parts.get("strip")!; s.position.z = -((t * 14) % 264) + 132; };
// ---------------- space: a ship and a planet ----------------
function buildSpace(w: KitWorld) {
  const p = planet(650, true); p.position.set(-700, -180, -2300); w.add(p);
  const g = new THREE.Group(); w.add(g);
  const r = rng(12);
  for (let i = 0; i < 60; i++) { const a = asteroid(500 + i, 4 + r() * 22); a.position.set((r() - 0.5) * 900, (r() - 0.5) * 160, -60 - r() * 700); a.rotation.set(r() * 6, r() * 6, 0); g.add(a); }
}

export const SCENE_TEMPLATES: Piece[] = [
  make({ id: "SC01-ForestClearing", name: "Forest clearing", pattern: "Arrival → follow → reaction push → reverse on the discovery → release", says: "A person arrives somewhere and finds something.", use: "Openings, discoveries, any scene where a character enters a new place.", numbers: "Crane down 28 mm, Steadicam follow 32 mm, push-in 50 mm MCU→CU, reverse OTS 50 mm, crane up 24 mm.", avoid: "Showing the discovery before the reaction: the face comes first (rulebook §5)." },
    { sky: "day", build: buildForest, keyDir: [-0.5, 0.72, 0.42], motes: { center: [0, 2.5, 6], size: [30, 6, 30], count: 220 },
      actors: [human("ALEX", "Alex", "ochre", [{ t: 0.3, at: [0.5, 17.6] }, { t: 10.3, at: [0.4, 3.8], yaw: Math.PI }], { acts: [{ kind: "lookUp", t0: 10.6, t1: 13.6 }] }),
        { id: "STONE", name: "Standing stone", kind: "prop", model: "monolith", tint: "plum", path: [{ t: 0, at: [0, -3.5], yaw: 0 }] }] },
    (P) => [
      { start: 0, end: 5, label: "28mm  CRANE DOWN · ARRIVAL", rig: "TECHNOCRANE", subject: "ALEX", size: "EWS", sizeEnd: "WS", stop: 5.6, cam: rig.crane(P("ALEX"), { size: "WS", mm: 28, deg: 200 }, 5.5, 1.2, 0, 5, 1.25), cut: "FADE IN on the forest", flags: ["compound", "exits-moving"] },
      { start: 5, end: 10, label: "32mm  STEADICAM FOLLOW", rig: "STEADICAM", subject: "ALEX", size: "MWS", stop: 2.8, cam: rig.follow(P("ALEX"), { size: "MWS", mm: 32, deg: 180, rise: 0.2 }), cut: "CUT in behind her: same direction of travel", flags: ["enters-moving", "exits-moving", "centre"] },
      { start: 10, end: 13.5, label: "55mm  PUSH IN · REACTION", rig: "DOLLY", subject: "ALEX", size: "MCU", sizeEnd: "CU", stop: 2, cam: rig.dolly(P("ALEX"), { size: "MCU", mm: 55, deg: 18 }, "CU", 10, 13.5, 0.4), cut: "CUT round to her face: she stops and looks up" },
      { start: 13.5, end: 17.5, label: "50mm  REVERSE OTS · THE STONE", rig: "STEADICAM", subject: "STONE", size: "FS", stop: 2.8, ots: "ALEX", cam: rig.ots(P("ALEX"), P("STONE"), 50, 1, 2.4, 0.6), cut: "CUT to what she sees, over her shoulder", flags: ["centre"] },
      { start: 17.5, end: 22, label: "24mm  CRANE UP · RELEASE", rig: "TECHNOCRANE", subject: "ALEX", size: "WS", sizeEnd: "EWS", stop: 5.6, cam: rig.crane(P("ALEX"), { size: "WS", mm: 24, deg: 150 }, 0.8, 11, 17.5, 22, 1.8), cut: "CUT wide: the release", flags: ["compound"] },
    ]),

  make({ id: "SC02-InteriorDialogue", name: "Interior dialogue", pattern: "Master two-shot → OTS → reverse OTS → close-up at the turn → master from a new angle", says: "Two people talk; the camera tells us whose moment it is.", use: "Any two-person scene: a confession, an argument, an interview.", numbers: "Master 28 mm, OTS pair 75 mm matched, close-up 65 mm, every camera on one side of the line between them.", avoid: "Crossing the line, or cutting in to the close-up before the turn of the scene." },
    { sky: "interior", build: buildRoom, keyDir: [0.25, 0.6, -0.76], motes: { center: [0, 1.4, 0], size: [6, 2.6, 5], count: 140, drift: [0.03, 0.01, 0.02] },
      actors: [human("ALEX", "Alex", "ochre", [{ t: 0, at: [-1.45, 0.9], yaw: Math.PI / 2 }], { acts: [{ kind: "sit", t0: -1 }, { kind: "talk", t0: 7, t1: 14.5 }], look: "SAM" }),
        human("SAM", "Sam", "slate", [{ t: 0, at: [1.6, -1.2], yaw: -2.2 }], { look: "ALEX", acts: [{ kind: "talk", t0: 0, t1: 7.5 }] })] },
    (P) => {
      const mid = V(0.1, 1.15, -0.15), M1 = V(2.85, 1.55, 2.4), M2 = V(-2.3, 1.45, 2.3);
      return [
        { start: 0, end: 4, label: "24mm  MASTER TWO-SHOT", rig: "TRIPOD", subject: "SAM", size: "MWS", stop: 4, pair: ["ALEX", "SAM"], cam: () => ({ pos: M1.clone(), target: aimFor(M1, mid, 24, [0, 0]), mm: 24 }), cut: "Opens on the master", flags: ["centre"] },
        { start: 4, end: 7.5, label: "75mm  OTS · ALEX ON SAM", rig: "STEADICAM", subject: "SAM", size: "MS", stop: 2, ots: "ALEX", pair: ["ALEX", "SAM"], cam: rig.ots(P("ALEX"), P("SAM"), 75, 1, 2.4, 0.72), cut: "CUT in over her shoulder" },
        { start: 7.5, end: 11, label: "75mm  REVERSE OTS · SAM ON ALEX", rig: "STEADICAM", subject: "ALEX", size: "MS", stop: 2, ots: "SAM", pair: ["ALEX", "SAM"], reverse: 2, cam: rig.ots(P("SAM"), P("ALEX"), 75, -1, 2.4, 0.72), cut: "CUT to the reverse, same side of the line" },
        { start: 11, end: 14, label: "65mm  CLOSE-UP · THE TURN", rig: "DOLLY", subject: "ALEX", size: "MCU", sizeEnd: "CU", stop: 2, pair: ["ALEX", "SAM"], cam: rig.dolly(P("ALEX"), { size: "MCU", mm: 65, deg: -10 }, "CU", 11, 14, 0.4), cut: "CUT in tighter: the turn of the scene" },
        { start: 14, end: 17.5, label: "28mm  MASTER · NEW ANGLE", rig: "TRIPOD", subject: "SAM", size: "WS", stop: 4, pair: ["ALEX", "SAM"], cam: () => ({ pos: M2.clone(), target: aimFor(M2, mid, 28, [0, 0]), mm: 28 }), cut: "CUT back out to the master, 30°+ from the first", flags: ["centre"] },
      ];
    }),

  make({ id: "SC03-StreetWalkTalk", name: "Street walk-and-talk", pattern: "High establishing → Steadicam lead two-shot → tracking single → low-angle wide", says: "Two people on the move, talking; the city carries on around them.", use: "Walk-and-talks, chases on foot, arrivals in a city.", numbers: "Establishing 24 mm from 8 m up over the road, lead 32 mm, long-lens tracking 85 mm from across the road (over the parked cars), low wide 20 mm.", avoid: "Losing screen direction: they keep walking the same way in every shot." },
    { sky: "day", build: buildStreet, keyDir: [0.55, 0.7, 0.45], motes: { center: [5, 2, 4], size: [24, 5, 40], count: 200 },
      actors: [human("ALEX", "Alex", "ochre", [{ t: 0.2, at: [6.7, 14] }, { t: 14.6, at: [6.7, -6.5] }], { look: "SAM", lookFrom: 4, lookTo: 7 }),
        human("SAM", "Sam", "slate", [{ t: 0.2, at: [7.55, 14.4] }, { t: 14.6, at: [7.55, -6.1] }], { look: "ALEX", lookFrom: 8, lookTo: 11 })] },
    (P) => [
      { start: 0, end: 4, label: "24mm  HIGH ESTABLISHING", rig: "TECHNOCRANE", subject: "ALEX", size: "WS", stop: 5.6, cam: () => { const pos = V(2.2, 9.5, 27); return { pos, target: V(5.8, 1, 4), mm: 24 }; }, cut: "Opens high on the street", flags: ["centre"] },
      { start: 4, end: 8, label: "32mm  STEADICAM LEAD · TWO-SHOT", rig: "STEADICAM", subject: "ALEX", size: "FS", stop: 2.8, cam: rig.follow(P("ALEX"), { size: "FS", mm: 32, deg: 18, rise: 0.05 }), cut: "CUT to the front: they walk at us", flags: ["enters-moving", "exits-moving", "short-side"] },
      { start: 8, end: 11, label: "85mm  LONG-LENS TRACKING", rig: "CAMERA CAR · ACROSS THE ROAD", subject: "ALEX", size: "MS", stop: 2.8, cam: rig.track(P("ALEX"), { size: "MS", mm: 85, rise: 0.55 }, 1, 0.6), cut: "CUT to the side: same direction of travel", flags: ["enters-moving", "exits-moving"] },
      { start: 11, end: 14.5, label: "20mm  LOW-ANGLE WIDE", rig: "TRIPOD · LOW HAT", subject: "ALEX", size: "WS", stop: 4, cam: rig.locked(P("ALEX"), { size: "FS", mm: 20, deg: -25, rise: -0.62 }, 13.8), cut: "CUT low ahead of them: they walk into the frame", flags: ["centre"] },
    ]),

  make({ id: "SC04-CarInterior", name: "Car interior", pattern: "Windshield two-shot → driver single → passenger single → POV of the road", says: "Two people trapped together in motion: intimacy, tension, a confession.", use: "Dialogue in a moving vehicle; road trips; an escape.", numbers: "Windshield two-shot 28 mm, singles 32 mm from the windshield corners (both in front: one side of the line), POV 24 mm.", avoid: "A static world outside: the road must move or the car reads as parked." },
    { sky: "day", build: buildCar, tick: tickCar, keyDir: [0.4, 0.65, 0.65],
      actors: [human("ALEX", "Alex", "ochre", [{ t: 0, at: [-0.38, 0.1, 0.06], yaw: 0 }], { acts: [{ kind: "drive", t0: -1 }], look: "SAM", lookFrom: 2.2, lookTo: 3.8 }),
        human("SAM", "Sam", "slate", [{ t: 0, at: [0.38, 0.1, 0.06], yaw: 0 }], { acts: [{ kind: "sit", t0: -1 }, { kind: "talk", t0: 6.5, t1: 10 }], look: "ALEX", lookFrom: 7.5, lookTo: 9.5 }),
        { id: "LEAD", name: "Car ahead", kind: "prop", model: "car", tint: "sand", path: [{ t: 0, at: [0.1, 24], yaw: 0 }] }] },
    (P) => {
      const W = V(0, 1.15, 2.9), D = V(0.55, 1.2, 1.75), Ps = V(-0.55, 1.2, 1.75), POV = V(0, 1.2, -0.05);
      const mid = V(0, 1.12, 0.05);
      return [
        { start: 0, end: 4, label: "28mm  WINDSHIELD TWO-SHOT", rig: "HOOD MOUNT", subject: "ALEX", size: "MS", stop: 2.8, pair: ["ALEX", "SAM"], cam: () => ({ pos: W.clone(), target: aimFor(W, mid, 28, [0, -0.06]), mm: 28 }), cut: "Opens through the windshield", flags: ["centre"] },
        { start: 4, end: 7, label: "32mm  DRIVER SINGLE", rig: "HOOD MOUNT · OFFSET", subject: "ALEX", size: "MCU", stop: 2, pair: ["ALEX", "SAM"], cam: (t) => ({ pos: D.clone(), target: aimFor(D, lag((x) => P("ALEX")(x).eye, t, 0.8), 32, [0.3, 1 / 3]), mm: 32 }), cut: "CUT to the driver from the windshield, on the passenger side" },
        { start: 7, end: 10, label: "32mm  PASSENGER SINGLE", rig: "HOOD MOUNT · OFFSET", subject: "SAM", size: "MCU", stop: 2, pair: ["ALEX", "SAM"], reverse: 2, cam: (t) => ({ pos: Ps.clone(), target: aimFor(Ps, lag((x) => P("SAM")(x).eye, t, 0.8), 32, [-0.3, 1 / 3]), mm: 32 }), cut: "CUT to the passenger: the reverse, same side of the line" },
        { start: 10, end: 13, label: "24mm  POV · THE ROAD", rig: "HANDHELD", subject: "LEAD", size: "WS", stop: 5.6, cam: () => ({ pos: POV.clone(), target: V(0, 1.0, 30), mm: 24 }), cut: "CUT to what they see: the road ahead", flags: ["centre"] },
      ];
    }),

  make({ id: "SC05-SpaceFlyby", name: "Space flyby", pattern: "Locked wide with the planet → chase drone → flyby pan → long-lens recede", says: "Scale and speed: a small ship against an enormous world.", use: "Openings in space, travel, the arrival at a planet.", numbers: "Wide 35 mm, chase 28 mm, flyby 35 mm, recede 85 mm.", avoid: "Losing scale: keep the planet or a near rock in frame to measure the ship by." },
    { sky: "space", build: buildSpace, keyDir: [0.7, 0.35, 0.6],
      actors: [{ id: "SHIP", name: "Ship", kind: "prop", model: "ship", tint: "plum", path: [{ t: 0, at: [50, 12, 60] }, { t: 17, at: [-150, -30, -560] }] }] },
    (P) => [
      { start: 0, end: 5, label: "35mm  LOCKED WIDE · THE PLANET", rig: "TRIPOD", subject: "SHIP", size: "EWS", stop: 8, cam: () => { const pos = V(46, 16, 96); return { pos, target: V(-700, -180, -2300), mm: 35 }; }, cut: "Opens on the planet", flags: ["centre"], shadow: 60 },
      { start: 5, end: 9.5, label: "28mm  CHASE DRONE", rig: "CHASE DRONE · GIMBAL", subject: "SHIP", size: "WS", stop: 5.6, cam: rig.chase(P("SHIP"), 17, 4.5, 28, 3, 1.0), cut: "CUT behind it, matched to its speed", flags: ["enters-moving", "exits-moving", "centre", "compound"], shadow: 40 },
      { start: 9.5, end: 13, label: "35mm  FLYBY PAN", rig: "TRIPOD · FLUID HEAD", subject: "SHIP", size: "WS", stop: 5.6, cam: (t) => { const pos = V(-70, -16, -380), e = lag((x) => P("SHIP")(x).eye, t, 0.12); return { pos, target: aimFor(pos, e, 35, [0, 0]), mm: 35 }; }, cut: "CUT ahead: it passes the lens", flags: ["enters-moving", "exits-moving", "centre", "compound"], shadow: 40 },
      { start: 13, end: 17, label: "85mm  LONG-LENS RECEDE", rig: "TRIPOD", subject: "SHIP", size: "EWS", stop: 8, cam: (t) => { const pos = V(-112, -2, -370), e = lag((x) => P("SHIP")(x).eye, t, 0.3); return { pos, target: aimFor(pos, e, 85, [0, 0]), mm: 85 }; }, cut: "CUT behind: it falls away toward the planet", flags: ["centre"], shadow: 60 },
    ]),
];
