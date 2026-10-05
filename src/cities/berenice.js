// BERENICE — just and unjust cities, wrapped one inside the other.
// A stepped tower of nested shells, cut away like a museum diagram. The unjust
// shells are iron drums of grinding cogwheels, crowned with marble colonnades and
// friezes; between them live the just ones — makeshift lattices of brass wire,
// pulleys, ladders and pistons, lit from back rooms, climbing among the gears.
// Inside each, the next: just, unjust, just… down to a seed of light.
import { THREE, Builder, M, C, Lines, column } from '../kit.js';

const CUT = 0.85; // direction (atan2(z, x)) the cutaway faces — toward the viewer
const IRON = '#5a524c';
const IRON2 = '#665c55';
const BRONZE = '#8d6a3c';
const MARBLE = '#efe8dc';
const BRASS = '#c9a25a';
const COPPER = '#b87333';

const GEARMAT = new THREE.MeshStandardMaterial({ color: '#b8874a', roughness: 0.4, metalness: 0.6, emissive: '#4a3010', emissiveIntensity: 0.7 });
const GEARMAT2 = new THREE.MeshStandardMaterial({ color: '#8a827a', roughness: 0.5, metalness: 0.55, emissive: '#2a2622', emissiveIntensity: 0.8 });
const BRASSMAT = new THREE.MeshStandardMaterial({ color: '#d1a85c', roughness: 0.35, metalness: 0.8 });

/** reverse the winding (and normals) of an indexed geometry, so it faces inward */
function flip(g) {
  const idx = g.index.array;
  for (let i = 0; i < idx.length; i += 3) { const t = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = t; }
  const n = g.attributes.normal.array;
  for (let i = 0; i < n.length; i++) n[i] = -n[i];
  return g;
}

/** thick wall arc, a in [a0, a0+L] (a measured as atan2(z, x)), with end caps and a top ring */
function arcWall(b, { R, t, H, a0, L, y = 0, color, mat = M.stone, seg = 48 }) {
  const ts = Math.PI / 2 - (a0 + L);
  b.geo(new THREE.CylinderGeometry(R, R, H, seg, 1, true, ts, L).translate(0, H / 2, 0), { y, color, mat });
  b.geo(flip(new THREE.CylinderGeometry(R - t, R - t, H, seg, 1, true, ts, L).translate(0, H / 2, 0)), { y, color, mat });
  const ring = new THREE.RingGeometry(R - t, R, seg, 1, -(a0 + L), L);
  ring.rotateX(-Math.PI / 2);
  b.geo(ring, { y: y + H, color, mat });
  for (const a of [a0, a0 + L]) {
    b.geo(new THREE.BoxGeometry(t, H, 0.03).translate(0, H / 2, 0), { x: Math.cos(a) * (R - t / 2), z: Math.sin(a) * (R - t / 2), y, ry: -a, color, mat });
  }
}

/** a gear in the XY plane (axis z), centred */
function gearGroup(R, { teeth = 24, th = 0.25, mat = GEARMAT, spokes = 6 }) {
  const g = new THREE.Group();
  const geos = [];
  const push = (geo) => { geos.push(geo.index ? geo.toNonIndexed() : geo); };
  push(new THREE.TorusGeometry(R * 0.86, th * 0.42, 5, Math.max(24, teeth * 2)).scale(1, 1, 1.1));
  push(new THREE.CylinderGeometry(R * 0.86 + th * 0.25, R * 0.86 + th * 0.25, th, Math.max(24, teeth * 2), 1, true).rotateX(Math.PI / 2));
  const tw = (2 * Math.PI * R) / teeth * 0.5;
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * Math.PI * 2;
    const tooth = new THREE.BoxGeometry(tw, R * 0.16, th).translate(0, R * 0.93, 0).rotateZ(a);
    push(tooth);
  }
  for (let i = 0; i < spokes; i++) {
    const a = (i / spokes) * Math.PI * 2;
    push(new THREE.BoxGeometry(R * 0.1, R * 0.8, th * 0.6).translate(0, R * 0.45, 0).rotateZ(a));
  }
  push(new THREE.CylinderGeometry(R * 0.16, R * 0.16, th * 1.6, 12).rotateX(Math.PI / 2));
  // merge manually (non-indexed, same attributes)
  let n = 0;
  for (const q of geos) n += q.attributes.position.count;
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3);
  let o = 0;
  for (const q of geos) {
    if (!q.attributes.normal) q.computeVertexNormals();
    pos.set(q.attributes.position.array, o * 3);
    nor.set(q.attributes.normal.array, o * 3);
    o += q.attributes.position.count;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  g.add(mesh);
  return { g, mesh };
}

