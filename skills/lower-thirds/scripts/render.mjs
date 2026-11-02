#!/usr/bin/env node
// render.mjs: render a lower-third page (templates/lower-third.html) to a transparent video, stills, or a contact sheet.
//
// The page must expose:  window.draw(frame)  window.FRAMES  window.FPS
// and optionally:        window.ready   (a promise, e.g. fonts loading; awaited before the first frame)
// It is loaded with ?render (plus ?card=N and ?scale=N when given), so it skips its own preview loop.
// Run it from your working folder; relative output paths land there.
//
// Usage:
//   node render.mjs page.html out.webm                     VP9 with alpha: OBS, Chrome, Edge
//   node render.mjs page.html out.mov                      ProRes 4444 with alpha: Premiere, DaVinci Resolve, Final Cut
//   node render.mjs page.html out.mp4 --ground '#00ff00'   no alpha: flattened onto a colour (green screen / chroma key)
//   node render.mjs page.html --check                      transparency, empty first/last frame, title-safe area
//   node render.mjs page.html shot --stills 0.6s,3s        full frame over a checkerboard, dark and light footage (--ground dark: one)
//   node render.mjs page.html in.jpg --sheet 0.1 --in       the build-in, cropped to the graphic and enlarged (--out: the build-out;
//                                                           or --from 6.5 --to 7.5, in seconds)
// Options: --card N (which entry of CARDS), --scale 2 (3840x2160 from a 1920x1080 page).
// Moments are frames (90) or seconds (1.5s).
//
// Needs: node >= 18, `npm i playwright-core`, ffmpeg, and Chrome installed (or `npx playwright install chromium` once).
import { createRequire } from 'node:module';
import { spawn, execFileSync } from 'node:child_process';
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { resolve, join, parse } from 'node:path';
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
if (!pagePath || (mode !== 'check' && !outArg)) { console.error('usage: node render.mjs page.html <out.webm|out.mov|out.mp4|name> [--check] [--stills 0.6s,3s] [--sheet [s] --in|--out|--from s --to s] [--card N] [--scale N] [--ground #hex|checker|dark|light]'); process.exit(1); }

const chromium = await loadChromium();
let browser;
try { browser = await chromium.launch({ channel: 'chrome' }); } catch { browser = await chromium.launch(); }
const page = await browser.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
const fonts = [];
page.on('console', m => { if (/^font not loaded/.test(m.text())) fonts.push(m.text()); });
const q = new URLSearchParams({ render: '1' });
if (opt('--card') !== undefined) q.set('card', opt('--card'));
if (opt('--scale') !== undefined) q.set('scale', opt('--scale'));
await page.goto('file://' + resolve(pagePath) + '?' + q);
await page.evaluate(() => Promise.resolve(window.ready));
const info = await page.evaluate(() => {
  const c = document.querySelector('canvas');
  return { FRAMES: window.FRAMES, FPS: window.FPS, w: c?.width, h: c?.height, hasDraw: typeof window.draw === 'function' };
});
const fail = async msg => { console.error(msg); await browser.close(); process.exit(1); };
if (!info.hasDraw || !info.FRAMES || !info.FPS) await fail('page must define window.draw(frame), window.FRAMES and window.FPS ' + errors.join('; '));
const at = v => String(v).trim().endsWith('s') ? Math.round(parseFloat(v) * info.FPS) : Number(v);
const secs = f => (f / info.FPS).toFixed(2) + 's';

