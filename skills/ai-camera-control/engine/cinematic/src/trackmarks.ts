// Tracking marks: a soft one-metre checker in world space on every set surface, so a video model reads the camera's travel,
// turn and height from parallax instead of guessing it from a flat grey set. Only for the reference renders (--marks).
// The stand-ins (textured) and anything that is not a standard material are left alone.
import * as THREE from "three";

const done = new WeakSet<THREE.Material>();
function mark(m: THREE.MeshStandardMaterial) {
  if (done.has(m) || m.map) return;
  done.add(m);
  m.onBeforeCompile = (s) => {
    s.vertexShader = s.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vTrackW;")
      .replace("#include <project_vertex>", `#include <project_vertex>
        vec4 trackP = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          trackP = instanceMatrix * trackP;
        #endif
        vTrackW = (modelMatrix * trackP).xyz;`);
    s.fragmentShader = s.fragmentShader.replace("#include <common>", "#include <common>\nvarying vec3 vTrackW;")
      .replace("#include <color_fragment>", `#include <color_fragment>
        vec3 trackC = floor(vTrackW + 0.001);
        float trackK = mod(trackC.x + trackC.y + trackC.z, 2.0);
        diffuseColor.rgb *= mix(0.72, 1.0, trackK);`);
  };
  m.customProgramCacheKey = () => "trackmarks";
  m.needsUpdate = true;
}
/** put the checker on every set material in the scene (people's materials too: they are hidden under the stand-ins) */
export function addTrackMarks(scene: THREE.Scene) {
  scene.traverse((o: any) => {
    if (!o.isMesh || o.userData?.noPathTrace) return;
    for (const m of [o.material].flat()) if (m?.isMeshStandardMaterial) mark(m);
  });
}
