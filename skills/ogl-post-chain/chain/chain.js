// chain.js: an HDR post chain for OGL (WebGL2), written so every frame stays a pure function of `t`.
//
//   scene → HDR target (RGBA16F) → bloom pyramid → composite + grade → [FXAA] → canvas or target
//
// Usage inside a scene (see ../examples/post-demo.js):
//   const chain = new PostChain(gl, { width: stage.w, height: stage.h });
//   ...in render(t, frame):
//   chain.params.exposure = fadeIn(t);              // animate params from t, absolutely, every frame
//   chain.render({ scene, camera, frame });
//
// Author the scene in LINEAR HDR: emissive surfaces may output 4, 10, 50. Do not gamma-encode in the scene
// shaders; the composite does tone mapping and the sRGB encode. Make the Renderer with antialias: false
// (export `const stage = { msaa: false }` from the scene) because FXAA does the antialiasing here.
//
// Needs WebGL2 and EXT_color_buffer_float (OGL's Renderer requests it). MIT like the rest of this repo's own
// code; the FXAA function is adapted from OGL's post-fxaa example (Unlicense, see LICENSE-OGL).
import { Program, Mesh, RenderTarget, Triangle } from '../../vendor/ogl/src/index.js';

const VERT = `#version 300 es
in vec2 position; in vec2 uv; out vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }`;

const HEAD = `#version 300 es
precision highp float; precision highp int;
in vec2 vUv; out vec4 fragColor;`;

// Jimenez 13-tap downsample. With KARIS, the first level weights each 4-tap group by 1 / (1 + luma) so one
// very bright pixel cannot flicker the whole bloom ("fireflies"), then applies the soft threshold.
const DOWN = (first) => `${HEAD}
uniform sampler2D tMap; uniform vec2 uTexel; uniform float uThreshold; uniform float uKnee; uniform float uMax;
vec3 fetch(vec2 uv) {
  vec3 s = texture(tMap, uv).rgb;
  ${first ? 'if (any(isnan(s)) || any(isinf(s))) return vec3(0.0);   // one NaN pixel would smear into a black or white blob\n  s = min(s, vec3(uMax));' : ''}
  return s;
}
float luma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
void main() {
  vec2 t = uTexel;
  vec3 a = fetch(vUv + t * vec2(-2.0, -2.0)), b = fetch(vUv + t * vec2(0.0, -2.0)), c = fetch(vUv + t * vec2(2.0, -2.0));
  vec3 d = fetch(vUv + t * vec2(-2.0, 0.0)),  e = fetch(vUv),                       f = fetch(vUv + t * vec2(2.0, 0.0));
  vec3 g = fetch(vUv + t * vec2(-2.0, 2.0)),  h = fetch(vUv + t * vec2(0.0, 2.0)),  i = fetch(vUv + t * vec2(2.0, 2.0));
  vec3 j = fetch(vUv + t * vec2(-1.0, -1.0)), k = fetch(vUv + t * vec2(1.0, -1.0));
  vec3 l = fetch(vUv + t * vec2(-1.0, 1.0)),  m = fetch(vUv + t * vec2(1.0, 1.0));
  ${first ? `
  vec3 g0 = (a + b + d + e) * 0.25, g1 = (b + c + e + f) * 0.25, g2 = (d + e + g + h) * 0.25, g3 = (e + f + h + i) * 0.25, g4 = (j + k + l + m) * 0.25;
  float w0 = 1.0 / (1.0 + luma(g0)), w1 = 1.0 / (1.0 + luma(g1)), w2 = 1.0 / (1.0 + luma(g2)), w3 = 1.0 / (1.0 + luma(g3)), w4 = 1.0 / (1.0 + luma(g4));
  vec3 r = (g0 * w0 + g1 * w1 + g2 * w2 + g3 * w3) * 0.125 + g4 * w4 * 0.5;
  r /= (w0 + w1 + w2 + w3) * 0.125 + w4 * 0.5;
  float br = max(r.r, max(r.g, r.b));
  float soft = clamp(br - uThreshold + uKnee, 0.0, 2.0 * uKnee); soft = soft * soft / (4.0 * uKnee + 1e-4);
  r *= max(soft, br - uThreshold) / max(br, 1e-4);
  fragColor = vec4(r, 1.0);` : `
  vec3 r = e * 0.125 + (a + c + g + i) * 0.03125 + (b + d + f + h) * 0.0625 + (j + k + l + m) * 0.125;
  fragColor = vec4(r, 1.0);`}
}`;

