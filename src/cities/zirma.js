// Zirma — memory is redundant: the city repeats its signs so that it can exist.
// The same skyscraper, block after block; on every cornice the same lunatic
// teetering, on every corner the same blind man, on every pavement the same girl
// walking her puma; and airships drifting past the windows at every height.
import { THREE, Builder, M, C, windows } from '../kit.js';
import { setInst, figure } from './_ab_util.js';

const SP = 3.25; // block pitch

export default function build({ rng, accent }) {
  const b = new Builder();
  const object = new THREE.Group();

  b.cyl(10.4, 10.45, 0.1, { color: '#57534f', seg: 72 });

  // blocks on a grid (the repetition), with a rhythm of heights like a refrain
  const blocks = [];
  for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) {
    const x = i * SP, z = j * SP;
    if (Math.hypot(x, z) > 8.9) continue;
    blocks.push({ x, z, i, j });
  }
  const DESIGNS = [
    { wall: '#e9dcc3', trim: '#c9a25a', crown: 'spire' },
    { wall: '#d9b59a', trim: '#7d8f86', crown: 'step' },
    { wall: '#c9cbbf', trim: '#b4553f', crown: 'dome' },
  ];
  const lunatics = [];
  // pavements and kerbs
  for (const B of blocks) {
    b.box(2.3, 0.08, 2.3, { x: B.x, y: 0.1, z: B.z, color: '#a8a39a', mat: M.stone });
  }
  // zebra crossings repeat too
  for (const B of blocks) for (let k = 0; k < 5; k++) b.box(0.12, 0.012, 0.5, { x: B.x + 1.45 + 0.1, y: 0.1, z: B.z - 0.5 + k * 0.22, ry: Math.PI / 2, color: '#e9e6df', mat: M.smooth });

  for (const B of blocks) {
    const ring = Math.max(Math.abs(B.i), Math.abs(B.j));
    const D = DESIGNS[(B.i + B.j + 9) % 3];
    const H = [15.5, 11.5, 8.0, 5.5][ring] + ((B.i * 7 + B.j * 3) % 2) * 0.6;
    const w = 1.75;
    // three setbacks
    const h1 = H * 0.55, h2 = H * 0.27, h3 = H * 0.12;
    const y0 = 0.18;
    const tiers = [[w, h1], [w * 0.78, h2], [w * 0.56, h3]];
    let y = y0;
    for (let k = 0; k < tiers.length; k++) {
      const [tw, th] = tiers[k];
      b.box(tw, th, tw, { x: B.x, y, z: B.z, color: D.wall, mat: M.stone });
      windows(b, { x: B.x, y, z: B.z, w: tw, d: tw, h: th, lit: 0.22, r: rng, floorH: 0.62, size: 0.17, cols: Math.round(tw / 0.36), color: '#9a6a3c', dark: '#3d4250' });
      // vertical piers in the trim colour
      for (const s of [-1, 1]) for (const f of [0, 1]) {
        const px = f ? s * (tw / 2 + 0.01) : 0, pz = f ? 0 : s * (tw / 2 + 0.01);
        if (f) b.box(0.05, th, 0.08, { x: B.x + px, y, z: B.z + (s * tw) / 4, color: D.trim, mat: M.smooth });
        else b.box(0.08, th, 0.05, { x: B.x + (s * tw) / 4, y, z: B.z + pz, color: D.trim, mat: M.smooth });
      }
      y += th;
      // the cornice: a ledge, where the lunatic walks
      b.box(tw + 0.16, 0.07, tw + 0.16, { x: B.x, y, z: B.z, color: D.trim, mat: M.smooth });
      if (k < 2) {
        const side = (B.i + B.j + k) % 4;
        const a = (side * Math.PI) / 2;
        const off = tw / 2 + 0.03;
        lunatics.push({ x: B.x + Math.sin(a) * off + Math.cos(a) * rng.range(-0.4, 0.4), y: y + 0.07, z: B.z + Math.cos(a) * off - Math.sin(a) * rng.range(-0.4, 0.4), ry: a + Math.PI / 2, ph: rng.range(0, 6.28) });
      }
    }
    // the crown
    const cw = w * 0.56;
    if (D.crown === 'spire') {
      for (let k = 0; k < 4; k++) b.box(cw * (0.8 - k * 0.17), 0.3, cw * (0.8 - k * 0.17), { x: B.x, y: y + 0.07 + k * 0.3, z: B.z, color: k % 2 ? D.trim : D.wall, mat: M.smooth });
      b.cone(0.09, 1.6, { x: B.x, y: y + 1.27, z: B.z, seg: 6, color: '#d9d4c8', mat: M.metal });
      b.sphere(0.05, { x: B.x, y: y + 2.9, z: B.z, mat: M.glow, color: '#ff6a5a', glow: 3, seg: 6 });
    } else if (D.crown === 'step') {
      for (let k = 0; k < 3; k++) b.box(cw * (0.9 - k * 0.25), 0.35, cw * (0.9 - k * 0.25), { x: B.x, y: y + 0.07 + k * 0.35, z: B.z, color: D.trim, mat: M.smooth });
      b.cyl(0.02, 0.02, 1.0, { x: B.x, y: y + 1.1, z: B.z, color: '#555', mat: M.metal, seg: 4 }); // mooring mast for the airships
      b.sphere(0.06, { x: B.x, y: y + 2.1, z: B.z, color: accent, mat: M.smooth, seg: 6 });
    } else {
      b.cyl(cw * 0.42, cw * 0.45, 0.3, { x: B.x, y: y + 0.07, z: B.z, color: D.wall, mat: M.stone, seg: 16 });
      b.dome(cw * 0.42, { x: B.x, y: y + 0.37, z: B.z, sy: 1.3, color: D.trim, mat: M.smooth });
    }
    // street level: shop awnings in the accent and doors
    for (let k = 0; k < 4; k++) {
      const a = (k * Math.PI) / 2;
      b.box(w * 0.7, 0.03, 0.3, { x: B.x + Math.sin(a) * (w / 2 + 0.15), y: 0.75, z: B.z + Math.cos(a) * (w / 2 + 0.15), ry: a, rx: 0.25, color: k % 2 ? accent : '#e9e6df', mat: M.cloth });
    }

    // the repeated vignettes on the pavement: a blind man at the corner shouting, a girl with her puma
    const cx = B.x + 1.0, cz = B.z + 1.0;
    figure(b, { x: cx, y: 0.18, z: cz, h: 0.34, color: '#2f2f35', ry: 0.8, arms: 0 });
    b.rod([cx + 0.05, 0.32, cz + 0.04], [cx + 0.18, 0.18, cz + 0.16], 0.008, { color: '#f4efe6', mat: M.smooth, seg: 3 }); // the white cane
    b.rod([cx - 0.04, 0.38, cz], [cx - 0.12, 0.52, cz - 0.06], 0.012, { color: '#d7b08c', mat: M.smooth, seg: 3 }); // arm raised, shouting
    b.box(0.08, 0.02, 0.02, { x: cx, y: 0.46, z: cz + 0.03, ry: 0.8, color: '#111', mat: M.smooth }); // dark glasses
    const gx = B.x - 1.0, gz = B.z + 0.4 + ((B.i + B.j) % 2) * 0.3;
    figure(b, { x: gx, y: 0.18, z: gz, h: 0.32, color: '#d94f6a', ry: 0, arms: 0 });
    b.cone(0.09, 0.14, { x: gx, y: 0.18, z: gz, seg: 8, color: '#d94f6a', mat: M.cloth });
    // the puma: long low body, small head, long tail
    const px = gx, pz = gz + 0.45;
    b.sphere(0.07, { x: px, y: 0.32, z: pz, sz: 2.4, sx: 0.9, color: '#c8975a', mat: M.smooth, seg: 8 });
    b.sphere(0.055, { x: px, y: 0.38, z: pz + 0.19, color: '#c8975a', mat: M.smooth, seg: 8 });
    b.sphere(0.025, { x: px, y: 0.36, z: pz + 0.24, color: '#efe1c8', mat: M.smooth, seg: 5 });
    for (const [lx, lz] of [[-0.035, 0.1], [0.035, 0.1], [-0.035, -0.1], [0.035, -0.1]]) b.rod([px + lx, 0.3, pz + lz], [px + lx, 0.18, pz + lz + 0.02], 0.013, { color: '#b9874c', mat: M.smooth, seg: 4 });
    b.tube([[px, 0.33, pz - 0.15], [px, 0.26, pz - 0.28], [px + 0.04, 0.22, pz - 0.38], [px + 0.06, 0.27, pz - 0.44]], 0.012, { color: '#b9874c', mat: M.smooth, rseg: 4, tseg: 10 });
    b.rod([gx + 0.06, 0.36, gz + 0.03], [px, 0.4, pz + 0.17], 0.004, { color: '#222', seg: 3 }); // the leash
  }
  // passers-by in the canyons
  for (let i = 0; i < 40; i++) {
    const along = rng.range(-9, 9), k = rng.int(-3, 2);
    const onX = rng.chance(0.5);
    const x = onX ? along : (k + 0.5) * SP + rng.range(-0.3, 0.3), z = onX ? (k + 0.5) * SP + rng.range(-0.3, 0.3) : along;
    if (Math.hypot(x, z) > 9.6) continue;
    figure(b, { x, y: 0.1, z, h: 0.3, color: rng.pick(['#4a4a52', '#7a6a5a', '#9a8f80', '#5a6b8a']), ry: onX ? Math.PI / 2 : 0 });
  }
  // street lamps
  for (const B of blocks) b.sphere(0.05, { x: B.x + 1.25, y: 0.9, z: B.z - 1.25, mat: M.glow, color: C.lamp, glow: 2.5, seg: 6 });
  for (const B of blocks) b.cyl(0.015, 0.015, 0.75, { x: B.x + 1.25, y: 0.15, z: B.z - 1.25, color: '#333', mat: M.metal, seg: 4 });

  object.add(b.build());

  /* ------------------------------------- lunatics teetering (animated) -- */
  const lunGeo = (() => {
    const lb = new Builder();
    figure(lb, { h: 0.46, color: '#2e2a36', arms: 0 });
    lb.rod([-0.03, 0.28, 0], [-0.27, 0.33, 0], 0.016, { color: '#2e2a36', mat: M.smooth, seg: 3 });
    lb.rod([0.03, 0.28, 0], [0.27, 0.33, 0], 0.016, { color: '#2e2a36', mat: M.smooth, seg: 3 });
    lb.sphere(0.025, { x: -0.28, y: 0.33, color: '#d7b08c', mat: M.smooth, seg: 4 });
    lb.sphere(0.025, { x: 0.28, y: 0.33, color: '#d7b08c', mat: M.smooth, seg: 4 });
    return lb.build().children[0].geometry;
  })();
  const lun = new THREE.InstancedMesh(lunGeo, M.smooth, lunatics.length);
  lun.frustumCulled = false;
  lun.castShadow = true;
  object.add(lun);

  /* ------------------------------------------------ airships (animated) -- */
  const hullGeo = (() => {
    const hb = new Builder();
    hb.sphere(1, { sx: 0.32, sy: 0.32, sz: 1.15, color: '#d6d9dc', mat: M.smooth, seg: 18 });
    for (let k = 0; k < 6; k++) hb.torus(1, 0.012, { sx: 0.322 * Math.sin(((k + 1) / 7) * Math.PI), sy: 0.322 * Math.sin(((k + 1) / 7) * Math.PI), z: -0.95 + ((k + 1) / 7) * 1.9, color: '#b9bec4', mat: M.smooth, tseg: 18, rseg: 3 });
    for (let k = 0; k < 4; k++) hb.box(0.02, 0.3, 0.35, { z: -0.95, rz: (k * Math.PI) / 2, y: 0, color: '#9aa1a8', mat: M.smooth, matrix: new THREE.Matrix4().makeTranslation(0, 0, 0) });
    hb.box(0.6, 0.02, 0.35, { z: -0.95, color: accent, mat: M.smooth });
    hb.box(0.02, 0.6, 0.35, { z: -0.95, color: accent, mat: M.smooth });
    hb.box(0.14, 0.12, 0.42, { y: -0.4, z: 0.1, color: '#8a6a4a', mat: M.smooth });
    for (const s of [-1, 1]) hb.rod([s * 0.06, -0.34, -0.05], [s * 0.1, -0.24, -0.05], 0.006, { color: '#555', mat: M.smooth, seg: 3 });
    return hb.build().children[0].geometry;
  })();
  const glowGeo = (() => {
    const gb = new Builder();
    for (const s of [-1, 1]) for (let k = 0; k < 4; k++) gb.quad(0.05, 0.04, { x: s * 0.071, y: -0.37, z: 0.25 - k * 0.09, ry: (s * Math.PI) / 2, mat: M.glow, color: C.lamp, glow: 2.5 });
    return gb.build().children[0].geometry;
  })();
  const ships = [];
  const lanes = [];
  for (let k = -3; k <= 2; k++) { lanes.push({ axis: 'x', c: (k + 0.5) * SP }); lanes.push({ axis: 'z', c: (k + 0.5) * SP }); }
  for (let n = 0; n < 14; n++) {
    const L = lanes[(n * 5) % lanes.length];
    const half = Math.sqrt(Math.max(1, 10.2 ** 2 - L.c ** 2));
    ships.push({ ...L, half, y: 2.5 + ((n * 3.7) % 10.5), u0: rng(), sp: rng.range(0.012, 0.022) * (n % 2 ? 1 : -1), s: rng.range(1.15, 1.45) });
  }
  const hulls = new THREE.InstancedMesh(hullGeo, M.smooth, ships.length);
  const glows = new THREE.InstancedMesh(glowGeo, M.glow, ships.length);
  hulls.frustumCulled = glows.frustumCulled = false;
  hulls.castShadow = true;
  object.add(hulls, glows);

  const update = (t) => {
    for (let i = 0; i < lunatics.length; i++) {
      const L = lunatics[i];
      const wob = Math.sin(t * 1.3 + L.ph) * 0.12 + Math.sin(t * 2.9 + L.ph * 2) * 0.05;
      setInst(lun, i, L.x, L.y, L.z, 1, L.ry, 0, wob);
    }
    lun.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < ships.length; i++) {
      const S = ships[i];
      const u = ((S.u0 + t * S.sp) % 1 + 1) % 1;
      const p = -S.half + u * 2 * S.half;
      const fade = Math.min(1, Math.sin(Math.PI * u) * 3);
      const x = S.axis === 'x' ? p : S.c, z = S.axis === 'x' ? S.c : p;
      const ry = (S.axis === 'x' ? Math.PI / 2 : 0) + (S.sp < 0 ? Math.PI : 0);
      const y = S.y + Math.sin(t * 0.4 + i) * 0.08;
      setInst(hulls, i, x, y, z, S.s * fade, ry, Math.sin(t * 0.3 + i) * 0.03);
      setInst(glows, i, x, y, z, S.s * fade, ry, Math.sin(t * 0.3 + i) * 0.03);
    }
    hulls.instanceMatrix.needsUpdate = true;
    glows.instanceMatrix.needsUpdate = true;
  };
  update(0);
  return { object, update };
}
