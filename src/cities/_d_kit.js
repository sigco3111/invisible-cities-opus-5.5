// Private helpers for agent D's cities (aglaura, leandra, pyrrha, clarice, irene,
// melania, adelma, eusapia, argia, laudomia). Not a city module (leading underscore).
import { THREE, Builder, M, C } from '../kit.js';

const ARM = {
  down: [0.13, 0.36, 0.03],
  out: [0.27, 0.6, 0.12],
  up: [0.16, 1.0, 0.06],
  fwd: [0.07, 0.62, 0.24],
  hip: [0.2, 0.46, -0.02],
  heart: [-0.03, 0.66, 0.1],
  chin: [-0.02, 0.8, 0.1],
  carry: [0.1, 0.72, 0.2],
  back: [0.12, 0.42, -0.14],
  pray: [-0.02, 0.7, 0.16],
  wave: [0.3, 0.92, 0.02],
  point: [0.14, 0.7, 0.32],
  ear: [-0.12, 0.82, 0.02],
};

/**
 * A small articulated-looking figure (one material => one mesh). Faces +z (before ry).
 * arms: [left, right] preset names or [x,y,z] in units of h (left x is mirrored).
 * hat: 'cap' | 'brim' | 'helmet' | 'hood' | 'veil' | 'hair' | null
 */
export function figure(b, {
  x = 0, y = 0, z = 0, ry = 0, h = 0.35, lean = 0, roll = 0,
  robe = C.terracotta, top = null, skin = '#d9b391', hat = null, hatColor = null,
  arms = ['down', 'down'], mat = M.stone, skirt = 1, plume = null, fat = 1,
} = {}) {
  b.push({ x, y, z, ry, rx: lean, rz: roll });
  const tc = top ?? robe;
  b.cyl(h * 0.09 * fat, h * 0.16 * skirt * fat, h * 0.5, { color: robe, seg: 8, mat });
  b.cyl(h * 0.075 * fat, h * 0.095 * fat, h * 0.24, { y: h * 0.48, color: tc, seg: 8, mat });
  b.sphere(h * 0.1, { y: h * 0.82, color: skin, seg: 8, mat });
  for (let i = 0; i < 2; i++) {
    const sgn = i === 0 ? -1 : 1;
    let a = arms[i];
    if (typeof a === 'string') a = ARM[a] || ARM.down;
    const sh = [sgn * h * 0.1, h * 0.69, 0];
    const hand = [sgn * a[0] * h, a[1] * h, a[2] * h];
    b.rod(sh, hand, h * 0.028, { color: tc, mat, seg: 4 });
    b.sphere(h * 0.03, { x: hand[0], y: hand[1], z: hand[2], color: skin, seg: 4, mat });
  }
  const hc = hatColor ?? robe;
  if (hat === 'cap') b.cone(h * 0.1, h * 0.14, { y: h * 0.88, color: hc, seg: 6, mat });
  else if (hat === 'brim') {
    b.cyl(h * 0.19, h * 0.19, h * 0.015, { y: h * 0.89, color: hc, seg: 10, mat });
    b.cyl(h * 0.08, h * 0.09, h * 0.1, { y: h * 0.89, color: hc, seg: 8, mat });
  } else if (hat === 'helmet') {
    b.dome(h * 0.115, { y: h * 0.84, color: hc, seg: 8, mat });
  } else if (hat === 'hood') {
    b.cone(h * 0.15, h * 0.34, { y: h * 0.7, color: hc, seg: 7, mat });
  } else if (hat === 'veil') {
    b.cone(h * 0.13, h * 0.26, { y: h * 0.68, color: hc, seg: 8, mat, open: true });
    b.dome(h * 0.105, { y: h * 0.84, color: hc, seg: 8, mat });
  } else if (hat === 'hair') {
    b.sphere(h * 0.105, { y: h * 0.86, z: -h * 0.02, color: hc, seg: 6, mat });
    b.sphere(h * 0.06, { y: h * 0.8, z: -h * 0.1, color: hc, seg: 6, mat });
  }
  if (plume) b.cone(h * 0.035, h * 0.22, { y: h * 0.94, z: -h * 0.03, rx: -0.4, color: plume, seg: 4, mat });
  b.pop();
}

/** Build geometry once (single material) — e.g. for InstancedMesh. Keeps vertex colours. */
export function geoOf(fn, mat = M.stone) {
  const b = new Builder();
  fn(b, mat);
  const g = b.build({ shadows: false });
  const mesh = g.children.find((m) => m.material === mat) || g.children[0];
  return mesh.geometry;
}

/** Luminous phantom material (unlit, additive, vertex-coloured, no depth write). */
export function phantomMat(opacity = 0.1, o = {}) {
  const m = new THREE.MeshBasicMaterial({
    vertexColors: true, transparent: true, opacity, depthWrite: false,
    blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false, ...o,
  });
  m.userData.noShadow = true;
  return m;
}

/** Translucent lit material (vertex-coloured), for ghosts. */
export function ghostLit(opacity = 0.5, o = {}) {
  const m = new THREE.MeshStandardMaterial({
    vertexColors: true, transparent: true, opacity, roughness: 0.6, metalness: 0,
    depthWrite: false, ...o,
  });
  m.userData.noShadow = true;
  return m;
}

/** Edge lines of all meshes in a group (one LineSegments). */
export function edgesOf(group, color = '#ffd27a', intensity = 1, opacity = 0.6, angle = 30) {
  const parts = [];
  group.traverse((m) => { if (m.isMesh) parts.push(new THREE.EdgesGeometry(m.geometry, angle)); });
  const pos = [];
  for (const p of parts) { pos.push(...p.attributes.position.array); p.dispose(); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.computeBoundingSphere();
  const mat = new THREE.LineBasicMaterial({
    color: new THREE.Color(color).multiplyScalar(intensity), transparent: true, opacity,
    depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
  });
  return new THREE.LineSegments(g, mat);
}

/** smoothstep */
export const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** A soft radial-gradient sprite texture (generated) */
let _soft = null;
export function softTex() {
  if (_soft) return _soft;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)');
  gr.addColorStop(0.35, 'rgba(255,255,255,0.45)');
  gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, 64, 64);
  _soft = new THREE.CanvasTexture(c);
  return _soft;
}

/** Many small pebbles / cobbles as a mosaic disc, cheap (one box each) */
export function cobbles(b, { r = 2, n = 120, rng, y = 0, colors = [C.sand, C.ash], h = 0.04, size = 0.22, inside = null }) {
  for (let i = 0; i < n; i++) {
    const [x, z] = rng.inDisc(r);
    if (inside && !inside(x, z)) continue;
    const s = size * rng.range(0.7, 1.2);
    b.box(s, h, s * rng.range(0.7, 1.1), { x, y, z, ry: rng.range(0, 3), color: rng.pick(colors), mat: M.stone });
  }
}

export { ARM };

/** Vertex-coloured standard material that also glows faintly in its own colour
 *  (for interiors lit from within without adding real lights). */
export function warmLit(tint = '#ffb978', intensity = 0.45, o = {}) {
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8, metalness: 0, emissive: new THREE.Color(tint), emissiveIntensity: intensity, ...o });
  m.onBeforeCompile = (sh) => {
    sh.fragmentShader = sh.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n totalEmissiveRadiance *= vColor.rgb;');
  };
  m.customProgramCacheKey = () => 'warmLit';
  return m;
}
