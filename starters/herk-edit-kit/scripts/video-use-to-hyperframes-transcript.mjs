#!/usr/bin/env node
// Adapter: video-use EDL + Scribe transcripts -> HyperFrames Gate 0 transcript.json
//
// video-use writes per-source ElevenLabs Scribe responses on the ORIGINAL
// timeline. The edited.mp4 it renders lives on a CUT timeline. HyperFrames'
// Gate 0 validator (scripts/validate-beat-sync.mjs) needs word timestamps on
// the edited timeline. This adapter applies the same output-timeline math
// that render.py:build_master_srt uses — out_t = (src_t - seg_start) + seg_offset —
// and emits { words: [{ text, start, end }, ...] } per word.
//
// Usage:
//   node scripts/video-use-to-hyperframes-transcript.mjs <edl.json>
//
// Reads:  <edl_dir>/transcripts/<source>.json for every source referenced in EDL.ranges
// Writes: <edl_dir>/transcript.json
//
// Exit codes: 0 on success, 1 on missing inputs or malformed EDL, 2 on empty output.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { argv, exit } from "node:process";

const edlArg = argv[2];
if (!edlArg) {
  console.error("usage: node scripts/video-use-to-hyperframes-transcript.mjs <edl.json>");
  exit(1);
}

const edlPath = resolve(edlArg);
if (!existsSync(edlPath)) {
  console.error(`edl not found: ${edlPath}`);
  exit(1);
}

const edl = JSON.parse(readFileSync(edlPath, "utf8"));
if (!Array.isArray(edl.ranges) || edl.ranges.length === 0) {
  console.error("edl has no ranges[]");
  exit(1);
}

const editDir = dirname(edlPath);
const transcriptsDir = join(editDir, "transcripts");

const outWords = [];
let segOffset = 0;

for (const r of edl.ranges) {
  const source = r.source;
  const segStart = Number(r.start);
  const segEnd = Number(r.end);
  if (!source || Number.isNaN(segStart) || Number.isNaN(segEnd)) {
    console.error(`bad range entry: ${JSON.stringify(r)}`);
    exit(1);
  }
  const segDuration = segEnd - segStart;

  const trPath = join(transcriptsDir, `${source}.json`);
  if (!existsSync(trPath)) {
    console.warn(`  no transcript for ${source}, skipping (${segDuration.toFixed(2)}s of audio)`);
    segOffset += segDuration;
    continue;
  }

  const tr = JSON.parse(readFileSync(trPath, "utf8"));
  const words = Array.isArray(tr.words) ? tr.words : [];

  for (const w of words) {
    if (w.type && w.type !== "word" && w.type !== "audio_event") continue;
    const wStart = Number(w.start);
    const wEnd = Number(w.end ?? w.start);
    if (Number.isNaN(wStart)) continue;
    if (wEnd < segStart || wStart > segEnd) continue;

    const localStart = Math.max(segStart, wStart);
    const localEnd = Math.min(segEnd, wEnd);
    const outStart = Math.max(0, localStart - segStart) + segOffset;
    const outEnd = Math.max(outStart, localEnd - segStart + segOffset);

    const text = (w.text ?? w.word ?? "").toString().trim();
    if (!text) continue;

    outWords.push({
      text,
      start: round3(outStart),
      end: round3(outEnd),
    });
  }

  segOffset += segDuration;
}

outWords.sort((a, b) => a.start - b.start);

if (outWords.length === 0) {
  console.error("no words emitted; check EDL source names match transcripts/*.json");
  exit(2);
}

const outPath = join(editDir, "transcript.json");
writeFileSync(outPath, JSON.stringify({ words: outWords }, null, 2));
console.log(`wrote ${outPath} (${outWords.length} words, ${segOffset.toFixed(2)}s timeline)`);

function round3(n) {
  return Math.round(n * 1000) / 1000;
}
