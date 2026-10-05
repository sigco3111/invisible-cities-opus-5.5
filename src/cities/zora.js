// Zora — the memory theatre. Its streets follow one another like the notes of a
// score: the barber's striped awning, the clock, the fountain with nine jets, the
// astronomer's glass tower, the melon kiosk, the statue, the baths. One spiral street
// read like a stave of five lines. But kept motionless in order to be remembered,
// Zora crumbled: half the city still stands, the other half drifts away as dust.
import { THREE, Builder, M, C, Lines, glowMat, solid } from '../kit.js';

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

export default function build({ rng, accent }) {
  const b = new Builder();
  const ghost = new Builder(); // what is remembered but no longer there
  const object = new THREE.Group();

  // dissolution field: solid on the left of the front view, dust on the right
  const DX = 0.88, DZ = -0.48;
  const noise = (x, z) => 0.6 * Math.sin(x * 1.3 + z * 0.7) + 0.4 * Math.sin(z * 2.1 - x * 0.9);
  const D = (x, z) => smooth(-2.0, 6.5, x * DX + z * DZ + noise(x, z));

  /* --------------------------------------------- ground: paving tiles that lift away */
  b.cyl(10.45, 10.5, 0.05, { color: '#cbb89a', mat: M.stone, seg: 64 }); // bare earth beneath
  const T = 0.62;
  const tileCols = ['#e9dfcc', '#e3d6bf', '#efe6d6', '#ddcfb6'];
  for (let ix = -17; ix <= 17; ix++) {
    for (let iz = -17; iz <= 17; iz++) {
      const x = ix * T, z = iz * T;
      if (Math.hypot(x, z) > 10.1) continue;
      const d = D(x, z);
      if (rng() < d * 1.25 - 0.1) continue;
      b.box(T - 0.04, 0.06, T - 0.04, { x, y: 0.05, z, ry: d * rng.range(-0.3, 0.3), color: rng.pick(tileCols), mat: M.smooth });
    }
  }

  /* ----------------------------------------------- the spiral street (a stave) */
  const R0 = 9.3, R1 = 1.9, TURNS = 2.35, A0 = 2.4;
  const spiral = (u) => { // u: 0 rim .. 1 centre
    const a = A0 + u * TURNS * Math.PI * 2;
    const r = R0 + (R1 - R0) * u;
    return [Math.cos(a) * r, Math.sin(a) * r, a, r];
  };
  const stave = new Lines();
  const NS = 600;
  for (let line = 0; line < 5; line++) {
    const off = (line - 2) * 0.13;
    let prev = null;
    for (let i = 0; i <= NS; i++) {
      const u = i / NS;
      const [x, z, a] = spiral(u);
      const p = [x + Math.cos(a) * off, 0.14, z + Math.sin(a) * off];
      if (prev && D(x, z) < 0.55) stave.seg(prev, p, '#3b3026', 1);
      prev = p;
    }
  }
  // the street itself: a ribbon of pale stone that frays where Zora is forgotten
  for (let i = 0; i < 260; i++) {
    const u0 = i / 260, u1 = (i + 1) / 260;
    const [x0, z0] = spiral(u0), [x1, z1] = spiral(u1);
    const xm = (x0 + x1) / 2, zm = (z0 + z1) / 2;
    const dd = D(xm, zm);
    if (rng() < dd * 1.3 - 0.15) continue;
    const len = Math.hypot(x1 - x0, z1 - z0) + 0.03;
    b.box(len, 0.03, 0.82, { x: xm, y: 0.11, z: zm, ry: -Math.atan2(z1 - z0, x1 - x0), color: '#cdb994', mat: M.smooth });
  }
  // bar lines across the stave every so often
  for (let i = 1; i < 34; i++) {
    const [x, z, a] = spiral(i / 34);
    if (D(x, z) > 0.5) continue;
    stave.seg([x - Math.cos(a) * 0.27, 0.141, z - Math.sin(a) * 0.27], [x + Math.cos(a) * 0.27, 0.141, z + Math.sin(a) * 0.27], '#3b3026', 1);
  }

  /* ------------------------------------------------------- dust emitters */
  const emit = []; // [x, y, z, colorHex]
  const outline = new Lines(); // the scholars' memory of what stood here
  const sketch = (x, z, w, d, h, ry, k) => {
    const c = Math.cos(ry), s = Math.sin(ry);
    const P = (lx, y, lz) => [x + c * lx + s * lz, y, z - s * lx + c * lz];
    const cs = [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]];
    const col = '#bcd4ff';
    for (let i = 0; i < 4; i++) {
      const [ax, az] = cs[i], [bx, bz] = cs[(i + 1) % 4];
      outline.seg(P(ax, 0.1, az), P(bx, 0.1, bz), col, k);
      outline.seg(P(ax, 0.1 + h, az), P(bx, 0.1 + h, bz), col, k);
      outline.seg(P(ax, 0.1, az), P(ax, 0.1 + h, az), col, k);
    }
    outline.seg(P(-w / 2, 0.1 + h, 0), P(0, 0.1 + h + 0.38, 0), col, k);
    outline.seg(P(w / 2, 0.1 + h, 0), P(0, 0.1 + h + 0.38, 0), col, k);
    outline.seg(P(-w / 2, 0.1 + h, 0), P(w / 2, 0.1 + h, 0), col, k);
  };
  const crumble = (x, z, w, d, h, ry, color, roof, dd) => {
    if (dd > 0.3) sketch(x, z, w, d, h, ry, 0.25 + 0.6 * dd);
    // a house partly gone: slices with jagged tops; some fragments become emitters
    if (dd < 0.12) {
      b.box(w, h, d, { x, y: 0.08, z, ry, color });
      if (roof) b.geo(GABLE, { x, y: 0.08 + h, z, ry, sx: w + 0.08, sy: 0.38, sz: d + 0.08, color: roof, mat: M.flat });
      return true;
    }
    if (dd > 0.92) { emit.push([x, 0.15, z, color]); return false; }
    const n = 3;
    const c = Math.cos(ry), s = Math.sin(ry);
    for (let i = 0; i < n; i++) {
      const lx = (i + 0.5) / n * w - w / 2;
      const hh = Math.max(0.1, h * (1 - dd * rng.range(0.6, 1.2)));
      b.box(w / n + 0.002, hh, d, { x: x + c * lx, y: 0.08, z: z - s * lx, ry, color });
      // a few chunks still clinging above, floating slightly apart
      if (rng.chance(0.5)) b.box(w / n * 0.6, 0.12, d * 0.5, { x: x + c * lx, y: 0.08 + hh + rng.range(0.05, 0.3), z: z - s * lx, ry: ry + rng.range(-0.5, 0.5), rx: rng.range(-0.4, 0.4), color });
      emit.push([x + c * lx, 0.08 + hh, z - s * lx, color]);
    }
    return false;
  };

  const walls = ['#f3e9d8', '#efe4cf', '#ead2bf', '#e9cfae', '#f0dcc0', '#dcc7a0'];
  const roofs = ['#c26a43', '#a8553a', '#b4643f', '#7b8a9a'];

  // landmark slots along the stave (the notes)
  const NOTES = 8;
  const noteU = [];
  for (let i = 0; i < NOTES; i++) noteU.push(0.04 + i * (0.86 / (NOTES - 1)));
  const nearNote = (u) => noteU.some((n) => Math.abs(n - u) < 0.03);

  // houses along both sides of the street
  for (const side of [-1, 1]) {
    let u = 0;
    while (u < 0.97) {
      const [x0, z0, a, r] = spiral(u);
      const step = 0.8 / (2 * Math.PI * r * TURNS / 1); // ≈0.8 units of arc
      u += step * rng.range(0.95, 1.25);
      if (nearNote(u) || u > 0.95) continue;
      const off = side * 0.95;
      const x = x0 + Math.cos(a) * off, z = z0 + Math.sin(a) * off;
      if (Math.hypot(x, z) > 10.0 || Math.hypot(x, z) < 1.2) continue;
      const w = 0.72, d = 0.75, h = rng.range(0.7, 1.5) * (side > 0 ? 1.0 : 1.15);
      const ry = Math.PI / 2 - a + Math.PI / 2;
      const color = rng.pick(walls);
      const dd = D(x, z);
      const whole = crumble(x, z, w, d, h, -a, color, rng.pick(roofs), dd);
      if (whole) {
        // door and a window facing the street
        const fx = -Math.cos(a) * side, fz = -Math.sin(a) * side;
        const lit = rng.chance(0.5);
        b.quad(0.16, 0.26, { x: x + fx * (d / 2 + 0.012), y: 0.22, z: z + fz * (d / 2 + 0.012), ry: Math.atan2(fx, fz), color: '#4d3426', mat: M.wood });
        b.quad(0.14, 0.16, { x: x + fx * (d / 2 + 0.012), y: 0.62, z: z + fz * (d / 2 + 0.012), ry: Math.atan2(fx, fz), color: lit ? C.lamp : '#3d3430', mat: lit ? M.glow : M.smooth, glow: 1.6 });
      }
    }
  }

  /* -------------------------------------------------------- the landmarks */
  const at = (i) => { const [x, z, a] = spiral(noteU[i]); return { x, z, a, d: D(x, z) }; };
  const pick = (d) => (d > 0.45 ? ghost : b);
  const mat = (d, m) => (d > 0.45 ? M.glass : m);
  const col = (d, c) => (d > 0.45 ? '#dfeaff' : c);
  const markEmit = (L, h) => { if (L.d > 0.3) for (let i = 0; i < 6; i++) emit.push([L.x + rng.range(-0.4, 0.4), rng.range(0.2, h), L.z + rng.range(-0.4, 0.4), '#efe4cf']); };

  // 1. the barber's: a shop with a striped awning and a spiralled pole
  {
    const L = at(0), B = pick(L.d);
    B.push({ x: L.x, y: 0.08, z: L.z, ry: -L.a + Math.PI / 2 });
    B.box(1.4, 1.2, 0.9, { color: col(L.d, '#f3e9d8'), mat: mat(L.d, M.stone) });
    for (let k = 0; k < 7; k++) B.box(1.5 / 7, 0.03, 0.6, { x: -0.75 + (k + 0.5) * 1.5 / 7, y: 0.95, z: -0.68, rx: 0.35, color: col(L.d, k % 2 ? '#f6f2ea' : '#c0392b'), mat: mat(L.d, M.cloth) });
    B.cyl(0.06, 0.06, 1.0, { x: 0.6, z: -0.6, color: col(L.d, '#ffffff'), mat: mat(L.d, M.smooth), seg: 8 });
    for (let k = 0; k < 6; k++) B.torus(0.065, 0.018, { x: 0.6, y: 0.12 + k * 0.15, z: -0.6, rx: Math.PI / 2 + 0.5, color: col(L.d, k % 2 ? '#2c4f9e' : '#c0392b'), mat: mat(L.d, M.smooth), tseg: 10, rseg: 3 });
    B.sphere(0.08, { x: 0.6, y: 1.08, z: -0.6, color: col(L.d, C.gold), mat: mat(L.d, M.metal), seg: 8 });
    B.quad(0.5, 0.5, { y: 0.4, z: -0.452, ry: Math.PI, color: L.d > 0.45 ? '#dfeaff' : C.lamp, mat: L.d > 0.45 ? M.glass : M.glow, glow: 1.4 });
    B.pop();
    markEmit(L, 1.2);
  }
  // 2. the clock tower
  let clockHand = null;
  {
    const L = at(1), B = pick(L.d);
    B.box(0.9, 4.2, 0.9, { x: L.x, y: 0.08, z: L.z, ry: -L.a, color: col(L.d, '#e9dcc4'), mat: mat(L.d, M.stone) });
    B.geo(new THREE.ConeGeometry(0.75, 1.3, 4).rotateY(Math.PI / 4), { x: L.x, y: 4.28 + 0.65, z: L.z, ry: -L.a, color: col(L.d, '#7b8a9a'), mat: mat(L.d, M.flat) });
    // dial on all four faces
    for (let f = 0; f < 4; f++) {
      const fa = -L.a + f * Math.PI / 2;
      B.geo(new THREE.CircleGeometry(0.34, 20), { x: L.x + Math.sin(fa) * 0.46, y: 3.6, z: L.z + Math.cos(fa) * 0.46, ry: fa, color: L.d > 0.45 ? '#dfeaff' : '#fff3d8', mat: L.d > 0.45 ? M.glass : M.glow, glow: 1.3 });
    }
    markEmit(L, 4);
    if (L.d <= 0.45) {
      const hb = new Builder();
      hb.box(0.03, 0.28, 0.01, { y: 0, color: '#2a2420', mat: M.smooth });
      hb.box(0.035, 0.2, 0.01, { y: 0, rz: 1.9, color: '#2a2420', mat: M.smooth });
      clockHand = hb.build();
      const fa = -L.a;
      clockHand.position.set(L.x + Math.sin(fa) * 0.475, 3.6, L.z + Math.cos(fa) * 0.475);
      clockHand.rotation.y = fa;
      object.add(clockHand);
    }
  }
  // 3. the fountain with nine jets
  const jets = [];
  {
    const L = at(2), B = pick(L.d);
    B.cyl(1.0, 1.05, 0.3, { x: L.x, y: 0.08, z: L.z, color: col(L.d, '#efe6d6'), mat: mat(L.d, M.smooth), seg: 24 });
    B.cyl(0.92, 0.92, 0.02, { x: L.x, y: 0.36, z: L.z, color: col(L.d, '#5fa6b8'), mat: mat(L.d, M.water), seg: 24 });
    B.cyl(0.12, 0.16, 0.6, { x: L.x, y: 0.3, z: L.z, color: col(L.d, '#efe6d6'), mat: mat(L.d, M.smooth), seg: 10 });
    for (let k = 0; k < 9; k++) {
      const q = (k / 9) * Math.PI * 2;
      const sx = L.x + Math.cos(q) * 0.75, sz = L.z + Math.sin(q) * 0.75;
      B.sphere(0.05, { x: sx, y: 0.38, z: sz, color: col(L.d, '#efe6d6'), mat: mat(L.d, M.smooth), seg: 6 });
      jets.push([sx, sz, q, L.x, L.z]);
    }
    markEmit(L, 0.6);
  }
  // 4. the melon kiosk
  {
    const L = at(3), B = pick(L.d);
    B.cyl(0.6, 0.6, 0.5, { x: L.x, y: 0.08, z: L.z, color: col(L.d, '#7a5a3a'), mat: mat(L.d, M.wood), seg: 8 });
    for (let k = 0; k < 6; k++) B.cyl(0.025, 0.025, 0.7, { x: L.x + Math.cos(k) * 0.55, y: 0.58, z: L.z + Math.sin(k) * 0.55, color: col(L.d, C.darkwood), mat: mat(L.d, M.wood), seg: 4 });
    B.cone(0.85, 0.55, { x: L.x, y: 1.28, z: L.z, color: col(L.d, '#3d7a4a'), mat: mat(L.d, M.cloth), seg: 8 });
    for (let k = 0; k < 14; k++) {
      const q = rng() * Math.PI * 2, rr = rng.range(0.15, 0.5);
      B.geo(MELON, { x: L.x + Math.cos(q) * rr, y: 0.66, z: L.z + Math.sin(q) * rr, s: rng.range(0.8, 1.2), ry: rng() * 3, color: col(L.d, k % 3 ? '#5e8f3b' : '#e3c35a'), mat: mat(L.d, M.smooth) });
    }
    // melons tumbled onto the street
    for (let k = 0; k < 5; k++) B.geo(MELON, { x: L.x + rng.range(-1, 1), y: 0.18, z: L.z + rng.range(-1, 1), color: col(L.d, '#5e8f3b'), mat: mat(L.d, M.smooth) });
    markEmit(L, 1.3);
  }
  // 5. the statue on its column
  {
    const L = at(4), B = pick(L.d);
    B.box(0.6, 0.4, 0.6, { x: L.x, y: 0.08, z: L.z, color: col(L.d, '#ece2cf'), mat: mat(L.d, M.smooth) });
    B.cyl(0.14, 0.17, 2.0, { x: L.x, y: 0.48, z: L.z, color: col(L.d, '#ece2cf'), mat: mat(L.d, M.smooth), seg: 12 });
    B.box(0.42, 0.12, 0.42, { x: L.x, y: 2.48, z: L.z, color: col(L.d, '#ece2cf'), mat: mat(L.d, M.smooth) });
    B.cyl(0.08, 0.14, 0.42, { x: L.x, y: 2.6, z: L.z, color: col(L.d, '#f7f1e6'), mat: mat(L.d, M.smooth), seg: 8 });
    B.sphere(0.075, { x: L.x, y: 3.1, z: L.z, color: col(L.d, '#f7f1e6'), mat: mat(L.d, M.smooth), seg: 8 });
    B.rod([L.x, 2.95, L.z], [L.x + 0.22, 3.25, L.z + 0.05], 0.025, { color: col(L.d, '#f7f1e6'), mat: mat(L.d, M.smooth) });
    B.sphere(0.06, { x: L.x + 0.24, y: 3.28, z: L.z + 0.05, color: col(L.d, C.gold), mat: mat(L.d, M.metal), seg: 8 });
    markEmit(L, 3);
  }
  // 6. the baths: a dome pierced with star-shaped lights
  {
    const L = at(5), B = pick(L.d);
    B.cyl(1.05, 1.1, 0.9, { x: L.x, y: 0.08, z: L.z, color: col(L.d, '#ead2bf'), mat: mat(L.d, M.stone), seg: 20 });
    B.dome(1.0, { x: L.x, y: 0.98, z: L.z, color: col(L.d, '#f3e9d8'), mat: mat(L.d, M.smooth), seg: 24 });
    for (let k = 0; k < 14; k++) {
      const q = rng() * Math.PI * 2, ph = rng.range(0.25, 1.2);
      B.sphere(0.04, { x: L.x + Math.cos(q) * Math.cos(ph) * 1.0, y: 0.98 + Math.sin(ph) * 1.0, z: L.z + Math.sin(q) * Math.cos(ph) * 1.0, color: L.d > 0.45 ? '#dfeaff' : '#fff1c9', mat: L.d > 0.45 ? M.glass : M.glow, glow: 2.4, seg: 5 });
    }
    markEmit(L, 2);
  }
  // 7. the arch of the bell
  {
    const L = at(6), B = pick(L.d);
    B.push({ x: L.x, y: 0.08, z: L.z, ry: -L.a });
    B.box(0.25, 1.9, 0.4, { x: -0.55, color: col(L.d, '#e9dcc4'), mat: mat(L.d, M.stone) });
    B.box(0.25, 1.9, 0.4, { x: 0.55, color: col(L.d, '#e9dcc4'), mat: mat(L.d, M.stone) });
    B.box(1.4, 0.3, 0.45, { y: 1.9, color: col(L.d, '#e9dcc4'), mat: mat(L.d, M.stone) });
    B.geo(new THREE.SphereGeometry(0.2, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.6), { y: 1.75, color: col(L.d, '#c99a45'), mat: mat(L.d, M.metal) });
    B.box(0.3, 0.4, 0.3, { y: 2.2, color: col(L.d, '#e9dcc4'), mat: mat(L.d, M.stone) });
    B.pop();
    markEmit(L, 2);
  }
  // 8. at the centre: the astronomer's glass tower
  {
    const L = at(7);
    const x = 0.2, z = -0.1;
    b.cyl(1.2, 1.25, 0.3, { x, y: 0.08, z, color: '#efe6d6', mat: M.smooth, seg: 16 });
    // an iron-ribbed glass shaft, tapering, with an armillary sphere on top
    const HT = 8.5;
    b.cyl(0.55, 0.85, HT, { x, y: 0.38, z, color: '#e2f0ff', mat: M.glass, seg: 8, open: true });
    for (let k = 0; k < 8; k++) {
      const q = (k / 8) * Math.PI * 2;
      b.rod([x + Math.cos(q) * 0.85, 0.38, z + Math.sin(q) * 0.85], [x + Math.cos(q) * 0.55, 0.38 + HT, z + Math.sin(q) * 0.55], 0.03, { color: '#3a3c42', mat: M.rough_metal });
    }
    for (let k = 1; k < 8; k++) b.torus(0.85 - (0.3 * k) / 8, 0.025, { x, y: 0.38 + (HT * k) / 8, z, rx: Math.PI / 2, color: '#3a3c42', mat: M.rough_metal, tseg: 8, rseg: 3, ry: Math.PI / 8 });
    // spiral stair inside and lit landings
    for (let k = 0; k < 48; k++) {
      const t = k / 48, q = t * Math.PI * 2 * 4;
      b.box(0.35, 0.03, 0.14, { x: x + Math.cos(q) * 0.3, y: 0.5 + t * (HT - 0.4), z: z + Math.sin(q) * 0.3, ry: -q, color: '#d9c7a5', mat: M.wood });
    }
    b.cyl(0.05, 0.05, HT, { x, y: 0.38, z, color: '#3a3c42', seg: 6 });
    for (let k = 1; k < 4; k++) b.sphere(0.07, { x, y: 0.38 + (HT * k) / 4, z, color: C.lamp, mat: M.glow, glow: 3, seg: 6 });
    b.cyl(0.7, 0.6, 0.12, { x, y: 0.38 + HT, z, color: '#3a3c42', mat: M.rough_metal, seg: 12 });
    // the astronomer at his telescope
    b.rod([x, HT + 0.7, z], [x + 0.6, HT + 1.25, z - 0.3], 0.05, { color: C.gold, mat: M.metal });
    b.cone(0.08, 0.25, { x: x - 0.2, y: HT + 0.5, z: z + 0.15, color: '#2c4f9e', seg: 6 });
    b.sphere(0.05, { x: x - 0.2, y: HT + 0.79, z: z + 0.15, color: '#d7b08c', seg: 6 });
    // its constellations: a few glowing stars wired above
    void L;
  }
  const armil = new THREE.Group();
  {
    const ab = new Builder();
    for (let k = 0; k < 3; k++) ab.torus(0.55, 0.018, { rx: k === 0 ? Math.PI / 2 : 0, ry: k * 1.05, color: C.gold, mat: M.metal, tseg: 32, rseg: 3 });
    ab.torus(0.55, 0.022, { rx: Math.PI / 2 + 0.41, color: '#d9a94e', mat: M.metal, tseg: 32, rseg: 3 });
    ab.sphere(0.1, { color: '#ffd28a', mat: M.glow, glow: 3, seg: 10 });
    armil.add(ab.build());
    armil.position.set(0.2, 8.5 + 0.38 + 1.25, -0.1);
    object.add(armil);
  }

  // the scholars filing their knowledge: tiny figures standing at the notes
  for (let i = 0; i < NOTES; i++) {
    const L = at(i);
    if (L.d > 0.3) continue;
    for (let k = 0; k < 2; k++) {
      const x = L.x + Math.cos(L.a) * (k ? 0.5 : -0.5) + rng.range(-0.15, 0.15), z = L.z + Math.sin(L.a) * (k ? 0.5 : -0.5);
      b.cone(0.075, 0.27, { x, y: 0.1, z, color: k ? '#2f3a5a' : '#5a2f3a', seg: 6 });
      b.sphere(0.045, { x, y: 0.38, z, color: '#d7b08c', seg: 6 });
      b.box(0.08, 0.1, 0.02, { x: x + 0.05, y: 0.28, z, color: '#f6efe2', mat: M.cloth }); // a notebook
    }
  }

  object.add(b.build());
  const g = ghost.build({ shadows: false });
  object.add(g);
  const staveMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.7 });
  object.add(stave.build(staveMat));
  object.add(outline.build(new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.5, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending })));

  /* ---------------------------------------------- nine water jets (animated) */
  const jetLines = new THREE.InstancedMesh(new THREE.SphereGeometry(0.025, 5, 4), glowMat('#cfeaff', 1.4), jets.length * 8);
  object.add(jetLines);

  /* ------------------------------------------------ the dust of forgetting */
  const NP = 760;
  const frag = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), solid('#ffffff', { roughness: 0.7 }), NP);
  frag.castShadow = false;
  const ps = [];
  const _c = new THREE.Color();
  for (let i = 0; i < NP; i++) {
    const e = emit[i % emit.length] || [5, 0.2, -2, '#efe4cf'];
    ps.push({ x: e[0] + rng.range(-0.3, 0.3), y: e[1], z: e[2] + rng.range(-0.3, 0.3), s: rng.range(0.06, 0.2), ph: rng(), sp: rng.range(0.03, 0.07), rx: rng() * 6, ry: rng() * 6, sw: rng() * 6 });
    frag.setColorAt(i, _c.set(e[3]));
  }
  object.add(frag);
  const _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _e = new THREE.Euler();

  object.rotation.y = 0;

  return {
    object,
    update(t) {
      for (let i = 0; i < NP; i++) {
        const p = ps[i];
        const age = (p.ph + t * p.sp) % 1;
        // rise and drift away from the solid half, tumbling, shrinking to nothing
        const up = age * age * 7 + age * 1.5;
        _p.set(p.x + DX * age * 3.2 + Math.sin(t * 0.4 + p.sw) * 0.15 * age, p.y + up, p.z + DZ * age * 3.2 + Math.cos(t * 0.3 + p.sw) * 0.15 * age);
        _q.setFromEuler(_e.set(p.rx + t * 0.4 * age, p.ry + t * 0.3, 0));
        const k = p.s * Math.min(1, age * 8) * (1 - age);
        _s.set(k, k, k);
        frag.setMatrixAt(i, _m.compose(_p, _q, _s));
      }
      frag.instanceMatrix.needsUpdate = true;
      // nine jets: droplets travelling along arcs toward the centre column
      let n = 0;
      for (const [sx, sz, q, cx, cz] of jets) {
        for (let k = 0; k < 8; k++) {
          const u = ((t * 0.6 + k / 8 + q * 0.1) % 1);
          _p.set(sx + (cx - sx) * u * 0.8, 0.4 + Math.sin(Math.PI * u) * 0.75, sz + (cz - sz) * u * 0.8);
          _s.setScalar(1);
          _q.identity();
          jetLines.setMatrixAt(n++, _m.compose(_p, _q, _s));
        }
      }
      jetLines.instanceMatrix.needsUpdate = true;
      if (clockHand) clockHand.rotation.z = -t * 0.2;
      armil.rotation.y = t * 0.15;
      armil.rotation.z = Math.sin(t * 0.1) * 0.2;
    },
  };
}

const GABLE = (() => {
  const s = new THREE.Shape([new THREE.Vector2(-0.5, 0), new THREE.Vector2(0.5, 0), new THREE.Vector2(0, 1)]);
  const g = new THREE.ExtrudeGeometry(s, { depth: 1, bevelEnabled: false });
  g.translate(0, 0, -0.5);
  return g;
})();
const MELON = new THREE.SphereGeometry(0.1, 8, 6).scale(1, 0.85, 1.25);
