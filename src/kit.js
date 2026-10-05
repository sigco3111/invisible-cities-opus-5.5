// The builder's kit: shared materials, a seeded RNG, a geometry-merging Builder
// and a small vocabulary of architectural pieces. Every city is built from these,
// so all 55 dioramas share one visual language (and very few draw calls).
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export { THREE };

/* ------------------------------------------------------------------ RNG -- */

export function rng(seed = 1) {
  if (typeof seed === 'string') {
    let h = 2166136261;
    for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
    seed = h >>> 0;
  }
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const r = () => next();
  r.range = (a, b) => a + (b - a) * next();
  r.int = (a, b) => Math.floor(a + (b - a + 1) * next()); // inclusive
  r.pick = (arr) => arr[Math.floor(next() * arr.length)];
  r.chance = (p) => next() < p;
  r.sign = () => (next() < 0.5 ? -1 : 1);
  r.gauss = () => {
    let u = 0, v = 0;
    while (u === 0) u = next();
    while (v === 0) v = next();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  /** random point in disc of radius R (uniform) */
  r.inDisc = (R, minR = 0) => {
    const rr = Math.sqrt(r.range((minR / R) ** 2, 1)) * R;
    const t = r.range(0, Math.PI * 2);
    return [Math.cos(t) * rr, Math.sin(t) * rr];
  };
  r.shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(next() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };
  return r;
}

/* ------------------------------------------------------------ PALETTE -- */
// A warm "porcelain miniature" palette. Use these hex values for vertex colours.
export const C = {
  ivory: '#efe4cf',
  plaster: '#f3e9d8',
  sand: '#dcc7a0',
  ochre: '#d3a35d',
  terracotta: '#c26a43',
  rose: '#d99a8c',
  brick: '#a8553a',
  slate: '#5d6474',
  ash: '#9a958c',
  charcoal: '#34343a',
  wood: '#8a5d3d',
  darkwood: '#4d3426',
  leaf: '#71905a',
  darkleaf: '#41613f',
  sea: '#2f6377',
  sky: '#9cc3e6',
  gold: '#e2b354',
  silver: '#cfd3d8',
  rust: '#8e4a2c',
  white: '#ffffff',
  black: '#1b1b1f',
  lamp: '#ffc477', // warm window light
};

/* ----------------------------------------------------------- MATERIALS -- */
// All builder materials use vertexColors, so a single material can paint many hues.
// The base colour of each material is white-ish; the actual hue comes from `color`.
const std = (o) => new THREE.MeshStandardMaterial({ vertexColors: true, ...o });

export const M = {
  stone: std({ roughness: 0.88, metalness: 0.0 }),
  smooth: std({ roughness: 0.45, metalness: 0.0 }), // marble, glazed tiles, porcelain
  flat: std({ roughness: 0.9, metalness: 0.0, flatShading: true }), // faceted rock / low-poly
  wood: std({ roughness: 0.8, metalness: 0.0 }),
  cloth: std({ roughness: 1.0, metalness: 0.0, side: THREE.DoubleSide }),
  metal: std({ roughness: 0.32, metalness: 0.9 }), // tint with C.gold / C.silver / bronze
  rough_metal: std({ roughness: 0.65, metalness: 0.6 }), // rusty sheet metal, iron
  water: std({ roughness: 0.32, metalness: 0.2, transparent: true, opacity: 0.85 }),
  glass: new THREE.MeshPhysicalMaterial({
    vertexColors: true, roughness: 0.05, metalness: 0.0, transparent: true, opacity: 0.28,
    clearcoat: 1, depthWrite: false, side: THREE.DoubleSide,
  }),
  // Unlit, bloom-friendly light. Vertex colour may exceed 1.0 (pass `glow` intensity).
  glow: new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }),
  // Thin lines / strings / ropes as unlit colour (not glowing unless colour > 1)
  line: new THREE.LineBasicMaterial({ vertexColors: true, toneMapped: false, transparent: true, opacity: 0.9 }),
};
M.glow.userData.noShadow = true;
M.glass.userData.noShadow = true;
M.water.userData.noShadow = true;

