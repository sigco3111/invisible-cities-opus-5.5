// THEODORA — the city cleansed of animals, until the fabulous beasts return.
// A spotless geometric city of white blocks on a perfect grid, without a tree or
// a bird. At its centre the great round library; out of its open dome, among
// fluttering loose pages, the dethroned fauna of the bestiaries is waking:
// sphinxes guard the steps, a hydra rears from the oculus, a unicorn, a chimera
// and a basilisk have climbed the rooftops, and a griffin, a dragon and a harpy
// circle the sky — all porcelain and gold, like figures stepped out of a book.
import { THREE, Builder, M, C, column } from '../kit.js';

const PORC = '#f1cf8e'; // honey-glazed porcelain, warm against the cold white city
const PORC2 = '#e7b871';
const GOLD = C.gold;
const LAPIS = '#3a5a9a';
const OX = '#8e3b32';
const SM = M.smooth;
const GM = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.38, metalness: 0.65, emissive: '#3a2a08', emissiveIntensity: 0.4 });

// wings: double-sided porcelain with a little self-light so the undersides never go black
const WING = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.7, emissive: '#7a6646', emissiveIntensity: 0.55 });

/* ------------------------------------------------------------- BEASTS -- */
// Every beast is built in local space: +z forward, y up, feet at y=0, size ~1.

function lionBody(b, { s = 1, recline = false, fly = false, color = PORC }) {
  const by = recline ? 0.28 * s : 0.55 * s;
  b.sphere(1, { y: by, z: 0.05 * s, sx: 0.26 * s, sy: 0.25 * s, sz: 0.5 * s, color, mat: SM, seg: 14 });
  b.sphere(1, { y: by + 0.04 * s, z: 0.32 * s, sx: 0.27 * s, sy: 0.28 * s, sz: 0.27 * s, color, mat: SM, seg: 12 });
  if (recline) {
    for (const sx of [-1, 1]) {
      b.geo(new THREE.CapsuleGeometry(0.07 * s, 0.42 * s, 3, 8).rotateX(Math.PI / 2), { x: sx * 0.14 * s, y: 0.07 * s, z: 0.55 * s, color, mat: SM });
      b.sphere(1, { x: sx * 0.2 * s, y: 0.16 * s, z: -0.25 * s, sx: 0.1 * s, sy: 0.15 * s, sz: 0.24 * s, color, mat: SM, seg: 10 });
      b.sphere(0.06 * s, { x: sx * 0.14 * s, y: 0.05 * s, z: 0.8 * s, color: GOLD, mat: GM, seg: 8 });
    }
  } else if (fly) {
    // legs stretched back like a leaping cat, golden claws forward
    for (const [lx, lz, f] of [[0.15, 0.36, 1], [-0.15, 0.36, 1], [0.15, -0.3, 0], [-0.15, -0.3, 0]]) {
      const end = f ? [lx * s, by - 0.3 * s, (lz + 0.3) * s] : [lx * s, by - 0.25 * s, (lz - 0.4) * s];
      b.rod([lx * s, by - 0.1 * s, lz * s], end, 0.055 * s, { color, mat: SM, r2: 0.045 * s });
      b.sphere(0.065 * s, { x: end[0], y: end[1], z: end[2], color: GOLD, mat: GM, seg: 8 });
    }
  } else {
    for (const [lx, lz] of [[0.15, 0.36], [-0.15, 0.36], [0.15, -0.3], [-0.15, -0.3]]) {
      b.cyl(0.055 * s, 0.07 * s, by, { x: lx * s, z: lz * s, color, mat: SM, seg: 8 });
      b.sphere(0.07 * s, { x: lx * s, y: 0.02 * s, z: (lz + 0.03) * s, color: GOLD, mat: GM, seg: 8 });
    }
  }
  // tail with a gilded tuft
  const tb = by + 0.05 * s;
  b.tube([[0, tb, -0.45 * s], [0, tb + 0.1 * s, -0.75 * s], [0.08 * s, tb + 0.35 * s, -0.85 * s]], 0.025 * s, { color, mat: SM, tseg: 10 });
  b.sphere(0.06 * s, { x: 0.08 * s, y: tb + 0.37 * s, z: -0.86 * s, color: GOLD, mat: GM, seg: 8 });
  return by;
}