// 3x3 tent upsample of the smaller level, blended into the larger level (mix keeps energy bounded).
const UP = `${HEAD}
uniform sampler2D tLow; uniform sampler2D tHigh; uniform vec2 uTexel; uniform float uScatter;
void main() {
  vec2 t = uTexel;
  vec3 s = texture(tLow, vUv + t * vec2(-1.0, -1.0)).rgb + 2.0 * texture(tLow, vUv + t * vec2(0.0, -1.0)).rgb + texture(tLow, vUv + t * vec2(1.0, -1.0)).rgb
         + 2.0 * texture(tLow, vUv + t * vec2(-1.0, 0.0)).rgb + 4.0 * texture(tLow, vUv).rgb + 2.0 * texture(tLow, vUv + t * vec2(1.0, 0.0)).rgb
         + texture(tLow, vUv + t * vec2(-1.0, 1.0)).rgb + 2.0 * texture(tLow, vUv + t * vec2(0.0, 1.0)).rgb + texture(tLow, vUv + t * vec2(1.0, 1.0)).rgb;
  fragColor = vec4(mix(texture(tHigh, vUv).rgb, s / 16.0, uScatter), 1.0);
}`;

// Composite: exposure + bloom, chromatic aberration, tone map, grade, vignette, frame-keyed grain, dither.
const COMPOSITE = `${HEAD}
uniform sampler2D tScene; uniform sampler2D tBloom;
uniform float uExposure, uBloom, uSat, uContrast, uCA, uGrain, uFrame; uniform int uTone;
uniform vec3 uTint; uniform vec2 uVignette; uniform vec2 uRes;
uint pcg(uint v) { uint s = v * 747796405u + 2891336453u; uint w = ((s >> ((s >> 28u) + 4u)) ^ s) * 277803737u; return (w >> 22u) ^ w; }
float rnd(uvec2 p, uint f) { return float(pcg(p.x + pcg(p.y + pcg(f)))) / 4294967295.0; }
vec3 aces(vec3 x) { return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }
vec3 reinhard(vec3 x) { float w2 = 16.0; return x * (1.0 + x / w2) / (1.0 + x); }
vec3 srgb(vec3 c) { return mix(c * 12.92, 1.055 * pow(max(c, 0.0), vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }
void main() {
  vec2 dir = vUv - 0.5; float r2 = dot(dir, dir);
  vec2 off = dir * uCA * r2 * 4.0;                       // grows toward the edges, zero at the centre
  vec3 sc = vec3(texture(tScene, vUv + off).r, texture(tScene, vUv).g, texture(tScene, vUv - off).b);
  vec3 bl = vec3(texture(tBloom, vUv + off).r, texture(tBloom, vUv).g, texture(tBloom, vUv - off).b);
  vec3 c = (sc + bl * uBloom) * uExposure * uTint;
  c = uTone == 1 ? aces(c) : uTone == 2 ? reinhard(c) : clamp(c, 0.0, 1.0);
  c = srgb(c);
  c = (c - 0.5) * uContrast + 0.5;
  float y = dot(c, vec3(0.2126, 0.7152, 0.0722)); c = mix(vec3(y), c, uSat);
  c *= 1.0 - uVignette.x * smoothstep(0.0, uVignette.y, r2 * 2.0);
  uvec2 p = uvec2(gl_FragCoord.xy); uint f = uint(uFrame + 0.5);
  float n1 = rnd(p, f), n2 = rnd(p, f + 7919u);
  c += (n1 - 0.5) * uGrain * (0.35 + 0.65 * (1.0 - y));       // film grain, stronger in the shadows; keyed to the frame index
  c += (n1 + n2 - 1.0) / 255.0;                                // triangular dither against banding
  fragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
}`;