/** A non-vertex-colour material for animated stand-alone meshes, sharing the look. */
export function solid(color = C.ivory, o = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...o });
}
export function glowMat(color = C.lamp, intensity = 2, o = {}) {
  return new THREE.MeshBasicMaterial({
    color: new THREE.Color(color).multiplyScalar(intensity), toneMapped: false, ...o,
  });
}

/* ------------------------------------------------------------- BUILDER -- */

const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();
const _p = new THREE.Vector3();
const _s = new THREE.Vector3();
const _c = new THREE.Color();

function placement(o = {}) {
  _e.set(o.rx || 0, o.ry || 0, o.rz || 0, o.order || 'YXZ');
  _q.setFromEuler(_e);
  _p.set(o.x || 0, o.y || 0, o.z || 0);
  const s = o.s ?? 1;
  _s.set(o.sx ?? s, o.sy ?? s, o.sz ?? s);
  return _m.compose(_p, _q, _s);
}

/**
 * Accumulates many small geometries and merges them per material.
 *
 *   const b = new Builder();
 *   b.box(2, 3, 2, { x: 1, z: 2, color: C.plaster });        // bottom sits at y
 *   b.cyl(0.5, 0.5, 6, { x: -2, mat: M.smooth, color: C.ivory });
 *   const group = b.build();                                  // THREE.Group
 *
 * Common options for every shape:
 *   x, y, z      position. For box/cyl/cone/prism/dome the shape's BOTTOM sits at y.
 *                For sphere/torus/custom the origin is the centre.
 *   rx, ry, rz   rotation (radians), Euler order YXZ (yaw first)
 *   s / sx sy sz scale
 *   mat          material (default M.stone)
 *   color        hex string / number / THREE.Color (default C.ivory)
 *   glow         for M.glow: brightness multiplier (default 2.5)
 *   matrix       an extra parent THREE.Matrix4 applied after the local placement
 */
export class Builder {
  constructor() {
    this.parts = new Map(); // material -> geometry[]
    this.stack = []; // parent matrices
  }

  /** push a parent transform: everything added until pop() is relative to it */
  push(o) {
    const m = placement(o).clone();
    const top = this.stack.length ? this.stack[this.stack.length - 1] : null;
    this.stack.push(top ? top.clone().multiply(m) : m);
    return this;
  }
  pop() { this.stack.pop(); return this; }

  /** add any BufferGeometry (it is cloned). Origin of the geometry is kept. */
  geo(geometry, o = {}) {
    let g = geometry.index ? geometry.toNonIndexed() : geometry.clone();
    for (const k of Object.keys(g.attributes)) {
      if (k !== 'position' && k !== 'normal' && k !== 'uv') g.deleteAttribute(k);
    }
    if (!g.attributes.normal) g.computeVertexNormals();
    if (!g.attributes.uv) {
      g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    }
    const m = placement(o).clone();
    if (o.matrix) m.premultiply(o.matrix);
    if (this.stack.length) m.premultiply(this.stack[this.stack.length - 1]);
    g.applyMatrix4(m);
    const mat = o.mat || M.stone;
    _c.set(o.color ?? C.ivory);
    if (mat === M.glow) _c.multiplyScalar(o.glow ?? 2.5);
    const n = g.attributes.position.count;
    const col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { col[i * 3] = _c.r; col[i * 3 + 1] = _c.g; col[i * 3 + 2] = _c.b; }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    if (!this.parts.has(mat)) this.parts.set(mat, []);
    this.parts.get(mat).push(g);
    return this;
  }

