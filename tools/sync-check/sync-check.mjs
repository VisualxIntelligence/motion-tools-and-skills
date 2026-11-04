#!/usr/bin/env node
// sync-check.mjs: does the soundtrack land on the picture, without startling?
// Finds visual events in the MP4 (dips/cuts, hard cuts) or takes the declared CUES, finds audio
// onsets in its soundtrack, and reports per event: offset to the nearest strong onset, and the
// loudness jump into the event. Fails on OFF-BEAT (> tolerance) or STARTLE (> 6 dB jump).
//
// usage: node sync-check.mjs video.mp4 [--cues-file anim.cues.json] [--tol 100]
//   --cues-file  check these times (scene cuts + in-scene hit points) instead of detecting cuts
// exit 0 = every event lands; 1 = at least one OFF-BEAT / STARTLE
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const args = process.argv.slice(2), file = args[0];
const opt = (n, d) => { const i = args.indexOf(n); return i < 0 ? d : args[i + 1]; };
if (!file) { console.error('usage: node sync-check.mjs video.mp4 [--cues-file f.json] [--tol 100]'); process.exit(1); }
const TOL = Number(opt('--tol', 100)) / 1000;
const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=r_frame_rate', '-of', 'json', file]));
const [fn, fd] = probe.streams[0].r_frame_rate.split('/').map(Number), FPS = fn / fd;

// ---- video: 64x64 gray frames ----
const S = 64, raw = execFileSync('ffmpeg', ['-v', 'error', '-i', file, '-vf', `scale=${S}:${S},format=gray`, '-f', 'rawvideo', '-'], { maxBuffer: 1 << 30 });
const nF = raw.length / (S * S), frame = i => raw.subarray(i * S * S, (i + 1) * S * S);
const detail = [], motion = [0];
for (let i = 0; i < nF; i++) { // detail = local contrast; a dip-to-blank or hard cut shows up here
  const f = frame(i); let d = 0; for (let k = 1; k < f.length; k++) d += Math.abs(f[k] - f[k - 1]); detail.push(d / f.length);
  if (i) { const g = frame(i - 1); let m = 0; for (let k = 0; k < f.length; k++) m += Math.abs(f[k] - g[k]); motion.push(m / f.length); }
}
// blank baseline = the emptiest frame (a dip to plain paper/black); a cut is a local minimum close to it
const blank = Math.min(...detail), maxDetail = Math.max(...detail), visual = [];
for (let i = 2; i < nF - 2; i++) {
  if (detail[i] < blank + (maxDetail - blank) * .12 && detail[i] <= detail[i - 1] && detail[i] <= detail[i + 1] && detail[i] < detail[i - 2]) {
    if (!visual.length || i / FPS - visual.at(-1).t > .5) visual.push({ t: i / FPS, kind: 'cut' });
  }
}
// hard cuts (no dip): single-frame motion spikes
const mMean = motion.reduce((a, b) => a + b) / motion.length;
for (let i = 1; i < nF; i++) if (motion[i] > mMean * 8 && !visual.some(v => Math.abs(v.t - i / FPS) < .5)) visual.push({ t: i / FPS, kind: 'hard-cut' });
visual.sort((a, b) => a.t - b.t);
if (opt('--cues-file')) { visual.length = 0; for (const t of JSON.parse(readFileSync(opt('--cues-file'), 'utf8'))) visual.push({ t, kind: 'cue' }); }

