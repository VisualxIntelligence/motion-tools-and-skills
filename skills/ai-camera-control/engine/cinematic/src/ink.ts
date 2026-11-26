// The storyboard look: the scene drawn as ink on paper, for an AI video model to read camera and blocking from without
// a look to copy. Lines come from the geometry, not the picture: jumps in depth and in surface direction (a normal
// pass) draw the set in thin grey, and the subjects (actors, props that act) get a bold black outline from a mask
// pass of their silhouettes, with their insides left as clean paper. No surfaces, shading, specks, blur or grain.
// `figures` mode draws only the subjects, in pencil, over the normal render: the set keeps its real look and light.
// `ghost` mode replaces each subject with a soft limbless blur: where it is, how big, which way it goes, but no limb
// animation for a video model to copy.
import * as THREE from "three";

const VERT = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }";

export function makeInk(w: number, h: number) {
  const normalRT = new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, depthTexture: new THREE.DepthTexture(w, h, THREE.UnsignedIntType) });
  const maskRT = new THREE.WebGLRenderTarget(w, h);
  const normalMat = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide });
  const white = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
  const black = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
  const subjMats: THREE.Material[] = [];
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    depthTest: false, depthWrite: false,
    transparent: true,
    uniforms: { figOnly: { value: 0 }, tN: { value: normalRT.texture }, tD: { value: normalRT.depthTexture }, tM: { value: maskRT.texture }, uRes: { value: new THREE.Vector2(w, h) }, near: { value: 0.1 }, far: { value: 1000 }, thick: { value: Math.max(1, h / 540) } },
    vertexShader: VERT,
    fragmentShader: `
      uniform sampler2D tN, tD, tM; uniform vec2 uRes; uniform float near, far, thick, figOnly; varying vec2 vUv;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      float lin(vec2 uv){ float z = texture2D(tD, uv).x * 2.0 - 1.0; return 2.0 * near * far / (far + near - z * (far - near)); }
      void main(){
        vec2 px = thick / uRes;
        float d = lin(vUv); vec3 n = texture2D(tN, vUv).xyz * 2.0 - 1.0;
        // the set: a line where depth jumps (relative to distance) or the surface turns
        float de = 0.0, ne = 0.0;
        for (int i = 0; i < 4; i++) {
          vec2 o = (i == 0) ? vec2(px.x, 0.0) : (i == 1) ? vec2(-px.x, 0.0) : (i == 2) ? vec2(0.0, px.y) : vec2(0.0, -px.y);
          de = max(de, abs(lin(vUv + o) - d) / d);
          vec3 m = texture2D(tN, vUv + o).xyz * 2.0 - 1.0; ne = max(ne, 1.0 - dot(n, m));
        }
        float setLine = max(smoothstep(0.02, 0.06, de), smoothstep(0.18, 0.45, ne));
        float sky = step(0.9999, texture2D(tD, vUv).x);
        setLine *= 1.0 - sky;
        // the subjects: a bold outline where the silhouette mask changes, inside left as paper
        float me = texture2D(tM, vUv).r, edge = 0.0;
        for (int i = 0; i < 12; i++) {
          float a = 6.2832 * float(i) / 12.0;
          edge = max(edge, abs(texture2D(tM, vUv + vec2(cos(a), sin(a)) * px * 2.2).r - me));
        }
        float ink = 1.0;
        ink = min(ink, 1.0 - 0.55 * setLine * (1.0 - me));          // thin grey set lines, not drawn over a subject
        ink = min(ink, 1.0 - 0.6 * me * smoothstep(0.25, 0.6, ne)); // a subject's own folds and limbs, light
        ink = min(ink, 1.0 - smoothstep(0.08, 0.3, edge));          // the subject's outline, black (also between two subjects that overlap)
        if (figOnly > 1.5) {
          // ghost: the silhouette averaged over a wide disk, so thin limbs fade and only the body's mass remains
          float acc = 0.0, wsum = 0.0;
          // a wide disk (about a head across at medium sizes): arms and legs average away, the torso's mass stays
          float R = uRes.y * 0.045 / thick;
          for (int r = 1; r <= 6; r++) for (int i = 0; i < 16; i++) {
            float a = 6.2832 * (float(i) + 0.37 * float(r)) / 16.0; float rad = R * float(r) / 6.0;
            acc += texture2D(tM, vUv + vec2(cos(a), sin(a)) * px * rad).r; wsum += 1.0;
          }
          float m = smoothstep(0.30, 0.62, acc / wsum);
          gl_FragColor = vec4(vec3(0.6, 0.6, 0.62), m * 0.95);
          return;
        }
        if (figOnly > 0.5) {
          // pencil: graphite outline and light folds on off-white paper, only on and around the subjects
          float grain = 0.85 + 0.15 * hash(floor(vUv * uRes / 1.5));
          float out_ = smoothstep(0.2, 0.6, edge), fold = me * smoothstep(0.3, 0.7, ne);
          float g = 1.0 - (0.78 * out_ + 0.35 * fold) * grain;
          gl_FragColor = vec4(vec3(0.97, 0.965, 0.95) * g, max(me, out_));
          return;
        }
        gl_FragColor = vec4(vec3(ink), 1.0);
      }`,
  }));
  const qScene = new THREE.Scene(); qScene.add(quad);
  const qCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  // ground shadows over the drawing: only flat things near the ground (paving, roads, the terrain) show shadow, as a soft tone
  const shadowMat = new THREE.ShadowMaterial({ color: 0x2a2a2a, opacity: 0.38, side: THREE.DoubleSide });
  const hideMat = new THREE.MeshBasicMaterial({ colorWrite: false });
  const box = new THREE.Box3();
  function groundShadows(gl: THREE.WebGLRenderer, scene: THREE.Scene, cam: THREE.PerspectiveCamera) {
    const swapped: [THREE.Mesh, THREE.Material | THREE.Material[]][] = [];
    scene.traverse((o: any) => {
      if (!o.isMesh || !o.visible) return;
      box.setFromObject(o);
      const flat = box.max.y - box.min.y < 0.35 && box.max.y < 0.45;
      swapped.push([o, o.material]); o.material = flat ? shadowMat : hideMat;
    });
    const ac = gl.autoClear; gl.autoClear = false; gl.clearDepth(); gl.render(scene, cam); gl.autoClear = ac;
    for (const [m, mat] of swapped) m.material = mat as any;
  }

  /** draw the frame; `subjects` are the roots whose silhouettes get the bold outline; `shadows` lays ground shadows over it */
  function render(gl: THREE.WebGLRenderer, scene: THREE.Scene, cam: THREE.PerspectiveCamera, subjects: THREE.Object3D[], figuresOnly: boolean | "ghost" = false, shadows = false) {
    const hidden: THREE.Object3D[] = [];
    scene.traverse((o: any) => { if (o.userData?.noPathTrace && o.visible) { o.visible = false; hidden.push(o); } });   // sky dome, specks
    const bg = scene.background, fog = scene.fog; scene.background = null; scene.fog = null;
    const clear = gl.getClearColor(new THREE.Color()), alpha = gl.getClearAlpha();
    // the normal and depth pass
    scene.overrideMaterial = normalMat;
    gl.setRenderTarget(normalRT); gl.setClearColor(0x8080ff, 1); gl.clear(); gl.render(scene, cam);
    // the subjects' silhouettes, hidden where the set stands in front of them
    scene.overrideMaterial = null;
    // each subject a different grey in the mask, so two that overlap still get an outline between them
    const subjectMat = new Map<THREE.Object3D, THREE.Material>();
    subjects.forEach((s, k) => { const m = k === 0 ? white : (subjMats[k % 3] ??= new THREE.MeshBasicMaterial({ color: new THREE.Color().setScalar([1, 0.55, 0.2][k % 3]), side: THREE.DoubleSide })); s.traverse((o) => subjectMat.set(o, m)); });
    const swapped: [THREE.Mesh, THREE.Material | THREE.Material[]][] = [];
    scene.traverse((o: any) => { if (o.isMesh && o.visible) { swapped.push([o, o.material]); o.material = subjectMat.get(o) ?? black; } });
    gl.setRenderTarget(maskRT); gl.setClearColor(0x000000, 1); gl.clear(); gl.render(scene, cam);
    for (const [m, mat] of swapped) m.material = mat as any;
    // ink on paper
    const u = (quad.material as THREE.ShaderMaterial).uniforms; u.near.value = cam.near; u.far.value = cam.far; u.figOnly.value = figuresOnly === "ghost" ? 2 : figuresOnly ? 1 : 0;
    gl.setRenderTarget(null);
    if (figuresOnly) { const ac = gl.autoClear; gl.autoClear = false; gl.render(qScene, qCam); gl.autoClear = ac; }   // over the frame already drawn
    else { gl.setClearColor(0xffffff, 1); gl.clear(); gl.render(qScene, qCam); if (shadows) groundShadows(gl, scene, cam); }
    gl.setClearColor(clear, alpha); scene.background = bg; scene.fog = fog;
    for (const o of hidden) o.visible = true;
  }
  return { render };
}