  box(w, h, d, o = {}) {
    const g = new THREE.BoxGeometry(w, h, d);
    g.translate(0, h / 2, 0);
    return this.geo(g, o);
  }
  /** cylinder; rt = top radius, rb = bottom radius */
  cyl(rt, rb, h, o = {}) {
    const g = new THREE.CylinderGeometry(rt, rb, h, o.seg ?? 16, 1, o.open ?? false, o.thetaStart ?? 0, o.thetaLength ?? Math.PI * 2);
    g.translate(0, h / 2, 0);
    return this.geo(g, o);
  }
  cone(r, h, o = {}) {
    const g = new THREE.ConeGeometry(r, h, o.seg ?? 16);
    g.translate(0, h / 2, 0);
    return this.geo(g, o);
  }
  /** n-sided prism (e.g. seg 6 hexagonal tower, seg 4 pyramid when rt=0) */
  prism(rt, rb, h, seg, o = {}) { return this.cyl(rt, rb, h, { ...o, seg }); }
  sphere(r, o = {}) {
    const g = new THREE.SphereGeometry(r, o.seg ?? 16, o.hseg ?? Math.max(6, Math.round((o.seg ?? 16) * 0.66)));
    return this.geo(g, o);
  }
  /** hemisphere dome, bottom at y */
  dome(r, o = {}) {
    const g = new THREE.SphereGeometry(r, o.seg ?? 20, o.hseg ?? 10, 0, Math.PI * 2, 0, o.phi ?? Math.PI / 2);
    return this.geo(g, o);
  }
  /** onion dome, bottom at y; r = max radius */
  onion(r, h, o = {}) {
    const pts = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      const rad = r * Math.sin(Math.PI * Math.pow(t, 0.75)) * (1 - 0.15 * t) + 0.0001;
      pts.push(new THREE.Vector2(rad, t * h));
    }
    pts.push(new THREE.Vector2(0.0001, h * 1.12));
    return this.geo(new THREE.LatheGeometry(pts, o.seg ?? 16), o);
  }
  torus(R, r, o = {}) {
    const g = new THREE.TorusGeometry(R, r, o.rseg ?? 8, o.tseg ?? 32, o.arc ?? Math.PI * 2);
    return this.geo(g, o);
  }
  /** lathe from [[radius, y], ...] profile */
  lathe(profile, o = {}) {
    const pts = profile.map(([r, y]) => new THREE.Vector2(Math.max(r, 0.0001), y));
    return this.geo(new THREE.LatheGeometry(pts, o.seg ?? 20), o);
  }
  /** tube through [[x,y,z], ...] points (world/local coords), radius r */
  tube(points, r = 0.05, o = {}) {
    const v = points.map((p) => (p.isVector3 ? p : new THREE.Vector3(...p)));
    const curve = o.straight ? new THREE.CurvePath() : new THREE.CatmullRomCurve3(v, !!o.closed, 'centripetal');
    if (o.straight) for (let i = 0; i < v.length - 1; i++) curve.add(new THREE.LineCurve3(v[i], v[i + 1]));
    const g = new THREE.TubeGeometry(curve, o.tseg ?? Math.max(4, points.length * 6), r, o.rseg ?? 5, !!o.closed);
    return this.geo(g, o);
  }
  /** straight beam (box) between two points, square section `t` */
  beam(a, b, t = 0.08, o = {}) {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
    const len = A.distanceTo(B);
    const g = new THREE.BoxGeometry(t, t, len);
    const m = new THREE.Matrix4().lookAt(A, B, Math.abs(B.x - A.x) + Math.abs(B.z - A.z) < 1e-6 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0));
    m.setPosition(A.clone().add(B).multiplyScalar(0.5));
    g.applyMatrix4(m);
    return this.geo(g, o);
  }
  /** round rod between two points */
  rod(a, b, r = 0.04, o = {}) {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
    const len = A.distanceTo(B);
    const g = new THREE.CylinderGeometry(r, o.r2 ?? r, len, o.seg ?? 6);
    g.rotateX(Math.PI / 2);
    const m = new THREE.Matrix4().lookAt(A, B, Math.abs(B.x - A.x) + Math.abs(B.z - A.z) < 1e-6 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0));
    m.setPosition(A.clone().add(B).multiplyScalar(0.5));
    g.applyMatrix4(m);
    return this.geo(g, o);
  }
  /** flat shape extruded upward from y. shape = [[x,z], ...] polygon (CCW seen from above) */
  slab(shape, h, o = {}) {
    const s = new THREE.Shape(shape.map(([x, z]) => new THREE.Vector2(x, -z)));
    const g = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false, curveSegments: o.curveSegments ?? 8 });
    g.rotateX(-Math.PI / 2);
    return this.geo(g, o);
  }
  /** a flat horizontal quad / disc helpers */
  plane(w, d, o = {}) {
    const g = new THREE.PlaneGeometry(w, d);
    g.rotateX(-Math.PI / 2);
    return this.geo(g, o);
  }
  disc(r, o = {}) {
    const g = new THREE.CircleGeometry(r, o.seg ?? 32);
    g.rotateX(-Math.PI / 2);
    return this.geo(g, o);
  }
  ring(r1, r2, o = {}) {
    const g = new THREE.RingGeometry(r1, r2, o.seg ?? 32);
    g.rotateX(-Math.PI / 2);
    return this.geo(g, o);
  }
  /** vertical quad facing +z (e.g. a sign, a window), centre at position */
  quad(w, h, o = {}) { return this.geo(new THREE.PlaneGeometry(w, h), o); }

  isEmpty() { return this.parts.size === 0; }

  /** merge everything into a Group of meshes (one per material). */
  build({ shadows = true } = {}) {
    const group = new THREE.Group();
    for (const [mat, list] of this.parts) {
      if (!list.length) continue;
      const merged = mergeGeometries(list, false);
      list.forEach((g) => g.dispose());
      merged.computeBoundingSphere();
      const mesh = new THREE.Mesh(merged, mat);
      if (shadows && !mat.userData.noShadow) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
      group.add(mesh);
    }
    this.parts.clear();
    return group;
  }
}