/** feathered wing in local space, root at origin, spreading along +x, swept back (-z) */
function wing(b, { s = 1, side = 1, color = PORC, edge = GOLD, span = 1.2, membrane = false }) {
  const pts = membrane
    ? [[0, 0.15], [0.35, 0.3], [0.8, 0.25], [1.0, 0.0], [0.82, -0.18], [0.62, -0.05], [0.45, -0.28], [0.25, -0.12], [0, -0.3]]
    : [[0, 0.15], [0.4, 0.22], [0.85, 0.12], [1.0, -0.02], [0.8, -0.2], [0.55, -0.35], [0.3, -0.38], [0, -0.3]];
  const sh = new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x * span * s * side, z * span * s)));
  const g = new THREE.ShapeGeometry(sh);
  g.rotateX(-Math.PI / 2);
  g.scale(1, 1, -1);
  b.geo(g, { color, mat: WING });
  // gilded leading edge and feather ribs
  b.tube([[0, 0.01, 0.15 * span * s], [0.4 * span * s * side, 0.03, 0.22 * span * s], [0.85 * span * s * side, 0.02, 0.12 * span * s], [1.0 * span * s * side, 0.0, -0.02 * span * s]], 0.022 * s, { color: edge, mat: GM, tseg: 14, rseg: 4 });
  const ribs = membrane ? [[0.8, 0.25, 0.62, -0.05], [1.0, 0.0, 0.82, -0.18], [0.35, 0.3, 0.45, -0.28], [0.1, 0.18, 0.25, -0.12]] : [[0.3, 0.2, 0.3, -0.36], [0.55, 0.18, 0.55, -0.33], [0.78, 0.13, 0.8, -0.18]];
  for (const [ax, az, bx, bz] of ribs) b.rod([ax * span * s * side, 0.02, az * span * s], [bx * span * s * side, 0.02, bz * span * s], 0.009 * s, { color: edge, mat: GM, seg: 4 });
}

function sphinx(b, { x, y = 0, z, ry, s = 1 }) {
  b.push({ x, y, z, ry });
  // a plinth
  b.box(0.75 * s, 0.18 * s, 1.9 * s, { y: 0, z: 0.05 * s, color: '#e4e7ea', mat: SM });
  b.box(0.82 * s, 0.04 * s, 1.97 * s, { y: 0.18 * s, z: 0.05 * s, color: GOLD, mat: GM });
  b.push({ y: 0.22 * s });
  lionBody(b, { s, recline: true });
  // human head with a striped nemes headdress
  b.sphere(0.15 * s, { y: 0.72 * s, z: 0.42 * s, color: PORC2, mat: SM, seg: 12 });
  b.geo(new THREE.CylinderGeometry(0.12 * s, 0.24 * s, 0.34 * s, 4, 1).rotateY(Math.PI / 4), { y: 0.72 * s, z: 0.38 * s, sz: 0.7, color: GOLD, mat: GM });
  for (let i = 0; i < 4; i++) b.box(0.4 * s, 0.018 * s, 0.24 * s, { y: (0.6 + i * 0.065) * s, z: 0.36 * s, color: LAPIS, mat: SM });
  b.sphere(0.1 * s, { y: 0.72 * s, z: 0.5 * s, sx: 1, sy: 1.15, sz: 0.7, color: PORC2, mat: SM, seg: 10 }); // face
  b.box(0.04 * s, 0.14 * s, 0.04 * s, { y: 0.48 * s, z: 0.55 * s, color: GOLD, mat: GM }); // beard
  b.pop();
  b.pop();
}

function unicorn(b, { x, y = 0, z, ry, s = 1, rear = 0 }) {
  b.push({ x, y, z, ry });
  b.push({ rx: -rear, y: 0, z: -0.3 * s });
  b.push({ z: 0.3 * s });
  b.geo(new THREE.CapsuleGeometry(0.17 * s, 0.55 * s, 4, 12).rotateX(Math.PI / 2), { y: 0.72 * s, color: PORC, mat: SM });
  // legs (front pair raised when rearing)
  for (const [lx, lz, front] of [[0.1, 0.3, 1], [-0.1, 0.3, 1], [0.1, -0.3, 0], [-0.1, -0.3, 0]]) {
    if (front && rear > 0) {
      b.rod([lx * s, 0.65 * s, lz * s], [lx * s, 0.5 * s, (lz + 0.25) * s], 0.04 * s, { color: PORC, mat: SM });
      b.rod([lx * s, 0.5 * s, (lz + 0.25) * s], [lx * s, 0.3 * s, (lz + 0.2) * s], 0.035 * s, { color: PORC, mat: SM });
      b.cyl(0.045 * s, 0.045 * s, 0.05 * s, { x: lx * s, y: 0.27 * s, z: (lz + 0.2) * s, color: GOLD, mat: GM, seg: 8 });
    } else {
      b.cyl(0.035 * s, 0.045 * s, 0.62 * s, { x: lx * s, y: 0.05 * s, z: lz * s, color: PORC, mat: SM, seg: 8 });
      b.cyl(0.05 * s, 0.05 * s, 0.06 * s, { x: lx * s, y: 0, z: lz * s, color: GOLD, mat: GM, seg: 8 });
    }
  }
  // neck and head
  b.rod([0, 0.8 * s, 0.32 * s], [0, 1.18 * s, 0.5 * s], 0.09 * s, { color: PORC, mat: SM, r2: 0.07 * s, seg: 10 });
  b.geo(new THREE.CapsuleGeometry(0.075 * s, 0.22 * s, 3, 8).rotateX(Math.PI / 2 - 0.5), { y: 1.18 * s, z: 0.6 * s, color: PORC, mat: SM });
  // the spiral golden horn
  b.cone(0.035 * s, 0.42 * s, { y: 1.27 * s, z: 0.6 * s, rx: 0.75, color: GOLD, mat: GM, seg: 8 });
  for (let i = 0; i < 4; i++) b.torus(0.03 * s * (1 - i * 0.2), 0.008 * s, { y: (1.3 + i * 0.07) * s, z: (0.62 + i * 0.065) * s, rx: 0.75 + Math.PI / 2, color: GOLD, mat: GM, tseg: 10, rseg: 3 });
  // gilded mane and flowing tail
  for (let i = 0; i < 6; i++) b.sphere(0.05 * s, { y: (0.86 + i * 0.065) * s, z: (0.28 + i * 0.04) * s, x: 0, sx: 0.5, sz: 1.4, color: GOLD, mat: GM, seg: 6 });
  b.tube([[0, 0.8 * s, -0.42 * s], [0.05 * s, 0.7 * s, -0.62 * s], [-0.05 * s, 0.45 * s, -0.68 * s], [0, 0.3 * s, -0.6 * s]], 0.04 * s, { color: GOLD, mat: GM, tseg: 14 });
  b.pop();
  b.pop();
  b.pop();
}

