// Zobeide — men of many nations dreamed the same dream: a woman running at night
// through an unknown city, seen from behind, her long hair loose. Each lost her. Waking,
// they built the city of the dream, each laying a street along the path of his pursuit
// and closing walls where she had escaped, so she could not escape again. She never came.
// Here the city is a night-coloured labyrinth; and still, through it, she runs — and vanishes.
import { THREE, Builder, M, C, Lines, glowMat } from '../kit.js';

export default function build({ rng, accent }) {
  const b = new Builder();
  const object = new THREE.Group();

  /* --------------------------------------------------------------- the maze */
  const CELL = 1.3, N = 15, HALF = (N - 1) / 2;
  const cx = (i) => (i - HALF) * CELL, cz = (j) => (j - HALF) * CELL;
  const inside = (i, j) => i >= 0 && j >= 0 && i < N && j < N && Math.hypot(cx(i), cz(j)) < 9.3;
  const id = (i, j) => j * N + i;
  const open = new Set(); // passages "a|b"
  const pk = (a, c) => (a < c ? `${a}|${c}` : `${c}|${a}`);
  const seen = new Set();
  const start = [HALF, HALF];
  const stack = [start];
  seen.add(id(...start));
  while (stack.length) {
    const [i, j] = stack[stack.length - 1];
    const nb = rng.shuffle([[1, 0], [-1, 0], [0, 1], [0, -1]]).map(([di, dj]) => [i + di, j + dj]).filter(([a, c]) => inside(a, c) && !seen.has(id(a, c)));
    if (!nb.length) { stack.pop(); continue; }
    const [a, c] = nb[0];
    open.add(pk(id(i, j), id(a, c)));
    seen.add(id(a, c));
    stack.push([a, c]);
  }
  // a few extra openings so the labyrinth loops a little (pursuits crossing)
  for (let k = 0; k < 14; k++) {
    const i = rng.int(1, N - 2), j = rng.int(1, N - 2);
    if (!inside(i, j) || !inside(i + 1, j)) continue;
    open.add(pk(id(i, j), id(i + 1, j)));
  }
  const isOpen = (i, j, a, c) => open.has(pk(id(i, j), id(a, c)));

  /* --------------------------------------------------------- ground and walls */
  b.cyl(10.45, 10.5, 0.1, { color: '#2b2c3d', mat: M.stone, seg: 64 });
  // cobbles of the corridors: slightly lighter, worn
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    if (!inside(i, j)) continue;
    b.box(CELL - 0.18, 0.02, CELL - 0.18, { x: cx(i), y: 0.1, z: cz(j), ry: rng.range(-0.04, 0.04), color: rng.pick(['#6a6d92', '#64678a', '#706c8c']), mat: M.smooth });
  }
  const WALLS = ['#4a4862', '#3f4258', '#544a5e', '#47505e', '#5a5466', '#3c3a4f', '#4d4458'];
  const T = 0.24;
  const deadEnds = [];
  const wallSeg = (x, z, along, len, h, col) => {
    // a stretch of wall: sometimes a bare wall, sometimes a house front, sometimes a bricked-up arch
    const ry = along === 'x' ? 0 : Math.PI / 2;
    const kind = rng();
    b.box(len + T, h, T, { x, y: 0.1, z, ry, color: col });
    b.box(len + T + 0.02, 0.05, T + 0.04, { x, y: 0.1 + h, z, ry, color: '#a9b0dc', mat: M.smooth }); // moonlit coping
    if (kind < 0.18) {
      // a bricked-up arch: the wall closed where she escaped
      b.geo(new THREE.CircleGeometry(0.28, 12, 0, Math.PI), { x: x + (along === 'z' ? T / 2 + 0.01 : 0), y: 0.1 + 0.6, z: z + (along === 'x' ? T / 2 + 0.01 : 0), ry: along === 'x' ? 0 : Math.PI / 2, color: '#6b5e6e', mat: M.flat });
      b.box(along === 'x' ? 0.56 : 0.02, 0.6, along === 'x' ? 0.02 : 0.56, { x: x + (along === 'z' ? T / 2 + 0.005 : 0), y: 0.1, z: z + (along === 'x' ? T / 2 + 0.005 : 0), color: '#6b5e6e', mat: M.flat });
      // the patched bricks
      for (let k = 0; k < 6; k++) b.box(along === 'x' ? 0.14 : 0.03, 0.06, along === 'x' ? 0.03 : 0.14, { x: x + (along === 'z' ? T / 2 + 0.012 : rng.range(-0.2, 0.2)), y: 0.2 + k * 0.12, z: z + (along === 'x' ? T / 2 + 0.012 : rng.range(-0.2, 0.2)), color: '#7a6a72', mat: M.smooth });
    } else if (kind < 0.34) {
      // a crooked house built onto the wall
      const hh = h + rng.range(0.3, 1.0);
      b.box(len * 0.8, hh, 0.6, { x: x + (along === 'z' ? rng.sign() * 0.15 : 0), y: 0.1, z: z + (along === 'x' ? rng.sign() * 0.15 : 0), ry: ry + rng.range(-0.08, 0.08), color: rng.pick(WALLS) });
      b.geo(new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1).rotateY(Math.PI / 4).translate(0, 0.5, 0), { x, y: 0.1 + hh, z, ry: ry + rng.range(-0.15, 0.15), sx: len * 0.85, sz: 0.7, sy: rng.range(0.3, 0.7), rz: rng.range(-0.1, 0.1), color: rng.pick(['#2e2a3a', '#3a2e34', '#4a3a40']), mat: M.flat });
      if (rng.chance(0.45)) {
        for (const s of [-1, 1]) b.quad(0.12, 0.18, { x: x + (along === 'z' ? s * 0.315 : rng.range(-0.2, 0.2)), y: 0.1 + hh * 0.65, z: z + (along === 'x' ? s * 0.315 : rng.range(-0.2, 0.2)), ry: along === 'x' ? (s > 0 ? 0 : Math.PI) : (s > 0 ? Math.PI / 2 : -Math.PI / 2), color: rng.chance(0.6) ? '#ffcf7a' : '#c6d06a', mat: M.glow, glow: 1.3 });
      }
    } else if (kind < 0.42) {
      // an outside stair climbing nowhere along the wall
      for (let k = 0; k < 6; k++) b.box(along === 'x' ? 0.16 : 0.3, 0.12 * (k + 1), along === 'x' ? 0.3 : 0.16, { x: x + (along === 'x' ? -len / 2 + 0.1 + k * 0.16 : T / 2 + 0.15), y: 0.1, z: z + (along === 'z' ? -len / 2 + 0.1 + k * 0.16 : T / 2 + 0.15), color: '#5c566a' });
    }
    // crude crenels and broken copings
    if (rng.chance(0.3)) b.box(len * 0.35, 0.18, T + 0.04, { x, y: 0.1 + h, z, ry, color: '#5c566a' });
  };
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    if (!inside(i, j)) continue;
    let links = 0;
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (inside(i + di, j + dj) && isOpen(i, j, i + di, j + dj)) links++;
    if (links === 1) deadEnds.push([i, j]);
    const h = () => rng.range(0.45, 1.0) + (Math.hypot(cx(i), cz(j)) < 3 ? 0.3 : 0);
    // east edge
    if (!(inside(i + 1, j) && isOpen(i, j, i + 1, j))) wallSeg(cx(i) + CELL / 2, cz(j), 'z', CELL, h(), rng.pick(WALLS));
    // south edge
    if (!(inside(i, j + 1) && isOpen(i, j, i, j + 1))) wallSeg(cx(i), cz(j) + CELL / 2, 'x', CELL, h(), rng.pick(WALLS));
    // west / north edges only on the boundary
    if (!inside(i - 1, j)) wallSeg(cx(i) - CELL / 2, cz(j), 'z', CELL, h() + 0.4, rng.pick(WALLS));
    if (!inside(i, j - 1)) wallSeg(cx(i), cz(j) - CELL / 2, 'x', CELL, h() + 0.4, rng.pick(WALLS));
  }
  // posts at wall junctions
  for (let j = 0; j <= N; j++) for (let i = 0; i <= N; i++) {
    const x = (i - HALF - 0.5) * CELL, z = (j - HALF - 0.5) * CELL;
    if (Math.hypot(x, z) > 9.6 || !rng.chance(0.35)) continue;
    b.box(0.3, rng.range(0.8, 1.6), 0.3, { x, y: 0.1, z, color: '#5c566a' });
  }
  // arches thrown over the streets, and a watchtower of the dreamers at the centre
  for (let k = 0; k < 12; k++) {
    const i = rng.int(1, N - 2), j = rng.int(1, N - 2);
    if (!inside(i, j) || !inside(i + 1, j) || !isOpen(i, j, i + 1, j)) continue;
    b.box(0.5, 0.22, CELL, { x: cx(i) + CELL / 2, y: 1.25, z: cz(j), color: '#4f4a60' });
  }
  {
    const x = cx(HALF), z = cz(HALF);
    b.box(0.7, 5.4, 0.7, { x: x + CELL / 2, y: 0.1, z: z + CELL / 2, color: '#47445a' });
    b.box(1.1, 0.2, 1.1, { x: x + CELL / 2, y: 5.5, z: z + CELL / 2, color: '#5c566a' });
    for (let k = 0; k < 4; k++) b.box(0.18, 0.4, 0.18, { x: x + CELL / 2 + (k % 2 ? 0.45 : -0.45), y: 5.7, z: z + CELL / 2 + (k < 2 ? 0.45 : -0.45), color: '#5c566a' });
    b.quad(0.14, 0.24, { x: x + CELL / 2, y: 4.6, z: z + CELL / 2 + 0.36, color: '#ffcf7a', mat: M.glow, glow: 1.6 });
    // a dreamer up there, looking out
    b.cone(0.08, 0.28, { x: x + CELL / 2 + 0.2, y: 5.7, z: z + CELL / 2, color: '#1e1c28', seg: 6 });
    b.sphere(0.05, { x: x + CELL / 2 + 0.2, y: 6.02, z: z + CELL / 2, color: '#b08a6a', seg: 6 });
  }
  // the dreamers: men of many nations waiting at the dead ends
  const hats = (x, y, z, k) => {
    if (k === 0) b.cyl(0.08, 0.08, 0.06, { x, y, z, color: '#1b1b22', seg: 8 }); // bowler-ish
    else if (k === 1) b.sphere(0.075, { x, y: y + 0.02, z, sy: 0.6, color: '#d9d0bf', seg: 8 }); // turban
    else if (k === 2) b.cyl(0.04, 0.05, 0.08, { x, y, z, color: '#8a2a2a', seg: 8 }); // fez
    else b.cone(0.11, 0.07, { x, y, z, color: '#6a5a3a', seg: 8 }); // straw
  };
  for (const [i, j] of rng.shuffle(deadEnds.slice()).slice(0, 22)) {
    const x = cx(i) + rng.range(-0.2, 0.2), z = cz(j) + rng.range(-0.2, 0.2);
    b.cone(0.085, 0.3, { x, y: 0.1, z, color: rng.pick(['#1e1c28', '#2a2632', '#33303c', '#3a2e34']), seg: 6 });
    b.sphere(0.05, { x, y: 0.44, z, color: '#a88a6a', seg: 6 });
    hats(x, 0.49, z, rng.int(0, 3));
  }
  // a few sickly street lamps
  for (let k = 0; k < 14; k++) {
    const i = rng.int(0, N - 1), j = rng.int(0, N - 1);
    if (!inside(i, j)) continue;
    const x = cx(i) + CELL * 0.32, z = cz(j) + CELL * 0.32;
    b.cyl(0.02, 0.02, 1.0, { x, y: 0.1, z, color: '#1e1c28', seg: 4 });
    b.sphere(0.05, { x, y: 1.12, z, color: '#d8e08a', mat: M.glow, glow: 2.2, seg: 6 });
  }

  /* ---------------------------------- her route: the longest pursuit in the maze */
  const bfs = (si, sj) => {
    const dist = new Map(), prev = new Map();
    const q = [[si, sj]]; dist.set(id(si, sj), 0);
    let last = [si, sj];
    while (q.length) {
      const [i, j] = q.shift(); last = [i, j];
      for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const a = i + di, c = j + dj;
        if (!inside(a, c) || !isOpen(i, j, a, c) || dist.has(id(a, c))) continue;
        dist.set(id(a, c), dist.get(id(i, j)) + 1); prev.set(id(a, c), [i, j]); q.push([a, c]);
      }
    }
    return { last, prev };
  };
  const A = bfs(HALF, HALF).last;
  const { last: B, prev } = bfs(A[0], A[1]);
  const route = [];
  for (let p = B; p; p = prev.get(id(p[0], p[1]))) route.push(new THREE.Vector3(cx(p[0]), 0.1, cz(p[1])));
  // her pursuit: a stretch of the longest path, about half a minute of running
  if (route.length > 24) { const m0 = Math.floor((route.length - 24) / 2); route.splice(0, m0); route.length = 24; }
  // round the corners a little: a running line, not a grid walk
  const curve = new THREE.CatmullRomCurve3(route, false, 'centripetal', 0.2);
  const LEN = curve.getLength();
  // the pale glowing memory of her path, drawn on the cobbles
  const NT = Math.ceil(LEN / 0.14);
  for (let k = 0; k < NT; k += 2) {
    const p = curve.getPointAt(k / NT), q = curve.getPointAt(Math.min(1, (k + 1) / NT));
    b.rod([p.x, 0.14, p.z], [q.x, 0.14, q.z], 0.03, { mat: M.glow, color: '#9fb6ff', glow: 1.4, seg: 4 });
  }
  object.add(b.build());

  /* -------------------------------------------------------- the running woman */
  const herMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#cfdcff').multiplyScalar(1.15), transparent: true, opacity: 0.8, toneMapped: false, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  const her = new THREE.Group();
  const body = new THREE.Group();
  her.add(body);
  const S = 2.1;
  {
    const dress = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.36, 12, 1, true).translate(0, 0.18, 0), herMat);
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, 0.16, 8).translate(0, 0.42, 0), herMat);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8).translate(0, 0.55, 0), herMat);
    body.add(dress, torso, head);
  }
  // long loose hair: ribbons streaming behind, rippling
  const hairPos = [];
  const HAIR = 5, HS = 8;
  const hairGeo = new THREE.BufferGeometry();
  const hp = new Float32Array(HAIR * HS * 2 * 3);
  const idx = [];
  for (let h = 0; h < HAIR; h++) for (let k = 0; k < HS - 1; k++) {
    const a = (h * HS + k) * 2;
    idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  hairGeo.setAttribute('position', new THREE.BufferAttribute(hp, 3));
  hairGeo.setIndex(idx);
  const hair = new THREE.Mesh(hairGeo, herMat);
  hair.frustumCulled = false;
  body.add(hair);
  // arms swinging
  const armGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.16, 5).translate(0, -0.08, 0);
  const armL = new THREE.Mesh(armGeo, herMat), armR = new THREE.Mesh(armGeo, herMat);
  armL.position.set(0.055, 0.48, 0); armR.position.set(-0.055, 0.48, 0);
  body.add(armL, armR);
  body.scale.setScalar(S);
  object.add(her);
  void hairPos;
  // a soft light that runs with her
  const halo = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), glowMat('#cfe0ff', 3.5));
  halo.position.y = 1.85;
  her.add(halo);
  // a soft aura that rises above the walls
  const auraMat = new THREE.MeshBasicMaterial({ color: '#8fa8ff', transparent: true, opacity: 0.22, toneMapped: false, depthWrite: false, blending: THREE.AdditiveBlending });
  const aura = new THREE.Mesh(new THREE.SphereGeometry(0.55, 14, 10), auraMat);
  aura.position.y = 1.1;
  aura.scale.y = 1.6;
  her.add(aura);
  // her afterimages: motes left behind, fading
  const NM = 40;
  const motes = new THREE.InstancedMesh(new THREE.SphereGeometry(0.035, 6, 4), new THREE.MeshBasicMaterial({ color: new THREE.Color('#b8c8ff').multiplyScalar(1.6), toneMapped: false, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending }), NM);
  motes.frustumCulled = false;
  object.add(motes);

  const _p = new THREE.Vector3(), _t = new THREE.Vector3(), _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _s = new THREE.Vector3();
  const RUN = LEN / 1.0; // seconds for one pursuit
  const CYCLE = RUN + 3; // then a pause: she has vanished
  return {
    object,
    update(t) {
      const c = t % CYCLE;
      const u = Math.min(1, c / RUN);
      curve.getPointAt(u, _p);
      curve.getTangentAt(u, _t);
      her.position.copy(_p);
      her.rotation.y = Math.atan2(_t.x, _t.z);
      // she appears, runs, and at the closed end dissolves
      const fadeIn = Math.min(1, c / 1.5), fadeOut = 1 - Math.min(1, Math.max(0, (c - RUN + 1.2) / 1.6));
      const vis = fadeIn * fadeOut;
      herMat.opacity = 0.8 * vis;
      halo.visible = vis > 0.05;
      auraMat.opacity = 0.22 * vis;
      her.visible = vis > 0.01;
      const stride = t * 12;
      body.position.y = Math.abs(Math.sin(stride)) * 0.04;
      body.rotation.x = 0.18;
      armL.rotation.x = Math.sin(stride) * 0.9;
      armR.rotation.x = -Math.sin(stride) * 0.9;
      // hair streams back (local -z), rippling
      let o = 0;
      for (let h = 0; h < HAIR; h++) {
        const sx = (h - (HAIR - 1) / 2) * 0.016;
        for (let k = 0; k < HS; k++) {
          const f = k / (HS - 1);
          const wave = Math.sin(t * 7 - f * 5 + h) * 0.03 * f;
          const y = 0.56 - f * 0.12 + Math.sin(t * 5 + h * 0.7 - f * 3) * 0.02 * f;
          const z = -0.03 - f * 0.5;
          hp[o++] = sx + wave - 0.012; hp[o++] = y; hp[o++] = z;
          hp[o++] = sx + wave + 0.012; hp[o++] = y - 0.01; hp[o++] = z;
        }
      }
      hairGeo.attributes.position.needsUpdate = true;
      // afterimages along the route behind her
      for (let i = 0; i < NM; i++) {
        const back = (i + 1) * 0.0045;
        const uu = u - back;
        if (uu < 0 || vis < 0.01) { motes.setMatrixAt(i, _m.makeScale(0, 0, 0)); continue; }
        curve.getPointAt(uu, _p);
        const k = (1 - i / NM) * vis;
        _p.y = 0.25 + Math.sin(t * 2 + i) * 0.05 + i * 0.008;
        _q.identity();
        motes.setMatrixAt(i, _m.compose(_p, _q, _s.set(k, k, k)));
      }
      motes.instanceMatrix.needsUpdate = true;
    },
  };
}