/* -------------------------------------------------------- LINE BUILDER -- */
/** For strings, ropes, wires, constellation lines: accumulate segments, one draw call. */
export class Lines {
  constructor() { this.pos = []; this.col = []; }
  seg(a, b, color = C.white, intensity = 1) {
    _c.set(color).multiplyScalar(intensity);
    this.pos.push(...a, ...b);
    this.col.push(_c.r, _c.g, _c.b, _c.r, _c.g, _c.b);
    return this;
  }
  /** polyline through points */
  path(points, color, intensity = 1) {
    for (let i = 0; i < points.length - 1; i++) this.seg(points[i], points[i + 1], color, intensity);
    return this;
  }
  /** a sagging catenary-ish rope between a and b */
  rope(a, b, sag = 0.3, color = C.wood, n = 8, intensity = 1) {
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      pts.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - sag * 4 * t * (1 - t), a[2] + (b[2] - a[2]) * t]);
    }
    return this.path(pts, color, intensity);
  }
  build(mat = M.line) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.col, 3));
    g.computeBoundingSphere();
    return new THREE.LineSegments(g, mat);
  }
}

/* ------------------------------------------------------ ARCHITECTURE -- */
// All helpers take the builder first and an options object. Positions are local
// to the city (y=0 is the top of the plinth; keep the city within radius ~10).

/** Small windows on the four faces of a box building. */
export function windows(b, { x = 0, y = 0, z = 0, w, d, h, ry = 0, rows, cols, lit = 0.6, r = Math.random, color = C.lamp, dark = C.charcoal, size = 0.22, floorH = 0.9 }) {
  const nRows = rows ?? Math.max(1, Math.floor((h - 0.3) / floorH));
  b.push({ x, y, z, ry });
  for (let face = 0; face < 4; face++) {
    const along = face % 2 === 0 ? w : d;
    const off = (face % 2 === 0 ? d : w) / 2 + 0.012;
    const nCols = cols ?? Math.max(1, Math.floor(along / 0.7));
    const ang = face * Math.PI / 2;
    for (let i = 0; i < nCols; i++) {
      for (let j = 0; j < nRows; j++) {
        const u = (i + 0.5) / nCols * along - along / 2;
        const v = 0.45 + j * ((h - 0.6) / Math.max(1, nRows)) + 0.1;
        if (v + size > h - 0.1) continue;
        const isLit = r() < lit;
        const px = Math.sin(ang) * off + Math.cos(ang) * u;
        const pz = Math.cos(ang) * off - Math.sin(ang) * u;
        b.quad(size, size * 1.35, {
          x: px, y: v + size * 0.6, z: pz, ry: ang,
          mat: isLit ? M.glow : M.smooth, color: isLit ? color : dark, glow: 1.6 + r() * 1.4,
        });
      }
    }
  }
  b.pop();
}

