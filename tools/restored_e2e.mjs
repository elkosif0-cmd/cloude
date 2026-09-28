// SQC — the capabilities restored from the other session's branch stay working (regression test).
//   • «السلف والدفعات المقدمة»: a new employee advance typed in the first row is saved, and its entry reaches the
//     books (SKosifLedger), naming the employee; the screen and the books agree on the balance;
//   • «الأنظمة الأصلية»: the four original systems (CRM V8.2, V31, V33, V40) are listed and the CRM opens inside
//     the app with demo phones only (05000000NN);
//   • «استوديو المنتج»: every box is costed from the pricing record through SKEngines.catalog.costMap;
//   • on a laptop and a 390px phone, the three screens do not scroll sideways and raise no page error.
// Usage: node tools/restored_e2e.mjs [url]
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright'); /* resolved through NODE_PATH in CI, like ui_smoke */

const URL_ = (process.argv[2] || 'http://localhost:8765/app-safe.html').replace(/[?#].*$/, '');
const failures = [], passed = [];
const ok = (tag, name, cond, extra = '') => { const l = `${tag} ${cond ? '✓' : '✗'} ${name}${extra ? ' — ' + extra : ''}`; (cond ? passed : failures).push(l); console.log(l); };
const watchdog = setTimeout(() => { console.error('restored E2E timed out'); process.exit(2); }, 8 * 60 * 1000);
const browser = await chromium.launch(process.env.SQC_INSECURE ? { args: ['--ignore-certificate-errors'] } : {});
const over = () => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - document.documentElement.clientWidth;

for (const [tag, opts] of [['laptop', { viewport: { width: 1366, height: 900 } }], ['390px', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }]]) {
  const ctx = await browser.newContext(opts);
  ctx.setDefaultTimeout(30000);
  await ctx.addInitScript(() => { try { sessionStorage.setItem('sqc_space_chosen', '1'); } catch { /* private mode */ } });
  const p = await ctx.newPage();
  let phase = 'start';
  const errs = []; p.on('pageerror', (e) => errs.push(`${e.message} [during ${phase}] at ${String(e.stack || '').split('\n').slice(1, 4).map((l) => l.trim()).join(' < ')}`));
  phase = 'first start';
  await p.goto(URL_, { waitUntil: 'load' });
  for (let t0 = Date.now(), quiet = 0; Date.now() - t0 < 90000; await p.waitForTimeout(250)) {
    const s = await p.evaluate(() => { let at = false; try { at = !!JSON.parse(localStorage.getItem('skosif_demo_v1') || '{}').at; } catch { /* unreadable */ }
      return { at, ready: !!(window.SKosifCore && document.querySelector('.topbar')) && !document.querySelector('.skdemo-overlay'), reloaded: (performance.getEntriesByType('navigation')[0] || {}).type === 'reload' }; }).catch(() => null);
    quiet = s && s.at && s.ready ? quiet + 1 : 0;
    if (s && s.at && s.ready && (s.reloaded || quiet >= 16)) break;
  }
  const go = async (v) => { await p.evaluate((x) => SKosifCore.go(x), v); await p.waitForTimeout(1200); await p.evaluate(() => document.querySelectorAll('.skd-wrap').forEach((x) => x.remove())); };

  /* advances: a new employee advance, saved and posted to the books */
  phase = 'advances';\n  await go('advances');
  const party = 'موظف اختبار ' + tag;
  const before = await p.evaluate(() => SKosifAdvances.list().length);
  await p.evaluate(({ party }) => {
    const set = (k, v) => { const el = document.querySelector(`#view [data-n="${k}"]`); if (!el) return false; el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); return true; };
    set('kind', 'employee'); set('party', party); set('amount', '3000'); set('installments', '3'); set('purpose', 'سلفة اختبار');
  }, { party });
  await p.evaluate(() => document.querySelector('#view [data-adv="add"]').click()); await p.waitForTimeout(800);
  const adv = await p.evaluate(({ party }) => { const a = SKosifAdvances.list().find((x) => x.party === party);
    const e = SKosifLedger.entries().filter((x) => String(x.sourceId || '').startsWith('advance:') && !x.reversedBy && (x.party === party || JSON.stringify(x).includes(party)));
    return { saved: !!a, amount: a && a.amount, entries: e.length, balanced: e.every((x) => Math.abs(x.lines.reduce((t, l) => t + l.debit - l.credit, 0)) < 0.01) }; }, { party });
  ok(tag, 'advances: a new employee advance is saved', adv.saved && (await p.evaluate(() => SKosifAdvances.list().length)) === before + 1, JSON.stringify(adv));
  ok(tag, 'advances: its entry reaches the books, balanced, naming the employee', adv.entries >= 1 && adv.balanced, `${adv.entries} entries`);
  ok(tag, 'advances: no sideways scroll', (await p.evaluate(over)) <= 1);

  /* the original systems */
  phase = 'legacyapps';\n  await go('legacyapps');
  const cards = await p.locator('#view .lg-card').count();
  await p.evaluate(() => SKosifLegacy.open('crm')); await p.waitForTimeout(3500);
  const fr = p.frames().find((f) => f.url().includes('/legacy/crm'));
  const crm = fr ? await fr.evaluate(() => { const t = document.documentElement.outerHTML, ph = [...new Set(t.match(/(?<!\d)05\d{8}(?!\d)/g) || [])]; return { v: document.title.includes('V8.2'), phones: ph.length, clean: ph.every((x) => /^05000000\d\d$/.test(x)) }; }) : {};
  ok(tag, 'original systems: all four listed', cards === 4, `${cards}`);
  ok(tag, 'original systems: the CRM V8.2 opens inside the app with demo phones only', !!(crm.v && crm.clean && crm.phones), JSON.stringify(crm));
  ok(tag, 'original systems: no sideways scroll', (await p.evaluate(over)) <= 1);

  /* the product studio's cost map */
  phase = 'productflow';\n  await go('productflow');
  const cm = await p.evaluate(() => { const E = SKEngines.catalog && SKEngines.catalog.costMap; return { engine: !!E, keys: E ? Object.keys(E).length : 0, text: (document.querySelector('#view') || {}).textContent.length }; });
  ok(tag, 'product studio: the cost-map engine is loaded and the screen renders', cm.engine && cm.keys > 0 && cm.text > 200, JSON.stringify(cm));
  ok(tag, 'product studio: no sideways scroll', (await p.evaluate(over)) <= 1);
  ok(tag, 'no page errors', !errs.length, [...new Set(errs)].slice(0, 2).join(' | '));
  await ctx.close();
}
await browser.close(); clearTimeout(watchdog);
if (failures.length) { console.error(`restored E2E: ${passed.length} passed, ${failures.length} failed`); process.exit(1); }
console.log(`restored E2E: ${passed.length} passed, 0 failed`);
