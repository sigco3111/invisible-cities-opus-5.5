// Octavia — the spider-web city. Two crests, a chasm, and a rope net stretched
// across high up; everything hangs below it and sways in the updraught.
import { THREE, Builder, M, C, rock, tree } from '../kit.js';
import { swayify, figure, setInst, hash } from './_ab_util.js';

const HEMP = '#d9c39a';
const HEMP_D = '#a8875a';
const NX = 6.7; // half-width of the net (x)
const NZ = 4.7; // half-depth of the net (z)
const TOP = 11.8;
// net height: sags in the middle like a hammock
const H = (x, z) => TOP - 1.05 * (1 - (x / NX) ** 2) * (1 - 0.35 * (z / NZ) ** 2) - 0.12 * (z / NZ) ** 2;

export default function build({ rng, accent }) {
  const b = new Builder(); // static: crests, chasm, anchors
  const s = new Builder(); // swaying: net and everything hanging from it
  const object = new THREE.Group();
  const world = new THREE.Group();
  const ROT = 0.67; // the gorge opens toward the usual viewpoints (baked into geometry, keeps the bbox tight)
  const cR = Math.cos(ROT), sR = Math.sin(ROT);
  object.add(world);

  /* ------------------------------- the mountain block and its chasm -- */
  // a polar heightfield: two steep crests (|x| large) and a deep gorge along z
  const nz = (x, z) => {
    // cheap smooth value noise
    const xi = Math.floor(x), zi = Math.floor(z), fx = x - xi, fz = z - zi;
    const u = fx * fx * (3 - 2 * fx), v = fz * fz * (3 - 2 * fz);
    const a = hash(xi, zi), bb = hash(xi + 1, zi), c = hash(xi, zi + 1), d = hash(xi + 1, zi + 1);
    return a + (bb - a) * u + (c - a) * v + (a - bb - c + d) * u * v;
  };
  const sm = (a, bb, x) => { const t = Math.min(1, Math.max(0, (x - a) / (bb - a))); return t * t * (3 - 2 * t); };
  const terrain = (x, z) => {
    const ax = Math.abs(x), side = x > 0 ? 1 : 0;
    const e = sm(4.1 + 0.5 * nz(z * 0.6 + 7, side * 9), 7.3, ax);
    const peak = (12.4 + 2.2 * nz(z * 0.45 + side * 13, 3.3) + 0.8 * nz(z * 1.3, side * 5 + 1)) * (1 - 0.32 * (z / 10.4) ** 2);
    let h = Math.pow(e, 1.35) * peak;
    h += 0.55 * Math.sin(h * 1.7 + nz(z, x) * 2) * e * (1 - e) * 3; // ledges in the cliff
    h += (nz(x * 1.4 + 3, z * 1.4) - 0.5) * 1.5 * e; // jagged tops
    h += (nz(x * 3.3 + 11, z * 3.3) - 0.5) * 0.7 * e; // crags
    const rr = Math.hypot(x, z);
    h *= 1 - 0.78 * sm(7.7, 10.35, rr) - 0.12 * sm(9.6, 10.35, rr);
    const sx = Math.sin(z * 0.55) * 1.0 + 0.2;
    const floor = 0.12 + 0.3 * nz(x * 0.9 + 21, z * 0.9) * sm(0.35, 1.3, Math.abs(x - sx));
    return Math.max(floor, h);
  };
  {
    const RINGS = 64, SEGS = 200, RM = 10.35;
    const P = (i, j) => {
      const r = (i / RINGS) * RM, a = (j / SEGS) * Math.PI * 2;
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      return [x, terrain(x, z), z];
    };
    const pos = [], col = [];
    const cA = new THREE.Color(), tmp = new THREE.Color();
    const tri = (p, q, w) => {
      pos.push(...p, ...q, ...w);
      // face normal for colouring
      const ux = q[0] - p[0], uy = q[1] - p[1], uz = q[2] - p[2];
      const vx = w[0] - p[0], vy = w[1] - p[1], vz = w[2] - p[2];
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nzz = ux * vy - uy * vx;
      const ln = Math.hypot(nx, ny, nzz) || 1;
      const up = Math.abs(ny / ln);
      const hy = (p[1] + q[1] + w[1]) / 3;
      const jit = hash(p[0] * 3.1, p[2] * 2.7);
      if (hy < 0.6) cA.set('#4b4641').lerp(tmp.set('#5a544c'), jit);
      else if (up > 0.72 && hy > 2) cA.set(jit > 0.5 ? '#7e8656' : '#958d62').lerp(tmp.set('#6c7a4c'), jit * 0.6);
      else cA.set('#5d5752').lerp(tmp.set('#a99c88'), Math.min(1, hy / 13) * 0.85 + jit * 0.15);
      for (let k = 0; k < 3; k++) col.push(cA.r, cA.g, cA.b);
    };
    for (let i = 0; i < RINGS; i++) {
      for (let j = 0; j < SEGS; j++) {
        const a = P(i, j), bq = P(i + 1, j), c = P(i + 1, j + 1), d = P(i, j + 1);
        if (i === 0) { tri(a, c, bq); continue; }
        tri(a, c, bq); tri(a, d, c);
      }
    }
    // the cut face of the block (skirt)
    for (let j = 0; j < SEGS; j++) {
      const a = P(RINGS, j), d = P(RINGS, j + 1);
      const a0 = [a[0], 0, a[2]], d0 = [d[0], 0, d[2]];
      tri(a0, a, d); tri(a0, d, d0);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.computeVertexNormals();
    const mesh = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92, flatShading: true }));
    mesh.castShadow = mesh.receiveShadow = true;
    world.add(mesh);
  }
  // scree and boulders on the chasm floor
  for (let i = 0; i < 60; i++) {
    const x = rng.range(-4.6, 4.6), z = rng.range(-9.5, 9.5);
    if (x * x + z * z > 9.8 * 9.8) continue;
    const r = rng.range(0.12, 0.45) * (1 + Math.abs(x) / 4);
    rock(b, { x, y: terrain(x, z) - 0.1, z, r, h: r * rng.range(0.8, 1.5), color: rng.pick(['#6b665f', '#5a5752', '#7c7468', '#54504c']), rand: rng, detail: 0 });
  }
  // the thin stream winding along the bottom
  const streamPts = [];
  for (let i = 0; i <= 24; i++) {
    const z = -10.2 + (20.4 * i) / 24;
    streamPts.push([Math.sin(z * 0.55) * 1.0 + 0.2, 1.75, z]);
  }
  const streamMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.4, metalness: 0.1 });
  b.tube(streamPts, 0.3, { sy: 0.1, mat: streamMat, color: '#3c6470', tseg: 80, rseg: 6 });
  // dark shrubs in the gorge and pines on the ledges and crests
  for (let i = 0; i < 400; i++) {
    const [x, z] = rng.inDisc(9.9);
    const h = terrain(x, z);
    const sl = Math.abs(terrain(x + 0.25, z) - h) + Math.abs(terrain(x, z + 0.25) - h);
    if (sl > 0.32) continue;
    if (h < 1) { if (rng.chance(0.08)) b.geo(new THREE.IcosahedronGeometry(rng.range(0.15, 0.3), 0), { x, y: h + 0.12, z, sy: 0.7, color: rng.pick([C.darkleaf, '#4f6b45']), mat: M.flat }); continue; }
    if (rng.chance(0.35)) tree(b, { x, y: h - 0.05, z, h: rng.range(0.6, 1.3), kind: rng.chance(0.8) ? 'pine' : 'cypress', r: rng });
  }

  // rocky outcrops breaking up the slopes
  for (let i = 0; i < 45; i++) {
    const [x, z] = rng.inDisc(10.0, 4.5);
    if (Math.abs(x) < 4.6) continue;
    const h = terrain(x, z);
    if (h < 1.5) continue;
    const r = rng.range(0.3, 0.7);
    rock(b, { x, y: h - r * 1.1, z, r, h: r * rng.range(1.2, 2.0), color: rng.pick(['#7d766c', '#857c70', '#6e6760']), rand: rng, detail: 0 });
  }

  /* ------------------------------------------- anchors and chains -- */
  const anchorCol = '#3d3b3c';
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const x = sx * NX, z = sz * NZ, y = H(x, z);
    const ax = sx * 8.0, az = sz * (NZ + 1.0), ay = terrain(ax, az) + 0.15;
    const n = 12;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const px = x + (ax - x) * t, py = y + (ay - y) * t - 0.2 * Math.sin(Math.PI * t), pz = z + (az - z) * t;
      b.torus(0.08, 0.025, { x: px, y: py, z: pz, ry: -Math.atan2(az - z, ax - x) + (i % 2) * Math.PI / 2, mat: M.rough_metal, color: anchorCol, tseg: 10, rseg: 4 });
    }
    b.cyl(0.14, 0.2, 0.6, { x: ax, y: ay - 0.3, z: az, mat: M.rough_metal, color: anchorCol, seg: 8 });
  }
  // guy ropes from the long edges into the cliff faces
  for (const sx of [-1, 1]) {
    for (let z = -NZ + 0.9; z <= NZ - 0.7; z += 1.2) {
      const y = H(sx * NX, z);
      let ax = sx * NX;
      while (Math.abs(ax) < 9.6 && terrain(ax, z) < y + 0.5) ax += sx * 0.1;
      b.rod([sx * NX, y, z], [ax, y + 0.5, z], 0.04, { color: HEMP_D, mat: M.wood, seg: 5 });
      b.cyl(0.06, 0.08, 0.18, { x: ax, y: y + 0.42, z, mat: M.rough_metal, color: anchorCol, seg: 6 });
    }
  }
  // two rope bridges climbing from the crest tops down onto the net
  for (const sx of [-1, 1]) {
    const zc = sx * 2.2;
    const sxp = sx * 7.7, szp = zc + sx * 2.2;
    const start = [sxp, terrain(sxp, szp) + 0.1, szp];
    const end = [sx * NX, H(sx * NX, zc) + 0.03, zc];
    const steps = 12;
    const ang = Math.atan2(end[0] - start[0], end[2] - start[2]);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const px = start[0] + (end[0] - start[0]) * t, py = start[1] + (end[1] - start[1]) * t - 0.3 * Math.sin(Math.PI * t), pz = start[2] + (end[2] - start[2]) * t;
      b.box(0.55, 0.05, 0.12, { x: px, y: py, z: pz, ry: ang + Math.PI / 2, color: C.wood, mat: M.wood });
    }
    for (const off of [-0.28, 0.28]) {
      const pts = [];
      for (let i = 0; i <= 8; i++) {
        const t = i / 8;
        const ox = Math.cos(ang) * off, oz = -Math.sin(ang) * off;
        pts.push([start[0] + (end[0] - start[0]) * t + ox, start[1] + (end[1] - start[1]) * t - 0.3 * Math.sin(Math.PI * t) + 0.45, start[2] + (end[2] - start[2]) * t + oz]);
      }
      b.tube(pts, 0.02, { color: HEMP, mat: M.wood, rseg: 4 });
    }
    // a little winch hut on the crest where the bridge starts
    const hx = start[0] + sx * 0.6, hz = start[2] + sx * 0.5, hy = terrain(hx, hz);
    b.box(0.9, 0.7 + 0.4, 0.8, { x: hx, y: hy - 0.4, z: hz, color: '#a77b52', mat: M.wood });
    b.geo(new THREE.ConeGeometry(0.78, 0.55, 4).rotateY(Math.PI / 4).translate(0, 0.275, 0), { x: hx, y: hy + 0.7, z: hz, color: C.darkwood, mat: M.flat });
    b.quad(0.16, 0.22, { x: hx, y: hy + 0.35, z: hz + 0.41, mat: M.glow, color: C.lamp, glow: 2.2 });
    b.quad(0.16, 0.22, { x: hx, y: hy + 0.35, z: hz - 0.41, ry: Math.PI, mat: M.glow, color: C.lamp, glow: 2.2 });
    // the great windlass drum
    b.cyl(0.18, 0.18, 0.6, { x: hx - sx * 0.75, y: hy + 0.25, z: hz, rx: Math.PI / 2, color: C.darkwood, mat: M.wood, seg: 10 });
  }

  /* -------------------------------------------------------- the net -- */
  // diamond mesh: lines along (x+z) and (x-z)
  const clipLine = (u0, dir) => {
    // param p along dir from point on u-line; sample within the rectangle
    const pts = [];
    for (let p = -14; p <= 14; p += 0.45) {
      const x = u0[0] + dir[0] * p, z = u0[1] + dir[1] * p;
      if (Math.abs(x) <= NX + 1e-6 && Math.abs(z) <= NZ + 1e-6) pts.push([x, H(x, z), z]);
    }
    return pts;
  };
  const step = 0.78;
  for (let u = -NX - NZ; u <= NX + NZ; u += step) {
    for (const sg of [1, -1]) {
      const pts = clipLine([u / 2, (sg * u) / 2], [Math.SQRT1_2, -sg * Math.SQRT1_2]);
      for (let i = 0; i < pts.length - 1; i++) s.rod(pts[i], pts[i + 1], 0.018, { color: HEMP, mat: M.wood, seg: 4 });
      // knots
      if (pts.length) for (let i = 0; i < pts.length; i += 2) s.sphere(0.035, { x: pts[i][0], y: pts[i][1], z: pts[i][2], color: HEMP_D, mat: M.wood, seg: 4 });
    }
  }
  // border cables and main cables (thicker)
  const cable = (pts, r = 0.05) => s.tube(pts, r, { color: HEMP_D, mat: M.wood, rseg: 5, tseg: pts.length * 3 });
  for (const sz of [-1, 1]) {
    const pts = [];
    for (let x = -NX; x <= NX + 0.01; x += 0.6) pts.push([x, H(x, sz * NZ), sz * NZ]);
    cable(pts, 0.06);
  }
  for (const sx of [-1, 1]) {
    const pts = [];
    for (let z = -NZ; z <= NZ + 0.01; z += 0.6) pts.push([sx * NX, H(sx * NX, z), z]);
    cable(pts, 0.06);
  }
  for (const zc of [-2.4, 0, 2.4]) {
    const pts = [];
    for (let x = -NX; x <= NX + 0.01; x += 0.6) pts.push([x, H(x, zc) + 0.01, zc]);
    cable(pts, 0.04);
  }

  // wooden ties to walk on: one long walkway across, two crossing it
  const plank = (x, z, ry, w = 0.85) => s.box(w, 0.05, 0.13, { x, y: H(x, z) + 0.03, z, ry, color: rng.pick(['#a8774f', '#9a6c46', '#b4855a', '#8f6443']), mat: M.wood });
  for (let x = -NX + 0.1; x <= NX - 0.1; x += 0.27) if (!rng.chance(0.06)) plank(x, 0, Math.PI / 2 + rng.range(-0.06, 0.06));
  for (const xc of [-3.3, 2.6]) for (let z = -NZ + 0.15; z <= NZ - 0.15; z += 0.27) if (Math.abs(z) > 0.5 && !rng.chance(0.08)) plank(xc, z, rng.range(-0.06, 0.06), 0.75);
  // hand ropes along the walkway on little posts
  for (const zz of [-0.5, 0.5]) {
    const pts = [];
    for (let x = -NX; x <= NX + 0.01; x += 0.9) {
      pts.push([x, H(x, zz) + 0.45, zz]);
      s.cyl(0.015, 0.015, 0.45, { x, y: H(x, zz), z: zz, color: C.darkwood, mat: M.wood, seg: 4 });
    }
    s.tube(pts, 0.015, { color: HEMP, mat: M.wood, rseg: 3 });
  }
  // people walking on the ties
  const walkers = [[-5.2, 0, 1], [-2.2, 0, -1], [0.9, 0, 1], [3.9, 0, -1], [-3.3, 2.6, 0], [2.6, -3.0, 0], [5.4, 0.05, 1]];
  for (const [x, z, d] of walkers) {
    figure(s, { x, y: H(x, z) + 0.05, z, h: 0.34, color: rng.pick([C.terracotta, accent, C.ochre, C.slate, C.rose]), ry: d ? (d > 0 ? Math.PI / 2 : -Math.PI / 2) : 0, arms: rng.chance(0.4) ? 0.6 : 0 });
  }

  /* ------------------------------------------------ hanging life -- */
  const rope = (a, bb, r = 0.016) => s.rod(a, bb, r, { color: HEMP, mat: M.wood, seg: 4 });
  const top = (x, z) => [x, H(x, z), z];

  // houses like sacks
  const SACK = [[0.02, 0], [0.3, 0.04], [0.52, 0.2], [0.62, 0.5], [0.62, 0.85], [0.52, 1.2], [0.34, 1.48], [0.16, 1.66], [0.13, 1.74], [0.18, 1.8], [0.02, 1.84]];
  const sackGeo = new THREE.LatheGeometry(SACK.map(([r, y]) => new THREE.Vector2(r, y)), 16);
  const sackCols = ['#e8d6b4', '#d9b58a', '#c99a74', '#e3c9a1', '#b4553f', '#ead9bd', '#5f7f8c', '#c9a243', '#7d6a58'];
  const sack = (x, z, drop, sc, ry) => {
    const t = top(x, z);
    const yb = t[1] - drop - 1.84 * sc;
    const col = rng.pick(sackCols);
    s.geo(sackGeo, { x, y: yb, z, s: sc, ry, color: col, mat: M.cloth });
    // stitched seams and a darker band
    s.torus(0.6 * sc, 0.025 * sc, { x, y: yb + 0.7 * sc, z, rx: Math.PI / 2, color: HEMP_D, mat: M.wood, tseg: 20, rseg: 4 });
    s.torus(0.47 * sc, 0.03 * sc, { x, y: yb + 1.25 * sc, z, rx: Math.PI / 2, color: HEMP_D, mat: M.wood, tseg: 20, rseg: 4 });
    // a lit round window and a dark door flap
    for (let k = 0; k < 2; k++) {
      const a = ry + k * 2.3;
      const rr = 0.625 * sc;
      s.geo(new THREE.CircleGeometry(0.1 * sc, 12), { x: x + Math.sin(a) * rr, y: yb + (0.85 + k * 0.1) * sc, z: z + Math.cos(a) * rr, ry: a, mat: M.glow, color: C.lamp, glow: rng.range(1.6, 2.6) });
    }
    s.box(0.24 * sc, 0.4 * sc, 0.02, { x: x + Math.sin(ry + 3.6) * 0.61 * sc, y: yb + 0.25 * sc, z: z + Math.cos(ry + 3.6) * 0.61 * sc, ry: ry + 3.6, rx: -0.15, color: '#5a3d2a', mat: M.cloth });
    // gathered top: ropes up to the net
    const tieY = yb + 1.84 * sc;
    for (let k = 0; k < 3; k++) {
      const a = ry + (k / 3) * Math.PI * 2;
      rope([x, tieY, z], [x + Math.cos(a) * 0.45, t[1], z + Math.sin(a) * 0.45]);
    }
    rope([x, tieY, z], t, 0.025);
    // a tiny ladder down from the sack's door
    if (rng.chance(0.5)) {
      const lx = x + Math.sin(ry + 3.6) * 0.66 * sc, lz = z + Math.cos(ry + 3.6) * 0.66 * sc;
      const L = rng.range(0.6, 1.2);
      for (const o of [-0.08, 0.08]) rope([lx + o, yb + 0.1, lz], [lx + o, yb - L, lz], 0.01);
      for (let y = yb - 0.1; y > yb - L; y -= 0.15) s.box(0.18, 0.02, 0.03, { x: lx, y, z: lz, color: C.wood, mat: M.wood });
    }
    return yb;
  };

  // gondola terraces
  const gondola = (x, z, drop, len, ry) => {
    const t = top(x, z);
    const y = t[1] - drop;
    s.push({ x, y, z, ry });
    s.geo(new THREE.SphereGeometry(1, 16, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), { sx: 0.5, sy: 0.35, sz: len * 0.5, color: '#8a5a39', mat: M.wood });
    s.torus(1, 0.03, { sx: 0.5, sy: len * 0.5, rx: Math.PI / 2, color: C.gold, mat: M.metal, tseg: 28, rseg: 4 });
    s.geo(new THREE.CircleGeometry(1, 20).rotateX(-Math.PI / 2), { y: -0.02, sx: 0.48, sz: len * 0.48, color: '#c49a6c', mat: M.wood });
    // rail posts and rail
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      s.cyl(0.012, 0.012, 0.25, { x: Math.cos(a) * 0.47, z: Math.sin(a) * len * 0.47, color: C.gold, mat: M.metal, seg: 4 });
    }
    s.torus(1, 0.015, { y: 0.25, sx: 0.47, sy: len * 0.47, rx: Math.PI / 2, color: C.gold, mat: M.metal, tseg: 28, rseg: 3 });
    // potted plants, a parasol, a person or two
    for (let i = 0; i < 3; i++) {
      const pz = (i - 1) * len * 0.28;
      if (i === 1) {
        s.cyl(0.012, 0.012, 0.9, { z: pz, color: C.darkwood, mat: M.wood, seg: 4 });
        s.cone(0.42, 0.18, { y: 0.85, z: pz, color: rng.pick([accent, C.rose, C.terracotta]), mat: M.cloth, seg: 10 });
        figure(s, { x: 0.18, z: pz + 0.12, h: 0.32, color: rng.pick([C.slate, C.terracotta, C.ochre]), ry: rng.range(0, 6) });
      } else {
        const px = rng.range(-0.22, 0.22);
        s.cyl(0.07, 0.05, 0.12, { x: px, z: pz, color: C.terracotta, mat: M.smooth, seg: 8 });
        s.geo(new THREE.IcosahedronGeometry(0.13, 0), { x: px, y: 0.2, z: pz, color: rng.pick([C.leaf, C.darkleaf, '#8aa86a']), mat: M.flat });
        if (rng.chance(0.5)) s.sphere(0.03, { x: px + 0.06, y: 0.3, z: pz, color: rng.pick([C.rose, C.gold, '#f2efe6']), mat: M.smooth, seg: 6 });
      }
    }
    s.pop();
    // four ropes up to the net
    const ca = Math.cos(ry), sa = Math.sin(ry);
    for (const [lx, lz] of [[-0.4, -len * 0.38], [0.4, -len * 0.38], [-0.4, len * 0.38], [0.4, len * 0.38]]) {
      const wx = x + lx * ca + lz * sa, wz = z - lx * sa + lz * ca;
      rope([wx, y + 0.05, wz], [x + (wx - x) * 1.25, H(wx, wz), z + (wz - z) * 1.25]);
    }
  };

  // hammock
  const hammock = (x, z, drop, ry) => {
    const t = top(x, z);
    const y = t[1] - drop;
    s.push({ x, y, z, ry });
    s.geo(new THREE.SphereGeometry(1, 14, 5, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), { sx: 0.28, sy: 0.18, sz: 0.85, color: rng.pick(['#e9e1cf', '#d5b98f', accent, '#c86f55']), mat: M.cloth });
    if (rng.chance(0.7)) { s.box(0.13, 0.08, 0.42, { y: -0.08, z: 0.05, color: C.slate, mat: M.smooth }); s.sphere(0.055, { y: -0.03, z: 0.32, color: "#d7b08c", mat: M.smooth, seg: 8 }); }
    s.pop();
    const ca = Math.cos(ry), sa = Math.sin(ry);
    for (const e of [-1, 1]) {
      const ex = x + e * 0.85 * sa, ez = z + e * 0.85 * ca;
      rope([ex, y, ez], [x + e * 1.5 * sa, H(x + e * 1.5 * sa, z + e * 1.5 * ca), z + e * 1.5 * ca], 0.014);
    }
  };

  // rope ladder
  const ladder = (x, z, len, ry = 0) => {
    const t = top(x, z);
    const ca = Math.cos(ry) * 0.13, sa = Math.sin(ry) * 0.13;
    rope([x - ca, t[1], z - sa], [x - ca, t[1] - len, z - sa], 0.014);
    rope([x + ca, t[1], z + sa], [x + ca, t[1] - len, z + sa], 0.014);
    for (let y = t[1] - 0.2; y > t[1] - len; y -= 0.2) s.box(0.3, 0.025, 0.035, { x, y, z, ry: -ry, color: C.wood, mat: M.wood });
  };

  // trapeze and rings for children's games
  const trapeze = (x, z, len) => {
    const t = top(x, z);
    rope([x - 0.25, t[1], z], [x - 0.25, t[1] - len, z], 0.012);
    rope([x + 0.25, t[1], z], [x + 0.25, t[1] - len, z], 0.012);
    s.rod([x - 0.27, t[1] - len, z], [x + 0.27, t[1] - len, z], 0.025, { color: C.gold, mat: M.metal, seg: 6 });
  };
  const rings = (x, z, len) => {
    const t = top(x, z);
    for (const o of [-0.22, 0.22]) {
      rope([x + o, t[1], z], [x + o, t[1] - len, z], 0.012);
      s.torus(0.09, 0.016, { x: x + o, y: t[1] - len - 0.09, z, color: C.gold, mat: M.metal, tseg: 14, rseg: 4 });
    }
  };

  // baskets, waterskins, potted plants on strings
  const basket = (x, z, len) => {
    const t = top(x, z);
    const y = t[1] - len;
    s.cyl(0.18, 0.13, 0.2, { x, y, z, color: '#b48a52', mat: M.wood, seg: 10, open: true });
    s.cyl(0.12, 0.12, 0.01, { x, y: y + 0.01, z, color: '#b48a52', mat: M.wood, seg: 10 });
    for (let i = 0; i < 4; i++) s.sphere(0.06, { x: x + rng.range(-0.08, 0.08), y: y + 0.18, z: z + rng.range(-0.08, 0.08), color: rng.pick([C.terracotta, C.gold, '#9fb35a', C.rose]), mat: M.smooth, seg: 6 });
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      rope([x + Math.cos(a) * 0.17, y + 0.2, z + Math.sin(a) * 0.17], [x, y + 0.6, z], 0.008);
    }
    rope([x, y + 0.6, z], t, 0.01);
  };
  const skin = (x, z, len) => {
    const t = top(x, z);
    s.sphere(0.16, { x, y: t[1] - len, z, sx: 0.8, sy: 1.25, color: rng.pick(['#8f5b37', '#a46e46', '#7b4c2e']), mat: M.smooth, seg: 10 });
    s.cyl(0.03, 0.05, 0.12, { x, y: t[1] - len + 0.17, z, color: '#6b4429', mat: M.wood, seg: 6 });
    rope([x, t[1] - len + 0.28, z], t, 0.01);
  };
  const plant = (x, z, len) => {
    const t = top(x, z);
    const y = t[1] - len;
    s.cyl(0.12, 0.08, 0.18, { x, y, z, color: C.terracotta, mat: M.smooth, seg: 10 });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + rng.range(0, 0.5);
      s.tube([[x, y + 0.16, z], [x + Math.cos(a) * 0.18, y + 0.12, z + Math.sin(a) * 0.18], [x + Math.cos(a) * 0.26, y - rng.range(0.15, 0.45), z + Math.sin(a) * 0.26]], 0.018, { color: rng.pick([C.leaf, '#86a865', C.darkleaf]), mat: M.flat, rseg: 3, tseg: 6 });
    }
    s.geo(new THREE.IcosahedronGeometry(0.12, 0), { x, y: y + 0.24, z, color: C.leaf, mat: M.flat });
    for (const a of [0, 2.1, 4.2]) rope([x + Math.cos(a) * 0.11, y + 0.18, z + Math.sin(a) * 0.11], [x, y + 0.6, z], 0.007);
    rope([x, y + 0.6, z], t, 0.009);
  };
  // chandeliers: the lamps of Octavia
  const chandelier = (x, z, len) => {
    const t = top(x, z);
    const y = t[1] - len;
    s.torus(0.32, 0.022, { x, y, z, rx: Math.PI / 2, color: C.gold, mat: M.metal, tseg: 24, rseg: 4 });
    s.torus(0.18, 0.018, { x, y: y - 0.16, z, rx: Math.PI / 2, color: C.gold, mat: M.metal, tseg: 20, rseg: 4 });
    s.sphere(0.06, { x, y: y - 0.26, z, color: C.gold, mat: M.metal, seg: 8 });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      s.cyl(0.018, 0.018, 0.08, { x: x + Math.cos(a) * 0.32, y: y + 0.02, z: z + Math.sin(a) * 0.32, color: C.ivory, mat: M.smooth, seg: 5 });
      s.sphere(0.035, { x: x + Math.cos(a) * 0.32, y: y + 0.13, z: z + Math.sin(a) * 0.32, sy: 1.5, mat: M.glow, color: C.lamp, glow: 3.2, seg: 6 });
    }
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      s.rod([x + Math.cos(a) * 0.32, y, z + Math.sin(a) * 0.32], [x, y + 0.55, z], 0.008, { color: C.gold, mat: M.metal, seg: 3 });
    }
    rope([x, y + 0.55, z], t, 0.012);
  };

  // composition
  const sackSpots = [
    [-4.9, -2.2, 0.5, 1.15], [-2.0, 1.9, 1.4, 1.3], [0.4, -2.6, 0.3, 1.0], [3.6, 1.4, 0.9, 1.25], [4.9, -2.9, 0.4, 0.95],
    [-4.3, 2.9, 0.9, 0.85], [1.5, 3.4, 2.2, 0.9], [-0.9, -0.9, 2.6, 0.8], [5.6, 1.0, 0.2, 0.75], [-5.6, -0.3, 1.7, 0.7], [2.1, -1.1, 3.2, 0.7],
  ];
  for (const [x, z, drop, sc] of sackSpots) sack(x, z, drop, sc, rng.range(0, Math.PI * 2));
  gondola(-1.6, -3.5, 2.6, 1.9, 0.25);
  gondola(3.1, 3.5, 3.4, 1.6, -0.2);
  gondola(-3.4, 0.9, 4.6, 1.5, 0.1);
  hammock(0.6, 1.5, 1.4, Math.PI / 2 + 0.2);
  hammock(-3.0, -1.6, 1.0, 0.4);
  hammock(4.3, -0.8, 2.0, 0.1);
  ladder(-2.6, -1.0, 6.5, 0.2);
  ladder(1.2, -3.8, 5.0, 0.6);
  ladder(4.6, 3.0, 3.5, 1.1);
  ladder(-5.6, 3.4, 4.2, 0.3);
  trapeze(-0.3, 0.6, 2.4);
  trapeze(0.6, 0.9, 3.1);
  rings(1.4, 0.35, 2.0);
  rings(-1.2, 3.3, 1.5);
  for (const [x, z, l] of [[-4.0, -3.6, 1.2], [2.9, -3.8, 1.9], [-6.0, 1.6, 0.9], [5.9, -1.8, 1.4], [0.2, 4.1, 1.1], [3.4, -0.2, 2.6], [-1.6, 4.2, 2.0]]) basket(x, z, l);
  for (const [x, z, l] of [[-2.7, 3.9, 0.8], [2.2, 2.1, 1.0], [-4.6, 1.3, 2.1], [5.2, 2.2, 1.2], [-0.4, -3.9, 1.5], [1.9, 0.6, 1.6]]) skin(x, z, l);
  for (const [x, z, l] of [[-3.7, -0.5, 0.7], [0.0, 2.6, 0.9], [3.0, -2.2, 0.6], [-1.2, -2.4, 1.1], [4.3, 4.0, 0.7], [-5.0, 4.0, 0.6]]) plant(x, z, l);
  for (const [x, z, l] of [[-1.4, 0.0, 1.6], [2.4, -0.1, 2.0], [-4.1, -1.4, 3.0], [0.9, -1.8, 1.0]]) chandelier(x, z, l);

  // a few pennants strung along the walkway in the accent colour
  for (let x = -NX + 0.5; x < NX - 0.5; x += 0.55) {
    const y = H(x, 0) + 0.9 - 0.25 * Math.sin(((x + NX) / (2 * NX)) * Math.PI);
    s.geo(new THREE.ConeGeometry(0.08, 0.18, 3).rotateX(Math.PI), { x, y: y - 0.08, z: 0, color: Math.round(x / 0.55) % 2 ? accent : '#f1e6cf', mat: M.cloth });
  }
  const pts = [];
  for (let x = -NX; x <= NX + 0.01; x += 0.5) pts.push([x, H(x, 0) + 0.9 - 0.25 * Math.sin(((x + NX) / (2 * NX)) * Math.PI) + 0.02, 0]);
  s.tube(pts, 0.008, { color: HEMP, mat: M.wood, rseg: 3 });
  // posts carrying the pennant line at both ends + mid
  for (const x of [-NX, 0, NX]) s.cyl(0.02, 0.02, 0.95, { x, y: H(x, 0), z: 0.0, color: C.darkwood, mat: M.wood, seg: 4 });

  world.add(b.build());
  const swing = s.build();
  world.add(swing);
  const sway = swayify(swing, { top: TOP + 0.2, len: 7, amp: 0.22, freq: 0.6, heave: 0.08, heaveR: 7.5, key: 'octavia' });

  /* --------------------------------------------- clouds in the chasm -- */
  const CLOUDS = 6, PUFFS = 8;
  const puff = new THREE.IcosahedronGeometry(1, 2);
  const clouds = new THREE.InstancedMesh(puff, new THREE.MeshStandardMaterial({ color: '#e6e1ea', roughness: 1, emissive: '#3a3448', emissiveIntensity: 0.3 }), CLOUDS * PUFFS);
  clouds.castShadow = false;
  clouds.receiveShadow = false;
  clouds.frustumCulled = false;
  const cloudDef = [];
  for (let c = 0; c < CLOUDS; c++) {
    const pf = [];
    for (let p = 0; p < PUFFS; p++) pf.push([rng.range(-1.1, 1.1), rng.range(-0.15, 0.35), rng.range(-0.5, 0.5), rng.range(0.35, 0.7)]);
    cloudDef.push({ x: rng.range(-2.4, 2.4), y: rng.range(2.6, 7.5), z0: rng(), speed: rng.range(0.12, 0.22) * (c % 2 ? 1 : 0.8), sc: rng.range(0.8, 1.25), pf });
  }
  world.traverse((o) => { if (o.geometry) o.geometry.rotateY(ROT); });
  world.add(clouds);
  // swifts wheeling in the gorge
  const NB = 16;
  const birdGeo = new THREE.BufferGeometry();
  birdGeo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0.06, -0.16, 0.03, -0.04, 0, 0, -0.02, 0, 0, 0.06, 0, 0, -0.02, 0.16, 0.03, -0.04], 3));
  birdGeo.computeVertexNormals();
  const birds = new THREE.InstancedMesh(birdGeo, new THREE.MeshBasicMaterial({ color: '#2a2630', side: THREE.DoubleSide }), NB);
  birds.frustumCulled = false;
  world.add(birds);
  const birdDef = [];
  for (let i = 0; i < NB; i++) birdDef.push({ r: rng.range(1.2, 3.2), y: rng.range(5, 10), sp: rng.range(0.35, 0.6) * rng.sign(), ph: rng.range(0, 6.28), cz: rng.range(-3, 3), ex: rng.range(0.5, 0.9) });
  const span = 14;
  const update = (t) => {
    sway.uTime.value = t;
    for (let i = 0; i < NB; i++) {
      const B = birdDef[i];
      const a = t * B.sp + B.ph;
      const lx = Math.cos(a) * B.r * B.ex, lz = B.cz + Math.sin(a) * B.r;
      const heading = Math.atan2(-Math.sin(a) * B.ex * B.sp, Math.cos(a) * B.sp); // tangent direction in (x,z)
      const flap = 1 + Math.sin(t * 9 + i) * 0.35;
      setInst(birds, i, lx * cR + lz * sR, B.y + Math.sin(t * 0.7 + i) * 0.3, -lx * sR + lz * cR, 1.7, heading + ROT, 0, Math.sin(t * 0.5 + i) * 0.2, flap);
    }
    birds.instanceMatrix.needsUpdate = true;
    let k = 0;
    for (const cl of cloudDef) {
      const u = ((cl.z0 + (t * cl.speed) / span) % 1 + 1) % 1; // 0..1 along the gorge
      const z = -span / 2 + u * span;
      const fade = Math.sin(Math.PI * u); // grow in, shrink out at the open ends
      const sc = cl.sc * Math.min(1, fade * 1.6);
      for (const [px, py, pz, pr] of cl.pf) {
        const lx = cl.x + px * cl.sc, lz = z + pz * cl.sc;
        setInst(clouds, k++, lx * cR + lz * sR, cl.y + py * cl.sc + Math.sin(t * 0.3 + px) * 0.05, -lx * sR + lz * cR, pr * sc, 0, 0, 0, pr * sc * 0.7);
      }
    }
    clouds.instanceMatrix.needsUpdate = true;
  };
  update(0);
  return { object, update };
}