/**
 * A house: box body + roof. roof: 'gable' | 'hip' | 'flat' | 'dome' | 'cone' | 'none' | 'shed'
 */
export function house(b, { x = 0, y = 0, z = 0, w = 1.2, d = 1.2, h = 1.4, ry = 0, roof = 'gable', wall = C.plaster, roofColor = C.terracotta, roofH, win = true, lit = 0.5, r = Math.random, mat = M.stone }) {
  b.push({ x, y, z, ry });
  b.box(w, h, d, { mat, color: wall });
  const rh = roofH ?? Math.min(w, d) * 0.55;
  if (roof === 'gable') {
    b.geo(GABLE, { y: h, sx: w + 0.14, sy: rh, sz: d + 0.14, mat: M.flat, color: roofColor });
  } else if (roof === 'hip') {
    b.geo(new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1).rotateY(Math.PI / 4).translate(0, 0.5, 0), { y: h, sx: w + 0.12, sz: d + 0.12, sy: rh, color: roofColor, mat: M.flat });
  } else if (roof === 'flat') {
    b.box(w + 0.08, 0.1, d + 0.08, { y: h, color: wall });
  } else if (roof === 'dome') {
    b.dome(Math.min(w, d) * 0.48, { y: h, color: roofColor, mat: M.smooth });
  } else if (roof === 'cone') {
    b.cone(Math.min(w, d) * 0.72, rh * 1.6, { y: h, color: roofColor, seg: 8, mat: M.flat });
  } else if (roof === 'shed') {
    b.box(w + 0.1, 0.08, d + 0.2, { y: h, rx: 0.18, color: roofColor });
  }
  b.pop();
  if (win && h > 0.8) windows(b, { x, y, z, w, d, h, ry, lit, r });
}

const GABLE = (() => {
  const s = new THREE.Shape([new THREE.Vector2(-0.5, 0), new THREE.Vector2(0.5, 0), new THREE.Vector2(0, 1)]);
  const g = new THREE.ExtrudeGeometry(s, { depth: 1, bevelEnabled: false });
  g.translate(0, 0, -0.5);
  return g;
})();

/** A round tower with a cap: 'cone' | 'dome' | 'onion' | 'crenel' | 'flat' | 'spire' */
export function tower(b, { x = 0, y = 0, z = 0, r = 0.6, h = 5, cap = 'cone', wall = C.ivory, capColor = C.terracotta, seg = 12, capH, mat = M.stone, lit = 0.4, rand = Math.random }) {
  b.cyl(r, r * 1.08, h, { x, y, z, seg, color: wall, mat });
  const top = y + h;
  const ch = capH ?? r * 2.2;
  if (cap === 'cone') b.cone(r * 1.25, ch, { x, y: top, z, seg, color: capColor, mat: M.flat });
  else if (cap === 'spire') b.cone(r * 0.9, ch * 2.2, { x, y: top, z, seg, color: capColor, mat: M.flat });
  else if (cap === 'dome') b.dome(r * 1.02, { x, y: top, z, color: capColor, mat: M.smooth });
  else if (cap === 'onion') b.onion(r * 1.25, ch, { x, y: top, z, color: capColor, mat: M.smooth });
  else if (cap === 'crenel') {
    b.cyl(r * 1.18, r * 1.0, 0.25, { x, y: top - 0.05, z, seg, color: wall, mat });
    const n = Math.max(6, Math.round(r * 10));
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      b.box(0.14, 0.22, 0.14, { x: x + Math.cos(a) * r * 1.1, y: top + 0.2, z: z + Math.sin(a) * r * 1.1, ry: -a, color: wall, mat });
    }
  } else if (cap === 'flat') b.cyl(r * 1.1, r * 1.1, 0.12, { x, y: top, z, seg, color: wall, mat });
  // a few slit windows
  const n = Math.floor(h / 1.2);
  for (let i = 0; i < n; i++) {
    const a = rand() * Math.PI * 2;
    const lit_ = rand() < lit;
    b.quad(0.12, 0.3, { x: x + Math.cos(a) * (r + 0.01), y: y + 0.8 + i * 1.2, z: z + Math.sin(a) * (r + 0.01), ry: Math.PI / 2 - a, mat: lit_ ? M.glow : M.smooth, color: lit_ ? C.lamp : C.charcoal });
  }
}

