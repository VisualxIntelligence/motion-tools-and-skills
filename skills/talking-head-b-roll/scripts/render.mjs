#!/usr/bin/env node
// render.mjs: check a b-roll page (templates/b-roll.html), look at it over the recording, and render the film.
//
// The page must expose:  window.draw(frame)  window.FRAMES  window.FPS  window.SCENES  window.VIDEO  window.FACE
// and optionally:        window.ready   (a promise, e.g. fonts loading; awaited before the first frame)
// It is loaded with ?render (plus ?scale=N to match the video's resolution), so it skips its own preview.
// Run it from your working folder; relative output paths land there.
//
// Usage:
//   node render.mjs page.html --check                 covers opaque, overlays off the face, changes between words, rhythm
//   node render.mjs page.html shot --stills 5s,12s    full frames over the recording (add --face to outline FACE)
//   node render.mjs page.html film.jpg --sheet 1      the whole film, one frame every N seconds (--from s --to s for a part)
//   node render.mjs page.html film.mp4                the finished film: the recording with the b-roll on it, its own sound
//   node render.mjs page.html b-roll.webm             the b-roll alone with alpha (VP9), to lay over the recording in an editor
//   node render.mjs page.html b-roll.mov              the same as ProRes 4444 (Premiere Pro, DaVinci Resolve, Final Cut)
// --check reads transcript.json next to the page (or --transcript path) to find where words start and end.
// Moments are frames (90) or seconds (1.5s).
//
// Needs: node >= 18, `npm i playwright-core`, ffmpeg, and Chrome installed (or `npx playwright install chromium` once).
import { createRequire } from 'node:module';
import { spawn, execFileSync } from 'node:child_process';
import { writeFileSync, readFileSync, mkdtempSync, rmSync, existsSync } from 'node:fs';
import { resolve, join, parse, dirname } from 'node:path';
import { tmpdir } from 'node:os';

async function loadChromium() {
  for (const name of ['playwright-core', 'playwright']) {
    try { return (await import(name)).chromium; } catch {}
    try { return createRequire(process.cwd() + '/')(name).chromium; } catch {}
  }
  throw new Error('playwright-core not found: run `npm i playwright-core` in this folder');
}

const args = process.argv.slice(2);
const opt = name => { const i = args.indexOf(name); return i < 0 ? undefined : (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true); };
const pagePath = args[0], outArg = args[1] && !args[1].startsWith('--') ? args[1] : null;
const mode = opt('--check') ? 'check' : opt('--stills') ? 'stills' : opt('--sheet') ? 'sheet' : 'video';
if (!pagePath || (mode !== 'check' && !outArg)) { console.error('usage: node render.mjs page.html <film.mp4|b-roll.webm|b-roll.mov|name> [--check] [--stills 5s,12s [--face]] [--sheet N [--from s --to s]]'); process.exit(1); }

// The recording: its real size decides the render scale.
const probeVideo = file => {
  const j = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_type,width,height,codec_name:stream_side_data=rotation:format=duration', '-of', 'json', file]).toString());
  const v = j.streams.find(s => s.codec_type === 'video'), a = j.streams.find(s => s.codec_type === 'audio');
  let w = v.width, h = v.height;
  const rot = Math.abs(Number(v.side_data_list?.find(d => d.rotation !== undefined)?.rotation || 0));
  if (rot === 90 || rot === 270) [w, h] = [h, w];
  return { w, h, duration: Number(j.format.duration), audio: a?.codec_name || null };
};

const chromium = await loadChromium();
let browser;
try { browser = await chromium.launch({ channel: 'chrome' }); } catch { browser = await chromium.launch(); }
const page = await browser.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
const fonts = [];
page.on('console', m => { if (/^font not loaded/.test(m.text())) fonts.push(m.text()); });
const fail = async msg => { console.error(msg); await browser.close(); process.exit(1); };

