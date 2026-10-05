// Procopia — every year Marco takes the same room at the same inn, and looks out of the same window:
// a ditch, a bridge, a little wall, a medlar tree, a field of corn, a bramble patch, a chicken yard,
// the yellow crest of a hill, a white cloud. One year a face peers out of the leaves; then six; then
// dozens, crowding the field, the bridge, the hill — until twenty-six people stand in his room and
// the landscape is gone. All of them round-faced, all of them very polite.
// One 40-second cycle is one decade of visits; then the view empties, and the years begin again.
import { THREE, Builder, M, C, Lines } from '../kit.js';
import { terrainGeo } from './_e_util.js';

export default function build({ rng, accent }) {
  const b = new Builder();
  const object = new THREE.Group();

  /* ------------------------------------------------------ the landscape -- */
  const DITCH_Z = 2.6;
  const H = (x, z) => {
    let h = 0.35;
    // the hill with its yellow crest, at the back of the view
    const dh = Math.hypot((x + 0.8) / 1.25, (z + 7.4) / 0.85);
    h += 3.2 * Math.exp(-dh * dh / 10);
    // gentle swells
    h += 0.12 * Math.sin(x * 0.7 + 1) * Math.cos(z * 0.5);
    // the ditch, cut across the view
    const dd = Math.abs(z - (DITCH_Z + 0.25 * Math.sin(x * 0.6)));
    if (dd < 0.55) h -= 0.3 * (1 - (dd / 0.55) ** 2);
    return Math.max(0.05, h);
  };
  const tg = terrainGeo(H, 10.4, 40, 120, 0.02);
  {
    // colour by height: meadow, then the yellow crest
    const g2 = tg.toNonIndexed();
    const p = g2.attributes.position;
    const col = new Float32Array(p.count * 3);
    const meadow = new THREE.Color('#8fae5c'), meadow2 = new THREE.Color('#7f9f52'), crest = new THREE.Color('#e3c04f'), mud = new THREE.Color('#7a6a4a');
    const c = new THREE.Color();
    for (let i = 0; i < p.count; i += 3) {
      const y = (p.getY(i) + p.getY(i + 1) + p.getY(i + 2)) / 3;
      const x = (p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3, z = (p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2)) / 3;
      if (y < 0.2) c.copy(mud);
      else if (y > 2.1) c.copy(crest).lerp(meadow, Math.max(0, (2.6 - y)) * 0.6);
      else c.copy(rng() < 0.5 ? meadow : meadow2).lerp(crest, Math.max(0, (y - 1.2) / 1.2) * 0.5);
      for (let k = 0; k < 3; k++) { col[(i + k) * 3] = c.r; col[(i + k) * 3 + 1] = c.g; col[(i + k) * 3 + 2] = c.b; }
    }
    g2.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g2.computeVertexNormals();
    const mesh = new THREE.Mesh(g2, M.flat);
    mesh.receiveShadow = mesh.castShadow = true;
    object.add(mesh);
  }
  // water in the ditch
  const dpts = [];
  for (let x = -10; x <= 10; x += 0.5) dpts.push([x, DITCH_Z + 0.25 * Math.sin(x * 0.6)]);
  for (let i = 0; i < dpts.length - 1; i++) {
    const [x0, z0] = dpts[i], [x1, z1] = dpts[i + 1];
    if (Math.hypot(x0, z0) > 10.1 || Math.hypot(x1, z1) > 10.1) continue;
    b.beam([x0, 0.12, z0], [x1, 0.12, z1], 0.01, { color: '#5f8fa0', mat: M.water, sx: 0.5, sy: 3 });
    b.box(Math.hypot(x1 - x0, z1 - z0) + 0.02, 0.02, 0.42, { x: (x0 + x1) / 2, y: 0.1, z: (z0 + z1) / 2, ry: -Math.atan2(z1 - z0, x1 - x0), color: '#6f9fb0', mat: M.water });
  }
  // the bridge: a little stone hump
  const BX = 1.2;
  {
    const z0 = DITCH_Z + 0.25 * Math.sin(BX * 0.6);
    const pts = [];
    for (let i = 0; i <= 8; i++) {
      const t = i / 8;
      pts.push([BX, 0.38 + Math.sin(Math.PI * t) * 0.35, z0 - 0.9 + t * 1.8]);
    }
    for (let i = 0; i < 8; i++) {
      const A = pts[i], B = pts[i + 1];
      const len = Math.hypot(B[1] - A[1], B[2] - A[2]);
      const pitch = Math.atan2(B[1] - A[1], B[2] - A[2]);
      const mz = (A[2] + B[2]) / 2, my = (A[1] + B[1]) / 2;
      b.box(0.8, 0.12, len + 0.03, { x: BX, y: my - 0.06, z: mz, rx: -pitch, color: '#cfc3a8' });
      for (const sx of [-0.38, 0.38]) b.box(0.08, 0.2, len + 0.03, { x: BX + sx, y: my, z: mz, rx: -pitch, color: '#bfb296' });
    }
    // the arch beneath
    b.torus(0.62, 0.1, { x: BX, y: 0.15, z: z0, ry: Math.PI / 2, arc: Math.PI, color: '#bfb296', sz: 7 });
  }
  // the little wall, running across the meadow beyond the ditch
  for (let x = -7.5; x < 5.6; x += 0.42) {
    const z = 0.9 + 0.3 * Math.sin(x * 0.4);
    if (Math.abs(x - BX) < 0.5) continue; // the path through it
    b.box(0.44, 0.38, 0.22, { x, y: H(x, z) - 0.05, z, ry: -0.12 * Math.cos(x * 0.4), color: rng.pick(['#cbbd9f', '#bfb090', '#d6cab0']) });
  }
  // a path from the bridge toward the hill
  for (let k = 0; k < 18; k++) {
    const z = DITCH_Z - 1.0 - k * 0.42, x = BX + Math.sin(k * 0.35) * 0.6 - k * 0.04;
    b.cyl(0.24, 0.24, 0.02, { x, y: H(x, z) + 0.005, z, seg: 8, color: '#c9b48a' });
  }
  // the medlar tree
  const TREE = [-2.6, -0.4];
  {
    const [x, z] = TREE, y = H(x, z);
    b.tube([[x, y, z], [x + 0.1, y + 0.9, z], [x - 0.1, y + 1.5, z + 0.1]], 0.13, { color: '#6a4a32' });
    b.rod([x + 0.05, y + 1.1, z], [x + 0.7, y + 1.8, z + 0.2], 0.06, { color: '#6a4a32' });
    b.rod([x, y + 1.2, z], [x - 0.6, y + 1.9, z - 0.2], 0.06, { color: '#6a4a32' });
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      b.geo(new THREE.IcosahedronGeometry(0.62, 1), { x: x + Math.cos(a) * 0.6, y: y + 2.05 + Math.sin(i * 2.3) * 0.25, z: z + Math.sin(a) * 0.55, color: i % 2 ? '#4f7a3c' : '#5d8a45', mat: M.flat });
    }
    b.geo(new THREE.IcosahedronGeometry(0.75, 1), { x, y: y + 2.5, z, color: '#56823f', mat: M.flat });
    for (let i = 0; i < 14; i++) { // the medlars
      const a = rng.range(0, 6.28), r = rng.range(0.7, 1.15);
      b.sphere(0.07, { x: x + Math.cos(a) * r, y: y + 1.8 + rng.range(0, 0.9), z: z + Math.sin(a) * r, color: '#a8683a', seg: 6 });
    }
  }
  // the field of corn
  const CORN = { x0: 0.6, x1: 5.6, z0: -4.6, z1: -0.6 };
  for (let x = CORN.x0; x < CORN.x1; x += 0.28) {
    for (let z = CORN.z0; z < CORN.z1; z += 0.24) {
      if (Math.hypot(x, z) > 9.8) continue;
      const jx = x + rng.range(-0.05, 0.05), jz = z + rng.range(-0.04, 0.04);
      const hh = rng.range(0.6, 0.85);
      const y = H(jx, jz);
      b.cyl(0.018, 0.025, hh, { x: jx, y, z: jz, seg: 4, color: '#9aa84a' });
      b.cone(0.05, 0.22, { x: jx, y: y + hh - 0.05, z: jz, seg: 5, color: '#e6c860', mat: M.flat });
      b.box(0.24, 0.01, 0.04, { x: jx, y: y + hh * 0.55, z: jz, ry: rng.range(0, 3), rz: 0.4, color: '#7f9a3e', mat: M.cloth });
    }
  }
  // the bramble patch
  for (let i = 0; i < 26; i++) {
    const [dx, dz] = rng.inDisc(1.3);
    const x = -6.2 + dx, z = -2.4 + dz;
    b.geo(new THREE.IcosahedronGeometry(rng.range(0.22, 0.42), 0), { x, y: H(x, z) + 0.15, z, color: rng.pick(['#3a5530', '#2f4a2a', '#45603a']), mat: M.flat, ry: rng.range(0, 6) });
    if (rng.chance(0.5)) b.sphere(0.05, { x: x + 0.15, y: H(x, z) + 0.42, z, color: '#2a1e3a', seg: 5 });
  }
  // the chicken yard: a wattle fence, a coop, hens
  const YARD = [5.6, 2.8];
  {
    const [cx, cz] = YARD;
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * Math.PI * 2;
      const x = cx + Math.cos(a) * 1.3, z = cz + Math.sin(a) * 1.0;
      b.cyl(0.025, 0.025, 0.45, { x, y: H(x, z) - 0.02, z, seg: 4, color: '#8a6a45' });
    }
    const fl = new Lines();
    for (const hy of [0.2, 0.38]) {
      const pts = [];
      for (let i = 0; i <= 28; i++) { const a = (i / 28) * Math.PI * 2; const x = cx + Math.cos(a) * 1.3, z = cz + Math.sin(a) * 1.0; pts.push([x, H(x, z) + hy, z]); }
      fl.path(pts, '#8a6a45');
    }
    object.add(fl.build());
    b.box(0.7, 0.45, 0.5, { x: cx + 0.5, y: H(cx, cz) - 0.02, z: cz - 0.4, color: '#a07850', mat: M.wood });
    b.box(0.8, 0.06, 0.62, { x: cx + 0.5, y: H(cx, cz) + 0.43, z: cz - 0.4, rx: 0.15, color: '#8a5d3d', mat: M.wood });
    for (let i = 0; i < 9; i++) {
      const [dx, dz] = rng.inDisc(0.85);
      const x = cx + dx, z = cz + dz * 0.75, y = H(x, z);
      b.sphere(0.08, { x, y: y + 0.08, z, color: rng.pick(['#f4efe4', '#c8873a', '#f4efe4']), seg: 7, sx: 1.3 });
      b.sphere(0.04, { x: x + 0.09, y: y + 0.16, z, color: '#f4efe4', seg: 6 });
      b.box(0.02, 0.03, 0.01, { x: x + 0.1, y: y + 0.19, z, color: '#d0402a' });
    }
  }
  // a few poplars along the edge, to close the view
  for (let i = 0; i < 9; i++) {
    const a = Math.PI * 1.08 + (i / 8) * Math.PI * 0.84;
    const x = Math.cos(a) * 9.6, z = Math.sin(a) * 9.6;
    b.cyl(0.04, 0.05, 0.4, { x, y: H(x, z) - 0.05, z, seg: 5, color: C.wood });
    b.geo(new THREE.SphereGeometry(1, 8, 6), { x, y: H(x, z) + 1.0, z, sx: 0.28, sz: 0.28, sy: 0.9, color: '#4f6f3e', mat: M.flat });
  }

  /* ------------------------------------------------------------ the inn -- */
  // A dollhouse cut-away: we see into Marco's room on the upper floor, and through its one window.
  const INN = { x: -0.6, z: 7.3 };
  const IW = 4.2, ID = 2.6, G = 1.5, U = 1.4;
  {
    const { x, z } = INN;
    const y0 = 0.3;
    b.box(IW + 0.3, y0 + 0.05, ID + 0.3, { x, y: 0, z, color: '#bfb296' });
    // ground floor: closed, plastered, with a door and a lit window
    b.box(IW, G, ID, { x, y: y0, z, color: '#e7d6b4' });
    b.box(0.5, 0.85, 0.04, { x: x + 1.0, y: y0, z: z - ID / 2 - 0.01, color: '#6a4a32', mat: M.wood });
    b.quad(0.45, 0.4, { x: x - 1.0, y: y0 + 0.8, z: z - ID / 2 - 0.012, ry: Math.PI, mat: M.glow, color: C.lamp, glow: 1.5 });
    b.box(1.0, 0.06, 0.2, { x: x + 1.0, y: y0 + 1.0, z: z - ID / 2 - 0.1, color: '#6a4a32', mat: M.wood }); // sign bracket
    b.box(0.5, 0.3, 0.04, { x: x + 1.35, y: y0 + 0.7, z: z - ID / 2 - 0.2, color: accent, mat: M.cloth });
    // the room: floor, side walls, back wall (toward the view) with the window; open toward us
    const fy = y0 + G;
    b.box(IW, 0.08, ID, { x, y: fy, z, color: '#8a5d3d', mat: M.wood });
    b.box(0.12, U, ID, { x: x - IW / 2 + 0.06, y: fy, z, color: '#efe2c6' });
    b.box(0.12, U, ID, { x: x + IW / 2 - 0.06, y: fy, z, color: '#efe2c6' });
    // the window wall, built around one opening
    const WX0 = -0.75, WX1 = 0.75, WY0 = 0.35, WY1 = 1.2;
    const wz = z - ID / 2 + 0.06;
    b.box(IW, WY0, 0.12, { x, y: fy, z: wz, color: '#efe2c6' });
    b.box(IW, U - WY1, 0.12, { x, y: fy + WY1, z: wz, color: '#efe2c6' });
    b.box(IW / 2 + WX0, WY1 - WY0, 0.12, { x: x - IW / 4 + WX0 / 2, y: fy + WY0, z: wz, color: '#efe2c6' });
    b.box(IW / 2 - WX1, WY1 - WY0, 0.12, { x: x + IW / 4 + WX1 / 2, y: fy + WY0, z: wz, color: '#efe2c6' });
    // window frame and open shutters
    b.box(WX1 - WX0 + 0.1, 0.06, 0.18, { x, y: fy + WY0 - 0.03, z: wz, color: '#f6efe0', mat: M.smooth });
    b.box(0.05, WY1 - WY0, 0.05, { x, y: fy + WY0, z: wz, color: '#6a4a32', mat: M.wood });
    b.box(0.72, WY1 - WY0, 0.04, { x: x + WX0 - 0.36, y: fy + WY0, z: wz - 0.1, ry: 0.5, color: '#4f7a5a', mat: M.wood });
    b.box(0.72, WY1 - WY0, 0.04, { x: x + WX1 + 0.36, y: fy + WY0, z: wz - 0.1, ry: -0.5, color: '#4f7a5a', mat: M.wood });
    b.box(0.2, 0.12, 0.2, { x: x + 0.3, y: fy + WY0, z: wz - 0.14, color: '#b5653f' }); // a pot of geraniums
    b.sphere(0.1, { x: x + 0.3, y: fy + WY0 + 0.18, z: wz - 0.14, color: '#d9534a', mat: M.flat, seg: 6 });
    // half a roof: the far slope only, so the room stays open to us
    b.box(IW + 0.3, 0.08, 1.7, { x, y: fy + U + 0.35, z: wz - 0.25 + 0.35, rx: -0.45, color: C.terracotta, mat: M.flat });
    b.box(0.4, 0.8, 0.4, { x: x - 1.4, y: fy + U, z: wz + 0.3, color: '#d9c6a4' }); // chimney
    // furniture: the bed, a chair at the window, a table with a candle, a rug
    b.box(1.0, 0.25, 1.6, { x: x + 1.35, y: fy + 0.08, z: z + 0.2, color: '#6a4a32', mat: M.wood });
    b.box(0.95, 0.12, 1.55, { x: x + 1.35, y: fy + 0.33, z: z + 0.2, color: '#f4efe4', mat: M.cloth });
    b.box(0.95, 0.06, 0.7, { x: x + 1.35, y: fy + 0.45, z: z + 0.55, color: accent, mat: M.cloth });
    b.box(0.4, 0.04, 0.4, { x: x - 0.2, y: fy + 0.38, z: wz + 0.6, color: '#8a5d3d', mat: M.wood });
    b.box(0.04, 0.4, 0.04, { x: x - 0.2 - 0.17, y: fy + 0.08, z: wz + 0.6 + 0.17, color: '#6a4a32' });
    b.box(0.04, 0.4, 0.04, { x: x - 0.2 + 0.17, y: fy + 0.08, z: wz + 0.6 + 0.17, color: '#6a4a32' });
    b.box(0.4, 0.45, 0.04, { x: x - 0.2, y: fy + 0.42, z: wz + 0.79, color: '#8a5d3d', mat: M.wood });
    b.box(0.5, 0.5, 0.5, { x: x - 1.3, y: fy + 0.08, z: z + 0.3, color: '#7a5236', mat: M.wood });
    b.cyl(0.03, 0.03, 0.12, { x: x - 1.3, y: fy + 0.58, z: z + 0.3, color: '#f4efe4', seg: 6 });
    b.sphere(0.035, { x: x - 1.3, y: fy + 0.74, z: z + 0.3, mat: M.glow, color: C.lamp, glow: 3 });
    b.box(2.2, 0.01, 1.4, { x: x - 0.2, y: fy + 0.081, z: z + 0.1, color: '#a8553a', mat: M.cloth });
  }
  // the cloud, resting over the hill
  const cloud = new Builder();
  for (let i = 0; i < 16; i++) {
    const u = rng.range(-1, 1);
    const r = (1 - u * u * 0.7) * rng.range(0.45, 0.85);
    cloud.sphere(r, { x: u * 1.9, y: (1 - Math.abs(u)) * 0.45 + rng.range(-0.05, 0.25), z: rng.range(-0.45, 0.45), color: '#fbfaf6', mat: M.smooth, seg: 14 });
  }
  cloud.box(3.4, 0.2, 0.9, { y: -0.25, color: '#eceae4', mat: M.smooth, sx: 1 });
  const cloudG = cloud.build();
  cloudG.position.set(-1.6, 6.8, -7.2);
  object.add(cloudG);

  object.add(b.build());

  /* ---------------------------------------------------------- the people -- */
  // positions, in the order they appear
  const WINDOW = new THREE.Vector3(INN.x, 0.3 + G + 0.8, INN.z - ID / 2);
  const people = []; // {x,y,z,t}
  const ok = (x, z) => Math.hypot(x, z) < 9.7 && !(Math.abs(x - INN.x) < IW / 2 + 0.3 && Math.abs(z - INN.z) < ID / 2 + 0.4);
  // year one: a face peering out of the medlar's leaves
  people.push({ x: TREE[0] + 0.25, y: H(TREE[0], TREE[1]) + 1.95, z: TREE[1] + 1.12, t: 5, inTree: true });
  // the next year: six (in the tree, on the wall, the bridge)
  people.push({ x: TREE[0] - 0.55, y: H(TREE[0], TREE[1]) + 2.35, z: TREE[1] + 0.98, t: 9, inTree: true });
  for (const [x, z] of [[-1.0, 1.25], [BX, DITCH_Z], [3.4, 0.95], [-4.6, 0.6], [5.6, 2.8]]) people.push({ x, y: H(x, z) + (Math.abs(x - BX) < 0.1 ? 0.7 : 0), z, t: 9 + rng.range(0, 0.6) });
  // then dozens, then hundreds, spreading out from where they first appeared
  const crowd = [];
  for (let k = 0; k < 4000 && crowd.length < 430; k++) {
    const [x, z] = rng.inDisc(9.6);
    if (!ok(x, z)) continue;
    if (crowd.some((p) => (p.x - x) ** 2 + (p.z - z) ** 2 < 0.33 * 0.33)) continue;
    const d = Math.min(Math.hypot(x - TREE[0], z - TREE[1]), Math.hypot(x - BX, z - DITCH_Z) + 0.5);
    crowd.push({ x, z, key: d + rng.range(0, 3) });
  }
  crowd.sort((a, c) => a.key - c.key);
  crowd.forEach((p, i) => {
    const u = i / crowd.length;
    people.push({ x: p.x, y: H(p.x, p.z), z: p.z, t: 12 + Math.pow(u, 0.75) * 15 });
  });
  // finally twenty-six in his room
  for (let i = 0; i < 26; i++) {
    const x = INN.x - IW / 2 + 0.35 + (i % 9) * ((IW - 0.7) / 8) + rng.range(-0.06, 0.06);
    const z = INN.z - ID / 2 + 0.45 + Math.floor(i / 9) * 0.65 + rng.range(-0.05, 0.05);
    people.push({ x, y: 0.3 + G + 0.08 + (x > INN.x + 0.8 && z > INN.z - 0.6 ? 0.37 : 0), z, t: 27.5 + i * 0.12, room: true });
  }
  const N = people.length;
  const bodyGeo = new THREE.CylinderGeometry(0.09, 0.15, 0.32, 8);
  bodyGeo.translate(0, 0.16, 0);
  const headGeo = new THREE.SphereGeometry(0.125, 10, 7);
  const eyeGeo = new THREE.OctahedronGeometry(0.02, 0);
  const bodies = new THREE.InstancedMesh(bodyGeo, solid(), N);
  const heads = new THREE.InstancedMesh(headGeo, new THREE.MeshStandardMaterial({ roughness: 0.55 }), N);
  const eyes = new THREE.InstancedMesh(eyeGeo, new THREE.MeshBasicMaterial({ color: '#2a1e1a' }), N * 2);
  const cheeks = new THREE.InstancedMesh(eyeGeo, new THREE.MeshBasicMaterial({ color: '#e08a7a' }), N * 2);
  function solid() { return new THREE.MeshStandardMaterial({ roughness: 0.85 }); }
  const col = new THREE.Color();
  const CLOTH = ['#c26a43', '#5d6474', '#2f6377', '#8a5d3d', '#d3a35d', '#6b4c7a', '#41613f', '#a8553a', '#d99a8c', '#34343a'];
  const SKIN = ['#f0d2b0', '#e6c09a', '#d7a985', '#f3dcc0', '#c99470'];
  people.forEach((p, i) => {
    bodies.setColorAt(i, col.set(rng.pick(CLOTH)));
    heads.setColorAt(i, col.set(rng.pick(SKIN)));
    p.face = Math.atan2(WINDOW.x - p.x, WINDOW.z - p.z);
    if (p.room) p.face = Math.PI + rng.range(-0.3, 0.3); // in the room they look at Marco (and at us)
    p.ph = rng.range(0, 10);
    p.sc = rng.range(0.92, 1.1);
  });
  bodies.castShadow = heads.castShadow = true;
  object.add(bodies, heads, eyes, cheeks);

  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), pv = new THREE.Vector3(), sv = new THREE.Vector3(), off = new THREE.Vector3();
  const CYC = 40;
  const ease = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
  function update(t) {
    const c = t % CYC;
    const out = ease((c - 36.5) / 2.5); // the decade ends; the view empties
    cloudG.position.x = -1.6 + Math.sin(t * 0.05) * 0.8;
    for (let i = 0; i < N; i++) {
      const p = people[i];
      let k = ease((c - p.t) / 1.2) * (1 - out);
      // a polite bow, now and then, once the crowd is complete
      const bow = c > 31 ? Math.max(0, Math.sin((c - 31) * 1.3 + p.ph)) ** 6 * 0.35 : 0;
      const s = p.sc * Math.max(0.001, k);
      const rise = p.inTree ? 0 : (1 - k) * -0.3;
      // body
      e.set(0, p.face, 0, 'YXZ');
      q.setFromEuler(e);
      pv.set(p.x, p.y + rise, p.z);
      sv.setScalar(p.inTree ? 0.001 : s);
      m4.compose(pv, q, sv);
      bodies.setMatrixAt(i, m4);
      // head, bowing toward the window
      e.set(bow, p.face, 0, 'YXZ');
      q.setFromEuler(e);
      const hy = p.inTree ? 0 : 0.42 * s;
      pv.set(p.x, p.y + rise + hy, p.z);
      sv.setScalar(s);
      m4.compose(pv, q, sv);
      heads.setMatrixAt(i, m4);
      // eyes and rosy cheeks on the side facing the window
      for (let j = 0; j < 2; j++) {
        const sx = j ? 0.045 : -0.045;
        off.set(sx, 0.025, 0.112).multiplyScalar(s).applyQuaternion(q);
        m4.compose(off.add(pv), q, sv.setScalar(s));
        eyes.setMatrixAt(i * 2 + j, m4);
        off.set(sx * 1.6, -0.03, 0.098).multiplyScalar(s).applyQuaternion(q);
        m4.compose(off.add(pv), q, sv.setScalar(s * 1.3));
        cheeks.setMatrixAt(i * 2 + j, m4);
      }
    }
    bodies.instanceMatrix.needsUpdate = true;
    heads.instanceMatrix.needsUpdate = true;
    eyes.instanceMatrix.needsUpdate = true;
    cheeks.instanceMatrix.needsUpdate = true;
  }
  update(0);
  return { object, update };
}
