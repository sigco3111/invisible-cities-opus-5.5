// Eutropia — not one city but many, identical, scattered over a rolling plateau laid out
// like an empty chessboard. Only one is alive at a time: windows lit, chimneys smoking,
// a pennant raised. When its people tire of their lives a river of lanterns flows along
// the road to the next town, which wakes as the old one goes dark — over and over.
import { THREE, Builder, M, C, rng as makeRng } from '../kit.js';
import { glowParticles, _o, _col, smooth01, vcMat } from './_c_util.js';

const TOWNS = [
  [-5.6, -3.6], [0.4, -6.4], [6.0, -2.8], [5.0, 4.4], [-0.6, 6.6], [-6.2, 3.4],
];
const ORDER = [0, 1, 2, 3, 4, 5];
const STAY = 8, MOVE = 8, PERIOD = STAY + MOVE;
const TOWN_R = 1.75;

export default function build({ rng, accent }) {
  const object = new THREE.Group();

  // ---------------------------------------------------------------- plateau heightfield
  const tBase = TOWNS.map(([x, z], i) => 0.55 + 0.35 * Math.sin(i * 2.1 + 0.4));
  function hRaw(x, z) {
    return 0.55 + 0.32 * Math.sin(x * 0.42 + 0.6) * Math.cos(z * 0.37 - 0.3) + 0.18 * Math.sin(x * 0.9 + z * 0.7) + 0.1 * Math.cos(z * 1.3 - x * 0.4);
  }
  function H(x, z) {
    let h = hRaw(x, z);
    for (let i = 0; i < TOWNS.length; i++) {
      const d = Math.hypot(x - TOWNS[i][0], z - TOWNS[i][1]);
      const k = 1 - smooth01((d - TOWN_R) / 1.2);
      h = h * (1 - k) + tBase[i] * k;
    }
    // the river bed
    const rd = riverDist(x, z);
    h -= 0.22 * (1 - smooth01(rd / 0.55));
    return Math.max(0.25, h);
  }
  // river polyline (a lazy S across the plateau, between the towns)
  const river = [];
  for (let i = 0; i <= 60; i++) {
    const t = i / 60;
    const z = -10.5 + t * 21;
    river.push([Math.sin(t * Math.PI * 2.2 + 0.4) * 2.2 + 0.6 - t * 0.8, z]);
  }
  function riverDist(x, z) {
    let best = 99;
    for (let i = 0; i < river.length - 1; i++) {
      const [ax, az] = river[i], [bx, bz] = river[i + 1];
      const vx = bx - ax, vz = bz - az;
      const t = Math.max(0, Math.min(1, ((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz)));
      const d = Math.hypot(x - ax - vx * t, z - az - vz * t);
      if (d < best) best = d;
    }
    return best;
  }

  // terrain mesh with chessboard fields (crisp squares: colour per triangle)
  {
    const R = 10.5, N = 80;
    const g = new THREE.PlaneGeometry(2 * R, 2 * R, N, N).rotateX(-Math.PI / 2).toNonIndexed();
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      let x = p.getX(i), z = p.getZ(i);
      const r = Math.hypot(x, z);
      if (r > R) { x *= R / r; z *= R / r; }
      p.setXYZ(i, x, H(x, z), z);
    }
    const col = new Float32Array(p.count * 3);
    const c = new THREE.Color();
    const sq = 2.1;
    for (let i = 0; i < p.count; i += 3) {
      const cx = (p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3;
      const cz = (p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2)) / 3;
      const odd = (Math.floor(cx / sq + 100) + Math.floor(cz / sq + 100)) % 2;
      const n = Math.sin(cx * 3.1) * Math.cos(cz * 2.7) * 0.03;
      c.set(odd ? '#8c9a5c' : '#b7a96c');
      c.offsetHSL(0, 0, n);
      const rd = riverDist(cx, cz);
      if (rd < 0.75) c.set('#7d8a58');
      for (let k = 0; k < 3; k++) { col[(i + k) * 3] = c.r; col[(i + k) * 3 + 1] = c.g; col[(i + k) * 3 + 2] = c.b; }
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.computeVertexNormals();
    const m = new THREE.Mesh(g, vcMat({ roughness: 0.95, flatShading: true }));
    m.receiveShadow = true;
    object.add(m);
  }

  const b = new Builder();
  // skirt of the plateau (earth layers)
  b.cyl(10.5, 10.5, 0.62, { color: '#6e5a44', seg: 80, open: true });

  // river ribbon following the bed
  {
    const pos = [];
    for (let i = 0; i < river.length - 1; i++) {
      const [ax, az] = river[i], [bx, bz] = river[i + 1];
      let dx = bx - ax, dz = bz - az; const l = Math.hypot(dx, dz); dx /= l; dz /= l;
      const w = 0.32;
      const q = [[ax - dz * w, az + dx * w], [ax + dz * w, az - dx * w], [bx - dz * w, bz + dx * w], [bx + dz * w, bz - dx * w]];
      if (q.some(([x, z]) => Math.hypot(x, z) > 10.2)) continue;
      const y = (x, z) => H(x, z) + 0.05;
      const v = q.map(([x, z]) => [x, y(x, z), z]);
      pos.push(...v[0], ...v[2], ...v[1], ...v[1], ...v[2], ...v[3]);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.computeVertexNormals();
    b.geo(g, { mat: M.stone, color: '#3f6f80' });
  }

  // hedgerows and trees along field edges
  for (let i = 0; i < 70; i++) {
    const [x, z] = rng.inDisc(9.6);
    if (TOWNS.some(([tx, tz]) => Math.hypot(x - tx, z - tz) < TOWN_R + 0.5)) continue;
    if (riverDist(x, z) < 0.5) continue;
    const y = H(x, z);
    if (rng.chance(0.6)) {
      b.geo(new THREE.IcosahedronGeometry(0.22, 0), { x, y: y + 0.18, z, sy: rng.range(0.8, 1.3), color: rng.pick([C.darkleaf, '#557a46', '#6a8a50']), mat: M.flat, ry: rng() * 6 });
      b.cyl(0.03, 0.04, 0.15, { x, y, z, color: C.wood, seg: 5 });
    } else {
      b.geo(new THREE.SphereGeometry(0.2, 6, 4), { x, y: y + 0.38, z, sx: 0.7, sz: 0.7, sy: 2, color: C.darkleaf, mat: M.flat });
    }
  }

  // ---------------------------------------------------------------- roads between consecutive towns
  const roads = [];
  for (let k = 0; k < ORDER.length; k++) {
    const A = TOWNS[ORDER[k]], B = TOWNS[ORDER[(k + 1) % ORDER.length]];
    const mid = [(A[0] + B[0]) / 2 * 0.72, (A[1] + B[1]) / 2 * 0.72];
    const pts = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      const x = (1 - t) * (1 - t) * A[0] + 2 * (1 - t) * t * mid[0] + t * t * B[0];
      const z = (1 - t) * (1 - t) * A[1] + 2 * (1 - t) * t * mid[1] + t * t * B[1];
      pts.push(new THREE.Vector3(x, H(x, z) + 0.12, z));
    }
    roads.push(pts);
    for (let i = 0; i < pts.length - 1; i++) {
      const p = pts[i], q = pts[i + 1];
      const dA = Math.hypot(p.x - A[0], p.z - A[1]), dB = Math.hypot(p.x - B[0], p.z - B[1]);
      if (dA < TOWN_R + 0.1 || dB < TOWN_R + 0.1) continue;
      b.beam([p.x, p.y - 0.1, p.z], [q.x, q.y - 0.1, q.z], 0.001, { color: '#d8c49a' });
      b.box(0.32, 0.03, p.distanceTo(q) + 0.02, { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 - 0.11, z: (p.z + q.z) / 2, ry: Math.atan2(q.x - p.x, q.z - p.z), color: '#d4c096' });
    }
    // a small stone bridge where the road crosses the river
    for (let i = 1; i < pts.length - 1; i++) {
      if (riverDist(pts[i].x, pts[i].z) < 0.15) {
        const p = pts[i - 1], q = pts[i + 1];
        const ry = Math.atan2(q.x - p.x, q.z - p.z);
        b.push({ x: pts[i].x, y: pts[i].y - 0.12, z: pts[i].z, ry });
        b.box(0.48, 0.08, 1.0, { y: 0.1, color: '#cbbb9c' });
        b.box(0.05, 0.12, 1.0, { x: 0.22, y: 0.18, color: '#cbbb9c' });
        b.box(0.05, 0.12, 1.0, { x: -0.22, y: 0.18, color: '#cbbb9c' });
        b.pop();
        break;
      }
    }
  }

  // ---------------------------------------------------------------- the identical towns
  // one blueprint, reused: same seed for every town
  const blueprint = [];
  {
    const r = makeRng('eutropia-blueprint');
    for (let i = 0; i < 15; i++) {
      const a = (i / 15) * Math.PI * 2 + r.range(-0.1, 0.1);
      const rr = i % 2 ? 1.15 : 0.82;
      blueprint.push({ x: Math.cos(a) * rr, z: Math.sin(a) * rr, w: r.range(0.32, 0.46), d: r.range(0.3, 0.42), h: r.range(0.36, 0.6), ry: -a, roof: r.pick(['#b8694a', '#a8553a', '#c47b54']), wall: r.pick(['#e9dcc4', '#e2cfae', '#efe4cf', '#dcc7a0']), chimney: r.chance(0.35) });
    }
  }
  const townLights = []; // per town: materials to animate + chimney positions
  for (let ti = 0; ti < TOWNS.length; ti++) {
    const [tx, tz] = TOWNS[ti];
    const y0 = tBase[ti];
    const ry0 = Math.atan2(-tx, -tz); // gate faces the centre of the plateau
    const lit = new Builder();
    const chimneys = [];
    b.push({ x: tx, y: y0, z: tz, ry: ry0 });
    lit.push({ x: tx, y: y0, z: tz, ry: ry0 });
    // the town's ground and wall
    b.cyl(TOWN_R, TOWN_R + 0.08, 0.06, { color: '#cdbb93', seg: 40 });
    const seg = 32;
    for (let i = 0; i < seg; i++) {
      const am = ((i + 0.5) / seg) * Math.PI * 2;
      if (Math.abs(Math.atan2(Math.sin(am - Math.PI / 2), Math.cos(am - Math.PI / 2))) < 0.18) continue; // gate gap toward +z
      const len = 2 * TOWN_R * Math.sin(Math.PI / seg) + 0.02;
      b.box(len, 0.32, 0.1, { x: Math.cos(am) * TOWN_R, z: Math.sin(am) * TOWN_R, ry: -am + Math.PI / 2, color: '#d8c7a4' });
      if (i % 2 === 0) b.box(len * 0.45, 0.07, 0.1, { x: Math.cos(am) * TOWN_R, y: 0.32, z: Math.sin(am) * TOWN_R, ry: -am + Math.PI / 2, color: '#d8c7a4' });
    }
    for (let k = 0; k < 4; k++) {
      const a = k * Math.PI / 2 + Math.PI / 4 + Math.PI / 2;
      b.cyl(0.16, 0.18, 0.55, { x: Math.cos(a) * TOWN_R, z: Math.sin(a) * TOWN_R, color: '#d2bf98', seg: 10 });
      b.cone(0.22, 0.3, { x: Math.cos(a) * TOWN_R, y: 0.55, z: Math.sin(a) * TOWN_R, color: '#a8553a', seg: 10, mat: M.flat });
    }
    // gate towers
    for (const s of [-1, 1]) {
      b.box(0.2, 0.55, 0.2, { x: s * 0.36, z: TOWN_R, color: '#d2bf98' });
    }
    b.box(0.92, 0.1, 0.2, { y: 0.45, z: TOWN_R, color: '#d2bf98' });
    // houses
    for (const h of blueprint) {
      b.push({ x: h.x, z: h.z, ry: h.ry });
      b.box(h.w, h.h, h.d, { color: h.wall });
      b.geo(new THREE.CylinderGeometry(0.0001, 0.72, 1, 4, 1).rotateY(Math.PI / 4).translate(0, 0.5, 0), { y: h.h, sx: h.w, sz: h.d, sy: 0.2, color: h.roof, mat: M.flat });
      // windows on the outward/inward faces: dark static, and a glow twin in the town's own mesh
      for (const sz of [1, -1]) {
        for (const ux of [-0.09, 0.09]) {
          b.quad(0.09, 0.12, { x: ux, y: h.h * 0.55, z: sz * (h.d / 2 + 0.006), ry: sz > 0 ? 0 : Math.PI, color: '#2e2a2a', mat: M.smooth });
        }
      }
      b.pop();
      // lit windows (repeat same placement in the lit builder)
      lit.push({ x: h.x, z: h.z, ry: h.ry });
      for (const sz of [1, -1]) for (const ux of [-0.09, 0.09]) lit.quad(0.09, 0.12, { x: ux, y: h.h * 0.55, z: sz * (h.d / 2 + 0.012), ry: sz > 0 ? 0 : Math.PI, color: '#ffffff', mat: M.smooth });
      lit.pop();
      if (h.chimney) {
        b.box(0.06, 0.18, 0.06, { x: h.x + Math.cos(h.ry) * 0.08, y: h.h + 0.02, z: h.z - Math.sin(h.ry) * 0.08, color: '#9a8a78' });
        const wp = new THREE.Vector3(h.x + Math.cos(h.ry) * 0.08, h.h + 0.22, h.z - Math.sin(h.ry) * 0.08).applyAxisAngle(new THREE.Vector3(0, 1, 0), ry0);
        chimneys.push(new THREE.Vector3(tx + wp.x, y0 + wp.y, tz + wp.z));
      }
    }
    // the square and its church with a bell tower
    b.cyl(0.42, 0.42, 0.02, { y: 0.06, color: '#bfae8a', seg: 20 });
    b.box(0.5, 0.7, 0.36, { x: 0, z: -0.25, color: '#efe4cf' });
    b.geo(new THREE.CylinderGeometry(0.0001, 0.72, 1, 4, 1).rotateY(Math.PI / 4).translate(0, 0.5, 0), { y: 0.7, z: -0.25, sx: 0.52, sz: 0.38, sy: 0.22, color: '#a8553a', mat: M.flat });
    b.box(0.2, 1.25, 0.2, { x: 0.22, z: -0.42, color: '#efe4cf' });
    b.cone(0.17, 0.4, { x: 0.22, y: 1.25, z: -0.42, seg: 4, color: '#a8553a', mat: M.flat });
    b.rod([0.22, 1.6, -0.42], [0.22, 2.05, -0.42], 0.012, { color: C.darkwood });
    lit.quad(0.08, 0.12, { x: 0.22, y: 1.05, z: -0.42 + 0.106, color: '#ffffff', mat: M.smooth });
    lit.quad(0.1, 0.16, { x: 0, y: 0.4, z: -0.25 + 0.19, color: '#ffffff', mat: M.smooth });
    // street lamps in the square (part of the town's lights)
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2 + 0.3;
      b.cyl(0.012, 0.015, 0.3, { x: Math.cos(a) * 0.5, y: 0.06, z: Math.sin(a) * 0.5, color: C.charcoal, seg: 4 });
      lit.sphere(0.035, { x: Math.cos(a) * 0.5, y: 0.38, z: Math.sin(a) * 0.5, color: '#ffffff', mat: M.smooth, seg: 6 });
    }
    lit.sphere(0.04, { x: 0.36, y: 0.48, z: TOWN_R + 0.12, color: '#ffffff', mat: M.smooth, seg: 6 });
    lit.sphere(0.04, { x: -0.36, y: 0.48, z: TOWN_R + 0.12, color: '#ffffff', mat: M.smooth, seg: 6 });
    b.pop();
    lit.pop();

    // build this town's lights with its own material
    const litMat = new THREE.MeshBasicMaterial({ color: '#000000', toneMapped: false });
    const litGroup = lit.build({ shadows: false });
    litGroup.traverse((o) => { if (o.isMesh) o.material = litMat; });
    object.add(litGroup);
    // the pennant on the bell tower: raised when inhabited
    const pen = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.14).translate(0.14, -0.07, 0), new THREE.MeshStandardMaterial({ color: accent, side: THREE.DoubleSide, roughness: 0.9 }));
    const penPos = new THREE.Vector3(0.22, 2.05, -0.42).applyAxisAngle(new THREE.Vector3(0, 1, 0), ry0);
    pen.position.set(tx + penPos.x, y0 + penPos.y, tz + penPos.z);
    object.add(pen);
    townLights.push({ mat: litMat, chimneys, pen, life: 0, base: penPos.y + y0 });
  }

  object.add(b.build());

  // ---------------------------------------------------------------- smoke & migrating lanterns
  const PUFFS = 6;
  const allChim = [];
  townLights.forEach((T, ti) => T.chimneys.forEach((c) => allChim.push({ c, ti })));
  const smoke = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.11, 1), new THREE.MeshStandardMaterial({ color: '#e4ddd2', roughness: 1, transparent: true, opacity: 0.7, depthWrite: false }), allChim.length * PUFFS);
  smoke.frustumCulled = false;
  object.add(smoke);

  const NL = 46;
  const lanterns = glowParticles(NL, 0.05, '#ffffff', 1);
  for (let i = 0; i < NL; i++) lanterns.setColorAt(i, _col.set(C.lamp).multiplyScalar(i % 7 === 0 ? 3.2 : 2.2));
  object.add(lanterns);
  // little dark walkers carrying the lanterns
  const walkers = new THREE.InstancedMesh(new THREE.ConeGeometry(0.035, 0.13, 5).translate(0, 0.065, 0), new THREE.MeshStandardMaterial({ color: '#3a302c', roughness: 0.9 }), NL);
  walkers.frustumCulled = false;
  object.add(walkers);
  const lagOf = new Float32Array(NL);
  const sideOf = new Float32Array(NL);
  for (let i = 0; i < NL; i++) { lagOf[i] = i / NL * 0.55 + rng.range(-0.01, 0.01); sideOf[i] = rng.range(-0.1, 0.1); }

  const P = new THREE.Vector3();
  function roadPoint(road, s, out) {
    const n = road.length - 1;
    const f = Math.max(0, Math.min(0.9999, s)) * n;
    const k = Math.floor(f), fr = f - k;
    out.lerpVectors(road[k], road[k + 1], fr);
    return out;
  }

  function update(t) {
    const cyc = Math.floor(t / PERIOD);
    const ph = t - cyc * PERIOD;
    const k = ((cyc % ORDER.length) + ORDER.length) % ORDER.length;
    const from = ORDER[k], to = ORDER[(k + 1) % ORDER.length];
    const m = ph < STAY ? 0 : (ph - STAY) / MOVE; // migration progress 0..1
    // lanterns: leave over the first part, arrive over the last
    let departed = 0, arrived = 0;
    const road = roads[k];
    for (let i = 0; i < NL; i++) {
      const s = (m * 1.55 - lagOf[i]) / 1.0; // 0..1 along the road
      if (m <= 0 || s <= 0 || s >= 1) {
        if (s >= 1) arrived++; else if (m > 0 && s > 0) departed++;
        _o.position.set(0, -20, 0); _o.scale.setScalar(0.0001); _o.rotation.set(0, 0, 0); _o.updateMatrix();
        lanterns.setMatrixAt(i, _o.matrix); walkers.setMatrixAt(i, _o.matrix);
        continue;
      }
      departed++;
      roadPoint(road, s, P);
      _o.position.set(P.x + sideOf[i], P.y - 0.1, P.z + sideOf[i] * 0.6);
      _o.rotation.set(0, 0, 0);
      _o.scale.setScalar(1);
      _o.updateMatrix();
      walkers.setMatrixAt(i, _o.matrix);
      _o.position.y += 0.17 + Math.sin(t * 6 + i) * 0.01;
      _o.position.x += 0.03;
      _o.updateMatrix();
      lanterns.setMatrixAt(i, _o.matrix);
    }
    lanterns.instanceMatrix.needsUpdate = true;
    walkers.instanceMatrix.needsUpdate = true;
    // town life
    const leaveFrac = m > 0 ? Math.min(1, (departed + arrived) / NL) : 0;
    const arriveFrac = m > 0 ? arrived / NL : 0;
    for (let ti = 0; ti < townLights.length; ti++) {
      let life = 0;
      if (ti === from) life = 1 - smooth01(leaveFrac * 1.05);
      if (ti === to) life = smooth01(arriveFrac);
      const T = townLights[ti];
      T.life = life;
      const flick = 1 + 0.04 * Math.sin(t * 3 + ti * 2);
      T.mat.color.set(C.lamp).multiplyScalar(life * 2.6 * flick);
      T.pen.visible = life > 0.02;
      T.pen.scale.set(life, Math.max(0.01, life), 1);
      T.pen.rotation.y = Math.sin(t * 1.7 + ti) * 0.4;
    }
    // smoke
    let n = 0;
    for (const { c, ti } of allChim) {
      const life = townLights[ti].life;
      for (let j = 0; j < PUFFS; j++) {
        const u = ((t * 0.28 + j / PUFFS + c.x * 0.37) % 1);
        _o.position.set(c.x + u * 0.35 + Math.sin(u * 6 + j) * 0.04, c.y + u * 1.4, c.z + u * 0.15);
        _o.rotation.set(0, 0, 0);
        _o.scale.setScalar(life < 0.02 ? 0.0001 : life * (0.5 + u * 1.6) * (1 - u * 0.6));
        _o.updateMatrix();
        smoke.setMatrixAt(n++, _o.matrix);
      }
    }
    smoke.instanceMatrix.needsUpdate = true;
  }
  update(0);
  return { object, update };
}
