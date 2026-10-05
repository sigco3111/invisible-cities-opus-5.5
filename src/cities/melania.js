// MELANIA — a dialogue that outlives everyone who speaks it.
// The square is a stage: a comic scene in the manner of Serlio, houses closing it
// on three sides, a street running away in forced perspective. On the paving, seven
// brass marks. On each mark a stock character: the boasting soldier, the parasite,
// the spendthrift youth, the courtesan, the miserly father, his lovesick daughter,
// the foolish servant. Threads of light carry the lines from one to the next and
// never stop — while, one by one, each speaker walks off and an heir arrives from
// the back street to take the same mark and the same pose.
import { THREE, Builder, M, C, Lines, tree, house } from '../kit.js';
import { figure, sstep, warmLit } from './_d_kit.js';

function facade(b, rng, { x, z, ry, w, h, wall, accent, lit = 0.4, arcade = true, balcony = true }) {
  b.push({ x, y: 0.1, z, ry });
  const d = 1.6;
  b.box(w, h, d, { z: -d / 2, color: wall });
  b.box(w + 0.1, 0.12, d + 0.1, { y: h, z: -d / 2, color: '#e3d6c0' }); // cornice
  b.geo(new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1).rotateY(Math.PI / 4).translate(0, 0.5, 0), { y: h + 0.12, z: -d / 2, sx: w + 0.12, sz: d + 0.12, sy: 0.5, color: rng.pick([C.terracotta, '#b8694a', '#a85a40']), mat: M.flat });
  // ground floor: arcade or shop fronts
  const nb = Math.max(2, Math.round(w / 0.8));
  for (let i = 0; i < nb; i++) {
    const u = -w / 2 + (i + 0.5) * (w / nb);
    if (arcade) {
      b.box(0.5, 0.75, 0.02, { x: u, y: 0, z: 0.006, color: '#3a2c28' });
      b.geo(new THREE.CircleGeometry(0.25, 10, 0, Math.PI), { x: u, y: 0.75, z: 0.007, color: '#3a2c28' });
      b.box(0.1, 1.0, 0.12, { x: u + w / nb / 2, y: 0, z: 0.05, color: '#e3d6c0' });
    } else {
      b.box(0.45, 0.7, 0.03, { x: u, y: 0, z: 0.01, color: rng.pick(['#5a3c2c', '#4a5a4a', '#6a3a32']), mat: M.wood });
    }
  }
  b.box(w, 0.06, 0.08, { y: 1.05, z: 0.04, color: '#e3d6c0' }); // string course
  // upper windows with shutters
  const floors = Math.floor((h - 1.2) / 0.85);
  const nw = Math.max(2, Math.round(w / 0.7));
  for (let f = 0; f < floors; f++) {
    for (let i = 0; i < nw; i++) {
      const u = -w / 2 + (i + 0.5) * (w / nw);
      const y = 1.35 + f * 0.85;
      const isLit = rng() < lit;
      b.quad(0.24, 0.4, { x: u, y: y + 0.2, z: 0.008, mat: isLit ? M.glow : M.smooth, color: isLit ? C.lamp : '#2e2a2c', glow: 1.5 });
      const sc = accent && rng.chance(0.3) ? accent : rng.pick(['#5b7a6a', '#7a5a3a', '#4f6a7a', '#8a6a4a']);
      b.box(0.12, 0.42, 0.02, { x: u - 0.19, y, z: 0.02, ry: rng.range(-0.5, 0), color: sc, mat: M.wood });
      b.box(0.12, 0.42, 0.02, { x: u + 0.19, y, z: 0.02, ry: rng.range(0, 0.5), color: sc, mat: M.wood });
    }
  }
  // windows on the side walls too (the end houses show them to the street)
  for (const sx of [-1, 1]) for (let f = 0; f < floors + 1; f++) for (const zz of [-0.45, -1.15]) {
    const isLit = rng() < lit * 0.7;
    b.quad(0.22, 0.36, { x: sx * (w / 2 + 0.008), y: 0.6 + f * 0.85 + 0.2, z: zz, ry: sx * Math.PI / 2, mat: isLit ? M.glow : M.smooth, color: isLit ? C.lamp : '#2e2a2c', glow: 1.4 });
  }
  if (balcony && floors > 0) {
    const bw = Math.min(w - 0.4, 1.4);
    b.box(bw, 0.06, 0.4, { y: 1.3, z: 0.2, color: '#e3d6c0' });
    for (let k = 0; k <= 8; k++) b.box(0.025, 0.3, 0.025, { x: -bw / 2 + (k / 8) * bw, y: 1.36, z: 0.38, color: '#3a3a3e', mat: M.metal });
    b.box(bw, 0.03, 0.03, { y: 1.66, z: 0.38, color: '#3a3a3e', mat: M.metal });
  }
  b.pop();
}

