// MAROZIA — the city of the rat, and the city of the swallow hidden inside it.
// A low, dark, crowded warren of soot-brick blocks, vaulted tunnels and hunched
// figures; rats run its alleys. Now and then, somewhere, the roofs part like a
// pair of shutters: light pours out, a white city of slender towers glimmers
// below, and a flock of swallows wheels up into the sky — then the moment
// passes, the birds dive home and the crack closes again.
import { THREE, Builder, M, C, glowMat } from '../kit.js';

const BRICK = ['#57463f', '#4a3f3c', '#634f44', '#6d5446', '#524341', '#463c40', '#70563f', '#5a4a48'];
const ROOF = ['#363133', '#3f383a', '#312d30', '#4a4041'];
const CYCLE = 15; // seconds per opening
const SITES = [
  { x: -3.6, z: 2.4, w: 2.8, d: 1.9, ry: 0.35 },
  { x: 3.7, z: 0.9, w: 2.6, d: 1.8, ry: -0.25 },
  { x: -0.6, z: -4.1, w: 2.8, d: 1.9, ry: 0.1 },
];
const ROOF_H = 1.55;

const smooth = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));

function swallowGeometry() {
  // a flat swallow, nose toward +z: body diamond, swept wings, forked tail
  const v = [
    // body
    0, 0, 0.16, 0.035, 0, 0.0, 0, 0.0, -0.1,
    0, 0, 0.16, 0, 0.0, -0.1, -0.035, 0, 0.0,
    // right wing (swept back)
    0.02, 0, 0.05, 0.3, 0, -0.08, 0.025, 0, -0.02,
    0.025, 0, -0.02, 0.3, 0, -0.08, 0.22, 0, -0.1,
    // left wing
    -0.02, 0, 0.05, -0.025, 0, -0.02, -0.3, 0, -0.08,
    -0.025, 0, -0.02, -0.22, 0, -0.1, -0.3, 0, -0.08,
    // forked tail
    0, 0, -0.08, 0.05, 0, -0.24, 0.015, 0, -0.1,
    0, 0, -0.08, -0.015, 0, -0.1, -0.05, 0, -0.24,
  ];
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
  g.computeVertexNormals();
  return g;
}

/** half-cylinder vault, axis along local z (before ry), centred, springing from y */
function halfCyl(b, r, len, o = {}) {
  const g = new THREE.CylinderGeometry(r, r, len, o.seg ?? 10, 1, o.open ?? true, Math.PI / 2, Math.PI);
  g.rotateX(Math.PI / 2);
  return b.geo(g, o);
}

/** inside(x,z) test for a rotated rectangle */
function inRect(s, x, z, pad = 0) {
  const dx = x - s.x, dz = z - s.z;
  const c = Math.cos(s.ry), sn = Math.sin(s.ry);
  const lx = dx * c - dz * sn, lz = dx * sn + dz * c;
  return Math.abs(lx) < s.w / 2 + pad && Math.abs(lz) < s.d / 2 + pad;
}

