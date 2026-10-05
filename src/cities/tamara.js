// Tamara — every object is an image of something else. The streets run like
// lines on a page, and the city is almost hidden by its signs: pincers for the
// tooth-drawer, a tankard for the tavern, halberds for the barracks, scales for
// the grocer; lions, dolphins, towers, stars. What lies beneath stays unseen.
import { THREE, Builder, M, C } from '../kit.js';
import { figure } from './_ab_util.js';

const ROT = 0.5; // the lines of the page face the usual viewpoint

/* ---------------------------------------------------------- emblems -- */
// each emblem is built around the origin, about 1 unit tall, facing +z
const shape = (pts, depth = 0.12) => {
  const s = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 1, curveSegments: 6 });
  g.translate(0, 0, -depth / 2);
  return g;
};
const star = (n, r1, r2) => { const p = []; for (let i = 0; i < n * 2; i++) { const a = Math.PI / 2 + (i * Math.PI) / n; const r = i % 2 ? r2 : r1; p.push([Math.cos(a) * r, Math.sin(a) * r]); } return p; };
const LION = [[-0.30, -0.5], [-0.18, -0.5], [-0.14, -0.22], [0.02, -0.2], [0.08, -0.5], [0.2, -0.5], [0.16, -0.12], [0.22, 0.06], [0.34, 0.1], [0.4, 0.3], [0.3, 0.26], [0.22, 0.2], [0.18, 0.3], [0.26, 0.42], [0.2, 0.5], [0.08, 0.48], [0.0, 0.4], [-0.08, 0.44], [-0.04, 0.3], [-0.12, 0.2], [-0.2, 0.0], [-0.32, -0.04], [-0.46, 0.14], [-0.52, 0.1], [-0.4, -0.12], [-0.28, -0.2]];
const DOLPHIN = [[-0.42, -0.36], [-0.3, -0.42], [-0.2, -0.3], [-0.24, -0.1], [-0.18, 0.12], [-0.02, 0.32], [0.18, 0.4], [0.36, 0.36], [0.44, 0.26], [0.4, 0.18], [0.3, 0.22], [0.24, 0.12], [0.3, 0.02], [0.18, 0.06], [0.08, 0.16], [-0.04, 0.06], [-0.08, -0.12], [-0.04, -0.3], [-0.12, -0.46], [-0.22, -0.4], [-0.3, -0.5]];
const BOOT = [[-0.2, 0.45], [0.08, 0.45], [0.08, -0.2], [0.38, -0.3], [0.4, -0.45], [-0.22, -0.45]];
const FISH = [[-0.45, 0], [-0.3, 0.12], [0.0, 0.2], [0.3, 0.1], [0.42, 0.22], [0.42, -0.22], [0.3, -0.1], [0.0, -0.2], [-0.3, -0.12]];
const SHIELD = [[-0.42, 0.45], [0.42, 0.45], [0.42, 0.0], [0.3, -0.28], [0.0, -0.5], [-0.3, -0.28], [-0.42, 0.0]];

