// IRENE — the city seen only from the plateau.
// One side of the plinth is a high plateau with a stone parapet at its rim; a few
// people lean over it, at the hour the lamps are lit. Far below in the basin lies
// Irene: thousands of small roofs, and the lamps coming on one by one, thick where
// the windows crowd, thinning into dim alleys, until a pink glow spreads over the
// plain. Nobody on the plateau goes down; the path ends at the parapet.
import { THREE, Builder, M, C, tree, rock } from '../kit.js';
import { figure, softTex, sstep } from './_d_kit.js';

export default function build({ rng, accent }) {
  const b = new Builder();
  const object = new THREE.Group();
  const R0 = 10.45;
  // plateau: the part of the disc beyond a wavy chord at the back-left
  const U = new THREE.Vector2(-0.42, -0.91).normalize();
  const edgeD = (x, z) => 4.5 + 0.55 * Math.sin((x * -U.y + z * U.x) * 0.55 + 1.0) + 0.25 * Math.sin((x * -U.y + z * U.x) * 1.7);
  const onPlateau = (x, z, m = 0) => x * U.x + z * U.y > edgeD(x, z) + m;
  const PH = 6.6;

  /* ---------- the basin ---------- */
  b.cyl(R0, R0, 0.05, { color: '#5d5552', seg: 72 });
  // fields and orchards at the edges of the plain (dark at dusk)
  for (let i = 0; i < 60; i++) {
    const [x, z] = rng.inDisc(10, 6);
    if (onPlateau(x, z, -1)) continue;
    b.box(rng.range(0.8, 1.6), 0.02, rng.range(0.5, 1.0), { x, y: 0.05, z, ry: -Math.atan2(z, x), color: rng.pick(['#5e6a4c', '#6b6a4a', '#53604a', '#6d5e4a']) });
  }
  // a river curving through the plain
  const river = [];
  for (let i = 0; i <= 30; i++) {
    const t = i / 30;
    const x = -9 + t * 18, z = 5.5 - t * 3 + Math.sin(t * 6) * 1.2;
    if (Math.hypot(x, z) < 10.2 && !onPlateau(x, z, -0.5)) river.push([x, 0.5, z]);
  }
  const water = new THREE.MeshStandardMaterial({ color: '#2c3a4e', roughness: 0.65, metalness: 0.0, emissive: new THREE.Color('#ff7a8a'), emissiveIntensity: 0 });
  const riverB = new Builder();
  riverB.tube(river, 0.32, { sy: 0.12, color: '#ffffff', tseg: 80, rseg: 6 });
  const riverG = riverB.build({ shadows: false });
  riverG.children[0].material = water;
  object.add(riverG);

  // the city: a dense heart, thinning outward, cut by curving streets and opened by squares
  const CX = 1.6, CZ = 2.2;
  const NST = 7;
  const stA = Array.from({ length: NST }, (_, k) => (k / NST) * Math.PI * 2 + rng.range(-0.2, 0.2));
  const squares = [[CX, CZ, 0.9], [CX + 2.6, CZ - 2.2, 0.55], [CX - 3.2, CZ + 1.4, 0.6], [CX + 1.2, CZ + 3.4, 0.5]];
  const inStreet = (x, z) => {
    const dx = x - CX, dz = z - CZ;
    const rad = Math.hypot(dx, dz);
    const ang = Math.atan2(dz, dx);
    for (const s0 of stA) {
      const sa = s0 + rad * 0.09; // gently curving
      let da = Math.abs(((ang - sa + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
      if (da * rad < 0.17 && rad > 0.9) return true;
    }
    if (Math.abs(rad - 2.5) < 0.13 || Math.abs(rad - 5.0) < 0.15) return true;
    for (const [sx, sz, sr] of squares) if (Math.hypot(x - sx, z - sz) < sr) return true;
    return false;
  };
  const houses = [];
  const grid = new Map();
  const near = (x, z, r) => {
    const gx = Math.round(x / 0.5), gz = Math.round(z / 0.5);
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
      const l = grid.get(`${gx + i},${gz + j}`);
      if (l) for (const h of l) if (Math.hypot(h.x - x, h.z - z) < r + h.r) return true;
    }
    return false;
  };
  for (let i = 0; i < 26000 && houses.length < 1250; i++) {
    const [x, z] = rng.inDisc(9.9, 0);
    if (onPlateau(x, z, -0.8)) continue;
    const rad = Math.hypot(x - CX, z - CZ);
    const dens = Math.exp(-(rad * rad) / 18);
    if (rng() > dens * 1.05 + 0.04) continue;
    if (inStreet(x, z)) continue;
    const big = dens > 0.55 && rng.chance(0.25);
    const r = big ? 0.3 : rng.range(0.15, 0.21);
    if (near(x, z, r + 0.015)) continue;
    const ang = Math.atan2(z - CZ, x - CX);
    const h = { x, z, r, dens, ang, big };
    houses.push(h);
    const key = `${Math.round(x / 0.5)},${Math.round(z / 0.5)}`;
    if (!grid.has(key)) grid.set(key, []);
    grid.get(key).push(h);
  }
  const walls = ['#a08e8c', '#ab9a92', '#b4a292', '#968a96', '#a99284', '#c0a896', '#8e8790'];
  const roofs = ['#7d544e', '#8a5c4c', '#6a525a', '#90604c', '#73585e', '#5c5058'];
  const wins = []; // window positions for the lamp animation [x,y,z,ry,onTime]
  const addWin = (x, z, w, d, hh, ry, dens, n) => {
    for (let k = 0; k < n; k++) {
      const face = rng.int(0, 3);
      const fa = ry + face * Math.PI / 2;
      const off = (face % 2 === 0 ? d : w) / 2 + 0.006;
      const along = rng.range(-0.3, 0.3) * (face % 2 === 0 ? w : d);
      const yy = 0.05 + rng.range(0.1, Math.max(0.12, hh - 0.08));
      const nx = Math.sin(fa), nz = Math.cos(fa);
      wins.push([x + nx * off + nz * along, yy, z + nz * off - nx * along, fa, (1 - dens) * 16 + rng.range(0, 6) + (rng.chance(0.06) ? 9 : 0)]);
    }
  };
  for (const h of houses) {
    const w = h.r * rng.range(1.25, 1.5), d = h.r * rng.range(1.15, 1.4);
    const hh = h.big ? rng.range(0.7, 1.1) : 0.2 + h.dens * rng.range(0.15, 0.6) + rng.range(0, 0.12);
    const ry = -h.ang + Math.PI / 2 + rng.range(-0.12, 0.12);
    b.box(w, hh, d, { x: h.x, y: 0.05, z: h.z, ry, color: rng.pick(walls) });
    const roofK = rng();
    if (h.big || roofK < 0.25) b.box(w + 0.03, 0.04, d + 0.03, { x: h.x, y: 0.05 + hh, z: h.z, ry, color: '#8a7a78' });
    else b.geo(new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1).rotateY(Math.PI / 4).translate(0, 0.5, 0), { x: h.x, y: 0.05 + hh, z: h.z, ry, sx: w + 0.05, sz: d + 0.05, sy: rng.range(0.1, 0.18), color: rng.pick(roofs), mat: M.flat });
    addWin(h.x, h.z, w, d, hh, ry, h.dens, Math.round(1 + h.dens * 4 + (h.big ? 4 : 0) + rng.range(0, 1)));
  }
  // landmarks: a cathedral with a dome on the main square, bell towers, a palazzo tower
  b.box(1.0, 1.1, 1.6, { x: CX - 0.2, y: 0.05, z: CZ - 1.55, ry: 0.2, color: '#c0ad9a' });
  b.cyl(0.42, 0.42, 0.45, { x: CX - 0.2, y: 1.15, z: CZ - 1.55, color: '#c0ad9a', seg: 12 });
  b.dome(0.44, { x: CX - 0.2, y: 1.6, z: CZ - 1.55, color: '#8f8794', mat: M.smooth });
  b.cone(0.08, 0.35, { x: CX - 0.2, y: 2.03, z: CZ - 1.55, color: '#8f8794', seg: 6 });
  addWin(CX - 0.2, CZ - 1.55, 1.0, 1.6, 1.1, 0.2, 1, 10);
  const towers = [[CX + 0.9, CZ + 0.6, 2.4], [CX - 2.3, CZ - 0.4, 1.7], [CX + 3.3, CZ + 0.8, 1.5], [CX - 1.0, CZ + 2.9, 1.3], [CX + 1.9, CZ - 3.2, 1.6]];
  for (const [tx, tz, th] of towers) {
    if (inStreet(tx, tz) || onPlateau(tx, tz, -0.6) || Math.hypot(tx, tz) > 9.5) continue;
    b.box(0.32, th, 0.32, { x: tx, y: 0.05, z: tz, color: '#b4a292' });
    b.box(0.38, 0.05, 0.38, { x: tx, y: 0.05 + th, z: tz, color: '#8a7a78' });
    b.prism(0, 0.27, 0.45, 4, { x: tx, y: 0.1 + th, z: tz, ry: Math.PI / 4, color: '#73585e', mat: M.flat });
    b.quad(0.1, 0.14, { x: tx, y: th - 0.2, z: tz + 0.165, color: '#ff9f8a', mat: M.glow, glow: 1.6 });
  }
  // lamps in the squares
  for (const [sx, sz, sr] of squares) {
    if (onPlateau(sx, sz, -0.6)) continue;
    b.cyl(sr * 0.35, sr * 0.38, 0.08, { x: sx, y: 0.05, z: sz, color: '#9a8a86', seg: 12 });
    b.sphere(0.06, { x: sx, y: 0.3, z: sz, color: '#ffb08a', mat: M.glow, glow: 2.4, seg: 6 });
  }
  // bridges over the river
  for (const t of [0.35, 0.62]) {
    const i = Math.floor(t * (river.length - 1));
    const [x, , z] = river[i];
    const [x2, , z2] = river[i + 1];
    const ang = Math.atan2(z2 - z, x2 - x);
    b.box(0.25, 0.08, 1.0, { x, y: 0.08, z, ry: -ang, color: '#8a7f7a' });
  }

  /* ---------- the plateau ---------- */
  // build the cliff as a slab of the disc segment, then rough it with strata and rocks
  const ring = [];
  const NSEG = 80;
  for (let i = 0; i < NSEG; i++) {
    const a = (i / NSEG) * Math.PI * 2;
    const x = Math.cos(a) * R0, z = Math.sin(a) * R0;
    if (onPlateau(x, z)) ring.push([x, z, a]);
  }
  // outer arc order then the wavy edge back
  ring.sort((p, q) => {
    const ua = Math.atan2(U.y, U.x);
    const da = (p[2] - ua + Math.PI * 3) % (Math.PI * 2), db = (q[2] - ua + Math.PI * 3) % (Math.PI * 2);
    return da - db;
  });
  const poly = ring.map(([x, z]) => [x, z]);
  // edge points from last arc point back to first along the chord
  const P0 = ring[ring.length - 1], P1 = ring[0];
  const edgePts = [];
  for (let i = 1; i < 40; i++) {
    const t = i / 40;
    let x = P0[0] + (P1[0] - P0[0]) * t, z = P0[1] + (P1[1] - P0[1]) * t;
    // push onto the wavy edge line
    for (let k = 0; k < 6; k++) { const dd = x * U.x + z * U.y - edgeD(x, z); x -= U.x * dd; z -= U.y * dd; }
    edgePts.push([x, z]);
  }
  poly.push(...edgePts);
  const strata = ['#8b7466', '#9c8471', '#7e6a5f', '#a58d78', '#8f7a6c', '#776358'];
  let yAcc = 0;
  let li = 0;
  while (yAcc < PH - 0.01) {
    const th = Math.min(PH - yAcc, rng.range(0.6, 1.3));
    const inset = (li % 2) * 0.12 + rng.range(0, 0.1);
    const shrunk = poly.map(([x, z]) => {
      const onEdge = Math.abs(x * U.x + z * U.y - edgeD(x, z)) < 0.05;
      const tt = x * -U.y + z * U.x;
      const k = inset + yAcc * 0.06 + 0.22 * Math.sin(tt * 2.1 + li * 1.7) + 0.12 * Math.sin(tt * 5.3 + li);
      return onEdge ? [x + U.x * k, z + U.y * k] : [x, z];
    });
    b.slab(shrunk, th, { y: yAcc, color: strata[li % strata.length], mat: M.flat });
    yAcc += th; li++;
  }
  // talus and boulders at the cliff foot, rocks on the face
  for (let i = 0; i < edgePts.length; i += 2) {
    const [x, z] = edgePts[i];
    if (Math.hypot(x, z) > 9.8) continue;
    rock(b, { x: x - U.x * rng.range(0.1, 0.7), y: 0, z: z - U.y * rng.range(0.1, 0.7), r: rng.range(0.3, 0.7), h: rng.range(0.5, 1.8), color: rng.pick(strata), rand: rng });
    if (rng.chance(0.8)) rock(b, { x: x + U.x * 0.25, y: rng.range(1.0, 5.5), z: z + U.y * 0.15, r: rng.range(0.25, 0.5), h: rng.range(0.6, 1.2), color: rng.pick(strata), rand: rng });
  }
  // the plateau top: grass, a path that ends at the parapet, cottages, trees
  const topPoly = poly.map(([x, z]) => {
    const onEdge = Math.abs(x * U.x + z * U.y - edgeD(x, z)) < 0.05;
    return onEdge ? [x + U.x * 0.3, z + U.y * 0.3] : [x * 0.995, z * 0.995];
  });
  b.slab(topPoly, 0.06, { y: PH, color: '#6f7a55' });
  const T = PH + 0.06;
  // parapet along the rim
  for (let i = 0; i < edgePts.length - 1; i++) {
    const [x, z] = edgePts[i], [x2, z2] = edgePts[i + 1];
    const mx = (x + x2) / 2 + U.x * 0.45, mz = (z + z2) / 2 + U.y * 0.45;
    if (Math.hypot(mx, mz) > 10.0) continue;
    const len = Math.hypot(x2 - x, z2 - z) + 0.02;
    b.box(len, 0.32, 0.14, { x: mx, y: T, z: mz, ry: -Math.atan2(z2 - z, x2 - x), color: '#cdbca4' });
    if (i % 4 === 0) b.box(0.2, 0.42, 0.2, { x: mx, y: T, z: mz, color: '#d8c8b0' });
  }
  // the onlookers: leaning on the parapet, pointing, a couple, a child lifted up
  const mid = Math.floor(edgePts.length / 2);
  const look = [];
  for (const [idx, pose] of [[mid - 9, 'lean'], [mid - 6, 'point'], [mid - 5, 'lean'], [mid - 1, 'pair'], [mid + 3, 'lean'], [mid + 7, 'point'], [mid + 11, 'lean']]) {
    const [x, z] = edgePts[Math.max(0, Math.min(edgePts.length - 1, idx))];
    const fx = x + U.x * 0.75, fz = z + U.y * 0.75;
    if (Math.hypot(fx, fz) > 9.8) continue;
    const ry = Math.atan2(-U.x, -U.y);
    const robe = rng.pick(['#5d6d8a', '#8a6a4a', '#a0524a', '#4d4a52', '#6f7f6a', '#c9a35a']);
    if (pose === 'lean') figure(b, { x: fx, y: T, z: fz, ry, lean: 0.45, robe, arms: ['fwd', 'fwd'], hat: rng.pick([null, 'brim', 'veil']), hatColor: '#3a3330' });
    else if (pose === 'point') figure(b, { x: fx, y: T, z: fz, ry, lean: 0.15, robe, arms: ['point', 'down'], hat: 'cap', hatColor: C.ivory });
    else {
      figure(b, { x: fx - 0.18, y: T, z: fz, ry, lean: 0.2, robe: '#5b4a6a', arms: ['fwd', 'heart'], hat: 'veil', hatColor: '#e8dccb' });
      figure(b, { x: fx + 0.18, y: T, z: fz, ry, lean: 0.2, robe: '#3d4a5a', arms: ['out', 'fwd'], hat: 'brim', hatColor: '#2e2b2a' });
    }
    look.push([fx, fz]);
  }
  // bench, telescope on a tripod, a lamp post on the plateau
  {
    const [x, z] = edgePts[mid + 5];
    const tx = x + U.x * 0.85, tz = z + U.y * 0.85;
    for (const [ox, oz] of [[0.12, 0], [-0.06, 0.1], [-0.06, -0.1]]) b.rod([tx + ox, T, tz + oz], [tx, T + 0.42, tz], 0.012, { color: C.darkwood });
    b.rod([tx + U.x * 0.15, T + 0.4, tz + U.y * 0.15], [tx - U.x * 0.25, T + 0.52, tz - U.y * 0.25], 0.03, { color: '#b8924e', mat: M.metal, r2: 0.045 });
  }
  // the path, ending at the parapet
  for (let i = 0; i < 26; i++) {
    const t = i / 26;
    const [x, z] = edgePts[mid];
    const px = x + U.x * (0.9 + t * 4.5) + Math.sin(t * 5) * 0.4 * -U.y, pz = z + U.y * (0.9 + t * 4.5) + Math.sin(t * 5) * 0.4 * U.x;
    if (Math.hypot(px, pz) > 9.8) continue;
    b.box(0.5, 0.02, 0.24, { x: px, y: T, z: pz, ry: rng.range(-0.3, 0.3) - Math.atan2(U.y, U.x), color: '#b6a585' });
  }
  // plateau cottages and trees
  for (let i = 0; i < 26; i++) {
    const [x, z] = rng.inDisc(10, 4);
    if (!onPlateau(x, z, 1.4) || Math.hypot(x, z) > 9.6) continue;
    if (rng.chance(0.4)) {
      const hh = rng.range(0.5, 0.8);
      const ry = rng.range(0, 3);
      b.box(0.7, hh, 0.55, { x, y: T, z, ry, color: '#d8cbb3' });
      b.geo(new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1).rotateY(Math.PI / 4).translate(0, 0.5, 0), { x, y: T + hh, z, ry, sx: 0.8, sz: 0.65, sy: 0.35, color: '#7a5a4a', mat: M.flat });
    } else tree(b, { x, y: T, z, h: rng.range(0.9, 1.6), kind: rng.pick(['round', 'pine', 'cypress']), color: '#5d7a4c', r: rng });
  }
  {
    const [x, z] = edgePts[mid - 3];
    const lx = x + U.x * 0.9, lz = z + U.y * 0.9;
    b.cyl(0.025, 0.03, 1.1, { x: lx, y: T, z: lz, color: '#2f2f35', mat: M.metal, seg: 6 });
    b.sphere(0.07, { x: lx, y: T + 1.18, z: lz, color: C.lamp, mat: M.glow, glow: 2.6, seg: 8 });
  }
  object.add(b.build());

  /* ---------- the lamps of Irene ---------- */
  const NWIN = wins.length;
  const winGeo = new THREE.PlaneGeometry(0.07, 0.085);
  const winMat = new THREE.MeshBasicMaterial({ toneMapped: false });
  const winMesh = new THREE.InstancedMesh(winGeo, winMat, NWIN);
  const dummy = new THREE.Object3D();
  const DARK = new THREE.Color('#2a2228');
  const PINK = [new THREE.Color('#ff8f84'), new THREE.Color('#ffb08a'), new THREE.Color('#ff9fa8'), new THREE.Color('#ffc59a')];
  const wcol = [];
  wins.forEach(([x, y, z, ry], i) => {
    dummy.position.set(x, y, z);
    dummy.rotation.set(0, ry, 0);
    dummy.updateMatrix();
    winMesh.setMatrixAt(i, dummy.matrix);
    winMesh.setColorAt(i, DARK);
    wcol.push(PINK[i % 4]);
  });
  object.add(winMesh);
  // the glow over the plain: soft additive layers that fill in as the lamps come on
  const haze = [];
  const hazeMat = new THREE.MeshBasicMaterial({ map: softTex(), color: new THREE.Color('#ff7f86'), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
  for (let k = 0; k < 3; k++) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), hazeMat);
    m.position.set(CX + 0.2, 0.4 + k * 0.6, CZ);
    m.scale.set(12 - k * 2.5, 1, 10 - k * 2);
    m.renderOrder = 2;
    object.add(m);
    haze.push(m);
  }
  const tmp = new THREE.Color();
  const CYCLE = 44;
  return {
    object,
    update(t) {
      const c = (t + 20) % CYCLE;
      // dusk: lamps on over ~22 s (heart first), hold, then a slow fading toward the next dusk
      const fadeAll = c > 38 ? 1 - sstep(38, 44, c) : 1;
      let lit = 0;
      for (let i = 0; i < NWIN; i++) {
        const on = sstep(wins[i][4], wins[i][4] + 1.2, c) * fadeAll;
        lit += on;
        const fl = 2.0 + 0.25 * Math.sin(t * 2.3 + i);
        tmp.copy(DARK).lerp(wcol[i], on).multiplyScalar(0.6 + on * fl);
        winMesh.setColorAt(i, tmp);
      }
      winMesh.instanceColor.needsUpdate = true;
      const glow = lit / NWIN;
      hazeMat.opacity = glow * 0.22;
      water.emissiveIntensity = glow * 0.35;
    },
  };
}
