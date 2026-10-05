// CLARICE — a glorious city rebuilt from its own fragments, again and again.
// Behind, the ruin of a marble colonnade, re-inhabited: shacks between columns,
// a dovecote on a broken shaft. All around, the pieces of the first splendour put to
// humble use — a Corinthian capital as a chicken coop, frieze slabs as flowerpots,
// column drums as fence posts and house walls. In the piazza, glass cases hold other
// pieces as precious relics. And slowly, over everything, a few fragments lift into
// the air and settle somewhere else: the same pieces, shuffled into a new Clarice.
import { THREE, Builder, M, C, Lines, tree } from '../kit.js';
import { figure } from './_d_kit.js';

const MARBLE = ['#f6eadb', '#efe0cb', '#f3e2d6', '#e8dac6', '#f8efe2'];
const VERDE = '#9fb5a0', PORPHYRY = '#8a4f4a';

/* ---- architectural fragments (local origin at the base centre) ---- */
function capital(b, { x = 0, y = 0, z = 0, s = 1, rx = 0, ry = 0, rz = 0, color = MARBLE[0] } = {}) {
  b.push({ x, y, z, rx, ry, rz, s });
  b.lathe([[0.2, 0], [0.22, 0.04], [0.25, 0.2], [0.32, 0.38], [0.4, 0.48], [0.4, 0.5]], { color, mat: M.smooth, seg: 16 });
  for (let row = 0; row < 2; row++) {
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + row * Math.PI / 8;
      const rr = 0.24 + row * 0.06;
      b.sphere(1, { x: Math.cos(a) * rr, y: 0.1 + row * 0.14, z: Math.sin(a) * rr, sx: 0.06, sy: 0.11, sz: 0.04, ry: -a + Math.PI / 2, rx: -0.35, color, mat: M.flat, seg: 5 });
    }
  }
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    b.torus(0.06, 0.022, { x: Math.cos(a) * 0.4, y: 0.44, z: Math.sin(a) * 0.4, ry: -a, color, mat: M.smooth, tseg: 10, rseg: 4 });
  }
  b.box(0.92, 0.09, 0.92, { y: 0.5, color, mat: M.smooth });
  b.pop();
}
function drum(b, { x = 0, y = 0, z = 0, r = 0.28, h = 0.6, color = MARBLE[1], rx = 0, rz = 0, ry = 0 } = {}) {
  b.cyl(r, r, h, { x, y, z, rx, rz, ry, seg: 14, color, mat: M.flat });
}
function frieze(b, { x = 0, y = 0, z = 0, w = 1.4, h = 0.42, d = 0.22, ry = 0, rx = 0, rz = 0, color = MARBLE[2] } = {}) {
  b.push({ x, y, z, ry, rx, rz });
  b.box(w, h, d, { color, mat: M.smooth });
  b.box(w + 0.04, 0.05, d + 0.04, { y: h, color, mat: M.smooth });
  const n = Math.max(2, Math.round(w / 0.32));
  for (let i = 0; i <= n; i++) {
    const u = -w / 2 + 0.06 + (i / n) * (w - 0.12);
    if (i % 2 === 0) {
      for (let k = -1; k <= 1; k++) b.box(0.025, h * 0.8, 0.03, { x: u + k * 0.035, y: h * 0.1, z: d / 2 + 0.005, color, mat: M.smooth });
    } else {
      b.sphere(0.07, { x: u, y: h * 0.5, z: d / 2, sz: 0.4, color, mat: M.smooth, seg: 7 }); // worn rosette / head
    }
  }
  b.pop();
}
function torso(b, { x = 0, y = 0, z = 0, ry = 0, rz = 0, color = MARBLE[4] } = {}) {
  b.push({ x, y, z, ry, rz });
  b.cyl(0.13, 0.11, 0.38, { color, mat: M.smooth, seg: 10 });
  b.sphere(0.15, { y: 0.4, sx: 1.25, sy: 0.7, sz: 0.8, color, mat: M.smooth, seg: 10 });
  b.cyl(0.05, 0.06, 0.08, { y: 0.48, color, mat: M.smooth, seg: 8 });
  b.pop();
}
function amphora(b, { x = 0, y = 0, z = 0, s = 1, rz = 0, color = C.terracotta } = {}) {
  b.push({ x, y, z, s, rz });
  b.lathe([[0.01, 0], [0.06, 0.02], [0.16, 0.2], [0.17, 0.35], [0.1, 0.5], [0.05, 0.56], [0.06, 0.64]], { color, mat: M.smooth, seg: 12 });
  b.pop();
}