function chimera(b, { x, y = 0, z, ry, s = 1 }) {
  b.push({ x, y, z, ry });
  const by = lionBody(b, { s });
  // lion head with a gilded mane
  b.geo(new THREE.IcosahedronGeometry(0.24 * s, 1), { y: by + 0.22 * s, z: 0.5 * s, color: GOLD, mat: GM });
  b.sphere(0.15 * s, { y: by + 0.2 * s, z: 0.62 * s, color: PORC, mat: SM, seg: 12 });
  b.box(0.12 * s, 0.07 * s, 0.1 * s, { y: by + 0.1 * s, z: 0.74 * s, color: OX, mat: SM }); // roaring mouth
  // goat head rising from the back
  b.rod([0, by + 0.15 * s, 0.05 * s], [0, by + 0.5 * s, 0.12 * s], 0.06 * s, { color: PORC2, mat: SM });
  b.geo(new THREE.CapsuleGeometry(0.06 * s, 0.14 * s, 3, 8).rotateX(Math.PI / 2 - 0.4), { y: by + 0.55 * s, z: 0.18 * s, color: PORC2, mat: SM });
  for (const sx of [-1, 1]) b.tube([[sx * 0.04 * s, by + 0.6 * s, 0.13 * s], [sx * 0.1 * s, by + 0.75 * s, 0.05 * s], [sx * 0.16 * s, by + 0.68 * s, -0.04 * s]], 0.018 * s, { color: GOLD, mat: GM, tseg: 8, rseg: 4 });
  // serpent tail ending in a head
  b.tube([[0, by, -0.45 * s], [0.1 * s, by + 0.1 * s, -0.75 * s], [0.25 * s, by + 0.35 * s, -0.8 * s], [0.3 * s, by + 0.55 * s, -0.62 * s]], 0.04 * s, { color: '#cfd9b8', mat: SM, tseg: 16 });
  b.sphere(0.07 * s, { x: 0.3 * s, y: by + 0.58 * s, z: -0.55 * s, sz: 1.5, color: '#cfd9b8', mat: SM, seg: 8 });
  b.pop();
}

function basilisk(b, { x, y = 0, z, ry, s = 1 }) {
  b.push({ x, y, z, ry });
  // coiled serpent body
  const pts = [];
  for (let i = 0; i <= 26; i++) {
    const t = i / 26;
    const a = t * Math.PI * 4.2;
    const r = (0.42 - t * 0.22) * s;
    pts.push([Math.cos(a) * r, (0.07 + t * 0.45) * s, Math.sin(a) * r]);
  }
  const top = pts[pts.length - 1];
  pts.push([top[0], top[1] + 0.25 * s, top[2] + 0.12 * s]);
  b.tube(pts, 0.065 * s, { color: '#6fa77a', mat: SM, tseg: 90, rseg: 7 });
  // golden scales along the spine
  for (let i = 2; i < pts.length - 2; i += 2) b.sphere(0.035 * s, { x: pts[i][0], y: pts[i][1] + 0.06 * s, z: pts[i][2], color: GOLD, mat: GM, seg: 6 });
  const hx = top[0], hy = top[1] + 0.3 * s, hz = top[2] + 0.18 * s;
  // rooster head: crest and wattle
  b.sphere(0.1 * s, { x: hx, y: hy, z: hz, sz: 1.3, color: PORC, mat: SM, seg: 10 });
  b.cone(0.04 * s, 0.1 * s, { x: hx, y: hy - 0.01 * s, z: hz + 0.13 * s, rx: Math.PI / 2, color: GOLD, mat: GM, seg: 6 });
  for (let i = 0; i < 4; i++) b.sphere(0.04 * s, { x: hx, y: hy + 0.09 * s + Math.sin(i) * 0.02 * s, z: hz + (0.06 - i * 0.05) * s, sx: 0.4, color: OX, mat: SM, seg: 6 });
  b.sphere(0.035 * s, { x: hx, y: hy - 0.09 * s, z: hz + 0.07 * s, sx: 0.5, color: OX, mat: SM, seg: 6 });
  // stubby rooster wings
  for (const side of [-1, 1]) {
    b.push({ x: hx + side * 0.06 * s, y: hy - 0.22 * s, z: hz - 0.1 * s, rz: side * 0.6, ry: side * -0.4 });
    wing(b, { s: s * 0.35, side, span: 1 });
    b.pop();
  }
  b.pop();
}

