// Weather: wind-driven rain streaks that only exist where light finds them, spray that bursts off the
// rock, distress flares, and fractal lightning bolts.
import { THREE, lerp } from '../../src/core/engine.js';

const LIGHT_GLSL = /* glsl */`
  uniform vec3 uLamp, uBeamDir[2];
  uniform vec2 uBeamCos;
  uniform float uBeamI, uAmb, uFlash;
  uniform vec3 uFlarePos, uFlareCol;
  float beamLight(vec3 p){
    vec3 l = p - uLamp; float d = length(l); vec3 t = l / d;
    float c = smoothstep(uBeamCos.x, uBeamCos.y, dot(t, uBeamDir[0])) + smoothstep(uBeamCos.x, uBeamCos.y, dot(t, uBeamDir[1]));
    return c * uBeamI / (1.0 + d * d * 0.0012) * smoothstep(0.5, 2.0, d) + uBeamI * 0.08 / (1.0 + d * d * 0.05);
  }
  vec3 flareLight(vec3 p){ vec3 v = uFlarePos - p; return uFlareCol / (1.0 + dot(v, v) * 0.02); }
`;

export function lightUniforms() {
  return {
    uLamp: { value: new THREE.Vector3() },
    uBeamDir: { value: [new THREE.Vector3(1, 0, 0), new THREE.Vector3(-1, 0, 0)] },
    uBeamCos: { value: new THREE.Vector2(0.99, 0.997) },
    uBeamI: { value: 1 },
    uAmb: { value: 0.02 },
    uFlash: { value: 0 },
    uFlarePos: { value: new THREE.Vector3(0, -100, 0) },
    uFlareCol: { value: new THREE.Color(0, 0, 0) },
  };
}

