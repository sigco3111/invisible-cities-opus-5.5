import { displayName } from './locale-ko.js';
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
    b.title = `${c.name} - 이 갈래의 다섯 도시만 보기`;
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
    const head = cell(`<b>${r}</b><small>대화 읽기</small>`, 'ch-head');
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
        a.innerHTML = `<span class="num">${city.order + 1}</span>${displayName(city)}<em>${c.glyph} ${city.n}</em>`;
        a.onclick = () => { closeOverlays(); h.onFocus(city.order); };
        td.appendChild(a);
      }
      grid.appendChild(td);
    }
  }
  toc.appendChild(grid);
  // A stacked reading-order contents list keeps every city usable on phones.
  const mobile = document.createElement('div');
  mobile.className = 'toc-mobile';
  ROMAN.forEach((r, ch) => {
    const section = document.createElement('section');
    const head = document.createElement('button');
    head.className = 'toc-mobile-heading';
    head.textContent = `${r}장 · 대화 읽기`;
    head.onclick = () => { closeOverlays(); h.onInterlude(ch); };
    section.appendChild(head);
    CITIES.filter(city => city.chapter === ch).forEach(city => {
      const b = document.createElement('button');
      b.className = 'toc-mobile-city';
      b.style.setProperty('--c', CAT[city.cat].color);
      b.innerHTML = `<span>${city.order + 1}. ${displayName(city)}</span><small>${CAT[city.cat].short} ${city.n}</small>`;
      b.onclick = () => { closeOverlays(); h.onFocus(city.order); };
      section.appendChild(b);
    });
    mobile.appendChild(section);
  });
  toc.appendChild(mobile);
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
      $('loadtext').textContent = f < 1 ? `${name} 짓는 중…` : '쉰다섯 도시가 모두 세워졌습니다.';
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
      $('p-chapter').textContent = `${ROMAN[city.chapter]}장`;
      $('p-order').textContent = `${city.order + 1} / 55`;
      $('p-cat').innerHTML = `<span class="glyph">${c.glyph}</span> ${c.name} · ${city.n}`;
      $('p-name').textContent = displayName(city);
      $('p-motif').textContent = city.motif;
      $('p-text').innerHTML = (city.paragraphs || city.text.split(/(?<=[.!?…”])\s+(?=[\p{L}“])/u)).reduce((acc, s, i, arr) => {
        // split into ~2 paragraphs
        const mid = Math.ceil(arr.length / 2);
        acc[i < mid ? 0 : 1].push(s);
        return acc;
      }, [[], []]).filter((p) => p.length).map((p) => `<p>${p.join(' ')}</p>`).join('');
      const sibs = CITIES.filter((x) => x.cat === city.cat);
      $('p-sibs').innerHTML = sibs.map((s) => `<button class="${s.id === city.id ? 'on' : ''}" data-i="${s.order}" title="${displayName(s)}">${s.n}<span>${displayName(s)}</span></button>`).join('');
      $('p-sibs').querySelectorAll('button').forEach((b) => (b.onclick = () => h.onFocus(+b.dataset.i)));
      const prev = CITIES[(city.order + 54) % 55], next = CITIES[(city.order + 1) % 55];
      $('p-prev').querySelector('span').textContent = displayName(prev);
      $('p-next').querySelector('span').textContent = displayName(next);
      $('p-text').scrollTop = 0;
    },
    hidePanel() { $('panel').classList.add('hidden'); },
    setTour(on) {
      $('btn-tour').classList.toggle('on', on);
      $('btn-tour').innerHTML = on ? '<span class="ico">❚❚</span> 일시정지' : '<span class="ico">▶</span> 여행';
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
      $('il-go').textContent = autoMs ? '여행 계속하기' : '닫기';
    },
    tooltip(city, p) {
      if (!city || !p) { tip.classList.add('hidden'); return; }
      const c = CAT[city.cat] || { color: '#f0d9a0', glyph: '✧', name: '첫 번째 도시' };
      tip.classList.remove('hidden');
      tip.style.setProperty('--c', c.color);
      tip.querySelector('.tip-cat').textContent = `${c.glyph} ${c.name}${city.n ? ' · ' + city.n : ''}`;
      tip.querySelector('.tip-name').textContent = displayName(city);
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
