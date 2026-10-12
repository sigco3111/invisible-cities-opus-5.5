import '@fontsource/noto-serif-kr/400.css';
import { displayName, INTRO_KO } from './locale-ko.js';
import '@fontsource/cormorant-garamond/400.css';
import '@fontsource/cormorant-garamond/400-italic.css';
import '@fontsource/cormorant-garamond/600.css';
import '@fontsource/im-fell-english/400.css';
import '@fontsource/im-fell-english/400-italic.css';

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { CITIES, CITY, CAT, CATEGORIES, INTERLUDES, ROMAN } from './data.js';
import { rng, M } from './kit.js';
import { makeSky, makeFloor, makePlinth, makeThread, makeDust, LAYOUTS, PLINTH_H } from './world.js';
import { makeComposer } from './post.js';
import { makePavilion } from './pavilion.js';
import { loadBuilder, hasBuilder } from './cities/index.js';
import { fallback } from './cities/_fallback.js';
import { Sound } from './audio.js';
import { initUI } from './ui.js';

const params = new URLSearchParams(location.search);
const SOLO = params.get('solo');
const NO_AO = params.has('noao');

/* ------------------------------------------------------------ SETUP -- */

const canvas = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: !!SOLO });
let PR = Math.min(window.devicePixelRatio, SOLO ? 1.5 : 2);
renderer.setPixelRatio(PR);
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

const scene = new THREE.Scene();
const FOG = new THREE.Color('#5a4560');
scene.fog = new THREE.FogExp2(FOG, 0.0019);

const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.5, 12000);
camera.position.set(0, 220, 320);

const labelRenderer = new CSS2DRenderer({ element: document.getElementById('labels') });
labelRenderer.setSize(innerWidth, innerHeight);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.maxPolarAngle = Math.PI * 0.47;
controls.minDistance = 6;
controls.maxDistance = 900;
controls.zoomSpeed = 0.8;
controls.autoRotateSpeed = 0.35;

const sky = makeSky();
scene.add(sky.mesh);
const floor = makeFloor();
scene.add(floor);

const hemi = new THREE.HemisphereLight('#cfc6f0', '#6b4f3c', 0.75);
scene.add(hemi);
const sun = new THREE.DirectionalLight('#ffd2a1', 3.2);
const SUN_DIR = new THREE.Vector3(-0.8, 0.5, -0.38).normalize();
sun.castShadow = true;
sun.shadow.mapSize.set(4096, 4096);
sun.shadow.bias = -0.0004;
sun.shadow.normalBias = 0.04;
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 900;
scene.add(sun, sun.target);
const fill = new THREE.DirectionalLight('#8fa2ff', 0.55);
fill.position.set(0.7, 0.5, 0.8).multiplyScalar(100);
scene.add(fill);
sky.uniforms.uSunDir.value.copy(SUN_DIR).setY(0.08).normalize();

/* dusk ↔ night */
const MOODS = {
  dusk: { zenith: '#0b1030', mid: '#3a2f5c', horizon: '#e49a76', sunSky: '#ffcf9a', sun: '#ffd2a1', sunI: 3.2, hemiSky: '#cfc6f0', hemiGround: '#6b4f3c', hemiI: 0.75, fog: '#5a4560', glow: 1, stars: 1, fill: 0.55, floor: 1 },
  night: { zenith: '#02030b', mid: '#0a0d26', horizon: '#2b3260', sunSky: '#aebfff', sun: '#a9b8ff', sunI: 0.9, hemiSky: '#6c78c0', hemiGround: '#251c2a', hemiI: 0.42, fog: '#161830', glow: 1.7, stars: 1.8, fill: 0.25, floor: 0.6 },
};
const moodState = { k: 0, target: 0 };
const _ca = new THREE.Color(), _cb = new THREE.Color();
function mix(a, b, k, out) { return out.copy(_ca.set(a)).lerp(_cb.set(b), k); }
function applyMood(k) {
  const A = MOODS.dusk, B = MOODS.night, L = (a, b) => a + (b - a) * k;
  mix(A.zenith, B.zenith, k, sky.uniforms.uZenith.value);
  mix(A.mid, B.mid, k, sky.uniforms.uMid.value);
  mix(A.horizon, B.horizon, k, sky.uniforms.uHorizon.value);
  mix(A.sunSky, B.sunSky, k, sky.uniforms.uSunColor.value);
  sky.uniforms.uStars.value = L(A.stars, B.stars);
  mix(A.sun, B.sun, k, sun.color);
  sun.intensity = L(A.sunI, B.sunI);
  mix(A.hemiSky, B.hemiSky, k, hemi.color);
  mix(A.hemiGround, B.hemiGround, k, hemi.groundColor);
  hemi.intensity = L(A.hemiI, B.hemiI);
  fill.intensity = L(A.fill, B.fill);
  mix(A.fog, B.fog, k, scene.fog.color);
  M.glow.color.setScalar(L(A.glow, B.glow));
  floor.material.color.setScalar(L(A.floor, B.floor));
}
function toggleNight() {
  moodState.target = moodState.target ? 0 : 1;
  document.getElementById('btn-night')?.classList.toggle('on', !!moodState.target);
  sound.chime(moodState.target ? 0 : 4);
}

