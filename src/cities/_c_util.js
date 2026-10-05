// Private helpers for agent C's cities (euphemia, chloe, eutropia, ersilia, esmeralda,
// valdrada, zemrude, baucis, phyllis, moriana).
import { THREE, M, C } from '../kit.js';

/** flat ribbon (horizontal strip) along a polyline of [x,z] points, at height y */
export function ribbonGeo(pts, width, y = 0, widthFn = null) {
  const pos = [];
  const n = pts.length;
  const L = [], R = [];
  for (let i = 0; i < n; i++) {
    const p = pts[i];
    const a = pts[Math.max(0, i - 1)], c = pts[Math.min(n - 1, i + 1)];
    let dx = c[0] - a[0], dz = c[1] - a[1];
    const l = Math.hypot(dx, dz) || 1;
    dx /= l; dz /= l;
    const w = (widthFn ? widthFn(i / (n - 1)) : 1) * width / 2;
    L.push([p[0] - dz * w, p[1] + dx * w]);
    R.push([p[0] + dz * w, p[1] - dx * w]);
  }
  for (let i = 0; i < n - 1; i++) {
    const l0 = L[i], r0 = R[i], l1 = L[i + 1], r1 = R[i + 1];
    pos.push(l0[0], y, l0[1], r0[0], y, r0[1], l1[0], y, l1[1]);
    pos.push(r0[0], y, r0[1], r1[0], y, r1[1], l1[0], y, l1[1]);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  // ensure normals face up
  const nr = g.attributes.normal;
  if (nr.getY(0) < 0) {
    for (let i = 0; i < pos.length; i += 9) {
      // swap 2nd and 3rd vertex of each triangle
      for (let k = 0; k < 3; k++) { const t = pos[i + 3 + k]; pos[i + 3 + k] = pos[i + 6 + k]; pos[i + 6 + k] = t; }
    }
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.computeVertexNormals();
  }
  return { geo: g, L, R };
}

/** smooth a polyline of [x,z] with Catmull-Rom into n points */
export function smoothPath(pts, n = 40) {
  const v = pts.map(([x, z]) => new THREE.Vector3(x, 0, z));
  const c = new THREE.CatmullRomCurve3(v, false, 'centripetal');
  return c.getPoints(n).map((p) => [p.x, p.z]);
}

/** Instanced glowing particles with per-instance colour. */
export function glowParticles(count, radius = 0.06, color = '#ffffff', detail = 0) {
  const geo = new THREE.IcosahedronGeometry(radius, detail);
  const mat = new THREE.MeshBasicMaterial({ color, toneMapped: false });
  const im = new THREE.InstancedMesh(geo, mat, count);
  im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  im.frustumCulled = false;
  return im;
}

export const _o = new THREE.Object3D();
export const _col = new THREE.Color();

/** A material for vertex-coloured standalone meshes (like M.* but separate instance) */
export function vcMat(o = {}) {
  return new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, metalness: 0, ...o });
}

export function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
export function smooth01(x) { x = clamp01(x); return x * x * (3 - 2 * x); }

/** mix two hex colours */
export function mix(a, b, t) { return new THREE.Color(a).lerp(new THREE.Color(b), t).getHex(); }

export { M, C };