export default function build({ rng, accent }) {
  const b = new Builder();
  const object = new THREE.Group();
  const L = new Lines();

  /* ---------- ground ---------- */
  b.cyl(10.45, 10.45, 0.06, { color: '#b9ab8c', seg: 64 });
  for (let i = 0; i < 30; i++) {
    const [x, z] = rng.inDisc(10, 0);
    b.cyl(rng.range(0.6, 1.4), rng.range(0.7, 1.5), 0.02, { x, y: 0.05, z, color: rng.pick(['#9fa37a', '#a8a07e', '#c5b796']), seg: 9 });
  }
  // the piazza: a mismatched pavement of old slabs
  for (let i = 0; i < 150; i++) {
    const [x, z] = rng.inDisc(3.4, 0);
    b.box(rng.range(0.3, 0.55), 0.04, rng.range(0.3, 0.5), { x: x + 0.6, y: 0.06, z: z + 1.6, ry: rng.range(-0.15, 0.15), color: rng.pick([...MARBLE, '#d8cbb6', VERDE, '#cdbfa8']) });
  }

  /* ---------- the colonnade ruin, re-inhabited ---------- */
  const TZ = -5.2;
  for (let s = 0; s < 3; s++) b.box(10.2 - s * 0.5, 0.22, 2.6 - s * 0.4, { x: -0.8, y: 0.06 + s * 0.22, z: TZ, color: rng.pick(MARBLE), mat: M.smooth });
  const top = 0.06 + 3 * 0.22;
  const colX = [-5.1, -3.7, -2.3, -0.9, 0.5, 1.9, 3.3];
  const colH = [5.0, 2.1, 5.0, 5.0, 3.0, 1.0, 4.2];
  colX.forEach((cx, i) => {
    const h = colH[i];
    b.box(0.72, 0.14, 0.72, { x: cx, y: top, z: TZ, color: MARBLE[0], mat: M.smooth });
    if (i === 6) {
      // a column rebuilt from mismatched drums
      let yy = top + 0.14;
      for (let k = 0; k < 6; k++) { const hh = rng.range(0.5, 0.8); drum(b, { x: cx + rng.range(-0.04, 0.04), y: yy, z: TZ, r: rng.range(0.24, 0.32), h: hh, color: rng.pick([MARBLE[1], VERDE, MARBLE[3], PORPHYRY]) }); yy += hh; }
      capital(b, { x: cx, y: yy, z: TZ, s: 0.75, ry: 0.4, color: '#e6d8c6' });
    } else {
      b.cyl(0.27, 0.31, h, { x: cx, y: top + 0.14, z: TZ, seg: 16, color: MARBLE[1], mat: M.flat });
      if (h >= 4.9) capital(b, { x: cx, y: top + 0.14 + h, z: TZ, s: 0.85, color: MARBLE[0] });
      else b.cone(0.3, 0.25, { x: cx, y: top + 0.14 + h, z: TZ, seg: 7, color: MARBLE[3], mat: M.flat, rz: 0.2 });
    }
  });
  const archY = top + 0.14 + 5.0 + 0.5;
  // surviving entablature over columns 2-3, patched with a timber beam towards column 0
  frieze(b, { x: -1.6, y: archY, z: TZ, w: 1.9, h: 0.55, d: 0.75, color: MARBLE[2] });
  b.box(3.0, 0.22, 0.26, { x: -3.7, y: archY - 0.02, z: TZ, rz: 0.01, color: C.darkwood, mat: M.wood });
  for (const bx of [-4.9, -2.5]) b.box(0.3, 0.3, 0.3, { x: bx, y: archY + 0.2, z: TZ, color: '#6b4a34', mat: M.wood });
  b.geo(new THREE.ExtrudeGeometry(new THREE.Shape([new THREE.Vector2(-1.05, 0), new THREE.Vector2(0.4, 0), new THREE.Vector2(-0.3, 0.55)]), { depth: 0.6, bevelEnabled: false }).translate(0, 0, -0.3), { x: -1.6, y: archY + 0.6, z: TZ, color: MARBLE[0], mat: M.smooth });
  // dovecote on the broken shaft, laundry between columns
  const dcx = colX[4], dcy = top + 0.14 + 3.0 + 0.2;
  b.box(0.6, 0.5, 0.6, { x: dcx, y: dcy, z: TZ, color: '#d8c4a0', mat: M.wood });
  b.cone(0.5, 0.4, { x: dcx, y: dcy + 0.5, z: TZ, seg: 4, ry: Math.PI / 4, color: C.terracotta, mat: M.flat });
  for (let k = 0; k < 3; k++) b.quad(0.1, 0.1, { x: dcx - 0.15 + k * 0.15, y: dcy + 0.3, z: TZ + 0.305, color: '#2b2522', mat: M.smooth });
  L.rope([colX[2], 2.6, TZ + 0.3], [colX[3], 2.6, TZ + 0.3], 0.2, '#ddd2bd');
  for (let k = 0; k < 4; k++) b.quad(0.22, 0.3, { x: colX[2] + 0.25 + k * 0.3, y: 2.25, z: TZ + 0.3, color: rng.pick(['#f4efe6', accent, '#c9a2a0', '#a9bccc']), mat: M.cloth });
  // shacks between the columns: tin roofs, plank walls, a stove pipe
  const shack = (x0, x1, h, col) => {
    const w = x1 - x0 - 0.62, xm = (x0 + x1) / 2;
    b.box(w, h, 1.4, { x: xm, y: top, z: TZ + 0.2, color: col, mat: M.wood });
    b.box(w + 0.3, 0.05, 1.8, { x: xm, y: top + h, z: TZ + 0.3, rx: 0.18, color: rng.pick(['#8c8f93', '#9b6a4f', '#7d8a8c']), mat: M.rough_metal });
    b.box(0.3, 0.55, 0.03, { x: xm - w * 0.2, y: top, z: TZ + 0.91, color: '#4e3a2b', mat: M.wood });
    b.quad(0.22, 0.2, { x: xm + w * 0.22, y: top + h * 0.55, z: TZ + 0.91, color: C.lamp, mat: M.glow, glow: 1.8 });
  };
  shack(colX[0], colX[1], 1.4, '#a88a64');
  shack(colX[4], colX[5], 1.2, '#9c7f5c');
  b.cyl(0.05, 0.05, 1.2, { x: colX[0] + 0.9, y: top + 1.4, z: TZ + 0.1, color: '#4a4a4f', mat: M.rough_metal, seg: 6 });
  // a fallen column lying in pieces on the steps
  for (let k = 0; k < 4; k++) drum(b, { x: 4.8 + k * 0.72, y: 0.36, z: TZ + 1.0 + k * 0.08, r: 0.3, h: 0.66, rz: Math.PI / 2, ry: 0.15 + k * 0.05, color: MARBLE[1] });

  /* ---------- the coop: an upturned Corinthian capital ---------- */
  const cpx = 6.0, cpz = -0.6;
  capital(b, { x: cpx, y: 0.06 + 1.1, z: cpz, s: 2.2, rx: Math.PI, color: '#ece2d2' });
  b.box(0.4, 0.4, 0.04, { x: cpx, y: 0.06, z: cpz + 0.75, color: '#2b2522' }); // dark hatch
  b.box(0.04, 0.5, 0.6, { x: cpx + 0.25, y: 0.06, z: cpz + 1.0, ry: 0.4, color: C.wood, mat: M.wood }); // ramp
  // fence of column drums & poles with wire
  const fence = [];
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2;
    const fx = cpx + Math.cos(a) * 1.9, fz = cpz + 0.4 + Math.sin(a) * 1.6;
    if (Math.hypot(fx, fz) > 9.9) continue;
    if (i % 3 === 0) drum(b, { x: fx, y: 0.06, z: fz, r: 0.16, h: 0.65, color: rng.pick(MARBLE) });
    else b.cyl(0.03, 0.035, 0.6, { x: fx, y: 0.06, z: fz, color: C.darkwood, seg: 5 });
    fence.push([fx, fz]);
  }
  for (let i = 0; i < fence.length; i++) {
    const [ax, az] = fence[i], [bx, bz] = fence[(i + 1) % fence.length];
    if (i === 4) continue; // gate gap
    for (const yy of [0.25, 0.45]) L.seg([ax, yy, az], [bx, yy, bz], '#a8a69e', 1);
  }
  // chickens
  for (let i = 0; i < 9; i++) {
    const [dx, dz] = rng.inDisc(1.3, 0.7);
    const x = cpx + dx, z = cpz + 0.4 + dz, ry = rng.range(0, 6);
    const col = rng.pick(['#f4efe6', '#f4efe6', '#c98a4a', '#5a4a3a']);
    b.sphere(0.09, { x, y: 0.15, z, sx: 1.3, sz: 0.9, ry, color: col, seg: 7 });
    b.sphere(0.05, { x: x + Math.cos(-ry) * 0.1, y: 0.25, z: z + Math.sin(-ry) * 0.1, color: col, seg: 6 });
    b.box(0.02, 0.04, 0.03, { x: x + Math.cos(-ry) * 0.1, y: 0.29, z: z + Math.sin(-ry) * 0.1, color: '#c63a2a' });
  }
  figure(b, { x: cpx - 1.3, y: 0.06, z: cpz + 2.3, ry: 0.8, robe: '#8a6a4a', hat: 'veil', hatColor: '#e9e0d0', arms: ['carry', 'out'] });

  /* ---------- houses of drums, with frieze flowerpots ---------- */
  const drumHouse = (hx, hz, ry, w, d, hgt) => {
    b.push({ x: hx, y: 0.06, z: hz, ry });
    // walls: rows of drums laid on their sides, mortared with rubble
    b.box(w, hgt, d, { color: '#cdbb9c' });
    for (let row = 0; row < Math.floor(hgt / 0.34); row++) {
      for (let k = 0; k < Math.floor(w / 0.42); k++) {
        if (rng.chance(0.5)) drum(b, { x: -w / 2 + 0.24 + k * 0.42, y: 0.17 + row * 0.34, z: d / 2 - 0.02, r: 0.15, h: 0.1, rx: Math.PI / 2, color: rng.pick([...MARBLE, VERDE]) });
      }
    }
    // a pediment as the roof gable, tin roof behind
    b.geo(new THREE.ExtrudeGeometry(new THREE.Shape([new THREE.Vector2(-w / 2 - 0.1, 0), new THREE.Vector2(w / 2 + 0.1, 0), new THREE.Vector2(0, 0.55)]), { depth: 0.18, bevelEnabled: false }), { y: hgt, z: d / 2 - 0.1, color: MARBLE[0], mat: M.smooth });
    b.box(w + 0.2, 0.05, d + 0.1, { y: hgt + 0.25, rx: 0.05, color: '#8c8f93', mat: M.rough_metal });
    b.box(0.34, 0.6, 0.04, { x: -w * 0.18, z: d / 2 + 0.02, color: '#4e3a2b', mat: M.wood });
    b.quad(0.2, 0.2, { x: w * 0.25, y: hgt * 0.6, z: d / 2 + 0.03, color: rng.chance(0.6) ? C.lamp : '#3a3430', mat: M.glow, glow: 1.6 });
    // an arch reused as a porch
    b.box(0.08, 0.7, 0.08, { x: -w * 0.18 - 0.28, z: d / 2 + 0.4, color: MARBLE[3], mat: M.smooth });
    b.box(0.08, 0.7, 0.08, { x: -w * 0.18 + 0.28, z: d / 2 + 0.4, color: MARBLE[3], mat: M.smooth });
    b.geo(new THREE.TorusGeometry(0.28, 0.05, 5, 10, Math.PI), { x: -w * 0.18, y: 0.7, z: d / 2 + 0.4, color: MARBLE[3], mat: M.smooth });
    b.pop();
  };
  drumHouse(-5.6, 0.2, 0.9, 1.9, 1.5, 1.5);
  drumHouse(-4.0, 3.6, 0.5, 1.6, 1.3, 1.3);
  drumHouse(-6.9, -2.6, 1.2, 1.4, 1.2, 1.2);
  drumHouse(3.2, 5.6, -0.5, 1.6, 1.3, 1.25);
  drumHouse(-1.4, 6.6, 0.05, 1.5, 1.2, 1.3);
  // frieze slabs as flowerpots, overflowing
  const pots = [[-3.2, 1.6, 0.6], [-2.4, 4.9, 0.3], [1.5, 7.2, -0.2], [4.9, 3.8, -0.9], [-6.2, 2.1, 1.1], [3.4, -2.2, 0.2]];
  for (const [px, pz, pry] of pots) {
    b.push({ x: px, y: 0.06, z: pz, ry: pry });
    frieze(b, { z: 0.22, w: 1.2, h: 0.36, d: 0.12, color: rng.pick(MARBLE) });
    frieze(b, { z: -0.22, w: 1.2, h: 0.36, d: 0.12, ry: Math.PI, color: rng.pick(MARBLE) });
    b.box(0.1, 0.36, 0.34, { x: -0.6, color: MARBLE[3], mat: M.smooth });
    b.box(0.1, 0.36, 0.34, { x: 0.6, color: MARBLE[3], mat: M.smooth });
    b.box(1.1, 0.04, 0.32, { y: 0.34, color: '#5c4636' });
    for (let k = 0; k < 7; k++) {
      const fx = rng.range(-0.5, 0.5), fz = rng.range(-0.1, 0.1);
      b.sphere(rng.range(0.08, 0.13), { x: fx, y: 0.42, z: fz, color: rng.pick(['#6f9a58', '#5d8a4c', '#88a86a']), mat: M.flat, seg: 5 });
      if (rng.chance(0.7)) b.sphere(0.04, { x: fx + 0.03, y: 0.52, z: fz, color: rng.pick(['#e45a6a', '#f2d06b', '#f4f0e6', '#d07ad0', accent]), seg: 4 });
    }
    b.pop();
  }
  // odd reuses scattered: a capital as a table, a torso as a doorstop, amphorae as water butts, a column as a well-sweep post
  capital(b, { x: -2.6, y: 0.06, z: 2.7, s: 0.8, color: MARBLE[4] });
  b.cyl(0.05, 0.05, 0.05, { x: -2.55, y: 0.5, z: 2.65, color: '#e8e2d0', mat: M.smooth, seg: 6 });
  for (const [sx, sz] of [[-3.1, 2.4], [-2.1, 3.0], [-2.9, 3.2]]) drum(b, { x: sx, y: 0.06, z: sz, r: 0.13, h: 0.28, color: rng.pick(MARBLE) });
  torso(b, { x: -5.0, y: 0.06, z: 1.25, ry: 0.4, rz: 0.3 });
  amphora(b, { x: -4.4, y: 0.06, z: 4.4, s: 1.3 });
  amphora(b, { x: 2.5, y: 0.06, z: 6.2, s: 1.1, color: '#b8654a' });
  amphora(b, { x: 4.8, y: 0.16, z: -3.7, s: 1.0, rz: 1.4, color: '#c47a55' });
  drum(b, { x: 6.8, y: 0.06, z: 3.0, r: 0.2, h: 1.6, color: VERDE });
  b.rod([6.8, 1.66, 3.0], [5.8, 2.4, 2.3], 0.03, { color: C.darkwood });
  b.cyl(0.45, 0.5, 0.35, { x: 5.6, y: 0.06, z: 2.2, color: MARBLE[2], mat: M.smooth, seg: 14 });
  // trees: olive and fig
  for (const [tx, tz] of [[-7.6, 3.6], [7.4, -3.2], [-3.2, -3.0], [6.2, 5.6], [-8.6, -0.8]]) tree(b, { x: tx, y: 0.06, z: tz, h: rng.range(1.4, 2.0), kind: 'round', color: '#7f9465', r: rng });
  for (const [tx, tz] of [[-8.0, -4.6], [8.6, 1.0]]) tree(b, { x: tx, y: 0.06, z: tz, h: 2.6, kind: 'cypress', r: rng });

  /* ---------- the relics in glass cases ---------- */
  const cases = [[-0.9, 1.0, 0.25], [0.6, 0.2, 0], [2.1, 1.0, -0.25], [-0.3, 2.9, 0.15], [1.6, 2.9, -0.15]];
  const glass = new Builder();
  cases.forEach(([vx, vz, vry], i) => {
    b.push({ x: vx, y: 0.1, z: vz, ry: vry });
    b.box(0.95, 0.55, 0.95, { color: '#5b3d2c', mat: M.wood });
    b.box(1.0, 0.05, 1.0, { y: 0.55, color: '#b8924e', mat: M.smooth });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box(0.035, 0.95, 0.035, { x: sx * 0.45, y: 0.6, z: sz * 0.45, color: '#b8924e', mat: M.smooth });
    b.box(0.95, 0.04, 0.95, { y: 1.55, color: '#b8924e', mat: M.smooth });
    b.box(0.6, 0.06, 0.6, { y: 0.6, color: '#7a2f3a', mat: M.cloth }); // velvet
    // the relic: each case holds a piece no different from those in the coop and the pots
    if (i === 0) capital(b, { y: 0.66, s: 0.55, color: MARBLE[0] });
    if (i === 1) frieze(b, { y: 0.66, w: 0.7, h: 0.3, d: 0.12, color: MARBLE[2] });
    if (i === 2) torso(b, { y: 0.66, color: MARBLE[4] });
    if (i === 3) amphora(b, { y: 0.66, s: 1.1, color: '#c8714c' });
    if (i === 4) drum(b, { y: 0.66, r: 0.2, h: 0.5, color: VERDE });
    b.box(0.25, 0.03, 0.01, { y: 0.4, z: 0.481, color: '#e9dfc6', mat: M.smooth }); // label plate
    b.pop();
    glass.box(0.9, 0.95, 0.9, { x: vx, y: 0.7, z: vz, ry: vry, color: '#dff2f0', mat: M.glass });
  });
  // visitors and a custodian
  figure(b, { x: 0.0, y: 0.1, z: 4.3, ry: Math.PI + 0.3, robe: '#5d6d8a', hat: 'brim', hatColor: '#3a3330', arms: ['back', 'back'] });
  figure(b, { x: 2.9, y: 0.1, z: 2.0, ry: -1.4, robe: '#a0524a', hat: 'veil', hatColor: '#e9e0d0', arms: ['point', 'down'] });
  figure(b, { x: -1.9, y: 0.1, z: 0.1, ry: 1.0, robe: '#34343a', hat: 'cap', hatColor: '#34343a', arms: ['down', 'down'] });
  figure(b, { x: 1.2, y: 0.1, z: 1.7, ry: 2.6, h: 0.24, robe: '#d9b45a', arms: ['up', 'down'] });

  object.add(b.build());
  object.add(glass.build({ shadows: false }));
  object.add(L.build());

  /* ---------- the shuffle: fragments that lift and settle elsewhere ---------- */
  // slots: places where a fragment can rest (ground spots, broken column tops, a wall top)
  const slots = [
    [colX[1], top + 0.14 + 2.1 + 0.25, TZ], // on the broken column
    [colX[5], top + 0.14 + 1.0 + 0.25, TZ],
    [-0.9, 0.08, 4.9], [2.8, 0.08, 4.0], [4.2, 0.08, 1.4], [-2.9, 0.08, -1.2], [0.4, 0.08, -1.9],
    [-6.6, 0.08, 5.3], [5.6, 0.08, 7.0], [-7.4, 0.08, 1.6],
  ];
  const makers = [
    (g) => capital(g, { s: 0.7, color: MARBLE[0] }),
    (g) => drum(g, { r: 0.28, h: 0.62, color: MARBLE[1] }),
    (g) => frieze(g, { w: 1.1, h: 0.36, d: 0.24, color: MARBLE[2] }),
    (g) => drum(g, { r: 0.26, h: 0.5, color: VERDE }),
    (g) => torso(g, { color: MARBLE[4] }),
    (g) => capital(g, { s: 0.6, rx: 0, color: '#e8d7cc' }),
    (g) => { drum(g, { r: 0.3, h: 0.4, color: PORPHYRY }); },
    (g) => frieze(g, { w: 0.8, h: 0.4, d: 0.2, color: MARBLE[3] }),
  ];
  const frags = makers.map((mk) => {
    const fb = new Builder();
    mk(fb);
    const g = new THREE.Group();
    const inner = fb.build();
    inner.scale.setScalar(1.3);
    g.add(inner);
    object.add(g);
    return g;
  });
  // initial assignment
  const occ = slots.map(() => -1);
  const at = frags.map((_, i) => i);
  frags.forEach((g, i) => { occ[i] = i; g.position.set(...slots[i]); g.rotation.y = rng.range(0, 6); });
  const order = [];
  for (let k = 0; k < 64; k++) order.push(rng());
  const STEP = 4.0, FLY = 3.6;
  let curStep = -1, mover = -1, from = 0, to = 0, ry0 = 0, ry1 = 0;
  const A = new THREE.Vector3(), B = new THREE.Vector3();
  const nextMove = (k) => {
    // move a fragment into the empty slot (the one nobody occupies)
    const empty = occ.findIndex((o) => o === -1) >= 0 ? occ.map((o, i) => (o === -1 ? i : -1)).filter((i) => i >= 0) : [];
    const dest = empty[Math.floor(order[k % 64] * empty.length)];
    const f = Math.floor(order[(k * 7 + 3) % 64] * frags.length);
    mover = f; from = at[f]; to = dest;
    occ[from] = -1; occ[to] = f; at[f] = to;
    ry0 = frags[f].rotation.y; ry1 = ry0 + (order[(k + 5) % 64] - 0.5) * 3;
  };
  return {
    object,
    update(t) {
      const k = Math.floor(t / STEP);
      if (k !== curStep) {
        if (mover >= 0) frags[mover].position.set(...slots[to]);
        curStep = k;
        nextMove(k);
      }
      const u = Math.min(1, (t - k * STEP) / FLY);
      const e = u * u * (3 - 2 * u);
      A.set(...slots[from]); B.set(...slots[to]);
      const g = frags[mover];
      g.position.lerpVectors(A, B, e);
      g.position.y += Math.sin(Math.PI * e) * (4.0 + 0.35 * A.distanceTo(B));
      g.rotation.y = ry0 + (ry1 - ry0) * e;
      g.rotation.z = Math.sin(Math.PI * e) * 0.5;
      // the others breathe very slightly, as if the city were thinking about moving them
      for (let i = 0; i < frags.length; i++) if (i !== mover) frags[i].position.y = slots[at[i]][1] + 0.0;
    },
  };
}
