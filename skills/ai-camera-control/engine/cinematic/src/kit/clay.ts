// The look: a Blender clay render. Matte greys for everything that is set, one muted tint per character or hero prop,
// soft studio light (a broad key, a hemisphere, a cool fill), a grey world. Ambient occlusion comes from the post pass.
import * as THREE from "three";

/** the set: near-neutral greys, light to dark */
export const GREY = { paper: "#d6d5d0", light: "#c4c3be", set: "#b0afaa", ground: "#a19f9a", mid: "#8c8b86", dark: "#6c6b67", ink: "#474644" };
/** one muted tint per subject, so they read apart in a grey world */
export const TINT = { ochre: "#c2ad95", slate: "#98a4b4", sage: "#a3ae9f", rose: "#bba3a1", plum: "#a8a1b6", sand: "#c4baa6", stone: "#aaa79f" };
export type Tint = keyof typeof TINT;

const cache = new Map<string, THREE.MeshStandardMaterial>();
/** a matte clay material (cached per colour and roughness) */
export function clay(color: string, rough = 0.92, opts: { side?: THREE.Side; emissive?: string; ei?: number } = {}) {
  const key = `${color}|${rough}|${opts.side ?? 0}|${opts.emissive ?? ""}|${opts.ei ?? 0}`;
  let m = cache.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, side: opts.side ?? THREE.FrontSide, emissive: opts.emissive ?? "#000000", emissiveIntensity: opts.ei ?? 0 });
    if (opts.side === THREE.DoubleSide) m.shadowSide = THREE.DoubleSide;
    cache.set(key, m);
  }
  return m;
}
const shade = (hex: string, k: number) => "#" + new THREE.Color(hex).multiplyScalar(k).getHexString();
/** the three materials a figure needs, from its tint */
export const figureMats = (tint: Tint) => ({ body: clay(TINT[tint], 0.9), accent: clay(shade(TINT[tint], 0.78), 0.9), dark: clay(GREY.dark, 0.9) });

/** cast and receive shadows on everything under o */
export function shadeAll(o: THREE.Object3D, cast = true, receive = true) {
  o.traverse((c) => { if ((c as THREE.Mesh).isMesh) { c.castShadow = cast; c.receiveShadow = receive; } });
  return o;
}

export type Sky = "studio" | "day" | "dusk" | "space" | "interior" | "nightTeal" | "nightAmber" | "nightBlue" | "nightRed" | "dimWarm" | "dimGreen" | "dimCool" | "overcastCool" | "paleBlue" | "orangeDust" | "sepia" | "mono" | "pink" | "mint" | "cyanFluor";
const SKIES: Record<Sky, { top: string; horizon: string; fog: string; density: number; hemi: [string, string, number]; key: [string, number]; fill: number }> = {
  studio: { top: "#c3c3c0", horizon: "#d8d8d4", fog: "#d0d0cc", density: 0.0035, hemi: ["#ffffff", "#7d7c78", 1.05], key: ["#fff8ec", 3.6], fill: 0.45 },
  day: { top: "#b9c0c6", horizon: "#d9dbd9", fog: "#d0d3d3", density: 0.0035, hemi: ["#f4f7fa", "#7a7874", 1.1], key: ["#fff7ea", 3.8], fill: 0.4 },
  dusk: { top: "#8f9298", horizon: "#c9c5bd", fog: "#b8b5af", density: 0.005, hemi: ["#e2e2e6", "#77746e", 1.2], key: ["#ffeedd", 2.4], fill: 0.4 },
  space: { top: "#26272a", horizon: "#3b3c40", fog: "#2e2f33", density: 0.0, hemi: ["#d9dbe0", "#2d2d30", 0.55], key: ["#fffaf2", 3.2], fill: 0.25 },
  interior: { top: "#bdbcb8", horizon: "#cfceca", fog: "#c8c7c3", density: 0.0, hemi: ["#ffffff", "#8a8985", 1.1], key: ["#fff6ea", 2.2], fill: 0.7 },
  // low-key moods: little ambient, a tinted key, coloured fog; the lamps and windows in the set do the lighting
  nightTeal: { top: "#06141a", horizon: "#0a1f26", fog: "#0a1d22", density: 0.012, hemi: ["#4b8f9c", "#0a1417", 0.34], key: ["#7fc0d0", 0.45], fill: 0.08 },
  nightAmber: { top: "#120c06", horizon: "#1c1309", fog: "#1a1208", density: 0.012, hemi: ["#a8803f", "#140e08", 0.36], key: ["#ffb050", 0.55], fill: 0.08 },
  nightBlue: { top: "#050a1c", horizon: "#0b1636", fog: "#08122c", density: 0.01, hemi: ["#3e62b8", "#060a16", 0.42], key: ["#6f92ff", 0.5], fill: 0.1 },
  nightRed: { top: "#110506", horizon: "#1c0a0c", fog: "#180809", density: 0.012, hemi: ["#8f3434", "#0e0606", 0.32], key: ["#ff5a50", 0.4], fill: 0.06 },
  dimWarm: { top: "#15100a", horizon: "#1f180e", fog: "#1c160c", density: 0.006, hemi: ["#b89460", "#120e08", 0.4], key: ["#ffc880", 0.5], fill: 0.1 },
  dimGreen: { top: "#08110a", horizon: "#0f1a11", fog: "#0d170f", density: 0.006, hemi: ["#86a874", "#0a100a", 0.36], key: ["#c8e0a0", 0.4], fill: 0.08 },
  dimCool: { top: "#0c1118", horizon: "#151c26", fog: "#121923", density: 0.006, hemi: ["#9eb6d0", "#0a0e14", 0.42], key: ["#dce8ff", 0.8], fill: 0.1 },
  overcastCool: { top: "#8a9096", horizon: "#aab0b4", fog: "#a0a6aa", density: 0.004, hemi: ["#d8dde2", "#6a6c6e", 1.0], key: ["#e8eef4", 1.4], fill: 0.4 },
  paleBlue: { top: "#7f93a8", horizon: "#a8b8c8", fog: "#9fb0c0", density: 0.003, hemi: ["#d0e0f0", "#60707e", 1.0], key: ["#e8f2ff", 1.2], fill: 0.4 },
  orangeDust: { top: "#6a3a1a", horizon: "#b8642a", fog: "#a85a28", density: 0.012, hemi: ["#ffb070", "#5a2a10", 1.0], key: ["#ff9a50", 3.0], fill: 0.3 },
  sepia: { top: "#8a8278", horizon: "#b2a898", fog: "#a89e90", density: 0.006, hemi: ["#d8cfc0", "#6a645a", 1.0], key: ["#fff0d8", 1.8], fill: 0.35 },
  mono: { top: "#7a7c7e", horizon: "#a0a2a4", fog: "#969899", density: 0.006, hemi: ["#e0e2e4", "#5c5e60", 0.9], key: ["#ffffff", 1.6], fill: 0.3 },
  pink: { top: "#c8a8a6", horizon: "#dcc0be", fog: "#d2b4b2", density: 0.002, hemi: ["#ffe4e0", "#8a6a66", 0.8], key: ["#ffd8d0", 1.2], fill: 0.4 },
  mint: { top: "#26362f", horizon: "#34463e", fog: "#2e3f38", density: 0.006, hemi: ["#d0f0e0", "#243028", 0.7], key: ["#e8fff4", 0.8], fill: 0.12 },
  cyanFluor: { top: "#08181f", horizon: "#0e2630", fog: "#0c2029", density: 0.008, hemi: ["#8adcf0", "#0a1418", 0.5], key: ["#aef0ff", 0.6], fill: 0.1 },
};

