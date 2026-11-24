#!/usr/bin/env node
// Build a self-contained review page for an edit decision list (EDL).
// Visualizes kept (green) vs cut (red) regions on a timeline, lists the biggest
// cuts, and embeds the original + edited videos side by side so you can scrub,
// click any cut to hear what was removed, and watch the result.
//
// Reusable across pipeline agents that emit an EDL with { source_duration,
// edited_duration, removed, keep_ranges, delete_ranges }.
//
// Usage:
//   node scripts/build-edl-review.mjs <edl.json> --original <video> --edited <video> [--output review.html]

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname, join, relative, basename } from "node:path";
import { argv, exit } from "node:process";

const args = argv.slice(2);
if (args.length === 0 || args.includes("--help")) {
  console.log("Usage: node scripts/build-edl-review.mjs <edl.json> --original <video> --edited <video> [--output review.html]");
  exit(args.length === 0 ? 1 : 0);
}
const opts = { edl: null, original: null, edited: null, output: null };
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--original") opts.original = args[++i];
  else if (a === "--edited") opts.edited = args[++i];
  else if (a === "--output" || a === "-o") opts.output = args[++i];
  else if (!opts.edl) opts.edl = a;
}
if (!opts.edl) { console.error("no edl.json given"); exit(1); }

const edlPath = resolve(opts.edl);
const edl = JSON.parse(readFileSync(edlPath, "utf8"));
const outPath = resolve(opts.output ?? join(dirname(edlPath), "silence-review.html"));
const outDir = dirname(outPath);
const rel = (p) => (p ? encodeURI(relative(outDir, resolve(p))) : null);

const dur = edl.source_duration;
const deletes = (edl.delete_ranges ?? []).map((d) => ({
  start: d.start, end: d.end, len: d.end - d.start,
  reasons: d.reasons ?? (d.reason ? [d.reason] : []),
}));
const keeps = edl.keep_ranges ?? [];

function fmt(s) {
  const m = Math.floor(s / 60);
  return `${m}:${(s - m * 60).toFixed(2).padStart(5, "0")}`;
}
const pct = (s) => (s / dur) * 100;

const keepRects = keeps.map((k) =>
  `<div class="seg keep" style="left:${pct(k.start)}%;width:${pct(k.end - k.start)}%" title="keep ${fmt(k.start)}-${fmt(k.end)}"></div>`).join("");
const cutRects = deletes.map((d, i) =>
  `<div class="seg cut" style="left:${pct(d.start)}%;width:${Math.max(pct(d.len), 0.12)}%" data-start="${d.start}" data-len="${d.len.toFixed(2)}" title="cut #${i + 1}: ${fmt(d.start)}-${fmt(d.end)} (${d.len.toFixed(2)}s)"></div>`).join("");

const topCuts = [...deletes].sort((a, b) => b.len - a.len).slice(0, 20);
const rows = topCuts.map((d, i) =>
  `<tr><td>${i + 1}</td><td><button class="jump" data-t="${Math.max(0, d.start - 0.5).toFixed(2)}">${fmt(d.start)}</button></td><td>${fmt(d.end)}</td><td><b>${d.len.toFixed(2)}s</b></td><td class="reason">${(d.reasons[0] ?? "").replace(/</g, "&lt;")}</td></tr>`).join("");