const FXAA = `${HEAD}
uniform sampler2D tMap; uniform vec2 uResolution;
vec4 fxaa(sampler2D tex, vec2 uv, vec2 resolution) {
  vec2 pixel = vec2(1.0) / resolution; vec3 l = vec3(0.299, 0.587, 0.114);
  float lNW = dot(texture(tex, uv + vec2(-1, -1) * pixel).rgb, l), lNE = dot(texture(tex, uv + vec2(1, -1) * pixel).rgb, l);
  float lSW = dot(texture(tex, uv + vec2(-1, 1) * pixel).rgb, l),  lSE = dot(texture(tex, uv + vec2(1, 1) * pixel).rgb, l);
  float lM = dot(texture(tex, uv).rgb, l);
  float lMin = min(lM, min(min(lNW, lNE), min(lSW, lSE))), lMax = max(lM, max(max(lNW, lNE), max(lSW, lSE)));
  vec2 dir = vec2(-((lNW + lNE) - (lSW + lSE)), ((lNW + lSW) - (lNE + lSE)));
  float dirReduce = max((lNW + lNE + lSW + lSE) * 0.03125, 0.0078125);
  float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);
  dir = min(vec2(8.0), max(vec2(-8.0), dir * rcpDirMin)) * pixel;
  vec3 rgbA = 0.5 * (texture(tex, uv + dir * (1.0 / 3.0 - 0.5)).rgb + texture(tex, uv + dir * (2.0 / 3.0 - 0.5)).rgb);
  vec3 rgbB = rgbA * 0.5 + 0.25 * (texture(tex, uv + dir * -0.5).rgb + texture(tex, uv + dir * 0.5).rgb);
  float lB = dot(rgbB, l);
  return mix(vec4(rgbB, 1.0), vec4(rgbA, 1.0), max(sign(lB - lMin), 0.0) * max(sign(lB - lMax), 0.0));
}
void main() { fragColor = fxaa(tMap, vUv, uResolution); }`;

const TONES = { none: 0, aces: 1, reinhard: 2 };

