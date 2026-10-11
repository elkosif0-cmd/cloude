// FOUNDATION §3.6 Relationship Health / Integration Monitor — the books' «صحة الروابط» tab: the model distributor's links are
// all healthy and a recorded run lands in the history; then the links are broken on purpose — a branch its entries name is
// removed, a cost centre is mapped to an account not in the chart, a receivable is posted with no party — and each is
// named with its source and a repair, the status turns to «روابط مكسورة», and «فتح» takes the user to the right tab.
//   node tools/relationship_health_e2e.mjs http://127.0.0.1:8765/
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const base = (process.argv[2] || 'http://127.0.0.1:8765/').replace(/[?#].*$/, '').replace(/(index|app-safe)\.html$/, '').replace(/\/?$/, '/');
const fails = [], ok = (name, cond, detail) => { if (!cond) fails.push(name + (detail ? ' — ' + detail : '')); };
const ready = (p) => p.waitForFunction(() => window.SK && window.SKosifCore && window.SKosifSpace && SK.demo && SK.demo.settled() && !document.querySelector('.skdemo-overlay') && !SKosifSpace.busy() && window.SKosifLedger, null, { timeout: 120000 });

const browser = await chromium.launch();
try {
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const p = await ctx.newPage(), errors = [];
  p.on('pageerror', (e) => errors.push(String(e)));
  await p.goto(base + 'index.html', { waitUntil: 'domcontentloaded', timeout: 90000 }); await p.waitForSelector('#gate-list .gate', { timeout: 30000 });
  await p.click('#gate-list .gate[data-gate="accounting"]'); await p.click('#sector-list .sector[data-sector="trade"]');
  await p.waitForSelector('#co-list .co[data-id="model-trade"]', { timeout: 10000 }); await p.click('#co-list .co[data-id="model-trade"]');
  await p.waitForURL(/\/app-safe(\.html)?([?#]|$)/, { timeout: 30000 }); await ready(p); await p.waitForFunction(() => SKosifLedger.entries().length > 0, null, { timeout: 60000 }).catch(() => {});
  const open = async () => { await p.evaluate(() => SKosifLedger.open('links')); await p.waitForTimeout(1200); };
  const view = () => p.evaluate(() => { const c = document.querySelector('[data-rh]'); return c ? { status: c.dataset.rhStatus, clean: !!c.querySelector('[data-rh-clean]'),
    findings: [...c.querySelectorAll('tr[data-rh-link]')].map((r) => ({ link: r.dataset.rhLink, sev: r.dataset.rhSeverity, text: r.textContent })), history: c.querySelectorAll('[data-rh-history] tbody tr').length } : null; });
  await open();
  const v0 = await view();
  ok('every company has the links tab', !!v0, 'no [data-rh]');
  ok('the model distributor\'s links are all healthy', v0 && v0.status === 'ok' && v0.clean && !v0.findings.length, JSON.stringify(v0));
  await p.click('[data-l="rh-run"]'); await p.waitForTimeout(700);
  ok('a recorded run lands in the dated history', (await view()).history === 1);
  /* break three links on purpose */
  await p.evaluate(() => {
    const k = 'skosif_ledger_v1', d = JSON.parse(localStorage.getItem(k));
    d.branches = d.branches.filter((b) => b !== 'فرع جدة'); localStorage.setItem(k, JSON.stringify(d));
    SKosifCompanyPlatform.addDefinition('costCenters', { name: 'الفرع الشمالي', accountCode: '7777' });
    const a = SKosifLedger.accounts(), id = (c) => a.find((x) => x.code === c).id;
    SKosifLedger.postEntry({ id: 'x', date: '2026-10-05', reference: 'MAN-1', memo: 'قيد يدوي على العملاء', lines: [{ accountId: id('1200'), debit: 50, credit: 0 }, { accountId: id('4000'), debit: 0, credit: 50 }] }, { source: 'يدوي', sourceId: 'manual:1' });
  });
  await open();
  const v1 = await view(), has = (link, re) => v1 && v1.findings.some((f) => f.link === link && re.test(f.text));
  ok('the status turns to broken links', v1 && v1.status === 'fail', JSON.stringify(v1 && v1.status));
  ok('the removed branch is named: entries refer to a branch that no longer exists', has('reference', /فرع غير موجود.*فرع جدة/), JSON.stringify(v1 && v1.findings));
  ok('the cost centre mapped to account 7777 is named with its repair', has('mapping', /الفرع الشمالي → 7777.*أعد ربط التعريف/));
  ok('the receivable without a party is a warning', v1 && v1.findings.some((f) => f.link === 'party' && f.sev === 'warn'));
  await p.click('tr[data-rh-link="mapping"] [data-ledger-open]'); await p.waitForTimeout(1000);
  ok('«فتح» on a mapping finding takes the user to the chart of accounts', await p.evaluate(() => !!document.querySelector('[data-sk-tabs="ledger"] [data-tab="accounts"][aria-selected="true"], [data-sk-tabs="ledger"] .active[data-tab="accounts"]') || /دليل الحسابات/.test((document.querySelector('[data-sk-tabs="ledger"] [aria-selected="true"]') || {}).textContent || '')));
  await open(); await p.click('[data-l="rh-run"]'); await p.waitForTimeout(700);
  const v2 = await view();
  ok('the second run is recorded too', v2 && v2.history === 2, JSON.stringify(v2 && v2.history));
  ok('no page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
} finally { await browser.close(); }

if (fails.length) { console.error('Relationship health: ' + fails.length + ' failed\n- ' + fails.join('\n- ')); process.exit(1); }
console.log('Relationship health: all checks OK');
