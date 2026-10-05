// LEANDRA — the household gods.
// A ring of dolls' houses with their fronts cut away and their roofs lifted like
// lids. Inside, too small to see and too many to count: the Penates (gold) crowd by
// the front doors and coat racks; the Lares (sea-green) live under pots, up the
// chimney flue, in the broom cupboard. At night the two kinds flicker back and forth
// in their argument. Along the road a family moves house with a handcart — and its
// Penates hop along behind, while the Lares stay in the house that is left empty.
import { THREE, Builder, M, C, tree } from '../kit.js';
import { figure, geoOf, warmLit } from './_d_kit.js';

const GOLD = new THREE.Color('#ffc75e');
const TEAL = new THREE.Color('#4fe3c1');

export default function build({ rng, accent }) {
  const b = new Builder();
  const object = new THREE.Group();

  /* ---------- ground: lawn, a cobbled plaza with a lane, the little fountain ---------- */
  const CAM = Math.atan2(0.88, 0.48); // the side the viewer usually stands on
  b.cyl(10.45, 10.45, 0.06, { color: '#86955f', seg: 64 });
  b.cyl(4.6, 4.6, 0.03, { y: 0.06, color: '#cdb996', seg: 48 });
  for (let i = 0; i < 300; i++) {
    const a = rng.range(0, Math.PI * 2), rr = rng.range(3.15, 4.1);
    b.box(rng.range(0.18, 0.3), 0.03, rng.range(0.14, 0.22), { x: Math.cos(a) * rr, y: 0.08, z: Math.sin(a) * rr, ry: -a + rng.range(-0.2, 0.2), color: rng.pick(['#d6c29c', '#bfa982', '#e0ccaa', '#b49f7e']) });
  }
  b.cyl(0.55, 0.6, 0.3, { y: 0.08, color: C.ash, seg: 14 });
  b.cyl(0.47, 0.47, 0.02, { y: 0.36, color: C.sea, mat: M.water, seg: 14 });
  b.cyl(0.06, 0.08, 0.5, { y: 0.36, color: C.ash, seg: 8 });
  tree(b, { x: 1.4, y: 0.08, z: -1.0, h: 2.0, kind: 'round', color: '#6f8f55', r: rng });
  for (let i = 0; i < 4; i++) {
    const a = i / 4 * Math.PI * 2 + 0.6;
    b.box(0.5, 0.06, 0.14, { x: Math.cos(a) * 1.9, y: 0.25, z: Math.sin(a) * 1.9, ry: -a + Math.PI / 2, color: C.wood, mat: M.wood });
    b.box(0.06, 0.18, 0.12, { x: Math.cos(a) * 1.9, y: 0.08, z: Math.sin(a) * 1.9, ry: -a, color: C.darkwood });
  }
  // the viewer's side: a low hedge with a gate, flower beds
  for (let i = -8; i <= 8; i++) {
    const a = CAM + i * 0.075;
    if (Math.abs(i) < 2) continue;
    b.box(0.7, 0.32, 0.3, { x: Math.cos(a) * 9.4, y: 0.06, z: Math.sin(a) * 9.4, ry: -a + Math.PI / 2, color: '#56794a', mat: M.flat });
  }
  for (const s of [-1, 1]) b.cyl(0.07, 0.08, 0.7, { x: Math.cos(CAM + s * 0.12) * 9.4, y: 0.06, z: Math.sin(CAM + s * 0.12) * 9.4, color: '#e3d6c0', seg: 8 });
  for (let i = 0; i < 40; i++) {
    const [x, z] = rng.inDisc(8.8, 4.8);
    const a = Math.atan2(z, x);
    if (Math.abs(((a - CAM + Math.PI * 3) % (Math.PI * 2)) - Math.PI) > 1.0) continue;
    if (rng.chance(0.2)) { tree(b, { x, y: 0.06, z, h: rng.range(1.0, 1.4), kind: 'round', color: '#7a9a58', r: rng }); for (let f = 0; f < 4; f++) b.sphere(0.05, { x: x + rng.range(-0.3, 0.3), y: 0.06 + rng.range(0.7, 1.1), z: z + rng.range(-0.3, 0.3), color: rng.pick(['#e8a23a', '#d8503a']), seg: 5 }); continue; }
    b.sphere(0.26, { x, y: 0.12, z, sy: 0.6, color: rng.pick(['#6f9a58', '#7fa860', '#5d8a4c']), mat: M.flat, seg: 6 });
    for (let f = 0; f < 3; f++) b.sphere(0.055, { x: x + rng.range(-0.15, 0.15), y: 0.25, z: z + rng.range(-0.15, 0.15), color: rng.pick(['#e57a8a', '#f2d06b', '#f4f0e6', '#d07ad0', accent]), seg: 4 });
  }

  /* ---------- houses ---------- */
  const IN = warmLit('#ffb070', 0.62);
  const gods = []; // [x,y,z, kind(0 penates,1 lares), phase]
  const N = 6;
  const R = 6.75;
  const HS = 1.22; // dolls' houses, a size larger than life
  const W = 2.5, D = 2.0, H = 1.2, T = 0.08;
  const exteriors = ['#e9d8bd', '#dcb79a', '#e3cfa6', '#cfd2c2', '#e8c6b2', '#d8c9a8', '#e6dccb'];
  const papers = ['#b9c7a6', '#e4c69c', '#c9b5cf', '#a9c1c8', '#e0b7a6', '#cbd4b0', '#d9c9a0'];
  const roofs = [C.terracotta, C.brick, '#7a6f74', C.terracotta, '#8d5a44', C.brick, '#6f7a6a'];
  const EMPTY = 2; // the house the family has just left
  const m4 = new THREE.Matrix4();
  const v3 = new THREE.Vector3();
  let doorWorld = [];

  for (let i = 0; i < N; i++) {
    const a = CAM + Math.PI + (i - (N - 1) / 2) * 0.64;
    const hx = Math.cos(a) * R, hz = Math.sin(a) * R, ry = Math.PI * 1.5 - a; // open fronts face the plaza and the viewer
    const ext = exteriors[i], paper = papers[i], paper2 = papers[(i + 3) % N];
    m4.compose(new THREE.Vector3(hx, 0.08, hz), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, ry, 0)), new THREE.Vector3(HS, HS, HS));
    const W2 = (lx, ly, lz) => v3.set(lx, ly, lz).applyMatrix4(m4).toArray();
    const god = (lx, ly, lz, kind) => gods.push([...W2(lx, ly, lz), kind, rng.range(0, 6.28)]);
    const empty = i === EMPTY;

    b.push({ x: hx, y: 0.08, z: hz, ry, s: HS });
    // base, walls (exterior colour outside, wallpaper inside), floor
    b.box(W + 0.16, 0.1, D + 0.12, { color: '#9b8f80' });
    b.box(W - 2 * T, T, D - T, { y: 0.1, z: T / 2, color: '#a77d55', mat: IN }); // ground floor boards
    b.box(W, 2 * H, T, { y: 0.1, z: -D / 2 + T / 2, color: ext });
    b.box(W - 2 * T, H - 0.05, 0.012, { y: 0.15, z: -D / 2 + T + 0.006, color: paper, mat: IN });
    b.box(W - 2 * T, H - 0.05, 0.012, { y: H + 0.17, z: -D / 2 + T + 0.006, color: paper2, mat: IN });
    for (const s of [-1, 1]) {
      b.box(T, 2 * H, D, { x: s * (W / 2 - T / 2), y: 0.1, color: ext });
      b.box(0.012, H - 0.05, D - T, { x: s * (W / 2 - T - 0.006), y: 0.15, z: T / 2, color: paper, mat: IN });
      b.box(0.012, H - 0.05, D - T, { x: s * (W / 2 - T - 0.006), y: H + 0.17, z: T / 2, color: paper2, mat: IN });
      // windows on side walls (outside lit glass)
      b.quad(0.3, 0.38, { x: s * (W / 2 + 0.006), y: H + 0.75, z: -0.3, ry: s * Math.PI / 2, mat: M.glow, color: C.lamp, glow: 1.4 });
    }
    b.box(W - 2 * T, 0.07, D - T, { y: H + 0.1, z: T / 2, color: '#9a7350', mat: IN }); // upper floor
    // the cut: dark section edges along the open front, like a dolls' house
    b.box(W + 0.02, 0.07, 0.02, { y: H + 0.1, z: D / 2, color: '#3a2c25' });
    for (const s of [-1, 1]) b.box(T + 0.02, 2 * H, 0.02, { x: s * (W / 2 - T / 2), y: 0.1, z: D / 2, color: '#3a2c25' });
    b.box(W + 0.12, 0.08, 0.1, { y: 2 * H + 0.1, z: -D / 2 + 0.05, color: '#cbb89a' }); // cornice
    // partition between hall (x>0.35) and kitchen
    b.box(0.06, H, 0.75, { x: 0.35, y: 0.1, z: -D / 2 + 0.4, color: paper });
    b.box(0.06, 0.25, 0.5, { x: 0.35, y: 0.1 + H - 0.25, z: -D / 2 + 1.0, color: paper });

    // --- hall & front door (on the right side wall) ---
    b.box(0.03, 0.82, 0.42, { x: W / 2 - T - 0.015, y: 0.18, z: 0.25, color: '#5b3a28', mat: IN });
    b.sphere(0.025, { x: W / 2 - T - 0.04, y: 0.6, z: 0.38, color: C.gold, mat: M.metal, seg: 6 });
    b.box(0.03, 0.82, 0.42, { x: W / 2 + 0.01, y: 0.18, z: 0.25, color: '#5b3a28', mat: IN });
    b.box(0.32, 0.01, 0.5, { x: W / 2 - 0.3, y: 0.18, z: 0.25, color: accent, mat: M.cloth }); // doormat
    // coat rack
    const crx = 0.75, crz = -0.55;
    if (!empty) {
      b.cyl(0.018, 0.018, 0.95, { x: crx, y: 0.18, z: crz, color: C.darkwood, seg: 5 });
      b.cyl(0.1, 0.12, 0.03, { x: crx, y: 0.18, z: crz, color: C.darkwood, seg: 8 });
      for (let k = 0; k < 4; k++) {
        const ka = k * Math.PI / 2;
        b.rod([crx, 1.0, crz], [crx + Math.cos(ka) * 0.1, 1.07, crz + Math.sin(ka) * 0.1], 0.01, { color: C.darkwood });
      }
      b.cone(0.11, 0.5, { x: crx + 0.08, y: 0.55, z: crz, color: rng.pick(['#5d6d8a', '#7a4b3a', '#4f5f4a']), mat: M.cloth, seg: 7 });
      b.cyl(0.07, 0.08, 0.06, { x: crx - 0.06, y: 1.04, z: crz + 0.04, color: '#3a3330', seg: 8 });
      b.cyl(0.12, 0.12, 0.01, { x: crx - 0.06, y: 1.03, z: crz + 0.04, color: '#3a3330', seg: 10 });
      b.rod([crx + 0.18, 0.18, crz + 0.1], [crx + 0.2, 0.6, crz + 0.12], 0.012, { color: '#2e2e33' }); // umbrella
      // a little hall table with a mirror
      b.box(0.5, 0.04, 0.22, { x: 0.95, y: 0.6, z: -D / 2 + 0.2, color: C.wood, mat: IN });
      for (const s of [-1, 1]) b.box(0.03, 0.42, 0.03, { x: 0.95 + s * 0.22, y: 0.18, z: -D / 2 + 0.2, color: C.darkwood });
      b.quad(0.28, 0.36, { x: 0.95, y: 0.92, z: -D / 2 + T + 0.02, color: '#d8e4ea', mat: M.metal });
    }
    // Penates: by the door, on the mat, on the coat-rack hooks and the hall table
    const penN = empty ? 0 : 20;
    for (let k = 0; k < penN; k++) {
      const where = k % 4;
      if (where === 0) god(W / 2 - 0.2 - rng.range(0, 0.25), 0.2, 0.25 + rng.range(-0.25, 0.25), 0);
      else if (where === 1) god(crx + rng.range(-0.12, 0.12), 0.2 + rng.range(0, 0.02), crz + rng.range(-0.12, 0.15), 0);
      else if (where === 2) { const ka = rng.int(0, 3) * Math.PI / 2; god(crx + Math.cos(ka) * 0.1, 1.08, crz + Math.sin(ka) * 0.1, 0); }
      else god(0.95 + rng.range(-0.2, 0.2), 0.64, -D / 2 + 0.2 + rng.range(-0.06, 0.06), 0);
    }
    // more Penates spilling from the hall to the open front, and up the stair
    if (!empty) for (let k = 0; k < 10; k++) {
      if (k < 6) god(rng.range(0.45, 1.1), 0.18, rng.range(0.2, 0.85), 0);
      else { const st = rng.int(0, 6); god(0.65 + rng.range(-0.08, 0.08), 0.22 + st * 0.155, -0.2 - st * 0.1, 0); }
    }
    if (!empty) {
      // the Penates' door is where the family stands: remember it for the moving family
      doorWorld.push(W2(W / 2 + 0.4, 0, 0.25));
    }

    // --- kitchen: hearth, flue, pots, broom closet, table ---
    const hx0 = -0.6;
    b.box(0.85, 0.7, 0.36, { x: hx0, y: 0.18, z: -D / 2 + T + 0.18, color: '#b9a48a' });
    b.box(0.5, 0.42, 0.04, { x: hx0, y: 0.2, z: -D / 2 + T + 0.35, color: '#2a2220' });
    b.box(0.95, 0.06, 0.42, { x: hx0, y: 0.88, z: -D / 2 + T + 0.2, color: '#a08c74' }); // mantel
    b.cone(0.09, 0.16, { x: hx0, y: 0.2, z: -D / 2 + T + 0.25, color: '#ff9a3c', mat: M.glow, glow: 2.4, seg: 6 }); // embers
    // chimney flue: open-fronted shaft rising through the upper floor and the roof
    const fx = hx0, fz = -D / 2 + T + 0.15;
    b.box(0.5, 2 * H + 1.1, 0.05, { x: fx, y: 0.94, z: fz - 0.13, color: '#8b7a6a' });
    for (const s of [-1, 1]) b.box(0.05, 2 * H + 0.2, 0.3, { x: fx + s * 0.25, y: 0.94, z: fz, color: '#9c8a78' });
    b.box(0.5, 2 * H - 0.2, 0.01, { x: fx, y: 0.95, z: fz - 0.1, color: '#2b2522' }); // soot
    b.box(0.6, 0.9, 0.42, { x: fx, y: 2 * H + 0.6, z: fz - 0.05, color: '#9a6a52' }); // stack above roof
    b.box(0.66, 0.06, 0.48, { x: fx, y: 2 * H + 1.5, z: fz - 0.05, color: '#7e5a46' });
    // pots and pans
    for (let k = 0; k < 3; k++) b.cyl(0.07, 0.06, 0.08, { x: hx0 - 0.25 + k * 0.25, y: 0.94, z: -D / 2 + T + 0.22, color: k === 1 ? '#b87333' : '#3d3f45', mat: M.metal, seg: 10 });
    b.cyl(0.11, 0.08, 0.12, { x: hx0, y: 0.32, z: -D / 2 + T + 0.27, color: '#2f3034', mat: M.rough_metal, seg: 10 }); // cauldron in hearth
    // broom closet: cupboard against the left wall, door swung open
    const bcx = -W / 2 + T + 0.2, bcz = 0.45;
    b.box(0.36, 0.95, 0.04, { x: bcx, y: 0.18, z: bcz - 0.22, color: '#7b5a40', mat: IN });
    b.box(0.36, 0.95, 0.04, { x: bcx, y: 0.18, z: bcz + 0.22, color: '#7b5a40', mat: IN });
    b.box(0.36, 0.04, 0.48, { x: bcx, y: 1.12, z: bcz, color: '#7b5a40', mat: IN });
    b.box(0.03, 0.9, 0.38, { x: bcx + 0.32, y: 0.2, z: bcz + 0.38, ry: -1.1, color: '#8a6848', mat: IN });
    b.rod([bcx - 0.05, 0.2, bcz - 0.05], [bcx + 0.02, 1.05, bcz - 0.12], 0.012, { color: '#a07a50' });
    b.cone(0.07, 0.22, { x: bcx - 0.05, y: 0.18, z: bcz - 0.05, color: '#c9a35a', seg: 6, mat: M.flat });
    if (!empty) {
      // kitchen table and stools
      b.box(0.55, 0.04, 0.4, { x: -0.5, y: 0.52, z: 0.35, color: C.wood, mat: IN });
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box(0.03, 0.34, 0.03, { x: -0.5 + sx * 0.23, y: 0.18, z: 0.35 + sz * 0.16, color: C.darkwood });
      b.cyl(0.08, 0.08, 0.22, { x: -0.1, y: 0.18, z: 0.5, color: C.wood, seg: 8 });
      b.sphere(0.05, { x: -0.55, y: 0.6, z: 0.35, color: '#d8a24a', seg: 6 }); // bread
      b.cyl(0.03, 0.03, 0.08, { x: -0.42, y: 0.56, z: 0.4, color: '#e9e2d0', mat: IN, seg: 6 });
    } else {
      // the left house: a dust sheet, a forgotten chair
      b.box(0.3, 0.3, 0.3, { x: -0.4, y: 0.18, z: 0.4, ry: 0.6, color: '#d9d2c4', mat: M.cloth });
    }
    // Lares: under pots, on the mantel, up the flue, in the cupboard, under the table
    const larN = 24;
    for (let k = 0; k < larN; k++) {
      const where = k % 5;
      if (where === 0) god(hx0 - 0.3 + rng.range(0, 0.6), 0.9, -D / 2 + T + 0.12 + rng.range(0, 0.1), 1);
      else if (where === 1 || where === 2) god(fx + rng.range(-0.15, 0.15), 1.0 + rng.range(0, 2 * H - 0.2), fz + rng.range(-0.04, 0.08), 1);
      else if (where === 3) god(bcx + rng.range(-0.1, 0.12), rng.pick([0.2, 0.2, 0.62]), bcz + rng.range(-0.15, 0.15), 1);
      else god(-0.5 + rng.range(-0.2, 0.2), 0.2, 0.35 + rng.range(-0.15, 0.15), 1);
    }

    // --- upper floor: stair, bed, wardrobe, chest, lamp ---
    for (let k = 0; k < 7; k++) b.box(0.3, 0.04, 0.12, { x: 0.65, y: 0.18 + k * 0.155, z: -0.2 - k * 0.1, color: '#8a6440', mat: IN });
    if (!empty) {
      const uy = H + 0.17;
      b.box(0.62, 0.22, 1.0, { x: 0.75, y: uy, z: -0.35, color: '#6a4a33', mat: IN });
      b.box(0.6, 0.06, 0.8, { x: 0.75, y: uy + 0.22, z: -0.25, color: rng.pick(['#c96c5a', '#5b7aa0', '#d9b45a', '#7aa07a']), mat: M.cloth });
      b.box(0.5, 0.08, 0.18, { x: 0.75, y: uy + 0.22, z: -0.75, color: '#f1eadb', mat: M.cloth });
      b.box(0.62, 0.45, 0.05, { x: 0.75, y: uy, z: -0.86, color: '#5d4130', mat: IN });
      b.box(0.5, 0.95, 0.35, { x: -0.25, y: uy, z: -D / 2 + T + 0.2, color: '#8b6446', mat: IN }); // wardrobe
      b.box(0.45, 0.25, 0.28, { x: 0.8, y: uy, z: 0.55, color: '#7a5034', mat: IN }); // chest
      b.cyl(0.03, 0.05, 0.3, { x: 0.3, y: uy, z: -0.75, color: C.gold, mat: M.metal, seg: 6 });
      b.sphere(0.07, { x: 0.3, y: uy + 0.36, z: -0.75, color: C.lamp, mat: M.glow, glow: 2.2, seg: 8 });
      b.quad(0.26, 0.2, { x: 0.75, y: uy + 0.75, z: -D / 2 + T + 0.015, color: rng.pick(['#7c8f6a', '#b78a5a', '#6a7d9a']), mat: IN });
      b.box(0.24, 0.02, 0.32, { x: -0.5, y: uy + 0.015, z: 0.3, color: accent, mat: M.cloth });
    }

    // --- lifted roof: a lid hinged at the back eave ---
    const theta = i === EMPTY ? 0.25 : rng.range(0.5, 0.95);
    const rh = 0.75, half = D / 2 + 0.12;
    const slope = Math.hypot(half, rh), ang = Math.atan2(rh, half);
    b.push({ y: 2 * H + 0.1, z: -D / 2 - 0.06, rx: -theta });
    b.push({ z: half });
    for (const s of [-1, 1]) {
      // two roof planes
      b.box(W + 0.24, 0.07, slope, { x: 0, y: rh / 2 - 0.035, z: s * half / 2, rx: s * ang, color: roofs[i], mat: M.flat });
    }
    // gable triangles & rafters seen from below
    const tri = new THREE.Shape([new THREE.Vector2(-half + 0.1, 0), new THREE.Vector2(half - 0.1, 0), new THREE.Vector2(0, rh - 0.08)]);
    const triG = new THREE.ExtrudeGeometry(tri, { depth: 0.05, bevelEnabled: false }).rotateY(Math.PI / 2);
    for (const s of [-1, 1]) b.geo(triG, { x: s * (W / 2 - 0.02) - 0.025, color: ext });
    for (let k = -2; k <= 2; k++) b.box(0.04, 0.04, 2 * half - 0.2, { x: k * W / 5, y: 0.02, color: '#6d4f36', mat: M.wood });
    b.pop();
    b.pop();
    b.pop();

    // a small garden in front of the open side
    for (let k = 0; k < 3; k++) {
      const off = (k - 1) * 0.9;
      v3.set(off, 0, D / 2 + 0.55).applyMatrix4(m4);
      b.sphere(0.18, { x: v3.x, y: 0.2, z: v3.z, color: rng.pick(['#6f9a58', '#7fa860', '#5d8a4c']), mat: M.flat, seg: 6, sy: 0.8 });
      b.sphere(0.04, { x: v3.x + 0.08, y: 0.36, z: v3.z, color: rng.pick(['#e57a8a', '#f2d06b', '#f4f0e6']), seg: 4 });
    }
  }

  // trees between and behind the houses, lamps around the plaza
  for (let i = 0; i <= N; i++) {
    const a = CAM + Math.PI + (i - N / 2) * 0.64;
    tree(b, { x: Math.cos(a) * 8.2, y: 0.08, z: Math.sin(a) * 8.2, h: rng.range(1.8, 2.6), kind: i % 2 ? 'cypress' : 'round', color: '#6f8f55', r: rng });
  }
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    const lx = Math.cos(a) * 4.45, lz = Math.sin(a) * 4.45;
    b.cyl(0.025, 0.035, 1.3, { x: lx, y: 0.08, z: lz, color: '#2f2f35', mat: M.metal, seg: 6 });
    b.sphere(0.08, { x: lx, y: 1.42, z: lz, color: C.lamp, mat: M.glow, glow: 2.6, seg: 8 });
  }

  object.add(b.build());

  /* ---------- gods (instanced, flickering) ---------- */
  const godGeo = geoOf((g) => {
    g.cone(0.055, 0.15, { color: '#ffffff', seg: 5 });
    g.sphere(0.042, { y: 0.18, color: '#ffffff', seg: 6 });
  });
  godGeo.deleteAttribute('color');
  const godMat = new THREE.MeshBasicMaterial({ toneMapped: false });
  const NG = gods.length;
  const godsMesh = new THREE.InstancedMesh(godGeo, godMat, NG);
  const tmpC = new THREE.Color();
  const dummy = new THREE.Object3D();
  gods.forEach(([x, y, z], i) => {
    dummy.position.set(x, y, z);
    dummy.rotation.y = rng.range(0, 6.28);
    dummy.scale.setScalar(rng.range(0.85, 1.25));
    dummy.updateMatrix();
    godsMesh.setMatrixAt(i, dummy.matrix);
    godsMesh.setColorAt(i, gods[i][3] ? TEAL : GOLD);
  });
  object.add(godsMesh);

  /* ---------- the family moving house ---------- */
  const fam = new Builder();
  // handcart
  fam.box(1.0, 0.06, 0.55, { y: 0.32, color: C.wood, mat: M.wood });
  for (const s of [-1, 1]) fam.box(1.0, 0.16, 0.04, { y: 0.36, z: s * 0.26, color: C.darkwood, mat: M.wood });
  fam.rod([0.5, 0.36, 0.2], [1.05, 0.45, 0.2], 0.02, { color: C.darkwood });
  fam.rod([0.5, 0.36, -0.2], [1.05, 0.45, -0.2], 0.02, { color: C.darkwood });
  // the load: wardrobe on its back, chair upside down, a clock, bundles, a birdcage
  fam.box(0.5, 0.16, 0.36, { x: -0.2, y: 0.38, color: '#8b6446', mat: M.wood });
  fam.box(0.32, 0.3, 0.3, { x: 0.22, y: 0.38, color: '#7a5034', mat: M.wood });
  fam.box(0.22, 0.04, 0.22, { x: 0.22, y: 0.82, color: C.wood, mat: M.wood });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) fam.box(0.025, 0.2, 0.025, { x: 0.22 + sx * 0.09, y: 0.86, z: sz * 0.09, color: C.darkwood });
  fam.box(0.12, 0.42, 0.1, { x: -0.38, y: 0.54, z: 0.1, color: '#5d4130', mat: M.wood }); // clock
  fam.cyl(0.05, 0.05, 0.01, { x: -0.38, y: 0.86, z: 0.155, rx: Math.PI / 2, color: '#f1eadb', seg: 10, mat: M.smooth });
  fam.sphere(0.13, { x: -0.1, y: 0.62, z: -0.12, color: '#c9b27a', mat: M.cloth, seg: 7, sy: 0.8 });
  fam.sphere(0.11, { x: 0.05, y: 0.62, z: 0.12, color: '#9c6a5a', mat: M.cloth, seg: 7, sy: 0.8 });
  fam.cyl(0.07, 0.07, 0.16, { x: -0.05, y: 0.75, z: 0.0, color: C.gold, mat: M.metal, seg: 8, open: true }); // birdcage
  fam.dome(0.07, { x: -0.05, y: 0.91, z: 0.0, color: C.gold, mat: M.metal, seg: 8 });
  // the family: father pulling, mother, child carrying a lamp, grandmother behind
  figure(fam, { x: 1.2, y: 0, z: 0, ry: Math.PI / 2, robe: '#5d6d8a', hat: 'brim', hatColor: '#3a3330', arms: ['back', 'back'], lean: 0.18 });
  figure(fam, { x: 0.15, y: 0, z: 0.55, ry: Math.PI / 2, robe: '#a0524a', hat: 'veil', hatColor: '#efe4cf', arms: ['fwd', 'down'] });
  figure(fam, { x: 0.7, y: 0, z: 0.6, ry: Math.PI / 2, h: 0.22, robe: '#d9b45a', arms: ['carry', 'down'] });
  figure(fam, { x: -0.75, y: 0, z: 0.2, ry: Math.PI / 2, h: 0.32, robe: '#4d4a52', hat: 'veil', hatColor: '#34343a', arms: ['fwd', 'fwd'], lean: 0.12 });
  fam.sphere(0.035, { x: 0.78, y: 0.17, z: 0.67, color: C.lamp, mat: M.glow, glow: 3, seg: 6 });
  const famG = fam.build();
  famG.traverse((m) => { if (m.isMesh) { m.castShadow = true; } });
  const wheels = new Builder();
  for (const s of [-1, 1]) {
    wheels.torus(0.2, 0.025, { z: s * 0.32, color: C.darkwood, mat: M.wood, tseg: 16, rseg: 5 });
    for (let k = 0; k < 4; k++) wheels.box(0.02, 0.4, 0.02, { y: -0.2, z: s * 0.32, rz: k * Math.PI / 4, color: C.darkwood, mat: M.wood });
  }
  const wheelG = wheels.build();
  const wheelPivot = new THREE.Group();
  wheelPivot.position.set(0, 0.2, 0);
  wheelPivot.add(wheelG);
  const cart = new THREE.Group();
  cart.add(famG, wheelPivot);
  object.add(cart);
  // the Penates that follow the family
  const NF = 16;
  const followers = new THREE.InstancedMesh(godGeo, new THREE.MeshBasicMaterial({ color: GOLD.clone().multiplyScalar(2.6), toneMapped: false }), NF);
  const fSeed = Array.from({ length: NF }, () => [rng.range(0.25, 1.6), rng.range(-0.35, 0.35), rng.range(0, 6.28), rng.range(1.4, 2.4)]);
  object.add(followers);


  const RR = 3.62;
  const SPEED = 0.11; // rad/s — one lap ≈ 57 s
  return {
    object,
    update(t) {
      // the argument: penates speak (what it was), lares answer (what it will be)
      const turn = Math.sin(t * 0.45);
      for (let i = 0; i < NG; i++) {
        const g = gods[i];
        const kind = g[3];
        const speak = kind === 0 ? Math.max(0, turn) : Math.max(0, -turn);
        const flick = 0.75 + 0.25 * Math.sin(t * 3.1 + g[4] * 3);
        const k = (2.0 + speak * 2.6) * flick;
        tmpC.copy(kind ? TEAL : GOLD).multiplyScalar(k);
        godsMesh.setColorAt(i, tmpC);
      }
      godsMesh.instanceColor.needsUpdate = true;
      // the family walks the ring road
      const a = -t * SPEED + 1.2;
      cart.position.set(Math.cos(a) * RR, 0.08, Math.sin(a) * RR);
      cart.rotation.y = Math.PI / 2 - a; // facing the direction of travel
      cart.position.y = 0.08 + Math.abs(Math.sin(t * 5)) * 0.012;
      wheelPivot.rotation.z = -t * SPEED * RR / 0.2;
      // followers trail behind, hopping
      for (let i = 0; i < NF; i++) {
        const [lag, side, ph, hop] = fSeed[i];
        const aa = a + lag / RR + 0.12;
        const rr = RR + side;
        dummy.position.set(Math.cos(aa) * rr, 0.1 + Math.abs(Math.sin(t * hop * 2 + ph)) * 0.12, Math.sin(aa) * rr);
        dummy.rotation.set(0, -aa, 0);
        dummy.scale.setScalar(1.1);
        dummy.updateMatrix();
        followers.setMatrixAt(i, dummy.matrix);
      }
      followers.instanceMatrix.needsUpdate = true;
    },
  };
}
