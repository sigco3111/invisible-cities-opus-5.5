// The stage: sky dome, the Khan's endless chessboard, plinths, layouts and the
// luminous thread of Marco's journey.
import * as THREE from 'three';
import { CITIES, CATEGORIES, CAT } from './data.js';

export const SPACING = 30;
export const PLINTH_R = 11;
export const PLINTH_H = 1.1;

/* -------------------------------------------------------------- SKY -- */

export function makeSky() {
  const uniforms = {
    uTime: { value: 0 },
    uZenith: { value: new THREE.Color('#0b1030') },
    uMid: { value: new THREE.Color('#3a2f5c') },
    uHorizon: { value: new THREE.Color('#e49a76') },
    uSunDir: { value: new THREE.Vector3(-0.6, 0.12, -0.7).normalize() },
    uSunColor: { value: new THREE.Color('#ffcf9a') },
    uStars: { value: 1.0 },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        vec4 p = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * p;
        gl_Position.z = gl_Position.w; // at infinity
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime, uStars;
      uniform vec3 uZenith, uMid, uHorizon, uSunDir, uSunColor;
      varying vec3 vDir;
      float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
      float noise(vec3 x) {
        vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
                   mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
      }
      void main() {
        vec3 d = normalize(vDir);
        float h = d.y;
        vec3 col = mix(uHorizon, uMid, smoothstep(-0.02, 0.22, h));
        col = mix(col, uZenith, smoothstep(0.18, 0.75, h));
        // below horizon: haze
        col = mix(col, uHorizon * 0.55, smoothstep(0.0, -0.25, h));
        // sun glow
        float s = max(dot(d, uSunDir), 0.0);
        col += uSunColor * (pow(s, 6.0) * 0.35 + pow(s, 64.0) * 0.8 + pow(s, 900.0) * 6.0);
        // faint clouds / nebula bands
        float n = noise(d * 3.0 + vec3(uTime * 0.004, 0.0, 0.0)) * 0.6 + noise(d * 7.0) * 0.4;
        col += vec3(0.55, 0.35, 0.6) * smoothstep(0.55, 0.9, n) * 0.08 * smoothstep(0.05, 0.4, h);
        // stars
        vec3 sd = d * 420.0;
        vec3 cell = floor(sd);
        float r = hash(cell);
        if (r > 0.9965) {
          vec3 c = cell + 0.5 + (vec3(hash(cell + 3.1), hash(cell + 7.7), hash(cell + 1.3)) - 0.5) * 0.6;
          float dd = length(sd - c);
          float tw = 0.65 + 0.35 * sin(uTime * (1.0 + r * 40.0) + r * 100.0);
          float star = smoothstep(0.42, 0.0, dd) * tw * (r - 0.9965) / 0.0035;
          col += vec3(1.0, 0.92, 0.85) * star * 1.6 * smoothstep(0.04, 0.35, h) * uStars;
        }
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(5000, 48, 24), mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = -10;
  return { mesh, uniforms };
}

/* ------------------------------------------------------------ FLOOR -- */

function checkerTexture() {
  const N = 512;
  const cv = document.createElement('canvas');
  cv.width = cv.height = N;
  const g = cv.getContext('2d');
  const half = N / 2;
  const tiles = [['#2a2125', '#4a3b33'], ['#4a3b33', '#2a2125']];
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
    g.fillStyle = tiles[i][j];
    g.fillRect(i * half, j * half, half, half);
    // wood grain
    const dark = tiles[i][j] === '#2a2125';
    for (let k = 0; k < 140; k++) {
      g.strokeStyle = dark ? `rgba(0,0,0,${0.05 + Math.random() * 0.08})` : `rgba(255,220,180,${0.02 + Math.random() * 0.05})`;
      g.lineWidth = 0.5 + Math.random() * 2;
      g.beginPath();
      const y = j * half + Math.random() * half;
      const vertical = (i + j) % 2 === 0;
      if (vertical) {
        const x = i * half + Math.random() * half;
        g.moveTo(x, j * half);
        g.bezierCurveTo(x + Math.random() * 10 - 5, j * half + half * 0.3, x + Math.random() * 10 - 5, j * half + half * 0.6, x + Math.random() * 6 - 3, j * half + half);
      } else {
        g.moveTo(i * half, y);
        g.bezierCurveTo(i * half + half * 0.3, y + Math.random() * 10 - 5, i * half + half * 0.6, y + Math.random() * 10 - 5, i * half + half, y + Math.random() * 6 - 3);
      }
      g.stroke();
    }
  }
  // inlay lines
  g.strokeStyle = 'rgba(214,170,100,0.35)';
  g.lineWidth = 2;
  g.strokeRect(1, 1, N - 2, N - 2);
  g.beginPath(); g.moveTo(half, 0); g.lineTo(half, N); g.moveTo(0, half); g.lineTo(N, half); g.stroke();
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  return tex;
}

export function makeFloor() {
  const size = 6000;
  const tex = checkerTexture();
  tex.repeat.set(size / (SPACING * 2), size / (SPACING * 2));
  tex.offset.set(0.25, 0.25); // align tile centres with city grid
  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.82, metalness: 0.0 });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  return mesh;
}

