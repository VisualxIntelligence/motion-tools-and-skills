// The motion check: what the camera checks cannot see. For every rigged body over the whole piece, every 0.1 s:
//   TOUCH  a body's trunk or joints pass through another body, or a joint is inside a set piece (sitting and driving
//          bodies may touch their seat and wheel)
//   SINK   the lowest point of the skin goes more than 1.5 cm under the floor beneath it (ground, roof or step)
//   SLIDE  the sole vertices on the floor move faster than 15% of the body's speed (median over the walk; frames over
//          100% are listed: a skate). A foot counts as planted with 3 or more vertices at the floor (fewer is a toe leaving)
//   HEAD   the head turns more than 25° between two renders 1/192 s apart (a ghost in the motion blur)
//   tools/motion.sh                    -> every template
//   ONLY=SC06 tools/motion.sh          -> the templates whose id starts with SC06
import * as THREE from "three";
import { PIECES } from "../src/pieces";
import { loadRigNode } from "./rig-node";
await loadRigNode();

const ids = Object.keys(PIECES).filter((k) => /^[A-Z]{2,6}\d/.test(k) && (!process.env.ONLY || process.env.ONLY.split(",").some((o) => k.startsWith(o))));
const sh = { center: new THREE.Vector3(), size: 20 }, v = new THREE.Vector3(), ray = new THREE.Raycaster(), DOWN = new THREE.Vector3(0, -1, 0);
if (!ids.length) { console.error("motion check: no template id matched" + (process.env.ONLY ? ` ONLY=${process.env.ONLY}` : "") + ". An id looks like CAM06-Orbit or MY01-SlowPush."); process.exit(2); }
let failed = 0;
for (const id of ids) {
  const P: any = PIECES[id]; const w: any = P.makeWorld({}); const end = P.shots[P.shots.length - 1].end;
  // actors live on the scene's clock (speed ramps, frozen moments): read their speed and floor in world time
  const W = (t: number) => (w.spec?.clock ? w.spec.clock(t) : t);
  const actors = [...w.actors.entries()].filter(([, a]: any) => a.rig) as [string, any][];
  const notes: string[] = [];
  const owned = new Set<THREE.Object3D>(); for (const [, a] of actors) a.root.traverse((o: any) => owned.add(o));
  const skins = new Map(actors.map(([k, a]) => { const m: any[] = []; a.root.traverse((o: any) => { if (o.isSkinnedMesh) m.push(o); }); return [k, m]; }));
  const touch = new Map<string, number[]>(), add = (k: string, t: number) => { if (!touch.has(k)) touch.set(k, []); touch.get(k)!.push(t); };
  let sink = 0, sinkT = 0; const slide: Record<string, number[]> = {}; const skate: string[] = []; let head = 0, headT = 0;
  for (let t = 0; t < end; t += 0.1) {
    w.update(t, sh); w.scene.updateMatrixWorld(true);
    const solids: { name: string; box: THREE.Box3 }[] = [];
    w.scene.traverse((o: any) => {
      if (!o.isMesh || owned.has(o) || o.userData.noPathTrace || o.isInstancedMesh) return;
      const b = new THREE.Box3().setFromObject(o), s = b.getSize(v);
      if (s.y < 0.12 || s.x > 60 || s.z > 60 || b.min.y > 2.4) return;
      let n = o; while (n.parent && !n.name && n.parent !== w.scene) n = n.parent;
      solids.push({ name: n.name || o.geometry.type, box: b });
    });
    // walkable surfaces (not paving joints or road paint: strips under 2 cm thick are decals, not floors)
    const floors: THREE.Object3D[] = []; w.scene.traverse((o: any) => { if (o.isMesh && !owned.has(o) && !o.userData.noPathTrace && !o.isInstancedMesh && new THREE.Box3().setFromObject(o).getSize(v).y >= 0.02) floors.push(o); });
    const seated = (a: any) => a.act("sit", W(t)) > 0.2 || a.act("drive", W(t)) > 0.2;
    const floorOf = new Map<string, number>();
    for (const [k, a] of actors) {
      const m = a.rig.marks();
      // joints inside the set
      if (!seated(a)) for (const s of solids) for (const j of m.joints) if (s.box.containsPoint(j.p)) { add(`${k}.${j.name} in ${s.name}`, t); break; }
      // joints inside another body's trunk
      for (const [k2, b] of actors) if (b !== a) {
        const mb = b.rig.marks();
        for (const j of m.joints) if (j.p.y > mb.ankle.y && j.p.y < mb.top.y && Math.hypot(j.p.x - mb.waist.x, j.p.z - mb.waist.z) < 0.15 * b.scale) { add(`${k}.${j.name} in ${k2}`, t); break; }
      }
      // sinking: the lowest skin point under the floor (a flight or a jump is fine; under is not)
      let low = Infinity; for (const s of skins.get(k)!) { const pos = s.geometry.attributes.position; for (let i = 0; i < pos.count; i += 4) { s.getVertexPosition(i, v); v.applyMatrix4(s.matrixWorld); if (v.y < low) low = v.y; } }
      // the floor under the body: the highest surface below its hips (a roof, a step, the ground), found by a ray
      ray.set(new THREE.Vector3(m.waist.x, m.waist.y + 0.3, m.waist.z), DOWN);
      const hit = ray.intersectObjects(floors, false).find((h) => h.point.y < m.waist.y);
      const floor = hit ? hit.point.y : 0;
      floorOf.set(k, floor);
      if (floor - low > sink && !seated(a)) { sink = floor - low; sinkT = t; }
    }
    // foot slide and head steadiness need a second render a moment later
    // speed in film time: how fast the body crosses the frame between the two renders
    const sp = new Map(actors.map(([k, a]) => [k, a.speed(W(t)) * Math.max(0, (W(t + 1 / 192) - W(t)) * 192)]));
    const before = new Map(actors.map(([k, a]) => {
      const pts: THREE.Vector3[] = []; for (const s of skins.get(k)!) { const pos = s.geometry.attributes.position; for (let i = 0; i < pos.count; i++) { s.getVertexPosition(i, v); pts.push(v.clone().applyMatrix4(s.matrixWorld)); } }
      // on the floor means on the set's surface under the body, not at its path height (mid-air in a jump)
      return [k, { pts, hq: a.rig.bone.Head.getWorldQuaternion(new THREE.Quaternion()), g: floorOf.get(k) ?? 0 }];
    }));
    w.update(t + 1 / 192, sh); w.scene.updateMatrixWorld(true);
    for (const [k, a] of actors) {
      const B = before.get(k)!; let n = 0, s = 0, i = 0;
      for (const sk of skins.get(k)!) { const pos = sk.geometry.attributes.position; for (let q = 0; q < pos.count; q++, i++) { const p0 = B.pts[i]; if (p0.y < B.g + 0.003 && p0.y > B.g - 0.03) { sk.getVertexPosition(q, v); v.applyMatrix4(sk.matrixWorld); s += Math.hypot(v.x - p0.x, v.z - p0.z) * 192; n++; } } }
      const spd = sp.get(k)!;
      if (n >= 3 && spd > 0.3 && !(a.act("sit", W(t)) > 0.2)) { const r = s / n / spd; (slide[k] ??= []).push(r); if (r > 1) skate.push(`${k}@${t.toFixed(1)}`); }
      const turn = THREE.MathUtils.radToDeg(B.hq.angleTo(a.rig.bone.Head.getWorldQuaternion(new THREE.Quaternion())));
      if (turn > head) { head = turn; headT = t; }
    }
  }
  for (const [k, ts] of touch) notes.push(`TOUCH ${k} ${ts[0].toFixed(1)}–${ts[ts.length - 1].toFixed(1)}s`);
  if (sink > 0.015) notes.push(`SINK ${(sink * 100).toFixed(1)} cm @${sinkT.toFixed(1)}s`);
  for (const [k, r] of Object.entries(slide)) { r.sort((a, b) => a - b); const med = r[r.length >> 1]; if (med > 0.15) notes.push(`SLIDE ${k} median ${(med * 100).toFixed(0)}%`); }
  if (skate.length) notes.push(`SLIDE skates ${skate.slice(0, 5).join(" ")}${skate.length > 5 ? " …" : ""}`);
  if (head > 25) notes.push(`HEAD ${head.toFixed(0)}° in 1/192 s @${headT.toFixed(1)}s`);
  if (notes.length) failed++;
  console.log(id.padEnd(28), notes.length ? notes.join(" · ") : "clean");
}
console.log(`\n${failed} of ${ids.length} with notes`);
if (process.env.STRICT && failed) process.exit(1);   // STRICT=1: a note is a failed check (for CI)