const dust = makeDust();
scene.add(dust.mesh);
const thread = makeThread();
scene.add(thread.mesh);

const post = makeComposer(renderer, scene, camera);
post.resize(innerWidth, innerHeight, PR);

/* ----------------------------------------------------------- CITIES -- */

const entries = []; // index = reading order
const hitTargets = [];
let layout = 'atlas';

for (const city of CITIES) {
  const holder = new THREE.Group();
  holder.name = city.id;
  const plinth = makePlinth(city);
  holder.add(plinth.group);
  const stage = new THREE.Group(); // city sits on the plinth
  stage.position.y = PLINTH_H;
  holder.add(stage);
  holder.position.copy(LAYOUTS[layout].positions[city.order]);
  scene.add(holder);
  hitTargets.push(plinth.hit);

  const el = document.createElement('div');
  el.className = 'label';
  el.innerHTML = `<span class="g" style="color:${CAT[city.cat].color}">${CAT[city.cat].glyph}</span><span class="n">${displayName(city)}</span>`;
  el.addEventListener('click', () => focusCity(city.order));
  const label = new CSS2DObject(el);
  label.position.set(0, 14, 0);
  holder.add(label);

  entries.push({
    city, holder, stage, plinth, label, el,
    object: null, update: null, height: 10, radius: 10,
    sphere: new THREE.Sphere(), from: new THREE.Vector3(), to: holder.position.clone(),
    dim: 0, dimTarget: 0,
  });
}

/* captions on the board: category heads (atlas), chapter heads (chapters) */
const captions = [];
function caption(html, pos, layoutName, cls = '') {
  const el = document.createElement('div');
  el.className = `caption ${cls}`;
  el.innerHTML = html;
  const o = new CSS2DObject(el);
  o.position.copy(pos);
  scene.add(o);
  captions.push({ el, layout: layoutName });
}
CATEGORIES.forEach((c, i) => {
  caption(`<b style="color:${c.color}">${c.glyph}</b>${c.name.replace('Cities & ', 'Cities &amp;<br>').replace(/^(Thin|Trading|Continuous|Hidden) /, '$1<br>')}`,
    new THREE.Vector3((i - 5) * 30, 0, 2 * 30 + 19), 'atlas', 'col');
});
for (let n = 1; n <= 5; n++) caption(`${n}`, new THREE.Vector3(-5 * 30 - 22, 0, (n - 3) * 30), 'atlas', 'row');
ROMAN.forEach((r, ch) => {
  const size = ch === 0 || ch === 8 ? 10 : 5;
  caption(`<small>장</small>${r}`, new THREE.Vector3(-(size / 2) * 30 - 8, 0, (ch - 4) * 30), 'chapters', 'row ch');
});
function updateCaptions() {
  const show = state.mode === 'overview' || state.mode === 'intro';
  captions.forEach((c) => c.el.classList.toggle('off', !(show && c.layout === layout)));
}

/* The Khan's pavilion: Marco and Kublai at the chessboard, at the head of every layout */
const pavilion = makePavilion(rng('pavilion'));
const pavHolder = new THREE.Group();
pavHolder.add(pavilion.object);
scene.add(pavHolder);
function pavilionSpot(name) {
  let minZ = Infinity;
  LAYOUTS[name].positions.forEach((p) => { minZ = Math.min(minZ, p.z); });
  return new THREE.Vector3(0, 0, minZ - (name === 'journey' ? 62 : 52));
}
pavHolder.position.copy(pavilionSpot('atlas'));
const pavFrom = new THREE.Vector3(), pavTo = pavHolder.position.clone();
{
  const hit = new THREE.Mesh(new THREE.CylinderGeometry(16, 16, 16, 12), new THREE.MeshBasicMaterial({ visible: false }));
  hit.position.y = 8;
  hit.userData.cityId = 'pavilion';
  pavHolder.add(hit);
  hitTargets.push(hit);
  const el = document.createElement('div');
  el.className = 'label venice pav';
  el.innerHTML = `<span class="n">쿠빌라이 칸과 마르코 폴로</span>`;
  el.addEventListener('click', () => visitPavilion());
  const lab = new CSS2DObject(el);
  lab.position.set(0, 19, 0);
  pavHolder.add(lab);
  pavilion.el = el;
}
let ilIndex = 0;
function browseInterlude(i) {
  ilIndex = (i + INTERLUDES.length) % INTERLUDES.length;
  const il = INTERLUDES[ilIndex];
  const kicker = il.after < 0 ? '서문' : il.after === 8 ? '맺음말' : `${ROMAN[il.after]}장 뒤의 대화`;
  ui.showInterlude(kicker, il.title, il.text, null, 0, { prev: () => browseInterlude(ilIndex - 1), next: () => browseInterlude(ilIndex + 1), pos: `${ilIndex + 1} / ${INTERLUDES.length}` });
}
function visitPavilion() {
  if (tour.active) stopTour();
  state.mode = 'focus';
  state.focus = -1;
  ui.hidePanel();
  const p = pavHolder.position;
  flyTo(new THREE.Vector3(p.x + 14, 13, p.z + 26), new THREE.Vector3(p.x, 3.5, p.z), 3);
  updateLabelVisibility();
  sound.interlude();
  setTimeout(() => browseInterlude(0), 1600);
}

