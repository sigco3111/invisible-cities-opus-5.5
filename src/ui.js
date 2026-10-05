import { CITIES, CAT, CATEGORIES, INTERLUDES, ROMAN } from './data.js';
import { LAYOUTS } from './world.js';

const $ = (id) => document.getElementById(id);

export function initUI(h) {
  const body = document.body;

  /* layouts */
  const nav = $('layouts');
  for (const [key, L] of Object.entries(LAYOUTS)) {
    const b = document.createElement('button');
    b.dataset.layout = key;
    b.innerHTML = `${L.label}<small>${L.hint}</small>`;
    b.onclick = () => h.onLayout(key);
    nav.appendChild(b);
  }

  /* legend */
  const legend = $('legend');
  legend.innerHTML = '';
  for (const c of CATEGORIES) {
    const b = document.createElement('button');
    b.dataset.cat = c.id;
    b.innerHTML = `<i style="color:${c.color}">${c.glyph}</i><span>${c.short}</span>`;
    b.title = `${c.name} — show only these five`;
    b.onclick = () => h.onFilter(c.id);
    legend.appendChild(b);
  }

  /* contents: chapters as columns, categories as rows — the book's braided structure */
  const toc = $('toc');
  const grid = document.createElement('div');
  grid.className = 'toc-grid';
  grid.style.gridTemplateColumns = `11em repeat(9, 1fr)`;
  grid.appendChild(cell('', 'corner'));
  ROMAN.forEach((r, ch) => {
    const head = cell(`<b>${r}</b><small>read the dialogue</small>`, 'ch-head');
    head.onclick = () => { closeOverlays(); h.onInterlude(ch); };
    grid.appendChild(head);
  });
  for (const c of CATEGORIES) {
    grid.appendChild(cell(`<i style="background:${c.color}"></i>${c.name}`, 'cat-head'));
    for (let ch = 0; ch < 9; ch++) {
      const here = CITIES.filter((x) => x.cat === c.id && x.chapter === ch);
      const td = cell('', 'slot');
      for (const city of here) {
        const a = document.createElement('button');
        a.className = 'toc-city';
        a.style.setProperty('--c', c.color);
        a.innerHTML = `<span class="num">${city.order + 1}</span>${city.name}<em>${c.glyph} ${city.n}</em>`;
        a.onclick = () => { closeOverlays(); h.onFocus(city.order); };
        td.appendChild(a);
      }
      grid.appendChild(td);
    }
  }
  toc.appendChild(grid);
  function cell(html, cls) { const d = document.createElement('div'); d.className = cls; d.innerHTML = html; return d; }

  /* buttons */
  $('home').onclick = () => h.onHome();
  $('btn-tour').onclick = () => h.onTour();
  $('btn-sound').onclick = () => { const on = h.onSound(); $('btn-sound').classList.toggle('off', !on); };
  $('btn-night').onclick = () => h.onNight();
  $('btn-contents').onclick = () => toggle('contents');
  $('btn-help').onclick = () => toggle('help');
  $('panel-close').onclick = () => h.onClosePanel();
  $('p-next').onclick = () => h.onNext();
  $('p-prev').onclick = () => h.onPrev();
  $('enter').onclick = () => h.onEnter();
  document.querySelectorAll('[data-close]').forEach((b) => (b.onclick = closeOverlays));
  document.querySelectorAll('.overlay').forEach((o) => o.addEventListener('click', (ev) => { if (ev.target === o && o.id !== 'interlude') closeOverlays(); }));

  function toggle(id) {
    const el = $(id);
    const open = el.classList.contains('hidden');
    closeOverlays();
    if (open) el.classList.remove('hidden');
  }
  function closeOverlays() {
    ['contents', 'help'].forEach((id) => $(id).classList.add('hidden'));
  }

  /* interlude */
  let ilTimer = null, ilThen = null;
  function finishInterlude() {
    clearTimeout(ilTimer);
    $('interlude').classList.add('hidden');
    const f = ilThen; ilThen = null;
    f && f();
  }
  $('il-go').onclick = finishInterlude;

  /* tour progress */
  let progAnim = null;

  const tip = $('tip');

  return {
    setLayout(name) {
      nav.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.layout === name));
    },
    setFilter(cat) {
      legend.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.cat === cat));
      legend.classList.toggle('filtering', !!cat);
    },
    progress(f, name) {
      $('loadbar').style.width = `${(f * 100).toFixed(1)}%`;
      $('loadtext').textContent = f < 1 ? `Raising ${name}…` : 'All fifty-five cities are standing.';
    },
    loaded() {
      $('enter').disabled = false;
      $('enter').focus();
      body.classList.add('loaded');
    },
    enter() {
      $('intro').classList.add('gone');
      setTimeout(() => $('intro').remove(), 2000);
      ['top', 'legend'].forEach((id) => $(id).classList.remove('hidden'));
    },
    showCity(city) {
      const c = CAT[city.cat];
      const panel = $('panel');
      panel.classList.remove('hidden');
      panel.style.setProperty('--c', c.color);
      panel.classList.remove('swap');
      void panel.offsetWidth;
      panel.classList.add('swap');
      $('p-chapter').textContent = `Chapter ${ROMAN[city.chapter]}`;
      $('p-order').textContent = `${city.order + 1} / 55`;
      $('p-cat').innerHTML = `<span class="glyph">${c.glyph}</span> ${c.name} · ${city.n}`;
      $('p-name').textContent = city.name;
      $('p-motif').textContent = city.motif;
      $('p-text').innerHTML = city.text.split(/(?<=[.!?…”])\s+(?=[A-Z“])/).reduce((acc, s, i, arr) => {
        // split into ~2 paragraphs
        const mid = Math.ceil(arr.length / 2);
        acc[i < mid ? 0 : 1].push(s);
        return acc;
      }, [[], []]).filter((p) => p.length).map((p) => `<p>${p.join(' ')}</p>`).join('');
      const sibs = CITIES.filter((x) => x.cat === city.cat);
      $('p-sibs').innerHTML = sibs.map((s) => `<button class="${s.id === city.id ? 'on' : ''}" data-i="${s.order}" title="${s.name}">${s.n}<span>${s.name}</span></button>`).join('');
      $('p-sibs').querySelectorAll('button').forEach((b) => (b.onclick = () => h.onFocus(+b.dataset.i)));
      const prev = CITIES[(city.order + 54) % 55], next = CITIES[(city.order + 1) % 55];
      $('p-prev').querySelector('span').textContent = prev.name;
      $('p-next').querySelector('span').textContent = next.name;
      $('p-text').scrollTop = 0;
    },
    hidePanel() { $('panel').classList.add('hidden'); },
    setTour(on) {
      $('btn-tour').classList.toggle('on', on);
      $('btn-tour').innerHTML = on ? '<span class="ico">❚❚</span> Pause' : '<span class="ico">▶</span> Tour';
      body.classList.toggle('touring', on);
    },
    runProgress(ms) {
      const bar = $('p-progress');
      bar.style.transition = 'none';
      bar.style.width = '0%';
      if (!ms) return;
      void bar.offsetWidth;
      bar.style.transition = `width ${ms}ms linear`;
      bar.style.width = '100%';
    },
    showInterlude(kicker, title, text, then, autoMs, nav) {
      $('il-nav').classList.toggle('hidden', !nav);
      if (nav) {
        $('il-prev').onclick = nav.prev;
        $('il-next').onclick = nav.next;
        $('il-pos').textContent = nav.pos;
      }
      $('il-kicker').textContent = kicker;
      $('il-title').textContent = title;
      $('il-text').textContent = text;
      ilThen = then;
      $('interlude').classList.remove('hidden');
      clearTimeout(ilTimer);
      if (autoMs) ilTimer = setTimeout(finishInterlude, autoMs);
      $('il-go').textContent = autoMs ? 'Continue the journey' : 'Close';
    },
    tooltip(city, p) {
      if (!city || !p) { tip.classList.add('hidden'); return; }
      const c = CAT[city.cat] || { color: '#f0d9a0', glyph: '✧', name: 'The first city' };
      tip.classList.remove('hidden');
      tip.style.setProperty('--c', c.color);
      tip.querySelector('.tip-cat').textContent = `${c.glyph} ${c.name}${city.n ? ' · ' + city.n : ''}`;
      tip.querySelector('.tip-name').textContent = city.name;
      tip.querySelector('.tip-motif').textContent = city.motif;
      const x = Math.min(p.x + 18, innerWidth - 300);
      tip.style.transform = `translate(${x}px, ${p.y + 18}px)`;
    },
    overlayOpen() {
      return ['contents', 'help', 'interlude'].some((id) => !$(id).classList.contains('hidden'));
    },
    closeOverlays() {
      closeOverlays();
      if (!$('interlude').classList.contains('hidden')) finishInterlude();
    },
    toggle,
  };
}
