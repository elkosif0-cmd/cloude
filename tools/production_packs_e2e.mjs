// FOUNDATION §3.6 «المصانع» و«المخابز» / P3 — the manufacturing and bakery packs behave, not just labels:
//   • a factory created from the door: a product and its bill of materials (standard 0.85), materials bought, an order of
//     10,000 — materials issued (more than the store holds is refused), labour and overhead absorbed at standard, closed
//     into 9,800 good and 200 scrap with a 1.60 adverse variance and no work in progress left; cost of sales at standard;
//   • a bakery created from the door: a recipe (standard 0.80), a batch of 950 good out of 1,000 at an actual 0.84 a piece,
//     a price at a 40% margin with VAT, expired goods written off (more than on hand is refused), cost of sales;
//   • the model factory shows its nine monthly orders and the model bakery its daily batches.
//   node tools/production_packs_e2e.mjs http://127.0.0.1:8765/
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
  const create = async (sector, name, tab) => { await door(sector); await p.waitForFunction(() => !document.getElementById('companies').hidden, null, { timeout: 10000 });
    await p.click('#co-add'); await p.fill('#co-name', name); await p.click('#co-form button[type="submit"]');
    await p.waitForURL(/app-safe\.html/, { timeout: 30000 }); await ready(p); await p.waitForTimeout(800); await p.evaluate((t) => SKosifLedger.open(t), tab); await p.waitForTimeout(1000); };
  const B = (codes) => p.evaluate((codes) => Object.fromEntries(codes.map((c) => [c, SKosifLedger.balance(c, '2026-12-31')])), codes);
  const product = async (o) => { for (const [k, v] of Object.entries(o)) await p.fill('#pr-' + k, v); await p.click('[data-l="pr-new"]'); await p.waitForTimeout(700); };
  const op = async (kind, o) => { await p.selectOption('#po-op', kind); for (const [k, v] of Object.entries(o)) await p.fill('#po-' + k, v); await p.click('[data-l="po-post"]'); await p.waitForTimeout(700); };
  const err = () => p.evaluate(() => document.getElementById('po-err').textContent);
  const tb = () => p.evaluate(() => { const g = SKEngines.finance.ledger.buildGeneralLedger(SKosifLedger.entries()); return Math.round((g.reduce((s, x) => s + x.debit, 0) - g.reduce((s, x) => s + x.credit, 0)) * 100); });

  /* ---------- the factory ---------- */
  await create('manufacturing', 'مصنع الاختبار', 'factory');
  ok('a factory has the production orders tab', await p.evaluate(() => !!document.getElementById('pr-name')), await p.evaluate(() => SK.company.current().sector + ' ' + SKosifLedger.accounts().map((a) => a.code).join(',')));
  await product({ name: 'عبوة 1 لتر', unit: 'عبوة', m1: 'حبيبات بولي إيثيلين', q1: '0.05', c1: '8', m2: 'غطاء', q2: '1', c2: '0.15', lab: '0.20', oh: '0.10' });
  const prow = await p.evaluate(() => { const r = document.querySelector('[data-pr-table] tr[data-product="عبوة 1 لتر"]'); return r ? [...r.cells].map((c) => c.textContent.trim()) : null; });
  ok('the bottle\'s standard cost is 0.85 and its price at 40% with VAT 1.63', prow && /0\.85/.test(prow[4]) && /1\.63/.test(prow[5]), JSON.stringify(prow));
  await op('buy', { amt: '10000', who: 'مورد الحبيبات', date: '2026-07-01' });
  const f1 = await B(['1370', '1400', '2100']);
  ok('materials bought: 10,000 into the store, VAT 1,500, owed 11,500', f1['1370'] === 10000 && f1['1400'] === 1500 && f1['2100'] === -11500, JSON.stringify(f1));
  await p.fill('#mo-q', '10000'); await p.click('[data-l="mo-new"]'); await p.waitForTimeout(700);
  await op('issue', { amt: '20000', date: '2026-07-02' });
  ok('issuing more than the store holds is refused', /أكثر من رصيد/.test(await err()), await err());
  await op('issue', { amt: '5600', date: '2026-07-02' });
  await op('absorb', { q: '10000', date: '2026-07-20' });
  const f2 = await B(['1380', '1370', '6100', '6300']);
  ok('issued 5,600 and absorbed labour 2,000 and overhead 1,000: 8,600 in progress', f2['1380'] === 8600 && f2['1370'] === 4400 && f2['6100'] === -2000 && f2['6300'] === -1000, JSON.stringify(f2));
  await op('complete', { q: '9800', q2: '200', date: '2026-07-31' });
  const f3 = await B(['1380', '1390', '5100', '5170']);
  ok('closed: 9,800 good at standard (8,330), scrap 110, adverse variance 160, nothing left in progress', f3['1380'] === 0 && f3['1390'] === 8330 && f3['5100'] === 110 && f3['5170'] === 160, JSON.stringify(f3));
  await op('complete', { q: '1', q2: '0', date: '2026-07-31' });
  ok('an order is not closed twice', /أُقفل/.test(await err()), await err());
  await op('cogs', { q: '5000', date: '2026-07-31' });
  ok('cost of 5,000 bottles sold at standard: 4,250', (await B(['5000']))['5000'] === 4250, JSON.stringify(await B(['5000', '1390'])));
  const mo = await p.evaluate(() => { const r = document.querySelector('[data-mo-table] tr[data-order="MO-001"]'); return r ? [...r.cells].map((c) => c.textContent.trim()) : null; });
  ok('the order row: 9,800 good, 200 scrap, actual 8,600, 0.88 a unit, 98% yield, 1.9% variance, closed', mo && mo[3] === '9800' && mo[4] === '200' && /8,600/.test(mo[5]) && /0\.88/.test(mo[6]) && mo[7] === '98٪' && mo[8] === '1.9٪' && mo[9] === 'مُقفل', JSON.stringify(mo));
  ok('the factory\'s books stay balanced', (await tb()) === 0, String(await tb()));

  /* ---------- the bakery ---------- */
  await create('bakery', 'مخبز الاختبار', 'bakery');
  ok('a bakery has the batches tab, and no factory tab', await p.evaluate(() => !!document.getElementById('pr-name') && !document.querySelector('[data-sk-tabs="ledger"] [data-tab="factory"]')));
  await product({ name: 'خبز صامولي', unit: 'قطعة', m1: 'دقيق', q1: '0.2', c1: '3', lab: '0.15', oh: '0.05' });
  await op('buy', { amt: '1000', who: 'المطاحن', date: '2026-07-01' });
  await op('batch', { q: '1000', q2: '950', amt: '600', wage: '200', date: '2026-07-05' });
  const k1 = await B(['1390', '1370', '6100']);
  ok('a batch at actual cost: 800 into baked goods (ingredients 600, wages 200)', k1['1390'] === 800 && k1['1370'] === 400 && k1['6100'] === -200, JSON.stringify(k1));
  const bt = await p.evaluate(() => { const r = document.querySelector('[data-bk-table] tr[data-batch]'); return r ? [...r.cells].map((c) => c.textContent.trim()) : null; });
  ok('the batch row: 95% yield, 0.84 a piece against a standard 0.80, priced 1.61 with VAT', bt && bt[4] === '95٪' && /0\.84/.test(bt[6]) && /0\.80|0\.8\b/.test(bt[7]) && /1\.61/.test(bt[8]), JSON.stringify(bt));
  await op('waste', { amt: '1000', who: 'انتهاء الصلاحية', date: '2026-07-06' });
  ok('writing off more than is on hand is refused', /أكثر من رصيد/.test(await err()), await err());
  await op('waste', { amt: '40', who: 'انتهاء الصلاحية', date: '2026-07-06' });
  await op('cogs', { amt: '700', date: '2026-07-06' });
  const k2 = await B(['5180', '5000', '1390']);
  ok('waste 40 and cost of sales 700 leave 60 of baked goods', k2['5180'] === 40 && k2['5000'] === 700 && k2['1390'] === 60, JSON.stringify(k2));
  ok('the waste ratio is 5% of production', await p.evaluate(() => document.querySelector('[data-bk-waste]').textContent.trim() === '5٪'));
  ok('the bakery\'s books stay balanced', (await tb()) === 0, String(await tb()));

  /* ---------- the model companies read through the same tabs ---------- */
  for (const [id, sector, tab, sel, n] of [['model-manufacturing', 'manufacturing', 'factory', '[data-mo-table] tr[data-order]', 9], ['model-bakery', 'bakery', 'bakery', '[data-bk-table] tr[data-batch]', 273]]) {
    await door(sector); await p.waitForSelector('#co-list .co[data-id="' + id + '"]', { timeout: 10000 }); await p.click('#co-list .co[data-id="' + id + '"]');
    await p.waitForURL(/app-safe\.html/, { timeout: 30000 }); await ready(p); await p.waitForFunction(() => SKosifLedger.entries().length > 0, null, { timeout: 60000 }).catch(() => {});
    await p.evaluate((t) => SKosifLedger.open(t), tab); await p.waitForTimeout(2000);
    const rows = await p.evaluate((sel) => document.querySelectorAll(sel).length, sel);
    ok(id + ' shows its ' + n + ' ' + (tab === 'factory' ? 'orders' : 'batches'), rows === n, String(rows));
  }
  ok('no page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
} finally { await browser.close(); }

if (fails.length) { console.error('Production packs: ' + fails.length + ' failed\n- ' + fails.join('\n- ')); process.exit(1); }
console.log('Production packs: all checks OK');
