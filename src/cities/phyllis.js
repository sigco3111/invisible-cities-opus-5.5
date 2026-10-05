// Phyllis — arriving, you rejoice at its bridges, each different (humpbacked, covered, on
// pillars, on barges, suspended, with tracery) and at its windows of every kind (mullioned,
// Moorish, lancet, crowned with lunettes, rose windows). But stay, and the city fades: your
// eyes choose the one route you need — a door, a quay, a bridge, a little square — and all
// the rest goes pale as a blank page. Then someone new arrives, and it blooms again.
import { THREE, Builder, M, C, bridge } from '../kit.js';
import { _o, _col, smooth01 } from './_c_util.js';

const LAND = 0.42;
const WATER = 0.28;
const HW = 1.45; // half width of the grand canal
const HW2 = 0.8; // half width of the cross canal
const zc = (x) => 1.3 * Math.sin(x * 0.33) + 0.2;
const xc = (z) => 2.8 + 0.5 * Math.sin(z * 0.35);

export default function build({ rng, accent }) {
  const object = new THREE.Group();
  const b = new Builder(); // everything that fades
  const keep = new Builder(); // the habitual route: never fades

  const canalD = (x, z) => Math.min(Math.abs(z - zc(x)) - HW, Math.abs(x - xc(z)) - HW2);

  // ---------------------------------------------------------------- terrain with sunken canals
  const fadeU = { value: 0 };
  const paper = new THREE.Color('#e9e3d6');
  const fadeCache = new Map();
  const fadeMat = (m) => {
    if (fadeCache.has(m)) return fadeCache.get(m);
    const f = m.clone();
    f.onBeforeCompile = (sh) => {
      sh.uniforms.uFade = fadeU;
      sh.fragmentShader = 'uniform float uFade;\n' + sh.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
        float lum_ = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
        vec3 blank_ = vec3(0.91, 0.89, 0.84) * (0.82 + 0.18 * min(lum_, 1.0)) * ${m.isMeshBasicMaterial ? '0.62' : '1.0'};
        diffuseColor.rgb = mix(diffuseColor.rgb, blank_, uFade);`);
    };
    f.customProgramCacheKey = () => 'phyllis-fade-' + m.uuid;
    fadeCache.set(m, f);
    return f;
  };
  {
    const R = 10.35, N = 120;
    const g = new THREE.PlaneGeometry(2 * R, 2 * R, N, N).rotateX(-Math.PI / 2).toNonIndexed();
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      let x = p.getX(i), z = p.getZ(i);
      const r = Math.hypot(x, z);
      if (r > R) { x *= R / r; z *= R / r; }
      const d = canalD(x, z);
      p.setXYZ(i, x, d > 0 ? LAND : 0.12, z);
    }
    const col = new Float32Array(p.count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < p.count; i += 3) {
      const cx = (p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3, cz = (p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2)) / 3;
      const cy = Math.min(p.getY(i), p.getY(i + 1), p.getY(i + 2));
      const top = cy > LAND - 0.01;
      // paving: herringbone-ish tint variation on land, quay stone on slopes
      if (top) c.set(((Math.floor(cx * 2.2) + Math.floor(cz * 2.2)) & 1) ? '#c9b48e' : '#c2ac86');
      else c.set(cy < 0.2 ? '#41544f' : '#a99878');
      for (let k = 0; k < 3; k++) { col[(i + k) * 3] = c.r; col[(i + k) * 3 + 1] = c.g; col[(i + k) * 3 + 2] = c.b; }
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.computeVertexNormals();
    const tm = new THREE.Mesh(g, fadeMat(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92, flatShading: true })));
    tm.receiveShadow = true;
    object.add(tm);
  }
  b.cyl(10.35, 10.35, LAND, { color: '#a99878', seg: 72, open: true });
  const waterMat = new THREE.MeshStandardMaterial({ color: '#3f7d86', roughness: 0.55, metalness: 0, transparent: true, opacity: 0.85 });
  const water = new THREE.Mesh(new THREE.CircleGeometry(10.3, 72).rotateX(-Math.PI / 2), waterMat);
  water.position.y = WATER;
  object.add(water);

  // quay curbs along the canal edges
  for (let x = -10; x < 10; x += 0.3) {
    for (const s of [-1, 1]) {
      const z0 = zc(x) + s * HW, z1 = zc(x + 0.3) + s * HW;
      if (Math.hypot(x, z0) > 10.1 || Math.abs(x - xc(z0)) < HW2 + 0.05) continue;
      b.beam([x, LAND + 0.03, z0 - s * 0.03], [x + 0.3, LAND + 0.03, z1 - s * 0.03], 0.07, { color: '#efe6d6' });
    }
  }
  for (let z = -10; z < 10; z += 0.3) {
    for (const s of [-1, 1]) {
      const x0 = xc(z) + s * HW2, x1 = xc(z + 0.3) + s * HW2;
      if (Math.hypot(x0, z) > 10.1 || Math.abs(z - zc(x0)) < HW + 0.05) continue;
      b.beam([x0 - s * 0.03, LAND + 0.03, z], [x1 - s * 0.03, LAND + 0.03, z + 0.3], 0.07, { color: '#efe6d6' });
    }
  }

  // ---------------------------------------------------------------- windows of every kind
  const STONE = '#f4ecdc', GLASS = '#2e2a2c';
  const glass = (B, lit) => (lit ? { mat: M.glow, color: C.lamp, glow: 1.7 } : { mat: M.smooth, color: GLASS });
  const W = {
    mullioned(B, u, y, z, lit) {
      B.quad(0.26, 0.34, { x: u, y, z, ...glass(B, lit) });
      B.box(0.03, 0.36, 0.03, { x: u, y: y - 0.18, z: z + 0.01, color: STONE });
      B.box(0.28, 0.03, 0.03, { x: u, y: y + 0.04, z: z + 0.01, color: STONE });
      B.box(0.32, 0.04, 0.05, { x: u, y: y - 0.2, z: z + 0.015, color: STONE });
      B.box(0.32, 0.04, 0.05, { x: u, y: y + 0.17, z: z + 0.015, color: STONE });
    },
    moorish(B, u, y, z, lit) {
      B.quad(0.18, 0.2, { x: u, y: y - 0.06, z, ...glass(B, lit) });
      B.geo(new THREE.CircleGeometry(0.11, 14), { x: u, y: y + 0.06, z: z + 0.001, ...glass(B, lit) });
      B.geo(new THREE.TorusGeometry(0.12, 0.018, 4, 16, Math.PI * 1.35), { x: u, y: y + 0.06, z: z + 0.012, rz: -Math.PI * 0.175, color: STONE, mat: M.smooth });
      B.box(0.03, 0.22, 0.03, { x: u - 0.105, y: y - 0.17, z: z + 0.012, color: STONE });
      B.box(0.03, 0.22, 0.03, { x: u + 0.105, y: y - 0.17, z: z + 0.012, color: STONE });
    },
    lancet(B, u, y, z, lit) {
      for (const du of [-0.07, 0.07]) {
        B.quad(0.1, 0.32, { x: u + du, y: y - 0.04, z, ...glass(B, lit) });
        B.geo(new THREE.CircleGeometry(0.0707, 3, Math.PI / 2), { x: u + du, y: y + 0.13, z: z + 0.001, sy: 1.6, ...glass(B, lit) });
      }
      B.box(0.03, 0.44, 0.03, { x: u, y: y - 0.2, z: z + 0.01, color: STONE });
      B.box(0.3, 0.035, 0.04, { x: u, y: y - 0.22, z: z + 0.012, color: STONE });
    },
    lunette(B, u, y, z, lit) {
      B.quad(0.22, 0.26, { x: u, y: y - 0.06, z, ...glass(B, lit) });
      B.geo(new THREE.CircleGeometry(0.11, 12, 0, Math.PI), { x: u, y: y + 0.1, z: z + 0.001, ...glass(B, !lit) });
      B.box(0.26, 0.025, 0.03, { x: u, y: y + 0.085, z: z + 0.01, color: STONE });
      B.geo(new THREE.TorusGeometry(0.125, 0.018, 4, 14, Math.PI), { x: u, y: y + 0.1, z: z + 0.012, color: STONE, mat: M.smooth });
      B.box(0.03, 0.27, 0.03, { x: u - 0.125, y: y - 0.2, z: z + 0.012, color: STONE });
      B.box(0.03, 0.27, 0.03, { x: u + 0.125, y: y - 0.2, z: z + 0.012, color: STONE });
    },
    rose(B, u, y, z, lit, r = 0.2) {
      B.geo(new THREE.CircleGeometry(r, 20), { x: u, y, z, ...glass(B, lit) });
      B.geo(new THREE.TorusGeometry(r, 0.025, 4, 24), { x: u, y, z: z + 0.012, color: STONE, mat: M.smooth });
      B.geo(new THREE.TorusGeometry(r * 0.35, 0.015, 4, 14), { x: u, y, z: z + 0.012, color: STONE, mat: M.smooth });
      for (let k = 0; k < 8; k++) B.box(0.015, r * 0.65, 0.02, { x: u + Math.cos(k * Math.PI / 4) * r * 0.35, y: y + Math.sin(k * Math.PI / 4) * r * 0.35 - r * 0.325 * 0, z: z + 0.012, rz: k * Math.PI / 4 - Math.PI / 2, color: STONE });
    },
  };
  const STYLES = ['mullioned', 'moorish', 'lancet', 'lunette'];
  const palazzo = (B, x, z, ry, w, h, d, style, wall, roofC, litP = 0.3) => {
    B.push({ x, y: LAND, z, ry });
    B.box(w, h, d, { color: wall });
    B.box(w + 0.06, 0.07, d + 0.06, { y: h, color: STONE });
    B.box(w + 0.02, 0.05, d + 0.02, { y: 0.5, color: STONE });
    // crenellated or tiled top
    if (style === 'moorish') for (let i = 0; i < Math.floor(w / 0.18); i++) B.prism(0, 0.06, 0.14, 4, { x: -w / 2 + 0.09 + i * 0.18, y: h + 0.07, z: d / 2 - 0.05, color: STONE, mat: M.flat });
    else B.geo(new THREE.CylinderGeometry(0.0001, 0.72, 1, 4, 1).rotateY(Math.PI / 4).translate(0, 0.5, 0), { y: h + 0.06, sx: w + 0.06, sz: d + 0.06, sy: 0.3, color: roofC, mat: M.flat });
    // canal door: water gate
    B.quad(0.3, 0.38, { y: 0.2, z: d / 2 + 0.006, color: '#2a2422' });
    B.geo(new THREE.CircleGeometry(0.15, 10, 0, Math.PI), { y: 0.39, z: d / 2 + 0.006, color: '#2a2422' });
    const floors = Math.floor((h - 0.55) / 0.6);
    const cols = Math.max(2, Math.floor(w / 0.42));
    for (let f = 0; f < floors; f++) {
      for (let c = 0; c < cols; c++) {
        const u = -w / 2 + (c + 0.5) * w / cols;
        if (f === floors - 1 && style === 'lancet' && c === Math.floor(cols / 2) && cols % 2) { W.rose(B, u, 0.85 + f * 0.6, d / 2 + 0.006, rng.chance(litP), 0.18); continue; }
        W[style](B, u, 0.85 + f * 0.6, d / 2 + 0.006, rng.chance(litP));
      }
    }
    // the back face, plainer
    for (let f = 0; f < floors; f++) for (let c = 0; c < cols; c++) {
      const u = -w / 2 + (c + 0.5) * w / cols;
      const lit = rng.chance(litP * 0.7);
      B.quad(0.16, 0.28, { x: u, y: 0.85 + f * 0.6, z: -d / 2 - 0.006, ry: Math.PI, ...glass(B, lit) });
      B.box(0.22, 0.03, 0.05, { x: u, y: 0.85 + f * 0.6 - 0.16, z: -d / 2 - 0.02, color: STONE });
    }
    // balcony on the piano nobile
    if (floors > 1 && rng.chance(0.6)) {
      B.box(w * 0.5, 0.04, 0.22, { y: 1.15 - 0.27, z: d / 2 + 0.11, color: STONE });
      for (let k = 0; k <= 8; k++) B.cyl(0.012, 0.012, 0.16, { x: -w * 0.25 + k * w * 0.0625, y: 1.15 - 0.23, z: d / 2 + 0.2, color: STONE, seg: 4 });
    }
    // a rose window on the gable end for tall ones
    if (h > 2.6 && style !== 'lancet') W.rose(B, 0, h - 0.3, d / 2 + 0.006, rng.chance(0.4), 0.16);
    B.pop();
  };
  const walls = ['#e9c9c0', '#d8a8a0', '#efe2c8', '#a8bcb4', '#b4bccc', '#e2c48e', '#d9b8d0', '#f0e8dc', '#c8d0b0', '#d4a07a'];
  const roofs = ['#6f9a8a', '#7d8a94', '#b8694a', '#5f8a80', '#9a7a6a'];

  // ---------------------------------------------------------------- bridges, every one different
  const bridgesX = { pillars: -7.4, hump: -4.6, covered: -1.6, suspended: 5.3, barges: 7.9 };
  const across = (x) => {
    // place a bridge across the grand canal at x
    const z = zc(x);
    const slope = (zc(x + 0.01) - zc(x - 0.01)) / 0.02;
    const ry = Math.atan2(-slope, 1) + Math.PI / 2; // local z across the canal
    return { x, z, ry, L: 2 * HW + 0.5 };
  };
  const BR = {
    hump(B, o) {
      B.push({ x: o.x, y: LAND - 0.02, z: o.z, ry: o.ry });
      bridge(B, { from: [0, 0, -o.L / 2], to: [0, 0, o.L / 2], w: 0.75, rise: 0.75, color: '#efe6d6', segments: 12 });
      // the arch underneath
      B.geo(new THREE.TorusGeometry(0.9, 0.1, 5, 16, Math.PI), { y: -0.36, ry: Math.PI / 2, sx: 1, sy: 0.85, color: '#e3d8c2' });
      B.pop();
    },
    covered(B, o) {
      B.push({ x: o.x, y: LAND - 0.02, z: o.z, ry: o.ry });
      B.box(0.9, 0.12, o.L, { y: 0.35, color: '#e6dccb' });
      B.box(0.06, 0.65, o.L, { x: 0.42, y: 0.47, color: '#e9d8b8' });
      B.box(0.06, 0.65, o.L, { x: -0.42, y: 0.47, color: '#e9d8b8' });
      for (let k = 0; k < 5; k++) for (const s of [-1, 1]) B.quad(0.18, 0.22, { x: s * 0.452, y: 0.78, z: -o.L / 2 + 0.4 + k * (o.L - 0.8) / 4, ry: s * Math.PI / 2, color: GLASS });
      B.geo(new THREE.CylinderGeometry(0.0001, 0.72, 1, 4, 1).rotateY(Math.PI / 4).translate(0, 0.5, 0), { y: 1.12, sx: 1.05, sz: o.L + 0.1, sy: 0.35, color: '#a8553a', mat: M.flat });
      for (const s of [-1, 1]) B.box(0.95, 0.85, 0.2, { y: -0.3, z: s * (o.L / 2 - 0.3), color: '#e3d8c2' });
      B.geo(new THREE.TorusGeometry(0.75, 0.09, 5, 16, Math.PI), { y: -0.2, ry: Math.PI / 2, color: '#e3d8c2' });
      B.pop();
    },
    pillars(B, o) {
      B.push({ x: o.x, y: LAND - 0.02, z: o.z, ry: o.ry });
      B.box(0.7, 0.08, o.L, { y: 0.3, color: '#d9c7a6', mat: M.wood });
      for (let k = 0; k < 4; k++) {
        const zz = -o.L / 2 + 0.35 + k * (o.L - 0.7) / 3;
        for (const s of [-1, 1]) {
          B.cyl(0.05, 0.06, 0.7, { x: s * 0.28, y: -0.4, z: zz, color: '#efe6d6', seg: 10 });
          B.box(0.14, 0.04, 0.14, { x: s * 0.28, y: 0.27, z: zz, color: '#efe6d6' });
        }
      }
      for (const s of [-1, 1]) {
        B.box(0.03, 0.03, o.L, { x: s * 0.33, y: 0.62, color: '#efe6d6' });
        for (let k = 0; k <= 10; k++) B.cyl(0.012, 0.012, 0.25, { x: s * 0.33, y: 0.38, z: -o.L / 2 + k * o.L / 10, color: '#efe6d6', seg: 4 });
      }
      // stairs down to the deck
      for (const s of [-1, 1]) for (let k = 0; k < 2; k++) B.box(0.7, 0.1 + k * 0.1, 0.18, { y: 0.0, z: s * (o.L / 2 + 0.25 - k * 0.15), color: '#efe6d6' });
      B.pop();
    },
    barges(B, o) {
      B.push({ x: o.x, y: WATER - LAND, z: o.z, ry: o.ry });
      const n = 4;
      for (let k = 0; k < n; k++) {
        const zz = -o.L / 2 + 0.45 + k * (o.L - 0.9) / (n - 1);
        B.geo(new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), { y: 0.1, z: zz, sx: 0.55, sy: 0.15, sz: 0.2, color: rng.pick(['#5a3a2a', '#2f4a5a', '#6a4a3a']), mat: M.wood });
      }
      B.box(0.6, 0.04, o.L, { y: 0.14, color: '#a8875e', mat: M.wood });
      for (let k = 0; k <= 8; k++) B.box(0.62, 0.012, 0.03, { y: 0.165, z: -o.L / 2 + k * o.L / 8, color: '#7a5a3e' });
      for (const s of [-1, 1]) for (let k = 0; k < 4; k++) B.cyl(0.012, 0.012, 0.3, { x: s * 0.3, y: 0.16, z: -o.L / 2 + 0.3 + k * (o.L - 0.6) / 3, color: C.darkwood, seg: 4 });
      for (const s of [-1, 1]) B.box(0.012, 0.012, o.L - 0.6, { x: s * 0.3, y: 0.46, color: '#d8c8a8' });
      B.pop();
    },
    suspended(B, o) {
      B.push({ x: o.x, y: LAND - 0.02, z: o.z, ry: o.ry });
      const L = o.L + 0.6;
      const deck = (t) => -0.08 * Math.sin(Math.PI * t);
      for (let k = 0; k < 12; k++) {
        const t0 = k / 12, t1 = (k + 1) / 12;
        B.box(0.55, 0.03, L / 12 + 0.01, { y: 0.06 + deck((t0 + t1) / 2), z: -L / 2 + (t0 + t1) / 2 * L, color: '#a8875e', mat: M.wood });
      }
      for (const s of [-1, 1]) {
        for (const e of [-1, 1]) {
          B.box(0.08, 1.4, 0.08, { x: s * 0.32, z: e * L / 2, color: '#5a4a3e', mat: M.wood });
          B.box(0.75, 0.08, 0.1, { y: 1.3, z: e * L / 2, color: '#5a4a3e', mat: M.wood });
        }
        const pts = [];
        for (let i = 0; i <= 16; i++) { const t = i / 16; pts.push([s * 0.32, 1.35 - 1.05 * Math.sin(Math.PI * t), -L / 2 + t * L]); }
        B.tube(pts, 0.018, { color: '#3a3430', tseg: 32 });
        for (let i = 1; i < 16; i++) { const t = i / 16; B.cyl(0.006, 0.006, 1.35 - 1.05 * Math.sin(Math.PI * t) - 0.06 - deck(t), { x: s * 0.3, y: 0.06 + deck(t), z: -L / 2 + t * L, color: '#3a3430', seg: 3 }); }
      }
      B.pop();
    },
    tracery(B, o) {
      B.push({ x: o.x, y: LAND - 0.02, z: o.z, ry: o.ry });
      const L = o.L;
      B.box(0.7, 0.14, L, { y: 0.22, color: '#efe6d6' });
      // pointed arch below
      for (const s of [-1, 1]) B.geo(new THREE.TorusGeometry(0.75, 0.08, 5, 10, Math.PI / 2.6), { x: 0, y: -0.38, z: s * 0.2, ry: Math.PI / 2, rz: s > 0 ? 0.25 : Math.PI - 0.25 - Math.PI / 2.6, color: '#e3d8c2' });
      // openwork parapets: rows of quatrefoils
      for (const s of [-1, 1]) {
        B.box(0.05, 0.04, L, { x: s * 0.33, y: 0.36, color: '#efe6d6' });
        B.box(0.05, 0.04, L, { x: s * 0.33, y: 0.66, color: '#efe6d6' });
        const n = Math.floor(L / 0.25);
        for (let k = 0; k < n; k++) {
          const zz = -L / 2 + (k + 0.5) * L / n;
          for (let q = 0; q < 4; q++) {
            const a = q * Math.PI / 2;
            B.geo(new THREE.TorusGeometry(0.045, 0.011, 4, 10), { x: s * 0.33, y: 0.51 + Math.sin(a) * 0.045, z: zz + Math.cos(a) * 0.045, ry: Math.PI / 2, color: '#efe6d6', mat: M.smooth });
          }
          B.prism(0, 0.03, 0.12, 4, { x: s * 0.33, y: 0.68, z: zz, color: '#efe6d6', mat: M.flat });
        }
      }
      B.pop();
    },
    draw(B, o) {
      B.push({ x: o.x, y: LAND - 0.02, z: o.z, ry: o.ry });
      const L = o.L;
      B.box(0.7, 0.07, L * 0.45, { y: 0.12, z: -L * 0.27, color: '#7a5a3e', mat: M.wood });
      // the raised leaf
      B.box(0.7, 0.07, L * 0.48, { y: 0.12 + Math.sin(0.9) * L * 0.24, z: L * 0.03 + (1 - Math.cos(0.9)) * 0 + L * 0.24 * Math.cos(0.9) - 0.02, rx: -0.9, color: '#7a5a3e', mat: M.wood });
      for (const s of [-1, 1]) {
        B.box(0.07, 1.5, 0.07, { x: s * 0.4, z: 0.0, color: '#efe6d6', mat: M.wood });
        B.box(0.07, 0.07, 1.2, { x: s * 0.4, y: 1.5, z: 0.2, color: '#efe6d6', mat: M.wood });
      }
      B.box(0.87, 0.07, 0.07, { y: 1.5, z: -0.35, color: '#efe6d6', mat: M.wood });
      B.box(0.87, 0.07, 0.07, { y: 1.5, z: 0.75, color: '#efe6d6', mat: M.wood });
      for (const s of [-1, 1]) B.cyl(0.006, 0.006, 1.1, { x: s * 0.4, y: 0.42, z: 0.75, color: '#3a3430', seg: 3 });
      B.box(0.9, 0.5, 0.25, { y: -0.4, z: -L * 0.05, color: '#e3d8c2' });
      B.pop();
    },
  };
  const bridgeSites = [];
  for (const [kind, x] of Object.entries(bridgesX)) {
    const o = across(x);
    BR[kind](kind === 'hump' ? keep : b, o);
    bridgeSites.push({ x: o.x, z: o.z, kind });
  }
  // two bridges across the cross canal
  for (const [kind, z] of [['tracery', -5.6], ['draw', 5.9]]) {
    const x = xc(z);
    const slope = (xc(z + 0.01) - xc(z - 0.01)) / 0.02;
    BR[kind](b, { x, z, ry: Math.atan2(1, -slope) + Math.PI, L: 2 * HW2 + 0.5 });
    bridgeSites.push({ x, z, kind, cross: true });
  }

  // ---------------------------------------------------------------- façades along both canals, in two stepped rows
  const facades = [];
  const occupied = [];
  const free = (x, z, r) => !occupied.some(([ox, oz, or]) => Math.hypot(ox - x, oz - z) < r + or);
  const rowsAlong = (cross) => {
    for (const side of [-1, 1]) for (let row = 0; row < 2; row++) {
      let t = -9.8;
      while (t < 9.8) {
        const w = rng.range(1.0, 1.6);
        const ct = t + w / 2;
        t += w + rng.range(0.03, 0.15);
        // centre line point and normal
        let cx, cz, nx, nz;
        if (!cross) {
          cx = ct; cz = zc(ct);
          const sl = (zc(ct + 0.01) - zc(ct - 0.01)) / 0.02, l = Math.hypot(sl, 1);
          nx = -sl / l * side; nz = 1 / l * side;
        } else {
          cz = ct; cx = xc(ct);
          const sl = (xc(ct + 0.01) - xc(ct - 0.01)) / 0.02, l = Math.hypot(sl, 1);
          nx = 1 / l * side; nz = -sl / l * side;
        }
        const d = 1.3;
        const off = (cross ? HW2 : HW) + 0.42 + d / 2 + row * (d + 0.42);
        const px = cx + nx * off, pz = cz + nz * off;
        if (Math.hypot(px, pz) > 9.7 - d / 2) continue;
        if (canalD(px, pz) < d * 0.5 + 0.38) continue;
        if (bridgeSites.some((s) => Math.hypot(s.x - px, s.z - pz) < w / 2 + 1.5)) continue;
        const rad = Math.max(w, d) * 0.5;
        if (!free(px, pz, rad)) continue;
        occupied.push([px, pz, rad]);
        const ry = Math.atan2(-nx, -nz);
        const h = row === 0 ? rng.range(1.3, 2.0) : rng.range(1.9, 2.9);
        facades.push({ px, pz, ry, w, h, d, side, cx: ct, row, cross });
      }
    }
  };
  rowsAlong(false);
  rowsAlong(true);
  // the habitual route: from a door on the south bank, along the quay, over the humpbacked bridge,
  // along the north quay, into a calle, to a little square with a well
  const hb = bridgeSites.find((s) => s.kind === 'hump');
  const startF = facades.filter((f) => f.side === 1 && f.row === 0 && !f.cross).sort((a, c) => Math.abs(a.cx - (hb.x - 2.2)) - Math.abs(c.cx - (hb.x - 2.2)))[0];
  const endF = facades.filter((f) => f.side === -1 && f.row === 0 && !f.cross).sort((a, c) => Math.abs(a.cx - (hb.x + 2.4)) - Math.abs(c.cx - (hb.x + 2.4)))[0];
  for (const f of facades) {
    const isRoute = f === startF || f === endF;
    palazzo(isRoute ? keep : b, f.px, f.pz, f.ry, f.w, f.h, f.d, rng.pick(STYLES), rng.pick(walls), rng.pick(roofs), isRoute ? 0.7 : 0.3);
  }
  // back rows: smaller houses filling the islands
  const back = [];
  for (let t = 0; t < 4000 && back.length < 30; t++) {
    const [x, z] = rng.inDisc(9.4);
    if (canalD(x, z) < 1.2) continue;
    if (!free(x, z, 0.75)) continue;
    occupied.push([x, z, 0.6]);
    back.push([x, z]);
  }
  for (const [x, z] of back) {
    const ry = rng.range(-0.2, 0.2) + Math.atan2(x, z);
    palazzo(b, x, z, ry, rng.range(0.8, 1.1), rng.range(1.2, 2.0), 0.9, rng.pick(STYLES), rng.pick(walls), rng.pick(roofs), 0.2);
  }

  // the route itself: lamps and a soft lit paving line
  const route = [];
  {
    const sOff = HW + 0.22;
    const pS = (x) => [x, zc(x) + sOff];
    const pN = (x) => [x, zc(x) - sOff];
    const nS = [startF.px - Math.sin(startF.ry) * 0.0, startF.pz];
    route.push([startF.cx, zc(startF.cx) + sOff]);
    for (let x = startF.cx; x < hb.x; x += 0.25) route.push(pS(x));
    route.push(pS(hb.x), pN(hb.x));
    for (let x = hb.x; x < endF.cx; x += 0.25) route.push(pN(x));
    route.push(pN(endF.cx));
    for (let i = 0; i < route.length - 1; i += 1) {
      const [x0, z0] = route[i], [x1, z1] = route[i + 1];
      if (Math.hypot(x1 - x0, z1 - z0) > 1.0) continue; // bridge span
      keep.box(0.24, 0.012, Math.hypot(x1 - x0, z1 - z0) + 0.02, { x: (x0 + x1) / 2, y: LAND + 0.004, z: (z0 + z1) / 2, ry: Math.atan2(x1 - x0, z1 - z0), color: '#e6c88a' });
    }
    for (let i = 0; i < route.length; i += 4) {
      const [x, z] = route[i];
      keep.cyl(0.015, 0.02, 0.55, { x, y: LAND, z, color: C.charcoal, seg: 5 });
      keep.sphere(0.045, { x, y: LAND + 0.58, z, mat: M.glow, color: C.lamp, glow: 2.4, seg: 6 });
    }
  }

  // gondolas and moored boats (fade with the rest)
  for (let i = 0; i < 8; i++) {
    const x = rng.range(-8.5, 8.5);
    if (bridgeSites.some((s) => Math.abs(s.x - x) < 0.8)) continue;
    const z = zc(x) + rng.pick([-1, 1]) * rng.range(0.5, 0.75);
    const slope = (zc(x + 0.01) - zc(x - 0.01)) / 0.02;
    b.geo(new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), { x, y: WATER + 0.06, z, sx: 0.5, sy: 0.08, sz: 0.11, ry: -Math.atan(slope), color: '#1f1c1c', mat: M.wood });
  }

  // ---------------------------------------------------------------- assemble: faded copy vs. kept route
  const fb = b.build();
  fb.traverse((o) => { if (o.isMesh) o.material = fadeMat(o.material); });
  object.add(fb);
  object.add(keep.build());

  // the one who walks the habitual route
  const walker = new THREE.Group();
  {
    const wb = new Builder();
    wb.cone(0.07, 0.25, { color: accent, seg: 6 });
    wb.sphere(0.042, { y: 0.29, color: '#d7b08c', seg: 6 });
    walker.add(wb.build());
  }
  object.add(walker);
  const routeV = route.map(([x, z]) => new THREE.Vector3(x, LAND, z));
  // lift the bridge part
  const curve = new THREE.CatmullRomCurve3(routeV, false, 'centripetal');
  const cl = curve.getLength();
  const tmp = new THREE.Vector3();

  const waterBase = new THREE.Color('#3f7d86');
  function update(t) {
    // arrival (vivid) -> staying (fading) -> blank -> a new arrival
    const P = 34, u = (t % P);
    let f;
    if (u < 5) f = 0;
    else if (u < 19) f = smooth01((u - 5) / 14);
    else if (u < 29) f = 1;
    else f = 1 - smooth01((u - 29) / 5);
    fadeU.value = f * 0.93;
    waterMat.color.copy(waterBase).lerp(paper, f * 0.9);
    // walker goes to and fro along the route
    const w = ((t * 0.32) / cl) % 2;
    const s = w < 1 ? w : 2 - w;
    curve.getPointAt(s, tmp);
    // over the humpbacked bridge, climb
    const dx = tmp.x - hb.x;
    const onBridge = Math.abs(tmp.z - zc(tmp.x)) < HW + 0.25 && Math.abs(dx) < 0.6;
    const lift = onBridge ? 0.75 * Math.cos(((tmp.z - zc(tmp.x)) / (HW + 0.25)) * Math.PI / 2) : 0;
    walker.position.set(tmp.x, LAND + Math.max(0, lift), tmp.z);
    curve.getPointAt(Math.min(1, s + 0.002), tmp);
    walker.rotation.y = Math.atan2(tmp.x - walker.position.x, tmp.z - walker.position.z);
  }
  update(0);
  return { object, update };
}