const removed = edl.removed ?? (dur - edl.edited_duration);
const html = `<!doctype html><html><head><meta charset="utf-8"><title>Silence cut review — ${basename(edlPath)}</title>
<style>
  :root{--bg:#0d1117;--panel:#161b22;--line:#30363d;--green:#3fb950;--red:#f85149;--text:#e6edf3;--dim:#8b949e}
  *{box-sizing:border-box} body{margin:0;background:var(--bg);color:var(--text);font:14px/1.5 -apple-system,Inter,Segoe UI,sans-serif;padding:24px}
  h1{font-size:18px;margin:0 0 4px} .sub{color:var(--dim);margin-bottom:20px}
  .stats{display:flex;gap:24px;margin:0 0 20px;flex-wrap:wrap}
  .stat{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:12px 18px}
  .stat .n{font-size:22px;font-weight:700} .stat .l{color:var(--dim);font-size:12px}
  .stat .n.red{color:var(--red)} .stat .n.green{color:var(--green)}
  .timeline{position:relative;height:46px;background:#21262d;border:1px solid var(--line);border-radius:8px;overflow:hidden;margin-bottom:6px}
  .seg{position:absolute;top:0;height:100%} .seg.keep{background:var(--green);opacity:.55} .seg.cut{background:var(--red);cursor:pointer} .seg.cut:hover{opacity:.8;outline:1px solid #fff}
  .axis{display:flex;justify-content:space-between;color:var(--dim);font-size:11px;margin-bottom:24px}
  .legend{display:flex;gap:16px;font-size:12px;color:var(--dim);margin-bottom:24px}
  .swatch{display:inline-block;width:12px;height:12px;border-radius:3px;vertical-align:-1px;margin-right:5px}
  .videos{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:28px}
  .vid{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:12px}
  .vid h3{margin:0 0 8px;font-size:13px;color:var(--dim);font-weight:600} video{width:100%;border-radius:6px;background:#000}
  table{border-collapse:collapse;width:100%;background:var(--panel);border:1px solid var(--line);border-radius:10px;overflow:hidden}
  th,td{padding:7px 12px;text-align:left;border-bottom:1px solid var(--line);font-size:13px} th{color:var(--dim);font-weight:600}
  td .reason{color:var(--dim)} button.jump{background:#21262d;color:var(--text);border:1px solid var(--line);border-radius:5px;padding:2px 8px;cursor:pointer;font:inherit}
  button.jump:hover{border-color:var(--green)}
  .hint{color:var(--dim);font-size:12px;margin:6px 0 18px}
</style></head><body>
<h1>Cut-Silences review</h1>
<div class="sub">${basename(edlPath)} · params: gap≥${edl.params?.gap ?? "?"}s, head-pad ${edl.params?.headPad ?? "?"}s, tail-pad ${edl.params?.tailPad ?? "?"}s</div>
<div class="stats">
  <div class="stat"><div class="n">${fmt(dur)}</div><div class="l">original</div></div>
  <div class="stat"><div class="n green">${fmt(edl.edited_duration)}</div><div class="l">edited</div></div>
  <div class="stat"><div class="n red">−${removed.toFixed(1)}s</div><div class="l">silence removed</div></div>
  <div class="stat"><div class="n">${((removed / dur) * 100).toFixed(1)}%</div><div class="l">tightened</div></div>
  <div class="stat"><div class="n">${deletes.length}</div><div class="l">cuts</div></div>
</div>
<div class="timeline" id="tl">${keepRects}${cutRects}</div>
<div class="axis"><span>0:00</span><span>${fmt(dur / 2)}</span><span>${fmt(dur)}</span></div>
<div class="legend"><span><span class="swatch" style="background:var(--green)"></span>kept speech</span><span><span class="swatch" style="background:var(--red)"></span>silence cut</span><span>· click a red mark (or a row below) to jump the ORIGINAL player to just before that pause</span></div>
<div class="videos">
  <div class="vid"><h3>ORIGINAL (with silences)</h3><video id="orig" src="${rel(opts.original) ?? ""}" controls preload="metadata"></video></div>
  <div class="vid"><h3>EDITED (silences cut)</h3><video id="edit" src="${rel(opts.edited) ?? ""}" controls preload="metadata"></video></div>
</div>
<div class="hint">Tip: play the EDITED one straight through to judge pacing. Use the cut markers + ORIGINAL player to spot-check that no words were clipped at a cut boundary.</div>
<h3 style="font-size:14px">20 largest pauses removed</h3>
<table><thead><tr><th>#</th><th>from</th><th>to</th><th>removed</th><th>reason</th></tr></thead><tbody>${rows}</tbody></table>
<script>
  const orig = document.getElementById('orig');
  function jump(t){ orig.currentTime = Math.max(0, t); orig.play(); orig.scrollIntoView({behavior:'smooth',block:'center'}); }
  document.querySelectorAll('.seg.cut').forEach(s => s.addEventListener('click', () => jump(parseFloat(s.dataset.start) - 0.5)));
  document.querySelectorAll('button.jump').forEach(b => b.addEventListener('click', () => jump(parseFloat(b.dataset.t))));
</script>
</body></html>`;

writeFileSync(outPath, html);
console.log(JSON.stringify({ review: outPath, cuts: deletes.length, removed: Number(removed.toFixed(2)) }, null, 2));