/* ---------------------------------------------------------- PLINTHS -- */

const plinthStone = new THREE.MeshStandardMaterial({ color: '#3b3036', roughness: 0.6, metalness: 0.15 });
const plinthTop = new THREE.MeshStandardMaterial({ color: '#cbb894', roughness: 0.9 });
const plinthGeo = (() => {
  const pts = [
    [PLINTH_R + 0.6, 0], [PLINTH_R + 0.6, 0.18], [PLINTH_R + 0.25, 0.3], [PLINTH_R + 0.25, PLINTH_H - 0.25],
    [PLINTH_R + 0.45, PLINTH_H - 0.12], [PLINTH_R + 0.45, PLINTH_H], [0, PLINTH_H],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  return new THREE.LatheGeometry(pts, 96);
})();

export function makePlinth(city) {
  const cat = CAT[city.cat];
  const g = new THREE.Group();
  const body = new THREE.Mesh(plinthGeo, plinthStone);
  body.receiveShadow = true;
  body.castShadow = true;
  g.add(body);
  const top = new THREE.Mesh(new THREE.CircleGeometry(PLINTH_R + 0.3, 96), plinthTop);
  top.rotation.x = -Math.PI / 2;
  top.position.y = PLINTH_H + 0.005;
  top.receiveShadow = true;
  g.add(top);
  // glowing ring in category colour
  const ringMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(cat.color).multiplyScalar(1.6), toneMapped: false, transparent: true, opacity: 0.85 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(PLINTH_R + 0.46, 0.05, 6, 160), ringMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = PLINTH_H - 0.06;
  g.add(ring);
  // number marks: n small studs
  for (let i = 0; i < city.n; i++) {
    const a = Math.PI / 2 + (i - (city.n - 1) / 2) * 0.05;
    const stud = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), ringMat);
    stud.position.set(Math.cos(a) * (PLINTH_R + 0.3), 0.6, Math.sin(a) * (PLINTH_R + 0.3));
    g.add(stud);
  }
  // invisible hit volume
  const hit = new THREE.Mesh(new THREE.CylinderGeometry(PLINTH_R + 0.6, PLINTH_R + 0.6, 14, 16), new THREE.MeshBasicMaterial({ visible: false }));
  hit.position.y = 7;
  hit.userData.cityId = city.id;
  g.add(hit);
  return { group: g, ringMat, hit, baseColor: new THREE.Color(cat.color) };
}

/* ---------------------------------------------------------- LAYOUTS -- */

function spiralPositions() {
  const out = [];
  const gapR = SPACING * 1.05; // distance between turns
  const b = gapR / (2 * Math.PI);
  let theta = (SPACING * 2.2) / b; // start radius ≈ 2.2·spacing (room for Venice)
  for (let i = 0; i < CITIES.length; i++) {
    const r = b * theta;
    out.push(new THREE.Vector3(Math.cos(theta) * r, 0, Math.sin(theta) * r));
    theta += (SPACING * 1.08) / r;
  }
  return out;
}