/** Rain: instanced camera-facing streaks in a box that follows the camera. */
export function createRain(shared, { count = 42000, box = [150, 62, 150] } = {}) {
  const base = new THREE.PlaneGeometry(1, 1);
  const geo = new THREE.InstancedBufferGeometry();
  geo.index = base.index;
  geo.setAttribute('position', base.getAttribute('position'));
  const seed = new Float32Array(count * 4);
  for (let i = 0; i < count * 4; i++) seed[i] = Math.random();
  geo.setAttribute('seed', new THREE.InstancedBufferAttribute(seed, 4));
  geo.instanceCount = count;
  const uniforms = {
    ...shared,
    uTime: { value: 0 },
    uCam: { value: new THREE.Vector3() },
    uBox: { value: new THREE.Vector3(...box) },
    uVel: { value: new THREE.Vector3(11, -30, 4) },
    uAmount: { value: 1 },
    uLen: { value: 1.1 },
    uWidth: { value: 0.024 },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */`
      ${LIGHT_GLSL}
      attribute vec4 seed;
      uniform float uTime, uAmount, uLen, uWidth;
      uniform vec3 uCam, uBox, uVel;
      varying float vA; varying vec2 vC; varying vec3 vCol;
      void main(){
        vec3 vel = uVel * (0.82 + seed.w * 0.36);
        vec3 origin = vec3(uCam.x - uBox.x * 0.5, -1.5, uCam.z - uBox.z * 0.5);
        vec3 p = seed.xyz * uBox + vel * uTime;
        p = mod(p - origin, uBox) + origin;
        vec3 dir = normalize(vel);
        vec3 pos = p - dir * uLen * (0.6 + seed.w * 0.8) * (position.y + 0.5);
        vec3 toCam = normalize(uCam - pos);
        vec3 side = normalize(cross(dir, toCam));
        float camD = length(uCam - pos);
        pos += side * position.x * uWidth * (1.0 + camD * 0.012);
        float on = step(seed.w, uAmount) * smoothstep(0.6, 3.0, camD);
        float b = beamLight(p);
        vCol = vec3(1.0, 0.86, 0.6) * b * 3.2 + vec3(0.55, 0.65, 0.85) * (uAmb + uFlash * 1.6) + flareLight(p) * 0.5;
        vA = on * (0.45 + seed.y * 0.55);
        vC = position.xy + 0.5;
        gl_Position = projectionMatrix * viewMatrix * vec4(pos, 1.0);
      }`,
    fragmentShader: /* glsl */`
      varying float vA; varying vec2 vC; varying vec3 vCol;
      void main(){
        float a = (1.0 - abs(vC.x * 2.0 - 1.0)) * smoothstep(0.0, 0.6, vC.y) * smoothstep(1.0, 0.85, vC.y);
        gl_FragColor = vec4(vCol * a * vA, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = 5;
  return { mesh, uniforms };
}

/** Spray and spume: CPU particles, soft sprites, lit by the beam, lightning and flares. */
export function createSpray(shared, { count = 6000 } = {}) {
  const pos = new Float32Array(count * 3), vel = new Float32Array(count * 3), life = new Float32Array(count), max = new Float32Array(count), size = new Float32Array(count);
  const alpha = new Float32Array(count);
  life.fill(-1);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('aAlpha', new THREE.BufferAttribute(alpha, 1).setUsage(THREE.DynamicDrawUsage));
  const uniforms = { ...shared, uDpr: { value: 1 }, uH: { value: 900 } };
  const mat = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */`
      ${LIGHT_GLSL}
      attribute float aSize, aAlpha;
      uniform float uDpr, uH;
      varying float vA; varying vec3 vCol;
      void main(){
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = aSize * uH * projectionMatrix[1][1] * 0.5 / -mv.z;
        float b = beamLight(position);
        vCol = vec3(1.0, 0.9, 0.72) * b * 1.1 + vec3(0.6, 0.7, 0.85) * (uAmb * 2.2 + uFlash * 1.2) + flareLight(position) * 0.4;
        vA = aAlpha;
      }`,
    fragmentShader: /* glsl */`
      varying float vA; varying vec3 vCol;
      void main(){
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c);
        float a = smoothstep(0.5, 0.0, d);
        a *= a;
        gl_FragColor = vec4(vCol * a * vA, 1.0);
      }`,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  points.renderOrder = 4;
  let cursor = 0;
  const api = {
    points, uniforms,
    /** Emit a burst at world position p, thrown along (nx, nz) and upward. */
    burst(p, nx, nz, n = 90, power = 1) {
      for (let k = 0; k < n; k++) {
        const i = cursor; cursor = (cursor + 1) % count;
        pos[i * 3] = p.x + (Math.random() - 0.5) * 1.4;
        pos[i * 3 + 1] = p.y + Math.random() * 0.4;
        pos[i * 3 + 2] = p.z + (Math.random() - 0.5) * 1.4;
        const up = (2.5 + Math.random() * 6) * power;
        const out = (1 + Math.random() * 3) * power;
        vel[i * 3] = nx * out + (Math.random() - 0.5) * 1.8;
        vel[i * 3 + 1] = up;
        vel[i * 3 + 2] = nz * out + (Math.random() - 0.5) * 1.8;
        max[i] = life[i] = 0.8 + Math.random() * 1.2;
      }
    },
    update(dt, wind) {
      for (let i = 0; i < count; i++) {
        if (life[i] <= 0) { alpha[i] = 0; size[i] = 0; continue; }
        life[i] -= dt;
        const k = i * 3;
        vel[k + 1] -= 12 * dt;
        vel[k] += (wind.x * 5 - vel[k]) * dt * 0.6;
        vel[k + 2] += (wind.y * 5 - vel[k + 2]) * dt * 0.6;
        pos[k] += vel[k] * dt; pos[k + 1] += vel[k + 1] * dt; pos[k + 2] += vel[k + 2] * dt;
        const f = 1 - life[i] / max[i];
        const big = (i % 7) === 0;
        size[i] = big ? lerp(0.6, 3.2, Math.sqrt(f)) : lerp(0.07, 0.22, f);
        alpha[i] = (big ? 0.07 : 0.3) * (1 - f) * Math.min(1, f * 8) * (pos[k + 1] > -0.4 ? 1 : 0);
      }
      geo.attributes.position.needsUpdate = true;
      geo.attributes.aSize.needsUpdate = true;
      geo.attributes.aAlpha.needsUpdate = true;
    },
  };
  return api;
}

/** Lightning bolt: a fractal polyline drawn as a camera-facing ribbon. */
export function createBolt() {
  const MAXP = 900;
  const pa = new Float32Array(MAXP * 2 * 3), pb = new Float32Array(MAXP * 2 * 3), side = new Float32Array(MAXP * 2), wid = new Float32Array(MAXP * 2);
  const idx = [];
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pa, 3));
  geo.setAttribute('aNext', new THREE.BufferAttribute(pb, 3));
  geo.setAttribute('aSide', new THREE.BufferAttribute(side, 1));
  geo.setAttribute('aW', new THREE.BufferAttribute(wid, 1));
  const uniforms = { uI: { value: 0 } };
  const mat = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
    vertexShader: /* glsl */`
      attribute vec3 aNext; attribute float aSide, aW;
      varying float vS; varying float vW;
      void main(){
        vec4 a = modelViewMatrix * vec4(position, 1.0);
        vec4 b = modelViewMatrix * vec4(aNext, 1.0);
        vec2 d = normalize(b.xy - a.xy + 1e-5);
        a.xy += vec2(-d.y, d.x) * aSide * aW * (-a.z) * 0.0026 + vec2(-d.y, d.x) * aSide * 0.35;
        vS = aSide; vW = aW;
        gl_Position = projectionMatrix * a;
      }`,
    fragmentShader: /* glsl */`
      uniform float uI; varying float vS; varying float vW;
      void main(){
        float a = 1.0 - abs(vS);
        vec3 c = mix(vec3(0.55, 0.6, 1.0), vec3(1.0), a * a);
        gl_FragColor = vec4(c * a * uI * 14.0, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  mesh.visible = false;

  function build(start, end) {
    const segs = [];
    const rec = (a, b, disp, depth, w) => {
      if (depth === 0 || segs.length > MAXP - 4) { segs.push([a, b, w]); return; }
      const m = a.clone().lerp(b, 0.5 + (Math.random() - 0.5) * 0.1);
      const len = a.distanceTo(b);
      m.x += (Math.random() - 0.5) * disp * len; m.z += (Math.random() - 0.5) * disp * len; m.y += (Math.random() - 0.5) * disp * len * 0.3;
      rec(a, m, disp, depth - 1, w);
      rec(m, b, disp, depth - 1, w);
      if (depth > 3 && Math.random() < 0.28 && w > 0.4) {
        const dir = b.clone().sub(a).multiplyScalar(0.7);
        dir.x += (Math.random() - 0.5) * len * 0.9; dir.z += (Math.random() - 0.5) * len * 0.9;
        rec(m, m.clone().add(dir), disp * 1.1, depth - 2, w * 0.45);
      }
    };
    rec(start, end, 0.5, 8, 1);
    idx.length = 0;
    let v = 0;
    for (const [a, b, w] of segs) {
      for (let s = 0; s < 2; s++) {
        const i = v + s;
        pa.set([a.x, a.y, a.z], i * 3); pb.set([b.x, b.y, b.z], i * 3); side[i] = s ? 1 : -1; wid[i] = w * 0.9;
      }
      for (let s = 0; s < 2; s++) {
        const i = v + 2 + s;
        pa.set([b.x, b.y, b.z], i * 3); pb.set([b.x + (b.x - a.x), b.y + (b.y - a.y), b.z + (b.z - a.z)], i * 3); side[i] = s ? 1 : -1; wid[i] = w * 0.9;
      }
      idx.push(v, v + 2, v + 1, v + 1, v + 2, v + 3);
      v += 4;
      if (v >= MAXP * 2 - 4) break;
    }
    geo.setIndex(idx);
    for (const k of ['position', 'aNext', 'aSide', 'aW']) geo.attributes[k].needsUpdate = true;
  }
  return { mesh, uniforms, build };
}

/** A flare: a hot sprite with a smoke trail, rising and hanging on the wind. */
export function createFlare(color) {
  const mat = new THREE.SpriteMaterial({ color: new THREE.Color(color).multiplyScalar(0), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, '#fff'); grd.addColorStop(0.15, 'rgba(255,255,255,.9)'); grd.addColorStop(0.4, 'rgba(255,255,255,.18)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
  mat.map = new THREE.CanvasTexture(c);
  const sprite = new THREE.Sprite(mat);
  sprite.scale.setScalar(1.6);
  sprite.visible = false;
  const col = new THREE.Color(color);
  const state = { t: -1, p: new THREE.Vector3(), v: new THREE.Vector3(), power: 0 };
  return {
    sprite, color: col, state,
    fire(from, wind) {
      state.t = 0; state.p.copy(from); state.v.set(wind.x * 1.5 + (Math.random() - 0.5), 11 + Math.random() * 2, wind.y * 1.5 + (Math.random() - 0.5));
      sprite.visible = true;
    },
    update(dt, wind) {
      if (state.t < 0) { state.power = 0; sprite.visible = false; return; }
      state.t += dt;
      const t = state.t;
      if (t < 1.7) state.v.y -= 6 * dt; else state.v.y = lerp(state.v.y, -0.9, dt * 2); // parachute
      state.v.x = lerp(state.v.x, wind.x * 3, dt * 0.5); state.v.z = lerp(state.v.z, wind.y * 3, dt * 0.5);
      state.p.addScaledVector(state.v, dt);
      const flick = 0.85 + Math.sin(t * 37) * 0.08 + Math.sin(t * 91) * 0.07;
      state.power = Math.min(1, t * 6) * (1 - Math.min(1, Math.max(0, (t - 7) / 1.5))) * flick;
      sprite.position.copy(state.p);
      mat.color.copy(col).multiplyScalar(state.power * 16);
      sprite.scale.setScalar(0.55 + state.power * 0.35);
      if (t > 8.5 || state.p.y < -0.5) { state.t = -1; sprite.visible = false; state.power = 0; }
    },
  };
}
