// Dorothea — four aluminium towers, seven gates with drawbridges, a moat that feeds
// four green canals cutting the city into nine quarters, each with its fixed number of
// houses and chimneys. The camel driver arrived young and thought it held every future;
// later he saw that the possibilities were few, laid out like a map he would follow.
import { THREE, Builder, M, C, Lines, glowMat, solid } from '../kit.js';

const ALU = new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0.3, roughness: 0.28 });

export default function build({ rng, accent }) {
  const b = new Builder();
  const object = new THREE.Group();
  const S = 6.0; // half-size of the walled square
  const MO = 7.25; // outer edge of the moat
  const CAN = 2.0, CW = 0.62; // canal centre lines at ±CAN, width
  const Q = 4.15; // quarter centres at -Q, 0, Q

  /* ------------------------------------------------ desert, moat, ground */
  b.cyl(10.45, 10.5, 0.06, { color: '#d8bf8e', mat: M.stone, seg: 64 });
  // ripples in the sand
  for (let i = 0; i < 40; i++) {
    const [x, z] = rng.inDisc(10.1, 8.0);
    if (Math.max(Math.abs(x), Math.abs(z)) < MO + 0.3) continue;
    b.box(rng.range(0.6, 1.4), 0.03, 0.08, { x, y: 0.05, z, ry: 0.5 + rng.range(-0.15, 0.15), color: '#cdb07c', mat: M.smooth });
  }
  b.box(MO * 2 + 0.3, 0.12, MO * 2 + 0.3, { y: 0.0, color: '#b9a57e', mat: M.stone }); // moat bed / embankment
  b.box(MO * 2, 0.06, MO * 2, { y: 0.07, color: '#3f7d63', mat: M.water });
  b.box(S * 2 + 0.6, 0.35, S * 2 + 0.6, { y: 0.0, color: '#d9cfbb', mat: M.stone }); // the city platform
  const G = 0.35; // ground level inside
  // the four green canals (two each way), with quays
  for (const c of [-CAN, CAN]) {
    b.box(CW, 0.06, S * 2 + 0.6, { x: c, y: G - 0.025, color: '#5aa585', mat: M.water });
    b.box(S * 2 + 0.6, 0.06, CW, { z: c, y: G - 0.02, color: '#5aa585', mat: M.water });
    for (const s of [-1, 1]) {
      b.box(0.08, 0.06, S * 2 + 0.6, { x: c + s * (CW / 2 + 0.04), y: G - 0.02, color: '#efe6d6', mat: M.smooth });
      b.box(S * 2 + 0.6, 0.06, 0.08, { z: c + s * (CW / 2 + 0.04), y: G - 0.015, color: '#efe6d6', mat: M.smooth });
    }
  }
  // cut the platform where the canals run: dark water channel sides (cheap: dark strips)
  // bridges where streets cross the canals (one per quarter edge)
  for (const c of [-CAN, CAN]) {
    for (const q of [-Q, 0, Q]) {
      bridgeArc(b, c, q, true);
      bridgeArc(b, q, c, false);
    }
  }

  /* -------------------------------------------- walls, gates and towers */
  const WALL_H = 1.7, WT = 0.42;
  // gates: [side, offset]; sides: 0:+z 1:+x 2:-z 3:-x — seven in all
  const gates = [[0, -Q], [0, Q], [1, -Q], [1, Q], [2, -Q], [2, Q], [3, 0]];
  const gateOn = (side, u) => gates.some(([s, o]) => s === side && Math.abs(o - u) < 0.6);
  const sideXf = (side, u, n) => { // point on the wall of `side` at offset u, n outward
    const d = S + n;
    if (side === 0) return [u, d];
    if (side === 1) return [d, -u];
    if (side === 2) return [-u, -d];
    return [-d, u];
  };
  for (let side = 0; side < 4; side++) {
    const ry = -side * Math.PI / 2; // local +z = outward
    const STEP = 0.5;
    for (let u = -S + STEP / 2; u < S; u += STEP) {
      if (gateOn(side, u)) continue;
      const [x, z] = sideXf(side, u, 0);
      b.box(STEP + 0.01, WALL_H, WT, { x, y: G, z, ry, color: '#e6dccb' });
      if (Math.round((u + S) / STEP) % 2 === 0) { const [x2, z2] = sideXf(side, u, 0.08); b.box(STEP * 0.5, 0.25, WT * 0.6, { x: x2, y: G + WALL_H, z: z2, ry, color: '#e6dccb' }); }
    }
    b.box(S * 2, 0.08, WT + 0.12, { ...(() => { const [x, z] = sideXf(side, 0, 0); return { x, z }; })(), y: G + WALL_H - 0.1, ry, color: '#cfc3ad', mat: M.smooth });
  }
  const bridgeRoots = [];
  for (const [side, u] of gates) {
    const ry = -side * Math.PI / 2;
    const [x, z] = sideXf(side, u, 0);
    // gatehouse: two piers and a lintel, aluminium portcullis
    b.push({ x, y: G, z, ry });
    for (const s of [-1, 1]) b.box(0.35, 2.3, 0.7, { x: s * 0.55, color: '#e6dccb' });
    b.box(1.45, 0.45, 0.7, { y: 2.05, color: '#e6dccb' });
    b.box(1.5, 0.08, 0.75, { y: 2.5, color: accent, mat: M.smooth });
    for (let k = -2; k <= 2; k++) b.box(0.03, 0.6, 0.03, { x: k * 0.15, y: 1.45, z: 0.0, mat: ALU, color: '#eef1f5' });
    b.box(0.75, 0.03, 0.03, { y: 1.6, mat: ALU, color: '#eef1f5' });
    b.box(0.75, 1.4, 0.02, { y: 0, z: -0.2, color: '#4d3426', mat: M.wood }); // doors (open, darker)
    b.pop();
    const [bx, bz] = sideXf(side, u, WT / 2 + 0.22);
    bridgeRoots.push({ x: bx, z: bz, ry });
  }
  // four aluminium towers at the corners
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    const x = sx * S, z = sz * S;
    b.cyl(0.95, 1.05, 0.6, { x, y: G, z, color: '#e6dccb', seg: 20 });
    b.cyl(0.72, 0.8, 8.6, { x, y: G + 0.6, z, mat: ALU, color: '#eef1f5', seg: 24 });
    for (let k = 1; k < 9; k++) b.torus(0.76 - k * 0.008, 0.035, { x, y: G + 0.6 + k * 0.95, z, rx: Math.PI / 2, mat: ALU, color: '#bfc6cf', tseg: 28, rseg: 4 });
    // ribbon windows (lit) up the tower
    for (let k = 0; k < 8; k++) {
      const a = Math.atan2(sz, sx) + Math.PI;
      for (const da of [-0.5, 0, 0.5]) b.quad(0.18, 0.4, { x: x + Math.cos(a + da) * 0.79, y: G + 1.3 + k * 0.95, z: z + Math.sin(a + da) * 0.79, ry: Math.PI / 2 - (a + da), mat: (k + da * 2) % 3 === 0 ? M.glow : M.smooth, color: (k + da * 2) % 3 === 0 ? C.lamp : '#3a4250', glow: 1.6 });
    }
    b.cyl(0.95, 0.8, 0.5, { x, y: G + 9.2, z, mat: ALU, color: '#e3e7ec', seg: 24 });
    b.cone(0.95, 2.4, { x, y: G + 9.7, z, mat: ALU, color: '#cfd5dc', seg: 24 });
    b.rod([x, G + 12.0, z], [x, G + 13.0, z], 0.02, { color: '#8a8f96' });
    b.geo(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0.7, -0.15, 0, 0, -0.3, 0], 3)), { x, y: G + 12.95, z, ry: 0.4, color: accent, mat: M.cloth });
  }

  /* ----------------------------------------------- nine quarters, eight houses each */
  const ROOFS = ['#c26a43', '#4f7189', '#6f8a52', '#b8913f', '#8a4a5a', '#5e8f86', '#a8553a', '#7b6aa0', '#c98a50'];
  const WALLS = ['#f3e9d8', '#efe4cf', '#ead2bf', '#f0dcc0', '#e6dccb', '#f4e6d6', '#ebdcc4', '#f1e1c9', '#efe0d2'];
  let qi = 0;
  for (const qz of [-Q, 0, Q]) {
    for (const qx of [-Q, 0, Q]) {
      const roof = ROOFS[qi], wall = WALLS[qi];
      if (qx === 0 && qz === 0) { bazaar(b, rng, accent, G); qi++; continue; }
      // a ring of eight houses around a courtyard with a single tree and well
      for (let k = 0; k < 8; k++) {
        const ix = [-1, 0, 1, 1, 1, 0, -1, -1][k], iz = [-1, -1, -1, 0, 1, 1, 1, 0][k];
        const corner = ix !== 0 && iz !== 0;
        const x = qx + ix * 1.05, z = qz + iz * 1.05;
        const w = corner ? 0.95 : 0.85, d = corner ? 0.95 : 0.7;
        const ry = (ix === 0 ? 0 : iz === 0 ? Math.PI / 2 : 0);
        const h = 1.0 + ((qi * 3 + k) % 3) * 0.18; // fixed, measured heights
        b.box(w, h, d, { x, y: G, z, ry, color: wall });
        b.geo(GABLE, { x, y: G + h, z, ry, sx: w + 0.08, sy: 0.42, sz: d + 0.08, color: roof, mat: M.flat });
        // one chimney per house, always on the same side
        const cxo = ry === 0 ? w * 0.28 : 0, czo = ry === 0 ? 0 : d * 0.28;
        b.box(0.12, 0.45, 0.12, { x: x + cxo, y: G + h + 0.1, z: z - czo, color: '#8e4a2c' });
        // a door toward the courtyard and two windows outward
        const lit = (qi + k) % 3 !== 0;
        const fx = -Math.sign(ix) * (ry === 0 ? 0 : 1), fz = -Math.sign(iz) * (ry === 0 ? 1 : 0);
        if (fx !== 0 || fz !== 0) {
          const off = (ry === 0 ? d : w) / 2 + 0.012;
          b.quad(0.16, 0.3, { x: x + fx * off * (ry === 0 ? 0 : 1), y: G + 0.16, z: z + fz * off, ry: Math.atan2(fx, fz), color: '#4d3426', mat: M.wood });
          b.quad(0.14, 0.16, { x: x - fx * off, y: G + 0.6, z: z - fz * off, ry: Math.atan2(-fx, -fz), color: lit ? C.lamp : '#3d3430', mat: lit ? M.glow : M.smooth, glow: 1.5 });
        }
      }
      // courtyard: a single cypress and a well
      b.cyl(0.22, 0.24, 0.2, { x: qx + 0.2, y: G, z: qz + 0.2, color: '#d9cfbb', seg: 12 });
      b.geo(new THREE.SphereGeometry(1, 7, 5), { x: qx - 0.2, y: G + 0.7, z: qz - 0.2, sx: 0.16, sz: 0.16, sy: 0.6, color: C.darkleaf, mat: M.flat });
      qi++;
    }
  }

  /* -------------------------------------------- the camel caravan outside */
  const camel = (x, z, ry, c = '#c49a62') => {
    b.push({ x, y: 0.06, z, ry, s: 0.9 });
    b.geo(new THREE.SphereGeometry(0.2, 10, 7), { y: 0.42, sx: 1.4, sy: 0.75, color: c, mat: M.smooth });
    b.sphere(0.13, { y: 0.56, x: -0.05, color: c, mat: M.smooth, seg: 8 }); // hump
    b.rod([0.22, 0.45, 0], [0.38, 0.72, 0], 0.045, { color: c });
    b.geo(new THREE.SphereGeometry(0.07, 8, 6), { x: 0.44, y: 0.74, sx: 1.6, color: c, mat: M.smooth });
    for (const [lx, lz] of [[0.18, 0.08], [0.18, -0.08], [-0.18, 0.08], [-0.18, -0.08]]) b.rod([lx, 0, lz], [lx, 0.38, lz], 0.022, { color: c });
    b.box(0.24, 0.05, 0.3, { y: 0.66, x: -0.05, color: accent, mat: M.cloth });
    b.pop();
  };
  const cz = MO + 1.6;
  for (let i = 0; i < 4; i++) camel(Q + 2.4 + i * 0.85, cz + i * 0.25, Math.PI - 0.2, i % 2 ? '#b98d58' : '#c9a36a');
  // the young camel driver, about to enter
  b.cone(0.08, 0.28, { x: Q + 1.7, y: 0.06, z: cz - 0.1, color: '#f3e9d8', seg: 6 });
  b.sphere(0.05, { x: Q + 1.7, y: 0.38, z: cz - 0.1, color: '#d7b08c', seg: 6 });
  b.cyl(0.07, 0.07, 0.04, { x: Q + 1.7, y: 0.42, z: cz - 0.1, color: '#f3e9d8', seg: 8 });
  // palms by the moat
  for (const [x, z] of [[-8.6, 3.2], [-7.9, 5.0], [8.4, -4.4], [-3.0, 9.3], [2.6, -9.4]]) {
    if (Math.hypot(x, z) > 10) continue;
    b.rod([x, 0.06, z], [x + 0.2, 2.0, z], 0.06, { color: '#8a6a44', r2: 0.08 });
    for (let k = 0; k < 7; k++) { const a = (k / 7) * Math.PI * 2; b.box(0.16, 0.02, 0.9, { x: x + 0.2 + Math.cos(a) * 0.36, y: 1.92, z: z + Math.sin(a) * 0.36, ry: Math.PI / 2 - a, rx: 0.35, color: C.leaf, mat: M.flat }); }
  }

  object.add(b.build());

  /* ----------------------------------------- drawbridges (instanced, animated) */
  const plank = new THREE.BoxGeometry(0.85, 0.07, 1.3).translate(0, 0, 0.65);
  const decks = new THREE.InstancedMesh(plank, solid('#7a5236', { roughness: 0.85 }), gates.length);
  decks.castShadow = true;
  const chains = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.012, 0.012, 1, 4).translate(0, 0.5, 0).rotateX(Math.PI / 2), solid('#55575c', { metalness: 0.6, roughness: 0.4 }), gates.length * 2);
  object.add(decks, chains);

  /* ----------------------- the few possibilities: a glowing map of paths */
  const MAPY = G + 2.7; // the map floats above the roofs
  const node = (i, j) => [i * Q, MAPY, j * Q];
  const edges = [];
  const E = (a, bb) => edges.push([a, bb]);
  // nodes indexed: entrance (front gate, +z, x=+Q) then quarters
  const N = { gate: [Q, MAPY - 1.2, S + 1.2] };
  for (const i of [-1, 0, 1]) for (const j of [-1, 0, 1]) N[`${i},${j}`] = node(i, j);
  // a tree of choices: few, and each forecloses the others
  const tree = {
    gate: ['1,1'], '1,1': ['0,1', '1,0'], '0,1': ['-1,1', '0,0'], '1,0': ['0,0', '1,-1'],
    '-1,1': ['-1,0'], '0,0': ['0,-1'], '1,-1': ['0,-1'], '-1,0': ['-1,-1'], '0,-1': ['-1,-1'], '-1,-1': [],
  };
  const mb = new Builder();
  for (const [a, list] of Object.entries(tree)) for (const c of list) {
    const A = N[a], B = N[c];
    const len = Math.hypot(B[0] - A[0], B[1] - A[1], B[2] - A[2]);
    const n = Math.round(len / 0.32);
    for (let k = 0; k < n; k += 2) {
      const t0 = k / n, t1 = (k + 1) / n;
      mb.rod([A[0] + (B[0] - A[0]) * t0, A[1] + (B[1] - A[1]) * t0, A[2] + (B[2] - A[2]) * t0], [A[0] + (B[0] - A[0]) * t1, A[1] + (B[1] - A[1]) * t1, A[2] + (B[2] - A[2]) * t1], 0.035, { mat: M.glow, color: '#ffcf7a', glow: 1.8, seg: 4 });
    }
  }
  const pathMat = { opacity: 1 };
  object.add(mb.build({ shadows: false }));
  // glowing stations at each node
  const nodeMesh = new THREE.InstancedMesh(new THREE.TorusGeometry(0.2, 0.03, 6, 20).rotateX(Math.PI / 2), glowMat('#ffcf7a', 2.2), Object.keys(N).length);
  {
    const m = new THREE.Matrix4();
    Object.values(N).forEach((p, i) => nodeMesh.setMatrixAt(i, m.makeTranslation(p[0], p[1], p[2])));
  }
  object.add(nodeMesh);
  // the traveller: a bright mote that walks one route through the tree, again and again
  const mote = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), glowMat('#fff0c8', 4));
  object.add(mote);
  const routes = [];
  const walk = (k, acc) => { const nx = tree[k]; if (!nx.length) { routes.push(acc); return; } for (const c of nx) walk(c, [...acc, c]); };
  walk('gate', ['gate']);

  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3(1, 1, 1), _a = new THREE.Vector3(), _b = new THREE.Vector3();
  const updateBridges = (t) => {
    gates.forEach(([side, u], i) => {
      const r = bridgeRoots[i];
      // each bridge rises and falls on its own slow cycle; most of the time they are down
      const c = (t * 0.07 + i / gates.length) % 1;
      const up = c < 0.18 ? Math.sin((c / 0.18) * Math.PI) : 0;
      const ang = -up * 1.2;
      _q.setFromEuler(_e.set(ang, r.ry, 0, 'YXZ'));
      _p.set(r.x, G - 0.02, r.z);
      decks.setMatrixAt(i, _m.compose(_p, _q, _s));
      // chains from the gate top to the tip of the deck
      for (const sgn of [-1, 1]) {
        const lx = sgn * 0.38;
        _a.set(lx, 1.9, -0.2).applyEuler(_e.set(0, r.ry, 0)).add(_p);
        _b.set(lx, 0, 1.25).applyEuler(_e.set(ang, r.ry, 0, 'YXZ')).add(_p);
        const len = _a.distanceTo(_b);
        _m.lookAt(_b, _a, THREE.Object3D.DEFAULT_UP);
        _m.scale(_s.set(1, 1, len));
        _m.setPosition(_a);
        _s.set(1, 1, 1);
        chains.setMatrixAt(i * 2 + (sgn > 0 ? 1 : 0), _m);
      }
    });
    decks.instanceMatrix.needsUpdate = true;
    chains.instanceMatrix.needsUpdate = true;
  };
  updateBridges(0);

  return {
    object,
    update(t) {
      updateBridges(t);
      // the mote follows route r (cycling through every possibility in turn)
      const per = 14;
      const r = routes[Math.floor(t / per) % routes.length];
      const u = (t % per) / per * (r.length - 1);
      const k = Math.min(r.length - 2, Math.floor(u));
      const A = N[r[k]], B = N[r[k + 1]], f = u - k;
      mote.position.set(A[0] + (B[0] - A[0]) * f, A[1] + 0.25 + Math.abs(Math.sin(t * 5)) * 0.04, A[2] + (B[2] - A[2]) * f);
      pathMat.opacity = 0.55 + 0.3 * Math.sin(t * 0.8);
    },
  };
}

