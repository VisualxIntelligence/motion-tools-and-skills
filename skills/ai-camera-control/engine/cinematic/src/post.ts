// The lens and the lab: scene -> ambient occlusion (the clay look) -> physical depth of field (thin lens, from focal length, stop and focus distance)
// -> bloom -> camera motion blur, filmic tone map, vignette, grain. One pass chain shared by every piece.
import * as THREE from "three";
import { COC, SENSOR_W } from "./camera";

const VERT = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }";

export function makePost(w: number, h: number) {
  const hdr = { type: THREE.HalfFloatType } as const;
  const scene = new THREE.WebGLRenderTarget(w, h, { ...hdr, samples: 4 });
  // depth comes from a second, single-sample pass target (MSAA targets do not resolve depth for sampling)
  const depthRT = new THREE.WebGLRenderTarget(w, h, { ...hdr, depthTexture: new THREE.DepthTexture(w, h, THREE.UnsignedIntType) });
  const dofRT = new THREE.WebGLRenderTarget(w, h, hdr);
  const aoRT = new THREE.WebGLRenderTarget(w, h, hdr);
  // sub-frame motion blur: several renders across the shutter, averaged in HDR before the lens and the lab
  const accA = new THREE.WebGLRenderTarget(w, h, hdr), accB = new THREE.WebGLRenderTarget(w, h, hdr);
  let acc = accA, accOther = accB;
  const bw = Math.round(w / 4), bh = Math.round(h / 4);
  const bA = new THREE.WebGLRenderTarget(bw, bh, hdr), bB = new THREE.WebGLRenderTarget(bw, bh, hdr);

  const dof = new THREE.ShaderMaterial({
    depthTest: false, depthWrite: false,
    uniforms: { tColor: { value: scene.texture }, tDepth: { value: depthRT.depthTexture }, uRes: { value: new THREE.Vector2(w, h) }, near: { value: 0.1 }, far: { value: 1000 }, focal: { value: 35 }, stop: { value: 8 }, focus: { value: 10 }, pxPerMm: { value: w / SENSOR_W }, maxR: { value: 26 } },
    vertexShader: VERT,
    fragmentShader: `uniform sampler2D tColor, tDepth; uniform vec2 uRes; uniform float near, far, focal, stop, focus, pxPerMm, maxR; varying vec2 vUv;
      float lin(float d){ return (near * far) / (far - d * (far - near)); }
      float coc(vec2 uv){ float z = lin(texture2D(tDepth, uv).x) * 1000.0; float S = focus * 1000.0;
        float c = (focal * focal) / (stop * max(1.0, S - focal)) * abs(z - S) / z;   // mm on the sensor
        return min(maxR, c * pxPerMm * 0.5); }                                        // radius in px
      void main(){
        float r = coc(vUv);
        vec3 col = texture2D(tColor, vUv).rgb;
        if (r < 0.6) { gl_FragColor = vec4(col, 1.0); return; }
        vec3 acc = col; float wsum = 1.0;
        const float GA = 2.39996323;
        for (int i = 1; i < 48; i++) {
          float fi = float(i);
          float rr = sqrt(fi / 48.0) * r;
          vec2 o = vec2(cos(fi * GA), sin(fi * GA)) * rr / uRes;
          vec2 uv = vUv + o;
          float rs = coc(uv);
          // a sharp sample in front of a blurred one must not bleed into it: weight by its own blur reach
          float w = clamp((rs - rr) * 0.8 + 1.0, 0.0, 1.0);
          vec3 c = texture2D(tColor, uv).rgb;
          w *= 1.0 + 1.5 * smoothstep(1.2, 4.0, dot(c, vec3(0.33)));   // bright points become bokeh discs
          acc += c * w; wsum += w;
        }
        gl_FragColor = vec4(acc / wsum, 1.0);
      }`,
  });
  // ambient occlusion from depth: creases, contacts and corners darken the way a clay render does. Samples a disk of
  // fixed world size (projected to pixels), rotated per pixel so the pattern breaks into grain instead of banding
  const ao = new THREE.ShaderMaterial({
    depthTest: false, depthWrite: false,
    uniforms: { tColor: { value: scene.texture }, tDepth: { value: depthRT.depthTexture }, uRes: { value: new THREE.Vector2(w, h) }, near: { value: 0.1 }, far: { value: 1000 }, pxFocal: { value: h }, radius: { value: 0.6 }, strength: { value: 0.8 } },
    vertexShader: VERT,
    fragmentShader: `uniform sampler2D tColor, tDepth; uniform vec2 uRes; uniform float near, far, pxFocal, radius, strength; varying vec2 vUv;
      float lin(float d){ return (near * far) / (far - d * (far - near)); }
      float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      void main(){
        vec3 col = texture2D(tColor, vUv).rgb;
        float z = lin(texture2D(tDepth, vUv).x);
        if (z > far * 0.5) { gl_FragColor = vec4(col, 1.0); return; }
        float r = clamp(radius * pxFocal / z, 3.0, 90.0);
        float rot = hash(gl_FragCoord.xy) * 6.2831853, occ = 0.0;
        const int N = 20;
        for (int i = 0; i < N; i++) {
          float fi = float(i) + 0.5, a = fi * 2.39996323 + rot;
          vec2 o = vec2(cos(a), sin(a)) * sqrt(fi / float(N)) * r / uRes;
          float dz = z - lin(texture2D(tDepth, vUv + o).x);          // > 0: the sample sits in front of this pixel
          float w = clamp(1.0 - dz / (radius * 2.5), 0.0, 1.0);      // only nearby geometry occludes
          occ += step(0.02 + z * 0.002, dz) * w;
        }
        float k = 1.0 - strength * occ / float(N);
        gl_FragColor = vec4(col * k, 1.0);
      }`,
  });
  const accum = new THREE.ShaderMaterial({
    depthTest: false, depthWrite: false,
    uniforms: { tAcc: { value: null as THREE.Texture | null }, tNew: { value: scene.texture }, k: { value: 0 } },
    vertexShader: VERT,
    fragmentShader: `uniform sampler2D tAcc, tNew; uniform float k; varying vec2 vUv;
      void main(){ vec3 a = texture2D(tAcc, vUv).rgb; vec3 b = texture2D(tNew, vUv).rgb; gl_FragColor = vec4(k < 0.5 ? b : mix(a, b, 1.0 / (k + 1.0)), 1.0); }`,   // a running mean
  });
  const bright = new THREE.ShaderMaterial({
    depthTest: false, depthWrite: false,
    uniforms: { tSrc: { value: dofRT.texture }, uTexel: { value: new THREE.Vector2(1 / w, 1 / h) }, threshold: { value: 1.3 } },
    vertexShader: VERT,
    fragmentShader: `uniform sampler2D tSrc; uniform vec2 uTexel; uniform float threshold; varying vec2 vUv;
      void main(){ vec3 c = vec3(0.0);
        for (int x = -1; x <= 1; x++) for (int y = -1; y <= 1; y++) c += texture2D(tSrc, vUv + vec2(float(x), float(y)) * uTexel * 2.0).rgb;
        c /= 9.0; float l = max(c.r, max(c.g, c.b));
        gl_FragColor = vec4(c * smoothstep(threshold, threshold * 2.0, l), 1.0); }`,
  });
  const blur = new THREE.ShaderMaterial({
    depthTest: false, depthWrite: false,
    uniforms: { tSrc: { value: bA.texture }, uDir: { value: new THREE.Vector2(1 / bw, 0) } },
    vertexShader: VERT,
    fragmentShader: `uniform sampler2D tSrc; uniform vec2 uDir; varying vec2 vUv;
      void main(){ vec3 c = vec3(0.0); float ws = 0.0;
        for (int i = -8; i <= 8; i++) { float fi = float(i); float w = exp(-fi * fi / 18.0); c += texture2D(tSrc, vUv + uDir * fi * 1.6).rgb * w; ws += w; }
        gl_FragColor = vec4(c / ws, 1.0); }`,
  });
  const comp = new THREE.ShaderMaterial({
    depthTest: false, depthWrite: false,
    uniforms: { tScene: { value: dofRT.texture }, tBloom: { value: bA.texture }, bloom: { value: 0 }, uVel: { value: new THREE.Vector2() }, uRes: { value: new THREE.Vector2(w, h) }, uSeed: { value: 0 }, exposure: { value: 1 }, warm: { value: 0 }, uFish: { value: 0 }, uTanX: { value: 1 } },
    vertexShader: VERT,
    fragmentShader: `
      uniform sampler2D tScene, tBloom; uniform vec2 uVel, uRes; uniform float bloom, uSeed, exposure, warm, uFish, uTanX; varying vec2 vUv;
      // a fisheye: the frame is rendered as a very wide rectilinear image, then remapped so angle from the axis grows evenly with
      // distance from the centre (equidistant projection). Straight lines near the edge bend, the centre stays natural.
      vec2 fuv(vec2 uv){
        if (uFish < 0.001) return uv;
        float asp = uRes.x / uRes.y;
        vec2 p = (uv - 0.5) * 2.0; p.y /= asp;
        float r = length(p);
        float thm = atan(uTanX);
        float th = min(r * thm, 1.5);
        float rp = tan(th) / uTanX;
        float s = r > 1e-4 ? rp / r : 1.0;
        vec2 q = p * s; q.y *= asp;
        return mix(uv, q * 0.5 + 0.5, uFish);
      }
      vec3 aces(vec3 x){ return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14), 0.0, 1.0); }
      vec3 toSRGB(vec3 c){ return mix(c * 12.92, 1.055 * pow(c, vec3(1.0/2.4)) - 0.055, step(0.0031308, c)); }
      float hash(vec2 p){ p = fract(p * vec2(443.897, 441.423)); p += dot(p, p.yx + 19.19); return fract((p.x + p.y) * p.x); }
      void main(){
        vec2 v = uVel / uRes;
        vec3 c = vec3(0.0);
        float n = length(uVel) > 1.0 ? 16.0 : 1.0;
        for (float i = 0.0; i < 16.0; i++) {
          if (i >= n) break;
          float k = n > 1.0 ? (i / (n - 1.0) - 0.5) : 0.0;
          c += texture2D(tScene, fuv(vUv) + v * k).rgb;
        }
        c /= n;
        c += texture2D(tBloom, fuv(vUv)).rgb * bloom;
        c *= exposure;
        c = aces(c * 0.9);
        c = mix(c, c * vec3(1.03, 1.0, 0.96), smoothstep(0.4, 1.0, c));
        c = mix(c, c * vec3(1.06, 1.0, 0.9) + vec3(0.012, 0.004, 0.02), warm);
        c += vec3(0.008, 0.01, 0.014) * (1.0 - c);
        vec2 q = vUv - 0.5; q.x *= uRes.x / uRes.y;
        c *= 1.0 - 0.28 * smoothstep(0.35, 1.05, length(q));
        c = toSRGB(c);
        c += (hash(vUv * uRes + uSeed) - 0.5) * 0.022;
        gl_FragColor = vec4(c, 1.0);
      }`,
  });
  const quadScene = new THREE.Scene();
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), comp); quad.frustumCulled = false; quadScene.add(quad);
  const ortho = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const pass = (gl: THREE.WebGLRenderer, m: THREE.ShaderMaterial, target: THREE.WebGLRenderTarget | null) => { quad.material = m; gl.setRenderTarget(target); gl.render(quadScene, ortho); };

  /** add one sub-frame (k of n, 0-based) to the shutter's running mean */
  function accumulate(gl: THREE.WebGLRenderer, world: THREE.Scene, cam: THREE.PerspectiveCamera, k: number) {
    gl.setRenderTarget(scene); gl.render(world, cam);
    accum.uniforms.tAcc.value = acc.texture; accum.uniforms.tNew.value = scene.texture; accum.uniforms.k.value = k;
    pass(gl, accum, accOther); [acc, accOther] = [accOther, acc];
  }
  /** render a frame: lens = focal (mm), stop (T), focus (m). With `accumulated`, the colour is the shutter's mean of the
   *  sub-frames already added (the world and camera passed in are the shutter's centre, for depth) */
  function render(gl: THREE.WebGLRenderer, world: THREE.Scene, cam: THREE.PerspectiveCamera, o: { focal: number; stop: number; focus: number; vel: THREE.Vector2; seed: number; bloom: number; fish?: number; exposure?: number; warm?: number; dof: boolean; ao?: number; accumulated?: boolean }) {
    if (!o.accumulated) { gl.setRenderTarget(scene); gl.render(world, cam); }
    let src = o.accumulated ? acc.texture : scene.texture;
    if (o.dof || o.ao) { gl.setRenderTarget(depthRT); gl.render(world, cam); }
    if (o.ao) {
      ao.uniforms.tColor.value = src; ao.uniforms.near.value = cam.near; ao.uniforms.far.value = cam.far;
      ao.uniforms.pxFocal.value = h / 2 / Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2); ao.uniforms.strength.value = o.ao;
      pass(gl, ao, aoRT); src = aoRT.texture;
    }
    if (o.dof) {
      dof.uniforms.tColor.value = src;
      Object.assign(dof.uniforms.near, { value: cam.near }); dof.uniforms.far.value = cam.far;
      dof.uniforms.focal.value = o.focal; dof.uniforms.stop.value = o.stop; dof.uniforms.focus.value = o.focus;
      pass(gl, dof, dofRT);
      comp.uniforms.tScene.value = dofRT.texture; bright.uniforms.tSrc.value = dofRT.texture;
    } else {
      comp.uniforms.tScene.value = src; bright.uniforms.tSrc.value = src;
    }
    if (o.bloom > 0) {
      pass(gl, bright, bA);
      for (let i = 0; i < 2; i++) {
        blur.uniforms.tSrc.value = bA.texture; blur.uniforms.uDir.value.set(1 / bw, 0); pass(gl, blur, bB);
        blur.uniforms.tSrc.value = bB.texture; blur.uniforms.uDir.value.set(0, 1 / bh); pass(gl, blur, bA);
      }
    }
    comp.uniforms.bloom.value = o.bloom;
    comp.uniforms.uVel.value.copy(o.vel);
    comp.uniforms.uSeed.value = o.seed;
    comp.uniforms.exposure.value = o.exposure ?? 1;
    comp.uniforms.warm.value = o.warm ?? 0;
    comp.uniforms.uFish.value = o.fish ?? 0;
    comp.uniforms.uTanX.value = Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2) * cam.aspect;
    pass(gl, comp, null);
  }
  return { render, accumulate };
}
void COC;