// [name, x, z, facing target index or angle, builder(fig args, variant)]
const ROLES = [
  { id: 'soldier', x: -2.6, z: -0.2 },
  { id: 'parasite', x: -1.75, z: 0.75 },
  { id: 'youth', x: -0.55, z: -0.8 },
  { id: 'courtesan', x: 0.55, z: -0.55 },
  { id: 'father', x: 1.75, z: 0.3 },
  { id: 'daughter', x: 2.55, z: -0.75 },
  { id: 'servant', x: 0.1, z: 1.4 },
];

function character(b, id, v, ry, rng) {
  const H = 1.0;
  const alt = (a, b2) => (v ? b2 : a);
  const base = { x: 0, y: 0, z: 0, ry, h: H, fat: 1.35 };
  if (id === 'soldier') {
    figure(b, { ...base, robe: alt('#a8322e', '#8c2b3a'), top: '#c9a35a', hat: 'helmet', hatColor: '#c9c9cf', plume: alt('#e8d24a', '#f2f2f2'), arms: ['hip', 'up'], fat: 1.5 });
    b.push({ ry }); b.rod([0.17 * H, 0.62 * H, 0.03], [0.24 * H, 1.25 * H, 0.0], 0.012, { color: '#d8d8de', mat: M.stone }); b.pop();
    b.push({ ry }); b.box(0.36 * H, 0.5 * H, 0.02, { y: 0.32 * H, z: -0.1 * H, rx: 0.15, color: alt('#7a1f22', '#6a2433'), mat: M.stone }); b.pop();
  } else if (id === 'parasite') {
    figure(b, { ...base, robe: alt('#6f7a5c', '#7a7a62'), hat: 'cap', hatColor: '#4a4a3a', arms: ['fwd', 'out'], lean: 0.45, skirt: 0.8 });
  } else if (id === 'youth') {
    figure(b, { ...base, robe: alt('#5a3f86', '#3f5a86'), top: alt('#c9a35a', '#d8d0b0'), hat: 'brim', hatColor: alt('#2e2440', '#2e3440'), plume: alt('#e86a8a', '#e8c46a'), arms: ['wave', 'hip'], skirt: 0.7 });
  } else if (id === 'courtesan') {
    figure(b, { ...base, robe: alt('#d6687a', '#c85a8a'), top: alt('#f0d8c8', '#f0c8d8'), hat: 'hair', hatColor: alt('#8a4a2a', '#2a1a14'), arms: ['chin', 'out'], skirt: 1.5 });
    b.push({ ry }); b.geo(new THREE.CircleGeometry(0.1 * H, 8, 0, Math.PI), { x: 0.28 * H, y: 0.62 * H, z: 0.13 * H, rz: 0.4, color: '#f2e6c8', mat: M.stone }); b.pop();
  } else if (id === 'father') {
    figure(b, { ...base, robe: alt('#2e2a30', '#3a2e2a'), top: '#3a3238', hat: 'cap', hatColor: '#8a2a2a', arms: ['fwd', 'down'], lean: 0.22, skirt: 1.1 });
    b.push({ ry }); b.rod([0.1 * H, 0.0, 0.25 * H], [0.08 * H, 0.6 * H, 0.22 * H], 0.012, { color: C.darkwood }); b.pop();
    b.push({ ry }); b.sphere(0.06 * H, { x: -0.18 * H, y: 0.38 * H, z: 0.02, color: '#c9a35a', mat: M.stone, seg: 6 }); b.pop(); // the purse
  } else if (id === 'daughter') {
    figure(b, { ...base, robe: alt('#a9c4e0', '#c4e0d0'), top: '#f2eee6', hat: 'veil', hatColor: '#f6f2ea', arms: ['heart', 'down'], skirt: 1.3, roll: 0.06 });
  } else if (id === 'servant') {
    figure(b, { ...base, robe: alt('#d9b45a', '#b45ad9'), top: alt('#5ab48a', '#e0703a'), hat: 'cap', hatColor: alt('#2a2a2a', '#f2f2f2'), arms: ['up', 'out'], skirt: 0.7 });
    // a patchwork of diamonds on the coat
    b.push({ ry });
    for (let k = 0; k < 6; k++) b.box(0.05 * H, 0.05 * H, 0.01, { x: (k % 3 - 1) * 0.06 * H, y: (0.25 + Math.floor(k / 3) * 0.12) * H, z: 0.12 * H - Math.floor(k / 3) * 0.015 * H, rz: Math.PI / 4, color: ['#c4453a', '#2f6377', '#5ab48a'][k % 3], mat: M.stone });
    b.pop();
  }
  void rng;
}