/* Venice: the city Marco never names — rises at the centre of the Journey spiral */
const venice = { holder: new THREE.Group(), object: null, update: null, k: 0, hit: null };
venice.holder.visible = false;
scene.add(venice.holder);
async function buildVenice() {
  if (!hasBuilder('venice')) return;
  const build = await loadBuilder('venice');
  try {
    const res = build({ rng: rng('venice'), city: { id: 'venice', name: 'Venice' }, accent: '#f0d9a0', THREE });
    venice.object = res.object;
    venice.update = res.update || null;
    venice.holder.add(res.object);
    const hit = new THREE.Mesh(new THREE.CylinderGeometry(24, 24, 20, 16), new THREE.MeshBasicMaterial({ visible: false }));
    hit.position.y = 10;
    hit.userData.cityId = 'venice';
    venice.holder.add(hit);
    venice.hit = hit;
    hitTargets.push(hit);
    const el = document.createElement('div');
    el.className = 'label venice';
    el.innerHTML = `<span class="g">✧</span><span class="n">베네치아</span>`;
    el.addEventListener('click', () => visitVenice());
    const label = new CSS2DObject(el);
    label.position.set(0, 30, 0);
    venice.holder.add(label);
    venice.el = el;
  } catch (err) {
    console.error('Venice failed', err);
  }
}
function stepVenice(t, dt) {
  if (!venice.object) return;
  const want = layout === 'journey' ? 1 : 0;
  venice.k += (want - venice.k) * Math.min(1, dt * 1.2);
  venice.holder.visible = venice.k > 0.01;
  venice.holder.scale.set(1, Math.max(0.001, venice.k), 1);
  venice.holder.position.y = (venice.k - 1) * 4;
  if (venice.hit) venice.hit.visible = venice.k > 0.5; // raycast ignores invisible? (material invisible anyway)
  if (venice.el) venice.el.classList.toggle('off', venice.k < 0.5 || state.mode === 'focus');
  if (venice.holder.visible && venice.update) venice.update(t, dt);
}
function visitVenice() {
  if (tour.active) stopTour();
  state.mode = 'focus';
  state.focus = -1;
  ui.hidePanel();
  const tgt = new THREE.Vector3(0, 6, 0);
  flyTo(new THREE.Vector3(38, 34, 52), tgt, 3);
  updateLabelVisibility();
  setTimeout(() => showInterlude(5), 1800);
}

async function buildCity(e) {
  const build = await loadBuilder(e.city.id);
  let res;
  try {
    res = build({ rng: rng(e.city.id), city: e.city, accent: CAT[e.city.cat].color, THREE });
  } catch (err) {
    console.error(`Building ${e.city.id} failed`, err);
    res = fallback({ rng: rng(e.city.id), city: e.city, accent: CAT[e.city.cat].color });
  }
  e.object = res.object;
  e.update = res.update || null;
  e.stage.add(res.object);
  const box = new THREE.Box3().setFromObject(res.object);
  e.height = Math.max(4, box.max.y);
  e.radius = Math.max(8, Math.hypot(box.max.x - box.min.x, box.max.z - box.min.z) / 2);
  e.label.position.y = PLINTH_H + Math.min(e.height, 30) + 2.5;
}

/* --------------------------------------------------------- LAYOUTS -- */

let layoutAnim = null;
function threadPoints() { return entries.map((e) => e.holder.position); }

