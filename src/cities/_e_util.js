// Private helpers for agent E's cities (eudoxia, beersheba, thekla, perinthia,
// andria, leonia, trude, procopia, cecilia, penthesilea).
import { THREE, M, C } from '../kit.js';

/** A polar-grid terrain disc with height h(x,z); returns a BufferGeometry (centre origin). */
export function terrainGeo(hFn, R = 10.4, rings = 26, segs = 72, skirt = 0.0) {
  const pos = [];
  const idx = [];
  pos.push(0, hFn(0, 0), 0);
  for (let i = 1; i <= rings; i++) {
    const r = (i / rings) * R;
    for (let j = 0; j < segs; j++) {
      const a = (j / segs) * Math.PI * 2;
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      pos.push(x, hFn(x, z), z);
    }
  }
  const at = (i, j) => (i === 0 ? 0 : 1 + (i - 1) * segs + (j % segs));
  for (let j = 0; j < segs; j++) idx.push(0, at(1, j + 1), at(1, j));
  for (let i = 1; i < rings; i++) {
    for (let j = 0; j < segs; j++) {
      const a = at(i, j), b = at(i, j + 1), c = at(i + 1, j), d = at(i + 1, j + 1);
      idx.push(a, b, c, b, d, c);
    }
  }
  // skirt down to y=skirt so the edge reads as a solid slab
  const base = pos.length / 3;
  for (let j = 0; j < segs; j++) {
    const a = (j / segs) * Math.PI * 2;
    pos.push(Math.cos(a) * R, skirt, Math.sin(a) * R);
  }
  for (let j = 0; j < segs; j++) {
    const t0 = at(rings, j), t1 = at(rings, j + 1);
    const b0 = base + j, b1 = base + ((j + 1) % segs);
    idx.push(t0, t1, b0, t1, b1, b0);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Make a CanvasTexture by drawing with fn(ctx, size). */
export function canvasTex(size, fn, { repeat = null, aniso = 8 } = {}) {
  const cv = document.createElement('canvas');
  const [w, h] = Array.isArray(size) ? size : [size, size];
  cv.width = w; cv.height = h;
  const ctx = cv.getContext('2d');
  fn(ctx, w, h);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = aniso;
  if (repeat) {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeat[0], repeat[1]);
  }
  return tex;
}

/** Add a per-vertex colour attribute of a single colour (for using M.* on stand-alone meshes). */
export function paint(geo, color) {
  const c = new THREE.Color(color);
  const n = geo.attributes.position.count;
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b; }
  geo.setAttribute('color', new THREE.BufferAttribute(a, 3));
  return geo;
}

/** smooth value-noise-ish function from sines (deterministic, cheap) */
export function wobble(x, z, seed = 0) {
  return (
    Math.sin(x * 0.9 + seed) * Math.cos(z * 0.7 - seed * 1.3) * 0.5 +
    Math.sin(x * 2.1 - z * 1.7 + seed * 2.1) * 0.25 +
    Math.sin(z * 3.3 + x * 0.4 + seed * 0.7) * 0.12
  );
}

export const smooth01 = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

export const _v = new THREE.Vector3();
export const _m4 = new THREE.Matrix4();
export const _q = new THREE.Quaternion();
export const _e = new THREE.Euler();
export const _s = new THREE.Vector3();
export { M, C };

/** A tiny painted equirectangular environment for metals (the app has no scene.environment).
 *  Warm horizon glow, dark board below, twilight above, a couple of bright "windows" for glints. */
let _env = null;
export function envTex() {
  if (_env) return _env;
  _env = canvasTex([256, 128], (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#2a2f4a');
    gr.addColorStop(0.35, '#7a6a8a');
    gr.addColorStop(0.48, '#fff0d8');
    gr.addColorStop(0.53, '#b49a80');
    gr.addColorStop(0.62, '#3a2a20');
    gr.addColorStop(1, '#120c0a');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,240,210,0.95)';
    g.beginPath(); g.ellipse(w * 0.15, h * 0.42, 18, 7, 0, 0, 7); g.fill();
    g.beginPath(); g.ellipse(w * 0.62, h * 0.3, 10, 5, 0, 0, 7); g.fill();
    g.fillStyle = 'rgba(200,220,255,0.6)';
    g.fillRect(w * 0.4, h * 0.12, 30, 6);
  });
  _env.mapping = THREE.EquirectangularReflectionMapping;
  return _env;
}
