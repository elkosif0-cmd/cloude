/* KOSIF EARTH • motion-graphics layer for the front door (with ui/art/brand/earth-motion.css).
   Decorative only: it never reads, stores or sends company or auth data, never touches the reviewed unlock script,
   and steps aside (html.em-lite) under reduced motion, save-data or on small devices. It
     • injects the orbit ring and the light rays into the visual column,
     • starts the entrance choreography once the page (and the cinematic intro, if it played) is ready,
     • re-staggers the sector / company / bundle lists whenever the door moves to the next step,
     • tilts the cards after the pointer and lets the visual drift with it (fine pointers only). */
(() => {
  'use strict';
  const doc = document.documentElement;
  const prefers = q => { try { return !!(matchMedia && matchMedia(q).matches); } catch { return false; } };
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const lite = prefers('(prefers-reduced-motion: reduce)') || !!(conn && conn.saveData) ||
    (typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 2);
  doc.classList.add(lite ? 'em-lite' : 'em-on');
  if (lite) return;

  const $ = id => document.getElementById(id);
  const fine = prefers('(hover:hover) and (pointer:fine)');

  /* ---- the orbit ring and the rays, behind the wordmark ---- */
  function decorate() {
    const visual = document.querySelector('.visual');
    if (!visual || visual.querySelector('.em-orbit')) return;
    const rays = document.createElement('div'); rays.className = 'em-rays'; rays.setAttribute('aria-hidden', 'true');
    const ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'em-orbit'); svg.setAttribute('viewBox', '0 0 160 160'); svg.setAttribute('aria-hidden', 'true');
    const el = (n, a) => { const e = document.createElementNS(ns, n); for (const k in a) e.setAttribute(k, a[k]); return e; };
    svg.append(
      el('circle', { class: 'ring', cx: 80, cy: 80, r: 66 }),
      el('circle', { class: 'ring r2', cx: 80, cy: 80, r: 48 }),
      el('circle', { class: 'core', cx: 80, cy: 80, r: 3 }),
      el('circle', { class: 'dot', cx: 80, cy: 14, r: 2.6 }),
      el('circle', { class: 'dot d2', cx: 128, cy: 80, r: 2 }),
      el('circle', { class: 'dot d3', cx: 80, cy: 146, r: 1.6 }));
    visual.prepend(rays, svg);
  }

  /* ---- entrance: after the intro overlay (if any) has gone ---- */
  const stagger = list => { if (list) [...list.children].forEach((n, i) => n.style.setProperty('--i', String(i))); };
  let played = false;
  function enter() {
    if (played) return; played = true;
    stagger($('gate-list'));
    requestAnimationFrame(() => requestAnimationFrame(() => doc.classList.add('em-ready')));
  }
  function whenIntroDone() {
    const intro = $('kosif-earth-intro');
    if (!intro || intro.hidden) return enter();
    const mo = new MutationObserver(() => { if (intro.hidden) { mo.disconnect(); enter(); } });
    mo.observe(intro, { attributes: true, attributeFilter: ['hidden'] });
    setTimeout(() => { if (!played) { mo.disconnect(); enter(); } }, 15000);   /* fail-safe: the film never blocks the door */
  }

  /* ---- the next steps rise when they appear or are repainted ---- */
  function play(list) {
    if (!list || !list.children.length) return;
    stagger(list);
    list.classList.remove('em-play'); void list.offsetWidth; list.classList.add('em-play');
    setTimeout(() => list.classList.remove('em-play'), 1400);
  }
  function watchSteps() {
    for (const id of ['sectors', 'companies']) {
      const sec = $(id); if (!sec) continue;
      new MutationObserver(() => { if (!sec.hidden) sec.querySelectorAll('.sector-list, .co-list, .corpus').forEach(play); })
        .observe(sec, { attributes: true, attributeFilter: ['hidden'] });
    }
    const corpus = $('corpus');
    if (corpus) new MutationObserver(() => { if (!corpus.hidden) play(corpus.querySelector('[role="list"]') || corpus); })
      .observe(corpus, { attributes: true, attributeFilter: ['hidden'] });
  }

  /* ---- pointer: tilt the card under it, drift the visual with it ---- */
  function pointer() {
    if (!fine) return;
    const visual = document.querySelector('.visual');
    let raf = 0, mx = 0, my = 0;
    document.addEventListener('pointermove', e => {
      mx = (e.clientX / innerWidth) * 2 - 1; my = (e.clientY / innerHeight) * 2 - 1;
      if (raf) return;
      raf = requestAnimationFrame(() => { raf = 0; if (visual) { visual.style.setProperty('--em-mx', mx.toFixed(3)); visual.style.setProperty('--em-my', my.toFixed(3)); } });
    }, { passive: true });
    document.addEventListener('pointerover', e => {
      const card = e.target.closest && e.target.closest('.gate, .sector');
      if (card) card.classList.add('em-tilt');
    });
    document.addEventListener('pointermove', e => {
      const card = e.target.closest && e.target.closest('.gate.em-tilt, .sector.em-tilt'); if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--em-rx', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
      card.style.setProperty('--em-ry', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
    }, { passive: true });
    document.addEventListener('pointerout', e => {
      const card = e.target.closest && e.target.closest('.gate.em-tilt, .sector.em-tilt');
      if (card && !card.contains(e.relatedTarget)) { card.classList.remove('em-tilt'); card.style.removeProperty('--em-rx'); card.style.removeProperty('--em-ry'); }
    });
  }

  function boot() { decorate(); watchSteps(); pointer(); whenIntroDone(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
})();