export default function build({ rng, accent }) {
  const object = new THREE.Group();
  const b = new Builder();
  const L = new Lines();
  const gears = []; // { mesh, speed } (individual meshes)
  const bigGears = []; // instanced cogwheels on the drums

  // ground: a worn iron-grey floor
  b.cyl(10.4, 10.5, 0.1, { color: '#4b4542', seg: 72 });
  for (let i = 0; i < 6; i++) b.torus(1.6 * i + 1.4, 0.02, { rx: Math.PI / 2, y: 0.11, color: '#3a3533', tseg: 80, rseg: 3 });

  // the shells, outer → inner. unjust: iron + marble crown. just: brass lattice.
  const SH = [
    { R: 9.7, H: 4.2, W: 1.95, just: false },
    { R: 7.6, H: 5.6, W: 1.65, just: true },
    { R: 5.6, H: 7.9, W: 1.3, just: false },
    { R: 3.8, H: 10.0, W: 1.05, just: true },
    { R: 2.3, H: 12.0, W: 0.85, just: false },
    { R: 1.15, H: 13.7, W: 0.75, just: true },
    { R: 0.5, H: 14.8, W: 0.0, just: false },
  ];

  const pulleys = []; // animated small wheels
  const ropes = []; // [x, z, yTop, yBot] for moving buckets
  const pistons = []; // [x, y, z]

  for (let k = 0; k < SH.length; k++) {
    const S = SH[k];
    const s = S.R / 9.7; // relative scale for details
    const a0 = CUT + S.W / 2, Lw = Math.PI * 2 - S.W;
    if (!S.just) {
      const t = Math.max(0.12, 0.42 * Math.sqrt(s));
      const wallH = S.H - 1.3 * Math.sqrt(s) - 0.25;
      arcWall(b, { R: S.R, t, H: wallH, a0, L: Lw, y: 0.1, color: '#4f4743', mat: M.stone, seg: 64 });
      // riveted bands
      for (let yy = 0.6; yy < wallH; yy += 0.9 * Math.sqrt(s) + 0.2) {
        b.geo(new THREE.CylinderGeometry(S.R + 0.03, S.R + 0.03, 0.08, 64, 1, true, Math.PI / 2 - (a0 + Lw), Lw), { y: 0.1 + yy, color: BRONZE, mat: M.metal });
      }
      // inner face: dark furnace slits glowing red
      const nsl = Math.max(4, Math.round(10 * s));
      for (let i = 0; i < nsl; i++) {
        const a = a0 + (i + 0.5) / nsl * Lw;
        const rr = S.R - t - 0.012;
        b.quad(0.18 * Math.sqrt(s) + 0.05, 0.12, { x: Math.cos(a) * rr, y: 0.5, z: Math.sin(a) * rr, ry: -a - Math.PI / 2, mat: M.glow, color: '#e0582a', glow: 1.6 });
      }
      // the marble crown: stylobate, colonnade, frieze with relief blocks, cornice
      const cy = 0.1 + wallH;
      const ch = 1.3 * Math.sqrt(s);
      const cr = S.R - t / 2;
      const ring = (r0, r1, y, h, col, mat = M.smooth) => {
        b.geo(new THREE.CylinderGeometry(r1, r1, h, 64, 1, true, Math.PI / 2 - (a0 + Lw), Lw).translate(0, h / 2, 0), { y, color: col, mat });
        b.geo(flip(new THREE.CylinderGeometry(r0, r0, h, 64, 1, true, Math.PI / 2 - (a0 + Lw), Lw).translate(0, h / 2, 0)), { y, color: col, mat });
        const rg = new THREE.RingGeometry(r0, r1, 64, 1, -(a0 + Lw), Lw).rotateX(-Math.PI / 2);
        b.geo(rg, { y: y + h, color: col, mat });
        b.geo(flip(rg.clone()), { y, color: col, mat });
      };
      ring(cr - t * 0.8, cr + t * 0.8, cy, 0.12 * Math.sqrt(s) + 0.04, MARBLE);
      const colH = ch * 0.62;
      const nCol = Math.max(5, Math.round(S.R * 4.2));
      for (let i = 0; i <= nCol; i++) {
        const a = a0 + (i / nCol) * Lw;
        column(b, { x: Math.cos(a) * cr, z: Math.sin(a) * cr, y: cy + 0.12 * Math.sqrt(s) + 0.04, h: colH, r: 0.07 * Math.sqrt(s) + 0.025, color: MARBLE });
      }
      const fy = cy + 0.12 * Math.sqrt(s) + 0.04 + colH;
      ring(cr - t * 0.7, cr + t * 0.7, fy, 0.08 * Math.sqrt(s) + 0.02, '#e6dccb'); // architrave
      const fh = 0.26 * Math.sqrt(s) + 0.05;
      ring(cr - t * 0.65, cr + t * 0.65, fy + 0.08 * Math.sqrt(s) + 0.02, fh, '#f4eee3'); // frieze
      // relief: little marching figures / metopes on the frieze
      const nRel = Math.max(6, Math.round(S.R * 7));
      for (let i = 0; i < nRel; i++) {
        const a = a0 + ((i + 0.5) / nRel) * Lw;
        const rr = cr + t * 0.65 + 0.01;
        if (i % 2 === 0) b.box(0.06 * Math.sqrt(s) + 0.02, fh * 0.7, 0.03, { x: Math.cos(a) * rr, y: fy + 0.08 * Math.sqrt(s) + 0.02 + fh * 0.15, z: Math.sin(a) * rr, ry: Math.PI / 2 - a, color: '#d9cdb8', mat: M.smooth });
        else b.sphere(fh * 0.22, { x: Math.cos(a) * rr, y: fy + 0.08 * Math.sqrt(s) + 0.02 + fh * 0.5, z: Math.sin(a) * rr, color: '#d9cdb8', mat: M.smooth, seg: 6 });
      }
      ring(cr - t * 0.85, cr + t * 0.85, fy + 0.08 * Math.sqrt(s) + 0.02 + fh, 0.07 * Math.sqrt(s) + 0.02, MARBLE); // cornice
      // the gold triglyph line
      b.geo(new THREE.CylinderGeometry(cr + t * 0.66, cr + t * 0.66, 0.025, 64, 1, true, Math.PI / 2 - (a0 + Lw), Lw), { y: fy + 0.08 * Math.sqrt(s) + 0.02 + fh * 0.92, color: C.gold, mat: M.metal });

      // great cogwheels mounted on the outside of the drum: meshing columns of gears
      // climbing the visible bands (just beyond each cut, and around the back)
      if (k < 6) {
        const out = S.R + 0.2 * Math.sqrt(s) + 0.06;
        const th = 0.3 * Math.sqrt(s) + 0.08;
        const addGear = (ga, gy, Rg, speed, mat) => {
          // instanced: unit gear scaled to Rg, thickness th
          bigGears.push({ x: Math.cos(ga) * out, y: gy, z: Math.sin(ga) * out, ry: Math.PI / 2 - ga, R: Rg, th, speed, iron: mat === GEARMAT2 });
          b.cyl(Rg * 0.22, Rg * 0.22, out - S.R + 0.05, { x: Math.cos(ga) * (S.R - 0.02), y: gy, z: Math.sin(ga) * (S.R - 0.02), rx: Math.PI / 2, ry: Math.PI / 2 - ga, color: BRONZE, mat: M.metal, seg: 10 });
        };
        // the band visible through the outer cut
        const outerW = k === 0 ? S.W + 1.1 : SH[k - 2].W;
        const da = (outerW - S.W) / 4 + S.W / 2; // angular centre of the band
        const bandArc = Math.max(0.3, ((outerW - S.W) / 2) * S.R);
        const Rb = Math.min(bandArc * 0.48, 1.5, wallH * 0.42);
        const cols = [CUT + da, CUT - da, CUT + Math.PI, CUT + Math.PI * 0.6, CUT - Math.PI * 0.6];
        for (let c = 0; c < cols.length; c++) {
          const a = cols[c];
          let y = 0.1 + Rb + 0.08;
          let R = Rb, sp = 0.22 * (c % 2 ? 1 : -1);
          let n = 0;
          while ((n === 0 || y + R < wallH + 0.1) && n < 6) {
            addGear(a + (n % 2 ? 0.25 : -0.25) * R / S.R * 0.6, y, R, sp, n % 2 ? GEARMAT2 : GEARMAT);
            const R2 = n % 2 ? Rb : Rb * 0.62;
            y += (R + R2) * 0.92;
            sp = -sp * (R / R2);
            R = R2;
            n++;
          }
        }
      }
    } else {
      // ── a just shell: a makeshift lattice of brass posts, rings, diagonal wires
      const nPost = Math.max(6, Math.round(S.R * 3.2));
      const posts = [];
      for (let i = 0; i <= nPost; i++) {
        const a = a0 + (i / nPost) * Lw;
        const x = Math.cos(a) * S.R, z = Math.sin(a) * S.R;
        const top = S.H * rng.range(0.92, 1.0);
        b.rod([x, 0.1, z], [x + rng.range(-0.05, 0.05), top, z + rng.range(-0.05, 0.05)], 0.04 * Math.sqrt(s) + 0.02, { color: rng.chance(0.3) ? '#8a6a48' : BRASS, mat: rng.chance(0.3) ? M.wood : M.metal, seg: 5 });
        posts.push([x, z, a, top]);
      }
      // rings at irregular heights, made of planks and wire
      const nRing = Math.max(3, Math.round(S.H / 1.3));
      for (let r = 1; r <= nRing; r++) {
        const yy = 0.1 + (r / nRing) * S.H * 0.96;
        for (let i = 0; i < posts.length - 1; i++) {
          const [x0, z0] = posts[i], [x1, z1] = posts[i + 1];
          if (rng.chance(0.82)) {
            const plank = rng.chance(0.5);
            if (plank) b.beam([x0, yy, z0], [x1, yy, z1], 0.05, { color: rng.pick(['#8a6a48', '#a07d50', '#6d5238']), mat: M.wood });
            else L.seg([x0, yy, z0], [x1, yy, z1], BRASS, 1.2);
          }
          // crossed bracing wires
          if (rng.chance(0.55) && r < nRing) {
            const y2 = 0.1 + ((r + 1) / nRing) * S.H * 0.96;
            L.seg([x0, yy, z0], [x1, y2, z1], COPPER, 1.0);
          }
        }
      }
      // little back-rooms: shacks bolted to the lattice, lit from inside
      const nShack = Math.max(2, Math.round(S.R * 1.6));
      for (let i = 0; i < nShack; i++) {
        const p = posts[1 + Math.floor(rng() * (posts.length - 2))];
        const yy = 0.1 + Math.floor(rng() * nRing) / nRing * S.H * 0.96;
        const a = p[2];
        const rr = S.R - 0.25 * Math.sqrt(s) - 0.05;
        const w = 0.45 * Math.sqrt(s) + 0.15;
        b.box(w, w * 0.8, w * 0.8, { x: Math.cos(a) * rr, y: yy, z: Math.sin(a) * rr, ry: -a, color: rng.pick(['#8a6a48', '#9b7b55', '#7a5e40']), mat: M.wood });
        b.quad(w * 0.35, w * 0.3, { x: Math.cos(a) * (rr - w * 0.4 - 0.012), y: yy + w * 0.4, z: Math.sin(a) * (rr - w * 0.4 - 0.012), ry: -a - Math.PI / 2, mat: M.glow, color: C.lamp, glow: 2.2 });
        b.quad(w * 0.35, w * 0.3, { x: Math.cos(a) * (rr + w * 0.4 + 0.012), y: yy + w * 0.4, z: Math.sin(a) * (rr + w * 0.4 + 0.012), ry: -a + Math.PI / 2, mat: M.glow, color: C.lamp, glow: 2.2 });
      }
      // ladders
      for (let i = 0; i < Math.max(1, Math.round(S.R)); i++) {
        const p = posts[Math.floor(rng() * posts.length)];
        const a = p[2] + 0.06;
        const rr = S.R - 0.06;
        const x = Math.cos(a) * rr, z = Math.sin(a) * rr;
        const tx = -Math.sin(a) * 0.08, tz = Math.cos(a) * 0.08;
        const hh = S.H * rng.range(0.4, 0.8);
        L.seg([x - tx, 0.1, z - tz], [x - tx, hh, z - tz], '#a07d50', 1);
        L.seg([x + tx, 0.1, z + tz], [x + tx, hh, z + tz], '#a07d50', 1);
        for (let yy = 0.3; yy < hh; yy += 0.18) L.seg([x - tx, yy, z - tz], [x + tx, yy, z + tz], '#a07d50', 1);
      }
      // pulleys at the top of a few posts, with ropes and climbing buckets
      for (let i = 0; i < 2; i++) {
        const p = posts[Math.min(posts.length - 2, 1 + Math.floor(((i + 0.5) / 2) * (posts.length - 2)))];
        const a = p[2];
        const rr = S.R - 0.2;
        const x = Math.cos(a) * rr, z = Math.sin(a) * rr, y = p[3] - 0.15;
        const pr = 0.16 * Math.sqrt(s) + 0.08;
        const { g, mesh } = gearGroup(pr, { teeth: 10, th: 0.06, mat: BRASSMAT, spokes: 4 });
        g.position.set(x, y, z);
        g.rotation.y = -a; // wheel plane contains the radial direction
        object.add(g);
        pulleys.push({ mesh, speed: (i % 2 ? 1 : -1) * 1.1 });
        b.rod([Math.cos(a) * S.R, y, Math.sin(a) * S.R], [x, y, z], 0.02, { color: BRASS, mat: M.metal });
        L.seg([x + Math.cos(a) * pr, y, z + Math.sin(a) * pr], [x + Math.cos(a) * pr, 0.2, z + Math.sin(a) * pr], '#d8c39a', 1.1);
        L.seg([x - Math.cos(a) * pr, y, z - Math.sin(a) * pr], [x - Math.cos(a) * pr, 0.2, z - Math.sin(a) * pr], '#d8c39a', 1.1);
        ropes.push([x + Math.cos(a) * pr, z + Math.sin(a) * pr, y - 0.1, 0.25, 0]);
        ropes.push([x - Math.cos(a) * pr, z - Math.sin(a) * pr, y - 0.1, 0.25, 0.5]);
      }
      // pistons: brass cylinders on the floor inside, pumping
      for (let i = 0; i < 2; i++) {
        const a = a0 + rng.range(0.15, 0.85) * Lw;
        const rr = S.R - 0.35 * Math.sqrt(s) - 0.1;
        const x = Math.cos(a) * rr, z = Math.sin(a) * rr;
        const ph = 0.25 * Math.sqrt(s) + 0.2;
        b.cyl(0.09 * Math.sqrt(s) + 0.04, 0.1 * Math.sqrt(s) + 0.05, ph * 1.6, { x, z, y: 0.1, color: COPPER, mat: M.metal, seg: 10 });
        pistons.push([x, 0.1 + ph * 1.6, z, ph, 0.04 * Math.sqrt(s) + 0.02]);
      }
      // wires from this lattice reaching up into the cogs of the next unjust shell — the vine
      const inner = SH[k + 1];
      if (inner) {
        for (let i = 0; i < 10; i++) {
          const p = posts[Math.floor(rng() * posts.length)];
          const a2 = p[2] + rng.range(-0.3, 0.3);
          const y1 = rng.range(0.5, S.H * 0.9);
          const y2 = Math.min(inner.H * 0.9, y1 + rng.range(0.3, 2.0));
          L.rope([Math.cos(p[2]) * S.R, y1, Math.sin(p[2]) * S.R], [Math.cos(a2) * (inner.R + 0.05), y2, Math.sin(a2) * (inner.R + 0.05)], -0.25, BRASS, 8, 1.1);
        }
      }
      // tiny lanterns strung along the lattice
      for (let i = 0; i < Math.round(S.R * 4); i++) {
        const p = posts[Math.floor(rng() * posts.length)];
        b.sphere(0.035 * Math.sqrt(s) + 0.02, { x: p[0] * 0.995, y: rng.range(0.4, S.H * 0.9), z: p[1] * 0.995, mat: M.glow, color: '#ffd28a', glow: 2.6, seg: 6 });
      }
    }
  }

  // ── the meat-grinder in the cutaway foreground, between the outer drum and the first lattice
  {
    const a = CUT, rr = 8.6;
    const x = Math.cos(a) * rr, z = Math.sin(a) * rr;
    // hopper funnel
    b.geo(new THREE.CylinderGeometry(0.9, 0.28, 1.1, 16, 1, true), { x, y: 2.15, z, color: IRON2, mat: M.rough_metal });
    b.geo(new THREE.CylinderGeometry(0.86, 0.26, 1.08, 16, 1, true).scale(-1, 1, 1), { x, y: 2.15, z, color: '#2a2524', mat: M.rough_metal });
    b.torus(0.9, 0.05, { x, y: 2.7, z, rx: Math.PI / 2, color: BRONZE, mat: M.metal, tseg: 24 });
    // barrel lying tangentially, with a gilded frieze band (crowning the grinder, as the text says)
    const ta = a + Math.PI / 2;
    b.cyl(0.42, 0.42, 2.2, { x: x - Math.cos(ta) * 1.1, y: 1.15, z: z - Math.sin(ta) * 1.1, rz: Math.PI / 2, ry: -ta, color: IRON2, mat: M.rough_metal, seg: 16, order: 'YXZ' });
    b.cyl(0.46, 0.46, 0.18, { x: x - Math.cos(ta) * 0.4, y: 1.15, z: z - Math.sin(ta) * 0.4, rz: Math.PI / 2, ry: -ta, color: MARBLE, mat: M.smooth, seg: 16 });
    b.cyl(0.46, 0.46, 0.18, { x: x + Math.cos(ta) * 0.6, y: 1.15, z: z + Math.sin(ta) * 0.6, rz: Math.PI / 2, ry: -ta, color: MARBLE, mat: M.smooth, seg: 16 });
    // legs
    for (const o of [-0.8, 0.8]) b.box(0.15, 0.8, 0.6, { x: x + Math.cos(ta) * o, y: 0.1, z: z + Math.sin(ta) * o, ry: -a, color: IRON, mat: M.rough_metal });
    // the output plate with a red glow
    b.cyl(0.36, 0.36, 0.05, { x: x + Math.cos(ta) * 1.12, y: 1.15, z: z + Math.sin(ta) * 1.12, rz: Math.PI / 2, ry: -ta, color: '#2a2524', seg: 16 });
    b.sphere(0.12, { x: x + Math.cos(ta) * 1.2, y: 1.15, z: z + Math.sin(ta) * 1.2, mat: M.glow, color: '#e0582a', glow: 1.8, seg: 8 });
    // the crank wheel (animated)
    const { g, mesh } = gearGroup(0.75, { teeth: 14, th: 0.12, mat: GEARMAT, spokes: 5 });
    g.position.set(x - Math.cos(ta) * 1.3, 1.15, z - Math.sin(ta) * 1.3);
    g.rotation.y = Math.PI / 2 - ta;
    object.add(g);
    gears.push({ mesh, speed: 0.6 });
    // a queue of tiny bent figures shuffling toward it
    for (let i = 0; i < 9; i++) {
      const qa = a - 0.25 - i * 0.07;
      const qx = Math.cos(qa) * 8.3, qz = Math.sin(qa) * 8.3;
      b.push({ x: qx, z: qz, y: 0.1, ry: -qa });
      b.push({ rx: 0.4 });
      b.cone(0.07, 0.24, { color: rng.pick(['#4a4440', '#5a4e48', '#3a3533']), seg: 6 });
      b.sphere(0.045, { y: 0.27, color: '#b9a493', seg: 6 });
      b.pop();
      b.pop();
    }
  }

  // ── the innermost seed: a point of light inside the smallest marble drum
  b.sphere(0.13, { y: SH[SH.length - 1].H + 0.35, mat: M.glow, color: accent, glow: 3.2, seg: 10 });
  b.cyl(0.02, 0.02, 0.3, { y: SH[SH.length - 1].H, color: C.gold, mat: M.metal, seg: 4 });

  object.add(b.build());
  object.add(L.build());

  // ── moving buckets and piston rods
  const bucketG = new THREE.CylinderGeometry(0.07, 0.05, 0.1, 8);
  const buckets = new THREE.InstancedMesh(bucketG, new THREE.MeshStandardMaterial({ color: '#8a6a48', roughness: 0.8 }), ropes.length);
  object.add(buckets);
  const rodG = new THREE.CylinderGeometry(1, 1, 1, 8).translate(0, 0.5, 0);
  const rods = new THREE.InstancedMesh(rodG, BRASSMAT, pistons.length);
  object.add(rods);

  const _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3();
  const _qy = new THREE.Quaternion(), _qz = new THREE.Quaternion(), _Y = new THREE.Vector3(0, 1, 0), _Z = new THREE.Vector3(0, 0, 1);
  const unit = gearGroup(1, { teeth: 22, th: 0.2, mat: GEARMAT }).mesh.geometry;
  const sets = [false, true].map((iron) => {
    const list = bigGears.filter((g) => g.iron === iron);
    const im = new THREE.InstancedMesh(unit, iron ? GEARMAT2 : GEARMAT, list.length);
    im.castShadow = true;
    im.receiveShadow = true;
    im.frustumCulled = false;
    object.add(im);
    return { im, list };
  });
  function update(t) {
    for (const { im, list } of sets) {
      for (let i = 0; i < list.length; i++) {
        const G = list[i];
        _qy.setFromAxisAngle(_Y, G.ry);
        _qz.setFromAxisAngle(_Z, t * G.speed);
        _q.multiplyQuaternions(_qy, _qz);
        _p.set(G.x, G.y, G.z);
        _s.set(G.R, G.R, G.th / 0.2);
        _m.compose(_p, _q, _s);
        im.setMatrixAt(i, _m);
      }
      im.instanceMatrix.needsUpdate = true;
    }
    for (const G of gears) G.mesh.rotation.z = t * G.speed;
    for (const P of pulleys) P.mesh.rotation.z = t * P.speed;
    for (let i = 0; i < ropes.length; i++) {
      const [x, z, yTop, yBot, ph] = ropes[i];
      const u = 0.5 + 0.5 * Math.sin(t * 0.35 + ph * Math.PI * 2 * 0.5 + (i % 2) * Math.PI);
      _p.set(x, yBot + (yTop - yBot - 0.2) * u, z);
      _m.makeTranslation(_p.x, _p.y, _p.z);
      buckets.setMatrixAt(i, _m);
    }
    buckets.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < pistons.length; i++) {
      const [x, y, z, ph, r] = pistons[i];
      const ext = ph * (0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 1.6 + i * 1.3)));
      _p.set(x, y - 0.05, z);
      _s.set(r, ext + 0.05, r);
      _m.compose(_p, _q, _s);
      rods.setMatrixAt(i, _m);
    }
    rods.instanceMatrix.needsUpdate = true;
  }
  update(0);
  return { object, update };
}
