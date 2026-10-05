// Rotate a whole city about Y without inflating its axis-aligned bounding box:
// the big static (merged) meshes get the rotation baked into their geometry, and
// every other child (animated parts) is moved into a rotated wrapper group.
import * as THREE from 'three';

export function turnCity(object, statics, ry) {
  const wrap = new THREE.Group();
  wrap.rotation.y = ry;
  const m = new THREE.Matrix4().makeRotationY(ry);
  for (const c of [...object.children]) {
    if (statics.includes(c)) {
      c.traverse((o) => { if (o.geometry) { o.geometry.applyMatrix4(m); o.geometry.computeBoundingSphere(); o.geometry.computeBoundingBox(); } });
    } else {
      object.remove(c);
      wrap.add(c);
    }
  }
  object.add(wrap);
  object.rotation.y = 0;
  return object;
}
