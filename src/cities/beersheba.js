// Beersheba — three cities stacked in the sky.
// Below: the earthly town of clay and plaster, with a plaster copy of heaven at its heart.
// Above: the celestial city of gold, silver locks and diamond gates — heavy, windowless, sealed.
// Around both: the true celestial Beersheba, a luminous comet of peels, scraps and broken things,
// flung away in careless moments and turning freely among the stars.
import { THREE, Builder, M, C, Lines, house, tower, tree, person } from '../kit.js';
import { envTex } from './_e_util.js';

export default function build({ rng, accent }) {
  const b = new Builder();
  const object = new THREE.Group();

  /* ----------------------------------------------------- earthly city -- */
  b.cyl(10.3, 10.4, 0.1, { seg: 64, color: '#b49a78' });
  // ring road and a central square
  b.ring(2.3, 3.0, { y: 0.105, seg: 48, color: '#cdb894' });
  b.cyl(2.3, 2.3, 0.13, { seg: 40, color: '#d9c7a4' });
  // the plaster copy of heaven: a hopeful model of the golden city on a column
  b.cyl(0.9, 1.1, 0.5, { y: 0.1, seg: 16, color: C.ivory });
  b.cyl(0.32, 0.36, 2.2, { y: 0.6, seg: 12, color: C.plaster, mat: M.smooth });
  b.cone(1.0, 0.9, { y: 2.8, rx: Math.PI, seg: 14, color: C.plaster }); // inverted cone, like the one above
  b.cyl(1.0, 1.0, 0.12, { y: 2.8, seg: 18, color: C.plaster });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    b.cyl(0.13, 0.13, 0.55, { x: Math.cos(a) * 0.75, y: 2.9, z: Math.sin(a) * 0.75, seg: 6, color: C.ivory });
    b.cone(0.16, 0.3, { x: Math.cos(a) * 0.75, y: 3.45, z: Math.sin(a) * 0.75, seg: 6, color: C.sand });
  }
  b.dome(0.4, { y: 2.92, color: C.ochre, mat: M.smooth });
  // townspeople in the square, looking up
  for (let i = 0; i < 22; i++) {
    const [x, z] = rng.inDisc(2.1, 1.25);
    person(b, { x, y: 0.13, z, h: 0.3, color: rng.pick([C.terracotta, C.slate, C.ochre, C.rose, C.sea, C.wood]) });
  }
  // houses: plain clay, flat roofs, a few domes
  const homes = [];
  for (let t = 0; t < 3000 && homes.length < 120; t++) {
    const [x, z] = rng.inDisc(9.9, 3.25);
    const w = rng.range(0.65, 1.25), d = rng.range(0.65, 1.15);
    const rad = Math.max(w, d) * 0.62;
    const rr = Math.hypot(x, z);
    if (rr + rad > 10.1) continue;
    // four radial streets
    const ang = Math.atan2(z, x);
    let onStreet = false;
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
      const dist = Math.abs(Math.sin(ang - a)) * rr;
      if (dist < 0.55 + rad * 0.7 && Math.cos(ang - a) > 0) onStreet = true;
    }
    if (onStreet) continue;
    if (homes.some((o) => Math.hypot(o.x - x, o.z - z) < rad + o.rad + 0.1)) continue;
    homes.push({ x, z, rad });
    const roof = rng.pick(['flat', 'flat', 'flat', 'dome', 'gable']);
    house(b, {
      x, z, y: 0.08, w, d, h: rng.range(0.7, 1.7), ry: -ang + rng.range(-0.15, 0.15),
      roof, wall: rng.pick(['#d8bf98', '#cfae84', C.sand, '#e2cfad', '#c9a57c']),
      roofColor: rng.pick([C.ochre, C.terracotta, '#b98f62']), lit: 0.45, r: rng,
    });
  }
  for (let i = 0; i < 14; i++) {
    const [x, z] = rng.inDisc(9.6, 3.2);
    if (homes.some((o) => Math.hypot(o.x - x, o.z - z) < o.rad + 0.2)) continue;
    tree(b, { x, y: 0.08, z, h: rng.range(1.0, 1.6), kind: rng.pick(['palm', 'round', 'cypress']), r: rng });
  }

  object.add(b.build());

  /* ------------------------------------------------ the city of gold -- */
  // A heavy, windowless hoard: polished gold walls, silver locks, diamond gates. Nothing comes out.
  const GOLD = new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 1.0, roughness: 0.22, envMap: envTex(), envMapIntensity: 1.6, emissive: '#3a2406', emissiveIntensity: 0.5 });
  const SILVER = new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 1.0, roughness: 0.14, envMap: envTex(), envMapIntensity: 1.8, emissive: '#2a2e36', emissiveIntensity: 0.4 });
  const GC = '#f4d685';
  const g = new Builder();
  const top = 0; // local; group placed at Y
  // inverted mountain under the city: a faceted gold cone, as if dug out of the ground
  const under = new THREE.ConeGeometry(4.3, 4.2, 10, 3);
  under.rotateX(Math.PI);
  {
    const p = under.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i);
      if (y < 2.0 && y > -2.0) {
        const k = 1 + 0.12 * Math.sin(i * 12.9898);
        p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k);
      }
    }
    under.computeVertexNormals();
  }
  g.geo(under, { y: top - 2.1, color: '#dcb35e', mat: GOLD });
  g.cyl(4.35, 4.3, 0.3, { y: top - 0.3, seg: 40, color: GC, mat: GOLD });
  // the walls: tall, smooth, unbroken
  const WR = 3.9, WH = 1.7;
  g.cyl(WR, WR, WH, { y: top, seg: 40, open: true, color: GC, mat: GOLD });
  g.cyl(WR - 0.25, WR - 0.25, WH, { y: top, seg: 40, open: true, color: '#d6ac55', mat: GOLD });
  g.ring(WR - 0.25, WR, { y: top + WH, seg: 40, color: GC, mat: GOLD });
  for (let i = 0; i < 40; i += 2) {
    const a = (i / 40) * Math.PI * 2;
    g.box(0.38, 0.25, 0.27, { x: Math.cos(a) * (WR - 0.12), y: top + WH, z: Math.sin(a) * (WR - 0.12), ry: -a, color: GC, mat: GOLD });
  }
  // eight corner towers with silver spires
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const x = Math.cos(a) * WR, z = Math.sin(a) * WR;
    g.cyl(0.45, 0.5, WH + 0.9, { x, y: top, z, seg: 12, color: GC, mat: GOLD });
    g.cone(0.52, 1.5, { x, y: top + WH + 0.9, z, seg: 12, color: C.silver, mat: SILVER });
  }
  // four gates of diamond, each barred by a silver lock
  const diamonds = [];
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    const x = Math.cos(a) * (WR + 0.05), z = Math.sin(a) * (WR + 0.05);
    g.box(1.3, 1.45, 0.18, { x, z, y: top, ry: -a + Math.PI / 2, color: C.silver, mat: SILVER });
    g.box(1.5, 0.22, 0.24, { x, z, y: top + 1.45, ry: -a + Math.PI / 2, color: GC, mat: GOLD });
    // crossed bars
    g.box(0.08, 1.5, 0.08, { x: x + Math.cos(a) * 0.12, z: z + Math.sin(a) * 0.12, y: top, ry: -a + Math.PI / 2, rz: 0.72, color: '#e9edf2', mat: SILVER });
    g.box(0.08, 1.5, 0.08, { x: x + Math.cos(a) * 0.12, z: z + Math.sin(a) * 0.12, y: top, ry: -a + Math.PI / 2, rz: -0.72, color: '#e9edf2', mat: SILVER });
    // the padlock
    g.box(0.36, 0.32, 0.16, { x: x + Math.cos(a) * 0.22, z: z + Math.sin(a) * 0.22, y: top + 0.42, ry: -a + Math.PI / 2, color: C.silver, mat: SILVER });
    g.torus(0.12, 0.035, { x: x + Math.cos(a) * 0.22, z: z + Math.sin(a) * 0.22, y: top + 0.78, ry: -a + Math.PI / 2, arc: Math.PI, color: C.silver, mat: SILVER });
    diamonds.push([x + Math.cos(a) * 0.14, top + 1.15, z + Math.sin(a) * 0.14]);
  }
  // inside: domes and towers rising above the walls — a skyline of treasure
  g.cyl(1.25, 1.35, 2.6, { y: top, seg: 24, color: GC, mat: GOLD });
  g.dome(1.25, { y: top + 2.6, seg: 24, color: C.silver, mat: SILVER });
  g.cyl(0.08, 0.08, 1.0, { y: top + 3.8, color: GC, mat: GOLD });
  diamonds.push([0, top + 4.95, 0]);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    const r = 2.45;
    const h = 2.0 + (i % 2) * 1.2;
    g.cyl(0.36, 0.4, h, { x: Math.cos(a) * r, z: Math.sin(a) * r, y: top, seg: 10, color: GC, mat: GOLD });
    if (i % 2) g.onion(0.48, 0.9, { x: Math.cos(a) * r, z: Math.sin(a) * r, y: top + h, color: C.silver, mat: SILVER });
    else g.dome(0.42, { x: Math.cos(a) * r, z: Math.sin(a) * r, y: top + h, color: C.silver, mat: SILVER });
  }
  // stacked ingots and coins on the terraces between
  for (let i = 0; i < 26; i++) {
    const a = rng.range(0, Math.PI * 2), r = rng.range(1.5, 3.4);
    g.box(0.34, 0.14, 0.18, { x: Math.cos(a) * r, z: Math.sin(a) * r, y: top + 0.0, ry: rng.range(0, 3), color: GC, mat: GOLD });
    if (rng.chance(0.5)) g.cyl(0.11, 0.11, 0.2, { x: Math.cos(a + 0.2) * r, z: Math.sin(a + 0.2) * r, y: top, seg: 10, color: '#fbe39a', mat: GOLD });
  }
  g.disc(WR - 0.2, { y: top + 0.01, seg: 40, color: '#c9a050', mat: GOLD });
  // a hanging chain and padlock under the tip: sealed by avarice
  const tipY = top - 4.4;
  for (let i = 0; i < 7; i++) {
    g.torus(0.12, 0.03, { y: tipY - 0.12 - i * 0.2, ry: (i % 2) * Math.PI / 2, color: C.silver, mat: SILVER, tseg: 12 });
  }
  g.box(0.5, 0.42, 0.18, { y: tipY - 1.95, color: C.silver, mat: SILVER });
  g.torus(0.16, 0.045, { y: tipY - 1.53, arc: Math.PI, color: C.silver, mat: SILVER });
  const heaven = g.build();
  const HY = 12.2;
  heaven.position.y = HY;
  object.add(heaven);

  // diamonds: faceted octahedra that glint
  const dGeo = new THREE.OctahedronGeometry(0.16, 0);
  dGeo.scale(1, 1.5, 1);
  const dMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#dff3ff').multiplyScalar(2.2), toneMapped: false });
  const dMesh = new THREE.InstancedMesh(dGeo, dMat, diamonds.length);
  const m4 = new THREE.Matrix4();
  diamonds.forEach((p, i) => { m4.makeTranslation(p[0], p[1] + HY, p[2]); dMesh.setMatrixAt(i, m4); });
  object.add(dMesh);

  /* ------------------------------------------ the comet of refuse -- */
  // Peels, rinds, scraps of paper, broken crockery, a shoe, a bottle, a can:
  // released in thoughtless moments, they are the only celestial Beersheba.
  const kinds = [];
  // orange peel: a curled strip
  { const gg = new THREE.TorusGeometry(0.16, 0.045, 4, 10, Math.PI * 1.3); gg.scale(1, 1, 0.5); kinds.push({ geo: gg, cols: ['#ff9a3c', '#ffb347', '#f2d24b'] }); }
  // banana skin: three bent petals
  { const gg = new THREE.ConeGeometry(0.06, 0.34, 4, 1, true); kinds.push({ geo: gg, cols: ['#f6dc4a', '#e7c43d'] }); }
  // paper scraps
  { const gg = new THREE.PlaneGeometry(0.28, 0.2); kinds.push({ geo: gg, cols: ['#fff6e0', '#e8f1ff', '#ffe6f0', '#f4f0c8'] }); }
  // broken crockery shards
  { const gg = new THREE.TetrahedronGeometry(0.13, 0); kinds.push({ geo: gg, cols: ['#e6eef7', '#9fd0ff', '#fffaf0', accent] }); }
  // tins and bottles
  { const gg = new THREE.CylinderGeometry(0.07, 0.07, 0.2, 8); kinds.push({ geo: gg, cols: ['#d94f4f', '#5bc0eb', '#c0c8d0', '#7ad18a'] }); }
  // apple cores, crusts
  { const gg = new THREE.IcosahedronGeometry(0.09, 0); gg.scale(1, 1.4, 1); kinds.push({ geo: gg, cols: ['#ffd9a0', '#d7a86e', '#ff7f6a'] }); }

  const N = 110; // per kind
  const meshes = [];
  const parts = [];
  const tmpC = new THREE.Color();
  kinds.forEach((k, ki) => {
    const mat = new THREE.MeshBasicMaterial({ toneMapped: false, side: THREE.DoubleSide });
    const im = new THREE.InstancedMesh(k.geo, mat, N);
    im.frustumCulled = false;
    for (let i = 0; i < N; i++) {
      // s: distance behind the head (0 = head, 1 = end of tail), skewed toward the head
      const s = Math.pow(rng(), 1.7);
      const bright = 1.05 + (1 - s) * 0.8;
      tmpC.set(rng.pick(k.cols)).multiplyScalar(bright);
      im.setColorAt(i, tmpC);
      parts.push({
        im, i, s,
        r: (0.15 + s * 1.5) * Math.sqrt(rng()), // tail widens
        a: rng.range(0, Math.PI * 2), // around the orbit
        spin: rng.range(-2.4, 2.4),
        w: rng.range(0.4, 1.4), // swirl speed
        ax: rng.range(0, 6), ay: rng.range(0, 6),
        sc: rng.range(0.9, 1.6) * (1 - s * 0.4),
      });
    }
    im.instanceColor.needsUpdate = true;
    meshes.push(im);
    object.add(im);
  });

  // the comet head: a soft bright knot of rinds around a small glowing core
  const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 2), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffe2b0').multiplyScalar(1.8), toneMapped: false }));
  object.add(head);
  const halo = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffb36b').multiplyScalar(0.6), transparent: true, opacity: 0.16, depthWrite: false, toneMapped: false }));
  object.add(halo);

  // a faint orbit, like an astronomer's line drawn through the sky
  const orbitLines = new Lines();
  const orbit = (phase, out) => {
    // tilted ellipse around the golden city
    const A = 8.6, B = 7.4;
    const x = Math.cos(phase) * A, z = Math.sin(phase) * B;
    const y = 8.6 + Math.sin(phase + 0.9) * 3.2;
    out.set(x, y, z);
    return out;
  };
  const tv = new THREE.Vector3(), tv2 = new THREE.Vector3();
  for (let i = 0; i < 120; i++) {
    if (i % 2) continue; // dashed
    orbit((i / 120) * Math.PI * 2, tv); orbit(((i + 1) / 120) * Math.PI * 2, tv2);
    orbitLines.seg(tv.toArray(), tv2.toArray(), '#ffd9a0', 0.5);
  }
  const ol = orbitLines.build(new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.35, toneMapped: false }));
  object.add(ol);

  const q = new THREE.Quaternion(), e = new THREE.Euler(), sv = new THREE.Vector3(), pv = new THREE.Vector3();
  const tangent = new THREE.Vector3(), nrm = new THREE.Vector3(), bin = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  const TAIL = 2.9; // radians of orbit covered by the tail
  function update(t) {
    const ph = t * 0.16;
    orbit(ph, pv);
    head.position.copy(pv);
    halo.position.copy(pv);
    halo.scale.setScalar(1 + 0.08 * Math.sin(t * 2.1));
    for (let k = 0; k < parts.length; k++) {
      const p = parts[k];
      const phi = ph - p.s * TAIL;
      orbit(phi, sv);
      orbit(phi + 0.01, tangent);
      tangent.sub(sv).normalize();
      nrm.crossVectors(tangent, up).normalize();
      bin.crossVectors(nrm, tangent);
      const a = p.a + t * p.w * 0.6;
      sv.addScaledVector(nrm, Math.cos(a) * p.r).addScaledVector(bin, Math.sin(a) * p.r * 0.8);
      e.set(p.ax + t * p.spin, p.ay + t * p.spin * 0.7, 0);
      q.setFromEuler(e);
      tv.setScalar(p.sc);
      m4.compose(sv, q, tv);
      p.im.setMatrixAt(p.i, m4);
    }
    for (const im of meshes) im.instanceMatrix.needsUpdate = true;
    // diamonds: a slow glint, one gate at a time
    heaven.rotation.y = 0;
  }
  update(0);
  return { object, update };
}