function bridgeArc(b, x, z, alongZ) {
  // a little humped stone bridge over a canal
  const L = 1.0;
  for (let i = 0; i < 5; i++) {
    const t = (i + 0.5) / 5 - 0.5;
    const y = 0.35 + 0.12 * Math.cos(t * Math.PI);
    if (alongZ) b.box(L / 5 + 0.02, 0.06, 0.55, { x: x + t * L, y, z, color: '#efe6d6', mat: M.smooth });
    else b.box(0.55, 0.06, L / 5 + 0.02, { x, y, z: z + t * L, color: '#efe6d6', mat: M.smooth });
  }
}

function bazaar(b, rng, accent, G) {
  // the central quarter: eight stalls, the same number as the houses elsewhere
  const cols = [['#c14a3a', '#f3e9d8'], ['#2f6377', '#f3e9d8'], ['#d3a35d', '#8a3a2a'], ['#41613f', '#efe4cf']];
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    const x = Math.cos(a) * 1.15, z = Math.sin(a) * 1.15;
    b.push({ x, y: G, z, ry: Math.PI / 2 - a });
    b.box(0.7, 0.35, 0.35, { color: '#8a5d3d', mat: M.wood });
    const [c1, c2] = cols[k % 4];
    for (let s = 0; s < 4; s++) b.box(0.2, 0.025, 0.55, { x: -0.3 + s * 0.2, y: 0.85, z: 0.05, rx: -0.3, color: s % 2 ? c2 : c1, mat: M.cloth });
    for (const dx of [-0.32, 0.32]) b.cyl(0.02, 0.02, 0.85, { x: dx, z: 0.25, color: '#4d3426', seg: 4 });
    for (let s = 0; s < 5; s++) b.sphere(0.05, { x: -0.25 + s * 0.12, y: 0.4, z: 0.05, color: rng.pick(['#e2b354', '#c26a43', '#7a8f3a', '#d99a8c', '#5b2c5a']), mat: M.smooth, seg: 6 });
    b.pop();
  }
  b.cyl(0.3, 0.35, 0.3, { y: G, color: '#efe6d6', mat: M.smooth, seg: 12 });
  b.cyl(0.06, 0.06, 0.9, { y: G + 0.3, color: '#efe6d6', mat: M.smooth, seg: 8 });
  b.sphere(0.12, { y: G + 1.25, color: accent, mat: M.smooth, seg: 10 });
}

const GABLE = (() => {
  const s = new THREE.Shape([new THREE.Vector2(-0.5, 0), new THREE.Vector2(0.5, 0), new THREE.Vector2(0, 1)]);
  const g = new THREE.ExtrudeGeometry(s, { depth: 1, bevelEnabled: false });
  g.translate(0, 0, -0.5);
  return g;
})();
