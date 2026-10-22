#!/usr/bin/env node
// transcribe.mjs: word-timed transcript of a talking-head recording, plus the video's size, frame rate and length.
//
// Usage:  node transcribe.mjs talk.mp4 [transcript.json]
//
// Writes transcript.json:
//   { video: { file, width, height, fps, duration }, engine, words: [{ text, start, end }], lines: [{ start, end, text }] }
// and prints the lines with their times, which is what you plan from. `lines` are split at sentence ends;
// split further at clause ends yourself, using the word times.
//
// Engines, first one available wins (or force one with --engine elevenlabs|whisper):
//   elevenlabs  ELEVENLABS_API_KEY  (Scribe v2: the most accurate word times; spells numbers out as words)
//   whisper     local whisper.cpp, no key: `brew install whisper-cpp` (or build it), and a ggml model
//               (WHISPER_MODEL=/path/to/ggml-base.en.bin, or put it in ~/.cache/whisper/)
//
// Needs: node >= 18, ffmpeg.
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync, readdirSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';
import { tmpdir, homedir } from 'node:os';

const args = process.argv.slice(2);
const opt = name => { const i = args.indexOf(name); return i < 0 ? undefined : args[i + 1]; };
const positional = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--')));
const [input, out = 'transcript.json'] = positional;
if (!input) { console.error('usage: node transcribe.mjs talk.mp4 [transcript.json] [--engine whisper|elevenlabs] [--language xx]'); process.exit(1); }
if (!existsSync(input)) { console.error(`${input} not found`); process.exit(1); }

// ─── The video ───────────────────────────────────────────────────────────────
const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_type,width,height,avg_frame_rate:stream_side_data=rotation:format=duration', '-of', 'json', input]).toString());
const vs = probe.streams.find(s => s.codec_type === 'video');
if (!probe.streams.some(s => s.codec_type === 'audio')) { console.error(`${input} has no audio track: there is nothing to transcribe`); process.exit(1); }
let width = vs?.width, height = vs?.height;
const rot = Math.abs(Number(vs?.side_data_list?.find(d => d.rotation !== undefined)?.rotation || 0));
if (rot === 90 || rot === 270) [width, height] = [height, width];   // phone footage stored sideways
const [n, d] = String(vs?.avg_frame_rate || '30/1').split('/').map(Number);
const fps = Math.round((n / (d || 1)) * 100) / 100;
const duration = Number(probe.format.duration);

// ─── Engines ─────────────────────────────────────────────────────────────────
const tmp = mkdtempSync(join(tmpdir(), 'tr-'));
const wav = join(tmp, 'a.wav'), mp3 = join(tmp, 'a.mp3');
const has = cmd => spawnSync('which', [cmd]).status === 0;
function whisperModel() {
  if (process.env.WHISPER_MODEL) return process.env.WHISPER_MODEL;
  for (const dir of [join(homedir(), '.cache', 'whisper'), join(homedir(), '.cache', 'whisper.cpp'), '/opt/homebrew/share/whisper-cpp', '/usr/local/share/whisper-cpp']) {
    if (!existsSync(dir)) continue;
    // prefer the more accurate models when several are present
    const models = readdirSync(dir).filter(f => /^ggml-.*\.bin$/.test(f) && !/silero|vad/.test(f));
    const rank = f => ['large', 'medium', 'small', 'base', 'tiny'].findIndex(s => f.includes(s));
    models.sort((a, b) => rank(a) - rank(b));
    if (models.length) return join(dir, models[0]);
  }
  return null;
}
const whisperBin = ['whisper-cli', 'whisper-cpp'].find(has);
const available = {
  elevenlabs: !!process.env.ELEVENLABS_API_KEY,
  whisper: whisperBin && whisperModel(),
};
const engine = opt('--engine') || Object.keys(available).find(k => available[k]);
if (!engine || !available[engine]) {
  console.error([
    engine ? `engine "${engine}" is not available.` : 'no transcription engine available. Any one of these works:',
    '  local, no key:  brew install whisper-cpp, then download a model once:',
    '                  mkdir -p ~/.cache/whisper && curl -L -o ~/.cache/whisper/ggml-base.en.bin \\',
    '                    https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin',
    '                  (English; for other languages use ggml-small.bin or larger)',
    '  ElevenLabs:     export ELEVENLABS_API_KEY=...',
  ].join('\n'));
  rmSync(tmp, { recursive: true }); process.exit(1);
}

async function post(url, headers, form) {
  const res = await fetch(url, { method: 'POST', headers, body: form, signal: AbortSignal.timeout(300_000) });
  if (!res.ok) throw new Error(`${url} → ${res.status} ${(await res.text()).slice(0, 300)}`);
  return res.json();
}
const audioForm = (file, type) => new Blob([readFileSync(file)], { type });

