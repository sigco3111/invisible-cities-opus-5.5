// Leonia — remade every morning: fresh sheets, new soap, brand-new tins. At its centre a spotless
// white city whose pavements are lined with neat plastic bags of yesterday's Leonia, waiting for the
// trucks. All around, the refuse of every year rises into a mountain range — bags, tins, bottles,
// tyres, old fridges — pressing inward. Now and then a little landslide trickles down the slope.
import { THREE, Builder, M, C, Lines, tree } from '../kit.js';
import { terrainGeo } from './_e_util.js';

export default function build({ rng, accent }) {
  const b = new Builder();
  const object = new THREE.Group();

  /* ------------------------------------------------- the mountain range -- */
  const R0 = 5.9, R1 = 8.2;
  const ridge = (a) => 3.9 + 0.9 * Math.sin(3 * a + 1.0) + 0.55 * Math.sin(7 * a + 0.3) + 0.3 * Math.sin(13 * a + 2.0);
  const sstep = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
  const H = (x, z) => {
    const r = Math.hypot(x, z), a = Math.atan2(z, x);
    const rise = sstep((r - R0) / (R1 - R0));
    const lumps = 0.22 * Math.sin(x * 2.3 + z * 1.1) + 0.18 * Math.cos(z * 2.9 - x * 0.7);
    const edge = r > 8.7 ? 1 - sstep((r - 8.7) / 1.9) * 0.8 : 1; // outer flank, still heaped at the rim
    return 0.1 + Math.max(0, rise * (ridge(a) + lumps) * edge);
  };
  const tg = terrainGeo(H, 10.5, 44, 160, 0.02);
  // a crust of compacted refuse: every facet its own faded colour
  {
    const g2 = tg.toNonIndexed();
    const p = g2.attributes.position;
    const col = new Float32Array(p.count * 3);
    const pal = ['#7d715f', '#5f574c', '#8a7b63', '#4f5d6b', '#6d7d5e', '#8d6f5a', '#a49a86', '#6b5c5e', '#3f4148', '#8a4f45', '#b39a5a', '#5b7690'].map((h) => new THREE.Color(h));
    const white = new THREE.Color('#e9ecef'), dark = new THREE.Color('#4e4840');
    for (let i = 0; i < p.count; i += 3) {
      const r = Math.hypot(p.getX(i), p.getZ(i));
      const skirt = Math.min(p.getY(i), p.getY(i + 1), p.getY(i + 2)) < 0.05 && r > 10.3;
      const c = skirt ? dark : r < R0 - 0.1 ? white : pal[Math.floor(rng() * pal.length)];
      for (let k = 0; k < 3; k++) { col[(i + k) * 3] = c.r; col[(i + k) * 3 + 1] = c.g; col[(i + k) * 3 + 2] = c.b; }
    }
    g2.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g2.computeVertexNormals();
    const mesh = new THREE.Mesh(g2, M.flat);
    mesh.castShadow = mesh.receiveShadow = true;
    object.add(mesh);
  }

  /* -------------------------------------------------- the white city -- */
  const WHITE = '#e9e8e3', WHITE2 = '#e2e5e8', PAVE = '#dfe3e6';
  b.cyl(R0 - 0.05, R0 - 0.05, 0.13, { seg: 64, color: PAVE, mat: M.smooth });
  const S = 1.75; // block pitch
  const blocks = [];
  for (let i = -3; i <= 3; i++) {
    for (let j = -3; j <= 3; j++) {
      const x = i * S, z = j * S;
      if (Math.hypot(Math.abs(x) + 0.7, Math.abs(z) + 0.7) > R0 - 0.4) continue;
      blocks.push([x, z]);
    }
  }
  const bags = []; // [x,y,z,scale,colorIdx]
  const BW = S - 0.55;
  for (const [x, z] of blocks) {
    // a kerb and a lawn
    b.box(BW + 0.12, 0.05, BW + 0.12, { x, y: 0.13, z, color: '#ffffff', mat: M.smooth });
    if (x === 0 && z === 0) {
      // the square: a fountain in pure white
      b.box(BW, 0.04, BW, { x, y: 0.18, z, color: '#8fbf6a' });
      b.cyl(0.42, 0.46, 0.18, { x, y: 0.18, z, seg: 24, color: WHITE, mat: M.smooth });
      b.cyl(0.36, 0.36, 0.02, { x, y: 0.35, z, seg: 24, color: '#7fc4e8', mat: M.water });
      b.cyl(0.04, 0.06, 0.5, { x, y: 0.2, z, color: WHITE, mat: M.smooth });
      b.sphere(0.07, { x, y: 0.72, z, color: '#bfe6ff', mat: M.glow, glow: 1.4 });
      for (const [dx, dz] of [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]]) tree(b, { x: x + dx, y: 0.18, z: z + dz, h: 0.7, kind: 'round', color: '#7fae5c', r: rng });
      continue;
    }
    // one or two gleaming houses per block, set on a trim lawn
    b.box(BW, 0.03, BW, { x, y: 0.18, z, color: '#93c26e' });
    const two = rng.chance(0.5);
    const parts = two ? [[-BW / 4, 0, BW / 2 - 0.12, BW - 0.25], [BW / 4, 0, BW / 2 - 0.12, BW - 0.25]] : [[0, 0, BW - 0.25, BW - 0.25]];
    for (const [ox, oz, w, d] of parts) {
      const h = rng.range(0.7, 1.9) * (1 - Math.hypot(x, z) / 14);
      b.box(w, h, d, { x: x + ox, y: 0.21, z: z + oz, color: rng.pick([WHITE, WHITE2, '#ffffff']), mat: M.smooth });
      b.box(w + 0.06, 0.05, d + 0.06, { x: x + ox, y: 0.21 + h, z: z + oz, color: '#ffffff', mat: M.smooth });
      // ribbon windows of glass, a few lit
      const floors = Math.max(1, Math.floor(h / 0.42));
      for (let f = 0; f < floors; f++) {
        const yy = 0.21 + 0.2 + f * 0.42;
        const lit = rng.chance(0.45);
        for (const sgn of [-1, 1]) {
          b.quad(w * 0.8, 0.13, { x: x + ox, y: yy, z: z + oz + sgn * (d / 2 + 0.012), ry: sgn > 0 ? 0 : Math.PI, mat: lit ? M.glow : M.smooth, color: lit ? '#ffe9c4' : '#9fc3d8', glow: 1.3 });
          b.quad(d * 0.8, 0.13, { x: x + ox + sgn * (w / 2 + 0.012), y: yy, z: z + oz, ry: sgn * Math.PI / 2, mat: M.smooth, color: '#9fc3d8' });
        }
      }
    }
    // the bags of yesterday, lined up neatly along every kerb
    const n = 4;
    for (let k = 0; k < n; k++) {
      const u = -BW / 2 + 0.15 + (k / (n - 1)) * (BW - 0.3);
      for (const [px, pz] of [[x + u, z - BW / 2 - 0.12], [x + u, z + BW / 2 + 0.12], [x - BW / 2 - 0.12, z + u], [x + BW / 2 + 0.12, z + u]]) {
        if (rng.chance(0.25)) continue;
        bags.push([px, 0.13, pz, rng.range(0.8, 1.05), rng.int(0, 2)]);
      }
    }
  }
  // street lamps
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.2;
    const x = Math.cos(a) * (R0 - 0.35), z = Math.sin(a) * (R0 - 0.35);
    b.cyl(0.02, 0.025, 0.8, { x, y: 0.13, z, color: '#ffffff', mat: M.smooth, seg: 6 });
    b.sphere(0.05, { x, y: 0.95, z, mat: M.glow, color: '#fff4dc', glow: 2 });
  }
  // the ring road where the trucks run, at the foot of the dump
  b.ring(R0 - 0.05, R0 + 0.55, { y: 0.14, seg: 96, color: '#5d6168' });
  const dash = new Lines();
  for (let i = 0; i < 96; i += 2) {
    const a0 = (i / 96) * Math.PI * 2, a1 = ((i + 1) / 96) * Math.PI * 2, r = R0 + 0.25;
    dash.seg([Math.cos(a0) * r, 0.15, Math.sin(a0) * r], [Math.cos(a1) * r, 0.15, Math.sin(a1) * r], '#f0f0f0', 0.9);
  }
  object.add(dash.build());

  object.add(b.build());

  /* ------------------------------------------------------- the refuse -- */
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), pv = new THREE.Vector3(), sv = new THREE.Vector3();
  const col = new THREE.Color();
  const onSlope = (n, fn) => {
    const out = [];
    for (let i = 0; i < n; i++) {
      const r = Math.sqrt(rng.range((R0 + 0.35) ** 2, 10.25 ** 2));
      const a = rng.range(0, Math.PI * 2);
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      out.push([x, H(x, z), z]);
    }
    return out;
  };
  const inst = (geo, mat, list, colors, scaleFn, sink = 0) => {
    const im = new THREE.InstancedMesh(geo, mat, list.length);
    list.forEach((p, i) => {
      e.set(rng.range(0, 6.3), rng.range(0, 6.3), rng.range(0, 6.3));
      q.setFromEuler(e);
      const s = scaleFn();
      sv.set(s, s * rng.range(0.8, 1.2), s);
      pv.set(p[0], p[1] - sink * s, p[2]);
      m4.compose(pv, q, sv);
      im.setMatrixAt(i, m4);
      col.set(rng.pick(colors));
      im.setColorAt(i, col);
    });
    im.castShadow = true; im.receiveShadow = true;
    object.add(im);
    return im;
  };
  const shiny = new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.0 });
  const tinMat = new THREE.MeshStandardMaterial({ roughness: 0.3, metalness: 0.5 });
  // bags: lumpy icosahedra
  const bagGeo = new THREE.IcosahedronGeometry(0.2, 1);
  const lumpGeo = new THREE.IcosahedronGeometry(0.2, 0);
  for (const gg of [bagGeo, lumpGeo]) {
    const p = gg.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i);
      const k = y > 0.12 ? 0.55 : 1 + 0.08 * Math.sin(i * 1.7);
      p.setXYZ(i, p.getX(i) * k, y * 1.1, p.getZ(i) * k);
    }
    gg.computeVertexNormals();
  }
  const BAGC = ['#2b2b30', '#3c4a6b', '#4f7a4a', '#d9d9d2', '#2f5f8a', '#7a2f3a', '#c9a227', '#1f1f24', '#5b8fb3', '#e06a3a', '#2b2b30', '#3a3a40', '#566070', '#8d8a80'];
  inst(lumpGeo, shiny, onSlope(1400), BAGC, () => rng.range(0.6, 1.25), 0.08);
  inst(new THREE.IcosahedronGeometry(0.13, 0), shiny, onSlope(1250), BAGC, () => rng.range(0.6, 1.1), 0.04); // small rubbish
  inst(new THREE.CylinderGeometry(0.06, 0.06, 0.17, 8), tinMat, onSlope(500), ['#c0c6cc', '#d94f4f', '#e8c64a', '#3f8fd0', '#9aa3ab'], () => rng.range(0.8, 1.4));
  // bottles
  const bottle = new THREE.LatheGeometry([[0.0, -0.13], [0.05, -0.13], [0.05, 0.04], [0.02, 0.09], [0.02, 0.14], [0.0, 0.14]].map(([r, y]) => new THREE.Vector2(r, y)), 6);
  inst(bottle, new THREE.MeshPhysicalMaterial({ roughness: 0.1, transmission: 0, transparent: true, opacity: 0.85 }), onSlope(350), ['#3f8a4f', '#8a5a2a', '#cfe8e0', '#5fa8c8'], () => rng.range(0.9, 1.4));
  // tyres
  inst(new THREE.TorusGeometry(0.17, 0.07, 5, 10), new THREE.MeshStandardMaterial({ roughness: 0.9 }), onSlope(130), ['#202024', '#2a2a2e'], () => rng.range(0.9, 1.3));
  // appliances: fridges, washing machines, old TVs — white boxes poking out of the slopes
  inst(new THREE.BoxGeometry(0.32, 0.5, 0.3), shiny, onSlope(120), ['#efefe8', '#e3e1d6', '#d8dce0', '#c7c2b6', '#9db6c4'], () => rng.range(0.8, 1.5), 0.08);
  // mattresses and cardboard
  inst(new THREE.BoxGeometry(0.6, 0.06, 0.38), new THREE.MeshStandardMaterial({ roughness: 1 }), onSlope(160), ['#c9a777', '#b08d5c', '#e6d9c2', '#d6b98b', '#8fa0b8'], () => rng.range(0.8, 1.4));

  // the neat bags on the pavements of the white city
  const neat = new THREE.InstancedMesh(bagGeo, shiny, bags.length);
  const NEAT = ['#2b2b30', '#dfe7ee', '#3c4a6b'];
  bags.forEach((p, i) => {
    q.setFromEuler(e.set(0, rng.range(0, 6.3), 0));
    sv.setScalar(p[3] * 0.45);
    pv.set(p[0], p[1] + 0.07, p[2]);
    m4.compose(pv, q, sv);
    neat.setMatrixAt(i, m4);
    neat.setColorAt(i, col.set(NEAT[p[4]]));
  });
  neat.castShadow = true;
  object.add(neat);

  /* -------------------------------------------------------- trucks -- */
  const trucks = [];
  for (let i = 0; i < 3; i++) {
    const tb = new Builder();
    tb.box(0.32, 0.26, 0.26, { x: 0.36, y: 0.08, color: '#ffffff', mat: M.smooth }); // cab
    tb.quad(0.2, 0.1, { x: 0.52 + 0.001, y: 0.27, ry: Math.PI / 2, color: '#334455', mat: M.smooth });
    tb.box(0.62, 0.36, 0.3, { x: -0.12, y: 0.08, color: i === 1 ? accent : '#4f8a4f', mat: M.smooth }); // compactor body
    tb.box(0.1, 0.32, 0.3, { x: -0.47, y: 0.1, color: '#d9d9d2' });
    for (const [wx, wz] of [[0.36, 0.14], [0.36, -0.14], [-0.2, 0.14], [-0.2, -0.14], [-0.34, 0.14], [-0.34, -0.14]]) tb.cyl(0.07, 0.07, 0.05, { x: wx, y: 0.07, z: wz, rx: Math.PI / 2, color: '#1b1b1f', seg: 10 });
    tb.sphere(0.03, { x: 0.53, y: 0.14, z: 0.09, mat: M.glow, color: '#fff2c8', glow: 2.5 });
    tb.sphere(0.03, { x: 0.53, y: 0.14, z: -0.09, mat: M.glow, color: '#fff2c8', glow: 2.5 });
    tb.sphere(0.035, { x: 0.3, y: 0.38, mat: M.glow, color: '#ffae3a', glow: 2.5 }); // beacon
    const g = tb.build();
    g.position.y = 0.14;
    object.add(g);
    trucks.push({ g, ph: (i / 3) * Math.PI * 2 });
  }

  /* ------------------------------------------------- the landslide -- */
  // At one point on the inner slope, refuse keeps tumbling down onto the ring road.
  const SL = 40;
  const slA = 2.35; // angle of the slide (visible from the default view)
  const slideItems = [];
  const slGeo = new THREE.IcosahedronGeometry(0.11, 0);
  const slide = new THREE.InstancedMesh(slGeo, shiny, SL);
  for (let i = 0; i < SL; i++) {
    slideItems.push({ off: rng.range(0, 1), da: rng.range(-0.09, 0.09), s: rng.range(0.6, 1.3), spin: rng.range(2, 6) });
    slide.setColorAt(i, col.set(rng.pick(BAGC.concat(['#c0c6cc', '#efefe8']))));
  }
  slide.castShadow = true;
  object.add(slide);
  // a scar on the slope: lighter fresh refuse
  for (let k = 0; k < 14; k++) {
    const r = rng.range(R0 + 0.2, 8.4), a = slA + rng.range(-0.1, 0.1);
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    b.sphere(rng.range(0.12, 0.25), { x, y: H(x, z), z, color: rng.pick(BAGC), mat: M.smooth, seg: 6 });
  }
  object.add(b.build());

  function update(t) {
    for (const tr of trucks) {
      const a = tr.ph + t * 0.09;
      const r = R0 + 0.25 + 0.12; // drive on the right
      tr.g.position.x = Math.cos(a) * r;
      tr.g.position.z = Math.sin(a) * r;
      tr.g.rotation.y = -a - Math.PI / 2;
    }
    for (let i = 0; i < SL; i++) {
      const it = slideItems[i];
      // each item takes ~7 s to tumble from high on the ridge to the road, accelerating
      const u = (t / 7 + it.off) % 1;
      const k = u * u;
      const r = 8.2 - k * (8.2 - (R0 + 0.15));
      const a = slA + it.da * (1 + k);
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      const bounce = Math.abs(Math.sin(u * 18 + i)) * 0.08 * (1 - k);
      pv.set(x, H(x, z) + 0.06 + bounce, z);
      q.setFromEuler(e.set(t * it.spin, i, t * it.spin * 0.6));
      const fade = u > 0.92 ? (1 - u) / 0.08 : u < 0.05 ? u / 0.05 : 1;
      sv.setScalar(it.s * fade + 0.001);
      m4.compose(pv, q, sv);
      slide.setMatrixAt(i, m4);
    }
    slide.instanceMatrix.needsUpdate = true;
  }
  update(0);
  return { object, update };
}
