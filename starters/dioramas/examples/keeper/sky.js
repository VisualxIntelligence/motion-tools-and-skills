// Sky dome: storm gradient → dawn, two racing cloud layers projected onto planes (perspective-correct),
// a moon smothered by cloud, lightning that lights the cloud interiors, and a low sun at dawn.
import { THREE } from '../../src/core/engine.js';

export function createSky() {
  const uniforms = {
    uTime: { value: 0 },
    uZen: { value: new THREE.Color() },
    uHor: { value: new THREE.Color() },
    uCloudDark: { value: new THREE.Color() },
    uCloudLit: { value: new THREE.Color() },
    uCover: { value: 0.95 },
    uStorm: { value: 1 },
    uDawn: { value: 0 },
    uSunDir: { value: new THREE.Vector3(0, 0.05, -1).normalize() },
    uSunCol: { value: new THREE.Color(0, 0, 0) },
    uMoonDir: { value: new THREE.Vector3(-0.4, 0.35, -0.8).normalize() },
    uMoonCol: { value: new THREE.Color(0.16, 0.2, 0.28) },
    uFlash: { value: 0 },
    uFlashDir: { value: new THREE.Vector3(0, 0.3, -1).normalize() },
    uFlashCol: { value: new THREE.Color(0.75, 0.82, 1.0) },
    uWind: { value: new THREE.Vector2(0.94, 0.34) },
    uBeamDir: { value: [new THREE.Vector3(1, 0, 0), new THREE.Vector3(-1, 0, 0)] },
    uBeamGlow: { value: new THREE.Color(0, 0, 0) },
    uLampDir: { value: new THREE.Vector3(0, 0, 1) },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: /* glsl */`
      varying vec3 vDir;
      void main(){
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vDir = wp.xyz - cameraPosition;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: /* glsl */`
      uniform float uTime, uCover, uStorm, uDawn, uFlash;
      uniform vec3 uZen, uHor, uCloudDark, uCloudLit, uSunDir, uSunCol, uMoonDir, uMoonCol, uFlashDir, uFlashCol, uBeamGlow, uLampDir;
      uniform vec3 uBeamDir[2];
      uniform vec2 uWind;
      varying vec3 vDir;
      float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float noise(vec2 p){
        vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
      }
      float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 6; i++) { s += a * noise(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; } return s; }
      float fbm3(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { s += a * noise(p); p = p * 2.07 + vec2(5.1, 1.3); a *= 0.5; } return s; }
      void main(){
        vec3 d = normalize(vDir);
        float y = d.y;
        float yy = max(y, 0.0);
        vec3 col = mix(uHor, uZen, pow(smoothstep(-0.02, mix(0.62, 0.4, uDawn), yy), mix(0.62, 0.8, uDawn)));
        // sun & its wide dawn glow
        float sd = max(dot(d, uSunDir), 0.0);
        col += uSunCol * (pow(sd, 4.0) * 0.08 + pow(sd, 40.0) * 0.45 + smoothstep(0.99985, 0.99992, sd) * 9.0 * smoothstep(-0.004, 0.004, y));
        // moon behind the storm
        float md = max(dot(d, uMoonDir), 0.0);
        col += uMoonCol * (pow(md, 40.0) * 2.0 + pow(md, 6.0) * 0.35) * (1.0 - uDawn);

        float dens = 0.0;
        if (y > -0.05) {
          float yc = max(y, 0.0) + 0.05;
          vec2 wind = uWind * uTime;
          // high overcast, lit from above by a moon we never see
          vec2 uv = d.xz / yc * 0.5;
          float warp = fbm3(uv * 0.55 + wind * 0.006);
          float hi = fbm(uv * 0.8 + vec2(warp * 1.6, warp) + wind * 0.022);
          float cov = uCover;
          float deck = smoothstep(1.0 - cov - 0.05, 1.0 - cov + 0.4, hi);
          float bright = smoothstep(0.38, 0.78, hi);
          vec3 hiCol = mix(uCloudDark, uCloudLit, bright);
          hiCol += uMoonCol * pow(md, 8.0) * bright * 1.8 * (1.0 - uDawn);
          hiCol += uSunCol * (pow(sd, 5.0) * 0.7 + 0.06) * mix(1.0, bright, 0.6) * uDawn;
          float hz = smoothstep(-0.03, 0.14, y);
          col = mix(col, hiCol, deck * mix(0.7, 1.0, hz));
          // low racing scud: ragged, dark, fast
          vec2 uv2 = d.xz / yc * 1.35;
          float lo = fbm3(uv2 * 1.05 + wind * 0.2 + warp * 1.3);
          float loM = smoothstep(0.5, 0.72, lo) * (0.2 + 0.8 * uStorm);
          vec3 loCol = mix(uCloudDark * 0.55, uCloudDark * 1.4 + uSunCol * 0.05 * uDawn, smoothstep(0.72, 0.9, lo));
          col = mix(col, loCol, loM * 0.92 * hz);
          dens = max(deck, loM);
        }
        // lightning floods the cloud interiors around the strike
        float fl = pow(max(dot(d, uFlashDir), 0.0), 5.0);
        col += uFlashCol * (uFlash * (0.02 + pow(max(dot(d, uFlashDir), 0.0), 40.0) * 2.6) + uFlash * uFlash * (0.05 + fl * 2.2)) * (0.3 + dens);
        // the beams light the rain haze low over the sea when they swing past this direction
        vec2 dh = normalize(d.xz + 1e-5);
        float bg = 0.0;
        for (int i = 0; i < 2; i++) { vec2 bd = normalize(uBeamDir[i].xz + 1e-5); bg += pow(max(dot(dh, bd), 0.0), 60.0); }
        col += uBeamGlow * bg * exp(-yy * 9.0);
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1500, 64, 32), mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = -10;
  return { mesh, uniforms };
}
