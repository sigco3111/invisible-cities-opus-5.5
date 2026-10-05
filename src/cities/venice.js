// VENICE — "Every time I describe a city I am saying something about Venice."
// The city behind all the others, standing alone at the centre of the journey:
// a luminous, half-remembered Venice on a low disc of lagoon. The Grand Canal's
// reversed S, the Rialto, St Mark's domes and campanile, the Doge's Palace,
// the Salute, palazzi with Gothic windows — all in ivory and pale gold, solid at
// the heart and fading to translucence at the edges, as memory does. Gondolas
// glide along the canal; motes of gold drift up like remembered light.
import { THREE, Builder, M, C, Lines } from '../kit.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// memory materials: warm, faintly self-lit; the ghost one is translucent
const MEM = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6, metalness: 0, emissive: '#5a4526', emissiveIntensity: 0.32 });
const MEMR = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.7, metalness: 0, flatShading: true, emissive: '#4a3018', emissiveIntensity: 0.25 });
const GHOST = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.5, metalness: 0, transparent: true, opacity: 0.38, depthWrite: false, emissive: '#6a5530', emissiveIntensity: 0.55 });
GHOST.userData.noShadow = true;
const GILT = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.32, metalness: 0.75, emissive: '#5a400e', emissiveIntensity: 0.5 });
const LAGOON = new THREE.MeshStandardMaterial({ color: '#a6b8ab', roughness: 0.42, metalness: 0.08, emissive: '#3a3f30', emissiveIntensity: 0.45 });

const IVORY = '#f4ead6';
const ROSE = '#f1d8cb';
const PALEO = '#efdcb4';
const ROOF = '#e2b49c';
const GOLD = '#e9c46e';

/* ------------------------------------------------------------ GEOGRAPHY -- */
const CANAL = [
  [-18.5, -0.5], [-14, -3.2], [-9.5, -5.2], [-5, -4.6], [-2.2, -1.2], [-3.4, 2.6], [-0.5, 5.6], [3.8, 5.8], [7.2, 5.4], [10.4, 6.6], [14, 8.2], [18, 9.5],
];
const canalCurve = new THREE.CatmullRomCurve3(CANAL.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, 'centripetal');
const CANAL_PTS = canalCurve.getSpacedPoints(260);
const CW = 1.0; // half-width of the Grand Canal

function canalDist(x, z) {
  let best = 1e9, bi = 0;
  for (let i = 0; i < CANAL_PTS.length; i++) {
    const p = CANAL_PTS[i];
    const d = (p.x - x) ** 2 + (p.z - z) ** 2;
    if (d < best) { best = d; bi = i; }
  }
  return [Math.sqrt(best), bi];
}

function onMain(x, z) {
  const a = Math.atan2(z - 1, x);
  const k = 1 + 0.07 * Math.sin(3 * a + 0.4) + 0.05 * Math.sin(5 * a + 1.3);
  return (x / (16.5 * k)) ** 2 + ((z - 1) / (9.6 * k)) ** 2 < 1;
}
const onGiudecca = (x, z) => ((x + 2) / 9.5) ** 2 + ((z - 13.2) / 1.25) ** 2 < 1;
const onGiorgio = (x, z) => Math.hypot(x - 15.8, z - 13.6) < 2.1;

// landmark footprints kept clear of ordinary houses
const PIAZZA = (x, z) => x > 6.8 && x < 12.6 && z > 0.6 && z < 3.2; // the long piazza
const PIAZZETTA = (x, z) => x > 10.6 && x < 12.6 && z > 2.6 && z < 6.0;
const CLEAR = [
  [13.9, 1.9, 2.0], // basilica
  [13.6, 4.8, 1.9], // doge's palace
  [8.9, 8.1, 2.0], // salute
  [-2.2, -1.2, 1.4], // rialto
];

/* --------------------------------------------------------------- PIECES -- */

function gothicFacade(b, { w, h, floors, mat, lit, rng }) {
  // a palazzo face in local space (facing +z, at z = 0): Gothic windows, a loggia, balconies
  const fh = h / floors;
  for (let f = 0; f < floors; f++) {
    const y = f * fh + fh * 0.22;
    const loggia = f === Math.floor(floors / 2) && w > 1.0;
    const n = loggia ? Math.max(3, Math.round(w / 0.2)) : Math.max(2, Math.round(w / 0.32));
    const ww = loggia ? (w * 0.6) / n : 0.11;
    for (let i = 0; i < n; i++) {
      const x = loggia ? -w * 0.3 + (i + 0.5) * (w * 0.6) / n : -w / 2 + (i + 0.5) * (w / n);
      const isLit = rng() < lit;
      const wm = isLit ? M.glow : mat;
      const col = isLit ? '#ffd79a' : '#8b7a68';
      b.quad(ww * 0.8, fh * 0.42, { x, y: y + fh * 0.21, z: 0.012, mat: wm, color: col, glow: 1.3 });
      // pointed arch: a small rotated square on top
      b.quad(ww * 0.57, ww * 0.57, { x, y: y + fh * 0.42, z: 0.012, rz: Math.PI / 4, mat: wm, color: col, glow: 1.3 });
    }
    if (loggia) b.box(w * 0.66, 0.03, 0.12, { y: y - 0.02, z: 0.06, color: IVORY, mat });
  }
  // string courses
  for (let f = 1; f < floors; f++) b.box(w + 0.02, 0.025, 0.04, { y: f * fh, z: 0.01, color: '#fff6e6', mat });
  // water door
  b.quad(0.18, 0.28, { y: 0.14, z: 0.012, color: '#6d5e52', mat });
}

