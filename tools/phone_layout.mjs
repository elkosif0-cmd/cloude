// SQC — layout correctness on a phone (390×844, touch, RTL) and a laptop, screen by screen and tab by tab.
// For every screen of the registry, opened twice (another screen in between), and for every tab inside it:
//   • the page never scrolls sideways: the document's scroll width — html or body, whichever is wider — must not
//     exceed the document's client width. (On phones the layout viewport widens to fit wide content, so innerWidth
//     grows with the bug and cannot be the reference; the old smoke oracle compared against it and passed broken pages.)
//   • nothing is clipped: no visible control, table or panel lies outside the screen unless an ancestor scrolls
//     horizontally (a wide table inside a scrolling panel is fine; a button pushed off-screen is not);
//   • the screen's host keeps the click listeners it had on the first visit (duplicated handlers stack on revisits);
//   • HOME / SHELL, on every viewport (320px included): the command center, the top bar (menu, logo, search,
//     notifications, user), the company and period controls and the bottom tab bar stay on screen, the RTL page does not
//     start scrolled or right-clipped, and three visits do not grow its listeners;
//   • the document is right-to-left, and dialogs fit the screen and scroll inside;
//   • the startup overlays fit, on a 390px and a 320px phone: the demo-loading card shown on a first start (measured the
//     moment it appears) keeps a 12px gutter on both sides so both rounded sides stay visible, its RTL text stays inside
//     it, and the document does not scroll sideways; the helpers' company chooser stays inside the screen.
// Usage: node tools/phone_layout.mjs [url] [--only=id1,id2]   (SQC_INSECURE=1 behind an intercepting proxy)
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright'); /* resolved through NODE_PATH in CI, like ui_smoke */
import fs from 'node:fs';

const URL_ = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'http://localhost:8765/app-safe.html';
const only = (process.argv.find((a) => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
const caps = JSON.parse(fs.readFileSync(new URL('../ui/core/capabilities.json', import.meta.url), 'utf8')).capabilities.filter((c) => !only.length || only.includes(c.id));
const T0 = Date.now(); let phase = 'start';
const step = (s) => { phase = s; };
const watchdog = setTimeout(() => { console.error(`phone layout: timed out after ${((Date.now() - T0) / 1000) | 0}s in ${phase}`); process.exit(2); }, 20 * 60 * 1000);
const failures = [];
const browser = await chromium.launch(process.env.SQC_INSECURE ? { args: ['--ignore-certificate-errors'] } : {});

/* measured in the page: sideways overflow of the document, and visible things outside the screen with no scrolling ancestor */
const MEASURE = () => {
  const de = document.documentElement, W = de.clientWidth;
  const over = Math.max(de.scrollWidth, document.body.scrollWidth) - W;
  const scrollsX = (el) => { for (let x = el.parentElement; x && x !== document.body; x = x.parentElement) { const o = getComputedStyle(x).overflowX; if (o === 'auto' || o === 'scroll') return true; } return false; };
  const fixedOrRail = (el) => { for (let x = el; x && x !== document.body; x = x.parentElement) { if (x.classList.contains('rail') || x.classList.contains('toasts') || x.classList.contains('skdemo-overlay')) return true; } return false; };
  const sx = window.scrollX, clipped = [];
  for (const el of document.querySelectorAll('#view button, #view a[href], #view input:not([type=hidden]), #view select, #view textarea, #view table, #view .card, #view [role=tab], .topbar, .topbar button, .topbar a, .topbar img, .topbar svg, .skb, .skb button, .skb a')) {
    const r = el.getBoundingClientRect(); if (!r.width || !r.height || getComputedStyle(el).visibility === 'hidden') continue;
    const L = r.left + sx, R = r.right + sx;
    if ((L < -2 || R > W + 2) && !scrollsX(el) && !fixedOrRail(el)) clipped.push(el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/)[0] : '') + '«' + (el.textContent || '').trim().slice(0, 18) + '»[' + Math.round(L) + ',' + Math.round(R) + ']');
  }
  return { over, clipped: clipped.slice(0, 4), rtl: de.dir === 'rtl' || getComputedStyle(de).direction === 'rtl' };
};
/* the tabs inside a screen (not the hub strip, which leads to other screens) */
const TABS = () => [...document.querySelectorAll('#view [role=tab], #view *')].filter((el) => (el.getAttribute('role') === 'tab' || [...el.attributes].some((a) => /^data-[a-z]+-tab$/.test(a.name))) && !el.closest('.skn-domain') && el.offsetParent !== null)
  .map((el, i) => { el.dataset.plTab = String(i); return String(i); }).filter((v, i, a) => a.indexOf(v) === i);

