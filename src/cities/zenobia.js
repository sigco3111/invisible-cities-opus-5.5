// Zenobia — on dry ground, a happy tangle on tall bamboo pilings: zinc-roofed
// huts, catwalks and ladders at every height, belvederes with conical roofs,
// water tanks, cranes, weather vanes and fishing rods dangling over the dust.
import { THREE, Builder, M, C, tree } from '../kit.js';
import { setInst, figure } from './_ab_util.js';

const BAMBOO = '#cdb86e';
const BAMBOO_D = '#9c8a4a';
const ZINC = '#cfd0cc';
const PLANK = ['#a57a50', '#b88b5d', '#94683f', '#c09a6a'];

export default function build({ rng, accent }) {
  const b = new Builder();
  const object = new THREE.Group();

  /* --------------------------------------------------- dry ground -- */
  b.cyl(10.4, 10.45, 0.1, { color: '#cfae78', seg: 72 });
  for (let i = 0; i < 70; i++) {
    const [x, z] = rng.inDisc(9.8);
    b.disc(rng.range(0.3, 0.9), { x, y: 0.102 + i * 0.0002, z, sx: 1.5, ry: rng.range(0, 3), color: rng.pick(['#c49f68', '#d8b985', '#bf9a63', '#d2b27c']), mat: M.stone, seg: 10 });
  }
  for (let i = 0; i < 70; i++) {
    const [x, z] = rng.inDisc(10);
    for (let k = 0; k < 4; k++) b.cone(0.025, rng.range(0.15, 0.3), { x: x + rng.range(-0.1, 0.1), y: 0.1, z: z + rng.range(-0.1, 0.1), rx: rng.range(-0.4, 0.4), rz: rng.range(-0.4, 0.4), color: rng.pick(['#a8a25a', '#8f9450', '#b9a765']), mat: M.flat, seg: 3 });
  }
  for (let i = 0; i < 9; i++) {
    const [x, z] = rng.inDisc(10, 8.6);
    tree(b, { x, y: 0.1, z, h: rng.range(0.8, 1.5), kind: rng.pick(['round', 'bare', 'palm']), r: rng, color: '#8a9a55' });
  }

  /* ------------------------------------------------------ pilings -- */
  const pole = (x, z, y0, y1, r = 0.055) => {
    b.cyl(r * 0.9, r, y1 - y0, { x, y: y0, z, color: rng.pick([BAMBOO, '#c5ae62', '#d4c07a']), mat: M.wood, seg: 6 });
    for (let y = y0 + 0.55 + rng.range(0, 0.2); y < y1 - 0.1; y += 0.6) b.cyl(r * 1.15, r * 1.15, 0.04, { x, y, z, color: BAMBOO_D, mat: M.wood, seg: 6 });
  };
  const brace = (a, c) => b.rod(a, c, 0.025, { color: BAMBOO_D, mat: M.wood, seg: 4 });

  // platforms (decks) at many heights
  const decks = [];
  const tries = 4000;
  for (let t = 0; t < tries && decks.length < 17; t++) {
    const [x, z] = rng.inDisc(8.2, 0.3);
    const w = rng.range(1.4, 2.1), d = rng.range(1.3, 2.0);
    const rad = Math.hypot(w, d) / 2;
    if (decks.some((o) => Math.hypot(o.x - x, o.z - z) < o.rad + rad + 0.7)) continue;
    const k = 1 - Math.hypot(x, z) / 9.5;
    decks.push({ x, z, w, d, rad, y: Math.round((2.2 + k * 6.2 + rng.range(-1.6, 1.8)) * 4) / 4 });
  }
  const vanes = [], cranes = [], bobs = [], wheels = [];
  const lanterns = [];

  const deck = (P) => {
    const { x, z, w, d, y } = P;
    // poles at the corners (inset), plus a middle one for long decks
    const px = w / 2 - 0.12, pz = d / 2 - 0.12;
    const corners = [[-px, -pz], [px, -pz], [px, pz], [-px, pz]];
    for (const [cx, cz] of corners) pole(x + cx, z + cz, 0.1, y + 1.1 + (P.house ? 0 : 0));
    // X-braces between poles on two levels
    for (let i = 0; i < 4; i++) {
      const [ax, az] = corners[i], [cx, cz] = corners[(i + 1) % 4];
      for (const [ya, yb] of [[0.6, y * 0.5], [y * 0.5, y - 0.1]]) {
        if (yb - ya < 0.8) continue;
        brace([x + ax, ya, z + az], [x + cx, yb, z + cz]);
        brace([x + cx, ya, z + cz], [x + ax, yb, z + az]);
      }
    }
    // deck planks
    b.box(w + 0.1, 0.06, d + 0.1, { x, y: y - 0.06, z, color: '#7d5b3c', mat: M.wood });
    for (let u = -w / 2; u < w / 2 - 0.05; u += 0.16) b.box(0.14, 0.04, d + 0.16, { x: x + u + 0.08, y, z, color: rng.pick(PLANK), mat: M.wood });
    // railing on the edges
    for (const [ax, az, cx, cz] of [[-w / 2, -d / 2, w / 2, -d / 2], [w / 2, -d / 2, w / 2, d / 2], [w / 2, d / 2, -w / 2, d / 2], [-w / 2, d / 2, -w / 2, -d / 2]]) {
      if (rng.chance(0.25)) continue;
      b.rod([x + ax, y + 0.32, z + az], [x + cx, y + 0.32, z + cz], 0.018, { color: BAMBOO, mat: M.wood, seg: 4 });
      const n = Math.max(2, Math.round(Math.hypot(cx - ax, cz - az) / 0.3));
      for (let i = 0; i <= n; i++) b.cyl(0.012, 0.012, 0.32, { x: x + ax + ((cx - ax) * i) / n, y, z: z + az + ((cz - az) * i) / n, color: BAMBOO_D, mat: M.wood, seg: 4 });
    }
  };

  const hut = (P) => {
    const { x, z, w, d, y } = P;
    const hw = w * rng.range(0.55, 0.7), hd = d * rng.range(0.55, 0.7);
    const hx = x + rng.range(-0.1, 0.1) * w, hz = z + rng.range(-0.1, 0.1) * d;
    const hh = rng.range(0.85, 1.15);
    const paint = rng.pick(['#f0c95a', '#e8876a', '#8cc3a6', '#f4d9a0', '#e6a35a', '#7fb0d6', '#f1e3c2', '#d9746a']);
    b.box(hw, hh, hd, { x: hx, y, z: hz, color: paint, mat: M.wood });
    // bamboo slats on the facades
    for (const s of [-1, 1]) for (let u = -hw / 2 + 0.06; u < hw / 2; u += 0.12) b.box(0.03, hh, 0.012, { x: hx + u, y, z: hz + s * (hd / 2 + 0.006), color: BAMBOO_D, mat: M.wood });
    // door and window(s)
    const lit = rng.chance(0.7);
    b.quad(0.24, 0.5, { x: hx - hw * 0.2, y: y + 0.25, z: hz + hd / 2 + 0.014, color: rng.pick([accent, '#b5523b', '#3d6e8a', '#e2b354']), mat: M.smooth });
    b.quad(0.22, 0.2, { x: hx + hw * 0.22, y: y + hh * 0.6, z: hz + hd / 2 + 0.014, color: lit ? C.lamp : C.charcoal, mat: lit ? M.glow : M.smooth, glow: 1.8 });
    b.quad(0.22, 0.2, { x: hx + hw / 2 + 0.014, y: y + hh * 0.6, z: hz, ry: Math.PI / 2, color: rng.chance(0.6) ? C.lamp : C.charcoal, mat: lit ? M.glow : M.smooth, glow: 1.6 });
    // a striped awning over the door
    if (rng.chance(0.6)) {
      const ac = rng.pick(['#e05a4a', '#4f8fc9', '#f2d14b', accent, '#e889a8']);
      for (let k = 0; k < 4; k++) b.box(0.09, 0.02, 0.3, { x: hx - hw * 0.2 - 0.135 + k * 0.09, y: y + 0.62, z: hz + hd / 2 + 0.14, rx: -0.35, color: k % 2 ? '#fbf6ea' : ac, mat: M.cloth });
    }
    // a cantilevered balcony on the side
    if (rng.chance(0.45)) {
      const bxp = hx - hw / 2 - 0.25;
      b.box(0.5, 0.04, 0.6, { x: bxp, y: y + 0.55, z: hz, color: rng.pick(PLANK), mat: M.wood });
      b.rod([hx - hw / 2, y + 0.3, hz - 0.25], [bxp - 0.2, y + 0.55, hz - 0.25], 0.015, { color: BAMBOO_D, mat: M.wood, seg: 4 });
      b.rod([hx - hw / 2, y + 0.3, hz + 0.25], [bxp - 0.2, y + 0.55, hz + 0.25], 0.015, { color: BAMBOO_D, mat: M.wood, seg: 4 });
      b.rod([bxp - 0.25, y + 0.85, hz - 0.3], [bxp - 0.25, y + 0.85, hz + 0.3], 0.012, { color: BAMBOO, mat: M.wood, seg: 4 });
      for (const zz of [-0.3, 0, 0.3]) b.cyl(0.01, 0.01, 0.3, { x: bxp - 0.25, y: y + 0.57, z: hz + zz, color: BAMBOO, mat: M.wood, seg: 3 });
      if (rng.chance(0.6)) figure(b, { x: bxp, y: y + 0.57, z: hz + 0.1, h: 0.3, color: rng.pick(['#4f8fc9', C.terracotta, '#e2b354', '#e889a8']), ry: -Math.PI / 2, arms: rng.chance(0.5) ? 1 : 0 });
    }
    // zinc roof: a pitched or shed roof with corrugation ridges
    const roofKind = rng.pick(['gable', 'shed', 'shed', 'cone']);
    if (roofKind === 'cone') {
      b.cone(Math.max(hw, hd) * 0.78, 0.8, { x: hx, y: y + hh, z: hz, seg: 10, color: ZINC, mat: M.smooth });
      b.cyl(0.01, 0.01, 0.5, { x: hx, y: y + hh + 0.75, z: hz, color: C.charcoal, mat: M.metal, seg: 4 });
      vanes.push({ x: hx, y: y + hh + 1.2, z: hz, ph: rng.range(0, 6.28), s: 0.8 });
    } else if (roofKind === 'gable') {
      const rw = hw + 0.25, rd = hd + 0.25;
      for (const s of [-1, 1]) {
        b.box(rw / 2 + 0.04, 0.03, rd, { x: hx + s * rw / 4, y: y + hh + 0.18, z: hz, rz: -s * 0.55, color: ZINC, mat: M.smooth });
        for (let v = -rd / 2 + 0.05; v < rd / 2; v += 0.09) b.box(rw / 2 + 0.04, 0.02, 0.02, { x: hx + s * rw / 4, y: y + hh + 0.2, z: hz + v, rz: -s * 0.55, color: '#8f969c', mat: M.smooth });
      }
      if (rng.chance(0.5)) { b.cyl(0.01, 0.01, 0.4, { x: hx, y: y + hh + 0.35, z: hz, color: C.charcoal, mat: M.metal, seg: 4 }); vanes.push({ x: hx, y: y + hh + 0.75, z: hz, ph: rng.range(0, 6.28), s: 0.7 }); }
    } else {
      const rw = hw + 0.3, rd = hd + 0.3;
      b.box(rw, 0.03, rd, { x: hx, y: y + hh + 0.14, z: hz, rx: 0.28, color: ZINC, mat: M.smooth });
      for (let u = -rw / 2 + 0.05; u < rw / 2; u += 0.09) b.box(0.02, 0.02, rd, { x: hx + u, y: y + hh + 0.16, z: hz, rx: 0.28, color: '#8f969c', mat: M.smooth });
      // a patched sheet in a different tint
      b.box(rw * 0.35, 0.035, rd * 0.4, { x: hx + rw * 0.2, y: y + hh + 0.16, z: hz - rd * 0.1, rx: 0.28, color: rng.pick(['#c46b45', '#8d9aa5', '#7f8f6a']), mat: M.rough_metal });
    }
    // a lantern on a bracket
    lanterns.push([hx + hw / 2 + 0.1, y + hh * 0.8, hz + hd / 2 + 0.1]);
    // laundry line from the hut to a deck post
    if (rng.chance(0.55)) {
      const a = [hx - hw / 2, y + hh * 0.85, hz + hd / 2], c = [x - w / 2 + 0.05, y + 0.8, z + d / 2];
      b.rod(a, c, 0.006, { color: '#eee', seg: 3 });
      for (let i = 1; i < 4; i++) {
        const t = i / 4;
        b.box(0.12, 0.16, 0.01, { x: a[0] + (c[0] - a[0]) * t, y: a[1] + (c[1] - a[1]) * t - 0.09, z: a[2] + (c[2] - a[2]) * t, ry: Math.atan2(c[2] - a[2], c[0] - a[0]), color: rng.pick(['#e05a4a', '#f2d14b', '#4f8fc9', '#ffffff', accent, '#e889a8']), mat: M.cloth });
      }
    }
    // potted plants on the porch
    for (let i = 0; i < 2; i++) {
      const px = x + (rng.chance(0.5) ? -1 : 1) * (w / 2 - 0.15), pz = z + rng.range(-d / 2 + 0.15, d / 2 - 0.15);
      b.cyl(0.06, 0.045, 0.1, { x: px, y, z: pz, color: C.terracotta, mat: M.smooth, seg: 7 });
      b.geo(new THREE.IcosahedronGeometry(0.09, 0), { x: px, y: y + 0.16, z: pz, color: rng.pick([C.leaf, '#9cb86a']), mat: M.flat });
    }
  };

  // build decks; choose what stands on each
  decks.sort((a, c) => c.y - a.y);
  decks.forEach((P, i) => {
    P.kind = i < 2 ? 'belvedere' : i === 3 || i === 9 ? 'tank' : i === 5 || i === 11 ? 'crane' : 'hut';
    if (P.kind === 'belvedere') {
      // a tall bundle of poles rising high above the deck, a round pavilion with a conical roof on top
      deck(P);
      hut(P);
      const top = P.y + rng.range(4.0, 5.2);
      const bx = P.x + P.w / 2 - 0.25, bz = P.z - P.d / 2 + 0.25;
      for (const [ox, oz] of [[-0.18, -0.18], [0.18, -0.18], [0.18, 0.18], [-0.18, 0.18]]) pole(bx + ox, bz + oz, P.y, top, 0.045);
      for (let y = P.y + 0.6; y < top - 0.2; y += 0.7) for (let k = 0; k < 4; k++) {
        const s = [[-0.18, -0.18], [0.18, -0.18], [0.18, 0.18], [-0.18, 0.18]];
        brace([bx + s[k][0], y, bz + s[k][1]], [bx + s[(k + 1) % 4][0], y + 0.6, bz + s[(k + 1) % 4][1]]);
      }
      // ladder up the belvedere
      for (let y = P.y + 0.25; y < top; y += 0.22) b.box(0.3, 0.02, 0.03, { x: bx, y, z: bz + 0.2, color: BAMBOO_D, mat: M.wood });
      b.cyl(0.62, 0.62, 0.07, { x: bx, y: top, z: bz, seg: 14, color: '#8a6644', mat: M.wood });
      for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; b.cyl(0.018, 0.018, 0.62, { x: bx + Math.cos(a) * 0.55, y: top, z: bz + Math.sin(a) * 0.55, color: BAMBOO, mat: M.wood, seg: 4 }); }
      b.torus(0.55, 0.018, { x: bx, y: top + 0.3, z: bz, rx: Math.PI / 2, color: BAMBOO, mat: M.wood, tseg: 20, rseg: 3 });
      b.cone(0.85, 0.95, { x: bx, y: top + 0.6, z: bz, seg: 14, color: i === 0 ? accent : '#c9603f', mat: M.flat });
      b.sphere(0.06, { x: bx, y: top + 1.6, z: bz, color: C.gold, mat: M.metal, seg: 6 });
      b.cyl(0.012, 0.012, 0.5, { x: bx, y: top + 1.5, z: bz, color: C.charcoal, mat: M.metal, seg: 4 });
      vanes.push({ x: bx, y: top + 1.95, z: bz, ph: rng.range(0, 6.28), s: 1.2 });
      figure(b, { x: bx + 0.2, y: top + 0.07, z: bz + 0.1, h: 0.32, color: rng.pick([C.terracotta, accent]), ry: 0.8, arms: 1 });
      b.sphere(0.06, { x: bx, y: top + 0.45, z: bz, mat: M.glow, color: C.lamp, glow: 3 });
      // a little windmill on the belvedere's side
      wheels.push({ x: bx + 0.75, y: top + 0.2, z: bz, ry: Math.PI / 2, sp: 1.2 + rng(), s: 0.32 });
      b.rod([bx + 0.55, top + 0.2, bz], [bx + 0.75, top + 0.2, bz], 0.015, { color: C.charcoal, mat: M.metal });
      P.top = top;
    } else if (P.kind === 'tank') {
      deck(P);
      // a zinc water tank, banded, with a conical lid
      const r = Math.min(P.w, P.d) * 0.36;
      b.cyl(r, r, 1.1, { x: P.x, y: P.y, z: P.z, seg: 18, color: ZINC, mat: M.smooth });
      for (let k = 1; k < 4; k++) b.cyl(r + 0.02, r + 0.02, 0.04, { x: P.x, y: P.y + k * 0.27, z: P.z, seg: 18, color: '#9b9f9f', mat: M.smooth });
      b.cone(r + 0.06, 0.35, { x: P.x, y: P.y + 1.1, z: P.z, seg: 18, color: '#b9bcba', mat: M.smooth });
      b.rod([P.x + r, P.y + 0.2, P.z], [P.x + r + 0.2, P.y + 0.2, P.z], 0.03, { color: C.charcoal, mat: M.metal });
      b.rod([P.x + r + 0.2, P.y + 0.2, P.z], [P.x + r + 0.2, 0.15, P.z], 0.03, { color: '#9b9f9f', mat: M.smooth });
      for (let y = P.y + 0.1; y < P.y + 1.1; y += 0.15) b.box(0.18, 0.02, 0.025, { x: P.x - r - 0.04, y, z: P.z, color: C.charcoal, mat: M.metal });
    } else if (P.kind === 'crane') {
      deck(P);
      hut(P);
      cranes.push({ x: P.x - P.w / 2 + 0.2, y: P.y, z: P.z + P.d / 2 - 0.2, ph: rng.range(0, 6.28), len: rng.range(2.2, 3.0) });
    } else {
      deck(P);
      hut(P);
    }
    // a second little storey on stilts above some huts
    if (P.kind === 'hut' && rng.chance(0.35)) {
      const Q = { x: P.x + rng.range(-0.2, 0.2), z: P.z + rng.range(-0.2, 0.2), w: P.w * 0.7, d: P.d * 0.7, y: P.y + 1.9 };
      const px = Q.w / 2 - 0.08, pz = Q.d / 2 - 0.08;
      for (const [cx, cz] of [[-px, -pz], [px, -pz], [px, pz], [-px, pz]]) pole(Q.x + cx, Q.z + cz, P.y, Q.y + 0.9, 0.04);
      b.box(Q.w, 0.06, Q.d, { x: Q.x, y: Q.y - 0.06, z: Q.z, color: '#8a6644', mat: M.wood });
      const hw = Q.w * 0.75, hd = Q.d * 0.75;
      b.box(hw, 0.7, hd, { x: Q.x, y: Q.y, z: Q.z, color: rng.pick(['#f0c95a', '#8cc3a6', '#e8876a', '#f1e3c2']), mat: M.wood });
      b.quad(0.18, 0.16, { x: Q.x, y: Q.y + 0.4, z: Q.z + hd / 2 + 0.012, color: C.lamp, mat: M.glow, glow: 2 });
      b.cone(Math.max(hw, hd) * 0.8, 0.6, { x: Q.x, y: Q.y + 0.7, z: Q.z, seg: 4, ry: Math.PI / 4, color: ZINC, mat: M.smooth });
      // ladder between the two storeys
      for (let y = P.y + 0.2; y < Q.y; y += 0.2) b.box(0.26, 0.02, 0.03, { x: Q.x - Q.w / 2 - 0.05, y, z: Q.z, ry: Math.PI / 2, color: BAMBOO_D, mat: M.wood });
      b.cyl(0.012, 0.012, Q.y - P.y, { x: Q.x - Q.w / 2 - 0.05, y: P.y, z: Q.z - 0.13, color: BAMBOO, mat: M.wood, seg: 4 });
      b.cyl(0.012, 0.012, Q.y - P.y, { x: Q.x - Q.w / 2 - 0.05, y: P.y, z: Q.z + 0.13, color: BAMBOO, mat: M.wood, seg: 4 });
    }
    // fishing rods over the dry ground
    if (rng.chance(0.55)) {
      const side = rng.int(0, 3);
      const ex = P.x + [P.w / 2, -P.w / 2, 0, 0][side], ez = P.z + [0, 0, P.d / 2, -P.d / 2][side];
      const dx = [1, -1, 0, 0][side], dz = [0, 0, 1, -1][side];
      const L = rng.range(1.0, 1.7);
      const tip = [ex + dx * L, P.y + 0.3 + L * 0.5, ez + dz * L];
      b.rod([ex - dx * 0.1, P.y + 0.1, ez - dz * 0.1], tip, 0.012, { color: '#6b4a2e', mat: M.wood, seg: 4, r2: 0.02 });
      figure(b, { x: ex - dx * 0.25, y: P.y, z: ez - dz * 0.25, h: 0.3, color: rng.pick(['#4f8fc9', C.terracotta, '#e2b354']), ry: Math.atan2(dx, dz) });
      const by = rng.range(0.35, 1.2);
      b.rod(tip, [tip[0], by + 0.05, tip[2]], 0.004, { color: '#f1efe8', seg: 3 });
      bobs.push({ x: tip[0], y: by, z: tip[2], ph: rng.range(0, 6.28) });
    }
  });

  /* ------------------------------------- catwalks between the decks -- */
  // connect each deck to its nearest neighbours (spanning tree + extras)
  const edges = [];
  const inTree = [0];
  while (inTree.length < decks.length) {
    let best = null;
    for (const i of inTree) for (let j = 0; j < decks.length; j++) {
      if (inTree.includes(j)) continue;
      const dd = Math.hypot(decks[i].x - decks[j].x, decks[i].z - decks[j].z);
      if (!best || dd < best[2]) best = [i, j, dd];
    }
    edges.push(best);
    inTree.push(best[1]);
  }
  for (let i = 0; i < decks.length; i++) for (let j = i + 1; j < decks.length; j++) {
    const dd = Math.hypot(decks[i].x - decks[j].x, decks[i].z - decks[j].z);
    if (dd < 4.4 && !edges.some((e) => (e[0] === i && e[1] === j) || (e[0] === j && e[1] === i)) && rng.chance(0.7)) edges.push([i, j, dd]);
  }
  const edgePoint = (P, dx, dz) => {
    const tx = Math.abs(dx) > 1e-6 ? (P.w / 2) / Math.abs(dx) : 1e9, tz = Math.abs(dz) > 1e-6 ? (P.d / 2) / Math.abs(dz) : 1e9;
    const t = Math.min(tx, tz);
    return [P.x + dx * t, P.y, P.z + dz * t];
  };
  for (const [i, j] of edges) {
    const A = decks[i], B = decks[j];
    const dx0 = B.x - A.x, dz0 = B.z - A.z, L0 = Math.hypot(dx0, dz0);
    const dx = dx0 / L0, dz = dz0 / L0;
    const a = edgePoint(A, dx, dz), c = edgePoint(B, -dx, -dz);
    const len = Math.hypot(c[0] - a[0], c[2] - a[2]);
    const rise = c[1] - a[1];
    const hanging = Math.abs(rise) < 1.2 && len > 1.6 && rng.chance(0.6);
    const n = Math.max(3, Math.round(len / 0.17));
    const ang = Math.atan2(dx, dz);
    const pts = [];
    for (let k = 0; k <= n; k++) {
      const t = k / n;
      const sag = hanging ? 0.35 * Math.sin(Math.PI * t) : 0;
      const p = [a[0] + (c[0] - a[0]) * t, a[1] + rise * t - sag, a[2] + (c[2] - a[2]) * t];
      pts.push(p);
      b.box(0.5, 0.035, 0.12, { x: p[0], y: p[1] - 0.02, z: p[2], ry: ang + Math.PI / 2, color: rng.pick(PLANK), mat: M.wood, rz: 0 });
    }
    // rope handrails (hanging walkways) or bamboo rails
    for (const s of [-1, 1]) {
      const ox = Math.cos(ang) * 0.26 * s, oz = -Math.sin(ang) * 0.26 * s;
      b.tube(pts.map((p, k) => [p[0] + ox, p[1] + 0.42 + (hanging ? 0.08 * Math.sin((Math.PI * k) / n) : 0), p[2] + oz]), hanging ? 0.012 : 0.02, { color: hanging ? '#d9c39a' : BAMBOO, mat: M.wood, rseg: 3, tseg: n * 2 });
      for (let k = 0; k <= n; k += 3) b.rod([pts[k][0] + ox, pts[k][1], pts[k][2] + oz], [pts[k][0] + ox, pts[k][1] + 0.42, pts[k][2] + oz], 0.008, { color: hanging ? '#d9c39a' : BAMBOO_D, mat: M.wood, seg: 3 });
    }
    // support stilts under long rigid catwalks
    if (!hanging && len > 2.2) {
      const m = pts[Math.floor(n / 2)];
      pole(m[0], m[2], 0.1, m[1] - 0.03, 0.04);
    }
    if (rng.chance(0.35)) {
      const p = pts[Math.floor(n * rng.range(0.25, 0.75))];
      figure(b, { x: p[0], y: p[1], z: p[2], h: 0.3, color: rng.pick([C.terracotta, '#4f8fc9', '#e2b354', accent, '#e889a8']), ry: ang });
    }
  }
  // ladders from the ground
  for (const P of decks) {
    if (!rng.chance(0.55)) continue;
    const lx = P.x - P.w / 2 - 0.08, lz = P.z + rng.range(-0.3, 0.3) * P.d;
    for (const o of [-0.13, 0.13]) b.cyl(0.015, 0.015, P.y - 0.1, { x: lx - 0.12, y: 0.1, z: lz + o, color: BAMBOO, mat: M.wood, seg: 4, rz: 0.06 });
    for (let y = 0.3; y < P.y; y += 0.22) b.box(0.03, 0.02, 0.28, { x: lx - 0.12 + (y - 0.1) * 0.06 * -1 * 0, y, z: lz, color: BAMBOO_D, mat: M.wood });
    if (rng.chance(0.4)) figure(b, { x: lx + 0.1, y: 0.1, z: lz + 0.35, h: 0.3, color: rng.pick([C.terracotta, '#4f8fc9', '#e2b354']), ry: rng.range(0, 6) });
  }
  // people strolling in the shade below
  for (let i = 0; i < 14; i++) {
    const [x, z] = rng.inDisc(9.3);
    if (decks.some((P) => Math.abs(P.x - x) < P.w / 2 + 0.1 && Math.abs(P.z - z) < P.d / 2 + 0.1)) continue;
    figure(b, { x, y: 0.1, z, h: 0.32, color: rng.pick([C.terracotta, '#4f8fc9', '#e2b354', '#e889a8', '#f4efe2']), ry: rng.range(0, 6), arms: rng.chance(0.2) ? 1 : 0 });
  }
  // lanterns
  for (const [x, y, z] of lanterns) {
    b.rod([x - 0.1, y + 0.15, z - 0.1], [x, y + 0.15, z], 0.008, { color: C.charcoal, mat: M.metal, seg: 3 });
    b.sphere(0.045, { x, y: y + 0.05, z, mat: M.glow, color: C.lamp, glow: 2.6, seg: 8 });
  }
  // strings of pennants between the two belvederes and nearby decks
  const tops = decks.filter((P) => P.top);
  if (tops.length === 2) {
    const [A, B] = tops;
    const a = [A.x + A.w / 2 - 0.25, A.top + 0.55, A.z - A.d / 2 + 0.25], c = [B.x + B.w / 2 - 0.25, B.top + 0.55, B.z - B.d / 2 + 0.25];
    const n = 22;
    const pts = [];
    for (let k = 0; k <= n; k++) {
      const t = k / n;
      const p = [a[0] + (c[0] - a[0]) * t, a[1] + (c[1] - a[1]) * t - 1.2 * Math.sin(Math.PI * t), a[2] + (c[2] - a[2]) * t];
      pts.push(p);
      if (k > 0 && k < n) b.geo(new THREE.ConeGeometry(0.07, 0.17, 3).rotateX(Math.PI), { x: p[0], y: p[1] - 0.09, z: p[2], color: ['#e05a4a', '#f2d14b', '#4f8fc9', '#ffffff', accent][k % 5], mat: M.cloth });
    }
    b.tube(pts, 0.007, { color: '#eee', mat: M.wood, rseg: 3 });
  }

  object.add(b.build());

  /* ------------------------------------------------------ animated -- */
  const mk = (fn, mat) => { const bb = new Builder(); fn(bb); return bb.build().children[0].geometry; };
  // weather vanes: a rooster-ish arrow
  const vaneGeo = mk((bb) => {
    bb.box(0.6, 0.02, 0.02, { color: C.gold, mat: M.metal });
    bb.geo(new THREE.ConeGeometry(0.05, 0.14, 4).rotateZ(-Math.PI / 2), { x: 0.34, color: C.gold, mat: M.metal });
    bb.box(0.14, 0.16, 0.01, { x: -0.26, y: 0.05, color: C.gold, mat: M.metal });
    bb.sphere(0.03, { color: C.gold, mat: M.metal, seg: 6 });
  });
  const vaneMesh = new THREE.InstancedMesh(vaneGeo, M.metal, Math.max(1, vanes.length));
  vaneMesh.count = vanes.length;
  vaneMesh.frustumCulled = false;
  object.add(vaneMesh);
  // windmills
  const wheelGeo = mk((bb) => {
    for (let k = 0; k < 6; k++) bb.box(0.18, 0.9, 0.02, { y: 0, rz: (k / 6) * Math.PI * 2, x: 0, color: k % 2 ? '#f2ead8' : accent, mat: M.cloth, matrix: new THREE.Matrix4().makeTranslation(0, 0, 0) });
  });
  // re-centre the vanes: each blade's bottom sits at the hub
  const wheelMesh = new THREE.InstancedMesh(wheelGeo, M.cloth, Math.max(1, wheels.length));
  wheelMesh.count = wheels.length;
  wheelMesh.frustumCulled = false;
  object.add(wheelMesh);
  // fishing bobs
  const bobMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.05, 8, 6), new THREE.MeshStandardMaterial({ color: '#e0452f', roughness: 0.5 }), Math.max(1, bobs.length));
  bobMesh.count = bobs.length;
  bobMesh.frustumCulled = false;
  object.add(bobMesh);
  // cranes: a mast with a rotating boom and a swinging load
  const craneGroups = cranes.map((cr) => {
    const bb = new Builder();
    bb.cyl(0.05, 0.06, 2.2, { color: '#8a6644', mat: M.wood, seg: 6 });
    bb.beam([0, 2.1, 0], [cr.len, 1.9, 0], 0.07, { color: '#9a7450', mat: M.wood });
    bb.beam([-0.6, 2.05, 0], [0, 2.1, 0], 0.07, { color: '#9a7450', mat: M.wood });
    bb.box(0.3, 0.3, 0.3, { x: -0.6, y: 1.85, color: '#6f7780', mat: M.rough_metal });
    bb.rod([0, 2.9, 0], [cr.len, 1.95, 0], 0.01, { color: '#d9c39a', seg: 3 });
    bb.rod([0, 2.9, 0], [-0.6, 2.1, 0], 0.01, { color: '#d9c39a', seg: 3 });
    bb.cyl(0.03, 0.03, 0.8, { y: 2.1, color: '#8a6644', mat: M.wood, seg: 5 });
    bb.rod([cr.len, 1.9, 0], [cr.len, 1.0, 0], 0.006, { color: '#eee', seg: 3 });
    // the load: a bundle of bamboo or a crate
    if (rng.chance(0.5)) bb.box(0.35, 0.3, 0.35, { x: cr.len, y: 0.7, color: '#b88b5d', mat: M.wood });
    else for (let k = 0; k < 5; k++) bb.cyl(0.03, 0.03, 0.9, { x: cr.len + (k - 2) * 0.05, y: 0.85, rz: Math.PI / 2, z: (k % 2) * 0.05, color: BAMBOO, mat: M.wood, seg: 5 });
    const g = bb.build();
    g.position.set(cr.x, cr.y, cr.z);
    object.add(g);
    return g;
  });

  const update = (t) => {
    for (let i = 0; i < vanes.length; i++) {
      const v = vanes[i];
      setInst(vaneMesh, i, v.x, v.y, v.z, v.s, 0.6 + Math.sin(t * 0.17 + v.ph) * 1.4 + Math.sin(t * 0.53 + v.ph * 3) * 0.2);
    }
    vaneMesh.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < wheels.length; i++) {
      const w = wheels[i];
      setInst(wheelMesh, i, w.x, w.y, w.z, w.s, w.ry, 0, t * w.sp);
    }
    wheelMesh.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < bobs.length; i++) {
      const o = bobs[i];
      setInst(bobMesh, i, o.x, o.y + Math.sin(t * 1.1 + o.ph) * 0.04, o.z, 1);
    }
    bobMesh.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < craneGroups.length; i++) {
      const cr = cranes[i];
      craneGroups[i].rotation.y = cr.ph + Math.sin(t * 0.12 + cr.ph) * 1.3;
    }
  };
  update(0);
  return { object, update };
}
