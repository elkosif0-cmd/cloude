// FOUNDATION §3.7 / PRODUCT_MANDATE P3 — the meat sector pack behaves, not just labels: on the demo meat company a cutting run
// entered on the carcass screen posts one balanced entry that moves the carcass cost into the cuts (relative sales value),
// the by-products (net realisable value) and the abnormal waste, keeping every halala; it posts once; the books stay balanced.
//   node tools/meat_pack_e2e.mjs http://127.0.0.1:8765/app-safe.html
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const url = process.argv[2] || 'http://127.0.0.1:8765/app-safe.html';
const fails = [], ok = (name, cond, detail) => { if (!cond) fails.push(name + (detail ? ' — ' + detail : '')); };

const browser = await chromium.launch();
try {
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  await ctx.addInitScript(() => { try { sessionStorage.setItem('sqc_space_chosen', '1'); } catch {} });
  const p = await ctx.newPage(), errors = [];
  p.on('pageerror', (e) => errors.push(String(e)));
  await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await p.waitForFunction(() => window.SK && SK.demo && SK.demo.settled && SK.demo.settled() && window.SKosifLedger && window.SKEngines, null, { timeout: 90000 });
  ok('the demo company is a meat company', await p.evaluate(() => SK.company.current().sector === 'meat'));
  await p.evaluate(() => SKosifCore.go('carcass')); await p.waitForTimeout(1500);
  ok('the carcass screen marks by-products in its preset', await p.evaluate(() => document.querySelectorAll('[data-b]').length === 5 && document.querySelector('[data-b="4"]').checked));
  await p.fill('#sk37-carcass', '24'); await p.fill('#sk37-cost', '1450');
  for (const [i, v] of [[0, '95'], [1, '85'], [2, '120'], [3, '60'], [4, '25']]) await p.fill(`input[data-p="${i}"]`, v);
  // yields 28+22+18+15+12 = 95%: the cuts explain 22.8 kg, the waste the other 1.2 kg
  await p.fill('input[data-y="3"]', '15');
  await p.fill('#sk37-waste', '3');
  await p.click('#sk37-run-preview'); await p.waitForTimeout(400);
  ok('weights above the carcass block the posting', await p.evaluate(() => !!document.querySelector('#sk37-run-post[disabled]') && /يتجاوز وزن الذبيحة/.test(document.querySelector('#sk37-run-out').textContent)));
  await p.fill('#sk37-waste', '1.2');
  const before = await p.evaluate(() => SKosifLedger.entries().length);
  await p.click('#sk37-run-preview'); await p.waitForTimeout(400);
  const pv = await p.evaluate(() => ({ rows: document.querySelectorAll('#sk37-run-out tbody tr').length, basis: (document.querySelector('#sk37-run-out .sk-kpi:nth-child(2) b') || {}).textContent, btn: !!document.querySelector('#sk37-run-post:not([disabled])') }));
  ok('the preview lists 4 cuts and 1 by-product on relative sales value', pv.rows === 5 && /قيمة البيع/.test(pv.basis || '') && pv.btn, JSON.stringify(pv));
  await p.click('#sk37-run-post'); await p.waitForTimeout(500);
  const E = await p.evaluate(() => {
    const d = SKosifLedger.snapshot(), e = d.entries.find((x) => x.source === 'تقطيع'), A = d.accounts, code = (id) => (A.find((a) => a.id === id) || {}).code;
    if (!e) return { posted: false };
    const by = {}; e.lines.forEach((l) => { const c = code(l.accountId); by[c] = Math.round(((by[c] || 0) + l.debit - l.credit) * 100) / 100; });
    const tb = SKEngines.finance.ledger.buildGeneralLedger(d.entries), dr = tb.reduce((s, x) => s + x.debit, 0), cr = tb.reduce((s, x) => s + x.credit, 0);
    return { posted: true, valid: SKEngines.finance.ledger.validateJournalEntry(e).valid, by, sourceId: e.sourceId, tbBalanced: Math.abs(dr - cr) < 0.005, codes: ['1310', '1320', '1330', '5100'].every((c) => A.some((a) => a.code === c)) };
  });
  ok('the run is posted as one balanced entry', E.posted && E.valid, JSON.stringify(E));
  ok('the carcass cost leaves 1310 and is fully assigned', E.by && E.by['1310'] === -1450 && Math.round(((E.by['1320'] || 0) + (E.by['1330'] || 0) + (E.by['5100'] || 0)) * 100) === 145000, JSON.stringify(E.by));
  // offal 2.88 kg × 25 = 72 at NRV; waste 1.2 kg within 3% of 24 kg (0.72) → 0.48 kg abnormal × 1450/24 = 29.00
  ok('by-products at net realisable value and abnormal waste beyond the tolerance', E.by && E.by['1330'] === 72 && E.by['5100'] === 29, JSON.stringify(E.by));
  ok('the meat accounts were opened in the chart', E.codes);
  ok('the books stay balanced', E.tbBalanced);
  const again = await p.evaluate(() => SKosifLedger.postEntry({ date: new Date().toISOString().slice(0, 10), lines: [] }, { sourceId: SKosifLedger.entries().find((x) => x.source === 'تقطيع').sourceId }));
  ok('the same run cannot post twice', again.ok === false && again.duplicate === true, JSON.stringify(again));
  ok('exactly one entry was added', (await p.evaluate(() => SKosifLedger.entries().length)) === before + 1);
  const bad = await p.evaluate(() => { const d = SKosifLedger.snapshot(), id = d.accounts[0].id; return SKosifLedger.postEntry({ date: '2026-01-01', lines: [{ accountId: id, debit: 10, credit: 0 }, { accountId: id, debit: 0, credit: 9 }] }, { sourceId: 'test:unbalanced' }); });
  ok('an unbalanced entry is refused', bad.ok === false, JSON.stringify(bad));
  ok('no page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
} finally { await browser.close(); }

if (fails.length) { console.error('Meat pack: ' + fails.length + ' failed\n- ' + fails.join('\n- ')); process.exit(1); }
console.log('Meat pack: all checks OK');
