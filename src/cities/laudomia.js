// LAUDOMIA — three cities: the living, the dead and the unborn.
// The same little town, three times. The living Laudomia: warm walls, lit windows,
// a tower on the square. The Laudomia of the dead: the same streets laid out in
// marble tombs and chapels among cypresses, with votive lights. And the Laudomia of
// the unborn, out of all proportion to the other two: the same plan swollen to a vast
// airy city of numberless grains of light, crowded into every niche, slowly
// breathing. Motes drift down from it into the living town; a small cortege walks
// from the living town to the dead one. The living are a thin moment between.
import { THREE, Builder, M, C, tree, Lines } from '../kit.js';
import { figure, geoOf, sstep } from './_d_kit.js';

export default function build({ rng, accent }) {
  const object = new THREE.Group();
  const b = new Builder();

  /* ---------- one plan for all three cities (unit radius) ---------- */
  const rot = rng.range(0, Math.PI / 2);
  const streets = [0, 1, 2, 3].map((k) => rot + (k * Math.PI) / 2);
  const plan = [];
  for (const [rr, n] of [[0.42, 7], [0.66, 11], [0.9, 15]]) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rr * 3;
      if (streets.some((s) => Math.abs(((a - s + Math.PI * 3) % (Math.PI * 2)) - Math.PI) * rr < 0.09)) continue;
      plan.push({ a, r: rr, w: rng.range(0.13, 0.2), d: rng.range(0.12, 0.17), h: rng.range(0.55, 1.0) * (1.25 - rr * 0.5), k: rng() });
    }
  }
  const towerP = { a: rot + Math.PI / 4, r: 0.18 };
  const toXZ = (p, S, cx, cz) => [cx + Math.cos(p.a) * p.r * S, cz + Math.sin(p.a) * p.r * S];

  const LIV = { x: 2.3, z: 2.0, S: 2.2 };
  const DEAD = { x: 5.7, z: 5.1, S: 2.2 };
  const UNB = { x: -3.2, z: -2.4, S: 6.0 };

  /* ---------- ground ---------- */
  b.cyl(10.45, 10.45, 0.06, { color: '#7d8460', seg: 64 });
  b.cyl(LIV.S + 0.35, LIV.S + 0.35, 0.03, { x: LIV.x, y: 0.06, z: LIV.z, color: '#cdb894', seg: 40 });
  b.cyl(DEAD.S + 0.4, DEAD.S + 0.4, 0.03, { x: DEAD.x, y: 0.06, z: DEAD.z, color: '#9fa08a', seg: 40 });
  b.cyl(UNB.S + 0.4, UNB.S + 0.5, 0.02, { x: UNB.x, y: 0.06, z: UNB.z, color: '#8a8a7a', seg: 48 });
  // the road between the living and the dead, and a path from the unborn
  const road = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    road.push([LIV.x + (DEAD.x - LIV.x) * t + Math.sin(t * Math.PI) * 0.8, LIV.z + (DEAD.z - LIV.z) * t - Math.sin(t * Math.PI) * 0.8]);
  }
  for (let i = 0; i < road.length - 1; i++) {
    const [x0, z0] = road[i], [x1, z1] = road[i + 1];
    b.box(0.45, 0.02, Math.hypot(x1 - x0, z1 - z0) + 0.05, { x: (x0 + x1) / 2, y: 0.07, z: (z0 + z1) / 2, ry: Math.atan2(x1 - x0, z1 - z0), color: '#bfa982' });
  }

  // fields and orchards around the living town
  for (let i = 0; i < 26; i++) {
    const [x, z] = rng.inDisc(10, 3);
    if (Math.hypot(x - UNB.x, z - UNB.z) < UNB.S + 0.6 || Math.hypot(x - LIV.x, z - LIV.z) < LIV.S + 0.6 || Math.hypot(x - DEAD.x, z - DEAD.z) < DEAD.S + 0.6) continue;
    if (rng.chance(0.5)) b.box(rng.range(0.8, 1.5), 0.02, rng.range(0.5, 0.9), { x, y: 0.06, z, ry: rng.range(0, 3), color: rng.pick(['#8f9a5e', '#a39a5e', '#7a8a52']) });
    else tree(b, { x, y: 0.06, z, h: rng.range(0.9, 1.4), kind: 'round', color: '#6f8f55', r: rng });
  }

  /* ---------- the living Laudomia ---------- */
  const walls = ['#efd7b0', '#e6b48c', '#f0e2c6', '#d9a07e', '#e9cfa2', '#f2e6d6'];
  for (const p of plan) {
    const [x, z] = toXZ(p, LIV.S, LIV.x, LIV.z);
    const w = p.w * LIV.S, d = p.d * LIV.S, h = p.h * 1.5 + 0.3;
    const ry = -p.a + Math.PI / 2;
    b.box(w, h, d, { x, y: 0.09, z, ry, color: walls[Math.floor(p.k * walls.length)] });
    b.geo(new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1).rotateY(Math.PI / 4).translate(0, 0.5, 0), { x, y: 0.09 + h, z, ry, sx: w + 0.08, sz: d + 0.08, sy: 0.3, color: p.k > 0.5 ? C.terracotta : C.brick, mat: M.flat });
    // lit windows facing outward and inward
    for (const s of [-1, 1]) {
      const lit = (p.k * 10 + s) % 2 > 0.6;
      b.quad(0.12, 0.16, { x: x + Math.cos(p.a) * s * (d / 2 + 0.01), y: 0.09 + h * 0.6, z: z + Math.sin(p.a) * s * (d / 2 + 0.01), ry: ry + (s > 0 ? 0 : Math.PI), mat: lit ? M.glow : M.smooth, color: lit ? C.lamp : '#3a3c44', glow: 1.8 });
    }
  }
  {
    const [tx, tz] = toXZ(towerP, LIV.S, LIV.x, LIV.z);
    b.box(0.42, 2.8, 0.42, { x: tx, y: 0.09, z: tz, color: '#ead8b8' });
    b.prism(0, 0.36, 0.7, 4, { x: tx, y: 2.89, z: tz, ry: Math.PI / 4, color: C.terracotta, mat: M.flat });
    b.quad(0.14, 0.2, { x: tx, y: 2.4, z: tz + 0.215, color: C.lamp, mat: M.glow, glow: 2 });
    b.cyl(0.25, 0.28, 0.25, { x: LIV.x - 0.1, y: 0.09, z: LIV.z - 0.1, color: C.ash, seg: 10 });
  }
  for (let i = 0; i < 9; i++) {
    const a = rng.range(0, 6.28), r = rng.range(0.2, 1.0) * LIV.S;
    figure(b, { x: LIV.x + Math.cos(a) * r * 0.5, y: 0.09, z: LIV.z + Math.sin(a) * r * 0.5, ry: rng.range(0, 6), h: 0.3, robe: rng.pick(['#a0524a', '#5d6d8a', '#c9a35a', '#6f7f6a']), hat: rng.pick(['veil', 'cap', null]), hatColor: C.ivory });
  }

  /* ---------- the Laudomia of the dead ---------- */
  const marble = ['#e9e4da', '#dcd6cb', '#cfcac0', '#e3ddd0', '#bfbab0'];
  for (const p of plan) {
    const [x, z] = toXZ(p, DEAD.S, DEAD.x, DEAD.z);
    const w = p.w * DEAD.S * 0.8, d = p.d * DEAD.S * 0.8;
    const ry = -p.a + Math.PI / 2;
    const col = marble[Math.floor(p.k * marble.length)];
    const kind = Math.floor(p.k * 4);
    if (kind === 0) {
      // little temple-tomb with a pediment
      b.box(w, 0.6, d, { x, y: 0.09, z, ry, color: col, mat: M.smooth });
      b.geo(new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1).rotateY(Math.PI / 4).translate(0, 0.5, 0), { x, y: 0.69, z, ry, sx: w + 0.06, sz: d + 0.06, sy: 0.22, color: col, mat: M.smooth });
    } else if (kind === 1) {
      // domed chapel
      b.box(w, 0.55, w, { x, y: 0.09, z, ry, color: col, mat: M.smooth });
      b.dome(w * 0.45, { x, y: 0.64, z, color: '#a9b0a8', mat: M.smooth, seg: 12 });
    } else if (kind === 2) {
      // stele and slab
      b.box(w * 0.9, 0.08, d * 1.2, { x, y: 0.09, z, ry, color: col, mat: M.smooth });
      b.box(w * 0.6, 0.45, 0.07, { x: x - Math.cos(p.a) * d * 0.5, y: 0.09, z: z - Math.sin(p.a) * d * 0.5, ry, color: col, mat: M.smooth });
    } else {
      // a sarcophagus on a step
      b.box(w, 0.1, d, { x, y: 0.09, z, ry, color: '#b8b2a6', mat: M.smooth });
      b.box(w * 0.75, 0.28, d * 0.6, { x, y: 0.19, z, ry, color: col, mat: M.smooth });
    }
    // a votive light
    if (p.k > 0.35) b.sphere(0.035, { x: x + Math.cos(p.a) * (d / 2 + 0.08), y: 0.14, z: z + Math.sin(p.a) * (d / 2 + 0.08), color: '#ff6a4a', mat: M.glow, glow: 2.6, seg: 5 });
  }
  {
    const [tx, tz] = toXZ(towerP, DEAD.S, DEAD.x, DEAD.z);
    b.box(0.32, 0.25, 0.32, { x: tx, y: 0.09, z: tz, color: '#dcd6cb', mat: M.smooth });
    b.prism(0.06, 0.14, 2.6, 4, { x: tx, y: 0.34, z: tz, ry: Math.PI / 4, color: '#e9e4da', mat: M.smooth }); // obelisk
    b.prism(0, 0.08, 0.2, 4, { x: tx, y: 2.94, z: tz, ry: Math.PI / 4, color: '#e9e4da', mat: M.smooth });
  }
  // cypresses along the streets of the dead, and the cemetery wall with its gate
  for (const s of streets) for (let k = 1; k <= 3; k++) {
    for (const side of [-1, 1]) {
      const r = (0.22 + k * 0.24) * DEAD.S, a = s + side * 0.11 / (0.22 + k * 0.24);
      tree(b, { x: DEAD.x + Math.cos(a) * r, y: 0.09, z: DEAD.z + Math.sin(a) * r, h: rng.range(1.0, 1.5), kind: 'cypress', r: rng });
    }
  }
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    const gate = Math.abs(((a - Math.atan2(LIV.z - DEAD.z, LIV.x - DEAD.x) + Math.PI * 3) % (Math.PI * 2)) - Math.PI) < 0.12;
    if (gate) continue;
    const R = DEAD.S + 0.3;
    b.box(2 * R * Math.sin(Math.PI / 40) + 0.02, 0.35, 0.1, { x: DEAD.x + Math.cos(a) * R, y: 0.09, z: DEAD.z + Math.sin(a) * R, ry: -a + Math.PI / 2, color: '#cfc8b8' });
  }
  // mourners
  for (let i = 0; i < 4; i++) {
    const p = plan[(i * 7) % plan.length];
    const [x, z] = toXZ(p, DEAD.S, DEAD.x, DEAD.z);
    figure(b, { x: x + Math.cos(p.a) * 0.4, y: 0.09, z: z + Math.sin(p.a) * 0.4, ry: -p.a - Math.PI / 2 + Math.PI, h: 0.3, robe: '#2e2a30', hat: 'veil', hatColor: '#1e1c22', arms: ['pray', 'pray'], lean: 0.2 });
  }

  /* ---------- the Laudomia of the unborn ---------- */
  // a faint foundation of the same plan, scratched in the ground
  for (const p of plan) {
    const [x, z] = toXZ(p, UNB.S, UNB.x, UNB.z);
    b.box(p.w * UNB.S, 0.015, p.d * UNB.S, { x, y: 0.08, z, ry: -p.a + Math.PI / 2, color: '#9a9886' });
  }
  object.add(b.build());

  const pts = [], cols = [], ph = [];
  const palette = [new THREE.Color('#fff1c8'), new THREE.Color('#ffd98a'), new THREE.Color('#cfe0ff'), new THREE.Color('#ffd0e0'), new THREE.Color('#e8fff4')];
  const addPt = (x, y, z) => {
    pts.push(x, y, z);
    const c = palette[Math.floor(rng() * palette.length)];
    cols.push(c.r, c.g, c.b);
    ph.push(rng.range(0, 100));
  };
  const H = 3.4; // unborn heights are swollen too
  const shell = (cx, cz, w, d, h, ry, n) => {
    const cs = Math.cos(ry), sn = Math.sin(ry);
    for (let i = 0; i < n; i++) {
      // mostly on the surfaces (so the houses read), some inside
      let u = rng.range(-0.5, 0.5), v = rng.range(0, 1), s = rng.range(-0.5, 0.5);
      const f = rng();
      if (f < 0.25) u = rng.chance(0.5) ? -0.5 : 0.5;
      else if (f < 0.5) s = rng.chance(0.5) ? -0.5 : 0.5;
      else if (f < 0.62) v = 1;
      const lx = u * w, lz = s * d;
      let y = v * h;
      // a pyramidal roof of grains
      if (f >= 0.62 && f < 0.72) { const k = rng(); y = h + k * h * 0.28; const sh = 1 - k; addPt(cx + (lx * sh) * cs + (lz * sh) * sn, 0.1 + y, cz - (lx * sh) * sn + (lz * sh) * cs); continue; }
      addPt(cx + lx * cs + lz * sn, 0.1 + y, cz - lx * sn + lz * cs);
    }
  };
  const edges = (cx, cz, w, d, h, ry) => {
    const cs = Math.cos(ry), sn = Math.sin(ry);
    const P = (lx, y, lz) => addPt(cx + lx * cs + lz * sn, 0.1 + y, cz - lx * sn + lz * cs);
    const hw = w / 2, hd = d / 2;
    const corners = [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]];
    for (let k = 0; k < 4; k++) {
      const [ax, az] = corners[k], [bx, bz] = corners[(k + 1) % 4];
      const n = Math.round(Math.hypot(bx - ax, bz - az) * 14);
      for (let i = 0; i < n; i++) { const t = i / n; P(ax + (bx - ax) * t, h, az + (bz - az) * t); P(ax + (bx - ax) * t, 0, az + (bz - az) * t); }
      const nv = Math.round(h * 12);
      for (let i = 0; i < nv; i++) P(ax, (i / nv) * h, az);
      // roof ridges to the apex
      const nr = 10;
      for (let i = 0; i < nr; i++) { const t = i / nr; P(ax * (1 - t), h + t * h * 0.28, az * (1 - t)); }
    }
  };
  for (const p of plan) {
    const [x, z] = toXZ(p, UNB.S, UNB.x, UNB.z);
    const w = p.w * UNB.S, d = p.d * UNB.S, h = (p.h * 1.5 + 0.3) * H;
    shell(x, z, w, d, h, -p.a + Math.PI / 2, Math.round(700 * w * d + 400));
    edges(x, z, w, d, h, -p.a + Math.PI / 2);
  }
  {
    const [tx, tz] = toXZ(towerP, UNB.S, UNB.x, UNB.z);
    shell(tx, tz, 0.42 * 2.4, 0.42 * 2.4, 2.8 * H, 0, 2600);
    edges(tx, tz, 0.42 * 2.4, 0.42 * 2.4, 2.8 * H, 0);
  }
  // and grains crowding every niche between: a vast, thin dust over the whole city
  for (let i = 0; i < 4000; i++) {
    const [dx, dz] = rng.inDisc(UNB.S + 0.4);
    const y = Math.pow(rng(), 2.2) * 11;
    addPt(UNB.x + dx, 0.1 + y, UNB.z + dz);
  }
  const ug = new THREE.BufferGeometry();
  ug.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  ug.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  ug.setAttribute('phase', new THREE.Float32BufferAttribute(ph, 1));
  const umat = new THREE.ShaderMaterial({
    uniforms: { uT: { value: 0 }, uC: { value: new THREE.Vector3(UNB.x, 0, UNB.z) }, uSwell: { value: 1 } },
    vertexShader: `attribute vec3 color; attribute float phase; uniform float uT; uniform vec3 uC; uniform float uSwell;
      varying vec3 vC; varying float vA;
      void main(){
        vec3 p = position;
        vec3 q = p - uC; q.xz *= uSwell; q.y *= mix(1.0, uSwell, 0.6);
        p = uC + q;
        p.y += sin(uT * 0.35 + phase) * 0.06;
        p.x += sin(uT * 0.21 + phase * 1.7) * 0.03;
        vC = color;
        vA = 0.45 + 0.55 * pow(0.5 + 0.5 * sin(uT * (0.6 + fract(phase) * 1.6) + phase), 3.0);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        float sz = 0.055 * 700.0 * projectionMatrix[1][1] / -mv.z;
        // far away, sub-pixel grains would pile up into a blown-out blob: fade them instead
        vA *= clamp(sz * sz / 9.0, 0.0, 1.0);
        gl_PointSize = max(sz, 1.0);
      }`,
    fragmentShader: `varying vec3 vC; varying float vA;
      void main(){ vec2 d = gl_PointCoord - 0.5; float r = dot(d, d); if (r > 0.25) discard;
        float a = smoothstep(0.25, 0.0, r) * vA * 0.55; gl_FragColor = vec4(vC * 1.35 * a, a); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const unborn = new THREE.Points(ug, umat);
  unborn.frustumCulled = false;
  object.add(unborn);

  /* ---------- births: motes drifting down into the living town ---------- */
  const NM = 24;
  const motes = new THREE.InstancedMesh(new THREE.SphereGeometry(0.05, 6, 4), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffe9b0').multiplyScalar(2.4), toneMapped: false }), NM);
  const mSeed = Array.from({ length: NM }, () => [rng(), rng.range(-1.5, 1.5), rng.range(2.5, 7), rng.range(-1.2, 1.2), rng.range(-1.2, 1.2)]);
  object.add(motes);
  // a cortege walking from the living to the dead
  const walkerGeo = geoOf((g) => figure(g, { h: 0.3, robe: '#2e2a30', hat: 'veil', hatColor: '#1e1c22', arms: ['fwd', 'fwd'] }));
  const NW = 5;
  const walkers = new THREE.InstancedMesh(walkerGeo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9 }), NW);
  walkers.castShadow = true;
  object.add(walkers);
  const coffinB = new Builder();
  coffinB.box(0.42, 0.1, 0.14, { y: 0.28, color: '#4a3426', mat: M.wood });
  const coffin = coffinB.build();
  object.add(coffin);
  const dummy = new THREE.Object3D();
  const roadAt = (t, out) => {
    const f = Math.min(0.9999, Math.max(0, t)) * (road.length - 1), i = Math.floor(f), fr = f - i;
    out[0] = road[i][0] + (road[i + 1][0] - road[i][0]) * fr;
    out[1] = road[i][1] + (road[i + 1][1] - road[i][1]) * fr;
    out[2] = Math.atan2(road[i + 1][0] - road[i][0], road[i + 1][1] - road[i][1]);
    return out;
  };
  const tmp = [0, 0, 0];
  const CORT = 40;
  return {
    object,
    update(t) {
      umat.uniforms.uT.value = t;
      // the unborn swell, slowly, as the city grows
      umat.uniforms.uSwell.value = 1 + 0.035 * Math.sin(t * 0.12);
      for (let i = 0; i < NM; i++) {
        const [o, sx, h0, ex, ez] = mSeed[i];
        const u = (o + t * 0.03) % 1;
        const e = u * u * (3 - 2 * u);
        const x0 = UNB.x + 1.5 + sx, z0 = UNB.z + 1.5 - sx, y0 = h0;
        const x1 = LIV.x + ex, z1 = LIV.z + ez;
        dummy.position.set(x0 + (x1 - x0) * e, y0 + (0.25 - y0) * e + Math.sin(Math.PI * u) * 1.2, z0 + (z1 - z0) * e);
        dummy.scale.setScalar(Math.max(0.001, Math.sin(Math.PI * u)));
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        motes.setMatrixAt(i, dummy.matrix);
      }
      motes.instanceMatrix.needsUpdate = true;
      // the cortege
      const c = (t % CORT) / CORT;
      for (let i = 0; i < NW; i++) {
        const u = sstep(0.05, 0.9, c) * 1.0 - i * 0.035;
        roadAt(u, tmp);
        const side = i === 0 ? 0 : (i % 2 ? -0.13 : 0.13);
        dummy.position.set(tmp[0] + Math.cos(tmp[2]) * side, 0.09 + Math.abs(Math.sin(t * 4 + i)) * 0.01, tmp[1] - Math.sin(tmp[2]) * side);
        dummy.rotation.set(0, tmp[2], 0);
        const vis = c > 0.05 && c < 0.95;
        dummy.scale.setScalar(vis ? 1 : 0.0001);
        dummy.updateMatrix();
        walkers.setMatrixAt(i, dummy.matrix);
      }
      walkers.instanceMatrix.needsUpdate = true;
      roadAt(sstep(0.05, 0.9, c) - 0.05, tmp);
      coffin.position.set(tmp[0], 0.09, tmp[1]);
      coffin.rotation.y = tmp[2] + Math.PI / 2;
      coffin.visible = c > 0.05 && c < 0.95;
      void accent; void Lines;
    },
  };
}