/** A circular city wall with optional towers and a gate gap (angles in radians). */
export function wallRing(b, { x = 0, z = 0, r = 9, h = 1.2, t = 0.35, seg = 48, towers = 8, gate = null, gateWidth = 0.35, color = C.sand, towerCap = 'crenel', mat = M.stone }) {
  for (let i = 0; i < seg; i++) {
    const a0 = (i / seg) * Math.PI * 2, a1 = ((i + 1) / seg) * Math.PI * 2;
    const am = (a0 + a1) / 2;
    if (gate !== null) {
      let dd = Math.abs(((am - gate + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
      if (dd < gateWidth) continue;
    }
    const len = 2 * r * Math.sin(Math.PI / seg) + 0.02;
    b.box(len, h, t, { x: x + Math.cos(am) * r, z: z + Math.sin(am) * r, ry: -am + Math.PI / 2, color, mat });
    if (i % 2 === 0) b.box(len * 0.4, 0.18, t, { x: x + Math.cos(am) * r, y: h, z: z + Math.sin(am) * r, ry: -am + Math.PI / 2, color, mat });
  }
  for (let i = 0; i < towers; i++) {
    const a = (i / towers) * Math.PI * 2 + (gate ?? 0) + Math.PI / towers;
    tower(b, { x: x + Math.cos(a) * r, z: z + Math.sin(a) * r, r: t * 1.4, h: h * 1.6, cap: towerCap, wall: color, lit: 0 });
  }
}

/** Straight flight of stairs, climbing along +z (before ry). */
export function stairs(b, { x = 0, y = 0, z = 0, w = 1, steps = 8, rise = 0.15, run = 0.25, ry = 0, color = C.ivory, mat = M.stone }) {
  b.push({ x, y, z, ry });
  for (let i = 0; i < steps; i++) b.box(w, rise * (i + 1), run, { z: i * run, color, mat });
  b.pop();
}

/** Spiral stair winding around a central column. */
export function spiralStair(b, { x = 0, y = 0, z = 0, r = 1, h = 4, turns = 1.5, steps = 30, w = 0.5, color = C.ivory, column = true }) {
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    const a = t * turns * Math.PI * 2;
    b.box(w, 0.06, 0.28, { x: x + Math.cos(a) * r, y: y + t * h, z: z + Math.sin(a) * r, ry: -a, color });
  }
  if (column) b.cyl(r * 0.25, r * 0.25, h, { x, y, z, color, seg: 10 });
}

/** A round arch / gateway facing z (before ry). */
export function arch(b, { x = 0, y = 0, z = 0, w = 1.6, h = 2, t = 0.3, depth = 0.4, ry = 0, color = C.ivory, mat = M.stone }) {
  b.push({ x, y, z, ry });
  const span = w - t * 2;
  b.box(t, h, depth, { x: -w / 2 + t / 2, color, mat });
  b.box(t, h, depth, { x: w / 2 - t / 2, color, mat });
  const g = new THREE.TorusGeometry(span / 2 + t / 2, t / 2, 6, 14, Math.PI);
  b.geo(g, { y: h, sz: depth / t, color, mat });
  b.pop();
}

/** Classical column with base and capital */
export function column(b, { x = 0, y = 0, z = 0, r = 0.18, h = 2.4, color = C.ivory, mat = M.smooth }) {
  b.box(r * 2.6, 0.12, r * 2.6, { x, y, z, color, mat });
  b.cyl(r * 0.9, r, h - 0.24, { x, y: y + 0.12, z, color, mat, seg: 12 });
  b.box(r * 2.6, 0.12, r * 2.6, { x, y: y + h - 0.12, z, color, mat });
}

/** Arched bridge between two points (y = deck height at ends) */
export function bridge(b, { from, to, w = 0.8, rise = 0.6, color = C.ivory, mat = M.stone, rails = true, segments = 10 }) {
  const A = new THREE.Vector3(...from), B = new THREE.Vector3(...to);
  const pts = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const p = A.clone().lerp(B, t);
    p.y += Math.sin(Math.PI * t) * rise;
    pts.push(p);
  }
  for (let i = 0; i < segments; i++) {
    const p = pts[i], q = pts[i + 1];
    const len = p.distanceTo(q);
    const g = new THREE.BoxGeometry(w, 0.12, len + 0.03);
    const m = new THREE.Matrix4().lookAt(p, q, new THREE.Vector3(0, 1, 0));
    m.setPosition(p.clone().add(q).multiplyScalar(0.5));
    g.applyMatrix4(m);
    b.geo(g, { color, mat });
    if (rails) {
      const side = new THREE.Vector3().subVectors(q, p).cross(new THREE.Vector3(0, 1, 0)).normalize().multiplyScalar(w / 2);
      for (const sgn of [-1, 1]) {
        const gp = new THREE.BoxGeometry(0.05, 0.22, len + 0.03);
        const m2 = new THREE.Matrix4().lookAt(p, q, new THREE.Vector3(0, 1, 0));
        m2.setPosition(p.clone().add(q).multiplyScalar(0.5).addScaledVector(side, sgn).add(new THREE.Vector3(0, 0.15, 0)));
        gp.applyMatrix4(m2);
        b.geo(gp, { color, mat });
      }
    }
  }
}

/** Trees: 'cypress' | 'round' | 'palm' | 'pine' | 'bare' */
export function tree(b, { x = 0, y = 0, z = 0, h = 1.6, kind = 'round', color = C.leaf, trunk = C.wood, r = Math.random }) {
  if (kind === 'cypress') {
    b.cyl(0.05, 0.06, h * 0.2, { x, y, z, color: trunk, seg: 5 });
    b.geo(new THREE.SphereGeometry(1, 8, 6), { x, y: y + h * 0.58, z, sx: h * 0.14, sz: h * 0.14, sy: h * 0.42, color: C.darkleaf, mat: M.flat });
  } else if (kind === 'pine') {
    b.cyl(0.05, 0.07, h * 0.3, { x, y, z, color: trunk, seg: 5 });
    for (let i = 0; i < 3; i++) b.cone(h * (0.32 - i * 0.07), h * 0.4, { x, y: y + h * (0.22 + i * 0.22), z, color: C.darkleaf, seg: 7, mat: M.flat });
  } else if (kind === 'palm') {
    const lean = r() * 0.3;
    const top = [x + lean * h * 0.3, y + h, z];
    b.rod([x, y, z], top, 0.05, { color: trunk, r2: 0.07 });
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + r();
      b.box(0.16, 0.02, h * 0.42, { x: top[0] + Math.cos(a) * h * 0.18, y: top[1] - 0.08, z: top[2] + Math.sin(a) * h * 0.18, ry: Math.PI / 2 - a, rx: 0.35, color, mat: M.flat });
    }
  } else if (kind === 'bare') {
    b.rod([x, y, z], [x, y + h * 0.6, z], 0.04, { color: trunk, r2: 0.06 });
    for (let i = 0; i < 5; i++) {
      const a = r() * Math.PI * 2;
      b.rod([x, y + h * (0.35 + r() * 0.25), z], [x + Math.cos(a) * h * 0.3, y + h * (0.7 + r() * 0.3), z + Math.sin(a) * h * 0.3], 0.02, { color: trunk });
    }
  } else {
    b.cyl(0.05, 0.07, h * 0.45, { x, y, z, color: trunk, seg: 5 });
    b.geo(new THREE.IcosahedronGeometry(h * 0.32, 0), { x, y: y + h * 0.62, z, color, mat: M.flat, ry: r() * 6 });
  }
}

