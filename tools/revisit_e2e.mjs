// SQC — screens opened again keep one set of listeners (regression test for the helpers' revisit bug).
// The app reuses a screen's host element on every visit; a screen that attached its listeners on each render stacked
// them, so one click ran its handler once per visit (in the product tree the second handler undid the first, so no
// arrow could be drawn). For each screen, on a laptop and on a phone, on the first visit and after the third:
//   • the host keeps exactly the click listeners it had after the first visit (read through the DevTools protocol);
//   • one user action has exactly one effect: a supplier → material arrow opens one price dialog and adds exactly one
//     supplier link and one supplier price; an item report opens exactly one print preview.
// Usage: node tools/revisit_e2e.mjs [url]
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright'); /* resolved through NODE_PATH in CI, like ui_smoke */

const URL_ = process.argv[2] || 'http://localhost:8765/app-safe.html';
const failures = [], passed = [];
const ok = (tag, name, cond, extra = '') => { const l = `${tag} ${cond ? '✓' : '✗'} ${name}${extra ? ' — ' + extra : ''}`; (cond ? passed : failures).push(l); console.log(l); };
const T0 = Date.now(); let phase = 'start';
const step = (s) => { phase = s; console.log(`[${((Date.now() - T0) / 1000).toFixed(1)}s] ${s}`); };
const watchdog = setTimeout(() => { console.error('revisit E2E timed out in phase: ' + phase); process.exit(2); }, 8 * 60 * 1000);
const browser = await chromium.launch(process.env.SQC_INSECURE ? { args: ['--ignore-certificate-errors'] } : {});

