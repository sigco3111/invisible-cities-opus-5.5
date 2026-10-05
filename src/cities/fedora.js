// Fedora — at the heart of the grey stone metropolis stands a metal building where, in
// every room, a crystal globe holds a little blue city: the Fedora someone once imagined
// and never built. Here the globes have risen out of the museum and drift slowly above
// it — each a different, impossible Fedora — while the real one stays grey below.
import { THREE, Builder, M, C, windows } from '../kit.js';

const IRON = new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0.55, roughness: 0.45 });
const BLUE = '#78acff';

export default function build({ rng, accent }) {
  const b = new Builder();
  const object = new THREE.Group();

  /* ------------------------------------------------------ the grey metropolis */
  b.cyl(10.45, 10.5, 0.1, { color: '#6c6e73', mat: M.stone, seg: 64 });
  b.cyl(4.1, 4.1, 0.02, { y: 0.1, color: '#8a8c90', mat: M.smooth, seg: 48 }); // museum square
  for (let i = 0; i < 24; i++) { // paving rays in the square
    const a = (i / 24) * Math.PI * 2;
    b.box(1.3, 0.01, 0.04, { x: Math.cos(a) * 3.4, y: 0.12, z: Math.sin(a) * 3.4, ry: -a, color: '#6c6e73', mat: M.smooth });
  }
  const AVE = 6; // radial avenues
  const onAve = (x, z) => {
    const a = Math.atan2(z, x), r = Math.hypot(x, z);
    for (let i = 0; i < AVE; i++) {
      const s = (i / AVE) * Math.PI * 2 + 0.3;
      const d = Math.abs(((a - s + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
      if (Math.sin(d) * r < 0.65 && Math.cos(d) > 0) return true;
    }
    return Math.abs(r - 6.6) < 0.45; // ring boulevard
  };
  const greys = ['#8d8f94', '#7a7c82', '#9a9b9e', '#6e7075', '#a4a29c', '#85827c', '#5f6166'];
  const lots = [];
  for (let t = 0; t < 9000 && lots.length < 90; t++) {
    const [x, z] = rng.inDisc(10.0, 4.5);
    const w = rng.range(0.7, 1.4), d = rng.range(0.7, 1.3);
    const rad = Math.max(w, d) * 0.62;
    if (onAve(x, z)) continue;
    if (Math.hypot(x, z) + rad > 10.2) continue;
    if (lots.some((o) => Math.hypot(o.x - x, o.z - z) < rad + o.rad + 0.12)) continue;
    lots.push({ x, z, w, d, rad });
  }
  for (const p of lots) {
    const r = Math.hypot(p.x, p.z);
    const ry = -Math.atan2(p.z, p.x);
    const h = rng.range(0.9, 1.9) + Math.max(0, r - 5) * rng.range(0.1, 0.45) + (rng.chance(0.07) && r > 7 ? 2.5 : 0);
    const col = rng.pick(greys);
    b.box(p.w, h, p.d, { x: p.x, y: 0.1, z: p.z, ry, color: col });
    b.box(p.w + 0.06, 0.07, p.d + 0.06, { x: p.x, y: 0.1 + h, z: p.z, ry, color: '#55575c', mat: M.smooth });
    windows(b, { x: p.x, y: 0.1, z: p.z, w: p.w, d: p.d, h, ry, lit: 0.18, r: rng, size: 0.13, floorH: 0.55, dark: '#3c3e44' });
    // rooftop clutter: chimneys, tanks, cornices
    if (rng.chance(0.5)) b.box(0.14, 0.4, 0.14, { x: p.x + rng.range(-0.2, 0.2), y: 0.17 + h, z: p.z + rng.range(-0.2, 0.2), color: '#4f5156' });
    if (rng.chance(0.25)) { b.cyl(0.16, 0.16, 0.3, { x: p.x, y: 0.4 + h, z: p.z, color: '#6a5a4a', mat: M.wood, seg: 8 }); for (let k = 0; k < 3; k++) b.rod([p.x + Math.cos(k * 2) * 0.12, 0.17 + h, p.z + Math.sin(k * 2) * 0.12], [p.x + Math.cos(k * 2) * 0.12, 0.42 + h, p.z + Math.sin(k * 2) * 0.12], 0.01, { color: '#3a3c42' }); }
  }
  // gas lamps along the avenues
  for (let i = 0; i < AVE; i++) {
    const a = (i / AVE) * Math.PI * 2 + 0.3;
    for (const r of [5.0, 8.2]) {
      for (const s of [-1, 1]) {
        const x = Math.cos(a) * r - Math.sin(a) * s * 0.5, z = Math.sin(a) * r + Math.cos(a) * s * 0.5;
        b.cyl(0.02, 0.03, 0.9, { x, y: 0.1, z, color: '#2e3035', seg: 5 });
        b.sphere(0.05, { x, y: 1.03, z, color: C.lamp, mat: M.glow, glow: 2.5, seg: 6 });
      }
    }
  }

  /* --------------------------------------------------------- the metal museum */
  const R = 2.5, H = 2.6;
  b.cyl(R + 0.5, R + 0.6, 0.25, { y: 0.1, color: '#a4a29c', mat: M.smooth, seg: 32 });
  for (let k = 0; k < 4; k++) b.cyl(R + 0.5 + 0.25 * (k + 1), R + 0.5 + 0.25 * (k + 1), 0.06 * (4 - k), { y: 0.1, color: '#9a9894', mat: M.smooth, seg: 32 });
  b.cyl(R, R, H, { y: 0.35, mat: IRON, color: '#6d727a', seg: 32 });
  // tall arched windows, warmly lit — rooms inside
  const NW = 16;
  for (let i = 0; i < NW; i++) {
    const a = (i / NW) * Math.PI * 2;
    const x = Math.cos(a) * (R + 0.012), z = Math.sin(a) * (R + 0.012);
    b.quad(0.42, 1.3, { x, y: 1.35, z, ry: Math.PI / 2 - a, color: i % 3 === 0 ? '#9fc4ff' : C.lamp, mat: M.glow, glow: i % 3 === 0 ? 1.2 : 1.0 });
    b.geo(new THREE.CircleGeometry(0.21, 10, 0, Math.PI), { x, y: 2.0, z, ry: Math.PI / 2 - a, color: C.lamp, mat: M.glow, glow: 1.0 });
    // iron pilasters between windows
    const a2 = a + Math.PI / NW;
    b.box(0.14, H, 0.12, { x: Math.cos(a2) * (R + 0.04), y: 0.35, z: Math.sin(a2) * (R + 0.04), ry: Math.PI / 2 - a2, mat: IRON, color: '#4f545b' });
  }
  b.cyl(R + 0.2, R + 0.12, 0.25, { y: 0.35 + H, mat: IRON, color: '#4f545b', seg: 32 });
  // a ribbed iron-and-glass dome
  const DY = 0.6 + H;
  b.dome(R - 0.05, { y: DY, mat: M.glass, color: '#cfe0ff', seg: 32, hseg: 12 });
  const ribs = 16;
  for (let i = 0; i < ribs; i++) {
    const a = (i / ribs) * Math.PI * 2;
    const pts = [];
    for (let k = 0; k <= 8; k++) { const p = (k / 8) * Math.PI / 2; pts.push([Math.cos(a) * R * Math.cos(p), DY + R * Math.sin(p), Math.sin(a) * R * Math.cos(p)]); }
    b.tube(pts, 0.04, { mat: IRON, color: '#3e4249', tseg: 16, rseg: 4 });
  }
  for (const f of [0.35, 0.7]) b.torus(R * Math.cos(f * Math.PI / 2), 0.035, { y: DY + R * Math.sin(f * Math.PI / 2), rx: Math.PI / 2, mat: IRON, color: '#3e4249', tseg: 40, rseg: 4 });
  b.cyl(0.35, 0.4, 0.5, { y: DY + R - 0.05, mat: IRON, color: '#4f545b', seg: 12 });
  b.cone(0.45, 0.6, { y: DY + R + 0.45, mat: IRON, color: '#4f545b', seg: 12 });
  b.sphere(0.12, { y: DY + R + 1.12, color: BLUE, mat: M.glow, glow: 2.0, seg: 10 });
  // inside, under the glass: a room of pedestals, each with its small globe
  b.cyl(R - 0.1, R - 0.1, 0.05, { y: DY - 0.02, color: '#c9b79a', mat: M.wood, seg: 32 });
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2, r = i === 0 ? 0 : 1.4;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    b.cyl(0.12, 0.15, 0.5, { x, y: DY, z, color: '#f1e8d8', mat: M.smooth, seg: 10 });
    b.sphere(0.24, { x, y: DY + 0.74, z, mat: M.glass, color: '#e6f0ff', seg: 14 });
    b.sphere(0.07, { x, y: DY + 0.62, z, mat: M.glow, color: BLUE, glow: 1.8, seg: 6 });
  }
  // four portals with iron canopies on the avenues
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.3;
    b.push({ x: Math.cos(a) * (R + 0.3), y: 0.35, z: Math.sin(a) * (R + 0.3), ry: Math.PI / 2 - a });
    b.box(0.9, 1.5, 0.3, { mat: IRON, color: '#4f545b' });
    b.quad(0.6, 1.1, { y: 0.55, z: 0.155, color: C.lamp, mat: M.glow, glow: 1.4 });
    b.box(1.3, 0.06, 0.8, { y: 1.55, z: 0.3, rx: 0.1, mat: M.glass, color: '#e6f0ff' });
    b.pop();
  }
  // visitors in the square, looking up
  for (let i = 0; i < 18; i++) {
    const [x, z] = rng.inDisc(3.9, 3.15);
    b.cone(0.075, 0.26, { x, y: 0.12, z, color: rng.pick(['#3d3f45', '#55575c', '#2b2b30', '#6a6c70', accent]), seg: 6 });
    b.sphere(0.045, { x, y: 0.4, z, color: '#d7b08c', seg: 6 });
  }

  object.add(b.build());

  /* ------------------------------------- the crystal globes, risen and drifting */
  const variants = [towersCity, domesCity, zigguratCity, canalCity, spiralCity, gridCity, orbCity, viaductCity];
  const carousels = [new THREE.Group(), new THREE.Group()];
  const N = 8;
  for (let i = 0; i < N; i++) {
    const ring = i % 2;
    const cb = new Builder();
    const r = 1.1;
    // the mini city (lit from inside, blue)
    cb.cyl(r * 0.78, r * 0.78, 0.04, { y: -r * 0.45, color: '#3a5a9a', mat: M.glow, glow: 0.7, seg: 24 });
    variants[i](cb, r * 0.7, -r * 0.41, rng);
    // the crystal
    cb.sphere(r, { mat: M.glass, color: '#eaf3ff', seg: 24, hseg: 16 });
    // brass collar, as if lifted from its pedestal
    cb.torus(r * 0.82, 0.04, { y: -r * 0.57, rx: Math.PI / 2, color: '#c9a35b', mat: M.metal, tseg: 28, rseg: 4 });
    cb.cyl(0.25, 0.32, 0.18, { y: -r - 0.1, color: '#c9a35b', mat: M.metal, seg: 14 });
    const g = cb.build({ shadows: false });
    const a = (Math.floor(i / 2) / (N / 2)) * Math.PI * 2 + ring * 0.6;
    const rr = ring ? 5.4 : 3.6;
    g.position.set(Math.cos(a) * rr, ring ? 9.2 : 7.4, Math.sin(a) * rr);
    g.userData.base = g.position.y;
    g.userData.ph = i * 1.3;
    carousels[ring].add(g);
  }
  object.add(...carousels);
  // an extra great globe crowning the museum, the newest assumption
  const crown = new THREE.Group();
  {
    const cb = new Builder();
    const r = 1.35;
    cb.cyl(r * 0.78, r * 0.78, 0.05, { y: -r * 0.45, color: '#3a5a9a', mat: M.glow, glow: 0.7, seg: 28 });
    fedoraMini(cb, r * 0.72, -r * 0.42);
    cb.sphere(r, { mat: M.glass, color: '#eaf3ff', seg: 28, hseg: 18 });
    cb.torus(r * 0.82, 0.05, { y: -r * 0.57, rx: Math.PI / 2, color: '#c9a35b', mat: M.metal, tseg: 32, rseg: 4 });
    crown.add(cb.build({ shadows: false }));
    crown.position.set(0, DY + R + 3.2, 0);
    object.add(crown);
  }

  return {
    object,
    update(t) {
      carousels[0].rotation.y = t * 0.035;
      carousels[1].rotation.y = -t * 0.025 + 0.4;
      for (const c of carousels) for (const g of c.children) {
        g.position.y = g.userData.base + Math.sin(t * 0.4 + g.userData.ph) * 0.35;
        g.rotation.y = t * 0.12 + g.userData.ph;
      }
      crown.position.y = DY + R + 3.2 + Math.sin(t * 0.3) * 0.2;
      crown.rotation.y = -t * 0.08;
    },
  };
}

/* ---- the little blue cities: every one a different Fedora that never was ---- */
const G = (glow = 1.2) => ({ mat: M.glow, color: BLUE, glow });
function towersCity(b, R, y) {
  for (let i = 0; i < 9; i++) { const a = i * 2.4, r = (i / 9) * R * 0.85; b.box(0.08, 0.2 + ((i * 7) % 5) * 0.12, 0.08, { x: Math.cos(a) * r, y, z: Math.sin(a) * r, ...G(1.0 + (i % 3) * 0.2) }); }
}
function domesCity(b, R, y) {
  b.dome(0.25, { y, ...G(0.9), seg: 14, hseg: 6 });
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; b.dome(0.11, { x: Math.cos(a) * R * 0.7, y, z: Math.sin(a) * R * 0.7, ...G(1.3), seg: 10, hseg: 5 }); }
}
function zigguratCity(b, R, y) {
  for (let k = 0; k < 5; k++) b.box(R * 1.1 - k * 0.18, 0.08, R * 1.1 - k * 0.18, { y: y + k * 0.08, ry: k * 0.12, ...G(0.8 + k * 0.15) });
  b.box(0.04, 0.3, 0.04, { y: y + 0.4, ...G(2) });
}
function canalCity(b, R, y) {
  for (const r of [0.15, 0.32, 0.49]) b.torus(r, 0.02, { y: y + 0.02, rx: Math.PI / 2, ...G(1.3), tseg: 28, rseg: 3 });
  for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; b.box(0.06, 0.12, 0.06, { x: Math.cos(a) * 0.4, y, z: Math.sin(a) * 0.4, ...G(1.0) }); }
}
function spiralCity(b, R, y) {
  for (let i = 0; i < 26; i++) { const t = i / 26, a = t * Math.PI * 5; b.box(0.06, 0.05 + t * 0.4, 0.06, { x: Math.cos(a) * (R - t * R * 0.9), y, z: Math.sin(a) * (R - t * R * 0.9), ...G(0.9 + t) }); }
}
function gridCity(b, R, y) {
  for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) { if (i * i + j * j > 10) continue; b.box(0.07, 0.06 + ((i + 3) * (j + 5) % 4) * 0.05, 0.07, { x: i * 0.13, y, z: j * 0.13, ...G(1.0) }); }
}
function orbCity(b, R, y) {
  b.sphere(0.2, { y: y + 0.24, ...G(1.1), seg: 12 });
  b.torus(0.32, 0.012, { y: y + 0.24, rx: 1.2, ...G(1.6), tseg: 28, rseg: 3 });
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; b.cyl(0.015, 0.015, 0.14, { x: Math.cos(a) * 0.45, y, z: Math.sin(a) * 0.45, ...G(1.2), seg: 4 }); }
}
function viaductCity(b, R, y) {
  for (let i = 0; i < 7; i++) { const x = -0.45 + i * 0.15; b.box(0.03, 0.2, 0.03, { x, y, ...G(1.0) }); }
  b.box(1.0, 0.03, 0.06, { y: y + 0.2, ...G(1.4) });
  for (let i = 0; i < 5; i++) b.box(0.08, 0.1 + i * 0.03, 0.08, { x: -0.3 + i * 0.15, y, z: 0.3, ...G(0.9) });
}
function fedoraMini(b, R, y) {
  // the grey city itself, as someone once dreamed it: a ring of towers around a shining dome
  b.dome(0.28, { y, ...G(1.0), seg: 14, hseg: 6 });
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; b.box(0.07, 0.15 + (i % 4) * 0.08, 0.07, { x: Math.cos(a) * R * 0.75, y, z: Math.sin(a) * R * 0.75, ...G(1.2) }); }
  for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI * 2 + 0.4; b.box(0.04, 0.6, 0.04, { x: Math.cos(a) * 0.5, y, z: Math.sin(a) * 0.5, ...G(1.6) }); }
}