function campanile(b, { x, z, h, w = 0.42, mat = MEM, cap = 'pyramid' }) {
  b.box(w, h, w, { x, z, color: '#ecc9b2', mat });
  // pilaster strips
  for (const [dx, dz] of [[w / 2, 0], [-w / 2, 0], [0, w / 2], [0, -w / 2]]) b.box(dx ? 0.03 : w * 0.3, h * 0.85, dz ? 0.03 : w * 0.3, { x: x + dx, z: z + dz, color: '#f1d6c4', mat });
  b.box(w * 1.1, w * 0.9, w * 1.1, { x, z, y: h, color: IVORY, mat }); // belfry
  b.box(w * 0.7, w * 0.45, w * 1.12, { x, z, y: h + w * 0.25, mat: M.glow, color: '#ffd49a', glow: 1.0 });
  b.box(w * 1.12, w * 0.45, w * 0.7, { x, z, y: h + w * 0.25, mat: M.glow, color: '#ffd49a', glow: 1.0 });
  if (cap === 'pyramid') b.geo(new THREE.ConeGeometry(w * 0.72, w * 1.8, 4).rotateY(Math.PI / 4).translate(0, w * 0.9, 0), { x, z, y: h + w * 0.9, color: '#d7ad8c', mat: MEMR });
  else b.cone(w * 0.4, w * 1.6, { x, z, y: h + w * 0.9, color: '#d7ad8c', mat: MEMR, seg: 8 });
}

/* ----------------------------------------------------------------- BUILD -- */

