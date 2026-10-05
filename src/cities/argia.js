// ARGIA — a city with earth instead of air.
// A great drum of earth with a quarter cut out, like an archaeologist's section.
// On the cut faces the buried city shows itself: walls and floors in section, rooms
// packed with clay to the ceiling, a bed and a table fossilised inside, every
// staircase with its negative staircase pressed over it, and above the roofs bands
// of rock like skies, with clouds of stone. Worm-holes wander through it all.
// On top: almost nothing — a meadow, the tip of a spire, a few people lying with
// an ear to the ground. Now and then a door down there slams: a slit of light,
// and rings spread over the grass above.
import { THREE, Builder, M, C, tree } from '../kit.js';
import { figure, sstep, warmLit } from './_d_kit.js';

export default function build({ rng, accent }) {
  const b = new Builder();
  const object = new THREE.Group();
  const R = 10.2;
  const G = 0.6; // street level of the buried city (= the floor of the cut)
  const TOP = 7.4;

  /* ---------- the drum of earth, in strata, with the quadrant x>0,z>0 removed ---------- */
  const q3 = new THREE.Shape();
  q3.moveTo(0, 0); q3.lineTo(R, 0); q3.absarc(0, 0, R, 0, Math.PI * 1.5, false); q3.lineTo(0, 0);
  const layer = (y0, y1, color, mat = M.stone) => {
    const g = new THREE.ExtrudeGeometry(q3, { depth: y1 - y0, bevelEnabled: false, curveSegments: 40 }).rotateX(-Math.PI / 2);
    b.geo(g, { y: y0, color, mat });
  };
  b.cyl(R, R, G, { color: '#5a4232', seg: 64 });
  const strata = [
    [G, 1.9, '#7d5b40'], [1.9, 2.0, '#8f6c4c'], [2.0, 3.4, '#86664a'], [3.4, 3.5, '#9a7a58'], [3.5, 4.8, '#7a5a42'],
    [4.8, 5.4, '#6d6a66'], [5.4, 6.2, '#7c7873'], [6.2, 6.8, '#6a4e38'], [6.8, 7.3, '#5e4532'],
  ];
  for (const [y0, y1, c] of strata) layer(y0, y1, c);
  layer(7.3, TOP, '#68744a', M.stone);

  /* ---------- section drawing helpers ---------- */
  const SEC = warmLit('#ffd9a8', 0.22);
  // plane 'z': the face z=0 (x from 0..R), facing +z.  plane 'x': the face x=0 (z from 0..R), facing +x.
  const rect = (pl, a0, a1, y0, y1, color, off = 0.01, mat = SEC) => {
    if (a1 <= a0 || y1 <= y0) return;
    if (pl === 'z') b.box(a1 - a0, y1 - y0, 0.02, { x: (a0 + a1) / 2, y: y0, z: off, color, mat });
    else b.box(0.02, y1 - y0, a1 - a0, { x: off, y: y0, z: (a0 + a1) / 2, color, mat });
  };
  const poly = (pl, pts, color, off = 0.01, mat = SEC) => {
    const sh = new THREE.Shape(pts.map(([a, y]) => new THREE.Vector2(a, y)));
    const g = new THREE.ExtrudeGeometry(sh, { depth: 0.02, bevelEnabled: false });
    if (pl === 'z') b.geo(g, { z: off - 0.01, color, mat });
    else { g.rotateY(-Math.PI / 2); b.geo(g, { x: off + 0.01, color, mat }); }
  };
  const blob = (pl, a, y, rx, ry, color, off = 0) => {
    if (pl === 'z') b.sphere(1, { x: a, y, z: off, sx: rx, sy: ry, sz: Math.min(rx, ry) * 0.5, color, mat: M.flat, seg: 10 });
    else b.sphere(1, { x: off, y, z: a, sz: rx, sy: ry, sx: Math.min(rx, ry) * 0.5, color, mat: M.flat, seg: 10 });
  };

  const CLAY = '#b08a62', CLAY2 = '#a27c56', WALL = '#d8cbb3', ROOF = '#9c5a3e', FOSSIL = '#5b4130';
  // a buried house in section: walls, floors, gable roof, rooms packed with clay, a fossil or two inside
  const house = (pl, a0, a1, floors, opts = {}) => {
    const fh = 1.15, h = floors * fh, t = 0.14;
    const y0 = G, y1 = G + h;
    rect(pl, a0, a1, y0, y1, CLAY, 0.008); // the clay that fills the rooms
    rect(pl, a0, a0 + t, y0, y1, WALL, 0.014);
    rect(pl, a1 - t, a1, y0, y1, WALL, 0.014);
    for (let f = 1; f <= floors; f++) rect(pl, a0, a1, y0 + f * fh - 0.1, y0 + f * fh, WALL, 0.014);
    const mid = (a0 + a1) / 2, rh = (a1 - a0) * 0.42;
    if (opts.roof !== 'flat') {
      poly(pl, [[a0 - 0.15, y1], [a1 + 0.15, y1], [mid, y1 + rh]], CLAY2, 0.008);
      poly(pl, [[a0 - 0.2, y1 - 0.02], [a0 - 0.05, y1 - 0.02], [mid, y1 + rh - 0.14], [mid, y1 + rh + 0.02]], ROOF, 0.016);
      poly(pl, [[a1 + 0.05, y1 - 0.02], [a1 + 0.2, y1 - 0.02], [mid, y1 + rh + 0.02], [mid, y1 + rh - 0.14]], ROOF, 0.016);
    }
    // fossils: furniture embedded in the clay
    for (let f = 0; f < floors; f++) {
      const fy = y0 + f * fh;
      const kind = (Math.floor(a0 * 7) + f) % 4;
      const ca = a0 + t + 0.25 + ((f * 0.37 + a0 * 0.13) % 1) * Math.max(0.1, a1 - a0 - 1.0);
      if (kind === 0) { rect(pl, ca, ca + 0.55, fy + 0.4, fy + 0.46, FOSSIL, 0.012); rect(pl, ca + 0.04, ca + 0.08, fy, fy + 0.4, FOSSIL, 0.012); rect(pl, ca + 0.47, ca + 0.51, fy, fy + 0.4, FOSSIL, 0.012); } // table
      else if (kind === 1) { rect(pl, ca, ca + 0.7, fy + 0.18, fy + 0.3, FOSSIL, 0.012); rect(pl, ca, ca + 0.06, fy, fy + 0.5, FOSSIL, 0.012); } // bed
      else if (kind === 2) { rect(pl, ca, ca + 0.3, fy, fy + 0.8, FOSSIL, 0.012); } // wardrobe
      else { rect(pl, ca, ca + 0.24, fy + 0.25, fy + 0.29, FOSSIL, 0.012); rect(pl, ca + 0.2, ca + 0.24, fy, fy + 0.6, FOSSIL, 0.012); } // chair
      // a hanging lamp
      rect(pl, ca + 0.35, ca + 0.37, fy + fh - 0.45, fy + fh - 0.1, FOSSIL, 0.012);
      rect(pl, ca + 0.29, ca + 0.43, fy + fh - 0.52, fy + fh - 0.45, '#c9a35a', 0.012);
    }
    if (opts.stair) {
      // an inner stair with its negative stair pressed over it
      const s0 = a1 - t - 1.2, n = 6, rise = (fh - 0.1) / n, run = 1.0 / n;
      const st = [[s0, y0]], ng = [];
      for (let i = 0; i < n; i++) { st.push([s0 + i * run, y0 + (i + 1) * rise]); st.push([s0 + (i + 1) * run, y0 + (i + 1) * rise]); }
      st.push([s0 + n * run, y0]);
      poly(pl, st, WALL, 0.013);
      ng.push([s0, y0 + 0.02]);
      for (let i = 0; i < n; i++) { ng.push([s0 + i * run, y0 + (i + 1) * rise + 0.02]); ng.push([s0 + (i + 1) * run, y0 + (i + 1) * rise + 0.02]); }
      ng.push([s0 + n * run, y0 + fh - 0.12]); ng.push([s0, y0 + fh - 0.12]);
      poly(pl, ng, '#c79f72', 0.013);
    }
    return { a0, a1, y1 };
  };

  // the face z=0 (seen from the front)
  const hz1 = house('z', 0.5, 2.9, 2, { stair: true });
  house('z', 3.3, 5.0, 2);
  // an outdoor flight of steps up to a terrace, and its negative pressed over it
  {
    const s0 = 5.2, n = 9, rise = 0.16, run = 0.17, y0 = G;
    const st = [[s0, y0]], ng = [[s0, y0 + 0.02]];
    for (let i = 0; i < n; i++) { st.push([s0 + i * run, y0 + (i + 1) * rise]); st.push([s0 + (i + 1) * run, y0 + (i + 1) * rise]); }
    for (let i = 0; i < n; i++) { ng.push([s0 + i * run, y0 + (i + 1) * rise + 0.02]); ng.push([s0 + (i + 1) * run, y0 + (i + 1) * rise + 0.02]); }
    st.push([s0 + n * run, y0]);
    ng.push([s0 + n * run, y0 + n * rise + 0.9]); ng.push([s0, y0 + n * rise + 0.9]);
    poly('z', ng, '#c79f72', 0.012);
    poly('z', st, WALL, 0.016);
    rect('z', s0 + n * run, 6.9, y0, y0 + n * rise, WALL, 0.016); // the terrace
    rect('z', s0 + n * run, 6.9, y0 + n * rise, y0 + n * rise + 0.9, '#c79f72', 0.012);
  }
  const hz3 = house('z', 7.0, 9.2, 3, {});
  // a little bell tower over hz3 — whose spire tip pierces the surface
  rect('z', 7.75, 8.45, hz3.y1, 6.7, WALL, 0.014);
  rect('z', 7.85, 8.35, hz3.y1, 6.7, CLAY, 0.016);
  poly('z', [[7.7, 6.7], [8.5, 6.7], [8.1, TOP + 0.02]], ROOF, 0.016);

  // the face x=0 (seen from the side)
  house('x', 0.5, 2.6, 2, {});
  const hx2 = house('x', 3.0, 4.6, 3, { stair: true, roof: 'gable' });
  house('x', 5.0, 7.1, 1, {});
  house('x', 7.4, 9.3, 2, {});
  // a well shaft from the street down into the base, its rope still in it
  rect('x', 4.75, 4.9, 0.05, G, WALL, 0.014);
  rect('x', 5.1, 5.25, 0.05, G, WALL, 0.014);

  // the rock skies, with clouds of stone, on both faces
  for (const pl of ['z', 'x']) {
    for (let i = 0; i < 9; i++) {
      const a = 0.8 + i * 1.05 + rng.range(-0.3, 0.3);
      if (a > 9.4) continue;
      const y = rng.range(4.95, 6.05);
      blob(pl, a, y, rng.range(0.35, 0.75), rng.range(0.13, 0.22), rng.pick(['#a8a49c', '#b5b1a8', '#9d998f']));
      if (rng.chance(0.6)) blob(pl, a + rng.range(0.2, 0.5), y + 0.08, rng.range(0.2, 0.4), rng.range(0.1, 0.16), '#c2beb4');
    }
  }
  // worm tunnels wandering through
  for (let k = 0; k < 8; k++) {
    const pl = k % 2 ? 'x' : 'z';
    let a = rng.range(0.5, 9), y = rng.pick([rng.range(G + 0.2, 1.4), rng.range(6.3, 7.1), rng.range(3.6, 4.6)]);
    const pts = [];
    let dir = rng.range(0, 6.28);
    for (let i = 0; i < 9; i++) {
      dir += rng.range(-0.9, 0.9);
      a += Math.cos(dir) * 0.4; y += Math.sin(dir) * 0.22;
      a = Math.min(Math.max(a, 0.2), 9.6); y = Math.min(Math.max(y, G + 0.1), 7.2);
      pts.push(pl === 'z' ? [a, y, 0.012] : [0.012, y, a]);
    }
    b.tube(pts, 0.028, { color: '#4a3426', rseg: 4, tseg: 40 });
  }
  // roots from the meadow down into the soil, on the faces
  for (let k = 0; k < 22; k++) {
    const pl = k % 2 ? 'x' : 'z';
    const a = rng.range(0.4, 9.6);
    const len = rng.range(0.6, 1.6);
    const pts = [];
    for (let i = 0; i <= 5; i++) { const t = i / 5; pts.push(pl === 'z' ? [a + Math.sin(t * 5 + k) * 0.1, TOP - 0.05 - t * len, 0.012] : [0.012, TOP - 0.05 - t * len, a + Math.sin(t * 5 + k) * 0.1]); }
    b.tube(pts, 0.018, { color: '#c8a878', rseg: 3, tseg: 12 });
  }

  /* ---------- the plan section at street level, inside the cut quadrant ---------- */
  b.cyl(R - 0.02, R - 0.02, 0.012, { y: G, color: '#6d503a', seg: 32, thetaStart: 0, thetaLength: Math.PI / 2 }); // packed street earth
  const inQ = (x, z) => x > 0.05 && z > 0.05 && Math.hypot(x, z) < R - 0.15;
  const plans = [
    [0.5, 2.9, 0.05, 1.6], [3.3, 5.0, 0.05, 1.3], [7.0, 9.2, 0.05, 1.8],
    [0.05, 1.5, 0.5, 2.6], [0.05, 1.2, 3.0, 4.6], [0.05, 1.6, 5.0, 7.1], [0.05, 1.3, 7.4, 9.3],
    [2.3, 4.0, 2.4, 3.9], [4.6, 6.3, 2.2, 3.7], [2.4, 3.8, 4.6, 6.2], [4.4, 5.8, 4.4, 5.7], [2.2, 3.4, 6.8, 8.0], [6.6, 7.6, 2.6, 4.3],
  ];
  for (const [x0, x1, z0, z1] of plans) {
    if (!inQ((x0 + x1) / 2, (z0 + z1) / 2)) continue;
    b.box(x1 - x0, 0.02, z1 - z0, { x: (x0 + x1) / 2, y: G, z: (z0 + z1) / 2, color: CLAY });
    const t = 0.12, hh = 0.06;
    b.box(x1 - x0, hh, t, { x: (x0 + x1) / 2, y: G, z: z0 + t / 2, color: WALL });
    b.box(x1 - x0, hh, t, { x: (x0 + x1) / 2, y: G, z: z1 - t / 2, color: WALL });
    b.box(t, hh, z1 - z0, { x: x0 + t / 2, y: G, z: (z0 + z1) / 2, color: WALL });
    b.box(t, hh, z1 - z0, { x: x1 - t / 2, y: G, z: (z0 + z1) / 2, color: WALL });
    // an inner partition and door gap
    const xm = (x0 + x1) / 2;
    b.box(t * 0.8, hh, (z1 - z0) * 0.55, { x: xm, y: G, z: z0 + (z1 - z0) * 0.3, color: WALL });
  }
  // a buried fountain in the little square of the plan
  b.cyl(0.45, 0.45, 0.08, { x: 5.6, y: G, z: 6.6, color: WALL, seg: 16, open: true });
  b.cyl(0.4, 0.4, 0.02, { x: 5.6, y: G, z: 6.6, color: CLAY, seg: 16 });
  // the excavator's tools left in the cut
  b.rod([8.2, G, 6.8], [7.6, G + 1.2, 6.5], 0.025, { color: C.wood });
  b.box(0.18, 0.02, 0.25, { x: 8.25, y: G + 0.01, z: 6.85, ry: 0.5, color: '#55585e', mat: M.metal });
  b.cyl(0.18, 0.15, 0.24, { x: 6.9, y: G, z: 7.9, color: '#8a7550', mat: M.wood, seg: 10 });

  /* ---------- the surface: almost nothing ---------- */
  // the tip of a buried spire pierces the meadow
  b.cone(0.08, 0.25, { x: 8.1, y: TOP - 0.02, z: -0.6, color: ROOF, seg: 6 });
  b.rod([8.1, TOP + 0.2, -0.6], [8.1, TOP + 0.5, -0.6], 0.012, { color: '#3a3a3e', mat: M.metal });
  b.rod([8.02, TOP + 0.42, -0.6], [8.18, TOP + 0.42, -0.6], 0.012, { color: '#3a3a3e', mat: M.metal });
  // a chimney pot just showing
  b.cyl(0.08, 0.08, 0.1, { x: -3.2, y: TOP, z: -4.4, color: '#9a6a52', seg: 8 });
  // a lone tree and a cypress, a path that leads nowhere
  tree(b, { x: -5.6, y: TOP, z: 3.4, h: 2.0, kind: 'bare', trunk: '#5a4a3a', r: rng });
  tree(b, { x: -2.0, y: TOP, z: -7.4, h: 2.4, kind: 'cypress', r: rng });
  for (let i = 0; i < 18; i++) {
    const t = i / 18;
    b.box(0.35, 0.015, 0.22, { x: -7.6 + t * 6.5, y: TOP, z: -2.0 + Math.sin(t * 4) * 1.2, ry: rng.range(-0.3, 0.3), color: '#b9a985' });
  }
  for (let i = 0; i < 70; i++) {
    const [x, z] = rng.inDisc(9.8, 0.5);
    if (x > -0.2 && z > -0.2) continue;
    b.cone(0.03, rng.range(0.1, 0.22), { x, y: TOP, z, color: rng.pick(['#7f9a5e', '#6d8a50', '#93a86a']), seg: 3 });
  }
  // the listeners: lying with an ear to the ground; one kneeling, one standing with a lantern
  const listeners = [[-3.6, -1.2, 0.6], [-6.4, -4.0, 2.2], [-1.6, -5.2, -0.8], [-7.0, 1.2, 1.4]];
  for (const [x, z, ry] of listeners) {
    figure(b, { x, y: TOP + 0.06, z, ry, lean: 1.45, robe: rng.pick(['#5d6d8a', '#8a6a4a', '#a0524a', '#4d4a52']), hat: rng.pick(['veil', 'cap', null]), hatColor: C.ivory, arms: ['ear', 'fwd'], h: 0.42 });
  }
  figure(b, { x: -4.6, y: TOP, z: -6.2, ry: 0.4, lean: 0.7, robe: '#6f7f6a', arms: ['ear', 'down'], h: 0.42 });
  figure(b, { x: -2.6, y: TOP, z: -2.2, ry: -0.6, robe: '#34343a', hat: 'brim', hatColor: '#2a2a2a', arms: ['out', 'down'], h: 0.42 });
  b.sphere(0.05, { x: -2.6 + Math.cos(0.6) * 0.12, y: TOP + 0.2, z: -2.2 + Math.sin(0.6) * 0.12, color: C.lamp, mat: M.glow, glow: 3, seg: 6 });

  object.add(b.build());

  /* ---------- a door slams below: a slit of light, rings over the grass ---------- */
  const doorMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffc477').multiplyScalar(3), toneMapped: false, transparent: true, opacity: 0, depthWrite: false });
  const doorA = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.72), doorMat);
  doorA.position.set(hz1.a0 + 0.95, G + 0.37, 0.03);
  object.add(doorA);
  const doorB = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.72), doorMat);
  doorB.position.set(0.03, G + 1.15 + 0.37, hx2.a0 + 0.5);
  doorB.rotation.y = Math.PI / 2;
  object.add(doorB);
  const ringMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffe2b0').multiplyScalar(1.4), toneMapped: false, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
  const rings = [0, 1, 2].map(() => {
    const m = new THREE.Mesh(new THREE.RingGeometry(0.92, 1.0, 48).rotateX(-Math.PI / 2), ringMat.clone());
    m.position.set(-3.6, TOP + 0.03, -2.4);
    object.add(m);
    return m;
  });
  const PER = 11;
  return {
    object,
    update(t) {
      const k = Math.floor(t / PER), c = t % PER;
      const useA = k % 2 === 0;
      // the slit of light: opens, then the slam
      const open = c < 1.6 ? sstep(0, 0.3, c) * (1 - sstep(1.2, 1.6, c)) : 0;
      doorMat.opacity = open * 0.9;
      doorA.visible = useA; doorB.visible = !useA;
      // the sound travels up as rings on the meadow
      rings.forEach((m, i) => {
        const u = (c - 1.5 - i * 0.45) / 3.2;
        const on = u > 0 && u < 1;
        m.visible = on;
        if (on) {
          m.scale.setScalar(0.3 + u * 4.5);
          m.material.opacity = (1 - u) * 0.55;
          m.position.set(useA ? -3.6 : -6.4, TOP + 0.03, useA ? -2.0 : -3.2);
        }
      });
      void accent;
    },
  };
}
