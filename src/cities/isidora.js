// Isidora — the city a young man dreamed of, reached in old age.
// A shell-crusted hill town of spiral stairs, spyglasses and a violin-maker's shop;
// at its foot a square with a long wall where the old men sit and watch the young pass.
import { THREE, Builder, M, C, Lines, glowMat, solid } from '../kit.js';
import { turnCity } from './_agentA_util.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const BRASS = new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0.65, roughness: 0.3 });
const SHELLS = ['#f6e8dc', '#f2c9bd', '#e9b3a4', '#fff6ea', '#e7d4b8', '#d99a8c'];
const WALLS = ['#f1cbb5', '#eab9a6', '#f3e1c4', '#e8c79a', '#f2d5c8', '#d9b8a2', '#cfd8c6', '#f5e7d3', '#e6a98f'];

export default function build({ rng, accent }) {
  const b = new Builder();
  const object = new THREE.Group();

  // ---------------------------------------------------------------- the hill
  const LV = 5, STEP = 1.3;
  const R = [7.8, 6.2, 4.7, 3.3, 2.0];
  const CX = (k) => -1.0 - 0.68 * k, CZ = (k) => -2.6 - 0.3 * k;
  const top = (k) => (k + 1) * STEP;
  const wob = (k, a) => 1 + (k === 0 ? 0.015 : 0.1) * Math.sin(a * 2 + k * 1.7) + (k === 0 ? 0.01 : 0.04) * Math.sin(a * 7 + k * 2);
  const rAt = (k, a) => R[k] * wob(k, a);

  // ground: pale stone square
  b.cyl(10.4, 10.5, 0.1, { color: '#d9ccb6', mat: M.stone, seg: 64 });
  // compass-rose mosaic in the square
  const SQX = 0.3, SQZ = 7.0;
  b.cyl(1.6, 1.6, 0.02, { x: SQX, y: 0.1, z: SQZ, color: '#cdb895', mat: M.smooth, seg: 40 });
  b.cyl(1.2, 1.2, 0.02, { x: SQX, y: 0.115, z: SQZ, color: '#e8dccb', mat: M.smooth, seg: 40 });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    b.geo(new THREE.CircleGeometry(1.15, 3, -0.2, 0.4).rotateX(-Math.PI / 2), { x: SQX, y: 0.13, z: SQZ, ry: a, color: i % 2 ? '#b77a5e' : '#5f8a8b', mat: M.smooth });
  }
  b.cyl(0.25, 0.25, 0.03, { x: SQX, y: 0.13, z: SQZ, color: C.gold, mat: BRASS, seg: 16 });

  for (let k = 0; k < LV; k++) {
    const pts = [];
    const N = 64;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const r = rAt(k, a);
      pts.push([CX(k) + Math.cos(a) * r, CZ(k) + Math.sin(a) * r]);
    }
    // retaining wall in warm stone, a slightly darker course at the top
    b.slab(pts, top(k) - 0.12, { y: 0.05, color: k % 2 ? '#d8bf9c' : '#cfb490', mat: M.stone });
    b.slab(pts.map(([x, z]) => [CX(k) + (x - CX(k)) * 1.012, CZ(k) + (z - CZ(k)) * 1.012]), 0.12, { y: top(k) - 0.12, color: '#e9dcc4', mat: M.smooth });
  }
  // terrace walls: courses of stone (thin rings)
  for (let k = 0; k < LV; k++) {
    for (let j = 1; j < 3; j++) {
      const y = top(k) - STEP + j * STEP / 3 + 0.05;
      if (y < 0.2) continue;
      b.torus(R[k] * 1.015, 0.025, { x: CX(k), y, z: CZ(k), rx: Math.PI / 2, color: '#b99d78', tseg: 72, rseg: 3 });
    }
  }

  // ------------------------------------------------- spiral stairs with shells
  const shellStair = (x, z, y0, rise, turns, rad, dir = 1) => {
    const steps = Math.round(turns * 22);
    const col = rad * 0.35;
    b.cyl(col, col * 1.1, rise + 0.5, { x, y: y0, z, color: '#efe2cf', mat: M.smooth, seg: 12 });
    b.sphere(col * 1.3, { x, y: y0 + rise + 0.55, z, color: rng.pick(SHELLS), mat: M.smooth, seg: 10 });
    const rail = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const a = dir * t * turns * Math.PI * 2;
      const y = y0 + t * rise;
      if (i < steps) b.box(rad - col + 0.05, 0.05, 0.2, { x: x + Math.cos(a) * (col + (rad - col) / 2), y, z: z + Math.sin(a) * (col + (rad - col) / 2), ry: -a, color: '#f1e6d6', mat: M.smooth });
      rail.push([x + Math.cos(a) * rad, y + 0.3, z + Math.sin(a) * rad]);
      if (i % 2 === 0) b.rod([x + Math.cos(a) * rad, y, z + Math.sin(a) * rad], [x + Math.cos(a) * rad, y + 0.3, z + Math.sin(a) * rad], 0.012, { color: '#f1e6d6' });
      // shells encrusting the banister and the outer edge
      if (i % 1 === 0) {
        const sr = 0.035 + rng() * 0.03;
        const sh = rng.pick(SHELLS);
        const ox = x + Math.cos(a) * (rad + 0.02), oz = z + Math.sin(a) * (rad + 0.02);
        if (rng.chance(0.6)) b.geo(SHELL_GEO, { x: ox, y: y + 0.3 + sr * 0.6, z: oz, s: sr * 9, ry: rng() * 6, rx: rng.range(-0.6, 0.6), color: sh, mat: M.smooth });
        else b.sphere(sr, { x: ox, y: y - 0.02, z: oz, color: sh, mat: M.smooth, seg: 6, sy: 0.6 });
      }
    }
    b.tube(rail, 0.025, { color: '#f6ece0', mat: M.smooth, tseg: steps * 2, rseg: 4 });
    // shells on the column too
    for (let i = 0; i < 10; i++) {
      const a = rng() * Math.PI * 2, y = y0 + rng() * (rise + 0.4);
      b.geo(SHELL_GEO, { x: x + Math.cos(a) * col, y, z: z + Math.sin(a) * col, ry: -a + Math.PI / 2, rx: -0.4, s: 0.35, color: rng.pick(SHELLS), mat: M.smooth });
    }
  };
  // stair positions: [level it starts on, angle]
  const stairs = [];
  const stairSpots = [[-1, 1.25], [-1, 2.2], [0, 1.0], [0, 2.4], [1, 1.5], [1, 0.3], [2, 1.9], [3, 1.1]];
  for (const [k, a] of stairSpots) {
    // stair stands just outside wall of level k+1, on level k (or ground for k=-1)
    const kk = k + 1;
    const rr = rAt(kk, a) + 0.48;
    const x = CX(kk) + Math.cos(a) * rr, z = CZ(kk) + Math.sin(a) * rr;
    const y0 = k < 0 ? 0.1 : top(k);
    shellStair(x, z, y0, STEP + 0.05, 1.25, 0.48, k % 2 ? 1 : -1);
    stairs.push([x, z]);
  }

  // ------------------------------------------------------- houses on terraces
  const roofs = ['#c26a43', '#b45f3f', '#cf7a50', '#a8553a', '#d48a5f'];
  const nearStair = (x, z) => stairs.some(([sx, sz]) => Math.hypot(sx - x, sz - z) < 1.05);
  const fronts = [];
  for (let k = 0; k < LV - 1; k++) {
    const inner = R[k + 1] + 0.3, outer = R[k] - 0.15;
    const mid = (inner + outer) / 2 + (k === 0 ? 0.25 : 0);
    const circ = 2 * Math.PI * mid;
    const n = Math.floor(circ / 1.15);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + k * 0.3 + rng.range(-0.05, 0.05);
      // keep the front of the lowest terrace (the old men's wall) free of clutter
      const x = CX(k) + Math.cos(a) * mid, z = CZ(k) + Math.sin(a) * mid;
      if (Math.hypot(x, z) > 9.9) continue;
      if (nearStair(x, z)) continue;
      if (rng.chance(0.12)) { // a garden: lemon tree in a pot
        b.cyl(0.14, 0.1, 0.2, { x, y: top(k), z, color: C.terracotta, seg: 8 });
        b.geo(new THREE.IcosahedronGeometry(0.28, 0), { x, y: top(k) + 0.5, z, color: C.leaf, mat: M.flat });
        for (let j = 0; j < 4; j++) b.sphere(0.04, { x: x + rng.range(-0.2, 0.2), y: top(k) + 0.45 + rng.range(0, 0.2), z: z + rng.range(-0.2, 0.2), color: '#f0c84a', mat: M.smooth, seg: 5 });
        continue;
      }
      const w = rng.range(0.75, 1.05), d = Math.min(outer - inner, rng.range(0.7, 1.0)), h = rng.range(0.8, 1.6) + (k === 0 ? 0.3 : 0);
      const ry = Math.PI / 2 - a;
      const y = top(k);
      b.push({ x, y, z, ry });
      b.box(w, h, d, { color: rng.pick(WALLS) });
      const rc = rng.pick(roofs);
      if (rng.chance(0.6)) b.geo(new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1).rotateY(Math.PI / 4).translate(0, 0.5, 0), { y: h, sx: w + 0.1, sz: d + 0.1, sy: 0.35, color: rc, mat: M.flat });
      else { b.box(w + 0.06, 0.06, d + 0.06, { y: h, color: '#f6efe2', mat: M.smooth }); b.box(0.2, 0.25, 0.2, { x: w * 0.3, y: h + 0.06, z: -d * 0.2, color: '#efe2cf' }); }
      // windows facing out (+z local), green shutters
      const nw = Math.max(1, Math.floor(w / 0.38));
      for (let j = 0; j < nw; j++) {
        const u = (j + 0.5) / nw * w - w / 2;
        for (let row = 0; row < (h > 1.3 ? 2 : 1); row++) {
          const lit = rng.chance(0.45);
          const wy = 0.35 + row * 0.55;
          b.quad(0.14, 0.22, { x: u, y: wy + 0.11, z: d / 2 + 0.012, mat: lit ? M.glow : M.smooth, color: lit ? C.lamp : '#3d3430', glow: 1.6 });
          for (const s of [-1, 1]) b.quad(0.07, 0.22, { x: u + s * 0.11, y: wy + 0.11, z: d / 2 + 0.014, color: rng.chance(0.5) ? '#5f8a7b' : '#4f7189', mat: M.smooth });
        }
      }
      b.pop();
      fronts.push({ x, z, y: y + h, a, k, w, d, h });
    }
  }

  // ------------------------------------------------- telescopes / spyglasses
  const spyglass = (x, y, z, aim, tilt, len = 0.55) => {
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      b.rod([x + Math.cos(a) * 0.14, y, z + Math.sin(a) * 0.14], [x, y + 0.4, z], 0.012, { color: C.darkwood, mat: M.wood });
    }
    const dx = Math.cos(aim) * Math.cos(tilt), dy = Math.sin(tilt), dz = Math.sin(aim) * Math.cos(tilt);
    const p0 = [x - dx * len * 0.35, y + 0.42 - dy * len * 0.35, z - dz * len * 0.35];
    const p1 = [x + dx * len * 0.65, y + 0.42 + dy * len * 0.65, z + dz * len * 0.65];
    b.rod(p0, p1, 0.035, { mat: BRASS, color: C.gold, r2: 0.05, seg: 8 });
    b.sphere(0.04, { x: p1[0], y: p1[1], z: p1[2], color: '#bfe3ff', mat: M.glow, glow: 1.2, seg: 6 });
  };
  for (const f of fronts) {
    if (rng.chance(0.18) && f.k > 0) {
      const a = f.a + 0.2;
      const rr = R[f.k] - 0.2;
      spyglass(CX(f.k) + Math.cos(a) * rr, top(f.k), CZ(f.k) + Math.sin(a) * rr, a, 0.25 + rng() * 0.3);
    }
  }

  // ------------------------------------------- summit: the astronomer's loggia
  const SX = CX(4), SZ = CZ(4), SY = top(4);
  b.cyl(1.2, 1.3, 1.5, { x: SX, y: SY, z: SZ, color: '#f2e2d0', mat: M.smooth, seg: 20 });
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    b.quad(0.18, 0.5, { x: SX + Math.cos(a) * 1.215, y: SY + 0.75, z: SZ + Math.sin(a) * 1.215, ry: Math.PI / 2 - a, mat: i % 3 ? M.glow : M.smooth, color: i % 3 ? C.lamp : '#3d3430', glow: 1.4 });
  }
  b.cyl(1.35, 1.35, 0.12, { x: SX, y: SY + 1.5, z: SZ, color: '#efe2cf', mat: M.smooth, seg: 20 });
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    b.cyl(0.03, 0.03, 0.3, { x: SX + Math.cos(a) * 1.28, y: SY + 1.62, z: SZ + Math.sin(a) * 1.28, color: '#efe2cf', mat: M.smooth, seg: 5 });
  }
  b.torus(1.28, 0.035, { x: SX, y: SY + 1.93, z: SZ, rx: Math.PI / 2, color: '#efe2cf', mat: M.smooth, tseg: 40, rseg: 4 });
  // a shell-shaped canopy (scallop) over the stair head
  b.geo(SCALLOP_GEO, { x: SX - 0.75, y: SY + 1.62, z: SZ - 0.5, s: 1.0, ry: 2.4, color: '#f2c9bd', mat: M.smooth });
  // the great telescope (animated)
  const scope = new THREE.Group();
  {
    const tb = new Builder();
    tb.cyl(0.12, 0.18, 0.55, { color: C.darkwood, mat: M.wood, seg: 8 });
    const tube = new Builder();
    tube.cyl(0.13, 0.18, 2.3, { y: -0.6, mat: BRASS, color: '#d9a94e', seg: 14 });
    tube.torus(0.15, 0.03, { y: 1.1, rx: Math.PI / 2, mat: BRASS, color: '#a8752e', tseg: 18, rseg: 4 });
    tube.torus(0.19, 0.03, { y: -0.5, rx: Math.PI / 2, mat: BRASS, color: '#a8752e', tseg: 18, rseg: 4 });
    tube.cyl(0.03, 0.04, 0.3, { y: -0.85, mat: BRASS, color: '#d9a94e', seg: 6 });
    tube.disc(0.12, { y: 1.705, color: '#bfe3ff', mat: M.glow, glow: 1.5, seg: 14 });
    tube.cyl(0.04, 0.04, 0.6, { x: 0.2, y: 0.2, mat: BRASS, color: '#d9a94e', seg: 6 }); // finder
    scope.add(tb.build());
    const tilt = new THREE.Group();
    tilt.position.y = 0.6;
    tilt.add(tube.build());
    tilt.rotation.x = 0.9;
    scope.add(tilt);
    scope.userData.tilt = tilt;
    scope.position.set(SX, SY + 1.62, SZ + 0.1);
    object.add(scope);
  }

  // ------------------------------------------------- the violin-maker's shop
  {
    const a = 1.95, k = 0; // on the lowest terrace, facing the square-left
    const rr = R[0] + 0.05;
    const x = CX(0) + Math.cos(a) * (R[1] + 0.85), z = CZ(0) + Math.sin(a) * (R[1] + 0.85);
    // a giant violin hung as a shop sign on the terrace wall
    const vx = CX(0) + Math.cos(a) * (rr + 0.03), vz = CZ(0) + Math.sin(a) * (rr + 0.03);
    violin(b, { x: vx, y: 0.5, z: vz, ry: Math.PI / 2 - a, s: 1.35 });
    // violins in the workshop window
    for (let i = 0; i < 3; i++) violin(b, { x: x + Math.cos(a + Math.PI / 2) * (i - 1) * 0.25 + Math.cos(a) * 0.55, y: top(k) + 0.2, z: z + Math.sin(a + Math.PI / 2) * (i - 1) * 0.25 + Math.sin(a) * 0.55, ry: Math.PI / 2 - a, s: 0.45 });
  }

  // ----------------- the long wall of the square: a bench and the old men
  const BA0 = Math.PI / 2 - 0.42, BA1 = Math.PI / 2 + 0.5;
  const benchR = R[0] + 0.32;
  for (let i = 0; i < 40; i++) {
    const a = BA0 + (BA1 - BA0) * (i + 0.5) / 40;
    const x = CX(0) + Math.cos(a) * benchR, z = CZ(0) + Math.sin(a) * benchR;
    b.box(benchR * (BA1 - BA0) / 40 + 0.02, 0.32, 0.36, { x, y: 0.1, z, ry: Math.PI / 2 - a, color: '#e9dcc4', mat: M.smooth });
  }
  // the wall of the old men: whitewashed, with a striped awning over the bench
  for (let i = 0; i < 24; i++) {
    const a = BA0 + (BA1 - BA0) * (i + 0.5) / 24;
    const seg = (R[0] + 0.03) * (BA1 - BA0) / 24 + 0.02;
    const x = CX(0) + Math.cos(a) * (R[0] + 0.03), z = CZ(0) + Math.sin(a) * (R[0] + 0.03);
    b.box(seg, 1.22, 0.05, { x, y: 0.1, z, ry: Math.PI / 2 - a, color: '#f7f1e6', mat: M.smooth });
    const xa = CX(0) + Math.cos(a) * (R[0] + 0.32), za = CZ(0) + Math.sin(a) * (R[0] + 0.32);
    b.box(seg, 0.025, 0.62, { x: xa, y: 1.18, z: za, ry: Math.PI / 2 - a, rx: 0.3, color: i % 2 ? '#f6efe2' : accent, mat: M.cloth });
  }
  // lamps along the wall
  for (let i = 0; i <= 4; i++) {
    const a = BA0 + (BA1 - BA0) * i / 4;
    const x = CX(0) + Math.cos(a) * (R[0] + 0.05), z = CZ(0) + Math.sin(a) * (R[0] + 0.05);
    b.rod([x, 1.0, z], [x + Math.cos(a) * 0.25, 1.05, z + Math.sin(a) * 0.25], 0.015, { color: C.charcoal });
    b.sphere(0.07, { x: x + Math.cos(a) * 0.28, y: 0.97, z: z + Math.sin(a) * 0.28, color: C.lamp, mat: M.glow, glow: 3, seg: 8 });
  }
  const OLD = 10;
  const oldPos = [];
  const coats = ['#5b5650', '#4a4e57', '#6a5d4d', '#3f4448', '#5f574b', '#77706a'];
  for (let i = 0; i < OLD; i++) {
    const a = BA0 + 0.06 + (BA1 - BA0 - 0.12) * (i + rng.range(-0.2, 0.2)) / (OLD - 1);
    const x = CX(0) + Math.cos(a) * (benchR + 0.02), z = CZ(0) + Math.sin(a) * (benchR + 0.02);
    const fx = Math.cos(a), fz = Math.sin(a);
    const coat = rng.pick(coats);
    // seated: torso on the bench, thighs forward, shins down
    b.cyl(0.065, 0.085, 0.2, { x, y: 0.42, z, color: coat, seg: 7, rx: 0.15 * fz, rz: -0.15 * fx });
    b.box(0.16, 0.06, 0.2, { x: x + fx * 0.12, y: 0.4, z: z + fz * 0.12, ry: Math.PI / 2 - a, color: '#3d3a37' });
    b.box(0.14, 0.3, 0.06, { x: x + fx * 0.21, y: 0.1, z: z + fz * 0.21, ry: Math.PI / 2 - a, color: '#3d3a37' });
    if (i % 3 === 1) b.rod([x + fx * 0.28 + fz * 0.08, 0.1, z + fz * 0.28 - fx * 0.08], [x + fx * 0.2 + fz * 0.08, 0.55, z + fz * 0.2 - fx * 0.08], 0.01, { color: C.darkwood }); // cane
    oldPos.push([x, 0.69, z, a]);
  }
  // the old men's heads turn to follow the young (instanced so they can move)
  const headGeo = (() => {
    const s = new THREE.SphereGeometry(0.055, 8, 6);
    const nose = new THREE.ConeGeometry(0.015, 0.04, 4).rotateX(Math.PI / 2).translate(0, -0.005, 0.06);
    const brim = new THREE.CylinderGeometry(0.085, 0.085, 0.01, 10).translate(0, 0.035, 0.01);
    const crown = new THREE.CylinderGeometry(0.05, 0.055, 0.05, 10).translate(0, 0.06, 0);
    const parts = [s, nose, brim, crown].map((g) => (g.index ? g.toNonIndexed() : g));
    // colour: skin for face, dark for hat
    const cols = [[0.84, 0.69, 0.55], [0.8, 0.62, 0.5], [0.22, 0.2, 0.19], [0.25, 0.23, 0.21]];
    parts.forEach((g, i) => {
      const n = g.attributes.position.count, arr = new Float32Array(n * 3);
      for (let j = 0; j < n; j++) arr.set(cols[i], j * 3);
      g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
      if (g.attributes.uv) g.deleteAttribute('uv');
    });
    return mergeGeometries(parts);
  })();
  const heads = new THREE.InstancedMesh(headGeo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8 }), OLD);
  heads.castShadow = true;
  object.add(heads);

  // ---------------------------------------- the young, strolling past (animated)
  const YOUNG = 16;
  const bodyGeo = new THREE.ConeGeometry(0.085, 0.27, 7).translate(0, 0.135, 0);
  const youngBodies = new THREE.InstancedMesh(bodyGeo, solid('#ffffff', { roughness: 0.7 }), YOUNG);
  const youngHeads = new THREE.InstancedMesh(new THREE.SphereGeometry(0.05, 8, 6), solid('#ffffff', { roughness: 0.7 }), YOUNG);
  youngBodies.castShadow = true;
  const youngCols = ['#e07186', '#f3d36b', '#4fbcae', '#ffffff', '#7d9cff', '#ef9440', '#e9a8c0', '#9cc26f', accent, '#f6efe2', '#c14a3a', '#7fd0e0'];
  const hair = ['#3a2418', '#7a4a20', '#d9b36a', '#1e1a18', '#a0522d'];
  const _c = new THREE.Color();
  for (let i = 0; i < YOUNG; i++) {
    youngBodies.setColorAt(i, _c.set(youngCols[i % youngCols.length]));
    youngHeads.setColorAt(i, _c.set(i % 3 === 0 ? '#d7b08c' : rng.pick(hair)));
  }
  object.add(youngBodies, youngHeads);
  const walkers = [];
  for (let i = 0; i < YOUNG; i++) {
    const lane = i % 2;
    walkers.push({ ph: (i / YOUNG) * Math.PI * 2 + rng.range(-0.15, 0.15), sp: (lane ? 1 : -1) * rng.range(0.07, 0.1), rx: 3.4 + lane * 0.5 + rng.range(-0.15, 0.15), rz: 1.1 + lane * 0.4, bob: rng() * 6 });
  }
  // pairs: make some couples walk together
  for (let i = 2; i < YOUNG; i += 4) { walkers[i].ph = walkers[i - 2].ph + 0.1; walkers[i].sp = walkers[i - 2].sp; walkers[i].rx = walkers[i - 2].rx + 0.12; walkers[i].rz = walkers[i - 2].rz + 0.12; }

  // ------------------------------------------- the three figures on a stair
  // a stranger between two women — and a third, waiting at the top
  {
    const [sx, sz] = stairs[2];
    const t0 = top(0);
    const fig = (x, y, z, c) => { b.cone(0.07, 0.24, { x, y, z, color: c, seg: 6 }); b.sphere(0.045, { x, y: y + 0.29, z, color: '#d7b08c', seg: 6 }); };
    fig(sx + 0.7, t0, sz + 0.3, '#3c4f6b');
    fig(sx + 0.9, t0, sz - 0.1, '#e07186');
    fig(sx + 0.45, t0, sz + 0.6, '#f3d36b');
    fig(sx - 0.1, t0 + STEP + 0.05, sz - 0.6, '#ffffff');
  }

  // a few cypresses and pines on the slope
  for (let i = 0; i < 9; i++) {
    const k = rng.int(0, 3);
    const a = rng.range(-Math.PI, 0.2);
    const rr = R[k] - 0.25;
    const x = CX(k) + Math.cos(a) * rr, z = CZ(k) + Math.sin(a) * rr;
    if (nearStair(x, z) || Math.hypot(x, z) > 10) continue;
    b.geo(new THREE.SphereGeometry(1, 7, 5), { x, y: top(k) + 0.6, z, sx: 0.14, sz: 0.14, sy: 0.6, color: C.darkleaf, mat: M.flat });
  }

  // shell-crusted belvederes: spiral stairs that climb to nothing but a view
  const belv = [[0, 1.05], [1, 0.55], [2, 2.3], [0, 2.75]];
  const rises = [5.2, 3.4, 4.4, 2.6];
  belv.forEach(([k, a], bi) => {
    const rr = R[k] - 0.55;
    const x = CX(k) + Math.cos(a) * rr, z = CZ(k) + Math.sin(a) * rr;
    const y0 = top(k), rise = rises[bi];
    shellStair(x, z, y0, rise, rise * 0.75, 0.42 + rise * 0.02, k % 2 ? -1 : 1);
    // a great spiral shell crowning the tallest stairs
    if (rise > 4) b.geo(SHELL_GEO, { x, y: y0 + rise + 0.15, z, s: 22, color: '#f2c9bd', mat: M.smooth });
    b.cyl(0.55, 0.5, 0.1, { x, y: y0 + rise + 0.05, z, color: '#f2c9bd', mat: M.smooth, seg: 16 });
    for (let i = 0; i < 12; i++) { const q = (i / 12) * Math.PI * 2; b.geo(SHELL_GEO, { x: x + Math.cos(q) * 0.55, y: y0 + rise + 0.12, z: z + Math.sin(q) * 0.55, s: 2.2, color: rng.pick(SHELLS), mat: M.smooth }); }
    spyglass(x + 0.15, y0 + rise + 0.15, z + 0.15, a, 0.35, 0.45);
  });
  // the back of the hill breaks into a cliff
  for (let i = 0; i < 9; i++) {
    const a = -2.9 + i * 0.28 + rng.range(-0.1, 0.1);
    const k = i % 3;
    const rr = R[k] * wob(k, a) - 0.1;
    const x = CX(k) + Math.cos(a) * rr, z = CZ(k) + Math.sin(a) * rr;
    if (Math.hypot(x, z) > 9.6) continue;
    const g = new THREE.IcosahedronGeometry(1, 1);
    const pp = g.attributes.position;
    for (let v = 0; v < pp.count; v++) { const f = 0.8 + 0.4 * Math.abs(Math.sin(pp.getX(v) * 7.1 + pp.getY(v) * 3.3 + i)); pp.setXYZ(v, pp.getX(v) * f, pp.getY(v) * f, pp.getZ(v) * f); }
    g.computeVertexNormals();
    b.geo(g, { x, y: top(k) * 0.55, z, sx: rng.range(0.8, 1.3), sy: top(k) * 0.6 + 0.5, sz: rng.range(0.8, 1.3), ry: rng() * 6, color: rng.pick(['#bfa27e', '#b09070', '#c9ad86']), mat: M.flat });
  }
  // the square's rim: parapet over the sea-haze, plane trees and lamps
  for (let i = 0; i < 46; i++) {
    const a = (i / 46) * Math.PI * 1.1 - 0.05;
    const x = Math.cos(a) * 10.05, z = Math.sin(a) * 10.05;
    const k0 = Math.hypot(x - CX(0), z - CZ(0));
    if (k0 < R[0] + 0.4) continue;
    b.box(1.38, 0.32, 0.18, { x, y: 0.1, z, ry: Math.PI / 2 - a, color: '#e9dcc4', mat: M.smooth });
    if (i % 5 === 0) {
      tree0(b, x * 0.9, z * 0.9, rng);
    } else if (i % 5 === 2) {
      b.cyl(0.02, 0.03, 1.0, { x, y: 0.42, z, color: C.charcoal, seg: 5 });
      b.sphere(0.06, { x, y: 1.46, z, color: C.lamp, mat: M.glow, glow: 3, seg: 8 });
    }
  }

  const STATIC = b.build();
  object.add(STATIC);

  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _p = new THREE.Vector3(), _s = new THREE.Vector3(1, 1, 1), _e = new THREE.Euler();
  const wpos = new Float32Array(YOUNG * 2);
  const place = (t) => {
    for (let i = 0; i < YOUNG; i++) {
      const w = walkers[i];
      const ph = w.ph + t * w.sp;
      const x = SQX + Math.cos(ph) * w.rx, z = SQZ + 0.4 + Math.sin(ph) * w.rz;
      wpos[i * 2] = x; wpos[i * 2 + 1] = z;
      const dx = -Math.sin(ph) * w.rx * Math.sign(w.sp), dz = Math.cos(ph) * w.rz * Math.sign(w.sp);
      const yaw = Math.atan2(dx, dz);
      const bob = Math.abs(Math.sin(t * 6 + w.bob)) * 0.02;
      _q.setFromEuler(_e.set(0, yaw, Math.sin(t * 6 + w.bob) * 0.05));
      _p.set(x, 0.1 + bob, z);
      youngBodies.setMatrixAt(i, _m.compose(_p, _q, _s));
      _p.set(x, 0.1 + 0.31 + bob, z);
      youngHeads.setMatrixAt(i, _m.compose(_p, _q, _s));
    }
    youngBodies.instanceMatrix.needsUpdate = true;
    youngHeads.instanceMatrix.needsUpdate = true;
    // old heads: each follows the nearest young walker, slowly
    for (let i = 0; i < OLD; i++) {
      const [x, y, z, a] = oldPos[i];
      let best = 1e9, bx = 0, bz = 0;
      for (let j = 0; j < YOUNG; j++) {
        const d = (wpos[j * 2] - x) ** 2 + (wpos[j * 2 + 1] - z) ** 2;
        if (d < best) { best = d; bx = wpos[j * 2]; bz = wpos[j * 2 + 1]; }
      }
      let yaw = Math.atan2(bx - x, bz - z);
      const base = Math.atan2(Math.cos(a), Math.sin(a));
      let d = ((yaw - base + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      d = Math.max(-1.1, Math.min(1.1, d));
      _q.setFromEuler(_e.set(0.12, base + d, 0));
      _p.set(x, y, z);
      heads.setMatrixAt(i, _m.compose(_p, _q, _s));
    }
    heads.instanceMatrix.needsUpdate = true;
  };
  place(0);

  turnCity(object, [STATIC], 0.6);
  return {
    object,
    update(t) {
      place(t);
      scope.rotation.y = 2.2 + Math.sin(t * 0.07) * 1.2;
      scope.userData.tilt.rotation.x = 0.75 + Math.sin(t * 0.11) * 0.2;
    },
  };
}

// a small spiral shell (turret-like cone) — used to encrust stairs
const SHELL_GEO = (() => {
  const pts = [];
  for (let i = 0; i <= 8; i++) { const t = i / 8; pts.push(new THREE.Vector2(0.006 + 0.012 * Math.sin(Math.PI * Math.pow(t, 0.6)) * (1 - t * 0.5), t * 0.03)); }
  return new THREE.LatheGeometry(pts, 7);
})();
// a scallop shell: fan of ribs
const SCALLOP_GEO = (() => {
  const g = new THREE.CircleGeometry(0.7, 14, 0, Math.PI);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i);
    const ang = Math.atan2(y, x), r = Math.hypot(x, y);
    p.setZ(i, Math.cos(ang * 14) * 0.04 * r + r * r * 0.25);
  }
  g.rotateX(-Math.PI / 2);
  g.computeVertexNormals();
  return g;
})();

