// RAISSA — the unhappy city that contains a happy one, unaware of itself.
// A grey, rain-coloured tenement city of bent figures and dark windows. Through
// it runs a thread of light that never rests: from the child laughing at a window
// to the dog leaping onto a shed, to the mason on the scaffold, to the girl on the
// balcony, to a passer-by… binding one living being to the next for an instant,
// then loosening and drawing new patterns across the city.
import { THREE, Builder, M, C, Lines, windows, glowMat } from '../kit.js';

const WALLS = ['#8a8d92', '#7b7f86', '#979792', '#6d7178', '#a09d97', '#858a8f', '#8f8a84'];
const ROOFS = ['#4a4e56', '#565a61', '#5d5853', '#474b52'];
const COATS = ['#4a4c52', '#3b3d43', '#5a5753', '#45474f', '#62615d'];
const SKIN = '#b9a493';

const HIP = new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1).rotateY(Math.PI / 4).translate(0, 0.5, 0);
const GABLE = (() => {
  const s = new THREE.Shape([new THREE.Vector2(-0.5, 0), new THREE.Vector2(0.5, 0), new THREE.Vector2(0, 1)]);
  const g = new THREE.ExtrudeGeometry(s, { depth: 1, bevelEnabled: false });
  g.translate(0, 0, -0.5);
  return g;
})();

/** a grey tenement with a slate roof, cornices, chimneys, mostly dark windows */
function tenement(b, rng, { x, z, w, d, h, ry = 0, roof = 'gable', wall, lit = 0.04 }) {
  wall = wall || rng.pick(WALLS);
  const roofC = rng.pick(ROOFS);
  b.push({ x, z, ry });
  b.box(w, h, d, { color: wall });
  b.box(w + 0.06, 0.12, d + 0.06, { y: 0, color: '#5e6168' }); // plinth course
  // floor cornices
  for (let y = 1.0; y < h - 0.3; y += 1.0) b.box(w + 0.04, 0.04, d + 0.04, { y, color: '#a3a39e' });
  if (roof === 'gable') {
    b.geo(GABLE, { y: h, sx: w + 0.12, sy: Math.min(w, d) * 0.5, sz: d + 0.12, mat: M.flat, color: roofC });
  } else if (roof === 'hip') {
    b.geo(HIP, { y: h, sx: w + 0.1, sz: d + 0.1, sy: Math.min(w, d) * 0.45, mat: M.flat, color: roofC });
  } else {
    b.box(w + 0.08, 0.14, d + 0.08, { y: h, color: '#6a6d73' });
    b.box(w - 0.1, 0.04, d - 0.1, { y: h + 0.02, color: '#55585e' });
  }
  // chimneys with soot caps
  const nc = rng.int(1, 3);
  for (let i = 0; i < nc; i++) {
    const cx = rng.range(-w * 0.35, w * 0.35), cz = rng.range(-d * 0.3, d * 0.3);
    b.box(0.14, 0.55 + rng.range(0, 0.3), 0.14, { x: cx, y: h, z: cz, color: '#6b625c' });
  }
  b.pop();
  windows(b, { x, z, w, d, h, ry, lit, r: rng, dark: '#2e3138', color: C.lamp, size: 0.2, floorH: 1.0 });
}

/** a figure; bend tilts the body forward (unhappy), arms optional */
function figure(b, { x, y = 0, z, ry = 0, h = 0.36, bend = 0.35, coat = '#4a4c52', skin = SKIN, umbrella = false, hat = false }) {
  b.push({ x, y, z, ry });
  b.push({ rx: bend });
  b.cone(h * 0.2, h * 0.7, { color: coat, seg: 7 });
  b.sphere(h * 0.12, { y: h * 0.8, z: 0, color: skin, seg: 7 });
  if (hat) b.cyl(h * 0.1, h * 0.14, h * 0.07, { y: h * 0.88, color: '#2c2d31', seg: 8 });
  b.pop();
  if (umbrella) {
    b.cyl(0.006, 0.006, h * 1.3, { x: 0.05, color: '#222', seg: 3 });
    b.cone(h * 0.48, h * 0.18, { x: 0.05, y: h * 1.2, color: '#26282d', seg: 8, mat: M.cloth });
  }
  b.pop();
}

