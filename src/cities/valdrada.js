// Valdrada — a city of stacked verandas on the shore of a lake, and its reflection.
// The lake is lifted to mid-height as a pane of glassy water held on brass legs: the city
// stands on it, and its exact upside-down twin hangs beneath it, seen through the water.
// Every gesture above is repeated below — boats, walkers, lanterns, ripples — the two
// Valdradas living for each other, eyes locked, without love.
import { THREE, Builder, M, C, tree } from '../kit.js';
import { _o, _col } from './_c_util.js';

const H = 6.6; // the mirror plane (lake surface)
const T = 0.14; // half thickness of the shore slab

export default function build({ rng, accent }) {
  const object = new THREE.Group();
  const city = new Builder();
  const fixed = new Builder(); // things that are not mirrored (legs, rim, water)

  // ---------------------------------------------------------------- the lake pane and its brass stand
  const LR = 10.0;
  const water = new THREE.Mesh(
    new THREE.CylinderGeometry(LR, LR, 0.08, 96),
    new THREE.MeshPhysicalMaterial({ color: '#5f9fb0', roughness: 0.28, metalness: 0.0, transmission: 0, transparent: true, opacity: 0.26, clearcoat: 0.6, clearcoatRoughness: 0.4, depthWrite: false, side: THREE.DoubleSide }),
  );
  water.position.y = H;
  water.renderOrder = 2;
  object.add(water);
  fixed.cyl(10.3, 10.3, 0.03, { color: '#24324a', seg: 72 });
  fixed.ring(10.0, 10.3, { y: 0.032, color: '#3a4a64', seg: 72 });
  fixed.torus(LR + 0.04, 0.08, { y: H, rx: Math.PI / 2, color: C.gold, mat: M.metal, tseg: 120 });
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.2;
    const x = Math.cos(a) * (LR + 0.04), z = Math.sin(a) * (LR + 0.04);
    fixed.cyl(0.07, 0.1, H, { x, z, color: C.gold, mat: M.metal, seg: 10 });
    fixed.cyl(0.18, 0.2, 0.12, { x, z, color: C.gold, mat: M.metal, seg: 12 });
    fixed.sphere(0.11, { x, y: H + 0.05, z, color: C.gold, mat: M.metal, seg: 10 });
  }

  // ---------------------------------------------------------------- the shore: land on the back half, a lake in front
  const shoreZ = (x) => 0.6 + 0.6 * Math.sin(x * 0.55 + 0.5) + 0.3 * Math.sin(x * 1.3);
  const shape = [];
  for (let i = 0; i <= 40; i++) {
    const x = -9.75 + i * (19.5 / 40);
    shape.push([x, shoreZ(x)]);
  }
  for (let i = 0; i <= 40; i++) {
    const a = i / 40 * Math.PI; // around the back
    shape.push([Math.cos(a) * 9.9, -Math.sin(a) * 9.9]);
  }
  // clip the shoreline points to the circle
  for (const p of shape) { const r = Math.hypot(p[0], p[1]); if (r > 9.9) { p[0] *= 9.9 / r; p[1] *= 9.9 / r; } }
  const G = H + T;
  city.slab(shape, T, { y: H, color: '#b9ad8c' });
  // a stone quay along the shoreline with a promenade
  const quay = [];
  for (let i = 0; i <= 60; i++) {
    const x = -9.4 + i * (18.8 / 60);
    quay.push([x, shoreZ(x)]);
  }
  for (let i = 0; i < quay.length - 1; i++) {
    const [x0, z0] = quay[i], [x1, z1] = quay[i + 1];
    city.beam([x0, G + 0.03, z0 - 0.02], [x1, G + 0.03, z1 - 0.02], 0.12, { color: '#efe6d6' });
    if (i % 4 === 0) {
      city.cyl(0.015, 0.02, 0.5, { x: x0, y: G, z: z0 - 0.08, color: C.charcoal, seg: 5 });
      city.sphere(0.045, { x: x0, y: G + 0.52, z: z0 - 0.08, mat: M.glow, color: C.lamp, glow: 2, seg: 6 });
    }
  }

  // ---------------------------------------------------------------- terraces rising from the shore
  const tiers = [
    { z: -0.9, base: 0, rows: 1 },
    { z: -3.3, base: 0.45, rows: 1 },
    { z: -5.6, base: 0.9, rows: 1 },
    { z: -7.7, base: 1.35, rows: 1 },
  ];
  // the terrace walls
  for (let k = 1; k < tiers.length; k++) {
    const z = (tiers[k - 1].z + tiers[k].z) / 2 - 0.1;
    const half = Math.sqrt(Math.max(0, 9.7 * 9.7 - z * z));
    const zb = z - 4; // to the back edge
    const shapeT = [[-half, z], [half, z]];
    for (let i = 0; i <= 20; i++) { const a = Math.atan2(-z, half) + (i / 20) * (Math.PI - 2 * Math.atan2(-z, half)); shapeT.push([Math.cos(a) * 9.7, -Math.sin(a) * 9.7]); }
    shapeT.splice(1, 0);
    const pts = [[-half, z]];
    for (let i = 0; i <= 24; i++) {
      const a0 = Math.PI - Math.asin(Math.min(1, -z / 9.7));
      const a1 = Math.asin(Math.min(1, -z / 9.7));
      const a = a0 + (a1 - a0) * (i / 24);
      pts.push([Math.cos(a) * 9.7, -Math.sin(a) * 9.7]);
    }
    city.slab(pts.reverse(), tiers[k].base, { y: G, color: k % 2 ? '#c8bb98' : '#bfb28e' });
    // balustrade along the terrace edge
    for (let x = -half + 0.3; x < half - 0.3; x += 0.32) city.cyl(0.025, 0.03, 0.18, { x, y: G + tiers[k].base, z: z + 0.04, color: '#efe6d6', seg: 5 });
    city.box(2 * half - 0.5, 0.04, 0.08, { y: G + tiers[k].base + 0.18, z: z + 0.04, color: '#efe6d6' });
    // a central stair
    for (let s = 0; s < 6; s++) city.box(0.8, (s + 1) * (tiers[k].base - tiers[k - 1].base) / 6 + tiers[k - 1].base, 0.14, { x: 0.3 * (k % 2 ? 1 : -1) * 3, y: G, z: z + 0.84 - s * 0.14, color: '#e3d8c2' });
  }

  // ---------------------------------------------------------------- houses that are all verandas
  const walls = ['#f1e8d8', '#ecdcc0', '#e8cfc0', '#f3e3c3', '#e2d5c2', '#efd6b8'];
  const verandaPeople = [];
  function veranda(x, y0, z, w, floors, wall) {
    const fh = 0.62, d = 1.0, vd = 0.42;
    city.push({ x, y: y0, z });
    city.box(w, floors * fh, d, { z: -d / 2, color: wall });
    for (let f = 0; f < floors; f++) {
      const y = f * fh;
      // deck of this veranda
      city.box(w + 0.1, 0.05, vd, { y: y + (f === 0 ? 0 : -0.03), z: vd / 2, color: '#d9c7a6', mat: M.wood });
      // posts and railing
      const n = Math.max(3, Math.round(w / 0.32));
      for (let i = 0; i <= n; i++) city.cyl(0.018, 0.018, fh, { x: -w / 2 - 0.03 + i * (w + 0.06) / n, y, z: vd - 0.02, color: '#fbf6ee', seg: 5 });
      if (f > 0) {
        city.box(w + 0.08, 0.025, 0.025, { y: y + 0.22, z: vd - 0.02, color: '#fbf6ee' });
        for (let i = 0; i < n * 2; i++) city.box(0.012, 0.2, 0.012, { x: -w / 2 + (i + 0.5) * w / (n * 2), y: y + 0.02, z: vd - 0.02, color: '#fbf6ee' });
      }
      // the inner wall: dark doors and lit windows
      for (let i = 0; i < Math.max(2, Math.round(w / 0.45)); i++) {
        const u = -w / 2 + (i + 0.5) * w / Math.max(2, Math.round(w / 0.45));
        const lit = rng.chance(0.35);
        city.quad(0.16, 0.36, { x: u, y: y + 0.24, z: 0.008, mat: lit ? M.glow : M.smooth, color: lit ? C.lamp : '#3a3230', glow: 1.5 });
      }
      // striped awning on some floors
      if (rng.chance(0.4)) {
        city.box(w + 0.1, 0.02, vd + 0.05, { y: y + fh - 0.06, z: vd / 2 + 0.03, rx: 0.15, color: rng.pick([accent, '#e8dcc8', '#7da0a8', '#c98a6a']), mat: M.cloth });
      }
      if (f > 0 && rng.chance(0.45)) verandaPeople.push([x + rng.range(-w / 2 + 0.15, w / 2 - 0.15), y0 + y + 0.02, z + vd * 0.5]);
      // potted plants
      if (rng.chance(0.4)) city.sphere(0.07, { x: rng.range(-w / 2 + 0.1, w / 2 - 0.1), y: y + 0.12, z: vd - 0.08, color: C.leaf, mat: M.flat, seg: 5 });
    }
    // roof: a last open veranda with a light pergola
    const top = floors * fh;
    city.box(w + 0.12, 0.06, d + vd + 0.06, { y: top, z: (vd - d) / 2, color: '#e6dccb' });
    if (rng.chance(0.6)) {
      for (const [px, pz] of [[-w / 2, 0], [w / 2, 0], [-w / 2, -d * 0.6], [w / 2, -d * 0.6]]) city.cyl(0.015, 0.015, 0.4, { x: px, y: top, z: pz, color: '#fbf6ee', seg: 4 });
      for (let i = 0; i < 5; i++) city.box(0.02, 0.02, d * 0.7, { x: -w / 2 + i * w / 4, y: top + 0.4, z: -d * 0.3, color: C.wood });
    } else {
      city.geo(new THREE.CylinderGeometry(0.0001, 0.72, 1, 4, 1).rotateY(Math.PI / 4).translate(0, 0.5, 0), { y: top + 0.04, z: -d / 2 + vd / 2, sx: w + 0.1, sz: d + vd, sy: 0.3, color: rng.pick(['#b8694a', '#a8553a', '#c9a48a']), mat: M.flat });
    }
    city.pop();
  }
  for (const tier of tiers) {
    const z = tier.z;
    const half = Math.sqrt(Math.max(0, 9.2 * 9.2 - (z - 0.6) ** 2)) - 0.4;
    let x = -half + rng.range(0, 0.4);
    while (x < half - 0.9) {
      const w = rng.range(0.9, 1.6);
      const floors = rng.int(2, tier.z > -1 ? 3 : 4);
      const front = tier === tiers[0];
      const zz = front ? shoreZ(x + w / 2) + 0.05 : z;
      if (Math.abs(x + w / 2 - 0.9 * (tiers.indexOf(tier) % 2 ? 1 : -1)) > 0.7 || front) {
        if (front) {
          // houses of the shore stand on piles, their verandas over the water
          const st = 0.42;
          for (const px of [-w / 2, 0, w / 2]) for (const pz of [-0.95, -0.3, 0.4]) city.cyl(0.025, 0.025, st + T + 0.02, { x: x + w / 2 + px, y: H - 0.02, z: zz + pz, color: '#6e5a44', seg: 5 });
          veranda(x + w / 2, G + st, zz, w, Math.min(floors, 3), rng.pick(walls));
        } else veranda(x + w / 2, G + tier.base, zz, w, floors, rng.pick(walls));
      }
      x += w + rng.range(0.15, 0.5);
    }
  }
  // the crown: a round tower with a dome at the top of the town
  city.cyl(0.6, 0.65, 3.2, { x: 1.4, y: G + 1.35, z: -8.2, color: '#f1e8d8', seg: 16 });
  for (let f = 0; f < 3; f++) {
    city.cyl(0.74, 0.74, 0.05, { x: 1.4, y: G + 1.35 + 0.9 + f * 0.85, z: -8.2, color: '#e6dccb', seg: 16 });
    for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; city.cyl(0.012, 0.012, 0.2, { x: 1.4 + Math.cos(a) * 0.72, y: G + 1.4 + 0.9 + f * 0.85, z: -8.2 + Math.sin(a) * 0.72, color: '#fbf6ee', seg: 4 }); }
  }
  city.dome(0.62, { x: 1.4, y: G + 4.55, z: -8.2, color: '#8db0b8', mat: M.smooth });
  city.cyl(0.025, 0.025, 0.45, { x: 1.4, y: G + 5.15, z: -8.2, color: C.gold, mat: M.metal, seg: 5 });
  // cypresses
  for (let i = 0; i < 16; i++) {
    const x = rng.range(-8, 8), z = rng.range(-8.6, -1.5);
    if (Math.hypot(x, z) > 9.2) continue;
    const tier = tiers.reduce((acc, t) => (z < (t.z + 1.2) ? t : acc), tiers[0]);
    tree(city, { x, y: G + tier.base, z, h: rng.range(1.0, 1.8), kind: 'cypress', r: rng });
  }
  // people standing on the verandas, looking at the water
  for (const [x, y, z] of verandaPeople) {
    city.cone(0.06, 0.2, { x, y, z, color: rng.pick(['#3c3a46', '#6d4a5a', '#e8e0d0', '#4d5f74', '#8c5a3c']), seg: 6 });
    city.sphere(0.035, { x, y: y + 0.24, z, color: '#d7b08c', seg: 6 });
  }
  // moored boats along the quay (static)
  for (let i = 0; i < 5; i++) {
    const x = -6 + i * 3 + rng.range(-0.5, 0.5);
    const z = shoreZ(x) + 0.35;
    city.geo(new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), { x, y: H + 0.12, z, sx: 0.12, sy: 0.1, sz: 0.45, ry: Math.PI / 2 + rng.range(-0.2, 0.2), color: rng.pick(['#5a3a2a', '#2f4a5a', '#7a2f2f']), mat: M.wood });
  }

  // ---------------------------------------------------------------- build both cities: the real one and its twin
  const real = city.build();
  object.add(real);
  const twin = real.clone();
  twin.scale.y = -1;
  twin.position.y = 2 * H;
  object.add(twin);
  object.add(fixed.build());

  // ---------------------------------------------------------------- animated, mirrored: boats, walkers, ripples
  const boatB = new Builder();
  boatB.geo(new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), { sx: 0.16, sy: 0.12, sz: 0.55, y: 0.1, color: '#f1e8d8', mat: M.wood });
  boatB.cone(0.06, 0.2, { y: 0.08, color: '#4d5f74', seg: 6, mat: M.wood });
  boatB.sphere(0.035, { y: 0.31, color: '#d7b08c', seg: 6, mat: M.wood });
  boatB.rod([0.05, 0.25, 0], [0.4, 0.0, -0.1], 0.01, { color: C.wood, mat: M.wood });
  boatB.rod([-0.05, 0.25, 0], [-0.4, 0.0, -0.1], 0.01, { color: C.wood, mat: M.wood });
  boatB.cyl(0.006, 0.006, 0.5, { z: 0.45, y: 0.12, color: C.darkwood, mat: M.wood, seg: 4 });
  boatB.sphere(0.04, { z: 0.45, y: 0.64, color: '#ffffff', mat: M.wood, seg: 6 });
  const boatGeo = boatB.build({ shadows: false }).children[0].geometry;
  const NB = 3;
  const boats = new THREE.InstancedMesh(boatGeo, M.wood, NB);
  const boatsT = new THREE.InstancedMesh(boatGeo, M.wood, NB);
  boatsT.instanceMatrix = boats.instanceMatrix;
  boatsT.scale.y = -1; boatsT.position.y = 2 * H;
  boats.frustumCulled = boatsT.frustumCulled = false;
  object.add(boats, boatsT);
  // bow lanterns: glowing, mirrored too
  const lantGeo = new THREE.SphereGeometry(0.05, 8, 6);
  const lantMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(C.lamp).multiplyScalar(2.6), toneMapped: false });
  const lanterns = new THREE.InstancedMesh(lantGeo, lantMat, NB);
  const lanternsT = new THREE.InstancedMesh(lantGeo, lantMat, NB);
  lanternsT.instanceMatrix = lanterns.instanceMatrix;
  lanternsT.scale.y = -1; lanternsT.position.y = 2 * H;
  lanterns.frustumCulled = lanternsT.frustumCulled = false;
  object.add(lanterns, lanternsT);

  // promenade walkers
  const NW = 14;
  const wGeo = new THREE.ConeGeometry(0.06, 0.22, 6).translate(0, 0.11, 0);
  const hGeo = new THREE.SphereGeometry(0.036, 6, 5).translate(0, 0.26, 0);
  const wMat = new THREE.MeshStandardMaterial({ roughness: 0.8 });
  const hMat = new THREE.MeshStandardMaterial({ color: '#d7b08c', roughness: 0.8 });
  const walkers = new THREE.InstancedMesh(wGeo, wMat, NW);
  const walkersT = new THREE.InstancedMesh(wGeo, wMat, NW);
  const heads = new THREE.InstancedMesh(hGeo, hMat, NW);
  const headsT = new THREE.InstancedMesh(hGeo, hMat, NW);
  for (let i = 0; i < NW; i++) walkers.setColorAt(i, _col.set(rng.pick(['#3c3a46', '#6d4a5a', '#e8e0d0', '#4d5f74', '#8c5a3c', accent])));
  walkersT.instanceColor = walkers.instanceColor;
  walkersT.instanceMatrix = walkers.instanceMatrix;
  headsT.instanceMatrix = walkers.instanceMatrix;
  heads.instanceMatrix = walkers.instanceMatrix;
  for (const m of [walkersT, headsT]) { m.scale.y = -1; m.position.y = 2 * H; }
  for (const m of [walkers, walkersT, heads, headsT]) { m.frustumCulled = false; object.add(m); }
  const wk = [];
  for (let i = 0; i < NW; i++) wk.push({ u: rng(), sp: rng.range(0.012, 0.022) * (rng.chance(0.5) ? 1 : -1), lane: rng.range(-0.75, -0.45) });

  // ripples spreading from the boats' oars, on the pane itself (seen from above and below)
  const NR = 6;
  const ripples = [];
  for (let i = 0; i < NR; i++) {
    const m = new THREE.Mesh(new THREE.RingGeometry(0.92, 1, 48).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#dff4ff', transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
    m.position.y = H + 0.045;
    m.renderOrder = 3;
    object.add(m);
    ripples.push({ m, boat: i % NB, t0: i * 1.0 });
  }

  const boatPos = [];
  for (let i = 0; i < NB; i++) boatPos.push(new THREE.Vector3());
  function update(t) {
    for (let i = 0; i < NB; i++) {
      // slow ellipses on the lake in front of the city
      const a = t * 0.05 * (i % 2 ? 1 : -1) + i * 2.1;
      const x = Math.cos(a) * (5.2 + i * 1.1), z = 4.8 + Math.sin(a) * (2.4 + i * 0.4);
      const r = Math.hypot(x, z);
      const k = r > 9 ? 9 / r : 1;
      boatPos[i].set(x * k, H + 0.02, z * k);
      _o.position.copy(boatPos[i]);
      _o.rotation.set(0, a + (i % 2 ? 0 : Math.PI), Math.sin(t * 1.3 + i) * 0.04);
      _o.scale.setScalar(1);
      _o.updateMatrix();
      boats.setMatrixAt(i, _o.matrix);
      _o.translateZ(0.45); _o.translateY(0.64 + Math.sin(t * 2 + i) * 0.015);
      _o.updateMatrix();
      lanterns.setMatrixAt(i, _o.matrix);
    }
    boats.instanceMatrix.needsUpdate = true;
    lanterns.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < NW; i++) {
      const w = wk[i];
      let u = (w.u + t * w.sp) % 1; if (u < 0) u += 1;
      const x = -8.6 + u * 17.2;
      const z = shoreZ(x) + w.lane;
      _o.position.set(x, G + Math.abs(Math.sin(t * 5 + i)) * 0.01, z);
      _o.rotation.set(0, w.sp > 0 ? Math.PI / 2 : -Math.PI / 2, 0);
      _o.scale.setScalar(1);
      _o.updateMatrix();
      walkers.setMatrixAt(i, _o.matrix);
    }
    walkers.instanceMatrix.needsUpdate = true;
    for (const R of ripples) {
      const u = ((t - R.t0) % 3.0 + 3.0) % 3.0 / 3.0;
      const bp = boatPos[R.boat];
      R.m.position.x = bp.x; R.m.position.z = bp.z;
      const s = 0.3 + u * 1.6;
      R.m.scale.set(s, 1, s);
      R.m.material.opacity = 0.35 * (1 - u);
    }
    water.material.opacity = 0.36 + 0.03 * Math.sin(t * 0.8);
  }
  update(0);
  return { object, update };
}