const url = q => 'file://' + resolve(pagePath) + '?' + new URLSearchParams({ render: '1', ...q });
await page.goto(url({}));
await page.evaluate(() => Promise.resolve(window.ready));
const meta = await page.evaluate(() => ({ IN: window.IN ?? .5, OUT: window.OUT ?? .4, FRAMES: window.FRAMES, FPS: window.FPS, VIDEO: window.VIDEO, FACE: window.FACE, SCENES: window.SCENES, W: window.W, H: window.H, hasDraw: typeof window.draw === 'function' }));
if (!meta.hasDraw || !meta.FRAMES || !meta.FPS || !Array.isArray(meta.SCENES)) await fail('page must define window.draw(frame), FRAMES, FPS and SCENES (start from templates/b-roll.html) ' + errors.join('; '));
const videoPath = resolve(dirname(resolve(pagePath)), meta.VIDEO);
if (!existsSync(videoPath)) await fail(`VIDEO = '${meta.VIDEO}' not found next to the page (${videoPath})`);
const vid = probeVideo(videoPath);
if (Math.abs(vid.w / vid.h - meta.W / meta.H) > 0.01) await fail(`the page is ${meta.W}x${meta.H} but the video is ${vid.w}x${vid.h}: set W and H to the video's shape`);
const scale = vid.w / meta.W;
if (Math.abs(meta.FRAMES / meta.FPS - vid.duration) > 0.5) console.warn(`⚠ DURATION is ${(meta.FRAMES / meta.FPS).toFixed(2)} s but the video is ${vid.duration.toFixed(2)} s: set DURATION from transcribe.mjs`);
if (scale !== 1) { await page.goto(url({ scale })); await page.evaluate(() => Promise.resolve(window.ready)); }
const VW = Math.round(meta.W * scale), VH = Math.round(meta.H * scale);
const at = v => String(v).trim().endsWith('s') ? Math.round(parseFloat(v) * meta.FPS) : Number(v);
const secs = f => (f / meta.FPS).toFixed(2) + 's';
const tmp = mkdtempSync(join(tmpdir(), 'br-'));
const done = async code => { rmSync(tmp, { recursive: true, force: true }); await browser.close(); process.exit(code); };

// A frame of the recording, as a data URL the page can draw under the b-roll.
const videoFrame = (f, width) => {
  const file = join(tmp, `v${f}.jpg`);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(f / meta.FPS), '-i', videoPath, '-frames:v', '1', '-vf', `scale=${width}:-2`, '-q:v', '3', file]);
  return 'data:image/jpeg;base64,' + readFileSync(file).toString('base64');
};
await page.evaluate(() => {
  window.__over = async (f, bg, label, width, face) => {
    const src = document.querySelector('canvas');
    const img = new Image(); img.src = bg; await img.decode();
    const c = document.createElement('canvas'); c.width = width; c.height = Math.round(width * src.height / src.width);
    const x = c.getContext('2d');
    x.drawImage(img, 0, 0, c.width, c.height);
    window.draw(f); x.drawImage(src, 0, 0, c.width, c.height);
    if (face) {
      const [a, b, r, d] = window.FACE; x.save(); x.setLineDash([12, 8]); x.lineWidth = 3; x.strokeStyle = '#ff2d55';
      x.strokeRect(a * c.width, b * c.height, (r - a) * c.width, (d - b) * c.height); x.restore();
    }
    if (label) {
      const s = Math.round(Math.max(16, c.width / 34)); x.font = `700 ${Math.round(s * .7)}px monospace`;
      const w = x.measureText(label).width + s * .6; x.fillStyle = 'rgba(0,0,0,.72)'; x.fillRect(0, 0, w, s * 1.3);
      x.fillStyle = '#fff'; x.textBaseline = 'middle'; x.fillText(label, s * .3, s * .65);
    }
    return c.toDataURL('image/jpeg', .9).split(',')[1];
  };
});
const kindAt = f => meta.SCENES.find(s => f / meta.FPS >= s.from && f / meta.FPS < s.to)?.kind || 'speaker';
const over = async (f, width, label, face) => Buffer.from(await page.evaluate(([f, bg, label, width, face]) => window.__over(f, bg, label, width, face), [f, videoFrame(f, width), label, width, face]), 'base64');
const tile = (cols, rows, width, out) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', join(tmp, 'f%04d.jpg'), '-vf', `scale=${width}:-2,tile=${cols}x${rows}:padding=6:color=white`, '-frames:v', '1', out]);

