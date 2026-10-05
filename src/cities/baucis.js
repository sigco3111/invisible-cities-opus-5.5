// Baucis — after seven days of woodland, the city cannot be seen: only slender flamingo
// legs rising far apart from the trees and vanishing into a layer of cloud. Above it, an
// angular, pierced platform of pavilions whose people never come down; leaning over the
// rails and through the holes, they study the earth through spyglasses, leaf by leaf —
// contemplating their own absence. Below, on the leaves, their pierced, angular shadow.
import { THREE, Builder, M, C, tree, person } from '../kit.js';
import { _o, _col } from './_c_util.js';

const PY = 14.6; // platform height
const CLOUD = 12.7;

export default function build({ rng, accent }) {
  const object = new THREE.Group();
  const ground = new Builder();
  const sky = new Builder(); // the elevated city: does not cast shadows (they would fall far off the plinth)

  // ---------------------------------------------------------------- the platform: an angular, pierced lattice
  // vertices of an irregular angular outline
  const NV = 7;
  const outline = [];
  for (let i = 0; i < NV; i++) {
    const a = (i / NV) * Math.PI * 2 + 0.2;
    const r = i % 2 ? 4.6 : 5.6;
    outline.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  // triangulate as a fan with an inner ring: centre + mid ring
  const inner = outline.map(([x, z]) => [x * 0.5, z * 0.5]);
  const tris = [];
  for (let i = 0; i < NV; i++) {
    const j = (i + 1) % NV;
    tris.push([[0, 0], inner[i], inner[j]]);
    tris.push([inner[i], outline[i], outline[j]]);
    tris.push([inner[i], outline[j], inner[j]]);
  }
  // which triangles are decked (solid) — the rest are holes
  const solid = tris.map((_, k) => k % 3 !== 2 && !(k === 4 || k === 13));
  const inTri = (p, [a, b2, c]) => {
    const s = (a, b3, q) => (q[0] - b3[0]) * (a[1] - b3[1]) - (a[0] - b3[0]) * (q[1] - b3[1]);
    const d1 = s(p, a, b2), d2 = s(p, b2, c), d3 = s(p, c, a);
    const neg = d1 < 0 || d2 < 0 || d3 < 0, pos = d1 > 0 || d2 > 0 || d3 > 0;
    return !(neg && pos);
  };
  const deckGeo = (tri, shrink) => {
    const cx = (tri[0][0] + tri[1][0] + tri[2][0]) / 3, cz = (tri[0][1] + tri[1][1] + tri[2][1]) / 3;
    return tri.map(([x, z]) => [cx + (x - cx) * shrink, cz + (z - cz) * shrink]);
  };
  tris.forEach((tri, k) => {
    if (!solid[k]) return;
    const pts = deckGeo(tri, 0.97);
    // ensure CCW
    const area = (pts[1][0] - pts[0][0]) * (pts[2][1] - pts[0][1]) - (pts[2][0] - pts[0][0]) * (pts[1][1] - pts[0][1]);
    if (area > 0) pts.reverse();
    sky.slab(pts, 0.14, { y: PY - 0.14, color: k % 2 ? '#e9dcc8' : '#f1e6d4' });
  });
  // the beams of the lattice (all triangle edges)
  const edges = new Set();
  for (const tri of tris) for (let e = 0; e < 3; e++) {
    const a = tri[e], c = tri[(e + 1) % 3];
    const key = [a, c].map((p) => p.map((v) => v.toFixed(2)).join(':')).sort().join('|');
    if (edges.has(key)) continue;
    edges.add(key);
    sky.beam([a[0], PY - 0.1, a[1]], [c[0], PY - 0.1, c[1]], 0.12, { color: '#c98f7a' });
  }
  // railings along the outline and around the holes
  const rail = (a, c) => {
    const n = Math.max(2, Math.round(Math.hypot(c[0] - a[0], c[1] - a[1]) / 0.3));
    for (let i = 0; i <= n; i++) sky.cyl(0.012, 0.012, 0.28, { x: a[0] + (c[0] - a[0]) * i / n, y: PY, z: a[1] + (c[1] - a[1]) * i / n, color: '#fbf6ee', seg: 4 });
    sky.beam([a[0], PY + 0.28, a[1]], [c[0], PY + 0.28, c[1]], 0.03, { color: '#fbf6ee' });
  };
  for (let i = 0; i < NV; i++) rail(outline[i], outline[(i + 1) % NV]);
  tris.forEach((tri, k) => { if (!solid[k]) for (let e = 0; e < 3; e++) rail(tri[e], tri[(e + 1) % 3]); });

  // pavilions on the solid decks
  const roofs = ['#d98a7a', '#7fa6b8', '#e3b56a', '#b8a0c8', accent];
  tris.forEach((tri, k) => {
    if (!solid[k]) return;
    const [cx, cz] = [(tri[0][0] + tri[1][0] + tri[2][0]) / 3, (tri[0][1] + tri[1][1] + tri[2][1]) / 3];
    if (Math.hypot(cx, cz) < 1.2) return;
    const h = rng.range(0.8, 1.5);
    const w = rng.range(0.6, 0.85);
    const ry = Math.atan2(cx, cz);
    sky.push({ x: cx, y: PY, z: cz, ry });
    sky.box(w, h, w * 0.85, { color: rng.pick(['#fbf3e4', '#f5e6d0', '#fff8ee', '#efe2d2']) });
    sky.prism(0.0, w * 0.82, rng.range(0.5, 0.9), 4, { y: h, ry: Math.PI / 4, color: rng.pick(roofs), mat: M.flat });
    for (const s of [-1, 1]) {
      const lit = rng.chance(0.6);
      sky.quad(0.12, 0.22, { x: s * w * 0.22, y: h * 0.55, z: w * 0.425 + 0.006, mat: lit ? M.glow : M.smooth, color: lit ? C.lamp : '#4a4038', glow: 1.8 });
    }
    sky.pop();
  });
  // a slender central tower with a lantern and pennant
  sky.cyl(0.32, 0.4, 3.4, { y: PY, color: '#fbf3e4', seg: 10 });
  sky.cyl(0.42, 0.42, 0.06, { y: PY + 2.2, color: '#c98f7a', seg: 12 });
  for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; sky.cyl(0.02, 0.02, 0.5, { x: Math.cos(a) * 0.3, y: PY + 3.4, z: Math.sin(a) * 0.3, color: '#fbf6ee', seg: 4 }); }
  sky.sphere(0.16, { y: PY + 3.65, mat: M.glow, color: C.lamp, glow: 2.4, seg: 10 });
  sky.cone(0.42, 0.9, { y: PY + 3.9, color: '#d98a7a', seg: 6, mat: M.flat });
  sky.cyl(0.015, 0.015, 0.7, { y: PY + 4.8, color: C.darkwood, seg: 4 });
  sky.box(0.4, 0.2, 0.01, { x: 0.2, y: PY + 5.25, color: accent, mat: M.cloth });

  // people leaning over the rail with spyglasses pointed down
  const spy = (x, z, outward, lean = 0.6) => {
    const ry = Math.atan2(outward[0], outward[1]);
    person(sky, { x, y: PY, z, h: 0.34, color: rng.pick(['#7fa6b8', '#d98a7a', '#e8e0d0', '#b8a0c8', '#5a6b7a']) });
    const ex = x + outward[0] * 0.05, ez = z + outward[1] * 0.05, ey = PY + 0.29;
    sky.rod([ex, ey, ez], [ex + outward[0] * 0.26 * Math.cos(lean), ey - 0.26 * Math.sin(lean), ez + outward[1] * 0.26 * Math.cos(lean)], 0.018, { color: C.gold, mat: M.metal, r2: 0.028 });
  };
  for (let i = 0; i < NV; i++) {
    const a = outline[i], c = outline[(i + 1) % NV];
    const mx = (a[0] + c[0]) / 2, mz = (a[1] + c[1]) / 2;
    const nx = mx, nz = mz; const l = Math.hypot(nx, nz);
    for (const t of [0.3, 0.62]) {
      const x = a[0] + (c[0] - a[0]) * t, z = a[1] + (c[1] - a[1]) * t;
      spy(x - nx / l * 0.15, z - nz / l * 0.15, [nx / l, nz / l], 0.7);
    }
  }
  // tripod telescopes poised over the holes (animated scanning tubes added below)
  const scopes = [];
  tris.forEach((tri, k) => {
    if (solid[k]) return;
    const [cx, cz] = [(tri[0][0] + tri[1][0] + tri[2][0]) / 3, (tri[0][1] + tri[1][1] + tri[2][1]) / 3];
    // the tripod stands at the edge of the hole, on the nearest vertex
    const v = tri[0];
    const x = v[0] + (cx - v[0]) * 0.3, z = v[1] + (cz - v[1]) * 0.3;
    for (let l = 0; l < 3; l++) { const a = l * 2.1; sky.rod([x + Math.cos(a) * 0.15, PY, z + Math.sin(a) * 0.15], [x, PY + 0.4, z], 0.01, { color: C.darkwood }); }
    scopes.push({ x, y: PY + 0.42, z, toward: Math.atan2(cx - x, cz - z), ph: rng.range(0, 6) });
    person(sky, { x: x - Math.sin(Math.atan2(cx - x, cz - z)) * 0.25, y: PY, z: z - Math.cos(Math.atan2(cx - x, cz - z)) * 0.25, h: 0.34, color: rng.pick(['#7fa6b8', '#e8e0d0', '#5a6b7a']) });
  });
  // the underside: hanging lanterns and a keel of trusses
  for (let i = 0; i < NV; i++) {
    const [x, z] = outline[i];
    sky.rod([x, PY - 0.1, z], [x * 0.5, PY - 1.0, z * 0.5], 0.04, { color: '#c98f7a' });
    sky.rod([x * 0.5, PY - 1.0, z * 0.5], [0, PY - 1.3, 0], 0.04, { color: '#c98f7a' });
  }

  // ---------------------------------------------------------------- the flamingo legs
  const legTops = [];
  for (let i = 0; i < NV; i++) legTops.push([outline[i][0] * 0.82, outline[i][1] * 0.82]);
  legTops.push([0, 0]);
  const legMat = '#e7a596';
  const legs = [];
  legTops.forEach(([x, z], i) => {
    const r = Math.hypot(x, z) || 1;
    const out = i === NV ? 0 : 1;
    const bx = x + (x / r) * 2.6 * out + rng.range(-0.4, 0.4), bz = z + (z / r) * 2.6 * out + rng.range(-0.4, 0.4);
    const kneeY = rng.range(5.5, 8.0);
    // the knee bends slightly backward like a bird's
    const kx = x + (bx - x) * 0.55 + (z / r) * 0.35 * out, kz = z + (bz - z) * 0.55 - (x / r) * 0.35 * out;
    ground.rod([bx, 0, bz], [kx, kneeY, kz], 0.075, { color: legMat, r2: 0.06, seg: 8 });
    ground.sphere(0.14, { x: kx, y: kneeY, z: kz, color: '#d88a7c', seg: 10 });
    ground.rod([kx, kneeY, kz], [x, PY - 0.1, z], 0.06, { color: legMat, r2: 0.075, seg: 8 });
    // the foot: three toes spread on the forest floor
    for (let t = 0; t < 3; t++) { const a = t * 2.1 + i; ground.rod([bx, 0.05, bz], [bx + Math.cos(a) * 0.45, 0.04, bz + Math.sin(a) * 0.45], 0.035, { color: '#d88a7c' }); }
    legs.push([bx, bz]);
  });

  // ---------------------------------------------------------------- the forest, and the pierced shadow on its leaves
  ground.cyl(10.3, 10.4, 0.14, { color: '#4a5a36', seg: 64 });
  // the shadow: the lattice projected down onto the canopy (offset a little, as if by a high sun)
  const SHX = 0.9, SHZ = 0.5;
  const inShadow = (x, z) => {
    const p = [x - SHX, z - SHZ];
    for (let k = 0; k < tris.length; k++) if (solid[k] && inTri(p, tris[k])) return true;
    // beams also shade: near any lattice edge
    return false;
  };
  const trees = [];
  for (let t = 0; t < 6000 && trees.length < 330; t++) {
    const [x, z] = rng.inDisc(10.0);
    if (legs.some(([lx, lz]) => Math.hypot(lx - x, lz - z) < 0.45)) continue;
    if (Math.abs(z - (x * 0.35 + 6.2)) < 0.35 && x > -2) continue; // a path
    if (trees.some((o) => Math.hypot(o[0] - x, o[1] - z) < 0.42)) continue;
    trees.push([x, z]);
  }
  for (const [x, z] of trees) {
    const sh = inShadow(x, z);
    const kind = rng.chance(0.25) ? 'pine' : 'round';
    const h = rng.range(1.0, 1.9);
    const leaf = sh ? rng.pick(['#26381f', '#2b3d22', '#22331c']) : rng.pick(['#6e9150', '#7da35a', '#5f8546', '#89a85e', '#8f9e4e']);
    if (kind === 'pine') {
      ground.cyl(0.04, 0.05, h * 0.3, { x, y: 0.14, z, color: C.wood, seg: 5 });
      for (let i = 0; i < 3; i++) ground.cone(h * (0.3 - i * 0.07), h * 0.4, { x, y: 0.14 + h * (0.22 + i * 0.22), z, color: sh ? '#1f3020' : rng.pick(['#3f6a3f', '#4a7444']), seg: 7, mat: M.flat });
    } else {
      ground.cyl(0.04, 0.06, h * 0.45, { x, y: 0.14, z, color: C.wood, seg: 5 });
      ground.geo(new THREE.IcosahedronGeometry(h * 0.34, 0), { x, y: 0.14 + h * 0.62, z, color: leaf, mat: M.flat, ry: rng() * 6, sy: rng.range(0.85, 1.15) });
    }
  }
  // the shadow on the forest floor, crisp between the trunks
  tris.forEach((tri, k) => {
    if (!solid[k]) return;
    const pts = tri.map(([x, z]) => [x + SHX, z + SHZ]);
    const area = (pts[1][0] - pts[0][0]) * (pts[2][1] - pts[0][1]) - (pts[2][0] - pts[0][0]) * (pts[1][1] - pts[0][1]);
    if (area > 0) pts.reverse();
    ground.slab(pts, 0.01, { y: 0.14, color: '#28331f' });
  });
  // the woodland path and the traveller who has arrived and sees nothing
  for (let i = 0; i < 14; i++) {
    const x = -2 + i * 0.85, z = x * 0.35 + 6.2;
    if (Math.hypot(x, z) > 9.9) continue;
    ground.box(0.9, 0.012, 0.42, { x, y: 0.14, z, ry: Math.atan2(1, 0.35), color: inShadow(x, z) ? '#5a4a34' : '#a08a62' });
  }
  person(ground, { x: 2.2, y: 0.15, z: 7.0, h: 0.34, color: '#8a5a3c' });
  ground.rod([2.32, 0.15, 7.0], [2.36, 0.55, 7.02], 0.012, { color: C.darkwood });

  const gb = ground.build();
  object.add(gb);
  const sb = sky.build({ shadows: false });
  sb.traverse((o) => { if (o.isMesh) o.receiveShadow = true; });
  object.add(sb);
  // the legs above the canopy should not throw long shadows across the board
  gb.traverse((o) => { if (o.isMesh) o.castShadow = false; });

  // ---------------------------------------------------------------- clouds (drifting puffs) and scanning spyglasses
  // a cloud deck: many overlapping, semi-transparent puffs in clusters, flat-bottomed and
  // billowing on top, lavender in their shadowed bellies and peach where the low sun touches them
  const puffs = [];
  const nCl = 20;
  for (let c = 0; c < nCl; c++) {
    const a = (c / nCl) * Math.PI * 2 + rng.range(-0.12, 0.12);
    const r = c % 3 === 0 ? rng.range(2.0, 4.5) : rng.range(5.0, 8.4);
    const cx = Math.cos(a) * r, cz = Math.sin(a) * r;
    const size = rng.range(1.0, 1.6);
    // flat, wide base layer
    for (let k = 0; k < 9; k++) {
      const ox = rng.gauss() * 0.75 * size, oz = rng.gauss() * 0.55 * size;
      puffs.push({ x: cx + ox, z: cz + oz, y: CLOUD - 0.25 + rng.range(-0.08, 0.08), s: rng.range(0.55, 0.85) * size, sy: 0.38, tier: 0, ph: rng.range(0, 6) });
    }
    // billows on top, smaller towards the crown
    for (let k = 0; k < 9; k++) {
      const h = rng();
      const ox = rng.gauss() * 0.5 * size * (1 - h * 0.6), oz = rng.gauss() * 0.4 * size * (1 - h * 0.6);
      puffs.push({ x: cx + ox, z: cz + oz, y: CLOUD + 0.05 + h * 0.75 * size, s: rng.range(0.32, 0.6) * size * (1 - h * 0.45), sy: 0.8, tier: 0.4 + h * 0.6, ph: rng.range(0, 6) });
    }
    // wisps trailing off
    for (let k = 0; k < 3; k++) puffs.push({ x: cx + rng.range(-2, 2), z: cz + rng.range(-1.6, 1.6), y: CLOUD - 0.1 + rng.range(-0.15, 0.25), s: rng.range(0.25, 0.45), sy: 0.35, tier: 0.3, ph: rng.range(0, 6) });
  }
  for (const p of puffs) { const r = Math.hypot(p.x, p.z); if (r > 9.4) { p.x *= 9.4 / r; p.z *= 9.4 / r; } p.a = Math.atan2(p.z, p.x); p.r = Math.hypot(p.x, p.z); }
  const NC = puffs.length;
  const cloudMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1, transparent: true, opacity: 0.36, depthWrite: false, emissive: '#8a6060', emissiveIntensity: 0.5 });
  cloudMat.userData.noShadow = true;
  const clouds = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 2), cloudMat, NC);
  clouds.frustumCulled = false;
  clouds.renderOrder = 2;
  const belly = new THREE.Color('#c8b8d4'), crown = new THREE.Color('#ffd8bc');
  puffs.forEach((p, i) => clouds.setColorAt(i, _col.copy(belly).lerp(crown, p.tier)));
  object.add(clouds);

  const tubes = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.035, 0.05, 0.5, 8).rotateX(Math.PI / 2).translate(0, 0, 0.12), M.metal, scopes.length);
  for (let i = 0; i < scopes.length; i++) tubes.setColorAt(i, _col.set(C.gold));
  // M.metal uses vertex colours: give the tube geometry a colour attribute
  {
    const g = tubes.geometry, n = g.attributes.position.count, col = new Float32Array(n * 3);
    const c = new THREE.Color(C.gold);
    for (let i = 0; i < n; i++) { col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  }
  tubes.frustumCulled = false;
  object.add(tubes);

  function update(t) {
    for (let i = 0; i < NC; i++) {
      const p = puffs[i];
      const a = p.a + t * 0.012;
      const r = Math.min(9.6, p.r);
      _o.position.set(Math.cos(a) * r, p.y + Math.sin(t * 0.3 + p.ph) * 0.12, Math.sin(a) * r);
      _o.rotation.set(0, p.ph + t * 0.02, 0);
      const s = p.s * (1 + 0.06 * Math.sin(t * 0.5 + p.ph));
      _o.scale.set(s * 1.35, s * p.sy, s);
      _o.updateMatrix();
      clouds.setMatrixAt(i, _o.matrix);
    }
    clouds.instanceMatrix.needsUpdate = true;
    scopes.forEach((sc, i) => {
      _o.position.set(sc.x, sc.y, sc.z);
      _o.rotation.set(0.9 + 0.15 * Math.sin(t * 0.21 + sc.ph), sc.toward + 0.5 * Math.sin(t * 0.13 + sc.ph), 0, 'YXZ');
      _o.scale.setScalar(1);
      _o.updateMatrix();
      tubes.setMatrixAt(i, _o.matrix);
    });
    tubes.instanceMatrix.needsUpdate = true;
    _o.rotation.order = 'XYZ';
  }
  update(0);
  return { object, update };
}