let words = [];
if (engine === 'whisper') {
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', input, '-vn', '-ar', '16000', '-ac', '1', wav]);
  const lang = opt('--language') || (/\.en\.bin$/.test(whisperModel()) ? 'en' : 'auto');
  // -ml 1 -sow: one segment per word, so every word gets its own start and end
  execFileSync(whisperBin, ['-m', whisperModel(), '-f', wav, '-l', lang, '-ml', '1', '-sow', '-oj', '-of', join(tmp, 'w'), '-np'], { stdio: ['ignore', 'ignore', 'pipe'] });
  const j = JSON.parse(readFileSync(join(tmp, 'w.json'), 'utf8'));
  words = j.transcription.map(s => ({ text: s.text.trim(), start: s.offsets.from / 1000, end: s.offsets.to / 1000 }))
    .filter(w => w.text && !/^\[.*\]$|^\(.*\)$/.test(w.text));   // drop [BLANK_AUDIO], (music) and the like
  // whisper.cpp butts every word against the next, so a pause is swallowed by the words around it.
  // Find the pauses in the audio and give them back: a word ends where a pause starts, the next starts where it ends.
  const log = spawnSync('ffmpeg', ['-v', 'info', '-i', wav, '-af', 'silencedetect=noise=-35dB:d=0.18', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
  const quiet = [...log.matchAll(/silence_start: ([\d.]+)[\s\S]*?silence_end: ([\d.]+)/g)].map(m => [Number(m[1]), Number(m[2])]);
  // whisper's word times drift by up to a second, so the pauses are matched to word boundaries as a whole, in order:
  // each pause takes at most one boundary, later pauses take later boundaries, and boundaries after a sentence end or
  // a comma are strongly preferred. Then every word time is stretched between those anchors.
  const punct = w => /[.?!…]["”')\]]*$/.test(w.text) ? 1 : /[,;:—]["”')\]]*$/.test(w.text) ? .6 : 0;
  let states = new Map([[-1, { cost: 0, pick: [] }]]);
  for (const [a, b] of quiet) {
    if (a < .05 || b > duration - .05) continue;                    // silence before the first word or after the last
    const m = (a + b) / 2, next = new Map(states);                   // skipping a pause costs nothing
    const cands = [];
    for (let i = 0; i < words.length - 1; i++) { const d = Math.abs(words[i].end - m); if (d < 1.5) cands.push([i, d - punct(words[i]) - .5]); }
    for (const [last, st] of states) for (const [i, c] of cands) {
      if (i <= last) continue;
      const cost = st.cost + c, prev = next.get(i);
      if (!prev || cost < prev.cost) next.set(i, { cost, pick: [...st.pick, [i, a, b]] });
    }
    states = next;
  }
  const picks = [...states.values()].sort((x, y) => x.cost - y.cost)[0].pick;
  // anchors: whisper time → real time. Across each pause the clock jumps: the word before it ends where the pause
  // starts (xe → left), the word after it starts where the pause ends (xs → right).
  // the first word starts where the opening silence ends, the last ends where the closing silence starts
  const head = quiet.find(([a]) => a < .05)?.[1] ?? words[0].start, tail = quiet.find(([, b]) => b > duration - .05)?.[0] ?? words.at(-1).end;
  const first = words[0].start, last = words.at(-1).end;
  const anchors = [{ xe: first, xs: first, left: head, right: head },
    ...picks.map(([i, a, b]) => ({ xe: words[i].end, xs: words[i + 1].start, left: a, right: b })),
    { xe: last, xs: last, left: tail, right: tail }];
  const warp = (x, isEnd) => {
    const k = anchors.findIndex(p => x < p.xs || (isEnd && x <= p.xe));   // a word ending at a pause stays before it
    const lo = anchors[k === -1 ? anchors.length - 1 : k - 1], hi = k === -1 ? null : anchors[k];
    if (hi && x > hi.xe) return hi.left;                                  // inside whisper's own gap at a pause
    if (!hi) return lo.right + (x - lo.xs);                               // after the last pause: shift
    if (!lo) return Math.max(0, hi.left - (hi.xe - x));                   // before the first pause: shift
    return lo.right + (x - lo.xs) * (hi.left - lo.right) / Math.max(1e-6, hi.xe - lo.xs);   // between pauses: stretch
  };
  words = words.map(w => ({ text: w.text, start: warp(w.start, false), end: warp(w.end, true) }));
  for (const w of words) if (w.end < w.start) w.end = w.start;
} else if (engine === 'elevenlabs') {
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', input, '-vn', '-ac', '1', '-b:a', '96k', mp3]);
  const form = new FormData();
  form.append('model_id', 'scribe_v2');
  form.append('file', audioForm(mp3, 'audio/mpeg'), 'audio.mp3');
  form.append('timestamps_granularity', 'word');
  const j = await post('https://api.elevenlabs.io/v1/speech-to-text', { 'xi-api-key': process.env.ELEVENLABS_API_KEY }, form);
  words = j.words.filter(w => w.type === 'word').map(w => ({ text: w.text.trim(), start: w.start, end: w.end }));
}
rmSync(tmp, { recursive: true });
if (!words.length) { console.error('no speech found in the recording'); process.exit(1); }
const r2 = v => Math.round(v * 100) / 100;
words = words.map(w => ({ text: w.text, start: r2(Math.max(0, w.start)), end: r2(Math.min(duration, w.end)) }));

// ─── Lines: split at sentence ends ───────────────────────────────────────────
const lines = []; let cur = [];
words.forEach((w, i) => {
  cur.push(w);
  const next = words[i + 1];
  const sentenceEnd = /[.?!…]["”')\]]*$/.test(w.text) && !/^(Mr|Mrs|Ms|Dr|St|vs|etc|e\.g|i\.e)\.$/i.test(w.text);
  if (!next || sentenceEnd || next.start - w.end > 1.2) {
    lines.push({ start: cur[0].start, end: w.end, text: cur.map(x => x.text).join(' ') });
    cur = [];
  }
});

writeFileSync(out, JSON.stringify({ video: { file: basename(input), width, height, fps, duration: r2(duration) }, engine, words, lines }, null, 1));
const t = s => s.toFixed(2).padStart(6);
console.log(`${basename(input)}: ${width}x${height}, ${fps} fps, ${duration.toFixed(2)} s · ${words.length} words, ${lines.length} lines (${engine}) → ${resolve(out)}`);
for (const l of lines) console.log(`${t(l.start)} → ${t(l.end)}  ${l.text}`);