function setLayout(name, { animate = true, fly = true } = {}) {
  if (!LAYOUTS[name]) return;
  layout = name;
  const L = LAYOUTS[name];
  entries.forEach((e) => { e.from.copy(e.holder.position); e.to.copy(L.positions[e.city.order]); });
  pavFrom.copy(pavHolder.position); pavTo.copy(pavilionSpot(name));
  layoutAnim = animate ? { t0: clock.elapsedTime, dur: 3.2 } : null;
  if (!animate) entries.forEach((e) => e.holder.position.copy(e.to));
  thread.update(threadPoints());
  ui.setLayout(name);
  sound.chime(2);
  if (fly) {
    if (state.mode === 'focus') {
      const e = entries[state.focus];
      const off = camera.position.clone().sub(controls.target);
      const tgt = e.to.clone().add(new THREE.Vector3(0, PLINTH_H + e.height * 0.32, 0));
      flyTo(tgt.clone().add(off), tgt, 3.2);
    } else {
      flyTo(...overviewPose(name), 3.2);
    }
  }
}

function stepLayout() {
  if (!layoutAnim) return;
  const k = (clock.elapsedTime - layoutAnim.t0) / layoutAnim.dur;
  entries.forEach((e) => {
    const stagger = (e.city.order / CITIES.length) * 0.35;
    let t = THREE.MathUtils.clamp((k - stagger) / 0.65, 0, 1);
    t = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    e.holder.position.lerpVectors(e.from, e.to, t);
    e.holder.position.y = Math.sin(Math.PI * t) * 6;
  });
  {
    let t = THREE.MathUtils.clamp(k, 0, 1);
    t = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    pavHolder.position.lerpVectors(pavFrom, pavTo, t);
  }
  thread.update(threadPoints());
  if (k >= 1) layoutAnim = null;
}

/* ---------------------------------------------------------- CAMERA -- */

// frame the whole layout, whatever the window's aspect
function overviewPose(name) {
  const box = new THREE.Box3();
  LAYOUTS[name].positions.forEach((p) => box.expandByPoint(p));
  if (name === 'journey') box.expandByPoint(new THREE.Vector3(0, 0, 0));
  box.expandByScalar(14);
  const c = box.getCenter(new THREE.Vector3());
  const half = box.getSize(new THREE.Vector3()).multiplyScalar(0.5);
  const elev = name === 'journey' ? 0.95 : 0.7;
  const target = c.clone();
  const dir = new THREE.Vector3(0, Math.sin(elev), Math.cos(elev));
  const corners = [];
  for (const x of [box.min.x, box.max.x]) for (const z of [box.min.z, box.max.z]) for (const y of [0, 16]) corners.push(new THREE.Vector3(x, y, z));
  const cam = camera.clone();
  let d = 100, pos;
  for (let k = 0; k < 80; k++) {
    pos = target.clone().addScaledVector(dir, d);
    cam.position.copy(pos);
    cam.lookAt(target);
    cam.updateMatrixWorld();
    const ok = corners.every((p) => { const q = p.clone().project(cam); return Math.abs(q.x) < (camera.aspect < 1 ? 1.6 : 0.93) && q.y < 0.8 && q.y > -0.8; });
    if (ok) break;
    d *= 1.05;
  }
  return [pos, target];
}

let flight = null;
function flyTo(pos, target, dur = 2.6, onDone) {
  const p0 = camera.position.clone(), t0 = controls.target.clone();
  const dist = p0.distanceTo(pos);
  flight = { p0, t0, p1: pos.clone(), t1: target.clone(), start: clock.elapsedTime, dur, lift: Math.min(dist * 0.18, 60), onDone };
  controls.autoRotate = false;
}
function stepFlight() {
  if (!flight) return;
  let k = (clock.elapsedTime - flight.start) / flight.dur;
  if (k >= 1) k = 1;
  const t = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
  camera.position.lerpVectors(flight.p0, flight.p1, t);
  camera.position.y += Math.sin(Math.PI * t) * flight.lift;
  controls.target.lerpVectors(flight.t0, flight.t1, t);
  if (k >= 1) {
    const cb = flight.onDone;
    flight = null;
    if (state.mode === 'focus' && !state.userDriving) controls.autoRotate = true;
    cb && cb();
  }
}

function focusPose(e, azimuth) {
  const p = e.to.clone();
  const h = Math.min(e.height, 30);
  const tgt = p.clone().add(new THREE.Vector3(0, PLINTH_H + h * (h > 12 ? 0.42 : 0.3), 0));
  const dist = THREE.MathUtils.clamp(Math.max(e.radius * 2.6, h * 2.3), 28, 80) * (camera.aspect < 1 ? 1.7 : 1);
  const elev = h > 14 ? 0.3 : 0.42;
  const pos = tgt.clone().add(new THREE.Vector3(Math.sin(azimuth) * Math.cos(elev), Math.sin(elev), Math.cos(azimuth) * Math.cos(elev)).multiplyScalar(dist));
  return { pos, tgt };
}

