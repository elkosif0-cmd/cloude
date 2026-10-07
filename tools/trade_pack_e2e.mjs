// FOUNDATION §3.6 «التجارة» / P3 — the general-trade pack behaves, not just labels: a trading company created from the
// door gets «الفروع والهوامش»; two branches, stock bought for one and transferred to the other (more than it holds is
// refused), a cash sale with a discount, a credit sale refused without a limit and beyond it then allowed within it, and
// each branch's margin, discount rate and turnover agree with the books. The model distributor shows its two branches
// and three customers within their limits.
//   node tools/trade_pack_e2e.mjs http://127.0.0.1:8765/
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
  const door = async (sector) => { await p.goto(base + 'index.html', { waitUntil: 'domcontentloaded', timeout: 90000 }); await p.waitForSelector('#gate-list .gate', { timeout: 30000 });
    await p.click('#gate-list .gate[data-gate="accounting"]'); await p.click('#sector-list .sector[data-sector="' + sector + '"]'); };
  await door('trade'); await p.waitForFunction(() => !document.getElementById('companies').hidden, null, { timeout: 10000 });
  await p.click('#co-add'); await p.fill('#co-name', 'شركة التجارة للاختبار'); await p.click('#co-form button[type="submit"]');
  await p.waitForURL(/\/app-safe(\.html)?([?#]|$)/, { timeout: 30000 }); await ready(p); await p.waitForTimeout(800);
  await p.evaluate(() => SKosifLedger.open('trade')); await p.waitForTimeout(1000);
  ok('a trading company has the branches tab with 4100', await p.evaluate(() => !!document.getElementById('tr-branch') && SKosifLedger.accounts().some((a) => a.code === '4100')),
    await p.evaluate(() => SK.company.current().sector + ' ' + SKosifLedger.accounts().map((a) => a.code).join(',')));
  for (const b of ['الرياض', 'جدة']) { await p.fill('#tr-branch', b); await p.click('[data-l="tr-branch"]'); await p.waitForTimeout(500); }
  const B = (codes) => p.evaluate((codes) => Object.fromEntries(codes.map((c) => [c, SKosifLedger.balance(c, '2026-12-31')])), codes);
  const op = async (o) => { for (const [k, v] of Object.entries(o)) { if (['op', 'b', 'b2', 'pay'].includes(k)) await p.selectOption('#tr-' + k, v); else await p.fill('#tr-' + k, v); } await p.click('[data-l="tr-post"]'); await p.waitForTimeout(700); };
  const err = () => p.evaluate(() => document.getElementById('tr-err').textContent);
  await op({ op: 'purchase', b: 'الرياض', who: 'المورد', amt: '10000', date: '2026-07-01' });
  const b1 = await B(['1300', '1400', '2100']);
  ok('Riyadh buys 10,000 on credit with VAT 1,500', b1['1300'] === 10000 && b1['1400'] === 1500 && b1['2100'] === -11500, JSON.stringify(b1));
  await op({ op: 'transfer', b: 'الرياض', b2: 'جدة', amt: '20000', date: '2026-07-02' });
  ok('transferring more than Riyadh holds is refused', /أكثر من مخزون/.test(await err()), await err());
  await op({ op: 'transfer', b: 'الرياض', b2: 'جدة', amt: '2000', date: '2026-07-02' });
  ok('a transfer leaves the books\' stock unchanged', (await B(['1300']))['1300'] === 10000);
  await op({ op: 'sale', b: 'الرياض', who: '', pay: 'cash', amt: '5000', disc: '500', cost: '3000', date: '2026-07-05' });
  const b2 = await B(['1100', '4000', '4100', '2200', '5000']);
  ok('a cash sale of 5,000 less a 500 discount: VAT 675 on 4,500, cost 3,000', b2['1100'] === 5175 && b2['4000'] === -5000 && b2['4100'] === 500 && b2['2200'] === -675 && b2['5000'] === 3000, JSON.stringify(b2));
  await op({ op: 'sale', b: 'جدة', who: 'مؤسسة الريان', pay: 'credit', amt: '1000', disc: '0', cost: '600', date: '2026-07-06' });
  ok('a credit sale without a limit is refused', /لا حد ائتمان/.test(await err()), await err());
  await p.fill('#tr-cust', 'مؤسسة الريان'); await p.fill('#tr-limit', '1500'); await p.click('[data-l="tr-limit"]'); await p.waitForTimeout(500);
  await op({ op: 'sale', b: 'جدة', who: 'مؤسسة الريان', pay: 'credit', amt: '2000', disc: '0', cost: '1200', date: '2026-07-06' });
  ok('a credit sale beyond the limit is refused', /يتجاوز حد ائتمان/.test(await err()), await err());
  await op({ op: 'sale', b: 'جدة', who: 'مؤسسة الريان', pay: 'credit', amt: '1000', disc: '0', cost: '600', date: '2026-07-06' });
  ok('within the limit: 1,150 owed by the customer', (await B(['1200']))['1200'] === 1150, JSON.stringify(await B(['1200'])));
  const rows = await p.evaluate(() => Object.fromEntries([...document.querySelectorAll('[data-tr-branches] tr[data-branch]')].map((r) => [r.dataset.branch, [...r.cells].map((c) => c.textContent.trim())])));
  ok('Riyadh: stock 5,000, net sales 4,500, discount 10%, margin 1,500 (33.33%), turnover 0.6×', rows['الرياض'] && /5,000/.test(rows['الرياض'][1]) && /4,500/.test(rows['الرياض'][3]) && rows['الرياض'][5] === '10٪' && /1,500/.test(rows['الرياض'][6]) && rows['الرياض'][7] === '33.33٪' && rows['الرياض'][8] === '0.6×', JSON.stringify(rows['الرياض']));
  ok('Jeddah: stock 1,400 after the transfer and its sale, margin 40%', rows['جدة'] && /1,400/.test(rows['جدة'][1]) && rows['جدة'][7] === '40٪', JSON.stringify(rows['جدة']));
  const cr = await p.evaluate(() => { const r = document.querySelector('[data-tr-credit] tr[data-customer="مؤسسة الريان"]'); return r ? [...r.cells].map((c) => c.textContent.trim()) : null; });
  ok('the customer\'s credit: 1,150 of 1,500, 350 available, 76.67% used', cr && /1,150/.test(cr[1]) && /350/.test(cr[3]) && cr[4] === '76.67٪', JSON.stringify(cr));
  const tb = await p.evaluate(() => { const g = SKEngines.finance.ledger.buildGeneralLedger(SKosifLedger.entries()); return Math.round((g.reduce((s, x) => s + x.debit, 0) - g.reduce((s, x) => s + x.credit, 0)) * 100); });
  ok('the books stay balanced', tb === 0, String(tb));
  await door('trade'); await p.waitForSelector('#co-list .co[data-id="model-trade"]', { timeout: 10000 }); await p.click('#co-list .co[data-id="model-trade"]');
  await p.waitForURL(/\/app-safe(\.html)?([?#]|$)/, { timeout: 30000 }); await ready(p); await p.waitForFunction(() => SKosifLedger.entries().length > 0, null, { timeout: 60000 }).catch(() => {});
  await p.evaluate(() => SKosifLedger.open('trade')); await p.waitForTimeout(1500);
  const m = await p.evaluate(() => ({ branches: document.querySelectorAll('[data-tr-branches] tr[data-branch]').length, customers: document.querySelectorAll('[data-tr-credit] tr[data-customer]').length,
    over: document.querySelectorAll('[data-tr-credit] tr.bad').length }));
  ok('the model distributor shows two branches and three customers, none over the limit', m.branches === 2 && m.customers === 3 && m.over === 0, JSON.stringify(m));
  ok('no page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
} finally { await browser.close(); }

if (fails.length) { console.error('Trade pack: ' + fails.length + ' failed\n- ' + fails.join('\n- ')); process.exit(1); }
console.log('Trade pack: all checks OK');