function griffinBody(b, s, fly = false) {
  const by = lionBody(b, { s, fly });
  // eagle forequarters: feathered chest, neck, head and golden beak
  b.sphere(1, { y: by + 0.12 * s, z: 0.38 * s, sx: 0.24 * s, sy: 0.3 * s, sz: 0.24 * s, color: PORC2, mat: SM, seg: 12 });
  b.sphere(0.15 * s, { y: by + 0.42 * s, z: 0.52 * s, color: PORC, mat: SM, seg: 12 });
  b.cone(0.07 * s, 0.2 * s, { y: by + 0.4 * s, z: 0.62 * s, rx: Math.PI / 2 + 0.4, color: GOLD, mat: GM, seg: 8 });
  for (const sx of [-1, 1]) b.cone(0.03 * s, 0.14 * s, { x: sx * 0.07 * s, y: by + 0.52 * s, z: 0.45 * s, rx: -0.6, color: GOLD, mat: GM, seg: 5 });
  b.sphere(0.022 * s, { x: 0.1 * s, y: by + 0.46 * s, z: 0.6 * s, color: LAPIS, mat: SM, seg: 6 });
  b.sphere(0.022 * s, { x: -0.1 * s, y: by + 0.46 * s, z: 0.6 * s, color: LAPIS, mat: SM, seg: 6 });
  return by;
}

function harpyBody(b, s) {
  // bird body, woman's head and shoulders, gilded talons
  b.sphere(1, { y: 0, sx: 0.22 * s, sy: 0.22 * s, sz: 0.38 * s, color: PORC2, mat: SM, seg: 12 });
  b.sphere(0.13 * s, { y: 0.22 * s, z: 0.3 * s, color: PORC, mat: SM, seg: 12 }); // shoulders
  b.sphere(0.1 * s, { y: 0.38 * s, z: 0.38 * s, color: PORC, mat: SM, seg: 12 });
  b.tube([[0, 0.45 * s, 0.33 * s], [0, 0.4 * s, 0.18 * s], [0, 0.25 * s, 0.08 * s]], 0.06 * s, { color: GOLD, mat: GM, tseg: 8 }); // hair
  b.geo(new THREE.ConeGeometry(0.2 * s, 0.4 * s, 6).rotateX(-Math.PI / 2), { z: -0.5 * s, sy: 0.25, color: PORC, mat: SM }); // tail fan
  for (const sx of [-1, 1]) {
    b.rod([sx * 0.08 * s, -0.15 * s, 0], [sx * 0.08 * s, -0.4 * s, 0.1 * s], 0.025 * s, { color: GOLD, mat: GM });
    for (let k = -1; k <= 1; k++) b.cone(0.012 * s, 0.08 * s, { x: sx * 0.08 * s + k * 0.03 * s, y: -0.4 * s, z: 0.12 * s, rx: Math.PI / 2 + 0.6, color: GOLD, mat: GM, seg: 4 });
  }
}

function dragonBody(b, s) {
  // serpentine porcelain body, gold spine, horned head
  const pts = [];
  for (let i = 0; i <= 14; i++) {
    const t = i / 14;
    pts.push([Math.sin(t * Math.PI * 2.2) * 0.25 * s, Math.sin(t * Math.PI * 1.3) * 0.12 * s, (0.9 - t * 2.4) * s]);
  }
  b.tube(pts, 0.11 * s, { color: '#4f9a82', mat: SM, tseg: 60, rseg: 8 });
  // tapering tail tip
  const L = pts[pts.length - 1];
  b.cone(0.1 * s, 0.4 * s, { x: L[0], y: L[1], z: L[2], rx: -Math.PI / 2, color: '#4f9a82', mat: SM, seg: 8 });
  b.geo(new THREE.ConeGeometry(0.12 * s, 0.22 * s, 3).rotateX(-Math.PI / 2), { x: L[0], y: L[1], z: L[2] - 0.45 * s, sy: 0.2, color: GOLD, mat: GM });
  for (let i = 1; i < pts.length; i++) b.cone(0.04 * s, 0.1 * s, { x: pts[i][0], y: pts[i][1] + 0.09 * s, z: pts[i][2], color: GOLD, mat: GM, seg: 4 });
  // head
  const H = pts[0];
  b.geo(new THREE.CapsuleGeometry(0.1 * s, 0.26 * s, 3, 8).rotateX(Math.PI / 2), { x: H[0], y: H[1] + 0.05 * s, z: H[2] + 0.18 * s, color: '#4f9a82', mat: SM });
  for (const sx of [-1, 1]) b.cone(0.03 * s, 0.22 * s, { x: H[0] + sx * 0.06 * s, y: H[1] + 0.12 * s, z: H[2] + 0.1 * s, rx: -0.9, color: GOLD, mat: GM, seg: 5 });
  b.box(0.1 * s, 0.02 * s, 0.2 * s, { x: H[0], y: H[1] - 0.04 * s, z: H[2] + 0.3 * s, color: OX, mat: SM });
  // little gold legs tucked under
  for (const [lz, sx] of [[0.4, 1], [0.4, -1], [-0.6, 1], [-0.6, -1]]) b.rod([sx * 0.06 * s, -0.05 * s, lz * s], [sx * 0.12 * s, -0.22 * s, (lz + 0.08) * s], 0.025 * s, { color: GOLD, mat: GM });
}