/** the studio: sky dome, fog, hemisphere, a soft shadow-casting key and a fill. `fit()` frames the key's shadow on a shot */
export function studio(scene: THREE.Scene, sky: Sky = "studio", keyDir = new THREE.Vector3(-0.55, 0.78, 0.32)) {
  const s = SKIES[sky];
  scene.background = new THREE.Color(s.horizon);
  if (s.density > 0) scene.fog = new THREE.FogExp2(new THREE.Color(s.fog).getHex(), s.density);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(3000, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color(s.top) }, horizon: { value: new THREE.Color(s.horizon) }, stars: { value: sky === "space" ? 1 : 0 } },
    vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: `uniform vec3 top, horizon; uniform float stars; varying vec3 vP;
      float h(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
      void main(){ float k = clamp(vP.y * 0.5 + 0.5, 0.0, 1.0); vec3 c = mix(horizon, top, pow(smoothstep(0.45, 1.0, k), 0.8));
        if (stars > 0.5) { vec3 q = floor(vP * 420.0); float s = step(0.9975, h(q)); c += vec3(0.85) * s * (0.4 + 0.6 * h(q + 1.0)); }
        gl_FragColor = vec4(c, 1.0); }`,
  }));
  dome.frustumCulled = false; dome.userData.noPathTrace = true; scene.add(dome);
  // the path tracer cannot run the dome shader: it lights the scene from this gradient instead
  scene.userData.sky = { top: s.top, horizon: s.horizon, ground: s.hemi[1] };
  const hemi = new THREE.HemisphereLight(s.hemi[0], s.hemi[1], s.hemi[2]);
  const key = new THREE.DirectionalLight(s.key[0], s.key[1]);
  key.castShadow = true;
  key.shadow.mapSize.set(4096, 4096);
  key.shadow.bias = -0.0002; key.shadow.normalBias = 0.04; key.shadow.radius = 4;
  const fill = new THREE.DirectionalLight("#e9eef5", s.fill);
  scene.add(hemi, key, key.target, fill, fill.target);
  const dir = keyDir.clone().normalize();
  return {
    key, hemi, fill, dir,
    /** square the key's shadow camera on a centre and size (snapped to texels so it never shimmers) */
    fit(center: THREE.Vector3, size: number) {
      const cam = key.shadow.camera as THREE.OrthographicCamera;
      cam.left = -size; cam.right = size; cam.top = size; cam.bottom = -size; cam.near = 1; cam.far = size * 4 + 600; cam.updateProjectionMatrix();
      key.shadow.normalBias = size < 4 ? Math.max(0.003, size * 0.01) : 0.04;   // a small subject (a product) needs a smaller offset, or its shadow comes out hollow
      const texel = (size * 2) / 4096;
      const c = center.clone(); c.x = Math.round(c.x / texel) * texel; c.z = Math.round(c.z / texel) * texel;
      key.target.position.copy(c); key.position.copy(c).add(dir.clone().multiplyScalar(size * 2 + 200));
      fill.target.position.copy(c); fill.position.copy(c).add(new THREE.Vector3(-dir.x, 0.35, -dir.z).normalize().multiplyScalar(100));
      key.target.updateMatrixWorld(); fill.target.updateMatrixWorld();
    },
  };
}
