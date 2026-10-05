// Armilla — no walls, no floors, no roofs: only the plumbing. Pipes rise where
// houses should be and branch where floors should be; basins stand against the
// sky, bathtubs hang like late fruit; slender nymphs bathe under the showers.
import { THREE, Builder, M, C } from '../kit.js';
import { setInst } from './_ab_util.js';

const FH = 1.35; // the storey height the vanished floors would have had

export default function build({ rng, accent }) {
  const b = new Builder();
  const object = new THREE.Group();

  /* -------------------------------------------------------- ground -- */
  b.cyl(10.4, 10.45, 0.1, { color: '#cfc6b6', seg: 72 });
  b.ring(9.7, 10.35, { y: 0.105, color: '#b9ae9b', seg: 72 });
  // moss and small puddles between the ghost houses
  for (let i = 0; i < 60; i++) {
    const [x, z] = rng.inDisc(9.5);
    if (rng.chance(0.5)) b.disc(rng.range(0.15, 0.4), { x, y: 0.102, z, sx: 1.4, ry: rng.range(0, 3), color: rng.pick(['#a9b38a', '#9aa77c', '#b8bb94']), mat: M.stone, seg: 10 });
  }

  /* ------------------------------------------ the vanished houses -- */
  const PIPE = [
    { pipe: '#dc9264', joint: '#c27a4a', mat: M.smooth }, // copper
    { pipe: '#e3c47a', joint: '#c9a04e', mat: M.smooth }, // brass
    { pipe: '#f2eee6', joint: '#d9d2c4', mat: M.smooth }, // white enamel
    { pipe: '#f2eee6', joint: '#cfc6b4', mat: M.smooth }, // lead grey
  ];
  const lots = [];
  const tries = 3000;
  for (let t = 0; t < tries && lots.length < 16; t++) {
    const [x, z] = lots.length < 1 ? [0.3, -0.2] : rng.inDisc(8.0, 0.5);
    const w = rng.range(1.7, 2.6), d = rng.range(1.7, 2.6);
    const rad = Math.hypot(w, d) / 2;
    if (lots.some((o) => Math.hypot(o.x - x, o.z - z) < o.rad + rad + 0.15)) continue;
    lots.push({ x, z, w, d, rad, ry: rng.range(-0.4, 0.4) });
  }
  // heights: tall in the middle, lower toward the rim
  for (const L of lots) {
    const k = 1 - Math.hypot(L.x, L.z) / 9;
    L.levels = Math.max(2, Math.min(10, Math.round(2.5 + k * 8 + rng.range(-1.2, 1.2))));
  }

  const drops = []; // falling water: {x, z, y0, y1, ph, sp}
  const nymphs = [];
  const tileA = '#e9eef0', tileB = new THREE.Color(accent).lerp(new THREE.Color('#ffffff'), 0.35).getStyle();

  const elbow = (p, r, col) => b.sphere(r * 1.35, { x: p[0], y: p[1], z: p[2], color: col.joint, mat: col.mat, seg: 6, hseg: 4 });
  const pipe = (a, c, r, col) => b.rod(a, c, r, { color: col.pipe, mat: col.mat, seg: 6 });
  const valve = (p, col, axis = 'y') => {
    b.cyl(0.05, 0.05, 0.1, { x: p[0], y: p[1] - 0.05, z: p[2], color: col.joint, mat: col.mat, seg: 8, rz: axis === 'x' ? Math.PI / 2 : 0 });
    b.cyl(0.012, 0.012, 0.1, { x: p[0], y: p[1] + 0.03, z: p[2], color: C.gold, mat: M.metal, seg: 4 });
    b.box(0.14, 0.02, 0.02, { x: p[0], y: p[1] + 0.13, z: p[2], ry: rng.range(0, 3), color: C.gold, mat: M.metal });
    b.box(0.02, 0.02, 0.14, { x: p[0], y: p[1] + 0.13, z: p[2], ry: rng.range(0, 3), color: C.gold, mat: M.metal });
  };

  // ---- fixtures ----
  const BASIN = [[0.02, 0], [0.12, 0.01], [0.24, 0.06], [0.3, 0.16], [0.33, 0.22], [0.31, 0.23], [0.27, 0.17], [0.2, 0.09], [0.02, 0.06]];
  const basin = (x, y, z, col, ry) => {
    // bowl on a bracket, tap above it, drain pipe below
    b.lathe(BASIN, { x, y, z, color: '#fbfaf6', mat: M.smooth, seg: 14 });
    b.disc(0.24, { x, y: y + 0.17, z, color: '#bfe0ea', mat: M.water, seg: 16 });
    pipe([x, y, z], [x, y - 0.5, z], 0.025, col);
    b.torus(0.06, 0.022, { x: x + 0.06, y: y - 0.5, z, color: col.pipe, mat: col.mat, tseg: 10, rseg: 5, arc: Math.PI });
    const tx = x + Math.sin(ry) * 0.36, tz = z + Math.cos(ry) * 0.36;
    pipe([tx, y + 0.1, tz], [tx, y + 0.45, tz], 0.022, col);
    b.rod([tx, y + 0.45, tz], [x + Math.sin(ry) * 0.16, y + 0.42, z + Math.cos(ry) * 0.16], 0.018, { color: C.silver, mat: M.metal, seg: 6 });
    b.box(0.12, 0.02, 0.02, { x: tx, y: y + 0.5, z: tz, ry, color: C.gold, mat: M.metal });
    if (rng.chance(0.7)) drops.push({ x: x + Math.sin(ry) * 0.15, z: z + Math.cos(ry) * 0.15, y0: y + 0.4, y1: y + 0.17, ph: rng(), sp: rng.range(0.7, 1.1) });
    return [tx, y + 0.1, tz];
  };
  const tub = (x, y, z, col, ry, withNymph) => {
    b.push({ x, y, z, ry });
    // hull: half a capsule
    b.geo(new THREE.SphereGeometry(1, 14, 5, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), { sx: 0.34, sy: 0.32, sz: 0.68, y: 0.32, color: '#fbfaf6', mat: M.smooth });
    b.torus(1, 0.035, { y: 0.32, sx: 0.34, sy: 0.68, rx: Math.PI / 2, color: '#fbfaf6', mat: M.smooth, tseg: 28, rseg: 5 });
    b.geo(new THREE.CircleGeometry(1, 20).rotateX(-Math.PI / 2), { y: 0.25, sx: 0.31, sz: 0.64, color: '#a9d6e4', mat: M.water });
    for (const [fx, fz] of [[-0.2, -0.45], [0.2, -0.45], [-0.2, 0.45], [0.2, 0.45]]) b.sphere(0.05, { x: fx, y: 0.05, z: fz, color: C.gold, mat: M.metal, seg: 6 });
    // taps at the head end
    b.rod([0, 0.32, -0.62], [0, 0.62, -0.62], 0.02, { color: col.pipe, mat: col.mat, seg: 6 });
    b.rod([0, 0.62, -0.62], [0, 0.55, -0.48], 0.018, { color: C.silver, mat: M.metal, seg: 6 });
    if (withNymph) {
      // a bather reclining: head, shoulders, knees above the water
      b.sphere(0.075, { y: 0.4, z: -0.38, color: '#f1dccb', mat: M.smooth, seg: 10 });
      b.geo(new THREE.ConeGeometry(0.08, 0.26, 8).rotateX(-1.2), { y: 0.38, z: -0.47, color: rng.pick(['#d8a24a', '#b0603a', '#e8cf8a', '#3f2f2a']), mat: M.smooth });
      b.sphere(0.06, { y: 0.27, z: -0.26, sx: 2.2, sy: 0.8, color: '#f1dccb', mat: M.smooth, seg: 8 });
      b.sphere(0.045, { y: 0.33, z: 0.25, x: -0.05, color: '#f1dccb', mat: M.smooth, seg: 8 });
      b.sphere(0.045, { y: 0.33, z: 0.25, x: 0.06, color: '#f1dccb', mat: M.smooth, seg: 8 });
      b.rod([0.16, 0.27, -0.25], [0.3, 0.42, -0.1], 0.022, { color: '#f1dccb', mat: M.smooth, seg: 5 });
    }
    b.pop();
    const ca = Math.cos(ry), sa = Math.sin(ry);
    // the drop from the tap
    drops.push({ x: x + sa * -0.48, z: z + ca * -0.48, y0: y + 0.55, y1: y + 0.25, ph: rng(), sp: rng.range(0.8, 1.2) });
    // drain pipe dangling below like a stalk
    pipe([x, y + 0.02, z], [x, y - 0.55, z], 0.025, col);
    elbow([x, y - 0.55, z], 0.025, col);
    return [x - sa * 0.62, y + 0.32, z - ca * 0.62];
  };
  const shower = (x, y, z, col, ry) => {
    // a rose on an arm, with a nymph standing in a little tray beneath
    const top = y + 1.0;
    pipe([x, y, z], [x, top, z], 0.025, col);
    const hx = x + Math.sin(ry) * 0.35, hz = z + Math.cos(ry) * 0.35;
    b.rod([x, top, z], [hx, top - 0.05, hz], 0.02, { color: col.pipe, mat: col.mat, seg: 6 });
    elbow([x, top, z], 0.025, col);
    b.geo(new THREE.CylinderGeometry(0.12, 0.03, 0.08, 14), { x: hx, y: top - 0.1, z: hz, color: C.silver, mat: M.metal });
    valve([x, y + 0.45, z], col);
    // tray (a shallow white dish)
    b.cyl(0.3, 0.26, 0.06, { x: hx, y: y - 0.2, z: hz, color: '#fbfaf6', mat: M.smooth, seg: 16 });
    b.disc(0.26, { x: hx, y: y - 0.135, z: hz, color: '#a9d6e4', mat: M.water, seg: 16 });
    pipe([hx, y - 0.2, hz], [hx, y - 0.5, hz], 0.02, col);
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      drops.push({ x: hx + Math.cos(a) * 0.07, z: hz + Math.sin(a) * 0.07, y0: top - 0.15, y1: y - 0.14, ph: rng(), sp: rng.range(1.0, 1.5) });
    }
    nymphs.push({ x: hx, y: y - 0.14, z: hz, ry: ry + Math.PI + rng.range(-0.6, 0.6), pose: 'shower' });
    return [x, y, z];
  };
  const spout = (x, y, z, col, ry) => {
    // a gooseneck overflow spilling a thin stream
    const ex = x + Math.sin(ry) * 0.3, ez = z + Math.cos(ry) * 0.3;
    b.tube([[x, y, z], [x + Math.sin(ry) * 0.1, y + 0.18, z + Math.cos(ry) * 0.1], [ex, y + 0.12, ez], [ex + Math.sin(ry) * 0.05, y - 0.05, ez + Math.cos(ry) * 0.05]], 0.022, { color: col.pipe, mat: col.mat, rseg: 6, tseg: 14 });
    const sx = ex + Math.sin(ry) * 0.05, sz = ez + Math.cos(ry) * 0.05;
    const groundY = 0.1;
    // glassy stream
    b.cyl(0.018, 0.03, y - 0.05 - groundY, { x: sx, y: groundY, z: sz, color: '#cfeaf2', mat: M.glass, seg: 6 });
    b.disc(rng.range(0.35, 0.6), { x: sx, y: groundY + 0.015, z: sz, color: '#9cc9d6', mat: M.water, seg: 18 });
    for (let k = 0; k < 2; k++) drops.push({ x: sx, z: sz, y0: y - 0.05, y1: groundY + 0.02, ph: rng(), sp: rng.range(0.5, 0.8), big: true });
  };

  // ---- build each house's plumbing ----
  for (const L of lots) {
    const col = rng.pick(PIPE);
    const col2 = rng.chance(0.4) ? rng.pick(PIPE) : col;
    const ca = Math.cos(L.ry), sa = Math.sin(L.ry);
    const loc = (u, v) => [L.x + u * ca + v * sa, L.z - u * sa + v * ca];
    // tiled floor: the ghost of a house
    b.push({ x: L.x, y: 0.1, z: L.z, ry: L.ry });
    b.box(L.w, 0.02, L.d, { color: '#d7d9d6', mat: M.smooth });
    const nT = Math.round(L.w / 0.3), mT = Math.round(L.d / 0.3);
    for (let i = 0; i < nT; i++) for (let j = 0; j < mT; j++) {
      if ((i + j) % 2) continue;
      b.box(L.w / nT - 0.01, 0.012, L.d / mT - 0.01, { x: -L.w / 2 + (i + 0.5) * (L.w / nT), y: 0.02, z: -L.d / 2 + (j + 0.5) * (L.d / mT), color: (i * 7 + j * 3) % 5 === 0 ? tileB : tileA, mat: M.smooth });
    }
    // broken stubs of wall at a corner or two
    for (let k = 0; k < 2; k++) if (rng.chance(0.5)) {
      const sx = rng.sign(), sz = rng.sign();
      b.box(rng.range(0.3, 0.8), rng.range(0.08, 0.3), 0.1, { x: sx * (L.w / 2 - 0.3), z: sz * L.d / 2, color: '#cbbfa9', mat: M.stone });
    }
    b.pop();

    // risers
    const H = L.levels * FH + 0.6;
    const nR = L.levels > 5 ? 2 : 1;
    const risers = [];
    for (let k = 0; k < nR; k++) {
      const u = (k === 0 ? -1 : 1) * L.w * rng.range(0.15, 0.35), v = rng.range(-0.3, 0.3) * L.d;
      const [x, z] = loc(u, v);
      const h = k === 0 ? H : H - rng.range(1, 2.5);
      const c = k === 0 ? col : col2;
      b.cyl(0.11, 0.13, 0.12, { x, y: 0.1, z, color: c.joint, mat: c.mat, seg: 10 }); // flange
      pipe([x, 0.1, z], [x, h, z], 0.075, c);
      // couplings along the riser
      for (let y = 0.8; y < h; y += 0.9) b.cyl(0.095, 0.095, 0.08, { x, y, z, color: c.joint, mat: c.mat, seg: 6 });
      // the top: a vent cap or a gooseneck
      if (rng.chance(0.5)) {
        b.cone(0.12, 0.12, { x, y: h + 0.08, z, color: c.joint, mat: c.mat, seg: 10 });
        b.cyl(0.06, 0.06, 0.08, { x, y: h, z, color: c.pipe, mat: c.mat, seg: 10 });
      } else {
        b.torus(0.15, 0.055, { x: x + 0.15 * ca, y: h, z: z - 0.15 * sa, ry: L.ry, color: c.pipe, mat: c.mat, tseg: 12, rseg: 6, arc: Math.PI });
        b.rod([x + 0.3 * ca, h, z - 0.3 * sa], [x + 0.3 * ca, h - 0.2, z - 0.3 * sa], 0.055, { color: c.pipe, mat: c.mat, seg: 8 });
      }
      risers.push({ x, z, u, v, h, c });
    }
    // floors: horizontal branches with fixtures at the ends
    const used = [];
    for (let lev = 1; lev <= L.levels; lev++) {
      const y = lev * FH - 0.4;
      const nb = rng.int(1, 3);
      for (let k = 0; k < nb; k++) {
        const R = rng.pick(risers);
        if (y > R.h - 0.3) continue;
        // target within the footprint, reached by an L-shaped run
        const tu = rng.range(-0.5, 0.5) * L.w * 1.15, tv = rng.range(-0.5, 0.5) * L.d * 1.15;
        if (used.some((p) => Math.hypot(p[0] - tu, p[1] - tv) < 0.75 && Math.abs(p[2] - y) < 1.2)) continue;
        used.push([tu, tv, y]);
        const c = R.c;
        const [mx, mz] = loc(tu, R.v);
        const [ex, ez] = loc(tu, tv);
        pipe([R.x, y, R.z], [mx, y, mz], 0.045, c);
        elbow([R.x, y, R.z], 0.045, c);
        elbow([mx, y, mz], 0.045, c);
        pipe([mx, y, mz], [ex, y, ez], 0.045, c);
        elbow([ex, y, ez], 0.045, c);
        if (rng.chance(0.4)) valve([(R.x + mx) / 2, y + 0.04, (R.z + mz) / 2], c, 'x');
        const kind = rng.pick(['basin', 'basin', 'tub', 'tub', 'shower', 'shower', 'spout']);
        const ry = rng.range(0, Math.PI * 2);
        if (kind === 'basin') {
          // stalk up from the run to the bowl
          pipe([ex, y, ez], [ex, y + 0.25, ez], 0.025, c);
          basin(ex, y + 0.25, ez, c, ry);
          if (rng.chance(0.25)) nymphs.push({ x: ex + Math.sin(ry) * 0.6, y: y + 0.25 - 0.25, z: ez + Math.cos(ry) * 0.6, ry: ry + Math.PI, pose: 'lean', perch: true, c });
        } else if (kind === 'tub') {
          // the tub hangs below the branch on its supply pipe, like fruit
          const hang = rng.range(0.35, 0.7);
          const ty = y - hang - 0.32;
          if (ty < 0.2) continue;
          pipe([ex, y, ez], [ex, ty + 0.3, ez], 0.025, c);
          tub(ex, ty, ez, c, ry, rng.chance(0.55));
        } else if (kind === 'shower') {
          shower(ex, y, ez, c, ry);
        } else {
          spout(ex, y, ez, c, ry);
        }
      }
    }
    // occasionally a bather sits on a long horizontal pipe
  }

  // a few nymphs on the ground, by the puddles and a fountain-like basin
  for (let i = 0; i < 5; i++) {
    const [x, z] = rng.inDisc(9.2, 7.2);
    nymphs.push({ x, y: 0.1, z, ry: rng.range(0, 6.28), pose: rng.chance(0.5) ? 'shower' : 'stand' });
  }
  // a large white basin on the ground, overflowing: a bath for the nymphs who stayed on earth
  {
    const x = 6.4, z = 5.2;
    b.lathe([[0.02, 0], [0.6, 0.02], [0.95, 0.15], [1.1, 0.35], [1.12, 0.42], [1.02, 0.4], [0.9, 0.25], [0.02, 0.2]], { x, y: 0.1, z, color: '#fbfaf6', mat: M.smooth, seg: 28 });
    b.disc(0.98, { x, y: 0.45, z, color: '#9fd0df', mat: M.water, seg: 28 });
    const c = PIPE[1];
    pipe([x + 1.4, 0.1, z], [x + 1.4, 1.6, z], 0.05, c);
    b.torus(0.25, 0.05, { x: x + 1.15, y: 1.6, z, color: c.pipe, mat: c.mat, tseg: 12, rseg: 6, arc: Math.PI });
    b.rod([x + 0.9, 1.6, z], [x + 0.9, 1.45, z], 0.05, { color: c.pipe, mat: c.mat, seg: 8 });
    b.cyl(0.02, 0.035, 1.0, { x: x + 0.9, y: 0.45, z, color: '#cfeaf2', mat: M.glass, seg: 6 });
    for (let k = 0; k < 3; k++) drops.push({ x: x + 0.9, z, y0: 1.42, y1: 0.46, ph: k / 3, sp: 0.6, big: true });
    nymphs.push({ x: x - 0.3, y: 0.3, z: z + 0.2, ry: 0.5, pose: 'stand' });
    nymphs.push({ x: x + 0.25, y: 0.3, z: z - 0.3, ry: 2.3, pose: 'shower' });
  }

  // ---- the nymphs: slender porcelain figures ----
  const nymph = (n) => {
    const h = 0.5;
    const skin = rng.pick(['#f4e2d2', '#efd5c0', '#f7e9dc', '#e6c3a6']);
    const hair = rng.pick(['#d8a24a', '#b0603a', '#e8cf8a', '#3f2f2a', '#c27a3a']);
    b.push({ x: n.x, y: n.y, z: n.z, ry: n.ry });
    // legs
    for (const s of [-1, 1]) b.rod([s * 0.022, 0, 0], [s * 0.018, h * 0.48, 0], 0.014, { color: skin, mat: M.smooth, seg: 5, r2: 0.02 });
    // torso
    b.lathe([[0.03, h * 0.46], [0.048, h * 0.52], [0.036, h * 0.64], [0.05, h * 0.74], [0.04, h * 0.8], [0.015, h * 0.84]], { color: skin, mat: M.smooth, seg: 7 });
    b.sphere(0.04, { y: h * 0.9, color: skin, mat: M.smooth, seg: 7 });
    // long hair falling down the back
    b.geo(new THREE.CylinderGeometry(0.035, 0.05, h * 0.38, 8, 1, true), { y: h * 0.76, z: -0.018, color: hair, mat: M.cloth });
    b.sphere(0.043, { y: h * 0.91, z: -0.006, sy: 0.9, color: hair, mat: M.smooth, seg: 8 });
    // arms
    if (n.pose === 'shower') {
      for (const s of [-1, 1]) b.rod([s * 0.04, h * 0.78, 0], [s * 0.07, h * 1.05, 0.02], 0.011, { color: skin, mat: M.smooth, seg: 4 });
    } else if (n.pose === 'lean') {
      b.rod([0.04, h * 0.78, 0], [0.09, h * 0.6, 0.12], 0.011, { color: skin, mat: M.smooth, seg: 4 });
      b.rod([-0.04, h * 0.78, 0], [-0.06, h * 0.95, -0.04], 0.011, { color: skin, mat: M.smooth, seg: 4 });
    } else {
      b.rod([0.04, h * 0.78, 0], [0.06, h * 0.5, 0.02], 0.011, { color: skin, mat: M.smooth, seg: 4 });
      b.rod([-0.04, h * 0.78, 0], [-0.1, h * 0.98, 0.04], 0.011, { color: skin, mat: M.smooth, seg: 4 });
    }
    // a sheer cloth draped at the hips, in the accent tint
    if (rng.chance(0.6)) b.geo(new THREE.CylinderGeometry(0.045, 0.07, h * 0.18, 10, 1, true), { y: h * 0.4, color: rng.pick(['#ffffff', tileB, '#f1d6dc']), mat: M.cloth });
    b.pop();
  };
  for (const n of nymphs) {
    if (n.perch) {
      // stands on a tiny white step bracketed to the pipes
      b.cyl(0.14, 0.12, 0.05, { x: n.x, y: n.y - 0.05, z: n.z, color: '#fbfaf6', mat: M.smooth, seg: 12 });
      b.rod([n.x, n.y - 0.05, n.z], [n.x, n.y - 0.6, n.z], 0.02, { color: n.c.pipe, mat: n.c.mat, seg: 6 });
    }
    nymph(n);
  }

  object.add(b.build());

  /* ------------------------------------------------- falling drops -- */
  const dropMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#d9f2ff').multiplyScalar(1.6), toneMapped: false, transparent: true, opacity: 0.9 });
  const dropMesh = new THREE.InstancedMesh(new THREE.OctahedronGeometry(0.024, 0), dropMat, drops.length);
  dropMesh.frustumCulled = false;
  object.add(dropMesh);
  const update = (t) => {
    for (let i = 0; i < drops.length; i++) {
      const d = drops[i];
      const u = (t * d.sp * 0.9 + d.ph) % 1;
      const fall = d.y0 - d.y1;
      const y = d.y0 - u * u * fall;
      const s = d.big ? 1.3 : 1;
      setInst(dropMesh, i, d.x, y, d.z, s, 0, 0, 0, s * (1 + u * 1.8));
    }
    dropMesh.instanceMatrix.needsUpdate = true;
  };
  update(0);
  return { object, update };
}
