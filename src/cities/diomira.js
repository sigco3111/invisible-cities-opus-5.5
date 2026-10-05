// Diomira — sixty silver domes, bronze gods, lead streets, a crystal theatre,
// a golden rooster on a tower. A September evening: lamps are being lit over
// the food stalls, a woman calls from a terrace — an evening you envy as if
// you had already lived it.
import { THREE, Builder, M, C, Lines, windows, glowMat, scatter } from '../kit.js';
import { turnCity } from './_agentA_util.js';

const LEAD = '#6d7079';
const LEAD_DARK = '#4f525b';
const BRONZE = '#9c6a3c';
const BRONZE_DARK = '#6e4a2c';

// silver needs to read without an env map: half-metal, glossy
const SILVER = new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0.38, roughness: 0.26 });
const BRONZE_M = new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0.5, roughness: 0.4 });
const GOLD_M = new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0.7, roughness: 0.25, emissive: '#1c1200' });

export default function build({ rng, accent }) {
  const b = new Builder();
  const object = new THREE.Group();
  let domes = 0;
  const silverDome = (r, o) => { b.dome(r, { mat: SILVER, color: '#e8ebf0', seg: 20, hseg: 9, ...o }); b.cone(r * 0.07, r * 0.35, { x: o.x, y: o.y + r * 0.97, z: o.z, mat: GOLD_M, color: '#b88a3e', seg: 5 }); domes++; };

  /* ---------------- ground: lead paving, radiating lead streets ------------- */
  b.cyl(10.4, 10.5, 0.12, { color: '#85878d', mat: M.smooth, seg: 64 });
  // paving rings (slightly raised so no z-fight)
  for (const [r1, r2] of [[3.6, 3.75], [6.7, 6.85], [9.9, 10.05]]) b.geo(new THREE.RingGeometry(r1, r2, 64).rotateX(-Math.PI / 2), { y: 0.125, color: LEAD_DARK, mat: M.smooth });
  const STREETS = 8;
  const streetA = [];
  for (let i = 0; i < STREETS; i++) {
    const a = (i / STREETS) * Math.PI * 2 + 0.2;
    streetA.push(a);
    b.box(0.95, 0.02, 6.3, { x: Math.cos(a) * 6.9, y: 0.12, z: Math.sin(a) * 6.9, ry: Math.PI / 2 - a, color: LEAD, mat: M.smooth });
  }
  const onStreet = (x, z, pad = 0.9) => {
    const a = Math.atan2(z, x), r = Math.hypot(x, z);
    for (const s of streetA) {
      let d = Math.abs(((a - s + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
      if (Math.sin(d) * r < pad && Math.cos(d) > 0) return true;
    }
    return false;
  };

  /* ---------------- the crystal theatre (centre) --------------------------- */
  {
    const R = 2.5, H = 1.7;
    b.cyl(R + 0.35, R + 0.45, 0.28, { y: 0.12, color: C.ivory, mat: M.smooth, seg: 40 });
    b.cyl(R + 0.1, R + 0.2, 0.18, { y: 0.4, color: C.plaster, mat: M.smooth, seg: 40 });
    const y0 = 0.58;
    // interior: cavea in rings of red velvet and ivory
    for (let i = 0; i < 6; i++) {
      const r = R - 0.15 - i * 0.24;
      b.cyl(r, r, 0.12 + (5 - i) * 0.12, { y: y0, color: i % 2 ? '#8e2f2f' : '#b44a40', mat: M.cloth, seg: 32, thetaStart: Math.PI * 0.15, thetaLength: Math.PI * 1.3 });
    }
    // the stage: a glowing apron facing the seats
    b.box(1.5, 0.22, 0.9, { x: 0, y: y0, z: 0.9, color: C.wood, mat: M.wood });
    b.box(1.6, 1.2, 0.12, { x: 0, y: y0, z: 1.45, color: '#5a1e24', mat: M.cloth });
    b.box(1.2, 0.03, 0.75, { x: 0, y: y0 + 0.225, z: 0.9, color: C.lamp, mat: M.glow, glow: 1.6 });
    // footlights
    for (let i = 0; i < 7; i++) b.sphere(0.035, { x: -0.6 + i * 0.2, y: y0 + 0.27, z: 0.5, color: C.lamp, mat: M.glow, glow: 4, seg: 5 });
    // tiny actors
    b.cone(0.07, 0.25, { x: -0.2, y: y0 + 0.22, z: 1.0, color: '#e9d6b5', seg: 6 });
    b.sphere(0.045, { x: -0.2, y: y0 + 0.5, z: 1.0, color: '#d7b08c', seg: 6 });
    b.cone(0.07, 0.25, { x: 0.25, y: y0 + 0.22, z: 0.95, color: '#3b4a7a', seg: 6 });
    b.sphere(0.045, { x: 0.25, y: y0 + 0.5, z: 0.95, color: '#d7b08c', seg: 6 });
    // crystal walls and cupola with gilded ribs
    b.cyl(R, R, H, { y: y0, mat: M.glass, color: '#e6f2ff', seg: 32, open: true });
    b.dome(R, { y: y0 + H, mat: M.glass, color: '#e6f2ff', seg: 32, hseg: 12 });
    const ribs = 16;
    for (let i = 0; i < ribs; i++) {
      const a = (i / ribs) * Math.PI * 2;
      const c = Math.cos(a), s = Math.sin(a);
      b.rod([c * R, y0, s * R], [c * R, y0 + H, s * R], 0.035, { mat: GOLD_M, color: C.gold, seg: 5 });
      const pts = [];
      for (let k = 0; k <= 8; k++) { const p = (k / 8) * Math.PI / 2; pts.push([c * R * Math.cos(p), y0 + H + R * Math.sin(p), s * R * Math.cos(p)]); }
      b.tube(pts, 0.03, { mat: GOLD_M, color: C.gold, tseg: 16, rseg: 4 });
    }
    for (const yy of [y0 + 0.02, y0 + H * 0.5, y0 + H]) b.torus(R, 0.04, { y: yy, rx: Math.PI / 2, mat: GOLD_M, color: C.gold, tseg: 48, rseg: 4 });
    b.torus(R * 0.7, 0.03, { y: y0 + H + R * 0.71, rx: Math.PI / 2, mat: GOLD_M, color: C.gold, tseg: 40, rseg: 4 });
    // lantern on top
    b.cyl(0.25, 0.3, 0.45, { y: y0 + H + R - 0.05, mat: M.glass, color: '#fff3d8', seg: 10 });
    b.cyl(0.14, 0.14, 0.36, { y: y0 + H + R, mat: M.glow, color: C.lamp, glow: 2.2, seg: 8 });
    b.cone(0.3, 0.4, { y: y0 + H + R + 0.4, mat: GOLD_M, color: C.gold, seg: 10 });
    // entrance portico facing the market (+z)
    for (const dx of [-0.75, -0.25, 0.25, 0.75]) b.cyl(0.08, 0.09, 1.3, { x: dx, y: 0.58, z: R + 0.35, color: C.ivory, mat: M.smooth, seg: 10 });
    b.box(1.9, 0.18, 0.55, { y: 1.88, z: R + 0.3, color: C.ivory, mat: M.smooth });
    b.geo(new THREE.CylinderGeometry(0.0, 1, 1, 3, 1).rotateZ(0).rotateX(Math.PI / 2), { y: 2.06, z: R + 0.3, sx: 1.05, sy: 0.4, sz: 0.25, color: C.ivory, mat: M.smooth });
  }

  /* ---------------- the rooster tower (back left) ------------------------- */
  const TX = -3.9, TZ = -3.2, TH = 13.2;
  {
    b.box(1.5, 0.5, 1.5, { x: TX, z: TZ, y: 0.1, color: C.ivory, mat: M.smooth });
    b.box(1.15, TH - 3, 1.15, { x: TX, y: 0.6, z: TZ, color: '#e8dcc4' });
    // string courses + slit windows
    for (let i = 1; i <= 4; i++) b.box(1.25, 0.1, 1.25, { x: TX, y: 0.6 + i * 2.1, z: TZ, color: C.ivory, mat: M.smooth });
    windows(b, { x: TX, y: 0.6, z: TZ, w: 1.15, d: 1.15, h: TH - 3.4, cols: 1, floorH: 2.1, lit: 0.5, r: rng, size: 0.18 });
    // open belfry: four corner piers, arches implied by lintels, lit bell inside
    const by = TH - 2.4;
    for (const [dx, dz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) b.box(0.24, 1.3, 0.24, { x: TX + dx * 0.48, y: by, z: TZ + dz * 0.48, color: '#e8dcc4' });
    b.box(1.3, 0.22, 1.3, { x: TX, y: by + 1.3, z: TZ, color: C.ivory, mat: M.smooth });
    b.geo(new THREE.SphereGeometry(0.3, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.6), { x: TX, y: by + 0.75, z: TZ, mat: GOLD_M, color: '#c99a45' });
    b.sphere(0.12, { x: TX, y: by + 0.55, z: TZ, mat: M.glow, color: C.lamp, glow: 1.6, seg: 6 });
    // silver cupola + tall needle
    silverDome(0.62, { x: TX, y: by + 1.52, z: TZ });
    b.cyl(0.05, 0.05, 1.3, { x: TX, y: by + 2.1, z: TZ, mat: GOLD_M, color: C.gold, seg: 6 });
    // compass arms of the weathervane (fixed)
    b.rod([TX - 0.35, by + 2.9, TZ], [TX + 0.35, by + 2.9, TZ], 0.015, { mat: GOLD_M, color: C.gold });
    b.rod([TX, by + 2.9, TZ - 0.35], [TX, by + 2.9, TZ + 0.35], 0.015, { mat: GOLD_M, color: C.gold });
    for (const [dx, dz] of [[0.35, 0], [-0.35, 0], [0, 0.35], [0, -0.35]]) b.sphere(0.035, { x: TX + dx, y: by + 2.9, z: TZ + dz, mat: GOLD_M, color: C.gold, seg: 6 });
  }
  // the golden rooster (animated)
  const rooster = new THREE.Group();
  const rPivot = new THREE.Group();
  {
    const rb = new Builder();
    const gold = { mat: GOLD_M, color: '#f0c45c' };
    rb.geo(new THREE.SphereGeometry(0.22, 12, 9), { ...gold, sx: 1.3, sy: 0.9, sz: 0.75, y: 0.28 });
    // breast + neck + head
    rb.rod([0.18, 0.3, 0], [0.3, 0.58, 0], 0.075, { ...gold, r2: 0.11 });
    rb.sphere(0.09, { ...gold, x: 0.32, y: 0.64, seg: 8 });
    rb.cone(0.035, 0.12, { ...gold, x: 0.41, y: 0.62, rz: -Math.PI / 2, seg: 5 }); // beak
    for (let i = 0; i < 3; i++) rb.sphere(0.035, { x: 0.27 + i * 0.045, y: 0.74 + (i === 1 ? 0.02 : 0), color: '#e0503a', mat: M.smooth, seg: 5 }); // comb
    rb.sphere(0.03, { x: 0.36, y: 0.54, color: '#e0503a', mat: M.smooth, seg: 5 }); // wattle
    // sickle tail feathers fanned
    for (let i = 0; i < 5; i++) {
      const a = 0.5 + i * 0.25;
      const pts = [];
      for (let k = 0; k <= 6; k++) { const t = k / 6; pts.push([-0.2 - Math.sin(a) * 0.35 * t - t * t * 0.12, 0.33 + Math.cos(a) * 0.45 * t - t * t * 0.25, (i - 2) * 0.03]); }
      rb.tube(pts, 0.025, { ...gold, tseg: 10, rseg: 4 });
    }
    rb.rod([0, 0.1, 0], [0, 0.2, 0], 0.025, gold);
    rb.rod([0.05, 0.05, 0.04], [0.02, 0.18, 0.02], 0.015, gold);
    rb.rod([0.05, 0.05, -0.04], [0.02, 0.18, -0.02], 0.015, gold);
    const g = rb.build();
    g.scale.setScalar(2.1);
    rPivot.add(g);
    rooster.add(rPivot);
    rooster.position.set(TX, TH - 2.4 + 2.95, TZ);
    object.add(rooster);
  }

  /* ---------------- domed houses: the sixty silver domes ------------------ */
  const avoid = (x, z) => {
    if (Math.hypot(x, z) < 3.6) return false; // theatre
    if (Math.hypot(x - TX, z - TZ) < 1.4) return false;
    if (z > 3.6 && Math.abs(x - 0.6) < 4.2) return false; // market square
    if (onStreet(x, z, 0.75)) return false;
    return true;
  };
  const lots = scatter(rng, { count: 38, rMin: 3.9, rMax: 9.6, size: [1.0, 1.9], gap: 0.22, inside: avoid, tries: 9000 });
  const walls = ['#efe4cf', '#f3e9d8', '#e6cfa8', '#e7c3ad', '#dcc7a0', '#efd6b8', '#d9b58e'];
  lots.sort((p, q) => Math.hypot(p.x, p.z) - Math.hypot(q.x, q.z));
  for (const p of lots) {
    const r = Math.hypot(p.x, p.z);
    const h = 0.9 + (10 - r) * 0.2 + rng.range(0, 0.7);
    const wall = rng.pick(walls);
    const round = rng.chance(0.3);
    if (round) {
      const rr = Math.min(p.w, p.d) * 0.5;
      b.cyl(rr, rr * 1.03, h, { x: p.x, y: 0.12, z: p.z, color: wall, seg: 16 });
      b.cyl(rr * 1.08, rr * 1.08, 0.1, { x: p.x, y: 0.12 + h, z: p.z, color: C.ivory, mat: M.smooth, seg: 16 });
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + rng();
        const lit = rng.chance(0.55);
        b.quad(0.16, 0.3, { x: p.x + Math.cos(a) * (rr + 0.01), y: 0.12 + h * 0.55, z: p.z + Math.sin(a) * (rr + 0.01), ry: Math.PI / 2 - a, mat: lit ? M.glow : M.smooth, color: lit ? C.lamp : C.charcoal, glow: 1.8 });
      }
      b.cyl(rr * 0.8, rr * 0.82, 0.3, { x: p.x, y: 0.22 + h, z: p.z, color: wall, seg: 16 });
      silverDome(rr * 0.8, { x: p.x, y: 0.52 + h, z: p.z });
    } else {
      b.box(p.w, h, p.d, { x: p.x, y: 0.12, z: p.z, ry: p.ry, color: wall });
      b.box(p.w + 0.1, 0.1, p.d + 0.1, { x: p.x, y: 0.12 + h, z: p.z, ry: p.ry, color: C.ivory, mat: M.smooth });
      windows(b, { x: p.x, y: 0.12, z: p.z, w: p.w, d: p.d, h, ry: p.ry, lit: 0.45, r: rng, floorH: 0.8, size: 0.18 });
      const dr = Math.min(p.w, p.d) * 0.36;
      b.cyl(dr * 1.02, dr * 1.05, 0.28, { x: p.x, y: 0.22 + h, z: p.z, color: wall, seg: 16 });
      silverDome(dr, { x: p.x, y: 0.5 + h, z: p.z });
      // twin small domes on the corners of bigger roofs
      if (Math.min(p.w, p.d) > 1.45 && domes < 58) {
        const c = Math.cos(p.ry), s = Math.sin(p.ry);
        for (const sx of [-1, 1]) {
          const lx = sx * (p.w / 2 - 0.2), lz = p.d / 2 - 0.2;
          silverDome(0.17, { x: p.x + c * lx + s * lz, y: 0.22 + h, z: p.z - s * lx + c * lz });
        }
      }
    }
  }
  // a ring of small domed kiosks around the theatre until there are exactly sixty
  {
    const need = 60 - domes;
    for (let i = 0; i < need; i++) {
      const a = (i / need) * Math.PI * 2 + Math.PI / 2 + 0.35;
      const x = Math.cos(a) * 3.25, z = Math.sin(a) * 3.25;
      if (z > 2.4 && Math.abs(x) < 1.1) { continue; }
      b.cyl(0.04, 0.04, 0.55, { x, y: 0.12, z, color: C.ivory, mat: M.smooth, seg: 5 });
      silverDome(0.2, { x, y: 0.67, z });
      b.cyl(0.21, 0.21, 0.04, { x, y: 0.65, z, color: C.ivory, mat: M.smooth, seg: 12 });
    }
  }

  /* ---------------- bronze gods on every corner -------------------------- */
  const god = (x, z, face, kind) => {
    b.box(0.42, 0.55, 0.42, { x, y: 0.12, z, ry: face, color: C.ivory, mat: M.smooth });
    b.box(0.5, 0.08, 0.5, { x, y: 0.67, z, ry: face, color: C.ivory, mat: M.smooth });
    b.push({ x, y: 0.75, z, ry: face });
    const br = { mat: BRONZE_M, color: BRONZE };
    b.cyl(0.07, 0.13, 0.42, { ...br, seg: 8 }); // draped legs
    b.cyl(0.08, 0.07, 0.22, { ...br, y: 0.42, seg: 8 }); // torso
    b.sphere(0.065, { ...br, y: 0.71, seg: 8 });
    if (kind === 0) { // spear-bearer
      b.rod([0.12, 0.45, 0], [0.16, 0.95, 0.0], 0.02, br);
      b.rod([0.16, 0.0, 0], [0.16, 1.15, 0], 0.012, br);
      b.cone(0.03, 0.09, { ...br, x: 0.16, y: 1.15, seg: 4 });
    } else if (kind === 1) { // torch raised
      b.rod([-0.1, 0.55, 0], [-0.14, 0.92, 0.03], 0.022, br);
      b.cone(0.04, 0.1, { ...br, x: -0.14, y: 0.92, z: 0.03, rx: Math.PI, seg: 6 });
      b.sphere(0.04, { x: -0.14, y: 0.99, z: 0.03, mat: M.glow, color: '#ffb35a', glow: 3.5, seg: 6 });
    } else { // winged
      for (const s of [-1, 1]) b.geo(new THREE.CircleGeometry(0.22, 6, 0, Math.PI / 2), { ...br, x: s * 0.03, y: 0.5, z: -0.06, ry: s > 0 ? -0.5 : Math.PI + 0.5, rz: 0.2 });
      b.rod([0.08, 0.55, 0], [0.2, 0.68, 0.06], 0.02, br);
    }
    b.pop();
  };
  {
    let k = 0;
    for (const a of streetA) {
      for (const rr of [4.0, 6.6]) {
        const side = k % 2 ? 0.75 : -0.75;
        const x = Math.cos(a) * rr - Math.sin(a) * side, z = Math.sin(a) * rr + Math.cos(a) * side;
        if (z > 3.7 && Math.abs(x - 0.6) < 4.2 && z < 8.6 && rr > 5) { k++; continue; }
        god(x, z, -a - Math.PI / 2, k % 3);
        k++;
      }
    }
  }

  /* ---------------- the September market (front square) ------------------ */
  const MX = 0.6, MZ = 6.0;
  b.slab([[MX - 4.1, MZ - 2.3], [MX + 4.1, MZ - 2.3], [MX + 4.1, MZ + 2.4], [MX - 4.1, MZ + 2.4]].map(([x, z]) => {
    const r = Math.hypot(x, z); return r > 10.2 ? [x * 10.2 / r, z * 10.2 / r] : [x, z];
  }), 0.015, { y: 0.12, color: '#7b7e87', mat: M.smooth });
  const bulbs = new Builder();
  const ropes = new Lines();
  const stalls = [];
  for (let i = 0; i < 7; i++) {
    const a = -0.95 + i * 0.32;
    const sx = MX + Math.sin(a) * 3.7, sz = MZ - 0.3 + Math.cos(a) * 2.6 - 0.9;
    stalls.push([sx, sz, a]);
  }
  const awn = [['#c14a3a', '#f3e9d8'], ['#2f6377', '#f3e9d8'], ['#d3a35d', '#8a3a2a'], ['#41613f', '#efe4cf']];
  stalls.forEach(([sx, sz, a], i) => {
    if (Math.hypot(sx, sz) > 9.8) return;
    const ry = a + Math.PI;
    b.push({ x: sx, y: 0.13, z: sz, ry });
    b.box(1.0, 0.42, 0.45, { color: C.wood, mat: M.wood });
    for (const dx of [-0.48, 0.48]) for (const dz of [-0.2, 0.25]) b.cyl(0.025, 0.025, 1.0, { x: dx, z: dz, color: C.darkwood, seg: 4, mat: M.wood });
    const [c1, c2] = awn[i % awn.length];
    for (let k = 0; k < 6; k++) b.box(1.12 / 6, 0.03, 0.72, { x: -0.56 + (k + 0.5) * 1.12 / 6, y: 1.0, z: 0.05, rx: -0.28, color: k % 2 ? c2 : c1, mat: M.cloth });
    // produce: grapes, figs, melons, bread, fish
    const fruit = ['#5b2c5a', '#7a8f3a', '#d9a24a', '#c26a43', '#b8b9c2', '#e4c27a'];
    for (let k = 0; k < 9; k++) b.sphere(0.06 + rng() * 0.04, { x: -0.4 + (k % 5) * 0.2, y: 0.47, z: -0.1 + Math.floor(k / 5) * 0.16 + 0.05, color: rng.pick(fruit), mat: M.smooth, seg: 6 });
    // vendor
    b.cone(0.09, 0.27, { z: -0.4, color: rng.pick(['#7a3b2e', '#3c4f6b', '#6b5a3a']), seg: 6 });
    b.sphere(0.05, { z: -0.4, y: 0.3, color: '#d7b08c', seg: 6 });
    // lantern hanging under the awning
    bulbs.sphere(0.06, { x: 0.0, y: 0.83, z: 0.15, seg: 8, mat: M.glow, color: C.lamp, glow: 1 });
    b.pop();
    // world-space lantern position for the lamp ropes
    stalls[i].top = [sx, 1.17, sz];
  });
  // festoons of bulbs zig-zagging over the square
  const pts = stalls.filter((s) => s.top).map((s) => s.top);
  const poleA = [MX - 3.4, 2.1, MZ + 1.9], poleB = [MX + 3.6, 2.1, MZ + 1.6], poleC = [MX + 0.2, 2.5, MZ - 1.6];
  for (const p of [poleA, poleB, poleC]) {
    b.cyl(0.035, 0.045, p[1], { x: p[0], y: 0.12, z: p[2], color: C.charcoal, mat: M.rough_metal, seg: 6 });
  }
  const festoon = (A, B, sag, n) => {
    ropes.rope(A, B, sag, '#3a3330', 12, 1);
    for (let i = 1; i < n; i++) {
      const t = i / n;
      const x = A[0] + (B[0] - A[0]) * t, y = A[1] + (B[1] - A[1]) * t - sag * 4 * t * (1 - t) - 0.05, z = A[2] + (B[2] - A[2]) * t;
      bulbs.sphere(0.045, { x, y, z, seg: 6, mat: M.glow, color: i % 3 === 0 ? '#ffd9a0' : C.lamp, glow: 1 });
    }
  };
  festoon(poleA, poleC, 0.35, 9);
  festoon(poleC, poleB, 0.35, 9);
  festoon(poleA, poleB, 0.5, 13);
  // tables and diners in the square
  for (let i = 0; i < 5; i++) {
    const x = MX - 2.2 + i * 1.1 + rng.range(-0.2, 0.2), z = MZ + 0.6 + rng.range(-0.4, 0.5);
    b.cyl(0.22, 0.22, 0.03, { x, y: 0.4, z, color: C.ivory, mat: M.smooth, seg: 10 });
    b.cyl(0.03, 0.03, 0.28, { x, y: 0.12, z, color: C.charcoal, seg: 4 });
    b.sphere(0.035, { x: x + 0.05, y: 0.45, z, color: '#7d2f3a', mat: M.glass, seg: 6 });
    for (const s of [-1, 1]) {
      b.cone(0.07, 0.24, { x: x + s * 0.32, y: 0.12, z: z + rng.range(-0.1, 0.1), color: rng.pick(['#6d3b4a', '#33475e', '#8a6a3a', '#5b5b3d', '#c9b7a0']), seg: 6 });
      b.sphere(0.045, { x: x + s * 0.32, y: 0.39, z, color: '#d7b08c', seg: 6 });
    }
  }
  // a fountain basin at the open end of the square, and evening strollers
  b.cyl(0.85, 0.9, 0.25, { x: MX, y: 0.12, z: MZ + 2.7, color: C.ivory, mat: M.smooth, seg: 20 });
  b.cyl(0.75, 0.75, 0.02, { x: MX, y: 0.33, z: MZ + 2.7, color: C.sea, mat: M.water, seg: 20 });
  b.cyl(0.1, 0.14, 0.6, { x: MX, y: 0.3, z: MZ + 2.7, color: C.ivory, mat: M.smooth, seg: 8 });
  b.cyl(0.3, 0.05, 0.08, { x: MX, y: 0.9, z: MZ + 2.7, color: C.ivory, mat: M.smooth, seg: 12 });
  // its god: a bronze figure pouring from an urn
  b.cyl(0.06, 0.1, 0.38, { x: MX, y: 0.98, z: MZ + 2.7, mat: BRONZE_M, color: BRONZE, seg: 8 });
  b.sphere(0.06, { x: MX, y: 1.42, z: MZ + 2.7, mat: BRONZE_M, color: BRONZE, seg: 8 });
  b.sphere(0.08, { x: MX + 0.12, y: 1.28, z: MZ + 2.7, mat: BRONZE_M, color: BRONZE_DARK, seg: 8 });
  for (let i = 0; i < 14; i++) {
    const [dx, dz] = rng.inDisc(3.2, 0.9);
    const x = MX + dx, z = MZ + 1.6 + dz * 0.6;
    if (Math.hypot(x, z) > 9.7) continue;
    b.cone(0.075, 0.26, { x, y: 0.12, z, color: rng.pick(['#6d3b4a', '#33475e', '#8a6a3a', '#efe4cf', '#5b5b3d', accent]), seg: 6 });
    b.sphere(0.047, { x, y: 0.41, z, color: '#d7b08c', seg: 6 });
  }
  // a little brazier with chestnuts
  b.cyl(0.18, 0.12, 0.35, { x: MX + 2.6, y: 0.12, z: MZ + 0.4, color: C.charcoal, mat: M.rough_metal, seg: 8 });
  b.sphere(0.12, { x: MX + 2.6, y: 0.48, z: MZ + 0.4, color: '#ff8a3a', mat: M.glow, glow: 2.2, seg: 6 });

  /* ---------------- the terrace and the woman calling -------------------- */
  const WX = -3.9, WZ = 5.6;
  {
    const ry = 0.55;
    b.push({ x: WX, y: 0.12, z: WZ, ry });
    b.box(1.8, 2.6, 1.5, { color: '#ecd6bb' });
    b.box(1.95, 0.1, 1.65, { y: 2.6, color: C.ivory, mat: M.smooth });
    // balustrade
    for (let i = 0; i <= 12; i++) b.cyl(0.025, 0.03, 0.28, { x: -0.9 + i * 0.15, y: 2.7, z: 0.78, color: C.ivory, mat: M.smooth, seg: 5 });
    b.box(1.85, 0.05, 0.08, { y: 2.98, z: 0.78, color: C.ivory, mat: M.smooth });
    // potted geraniums and a vine-hung pergola
    for (const dx of [-0.75, 0.7]) { b.cyl(0.09, 0.07, 0.15, { x: dx, y: 2.7, z: 0.55, color: C.terracotta, seg: 8 }); b.sphere(0.12, { x: dx, y: 2.92, z: 0.55, color: '#c8414b', mat: M.flat, seg: 5 }); }
    for (const dx of [-0.85, 0.85]) b.cyl(0.03, 0.03, 0.9, { x: dx, y: 2.7, z: -0.6, color: C.darkwood, seg: 4, mat: M.wood });
    b.box(1.8, 0.04, 0.5, { y: 3.6, z: -0.45, color: C.darkleaf, mat: M.flat });
    b.box(0.5, 0.75, 0.04, { y: 2.7, z: -0.74, color: '#3a2a20', mat: M.wood });
    b.quad(0.36, 0.6, { y: 3.04, z: -0.715, color: C.lamp, mat: M.glow, glow: 1.6 });
    // a lit window and door below
    b.quad(0.3, 0.42, { x: -0.45, y: 1.6, z: 0.761, color: C.lamp, mat: M.glow, glow: 2 });
    b.quad(0.3, 0.42, { x: 0.45, y: 1.6, z: 0.761, color: C.lamp, mat: M.glow, glow: 1.4 });
    b.quad(0.4, 0.7, { y: 0.35, z: 0.761, color: '#4d3426', mat: M.wood });
    // the woman: long skirt, shawl
    b.cone(0.12, 0.34, { x: 0.15, y: 2.7, z: 0.45, color: '#f2efe8', seg: 8 });
    b.cyl(0.05, 0.07, 0.12, { x: 0.15, y: 2.97, z: 0.45, color: accent, seg: 8, mat: M.cloth });
    b.sphere(0.055, { x: 0.15, y: 3.12, z: 0.45, color: '#d7b08c', seg: 8 });
    b.sphere(0.05, { x: 0.15, y: 3.15, z: 0.41, color: '#3a2418', seg: 6 });
    // terrace lamp
    b.sphere(0.07, { x: -0.6, y: 3.2, z: 0.2, color: C.lamp, mat: M.glow, glow: 3, seg: 8 });
    b.pop();
  }
  // her arm, waving (animated)
  const arm = new THREE.Group();
  {
    const ab = new Builder();
    ab.rod([0, 0, 0], [0, 0.17, 0], 0.016, { color: '#d7b08c' });
    ab.box(0.09, 0.1, 0.01, { y: 0.17, x: 0.05, color: '#f2efe8', mat: M.cloth }); // handkerchief
    arm.add(ab.build());
    const ry = 0.55, lx = 0.15 + 0.07, lz = 0.45;
    arm.position.set(WX + Math.cos(ry) * lx + Math.sin(ry) * lz, 0.12 + 3.04, WZ - Math.sin(ry) * lx + Math.cos(ry) * lz);
    arm.rotation.y = ry;
    object.add(arm);
  }

  /* ---------------- street lamps being lit along the lead streets -------- */
  for (const a of streetA) {
    for (const rr of [5.2, 8.2]) {
      const off = 0.55;
      const x = Math.cos(a) * rr + Math.sin(a) * off, z = Math.sin(a) * rr - Math.cos(a) * off;
      b.cyl(0.025, 0.035, 1.05, { x, y: 0.12, z, color: C.charcoal, mat: M.rough_metal, seg: 5 });
      b.cyl(0.07, 0.05, 0.1, { x, y: 1.17, z, color: C.charcoal, mat: M.rough_metal, seg: 6 });
      bulbs.sphere(0.06, { x, y: 1.32, z, mat: M.glow, color: C.lamp, glow: 1, seg: 6 });
      b.cone(0.09, 0.1, { x, y: 1.4, z, color: C.charcoal, mat: M.rough_metal, seg: 6 });
    }
  }
  // cypresses and a fig tree near the walls
  for (let i = 0; i < 10; i++) {
    const [x, z] = rng.inDisc(10, 9.2);
    if (!avoid(x, z) && !onStreet(x, z, 0.6)) {
      b.geo(new THREE.SphereGeometry(1, 7, 5), { x, y: 0.12 + 0.75, z, sx: 0.17, sz: 0.17, sy: 0.75, color: C.darkleaf, mat: M.flat });
    }
  }

  const STATIC = b.build();
  object.add(STATIC);
  const bulbMesh = bulbs.build({ shadows: false });
  // lamps that brighten slowly: make their material our own
  const bulbMat = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false, color: new THREE.Color(1, 1, 1) });
  bulbMesh.traverse((m) => { if (m.isMesh) m.material = bulbMat; });
  object.add(bulbMesh);
  const ropeMesh = ropes.build();
  object.add(ropeMesh);

  turnCity(object, [STATIC], 0.45);
  return {
    object,
    update(t) {
      // weathervane: slow swing with the evening breeze; every ~9 s it lifts its head and crows
      rooster.rotation.y = 0.6 + Math.sin(t * 0.23) * 0.9 + Math.sin(t * 0.61) * 0.2;
      const c = (t % 9) / 9;
      const crow = c > 0.82 ? Math.sin((c - 0.82) / 0.18 * Math.PI) : 0;
      rPivot.rotation.z = crow * 0.32 + Math.sin(t * 1.3) * 0.02;
      rPivot.position.y = crow * 0.05;
      // the lamps flicker into life, warm and uneven
      const k = 3.2 + Math.sin(t * 1.7) * 0.18 + Math.sin(t * 4.3) * 0.08;
      bulbMat.color.setRGB(k, k * 0.95, k * 0.9);
      // she waves
      arm.rotation.z = -2.4 + Math.sin(t * 2.4) * 0.35;
    },
  };
}
