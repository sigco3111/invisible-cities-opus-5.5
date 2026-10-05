// Trude — you land, and it is the airport you left: the same suburbs, the same green-and-yellow
// houses, the same flowerbeds in the same squares. One plane takes off, an identical one lands.
// The world is covered by one Trude without beginning or end; only the name of the airport changes
// (the sign on the terminal is blank, and keeps changing colour). In the main square stands a model
// of Trude — with its own airport, its own planes, its own square — and so on, down.
import { THREE, Builder, M, C, Lines } from '../kit.js';

export default function build({ rng, accent }) {
  const object = new THREE.Group();
  const RY = 0.38; // the runway's bearing
  const RZ = -3.7; // runway offset from centre (in the rotated frame)
  const YEL = '#f4d23e', GRN = '#4f8a3f', GRN2 = '#7fae5f', RED = '#d9534a', WALL = '#5f9a54';
  const rot = (u, v) => [u * Math.cos(RY) - v * Math.sin(RY), u * Math.sin(RY) + v * Math.cos(RY)];

  // one house lot, always the same: the module Trude is made of
  function lot(b, u, v) {
    const [x, z] = rot(u, v);
    b.push({ x, z, ry: -RY });
    b.box(1.18, 0.03, 1.18, { y: 0.1, color: GRN2 }); // lawn
    b.box(0.72, 0.55, 0.56, { x: 0, y: 0.13, z: -0.12, color: WALL, mat: M.smooth });
    b.box(0.76, 0.04, 0.6, { x: 0, y: 0.66, z: -0.12, color: '#f4f0e2', mat: M.smooth });
    b.geo(GABLE, { y: 0.7, z: -0.12, sx: 0.84, sy: 0.3, sz: 0.68, color: YEL, mat: M.flat });
    b.box(0.14, 0.26, 0.02, { x: 0.12, y: 0.13, z: 0.17, color: YEL });
    b.quad(0.13, 0.13, { x: -0.18, y: 0.45, z: 0.165, mat: M.glow, color: C.lamp, glow: 1.4 });
    b.quad(0.13, 0.13, { x: 0.18, y: 0.48, z: 0.165, color: '#2a3a46', mat: M.smooth });
    // the flowerbed: a round of red flowers ringed in white stones
    b.cyl(0.17, 0.17, 0.05, { x: -0.25, y: 0.13, z: 0.38, seg: 12, color: '#f2efe6' });
    b.cyl(0.14, 0.14, 0.07, { x: -0.25, y: 0.13, z: 0.38, seg: 12, color: RED, mat: M.flat });
    // a hedge, a little tree
    b.box(1.1, 0.12, 0.08, { y: 0.13, z: 0.55, color: '#3d6f35', mat: M.flat });
    b.cyl(0.025, 0.03, 0.22, { x: 0.38, y: 0.13, z: 0.3, color: C.wood, seg: 5 });
    b.sphere(0.13, { x: 0.38, y: 0.42, z: 0.3, color: GRN, mat: M.flat, seg: 6 });
    b.pop();
  }

  // the whole of Trude, built into builder b (any scale via b.push)
  function town(b, detail = true) {
    b.cyl(10.35, 10.4, 0.1, { seg: 72, color: '#8fae6a' });
    // runway, taxiway, apron
    const [rx, rz] = rot(0, RZ);
    const half = Math.sqrt(10.3 ** 2 - RZ ** 2) - 0.05;
    b.push({ x: rx, z: rz, ry: -RY });
    b.box(half * 2, 0.03, 1.15, { y: 0.1, color: '#4a4d54' });
    for (let u = -half + 0.6; u < half - 0.6; u += 0.9) b.box(0.45, 0.012, 0.05, { x: u, y: 0.13, color: '#f2f2ec' });
    for (const s of [-1, 1]) {
      for (let k = 0; k < 6; k++) b.box(0.6, 0.012, 0.06, { x: s * (half - 0.5), y: 0.13, z: -0.4 + k * 0.16, color: '#f2f2ec' });
    }
    b.box(half * 2 - 2, 0.025, 0.4, { y: 0.1, z: 1.3, color: '#5a5d63' }); // taxiway
    b.box(4.6, 0.025, 1.6, { x: 1.6, y: 0.1, z: 2.3, color: '#6a6d73' }); // apron
    if (detail) {
      // runway edge lights
      for (let u = -half + 0.3; u < half - 0.2; u += 0.7) {
        for (const s of [-0.62, 0.62]) b.sphere(0.035, { x: u, y: 0.14, z: s, mat: M.glow, color: '#9cc8ff', glow: 2.2, seg: 6 });
      }
    }
    // the terminal, low and long, glass front; the control tower
    b.box(3.4, 0.7, 0.9, { x: 1.6, y: 0.1, z: 3.55, color: '#e8e4da', mat: M.smooth });
    b.box(3.5, 0.08, 1.05, { x: 1.6, y: 0.8, z: 3.55, color: '#f6f3ea', mat: M.smooth });
    b.quad(3.2, 0.36, { x: 1.6, y: 0.45, z: 3.09, ry: Math.PI, mat: M.glow, color: '#ffe2b0', glow: 1.3 });
    b.cyl(0.18, 0.22, 2.0, { x: 3.6, y: 0.1, z: 3.5, seg: 12, color: '#e8e4da', mat: M.smooth });
    b.cyl(0.36, 0.3, 0.32, { x: 3.6, y: 2.1, z: 3.5, seg: 12, mat: M.glow, color: '#bfe0ff', glow: 1.2 });
    b.cyl(0.4, 0.4, 0.06, { x: 3.6, y: 2.42, z: 3.5, seg: 12, color: '#f6f3ea' });
    // the name board on the roof (left blank: only the name changes)
    b.box(0.05, 0.5, 0.05, { x: 0.8, y: 0.88, z: 3.55, color: C.charcoal });
    b.box(0.05, 0.5, 0.05, { x: 2.4, y: 0.88, z: 3.55, color: C.charcoal });
    b.pop();
    // the suburbs: the same lot, again and again, in perfect rows
    const P = 1.32;
    for (let i = -9; i <= 9; i++) {
      for (let j = -9; j <= 9; j++) {
        const u = i * P, v = j * P + 0.6;
        if (v > RZ && v < 4.9 + RZ + 1.2 && Math.abs(u - 1.6) < 3.0) continue; // terminal
        if (v < RZ + 2.9 && v > RZ - 1.0) continue; // runway & taxiway
        const [x, z] = rot(u, v);
        if (Math.hypot(x, z) > 10.1) continue; // right to the edge, and on
        // the square: same flowerbeds, a fountain, the model of Trude
        if (i >= -1 && i <= 0 && j >= 3 && j <= 4) continue;
        lot(b, u, v);
      }
    }
  }

  const SQ = rot(-0.5 * 1.32 - 0.66 + 0.66, 3.5 * 1.32 + 0.6); // the square's centre
  const b = new Builder();
  town(b);
  // the square
  b.push({ x: SQ[0], z: SQ[1], ry: -RY });
  b.box(2.5, 0.04, 2.5, { y: 0.1, color: '#e8e2d2', mat: M.smooth });
  for (const [dx, dz] of [[-1.0, -1.0], [1.0, -1.0], [-1.0, 1.0], [1.0, 1.0]]) {
    b.cyl(0.2, 0.2, 0.06, { x: dx, y: 0.13, z: dz, seg: 12, color: '#f2efe6' });
    b.cyl(0.17, 0.17, 0.08, { x: dx, y: 0.13, z: dz, seg: 12, color: RED, mat: M.flat });
  }
  b.cyl(0.98, 1.0, 0.16, { y: 0.13, seg: 40, color: '#c9c2b0' }); // the model's plinth
  b.pop();
  // the model of Trude, on its plinth in the square, and inside it another
  const MS = 0.088;
  b.push({ x: SQ[0], y: 0.29, z: SQ[1], s: MS });
  town(b, false);
  b.push({ x: SQ[0], y: 0.29 / MS, z: SQ[1], s: MS });
  town(b, false);
  b.pop();
  b.pop();
  object.add(b.build());

  /* ------------------------------------------------------- the planes -- */
  function plane() {
    const pb = new Builder();
    pb.cyl(0.11, 0.11, 1.3, { rz: Math.PI / 2, x: 0.65, y: 0, color: '#f4f2ec', mat: M.smooth, seg: 12 });
    pb.sphere(0.11, { x: 0.65, color: '#f4f2ec', mat: M.smooth, seg: 12, sx: 1.8 });
    pb.cone(0.11, 0.3, { rz: Math.PI / 2, x: -0.65, color: '#f4f2ec', mat: M.smooth, seg: 12 });
    pb.box(0.34, 0.025, 1.6, { x: 0.05, y: -0.03, color: '#e4e1d8', mat: M.smooth }); // wings
    pb.box(0.2, 0.02, 0.6, { x: -0.8, y: 0.03, color: '#e4e1d8', mat: M.smooth });
    pb.box(0.24, 0.3, 0.025, { x: -0.82, y: 0.15, rz: -0.35, color: accent, mat: M.smooth }); // fin
    pb.box(1.4, 0.03, 0.225, { x: 0, y: 0.02, color: GRN, mat: M.smooth, sz: 1.0 });
    for (const s of [-0.38, 0.38]) pb.cyl(0.045, 0.045, 0.2, { rz: Math.PI / 2, x: 0.18, y: -0.08, z: s, color: '#b9b6ae', mat: M.smooth, seg: 8 });
    pb.sphere(0.025, { x: 0.05, y: -0.02, z: 0.8, mat: M.glow, color: '#ff4a3a', glow: 3, seg: 6 });
    pb.sphere(0.025, { x: 0.05, y: -0.02, z: -0.8, mat: M.glow, color: '#4aff7a', glow: 3, seg: 6 });
    pb.quad(0.5, 0.05, { x: 0.6, y: 0.05, z: 0.111, color: '#2a3a46', mat: M.smooth });
    pb.quad(0.5, 0.05, { x: 0.6, y: 0.05, z: -0.111, ry: Math.PI, color: '#2a3a46', mat: M.smooth });
    return pb.build();
  }
  const mk = (scale, y0, ox, oz) => {
    const p = plane();
    p.scale.setScalar(scale);
    object.add(p);
    return { p, scale, y0, ox, oz };
  };
  const planes = [mk(1, 0, 0, 0), mk(1, 0, 0, 0), mk(MS, 0.29, SQ[0], SQ[1]), mk(MS, 0.29, SQ[0], SQ[1])];
  // parked planes on the apron, identical
  for (let k = 0; k < 2; k++) {
    const p = plane();
    const [x, z] = rot(0.6 + k * 2.0, RZ + 2.3);
    p.position.set(x, 0.24, z);
    p.rotation.y = -RY + Math.PI / 2;
    object.add(p);
  }
  // the name board's panel, changing colour as the name changes
  const boardMat = new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false });
  const board = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.36, 0.04), boardMat);
  const [bx, bz] = rot(1.6, RZ + 3.55);
  board.position.set(bx, 1.4, bz);
  board.rotation.y = -RY;
  object.add(board);

  const half = Math.sqrt(10.3 ** 2 - RZ ** 2);
  const CYC = 22;
  const ease = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
  const tmpC = new THREE.Color();
  // a flight path along the runway's u-axis: returns [u, y, pitch]
  function takeoff(k) { // k 0..1
    const u = -3 + k * k * 16; // accelerating roll then climb
    const lift = Math.max(0, u - 2.5);
    const y = 0.14 + lift * lift * 0.05;
    return [u, y, Math.min(0.25, lift * 0.06)];
  }
  function landing(k) {
    const u = -13 + (1 - (1 - k) * (1 - k)) * 13.5; // decelerating
    const air = Math.max(0, -1.5 - u);
    const y = 0.14 + air * 0.32;
    return [u, y, air > 0 ? -0.08 : 0];
  }
  function place(pl, uyp, vis) {
    const [u, y, pitch] = uyp;
    const s = pl.scale;
    const [x, z] = rot(u, RZ);
    pl.p.position.set(pl.ox + (x - 0) * (s === 1 ? 1 : s) + (s === 1 ? 0 : 0), pl.y0 + y * s + (s === 1 ? 0.1 : 0.01), pl.oz + z * s);
    if (s !== 1) pl.p.position.set(pl.ox + x * s, pl.y0 + 0.1 * s + y * s, pl.oz + z * s);
    pl.p.rotation.set(0, -RY, pitch, 'YXZ');
    // fade out beyond the edge of the plinth (the next Trude takes over)
    const d = Math.hypot(x, z);
    const f = vis * (1 - ease((d - 9.6) / 1.2));
    pl.p.scale.setScalar(s * Math.max(0.001, f));
    pl.p.visible = f > 0.01;
  }
  function update(t) {
    const c = (t % CYC) / CYC;
    // phase A (0..0.5): one plane takes off; phase B (0.5..1): an identical one lands
    const a = Math.min(1, c / 0.5), bb = Math.max(0, (c - 0.5) / 0.5);
    for (let k = 0; k < 4; k += 2) {
      place(planes[k], takeoff(a), c < 0.5 ? 1 : 0);
      place(planes[k + 1], landing(bb), c >= 0.5 ? 1 : 0);
    }
    const n = Math.floor(t / 5.5);
    tmpC.setHSL(((n * 0.37) % 1), 0.6, 0.55).multiplyScalar(0.95);
    boardMat.color.copy(tmpC);
  }
  update(0);
  return { object, update };
}

const GABLE = (() => {
  const s = new THREE.Shape([new THREE.Vector2(-0.5, 0), new THREE.Vector2(0.5, 0), new THREE.Vector2(0, 1)]);
  const g = new THREE.ExtrudeGeometry(s, { depth: 1, bevelEnabled: false });
  g.translate(0, 0, -0.5);
  return g;
})();
