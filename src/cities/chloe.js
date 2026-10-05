// Chloe — the most chaste city. Strangers walk slowly through a star-shaped piazza and
// its radial streets; nobody greets anybody, but between them glowing threads of
// imagined encounters flicker on and off, locking into arrows, triangles and stars,
// so that the whole city trembles with what is never lived.
import { THREE, Builder, M, C, windows } from '../kit.js';
import { glowParticles, _o, _col, smooth01 } from './_c_util.js';

const NR = 6; // radial streets
const RING_R = 7.0;
const PIAZZA_R = 6.4;

export default function build({ rng, accent }) {
  const b = new Builder();
  const G = 0.12;

  // ---------------------------------------------------------------- ground & paving
  b.cyl(10.3, 10.4, G, { color: '#cdbfa8', seg: 64 });
  // piazza: concentric paving with an inlaid star (an echo of the threads)
  b.cyl(PIAZZA_R + 0.4, PIAZZA_R + 0.4, 0.02, { y: G, color: '#e6dccb', seg: 48 });
  b.ring(PIAZZA_R - 0.1, PIAZZA_R + 0.3, { y: G + 0.025, color: '#b79c84', seg: 48 });
  b.ring(2.4, 2.55, { y: G + 0.025, color: '#b79c84', seg: 40 });
  b.ring(4.2, 4.28, { y: G + 0.025, color: '#c4ab92', seg: 48 });
  const star = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const r = i % 2 === 0 ? 5.6 : 2.3;
    star.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  b.slab(star, 0.012, { y: G + 0.022, color: '#d6a99a' });
  const star2 = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + Math.PI / 10;
    const r = i % 2 === 0 ? 2.2 : 0.9;
    star2.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  b.slab(star2, 0.012, { y: G + 0.035, color: '#a87b70' });
  // streets: radial + ring, paved lighter
  for (let k = 0; k < NR; k++) {
    const a = (k / NR) * Math.PI * 2 + 0.26;
    b.box(1.6, 0.02, 4.2, { x: Math.cos(a) * 8.4, y: G, z: Math.sin(a) * 8.4, ry: Math.PI / 2 - a, color: '#ddd1bd' });
  }
  // central fountain: a basin with a slim column and a veiled figure who looks at no one
  b.cyl(0.75, 0.8, 0.28, { y: G, color: '#e8e0d2', mat: M.smooth, seg: 28 });
  b.cyl(0.66, 0.66, 0.02, { y: G + 0.25, color: '#5d8794', mat: M.smooth, seg: 28 });
  b.cyl(0.08, 0.1, 1.5, { y: G + 0.25, color: '#efe7da', mat: M.smooth, seg: 10 });
  b.cyl(0.25, 0.12, 0.12, { y: G + 1.75, color: '#efe7da', mat: M.smooth, seg: 14 });
  b.cone(0.13, 0.42, { y: G + 1.87, color: '#f1ece4', mat: M.smooth, seg: 10 });
  b.sphere(0.065, { y: G + 2.33, color: '#f1ece4', mat: M.smooth });

  // ---------------------------------------------------------------- palazzi
  const pastel = ['#e2bb85', '#d99a7a', '#cf9a5e', '#e8d4ae', '#c97f5f', '#dcae6e', '#c4a27c', '#e6c298', '#b8785a'];
  const shutters = ['#6f8a6a', '#5f7b86', '#8a5a4e', '#7f7a5a'];
  const streetHalf = 0.95; // angle gap = street half width / radius
  function block(r, depth, hMin, hMax, faceIn, faceOut) {
    for (let k = 0; k < NR; k++) {
      const a0 = (k / NR) * Math.PI * 2 + 0.26, a1 = ((k + 1) / NR) * Math.PI * 2 + 0.26;
      const g = streetHalf / r;
      const s0 = a0 + g, s1 = a1 - g;
      const arc = (s1 - s0) * r;
      const n = Math.max(2, Math.round(arc / 1.15));
      const wEach = arc / n;
      for (let i = 0; i < n; i++) {
        const a = s0 + (i + 0.5) / n * (s1 - s0);
        const x = Math.cos(a) * r, z = Math.sin(a) * r;
        const h = rng.range(hMin, hMax);
        const wall = rng.pick(pastel);
        const w = wEach + 0.02, d = depth;
        b.push({ x, y: G, z, ry: -a - Math.PI / 2 });
        // local +z points inward (toward the centre), local x along the arc
        b.box(w, h, d, { color: wall });
        b.box(w + 0.02, 0.08, d + 0.1, { y: h, color: '#f6efe4' });
        b.box(w + 0.02, 0.05, d + 0.06, { y: 0.95, color: '#f6efe4' });
        // terracotta roof
        const roofH = 0.3;
        b.geo(new THREE.CylinderGeometry(0.0001, 0.72, 1, 4, 1).rotateY(Math.PI / 4).translate(0, 0.5, 0), { y: h + 0.08, sx: w * 0.98, sz: d * 0.98, sy: roofH, color: rng.pick([C.terracotta, '#b8694a', '#c47b54']), mat: M.flat });
        // arcade on the street sides
        for (const side of [faceIn ? 1 : 0, faceOut ? -1 : 0]) {
          if (!side) continue;
          const zf = side * (d / 2 + 0.006);
          const nA = Math.max(1, Math.round(w / 0.45));
          for (let j = 0; j < nA; j++) {
            const u = (j + 0.5) / nA * w - w / 2;
            b.box(0.24, 0.5, 0.02, { x: u, z: zf, color: '#4a3a33' });
            b.cyl(0.12, 0.12, 0.02, { x: u, y: 0.5, z: zf, rx: Math.PI / 2, color: '#4a3a33', seg: 10, thetaStart: -Math.PI / 2, thetaLength: Math.PI });
            // upper windows with shutters
            const sh = rng.pick(shutters);
            for (let fl = 0; fl < Math.floor((h - 1.1) / 0.7); fl++) {
              const wy = 1.25 + fl * 0.7;
              const lit = rng.chance(0.28);
              b.quad(0.16, 0.3, { x: u, y: wy, z: zf + side * 0.004, ry: side > 0 ? 0 : Math.PI, mat: lit ? M.glow : M.smooth, color: lit ? C.lamp : '#3d342f', glow: 1.6 });
              b.quad(0.08, 0.3, { x: u - 0.13, y: wy, z: zf + side * 0.006, ry: side > 0 ? 0 : Math.PI, color: sh });
              b.quad(0.08, 0.3, { x: u + 0.13, y: wy, z: zf + side * 0.006, ry: side > 0 ? 0 : Math.PI, color: sh });
              if (fl === 0 && rng.chance(0.35)) b.box(0.36, 0.04, 0.14, { x: u, y: wy - 0.2, z: zf + side * 0.07, color: '#f6efe4' });
            }
          }
        }
        b.pop();
      }
    }
  }
  block(8.7, 2.2, 1.15, 2.0, true, false);
  // lamp posts and benches around the piazza: places to sit and not speak
  for (let k = 0; k < 18; k++) {
    const a = (k / 18) * Math.PI * 2 + 0.1;
    const x = Math.cos(a) * 6.55, z = Math.sin(a) * 6.55;
    if (k % 3 === 0) {
      b.cyl(0.02, 0.03, 0.9, { x, y: G, z, color: C.charcoal, seg: 5 });
      b.sphere(0.06, { x, y: G + 0.95, z, mat: M.glow, color: C.lamp, glow: 2.2, seg: 8 });
    } else {
      b.box(0.5, 0.04, 0.14, { x, y: G + 0.14, z, ry: -a + Math.PI / 2, color: C.wood, mat: M.wood });
      b.box(0.04, 0.14, 0.12, { x: x + Math.sin(a) * 0.2, y: G, z: z - Math.cos(a) * 0.2, ry: -a + Math.PI / 2, color: C.charcoal });
      b.box(0.04, 0.14, 0.12, { x: x - Math.sin(a) * 0.2, y: G, z: z + Math.cos(a) * 0.2, ry: -a + Math.PI / 2, color: C.charcoal });
    }
  }
  // potted orange trees at the street mouths (the accent colour of trade)
  for (let k = 0; k < NR; k++) {
    const a = (k / NR) * Math.PI * 2 + 0.26;
    for (const sgn of [-1, 1]) {
      const x = Math.cos(a) * 7.2 - Math.sin(a) * sgn * 1.05, z = Math.sin(a) * 7.2 + Math.cos(a) * sgn * 1.05;
      b.cyl(0.14, 0.1, 0.22, { x, y: G, z, color: C.terracotta, seg: 10 });
      b.rod([x, G + 0.2, z], [x, G + 0.55, z], 0.025, { color: C.wood });
      b.sphere(0.24, { x, y: G + 0.7, z, color: C.darkleaf, mat: M.flat, seg: 7 });
      for (let f = 0; f < 4; f++) b.sphere(0.035, { x: x + Math.cos(f * 1.7) * 0.2, y: G + 0.66 + (f % 2) * 0.12, z: z + Math.sin(f * 1.7) * 0.2, color: accent, seg: 5 });
    }
  }

  // ---------------------------------------------------------------- walkers
  // closed loops: in along one radial, across the piazza, out along another, round the ring
  const loops = [];
  for (let l = 0; l < 16; l++) {
    const pts = [];
    const n = rng.int(4, 6);
    const a0 = rng.range(0, Math.PI * 2);
    for (let k = 0; k < n; k++) {
      const a = a0 + (k / n) * Math.PI * 2 + rng.range(-0.4, 0.4);
      let r = rng.range(1.4, 5.6);
      if (k === 0 && rng.chance(0.6)) {
        // wander out along a radial street and come back
        const kk = Math.round(((a - 0.26) / (Math.PI * 2)) * NR);
        const aa = (kk / NR) * Math.PI * 2 + 0.26;
        const lat = rng.range(-0.35, 0.35);
        pts.push([Math.cos(aa) * 9.6 - Math.sin(aa) * lat, Math.sin(aa) * 9.6 + Math.cos(aa) * lat]);
        pts.push([Math.cos(aa) * 7.0 + Math.sin(aa) * lat, Math.sin(aa) * 7.0 - Math.cos(aa) * lat]);
        continue;
      }
      if (Math.hypot(Math.cos(a) * r, Math.sin(a) * r) < 1.2) r = 1.4;
      pts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    const curve = new THREE.CatmullRomCurve3(pts.map(([x, z]) => new THREE.Vector3(x, 0, z)), true, 'centripetal');
    const P = curve.getSpacedPoints(240);
    loops.push({ P, len: curve.getLength() });
  }
  const NW = 170;
  const walkers = [];
  for (let i = 0; i < NW; i++) {
    const L = rng.pick(loops);
    walkers.push({ L, u: rng(), speed: rng.range(0.22, 0.42) / L.len * (rng.chance(0.5) ? 1 : -1), off: rng.range(-0.25, 0.25), x: 0, z: 0, h: rng.range(0.34, 0.42), ph: rng.range(0, 6) });
  }
  const bodyGeo = new THREE.ConeGeometry(0.075, 0.26, 6).translate(0, 0.13, 0);
  const headGeo = new THREE.SphereGeometry(0.042, 8, 6).translate(0, 0.3, 0);
  const bodies = new THREE.InstancedMesh(bodyGeo, new THREE.MeshStandardMaterial({ roughness: 0.8 }), NW);
  const heads = new THREE.InstancedMesh(headGeo, new THREE.MeshStandardMaterial({ roughness: 0.7 }), NW);
  bodies.castShadow = true;
  const robes = ['#3c3a46', '#6d4a5a', '#8c5a3c', '#e8e0d0', '#4d5f74', '#7b6a8e', '#a8553a', '#2e4a4a', '#c9b48a', '#5a3a3a'];
  for (let i = 0; i < NW; i++) {
    bodies.setColorAt(i, _col.set(rng.pick(robes)));
    heads.setColorAt(i, _col.set(rng.pick(['#d7b08c', '#c49270', '#a87454', '#e2c3a3', '#3b2f2a'])));
  }
  bodies.frustumCulled = heads.frustumCulled = false;

  // ---------------------------------------------------------------- threads (thin glowing rods)
  const NT = 150;
  const thrGeo = new THREE.CylinderGeometry(0.02, 0.02, 1, 4, 1, true).rotateX(Math.PI / 2).translate(0, 0, 0.5);
  const thrMat = new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
  const threads = new THREE.InstancedMesh(thrGeo, thrMat, NT);
  threads.frustumCulled = false;
  for (let i = 0; i < NT; i++) threads.setColorAt(i, _col.setRGB(0, 0, 0));
  // knots of light where a thread meets an eye
  const knots = glowParticles(NT, 0.03, '#ffffff', 0);
  for (let i = 0; i < NT; i++) knots.setColorAt(i, _col.setRGB(0, 0, 0));

  // events: a pair, triangle, arrow or star among nearby strangers
  const EV = [];
  const palette = [new THREE.Color('#ffb0a0'), new THREE.Color('#ffd9a0'), new THREE.Color(accent), new THREE.Color('#f7a6c8'), new THREE.Color('#fff0d8')];
  let slot = 0;
  const nearBuf = [];
  function nearest(i, k, maxD) {
    nearBuf.length = 0;
    const a = walkers[i];
    for (let j = 0; j < NW; j++) {
      if (j === i) continue;
      const d = Math.hypot(walkers[j].x - a.x, walkers[j].z - a.z);
      if (d < maxD && d > 0.4) nearBuf.push(j);
    }
    rng.shuffle(nearBuf);
    return nearBuf.slice(0, k);
  }
  function spawn(t) {
    const kind = rng.pick(['pair', 'pair', 'tri', 'tri', 'arrow', 'star']);
    const need = { pair: 1, tri: 2, arrow: 3, star: 4 }[kind];
    const i0 = rng.int(0, NW - 1);
    const others = nearest(i0, need, kind === 'star' ? 4.2 : 3.4);
    if (others.length < need) return;
    const m = [i0, ...others];
    const segs = [];
    if (kind === 'pair') segs.push([m[0], m[1]]);
    else if (kind === 'tri') segs.push([m[0], m[1]], [m[1], m[2]], [m[2], m[0]]);
    else if (kind === 'arrow') segs.push([m[0], m[1]], [m[1], m[2]], [m[1], m[3]]); // shaft + two barbs
    else {
      // pentagram: order by angle around centroid, connect every second
      let cx = 0, cz = 0;
      for (const k of m) { cx += walkers[k].x; cz += walkers[k].z; }
      cx /= 5; cz /= 5;
      m.sort((p, q) => Math.atan2(walkers[p].z - cz, walkers[p].x - cx) - Math.atan2(walkers[q].z - cz, walkers[q].x - cx));
      for (let k = 0; k < 5; k++) segs.push([m[k], m[(k + 2) % 5]]);
    }
    if (EV.length + segs.length > NT) return;
    const col = rng.pick(palette);
    const dur = rng.range(2.6, 5.5);
    for (let s = 0; s < segs.length; s++) EV.push({ a: segs[s][0], b: segs[s][1], t0: t + s * 0.18, dur, col, ph: rng.range(0, 6) });
    slot++;
  }

  const pA = new THREE.Vector3(), pB = new THREE.Vector3();
  let nextSpawn = 0;
  function update(t, dt) {
    // walkers
    for (let i = 0; i < NW; i++) {
      const w = walkers[i];
      let u = (w.u + t * w.speed) % 1; if (u < 0) u += 1;
      const P = w.L.P, n = P.length - 1;
      const f = u * n, k = Math.floor(f), fr = f - k;
      const p = P[k], q = P[(k + 1) % (n + 1)];
      let dx = q.x - p.x, dz = q.z - p.z;
      const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
      w.x = p.x + (q.x - p.x) * fr - dz * w.off;
      w.z = p.z + (q.z - p.z) * fr + dx * w.off;
      const bob = Math.abs(Math.sin(t * 5 + w.ph)) * 0.012;
      _o.position.set(w.x, G + bob, w.z);
      _o.rotation.set(0, Math.atan2(dx, dz) * (w.speed > 0 ? 1 : -1), 0);
      _o.scale.set(1, w.h / 0.34, 1);
      _o.updateMatrix();
      bodies.setMatrixAt(i, _o.matrix);
      heads.setMatrixAt(i, _o.matrix);
    }
    bodies.instanceMatrix.needsUpdate = true;
    heads.instanceMatrix.needsUpdate = true;

    // threads
    if (t - nextSpawn > 3 || nextSpawn - t > 3) nextSpawn = t - 3;
    while (t > nextSpawn) { spawn(nextSpawn); nextSpawn += 0.22; }
    let n = 0;
    for (let e = EV.length - 1; e >= 0; e--) if (t > EV[e].t0 + EV[e].dur) EV.splice(e, 1);
    for (let e = 0; e < EV.length && n < NT; e++) {
      const ev = EV[e];
      const u = (t - ev.t0) / ev.dur;
      if (u < 0) continue;
      const A = walkers[ev.a], B = walkers[ev.b];
      const ha = G + A.h * 0.9, hb = G + B.h * 0.9;
      pA.set(A.x, ha, A.z); pB.set(B.x, hb, B.z);
      // the glance shoots out from A and reaches B, then lingers and fades
      const grow = smooth01(u / 0.18);
      const fade = smooth01(u / 0.12) * smooth01((1 - u) / 0.35);
      const tremble = 0.75 + 0.25 * Math.sin(t * 23 + ev.ph) * Math.sin(t * 7 + ev.ph);
      const len = pA.distanceTo(pB) * grow;
      _o.position.copy(pA);
      _o.lookAt(pB);
      _o.scale.set(1, 1, Math.max(0.0001, len));
      _o.updateMatrix();
      threads.setMatrixAt(n, _o.matrix);
      _col.copy(ev.col).multiplyScalar(3.0 * fade * tremble);
      threads.setColorAt(n, _col);
      _o.position.lerpVectors(pA, pB, grow);
      _o.scale.setScalar(1);
      _o.updateMatrix();
      knots.setMatrixAt(n, _o.matrix);
      _col.copy(ev.col).multiplyScalar(2.5 * fade);
      knots.setColorAt(n, _col);
      n++;
    }
    for (let i = n; i < NT; i++) {
      _o.position.set(0, -5, 0); _o.scale.setScalar(0.0001); _o.rotation.set(0, 0, 0); _o.updateMatrix();
      threads.setMatrixAt(i, _o.matrix); knots.setMatrixAt(i, _o.matrix);
    }
    threads.instanceMatrix.needsUpdate = true;
    threads.instanceColor.needsUpdate = true;
    knots.instanceMatrix.needsUpdate = true;
    knots.instanceColor.needsUpdate = true;
  }

  const object = new THREE.Group();
  object.add(b.build(), bodies, heads, threads, knots);
  update(0, 0);
  return { object, update };
}