function tree0(b, x, z, rng) {
  b.cyl(0.05, 0.07, 0.7, { x, y: 0.1, z, color: '#9a8a74', seg: 6 });
  b.geo(new THREE.IcosahedronGeometry(0.45, 1), { x, y: 1.05, z, sy: 0.8, color: rng.pick(['#71905a', '#6a8a52', '#7d9a5e']), mat: M.flat });
}

function violin(b, { x, y, z, ry, s = 1 }) {
  const wood = { mat: M.wood, color: '#a24f22' };
  b.push({ x, y, z, ry, s });
  // body: lower and upper bouts, flat discs (face +z)
  b.geo(new THREE.CylinderGeometry(0.17, 0.17, 0.05, 14).rotateX(Math.PI / 2), { ...wood, y: 0.17 });
  b.geo(new THREE.CylinderGeometry(0.13, 0.13, 0.05, 14).rotateX(Math.PI / 2), { ...wood, y: 0.42 });
  b.box(0.18, 0.2, 0.05, { ...wood, y: 0.2, z: -0.025 });
  b.box(0.035, 0.32, 0.03, { y: 0.5, z: 0.02, color: '#1e1a18', mat: M.wood }); // fingerboard
  b.box(0.04, 0.2, 0.035, { y: 0.55, color: '#7a3a18', mat: M.wood }); // neck
  b.torus(0.035, 0.012, { y: 0.79, color: '#7a3a18', mat: M.wood, tseg: 10, rseg: 4, ry: Math.PI / 2 }); // scroll
  // f-holes and bridge
  for (const sx of [-0.06, 0.06]) b.box(0.012, 0.09, 0.01, { x: sx, y: 0.24, z: 0.03, color: '#1e1a18' });
  b.box(0.09, 0.025, 0.02, { y: 0.24, z: 0.035, color: '#e9d6b5' });
  for (const sx of [-0.012, 0.004, 0.02, -0.028]) b.box(0.003, 0.55, 0.003, { x: sx * 0.8, y: 0.18, z: 0.045, color: '#e8e8e8' });
  b.pop();
}
