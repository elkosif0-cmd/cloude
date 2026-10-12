/* KOSIF EARTH • «القصة» — the code-rendered motion-graphics introduction (with ui/art/brand/earth-story.css).
   Six beats on a fixed clock (~27 s): the mark · the lost numbers · one independent space · the steps · growth · the wordmark.
   It owns the existing #kosif-earth-intro overlay (its skip / enter buttons, Escape, focus trap, the seen flag, the progress
   bar); when it runs it marks html.es-on so the film script steps aside. It never runs under reduced motion, save-data,
   on ≤2 GB devices, on deep links, or twice in a session — the same gates as the film. Decorative only: no data, no auth. */
(() => {
  'use strict';
  const overlay = document.getElementById('kosif-earth-intro');
  const skip = document.getElementById('kosif-earth-skip');
  const enter = document.getElementById('kosif-earth-enter');
  const video = document.getElementById('kosif-earth-movie');
  const sound = document.getElementById('kosif-earth-sound');
  if (!overlay || !skip || !enter || !('animate' in Element.prototype)) return;
  const prefers = q => { try { return !!(matchMedia && matchMedia(q).matches); } catch { return false; } };
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  let seen = false; try { seen = sessionStorage.getItem('kosif-earth-intro-seen-v1') === '1'; } catch {}
  if (seen || location.search || location.hash || prefers('(prefers-reduced-motion: reduce)') || (conn && conn.saveData) ||
      (typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 2)) return;
  document.documentElement.classList.add('es-on');

  const ICON = './art/brand/kosif-earth-icon.svg';
  const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const mark = (extra) => `<div class="es-mark ${extra || ''}"><div class="glow"></div><svg class="ring" viewBox="0 0 120 120"><circle cx="60" cy="60" r="56"/></svg><div class="face"><img src="${ICON}" alt=""></div><div class="eyes"><i></i><i></i></div></div>`;
  const head = (id) => `<h2 class="es-h" id="${id}"></h2>`;

  /* ---- the six beats (markup) ---- */
  const S = [];
  S.push({ t: 0, len: 4.6, el: h('div', 'es-scene', `
    <div class="es-wrap"><div>${mark()}</div><div><p class="es-eyebrow">// تعرّف على عالمك</p>${head('es-h1')}</div></div>`),
    type: { id: 'es-h1', parts: ['تعرّف على ', { acc: 'KOSIF EARTH.' }], at: 0.9 } });
  S.push({ t: 4.6, len: 4.6, el: h('div', 'es-scene', `
    <div class="es-grid">${'<i></i>'.repeat(40)}</div>
    <div class="es-lens"><b>؟</b></div>
    <span class="es-q" style="--d:1.2s;top:22%;right:16%">ميزان؟</span><span class="es-q" style="--d:1.7s;bottom:26%;left:14%">فاتورة؟</span><span class="es-q" style="--d:2.2s;top:60%;right:38%">مطابقة؟</span>
    <div class="es-wrap" style="grid-template-columns:1fr;text-align:center;justify-items:center;position:relative"><div><p class="es-eyebrow">// المشكلة</p>${head('es-h2')}</div></div>`),
    type: { id: 'es-h2', parts: ['أرقامك مبعثرة، ', { acc: 'ولا أحد يجد الحقيقة.' }], at: 0.5 } });
  S.push({ t: 9.2, len: 5.6, el: h('div', 'es-scene', `
    <div class="es-wrap">
      <div style="position:relative">
        <div class="es-win" style="--d:.3s"><div class="bar"><span class="ic"></span>KOSIF EARTH<span class="srch"></span><span class="dots"><i></i><i></i><i></i></span></div>
          <div class="es-rows">
            <div class="es-row" style="--i:0"><i></i><b></b><small>المحاسبة</small></div>
            <div class="es-row hi" style="--i:1"><i></i>شركتك<span class="live">مفتوحة</span></div>
            <div class="es-row" style="--i:2"><i></i><b></b><small>المراجعة</small></div>
            <div class="es-row" style="--i:3"><i></i><b></b><small>الأدوات</small></div>
            <div class="es-row" style="--i:4"><i></i><b></b><small>التقارير</small></div>
          </div></div>
        <span class="es-tag" style="--d:1.5s;top:38%;right:-6%">محاسب</span><span class="es-tag t2" style="--d:1.8s;top:60%;left:-4%">مراجع</span><span class="es-tag t3" style="--d:2.1s;top:18%;left:10%">مدير</span>
        <span class="es-spark" style="--d:.8s;top:-8%;right:8%">✦</span><span class="es-spark" style="--d:1.5s;bottom:-6%;left:14%">✦</span><span class="es-spark" style="--d:2.2s;top:50%;right:-10%">✧</span>
        <div style="position:absolute;top:-56px;inset-inline-end:-10px">${mark('sm')}</div>
      </div>
      <div><p class="es-eyebrow">// KOSIF EARTH</p>${head('es-h3')}<p class="es-sub" style="--d:2.4s">محاسبة ومراجعة وأدوات، وبيانات كل شركة تبقى في مساحتها وحدها.</p>
        <div class="es-chips"><span class="es-chip" style="--i:0">المحاسبة الكاملة</span><span class="es-chip" style="--i:1">المراجعة والتدقيق</span><span class="es-chip" style="--i:2">الأدوات المساعدة</span></div></div>
    </div>`),
    type: { id: 'es-h3', parts: ['شركتك، في مساحة ', { acc: 'مستقلة.' }], at: 0.4 } });
  S.push({ t: 14.8, len: 5.4, el: h('div', 'es-scene', `
    <div style="display:grid;justify-items:center;gap:8px;width:100%;position:relative">
      <div class="es-steps"><div class="es-step" style="--i:0"><i>١</i>هدفك</div><div class="es-step" style="--i:1"><i>٢</i>الخطوات</div><div class="es-step" style="--i:2"><i>٣</i>النتيجة</div><div class="es-step" style="--i:3"><i>✓</i>التقرير</div></div>
      <div class="es-card" style="--d:1.6s"><h4>أدخل شركتك</h4><div class="in"><b id="es-url"></b></div><span class="btn">إنشاء الشركة وفتحها ←</span></div>
      <div style="position:absolute;bottom:-10px;inset-inline-start:4%">${mark('sm')}</div>
      <div style="margin-top:16px;text-align:center"><p class="es-eyebrow">// الطريق</p>${head('es-h4')}</div>
    </div>`),
    type: { id: 'es-h4', parts: ['ابدأ بالهدف، ', { acc: 'وانتهِ بالنتيجة.' }], at: 3.4 }, extra: { id: 'es-url', text: 'شركة الواحة الذهبية', at: 2.4 } });
  S.push({ t: 20.2, len: 5.2, el: h('div', 'es-scene', `
    <div class="es-conf" id="es-conf"></div>
    <div class="es-wrap">
      <div style="position:relative">
        <div class="es-win es-chart" style="--d:.2s">
          <div class="hd"><span class="lg">✦</span><b>شركتك</b><span class="cta">افتح التقرير ↗</span></div>
          <div class="tiles"><i></i><i></i><i></i></div>
          <svg viewBox="0 0 480 120" preserveAspectRatio="none"><defs><linearGradient id="esg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#a7eabb" stop-opacity=".35"/><stop offset="1" stop-color="#a7eabb" stop-opacity="0"/></linearGradient></defs>
            <path class="area" d="M10 100 L70 92 L130 96 L190 70 L250 76 L310 50 L370 56 L430 24 L470 18 L470 120 L10 120 Z"/>
            <path class="line" d="M10 100 L70 92 L130 96 L190 70 L250 76 L310 50 L370 56 L430 24 L470 18"/></svg>
        </div>
        <svg class="es-arc" viewBox="0 0 160 90"><path d="M10 70 C 40 0, 110 0, 150 60"/></svg>
        <div class="es-mini"><i></i><i></i><i></i><i style="width:70%"></i></div>
        <div style="position:absolute;bottom:-50px;inset-inline-end:6%">${mark('sm')}</div>
      </div>
      <div><p class="es-eyebrow">// النتيجة</p>${head('es-h5')}<p class="es-sub" style="--d:2.6s">كل رقم في التقرير له مصدر في الدفاتر — ويُفتح بنقرة.</p></div>
    </div>`),
    type: { id: 'es-h5', parts: ['من القيد ', { acc: 'إلى القرار.' }], at: 0.5 } });
  S.push({ t: 25.4, len: 5.4, el: h('div', 'es-scene', `
    <div class="es-ring-big"></div>
    <div class="es-outro">${mark()}<div class="wm"><span id="es-wm"></span><small>EARTH</small></div>
      <h2 class="es-h" id="es-h6"></h2><p class="tag">دفاترك. مراجعتك. قرارك.</p><p class="url">earth.kosif.pp.ua · محاسبة · مراجعة · أدوات</p></div>`),
    type: { id: 'es-h6', parts: [{ acc: 'عالم جديد للمحاسبة الذكية.' }], at: 1.2 }, extra: { id: 'es-wm', text: 'KOSIF', at: 0.6, fast: true } });
  const TOTAL = 30.8;

  /* ---- confetti (deterministic positions) ---- */
  const COL = ['#a7eabb', '#e5f4e9', '#ffffff', '#176b4b', '#d7edc5'];
  const confetti = (host) => { let s = 7; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < 28; i++) { const d = h('i'); d.style.cssText = `--x:${(20 + r() * 60).toFixed(1)}%;--y:${(30 + r() * 40).toFixed(1)}%;--s:${(5 + r() * 7).toFixed(0)}px;--c:${COL[i % COL.length]};--dx:${((r() - .5) * 220).toFixed(0)}px;--dy:${(-60 - r() * 160).toFixed(0)}px;--d:${(r() * .5).toFixed(2)}s`; host.appendChild(d); } };

  /* ---- typewriter: a headline with one accent word, caret while typing, underline when done ---- */
  const timers = new Set();
  const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; };
  function typeInto(el, parts, speed) {
    el.innerHTML = ''; const caret = h('i', 'es-caret'); el.appendChild(caret);
    const q = []; for (const p of parts) { const acc = typeof p === 'object'; const text = acc ? p.acc : p; const span = acc ? h('span', 'es-acc') : document.createTextNode(''); for (const ch of text) q.push({ span, ch, acc }); }
    let i = 0;
    const tick = () => {
      if (i >= q.length) { caret.remove(); el.querySelectorAll('.es-acc').forEach(a => a.classList.add('under')); return; }
      const { span, ch, acc } = q[i++];
      if (acc) { if (!span.parentNode) el.insertBefore(span, caret); span.textContent += ch; }
      else { if (!span.parentNode) el.insertBefore(span, caret); span.textContent += ch; }
      later(tick, ch === ' ' ? speed * .6 : speed);
    };
    tick();
  }

  /* ---- the stage, the clock, the controls ---- */
  const stage = h('div', 'es-stage'); stage.id = 'kosif-earth-story'; stage.setAttribute('aria-hidden', 'true');
  S.forEach(s => stage.appendChild(s.el));
  const veil = overlay.querySelector('.earth-intro__veil'); if (veil) veil.after(stage); else overlay.appendChild(stage);
  const shell = document.querySelector('.shell'); const prevInert = !!(shell && shell.inert);
  let closed = false, raf = 0, t0 = 0;
  const finish = () => {
    if (closed) return; closed = true;
    timers.forEach(clearTimeout); timers.clear(); if (raf) cancelAnimationFrame(raf);
    overlay.classList.remove('is-playing', 'es-film', 'es-story'); overlay.hidden = true;
    if (video) { try { video.pause(); video.removeAttribute('src'); video.load(); } catch {} }
    if (shell) shell.inert = prevInert;
    try { sessionStorage.setItem('kosif-earth-intro-seen-v1', '1'); } catch {}
    document.removeEventListener('keydown', keys);
    const first = document.querySelector('#gate-list button'); if (first && first.focus) first.focus();
  };
  const keys = e => {
    if (e.key === 'Escape') { e.preventDefault(); finish(); return; }
    if (e.key === 'Tab') { const c = [skip, enter]; if (e.shiftKey && document.activeElement === c[0]) { e.preventDefault(); c[1].focus(); } else if (!e.shiftKey && document.activeElement === c[1]) { e.preventDefault(); c[0].focus(); } }
  };
  function show(i) {
    const s = S[i]; if (!s) return;
    if (i > 0) { const p = S[i - 1].el; p.classList.add('off'); later(() => { p.classList.remove('on', 'off'); }, 520); }
    s.el.classList.add('on');
    if (s.type) later(() => { const el = document.getElementById(s.type.id); if (el) typeInto(el, s.type.parts, 48); }, s.type.at * 1000);
    if (s.extra) later(() => { const el = document.getElementById(s.extra.id); if (el) typeInto(el, [s.extra.text], s.extra.fast ? 90 : 60); }, s.extra.at * 1000);
    const conf = s.el.querySelector('#es-conf'); if (conf && !conf.children.length) confetti(conf);
  }
  /* the cold open: the film already on the published site (mobile source, the 4K one on wide fast desktops), ≤ 7 s, then the story */
  const FILM_MAX = 7;
  let filmLen = 0;
  function film(next) {
    const src = video && (prefers('(min-width: 1100px)') && video.dataset.src4k && !(conn && /2g|3g/.test(conn.effectiveType || '')) ? video.dataset.src4k : video.dataset.src);
    if (!video || !src) return next();
    let done = false; const go = () => { if (done) return; done = true; overlay.classList.remove('es-film'); video.pause(); next(); };
    overlay.classList.add('es-film');
    if (sound) sound.addEventListener('click', () => { video.muted = !video.muted; sound.setAttribute('aria-pressed', String(!video.muted)); sound.textContent = video.muted ? 'تشغيل الصوت' : 'كتم الصوت'; });
    video.addEventListener('ended', go, { once: true }); video.addEventListener('error', go, { once: true });
    video.src = src; video.muted = true; video.load();
    const p = video.play(); if (p && p.catch) p.catch(go);
    later(go, FILM_MAX * 1000);
  }
  function play() {
    overlay.hidden = false; overlay.classList.add('is-playing');
    if (shell) shell.inert = true;
    document.addEventListener('keydown', keys); skip.addEventListener('click', finish); enter.addEventListener('click', finish);
    skip.focus();
    const t1 = performance.now();
    film(() => { filmLen = (performance.now() - t1) / 1000; overlay.classList.add('es-story'); story(); });
  }
  function story() {
    S.forEach((s, i) => later(() => show(i), s.t * 1000));
    later(finish, TOTAL * 1000);
    t0 = performance.now();
    const prog = () => { if (closed) return; overlay.style.setProperty('--es-p', Math.min(1, (performance.now() - t0) / (TOTAL * 1000)).toFixed(3)); raf = requestAnimationFrame(prog); };
    raf = requestAnimationFrame(prog);
    /* the pane / a hidden tab paints no frames: the bar still lands */
    later(() => overlay.style.setProperty('--es-p', '1'), TOTAL * 1000 - 300);
  }
  window.KOSIFStory = Object.freeze({ finish, scenes: S.length, total: TOTAL, filmMax: FILM_MAX, film: () => filmLen, at: () => (performance.now() - t0) / 1000 });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', play, { once: true }); else play();
})();
