// Every template's card for the gallery: what it says, when to use it, its numbers, its shots and their still times.
import { PIECES } from "../src/pieces";
import { CAMERA_INFO } from "../src/templates/cameras";
import { SCENE_INFO } from "../src/templates/scenes";
const info = new Map([...CAMERA_INFO, ...SCENE_INFO].map((i) => [i.id, i]));
const out = [...info.keys()].map((id) => {
  const p = PIECES[id];
  return { ...info.get(id), duration: p.duration, shots: p.shots.map((s) => ({ id: s.id, label: s.label, rig: s.rig, start: s.start, end: s.end, cut: s.plan?.cut, times: [s.start + 0.15, (s.start + s.end) / 2, s.end - 0.15].map((x) => +x.toFixed(2)) })) };
});
console.log(JSON.stringify(out));
