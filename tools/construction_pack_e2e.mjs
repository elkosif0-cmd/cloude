// FOUNDATION §3.7 «عمق قطاع المقاولات» / P3 — the construction pack behaves, not just labels: a company created under
// construction from the door gets «المشروعات والمستخلصات»; a contract of 1,000,000 with 10% retention and 20% advance
// recovery runs through an advance, two progress certificates, a subcontract cost and the retention release, and the
// books, the contract table and the margin agree. A company of another sector (the demo meat company) has no such tab.
//   node tools/construction_pack_e2e.mjs http://127.0.0.1:8765/
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const base = (process.argv[2] || 'http://127.0.0.1:8765/').replace(/[?#].*$/, '').replace(/(index|app-safe)\.html$/, '').replace(/\/?$/, '/');
const fails = [], ok = (name, cond, detail) => { if (!cond) fails.push(name + (detail ? ' — ' + detail : '')); };
const ready = (p) => p.waitForFunction(() => window.SK && window.SKosifCore && window.SKosifSpace && SK.demo && SK.demo.settled() && !document.querySelector('.skdemo-overlay') && !SKosifSpace.busy() && window.SKosifLedger, null, { timeout: 90000 });

const browser = await chromium.launch();
try {
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const p = await ctx.newPage(), errors = [];
  p.on('pageerror', (e) => errors.push(String(e)));
  const door = async (sector) => { await p.goto(base + 'index.html', { waitUntil: 'domcontentloaded', timeout: 90000 }); await p.waitForSelector('#gate-list .gate', { timeout: 30000 });
    await p.click('#gate-list .gate[data-gate="accounting"]'); await p.click('#sector-list .sector[data-sector="' + sector + '"]'); };
  await door('meat'); await p.waitForSelector('#co-list .co[data-id="demo-co"]', { timeout: 10000 }); await p.click('#co-list .co[data-id="demo-co"]');
  await p.waitForURL(/app-safe\.html/, { timeout: 30000 }); await ready(p);
  await p.evaluate(() => SKosifLedger.open('accounts')); await p.waitForTimeout(800);
  ok('a meat company has no projects tab', await p.evaluate(() => !document.querySelector('[data-sk-tabs="ledger"] [data-tab="projects"]')));
  await door('construction'); await p.waitForFunction(() => !document.getElementById('companies').hidden, null, { timeout: 10000 });
  await p.click('#co-add'); await p.fill('#co-name', 'شركة المقاولات للاختبار'); await p.click('#co-form button[type="submit"]');
  await p.waitForURL(/app-safe\.html/, { timeout: 30000 }); await ready(p); await p.waitForTimeout(800);
  await p.evaluate(() => SKosifLedger.open('projects')); await p.waitForTimeout(1000);
  ok('a construction company has the projects tab with its pack accounts', await p.evaluate(() => !!document.getElementById('pj-proj')), await p.evaluate(() => SK.company.current().sector + ' ' + SKosifLedger.accounts().map((a) => a.code).join(',')));
  await p.fill('#pj-proj', 'برج الواحة'); await p.fill('#pj-cust', 'شركة التطوير'); await p.fill('#pj-val', '1000000'); await p.fill('#pj-ret', '10'); await p.fill('#pj-rec', '20'); await p.fill('#pj-bud', '800000');
  await p.click('[data-l="pj-new"]'); await p.waitForTimeout(600);
  const op = async (kind, amount) => { await p.selectOption('#pj-op', kind); await p.fill('#pj-amt', amount); await p.click('[data-l="pj-post"]'); await p.waitForTimeout(600); };
  const B = (codes) => p.evaluate((codes) => Object.fromEntries(codes.map((c) => [c, SKosifLedger.balance(c)])), codes);
  await op('advance', '150000');
  const b1 = await B(['1100', '2320', '2200']);
  ok('advance: 150,000 + VAT 22,500 in cash, the advance liability 150,000', b1['1100'] === 172500 && b1['2320'] === -150000 && b1['2200'] === -22500, JSON.stringify(b1));
  await op('certificate', '300000');
  const b2 = await B(['1200', '1220', '2320', '4070', '2200']);
  ok('certificate 1: work 300,000, retention 30,000, recovery 60,000, VAT 36,000, the customer owes 246,000', b2['4070'] === -300000 && b2['1220'] === 30000 && b2['2320'] === -90000 && b2['1200'] === 246000 && b2['2200'] === -58500, JSON.stringify(b2));
  await op('certificate', '300000');
  ok('the same work certified again is refused', await p.evaluate(() => /لا أعمال جديدة/.test(document.getElementById('pj-err2').textContent)));
  await op('cost-5130', '220000');
  const row = await p.evaluate(() => { const r = document.querySelector('[data-pj-table] tr[data-project="برج الواحة"]'); return r ? [...r.cells].map((c) => c.textContent.trim()) : null; });
  ok('the contract table: 30% complete, retention 30,000, advance left 90,000, cost 220,000, margin 80,000, 27.5% by cost', row && row[3] === '30٪' && /30,000/.test(row[4]) && /90,000/.test(row[5]) && /220,000/.test(row[6]) && /80,000/.test(row[7]) && row[8] === '27.5٪', JSON.stringify(row));
  await op('certificate', '900000');
  const b3 = await B(['2320', '1220', '4070']);
  ok('certificate 2: the recovery stops at the advance left (90,000), retention 60,000 more', b3['2320'] === 0 && b3['1220'] === 90000 && b3['4070'] === -900000, JSON.stringify(b3));
  await op('release', '');
  const b4 = await B(['1220']);
  ok('handover: the 90,000 retention released into the receivable', b4['1220'] === 0, JSON.stringify(b4));
  const tb = await p.evaluate(() => { const g = SKEngines.finance.ledger.buildGeneralLedger(SKosifLedger.entries()); return Math.round((g.reduce((s, x) => s + x.debit, 0) - g.reduce((s, x) => s + x.credit, 0)) * 100); });
  ok('the books stay balanced', tb === 0, String(tb));
  ok('no page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
} finally { await browser.close(); }

if (fails.length) { console.error('Construction pack: ' + fails.length + ' failed\n- ' + fails.join('\n- ')); process.exit(1); }
console.log('Construction pack: all checks OK');
