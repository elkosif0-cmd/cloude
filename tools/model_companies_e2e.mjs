// FOUNDATION §3.6 «نماذج محاسبية افتراضية إلزامية» — every sector's reference model company opens from the front door with
// books that have really been through a cycle: the entries the engine generates (and nothing of the meat demo company),
// a balanced trial balance, the period closed at 30 September 2026 with a 2026 financial year, VAT quarters closed, and
// the sector's own screen reading the entries (the hospital's payers, the school's deferred fees, the factory's WIP), and
// the close tab's cycle proof green on every step (PRODUCT_MANDATE P2).
//   node tools/model_companies_e2e.mjs http://127.0.0.1:8765/
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const base = (process.argv[2] || 'http://127.0.0.1:8765/').replace(/[?#].*$/, '').replace(/(index|app-safe)\.html$/, '').replace(/\/?$/, '/');
const fails = [], ok = (name, cond, detail) => { if (!cond) fails.push(name + (detail ? ' — ' + detail : '')); };
const ready = (p) => p.waitForFunction(() => window.SK && window.SKosifCore && window.SKosifSpace && SK.demo && SK.demo.settled() && !document.querySelector('.skdemo-overlay') && !SKosifSpace.busy() && window.SKosifLedger, null, { timeout: 120000 });
const MODELS = [['model-health', 'health'], ['model-education', 'education'], ['model-meat-factory', 'meat'], ['model-manufacturing', 'manufacturing'], ['model-bakery', 'bakery'], ['model-agriculture', 'agriculture'], ['model-trade', 'trade']];

const browser = await chromium.launch();
try {
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const p = await ctx.newPage(), errors = [];
  p.on('pageerror', (e) => errors.push(String(e)));
  for (const [id, sector] of MODELS) {
    await p.goto(base + 'index.html', { waitUntil: 'domcontentloaded', timeout: 90000 }); await p.waitForSelector('#gate-list .gate', { timeout: 30000 });
    await p.click('#gate-list .gate[data-gate="accounting"]'); await p.click('#sector-list .sector[data-sector="' + sector + '"]');
    await p.waitForSelector('#co-list .co[data-id="' + id + '"][data-model="1"]', { timeout: 10000 }); await p.click('#co-list .co[data-id="' + id + '"]');
    await p.waitForURL(/\/app-safe(\.html)?([?#]|$)/, { timeout: 30000 }); await ready(p);
    await p.waitForFunction(() => SKosifLedger.entries().length > 0, null, { timeout: 60000 }).catch(() => {});
    const r = await p.evaluate((id) => {
      const co = SK.company.current(), want = SKEngines.system.modelBooks.modelBooks(id), es = SKosifLedger.entries();
      const g = SKEngines.finance.ledger.buildGeneralLedger(es), tb = Math.round((g.reduce((s, x) => s + x.debit, 0) - g.reduce((s, x) => s + x.credit, 0)) * 100);
      const ids = new Set(SKosifLedger.accounts().map((a) => a.id));
      return { co: co.id, sector: co.sector, model: co.model, period: co.period && co.period.label, entries: es.length, want: want.entries.length, tb, lock: SKosifLedger.lockDate(),
        orphan: es.filter((e) => e.lines.some((l) => !ids.has(l.accountId))).length, meatDemo: es.filter((e) => String(e.id).startsWith('demo-je')).length,
        vatClosed: es.filter((e) => e.vatClose).length, bytes: (localStorage.getItem('skosif_ledger_v1') || '').length };
    }, id);
    ok(id + ': opened as a model company of its sector with its 2026 year', r.co === id && r.sector === sector && r.model && r.period === '2026', JSON.stringify(r));
    ok(id + ': every generated entry is in the books, none of the meat demo', r.entries === r.want && r.meatDemo === 0 && r.orphan === 0, JSON.stringify(r));
    ok(id + ': the trial balance balances, closed to 30 September, three VAT quarters closed', r.tb === 0 && r.lock === '2026-09-30' && r.vatClosed === 3, JSON.stringify(r));
    /* PRODUCT_MANDATE P2: operation → entry → ledger → trial balance → statements with the same numbers → sub-ledgers → close */
    await p.evaluate(() => SKosifLedger.open('close')); await p.waitForTimeout(1500);
    const proof = await p.evaluate(() => { const c = document.querySelector('[data-proof]'); return c ? { ok: c.dataset.proofOk, steps: [...c.querySelectorAll('tr[data-step]')].map((r) => r.dataset.step + ':' + r.dataset.status + (r.dataset.status === 'ok' ? '' : ' ' + r.cells[2].textContent)) } : null; });
    ok(id + ': the close tab proves the cycle — all six steps green', proof && proof.ok === '1' && proof.steps.length === 6 && proof.steps.every((x) => /:ok$/.test(x)), JSON.stringify(proof));
    /* P2 traceability: a statement line → its accounts → the account's entries in the general ledger */
    const traced = await p.evaluate(async () => { const box = document.querySelector('[data-proof-trace]'); const b = box && box.querySelector('[data-l="trace-acc"]'); if (!b) return null;
      box.open = true; const id = b.dataset.id, line = b.closest('tr').dataset.traceLine; b.click(); await new Promise((r) => setTimeout(r, 1500));
      const row = document.querySelector('[data-l="gl-acc"][data-id="' + id + '"]'); return { line, gl: !!row, selected: !!row && /brand-soft/.test(row.closest('tr').getAttribute('style') || ''), moves: /حركة:/.test(document.body.innerText) }; });
    ok(id + ': a statement line traces to its account and opens its entries in the general ledger', traced && traced.gl && traced.selected && traced.moves, JSON.stringify(traced));
    await p.evaluate(() => SKosifLedger.open('tb')); await p.waitForTimeout(1200);
    ok(id + ': the trial balance screen renders', await p.evaluate(() => !!document.querySelector('.sk-table') ), '');
    if (id === 'model-health') {
      ok('the hospital: more than 10 million revenue a month', await p.evaluate(() => { const rev = ['4010', '4020', '4030', '4040'].reduce((s, c) => s - SKosifLedger.balance(c, '2026-09-30'), 0); return rev / 9 > 10_000_000; }));
      await p.evaluate(() => SKosifLedger.open('claims')); await p.waitForTimeout(1500);
      const payers = await p.evaluate(() => [...document.querySelectorAll('[data-cl-payers] tr')].map((r) => r.textContent).join(' | '));
      ok('the hospital: the claims tab shows the three payers with their rejections', /بوبا العربية/.test(payers) && /التعاونية/.test(payers) && /ميدغلف/.test(payers), payers.slice(0, 300));
      ok('the hospital: its books fit the browser storage comfortably', r.bytes < 3_000_000, String(r.bytes));
    }
    if (id === 'model-education') ok('the school: fees still deferred and fees earned', await p.evaluate(() => SKosifLedger.balance('2410', '2026-09-30') < 0 && SKosifLedger.balance('4090', '2026-09-30') < 0));
    if (id === 'model-meat-factory') {
      ok('meat factory: 72 synthetic production batches with complete journals', await p.evaluate(() => {
        const es=SKosifLedger.entries();
        return es.filter(e=>e.meatBatch&&e.meatBatch.cutting).length===72 &&
          es.filter(e=>e.source==='مبيعات الجملة').length===72 &&
          es.filter(e=>e.source==='مشتريات').length>=144;
      }));
      ok('meat factory: large synthetic revenue and remaining inventory', await p.evaluate(() =>
        SKosifLedger.balance('4000','2026-09-30') < -800_000_000 &&
        SKosifLedger.balance('1320','2026-09-30') > 0 &&
        SKosifLedger.balance('1330','2026-09-30') > 0));
    }
    if (id === 'model-manufacturing') ok('the factory: no work left in progress', await p.evaluate(() => SKosifLedger.balance('1380', '2026-09-30') === 0));
    ok(id + ': a closed month refuses a new entry', await p.evaluate(() => { const a = SKosifLedger.accounts(), c = (k) => a.find((x) => x.code === k).id;
      const out = SKosifLedger.postEntry({ id: 'x', date: '2026-08-15', reference: 'T', memo: 'T', lines: [{ accountId: c('6300'), debit: 1, credit: 0 }, { accountId: c('1100'), debit: 0, credit: 1 }] }); return !out.ok && /مقفلة/.test(out.error); }));
  }
  ok('no page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
} finally { await browser.close(); }

if (fails.length) { console.error('Model companies: ' + fails.length + ' failed\n- ' + fails.join('\n- ')); process.exit(1); }
console.log('Model companies: all checks OK');