// ---- audio: onset strength from 10ms energy rises ----
const hasAudio = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'a', '-show_entries', 'stream=index', '-of', 'csv=p=0', file]).toString().trim();
if (!hasAudio) { console.error(`${file} has no audio stream: nothing to check. (Does the page define window.SCORE, or did you mux a track?)`); process.exit(1); }
const SR = 12000, pcm = execFileSync('ffmpeg', ['-v', 'error', '-i', file, '-vn', '-ac', '1', '-ar', String(SR), '-f', 's16le', '-'], { maxBuffer: 1 << 30 });
const hop = SR / 100, nH = Math.floor(pcm.length / 2 / hop), env = [];
for (let h = 0; h < nH; h++) { let e = 0; for (let k = 0; k < hop; k++) { const v = pcm.readInt16LE((h * hop + k) * 2) / 32768; e += v * v; } env.push(Math.sqrt(e / hop)); }
const flux = env.map((e, i) => Math.max(0, e - (env[i - 1] || 0)));
const onsets = [];
for (let i = 1; i < flux.length - 1; i++) {
  const win = flux.slice(Math.max(0, i - 50), i + 50), mean = win.reduce((a, b) => a + b) / win.length;
  if (flux[i] > mean * 3 && flux[i] >= flux[i - 1] && flux[i] >= flux[i + 1] && flux[i] > .002) {
    // one onset per 120 ms cluster, measured from the cluster's first peak (so it can't drift), placed at its strongest peak
    const last = onsets.at(-1);
    if (!last || i / 100 - last.start > .12) onsets.push({ start: i / 100, t: i / 100, s: flux[i] }); else if (flux[i] > last.s) { last.t = i / 100; last.s = flux[i]; }
  }
}
// "strong" = prominent among its neighbours (within ±2 s), so a quiet ending keeps its accents
// "strong" = not a minor wobble among its neighbours within ±1 s (a loud effect a second away doesn't
// hide a downbeat, and quiet passages keep their accents)
const strong = onsets.filter(o => { const nb = onsets.filter(p => Math.abs(p.t - o.t) <= 1).map(p => p.s).sort((a, b) => a - b);
  return o.s >= nb[Math.floor(nb.length * .3)]; }).map(o => o.t);

// ---- report ----
console.log(`${file}: ${nF} frames @ ${FPS.toFixed(2)}fps, ${onsets.length} audio onsets (${strong.length} strong)\n`);
const rms = (t0, t1) => { const a = Math.max(0, Math.round(t0 * 100)), b = Math.min(env.length, Math.round(t1 * 100));
  let e = 0; for (let i = a; i < b; i++) e += env[i] * env[i]; return Math.sqrt(e / Math.max(1, b - a)) + 1e-6; };
console.log('visual event        nearest strong onset   offset   loudness jump   verdict');
let bad = 0;
// skip the opening second (no 'before' to compare against) and the closing fade (not a cut)
const dur = nF / FPS, events = visual.filter(v => v.t >= 1 && v.t <= dur - .6);
for (const v of events) {
  const near = strong.reduce((b, t) => Math.abs(t - v.t) < Math.abs(b - v.t) ? t : b, Infinity), off = near - v.t;
  // a cut should be heard, not jumped at: >6 dB louder than the music before it reads as a startle.
  // After a deliberate silence (a break), compare with the level before the break instead.
  // reference level: normally the last second (or the typical level of the last 4 s, if louder).
  // Coming out of a break (the last second >10 dB below the loudest recent second), compare with the
  // music before the break instead, so a return after silence isn't a startle but a long quiet stretch
  // followed by something loud still is.
  const before = rms(v.t - 1, v.t), wins = [1, 2, 3, 4].map(k => rms(v.t - k, v.t - k + 1)), loud = Math.max(...wins), srt = [...wins].sort((a, b) => a - b);
  const ref = 20 * Math.log10(before / loud) < -10 ? loud : Math.max(before, (srt[1] + srt[2]) / 2);
  const jump = 20 * Math.log10(rms(v.t, v.t + .3) / ref), startle = jump > 6;
  const drop = 20 * Math.log10(rms(v.t + .05, v.t + .45) / before) < -10;   // a cut into (near) silence lands by stopping; reverb tails keep it above true silence
  const onBeat = Math.abs(off) <= TOL || drop;
  const ok = onBeat && !startle; if (!ok) bad++;
  console.log(`${v.kind.padEnd(9)} ${v.t.toFixed(2).padStart(6)}s    ${near.toFixed(2).padStart(6)}s           ${(off >= 0 ? '+' : '') + (off * 1000).toFixed(0).padStart(5)}ms   ${(jump >= 0 ? '+' : '') + jump.toFixed(1).padStart(4)} dB       ${startle ? 'STARTLE' : drop ? 'ok (break)' : onBeat ? 'ok' : 'OFF-BEAT'}`);
}
console.log(`\n${events.length - bad}/${events.length} visual events land within ±${TOL * 1000}ms of a strong onset without a startle (>6 dB jump).`);
process.exitCode = bad ? 1 : 0;