const EMBLEMS = {
  pincers(b, col, mat) {
    for (const s of [-1, 1]) b.tube([[s * -0.25, -0.5, 0], [s * -0.12, -0.1, 0], [s * 0.05, 0.15, 0], [s * 0.18, 0.38, 0], [s * 0.05, 0.5, 0]], 0.04, { color: col, mat, tseg: 18, rseg: 6 });
    b.torus(0.06, 0.025, { y: 0.05, color: col, mat, tseg: 12, rseg: 4 });
    b.sphere(0.07, { y: -0.52, x: -0.25, color: col, mat, seg: 8 });
    b.sphere(0.07, { y: -0.52, x: 0.25, color: col, mat, seg: 8 });
    // the tooth
    b.lathe([[0.02, 0.32], [0.08, 0.36], [0.1, 0.48], [0.08, 0.58], [0.02, 0.6]], { y: 0.0, color: '#fbf6ea', mat: M.smooth, seg: 10 });
  },
  tankard(b, col, mat) {
    b.cyl(0.24, 0.28, 0.72, { y: -0.4, color: col, mat, seg: 16 });
    for (const y of [-0.3, 0.1]) b.torus(0.265, 0.025, { y, rx: Math.PI / 2, color: '#8a6a3a', mat, tseg: 20, rseg: 4 });
    b.torus(0.18, 0.04, { x: 0.3, y: -0.04, color: col, mat, tseg: 14, rseg: 5, arc: Math.PI, rz: -Math.PI / 2 });
    b.dome(0.26, { y: 0.32, sy: 0.5, color: '#c9c2b4', mat: M.metal });
    // foam
    for (let i = 0; i < 6; i++) b.sphere(0.1, { x: Math.cos(i) * 0.14, y: 0.36, z: Math.sin(i) * 0.14, color: '#fbf6ea', mat: M.smooth, seg: 6 });
  },
  halberds(b, col, mat) {
    for (const s of [-1, 1]) {
      b.push({ rz: s * 0.55 });
      b.cyl(0.025, 0.025, 1.2, { y: -0.6, color: '#6b4a2e', mat: M.wood, seg: 6 });
      b.cone(0.05, 0.22, { y: 0.6, color: '#d9dde2', mat: M.metal, seg: 6 });
      b.geo(shape([[0, 0.38], [0.24, 0.5], [0.3, 0.34], [0.24, 0.18], [0, 0.3]], 0.03), { color: '#d9dde2', mat: M.metal });
      b.geo(shape([[0, 0.42], [-0.14, 0.38], [0, 0.34]], 0.03), { color: '#d9dde2', mat: M.metal });
      b.pop();
    }
    b.sphere(0.07, { color: col, mat, seg: 8 });
  },
  scales(b, col, mat) {
    b.cyl(0.03, 0.04, 0.95, { y: -0.5, color: col, mat, seg: 8 });
    b.cyl(0.14, 0.18, 0.06, { y: -0.52, color: col, mat, seg: 12 });
    b.box(0.95, 0.04, 0.04, { y: 0.38, color: col, mat });
    b.sphere(0.05, { y: 0.47, color: col, mat, seg: 8 });
    for (const s of [-1, 1]) {
      for (const o of [-0.1, 0.1]) b.rod([s * 0.45, 0.38, 0], [s * 0.45 + o, 0.0, o], 0.006, { color: '#555', seg: 3 });
      b.geo(new THREE.SphereGeometry(0.16, 14, 5, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), { x: s * 0.45, y: 0.02, sy: 0.4, color: col, mat });
    }
    b.sphere(0.05, { x: -0.45, y: 0.04, color: '#c8433a', mat: M.smooth, seg: 6 });
  },
  lion(b, col, mat) { b.geo(shape(LION, 0.14), { s: 1.15, color: col, mat }); b.sphere(0.03, { x: 0.14 * 1.15, y: 0.42 * 1.15, z: 0.1, color: '#1b1b1f', mat: M.smooth, seg: 5 }); },
  dolphin(b, col, mat) { b.geo(shape(DOLPHIN, 0.14), { s: 1.15, color: col, mat }); b.sphere(0.03, { x: 0.3 * 1.15, y: 0.3 * 1.15, z: 0.1, color: '#1b1b1f', mat: M.smooth, seg: 5 }); },
  tower(b, col, mat) {
    b.box(0.42, 0.75, 0.32, { y: -0.5, color: col, mat });
    for (let i = 0; i < 4; i++) b.box(0.09, 0.12, 0.34, { x: -0.18 + i * 0.12, y: 0.25, color: col, mat });
    b.quad(0.12, 0.2, { y: -0.36, z: 0.165, color: '#1b1b1f', mat: M.smooth });
    b.quad(0.07, 0.12, { y: 0.0, z: 0.165, color: '#1b1b1f', mat: M.smooth });
    b.box(0.6, 0.1, 0.36, { y: -0.55, color: col, mat });
  },
  star(b, col, mat) { b.geo(shape(star(rngStar, 0.52, 0.22), 0.14), { color: col, mat }); },
  key(b, col, mat) {
    b.torus(0.17, 0.05, { y: 0.3, color: col, mat, tseg: 18, rseg: 6 });
    b.cyl(0.04, 0.04, 0.75, { y: -0.48, color: col, mat, seg: 8 });
    b.box(0.2, 0.08, 0.06, { x: 0.1, y: -0.45, color: col, mat });
    b.box(0.14, 0.07, 0.06, { x: 0.07, y: -0.3, color: col, mat });
  },
  boot(b, col, mat) { b.geo(shape(BOOT, 0.16), { color: col, mat }); b.box(0.66, 0.05, 0.2, { x: 0.09, y: -0.48, color: '#3a2a22', mat: M.wood }); },
  crescent(b, col, mat) {
    const p = [];
    for (let i = 0; i <= 16; i++) { const a = -Math.PI / 2 + (i / 16) * Math.PI; p.push([Math.cos(a) * 0.5, Math.sin(a) * 0.5]); }
    for (let i = 16; i >= 0; i--) { const a = -Math.PI / 2 + (i / 16) * Math.PI; p.push([Math.cos(a) * 0.3 - 0.06, Math.sin(a) * 0.42]); }
    b.geo(shape(p, 0.12), { color: col, mat });
  },
  bell(b, col, mat) { b.lathe([[0.02, 0.45], [0.12, 0.42], [0.16, 0.2], [0.2, -0.1], [0.32, -0.3], [0.34, -0.36], [0.02, -0.34]], { color: col, mat, seg: 16 }); b.sphere(0.07, { y: -0.4, color: col, mat, seg: 8 }); b.torus(0.07, 0.02, { y: 0.5, color: col, mat, tseg: 10, rseg: 4 }); },
  crown(b, col, mat) {
    b.cyl(0.38, 0.34, 0.24, { y: -0.3, color: col, mat, seg: 18, open: true });
    for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; b.cone(0.07, 0.28, { x: Math.cos(a) * 0.37, y: -0.06, z: Math.sin(a) * 0.37, color: col, mat, seg: 5 }); b.sphere(0.04, { x: Math.cos(a) * 0.37, y: 0.24, z: Math.sin(a) * 0.37, color: '#fbf6ea', mat: M.smooth, seg: 6 }); }
    for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2 + 0.3; b.sphere(0.045, { x: Math.cos(a) * 0.37, y: -0.18, z: Math.sin(a) * 0.37, color: ['#c8433a', '#3f6fb5', '#2f8a5a'][i % 3], mat: M.smooth, seg: 6 }); }
  },
  fish(b, col, mat) { b.geo(shape(FISH, 0.14), { color: col, mat }); b.sphere(0.035, { x: -0.3, y: 0.03, z: 0.09, color: '#1b1b1f', mat: M.smooth, seg: 5 }); },
  anchor(b, col, mat) {
    b.cyl(0.035, 0.035, 0.85, { y: -0.45, color: col, mat, seg: 8 });
    b.torus(0.32, 0.035, { y: -0.12, color: col, mat, tseg: 18, rseg: 5, arc: Math.PI, rz: Math.PI });
    b.box(0.4, 0.05, 0.05, { y: 0.22, color: col, mat });
    b.torus(0.08, 0.025, { y: 0.48, color: col, mat, tseg: 10, rseg: 4 });
    for (const s of [-1, 1]) b.cone(0.06, 0.12, { x: s * 0.32, y: -0.18, rz: s * 0.5, color: col, mat, seg: 4 });
  },
  sun(b, col, mat) {
    b.cyl(0.24, 0.24, 0.1, { rx: Math.PI / 2, z: -0.05, color: col, mat, seg: 20 });
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; b.geo(shape([[-0.06, 0], [0.06, 0], [0, 0.2 + (i % 2) * 0.08]], 0.06), { x: Math.cos(a) * 0.28, y: Math.sin(a) * 0.28, rz: a - Math.PI / 2, color: col, mat }); }
  },
  shield(b, col, mat) { b.geo(shape(SHIELD, 0.08), { color: col, mat }); },
};
let rngStar = 6;
const KINDS = ['pincers', 'tankard', 'halberds', 'scales', 'lion', 'dolphin', 'tower', 'star', 'key', 'boot', 'crescent', 'bell', 'crown', 'fish', 'anchor', 'sun'];
const HER = ['#e2b354', '#c8433a', '#3f6fb5', '#2f8a5a', '#1f1f24', '#e9e6df', '#7a3f8f'];

