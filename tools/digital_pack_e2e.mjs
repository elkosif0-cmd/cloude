// FOUNDATION §3.7 «عمق قطاع التسويق الإلكتروني» / P3 — the digital-marketing pack behaves, not just labels: an agency
// created from the door gets «العملاء والحملات»; a three-month retainer is billed in advance as deferred revenue and earned
// month by month, the ad spend is owed to the platform, the spend is rebilled with the agency's markup (never beyond what
// was spent), and the campaign table's margin, ROAS and CAC agree with the books. Another sector has no such tab.
//   node tools/digital_pack_e2e.mjs http://127.0.0.1:8765/
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
  await p.waitForURL(/\/app-safe(\.html)?([?#]|$)/, { timeout: 30000 }); await ready(p);
  await p.evaluate(() => SKosifLedger.open('accounts')); await p.waitForTimeout(800);
  ok('a meat company has no campaigns tab', await p.evaluate(() => !document.querySelector('[data-sk-tabs="ledger"] [data-tab="digital"]')));
  await door('digital'); await p.waitForFunction(() => !document.getElementById('companies').hidden, null, { timeout: 10000 });
  await p.click('#co-add'); await p.fill('#co-name', 'وكالة التسويق للاختبار'); await p.click('#co-form button[type="submit"]');
  await p.waitForURL(/\/app-safe(\.html)?([?#]|$)/, { timeout: 30000 }); await ready(p); await p.waitForTimeout(800);
  await p.evaluate(() => SKosifLedger.open('digital')); await p.waitForTimeout(1000);
  ok('an agency has the clients and campaigns tab with its pack accounts', await p.evaluate(() => !!document.getElementById('dg-client')), await p.evaluate(() => SK.company.current().sector + ' ' + SKosifLedger.accounts().map((a) => a.code).join(',')));
  const B = (codes) => p.evaluate((codes) => Object.fromEntries(codes.map((c) => [c, SKosifLedger.balance(c, '2027-12-31')])), codes);
  // a retainer of 5,000 a month for three months from November, billed in advance
  await p.fill('#dg-client', 'متجر الورد'); await p.fill('#dg-camp', 'رمضان'); await p.fill('#dg-monthly', '5000'); await p.fill('#dg-months', '3'); await p.fill('#dg-start', '2026-11'); await p.fill('#dg-idate', '2026-11-01');
  await p.click('[data-l="dg-new"]'); await p.waitForTimeout(700);
  const b1 = await B(['1200', '2400', '2200']);
  ok('retainer: 15,000 deferred, VAT 2,250, the client owes 17,250', b1['1200'] === 17250 && b1['2400'] === -15000 && b1['2200'] === -2250, JSON.stringify(b1));
  const op = async (kind, o) => { await p.selectOption('#dg-op', kind); for (const [k, v] of Object.entries(o)) await p.fill('#dg-' + k, v); await p.click('[data-l="dg-post"]'); await p.waitForTimeout(700); };
  const err = () => p.evaluate(() => document.getElementById('dg-err2').textContent);
  await op('recognise', { month: '2026-12', date: '2026-12-31' });
  const b2 = await B(['2400', '4080']);
  ok('recognition through December: two months earned (10,000), 5,000 still deferred', b2['2400'] === -5000 && b2['4080'] === -10000, JSON.stringify(b2));
  await op('recognise', { month: '2026-12', date: '2026-12-31' });
  ok('the same months are not recognised twice', /لا أشهر/.test(await err()), await err());
  await op('spend', { plat: 'Meta', amt: '8000', date: '2026-11-15' });
  const b3 = await B(['5150', '2170']);
  ok('ad spend 8,000 expensed and owed to Meta', b3['5150'] === 8000 && b3['2170'] === -8000, JSON.stringify(b3));
  ok('the platform is the party of its payable', await p.evaluate(() => SKosifLedger.entries().some((e) => e.agency && e.agency.kind === 'spend' && e.party === 'Meta')));
  await op('rebill', { amt: '9000', mk: '10', date: '2026-11-30' });
  ok('rebilling more than was spent is refused', /فقط/.test(await err()), await err());
  await op('rebill', { amt: '8000', mk: '10', date: '2026-11-30' });
  const b4 = await B(['1200', '4080', '2200']);
  ok('rebill with a 10% markup: 8,800 revenue + VAT 1,320', b4['1200'] === 27370 && b4['4080'] === -18800 && b4['2200'] === -3570, JSON.stringify(b4));
  await op('results', { amt: '40000', newc: '94' });
  const row = await p.evaluate(() => { const r = document.querySelector('[data-dg-table] tr[data-campaign="رمضان"]'); return r ? [...r.cells].map((c) => c.textContent.trim()) : null; });
  // revenue 18,800 (10,000 earned + 8,800 rebilled) − spend 8,000 = 10,800 (57.45%); ROAS 40,000 ÷ 8,000 = 5x; CAC 18,800 ÷ 94 = 200
  ok('the campaign row: earned 18,800, deferred 5,000, nothing left to rebill, margin 10,800 (57.45%), ROAS 5x, CAC 200',
    row && /18,800/.test(row[3]) && /5,000/.test(row[4]) && /8,000/.test(row[5]) && /^0/.test(row[6].replace(/[^\d.,]/g, '')) && /10,800/.test(row[7]) && row[8] === '57.45٪' && row[9] === '5x' && /200/.test(row[10]), JSON.stringify(row));
  const tb = await p.evaluate(() => { const g = SKEngines.finance.ledger.buildGeneralLedger(SKosifLedger.entries()); return Math.round((g.reduce((s, x) => s + x.debit, 0) - g.reduce((s, x) => s + x.credit, 0)) * 100); });
  ok('the books stay balanced', tb === 0, String(tb));
  ok('no page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
} finally { await browser.close(); }

if (fails.length) { console.error('Digital pack: ' + fails.length + ' failed\n- ' + fails.join('\n- ')); process.exit(1); }
console.log('Digital pack: all checks OK');