const SCREENS = [['ptree', '[data-pt-tab]'], ['salesmap', '[data-sm-tab]'], ['corpuslab', '.cl-co']];
for (const [tag, opts] of [['laptop', { viewport: { width: 1366, height: 900 } }], ['phone', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }]]) {
  const ctx = await browser.newContext(opts);
  ctx.setDefaultTimeout(20000);
  await ctx.addInitScript(() => { try { sessionStorage.setItem('sqc_space_chosen', '1'); } catch { /* private mode */ } });
  /* print previews open through window.open (the app may show them in-app): count the calls themselves */
  await ctx.addInitScript(() => { window.__opens = 0; const o = window.open; window.open = function (...a) { window.__opens++; return o.apply(this, a); }; });
  const p = await ctx.newPage(), cdp = await ctx.newCDPSession(p);
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  p.on('popup', async (w) => { await w.close().catch(() => {}); });
  const go = async (id, ms = 1500) => { await p.evaluate((x) => SKosifCore.go(x), id); await p.waitForTimeout(ms); };
  const clickListeners = async (inner) => {
    const { result } = await cdp.send('Runtime.evaluate', { expression: `document.querySelector(${JSON.stringify(inner)}).closest('.sk-view')` });
    if (!result.objectId) return -1;
    const { listeners } = await cdp.send('DOMDebugger.getEventListeners', { objectId: result.objectId });
    return listeners.filter((l) => l.type === 'click').length;
  };
  /* one supplier → material arrow: exactly one dialog, one link, one price */
  const drawSupplierArrow = async (label) => {
    await p.click('[data-pt-tab="arrows"]'); await p.waitForTimeout(500);
    await p.click('[data-pt-mode="link"]'); await p.waitForTimeout(300);
    const pick = await p.evaluate(() => {
      const t = SKosifProductTree.get(), sup = [...document.querySelectorAll('.pt-g.supplier')].map((g) => g.dataset.n)[0];
      const m = sup && t.materials.find((x) => !t.suppliers.some((s) => s.supplier === sup.slice(2) && s.materialId === x.id) && document.querySelector('.pt-g.material[data-n="' + x.id + '"]'));
      return sup && m ? { sup, mat: m.id } : null;
    });
    if (!pick) { ok(tag, label + ': supplier and unlinked material found', false); return; }
    const before = await p.evaluate(() => ({ links: SKosifProductTree.get().suppliers.length, prices: ((JSON.parse(localStorage.getItem('skosif_purchasing_v1') || '{}').prices) || []).length }));
    const tap = (id) => p.evaluate((n) => document.querySelector('.pt-g[data-n="' + CSS.escape(n) + '"]').dispatchEvent(new MouseEvent('click', { bubbles: true })), id);
    await tap(pick.sup); await p.waitForTimeout(250); await tap(pick.mat); await p.waitForTimeout(500);
    const dialogs = await p.locator('form.skd').count();
    if (dialogs) { await p.fill('form.skd input[name="p"]', '41.5'); await p.click('form.skd button[type="submit"]'); await p.waitForTimeout(500); }
    while (await p.locator('.skd-wrap').count()) { await p.keyboard.press('Escape'); await p.waitForTimeout(150); }
    const after = await p.evaluate(() => ({ links: SKosifProductTree.get().suppliers.length, prices: ((JSON.parse(localStorage.getItem('skosif_purchasing_v1') || '{}').prices) || []).length }));
    ok(tag, label + ': one arrow opens one price dialog and adds exactly one supplier link and one price', dialogs === 1 && after.links === before.links + 1 && after.prices === before.prices + 1,
      `dialogs=${dialogs} links+${after.links - before.links} prices+${after.prices - before.prices}`);
    await p.click('[data-pt-mode="move"]').catch(() => {});
  };
  /* an item report: exactly one preview (window.open, or the app's in-app preview overlay) */
  const printItemOnce = async (label) => {
    await p.click('[data-sm-tab="item"]'); await p.waitForTimeout(700);
    await p.evaluate(() => { window.__prev = 0; const o = window.open; window.__open0 = o; window.open = function (...a) { window.__prev++; return o.apply(this, a); }; });
    await p.click('[data-sm="print-item"]'); await p.waitForTimeout(1200);
    const n = await p.evaluate(() => { const c = window.__prev; window.open = window.__open0; document.querySelectorAll('.skout').forEach((x) => x.remove()); return c; });
    ok(tag, label + ': one click opens exactly one item-report preview', n === 1, `previews=${n}`);
  };
  /* a toolbar action: «+ مادة خام» opens exactly one form (a stacked handler opens one per listener) */
  const addMaterialOnce = async (label) => {
    await p.click('[data-pt-tab="tree"]'); await p.waitForTimeout(400);
    const m0 = await p.evaluate(() => SKosifProductTree.get().materials.length);
    await p.click('[data-pt="add-m"] >> nth=0'); await p.waitForTimeout(500);
    const forms = await p.locator('form.skd').count();
    while (await p.locator('.skd-wrap').count()) { await p.keyboard.press('Escape'); await p.waitForTimeout(150); }
    const m1 = await p.evaluate(() => SKosifProductTree.get().materials.length);
    ok(tag, label + ': «+ مادة خام» opens exactly one form, and cancelling adds nothing', forms === 1 && m1 === m0, `forms=${forms}`);
  };
  step(tag + ' · first visit');
  await p.goto(URL_); await p.waitForTimeout(7000);
  /* the first visit of each screen: its listeners, and the actions behaving as before */
  const first = {};
  for (const [id, inner] of SCREENS) {
    await go(id); first[id] = await clickListeners(inner);
    if (id === 'ptree') { await addMaterialOnce('first visit'); await drawSupplierArrow('first visit'); }
    if (id === 'salesmap') await printItemOnce('first visit');
  }
  ok(tag, 'first visit: every screen has its click handler', Object.values(first).every((n) => n >= 1), JSON.stringify(first));

  step(tag + ' · revisits (each screen opened three times in all)');
  for (const [id] of SCREENS) { await go('ledger', 400); await go(id, 900); } /* visit 2; visit 3 is the measuring one below */
  const third = {};
  for (const [id, inner] of SCREENS) { await go('ledger', 300); await go(id); third[id] = await clickListeners(inner); }
  ok(tag, 'after revisits: each host keeps exactly its first-visit click listeners', SCREENS.every(([id]) => third[id] === first[id]), JSON.stringify({ first, third }));
  await go('ptree'); await addMaterialOnce('after revisits'); await drawSupplierArrow('after revisits');
  await go('salesmap'); await printItemOnce('after revisits');
  ok(tag, 'no page errors', errs.length === 0, errs.slice(0, 2).join(' | '));
  await ctx.close();
}
await browser.close(); clearTimeout(watchdog);
if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log(`Revisit E2E: ${passed.length} checks OK on laptop and phone`);
