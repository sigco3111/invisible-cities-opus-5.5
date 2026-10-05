// Zoe — the indivisible city. One ambiguous building, part house, part dome,
// part tower, part tent, repeated without a centre; any roof could be a temple
// or a harem. No wall: at its edges the city crumbles into rocks and scrub, and
// the line that should separate inside from outside is only a drifting dashed ghost.
import { THREE, Builder, M, C, rock } from '../kit.js';
import { setInst, figure, hash } from './_ab_util.js';

const PITCH = 1.42;

export default function build({ rng, accent }) {
  const b = new Builder();
  const object = new THREE.Group();

  /* --------------------------------------------------- the ground -- */
  b.cyl(10.4, 10.45, 0.1, { color: '#cdb894', seg: 72 });
  for (let i = 0; i < 90; i++) {
    const [x, z] = rng.inDisc(10);
    b.disc(rng.range(0.3, 0.9), { x, y: 0.101 + i * 0.0002, z, sx: 1.4, ry: rng.range(0, 3), color: rng.pick(['#c5ad86', '#d6c29c', '#bfa47a']), mat: M.stone, seg: 10 });
  }

  /* --------------------------------- the one hybrid building (unit) -- */
  const WALL = '#ebdfc8', ROOF = '#c47a55', DOME = '#9fc6bf', TENT = '#efe6d2';
  const ub = new Builder();
  ub.box(1.0, 0.8, 1.0, { color: WALL, mat: M.stone });
  // gable roof over the -x half
  {
    const s = new THREE.Shape([new THREE.Vector2(-0.27, 0), new THREE.Vector2(0.27, 0), new THREE.Vector2(0, 0.36)]);
    const g = new THREE.ExtrudeGeometry(s, { depth: 1.06, bevelEnabled: false });
    g.translate(0, 0, -0.53);
    ub.geo(g, { x: -0.25, y: 0.8, color: ROOF, mat: M.flat });
  }
  // a dome on the +x+z quarter
  ub.cyl(0.24, 0.24, 0.12, { x: 0.25, y: 0.8, z: 0.25, color: WALL, mat: M.stone, seg: 14 });
  ub.dome(0.24, { x: 0.25, y: 0.92, z: 0.25, sy: 1.15, color: DOME, mat: M.smooth, seg: 16 });
  ub.sphere(0.03, { x: 0.25, y: 1.22, z: 0.25, color: C.gold, mat: M.smooth, seg: 6 });
  // a slim tower on the +x-z quarter, wrapped at its foot by a tent
  ub.cyl(0.09, 0.1, 1.05, { x: 0.27, y: 0.8, z: -0.27, color: WALL, mat: M.stone, seg: 8 });
  ub.cone(0.14, 0.32, { x: 0.27, y: 1.85, z: -0.27, color: ROOF, mat: M.flat, seg: 8 });
  ub.cone(0.3, 0.32, { x: 0.27, y: 0.8, z: -0.27, color: TENT, mat: M.cloth, seg: 10, open: true });
  for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2; ub.box(0.012, 0.3, 0.012, { x: 0.27 + Math.cos(a) * 0.3, y: 0.62, z: -0.27 + Math.sin(a) * 0.3, color: '#7a5a3a', mat: M.wood }); }
  // a tent awning off the +z face
  ub.box(0.6, 0.015, 0.45, { x: -0.1, y: 0.62, z: 0.68, rx: 0.32, color: '#d9cfb8', mat: M.cloth });
  for (const s of [-0.37, 0.17]) ub.cyl(0.01, 0.01, 0.55, { x: s, y: 0, z: 0.88, color: '#7a5a3a', mat: M.wood, seg: 4 });
  // arched openings on every face: no face is the front
  for (let k = 0; k < 4; k++) {
    const a = (k * Math.PI) / 2;
    const ox = Math.sin(a) * 0.505, oz = Math.cos(a) * 0.505;
    ub.quad(0.22, 0.34, { x: ox, y: 0.2, z: oz, ry: a, color: '#3b3029', mat: M.smooth });
    ub.geo(new THREE.CircleGeometry(0.11, 10, 0, Math.PI), { x: ox, y: 0.37, z: oz, ry: a, color: '#3b3029', mat: M.smooth });
    ub.quad(0.1, 0.13, { x: ox + Math.cos(a) * 0.3, y: 0.55, z: oz - Math.sin(a) * 0.3, ry: a, color: '#3b3029', mat: M.smooth });
  }
  const unitGroup = ub.build();

  /* ------------------------------------------------ the field -- */
  const cells = [];
  for (let r = -9; r <= 9; r++) for (let q = -9; q <= 9; q++) {
    const x = (q + (r % 2 ? 0.5 : 0)) * PITCH, z = r * PITCH * 0.88;
    const d = Math.hypot(x, z);
    if (d > 9.9) continue;
    cells.push({ x: x + rng.range(-0.06, 0.06), z: z + rng.range(-0.06, 0.06), d });
  }
  const units = [], courts = [];
  for (const c of cells) {
    // presence fades with distance — there is no edge, only thinning
    const p = 1 - Math.max(0, (c.d - 6.0) / 3.4);
    const n = hash(c.x * 1.7, c.z * 2.3);
    if (n < p * 0.93) {
      if (c.d < 7.5 && rng.chance(0.07)) { courts.push(c); continue; }
      const k = Math.max(0, (c.d - 6.0) / 3.4); // erosion near the outside
      units.push({ x: c.x, z: c.z, ry: rng.int(0, 3) * (Math.PI / 2), sink: k * k * 0.7, sy: 1 - k * 0.35 });
    } else {
      // rocks that share the buildings' silhouettes, and scrub
      if (rng.chance(0.75)) rock(b, { x: c.x, y: 0.05, z: c.z, r: rng.range(0.35, 0.65), h: rng.range(0.5, 1.2), color: rng.pick(['#b79f7c', '#a89070', '#c4ad8a', '#9c8669']), rand: rng, detail: 0 });
      for (let k = 0; k < 3; k++) b.geo(new THREE.IcosahedronGeometry(rng.range(0.1, 0.22), 0), { x: c.x + rng.range(-0.6, 0.6), y: 0.15, z: c.z + rng.range(-0.6, 0.6), sy: 0.7, color: rng.pick(['#7d8a55', '#8f9460', '#6f7a4c']), mat: M.flat });
    }
  }
  // some units at the edge are half-turned to rock: a rock pressing into the wall
  for (const u of units) if (u.sink > 0.15 && rng.chance(0.6)) rock(b, { x: u.x + rng.range(-0.4, 0.4), y: 0, z: u.z + rng.range(-0.4, 0.4), r: rng.range(0.4, 0.6), h: rng.range(0.5, 0.9), color: rng.pick(['#b79f7c', '#a89070']), rand: rng, detail: 0 });

  // instanced units: one instanced mesh per material of the unit
  // the same building piled on itself here and there: tall ambiguous stacks with no centre
  const place = [];
  for (const u of units) {
    const sy = u.sy * (1.25 + 0.5 * hash(u.x * 3.1, u.z * 1.3) * (1 - u.sink));
    place.push([u.x, 0.1 - u.sink, u.z, 1, u.ry, sy]);
    const tall = u.sink < 0.05 && hash(u.x * 0.71 + 3, u.z * 0.83) > 0.66;
    if (!tall) continue;
    let y = 0.1 + 0.8 * sy, s = 1, ry = u.ry;
    const levels = 2 + Math.floor(hash(u.x * 5.3, u.z * 4.1) * 4.2 * (1 - Math.hypot(u.x, u.z) / 11));
    const lv = levels + (hash(u.x * 2.9 + 1, u.z * 3.7) > 0.85 ? 3 : 0);
    for (let k = 0; k < lv; k++) {
      s *= 0.86; ry += Math.PI / 2;
      const ssy = s * (1.2 + 0.4 * hash(u.x + k, u.z - k));
      place.push([u.x + (k % 2 ? 0.08 : -0.08), y, u.z, s, ry, ssy]);
      y += 0.8 * ssy;
    }
  }
  for (const child of unitGroup.children) {
    const im = new THREE.InstancedMesh(child.geometry, child.material, place.length);
    place.forEach(([x, y, z, sc, ry, sy], i) => setInst(im, i, x, y, z, sc, ry, 0, 0, sy));
    im.castShadow = im.receiveShadow = true;
    im.computeBoundingSphere();
    object.add(im);
  }

  /* --------------------- every point serves for everything: activities -- */
  const acts = ['bed', 'anvil', 'cook', 'gold', 'throne', 'stall', 'oracle', 'bath'];
  courts.forEach((c, i) => {
    const kind = acts[i % acts.length];
    const x = c.x, z = c.z, y = 0.1;
    if (kind === 'bed') {
      b.box(0.5, 0.15, 0.8, { x, y, z, color: '#8a5d3d', mat: M.wood });
      b.box(0.48, 0.07, 0.78, { x, y: y + 0.15, z, color: '#efe6d2', mat: M.cloth });
      b.box(0.3, 0.07, 0.15, { x, y: y + 0.22, z: z - 0.28, color: '#ffffff', mat: M.cloth });
      b.box(0.5, 0.03, 0.4, { x, y: y + 0.23, z: z + 0.15, color: accent, mat: M.cloth });
    } else if (kind === 'anvil') {
      b.box(0.18, 0.2, 0.14, { x, y, z, color: '#3a3433', mat: M.rough_metal });
      b.box(0.36, 0.08, 0.16, { x, y: y + 0.2, z, color: '#4a4442', mat: M.rough_metal });
      b.sphere(0.12, { x: x + 0.4, y: y + 0.08, z, sy: 0.5, mat: M.glow, color: '#ff7a2a', glow: 2.2 });
      figure(b, { x: x - 0.3, y, z, h: 0.32, color: '#5a4a3e', ry: Math.PI / 2, arms: 1 });
    } else if (kind === 'cook') {
      b.sphere(0.09, { x, y: y + 0.05, z, sy: 0.4, mat: M.glow, color: '#ff8a3a', glow: 2.2 });
      b.lathe([[0.02, 0], [0.16, 0.02], [0.19, 0.12], [0.16, 0.22]], { x, y: y + 0.1, z, color: '#4a4040', mat: M.metal, seg: 12 });
      for (let k = 0; k < 3; k++) { const a = (k / 3) * Math.PI * 2; b.rod([x + Math.cos(a) * 0.25, y, z + Math.sin(a) * 0.25], [x, y + 0.5, z], 0.01, { color: '#5a4a3e', mat: M.wood, seg: 3 }); }
      figure(b, { x: x + 0.3, y, z: z + 0.2, h: 0.3, color: '#b0603a', ry: -2 });
    } else if (kind === 'gold') {
      for (let k = 0; k < 4; k++) b.cone(0.18 - k * 0.03, 0.18, { x: x + rng.range(-0.15, 0.15), y, z: z + rng.range(-0.15, 0.15), color: C.gold, mat: M.metal, seg: 9 });
      b.box(0.3, 0.2, 0.2, { x: x - 0.3, y, z, color: '#6b4a2e', mat: M.wood });
    } else if (kind === 'throne') {
      b.box(0.5, 0.12, 0.5, { x, y, z, color: '#c9b79a', mat: M.stone });
      b.box(0.26, 0.24, 0.24, { x, y: y + 0.12, z, color: '#b3373a', mat: M.cloth });
      b.box(0.26, 0.5, 0.05, { x, y: y + 0.12, z: z - 0.12, color: C.gold, mat: M.metal });
      figure(b, { x, y: y + 0.2, z, h: 0.3, color: '#7a3f8f' });
      b.cone(0.05, 0.06, { x, y: y + 0.47, z, color: C.gold, mat: M.metal, seg: 5 });
    } else if (kind === 'stall') {
      b.box(0.6, 0.3, 0.3, { x, y, z, color: '#a57a50', mat: M.wood });
      for (let k = 0; k < 5; k++) b.sphere(0.05, { x: x - 0.2 + k * 0.1, y: y + 0.34, z, color: rng.pick(['#e05a4a', '#f2d14b', '#8aa83a']), mat: M.smooth, seg: 6 });
      b.box(0.7, 0.02, 0.45, { x, y: y + 0.65, z, rx: 0.2, color: accent, mat: M.cloth });
      for (const s of [-0.32, 0.32]) b.cyl(0.01, 0.01, 0.65, { x: x + s, y, z: z + 0.2, color: '#5a4a3e', mat: M.wood, seg: 4 });
    } else if (kind === 'oracle') {
      for (let k = 0; k < 3; k++) { const a = (k / 3) * Math.PI * 2; b.rod([x + Math.cos(a) * 0.2, y, z + Math.sin(a) * 0.2], [x, y + 0.45, z], 0.012, { color: C.gold, mat: M.metal, seg: 4 }); }
      b.lathe([[0.02, 0], [0.12, 0.03], [0.15, 0.1]], { x, y: y + 0.43, z, color: C.gold, mat: M.metal, seg: 12 });
      b.sphere(0.06, { x, y: y + 0.55, z, mat: M.glow, color: '#b9a0ff', glow: 2.5, seg: 8 });
      figure(b, { x: x + 0.3, y, z, h: 0.32, color: '#efe6d2', ry: -Math.PI / 2, arms: 1 });
    } else {
      b.geo(new THREE.SphereGeometry(1, 14, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), { x, y: y + 0.22, z, sx: 0.25, sy: 0.22, sz: 0.45, color: '#fbfaf6', mat: M.smooth });
      b.disc(0.22, { x, y: y + 0.2, z, sz: 1.8, color: '#9fd0df', mat: M.water, seg: 14 });
    }
  });
  // people, indistinguishable, everywhere
  for (let i = 0; i < 40; i++) {
    const [x, z] = rng.inDisc(8.5);
    figure(b, { x, y: 0.1, z, h: 0.3, color: rng.pick(['#e9dfc9', '#c9b79a', '#b0603a', '#7d8f86']), ry: rng.range(0, 6) });
  }
  // outside: the howl of wolves; inside: the rumble of wheels
  for (const [a, r] of [[2.3, 9.4], [2.5, 9.1], [4.1, 9.5], [5.7, 9.2]]) {
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    b.push({ x, y: 0.1, z, ry: rng.range(0, 6) });
    b.sphere(0.08, { y: 0.2, sz: 2, color: '#6a645c', mat: M.smooth, seg: 8 });
    b.sphere(0.055, { y: 0.32, z: 0.17, color: '#6a645c', mat: M.smooth, seg: 6 });
    b.cone(0.03, 0.1, { y: 0.32, z: 0.24, rx: -1.0, color: '#6a645c', mat: M.smooth, seg: 4 }); // muzzle raised: howling
    for (const [lx, lz] of [[-0.04, 0.1], [0.04, 0.1], [-0.04, -0.1], [0.04, -0.1]]) b.rod([lx, 0.18, lz], [lx, 0, lz], 0.012, { color: '#5a554e', mat: M.smooth, seg: 3 });
    b.rod([0, 0.22, -0.15], [0, 0.15, -0.3], 0.02, { color: '#6a645c', mat: M.smooth, seg: 4 });
    b.pop();
  }
  {
    const x = 1.2, z = -2.1;
    b.box(0.5, 0.18, 0.3, { x, y: 0.22, z, color: '#8a5d3d', mat: M.wood });
    for (const s of [-1, 1]) b.torus(0.15, 0.025, { x, y: 0.25, z: z + s * 0.17, color: '#5a3d2a', mat: M.wood, tseg: 12, rseg: 4 });
  }

  object.add(b.build());

  /* ------------------------------- the ghost of a wall that isn't there -- */
  const gb = new Builder();
  const RG = 7.0;
  const N = 64;
  const pane = new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.06, depthWrite: false, side: THREE.DoubleSide });
  const WH = 2.1;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const len = ((Math.PI * 2 * RG) / N) * 0.55;
    const o = { x: Math.cos(a) * RG, z: Math.sin(a) * RG, ry: -a + Math.PI / 2 };
    // a dashed outline, like a wall drawn in a surveyor's plan
    gb.box(len, 0.02, 0.05, { ...o, y: 0.12, color: '#eaf6f2', mat: M.glow, glow: 1.1 });
    gb.box(len, 0.02, 0.05, { ...o, y: 0.12 + WH, color: '#eaf6f2', mat: M.glow, glow: 1.1 });
    if (i % 2 === 0) gb.box(len * 0.5, 0.02, 0.05, { ...o, y: 0.12 + WH * 0.62, color: '#eaf6f2', mat: M.glow, glow: 0.8 });
    gb.box(len, WH, 0.02, { ...o, y: 0.12, color: '#ffffff', mat: pane });
    if (i % 4 === 0) for (let k = 0; k < 5; k++) gb.box(0.03, WH * 0.12, 0.03, { x: o.x, z: o.z, y: 0.12 + k * WH * 0.21, ry: o.ry, color: '#eaf6f2', mat: M.glow, glow: 1.1 });
    // ghost merlons on top
    if (i % 2 === 1) gb.box(len * 0.6, 0.02, 0.05, { ...o, y: 0.12 + WH + 0.28, color: '#eaf6f2', mat: M.glow, glow: 0.9 });
  }
  const ghost = gb.build({ shadows: false });
  object.add(ghost);

  const update = (t) => {
    ghost.rotation.y = t * 0.02; // the line drifts; it cannot be pinned down
  };
  return { object, update };
}
