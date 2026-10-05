// ADELMA — every face resembles someone already dead.
// A harbour at dusk. A boat is moored at the quay; a sailor throws a rope to
// another, an old man loads baskets of sea urchins, a woman haggles over a pumpkin,
// a fishmonger lays out his catch. Lanterns sway on their posts. Everyone on the quay
// is pale, translucent, faintly lit from within, as the dead are in memory. Out on
// the water a small rowing boat approaches: the one warm, solid figure in it is the
// traveller, arriving at the city one reaches in dying.
import { THREE, Builder, M, C, Lines } from '../kit.js';
import { figure, warmLit, softTex, geoOf } from './_d_kit.js';

export default function build({ rng, accent }) {
  const b = new Builder();
  const object = new THREE.Group();
  const R0 = 10.45;
  const QZ = 0.8; // quay edge
  const LH = 0.6; // quay height

  /* ---------- sea and quay ---------- */
  b.cyl(R0, R0, 0.05, { color: '#22343c', seg: 72 });
  const seaMat = new THREE.MeshStandardMaterial({ color: '#2f5868', roughness: 0.62, metalness: 0.0, transparent: true, opacity: 0.92 });
  const sea = new THREE.Mesh(new THREE.CircleGeometry(R0 - 0.02, 72).rotateX(-Math.PI / 2), seaMat);
  sea.position.y = 0.2;
  sea.receiveShadow = true;
  object.add(sea);
  // land: everything behind the quay line, as one slab
  const land = [];
  const a0 = Math.asin(QZ / R0);
  for (let i = 0; i <= 48; i++) {
    const a = a0 + ((Math.PI - 2 * a0) * i) / 48; // from right end, through the back... (z positive side) -> flip
    land.push([Math.cos(a) * R0, -Math.sin(a) * R0]);
  }
  // land polygon: arc on the back side (z<0) plus the quay line at z=QZ
  const back = [];
  const aL = Math.PI - Math.asin(QZ / R0), aR = Math.asin(QZ / R0);
  for (let i = 0; i <= 60; i++) {
    const a = aR - ((aR - (aL - Math.PI * 2)) * i) / 60; // aR down to aL-2π (through -π/2)
    back.push([Math.cos(a) * R0, Math.sin(a) * R0]);
  }
  void land;
  b.slab(back, LH, { color: '#8a8780' });
  // dressed stone edge of the quay, blocks and bollards
  for (let x = -10; x < 10; x += 0.55) {
    if (Math.hypot(x, QZ) > R0 - 0.2) continue;
    b.box(0.53, LH + 0.02, 0.3, { x: x + 0.27, y: 0.0, z: QZ - 0.14, color: rng.pick(['#8c8c86', '#7e807c', '#94938b']) });
  }
  // the stone mole jutting into the harbour
  const MX = 3.4;
  b.box(1.4, LH, 4.4, { x: MX, z: QZ + 2.2, color: '#7a7b77' });
  b.box(1.5, 0.12, 4.5, { x: MX, y: LH, z: QZ + 2.2, color: '#8c8c86' });
  b.cyl(0.36, 0.5, 3.4, { x: MX, y: LH + 0.12, z: QZ + 4.1, color: '#e8e2d6', mat: M.smooth, seg: 14 });
  for (const yy of [0.9, 2.2]) b.cyl(0.5 - yy * 0.045, 0.52 - yy * 0.045, 0.45, { x: MX, y: LH + 0.12 + yy, z: QZ + 4.1, color: '#a8463a', mat: M.smooth, seg: 14 });
  b.cyl(0.55, 0.55, 0.08, { x: MX, y: LH + 3.5, z: QZ + 4.1, color: '#3a3a3e', mat: M.metal, seg: 14 });
  b.cyl(0.3, 0.3, 0.5, { x: MX, y: LH + 3.58, z: QZ + 4.1, color: '#ffe0a8', mat: M.glow, glow: 2.4, seg: 12 });
  b.cone(0.38, 0.4, { x: MX, y: LH + 4.08, z: QZ + 4.1, color: '#3a3a3e', mat: M.metal, seg: 12 });
      for (const bx of [-6.5, -3.8, -0.8, 1.6]) {
    b.cyl(0.08, 0.1, 0.22, { x: bx, y: LH, z: QZ - 0.25, color: '#2e3134', mat: M.rough_metal, seg: 8 });
    b.cyl(0.11, 0.11, 0.04, { x: bx, y: LH + 0.22, z: QZ - 0.25, color: '#2e3134', mat: M.rough_metal, seg: 8 });
  }
  // steps down to the water
  for (let k = 0; k < 5; k++) b.box(0.9, LH - k * 0.12, 0.2, { x: -8.0, z: QZ + 0.1 + k * 0.2, color: '#86857f' });
  // paving on the quay
  for (let i = 0; i < 260; i++) {
    const x = rng.range(-9.5, 9.5), z = rng.range(-3.2, QZ - 0.4);
    if (Math.hypot(x, z) > 10) continue;
    b.box(rng.range(0.3, 0.45), 0.02, rng.range(0.2, 0.3), { x, y: LH, z, color: rng.pick(['#7f7f7a', '#8a8984', '#75766f', '#92918a']) });
  }

  /* ---------- the harbour front: warehouses and narrow houses, all slate and dusk ---------- */
  const walls = ['#b8a48a', '#c2a088', '#9fb0ac', '#b9ac8e', '#c9b79a', '#a8968c', '#9aa6a0', '#c4a49a'];
  const roofs = ['#8a5a48', '#7a5e52', '#6a5a5a', '#94634c'];
  let x = -9.3;
  while (x < 9.3) {
    const w = rng.range(1.1, 2.0);
    const xc = x + w / 2;
    x += w + 0.05;
    const zf = -3.6 - Math.max(0, Math.abs(xc) - 5) * 0.7;
    const d = 2.2;
    if (Math.hypot(xc, zf - d) > 10.3 || Math.hypot(Math.abs(xc) + w / 2, zf) > 10.2) continue;
    const h = rng.range(1.8, 3.6);
    b.box(w, h, d, { x: xc, y: LH, z: zf - d / 2, color: rng.pick(walls) });
    b.geo(new THREE.ExtrudeGeometry(new THREE.Shape([new THREE.Vector2(-w / 2 - 0.06, 0), new THREE.Vector2(w / 2 + 0.06, 0), new THREE.Vector2(0, 0.7)]), { depth: d + 0.1, bevelEnabled: false }).translate(0, 0, -(d + 0.1) / 2), { x: xc, y: LH + h, z: zf - d / 2, color: rng.pick(roofs), mat: M.flat });
    // doors (warehouse arches) and windows, few lit
    const tavern = rng.chance(0.5);
    const dw = Math.min(0.7, w * 0.45);
    b.box(dw, 0.75, 0.03, { x: xc, y: LH, z: zf + 0.01, color: tavern ? '#ffb46a' : '#2c2a2c', mat: tavern ? M.glow : M.wood, glow: 1.2 });
    b.geo(new THREE.CircleGeometry(dw / 2, 10, 0, Math.PI), { x: xc, y: LH + 0.75, z: zf + 0.011, color: tavern ? '#ffb46a' : '#2c2a2c', mat: tavern ? M.glow : M.wood, glow: 1.2 });
    if (tavern || rng.chance(0.4)) b.box(w * 0.9, 0.03, 0.6, { x: xc, y: LH + 1.15, z: zf + 0.28, rx: 0.3, color: rng.pick(['#8a4a3a', '#5a6a5a', '#9a7a4a', '#4a5a6a', accent]), mat: M.cloth });
    const floors = Math.floor((h - 1.0) / 0.75);
    for (let f = 0; f < floors; f++) for (let k = 0; k < Math.max(1, Math.round(w / 0.6)); k++) {
      const u = -w / 2 + (k + 0.5) * (w / Math.max(1, Math.round(w / 0.6)));
      const lit = rng.chance(0.42);
      b.quad(0.2, 0.32, { x: xc + u, y: LH + 1.3 + f * 0.75, z: zf + 0.012, mat: lit ? M.glow : M.smooth, color: lit ? C.lamp : '#2a2e33', glow: 1.4 });
    }
  }
  // a church tower at the back
  b.box(1.0, 5.2, 1.0, { x: -2.2, y: LH, z: -7.0, color: '#9ea3a2' });
  b.prism(0, 0.8, 1.6, 4, { x: -2.2, y: LH + 5.2, z: -7.0, ry: Math.PI / 4, color: '#4f5862', mat: M.flat });
  for (const [dx, dz] of [[0, 0.505], [0.505, 0]]) b.quad(0.3, 0.5, { x: -2.2 + dx, y: LH + 4.4, z: -7.0 + dz, ry: dx ? Math.PI / 2 : 0, color: '#1f2226', mat: M.smooth });

  // quay furniture: crates, barrels, nets, a wooden crane
  for (let i = 0; i < 12; i++) {
    const cx = rng.range(-7.5, 1.5), cz = rng.range(-3.0, -1.4);
    if (rng.chance(0.5)) b.box(0.3, 0.26, 0.3, { x: cx, y: LH, z: cz, ry: rng.range(0, 1), color: rng.pick(['#7a6a58', '#6d6050']), mat: M.wood });
    else b.cyl(0.13, 0.15, 0.36, { x: cx, y: LH, z: cz, color: '#5f5244', mat: M.wood, seg: 10 });
  }
  b.cyl(0.08, 0.1, 2.6, { x: 0.9, y: LH, z: 0.0, color: '#4d4238', mat: M.wood, seg: 6 });
  b.rod([0.9, LH + 2.4, 0.0], [-0.6, LH + 2.9, 1.4], 0.05, { color: '#4d4238', mat: M.wood });
  // nets hanging to dry
  b.quad(1.6, 0.7, { x: -6.0, y: LH + 0.75, z: -2.0, color: '#59606a', mat: M.cloth });
  b.rod([-6.8, LH, -2.0], [-6.8, LH + 1.2, -2.0], 0.03, { color: '#4d4238' });
  b.rod([-5.2, LH, -2.0], [-5.2, LH + 1.2, -2.0], 0.03, { color: '#4d4238' });

  // the stalls: fishmonger with an awning, the pumpkin seller
  const stall = (sx, sz, ry, cloth) => {
    b.push({ x: sx, y: LH, z: sz, ry });
    b.box(1.1, 0.45, 0.5, { color: '#6a5e52', mat: M.wood });
    for (const s of [-1, 1]) b.rod([s * 0.52, 0, -0.3], [s * 0.52, 1.1, -0.3], 0.02, { color: '#3a332c' });
    b.box(1.25, 0.03, 0.8, { y: 1.1, z: 0.05, rx: 0.25, color: cloth, mat: M.cloth });
    b.pop();
  };
  stall(-3.0, -1.0, 0, '#7f8f96');
  // fish on the slab: silver and pale
  for (let k = 0; k < 9; k++) b.sphere(0.06, { x: -3.4 + (k % 5) * 0.18, y: LH + 0.48, z: -1.0 + Math.floor(k / 5) * 0.14, sx: 2.2, sy: 0.5, ry: rng.range(-0.3, 0.3), color: rng.pick(['#c9d0d6', '#aab4bc', '#d6cdc4']), mat: M.metal, seg: 6 });
  stall(-0.4, -1.4, -0.15, '#8f8476');
  // pumpkins — the only bright colour on the quay
  for (let k = 0; k < 5; k++) b.sphere(0.13, { x: -0.75 + k * 0.18, y: LH + 0.55, z: -1.35, sy: 0.75, color: '#d77a2a', mat: M.smooth, seg: 10 });
  const pumpkin = [-0.1, LH + 0.55, -0.7];
  // baskets of sea urchins
  const urchins = [];
  for (let k = 0; k < 4; k++) {
    const bx = -5.5 + (k % 2) * 0.5, bz = 0.0 + Math.floor(k / 2) * 0.45;
    b.cyl(0.2, 0.16, 0.22, { x: bx, y: LH, z: bz, color: '#8a7550', mat: M.wood, seg: 10, open: false });
    for (let u = 0; u < 7; u++) urchins.push([bx + rng.range(-0.11, 0.11), LH + 0.24, bz + rng.range(-0.11, 0.11)]);
  }
  for (const [ux, uy, uz] of urchins) b.geo(new THREE.IcosahedronGeometry(0.055, 0), { x: ux, y: uy, z: uz, ry: rng.range(0, 3), color: '#3a2440', mat: M.flat });

  object.add(b.build());

  /* ---------- the moored boat (bobbing) ---------- */
  const bb = new Builder();
  bb.geo(new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), { sx: 3.0, sy: 0.75, sz: 0.85, y: 0.55, color: '#5a5048', mat: M.wood });
  bb.box(5.4, 0.06, 1.4, { y: 0.52, color: '#7a6a58', mat: M.wood });
  bb.box(5.6, 0.12, 0.08, { y: 0.55, z: 0.82, color: '#3e3630', mat: M.wood });
  bb.box(5.6, 0.12, 0.08, { y: 0.55, z: -0.82, color: '#3e3630', mat: M.wood });
  bb.cyl(0.06, 0.08, 4.4, { x: 0.3, y: 0.55, color: '#4d4238', mat: M.wood, seg: 6 });
  bb.rod([0.3, 1.2, 0], [2.6, 1.6, 0], 0.035, { color: '#4d4238' });
  bb.geo(new THREE.CylinderGeometry(0.16, 0.16, 2.2, 8).rotateZ(Math.PI / 2 - 0.17), { x: 1.45, y: 1.48, color: '#c9bfae', mat: M.cloth }); // furled sail
  bb.box(1.0, 0.5, 0.9, { x: -1.6, y: 0.58, color: '#6a5e52', mat: M.wood }); // little cabin
  bb.box(1.1, 0.05, 1.0, { x: -1.6, y: 1.08, color: '#4a4440', mat: M.wood });
  bb.sphere(0.07, { x: -2.6, y: 1.4, color: C.lamp, mat: M.glow, glow: 3, seg: 8 });
  bb.rod([-2.6, 0.55, 0], [-2.6, 1.36, 0], 0.02, { color: '#2f2f35' });
  const boatG = bb.build();
  const boat = new THREE.Group();
  boat.add(boatG);
  boat.position.set(-2.3, 0.0, QZ + 1.25);
  object.add(boat);

  /* ---------- the ghostly people ---------- */
  const ghost = warmLit('#c9d8f2', 1.35, { transparent: true, opacity: 0.68, depthWrite: false, roughness: 0.5 });
  ghost.userData.noShadow = true;
  const gb = new Builder();
  const pale = ['#e6e8ec', '#d6dce4', '#ece6dc', '#cfd6dc', '#e2dde4'];
  const auras = [];
  const pg = (o) => auras.push([o.x, o.y + 0.32, o.z]) && figure(gb, { mat: ghost, robe: rng.pick(pale), top: rng.pick(pale), skin: '#f0ece6', hatColor: rng.pick(pale), h: 0.62, ...o });
  // sailor on the quay catching the rope; sailor on the boat throws it
  pg({ x: -0.6, y: LH, z: QZ - 0.4, ry: Math.PI - 0.4, arms: ['out', 'up'], hat: 'cap' });
  // old man with urchin baskets, stooped; a boy carrying one
  pg({ x: -5.0, y: LH, z: 0.3, ry: -0.9, arms: ['fwd', 'fwd'], lean: 0.45, hat: 'brim' });
  pg({ x: -4.4, y: LH, z: -0.4, ry: 0.4, h: 0.3, arms: ['carry', 'carry'] });
  // the woman haggling over a pumpkin with the seller
  pg({ x: -0.15, y: LH, z: -0.45, ry: Math.PI + 0.2, arms: ['point', 'hip'], hat: 'veil', skirt: 1.3 });
  pg({ x: -0.5, y: LH, z: -1.85, ry: 0.1, arms: ['out', 'carry'], hat: 'cap', fat: 1.2 });
  // the fishmonger and a customer
  pg({ x: -3.0, y: LH, z: -1.6, ry: 0, arms: ['fwd', 'up'], hat: 'cap' });
  pg({ x: -2.7, y: LH, z: -0.25, ry: Math.PI, arms: ['down', 'chin'], hat: 'veil', skirt: 1.2 });
  // more townsfolk: an old woman on a bench, two men talking, a priest, a child by the water
  pg({ x: 1.3, y: LH, z: -2.2, ry: -0.6, arms: ['back', 'back'], hat: 'brim' });
  pg({ x: 1.8, y: LH, z: -2.5, ry: 2.4, arms: ['out', 'down'] });
  pg({ x: -7.2, y: LH, z: -1.2, ry: 0.7, arms: ['pray', 'pray'], hat: 'hood' });
  pg({ x: 3.4, y: LH + 0.12, z: QZ + 3.2, ry: 0.2, h: 0.28, arms: ['point', 'down'] });
  pg({ x: 5.6, y: LH, z: -1.4, ry: -1.2, arms: ['fwd', 'down'], lean: 0.3, hat: 'veil' });
  pg({ x: 6.6, y: LH, z: -2.6, ry: -2.2, arms: ['down', 'down'], hat: 'brim' });
  // more of them, along the quay and out on the mole, looking toward the arriving boat
  for (const [gx, gz] of [[-8.6, 0.0], [-6.3, 0.4], [2.4, 0.1], [4.4, -0.3], [7.4, -1.2], [MX - 0.3, QZ + 1.0], [MX + 0.35, QZ + 2.2], [-1.9, -2.6], [0.4, -3.0], [3.3, -2.9]]) {
    pg({ x: gx, y: gz > QZ ? LH + 0.12 : LH, z: gz, ry: Math.atan2(-6 - gx, 9 - gz) + rng.range(-0.4, 0.4), arms: [rng.pick(['down', 'fwd', 'chin']), rng.pick(['down', 'wave', 'point', 'heart'])], hat: rng.pick(['veil', 'cap', 'brim', null]), skirt: rng.pick([0.9, 1.2]) });
  }
  const ghostsOnBoat = new Builder();
  figure(ghostsOnBoat, { mat: ghost, robe: '#dfe4ea', top: '#e9ecef', skin: '#f0ece6', h: 0.42, x: 1.0, y: 0.58, z: -0.45, ry: Math.PI, arms: ['up', 'out'], hat: 'cap', hatColor: '#d6dce4' });
  figure(ghostsOnBoat, { mat: ghost, robe: '#d6dce4', skin: '#f0ece6', h: 0.42, x: -0.6, y: 0.58, z: 0.2, ry: -0.5, arms: ['carry', 'carry'], lean: 0.2 });
  boat.add(ghostsOnBoat.build({ shadows: false }));
  const ghosts = gb.build({ shadows: false });
  object.add(ghosts);
  // the rope in the air between the sailors
  const rope = new Lines().rope([-0.6 + 0.2, LH + 0.45, QZ - 0.3], [-1.3, 1.0, QZ + 0.85], -0.25, '#cdbfa6', 10, 1).build();
  object.add(rope);

  // a faint pallor around each of them
  {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(auras.flat(), 3));
    const auraMat = new THREE.PointsMaterial({ map: softTex(), color: new THREE.Color('#9fb8e0'), size: 1.7, sizeAttenuation: true, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending });
    object.add(new THREE.Points(g, auraMat));
  }
  // the town behind the harbour front: roofs, a nave, trees
  const tb = new Builder();
  for (let i = 0; i < 22; i++) {
    const [hx, hz] = rng.inDisc(9.6, 6.6);
    if (hz > -5.6) continue;
    const w = rng.range(1.0, 1.6), d = rng.range(1.0, 1.5), h = rng.range(1.4, 2.6), ry = -Math.atan2(hz, hx) + Math.PI / 2;
    tb.box(w, h, d, { x: hx, y: LH, z: hz, ry, color: rng.pick(walls) });
    tb.geo(new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1).rotateY(Math.PI / 4).translate(0, 0.5, 0), { x: hx, y: LH + h, z: hz, ry, sx: w + 0.1, sz: d + 0.1, sy: 0.6, color: rng.pick(roofs), mat: M.flat });
    for (let k = 0; k < 3; k++) {
      const lit = rng.chance(0.25), fa = ry + rng.int(0, 3) * Math.PI / 2;
      const off = 0.52 * (k % 2 ? w : d);
      tb.quad(0.18, 0.28, { x: hx + Math.sin(fa) * off, y: LH + 0.6 + rng.range(0, h - 1), z: hz + Math.cos(fa) * off, ry: fa, color: lit ? C.lamp : '#2a2e33', mat: lit ? M.glow : M.smooth, glow: 1.4 });
    }
  }
  tb.box(1.6, 2.2, 3.0, { x: -2.2, y: LH, z: -8.8, color: '#9ea3a2' });
  tb.geo(new THREE.ExtrudeGeometry(new THREE.Shape([new THREE.Vector2(-0.9, 0), new THREE.Vector2(0.9, 0), new THREE.Vector2(0, 0.8)]), { depth: 3.1, bevelEnabled: false }).translate(0, 0, -1.55), { x: -2.2, y: LH + 2.2, z: -8.8, color: '#4f5862', mat: M.flat });
  object.add(tb.build());
  /* ---------- lanterns along the quay (swaying) ---------- */
  const lanternSpots = [[-6.8, QZ - 0.5], [-4.0, QZ - 0.5], [-1.5, QZ - 0.5], [1.4, QZ - 0.5], [MX - 0.55, QZ + 1.6], [MX + 0.55, QZ + 3.0], [5.8, -0.5], [-8.8, -0.6]];
  const frameGeo = geoOf((g) => {
    g.box(0.17, 0.04, 0.17, { y: -0.14, color: '#2f2f35' });
    g.cone(0.1, 0.07, { y: -0.1, color: '#2f2f35', seg: 4, ry: Math.PI / 4 });
    g.box(0.14, 0.03, 0.14, { y: -0.36, color: '#2f2f35' });
    g.rod([0, 0, 0], [0, -0.1, 0], 0.01, { color: '#2f2f35' });
  });
  const glowGeo = geoOf((g) => g.box(0.11, 0.19, 0.11, { y: -0.33, color: '#ffffff' }), M.glow);
  glowGeo.deleteAttribute('color');
  const NL = lanternSpots.length;
  const lFrames = new THREE.InstancedMesh(frameGeo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.4, metalness: 0.7 }), NL);
  const lGlows = new THREE.InstancedMesh(glowGeo, new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffc477').multiplyScalar(2.6), toneMapped: false }), NL);
  object.add(lFrames, lGlows);
  const postB = new Builder();
  for (const [px, pz] of lanternSpots) {
    postB.cyl(0.035, 0.05, 1.7, { x: px, y: LH, z: pz, color: '#2f2f35', mat: M.metal, seg: 6 });
    postB.rod([px, LH + 1.65, pz], [px + 0.3, LH + 1.65, pz], 0.02, { color: '#2f2f35', mat: M.metal });
  }
  object.add(postB.build());

  // reflections of the lanterns on the water, small boats and buoys in the harbour
  const refl = new Builder();
  for (const [px, pz] of [[-6.8, QZ - 0.5], [-4.0, QZ - 0.5], [-1.5, QZ - 0.5], [1.4, QZ - 0.5], [MX - 0.55, QZ + 1.6], [MX + 0.55, QZ + 3.0], [MX - 0.3, QZ + 4.4], [MX + 0.6, QZ + 4.4]]) {
    for (let k = 0; k < 8; k++) {
      refl.plane(0.1 + k * 0.035, 0.18, { x: px + 0.3 + Math.sin(k * 1.7 + px) * 0.08, y: 0.215, z: Math.max(pz, QZ) + 0.45 + k * 0.3, color: '#ffb36a', mat: M.glow, glow: 1.5 - k * 0.17 });
    }
  }
  const smallB = new Builder();
  for (const [bx, bz, ry, col] of [[6.2, 3.0, 0.4, '#6a5a4a'], [5.4, 4.6, 0.2, '#4f5a62'], [-7.0, 2.6, 1.3, '#5a4a40']]) {
    smallB.geo(new THREE.SphereGeometry(1, 10, 5, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), { x: bx, y: 0.26, z: bz, ry, sx: 0.35, sy: 0.2, sz: 0.95, color: col, mat: M.wood });
  }
  for (const [bx, bz] of [[0.5, 6.0], [-3.5, 7.2], [6.8, 6.4]]) smallB.sphere(0.12, { x: bx, y: 0.24, z: bz, color: '#8a3a2a', seg: 8 });
  object.add(refl.build({ shadows: false }));
  object.add(smallB.build());
  /* ---------- the traveller's rowing boat ---------- */
  const rb = new Builder();
  rb.geo(new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), { sx: 0.35, sy: 0.22, sz: 0.85, y: 0.22, color: '#7a4a2a', mat: M.wood });
  rb.box(0.6, 0.03, 0.12, { y: 0.2, color: '#5a3a24', mat: M.wood });
  figure(rb, { y: 0.05, z: 0.15, ry: Math.PI, robe: '#9c3a2a', top: '#c48a3a', hat: 'brim', hatColor: '#3a2a22', arms: ['fwd', 'fwd'], h: 0.42, skirt: 0.8 });
  rb.rod([-0.45, 0.25, 0.1], [0.45, 0.25, 0.25], 0.015, { color: '#5a3a24' });
  rb.rod([0, 0.22, -0.7], [0, 0.6, -0.75], 0.012, { color: '#2f2f35' });
  rb.sphere(0.05, { y: 0.62, z: -0.75, color: C.lamp, mat: M.glow, glow: 3.2, seg: 8 });
  const rowboat = rb.build();
  const traveller = new THREE.Group();
  traveller.add(rowboat);
  object.add(traveller);

  /* ---------- mist on the water, gulls ---------- */
  const NMI = 40;
  const mistPos = new Float32Array(NMI * 3);
  const mistSeed = Array.from({ length: NMI }, () => [rng.range(-10, 10), rng.range(0.35, 0.8), rng.range(2.0, 9.5), rng.range(0.08, 0.22)]);
  const mistG = new THREE.BufferGeometry();
  mistG.setAttribute('position', new THREE.BufferAttribute(mistPos, 3));
  const mist = new THREE.Points(mistG, new THREE.PointsMaterial({ map: softTex(), color: new THREE.Color('#93a6b8'), size: 3.6, sizeAttenuation: true, transparent: true, opacity: 0.3, depthWrite: false }));
  mist.frustumCulled = false;
  object.add(mist);
  const NG = 7;
  const gullGeo = new THREE.BufferGeometry();
  gullGeo.setAttribute('position', new THREE.Float32BufferAttribute([-0.22, 0.05, 0, 0, 0, 0.04, 0, 0, -0.04, 0.22, 0.05, 0, 0, 0, -0.04, 0, 0, 0.04], 3));
  gullGeo.computeVertexNormals();
  const gulls = new THREE.InstancedMesh(gullGeo, new THREE.MeshBasicMaterial({ color: '#e6eaee', side: THREE.DoubleSide, transparent: true, opacity: 0.8 }), NG);
  const gSeed = Array.from({ length: NG }, () => [rng.range(2, 6), rng.range(3, 6), rng.range(0, 6.28), rng.range(0.15, 0.3), rng.range(-2, 2), rng.range(-1, 3)]);
  object.add(gulls);
  const dummy = new THREE.Object3D();

  // the lighthouse beam, sweeping slowly over the water
  const beamG = new THREE.ConeGeometry(0.9, 6.5, 16, 1, true).rotateZ(Math.PI / 2).translate(3.25, 0, 0);
  const beamM = new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffe6b0'), transparent: true, opacity: 0.09, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false });
  const beam = new THREE.Mesh(beamG, beamM);
  beam.position.set(MX, LH + 3.83, QZ + 4.1);
  object.add(beam);
  const ARRIVE = 46;
  return {
    object,
    update(t) {
      // the moored boat bobs; lanterns sway
      boat.position.y = 0.0 + Math.sin(t * 0.9) * 0.04;
      boat.rotation.x = Math.sin(t * 0.7) * 0.03;
      boat.rotation.z = Math.sin(t * 0.55 + 1) * 0.02;
      for (let i = 0; i < NL; i++) {
        const [px, pz] = lanternSpots[i];
        dummy.position.set(px + 0.3, LH + 1.65, pz);
        dummy.rotation.set(Math.sin(t * 0.9 + i * 2) * 0.08, 0, Math.sin(t * 1.3 + i) * 0.12);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        lFrames.setMatrixAt(i, dummy.matrix);
        lGlows.setMatrixAt(i, dummy.matrix);
      }
      lFrames.instanceMatrix.needsUpdate = true;
      lGlows.instanceMatrix.needsUpdate = true;
      // the dead breathe: their pallor wavers
      ghost.opacity = 0.7 + 0.12 * Math.sin(t * 0.4);
      // the traveller rows in from the open sea, again and again
      const c = (t % ARRIVE) / ARRIVE;
      const zz = 10.5 - c * 7.0, xx = -6.0 + c * 4.5 + Math.sin(c * 4) * 0.5;
      traveller.position.set(xx, 0.08 + Math.sin(t * 1.4) * 0.03, zz);
      traveller.rotation.y = Math.atan2(4.5, -7.0) + Math.PI;
      traveller.visible = Math.hypot(xx, zz) < 10.2;
      beam.rotation.set(0, t * 0.35, -0.06);
      traveller.rotation.z = Math.sin(t * 1.2) * 0.04;
      // mist drifts over the water
      for (let i = 0; i < NMI; i++) {
        const [mx, my, mz, sp] = mistSeed[i];
        let x = ((mx + t * sp + 10) % 20) - 10;
        const z = mz;
        const out = Math.hypot(x, z) > 9.6;
        mistPos[i * 3] = x; mistPos[i * 3 + 1] = out ? -50 : my; mistPos[i * 3 + 2] = z;
      }
      mistG.attributes.position.needsUpdate = true;
      // gulls circle above the harbour
      for (let i = 0; i < NG; i++) {
        const [r, h, ph, sp, cx, cz] = gSeed[i];
        const a = ph + t * sp;
        dummy.position.set(cx + Math.cos(a) * r, h + Math.sin(t * 0.7 + i) * 0.3, cz + Math.sin(a) * r);
        dummy.rotation.set(0, -a, Math.sin(t * 6 + i) * 0.35);
        dummy.updateMatrix();
        gulls.setMatrixAt(i, dummy.matrix);
      }
      gulls.instanceMatrix.needsUpdate = true;
      void pumpkin; void accent;
    },
  };
}
