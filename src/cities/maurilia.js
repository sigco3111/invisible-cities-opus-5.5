// Maurilia — the visitor tours the modern city while studying old postcards of how it
// used to be: a hen in the square where the bus station stands, a bandstand instead of
// the overpass, two ladies with white parasols where the munitions factory is.
// Here the grey city of today carries, superimposed, the faint sepia ghost of the old
// town; and around the rim stand the postcards themselves, low reliefs of what was.
import { THREE, Builder, M, C, glowMat, solid } from '../kit.js';

const SEPIA = '#c8a26a', SEPIA_D = '#9a7444', SEPIA_L = '#e6cfa0', CARD = '#f1e7d2';

export default function build({ rng, accent }) {
  const b = new Builder();
  const object = new THREE.Group();

  // the ghost of the old town: a translucent sepia layer that breathes
  const ghostMat = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.4, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  ghostMat.userData.noShadow = true;
  const g = new Builder();
  const G = { mat: ghostMat };

  /* ------------------------------------------------------ the modern ground */
  b.cyl(10.45, 10.5, 0.08, { color: '#8d8f92', mat: M.stone, seg: 64 });
  const road = (pts, w = 0.9) => {
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, z0] = pts[i], [x1, z1] = pts[i + 1];
      const len = Math.hypot(x1 - x0, z1 - z0);
      const ry = -Math.atan2(z1 - z0, x1 - x0);
      b.box(len + w, 0.02, w, { x: (x0 + x1) / 2, y: 0.08, z: (z0 + z1) / 2, ry, color: '#3d3f44', mat: M.smooth });
      for (let k = 0; k < len / 0.5; k++) {
        const t = (k + 0.5) / (len / 0.5);
        b.box(0.22, 0.005, 0.03, { x: x0 + (x1 - x0) * t, y: 0.101, z: z0 + (z1 - z0) * t, ry, color: '#e8d27a', mat: M.smooth });
      }
    }
  };
  road([[-9.9, 1.2], [-4, 1.4], [2, 1.0], [9.9, 0.4]]);
  road([[0.6, -9.9], [0.4, -4], [0.9, 1.1], [1.4, 9.9]], 0.8);

  /* ---------------------------------------------------- the overpass */
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-9.6, 0.1, -3.6), new THREE.Vector3(-7.2, 0.9, -2.6), new THREE.Vector3(-4.4, 1.9, -0.6),
    new THREE.Vector3(-1.0, 2.1, 2.2), new THREE.Vector3(2.8, 2.1, 3.6), new THREE.Vector3(6.4, 1.3, 4.0), new THREE.Vector3(9.0, 0.1, 4.0),
  ]);
  {
    const N = 70;
    for (let i = 0; i < N; i++) {
      const p = curve.getPointAt(i / N), q = curve.getPointAt((i + 1) / N);
      const len = p.distanceTo(q) + 0.02;
      const m = new THREE.Matrix4().lookAt(p, q, new THREE.Vector3(0, 1, 0));
      const mid = p.clone().add(q).multiplyScalar(0.5);
      b.box(1.5, 0.22, len, { matrix: m.clone().setPosition(mid), color: '#a3a39f', mat: M.smooth });
      // parapets
      for (const s of [-1, 1]) b.box(0.08, 0.2, len, { matrix: m.clone().setPosition(mid), x: s * 0.72, y: 0.22, color: '#b9b7b0', mat: M.smooth });
      if (i % 8 === 4 && p.y > 0.6) {
        b.box(0.5, p.y, 0.5, { x: p.x, y: 0.08, z: p.z, color: '#9b9a95' });
        b.box(1.5, 0.18, 0.55, { x: p.x, y: p.y - 0.18, z: p.z, ry: -Math.atan2(q.z - p.z, q.x - p.x) + Math.PI / 2, color: '#9b9a95' });
      }
      if (i % 10 === 6 && p.y > 0.8) { // lamp standards on the overpass
        b.rod([p.x, p.y + 0.2, p.z], [p.x, p.y + 1.1, p.z], 0.02, { color: '#55575c' });
        b.sphere(0.05, { x: p.x, y: p.y + 1.12, z: p.z, color: '#cfe1ff', mat: M.glow, glow: 3, seg: 6 });
      }
    }
  }

  /* ---------------------------------------------------- the bus station */
  const BS = { x: -3.8, z: 5.2 };
  {
    b.box(4.4, 0.06, 2.4, { x: BS.x, y: 0.08, z: BS.z, ry: 0.2, color: '#b3b1aa', mat: M.smooth });
    for (let i = 0; i < 5; i++) for (const dz of [-0.7, 0.7]) b.cyl(0.05, 0.05, 1.2, { x: BS.x - 1.8 + i * 0.9, y: 0.1, z: BS.z + dz, color: '#55575c', mat: M.rough_metal, seg: 6, });
    b.box(4.6, 0.08, 2.0, { x: BS.x, y: 1.3, z: BS.z, rx: 0.06, color: accent, mat: M.smooth });
    b.box(4.6, 0.02, 2.0, { x: BS.x, y: 1.24, z: BS.z, color: '#f5f5f0', mat: M.glow, glow: 0.9 });
    // buses in their bays
    const busCols = ['#e3b341', '#4c7fb0', '#e3b341'];
    for (let i = 0; i < 3; i++) {
      const x = BS.x - 1.4 + i * 1.4, z = BS.z + 1.8;
      b.box(0.55, 0.55, 1.5, { x, y: 0.14, z, color: busCols[i], mat: M.smooth });
      b.box(0.56, 0.16, 1.3, { x, y: 0.42, z: z + 0.05, color: '#2a3340', mat: M.smooth });
      b.box(0.57, 0.06, 1.52, { x, y: 0.14, z, color: '#2a2a2e' });
    }
    // waiting passengers
    for (let i = 0; i < 9; i++) {
      const x = BS.x + rng.range(-2, 2), z = BS.z + rng.range(-0.5, 0.6);
      b.cone(0.07, 0.25, { x, y: 0.14, z, color: rng.pick(['#3d4a5c', '#5c3d3d', '#7a7a70', '#2b2b30', accent]), seg: 6 });
      b.sphere(0.045, { x, y: 0.43, z, color: '#d7b08c', seg: 6 });
    }
  }

  /* ---------------------------------------------- the munitions factory */
  const FX = 4.4, FZ = -4.2;
  {
    b.box(4.4, 1.4, 3.2, { x: FX, y: 0.08, z: FZ, ry: 0.3, color: '#8a6f5c' });
    // sawtooth roof
    for (let i = 0; i < 5; i++) {
      const lx = -1.75 + i * 0.88;
      const c = Math.cos(0.3), s = Math.sin(0.3);
      b.geo(SAW, { x: FX + c * lx, y: 1.48, z: FZ - s * lx, ry: 0.3, sx: 0.88, sy: 0.6, sz: 3.2, color: '#6b6d72', mat: M.flat });
    }
    // glowing high windows along the long sides
    for (let i = 0; i < 9; i++) {
      const lx = -2 + i * 0.5, c = Math.cos(0.3), s = Math.sin(0.3);
      for (const sd of [1, -1]) b.quad(0.3, 0.35, { x: FX + c * lx + s * sd * 1.612, y: 1.0, z: FZ - s * lx + c * sd * 1.612, ry: 0.3 + (sd < 0 ? Math.PI : 0), color: '#ffb35a', mat: M.glow, glow: 1.4 });
    }
    // the chimney
    b.cyl(0.32, 0.5, 8.0, { x: FX + 1.6, y: 0.08, z: FZ - 2.3, color: '#9a5a3c', seg: 14 });
    for (let k = 1; k < 5; k++) b.torus(0.48 - k * 0.035, 0.04, { x: FX + 1.6, y: 0.08 + k * 1.6, z: FZ - 2.3, rx: Math.PI / 2, color: '#7a3e28', tseg: 18, rseg: 3 });
    b.cyl(0.38, 0.34, 0.3, { x: FX + 1.6, y: 8.08, z: FZ - 2.3, color: '#5a3020', seg: 14 });
    // tanks and a fence
    for (let k = 0; k < 3; k++) b.cyl(0.4, 0.4, 0.9, { x: FX - 2.6 + k * 0.85, y: 0.08, z: FZ - 2.4, color: '#c9c7c0', mat: M.smooth, seg: 14 });
  }

  /* -------------------------------------------------- apartment slabs */
  const busy = (x, z) => {
    if (Math.hypot(x - BS.x, z - BS.z) < 3.2) return true;
    if (Math.hypot(x - FX, z - FZ) < 3.5) return true;
    if (Math.hypot(x - (FX + 1.6), z - (FZ - 2.3)) < 1.2) return true;
    // overpass corridor
    for (let i = 0; i <= 30; i++) { const p = curve.getPointAt(i / 30); if (Math.hypot(p.x - x, p.z - z) < 1.6) return true; }
    if (Math.abs(z - 1.2) < 0.9 && Math.abs(x) < 10) return true;
    if (Math.abs(x - 0.8) < 0.8) return true;
    if (Math.hypot(x, z) > 8.0) return true; // keep the rim for the postcards
    return false;
  };
  const blocks = [];
  for (let t = 0; t < 4000 && blocks.length < 12; t++) {
    const [x, z] = rng.inDisc(8);
    const w = rng.range(1.0, 1.8), d = rng.range(0.9, 1.5);
    if (busy(x, z)) continue;
    if (blocks.some((o) => Math.hypot(o.x - x, o.z - z) < (Math.max(w, d) + Math.max(o.w, o.d)) * 0.6 + 0.3)) continue;
    blocks.push({ x, z, w, d });
  }
  for (const p of blocks) {
    const h = rng.range(1.4, 4.2);
    const col = rng.pick(['#c9c5bb', '#b7b4ad', '#d6d0c2', '#a9aaa8', '#cbb9a0']);
    b.box(p.w, h, p.d, { x: p.x, y: 0.08, z: p.z, color: col, mat: M.stone });
    // horizontal window bands (ribbon windows), some lit
    const floors = Math.floor(h / 0.55);
    for (let f = 0; f < floors; f++) {
      const y = 0.4 + f * 0.55;
      const lit = rng.chance(0.4);
      for (const sd of [1, -1]) {
        b.box(p.w * 0.9, 0.16, 0.01, { x: p.x, y: 0.08 + y, z: p.z + sd * (p.d / 2 + 0.006), color: lit ? '#ffd9a0' : '#3a4250', mat: lit ? M.glow : M.smooth, glow: 1.1 });
        b.box(0.01, 0.16, p.d * 0.85, { x: p.x + sd * (p.w / 2 + 0.006), y: 0.08 + y, z: p.z, color: lit && rng.chance(0.5) ? '#ffd9a0' : '#3a4250', mat: lit ? M.glow : M.smooth, glow: 1.1 });
      }
    }
    b.box(p.w + 0.06, 0.08, p.d + 0.06, { x: p.x, y: 0.08 + h, z: p.z, color: '#8e8f8f' });
    if (rng.chance(0.5)) b.rod([p.x + 0.2, 0.16 + h, p.z], [p.x + 0.2, 0.9 + h, p.z], 0.01, { color: '#444' }); // antenna
    if (rng.chance(0.4)) b.cyl(0.18, 0.18, 0.35, { x: p.x - p.w * 0.25, y: 0.16 + h, z: p.z, color: '#8e8f8f', seg: 8 }); // water tank
  }
  // parked cars along the roads
  for (let i = 0; i < 14; i++) {
    const x = rng.range(-8, 8);
    const z = 1.2 + (rng.chance(0.5) ? 0.62 : -0.62);
    if (Math.hypot(x, z) > 8.5 || Math.abs(x - 0.8) < 0.8) continue;
    b.box(0.5, 0.18, 0.26, { x, y: 0.1, z, color: rng.pick(['#b03a2e', '#e8e4da', '#2d4f6c', '#3a3a3e', '#d9a441']), mat: M.smooth });
    b.box(0.28, 0.12, 0.22, { x, y: 0.28, z, color: '#2a3340', mat: M.smooth });
  }

  /* ---------------------------------------- the ghost of the old provincial town */
  // 1. the square with the hen, where the bus station stands
  {
    g.cyl(2.2, 2.2, 0.02, { ...G, x: BS.x, y: 0.12, z: BS.z, color: SEPIA_L, seg: 28 });
    g.cyl(0.35, 0.38, 0.45, { ...G, x: BS.x, y: 0.12, z: BS.z, color: SEPIA, seg: 12 }); // well
    g.box(0.05, 0.6, 0.05, { ...G, x: BS.x - 0.3, y: 0.55, z: BS.z, color: SEPIA_D });
    g.box(0.05, 0.6, 0.05, { ...G, x: BS.x + 0.3, y: 0.55, z: BS.z, color: SEPIA_D });
    g.box(0.7, 0.05, 0.05, { ...G, x: BS.x, y: 1.15, z: BS.z, color: SEPIA_D });
    hen(g, BS.x + 1.0, 0.12, BS.z - 0.3, 2.2, G);
  }
  // 2. the bandstand, where the overpass now flies
  {
    const x = -1.4, z = 2.0;
    g.cyl(1.2, 1.25, 0.35, { ...G, x, y: 0.1, z, color: SEPIA, seg: 8 });
    for (let k = 0; k < 8; k++) { const q = (k / 8) * Math.PI * 2; g.cyl(0.04, 0.04, 1.5, { ...G, x: x + Math.cos(q) * 1.05, y: 0.45, z: z + Math.sin(q) * 1.05, color: SEPIA_L, seg: 5 }); }
    g.cone(1.45, 0.8, { ...G, x, y: 1.95, z, color: SEPIA, seg: 8 });
    g.sphere(0.09, { ...G, x, y: 2.8, z, color: SEPIA_L, seg: 6 });
    for (let k = 0; k < 5; k++) { const q = (k / 5) * Math.PI * 2; g.cone(0.08, 0.28, { ...G, x: x + Math.cos(q) * 0.6, y: 0.45, z: z + Math.sin(q) * 0.6, color: SEPIA_D, seg: 6 }); g.sphere(0.05, { ...G, x: x + Math.cos(q) * 0.6, y: 0.77, z: z + Math.sin(q) * 0.6, color: SEPIA_L, seg: 5 }); }
    for (const [tx, tz] of [[-3.4, 3.2], [0.8, 3.9], [-2.6, 0.2]]) ghostTree(g, tx, tz, G);
  }
  // 3. two ladies with white parasols, where the munitions factory is
  {
    g.cyl(2.2, 2.2, 0.02, { ...G, x: FX, y: 0.12, z: FZ + 1.0, color: '#b9b07a', seg: 24 });
    for (const [dx, dz, c] of [[-0.5, 1.6, SEPIA_L], [0.2, 1.8, SEPIA]]) {
      const x = FX + dx, z = FZ + dz;
      g.cone(0.3, 1.1, { ...G, x, y: 0.12, z, color: c, seg: 10 }); // long skirt
      g.cyl(0.08, 0.12, 0.35, { ...G, x, y: 1.0, z, color: c, seg: 8 });
      g.sphere(0.1, { ...G, x, y: 1.45, z, color: SEPIA_L, seg: 8 });
      g.cyl(0.13, 0.13, 0.05, { ...G, x, y: 1.55, z, color: SEPIA_D, seg: 10 }); // hat
      g.rod([x + 0.12, 1.1, z], [x + 0.18, 1.9, z], 0.012, { ...G, color: SEPIA_D });
      g.dome(0.45, { ...G, x: x + 0.18, y: 1.85, z, color: '#fff8ea', seg: 12, hseg: 5 });
    }
    for (const [tx, tz] of [[FX - 1.8, FZ + 0.3], [FX + 1.9, FZ - 0.4], [FX - 1.2, FZ - 1.6]]) ghostTree(g, tx, tz, G);
  }
  // 4. old gabled houses and a bell tower all over the modern blocks
  for (let i = 0; i < 26; i++) {
    const [x, z] = rng.inDisc(8.2, 1.0);
    if (Math.hypot(x - BS.x, z - BS.z) < 2.4 || Math.hypot(x - FX, z - (FZ + 1)) < 2.4 || Math.hypot(x + 1.4, z - 2) < 1.6) continue;
    const w = rng.range(0.8, 1.2), d = rng.range(0.8, 1.0), h = rng.range(0.9, 1.5), ry = rng() * Math.PI;
    g.box(w, h, d, { ...G, x, y: 0.1, z, ry, color: SEPIA });
    g.geo(GABLE, { ...G, x, y: 0.1 + h, z, ry, sx: w + 0.1, sy: 0.5, sz: d + 0.1, color: SEPIA_D });
  }
  {
    const x = -2.6, z = -4.6;
    g.box(1.1, 4.2, 1.1, { ...G, x, y: 0.1, z, color: SEPIA_L });
    g.geo(new THREE.ConeGeometry(0.85, 2.0, 4).rotateY(Math.PI / 4), { ...G, x, y: 4.3 + 1.0, z, color: SEPIA_D });
    g.box(2.2, 2.0, 3.0, { ...G, x: x + 0.1, y: 0.1, z: z + 2.0, color: SEPIA });
    g.geo(GABLE, { ...G, x: x + 0.1, y: 2.1, z: z + 2.0, ry: Math.PI / 2, sx: 3.1, sy: 0.9, sz: 2.3, color: SEPIA_D });
  }

  /* ----------------------------------------------- the old postcards on the rim */
  const cards = [
    { a: 0.95, scene: 'hen' }, { a: 2.15, scene: 'bandstand' }, { a: -0.35, scene: 'ladies' },
    { a: -1.6, scene: 'church' }, { a: 3.45, scene: 'harbour' },
  ];
  for (const c of cards) postcard(b, c, rng);

  object.add(b.build());
  const ghost = g.build({ shadows: false });
  object.add(ghost);

  /* ------------------------------------------------------- moving traffic */
  const NC = 10;
  const cars = new THREE.InstancedMesh(new THREE.BoxGeometry(0.42, 0.18, 0.24).translate(0, 0.09, 0), solid('#ffffff', { roughness: 0.4 }), NC);
  const lights = new THREE.InstancedMesh(new THREE.BoxGeometry(0.03, 0.05, 0.2).translate(0.22, 0.12, 0), glowMat('#fff3d0', 3), NC);
  const _c = new THREE.Color();
  for (let i = 0; i < NC; i++) cars.setColorAt(i, _c.set(['#b03a2e', '#e8e4da', '#2d4f6c', '#3a3a3e', '#d9a441'][i % 5]));
  cars.castShadow = true;
  object.add(cars, lights);
  const carData = [];
  for (let i = 0; i < NC; i++) carData.push({ u: i / NC + rng.range(0, 0.05), dir: i % 2 ? 1 : -1, lane: i % 2 ? 0.35 : -0.35, v: rng.range(0.025, 0.035) });

  /* --------------------------------------------------------- chimney smoke */
  const NS = 34;
  const smokeMat = new THREE.MeshStandardMaterial({ color: '#b9b4ad', transparent: true, opacity: 0.4, roughness: 1, depthWrite: false });
  const smoke = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.35, 1), smokeMat, NS);
  object.add(smoke);

  const _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _t = new THREE.Vector3(), _up = new THREE.Vector3(0, 1, 0);
  const CHX = FX + 1.6, CHZ = FZ - 2.3;

  return {
    object,
    update(t) {
      // the old town fades in and out, like a postcard turned toward the light
      ghostMat.opacity = 0.22 + 0.22 * (0.5 + 0.5 * Math.sin(t * 0.35));
      for (let i = 0; i < NC; i++) {
        const c = carData[i];
        let u = (c.u + t * c.v * c.dir) % 1; if (u < 0) u += 1;
        curve.getPointAt(u, _p);
        curve.getTangentAt(u, _t);
        const yaw = Math.atan2(-_t.z, _t.x) + (c.dir < 0 ? Math.PI : 0);
        _q.setFromAxisAngle(_up, yaw);
        _p.x += -_t.z * c.lane * 0; _p.y += 0.12;
        _p.x += Math.sin(yaw) * c.lane; _p.z += Math.cos(yaw) * c.lane;
        _s.set(1, 1, 1);
        _m.compose(_p, _q, _s);
        cars.setMatrixAt(i, _m);
        lights.setMatrixAt(i, _m);
      }
      cars.instanceMatrix.needsUpdate = true;
      lights.instanceMatrix.needsUpdate = true;
      for (let i = 0; i < NS; i++) {
        const age = (i / NS + t * 0.04) % 1;
        const j1 = Math.sin(i * 12.9898) * 0.5, j2 = Math.sin(i * 78.233) * 0.5;
        _p.set(CHX + age * 3.6 + j1 * age * 1.2, 8.3 + age * 2.6 + j2 * age * 0.8, CHZ + age * 1.6 + j2 * age * 1.2);
        const k = (0.6 + age * 2.4) * (1 - age * age) * (0.8 + j1 * 0.4);
        _s.set(k, k * 0.75, k);
        _q.identity();
        smoke.setMatrixAt(i, _m.compose(_p, _q, _s));
      }
      smoke.instanceMatrix.needsUpdate = true;
    },
  };
}

