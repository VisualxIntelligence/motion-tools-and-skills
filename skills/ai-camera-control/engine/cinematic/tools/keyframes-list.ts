// Pick reference frames: 3 to 5 per shot (in, quarter points, out), avoiding the first and last frames of a cut.
import { PIECES } from "../src/pieces";
import { measure } from "../src/camera";
const p = PIECES[process.env.PIECE ?? "Rootsong"], off = p.offset ?? 0;
const rows: any[] = [];
for (const s of p.shots) {
  const len = s.end - s.start;
  const n = len > 5 ? 5 : len > 2.2 ? 4 : len > 1.2 ? 3 : 2;
  for (let i = 0; i < n; i++) {
    const k = n === 1 ? 0.5 : 0.08 + (0.84 * i) / (n - 1);
    const t = s.start + len * k;
    const m = measure(s, t, p.fps);
    rows.push({ shot: s.id, film: +(t + off).toFixed(3), tau: +t.toFixed(3), label: s.label, rig: s.rig, lens: m.lines[1][1], focus: m.lines[2][1], frame: m.lines[4][1], move: m.lines[5][1], note: s.note });
  }
}
console.log(JSON.stringify(rows));