export default function build({ rng, accent }) {
  const object = new THREE.Group();
  const b = new Builder();

  // the ground: trodden, dark, with gutters
  b.cyl(10.4, 10.5, 0.1, { color: '#3a3330', seg: 64 });

  // ── alleys: a ring lane and three radial lanes; the warren crowds around them
  const RING = 6.0;
  const RADIALS = [1.07, 3.3, 5.2];
  const nearAlley = (x, z, pad) => {
    const r = Math.hypot(x, z);
    if (Math.abs(r - RING) < 0.42 + pad) return true;
    const a = Math.atan2(z, x);
    for (const ra of RADIALS) {
      const d = Math.abs(((a - ra + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
      if (d < Math.PI / 2 && Math.sin(d) * r < 0.38 + pad && r > 1.2) return true;
    }
    return false;
  };

  // ── the warren: packed low blocks on a jittered grid
  const step = 0.88;
  for (let gx = -11; gx <= 11; gx++) {
    for (let gz = -11; gz <= 11; gz++) {
      const x = gx * step + rng.range(-0.12, 0.12), z = gz * step + rng.range(-0.12, 0.12);
      const r = Math.hypot(x, z);
      if (r > 9.9) continue;
      if (nearAlley(x, z, 0.4)) continue;
      if (SITES.some((s) => inRect(s, x, z, 0.35))) continue;
      if (r < 1.0) continue; // the cistern court at the centre
      const w = step * rng.range(0.78, 1.02), d = step * rng.range(0.78, 1.02);
      // lower toward the rim, a little higher in the middle
      const h = rng.range(0.55, 1.25) + Math.max(0, 1 - r / 9) * rng.range(0.1, 0.9);
      const ry = rng.range(-0.1, 0.1);
      b.box(w, h, d, { x, z, ry, y: 0.1, color: rng.pick(BRICK) });
      const k = rng();
      if (k < 0.45) {
        b.box(w + 0.06, 0.07, d + 0.06, { x, z, ry, y: 0.1 + h, color: rng.pick(ROOF) });
      } else if (k < 0.8) {
        b.box(w + 0.1, 0.06, d + 0.12, { x, z, ry, y: 0.1 + h, rx: rng.sign() * 0.22, color: rng.pick(ROOF) });
      } else {
        // a little vaulted roof
        halfCyl(b, Math.min(w, d) * 0.5, w, { x, z, y: 0.1 + h, ry: ry + Math.PI / 2, open: false, seg: 8, color: rng.pick(ROOF) });
      }
      if (rng.chance(0.35)) b.box(0.1, 0.3, 0.1, { x: x + rng.range(-0.25, 0.25), z: z + rng.range(-0.25, 0.25), y: 0.1 + h, color: '#2b2626' });
      // tiny window slits: most dark, a very few with dull red light
      if (rng.chance(0.5)) {
        const lit = rng.chance(0.12);
        const face = rng.int(0, 3), ang = face * Math.PI / 2 + ry;
        const off = (face % 2 === 0 ? d : w) / 2 + 0.012;
        b.quad(0.1, 0.14, { x: x + Math.sin(ang) * off, y: 0.1 + h * 0.55, z: z + Math.cos(ang) * off, ry: ang, mat: lit ? M.glow : M.smooth, color: lit ? '#d9733f' : '#1d1a1b', glow: 1.2 });
      }
    }
  }

  // a few crooked soot stacks and a tall tenement or two break the low skyline
  for (let i = 0; i < 7; i++) {
    let x, z;
    do { [x, z] = rng.inDisc(8.8, 2); } while (nearAlley(x, z, 0.5) || SITES.some((s) => inRect(s, x, z, 0.8)));
    const h = rng.range(2.4, 4.2);
    b.box(0.5, h, 0.5, { x, z, y: 0.1, ry: rng.range(0, 1), color: rng.pick(BRICK) });
    b.cyl(0.13, 0.17, 1.2, { x: x + 0.1, z, y: 0.1 + h, color: '#2b2626', seg: 8, rz: rng.range(-0.12, 0.12) });
    b.cyl(0.19, 0.15, 0.12, { x: x + 0.1, z, y: 1.3 + h, color: '#1f1c1c', seg: 8 });
  }

  // ── vaulted tunnels over long stretches of the ring lane and radial lanes
  for (let i = 0; i < 64; i++) {
    const a = (i / 64) * Math.PI * 2;
    // covered except a few open stretches
    const open = Math.sin(a * 3 + 0.7) > 0.55;
    if (open) continue;
    const x = Math.cos(a) * RING, z = Math.sin(a) * RING;
    const len = 2 * RING * Math.sin(Math.PI / 64) + 0.03;
    halfCyl(b, 0.47, len, { x, z, y: 0.1, ry: -a, color: rng.pick(['#4d3f39', '#45383a', '#56463e']), mat: M.cloth });
    // a rib every few segments
    if (i % 3 === 0) b.torus(0.49, 0.045, { x, z, y: 0.1, ry: -a, arc: Math.PI, color: '#2e2828', tseg: 10, rseg: 4 });
  }
  for (const ra of RADIALS) {
    for (let rr = 1.6; rr < 9.6; rr += 0.5) {
      if (Math.abs(rr - RING) < 0.6) continue;
      if (ra === 1.07) continue; // the main lane stays open to the sky
      const x = Math.cos(ra) * rr, z = Math.sin(ra) * rr;
      halfCyl(b, 0.42, 0.52, { x, z, y: 0.1, ry: Math.PI / 2 - ra, color: rng.pick(['#4d3f39', '#45383a', '#56463e']), mat: M.cloth });
    }
  }
  // gaps in the tunnels get a couple of lanterns
  for (let i = 0; i < 10; i++) {
    const a = rng.range(0, Math.PI * 2);
    b.sphere(0.05, { x: Math.cos(a) * (RING + 0.5), y: 0.75, z: Math.sin(a) * (RING + 0.5), mat: M.glow, color: '#e08a4a', glow: 1.6, seg: 6 });
  }

  // ── the cistern court at the centre, with a crowd pushing round it
  b.cyl(0.55, 0.6, 0.35, { y: 0.1, color: '#4a3f3a', seg: 14 });
  b.cyl(0.46, 0.46, 0.02, { y: 0.44, color: '#1e2226', seg: 14 });
  const hunched = (x, z, ry, s = 1) => {
    b.push({ x, z, y: 0.1, ry });
    b.push({ rx: 0.6 });
    b.cone(0.07 * s, 0.24 * s, { color: rng.pick(['#2c2729', '#3a3133', '#4a3c38', '#33302f']), seg: 6 });
    b.sphere(0.045 * s, { y: 0.24 * s, z: 0.02, color: '#8f7a6a', seg: 6 });
    b.cone(0.04 * s, 0.06 * s, { y: 0.27 * s, z: 0.02, color: '#2a2526', seg: 5 });
    b.pop();
    b.pop();
  };
  for (let i = 0; i < 14; i++) {
    const a = rng.range(0, Math.PI * 2), r = rng.range(0.7, 0.95);
    hunched(Math.cos(a) * r, Math.sin(a) * r, -a + Math.PI / 2 + rng.range(-0.5, 0.5));
  }
  // crowds jostling in the open stretches of the lanes
  for (let i = 0; i < 70; i++) {
    let x, z;
    if (rng.chance(0.55)) {
      const a = rng.range(0, Math.PI * 2), r = RING + rng.range(-0.25, 0.25);
      x = Math.cos(a) * r; z = Math.sin(a) * r;
    } else {
      const ra = rng.pick(RADIALS), rr = rng.range(1.4, 9.6);
      x = Math.cos(ra) * rr + rng.range(-0.2, 0.2); z = Math.sin(ra) * rr + rng.range(-0.2, 0.2);
    }
    hunched(x, z, rng.range(0, Math.PI * 2), rng.range(0.9, 1.15));
  }

  // ── the crack sites: rim, hidden white city, lids, shaft of light
  const sites = [];
  for (const s of SITES) {
    const sg = new THREE.Group();
    sg.position.set(s.x, 0, s.z);
    sg.rotation.y = s.ry;
    object.add(sg);
    // the rim walls around the site, and the inner floor of light (static, merged into the city)
    b.push({ x: s.x, z: s.z, ry: s.ry });
    for (const [px, pz, ww, dd] of [[0, s.d / 2 + 0.08, s.w + 0.32, 0.16], [0, -s.d / 2 - 0.08, s.w + 0.32, 0.16], [s.w / 2 + 0.08, 0, 0.16, s.d], [-s.w / 2 - 0.08, 0, 0.16, s.d]]) {
      b.box(ww, ROOF_H, dd, { x: px, z: pz, y: 0.1, color: '#40353a' });
    }
    b.box(s.w, 0.04, s.d, { y: 0.1, mat: M.glow, color: '#ffe9c2', glow: 0.9 });
    b.pop();

    // the white city of swallows: towers that rise through the opened crack
    const tw = new Builder();
    const towers = [];
    for (let i = 0; i < 9; i++) {
      const tx = (i % 3 - 1) * s.w * 0.3 + rng.range(-0.15, 0.15), tz = (Math.floor(i / 3) - 1) * s.d * 0.28 + rng.range(-0.1, 0.1);
      const th = rng.range(1.6, 3.4) * (i === 4 ? 1.35 : 1);
      const tr = rng.range(0.1, 0.16);
      tw.cyl(tr, tr * 1.1, th, { x: tx, z: tz, color: '#f6f1e6', mat: M.smooth, seg: 10 });
      tw.cone(tr * 1.3, tr * 3.2, { x: tx, z: tz, y: th, color: i % 2 ? '#bcd8ec' : '#f3e2b5', mat: M.smooth, seg: 10 });
      // little arched windows lit gold
      for (let k = 0; k < 3; k++) tw.quad(0.05, 0.1, { x: tx, y: th * (0.4 + k * 0.18), z: tz + tr + 0.01, mat: M.glow, color: '#fff0c8', glow: 2 });
      // a swallow-tail pennant
      tw.box(0.01, 0.3, 0.01, { x: tx, z: tz, y: th + tr * 3.1, color: '#d8c79a' });
      tw.box(0.14, 0.06, 0.005, { x: tx + 0.07, z: tz, y: th + tr * 3.1 + 0.22, color: accent, mat: M.smooth });
      towers.push(th);
    }
    // airy bridges between towers
    tw.box(s.w * 0.6, 0.04, 0.08, { y: 1.2, color: '#efe6d6', mat: M.smooth });
    tw.box(0.08, 0.04, s.d * 0.56, { y: 1.5, color: '#efe6d6', mat: M.smooth });
    const towerG = tw.build({ shadows: false });
    sg.add(towerG);

    // the two roof lids, hinged at the long edges
    const lids = [];
    for (const side of [-1, 1]) {
      const hinge = new THREE.Group();
      hinge.position.set(0, ROOF_H + 0.1, side * s.d / 2);
      sg.add(hinge);
      const lb = new Builder();
      // underside: pale (lit when open); top: dark tiles + clutter like the rest
      lb.box(s.w + 0.1, 0.06, s.d / 2 + 0.02, { z: -side * (s.d / 4), y: -0.06, color: '#d9cdb8', mat: M.smooth });
      lb.box(s.w + 0.14, 0.08, s.d / 2 + 0.05, { z: -side * (s.d / 4), y: 0.0, color: rng.pick(ROOF) });
      for (let k = 0; k < 6; k++) {
        lb.box(rng.range(0.2, 0.5), rng.range(0.08, 0.3), rng.range(0.2, 0.4), { x: rng.range(-s.w / 2 + 0.3, s.w / 2 - 0.3), y: 0.08, z: -side * rng.range(0.2, s.d / 2 - 0.2), color: rng.pick(BRICK) });
      }
      lb.box(0.1, 0.35, 0.1, { x: rng.range(-1, 1), y: 0.08, z: -side * 0.5, color: '#2b2626' });
      const lid = lb.build();
      hinge.add(lid);
      lids.push({ hinge, side });
    }

    // the shaft of light: additive, fading upward via vertex colours
    const sh = new THREE.CylinderGeometry(0.66, 0.5, 9, 4, 6, true);
    sh.rotateY(Math.PI / 4);
    sh.translate(0, 4.5 + ROOF_H, 0);
    sh.scale(s.w * 0.75, 1, s.d * 0.75);
    const col = new Float32Array(sh.attributes.position.count * 3);
    for (let i = 0; i < sh.attributes.position.count; i++) {
      const y = sh.attributes.position.getY(i);
      const f = Math.pow(Math.max(0, 1 - (y - ROOF_H) / 9), 2.2);
      col[i * 3] = 1.0 * f; col[i * 3 + 1] = 0.9 * f; col[i * 3 + 2] = 0.7 * f;
    }
    sh.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const shaft = new THREE.Mesh(sh, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
    sg.add(shaft);

    // the crack itself: a hair of light along the seam, always there
    const seam = new THREE.Mesh(new THREE.BoxGeometry(s.w + 0.1, 0.03, 0.05), glowMat('#ffe2a8', 3));
    seam.position.y = ROOF_H + 0.1 + 0.095;
    sg.add(seam);

    sites.push({ s, sg, lids, towerG, shaft, seam });
  }

  object.add(b.build());

  // ── swallows (one instanced flock, reused by whichever crack is open)
  const NBIRD = 46;
  const birds = new THREE.InstancedMesh(swallowGeometry(), new THREE.MeshBasicMaterial({ color: new THREE.Color('#e9f1ff').multiplyScalar(1.25), side: THREE.DoubleSide, toneMapped: false }), NBIRD);
  birds.frustumCulled = false;
  object.add(birds);
  const bird = [];
  for (let i = 0; i < NBIRD; i++) bird.push({ ph: rng(), r: rng.range(0.8, 1.25), h: rng.range(0.7, 1.2), w: rng.range(0.9, 1.3), del: rng.range(0, 0.18), flap: rng.range(9, 13), dir: rng.chance(0.85) ? 1 : -1 });

  // ── rats running the lanes
  const NRAT = 26;
  const ratG = new THREE.SphereGeometry(1, 7, 5);
  ratG.scale(0.05, 0.04, 0.1);
  ratG.translate(0, 0.14, 0);
  const rats = new THREE.InstancedMesh(ratG, new THREE.MeshStandardMaterial({ color: '#5b5350', roughness: 0.9 }), NRAT);
  rats.castShadow = true;
  object.add(rats);
  const rat = [];
  for (let i = 0; i < NRAT; i++) rat.push({ lane: i < 16 ? -1 : rng.int(0, 2), off: rng(), sp: rng.range(0.05, 0.11) * rng.sign(), side: rng.range(-0.22, 0.22) });

  const _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _e = new THREE.Euler();
  const ZERO = new THREE.Matrix4().makeScale(0, 0, 0);

  function update(t) {
    const cyc = Math.floor(t / CYCLE);
    const lt = (t - cyc * CYCLE) / CYCLE; // 0..1 within this opening
    const active = ((cyc % 3) + 3) % 3;
    // opening envelope: closed → open (0.12..0.26) → hold → close (0.78..0.92)
    const open = smooth((lt - 0.12) / 0.14) * (1 - smooth((lt - 0.78) / 0.14));
    for (let i = 0; i < sites.length; i++) {
      const S = sites[i];
      const o = i === active ? open : 0;
      for (const L of S.lids) L.hinge.rotation.x = L.side * o * 1.95;
      const rise = smooth((o - 0.3) / 0.7);
      S.towerG.scale.y = 0.42 + 0.58 * rise;
      S.towerG.visible = o > 0.001;
      S.shaft.material.opacity = 0.3 * o;
      S.shaft.visible = o > 0.001;
      S.seam.visible = o < 0.03;
      S.seam.scale.y = 1 + 2 * o;
    }
    // the flock: leaves with the light, wheels upward, returns before the crack shuts
    const site = sites[active].s;
    const ft0 = 0.2, ft1 = 0.84;
    for (let i = 0; i < NBIRD; i++) {
      const B = bird[i];
      let u = (lt - ft0 - B.del) / (ft1 - ft0 - 0.18);
      if (u <= 0 || u >= 1) { birds.setMatrixAt(i, ZERO); continue; }
      const env = Math.sin(Math.PI * u);
      const ang = B.ph * Math.PI * 2 + B.dir * u * Math.PI * 2 * 1.6 * B.w;
      const rad = (0.3 + 3.6 * Math.pow(env, 0.7)) * B.r;
      const y = ROOF_H + 0.2 + 6.2 * Math.pow(env, 0.85) * B.h + Math.sin(u * 20 + B.ph * 9) * 0.2 * env;
      _p.set(site.x + Math.cos(ang) * rad, y, site.z + Math.sin(ang) * rad);
      // heading: tangent of the circle, pitched with the climb
      // nose (+z) along the tangent of the circle, pitched with the climb, banked inward
      const climb = Math.cos(Math.PI * u) * 0.6;
      _e.set(-climb, B.dir > 0 ? -ang : Math.PI - ang, B.dir * 0.45, 'YXZ');
      _q.setFromEuler(_e);
      const flap = 0.55 + 0.45 * Math.abs(Math.sin(t * B.flap + B.ph * 20));
      const sc = 1.1 * Math.min(1, u * 8, (1 - u) * 8);
      _s.set(sc * flap, sc, sc);
      _m.compose(_p, _q, _s);
      birds.setMatrixAt(i, _m);
    }
    birds.instanceMatrix.needsUpdate = true;

    // rats
    for (let i = 0; i < NRAT; i++) {
      const R = rat[i];
      const u = R.off + t * R.sp;
      if (R.lane < 0) {
        const a = u * Math.PI * 2 * (5 / RING);
        const rr = RING + R.side;
        _p.set(Math.cos(a) * rr, 0, Math.sin(a) * rr);
        _e.set(0, R.sp > 0 ? -a : Math.PI - a, 0);
      } else {
        const ra = RADIALS[R.lane];
        const f = ((u % 1) + 1) % 1;
        const tri = f < 0.5 ? f * 2 : 2 - f * 2; // back and forth
        const rr = 1.5 + tri * 8;
        _p.set(Math.cos(ra) * rr - Math.sin(ra) * R.side, 0, Math.sin(ra) * rr + Math.cos(ra) * R.side);
        _e.set(0, (f < 0.5 ? 0 : Math.PI) + Math.PI / 2 - ra, 0);
      }
      // little scurrying hops
      _p.y = Math.abs(Math.sin(t * 14 + i)) * 0.025;
      _q.setFromEuler(_e);
      _s.set(1, 1, 1);
      _m.compose(_p, _q, _s);
      rats.setMatrixAt(i, _m);
    }
    rats.instanceMatrix.needsUpdate = true;
  }
  update(0);
  return { object, update };
}
