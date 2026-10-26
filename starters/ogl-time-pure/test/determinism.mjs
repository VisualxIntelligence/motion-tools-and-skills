// determinism.mjs: seek-order repeatability check. Renders the same times after jumping forwards and
// backwards and fails if any repeat differs by a single byte. Run it before every long render and after
// any change to a scene.
//
//   node test/determinism.mjs [--chrome=<path>] [--soft-gl] [--times=1,3.5,0,5.9] [--scene-url=studio.html]
//
// Exit code 0 = every repeat identical; 1 = a frame depends on something other than t.
import puppeteer from 'puppeteer-core';
import { createHash } from 'node:crypto';
import { existsSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { homedir } from 'node:os';

const args = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function playwrightChromes() {
  const out = [];
  for (const dir of [`${homedir()}/.cache/ms-playwright`, process.env.PLAYWRIGHT_BROWSERS_PATH].filter(Boolean)) {
    if (!existsSync(dir)) continue;
    for (const n of readdirSync(dir).sort().reverse()) {
      out.push(`${dir}/${n}/chrome-linux64/chrome`, `${dir}/${n}/chrome-headless-shell-linux64/chrome-headless-shell`);
    }
  }
  return out;
}
const CHROME = [args.chrome, process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser', ...playwrightChromes()].find((p) => p && existsSync(p));
if (!CHROME) { console.error('Chrome not found: pass --chrome=<path> or set CHROME_PATH'); process.exit(1); }

const gpu = args['soft-gl'] ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']
  : process.platform === 'win32' ? ['--use-angle=d3d11'] : process.platform === 'darwin' ? ['--use-angle=metal'] : ['--use-gl=angle'];
const browser = await puppeteer.launch({
  executablePath: CHROME, headless: true, protocolTimeout: 0,
  args: [...(process.platform === 'linux' ? ['--no-sandbox'] : []), '--allow-file-access-from-files', '--ignore-gpu-blocklist', ...gpu, '--window-size=1920,1080'],
});
const page = await browser.newPage();
page.on('console', (m) => { if (['error', 'warn'].includes(m.type())) console.log('[page]', m.text()); });
page.on('pageerror', (e) => console.log('[page error]', e.message));
await page.goto(pathToFileURL(resolve(root, args['scene-url'] || 'studio.html')).href + '?render', { waitUntil: 'networkidle0' });
await page.waitForFunction('window.ready === true', { timeout: 120000 });
console.log('GPU:', await page.evaluate(() => window.gpuInfo()));

const dur = await page.evaluate(() => window.DUR);
const ts = (args.times ? String(args.times).split(',').map(Number) : [dur * 0.125, dur * 0.44, 0, dur * 0.74]);
// forwards, then backwards and repeated, so any carried-over state shows up
const order = [...ts, ...[...ts].reverse(), ts[0], ts[ts.length - 1], ts[1]];
const seen = new Map();
let bad = 0;
for (const t of order) {
  const url = await page.evaluate((t) => window.renderAt(t, 'image/png'), t);
  const h = createHash('sha256').update(Buffer.from(url.slice(url.indexOf(',') + 1), 'base64')).digest('hex').slice(0, 16);
  if (seen.has(t) && seen.get(t) !== h) { console.log(`MISMATCH t=${t.toFixed(3)}  ${seen.get(t)} then ${h}`); bad++; }
  else console.log(`t=${t.toFixed(3).padStart(7)}  ${h}${seen.has(t) ? '  (repeat, identical)' : ''}`);
  seen.set(t, seen.get(t) ?? h);
}
await browser.close();
console.log(bad ? `FAIL: ${bad} frame(s) changed between renders` : `PASS: ${order.length} renders, ${seen.size} distinct times, every repeat identical`);
process.exit(bad ? 1 : 0);