if (mode === 'check') {
  const problems = [], warnings = [], notes = [];
  const S = meta.SCENES.slice().sort((a, b) => a.from - b.from), dur = meta.FRAMES / meta.FPS;
  // the plan itself
  S.forEach((s, i) => {
    if (!['overlay', 'cover'].includes(s.kind)) problems.push(`scene ${i} (${s.from}–${s.to}s) has kind '${s.kind}': use 'overlay' or 'cover'`);
    if (!(s.to > s.from)) problems.push(`scene ${i} ends before it starts (${s.from}–${s.to}s)`);
    if (s.from < 0 || s.to > dur + 0.01) problems.push(`scene ${i} (${s.from}–${s.to}s) runs outside the video (0–${dur.toFixed(2)}s)`);
    if (i && s.from < S[i - 1].to - 0.001) problems.push(`scenes ${i - 1} and ${i} overlap (${S[i - 1].from}–${S[i - 1].to}s and ${s.from}–${s.to}s)`);
  });
  // what is actually drawn: every frame, downscaled
  const r = await page.evaluate(() => {
    const src = document.querySelector('canvas'), Wd = 320, Hd = Math.round(320 * src.height / src.width);
    const c = document.createElement('canvas'); c.width = Wd; c.height = Hd; const x = c.getContext('2d', { willReadFrequently: true });
    const [fa, fb, fr, fd] = window.FACE.map((v, i) => Math.round(v * (i % 2 ? Hd : Wd)));
    const out = [];
    for (let f = 0; f < window.FRAMES; f++) {
      window.__texts = []; window.draw(f); const texts = window.__texts; window.__texts = null; x.clearRect(0, 0, Wd, Hd); x.drawImage(src, 0, 0, Wd, Hd);
      const d = x.getImageData(0, 0, Wd, Hd).data; let any = 0, opaque = 0, face = 0;
      for (let i = 3, p = 0; i < d.length; i += 4, p++) {
        if (d[i] > 12) { any++; const px = p % Wd, py = (p / Wd) | 0; if (d[i] > 60 && px >= fa && px < fr && py >= fb && py < fd) face++; }
        if (d[i] >= 250) opaque++;
      }
      out.push({ any: any / (Wd * Hd), opaque: opaque / (Wd * Hd), face: face / Math.max(1, (fr - fa) * (fd - fb)), texts });
    }
    return out;
  });
  const t = f => secs(f);
  for (const [i, s] of S.entries()) {
    const f0 = Math.ceil(s.from * meta.FPS), f1 = Math.min(r.length, Math.ceil(s.to * meta.FPS));
    const fr = r.slice(f0, f1);
    if (!fr.length) continue;
    if (s.kind === 'cover') {
      // after the entrance and before the exit, the cover hides the speaker completely
      const h0 = f0 + Math.ceil((meta.IN + .1) * meta.FPS), h1 = f1 - Math.ceil((meta.OUT + .1) * meta.FPS);
      const leak = r.slice(h0, h1).findIndex(x => x.opaque < .985);
      if (leak >= 0) problems.push(`cover ${s.from}–${s.to}s: at ${t(h0 + leak)} only ${(r[h0 + leak].opaque * 100).toFixed(0)}% of the frame is opaque, so the speaker shows through. A cover paints the whole frame.`);
    } else if (s.kind === 'overlay') {
      const worst = fr.reduce((m, x, k) => x.face > m.v ? { v: x.face, k } : m, { v: 0, k: 0 });
      if (worst.v > .03) problems.push(`overlay ${s.from}–${s.to}s: at ${t(f0 + worst.k)} it covers ${(worst.v * 100).toFixed(0)}% of FACE. Keep overlays off the speaker (look at a still with --face; fix FACE if it is wrong).`);
      const big = fr.findIndex(x => x.opaque > .985);
      if (big >= 0) problems.push(`overlay ${s.from}–${s.to}s paints the whole frame at ${t(f0 + big)}: that is a cover. Change its kind or its drawing.`);
      // a card on screen with nothing written on it yet
      let run = 0, worstRun = 0, at = 0;
      fr.forEach((x, k) => { if (x.any > .002 && !x.texts.length) { run++; if (run > worstRun) { worstRun = run; at = k - run + 1; } } else run = 0; });
      if (worstRun / meta.FPS > .6 && fr.some(x => x.texts.length)) warnings.push(`overlay ${s.from}–${s.to}s shows a shape with no words for ${(worstRun / meta.FPS).toFixed(1)} s from ${t(f0 + at)}: an empty card reads as a glitch. Bring it in with its first words, or start the scene later`);
      const peak = Math.max(...fr.map(x => x.any));
      if (peak > .4) warnings.push(`overlay ${s.from}–${s.to}s covers ${(peak * 100).toFixed(0)}% of the frame at its largest: heavy for an overlay`);
    }
    if (fr.every(x => x.any === 0)) problems.push(`scene ${i} (${s.from}–${s.to}s) draws nothing`);
  }
  // text off the frame, or text on top of other text
  const seen = new Set();
  r.forEach((x, f) => {
    for (const tx of x.texts) {
      const [a, b, c, d] = tx.box;
      const m = .03 * Math.min(meta.W, meta.H);
      if (!(a < -2 || b < -2 || c > meta.W + 2 || d > meta.H + 2) && (a < m || b < m || c > meta.W - m || d > meta.H - m) && !seen.has('edge' + tx.text)) { seen.add('edge' + tx.text); warnings.push(`at ${secs(f)} the text "${tx.text.slice(0, 40)}" sits within 3% of the frame's edge: some players and phones crop there`); }
      if ((a < -2 || b < -2 || c > meta.W + 2 || d > meta.H + 2) && !seen.has('off' + tx.text)) { seen.add('off' + tx.text); problems.push(`at ${secs(f)} the text "${tx.text.slice(0, 40)}" runs off the frame (x ${a.toFixed(0)}–${c.toFixed(0)}, y ${b.toFixed(0)}–${d.toFixed(0)} in a ${meta.W}x${meta.H} frame)`); }
    }
    for (let i = 0; i < x.texts.length; i++) for (let j = i + 1; j < x.texts.length; j++) {
      const p = x.texts[i].box, q = x.texts[j].box;
      if (x.texts[i].text === x.texts[j].text) continue;   // the same words drawn twice (a shadow pass, an outline)
      const ix = Math.min(p[2], q[2]) - Math.max(p[0], q[0]), iy = Math.min(p[3], q[3]) - Math.max(p[1], q[1]);
      if (ix <= 0 || iy <= 0) continue;
      const small = Math.min((p[2] - p[0]) * (p[3] - p[1]), (q[2] - q[0]) * (q[3] - q[1]));
      const key = 'ov' + x.texts[i].text + '|' + x.texts[j].text;
      if (ix * iy > .15 * small && !seen.has(key)) { seen.add(key); problems.push(`at ${secs(f)} the text "${x.texts[i].text.slice(0, 30)}" overlaps "${x.texts[j].text.slice(0, 30)}"`); }
    }
  });
  const strays = r.map((x, f) => x.any > 0 && kindAt(f) === 'speaker' ? f : -1).filter(f => f >= 0);
  if (strays.length) problems.push(`something is drawn outside every scene, first at ${t(strays[0])}`);
  // where the words are
  const tp = opt('--transcript') && opt('--transcript') !== true ? opt('--transcript') : join(dirname(resolve(pagePath)), 'transcript.json');
  let words = null, lines = null;
  if (existsSync(tp)) ({ words, lines } = JSON.parse(readFileSync(tp, 'utf8')));
  else warnings.push(`no transcript at ${tp}: changes were not checked against word timings (pass --transcript path)`);
  if (words) for (const s of S) for (const [edge, b] of [['starts (speech anchor)', s.speechFrom ?? s.from], ['ends (speech anchor)', s.speechTo ?? s.to]]) {
    if (b <= 0.01 || b >= dur - 0.01) continue;
    const w = words.find(w => b > w.start + .05 && b < w.end - .05);
    if (w) {
      const k = words.indexOf(w), before = w.start, after = w.end;
      problems.push(`${s.kind} ${s.from}–${s.to}s ${edge} at ${b}s, inside the word "${w.text}" (${w.start}–${w.end}s). Move it to a gap: ${before}s (before "${w.text}") or ${after}s (after it${words[k + 1] ? `, before "${words[k + 1].text}"` : ''}).`);
    }
  }
  // rhythm, from the plan
  const stretches = []; let c = 0;
  for (const s of S) { if (s.from > c + .01) stretches.push({ kind: 'speaker', from: c, to: s.from }); stretches.push({ ...s }); c = s.to; }
  if (c < dur - .01) stretches.push({ kind: 'speaker', from: c, to: dur });
  if (stretches[0]?.kind !== 'speaker') warnings.push('the film does not open on the speaker: the viewer meets the person first');
  if (stretches.at(-1)?.kind !== 'speaker') warnings.push('the film does not close on the speaker');
  stretches.forEach((s, i) => {
    const len = s.to - s.from;
    if (s.kind === 'speaker' && i > 0 && i < stretches.length - 1 && len < 1) warnings.push(`only ${len.toFixed(2)} s of the speaker between scenes (${s.from.toFixed(2)}–${s.to.toFixed(2)}s): that reads as a flicker. Let the scenes meet (one's to = the next one's from), or give the speaker a real beat`);
    if (s.kind === 'speaker' && len > 8.5) warnings.push(`${len.toFixed(1)} s of only the speaker (${s.from.toFixed(2)}–${s.to.toFixed(2)}s): break it with an overlay or a cover`);
    if (s.kind === 'cover' && (len < 2.5 || len > 8.5)) warnings.push(`cover ${s.from}–${s.to}s lasts ${len.toFixed(1)} s: a cover runs about 3–8 s`);
    if (s.kind === 'cover' && stretches[i + 1]?.kind === 'cover') warnings.push(`covers ${s.from}–${s.to}s and ${stretches[i + 1].from}–${stretches[i + 1].to}s run back to back: return to the speaker between them`);
  });
  // the timeline, with what is said in each stretch
  const said = (a, b) => words ? words.filter(w => w.start >= a - .05 && w.start < b - .05).map(w => w.text).join(' ') : '';
  const share = k => stretches.filter(s => s.kind === k).reduce((n, s) => n + s.to - s.from, 0);
  notes.push(`${vid.w}x${vid.h}, ${dur.toFixed(2)} s at ${meta.FPS} fps · speaker alone ${share('speaker').toFixed(1)} s, overlays ${share('overlay').toFixed(1)} s, covers ${share('cover').toFixed(1)} s`);
  for (const s of stretches) notes.push(`${s.from.toFixed(2).padStart(6)}–${s.to.toFixed(2).padStart(6)}  ${s.kind.padEnd(7)}  ${said(s.from, s.to).slice(0, 110)}`);
  notes.push('not checked here: whether each drawing says what its line says, legibility, text cut off by a clip or running off its card, text on lines and shapes: look at the sheet and the stills');
  notes.forEach(n => console.log('  ' + n));
  warnings.forEach(w => console.log('⚠ ' + w));
  fonts.forEach(f => problems.push(`${f}: that text renders in another weight or a fallback font`));
  errors.forEach(e => problems.push(`page error: ${e}`));
  problems.forEach(p => console.log('✗ ' + p));
  console.log(problems.length ? `${problems.length} problem(s)` : '✓ covers opaque, overlays off the face, speech anchors between words, no text off the frame or on other text');
  await done(problems.length ? 2 : 0);
}

