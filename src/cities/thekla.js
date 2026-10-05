// Thekla — a city that must never be finished, "so that its destruction cannot begin".
// Plank fences, sackcloth screens, scaffolding, ladders, trestles, catwalks hanging from ropes,
// cranes slowly turning. Asked for the plan, the builders wait for dark and point upward:
// each half-built shell continues into the sky as a constellation — the blueprint drawn in stars.
import { THREE, Builder, M, C, Lines, person } from '../kit.js';

export default function build({ rng, accent }) {
  const b = new Builder();
  const object = new THREE.Group();
  const ropes = new Lines();
  const sky = new Lines(); // the blueprint
  const stars = []; // [x,y,z,size]
  const STAR = '#cfe3ff';

  // ground: trodden earth with a gravel apron
  b.cyl(10.35, 10.4, 0.1, { seg: 64, color: '#a58a66' });
  for (let i = 0; i < 40; i++) {
    const [x, z] = rng.inDisc(9.3);
    b.cyl(rng.range(0.4, 1.1), rng.range(0.5, 1.2), 0.02, { x, y: 0.1, z, seg: 10, color: rng.pick(['#9a7f5d', '#b19673', '#8f7656']) });
  }

  /* ----------------------------------------------------------------- shells -- */
  const FH = 0.95; // storey height
  const CONC = '#c9c2b4', CONC2 = '#b6ae9e', BRICK = '#b0603f';
  const POLE = '#9a9894', PLANK = '#b98a55', SACK = '#cdb68f';

  const sites = [
    { x: 0.2, z: -0.2, w: 3.2, d: 3.2, built: 6, plan: 17, top: 'spire', steps: [[10, 0.75], [14, 0.5]] },
    { x: -5.6, z: 2.6, w: 2.4, d: 2.0, built: 3, plan: 9, top: 'dome' },
    { x: 5.4, z: 3.4, w: 2.2, d: 2.6, built: 4, plan: 11, top: 'gable' },
    { x: 3.6, z: -5.6, w: 2.6, d: 2.0, built: 2, plan: 7, top: 'dome' },
    { x: -4.0, z: -5.0, w: 2.0, d: 2.0, built: 3, plan: 12, top: 'spire', steps: [[8, 0.7]] },
    { x: -0.8, z: 6.6, w: 2.4, d: 1.6, built: 1, plan: 5, top: 'gable' },
  ];

  const corners = (x, z, w, d) => [[x - w / 2, z - d / 2], [x + w / 2, z - d / 2], [x + w / 2, z + d / 2], [x - w / 2, z + d / 2]];

  for (const s of sites) {
    const { x, z, w, d, built } = s;
    // foundation
    b.box(w + 0.3, 0.18, d + 0.3, { x, y: 0.08, z, color: CONC2 });
    // floors: slabs + columns; the top storey only half poured, rebar sticking out
    const nc = Math.max(2, Math.round(w / 0.8)), nd = Math.max(2, Math.round(d / 0.8));
    for (let f = 0; f < built; f++) {
      const y0 = 0.26 + f * FH;
      const top = f === built - 1;
      for (let i = 0; i <= nc; i++) {
        for (let j = 0; j <= nd; j++) {
          if (i > 0 && i < nc && j > 0 && j < nd) continue; // perimeter columns only
          const cx = x - w / 2 + (i / nc) * w, cz = z - d / 2 + (j / nd) * d;
          if (top && rng.chance(0.4)) {
            // bare rebar where the column has not been cast yet
            for (const o of [[-0.05, -0.05], [0.05, 0.05], [0.05, -0.05]]) {
              b.cyl(0.012, 0.012, FH * 0.9, { x: cx + o[0], y: y0, z: cz + o[1], seg: 3, color: C.rust, mat: M.rough_metal });
            }
          } else {
            b.box(0.14, FH - 0.1, 0.14, { x: cx, y: y0, z: cz, color: CONC });
          }
        }
      }
      // slab above this storey (not on top storey; partial on the one below the top)
      if (!top) {
        const partial = f === built - 2;
        const sw = partial ? w * rng.range(0.5, 0.8) : w + 0.1;
        b.box(sw, 0.1, d + 0.1, { x: x - (w + 0.1 - sw) / 2, y: y0 + FH - 0.1, z, color: CONC2 });
        if (partial) {
          // timber formwork for the rest of the slab
          b.box(w + 0.1 - sw, 0.04, d + 0.1, { x: x + sw / 2, y: y0 + FH - 0.14, z, color: PLANK, mat: M.wood });
          for (let k = 0; k < 4; k++) b.cyl(0.025, 0.025, FH - 0.14, { x: x + sw / 2 + (k + 0.5) * (w - sw) / 4 - w / 2 + w / 2, y: y0, z: z + rng.range(-d / 3, d / 3), seg: 4, color: PLANK, mat: M.wood });
        }
      }
      // brick infill on the lower storeys, with window gaps
      if (f < built - 2) {
        for (let face = 0; face < 4; face++) {
          const along = face % 2 ? d : w;
          const n = face % 2 ? nd : nc;
          for (let k = 0; k < n; k++) {
            if (rng.chance(0.45)) continue;
            const u = -along / 2 + (k + 0.5) * (along / n);
            const ww = along / n - 0.16;
            const hasWin = rng.chance(0.6);
            const px = face === 0 ? x + u : face === 2 ? x + u : face === 1 ? x + w / 2 : x - w / 2;
            const pz = face === 0 ? z - d / 2 : face === 2 ? z + d / 2 : z + u;
            const ry = face % 2 ? Math.PI / 2 : 0;
            if (hasWin) {
              b.box(ww, 0.32, 0.1, { x: px, y: y0, z: pz, ry, color: BRICK });
              b.box(ww, 0.18, 0.1, { x: px, y: y0 + FH - 0.28, z: pz, ry, color: BRICK });
            } else b.box(ww, FH - 0.1, 0.1, { x: px, y: y0, z: pz, ry, color: rng.chance(0.3) ? CONC2 : BRICK });
          }
        }
      }
    }

    /* scaffolding: standards, ledgers, braces, plank decks, ladders */
    const off = 0.38;
    const SW = w + off * 2, SD = d + off * 2;
    const sh = built * FH + 0.9;
    const ns = Math.max(2, Math.round(SW / 0.85)), nds = Math.max(2, Math.round(SD / 0.85));
    const ring = []; // perimeter points of the scaffold
    for (let i = 0; i < ns; i++) ring.push([x - SW / 2 + (i / ns) * SW, z - SD / 2]);
    for (let j = 0; j < nds; j++) ring.push([x + SW / 2, z - SD / 2 + (j / nds) * SD]);
    for (let i = ns; i > 0; i--) ring.push([x - SW / 2 + (i / ns) * SW, z + SD / 2]);
    for (let j = nds; j > 0; j--) ring.push([x - SW / 2, z - SD / 2 + (j / nds) * SD]);
    // scaffold covers 3 of 4 sides, sometimes all
    const skip = rng.chance(0.4) ? -1 : rng.int(0, 3);
    const sideOf = (k) => (k < ns ? 0 : k < ns + nds ? 1 : k < 2 * ns + nds ? 2 : 3);
    for (let k = 0; k < ring.length; k++) {
      const sd = sideOf(k);
      const k2 = (k + 1) % ring.length;
      const [ax, az] = ring[k], [bx, bz] = ring[k2];
      const onSkip = sd === skip && sideOf(k2) === skip;
      if (!onSkip) b.cyl(0.03, 0.03, sh, { x: ax, y: 0.1, z: az, seg: 5, color: POLE, mat: M.smooth });
      if (onSkip) continue;
      for (let f = 1; f <= built; f++) {
        const y = 0.26 + f * FH - 0.06;
        b.rod([ax, y, az], [bx, y, bz], 0.022, { color: POLE, mat: M.smooth });
        b.rod([ax, y + 0.45, az], [bx, y + 0.45, bz], 0.016, { color: POLE, mat: M.smooth }); // guard rail
        // plank deck, inward
        const mx = (ax + bx) / 2, mz = (az + bz) / 2;
        const len = Math.hypot(bx - ax, bz - az);
        const ang = Math.atan2(bz - az, bx - ax);
        const inx = x - mx, inz = z - mz;
        const il = Math.hypot(inx, inz);
        b.box(len + 0.02, 0.035, 0.3, { x: mx + (inx / il) * 0.17, y: y + 0.02, z: mz + (inz / il) * 0.17, ry: -ang, color: rng.pick([PLANK, '#a87b4a', '#c49a66']), mat: M.wood });
        // braces in alternate bays
        if ((k + f) % 3 === 0) b.rod([ax, y - FH + 0.06, az], [bx, y, bz], 0.014, { color: POLE, mat: M.smooth });
      }
      // sackcloth screens hung on some bays
      if (rng.chance(0.28)) {
        const f0 = rng.int(0, Math.max(0, built - 2));
        const nf = rng.int(1, Math.min(3, built - f0));
        const mx = (ax + bx) / 2, mz = (az + bz) / 2;
        const len = Math.hypot(bx - ax, bz - az);
        const ang = Math.atan2(bz - az, bx - ax);
        const ox = (mx - x), oz = (mz - z), ol = Math.hypot(ox, oz);
        b.quad(len - 0.04, nf * FH - 0.06, {
          x: mx + (ox / ol) * 0.04, y: 0.26 + f0 * FH + nf * FH / 2 + 0.2, z: mz + (oz / ol) * 0.04,
          ry: -ang, rx: rng.range(-0.04, 0.04), mat: M.cloth, color: rng.pick([SACK, '#d8c49c', '#bfa57c', '#c9b48a']),
        });
      }
    }
    // ladder up one corner
    {
      const [lx, lz] = [x + SW / 2 + 0.12, z + rng.range(-SD / 4, SD / 4)];
      for (const s2 of [-0.12, 0.12]) b.cyl(0.018, 0.018, sh - 0.3, { x: lx, y: 0.1, z: lz + s2, seg: 4, color: PLANK, mat: M.wood });
      for (let y = 0.3; y < sh - 0.4; y += 0.18) b.box(0.03, 0.025, 0.26, { x: lx, y: 0.1 + y, z: lz, color: PLANK, mat: M.wood });
    }
    // a few workers on the decks
    for (let k = 0; k < 2 + built / 2; k++) {
      const f = rng.int(0, built);
      const [px, pz] = rng.pick(ring);
      const ix = x - px, iz = z - pz, il = Math.hypot(ix, iz);
      person(b, { x: px + (ix / il) * 0.17, y: f === 0 ? 0.1 : 0.26 + f * FH - 0.02, z: pz + (iz / il) * 0.17, h: 0.3, color: rng.pick(['#e08a2e', '#d9c23b', C.sea, C.slate]) });
    }

    /* the blueprint: the rest of the building drawn in stars */
    const bluePlan = (lvl) => {
      let sx = 1;
      for (const [at, f] of s.steps || []) if (lvl >= at) sx = f;
      return sx;
    };
    const yAt = (f) => 0.26 + f * FH;
    let prev = null;
    for (let f = built + 1; f <= s.plan; f++) {
      const sc = bluePlan(f);
      const setback = prev && prev.sc !== sc;
      const ring = f === s.plan || setback || (f - built) % 2 === 0;
      if (!ring) continue;
      const cs = corners(x, z, w * sc, d * sc);
      const y = yAt(f);
      const k01 = (f - built) / (s.plan - built);
      const I = 0.35 + 0.85 * k01; // faint near the scaffold, clearer in the sky
      for (let k = 0; k < 4; k++) {
        const a2 = cs[k], c2 = cs[(k + 1) % 4];
        sky.seg([a2[0], y, a2[1]], [c2[0], y, c2[1]], STAR, I * 0.7);
        if ((k + f) % 2 === 0 || f === s.plan) stars.push([a2[0], y, a2[1], 0.6 + k01]);
      }
      if (prev && !setback) {
        for (let k = 0; k < 4; k++) sky.seg([cs[k][0], prev.y, cs[k][1]], [cs[k][0], y, cs[k][1]], STAR, I);
        if (f % 4 === 0) sky.seg([cs[0][0], prev.y, cs[0][1]], [cs[1][0], y, cs[1][1]], STAR, I * 0.4);
      } else if (prev) {
        for (let k = 0; k < 4; k++) sky.seg([prev.cs[k][0], prev.y, prev.cs[k][1]], [cs[k][0], y, cs[k][1]], STAR, I);
      } else {
        // dotted rise from the scaffold top: the plan only begins to show
        const y0 = yAt(built) + 0.6;
        for (let k = 0; k < 4; k++) sky.seg([cs[k][0], y0, cs[k][1]], [cs[k][0], y, cs[k][1]], STAR, 0.2);
      }
      prev = { cs, y, sc };
    }
    // crown
    const yTop = yAt(s.plan);
    const sc = bluePlan(s.plan);
    if (s.top === 'spire') {
      const apex = [x, yTop + 2.4, z];
      for (const c2 of corners(x, z, w * sc, d * sc)) sky.seg([c2[0], yTop, c2[1]], apex, STAR, 1.2);
      stars.push([...apex, 2.2]);
    } else if (s.top === 'dome') {
      const R = Math.min(w, d) * sc * 0.5;
      for (let m = 0; m < 4; m++) {
        const a = (m / 4) * Math.PI;
        let last = null;
        for (let k = 0; k <= 8; k++) {
          const th = (k / 8) * Math.PI;
          const p = [x + Math.cos(th) * R * Math.cos(a), yTop + Math.sin(th) * R, z + Math.cos(th) * R * Math.sin(a)];
          if (last) sky.seg(last, p, STAR, 1.0);
          last = p;
        }
      }
      stars.push([x, yTop + R, z, 1.8]);
    } else {
      const cs = corners(x, z, w * sc, d * sc);
      const r1 = [x - w * sc / 2, yTop + 1.0, z], r2 = [x + w * sc / 2, yTop + 1.0, z];
      sky.seg(r1, r2, STAR, 1.0);
      for (const c2 of cs) sky.seg([c2[0], yTop, c2[1]], c2[0] < x ? r1 : r2, STAR, 1.0);
      stars.push([...r1, 1.4], [...r2, 1.4]);
    }
  }

  /* --------------------------------------------- catwalks hung from ropes -- */
  const catwalk = (A, B, y) => {
    const n = 9;
    for (let i = 0; i < n; i++) {
      const t0 = i / n, t1 = (i + 1) / n, tm = (t0 + t1) / 2;
      const sag = 0.35 * 4 * tm * (1 - tm);
      const ax = A[0] + (B[0] - A[0]) * tm, az = A[1] + (B[1] - A[1]) * tm;
      const ang = Math.atan2(B[1] - A[1], B[0] - A[0]);
      b.box(Math.hypot(B[0] - A[0], B[1] - A[1]) / n + 0.02, 0.03, 0.3, { x: ax, y: y - sag, z: az, ry: -ang, color: rng.pick([PLANK, '#a87b4a']), mat: M.wood });
    }
    const nx = -(B[1] - A[1]), nz = B[0] - A[0], nl = Math.hypot(nx, nz);
    for (const sgn of [-1, 1]) {
      const ox = (nx / nl) * 0.16 * sgn, oz = (nz / nl) * 0.16 * sgn;
      ropes.rope([A[0] + ox, y + 0.45, A[1] + oz], [B[0] + ox, y + 0.45, B[1] + oz], 0.35, '#7a5c3c', 12);
      ropes.rope([A[0] + ox, y, A[1] + oz], [B[0] + ox, y, B[1] + oz], 0.35, '#7a5c3c', 12);
    }
  };
  catwalk([-1.6, 0.9], [-4.3, 2.0], 0.26 + 3 * FH - 0.05);
  catwalk([2.0, 1.1], [4.2, 2.5], 0.26 + 4 * FH - 0.05);
  catwalk([-1.2, -2.0], [-3.2, -4.0], 0.26 + 3 * FH - 0.05);

  /* ------------------------------------------- yard: trestles, piles, fence -- */
  const free = (x, z, r) => sites.every((s) => Math.abs(x - s.x) > s.w / 2 + 0.6 + r || Math.abs(z - s.z) > s.d / 2 + 0.6 + r);
  const trestle = (x, z, ry) => {
    b.push({ x, y: 0.1, z, ry });
    for (const sx of [-0.35, 0.35]) {
      b.rod([sx, 0, -0.12], [sx, 0.42, 0], 0.02, { color: PLANK, mat: M.wood });
      b.rod([sx, 0, 0.12], [sx, 0.42, 0], 0.02, { color: PLANK, mat: M.wood });
    }
    b.box(0.9, 0.05, 0.08, { y: 0.42, color: '#a87b4a', mat: M.wood });
    b.box(1.1, 0.03, 0.24, { y: 0.47, ry: 0.1, color: '#c49a66', mat: M.wood });
    b.pop();
  };
  for (let i = 0, n = 0; i < 300 && n < 26; i++) {
    const [x, z] = rng.inDisc(9.2, 1);
    if (!free(x, z, 0.3)) continue;
    n++;
    const kind = n % 6;
    const ry = rng.range(0, Math.PI);
    if (kind === 0) trestle(x, z, ry);
    else if (kind === 1) { // bricks on a pallet
      b.box(0.6, 0.06, 0.5, { x, y: 0.1, z, ry, color: '#9a7a52', mat: M.wood });
      b.box(0.54, 0.3, 0.44, { x, y: 0.16, z, ry, color: BRICK });
    } else if (kind === 2) { // plank stack
      for (let k = 0; k < 5; k++) b.box(1.3, 0.04, 0.16, { x: x + Math.cos(ry + 1.57) * 0.17 * (k % 3), y: 0.1 + Math.floor(k / 3) * 0.045, z: z + Math.sin(ry + 1.57) * 0.17 * (k % 3), ry: -ry, color: rng.pick([PLANK, '#c49a66']), mat: M.wood });
    } else if (kind === 3) { // sand heap
      b.cone(0.55, 0.38, { x, y: 0.1, z, seg: 10, color: '#d8bf8a', mat: M.flat });
    } else if (kind === 4) { // cement mixer
      b.box(0.36, 0.2, 0.3, { x, y: 0.1, z, ry, color: '#e08a2e' });
      b.geo(new THREE.CylinderGeometry(0.1, 0.2, 0.36, 10), { x, y: 0.45, z, rz: 0.7, ry, color: '#e08a2e', mat: M.smooth });
    } else { // stack of steel rods / pipes
      for (let k = 0; k < 6; k++) b.cyl(0.04, 0.04, 1.4, { x: x + (k % 3) * 0.09, y: 0.14 + Math.floor(k / 3) * 0.08, z, rz: Math.PI / 2, ry, seg: 6, color: '#6f747c', mat: M.rough_metal });
    }
  }
  // the plank fence around the whole site, with sackcloth patches and a gate
  const FR = 10.0, NF = 120;
  for (let i = 0; i < NF; i++) {
    const a = (i / NF) * Math.PI * 2;
    if (Math.abs(Math.atan2(Math.sin(a - 0.6), Math.cos(a - 0.6))) < 0.12) continue; // gate
    const h = 0.75 + 0.18 * Math.sin(i * 2.7) + (rng.chance(0.1) ? 0.2 : 0);
    b.box(0.5, h, 0.04, { x: Math.cos(a) * FR, y: 0.1, z: Math.sin(a) * FR, ry: -a + Math.PI / 2, rz: rng.range(-0.04, 0.04), color: rng.pick([PLANK, '#a87b4a', '#9b6f42', '#c49a66']), mat: M.wood });
    if (i % 6 === 0) b.box(0.08, 1.0, 0.08, { x: Math.cos(a) * (FR + 0.06), y: 0.1, z: Math.sin(a) * (FR + 0.06), color: C.darkwood, mat: M.wood });
    if (rng.chance(0.12)) b.quad(0.9, 0.5, { x: Math.cos(a) * (FR - 0.04), y: 0.55, z: Math.sin(a) * (FR - 0.04), ry: -a - Math.PI / 2, mat: M.cloth, color: SACK });
  }
  // work lamps on poles: the only light on the site after sunset
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + 0.3, r = 8.8;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    b.cyl(0.03, 0.03, 1.6, { x, y: 0.1, z, seg: 4, color: C.darkwood, mat: M.wood });
    b.sphere(0.07, { x, y: 1.75, z, mat: M.glow, color: C.lamp, glow: 2.4 });
  }

  object.add(b.build());
  object.add(ropes.build());

  /* ----------------------------------------------------------- cranes -- */
  const cranes = [];
  const craneSpec = [
    { x: 2.6, z: 1.6, h: 10.2, jib: 6.2, ph: 0.4, sp: 0.05 },
    { x: -3.0, z: -2.2, h: 8.0, jib: 5.0, ph: 2.6, sp: -0.035 },
    { x: -2.7, z: 4.6, h: 6.6, jib: 4.2, ph: 4.0, sp: 0.045 },
  ];
  const YEL = '#e2b13c';
  const lattice = new Builder();
  for (const c of craneSpec) {
    // mast (static): 4 chords + zigzag lacing
    const m = 0.2;
    for (const [sx, sz] of [[-m, -m], [m, -m], [m, m], [-m, m]]) lattice.cyl(0.025, 0.025, c.h, { x: c.x + sx, y: 0.1, z: c.z + sz, seg: 4, color: YEL, mat: M.rough_metal });
    for (let y = 0.1, k = 0; y < c.h - 0.4; y += 0.4, k++) {
      const s = k % 2 ? 1 : -1;
      lattice.rod([c.x - m, y, c.z - m * s], [c.x - m, y + 0.4, c.z + m * s], 0.012, { color: YEL, mat: M.rough_metal });
      lattice.rod([c.x + m, y, c.z + m * s], [c.x + m, y + 0.4, c.z - m * s], 0.012, { color: YEL, mat: M.rough_metal });
      lattice.rod([c.x - m * s, y, c.z - m], [c.x + m * s, y + 0.4, c.z - m], 0.012, { color: YEL, mat: M.rough_metal });
      lattice.rod([c.x + m * s, y, c.z + m], [c.x - m * s, y + 0.4, c.z + m], 0.012, { color: YEL, mat: M.rough_metal });
    }
    lattice.box(0.8, 0.12, 0.8, { x: c.x, y: 0.1, z: c.z, color: CONC2 });
    // slewing top (animated)
    const tb = new Builder();
    tb.box(0.5, 0.35, 0.5, { y: 0, color: YEL, mat: M.smooth });
    tb.box(0.36, 0.3, 0.36, { x: 0.15, y: 0.35, z: 0, color: '#3d4655', mat: M.smooth }); // cab
    tb.quad(0.2, 0.14, { x: 0.15, y: 0.52, z: 0.185, mat: M.glow, color: C.lamp, glow: 1.6 });
    // jib: a triangular truss
    const L = c.jib, Lc = L * 0.32;
    const yb = 0.38, yt = 0.85;
    tb.rod([-Lc, yb, -0.12], [L, yb, -0.12], 0.025, { color: YEL, mat: M.rough_metal });
    tb.rod([-Lc, yb, 0.12], [L, yb, 0.12], 0.025, { color: YEL, mat: M.rough_metal });
    tb.rod([-Lc, yt, 0], [L - 0.3, yb + 0.12, 0], 0.025, { color: YEL, mat: M.rough_metal });
    for (let u = -Lc, k = 0; u < L - 0.3; u += 0.4, k++) {
      const yy = yt + ((u + Lc) / (L - 0.3 + Lc)) * (yb + 0.12 - yt);
      tb.rod([u, yb, k % 2 ? 0.12 : -0.12], [u + 0.2, yy, 0], 0.01, { color: YEL, mat: M.rough_metal });
    }
    tb.cyl(0.03, 0.03, 1.3, { y: 0.35, color: YEL, mat: M.rough_metal }); // peak
    tb.box(0.6, 0.45, 0.4, { x: -Lc + 0.25, y: yb - 0.4, color: CONC2 }); // counterweight
    const top = tb.build();
    const grp = new THREE.Group();
    grp.add(top);
    grp.position.set(c.x, c.h + 0.1, c.z);
    // trolley, cable and swinging load
    const hookY = c.h * 0.45;
    const tro = new Builder();
    tro.box(0.25, 0.08, 0.3, { y: 0.3, color: '#3d4655' });
    tro.box(0.08, 0.12, 0.08, { y: -hookY, color: '#2b2f36' });
    // load: a bundle of planks or a steel beam
    if (cranes.length % 2) tro.box(1.1, 0.12, 0.3, { y: -hookY - 0.42, color: PLANK, mat: M.wood });
    else tro.box(1.3, 0.12, 0.12, { y: -hookY - 0.42, color: '#c25b3a', mat: M.rough_metal });
    const trolley = tro.build();
    const cl = new Lines();
    cl.seg([0, 0.3, 0], [0, -hookY, 0], '#2b2f36');
    cl.seg([0, -hookY, 0], [-0.5, -hookY - 0.3, 0], '#2b2f36');
    cl.seg([0, -hookY, 0], [0.5, -hookY - 0.3, 0], '#2b2f36');
    trolley.add(cl.build());
    trolley.position.x = L * 0.6;
    grp.add(trolley);
    object.add(grp);
    cranes.push({ grp, trolley, c, L });
    // a red warning lamp at the jib tip, so the cranes are among the stars at night
    stars.push([c.x, c.h + 1.5, c.z, -1]);
  }
  object.add(lattice.build());

  /* ---------------------------------------------------------- the stars -- */
  const skyLines = sky.build(new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.5, toneMapped: false, depthWrite: false }));
  object.add(skyLines);
  const starPts = stars.filter((s) => s[3] > 0);
  const sGeo = new THREE.OctahedronGeometry(0.07, 0);
  const sMesh = new THREE.InstancedMesh(sGeo, new THREE.MeshBasicMaterial({ toneMapped: false }), starPts.length);
  const col = new THREE.Color();
  starPts.forEach((s, i) => {
    col.set(STAR).multiplyScalar(1.6 + s[3] * 0.6);
    if (rng.chance(0.15)) col.set('#ffe3b0').multiplyScalar(2.6);
    sMesh.setColorAt(i, col);
  });
  object.add(sMesh);
  const tw = starPts.map(() => [rng.range(0, 6.28), rng.range(0.6, 1.8)]);
  // a few loose stars scattered above the site, the rest of the sky the plan has not reached
  const loose = new THREE.InstancedMesh(sGeo, new THREE.MeshBasicMaterial({ color: new THREE.Color(STAR).multiplyScalar(1.6), toneMapped: false }), 70);
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < 70; i++) {
    const [x, z] = rng.inDisc(10);
    const y = rng.range(11, 20);
    m4.makeScale(0.6, 0.6, 0.6).setPosition(x, y, z);
    loose.setMatrixAt(i, m4);
  }
  object.add(loose);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), glowRed());
  function glowRed() { return new THREE.MeshBasicMaterial({ color: new THREE.Color('#ff4a3a').multiplyScalar(2.5), toneMapped: false }); }
  const tips = cranes.map((cr) => { const t = tip.clone(); cr.grp.add(t); t.position.set(cr.L, 0.45, 0); return t; });

  const sc = new THREE.Vector3(), q = new THREE.Quaternion(), pv = new THREE.Vector3();
  function update(t) {
    starPts.forEach((s, i) => {
      const k = (s[3] > 1 ? 1.6 : 1) * (0.75 + 0.35 * Math.sin(t * tw[i][1] + tw[i][0]));
      pv.set(s[0], s[1], s[2]);
      sc.setScalar(k);
      m4.compose(pv, q, sc);
      sMesh.setMatrixAt(i, m4);
    });
    sMesh.instanceMatrix.needsUpdate = true;
    for (const cr of cranes) {
      const { c } = cr;
      // slew slowly back and forth; trolley creeps along the jib; the load sways a little
      cr.grp.rotation.y = c.ph + Math.sin(t * c.sp * 2 + c.ph) * 1.4;
      cr.trolley.position.x = cr.L * (0.45 + 0.3 * Math.sin(t * 0.13 + c.ph));
      cr.trolley.rotation.x = 0.04 * Math.sin(t * 0.9 + c.ph);
    }
    tips.forEach((tp, i) => { tp.visible = Math.sin(t * 2.2 + i * 2) > -0.3; });
  }
  update(0);
  return { object, update };
}