/* the small phone runs the startup overlays and dialogs only (the screens are covered at 390 and on the laptop) */
for (const [tag, opts, screensToo] of [['phone', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }, true], ['small-phone', { viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true }, false], ['laptop', { viewport: { width: 1366, height: 900 } }, true]]) {
  const ctx = await browser.newContext(opts);
  ctx.setDefaultTimeout(15000);
  await ctx.addInitScript(() => { try { sessionStorage.setItem('sqc_space_chosen', '1'); } catch { /* private mode */ } });
  /* the demo-loading overlay lives only while the first start fills the sample data: measure it as it appears */
  await ctx.addInitScript(() => {
    /* kept in sessionStorage: the first start reloads the page right after filling the sample data */
    const keep = (o) => { try { const a = JSON.parse(sessionStorage.getItem('pl_overlays') || '[]'); a.push(o); sessionStorage.setItem('pl_overlays', JSON.stringify(a)); } catch { /* private mode */ } };
    const measure = (o) => { const card = o.firstElementChild; if (!card) return; const de = document.documentElement, W = de.clientWidth, r = card.getBoundingClientRect();
      const texts = [...card.querySelectorAll('b,small')].map((t) => t.getBoundingClientRect()).filter((t) => t.width);
      keep({ W, left: Math.round(r.left), right: Math.round(r.right), textInside: texts.every((t) => t.left >= r.left - 1 && t.right <= r.right + 1), over: Math.max(de.scrollWidth, document.body.scrollWidth) - W, rtl: getComputedStyle(card).direction === 'rtl' }); };
    new MutationObserver((ms) => { for (const m of ms) for (const n of m.addedNodes) if (n.nodeType === 1 && n.classList.contains('skdemo-overlay')) { requestAnimationFrame(() => measure(n)); setTimeout(() => n.isConnected && measure(n), 250); } })
      .observe(document, { childList: true, subtree: true });
  });
  const p = await ctx.newPage(), cdp = await ctx.newCDPSession(p);
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  p.on('popup', (w) => w.close().catch(() => {}));
  step(tag + ' · load');
  await p.goto(URL_); await p.waitForFunction(() => window.SKosifCore && window.SKosifLedger && SKosifLedger.accounts().length > 3, { timeout: 45000 }); await p.waitForTimeout(1500);
  const listeners = async () => {
    const { result } = await cdp.send('Runtime.evaluate', { expression: "document.querySelector('#view .sk-view:not([hidden])') || document.querySelector('#view')" });
    if (!result.objectId) return -1;
    const { listeners: l } = await cdp.send('DOMDebugger.getEventListeners', { objectId: result.objectId, depth: 0 });
    return l.filter((x) => x.type === 'click').length;
  };
  const closeOverlays = () => p.evaluate(() => { document.querySelectorAll('.skd-wrap,.skout').forEach((x) => x.remove()); });
  let screens = 0, tabsSeen = 0;
  /* HOME / SHELL: the command center with the top bar (menu, logo, search, notifications, user), the company and
     period controls and the bottom tab bar — at first paint (an RTL page must not start scrolled or right-clipped)
     and on three visits (listeners must not grow). Runs on every viewport, the 320px phone included. */
  step(tag + ' · home/shell');
  const first = await p.evaluate(() => ({ sx: window.scrollX, sl: (document.scrollingElement || document.documentElement).scrollLeft, view: SKosifCore.view() }));
  if (first.sx !== 0 || first.sl !== 0) failures.push(`${tag} home: the page starts scrolled sideways (scrollX ${first.sx}, scrollLeft ${first.sl})`);
  const homeCounts = [];
  for (const visit of [1, 2, 3]) {
    if (visit > 1) { await p.evaluate(() => SKosifCore.go('tasks')); await p.waitForTimeout(250); }
    await p.evaluate(() => SKosifCore.go('dash')); await p.waitForTimeout(700); await closeOverlays();
    homeCounts.push(await listeners());
    const m = await p.evaluate(MEASURE);
    const shell = await p.evaluate(() => { const W = document.documentElement.clientWidth, sx = window.scrollX, need = ['.topbar', '.topbar .sk-tb-brand', '#sk-tb-user', '#sk-tb-bell', '.skt-search'], out = [];
      for (const sel of need) { const e = document.querySelector(sel); if (!e) continue; const r = e.getBoundingClientRect(); if (r.width && (r.left + sx < -1 || r.right + sx > W + 1)) out.push(sel + '[' + Math.round(r.left + sx) + ',' + Math.round(r.right + sx) + ']'); }
      return out; });
    if (m.over > 2) failures.push(`${tag} home (visit ${visit}): page scrolls sideways by ${m.over}px`);
    if (m.clipped.length || shell.length) failures.push(`${tag} home (visit ${visit}): clipped ${m.clipped.concat(shell).join(' ')}`);
    if (m.small && m.small.length) failures.push(`${tag} home (visit ${visit}): touch targets too small ${m.small.join(' ')}`);
    for (const t of await p.evaluate(TABS)) {
      const el = await p.$(`[data-pl-tab="${t}"]`); if (!el || !(await el.isVisible())) continue;
      await el.click({ timeout: 5000 }).catch(() => {}); await p.waitForTimeout(350); await closeOverlays();
      if (await p.evaluate(() => SKosifCore.view()) !== 'dash') { await p.evaluate(() => SKosifCore.go('dash')); await p.waitForTimeout(300); continue; }
      const mt = await p.evaluate(MEASURE);
      if (mt.over > 2 || mt.clipped.length) failures.push(`${tag} home › tab ${t} (visit ${visit}): ${mt.over > 2 ? 'scrolls sideways by ' + mt.over + 'px ' : ''}${mt.clipped.join(' ')}`);
      await p.evaluate(TABS);
    }
  }
  if (homeCounts[0] >= 0 && Math.max(...homeCounts) > homeCounts[0]) failures.push(`${tag} home: click listeners grew on revisits (${homeCounts.join(' → ')})`);
  for (const c of screensToo ? caps : []) {
    const counts = [];
    for (const visit of [1, 2]) {
      step(`${tag} · ${c.id} · visit ${visit}`);
      await p.evaluate(() => SKosifCore.go('home')).catch(() => {}); await p.waitForTimeout(120);
      await p.evaluate((id) => SKosifCore.go(id), c.id); await p.waitForTimeout(650); await closeOverlays();
      counts.push(await listeners());
      const m = await p.evaluate(MEASURE);
      if (!m.rtl) failures.push(`${tag} ${c.id}: document is not RTL`);
      if (m.over > 2) failures.push(`${tag} ${c.id} (visit ${visit}): page scrolls sideways by ${m.over}px`);
      if (m.clipped.length) failures.push(`${tag} ${c.id} (visit ${visit}): clipped ${m.clipped.join(' ')}`);
      const tabs = await p.evaluate(TABS);
      for (const t of tabs) {
        step(`${tag} · ${c.id} · visit ${visit} · tab ${t}`);
        const el = await p.$(`[data-pl-tab="${t}"]`); if (!el || !(await el.isVisible())) continue;
        const label = ((await el.textContent()) || '').trim().slice(0, 24);
        await el.click({ timeout: 5000 }).catch(() => {}); await p.waitForTimeout(450); await closeOverlays();
        if (await p.evaluate(() => SKosifCore.view()) !== c.id) { await p.evaluate((id) => SKosifCore.go(id), c.id); await p.waitForTimeout(400); continue; }
        const mt = await p.evaluate(MEASURE); tabsSeen++;
        if (mt.over > 2) failures.push(`${tag} ${c.id} › «${label}» (visit ${visit}): page scrolls sideways by ${mt.over}px`);
        if (mt.clipped.length) failures.push(`${tag} ${c.id} › «${label}» (visit ${visit}): clipped ${mt.clipped.join(' ')}`);
        await p.evaluate(TABS); /* re-tag after a repaint */
      }
    }
    if (counts[0] >= 0 && counts[1] > counts[0]) failures.push(`${tag} ${c.id}: click listeners grew on revisit (${counts[0]} → ${counts[1]})`);
    screens++;
  }
  /* startup overlays: the demo-loading card of this first start, and the helpers' company chooser */
  step(tag + ' · startup overlays');
  const ov = await p.evaluate(() => { try { return JSON.parse(sessionStorage.getItem('pl_overlays') || '[]'); } catch { return []; } });
  if (!ov.length) failures.push(`${tag}: the demo-loading overlay never appeared on a first start — it could not be measured`);
  /* the card keeps a side gutter (both rounded sides clearly visible), whatever font has loaded yet */
  for (const o of ov) if (o.left < 12 || o.right > o.W - 12 || !o.textInside || o.over > 2 || !o.rtl) failures.push(`${tag}: demo-loading card does not fit the screen ${JSON.stringify(o)}`);
  const ch = await p.evaluate(async () => { SKosifSpace.choose(); await new Promise((r) => setTimeout(r, 300)); const d = document.querySelector('#sqc-space .skd'), de = document.documentElement;
    if (!d) return null; const r = d.getBoundingClientRect(), out = { W: de.clientWidth, left: Math.round(r.left), right: Math.round(r.right), over: Math.max(de.scrollWidth, document.body.scrollWidth) - de.clientWidth, scrollsInside: d.scrollHeight <= d.clientHeight + 1 || /(auto|scroll)/.test(getComputedStyle(d).overflowY) };
    document.getElementById('sqc-space').remove(); return out; });
  if (!ch || ch.left < 0 || ch.right > ch.W || ch.over > 2 || !ch.scrollsInside) failures.push(`${tag}: company chooser does not fit the screen ${JSON.stringify(ch)}`);
  /* dialogs: fit the screen and scroll inside when tall */
  step(tag + ' · dialogs');
  const dlg = await p.evaluate(async () => {
    const fields = Array.from({ length: 18 }, (_, i) => ({ key: 'f' + i, label: 'حقل اختبار طويل رقم ' + (i + 1) + ' لقياس التمرير داخل النافذة', value: 'قيمة' }));
    const pr = SK.form('نافذة اختبار', fields, { ok: 'حفظ' }); await new Promise((r) => setTimeout(r, 300));
    const f = document.querySelector('form.skd'), r = f.getBoundingClientRect(), cs = getComputedStyle(f), de = document.documentElement;
    const out = { fits: r.left >= -1 && r.right <= de.clientWidth + 1, scrollsInside: f.scrollHeight <= f.clientHeight + 1 || /(auto|scroll)/.test(cs.overflowY), over: de.scrollWidth - de.clientWidth };
    document.querySelector('.skd-wrap [data-r="0"]').click(); await pr; return out;
  });
  if (!dlg.fits || !dlg.scrollsInside || dlg.over > 2) failures.push(`${tag}: dialog layout ${JSON.stringify(dlg)}`);
  if (errs.length) failures.push(`${tag}: page errors — ${[...new Set(errs)].slice(0, 3).join(' | ')}`);
  console.log(`${tag}: ${screens} screens × 2 visits, ${tabsSeen} tab views measured; demo-loading overlay measured ${ov.length}×`);
  await ctx.close();
}
await browser.close(); clearTimeout(watchdog);
if (failures.length) { console.error(failures.join('\n')); console.error(`phone layout: ${failures.length} problem(s)`); process.exit(1); }
console.log(`phone layout: OK — no sideways scrolling, no clipped controls, stable listeners, RTL, dialogs fit (${((Date.now() - T0) / 1000) | 0}s)`);