/* ------------------------------------------------------------ STATE -- */

const state = { mode: SOLO ? 'solo' : 'intro', focus: -1, filter: null, userDriving: false, idleT: 0, hover: -1 };
const sound = new Sound();

function focusCity(i, { fromTour = false } = {}) {
  i = (i + CITIES.length) % CITIES.length;
  const e = entries[i];
  if (!fromTour && tour.active) stopTour();
  state.mode = 'focus';
  state.focus = i;
  // keep a pleasant azimuth: approach from the camera's side
  const dir = camera.position.clone().sub(e.to);
  let az = Math.atan2(dir.x, dir.z);
  if (!isFinite(az)) az = 0.6;
  const { pos, tgt } = focusPose(e, az);
  flyTo(pos, tgt, fromTour ? 3.4 : 2.6);
  ui.showCity(e.city);
  sound.enterCity(e.city);
  history.replaceState(null, '', `#${e.city.id}`);
  updateLabelVisibility();
}

function overview() {
  if (tour.active) stopTour();
  state.mode = 'overview';
  state.focus = -1;
  ui.hidePanel();
  const L = LAYOUTS[layout];
  flyTo(...overviewPose(layout), 2.8);
  history.replaceState(null, '', location.pathname + location.search);
  updateLabelVisibility();
}

function setFilter(cat) {
  state.filter = state.filter === cat ? null : cat;
  ui.setFilter(state.filter);
  entries.forEach((e) => { e.dimTarget = state.filter && e.city.cat !== state.filter ? 1 : 0; });
  updateLabelVisibility();
  if (state.filter) sound.chime(CAT[state.filter].index);
}

function updateLabelVisibility() {
  document.body.classList.toggle('focused', state.mode === 'focus');
  entries.forEach((e, i) => {
    const show = state.mode === 'focus' ? i === state.focus : true;
    e.el.classList.toggle('off', !show);
    e.el.classList.toggle('dim', !!state.filter && e.city.cat !== state.filter);
    e.el.classList.toggle('current', i === state.focus);
  });
}

/* ------------------------------------------------------------- TOUR -- */

const tour = { active: false, timer: null, waiting: false };

function readingTime(city) { return Math.max(16, city.text.length / (city.lang === 'ko' ? 9 : 17)) * 1000; }

function startTour() {
  tour.active = true;
  ui.setTour(true);
  const start = state.mode === 'focus' ? state.focus : -1;
  if (start < 0) showInterlude(-1, () => tourGo(0));
  else tourGo(start);
}
function tourGo(i) {
  if (!tour.active) return;
  if (i >= CITIES.length) { stopTour(); overview(); return; }
  focusCity(i, { fromTour: true });
  const dur = readingTime(CITIES[i]) + 3000;
  ui.runProgress(dur);
  clearTimeout(tour.timer);
  tour.timer = setTimeout(() => {
    const c = CITIES[i];
    const next = CITIES[i + 1];
    if (!next || next.chapter !== c.chapter) showInterlude(c.chapter, () => tourGo(i + 1));
    else tourGo(i + 1);
  }, dur);
}
function stopTour() {
  tour.active = false;
  clearTimeout(tour.timer);
  ui.setTour(false);
  ui.runProgress(0);
}

function showInterlude(after, then) {
  const il = INTERLUDES.find((x) => x.after === after);
  if (!il) { then && then(); return; }
  const kicker = after < 0 ? '서문' : after === 8 ? '맺음말' : `${ROMAN[after]}장 뒤의 대화`;
  sound.interlude();
  ui.showInterlude(kicker, il.title, il.text, () => then && then(), tour.active ? Math.max(18000, il.text.length * (il.lang === 'ko' ? 110 : 62)) : 0);
}

/* --------------------------------------------------------------- UI -- */

const ui = initUI({
  onLayout: (n) => setLayout(n),
  onHome: () => overview(),
  onFocus: (i) => focusCity(i),
  onNext: () => focusCity(state.focus + 1),
  onPrev: () => focusCity(state.focus - 1),
  onFilter: (c) => setFilter(c),
  onTour: () => (tour.active ? stopTour() : startTour()),
  onSound: () => sound.toggle(),
  onNight: () => toggleNight(),
  onInterlude: (ch) => showInterlude(ch),
  onClosePanel: () => overview(),
  onEnter: () => enter(),
});

function enter() {
  sound.start();
  ui.enter();
  state.mode = 'overview';
  const hash = location.hash.slice(1);
  if (CITY[hash]) focusCity(CITY[hash].order);
  else {
    const L = LAYOUTS[layout];
    flyTo(...overviewPose(layout), 4.5);
  }
  updateLabelVisibility();
}

/* --------------------------------------------------- INTERACTION -- */