if (mode === 'stills') {
  for (const f of String(opt('--stills')).split(',').map(at)) {
    const file = `${outArg}-${secs(f)}.jpg`;
    // --face: the recording alone with the FACE box, to place it; otherwise the film as it will look
    if (opt('--face')) { writeFileSync(file, await page.evaluate(([bg]) => window.__over(-1, bg, 'FACE', 1600, true), [videoFrame(f, 1600)]).then(b => Buffer.from(b, 'base64'))); console.log(file); continue; }
    writeFileSync(file, await over(Math.min(f, meta.FRAMES - 1), 1600, `${secs(f)} ${kindAt(f)}`, false));
    console.log(file);
  }
} else if (mode === 'sheet') {
  const every = opt('--sheet') === true ? 1 : Number(opt('--sheet'));
  const from = opt('--from') !== undefined ? parseFloat(opt('--from')) : 0;
  const to = opt('--to') !== undefined ? parseFloat(opt('--to')) : meta.FRAMES / meta.FPS;
  const frames = []; for (let s = from + (opt('--from') !== undefined ? 0 : every / 2); s < to && frames.length < 80; s += every) frames.push(Math.min(meta.FRAMES - 1, Math.round(s * meta.FPS)));
  const portrait = meta.H > meta.W, cols = portrait ? 6 : 4, width = portrait ? 360 : 640;
  for (const [i, f] of frames.entries()) writeFileSync(join(tmp, `f${String(i).padStart(4, '0')}.jpg`), await over(f, width, `${secs(f)} ${kindAt(f)}`, false));
  tile(Math.min(cols, frames.length), Math.ceil(frames.length / cols), width, outArg);
  console.log(`${frames.length} frames ${secs(frames[0])}–${secs(frames.at(-1))}, every ${every} s -> ${outArg}`);
} else {
  const ext = parse(outArg).ext.toLowerCase();
  if (!['.mp4', '.webm', '.mov'].includes(ext)) await fail('output must end in .mp4 (the finished film), .webm or .mov (the b-roll alone, with alpha)');
  if (ext !== '.mov' && (VW % 2 || VH % 2)) await fail(`the video is ${VW}x${VH}: H.264/VP9 need even width and height`);
  const pipeIn = ['-f', 'image2pipe', '-framerate', String(meta.FPS), '-c:v', 'png', '-i', '-'];
  const film = ['-i', videoPath, ...pipeIn,
    '-filter_complex', `[0:v]scale=${VW}:${VH},setsar=1,fps=${meta.FPS}[base];[base][1:v]overlay=0:0:format=auto:eof_action=pass,format=yuv420p[v]`,
    '-map', '[v]', '-map', '0:a?', '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-profile:v', 'high',
    ...(vid.audio === 'aac' ? ['-c:a', 'copy'] : ['-c:a', 'aac', '-b:a', '192k']), '-movflags', '+faststart', '-t', String(vid.duration)];
  const layer = {
    '.webm': [...pipeIn, '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-auto-alt-ref', '0', '-crf', '24', '-b:v', '0', '-row-mt', '1', '-an'],
    '.mov': [...pipeIn, '-c:v', 'prores_ks', '-profile:v', '4444', '-pix_fmt', 'yuva444p10le', '-vendor', 'apl0', '-an'],
  }[ext];
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', ...(ext === '.mp4' ? film : layer), outArg], { stdio: ['pipe', 'inherit', 'inherit'] });
  let closedFlag = false, code = null; const closed = new Promise(r => ff.on('close', c => { closedFlag = true; code = c; r(); }));
  ff.on('error', e => { console.error('ffmpeg failed to start:', e.message); process.exit(1); });
  ff.stdin.on('error', () => {});
  // frames with nothing drawn are all the same: encode one blank PNG and reuse it
  const blank = Buffer.from(await page.evaluate(() => { const c = document.querySelector('canvas'); c.getContext('2d').clearRect(0, 0, c.width, c.height); return c.toDataURL('image/png').split(',')[1]; }), 'base64');
  const started = Date.now();
  for (let f = 0; f < meta.FRAMES && !closedFlag; f++) {
    const buf = kindAt(f) === 'speaker' ? blank : Buffer.from(await page.evaluate(f => { window.draw(f); return document.querySelector('canvas').toDataURL('image/png').split(',')[1]; }, f), 'base64');
    if (!ff.stdin.write(buf)) await Promise.race([new Promise(r => ff.stdin.once('drain', r)), closed]);
    if (f % (meta.FPS * 10) === 0 && f) process.stdout.write(`  ${secs(f)} of ${secs(meta.FRAMES)}\r`);
  }
  ff.stdin.end(); await closed;
  if (meta.FRAMES > meta.FPS * 10) process.stdout.write('\n');
  if (code !== 0) await fail(`ffmpeg exited with code ${code}; ${outArg} is incomplete`);
  const took = ((Date.now() - started) / 1000).toFixed(0);
  if (ext === '.mp4') {
    const o = probeVideo(outArg);
    console.log(`rendered ${o.w}x${o.h}, ${o.duration.toFixed(2)} s, sound: ${o.audio || 'none'} (${took} s) -> ${outArg}`);
    if (!o.audio && vid.audio) await fail('the recording has sound but the film does not');
  } else {
    const probe = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=pix_fmt:stream_tags=alpha_mode', '-of', 'default=nw=1', outArg]).toString();
    if (!(ext === '.webm' ? /alpha_mode=1/.test(probe) : /pix_fmt=yuva/.test(probe))) await fail(`${outArg} was written without an alpha channel: your ffmpeg build may lack alpha support`);
    console.log(`rendered the b-roll layer, ${VW}x${VH}, alpha ✓ (${took} s) -> ${outArg}: lay it on the track above the recording, starting at 0`);
  }
}
if (fonts.length) console.warn('✗ ' + fonts.join('; ') + ': rendered in another weight or a fallback font');
if (errors.length) console.warn('page errors:', errors);
await done(0);
