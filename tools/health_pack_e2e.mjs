// FOUNDATION §3.7 «عمق قطاع المستشفيات» / P3 — the health pack behaves, not just labels: a company created under health from the
// door gets the claims tab in its books; a visit splits into the patient's share (cash) and the payer's claim (1210, named),
// revenue lands on the department's account; a remittance pays part and rejects part (5110, with its reason); the payer's
// open claims, its rejection rate and the books agree. A company of another sector (the demo meat company) has no claims tab.
//   node tools/health_pack_e2e.mjs http://127.0.0.1:8765/
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
  // the demo meat company first: no claims tab
  await p.goto(base + 'index.html', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await p.waitForSelector('#gate-list .gate', { timeout: 30000 });
  await p.click('#gate-list .gate[data-gate="accounting"]'); await p.click('#sector-list .sector[data-sector="meat"]');
  await p.waitForSelector('#co-list .co[data-id="demo-co"]', { timeout: 10000 }); await p.click('#co-list .co[data-id="demo-co"]');
  await p.waitForURL(/app-safe\.html/, { timeout: 30000 }); await ready(p);
  await p.evaluate(() => SKosifLedger.open('accounts')); await p.waitForTimeout(800);
  ok('a meat company has no claims tab', await p.evaluate(() => !document.querySelector('[data-sk-tabs="ledger"] [data-tab="claims"]')));
  // a hospital created under health
  await p.goto(base + 'index.html', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await p.waitForSelector('#gate-list .gate', { timeout: 30000 });
  await p.click('#gate-list .gate[data-gate="accounting"]'); await p.click('#sector-list .sector[data-sector="health"]');
  await p.waitForFunction(() => !document.getElementById('companies').hidden, null, { timeout: 10000 });
  await p.click('#co-add'); await p.fill('#co-name', 'مستشفى الاختبار'); await p.click('#co-form button[type="submit"]');
  await p.waitForURL(/app-safe\.html/, { timeout: 30000 }); await ready(p); await p.waitForTimeout(800);
  await p.evaluate(() => SKosifLedger.open('claims')); await p.waitForTimeout(1000);
  ok('a health company has the claims tab, with its pack accounts', await p.evaluate(() => !!document.querySelector('[data-sk-tabs="ledger"] [data-tab="claims"]') && !!document.getElementById('cl-case')), await p.evaluate(() => SK.company.current().sector + ' ' + SKosifLedger.accounts().map((a) => a.code).join(',')));
  // the earlier visits are Saudi citizens (state-borne VAT, a 0% invoice); a standard-rated visit is checked at the end
  const visit = async (caseRef, dept, gross, payer, cov, doc = '', fee = '', sup = '', cat = 'citizen') => {
    await p.fill('#cl-case', caseRef); await p.selectOption('#cl-dept', dept); await p.fill('#cl-gross', gross); await p.fill('#cl-payer', payer); await p.fill('#cl-cov', cov);
    await p.fill('#cl-doc', doc); await p.fill('#cl-fee', fee); await p.fill('#cl-sup', sup); await p.selectOption('#cl-cat', cat);
    await p.click('[data-l="claim-visit"]'); await p.waitForTimeout(600);
  };
  // the cost of a case: supplies cannot leave a pharmacy that does not hold them
  await visit('C-1001', 'outpatient', '500', 'تأمين الاختبار', '80', 'د. سارة', '30', '45');
  ok('supplies beyond the pharmacy stock are refused and nothing posts', await p.evaluate(() => /لا يكفي/.test(document.getElementById('cl-err').textContent) && !SKosifLedger.entries().some((e) => e.visit)));
  await p.evaluate(() => { const A = SKosifLedger.accounts(), id = (c) => A.find((a) => a.code === c).id;
    return SKosifLedger.postEntry({ date: new Date().toISOString().slice(0, 10), reference: 'PH-1', memo: 'شراء أدوية', lines: [{ accountId: id('1360'), debit: 100, credit: 0 }, { accountId: id('2100'), debit: 0, credit: 100 }] }, { sourceId: 'test:pharmacy-stock' }); });
  await visit('C-1001', 'outpatient', '500', 'تأمين الاختبار', '80', 'د. سارة', '30', '45');
  await visit('C-1002', 'lab', '300', 'تأمين الاختبار', '100');
  await visit('C-1003', 'pharmacy', '120', '', '100');
  const B = (codes) => p.evaluate((codes) => Object.fromEntries(codes.map((c) => [c, SKosifLedger.balance(c)])), codes);
  const b1 = await B(['1100', '1210', '4010', '4030', '4040']);
  ok('visits: patient shares in cash, payer claims in 1210, revenue by department', b1['1100'] === 220 && b1['1210'] === 700 && b1['4010'] === -500 && b1['4030'] === -300 && b1['4040'] === -120, JSON.stringify(b1));
  const bc = await B(['5210', '2150', '5220', '1360']);
  ok("the case cost: the doctor's 30% accrued to the doctor, supplies out of the pharmacy", bc['5210'] === 150 && bc['2150'] === -150 && bc['5220'] === 45 && bc['1360'] === 55, JSON.stringify(bc));
  const doc = await p.evaluate(() => { const d = SKosifLedger.snapshot(), e = d.entries.find((x) => x.caseCost); return e && e.party; });
  ok("the case cost entry is named to the doctor, so the doctors' payable ages by doctor", doc === 'د. سارة', String(doc));
  const cr = await p.evaluate(() => { const r = document.querySelector('[data-cl-cases] tr[data-case="C-1001"]'); return r ? [...r.cells].map((c) => c.textContent.trim()) : null; });
  ok('the case table: revenue 500, fee 150, supplies 45, margin 305 (61%)', cr && /500/.test(cr[1]) && /150/.test(cr[2]) && /45/.test(cr[3]) && /305/.test(cr[4]) && cr[5] === '61٪', JSON.stringify(cr));
  await p.selectOption('#cr-payer', 'تأمين الاختبار'); await p.fill('#cr-paid', '550'); await p.fill('#cr-rej', '150');
  await p.click('[data-l="claim-remit"]'); await p.waitForTimeout(400);
  ok('a rejection without its reason is refused', await p.evaluate(() => /سبب الرفض/.test(document.getElementById('cr-err').textContent)));
  await p.fill('#cr-why', 'خارج التغطية'); await p.click('[data-l="claim-remit"]'); await p.waitForTimeout(700);
  const b2 = await B(['1100', '1210', '5110']);
  ok('remittance: paid to cash, rejected to 5110, the payer settled in 1210', b2['1100'] === 770 && b2['1210'] === 0 && b2['5110'] === 150, JSON.stringify(b2));
  const row = await p.evaluate(() => { const r = document.querySelector('[data-cl-payers] tr[data-payer="تأمين الاختبار"]'); return r ? [...r.cells].map((c) => c.textContent.trim()) : null; });
  ok('the payer table: billed, paid, rejected, a 21.43% rejection rate, nothing open', row && /700/.test(row[1]) && /550/.test(row[2]) && /150/.test(row[3]) && row[4] === '21.43٪' && /0/.test(row[5]), JSON.stringify(row));
  const tb = await p.evaluate(() => { const g = SKEngines.finance.ledger.buildGeneralLedger(SKosifLedger.entries()); return Math.round((g.reduce((s, x) => s + x.debit, 0) - g.reduce((s, x) => s + x.credit, 0)) * 100); });
  ok('the books stay balanced', tb === 0, String(tb));
  // VAT on healthcare: a non-Saudi patient's visit is standard-rated (15% in this Saudi company), shared 50/50 with the payer
  const b3 = await B(['2200', '4010', '1210', '1100']);
  await visit('C-1004', 'outpatient', '200', 'تأمين ب', '50', '', '', '', 'non-citizen');
  const b4 = await B(['2200', '4010', '1210', '1100']), dlt = (k) => Math.round((b4[k] - b3[k]) * 100) / 100;
  ok('a non-Saudi visit: revenue 200 before VAT, output VAT 30, the 230 shared 115 / 115', dlt('4010') === -200 && dlt('2200') === -30 && dlt('1210') === 115 && dlt('1100') === 115, JSON.stringify({ b3, b4 }));
  const tr = await p.evaluate(() => SKosifLedger.entries().filter((e) => e.visit).map((e) => e.visit.vatTreatment));
  ok('every visit records its VAT treatment (state-borne for citizens, standard for the non-Saudi patient)', tr.filter((t) => t === 'state-borne').length === 3 && tr.filter((t) => t === 'standard').length === 1, JSON.stringify(tr));
  ok('the claims tab states the VAT rules and what it does not post', await p.evaluate(() => /تتحمل الدولة/.test((document.querySelector('[data-cl-vat-note]') || {}).textContent || '')));
  ok('no page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
} finally { await browser.close(); }

if (fails.length) { console.error('Health pack: ' + fails.length + ' failed\n- ' + fails.join('\n- ')); process.exit(1); }
console.log('Health pack: all checks OK');
