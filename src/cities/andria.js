// Andria — every street follows a planet's orbit (Kepler ellipses sharing one focus, where the
// observatory stands), every tower stands where a star stands in its constellation — Antares,
// Alpheratz, Capella, the Cepheids — and directly above, the sky repeats the city exactly.
// Lamplighters circle the orbit-streets at the planets' own pace, as the planets do overhead.
// Now and then the citizens raise something new, and above it a nova flares.
import { THREE, Builder, M, C, Lines, house } from '../kit.js';
import { envTex } from './_e_util.js';

export default function build({ rng, accent }) {
  const b = new Builder();
  const object = new THREE.Group();
  const ground = new Lines();
  const skyL = new Lines();
  const SKY_Y = 12.5;
  const BRASS = new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 1, roughness: 0.25, envMap: envTex(), envMapIntensity: 1.4, emissive: '#2a1a05', emissiveIntensity: 0.6 });

  b.cyl(10.35, 10.4, 0.1, { seg: 96, color: '#3d4a63' }); // night-blue enamel ground
  b.ring(9.9, 10.35, { y: 0.105, seg: 96, color: C.gold, mat: BRASS });

  /* ------------------------------------------------- orbit streets -- */
  const F = [-1.4, 0.6]; // the focus: the sun's place, where the observatory stands
  const orbits = [
    { a: 2.6, e: 0.12, w: 0.4, n: 0.5 },
    { a: 4.1, e: 0.16, w: 1.6, n: 0.28 },
    { a: 5.7, e: 0.1, w: 2.9, n: 0.17 },
    { a: 7.3, e: 0.13, w: 0.9, n: 0.11 },
    { a: 8.6, e: 0.08, w: 4.2, n: 0.075 },
  ];
  const orbPt = (o, E, out) => {
    // position at eccentric anomaly E relative to the focus, rotated by w
    const bb = o.a * Math.sqrt(1 - o.e * o.e);
    const x = o.a * (Math.cos(E) - o.e), y = bb * Math.sin(E);
    out[0] = F[0] + x * Math.cos(o.w) - y * Math.sin(o.w);
    out[1] = F[1] + x * Math.sin(o.w) + y * Math.cos(o.w);
    return out;
  };
  const inside = (x, z) => Math.hypot(x, z) < 10.0;
  const onStreet = [];
  const tmp = [0, 0], tmp2 = [0, 0];
  for (const o of orbits) {
    // a ribbon of pale stone, clipped by the plinth's edge
    const N = 160, W = 0.36;
    const pos = [];
    for (let i = 0; i < N; i++) {
      orbPt(o, (i / N) * Math.PI * 2, tmp);
      orbPt(o, ((i + 1) / N) * Math.PI * 2, tmp2);
      if (!inside(tmp[0], tmp[1]) || !inside(tmp2[0], tmp2[1])) continue;
      const tx = tmp2[0] - tmp[0], tz = tmp2[1] - tmp[1], tl = Math.hypot(tx, tz);
      const nx = (-tz / tl) * W / 2, nz = (tx / tl) * W / 2;
      const a0 = [tmp[0] + nx, tmp[1] + nz], a1 = [tmp[0] - nx, tmp[1] - nz];
      const b0 = [tmp2[0] + nx, tmp2[1] + nz], b1 = [tmp2[0] - nx, tmp2[1] - nz];
      pos.push(a0[0], 0, a0[1], b0[0], 0, b0[1], a1[0], 0, a1[1], b0[0], 0, b0[1], b1[0], 0, b1[1], a1[0], 0, a1[1]);
      if (i % 3 === 0) onStreet.push([tmp[0], tmp[1]]);
      // brass kerb dots every few steps
      if (i % 8 === 0) ground.seg([tmp[0], 0.13, tmp[1]], [tmp2[0], 0.13, tmp2[1]], C.gold, 1.4);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    // fix winding so the ribbon faces up
    g.computeVertexNormals();
    const nrm = g.attributes.normal;
    if (nrm.count && nrm.getY(0) < 0) {
      const p = g.attributes.position.array;
      for (let i = 0; i < p.length; i += 9) for (let k = 0; k < 3; k++) { const t = p[i + 3 + k]; p[i + 3 + k] = p[i + 6 + k]; p[i + 6 + k] = t; }
      g.computeVertexNormals();
    }
    b.geo(g, { y: 0.115, color: '#cfc6b2' });
  }

  /* ------------------------------------------------ constellations -- */
  // [name, points [x,y,mag], lines, centre, rotation, scale]
  const CONS = [
    { name: 'Cassiopeia', p: [[0, 0, 2], [0.6, 0.55, 2.2], [1.1, 0.1, 2.5], [1.7, 0.65, 2.4], [2.25, 0.15, 3.3]], l: [[0, 1], [1, 2], [2, 3], [3, 4]], c: [-2.6, -7.0], r: 0.2, s: 1.35 },
    { name: 'Orion', p: [[0, 2.0, 0.5], [1.6, 2.1, 1.6], [0.62, 1.05, 2.2], [0.82, 0.97, 1.7], [1.02, 0.9, 2.2], [0.1, 0, 0.1], [1.5, -0.1, 2.0], [0.85, 2.6, 3.4]], l: [[0, 1], [0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6], [0, 7], [1, 7]], c: [5.4, -4.0], r: -0.3, s: 1.25 },
    { name: 'Scorpius', p: [[0, 0, 2.3], [0.3, 0.5, 2.5], [0.8, 0.9, 1.0], [1.3, 1.0, 2.8], [1.9, 0.8, 2.3], [2.3, 0.3, 2.4], [2.2, -0.3, 1.6], [1.8, -0.6, 2.7]], l: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7]], c: [3.8, 5.6], r: 0.5, s: 1.3, star: 2 },
    { name: 'Pegasus', p: [[0, 0, 2.1], [1.5, 0.1, 2.5], [1.55, 1.5, 2.4], [0.05, 1.45, 2.8], [-0.8, 1.9, 2.1], [-1.5, 2.3, 2.3]], l: [[0, 1], [1, 2], [2, 3], [3, 0], [3, 4], [4, 5]], c: [-6.4, 2.8], r: 0.9, s: 1.15, star: 3 },
    { name: 'Auriga', p: [[0, 0, 0.1], [0.9, 0.2, 1.9], [1.2, -0.7, 2.6], [0.6, -1.4, 1.7], [-0.3, -0.9, 2.7]], l: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]], c: [-7.0, -2.6], r: 0.2, s: 1.15, star: 0 },
    { name: 'Cepheus', p: [[0, 0, 2.4], [1.0, 0.0, 2.5], [1.1, 0.9, 3.2], [0.5, 1.6, 3.4], [-0.1, 0.9, 2.5]], l: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [4, 2]], c: [1.6, -0.6], r: -0.1, s: 1.1, star: 0, cepheid: true },
  ];
  const STARS = []; // {x,z,h,mag,special}
  for (const cn of CONS) {
    const cx = cn.p.reduce((s, p) => s + p[0], 0) / cn.p.length;
    const cy = cn.p.reduce((s, p) => s + p[1], 0) / cn.p.length;
    const pts = cn.p.map(([px, py, mag], i) => {
      const u = (px - cx) * cn.s, v = (py - cy) * cn.s;
      const x = cn.c[0] + u * Math.cos(cn.r) - v * Math.sin(cn.r);
      const z = cn.c[1] + u * Math.sin(cn.r) + v * Math.cos(cn.r);
      return { x, z, mag, special: cn.star === i, cepheid: cn.cepheid && i === 0 };
    });
    cn.pts = pts;
    for (const [i, j] of cn.l) {
      const A = pts[i], B = pts[j];
      ground.seg([A.x, 0.135, A.z], [B.x, 0.135, B.z], C.gold, 0.9);
      skyL.seg([A.x, SKY_Y, A.z], [B.x, SKY_Y, B.z], '#bcd4ff', 0.9);
    }
    STARS.push(...pts);
  }

  // towers on the stars: brighter star (lower magnitude) → taller tower
  const STARCOL = { Antares: '#ff6a4a', Alpheratz: '#cfe0ff', Capella: '#ffe7a8' };
  const specialCol = (cn) => (cn.name === 'Scorpius' ? STARCOL.Antares : cn.name === 'Pegasus' ? STARCOL.Alpheratz : STARCOL.Capella);
  const towerTops = [];
  const plumb = []; // faint plumb-lines joining the brightest towers to their stars
  for (const cn of CONS) {
    for (const s of cn.pts) {
      const h = 0.8 + (3.6 - s.mag) * 0.75 + (s.special ? 1.2 : 0);
      const r = 0.24 + (3.6 - s.mag) * 0.05;
      // a white round tower, gilded cap, a lantern room that echoes its star
      b.cyl(r * 1.5, r * 1.6, 0.18, { x: s.x, y: 0.1, z: s.z, seg: 16, color: '#e8e2d4' });
      b.cyl(r, r * 1.1, h, { x: s.x, y: 0.28, z: s.z, seg: 16, color: '#efe9dc', mat: M.smooth });
      b.cyl(r * 1.25, r * 1.25, 0.08, { x: s.x, y: 0.28 + h, z: s.z, seg: 16, color: C.gold, mat: BRASS });
      const lc = s.special ? specialCol(cn) : '#fff1d0';
      b.cyl(r * 0.8, r * 0.8, 0.28, { x: s.x, y: 0.36 + h, z: s.z, seg: 12, mat: M.glow, color: lc, glow: s.special ? 1.9 : 1.2 });
      if (s.mag < 2.0 || s.special) b.cone(r * 1.15, r * 2.4, { x: s.x, y: 0.64 + h, z: s.z, seg: 12, color: C.gold, mat: BRASS });
      else b.dome(r * 1.05, { x: s.x, y: 0.64 + h, z: s.z, seg: 14, color: s.mag > 2.6 ? '#6a7aa0' : '#e9e4d8', mat: M.smooth });
      if (s.special) plumb.push([s.x, 1.4 + h, s.z, specialCol(cn)]);
      // windows in a spiral
      for (let k = 0; k < Math.floor(h / 0.55); k++) {
        const a = k * 1.9;
        const lit = rng.chance(0.55);
        b.quad(0.1, 0.16, { x: s.x + Math.cos(a) * (r + 0.01), y: 0.6 + k * 0.55, z: s.z + Math.sin(a) * (r + 0.01), ry: Math.PI / 2 - a, mat: lit ? M.glow : M.smooth, color: lit ? C.lamp : '#2b3346', glow: 1.8 });
      }
      towerTops.push(s);
    }
  }

  /* ------------------------------------------- the observatory at the focus -- */
  b.cyl(1.25, 1.35, 0.3, { x: F[0], y: 0.1, z: F[1], seg: 32, color: '#e8e2d4' });
  b.cyl(0.95, 0.95, 1.5, { x: F[0], y: 0.4, z: F[1], seg: 32, color: '#efe9dc', mat: M.smooth });
  b.torus(0.97, 0.05, { x: F[0], y: 1.9, z: F[1], rx: Math.PI / 2, color: C.gold, mat: BRASS, tseg: 40 });
  const obs = new Builder();
  // dome with a slit, as two quarter-shells, plus the telescope
  obs.geo(new THREE.SphereGeometry(0.95, 24, 12, 0.18, Math.PI - 0.36, 0, Math.PI / 2), { color: '#d9dde6', mat: BRASS });
  obs.geo(new THREE.SphereGeometry(0.95, 24, 12, Math.PI + 0.18, Math.PI - 0.36, 0, Math.PI / 2), { color: '#d9dde6', mat: BRASS });
  obs.sphere(0.88, { color: '#1e2433', seg: 16, sy: 0.98 });
  obs.rod([0, 0.4, 0], [1.25, 1.35, 0], 0.11, { color: C.gold, mat: BRASS, r2: 0.15, seg: 12 });
  obs.cyl(0.16, 0.16, 0.06, { x: 1.27, y: 1.36, z: 0, rz: -0.9, color: '#1b1b1f', seg: 12 });
  const dome = obs.build();
  dome.position.set(F[0], 1.9, F[1]);
  object.add(dome);

  /* ---------------------------------- low houses lining the orbit-streets -- */
  const nearTower = (x, z, d) => towerTops.some((s) => Math.hypot(s.x - x, s.z - z) < d);
  const placed = [];
  for (const o of orbits) {
    const N = Math.round(o.a * 7);
    for (let i = 0; i < N; i++) {
      const E = (i / N) * Math.PI * 2 + rng.range(-0.03, 0.03);
      orbPt(o, E, tmp); orbPt(o, E + 0.01, tmp2);
      const tx = tmp2[0] - tmp[0], tz = tmp2[1] - tmp[1], tl = Math.hypot(tx, tz);
      for (const side of [-1, 1]) {
        if (rng.chance(0.25)) continue;
        const off = side * rng.range(0.52, 0.62);
        const x = tmp[0] + (-tz / tl) * off, z = tmp[1] + (tx / tl) * off;
        if (Math.hypot(x, z) > 9.6 || nearTower(x, z, 0.65) || Math.hypot(x - F[0], z - F[1]) < 1.6) continue;
        if (onStreet.some((p) => Math.hypot(p[0] - x, p[1] - z) < 0.42)) continue;
        if (placed.some((p) => Math.hypot(p[0] - x, p[1] - z) < 0.5)) continue;
        placed.push([x, z]);
        house(b, {
          x, z, y: 0.1, w: 0.42, d: 0.36, h: rng.range(0.35, 0.65), ry: -Math.atan2(tz, tx),
          roof: rng.pick(['flat', 'gable', 'dome']), wall: rng.pick(['#d7d3c8', '#c2c7d0', '#e4dccb', '#aeb7c6']),
          roofColor: rng.pick(['#4b5d80', '#6a7aa0', C.slate, accent]), win: false,
        });
        if (rng.chance(0.4)) b.quad(0.08, 0.1, { x: x + (-tz / tl) * (-side) * 0.19, y: 0.32, z: z + (tx / tl) * (-side) * 0.19, ry: -Math.atan2(tz, tx) + (side > 0 ? Math.PI : 0), mat: M.glow, color: C.lamp, glow: 1.6 });
      }
    }
  }

  object.add(b.build());
  object.add(ground.build(new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.75, toneMapped: false })));

  /* -------------------------------------------- the mirrored sky -- */
  object.add(skyL.build(new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.45, toneMapped: false, depthWrite: false })));
  // orbits drawn in the sky too, as faint dashed ellipses
  const so = new Lines();
  for (const o of orbits) {
    for (let i = 0; i < 120; i += 2) {
      orbPt(o, (i / 120) * Math.PI * 2, tmp); orbPt(o, ((i + 1) / 120) * Math.PI * 2, tmp2);
      so.seg([tmp[0], SKY_Y, tmp[1]], [tmp2[0], SKY_Y, tmp2[1]], '#8fa8d8', 0.6);
    }
  }
  object.add(so.build(new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.25, toneMapped: false, depthWrite: false })));
  const starGeo = new THREE.OctahedronGeometry(0.12, 0);
  const starMesh = new THREE.InstancedMesh(starGeo, new THREE.MeshBasicMaterial({ toneMapped: false }), STARS.length);
  const col = new THREE.Color();
  const m4 = new THREE.Matrix4();
  STARS.forEach((s, i) => {
    const sc = 0.6 + (3.6 - s.mag) * 0.35;
    m4.makeScale(sc, sc, sc).setPosition(s.x, SKY_Y, s.z);
    starMesh.setMatrixAt(i, m4);
    col.set('#eaf1ff').multiplyScalar(1.6 + (3.6 - s.mag) * 0.3);
    starMesh.setColorAt(i, col);
  });
  CONS.forEach((cn) => {
    if (cn.star === undefined) return;
    const i = STARS.indexOf(cn.pts[cn.star]);
    col.set(specialCol(cn)).multiplyScalar(3);
    starMesh.setColorAt(i, col);
  });
  object.add(starMesh);
  // the sun above the observatory
  const sun = new THREE.Mesh(new THREE.IcosahedronGeometry(0.32, 2), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffd27a').multiplyScalar(2.4), toneMapped: false }));
  sun.position.set(F[0], SKY_Y, F[1]);
  object.add(sun);
  plumb.push([F[0], 3.0, F[1], '#ffd27a']);
  const pl = new Lines();
  for (const [x, y, z, c] of plumb) {
    for (let yy = y; yy < SKY_Y - 0.3; yy += 0.5) pl.seg([x, yy, z], [x, Math.min(yy + 0.25, SKY_Y - 0.3), z], c, 0.9);
  }
  object.add(pl.build(new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.35, toneMapped: false, depthWrite: false })));

  // planets above, lamplighters below — moving together at Kepler's pace
  const planetCols = ['#c9c2b0', '#f0d8a0', '#7fb0ff', '#ff8a5c', '#e6c48a'];
  // (instanced, to keep draw calls low)
  const planetMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 12, 8), new THREE.MeshBasicMaterial({ toneMapped: false }), orbits.length);
  const wb = new Builder();
  wb.cone(0.07, 0.24, { color: '#2b3346', seg: 6, mat: M.stone });
  wb.sphere(0.04, { y: 0.28, color: '#d7b08c', seg: 6, mat: M.stone });
  wb.rod([0.05, 0.12, 0], [0.12, 0.42, 0], 0.01, { color: C.darkwood, mat: M.stone });
  const walkerMesh = new THREE.InstancedMesh(wb.build().children[0].geometry, M.stone, orbits.length);
  const lampMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.045, 8, 6), new THREE.MeshBasicMaterial({ toneMapped: false }), orbits.length);
  object.add(planetMesh, walkerMesh, lampMesh);
  const planets = orbits.map((o, i) => {
    col.set(planetCols[i]).multiplyScalar(1.8);
    planetMesh.setColorAt(i, col);
    col.set(planetCols[i]).multiplyScalar(3);
    lampMesh.setColorAt(i, col);
    return { o, r: 0.13 + i * 0.03, M0: rng.range(0, 6.28) };
  });

  /* ------------------------------------------------------- novae -- */
  // four changes the citizens make; above each, a star is born
  const spots = [[0.2, 3.0], [-4.6, -5.0], [7.4, 1.4], [-4.2, 6.6]];
  const nb = new Builder();
  nb.cyl(0.3, 0.33, 2.2, { y: 0, seg: 14, color: '#f4efe4', mat: M.smooth });
  nb.cone(0.36, 0.7, { y: 2.2, seg: 14, color: accent, mat: M.smooth });
  nb.box(0.66, 0.1, 0.66, { y: 0, color: '#d9b25a', mat: M.smooth });
  const newTowers = new THREE.InstancedMesh(nb.build().children[0].geometry, M.smooth, spots.length);
  newTowers.castShadow = true;
  const flares = new THREE.InstancedMesh(new THREE.SphereGeometry(0.16, 12, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color('#fff4e0').multiplyScalar(3), toneMapped: false }), spots.length);
  const halos = new THREE.InstancedMesh(new THREE.SphereGeometry(0.3, 16, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffd9a8').multiplyScalar(1.5), transparent: true, opacity: 0.16, depthWrite: false, toneMapped: false }), spots.length);
  object.add(newTowers, flares, halos);
  const qI = new THREE.Quaternion(), vP = new THREE.Vector3(), vS = new THREE.Vector3();
  const setI = (im, i, x, y, z, sx, sy, sz) => { vP.set(x, y, z); vS.set(sx, sy, sz); m4.compose(vP, qI, vS); im.setMatrixAt(i, m4); };
  const CYCLE = 48;
  const ease = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

  const P = [0, 0];
  const _up = new THREE.Vector3(0, 1, 0);
  function kepler(o, Mx) {
    let E = Mx;
    for (let k = 0; k < 4; k++) E = E - (E - o.e * Math.sin(E) - Mx) / (1 - o.e * Math.cos(E));
    return E;
  }
  function update(t) {
    dome.rotation.y = 0.6 + Math.sin(t * 0.07) * 1.2;
    planets.forEach((pl, i) => {
      const E = kepler(pl.o, pl.M0 + t * pl.o.n);
      orbPt(pl.o, E, P);
      setI(planetMesh, i, P[0], SKY_Y, P[1], pl.r, pl.r, pl.r);
      // walkers vanish where their orbit leaves the plinth
      const on = Math.hypot(P[0], P[1]) < 9.7 ? 1 : 0.001;
      const E2 = kepler(pl.o, pl.M0 + t * pl.o.n + 0.01);
      orbPt(pl.o, E2, tmp);
      const yaw = -Math.atan2(tmp[1] - P[1], tmp[0] - P[0]);
      qI.setFromAxisAngle(_up, yaw);
      setI(walkerMesh, i, P[0], 0.12, P[1], on, on, on);
      setI(lampMesh, i, P[0] + Math.cos(-yaw) * 0.12, 0.56, P[1] + Math.sin(-yaw) * 0.12, on, on, on);
      qI.identity();
    });
    planetMesh.instanceMatrix.needsUpdate = walkerMesh.instanceMatrix.needsUpdate = lampMesh.instanceMatrix.needsUpdate = true;
    const c = t % CYCLE;
    const reset = ease((c - 44) / 4); // all is undone at the end of the cycle, then begins again
    spots.forEach(([x, z], i) => {
      const t0 = 4 + i * 10;
      const grow = ease((c - t0) / 2.5) * (1 - reset);
      setI(newTowers, i, x, 0.1, z, grow > 0.002 ? 1 : 0.001, Math.max(0.001, grow), grow > 0.002 ? 1 : 0.001);
      const ft = c - (t0 + 2.6);
      let s = 0, hs = 0;
      if (ft > 0) {
        const burst = Math.exp(-ft * 1.2);
        s = 0.8 + 2.4 * burst;
        hs = burst > 0.06 ? 1.2 + 1.8 * (1 - burst) : 0;
      }
      s = Math.max(0.001, s * (1 - reset));
      setI(flares, i, x, SKY_Y, z, s, s, s);
      hs = Math.max(0.001, hs);
      setI(halos, i, x, SKY_Y, z, hs, hs, hs);
    });
    newTowers.instanceMatrix.needsUpdate = flares.instanceMatrix.needsUpdate = halos.instanceMatrix.needsUpdate = true;
    // the Cepheid pulses
    const ci = STARS.findIndex((s) => s.cepheid);
    if (ci >= 0) {
      const k = 1.1 + 0.45 * Math.sin(t * 1.6);
      m4.makeScale(k, k, k).setPosition(STARS[ci].x, SKY_Y, STARS[ci].z);
      starMesh.setMatrixAt(ci, m4);
      starMesh.instanceMatrix.needsUpdate = true;
    }
  }
  update(0);
  return { object, update };
}
