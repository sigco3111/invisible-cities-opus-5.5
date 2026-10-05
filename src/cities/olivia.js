// Olivia — the words say filigree palaces, fringed cushions, a peacock opening
// its tail. The things say soot. In front: a crescent of gilded façades around a
// garden where a peacock spreads its tail. Behind them (walk round and see the
// props holding them up) the factories roar and the chimneys belch black smoke.
import { THREE, Builder, M, C, tree, column } from '../kit.js';
import { setInst, figure } from './_ab_util.js';

const GOLD = '#e2b354', IVORY = '#f5ead3', SOOT = '#37322f', BRICK = '#7b4232', BRICK2 = '#5f3a2e';

export default function build({ rng, accent }) {
  // gilt: warm, softly glowing gold that reads even in the dusk shade
  const GILT = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.32, metalness: 0.5, emissive: new THREE.Color('#6b4510'), emissiveIntensity: 0.55 });
  const b = new Builder();
  const object = new THREE.Group();
  const PC = { x: 1.9, z: 4.9 }, PS = 1.6; // the peacock's place

  /* --------------------------------------------------------- ground -- */
  b.cyl(10.4, 10.45, 0.1, { color: SOOT, seg: 72 });
  // the garden: a pale marble crescent in front of the façades
  const frontZ = (x) => 1.3 + 0.075 * x * x; // the façade line
  {
    const pts = [];
    for (let i = 0; i <= 40; i++) { const x = -9.4 + (18.8 * i) / 40; pts.push([x, frontZ(x) + 0.25]); }
    for (let i = 0; i <= 40; i++) { const a = Math.PI * (i / 40); pts.push([Math.cos(a) * 10.3, Math.sqrt(Math.max(0, 10.3 ** 2 - (Math.cos(a) * 10.3) ** 2))]); }
    // order: along the façade (left→right), then the rim back (right→left)
    const rim = [];
    for (let i = 0; i <= 40; i++) { const a = (Math.PI * i) / 40; rim.push([Math.cos(a) * 10.3, Math.sin(a) * 10.3]); }
    const poly = [];
    for (let i = 0; i <= 40; i++) { const x = -9.4 + (18.8 * i) / 40; poly.push([x, Math.min(frontZ(x) + 0.2, Math.sqrt(Math.max(0, 10.3 ** 2 - x * x)))]); }
    for (const p of rim) if (p[1] > frontZ(p[0]) + 0.2) poly.push(p);
    b.slab(poly, 0.05, { y: 0.1, color: '#efe6d4', mat: M.smooth });
    void pts;
  }
  // parterres, paths, cypresses, a fountain
  for (const [x, z, w, d] of [[-4.2, 6.6, 2.4, 1.2], [4.2, 6.6, 2.4, 1.2], [-6.4, 4.6, 1.4, 1.0], [6.4, 4.6, 1.4, 1.0], [-2.4, 8.6, 1.6, 0.6], [2.4, 8.6, 1.6, 0.6]]) {
    b.box(w, 0.12, d, { x, y: 0.15, z, color: '#6f8f55', mat: M.stone });
    b.box(w + 0.08, 0.08, d + 0.08, { x, y: 0.15, z, color: GOLD, mat: GILT });
    for (let k = 0; k < 5; k++) b.sphere(0.06, { x: x + rng.range(-w / 2 + 0.1, w / 2 - 0.1), y: 0.3, z: z + rng.range(-d / 2 + 0.1, d / 2 - 0.1), color: rng.pick(['#e889a8', '#f2d14b', '#ffffff', '#c8433a']), mat: M.smooth, seg: 6 });
  }
  for (const [x, z] of [[-1.6, 4.4], [1.6, 4.4], [-7.6, 6.0], [7.6, 6.0], [-5.0, 8.4], [5.0, 8.4], [-8.8, 3.2], [8.8, 3.2]]) tree(b, { x, y: 0.15, z, h: 1.6, kind: 'cypress', r: rng });
  // the fountain
  {
    const x = 0, z = 7.4;
    b.cyl(1.1, 1.15, 0.25, { x, y: 0.15, z, color: IVORY, mat: M.smooth, seg: 28 });
    b.cyl(1.0, 1.0, 0.02, { x, y: 0.38, z, color: '#8cc2c9', mat: M.water, seg: 28 });
    b.lathe([[0.12, 0], [0.08, 0.5], [0.45, 0.6], [0.5, 0.66], [0.06, 0.7], [0.05, 1.0], [0.18, 1.05], [0.02, 1.15]], { x, y: 0.38, z, color: GOLD, mat: GILT, seg: 16 });
    b.torus(1.12, 0.04, { x, y: 0.41, z, rx: Math.PI / 2, color: GOLD, mat: GILT, tseg: 36, rseg: 4 });
  }
  // fine people promenading
  for (let i = 0; i < 22; i++) {
    const [x, z] = rng.inDisc(9.5);
    if (z < frontZ(x) + 0.6 || Math.hypot(x, z - 7.4) < 1.4 || Math.hypot(x - PC.x, z - PC.z) < 2.0) continue;
    figure(b, { x, y: 0.15, z, h: 0.34, color: rng.pick(['#f4efe2', '#e889a8', accent, '#c8433a', '#7a5a9a', GOLD]), ry: rng.range(0, 6) });
    if (rng.chance(0.3)) b.cone(0.13, 0.08, { x, y: 0.5, z, seg: 10, color: rng.pick(['#f4efe2', '#e889a8']), mat: M.cloth });
  }

  /* ---------------------------------------- the gilded façades -- */
  const facades = [[-7.1, 2.0, 2.9], [-4.4, 2.9, 3.9], [-0.9, 3.8, 5.4], [2.7, 2.9, 4.1], [5.6, 2.6, 3.4], [7.9, 1.6, 2.6]];
  const T = 0.14; // the façades are thin as stage flats
  for (const [fx, W, Hh] of facades) {
    const fz = frontZ(fx);
    const slope = 0.15 * fx; // derivative of frontZ
    const ry = -Math.atan(slope);
    b.push({ x: fx, y: 0.1, z: fz, ry });
    // ground arcade: piers and arches (open: you glimpse the soot through them)
    const nA = Math.max(3, Math.round(W / 0.55));
    const bay = W / nA;
    const aH = 0.95;
    for (let i = 0; i <= nA; i++) {
      const x = -W / 2 + i * bay;
      b.box(0.1, aH, T, { x, color: IVORY, mat: M.smooth });
      column(b, { x, y: 0, z: T / 2 + 0.05, r: 0.035, h: aH - 0.02, color: GOLD, mat: GILT });
    }
    for (let i = 0; i < nA; i++) {
      const x = -W / 2 + (i + 0.5) * bay;
      b.torus(bay / 2 - 0.05, 0.03, { x, y: aH - bay / 2 + 0.05, z: T / 2 + 0.02, color: GOLD, mat: GILT, arc: Math.PI, tseg: 12, rseg: 4 });
      // spandrel
      b.box(bay, 0.12, T, { x, y: aH - 0.02, color: IVORY, mat: M.smooth });
    }
    // upper body
    const upH = Hh - aH - 0.4;
    b.box(W, upH, T, { y: aH + 0.1, color: IVORY, mat: M.smooth });
    b.box(W + 0.12, 0.1, T + 0.12, { y: aH + 0.05, color: GOLD, mat: GILT });
    // windows: gold-framed loggias with fringed cushions on the seats
    const nW = Math.max(2, Math.round(W / 0.5));
    const floors = Math.max(1, Math.floor(upH / 0.9));
    for (let f = 0; f < floors; f++) for (let i = 0; i < nW; i++) {
      const x = -W / 2 + (i + 0.5) * (W / nW);
      const y = aH + 0.25 + f * 0.9;
      const lit = rng.chance(0.55);
      b.quad(0.22, 0.42, { x, y: y + 0.25, z: T / 2 + 0.006, color: lit ? '#ffd28a' : '#4a3a35', mat: lit ? M.glow : M.smooth, glow: 1.3 });
      b.torus(0.11, 0.018, { x, y: y + 0.46, z: T / 2 + 0.02, color: GOLD, mat: GILT, arc: Math.PI, tseg: 10, rseg: 3 });
      b.box(0.02, 0.42, 0.03, { x: x - 0.12, y: y + 0.04, z: T / 2 + 0.02, color: GOLD, mat: GILT });
      b.box(0.02, 0.42, 0.03, { x: x + 0.12, y: y + 0.04, z: T / 2 + 0.02, color: GOLD, mat: GILT });
      // the little balcony and its cushion
      b.box(0.3, 0.03, 0.14, { x, y: y + 0.02, z: T / 2 + 0.07, color: GOLD, mat: GILT });
      for (let k = 0; k < 4; k++) b.box(0.012, 0.1, 0.012, { x: x - 0.12 + k * 0.08, y: y + 0.05, z: T / 2 + 0.13, color: GOLD, mat: GILT });
      if (rng.chance(0.6)) {
        b.box(0.18, 0.05, 0.08, { x, y: y + 0.06, z: T / 2 + 0.06, color: rng.pick([accent, '#c8433a', '#7a5a9a', '#e889a8', '#3f6fb5']), mat: M.cloth });
        for (let k = 0; k < 5; k++) b.cone(0.008, 0.04, { x: x - 0.08 + k * 0.04, y: y + 0.02, z: T / 2 + 0.1, rx: Math.PI, color: GOLD, mat: GILT, seg: 3 });
      }
    }
    // filigree: rows of tiny gold quatrefoils between floors
    for (let f = 1; f < floors; f++) for (let i = 0; i < nW * 2; i++) {
      b.torus(0.04, 0.008, { x: -W / 2 + (i + 0.5) * (W / (nW * 2)), y: aH + 0.18 + f * 0.9, z: T / 2 + 0.01, color: GOLD, mat: GILT, tseg: 8, rseg: 3 });
    }
    // crown: cornice, balustrade, finials, half-domes (open at the back)
    const top = aH + 0.1 + upH;
    b.box(W + 0.16, 0.12, T + 0.16, { y: top, color: GOLD, mat: GILT });
    for (let i = 0; i <= Math.round(W / 0.12); i++) b.cyl(0.018, 0.025, 0.18, { x: -W / 2 + i * 0.12, y: top + 0.12, z: 0.04, color: IVORY, mat: M.smooth, seg: 5 });
    b.box(W + 0.1, 0.04, 0.12, { y: top + 0.3, z: 0.04, color: IVORY, mat: M.smooth });
    for (const sx of [-1, 1]) {
      b.cone(0.07, 0.4, { x: sx * W / 2, y: top + 0.34, seg: 8, color: GOLD, mat: GILT });
      b.sphere(0.05, { x: sx * W / 2, y: top + 0.78, color: GOLD, mat: GILT, seg: 6 });
    }
    const dr = Math.min(W * 0.3, 1.1);
    b.geo(new THREE.CylinderGeometry(dr * 0.9, dr * 0.9, 0.35, 20, 1, false, -Math.PI / 2, Math.PI), { y: top + 0.12 + 0.175, color: IVORY, mat: M.smooth });
    b.geo(new THREE.SphereGeometry(dr, 22, 10, 0, Math.PI, 0, Math.PI / 2), { y: top + 0.47, sy: 1.25, color: GOLD, mat: GILT });
    // lantern spike on the dome
    b.cyl(0.02, 0.05, 0.4, { y: top + 0.47 + dr * 1.2, color: GOLD, mat: GILT, seg: 6 });
    b.sphere(0.06, { y: top + 0.9 + dr * 1.2, color: GOLD, mat: GILT, seg: 8 });
    // the truth behind: raking props and posts holding the flat up
    for (let i = 0; i < 3; i++) {
      const x = -W / 2 + 0.2 + i * (W - 0.4) / 2;
      b.beam([x, top * 0.85, -T / 2 - 0.03], [x, 0, -T / 2 - Math.max(1.3, top * 0.45)], 0.07, { color: '#5e4a3a', mat: M.wood });
      b.beam([x, top * 0.4, -T / 2 - 0.03], [x, top * 0.4, -T / 2 - Math.max(1.3, top * 0.45) * 0.55], 0.05, { color: '#5e4a3a', mat: M.wood });
      b.box(0.25, 0.12, 0.25, { x, y: 0, z: -T / 2 - Math.max(1.3, top * 0.45), color: '#4a3f38', mat: M.stone });
    }
    b.box(W, Hh - 0.4, 0.02, { y: 0.1, z: -T / 2 - 0.012, color: '#9b8f80', mat: M.wood }); // raw timber back
    b.pop();
  }

  /* ------------------------------------------- the soot city behind -- */
  const behind = (x, z) => z < frontZ(x) - 1.0 && x * x + z * z < 9.9 * 9.9;
  // factory halls with sawtooth roofs and furnace glow
  const halls = [];
  for (let t = 0; t < 2000 && halls.length < 14; t++) {
    const [x, z] = rng.inDisc(9.0);
    const w = rng.range(1.4, 2.6), d = rng.range(1.2, 2.0);
    if (!behind(x - w / 2, z + d / 2) || !behind(x + w / 2, z + d / 2) || !behind(x, z - d / 2)) continue;
    if (halls.some((h) => Math.abs(h.x - x) < (h.w + w) / 2 + 0.25 && Math.abs(h.z - z) < (h.d + d) / 2 + 0.25)) continue;
    halls.push({ x, z, w, d, h: rng.range(1.2, 2.6) });
  }
  for (const H of halls) {
    const col = rng.pick([BRICK, BRICK2, '#5a5350', '#6b4436']);
    b.box(H.w, H.h, H.d, { x: H.x, y: 0.1, z: H.z, color: col, mat: M.stone });
    const n = Math.max(2, Math.round(H.w / 0.6));
    for (let i = 0; i < n; i++) {
      const s = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(H.w / n, 0), new THREE.Vector2(0, 0.45)]);
      const g = new THREE.ExtrudeGeometry(s, { depth: H.d, bevelEnabled: false }); g.translate(0, 0, -H.d / 2);
      b.geo(g, { x: H.x - H.w / 2 + (i * H.w) / n, y: 0.1 + H.h, z: H.z, color: '#3e3a39', mat: M.flat });
      b.quad(H.d * 0.9, 0.36, { x: H.x - H.w / 2 + (i * H.w) / n + 0.012, y: 0.1 + H.h + 0.2, z: H.z, ry: -Math.PI / 2, color: '#ff8a3a', mat: M.glow, glow: 1.3 });
    }
    // furnace doors glowing on the front
    for (let i = 0; i < Math.round(H.w / 0.7); i++) if (rng.chance(0.6)) b.quad(0.3, 0.35, { x: H.x - H.w / 2 + 0.35 + i * 0.7, y: 0.35, z: H.z + H.d / 2 + 0.01, color: '#ff7a2a', mat: M.glow, glow: 2.2 });
    // grimy windows on the side
    for (let i = 0; i < Math.round(H.d / 0.5); i++) b.quad(0.2, 0.3, { x: H.x + H.w / 2 + 0.01, y: 0.1 + H.h * 0.6, z: H.z - H.d / 2 + 0.25 + i * 0.5, ry: Math.PI / 2, color: rng.chance(0.5) ? '#ffa860' : '#2a2626', mat: rng.chance(0.5) ? M.glow : M.smooth, glow: 1.2 });
  }
  // gasometer
  {
    const x = -5.2, z = -5.6, r = 1.25;
    b.cyl(r * 0.95, r * 0.95, 2.4, { x, y: 0.1, z, color: '#4e4a48', mat: M.rough_metal, seg: 24 });
    b.dome(r * 0.95, { x, y: 2.5, z, sy: 0.25, color: '#5a5654', mat: M.rough_metal, seg: 24 });
    for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2; b.cyl(0.04, 0.04, 3.0, { x: x + Math.cos(a) * r * 1.08, y: 0.1, z: z + Math.sin(a) * r * 1.08, color: '#2f2c2b', mat: M.rough_metal, seg: 5 }); }
    for (const y of [1.1, 2.1, 3.0]) b.torus(r * 1.08, 0.03, { x, y, z, rx: Math.PI / 2, color: '#2f2c2b', mat: M.rough_metal, tseg: 36, rseg: 4 });
  }
  // coal heaps and a railway with wagons
  for (let i = 0; i < 6; i++) {
    const [x, z] = rng.inDisc(9.2);
    if (!behind(x, z) || halls.some((h) => Math.abs(h.x - x) < h.w / 2 + 0.6 && Math.abs(h.z - z) < h.d / 2 + 0.6)) continue;
    b.cone(rng.range(0.5, 0.9), rng.range(0.4, 0.8), { x, y: 0.1, z, seg: 9, color: '#1f1d1e', mat: M.flat });
  }
  {
    const z0 = -8.0;
    for (const dz of [-0.18, 0.18]) b.box(9.6, 0.03, 0.04, { x: 0, y: 0.12, z: z0 + dz, color: '#6f6a66', mat: M.metal });
    for (let x = -4.8; x < 4.8; x += 0.3) b.box(0.08, 0.02, 0.5, { x, y: 0.1, z: z0, color: '#3d2f26', mat: M.wood });
    for (let i = 0; i < 5; i++) {
      const x = -3.2 + i * 1.2;
      b.box(1.0, 0.45, 0.55, { x, y: 0.2, z: z0, color: '#3a3433', mat: M.rough_metal });
      b.cone(0.38, 0.22, { x, y: 0.65, z: z0, sx: 1.3, seg: 7, color: '#141314', mat: M.flat });
      for (const wx of [-0.3, 0.3]) for (const wz of [-0.28, 0.28]) b.cyl(0.1, 0.1, 0.05, { x: x + wx, y: 0.2, z: z0 + wz, rx: Math.PI / 2, color: '#222', mat: M.metal, seg: 8 });
    }
  }
  // a tangle of pipes on gantries between the halls
  for (let i = 0; i < 8; i++) {
    const a = halls[i % halls.length], c = halls[(i * 3 + 1) % halls.length];
    if (!a || !c || a === c) continue;
    const y = Math.min(a.h, c.h) + 0.1 - 0.2;
    b.rod([a.x, y, a.z], [c.x, y, c.z], 0.06, { color: '#5b5552', mat: M.rough_metal, seg: 6 });
  }
  // workers, small and dark
  for (let i = 0; i < 18; i++) {
    const [x, z] = rng.inDisc(9.3);
    if (!behind(x, z) || halls.some((h) => Math.abs(h.x - x) < h.w / 2 + 0.1 && Math.abs(h.z - z) < h.d / 2 + 0.1)) continue;
    figure(b, { x, y: 0.1, z, h: 0.3, color: rng.pick(['#2c2a2a', '#3d3a38', '#4a4038']), ry: rng.range(0, 6), arms: rng.chance(0.3) ? 0.5 : 0 });
  }
  // the chimneys
  const stacks = [[-6.4, -2.6, 9.0], [-2.8, -4.2, 11.5], [-0.4, -1.4, 8.4], [1.8, -6.3, 10.2], [3.9, -2.4, 9.4], [6.3, -4.4, 8.0], [-3.8, -8.6, 7.2], [0.9, -3.9, 12.6]];
  const tops = [];
  for (const [x, z, h] of stacks) {
    if (!behind(x, z)) continue;
    const r = 0.22 + h * 0.012;
    b.cyl(r * 0.75, r, h, { x, y: 0.1, z, color: rng.pick([BRICK, BRICK2]), mat: M.stone, seg: 12 });
    for (let y = 1.5; y < h - 0.5; y += 1.6) b.cyl(r * 0.92, r * 0.92, 0.08, { x, y: 0.1 + y, z, color: '#2e2a29', mat: M.stone, seg: 12 });
    b.cyl(r * 0.95, r * 0.8, 0.3, { x, y: 0.1 + h, z, color: '#1e1c1c', mat: M.stone, seg: 12 });
    b.box(r * 2.6, 0.4, r * 2.6, { x, y: 0.1, z, color: '#4b3b34', mat: M.stone });
    tops.push([x, 0.1 + h + 0.3, z, r]);
  }

  object.add(b.build());

  /* ------------------------------------------------ smoke (animated) -- */
  const K = 30;
  // soft sooty puffs: per-instance alpha (aAlpha) so each puff thins out as it grows
  const smokeMat = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, depthWrite: false, emissive: new THREE.Color('#1a120c') });
  const puffGeo = new THREE.IcosahedronGeometry(1, 2);
  const alpha = new THREE.InstancedBufferAttribute(new Float32Array(tops.length * K), 1);
  puffGeo.setAttribute('aAlpha', alpha);
  smokeMat.onBeforeCompile = (sh) => {
    sh.vertexShader = 'attribute float aAlpha;\nvarying float vAlpha;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvAlpha = aAlpha;');
    sh.fragmentShader = 'varying float vAlpha;\n' + sh.fragmentShader.replace('#include <dithering_fragment>', '#include <dithering_fragment>\ngl_FragColor.a *= vAlpha;');
  };
  smokeMat.customProgramCacheKey = () => 'olivia-smoke';
  const smoke = new THREE.InstancedMesh(puffGeo, smokeMat, tops.length * K);
  smoke.frustumCulled = false;
  smoke.castShadow = false;
  smoke.renderOrder = 2;
  smoke.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(tops.length * K * 3), 3);
  const seeds = [];
  for (let i = 0; i < tops.length * K; i++) seeds.push([rng.range(-1, 1), rng.range(-1, 1), rng.range(0.85, 1.15), rng.range(0, 6.28)]);
  object.add(smoke);

  /* ------------------------------------------- the peacock (animated) -- */
  {
    const pb = new Builder();
    pb.box(0.6, 0.1, 0.6, { y: 0.15, color: IVORY, mat: M.smooth }); // a small marble dais
    pb.push({ y: 0.25 });
    pb.sphere(0.16, { y: 0.26, sz: 1.5, color: '#1f5f8b', mat: M.smooth, seg: 12 });
    pb.rod([0, 0.3, 0.16], [0, 0.6, 0.24], 0.045, { color: '#1d6fa0', mat: M.smooth, seg: 8, r2: 0.06 });
    pb.sphere(0.06, { y: 0.63, z: 0.26, color: '#1d6fa0', mat: M.smooth, seg: 10 });
    pb.cone(0.02, 0.07, { y: 0.61, z: 0.33, rx: Math.PI / 2, color: '#d9c08a', mat: M.smooth, seg: 5 });
    for (let k = -2; k <= 2; k++) { pb.rod([0, 0.67, 0.25], [k * 0.025, 0.78, 0.23], 0.004, { color: '#1d6fa0', seg: 3 }); pb.sphere(0.012, { x: k * 0.025, y: 0.78, z: 0.23, color: '#2fa58f', mat: M.smooth, seg: 4 }); }
    for (const s of [-1, 1]) pb.rod([s * 0.05, 0.14, 0.02], [s * 0.05, 0, 0.04], 0.012, { color: '#a08060', mat: M.smooth, seg: 4 });
    pb.sphere(0.12, { y: 0.27, z: -0.08, sx: 1.25, sy: 0.7, sz: 1.4, color: '#7a6a3f', mat: M.smooth, seg: 10 }); // wings
    pb.pop();
    const g = pb.build();
    g.position.set(PC.x, 0, PC.z);
    g.scale.setScalar(PS);
    g.rotation.y = 0.5;
    object.add(g);
  }
  const NF = 31;
  const feather = (() => {
    const fb = new Builder();
    fb.cyl(0.006, 0.01, 1.0, { color: '#c9b37a', mat: M.smooth, seg: 3 });
    fb.geo(new THREE.CircleGeometry(1, 10), { y: 0.82, sx: 0.085, sy: 0.2, z: 0.005, color: '#2f8a5a', mat: M.smooth });
    fb.geo(new THREE.CircleGeometry(1, 10), { y: 0.86, sx: 0.06, sy: 0.08, z: 0.012, color: '#d9b44a', mat: M.smooth });
    fb.geo(new THREE.CircleGeometry(1, 10), { y: 0.865, sx: 0.035, sy: 0.045, z: 0.018, color: '#1a3f8f', mat: M.smooth });
    fb.geo(new THREE.CircleGeometry(1, 8), { y: 0.87, sx: 0.016, sy: 0.02, z: 0.022, color: '#101a30', mat: M.smooth });
    fb.geo(new THREE.CircleGeometry(1, 10), { y: 0.45, sx: 0.045, sy: 0.38, z: 0.003, color: '#3f7f4f', mat: M.smooth });
    return fb.build().children[0].geometry;
  })();
  const fmat = M.smooth.clone();
  fmat.side = THREE.DoubleSide;
  const tail = new THREE.InstancedMesh(feather, fmat, NF);
  tail.frustumCulled = false;
  tail.castShadow = true;
  const tailG = new THREE.Group();
  tailG.position.set(PC.x - Math.sin(0.5) * 0.16 * PS, (0.25 + 0.3) * PS, PC.z - Math.cos(0.5) * 0.16 * PS);
  tailG.scale.setScalar(PS);
  tailG.rotation.y = 0.5;
  tailG.add(tail);
  object.add(tailG);
  const flen = [];
  for (let i = 0; i < NF; i++) flen.push(1.05 - 0.35 * Math.abs(i / (NF - 1) - 0.5) * 2 + rng.range(-0.05, 0.05));

  const _c = new THREE.Color();
  const update = (t) => {
    // smoke
    for (let s = 0; s < tops.length; s++) {
      const [x, y, z, r] = tops[s];
      for (let k = 0; k < K; k++) {
        const i = s * K + k;
        const sd = seeds[i];
        const u = ((t * 0.04 * sd[2] + k / K + s * 0.13) % 1 + 1) % 1;
        // rise steeply out of the stack, then bend over and smear across the façades
        const rise = 2.4 * Math.sqrt(u) + 0.4 * u;
        const drift = Math.pow(u, 1.3) * 6.5;
        const px = x + drift * 0.25 + sd[0] * u * 1.6 + Math.sin(t * 0.25 + sd[3]) * 0.2 * u;
        const pz = z + drift * 0.9 + sd[1] * u * 1.0;
        const grow = r * 1.1 + u * 2.2 * sd[2];
        setInst(smoke, i, px, y + rise - u * u * 3.2, pz, grow * 1.15, sd[3], sd[0] * 0.3, 0, grow * 0.5);
        // dense at the mouth, thinning to nothing
        alpha.array[i] = 0.34 * Math.min(1, u * 5) * Math.pow(1 - u, 1.6);
        const g = 0.16 + u * 0.22;
        _c.setRGB(g * 1.1, g * 0.92, g * 0.78);
        smoke.setColorAt(i, _c);
      }
    }
    smoke.instanceMatrix.needsUpdate = true;
    smoke.instanceColor.needsUpdate = true;
    alpha.needsUpdate = true;
    // peacock: the tail opens into a shimmering fan, holds, folds again
    const c = (t * 0.06) % 1;
    let o = c < 0.25 ? c / 0.25 : c < 0.75 ? 1 : 1 - (c - 0.75) / 0.25;
    o = o * o * (3 - 2 * o);
    for (let i = 0; i < NF; i++) {
      const f = i / (NF - 1) - 0.5;
      const fan = f * Math.PI * (0.25 + 0.75 * o);
      const tilt = -(1.45 - 1.25 * o) - Math.abs(f) * 0.15 * o; // lie back when closed, stand up when open
      const quiver = o * Math.sin(t * 9 + i) * 0.015;
      setInst(tail, i, 0, 0, 0, 1, 0, tilt, fan + quiver, flen[i]);
    }
    tail.instanceMatrix.needsUpdate = true;
  };
  update(0);
  return { object, update };
}