export default function build({ rng, accent }) {
  const GILT = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.32, metalness: 0.5, emissive: new THREE.Color('#5a3a0c'), emissiveIntensity: 0.32 });
  const PAINT = M.smooth;
  const b = new Builder();
  const object = new THREE.Group();
  const world = new THREE.Group();
  world.rotation.y = ROT;
  object.add(world);

  const emblem = (bb, kind, { x = 0, y = 0, z = 0, s = 1, ry = 0, gold = rng.chance(0.5) } = {}) => {
    const col = gold ? '#e2b354' : rng.pick(HER);
    const mat = gold || col === '#e2b354' ? GILT : PAINT;
    rngStar = rng.pick([5, 6, 8]);
    bb.push({ x, y, z, ry, s });
    EMBLEMS[kind](bb, col, mat);
    bb.pop();
  };

  /* ----------------------------------------------------- the page -- */
  b.cyl(10.4, 10.45, 0.1, { color: '#e8dcc0', seg: 72 });
  // streets = the lines of the page (running along x), houses between them
  const rows = [];
  for (let z = -8.2; z <= 8.6; z += 2.15) rows.push(z);
  const inDisc = (x, z, m = 0) => x * x + z * z < (9.9 - m) ** 2;
  // ruled street lines (slightly darker paving with kerbs)
  for (const z of rows) {
    const half = Math.sqrt(Math.max(0, 9.95 ** 2 - z * z));
    b.box(half * 2, 0.012, 0.75, { z: z + 0.55, y: 0.1, color: '#d9caa8', mat: M.stone });
    b.box(half * 2, 0.03, 0.04, { z: z + 0.18, y: 0.1, color: '#b9a885', mat: M.stone });
    b.box(half * 2, 0.03, 0.04, { z: z + 0.93, y: 0.1, color: '#b9a885', mat: M.stone });
  }
  // the margin: a slightly different border like a page's edge
  b.ring(9.95, 10.4, { y: 0.102, color: '#d3c39f', seg: 72 });

  const rot = [];
  const signs = []; // for emblem density bookkeeping
  for (const z0 of rows) {
    const rowBase = rng.range(2.3, 3.2);
    // a terrace of plain, small, windowless houses on the line (their fronts face +z, the street)
    const half = Math.sqrt(Math.max(0, 9.6 ** 2 - (z0 - 0.4) ** 2)) - 0.3;
    let x = -half;
    while (x < half - 0.5) {
      const w = rng.range(0.6, 1.1);
      if (!inDisc(x + w / 2, z0, 0.3) || !inDisc(x + w / 2, z0 - 0.7, 0.3)) { x += w; continue; }
      const h = rng.range(1.1, 1.9);
      const wall = rng.pick(['#9d9283', '#a89c8b', '#938878', '#b0a594', '#8a8072']);
      b.box(w - 0.04, h, 0.95, { x: x + w / 2, y: 0.1, z: z0 - 0.3, color: wall, mat: M.stone });
      b.geo(new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1).rotateY(Math.PI / 4).translate(0, 0.5, 0), { x: x + w / 2, y: 0.1 + h, z: z0 - 0.3, sx: w, sz: 1.0, sy: 0.35, color: rng.pick(['#6f665c', '#7a6e62', '#655d55']), mat: M.flat });
      b.quad(0.2, 0.4, { x: x + w / 2 + rng.range(-0.15, 0.15), y: 0.3, z: z0 + 0.176, color: '#3a3029', mat: M.smooth });
      // signs on nearly every house: shields on the façade, bracket signs, tall standards
      if (rng.chance(0.4)) {
        const sc = rng.range(0.5, 0.7);
        const sy = 0.1 + h * 0.45;
        b.geo(shape(SHIELD, 0.06), { x: x + w / 2, y: sy, z: z0 + 0.22, s: sc, color: rng.pick(HER.slice(1)), mat: PAINT });
        emblem(b, rng.pick(KINDS), { x: x + w / 2, y: sy + 0.02, z: z0 + 0.29, s: sc * 0.62, gold: true });
      }
      if (rng.chance(0.55)) {
        // iron scroll bracket from the façade, a big emblem hanging from it over the street
        const kind = rng.pick(KINDS);
        const bx = x + w / 2 + rng.range(-0.2, 0.2), by = 0.1 + h - 0.12, bz = z0 + 0.18;
        b.rod([bx, by, bz], [bx, by, bz + 0.62], 0.025, { color: '#2a2a2e', mat: M.rough_metal, seg: 5 });
        b.torus(0.15, 0.015, { x: bx, y: by - 0.15, z: bz + 0.17, ry: Math.PI / 2, color: '#2a2a2e', mat: M.rough_metal, arc: Math.PI * 1.5, tseg: 12, rseg: 3 });
        b.rod([bx, by - 0.3, bz], [bx, by, bz + 0.35], 0.012, { color: '#2a2a2e', mat: M.rough_metal, seg: 3 });
        const sc = rng.range(0.6, 0.9);
        const ey = by - 0.08 - sc * 0.5;
        b.rod([bx, by, bz + 0.55], [bx, ey + sc * 0.45, bz + 0.55], 0.008, { color: '#2a2a2e', seg: 3 });
        if (rng.chance(0.35)) {
          b.geo(shape(SHIELD, 0.06), { x: bx, y: ey, z: bz + 0.55, s: sc * 1.1, color: rng.pick(HER.slice(1)), mat: PAINT });
          emblem(b, kind, { x: bx, y: ey + 0.02, z: bz + 0.62, s: sc * 0.68 });
        } else emblem(b, kind, { x: bx, y: ey, z: bz + 0.55, s: sc, ry: rng.range(-0.25, 0.25) });
      }
      if (rng.chance(0.5)) {
        // a tall standard at the street edge: the emblems stand in a line, like words on a page
        const kind = rng.pick(KINDS);
        const px = x + w / 2 + rng.range(-0.25, 0.25), pz = z0 + 1.05;
        const ph = rowBase + rng.range(-0.3, 0.3) + (rng.chance(0.12) ? 1.4 : 0);
        const sc = rng.range(1.0, 1.4);
        b.cyl(0.035, 0.045, ph, { x: px, y: 0.1, z: pz, color: '#3a3433', mat: M.rough_metal, seg: 6 });
        b.cyl(0.1, 0.12, 0.12, { x: px, y: 0.1, z: pz, color: '#7a7064', mat: M.stone, seg: 8 });
        b.box(0.45, 0.035, 0.035, { x: px, y: 0.1 + ph - 0.05, z: pz, color: '#3a3433', mat: M.rough_metal });
        if (ph > rowBase + 1 && rot.length < 10) {
          rot.push({ kind, x: px, y: 0.1 + ph + sc * 0.55, z: pz, s: sc, ph: rng.range(0, 6.28), sp: rng.range(0.15, 0.3) * rng.sign() });
        } else emblem(b, kind, { x: px, y: 0.1 + ph + sc * 0.55, z: pz, s: sc, ry: rng.range(-0.3, 0.3) });
        if (rng.chance(0.35)) b.geo(new THREE.ConeGeometry(0.12, 0.6, 3).rotateZ(Math.PI / 2), { x: px + 0.3, y: 0.1 + ph - 0.35, z: pz, sy: 0.4, color: rng.chance(0.5) ? accent : '#c8433a', mat: M.cloth });
      }
      x += w;
    }
  }
  // two squares with statues: the lion and the dolphin fountain
  const plaza = (x, z, kind) => {
    b.cyl(1.1, 1.1, 0.04, { x, y: 0.1, z, color: '#efe6d0', mat: M.smooth, seg: 24 });
    b.box(0.7, 0.6, 0.5, { x, y: 0.14, z, color: '#bfb39b', mat: M.stone });
    b.box(0.8, 0.08, 0.6, { x, y: 0.74, z, color: '#cfc4ad', mat: M.stone });
    emblem(b, kind, { x, y: 0.82 + 0.85, z, s: 1.7, gold: kind === 'lion' });
  };
  void plaza;

  // travellers reading the streets
  for (let i = 0; i < 26; i++) {
    const z = rng.pick(rows) + 0.55, x = rng.range(-8, 8);
    if (!inDisc(x, z, 0.5)) continue;
    figure(b, { x, y: 0.1, z, h: 0.32, color: rng.pick(['#5a6b8a', '#8a5a4a', '#e9e6df', accent, '#4a4a4a']), ry: rng.chance(0.5) ? Math.PI / 2 : -Math.PI / 2, arms: rng.chance(0.15) ? 1 : 0 });
  }

  const stat = b.build();
  stat.traverse((o) => { if (o.geometry) o.geometry.rotateY(ROT); });
  object.add(stat);

  // the turning signs: each its own little group (one or two materials)
  const turning = rot.map((r) => {
    const bb = new Builder();
    emblem(bb, r.kind, { s: r.s, gold: true });
    const g = bb.build();
    g.position.set(r.x, r.y, r.z);
    world.add(g);
    return g;
  });

  const update = (t) => {
    for (let i = 0; i < turning.length; i++) turning[i].rotation.y = rot[i].ph + Math.sin(t * rot[i].sp) * 1.2;
  };
  update(0);
  return { object, update };
}