const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();
let pointer = null, downAt = null;

renderer.domElement.addEventListener('pointermove', (ev) => {
  pointer = { x: ev.clientX, y: ev.clientY };
});
renderer.domElement.addEventListener('pointerleave', () => { pointer = null; });
renderer.domElement.addEventListener('pointerdown', (ev) => { downAt = { x: ev.clientX, y: ev.clientY, t: performance.now() }; });
renderer.domElement.addEventListener('pointerup', (ev) => {
  if (!downAt) return;
  const moved = Math.hypot(ev.clientX - downAt.x, ev.clientY - downAt.y);
  if (moved < 5 && performance.now() - downAt.t < 500 && ev.button === 0) {
    const i = pick(ev.clientX, ev.clientY);
    if (i === 'venice') visitVenice();
    else if (i === 'pavilion') visitPavilion();
    else if (i >= 0 && i !== state.focus) focusCity(i);
  }
  downAt = null;
});
controls.addEventListener('start', () => {
  state.userDriving = true;
  controls.autoRotate = false;
  flight = null;
});
controls.addEventListener('end', () => { state.userDriving = false; state.idleT = clock.elapsedTime; });

function pick(x, y) {
  if (state.mode === 'intro') return -1;
  ndc.set((x / innerWidth) * 2 - 1, -(y / innerHeight) * 2 + 1);
  raycaster.setFromCamera(ndc, camera);
  const hit = raycaster.intersectObjects(hitTargets, false)[0];
  if (!hit) return -1;
  if (hit.object.userData.cityId === 'venice') return venice.k > 0.5 ? 'venice' : -1;
  if (hit.object.userData.cityId === 'pavilion') return 'pavilion';
  return CITY[hit.object.userData.cityId].order;
}

const PAV_TIP = { cat: null, name: 'The Khan’s garden', motif: 'Where Marco tells and Kublai listens — click to read their conversations', n: '' };
const VENICE_TIP = { cat: null, name: 'Venice', displayName: '베네치아', motif: '마르코가 이름을 말하지 않는 도시, 모든 다른 도시 속에 암묵적으로 있는 도시', n: '' };
function updateHover() {
  const i = pointer ? pick(pointer.x, pointer.y) : -1;
  const isV = i === 'venice' || i === 'pavilion';
  const live = isV || (i >= 0 && i !== state.focus);
  if (i !== state.hover) {
    state.hover = i;
    renderer.domElement.style.cursor = live ? 'pointer' : '';
    if (live && !isV) sound.hover(entries[i].city);
  }
  ui.tooltip(i === 'pavilion' ? PAV_TIP : isV ? VENICE_TIP : live ? entries[i].city : null, pointer);
}

addEventListener('keydown', (ev) => {
  if (state.mode === 'intro' || state.mode === 'solo') {
    if (ev.key === 'Enter' && state.mode === 'intro' && !document.getElementById('enter').disabled) enter();
    return;
  }
  if (ui.overlayOpen()) {
    if (ev.key === 'Escape') ui.closeOverlays();
    return;
  }
  const k = ev.key;
  if (k === 'ArrowRight') focusCity(state.focus < 0 ? 0 : state.focus + 1);
  else if (k === 'ArrowLeft') focusCity(state.focus < 0 ? CITIES.length - 1 : state.focus - 1);
  else if (k === 'ArrowUp' || k === 'ArrowDown') {
    if (state.focus < 0) return;
    const c = CITIES[state.focus];
    const sib = CITIES.filter((x) => x.cat === c.cat);
    const j = (c.n - 1 + (k === 'ArrowDown' ? 1 : -1) + 5) % 5;
    focusCity(sib[j].order);
    ev.preventDefault();
  } else if (k === 'Escape') overview();
  else if (k === '1') setLayout('atlas');
  else if (k === '2') setLayout('journey');
  else if (k === '3') setLayout('chapters');
  else if (k === 't' || k === 'T') tour.active ? stopTour() : startTour();
  else if (k === 'c' || k === 'C') ui.toggle('contents');
  else if (k === 'm' || k === 'M') sound.toggle();
  else if (k === 'n' || k === 'N') toggleNight();
  else if (k === 'h' || k === 'H') document.body.classList.toggle('bare');
  else if (k === '?') ui.toggle('help');
});

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  labelRenderer.setSize(innerWidth, innerHeight);
  post.resize(innerWidth, innerHeight, PR);
});

/* ------------------------------------------------------------- LOOP -- */

const clock = {
  elapsedTime: 0, last: performance.now(),
  getDelta() { const now = performance.now(); const d = (now - this.last) / 1000; this.last = now; this.elapsedTime += Math.min(d, 0.1); return d; },
};
const frustum = new THREE.Frustum();
const projScreen = new THREE.Matrix4();
const tmpV = new THREE.Vector3();
let hoverTick = 0;
let viewOff = 0, viewOffY = 0;

