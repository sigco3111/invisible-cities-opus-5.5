// Zemrude — the city takes the shape of your mood. Nose in the air, you know the upper
// Zemrude: a bright horseshoe of windowsills, fluttering curtains, balconies, fountains
// and light. Gaze lowered, you know the lower one, sunk in the middle: gutters and drains,
// manhole covers, fish scales and waste paper, damp walls weeping from their pipes.
// Stairs connect them, and almost everyone on them is going down.
import { THREE, Builder, M, C, person } from '../kit.js';
import { _o, _col } from './_c_util.js';

const UP = 3.2; // height of the upper city
const RI = 4.7; // inner radius of the horseshoe (edge of the drop)
const GAP = 0.78; // half-angle of the opening toward the front (+z)
const FRONT = Math.PI / 2;

export default function build({ rng, accent }) {
  const b = new Builder();
  const G = 0.12;
  const object = new THREE.Group();

  // ---------------------------------------------------------------- the lower floor: cobbles, gutters, drains
  b.cyl(10.3, 10.4, G, { color: '#5b5f5a', seg: 64 });
  // cobble pattern: many tiny dull stones
  for (let i = 0; i < 260; i++) {
    const [x, z] = rng.inDisc(RI + 0.1);
    b.box(rng.range(0.12, 0.2), 0.02, rng.range(0.1, 0.16), { x, y: G, z, ry: rng() * 3, color: rng.pick(['#53574f', '#62665e', '#4a4e48', '#6a6b62']) });
  }
  // gutters: dark wet channels spiralling into a great central drain
  for (let k = 0; k < 5; k++) {
    const pts = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const a = k * Math.PI * 2 / 5 + t * 1.6;
      const r = RI - 0.2 - t * (RI - 0.9);
      pts.push([Math.cos(a) * r, G + 0.022, Math.sin(a) * r]);
    }
    for (let i = 0; i < pts.length - 1; i++) {
      b.beam(pts[i], pts[i + 1], 0.001, { color: '#2a2f2e' });
      const [x0, , z0] = pts[i], [x1, , z1] = pts[i + 1];
      b.box(0.16, 0.012, Math.hypot(x1 - x0, z1 - z0) + 0.02, { x: (x0 + x1) / 2, y: G + 0.01, z: (z0 + z1) / 2, ry: Math.atan2(x1 - x0, z1 - z0), color: '#2b3433', mat: M.smooth });
      b.box(0.04, 0.03, Math.hypot(x1 - x0, z1 - z0) + 0.02, { x: (x0 + x1) / 2 + Math.cos(Math.atan2(x1 - x0, z1 - z0)) * 0.1, y: G, z: (z0 + z1) / 2 - Math.sin(Math.atan2(x1 - x0, z1 - z0)) * 0.1, ry: Math.atan2(x1 - x0, z1 - z0), color: '#7a7a70' });
    }
  }
  // central drain: round iron grate
  b.cyl(0.85, 0.85, 0.02, { y: G, color: '#2c2c2c', mat: M.rough_metal, seg: 28 });
  for (let i = 0; i < 9; i++) b.box(1.5 - Math.abs(i - 4) * 0.25, 0.03, 0.05, { y: G + 0.015, z: (i - 4) * 0.17, color: '#4a4844', mat: M.rough_metal });
  b.torus(0.85, 0.05, { y: G + 0.02, rx: Math.PI / 2, color: '#4a4844', mat: M.rough_metal, tseg: 40 });
  // manhole covers
  for (let i = 0; i < 9; i++) {
    const [x, z] = rng.inDisc(RI - 0.4, 1.4);
    b.cyl(0.22, 0.22, 0.02, { x, y: G, z, color: '#3d3b38', mat: M.rough_metal, seg: 18 });
    b.torus(0.15, 0.012, { x, y: G + 0.022, z, rx: Math.PI / 2, color: '#57534c', mat: M.rough_metal, tseg: 20 });
    b.box(0.3, 0.012, 0.02, { x, y: G + 0.022, z, ry: rng() * 3, color: '#57534c', mat: M.rough_metal });
  }
  // puddles
  for (let i = 0; i < 12; i++) {
    const [x, z] = rng.inDisc(RI - 0.3, 1.0);
    b.cyl(rng.range(0.2, 0.5), rng.range(0.2, 0.5), 0.012, { x, y: G, z, sz: rng.range(0.5, 1), color: '#30414a', mat: M.smooth, seg: 14 });
  }
  // waste paper and fish scales
  for (let i = 0; i < 70; i++) {
    const [x, z] = rng.inDisc(RI - 0.2, 0.9);
    if (rng.chance(0.55)) b.box(rng.range(0.08, 0.16), 0.006, rng.range(0.1, 0.2), { x, y: G + 0.012, z, ry: rng() * 6, rx: rng.range(-0.15, 0.15), color: rng.pick(['#e8e2d2', '#d8cfb4', '#c9c3b0', '#efe9dc']) });
    else b.cyl(0.02, 0.02, 0.004, { x, y: G + 0.012, z, color: C.silver, mat: M.metal, seg: 6 });
  }
  // the fishmonger's crate and a heap of rubbish by the wall
  for (const [x, z] of [[-1.6, 3.2], [2.6, -2.9]]) {
    b.box(0.5, 0.18, 0.34, { x, y: G, z, ry: 0.4, color: '#5a4a3a', mat: M.wood });
    for (let k = 0; k < 4; k++) b.geo(new THREE.SphereGeometry(0.06, 6, 4), { x: x + (k - 1.5) * 0.1, y: G + 0.2, z, sx: 2.2, sy: 0.6, ry: 0.4, color: C.silver, mat: M.metal });
  }
  for (let k = 0; k < 14; k++) {
    const a = rng.range(3.6, 4.4), r = rng.range(3.6, 4.4);
    b.box(rng.range(0.1, 0.25), rng.range(0.06, 0.18), rng.range(0.1, 0.25), { x: Math.cos(a) * r, y: G, z: Math.sin(a) * r, ry: rng() * 6, rz: rng.range(-0.4, 0.4), color: rng.pick(['#5a4a3a', '#6b6a5e', '#8a7a5a', '#3e4a46', '#7a6a58']) });
  }

  // ---------------------------------------------------------------- the horseshoe block of the upper city
  const a0 = FRONT + GAP, a1 = FRONT - GAP + Math.PI * 2;
  const shape = [];
  for (let i = 0; i <= 64; i++) { const a = a0 + (a1 - a0) * i / 64; shape.push([Math.cos(a) * 10.3, Math.sin(a) * 10.3]); }
  for (let i = 64; i >= 0; i--) { const a = a0 + (a1 - a0) * i / 64; shape.push([Math.cos(a) * RI, Math.sin(a) * RI]); }
  // the slab helper flips z, so give it mirrored z
  b.slab(shape.map(([x, z]) => [x, z]), UP - G, { y: G, color: '#8c877b' });
  // a pale paved top for the upper city
  b.slab(shape.map(([x, z]) => [x, z]), 0.04, { y: UP, color: '#efe6d4' });
  const angOK = (a) => { let d = Math.atan2(Math.sin(a - FRONT), Math.cos(a - FRONT)); return Math.abs(d) > GAP + 0.05; };
  // the damp inner wall: moss streaks, drainpipes, arched cellar doors
  const drips = [];
  for (let i = 0; i < 48; i++) {
    const a = a0 + (a1 - a0) * (i + 0.5) / 48;
    const x = Math.cos(a) * (RI - 0.01), z = Math.sin(a) * (RI - 0.01);
    const ry = Math.atan2(-Math.cos(a), -Math.sin(a));
    if (i % 2 === 0) b.quad(0.18, rng.range(0.8, 2.4), { x: x - Math.cos(a) * 0.002, y: G + rng.range(0.5, 1.2), z: z - Math.sin(a) * 0.002, ry, color: rng.pick(['#5d6b52', '#6a6f5c', '#4f5a4a']) });
    if (i % 5 === 1) {
      b.box(0.36, 0.55, 0.02, { x: x - Math.cos(a) * 0.01, y: G, z: z - Math.sin(a) * 0.01, ry, color: '#26241f' });
      b.cyl(0.18, 0.18, 0.02, { x: x - Math.cos(a) * 0.01, y: G + 0.55, z: z - Math.sin(a) * 0.01, ry, rx: Math.PI / 2, color: '#26241f', seg: 10, thetaStart: -Math.PI / 2, thetaLength: Math.PI });
    }
    if (i % 4 === 3) {
      // a drainpipe from the gutters above, weeping into the lower city
      const px = x - Math.cos(a) * 0.08, pz = z - Math.sin(a) * 0.08;
      b.cyl(0.04, 0.04, UP - 0.5, { x: px, y: 0.5, z: pz, color: '#5a5f5c', mat: M.rough_metal, seg: 6 });
      b.rod([px, 0.5, pz], [px - Math.cos(a) * 0.2, 0.32, pz - Math.sin(a) * 0.2], 0.04, { color: '#5a5f5c', mat: M.rough_metal });
      b.cyl(0.2, 0.2, 0.012, { x: px - Math.cos(a) * 0.25, y: G, z: pz - Math.sin(a) * 0.25, color: '#30414a', mat: M.smooth, seg: 12 });
      drips.push([px - Math.cos(a) * 0.22, 0.3, pz - Math.sin(a) * 0.22]);
    }
  }
  // the lower town's own crouching houses against the wall
  for (let i = 0; i < 9; i++) {
    const a = a0 + 0.3 + (a1 - a0 - 0.6) * (i / 8);
    const r = RI - 0.55;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    const ry = Math.atan2(-Math.cos(a), -Math.sin(a));
    const h = rng.range(0.7, 1.2);
    b.push({ x, y: G, z, ry });
    b.box(0.85, h, 0.7, { color: rng.pick(['#6e6a60', '#5f655f', '#76705f', '#666258']) });
    b.box(0.95, 0.06, 0.8, { y: h, rx: 0.12, color: '#4a4a46' });
    b.box(0.2, 0.42, 0.02, { z: 0.355, color: '#2a2622' });
    const lit = i % 4 === 0;
    b.quad(0.12, 0.12, { x: 0.25, y: h * 0.6, z: 0.358, mat: lit ? M.glow : M.smooth, color: lit ? '#c9a46a' : '#2a2622', glow: 1.0 });
    b.pop();
  }
  // the outer face of the upper city's block: rustication, cornice, blind arches
  for (let i = 0; i < 40; i++) {
    const a = a0 + 0.05 + (a1 - a0 - 0.1) * (i + 0.5) / 40;
    const x = Math.cos(a) * 10.31, z = Math.sin(a) * 10.31;
    const ry = Math.atan2(Math.cos(a), Math.sin(a));
    b.box(0.5, 1.3, 0.04, { x, y: G + 0.3, z, ry, color: '#77736a' });
    b.cyl(0.25, 0.25, 0.04, { x, y: G + 1.6, z, ry, rx: Math.PI / 2, color: '#77736a', seg: 10, thetaStart: -Math.PI / 2, thetaLength: Math.PI });
    b.box(0.12, UP - G, 0.06, { x: Math.cos(a + (a1 - a0) / 80) * 10.32, y: G, z: Math.sin(a + (a1 - a0) / 80) * 10.32, ry, color: '#9a958a' });
    if (i % 3 === 1) {
      const lit = i % 2 === 0;
      b.box(0.16, 0.22, 0.03, { x, y: G + 0.8, z, ry, mat: lit ? M.glow : M.smooth, color: lit ? '#a89060' : '#2a2622', glow: 0.8 });
    }
  }
  b.cyl(10.36, 10.36, 0.12, { y: UP - 0.1, color: '#c8c2b4', seg: 80, open: true, thetaStart: Math.PI / 2 - a1, thetaLength: a1 - a0 });
  b.cyl(10.36, 10.36, 0.06, { y: G + 2.0, color: '#a8a296', seg: 80, open: true, thetaStart: Math.PI / 2 - a1, thetaLength: a1 - a0 });
  // dim green lamps of the lower city
  for (const [x, z] of [[-2.2, -1.2], [0.6, -3.0], [-2.8, 2.2]]) {
    b.cyl(0.02, 0.025, 0.9, { x, y: G, z, color: '#2c2c2c', seg: 5 });
    b.sphere(0.05, { x, y: G + 0.93, z, mat: M.glow, color: '#a8c89a', glow: 1.1, seg: 6 });
  }
  // the lower city spills out through the opening: a gutter to the rim, stalls, rubbish
  const gapSpot = () => { for (;;) { const a = FRONT + rng.range(-GAP + 0.12, GAP - 0.12); const r = rng.range(RI, 9.8); return [Math.cos(a) * r, Math.sin(a) * r]; } };
  b.box(0.22, 0.014, 5.4, { x: 0.3, y: G + 0.008, z: 7.4, ry: 0.06, color: '#2b3433', mat: M.smooth });
  b.box(0.05, 0.03, 5.4, { x: 0.45, y: G, z: 7.4, ry: 0.06, color: '#7a7a70' });
  b.box(0.05, 0.03, 5.4, { x: 0.15, y: G, z: 7.4, ry: 0.06, color: '#7a7a70' });
  b.box(0.5, 0.03, 0.4, { x: 0.62, y: G + 0.01, z: 10.0, ry: 0.06, color: '#3a3836', mat: M.rough_metal });
  for (let i = 0; i < 60; i++) {
    const [x, z] = gapSpot();
    if (rng.chance(0.6)) b.box(rng.range(0.08, 0.16), 0.006, rng.range(0.1, 0.2), { x, y: G + 0.012, z, ry: rng() * 6, color: rng.pick(['#e8e2d2', '#d8cfb4', '#c9c3b0']) });
    else b.cyl(0.02, 0.02, 0.004, { x, y: G + 0.012, z, color: C.silver, mat: M.metal, seg: 6 });
  }
  for (let i = 0; i < 6; i++) {
    const [x, z] = gapSpot();
    b.cyl(rng.range(0.25, 0.5), rng.range(0.25, 0.5), 0.012, { x, y: G, z, sz: rng.range(0.5, 1), color: '#30414a', mat: M.smooth, seg: 14 });
  }
  for (const [x, z] of [[-1.4, 6.0], [1.6, 6.6], [-0.6, 8.4]]) {
    const ry = rng.range(-0.3, 0.3);
    b.push({ x, y: G, z, ry });
    for (const [px, pz] of [[-0.4, -0.25], [0.4, -0.25], [-0.4, 0.25], [0.4, 0.25]]) b.cyl(0.02, 0.02, 0.7, { x: px, z: pz, color: '#3a3430', seg: 4 });
    b.box(0.95, 0.015, 0.6, { y: 0.7, rx: 0.1, rz: 0.06, color: rng.pick(['#6a6a5a', '#7a6a5a', '#5a6460']), mat: M.cloth });
    b.box(0.8, 0.04, 0.4, { y: 0.32, color: '#4a3a2e', mat: M.wood });
    for (let k = 0; k < 4; k++) b.geo(new THREE.SphereGeometry(0.05, 6, 4), { x: -0.27 + k * 0.18, y: 0.38, sx: 2, sy: 0.6, color: C.silver, mat: M.metal });
    b.pop();
  }
  for (let i = 0; i < 12; i++) {
    const [x, z] = gapSpot();
    person(b, { x, y: G, z, h: 0.32, color: rng.pick(['#3c3a46', '#4a4a44', '#5a4a40', '#3e4a4e', '#6a5e52']) });
  }
  // a weak gas lamp in the lower square
  b.cyl(0.02, 0.025, 1.0, { x: 1.4, y: G, z: 1.0, color: '#2c2c2c', seg: 5 });
  b.sphere(0.05, { x: 1.4, y: G + 1.03, z: 1.0, mat: M.glow, color: '#d7c48a', glow: 1.2, seg: 6 });

  // ---------------------------------------------------------------- the upper city: windowsills, balconies, curtains, light
  const curtains = [];
  const walls = ['#fbf3e4', '#f5e6c8', '#f2dccf', '#fff6e8', '#f0e2c0', '#e9eef0', '#f7e1d0'];
  const shutters = ['#7fb0c8', '#9cc3a0', '#e0a0a0', '#c8b070'];
  const placed = [];
  for (let ring = 0; ring < 2; ring++) {
    const r = ring === 0 ? 6.6 : 8.9;
    const n = ring === 0 ? 16 : 22;
    for (let i = 0; i < n; i++) {
      const a = a0 + 0.12 + (a1 - a0 - 0.24) * (i + 0.5) / n + rng.range(-0.03, 0.03);
      if (!angOK(a)) continue;
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      const ry = Math.atan2(-x, -z);
      const w = (2 * Math.PI * r / n) * (ring === 0 ? 0.62 : 0.68);
      const h = ring === 0 ? rng.range(1.3, 2.0) : rng.range(1.8, 2.8);
      const d = 1.1;
      const wall = rng.pick(walls);
      const sh = rng.pick(shutters);
      b.push({ x, y: UP + 0.04, z, ry });
      b.box(w, h, d, { color: wall });
      b.box(w + 0.08, 0.08, d + 0.08, { y: h, color: '#ffffff' });
      b.geo(new THREE.CylinderGeometry(0.0001, 0.72, 1, 4, 1).rotateY(Math.PI / 4).translate(0, 0.5, 0), { y: h + 0.06, sx: w + 0.1, sz: d + 0.1, sy: 0.32, color: rng.pick(['#d0704a', '#c46a50', '#dd8a5a']), mat: M.flat });
      // facade toward the light (local +z): tall windows with sills, shutters, curtains
      const floors = Math.floor((h - 0.25) / 0.6);
      const cols = Math.max(2, Math.round(w / 0.42));
      for (let f = 0; f < floors; f++) {
        const wy = 0.4 + f * 0.6;
        for (let c = 0; c < cols; c++) {
          const u = -w / 2 + (c + 0.5) * w / cols;
          const lit = rng.chance(0.55);
          b.quad(0.15, 0.3, { x: u, y: wy, z: d / 2 + 0.006, mat: lit ? M.glow : M.smooth, color: lit ? C.lamp : '#4a4038', glow: 2.0 });
          b.box(0.22, 0.03, 0.07, { x: u, y: wy - 0.17, z: d / 2 + 0.03, color: '#ffffff' }); // windowsill
          b.quad(0.07, 0.3, { x: u - 0.115, y: wy, z: d / 2 + 0.008, ry: 0.5, color: sh });
          b.quad(0.07, 0.3, { x: u + 0.115, y: wy, z: d / 2 + 0.008, ry: -0.5, color: sh });
          // flower box
          if (rng.chance(0.35)) for (let k = 0; k < 3; k++) b.sphere(0.03, { x: u - 0.06 + k * 0.06, y: wy - 0.13, z: d / 2 + 0.05, color: rng.pick(['#e05a6a', '#f0a0b0', '#ffd060', accent]), seg: 5 });
          // an open window: its curtain flutters out
          if (lit && rng.chance(0.4)) {
            const lp = new THREE.Vector3(u, wy + 0.15, d / 2 + 0.03).applyAxisAngle(new THREE.Vector3(0, 1, 0), ry);
            curtains.push({ x: x + lp.x, y: UP + 0.04 + lp.y, z: z + lp.z, ry, ph: rng.range(0, 6), col: rng.pick(['#ffffff', '#fbe3e8', '#e3f0ff', '#fff2c8']) });
          }
        }
        // a balcony on the first floor
        if (f === 1 && rng.chance(0.6)) {
          b.box(w * 0.6, 0.04, 0.3, { y: wy - 0.2, z: d / 2 + 0.15, color: '#ffffff' });
          for (let k = 0; k <= 6; k++) b.box(0.015, 0.2, 0.015, { x: -w * 0.3 + k * w * 0.1, y: wy - 0.18, z: d / 2 + 0.29, color: '#5a5a5a', mat: M.metal });
          b.box(w * 0.6, 0.02, 0.02, { y: wy + 0.02, z: d / 2 + 0.29, color: '#5a5a5a', mat: M.metal });
          person(b, { x: rng.range(-w * 0.2, w * 0.2), y: wy - 0.16, z: d / 2 + 0.16, h: 0.3, color: rng.pick(['#e8e0d0', '#7fb0c8', '#e0a0a0']) });
        }
      }
      // the back (outer) face: plainer windows
      for (let f = 0; f < floors; f++) for (let c = 0; c < cols; c++) {
        const u = -w / 2 + (c + 0.5) * w / cols;
        const lit = rng.chance(0.3);
        b.quad(0.13, 0.24, { x: u, y: 0.4 + f * 0.6, z: -d / 2 - 0.006, ry: Math.PI, mat: lit ? M.glow : M.smooth, color: lit ? C.lamp : '#4a4038', glow: 1.6 });
        b.box(0.18, 0.025, 0.05, { x: u, y: 0.4 + f * 0.6 - 0.14, z: -d / 2 - 0.02, color: '#ffffff' });
      }
      b.pop();
      placed.push({ x, z });
    }
  }
  // the balustrade along the drop, with lamps
  for (let i = 0; i < 70; i++) {
    const a = a0 + (a1 - a0) * (i + 0.5) / 70;
    const x = Math.cos(a) * (RI + 0.12), z = Math.sin(a) * (RI + 0.12);
    b.cyl(0.02, 0.03, 0.22, { x, y: UP + 0.04, z, color: '#ffffff', seg: 5 });
    if (i % 7 === 3) {
      b.cyl(0.015, 0.02, 0.7, { x, y: UP + 0.04, z, color: '#4a4a4a', seg: 5 });
      b.sphere(0.06, { x, y: UP + 0.78, z, mat: M.glow, color: C.lamp, glow: 2.4, seg: 8 });
    }
  }
  for (let i = 0; i < 69; i++) {
    const am = a0 + (a1 - a0) * (i + 1) / 70;
    b.box(2 * (RI + 0.12) * Math.sin((a1 - a0) / 140) + 0.02, 0.03, 0.06, { x: Math.cos(am) * (RI + 0.12), y: UP + 0.26, z: Math.sin(am) * (RI + 0.12), ry: -am + Math.PI / 2, color: '#ffffff' });
  }
  // fountains in the little squares of the upper city
  const fountains = [];
  for (const a of [Math.PI * 1.0, Math.PI * 1.5, Math.PI * 2.0 + 0.0]) {
    const x = Math.cos(a) * 5.55, z = Math.sin(a) * 5.55;
    b.cyl(0.42, 0.46, 0.2, { x, y: UP + 0.04, z, color: '#ffffff', mat: M.smooth, seg: 20 });
    b.cyl(0.36, 0.36, 0.01, { x, y: UP + 0.22, z, color: '#7fc4dc', mat: M.smooth, seg: 20 });
    b.cyl(0.05, 0.07, 0.45, { x, y: UP + 0.22, z, color: '#ffffff', mat: M.smooth, seg: 8 });
    b.cyl(0.16, 0.06, 0.06, { x, y: UP + 0.62, z, color: '#ffffff', mat: M.smooth, seg: 12 });
    fountains.push([x, UP + 0.7, z]);
  }
  // whistlers strolling nose in the air
  for (let i = 0; i < 10; i++) {
    const a = rng.range(a0 + 0.2, a1 - 0.2);
    const r = rng.range(5.1, 5.9);
    person(b, { x: Math.cos(a) * r, y: UP + 0.04, z: Math.sin(a) * r, h: 0.32, color: rng.pick(['#e8e0d0', '#7fb0c8', '#e0a0a0', '#f0d080', accent]) });
  }
  // pennants on strings across the upper streets
  // ---------------------------------------------------------------- stairs going down
  const stairPaths = [];
  const stairAngles = [Math.PI * 0.95, Math.PI * 1.33, Math.PI * 1.72, Math.PI * 2.1];
  const steps = 15;
  for (const a of stairAngles) {
    const run = (UP - G) / steps;
    const ca = Math.cos(a), sa = Math.sin(a);
    // the flight goes from the edge inward and down, along the wall (tangential), then turns
    const tx = -sa, tz = ca; // tangent
    const sx = ca * (RI - 0.42), sz = sa * (RI - 0.42);
    for (let k = 0; k < steps; k++) {
      const y = G + (steps - 1 - k) * run;
      const x = sx + tx * (k * 0.22 - 1.6), z = sz + tz * (k * 0.22 - 1.6);
      b.box(0.7, y - G + run, 0.24, { x, y: G, z, ry: Math.atan2(tx, tz), color: '#b8b0a0' });
    }
    // parapet of the flight
    b.beam([sx + tx * -1.6 - ca * 0.36, UP + 0.25, sz + tz * -1.6 - sa * 0.36], [sx + tx * (steps * 0.22 - 1.6) - ca * 0.36, G + 0.3, sz + tz * (steps * 0.22 - 1.6) - sa * 0.36], 0.05, { color: '#ffffff' });
    stairPaths.push({
      top: new THREE.Vector3(sx + tx * -1.75, UP + 0.04, sz + tz * -1.75),
      bot: new THREE.Vector3(sx + tx * (steps * 0.22 - 1.45), G, sz + tz * (steps * 0.22 - 1.45)),
      away: new THREE.Vector3(sx + tx * (steps * 0.22 - 1.45) - ca * 1.6, G, sz + tz * (steps * 0.22 - 1.45) - sa * 1.6),
      // the approach on the upper level
      from: new THREE.Vector3(Math.cos(a - 0.4) * 5.4, UP + 0.04, Math.sin(a - 0.4) * 5.4),
    });
  }
  // two broad flights at the ends of the horseshoe, descending to the front
  for (const s of [-1, 1]) {
    const a = FRONT + s * (GAP + 0.02);
    const ca = Math.cos(a), sa = Math.sin(a);
    const tx = sa * s, tz = -ca * s; // tangent pointing into the gap
    for (let k = 0; k < steps; k++) {
      const y = G + (steps - 1 - k) * ((UP - G) / steps);
      const r = (RI + 10.2) / 2;
      const x = ca * r - tx * 0.0 + (-tx) * 0 + tx * (0.25 + k * 0.22), z = sa * r + tz * (0.25 + k * 0.22);
      b.box(2.4, y - G + (UP - G) / steps, 0.24, { x, y: G, z, ry: Math.atan2(tx, tz), color: '#c8c0b0' });
    }
  }
  // the many in the lower city, heads bowed
  for (let i = 0; i < 26; i++) {
    const [x, z] = rng.inDisc(RI - 0.8, 1.1);
    person(b, { x, y: G, z, h: 0.32, color: rng.pick(['#3c3a46', '#4a4a44', '#5a4a40', '#3e4a4e', '#6a5e52']) });
  }

  object.add(b.build());

  // ---------------------------------------------------------------- animated curtains
  const cGeo = new THREE.PlaneGeometry(0.15, 0.28, 1, 3).translate(0, -0.14, 0);
  const curt = new THREE.InstancedMesh(cGeo, new THREE.MeshStandardMaterial({ roughness: 1, side: THREE.DoubleSide }), curtains.length);
  curtains.forEach((c, i) => curt.setColorAt(i, _col.set(c.col)));
  curt.frustumCulled = false;
  object.add(curt);

  // ---------------------------------------------------------------- fountain jets, drips, descending walkers, drifting paper
  const NJ = 16;
  const jets = new THREE.InstancedMesh(new THREE.SphereGeometry(0.025, 6, 4), new THREE.MeshStandardMaterial({ color: '#cfefff', emissive: '#5fa8c8', emissiveIntensity: 0.6, roughness: 0.2 }), fountains.length * NJ);
  jets.frustumCulled = false;
  object.add(jets);
  const ND = 4;
  const dripM = new THREE.InstancedMesh(new THREE.SphereGeometry(0.022, 6, 4).scale(1, 1.6, 1), new THREE.MeshStandardMaterial({ color: '#7f9aa0', roughness: 0.2 }), drips.length * ND);
  dripM.frustumCulled = false;
  object.add(dripM);

  const NWK = 18;
  const wk = new THREE.InstancedMesh(new THREE.ConeGeometry(0.07, 0.24, 6).translate(0, 0.12, 0), new THREE.MeshStandardMaterial({ roughness: 0.85 }), NWK);
  const hd = new THREE.InstancedMesh(new THREE.SphereGeometry(0.04, 6, 5), new THREE.MeshStandardMaterial({ color: '#d7b08c', roughness: 0.8 }), NWK);
  wk.frustumCulled = hd.frustumCulled = false;
  const walkers = [];
  for (let i = 0; i < NWK; i++) {
    // fifteen go down; three, whistling, come up
    walkers.push({ s: i % stairPaths.length, up: i % 6 === 5, ph: rng(), sp: rng.range(0.035, 0.05) });
    wk.setColorAt(i, _col.set(rng.pick(['#e8e0d0', '#7fb0c8', '#5a4a40', '#3e4a4e', '#e0a0a0', '#6a5e52'])));
  }
  object.add(wk, hd);

  const NP = 10;
  const paper = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.14, 0.1), new THREE.MeshStandardMaterial({ color: '#efe9dc', roughness: 1, side: THREE.DoubleSide }), NP);
  paper.frustumCulled = false;
  object.add(paper);
  const papers = [];
  for (let i = 0; i < NP; i++) papers.push({ a: rng.range(0, 6.3), r: rng.range(1.2, 3.8), ph: rng.range(0, 6) });

  const V = new THREE.Vector3();
  function update(t) {
    curtains.forEach((c, i) => {
      const flut = 0.35 + 0.3 * Math.sin(t * 2.3 + c.ph) + 0.12 * Math.sin(t * 5.1 + c.ph * 2);
      _o.position.set(c.x, c.y, c.z);
      _o.rotation.set(-flut, c.ry, 0.12 * Math.sin(t * 1.7 + c.ph), 'YXZ');
      _o.scale.set(1, 1 - 0.1 * Math.sin(t * 3 + c.ph), 1);
      _o.updateMatrix();
      curt.setMatrixAt(i, _o.matrix);
    });
    curt.instanceMatrix.needsUpdate = true;
    _o.rotation.set(0, 0, 0, 'XYZ');
    let n = 0;
    for (const [fx, fy, fz] of fountains) {
      for (let k = 0; k < NJ; k++) {
        const u = (t * 0.9 + k / NJ) % 1;
        const a = k * 2.4;
        _o.position.set(fx + Math.cos(a) * u * 0.32, fy + u * 0.9 - u * u * 1.15, fz + Math.sin(a) * u * 0.32);
        _o.scale.setScalar(1 - u * 0.4);
        _o.updateMatrix();
        jets.setMatrixAt(n++, _o.matrix);
      }
    }
    jets.instanceMatrix.needsUpdate = true;
    n = 0;
    for (const [dx, dy, dz] of drips) {
      for (let k = 0; k < ND; k++) {
        const u = ((t * 0.7 + k / ND + dx * 0.13) % 1);
        _o.position.set(dx, dy - u * u * (dy - G), dz);
        _o.scale.setScalar(u > 0.97 ? 0.001 : 1);
        _o.updateMatrix();
        dripM.setMatrixAt(n++, _o.matrix);
      }
    }
    dripM.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < NWK; i++) {
      const w = walkers[i];
      const S = stairPaths[w.s];
      let u = (w.ph + t * w.sp) % 1;
      if (w.up) u = 1 - u;
      // from -> top (walk), top -> bot (stairs), bot -> away (walk)
      let y;
      if (u < 0.3) { V.lerpVectors(S.from, S.top, u / 0.3); }
      else if (u < 0.7) { V.lerpVectors(S.top, S.bot, (u - 0.3) / 0.4); }
      else { V.lerpVectors(S.bot, S.away, (u - 0.7) / 0.3); }
      y = V.y;
      const fade = Math.min(1, u * 12, (1 - u) * 12);
      _o.position.set(V.x, y, V.z);
      _o.scale.setScalar(Math.max(0.001, fade));
      _o.updateMatrix();
      wk.setMatrixAt(i, _o.matrix);
      // heads bowed going down, raised going up
      _o.position.y += 0.29;
      _o.position.x += (w.up ? 0 : 0.02);
      _o.updateMatrix();
      hd.setMatrixAt(i, _o.matrix);
    }
    wk.instanceMatrix.needsUpdate = true;
    hd.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < NP; i++) {
      const p = papers[i];
      const a = p.a + t * 0.05 + Math.sin(t * 0.3 + p.ph) * 0.2;
      _o.position.set(Math.cos(a) * p.r, G + 0.05 + Math.abs(Math.sin(t * 0.8 + p.ph)) * 0.25, Math.sin(a) * p.r);
      _o.rotation.set(t * 0.7 + p.ph, t * 0.4, Math.sin(t + p.ph));
      _o.scale.setScalar(1);
      _o.updateMatrix();
      paper.setMatrixAt(i, _o.matrix);
    }
    paper.instanceMatrix.needsUpdate = true;
    _o.rotation.set(0, 0, 0);
  }
  update(0);
  return { object, update };
}
