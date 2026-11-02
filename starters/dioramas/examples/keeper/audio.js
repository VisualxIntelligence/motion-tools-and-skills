// Optional storm soundscape, synthesised (no files): rain hiss, wind, surf rumble, thunder, fog horn.
// Never starts on its own — only after the visitor turns it on.
export class StormAudio {
  constructor() { this.on = false; this.ctx = null; this.level = { storm: 1 }; }

  _noise(seconds = 4, brown = false) {
    const ctx = this.ctx, len = ctx.sampleRate * seconds, buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      let last = 0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        if (brown) { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; } else d[i] = w;
      }
    }
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    return src;
  }

  _build() {
    const ctx = this.ctx = new AudioContext();
    this.master = ctx.createGain(); this.master.gain.value = 0; this.master.connect(ctx.destination);
    // rain: bright hiss
    const rain = this._noise(3); const rf = ctx.createBiquadFilter(); rf.type = 'highpass'; rf.frequency.value = 1800;
    this.rainG = ctx.createGain(); this.rainG.gain.value = 0.09;
    rain.connect(rf).connect(this.rainG).connect(this.master); rain.start();
    // wind: band-passed noise with a slow howl
    const wind = this._noise(5); const wf = ctx.createBiquadFilter(); wf.type = 'bandpass'; wf.frequency.value = 420; wf.Q.value = 1.4;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.09; const lg = ctx.createGain(); lg.gain.value = 260; lfo.connect(lg).connect(wf.frequency); lfo.start();
    this.windG = ctx.createGain(); this.windG.gain.value = 0.12;
    wind.connect(wf).connect(this.windG).connect(this.master); wind.start();
    // surf: brown rumble with swells
    const surf = this._noise(6, true); const sf = ctx.createBiquadFilter(); sf.type = 'lowpass'; sf.frequency.value = 380;
    this.surfG = ctx.createGain(); this.surfG.gain.value = 0.5;
    const sl = ctx.createOscillator(); sl.frequency.value = 0.13; const sg = ctx.createGain(); sg.gain.value = 0.22; sl.connect(sg).connect(this.surfG.gain); sl.start();
    surf.connect(sf).connect(this.surfG).connect(this.master); surf.start();
  }

  toggle() {
    this.on = !this.on;
    if (this.on && !this.ctx) this._build();
    if (!this.ctx) return this.on;
    this.ctx.resume();
    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.setTargetAtTime(this.on ? 0.8 : 0, this.ctx.currentTime, 0.4);
    return this.on;
  }

  setStorm(s) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.rainG.gain.setTargetAtTime(0.1 * s * s, t, 0.5);
    this.windG.gain.setTargetAtTime(0.03 + 0.12 * s, t, 0.5);
    this.surfG.gain.setTargetAtTime(0.18 + 0.4 * s, t, 0.5);
  }

  thunder(delay = 1.5, power = 1) {
    if (!this.on || !this.ctx) return;
    const ctx = this.ctx, t = ctx.currentTime + delay;
    const n = this._noise(4, true); n.loop = false;
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(900, t); f.frequency.exponentialRampToValueAtTime(90, t + 3.5);
    const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.9 * power, t + 0.08);
    g.gain.setTargetAtTime(0.35 * power, t + 0.3, 0.3); g.gain.exponentialRampToValueAtTime(0.001, t + 3.8);
    n.connect(f).connect(g).connect(this.master); n.start(t); n.stop(t + 4);
  }

  /** The fog signal: a low, two-tone diaphone. */
  horn() {
    if (!this.on || !this.ctx) return;
    const ctx = this.ctx, t = ctx.currentTime + 0.1;
    for (const [f0, at, dur] of [[98, 0, 1.6], [73, 1.7, 2.2]]) {
      const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f0;
      const o2 = ctx.createOscillator(); o2.type = 'square'; o2.frequency.value = f0 * 1.005;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 520; lp.Q.value = 3;
      const g = ctx.createGain(); g.gain.setValueAtTime(0, t + at); g.gain.linearRampToValueAtTime(0.18, t + at + 0.25);
      g.gain.setValueAtTime(0.18, t + at + dur - 0.3); g.gain.linearRampToValueAtTime(0, t + at + dur);
      o.connect(lp); o2.connect(lp); lp.connect(g).connect(this.master);
      o.start(t + at); o2.start(t + at); o.stop(t + at + dur + 0.1); o2.stop(t + at + dur + 0.1);
    }
  }
}
