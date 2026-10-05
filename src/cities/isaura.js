// Isaura — the city of a thousand wells over a hidden lake. The ground is a
// raised block; a wedge is cut away to show the black lake beneath, the shafts
// and the buckets. On top, every well-head draws upward; vanes turn on tall wells.
import { THREE, Builder, M, C, house, tree, rock } from '../kit.js';
import { setInst, hash, figure } from './_ab_util.js';

const S = 3.0; // surface height (top of the raised block)
const CEIL = 2.05; // cavern ceiling (underside of the crust)
const LAKE = 0.42; // lake surface
const A0 = 0.18, A1 = 1.5; // the cut-away wedge (world angles, atan2(z, x))
const RB = 10.35; // block radius

const angIn = (x, z) => { const a = Math.atan2(z, x); return a > A0 && a < A1; };
// outline of the buried lake
const lakeR = (a) => 6.9 + 0.8 * Math.sin(2 * a + 1.1) + 0.45 * Math.sin(3 * a + 2.3) + 0.25 * Math.sin(5 * a + 0.4);

export default function build({ rng, accent }) {
  const b = new Builder();
  const object = new THREE.Group();

  /* ------------------------------------------- the raised block -- */
  const notched = (r, a0 = A0, a1 = A1, n = 96) => {
    const pts = [[0, 0]];
    for (let i = 0; i <= n; i++) {
      const a = a1 + ((Math.PI * 2 - (a1 - a0)) * i) / n;
      pts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    return pts;
  };
  // strata of the crust: topsoil, ochre clay, pale limestone, dark rock (ceiling)
  const strata = [
    [CEIL, 0.28, '#4e4640'],
    [CEIL + 0.28, 0.22, '#9a8a73'],
    [CEIL + 0.5, 0.2, '#c79a62'],
    [CEIL + 0.7, 0.17, '#d9be8d'],
    [CEIL + 0.87, S - CEIL - 0.87, '#cdb184'],
  ];
  for (const [y, h, col] of strata) b.slab(notched(RB), h, { y, color: col, mat: M.stone });
  // little wavy lines on the cut faces (fossil seams) for detail
  for (const a of [A0, A1]) {
    const ca = Math.cos(a), sa = Math.sin(a);
    const nrm = a === A0 ? 1 : -1; // offset toward the cut
    for (let k = 0; k < 14; k++) {
      const rr = rng.range(0.6, 10);
      const y = rng.range(CEIL + 0.1, S - 0.1);
      b.sphere(rng.range(0.03, 0.07), { x: ca * rr - sa * 0.01 * nrm, y, z: sa * rr + ca * 0.01 * nrm, sx: 1.8, color: rng.pick(['#efe2c4', '#7c6a58', '#b48c5c']), mat: M.smooth, seg: 6 });
    }
  }
  // cavern floor + lake bed
  b.cyl(RB, RB, 0.18, { color: '#2a2a2e', seg: 96 });
  // outer rock rim of the cavern (thick ring, also notched)
  {
    const ring = [];
    const n = 96;
    for (let i = 0; i <= n; i++) { const a = A1 + ((Math.PI * 2 - (A1 - A0)) * i) / n; ring.push([Math.cos(a) * RB, Math.sin(a) * RB]); }
    for (let i = n; i >= 0; i--) { const a = A1 + ((Math.PI * 2 - (A1 - A0)) * i) / n; const r = lakeR(a) + 0.9; ring.push([Math.cos(a) * r, Math.sin(a) * r]); }
    b.slab(ring, CEIL, { color: '#3f3a37', mat: M.stone });
  }
  // inside the wedge: a sloping rock beach between lake and rim, stalagmites and stalactites
  for (let i = 0; i < 70; i++) {
    const a = rng.range(A0 + 0.03, A1 - 0.03);
    const r = rng.range(lakeR(a) - 0.2, RB - 0.4);
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    const k = (r - lakeR(a)) / (RB - lakeR(a));
    rock(b, { x, y: 0.05, z, r: rng.range(0.25, 0.6), h: 0.3 + k * rng.range(0.6, 1.6), color: rng.pick(['#4a4440', '#57504a', '#3d3936']), rand: rng, detail: 0 });
  }
  for (let i = 0; i < 46; i++) {
    const a = rng.range(A0 + 0.04, A1 - 0.04);
    const r = rng.range(1.0, RB - 0.5);
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    const L = rng.range(0.25, 0.9);
    b.geo(new THREE.ConeGeometry(rng.range(0.06, 0.14), L, 6).rotateX(Math.PI).translate(0, -L / 2, 0), { x, y: CEIL + 0.01, z, color: rng.pick(['#5c5550', '#6c635a', '#4a4440']), mat: M.flat });
    if (r > lakeR(a) + 0.1 && rng.chance(0.5)) b.cone(rng.range(0.07, 0.15), rng.range(0.25, 0.7), { x, y: 0.15, z, seg: 6, color: '#625a52', mat: M.flat });
  }
  // a few great columns where stalactite met stalagmite
  for (const [a, r] of [[0.55, 8.3], [1.2, 3.2], [0.4, 4.6]]) {
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    b.lathe([[0.45, 0], [0.26, 0.4], [0.16, 0.9], [0.14, 1.1], [0.2, 1.5], [0.42, CEIL]], { x, z, color: '#5b534c', mat: M.flat, seg: 8 });
  }

  /* ------------------------------------------------ the black lake -- */
  {
    const pts = [];
    for (let i = 0; i < 80; i++) { const a = (i / 80) * Math.PI * 2; const r = lakeR(a); pts.push([Math.cos(a) * r, Math.sin(a) * r]); }
    b.slab(pts, 0.04, { y: LAKE - 0.04, color: '#0f2d38', mat: M.glow, glow: 0.55 });
    const lakeMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.28, metalness: 0.05, transparent: true, opacity: 0.8 });
    lakeMat.userData.noShadow = true;
    b.slab(pts, 0.03, { y: LAKE, color: '#10303b', mat: lakeMat });
  }
  // a miners' ledge with lanterns, inside the wedge
  for (const [a, r] of [[0.95, 8.9], [0.32, 8.7], [1.33, 8.8]]) {
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    b.box(0.9, 0.08, 0.6, { x, y: 0.75, z, ry: -a, color: C.darkwood, mat: M.wood });
    b.cyl(0.04, 0.04, 0.3, { x, y: 0.83, z, color: C.charcoal, mat: M.metal, seg: 5 });
    b.sphere(0.07, { x, y: 1.16, z, mat: M.glow, color: C.lamp, glow: 3 });
    figure(b, { x: x - Math.sin(a) * 0.25, y: 0.83, z: z + Math.cos(a) * 0.25, h: 0.32, color: C.slate, ry: a });
  }
  // a little boat on the dark lake
  {
    const a = 0.8, r = 4.2, x = Math.cos(a) * r, z = Math.sin(a) * r;
    b.push({ x, y: LAKE - 0.08, z, ry: 1.2 });
    b.geo(new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), { sx: 0.22, sy: 0.18, sz: 0.55, y: 0.14, color: C.wood, mat: M.wood });
    figure(b, { y: 0.06, h: 0.3, color: '#e9dfc9' });
    b.sphere(0.05, { y: 0.55, z: 0.42, mat: M.glow, color: C.lamp, glow: 3 });
    b.rod([0, 0.1, 0.1], [0, 0.6, 0.42], 0.01, { color: C.darkwood });
    b.pop();
  }

  /* ---------------------------------------------- surface: the city -- */
  // the green edge tracing the lake below
  const greenOn = (x, z) => {
    const a = Math.atan2(z, x), r = Math.hypot(x, z);
    return Math.abs(r - lakeR(a)) < 0.55;
  };
  {
    const outer = [], inner = [];
    for (let i = 0; i <= 120; i++) {
      const a = A1 + ((Math.PI * 2 - (A1 - A0)) * i) / 120;
      outer.push([Math.cos(a) * (lakeR(a) + 0.5), Math.sin(a) * (lakeR(a) + 0.5)]);
      inner.push([Math.cos(a) * (lakeR(a) - 0.45), Math.sin(a) * (lakeR(a) - 0.45)]);
    }
    b.slab([...outer, ...inner.reverse()], 0.05, { y: S, color: '#7f9a55', mat: M.stone });
  }
  // the dry ground of the city inside the green edge (pale paving)
  {
    const pts = [];
    for (let i = 0; i <= 120; i++) { const a = A1 + ((Math.PI * 2 - (A1 - A0)) * i) / 120; const r = lakeR(a) - 0.45; pts.push([Math.cos(a) * r, Math.sin(a) * r]); }
    pts.push([0, 0]);
    b.slab(pts, 0.03, { y: S, color: '#e4cfa6', mat: M.stone });
  }
  // trees and gardens along the green edge
  for (let i = 0; i < 150; i++) {
    const a = rng.range(A1 + 0.04, A0 + Math.PI * 2 - 0.04);
    const r = lakeR(a) + rng.range(-0.35, 0.35);
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (rng.chance(0.4)) tree(b, { x, y: S + 0.05, z, h: rng.range(0.8, 1.5), kind: rng.pick(['palm', 'round', 'cypress', 'round']), r: rng, color: rng.pick([C.leaf, '#86a865', C.darkleaf]) });
    else b.geo(new THREE.IcosahedronGeometry(rng.range(0.12, 0.22), 0), { x, y: S + 0.12, z, sy: 0.7, color: rng.pick(['#7c9b52', '#5f7f45', '#93ad62']), mat: M.flat });
  }
  // desert outside the edge: pebbles, agaves
  for (let i = 0; i < 90; i++) {
    const [x, z] = rng.inDisc(10.1, 5);
    if (angIn(x, z) || Math.hypot(x, z) < lakeR(Math.atan2(z, x)) + 0.7) continue;
    if (rng.chance(0.5)) rock(b, { x, y: S - 0.05, z, r: rng.range(0.08, 0.25), h: rng.range(0.1, 0.3), color: rng.pick(['#bfa27a', '#a88d68', '#d1b68b']), rand: rng, detail: 0 });
    else for (let k = 0; k < 5; k++) b.cone(0.03, 0.25, { x, y: S, z, rx: 0.5, ry: k * 1.26, color: '#8a9a6a', mat: M.flat, seg: 4 });
  }

  // wind ripples in the sand
  const desert = (x, z) => !angIn(x, z) && Math.hypot(x, z) > lakeR(Math.atan2(z, x)) + 0.65 && Math.hypot(x, z) < 10.0;
  for (let i = 0; i < 260; i++) {
    const [x, z] = rng.inDisc(10.0, 4.5);
    if (!desert(x, z)) continue;
    const a = Math.atan2(z, x);
    b.sphere(1, { x, y: S - 0.02, z, sx: rng.range(0.3, 0.7), sy: 0.05, sz: 0.06, ry: -a + Math.PI / 2 + 0.4, color: rng.pick(['#d6bb8c', '#c9ab7a', '#e0c79a']), mat: M.stone, seg: 8, hseg: 4 });
  }
  // a caravan road winding in from the desert, with camels and travellers
  const road = [];
  for (let i = 0; i <= 14; i++) {
    const t = i / 14;
    const a = 3.6 + t * 0.9;
    const r = 10.0 - t * 2.4 + Math.sin(t * 7) * 0.25;
    road.push([Math.cos(a) * r, S + 0.01, Math.sin(a) * r]);
  }
  b.tube(road, 0.25, { sy: 0.06, color: '#bfa070', mat: M.stone, tseg: 60, rseg: 6 });
  const camel = (x, z, ry) => {
    b.push({ x, y: S, z, ry });
    b.sphere(0.13, { y: 0.32, sx: 1.5, sz: 0.85, color: '#b98b55', mat: M.smooth, seg: 8 });
    b.sphere(0.08, { y: 0.44, x: 0.02, color: '#b98b55', mat: M.smooth, seg: 6 });
    b.rod([0.17, 0.33, 0], [0.27, 0.52, 0], 0.03, { color: '#b98b55', mat: M.smooth });
    b.sphere(0.045, { x: 0.3, y: 0.53, sx: 1.4, color: '#b98b55', mat: M.smooth, seg: 6 });
    for (const [lx, lz] of [[0.12, 0.05], [0.12, -0.05], [-0.12, 0.05], [-0.12, -0.05]]) b.rod([lx, 0.3, lz], [lx, 0, lz], 0.018, { color: '#a07548', mat: M.smooth, seg: 4 });
    b.box(0.16, 0.08, 0.3, { y: 0.4, x: -0.1, color: rng.pick([accent, C.terracotta, '#7a5a9a']), mat: M.cloth });
    b.pop();
  };
  for (let i = 0; i < 4; i++) {
    const p = road[2 + i * 2];
    const q = road[3 + i * 2];
    camel(p[0], p[2], -Math.atan2(q[2] - p[2], q[0] - p[0]));
  }
  figure(b, { x: road[11][0], y: S, z: road[11][2], h: 0.3, color: '#e9dfc9' });
  // a date-palm oasis well in the desert (where the lake almost reaches)
  for (const [a, r] of [[2.4, 9.3], [4.9, 9.4], [5.7, 9.1]]) {
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (!desert(x, z)) continue;
    tree(b, { x, y: S, z, h: rng.range(1.0, 1.4), kind: 'palm', r: rng });
    tree(b, { x: x + 0.35, y: S, z: z - 0.2, h: rng.range(0.8, 1.1), kind: 'palm', r: rng });
  }

  // wells (positions inside the city, away from the cut)
  const wells = [];
  const ok = (x, z, rad, gap = 0.25) => {
    const a = Math.atan2(z, x), r = Math.hypot(x, z);
    if (r > lakeR(a) - 0.75) return false;
    // keep away from the wedge faces
    const d0 = Math.abs(-Math.sin(A0) * x + Math.cos(A0) * z), d1 = Math.abs(-Math.sin(A1) * x + Math.cos(A1) * z);
    if (angIn(x, z)) return false;
    if ((d0 < rad + 0.25 && x * Math.cos(A0) + z * Math.sin(A0) > 0) || (d1 < rad + 0.25 && x * Math.cos(A1) + z * Math.sin(A1) > 0)) return false;
    for (const w of wells) if (Math.hypot(w.x - x, w.z - z) < w.rad + rad + gap) return false;
    return true;
  };
  // tall wells first
  const tallSpots = [];
  for (let t = 0; t < 600 && tallSpots.length < 8; t++) {
    const [x, z] = rng.inDisc(7.3, 0.5);
    if (!ok(x, z, 0.75)) continue;
    const w = { x, z, rad: 0.75, kind: tallSpots.length % 3 === 1 ? 'tall' : 'masonry', h: rng.range(3.2, 6.2) };
    wells.push(w); tallSpots.push(w);
  }
  for (let t = 0; t < 2000 && wells.length < 26; t++) {
    const [x, z] = rng.inDisc(7.6, 0.3);
    const kind = rng.chance(0.55) ? 'windlass' : 'frame';
    if (!ok(x, z, 0.45)) continue;
    wells.push({ x, z, rad: 0.45, kind, h: kind === 'frame' ? rng.range(1.2, 2.0) : 0.7 });
  }
  // houses fill the gaps between wells
  const houses = [];
  for (let t = 0; t < 6000 && houses.length < 95; t++) {
    const [x, z] = rng.inDisc(7.8, 0.3);
    const w = rng.range(0.5, 0.95), d = rng.range(0.5, 0.95);
    const rad = Math.max(w, d) * 0.6;
    if (!ok(x, z, rad, -0.15)) continue;
    if (houses.some((h) => Math.hypot(h.x - x, h.z - z) < h.rad + rad + 0.06)) continue;
    houses.push({ x, z, w, d, rad });
  }
  for (const h of houses) {
    house(b, {
      x: h.x, y: S, z: h.z, w: h.w, d: h.d, h: rng.range(0.6, 1.5), ry: -Math.atan2(h.z, h.x) + rng.range(-0.15, 0.15),
      roof: rng.pick(['flat', 'flat', 'flat', 'dome']), wall: rng.pick(['#ecdcbc', '#e6cfa4', '#f1e5cc', '#dcc097', '#e8c9a0']),
      roofColor: rng.pick(['#e7d8b8', '#cfe0dc', accent]), lit: 0.35, r: rng,
    });
  }

  // animated parts collected here
  const buckets = []; // {x, z, y0, y1, ph, sp}
  const wheels = []; // {x, y, z, ry, sp, s}
  const drums = []; // {x, y, z, ry, sp}
  const vanes = []; // {x, y, z, ph}

  const kerb = (x, z, r = 0.3) => {
    b.cyl(r, r + 0.03, 0.3, { x, y: S, z, color: '#bfae92', mat: M.stone, seg: 12, open: true });
    b.cyl(r - 0.06, r - 0.04, 0.3, { x, y: S, z, color: '#8e806c', mat: M.stone, seg: 12, open: true });
    b.torus(r - 0.01, 0.045, { x, y: S + 0.3, z, rx: Math.PI / 2, color: '#d6c7aa', mat: M.stone, tseg: 16, rseg: 4 });
    b.disc(r - 0.05, { x, y: S + 0.12, z, color: '#0e1f26', mat: M.smooth, seg: 12 });
  };

  for (const w of wells) {
    const ry = rng.range(0, Math.PI);
    if (w.kind === 'windlass') {
      kerb(w.x, w.z);
      const ca = Math.cos(ry) * 0.33, sa = Math.sin(ry) * 0.33;
      for (const s of [-1, 1]) b.box(0.06, 0.75, 0.06, { x: w.x + s * ca, y: S + 0.2, z: w.z - s * sa, ry, color: C.darkwood, mat: M.wood });
      // little roof
      if (rng.chance(0.6)) b.geo(new THREE.ConeGeometry(0.5, 0.3, 4).rotateY(Math.PI / 4).translate(0, 0.15, 0), { x: w.x, y: S + 0.95, z: w.z, ry, sz: 0.7, color: rng.pick([C.terracotta, '#b86b4b', '#7a8f9a']), mat: M.flat });
      drums.push({ x: w.x, y: S + 0.8, z: w.z, ry, sp: rng.range(0.5, 1.0) * rng.sign() });
      b.rod([w.x, S + 0.8, w.z], [w.x, S + 0.15, w.z], 0.008, { color: '#cdb98f', seg: 3 });
      buckets.push({ x: w.x, z: w.z, y0: S + 0.05, y1: S + 0.62, ph: rng.range(0, 6.28), sp: rng.range(0.35, 0.6) });
      // a trough with water beside some wells
      if (rng.chance(0.4)) {
        const tx = w.x + Math.cos(ry + 1.57) * 0.55, tz = w.z - Math.sin(ry + 1.57) * 0.55;
        b.box(0.5, 0.14, 0.22, { x: tx, y: S, z: tz, ry, color: '#a99a80', mat: M.stone });
        b.box(0.44, 0.02, 0.16, { x: tx, y: S + 0.12, z: tz, ry, color: '#5f9fb0', mat: M.water });
      }
    } else if (w.kind === 'frame') {
      kerb(w.x, w.z, 0.28);
      // A-frame of three legs and a pulley wheel at the top
      const top = S + w.h;
      for (let k = 0; k < 3; k++) {
        const a = ry + (k / 3) * Math.PI * 2;
        b.rod([w.x + Math.cos(a) * 0.42, S, w.z + Math.sin(a) * 0.42], [w.x, top, w.z], 0.025, { color: rng.pick([C.wood, C.darkwood]), mat: M.wood, seg: 5 });
      }
      wheels.push({ x: w.x, y: top - 0.05, z: w.z, ry, sp: rng.range(0.6, 1.2) * rng.sign(), s: 0.16 });
      b.rod([w.x, top - 0.1, w.z], [w.x, S + 0.15, w.z], 0.008, { color: '#cdb98f', seg: 3 });
      buckets.push({ x: w.x, z: w.z, y0: S + 0.05, y1: top - 0.4, ph: rng.range(0, 6.28), sp: rng.range(0.2, 0.35) });
    } else if (w.kind === 'masonry') {
      // whitewashed well-tower with a belvedere; a pulley arm reaches out over a kerb at its foot
      const top = S + w.h;
      const wall = rng.pick(['#f2e8d6', '#ecdcc0', '#e9d3b4']);
      b.prism(0.27, 0.36, w.h - 0.7, 8, { x: w.x, y: S, z: w.z, color: wall, mat: M.stone });
      for (let L = 1; L < w.h / 1.1; L++) b.cyl(0.36 - 0.09 * (L * 1.1) / w.h + 0.03, 0.37 - 0.09 * (L * 1.1) / w.h + 0.03, 0.06, { x: w.x, y: S + L * 1.1, z: w.z, seg: 8, color: '#cbb38d', mat: M.stone });
      for (let L = 0; L < w.h / 1.1 - 1; L++) {
        const a = rng.range(0, 6.28), lit = rng.chance(0.5), rr = 0.34 - 0.09 * (L * 1.1 + 0.6) / w.h;
        b.quad(0.08, 0.16, { x: w.x + Math.cos(a) * (rr + 0.012), y: S + 0.6 + L * 1.1, z: w.z + Math.sin(a) * (rr + 0.012), ry: Math.PI / 2 - a, mat: lit ? M.glow : M.smooth, color: lit ? C.lamp : C.charcoal });
      }
      const yb = top - 0.7;
      b.cyl(0.36, 0.3, 0.08, { x: w.x, y: yb, z: w.z, seg: 8, color: wall, mat: M.stone });
      for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; b.cyl(0.025, 0.025, 0.45, { x: w.x + Math.cos(a) * 0.28, y: yb + 0.08, z: w.z + Math.sin(a) * 0.28, color: wall, mat: M.smooth, seg: 5 }); }
      const cap = rng.pick(['dome', 'cone', 'onion']);
      if (cap === 'dome') b.dome(0.34, { x: w.x, y: yb + 0.53, z: w.z, color: rng.pick([accent, '#7fa3b0', '#d9b06a']), mat: M.smooth });
      else if (cap === 'cone') b.cone(0.4, 0.55, { x: w.x, y: yb + 0.53, z: w.z, seg: 8, color: rng.pick([C.terracotta, accent]), mat: M.flat });
      else b.onion(0.36, 0.6, { x: w.x, y: yb + 0.53, z: w.z, color: rng.pick([accent, C.gold]), mat: M.smooth });
      b.cyl(0.36, 0.36, 0.06, { x: w.x, y: yb + 0.5, z: w.z, seg: 8, color: wall, mat: M.stone });
      b.sphere(0.07, { x: w.x, y: yb + 0.25, z: w.z, mat: M.glow, color: C.lamp, glow: 2.5 });
      const vy = yb + 0.53 + 0.7;
      b.cyl(0.012, 0.012, 0.55, { x: w.x, y: vy - 0.45, z: w.z, color: C.charcoal, mat: M.metal, seg: 4 });
      vanes.push({ x: w.x, y: vy + 0.1, z: w.z, ph: rng.range(0, 6.28) });
      // the pulley arm
      const ca = Math.cos(ry), sa = -Math.sin(ry);
      const ax = w.x + ca * 0.85, az = w.z + sa * 0.85, ay = yb - 0.25;
      b.beam([w.x + ca * 0.3, ay, w.z + sa * 0.3], [ax, ay, az], 0.07, { color: C.darkwood, mat: M.wood });
      b.beam([w.x + ca * 0.3, ay - 0.55, w.z + sa * 0.3], [w.x + ca * 0.65, ay, w.z + sa * 0.65], 0.04, { color: C.darkwood, mat: M.wood });
      wheels.push({ x: ax, y: ay - 0.16, z: az, ry, sp: rng.range(0.5, 0.9) * rng.sign(), s: 0.14 });
      kerb(ax, az, 0.24);
      b.rod([ax, ay - 0.2, az], [ax, S + 0.15, az], 0.008, { color: '#cdb98f', seg: 3 });
      buckets.push({ x: ax, z: az, y0: S + 0.05, y1: ay - 0.45, ph: rng.range(0, 6.28), sp: rng.range(0.1, 0.18) });
    } else {
      // tall well: a lattice tower over the shaft, pulley on top, weather vane above
      const top = S + w.h;
      const r = 0.38;
      kerb(w.x, w.z, 0.34);
      const legs = [];
      for (let k = 0; k < 4; k++) { const a = ry + Math.PI / 4 + (k / 4) * Math.PI * 2; legs.push([Math.cos(a), Math.sin(a)]); }
      for (const [c, s] of legs) b.rod([w.x + c * r * 1.5, S, w.z + s * r * 1.5], [w.x + c * r * 0.6, top, w.z + s * r * 0.6], 0.035, { color: '#a77d55', mat: M.wood, seg: 5 });
      const nLev = Math.round(w.h / 0.8);
      for (let L = 1; L <= nLev; L++) {
        const y = S + (L / nLev) * w.h;
        const rr = r * (1.5 - 0.9 * (L / nLev));
        for (let k = 0; k < 4; k++) {
          const [c0, s0] = legs[k], [c1, s1] = legs[(k + 1) % 4];
          b.rod([w.x + c0 * rr, y, w.z + s0 * rr], [w.x + c1 * rr, y, w.z + s1 * rr], 0.018, { color: C.wood, mat: M.wood, seg: 4 });
          if (L < nLev) {
            const y2 = S + ((L + 1) / nLev) * w.h, rr2 = r * (1.5 - 0.9 * ((L + 1) / nLev));
            b.rod([w.x + c0 * rr, y, w.z + s0 * rr], [w.x + c1 * rr2, y2, w.z + s1 * rr2], 0.012, { color: C.wood, mat: M.wood, seg: 3 });
          }
        }
      }
      // platform and little roof at the top
      b.box(r * 1.5, 0.06, r * 1.5, { x: w.x, y: top, z: w.z, ry, color: C.wood, mat: M.wood });
      b.geo(new THREE.ConeGeometry(r * 1.25, 0.5, 4).rotateY(Math.PI / 4).translate(0, 0.25, 0), { x: w.x, y: top + 0.55, z: w.z, ry, color: rng.pick([accent, '#b8774e', '#7b8fa0']), mat: M.flat });
      for (const [c, s] of legs) b.cyl(0.015, 0.015, 0.55, { x: w.x + c * r * 0.55, y: top, z: w.z + s * r * 0.55, color: C.darkwood, mat: M.wood, seg: 4 });
      b.cyl(0.012, 0.012, 0.55, { x: w.x, y: top + 1.0, z: w.z, color: C.charcoal, mat: M.metal, seg: 4 });
      b.sphere(0.04, { x: w.x, y: top + 1.0, z: w.z, color: C.gold, mat: M.metal, seg: 6 });
      wheels.push({ x: w.x, y: top + 0.35, z: w.z, ry, sp: rng.range(0.5, 0.9) * rng.sign(), s: 0.24 });
      vanes.push({ x: w.x, y: top + 1.42, z: w.z, ph: rng.range(0, 6.28) });
      b.rod([w.x, top + 0.3, w.z], [w.x, S + 0.15, w.z], 0.01, { color: '#cdb98f', seg: 3 });
      buckets.push({ x: w.x, z: w.z, y0: S + 0.05, y1: top - 0.2, ph: rng.range(0, 6.28), sp: rng.range(0.12, 0.2) });
      // a lamp on the platform
      b.sphere(0.05, { x: w.x + legs[0][0] * 0.3, y: top + 0.12, z: w.z + legs[0][1] * 0.3, mat: M.glow, color: C.lamp, glow: 3 });
    }
  }

  // people carrying water
  for (let i = 0; i < 26; i++) {
    const [x, z] = rng.inDisc(7, 0.5);
    if (!ok(x, z, 0.12)) continue;
    if (houses.some((h) => Math.hypot(h.x - x, h.z - z) < h.rad + 0.1)) continue;
    figure(b, { x, y: S + 0.03, z, h: 0.3, color: rng.pick(['#f0e6d2', C.terracotta, accent, '#6f7f9a', C.ochre]), ry: rng.range(0, 6), arms: rng.chance(0.3) ? 1 : 0 });
    if (rng.chance(0.4)) b.cyl(0.05, 0.04, 0.08, { x, y: S + 0.3, z, color: C.terracotta, mat: M.smooth, seg: 6 });
  }

  /* ----------------------- shafts and buckets seen in the cut-away -- */
  // vertical shafts piercing the crust above the wedge: we see them as stone pipes in the cut
  const cutShafts = [];
  for (const [a, r] of [[0.42, 2.4], [0.78, 5.0], [1.1, 3.6], [0.3, 6.2], [1.32, 6.0], [0.95, 7.0], [0.6, 1.4]]) {
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    // short shaft stub hanging from the ceiling (the bottom of a well)
    b.cyl(0.2, 0.2, 0.35, { x, y: CEIL - 0.3, z, color: '#6e655a', mat: M.stone, seg: 10, open: true });
    b.torus(0.2, 0.04, { x, y: CEIL - 0.3, z, rx: Math.PI / 2, color: '#7a7064', mat: M.stone, tseg: 14, rseg: 4 });
    b.rod([x, CEIL, z], [x, LAKE + 0.05, z], 0.008, { color: '#cdb98f', seg: 3 });
    cutShafts.push({ x, z });
    buckets.push({ x, z, y0: LAKE - 0.12, y1: CEIL - 0.45, ph: rng.range(0, 6.28), sp: rng.range(0.18, 0.3), dip: true });
  }
  // the wells above the wedge stand on the crust edge, so draw their kerbs as rings in the ceiling hole
  object.add(b.build());

  /* ------------------------------------------------------ animated -- */
  // buckets
  const bucketGeo = (() => {
    const bb = new Builder();
    bb.cyl(0.085, 0.065, 0.13, { color: '#8a5d3d', mat: M.wood, seg: 10 });
    bb.torus(0.085, 0.012, { y: 0.13, rx: Math.PI / 2, color: '#5f5a55', mat: M.wood, tseg: 12, rseg: 3 });
    bb.torus(0.07, 0.008, { y: 0.13, color: '#5f5a55', mat: M.wood, tseg: 10, rseg: 3, arc: Math.PI });
    const g = bb.build().children[0].geometry;
    return g;
  })();
  const bucketMesh = new THREE.InstancedMesh(bucketGeo, M.wood, buckets.length);
  bucketMesh.castShadow = true;
  bucketMesh.frustumCulled = false;
  object.add(bucketMesh);
  // pulley wheels
  const wheelGeo = (() => {
    const bb = new Builder();
    bb.torus(1, 0.12, { color: '#b28a4f', mat: M.metal, tseg: 18, rseg: 5 });
    for (let k = 0; k < 6; k++) bb.box(0.08, 1.9, 0.08, { y: -0.95, rz: (k / 6) * Math.PI, color: '#b28a4f', mat: M.metal });
    bb.cyl(0.18, 0.18, 0.25, { z: -0.125, rx: Math.PI / 2, color: '#6f6255', mat: M.metal, seg: 8 });
    return bb.build().children[0].geometry;
  })();
  // spokes were rotated around their base: re-centre them by building around origin
  const wheelMesh = new THREE.InstancedMesh(wheelGeo, M.metal, wheels.length);
  wheelMesh.frustumCulled = false;
  object.add(wheelMesh);
  // windlass drums with a crank
  const drumGeo = (() => {
    const bb = new Builder();
    bb.cyl(0.07, 0.07, 0.62, { rz: Math.PI / 2, x: 0.31, color: '#7a5235', mat: M.wood, seg: 8 });
    bb.box(0.03, 0.18, 0.03, { x: 0.33, y: 0, color: '#4b4b4f', mat: M.wood });
    bb.box(0.12, 0.03, 0.03, { x: 0.39, y: 0.17, color: '#4b4b4f', mat: M.wood });
    return bb.build().children[0].geometry;
  })();
  const drumMesh = new THREE.InstancedMesh(drumGeo, M.wood, drums.length);
  drumMesh.frustumCulled = false;
  object.add(drumMesh);
  // weather vanes: an arrow with a feathered tail and a little cock
  const vaneGeo = (() => {
    const bb = new Builder();
    bb.box(0.7, 0.025, 0.025, { color: C.gold, mat: M.metal });
    bb.geo(new THREE.ConeGeometry(0.06, 0.16, 4).rotateZ(-Math.PI / 2), { x: 0.4, color: C.gold, mat: M.metal });
    bb.box(0.16, 0.14, 0.01, { x: -0.3, y: 0.02, color: C.gold, mat: M.metal });
    bb.sphere(0.035, { color: C.gold, mat: M.metal, seg: 6 });
    return bb.build().children[0].geometry;
  })();
  const vaneMesh = new THREE.InstancedMesh(vaneGeo, M.metal, vanes.length);
  vaneMesh.frustumCulled = false;
  object.add(vaneMesh);
  // ripples where the buckets dip into the lake, and glints of the gods below
  const dips = buckets.filter((k) => k.dip);
  const rippleMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const ripples = new THREE.InstancedMesh(new THREE.RingGeometry(0.9, 1, 32).rotateX(-Math.PI / 2), rippleMat, dips.length * 2);
  ripples.frustumCulled = false;
  ripples.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(dips.length * 2 * 3), 3);
  object.add(ripples);
  const GL = 40;
  const glints = new THREE.InstancedMesh(new THREE.OctahedronGeometry(0.035, 0), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }), GL);
  glints.frustumCulled = false;
  glints.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(GL * 3), 3);
  const glintDef = [];
  for (let i = 0; i < GL; i++) {
    const a = rng.range(A0 + 0.05, A1 - 0.05), r = rng.range(0.8, lakeR(a) - 0.3);
    glintDef.push([Math.cos(a) * r, LAKE + 0.02 - rng.range(0, 0.05), Math.sin(a) * r, rng.range(0, 6.28), rng.range(0.3, 0.9)]);
  }
  object.add(glints);

  const glintCol = new THREE.Color('#7fe0d0');
  const update = (t) => {
    for (let i = 0; i < buckets.length; i++) {
      const k = buckets[i];
      // rise slowly, linger, drop quickly back: everything moves upward
      const u = ((t * k.sp + k.ph) % (Math.PI * 2)) / (Math.PI * 2);
      const up = u < 0.75 ? Math.sin((u / 0.75) * Math.PI * 0.5) : 1 - (u - 0.75) / 0.25;
      const e = up * up * (3 - 2 * up);
      setInst(bucketMesh, i, k.x, k.y0 + (k.y1 - k.y0) * e, k.z, 1, t * 0.3 + k.ph, Math.sin(t * 1.3 + k.ph) * 0.06);
    }
    bucketMesh.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < wheels.length; i++) {
      const w = wheels[i];
      setInst(wheelMesh, i, w.x, w.y, w.z, w.s, w.ry, 0, t * w.sp);
    }
    wheelMesh.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < drums.length; i++) {
      const d = drums[i];
      _o.position.set(d.x, d.y, d.z);
      _o.rotation.set(t * d.sp, d.ry, 0, 'YXZ');
      _o.scale.set(1, 1, 1);
      _o.updateMatrix();
      drumMesh.setMatrixAt(i, _o.matrix);
    }
    drumMesh.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < vanes.length; i++) {
      const v = vanes[i];
      const ang = 0.8 + Math.sin(t * 0.13 + v.ph) * 1.2 + Math.sin(t * 0.41 + v.ph * 2) * 0.25;
      setInst(vaneMesh, i, v.x, v.y, v.z, 1, ang);
    }
    vaneMesh.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < dips.length; i++) {
      const k = dips[i];
      for (let j = 0; j < 2; j++) {
        const u = ((t * 0.35 + k.ph + j * 0.5) % 1 + 1) % 1;
        setInst(ripples, i * 2 + j, k.x, LAKE + 0.035, k.z, 0.08 + u * 0.55);
        const f = (1 - u) * 0.6;
        ripples.instanceColor.setXYZ(i * 2 + j, f * 0.5, f * 0.9, f * 0.85);
      }
    }
    ripples.instanceMatrix.needsUpdate = true;
    ripples.instanceColor.needsUpdate = true;
    for (let i = 0; i < GL; i++) {
      const [x, y, z, ph, sp] = glintDef[i];
      const f = Math.max(0, Math.sin(t * sp + ph)) ** 6 * 2.2;
      setInst(glints, i, x, y, z, 0.5 + f * 0.5);
      glints.instanceColor.setXYZ(i, glintCol.r * f, glintCol.g * f, glintCol.b * f);
    }
    glints.instanceMatrix.needsUpdate = true;
    glints.instanceColor.needsUpdate = true;
  };
  const _o = new THREE.Object3D();
  update(0);
  return { object, update };
}