function hen(B, x, y, z, s, G) {
  B.push({ x, y, z, s });
  B.sphere(0.12, { ...G, y: 0.18, sx: 1.3, sz: 0.9, color: SEPIA_L, seg: 8 });
  B.sphere(0.06, { ...G, x: 0.14, y: 0.33, color: SEPIA_L, seg: 6 });
  B.cone(0.02, 0.05, { ...G, x: 0.2, y: 0.32, rz: -Math.PI / 2, color: SEPIA_D, seg: 4 });
  B.box(0.05, 0.04, 0.02, { ...G, x: 0.14, y: 0.39, color: '#b9654a' });
  B.cone(0.07, 0.16, { ...G, x: -0.15, y: 0.22, rz: 0.9, color: SEPIA, seg: 5 });
  B.rod([0.02, 0, 0], [0.02, 0.1, 0], 0.008, { ...G, color: SEPIA_D });
  B.pop();
}
function ghostTree(B, x, z, G) {
  B.cyl(0.06, 0.08, 1.0, { ...G, x, y: 0.1, z, color: SEPIA_D, seg: 6 });
  B.geo(new THREE.IcosahedronGeometry(0.65, 1), { ...G, x, y: 1.5, z, color: SEPIA, sy: 0.85 });
}

// a postcard standing on the rim, its picture in low relief, facing outward
function postcard(b, { a, scene }, rng) {
  const R = 9.15;
  const x = Math.cos(a) * R, z = Math.sin(a) * R;
  const W = 3.0, H = 2.0;
  b.push({ x, y: 0.08, z, ry: Math.PI / 2 - a });
  b.push({ s: 1.12 });
  // easel legs
  b.rod([-1.0, 0, -0.55], [-1.0, 1.2, -0.05], 0.03, { color: '#6b4a32', mat: M.wood });
  b.rod([1.0, 0, -0.55], [1.0, 1.2, -0.05], 0.03, { color: '#6b4a32', mat: M.wood });
  b.push({ y: 0.25, rx: -0.32 });
  // the card: white deckled border, sepia picture inset
  b.box(W, H, 0.04, { y: 0, color: CARD, mat: M.smooth });
  for (let i = 0; i < 24; i++) b.box(W / 24 * 0.6, 0.03, 0.04, { x: -W / 2 + (i + 0.5) * W / 24, y: H + 0.0, color: CARD, mat: M.smooth });
  const P = { mat: M.smooth };
  b.box(W - 0.3, H - 0.3, 0.01, { y: 0.15, z: 0.025, color: '#e2c99a', ...P });
  // the picture: ground + sky gradient bands
  b.box(W - 0.3, 0.45, 0.012, { y: 0.15, z: 0.03, color: '#c49a62', ...P });
  b.box(W - 0.3, 0.3, 0.012, { y: H - 0.45, z: 0.03, color: '#ead6ae', ...P });
  const r = (w, h, px, py, c = SEPIA_D, d = 0.04) => b.box(w, h, d, { x: px, y: py, z: 0.03 + d / 2, color: c, ...P });
  const ground = 0.6;
  // houses along the horizon on every card
  for (let i = 0; i < 6; i++) {
    const px = -1.2 + i * 0.48 + rng.range(-0.05, 0.05), hh = rng.range(0.25, 0.45);
    r(0.38, hh, px, ground, i % 2 ? '#b08a58' : '#a07a48', 0.02);
    b.geo(new THREE.CylinderGeometry(0, 0.27, 0.16, 4, 1).rotateY(Math.PI / 4), { x: px, y: ground + hh + 0.08, z: 0.05, sz: 0.15, color: '#8a6238', mat: M.smooth });
  }
  if (scene === 'hen') {
    b.push({ x: 0.2, y: 0.25, z: 0.1, s: 1.6 });
    b.sphere(0.12, { y: 0.18, sx: 1.3, sz: 0.5, color: '#f3e3c3', mat: M.smooth, seg: 10 });
    b.sphere(0.06, { x: 0.14, y: 0.33, sz: 0.6, color: '#f3e3c3', mat: M.smooth, seg: 8 });
    b.box(0.06, 0.05, 0.03, { x: 0.14, y: 0.4, color: '#b04a32', mat: M.smooth });
    b.cone(0.02, 0.05, { x: 0.21, y: 0.32, rz: -Math.PI / 2, color: '#d9a441', seg: 4, mat: M.smooth });
    b.cone(0.07, 0.16, { x: -0.16, y: 0.24, rz: 0.9, color: '#e9d2a8', seg: 5, mat: M.smooth });
    b.rod([0.0, 0, 0], [0.02, 0.1, 0], 0.01, { color: '#8a6238' });
    b.rod([0.06, 0, 0], [0.05, 0.1, 0], 0.01, { color: '#8a6238' });
    b.pop();
    r(0.3, 0.35, -0.7, 0.3, '#8a6238'); // the well
    r(0.4, 0.04, -0.7, 0.75, '#8a6238', 0.02);
  } else if (scene === 'bandstand') {
    r(1.1, 0.12, 0, 0.32, '#8a6238');
    for (let i = 0; i < 6; i++) r(0.03, 0.55, -0.48 + i * 0.19, 0.44, '#f3e3c3', 0.02);
    b.geo(new THREE.CylinderGeometry(0, 0.7, 0.4, 3, 1).rotateZ(0), { y: 1.2, z: 0.06, sz: 0.1, color: '#8a6238', mat: M.smooth });
    for (let i = 0; i < 4; i++) { r(0.06, 0.16, -0.3 + i * 0.2, 0.5, '#5a3c22', 0.02); }
    for (const px of [-1.1, 1.1]) { r(0.06, 0.4, px, 0.3, '#5a3c22', 0.02); b.sphere(0.25, { x: px, y: 0.85, z: 0.06, sz: 0.3, color: '#7a6a3a', mat: M.smooth, seg: 8 }); }
  } else if (scene === 'ladies') {
    for (const [px, c] of [[-0.35, '#fff8ea'], [0.3, '#f3e3c3']]) {
      b.geo(new THREE.ConeGeometry(0.2, 0.7, 10), { x: px, y: 0.62, z: 0.06, sz: 0.4, color: c, mat: M.smooth });
      b.sphere(0.07, { x: px, y: 1.05, z: 0.06, sz: 0.6, color: '#e9d2a8', mat: M.smooth, seg: 8 });
      b.rod([px + 0.1, 0.8, 0.07], [px + 0.15, 1.35, 0.07], 0.01, { color: '#5a3c22' });
      b.geo(new THREE.SphereGeometry(0.32, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2.4), { x: px + 0.15, y: 1.2, z: 0.07, sz: 0.4, color: '#ffffff', mat: M.smooth });
    }
    b.sphere(0.3, { x: 1.05, y: 0.9, z: 0.06, sz: 0.3, color: '#7a6a3a', mat: M.smooth, seg: 8 });
    r(0.05, 0.4, 1.05, 0.35, '#5a3c22', 0.02);
  } else if (scene === 'church') {
    r(0.35, 1.1, 0.5, 0.3, '#a07a48');
    b.geo(new THREE.CylinderGeometry(0, 0.25, 0.4, 4, 1).rotateY(Math.PI / 4), { x: 0.5, y: 1.6, z: 0.06, sz: 0.15, color: '#8a6238', mat: M.smooth });
    r(0.9, 0.55, 0.0, 0.3, '#b08a58');
    r(0.12, 0.25, -0.1, 0.3, '#5a3c22', 0.05);
    for (let i = 0; i < 4; i++) { const px = -1.1 + i * 0.15; b.cone(0.03, 0.12, { x: px, y: 0.3, z: 0.07, color: '#5a3c22', seg: 5 }); b.sphere(0.025, { x: px, y: 0.45, z: 0.07, color: '#e9d2a8', seg: 5 }); }
  } else {
    // the harbour: water, a sailing boat, a lighthouse
    r(W - 0.3, 0.3, 0, 0.15, '#9fb3b0', 0.015);
    b.geo(new THREE.CylinderGeometry(0, 0.3, 0.6, 3, 1), { x: -0.2, y: 0.85, z: 0.07, sz: 0.1, color: '#fff8ea', mat: M.smooth });
    r(0.6, 0.12, -0.2, 0.42, '#5a3c22');
    r(0.16, 0.9, 0.9, 0.3, '#f3e3c3');
    r(0.22, 0.12, 0.9, 1.2, '#b04a32');
  }
  // the back: a stamp and the address lines (no words — just the ruled lines)
  b.box(0.4, 0.48, 0.01, { x: 1.05, y: 1.35, z: -0.026, color: '#b04a32', mat: M.smooth });
  b.box(0.3, 0.38, 0.012, { x: 1.05, y: 1.4, z: -0.028, color: '#e7d7b6', mat: M.smooth });
  for (let i = 0; i < 4; i++) b.box(1.0, 0.015, 0.01, { x: 0.65, y: 0.35 + i * 0.22, z: -0.026, color: '#6b5a4a', mat: M.smooth });
  b.box(0.015, 1.5, 0.01, { x: 0.0, y: 0.25, z: -0.026, color: '#6b5a4a', mat: M.smooth });
  for (let i = 0; i < 5; i++) b.box(rng.range(0.4, 0.9), 0.012, 0.01, { x: -0.8 + rng.range(-0.05, 0.1), y: 0.5 + i * 0.22, z: -0.026, color: '#4a5a8a', mat: M.smooth }); // a handwritten scrawl
  b.pop();
  b.pop();
  b.pop();
}

const GABLE = (() => {
  const s = new THREE.Shape([new THREE.Vector2(-0.5, 0), new THREE.Vector2(0.5, 0), new THREE.Vector2(0, 1)]);
  const g = new THREE.ExtrudeGeometry(s, { depth: 1, bevelEnabled: false });
  g.translate(0, 0, -0.5);
  return g;
})();
// sawtooth roof profile: vertical glazed face + slope
const SAW = (() => {
  const s = new THREE.Shape([new THREE.Vector2(-0.5, 0), new THREE.Vector2(0.5, 0), new THREE.Vector2(0.5, 1)]);
  const g = new THREE.ExtrudeGeometry(s, { depth: 1, bevelEnabled: false });
  g.translate(0, 0, -0.5);
  return g;
})();