export class PostChain {
  constructor(gl, { width, height, levels = 6, fxaa = true, params = {} } = {}) {
    const renderer = gl.renderer;
    if (!renderer.isWebgl2) throw new Error('PostChain needs WebGL2');
    this.gl = gl; this.renderer = renderer; this.fxaa = fxaa;
    this.width = width; this.height = height;

    // Everything here is read each render(); assign from t to animate. Defaults suit an emissive scene.
    this.params = {
      exposure: 1, tone: 'aces',                       // tone: 'aces' | 'reinhard' | 'none'
      bloom: 0.6, threshold: 1.0, knee: 0.5, scatter: 0.7, maxIntensity: 64,
      saturation: 1.05, contrast: 1.04, tint: [1, 1, 1],
      vignette: 0.35, vignetteSoftness: 1.0,
      aberration: 0.0,                                 // 0 off; 0.02 is visible, 0.06 is heavy
      grain: 0.035,
      ...params,
    };

    const geo = new Triangle(gl);
    const rt = (w, h, { half = true, depth = false } = {}) => new RenderTarget(gl, {
      width: w, height: h, depth,
      type: half ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE, internalFormat: half ? gl.RGBA16F : gl.RGBA8, format: gl.RGBA,
      minFilter: gl.LINEAR, magFilter: gl.LINEAR,
    });
    const pass = (fragment, uniforms) => {
      const program = new Program(gl, { vertex: VERT, fragment, uniforms, depthTest: false, depthWrite: false, cullFace: false });
      const mesh = new Mesh(gl, { geometry: geo, program }); mesh.frustumCulled = false;
      return { program, mesh, u: program.uniforms };
    };

    this.hdr = rt(width, height, { depth: true });
    this.ldr = fxaa ? rt(width, height, { half: false }) : null;

    // bloom pyramid: down[0] is half resolution, each level halves again
    this.levels = [];
    let w = width, h = height;
    for (let i = 0; i < levels; i++) {
      w = Math.max(2, w >> 1); h = Math.max(2, h >> 1);
      this.levels.push({ w, h, down: rt(w, h), up: i < levels - 1 ? rt(w, h) : null });
    }

    this.downFirst = pass(DOWN(true), { tMap: { value: this.hdr.texture }, uTexel: { value: [1 / width, 1 / height] }, uThreshold: { value: 1 }, uKnee: { value: 0.5 }, uMax: { value: 64 } });
    this.downs = this.levels.slice(1).map((lv, i) => pass(DOWN(false), { tMap: { value: this.levels[i].down.texture }, uTexel: { value: [1 / this.levels[i].w, 1 / this.levels[i].h] } }));
    this.ups = [];
    for (let i = this.levels.length - 2; i >= 0; i--) {
      const low = i === this.levels.length - 2 ? this.levels[i + 1].down : this.levels[i + 1].up;
      this.ups[i] = pass(UP, { tLow: { value: low.texture }, tHigh: { value: this.levels[i].down.texture }, uTexel: { value: [1 / this.levels[i + 1].w, 1 / this.levels[i + 1].h] }, uScatter: { value: 0.7 } });
    }
    const bloomTex = this.levels.length > 1 ? this.levels[0].up.texture : this.levels[0].down.texture;
    this.composite = pass(COMPOSITE, {
      tScene: { value: this.hdr.texture }, tBloom: { value: bloomTex },
      uExposure: { value: 1 }, uBloom: { value: 0.6 }, uSat: { value: 1 }, uContrast: { value: 1 }, uCA: { value: 0 }, uGrain: { value: 0 }, uFrame: { value: 0 },
      uTone: { value: 1 }, uTint: { value: [1, 1, 1] }, uVignette: { value: [0.3, 1] }, uRes: { value: [width, height] },
    });
    this.fxaaPass = fxaa ? pass(FXAA, { tMap: { value: this.ldr.texture }, uResolution: { value: [width, height] } }) : null;
  }

  // Same arguments as renderer.render, plus `frame` (the frame index, for grain). target = null draws to the canvas.
  render({ scene, camera, frame = 0, target = null, update = true }) {
    const r = this.renderer, p = this.params;
    r.render({ scene, camera, target: this.hdr, update });

    this.downFirst.u.uThreshold.value = p.threshold; this.downFirst.u.uKnee.value = Math.max(p.knee, 1e-3); this.downFirst.u.uMax.value = p.maxIntensity;
    r.render({ scene: this.downFirst.mesh, target: this.levels[0].down, clear: false });
    this.downs.forEach((d, i) => r.render({ scene: d.mesh, target: this.levels[i + 1].down, clear: false }));
    for (let i = this.levels.length - 2; i >= 0; i--) {
      this.ups[i].u.uScatter.value = p.scatter;
      r.render({ scene: this.ups[i].mesh, target: this.levels[i].up, clear: false });
    }

    const u = this.composite.u;
    u.uExposure.value = p.exposure; u.uBloom.value = p.bloom; u.uSat.value = p.saturation; u.uContrast.value = p.contrast;
    u.uCA.value = p.aberration; u.uGrain.value = p.grain; u.uFrame.value = frame; u.uTone.value = TONES[p.tone] ?? 1;
    u.uTint.value = p.tint; u.uVignette.value = [p.vignette, Math.max(p.vignetteSoftness, 1e-3)];
    r.render({ scene: this.composite.mesh, target: this.fxaa ? this.ldr : target, clear: false });
    if (this.fxaa) r.render({ scene: this.fxaaPass.mesh, target, clear: false });
  }
}
