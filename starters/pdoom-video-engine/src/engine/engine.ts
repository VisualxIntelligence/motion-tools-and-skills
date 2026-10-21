// The engine: owns the renderer, loads scenes for the timeline, renders any song time
// deterministically (with preroll for stateful scenes), composites transitions, HUD, post.
import * as THREE from 'three';
import { AudioData } from './audio';
import { Lyrics } from './lyrics';
import { Compositor, FSPass, W, H, PW, PH, SCALE, SS_TAP, makeRT, clearRT } from './gl';
import { DEFAULT_POST, Post, SHOULDER_GLSL, type PostParams } from './post';
import { Hud, PDoom, type Caption } from './hud';
import type { Frame, Scene, SceneClass, SceneCtx, PostOverrides } from './scene';
import { loadFonts } from './type';
import { loadStrokeFonts } from './stroke';

export interface TimelineEntry {
  id: string;
  /** Lazy module loader; the module's default export is the Scene class. */
  load: () => Promise<{ default: SceneClass }>;
  start: number;
  end: number;
  /** Plate caption shown bottom-right at the start of this entry. */
  caption?: { fig: string; text: string; dur?: number; delay?: number };
  /** Default post overrides for this entry (the scene's own overrides win). */
  post?: PostOverrides;
  /** Free-form params handed to the scene as ctx.params. */
  params?: Record<string, any>;
  /** Cap on adaptive motion-blur sub-frames while this entry is on screen (for noise that converges slowly). */
  maxSamples?: number;
}

interface Loaded { entry: TimelineEntry; scene: Scene | null; error?: string; lastT: number }

/**
 * Per-frame adaptive motion-blur sampling (see Engine.render): the sub-frame count steps through
 * 4, 12, 36, 108, 324 … from `min` up to at most `max` (both rounded to that series) until the
 * estimated remaining sampling error is below `tol` 8-bit levels (worst 2x2-logical-px block).
 * `refine: 'tiles'` (the default) decides that per 32x32-logical-px tile, `'frame'` for the whole frame.
 */
export interface AdaptiveSampling { min: number; max: number; tol: number; refine?: 'tiles' | 'frame' }

/**
 * Shutter offsets (-0.5..0.5) of an adaptive run's sub-frames in rendering order: 4 evenly spread, then
 * each step splits every interval in three, adding a sub-frame either side of each old one. Every
 * prefix of 4·3^l is then evenly spread and centred on the frame's time, and so is each step's new set:
 * comparing the new set's average with the old one's measures sampling error, not a shift in time
 * (with doublings the new half sits half a step later, and any motion at all would read as error).
 */
function ternaryOffsets(steps: number) {
  const u = [0, 1, 2, 3].map((i) => (i + 0.5) / 4 - 0.5);
  for (let l = 0, n = 4; l < steps; l++, n *= 3)
    for (let m = 0; m < n; m++) u.push((3 * m + 0.5) / (3 * n) - 0.5, (3 * m + 2.5) / (3 * n) - 0.5);
  return u;
}

/** Resolve on the next task (a MessageChannel message: no timer clamping), to poll GPU fences cheaply. */
const yieldChannel = typeof MessageChannel !== 'undefined' ? new MessageChannel() : null;
const yieldQueue: (() => void)[] = [];
if (yieldChannel) yieldChannel.port1.onmessage = () => yieldQueue.shift()?.();
function yieldTask() {
  return new Promise<void>((res) => {
    if (!yieldChannel) { setTimeout(res, 0); return; }
    yieldQueue.push(res);
    yieldChannel.port2.postMessage(0);
  });
}

