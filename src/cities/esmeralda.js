// Esmeralda — city of water. Islands, canals and streets interlace; humpback bridges,
// stairways, hanging streets and rooftop walkways stack the city in layers. Between the
// golden campanile and the green dome there is never one route but many, drawn here in
// inks of different colours — by boat, by street, by the hanging streets, over the roofs,
// and the swallows' route through the air — each traced again and again by a drop of ink.
import { THREE, Builder, M, C, bridge, person } from '../kit.js';
import { glowParticles, _o, _col, smooth01 } from './_c_util.js';

const CELL = 4.2;
const IS = [-6.3, -2.1, 2.1, 6.3];
const CAN = 1.2; // canal width
const FOND = 0.32; // fondamenta (quay walk) width
const WY = 0.26; // water level
const IY = 0.56; // island top

export default function build({ rng, accent }) {
  const b = new Builder();
  const W = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6, metalness: 0.05 });
  W.userData.noShadow = false;

  // ---------------------------------------------------------------- water and islands
  b.cyl(10.3, 10.4, WY, { color: '#2f7a6c', seg: 64, mat: W });
  // water surface lighter streaks
  for (let i = 0; i < 40; i++) {
    const [x, z] = rng.inDisc(9.8);
    b.box(rng.range(0.3, 0.9), 0.004, 0.03, { x, y: WY, z, ry: rng.chance(0.5) ? 0 : Math.PI / 2, color: '#5fa596', mat: W });
  }
  const islands = [];
  for (const cx of IS) for (const cz of IS) {
    if (Math.hypot(cx, cz) > 8.4) continue;
    islands.push({ cx, cz });
    const s = CELL - CAN;
    b.box(s, IY, s, { x: cx, z: cz, color: '#cbb89a' });
    // fondamenta edge stones
    b.box(s + 0.06, 0.05, s + 0.06, { x: cx, y: IY - 0.12, z: cz, color: '#e6dccb' });
    // waterline stain
    b.box(s + 0.01, 0.08, s + 0.01, { x: cx, y: WY - 0.02, z: cz, color: '#5f6a55' });
  }
  // the outer quay ring that frames the lagoon city
  b.ring(9.7, 10.3, { y: IY - 0.08, color: '#d8ccb6', seg: 72 });
  b.cyl(10.3, 10.3, IY - 0.08, { color: '#c9b99c', seg: 72, open: true });
  b.cyl(9.7, 9.7, IY - 0.08, { color: '#b7a88c', seg: 72, open: true });
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2;
    b.cyl(0.05, 0.06, 0.28, { x: Math.cos(a) * 9.85, y: IY - 0.08, z: Math.sin(a) * 9.85, color: '#efe6d6', seg: 6 });
    if (i % 3 === 0) b.sphere(0.05, { x: Math.cos(a) * 9.85, y: IY + 0.28, z: Math.sin(a) * 9.85, mat: M.glow, color: C.lamp, glow: 1.6, seg: 6 });
  }
  // corner islets with cypresses and a tiny chapel
  for (const [cx, cz] of [[6.3, 6.3], [-6.3, 6.3], [6.3, -6.3], [-6.3, -6.3]]) {
    b.cyl(1.0, 1.1, IY - 0.1, { x: cx, z: cz, color: '#9fae7a', seg: 20 });
    b.cyl(1.12, 1.12, 0.06, { x: cx, y: IY - 0.2, z: cz, color: '#e6dccb', seg: 20 });
    b.box(0.5, 0.55, 0.7, { x: cx, y: IY - 0.1, z: cz, ry: Math.atan2(cx, cz), color: '#efe4cf' });
    b.prism(0, 0.45, 0.35, 4, { x: cx, y: IY + 0.45, z: cz, ry: Math.atan2(cx, cz) + Math.PI / 4, color: '#b8694a', mat: M.flat });
    for (let k = 0; k < 4; k++) {
      const a = k * 1.7 + cx;
      const x = cx + Math.cos(a) * 0.7, z = cz + Math.sin(a) * 0.7;
      b.cyl(0.03, 0.03, 0.15, { x, y: IY - 0.1, z, color: C.wood, seg: 4 });
      b.geo(new THREE.SphereGeometry(0.15, 6, 4), { x, y: IY + 0.4, z, sy: 3, color: C.darkleaf, mat: M.flat });
    }
  }
  // bricole: clusters of lagoon posts marking the channels
  for (let i = 0; i < 14; i++) {
    const a = rng.range(0, Math.PI * 2), r = rng.range(8.6, 9.3);
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    for (let k = 0; k < 3; k++) b.cyl(0.035, 0.04, 0.75, { x: x + Math.cos(k * 2.1) * 0.06, y: WY - 0.05, z: z + Math.sin(k * 2.1) * 0.06, rz: 0.06 * (k - 1), color: '#6e5a44', mat: M.wood, seg: 5 });
  }
  const isIsland = (cx, cz) => islands.some((I) => Math.abs(I.cx - cx) < 0.1 && Math.abs(I.cz - cz) < 0.1);

  // ---------------------------------------------------------------- buildings: 4 plots per island around a cross of calli
  const walls = ['#d9a06a', '#e4b88a', '#c97b5a', '#e8d2a8', '#d68f78', '#efe0c6', '#b86a4e', '#e2c08a', '#d4a48a'];
  const roofTops = {}; // key -> [x, topY, z]
  const plotH = {};
  const A_ISL = [-6.3, 2.1], B_ISL = [6.3, -2.1];
  for (const I of islands) {
    for (const [qx, qz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const pw = (CELL - CAN - 2 * FOND - 0.46) / 2; // plot width (0.46 calle)
      const x = I.cx + qx * (pw / 2 + 0.23), z = I.cz + qz * (pw / 2 + 0.23);
      if (Math.hypot(I.cx - B_ISL[0], I.cz - B_ISL[1]) < 0.1 && qx > 0 && qz < 0) continue; // church plot
      if (Math.hypot(I.cx - A_ISL[0], I.cz - A_ISL[1]) < 0.1 && qx < 0 && qz > 0) continue; // campanile plot
      const h = rng.range(1.1, 2.4);
      const wall = rng.pick(walls);
      plotH[`${I.cx},${I.cz},${qx},${qz}`] = h;
      b.box(pw, h, pw, { x, y: IY, z, color: wall });
      b.box(pw + 0.06, 0.07, pw + 0.06, { x, y: IY + h, z, color: '#f1e6d4' });
      b.box(pw + 0.02, 0.04, pw + 0.02, { x, y: IY + 0.62, z, color: '#f1e6d4' });
      // windows: arched pairs on all four faces, some lit
      for (let f = 0; f < 4; f++) {
        const ang = f * Math.PI / 2;
        const off = pw / 2 + 0.006;
        for (let fl = 0; fl < Math.floor((h - 0.5) / 0.62); fl++) {
          for (const u of [-pw * 0.25, pw * 0.25]) {
            const lit = rng.chance(0.18);
            const px = Math.sin(ang) * off + Math.cos(ang) * u, pz = Math.cos(ang) * off - Math.sin(ang) * u;
            const wy = IY + 0.82 + fl * 0.62;
            b.quad(0.13, 0.24, { x: x + px, y: wy, z: z + pz, ry: ang, mat: lit ? M.glow : M.smooth, color: lit ? C.lamp : '#3a2f2c', glow: 1.7 });
            b.cyl(0.065, 0.065, 0.01, { x: x + px, y: wy + 0.12, z: z + pz, ry: ang, rx: Math.PI / 2, color: lit ? '#5a4030' : '#3a2f2c', seg: 8, thetaStart: -Math.PI / 2, thetaLength: Math.PI });
          }
        }
        // water gate on the ground floor
        if (rng.chance(0.3)) b.quad(0.3, 0.4, { x: x + Math.sin(ang) * off, y: IY - 0.08 + 0.2, z: z + Math.cos(ang) * off, ry: ang, color: '#2b2522' });
      }
      // roof: altana (wooden terrace on stilts) or funnel chimneys
      const top = IY + h + 0.07;
      roofTops[`${I.cx},${I.cz},${qx},${qz}`] = [x, top, z];
      const roofKind = rng();
      if (roofKind < 0.45) {
        b.geo(new THREE.CylinderGeometry(0.0001, 0.72, 1, 4, 1).rotateY(Math.PI / 4).translate(0, 0.5, 0), { x, y: top - 0.02, z, sx: pw + 0.08, sz: pw + 0.08, sy: 0.32, color: rng.pick(['#b8694a', '#a8553a', '#c47b54']), mat: M.flat });
        roofTops[`${I.cx},${I.cz},${qx},${qz}`] = [x, top + 0.3, z];
        b.cyl(0.03, 0.03, 0.35, { x: x + 0.2, y: top, z: z - 0.15, color: '#c97b5a', seg: 6 });
        b.cyl(0.09, 0.03, 0.14, { x: x + 0.2, y: top + 0.35, z: z - 0.15, color: '#c97b5a', seg: 8 });
      } else if (roofKind < 0.75) {
        for (const [ax, az] of [[-0.25, -0.25], [0.25, -0.25], [-0.25, 0.25], [0.25, 0.25]]) b.cyl(0.015, 0.015, 0.3, { x: x + ax, y: top, z: z + az, color: C.darkwood, seg: 4 });
        b.box(0.6, 0.03, 0.6, { x, y: top + 0.3, z, color: C.wood, mat: M.wood });
        b.box(0.6, 0.12, 0.02, { x, y: top + 0.33, z: z + 0.3, color: C.wood, mat: M.wood });
      } else {
        for (let k = 0; k < rng.int(1, 2); k++) {
          const ox = rng.range(-0.3, 0.3), oz = rng.range(-0.3, 0.3);
          b.cyl(0.03, 0.03, 0.3, { x: x + ox, y: top, z: z + oz, color: '#c97b5a', seg: 6 });
          b.cyl(0.09, 0.03, 0.14, { x: x + ox, y: top + 0.3, z: z + oz, color: '#c97b5a', seg: 8 });
        }
      }
    }
    // the campo well in the crossing
    b.cyl(0.12, 0.13, 0.18, { x: I.cx, y: IY, z: I.cz, color: '#efe4cf', seg: 10 });
  }

  // campanile with golden angel on island A; green-domed church on island B
  {
    const [x, z] = [A_ISL[0] - 0.62, A_ISL[1] + 0.62];
    b.box(0.7, 6.4, 0.7, { x, y: IY, z, color: '#c46e50' });
    b.box(0.82, 0.12, 0.82, { x, y: IY + 5.0, z, color: '#efe4cf' });
    for (const [ax, az] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) b.quad(0.3, 0.6, { x: x + ax * 0.352, y: IY + 5.5, z: z + az * 0.352, ry: Math.atan2(ax, az), color: '#3a2f2c' });
    b.box(0.82, 0.1, 0.82, { x, y: IY + 6.4, z, color: '#efe4cf' });
    b.prism(0, 0.5, 1.2, 4, { x, y: IY + 6.5, z, ry: Math.PI / 4, color: '#7d9e8a', mat: M.flat });
    b.sphere(0.12, { x, y: IY + 7.8, z, color: C.gold, mat: M.metal });
  }
  {
    const [x, z] = [B_ISL[0] + 0.62, B_ISL[1] - 0.62];
    b.cyl(0.62, 0.62, 2.0, { x, y: IY, z, color: '#efe4cf', seg: 16 });
    b.cyl(0.52, 0.52, 0.45, { x, y: IY + 2.0, z, color: '#efe4cf', seg: 16 });
    b.dome(0.56, { x, y: IY + 2.45, z, color: '#4f9a7e', mat: M.smooth });
    b.cyl(0.1, 0.1, 0.4, { x, y: IY + 2.95, z, color: '#efe4cf', seg: 8 });
    b.sphere(0.09, { x, y: IY + 3.4, z, color: C.gold, mat: M.metal });
  }

  // ---------------------------------------------------------------- bridges: humpbacked across canals at calle ends
  const bridges = new Set();
  const addBridge = (x0, z0, x1, z1) => {
    const key = [x0, z0, x1, z1].map((v) => v.toFixed(1)).join(',');
    if (bridges.has(key)) return;
    bridges.add(key);
    bridge(b, { from: [x0, IY - 0.02, z0], to: [x1, IY - 0.02, z1], w: 0.45, rise: 0.42, color: '#efe6d6', segments: 8 });
  };
  for (const I of islands) {
    const e = (CELL - CAN) / 2;
    if (isIsland(I.cx + CELL, I.cz) && rng.chance(0.75)) addBridge(I.cx + e - 0.05, I.cz, I.cx + e + CAN + 0.05, I.cz);
    if (isIsland(I.cx, I.cz + CELL) && rng.chance(0.75)) addBridge(I.cx, I.cz + e - 0.05, I.cx, I.cz + e + CAN + 0.05);
  }

  // ---------------------------------------------------------------- the five routes from A to B
  const P = (x, y, z) => new THREE.Vector3(x, y, z);
  const hop = (pts, a, bb, y, hump) => {
    // add a hop between island centres a -> b, crossing the canal at its midpoint (hump for bridges)
    const mx = (a[0] + bb[0]) / 2, mz = (a[1] + bb[1]) / 2;
    const dx = Math.sign(bb[0] - a[0]), dz = Math.sign(bb[1] - a[1]);
    const e = CAN / 2 + 0.05;
    pts.push(P(mx - dx * e, y, mz - dz * e));
    if (hump) pts.push(P(mx, y + hump, mz));
    pts.push(P(mx + dx * e, y, mz + dz * e));
    pts.push(P(bb[0], y, bb[1]));
  };
  // 1. by street & bridges (red ink)
  const streetPath = [P(A_ISL[0], IY + 0.05, A_ISL[1])];
  {
    const seq = [[-6.3, 2.1], [-2.1, 2.1], [-2.1, -2.1], [2.1, -2.1], [2.1, 2.1], [6.3, 2.1], [6.3, -2.1]];
    for (let i = 0; i < seq.length - 1; i++) {
      const [a, c] = [seq[i], seq[i + 1]];
      const e = (CELL - CAN) / 2;
      if (a[0] !== c[0]) addBridge(Math.min(a[0], c[0]) + e - 0.05, a[1], Math.min(a[0], c[0]) + e + CAN + 0.05, a[1]);
      else addBridge(a[0], Math.min(a[1], c[1]) + e - 0.05, a[0], Math.min(a[1], c[1]) + e + CAN + 0.05);
      hop(streetPath, a, c, IY + 0.05, 0.45);
    }
  }
  // 2. by boat along the canals (blue ink)
  const waterPath = [];
  {
    const y = WY + 0.05;
    const pts = [[-4.2, 2.6], [-4.2, 0], [0, 0], [0, 4.2], [4.2, 4.2], [4.2, -2.6]];
    waterPath.push(P(A_ISL[0] + 1.45, IY, A_ISL[1] + 0.5));
    for (const [x, z] of pts) waterPath.push(P(x, y, z));
    waterPath.push(P(B_ISL[0] - 1.45, IY, B_ISL[1] - 0.5));
  }
  // 3. by the hanging streets at the second storey (green ink)
  const hangPath = [];
  const skyways = [];
  {
    const y = IY + 1.75;
    const seq = [[-6.3, 2.1], [-6.3, -2.1], [-2.1, -2.1], [-2.1, -6.3], [2.1, -6.3], [2.1, -2.1], [6.3, -2.1]];
    hangPath.push(P(A_ISL[0] + 0.62, IY + 0.05, A_ISL[1] - 0.62), P(A_ISL[0] + 0.62, y, A_ISL[1] - 0.62));
    let prev = [A_ISL[0] + 0.62, A_ISL[1] - 0.62];
    for (let i = 1; i < seq.length; i++) {
      const [cx, cz] = seq[i];
      const q = [cx + 0.62 * (i % 2 ? 1 : -1), cz + 0.62 * (i % 2 ? -1 : 1)];
      // a covered walkway on brackets between the two plots, crossing a canal
      skyways.push([prev, q]);
      hangPath.push(P(prev[0], y, prev[1]), P(q[0], y, q[1]));
      prev = q;
    }
    hangPath.push(P(prev[0], IY + 0.05, prev[1]));
  }
  for (const [p, q] of skyways) {
    const y = IY + 1.75;
    const len = Math.hypot(q[0] - p[0], q[1] - p[1]);
    const ry = Math.atan2(q[0] - p[0], q[1] - p[1]);
    b.push({ x: (p[0] + q[0]) / 2, y: y - 0.1, z: (p[1] + q[1]) / 2, ry });
    b.box(0.42, 0.06, len, { color: C.wood, mat: M.wood });
    b.box(0.03, 0.3, len, { x: 0.2, y: 0.06, color: '#e6dccb' });
    b.box(0.03, 0.3, len, { x: -0.2, y: 0.06, color: '#e6dccb' });
    b.box(0.5, 0.03, len, { y: 0.55, color: '#9a5b40' });
    for (let k = 0; k <= Math.floor(len / 0.6); k++) {
      const zz = -len / 2 + k * (len / Math.max(1, Math.floor(len / 0.6)));
      b.cyl(0.015, 0.015, 0.5, { x: 0.2, y: 0.06, z: zz, color: C.darkwood, seg: 4 });
      b.cyl(0.015, 0.015, 0.5, { x: -0.2, y: 0.06, z: zz, color: C.darkwood, seg: 4 });
    }
    b.pop();
    // stair down from the walkway ends
  }
  // an outside stair up to the first hanging street
  for (let k = 0; k < 9; k++) b.box(0.18, 0.05 + k * 0.19, 0.12, { x: A_ISL[0] + 0.23 - 0.09, y: IY, z: A_ISL[1] - 0.2 - k * 0.12, color: '#efe6d6' });

  // 4. over the rooftops — the cats', thieves' and lovers' route (violet ink)
  const roofPath = [];
  {
    const keys = ['-6.3,2.1,1,1', '-2.1,2.1,-1,1', '-2.1,2.1,1,1', '-2.1,6.3,1,-1', '2.1,6.3,-1,-1', '2.1,6.3,1,1', '2.1,2.1,1,1', '6.3,2.1,-1,1', '6.3,2.1,1,-1', '6.3,-2.1,-1,1'];
    let prev = null;
    for (const k of keys) {
      const t = roofTops[k];
      if (!t) continue;
      const cur = P(t[0], t[1] + 0.12, t[2]);
      if (prev) {
        // a little jump arc between roofs
        roofPath.push(P((prev.x + cur.x) / 2, Math.max(prev.y, cur.y) + 0.45, (prev.z + cur.z) / 2));
      }
      roofPath.push(cur);
      prev = cur;
    }
  }
  // 5. the swallows' route, cutting the air (gold ink)
  const airPath = [];
  {
    const a = P(A_ISL[0] - 0.62, IY + 7.9, A_ISL[1] + 0.62), c = P(B_ISL[0] + 0.62, IY + 3.5, B_ISL[1] - 0.62);
    for (let i = 0; i <= 24; i++) {
      const t = i / 24;
      const p = a.clone().lerp(c, t);
      p.y += Math.sin(Math.PI * t) * 2.2;
      p.x += Math.sin(t * Math.PI * 2) * 1.2;
      airPath.push(p);
    }
  }
  const routes = [
    { pts: streetPath, col: '#ff5a4a' },
    { pts: waterPath, col: '#4aa8ff' },
    { pts: hangPath, col: '#5fe08a' },
    { pts: roofPath, col: '#c27dff' },
    { pts: airPath, col: '#ffd060' },
  ];
  // faint dotted ink: tiny glowing beads along each route
  for (const R of routes) {
    const curve = new THREE.CurvePath();
    for (let i = 0; i < R.pts.length - 1; i++) curve.add(new THREE.LineCurve3(R.pts[i], R.pts[i + 1]));
    R.curve = curve;
    R.len = curve.getLength();
    const n = Math.floor(R.len / 0.22);
    for (let i = 0; i <= n; i++) {
      const p = curve.getPointAt(i / n);
      b.sphere(0.03, { x: p.x, y: p.y, z: p.z, mat: M.glow, color: R.col, glow: 1.3, seg: 4, hseg: 3 });
    }
  }
  // the two ends: little brass markers
  b.cyl(0.18, 0.2, 0.06, { x: A_ISL[0], y: IY, z: A_ISL[1], color: C.gold, mat: M.metal, seg: 14 });
  b.cyl(0.18, 0.2, 0.06, { x: B_ISL[0], y: IY, z: B_ISL[1], color: C.gold, mat: M.metal, seg: 14 });

  // people on the fondamenta and bridges
  for (let i = 0; i < 30; i++) {
    const I = rng.pick(islands);
    const along = rng.range(-1.2, 1.2);
    const side = rng.pick([[1, 0], [-1, 0], [0, 1], [0, -1]]);
    const e = (CELL - CAN) / 2 - 0.15;
    const x = I.cx + (side[0] ? side[0] * e : along), z = I.cz + (side[1] ? side[1] * e : along);
    person(b, { x, y: IY, z, h: 0.3, color: rng.pick([C.slate, C.terracotta, '#6b5a4a', C.plaster, '#4d5f74']) });
  }
  // mooring poles with stripes
  for (let i = 0; i < 26; i++) {
    const I = rng.pick(islands);
    const side = rng.pick([[1, 0], [-1, 0], [0, 1], [0, -1]]);
    const e = (CELL - CAN) / 2 + 0.12, along = rng.range(-1.1, 1.1);
    const x = I.cx + (side[0] ? side[0] * e : along), z = I.cz + (side[1] ? side[1] * e : along);
    const c = rng.pick(['#3f63a3', '#b8433f', '#2f8576', accent]);
    b.cyl(0.025, 0.025, 0.7, { x, y: WY - 0.05, z, color: '#efe6d6', seg: 6 });
    b.cyl(0.027, 0.027, 0.12, { x, y: WY + 0.25, z, color: c, seg: 6 });
    b.cyl(0.027, 0.027, 0.12, { x, y: WY + 0.48, z, color: c, seg: 6 });
  }

  const object = new THREE.Group();
  object.add(b.build());

  // ---------------------------------------------------------------- boats gliding along canal circuits
  const boatB = new Builder();
  {
    const g = new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    boatB.geo(g, { sx: 0.11, sy: 0.08, sz: 0.5, y: 0.06, color: '#1f1c1c', mat: M.wood });
    boatB.box(0.16, 0.02, 0.5, { y: 0.06, color: '#2a2422', mat: M.wood });
    boatB.rod([0, 0.06, 0.45], [0, 0.16, 0.56], 0.015, { color: '#d8c8a8', mat: M.wood });
    boatB.cone(0.05, 0.16, { y: 0.06, z: 0.0, color: '#7a2f2f', seg: 6, mat: M.wood });
    boatB.sphere(0.03, { y: 0.25, z: 0.0, color: '#d7b08c', seg: 5, mat: M.wood });
    // gondolier at the stern with an oar
    boatB.cone(0.04, 0.2, { y: 0.07, z: -0.38, color: '#e8e0d0', seg: 6, mat: M.wood });
    boatB.sphere(0.028, { y: 0.3, z: -0.38, color: '#d7b08c', seg: 5, mat: M.wood });
    boatB.rod([0.04, 0.32, -0.36], [0.12, 0.0, -0.5], 0.008, { color: C.wood, mat: M.wood });
  }
  const boatGeo = boatB.build({ shadows: false }).children[0].geometry;
  const circuits = [
    [[-4.2, -4.2], [0, -4.2], [0, 0], [-4.2, 0]],
    [[0, 0], [4.2, 0], [4.2, 4.2], [0, 4.2]],
    [[-4.2, 0], [0, 0], [0, 4.2], [-4.2, 4.2]],
    [[0, -4.2], [4.2, -4.2], [4.2, 0], [0, 0]],
    [[-4.2, -4.2], [4.2, -4.2], [4.2, 4.2], [-4.2, 4.2]],
  ];
  const NB = 9;
  const boats = new THREE.InstancedMesh(boatGeo, M.wood, NB);
  boats.castShadow = true;
  boats.frustumCulled = false;
  object.add(boats);
  const boatState = [];
  for (let i = 0; i < NB; i++) {
    const c = circuits[i % circuits.length];
    const pts = [...c, c[0]].map(([x, z]) => new THREE.Vector3(x, WY - 0.01, z));
    const curve = new THREE.CurvePath();
    for (let k = 0; k < pts.length - 1; k++) curve.add(new THREE.LineCurve3(pts[k], pts[k + 1]));
    boatState.push({ curve, len: curve.getLength(), u0: rng(), speed: rng.range(0.25, 0.4), dir: i % 2 ? 1 : -1, lat: rng.range(-0.15, 0.15) });
  }

  // ---------------------------------------------------------------- ink drops tracing the routes
  const TR = 8;
  const drops = glowParticles(routes.length * TR, 0.07, '#ffffff', 1);
  object.add(drops);
  routes.forEach((R, ri) => { for (let k = 0; k < TR; k++) drops.setColorAt(ri * TR + k, _col.set(R.col).multiplyScalar(k === 0 ? 3.2 : 2.2 * (1 - k / TR))); });

  // ---------------------------------------------------------------- swallows
  const NS = 28;
  const wingGeo = new THREE.BufferGeometry();
  wingGeo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0.06, 0, 0, -0.06, 0.2, 0, -0.08, 0, 0, 0.06, 0.2, 0, -0.08, 0, 0, -0.06], 3));
  wingGeo.computeVertexNormals();
  const swMat = new THREE.MeshStandardMaterial({ color: '#2a2a33', roughness: 0.8, side: THREE.DoubleSide });
  const wingL = new THREE.InstancedMesh(wingGeo, swMat, NS);
  const wingR = new THREE.InstancedMesh(wingGeo, swMat, NS);
  wingL.frustumCulled = wingR.frustumCulled = false;
  object.add(wingL, wingR);
  const sw = [];
  for (let i = 0; i < NS; i++) sw.push({ cx: rng.range(-4, 4), cz: rng.range(-4, 4), r: rng.range(2, 5), y: rng.range(5, 8.5), sp: rng.range(0.5, 0.9) * (rng.chance(0.5) ? 1 : -1), ph: rng.range(0, 6.3), wob: rng.range(0, 6) });

  const v = new THREE.Vector3(), v2 = new THREE.Vector3();
  const qBody = new THREE.Quaternion(), qWing = new THREE.Quaternion(), eul = new THREE.Euler();
  const mBody = new THREE.Matrix4(), mWing = new THREE.Matrix4();
  function update(t) {
    // boats
    for (let i = 0; i < NB; i++) {
      const s = boatState[i];
      let u = (s.u0 + s.dir * t * s.speed / s.len) % 1; if (u < 0) u += 1;
      s.curve.getPointAt(u, v);
      s.curve.getPointAt((u + 0.002 * s.dir + 1) % 1, v2);
      const ry = Math.atan2(v2.x - v.x, v2.z - v.z);
      _o.position.set(v.x + Math.cos(ry) * s.lat, v.y + Math.sin(t * 2 + i) * 0.01, v.z - Math.sin(ry) * s.lat);
      _o.rotation.set(0, ry, Math.sin(t * 1.5 + i) * 0.03);
      _o.scale.setScalar(1);
      _o.updateMatrix();
      boats.setMatrixAt(i, _o.matrix);
    }
    boats.instanceMatrix.needsUpdate = true;
    // ink drops: each route traced in turn, overlapping
    routes.forEach((R, ri) => {
      const dur = 7 + R.len * 0.12;
      const u = ((t + ri * 2.3) % (dur + 2)) / dur;
      for (let k = 0; k < TR; k++) {
        const s = u - k * 0.012;
        if (s <= 0 || s >= 1) { _o.position.set(0, -20, 0); _o.scale.setScalar(0.0001); }
        else { R.curve.getPointAt(s, v); _o.position.copy(v); _o.scale.setScalar(1 - k / TR * 0.7); }
        _o.rotation.set(0, 0, 0);
        _o.updateMatrix();
        drops.setMatrixAt(ri * TR + k, _o.matrix);
      }
    });
    drops.instanceMatrix.needsUpdate = true;
    // swallows wheel and dart
    for (let i = 0; i < NS; i++) {
      const s = sw[i];
      const a = s.ph + t * s.sp;
      const r = s.r * (1 + 0.25 * Math.sin(t * 0.7 + s.wob));
      const x = s.cx + Math.cos(a) * r, z = s.cz + Math.sin(a) * r * 0.8;
      const y = s.y + Math.sin(t * 1.3 + s.wob) * 0.6;
      const heading = Math.atan2(-Math.sin(a) * Math.sign(s.sp), Math.cos(a) * 0.8 * Math.sign(s.sp));
      const flap = Math.sin(t * 14 + s.wob * 3) * 0.6;
      eul.set(0, heading, -Math.sign(s.sp) * 0.4, 'YXZ');
      qBody.setFromEuler(eul);
      v.set(x, y, z);
      // right wing
      qWing.setFromEuler(eul.set(0, 0, flap));
      mWing.compose(v, qBody.clone().multiply(qWing), v2.set(1, 1, 1));
      wingR.setMatrixAt(i, mWing);
      qWing.setFromEuler(eul.set(0, Math.PI, flap));
      eul.set(0, 0, 0);
      mWing.compose(v, qBody.clone().multiply(qWing), v2.set(1, 1, -1));
      wingL.setMatrixAt(i, mWing);
    }
    wingL.instanceMatrix.needsUpdate = true;
    wingR.instanceMatrix.needsUpdate = true;
  }
  update(0);
  return { object, update };
}
