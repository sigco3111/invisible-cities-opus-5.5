// AGLAURA — the city that is spoken of and the city that exists.
// A small, honest, slightly shabby real town sits in the middle of the plinth.
// Around and above it hovers the Aglaura of everyone's words: a vast golden
// city drawn in lines of light and glass, fed by the murmur rising from the
// little square. Now and then a rare slant of light sweeps across the real town
// and something splendid flashes in it — and for that moment the phantom goes quiet.
import { THREE, Builder, M, C, house, tower, tree, scatter, Lines } from '../kit.js';
import { figure, phantomMat, edgesOf, sstep } from './_d_kit.js';

export default function build({ rng, accent }) {
  const b = new Builder();
  const object = new THREE.Group();

  /* ---------------- ground ---------------- */
  b.cyl(10.4, 10.4, 0.06, { color: '#9c9872', seg: 64 });
  // worn meadow patches & dirt paths
  for (let i = 0; i < 26; i++) {
    const [x, z] = rng.inDisc(10, 5.8);
    b.cyl(rng.range(0.5, 1.4), rng.range(0.6, 1.5), 0.03, { x, y: 0.05, z, color: rng.pick(['#a7a57a', '#c2b98f', '#9fa074']), seg: 9 });
  }
  // the town's ground: trampled earth
  b.cyl(5.6, 5.8, 0.07, { y: 0.02, color: '#b5a07c', seg: 40 });
  // four dusty roads leaving the town (to nowhere grand)
  for (let k = 0; k < 4; k++) {
    const a = k * Math.PI / 2 + 0.35;
    b.box(0.7, 0.025, 4.8, { x: Math.cos(a) * 7.8, y: 0.06, z: Math.sin(a) * 7.8, ry: Math.PI / 2 - a, color: '#cdb994' });
  }

  /* ---------------- the real Aglaura ---------------- */
  // little square with a well, a bench, a few gossips
  b.cyl(1.25, 1.25, 0.04, { y: 0.09, color: '#d9c7a3', seg: 24 });
  b.cyl(0.24, 0.26, 0.28, { y: 0.1, color: C.ash, seg: 12 });
  b.beam([-0.22, 0.4, 0], [-0.22, 0.75, 0], 0.04, { color: C.darkwood });
  b.beam([0.22, 0.4, 0], [0.22, 0.75, 0], 0.04, { color: C.darkwood });
  b.beam([-0.26, 0.75, 0], [0.26, 0.75, 0], 0.04, { color: C.darkwood });
  b.box(0.36, 0.06, 0.11, { y: 0.78, color: C.terracotta, mat: M.flat, rx: 0.0 });
  const gossip = [[0.75, 0.3], [0.6, 0.62], [-0.7, 0.45], [-0.55, -0.7], [0.15, -0.85], [0.85, -0.35]];
  const robes = [C.terracotta, '#6f7f9a', '#8b6a4a', '#9c8d6c', '#7a5560', '#5f7258'];
  gossip.forEach(([x, z], i) => {
    const ry = Math.atan2(-x, -z) + rng.range(-0.4, 0.4);
    figure(b, {
      x, y: 0.1, z, ry, robe: robes[i], arms: [rng.pick(['down', 'hip', 'chin']), rng.pick(['out', 'fwd', 'down', 'wave'])],
      hat: rng.pick([null, 'cap', 'veil', 'brim']), hatColor: rng.pick([C.ivory, C.darkwood, '#3b4048']),
    });
  });
  // bench
  b.box(0.6, 0.05, 0.16, { x: -0.9, y: 0.22, z: -0.2, ry: 1.2, color: C.wood, mat: M.wood });

  // the parish church: modest, a bit lopsided, a small gilded dome cupola that nobody mentions
  const churchX = -2.6, churchZ = -1.9;
  b.push({ x: churchX, z: churchZ, ry: 0.5 });
  b.box(1.4, 1.5, 2.4, { y: 0.08, color: '#e2d3b4' });
  b.geo(new THREE.ExtrudeGeometry(new THREE.Shape([new THREE.Vector2(-0.78, 0), new THREE.Vector2(0.78, 0), new THREE.Vector2(0, 0.7)]), { depth: 2.55, bevelEnabled: false }).translate(0, 0, -1.275), { y: 1.58, color: C.brick, mat: M.flat });
  b.box(0.38, 0.62, 0.05, { y: 0.1, z: 1.21, color: C.darkwood, mat: M.wood });
  b.quad(0.3, 0.3, { y: 1.15, z: 1.215, color: '#6d7184', mat: M.smooth });
  // bell tower
  b.box(0.75, 2.8, 0.75, { x: 0.95, z: -0.6, y: 0.08, color: '#d8c6a3' });
  b.box(0.85, 0.1, 0.85, { x: 0.95, z: -0.6, y: 2.88, color: '#cdb994' });
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    b.box(dx ? 0.05 : 0.3, 0.4, dz ? 0.05 : 0.3, { x: 0.95 + dx * 0.36, z: -0.6 + dz * 0.36, y: 2.4, color: '#3a3330' });
  }
  b.pop();
  // splendid-but-unnamed: the cupola (separate, so the sweep can make it flash)
  const cup = new Builder();
  // place tower top in world coords via a small matrix
  const tm = new THREE.Matrix4().compose(new THREE.Vector3(churchX, 0, churchZ), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0.5, 0)), new THREE.Vector3(1, 1, 1));
  const topP = new THREE.Vector3(0.95, 2.98, -0.6).applyMatrix4(tm);
  cup.onion(0.38, 0.7, { x: topP.x, y: topP.y, z: topP.z, color: C.gold, mat: M.metal, seg: 16 });
  cup.cone(0.03, 0.4, { x: topP.x, y: topP.y + 0.75, z: topP.z, color: C.gold, mat: M.metal, seg: 4 });
  object.add(cup.build());
  const flashB = new Builder();
  flashB.onion(0.4, 0.74, { x: topP.x, y: topP.y - 0.01, z: topP.z, color: '#ffe2a0', mat: M.glow, glow: 1, seg: 16 });
  const flashMat = phantomMat(0);
  const flash = flashB.build({ shadows: false });
  flash.children.forEach((m) => { m.material = flashMat; });
  object.add(flash);

  // houses of the real town — small, a little crooked, patched
  const walls = ['#e6d6b6', '#dcc29a', '#e4c9a8', '#cfc0a3', '#e8dcc3', '#d8b28e', '#c9b796'];
  const roofs = [C.terracotta, C.brick, '#9a6b4f', '#b2774f', '#7d6a5a'];
  const spots = scatter(rng, {
    count: 30, rMin: 1.7, rMax: 5.2, size: [0.65, 1.15], gap: 0.22,
    inside: (x, z) => Math.hypot(x - churchX, z - churchZ) > 2.0,
  });
  for (const p of spots) {
    const h = rng.range(0.6, 1.25);
    house(b, {
      x: p.x, y: 0.08, z: p.z, w: p.w, d: p.d, h, ry: p.ry + rng.range(-0.08, 0.08), r: rng, lit: 0.25,
      roof: rng.chance(0.75) ? 'gable' : 'hip', wall: rng.pick(walls), roofColor: rng.pick(roofs),
    });
    // a patch on a wall, a chimney, a lean-to
    if (rng.chance(0.4)) b.box(0.12, 0.35, 0.12, { x: p.x + rng.range(-0.2, 0.2), y: h + 0.1, z: p.z + rng.range(-0.2, 0.2), color: '#8b6e5a' });
    if (rng.chance(0.35)) {
      b.push({ x: p.x, y: 0.08, z: p.z, ry: p.ry });
      b.box(0.32, h * 0.5, p.d * 0.7, { x: p.w / 2 + 0.16, color: rng.pick(['#9b7a5a', '#b39a78']), mat: M.wood });
      b.box(0.42, 0.04, p.d * 0.8, { x: p.w / 2 + 0.18, y: h * 0.5, rz: -0.3, color: '#7d6a5a', mat: M.flat });
      b.pop();
    }
  }
  // kitchen gardens and fences at the edge of town
  for (let i = 0; i < 9; i++) {
    const a = rng.range(0, Math.PI * 2), rr = rng.range(5.4, 6.3);
    const x = Math.cos(a) * rr, z = Math.sin(a) * rr;
    b.box(1.1, 0.05, 0.7, { x, y: 0.06, z, ry: -a, color: '#7b6040' });
    for (let k = 0; k < 4; k++) b.box(0.9, 0.06, 0.06, { x: x + Math.cos(a) * (k * 0.15 - 0.22), y: 0.11, z: z + Math.sin(a) * (k * 0.15 - 0.22), ry: -a + Math.PI / 2 + Math.PI / 2, color: '#6e8a4c' });
  }
  for (let i = 0; i < 16; i++) {
    const [x, z] = rng.inDisc(6.8, 4.8);
    tree(b, { x, y: 0.06, z, h: rng.range(0.8, 1.4), kind: rng.pick(['round', 'round', 'cypress']), color: rng.pick([C.leaf, '#7f9a5e', C.darkleaf]), r: rng });
  }
  // laundry line, a cart, a dog-sized haystack: modest things
  const L = new Lines();
  L.rope([1.9, 0.9, 2.6], [3.2, 0.9, 1.6], 0.12, '#e8e0cc', 8);
  object.add(L.build());
  for (let i = 0; i < 4; i++) {
    const t = (i + 0.5) / 4;
    b.quad(0.18, 0.22, { x: 1.9 + 1.3 * t, y: 0.72 - 0.1 * Math.sin(Math.PI * t), z: 2.6 - t, ry: -0.65, color: rng.pick(['#f0ead8', '#c7d2e0', '#e2b9a8']), mat: M.cloth });
  }
  b.cone(0.45, 0.6, { x: 4.5, y: 0.06, z: -3.6, color: '#d6b45e', seg: 9, mat: M.flat });
  // a market stall with a striped awning, a handcart, people going about
  b.push({ x: 1.5, y: 0.1, z: -0.9, ry: -0.4 });
  b.box(0.9, 0.35, 0.4, { color: C.wood, mat: M.wood });
  for (let k = 0; k < 4; k++) b.box(0.23, 0.02, 0.6, { x: -0.34 + k * 0.23, y: 0.75, z: 0.08, rx: 0.25, color: k % 2 ? C.ivory : accent, mat: M.cloth });
  b.rod([-0.44, 0, 0.35], [-0.44, 0.72, 0.35], 0.015, { color: C.darkwood });
  b.rod([0.44, 0, 0.35], [0.44, 0.72, 0.35], 0.015, { color: C.darkwood });
  for (let k = 0; k < 5; k++) b.sphere(0.06, { x: -0.3 + k * 0.15, y: 0.4, z: 0.05, color: rng.pick([C.ochre, '#b54a3a', '#8fae4a']), seg: 6 });
  figure(b, { z: -0.35, ry: 0, robe: '#5c6f86', hat: 'cap', hatColor: C.ivory, arms: ['fwd', 'down'] });
  b.pop();
  b.push({ x: -1.6, y: 0.1, z: 2.6, ry: 2.2 });
  b.box(0.5, 0.18, 0.32, { y: 0.14, color: C.wood, mat: M.wood });
  b.torus(0.12, 0.02, { x: -0.27, y: 0.12, ry: Math.PI / 2, color: C.darkwood, mat: M.wood });
  b.torus(0.12, 0.02, { x: 0.27, y: 0.12, ry: Math.PI / 2, color: C.darkwood, mat: M.wood });
  figure(b, { z: 0.45, ry: Math.PI, robe: '#8a6a4a', arms: ['back', 'back'], lean: 0.25 });
  b.pop();
  for (let i = 0; i < 7; i++) {
    const a = rng.range(0, Math.PI * 2), rr = rng.range(1.4, 4.6);
    figure(b, { x: Math.cos(a) * rr, y: 0.1, z: Math.sin(a) * rr, ry: rng.range(0, 6), robe: rng.pick(robes), hat: rng.pick([null, 'cap', 'veil']), hatColor: C.ivory });
  }

  object.add(b.build());

  /* ---------------- the Aglaura that is spoken of ---------------- */
  const P = new Builder();
  const pm = phantomMat(0.035);
  const gold = '#ffcf7a';
  const pale = '#fff0c8';
  // grand ring of walls & gates far beyond the real town
  const R = 9.6;
  for (let i = 0; i < 16; i++) {
    const a0 = (i / 16) * Math.PI * 2, a1 = ((i + 1) / 16) * Math.PI * 2, am = (a0 + a1) / 2;
    if (i % 4 === 1) continue; // gates
    const len = 2 * R * Math.sin(Math.PI / 16);
    P.box(len, 1.8, 0.35, { x: Math.cos(am) * R, z: Math.sin(am) * R, ry: -am + Math.PI / 2, color: gold, mat: pm });
  }
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const tall = i % 2 === 0;
    const h = tall ? 7 + rng.range(0, 4) : 3.2;
    P.prism(0.45, 0.55, h, 8, { x: Math.cos(a) * R, z: Math.sin(a) * R, color: gold, mat: pm });
    if (tall) P.cone(0.5, 2.6, { x: Math.cos(a) * R, y: h, z: Math.sin(a) * R, color: pale, mat: pm, seg: 8 });
    else P.dome(0.52, { x: Math.cos(a) * R, y: h, z: Math.sin(a) * R, color: pale, mat: pm, seg: 10, hseg: 5 });
  }
  // colonnaded processional ring, raised on air above the real roofs
  const ringY = 3.2;
  P.geo(new THREE.RingGeometry(6.4, 7.6, 48, 1).rotateX(-Math.PI / 2), { y: ringY, color: gold, mat: pm });
  P.cyl(7.6, 7.6, 0.18, { y: ringY - 0.18, color: gold, mat: pm, seg: 48, open: true });
  P.cyl(7.25, 7.25, 0.22, { y: ringY + 1.9, color: gold, mat: pm, seg: 48, open: true });
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2;
    P.cyl(0.07, 0.09, 1.72, { x: Math.cos(a) * 7.1, y: ringY + 0.18, z: Math.sin(a) * 7.1, color: pale, mat: pm, seg: 6 });
  }
  // palaces standing on the ring
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.26;
    const x = Math.cos(a) * 6.6, z = Math.sin(a) * 6.6;
    P.push({ x, y: ringY + 2.1, z, ry: -a + Math.PI / 2 });
    P.box(2.2, 2.2, 1.1, { color: gold, mat: pm });
    P.geo(new THREE.ExtrudeGeometry(new THREE.Shape([new THREE.Vector2(-1.2, 0), new THREE.Vector2(1.2, 0), new THREE.Vector2(0, 0.6)]), { depth: 1.2, bevelEnabled: false }).translate(0, 0, -0.6), { y: 2.2, color: pale, mat: pm });
    for (let k = -2; k <= 2; k++) P.cyl(0.05, 0.05, 1.6, { x: k * 0.45, y: 0.1, z: 0.62, color: pale, mat: pm, seg: 6 });
    P.pop();
  }
  // the great dome hovering over the town, with a drum, lantern and spire
  const domeY = 7.6;
  P.cyl(3.7, 3.9, 0.3, { y: domeY - 0.3, color: gold, mat: pm, seg: 40 });
  P.cyl(3.4, 3.4, 1.4, { y: domeY, color: gold, mat: pm, seg: 40, open: true });
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    P.cyl(0.08, 0.08, 1.4, { x: Math.cos(a) * 3.5, y: domeY, z: Math.sin(a) * 3.5, color: pale, mat: pm, seg: 5 });
  }
  P.dome(3.4, { y: domeY + 1.4, color: gold, mat: pm, seg: 32, hseg: 10 });
  P.cyl(0.55, 0.6, 1.0, { y: domeY + 4.75, color: pale, mat: pm, seg: 10 });
  P.cone(0.45, 3.2, { y: domeY + 5.75, color: pale, mat: pm, seg: 10 });
  // inverted cone underside (like a hanging chandelier of words)
  const PL = new Builder(); // drawn only as lines
  PL.dome(3.9, { y: domeY - 0.3, rx: Math.PI, sy: 0.55, color: gold, seg: 24, hseg: 5 });
  PL.cone(0.25, 1.6, { y: domeY - 2.2, color: gold, seg: 8 });
  // four campanili leaning in like tall talkers
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const x = Math.cos(a) * 4.8, z = Math.sin(a) * 4.8;
    P.box(0.9, 8.5, 0.9, { x, y: 2.6, z, color: gold, mat: pm });
    P.box(1.1, 0.2, 1.1, { x, y: 11.1, z, color: pale, mat: pm });
    P.prism(0, 0.7, 2.4, 4, { x, y: 11.3, z, ry: Math.PI / 4, color: pale, mat: pm });
    // bridges from campanili to the dome drum
    P.beam([x * 0.93, 7.0, z * 0.93], [x * 0.75, 7.4, z * 0.75], 0.25, { color: gold, mat: pm });
  }
  const phantom = P.build({ shadows: false });
  const lines = edgesOf(phantom, gold, 1.0, 0.5, 20);
  const lines2 = edgesOf(PL.build({ shadows: false }), gold, 1.0, 0.5, 1);
  lines2.material = lines.material;
  const phantomG = new THREE.Group();
  phantomG.add(phantom, lines, lines2);
  object.add(phantomG);

  /* ---------------- murmur: motes of talk rising from the square ---------------- */
  const NM = 70;
  const moteGeo = new THREE.SphereGeometry(0.045, 6, 4);
  const moteMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(gold).multiplyScalar(2.2), toneMapped: false, transparent: true, opacity: 0.9, depthWrite: false });
  const motes = new THREE.InstancedMesh(moteGeo, moteMat, NM);
  const moteSeed = [];
  for (let i = 0; i < NM; i++) moteSeed.push([rng(), rng.range(0, Math.PI * 2), rng.range(0.5, 1.4)]);
  object.add(motes);

  /* ---------------- the rare slant of light ---------------- */
  const sheetG = new THREE.PlaneGeometry(1, 1, 1, 8);
  {
    const col = new Float32Array(sheetG.attributes.position.count * 3);
    for (let i = 0; i < sheetG.attributes.position.count; i++) {
      const yy = sheetG.attributes.position.getY(i) + 0.5; // 0..1
      const k = Math.pow(1 - yy, 1.6);
      col[i * 3] = 1.0 * k; col[i * 3 + 1] = 0.7 * k; col[i * 3 + 2] = 0.3 * k;
    }
    sheetG.setAttribute('color', new THREE.BufferAttribute(col, 3));
  }
  const sheetMat = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false });
  const sheet = new THREE.Mesh(sheetG, sheetMat);
  sheet.scale.set(11, 6, 1);
  sheet.rotation.y = Math.PI / 2 - 0.5;
  sheet.rotation.z = 0.0;
  object.add(sheet);
  const beam = new THREE.PointLight('#ffd89a', 0, 9, 1.6);
  object.add(beam);

  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const v = new THREE.Vector3();
  const sc = new THREE.Vector3();
  const PERIOD = 17;
  const dir = new THREE.Vector3(Math.cos(0.5), 0, -Math.sin(0.5)); // sweep direction
  return {
    object,
    update(t) {
      // sweep: crosses the town during [0, 4.5] of each period
      const ph = (t + 9) % PERIOD;
      const s = ph / 4.5;
      const active = s < 1;
      const pos = -8 + 16 * Math.min(1, s);
      sheet.position.set(dir.x * pos, 3.4, dir.z * pos);
      const env = active ? Math.sin(Math.PI * s) : 0;
      sheetMat.opacity = env * 0.2;
      beam.position.set(dir.x * pos, 2.6, dir.z * pos);
      beam.intensity = env * 26;
      // the cupola flashes as the light passes it
      const dCup = topP.x * dir.x + topP.z * dir.z;
      const near = active ? Math.exp(-((pos - dCup) ** 2) / 1.2) : 0;
      flashMat.opacity = near * 0.9;
      // the phantom hushes while the real thing shines; otherwise it breathes
      const hush = 1 - 0.75 * env;
      const breathe = 0.85 + 0.15 * Math.sin(t * 0.6);
      pm.opacity = 0.035 * hush * breathe;
      lines.material.opacity = 0.5 * hush * (0.8 + 0.2 * Math.sin(t * 0.6 + 1));
      phantomG.rotation.y = Math.sin(t * 0.05) * 0.04;
      // rumours rise from the square in a slow spiral into the dome
      for (let i = 0; i < NM; i++) {
        const [o, a0, sp] = moteSeed[i];
        const u = (o + t * 0.035 * sp) % 1;
        const rad = 0.4 + u * 3.0 * (0.6 + 0.4 * Math.sin(a0 * 3));
        const a = a0 + u * 5 + t * 0.1;
        v.set(Math.cos(a) * rad, 0.5 + u * 7.2, Math.sin(a) * rad);
        const k = Math.sin(Math.PI * u) * hush;
        sc.setScalar(Math.max(0.001, k));
        m4.compose(v, q, sc);
        motes.setMatrixAt(i, m4);
      }
      motes.instanceMatrix.needsUpdate = true;
    },
  };
}
