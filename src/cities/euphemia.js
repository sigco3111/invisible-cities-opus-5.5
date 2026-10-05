// Euphemia — the market of memories. A delta port where boats unload sacks and bales;
// at night seven nations sit around seven fires on carpets and barrels, and from the
// fires rise little glowing stories that drift across the square to the other fires,
// changing colour on the way: memories traded like spice.
import { THREE, Builder, M, C, Lines, house, tree, person, boat } from '../kit.js';
import { ribbonGeo, smoothPath, glowParticles, _o, _col } from './_c_util.js';

const WATER = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.7, metalness: 0.0, transparent: true, opacity: 0.9 });
WATER.userData.noShadow = true;
const NATIONS = ['#c4553a', '#6b4f93', '#2f8576', '#d9a441', '#a83a4a', '#3f63a3', '#e8dcc0'];

export default function build({ rng, accent }) {
  const b = new Builder();
  const lines = new Lines();
  const G = 0.3; // ground level

  // ---------------------------------------------------------------- ground
  b.cyl(10.3, 10.45, G, { color: '#c9ad7f', seg: 64 });
  // trampled darker patches and paths
  for (let i = 0; i < 26; i++) {
    const [x, z] = rng.inDisc(9.3);
    b.cyl(rng.range(0.5, 1.4), rng.range(0.5, 1.4), 0.01, { x, y: G, z, color: rng.pick(['#bea06f', '#d4bb8f', '#b59768']), seg: 12, sz: rng.range(0.5, 1) });
  }

  // ---------------------------------------------------------------- delta
  const fork = [-4.6, -1.1];
  const arms = [
    { pts: smoothPath([[-10.6, -3.6], [-8, -2.4], fork], 18), w: 2.3 },
    { pts: smoothPath([fork, [-5.4, 2.6], [-6.0, 5.6], [-6.4, 8.2]], 22), w: 1.4 },
    { pts: smoothPath([fork, [-2.6, 1.8], [-1.7, 5.2], [-1.1, 10.2]], 26), w: 1.5 },
    { pts: smoothPath([fork, [-3.2, -4.4], [-2.6, -7.2], [-2.0, -10.1]], 22), w: 1.3 },
  ];
  for (const a of arms) {
    const { geo, L, R } = ribbonGeo(a.pts, a.w, G + 0.012);
    b.geo(geo, { mat: WATER, color: '#1d4a5a' });
    // darker river bed seen through water
    const bed = ribbonGeo(a.pts, a.w * 0.8, G + 0.004);
    b.geo(bed.geo, { color: '#3b4b46' });
    for (const side of [L, R]) {
      for (let i = 0; i < side.length - 1; i++) {
        const p = side[i], q = side[i + 1];
        if (Math.hypot(p[0], p[1]) > 10.2 || Math.hypot(q[0], q[1]) > 10.2) continue;
        b.beam([p[0], G + 0.04, p[1]], [q[0], G + 0.04, q[1]], 0.1, { color: '#b9a57e' });
      }
    }
    a.L = L; a.R = R;
  }

  // reeds along the outer banks
  for (let i = 0; i < 70; i++) {
    const a = rng.pick(arms);
    const side = rng.chance(0.5) ? a.L : a.R;
    const p = side[rng.int(1, side.length - 2)];
    if (Math.hypot(p[0], p[1]) > 9.8) continue;
    const h = rng.range(0.25, 0.55);
    const x = p[0] + rng.range(-0.15, 0.15), z = p[1] + rng.range(-0.15, 0.15);
    b.rod([x, G, z], [x + rng.range(-0.08, 0.08), G + h, z + rng.range(-0.08, 0.08)], 0.012, { color: '#8f9a5a' });
  }

  // ---------------------------------------------------------------- boats & cargo on the quays
  const along = (a, t) => {
    const i = Math.min(a.pts.length - 2, Math.floor(t * (a.pts.length - 1)));
    const p = a.pts[i], q = a.pts[i + 1];
    return { x: p[0], z: p[1], ry: Math.atan2(q[0] - p[0], q[1] - p[1]) };
  };
  const boatsAt = [[0, 0.3], [0, 0.55], [0, 0.82], [2, 0.2], [2, 0.32], [2, 0.44], [2, 0.56], [2, 0.68], [2, 0.8], [1, 0.3], [1, 0.45], [1, 0.62], [1, 0.8], [3, 0.25], [3, 0.38], [3, 0.52], [3, 0.66]];
  for (const [ai, t] of boatsAt) {
    const a = arms[ai];
    const p = along(a, t);
    const len = rng.range(1.1, 1.6);
    boat(b, { x: p.x, y: G - 0.06, z: p.z, ry: p.ry, len, color: rng.pick([C.wood, C.darkwood, '#7a4e33']), sail: rng.pick([C.plaster, '#e7d3b0', '#c98d6a', C.ivory]), mast: rng.chance(0.75) });
    // cargo in the boat
    for (let k = 0; k < 3; k++) {
      const off = (k - 1) * len * 0.2;
      b.sphere(0.09, { x: p.x + Math.sin(p.ry) * off, y: G + 0.2, z: p.z + Math.cos(p.ry) * off, sy: 0.75, color: rng.pick(['#d8c39a', '#c7ad7c', C.ochre]), seg: 6 });
    }
  }

  // cargo heaps
  const heap = (x, z, n = 8) => {
    for (let k = 0; k < n; k++) {
      const kind = rng.int(0, 2);
      const px = x + rng.range(-0.5, 0.5), pz = z + rng.range(-0.5, 0.5);
      if (kind === 0) {
        b.sphere(0.13, { x: px, y: G + 0.1, z: pz, sy: 0.7, sx: 1.1, color: rng.pick(['#d8c39a', '#cdb486', '#b99a6a', C.ochre]), seg: 7 });
      } else if (kind === 1) {
        b.cyl(0.11, 0.11, 0.3, { x: px, y: G, z: pz, color: C.wood, mat: M.wood, seg: 9 });
        b.cyl(0.115, 0.115, 0.03, { x: px, y: G + 0.06, z: pz, color: C.charcoal, seg: 9 });
        b.cyl(0.115, 0.115, 0.03, { x: px, y: G + 0.22, z: pz, color: C.charcoal, seg: 9 });
      } else {
        const ry = rng.range(0, 3);
        b.box(0.32, 0.22, 0.24, { x: px, y: G, z: pz, ry, color: rng.pick(['#e2d4ae', '#cfbf98', '#d8b98a']), mat: M.cloth });
        b.box(0.33, 0.23, 0.03, { x: px, y: G, z: pz, ry, color: '#7d6448' });
      }
    }
  };
  heap(-0.9, 2.2, 10); heap(-0.4, 4.6, 8); heap(-3.6, -2.6, 9); heap(-6.5, -3.6, 7); heap(-4.4, 3.5, 8);

  // two wooden cranes on the quay
  const crane = (x, z, ry) => {
    b.push({ x, y: G, z, ry });
    b.box(0.5, 0.06, 0.5, { color: C.darkwood, mat: M.wood });
    b.rod([0, 0, 0], [0, 2.2, 0], 0.06, { color: C.wood, mat: M.wood });
    b.rod([0, 1.9, 0], [0, 2.4, -1.6], 0.04, { color: C.wood, mat: M.wood });
    b.rod([-0.2, 0, 0.2], [0, 1.6, 0], 0.03, { color: C.wood, mat: M.wood });
    b.rod([0.2, 0, 0.2], [0, 1.6, 0], 0.03, { color: C.wood, mat: M.wood });
    b.pop();
  };
  crane(-0.6, 3.3, Math.PI * 0.55);
  crane(-3.4, -1.0, Math.PI * 1.15);

  // ---------------------------------------------------------------- warehouses & town
  const warehouses = [
    [5.0, -6.6, 2.4, 1.5, 0.4], [7.6, -4.2, 1.8, 1.4, 1.0], [2.2, -7.8, 1.6, 1.3, 0.1],
    [8.6, -0.8, 1.4, 1.3, 1.5], [-0.4, -6.0, 1.3, 1.2, -0.2], [6.6, 4.6, 1.6, 1.3, 2.2],
    [-8.6, 1.2, 1.2, 1.1, 0.4], [-8.0, 4.4, 1.0, 1.0, 1.0], [-4.0, 7.6, 1.2, 1.0, 0.2], [3.4, 7.0, 1.4, 1.2, -0.3],
  ];
  for (const [x, z, w, d, ry] of warehouses) {
    const h = rng.range(1.0, 1.8);
    const wall = rng.pick(['#e8d7b6', '#dcc29a', '#e9dcc4', '#d9b991', '#e3c7a8']);
    b.push({ x, y: G, z, ry });
    b.box(w, h, d, { color: wall });
    b.box(w + 0.08, 0.12, d + 0.08, { y: h, color: wall });
    b.box(w + 0.08, 0.06, d + 0.08, { y: h * 0.45, color: '#c7a676' });
    // arched dark openings along the long sides
    const n = Math.max(2, Math.floor(w / 0.42));
    for (let k = 0; k < n; k++) {
      const u = (k + 0.5) / n * w - w / 2;
      for (const sz of [1, -1]) {
        b.box(0.2, 0.36, 0.02, { x: u, y: 0, z: sz * (d / 2 + 0.005), color: '#3a2c22' });
        b.cyl(0.1, 0.1, 0.02, { x: u, y: 0.36, z: sz * (d / 2 + 0.005), rx: Math.PI / 2, color: '#3a2c22', seg: 10, thetaLength: Math.PI, thetaStart: -Math.PI / 2 });
        const lit = rng.chance(0.35);
        b.quad(0.1, 0.14, { x: u, y: h * 0.72, z: sz * (d / 2 + 0.012), ry: sz > 0 ? 0 : Math.PI, mat: lit ? M.glow : M.smooth, color: lit ? C.lamp : '#3a2c22', glow: 2 });
      }
    }
    if (rng.chance(0.55)) b.dome(Math.min(w, d) * 0.3, { y: h + 0.12, color: rng.pick(['#e8dcc4', '#7fa7a0', '#c98a5a']), mat: M.smooth });
    else {
      // rooftop awning
      for (const [px, pz] of [[-0.3, -0.2], [0.3, -0.2], [-0.3, 0.2], [0.3, 0.2]]) b.cyl(0.02, 0.02, 0.45, { x: px, y: h + 0.12, z: pz, color: C.darkwood, seg: 4 });
      b.box(0.75, 0.02, 0.55, { y: h + 0.57, color: rng.pick(NATIONS), mat: M.cloth });
    }
    b.pop();
  }
  // palms and a few trees on the islands
  const palms = [[-7.6, -0.4], [-8.4, 6.0], [-3.6, 5.8], [-3.0, 8.6], [0.6, -8.8], [-5.0, -6.6], [8.6, 2.6], [4.4, -8.6], [-9.2, -5.6], [1.8, 8.8]];
  for (const [x, z] of palms) tree(b, { x, y: G, z, h: rng.range(1.4, 2.0), kind: 'palm', r: rng, color: '#6f8f4f' });

  // ---------------------------------------------------------------- the market of seven fires
  const MC = [3.0, -0.4];
  const RING = 2.7;
  // paved square
  b.cyl(4.6, 4.7, 0.04, { x: MC[0], y: G, z: MC[1], color: '#cdb790', seg: 48 });
  b.cyl(1.0, 1.0, 0.05, { x: MC[0], y: G, z: MC[1], color: '#b9a37a', seg: 32 });
  // the solstice gnomon: slender obelisk with brass ball, four marker stones
  b.prism(0.12, 0.26, 4.6, 4, { x: MC[0], y: G + 0.05, z: MC[1], color: '#d8c4a0', mat: M.smooth, ry: Math.PI / 4 });
  b.prism(0, 0.13, 0.4, 4, { x: MC[0], y: G + 4.65, z: MC[1], color: C.gold, mat: M.metal, ry: Math.PI / 4 });
  b.sphere(0.16, { x: MC[0], y: G + 5.25, z: MC[1], color: C.gold, mat: M.metal });
  b.torus(0.32, 0.025, { x: MC[0], y: G + 5.25, z: MC[1], rx: Math.PI / 2 - 0.4, color: C.gold, mat: M.metal });
  for (let k = 0; k < 4; k++) {
    const a = k * Math.PI / 2 + 0.3;
    b.box(0.14, 0.12, 0.3, { x: MC[0] + Math.cos(a) * 0.82, y: G + 0.05, z: MC[1] + Math.sin(a) * 0.82, ry: -a, color: C.gold, mat: M.metal });
  }

  const fires = [];
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + 0.25;
    const fx = MC[0] + Math.cos(a) * RING, fz = MC[1] + Math.sin(a) * RING;
    const col = NATIONS[i];
    fires.push({ x: fx, z: fz, col: new THREE.Color(col), a });
    // hearth: ring of stones + logs + embers bed
    for (let k = 0; k < 9; k++) {
      const s = (k / 9) * Math.PI * 2;
      b.sphere(0.07, { x: fx + Math.cos(s) * 0.25, y: G + 0.05, z: fz + Math.sin(s) * 0.25, color: C.ash, mat: M.flat, seg: 5 });
    }
    for (let k = 0; k < 3; k++) {
      const s = k * 2.1 + i;
      b.rod([fx + Math.cos(s) * 0.2, G + 0.04, fz + Math.sin(s) * 0.2], [fx - Math.cos(s) * 0.12, G + 0.12, fz - Math.sin(s) * 0.12], 0.025, { color: C.darkwood });
    }
    b.cyl(0.17, 0.19, 0.04, { x: fx, y: G + 0.04, z: fz, mat: M.glow, color: '#ff7a2a', glow: 1.6 });
    // a great round rug under the circle
    b.cyl(0.95, 0.95, 0.015, { x: fx, y: G + 0.04, z: fz, color: col, mat: M.cloth, seg: 24 });
    b.cyl(0.8, 0.8, 0.015, { x: fx, y: G + 0.045, z: fz, color: '#5a2b25', mat: M.cloth, seg: 24 });
    b.cyl(0.42, 0.42, 0.015, { x: fx, y: G + 0.05, z: fz, color: col, mat: M.cloth, seg: 20 });

    // merchants seated on sacks, barrels, carpet heaps facing the fire
    const nM = 3 + (i % 2);
    for (let m = 0; m < nM; m++) {
      const s = a + Math.PI + (m - (nM - 1) / 2) * 0.95 + rng.range(-0.15, 0.15);
      const sx = fx + Math.cos(s) * 0.62, sz = fz + Math.sin(s) * 0.62;
      const seat = rng.int(0, 2);
      let sy = 0.14;
      if (seat === 0) b.sphere(0.13, { x: sx, y: G + 0.08, z: sz, sy: 0.6, color: '#cdb486', seg: 7 });
      else if (seat === 1) { b.cyl(0.1, 0.1, 0.2, { x: sx, y: G, z: sz, color: C.wood, mat: M.wood, seg: 8 }); sy = 0.2; }
      else {
        for (let c = 0; c < 3; c++) b.box(0.34, 0.05, 0.24, { x: sx, y: G + c * 0.05, z: sz, ry: -s + c * 0.2, color: rng.pick(NATIONS), mat: M.cloth });
        sy = 0.15;
      }
      const robe = rng.chance(0.6) ? col : rng.pick([C.plaster, C.darkwood, '#5b4a3a']);
      const ry = -s + Math.PI / 2;
      b.cone(0.085, 0.2, { x: sx, y: G + sy, z: sz, color: robe, seg: 6 });
      b.sphere(0.045, { x: sx, y: G + sy + 0.23, z: sz, color: '#c89a72', seg: 6 });
      // turban / hat in the nation's colour
      b.sphere(0.048, { x: sx, y: G + sy + 0.27, z: sz, sy: 0.6, color: rng.chance(0.5) ? col : C.ivory, seg: 6 });
      // knees reaching toward the fire
      b.box(0.1, 0.05, 0.14, { x: sx - Math.cos(s) * 0.08, y: G + sy + 0.02, z: sz - Math.sin(s) * 0.08, ry, color: robe });
    }
    // a heap of carpets and sacks behind, outward
    const ox = fx + Math.cos(a) * 1.05, oz = fz + Math.sin(a) * 1.05;
    for (let c = 0; c < 6; c++) {
      b.box(0.62 - c * 0.04, 0.06, 0.42 - c * 0.02, { x: ox, y: G + c * 0.06, z: oz, ry: -a + rng.range(-0.3, 0.3), color: rng.pick([col, NATIONS[(i + 2) % 7], '#7b2f2f', '#2c3f6b', C.ochre, '#4c6b3a']), mat: M.cloth });
    }
    // rolled carpets leaning
    for (let c = 0; c < 2; c++) {
      const s = a + (c ? 0.35 : -0.35);
      const px = fx + Math.cos(s) * 1.1, pz = fz + Math.sin(s) * 1.1;
      b.rod([px, G, pz], [px + Math.cos(s) * 0.15, G + 0.55, pz + Math.sin(s) * 0.15], 0.06, { color: rng.pick(NATIONS), seg: 8 });
    }
    // the nation's tent / awning behind
    const tx = MC[0] + Math.cos(a + 0.45) * (RING + 1.55), tz = MC[1] + Math.sin(a + 0.45) * (RING + 1.55);
    const tr = -a - 0.45 + Math.PI / 2;
    b.push({ x: tx, y: G, z: tz, ry: tr });
    for (const [px, pz] of [[-0.45, -0.35], [0.45, -0.35], [-0.45, 0.35], [0.45, 0.35]]) b.cyl(0.025, 0.025, pz > 0 ? 0.9 : 1.15, { x: px, z: pz, color: C.darkwood, seg: 5 });
    b.geo(new THREE.PlaneGeometry(1.05, 0.85), { y: 1.05, rx: -Math.PI / 2 + 0.28, color: col, mat: M.cloth });
    b.geo(new THREE.PlaneGeometry(1.05, 0.25), { y: 1.0, z: -0.4, color: col, mat: M.cloth });
    // stripes on the awning
    b.geo(new THREE.PlaneGeometry(0.12, 0.86), { y: 1.06, x: -0.25, rx: -Math.PI / 2 + 0.28, color: C.ivory, mat: M.cloth });
    b.geo(new THREE.PlaneGeometry(0.12, 0.86), { y: 1.06, x: 0.25, rx: -Math.PI / 2 + 0.28, color: C.ivory, mat: M.cloth });
    // goods on a trestle
    b.box(0.8, 0.04, 0.3, { y: 0.35, z: 0.1, color: C.wood, mat: M.wood });
    for (let k = 0; k < 4; k++) b.cone(0.08, 0.12, { x: -0.3 + k * 0.2, y: 0.39, z: 0.1, color: rng.pick([C.ochre, C.terracotta, '#8a4a2a', '#d8b04a', '#6a3f2a']), seg: 7 });
    b.pop();
    // a hanging lantern at the tent
    b.sphere(0.06, { x: tx + Math.cos(a) * 0.1, y: G + 0.92, z: tz + Math.sin(a) * 0.1, mat: M.glow, color: C.lamp, glow: 2.2 });
  }
  // strings of lanterns between the tents
  for (let i = 0; i < 7; i++) {
    const a0 = (i / 7) * Math.PI * 2 + 0.25 + 0.45, a1 = ((i + 1) / 7) * Math.PI * 2 + 0.25 + 0.45;
    const r0 = RING + 1.55;
    const p = [MC[0] + Math.cos(a0) * r0, G + 1.15, MC[1] + Math.sin(a0) * r0];
    const q = [MC[0] + Math.cos(a1) * r0, G + 1.15, MC[1] + Math.sin(a1) * r0];
    lines.rope(p, q, 0.25, '#5a4636', 10);
    for (let k = 1; k < 4; k++) {
      const t = k / 4;
      b.sphere(0.035, { x: p[0] + (q[0] - p[0]) * t, y: p[1] - 0.25 * 4 * t * (1 - t) - 0.04, z: p[2] + (q[2] - p[2]) * t, mat: M.glow, color: k === 2 ? accent : C.lamp, glow: 1.8, seg: 5 });
    }
  }
  // people still carrying goods from the quay
  for (let i = 0; i < 9; i++) {
    const t = rng();
    const x = -0.6 + t * 2.4 + rng.range(-0.3, 0.3), z = 2.6 - t * 1.8 + rng.range(-0.4, 0.4);
    person(b, { x, y: G, z, h: 0.32, color: rng.pick([C.plaster, C.darkwood, '#7b5a40', C.slate]) });
    b.sphere(0.07, { x, y: G + 0.36, z, sy: 0.7, color: '#d8c39a', seg: 6 });
  }

  // ---------------------------------------------------------------- caravan arriving from the east
  const camel = (x, z, ry, pack) => {
    b.push({ x, y: G, z, ry });
    for (const [lx, lz] of [[-0.08, 0.18], [0.08, 0.18], [-0.08, -0.18], [0.08, -0.18]]) b.rod([lx, 0, lz], [lx * 0.8, 0.42, lz * 0.8], 0.022, { color: '#b78d5e' });
    b.sphere(0.22, { y: 0.52, sx: 0.65, sz: 1.05, sy: 0.55, color: '#c39b69', seg: 10 });
    b.sphere(0.12, { y: 0.66, sy: 0.9, color: '#c39b69', seg: 8 });
    b.rod([0, 0.55, 0.2], [0, 0.82, 0.36], 0.045, { color: '#c39b69' });
    b.box(0.08, 0.08, 0.17, { y: 0.8, z: 0.42, color: '#b8905e' });
    b.box(0.08, 0.16, 0.2, { x: 0.15, y: 0.42, color: pack, mat: M.cloth });
    b.box(0.08, 0.16, 0.2, { x: -0.15, y: 0.42, color: pack, mat: M.cloth });
    b.pop();
  };
  const cpath = [[9.6, 3.6], [8.6, 3.2], [7.7, 2.6], [6.9, 1.9]];
  cpath.forEach(([x, z], i) => camel(x, z, -2.3 + i * 0.05, rng.pick(NATIONS)));
  for (let i = 0; i < cpath.length - 1; i++) lines.seg([cpath[i][0], G + 0.62, cpath[i][1]], [cpath[i + 1][0], G + 0.82, cpath[i + 1][1]], '#4a3a2a');
  person(b, { x: 6.4, y: G, z: 1.5, h: 0.34, color: '#6b4f93' });


  // ---------------------------------------------------------------- the fair spills over: stalls, heaps, carpets everywhere on dry land
  const wet = (x, z) => arms.some((a) => a.pts.some(([px, pz]) => Math.hypot(px - x, pz - z) < a.w / 2 + 0.45));
  const solidSpots = warehouses.map(([x, z, w, d]) => [x, z, Math.max(w, d) * 0.75 + 0.3]);
  const taken = [...solidSpots, [MC[0], MC[1], RING + 1.9]];
  const freeAt = (x, z, r) => !wet(x, z) && Math.hypot(x, z) < 9.7 && !taken.some(([tx, tz, tr]) => Math.hypot(tx - x, tz - z) < tr + r);
  const stall = (x, z, ry, col) => {
    b.push({ x, y: G, z, ry });
    for (const [px, pz] of [[-0.38, -0.28], [0.38, -0.28], [-0.38, 0.28], [0.38, 0.28]]) b.cyl(0.02, 0.02, pz > 0 ? 0.8 : 0.95, { x: px, z: pz, color: C.darkwood, seg: 4 });
    b.geo(new THREE.PlaneGeometry(0.9, 0.7), { y: 0.9, rx: -Math.PI / 2 + 0.22, color: col, mat: M.cloth });
    b.geo(new THREE.PlaneGeometry(0.1, 0.71), { y: 0.905, x: 0, rx: -Math.PI / 2 + 0.22, color: C.ivory, mat: M.cloth });
    b.box(0.7, 0.04, 0.32, { y: 0.32, z: 0.08, color: C.wood, mat: M.wood });
    for (let k = 0; k < 4; k++) {
      const g = rng.int(0, 2);
      const gx = -0.26 + k * 0.17;
      if (g === 0) b.cone(0.07, 0.1, { x: gx, y: 0.36, z: 0.08, color: rng.pick([C.ochre, C.terracotta, '#8a4a2a', '#d8b04a', '#6a3f2a', '#b8302a']), seg: 7 });
      else if (g === 1) b.sphere(0.05, { x: gx, y: 0.4, z: 0.08, color: rng.pick(['#e8a040', '#d0602a', '#c8b060', '#7a9a3a']), seg: 6 });
      else b.box(0.12, 0.08, 0.12, { x: gx, y: 0.36, z: 0.08, color: rng.pick(NATIONS), mat: M.cloth });
    }
    // sacks at the foot of the stall
    for (let k = 0; k < 3; k++) b.sphere(0.1, { x: -0.3 + k * 0.3, y: 0.08, z: 0.42, sy: 0.75, color: rng.pick(['#d8c39a', '#cdb486', '#b99a6a']), seg: 7 });
    b.sphere(0.05, { x: 0.36, y: 0.75, z: 0.3, mat: M.glow, color: C.lamp, glow: 2.2, seg: 6 });
    person(b, { x: rng.range(-0.2, 0.2), y: 0, z: -0.1, h: 0.3, color: col });
    b.pop();
  };
  let nSt = 0;
  for (let t = 0; t < 6000 && nSt < 46; t++) {
    const a = rng.range(0, Math.PI * 2), r = rng.range(RING + 2.2, RING + 7.2);
    const x = MC[0] + Math.cos(a) * r, z = MC[1] + Math.sin(a) * r;
    if (!freeAt(x, z, 0.55)) continue;
    taken.push([x, z, 0.55]);
    stall(x, z, -a - Math.PI / 2, rng.pick(NATIONS));
    nSt++;
  }
  // carpets spread out for show and heaps of goods in the gaps
  for (let t = 0, n = 0; t < 3000 && n < 30; t++) {
    const [x, z] = rng.inDisc(9.4);
    if (!freeAt(x, z, 0.4)) continue;
    taken.push([x, z, 0.4]);
    n++;
    if (n % 2) {
      const ry = rng.range(0, 3);
      const c1 = rng.pick(NATIONS), c2 = rng.pick(['#7b2f2f', '#2c3f6b', C.ochre, '#4c6b3a']);
      b.box(0.8, 0.012, 0.55, { x, y: G, z, ry, color: c1, mat: M.cloth });
      b.box(0.62, 0.012, 0.38, { x, y: G + 0.006, z, ry, color: c2, mat: M.cloth });
      b.box(0.3, 0.012, 0.16, { x, y: G + 0.012, z, ry, color: c1, mat: M.cloth });
    } else heap(x, z, 6);
  }
  // spice cones in big baskets around the fires
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + 0.5;
    const x = MC[0] + Math.cos(a) * (RING + 0.9), z = MC[1] + Math.sin(a) * (RING + 0.9);
    if (wet(x, z)) continue;
    b.cyl(0.13, 0.1, 0.12, { x, y: G, z, color: '#a8875e', mat: M.wood, seg: 10 });
    b.cone(0.12, 0.17, { x, y: G + 0.12, z, color: rng.pick(['#d8a030', '#c0401a', '#e8c060', '#8a4a2a', '#b85a20']), seg: 10 });
  }
  // a crowd of buyers drifting between stalls
  for (let t = 0, n = 0; t < 2000 && n < 40; t++) {
    const [x, z] = rng.inDisc(9.2);
    if (wet(x, z) || solidSpots.some(([tx, tz, tr]) => Math.hypot(tx - x, tz - z) < tr)) continue;
    n++;
    person(b, { x, y: G, z, h: 0.3, color: rng.pick([...NATIONS, C.plaster, C.darkwood]) });
  }
  // strings of lanterns from the obelisk to the tents, like a great canopy
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + 0.25 + 0.45;
    const p = [MC[0], G + 3.4, MC[1]];
    const q = [MC[0] + Math.cos(a) * (RING + 1.55), G + 1.15, MC[1] + Math.sin(a) * (RING + 1.55)];
    lines.rope(p, q, 0.35, '#5a4636', 12);
    for (let k = 1; k < 6; k++) {
      const t = k / 6;
      b.sphere(0.035, { x: p[0] + (q[0] - p[0]) * t, y: p[1] + (q[1] - p[1]) * t - 0.35 * 4 * t * (1 - t) - 0.04, z: p[2] + (q[2] - p[2]) * t, mat: M.glow, color: k % 2 ? C.lamp : NATIONS[(i + k) % 7], glow: 2.0, seg: 5 });
    }
  }

  const object = new THREE.Group();
  object.add(b.build());
  const ln = lines.build();
  ln.position.y = 0;
  object.add(ln);

  // ---------------------------------------------------------------- animated flames
  const NF = fires.length;
  const flameGeo = new THREE.ConeGeometry(0.2, 0.75, 7).translate(0, 0.375, 0);
  const flames = new THREE.InstancedMesh(flameGeo, new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false, transparent: true, opacity: 0.92 }), NF * 2);
  flames.frustumCulled = false;
  for (let i = 0; i < NF; i++) {
    flames.setColorAt(i * 2, _col.set('#ff7a22').multiplyScalar(2.8));
    flames.setColorAt(i * 2 + 1, _col.set('#ffe08a').multiplyScalar(2.8));
  }
  object.add(flames);

  // ---------------------------------------------------------------- stories drifting fire to fire
  const NW = 22, TRAIL = 14;
  const NE = 28;
  const wisps = glowParticles(NW * TRAIL + NE, 0.095, '#ffffff', 1);
  const WARM = new THREE.Color('#ffd9a0');
  object.add(wisps);
  const W = [];
  for (let i = 0; i < NW; i++) {
    const from = rng.int(0, NF - 1);
    let to = (from + rng.int(1, NF - 1)) % NF;
    W.push({ from, to, dur: rng.range(7, 12), t0: rng.range(0, 12), h: rng.range(2.2, 4.5), wob: rng.range(0, 6), side: rng.range(-1, 1), seed: i });
  }
  const E = [];
  for (let i = 0; i < NE; i++) E.push({ f: i % NF, dur: rng.range(1.6, 2.8), t0: rng.range(0, 3), dx: rng.range(-0.12, 0.12), dz: rng.range(-0.12, 0.12) });
  const tmpA = new THREE.Color(), tmpB = new THREE.Color();

  function pathPos(w, s, out) {
    const A = fires[w.from], B = fires[w.to];
    const x = A.x + (B.x - A.x) * s, z = A.z + (B.z - A.z) * s;
    // bend sideways around the gnomon
    const nx = -(B.z - A.z), nz = B.x - A.x;
    const bend = Math.sin(Math.PI * s) * w.side * 0.35;
    out.x = x + nx * bend + Math.sin(s * 9 + w.wob) * 0.08;
    out.z = z + nz * bend + Math.cos(s * 7 + w.wob) * 0.08;
    out.y = G + 0.5 + Math.sin(Math.PI * s) * w.h + Math.sin(s * 12 + w.wob) * 0.06;
  }
  const P = { x: 0, y: 0, z: 0 };

  function update(t) {
    // flames
    for (let i = 0; i < NF; i++) {
      const f = fires[i];
      const k = 0.85 + 0.2 * Math.sin(t * 7.3 + i * 1.7) + 0.1 * Math.sin(t * 13.1 + i);
      _o.position.set(f.x, G + 0.06, f.z);
      _o.rotation.set(0, t * 0.5 + i, Math.sin(t * 3 + i) * 0.08);
      _o.scale.set(1, k, 1);
      _o.updateMatrix();
      flames.setMatrixAt(i * 2, _o.matrix);
      _o.scale.set(0.55, k * 0.7, 0.55);
      _o.updateMatrix();
      flames.setMatrixAt(i * 2 + 1, _o.matrix);
    }
    flames.instanceMatrix.needsUpdate = true;

    // stories
    let n = 0;
    for (let i = 0; i < NW; i++) {
      const w = W[i];
      let u = ((t + w.t0) / w.dur);
      const cycle = Math.floor(u);
      u -= cycle;
      // pick new pairs every cycle, deterministically
      const from = (w.seed * 3 + cycle * 5) % NF;
      const to = (from + 1 + ((w.seed + cycle * 3) % (NF - 1))) % NF;
      w.from = from; w.to = to;
      tmpA.copy(fires[from].col); tmpB.copy(fires[to].col);
      for (let k = 0; k < TRAIL; k++) {
        const s = u - k * 0.012;
        if (s <= 0 || s >= 1) { _o.scale.setScalar(0.0001); _o.position.set(0, -10, 0); }
        else {
          pathPos(w, s, P);
          _o.position.set(P.x, P.y, P.z);
          const fade = Math.min(1, s * 8, (1 - s) * 8);
          _o.scale.setScalar((1 - k / TRAIL) * fade * (k === 0 ? 1.3 : 0.75));
        }
        _o.rotation.set(0, 0, 0);
        _o.updateMatrix();
        wisps.setMatrixAt(n, _o.matrix);
        _col.copy(tmpA).lerp(tmpB, Math.min(1, Math.max(0, s))).lerp(WARM, 0.2).multiplyScalar(k === 0 ? 3.4 : 2.2 * (1 - k / TRAIL) + 0.4);
        wisps.setColorAt(n, _col);
        n++;
      }
    }
    // embers rising
    for (let i = 0; i < NE; i++) {
      const e = E[i];
      const f = fires[e.f];
      const u = (((t + e.t0) / e.dur) % 1);
      _o.position.set(f.x + e.dx * (1 + u * 3) + Math.sin(t * 2 + i) * 0.05 * u, G + 0.3 + u * 1.3, f.z + e.dz * (1 + u * 3));
      _o.scale.setScalar(0.28 * (1 - u));
      _o.updateMatrix();
      wisps.setMatrixAt(n, _o.matrix);
      _col.set('#ff9a40').multiplyScalar(1.8);
      wisps.setColorAt(n, _col);
      n++;
    }
    wisps.instanceMatrix.needsUpdate = true;
    if (wisps.instanceColor) wisps.instanceColor.needsUpdate = true;
  }
  update(0);
  return { object, update };
}
