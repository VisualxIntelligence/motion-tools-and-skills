// The product stand-in: a striped pill, the same hazard-striped capsule the people stand-ins use. A video model reads
// where the product is, how big it is and which side is its front (the white dot, like a label), with no product
// shape to copy. Its origin is the middle of its base; its front faces +z.
import * as THREE from "three";
import { stripes } from "../standins";

export function pill(h = 0.24, r = 0.06, hex = "#d81fb5", eye = 0.62) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(r, Math.max(0.001, h - 2 * r), 12, 36), new THREE.MeshStandardMaterial({ map: stripes(hex), roughness: 0.75 }));
  body.position.y = h / 2; body.castShadow = body.receiveShadow = true;
  const dot = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.45, r * 0.45, r * 0.08, 36), new THREE.MeshStandardMaterial({ color: "#f4f4f2", roughness: 0.6 }));
  dot.rotation.x = Math.PI / 2; dot.position.set(0, h * eye, r); dot.castShadow = true;
  g.add(body, dot);
  return g;
}
