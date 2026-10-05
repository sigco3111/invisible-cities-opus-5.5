// Cecilia — the pastures and the city have run together. Identical concrete blocks stand in rows,
// asphalt and strips of grass between them, scraps of the old meadow trapped in the grid: a dry-stone
// wall, a trough, a lone oak, grass on the roofs. Among them a goatherd, lost for years, drives what
// is left of his flock round and round the same corners. One by one the goats stay behind.
import { THREE, Builder, M, C, Lines, tree } from '../kit.js';

export default function build({ rng, accent }) {
  const b = new Builder();
  const object = new THREE.Group();
  const RY = 0.22;
  const P = 2.6; // grid pitch
  const rot = (u, v) => [u * Math.cos(RY) - v * Math.sin(RY), u * Math.sin(RY) + v * Math.cos(RY)];
  const ASPH = '#4a4c52', GRASS = '#86a95c', GRASS2 = '#79a052', CONC = '#c9c5bc', CONC2 = '#b9b5ac';

  b.cyl(10.35, 10.4, 0.1, { seg: 72, color: GRASS2 });
  // roads along the grid lines, each with a strip of grass down the middle
  const RW = 1.0;
  b.push({ ry: -RY });
  for (let k = -4; k <= 4; k++) {
    const c = k * P;
    const half = Math.sqrt(Math.max(0, 10.25 ** 2 - c * c)) - 0.05;
    if (half < 1) continue;
    for (const dir of [0, 1]) {
      if (dir === 1 && k % 2) continue; // cross-streets only every second line: the slabs are long
      b.push(dir ? { ry: Math.PI / 2 } : {});
      b.box(half * 2, 0.025, RW, { z: c, y: 0.1, color: ASPH });
      b.box(half * 2, 0.04, 0.22, { z: c, y: 0.1, color: GRASS });
      b.pop();
    }
  }
  b.pop();

  /* ------------------------------------------------------- the blocks -- */
  // the same block, again and again: a five-storey slab with a grid of windows
  const cells = [];
  for (let i = -4; i < 4; i += 2) {
    for (let j = -4; j < 4; j++) {
      const u = (i + 1) * P, v = (j + 0.5) * P;
      const [x, z] = rot(u, v);
      if (Math.hypot(x, z) > 9.3) continue;
      cells.push({ i, j, u, v, x, z });
    }
  }
  const remnant = new Set(['-2,1', '0,-2', '-4,-1', '2,1']); // cells where the old pasture survives
  const W = P - RW - 0.3; // block depth
  const WL = 2 * P - RW - 0.3; // block length
  for (const c of cells) {
    const key = `${c.i},${c.j}`;
    b.push({ x: c.x, z: c.z, ry: -RY });
    // a strip of lawn around each block
    b.box(2 * P - RW - 0.02, 0.04, P - RW - 0.02, { y: 0.1, color: GRASS });
    if (remnant.has(key)) {
      // a scrap of meadow left inside the grid
      const kind = [...remnant].indexOf(key);
      b.box(WL, 0.05, W, { y: 0.11, color: '#9cbb66', mat: M.flat });
      if (kind === 0) tree(b, { y: 0.14, h: 2.4, kind: 'round', color: '#5d8a45', r: rng });
      if (kind === 1) {
        for (let k = 0; k < 7; k++) b.box(0.24, 0.26, 0.2, { x: -0.6 + k * 0.22, y: 0.14, z: rng.range(-0.05, 0.05), ry: rng.range(-0.2, 0.2), color: rng.pick(['#b9ad94', '#a89c84', '#c8bca2']), mat: M.flat });
        b.box(0.5, 0.18, 0.22, { x: 0.3, y: 0.14, z: 0.5, color: '#8a8a86' }); // trough
        b.box(0.42, 0.02, 0.14, { x: 0.3, y: 0.31, z: 0.5, color: '#5f8fa0', mat: M.water });
      }
      if (kind === 2) {
        for (let k = 0; k < 5; k++) tree(b, { x: rng.range(-0.5, 0.5), y: 0.14, z: rng.range(-0.5, 0.5), h: rng.range(0.6, 0.9), kind: 'round', color: '#6f9a4a', r: rng });
      }
      if (kind === 3) {
        // a shepherd's hut, abandoned
        b.box(0.6, 0.45, 0.5, { y: 0.14, color: '#b9ad94', mat: M.flat });
        b.cone(0.5, 0.45, { y: 0.59, seg: 4, ry: Math.PI / 4, color: '#8a6a45', mat: M.flat });
      }
      b.pop();
      continue;
    }
    const h = 1.75;
    b.box(WL, h, W * 0.55, { y: 0.14, color: CONC, mat: M.stone });
    b.box(WL + 0.06, 0.08, W * 0.55 + 0.06, { y: 0.14 + h, color: CONC2 });
    // grass on the roof: the pasture has climbed up
    if ((c.i + c.j * 3) % 3 === 0) {
      b.box(WL - 0.1, 0.06, W * 0.55 - 0.1, { y: 0.22 + h, color: '#8fb35f', mat: M.flat });
      for (let k = 0; k < 5; k++) b.sphere(0.1, { x: rng.range(-WL / 3, WL / 3), y: 0.32 + h, z: rng.range(-0.15, 0.15), color: '#6f9a4a', mat: M.flat, seg: 5 });
    }
    // windows: exactly the same pattern on every block
    const cols = 14, rows = 3;
    for (let fi = 0; fi < rows; fi++) {
      for (let ci = 0; ci < cols; ci++) {
        const lit = ((ci * 7 + fi * 3 + c.i * 5 + c.j * 11) % 9) < 2;
        const wx = -WL / 2 + (ci + 0.5) * (WL / cols);
        const wy = 0.14 + 0.36 + fi * 0.5;
        for (const s of [-1, 1]) {
          b.quad(0.16, 0.24, { x: wx, y: wy, z: s * (W * 0.275 + 0.012), ry: s > 0 ? 0 : Math.PI, mat: lit ? M.glow : M.smooth, color: lit ? C.lamp : '#3a4250', glow: 1.5 });
        }
      }
    }
    // entrance canopy and a tiny bench
    b.box(0.4, 0.04, 0.22, { y: 0.62, z: W * 0.275 + 0.1, color: CONC2 });
    b.box(0.3, 0.45, 0.02, { y: 0.14, z: W * 0.275 + 0.011, color: '#5a4a3a' });
    b.pop();
  }
  // where the grid thins out at the rim, the old pasture shows through: tufts, thistles, hay bales
  const nearBlock = (x, z) => cells.some((c) => {
    const dx = x - c.x, dz = z - c.z;
    const u = dx * Math.cos(RY) + dz * Math.sin(RY), v = -dx * Math.sin(RY) + dz * Math.cos(RY);
    return Math.abs(u) < P + 0.1 && Math.abs(v) < P / 2 + 0.1;
  });
  const onRoad = (x, z) => {
    const u = x * Math.cos(RY) + z * Math.sin(RY), v = -x * Math.sin(RY) + z * Math.cos(RY);
    const dv = Math.abs(v - Math.round(v / P) * P), du = Math.abs(u - Math.round(u / (2 * P)) * 2 * P);
    return dv < RW / 2 + 0.1 || du < RW / 2 + 0.1;
  };
  for (let k = 0, n = 0; k < 900 && n < 70; k++) {
    const [x, z] = rng.inDisc(10.1, 5.5);
    if (nearBlock(x, z) || onRoad(x, z)) continue;
    n++;
    if (n % 7 === 0) {
      b.cyl(0.16, 0.16, 0.3, { x, y: 0.26, z, rz: Math.PI / 2, ry: rng.range(0, 3), seg: 12, color: '#d8b968', mat: M.flat });
    } else {
      for (let i = 0; i < 4; i++) b.cone(0.05, rng.range(0.1, 0.2), { x: x + rng.range(-0.12, 0.12), y: 0.1, z: z + rng.range(-0.12, 0.12), seg: 4, color: rng.pick(['#5f8a3f', '#6f9a4a', '#4f7a3a']), mat: M.flat });
      if (rng.chance(0.5)) b.sphere(0.03, { x, y: 0.22, z, color: rng.pick(['#f4efe4', '#e8c64a', '#b48ad0']), seg: 5 });
    }
  }
  // street lamps at the crossings
  for (let i = -3; i <= 3; i++) {
    for (let j = -3; j <= 3; j++) {
      const [x, z] = rot(i * P + RW * 0.42, j * P + RW * 0.42);
      if (Math.hypot(x, z) > 9.6 || (i + j) % 2) continue;
      b.cyl(0.02, 0.025, 0.9, { x, y: 0.1, z, color: '#6a6c72', seg: 5 });
      b.sphere(0.05, { x, y: 1.02, z, mat: M.glow, color: '#ffe0a8', glow: 2 });
    }
  }
  object.add(b.build());

  /* ------------------------------------------------- the lost route -- */
  const WP = [[0, 0], [0, 2], [2, 2], [2, -2], [-2, -2], [-2, 1], [0, 1], [0, 0]];
  const pts = WP.map(([i, j]) => rot(i * P + 0.18, j * P + 0.18));
  const seg = [];
  let L = 0;
  for (let k = 0; k < pts.length - 1; k++) {
    const len = Math.hypot(pts[k + 1][0] - pts[k][0], pts[k + 1][1] - pts[k][1]);
    seg.push({ a: pts[k], b: pts[k + 1], s0: L, len });
    L += len;
  }
  const at = (s, out) => {
    s = ((s % L) + L) % L;
    let k = 0;
    while (k < seg.length - 1 && s > seg[k].s0 + seg[k].len) k++;
    const sg = seg[k];
    const t = (s - sg.s0) / sg.len;
    out[0] = sg.a[0] + (sg.b[0] - sg.a[0]) * t;
    out[1] = sg.a[1] + (sg.b[1] - sg.a[1]) * t;
    out[2] = Math.atan2(sg.b[1] - sg.a[1], sg.b[0] - sg.a[0]);
    // distance to the nearest corner (goats bunch up and hesitate there)
    out[3] = Math.min(s - sg.s0, sg.s0 + sg.len - s);
    return out;
  };

  // goat geometry (one merged mesh with vertex colours)
  const gb = new Builder();
  gb.geo(new THREE.CapsuleGeometry(0.075, 0.2, 3, 8).rotateZ(Math.PI / 2), { y: 0.2, color: '#ffffff', mat: M.stone });
  for (const [lx, lz] of [[0.09, 0.05], [0.09, -0.05], [-0.09, 0.05], [-0.09, -0.05]]) gb.cyl(0.015, 0.015, 0.16, { x: lx, y: 0.03, z: lz, seg: 4, color: '#d8d2c4', mat: M.stone });
  gb.geo(new THREE.CapsuleGeometry(0.045, 0.07, 3, 6).rotateZ(-0.9), { x: 0.2, y: 0.3, color: '#ffffff', mat: M.stone });
  gb.cone(0.012, 0.09, { x: 0.2, y: 0.36, z: 0.025, rz: 0.5, color: '#4a3a2a', mat: M.stone, seg: 4 });
  gb.cone(0.012, 0.09, { x: 0.2, y: 0.36, z: -0.025, rz: 0.5, color: '#4a3a2a', mat: M.stone, seg: 4 });
  gb.cone(0.015, 0.06, { x: 0.25, y: 0.2, rz: Math.PI, color: '#e8e0d0', mat: M.stone, seg: 4 }); // beard
  gb.cone(0.02, 0.08, { x: -0.17, y: 0.25, rz: 1.2, color: '#ffffff', mat: M.stone, seg: 4 }); // tail
  const goatGeo = gb.build().children[0].geometry;
  const NG = 12;
  const goats = new THREE.InstancedMesh(goatGeo, M.stone, NG);
  goats.castShadow = true;
  const gcol = new THREE.Color();
  const GOATC = ['#f4efe4', '#f4efe4', '#8a6a45', '#3a3030', '#d8c8a8', '#f4efe4'];
  const herd = [];
  for (let i = 0; i < NG; i++) {
    goats.setColorAt(i, gcol.set(GOATC[i % GOATC.length]));
    herd.push({
      lag: 0.7 + i * 0.36 + rng.range(-0.12, 0.12),
      side: rng.range(-0.34, 0.34),
      ph: rng.range(0, 6.28),
      lost: i < 3 ? 1e9 : 8 + (NG - 1 - i) * 5.5, // the last of the flock go first
      lostSide: rng.chance(0.5) ? 1 : -1,
    });
  }
  object.add(goats);

  // the goatherd: cloak, hat, crook
  const hb = new Builder();
  hb.cone(0.11, 0.36, { color: '#6a5a44', seg: 8 });
  hb.sphere(0.06, { y: 0.41, color: '#c99470', seg: 8 });
  hb.cyl(0.12, 0.12, 0.015, { y: 0.45, color: '#4a3a2a', seg: 10 });
  hb.cyl(0.05, 0.06, 0.06, { y: 0.45, color: '#4a3a2a', seg: 8 });
  hb.rod([0.08, 0, 0.08], [0.1, 0.62, 0.08], 0.012, { color: '#8a6a45' });
  hb.torus(0.035, 0.01, { x: 0.135, y: 0.62, z: 0.08, arc: Math.PI, color: '#8a6a45' });
  const herder = hb.build();
  herder.scale.setScalar(1.45);
  object.add(herder);

  // a faint worn track: the same circuit, walked for years
  const track = new Lines();
  for (let k = 0; k < pts.length - 1; k++) track.seg([pts[k][0], 0.135, pts[k][1]], [pts[k + 1][0], 0.135, pts[k + 1][1]], '#a89a7c', 0.9);
  object.add(track.build(new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.45 })));

  const CYC = 64;
  const SPEED = 0.42;
  const tmp = [0, 0, 0, 0], tmp2 = [0, 0, 0, 0];
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), pv = new THREE.Vector3(), sv = new THREE.Vector3();
  const ease = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
  function update(t) {
    const c = t % CYC;
    const s0 = t * SPEED;
    at(s0, tmp);
    // the goatherd hesitates at corners, looking about
    herder.position.set(tmp[0], 0.13, tmp[1]);
    const look = tmp[3] < 0.5 ? Math.sin(t * 2.0) * 0.6 * (1 - tmp[3] / 0.5) : 0;
    herder.rotation.y = -tmp[2] + look;
    for (let i = 0; i < NG; i++) {
      const g = herd[i];
      const back = ease(c / 3); // at the start of each cycle the whole flock is found again
      let x, z, yaw, s = 1, bob = 0, graze = 0;
      if (c < g.lost) {
        const corner = at(s0 - g.lag, tmp2)[3];
        const squeeze = corner < 0.6 ? 0.4 + 0.6 * corner / 0.6 : 1; // frightened at street corners
        const sd = (g.side + 0.06 * Math.sin(t * 1.3 + g.ph)) * squeeze;
        x = tmp2[0] - Math.sin(tmp2[2]) * sd;
        z = tmp2[1] + Math.cos(tmp2[2]) * sd;
        yaw = -tmp2[2] + 0.2 * Math.sin(t * 0.9 + g.ph);
        bob = Math.abs(Math.sin(t * 7 + g.ph)) * 0.03;
        s = i >= 3 ? back : 1;
      } else {
        // left behind on a strip of grass, grazing, until it is gone
        at((g.lost * SPEED) + (t - c) * SPEED - g.lag, tmp2);
        const off = 0.55 * g.lostSide;
        x = tmp2[0] - Math.sin(tmp2[2]) * off;
        z = tmp2[1] + Math.cos(tmp2[2]) * off;
        yaw = -tmp2[2] + g.lostSide * 1.2;
        graze = 0.35 + 0.15 * Math.sin(t * 1.5 + g.ph);
        s = 1 - ease((c - g.lost - 5) / 3);
      }
      pv.set(x, 0.13 + bob, z);
      q.setFromEuler(e.set(0, yaw, -graze * 0.4, 'YXZ'));
      sv.setScalar(Math.max(0.001, s * 1.7));
      m4.compose(pv, q, sv);
      goats.setMatrixAt(i, m4);
    }
    goats.instanceMatrix.needsUpdate = true;
  }
  update(0);
  return { object, update };
}
