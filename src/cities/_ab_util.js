// Private helpers for agent B's cities (tamara, zirma, zoe, hypatia, olivia,
// isaura, zenobia, armilla, sophronia, octavia).
import { THREE, M, C } from '../kit.js';

/**
 * Give every mesh/line under `root` a cloned material whose vertices sway like
 * pendulums hanging below `top`: displacement grows with depth below `top`.
 * Returns the shared uniforms ({ uTime }) – set uTime.value in update().
 */
export function swayify(root, { top = 10, len = 8, amp = 0.2, freq = 0.7, heave = 0, heaveR = 7, key = 'sway' } = {}) {
  const uniforms = { uTime: { value: 0 } };
  const cache = new Map();
  const patch = (mat) => {
    if (cache.has(mat)) return cache.get(mat);
    const m = mat.clone();
    m.onBeforeCompile = (sh) => {
      sh.uniforms.uTime = uniforms.uTime;
      sh.vertexShader = 'uniform float uTime;\n' + sh.vertexShader.replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        {
          float k = clamp((${top.toFixed(3)} - transformed.y) / ${len.toFixed(3)}, 0.0, 1.0);
          k = k * k * (3.0 - 2.0 * k);
          float ph = transformed.x * 0.33 + transformed.z * 0.21;
          transformed.x += ${amp.toFixed(3)} * k * sin(uTime * ${freq.toFixed(3)} + ph);
          transformed.z += ${(amp * 0.6).toFixed(3)} * k * sin(uTime * ${(freq * 0.77).toFixed(3)} + ph * 1.7 + 1.3);
          float rr = clamp(1.0 - (transformed.x * transformed.x + transformed.z * transformed.z) / ${(heaveR * heaveR).toFixed(3)}, 0.0, 1.0);
          transformed.y += ${heave.toFixed(3)} * rr * sin(uTime * 0.45 + transformed.x * 0.25);
        }`,
      );
    };
    m.customProgramCacheKey = () => `${key}${mat.uuid}${top}_${len}_${amp}_${freq}_${heave}_${heaveR}`;
    cache.set(mat, m);
    return m;
  };
  root.traverse((o) => {
    if (o.isMesh || o.isLineSegments) o.material = patch(o.material);
  });
  return uniforms;
}

/** Smooth hash-ish noise for deterministic jitter. */
export const hash = (x, y = 0) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

/** A small standing figure with a body, head and (optional) arms raised. */
export function figure(b, { x = 0, y = 0, z = 0, h = 0.36, color = C.terracotta, skin = '#d7b08c', ry = 0, arms = 0, mat = M.smooth }) {
  b.push({ x, y, z, ry });
  b.cyl(h * 0.07, h * 0.16, h * 0.62, { color, seg: 7, mat });
  b.sphere(h * 0.12, { y: h * 0.76, color: skin, seg: 8, mat });
  if (arms) {
    for (const s of [-1, 1]) b.rod([s * h * 0.06, h * 0.55, 0], [s * h * 0.22, h * (0.55 + 0.3 * arms), 0], h * 0.03, { color: skin, seg: 4, mat });
  }
  b.pop();
}

/** Set an instanced mesh matrix without allocation. */
const _o = new THREE.Object3D();
export function setInst(mesh, i, x, y, z, s = 1, ry = 0, rx = 0, rz = 0, sy = s) {
  _o.position.set(x, y, z);
  _o.rotation.set(rx, ry, rz);
  _o.scale.set(s, sy, s);
  _o.updateMatrix();
  mesh.setMatrixAt(i, _o.matrix);
}

/** Make a material emissive-free clone of a vertex-coloured kit material for a separate animated part. */
export const vc = (mat) => mat; // kept for readability

export { THREE, M, C };
