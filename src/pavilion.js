// The frame story: Kublai Khan and Marco Polo in a garden pavilion, over a chessboard.
import { THREE, Builder, M, C, column, tree, stairs, solid, glowMat } from './kit.js';

export function makePavilion(rng) {
  const root = new THREE.Group();
  const b = new Builder();

  // terraced octagonal dais
  for (let i = 0; i < 3; i++) {
    b.prism(15 - i * 2.2, 15.6 - i * 2.2, 0.7, 8, { y: i * 0.7, color: i % 2 ? C.ivory : C.sand, mat: M.smooth, ry: Math.PI / 8 });
  }
  const top = 2.1;
  const S = 1.45; // scale of the figures & table
  // inlaid floor: a ring of tiles
  b.prism(10.2, 10.2, 0.02, 8, { y: top, color: '#b78f5a', mat: M.smooth, ry: Math.PI / 8 });
  // front stairs (toward +z)
  stairs(b, { x: 0, y: 0, z: 10.5, w: 5, steps: 6, rise: 0.35, run: 0.6, ry: Math.PI, color: C.ivory });

  // garden: pools, cypresses, magnolias
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + (i * Math.PI) / 2;
    const x = Math.cos(a) * 19, z = Math.sin(a) * 19;
    b.cyl(3.2, 3.4, 0.4, { x, z, color: C.ivory, mat: M.smooth, seg: 24 });
    b.cyl(2.9, 2.9, 0.05, { x, y: 0.36, z, color: C.sea, mat: M.water, seg: 24 });
  }
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2;
    const r = 24 + rng.range(-1, 1.5);
    if (Math.abs(Math.sin(a) - 1) < 0.08) continue; // keep the front open
    if (i % 2) tree(b, { x: Math.cos(a) * r, z: Math.sin(a) * r, h: rng.range(4, 6.5), kind: 'cypress', r: rng });
    else {
      // magnolia: round crown with pale blossoms
      const x = Math.cos(a) * r, z = Math.sin(a) * r, h = rng.range(2.6, 3.6);
      tree(b, { x, z, h, kind: 'round', color: C.darkleaf, r: rng });
      for (let k = 0; k < 7; k++) b.sphere(0.13, { x: x + rng.range(-0.8, 0.8), y: h * rng.range(0.5, 0.85), z: z + rng.range(-0.8, 0.8), color: '#f6e6ec', mat: M.smooth, seg: 5 });
    }
  }

  // columns + canopy
  const R = 8.6;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    column(b, { x: Math.cos(a) * R, y: top, z: Math.sin(a) * R, r: 0.32, h: 6.2, color: C.ivory });
    // lantern hanging between columns
    const a2 = a + Math.PI / 8;
    b.rod([Math.cos(a2) * (R - 0.3), top + 6.1, Math.sin(a2) * (R - 0.3)], [Math.cos(a2) * (R - 0.3), top + 4.9, Math.sin(a2) * (R - 0.3)], 0.02, { color: C.darkwood });
    b.sphere(0.2, { x: Math.cos(a2) * (R - 0.3), y: top + 4.6, z: Math.sin(a2) * (R - 0.3), mat: M.glow, color: C.lamp, glow: 1.5, seg: 8 });
  }
  b.prism(R + 1.2, R + 1.2, 0.5, 8, { y: top + 6.2, color: C.gold, mat: M.metal, ry: Math.PI / 8 });
  // tent roof, gently curved
  b.lathe([[R + 1.6, 0], [R * 0.75, 1.6], [R * 0.4, 3.3], [0.3, 5.2], [0.01, 5.4]], { y: top + 6.7, color: '#7b2f3a', mat: M.cloth, seg: 8 });
  b.lathe([[R + 1.7, -0.02], [R + 1.4, -0.7], [R + 1.62, -0.7]], { y: top + 6.7, color: C.gold, mat: M.metal, seg: 8 }); // fringe band
  b.cone(0.25, 1.6, { y: top + 12.1, color: C.gold, mat: M.metal, seg: 8 });
  b.sphere(0.35, { y: top + 13.8, color: C.gold, mat: M.metal });

  // carpets
  b.box(9, 0.04, 6, { y: top + 0.02, color: '#8c2f35', mat: M.cloth });
  b.box(8.2, 0.05, 5.2, { y: top + 0.02, color: '#c7883d', mat: M.cloth });
  b.box(7.6, 0.06, 4.6, { y: top + 0.02, color: '#2c3a63', mat: M.cloth });

  b.push({ y: top, s: S });
  // low table + chessboard
  b.box(2.6, 0.5, 2.6, { y: 0, color: C.darkwood, mat: M.wood });
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) {
    b.box(0.28, 0.03, 0.28, { x: -0.98 + i * 0.28, y: 0.5, z: -0.98 + j * 0.28, color: (i + j) % 2 ? '#2a1d17' : '#e9dcc0', mat: M.smooth });
  }
  // chessmen
  const pieces = [[-0.84, -0.56, 1], [0.0, -0.84, 1], [0.56, -0.28, 1], [-0.28, 0.56, 0], [0.28, 0.84, 0], [0.84, 0.28, 0], [-0.56, 0.0, 0]];
  pieces.forEach(([x, z, w], i) => {
    const col = w ? '#efe3c8' : '#2a1d17';
    b.cyl(0.07, 0.09, 0.08, { x, y: 0.53, z, color: col, mat: M.smooth, seg: 8 });
    b.cyl(0.03, 0.06, 0.18 + (i % 3) * 0.06, { x, y: 0.6, z, color: col, mat: M.smooth, seg: 8 });
    b.sphere(0.06, { x, y: 0.8 + (i % 3) * 0.06, z, color: col, mat: M.smooth, seg: 6 });
  });

  // Kublai: cushion, broad robed figure, tall hat (sits at -x)
  const kx = -2.4;
  b.box(1.8, 0.35, 1.8, { x: kx, y: 0, color: '#c7883d', mat: M.cloth });
  b.cone(1.0, 1.9, { x: kx, y: 0.35, color: '#1f3e6d', mat: M.cloth, seg: 10 });
  b.cyl(0.62, 0.95, 0.6, { x: kx, y: 0.35, color: '#1f3e6d', mat: M.cloth, seg: 10 }); // lap
  b.torus(0.5, 0.08, { x: kx, y: 1.7, rx: Math.PI / 2, color: C.gold, mat: M.metal }); // collar
  b.sphere(0.34, { x: kx, y: 2.25, color: '#d2a57c', seg: 10 });
  b.cyl(0.26, 0.38, 0.55, { x: kx, y: 2.45, color: C.gold, mat: M.metal, seg: 10 });
  b.sphere(0.09, { x: kx, y: 3.05, color: '#c43b3b', mat: M.smooth });
  // Marco: slimmer, red cloak, cap (sits at +x)
  const mx = 2.4;
  b.box(1.5, 0.3, 1.5, { x: mx, y: 0, color: '#5b6b45', mat: M.cloth });
  b.cone(0.75, 1.75, { x: mx, y: 0.3, color: '#8e2a26', mat: M.cloth, seg: 10 });
  b.cyl(0.5, 0.75, 0.5, { x: mx, y: 0.3, color: '#8e2a26', mat: M.cloth, seg: 10 });
  b.sphere(0.3, { x: mx, y: 2.05, color: '#dcb48f', seg: 10 });
  b.cyl(0.3, 0.32, 0.18, { x: mx, y: 2.22, color: '#3a2a22', mat: M.cloth, seg: 10 });
  // Marco's bag of objects: plumes, quartz
  b.sphere(0.35, { x: mx + 0.6, y: 0.3, z: 0.9, color: '#7a5a3a', mat: M.cloth, sy: 0.7 });
  b.geo(new THREE.OctahedronGeometry(0.16, 0), { x: mx - 0.9, y: 0.2, z: 1.1, color: '#cfe6ff', mat: M.glass });
  b.rod([mx + 0.5, 0.4, 0.9], [mx + 0.2, 1.3, 1.2], 0.03, { color: '#f4efe6' });

  // amber pipes with smoke later
  b.rod([kx + 0.3, 1.6, 0.4], [kx + 1.3, 1.1, 0.8], 0.03, { color: '#c98c2e', mat: M.smooth });

  b.pop();

  const group = b.build();
  root.add(group);

  // smoke wisps rising from the pipe
  const smokeMat = new THREE.MeshBasicMaterial({ color: '#d9d2e6', transparent: true, opacity: 0.25, depthWrite: false });
  const puffs = [];
  for (let i = 0; i < 10; i++) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), smokeMat.clone());
    root.add(m);
    puffs.push({ m, off: i / 10 });
  }
  // a single soft glow above the chessboard
  const glow = new THREE.PointLight('#ffcf8a', 30, 18, 2);
  glow.position.set(0, top + 4, 0);
  root.add(glow);

  function update(t) {
    for (const p of puffs) {
      const k = (t * 0.12 + p.off) % 1;
      p.m.position.set((kx + 1.35) * S + Math.sin(k * 6 + p.off * 10) * 0.3 * k, top + 1.2 * S + k * 3.6, 0.8 * S + Math.cos(k * 5) * 0.2 * k);
      p.m.scale.setScalar(0.6 + k * 2.2);
      p.m.material.opacity = 0.28 * Math.sin(Math.PI * k);
    }
    glow.intensity = 26 + Math.sin(t * 3.1) * 2 + Math.sin(t * 7.3) * 1.5;
  }
  return { object: root, update };
}