function frame() {
  const dt = Math.min(clock.getDelta(), 0.1);
  const t = clock.elapsedTime;

  stepLayout();
  stepVenice(t, dt);
  pavilion.update(t);
  pavilion.el.classList.toggle('off', state.mode === 'focus');
  if (Math.abs(moodState.k - moodState.target) > 0.001) {
    moodState.k += Math.sign(moodState.target - moodState.k) * Math.min(Math.abs(moodState.target - moodState.k), dt * 0.4);
    applyMood(moodState.k);
  }
  updateCaptions();
  stepFlight();
  if (state.mode === 'intro') {
    // slow drift above the atlas while loading
    const a = t * 0.03;
    camera.position.set(Math.sin(a) * 340, 150 + Math.sin(t * 0.1) * 10, Math.cos(a) * 340);
    controls.target.set(0, 0, 0);
  } else if (state.mode === 'focus' && !flight && !state.userDriving && !controls.autoRotate && t - state.idleT > 6) {
    controls.autoRotate = true;
  }
  controls.update();
  const panelW = state.mode === 'focus' && state.focus >= 0 && innerWidth > 860 && !document.body.classList.contains('bare') ? Math.min(420, innerWidth * 0.35) / 2 + 9 : 0;
  const panelH = state.mode === 'focus' && state.focus >= 0 && innerWidth <= 860 && !document.body.classList.contains('bare') ? innerHeight * 0.23 : 0;
  viewOff += (panelW - viewOff) * Math.min(1, dt * 2.5);
  viewOffY += (panelH - viewOffY) * Math.min(1, dt * 2.5);
  if (Math.abs(viewOff) > 0.5 || Math.abs(viewOffY) > 0.5) camera.setViewOffset(innerWidth, innerHeight, viewOff, viewOffY, innerWidth, innerHeight);
  else if (camera.view && camera.view.enabled) camera.clearViewOffset();

  // shadows follow the gaze
  const dist = camera.position.distanceTo(controls.target);
  const half = THREE.MathUtils.clamp(dist * 0.55, 18, 240);
  const sc = sun.shadow.camera;
  if (Math.abs(sc.right - half) > 0.5) {
    sc.left = -half; sc.right = half; sc.top = half; sc.bottom = -half;
    sc.updateProjectionMatrix();
  }
  sun.target.position.copy(controls.target).setY(0);
  sun.position.copy(sun.target.position).addScaledVector(SUN_DIR, 400);

  // fog thins as we get closer
  scene.fog.density = 0.55 / THREE.MathUtils.clamp(dist, 70, 3000);

  // tilt-shift for the miniature look when close
  post.grade.uniforms.uTilt.value = THREE.MathUtils.lerp(post.grade.uniforms.uTilt.value, state.mode === 'focus' ? 0.55 : 0.25, 0.05);

  // ambient occlusion only when close enough to matter
  post.ao.enabled = !NO_AO && !gov.aoOff && dist < 120;

  // per-city updates (only visible ones)
  camera.updateMatrixWorld();
  projScreen.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  frustum.setFromProjectionMatrix(projScreen);
  for (const e of entries) {
    // dimming for filters
    e.dim += (e.dimTarget - e.dim) * 0.08;
    const ringI = state.hover === e.city.order || state.focus === e.city.order ? 2.6 : 1.4;
    e.plinth.ringMat.color.copy(e.plinth.baseColor).multiplyScalar(ringI * (1 - e.dim * 0.85));
    if (!e.object) continue;
    e.holder.getWorldPosition(tmpV);
    tmpV.y += e.height * 0.5;
    e.sphere.set(tmpV, Math.max(e.radius, e.height) * 1.1);
    const visible = frustum.intersectsSphere(e.sphere);
    const near = camera.position.distanceTo(tmpV) < (state.mode === 'focus' ? 160 : 700);
    if (e.update && visible && near && state.mode !== 'solo') {
      try { e.update(t, dt); } catch (err) { console.error(e.city.id, err); e.update = null; }
    }
    // gently sink dimmed cities
    // filtered-out cities sink into their plinths
    const sink = 1 - THREE.MathUtils.smoothstep(e.dim, 0, 1);
    e.stage.scale.set(1, Math.max(0.002, sink), 1);
    e.stage.visible = sink > 0.01;
  }

  sky.uniforms.uTime.value = t;
  thread.uniforms.uTime.value = t;
  thread.uniforms.uOpacity.value = (layout === 'atlas' ? 0.32 : 0.7) * (1 - 0.5 * moodState.k);
  dust.uniforms.uTime.value = t;
  dust.uniforms.uCenter.value.copy(controls.target);
  dust.uniforms.uPx.value = PR;
  post.grade.uniforms.uTime.value = t;

  if (++hoverTick % 3 === 0) updateHover();
  if (hoverTick % 12 === 0) declutterLabels();

  governor(dt);
  post.composer.render(dt);
  if (state.mode !== 'solo') labelRenderer.render(scene, camera);
  sound.update(dt, camera, controls.target);
  requestAnimationFrame(frame);
}

