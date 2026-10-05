// OLINDA — the city that grows in concentric circles from within.
// Every ring is the same walled city at a different scale. The rings slowly
// expand outward, carrying their old quarters with them; the outermost one sinks
// back into the plinth while, at the very heart, a new pin-head Olinda blossoms.
// A brass magnifying glass leans over the centre, as the text suggests.
import { THREE, Builder, M, C, Lines, glowMat, solid } from '../kit.js';

const N = 8; // rings alive at once
const G = 1.45; // scale ratio between neighbouring rings
const INNER = 1 / G; // inner radius of each ring (normalised)
const RMAX = 10.4; // outer radius when a ring dies
const LIFE = 9; // seconds for a ring to grow by one step (N steps = whole life)

// Two alternating palettes, so the rings read as bands from far away.
const PAL = [
  { wall: '#ecd3a6', roof: '#c4683f', roof2: '#b3583a', ground: '#d8c39b', crown: C.gold, garden: '#7c9a5c' },
  { wall: '#efc8b0', roof: '#5f7f86', roof2: '#4e6c78', ground: '#cdb592', crown: '#e9c77a', garden: '#6b8c58' },
];

const GILT = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.62, metalness: 0.3 });

function buildModule(rng, pal, accent) {
  const b = new Builder();
  // paved ground annulus + a tiny bevel at the inner edge (the street ring)
  b.lathe([[INNER, 0], [INNER, 0.004], [INNER + 0.012, 0.006], [1, 0.006], [1, -0.075], [0.97, -0.075]], { color: pal.ground, seg: 64 });
  b.lathe([[INNER + 0.002, 0.006], [INNER + 0.024, 0.006], [INNER + 0.024, 0.0075], [INNER + 0.002, 0.0075]], { color: '#bfa984', seg: 64 });

  // the wall at the outer rim: battered, with a gilded crown and towers
  const wallR = 0.965;
  b.lathe([[wallR - 0.022, 0], [wallR + 0.03, -0.075], [wallR + 0.022, 0], [wallR + 0.016, 0.075], [wallR - 0.016, 0.075]], { color: pal.wall, seg: 72 });
  b.lathe([[wallR - 0.02, 0.075], [wallR + 0.02, 0.075], [wallR + 0.02, 0.083], [wallR - 0.02, 0.083]], { mat: GILT, color: pal.crown, seg: 72 });
  const nT = 16;
  for (let i = 0; i < nT; i++) {
    const a = (i / nT) * Math.PI * 2;
    const x = Math.cos(a) * wallR, z = Math.sin(a) * wallR;
    b.cyl(0.03, 0.034, 0.11, { x, z, seg: 8, color: pal.wall });
    if (i % 4 === 0) {
      // gate towers carry little domes
      b.dome(0.031, { x, y: 0.11, z, color: pal.crown, mat: GILT, seg: 10, hseg: 5 });
    } else {
      b.cone(0.038, 0.05, { x, y: 0.11, z, seg: 8, color: pal.roof, mat: M.flat });
    }
    // a lamp in each tower
    b.quad(0.012, 0.018, { x: Math.cos(a) * (wallR + 0.0345), y: 0.075, z: Math.sin(a) * (wallR + 0.0345), ry: Math.PI / 2 - a, mat: M.glow, color: C.lamp, glow: 2.2 });
  }

  // four radial avenues from gates (kept clear), with cypress rows
  const gates = [0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((a) => a + Math.PI / 16 * 0);
  const onAvenue = (x, z) => {
    const a = Math.atan2(z, x);
    for (const g of gates) {
      let d = Math.abs(((a - g + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
      if (d * Math.hypot(x, z) < 0.045) return true;
    }
    return false;
  };
  for (const g of gates) {
    for (let k = 0; k < 6; k++) {
      const rr = INNER + 0.05 + k * ((0.9 - INNER - 0.05) / 5);
      for (const s of [-1, 1]) {
        const a = g + (s * 0.036) / rr;
        b.geo(new THREE.SphereGeometry(1, 6, 5), { x: Math.cos(a) * rr, y: 0.026, z: Math.sin(a) * rr, sx: 0.008, sz: 0.008, sy: 0.022, color: '#41613f', mat: M.flat });
      }
    }
  }

  // houses: two concentric belts of blocks, plus gardens, pools and antennas
  const placed = [];
  const tryPlace = (x, z, rad) => {
    const rr = Math.hypot(x, z);
    if (rr - rad < INNER + 0.03 || rr + rad > wallR - 0.04) return false;
    if (onAvenue(x, z)) return false;
    for (const o of placed) if (Math.hypot(o[0] - x, o[1] - z) < rad + o[2] + 0.006) return false;
    placed.push([x, z, rad]);
    return true;
  };
  // gardens and pools first (a few per ring)
  for (let i = 0; i < 9; i++) {
    for (let t = 0; t < 40; t++) {
      const a = rng.range(0, Math.PI * 2), rr = rng.range(INNER + 0.08, 0.88);
      const x = Math.cos(a) * rr, z = Math.sin(a) * rr;
      if (!tryPlace(x, z, 0.05)) continue;
      const pool = i % 3 === 0;
      b.box(0.07, 0.008, 0.07, { x, z, ry: -a, color: pool ? '#e8dcc0' : pal.garden });
      if (pool) {
        b.box(0.05, 0.004, 0.05, { x, y: 0.006, z, ry: -a, color: '#5ea3b3' });
      } else {
        for (let k = 0; k < 3; k++) {
          const ox = rng.range(-0.022, 0.022), oz = rng.range(-0.022, 0.022);
          b.geo(new THREE.IcosahedronGeometry(1, 0), { x: x + ox, y: 0.024, z: z + oz, s: 0.014, color: pal.garden, mat: M.flat, ry: rng() * 6 });
          b.cyl(0.002, 0.003, 0.014, { x: x + ox, y: 0.006, z: z + oz, color: C.wood, seg: 4 });
        }
      }
      break;
    }
  }
  let count = 0;
  for (let t = 0; t < 5000 && count < 170; t++) {
    const a = rng.range(0, Math.PI * 2);
    const rr = Math.sqrt(rng.range(INNER * INNER, 1)) ;
    const x = Math.cos(a) * rr, z = Math.sin(a) * rr;
    const w = rng.range(0.035, 0.06), d = rng.range(0.03, 0.05);
    if (!tryPlace(x, z, Math.max(w, d) * 0.58)) continue;
    count++;
    const h = rng.range(0.03, 0.075) * (1 + 0.5 * (1 - (rr - INNER) / (1 - INNER)));
    const ry = -a + Math.PI / 2;
    b.push({ x, z, ry });
    b.box(w, h, d, { color: rng.chance(0.25) ? '#f3e3c4' : pal.wall });
    const kind = rng();
    if (kind < 0.55) {
      // hip roof
      b.geo(new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1).rotateY(Math.PI / 4).translate(0, 0.5, 0), {
        y: h, sx: w + 0.006, sz: d + 0.006, sy: Math.min(w, d) * 0.45, color: rng.chance(0.5) ? pal.roof : pal.roof2, mat: M.flat,
      });
    } else if (kind < 0.8) {
      // flat roof with a skylight and maybe an antenna
      b.box(w + 0.004, 0.003, d + 0.004, { y: h, color: '#e6dccb' });
      b.box(w * 0.35, 0.004, d * 0.35, { y: h + 0.003, x: w * 0.15, color: '#a9c7cf' });
      if (rng.chance(0.6)) {
        b.cyl(0.0012, 0.0012, 0.05, { x: -w * 0.25, y: h, seg: 3, color: C.charcoal });
        b.box(0.022, 0.0015, 0.0015, { x: -w * 0.25, y: h + 0.04, color: C.charcoal });
      }
    } else {
      // a little domed house
      b.box(w + 0.004, 0.004, d + 0.004, { y: h, color: pal.wall });
      b.dome(Math.min(w, d) * 0.42, { y: h + 0.004, color: rng.chance(0.3) ? pal.crown : pal.roof2, seg: 10, hseg: 5 });
    }
    // one or two lit windows on the outward face
    if (rng.chance(0.55)) {
      b.quad(0.008, 0.011, { x: rng.range(-w * 0.3, w * 0.3), y: h * 0.55, z: d / 2 + 0.0015, mat: M.glow, color: C.lamp, glow: rng.range(1.4, 2.6) });
    }
    b.pop();
  }

  // a tall bell-tower at each ring's "north" so each copy has a landmark
  {
    const a = Math.PI * 0.25, rr = (INNER + 1) / 2 + 0.03;
    const x = Math.cos(a) * rr, z = Math.sin(a) * rr;
    b.box(0.045, 0.2, 0.045, { x, z, ry: -a, color: pal.wall });
    b.box(0.052, 0.006, 0.052, { x, y: 0.2, z, ry: -a, color: pal.crown, mat: GILT });
    b.geo(new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1).rotateY(Math.PI / 4).translate(0, 0.5, 0), { x, y: 0.206, z, ry: -a, sx: 0.05, sz: 0.05, sy: 0.07, color: accent, mat: M.flat });
    b.quad(0.014, 0.02, { x: x, y: 0.17, z: z + 0.0235, mat: M.glow, color: C.lamp, glow: 2.5 });
  }
  return b.build();
}

export default function build({ rng, accent }) {
  const object = new THREE.Group();

  // the old ground: a sunken, slightly darker disc with faint traces of former walls
  const base = new Builder();
  base.cyl(10.5, 10.6, 0.06, { color: '#bba887', seg: 72 });
  for (const rr of [10.35, 9.7]) base.torus(rr, 0.035, { rx: Math.PI / 2, y: 0.06, color: '#a8957a', tseg: 96, rseg: 4 });
  // ruined stubs of the walls that already went over the edge
  for (let i = 0; i < 40; i++) {
    const a = rng.range(0, Math.PI * 2), rr = rng.range(10.15, 10.45);
    base.box(rng.range(0.15, 0.4), rng.range(0.05, 0.18), 0.12, { x: Math.cos(a) * rr, z: Math.sin(a) * rr, y: 0.04, ry: -a + Math.PI / 2, color: '#cbb894' });
  }
  // the seed: a pin-head of light at the very heart
  base.sphere(0.04, { y: 1.9, mat: M.glow, color: accent, glow: 3.0, seg: 8 });
  // the hill of older strata hidden beneath the terraces
  const prof = [];
  for (let i = 0; i <= 16; i++) {
    const r = (i / 16) * (RMAX / G);
    prof.push([r, 0.06 + 1.8 * (1 - (r * G) / RMAX) - 0.03]);
  }
  prof.push([RMAX / G + 0.01, 0.0]);
  base.lathe(prof.reverse().map(([r, y]) => [r, Math.max(0.03, y)]), { color: '#c4ae88', seg: 48 });
  object.add(base.build());

  // two module palettes, cloned into N rings
  const modules = [buildModule(rng, PAL[0], accent), buildModule(rng, PAL[1], accent)];
  const rings = [];
  for (let i = 0; i < N; i++) {
    const g = i < 2 ? modules[i] : modules[i % 2].clone();
    g.position.y = 0.06;
    object.add(g);
    rings.push(g);
  }

  // the magnifying glass leaning over the centre on a brass stand
  const lensB = new Builder();
  const lensR = 1.6;
  lensB.torus(lensR, 0.07, { mat: M.metal, color: C.gold, tseg: 48, rseg: 8 });
  lensB.torus(lensR - 0.06, 0.02, { mat: M.metal, color: '#f3d58a', tseg: 48, rseg: 4, z: 0.03 });
  lensB.geo(new THREE.CircleGeometry(lensR - 0.04, 40), { mat: M.glass, color: '#d8f0ff' });
  // handle
  lensB.rod([0, -lensR - 0.05, 0], [0, -lensR - 1.6, 0], 0.09, { mat: M.wood, color: C.darkwood, r2: 0.11, seg: 10 });
  lensB.cyl(0.12, 0.12, 0.15, { y: -lensR - 0.2, mat: M.metal, color: C.gold });
  const lens = lensB.build({ shadows: false });
  const lensHolder = new THREE.Group();
  lensHolder.add(lens);
  object.add(lensHolder);
  // stand: a thin brass arm planted outside the wall
  const stand = new Builder();
  const sx = 7.6, sz = -6.2;
  stand.cyl(0.35, 0.45, 0.12, { x: sx, z: sz, mat: M.metal, color: C.gold });
  stand.tube([[sx, 0.1, sz], [sx, 3.2, sz], [sx * 0.7, 5.1, sz * 0.7], [sx * 0.25, 5.2, sz * 0.25]], 0.06, { mat: M.metal, color: C.gold, tseg: 30 });
  object.add(stand.build());
  lensHolder.position.set(sx * 0.2, 4.2, sz * 0.2);
  lens.rotation.set(-Math.PI / 2 + 0.25, 0, 0.4);

  // a soft spot of light thrown by the lens onto the heart
  const spot = new THREE.Mesh(new THREE.CircleGeometry(0.6, 32).rotateX(-Math.PI / 2), glowMat('#fff2c8', 0.35, { transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending }));
  spot.position.y = 1.9;
  object.add(spot);

  const minScale = RMAX * Math.pow(G, -N);
  function update(t) {
    for (let i = 0; i < N; i++) {
      // age in [0,1): 0 = newborn pinhead at the centre, 1 = outermost
      const age = (t / (LIFE * N) + i / N) % 1;
      const s = RMAX * Math.pow(G, N * (age - 1));
      const g = rings[i];
      // the outermost ring sinks back into the ground as it reaches the rim
      const k = Math.max(0, (age - (N - 1) / N) * N);
      const sink = 1 - k * k * (3 - 2 * k);
      const born = Math.min(1, s / (minScale * 1.4));
      const ys = s * (0.04 + 0.96 * sink) * born;
      g.scale.set(s, Math.max(ys, 0.0001), s);
      g.position.y = 0.06 + 1.8 * (1 - s / RMAX);
      g.visible = sink > 0.01 && born > 0.05;
      g.rotation.y = i * 0.37 + age * 0.4; // a slow drift, so the rings feel alive
    }
    lens.rotation.z = 0.4 + Math.sin(t * 0.25) * 0.05;
    lensHolder.position.y = 4.2 + Math.sin(t * 0.4) * 0.08;
    spot.material.opacity = 0.28 + Math.sin(t * 0.8) * 0.05;
  }
  update(0);
  return { object, update };
}
