// Anastasia — concentric canals, kites overhead, agate, onyx and chrysoprase for sale,
// pheasant roasting over cherrywood, women bathing in a garden pool: every desire wakes
// at once. The city is laid out like a cut gem seen from above — octagon within octagon —
// and in the outer ring the stone-cutters grind agate eight hours a day: the labour that
// shapes the city's desires takes the form of desire.
import { THREE, Builder, M, C, glowMat, solid } from '../kit.js';

const GEM = new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.08, metalness: 0.1, clearcoat: 1, flatShading: true, emissive: '#000000' });
const GEMS = { chrysoprase: '#6fd19a', agate: '#d8743e', onyx: '#2a2630', carnelian: '#c8402e', amethyst: '#9b6ad0', lapis: '#3b5fbf', citrine: '#f0c24a', rose: '#f2a3b4' };

export default function build({ rng, accent }) {
  const b = new Builder();
  const object = new THREE.Group();
  const OCT = 8, ROT = Math.PI / 8;
  const oct = (r) => { const p = []; for (let i = 0; i < OCT; i++) { const a = (i / OCT) * Math.PI * 2 + ROT; p.push([Math.cos(a) * r, Math.sin(a) * r]); } return p; };
  const ring = (r1, r2, h, o) => { // octagonal ring as eight trapezoid slabs
    const A = oct(r1), B = oct(r2);
    for (let i = 0; i < OCT; i++) { const j = (i + 1) % OCT; b.slab([A[i], A[j], B[j], B[i]], h, o); }
  };
  // radius of octagon edge at angle (apothem-aware), for placing things on rings
  const LAND = 0.5, WATER = 0.3;
  const RINGS = { island: [0, 2.6], c1: [2.6, 3.5], market: [3.5, 6.0], c2: [6.0, 6.9], works: [6.9, 10.3] };

  /* ------------------------------------------------- water and land, octagon in octagon */
  b.cyl(10.45, 10.5, 0.18, { color: '#2e5a5c', mat: M.stone, seg: 64 });
  ring(RINGS.c1[0] - 0.05, RINGS.c1[1] + 0.05, 0.1, { y: WATER - 0.1, color: '#3f8f8a', mat: M.water });
  ring(RINGS.c2[0] - 0.05, RINGS.c2[1] + 0.05, 0.1, { y: WATER - 0.1, color: '#3f8f8a', mat: M.water });
  b.slab(oct(RINGS.island[1]), LAND, { color: '#efe2d0', mat: M.smooth });
  ring(RINGS.market[0], RINGS.market[1], LAND, { color: '#e9d6c0', mat: M.stone });
  ring(RINGS.works[0], 10.75, LAND, { color: '#cdb79a', mat: M.stone });
  // gilded copings on every quay: the facets of the gem
  for (const r of [RINGS.island[1], RINGS.market[0], RINGS.market[1], RINGS.works[0]]) {
    const P = oct(r);
    for (let i = 0; i < OCT; i++) {
      const [x0, z0] = P[i], [x1, z1] = P[(i + 1) % OCT];
      b.box(Math.hypot(x1 - x0, z1 - z0) + 0.1, 0.06, 0.14, { x: (x0 + x1) / 2, y: LAND, z: (z0 + z1) / 2, ry: -Math.atan2(z1 - z0, x1 - x0), color: '#d9b45e', mat: M.smooth });
    }
  }
  // radial facet lines inlaid in the market ring (it reads as a cut stone from above)
  for (let i = 0; i < OCT; i++) {
    const a = (i / OCT) * Math.PI * 2 + ROT;
    b.box(RINGS.market[1] - RINGS.market[0], 0.012, 0.06, { x: Math.cos(a) * (RINGS.market[0] + RINGS.market[1]) / 2, y: LAND, z: Math.sin(a) * (RINGS.market[0] + RINGS.market[1]) / 2, ry: -a, color: '#c9a35b', mat: M.smooth });
  }
  // radial bridges across both canals on the octagon's flats
  for (let i = 0; i < OCT; i++) {
    const a = (i / OCT) * Math.PI * 2;
    for (const [r0, r1] of [[RINGS.c1[0] - 0.2, RINGS.c1[1] + 0.2], [RINGS.c2[0] - 0.2, RINGS.c2[1] + 0.2]]) {
      const n = 6;
      for (let k = 0; k < n; k++) {
        const t = (k + 0.5) / n, r = r0 + (r1 - r0) * t;
        b.box((r1 - r0) / n + 0.02, 0.07, 0.7, { x: Math.cos(a) * r, y: LAND + Math.sin(Math.PI * t) * 0.22 - 0.02, z: Math.sin(a) * r, ry: -a, color: '#f3e9d8', mat: M.smooth });
      }
      for (const s of [-1, 1]) {
        const pts = [];
        for (let k = 0; k <= 6; k++) { const t = k / 6, r = r0 + (r1 - r0) * t; pts.push([Math.cos(a) * r - Math.sin(a) * s * 0.33, LAND + Math.sin(Math.PI * t) * 0.22 + 0.2, Math.sin(a) * r + Math.cos(a) * s * 0.33]); }
        b.tube(pts, 0.025, { color: C.gold, mat: M.metal, tseg: 12, rseg: 4 });
      }
    }
  }

  /* ---------------------------------------------- the island: a garden pool */
  {
    const y = LAND;
    b.slab(oct(1.55), 0.06, { y, color: '#f7efe2', mat: M.smooth });
    b.slab(oct(1.35), 0.04, { y: y + 0.04, color: '#5fc1c0', mat: M.water });
    // bathers: shoulders and heads, hair up, above the water
    for (let k = 0; k < 5; k++) {
      const a = k * 1.3 + 0.4, r = 0.5 + (k % 2) * 0.45;
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      b.sphere(0.07, { x, y: y + 0.1, z, sy: 0.6, color: '#e8c2a0', mat: M.smooth, seg: 8 });
      b.sphere(0.045, { x, y: y + 0.17, z, color: '#e8c2a0', mat: M.smooth, seg: 8 });
      b.sphere(0.04, { x: x - 0.01, y: y + 0.21, z: z - 0.01, color: rng.pick(['#3a2418', '#7a4a20', '#1e1a18', '#a0522d']), mat: M.smooth, seg: 6 });
    }
    // pergola of columns with vines, and flowering trees on the corners
    for (let i = 0; i < OCT; i++) {
      const a = (i / OCT) * Math.PI * 2 + ROT, r = 2.05;
      b.cyl(0.06, 0.07, 1.4, { x: Math.cos(a) * r, y, z: Math.sin(a) * r, color: '#f7efe2', mat: M.smooth, seg: 8 });
      const a2 = ((i + 1) / OCT) * Math.PI * 2 + ROT;
      b.rod([Math.cos(a) * r, y + 1.42, Math.sin(a) * r], [Math.cos(a2) * r, y + 1.42, Math.sin(a2) * r], 0.05, { color: '#f7efe2', mat: M.smooth });
      for (let k = 0; k < 3; k++) b.sphere(0.13, { x: Math.cos(a + 0.25 * k) * r, y: y + 1.45, z: Math.sin(a + 0.25 * k) * r, color: k % 2 ? '#e07186' : C.leaf, mat: M.flat, seg: 5 });
    }
    // a pavilion over the pool's edge crowned with a great chrysoprase
    b.cyl(0.04, 0.04, 2.4, { x: 0, y, z: 0, color: C.gold, mat: M.metal, seg: 6 });
  }

  /* ---------------------------------------- the market ring: arcades and gem stalls */
  const midM = (RINGS.market[0] + RINGS.market[1]) / 2;
  const WALLS = ['#f2c4b4', '#f0d9a8', '#e8b8a8', '#d9e2c4', '#f4e3d3', '#e9c6d8'];
  for (let i = 0; i < OCT; i++) {
    const a0 = (i / OCT) * Math.PI * 2 + ROT, a1 = ((i + 1) / OCT) * Math.PI * 2 + ROT;
    // two-storey arcaded palazzi on the outer half of each facet
    for (let k = 0; k < 3; k++) {
      const t = (k + 0.5) / 3;
      const a = a0 + (a1 - a0) * t;
      const ap = Math.PI / 8; // octagon apothem correction
      const rr = (RINGS.market[1] - 0.75) * Math.cos(ap) / Math.cos(a - (a0 + a1) / 2);
      const x = Math.cos(a) * rr, z = Math.sin(a) * rr;
      const ry = Math.PI / 2 - (a0 + a1) / 2;
      const w = 1.2, h = 1.25 + ((i + k) % 3) * 0.3;
      b.push({ x, y: LAND, z, ry });
      const wall = rng.pick(WALLS);
      b.box(w, h, 1.0, { color: wall });
      b.box(w + 0.08, 0.08, 1.08, { y: h, color: '#f7efe2', mat: M.smooth });
      // arcades on both faces: toward the pool and toward the canal
      for (const sd of [-1, 1]) {
        for (let m = 0; m < 3; m++) {
          const lx = -w / 2 + (m + 0.5) * w / 3;
          b.box(0.26, 0.5, 0.02, { x: lx, y: 0.05, z: sd * 0.505, color: '#3d2a24', mat: M.smooth });
          b.geo(new THREE.CircleGeometry(0.13, 10, 0, Math.PI), { x: lx, y: 0.55, z: sd * 0.506, ry: sd < 0 ? Math.PI : 0, color: '#3d2a24', mat: M.smooth });
          const lit = rng.chance(0.6);
          b.quad(0.16, 0.24, { x: lx, y: 1.0, z: sd * 0.506, ry: sd < 0 ? Math.PI : 0, color: lit ? C.lamp : '#3d3430', mat: lit ? M.glow : M.smooth, glow: 1.6 });
          b.box(0.24, 0.03, 0.08, { x: lx, y: 0.86, z: sd * 0.54, color: '#f7efe2', mat: M.smooth }); // balconette
        }
        b.box(w + 0.02, 0.06, 0.04, { y: 0.72, z: sd * 0.51, color: C.gold, mat: M.smooth }); // string course
      }
      // little domed belvedere on some roofs
      if ((i + k) % 2 === 0) { b.cyl(0.25, 0.25, 0.3, { y: h + 0.08, color: wall, seg: 10 }); b.dome(0.26, { y: h + 0.38, color: C.gold, mat: M.metal, seg: 12 }); }
      b.pop();
    }
    // gem stalls on the inner half of the facet
    const am = (a0 + a1) / 2;
    for (const off of [-0.17, 0.17]) {
      const a = am + off;
      const rr = RINGS.market[0] + 0.75;
      const x = Math.cos(a) * rr, z = Math.sin(a) * rr;
      const ry = Math.PI / 2 - am;
      b.push({ x, y: LAND, z, ry });
      b.box(0.75, 0.35, 0.35, { color: '#5a2f3a', mat: M.wood });
      b.box(0.8, 0.03, 0.4, { y: 0.35, color: '#2c1c3a', mat: M.cloth }); // velvet
      for (let s = 0; s < 5; s++) { const c = (i * 2 + s) % 4; b.box(0.84 / 5, 0.03, 0.62, { x: -0.42 + (s + 0.5) * 0.84 / 5, y: 0.95, z: -0.05, rx: 0.3, color: s % 2 ? '#f6efe2' : [accent, '#2f6377', '#7a3a8a', '#c9a35b'][c], mat: M.cloth }); }
      for (const dx of [-0.38, 0.38]) b.cyl(0.02, 0.02, 0.95, { x: dx, z: -0.22, color: '#4d3426', seg: 4 });
      // the stones themselves: faceted, in jewel colours
      const names = Object.keys(GEMS);
      for (let s = 0; s < 6; s++) {
        const gname = names[(i * 3 + s) % names.length];
        const geo = s % 2 ? OCTA : DODE;
        b.geo(geo, { x: -0.3 + s * 0.12, y: 0.42, z: -0.05 + (s % 2) * 0.08, s: rng.range(0.6, 1.1), ry: rng() * 3, rx: rng() * 2, color: GEMS[gname], mat: GEM });
      }
      // banded agate slices on stands
      b.geo(new THREE.CylinderGeometry(0.12, 0.12, 0.02, 14).rotateX(Math.PI / 2), { x: 0.25, y: 0.55, z: 0.1, color: '#d8743e', mat: M.smooth });
      b.geo(new THREE.CylinderGeometry(0.08, 0.08, 0.025, 14).rotateX(Math.PI / 2), { x: 0.25, y: 0.55, z: 0.105, color: '#f3e0c8', mat: M.smooth });
      b.geo(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 14).rotateX(Math.PI / 2), { x: 0.25, y: 0.55, z: 0.11, color: '#a8402e', mat: M.smooth });
      // merchant and a customer
      b.cone(0.08, 0.27, { z: 0.35, color: rng.pick(['#5a2f3a', '#2f3a5a', '#7a5a2a']), seg: 6 });
      b.sphere(0.05, { z: 0.35, y: 0.31, color: '#d7b08c', seg: 6 });
      b.cyl(0.06, 0.06, 0.06, { z: 0.35, y: 0.36, color: '#f6efe2', seg: 8 });
      b.cone(0.08, 0.27, { z: -0.55, x: 0.15, color: rng.pick(['#e07186', '#f3d36b', '#4fbcae', '#f6efe2']), seg: 6 });
      b.sphere(0.05, { z: -0.55, x: 0.15, y: 0.31, color: '#d7b08c', seg: 6 });
      b.pop();
    }
  }
  // pheasant roasting over cherrywood
  const FIRE = (() => { const a = 3 * Math.PI / 8 * 0 + 0.2, r = midM; return [Math.cos(a) * r, Math.sin(a) * r]; })();
  {
    const [x, z] = FIRE;
    b.cyl(0.32, 0.36, 0.15, { x, y: LAND, z, color: '#55575c', mat: M.rough_metal, seg: 10 });
    for (let k = 0; k < 6; k++) b.rod([x + Math.cos(k) * 0.25, LAND + 0.17, z + Math.sin(k) * 0.25], [x - Math.cos(k) * 0.25, LAND + 0.2, z - Math.sin(k) * 0.25], 0.035, { color: '#8a3a2a', mat: M.wood });
    for (const s of [-1, 1]) b.rod([x + s * 0.4, LAND, z], [x + s * 0.4, LAND + 0.6, z], 0.02, { color: '#3a3330' });
    b.rod([x - 0.45, LAND + 0.58, z], [x + 0.45, LAND + 0.58, z], 0.015, { color: '#3a3330' });
    b.geo(new THREE.SphereGeometry(0.12, 10, 8), { x, y: LAND + 0.55, z, sx: 1.4, color: '#9a5a2a', mat: M.smooth });
    b.cone(0.05, 0.25, { x: x - 0.22, y: LAND + 0.55, z, rz: Math.PI / 2 + 0.3, color: '#6a3a1a', seg: 5 }); // tail feathers
  }
  const fire = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 0), glowMat('#ff7a2a', 3));
  fire.position.set(FIRE[0], LAND + 0.28, FIRE[1]);
  object.add(fire);

  /* ------------------------------- the outer ring: stone-cutters' workshops */
  const wheels = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + 0.2;
    // keep clear of the bridge landings
    const nearest = Math.round(a / (Math.PI / 4)) * (Math.PI / 4);
    if (Math.abs(a - nearest) < 0.14) continue;
    const r = 7.9;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    const ry = Math.PI / 2 - a;
    b.push({ x, y: LAND, z, ry });
    // a low open shed, its back to the outer wall
    b.box(1.5, 1.0, 0.08, { z: 0.6, color: '#b5a088' });
    for (const s of [-1, 1]) b.box(0.08, 1.0, 1.2, { x: s * 0.75, color: '#b5a088' });
    for (let m = 0; m < 6; m++) b.box(1.7 / 6, 0.03, 0.75, { x: -0.85 + (m + 0.5) * 1.7 / 6, y: 1.02, z: 0.25, rx: -0.25, color: m % 2 ? '#f6efe2' : '#8a3a4a', mat: M.cloth });
    // the bench, the cutter bent over his wheel
    b.box(0.6, 0.35, 0.3, { x: -0.2, z: 0.1, color: '#6b4a32', mat: M.wood });
    b.cone(0.09, 0.22, { x: -0.2, z: -0.25, color: '#6a5d4d', seg: 6 });
    b.sphere(0.05, { x: -0.2, y: 0.25, z: -0.18, color: '#c49a7a', seg: 6 });
    // heaps of rough stone and finished gems
    for (let k = 0; k < 6; k++) b.geo(new THREE.IcosahedronGeometry(0.08, 0), { x: 0.35 + rng.range(-0.15, 0.15), y: 0.06 + k * 0.02, z: 0.25 + rng.range(-0.15, 0.15), color: rng.pick(['#8a7f74', '#a59482', '#6c625a']), mat: M.flat });
    b.geo(OCTA, { x: 0.45, y: 0.15, z: -0.1, s: 0.9, color: rng.pick(Object.values(GEMS)), mat: GEM });
    b.pop();
    const lx = -0.2, ly = 0.42, lz = 0.1;
    wheels.push([x + Math.cos(ry) * lx + Math.sin(ry) * lz, LAND + ly, z - Math.sin(ry) * lx + Math.cos(ry) * lz, ry]);
  }
  // tall houses on the very rim: the city's outer wall, with no way out
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    const r = 9.3;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    const h = 0.8 + (i % 3) * 0.25 + rng.range(0, 0.2);
    b.box(1.45, h, 0.75, { x, y: LAND, z, ry: Math.PI / 2 - a, color: rng.pick(['#e2c9b0', '#d9bca2', '#e8d2bc', '#cfb193']) });
    b.box(1.5, 0.12, 0.8, { x, y: LAND + h, z, ry: Math.PI / 2 - a, color: '#c26a43', mat: M.flat });
    const lit = rng.chance(0.5);
    b.quad(0.16, 0.24, { x: Math.cos(a) * (r - 0.38), y: LAND + h - 0.5, z: Math.sin(a) * (r - 0.38), ry: -Math.PI / 2 - a, color: lit ? C.lamp : '#3d3430', mat: lit ? M.glow : M.smooth, glow: 1.4 });
  }

  /* ------------------------------------------ the kite flyers on the rooftops */
  const KITES = 8;
  const anchors = [];
  for (let i = 0; i < KITES; i++) {
    const a = (i / KITES) * Math.PI * 2 + 0.55;
    const ringPick = i % 3;
    const r = ringPick === 0 ? midM - 0.2 : ringPick === 1 ? 7.2 : 1.9;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    // the flyer
    b.cone(0.08, 0.27, { x, y: LAND, z, color: ['#e07186', '#f3d36b', '#4fbcae', '#f6efe2'][i % 4], seg: 6 });
    b.sphere(0.05, { x, y: LAND + 0.31, z, color: '#d7b08c', seg: 6 });
    anchors.push({ x, y: LAND + 0.35, z, a, h: rng.range(7.5, 10.5), r: r + rng.range(0.5, 2.5), ph: rng() * 6 });
  }

  object.add(b.build());

  // the central chrysoprase (animated slow turn, softly lit)
  const crown = new THREE.Group();
  {
    const cb = new Builder();
    cb.geo(new THREE.OctahedronGeometry(0.55, 0), { sy: 1.35, color: GEMS.chrysoprase, mat: GEM });
    cb.geo(new THREE.OctahedronGeometry(0.25, 0), { sy: 1.35, color: '#c8ffe0', mat: M.glow, glow: 1.4 });
    crown.add(cb.build({ shadows: false }));
    crown.position.set(0, LAND + 2.4 + 0.75, 0);
    object.add(crown);
  }

  /* ------------------------------------------------ grinding wheels (instanced) */
  const wheelMesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.14, 0.14, 0.04, 10).rotateZ(Math.PI / 2), solid('#9a958c', { roughness: 0.6 }), wheels.length);
  const sparks = new THREE.InstancedMesh(new THREE.SphereGeometry(0.02, 4, 3), glowMat('#ffd27a', 6), wheels.length * 4);
  object.add(wheelMesh, sparks);

  /* --------------------------------------------------------- kites (instanced) */
  const kiteGeo = (() => {
    const g = new THREE.BufferGeometry();
    // a diamond with a slight bend (two faces) — double sided cloth
    const v = [0, 0.75, 0, -0.42, 0, 0.06, 0, -0.55, 0, 0, 0.75, 0, 0, -0.55, 0, 0.42, 0, 0.06];
    g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
    g.computeVertexNormals();
    return g;
  })();
  const kiteMat = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.9, emissive: '#221010' });
  const kites = new THREE.InstancedMesh(kiteGeo, kiteMat, KITES);
  const TAIL = 7;
  const bows = new THREE.InstancedMesh(new THREE.BoxGeometry(0.26, 0.12, 0.02), solid('#ffffff', { side: THREE.DoubleSide, roughness: 0.9 }), KITES * TAIL);
  const kcol = ['#c8402e', '#f0c24a', '#3b5fbf', '#6fd19a', '#e07186', '#9b6ad0', '#f6efe2', '#d8743e'];
  const _c = new THREE.Color();
  for (let i = 0; i < KITES; i++) {
    kites.setColorAt(i, _c.set(kcol[i]));
    for (let k = 0; k < TAIL; k++) bows.setColorAt(i * TAIL + k, _c.set(k % 2 ? '#f6efe2' : kcol[(i + 3) % KITES]));
  }
  object.add(kites, bows);
  const SEG = 8;
  const strPos = new Float32Array(KITES * SEG * 2 * 3);
  const strGeo = new THREE.BufferGeometry();
  strGeo.setAttribute('position', new THREE.BufferAttribute(strPos, 3));
  const strings = new THREE.LineSegments(strGeo, new THREE.LineBasicMaterial({ color: '#f6efe2', transparent: true, opacity: 0.55 }));
  strings.frustumCulled = false;
  object.add(strings);

  const _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(1, 1, 1), _e = new THREE.Euler();
  const kp = new Float32Array(KITES * 3);

  return {
    object,
    update(t) {
      for (let i = 0; i < KITES; i++) {
        const A = anchors[i];
        const sw = Math.sin(t * 0.35 + A.ph), sw2 = Math.sin(t * 0.53 + A.ph * 1.7);
        const a = A.a + sw * 0.12;
        const kx = Math.cos(a) * (A.r + 1.5) + sw2 * 0.4, kz = Math.sin(a) * (A.r + 1.5);
        const ky = A.h + Math.sin(t * 0.7 + A.ph) * 0.5;
        kp[i * 3] = kx; kp[i * 3 + 1] = ky; kp[i * 3 + 2] = kz;
        _e.set(-0.5 + sw2 * 0.1, -a + Math.PI / 2, sw * 0.35, 'YXZ');
        _q.setFromEuler(_e);
        _p.set(kx, ky, kz);
        _s.setScalar(1.9);
        kites.setMatrixAt(i, _m.compose(_p, _q, _s));
        // the tail: bows hanging in a lazy wave below
        for (let k = 0; k < TAIL; k++) {
          const f = (k + 1) / TAIL;
          _p.set(kx + Math.sin(t * 1.6 + k * 0.7 + A.ph) * 0.18 * f, ky - 1.0 - k * 0.3, kz + Math.cos(t * 1.3 + k * 0.6) * 0.1 * f);
          _q.setFromEuler(_e.set(0, -a + Math.sin(t * 2 + k) * 0.6, 0));
          _s.setScalar(1);
          bows.setMatrixAt(i * TAIL + k, _m.compose(_p, _q, _s));
        }
        // string from the flyer's hand, sagging
        for (let k = 0; k < SEG; k++) {
          for (let e = 0; e < 2; e++) {
            const u = (k + e) / SEG;
            const o = (i * SEG * 2 + k * 2 + e) * 3;
            strPos[o] = A.x + (kx - A.x) * u;
            strPos[o + 1] = A.y + (ky - 0.5 - A.y) * u - Math.sin(Math.PI * u) * 1.2;
            strPos[o + 2] = A.z + (kz - A.z) * u;
          }
        }
      }
      kites.instanceMatrix.needsUpdate = true;
      bows.instanceMatrix.needsUpdate = true;
      strGeo.attributes.position.needsUpdate = true;
      // wheels turn, sparks fly — the work never stops
      for (let i = 0; i < wheels.length; i++) {
        const [x, y, z, ry] = wheels[i];
        _q.setFromEuler(_e.set(t * 6 + i, ry, 0, 'YXZ'));
        _p.set(x, y, z);
        _s.setScalar(1);
        wheelMesh.setMatrixAt(i, _m.compose(_p, _q, _s));
        for (let k = 0; k < 4; k++) {
          const u = (t * 1.7 + k / 4 + i * 0.37) % 1;
          _p.set(x + Math.sin(ry) * -0.1 - Math.cos(ry) * (u * 0.25), y + 0.12 + u * 0.15 - u * u * 0.3, z + Math.cos(ry) * -0.1 + Math.sin(ry) * (u * 0.25));
          _q.identity();
          _s.setScalar(1 - u);
          sparks.setMatrixAt(i * 4 + k, _m.compose(_p, _q, _s));
        }
      }
      wheelMesh.instanceMatrix.needsUpdate = true;
      sparks.instanceMatrix.needsUpdate = true;
      crown.rotation.y = t * 0.25;
      fire.scale.setScalar(0.85 + 0.2 * Math.sin(t * 9) * Math.sin(t * 5.3));
    },
  };
}

const OCTA = new THREE.OctahedronGeometry(0.06, 0).scale(1, 1.3, 1);
const DODE = new THREE.DodecahedronGeometry(0.055, 0);
