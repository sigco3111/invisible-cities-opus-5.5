// Moriana — a city with no thickness, only a face and an obverse, like a sheet of paper.
// It stands across the plinth as one tall, thin, gently curving leaf cut into a skyline.
// On its face: alabaster gates glowing in the sun, coral columns, glass villas like
// aquariums where silver-scaled dancers swim beneath jellyfish chandeliers.
// Walk half a circle: rusted sheet metal, sackcloth, nail-studded planks, sooty pipes,
// heaps of tins, blind walls with faded signs. The two sides can neither part nor meet.
import { THREE, Builder, M, C } from '../kit.js';
import { _o, _col } from './_c_util.js';

const X0 = -9.3, X1 = 9.3;
const BASE = 5.4;
const zOff = (x) => 0.55 * Math.sin(x * 0.33 + 0.3);
const dz = (x) => 0.55 * 0.33 * Math.cos(x * 0.33 + 0.3);
const TH = 0.1; // half thickness of the sheet

export default function build({ rng, accent }) {
  const object = new THREE.Group();
  const b = new Builder();
  const alab = new Builder(); // glowing alabaster (animated material)

  // place relief on the FRONT (+z) or BACK (-z) of the sheet at (x, y); local +z = outward
  const front = (B, x, y, out = 0) => B.push({ x, y, z: zOff(x) + TH + out, ry: -Math.atan(dz(x)) });
  const backP = (B, x, y, out = 0) => B.push({ x, y, z: zOff(x) - TH - out, ry: Math.PI - Math.atan(dz(x)) });

  // ---------------------------------------------------------------- the ground: marble before, dirt behind
  {
    const half = (sgn, color, h) => {
      const pts = [];
      for (let i = 0; i <= 60; i++) { const x = X0 - 0.9 + i * ((X1 - X0 + 1.8) / 60); pts.push([x, zOff(Math.max(X0, Math.min(X1, x)))]); }
      for (let i = 0; i <= 40; i++) {
        const a = sgn > 0 ? Math.PI - i / 40 * Math.PI : -i / 40 * Math.PI; // around the front (z>0) or back
        pts.push([Math.cos(a) * 10.3, sgn > 0 ? Math.abs(Math.sin(a)) * 10.3 : -Math.abs(Math.sin(a)) * 10.3]);
      }
      const clipped = pts.map(([x, z]) => { const r = Math.hypot(x, z); return r > 10.3 ? [x * 10.3 / r, z * 10.3 / r] : [x, z]; });
      // ensure orientation for the slab helper
      let area = 0;
      for (let i = 0; i < clipped.length; i++) { const [x1, z1] = clipped[i], [x2, z2] = clipped[(i + 1) % clipped.length]; area += x1 * z2 - x2 * z1; }
      if (area > 0) clipped.reverse();
      b.slab(clipped, h, { color });
    };
    half(1, '#efe8dc', 0.14);
    half(-1, '#5a4636', 0.1);
  }
  // marble paving joints and a reflecting pool before the face
  for (let i = 0; i < 12; i++) b.box(0.025, 0.006, 6, { x: -8.25 + i * 1.5, y: 0.14, z: 3.6, color: '#d8cfbf' });
  b.box(7.2, 0.02, 1.6, { x: 0, y: 0.14, z: 3.6, color: '#d8cfbf' });
  b.box(7.0, 0.012, 1.4, { x: 0, y: 0.155, z: 3.6, color: '#6fa8b4', mat: M.smooth });
  for (let i = 0; i < 7; i++) b.cyl(0.08, 0.08, 0.01, { x: -2.8 + i * 0.9 + rng.range(-0.2, 0.2), y: 0.17, z: 3.6 + rng.range(-0.4, 0.4), color: '#7fa86a', seg: 8 });
  // steps up to the gates
  for (let s = 0; s < 3; s++) {
    for (let i = -9; i <= 9; i += 0.5) {
      b.box(0.52, 0.06 * (3 - s), 0.25, { x: i, y: 0.14, z: zOff(i) + TH + 0.15 + s * 0.25, ry: -Math.atan(dz(i)), color: '#f6f0e6' });
    }
  }
  // potted palms on the marble
  for (const x of [-7.5, -3.6, 3.6, 7.5]) {
    const z = 4.8 + rng.range(-0.3, 0.3);
    b.cyl(0.2, 0.15, 0.3, { x, y: 0.14, z, color: '#f6f0e6', mat: M.smooth, seg: 12 });
    b.rod([x, 0.4, z], [x + 0.1, 1.5, z], 0.04, { color: C.wood });
    for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2; b.box(0.12, 0.02, 0.6, { x: x + 0.1 + Math.cos(a) * 0.25, y: 1.45, z: z + Math.sin(a) * 0.25, ry: Math.PI / 2 - a, rx: 0.4, color: '#5f8a54', mat: M.flat }); }
  }
  // fine figures strolling on the marble
  for (let i = 0; i < 9; i++) {
    const x = rng.range(-8, 8), z = rng.range(1.6, 6.5);
    if (Math.hypot(x, z) > 9.5) continue;
    b.cone(0.07, 0.26, { x, y: 0.14, z, color: rng.pick(['#f6f0e6', '#e8c4c0', '#a8c8d0', accent]), seg: 8 });
    b.sphere(0.042, { x, y: 0.43, z, color: '#e2c3a3', seg: 6 });
  }

  // ---------------------------------------------------------------- the sheet itself, cut into a skyline
  const features = [
    [-8.3, 'tower', 1.0, 7.4], [-6.5, 'dome', 1.8, 7.0], [-4.5, 'spire', 0.8, 10.2], [-2.6, 'crenel', 1.9, 7.0],
    [0, 'dome', 3.0, 9.0], [0, 'spire', 0.3, 10.6], [2.6, 'spire', 0.7, 11.2], [4.4, 'tower', 1.3, 8.2], [6.4, 'dome', 1.7, 7.3], [8.3, 'spire', 0.6, 8.4],
  ];
  const profile = (x) => {
    let h = BASE;
    for (const [cx, type, w, H] of features) {
      const d = Math.abs(x - cx);
      if (d > w / 2) continue;
      let v;
      if (type === 'tower') v = H;
      else if (type === 'crenel') v = H - (Math.floor((x - cx + w / 2) / 0.24) % 2 ? 0.24 : 0);
      else if (type === 'dome') { const r = w / 2; v = H - r + Math.sqrt(r * r - d * d); }
      else { const bt = H - 2.6; v = bt + (H - bt) * (1 - d / (w / 2)); }
      h = Math.max(h, v);
    }
    // slow undulating ripple of the parapet between features
    return h;
  };
  // the sheet: vertical strips following the skyline, bent in plan (correct normals everywhere)
  const sheetGeo = (z0, z1) => {
    const pos = [];
    const xs = [];
    for (let x = X0; x <= X1 + 1e-6; x += 0.04) xs.push(x);
    const face = (z, flip) => {
      for (let i = 0; i < xs.length - 1; i++) {
        const xa = xs[i], xb = xs[i + 1], ha = profile(xa), hb = profile(xb);
        const za = zOff(xa) + z, zb = zOff(xb) + z;
        const q = [[xa, 0, za], [xb, 0, zb], [xb, hb, zb], [xa, ha, za]];
        const tri = flip ? [0, 2, 1, 0, 3, 2] : [0, 1, 2, 0, 2, 3];
        for (const k of tri) pos.push(...q[k]);
      }
    };
    face(z1, false);
    face(z0, true);
    // the cut edge on top and the two ends
    for (let i = 0; i < xs.length - 1; i++) {
      const xa = xs[i], xb = xs[i + 1], ha = profile(xa), hb = profile(xb);
      const a0 = [xa, ha, zOff(xa) + z0], a1 = [xa, ha, zOff(xa) + z1], b0 = [xb, hb, zOff(xb) + z0], b1 = [xb, hb, zOff(xb) + z1];
      pos.push(...a0, ...a1, ...b1, ...a0, ...b1, ...b0);
    }
    for (const [x, s] of [[X0, -1], [X1, 1]]) {
      const h = profile(x), za = zOff(x);
      const q = [[x, 0, za + z0], [x, 0, za + z1], [x, h, za + z1], [x, h, za + z0]];
      const tri = s > 0 ? [0, 2, 1, 0, 3, 2] : [0, 1, 2, 0, 2, 3];
      for (const k of tri) pos.push(...q[k]);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.computeVertexNormals();
    return g;
  };
  b.geo(sheetGeo(0, TH), { color: '#f4eee4', mat: M.smooth });
  b.geo(sheetGeo(-TH, 0), { color: '#6a5444', mat: M.stone });
  // ornament on the upper face: oculi, blind arcades, gilded ribs on the domes
  for (const [cx, type, w, H] of features) {
    if (type === 'dome') {
      for (let k = -2; k <= 2; k++) {
        const a = k * 0.32;
        const r = w / 2;
        front(b, cx, H - r, 0.0);
        b.geo(new THREE.TorusGeometry(r * 0.92, 0.025, 4, 16, 0.3), { rz: Math.PI / 2 - a - 0.15, color: C.gold, mat: M.metal });
        b.pop();
      }
      front(b, cx, H - w / 2 - 0.15, 0.0);
      b.geo(new THREE.TorusGeometry(w * 0.16, 0.035, 5, 18), { color: '#ffffff', mat: M.smooth });
      b.geo(new THREE.CircleGeometry(w * 0.15, 18), { z: -0.01, color: '#9fd0dc', mat: M.smooth });
      b.pop();
    } else if (type === 'spire' && w > 0.5) {
      front(b, cx, H - 2.2, 0.0);
      b.box(0.12, 0.5, 0.03, { color: '#9fd0dc', mat: M.smooth });
      b.cyl(0.06, 0.06, 0.03, { y: 0.5, rx: Math.PI / 2, color: '#9fd0dc', mat: M.smooth, seg: 10 });
      b.pop();
    } else if (type === 'tower') {
      for (let k = 0; k < 2; k++) { front(b, cx, H - 1.0 - k * 0.8, 0.0); b.box(w * 0.5, 0.45, 0.03, { color: '#9fd0dc', mat: M.smooth }); b.box(w * 0.6, 0.05, 0.08, { y: -0.05, color: '#ffffff', mat: M.smooth }); b.pop(); }
    }
  }
  for (let x = X0 + 0.45; x < X1 - 0.3; x += 0.62) {
    if (profile(x) < 6.2 && profile(x) < BASE + 0.4) {
      front(b, x, 4.1, 0.0);
      b.box(0.3, 0.7, 0.02, { color: '#e8dcc8' });
      b.cyl(0.15, 0.15, 0.02, { y: 0.7, rx: Math.PI / 2, color: '#e8dcc8', seg: 10, thetaStart: -Math.PI / 2, thetaLength: Math.PI });
      b.pop();
    }
  }
  // a thin brass edge along the cut line (it reads as a sheet from the side)
  {
    const top = [];
    for (let x = X0; x <= X1 + 1e-6; x += 0.04) top.push([x, profile(x) + 0.012, zOff(x)]);
    for (let i = 0; i < top.length - 1; i++) b.beam(top[i], top[i + 1], 0.035, { color: C.gold, mat: M.metal });
  }

  // ---------------------------------------------------------------- FACE: marble cornices, alabaster gates, coral columns
  for (let x = X0 + 0.2; x < X1 - 0.2; x += 0.35) {
    for (const y of [2.55, 5.3]) {
      if (y > profile(x) - 0.1) continue;
      front(b, x, y); b.box(0.37, 0.12, 0.12, { z: 0.05, color: '#ffffff', mat: M.smooth }); b.pop();
    }
  }
  const gates = [-5.6, 0, 5.4];
  for (const gx of gates) {
    const w = gx === 0 ? 1.8 : 1.3, h = gx === 0 ? 3.2 : 2.5;
    front(alab, gx, 0.14);
    alab.box(w, h - w / 2, 0.04, { z: 0.02, color: '#ffe6c4' });
    alab.cyl(w / 2, w / 2, 0.04, { y: h - w / 2, z: 0.02, rx: Math.PI / 2, color: '#ffe6c4', seg: 24, thetaStart: -Math.PI / 2, thetaLength: Math.PI });
    alab.pop();
    // veins of the alabaster
    front(b, gx, 0.14, 0.05);
    for (let k = 0; k < 5; k++) b.box(0.012, h * 0.7, 0.01, { x: -w * 0.35 + k * w * 0.18, y: 0.15, rz: rng.range(-0.15, 0.15), color: '#e0b890' });
    b.pop();
    // marble frame
    front(b, gx, 0.14);
    b.box(0.2, h - w / 2, 0.22, { x: -w / 2 - 0.1, color: '#ffffff', mat: M.smooth });
    b.box(0.2, h - w / 2, 0.22, { x: w / 2 + 0.1, color: '#ffffff', mat: M.smooth });
    b.geo(new THREE.TorusGeometry(w / 2 + 0.1, 0.11, 6, 20, Math.PI), { y: h - w / 2, z: 0.0, color: '#ffffff', mat: M.smooth });
    b.box(w + 0.7, 0.16, 0.3, { y: h + 0.15, color: '#ffffff', mat: M.smooth });
    b.pop();
  }
  // coral columns: a colonnade before the face
  const coral = ['#e0705a', '#ea8a6a', '#d65f52', '#f09a80'];
  for (let x = X0 + 0.5; x < X1 - 0.4; x += 0.82) {
    if (gates.some((g) => Math.abs(g - x) < 1.25)) continue;
    const z = zOff(x) + TH + 0.7;
    const col = rng.pick(coral);
    b.cyl(0.11, 0.13, 2.2, { x, y: 0.14, z, color: col, seg: 9 });
    for (let k = 0; k < 7; k++) {
      const a = rng.range(0, 6.3), y = 0.3 + k * 0.28;
      b.sphere(0.05, { x: x + Math.cos(a) * 0.11, y: 0.14 + y, z: z + Math.sin(a) * 0.11, color: col, seg: 5 });
    }
    // branching coral capital
    for (let k = 0; k < 4; k++) {
      const a = k * Math.PI / 2 + 0.4;
      const tx = x + Math.cos(a) * 0.28, tz = z + Math.sin(a) * 0.2;
      b.rod([x, 2.25, z], [tx, 2.55, tz], 0.04, { color: col });
      b.sphere(0.06, { x: tx, y: 2.56, z: tz, color: col, seg: 6 });
    }
    b.box(0.9, 0.1, 0.75, { x, y: 2.58, z: z - 0.3, ry: -Math.atan(dz(x)), color: '#ffffff', mat: M.smooth });
  }

  // glass villas, like aquariums, set into the face
  const villas = [[-7.4, 3.1], [-3.4, 3.4], [2.3, 2.95], [6.6, 3.1], [-1.7, 5.6], [3.7, 5.65]];
  const jelly = [], dancers = [];
  for (const [vx, vy] of villas) {
    const w = 1.7, h = 1.25, d = 0.8;
    front(b, vx, vy);
    b.box(w + 0.2, 0.1, d + 0.15, { z: d / 2, color: '#ffffff', mat: M.smooth });
    b.box(w + 0.2, 0.08, d + 0.15, { y: h, z: d / 2, color: '#ffffff', mat: M.smooth });
    b.box(w, h, 0.02, { y: 0.05, z: 0.012, color: '#2c5a6a', mat: M.smooth }); // the deep blue back wall
    for (const s of [-1, 1]) b.box(0.05, h, 0.05, { x: s * w / 2, y: 0.05, z: d, color: '#ffffff', mat: M.smooth });
    b.box(w, h, 0.02, { y: 0.05, z: d, color: '#bfe8ee', mat: M.glass });
    b.box(0.02, h, d, { x: -w / 2, y: 0.05, z: d / 2, color: '#bfe8ee', mat: M.glass });
    b.box(0.02, h, d, { x: w / 2, y: 0.05, z: d / 2, color: '#bfe8ee', mat: M.glass });
    // seaweed in the corners
    for (const s of [-1, 1]) for (let k = 0; k < 3; k++) b.rod([s * (w / 2 - 0.12) + k * 0.05 * s, 0.1, 0.25 + k * 0.15], [s * (w / 2 - 0.2), 0.55 + k * 0.1, 0.3 + k * 0.12], 0.015, { color: '#4f8a6a' });
    b.pop();
    const n = vx > 0 ? 2 : 1;
    for (let k = 0; k < n; k++) {
      const lx = (n === 1 ? 0 : (k - 0.5) * 0.75);
      const ry = -Math.atan(dz(vx));
      jelly.push({ x: vx + Math.cos(ry) * lx + Math.sin(ry) * 0.42, y: vy + h - 0.18, z: zOff(vx) + TH + Math.cos(ry) * 0.42 - Math.sin(ry) * lx, ph: rng.range(0, 6), col: rng.pick(['#bff6ff', '#ffd0f0', '#e8e0ff']) });
    }
    for (let k = 0; k < 3; k++) dancers.push({ cx: vx + Math.sin(-Math.atan(dz(vx))) * 0.4, cz: zOff(vx) + TH + 0.4, y: vy + 0.1, r: 0.35, ph: k * 2.1 + rng(), sp: rng.range(0.4, 0.7) });
  }

  // ---------------------------------------------------------------- OBVERSE: rust, sackcloth, planks, pipes, tins
  const rust = ['#7a4a2e', '#8e5a36', '#6a4030', '#9a6a44', '#5e4636', '#7f6a58'];
  // corrugated panels tiled over the back
  for (let x = X0 + 0.1; x < X1 - 0.3;) {
    const w = rng.range(0.55, 1.1);
    let y = 0.1;
    while (y < profile(x + w / 2) - 0.4) {
      const h = rng.range(0.8, 1.6);
      const top = Math.min(y + h, Math.min(profile(x + 0.05), profile(x + w / 2), profile(x + w - 0.05)) - 0.12);
      if (top - y < 0.35) break;
      const kind = rng();
      backP(b, x + w / 2, y, 0.005);
      const ph = top - y;
      if (kind < 0.55) {
        const c = rng.pick(rust);
        b.box(w - 0.04, ph, 0.02, { color: c, mat: M.rough_metal, rz: rng.range(-0.02, 0.02) });
        for (let k = 0; k < Math.floor(w / 0.1); k++) b.box(0.035, ph, 0.03, { x: -w / 2 + 0.06 + k * 0.1, y: 0, z: 0.015, color: c, mat: M.rough_metal });
        // streaks of rust
        b.box(0.08, ph * 0.6, 0.035, { x: rng.range(-w / 3, w / 3), y: ph * 0.1, z: 0.02, color: '#5a2e1e', mat: M.rough_metal });
      } else if (kind < 0.75) {
        // nail-studded planks
        const n = Math.floor(ph / 0.16);
        for (let k = 0; k < n; k++) {
          b.box(w - 0.04, 0.14, 0.04, { y: k * 0.16, rz: rng.range(-0.03, 0.03), color: rng.pick(['#7a6248', '#6a5440', '#8a7050', '#5a4838']), mat: M.wood });
          for (const nx of [-w / 2 + 0.08, w / 2 - 0.08]) b.box(0.025, 0.025, 0.02, { x: nx, y: k * 0.16 + 0.06, z: 0.03, color: '#2a2a2a', mat: M.metal });
        }
      } else if (kind < 0.88) {
        // sackcloth patch, sagging
        const g = new THREE.PlaneGeometry(w - 0.1, ph - 0.05, 4, 4);
        const pp = g.attributes.position;
        for (let i = 0; i < pp.count; i++) pp.setZ(i, 0.05 * Math.sin((pp.getX(i) / w + 0.5) * Math.PI) * Math.sin((pp.getY(i) / ph + 0.5) * Math.PI) + 0.02);
        g.computeVertexNormals();
        b.geo(g, { y: ph / 2, color: rng.pick(['#a8916a', '#9a845e', '#b8a078']), mat: M.cloth });
        for (const [cx, cy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) b.box(0.03, 0.03, 0.03, { x: cx * (w / 2 - 0.08), y: ph / 2 + cy * (ph / 2 - 0.06), z: 0.03, color: '#2a2a2a' });
      } else {
        // a blind wall with a faded sign (stripes and a disc, no letters)
        b.box(w - 0.04, ph, 0.03, { color: '#8a8070' });
        b.box(w * 0.75, ph * 0.4, 0.035, { y: ph * 0.35, color: rng.pick(['#a87a6a', '#7a8a9a', '#9a9a6a']) });
        b.box(w * 0.6, 0.05, 0.04, { y: ph * 0.5, color: '#d8cfbf' });
        b.box(w * 0.45, 0.05, 0.04, { y: ph * 0.42, color: '#d8cfbf' });
        b.cyl(0.12, 0.12, 0.02, { x: -w * 0.28, y: ph * 0.55, z: 0.03, rx: Math.PI / 2, color: '#c8b080', seg: 12 });
      }
      b.pop();
      y = top + 0.04;
    }
    x += w;
  }
  // sooty pipes: long horizontal runs and risers with elbows
  for (const y of [1.7, 3.6]) {
    const pts = [];
    for (let x = X0 + 0.3; x <= X1 - 0.3; x += 0.3) pts.push([x, y + 0.08 * Math.sin(x * 1.3), zOff(x) - TH - 0.16]);
    b.tube(pts, 0.07, { color: '#2e2a28', mat: M.rough_metal, tseg: 120, rseg: 6 });
    for (let x = X0 + 1; x < X1 - 0.5; x += 1.7) {
      const z = zOff(x) - TH - 0.16;
      b.cyl(0.09, 0.09, 0.12, { x: x - 0.06, y: y - 0.0, z, rz: Math.PI / 2, color: '#1e1c1a', mat: M.rough_metal, seg: 8 });
    }
  }
  const stacks = [];
  for (const x of [-7.0, -3.1, 1.2, 5.4, 7.8]) {
    const z = zOff(x) - TH - 0.25;
    const top = profile(x) - rng.range(0.25, 0.6);
    b.cyl(0.09, 0.1, top, { x, y: 0.1, z, color: '#2e2a28', mat: M.rough_metal, seg: 8 });
    b.cyl(0.14, 0.11, 0.2, { x, y: top, z, color: '#1e1c1a', mat: M.rough_metal, seg: 8 });
    stacks.push([x, top + 0.2, z]);
  }
  // heaps of tins and junk on the dirt
  for (let h = 0; h < 7; h++) {
    const cx = rng.range(-7.5, 7.5), cz = zOff(cx) - rng.range(1.2, 4.5);
    if (Math.hypot(cx, cz) > 9.4) continue;
    for (let k = 0; k < 40; k++) {
      const a = rng.range(0, 6.3), r = Math.sqrt(rng()) * 0.75;
      const y = 0.1 + (0.75 - r) * 0.5 * rng();
      b.cyl(0.05, 0.05, 0.11, { x: cx + Math.cos(a) * r, y, z: cz + Math.sin(a) * r, rx: rng.range(0, 3), rz: rng.range(0, 3), color: rng.pick(['#b8b8b0', '#9a9a90', '#8e5a36', '#c8c0a0', '#6a6a60']), mat: M.rough_metal, seg: 7 });
    }
  }
  for (let k = 0; k < 40; k++) {
    const x = rng.range(-9, 9), z = zOff(x) - rng.range(0.6, 6);
    if (Math.hypot(x, z) > 9.6) continue;
    b.box(rng.range(0.1, 0.4), rng.range(0.03, 0.15), rng.range(0.1, 0.4), { x, y: 0.1, z, ry: rng() * 6, rz: rng.range(-0.3, 0.3), color: rng.pick(['#5a4636', '#6b6a5e', '#7a6a58', '#3e3a36', '#8e5a36']) });
  }
  // a ladder and a bare bulb hanging on a wire
  {
    const x = -1.2;
    backP(b, x, 0.1, 0.35);
    for (const s of [-1, 1]) b.box(0.04, 3.2, 0.04, { x: s * 0.18, rx: -0.08, color: '#6a5440', mat: M.wood });
    for (let k = 0; k < 10; k++) b.box(0.36, 0.03, 0.03, { y: 0.25 + k * 0.3, z: -k * 0.024, color: '#6a5440', mat: M.wood });
    b.pop();
  }
  // shabby figures behind
  for (let i = 0; i < 8; i++) {
    const x = rng.range(-8, 8), z = zOff(x) - rng.range(0.8, 5.5);
    if (Math.hypot(x, z) > 9.4) continue;
    b.cone(0.07, 0.25, { x, y: 0.1, z, color: rng.pick(['#4a4038', '#3a3a3e', '#5a4a3a']), seg: 6 });
    b.sphere(0.042, { x, y: 0.39, z, color: '#b89070', seg: 6 });
  }

  // ---------------------------------------------------------------- assemble
  object.add(b.build());
  const alabMat = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false });
  const ag = alab.build({ shadows: false });
  ag.traverse((o) => { if (o.isMesh) o.material = alabMat; });
  object.add(ag);

  // jellyfish chandeliers (bells + tentacles), silver dancers, soot, the swinging bulb
  const NJ = jelly.length, NT = 7;
  const bellGeo = new THREE.SphereGeometry(0.17, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  const bells = new THREE.InstancedMesh(bellGeo, new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false, transparent: true, opacity: 0.9 }), NJ);
  const tentGeo = new THREE.CylinderGeometry(0.006, 0.003, 0.4, 3).translate(0, -0.2, 0);
  const tents = new THREE.InstancedMesh(tentGeo, new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false }), NJ * NT);
  jelly.forEach((j, i) => {
    bells.setColorAt(i, _col.set(j.col).multiplyScalar(1.8));
    for (let k = 0; k < NT; k++) tents.setColorAt(i * NT + k, _col.set(j.col).multiplyScalar(1.1));
  });
  const ND = dancers.length;
  const dGeo = new THREE.ConeGeometry(0.06, 0.24, 7).translate(0, 0.12, 0);
  const dancerM = new THREE.InstancedMesh(dGeo, new THREE.MeshStandardMaterial({ color: '#dfe6ee', metalness: 0.9, roughness: 0.25 }), ND);
  const dHead = new THREE.InstancedMesh(new THREE.SphereGeometry(0.04, 8, 6).translate(0, 0.29, 0), dancerM.material, ND);
  const NS = stacks.length * 6;
  const soot = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.13, 1), new THREE.MeshStandardMaterial({ color: '#3a3634', roughness: 1, transparent: true, opacity: 0.75, depthWrite: false }), NS);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffd9a0').multiplyScalar(2.4), toneMapped: false }));
  const wireG = new THREE.BufferGeometry();
  const wireP = new Float32Array(6);
  wireG.setAttribute('position', new THREE.BufferAttribute(wireP, 3));
  const wire = new THREE.Line(wireG, new THREE.LineBasicMaterial({ color: '#1a1a1a' }));
  for (const m of [bells, tents, dancerM, dHead, soot, wire]) m.frustumCulled = false;
  object.add(bells, tents, dancerM, dHead, soot, bulb, wire);
  const BX = 2.9, BTOP = 3.1, BZ = zOff(BX) - TH - 0.55;

  function update(t) {
    alabMat.color.setScalar(0.85 + 0.12 * Math.sin(t * 0.5));
    jelly.forEach((j, i) => {
      const pulse = 1 + 0.18 * Math.sin(t * 1.6 + j.ph);
      const y = j.y + 0.05 * Math.sin(t * 0.8 + j.ph);
      _o.position.set(j.x, y, j.z);
      _o.rotation.set(0, t * 0.2 + j.ph, 0);
      _o.scale.set(pulse, 1 / pulse, pulse);
      _o.updateMatrix();
      bells.setMatrixAt(i, _o.matrix);
      for (let k = 0; k < NT; k++) {
        const a = k / NT * Math.PI * 2 + t * 0.2;
        _o.position.set(j.x + Math.cos(a) * 0.12 * pulse, y, j.z + Math.sin(a) * 0.12 * pulse);
        _o.rotation.set(0.25 * Math.sin(t * 1.6 + j.ph + k), 0, 0.25 * Math.cos(t * 1.3 + k));
        _o.scale.set(1, 0.9 + 0.2 * Math.sin(t * 1.6 + j.ph + 1), 1);
        _o.updateMatrix();
        tents.setMatrixAt(i * NT + k, _o.matrix);
      }
    });
    bells.instanceMatrix.needsUpdate = true;
    tents.instanceMatrix.needsUpdate = true;
    dancers.forEach((d, i) => {
      const a = d.ph + t * d.sp;
      _o.position.set(d.cx + Math.cos(a) * d.r, d.y + 0.04 * Math.sin(t * 2 + i), d.cz + Math.sin(a) * 0.18);
      _o.rotation.set(0.15 * Math.sin(t + i), -a, 0);
      _o.scale.setScalar(1);
      _o.updateMatrix();
      dancerM.setMatrixAt(i, _o.matrix);
      dHead.setMatrixAt(i, _o.matrix);
    });
    dancerM.instanceMatrix.needsUpdate = true;
    dHead.instanceMatrix.needsUpdate = true;
    let n = 0;
    for (const [sx, sy, sz] of stacks) {
      for (let k = 0; k < 6; k++) {
        const u = (t * 0.22 + k / 6 + sx * 0.1) % 1;
        _o.position.set(sx + u * 0.9, sy + u * 1.8, sz - u * 0.5);
        _o.rotation.set(0, 0, 0);
        _o.scale.setScalar(0.5 + u * 1.8);
        _o.updateMatrix();
        soot.setMatrixAt(n++, _o.matrix);
      }
    }
    soot.instanceMatrix.needsUpdate = true;
    const sw = 0.18 * Math.sin(t * 1.1);
    const bx = BX + Math.sin(sw) * 0.8, by = BTOP - Math.cos(sw) * 0.8;
    bulb.position.set(bx, by, BZ);
    wireP[0] = BX; wireP[1] = BTOP; wireP[2] = BZ; wireP[3] = bx; wireP[4] = by; wireP[5] = BZ;
    wireG.attributes.position.needsUpdate = true;
  }
  update(0);
  return { object, update };
}
