// Ersilia — a city of strings. Every relationship is a cord stretched between the corners
// of houses: white, black, grey, black-and-white. On one side the city still stands under
// its web; on the other the houses have been dismantled and only the poles and the strings
// remain, a ghost-web of relations. From the hill at the rim, refugees with their bundles
// look back — and on the hilltop they have already begun a new web, more regular.
import { THREE, Builder, M, C, Lines, person, tree } from '../kit.js';
import { glowParticles, _o, _col, smooth01 } from './_c_util.js';

const KINDS = ['white', 'black', 'grey', 'bw'];

export default function build({ rng, accent }) {
  const b = new Builder();
  const web = new Lines();
  const G = 0.1;

  // ---------------------------------------------------------------- the plain and the hill
  b.cyl(10.3, 10.4, G, { color: '#b8a582', seg: 64 });
  for (let i = 0; i < 30; i++) {
    const [x, z] = rng.inDisc(9.4);
    b.cyl(rng.range(0.4, 1.3), rng.range(0.4, 1.3), 0.01, { x, y: G, z, color: rng.pick(['#ad9a76', '#c2b08c', '#a99570', '#b6a07a']), seg: 10, sz: rng.range(0.5, 1) });
  }
  const HILL = { x: -5.9, z: -5.3, r: 4.4, h: 2.3 };
  const hillY = (x, z) => {
    const d = Math.hypot(x - HILL.x, z - HILL.z) / HILL.r;
    return d >= 1 ? G : G + HILL.h * Math.sqrt(1 - d * d) * (1 - 0.15 * d);
  };
  {
    const g = new THREE.SphereGeometry(1, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i), y = p.getY(i);
      const n = 1 + 0.05 * Math.sin(x * 9 + z * 5) + 0.04 * Math.cos(z * 11);
      let wx = HILL.x + x * n * HILL.r, wz = HILL.z + z * n * HILL.r;
      const wr = Math.hypot(wx, wz);
      if (wr > 10.3) { wx *= 10.3 / wr; wz *= 10.3 / wr; }
      p.setXYZ(i, wx, G - 0.02 + y * (1 - 0.15 * Math.hypot(x, z)) * HILL.h, wz);
    }
    g.computeVertexNormals();
    b.geo(g, { color: '#9d9068', mat: M.flat });
    // the cut face of the hill at the plinth's rim
    {
      const pts = [];
      for (let i = 0; i <= 40; i++) {
        const a = 3.5 + i / 40 * 1.6;
        const x = Math.cos(a) * 10.29, z = Math.sin(a) * 10.29;
        pts.push([x, z]);
      }
      const pos = [];
      for (let i = 0; i < pts.length - 1; i++) {
        const [x0, z0] = pts[i], [x1, z1] = pts[i + 1];
        const h0 = hillY(x0, z0), h1 = hillY(x1, z1);
        if (h0 <= G + 0.01 && h1 <= G + 0.01) continue;
        pos.push(x0, 0, z0, x1, 0, z1, x0, h0, z0, x1, 0, z1, x1, h1, z1, x0, h0, z0);
      }
      const cg = new THREE.BufferGeometry();
      cg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      cg.computeVertexNormals();
      b.geo(cg, { color: '#7d6a50', mat: M.cloth });
    }
  }
  // the hill must stay inside the plinth: clip with a wall of rock at the rim
  for (let i = 0; i < 12; i++) {
    const a = rng.range(3.4, 4.4);
    const r = rng.range(8.6, 9.8);
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    b.geo(new THREE.IcosahedronGeometry(rng.range(0.3, 0.6), 0), { x, y: hillY(x, z) - 0.1, z, color: '#94846a', mat: M.flat, ry: rng() * 6 });
  }

  // ---------------------------------------------------------------- nodes of the web
  const nodes = []; // {p:[x,y,z], zone}
  const addNode = (x, y, z, zone) => { nodes.push({ p: [x, y, z], zone }); return nodes.length - 1; };
  // a line dividing the living city (east) from the abandoned web (west)
  const living = (x, z) => x * 0.8 + z * 0.6 > 1.6;
  const onHill = (x, z) => Math.hypot(x - HILL.x, z - HILL.z) < HILL.r + 0.6;

  const lots = [];
  for (let t = 0; t < 3000 && lots.length < 46; t++) {
    const [x, z] = rng.inDisc(9.2);
    if (onHill(x, z)) continue;
    const w = rng.range(0.9, 1.4), d = rng.range(0.9, 1.3);
    if (lots.some((o) => Math.hypot(o.x - x, o.z - z) < (Math.max(w, d) + Math.max(o.w, o.d)) * 0.62 + 0.55)) continue;
    lots.push({ x, z, w, d, ry: rng.range(-0.3, 0.3) + (rng.chance(0.5) ? Math.PI / 2 : 0) });
  }
  const walls = ['#e6d7bd', '#dcc8a6', '#efe4cf', '#d8c0a0', '#e2cdb6'];
  for (const L of lots) {
    const live = living(L.x, L.z);
    const corners = [[-L.w / 2, -L.d / 2], [L.w / 2, -L.d / 2], [L.w / 2, L.d / 2], [-L.w / 2, L.d / 2]].map(([u, v]) => [
      L.x + u * Math.cos(L.ry) + v * Math.sin(L.ry), L.z - u * Math.sin(L.ry) + v * Math.cos(L.ry)]);
    if (live) {
      const h = rng.range(0.9, 1.7);
      b.push({ x: L.x, y: G, z: L.z, ry: L.ry });
      const wall = rng.pick(walls);
      b.box(L.w, h, L.d, { color: wall });
      b.box(L.w + 0.06, 0.08, L.d + 0.06, { y: h, color: '#cdb994' });
      if (rng.chance(0.45)) {
        // an upper room set back on the roof terrace
        const w2 = L.w * 0.5, d2 = L.d * 0.55;
        b.box(w2, 0.55, d2, { x: -L.w * 0.2, y: h, z: -L.d * 0.18, color: wall });
        b.box(w2 + 0.05, 0.05, d2 + 0.05, { x: -L.w * 0.2, y: h + 0.55, z: -L.d * 0.18, color: '#cdb994' });
      } else if (rng.chance(0.6)) {
        // a cloth awning on poles
        for (const [px, pz] of [[0.1, 0.05], [0.4, 0.05], [0.1, 0.4], [0.4, 0.4]]) b.cyl(0.012, 0.012, 0.35, { x: px * L.w, y: h, z: pz * L.d, color: C.darkwood, seg: 4 });
        b.box(L.w * 0.36, 0.015, L.d * 0.4, { x: 0.25 * L.w, y: h + 0.35, z: 0.22 * L.d, color: rng.pick(['#b0563d', '#d9c8a4', '#5e6d84', accent]), mat: M.cloth });
      }
      // outside stair to the roof
      if (rng.chance(0.5)) for (let k = 0; k < 5; k++) b.box(0.18, 0.06 + k * (h / 5), 0.12, { x: L.w / 2 + 0.09, z: -L.d / 2 + 0.1 + k * 0.13, color: wall });
      // door & small windows
      b.box(0.2, 0.42, 0.02, { z: L.d / 2 + 0.005, color: C.darkwood });
      for (const u of [-L.w / 3, L.w / 3]) {
        const lit = rng.chance(0.4);
        b.quad(0.14, 0.16, { x: u, y: h * 0.62, z: L.d / 2 + 0.012, mat: lit ? M.glow : M.smooth, color: lit ? C.lamp : '#3b3330', glow: 1.8 });
      }
      b.pop();
      // the corners carry little posts with rings where strings are tied
      for (const [cx, cz] of corners) {
        b.cyl(0.025, 0.025, 0.35, { x: cx, y: G + h, z: cz, color: C.darkwood, seg: 5 });
        addNode(cx, G + h + 0.33, cz, 'live');
        if (rng.chance(0.5)) addNode(cx, G + h * 0.6, cz, 'live');
      }
    } else {
      // dismantled: a faint foundation, and the corner poles left standing
      const fnd = '#a89474';
      b.push({ x: L.x, y: G, z: L.z, ry: L.ry });
      b.box(L.w, 0.05, 0.08, { z: -L.d / 2, color: fnd });
      b.box(L.w, 0.05, 0.08, { z: L.d / 2, color: fnd });
      b.box(0.08, 0.05, L.d, { x: -L.w / 2, color: fnd });
      b.box(0.08, 0.05, L.d, { x: L.w / 2, color: fnd });
      b.pop();
      for (const [cx, cz] of corners) {
        if (rng.chance(0.15)) continue;
        const h = rng.range(1.4, 3.0);
        b.cyl(0.022, 0.032, h, { x: cx, y: G, z: cz, color: rng.pick(['#5a4636', '#6e5640', '#4b3a2e']), seg: 6 });
        addNode(cx, G + h - 0.04, cz, 'ghost');
        addNode(cx, G + h * rng.range(0.35, 0.7), cz, 'ghost');
      }
    }
  }
  // free-standing tall poles in the abandoned web
  for (let i = 0; i < 26; i++) {
    const [x, z] = rng.inDisc(9.3);
    if (living(x, z) || onHill(x, z)) continue;
    const h = rng.range(2.6, 4.6);
    b.cyl(0.025, 0.04, h, { x, y: G, z, color: '#4b3a2e', seg: 6 });
    b.box(0.3, 0.04, 0.04, { x, y: G + h - 0.25, z, ry: rng() * 3, color: '#4b3a2e' });
    addNode(x, G + h - 0.02, z, 'ghost');
    addNode(x, G + h * 0.55, z, 'ghost');
  }
  // a few poles among the houses
  for (let i = 0; i < 10; i++) {
    const [x, z] = rng.inDisc(9.0);
    if (!living(x, z)) continue;
    if (lots.some((o) => Math.hypot(o.x - x, o.z - z) < 0.9)) continue;
    const h = rng.range(2.0, 2.8);
    b.cyl(0.03, 0.04, h, { x, y: G, z, color: '#5a4636', seg: 6 });
    addNode(x, G + h, z, 'live');
  }

  // ---------------------------------------------------------------- the strings
  const colorOf = { white: ['#f4efe6', 1.25], black: ['#18181c', 1], grey: ['#8d8a86', 1.05] };
  const string = (A, B, kind, sag) => {
    const n = 10;
    let prev = A;
    for (let i = 1; i <= n; i++) {
      const t = i / n;
      const q = [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t - sag * 4 * t * (1 - t), A[2] + (B[2] - A[2]) * t];
      let c, k;
      if (kind === 'bw') { [c, k] = i % 2 ? colorOf.white : colorOf.black; }
      else [c, k] = colorOf[kind];
      web.seg(prev, q, c, k);
      prev = q;
    }
  };
  const seen = new Set();
  for (let i = 0; i < nodes.length; i++) {
    const A = nodes[i];
    const cand = [];
    for (let j = 0; j < nodes.length; j++) {
      if (j === i) continue;
      const B = nodes[j];
      const d = Math.hypot(A.p[0] - B.p[0], A.p[2] - B.p[2]);
      if (d < 0.6 || d > (A.zone === 'ghost' ? 4.2 : 3.4)) continue;
      cand.push([d + rng.range(0, 1.5), j]);
    }
    cand.sort((a, b2) => a[0] - b2[0]);
    const k = A.zone === 'ghost' ? 7 : 3;
    for (let c = 0; c < Math.min(k, cand.length); c++) {
      const j = cand[c][1];
      const key = i < j ? i * 10000 + j : j * 10000 + i;
      if (seen.has(key)) continue;
      // living strings must stay above head height
      if (A.zone === 'live' && Math.min(A.p[1], nodes[j].p[1]) < 0.75) continue;
      seen.add(key);
      const B = nodes[j];
      const d = Math.hypot(A.p[0] - B.p[0], A.p[2] - B.p[2]);
      string(A.p, B.p, rng.pick(KINDS), d * 0.025);
    }
  }

  // people still living below their strings, ducking, carrying things
  for (let i = 0; i < 16; i++) {
    const [x, z] = rng.inDisc(9);
    if (!living(x, z) || lots.some((o) => Math.hypot(o.x - x, o.z - z) < 0.9)) continue;
    person(b, { x, y: G, z, color: rng.pick([C.slate, C.terracotta, '#6b5a4a', C.plaster]) });
  }

  // ---------------------------------------------------------------- refugees on the hill
  const camp = [];
  for (let i = 0; i < 18; i++) {
    const a = rng.range(0.2, 1.4) + Math.PI * 0.1; // the side of the hill facing the city
    const r = rng.range(1.4, 3.6);
    const x = HILL.x + Math.cos(a) * r, z = HILL.z + Math.sin(a) * r;
    camp.push([x, z]);
  }
  const lookAt = Math.atan2(2 - HILL.x, 2 - HILL.z);
  camp.forEach(([x, z], i) => {
    const y = hillY(x, z) - 0.03;
    if (i % 3 === 0) {
      // a bundle tied in cloth
      b.sphere(0.13, { x: x + 0.15, y: y + 0.1, z, sy: 0.8, color: rng.pick(['#b0563d', '#d9c8a4', '#5e6d84', '#8a6a4a']), mat: M.cloth, seg: 7 });
      b.sphere(0.04, { x: x + 0.15, y: y + 0.22, z, color: '#6a4a3a', seg: 5 });
    }
    if (i % 5 === 1) {
      // a stack of rolled strings on a spool
      b.cyl(0.1, 0.1, 0.18, { x: x - 0.15, y, z, rx: Math.PI / 2, color: '#e9e2d4', seg: 10 });
    }
    person(b, { x, y, z, h: 0.34, color: rng.pick([C.slate, C.terracotta, '#6b5a4a', '#7a4a4a', C.plaster]), ry: lookAt });
    // a staff or a bundle on the back
    if (i % 2) b.sphere(0.08, { x: x - Math.sin(lookAt) * 0.08, y: y + 0.24, z: z - Math.cos(lookAt) * 0.08, color: '#a8875e', mat: M.cloth, seg: 6 });
  });
  // a handcart and a tent
  {
    const x = HILL.x + 1.7, z = HILL.z + 2.2, y = hillY(x, z);
    b.push({ x, y, z, ry: 0.6 });
    b.box(0.6, 0.06, 0.4, { y: 0.2, color: C.wood, mat: M.wood });
    b.torus(0.17, 0.025, { x: 0.32, y: 0.17, ry: Math.PI / 2, color: C.darkwood, mat: M.wood });
    b.torus(0.17, 0.025, { x: -0.32, y: 0.17, ry: Math.PI / 2, color: C.darkwood, mat: M.wood });
    b.sphere(0.16, { y: 0.32, sy: 0.7, color: '#d9c8a4', mat: M.cloth, seg: 7 });
    b.sphere(0.12, { x: 0.18, y: 0.34, sy: 0.7, color: '#b0563d', mat: M.cloth, seg: 7 });
    b.rod([-0.3, 0.22, 0], [-0.75, 0.05, 0.1], 0.02, { color: C.darkwood });
    b.pop();
  }
  {
    const x = HILL.x + 0.6, z = HILL.z + 0.8, y = hillY(x, z) - 0.04;
    b.push({ x, y, z, ry: 0.3 });
    b.geo(new THREE.ConeGeometry(0.55, 0.7, 4, 1, true).rotateY(Math.PI / 4).translate(0, 0.35, 0), { color: '#d6c7a6', mat: M.cloth });
    b.pop();
  }
  // campfire
  const fx = HILL.x + 2.0, fz = HILL.z + 0.9, fy = hillY(fx, fz);
  for (let k = 0; k < 7; k++) b.sphere(0.05, { x: fx + Math.cos(k) * 0.16, y: fy, z: fz + Math.sin(k) * 0.16, color: C.ash, mat: M.flat, seg: 5 });
  b.cyl(0.11, 0.12, 0.03, { x: fx, y: fy, z: fz, mat: M.glow, color: '#ff7a2a', glow: 1.8 });

  // ---------------------------------------------------------------- a new Ersilia, more regular, on the hilltop
  const NC = [HILL.x - 0.9, HILL.z - 0.9];
  const ny = hillY(NC[0], NC[1]);
  const hex = [];
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2;
    const x = NC[0] + Math.cos(a) * 1.0, z = NC[1] + Math.sin(a) * 1.0, y = hillY(x, z);
    b.cyl(0.025, 0.03, 1.1, { x, y: y - 0.05, z, color: '#6e5640', seg: 6 });
    hex.push([x, y + 1.0, z], [x, y + 0.55, z]);
  }
  b.cyl(0.03, 0.035, 1.5, { x: NC[0], y: ny - 0.05, z: NC[1], color: '#6e5640', seg: 6 });
  const top = [NC[0], ny + 1.4, NC[1]];
  const neat = new Lines();
  for (let k = 0; k < 6; k++) {
    const A = hex[k * 2], B = hex[((k + 1) % 6) * 2];
    const A2 = hex[k * 2 + 1], B2 = hex[((k + 1) % 6) * 2 + 1];
    neat.seg(A, B, '#f4efe6', 1.3);
    neat.seg(A2, B2, '#18181c', 1);
    neat.seg(A, top, k % 2 ? '#8d8a86' : '#f4efe6', 1.2);
    neat.seg(A, B2, '#f4efe6', 1.1);
  }
  // a pennant of the accent colour, the sign of a city starting again
  b.box(0.22, 0.12, 0.01, { x: NC[0] + 0.11, y: ny + 1.3, z: NC[1], color: accent, mat: M.cloth });

  // a few dry trees around the plain
  for (let i = 0; i < 7; i++) {
    const [x, z] = rng.inDisc(9.8, 8.4);
    if (onHill(x, z)) continue;
    tree(b, { x, y: G, z, h: rng.range(1.0, 1.6), kind: 'bare', r: rng, trunk: '#5a4636' });
  }

  const object = new THREE.Group();
  object.add(b.build());
  const webMat = new THREE.LineBasicMaterial({ vertexColors: true, toneMapped: false, transparent: true, opacity: 0.85 });
  const webLines = web.build(webMat);
  object.add(webLines);
  object.add(neat.build(webMat));

  // ---------------------------------------------------------------- animated: a string being stretched, fire, motes
  const grow = new THREE.BufferGeometry();
  const gpos = new Float32Array(6);
  grow.setAttribute('position', new THREE.BufferAttribute(gpos, 3));
  grow.setAttribute('color', new THREE.BufferAttribute(new Float32Array([1.3, 1.25, 1.2, 1.3, 1.25, 1.2]), 3));
  const growLine = new THREE.LineSegments(grow, webMat);
  growLine.frustumCulled = false;
  object.add(growLine);
  // the person carrying the string from pole to pole
  const carrier = new THREE.Group();
  {
    const cb = new Builder();
    person(cb, { x: 0, y: 0, z: 0, h: 0.34, color: '#7a4a4a' });
    carrier.add(cb.build());
  }
  object.add(carrier);
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.32, 6).translate(0, 0.16, 0), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffa040').multiplyScalar(2.4), toneMapped: false }));
  flame.position.set(fx, fy + 0.02, fz);
  object.add(flame);

  const sparks = glowParticles(10, 0.03, '#ffffff', 0);
  for (let i = 0; i < 10; i++) sparks.setColorAt(i, _col.set('#ff9a40').multiplyScalar(2));
  object.add(sparks);

  const pairs = [[0, 2], [2, 4], [4, 8], [8, 6], [6, 10], [10, 0], [0, 6], [2, 8], [4, 10]];
  function update(t) {
    // gentle breathing of the old web
    webMat.opacity = 0.78 + 0.08 * Math.sin(t * 0.6);
    // a string slowly drawn across the new hexagon, again and again
    const cyc = Math.floor(t / 6), u = (t % 6) / 6;
    const [ia, ib] = pairs[cyc % pairs.length];
    const A = hex[ia], B = hex[ib];
    const s = smooth01(u / 0.8);
    gpos[0] = A[0]; gpos[1] = A[1] - 0.2; gpos[2] = A[2];
    const x = A[0] + (B[0] - A[0]) * s, z = A[2] + (B[2] - A[2]) * s;
    gpos[3] = x; gpos[4] = hillY(x, z) + 0.28; gpos[5] = z;
    if (u > 0.85) { gpos[3] = B[0]; gpos[4] = B[1] - 0.2; gpos[5] = B[2]; }
    grow.attributes.position.needsUpdate = true;
    carrier.position.set(x, hillY(x, z) - 0.03, z);
    carrier.rotation.y = Math.atan2(B[0] - A[0], B[2] - A[2]);
    carrier.visible = u < 0.85;
    flame.scale.set(1, 0.8 + 0.25 * Math.sin(t * 8) + 0.1 * Math.sin(t * 13), 1);
    for (let i = 0; i < 10; i++) {
      const v = ((t * 0.5 + i / 10) % 1);
      _o.position.set(fx + Math.sin(i * 2.3 + t) * 0.08 * v, fy + 0.2 + v * 1.0, fz + Math.cos(i * 1.7) * 0.08 * v);
      _o.scale.setScalar(1 - v);
      _o.updateMatrix();
      sparks.setMatrixAt(i, _o.matrix);
    }
    sparks.instanceMatrix.needsUpdate = true;
  }
  update(0);
  return { object, update };
}