/** Tiny human figure (≈0.35 tall at h=0.35). Cone robe + sphere head. */
export function person(b, { x = 0, y = 0, z = 0, h = 0.35, color = C.terracotta, skin = '#d7b08c', ry = 0 }) {
  b.cone(h * 0.22, h * 0.72, { x, y, z, color, seg: 6, ry });
  b.sphere(h * 0.13, { x, y: y + h * 0.82, z, color: skin, seg: 6 });
}

/** A flag/banner pole with cloth */
export function flag(b, { x = 0, y = 0, z = 0, h = 1.2, color = C.terracotta, ry = 0 }) {
  b.cyl(0.02, 0.02, h, { x, y, z, color: C.darkwood, seg: 4 });
  b.box(0.4, 0.25, 0.01, { x: x + Math.cos(ry) * 0.2, y: y + h - 0.27, z: z - Math.sin(ry) * 0.2, ry, color, mat: M.cloth });
}

/** Simple boat hull with optional mast */
export function boat(b, { x = 0, y = 0, z = 0, len = 1.2, ry = 0, color = C.wood, sail = C.plaster, mast = true }) {
  b.push({ x, y, z, ry });
  const g = new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
  b.geo(g, { sx: len * 0.22, sy: len * 0.18, sz: len * 0.5, y: len * 0.14, color, mat: M.wood });
  if (mast) {
    b.cyl(0.02, 0.02, len, { y: 0.1, color: C.darkwood, seg: 4 });
    b.geo(new THREE.PlaneGeometry(len * 0.5, len * 0.6), { y: len * 0.55, x: 0.01, ry: Math.PI / 2, color: sail, mat: M.cloth });
  }
  b.pop();
}

