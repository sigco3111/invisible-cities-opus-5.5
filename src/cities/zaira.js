// Zaira — a city of high bastions, made not of its arches and stairs but of the
// relations between its measurements and the events of its past. Every lamppost,
// railing, flagpole, antenna and lightning rod is tied to the others by faint
// threads of memory; every surface is scratched and notched like the lines of a hand.
import { THREE, Builder, M, C, Lines, glowMat } from '../kit.js';

const IRON = '#3a3c42';
const AMBER = new THREE.Color('#ffb860');

export default function build({ rng, accent }) {
  const b = new Builder();
  const object = new THREE.Group();
  const anchors = []; // tips of every vertical thing: the knots of the web
  const anchor = (x, y, z, w = 1) => anchors.push({ p: [x, y, z], w });

  /* ---------------------------------------------------- the star bastion */
  const N = 6, RO = 10.25, RI = 7.6, H = 3.4;
  const star = [];
  for (let i = 0; i < N * 2; i++) {
    const a = (i / (N * 2)) * Math.PI * 2 + Math.PI / 2;
    const r = i % 2 === 0 ? RO : RI;
    star.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  const scaled = (k, dy = 0) => star.map(([x, z]) => [x * k, z * k]);
  // the dry ditch around the bastion
  b.cyl(10.45, 10.5, 0.06, { color: '#55575d', mat: M.stone, seg: 64 });
  // a battered talus, then the sheer wall, then the cordon and the parapet
  b.slab(scaled(1.0), 0.7, { color: '#7c7f86', mat: M.stone });
  b.slab(scaled(0.965), H - 0.7, { y: 0.7, color: '#8d9097', mat: M.stone });
  b.slab(scaled(0.975), 0.1, { y: H - 0.3, color: '#a4a5a6', mat: M.smooth });
  b.slab(scaled(0.955), 0.22, { y: H - 0.2, color: '#9a9b9c', mat: M.stone });
  const TOP = H + 0.02;
  // parapet walls on top of every face
  const edges = [];
  for (let i = 0; i < star.length; i++) {
    const A = star[i].map((v) => v * 0.94), B = star[(i + 1) % star.length].map((v) => v * 0.94);
    edges.push([A, B]);
    const len = Math.hypot(B[0] - A[0], B[1] - A[1]);
    const ang = Math.atan2(B[1] - A[1], B[0] - A[0]);
    b.box(len + 0.2, 0.42, 0.22, { x: (A[0] + B[0]) / 2, y: TOP, z: (A[1] + B[1]) / 2, ry: -ang, color: '#94969a' });
    // embrasures
    const nE = Math.floor(len / 0.7);
    for (let j = 0; j < nE; j++) {
      const t = (j + 0.5) / nE;
      b.box(0.3, 0.18, 0.24, { x: A[0] + (B[0] - A[0]) * t, y: TOP + 0.42, z: A[1] + (B[1] - A[1]) * t, ry: -ang, color: '#94969a' });
    }
    // scratches: tally marks in groups of five, all along the outer wall
    const nx = -(B[1] - A[1]) / len, nz = (B[0] - A[0]) / len; // outward-ish normal (CCW polygon)
    const groups = Math.floor(len / 0.55);
    for (let g = 0; g < groups; g++) {
      if (rng.chance(0.35)) continue;
      const t = (g + rng.range(0.1, 0.6)) / groups;
      const y = rng.range(0.9, H - 0.6);
      const px = (A[0] + (B[0] - A[0]) * t) / 0.94 * 0.965, pz = (A[1] + (B[1] - A[1]) * t) / 0.94 * 0.965;
      const cnt = rng.int(2, 5);
      for (let m = 0; m < cnt; m++) {
        const ox = (B[0] - A[0]) / len * m * 0.05, oz = (B[1] - A[1]) / len * m * 0.05;
        b.box(0.012, 0.16, 0.012, { x: px + ox - nx * 0.005, y, z: pz + oz - nz * 0.005, ry: -ang, color: '#4a4b50', mat: M.smooth });
      }
      if (cnt === 5) b.box(0.012, 0.25, 0.012, { x: px + (B[0] - A[0]) / len * 0.1, y: y - 0.02, z: pz + (B[1] - A[1]) / len * 0.1, ry: -ang, rz: 1.1, color: '#4a4b50', mat: M.smooth });
    }
  }
  // sentry turrets on every star point, each with a flagpole
  for (let i = 0; i < star.length; i += 2) {
    const [x, z] = star[i].map((v) => v * 0.9);
    b.cyl(0.42, 0.42, 1.0, { x, y: TOP, z, color: '#8d9097', seg: 10 });
    b.cone(0.55, 0.9, { x, y: TOP + 1.0, z, color: '#4d5560', seg: 10, mat: M.flat });
    b.cyl(0.015, 0.015, 1.6, { x, y: TOP + 1.8, z, color: IRON, seg: 4 });
    b.box(0.42, 0.24, 0.01, { x: x + 0.21, y: TOP + 3.1, z, color: accent, mat: M.cloth });
    anchor(x, TOP + 3.4, z, 2);
  }

  /* ---------------------------------------- the city on top of the bastion */
  const inside = (x, z) => Math.hypot(x, z) < 6.6;
  const lots = [];
  for (let t = 0; t < 6000 && lots.length < 46; t++) {
    const [x, z] = rng.inDisc(6.6, 2.7);
    const w = rng.range(0.8, 1.4), d = rng.range(0.8, 1.3);
    const rad = Math.max(w, d) * 0.65;
    if (!inside(x, z)) continue;
    // keep two crossing streets free
    const a = Math.atan2(z, x);
    if (Math.abs(Math.sin(a * 2 - 0.3)) < 0.18) continue;
    if (lots.some((o) => Math.hypot(o.x - x, o.z - z) < rad + o.rad + 0.28)) continue;
    lots.push({ x, z, w, d, rad, ry: -a + rng.range(-0.15, 0.15) });
  }
  const walls = ['#8a8f96', '#a49b8c', '#c9bda7', '#7d848f', '#b4a88f', '#9e9a92', '#c4b59a'];
  const roofs = ['#4d5560', '#5b5f66', '#3f454e', '#6b5a4c'];
  for (const p of lots) {
    const h = rng.range(1.8, 5.0) * (1 - Math.hypot(p.x, p.z) / 15);
    b.push({ x: p.x, y: TOP, z: p.z, ry: p.ry });
    const wall = rng.pick(walls);
    b.box(p.w, h, p.d, { color: wall });
    // windows: tall narrow, few lit
    const floors = Math.floor(h / 0.75);
    for (let f = 0; f < floors; f++) {
      for (const side of [1, -1]) {
        const n = Math.max(1, Math.floor(p.w / 0.45));
        for (let j = 0; j < n; j++) {
          const lit = rng.chance(0.28);
          b.quad(0.13, 0.3, { x: (j + 0.5) / n * p.w - p.w / 2, y: 0.42 + f * 0.75, z: side * (p.d / 2 + 0.012), ry: side > 0 ? 0 : Math.PI, mat: lit ? M.glow : M.smooth, color: lit ? C.lamp : '#2e3035', glow: 1.5 });
        }
      }
    }
    // roof: steep slate hip, or flat terrace with railing
    const flat = rng.chance(0.4);
    if (!flat) {
      b.geo(new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1).rotateY(Math.PI / 4).translate(0, 0.5, 0), { y: h, sx: p.w + 0.1, sz: p.d + 0.1, sy: 0.75, color: rng.pick(roofs), mat: M.flat });
    } else {
      b.box(p.w + 0.06, 0.08, p.d + 0.06, { y: h, color: '#a6a39c', mat: M.smooth });
    }
    b.pop();
    const c = Math.cos(p.ry), s = Math.sin(p.ry);
    const L = (lx, lz) => [p.x + c * lx + s * lz, p.z - s * lx + c * lz];
    const roofY = TOP + h + (flat ? 0.08 : 0.75);
    if (flat) {
      // roof railing
      const corners = [[-p.w / 2, -p.d / 2], [p.w / 2, -p.d / 2], [p.w / 2, p.d / 2], [-p.w / 2, p.d / 2]].map(([u, v]) => L(u * 0.95, v * 0.95));
      for (let k = 0; k < 4; k++) {
        const [ax, az] = corners[k], [bx, bz] = corners[(k + 1) % 4];
        b.rod([ax, roofY + 0.25, az], [bx, roofY + 0.25, bz], 0.01, { color: IRON });
        for (let m = 0; m <= 4; m++) { const t = m / 4; b.rod([ax + (bx - ax) * t, roofY, az + (bz - az) * t], [ax + (bx - ax) * t, roofY + 0.25, az + (bz - az) * t], 0.008, { color: IRON }); }
      }
      anchor(corners[0][0], roofY + 0.25, corners[0][1]);
      anchor(corners[2][0], roofY + 0.25, corners[2][1]);
    }
    const kind = rng.int(0, 3);
    const [tx, tz] = flat ? L(rng.range(-0.2, 0.2), rng.range(-0.2, 0.2)) : [p.x, p.z];
    if (kind === 0) { // lightning rod
      b.rod([tx, roofY, tz], [tx, roofY + 1.0, tz], 0.012, { color: IRON });
      b.sphere(0.04, { x: tx, y: roofY + 0.75, z: tz, color: '#c9a35b', mat: M.metal, seg: 6 });
      b.cone(0.02, 0.12, { x: tx, y: roofY + 1.0, z: tz, color: IRON, seg: 4 });
      anchor(tx, roofY + 1.1, tz);
    } else if (kind === 1) { // antenna with crossbars
      b.rod([tx, roofY, tz], [tx, roofY + 1.3, tz], 0.012, { color: IRON });
      for (let m = 0; m < 3; m++) { const y = roofY + 0.6 + m * 0.25, len = 0.35 - m * 0.08; b.rod([tx - c * len, y, tz + s * len], [tx + c * len, y, tz - s * len], 0.007, { color: IRON }); }
      anchor(tx, roofY + 1.3, tz);
    } else if (kind === 2) { // flagpole with pennant
      b.rod([tx, roofY, tz], [tx, roofY + 1.15, tz], 0.012, { color: '#d8d2c4' });
      b.geo(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0.4, -0.08, 0, 0, -0.18, 0], 3)), { x: tx, y: roofY + 1.12, z: tz, ry: rng() * 6, color: rng.chance(0.5) ? accent : '#b34a3a', mat: M.cloth });
      anchor(tx, roofY + 1.15, tz);
    } else { // chimney with a grating cowl
      const [cx, cz] = L(p.w * 0.3, 0);
      b.box(0.18, 0.5, 0.18, { x: cx, y: roofY - 0.4, z: cz, ry: p.ry, color: '#7a6a5c' });
      b.cyl(0.1, 0.1, 0.1, { x: cx, y: roofY + 0.1, z: cz, color: IRON, seg: 6 });
      anchor(cx, roofY + 0.2, cz, 0.6);
    }
    // a balcony with a railing on the street face
    if (h > 2.0 && rng.chance(0.6)) {
      const by = TOP + rng.range(1.2, h - 0.4);
      const [bx, bz] = L(0, p.d / 2 + 0.18);
      b.box(p.w * 0.6, 0.05, 0.36, { x: bx, y: by, z: bz, ry: p.ry, color: '#a6a39c', mat: M.smooth });
      const [r0x, r0z] = L(-p.w * 0.3, p.d / 2 + 0.35), [r1x, r1z] = L(p.w * 0.3, p.d / 2 + 0.35);
      b.rod([r0x, by + 0.25, r0z], [r1x, by + 0.25, r1z], 0.01, { color: IRON });
      for (let m = 0; m <= 6; m++) { const t = m / 6; b.rod([r0x + (r1x - r0x) * t, by, r0z + (r1z - r0z) * t], [r0x + (r1x - r0x) * t, by + 0.25, r0z + (r1z - r0z) * t], 0.006, { color: IRON }); }
      anchor(r0x, by + 0.25, r0z, 0.7);
      anchor(r1x, by + 0.25, r1z, 0.7);
    }
  }

  /* ---------------------- streets: lampposts, gratings, the central square */
  // paving of the bastion top
  b.slab(scaled(0.94), 0.02, { y: TOP - 0.01, color: '#6e7075', mat: M.smooth });
  b.cyl(2.6, 2.6, 0.03, { y: TOP, color: '#8a8c90', mat: M.smooth, seg: 48 });
  // the square is engraved like the palm of a hand
  const palm = [
    [[-1.9, -0.6], [-0.9, -0.2], [0.2, -0.3], [1.3, -0.9], [2.0, -1.4]], // heart line
    [[-2.0, 0.3], [-0.9, 0.5], [0.1, 0.9], [0.7, 1.6], [0.9, 2.2]], // head line
    [[-0.8, -2.2], [-0.6, -1.0], [-0.7, 0.4], [-1.2, 1.4], [-1.7, 1.8]], // life line
    [[0.6, -2.3], [0.4, -1.0], [0.3, 0.2], [0.35, 1.0]], // fate line
  ];
  for (const ln of palm) b.tube(ln.map(([x, z]) => [x, TOP + 0.035, z]), 0.03, { color: '#45474d', mat: M.smooth, tseg: 30, rseg: 4, sy: 0.3 });
  for (let i = 0; i < 26; i++) { // small creases
    const [x, z] = rng.inDisc(2.3);
    const a = rng() * Math.PI;
    b.box(rng.range(0.2, 0.5), 0.01, 0.02, { x, y: TOP + 0.03, z, ry: a, color: '#55575c', mat: M.smooth });
  }
  // gratings (drain grilles) across the streets
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.3;
    const r = rng.range(3.0, 6.2);
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    for (let m = 0; m < 5; m++) b.box(0.42, 0.015, 0.03, { x: x + Math.cos(a) * (m - 2) * 0.07, y: TOP + 0.01, z: z + Math.sin(a) * (m - 2) * 0.07, ry: -a + Math.PI / 2, color: '#26272b', mat: M.rough_metal });
  }
  // the lamppost of the square — its height is the measure of the hanged usurper's feet
  const LX = 0.9, LZ = 0.3, LH = 4.6;
  b.cyl(0.18, 0.24, 0.35, { x: LX, y: TOP, z: LZ, color: IRON, mat: M.rough_metal, seg: 8 });
  b.cyl(0.05, 0.08, LH, { x: LX, y: TOP + 0.3, z: LZ, color: IRON, mat: M.rough_metal, seg: 8 });
  for (let i = 1; i < 12; i++) b.torus(0.07, 0.012, { x: LX, y: TOP + 0.3 + i * (LH / 12), z: LZ, rx: Math.PI / 2, color: i % 2 ? '#c9a35b' : IRON, mat: M.metal, tseg: 10, rseg: 3 }); // graduations
  b.rod([LX, TOP + LH + 0.1, LZ], [LX + 0.55, TOP + LH + 0.2, LZ], 0.025, { color: IRON });
  b.cyl(0.13, 0.09, 0.3, { x: LX + 0.55, y: TOP + LH - 0.15, z: LZ, mat: M.glass, color: '#fff1d8', seg: 8 });
  b.sphere(0.09, { x: LX + 0.55, y: TOP + LH, z: LZ, color: C.lamp, mat: M.glow, glow: 4, seg: 8 });
  b.cone(0.18, 0.18, { x: LX + 0.55, y: TOP + LH + 0.15, z: LZ, color: IRON, seg: 8 });
  anchor(LX, TOP + LH + 0.35, LZ, 3);
  anchor(LX + 0.55, TOP + LH + 0.35, LZ, 3);
  // a railing at the edge of the square and the rope from the lamp to it
  const RAILA = [-1.9, TOP, 1.9], RAILB = [-0.3, TOP, 2.55];
  for (let m = 0; m <= 8; m++) { const t = m / 8; b.rod([RAILA[0] + (RAILB[0] - RAILA[0]) * t, TOP, RAILA[2] + (RAILB[2] - RAILA[2]) * t], [RAILA[0] + (RAILB[0] - RAILA[0]) * t, TOP + 0.45, RAILA[2] + (RAILB[2] - RAILA[2]) * t], 0.012, { color: IRON }); }
  b.rod([RAILA[0], TOP + 0.45, RAILA[2]], [RAILB[0], TOP + 0.45, RAILB[2]], 0.02, { color: IRON });
  const ropeEnd = [-1.1, TOP + 0.45, 2.22];
  const ropePts = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    ropePts.push([LX + 0.2 + (ropeEnd[0] - LX - 0.2) * t, TOP + LH - 0.4 + (ropeEnd[1] - TOP - LH + 0.4) * t - 0.6 * Math.sin(Math.PI * t), LZ + (ropeEnd[2] - LZ) * t]);
  }
  b.tube(ropePts, 0.02, { color: '#8a6a44', mat: M.wood, tseg: 30, rseg: 4 });
  anchor(...ropeEnd, 2);
  // street lamps
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + 0.15;
    const r = i % 2 ? 3.2 : 5.6;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (lots.some((o) => Math.hypot(o.x - x, o.z - z) < o.rad + 0.2)) continue;
    b.cyl(0.02, 0.03, 1.5, { x, y: TOP, z, color: IRON, seg: 5 });
    b.sphere(0.06, { x, y: TOP + 1.55, z, color: C.lamp, mat: M.glow, glow: 3, seg: 6 });
    anchor(x, TOP + 1.62, z, 1.2);
  }
  // stairs climbing the bastion from the plinth, with iron banisters
  for (const ia of [1, 7]) {
    const [x0, z0] = star[ia];
    const [x1, z1] = star[ia + 1];
    const ang = Math.atan2(z1 - z0, x1 - x0);
    const nx = Math.sin(ang), nz = -Math.cos(ang);
    const steps = 16;
    for (let s = 0; s < steps; s++) {
      const t = 0.25 + s * 0.028;
      const x = (x0 + (x1 - x0) * t) * 1.0 + nx * -0.25, z = (z0 + (z1 - z0) * t) * 1.0 + nz * -0.25;
      b.box(0.6, (s + 1) * (H / steps), 0.24, { x: x + nx * 0.0, z, ry: -ang + Math.PI / 2, color: '#7c7f86' });
      if (s % 3 === 0) b.rod([x - nx * 0.28, (s + 1) * (H / steps), z - nz * 0.28], [x - nx * 0.28, (s + 1) * (H / steps) + 0.4, z - nz * 0.28], 0.01, { color: IRON });
    }
  }

  object.add(b.build());

  /* --------------------------------------------- the web of memory (lines) */
  const lines = new Lines();
  const dims = new Lines();
  const P = anchors.map((a) => a.p);
  const pairs = [];
  const key = (i, j) => (i < j ? i * 10000 + j : j * 10000 + i);
  const seen = new Set();
  const addPair = (i, j) => { const k = key(i, j); if (i === j || seen.has(k)) return; seen.add(k); pairs.push([i, j]); };
  for (let i = 0; i < P.length; i++) {
    const d = P.map((q, j) => [Math.hypot(q[0] - P[i][0], q[1] - P[i][1], q[2] - P[i][2]), j]).sort((a, b) => a[0] - b[0]);
    const n = anchors[i].w > 1.5 ? 7 : 3;
    for (let k = 1; k <= n && k < d.length; k++) addPair(i, d[k][1]);
    if (rng.chance(0.35)) addPair(i, rng.int(0, P.length - 1)); // a long, improbable relation
  }
  for (const [i, j] of pairs) {
    const A = P[i], B = P[j];
    const len = Math.hypot(B[0] - A[0], B[2] - A[2]);
    const sag = len * 0.04;
    const col = rng.chance(0.15) ? '#f6e7c8' : '#ffb860';
    lines.rope(A, B, sag, col, 6, rng.range(0.35, 0.8));
  }
  // dimension lines: measured heights with little end ticks
  for (const a of anchors) {
    if (!rng.chance(0.18)) continue;
    const [x, y, z] = a.p;
    const ox = 0.18;
    dims.seg([x + ox, TOP + 0.05, z], [x + ox, y, z], '#dfe9ff', 0.6);
    dims.seg([x + ox - 0.08, TOP + 0.05, z], [x + ox + 0.08, TOP + 0.05, z], '#dfe9ff', 0.6);
    dims.seg([x + ox - 0.08, y, z], [x + ox + 0.08, y, z], '#dfe9ff', 0.6);
  }
  const webMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const web = lines.build(webMat);
  const dimMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.35, depthWrite: false, toneMapped: false });
  object.add(web, dims.build(dimMat));

  /* ------------------------- sparks of recollection travelling the web */
  const S = 70;
  const sparks = new THREE.InstancedMesh(new THREE.SphereGeometry(0.045, 6, 4), glowMat('#ffcf8a', 5), S);
  sparks.frustumCulled = false;
  object.add(sparks);
  const sp = [];
  for (let i = 0; i < S; i++) sp.push({ e: rng.int(0, pairs.length - 1), t: rng(), v: rng.range(0.08, 0.2), dir: 1 });
  const _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3();
  // adjacency so a spark can continue from one knot to the next
  const adj = P.map(() => []);
  pairs.forEach(([i, j], k) => { adj[i].push(k); adj[j].push(k); });
  let last = 0;

  return {
    object,
    update(t) {
      const dt = Math.min(0.1, Math.max(0, t - last));
      last = t;
      for (let i = 0; i < S; i++) {
        const s = sp[i];
        s.t += s.v * dt;
        if (s.t >= 1) {
          // arrive at the far knot, then follow another remembered relation
          const [a, bb] = pairs[s.e];
          const node = s.dir > 0 ? bb : a;
          const opts = adj[node];
          s.e = opts[(i * 7 + Math.floor(t * 13)) % opts.length];
          s.dir = pairs[s.e][0] === node ? 1 : -1;
          s.t = 0;
        }
        const [a, bb] = pairs[s.e];
        const A = P[s.dir > 0 ? a : bb], B = P[s.dir > 0 ? bb : a];
        const u = s.t;
        const len = Math.hypot(B[0] - A[0], B[2] - A[2]);
        _p.set(A[0] + (B[0] - A[0]) * u, A[1] + (B[1] - A[1]) * u - len * 0.04 * 4 * u * (1 - u), A[2] + (B[2] - A[2]) * u);
        const k = Math.sin(Math.PI * u);
        _s.setScalar(0.4 + 0.8 * k);
        sparks.setMatrixAt(i, _m.compose(_p, _q, _s));
      }
      sparks.instanceMatrix.needsUpdate = true;
      webMat.opacity = 0.45 + 0.15 * Math.sin(t * 0.5);
    },
  };
}
