// The camera lab: a neutral clay plaza built to show camera moves. A ring of columns and a stair give near parallax,
// trees and blocks give depth, low walls and props give scale. The centre (radius 9 m) is kept clear for the action.
import * as THREE from "three";
import type { KitWorld } from "../kit/stage";
import { GREY, clay } from "../kit/clay";
import { bench, broadTree, building, column, crate, barrel, ground, lampPost, pine, rock, scatter, steps } from "../kit/props";

export function buildLab(w: KitWorld) {
  w.add(ground(500, 2.5, 26, GREY.ground));
  // the plaza: a slightly lighter disc of paving with joints
  const plaza = new THREE.Mesh(new THREE.CylinderGeometry(17, 17, 0.08, 96), clay(GREY.set, 0.95)); plaza.position.y = 0.04; plaza.receiveShadow = true; w.add(plaza);
  w.paving = (x, z) => (Math.hypot(x, z) < 17 ? 0.08 : 0);                     // everyone walks on the paving, not in it
  for (let i = -16; i <= 16; i += 2) {
    const len = 2 * Math.sqrt(Math.max(0, 17 * 17 - i * i));
    for (const rot of [0, Math.PI / 2]) { const j = new THREE.Mesh(new THREE.BoxGeometry(len, 0.01, 0.03), clay(GREY.mid, 0.95)); j.position.set(rot ? i : 0, 0.0755, rot ? 0 : i); j.rotation.y = rot; j.receiveShadow = true; w.add(j); }
  }
  // a colonnade on the north half, a gap to the south so cameras can look out
  for (let i = 0; i < 9; i++) { const a = Math.PI * (0.05 + (0.9 * i) / 8); const c = column(5.5, 0.36); c.position.set(Math.cos(a) * 14.5, 0.08, -Math.sin(a) * 14.5); w.add(c); }
  const beam = new THREE.Mesh(new THREE.TorusGeometry(14.5, 0.25, 8, 64, Math.PI * 0.92), clay(GREY.set)); beam.rotation.x = Math.PI / 2; beam.rotation.z = Math.PI * 0.04; beam.position.y = 5.6; beam.castShadow = true; w.add(beam);
  // a stair rising west to a terrace
  const st = steps(7, 7, 0.17, 0.4); st.position.set(-15.5, 0.08, 1.4); st.rotation.y = -Math.PI / 2; w.add(st);
  const terrace = new THREE.Mesh(new THREE.BoxGeometry(8, 1.2, 9), clay(GREY.set)); terrace.position.set(-21.2, 0.6, 1.4); terrace.castShadow = terrace.receiveShadow = true; w.add(terrace);
  // low walls and props on the south and east edges
  for (const [x, z, ry, len] of [[11, 9, 0.6, 6], [-9, 11.5, -0.4, 5]] as const) { const wl = new THREE.Mesh(new THREE.BoxGeometry(len, 0.9, 0.4), clay(GREY.light)); wl.position.set(x, 0.53, z); wl.rotation.y = ry; wl.castShadow = wl.receiveShadow = true; w.add(wl); }
  const props: [THREE.Object3D, number, number, number][] = [[bench(), 6.5, 11.8, 0.3], [bench(), -11.5, -6.5, 1.2], [crate(0.9), 13.2, 4.2, 0.3], [crate(0.7), 13.6, 5.3, 0.9], [barrel(1), 12.4, 5.6, 0], [lampPost(4.6), 9.5, -12.5, 2.3], [lampPost(4.6), -3, 16, 3.5], [lampPost(4.6), 16.5, 2, -1.6]];
  for (const [o, x, z, ry] of props) { o.position.set(x, 0.08, z); o.rotation.y = ry; w.add(o); }
  // trees and rocks in a ring beyond, blocks on the far horizon
  const trees = new THREE.Group(); w.add(trees);
  scatter(trees, 46, 22, 60, (i) => (i % 3 === 0 ? broadTree(7 + (i % 4), i) : pine(9 + (i % 5) * 1.5, i)), 21, [[-21, 1.4, 7]]);
  scatter(trees, 26, 19, 45, (i) => rock(100 + i, 0.8 + (i % 4) * 0.6), 33, [[-21, 1.4, 7]]);
  for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2 + 0.3, d = 110 + (i % 3) * 25; const b = building(14 + (i % 3) * 4, 12, 18 + (i % 4) * 9, i); b.position.set(Math.cos(a) * d, 0, Math.sin(a) * d); b.rotation.y = -a + Math.PI / 2; w.add(b); }
}
