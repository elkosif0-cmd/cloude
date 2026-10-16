/* KOSIF EARTH • «Maison» prestige layer for the front door (with ui/art/brand/earth-prestige.css).
   Decorative only: it never reads, stores or sends company or auth data and never touches the reviewed unlock script.
     • a hairline gold loader on first paint and a one-time shell entrance,
     • a monogram seal and a slow ambient gold glow that follows the pointer (fine pointers only),
     • numbers (01 · 02 · 03) and a gliding arrow on the section cards, re-applied whenever the door repaints them,
     • a pointer spotlight on the cards (CSS variables --pm-sx / --pm-sy).
   Reduced motion, save-data and small devices (html.em-lite from earth-motion.js) keep the stage still. */
(() => {
  'use strict';
  const doc = document.documentElement;
  const prefers = q => { try { return !!(window.matchMedia && matchMedia(q).matches); } catch { return false; } };
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const still = prefers('(prefers-reduced-motion: reduce)') || !!(conn && conn.saveData) ||
    (typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 2);
  const fine = prefers('(hover:hover) and (pointer:fine)');
  const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="m11 6-6 6 6 6"/></svg>';
  if (!still) doc.classList.add('pm-on', 'pm-boot');

  function stage() {
    if (!document.querySelector('.pm-loader')) {
      const bar = document.createElement('div'); bar.className = 'pm-loader'; bar.setAttribute('aria-hidden', 'true');
      document.body.prepend(bar);
    }
    if (!still && fine && !document.querySelector('.pm-glow')) {
      const glow = document.createElement('div'); glow.className = 'pm-glow'; glow.setAttribute('aria-hidden', 'true');
      document.body.prepend(glow);
    }
    const visual = document.querySelector('.visual');
    if (visual && !visual.querySelector('.pm-seal')) {
      const seal = document.createElement('span'); seal.className = 'pm-seal'; seal.setAttribute('aria-hidden', 'true');
      seal.textContent = 'KE';
      visual.append(seal);
    }
  }

  /* numbers and arrows on the section cards; the door repaints #gate-list, so watch it */
  function dress() {
    const list = document.getElementById('gate-list'); if (!list) return;
    [...list.querySelectorAll('.gate')].forEach((g, i) => {
      const b = g.querySelector('.gate-t b');
      if (b && !b.querySelector('.pm-num')) {
        const n = document.createElement('span'); n.className = 'pm-num'; n.setAttribute('aria-hidden', 'true');
        n.textContent = String(i + 1).padStart(2, '0', '0');
        b.append(n);
      }
      if (!g.querySelector('.pm-arrow')) {
        const a = document.createElement('span'); a.className = 'pm-arrow'; a.innerHTML = ARROW;
        g.append(a);
      }
    });
  }
  function watch() {
    const list = document.getElementById('gate-list'); if (!list) return;
    dress();
    new MutationObserver(() => dress()).observe(list, { childList: true });
  }

  /* pointer: the spotlight on the card under it, and the ambient glow drifting toward it */
  function pointer() {
    if (!fine) return;
    let raf = 0, last = null;
    document.addEventListener('pointermove', e => {
      last = e;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0; const ev = last; if (!ev) return;
        const card = ev.target && ev.target.closest && ev.target.closest('.gate, .sector, .co, .corpus-co');
        if (card) {
          const r = card.getBoundingClientRect();
          card.style.setProperty('--pm-sx', (ev.clientX - r.left).toFixed(0) + 'px');
          card.style.setProperty('--pm-sy', (ev.clientY - r.top).toFixed(0) + 'px');
        }
        if (!still) {
          doc.style.setProperty('--pm-x', (ev.clientX / innerWidth * 100).toFixed(1));
          doc.style.setProperty('--pm-y', (ev.clientY / innerHeight * 100).toFixed(1));
        }
      });
    }, { passive: true });
  }

  function boot() {
    stage(); watch(); pointer();
    setTimeout(() => doc.classList.remove('pm-boot'), 1600);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
})();
