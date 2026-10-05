// Sophronia — two half-cities. On one side the fairground that stays: roller
// coaster, Ferris wheel, the carousel with its chains, the circus big top. On
// the other the city of stone, marble and cement — bank, ministry, factories,
// school — which is the temporary half: it is being taken apart and loaded on trailers.
import { THREE, Builder, M, C, column } from '../kit.js';
import { setInst, figure } from './_ab_util.js';

const ROT = 0.5; // the seam between the halves points at the usual viewpoint

export default function build({ rng, accent }) {
  const b = new Builder();
  const object = new THREE.Group();
  const world = new THREE.Group(); // animated parts, rotated like the baked geometry
  world.rotation.y = ROT;
  object.add(world);

  const RED = '#c8433a', CREAM = '#f4ead6', NAVY = '#2f4a73', YEL = '#e9b949';

  /* -------------------------------------------------------- ground -- */
  // fair half (x < 0): trodden earth and grass; stone half (x > 0): paving
  {
    const half = (sgn, n = 48) => {
      const pts = [];
      for (let i = 0; i <= n; i++) { const a = -Math.PI / 2 + (Math.PI * i) / n; pts.push([sgn * Math.cos(a) * 10.4, Math.sin(a) * 10.4]); }
      return pts;
    };
    b.slab(half(-1), 0.1, { color: '#b9a46e', mat: M.stone });
    b.slab(half(1), 0.12, { color: '#b9b4aa', mat: M.stone });
    // seam: a low kerb
    b.box(0.12, 0.16, 20.6, { x: 0, color: '#8f8a80', mat: M.stone });
    // grass patches and a sandy midway on the fair side
    for (let i = 0; i < 40; i++) {
      const [x, z] = rng.inDisc(9.6);
      if (x > -0.6) continue;
      b.disc(rng.range(0.4, 1.0), { x, y: 0.102 + i * 0.0002, z, sx: 1.3, ry: rng.range(0, 3), color: rng.pick(['#8ea25e', '#9aab66', '#a8b072', '#c7b07c']), mat: M.stone, seg: 12 });
    }
    // paving slabs on the stone side
    for (let x = 0.5; x < 10; x += 0.7) for (let z = -10; z < 10; z += 0.7) {
      if (x * x + z * z > 9.9 * 9.9 || rng.chance(0.55)) continue;
      b.box(0.66, 0.012, 0.66, { x: x + 0.33, y: 0.12, z: z + 0.33, color: rng.pick(['#c4bfb4', '#aea99e', '#cbc6bb']), mat: M.stone });
    }
  }

  /* -------------------------------------------- FAIRGROUND (x < 0) -- */
  // --- roller coaster ---
  const ctrl = [
    [-1.3, 0.9, 7.2], [-3.6, 1.3, 8.6], [-6.0, 4.6, 6.8], [-7.8, 1.2, 5.6], [-9.2, 2.2, 2.6], [-9.4, 5.6, -0.6], [-8.4, 1.4, -3.6],
    [-7.0, 6.8, -6.2], [-4.6, 1.0, -8.4], [-2.0, 3.6, -8.6], [-1.0, 0.9, -6.0], [-1.3, 2.9, -3.0], [-1.0, 1.2, 0.2], [-1.4, 4.2, 3.2],
  ].map(([x, y, z]) => new THREE.Vector3(x, y + 0.2, z));
  const track = new THREE.CatmullRomCurve3(ctrl, true, 'catmullrom', 0.4);
  const TN = 260;
  const tp = track.getSpacedPoints(TN);
  const up = new THREE.Vector3(0, 1, 0);
  for (const s of [-1, 1]) {
    const rail = [];
    for (let i = 0; i <= TN; i++) {
      const tan = track.getTangentAt(i / TN);
      const side = new THREE.Vector3().crossVectors(tan, up).normalize().multiplyScalar(0.16 * s);
      rail.push(tp[i].clone().add(side));
    }
    b.tube(rail, 0.035, { color: RED, mat: M.smooth, tseg: TN * 2, rseg: 5, closed: true });
  }
  for (let i = 0; i < TN; i += 2) {
    const tan = track.getTangentAt(i / TN);
    const p = tp[i];
    b.box(0.4, 0.035, 0.07, { x: p.x, y: p.y - 0.05, z: p.z, ry: Math.atan2(tan.x, tan.z) + Math.PI / 2, color: '#6a4a36', mat: M.wood });
  }
  // white lattice supports
  for (let i = 0; i < TN; i += 7) {
    const p = tp[i];
    if (p.y < 0.5) continue;
    b.cyl(0.04, 0.05, p.y - 0.1, { x: p.x, y: 0.1, z: p.z, color: CREAM, mat: M.smooth, seg: 6 });
    b.cyl(0.11, 0.13, 0.08, { x: p.x, y: 0.1, z: p.z, color: '#9b9488', mat: M.stone, seg: 8 });
    if (p.y > 2) {
      const q = tp[(i + 7) % TN];
      b.rod([p.x, 0.15, p.z], [q.x, Math.min(q.y, p.y) - 0.15, q.z], 0.015, { color: CREAM, mat: M.smooth, seg: 4 });
      for (let y = 1.2; y < p.y - 0.3; y += 1.2) b.rod([p.x, y, p.z], [q.x, Math.min(y, q.y - 0.1), q.z], 0.015, { color: CREAM, mat: M.smooth, seg: 4 });
    }
  }
  // station platform
  b.box(1.2, 0.5, 2.0, { x: -1.0, y: 0.1, z: 0.4, color: '#e5d6b8', mat: M.wood });
  b.geo(new THREE.ConeGeometry(1.0, 0.5, 4).rotateY(Math.PI / 4).translate(0, 0.25, 0), { x: -1.0, y: 1.6, z: 0.4, sz: 1.5, color: RED, mat: M.flat });
  for (const [ox, oz] of [[-0.45, -0.85], [0.45, -0.85], [-0.45, 0.85], [0.45, 0.85]]) b.cyl(0.03, 0.03, 1.0, { x: -1.0 + ox, y: 0.6, z: 0.4 + oz, color: CREAM, mat: M.smooth, seg: 5 });
  // coaster cars
  const cars = [];
  for (let k = 0; k < 3; k++) {
    const cb = new Builder();
    cb.box(0.34, 0.16, 0.42, { y: 0.02, color: k === 0 ? YEL : accent, mat: M.smooth });
    cb.box(0.3, 0.1, 0.08, { y: 0.18, z: -0.12, color: CREAM, mat: M.smooth });
    figure(cb, { y: 0.06, z: 0.04, h: 0.26, color: rng.pick([NAVY, RED, '#4f8fc9']), arms: 1.2 });
    for (const sx of [-0.15, 0.15]) for (const sz of [-0.14, 0.14]) cb.cyl(0.045, 0.045, 0.04, { x: sx, z: sz, y: 0.02, rz: Math.PI / 2, color: '#333', mat: M.metal, seg: 8 });
    const g = cb.build();
    world.add(g);
    cars.push(g);
  }

  // --- Ferris wheel ---
  const FW = { x: -4.8, z: -2.2, y: 3.9, R: 2.9 };
  {
    // A-frame legs on both sides of the wheel plane (plane facing +z)
    for (const sz of [-0.5, 0.5]) {
      b.rod([FW.x - 1.7, 0.1, FW.z + sz * 1.2], [FW.x, FW.y, FW.z + sz * 0.4], 0.07, { color: CREAM, mat: M.smooth, seg: 8 });
      b.rod([FW.x + 1.7, 0.1, FW.z + sz * 1.2], [FW.x, FW.y, FW.z + sz * 0.4], 0.07, { color: CREAM, mat: M.smooth, seg: 8 });
      b.rod([FW.x - 1.2, 1.3, FW.z + sz * 1.0], [FW.x + 1.2, 1.3, FW.z + sz * 1.0], 0.04, { color: CREAM, mat: M.smooth, seg: 6 });
    }
    b.rod([FW.x, FW.y, FW.z - 0.45], [FW.x, FW.y, FW.z + 0.45], 0.08, { color: '#8a8f96', mat: M.metal });
    b.box(1.6, 0.3, 1.3, { x: FW.x, y: 0.1, z: FW.z, color: '#e5d6b8', mat: M.wood });
    b.box(0.5, 0.6, 0.5, { x: FW.x + 1.1, y: 0.1, z: FW.z + 0.9, color: RED, mat: M.smooth });
  }
  const wheel = (() => {
    const wb = new Builder();
    for (const z of [-0.22, 0.22]) {
      wb.torus(FW.R, 0.045, { z, color: CREAM, mat: M.smooth, tseg: 64, rseg: 6 });
      wb.torus(FW.R * 0.55, 0.03, { z, color: RED, mat: M.smooth, tseg: 48, rseg: 5 });
      for (let k = 0; k < 12; k++) {
        const a = (k / 12) * Math.PI * 2;
        wb.rod([0, 0, z], [Math.cos(a) * FW.R, Math.sin(a) * FW.R, z], 0.02, { color: CREAM, mat: M.smooth, seg: 4 });
        wb.rod([Math.cos(a) * FW.R, Math.sin(a) * FW.R, z], [Math.cos(a + Math.PI / 12) * FW.R * 0.55, Math.sin(a + Math.PI / 12) * FW.R * 0.55, z], 0.012, { color: CREAM, mat: M.smooth, seg: 3 });
      }
    }
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2;
      wb.rod([Math.cos(a) * FW.R, Math.sin(a) * FW.R, -0.3], [Math.cos(a) * FW.R, Math.sin(a) * FW.R, 0.3], 0.02, { color: '#8a8f96', mat: M.metal, seg: 5 });
      // bulbs along the rim
      for (let j = 0; j < 3; j++) {
        const aa = a + (j / 3) * (Math.PI / 6);
        wb.sphere(0.04, { x: Math.cos(aa) * FW.R, y: Math.sin(aa) * FW.R, z: 0.26, mat: M.glow, color: j % 2 ? C.lamp : '#ffd9a0', glow: 2.6, seg: 5 });
      }
    }
    wb.cyl(0.25, 0.25, 0.6, { y: -0.3, rx: Math.PI / 2, color: RED, mat: M.smooth, seg: 12 });
    const g = wb.build();
    g.position.set(FW.x, FW.y, FW.z);
    world.add(g);
    return g;
  })();
  // gondolas (cages) that stay level
  const gondGeo = (() => {
    const gb = new Builder();
    gb.box(0.36, 0.05, 0.3, { y: -0.48, color: '#e5d6b8', mat: M.smooth });
    for (const [ox, oz] of [[-0.16, -0.13], [0.16, -0.13], [-0.16, 0.13], [0.16, 0.13]]) gb.cyl(0.012, 0.012, 0.38, { x: ox, y: -0.45, z: oz, color: '#d9d4c8', mat: M.smooth, seg: 3 });
    gb.box(0.36, 0.14, 0.3, { y: -0.46, color: '#ffffff', mat: M.smooth });
    gb.geo(new THREE.ConeGeometry(0.27, 0.16, 4).rotateY(Math.PI / 4), { y: -0.0, color: '#ffffff', mat: M.smooth });
    gb.cyl(0.015, 0.015, 0.12, { y: -0.08, color: '#8a8f96', mat: M.smooth, seg: 4 });
    return gb.build().children[0].geometry;
  })();
  const gondMat = new THREE.MeshStandardMaterial({ roughness: 0.5 });
  const gonds = new THREE.InstancedMesh(gondGeo, gondMat, 12);
  const gcols = [RED, YEL, NAVY, accent, '#e889a8', '#7fb0d6'];
  for (let k = 0; k < 12; k++) gonds.setColorAt(k, new THREE.Color(gcols[k % gcols.length]));
  gonds.frustumCulled = false;
  gonds.castShadow = true;
  world.add(gonds);

  // --- the carousel with its chains (a chair-swing ride) ---
  const SW = { x: -6.9, z: 2.4, top: 3.2 };
  b.cyl(0.18, 0.24, SW.top, { x: SW.x, y: 0.1, z: SW.z, color: CREAM, mat: M.smooth, seg: 12 });
  b.cyl(1.0, 1.1, 0.18, { x: SW.x, y: 0.1, z: SW.z, color: '#e5d6b8', mat: M.wood, seg: 24 });
  for (let k = 0; k < 16; k++) { const a = (k / 16) * Math.PI * 2; b.cyl(0.03, 0.03, 0.5, { x: SW.x + Math.cos(a) * 2.5, y: 0.1, z: SW.z + Math.sin(a) * 2.5, color: '#9a8f80', mat: M.wood, seg: 4 }); }
  const swing = (() => {
    const sb = new Builder();
    // striped canopy
    for (let k = 0; k < 16; k++) {
      sb.geo(new THREE.ConeGeometry(1.35, 0.7, 2, 1, true, (k / 16) * Math.PI * 2, Math.PI / 8), { y: 0.35, color: k % 2 ? RED : CREAM, mat: M.cloth });
      sb.geo(new THREE.CylinderGeometry(1.35, 1.35, 0.22, 2, 1, true, (k / 16) * Math.PI * 2, Math.PI / 8), { y: -0.11, color: k % 2 ? CREAM : RED, mat: M.cloth });
    }
    sb.sphere(0.12, { y: 0.78, color: C.gold, mat: M.metal, seg: 8 });
    // chains and chairs flying outward
    const ang = 0.55, L = 1.5;
    for (let k = 0; k < 14; k++) {
      const a = (k / 14) * Math.PI * 2;
      const r0 = 1.2;
      const hx = Math.cos(a) * r0, hz = Math.sin(a) * r0;
      const cx = Math.cos(a) * (r0 + Math.sin(ang) * L), cz = Math.sin(a) * (r0 + Math.sin(ang) * L), cy = -0.2 - Math.cos(ang) * L;
      const tx = -Math.sin(a) * 0.08, tz = Math.cos(a) * 0.08;
      sb.rod([hx + tx, -0.2, hz + tz], [cx + tx, cy + 0.15, cz + tz], 0.007, { color: '#c9c9c9', mat: M.smooth, seg: 3 });
      sb.rod([hx - tx, -0.2, hz - tz], [cx - tx, cy + 0.15, cz - tz], 0.007, { color: '#c9c9c9', mat: M.smooth, seg: 3 });
      sb.box(0.18, 0.05, 0.16, { x: cx, y: cy, z: cz, ry: -a, rz: -ang, color: [YEL, accent, RED, '#7fb0d6'][k % 4], mat: M.smooth });
      sb.box(0.18, 0.16, 0.03, { x: cx - Math.cos(a) * 0.08, y: cy + 0.07, z: cz - Math.sin(a) * 0.08, ry: -a + Math.PI / 2, rz: 0, color: [YEL, accent, RED, '#7fb0d6'][k % 4], mat: M.smooth });
      if (k % 2 === 0) figure(sb, { x: cx, y: cy + 0.02, z: cz, h: 0.24, color: rng.pick([NAVY, '#e889a8', '#f4efe2']), ry: -a + Math.PI / 2, arms: 1 });
      sb.sphere(0.035, { x: Math.cos(a + 0.2) * 1.33, y: -0.2, z: Math.sin(a + 0.2) * 1.33, mat: M.glow, color: C.lamp, glow: 2.5, seg: 5 });
    }
    const g = sb.build();
    g.position.set(SW.x, SW.top + 0.1, SW.z);
    world.add(g);
    return g;
  })();

  // --- circus big top, open at the front, trapezes in the middle ---
  const BT = { x: -3.8, z: 4.2, R: 2.1 };
  const prof = [[0.06, 3.5], [0.5, 3.0], [1.1, 2.3], [1.7, 1.85], [2.15, 1.65]];
  const gores = 18;
  for (let k = 0; k < gores; k++) {
    const p0 = (k / gores) * Math.PI * 2, pl = (Math.PI * 2) / gores;
    const col = k % 2 ? RED : CREAM;
    b.geo(new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 2, p0, pl), { x: BT.x, z: BT.z, color: col, mat: M.cloth });
    // sidewall, open where the flaps are drawn back (facing +z/ +x, toward the viewer)
    const mid = p0 + pl / 2;
    const facing = Math.sin(mid) * Math.cos(0) + 0; // lathe angle -> (sin, cos) in x/z
    const open = Math.cos(mid - 0.35) > 0.62; // a wide doorway
    if (!open) b.geo(new THREE.CylinderGeometry(2.15, 2.15, 1.55, 2, 1, true, p0, pl), { x: BT.x, y: 0.1 + 0.775, z: BT.z, color: k % 2 ? CREAM : RED, mat: M.cloth });
    void facing;
    // scalloped valance
    b.geo(new THREE.ConeGeometry(0.12, 0.2, 3).rotateX(Math.PI), { x: BT.x + Math.sin(mid) * 2.17, y: 1.55, z: BT.z + Math.cos(mid) * 2.17, color: k % 2 ? YEL : NAVY, mat: M.cloth });
  }
  // king poles and flags
  b.cyl(0.05, 0.06, 4.2, { x: BT.x, y: 0.1, z: BT.z, color: '#d9d0bd', mat: M.smooth, seg: 6 });
  b.box(0.5, 0.3, 0.01, { x: BT.x + 0.26, y: 3.95, z: BT.z, color: accent, mat: M.cloth });
  for (let k = 0; k < gores; k += 2) { const a = (k / gores) * Math.PI * 2; b.cyl(0.02, 0.02, 1.7, { x: BT.x + Math.sin(a) * 2.25, y: 0.1, z: BT.z + Math.cos(a) * 2.25, color: '#d9d0bd', mat: M.smooth, seg: 4 }); }
  // the ring inside, benches, a performer
  b.cyl(1.0, 1.0, 0.1, { x: BT.x, y: 0.1, z: BT.z, color: '#d8b07a', mat: M.stone, seg: 24 });
  b.torus(1.0, 0.06, { x: BT.x, y: 0.2, z: BT.z, rx: Math.PI / 2, color: RED, mat: M.smooth, tseg: 28, rseg: 5 });
  for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2 + 0.3; if (Math.cos(a - 0.35) > 0.5) continue; b.box(0.7, 0.2 + (k % 2) * 0.1, 0.25, { x: BT.x + Math.sin(a) * 1.7, y: 0.1, z: BT.z + Math.cos(a) * 1.7, ry: a, color: NAVY, mat: M.wood }); }
  figure(b, { x: BT.x + 0.2, y: 0.2, z: BT.z, h: 0.32, color: YEL, arms: 1 });
  b.sphere(0.16, { x: BT.x - 0.3, y: 0.36, z: BT.z + 0.2, color: '#7fb0d6', mat: M.smooth });
  // trapezes: two bars on long ropes swinging from the king pole crossbar
  b.rod([BT.x - 1.0, 2.75, BT.z], [BT.x + 1.0, 2.75, BT.z], 0.02, { color: '#8a8f96', mat: M.metal, seg: 4 });
  b.sphere(0.07, { x: BT.x, y: 2.95, z: BT.z, mat: M.glow, color: C.lamp, glow: 3 });
  const trapezes = [-0.6, 0.6].map((ox, k) => {
    const tb = new Builder();
    tb.rod([-0.18, 0, 0], [-0.18, -1.1, 0], 0.006, { color: '#ddd', seg: 3 });
    tb.rod([0.18, 0, 0], [0.18, -1.1, 0], 0.006, { color: '#ddd', seg: 3 });
    tb.rod([-0.2, -1.1, 0], [0.2, -1.1, 0], 0.014, { color: C.gold, mat: M.metal, seg: 4 });
    // an acrobat hanging by the hands
    tb.rod([-0.06, -1.1, 0], [0, -1.25, 0], 0.012, { color: '#e8c4a6', mat: M.smooth, seg: 3 });
    tb.rod([0.06, -1.1, 0], [0, -1.25, 0], 0.012, { color: '#e8c4a6', mat: M.smooth, seg: 3 });
    tb.cyl(0.04, 0.03, 0.2, { y: -1.47, color: k ? '#e889a8' : accent, mat: M.smooth, seg: 6 });
    tb.sphere(0.04, { y: -1.22, color: '#e8c4a6', mat: M.smooth, seg: 6 });
    tb.rod([0, -1.47, 0], [0, -1.62, 0.02], 0.012, { color: k ? '#e889a8' : accent, mat: M.smooth, seg: 3 });
    const g = tb.build();
    g.position.set(BT.x + ox, 2.75, BT.z);
    world.add(g);
    return g;
  });

  // strings of bulbs over the midway
  const bulbs = (a, c, n = 10, sag = 0.4) => {
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const p = [a[0] + (c[0] - a[0]) * t, a[1] + (c[1] - a[1]) * t - sag * 4 * t * (1 - t), a[2] + (c[2] - a[2]) * t];
      pts.push(p);
      if (i > 0 && i < n) b.sphere(0.045, { x: p[0], y: p[1] - 0.04, z: p[2], mat: M.glow, color: i % 3 === 0 ? '#ffb0a0' : C.lamp, glow: 2.6, seg: 5 });
    }
    b.tube(pts, 0.006, { color: '#333', mat: M.smooth, rseg: 3 });
  };
  const posts = [[-2.2, 6.6], [-5.9, 5.6], [-8.3, 2.6], [-8.0, -1.6], [-2.1, 1.4], [-2.4, -4.6], [-6.2, -5.4]];
  for (const [x, z] of posts) { b.cyl(0.035, 0.035, 2.4, { x, y: 0.1, z, color: '#d9d0bd', mat: M.smooth, seg: 5 }); b.sphere(0.07, { x, y: 2.55, z, color: C.gold, mat: M.metal, seg: 6 }); }
  bulbs([-2.2, 2.4, 6.6], [-5.9, 2.4, 5.6]);
  bulbs([-5.9, 2.4, 5.6], [-8.3, 2.4, 2.6], 8);
  bulbs([-2.1, 2.4, 1.4], [-2.2, 2.4, 6.6], 12);
  bulbs([-2.1, 2.4, 1.4], [-2.4, 2.4, -4.6], 14);
  bulbs([-2.4, 2.4, -4.6], [-6.2, 2.4, -5.4], 9);
  // booths and a crowd
  for (const [x, z, col] of [[-1.9, -1.4, RED], [-1.9, 3.1, NAVY], [-6.6, -0.4, YEL], [-3.2, 7.4, accent], [-8.3, -1.9, RED]]) {
    b.box(0.8, 0.7, 0.6, { x, y: 0.1, z, color: CREAM, mat: M.wood });
    for (let k = 0; k < 4; k++) b.box(0.2, 0.03, 0.45, { x: x - 0.3 + k * 0.2, y: 0.85, z: z + 0.18, rx: -0.3, color: k % 2 ? CREAM : col, mat: M.cloth });
    b.quad(0.5, 0.25, { x, y: 0.55, z: z + 0.31, color: C.lamp, mat: M.glow, glow: 1.5 });
  }
  for (let i = 0; i < 40; i++) {
    const [x, z] = rng.inDisc(9.3);
    if (x > -0.7) continue;
    if (Math.hypot(x - BT.x, z - BT.z) < 2.4 || Math.hypot(x - SW.x, z - SW.z) < 2.7 || (Math.abs(x - FW.x) < 1.9 && Math.abs(z - FW.z) < 1)) continue;
    figure(b, { x, y: 0.1, z, h: 0.3, color: rng.pick([RED, NAVY, YEL, '#f4efe2', accent, '#e889a8']), ry: rng.range(0, 6) });
    if (rng.chance(0.2)) { b.rod([x + 0.06, 0.3, z], [x + 0.06, 0.65, z], 0.004, { color: '#eee', seg: 3 }); b.sphere(0.07, { x: x + 0.06, y: 0.72, z, color: rng.pick([RED, YEL, '#7fb0d6']), mat: M.smooth, seg: 8 }); }
  }

  /* --------------------------------------- the STONE half (x > 0) -- */
  const MARBLE = '#ece6da', TRAV = '#d9cdb5', CEM = '#b8b3a8', BRICK = '#a5583c';
  const pediment = (bb, x, y, z, w, d, h, col, ry = 0) => {
    const s = new THREE.Shape([new THREE.Vector2(-w / 2, 0), new THREE.Vector2(w / 2, 0), new THREE.Vector2(0, h)]);
    const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false });
    g.translate(0, 0, -d / 2);
    bb.geo(g, { x, y, z, ry, color: col, mat: M.smooth });
  };
  const temple = (bb, { x, z, w, d, h, cols, col = MARBLE, ry = 0, dome = false, y = 0.12 }) => {
    bb.push({ x, y, z, ry });
    bb.box(w + 0.3, 0.25, d + 0.3, { color: col, mat: M.smooth });
    for (let i = 0; i < 3; i++) bb.box(w * 0.6, 0.08, 0.15, { y: 0.25 - (i + 1) * 0.08, z: d / 2 + 0.2 + i * 0.12, color: col, mat: M.smooth });
    bb.box(w * 0.92, h, d * 0.72, { y: 0.25, z: -d * 0.12, color: col, mat: M.stone });
    for (let i = 0; i < cols; i++) column(bb, { x: -w / 2 + 0.2 + ((w - 0.4) * i) / (cols - 1), y: 0.25, z: d / 2 - 0.12, r: 0.09, h, color: col });
    bb.box(w + 0.1, 0.18, d + 0.05, { y: 0.25 + h, color: col, mat: M.smooth });
    pediment(bb, 0, 0.43 + h, 0, w + 0.1, d + 0.05, 0.55, col);
    // tall windows along the sides of the body
    const bz0 = -d * 0.12, bd = d * 0.72;
    for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
      const lit = rng.chance(0.35);
      bb.quad(0.2, 0.42, { x: sx * (w * 0.46 + 0.012), y: 0.55 + j * h * 0.48, z: bz0 - bd / 2 + (i + 0.5) * (bd / 3), ry: sx * Math.PI / 2, color: lit ? C.lamp : '#4a4542', mat: lit ? M.glow : M.smooth, glow: 1.4 });
    }
    bb.quad(0.4, 0.8, { y: 0.65, z: bz0 + bd / 2 + 0.012, color: '#3a3532', mat: M.smooth });
    bb.pop();
  };
  // the bank (intact, but its columns are numbered for removal: a few are already gone)
  temple(b, { x: 6.2, z: -4.6, w: 2.6, d: 2.0, h: 1.7, cols: 6, col: MARBLE, ry: -0.2 });
  // the school with its little bell tower, half-dismantled (one wing is just a frame)
  {
    const x = 3.6, z = 4.4;
    b.box(2.6, 1.6, 1.4, { x, y: 0.12, z, color: '#e2d2b0', mat: M.stone });
    for (let i = 0; i < 5; i++) for (let j = 0; j < 2; j++) b.quad(0.26, 0.4, { x: x - 1.0 + i * 0.5, y: 0.55 + j * 0.65, z: z + 0.711, color: rng.chance(0.4) ? C.lamp : '#3c3a3a', mat: rng.chance(0.4) ? M.glow : M.smooth, glow: 1.5 });
    b.geo(new THREE.ConeGeometry(1.0, 0.5, 4).rotateY(Math.PI / 4).translate(0, 0.25, 0), { x, y: 1.72, z, sx: 1.9, sz: 1.05, color: '#8c6b5a', mat: M.flat });
    b.box(0.5, 1.0, 0.5, { x, y: 2.0, z, color: '#e2d2b0', mat: M.stone });
    b.cone(0.42, 0.6, { x, y: 3.0, z, seg: 4, ry: Math.PI / 4, color: '#8c6b5a', mat: M.flat });
    b.geo(new THREE.CircleGeometry(0.15, 16), { x, y: 2.6, z: z + 0.252, color: '#fbf6ea', mat: M.smooth });
    // the stripped wing: only a scaffold frame
    for (let i = 0; i <= 3; i++) for (const zz of [-0.6, 0.6]) b.cyl(0.03, 0.03, 1.6, { x: x + 1.4 + i * 0.4, y: 0.12, z: z + zz, color: '#9a8f80', mat: M.wood, seg: 4 });
    for (const y of [0.9, 1.7]) for (const zz of [-0.6, 0.6]) b.rod([x + 1.4, y, z + zz], [x + 2.6, y, z + zz], 0.02, { color: '#9a8f80', mat: M.wood, seg: 4 });
    b.box(1.3, 0.04, 1.3, { x: x + 2.0, y: 0.9, z, color: '#b48b5d', mat: M.wood });
  }
  // factories with sawtooth roofs and chimneys
  {
    const x = 4.2, z = -8.0;
    b.box(3.2, 1.2, 1.6, { x, y: 0.12, z, color: BRICK, mat: M.stone });
    for (let i = 0; i < 4; i++) {
      const s = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(0.8, 0), new THREE.Vector2(0, 0.55)]);
      const g = new THREE.ExtrudeGeometry(s, { depth: 1.6, bevelEnabled: false }); g.translate(0, 0, -0.8);
      b.geo(g, { x: x - 1.6 + i * 0.8, y: 1.32, z, color: '#7f6f66', mat: M.flat });
      b.quad(0.5, 0.4, { x: x - 1.6 + i * 0.8 + 0.01, y: 1.55, z, ry: -Math.PI / 2, color: C.lamp, mat: M.glow, glow: 1.4 });
    }
    for (const [cx, h] of [[x + 1.9, 3.6], [x + 2.4, 2.8]]) {
      b.cyl(0.16, 0.22, h, { x: cx, y: 0.12, z: z + 0.3, color: BRICK, mat: M.stone, seg: 10 });
      b.cyl(0.2, 0.2, 0.12, { x: cx, y: 0.12 + h, z: z + 0.3, color: '#7c3f2b', mat: M.stone, seg: 10 });
    }
  }
  // palaces with rusticated bases and rows of windows
  const palace = (x, z, w, d, floors, col, ry = 0) => {
    b.push({ x, y: 0.12, z, ry });
    b.box(w, 0.55, d, { color: '#bfb6a6', mat: M.stone });
    for (let k = 0; k < 3; k++) b.box(w + 0.02, 0.03, d + 0.02, { y: 0.12 + k * 0.15, color: '#a99f8e', mat: M.stone });
    b.box(w - 0.06, floors * 0.6, d - 0.06, { y: 0.55, color: col, mat: M.stone });
    b.box(w + 0.12, 0.1, d + 0.12, { y: 0.55 + floors * 0.6, color: '#efe8da', mat: M.smooth });
    for (let i = 0; i < Math.round(w / 0.4); i++) b.box(0.05, 0.16, 0.05, { x: -w / 2 + 0.2 + i * 0.4, y: 0.65 + floors * 0.6, z: d / 2, color: '#efe8da', mat: M.smooth });
    const nx = Math.max(2, Math.round(w / 0.42));
    for (let f = 0; f < floors; f++) for (let i = 0; i < nx; i++) {
      const lit = rng.chance(0.3);
      const xx = -w / 2 + (i + 0.5) * (w / nx);
      b.quad(0.16, 0.32, { x: xx, y: 0.85 + f * 0.6, z: d / 2 - 0.02, color: lit ? C.lamp : '#4a4542', mat: lit ? M.glow : M.smooth, glow: 1.4 });
      b.box(0.24, 0.04, 0.04, { x: xx, y: 1.03 + f * 0.6, z: d / 2 - 0.02, color: '#efe8da', mat: M.smooth });
    }
    b.quad(0.3, 0.42, { y: 0.21, z: d / 2 + 0.012, color: '#3a3532', mat: M.smooth });
    b.pop();
  };
  palace(8.1, 2.6, 1.5, 2.2, 3, '#e3cfae', -Math.PI / 2 + 0.1);
  palace(5.0, 7.3, 2.2, 1.2, 2, '#d8c3a2', -0.25);
  palace(8.2, -4.6, 1.2, 1.6, 2, '#cdbb9e', -Math.PI / 2 - 0.2);
  // the empty plinth where the monument stood (it is on a trailer now)
  b.box(0.9, 0.5, 1.2, { x: 2.6, y: 0.12, z: -5.5, color: '#a39b8c', mat: M.stone });
  b.box(1.0, 0.08, 1.3, { x: 2.6, y: 0.62, z: -5.5, color: '#bdb5a5', mat: M.stone });
  b.box(0.5, 0.012, 0.8, { x: 2.6, y: 0.7, z: -5.5, color: '#8f887b', mat: M.stone });
  // the slaughterhouse / warehouses: plain cement sheds
  b.box(1.8, 1.0, 1.2, { x: 8.3, y: 0.12, z: -1.0, ry: 0.1, color: CEM, mat: M.stone });
  b.box(1.9, 0.08, 1.3, { x: 8.3, y: 1.12, z: -1.0, ry: 0.1, color: '#9c978c', mat: M.stone });

  // the ministry: a domed block with a portico — its dome is being lifted off by a crane
  const MIN = { x: 4.8, z: -0.8 };
  temple(b, { x: MIN.x, z: MIN.z, w: 3.0, d: 2.6, h: 2.0, cols: 6, col: TRAV, ry: 0 });
  b.cyl(0.8, 0.85, 0.5, { x: MIN.x, y: 2.6, z: MIN.z - 0.31, color: TRAV, mat: M.stone, seg: 20 });
  for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; b.box(0.08, 0.5, 0.06, { x: MIN.x + Math.cos(a) * 0.86, y: 2.6, z: MIN.z - 0.31 + Math.sin(a) * 0.86, ry: -a, color: MARBLE, mat: M.smooth }); }
  // tower crane beside the ministry
  const CR = { x: 2.7, z: -2.6, h: 6.6 };
  for (const [ox, oz] of [[-0.2, -0.2], [0.2, -0.2], [0.2, 0.2], [-0.2, 0.2]]) b.cyl(0.03, 0.03, CR.h, { x: CR.x + ox, y: 0.12, z: CR.z + oz, color: YEL, mat: M.smooth, seg: 4 });
  for (let y = 0.4; y < CR.h; y += 0.5) {
    b.rod([CR.x - 0.2, y, CR.z - 0.2], [CR.x + 0.2, y + 0.45, CR.z - 0.2], 0.012, { color: YEL, mat: M.smooth, seg: 3 });
    b.rod([CR.x - 0.2, y, CR.z + 0.2], [CR.x + 0.2, y + 0.45, CR.z + 0.2], 0.012, { color: YEL, mat: M.smooth, seg: 3 });
    b.rod([CR.x - 0.2, y, CR.z - 0.2], [CR.x - 0.2, y + 0.45, CR.z + 0.2], 0.012, { color: YEL, mat: M.smooth, seg: 3 });
    b.rod([CR.x + 0.2, y, CR.z - 0.2], [CR.x + 0.2, y + 0.45, CR.z + 0.2], 0.012, { color: YEL, mat: M.smooth, seg: 3 });
  }
  b.box(0.8, 0.3, 0.8, { x: CR.x, y: 0.12, z: CR.z, color: '#777', mat: M.stone });
  // the jib (slowly slewing) carrying the dome on its hook
  const DOME = { x: MIN.x, z: MIN.z - 0.31, y: 3.1 };
  const jibAng0 = Math.atan2(-(DOME.z - CR.z), DOME.x - CR.x); // local yaw pointing at the dome
  const jibLen = Math.hypot(DOME.x - CR.x, DOME.z - CR.z);
  const jib = (() => {
    const jb = new Builder();
    jb.box(0.4, 0.3, 0.4, { y: 0, color: YEL, mat: M.smooth });
    jb.box(jibLen + 1.0, 0.18, 0.18, { x: (jibLen + 1.0) / 2 - 0.2, y: 0.3, color: YEL, mat: M.smooth });
    jb.box(1.6, 0.14, 0.18, { x: -1.0, y: 0.3, color: YEL, mat: M.smooth });
    jb.box(0.5, 0.4, 0.4, { x: -1.6, y: 0.0, color: '#8a8f96', mat: M.stone });
    jb.box(0.35, 0.3, 0.35, { x: 0.0, y: -0.3, color: '#f4efe2', mat: M.smooth });
    jb.cyl(0.03, 0.03, 0.9, { y: 0.45, color: YEL, mat: M.smooth, seg: 4 });
    jb.rod([0, 1.35, 0], [jibLen + 0.7, 0.4, 0], 0.01, { color: '#555', seg: 3 });
    jb.rod([0, 1.35, 0], [-1.6, 0.4, 0], 0.01, { color: '#555', seg: 3 });
    jb.box(0.25, 0.12, 0.22, { x: jibLen, y: 0.15, color: '#555', mat: M.stone });
    const g = jb.build();
    g.position.set(CR.x, 0.12 + CR.h, CR.z);
    world.add(g);
    return g;
  })();
  const load = (() => {
    const lb = new Builder();
    lb.dome(0.82, { color: '#9fb6b0', mat: M.smooth, seg: 24 });
    lb.cyl(0.09, 0.12, 0.3, { y: 0.78, color: '#9fb6b0', mat: M.smooth, seg: 10 });
    lb.sphere(0.08, { y: 1.12, color: C.gold, mat: M.metal, seg: 8 });
    for (let k = 0; k < 4; k++) { const a = (k / 4) * Math.PI * 2 + 0.4; lb.rod([Math.cos(a) * 0.6, 0.5, Math.sin(a) * 0.6], [0, 1.6, 0], 0.008, { color: '#444', seg: 3 }); }
    const g = lb.build();
    world.add(g);
    return g;
  })();
  const hookLine = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 1, 4).translate(0, -0.5, 0), new THREE.MeshStandardMaterial({ color: '#444', roughness: 0.6 }));
  world.add(hookLine);

  // the road of trailers carrying the city away
  const ROAD_X = 1.25;
  b.box(1.3, 0.02, 19.2, { x: ROAD_X, y: 0.12, z: 0, color: '#6f6b66', mat: M.stone });
  for (let z = -9; z < 9.5; z += 0.9) b.box(0.06, 0.005, 0.45, { x: ROAD_X, y: 0.141, z, color: '#e8e2d0', mat: M.smooth });
  const truck = (z, cargo) => {
    b.push({ x: ROAD_X, y: 0.14, z, ry: 0 });
    b.box(0.6, 0.45, 0.5, { y: 0.15, z: 1.25, color: rng.pick([RED, NAVY, '#4f7a5a']), mat: M.smooth });
    b.quad(0.45, 0.18, { y: 0.48, z: 1.505, color: '#bcd4e0', mat: M.smooth });
    b.box(0.62, 0.12, 2.1, { y: 0.15, z: 0, color: '#5a5550', mat: M.rough_metal });
    for (const wz of [1.2, 0.5, -0.4, -0.85]) for (const wx of [-0.3, 0.3]) b.cyl(0.13, 0.13, 0.1, { x: wx, y: 0.13, z: wz, rz: Math.PI / 2, color: '#222', mat: M.stone, seg: 10 });
    cargo();
    b.pop();
  };
  truck(6.2, () => { // columns lying down
    for (let i = 0; i < 3; i++) b.cyl(0.09, 0.1, 1.7, { x: -0.18 + i * 0.18, y: 0.37, z: -0.85, rx: Math.PI / 2, color: MARBLE, mat: M.smooth, seg: 10 });
    b.cyl(0.09, 0.1, 1.7, { x: -0.09, y: 0.53, z: -0.85, rx: Math.PI / 2, color: MARBLE, mat: M.smooth, seg: 10 });
    b.cyl(0.09, 0.1, 1.7, { x: 0.09, y: 0.53, z: -0.85, rx: Math.PI / 2, color: MARBLE, mat: M.smooth, seg: 10 });
  });
  truck(3.2, () => { // a pediment
    pediment(b, 0, 0.27, 0, 1.8, 0.35, 0.55, MARBLE, Math.PI / 2);
  });
  truck(0.2, () => { // the equestrian monument, lashed down
    b.box(0.5, 0.35, 0.9, { y: 0.27, color: '#a39b8c', mat: M.stone });
    b.sphere(0.16, { y: 0.8, sx: 0.8, sz: 1.6, color: '#6f7d6a', mat: M.metal, seg: 10 });
    for (const [lx, lz] of [[-0.08, 0.15], [0.08, 0.15], [-0.08, -0.15], [0.08, -0.15]]) b.rod([lx, 0.62, lz], [lx, 0.8, lz * 1.2], 0.025, { color: '#6f7d6a', mat: M.metal, seg: 4 });
    b.rod([0, 0.85, 0.22], [0, 1.0, 0.35], 0.04, { color: '#6f7d6a', mat: M.metal, seg: 5 });
    b.sphere(0.06, { y: 1.02, z: 0.38, color: '#6f7d6a', mat: M.metal, seg: 6 });
    b.cyl(0.05, 0.06, 0.28, { y: 0.88, color: '#6f7d6a', mat: M.metal, seg: 6 });
    b.sphere(0.05, { y: 1.2, color: '#6f7d6a', mat: M.metal, seg: 6 });
    b.rod([0.25, 0.3, -0.3], [-0.0, 0.95, 0], 0.006, { color: '#d9c39a', seg: 3 });
    b.rod([-0.25, 0.3, 0.3], [-0.0, 0.95, 0], 0.006, { color: '#d9c39a', seg: 3 });
  });
  truck(-2.8, () => { // stacked blocks and window frames of the bank
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) b.box(0.25, 0.22, 0.4, { x: -0.15 + j * 0.3, y: 0.27 + i * 0.22, z: -0.6 + (i % 2) * 0.1, color: rng.pick([MARBLE, TRAV, CEM]), mat: M.stone });
    b.box(0.55, 0.6, 0.04, { y: 0.27, z: 0.35, color: '#5a4a3e', mat: M.wood });
  });
  // workmen
  for (let i = 0; i < 14; i++) {
    const x = rng.range(1.8, 8.5), z = rng.range(-7, 7);
    if (x * x + z * z > 9 * 9) continue;
    figure(b, { x, y: 0.13, z, h: 0.3, color: rng.pick(['#3f5f8a', '#4b4b4b', '#d98a3a']), ry: rng.range(0, 6), arms: rng.chance(0.3) ? 1 : 0 });
    b.sphere(0.04, { x, y: 0.4, z, color: YEL, mat: M.smooth, seg: 6 }); // hard hat
  }
  // a pile of numbered stones and a half-taken-down wall with empty windows
  for (let i = 0; i < 10; i++) b.box(0.3, 0.2, 0.25, { x: 2.4 + rng.range(-0.4, 0.4), y: 0.13 + Math.floor(i / 4) * 0.2, z: 1.8 + rng.range(-0.3, 0.3), ry: rng.range(0, 1), color: rng.pick([MARBLE, TRAV]), mat: M.stone });
  {
    const x = 7.2, z = 5.0;
    for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) {
      if ((i + j * 2) % 3 === 0 && j > 1) continue;
      if (i % 2 === 1 && j % 2 === 1) continue; // window holes
      b.box(0.35, 0.4, 0.25, { x: x - 0.9 + i * 0.35, y: 0.12 + j * 0.4, z, ry: -0.5, color: TRAV, mat: M.stone });
    }
  }

  // bake the static geometry's rotation (keeps the bounding box tight)
  const stat = b.build();
  stat.traverse((o) => { if (o.geometry) o.geometry.rotateY(ROT); });
  object.add(stat);

  /* ---------------------------------------------------- animation -- */
  const _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _t = new THREE.Vector3(), _q = new THREE.Vector3();
  const update = (t) => {
    // coaster: slower on climbs, faster on drops (fake energy)
    const base = (t * 0.028) % 1;
    for (let k = 0; k < cars.length; k++) {
      const u = (base - k * 0.012 + 1) % 1;
      track.getPointAt(u, _p);
      track.getTangentAt(u, _t);
      _q.copy(_p).add(_t);
      _m.lookAt(_q, _p, up);
      cars[k].quaternion.setFromRotationMatrix(_m);
      cars[k].position.copy(_p);
    }
    wheel.rotation.z = t * 0.12;
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2 + t * 0.12;
      setInst(gonds, k, FW.x + Math.cos(a) * FW.R, FW.y + Math.sin(a) * FW.R, FW.z, 1, 0, 0, Math.sin(t * 0.8 + k) * 0.05);
    }
    gonds.instanceMatrix.needsUpdate = true;
    swing.rotation.y = t * 0.7;
    trapezes[0].rotation.z = Math.sin(t * 1.1) * 0.55;
    trapezes[1].rotation.z = Math.sin(t * 1.1 + Math.PI) * 0.55;
    // the dome rises off its drum, hangs, and is set back: the city's temporary half
    const cyc = (t * 0.05) % 1;
    const lift = cyc < 0.4 ? Math.sin((cyc / 0.4) * Math.PI / 2) : cyc < 0.7 ? 1 : Math.cos(((cyc - 0.7) / 0.3) * Math.PI / 2);
    const e = lift * lift * (3 - 2 * lift);
    const yDome = DOME.y + e * 2.2;
    jib.rotation.y = jibAng0 + Math.sin(t * 0.05) * 0.0;
    load.position.set(DOME.x, yDome, DOME.z);
    load.rotation.y = e * 0.4;
    const hookTop = 0.12 + CR.h + 0.15;
    hookLine.position.set(DOME.x, hookTop, DOME.z);
    hookLine.scale.y = Math.max(0.05, hookTop - (yDome + 1.6));
  };
  update(0);
  return { object, update };
}