export class Engine {
  renderer: THREE.WebGLRenderer;
  ctx!: SceneCtx;
  audio!: AudioData;
  lyrics!: Lyrics;
  hud!: Hud;
  post!: Post;
  comp = new Compositor();
  loaded = new Map<string, Loaded>();
  // (the scene targets and the motion-blur sums have a depth buffer: it carries the tile mask of per-tile refinement)
  private rts = [makeRT(), makeRT(), makeRT()];
  private mixRT = makeRT();
  // motion-blur sub-frame sums (float: up to hundreds of sub-frames), their average, and the error estimate
  private sumRT = makeRT(W, H, { type: THREE.FloatType });
  private newRT = makeRT(W, H, { type: THREE.FloatType });
  private avgRT = makeRT(W, H, { depthBuffer: false });
  private errRT: THREE.WebGLRenderTarget;
  private maxRT: THREE.WebGLRenderTarget;
  private errPass: FSPass;
  private maxPass: FSPass;
  private errBuf: Float32Array;
  // per-tile refinement: a tile is one texel of maxRT (R x R error blocks); which tiles still refine (255), and
  // the gain (1 / its sub-frame count) each tile's sum is averaged with
  private tileOn: Uint8Array;
  private tileTex: THREE.DataTexture;
  private gainBuf: Float32Array;
  private gainTex: THREE.DataTexture;
  private maskPass: FSPass;
  private errTilePass: FSPass;
  private gainPass: FSPass;
  /**
   * The targets that carry the tile mask, with the margin (in tiles) it is widened by: the engine's own
   * (everything a sub-frame's scenes draw into) and the targets scenes declare in Scene.tileMasked.
   */
  private maskedRTs = new Map<THREE.WebGLRenderTarget, { margin: number; moving?: boolean }>();
  private tileOnWide: Uint8Array;
  private tileTexWide: THREE.DataTexture;
  /** Masking: draws into maskedRTs are depth-tested against the mask. `depthSeen`: a draw there wanted its own depth test. */
  private masking = false;
  private depthSeen = false;
  /** Timeline entries seen drawing with a depth test of their own: never masked (their 3D needs the depth buffer). */
  private depthEntries = new Set<string>();
  /** Sub-frames used for the last rendered frame, and its estimated sampling error after each step. */
  lastSamples = 1;
  lastErrors: number[] = [];
  /** Share of the last frame's extra sub-frames (beyond the first set) actually shaded (1 = every tile). */
  lastShaded = 1;
  private finalRT = new THREE.WebGLRenderTarget(PW, PH, { type: THREE.UnsignedByteType, depthBuffer: false });
  private blit: FSPass;
  private xfade: FSPass;
  private accum: FSPass;
  private lastT = -1;
  lastPost: PostParams = { ...DEFAULT_POST };
  errors: string[] = [];
  /** Suppress the HUD (captions, crop marks) — used when rendering plate thumbnails. */
  hudOff = false;

  timeline: TimelineEntry[] = [];

  constructor(public canvas: HTMLCanvasElement, private makeTimeline: (lyrics: Lyrics, audio: AudioData) => TimelineEntry[]) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(PW, PH, false);
    this.renderer.autoClear = false;
    this.blit = new FSPass(`uniform sampler2D src; void main(){ fragColor = texture(src, vUv); }`, { src: { value: null } });
    this.xfade = new FSPass(`uniform sampler2D a; uniform sampler2D b; uniform float k;
      void main(){ fragColor = mix(texture(a, vUv), texture(b, vUv), k); }`, { a: { value: null }, b: { value: null }, k: { value: 0 } });
    // adds a sub-frame to a sum; a non-finite pixel (a stray NaN from some shader in one sub-frame out of
    // hundreds) is dropped, or it would poison the average and bloom into a disc
    this.accum = new FSPass(`uniform sampler2D src;
      void main() {
        vec4 c = texture(src, vUv);
        bool ok = abs(c.r) <= 6e4 && abs(c.g) <= 6e4 && abs(c.b) <= 6e4 && abs(c.a) <= 6e4;
        fragColor = ok ? c : vec4(0.0);
      }`, { src: { value: null } }, { blending: THREE.CustomBlending, transparent: true });
    const am = this.accum.mat;
    am.blendEquation = THREE.AddEquation;
    am.blendSrc = THREE.OneFactor; am.blendDst = THREE.OneFactor;
    am.blendSrcAlpha = THREE.ZeroFactor; am.blendDstAlpha = THREE.OneFactor;
    // sampling error: per block of B x B physical px (2x2 logical), how far the displayed average moves when a
    // step's new sub-frames (2n, summed in b) are merged with the n before them (summed in a): 2/3 of the gap
    const B = 2 * SCALE, ew = Math.ceil(PW / B), eh = Math.ceil(PH / B), R = 16;
    const small = { depthBuffer: false, type: THREE.FloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, pxScale: 1 } as const;
    this.errRT = makeRT(ew, eh, small);
    this.maxRT = makeRT(Math.ceil(ew / R), Math.ceil(eh / R), small);
    this.errBuf = new Float32Array(this.maxRT.width * this.maxRT.height * 4);
    this.errPass = new FSPass(/* glsl */ `
      uniform sampler2D a; uniform sampler2D b; uniform float invA, invB;
      ${SHOULDER_GLSL}
      vec3 disp(vec3 x) { return toSRGB(sat(shoulder(max(x, 0.0)))); }
      void main() {
        ivec2 p0 = ivec2(gl_FragCoord.xy) * ${B}, lim = ivec2(${PW - 1}, ${PH - 1});
        vec3 sa = vec3(0.0), sb = vec3(0.0);
        for (int y = 0; y < ${B}; y++) for (int x = 0; x < ${B}; x++) {
          ivec2 p = min(p0 + ivec2(x, y), lim);
          sa += texelFetch(a, p, 0).rgb; sb += texelFetch(b, p, 0).rgb;
        }
        vec3 e = abs(disp(sa * (invA / ${B * B}.0)) - disp(sb * (invB / ${B * B}.0)));
        fragColor = vec4(170.0 * max(e.r, max(e.g, e.b)), 0.0, 0.0, 1.0);
      }`, { a: { value: null }, b: { value: null }, invA: { value: 1 }, invB: { value: 1 } });
    this.maxPass = new FSPass(/* glsl */ `
      uniform sampler2D e;
      void main() {
        ivec2 p0 = ivec2(gl_FragCoord.xy) * ${R};
        float m = 0.0;
        for (int y = 0; y < ${R}; y++) for (int x = 0; x < ${R}; x++) {
          ivec2 p = p0 + ivec2(x, y);
          if (p.x < ${ew} && p.y < ${eh}) m = max(m, texelFetch(e, p, 0).r);
        }
        fragColor = vec4(m, 0.0, 0.0, 1.0);
      }`, { e: { value: null } });

