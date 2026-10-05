// PYRRHA — a name that once meant a different city.
// The real Pyrrha: flat, windy, low whitewashed houses strung along a shore,
// tamarisks bent by the wind, flags and laundry streaming, a kite.
// Over it, slowly, the Pyrrha Marco imagined assembles itself out of the air:
// a fortified goblet of a city on the slopes of a bay, high towers and windows,
// a deep well-like square with a fountain. It holds for a moment — then the wind
// takes it all at once, scattering it like chalk dust, and only the real town remains.
import { THREE, Builder, M, C, boat, Lines } from '../kit.js';
import { figure, edgesOf, ghostLit, softTex, sstep } from './_d_kit.js';

const WIND = new THREE.Vector3(1, 0, -0.25).normalize();

export default function build({ rng, accent }) {
  const b = new Builder();
  const object = new THREE.Group();
  const shoreZ = (x) => 1.2 + 0.7 * Math.sin(x * 0.35 + 0.6) + 0.25 * Math.sin(x * 1.1);
  const R0 = 10.45;

  /* ---------- land and sea ---------- */
  // sea bed (whole disc) then sand on the land side, then water on the sea side
  b.cyl(R0, R0, 0.04, { color: '#3f6d78', seg: 72 });
  const landPts = [], seaPts = [];
  const NS = 60;
  for (let i = 0; i <= NS; i++) {
    const x = -R0 + (2 * R0 * i) / NS;
    const z = shoreZ(x);
    if (Math.hypot(x, z) < R0) { landPts.push([x, z]); seaPts.push([x, z]); }
  }
  const aR = (x, z) => Math.atan2(z, x);
  const first = landPts[0], last = landPts[landPts.length - 1];
  // land polygon: shore from left to right, then arc behind (through -z)
  const land = landPts.slice();
  {
    const a0 = aR(last[0], last[1]), a1 = aR(first[0], first[1]) - Math.PI * 2;
    for (let i = 1; i < 40; i++) { const a = a0 + (a1 - a0) * (i / 40); land.push([Math.cos(a) * R0, Math.sin(a) * R0]); }
  }
  const sea = seaPts.slice().reverse();
  {
    const a0 = aR(first[0], first[1]), a1 = aR(last[0], last[1]);
    let A1 = a1; if (A1 > a0) A1 -= Math.PI * 2;
    // walk from the left end of the shore around the front (+z) to the right end
    const s0 = a0, s1 = a1 < a0 ? a1 : a1 - Math.PI * 2;
    void A1;
    for (let i = 1; i < 40; i++) { const a = s0 + ((s1 - s0) * i) / 40; sea.push([Math.cos(a) * R0, Math.sin(a) * R0]); }
  }
  b.slab(land, 0.16, { y: 0.0, color: '#ddc79f' });
  // wet sand band
  const wet = [];
  for (const [x, z] of landPts) wet.push([x, z - 0.0]);
  for (let i = landPts.length - 1; i >= 0; i--) wet.push([landPts[i][0], landPts[i][1] - 0.45]);
  b.slab(wet, 0.012, { y: 0.16, color: '#bba57f' });
  const water = new Builder();
  const seaMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55, metalness: 0.05, transparent: true, opacity: 0.9 });
  seaMat.userData.noShadow = true;
  water.slab(sea, 0.02, { y: 0.1, color: '#3d8a96', mat: seaMat });
  // shallows lighter strip
  object.add(water.build({ shadows: false }));

  // dune grass tufts and wind streaks in the sand (all pointing downwind)
  const windAng = Math.atan2(-WIND.z, WIND.x);
  for (let i = 0; i < 160; i++) {
    const [x, z] = rng.inDisc(10, 0);
    if (z > shoreZ(x) - 0.6) continue;
    if (rng.chance(0.5)) b.box(rng.range(0.4, 1.2), 0.012, 0.04, { x, y: 0.16, z, ry: windAng, color: rng.pick(['#e9d7b2', '#cdb68c']) });
    else for (let k = 0; k < 4; k++) b.cone(0.025, rng.range(0.16, 0.3), { x: x + rng.range(-0.08, 0.08), y: 0.16, z: z + rng.range(-0.08, 0.08), rz: -0.6, ry: windAng, color: rng.pick(['#9aa56a', '#b7b37a', '#87925c']), seg: 3 });
  }
  // low dunes behind
  for (let i = 0; i < 9; i++) {
    const a = rng.range(Math.PI * 1.1, Math.PI * 1.9);
    const rr = rng.range(7.6, 9.6);
    b.sphere(1, { x: Math.cos(a) * rr, y: 0.12, z: Math.sin(a) * rr, sx: rng.range(1.2, 2.2), sy: rng.range(0.22, 0.4), sz: rng.range(0.7, 1.1), ry: windAng, color: '#dcc49a', mat: M.stone, seg: 16 });
  }

  /* ---------- the low houses strung along the shore ---------- */
  const walls = ['#f4efe6', '#efe6d6', '#e9dccb', '#f2ece0', '#dfe3e2', '#efd9c3'];
  const doors = ['#4a7fa8', '#2f6377', '#5b8f8a', '#9c5a3c', accent];
  const houses = [];
  for (let row = 0; row < 2; row++) {
    let x = -9.2 + rng.range(0, 0.4);
    while (x < 9.2) {
      const w = rng.range(0.8, 1.5);
      const xc = x + w / 2;
      const zc = shoreZ(xc) - (row === 0 ? 1.15 : 2.7) + rng.range(-0.15, 0.15);
      x += w + (row === 0 ? rng.range(0.15, 0.55) : rng.range(0.6, 1.8));
      if (Math.hypot(xc, zc) > 9.6 || Math.hypot(xc, zc + 0.8) > 9.6) continue;
      houses.push({ x: xc, z: zc, w, row });
    }
  }
  for (const hsp of houses) {
    const { x, z, w } = hsp;
    const d = rng.range(0.75, 1.0), h = rng.range(0.45, 0.72);
    const ry = Math.atan2(0.7 * 0.35 * Math.cos(x * 0.35 + 0.6), 1) * -1 * 0.6;
    b.push({ x, y: 0.16, z, ry });
    b.box(w, h, d, { color: rng.pick(walls) });
    // low roof: flat with parapet or shallow tiled
    if (rng.chance(0.45)) {
      b.box(w + 0.05, 0.06, d + 0.05, { y: h, color: '#e6ddcc' });
    } else {
      b.geo(new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1).rotateY(Math.PI / 4).translate(0, 0.5, 0), { y: h, sx: w + 0.1, sz: d + 0.1, sy: 0.22, color: rng.pick([C.terracotta, '#b77a58', '#a86848']), mat: M.flat });
    }
    // door and shuttered windows facing the sea (+z)
    const dc = rng.pick(doors);
    b.box(0.18, 0.34, 0.02, { x: rng.range(-w / 4, w / 4), z: d / 2, color: dc, mat: M.wood });
    for (const s of [-1, 1]) {
      if (w < 0.95 && s === 1) continue;
      const wx = s * w * 0.32;
      const lit = rng.chance(0.4);
      b.quad(0.14, 0.16, { x: wx, y: h * 0.62, z: d / 2 + 0.012, mat: lit ? M.glow : M.smooth, color: lit ? C.lamp : '#3a4650', glow: 1.6 });
      b.box(0.06, 0.17, 0.015, { x: wx - 0.11, y: h * 0.62 - 0.085, z: d / 2 + 0.01, color: dc, mat: M.wood });
      b.box(0.06, 0.17, 0.015, { x: wx + 0.11, y: h * 0.62 - 0.085, z: d / 2 + 0.01, color: dc, mat: M.wood });
    }
    if (rng.chance(0.4)) b.box(0.1, 0.25, 0.1, { x: w * 0.3, y: h, z: -d * 0.2, color: '#d9cfc0' });
    // a bench by the door, a stone wall courtyard behind some
    if (rng.chance(0.35)) b.box(0.4, 0.06, 0.1, { x: -w * 0.2, y: 0.12, z: d / 2 + 0.12, color: C.wood, mat: M.wood });
    if (hsp.row === 1 && rng.chance(0.6)) {
      b.box(w * 0.9, 0.18, 0.05, { z: -d / 2 - 0.5, color: '#cdbb9b' });
      b.box(0.05, 0.18, 0.5, { x: -w * 0.45, z: -d / 2 - 0.25, color: '#cdbb9b' });
    }
    b.pop();
  }

  // the promenade along the shore (planks), a jetty into the sea, boats
  for (let i = 0; i < 70; i++) {
    const x = -8.8 + i * 0.25;
    const z = shoreZ(x) - 0.35;
    if (Math.hypot(x, z) > 9.9) continue;
    b.box(0.24, 0.03, 0.42, { x, y: 0.16, z, color: rng.pick(['#b89a70', '#a8885e', '#c4a77d']), mat: M.wood });
  }
  const jx = 2.6, jz0 = shoreZ(2.6) - 0.2;
  for (let k = 0; k < 18; k++) {
    b.box(0.6, 0.04, 0.2, { x: jx, y: 0.3, z: jz0 + k * 0.24, color: rng.pick(['#9c8060', '#8a6e50']), mat: M.wood });
    if (k % 3 === 0) for (const s of [-1, 1]) b.cyl(0.04, 0.04, 0.4, { x: jx + s * 0.3, y: 0.0, z: jz0 + k * 0.24, color: C.darkwood, seg: 6 });
  }
  boat(b, { x: jx + 0.75, y: 0.06, z: jz0 + 2.6, len: 1.3, ry: 0.15, color: '#e8e2d4', sail: '#e9dcc0' });
  boat(b, { x: jx - 0.8, y: 0.06, z: jz0 + 3.4, len: 1.0, ry: -0.1, color: '#4a7fa8', mast: false });
  boat(b, { x: -4.5, y: 0.14, z: shoreZ(-4.5) - 0.2, len: 1.1, ry: 1.2, rz: 0.2, color: '#c26a43', mast: false });
  boat(b, { x: -3.6, y: 0.14, z: shoreZ(-3.6) - 0.15, len: 0.9, ry: 1.5, color: '#efe4cf', mast: false });
  boat(b, { x: 6.3, y: 0.06, z: shoreZ(6.3) + 2.2, len: 1.1, ry: 0.6, color: '#2f6377', sail: '#f1e7d2' });
  // nets drying on poles
  for (let k = 0; k < 3; k++) {
    const x = -6.6 + k * 0.7, z = shoreZ(-6.6 + k * 0.7) - 0.6;
    b.cyl(0.02, 0.02, 0.7, { x, y: 0.16, z, color: C.darkwood, seg: 4 });
  }
  b.quad(1.4, 0.45, { x: -5.9, y: 0.6, z: shoreZ(-5.9) - 0.6, ry: 0.05, color: '#6f6a5c', mat: M.cloth });

  // wind-bent tamarisks
  const bentTree = (x, z, hgt) => {
    const pts = [];
    for (let k = 0; k <= 5; k++) {
      const t = k / 5;
      pts.push([x + WIND.x * t * t * hgt * 0.7, 0.16 + t * hgt, z + WIND.z * t * t * hgt * 0.7]);
    }
    b.tube(pts, 0.05, { color: '#6f5440', mat: M.wood, rseg: 5, tseg: 10 });
    const top = pts[5];
    for (let k = 0; k < 4; k++) {
      b.sphere(1, { x: top[0] + WIND.x * (k * 0.22 - 0.1), y: top[1] - 0.05 + rng.range(-0.06, 0.06), z: top[2] + WIND.z * (k * 0.22) + rng.range(-0.12, 0.12), sx: 0.38, sy: 0.18, sz: 0.26, ry: windAng, color: rng.pick(['#7c8f5e', '#8a9a66', '#6d8254']), mat: M.flat, seg: 7 });
    }
  };
  for (let i = 0; i < 9; i++) {
    const x = -8 + i * 2 + rng.range(-0.5, 0.5);
    const z = shoreZ(x) - rng.pick([1.9, 3.6, 4.4]);
    if (Math.hypot(x, z) > 9.2) continue;
    bentTree(x, z, rng.range(0.9, 1.4));
  }
  // townsfolk leaning into the wind
  for (let i = 0; i < 11; i++) {
    const x = rng.range(-7, 7), z = shoreZ(x) - rng.range(0.25, 0.5);
    figure(b, { x, y: 0.18, z, ry: rng.pick([Math.PI / 2, -Math.PI / 2]) + rng.range(-0.3, 0.3), lean: 0.12, robe: rng.pick(['#5d6d8a', '#8a6a4a', '#a0524a', '#4d4a52', '#6f7f6a']), hat: rng.pick(['cap', 'veil', null]), hatColor: C.ivory, arms: [rng.pick(['down', 'hip']), rng.pick(['down', 'fwd', 'up'])] });
  }
  // the child with the kite
  const kx = -1.2, kz = shoreZ(-1.2) - 0.45;
  figure(b, { x: kx, y: 0.18, z: kz, h: 0.24, ry: Math.PI / 2, robe: '#d9b45a', arms: ['up', 'down'] });

  // flagpoles (cloth animated)
  const flagSpots = [[-6.9, -1.2], [0.6, -1.6], [5.2, -1.0], [jx + 0.3, null]];
  const poles = [];
  for (const [fx, dz] of flagSpots) {
    const fz = dz === null ? jz0 + 4.1 : shoreZ(fx) + dz;
    const fh = dz === null ? 1.2 : 1.9;
    const fy = dz === null ? 0.32 : 0.16;
    b.cyl(0.025, 0.03, fh, { x: fx, y: fy, z: fz, color: '#e8e2d4', mat: M.smooth, seg: 6 });
    b.sphere(0.04, { x: fx, y: fy + fh, z: fz, color: C.gold, mat: M.metal, seg: 6 });
    poles.push([fx, fy + fh - 0.04, fz]);
  }
  object.add(b.build());

  /* ---------- animated: flags, laundry, kite, whitecaps ---------- */
  const flagMeshes = [];
  const flagCols = [accent, '#c4453a', '#2f6377', '#f1e7d2'];
  poles.forEach(([x, y, z], i) => {
    const g = new THREE.PlaneGeometry(0.6, 0.34, 8, 1).translate(0.3, -0.17, 0);
    const mesh = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: flagCols[i], side: THREE.DoubleSide, roughness: 0.9 }));
    mesh.position.set(x, y, z);
    mesh.rotation.y = windAng;
    mesh.castShadow = true;
    mesh.userData.base = g.attributes.position.array.slice();
    object.add(mesh);
    flagMeshes.push(mesh);
  });
  // laundry streaming between two posts
  const laundryG = new THREE.Group();
  const lb = new Builder();
  const lx0 = -2.9, lz0 = shoreZ(-2.9) - 1.95;
  lb.cyl(0.02, 0.02, 0.8, { x: 0, y: 0, z: 0, color: C.darkwood, seg: 4 });
  lb.cyl(0.02, 0.02, 0.8, { x: 1.4, y: 0, z: 0, color: C.darkwood, seg: 4 });
  { const lg = lb.build(); lg.position.set(lx0, 0.16, lz0); object.add(lg); }
  const sheets = [];
  for (let k = 0; k < 4; k++) {
    const g = new THREE.PlaneGeometry(0.26, 0.32, 1, 4).translate(0, -0.16, 0);
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: ['#f4efe6', '#c7d6e6', '#e8c0b0', '#f4efe6'][k], side: THREE.DoubleSide, roughness: 1 }));
    m.position.set(lx0 + 0.2 + k * 0.33, 0.93, lz0);
    m.castShadow = true;
    laundryG.add(m);
    sheets.push(m);
  }
  object.add(laundryG);
  const ropeL = new Lines().seg([lx0, 0.95, lz0], [lx0 + 1.4, 0.95, lz0], '#ddd4c0', 1).build();
  object.add(ropeL);
  // kite
  const kiteB = new Builder();
  kiteB.geo(new THREE.ConeGeometry(0.2, 0.01, 4).rotateX(Math.PI / 2), { sy: 1.4, color: '#e0503a', mat: M.cloth });
  const kite = kiteB.build();
  object.add(kite);
  const kiteLine = new Lines().seg([0, 0, 0], [0, 1, 0], '#f0e8d8', 1).seg([0, 0, 0], [0, 1, 0], '#f0e8d8', 1).build();
  object.add(kiteLine);
  const kHand = new THREE.Vector3(kx + 0.03, 0.4, kz);
  // whitecaps rolling to shore
  const NW = 55;
  const capMat = new THREE.MeshStandardMaterial({ color: '#f4f8f8', roughness: 0.6, transparent: true, opacity: 0.85 });
  const caps = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.02, 0.06), capMat, NW);
  const capSeed = Array.from({ length: NW }, () => [rng.range(-9, 9), rng(), rng.range(0.3, 0.9)]);
  object.add(caps);

  /* ---------- the imagined Pyrrha: a goblet city on the slopes of a bay ---------- */
  const P = new Builder();
  const ghost = ghostLit(0.45, { color: '#ffffff', roughness: 0.35, side: THREE.DoubleSide, emissive: new THREE.Color('#5a6aa0'), emissiveIntensity: 0.5 });
  const gc = '#c9d4f2', gc2 = '#e8ecff', gc3 = '#aab8e6';
  const GX = 0, GZ = -3.0;
  P.push({ x: GX, z: GZ });
  // the hill / cup: outer flank of the bay rising steeply
  P.lathe([[6.8, 0], [6.3, 0.6], [5.6, 2.2], [5.2, 4.2], [5.15, 5.4], [4.9, 5.4], [4.4, 4.6], [3.4, 3.4], [2.3, 2.0], [1.7, 1.1], [1.5, 0.9], [0.01, 0.9]], { color: gc3, mat: ghost, seg: 48 });
  // walls on the rim with towers
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    if (i % 5 === 0) {
      const th = 2.4 + rng.range(0, 1.8);
      P.cyl(0.36, 0.42, th, { x: Math.cos(a) * 5.05, y: 5.2, z: Math.sin(a) * 5.05, color: gc2, mat: ghost, seg: 10 });
      P.cone(0.5, 1.2, { x: Math.cos(a) * 5.05, y: 5.2 + th, z: Math.sin(a) * 5.05, color: gc, mat: ghost, seg: 10 });
    } else {
      P.box(0.85, 0.9, 0.22, { x: Math.cos(a) * 5.05, y: 5.3, z: Math.sin(a) * 5.05, ry: -a + Math.PI / 2, color: gc2, mat: ghost });
    }
  }
  // tiers of tall narrow houses with high windows, descending into the cup
  const tiers = [[4.3, 4.4, 1.7], [3.4, 3.2, 1.9], [2.5, 2.0, 2.1]];
  for (const [rr, yy, hh] of tiers) {
    const n = Math.round(rr * 4.2);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rr;
      P.box(0.62, hh + rng.range(-0.2, 0.6), 0.55, { x: Math.cos(a) * rr, y: yy, z: Math.sin(a) * rr, ry: -a + Math.PI / 2, color: rng.pick([gc, gc2]), mat: ghost });
    }
  }
  // the deep square like a well, and its fountain
  P.cyl(1.45, 1.45, 0.1, { y: 0.9, color: gc2, mat: ghost, seg: 24 });
  P.cyl(0.55, 0.6, 0.25, { y: 1.0, color: gc, mat: ghost, seg: 16 });
  P.cyl(0.08, 0.1, 0.8, { y: 1.2, color: gc2, mat: ghost, seg: 8 });
  P.dome(0.32, { y: 1.9, rx: Math.PI, color: gc2, mat: ghost, seg: 12 });
  // a few high bridges and the citadel tower
  P.cyl(0.55, 0.65, 8.5, { x: -3.2, y: 4.0, z: -3.2, color: gc2, mat: ghost, seg: 12 });
  P.cone(0.75, 2.2, { x: -3.2, y: 12.5, z: -3.2, color: gc, mat: ghost, seg: 12 });
  P.pop();
  const phantom = P.build({ shadows: false });
  const pEdges = edgesOf(phantom, '#cfdcff', 0.55, 0.25, 25);
  const phantomG = new THREE.Group();
  phantomG.add(phantom, pEdges);
  object.add(phantomG);

  // chalk dust that the phantom becomes when the wind takes it
  const posArr = phantom.children[0].geometry.attributes.position.array;
  const ND = 1600;
  const dPos = new Float32Array(ND * 3), dVel = new Float32Array(ND * 3);
  for (let i = 0; i < ND; i++) {
    const vi = rng.int(0, posArr.length / 3 - 1);
    dPos[i * 3] = posArr[vi * 3]; dPos[i * 3 + 1] = posArr[vi * 3 + 1]; dPos[i * 3 + 2] = posArr[vi * 3 + 2];
    const sp = rng.range(2.0, 6.0);
    dVel[i * 3] = WIND.x * sp + rng.range(-0.4, 0.4);
    dVel[i * 3 + 1] = rng.range(-0.2, 0.6);
    dVel[i * 3 + 2] = WIND.z * sp + rng.range(-0.6, 0.6);
  }
  const dg = new THREE.BufferGeometry();
  dg.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
  dg.setAttribute('vel', new THREE.BufferAttribute(dVel, 3));
  const dustMat = new THREE.ShaderMaterial({
    uniforms: { uT: { value: 0 }, uO: { value: 0 }, uTex: { value: softTex() }, uPx: { value: 1 } },
    vertexShader: `attribute vec3 vel; uniform float uT; varying float vA;
      void main(){ vec3 p = position + vel * uT + vec3(0.0, -0.05*uT*uT, 0.0);
        p.x += sin(p.y*2.0 + uT*3.0)*0.1*uT; vA = 1.0;
        vec4 mv = modelViewMatrix * vec4(p,1.0); gl_Position = projectionMatrix * mv;
        gl_PointSize = 0.09 * 700.0 * projectionMatrix[1][1] / -mv.z * (1.0 + uT*0.25); }`,
    fragmentShader: `uniform sampler2D uTex; uniform float uO; varying float vA;
      void main(){ vec4 t = texture2D(uTex, gl_PointCoord); gl_FragColor = vec4(vec3(0.55,0.6,0.75), t.a*uO); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const dust = new THREE.Points(dg, dustMat);
  dust.frustumCulled = false;
  object.add(dust);

  const dummy = new THREE.Object3D();
  const kp = new THREE.Vector3(), mid = new THREE.Vector3();
  const CYCLE = 26;
  return {
    object,
    update(t) {
      // phantom: assembles over 10 s, holds, then is gone in an instant
      const c = (t + 9) % CYCLE;
      let o;
      if (c < 3) o = 0;
      else if (c < 13) o = sstep(3, 13, c);
      else if (c < 19) o = 1;
      else o = Math.max(0, 1 - (c - 19) / 0.35);
      ghost.opacity = 0.42 * o;
      pEdges.material.opacity = 0.25 * o;
      phantomG.visible = o > 0.001;
      phantomG.position.y = (1 - o) * -0.4;
      const dt0 = c - 19;
      dustMat.uniforms.uT.value = Math.max(0, dt0);
      dustMat.uniforms.uO.value = dt0 > 0 ? Math.max(0, 1 - dt0 / 5) * 0.35 : 0;
      dust.visible = dt0 > 0 && dt0 < 5;
      // flags ripple downwind
      for (const f of flagMeshes) {
        const p = f.geometry.attributes.position, base = f.userData.base;
        for (let i = 0; i < p.count; i++) {
          const xx = base[i * 3];
          p.setZ(i, Math.sin(xx * 9 - t * 9 + f.position.x) * 0.05 * xx * 2.2);
        }
        p.needsUpdate = true;
      }
      // laundry blown out sideways
      sheets.forEach((s, k) => { s.rotation.x = -1.0 - 0.2 * Math.sin(t * 4 + k * 1.3); s.rotation.y = 0.15 * Math.sin(t * 3 + k); });
      // kite
      kp.set(kx + 3.0 + Math.sin(t * 0.7) * 0.5, 4.6 + Math.sin(t * 1.1) * 0.4, kz - 1.4 + Math.cos(t * 0.5) * 0.4);
      kite.position.copy(kp);
      kite.rotation.set(0.3 * Math.sin(t * 1.3), windAng + Math.PI / 2, 0.4 * Math.sin(t * 0.9));
      const lp = kiteLine.geometry.attributes.position;
      mid.copy(kHand).lerp(kp, 0.5); mid.y -= 0.5;
      lp.setXYZ(0, kHand.x, kHand.y, kHand.z); lp.setXYZ(1, mid.x, mid.y, mid.z);
      lp.setXYZ(2, mid.x, mid.y, mid.z); lp.setXYZ(3, kp.x, kp.y, kp.z);
      lp.needsUpdate = true;
      // whitecaps roll toward the shore and break
      for (let i = 0; i < NW; i++) {
        const [x0, ph, sp] = capSeed[i];
        const u = (ph + t * 0.05 * sp) % 1;
        const zS = shoreZ(x0);
        const z = zS + 0.2 + (1 - u) * 8;
        const inside = Math.hypot(x0, z) < 10.2;
        dummy.position.set(x0, 0.13, z);
        dummy.rotation.set(0, 0.1 * Math.sin(x0), 0);
        const k = inside ? Math.sin(Math.PI * u) : 0;
        dummy.scale.set(0.3 + 0.9 * u, 1, 1 + u);
        if (!inside) dummy.scale.set(0.0001, 0.0001, 0.0001); else dummy.scale.multiplyScalar(Math.max(0.0001, k));
        dummy.updateMatrix();
        caps.setMatrixAt(i, dummy.matrix);
      }
      caps.instanceMatrix.needsUpdate = true;
    },
  };
}
