// Generative soundscape: a desert drone, wind, and plucked strings in a hijaz mode.
import { CAT } from './data.js';

// D hijaz-ish scale (semitones from D)
const SCALE = [0, 1, 4, 5, 7, 8, 10, 12, 13, 16, 17, 19];
const ROOT = 146.83; // D3

export class Sound {
  constructor() {
    this.ctx = null;
    this.on = true;
    this.cache = new Map();
    this.nextPluck = 0;
    this.mood = 0;
  }

  start() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = (this.ctx = new AC());
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.master.gain.linearRampToValueAtTime(0.9, ctx.currentTime + 4);
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    this.master.connect(comp).connect(ctx.destination);

    // reverb
    this.verb = ctx.createConvolver();
    this.verb.buffer = this.impulse(4.5, 2.6);
    const verbGain = ctx.createGain();
    verbGain.gain.value = 0.55;
    this.verb.connect(verbGain).connect(this.master);
    this.dry = ctx.createGain();
    this.dry.gain.value = 0.6;
    this.dry.connect(this.master);

    // drone
    this.droneFilter = ctx.createBiquadFilter();
    this.droneFilter.type = 'lowpass';
    this.droneFilter.frequency.value = 380;
    this.droneFilter.Q.value = 2;
    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.07;
    this.droneFilter.connect(droneGain);
    droneGain.connect(this.master);
    droneGain.connect(this.verb);
    this.drones = [];
    for (const [f, type, det] of [[ROOT / 2, 'sawtooth', -6], [ROOT / 2, 'sawtooth', 5], [ROOT * 0.75, 'triangle', 0], [ROOT / 4, 'sine', 0]]) {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = f;
      o.detune.value = det;
      o.connect(this.droneFilter);
      o.start();
      this.drones.push(o);
    }
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.05;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 160;
    lfo.connect(lfoGain).connect(this.droneFilter.frequency);
    lfo.start();

    // wind
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer(4);
    noise.loop = true;
    this.wind = ctx.createBiquadFilter();
    this.wind.type = 'bandpass';
    this.wind.frequency.value = 600;
    this.wind.Q.value = 0.8;
    const windGain = ctx.createGain();
    windGain.gain.value = 0.035;
    noise.connect(this.wind).connect(windGain).connect(this.master);
    noise.start();
    const wl = ctx.createOscillator();
    wl.frequency.value = 0.07;
    const wlg = ctx.createGain();
    wlg.gain.value = 350;
    wl.connect(wlg).connect(this.wind.frequency);
    wl.start();

    this.nextPluck = ctx.currentTime + 3;
    if (!this.on) this.master.gain.value = 0;
  }

  toggle() {
    this.on = !this.on;
    if (!this.ctx) this.start();
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setValueAtTime(this.master.gain.value, t);
    this.master.gain.linearRampToValueAtTime(this.on ? 0.9 : 0, t + 1.2);
    return this.on;
  }

  impulse(sec, decay) {
    const ctx = this.ctx;
    const len = Math.floor(ctx.sampleRate * sec);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }
  noiseBuffer(sec) {
    const ctx = this.ctx;
    const buf = ctx.createBuffer(1, ctx.sampleRate * sec, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let b = 0;
    for (let i = 0; i < d.length; i++) { b = 0.97 * b + 0.03 * (Math.random() * 2 - 1); d[i] = b * 4; }
    return buf;
  }

  // Karplus–Strong pluck, rendered once per pitch
  pluckBuffer(freq) {
    const key = Math.round(freq * 10);
    if (this.cache.has(key)) return this.cache.get(key);
    const ctx = this.ctx;
    const sr = ctx.sampleRate;
    const len = Math.floor(sr * 3.2);
    const buf = ctx.createBuffer(1, len, sr);
    const d = buf.getChannelData(0);
    const N = Math.max(2, Math.round(sr / freq));
    const ring = new Float32Array(N);
    for (let i = 0; i < N; i++) ring[i] = Math.random() * 2 - 1;
    let idx = 0, last = 0;
    for (let i = 0; i < len; i++) {
      const cur = ring[idx];
      const nxt = 0.5 * (cur + last) * 0.996;
      last = cur;
      ring[idx] = nxt;
      d[i] = cur * 0.5;
      idx = (idx + 1) % N;
    }
    this.cache.set(key, buf);
    return buf;
  }

  note(deg, { when = 0, gain = 0.25, oct = 0, pan = 0 } = {}) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const s = SCALE[((deg % SCALE.length) + SCALE.length) % SCALE.length] + 12 * (oct + Math.floor(deg / SCALE.length));
    const f = ROOT * Math.pow(2, s / 12);
    const src = ctx.createBufferSource();
    src.buffer = this.pluckBuffer(f);
    const g = ctx.createGain();
    g.gain.value = gain;
    const p = ctx.createStereoPanner();
    p.pan.value = pan;
    src.connect(g).connect(p);
    p.connect(this.dry);
    p.connect(this.verb);
    src.start(ctx.currentTime + when);
  }

  bell(freq, { when = 0, gain = 0.08, dur = 4 } = {}) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const t = ctx.currentTime + when;
    for (const [ratio, amp] of [[1, 1], [2.76, 0.5], [5.4, 0.25], [8.93, 0.12]]) {
      const o = ctx.createOscillator();
      o.frequency.value = freq * ratio;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(gain * amp, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur / ratio ** 0.5);
      o.connect(g);
      g.connect(this.verb);
      g.connect(this.dry);
      o.start(t);
      o.stop(t + dur + 0.1);
    }
  }

  enterCity(city) {
    if (!this.ctx) return;
    const ci = CAT[city.cat].index;
    // a small motif: category gives the first degree, the number gives its contour
    const base = ci % 7;
    const steps = [0, city.n % 2 ? 2 : 1, city.n > 2 ? 4 : 3, city.n];
    steps.forEach((s, i) => this.note(base + s, { when: i * 0.32, gain: 0.22 - i * 0.03, pan: (i - 1.5) * 0.3 }));
    this.bell(ROOT * 2 * Math.pow(2, SCALE[base] / 12), { when: 1.4, gain: 0.04 });
    // drone colour per category
    const t = this.ctx.currentTime;
    this.droneFilter.frequency.cancelScheduledValues(t);
    this.droneFilter.frequency.linearRampToValueAtTime(280 + ci * 30, t + 3);
  }
  hover(city) {
    if (!this.ctx) return;
    this.note(CAT[city.cat].index % 7 + 7, { gain: 0.06, pan: 0.2 });
  }
  chime(n = 0) { this.bell(ROOT * 4 * Math.pow(2, SCALE[n % SCALE.length] / 12), { gain: 0.035, dur: 3 }); }
  interlude() {
    this.bell(ROOT / 2, { gain: 0.12, dur: 8 });
    this.bell(ROOT * 0.75, { when: 0.05, gain: 0.06, dur: 7 });
  }

  update() {
    if (!this.ctx || !this.on) return;
    const t = this.ctx.currentTime;
    if (t > this.nextPluck) {
      // wandering melody, sparse
      const phrase = 1 + Math.floor(Math.random() * 4);
      let deg = Math.floor(Math.random() * 7);
      for (let i = 0; i < phrase; i++) {
        this.note(deg, { when: i * (0.28 + Math.random() * 0.3), gain: 0.07 + Math.random() * 0.06, pan: Math.random() - 0.5 });
        deg += Math.random() < 0.5 ? -1 : 1 + Math.floor(Math.random() * 2);
      }
      this.nextPluck = t + 3 + Math.random() * 7;
    }
  }
}
