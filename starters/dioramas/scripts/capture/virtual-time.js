// Virtual time for deterministic video capture of a diorama page.
// Injected before any page script (Playwright addInitScript, see ../render-video.mjs). It replaces the page's clocks
// so nothing moves until the renderer steps time forward one frame at a time:
//   performance.now, Date / Date.now      → virtual milliseconds (Date starts at a fixed epoch)
//   requestAnimationFrame                 → queued, run once per step
//   setTimeout / setInterval              → fire in virtual time, in due order
//   Math.random                           → seeded mulberry32
//   CSS animations / transitions / WAAPI  → paused and seeked to virtual time on every step
// THREE.Clock, the engine loop, GSAP's ticker, Lenis (driven by the GSAP ticker), damped pointers and Rapier all read
// these clocks, so with a fixed step they produce the same frames on every run.
// Options come from window.__CAPTURE_OPTS (set by the renderer before this script runs): { seed, epoch }.
(() => {
  if (window.__vt) return;
  const opts = window.__CAPTURE_OPTS || {};

  // Seeded random (mulberry32).
  let s = (opts.seed ?? 1) >>> 0;
  Math.random = () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  // Clocks.
  const realNow = performance.now.bind(performance);
  const epoch = opts.epoch ?? Date.UTC(2026, 0, 1);
  let vt = 0; // virtual ms since page start
  performance.now = () => vt;
  const RealDate = Date;
  function VDate(...a) {
    if (!new.target) return new RealDate(epoch + vt).toString();
    return a.length ? new RealDate(...a) : new RealDate(epoch + vt);
  }
  VDate.prototype = RealDate.prototype;
  VDate.now = () => epoch + vt;
  VDate.parse = RealDate.parse;
  VDate.UTC = RealDate.UTC;
  window.Date = VDate;

  // requestAnimationFrame: callbacks queue until the next step.
  let rafId = 0;
  let rafQ = new Map();
  window.requestAnimationFrame = cb => { const id = ++rafId; rafQ.set(id, cb); return id; };
  window.cancelAnimationFrame = id => { rafQ.delete(id); };

  // Timers in virtual time.
  let timerId = 0;
  const timers = new Map(); // id → { at, cb, args, every }
  const call = (cb, args) => { if (typeof cb === 'function') cb(...args); else (0, eval)(String(cb)); };
  window.setTimeout = (cb, ms = 0, ...args) => { const id = ++timerId; timers.set(id, { at: vt + Math.max(0, +ms || 0), cb, args, every: 0 }); return id; };
  window.setInterval = (cb, ms = 0, ...args) => { const id = ++timerId; const every = Math.max(1, +ms || 0); timers.set(id, { at: vt + every, cb, args, every }); return id; };
  window.clearTimeout = window.clearInterval = id => { timers.delete(id); };
  const runTimers = until => {
    for (let guard = 0; guard < 100000; guard++) {
      let id = null, next = null;
      for (const [k, t] of timers) if (t.at <= until && (!next || t.at < next.at || (t.at === next.at && k < id))) { id = k; next = t; }
      if (!next) return;
      if (next.at > vt) vt = next.at; // timers see their own due time
      if (next.every) next.at += next.every; else timers.delete(id);
      try { call(next.cb, next.args); } catch (e) { console.error(e); }
    }
  };

  // CSS animations, transitions and Web Animations: pause and seek to virtual time.
  const seen = new WeakMap();
  const syncAnimations = () => {
    if (!document.getAnimations) return;
    for (const a of document.getAnimations()) {
      let st = seen.get(a);
      if (st === undefined) { st = vt - (a.currentTime ?? 0); seen.set(a, st); try { a.pause(); } catch {} }
      try { a.currentTime = vt - st; } catch {}
    }
  };

  window.__vt = {
    /** Advance virtual time by ms, fire due timers, then run one batch of rAF callbacks (one frame). */
    step(ms) {
      const target = vt + ms;
      runTimers(target);
      vt = target;
      const q = rafQ; rafQ = new Map();
      for (const cb of q.values()) { try { cb(vt); } catch (e) { console.error(e); } }
      syncAnimations();
    },
    now: () => vt,
    realNow,
    pending: () => ({ raf: rafQ.size, timers: timers.size }),
  };
})();
