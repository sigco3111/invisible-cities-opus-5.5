// Penthesilea — hours of travel, and you cannot tell if you are in the city or still outside it.
// A watery sprawl diluted in the plain: pale low buildings back to back, corrugated sheds, plank
// fences, mangy fields, puddles and marsh, poles and sagging wires. No centre. Here and there a
// cluster of taller façades suggests one — go round the back, and they are only fronts, propped up
// by timber struts, with more periphery behind them. And it runs on, past the edge of the board.
import { THREE, Builder, M, C, Lines } from '../kit.js';

export default function build({ rng, accent }) {
  const b = new Builder();
  const object = new THREE.Group();
  const wires = new Lines();

  b.cyl(10.45, 10.5, 0.1, { seg: 80, color: '#a7a184' });

  /* ------------------------------------------------- roads (chords, no centre) -- */
  const roads = [];
  const chords = [[-2.4, 0.5], [1.1, 0.25], [0.6, 3.6], [2.9, -2.0], [-1.0, -2.4], [1.9, 4.3]];
  for (const [a, off] of chords) {
    // a chord with direction a, offset 'off' from centre (never through the middle)
    const dx = Math.cos(a), dz = Math.sin(a), nx = -dz, nz = dx;
    const half = Math.sqrt(Math.max(0, 10.4 ** 2 - off * off));
    const pts = [];
    for (let t = -half; t <= half + 0.01; t += 0.5) {
      const wob = 0.25 * Math.sin(t * 0.35 + a * 3);
      pts.push([nx * (off + wob) + dx * t, nz * (off + wob) + dz * t]);
    }
    roads.push(pts);
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, z0] = pts[i], [x1, z1] = pts[i + 1];
      const len = Math.hypot(x1 - x0, z1 - z0);
      b.box(len + 0.04, 0.02, 0.62, { x: (x0 + x1) / 2, y: 0.1, z: (z0 + z1) / 2, ry: -Math.atan2(z1 - z0, x1 - x0), color: i % 7 === 3 ? '#77756c' : '#85837a' });
    }
  }
  const roadDist = (x, z) => {
    let d = 1e9;
    for (const pts of roads) for (let i = 0; i < pts.length; i += 1) d = Math.min(d, Math.hypot(pts[i][0] - x, pts[i][1] - z));
    return d;
  };

  /* ------------------------------------------- fields, marsh, puddles -- */
  const blobs = []; // occupied discs
  const free = (x, z, r) => Math.hypot(x, z) < 10.3 && roadDist(x, z) > r + 0.4 && blobs.every((o) => Math.hypot(o[0] - x, o[1] - z) > o[2] + r);
  // mangy fields: irregular, patchy, fenced on a side or two
  for (let k = 0, n = 0; k < 400 && n < 16; k++) {
    const [x, z] = rng.inDisc(9.6);
    const w = rng.range(1.4, 2.6), d = rng.range(1.0, 2.0);
    const r = Math.max(w, d) * 0.55;
    if (!free(x, z, r)) continue;
    blobs.push([x, z, r]);
    n++;
    const ry = rng.range(0, Math.PI);
    b.push({ x, z, ry });
    b.box(w, 0.025, d, { y: 0.1, color: rng.pick(['#9a9a6a', '#8f9460', '#a59f72', '#88915c']), mat: M.flat });
    for (let i = 0; i < 9; i++) b.box(rng.range(0.3, 0.8), 0.03, rng.range(0.2, 0.6), { x: rng.range(-w / 2.6, w / 2.6), y: 0.11, z: rng.range(-d / 2.6, d / 2.6), ry: rng.range(0, 3), color: rng.pick(['#a99a72', '#7d8a54', '#b5a77e']), mat: M.flat });
    // a plank fence along one or two sides
    const sides = rng.int(1, 2);
    for (let s = 0; s < sides; s++) {
      const along = s === 0 ? w : d;
      for (let u = -along / 2; u < along / 2; u += 0.16) {
        if (rng.chance(0.12)) continue; // missing planks
        const px = s === 0 ? u : w / 2, pz = s === 0 ? -d / 2 : u;
        b.box(0.03, rng.range(0.22, 0.3), 0.1, { x: px, y: 0.1, z: pz, ry: s === 0 ? Math.PI / 2 : 0, rz: rng.range(-0.08, 0.08), color: rng.pick(['#9c8a6c', '#8a7a5e', '#b0a084']), mat: M.wood });
      }
    }
    b.pop();
  }
  // marsh and puddles
  for (let k = 0, n = 0; k < 400 && n < 22; k++) {
    const [x, z] = rng.inDisc(10.0);
    const r = n < 5 ? rng.range(0.7, 1.3) : rng.range(0.2, 0.5);
    if (!free(x, z, r)) continue;
    blobs.push([x, z, r]);
    n++;
    b.geo(new THREE.CircleGeometry(r, 14).rotateX(-Math.PI / 2), { x, y: 0.105, z, sx: rng.range(0.8, 1.5), ry: rng.range(0, 3), color: '#8faab0', mat: M.water });
    if (r > 0.6) {
      // reeds around the marsh
      for (let i = 0; i < 14; i++) {
        const a = rng.range(0, 6.28), rr = r * rng.range(0.9, 1.4);
        b.cyl(0.008, 0.012, rng.range(0.25, 0.5), { x: x + Math.cos(a) * rr, y: 0.1, z: z + Math.sin(a) * rr, seg: 3, color: '#8a8a52' });
      }
    }
  }

  /* --------------------------------------------- the diluted sprawl -- */
  const PALE = ['#d8d2c2', '#cfc9ba', '#e0d9c8', '#c8c4b8', '#d6cdb6', '#bfc4c2', '#d9cfc0', '#cbbfa8'];
  const lots = [];
  for (let k = 0; k < 6000 && lots.length < 300; k++) {
    const [x, z] = rng.inDisc(10.2);
    const w = rng.range(0.35, 0.95), d = rng.range(0.3, 0.75);
    const r = Math.max(w, d) * 0.6;
    if (!free(x, z, r * 0.9)) continue;
    if (lots.some((o) => Math.hypot(o.x - x, o.z - z) < o.r + r + 0.08)) continue;
    // align loosely with the nearest road
    lots.push({ x, z, w, d, r });
  }
  const nearestDir = (x, z) => {
    let best = 1e9, dir = 0;
    for (const pts of roads) for (let i = 0; i < pts.length - 1; i++) {
      const dd = Math.hypot(pts[i][0] - x, pts[i][1] - z);
      if (dd < best) { best = dd; dir = Math.atan2(pts[i + 1][1] - pts[i][1], pts[i + 1][0] - pts[i][0]); }
    }
    return dir;
  };
  for (const L of lots) {
    const ry = -nearestDir(L.x, L.z) + (rng.chance(0.7) ? 0 : Math.PI / 2) + rng.range(-0.08, 0.08);
    const kind = rng();
    b.push({ x: L.x, z: L.z, ry });
    if (kind < 0.55) {
      // a pale low house, often two back to back
      const h = rng.range(0.32, 0.6);
      const wall = rng.pick(PALE);
      b.box(L.w, h, L.d, { y: 0.1, color: wall });
      if (rng.chance(0.5)) b.box(L.w + 0.04, 0.04, L.d + 0.04, { y: 0.1 + h, color: '#b8b2a4' });
      else b.box(L.w + 0.06, 0.04, L.d + 0.1, { y: 0.1 + h, rx: 0.12, color: rng.pick(['#9a8f80', '#a88a74', '#8f938f']) });
      if (rng.chance(0.4)) b.quad(0.1, 0.1, { x: rng.range(-L.w / 3, L.w / 3), y: 0.1 + h * 0.55, z: L.d / 2 + 0.012, mat: M.glow, color: C.lamp, glow: 1.3 });
      if (rng.chance(0.3)) b.box(L.w * 0.5, h * 0.7, L.d * 0.6, { x: L.w * 0.6, y: 0.1, color: rng.pick(PALE) }); // an extension
    } else if (kind < 0.8) {
      // a corrugated shed
      const h = rng.range(0.28, 0.45);
      b.box(L.w, h, L.d, { y: 0.1, color: rng.pick(['#9fa4a6', '#8e9496', '#a8a29a', '#93897c']), mat: M.rough_metal });
      const g = new THREE.CylinderGeometry(L.d / 2, L.d / 2, L.w, 10, 1, false, 0, Math.PI);
      g.rotateZ(Math.PI / 2); g.rotateY(Math.PI / 2); g.rotateY(Math.PI / 2);
      b.geo(g, { y: 0.1 + h, sy: 0.35, color: rng.pick(['#a8adb0', '#8f8a80', '#9a8a7a', '#7f8c8a']), mat: M.rough_metal });
    } else if (kind < 0.9) {
      // a yard of scrap and a caravan
      b.box(0.5, 0.22, 0.24, { y: 0.14, color: '#d8d4c8', mat: M.smooth });
      b.cyl(0.05, 0.05, 0.03, { x: -0.1, y: 0.09, z: 0.12, rx: Math.PI / 2, color: C.charcoal, seg: 8 });
      for (let i = 0; i < 4; i++) b.box(0.12, 0.08, 0.1, { x: rng.range(-0.4, 0.4), y: 0.1, z: rng.range(-0.3, 0.3), ry: rng.range(0, 3), color: rng.pick(['#8e4a2c', '#6a6c72', '#b5a77e']) });
    } else {
      // an unfinished block: bare columns and one slab
      b.box(L.w, 0.05, L.d, { y: 0.5, color: '#c9c2b4' });
      for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) b.box(0.06, 0.4, 0.06, { x: sx * (L.w / 2 - 0.04), y: 0.1, z: sz * (L.d / 2 - 0.04), color: '#c9c2b4' });
    }
    b.pop();
  }

  /* ------------------------------ the false centres: fronts propped from behind -- */
  const clusters = [[-5.6, 3.6, 0.4], [4.9, 5.4, 2.4], [3.4, -5.8, -1.9]];
  for (const [cx, cz, face] of clusters) {
    const n = rng.int(4, 6);
    for (let i = 0; i < n; i++) {
      const u = (i - (n - 1) / 2) * 0.82 + rng.range(-0.08, 0.08);
      const curve = Math.abs(u) * 0.22;
      const x = cx + Math.cos(face) * curve + Math.sin(face) * u;
      const z = cz + Math.sin(face) * curve - Math.cos(face) * u;
      const h = rng.range(2.4, 4.4) * (1 - Math.abs(u) * 0.12);
      const w = rng.range(0.7, 0.82);
      const ry = -face + Math.PI / 2;
      b.push({ x, z, ry });
      const wall = rng.pick(['#e6dccb', '#dcd2c0', '#ece4d2', '#d4cabb']);
      b.box(w, h, 0.08, { y: 0.1, color: wall, mat: M.smooth });
      // cornice and a pediment, as if this were downtown
      b.box(w + 0.06, 0.07, 0.14, { y: 0.1 + h, color: '#f2ebdd', mat: M.smooth });
      if (rng.chance(0.4)) b.geo(GABLE, { y: 0.17 + h, sx: w * 0.9, sy: 0.3, sz: 0.1, color: '#f2ebdd', mat: M.smooth });
      // windows on the front only
      const rows = Math.floor((h - 0.3) / 0.42), cols = 3;
      for (let rI = 0; rI < rows; rI++) for (let cI = 0; cI < cols; cI++) {
        const lit = rng.chance(0.35);
        b.quad(0.12, 0.2, { x: -w / 2 + (cI + 0.5) * (w / cols), y: 0.45 + rI * 0.42, z: 0.045, mat: lit ? M.glow : M.smooth, color: lit ? C.lamp : '#5a6070', glow: 1.4 });
      }
      // behind: nothing — just timber props
      for (const sx of [-w / 3, w / 3]) {
        b.rod([sx, h * 0.75, -0.05], [sx, 0.1, -h * 0.5], 0.018, { color: '#a89a7e' });
        b.rod([sx, 0.12, -0.05], [sx, 0.12, -h * 0.5], 0.016, { color: '#a89a7e' });
      }
      b.pop();
    }
    // a blank billboard and a lamp before each false centre
    const bx = cx + Math.cos(face) * 1.4, bz = cz + Math.sin(face) * 1.4;
    b.cyl(0.03, 0.03, 0.9, { x: bx, y: 0.1, z: bz, color: '#6a6c72', seg: 5 });
    b.sphere(0.06, { x: bx, y: 1.05, z: bz, mat: M.glow, color: '#ffe0a8', glow: 2.2 });
  }

  /* ---------------------------------------- poles and sagging wires -- */
  for (const pts of roads) {
    let prev = null;
    for (let i = 1; i < pts.length; i += 4) {
      const [x, z] = pts[i];
      const k = i + 1 < pts.length ? i + 1 : i - 1;
      const dir = Math.atan2(pts[k][1] - z, pts[k][0] - x);
      const px = x - Math.sin(dir) * 0.42, pz = z + Math.cos(dir) * 0.42;
      if (Math.hypot(px, pz) > 10.3) { prev = null; continue; }
      b.cyl(0.018, 0.024, 1.1, { x: px, y: 0.1, z: pz, seg: 5, color: '#6a5a46', mat: M.wood });
      b.box(0.3, 0.025, 0.025, { x: px, y: 1.1, z: pz, ry: -dir + Math.PI / 2, color: '#6a5a46', mat: M.wood });
      if (prev) {
        for (const o of [-0.12, 0.12]) {
          const ox = Math.cos(dir + Math.PI / 2) * o, oz = Math.sin(dir + Math.PI / 2) * o;
          wires.rope([prev[0] + ox, 1.12, prev[1] + oz], [px + ox, 1.12, pz + oz], 0.12, '#3a3a40', 6);
        }
      }
      prev = [px, pz];
    }
  }

  object.add(b.build());
  object.add(wires.build());

  /* ---------------------------------------- slow traffic on the roads -- */
  const cars = [];
  for (let i = 0; i < 4; i++) {
    const cb = new Builder();
    const col = ['#c9a27a', '#8fa0b3', '#d0c8b8', accent][i];
    cb.box(0.34, 0.1, 0.17, { y: 0.03, color: col, mat: M.smooth });
    cb.box(0.18, 0.08, 0.15, { x: -0.03, y: 0.13, color: col, mat: M.smooth });
    cb.sphere(0.022, { x: 0.17, y: 0.08, z: 0.05, mat: M.glow, color: '#fff2c8', glow: 2.5, seg: 6 });
    cb.sphere(0.022, { x: 0.17, y: 0.08, z: -0.05, mat: M.glow, color: '#fff2c8', glow: 2.5, seg: 6 });
    const g = cb.build();
    object.add(g);
    cars.push({ g, road: roads[(i * 2 + 1) % roads.length], ph: rng.range(0, 1), sp: rng.range(0.012, 0.02) * (i % 2 ? 1 : -1) });
  }
  function update(t) {
    for (const c of cars) {
      const pts = c.road;
      const n = pts.length - 1;
      let u = ((c.ph + t * c.sp) % 1 + 1) % 1;
      const f = u * n, i = Math.floor(f), k = f - i;
      const [x0, z0] = pts[i], [x1, z1] = pts[Math.min(i + 1, n)];
      const dir = Math.atan2(z1 - z0, x1 - x0) + (c.sp < 0 ? Math.PI : 0);
      const lane = 0.14;
      c.g.position.set(x0 + (x1 - x0) * k - Math.sin(dir) * lane, 0.12, z0 + (z1 - z0) * k + Math.cos(dir) * lane);
      c.g.rotation.y = -dir;
      // they vanish over the edge of the board, into the next stretch of Penthesilea
      const r = Math.hypot(c.g.position.x, c.g.position.z);
      c.g.visible = r < 10.2;
    }
  }
  update(0);
  return { object, update };
}

const GABLE = (() => {
  const s = new THREE.Shape([new THREE.Vector2(-0.5, 0), new THREE.Vector2(0.5, 0), new THREE.Vector2(0, 1)]);
  const g = new THREE.ExtrudeGeometry(s, { depth: 1, bevelEnabled: false });
  g.translate(0, 0, -0.5);
  return g;
})();