/**
 * Scatter non-overlapping building footprints within an annulus / custom test.
 * Returns [{x, z, w, d, ry}, ...]. Use `inside(x,z)` to restrict the region.
 */
export function scatter(r, { count = 60, rMin = 0, rMax = 9, size = [0.8, 1.6], gap = 0.25, inside = null, tries = 4000, align = 'radial' }) {
  const out = [];
  for (let t = 0; t < tries && out.length < count; t++) {
    const [x, z] = r.inDisc(rMax, rMin);
    if (inside && !inside(x, z)) continue;
    const w = r.range(size[0], size[1]);
    const d = r.range(size[0], size[1]);
    const rad = Math.max(w, d) * 0.62;
    let ok = true;
    for (const o of out) {
      if (Math.hypot(o.x - x, o.z - z) < rad + o.rad + gap) { ok = false; break; }
    }
    if (!ok) continue;
    const ry = align === 'radial' ? -Math.atan2(z, x) : align === 'grid' ? 0 : r.range(0, Math.PI);
    out.push({ x, z, w, d, ry, rad });
  }
  return out;
}

/** Ground disc / terrain for the city top (y from 0 to h). */
export function groundDisc(b, { r = 10, h = 0.08, color = C.sand, y = 0, mat = M.stone, seg = 48 }) {
  b.cyl(r, r, h, { y, color, mat, seg });
}

/** Mountain / rocky peak (faceted). */
export function rock(b, { x = 0, y = 0, z = 0, r = 2, h = 3, color = C.ash, rand = Math.random, detail = 1 }) {
  const g = new THREE.IcosahedronGeometry(1, detail);
  const p = g.attributes.position;
  const seen = new Map(); // displace shared corners identically so faces stay joined
  for (let i = 0; i < p.count; i++) {
    const key = `${p.getX(i).toFixed(3)},${p.getY(i).toFixed(3)},${p.getZ(i).toFixed(3)}`;
    if (!seen.has(key)) seen.set(key, 0.75 + rand() * 0.5);
    const k = seen.get(key);
    p.setXYZ(i, p.getX(i) * k, p.getY(i) * k, p.getZ(i) * k);
  }
  g.computeVertexNormals();
  b.geo(g, { x, y: y + h * 0.35, z, sx: r, sz: r, sy: h * 0.75, color, mat: M.flat });
}

/** Animation helper: smooth loop 0..1 */
export const ease = (t) => t * t * (3 - 2 * t);
export const lerp = (a, b, t) => a + (b - a) * t;
