// FOUNDATION §3.6 «المدارس» / P3 — the education pack behaves, not just labels: a school created from the door gets
// «الرسوم الدراسية»; a term of 100 students billed in advance (VAT only on the residents), earned month by month, a
// resident's sibling discount, two citizens withdrawing, collections — and the books, the term table and the collection
// rate agree. The model school shows its two terms in the same tab. A company of another sector has no such tab.
//   node tools/education_pack_e2e.mjs http://127.0.0.1:8765/
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
  ok('a meat company has no tuition tab', await p.evaluate(() => !document.querySelector('[data-sk-tabs="ledger"] [data-tab="tuition"]')));
  await door('education'); await p.waitForFunction(() => !document.getElementById('companies').hidden, null, { timeout: 10000 });
  await p.click('#co-add'); await p.fill('#co-name', 'مدرسة الاختبار'); await p.click('#co-form button[type="submit"]');
  await p.waitForURL(/app-safe\.html/, { timeout: 30000 }); await ready(p); await p.waitForTimeout(800);
  await p.evaluate(() => SKosifLedger.open('tuition')); await p.waitForTimeout(1000);
  ok('a school has the tuition tab with its pack accounts and the VAT note', await p.evaluate(() => !!document.getElementById('tu-label') && /تتحمل الدولة/.test(document.querySelector('[data-tu-vat-note]').textContent)),
    await p.evaluate(() => SK.company.current().sector + ' ' + SKosifLedger.accounts().map((a) => a.code).join(',')));
  const B = (codes) => p.evaluate((codes) => Object.fromEntries(codes.map((c) => [c, SKosifLedger.balance(c, '2026-12-31')])), codes);
  await p.fill('#tu-label', 'الفصل الثاني 2026'); await p.fill('#tu-start', '2026-01'); await p.fill('#tu-months', '5'); await p.fill('#tu-fee', '9000');
  await p.fill('#tu-cit', '80'); await p.fill('#tu-res', '20'); await p.fill('#tu-date', '2026-01-05'); await p.click('[data-l="tu-new"]'); await p.waitForTimeout(700);
  const b1 = await B(['1200', '2410', '2200']);
  ok('term billed: 900,000 deferred, VAT 27,000 on the 20 residents, the parents owe 927,000', b1['1200'] === 927000 && b1['2410'] === -900000 && b1['2200'] === -27000, JSON.stringify(b1));
  const op = async (kind, o) => { await p.selectOption('#tu-op', kind); for (const [k, v] of Object.entries(o)) { if (k === 'cat') await p.selectOption('#tu-cat', v); else await p.fill('#tu-' + k, v); } await p.click('[data-l="tu-post"]'); await p.waitForTimeout(700); };
  const err = () => p.evaluate(() => document.getElementById('tu-err2').textContent);
  await op('earn', { month: '2026-01', date2: '2026-01-31' });
  ok('January earned: 180,000', (await B(['4090']))['4090'] === -180000, JSON.stringify(await B(['4090'])));
  await op('discount', { amt: '12000', cat: 'resident', reason: 'خصم الإخوة', date2: '2026-02-01' });
  const b2 = await B(['5160', '1200', '2410']);
  ok('a resident sibling discount of 12,000 takes its VAT 1,800 off the parents\' bill', b2['5160'] === 12000 && b2['1200'] === 927000 - 13800 && b2['2410'] === -900000 + 180000 + 12000, JSON.stringify(b2));
  await op('withdraw', { cat: 'citizen', n: '2', month: '2026-03', date2: '2026-02-20' });
  ok('two citizens withdrawing from March are credited three months (10,800), no VAT', (await B(['2410']))['2410'] === -(900000 - 180000 - 12000 - 10800), JSON.stringify(await B(['2410'])));
  await op('earn', { month: '2026-02', date2: '2026-02-28' });
  ok('February earns the deferred left spread over the four months left', (await B(['4090']))['4090'] === -(180000 + 12000 + Math.floor((900000 - 180000 - 12000 - 10800) / 4 * 100) / 100), JSON.stringify(await B(['4090'])));
  await op('collect', { amt: '2000000', date2: '2026-02-25' });
  ok('collecting more than the parents owe is refused', /يتجاوز/.test(await err()), await err());
  await op('collect', { amt: '600000', date2: '2026-02-25' });
  const row = await p.evaluate(() => { const r = document.querySelector('[data-tu-table] tr[data-term="الفصل الثاني 2026"]'); return r ? [...r.cells].map((c) => c.textContent.trim()) : null; });
  /* owed after discount and credit note: 927,000 − 13,800 − 10,800 = 902,400; collected 600,000 → 66.49% */
  ok('the term row: 98 students, 600,000 collected, 302,400 open, 66.49% collected', row && row[1] === '98' && /600,000/.test(row[7]) && /302,400/.test(row[8]) && row[9] === '66.49٪', JSON.stringify(row));
  await op('earn', { month: '2026-02', date2: '2026-02-28' });
  ok('a month is not earned twice', /لا أشهر/.test(await err()), await err());
  const tb = await p.evaluate(() => { const g = SKEngines.finance.ledger.buildGeneralLedger(SKosifLedger.entries()); return Math.round((g.reduce((s, x) => s + x.debit, 0) - g.reduce((s, x) => s + x.credit, 0)) * 100); });
  ok('the books stay balanced', tb === 0, String(tb));
  /* the model school reads through the same tab */
  await door('education'); await p.waitForSelector('#co-list .co[data-id="model-education"]', { timeout: 10000 }); await p.click('#co-list .co[data-id="model-education"]');
  await p.waitForURL(/app-safe\.html/, { timeout: 30000 }); await ready(p); await p.waitForFunction(() => SKosifLedger.entries().length > 0, null, { timeout: 60000 }).catch(() => {});
  await p.evaluate(() => SKosifLedger.open('tuition')); await p.waitForTimeout(1500);
  const terms = await p.evaluate(() => [...document.querySelectorAll('[data-tu-table] tr[data-term]')].map((r) => [r.dataset.term, r.cells[1].textContent.trim(), r.cells[9].textContent.trim()]));
  ok('the model school shows its two terms, 1,198 students in the first after two withdrawals', terms.length === 2 && terms[0][1] === '1198' && terms[1][1] === '1200', JSON.stringify(terms));
  ok('no page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
} finally { await browser.close(); }

if (fails.length) { console.error('Education pack: ' + fails.length + ' failed\n- ' + fails.join('\n- ')); process.exit(1); }
console.log('Education pack: all checks OK');