function dog(b, { x, y, z, ry = 0, color = '#7a6a5a', leap = 0 }) {
  b.push({ x, y, z, ry });
  b.push({ y: 0.1, rx: -leap });
  b.geo(new THREE.CapsuleGeometry(0.05, 0.16, 3, 6).rotateX(Math.PI / 2), { color, z: 0 });
  b.sphere(0.055, { y: 0.06, z: 0.13, color, seg: 7 });
  b.box(0.035, 0.03, 0.06, { y: 0.045, z: 0.19, color: '#3b302a' });
  b.box(0.02, 0.06, 0.02, { y: 0.09, z: 0.12, x: 0.03, color: '#5a4a3a' });
  b.box(0.02, 0.06, 0.02, { y: 0.09, z: 0.12, x: -0.03, color: '#5a4a3a' });
  for (const [lx, lz] of [[0.035, 0.07], [-0.035, 0.07], [0.035, -0.07], [-0.035, -0.07]]) b.box(0.022, 0.1, 0.022, { x: lx, z: lz, y: -0.1, color });
  b.rod([0, 0.02, -0.1], [0, 0.09, -0.17], 0.01, { color });
  b.pop();
  b.pop();
}

function cat(b, { x, y, z, ry = 0, color = '#3a3a3e' }) {
  b.push({ x, y, z, ry });
  b.sphere(0.05, { y: 0.05, sz: 1.5, color, seg: 7 });
  b.sphere(0.035, { y: 0.11, z: 0.06, color, seg: 6 });
  b.cone(0.012, 0.03, { y: 0.135, z: 0.06, x: 0.017, color, seg: 3 });
  b.cone(0.012, 0.03, { y: 0.135, z: 0.06, x: -0.017, color, seg: 3 });
  b.tube([[0, 0.05, -0.07], [0, 0.07, -0.13], [0.02, 0.15, -0.14]], 0.008, { color, tseg: 6, rseg: 3 });
  b.pop();
}

function bird(b, { x, y, z, ry = 0, color = '#55555b' }) {
  b.push({ x, y, z, ry });
  b.sphere(0.035, { y: 0.03, sz: 1.5, color, seg: 6 });
  b.sphere(0.022, { y: 0.06, z: 0.04, color, seg: 6 });
  b.cone(0.008, 0.025, { y: 0.06, z: 0.06, rx: Math.PI / 2, color: '#c08a40', seg: 4 });
  b.pop();
}

function horse(b, { x, y = 0, z, ry = 0, color = '#6a5d52' }) {
  b.push({ x, y, z, ry });
  b.geo(new THREE.CapsuleGeometry(0.09, 0.28, 3, 8).rotateX(Math.PI / 2), { y: 0.32, color });
  for (const [lx, lz] of [[0.06, 0.15], [-0.06, 0.15], [0.06, -0.15], [-0.06, -0.15]]) b.box(0.04, 0.26, 0.04, { x: lx, z: lz, color });
  b.rod([0, 0.36, 0.2], [0, 0.5, 0.3], 0.045, { color });
  b.geo(new THREE.CapsuleGeometry(0.04, 0.1, 3, 6).rotateX(Math.PI / 2 + 0.6), { y: 0.46, z: 0.36, color });
  b.pop();
}

