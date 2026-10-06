// FOUNDATION §3.6 «الزراعة/المزارع» / P3 — the agriculture pack behaves, not just labels: a farm created from the door gets
// «الدورات والقطعان»; a cycle of 100 head bought, feed bought and capitalised (more than the store holds is refused), 25
// lambs born at no cost (the cost per head falls to 800), 5 deaths at the average cost, 60 sold on credit at the average
// cost, and the rest remeasured to fair value less costs to sell (IAS 41) — and the books and the cycle table agree. The
// model farm shows its flock in the same tab. A company of another sector has no such tab.
//   node tools/agriculture_pack_e2e.mjs http://127.0.0.1:8765/
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
  await door('meat'); await p.waitForSelector('#co-list .co[data-id="demo-co"]', { timeout: 10000 }); await p.click('#co-list .co[data-id="demo-co"]');
  await p.waitForURL(/app-safe\.html/, { timeout: 30000 }); await ready(p);
  await p.evaluate(() => SKosifLedger.open('accounts')); await p.waitForTimeout(800);
  ok('a meat company has no farm tab', await p.evaluate(() => !document.querySelector('[data-sk-tabs="ledger"] [data-tab="farm"]')));
  await door('agriculture'); await p.waitForFunction(() => !document.getElementById('companies').hidden, null, { timeout: 10000 });
  await p.click('#co-add'); await p.fill('#co-name', 'مزرعة الاختبار'); await p.click('#co-form button[type="submit"]');
  await p.waitForURL(/app-safe\.html/, { timeout: 30000 }); await ready(p); await p.waitForTimeout(800);
  await p.evaluate(() => SKosifLedger.open('farm')); await p.waitForTimeout(1000);
  ok('a farm has the cycles tab with its pack accounts, 4950 included', await p.evaluate(() => !!document.getElementById('lv-name') && SKosifLedger.accounts().some((a) => a.code === '4950')),
    await p.evaluate(() => SK.company.current().sector + ' ' + SKosifLedger.accounts().map((a) => a.code).join(',')));
  await p.fill('#lv-name', 'حظيرة 1 — نعيمي'); await p.click('[data-l="lv-new"]'); await p.waitForTimeout(600);
  const B = (codes) => p.evaluate((codes) => Object.fromEntries(codes.map((c) => [c, SKosifLedger.balance(c, '2026-12-31')])), codes);
  const op = async (kind, o) => { await p.selectOption('#lv-op', kind); for (const [k, v] of Object.entries(o)) { if (k === 'pay') await p.selectOption('#lv-pay', v); else await p.fill('#lv-' + k, v); } await p.click('[data-l="lv-post"]'); await p.waitForTimeout(700); };
  const err = () => p.evaluate(() => document.getElementById('lv-err2').textContent);
  await op('stock', { n: '100', amt: '90000', who: '', pay: 'cash', date: '2026-01-03' });
  const b1 = await B(['1395', '1400', '1100']);
  ok('100 head bought for 90,000 cash with input VAT 13,500', b1['1395'] === 90000 && b1['1400'] === 13500 && b1['1100'] === -103500, JSON.stringify(b1));
  await op('feedbuy', { amt: '20000', who: 'شركة الأعلاف', date: '2026-01-04' });
  await op('feed', { amt: '50000', date: '2026-01-31' });
  ok('feeding more than the store holds is refused', /أكثر من رصيد/.test(await err()), await err());
  await op('feed', { amt: '10000', date: '2026-01-31' });
  ok('10,000 of feed capitalised into the flock', (await B(['1395', '1396']))['1395'] === 100000, JSON.stringify(await B(['1395', '1396'])));
  await op('birth', { n: '25', date: '2026-02-15' });
  await op('death', { n: '200', who: 'مرض', date: '2026-02-20' });
  ok('more deaths than heads is refused', /أكثر/.test(await err()), await err());
  await op('death', { n: '5', who: 'مرض تنفسي', date: '2026-02-20' });
  ok('5 deaths at the average 800 after the births: 4,000 written off', (await B(['5190']))['5190'] === 4000, JSON.stringify(await B(['5190', '1395'])));
  await op('sale', { n: '60', amt: '87000', who: 'ملحمة الوادي', pay: 'credit', date: '2026-03-20' });
  const b3 = await B(['1200', '4000', '5000', '1395']);
  ok('60 head sold on credit for 87,000 + VAT; their cost 48,000 at the average', b3['1200'] === 100050 && b3['4000'] === -87000 && b3['5000'] === 48000 && b3['1395'] === 48000, JSON.stringify(b3));
  ok('the customer is the party of the receivable', await p.evaluate(() => SKosifLedger.entries().some((e) => e.livestock && e.livestock.kind === 'sale' && e.party === 'ملحمة الوادي')));
  await op('fv', { fv: '1000', cts: '50', date: '2026-06-30' });
  const b4 = await B(['1395', '4950']);
  ok('IAS 41: the 60 head remeasured to 950 each (57,000), a gain of 9,000', b4['1395'] === 57000 && b4['4950'] === -9000, JSON.stringify(b4));
  const row = await p.evaluate(() => { const r = document.querySelector('[data-lv-table] tr[data-cycle="حظيرة 1 — نعيمي"]'); return r ? [...r.cells].map((c) => c.textContent.trim()) : null; });
  ok('the cycle row: 60 head at 950, 100 bought, 25 born, 5 dead, 60 sold, 4% mortality, 80 of feed a head, margin 39,000 (44.83%)',
    row && row[1] === '60' && /950/.test(row[3]) && row[4] === '100' && row[5] === '25' && row[6] === '5' && row[7] === '60' && row[8] === '4٪' && /80/.test(row[9]) && /39,000/.test(row[10]) && row[11] === '44.83٪', JSON.stringify(row));
  const tb = await p.evaluate(() => { const g = SKEngines.finance.ledger.buildGeneralLedger(SKosifLedger.entries()); return Math.round((g.reduce((s, x) => s + x.debit, 0) - g.reduce((s, x) => s + x.credit, 0)) * 100); });
  ok('the books stay balanced', tb === 0, String(tb));
  /* the model farm reads through the same tab */
  await door('agriculture'); await p.waitForSelector('#co-list .co[data-id="model-agriculture"]', { timeout: 10000 }); await p.click('#co-list .co[data-id="model-agriculture"]');
  await p.waitForURL(/app-safe\.html/, { timeout: 30000 }); await ready(p); await p.waitForFunction(() => SKosifLedger.entries().length > 0, null, { timeout: 60000 }).catch(() => {});
  await p.evaluate(() => SKosifLedger.open('farm')); await p.waitForTimeout(1500);
  const flock = await p.evaluate(() => { const r = document.querySelector('[data-lv-table] tr[data-cycle]'); return r ? [...r.cells].map((c) => c.textContent.trim()) : null; });
  ok('the model farm shows its flock: 2,000 bought, lambs born, deaths and sales', flock && flock[4] === '2000' && Number(flock[5]) > 400 && Number(flock[6]) > 0 && Number(flock[7]) > 1000, JSON.stringify(flock));
  ok('no page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
} finally { await browser.close(); }

if (fails.length) { console.error('Agriculture pack: ' + fails.length + ' failed\n- ' + fails.join('\n- ')); process.exit(1); }
console.log('Agriculture pack: all checks OK');
