// Where each character (and the key places and props) sits in every reference frame, measured through the real
// camera: project their world positions, test that they are in frame and not hidden behind something.
//   tools/callouts -> stdout JSON [{ film, items: [{ name, x, y, dist }] }]   (x, y in pixels of the 1920x804 picture)
import * as THREE from "three";
import fs from "fs";
import { PIECES } from "../src/pieces";
import { place, realCam } from "../src/camera";
import { LAMP, PORT, ship, shipWorld } from "../src/ether/story";

const piece = PIECES[process.env.PIECE ?? "Rootsong"], off = piece.offset ?? 0;
const world: any = piece.makeWorld({});
const rows = JSON.parse(fs.readFileSync(process.argv[2], "utf-8"));
const cam = new THREE.PerspectiveCamera();
const rc = new THREE.Raycaster();
const meshes: THREE.Object3D[] = [];
world.scene.traverse((o: any) => { if (o.isMesh && !(o.geometry?.parameters?.radius >= 2000) && !o.material?.transparent && o.material?.blending !== THREE.AdditiveBlending) meshes.push(o); });
const owner = (o: THREE.Object3D | null): any => { while (o) { if ((o as any).__who) return (o as any).__who; o = o.parent; } return null; };
world.marigold.g.__who = "THE MARIGOLD"; world.pellFig.root.__who = "PELL"; world.captainFig.root.__who = "CAPTAIN ODALYS"; world.braskFig.root.__who = "BRASK"; world.rider.__who = "PELL";
const out: any[] = [];
for (const r of rows) {
  const t = r.film - off;
  const shot = piece.shotAt(t);
  const c = realCam(shot, t, piece.fps).cam;
  world.setCamera?.(c.pos, c.target);
  world.update(t, shot.shadow(t));
  world.scene.updateMatrixWorld(true);
  place(cam, c);
  const head = (f: any) => { const v = new THREE.Vector3(); f.headJ.getWorldPosition(v); return v.add(new THREE.Vector3(0, 0.12, 0)); };
  const seed = world.seed.position.clone();
  const cand: { name: string; p: THREE.Vector3; self?: string; minD?: number; maxD?: number }[] = [
    { name: "PELL", p: head(world.pellFig), self: "PELL" },
    { name: "CAPTAIN ODALYS", p: head(world.captainFig), self: "CAPTAIN ODALYS" },
    { name: "BRASK (NAVIGATOR)", p: head(world.braskFig), self: "BRASK" },
    { name: "THE MARIGOLD", p: ship(t).pos.clone().add(new THREE.Vector3(0, 3, 0)), minD: 22, self: "THE MARIGOLD" },
    { name: "THE MARIGOLD", p: ship(t).pos.clone().add(new THREE.Vector3(2, 24, 0)), minD: 60, self: "THE MARIGOLD" },
    { name: "THE MARIGOLD", p: shipWorld(t, new THREE.Vector3(2, 30, 0)), minD: 25, self: "THE MARIGOLD" },
    { name: "LANTERN SEED", p: seed, maxD: 12 },
    { name: "SOLAR BOARD", p: world.rider.position.clone().add(new THREE.Vector3(0, 0.08, 0)), maxD: 6 },
    { name: "LANTERNFALL", p: PORT.clone().add(new THREE.Vector3(0, 22, 0)), minD: 120, maxD: 900 },
    { name: "LIGHTHOUSE", p: LAMP.clone(), minD: 25 },
  ];
  const items: any[] = [];
  for (const k of cand) {
    if (items.some((i) => i.name === k.name)) continue;   // one label per name
    const d = k.p.distanceTo(c.pos);
    if (k.minD && d < k.minD) continue;
    if (k.maxD && d > k.maxD) continue;
    const n = k.p.clone().project(cam);
    if (process.env.DEBUG) console.error(r.film, k.name, d.toFixed(1), n.x.toFixed(2), n.y.toFixed(2), n.z.toFixed(3));
    if (n.z > 1 || Math.abs(n.x) > 0.97 || Math.abs(n.y) > 0.985) continue;
    rc.set(c.pos, k.p.clone().sub(c.pos).normalize()); rc.far = d; rc.near = 0.05;
    // hidden only by the set itself (another character in front still leaves this one readable)
    const big = ((k.name === "LIGHTHOUSE" || k.name === "LANTERNFALL") && t > 40) || k.name === "LANTERN SEED";
    const hit = rc.intersectObjects(meshes, false).find((h) => { const o = owner(h.object); return o !== k.self && !(o && o !== "THE MARIGOLD") && h.distance < d * 0.8 - 0.3; });
    if (hit && !big) continue;
    items.push({ name: k.name, x: Math.round((n.x + 1) / 2 * 1920), y: Math.round((1 - n.y) / 2 * 804), dist: +d.toFixed(1) });
  }
  out.push({ film: r.film, items });
}
console.log(JSON.stringify(out));
