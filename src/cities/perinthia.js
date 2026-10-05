// Perinthia — laid out by astronomers: a perfect circle, the cardo and decumanus drawn along the
// courses of sun and moon, twelve sectors for the twelve houses of the zodiac, and at the centre a
// brass armillary sphere turning with the heavens. But a generation later the city has grown into
// monsters: twisted towers, swollen domes, houses on spider legs, buildings with extra heads and
// limbs, whose lit windows stare out in pairs. The order of the sky, reflected exactly.
import { THREE, Builder, M, C, Lines } from '../kit.js';
import { envTex } from './_e_util.js';

export default function build({ rng, accent }) {
  const b = new Builder();
  const object = new THREE.Group();
  const BRASS = new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 1, roughness: 0.25, envMap: envTex(), envMapIntensity: 1.5, emissive: '#2a1a05', emissiveIntensity: 0.6 });

  const AX = 0.21; // the axes follow the sun, not the board
  const SECT = 12;
  const rIn = 2.5, rMid = 5.45, rOut = 9.0;

  /* -------------------------------------------------------------- plan -- */
  b.cyl(10.4, 10.45, 0.1, { seg: 96, color: '#cdbb98' });
  // twelve sectors, alternating two tones of paving, laid as thin wedges
  for (let i = 0; i < SECT; i++) {
    const a0 = AX + (i / SECT) * Math.PI * 2;
    const g = new THREE.RingGeometry(rIn, rOut + 0.6, 10, 1, -a0 - Math.PI * 2 / SECT, Math.PI * 2 / SECT);
    g.rotateX(-Math.PI / 2);
    b.geo(g, { y: 0.105, color: i % 2 ? '#e0cfaa' : '#b39871' });
  }
  // ring roads
  b.ring(rMid - 0.25, rMid + 0.25, { y: 0.115, seg: 96, color: '#e6dcc6' });
  b.ring(rOut, rOut + 0.35, { y: 0.115, seg: 96, color: '#e6dcc6' });
  b.ring(rIn - 0.1, rIn + 0.1, { y: 0.115, seg: 64, color: '#b08a4a', mat: BRASS });
  // twelve brass meridian lines dividing the houses of the zodiac
  for (let i = 0; i < SECT; i++) {
    const a = AX + (i / SECT) * Math.PI * 2;
    const x0 = Math.cos(a) * rIn, z0 = Math.sin(a) * rIn, x1 = Math.cos(a) * (rOut + 0.35), z1 = Math.sin(a) * (rOut + 0.35);
    b.beam([x0, 0.13, z0], [x1, 0.13, z1], 0.1, { color: C.gold, mat: BRASS });
    // a gnomon obelisk at each boundary on the outer ring, a lamp on top
    const xo = Math.cos(a) * (rOut + 0.6), zo = Math.sin(a) * (rOut + 0.6);
    b.box(0.3, 0.12, 0.3, { x: xo, y: 0.1, z: zo, ry: -a, color: C.ivory });
    b.prism(0.05, 0.13, 1.6, 4, { x: xo, y: 0.22, z: zo, ry: -a + Math.PI / 4, color: C.ivory, mat: M.smooth });
    b.sphere(0.06, { x: xo, y: 1.9, z: zo, mat: M.glow, color: C.lamp, glow: 2.2 });
  }
  // cardo and decumanus: two broad avenues crossing the whole circle
  for (let k = 0; k < 2; k++) {
    const a = AX + k * Math.PI / 2;
    b.box(rOut * 2 + 1.2, 0.03, 0.9, { y: 0.12, ry: -a, color: '#ece3cf', mat: M.smooth });
    b.box(rOut * 2 + 1.2, 0.035, 0.08, { y: 0.12, ry: -a, color: C.gold, mat: BRASS });
  }

  /* ------------------------------------------- observatory & armillary -- */
  b.cyl(rIn - 0.2, rIn - 0.1, 0.25, { y: 0.1, seg: 48, color: C.ivory, mat: M.smooth });
  b.cyl(1.6, 1.7, 0.3, { y: 0.35, seg: 40, color: '#e9e0cc', mat: M.smooth });
  b.cyl(1.0, 1.1, 0.35, { y: 0.65, seg: 32, color: C.ivory, mat: M.smooth });
  // four stairs on the axes
  for (let k = 0; k < 4; k++) {
    const a = AX + k * Math.PI / 2;
    for (let s = 0; s < 3; s++) b.box(0.7, 0.33 * (s + 1), 0.22, { x: Math.cos(a) * (2.2 - s * 0.22), z: Math.sin(a) * (2.2 - s * 0.22), y: 0.1, ry: -a + Math.PI / 2, color: '#e9e0cc' });
  }
  // a slender column carrying the sphere
  b.lathe([[0.32, 0], [0.32, 0.1], [0.2, 0.2], [0.15, 0.3], [0.13, 2.6], [0.2, 2.7], [0.26, 2.85], [0.0, 2.9]], { y: 1.0, seg: 20, color: C.ivory, mat: M.smooth });
  // fixed meridian & horizon rings
  const SY = 5.15, SR = 1.55;
  b.torus(SR + 0.18, 0.05, { y: SY, rx: Math.PI / 2, color: C.gold, mat: BRASS, tseg: 64 }); // horizon
  b.torus(SR + 0.12, 0.045, { y: SY, ry: -AX, color: C.gold, mat: BRASS, tseg: 64 }); // meridian
  b.rod([0, SY - SR - 0.5, 0], [0, 3.9, 0], 0.05, { color: C.gold, mat: BRASS });
  // four curving brass struts from the column top to the horizon ring
  for (let k = 0; k < 4; k++) {
    const a = AX + k * Math.PI / 2 + Math.PI / 4;
    b.tube([[0, 3.85, 0], [Math.cos(a) * 0.9, 4.1, Math.sin(a) * 0.9], [Math.cos(a) * (SR + 0.18), SY, Math.sin(a) * (SR + 0.18)]], 0.03, { color: C.gold, mat: BRASS });
  }
  // rotating rings (animated)
  const arm = new Builder();
  arm.torus(SR, 0.04, { rx: Math.PI / 2, color: C.gold, mat: BRASS, tseg: 64 }); // equator
  arm.torus(SR, 0.035, { rx: Math.PI / 2 + 0.41, color: '#f0c96a', mat: BRASS, tseg: 64 }); // ecliptic
  arm.torus(SR * 0.97, 0.03, { color: C.gold, mat: BRASS, tseg: 64 }); // colure
  arm.torus(SR * 0.97, 0.03, { ry: Math.PI / 2, color: C.gold, mat: BRASS, tseg: 64 });
  // the ecliptic band, with twelve studs for the twelve houses
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const v = new THREE.Vector3(Math.cos(a) * SR, 0, Math.sin(a) * SR).applyAxisAngle(new THREE.Vector3(1, 0, 0), 0.41);
    arm.sphere(0.07, { x: v.x, y: v.y, z: v.z, color: i % 3 ? C.gold : accent, mat: i % 3 ? BRASS : M.glow, glow: 1.8, seg: 8 });
  }
  arm.rod([0, -SR - 0.1, 0], [0, SR + 0.1, 0], 0.025, { color: C.gold, mat: BRASS }); // axis
  arm.sphere(0.2, { color: '#4b6fa8', mat: M.smooth, seg: 16 }); // the earth at the centre
  const armillary = arm.build();
  const armHolder = new THREE.Group();
  armHolder.position.set(0, SY, 0);
  armHolder.rotation.set(0.42, -AX, 0, 'YXZ'); // polar axis tilted
  armHolder.add(armillary);
  object.add(armHolder);

  /* ------------------------------------------------------- the monsters -- */
  const v3 = new THREE.Vector3();
  /** add geometry deformed by fn(x,y,z)->[x,y,z] in local coords, then placed */
  const deformed = (geo, fn, o) => {
    const g = geo.index ? geo.toNonIndexed() : geo;
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const r = fn(p.getX(i), p.getY(i), p.getZ(i));
      p.setXYZ(i, r[0], r[1], r[2]);
    }
    g.computeVertexNormals();
    b.geo(g, o);
  };
  const WALLS = [C.plaster, C.ivory, '#eadbc0', C.rose, '#e7d3b8', '#d8c3a3'];
  const ROOFS = ['#3f5d8c', '#2f6e6a', C.terracotta, C.gold, '#6b4c7a', C.brick];

  const eyes = []; // lit windows, in pairs
  const breathers = []; // a few domes that swell and sink, slowly
  function monster(x, z, size, ry) {
    const w = size * rng.range(0.8, 1.15), d = size * rng.range(0.8, 1.15);
    const h = rng.range(1.0, 2.6) * (0.7 + size * 0.5);
    const twist = rng.range(-0.55, 0.55) * (rng.chance(0.6) ? 1 : 0.2);
    const swell = rng.chance(0.55) ? rng.range(0.12, 0.42) : rng.range(-0.15, 0.05);
    const bend = rng.range(-0.12, 0.12);
    const legs = rng.chance(0.14);
    const y0 = legs ? 0.6 : 0.1;
    const wall = rng.pick(WALLS), roofC = rng.pick(ROOFS);
    const fn = (px, py, pz) => {
      const t = py / h;
      const a = twist * t * Math.PI;
      const s = 1 + swell * Math.sin(Math.PI * t);
      const cx = px * s, cz = pz * s;
      return [cx * Math.cos(a) - cz * Math.sin(a) + bend * py * py, py, cx * Math.sin(a) + cz * Math.cos(a)];
    };
    const body = new THREE.BoxGeometry(w, h, d, 3, 8, 3);
    body.translate(0, h / 2, 0);
    deformed(body, fn, { x, y: y0, z, ry, color: wall });
    const topOff = fn(0, h, 0);
    const tx = topOff[0];
    b.push({ x, y: y0, z, ry });
    if (legs) {
      // spider legs: four to six splayed stilts
      const n = rng.pick([4, 6]);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + 0.3;
        const kx = Math.cos(a) * w * 0.4, kz = Math.sin(a) * d * 0.4;
        b.tube([[kx, 0.05, kz], [kx * 1.6, -0.15, kz * 1.6], [kx * 2.0, -0.5, kz * 2.0]], 0.045, { color: '#8c7a62', tseg: 10 });
      }
    }
    // heads: one, two or three; domes swollen out of true
    const heads = rng.chance(0.3) ? rng.int(2, 3) : 1;
    for (let k = 0; k < heads; k++) {
      const spread = heads === 1 ? 0 : (k / (heads - 1) - 0.5) * Math.min(w, d) * 0.9;
      const hx = tx + spread, hy = h - 0.02;
      const kind = rng.pick(['dome', 'dome', 'onion', 'spire', 'cone']);
      const R = Math.min(w, d) * (heads === 1 ? 0.52 : 0.32) * (1 + swell * 0.5);
      if (heads > 1) {
        // a neck leaning outward
        const nx = hx + spread * 0.6, ny = hy + 0.5 + rng.range(0, 0.5);
        b.tube([[hx * 0.6, hy - 0.1, 0], [hx + spread * 0.2, hy + 0.25, 0], [nx, ny, 0]], R * 0.45, { color: wall, tseg: 10 });
        addHead(kind, nx, ny, 0, R, roofC);
      } else addHead(kind, hx, hy, 0, R, roofC);
    }
    // extra limbs: crooked arms ending in bulbs or balconies
    const limbs = rng.chance(0.45) ? rng.int(1, 3) : 0;
    for (let k = 0; k < limbs; k++) {
      const a = rng.range(0, Math.PI * 2);
      const yy = h * rng.range(0.35, 0.8);
      const p0 = fn(Math.cos(a) * w * 0.45, yy, Math.sin(a) * d * 0.45);
      const out = rng.range(0.4, 0.8);
      const p1 = [p0[0] + Math.cos(a) * out, yy + rng.range(-0.1, 0.3), p0[2] + Math.sin(a) * out];
      const p2 = [p1[0] + Math.cos(a + 0.8) * 0.3, p1[1] + rng.range(0.2, 0.5), p1[2] + Math.sin(a + 0.8) * 0.3];
      b.tube([p0, p1, p2], rng.range(0.06, 0.11), { color: wall, tseg: 12 });
      b.sphere(rng.range(0.1, 0.17), { x: p2[0], y: p2[1], z: p2[2], color: roofC, mat: M.smooth, seg: 10 });
    }
    b.pop();
    // eyes: lit windows in pairs, low on the facade (world coords for later)
    if (rng.chance(0.7)) {
      const face = rng.int(0, 3);
      const fa = (face * Math.PI) / 2;
      const yy = h * rng.range(0.3, 0.65);
      const dist = (face % 2 ? w : d) / 2;
      for (const sx of [-0.13, 0.13]) {
        const lx = Math.sin(fa) * dist + Math.cos(fa) * sx * size, lz = Math.cos(fa) * dist - Math.sin(fa) * sx * size;
        const p = fn(lx, yy, lz);
        const ss = (1 + swell * Math.sin(Math.PI * yy / h)) * 1.02;
        v3.set(p[0] * 1.0 + (p[0] - 0) * 0.0, p[1] + y0, p[2]).applyAxisAngle(new THREE.Vector3(0, 1, 0), ry);
        eyes.push([x + v3.x * 1.0, v3.y, z + v3.z, ss]);
      }
    }
    return h + y0;
  }
  function addHead(kind, hx, hy, hz, R, col) {
    if (kind === 'dome') {
      const g = new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2);
      const lump = rng.range(0.1, 0.35), lumpA = rng.range(0, 6);
      deformedLocal(g, (px, py, pz) => {
        const k = 1 + lump * Math.max(0, Math.cos(Math.atan2(pz, px) - lumpA)) * py;
        return [px * R * k, py * R * rng.range(1.0, 1.0) * (1.15 + lump), pz * R * k];
      }, { x: hx, y: hy, z: hz, color: col, mat: M.smooth });
    } else if (kind === 'onion') {
      b.onion(R * 1.05, R * 2.2, { x: hx, y: hy, z: hz, color: col, mat: M.smooth, rz: rng.range(-0.3, 0.3) });
    } else if (kind === 'spire') {
      const g = new THREE.ConeGeometry(R * 0.8, R * 4, 8, 6);
      g.translate(0, R * 2, 0);
      const bnd = rng.range(-0.25, 0.25);
      deformedLocal(g, (px, py, pz) => [px + bnd * py * py, py, pz], { x: hx, y: hy, z: hz, color: col, mat: M.flat });
    } else {
      b.cone(R * 1.1, R * 1.6, { x: hx, y: hy, z: hz, seg: 7, color: col, mat: M.flat, rz: rng.range(-0.35, 0.35) });
    }
  }
  function deformedLocal(g0, fn, o) {
    const g = g0.index ? g0.toNonIndexed() : g0;
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const r = fn(p.getX(i), p.getY(i), p.getZ(i));
      p.setXYZ(i, r[0], r[1], r[2]);
    }
    g.computeVertexNormals();
    b.geo(g, o);
  }

  // place them sector by sector, keeping off the avenues and ring roads
  const offAxis = (x, z, m) => {
    for (let k = 0; k < 2; k++) {
      const a = AX + k * Math.PI / 2;
      const dist = Math.abs(-Math.sin(a) * x + Math.cos(a) * z);
      if (dist < 0.45 + m) return false;
    }
    return true;
  };
  const placed = [];
  for (let s = 0; s < SECT; s++) {
    const a0 = AX + (s / SECT) * Math.PI * 2, a1 = a0 + Math.PI * 2 / SECT, am = (a0 + a1) / 2;
    // each house of the zodiac has its temple at the outer edge: the tallest monster of the sector
    {
      const r = 7.6;
      const x = Math.cos(am) * r, z = Math.sin(am) * r;
      if (offAxis(x, z, 0.8)) {
        const top = monster(x, z, 1.2, -am);
        placed.push({ x, z, rad: 0.95 });
        if (s % 4 === 1) breathers.push({ x, z, y: top });
      }
    }
    for (let t = 0, n = 0; t < 120 && n < 7; t++) {
      const a = rng.range(a0 + 0.06, a1 - 0.06);
      const band = rng.chance(0.45) ? [rIn + 0.6, rMid - 0.6] : [rMid + 0.55, rOut - 0.35];
      const r = rng.range(band[0], band[1]);
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      const size = rng.range(0.55, 0.9);
      const rad = size * 0.75;
      if (!offAxis(x, z, rad)) continue;
      // keep off the sector lines
      const da = Math.min(Math.abs(a - a0), Math.abs(a1 - a)) * r;
      if (da < rad * 0.9) continue;
      if (placed.some((p) => Math.hypot(p.x - x, p.z - z) < p.rad + rad + 0.08)) continue;
      placed.push({ x, z, rad });
      monster(x, z, size, -a + rng.range(-0.2, 0.2));
      n++;
    }
  }

  object.add(b.build());

  // the eyes: pairs of warm windows, blinking very rarely
  const eyeGeo = new THREE.SphereGeometry(0.055, 8, 6);
  const eyeMesh = new THREE.InstancedMesh(eyeGeo, new THREE.MeshBasicMaterial({ color: new THREE.Color(C.lamp).multiplyScalar(2.4), toneMapped: false }), eyes.length);
  const m4 = new THREE.Matrix4();
  eyes.forEach((e, i) => { m4.makeScale(1, 1.3, 1).setPosition(e[0], e[1], e[2]); eyeMesh.setMatrixAt(i, m4); });
  object.add(eyeMesh);
  const blinkPh = eyes.map(() => rng.range(0, 40));

  // breathing domes: three temples whose swollen crowns rise and sink like lungs
  const lungs = [];
  for (const br of breathers) {
    const lb = new Builder();
    lb.sphere(0.42, { color: rng.pick(['#7a4f6e', '#3f5d8c', '#2f6e6a']), mat: M.smooth, seg: 18, sy: 1.15 });
    const g = lb.build();
    g.position.set(br.x, br.y + 0.75, br.z);
    object.add(g);
    lungs.push(g);
  }

  const pv = new THREE.Vector3(), sv = new THREE.Vector3(), qi = new THREE.Quaternion();
  function update(t) {
    armillary.rotation.y = t * 0.12; // the sphere of the heavens turns about its axis
    lungs.forEach((l, i) => {
      const k = Math.sin(t * 0.7 + i * 2.1);
      l.scale.set(1 + 0.12 * k, 1 + 0.2 * k, 1 + 0.12 * k);
    });
    // slow blinks
    for (let i = 0; i < eyes.length; i += 2) {
      const ph = (t + blinkPh[i]) % 9;
      const open = ph < 0.18 ? 0.1 : 1;
      for (let j = i; j < Math.min(i + 2, eyes.length); j++) {
        const e = eyes[j];
        pv.set(e[0], e[1], e[2]);
        sv.set(1, 1.3 * open, 1);
        m4.compose(pv, qi, sv);
        eyeMesh.setMatrixAt(j, m4);
      }
    }
    eyeMesh.instanceMatrix.needsUpdate = true;
  }
  update(0);
  return { object, update };
}
