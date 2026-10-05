// Eudoxia — a shapeless hill-city of crooked lanes, stairs and dead ends, and,
// floating above it like a second sky, the carpet that holds its true form.
// Golden threads tie each place in the city to its motif in the carpet.
import { THREE, Builder, M, C, Lines, house, tower, tree } from '../kit.js';
import { terrainGeo, canvasTex } from './_e_util.js';

export default function build({ rng, accent }) {
  const b = new Builder();

  /* ---------------------------------------------------------- the hill -- */
  const peak = [1.2, -0.8];
  const H = (x, z) => {
    const r = Math.hypot(x, z);
    const d1 = (x - peak[0]) ** 2 + (z - peak[1]) ** 2;
    const d2 = (x + 4.2) ** 2 + (z - 3.5) ** 2;
    let h = 4.8 * Math.exp(-d1 / 20) + 1.5 * Math.exp(-d2 / 8);
    h += 0.18 * Math.sin(x * 1.3 + z * 0.4) + 0.12 * Math.cos(z * 1.7 - x * 0.6);
    const edge = Math.max(0, Math.min(1, (10.4 - r) / 2.2));
    return 0.12 + h * edge;
  };
  b.geo(terrainGeo(H, 10.4, 30, 80, 0.02), { mat: M.flat, color: '#b99a72' });

  /* ---------------------------------------------- lanes, stairs, dead ends -- */
  const lanePts = []; // for keeping houses off the lanes
  const near = (x, z, d) => lanePts.some((p) => (p[0] - x) ** 2 + (p[1] - z) ** 2 < d * d);
  const lanes = 15;
  for (let l = 0; l < lanes; l++) {
    const a0 = (l / lanes) * Math.PI * 2 + rng.range(-0.15, 0.15);
    let x = Math.cos(a0) * 9.6, z = Math.sin(a0) * 9.6;
    let head = Math.atan2(peak[1] - z, peak[0] - x) + rng.range(-0.6, 0.6);
    const n = rng.int(10, 26);
    let prevH = H(x, z);
    for (let i = 0; i < n; i++) {
      const toPeak = Math.atan2(peak[1] - z, peak[0] - x);
      let dh = toPeak - head;
      dh = Math.atan2(Math.sin(dh), Math.cos(dh));
      // crooked: mostly straight runs, then a sudden elbow
      head += dh * 0.12 + (rng.chance(0.18) ? rng.sign() * rng.range(0.7, 1.5) : rng.range(-0.08, 0.08));
      const step = 0.4;
      const nx = x + Math.cos(head) * step, nz = z + Math.sin(head) * step;
      if (Math.hypot(nx, nz) > 10 || Math.hypot(nx - peak[0], nz - peak[1]) < 0.9) break;
      x = nx; z = nz;
      const h = H(x, z);
      // stair tread: a flat slab at the local height — on slopes they read as steps
      const top = Math.max(h, prevH * 0.5 + h * 0.5) + 0.04;
      b.box(0.56, top + 0.02, 0.5, { x, y: 0, z, ry: -head + Math.PI / 2, color: i % 2 ? '#d8c6a2' : '#cdb995', mat: M.stone });
      prevH = h;
      lanePts.push([x, z]);
    }
    // dead end: a blind wall across the last step
    if (rng.chance(0.6)) {
      const h = H(x, z);
      b.box(0.9, h + 0.75, 0.14, {
        x: x + Math.cos(head) * 0.3, z: z + Math.sin(head) * 0.3, ry: -head + Math.PI / 2,
        color: '#c9b391',
      });
    }
  }

  /* ----------------------------------------------- landmarks (the places) -- */
  // Each landmark gets a motif in the carpet and a golden thread up to it.
  const marks = []; // {x, y, z, kind}
  const addMark = (x, y, z, kind) => marks.push({ x, y, z, kind });

  // the summit sanctuary: a domed temple
  {
    const [x, z] = peak, h = H(x, z);
    b.cyl(1.0, 1.15, h + 1.3, { x, z, seg: 20, color: C.plaster });
    b.dome(0.98, { x, y: h + 1.3, z, color: C.ochre, mat: M.smooth });
    b.cyl(0.07, 0.07, 0.5, { x, y: h + 2.25, z, color: C.gold, mat: M.metal });
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      b.cyl(0.07, 0.08, h + 1.1, { x: x + Math.cos(a) * 1.3, z: z + Math.sin(a) * 1.3, seg: 6, color: C.ivory, mat: M.smooth });
    }
    b.cyl(1.42, 1.42, 0.12, { x, y: h + 1.1, z, seg: 24, color: C.ivory });
    addMark(x, h + 2.7, z, 'dome');
  }
  // towers and bell towers scattered at odd places
  const towerSpots = [];
  for (let i = 0; i < 6; i++) {
    for (let k = 0; k < 40; k++) {
      const [x, z] = rng.inDisc(8.6, 2.5);
      if (near(x, z, 0.8) || towerSpots.some((p) => Math.hypot(p[0] - x, p[1] - z) < 3)) continue;
      towerSpots.push([x, z]);
      const h0 = H(x, z) - 0.3;
      const th = rng.range(2.4, 4.2);
      const cap = rng.pick(['cone', 'spire', 'onion', 'crenel']);
      tower(b, { x, y: h0, z, r: rng.range(0.32, 0.45), h: th, cap, wall: rng.pick([C.plaster, C.sand, C.ivory]), capColor: rng.pick([C.terracotta, C.brick, C.slate]), rand: rng, lit: 0.5 });
      addMark(x, h0 + th + 0.9, z, 'tower');
      break;
    }
  }
  // small squares with a fountain / well
  for (let i = 0; i < 5; i++) {
    for (let k = 0; k < 40; k++) {
      const [x, z] = rng.inDisc(9, 2);
      if (towerSpots.some((p) => Math.hypot(p[0] - x, p[1] - z) < 2.2)) continue;
      towerSpots.push([x, z]);
      const h = H(x, z);
      b.cyl(0.85, 0.85, h + 0.06, { x, z, seg: 18, color: '#e2d3b4' });
      b.cyl(0.3, 0.34, h + 0.32, { x, z, seg: 12, color: C.ivory, mat: M.smooth });
      b.cyl(0.24, 0.24, 0.02, { x, y: h + 0.31, z, seg: 12, color: C.sea, mat: M.water });
      b.cyl(0.04, 0.04, 0.5, { x, y: h + 0.3, z, color: C.ivory, mat: M.smooth });
      addMark(x, h + 0.9, z, 'well');
      lanePts.push([x, z]);
      break;
    }
  }

  /* ------------------------------------------------------- the hovels -- */
  const placed = [];
  for (let t = 0; t < 3000 && placed.length < 190; t++) {
    const [x, z] = rng.inDisc(9.7);
    const w = rng.range(0.5, 1.05), d = rng.range(0.5, 1.0);
    const rad = Math.max(w, d) * 0.6;
    if (near(x, z, rad + 0.28)) continue;
    if (towerSpots.some((p) => Math.hypot(p[0] - x, p[1] - z) < rad + 0.75)) continue;
    if (Math.hypot(x - peak[0], z - peak[1]) < 1.5 + rad) continue;
    if (placed.some((o) => Math.hypot(o.x - x, o.z - z) < rad + o.rad + 0.05)) continue;
    placed.push({ x, z, w, d, rad });
    const ry = rng.range(0, Math.PI); // every house its own angle: no plan at all
    // sit on the lowest corner so nothing floats on the slope
    let lo = Infinity, hi = -Infinity;
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const hh = H(x + sx * rad, z + sz * rad);
      lo = Math.min(lo, hh); hi = Math.max(hi, hh);
    }
    const hgt = rng.range(0.6, 1.7) + (hi - lo);
    const wall = rng.pick([C.plaster, C.sand, '#e6cfa8', C.rose, '#d9c09a', C.ivory, '#cbb08a']);
    house(b, {
      x, y: lo - 0.05, z, w, d, h: hgt, ry,
      roof: rng.pick(['gable', 'gable', 'shed', 'flat', 'hip']),
      wall, roofColor: rng.pick([C.terracotta, C.brick, '#b5653f', C.rust]),
      lit: 0.35, r: rng,
    });
    // some lean-to sheds and balconies glued on
    if (rng.chance(0.25)) {
      b.box(w * 0.5, 0.06, 0.3, { x, y: lo + hgt * 0.6, z, ry, color: C.darkwood, mat: M.wood });
    }
  }
  // a few cypresses and laundry poles between houses
  for (let i = 0; i < 20; i++) {
    const [x, z] = rng.inDisc(9.8);
    if (near(x, z, 0.4) || placed.some((o) => Math.hypot(o.x - x, o.z - z) < o.rad + 0.15)) continue;
    tree(b, { x, y: H(x, z) - 0.05, z, h: rng.range(0.9, 1.6), kind: rng.pick(['cypress', 'round']), r: rng });
  }

  // laundry strung across the alleys between neighbouring hovels
  const ropes = new Lines();
  let nLines = 0;
  for (let i = 0; i < placed.length && nLines < 26; i++) {
    const a = placed[i];
    const o = placed.find((q) => q !== a && Math.hypot(q.x - a.x, q.z - a.z) < 2.0 && Math.hypot(q.x - a.x, q.z - a.z) > 1.1);
    if (!o || !rng.chance(0.4)) continue;
    const ya = H(a.x, a.z) + 0.55, yo = H(o.x, o.z) + 0.55;
    const y = Math.max(ya, yo);
    const A = [a.x, y, a.z], B = [o.x, y, o.z];
    ropes.rope(A, B, 0.12, '#6b5440', 6);
    nLines++;
    const k = rng.int(2, 4);
    for (let j = 1; j <= k; j++) {
      const t = j / (k + 1);
      const px = a.x + (o.x - a.x) * t, pz = a.z + (o.z - a.z) * t;
      const py = y - 0.12 * 4 * t * (1 - t);
      b.quad(0.16, 0.2, {
        x: px, y: py - 0.1, z: pz, ry: -Math.atan2(o.z - a.z, o.x - a.x),
        mat: M.cloth, color: rng.pick([C.white, C.sky, C.rose, C.ochre, accent, C.ivory]),
      });
    }
  }

  const object = new THREE.Group();
  object.add(b.build());
  object.add(ropes.build());

  /* ----------------------------------------------------------- the carpet -- */
  const W = 12.6, Dp = 9.0; // rectangular carpet, longer than wide
  const CY = 12.4;
  const carpet = new THREE.Group();
  carpet.position.set(0, CY, 0);
  carpet.rotation.set(0, 0.5, 0, 'YXZ');
  const tiltX = 0.62; // lean toward the viewer
  carpet.rotation.x = tiltX;
  object.add(carpet);

  // motif positions: each landmark is given a symmetrical place, by kind and by order
  const kinds = { dome: [], tower: [], well: [] };
  marks.forEach((m) => kinds[m.kind].push(m));
  const motifs = []; // {u, v, kind, mark}
  kinds.dome.forEach((m) => motifs.push({ u: 0.5, v: 0.5, kind: 'dome', mark: m }));
  // towers sit on the long axis and the diagonals of an inner ring
  kinds.tower.sort((a, b2) => Math.atan2(a.z, a.x) - Math.atan2(b2.z, b2.x));
  const towerSlots = [[0.5, 0.215], [0.5, 0.785], [0.3, 0.35], [0.7, 0.65], [0.3, 0.65], [0.7, 0.35]];
  kinds.tower.forEach((m, i) => motifs.push({ u: towerSlots[i % 6][0], v: towerSlots[i % 6][1], kind: 'tower', mark: m }));
  const wellSlots = [[0.18, 0.5], [0.82, 0.5], [0.5, 0.36], [0.5, 0.64], [0.18, 0.25], [0.82, 0.75]];
  kinds.well.forEach((m, i) => motifs.push({ u: wellSlots[i % 6][0], v: wellSlots[i % 6][1], kind: 'well', mark: m }));

  const RED = '#8a2626', DEEP = '#5a1820', INDIGO = '#22305e', IVORY = '#efe2c4', GOLD = '#d8a547', TEAL = '#2f6e6a', SAFF = '#e0b062';
  const tex = canvasTex([1024, Math.round(1024 * Dp / W)], (g, sx, sy) => {
    g.fillStyle = INDIGO; g.fillRect(0, 0, sx, sy);
    // outer guard stripes
    const band = (o, col, wdt) => { g.strokeStyle = col; g.lineWidth = wdt; g.strokeRect(o, o, sx - 2 * o, sy - 2 * o); };
    band(10, IVORY, 6); band(22, GOLD, 3);
    // main border: lozenges and little crosses, kept perfectly symmetric
    const bw = 78, b0 = 30;
    g.fillStyle = DEEP; g.fillRect(b0, b0, sx - 2 * b0, bw); g.fillRect(b0, sy - b0 - bw, sx - 2 * b0, bw);
    g.fillRect(b0, b0, bw, sy - 2 * b0); g.fillRect(sx - b0 - bw, b0, bw, sy - 2 * b0);
    const loz = (cx, cy, r, col) => { g.fillStyle = col; g.beginPath(); g.moveTo(cx, cy - r); g.lineTo(cx + r, cy); g.lineTo(cx, cy + r); g.lineTo(cx - r, cy); g.closePath(); g.fill(); };
    const nL = 14;
    for (let i = 0; i <= nL; i++) {
      const p = b0 + bw / 2 + (i / nL) * (sx - 2 * b0 - bw);
      for (const [cx, cy] of [[p, b0 + bw / 2], [p, sy - b0 - bw / 2], [b0 + bw / 2, p], [sx - b0 - bw / 2, p]]) {
        loz(cx, cy, 27, GOLD); loz(cx, cy, 18, RED); loz(cx, cy, 8, IVORY);
      }
    }
    band(b0 + bw + 4, IVORY, 5); band(b0 + bw + 14, TEAL, 6);
    // field
    const f0 = b0 + bw + 20;
    g.fillStyle = RED; g.fillRect(f0, f0, sx - 2 * f0, sy - 2 * f0);
    // straight lines: the lattice of streets the city does not have
    g.strokeStyle = 'rgba(40,10,10,0.35)'; g.lineWidth = 3;
    for (let i = 1; i < 12; i++) {
      const p = f0 + (i / 12) * (sx - 2 * f0);
      g.beginPath(); g.moveTo(p, f0); g.lineTo(p, sy - f0); g.stroke();
      g.beginPath(); g.moveTo(f0, p); g.lineTo(sx - f0, p); g.stroke();
    }
    // diagonals
    g.strokeStyle = 'rgba(232,190,110,0.35)'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(f0, f0); g.lineTo(sx - f0, sy - f0); g.moveTo(sx - f0, f0); g.lineTo(f0, sy - f0); g.stroke();
    // corner quarter medallions
    for (const [cx, cy] of [[f0, f0], [sx - f0, f0], [f0, sy - f0], [sx - f0, sy - f0]]) {
      for (const [r, col] of [[150, INDIGO], [128, GOLD], [118, TEAL], [80, IVORY], [66, RED], [30, GOLD]]) {
        g.save(); g.beginPath(); g.rect(f0, f0, sx - 2 * f0, sy - 2 * f0); g.clip();
        g.fillStyle = col; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill(); g.restore();
      }
    }
    // central medallion: circles, a 16-point star, a ring of petals
    const cx = sx / 2, cy = sy / 2;
    const circle = (r, col) => { g.fillStyle = col; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill(); };
    circle(232, GOLD); circle(222, INDIGO);
    for (let i = 0; i < 32; i++) { // petals
      const a = (i / 32) * Math.PI * 2;
      g.fillStyle = i % 2 ? IVORY : SAFF;
      g.beginPath(); g.ellipse(cx + Math.cos(a) * 196, cy + Math.sin(a) * 196, 20, 9, a, 0, Math.PI * 2); g.fill();
    }
    circle(172, TEAL);
    g.fillStyle = GOLD; g.beginPath();
    for (let i = 0; i < 32; i++) {
      const a = (i / 32) * Math.PI * 2, r = i % 2 ? 110 : 168;
      g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    }
    g.closePath(); g.fill();
    circle(104, RED); circle(80, IVORY); circle(70, INDIGO);
    g.strokeStyle = GOLD; g.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * 70, cy + Math.sin(a) * 70); g.stroke();
    }
    // motifs for the places of the city; every motif is mirrored four ways, as carpets are
    const drawMotif = (u, v, kind) => {
      const px = u * sx, py = v * sy;
      if (kind === 'tower') {
        loz(px, py, 40, IVORY); loz(px, py, 32, INDIGO);
        g.fillStyle = GOLD; g.fillRect(px - 7, py - 22, 14, 44); g.fillRect(px - 22, py - 7, 44, 14);
        g.fillStyle = IVORY; g.beginPath(); g.arc(px, py, 6, 0, 7); g.fill();
      } else if (kind === 'well') {
        g.fillStyle = GOLD; g.beginPath(); g.arc(px, py, 34, 0, 7); g.fill();
        g.fillStyle = TEAL; g.beginPath(); g.arc(px, py, 27, 0, 7); g.fill();
        g.fillStyle = IVORY;
        for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; g.beginPath(); g.arc(px + Math.cos(a) * 17, py + Math.sin(a) * 17, 4.5, 0, 7); g.fill(); }
        g.fillStyle = INDIGO; g.beginPath(); g.arc(px, py, 7, 0, 7); g.fill();
      }
    };
    for (const m of motifs) {
      if (m.kind === 'dome') continue;
      const seen = new Set();
      for (const [u, v] of [[m.u, m.v], [1 - m.u, m.v], [m.u, 1 - m.v], [1 - m.u, 1 - m.v]]) {
        const k = `${u.toFixed(3)},${v.toFixed(3)}`;
        if (seen.has(k)) continue; seen.add(k);
        drawMotif(u, v, m.kind);
      }
    }
  });
  const carpetGeo = new THREE.PlaneGeometry(W, Dp, 48, 36);
  carpetGeo.rotateX(-Math.PI / 2);
  const carpetMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95, metalness: 0, side: THREE.DoubleSide });
  const carpetMesh = new THREE.Mesh(carpetGeo, carpetMat);
  carpetMesh.castShadow = true;
  carpetMesh.receiveShadow = true;
  carpet.add(carpetMesh);
  const base = Float32Array.from(carpetGeo.attributes.position.array);
  const wave = (x, z, t) =>
    0.22 * Math.sin(x * 0.55 + t * 0.9) + 0.14 * Math.sin(z * 0.8 - t * 0.7 + 1.3) + 0.06 * Math.sin((x + z) * 1.3 + t * 1.6);

  // fringe: tassels on the two short ends
  const fringeN = 44;
  const fringeGeo = new THREE.BufferGeometry();
  const fringePos = new Float32Array(fringeN * 2 * 2 * 3);
  fringeGeo.setAttribute('position', new THREE.BufferAttribute(fringePos, 3));
  const fringe = new THREE.LineSegments(fringeGeo, new THREE.LineBasicMaterial({ color: '#efe2c4' }));
  fringe.frustumCulled = false;
  carpet.add(fringe);

  // golden threads from the places to their motifs
  carpet.updateMatrix();
  const cm = carpet.matrix.clone();
  const threadGeo = new THREE.BufferGeometry();
  const threadPos = new Float32Array(motifs.length * 6);
  const threadCol = new Float32Array(motifs.length * 6);
  const gold = new THREE.Color(C.gold);
  motifs.forEach((m, i) => {
    threadPos.set([m.mark.x, m.mark.y, m.mark.z], i * 6);
    threadCol.set([gold.r * 1.6, gold.g * 1.6, gold.b * 1.6, gold.r * 0.9, gold.g * 0.9, gold.b * 0.9], i * 6);
  });
  threadGeo.setAttribute('position', new THREE.BufferAttribute(threadPos, 3));
  threadGeo.setAttribute('color', new THREE.BufferAttribute(threadCol, 3));
  const threads = new THREE.LineSegments(threadGeo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.55, toneMapped: false }));
  threads.frustumCulled = false;
  object.add(threads);

  // little glowing beads where each thread touches a place
  const bead = new THREE.InstancedMesh(new THREE.SphereGeometry(0.09, 8, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(C.gold).multiplyScalar(2.2), toneMapped: false }), motifs.length);
  const tm = new THREE.Matrix4();
  motifs.forEach((m, i) => { tm.makeTranslation(m.mark.x, m.mark.y, m.mark.z); bead.setMatrixAt(i, tm); });
  object.add(bead);

  const v = new THREE.Vector3();
  function update(t) {
    const p = carpetGeo.attributes.position.array;
    for (let i = 0; i < p.length; i += 3) {
      const x = base[i], z = base[i + 2];
      const edge = 0.35 + 0.65 * Math.min(1, (Math.abs(x) / (W / 2)) ** 2 + (Math.abs(z) / (Dp / 2)) ** 2);
      p[i + 1] = wave(x, z, t) * edge;
    }
    carpetGeo.attributes.position.needsUpdate = true;
    carpetGeo.computeVertexNormals();
    // fringe
    let k = 0;
    for (const side of [-1, 1]) {
      for (let i = 0; i < fringeN; i++) {
        const z = -Dp / 2 + ((i + 0.5) / fringeN) * Dp;
        const x = side * W / 2;
        const edge = 0.35 + 0.65 * Math.min(1, 1 + (z / (Dp / 2)) ** 2);
        const y = wave(x, z, t) * edge;
        const sway = 0.08 * Math.sin(t * 1.3 + i * 0.7);
        fringePos[k++] = x; fringePos[k++] = y; fringePos[k++] = z;
        fringePos[k++] = x + side * 0.42; fringePos[k++] = y - 0.12 + sway; fringePos[k++] = z;
      }
    }
    fringeGeo.attributes.position.needsUpdate = true;
    // thread tops follow the waving motifs
    motifs.forEach((m, i) => {
      const x = (m.u - 0.5) * W, z = (m.v - 0.5) * Dp;
      const edge = 0.35 + 0.65 * Math.min(1, (Math.abs(x) / (W / 2)) ** 2 + (Math.abs(z) / (Dp / 2)) ** 2);
      v.set(x, wave(x, z, t) * edge - 0.02, z).applyMatrix4(cm);
      threadPos[i * 6 + 3] = v.x; threadPos[i * 6 + 4] = v.y; threadPos[i * 6 + 5] = v.z;
    });
    threadGeo.attributes.position.needsUpdate = true;
  }
  update(0);
  return { object, update };
}