export const LAYOUTS = {
  atlas: {
    label: '도시 지도',
    hint: '열한 갈래, 각 다섯 도시',
    positions: CITIES.map((c) => new THREE.Vector3((CAT[c.cat].index - 5) * SPACING, 0, (c.n - 3) * SPACING)),
    overview: { pos: [0, 175, 235], target: [0, 0, 8] },
  },
  journey: {
    label: '여정',
    hint: '마르코가 이야기한 순서',
    positions: spiralPositions(),
    overview: { pos: [0, 260, 300], target: [0, 0, 0] },
  },
  chapters: {
    label: '장별 보기',
    hint: '책 속의 아홉 장',
    positions: CITIES.map((c) => {
      const size = c.chapter === 0 || c.chapter === 8 ? 10 : 5;
      return new THREE.Vector3((c.inChapter - (size - 1) / 2) * SPACING, 0, (c.chapter - 4) * SPACING);
    }),
    overview: { pos: [0, 230, 230], target: [0, 0, 10] },
  },
};

/* ------------------------------------------------------ JOURNEY LINE -- */

export function makeThread() {
  const uniforms = {
    uTime: { value: 0 },
    uOpacity: { value: 1 },
    uColor: { value: new THREE.Color('#ffd28a') },
    uLen: { value: 1 },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    toneMapped: false,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uTime, uOpacity, uLen;
      uniform vec3 uColor;
      varying vec2 vUv;
      void main() {
        float across = 1.0 - abs(vUv.y - 0.5) * 2.0;
        float core = smoothstep(0.0, 0.6, across);
        float s = vUv.x * uLen;              // world units along path
        float pulse = pow(fract(s / 60.0 - uTime * 0.12), 12.0);
        float dash = 0.55 + 0.45 * smoothstep(0.3, 0.5, abs(fract(s / 2.0) - 0.5) * 2.0);
        float a = core * (0.28 * dash + pulse * 1.4) * uOpacity;
        gl_FragColor = vec4(uColor * (0.9 + pulse * 2.5), a);
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.BufferGeometry(), mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = 2;

  function update(points) {
    // route between plinths along the floor: points are plinth centres
    const pts = points.map((p) => new THREE.Vector3(p.x, 0.06, p.z));
    const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal', 0.5);
    const N = pts.length * 24;
    const width = 0.9;
    const pos = new Float32Array((N + 1) * 2 * 3);
    const uv = new Float32Array((N + 1) * 2 * 2);
    const idx = [];
    const len = curve.getLength();
    const tmp = new THREE.Vector3(), tan = new THREE.Vector3(), side = new THREE.Vector3();
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      curve.getPointAt(t, tmp);
      curve.getTangentAt(t, tan);
      side.set(-tan.z, 0, tan.x).normalize().multiplyScalar(width / 2);
      pos.set([tmp.x + side.x, tmp.y, tmp.z + side.z, tmp.x - side.x, tmp.y, tmp.z - side.z], i * 6);
      uv.set([t, 0, t, 1], i * 4);
      if (i < N) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    g.setIndex(idx);
    mesh.geometry.dispose();
    mesh.geometry = g;
    uniforms.uLen.value = len;
  }
  return { mesh, uniforms, update };
}

/* ------------------------------------------------------------- DUST -- */

export function makeDust(count = 1400) {
  const g = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 400;
    pos[i * 3 + 1] = Math.random() * 60;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 400;
    seed[i] = Math.random();
  }
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('seed', new THREE.BufferAttribute(seed, 1));
  const uniforms = { uTime: { value: 0 }, uCenter: { value: new THREE.Vector3() }, uPx: { value: 1 } };
  const mat = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      attribute float seed;
      uniform float uTime, uPx;
      uniform vec3 uCenter;
      varying float vA;
      void main() {
        vec3 p = position;
        p.x += sin(uTime * 0.05 + seed * 30.0) * 6.0 + uTime * 0.6;
        p.z += cos(uTime * 0.04 + seed * 20.0) * 6.0;
        p.y += sin(uTime * 0.3 + seed * 10.0) * 0.8;
        // wrap around centre
        p.xz = uCenter.xz + mod(p.xz - uCenter.xz + 200.0, 400.0) - 200.0;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uPx * (1.0 + seed * 2.0) * (60.0 / -mv.z);
        vA = (0.35 + 0.65 * sin(uTime * (0.5 + seed) + seed * 40.0) * 0.5 + 0.5) * smoothstep(400.0, 40.0, -mv.z);
      }`,
    fragmentShader: /* glsl */ `
      varying float vA;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d) * vA * 0.5;
        gl_FragColor = vec4(1.0, 0.85, 0.6, a);
      }`,
  });
  const pts = new THREE.Points(g, mat);
  pts.frustumCulled = false;
  return { mesh: pts, uniforms };
}

export { CATEGORIES };