export default function build({ rng, accent }) {
  const b = new Builder();
  const object = new THREE.Group();

  /* ---------- ground & the stage-square ---------- */
  b.cyl(10.45, 10.45, 0.1, { color: '#b9a98e', seg: 64 });
  for (let i = 0; i < 380; i++) {
    const [x, z] = rng.inDisc(10.2, 4.6);
    b.box(rng.range(0.3, 0.5), 0.02, rng.range(0.25, 0.4), { x, y: 0.1, z, ry: -Math.atan2(z, x) + rng.range(-0.1, 0.1), color: rng.pick(['#c2b192', '#b09f82', '#cdbd9e', '#a99a80']) });
  }
  // radial paving like the floor of a theatre, in two tones
  const NR = 7, NA = 36;
  for (let r = 0; r < NR; r++) {
    for (let a = 0; a < NA; a++) {
      const r0 = 0.6 + r * 0.62, ang = (a / NA) * Math.PI * 2 + (r % 2) * (Math.PI / NA);
      const x = Math.cos(ang) * (r0 + 0.31), z = 0.2 + Math.sin(ang) * (r0 + 0.31);
      if (z < -4.0) continue;
      b.box(0.55, 0.03, 2 * Math.PI * (r0 + 0.31) / NA - 0.05, { x, y: 0.1, z, ry: -ang, color: (a + r) % 2 ? '#e2d4b8' : '#cbb593' });
    }
  }
  const STAGE = warmLit('#ffb874', 0.5);
  // a low round dais, the stage within the square, with three steps
  b.cyl(3.55, 3.6, 0.09, { x: 0, y: 0.12, z: 0.2, color: '#d9c7a6', seg: 48 });
  b.cyl(3.3, 3.35, 0.09, { x: 0, y: 0.21, z: 0.2, color: '#e6d6b8', seg: 48 });
  b.cyl(3.05, 3.1, 0.06, { x: 0, y: 0.3, z: 0.2, color: '#f0d9b0', seg: 48, mat: STAGE });
  for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2; b.box(0.04, 0.012, 0.5, { x: Math.cos(a) * 2.2, y: 0.36, z: 0.2 + Math.sin(a) * 2.2, ry: -a + Math.PI / 2, color: '#c9b38e' }); }
  // the seven brass marks
  for (const R of ROLES) {
    b.cyl(0.3, 0.3, 0.02, { x: R.x, y: 0.36, z: R.z, color: '#c9a35a', mat: M.metal, seg: 20 });
    b.ring(0.33, 0.42, { x: R.x, y: 0.365, z: R.z, color: '#ffc477', mat: M.glow, glow: 1.3, seg: 24 });
  }

  /* ---------- the comic scene: houses on three sides ---------- */
  const walls = ['#e7cfae', '#dcb48e', '#e9d9bd', '#d8a88a', '#ead7c4', '#cfb89a', '#e2c39a'];
  // left and right rows, facing the square
  const rows = [
    { x: -5.6, ry: Math.PI / 2, zs: [1.2, -1.1, -3.4] },
    { x: 5.6, ry: -Math.PI / 2, zs: [1.2, -1.1, -3.4] },
  ];
  for (const row of rows) {
    row.zs.forEach((zz, i) => {
      const w = 2.15, h = rng.range(2.6, 4.2);
      facade(b, rng, { x: row.x, z: zz, ry: row.ry, w, h, wall: rng.pick(walls), accent, arcade: i % 2 === 0, balcony: i !== 2 });
    });
  }
  // back row with the street opening in the middle
  facade(b, rng, { x: -3.1, z: -5.1, ry: 0, w: 3.8, h: 3.9, wall: walls[2], accent, arcade: true });
  facade(b, rng, { x: 3.1, z: -5.1, ry: 0, w: 3.8, h: 3.6, wall: walls[4], accent, arcade: false });
  // the street in forced perspective: houses shrinking toward a vanishing arch
  for (let k = 0; k < 5; k++) {
    const t = k / 5;
    const s = 1 - t * 0.6;
    const zz = -5.6 - k * 0.85;
    for (const sgn of [-1, 1]) {
      facade(b, rng, { x: sgn * (1.05 - t * 0.55 + 0.75 * s), z: zz, ry: -sgn * Math.PI / 2, w: 0.85, h: 3.3 * s, wall: rng.pick(walls), accent, lit: 0.6, arcade: false, balcony: false });
    }
    b.box(2.1 - t * 1.1, 0.02, 0.9, { x: 0, y: 0.1, z: zz - 0.4, color: k % 2 ? '#cbb593' : '#d8c6a6' });
  }
  // the vanishing arch at the end of the street, warm light beyond it
  b.box(0.3, 1.5, 0.3, { x: -0.55, y: 0.1, z: -9.85, color: '#e3d6c0' });
  b.box(0.3, 1.5, 0.3, { x: 0.55, y: 0.1, z: -9.85, color: '#e3d6c0' });
  b.geo(new THREE.TorusGeometry(0.55, 0.15, 6, 12, Math.PI), { y: 1.6, z: -9.85, color: '#e3d6c0' });
  b.quad(0.8, 1.9, { y: 0.95 + 0.1, z: -9.95, color: '#ffcf9a', mat: M.glow, glow: 1.4 });

  // a fountain? no — a well-head with a lantern, plus an audience on balconies and a cat
  const audience = [[-5.0, 1.8, 1.0], [5.0, 1.8, -1.3], [-5.0, 1.8, -3.4], [-1.6, 1.7, -4.5], [2.6, 1.7, -4.5]];
  for (const [ax, ay, az] of audience) {
    figure(b, { x: ax, y: ay - 0.3, z: az, ry: Math.atan2(-ax, 0.2 - az), h: 0.38, robe: rng.pick(['#5d6d8a', '#8a6a4a', '#a0524a', '#4d4a52']), hat: rng.pick(['veil', 'cap', null]), hatColor: C.ivory, arms: ['fwd', rng.pick(['chin', 'fwd', 'wave'])] });
  }
  for (const [lx, lz] of [[-4.6, 3.8], [4.6, 3.8], [-4.6, -4.2], [4.6, -4.2]]) {
    b.cyl(0.03, 0.04, 1.6, { x: lx, y: 0.1, z: lz, color: '#2f2f35', mat: M.metal, seg: 6 });
    b.box(0.14, 0.2, 0.14, { x: lx, y: 1.7, z: lz, color: '#2f2f35', mat: M.metal });
    b.box(0.1, 0.14, 0.1, { x: lx, y: 1.73, z: lz, color: C.lamp, mat: M.glow, glow: 2.6 });
  }
  // the cat on the steps of the well-head
  b.sphere(0.06, { x: 3.4, y: 0.18, z: 2.4, sx: 1.4, color: '#3a3330', seg: 6 });
  b.sphere(0.04, { x: 3.48, y: 0.24, z: 2.4, color: '#3a3330', seg: 6 });
  // front edge: footlights along the open side
  for (let k = -6; k <= 6; k++) {
    const x = k * 0.62, z = 4.55 + 0.15 * Math.cos(k * 0.25);
    b.box(0.22, 0.08, 0.12, { x, y: 0.1, z, color: '#4a3a2e', mat: M.wood });
    b.sphere(0.04, { x, y: 0.2, z: z - 0.02, color: C.lamp, mat: M.glow, glow: 2.2, seg: 6 });
  }
  // the town around the square: roofs behind the scene, gardens, cypresses
  for (let i = 0; i < 40; i++) {
    const [x, z] = rng.inDisc(10.0, 7.4);
    if (z > 0.5) continue;
    if (rng.chance(0.55)) house(b, { x, y: 0.1, z, w: rng.range(0.9, 1.5), d: rng.range(0.9, 1.4), h: rng.range(1.0, 2.2), ry: -Math.atan2(z, x), r: rng, lit: 0.3, wall: rng.pick(walls), roof: 'hip', roofColor: rng.pick([C.terracotta, '#b8694a']) });
    else tree(b, { x, y: 0.1, z, h: rng.range(1.6, 2.6), kind: rng.pick(['cypress', 'cypress', 'round']), r: rng });
  }
  // the cavea: tiers of seats in a half-ring facing the stage, full of townsfolk watching
  const annSector = (r0, r1, a0, a1, h, y, color) => {
    const sh = new THREE.Shape();
    sh.absarc(0, 0, r1, a0, a1, false);
    sh.absarc(0, 0, r0, a1, a0, true);
    const g = new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: false, curveSegments: 40 }).rotateX(-Math.PI / 2);
    b.geo(g, { y, z: 0.2, color });
  };
  const SA = 1.05; // half-angle of the cavea
  const tiers = 6;
  for (let k = 0; k < tiers; k++) {
    const r0 = 5.0 + k * 0.62, r1 = r0 + 0.62;
    annSector(r0, Math.min(r1, 10.2), -Math.PI / 2 - SA, -Math.PI / 2 + SA, 0.12 + k * 0.24, 0.1, k % 2 ? '#d9c5a2' : '#cdb894');
    // the audience on this tier
    const n = 9 + k * 2;
    for (let i = 0; i < n; i++) {
      if (rng.chance(0.25)) continue;
      const a = Math.PI / 2 + (-SA + 0.08 + (2 * SA - 0.16) * (i + 0.5) / n) + rng.range(-0.02, 0.02);
      const rr = r0 + 0.32;
      const x = Math.cos(a) * rr, z = 0.2 + Math.sin(a) * rr;
      figure(b, { x, y: 0.1 + 0.12 + k * 0.24 - 0.06, z, ry: Math.atan2(-x, 0.2 - z), h: 0.34, skirt: 1.2, robe: rng.pick(['#5d6d8a', '#8a6a4a', '#a0524a', '#4d4a52', '#6f7f6a', '#b8863a', '#7a4a6a']), top: rng.pick(['#e8dcc6', '#c9b38e', null]) || undefined, hat: rng.pick(['veil', 'cap', 'brim', null, null]), hatColor: rng.pick([C.ivory, '#3a3330', accent]), arms: [rng.pick(['down', 'fwd', 'chin']), rng.pick(['down', 'fwd', 'wave', 'up'])] });
    }
  }
  // banners hanging from the façades
  const banC = [accent, '#a8322e', '#c9a35a', '#2f6377', '#7a3a6a'];
  for (const [bx, bz, bry] of [[-4.6, -5.0, 0], [-2.6, -5.0, 0], [2.4, -5.0, 0], [4.4, -5.0, 0], [-4.78, 0.1, Math.PI / 2], [4.78, 0.1, -Math.PI / 2], [-4.78, -2.25, Math.PI / 2], [4.78, -2.25, -Math.PI / 2]]) {
    b.push({ x: bx, y: 1.3, z: bz, ry: bry });
    b.box(0.42, 1.5, 0.03, { z: 0.05, color: rng.pick(banC), mat: M.cloth });
    b.geo(new THREE.ConeGeometry(0.21, 0.3, 3).rotateZ(Math.PI).rotateY(Math.PI / 6), { y: -0.0, z: 0.05, sz: 0.1, color: C.gold, mat: M.cloth });
    b.box(0.5, 0.04, 0.06, { y: 1.5, z: 0.06, color: C.gold, mat: M.smooth });
    b.pop();
  }
  object.add(b.build());

  /* ---------- the characters: each role played by a line of heirs ---------- */
  const lookAt = (i) => {
    // whom each one speaks to
    const tgt = [1, 0, 3, 2, 5, 4, 4][i];
    const R = ROLES[i], T = ROLES[tgt];
    return Math.atan2(T.x - R.x, T.z - R.z) * 0.75 + 0.25 * 0; // partly turned to the audience
  };
  const actors = ROLES.map((R, i) => {
    const vs = [0, 1].map((v) => {
      const fb = new Builder();
      character(fb, R.id, v, 0, rng);
      const g = fb.build();
      const mats = [];
      g.traverse((m) => {
        if (m.isMesh) {
          m.material = m.material.clone();
          m.material.transparent = true;
          mats.push(m.material);
        }
      });
      const holder = new THREE.Group();
      holder.add(g);
      object.add(holder);
      return { g: holder, mats };
    });
    return { R, vs, ry: lookAt(i) };
  });
  const EXIT = [[-4.6, 3.2], [4.6, 3.2], [-4.6, 3.2], [4.6, 3.2], [4.6, 3.2], [4.6, 3.2], [-4.6, 3.2]];
  const ENTER = [0, -9.0];

  /* ---------- the dialogue: threads of light between speakers ---------- */
  const order = [0, 1, 2, 3, 4, 5, 6, 4, 3, 0, 2, 5, 1, 6];
  const L = new Lines();
  const TB = new Builder(), TB2 = new Builder();
  const arcs = [];
  for (let k = 0; k < order.length; k++) {
    const A = ROLES[order[k]], B = ROLES[order[(k + 1) % order.length]];
    const pts = [];
    for (let i = 0; i <= 16; i++) {
      const t = i / 16;
      pts.push([A.x + (B.x - A.x) * t, 1.4 + Math.sin(Math.PI * t) * (0.45 + 0.12 * Math.hypot(B.x - A.x, B.z - A.z)), A.z + (B.z - A.z) * t]);
    }
    arcs.push(pts);
    TB.tube(pts, 0.018, { color: '#ffd890', mat: M.glow, glow: 0.9, rseg: 4, tseg: 24 });
  }
  object.add(TB.build({ shadows: false }));
  // garlands of lanterns strung across the square
  for (const gz of [-2.6, 0.4, 2.6]) {
    const A = [-4.75, 3.0, gz], B = [4.75, 3.0, gz];
    L.rope(A, B, 0.9, '#3a3330', 16);
    for (let i = 1; i < 12; i++) {
      const t = i / 12;
      TB2.sphere(0.07, { x: A[0] + (B[0] - A[0]) * t, y: 3.0 - 0.9 * 4 * t * (1 - t) - 0.08, z: gz, color: i % 3 ? '#ffc477' : '#ff9a6a', mat: M.glow, glow: 2.2, seg: 6 });
    }
  }
  object.add(TB2.build({ shadows: false }));
  object.add(L.build());
  const NB = 14;
  const beads = new THREE.InstancedMesh(new THREE.SphereGeometry(0.09, 8, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color('#fff0c0').multiplyScalar(4), toneMapped: false }), NB);
  object.add(beads);
  const dummy = new THREE.Object3D();

  const PER = 9, CYC = PER * ROLES.length; // each role passes on every CYC seconds
  const LINE = 2.2;
  return {
    object,
    update(t) {
      // succession
      actors.forEach((A, i) => {
        const t0 = i * PER + 4;
        const n = t < t0 ? 0 : Math.floor((t - t0) / CYC) + 1;
        const since = t < t0 ? 1e9 : (t - t0) % CYC;
        const cur = n % 2, old = 1 - cur;
        const R = A.R;
        // heir walks in from the back street (0..5 s), predecessor walks off, fading (0..5 s)
        const inK = n === 0 ? 1 : sstep(0, 5, since);
        const outK = n === 0 ? 1 : sstep(0, 4.5, since);
        const cg = A.vs[cur].g, og = A.vs[old].g;
        cg.visible = true;
        cg.position.set(ENTER[0] + (R.x - ENTER[0]) * inK, (inK < 0.6 ? 0.1 : 0.38) + (inK < 1 ? Math.abs(Math.sin(t * 6)) * 0.03 : 0), ENTER[1] + (R.z - ENTER[1]) * inK);
        cg.rotation.y = inK < 1 ? Math.atan2(R.x - ENTER[0], R.z - ENTER[1]) * (1 - sstep(0.85, 1, inK)) + A.ry * sstep(0.85, 1, inK) : A.ry;
        const co = n === 0 ? 1 : sstep(0, 0.4, inK);
        for (const m of A.vs[cur].mats) { m.opacity = co; m.transparent = co < 1; m.depthWrite = true; }
        if (n === 0 || outK >= 1) { og.visible = false; }
        else {
          og.visible = true;
          const [ex, ez] = EXIT[i];
          og.position.set(R.x + (ex - R.x) * outK, (outK < 0.4 ? 0.38 : 0.1) + Math.abs(Math.sin(t * 4)) * 0.02, R.z + (ez - R.z) * outK);
          og.rotation.y = Math.atan2(ex - R.x, ez - R.z);
          const oo = 1 - sstep(0.3, 1, outK);
          for (const m of A.vs[old].mats) { m.opacity = oo; m.transparent = true; }
        }
        // the speaker leans in a little
      });
      // the line passes from one speaker to the next, forever
      const k = Math.floor(t / LINE) % arcs.length;
      const u = (t % LINE) / LINE;
      const pts = arcs[k];
      for (let i = 0; i < NB; i++) {
        const uu = Math.min(1, Math.max(0, u * 1.3 - i * 0.025));
        const f = uu * 16, i0 = Math.min(15, Math.floor(f)), fr = f - i0;
        const p = pts[i0], q = pts[i0 + 1];
        dummy.position.set(p[0] + (q[0] - p[0]) * fr, p[1] + (q[1] - p[1]) * fr, p[2] + (q[2] - p[2]) * fr);
        dummy.scale.setScalar((1 - i / NB) * (uu > 0 && uu < 1 ? 1 : 0.0001));
        dummy.updateMatrix();
        beads.setMatrixAt(i, dummy.matrix);
      }
      beads.instanceMatrix.needsUpdate = true;
      // speakers: the one talking rises on their toes
      actors.forEach((A, i) => {
        const speaking = order[k] === i;
        const g = A.vs[0].g.visible && A.vs[1].g.visible ? null : (A.vs[0].g.visible ? A.vs[0].g : A.vs[1].g);
        if (g) g.scale.setScalar(speaking ? 1.0 + 0.04 * Math.sin(Math.PI * u) : 1);
      });
    },
  };
}