function hydra(b, s) {
  // a coiled mass with seven necks rising from the dome's oculus (necks animated separately)
  b.sphere(1, { y: 0.1 * s, sx: 0.55 * s, sy: 0.3 * s, sz: 0.55 * s, color: '#7aa68a', mat: SM, seg: 14 });
}

/* --------------------------------------------------------------- CITY -- */

export default function build({ rng, accent }) {
  const object = new THREE.Group();
  const b = new Builder();

  // the spotless ground: white marble with a precise inlaid grid
  b.cyl(10.4, 10.5, 0.1, { color: '#e3e6e8', seg: 72, mat: SM });
  const G = 1.6; // grid pitch
  for (let i = -6; i <= 6; i++) {
    const c = i * G + G / 2;
    const L = 2 * Math.sqrt(Math.max(0, 10.2 * 10.2 - c * c));
    if (L <= 0) continue;
    b.box(0.05, 0.012, L, { x: c, y: 0.1, color: '#b9c0c6' });
    b.box(L, 0.012, 0.05, { z: c, y: 0.1, color: '#b9c0c6' });
  }
  b.torus(10.15, 0.06, { rx: Math.PI / 2, y: 0.12, color: '#c9cfd4', tseg: 96, rseg: 4 });

  // the blocks: perfect grid, heights in symmetric steps, no trees, no birds
  const roofs = []; // tops available for beasts
  for (let i = -6; i <= 6; i++) {
    for (let j = -6; j <= 6; j++) {
      const x = i * G, z = j * G;
      const r = Math.hypot(x, z);
      if (r < 3.9 || r > 9.6) continue;
      // keep a wide avenue from the library to the viewer's side (+z) and its cross axis
      if (i === 0 || j === 0) continue;
      if (Math.abs(i) <= 1 && j > 0) continue; // the processional avenue to the library
      const ring = Math.max(Math.abs(i), Math.abs(j));
      const h = [0, 0, 2.3, 2.0, 1.7, 1.4, 1.1][ring] ?? 1.0;
      const w = G - 0.42;
      const tone = (i + j) % 2 === 0 ? '#e1e8ee' : '#d4dde4';
      b.box(w, h, w, { x, z, color: tone, mat: SM });
      b.box(w + 0.06, 0.06, w + 0.06, { x, z, y: h, color: '#d3d9dd', mat: SM });
      // strict ribbon windows: dark glass bands, every storey
      for (let y = 0.45; y < h - 0.2; y += 0.6) {
        for (const [fx, fz, ry] of [[0, w / 2 + 0.006, 0], [0, -w / 2 - 0.006, Math.PI], [w / 2 + 0.006, 0, Math.PI / 2], [-w / 2 - 0.006, 0, -Math.PI / 2]]) {
          b.quad(w * 0.82, 0.16, { x: x + fx, y, z: z + fz, ry, color: '#7f909c', mat: SM });
        }
      }
      // a few roof boxes, aligned
      if ((i * 7 + j * 3) % 4 === 0) b.box(w * 0.4, 0.25, w * 0.4, { x, z, y: h + 0.06, color: '#dfe4e7', mat: SM });
      else roofs.push([x, h + 0.06, z, ring]);
    }
  }
  // sterile little colonnades lining the avenue
  for (const sgn of [-1, 1]) {
    for (let k = 0; k < 6; k++) {
      const zz = 4.1 + k * 1.0;
      column(b, { x: sgn * 2.05, z: zz, h: 1.1, r: 0.06, color: '#eef0f2' });
      column(b, { x: zz, z: sgn * 0.62, h: 1.1, r: 0.06, color: '#eef0f2' });
      column(b, { x: -zz, z: sgn * 0.62, h: 1.1, r: 0.06, color: '#eef0f2' });
      column(b, { x: sgn * 0.62, z: -zz, h: 1.1, r: 0.06, color: '#eef0f2' });
    }
  }

  // ── THE LIBRARY: a round reading-hall, colonnade outside, shelves of books within
  const LR = 2.75, LH = 2.9;
  b.cyl(LR + 0.55, LR + 0.7, 0.35, { y: 0.1, color: '#e9ecee', mat: SM, seg: 48 }); // podium
  b.cyl(LR + 0.35, LR + 0.45, 0.2, { y: 0.45, color: '#f1f3f4', mat: SM, seg: 48 });
  // front steps toward +z
  for (let i = 0; i < 5; i++) b.box(1.8, 0.65 - i * 0.12, 0.28, { z: LR + 0.45 + i * 0.28, y: 0.1, color: '#eef0f2', mat: SM });
  // inner drum lined with shelves of coloured books (warm, the only colour in the city)
  b.cyl(LR - 0.55, LR - 0.55, LH, { y: 0.65, color: '#6f4a32', mat: M.wood, seg: 40 });
  const bookCols = ['#8e3b32', '#2f4f7a', '#3e6b4a', '#b2873e', '#5a3a5e', '#a0522d', '#c9b27a', '#2c3e50'];
  const nShelf = 5, nBay = 40;
  for (let k = 0; k < nBay; k++) {
    const a = (k / nBay) * Math.PI * 2;
    for (let sh = 0; sh < nShelf; sh++) {
      const yy = 0.75 + sh * (LH - 0.3) / nShelf;
      // a run of books on this shelf bay
      const rr = LR - 0.5;
      let off = -0.17;
      while (off < 0.17) {
        const bw = rng.range(0.025, 0.05);
        const bh = rng.range(0.28, 0.42);
        const aa = a + off / rr;
        b.box(bw, bh, 0.1, { x: Math.cos(aa) * rr, y: yy, z: Math.sin(aa) * rr, ry: -aa + Math.PI / 2, color: rng.pick(bookCols), mat: SM });
        off += bw + 0.004;
      }
      // the gap where a beast has already left its book empty
    }
  }
  for (let sh = 0; sh <= nShelf; sh++) b.torus(LR - 0.48, 0.025, { rx: Math.PI / 2, y: 0.72 + sh * (LH - 0.3) / nShelf, color: '#5a3a28', mat: M.wood, tseg: 64, rseg: 3 });
  // warm reading lamps glowing inside
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + 0.2;
    b.sphere(0.07, { x: Math.cos(a) * 1.2, y: 1.2, z: Math.sin(a) * 1.2, mat: M.glow, color: C.lamp, glow: 2.2, seg: 8 });
    b.cyl(0.015, 0.015, 0.55, { x: Math.cos(a) * 1.2, y: 0.65, z: Math.sin(a) * 1.2, color: GOLD, mat: GM, seg: 4 });
  }
  b.disc(LR - 0.5, { y: 0.66, color: '#b8a27a', mat: SM });
  // reading tables
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
    b.box(0.9, 0.05, 0.35, { x: Math.cos(a) * 0.8, y: 0.95, z: Math.sin(a) * 0.8, ry: -a, color: '#6f4a32', mat: M.wood });
    b.box(0.6, 0.02, 0.4, { x: Math.cos(a) * 0.8, y: 1.0, z: Math.sin(a) * 0.8, ry: -a + 0.1, rz: 0.08, color: '#f7f0dc', mat: SM }); // open book
  }
  // outer colonnade
  const nCol = 24;
  for (let k = 0; k < nCol; k++) {
    const a = (k / nCol) * Math.PI * 2;
    column(b, { x: Math.cos(a) * LR, z: Math.sin(a) * LR, y: 0.65, h: LH, r: 0.12, color: '#f6f6f4' });
  }
  // entablature with a gilded band, then the dome opened by a great oculus
  b.lathe([[LR + 0.2, 0], [LR + 0.25, 0.05], [LR + 0.25, 0.42], [LR + 0.32, 0.5], [LR - 0.6, 0.5], [LR - 0.6, 0]], { y: 0.65 + LH, color: '#f3f4f2', mat: SM, seg: 64 });
  b.lathe([[LR + 0.255, 0.18], [LR + 0.27, 0.18], [LR + 0.27, 0.27], [LR + 0.255, 0.27]], { y: 0.65 + LH, color: GOLD, mat: GM, seg: 64 });
  const domeY = 0.65 + LH + 0.5;
  const domeProf = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12 * (Math.PI / 2 - 0.42);
    domeProf.push([Math.cos(t) * (LR + 0.05), Math.sin(t) * (LR + 0.05) * 0.85]);
  }
  for (let i = 12; i >= 0; i--) {
    const t = i / 12 * (Math.PI / 2 - 0.42);
    domeProf.push([Math.cos(t) * (LR - 0.1), Math.sin(t) * (LR - 0.1) * 0.85]);
  }
  b.lathe(domeProf, { y: domeY, color: '#f4f2ec', mat: SM, seg: 48 });
  // gilded ribs on the dome
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2;
    const pts = [];
    for (let i = 0; i <= 8; i++) {
      const t = i / 8 * (Math.PI / 2 - 0.42);
      const rr = Math.cos(t) * (LR + 0.08);
      pts.push([Math.cos(a) * rr, domeY + Math.sin(t) * (LR + 0.08) * 0.85, Math.sin(a) * rr]);
    }
    b.tube(pts, 0.035, { color: GOLD, mat: GM, tseg: 16, rseg: 4 });
  }
  const ocR = Math.cos(Math.PI / 2 - 0.42) * (LR + 0.05);
  const ocY = domeY + Math.sin(Math.PI / 2 - 0.42) * (LR + 0.05) * 0.85;
  b.torus(ocR, 0.07, { rx: Math.PI / 2, y: ocY, color: GOLD, mat: GM, tseg: 40, rseg: 6 });
  // light rising from inside the oculus
  b.disc(ocR - 0.05, { y: ocY - 0.6, mat: M.glow, color: '#ffe3a6', glow: 1.4 });

  // ── beasts already loose on the city
  sphinx(b, { x: -1.25, y: 0.1, z: LR + 2.25, ry: 0, s: 1.6 });
  sphinx(b, { x: 1.25, y: 0.1, z: LR + 2.25, ry: 0, s: 1.6 });
  // pick rooftops by quadrant so they spread around the city
  const pickRoof = (ang, ringWant) => {
    let best = null, bd = 1e9;
    for (const r of roofs) {
      const a = Math.atan2(r[2], r[0]);
      const da = Math.abs(((a - ang + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
      const d = da * 3 + Math.abs(r[3] - ringWant);
      if (d < bd) { bd = d; best = r; }
    }
    roofs.splice(roofs.indexOf(best), 1);
    return best;
  };
  {
    const r = pickRoof(0.55, 3);
    unicorn(b, { x: r[0], y: r[1], z: r[2], ry: -0.4, s: 2.2, rear: 0.35 });
  }
  {
    const r = pickRoof(2.55, 3);
    chimera(b, { x: r[0], y: r[1], z: r[2], ry: 1.9, s: 2.1 });
  }
  {
    const r = pickRoof(-0.9, 2);
    basilisk(b, { x: r[0], y: r[1], z: r[2], ry: 2.2, s: 2.0 });
  }
  {
    // a small griffin cub perched on a cornice, looking up at its parent
    const r = pickRoof(-2.4, 2);
    b.push({ x: r[0], y: r[1], z: r[2], ry: 0.6 });
    griffinBody(b, 0.8);
    for (const side of [-1, 1]) { b.push({ x: side * 0.12, y: 0.7, z: 0.15, rz: side * 0.9, ry: side * 0.3 }); wing(b, { s: 0.8, side, span: 0.8 }); b.pop(); }
    b.pop();
  }
  // more of the returning fauna, perched on the cornices all around
  {
    const perch = [[1.6, 4, (r) => sphinx(b, { x: r[0], y: r[1] - 0.06, z: r[2], ry: 1.2, s: 0.9 })],
      [-1.6, 4, (r) => { b.push({ x: r[0], y: r[1], z: r[2], ry: -2.2 }); griffinBody(b, 1.3); for (const side of [-1, 1]) { b.push({ x: side * 0.16, y: 0.9, z: 0.2, rz: side * 1.1, ry: side * 0.2 }); wing(b, { s: 1.3, side, span: 0.9, color: '#f3d27a' }); b.pop(); } b.pop(); }],
      [3.4, 3, (r) => basilisk(b, { x: r[0], y: r[1], z: r[2], ry: -1.0, s: 1.4 })],
      [0.0, 5, (r) => unicorn(b, { x: r[0], y: r[1], z: r[2], ry: 2.6, s: 1.5, rear: 0 })],
      [-0.4, 5, (r) => chimera(b, { x: r[0], y: r[1], z: r[2], ry: 0.4, s: 1.4 })]];
    for (const [ang, ring, fn] of perch) fn(pickRoof(ang, ring));
  }
  {
    // a book, fallen open on the avenue, a small sphinx climbing out of its pages
    const x = 0.0, z = 7.6;
    b.box(1.5, 0.08, 1.0, { x, z, y: 0.1, ry: 0.15, color: '#6f2a26', mat: SM });
    b.geo(new THREE.CylinderGeometry(0.5, 0.5, 0.7, 12, 1, false, 0, Math.PI), { x: x - 0.36, z, y: 0.18, ry: 0.15, rz: Math.PI / 2, sx: 0.12, color: '#f7f0dc', mat: SM });
    b.geo(new THREE.CylinderGeometry(0.5, 0.5, 0.7, 12, 1, false, 0, Math.PI), { x: x + 0.36, z, y: 0.18, ry: 0.15, rz: Math.PI / 2, sx: 0.12, color: '#f2e9d0', mat: SM });
    sphinx(b, { x: x + 0.1, y: 0.2, z: z - 0.1, ry: 0.6, s: 0.35 });
  }
  object.add(b.build());

  // ── HYDRA rearing from the oculus: necks sway (one group per neck pair)
  const hydraG = new THREE.Group();
  hydraG.position.y = ocY - 0.5;
  object.add(hydraG);
  const hb = new Builder();
  hydra(hb, 1.2);
  hydraG.add(hb.build());
  const necks = [];
  for (let k = 0; k < 7; k++) {
    const nb = new Builder();
    const a = (k / 7) * Math.PI * 2;
    const lean = k === 0 ? 0.1 : rng.range(0.7, 1.1);
    const len = k === 0 ? 2.4 : rng.range(1.6, 2.1);
    const pts = [[0, 0, 0], [0, len * 0.35, lean * 0.4], [0, len * 0.75, lean * 1.0], [0, len, lean * 1.3 + 0.15]];
    nb.tube(pts, 0.12, { color: '#7aa68a', mat: SM, tseg: 20, rseg: 7 });
    for (let i = 1; i < 6; i++) nb.sphere(0.04, { y: (i / 6) * len, z: lean * (i / 6) * 1.2 - 0.09, color: GOLD, mat: GM, seg: 6 });
    // head
    nb.geo(new THREE.CapsuleGeometry(0.14, 0.3, 3, 8).rotateX(Math.PI / 2 - 0.4), { y: len + 0.04, z: lean * 1.3 + 0.3, color: '#7aa68a', mat: SM });
    nb.box(0.08, 0.02, 0.16, { y: len - 0.05, z: lean * 1.3 + 0.38, rx: -0.4, color: OX, mat: SM });
    for (const sx of [-1, 1]) nb.cone(0.025, 0.14, { x: sx * 0.05, y: len + 0.12, z: lean * 1.3 + 0.18, rx: -0.8, color: GOLD, mat: GM, seg: 5 });
    const ng = nb.build();
    const holder = new THREE.Group();
    holder.rotation.y = Math.PI / 2 - a;
    holder.position.set(Math.cos(a) * (k === 0 ? 0 : 0.3), 0.15, Math.sin(a) * (k === 0 ? 0 : 0.3));
    holder.add(ng);
    hydraG.add(holder);
    necks.push({ g: ng, ph: rng.range(0, 6.28), sp: rng.range(0.5, 0.8) });
  }

  // ── the flying beasts: body group + two flapping wing groups each
  const flyers = [];
  const makeFlyer = (bodyFn, { s, span, membrane = false, wingAt, R, H, speed, phase, bob, wingColor = null }) => {
    const root = new THREE.Group();
    const bb = new Builder();
    bodyFn(bb, s);
    const body = bb.build();
    root.add(body);
    const wings = [];
    for (const side of [-1, 1]) {
      const wb = new Builder();
      wing(wb, { s, side, span, membrane, color: wingColor || (membrane ? '#b0493a' : PORC) });
      const wg = wb.build({ shadows: false });
      const pivot = new THREE.Group();
      pivot.position.set(side * wingAt[0] * s, wingAt[1] * s, wingAt[2] * s);
      pivot.add(wg);
      root.add(pivot);
      wings.push({ pivot, side });
    }
    object.add(root);
    flyers.push({ root, wings, R, H, speed, phase, bob, s });
  };
  makeFlyer((bb, s) => { griffinBody(bb, s, true); }, { s: 2.7, span: 1.15, wingAt: [0.12, 0.72, 0.2], R: 6.8, H: 9.0, speed: 0.13, phase: 0, bob: 0.5, wingColor: '#f3d27a' });
  makeFlyer((bb, s) => dragonBody(bb, s), { s: 2.8, span: 1.3, membrane: true, wingAt: [0.12, 0.05, 0.35], R: 7.4, H: 6.4, speed: -0.1, phase: 2.2, bob: 0.9 });
  makeFlyer((bb, s) => harpyBody(bb, s), { s: 2.2, span: 1.1, wingAt: [0.12, 0.1, 0.05], R: 4.6, H: 11.6, speed: 0.17, phase: 4.1, bob: 0.4, wingColor: '#6f8fd0' });

  // ── loose pages fluttering up out of the oculus
  const NP = 36;
  const pageGeo = new THREE.PlaneGeometry(0.22, 0.3);
  const pages = new THREE.InstancedMesh(pageGeo, new THREE.MeshStandardMaterial({ color: '#fbf5e6', roughness: 0.7, side: THREE.DoubleSide, emissive: '#5a4a2a', emissiveIntensity: 0.25 }), NP);
  pages.frustumCulled = false;
  object.add(pages);
  const page = [];
  for (let i = 0; i < NP; i++) page.push({ ph: rng(), a: rng.range(0, 6.28), r: rng.range(0.6, 3.6), sp: rng.range(0.05, 0.09), spin: rng.range(1, 3) });

  const _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(1, 1, 1), _e = new THREE.Euler();

  function update(t) {
    for (const N of necks) {
      N.g.rotation.x = Math.sin(t * N.sp + N.ph) * 0.18;
      N.g.rotation.z = Math.sin(t * N.sp * 0.7 + N.ph * 2) * 0.12;
    }
    for (const F of flyers) {
      const a = F.phase + t * F.speed;
      const y = F.H + Math.sin(t * 0.5 + F.phase) * F.bob;
      F.root.position.set(Math.cos(a) * F.R, y, Math.sin(a) * F.R);
      // face along the direction of travel, banked into the turn
      const dir = Math.sign(F.speed);
      F.root.rotation.set(0, 0, 0);
      F.root.rotation.order = 'YXZ';
      F.root.rotation.y = dir > 0 ? -a : Math.PI - a;
      F.root.rotation.z = dir * 0.28;
      F.root.rotation.x = -Math.cos(t * 0.5 + F.phase) * 0.12;
      const flap = Math.sin(t * 2.4 + F.phase * 3);
      for (const W of F.wings) W.pivot.rotation.z = W.side * (0.15 + flap * 0.55);
    }
    for (let i = 0; i < NP; i++) {
      const P = page[i];
      const u = (P.ph + t * P.sp) % 1;
      const a = P.a + u * 5;
      const rr = P.r * (0.25 + u);
      _p.set(Math.cos(a) * rr, ocY - 0.2 + u * 9, Math.sin(a) * rr);
      _e.set(t * P.spin + i, t * 0.7 + i, Math.sin(t * P.spin) * 0.8);
      _q.setFromEuler(_e);
      const sc = Math.min(1, u * 10, (1 - u) * 6);
      _s.set(sc, sc, sc);
      _m.compose(_p, _q, _s);
      pages.setMatrixAt(i, _m);
    }
    pages.instanceMatrix.needsUpdate = true;
  }
  update(0);
  return { object, update };
}
