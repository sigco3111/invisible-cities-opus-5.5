// Hypatia — signs form a language, but not the one you think. An elegant marble
// city round a clear lagoon. The signposts point the wrong way; horses look out
// of the palace windows while a throne waits in the stables; the philosopher
// stands in the children's sandpit; staircases climb to nothing; and in the
// lagoon the reflections are of other buildings, while the drowned lie below.
import { THREE, Builder, M, C, column, tree } from '../kit.js';
import { figure, setInst } from './_ab_util.js';

const P = 1.2; // terrace height: the city stands on a marble plinth so the lagoon can be deep
const lagoonR = (a) => 3.5 + 0.45 * Math.sin(2 * a + 0.6) + 0.3 * Math.sin(3 * a + 2.0);
const LC = [0, 0.4]; // lagoon centre

export default function build({ rng, accent }) {
  const b = new Builder();
  const object = new THREE.Group();
  const MARBLE = '#f1ebe1', PINK = '#ead1c4', SEA = '#a9cfc4', GOLD = '#e2b354';

  /* --------------------------------------- the terrace and its lagoon -- */
  {
    const outer = new THREE.Shape();
    const n = 96;
    for (let i = 0; i <= n; i++) { const a = (i / n) * Math.PI * 2; const p = new THREE.Vector2(Math.cos(a) * 10.35, -Math.sin(a) * 10.35); i ? outer.lineTo(p.x, p.y) : outer.moveTo(p.x, p.y); }
    const hole = new THREE.Path();
    for (let i = 0; i <= 72; i++) { const a = (i / 72) * Math.PI * 2; const r = lagoonR(a); const p = new THREE.Vector2(LC[0] + Math.cos(a) * r, -(LC[1] + Math.sin(a) * r)); i ? hole.lineTo(p.x, p.y) : hole.moveTo(p.x, p.y); }
    outer.holes.push(hole);
    const g = new THREE.ExtrudeGeometry(outer, { depth: P, bevelEnabled: false, curveSegments: 4 });
    g.rotateX(-Math.PI / 2);
    b.geo(g, { color: '#ddd3c2', mat: M.stone });
    // cornice and plinth mouldings
    b.torus(10.38, 0.07, { y: P - 0.05, rx: Math.PI / 2, color: MARBLE, mat: M.smooth, tseg: 96, rseg: 4 });
    b.torus(10.38, 0.05, { y: 0.15, rx: Math.PI / 2, color: '#cfc4b0', mat: M.smooth, tseg: 96, rseg: 4 });
    // concentric bands of paving round the lagoon
    for (let k = 0; k < 3; k++) {
      const pts = [];
      for (let i = 0; i <= 72; i++) { const a = (i / 72) * Math.PI * 2; pts.push([LC[0] + Math.cos(a) * (lagoonR(a) + 0.9 + k * 1.1), LC[1] + Math.sin(a) * (lagoonR(a) + 0.9 + k * 1.1)]); }
      b.tube(pts.map(([x, z]) => [x, P, z]), 0.06, { sy: 0.2, color: k % 2 ? '#cbbfa9' : '#e9e0d0', mat: M.smooth, rseg: 4, tseg: 140, closed: true });
    }
    // the lagoon basin floor and its marble rim
    b.cyl(4.6, 4.6, 0.06, { x: LC[0], y: 0.06, z: LC[1], color: '#3d6b6f', mat: M.stone, seg: 48 });
    for (let i = 0; i < 72; i++) {
      const a0 = (i / 72) * Math.PI * 2, a1 = ((i + 1) / 72) * Math.PI * 2;
      const p0 = [LC[0] + Math.cos(a0) * lagoonR(a0), LC[1] + Math.sin(a0) * lagoonR(a0)];
      const p1 = [LC[0] + Math.cos(a1) * lagoonR(a1), LC[1] + Math.sin(a1) * lagoonR(a1)];
      b.beam([p0[0], P + 0.04, p0[1]], [p1[0], P + 0.04, p1[1]], 0.14, { color: MARBLE, mat: M.smooth });
    }
  }

  /* -------------------------------------- what the lagoon hides -- */
  // reflections that are not reflections: upside-down, other buildings
  const under = (x, z, ry, fn) => { b.push({ x, y: 1.0, z, ry, rz: Math.PI }); fn(); b.pop(); };
  // the palace's "reflection" is a stable
  under(0.2, -2.0, 0, () => {
    b.box(1.6, 0.5, 0.8, { color: '#9a7350', mat: M.wood });
    b.geo(new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1).rotateY(Math.PI / 4).translate(0, 0.5, 0), { y: 0.5, sx: 1.7, sz: 0.9, sy: 0.35, color: '#7a4a32', mat: M.flat });
  });
  // the library's "reflection" is a playground slide and swing
  under(-2.3, 0.6, Math.PI / 2, () => {
    for (const s of [-0.35, 0.35]) b.rod([s, 0, -0.25], [s, 0.6, 0], 0.02, { color: '#c8433a', mat: M.smooth, seg: 4 });
    b.rod([-0.4, 0.6, 0], [0.4, 0.6, 0], 0.02, { color: '#c8433a', mat: M.smooth, seg: 4 });
    b.box(0.3, 0.2, 0.06, { y: 0.15, color: '#f2d14b', mat: M.smooth });
  });
  // the drowned: pale figures lying on the bottom, stones tied to them; crabs
  for (const [x, z, a] of [[0.9, 1.4, 0.4], [-1.1, -0.6, 2.0], [1.8, -0.4, 1.2]]) {
    b.push({ x, y: 0.12, z, ry: a });
    b.box(0.09, 0.07, 0.34, { color: '#cfd8d6', mat: M.smooth });
    b.sphere(0.055, { z: 0.22, y: 0.03, color: '#cfd8d6', mat: M.smooth, seg: 8 });
    b.rod([0, 0.04, 0.25], [0.15, 0.04, 0.45], 0.006, { color: '#555', seg: 3 });
    b.sphere(0.07, { x: 0.17, z: 0.48, y: 0.04, color: '#6b6560', mat: M.flat, seg: 5 });
    b.pop();
    for (let k = 0; k < 3; k++) b.sphere(0.03, { x: x + rng.range(-0.3, 0.3), y: 0.13, z: z + rng.range(-0.3, 0.3), sx: 1.5, sy: 0.6, color: '#c8433a', mat: M.smooth, seg: 6 });
  }
  for (let i = 0; i < 18; i++) {
    const [x, z] = rng.inDisc(3.0);
    b.sphere(rng.range(0.06, 0.14), { x: LC[0] + x, y: 0.1, z: LC[1] + z, sy: 0.5, color: rng.pick(['#5c7f74', '#7a8f7d', '#4b6a66']), mat: M.flat, seg: 5 });
  }
  // the clear water surface (custom: clearer than the kit's water so the secrets show)
  {
    const pts = [];
    for (let i = 0; i < 72; i++) { const a = (i / 72) * Math.PI * 2; const r = lagoonR(a) + 0.02; pts.push([LC[0] + Math.cos(a) * r, LC[1] + Math.sin(a) * r]); }
    const water = new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.04, metalness: 0.1, transparent: true, opacity: 0.42, clearcoat: 1, depthWrite: false });
    water.userData.noShadow = true;
    b.slab(pts, 0.02, { y: 1.02, color: '#7fbfc4', mat: water });
  }
  // bathers' promise on the shore: cabins and parasols, a diving board, steps into the water
  for (let i = 0; i < 5; i++) {
    const a = 0.35 + i * 0.22;
    const r = lagoonR(a) + 0.9;
    const x = LC[0] + Math.cos(a) * r, z = LC[1] + Math.sin(a) * r;
    b.box(0.4, 0.6, 0.4, { x, y: P, z, ry: -a, color: i % 2 ? '#ffffff' : SEA, mat: M.wood });
    for (let k = 0; k < 4; k++) b.box(0.42, 0.06, 0.02, { x, y: P + 0.1 + k * 0.13, z, ry: -a, color: accent, mat: M.wood, matrix: new THREE.Matrix4().makeTranslation(Math.cos(a) * 0.2, 0, Math.sin(a) * 0.2) });
    b.geo(new THREE.ConeGeometry(0.42, 0.22, 3), { x, y: P + 0.6, z, ry: -a, color: '#c86f55', mat: M.flat });
  }
  for (const [a, r, col] of [[1.8, 1.4, '#e05a4a'], [2.1, 1.6, accent], [0.15, 1.4, '#f2d14b']]) {
    const x = LC[0] + Math.cos(a) * (lagoonR(a) + r), z = LC[1] + Math.sin(a) * (lagoonR(a) + r);
    b.cyl(0.015, 0.015, 0.9, { x, y: P, z, color: '#ddd', mat: M.smooth, seg: 4 });
    for (let k = 0; k < 8; k++) b.geo(new THREE.ConeGeometry(0.5, 0.2, 2, 1, true, (k / 8) * Math.PI * 2, Math.PI / 4), { x, y: P + 0.8, z, color: k % 2 ? '#ffffff' : col, mat: M.cloth });
    b.box(0.3, 0.04, 0.6, { x: x + 0.3, y: P + 0.05, z, color: '#f4efe2', mat: M.cloth });
  }
  {
    // a marble stair descending into the water
    const a = 2.7, r = lagoonR(a);
    for (let k = 0; k < 7; k++) b.box(0.9, 0.12, 0.25, { x: LC[0] + Math.cos(a) * (r - 0.1 - k * 0.22), y: P - 0.12 - k * 0.14, z: LC[1] + Math.sin(a) * (r - 0.1 - k * 0.22), ry: -a + Math.PI / 2, color: MARBLE, mat: M.smooth });
  }

  /* ---------------------------------------------------- buildings -- */
  // the palace — its arcades are full of horses
  {
    const x = 0, z = -6.6;
    b.push({ x, y: P, z });
    b.box(5.0, 0.2, 2.2, { color: MARBLE, mat: M.smooth });
    b.box(4.6, 2.2, 1.6, { y: 0.2, z: -0.2, color: PINK, mat: M.stone });
    b.box(4.8, 0.14, 1.8, { y: 2.4, z: -0.2, color: MARBLE, mat: M.smooth });
    for (let i = 0; i < 9; i++) column(b, { x: -2.2 + i * 0.55, y: 0.2, z: 0.75, r: 0.07, h: 1.0, color: MARBLE });
    b.box(4.7, 0.12, 0.5, { y: 1.2, z: 0.65, color: MARBLE, mat: M.smooth });
    for (let i = 0; i < 8; i++) {
      b.quad(0.36, 0.7, { x: -1.92 + i * 0.55, y: 0.6, z: 0.61, color: '#3e3430', mat: M.smooth });
      b.quad(0.24, 0.42, { x: -1.92 + i * 0.55, y: 1.75, z: 0.61, color: i % 3 ? '#3e3430' : C.lamp, mat: i % 3 ? M.smooth : M.glow, glow: 1.5 });
    }
    // horses in the arcades and one at an upper window
    for (const hx of [-1.37, 0.28, 1.38]) {
      b.push({ x: hx, y: 0.2, z: 0.45, ry: rng.range(-0.4, 0.4) });
      const col = rng.pick(['#7a4a2e', '#e9e2d6', '#3a2a22']);
      b.sphere(0.12, { y: 0.42, sz: 2.0, color: col, mat: M.smooth, seg: 8 });
      b.rod([0, 0.48, 0.18], [0, 0.7, 0.3], 0.05, { color: col, mat: M.smooth, seg: 6 });
      b.sphere(0.06, { y: 0.72, z: 0.36, sz: 1.6, color: col, mat: M.smooth, seg: 6 });
      for (const [lx, lz] of [[-0.06, 0.16], [0.06, 0.16], [-0.06, -0.16], [0.06, -0.16]]) b.rod([lx, 0.36, lz], [lx, 0, lz], 0.018, { color: col, mat: M.smooth, seg: 4 });
      b.rod([0, 0.45, -0.22], [0, 0.3, -0.32], 0.02, { color: '#2a2a2a', mat: M.smooth, seg: 4 });
      b.pop();
    }
    b.sphere(0.07, { x: -0.82, y: 1.85, z: 0.66, sz: 1.6, color: '#e9e2d6', mat: M.smooth, seg: 6 });
    // dome and pediment
    b.cyl(0.8, 0.8, 0.4, { y: 2.54, z: -0.2, color: MARBLE, mat: M.smooth, seg: 20 });
    b.dome(0.8, { y: 2.94, z: -0.2, sy: 1.2, color: SEA, mat: M.smooth, seg: 20 });
    b.sphere(0.08, { y: 3.95, z: -0.2, color: GOLD, mat: M.metal, seg: 8 });
    for (const s of [-1, 1]) { b.box(0.7, 2.9, 0.7, { x: s * 2.4, y: 0.2, z: -0.1, color: PINK, mat: M.stone }); b.cone(0.55, 0.9, { x: s * 2.4, y: 3.1, z: -0.1, seg: 4, ry: 0.785, color: SEA, mat: M.flat }); }
    b.pop();
  }
  // the stables — a barn of planks, but a throne and chandelier inside
  {
    const x = 6.5, z = -2.4;
    b.push({ x, y: P, z, ry: -Math.PI / 2 + 0.2 });
    b.box(2.6, 1.3, 1.8, { color: '#a57a50', mat: M.wood });
    for (let i = 0; i < 12; i++) b.box(0.02, 1.3, 0.02, { x: -1.25 + i * 0.22, z: 0.91, color: '#7a5535', mat: M.wood });
    b.geo(new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1).rotateY(Math.PI / 4).translate(0, 0.5, 0), { y: 1.3, sx: 2.8, sz: 2.0, sy: 0.8, color: '#7a4a32', mat: M.flat });
    b.box(1.0, 1.0, 0.04, { y: 0.0, z: 0.92, color: '#2f2420', mat: M.smooth }); // wide-open door
    b.box(0.32, 0.3, 0.3, { y: 0.0, z: 0.55, color: '#b3373a', mat: M.cloth }); // the throne
    b.box(0.32, 0.6, 0.06, { y: 0.0, z: 0.4, color: GOLD, mat: M.metal });
    b.torus(0.18, 0.015, { y: 0.85, z: 0.6, rx: Math.PI / 2, color: GOLD, mat: M.metal, tseg: 14, rseg: 3 });
    for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; b.sphere(0.025, { x: Math.cos(a) * 0.18, y: 0.89, z: 0.6 + Math.sin(a) * 0.18, mat: M.glow, color: C.lamp, glow: 3, seg: 5 }); }
    figure(b, { x: 0.3, y: 0, z: 0.7, h: 0.34, color: '#7a3f8f' }); // the sultana's maid
    // hay bales outside
    for (let i = 0; i < 3; i++) b.cyl(0.18, 0.18, 0.3, { x: -0.8 + i * 0.4, y: 0.18, z: 1.25, rz: Math.PI / 2, color: '#d9b860', mat: M.cloth, seg: 10 });
    b.pop();
  }
  // the library — great dome, empty shelves seen through the portico
  {
    const x = -6.4, z = -1.4;
    b.push({ x, y: P, z, ry: Math.PI / 2 - 0.15 });
    b.box(3.0, 0.2, 2.4, { color: MARBLE, mat: M.smooth });
    b.box(2.6, 1.9, 1.8, { y: 0.2, z: -0.25, color: MARBLE, mat: M.stone });
    for (let i = 0; i < 6; i++) column(b, { x: -1.15 + i * 0.46, y: 0.2, z: 0.95, r: 0.08, h: 1.9, color: MARBLE });
    const s = new THREE.Shape([new THREE.Vector2(-1.4, 0), new THREE.Vector2(1.4, 0), new THREE.Vector2(0, 0.5)]);
    const pg = new THREE.ExtrudeGeometry(s, { depth: 0.6, bevelEnabled: false }); pg.translate(0, 0, -0.3);
    b.box(2.9, 0.15, 0.7, { y: 2.1, z: 0.75, color: MARBLE, mat: M.smooth });
    b.geo(pg, { y: 2.25, z: 0.75, color: MARBLE, mat: M.smooth });
    // shelves on the back wall of the portico: rows of identical blank books
    for (let r = 0; r < 4; r++) {
      b.box(2.2, 0.03, 0.12, { y: 0.4 + r * 0.38, z: 0.68, color: '#8a6a4a', mat: M.wood });
      for (let k = 0; k < 24; k++) if (rng.chance(0.55)) b.box(0.06, 0.26, 0.09, { x: -1.05 + k * 0.09, y: 0.43 + r * 0.38, z: 0.68, color: '#f6f2ea', mat: M.smooth });
    }
    b.cyl(0.85, 0.85, 0.35, { y: 2.1, z: -0.3, color: MARBLE, mat: M.smooth, seg: 20 });
    b.dome(0.85, { y: 2.45, z: -0.3, color: '#cfc6b5', mat: M.smooth, seg: 20 });
    b.cone(0.06, 0.35, { y: 3.3, z: -0.3, color: GOLD, mat: M.metal, seg: 6 });
    b.pop();
  }
  // the playground — the philosopher stands in the sandpit among the children
  const PG = { x: -4.4, z: 5.6 };
  {
    b.box(2.6, 0.08, 1.8, { x: PG.x, y: P, z: PG.z, color: '#e7cf96', mat: M.stone });
    b.box(2.7, 0.14, 0.08, { x: PG.x, y: P, z: PG.z - 0.94, color: '#b48b5d', mat: M.wood });
    b.box(2.7, 0.14, 0.08, { x: PG.x, y: P, z: PG.z + 0.94, color: '#b48b5d', mat: M.wood });
    // the philosopher on a little plinth: robe, beard, a scroll
    b.box(0.4, 0.3, 0.4, { x: PG.x + 0.5, y: P + 0.08, z: PG.z, color: MARBLE, mat: M.smooth });
    b.push({ x: PG.x + 0.5, y: P + 0.38, z: PG.z, ry: 0.4 });
    b.cyl(0.08, 0.18, 0.8, { color: '#ece6da', mat: M.smooth, seg: 10 });
    b.sphere(0.1, { y: 0.9, color: '#ece6da', mat: M.smooth, seg: 10 });
    b.cone(0.07, 0.16, { y: 0.72, z: 0.06, rx: Math.PI, color: '#ece6da', mat: M.smooth, seg: 6 });
    b.rod([0.12, 0.55, 0], [0.22, 0.7, 0.12], 0.035, { color: '#ece6da', mat: M.smooth, seg: 5 });
    b.cyl(0.03, 0.03, 0.22, { x: 0.22, y: 0.62, z: 0.12, rz: 0.3, color: '#e6dcc4', mat: M.smooth, seg: 6 });
    b.pop();
    // children around him
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; figure(b, { x: PG.x + 0.5 + Math.cos(a) * 0.55, y: P + 0.08, z: PG.z + Math.sin(a) * 0.55, h: 0.22, color: rng.pick(['#e05a4a', '#f2d14b', '#4f8fc9', accent]), ry: -a - Math.PI / 2, arms: rng.chance(0.5) ? 1 : 0 }); }
    // a slide
    b.box(0.3, 0.6, 0.3, { x: PG.x - 0.8, y: P + 0.08, z: PG.z - 0.4, color: '#4f8fc9', mat: M.smooth });
    b.box(0.25, 0.03, 0.9, { x: PG.x - 0.8, y: P + 0.35, z: PG.z + 0.1, rx: -0.6, color: '#f2d14b', mat: M.smooth });
    // swing frame (the swings themselves move)
    for (const s of [-0.5, 0.5]) { b.rod([PG.x - 0.3 + s, P + 0.08, PG.z + 0.75], [PG.x - 0.3 + s * 0.8, P + 1.2, PG.z + 0.5], 0.025, { color: '#c8433a', mat: M.smooth, seg: 5 }); b.rod([PG.x - 0.3 + s, P + 0.08, PG.z + 0.25], [PG.x - 0.3 + s * 0.8, P + 1.2, PG.z + 0.5], 0.025, { color: '#c8433a', mat: M.smooth, seg: 5 }); }
    b.rod([PG.x - 0.75, P + 1.2, PG.z + 0.5], [PG.x + 0.15, P + 1.2, PG.z + 0.5], 0.025, { color: '#c8433a', mat: M.smooth, seg: 5 });
    // seesaw pivot
    b.box(0.12, 0.2, 0.12, { x: PG.x + 0.1, y: P + 0.08, z: PG.z - 0.6, color: '#7a5535', mat: M.wood });
  }
  // villas, trees
  for (const [x, z, ry] of [[-7.6, 3.2, 0.9], [7.4, 2.8, -0.9], [-3.2, -8.6, 0.2], [3.4, -8.7, -0.2], [7.9, -5.8, -0.6], [-8.0, -5.3, 0.6], [1.2, 8.6, 0], [6.4, 6.6, -0.6]]) {
    b.push({ x, y: P, z, ry });
    b.box(1.2, 1.0, 0.9, { color: rng.pick([PINK, MARBLE, '#e2d9c4']), mat: M.stone });
    b.geo(new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1).rotateY(Math.PI / 4).translate(0, 0.5, 0), { y: 1.0, sx: 1.3, sz: 1.0, sy: 0.35, color: '#c47a55', mat: M.flat });
    for (const s of [-0.3, 0.3]) b.quad(0.2, 0.32, { x: s, y: 0.55, z: 0.46, color: rng.chance(0.5) ? C.lamp : '#3e3430', mat: rng.chance(0.5) ? M.glow : M.smooth, glow: 1.4 });
    b.box(1.3, 0.05, 0.3, { y: 0.5, z: 0.6, color: MARBLE, mat: M.smooth });
    b.pop();
  }
  for (let i = 0; i < 26; i++) {
    const [x, z] = rng.inDisc(9.8, 4.6);
    if (Math.hypot(x - PG.x, z - PG.z) < 1.8 || Math.abs(x) < 2.8 && z < -5 || (x < -4.8 && z > -3 && z < 0.2) || (x > 5.2 && z < -0.8 && z > -4)) continue;
    tree(b, { x, y: P, z, h: rng.range(1.2, 2.0), kind: rng.pick(['cypress', 'cypress', 'palm', 'round']), r: rng });
  }
  // a curved colonnade embracing the back of the lagoon, statues and lamps on the rim
  {
    const a0 = Math.PI * 1.08, a1 = Math.PI * 1.92, n = 22;
    const R = (a) => lagoonR(a) + 1.5;
    const tops = [];
    for (let i = 0; i <= n; i++) {
      const a = a0 + ((a1 - a0) * i) / n;
      const x = LC[0] + Math.cos(a) * R(a), z = LC[1] + Math.sin(a) * R(a);
      column(b, { x, y: P, z, r: 0.07, h: 1.3, color: MARBLE });
      tops.push([x, P + 1.36, z]);
    }
    for (let i = 0; i < n; i++) b.beam(tops[i], tops[i + 1], 0.16, { color: MARBLE, mat: M.smooth });
    for (let i = 0; i < n; i += 2) b.sphere(0.06, { x: tops[i][0], y: tops[i][1] + 0.14, z: tops[i][2], color: GOLD, mat: M.metal, seg: 6 });
  }
  for (const a of [0.2, 1.3, 2.4, 3.3, 4.2, 5.2]) {
    const r = lagoonR(a) + 0.45;
    const x = LC[0] + Math.cos(a) * r, z = LC[1] + Math.sin(a) * r;
    if (a < 3) { b.box(0.22, 0.35, 0.22, { x, y: P, z, color: '#d8cdb8', mat: M.smooth }); figure(b, { x, y: P + 0.35, z, h: 0.42, color: '#f4efe6', skin: '#f4efe6', ry: -a - Math.PI / 2, arms: 0.6 }); }
    else { b.cyl(0.02, 0.025, 1.0, { x, y: P, z, color: '#3a3433', mat: M.metal, seg: 5 }); b.sphere(0.07, { x, y: P + 1.05, z, mat: M.glow, color: C.lamp, glow: 2.5, seg: 8 }); }
  }
  // stairs that lead to nothing
  const stairNowhere = (x, z, ry, n) => {
    b.push({ x, y: P, z, ry });
    for (let k = 0; k < n; k++) {
      b.box(0.7, 0.07, 0.24, { y: k * 0.19, z: k * 0.2, color: MARBLE, mat: M.smooth });
      b.box(0.05, 0.19, 0.05, { x: -0.33, y: k * 0.19, z: k * 0.2, color: MARBLE, mat: M.smooth });
      b.box(0.05, 0.19, 0.05, { x: 0.33, y: k * 0.19, z: k * 0.2, color: MARBLE, mat: M.smooth });
    }
    b.rod([-0.33, 0.45, 0], [-0.33, 0.45 + (n - 1) * 0.19, (n - 1) * 0.2], 0.02, { color: GOLD, mat: M.metal, seg: 4 });
    b.rod([0.33, 0.45, 0], [0.33, 0.45 + (n - 1) * 0.19, (n - 1) * 0.2], 0.02, { color: GOLD, mat: M.metal, seg: 4 });
    // two slim supports underneath
    b.cyl(0.05, 0.05, (n - 1) * 0.19, { z: (n - 1) * 0.2 * 0.6, y: 0, color: MARBLE, mat: M.smooth, seg: 6 });
    b.pop();
  };
  stairNowhere(5.6, 4.9, 2.4, 16);
  stairNowhere(-2.0, -4.6, 0.3, 12);
  stairNowhere(-8.4, 0.8, 1.4, 10);
  // a spiral stair winding up to nothing, a figure at the top looking around
  for (let k = 0; k < 34; k++) {
    const a = k * 0.42, y = P + k * 0.13;
    b.box(0.45, 0.05, 0.18, { x: 3.4 + Math.cos(a) * 0.32, y, z: -5.0 + Math.sin(a) * 0.32, ry: -a, color: MARBLE, mat: M.smooth });
  }
  b.cyl(0.07, 0.07, 34 * 0.13, { x: 3.4, y: P, z: -5.0, color: MARBLE, mat: M.smooth, seg: 8 });
  figure(b, { x: 3.4 + Math.cos(33 * 0.42) * 0.32, y: P + 33 * 0.13 + 0.03, z: -5.0 + Math.sin(33 * 0.42) * 0.32, h: 0.32, color: '#4f6b8a', arms: 1 });
  // strollers
  for (let i = 0; i < 18; i++) {
    const [x, z] = rng.inDisc(9.6, 4.6);
    figure(b, { x, y: P, z, h: 0.32, color: rng.pick(['#f4efe2', '#4f6b8a', '#e889a8', accent, '#7a5a9a']), ry: rng.range(0, 6) });
  }

  /* --------------------------- signposts pointing the wrong way -- */
  // icons: book (library), crown (palace), horse (stables), wave (lagoon), swing (playground)
  const icon = (bb, kind, col) => {
    if (kind === 'book') { bb.box(0.12, 0.09, 0.02, { x: -0.065, ry: 0.2, color: col, mat: M.smooth }); bb.box(0.12, 0.09, 0.02, { x: 0.065, ry: -0.2, color: col, mat: M.smooth }); }
    else if (kind === 'crown') { bb.box(0.18, 0.05, 0.02, { color: col, mat: M.smooth }); for (let k = -1; k <= 1; k++) bb.cone(0.03, 0.08, { x: k * 0.07, y: 0.05, color: col, mat: M.smooth, seg: 4 }); }
    else if (kind === 'horse') { bb.box(0.14, 0.06, 0.02, { color: col, mat: M.smooth }); bb.box(0.04, 0.1, 0.02, { x: 0.08, y: 0.05, rz: -0.4, color: col, mat: M.smooth }); }
    else if (kind === 'wave') { bb.torus(0.04, 0.012, { x: -0.05, arc: Math.PI, color: col, mat: M.smooth, tseg: 8, rseg: 3 }); bb.torus(0.04, 0.012, { x: 0.05, arc: Math.PI, rz: Math.PI, color: col, mat: M.smooth, tseg: 8, rseg: 3 }); }
    else { bb.rod([-0.06, 0.08, 0], [-0.06, -0.04, 0], 0.01, { color: col, mat: M.smooth, seg: 3 }); bb.rod([0.06, 0.08, 0], [0.06, -0.04, 0], 0.01, { color: col, mat: M.smooth, seg: 3 }); bb.box(0.14, 0.02, 0.03, { y: -0.05, color: col, mat: M.smooth }); }
  };
  const arrowGeo = () => {
    const s = new THREE.Shape([new THREE.Vector2(0, -0.09), new THREE.Vector2(0.62, -0.09), new THREE.Vector2(0.62, -0.15), new THREE.Vector2(0.8, 0), new THREE.Vector2(0.62, 0.15), new THREE.Vector2(0.62, 0.09), new THREE.Vector2(0, 0.09)]);
    return new THREE.ExtrudeGeometry(s, { depth: 0.04, bevelEnabled: false }).translate(0, 0, -0.02);
  };
  const AG = arrowGeo();
  const places = { book: [-6.4, -1.4], crown: [0, -6.6], horse: [6.5, -2.4], wave: LC, swing: [PG.x, PG.z] };
  const kinds = Object.keys(places);
  const turning = [];
  const signpost = (x, z, spin = false) => {
    b.cyl(0.035, 0.045, 2.0, { x, y: P, z, color: '#ece6da', mat: M.smooth, seg: 8 });
    b.sphere(0.06, { x, y: P + 2.02, z, color: GOLD, mat: M.metal, seg: 8 });
    const ks = rng.shuffle(kinds.slice()).slice(0, 3);
    ks.forEach((k, j) => {
      // aim at a wrong place on purpose: the next place in the list
      const wrong = places[kinds[(kinds.indexOf(k) + 1 + j) % kinds.length]];
      const ang = -Math.atan2(wrong[1] - z, wrong[0] - x);
      const y = P + 1.75 - j * 0.3;
      const col = ['#4f8fc9', accent, '#c8433a'][j];
      if (spin) {
        const bb = new Builder();
        bb.geo(AG, { color: col, mat: M.smooth });
        bb.push({ x: 0.36, z: 0.025 }); icon(bb, k, '#ffffff'); bb.pop();
        bb.push({ x: 0.36, z: -0.025, ry: Math.PI }); icon(bb, k, '#ffffff'); bb.pop();
        const g = bb.build();
        g.position.set(x, y, z);
        object.add(g);
        turning.push({ g, base: ang, sp: rng.range(0.15, 0.4) * rng.sign(), ph: rng.range(0, 6) });
      } else {
        b.push({ x, y, z, ry: ang });
        b.geo(AG, { color: col, mat: M.smooth });
        b.push({ x: 0.36, z: 0.025 }); icon(b, k, '#ffffff'); b.pop();
        b.push({ x: 0.36, z: -0.025, ry: Math.PI }); icon(b, k, '#ffffff'); b.pop();
        b.pop();
      }
    });
  };
  signpost(-1.6, 5.2, true); // the great signpost whose arrows cannot decide
  signpost(4.8, 1.0);
  signpost(-4.6, 2.2);
  signpost(2.6, -3.9);
  signpost(-3.3, -4.2);
  signpost(7.2, 4.4);

  object.add(b.build());

  /* ------------------------------------------------- animated toys -- */
  const swings = [-0.55, -0.05].map((ox) => {
    const sb = new Builder();
    sb.rod([-0.12, 0, 0], [-0.12, -0.8, 0], 0.006, { color: '#ddd', seg: 3 });
    sb.rod([0.12, 0, 0], [0.12, -0.8, 0], 0.006, { color: '#ddd', seg: 3 });
    sb.box(0.3, 0.03, 0.14, { y: -0.82, color: '#f2d14b', mat: M.wood });
    figure(sb, { y: -0.8, h: 0.22, color: '#e05a4a', arms: 1 });
    const g = sb.build();
    g.position.set(PG.x - 0.3 + ox + 0.3, P + 1.2, PG.z + 0.5);
    object.add(g);
    return g;
  });
  const seesaw = (() => {
    const sb = new Builder();
    sb.box(1.3, 0.04, 0.12, { color: '#4f8fc9', mat: M.wood });
    figure(sb, { x: -0.55, y: 0.04, h: 0.22, color: '#f2d14b' });
    figure(sb, { x: 0.55, y: 0.04, h: 0.22, color: accent });
    const g = sb.build();
    g.position.set(PG.x + 0.1, P + 0.3, PG.z - 0.6);
    object.add(g);
    return g;
  })();
  const update = (t) => {
    swings[0].rotation.x = Math.sin(t * 1.4) * 0.5;
    swings[1].rotation.x = Math.sin(t * 1.4 + 2.2) * 0.4;
    seesaw.rotation.z = Math.sin(t * 0.9) * 0.22;
    for (const T of turning) T.g.rotation.y = T.base + Math.sin(t * T.sp + T.ph) * 2.2;
  };
  update(0);
  return { object, update };
}