// Grounds for looking at a transparent frame: a checkerboard, dark footage, light footage, or a colour.
await page.evaluate(() => {
  window.__on = (f, ground, box) => {
    window.draw(f);
    const src = document.querySelector('canvas'), [bx, by, bw, bh] = box || [0, 0, src.width, src.height];
    const c = document.createElement('canvas'); c.width = bw; c.height = bh; const x = c.getContext('2d');
    if (ground === 'checker') {
      const s = Math.max(8, Math.round(src.width / 60));
      x.fillStyle = '#fff'; x.fillRect(0, 0, bw, bh); x.fillStyle = '#d6d6d6';
      for (let j = 0; j * s < bh; j++) for (let i = j % 2; i * s < bw; i += 2) x.fillRect(i * s, j * s, s, s);
    } else if (ground === 'dark' || ground === 'light') {
      // a stand-in for footage: an uneven gradient, so contrast is tested across a range of tones
      const g = x.createLinearGradient(-bx, -by, src.width - bx, src.height - by);
      if (ground === 'dark') { g.addColorStop(0, '#1d2430'); g.addColorStop(.55, '#3a3f38'); g.addColorStop(1, '#0c0d10'); }
      else { g.addColorStop(0, '#f4efe6'); g.addColorStop(.5, '#bfcad3'); g.addColorStop(1, '#fbfbfb'); }
      x.fillStyle = g; x.fillRect(0, 0, bw, bh);
    } else { x.fillStyle = ground; x.fillRect(0, 0, bw, bh); }
    x.drawImage(src, bx, by, bw, bh, 0, 0, bw, bh); return c;
  };
  window.__label = (c, text) => {
    const x = c.getContext('2d'), s = Math.round(Math.max(14, Math.min(c.width, 1920) / 40, c.height / 9));
    x.font = `700 ${Math.round(s * .75)}px monospace`; const w = x.measureText(text).width + s * .6;
    x.fillStyle = 'rgba(0,0,0,.7)'; x.fillRect(0, 0, w, s * 1.4);
    x.fillStyle = '#fff'; x.textBaseline = 'middle'; x.fillText(text, s * .3, s * .7);
    return c;
  };
  // bounding box of everything drawn in the given frames, at full resolution
  window.__bbox = frames => {
    const src = document.querySelector('canvas'), x = src.getContext('2d');
    let x0 = src.width, y0 = src.height, x1 = -1, y1 = -1;
    for (const f of frames) {
      window.draw(f); const d = x.getImageData(0, 0, src.width, src.height).data;
      for (let y = 0; y < src.height; y += 2) for (let i = (y * src.width) * 4 + 3, px = 0; px < src.width; px += 2, i += 8)
        if (d[i] > 12) { if (px < x0) x0 = px; if (px > x1) x1 = px; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    }
    return x1 < 0 ? null : [x0, y0, x1 + 2, y1 + 2];
  };
});
const jpeg = (f, ground, label, box) => page.evaluate(([f, ground, label, box]) => {
  const c = window.__on(f, ground, box); if (label) window.__label(c, label);
  return c.toDataURL('image/jpeg', .92).split(',')[1];
}, [f, ground, label, box]).then(b => Buffer.from(b, 'base64'));
const png = f => page.evaluate(f => { window.draw(f); return document.querySelector('canvas').toDataURL('image/png').split(',')[1]; }, f).then(b => Buffer.from(b, 'base64'));
const tile = (dir, cols, rows, width, out) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', join(dir, 'f%04d.jpg'), '-vf', `scale=${width}:-2,tile=${cols}x${rows}:padding=6:color=white`, '-frames:v', '1', out]);

if (mode === 'check') {
  // Every frame, downscaled: where the graphic is, and whether anything paints the whole frame.
  const r = await page.evaluate(() => {
    const src = document.querySelector('canvas'), W = 480, H = Math.round(480 * src.height / src.width);
    const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d', { willReadFrequently: true });
    const frames = [];
    for (let f = 0; f < window.FRAMES; f++) {
      window.draw(f); x.clearRect(0, 0, W, H); x.drawImage(src, 0, 0, W, H);
      const d = x.getImageData(0, 0, W, H).data; let n = 0, a = 0, x0 = W, y0 = H, x1 = -1, y1 = -1;
      for (let i = 3, p = 0; i < d.length; i += 4, p++) if (d[i] > 12) { n++; a += d[i] / 255; const px = p % W, py = (p / W) | 0; if (px < x0) x0 = px; if (px > x1) x1 = px; if (py < y0) y0 = py; if (py > y1) y1 = py; }
      frames.push({ cover: n / (W * H), ink: a / (W * H), box: n ? [x0 / W, y0 / H, (x1 + 1) / W, (y1 + 1) / H] : null });
    }
    return frames;
  });
  const t = f => secs(f), problems = fonts.map(f => `${f}: that text renders in another weight or a fallback font. Check the family, weight and italic against the Google Fonts <link>.`), notes = [];
  const full = r.findIndex(fr => fr.cover > .97);
  if (full >= 0) problems.push(`frame ${full} (${t(full)}) covers the whole picture: something paints a ground, so the file is not see-through. Remove the background fill.`);
  if (r[0].cover > 0) problems.push('the first frame is not empty: the graphic pops on when the clip starts. Start from nothing and animate in.');
  if (r[r.length - 1].cover > 0) problems.push('the last frame is not empty: the graphic cuts off when the clip ends. Animate out before the end.');
  const SAFE = .05; let worst = null;
  r.forEach((fr, f) => { if (fr.box && (fr.box[0] < SAFE || fr.box[1] < SAFE || fr.box[2] > 1 - SAFE || fr.box[3] > 1 - SAFE)) worst ??= f; });
  if (worst !== null) problems.push(`at ${t(worst)} the graphic reaches into the outer 5% of the frame (title-safe area): some screens and platforms crop it. Move it in.`);
  // timing from opacity-weighted coverage, so a half-faded panel doesn't count as fully in
  const peak = Math.max(...r.map(fr => fr.cover)), inkPeak = Math.max(...r.map(fr => fr.ink)), held = r.filter(fr => fr.ink > inkPeak * .95).length / info.FPS;
  const on = r.findIndex(fr => fr.ink > inkPeak * .95), shown = r.filter(fr => fr.cover > 0).length / info.FPS;
  notes.push(`${info.w}x${info.h}, ${(info.FRAMES / info.FPS).toFixed(1)}s at ${info.FPS}fps; on screen ${shown.toFixed(1)}s, fully in by ${t(Math.max(0, on))}, held ~${held.toFixed(1)}s; covers at most ${(peak * 100).toFixed(1)}% of the frame`);
  const box = r.filter(fr => fr.box).reduce((a, fr) => a ? [Math.min(a[0], fr.box[0]), Math.min(a[1], fr.box[1]), Math.max(a[2], fr.box[2]), Math.max(a[3], fr.box[3])] : fr.box, null);
  const pct = v => (v * 100).toFixed(1) + '%';
  if (box) notes.push(`graphic spans x ${pct(box[0])}–${pct(box[2])}, y ${pct(box[1])}–${pct(box[3])}; nearest edge ${pct(Math.min(box[0], box[1], 1 - box[2], 1 - box[3]))} away (shadows and glows count)`);
  if (peak > .35) notes.push('it covers over a third of the frame at its largest: fine for a full-screen title, heavy for a lower third');
  notes.push('not checked here: text clipped by a mask or wipe, and legibility; look at the stills and the sheet');
  notes.forEach(n => console.log('  ' + n));
  problems.forEach(p => console.log('✗ ' + p));
  console.log(problems.length ? `${problems.length} problem(s)` : '✓ transparent, starts and ends empty, inside title-safe');
  if (errors.length) console.warn('page errors:', errors);
  await browser.close(); process.exit(problems.length ? 2 : 0);
}

const one = typeof opt('--ground') === 'string' ? opt('--ground') : null;
if (mode === 'stills') {
  // Full frame, so the position reads: over a checkerboard, dark footage and light footage (or the one --ground).
  const grounds = one ? [one] : ['checker', 'dark', 'light'];
  for (const f of String(opt('--stills')).split(',').map(at)) {
    const dir = mkdtempSync(join(tmpdir(), 'lt-'));
    for (const [i, g] of grounds.entries()) writeFileSync(join(dir, `f${String(i).padStart(4, '0')}.jpg`), await jpeg(f, g, `${secs(f)} ${g}`));
    const file = `${outArg}-${secs(f)}.jpg`;
    tile(dir, 1, grounds.length, 1600, file); rmSync(dir, { recursive: true }); console.log(file);
  }
} else if (mode === 'sheet') {
  // The moves up close: frames every N seconds between --from and --to, cropped to the graphic and enlarged.
  const every = opt('--sheet') === true ? .5 : Number(opt('--sheet'));
  const phase = opt('--in') ? 'in' : opt('--out') ? 'out' : null;
  const span = phase ? await page.evaluate(p => window.PHASES?.[p], phase) : null;
  if (phase && !span) await fail(`--${phase} needs window.PHASES = { in: [start, end], out: [start, end] } (seconds) in the page`);
  const sec = v => parseFloat(String(v));
  const from = Math.round((span ? Math.max(0, span[0] - .1) : opt('--from') !== undefined ? sec(opt('--from')) : 0) * info.FPS);
  const to = Math.min(info.FRAMES - 1, Math.round((span ? span[1] + .15 : opt('--to') !== undefined ? sec(opt('--to')) : info.FRAMES / info.FPS) * info.FPS));
  const lead = span || opt('--from') !== undefined ? 0 : every / 2;
  const frames = []; for (let s = from / info.FPS + lead; s * info.FPS <= to && frames.length < 64; s += every) frames.push(Math.min(info.FRAMES - 1, Math.round(s * info.FPS)));
  // one crop for every tile: the union of the graphic over the sampled frames and 24 moments across the clip
  const all = await page.evaluate(fr => window.__bbox(fr), [...new Set([...frames, ...Array.from({ length: 24 }, (_, i) => Math.round(i * (info.FRAMES - 1) / 23))])]);
  const pad = Math.round(info.w * .03);
  const crop = all ? [Math.max(0, all[0] - pad), Math.max(0, all[1] - pad)] : [0, 0];
  if (all) crop.push(Math.min(info.w, all[2] + pad) - crop[0], Math.min(info.h, all[3] + pad) - crop[1]); else crop.push(info.w, info.h);
  const dir = mkdtempSync(join(tmpdir(), 'lt-'));
  for (let i = 0; i < frames.length; i++) writeFileSync(join(dir, `f${String(i).padStart(4, '0')}.jpg`), await jpeg(frames[i], one || 'checker', secs(frames[i]), crop));
  const cols = Math.min(frames.length, crop[2] / crop[3] > 2.5 ? 3 : 4), rows = Math.ceil(frames.length / cols);
  tile(dir, cols, rows, Math.min(900, crop[2] * 1.5 | 0), outArg); rmSync(dir, { recursive: true });
  console.log(`contact sheet: ${frames.length} frames ${secs(frames[0])}–${secs(frames[frames.length - 1])}, cropped to ${crop[2]}x${crop[3]} at ${crop[0]},${crop[1]} -> ${outArg}`);
} else {
  const ext = parse(outArg).ext.toLowerCase();
  if (!['.webm', '.mov', '.mp4'].includes(ext)) await fail('output must end in .webm (VP9 alpha), .mov (ProRes 4444 alpha) or .mp4 (with --ground)');
  if (ext === '.mp4' && !one) await fail('MP4 (H.264) has no alpha channel: pass --ground \'#00ff00\' to flatten onto a colour for chroma keying, or render .webm / .mov');
  if (ext !== '.mov' && (info.w % 2 || info.h % 2)) await fail(`canvas is ${info.w}x${info.h}: VP9/H.264 need even width and height`);
  const enc = {
    '.webm': ['-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-auto-alt-ref', '0', '-crf', '20', '-b:v', '0', '-row-mt', '1'],
    '.mov': ['-c:v', 'prores_ks', '-profile:v', '4444', '-pix_fmt', 'yuva444p10le', '-vendor', 'apl0'],
    '.mp4': ['-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '16', '-movflags', '+faststart'],
  }[ext];
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(info.FPS), '-c:v', ext === '.mp4' ? 'mjpeg' : 'png', '-i', '-', ...enc, '-an', outArg], { stdio: ['pipe', 'inherit', 'inherit'] });
  let done = false, code = null; const closed = new Promise(r => ff.on('close', c => { done = true; code = c; r(); }));
  ff.on('error', e => { console.error('ffmpeg failed to start:', e.message); process.exit(1); });
  ff.stdin.on('error', () => {});
  for (let f = 0; f < info.FRAMES && !done; f++) {
    const buf = ext === '.mp4' ? await jpeg(f, one) : await png(f);
    if (!ff.stdin.write(buf)) await Promise.race([new Promise(r => ff.stdin.once('drain', r)), closed]);
  }
  ff.stdin.end(); await closed;
  if (code !== 0) await fail(`ffmpeg exited with code ${code}; ${outArg} is incomplete`);
  let alphaNote = '';
  if (ext !== '.mp4') {
    // confirm the file really carries alpha (a VP9 WebM marks it with alpha_mode=1; ProRes 4444 with a yuva pixel format)
    const probe = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=pix_fmt:stream_tags=alpha_mode', '-of', 'default=nw=1', outArg]).toString();
    const ok = ext === '.webm' ? /alpha_mode=1/.test(probe) : /pix_fmt=yuva/.test(probe);
    if (!ok) await fail(`${outArg} was written without an alpha channel (${probe.trim().replace(/\n/g, ', ')}): your ffmpeg build may lack alpha support`);
    // and decode a frame from the hold: most of it must actually come back see-through
    const mid = Math.floor(info.FRAMES / 2);
    const rgba = execFileSync('ffmpeg', ['-v', 'error', ...(ext === '.webm' ? ['-c:v', 'libvpx-vp9'] : []), '-i', outArg, '-vf', `select=eq(n\\,${mid})`, '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-'], { maxBuffer: 1 << 28 });
    let clear = 0; for (let i = 3; i < rgba.length; i += 4) if (rgba[i] === 0) clear++;
    const share = clear / (rgba.length / 4);
    if (share < .5) await fail(`${outArg}: decoded frame ${mid} is only ${(share * 100).toFixed(0)}% see-through; the alpha did not survive encoding`);
    alphaNote = `, alpha ✓ (frame ${mid} decodes ${(share * 100).toFixed(0)}% see-through)`;
  }
  console.log(`rendered ${info.FRAMES} frames @ ${info.FPS}fps, ${info.w}x${info.h}${alphaNote} -> ${outArg}`);
}
if (fonts.length) console.warn('✗ ' + fonts.join('; ') + ': rendered in another weight or a fallback font');
if (errors.length) console.warn('page errors:', errors);
await browser.close();
