// Despina — the city at the border of two deserts. To the camel driver crossing the
// sand it looks like a ship: masts, sails, windsocks, smokestacks, a hull with portholes.
// To the sailor in the coastal haze it looks like a camel: two humped domes, an
// embroidered saddle with fringes, a long neck lifting from the bow. Here the disc is
// half dunes, half sea; the city lies on the shoreline between them.
import { THREE, Builder, M, C, Lines, glowMat, solid } from '../kit.js';
import { turnCity } from './_agentA_util.js';

const SAND = '#e2c08a', SAND_D = '#cfa86c', CAMEL = '#c79a5c';

export default function build({ rng, accent }) {
  const b = new Builder();
  const object = new THREE.Group();
  // local frame: desert at -x, sea at +x, the city along z

  /* ---------------------------------------------------- the two deserts */
  b.cyl(10.45, 10.5, 0.1, { color: '#2a5d6e', mat: M.stone, seg: 64 }); // seabed
  // sand half (with a gently curving shoreline)
  const shore = (z) => 2.6 + 0.5 * Math.sin(z * 0.45) + 0.25 * Math.sin(z * 1.3);
  {
    const pts = [];
    for (let i = 0; i <= 40; i++) { const z = 10.4 - (i / 40) * 20.8; const x = shore(z); if (Math.hypot(x, z) < 10.45) pts.push([x, z]); }
    for (let i = 0; i <= 40; i++) { const a = Math.PI * 1.5 - (i / 40) * Math.PI; pts.push([Math.cos(a) * 10.45, Math.sin(a) * 10.45]); }
    b.slab(pts.map(([x, z]) => [x, z]), 0.32, { y: 0.0, color: SAND, mat: M.stone });
  }
  // dunes: long crescent swells on the desert side
  for (let i = 0; i < 16; i++) {
    const x = rng.range(-9.2, -3.2), z = rng.range(-8.5, 8.5);
    if (Math.hypot(x, z) > 9.3) continue;
    const r = rng.range(1.0, 1.9);
    b.geo(DUNE, { x, y: 0.3, z, sx: r, sz: r * 1.7, sy: rng.range(0.18, 0.42), ry: rng.range(-0.3, 0.3), color: i % 2 ? SAND : SAND_D, mat: M.stone });
  }
  // the sea: a translucent sheet over the seabed, foam along the beach
  {
    const pts = [];
    for (let i = 0; i <= 40; i++) { const z = -10.4 + (i / 40) * 20.8; const x = shore(z) - 0.15; if (Math.hypot(x, z) < 10.45) pts.push([x, z]); }
    for (let i = 0; i <= 40; i++) { const a = -Math.PI / 2 + (i / 40) * Math.PI; pts.push([Math.cos(a) * 10.45, -Math.sin(a) * 10.45]); }
    b.slab(pts, 0.06, { y: 0.2, color: '#3a93a6', mat: M.water });
    for (let i = 0; i < 60; i++) {
      const z = -9 + i * 0.3; const x = shore(z) + 0.05;
      if (Math.hypot(x, z) > 10.2) continue;
      b.box(0.08, 0.02, 0.32, { x, y: 0.27, z, color: '#f4f7f6', mat: M.smooth });
    }
  }

  /* ---------------------------------------------- the city: a hull of a ship */
  const L = 7.0; // half-length along z
  const CX = 0.4; // city centre-line (on the beach)
  const halfW = (z) => 2.0 * Math.pow(Math.max(0, 1 - (z / L) ** 2), 0.6);
  const hull = [];
  for (let i = 0; i <= 30; i++) { const z = -L + (i / 30) * 2 * L; hull.push([CX + halfW(z), z]); }
  for (let i = 30; i >= 0; i--) { const z = -L + (i / 30) * 2 * L; hull.push([CX - halfW(z), z]); }
  const HH = 1.3;
  b.slab(hull, HH, { y: 0.1, color: '#f1e8d8', mat: M.stone });
  b.slab(hull.map(([x, z]) => [CX + (x - CX) * 1.03, z * 1.005]), 0.12, { y: HH + 0.1, color: '#d6c7ab', mat: M.smooth }); // gunwale
  // desert side: a ship's hull — waterline stripe and a row of portholes
  for (let i = 0; i < 26; i++) {
    const z = -L + 0.8 + i * ((2 * L - 1.6) / 25);
    const x = CX - halfW(z);
    const nx = x - CX;
    const dzd = (halfW(z + 0.05) - halfW(z - 0.05)) / 0.1; // slope for facing
    const ry = Math.atan2(-1, dzd) ; // normal facing -x-ish
    b.geo(new THREE.CircleGeometry(0.11, 12), { x: x - 0.012, y: 0.85, z, ry: -Math.PI / 2 + Math.atan(dzd) * -1, color: i % 3 ? '#2d3a44' : C.lamp, mat: i % 3 ? M.smooth : M.glow, glow: 1.8 });
    b.torus(0.12, 0.018, { x: x - 0.015, y: 0.85, z, ry: -Math.PI / 2 + Math.atan(dzd) * -1, color: C.gold, mat: M.metal, tseg: 12, rseg: 3 });
    void nx; void ry;
  }
  for (const yy of [0.2, 0.45]) {
    const pts = [];
    for (let i = 0; i <= 30; i++) { const z = -L + 0.1 + (i / 30) * (2 * L - 0.2); pts.push([CX - halfW(z) * 1.005 - 0.01, yy, z]); }
    b.tube(pts, 0.05, { color: yy < 0.3 ? '#9a3b2c' : '#2f3a4a', mat: M.smooth, tseg: 60, rseg: 4 });
  }
  // sea side: an embroidered saddle-cloth hanging over the wall, fringed with tassels
  const RUGS = [['#a8302a', '#e2b354'], ['#2b4f8a', '#e7d3a8'], ['#7a2f5a', '#e2b354']];
  for (let i = 0; i < 9; i++) {
    const z0 = -L + 1.2 + i * 1.35, z1 = z0 + 1.15;
    const zm = (z0 + z1) / 2;
    const x = CX + halfW(zm) + 0.02;
    const [c1, c2] = RUGS[i % 3];
    const slope = (halfW(z1) - halfW(z0)) / (z1 - z0);
    const ry = Math.PI / 2 - Math.atan(slope);
    b.box(1.1, 0.95, 0.02, { x, y: 0.42, z: zm, ry, color: c1, mat: M.cloth });
    b.box(0.85, 0.12, 0.025, { x: x + 0.005, y: 0.95, z: zm, ry, color: c2, mat: M.cloth });
    b.box(0.85, 0.06, 0.025, { x: x + 0.005, y: 0.55, z: zm, ry, color: c2, mat: M.cloth });
    b.geo(new THREE.CircleGeometry(0.17, 4), { x: x + 0.016, y: 0.75, z: zm, ry, color: c2, mat: M.cloth });
    for (let k = 0; k < 7; k++) {
      const zz = z0 + 0.08 + k * 0.16;
      b.cone(0.035, 0.16, { x: CX + halfW(zz) + 0.04, y: 0.27, z: zz, rx: Math.PI, color: k % 2 ? c2 : '#f1e8d8', seg: 5 });
    }
  }

  // houses on deck: white cubes with flat roofs
  for (let i = 0; i < 26; i++) {
    const z = rng.range(-L + 1.2, L - 1.2);
    const hw = halfW(z) - 0.5;
    const x = CX + rng.range(-hw, hw);
    if (Math.abs(z - HUMP1) < 1.5 || Math.abs(z - HUMP2) < 1.3) continue;
    const w = rng.range(0.5, 0.9), d = rng.range(0.5, 0.9), h = rng.range(0.4, 1.1);
    b.box(w, h, d, { x, y: HH + 0.2, z, color: rng.pick(['#f6efe2', '#efe4cf', '#f3e9d8', '#e9dcc4']) });
    if (rng.chance(0.5)) b.quad(0.12, 0.16, { x: x - w / 2 - 0.01, y: HH + 0.2 + h * 0.6, z, ry: -Math.PI / 2, color: C.lamp, mat: M.glow, glow: 1.5 });
  }

  /* ------------------------------------ the camel: humps, saddle, neck and head */
  for (const [zc, R] of [[HUMP1, 1.55], [HUMP2, 1.3]]) {
    b.cyl(R * 0.98, R, 0.5, { x: CX, y: HH + 0.2, z: zc, color: '#efe4cf', seg: 24 });
    b.geo(HUMP_GEO, { x: CX, y: HH + 0.7, z: zc, s: R, sz: R * 1.15, color: CAMEL, mat: M.smooth });
    // saddle band and fringe
    b.torus(R * 0.99, 0.1, { x: CX, y: HH + 0.75, z: zc, rx: Math.PI / 2, sy: 1.15, color: '#a8302a', mat: M.cloth, tseg: 36, rseg: 5 });
    for (let k = 0; k < 28; k++) {
      const a = (k / 28) * Math.PI * 2;
      b.cone(0.04, 0.2, { x: CX + Math.cos(a) * R * 1.02, y: HH + 0.5, z: zc + Math.sin(a) * R * 1.17, rx: Math.PI, color: k % 2 ? C.gold : '#2b4f8a', seg: 5 });
    }
    b.sphere(0.12, { x: CX, y: HH + 0.7 + R * 0.92, z: zc, color: C.gold, mat: M.metal, seg: 8 });
  }
  // the neck: a minaret curving out over the bow, its lantern the camel's head
  {
    const pts = [];
    for (let i = 0; i <= 10; i++) { const t = i / 10; pts.push([CX + 0.25 * t, HH + 0.2 + t * 4.2, L - 1.6 + Math.pow(t, 2.2) * 2.0]); }
    b.tube(pts, 0.32, { color: '#efe4cf', mat: M.stone, tseg: 30, rseg: 10 });
    for (let i = 2; i < 10; i += 2) b.torus(0.33, 0.04, { x: pts[i][0], y: pts[i][1], z: pts[i][2], rx: Math.PI / 2 - 0.4 * (i / 10), color: CAMEL, mat: M.smooth, tseg: 16, rseg: 3 });
    const [hx, hy, hz] = pts[10];
    b.geo(new THREE.SphereGeometry(0.4, 14, 10), { x: hx, y: hy + 0.15, z: hz + 0.35, sz: 1.6, sy: 0.85, color: CAMEL, mat: M.smooth });
    b.quad(0.2, 0.14, { x: hx - 0.37, y: hy + 0.25, z: hz + 0.4, ry: -Math.PI / 2, color: C.lamp, mat: M.glow, glow: 2.5 }); // lantern-eye
    b.quad(0.2, 0.14, { x: hx + 0.37, y: hy + 0.25, z: hz + 0.4, ry: Math.PI / 2, color: C.lamp, mat: M.glow, glow: 2.5 });
    b.cone(0.08, 0.25, { x: hx - 0.15, y: hy + 0.45, z: hz - 0.05, color: CAMEL, seg: 5 }); // ears
    b.cone(0.08, 0.25, { x: hx + 0.15, y: hy + 0.45, z: hz - 0.05, color: CAMEL, seg: 5 });
    b.cone(0.05, 0.6, { x: hx, y: hy + 0.5, z: hz + 0.2, color: C.gold, mat: M.metal, seg: 6 }); // finial
    // bridle: tassels hanging under the "jaw"
    for (let k = 0; k < 5; k++) b.cone(0.03, 0.18, { x: hx + (k - 2) * 0.1, y: hy - 0.3, z: hz + 0.55, rx: Math.PI, color: k % 2 ? '#a8302a' : C.gold, seg: 5 });
  }
  // the tail: a knotted rope hanging from the stern
  b.tube([[CX, HH + 0.3, -L + 0.1], [CX, HH - 0.1, -L - 0.25], [CX, HH - 0.7, -L - 0.3]], 0.06, { color: '#6b4a32', mat: M.wood, tseg: 12, rseg: 5 });
  b.sphere(0.13, { x: CX, y: HH - 0.75, z: -L - 0.3, color: '#6b4a32', mat: M.flat, seg: 6 });

  /* --------------------------- the ship: masts, sails, antennas, smokestacks */
  const ropes = new Lines();
  const masts = [[-0.5, -3.6, 8.5], [-0.6, 0.25, 10.0], [-0.5, 4.1, 7.6]];
  for (const [dx, z, h] of masts) {
    const x = CX + dx;
    b.cyl(0.07, 0.1, h, { x, y: HH + 0.2, z, color: '#8a5d3d', mat: M.wood, seg: 8 });
    for (const [yf, wf] of [[0.45, 1.0], [0.7, 0.78], [0.9, 0.55]]) {
      const y = HH + 0.2 + h * yf, w = 2.6 * wf;
      b.rod([x, y, z - w / 2], [x, y, z + w / 2], 0.035, { color: '#6b4a32', mat: M.wood });
      // a square sail bellied toward the desert
      const sh = h * 0.2;
      b.geo(new THREE.CylinderGeometry(1, 1, sh, 10, 1, true, Math.PI * 1.25, Math.PI * 0.5), { x: x + 0.707 * 0.5 * wf, y: y - sh, z, sx: 0.5 * wf, sz: w / 1.414, color: yf === 0.7 ? accent : '#f6efe2', mat: M.cloth });
      ropes.seg([x, y, z - w / 2], [CX, HH + 0.3, -L + 0.4], '#3a3330', 1);
      ropes.seg([x, y, z + w / 2], [CX, HH + 0.3, L - 0.5], '#3a3330', 1);
    }
    b.cone(0.1, 0.4, { x, y: HH + 0.2 + h, z, color: C.gold, mat: M.metal, seg: 6 });
    // pennant
    b.geo(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, -0.06, -0.9, 0, -0.18, 0], 3)), { x, y: HH + 0.2 + h - 0.05, z, color: '#a8302a', mat: M.cloth });
  }
  // antennas
  for (const [dx, z, h] of [[-1.1, -1.6, 4.2], [-0.9, 2.3, 5.0], [-0.2, -5.6, 3.2]]) {
    const x = CX + dx;
    b.rod([x, HH + 0.2, z], [x, HH + 0.2 + h, z], 0.02, { color: '#55575c' });
    for (let k = 0; k < 3; k++) b.rod([x, HH + h * (0.6 + k * 0.12), z - 0.4 + k * 0.1], [x, HH + h * (0.6 + k * 0.12), z + 0.4 - k * 0.1], 0.012, { color: '#55575c' });
    b.sphere(0.06, { x, y: HH + 0.25 + h, z, color: '#ff5a3a', mat: M.glow, glow: 3, seg: 6 });
  }
  // smokestacks
  const stacks = [[-1.05, -0.9], [-1.0, 1.5]];
  for (const [dx, z] of stacks) {
    const x = CX + dx;
    b.cyl(0.32, 0.36, 2.6, { x, y: HH + 0.2, z, color: '#b8352a', mat: M.smooth, seg: 14 });
    b.cyl(0.33, 0.33, 0.5, { x, y: HH + 2.3, z, color: '#2a2a2e', mat: M.smooth, seg: 14 });
    b.torus(0.33, 0.04, { x, y: HH + 1.6, z, rx: Math.PI / 2, color: '#f6efe2', mat: M.smooth, tseg: 18, rseg: 3 });
  }

  /* ----------------------------------------------- a real ship on the real sea */
  const ship = new THREE.Group();
  {
    const sb = new Builder();
    sb.geo(new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), { sx: 0.55, sy: 0.45, sz: 1.7, y: 0.35, color: '#6b4a32', mat: M.wood });
    sb.box(1.0, 0.06, 3.0, { y: 0.34, color: '#c9a36a', mat: M.wood });
    sb.cyl(0.04, 0.05, 3.2, { y: 0.35, color: '#6b4a32', mat: M.wood, seg: 6 });
    sb.geo(new THREE.CylinderGeometry(1, 1, 1.4, 10, 1, true, -Math.PI * 0.25, Math.PI * 0.5), { y: 1.2, x: -0.45, sx: 0.5, sz: 0.8, color: '#f6efe2', mat: M.cloth });
    sb.geo(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, -1.3, 0, 0, -1.3, 1.3], 3)), { y: 3.4, z: 0.1, color: '#f6efe2', mat: M.cloth });
    sb.cone(0.07, 0.3, { x: 0.2, y: 0.36, z: -0.5, color: '#2f3a5a', seg: 6 });
    sb.sphere(0.05, { x: 0.2, y: 0.71, z: -0.5, color: '#d7b08c', seg: 6 });
    ship.add(sb.build());
    ship.position.set(7.0, 0.12, -3.2);
    ship.rotation.y = -0.4;
    object.add(ship);
  }
  // a couple of small boats at the quay
  for (const z of [3.5, 5.2, -4.8]) {
    b.push({ x: CX + halfW(z) + 0.65, y: 0.16, z, ry: 0.15 });
    b.geo(new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), { sx: 0.22, sy: 0.18, sz: 0.6, y: 0.12, color: '#2b4f8a', mat: M.wood });
    b.pop();
  }

  const STATIC = b.build();
  object.add(STATIC);
  object.add(ropes.build());

  /* ---------------------------------------------------- the caravan (instanced) */
  const NCAM = 6;
  const camelParts = (() => {
    const cb = new Builder();
    cb.geo(new THREE.SphereGeometry(0.2, 10, 7), { y: 0.42, sx: 1.45, sy: 0.75, color: CAMEL, mat: M.smooth });
    cb.sphere(0.14, { y: 0.56, x: -0.04, color: CAMEL, mat: M.smooth, seg: 8 });
    cb.rod([0.22, 0.45, 0], [0.38, 0.74, 0], 0.045, { color: CAMEL, mat: M.smooth });
    cb.geo(new THREE.SphereGeometry(0.07, 8, 6), { x: 0.45, y: 0.76, sx: 1.6, color: CAMEL, mat: M.smooth });
    for (const [lx, lz] of [[0.18, 0.08], [0.18, -0.08], [-0.18, 0.08], [-0.18, -0.08]]) cb.rod([lx, 0, lz], [lx, 0.38, lz], 0.022, { color: CAMEL, mat: M.smooth });
    cb.box(0.26, 0.04, 0.32, { y: 0.66, x: -0.04, color: '#a8302a', mat: M.smooth });
    cb.box(0.16, 0.18, 0.36, { y: 0.66, x: -0.04, color: '#e7d3a8', mat: M.smooth }); // packs
    return cb.build({ shadows: true }).children[0];
  })();
  const caravan = new THREE.InstancedMesh(camelParts.geometry, camelParts.material, NCAM);
  caravan.castShadow = true;
  object.add(caravan);
  const drivers = new THREE.InstancedMesh(new THREE.ConeGeometry(0.08, 0.3, 6).translate(0, 0.15, 0), solid('#f3e9d8'), 2);
  object.add(drivers);
  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-10, 0.3, 4.8), new THREE.Vector3(-7.5, 0.45, 2.5), new THREE.Vector3(-5.6, 0.3, -1.0),
    new THREE.Vector3(-3.8, 0.32, -3.8), new THREE.Vector3(-2.2, 0.32, -6.2), new THREE.Vector3(-3.8, 0.32, -8.6),
  ]);
  // trail of footprints along the path
  {
    const fb = new Builder();
    for (let i = 0; i < 70; i++) { const p = path.getPointAt(i / 70); fb.box(0.06, 0.01, 0.06, { x: p.x + (i % 2 ? 0.08 : -0.08), y: 0.33, z: p.z, color: '#b48d58', mat: M.smooth }); }
    object.add(fb.build({ shadows: false }));
  }

  /* --------------------------------------------- windsocks and smoke (animated) */
  const socks = [];
  const sockGeo = new THREE.ConeGeometry(0.16, 0.9, 10, 1, true).rotateZ(Math.PI / 2).translate(-0.45, 0, 0);
  const sockMat = new THREE.MeshStandardMaterial({ color: '#f08a3a', side: THREE.DoubleSide, roughness: 0.9 });
  const sockMesh = new THREE.InstancedMesh(sockGeo, sockMat, 3);
  object.add(sockMesh);
  const sockPos = [[CX - 1.3, HH + 3.2, -2.6], [CX - 1.25, HH + 2.6, 3.0], [CX - 0.4, HH + 4.2, -5.3]];
  {
    const pb = new Builder();
    for (const [x, y, z] of sockPos) { pb.rod([x, HH + 0.2, z], [x, y, z], 0.02, { color: '#55575c' }); pb.torus(0.16, 0.02, { x, y, z, ry: Math.PI / 2, color: '#f6efe2', mat: M.smooth, tseg: 12, rseg: 3 }); }
    object.add(pb.build());
  }
  const NS = 24;
  const smoke = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.3, 1), new THREE.MeshStandardMaterial({ color: '#d9d2c4', transparent: true, opacity: 0.45, depthWrite: false, roughness: 1 }), NS);
  object.add(smoke);

  const _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(1, 1, 1), _e = new THREE.Euler(), _t = new THREE.Vector3();

  turnCity(object, [STATIC], 2.07);
  return {
    object,
    update(t) {
      // camels plod toward the city that looks like a ship
      for (let i = 0; i < NCAM; i++) {
        const u = ((t * 0.012 + i * 0.035) % 0.85);
        path.getPointAt(u, _p);
        path.getTangentAt(u, _t);
        const yaw = Math.atan2(-_t.z, _t.x);
        _q.setFromEuler(_e.set(0, yaw, Math.sin(t * 3 + i) * 0.04));
        _p.y += Math.abs(Math.sin(t * 3 + i)) * 0.03;
        caravan.setMatrixAt(i, _m.compose(_p, _q, _s.set(1, 1, 1)));
        if (i === 0 || i === 3) {
          _p.x += Math.sin(yaw) * 0.3; _p.z += Math.cos(yaw) * 0.3;
          drivers.setMatrixAt(i === 0 ? 0 : 1, _m.compose(_p, _q, _s));
        }
      }
      caravan.instanceMatrix.needsUpdate = true;
      drivers.instanceMatrix.needsUpdate = true;
      // the sea-ship bobs
      ship.position.y = 0.12 + Math.sin(t * 0.9) * 0.05;
      ship.rotation.z = Math.sin(t * 0.7) * 0.05;
      ship.rotation.x = Math.sin(t * 0.55) * 0.03;
      // windsocks fill and flutter in the sea breeze (blowing toward the desert)
      for (let i = 0; i < 3; i++) {
        const [x, y, z] = sockPos[i];
        _q.setFromEuler(_e.set(Math.sin(t * 2.3 + i) * 0.1, Math.sin(t * 0.4 + i) * 0.3, -0.15 + Math.sin(t * 1.7 + i * 2) * 0.12));
        _p.set(x, y, z);
        sockMesh.setMatrixAt(i, _m.compose(_p, _q, _s.set(1, 1, 1)));
      }
      sockMesh.instanceMatrix.needsUpdate = true;
      for (let i = 0; i < NS; i++) {
        const st = stacks[i % 2];
        const age = (i / NS + t * 0.05) % 1;
        const j = Math.sin(i * 12.9898) * 0.5;
        _p.set(CX + st[0] - age * 2.8, HH + 2.9 + age * 2.2 + j * age, st[1] + j * age * 1.2);
        const k = (0.5 + age * 1.8) * (1 - age * age);
        _q.identity();
        smoke.setMatrixAt(i, _m.compose(_p, _q, _s.set(k, k * 0.8, k)));
      }
      smoke.instanceMatrix.needsUpdate = true;
    },
  };
}

const HUMP1 = -1.9, HUMP2 = 2.6;
// a hump: a dome slightly peaked and leaning
const HUMP_GEO = (() => {
  const pts = [];
  for (let i = 0; i <= 14; i++) { const t = i / 14; const r = Math.cos(t * Math.PI / 2) ** 0.8; pts.push(new THREE.Vector2(Math.max(0.001, r), Math.sin(t * Math.PI / 2) * 1.15)); }
  return new THREE.LatheGeometry(pts, 24);
})();
// a dune: half-ellipsoid with a steep slip face
const DUNE = (() => {
  const g = new THREE.SphereGeometry(1, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i); if (x > 0) p.setY(i, p.getY(i) * (1 - x * 0.5)); }
  g.computeVertexNormals();
  return g;
})();