    // per-tile refinement (see render): TP = physical px per tile side
    const tw = this.maxRT.width, th = this.maxRT.height, TP = B * R;
    this.tileOn = new Uint8Array(tw * th);
    this.tileTex = new THREE.DataTexture(this.tileOn, tw, th, THREE.RedFormat, THREE.UnsignedByteType);
    this.tileOnWide = new Uint8Array(tw * th);
    this.tileTexWide = new THREE.DataTexture(this.tileOnWide, tw, th, THREE.RedFormat, THREE.UnsignedByteType);
    this.gainBuf = new Float32Array(tw * th);
    this.gainTex = new THREE.DataTexture(this.gainBuf, tw, th, THREE.RedFormat, THREE.FloatType);
    for (const t of [this.tileTex, this.tileTexWide, this.gainTex]) { t.unpackAlignment = 1; t.minFilter = t.magFilter = THREE.NearestFilter; t.generateMipmaps = false; }
    // the tile mask in a depth buffer: 1 where a tile still refines, 0 where it has converged
    // (map: the target's px to output px, gl_FragCoord.xy * map.xy + map.zw)
    this.maskPass = new FSPass(/* glsl */ `
      uniform sampler2D tiles; uniform vec4 map;
      void main() {
        vec2 p = gl_FragCoord.xy * map.xy + map.zw;
        if (p.x < 0.0 || p.y < 0.0 || p.x >= ${PW}.0 || p.y >= ${PH}.0) discard;
        if (texelFetch(tiles, ivec2(floor(p / ${TP}.0)), 0).r < 0.5) discard;
        gl_FragDepth = 1.0;
        fragColor = vec4(0.0);
      }`, { tiles: { value: this.tileTex }, map: { value: new THREE.Vector4(1, 1, 0, 0) } });
    const mm = this.maskPass.mat;
    mm.colorWrite = false; mm.depthTest = true; mm.depthWrite = true; mm.depthFunc = THREE.AlwaysDepth;
    for (const rt of [...this.rts, this.mixRT, this.newRT, this.sumRT]) this.maskedRTs.set(rt, { margin: 0 });
    this.hookDepthState();
    // errPass with the error of tiles no longer refining forced to 0 (their sums hold nothing new)
    this.errTilePass = new FSPass(/* glsl */ `
      uniform sampler2D a; uniform sampler2D b; uniform float invA, invB; uniform sampler2D tiles;
      ${SHOULDER_GLSL}
      vec3 disp(vec3 x) { return toSRGB(sat(shoulder(max(x, 0.0)))); }
      void main() {
        ivec2 p0 = ivec2(gl_FragCoord.xy) * ${B}, lim = ivec2(${PW - 1}, ${PH - 1});
        vec3 sa = vec3(0.0), sb = vec3(0.0);
        for (int y = 0; y < ${B}; y++) for (int x = 0; x < ${B}; x++) {
          ivec2 p = min(p0 + ivec2(x, y), lim);
          sa += texelFetch(a, p, 0).rgb; sb += texelFetch(b, p, 0).rgb;
        }
        vec3 e = abs(disp(sa * (invA / ${B * B}.0)) - disp(sb * (invB / ${B * B}.0)));
        float on = texelFetch(tiles, ivec2(gl_FragCoord.xy) / ${R}, 0).r;
        fragColor = vec4(170.0 * max(e.r, max(e.g, e.b)) * on, 0.0, 0.0, 1.0);
      }`, { a: { value: null }, b: { value: null }, invA: { value: 1 }, invB: { value: 1 }, tiles: { value: this.tileTex } });
    // the final average with a gain per tile: the Compositor's 'replace' draw (same uv maths, so a tile
    // comes out exactly as the whole-frame average at its count would) with opacity read from gainTex
    this.gainPass = new FSPass(/* glsl */ `
      uniform sampler2D tex; uniform vec3 tint; uniform vec4 uvXform; uniform bool premult; uniform sampler2D gain;
      void main() {
        vec2 uv = (vUv - 0.5) * uvXform.xy + 0.5 + uvXform.zw;
        if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) discard;
        vec4 c = texture(tex, uv);
        c.rgb *= tint;
        if (premult) c.rgb *= c.a;
        fragColor = vec4(c.rgb, c.a) * texelFetch(gain, ivec2(gl_FragCoord.xy) / ${TP}, 0).r;
      }`, { tex: { value: null }, tint: { value: new THREE.Vector3(1, 1, 1) }, uvXform: { value: new THREE.Vector4(1, 1, 0, 0) }, premult: { value: false }, gain: { value: this.gainTex } });
  }

  /**
   * Masked drawing for per-tile refinement. While `masking` is on, every draw into one of maskedRTs is
   * depth-tested (LEQUAL, no depth writes, clears included) against the tile mask, whatever its material
   * says: the draws scenes make are at depth <= 1, so they pass where the mask is 1 and converged tiles
   * (mask 0) are rejected before their fragments are shaded (early-Z). Draws into other targets (scenes'
   * own) keep their materials' depth state. A material that wants its own depth test while drawing into a
   * masked target sets depthSeen (its sub-frame is then drawn again unmasked, see render).
   */
  private hookDepthState() {
    const r = this.renderer, st = r.state, d = st.buffers.depth;
    const setTest = d.setTest.bind(d), setFunc = d.setFunc.bind(d), setMask = d.setMask.bind(d);
    let forced = false;
    const force = (on: boolean) => {
      if (on === forced) return;
      forced = on;
      if (on) { setTest(true); setFunc(THREE.LessEqualDepth); setMask(false); }
    };
    d.setTest = (v: boolean) => { if (!forced) setTest(v); };
    d.setFunc = (f: THREE.DepthModes) => { if (!forced) setFunc(f); };
    d.setMask = (m: boolean) => { if (!forced) setMask(m); };
    const setRenderTarget = r.setRenderTarget.bind(r);
    r.setRenderTarget = (target, ...rest) => {
      setRenderTarget(target, ...rest);
      force(this.masking && !!target && this.maskedRTs.has(target as THREE.WebGLRenderTarget));
    };
    const setMaterial = st.setMaterial.bind(st);
    st.setMaterial = (m, ...rest) => {
      if (forced && m.depthTest) this.depthSeen = true;
      setMaterial(m, ...rest);
    };
    this.setMasking = (on: boolean) => {
      this.masking = on;
      const t = r.getRenderTarget();
      force(on && !!t && this.maskedRTs.has(t));
    };
  }
  private setMasking: (on: boolean) => void = () => {};

  /** Write tileOn into the depth buffer of the masked targets (1 = still refining, 0 = converged). */
  private writeTileMask() {
    const r = this.renderer, was = this.masking;
    if (was) this.setMasking(false);
    this.tileTex.needsUpdate = true;
    // the mask widened by a tile, for scene targets read a little off the pixel
    const on = this.tileOn, wide = this.tileOnWide, tw = this.maxRT.width, th = this.maxRT.height;
    wide.fill(0);
    for (let y = 0; y < th; y++) for (let x = 0; x < tw; x++) {
      if (!on[y * tw + x]) continue;
      for (let yy = Math.max(0, y - 1); yy <= Math.min(th - 1, y + 1); yy++)
        for (let xx = Math.max(0, x - 1); xx <= Math.min(tw - 1, x + 1); xx++) wide[yy * tw + xx] = 255;
    }
    this.tileTexWide.needsUpdate = true;
    // (a moving target is drawn whole unless its scene maps the mask, see mapTileMask)
    for (const [rt, m] of this.maskedRTs) this.drawMask(rt, m.margin, m.moving ? null : new THREE.Vector4(PW / rt.width, PH / rt.height, 0, 0));
    if (was) this.setMasking(true);
  }

  /** Write the tile mask into rt's depth buffer, through `map` (rt px -> output px); null: all of rt on. */
  private drawMask(rt: THREE.WebGLRenderTarget, margin: number, map: THREE.Vector4 | null) {
    const r = this.renderer, d = r.state.buffers.depth;
    r.setRenderTarget(rt);
    if (!map) { r.clear(false, true, false); return; }
    d.setClear(0);
    r.clear(false, true, false);
    d.setClear(1);
    this.maskPass.u.tiles!.value = margin ? this.tileTexWide : this.tileTex;
    (this.maskPass.u.map!.value as THREE.Vector4).copy(map);
    this.maskPass.render(r, rt);
  }

  /** SceneCtx.mapTileMask: `map` takes rt uv to screen uv. */
  private mapTileMask(rt: THREE.WebGLRenderTarget, map: THREE.Vector4 | null) {
    const m = this.maskedRTs.get(rt);
    if (!this.masking || !m?.moving) return;
    const r = this.renderer, prev = r.getRenderTarget(), x = new THREE.Vector4();
    if (map) x.set((map.x * PW) / rt.width, (map.y * PH) / rt.height, map.z * PW, map.w * PH);
    this.setMasking(false);
    this.drawMask(rt, m.margin, map ? x : null);
    this.setMasking(true);
    r.setRenderTarget(prev);
  }

  async init(only?: (e: TimelineEntry) => boolean) {
    [this.audio, this.lyrics] = await Promise.all([AudioData.load(), Lyrics.load(), loadFonts(), loadStrokeFonts()]) as [AudioData, Lyrics, void, void];
    this.timeline = this.makeTimeline(this.lyrics, this.audio);
    this.ctx = { renderer: this.renderer, audio: this.audio, lyrics: this.lyrics, comp: this.comp, W, H, id: '', params: {}, start: 0, end: 0, mapTileMask: (rt, map) => this.mapTileMask(rt, map) };
    this.post = new Post();
    const captions: Caption[] = this.timeline.filter((e) => e.caption).map((e) => {
      const d = e.caption!.delay ?? 0.3;
      return { start: e.start + d, end: e.start + d + (e.caption!.dur ?? 4.5), fig: e.caption!.fig, text: e.caption!.text };
    });
    this.hud = new Hud(new PDoom(this.lyrics), captions);
    const entries = only ? this.timeline.filter(only) : this.timeline;
    await Promise.all(entries.map((e) => this.loadEntry(e)));
  }

  private async loadEntry(e: TimelineEntry) {
    const rec: Loaded = { entry: e, scene: null, lastT: -1 };
    this.loaded.set(e.id, rec);
    try {
      const mod = await e.load();
      const s = new mod.default({ ...this.ctx, id: e.id, params: e.params ?? {}, start: e.start, end: e.end });
      await s.init();
      rec.scene = s;
      for (const m of s.tileMasked) this.maskedRTs.set(m.rt, { margin: m.margin, moving: m.moving });
    } catch (err) {
      rec.error = String((err as Error)?.stack ?? err);
      this.errors.push(`[${e.id}] ${rec.error}`);
      console.error(`scene ${e.id} failed`, err);
    }
  }

  /** Hot-swap a scene module (used by Vite HMR in preview). */
  async reload(id: string) {
    const e = this.timeline.find((x) => x.id === id);
    if (!e) return;
    const old = this.loaded.get(id)?.scene;
    for (const m of old?.tileMasked ?? []) this.maskedRTs.delete(m.rt);
    old?.dispose();
    await this.loadEntry(e);
    this.lastT = -1;
  }

  get duration() { return this.audio.duration; }

  private frameFor(e: TimelineEntry, t: number, dt: number, seeked: boolean, preroll: boolean, under: THREE.Texture | null, tin: number, tout: number): Frame {
    const beat = this.audio.beatAt(t), bar = this.audio.barAt(t);
    return {
      t, dt, lt: t - e.start, p: (t - e.start) / (e.end - e.start), start: e.start, end: e.end, seeked, preroll,
      beat, bar, beatPhase: beat - Math.floor(beat), barPhase: bar - Math.floor(bar),
      a: this.audio.sample(t), under, tin, tout,
    };
  }

  /**
   * Render song time t. `dt` is the nominal frame step (1/fps). A non-sequential t counts as a
   * seek: stateful scenes are reset and fast-forwarded.
   *
   * Motion blur (offline export; the preview uses 1 sample): `samples` > 1 renders that many sub-frames
   * spread evenly over `shutter` x dt around t and averages them before post-processing, which gives real
   * motion blur plus temporal anti-aliasing. With an AdaptiveSampling the count is chosen per frame:
   * sub-frames are added in nested steps (4, 12, 36 … each set evenly spread over the shutter, see
   * ternaryOffsets) until the estimated remaining error is below `tol` levels. Stepped copies of a moving
   * edge shrink as 1/count, so when a step changes the frame by e, what is left is about e/2
   * (e·(1/3 + 1/9 + …)). A still frame stops at 3 x min; a whip pan goes on until its streaks are
   * continuous instead of stepped copies.
   * Returns the number of sub-frames used.
   */
  render(t: number, dt = 1 / 60, toScreen = true, samples: number | AdaptiveSampling = 1, shutter = 0.5): number {
    const r = this.renderer;
    const seeked = this.lastT < 0 || t < this.lastT - 1e-6 || t - this.lastT > Math.max(0.25, dt * 4);
    this.lastT = t;
    let outTex: THREE.Texture;
    let post: PostParams = { ...DEFAULT_POST };
    let n = 1;
    if (samples === 1) {
      SS_TAP.value = -1;
      ({ outTex, post } = this.composite(t, dt, seeked));
    } else {
      const adaptive = typeof samples !== 'number';
      let maxAdaptive = adaptive ? samples.max : 0;
      if (adaptive) {
        // sub-frames are rendered out of time order: fine for pure functions of t, not for scenes that integrate state
        const w = dt * shutter;
        const on = this.timeline.filter((e) => t + w / 2 >= e.start && t - w / 2 < e.end);
        const st = on.find((e) => this.loaded.get(e.id)?.scene?.stateful);
        if (st) throw new Error(`adaptive sampling needs stateless scenes; '${st.id}' is stateful (use a fixed --samples)`);
        for (const e of on) if (e.maxSamples) maxAdaptive = Math.min(maxAdaptive, e.maxSamples);
      }
      // shaders that supersample share their 4 taps across the sub-frames when every set holds a multiple
      // of 4 (rotated by k/4 so a tap doesn't always land in the same part of the shutter)
      const cycle = adaptive || samples % 4 === 0;
      // post parameters (shake, flash, zoom, fades, the HUD's paper mode) are read at one point of the shutter,
      // 1/8 of it after t: where the video was tuned (4 sub-frames, the third) and a point every adaptive set
      // includes. (A flash that starts between t and there shows at its peak on this frame, not one frame on.)
      const POST_U = 0.125;
      let nearest = Infinity;
      // sub-frame k at shutter offset u (-0.5..0.5), summed into `into`; `step` = the sub-frame spacing
      const sub = (k: number, u: number, into: THREE.WebGLRenderTarget, step: number) => {
        SS_TAP.value = cycle ? (k + (k >> 2)) % 4 : -1;
        // (clamped at 0: before the song no scene is active, and frame 0 would come out half black)
        const ts = Math.max(0, t + dt * shutter * u);
        let res: ReturnType<Engine['composite']>;
        if (!this.masking) res = this.composite(ts, step, seeked && k === 0);
        else {
          // a scene that depth-tests its own 3D can't draw over the mask: its sub-frames are drawn unmasked
          // (and the mask written again after, since it has cleared and drawn into the scene target's depth)
          const ids = this.timeline.filter((e) => ts >= e.start && ts < e.end).map((e) => e.id);
          let own = ids.some((id) => this.depthEntries.has(id));
          if (!own) {
            this.depthSeen = false;
            res = this.composite(ts, step, seeked && k === 0);
            if (this.depthSeen) { own = true; for (const id of ids) this.depthEntries.add(id); }
          }
          if (own) {
            this.setMasking(false);
            res = this.composite(ts, step, seeked && k === 0);
            this.writeTileMask();
            this.setMasking(true);
          }
        }
        this.accum.u.src!.value = res!.outTex;
        this.accum.render(r, into);
        const d = Math.abs(u - POST_U);
        if (d < nearest - 1e-9 || (d < nearest + 1e-9 && u > POST_U)) { nearest = d; post = res!.post; }
      };
      clearRT(r, this.sumRT, [0, 0, 0], 0);
      let perTile = false;
      if (!adaptive) {
        n = samples;
        for (let k = 0; k < n; k++) sub(k, (k + 0.5) / n - 0.5, this.sumRT, dt / n);
      } else {
        const lg3 = (x: number) => Math.log(x / 4) / Math.log(3);
        const lo = Math.max(0, Math.round(lg3(samples.min))), hi = Math.max(lo, Math.floor(lg3(maxAdaptive) + 1e-9));
        const u = ternaryOffsets(hi);
        n = 4 * 3 ** lo;
        this.lastErrors = [];
        this.lastShaded = 1;
        for (let k = 0; k < n; k++) sub(k, u[k]!, this.sumRT, dt / n);
        if ((samples.refine ?? 'tiles') === 'frame') {
          for (let l = lo; l < hi; l++) {
            clearRT(r, this.newRT, [0, 0, 0], 0);
            for (let k = n; k < 3 * n; k++) sub(k, u[k]!, this.newRT, dt / (3 * n));
            const err = this.sampleError(n) / 2;
            this.lastErrors.push(err);
            this.comp.draw(r, this.newRT.texture, this.sumRT, { mode: 'add', opacity: 1, premult: false });
            n *= 3;
            if (err < samples.tol) break;
          }
        } else {
          // Per-tile refinement: after each set, a tile goes on to the next only while it or one of its 8
          // neighbours is still at or over `tol`; a tile that stopped never restarts. Later sub-frames are
          // drawn with converged tiles masked out by the depth test (rejected before shading), only the tiles
          // still refining are added to the sums, and each tile is averaged over its own count. So every
          // tile is exactly the whole-frame sampler's frame had it stopped at that tile's count.
          const on = this.tileOn, tw = this.maxRT.width, th = this.maxRT.height, T = on.length;
          on.fill(255); // (an R8 texture: 255 reads as 1.0)
          const tileN = this.gainBuf; // count per tile, turned into the gain at the end
          tileN.fill(0);
          let live = T, shaded = 0, full = 0;
          for (let l = lo; l < hi && live > 0; l++) {
            const masked = live < T;
            clearRT(r, this.newRT, [0, 0, 0], 0);
            if (masked) { this.writeTileMask(); this.setMasking(true); }
            for (let k = n; k < 3 * n; k++) sub(k, u[k]!, this.newRT, dt / (3 * n));
            if (masked) this.setMasking(false);
            const err = this.sampleError(n, masked) / 2;
            this.lastErrors.push(err);
            if (masked) this.setMasking(true);
            this.comp.draw(r, this.newRT.texture, this.sumRT, { mode: 'add', opacity: 1, premult: false });
            if (masked) this.setMasking(false);
            shaded += 2 * n * live; full += 2 * n * T;
            n *= 3;
            // tiles whose neighbourhood is converged stop at this count
            const e = this.errBuf, next = new Uint8Array(T);
            for (let y = 0; y < th; y++) for (let x = 0; x < tw; x++) {
              const i = y * tw + x;
              if (!on[i]) continue;
              let m = 0;
              for (let yy = Math.max(0, y - 1); yy <= Math.min(th - 1, y + 1); yy++)
                for (let xx = Math.max(0, x - 1); xx <= Math.min(tw - 1, x + 1); xx++) m = Math.max(m, e[(yy * tw + xx) * 4]!);
              if (m / 2 >= samples.tol) next[i] = 255;
              else { tileN[i] = n; live--; }
            }
            on.set(next);
          }
          if (full > 0) {
            this.lastShaded = shaded / full;
            // tiles still refining when the sets ran out end at the last count, which is the frame's
            for (let i = 0; i < T; i++) if (on[i]) tileN[i] = n;
            perTile = tileN.some((c) => c !== n);
            if (perTile) { for (let i = 0; i < T; i++) tileN[i] = 1 / tileN[i]!; this.gainTex.needsUpdate = true; }
          }
        }
      }
      SS_TAP.value = -1;
      if (perTile) {
        this.gainPass.u.tex!.value = this.sumRT.texture;
        this.gainPass.render(r, this.avgRT);
      } else this.comp.draw(r, this.sumRT.texture, this.avgRT, { mode: 'replace', opacity: 1 / n, premult: false });
      outTex = this.avgRT.texture;
    }
    this.lastSamples = n;
    const hudTex = this.hud.draw(t, { opacity: this.hudOff ? 0 : post.hud, frame: post.frame, readout: post.pdoom, paper: post.paper, pdoomOverride: post.pdoomText, corruption: post.hudCorruption });
    this.post.render(r, outTex, hudTex, this.finalRT, post, t);
    this.lastPost = post;
    if (toScreen) {
      this.blit.u.src!.value = this.finalRT.texture;
      this.blit.render(r, null);
    }
    return n;
  }

  /**
   * How far the displayed frame (8-bit levels, worst block) moves when the 2n sub-frames summed in newRT
   * are merged with the n summed in sumRT. Stepped copies of a fast edge differ between the two
   * interleaved sets; a converged streak does not.
   */
  private sampleError(n: number, tiles = false) {
    const r = this.renderer;
    // (with some tiles stopped, the error of those is forced to 0: their sums hold nothing new)
    const p = tiles ? this.errTilePass : this.errPass;
    p.u.a!.value = this.sumRT.texture;
    p.u.b!.value = this.newRT.texture;
    p.u.invA!.value = 1 / n;
    p.u.invB!.value = 1 / (2 * n);
    p.render(r, this.errRT);
    this.maxPass.u.e!.value = this.errRT.texture;
    this.maxPass.render(r, this.maxRT);
    r.readRenderTargetPixels(this.maxRT, 0, 0, this.maxRT.width, this.maxRT.height, this.errBuf);
    let m = 0;
    for (let i = 0; i < this.errBuf.length; i += 4) m = Math.max(m, this.errBuf[i]!);
    return m;
  }

  /**
   * Render and composite all scenes active at t into an HDR texture (no post). `dt` is the step handed to
   * scenes (the frame step, or the sub-frame spacing); `seeked` says time jumped before this call.
   */
  private composite(t: number, dt: number, seeked: boolean): { outTex: THREE.Texture; post: PostParams } {
    const r = this.renderer;

    const active = this.timeline.filter((e) => t >= e.start && t < e.end).sort((a, b) => a.start - b.start);
    let post: PostParams = { ...DEFAULT_POST };
    let under: THREE.Texture | null = null;
    let outTex: THREE.Texture | null = null;

    active.forEach((e, idx) => {
      const rec = this.loaded.get(e.id);
      const rt = this.rts[idx % this.rts.length]!;
      const prev = active[idx - 1], next = active[idx + 1];
      const tin = prev ? Math.min(1, (t - e.start) / Math.max(1e-3, prev.end - e.start)) : 1;
      const tout = next ? Math.max(0, (t - next.start) / Math.max(1e-3, e.end - next.start)) : 0;
      if (!rec?.scene) {
        clearRT(r, rt, [0.25, 0.0, 0.0]);
        under = rt.texture; outTex = rt.texture;
        return;
      }
      const s = rec.scene;
      // (sub-frames of one frame may step back within its shutter: not a seek)
      const sceneSeeked = seeked || rec.lastT < 0 || Math.abs(t - rec.lastT) > 0.25;
      if (s.stateful && sceneSeeked) {
        s.reset();
        const from = Math.max(e.start, t - s.prerollMax);
        const step = 1 / 60;
        let first = true;
        for (let pt = from; pt < t - step * 0.5; pt += step) {
          s.render(this.frameFor(e, pt, first ? 0 : step, first, true, null, 1, 0), rt);
          first = false;
        }
      }
      let ov: PostOverrides | void = undefined;
      try {
        ov = s.render(this.frameFor(e, t, sceneSeeked ? 0 : dt, sceneSeeked && !s.stateful, false, idx > 0 ? under : null, tin, tout), rt);
      } catch (err) {
        console.error(`scene ${e.id} render error`, err);
        clearRT(r, rt, [0.25, 0.0, 0.0]);
      }
      rec.lastT = t;
      post = { ...post, ...(e.post ?? {}), ...(ov ?? {}) };
      if (idx > 0 && !s.handlesTransition && under) {
        // default: crossfade from the previous scene over the overlap
        this.xfade.u.a!.value = under;
        this.xfade.u.b!.value = rt.texture;
        this.xfade.u.k!.value = tin;
        this.xfade.render(r, this.mixRT);
        outTex = this.mixRT.texture;
      } else outTex = rt.texture;
      under = outTex;
    });

    if (!outTex) { clearRT(r, this.rts[0]!, [0, 0, 0]); outTex = this.rts[0]!.texture; }
    return { outTex, post };
  }

  /** RGBA8 pixels of the last rendered frame (bottom-up rows), PW x PH. */
  readPixels(buf?: Uint8Array) {
    const out = buf ?? new Uint8Array(PW * PH * 4);
    this.renderer.readRenderTargetPixels(this.finalRT, 0, 0, PW, PH, out);
    return out;
  }

  /**
   * Same pixels as readPixels(), read through a pixel-pack buffer and a fence instead of a blocking
   * readPixels: several times faster in Chrome (~15 ms instead of ~40 ms at 1080p, ~150 ms at 4K).
   */
  async readPixelsAsync(buf?: Uint8Array) {
    const out = buf ?? new Uint8Array(PW * PH * 4);
    await this.renderer.readRenderTargetPixelsAsync(this.finalRT, 0, 0, PW, PH, out);
    return out;
  }

  private packs: ({ buf: WebGLBuffer; sync: WebGLSync } | undefined)[] = [];
  // the frame as packed RGB (rgb24, a quarter fewer bytes to read back and send than RGBA): texel i of a row
  // holds bytes 4i..4i+3 of the row's R,G,B stream, copied exactly (8-bit in, 8-bit out)
  private rgbRT = new THREE.WebGLRenderTarget((PW * 3) / 4, PH, { type: THREE.UnsignedByteType, depthBuffer: false, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
  private rgbPass = new FSPass(/* glsl */ `
    uniform sampler2D src;
    void main() {
      ivec2 o = ivec2(gl_FragCoord.xy);
      vec4 v;
      for (int c = 0; c < 4; c++) {
        int b = o.x * 4 + c, i = b / 3, ch = b - i * 3;
        vec4 p = texelFetch(src, ivec2(i, o.y), 0);
        v[c] = ch == 0 ? p.r : ch == 1 ? p.g : p.b;
      }
      fragColor = v;
    }`, { src: { value: null } });
  /** Bytes per frame of readStart/readFinish (packed RGB, bottom-up rows). */
  static readonly RGB_BYTES = PW * PH * 3;
  /**
   * Pipelined readback of the last rendered frame as packed RGB (rgb24, bottom-up rows; the bytes of
   * readPixels() without alpha): queue the copy into pixel-pack buffer `slot` (it runs on the GPU after
   * the frame, so the next frame can be rendered at once), then collect it with readFinish(slot). Two
   * slots let frame n be collected while n+1 renders. (A fresh buffer each time, as three's readback does:
   * Chrome warns on every frame when a read-back buffer is reused, though it reads no faster.)
   */
  readStart(slot: number) {
    const r = this.renderer, gl = r.getContext() as WebGL2RenderingContext;
    const old = this.packs[slot];
    if (old) { gl.deleteSync(old.sync); gl.deleteBuffer(old.buf); } // (left by a stream that failed)
    const buf = gl.createBuffer()!;
    this.rgbPass.u.src!.value = this.finalRT.texture;
    this.rgbPass.render(r, this.rgbRT);
    r.setRenderTarget(this.rgbRT);
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, buf);
    gl.bufferData(gl.PIXEL_PACK_BUFFER, Engine.RGB_BYTES, gl.STREAM_READ);
    gl.readPixels(0, 0, this.rgbRT.width, PH, gl.RGBA, gl.UNSIGNED_BYTE, 0);
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
    this.packs[slot] = { buf, sync: gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0)! };
    gl.flush();
  }

  /** Wait for readStart(slot)'s copy and copy it into `out` (Engine.RGB_BYTES). */
  async readFinish(slot: number, out: Uint8Array) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext, p = this.packs[slot];
    if (!p) throw new Error(`readFinish: nothing queued in slot ${slot}`);
    // (a sync object's status only changes between tasks: yield to the event loop between polls)
    for (;;) {
      const s = gl.clientWaitSync(p.sync, 0, 0);
      if (s === gl.ALREADY_SIGNALED || s === gl.CONDITION_SATISFIED) break;
      if (s === gl.WAIT_FAILED) throw new Error('readFinish: fence wait failed');
      await yieldTask();
    }
    this.packs[slot] = undefined;
    gl.deleteSync(p.sync);
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, p.buf);
    gl.getBufferSubData(gl.PIXEL_PACK_BUFFER, 0, out);
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
    gl.deleteBuffer(p.buf);
    return out;
  }
}
