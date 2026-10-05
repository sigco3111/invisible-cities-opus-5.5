// EUSAPIA — a living city copied underground for the dead, or the other way round.
// The ground is lifted on a thick slab of earth. On top, the living Eusapia: warm
// plaster, red roofs, a market, people at their trades. Below, in a cavern cut open
// to our view, its exact copy in bone and ochre, lit by candles: the same houses on
// the same streets, and at the same spots the dried dead at the same tables and
// benches — the card players, the tailor, the smith, the barber. A hooded brotherhood
// carries a body down the stair between the two. Which city is the original?
import { THREE, Builder, M, C, tree, rock } from '../kit.js';
import { figure, warmLit, sstep } from './_d_kit.js';

export default function build({ rng, accent }) {
  const object = new THREE.Group();
  const R0 = 10.4;
  const SY = 4.35, ST = 0.6, TOP = SY + ST; // slab underside, thickness, top surface
  const WALL_A = Math.atan2(-0.38, -0.8); // earth wall faces the sun side (back-left)
  const WALL_SPAN = 1.25;
  // the slab is cut away in section along a straight line facing the viewer
  const NA = 0.35, NX = Math.cos(NA), NZ = Math.sin(NA), TX = -NZ, TZ = NX;
  const CUT = 3.6;
  const dotN = (x, z) => x * NX + z * NZ;
  const SO = CUT + 0.55, S0 = -3.4, S1 = 1.6; // stair: offset from the face, top and bottom along the face

  /* ---------- shared layout of both cities ---------- */
  const pillars = [[-2.6, 1.6], [2.8, -2.6], [-5.8, -1.2], [0.6, 5.6], [-3.4, 6.4]];
  const inWallZone = (x, z) => {
    const a = Math.atan2(z, x);
    const da = Math.abs(((a - WALL_A + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
    return da < WALL_SPAN && Math.hypot(x, z) > 7.2;
  };
  const free = (x, z, r) => {
    const u = dotN(x, z), v = x * TX + z * TZ;
    if (Math.abs(u - SO) < 0.7 + r && v > S0 - 1.3 - r && v < S1 + 0.6 + r) return false;
    if (Math.abs(u - CUT) < 0.25 + r) return false; // nothing straddles the section
    for (const [px, pz] of pillars) if (Math.hypot(x - px, z - pz) < 1.3 + r) return false;
    if (Math.hypot(x, z) < 1.6 + r) return false; // the square
    for (const [sx, sz] of scenes) if (Math.hypot(x - sx, z - sz) < 0.75 + r) return false;
    return true;
  };
  // the scenes, near the cut so that both twins can be seen: [x, z, ry, kind]
  const kinds = ['cards', 'tailor', 'smith', 'barber', 'music', 'reader'];
  const scenes = kinds.map((kind, i) => {
    const u = CUT - 0.75 - (i % 2) * 0.55, v = -4.6 + i * 1.55;
    return [u * NX + v * TX, u * NZ + v * TZ, -NA + Math.PI / 2 + (i % 2 ? 0.5 : -0.4), kind];
  });
  const lots = [];
  for (let i = 0; i < 4000 && lots.length < 30; i++) {
    const [x, z] = rng.inDisc(8.4, 1.8);
    const w = rng.range(0.9, 1.5), d = rng.range(0.9, 1.3);
    const r = Math.max(w, d) * 0.62;
    if (!free(x, z, r) || inWallZone(x, z) || Math.hypot(x, z) > 8.6) continue;
    if (lots.some((o) => Math.hypot(o.x - x, o.z - z) < o.r + r + 0.35)) continue;
    lots.push({ x, z, w, d, r, h: rng.range(0.9, 1.9), ry: -Math.atan2(z, x) + Math.PI / 2, roof: rng.chance(0.7) ? 'gable' : 'hip', k: rng() });
  }
  /* ---------- builder for one city (the living or the dead) ---------- */
  const city = (b, y0, dead) => {
    const IN = dead ? warmLit('#e8c890', 0.36) : null;
    const mat = (m) => (dead ? IN : m);
    const walls = dead ? ['#d9ccb2', '#cfc0a2', '#e2d6bf', '#c9b896'] : ['#efd7b0', '#e6b48c', '#f0e2c6', '#d9a07e', '#e9cfa2', '#f2e6d6'];
    const roofs = dead ? ['#b8a789', '#a99876', '#c2b293'] : [C.terracotta, C.brick, '#c98a4a', '#b8694a'];
    const r2 = (k, arr) => arr[Math.floor(k * arr.length) % arr.length];
    for (const L of lots) {
      if (!dead && dotN(L.x, L.z) > CUT) continue;
      b.push({ x: L.x, y: y0, z: L.z, ry: L.ry });
      b.box(L.w, L.h, L.d, { color: r2(L.k, walls), mat: mat(M.stone) });
      if (L.roof === 'gable') b.geo(new THREE.ExtrudeGeometry(new THREE.Shape([new THREE.Vector2(-L.w / 2 - 0.07, 0), new THREE.Vector2(L.w / 2 + 0.07, 0), new THREE.Vector2(0, 0.55)]), { depth: L.d + 0.12, bevelEnabled: false }).translate(0, 0, -(L.d + 0.12) / 2), { y: L.h, color: r2(L.k * 7, roofs), mat: mat(M.flat) });
      else b.geo(new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1).rotateY(Math.PI / 4).translate(0, 0.5, 0), { y: L.h, sx: L.w + 0.1, sz: L.d + 0.1, sy: 0.5, color: r2(L.k * 7, roofs), mat: mat(M.flat) });
      // door and windows (lit above, dark sockets below)
      b.box(0.24, 0.48, 0.02, { z: L.d / 2 + 0.005, color: dead ? '#5a4a3a' : r2(L.k * 3, ['#5a3c2c', '#3f5a6a', '#6a3a32', accent]), mat: mat(M.wood) });
      const nw = Math.max(1, Math.round(L.w / 0.5));
      for (let f = 0; f < Math.floor((L.h - 0.5) / 0.6); f++) for (let i = 0; i < nw; i++) {
        const u = -L.w / 2 + (i + 0.5) * (L.w / nw);
        const lit = !dead && ((i + f + Math.floor(L.k * 10)) % 3 === 0);
        b.quad(0.16, 0.22, { x: u, y: 0.75 + f * 0.6, z: L.d / 2 + 0.008, color: lit ? C.lamp : (dead ? '#3a3026' : '#3a3c44'), mat: lit ? M.glow : mat(M.smooth), glow: 1.5 });
      }
      b.pop();
    }
    // the square: a well, a tree (above) or its bare twin (below)
    b.cyl(1.55, 1.55, 0.03, { y: y0, color: dead ? '#cdbf9f' : '#d9c6a0', seg: 24, mat: mat(M.stone) });
    b.cyl(0.25, 0.28, 0.3, { x: -0.2, y: y0, z: 1.25, color: dead ? '#bfae8e' : C.ash, seg: 10, mat: mat(M.stone) });
    if (dead) tree(b, { x: 1.6, y: y0, z: 1.2, h: 1.3, kind: 'bare', trunk: '#a8977a', r: rng });
    else tree(b, { x: 1.6, y: y0, z: 1.2, h: 1.5, kind: 'round', color: '#7f9a5e', r: rng });
    // church with bell tower (fits under the vault)
    b.push({ x: -4.4, y: y0, z: 3.4, ry: 0.9 });
    b.box(1.6, 1.7, 2.6, { color: dead ? '#e0d2b6' : '#f1e3c8', mat: mat(M.stone) });
    b.geo(new THREE.ExtrudeGeometry(new THREE.Shape([new THREE.Vector2(-0.88, 0), new THREE.Vector2(0.88, 0), new THREE.Vector2(0, 0.7)]), { depth: 2.7, bevelEnabled: false }).translate(0, 0, -1.35), { y: 1.7, color: dead ? '#b8a789' : C.brick, mat: mat(M.flat) });
    b.box(0.7, 3.0, 0.7, { x: 0.9, z: -1.0, color: dead ? '#d6c8aa' : '#ead8b8', mat: mat(M.stone) });
    b.prism(0, 0.55, 0.9, 4, { x: 0.9, y: 3.0, z: -1.0, ry: Math.PI / 4, color: dead ? '#b8a789' : C.terracotta, mat: mat(M.flat) });
    b.box(0.5, 0.9, 0.03, { y: 0, z: 1.31, color: dead ? '#4a3c30' : '#4e3426', mat: mat(M.wood) });
    b.pop();
    // the scenes, the same at the same spots
    const robeL = ['#a0524a', '#5d6d8a', '#c9a35a', '#6f7f6a', '#8a4a6a', '#d07a3a', '#4d5a7a'];
    const bone = ['#e3d6bc', '#d8c8a8', '#cdbb98'];
    let ci = 0;
    const P = (o) => figure(b, { mat: mat(M.stone), robe: dead ? bone[ci % 3] : robeL[ci % robeL.length], top: dead ? bone[(ci + 1) % 3] : robeL[(ci + 3) % robeL.length], skin: dead ? '#cbb48e' : '#d9b391', hatColor: dead ? '#b8a789' : '#3a3330', fat: dead ? 0.78 : 1, lean: (o.lean || 0) + (dead ? 0.08 : 0), ...o, y: y0, ...(ci++, {}) });
    for (const [sx, sz, sry, kind] of scenes) {
      b.push({ x: sx, z: sz, ry: sry });
      if (kind === 'cards') {
        b.box(0.5, 0.03, 0.4, { y: y0 + 0.3, color: dead ? '#a8977a' : C.wood, mat: mat(M.wood) });
        b.cyl(0.03, 0.03, 0.3, { y: y0, color: '#5a4a3a', mat: mat(M.wood), seg: 5 });
        P({ x: -0.38, z: 0, ry: Math.PI / 2, arms: ['fwd', 'chin'] });
        P({ x: 0.38, z: 0, ry: -Math.PI / 2, arms: ['fwd', 'up'] });
        for (let k = 0; k < 3; k++) b.box(0.05, 0.005, 0.07, { x: -0.1 + k * 0.08, y: y0 + 0.335, rz: 0, ry: k * 0.4, color: '#f4efe6', mat: mat(M.smooth) });
      } else if (kind === 'tailor') {
        b.box(0.5, 0.25, 0.3, { y: y0, color: dead ? '#b8a789' : '#8a6a4a', mat: mat(M.wood) });
        b.box(0.4, 0.01, 0.25, { y: y0 + 0.26, color: dead ? '#d8ccb4' : accent, mat: mat(M.cloth) });
        P({ z: -0.3, arms: ['fwd', 'fwd'], lean: 0.3, hat: 'cap' });
      } else if (kind === 'smith') {
        b.box(0.18, 0.18, 0.12, { y: y0, color: '#3a3a3e', mat: mat(M.rough_metal) });
        b.box(0.28, 0.06, 0.12, { y: y0 + 0.18, color: '#3a3a3e', mat: mat(M.rough_metal) });
        P({ z: -0.3, arms: ['up', 'fwd'], fat: dead ? 0.85 : 1.25 });
        if (!dead) b.sphere(0.06, { x: 0.1, y: y0 + 0.28, color: '#ff8a3a', mat: M.glow, glow: 2.5, seg: 6 });
      } else if (kind === 'barber') {
        b.box(0.3, 0.2, 0.3, { y: y0, color: dead ? '#a8977a' : '#7a3a3a', mat: mat(M.wood) });
        P({ y: y0, z: 0, arms: ['down', 'down'], h: 0.3 });
        P({ z: -0.35, arms: ['fwd', 'chin'], hat: 'cap' });
      } else if (kind === 'music') {
        P({ arms: ['fwd', 'carry'] });
        b.sphere(0.07, { x: 0.05, y: y0 + 0.24, z: 0.1, sx: 0.7, color: dead ? '#b8a789' : '#9a5a2a', mat: mat(M.wood), seg: 8 });
      } else if (kind === 'reader') {
        b.box(0.4, 0.15, 0.15, { y: y0, color: dead ? '#a8977a' : C.wood, mat: mat(M.wood) });
        P({ y: y0 + 0.0, z: 0, arms: ['carry', 'carry'], lean: 0.2, hat: 'brim' });
      }
      b.pop();
    }
    // walkers in the streets (the living hurry; the dead stand in the same places)
    for (let i = 0; i < 10; i++) {
      const L = lots[(i * 3) % lots.length];
      const a = L.ry;
      if (!dead && dotN(L.x, L.z) > CUT - 0.8) continue;
      P({ x: L.x + Math.sin(a) * (L.d / 2 + 0.4), z: L.z + Math.cos(a) * (L.d / 2 + 0.4), ry: a + (i % 2 ? 0.4 : -2.6), arms: [i % 2 ? 'out' : 'down', 'down'], hat: ['veil', 'cap', 'brim', null][i % 4] });
    }
  };

  /* ---------- the cavern & earth ---------- */
  const b = new Builder();
  b.cyl(R0, R0, 0.05, { color: '#4f3f33', seg: 72 });
  // packed earth floor of the underground streets
  for (let i = 0; i < 120; i++) {
    const [x, z] = rng.inDisc(9.4);
    b.box(rng.range(0.3, 0.5), 0.02, rng.range(0.25, 0.4), { x, y: 0.05, z, ry: rng.range(0, 3), color: rng.pick(['#7a6650', '#6a5844', '#86705a']) });
  }
  // the earth wall at the back, with ossuary niches
  const strataCols = ['#6b5340', '#7d6450', '#5e4838', '#8a705a'];
  for (let i = 0; i < 26; i++) {
    const a = WALL_A - WALL_SPAN + (i / 25) * 2 * WALL_SPAN;
    const x = Math.cos(a) * 9.7, z = Math.sin(a) * 9.7;
    const len = 2 * 9.7 * Math.sin(WALL_SPAN / 25) + 0.08;
    for (let s = 0; s < 4; s++) b.box(len, SY / 4 + 0.01, 1.4, { x, y: s * SY / 4, z, ry: -a + Math.PI / 2, color: strataCols[(s + (i % 2)) % 4], mat: M.flat });
    if (i % 2 === 0 && i > 1 && i < 24) {
      for (let row = 0; row < 3; row++) {
        const nx = Math.cos(a) * 9.0, nz = Math.sin(a) * 9.0, ny = 0.8 + row * 1.0;
        b.box(0.7, 0.55, 0.04, { x: nx, y: ny, z: nz, ry: -a + Math.PI / 2, color: '#2f241c' });
        for (let k = 0; k < 3; k++) b.sphere(0.08, { x: nx + Math.sin(a) * (k - 1) * 0.2, y: ny + 0.12, z: nz - Math.cos(a) * (k - 1) * 0.2, color: '#e3d6bc', seg: 6 });
      }
    }
  }
  // pillars of earth holding up the living city, wrapped in roots
  for (const [px, pz] of pillars) {
    b.cyl(0.85, 1.15, SY, { x: px, z: pz, color: '#6e5642', mat: M.flat, seg: 9 });
    for (let k = 0; k < 3; k++) b.cyl(0.92 - k * 0.05, 1.0 - k * 0.04, 0.3, { x: px, y: 0.6 + k * 1.3, z: pz, color: strataCols[k % 4], mat: M.flat, seg: 9 });
    for (let k = 0; k < 4; k++) {
      const a = rng.range(0, 6.28);
      b.tube([[px + Math.cos(a) * 0.9, SY, pz + Math.sin(a) * 0.9], [px + Math.cos(a) * 1.0, SY - 1.2, pz + Math.sin(a) * 1.0], [px + Math.cos(a) * 1.1, SY - 2.6, pz + Math.sin(a) * 1.1 + 0.1]], 0.03, { color: '#a8875e', mat: M.wood, rseg: 4 });
    }
  }
  // the slab: earth with a hole for the stair, strata on its edge, roots hanging
  const al = Math.acos(CUT / R0);
  const spts = [];
  for (let i = 0; i <= 64; i++) {
    const a = NA + al + ((Math.PI * 2 - 2 * al) * i) / 64;
    spts.push(new THREE.Vector2(Math.cos(a) * R0, -Math.sin(a) * R0));
  }
  const shape = new THREE.Shape(spts);
  const slabG = (h) => new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false, curveSegments: 48 }).rotateX(-Math.PI / 2);
  b.geo(slabG(0.18), { y: SY, color: '#6e5642', mat: M.flat });
  b.geo(slabG(0.16), { y: SY + 0.18, color: '#9a7d5e', mat: M.flat });
  b.geo(slabG(0.14), { y: SY + 0.34, color: '#7d6450', mat: M.flat });
  b.geo(slabG(0.06), { y: SY + 0.48, color: '#a88c6a', mat: M.flat });
  b.geo(slabG(0.06), { y: TOP - 0.06, color: '#8a9a62' });
  // roots and lumps under the vault
  for (let i = 0; i < 70; i++) {
    const [x, z] = rng.inDisc(9.8, 0.5);
    if (dotN(x, z) > CUT - 0.1) continue;
    if (rng.chance(0.5)) b.rod([x, SY, z], [x + rng.range(-0.15, 0.15), SY - rng.range(0.3, 1.1), z + rng.range(-0.15, 0.15)], 0.02, { color: '#a8875e', r2: 0.005 });
    else b.geo(new THREE.ConeGeometry(0.18, 0.5, 5).rotateX(Math.PI), { x, y: SY - 0.25, z, color: rng.pick(strataCols), mat: M.flat });
  }
  /* ---------- the stair between the two cities, down the face of the section ---------- */
  b.push({ ry: -NA }); // local x = across the face (out of the slab), local z = along the face
  const nSteps = 26;
  for (let i = 0; i < nSteps; i++) {
    const v = S1 - ((i + 0.5) * (S1 - S0)) / nSteps;
    b.box(0.8, (TOP * (i + 1)) / nSteps, (S1 - S0) / nSteps + 0.01, { x: SO, z: v, color: i % 2 ? '#a3937c' : '#958670' });
    if (i % 3 === 0) b.box(0.05, 0.4, 0.05, { x: SO + 0.38, y: (TOP * (i + 1)) / nSteps, z: v, color: '#e8dcc6' });
  }
  b.box(1.0, TOP, 1.0, { x: SO - 0.1, z: S0 - 0.5, color: '#958670' }); // the stairhead pier
  b.box(0.5, 0.06, 1.0, { x: CUT + 0.0, y: TOP - 0.06, z: S0 - 0.5, color: '#a3937c' });
  // a small portal at the stairhead, on the living side
  b.box(0.16, 1.2, 0.16, { x: CUT - 0.5, y: TOP, z: S0 - 1.0, color: '#e8dcc6' });
  b.box(0.16, 1.2, 0.16, { x: CUT - 0.5, y: TOP, z: S0 + 0.0, color: '#e8dcc6' });
  b.box(0.3, 0.18, 1.3, { x: CUT - 0.5, y: TOP + 1.2, z: S0 - 0.5, color: '#e8dcc6' });
  b.prism(0, 0.85, 0.45, 4, { x: CUT - 0.5, y: TOP + 1.38, z: S0 - 0.5, ry: Math.PI / 4, sx: 0.4, color: '#7a4a3a', mat: M.flat });
  // the section face: roots and a few stones showing in the cut
  for (let i = 0; i < 40; i++) {
    const v = rng.range(-8.5, 8.5);
    if (Math.hypot(CUT, v) > R0 - 0.3) continue;
    if (rng.chance(0.6)) b.rod([CUT + 0.01, TOP - 0.05, v], [CUT + 0.06, TOP - rng.range(0.4, 1.4), v + rng.range(-0.2, 0.2)], 0.018, { color: '#b08e62', r2: 0.006 });
    else b.sphere(rng.range(0.05, 0.12), { x: CUT + 0.01, y: SY + rng.range(0.05, ST - 0.1), z: v, sx: 0.4, color: rng.pick(['#9a8a74', '#c9b896', '#5e4838']), seg: 5 });
  }
  b.pop();

  object.add(b.build());

  // the two cities
  const upper = new Builder();
  city(upper, TOP, false);
  // paved lanes on top
  for (let i = 0; i < 420; i++) {
    const [x, z] = rng.inDisc(9.9);
    if (dotN(x, z) > CUT - 0.15 || lots.some((o) => Math.hypot(o.x - x, o.z - z) < o.r)) continue;
    upper.box(rng.range(0.25, 0.4), 0.02, rng.range(0.2, 0.32), { x, y: TOP, z, ry: rng.range(0, 3), color: rng.pick(['#d9c6a0', '#cdb894', '#e0d0ae']) });
  }
  // a little life on top: trees
  for (let i = 0; i < 10; i++) {
    const [x, z] = rng.inDisc(9.4, 2);
    if (!free(x, z, 0.4) || dotN(x, z) > CUT - 0.6 || lots.some((o) => Math.hypot(o.x - x, o.z - z) < o.r + 0.4)) continue;
    tree(upper, { x, y: TOP, z, h: rng.range(1.0, 1.6), kind: rng.pick(['round', 'cypress']), r: rng });
  }
  object.add(upper.build());
  const lower = new Builder();
  city(lower, 0.07, true);
  // candles on the tables of the dead
  for (const [sx, sz] of scenes) lower.sphere(0.04, { x: sx + 0.15, y: 0.42, z: sz + 0.1, color: '#ffbb66', mat: M.glow, glow: 3, seg: 6 });
  for (let i = 0; i < 12; i++) {
    const L = lots[(i * 5) % lots.length];
    lower.sphere(0.05, { x: L.x + Math.sin(L.ry) * (L.d / 2 + 0.12), y: 0.6, z: L.z + Math.cos(L.ry) * (L.d / 2 + 0.12), color: '#ffbb66', mat: M.glow, glow: 2.6, seg: 6 });
  }
  object.add(lower.build());

  /* ---------- the brotherhood carrying a body down ---------- */
  const fb = new Builder();
  const hood = { robe: '#4a3a30', top: '#4a3a30', hat: 'hood', hatColor: '#3e3028', skin: '#3e3028', h: 0.42, arms: ['carry', 'carry'] };
  figure(fb, { ...hood, x: 0.42, z: -0.22, ry: -Math.PI / 2 });
  figure(fb, { ...hood, x: 0.42, z: 0.22, ry: -Math.PI / 2 });
  figure(fb, { ...hood, x: -0.42, z: -0.22, ry: -Math.PI / 2 });
  figure(fb, { ...hood, x: -0.42, z: 0.22, ry: -Math.PI / 2 });
  fb.box(1.05, 0.04, 0.34, { y: 0.3, color: '#5a4a3a', mat: M.wood });
  fb.geo(new THREE.CapsuleGeometry(0.1, 0.55, 4, 8).rotateZ(Math.PI / 2), { y: 0.42, color: '#efe8da', mat: M.cloth });
  // a torch-bearer in front
  figure(fb, { ...hood, x: -0.95, z: 0, ry: -Math.PI / 2, arms: ['up', 'down'] });
  fb.sphere(0.06, { x: -0.95 - 0.05, y: 0.44, z: -0.07, color: '#ffb35a', mat: M.glow, glow: 3, seg: 6 });
  const proc = fb.build();
  const procG = new THREE.Group();
  procG.add(proc);
  const pivot = new THREE.Group();
  pivot.rotation.y = -NA;
  pivot.add(procG);
  object.add(pivot);

  const CYC = 30;
  return {
    object,
    update(t) {
      // through the living city to the stairhead, down the face of the section, into the city of the dead
      const c = (t % CYC) / CYC;
      let u, v, y, du = 0, dv = 0, vis = true;
      const vH = S0 - 0.5;
      if (c < 0.25) { const k = c / 0.25; u = CUT - 4.0 + (SO - CUT + 4.0) * k; v = vH; y = TOP; du = 1; vis = c > 0.01; }
      else if (c < 0.3) { const k = (c - 0.25) / 0.05; u = SO; v = vH + (S0 - vH) * k; y = TOP; dv = 1; }
      else if (c < 0.78) { const k = (c - 0.3) / 0.48; u = SO; v = S0 + (S1 - S0) * k; y = TOP + (0.08 - TOP) * k; dv = 1; }
      else { const k = (c - 0.78) / 0.22; u = SO - 2.4 * k; v = S1 + 0.3; y = 0.08; du = -1; vis = k < 0.96; }
      procG.position.set(u, y + Math.abs(Math.sin(t * 3)) * 0.015, v);
      procG.rotation.y = Math.atan2(dv, -du);
      procG.visible = vis;
    },
  };
}