export default function build({ rng, accent }) {
  const object = new THREE.Group();
  const b = new Builder();
  const lines = new Lines();

  // ── the lagoon: a low disc of pale water with a gilded rim
  const lagoon = new THREE.Mesh(new THREE.CylinderGeometry(24, 24.3, 0.18, 120), LAGOON);
  lagoon.position.y = 0.09;
  lagoon.receiveShadow = true;
  object.add(lagoon);
  b.torus(24.15, 0.07, { rx: Math.PI / 2, y: 0.18, color: GOLD, mat: GILT, tseg: 160, rseg: 6 });
  // faint tidal rings drawn on the water
  for (const r of [20.5, 22.6]) b.ring(r, r + 0.03, { y: 0.185, color: '#e8dcb8', mat: M.glow, glow: 0.4, seg: 140 });
  // bricole: mooring posts marking the channels across the lagoon
  for (let k = 0; k < 6; k++) {
    const a0 = k * (Math.PI / 3) + 0.3;
    for (let i = 0; i < 7; i++) {
      const rr = 18 + i * 0.85;
      const a = a0 + Math.sin(i * 0.7) * 0.05;
      for (let j = 0; j < 3; j++) {
        const x = Math.cos(a) * rr + (j - 1) * 0.08, z = Math.sin(a) * rr + (j % 2) * 0.07;
        b.cyl(0.035, 0.04, 0.55 - j * 0.07, { x, z, y: 0.15, color: '#8e7a62', mat: MEM, seg: 5, rz: (j - 1) * 0.1 });
      }
    }
  }

  // ── the land: a pale stone footing under every insula, drawn per cell
  const STEP = 0.78;
  const cells = [];
  for (let gx = -26; gx <= 26; gx++) {
    for (let gz = -16; gz <= 22; gz++) {
      const x = gx * STEP + rng.range(-0.08, 0.08), z = gz * STEP + rng.range(-0.08, 0.08);
      const main = onMain(x, z), giu = onGiudecca(x, z), gio = onGiorgio(x, z);
      if (!main && !giu && !gio) continue;
      const [cd, ci] = canalDist(x, z);
      if (main && cd < CW + 0.25) continue;
      // narrow rii: thin stripes of water winding through the sestieri
      const rio = Math.abs(Math.sin(x * 0.55 + Math.sin(z * 0.4) * 1.6)) < 0.085 || Math.abs(Math.sin(z * 0.62 + Math.sin(x * 0.35) * 1.3)) < 0.075;
      if (rio && main && cd > 2.2) continue;
      cells.push({ x, z, cd, ci, main, giu, gio });
    }
  }
  // the footing (fondamenta) is a raised slab per cell, merged
  for (const c of cells) b.box(STEP + 0.02, 0.32, STEP + 0.02, { x: c.x, z: c.z, y: 0.0, color: '#e6dccb', mat: MEM });

  // ── ordinary houses and palazzi
  const ghostR = 13.2; // beyond this distance the city is only half-remembered
  for (const c of cells) {
    const { x, z, cd, ci } = c;
    if (PIAZZA(x, z) || PIAZZETTA(x, z)) continue;
    if (CLEAR.some(([cx, cz, cr]) => Math.hypot(cx - x, cz - z) < cr)) continue;
    if (c.gio) continue; // San Giorgio gets its church only
    const r = Math.hypot(x, z - 2);
    const mat = r > ghostR || c.giu ? GHOST : MEM;
    const roofMat = r > ghostR || c.giu ? GHOST : MEMR;
    if (rng.chance(0.08)) {
      // a little campo: paving and a well-head
      b.cyl(0.08, 0.09, 0.12, { x, z, y: 0.32, color: IVORY, mat, seg: 8 });
      continue;
    }
    const wall = rng.pick([IVORY, ROSE, PALEO, IVORY, '#f3e2d0']);
    if (c.main && cd < CW + 1.25) {
      // a palazzo on the Grand Canal, facing the water
      const p = CANAL_PTS[ci];
      const ry = Math.atan2(p.x - x, p.z - z); // +z faces the canal
      const w = STEP * 0.98, d = STEP * 0.95;
      const floors = rng.int(3, 4);
      const h = floors * 0.48 + 0.2;
      b.push({ x, z, y: 0.32, ry });
      b.box(w, h, d, { color: wall, mat });
      b.box(w + 0.06, 0.06, d + 0.06, { y: h, color: '#fff3e0', mat });
      b.geo(new THREE.ConeGeometry(Math.SQRT1_2, 1, 4).rotateY(Math.PI / 4).translate(0, 0.5, 0), { y: h + 0.06, sx: w, sz: d, sy: 0.22, color: ROOF, mat: roofMat });
      b.push({ z: d / 2 });
      gothicFacade(b, { w, h, floors, mat, lit: mat === GHOST ? 0 : 0.3, rng });
      b.pop();
      b.pop();
      // striped mooring poles in front
      if (rng.chance(0.4) && mat === MEM) {
        for (const s of [-0.2, 0.2]) {
          const px = x + Math.sin(ry) * (d / 2 + 0.25) + Math.cos(ry) * s, pz = z + Math.cos(ry) * (d / 2 + 0.25) - Math.sin(ry) * s;
          b.cyl(0.025, 0.025, 0.7, { x: px, z: pz, y: 0.1, color: rng.pick(['#5d79a8', '#b0584a', '#3e7a62']), mat, seg: 5 });
          b.sphere(0.035, { x: px, z: pz, y: 0.82, color: GOLD, mat: GILT, seg: 6 });
        }
      }
    } else {
      const w = STEP * rng.range(0.82, 0.98), d = STEP * rng.range(0.82, 0.98);
      const h = rng.range(0.7, 1.45) * (c.giu ? 0.8 : 1);
      const ry = rng.range(-0.05, 0.05);
      b.box(w, h, d, { x, z, y: 0.32, ry, color: wall, mat });
      if (rng.chance(0.7)) {
        b.geo(new THREE.ConeGeometry(Math.SQRT1_2, 1, 4).rotateY(Math.PI / 4).translate(0, 0.5, 0), { x, z, y: 0.32 + h, ry, sx: w + 0.05, sz: d + 0.05, sy: 0.2, color: ROOF, mat: roofMat });
      } else {
        b.box(w + 0.04, 0.04, d + 0.04, { x, z, y: 0.32 + h, ry, color: '#fff3e0', mat });
        // an altana: the wooden roof terrace
        if (mat === MEM && rng.chance(0.5)) {
          b.box(w * 0.5, 0.02, d * 0.5, { x, z, y: 0.32 + h + 0.18, color: '#c9a77e', mat });
          for (const [ox, oz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) b.cyl(0.012, 0.012, 0.18, { x: x + ox * w * 0.22, z: z + oz * d * 0.22, y: 0.32 + h, color: '#c9a77e', mat, seg: 3 });
        }
      }
      // Venetian funnel chimneys
      if (rng.chance(0.45)) {
        const cx = x + rng.range(-w * 0.3, w * 0.3), cz = z + rng.range(-d * 0.3, d * 0.3);
        b.cyl(0.035, 0.035, 0.25, { x: cx, z: cz, y: 0.32 + h + 0.05, color: '#e8cdb6', mat, seg: 6 });
        b.cyl(0.08, 0.03, 0.12, { x: cx, z: cz, y: 0.32 + h + 0.3, color: '#e8cdb6', mat, seg: 8 });
      }
      // a few lit windows
      if (mat === MEM && rng.chance(0.35)) {
        const face = rng.int(0, 3), ang = face * Math.PI / 2 + ry;
        const off = (face % 2 === 0 ? d : w) / 2 + 0.012;
        b.quad(0.09, 0.15, { x: x + Math.sin(ang) * off, y: 0.32 + h * rng.range(0.35, 0.7), z: z + Math.cos(ang) * off, ry: ang, mat: M.glow, color: '#ffd79a', glow: 1.5 });
      }
    }
  }

  // ── PIAZZA SAN MARCO: paving with the white bands, the Procuratie arcades
  b.box(5.8, 0.34, 2.6, { x: 9.7, z: 1.9, color: '#ebe1cf', mat: MEM });
  b.box(2.0, 0.34, 3.4, { x: 11.6, z: 4.3, color: '#ebe1cf', mat: MEM });
  for (let i = 0; i < 9; i++) b.box(0.04, 0.005, 2.5, { x: 7.1 + i * 0.6, z: 1.9, y: 0.34, color: '#fffaf0', mat: MEM });
  for (const [z0, sgn] of [[0.45, 1], [3.35, -1]]) {
    const len = 5.6;
    b.box(len, 1.25, 0.6, { x: 9.6, z: z0, y: 0.32, color: IVORY, mat: MEM });
    b.box(len + 0.05, 0.05, 0.66, { x: 9.6, z: z0, y: 1.57, color: '#fff3e0', mat: MEM });
    for (let i = 0; i < 22; i++) {
      const x = 9.6 - len / 2 + (i + 0.5) * (len / 22);
      b.quad(0.14, 0.32, { x, y: 0.52, z: z0 + sgn * 0.301, ry: sgn > 0 ? 0 : Math.PI, color: '#9c8a74', mat: MEM });
      b.quad(0.1, 0.18, { x, y: 1.05, z: z0 + sgn * 0.301, ry: sgn > 0 ? 0 : Math.PI, color: i % 3 ? '#9c8a74' : '#ffd79a', mat: i % 3 ? MEM : M.glow, glow: 1.4 });
    }
  }
  // the two columns of the Piazzetta: the winged lion and St Theodore
  for (const [cx, top] of [[11.0, 'lion'], [12.2, 'saint']]) {
    b.cyl(0.13, 0.15, 2.6, { x: cx, z: 5.6, y: 0.32, color: '#e8d9c3', mat: MEM, seg: 12 });
    b.box(0.34, 0.12, 0.34, { x: cx, z: 5.6, y: 2.92, color: IVORY, mat: MEM });
    if (top === 'lion') {
      b.sphere(1, { x: cx, z: 5.6, y: 3.18, sx: 0.12, sy: 0.12, sz: 0.24, color: GOLD, mat: GILT, seg: 10 });
      for (const s of [-1, 1]) b.box(0.02, 0.18, 0.26, { x: cx + s * 0.12, z: 5.55, y: 3.15, rz: s * 0.6, color: GOLD, mat: GILT });
    } else {
      b.cone(0.08, 0.32, { x: cx, z: 5.6, y: 3.04, color: GOLD, mat: GILT, seg: 6 });
      b.sphere(0.05, { x: cx, z: 5.6, y: 3.38, color: GOLD, mat: GILT, seg: 6 });
    }
  }

  // ── THE CAMPANILE
  {
    const x = 10.6, z = 3.0;
    b.box(0.95, 10.4, 0.95, { x, z, y: 0.32, color: '#efc7ad', mat: MEM });
    for (const [dx, dz] of [[0.48, 0], [-0.48, 0], [0, 0.48], [0, -0.48]]) {
      for (const o of [-0.3, 0, 0.3]) b.box(dx ? 0.03 : 0.08, 9.6, dz ? 0.03 : 0.08, { x: x + dx + (dz ? o : 0), z: z + dz + (dx ? o : 0), y: 0.32, color: '#f6d8c2', mat: MEM });
    }
    b.box(1.08, 0.12, 1.08, { x, z, y: 10.72, color: IVORY, mat: MEM });
    // the belfry: open arches, glowing gold
    for (const [dx, dz] of [[0.42, 0.42], [-0.42, 0.42], [0.42, -0.42], [-0.42, -0.42]]) b.box(0.16, 1.15, 0.16, { x: x + dx, z: z + dz, y: 10.84, color: IVORY, mat: MEM });
    b.box(0.7, 1.0, 0.7, { x, z, y: 10.84, mat: M.glow, color: '#ffd28a', glow: 1.6 });
    b.box(1.08, 0.14, 1.08, { x, z, y: 11.99, color: IVORY, mat: MEM });
    b.box(0.86, 1.2, 0.86, { x, z, y: 12.13, color: '#efc7ad', mat: MEM });
    // the green-gold pyramid spire and the archangel
    b.geo(new THREE.ConeGeometry(0.66, 3.6, 4).rotateY(Math.PI / 4).translate(0, 1.8, 0), { x, z, y: 13.33, color: '#bccca4', mat: MEM });
    b.cyl(0.03, 0.03, 0.3, { x, z, y: 16.9, color: GOLD, mat: GILT, seg: 4 });
    b.cone(0.09, 0.34, { x, z, y: 17.15, color: GOLD, mat: GILT, seg: 6 });
    b.sphere(0.06, { x, z, y: 17.55, color: GOLD, mat: GILT, seg: 6 });
    for (const s of [-1, 1]) b.box(0.02, 0.24, 0.14, { x: x + s * 0.09, z, y: 17.35, rz: s * 0.5, color: GOLD, mat: GILT });
  }

  // ── THE BASILICA: Greek cross, five gilded domes with lanterns, a mosaic façade
  {
    const x = 13.9, z = 1.9;
    b.box(2.6, 1.7, 2.6, { x, z, y: 0.32, color: '#f2dfcc', mat: MEM });
    b.box(1.0, 1.9, 3.4, { x, z, y: 0.32, color: '#f2dfcc', mat: MEM });
    b.box(3.4, 1.9, 1.0, { x, z, y: 0.32, color: '#f2dfcc', mat: MEM });
    // west façade toward the piazza: five portals with golden lunettes
    for (let i = 0; i < 5; i++) {
      const zz = z - 1.2 + i * 0.6;
      const big = i === 2;
      b.quad(big ? 0.42 : 0.32, big ? 0.85 : 0.65, { x: x - 1.71, y: 0.32 + (big ? 0.45 : 0.35), z: zz, ry: -Math.PI / 2, color: '#7a6450', mat: MEM });
      b.geo(new THREE.CircleGeometry(big ? 0.24 : 0.18, 14, 0, Math.PI), { x: x - 1.715, y: 0.32 + (big ? 0.9 : 0.7), z: zz, ry: -Math.PI / 2, color: GOLD, mat: GILT });
      b.geo(new THREE.CircleGeometry(big ? 0.3 : 0.24, 14, 0, Math.PI), { x: x - 1.72, y: 0.32 + 1.55, z: zz, ry: -Math.PI / 2, color: big ? '#ffd27a' : '#e9c46e', mat: big ? M.glow : GILT, glow: 1.1 });
    }
    // the four bronze horses
    for (let i = 0; i < 4; i++) b.box(0.05, 0.12, 0.14, { x: x - 1.62, y: 1.3, z: z - 0.33 + i * 0.22, color: '#c79a52', mat: GILT });
    // domes on drums
    const domes = [[0, 0, 0.62], [0, -1.15, 0.5], [0, 1.15, 0.5], [-1.15, 0, 0.5], [1.15, 0, 0.5]];
    for (const [dx, dz, r] of domes) {
      b.cyl(r * 0.85, r * 0.85, 0.32, { x: x + dx, z: z + dz, y: 2.02, color: '#f2dfcc', mat: MEM, seg: 16 });
      b.lathe([[r, 0], [r * 1.02, r * 0.35], [r * 0.85, r * 0.8], [r * 0.5, r * 1.08], [0.02, r * 1.2]], { x: x + dx, z: z + dz, y: 2.34, color: '#ead7a6', mat: GILT, seg: 18 });
      b.cyl(r * 0.12, r * 0.15, r * 0.4, { x: x + dx, z: z + dz, y: 2.34 + r * 1.15, color: GOLD, mat: GILT, seg: 8 });
      b.sphere(r * 0.12, { x: x + dx, z: z + dz, y: 2.34 + r * 1.6, color: GOLD, mat: GILT, seg: 8 });
      b.cyl(0.01, 0.01, r * 0.4, { x: x + dx, z: z + dz, y: 2.34 + r * 1.65, color: GOLD, mat: GILT, seg: 3 });
    }
    // pinnacles along the façade top
    for (let i = 0; i < 7; i++) b.cone(0.07, 0.4, { x: x - 1.7, z: z - 1.5 + i * 0.5, y: 2.2, color: IVORY, mat: MEM, seg: 6 });
  }

  // ── THE DOGE'S PALACE: two tiers of arcades, the diamond-patterned rose wall above
  {
    const x = 13.6, z = 4.9, w = 3.2, d = 2.4;
    b.box(w, 2.3, d, { x, z, y: 0.32, color: '#f2d5c8', mat: MEM });
    b.box(w + 0.05, 0.06, d + 0.05, { x, z, y: 2.62, color: '#fff3e0', mat: MEM });
    for (const [face, len, ry, ox, oz] of [[0, w, 0, 0, d / 2], [1, d, -Math.PI / 2, -w / 2, 0]]) {
      const n = Math.round(len / 0.22);
      for (let i = 0; i < n; i++) {
        const u = -len / 2 + (i + 0.5) * (len / n);
        const px = x + ox + (face === 0 ? u : -0.012), pz = z + oz + (face === 0 ? 0.012 : u);
        // ground arcade
        b.quad(0.14, 0.42, { x: px, y: 0.6, z: pz, ry, color: '#8e7764', mat: MEM });
        // loggia above with smaller pointed arches
        b.quad(0.09, 0.3, { x: px, y: 1.17, z: pz, ry, color: '#8e7764', mat: MEM });
        b.quad(0.064, 0.064, { x: px, y: 1.33, z: pz, ry, rz: Math.PI / 4, color: '#8e7764', mat: MEM });
        // a few large windows in the rose wall
        if (i % 4 === 1) b.quad(0.18, 0.36, { x: px, y: 1.95, z: pz, ry, color: i % 8 === 1 ? '#ffd79a' : '#8e7764', mat: i % 8 === 1 ? M.glow : MEM, glow: 1.3 });
      }
      // the white crenellation
      const nc = Math.round(len / 0.16);
      for (let i = 0; i < nc; i++) {
        const u = -len / 2 + (i + 0.5) * (len / nc);
        b.cone(0.05, 0.14, { x: x + ox + (face === 0 ? u : 0), z: z + oz + (face === 0 ? 0 : u), y: 2.68, color: '#fffaf0', mat: MEM, seg: 4 });
      }
    }
  }

  // ── SANTA MARIA DELLA SALUTE: octagon, great dome, scrolls, lantern
  {
    const x = 8.9, z = 8.1;
    b.cyl(1.55, 1.6, 2.2, { x, z, y: 0.32, color: IVORY, mat: MEM, seg: 8 });
    // volutes
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      b.geo(new THREE.TorusGeometry(0.22, 0.08, 6, 10, Math.PI * 1.2), { x: x + Math.cos(a) * 1.25, z: z + Math.sin(a) * 1.25, y: 2.65, ry: -a, color: '#fff8ea', mat: MEM });
      b.sphere(0.06, { x: x + Math.cos(a) * 1.6, z: z + Math.sin(a) * 1.6, y: 2.62, color: IVORY, mat: MEM, seg: 6 });
    }
    b.cyl(1.15, 1.2, 0.9, { x, z, y: 2.52, color: IVORY, mat: MEM, seg: 16 });
    b.lathe([[1.22, 0], [1.2, 0.5], [1.0, 1.15], [0.6, 1.6], [0.2, 1.75], [0.02, 1.76]], { x, z, y: 3.42, color: '#f0e3cc', mat: MEM, seg: 28 });
    b.cyl(0.28, 0.32, 0.55, { x, z, y: 5.15, color: IVORY, mat: MEM, seg: 10 });
    b.lathe([[0.3, 0], [0.26, 0.2], [0.12, 0.38], [0.02, 0.42]], { x, z, y: 5.7, color: '#f0e3cc', mat: MEM, seg: 12 });
    b.cyl(0.02, 0.02, 0.4, { x, z, y: 6.1, color: GOLD, mat: GILT, seg: 4 });
    b.sphere(0.07, { x, z, y: 6.5, color: GOLD, mat: GILT, seg: 6 });
    // the steps to the water
    for (let i = 0; i < 4; i++) b.box(1.4 - i * 0.15, 0.08 * (i + 1), 0.25, { x: x - 0.3, z: z - 1.65 - (3 - i) * 0.12, y: 0.1, ry: 0.4, color: '#fff6e8', mat: MEM });
    // small campanili behind
    b.box(0.32, 3.2, 0.32, { x: x + 1.4, z: z + 1.2, y: 0.32, color: IVORY, mat: MEM });
    b.cone(0.25, 0.5, { x: x + 1.4, z: z + 1.2, y: 3.52, color: '#f0e3cc', mat: MEM, seg: 8 });
    // the Punta della Dogana with its golden globe
    b.box(1.1, 0.7, 0.8, { x: x + 2.5, z: z - 0.6, y: 0.32, color: IVORY, mat: MEM });
    b.sphere(0.22, { x: x + 3.0, z: z - 0.6, y: 1.25, color: GOLD, mat: GILT, seg: 12 });
  }

  // ── SAN GIORGIO MAGGIORE on its island across the basin
  {
    const x = 15.8, z = 13.6;
    b.box(2.4, 1.5, 1.1, { x, z, y: 0.32, color: IVORY, mat: MEM });
    b.geo(new THREE.CylinderGeometry(0, 0.75, 0.6, 3).rotateY(Math.PI / 2).scale(1, 1, 0.3), { x: x - 1.2, z, y: 2.1, ry: Math.PI / 2, color: '#fff8ea', mat: MEM });
    b.cyl(0.55, 0.6, 0.6, { x: x + 0.3, z, y: 1.82, color: IVORY, mat: MEM, seg: 14 });
    b.dome(0.58, { x: x + 0.3, z, y: 2.42, color: '#efe3cc', mat: MEM, seg: 18 });
    b.sphere(0.06, { x: x + 0.3, z, y: 3.05, color: GOLD, mat: GILT, seg: 6 });
    for (let i = 0; i < 4; i++) b.cyl(0.05, 0.05, 1.2, { x: x - 1.21, z: z - 0.45 + i * 0.3, y: 0.32, color: '#fff8ea', mat: MEM, seg: 8 });
    campanile(b, { x: x + 1.5, z: z + 0.7, h: 4.6, w: 0.42, cap: 'cone' });
  }

  // ── other campanili rising over the sestieri
  for (const [x, z, h] of [[-6.5, -1.5, 4.8], [-10, 3.2, 4.2], [-1.0, -6.5, 5.2], [3.8, 1.3, 4.4], [-13.5, -2.5, 3.6], [4.5, -5.5, 3.9], [-4.5, 9.8, 3.6]]) {
    const r = Math.hypot(x, z - 2);
    if (!onMain(x, z) && !onGiudecca(x, z)) continue;
    campanile(b, { x, z, h, mat: r > ghostR || onGiudecca(x, z) ? GHOST : MEM, cap: rng.chance(0.5) ? 'pyramid' : 'cone' });
  }
  // the Redentore on the Giudecca, ghostly
  b.cyl(0.55, 0.6, 1.2, { x: -3.5, z: 13.2, y: 0.32, color: IVORY, mat: GHOST, seg: 14 });
  b.dome(0.6, { x: -3.5, z: 13.2, y: 1.52, color: IVORY, mat: GHOST, seg: 16 });

  // ── THE RIALTO BRIDGE: single stone arch carrying two rows of shops and a central arch
  {
    const p = canalCurve.getPointAt(0.42);
    const tan = canalCurve.getTangentAt(0.42);
    const ry = Math.atan2(tan.x, tan.z) + Math.PI / 2; // bridge spans across the canal
    b.push({ x: p.x, z: p.z, y: 0.18, ry });
    const span = 2.6;
    // the arch (deck follows a shallow curve)
    for (let i = 0; i < 12; i++) {
      const t0 = i / 12, t1 = (i + 1) / 12;
      const z0 = -span / 2 + t0 * span, z1 = -span / 2 + t1 * span;
      const y0 = Math.sin(Math.PI * t0) * 0.75, y1 = Math.sin(Math.PI * t1) * 0.75;
      for (const ox of [-0.33, -0.11, 0.11, 0.33]) b.beam([ox, y0 + 0.12, z0], [ox, y1 + 0.12, z1], 0.24, { color: '#f6ecda', mat: MEM });
      b.beam([-0.45, y0 + 0.02, z0], [-0.45, y1 + 0.02, z1], 0.08, { color: '#fff8ea', mat: MEM });
      b.beam([0.45, y0 + 0.02, z0], [0.45, y1 + 0.02, z1], 0.08, { color: '#fff8ea', mat: MEM });
    }
    // two rows of shop arcades rising up the slope, and the central portico
    for (const s of [-1, 1]) {
      for (let i = 0; i < 6; i++) {
        const t = (i + 0.5) / 6;
        if (Math.abs(t - 0.5) < 0.1) continue;
        const zz = -span / 2 + t * span;
        const yy = Math.sin(Math.PI * t) * 0.75 + 0.24;
        b.box(0.22, 0.3, span / 6 - 0.02, { x: s * 0.28, z: zz, y: yy, color: '#f1e3cc', mat: MEM });
        b.box(0.26, 0.04, span / 6 + 0.02, { x: s * 0.28, z: zz, y: yy + 0.3, rx: 0, color: ROOF, mat: MEMR });
        b.quad(0.1, 0.16, { x: s * 0.395, z: zz, y: yy + 0.13, ry: s * Math.PI / 2, color: i % 2 ? '#ffd79a' : '#8e7764', mat: i % 2 ? M.glow : MEM, glow: 1.3 });
      }
    }
    b.box(0.7, 0.55, 0.32, { y: 0.99, color: '#fff3e0', mat: MEM });
    b.geo(new THREE.CylinderGeometry(0, 0.5, 0.28, 3).rotateZ(Math.PI / 2).rotateY(Math.PI / 2).scale(1.4, 1, 0.66), { y: 1.68, color: ROOF, mat: MEMR });
    b.pop();
  }

  // ── the outer lagoon: islands half-remembered, salt marshes, the Lido
  const islet = (cx, cz, rx, rz, { pastel = false, rot = 0, tower = false, density = 0.85 } = {}) => {
    const c = Math.cos(rot), sn = Math.sin(rot);
    for (let gx = -12; gx <= 12; gx++) {
      for (let gz = -12; gz <= 12; gz++) {
        const lx = gx * 0.62, lz = gz * 0.62;
        if ((lx / rx) ** 2 + (lz / rz) ** 2 > 1) continue;
        const x = cx + lx * c - lz * sn, z = cz + lx * sn + lz * c;
        b.box(0.64, 0.26, 0.64, { x, z, ry: -rot, color: '#e6dccb', mat: GHOST });
        if (!rng.chance(density)) continue;
        const h = rng.range(0.4, 0.9);
        const col = pastel ? rng.pick(['#f2a7a0', '#9fc6e8', '#f4d77a', '#b7dba0', '#e8b0d8', '#f6c18f']) : rng.pick([IVORY, ROSE, PALEO]);
        b.box(0.5, h, 0.5, { x, z, y: 0.26, ry: -rot, color: col, mat: GHOST });
        b.geo(new THREE.ConeGeometry(Math.SQRT1_2, 1, 4).rotateY(Math.PI / 4).translate(0, 0.5, 0), { x, z, y: 0.26 + h, ry: -rot, sx: 0.54, sz: 0.54, sy: 0.16, color: ROOF, mat: GHOST });
      }
    }
    if (tower) campanile(b, { x: cx + 0.3, z: cz - 0.2, h: 3.4, w: 0.36, mat: GHOST, cap: pastel ? 'cone' : 'pyramid' });
  };
  islet(-5.5, -15.2, 3.0, 1.5, { rot: 0.25, tower: true }); // Murano
  islet(-14.5, -13.0, 1.8, 1.3, { pastel: true, rot: -0.3, tower: true }); // Burano
  islet(-17.5, -9.5, 1.1, 0.9, { pastel: true, density: 0.5 }); // Mazzorbo
  islet(12.5, -10.5, 1.2, 0.8, { rot: 0.6, density: 0.6 });
  // San Michele: the walled island of the dead, with cypresses
  {
    const x = 2.2, z = -12.4;
    b.box(2.6, 0.3, 2.0, { x, z, ry: 0.15, color: '#e6dccb', mat: MEM });
    for (const [ox, oz, w, d] of [[0, 1.0, 2.6, 0.08], [0, -1.0, 2.6, 0.08], [1.3, 0, 0.08, 2.0], [-1.3, 0, 0.08, 2.0]]) b.box(w, 0.35, d, { x: x + ox, z: z + oz, y: 0.3, ry: 0.15, color: '#f0d9c8', mat: MEM });
    for (let i = 0; i < 18; i++) {
      const ox = rng.range(-1.1, 1.1), oz = rng.range(-0.8, 0.8);
      b.geo(new THREE.SphereGeometry(1, 7, 5), { x: x + ox, z: z + oz, y: 0.55, sx: 0.09, sz: 0.09, sy: 0.32, color: '#6f8a6a', mat: MEMR });
    }
    b.box(0.6, 0.6, 0.4, { x: x - 0.8, z: z + 0.5, y: 0.3, ry: 0.15, color: IVORY, mat: MEM });
    b.dome(0.22, { x: x - 0.8, z: z + 0.5, y: 0.9, color: IVORY, mat: MEM, seg: 12 });
  }
  // the Lido: a long thin barrier island along the sea side
  for (let i = 0; i < 46; i++) {
    const a = -0.55 + i * 0.033;
    const rr = 21.2 + Math.sin(i * 0.4) * 0.25;
    const x = Math.cos(a) * rr, z = Math.sin(a) * rr;
    b.box(0.75, 0.24, 0.9, { x, z, ry: -a, color: '#e9dfc9', mat: GHOST });
    if (i % 2 === 0) b.box(0.4, rng.range(0.3, 0.7), 0.4, { x: x - Math.cos(a) * 0.15, z: z - Math.sin(a) * 0.15, y: 0.24, ry: -a, color: rng.pick([IVORY, ROSE, PALEO]), mat: GHOST });
    else b.geo(new THREE.IcosahedronGeometry(0.22, 0), { x: x + Math.cos(a) * 0.2, z: z + Math.sin(a) * 0.2, y: 0.4, color: '#a9b98e', mat: GHOST });
  }
  // barene: low salt-marsh flats in sage and straw
  for (let i = 0; i < 18; i++) {
    let x, z;
    do { [x, z] = rng.inDisc(22.5, 15.5); } while (onMain(x, z) || onGiudecca(x, z) || onGiorgio(x, z) || Math.hypot(x - 2.2, z + 12.4) < 2.5 || Math.hypot(x + 5.5, z + 15.2) < 3.8 || Math.hypot(x + 14.5, z + 13) < 2.6);
    const sh = [];
    const n = 9, R = rng.range(0.45, 1.1);
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2;
      const r2 = R * rng.range(0.6, 1.2);
      sh.push([Math.cos(a) * r2 * 1.6, Math.sin(a) * r2]);
    }
    b.slab(sh, 0.05, { x, z, y: 0.17, ry: rng.range(0, 3), color: rng.pick(['#aab79c', '#b9b896', '#a3b096']), mat: MEM });
  }

  // ── the Grand Canal remembered as a ribbon of pale light on the water
  {
    const pts = canalCurve.getSpacedPoints(180);
    const pos = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p = pts[i], q = pts[i + 1];
      const tx = q.x - p.x, tz = q.z - p.z, tl = Math.hypot(tx, tz) || 1;
      const nx = -tz / tl, nz = tx / tl;
      const w0 = 0.32 * Math.sin(Math.PI * i / (pts.length - 1)) + 0.06, w1 = 0.32 * Math.sin(Math.PI * (i + 1) / (pts.length - 1)) + 0.06;
      const A = [p.x + nx * w0, p.z + nz * w0], B = [p.x - nx * w0, p.z - nz * w0], Cq = [q.x + nx * w1, q.z + nz * w1], D = [q.x - nx * w1, q.z - nz * w1];
      pos.push(A[0], 0.19, A[1], Cq[0], 0.19, Cq[1], B[0], 0.19, B[1], B[0], 0.19, B[1], Cq[0], 0.19, Cq[1], D[0], 0.19, D[1]);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.computeVertexNormals();
    b.geo(g, { mat: M.glow, color: '#ffe6b0', glow: 0.75 });
  }

  // ── fondamenta lamps along the Grand Canal
  for (let i = 4; i < CANAL_PTS.length - 20; i += 9) {
    const p = CANAL_PTS[i], q = CANAL_PTS[i + 1];
    const nx = -(q.z - p.z), nz = q.x - p.x;
    const nl = Math.hypot(nx, nz) || 1;
    for (const s of [-1, 1]) {
      const x = p.x + (nx / nl) * (CW + 0.18) * s, z = p.z + (nz / nl) * (CW + 0.18) * s;
      if (!onMain(x, z)) continue;
      b.cyl(0.012, 0.012, 0.35, { x, z, y: 0.32, color: '#5a4a3a', mat: MEM, seg: 3 });
      b.sphere(0.04, { x, z, y: 0.7, mat: M.glow, color: '#ffd28a', glow: 2.2, seg: 6 });
    }
  }

  object.add(b.build());

  // ── GONDOLAS gliding on the Grand Canal (one instanced mesh, black lacquer)
  const gParts = [];
  {
    const hull = new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    hull.scale(0.1, 0.07, 0.5);
    hull.translate(0, 0.07, 0);
    // upturned prow and stern
    const prow = new THREE.CylinderGeometry(0.015, 0.03, 0.22, 5).rotateX(-0.6).translate(0, 0.14, 0.48);
    const ferro = new THREE.BoxGeometry(0.015, 0.1, 0.05).translate(0, 0.26, 0.56);
    const stern = new THREE.CylinderGeometry(0.012, 0.03, 0.16, 5).rotateX(0.6).translate(0, 0.12, -0.48);
    const seat = new THREE.BoxGeometry(0.12, 0.05, 0.18).translate(0, 0.09, 0.05);
    const body = new THREE.ConeGeometry(0.045, 0.2, 6).translate(0, 0.17, -0.34);
    const head = new THREE.SphereGeometry(0.03, 6, 4).translate(0, 0.3, -0.34);
    const oar = new THREE.CylinderGeometry(0.006, 0.006, 0.5, 3).rotateX(0.5).rotateZ(0.35).translate(0.06, 0.2, -0.24);
    for (const g of [hull, prow, ferro, stern, seat, body, head, oar]) {
      const n = g.index ? g.toNonIndexed() : g;
      n.deleteAttribute('uv');
      gParts.push(n);
    }
  }
  const gGeo = mergeGeometries(gParts, false);
  gGeo.computeVertexNormals();
  const NG = 11;
  const gondolas = new THREE.InstancedMesh(gGeo, new THREE.MeshStandardMaterial({ color: '#2a2630', roughness: 0.35, metalness: 0.2, emissive: '#1a1418', emissiveIntensity: 0.3 }), NG);
  gondolas.castShadow = true;
  gondolas.frustumCulled = false;
  object.add(gondolas);
  const gon = [];
  for (let i = 0; i < NG; i++) gon.push({ u0: i / NG + rng.range(-0.02, 0.02), sp: rng.range(0.0045, 0.0075) * (i % 3 === 0 ? -1 : 1), lane: (i % 3 === 0 ? -1 : 1) * rng.range(0.25, 0.45), ph: rng.range(0, 6) });

  // ── a few sailing boats crossing the lagoon (ochre sails)
  const bParts = [];
  {
    const hull = new THREE.SphereGeometry(1, 10, 5, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    hull.scale(0.22, 0.14, 0.6).translate(0, 0.12, 0);
    const mast = new THREE.CylinderGeometry(0.015, 0.015, 1.3, 4).translate(0, 0.75, 0.05);
    const sail = new THREE.PlaneGeometry(0.75, 0.85).rotateY(Math.PI / 2).translate(0.01, 0.85, -0.25);
    for (const g of [hull, mast, sail]) { const n = g.index ? g.toNonIndexed() : g; n.deleteAttribute('uv'); bParts.push(n); }
    // colour: hull dark, sail ochre → vertex colours
    const cols = [new THREE.Color('#5a4636'), new THREE.Color('#5a4636'), new THREE.Color('#e0a456')];
    bParts.forEach((g, k) => {
      const c = new Float32Array(g.attributes.position.count * 3);
      for (let i = 0; i < g.attributes.position.count; i++) { c[i * 3] = cols[k].r; c[i * 3 + 1] = cols[k].g; c[i * 3 + 2] = cols[k].b; }
      g.setAttribute('color', new THREE.BufferAttribute(c, 3));
    });
  }
  const bGeo = mergeGeometries(bParts, false);
  bGeo.computeVertexNormals();
  const NB = 5;
  const boats = new THREE.InstancedMesh(bGeo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8, side: THREE.DoubleSide, emissive: '#3a2a14', emissiveIntensity: 0.3 }), NB);
  boats.castShadow = true;
  boats.frustumCulled = false;
  object.add(boats);
  const sails = [];
  for (let i = 0; i < NB; i++) sails.push({ a0: (i / NB) * Math.PI * 2 + rng.range(0, 0.6), r: rng.range(19.0, 22.5), sp: rng.range(0.012, 0.02) * (i % 2 ? 1 : -1) });

  // ── motes of remembered light drifting up from the city
  const NM = 260;
  const mPos = new Float32Array(NM * 3);
  const motes = [];
  for (let i = 0; i < NM; i++) {
    let x, z;
    do { x = rng.range(-16, 16); z = rng.range(-9, 14); } while (!onMain(x, z) && !onGiudecca(x, z) && !onGiorgio(x, z));
    motes.push([x, z, rng(), rng.range(0.015, 0.035), rng.range(0, 6)]);
  }
  const mGeo = new THREE.BufferGeometry();
  mGeo.setAttribute('position', new THREE.BufferAttribute(mPos, 3));
  const mote = new THREE.Points(mGeo, new THREE.PointsMaterial({ color: new THREE.Color('#ffe2a0').multiplyScalar(1.6), size: 0.16, sizeAttenuation: true, transparent: true, opacity: 0.75, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  mote.frustumCulled = false;
  object.add(mote);

  const _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(1, 1, 1), _e = new THREE.Euler(), _t = new THREE.Vector3();
  const MOTE_H = 16;

  function update(t) {
    for (let i = 0; i < NG; i++) {
      const G = gon[i];
      let u = (G.u0 + t * G.sp) % 1;
      if (u < 0) u += 1;
      u = 0.02 + u * 0.9; // stay within the canal, not out in the basin
      canalCurve.getPointAt(u, _p);
      canalCurve.getTangentAt(u, _t);
      const nx = -_t.z, nz = _t.x;
      _p.x += nx * G.lane; _p.z += nz * G.lane;
      _p.y = 0.18 + Math.sin(t * 1.3 + G.ph) * 0.012;
      const heading = Math.atan2(_t.x, _t.z) + (G.sp < 0 ? Math.PI : 0);
      _e.set(Math.sin(t * 0.9 + G.ph) * 0.03, heading, Math.sin(t * 1.1 + G.ph) * 0.04);
      _q.setFromEuler(_e);
      _s.set(1.25, 1.25, 1.25);
      _m.compose(_p, _q, _s);
      gondolas.setMatrixAt(i, _m);
    }
    gondolas.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < NB; i++) {
      const S = sails[i];
      const a = S.a0 + t * S.sp;
      _p.set(Math.cos(a) * S.r, 0.1 + Math.sin(t * 0.8 + i) * 0.03, Math.sin(a) * S.r);
      _e.set(0, (S.sp > 0 ? -a : Math.PI - a), (S.sp > 0 ? 1 : -1) * 0.08);
      _q.setFromEuler(_e);
      _s.set(1, 1, 1);
      _m.compose(_p, _q, _s);
      boats.setMatrixAt(i, _m);
    }
    boats.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < NM; i++) {
      const [x, z, ph, sp, w] = motes[i];
      const y = ((ph + t * sp) % 1) * MOTE_H;
      mPos[i * 3] = x + Math.sin(t * 0.3 + w) * 0.4;
      mPos[i * 3 + 1] = 0.6 + y;
      mPos[i * 3 + 2] = z + Math.cos(t * 0.25 + w) * 0.4;
    }
    mGeo.attributes.position.needsUpdate = true;
  }
  update(0);
  return { object, update };
}