export default function build({ rng, accent }) {
  const b = new Builder();
  const object = new THREE.Group();

  // wet cobbled ground, darker gutters, puddles
  b.cyl(10.4, 10.5, 0.08, { color: '#54585e', seg: 64 });
  b.cyl(2.6, 2.6, 0.03, { x: 0.3, z: 1.8, y: 0.08, color: '#62666c', seg: 32 }); // little square
  const puddles = [];
  for (let i = 0; i < 26; i++) {
    const [px, pz] = rng.inDisc(9.5);
    puddles.push([px, pz]);
    b.geo(new THREE.CircleGeometry(1, 14).rotateX(-Math.PI / 2), { x: px, y: 0.115, z: pz, sx: rng.range(0.2, 0.55), sz: rng.range(0.15, 0.4), ry: rng() * 3, mat: M.water, color: '#5f6a76' });
  }

  const beings = []; // [x, y, z] of the points the thread binds
  const keep = []; // exclusion circles for the scatter [x, z, r]

  // ── the vignettes of the text, all facing the main viewing side (+z, slightly +x)
  // 1. child at a window: a tall house, one warm window with a small laughing child
  {
    const x = -1.7, z = -1.3, w = 2.0, d = 1.6, h = 5.0;
    tenement(b, rng, { x, z, w, d, h, ry: 0.5, roof: 'gable', wall: '#8d9096', lit: 0.0 });
    b.push({ x, z, ry: 0.5 });
    b.quad(0.42, 0.55, { x: 0.35, y: 3.25, z: d / 2 + 0.015, mat: M.glow, color: '#ffcf8a', glow: 1.3 });
    b.box(0.52, 0.06, 0.12, { x: 0.35, y: 2.95, z: d / 2 + 0.04, color: '#a6a39d' });
    figure(b, { x: 0.35, y: 2.98, z: d / 2 + 0.05, h: 0.28, bend: -0.05, coat: '#8a6a3c', skin: '#d7b08c' });
    b.pop();
    const p = new THREE.Vector3(0.35, 3.25, d / 2 + 0.06).applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.5);
    beings.push([x + p.x, p.y, z + p.z]);
    keep.push([x, z, 1.6]);
  }
  // 2. dog leaping on a shed
  {
    const x = -2.9, z = 1.9;
    b.box(1.3, 0.8, 0.9, { x, z, color: '#6e6559', mat: M.wood });
    b.box(1.45, 0.06, 1.1, { x, y: 0.8, z, rx: 0.12, color: '#4d4740', mat: M.wood });
    for (let i = 0; i < 6; i++) b.box(0.02, 0.8, 0.02, { x: x - 0.6 + i * 0.24, z: z + 0.46, color: '#4d3f33' });
    dog(b, { x: x + 0.15, y: 0.88, z: z, ry: -0.9, leap: 0.4 });
    beings.push([x + 0.15, 1.1, z]);
    // a crumb, falling
    b.sphere(0.02, { x: x + 0.45, y: 1.3, z: z - 0.15, color: '#d9c39a', seg: 5 });
    keep.push([x, z, 1.0]);
  }
  // 3. a mason on the scaffolding of a half-built house
  {
    const x = 1.6, z = -1.4, w = 1.8, d = 1.4, h = 3.2;
    b.box(w, h, d, { x, z, color: '#9c968c' });
    // unfinished upper storey: ragged brick courses
    for (let i = 0; i < 7; i++) b.box(rng.range(0.2, 0.5), 0.12, d, { x: x - w / 2 + 0.2 + i * 0.24, y: h, z, color: '#8a6e5c' });
    windows(b, { x, z, w, d, h, lit: 0, r: rng, dark: '#2e3138', size: 0.2, floorH: 1.0 });
    // scaffold frame on the front
    const sz = z + d / 2 + 0.35;
    const L = new Lines();
    for (let i = 0; i <= 4; i++) b.rod([x - w / 2 - 0.1 + i * (w + 0.2) / 4, 0.1, sz], [x - w / 2 - 0.1 + i * (w + 0.2) / 4, h + 0.9, sz], 0.022, { color: '#7a6047', mat: M.wood });
    for (let i = 0; i <= 4; i++) b.rod([x - w / 2 - 0.1 + i * (w + 0.2) / 4, 0.1, sz - 0.3], [x - w / 2 - 0.1 + i * (w + 0.2) / 4, h + 0.9, sz - 0.3], 0.018, { color: '#7a6047', mat: M.wood });
    for (const yy of [1.1, 2.2, 3.3]) {
      b.box(w + 0.4, 0.04, 0.34, { x, y: yy, z: sz - 0.15, color: '#8c7357', mat: M.wood });
      b.rod([x - w / 2 - 0.1, yy + 0.4, sz], [x + w / 2 + 0.1, yy + 0.4, sz], 0.012, { color: '#7a6047', mat: M.wood });
    }
    b.rod([x - w / 2 - 0.1, 0.1, sz], [x + w / 2 + 0.1, 3.3, sz], 0.015, { color: '#7a6047', mat: M.wood });
    figure(b, { x: x + 0.3, y: 3.34, z: sz - 0.15, ry: -0.6, bend: 0.1, coat: '#7c6f60', hat: true });
    b.box(0.25, 0.12, 0.15, { x: x - 0.4, y: 3.34, z: sz - 0.15, color: '#8a6e5c' }); // bricks
    b.cone(0.05, 0.04, { x: x + 0.45, y: 3.6, z: sz - 0.05, color: '#888', rx: 1.2, seg: 5 }); // trowel-ish
    beings.push([x + 0.3, 3.65, sz - 0.15]);
    keep.push([x, z + 0.3, 1.6]);
    // a pulley rope hanging from the top
    L.seg([x + 0.8, h + 0.9, sz], [x + 0.8, 0.4, sz + 0.05], '#3a3530', 1);
    object.add(L.build());
  }
  // 4. a girl on a balcony who smiles
  {
    const x = 4.1, z = 1.2, w = 1.6, d = 1.6, h = 3.6, ry = 0.15;
    tenement(b, rng, { x, z, w, d, h, ry, roof: 'hip', wall: '#9a958e' });
    b.push({ x, z, ry });
    b.box(0.9, 0.06, 0.45, { y: 1.9, z: d / 2 + 0.22, color: '#77767a' });
    for (let i = 0; i < 7; i++) b.box(0.015, 0.32, 0.015, { x: -0.42 + i * 0.14, y: 1.96, z: d / 2 + 0.43, color: '#2c2d31', mat: M.rough_metal });
    b.box(0.9, 0.025, 0.025, { y: 2.27, z: d / 2 + 0.43, color: '#2c2d31', mat: M.rough_metal });
    b.quad(0.36, 0.6, { y: 2.25, z: d / 2 + 0.012, mat: M.smooth, color: '#2e3138' });
    figure(b, { x: 0.1, y: 1.96, z: d / 2 + 0.22, h: 0.34, bend: -0.05, coat: '#a0524a', skin: '#d6b29a' });
    // pot of geraniums, the only red
    b.cyl(0.05, 0.04, 0.07, { x: -0.3, y: 1.96, z: d / 2 + 0.35, color: '#8e5a40', seg: 6 });
    b.sphere(0.06, { x: -0.3, y: 2.07, z: d / 2 + 0.35, color: '#b2463c', seg: 6 });
    b.pop();
    const p = new THREE.Vector3(0.1, 2.25, d / 2 + 0.22).applyAxisAngle(new THREE.Vector3(0, 1, 0), ry);
    beings.push([x + p.x, p.y, z + p.z]);
    keep.push([x, z, 1.5]);
  }
  // 5. a passer-by in the little square
  {
    figure(b, { x: 0.9, y: 0.11, z: 2.7, ry: 2.4, bend: 0.25, coat: '#5a5650', hat: true });
    beings.push([0.9, 0.42, 2.7]);
    // the dry well in the square
    b.cyl(0.42, 0.45, 0.4, { z: 1.3, y: 0.11, color: '#7a7c80', seg: 16 });
    b.cyl(0.34, 0.34, 0.02, { z: 1.3, y: 0.48, color: '#2c3036', seg: 16 });
    b.rod([-0.35, 0.5, 1.3], [-0.35, 1.2, 1.3], 0.025, { color: '#3b3d43', mat: M.rough_metal });
    b.rod([0.35, 0.5, 1.3], [0.35, 1.2, 1.3], 0.025, { color: '#3b3d43', mat: M.rough_metal });
    b.rod([-0.38, 1.2, 1.3], [0.38, 1.2, 1.3], 0.03, { color: '#3b3d43', mat: M.rough_metal });
    // a lamppost
    b.cyl(0.03, 0.04, 2.2, { x: -0.6, y: 0.11, z: 0.5, color: '#2c2d31', mat: M.rough_metal, seg: 6 });
    b.box(0.16, 0.2, 0.16, { x: -0.6, y: 2.3, z: 0.5, color: '#d6c39a', mat: M.glow, glow: 1.2 });
    b.cone(0.14, 0.1, { x: -0.6, y: 2.5, z: 0.5, color: '#2c2d31', seg: 4 });
  }
  // 6. an old woman feeding pigeons on a bench
  {
    const x = -0.9, z = 3.9;
    b.box(0.8, 0.04, 0.22, { x, y: 0.3, z, ry: 0.4, color: '#5b4a3c', mat: M.wood });
    b.box(0.8, 0.2, 0.03, { x: x + 0.04, y: 0.34, z: z - 0.1, ry: 0.4, color: '#5b4a3c', mat: M.wood });
    figure(b, { x, y: 0.2, z, ry: 0.4 + Math.PI, bend: 0.4, coat: '#3c3d42', skin: '#c9b2a0' });
    for (let i = 0; i < 4; i++) bird(b, { x: x - 0.3 + rng.range(-0.4, 0.4), y: 0.11, z: z + 0.45 + rng.range(-0.2, 0.3), ry: rng() * 6 });
    beings.push([x - 0.25, 0.14, z + 0.5]);
  }
  // 7. a cat on a roof ridge, 8. a pigeon on a chimney, 9. a woman shaking a rug, 10. a boy with a kite on a terrace
  {
    const x = -5.6, z = -1.6, w = 2.0, d = 1.6, h = 3.4, ry = 1.1;
    tenement(b, rng, { x, z, w, d, h, ry, roof: 'gable' });
    b.push({ x, z, ry });
    cat(b, { x: 0.3, y: h + d * 0.5 * 0.85 + 0.02, z: 0, ry: 1.4 });
    b.pop();
    const p = new THREE.Vector3(0.3, h + 0.85, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), ry);
    beings.push([x + p.x, p.y, z + p.z]);
    keep.push([x, z, 1.5]);
  }
  {
    const x = 3.4, z = -4.4, w = 1.8, d = 1.6, h = 5.6;
    tenement(b, rng, { x, z, w, d, h, ry: -0.2, roof: 'flat' });
    b.box(0.2, 1.0, 0.2, { x: x + 0.4, y: h, z, color: '#6b625c' });
    bird(b, { x: x + 0.4, y: h + 1.0, z, ry: 0.6, color: '#6a6a72' });
    beings.push([x + 0.4, h + 1.08, z]);
    keep.push([x, z, 1.5]);
  }
  {
    const x = 6.6, z = -1.8, w = 1.6, d = 1.8, h = 4.2, ry = -1.3;
    tenement(b, rng, { x, z, w, d, h, ry, roof: 'gable' });
    b.push({ x, z, ry });
    b.quad(0.4, 0.55, { x: 0.0, y: 2.55, z: d / 2 + 0.012, mat: M.smooth, color: '#3a3328' });
    figure(b, { x: 0, y: 2.3, z: d / 2 + 0.02, h: 0.3, bend: 0.2, coat: '#6c625a' });
    b.box(0.5, 0.25, 0.015, { y: 2.2, z: d / 2 + 0.12, rx: 0.5, color: '#7a5e52', mat: M.cloth }); // the rug
    b.pop();
    const p = new THREE.Vector3(0, 2.6, d / 2 + 0.08).applyAxisAngle(new THREE.Vector3(0, 1, 0), ry);
    beings.push([x + p.x, p.y, z + p.z]);
    keep.push([x, z, 1.5]);
  }
  {
    const x = -2.4, z = -5.4, w = 2.2, d = 1.8, h = 4.6;
    tenement(b, rng, { x, z, w, d, h, ry: 0.3, roof: 'flat' });
    figure(b, { x: x + 0.3, y: h + 0.14, z: z + 0.2, ry: 0.5, bend: -0.25, coat: '#58606a', h: 0.3 });
    // kite on a long string
    const kite = [x + 1.6, h + 3.2, z - 1.2];
    b.geo(new THREE.ConeGeometry(0.22, 0.4, 4, 1), { x: kite[0], y: kite[1], z: kite[2], rx: 1.2, sx: 1, sz: 0.25, color: '#9d8d74', mat: M.cloth });
    const L = new Lines();
    L.rope([x + 0.35, h + 0.45, z + 0.2], kite, -0.3, '#c9c0b0', 10, 0.9);
    L.path([kite, [kite[0] + 0.1, kite[1] - 0.35, kite[2] + 0.05], [kite[0] - 0.05, kite[1] - 0.7, kite[2] + 0.1]], '#c9c0b0', 0.9);
    object.add(L.build());
    beings.push([x + 0.3, h + 0.45, z + 0.2]);
    keep.push([x, z, 1.6]);
  }
  // 11. a cart horse, 12. a baby in a pram, 13. a sparrow on a washing line, 14. a man with a newspaper
  {
    horse(b, { x: 5.2, y: 0.08, z: 4.6, ry: -2.3 });
    b.box(0.5, 0.25, 0.8, { x: 5.75, y: 0.3, z: 5.15, ry: -2.3, color: '#5b4a3c', mat: M.wood });
    for (const s of [-1, 1]) b.torus(0.17, 0.02, { x: 5.75 + s * 0.25 * Math.cos(2.3), y: 0.25, z: 5.15 + s * 0.25 * Math.sin(2.3) * -1, ry: -2.3 + Math.PI / 2, color: '#3b302a', mat: M.wood, tseg: 12 });
    beings.push([5.2 - 0.36 * Math.sin(2.3) * -1, 0.6, 4.6 - 0.36 * Math.cos(2.3)]);
    keep.push([5.4, 4.9, 1.0]);
  }
  {
    const x = -4.0, z = 0.9;
    b.box(0.22, 0.14, 0.34, { x, y: 0.2, z, color: '#3d3e44' });
    b.geo(new THREE.SphereGeometry(0.15, 8, 6, 0, Math.PI), { x, y: 0.34, z: z - 0.08, rx: -Math.PI / 2 + 0.3, color: '#3d3e44', mat: M.cloth });
    for (const [wx, wz] of [[0.1, 0.12], [-0.1, 0.12], [0.1, -0.12], [-0.1, -0.12]]) b.torus(0.06, 0.012, { x: x + wx, y: 0.14, z: z + wz, ry: Math.PI / 2, color: '#222', tseg: 10, rseg: 3 });
    b.sphere(0.045, { x, y: 0.37, z: z - 0.02, color: '#e0c6b0', seg: 6 });
    figure(b, { x, y: 0.1, z: z + 0.4, ry: Math.PI, bend: 0.3, coat: '#4f4c48', skin: '#c9b2a0' });
    beings.push([x, 0.42, z - 0.02]);
  }
  {
    // washing line between two houses, with grey laundry and a sparrow
    const x = -6.4, z = 3.6, w = 1.5, d = 1.5, h = 2.8;
    tenement(b, rng, { x, z, w, d, h, ry: 0.8, roof: 'hip' });
    keep.push([x, z, 1.2]);
    const x2 = -7.6, z2 = -0.0;
    tenement(b, rng, { x: x2, z: z2, w: 1.4, d: 1.8, h: 3.6, ry: 1.3, roof: 'gable' });
    keep.push([x2, z2, 1.3]);
    const A = [-6.9, 2.4, 2.8], B = [-7.2, 2.7, 0.9];
    const L = new Lines();
    L.rope(A, B, 0.25, '#bdb8ae', 10, 0.8);
    object.add(L.build());
    for (let i = 1; i < 6; i++) {
      const t = i / 6;
      const px = A[0] + (B[0] - A[0]) * t, py = A[1] + (B[1] - A[1]) * t - 0.25 * 4 * t * (1 - t), pz = A[2] + (B[2] - A[2]) * t;
      if (i === 3) { bird(b, { x: px, y: py, z: pz, ry: 1.0 }); continue; }
      b.box(0.04, rng.range(0.2, 0.35), 0.22, { x: px, y: py - 0.18, z: pz, ry: 0.15, color: rng.pick(['#9a9ca0', '#b6b2a8', '#7d8088']), mat: M.cloth });
    }
    const t = 0.5;
    beings.push([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t - 0.25 + 0.06, A[2] + (B[2] - A[2]) * t]);
  }
  {
    figure(b, { x: 2.5, y: 0.1, z: 3.3, ry: -0.4, bend: 0.45, coat: '#3e4047', hat: true });
    b.box(0.2, 0.14, 0.01, { x: 2.48, y: 0.36, z: 3.45, ry: -0.4, rx: -0.6, color: '#c9c4b8', mat: M.cloth }); // newspaper
    beings.push([2.5, 0.42, 3.3]);
  }

  keep.push([0.3, 1.8, 2.4]);
  // ── the rest of the grey city: tenements in crooked rows
  let n = 0;
  for (let t = 0; t < 3000 && n < 38; t++) {
    const [x, z] = rng.inDisc(9.6);
    const w = rng.range(1.2, 2.2), d = rng.range(1.1, 1.8);
    const rad = Math.max(w, d) * 0.62;
    if (Math.hypot(x, z) + rad > 10.1) continue;
    let ok = true;
    for (const [kx, kz, kr] of keep) if (Math.hypot(kx - x, kz - z) < kr + rad + 0.2) { ok = false; break; }
    if (!ok) continue;
    keep.push([x, z, rad]);
    n++;
    const rr = Math.hypot(x, z);
    // low sheds and two-storey houses toward the viewer, tall tenements behind
    const front = Math.max(0, Math.cos(Math.atan2(z, x) - 1.07)) * Math.min(1, rr / 6);
    if (front > 0.75 && rng.chance(0.5)) { keep.pop(); n--; continue; }
    const h = (rng.range(2.0, 4.2) + (rr < 6 ? rng.range(0, 1.6) : 0)) * (1 - 0.6 * front);
    tenement(b, rng, { x, z, w, d, h, ry: -Math.atan2(z, x) + rng.range(-0.25, 0.25), roof: rng.pick(['gable', 'gable', 'hip', 'flat']) });
  }
  // the crowd: bent figures, many under umbrellas, walking the alleys
  const crowd = [];
  for (let t = 0; t < 2000 && crowd.length < 34; t++) {
    const [x, z] = rng.inDisc(9.8);
    let ok = true;
    for (const [kx, kz, kr] of keep) if (Math.hypot(kx - x, kz - z) < kr + 0.15) { ok = false; break; }
    for (const [cx, cz] of crowd) if (Math.hypot(cx - x, cz - z) < 0.35) { ok = false; break; }
    if (Math.hypot(x, z) < 0.7) ok = false;
    if (!ok) continue;
    crowd.push([x, z]);
    figure(b, { x, y: 0.1, z, ry: rng.range(0, 6.28), bend: rng.range(0.3, 0.55), coat: rng.pick(COATS), umbrella: rng.chance(0.45), hat: rng.chance(0.4) });
  }
  // gutters & drainpipes on a few walls are implied by the rain; add street lamps (dim)
  object.add(b.build());

  // ── rain: thin falling streaks updated in a small buffer
  const RAIN = 480, RH = 12;
  const rainPos = new Float32Array(RAIN * 6);
  const rainBase = new Float32Array(RAIN * 3);
  const rainSpeed = new Float32Array(RAIN);
  for (let i = 0; i < RAIN; i++) {
    const [x, z] = rng.inDisc(10.2);
    rainBase[i * 3] = x; rainBase[i * 3 + 1] = rng.range(0, RH); rainBase[i * 3 + 2] = z;
    rainSpeed[i] = rng.range(7, 9.5);
  }
  const rainGeo = new THREE.BufferGeometry();
  rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
  const rain = new THREE.LineSegments(rainGeo, new THREE.LineBasicMaterial({ color: '#b9c6d6', transparent: true, opacity: 0.22, depthWrite: false }));
  rain.frustumCulled = false;
  object.add(rain);

  // ── the thread of light
  const NB = beings.length;
  // the order: first the text's chain (child → dog → mason → girl → passer-by), then a seeded wander
  const seq = [0, 1, 2, 3, 4];
  let last = 4;
  for (let i = 0; i < 43; i++) {
    let nx;
    do { nx = rng.int(0, NB - 1); } while (nx === last || nx === seq[seq.length - 2]);
    seq.push(nx);
    last = nx;
  }
  const HOP = 1.25; // seconds per jump
  const TRAIL = 7; // hops kept in the trail
  const SAMPLES = 22;
  const P = beings.map((p) => new THREE.Vector3(...p));
  const beadCount = TRAIL * SAMPLES;
  const beads = new THREE.InstancedMesh(new THREE.SphereGeometry(0.07, 6, 4), new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false }), beadCount);
  beads.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const thr = new THREE.Color(accent).lerp(new THREE.Color('#ffd27a'), 0.65);
  for (let i = 0; i < beadCount; i++) beads.setColorAt(i, thr);
  beads.frustumCulled = false;
  object.add(beads);
  const halos = new THREE.InstancedMesh(new THREE.SphereGeometry(0.16, 10, 8), new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false, transparent: true, opacity: 0.85, depthWrite: false }), NB);
  for (let i = 0; i < NB; i++) halos.setColorAt(i, thr);
  halos.frustumCulled = false;
  object.add(halos);
  const spark = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), glowMat('#fff1c8', 4));
  object.add(spark);

  const _m = new THREE.Matrix4(), _v = new THREE.Vector3(), _c = new THREE.Color(), _s = new THREE.Vector3(), _q = new THREE.Quaternion();
  const arc = (a, bb, u, out) => {
    const A = P[a], B = P[bb];
    const dist = A.distanceTo(B);
    out.lerpVectors(A, B, u);
    out.y += Math.sin(Math.PI * u) * (0.35 + dist * 0.28);
    return out;
  };

  function update(t) {
    // rain
    for (let i = 0; i < RAIN; i++) {
      let y = rainBase[i * 3 + 1] - t * rainSpeed[i];
      y = ((y % RH) + RH) % RH;
      const x = rainBase[i * 3], z = rainBase[i * 3 + 2];
      rainPos[i * 6] = x; rainPos[i * 6 + 1] = y + 0.45; rainPos[i * 6 + 2] = z;
      rainPos[i * 6 + 3] = x + 0.03; rainPos[i * 6 + 4] = y; rainPos[i * 6 + 5] = z + 0.02;
    }
    rainGeo.attributes.position.needsUpdate = true;

    // thread
    const ht = t / HOP;
    const hop = Math.floor(ht);
    const u = ht - hop;
    const eu = u * u * (3 - 2 * u);
    for (let k = 0; k < TRAIL; k++) {
      const h = hop - k;
      const a = seq[((h % seq.length) + seq.length) % seq.length];
      const bb = seq[(((h + 1) % seq.length) + seq.length) % seq.length];
      for (let s = 0; s < SAMPLES; s++) {
        const idx = k * SAMPLES + s;
        let uu = s / (SAMPLES - 1);
        // the current hop is drawn only up to the spark
        let vis = 1;
        if (k === 0) { if (uu > eu) vis = 0; }
        const age = k + eu - uu; // how many hops ago this bead was drawn
        const fade = vis * Math.max(0, 1 - age / (TRAIL - 1));
        if (h < 0 || fade <= 0.001) {
          _m.makeScale(0, 0, 0);
          beads.setMatrixAt(idx, _m);
          continue;
        }
        arc(a, bb, uu, _v);
        const sc = 0.35 + 0.75 * fade;
        _s.set(sc, sc, sc);
        _m.compose(_v, _q, _s);
        beads.setMatrixAt(idx, _m);
        _c.copy(thr).multiplyScalar(0.6 + 2.6 * fade * fade);
        beads.setColorAt(idx, _c);
      }
    }
    beads.instanceMatrix.needsUpdate = true;
    beads.instanceColor.needsUpdate = true;
    const a0 = seq[hop % seq.length], b0 = seq[(hop + 1) % seq.length];
    arc(a0, b0, eu, spark.position);
    // halos: a being glows for a moment when the thread reaches it, then loosens
    for (let i = 0; i < NB; i++) {
      // recompute from the sequence so the state is deterministic for any t
      let since = 99;
      for (let k = 0; k <= TRAIL; k++) {
        const hh = hop + 1 - k;
        if (hh < 0) break;
        if (seq[hh % seq.length] === i) {
          const tt = hh * HOP;
          if (tt <= t) { since = t - tt; break; }
        }
      }
      const g = since < 99 ? Math.exp(-since * 0.55) : 0;
      const sc = g > 0.01 ? 0.4 + 0.9 * g : 0;
      _s.set(sc, sc, sc);
      _m.compose(P[i], _q, _s);
      halos.setMatrixAt(i, _m);
      _c.copy(thr).multiplyScalar(0.4 + 1.6 * g);
      halos.setColorAt(i, _c);
    }
    halos.instanceMatrix.needsUpdate = true;
    halos.instanceColor.needsUpdate = true;
  }
  update(0);
  return { object, update };
}