// adaptive quality: if frames are slow for a while, lower resolution, then drop AO
const gov = { acc: 0, n: 0, aoOff: false, cooldown: 3 };
function governor(dt) {
  if (state.mode === 'solo' || state.mode === 'intro' || document.hidden) return;
  gov.cooldown -= dt;
  gov.acc += dt; gov.n++;
  if (gov.acc < 2) return;
  const avg = gov.acc / gov.n;
  gov.acc = 0; gov.n = 0;
  if (gov.cooldown > 0) return;
  if (avg > 1 / 40) {
    if (!gov.aoOff && post.ao.enabled) { gov.aoOff = true; }
    else if (PR > 1) { PR = Math.max(1, PR - 0.25); renderer.setPixelRatio(PR); post.resize(innerWidth, innerHeight, PR); }
    gov.cooldown = 2;
  }
}

// hide labels that would overlap a nearer one
const _lp = new THREE.Vector3();
function declutterLabels() {
  if (state.mode === 'focus' || state.mode === 'solo') { entries.forEach((e) => e.el.classList.remove('crowd')); return; }
  const items = entries.map((e) => {
    e.label.getWorldPosition(_lp);
    const d = _lp.distanceTo(camera.position);
    _lp.project(camera);
    return { e, d, x: (_lp.x * 0.5 + 0.5) * innerWidth, y: (-_lp.y * 0.5 + 0.5) * innerHeight, w: e.el.getBoundingClientRect().width };
  }).sort((a, b) => (a.e.city.order === state.hover ? -1 : b.e.city.order === state.hover ? 1 : a.d - b.d));
  const kept = [];
  for (const it of items) {
    const clash = kept.some((k) => Math.abs(k.x - it.x) < (k.w + it.w) / 2 && Math.abs(k.y - it.y) < 19);
    it.e.el.classList.toggle('crowd', clash);
    if (!clash) kept.push(it);
  }
}

/* ------------------------------------------------------------- BOOT -- */

async function boot() {
  thread.update(threadPoints());
  if (SOLO) return bootSolo();
  ui.setLayout(layout);
  requestAnimationFrame(frame);
  let done = 0;
  // build in reading order, a few per frame, so the intro stays alive
  for (const e of entries) {
    await buildCity(e);
    done++;
    ui.progress(done / entries.length, displayName(e.city));
    if (done % 2 === 0) await new Promise((r) => requestAnimationFrame(r));
  }
  await buildVenice();
  ui.loaded();
}

async function bootSolo() {
  // render one city alone for inspection: ?solo=id&view=front|top|side|close|low&t=seconds
  document.body.classList.add('solo');
  const e = entries[CITY[SOLO].order];
  entries.forEach((x) => { x.holder.visible = x === e; });
  thread.mesh.visible = false;
  pavHolder.visible = false;
  e.holder.position.set(0, 0, 0);
  e.to.set(0, 0, 0);
  await buildCity(e);
  const view = params.get('view') || 'front';
  const az = { front: 0.5, side: 2.1, back: 3.6, top: 0.5, close: 0.9, low: 1.4 }[view] ?? 0.5;
  const { pos, tgt } = focusPose(e, az);
  if (view === 'top') pos.copy(tgt).add(new THREE.Vector3(0.01, 60, 0.01));
  if (view === 'close') pos.lerp(tgt, 0.5);
  if (view === 'low') pos.y = tgt.y + 1.5;
  camera.position.copy(pos);
  controls.target.copy(tgt);
  controls.update();
  state.mode = 'solo';
  const tSim = parseFloat(params.get('t') || '2');
  // advance animations deterministically
  let simT = 0;
  const step = 1 / 30;
  while (simT < tSim) { simT += step; e.update && e.update(simT, step); }
  window.__soloUpdate = (dtt) => { simT += dtt; e.update && e.update(simT, dtt); };
  requestAnimationFrame(frame);
  setTimeout(() => { window.__ready = true; }, 600);
}

if (!SOLO) {
  document.getElementById('prologue').textContent = INTERLUDES[0].text;
}
boot();

// expose for debugging
window.__app = { renderer, scene, camera, controls, entries, focusCity, setLayout, overview, visitPavilion, visitVenice, flyTo, pavHolder, state };
