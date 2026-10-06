// FOUNDATION P2 — operation → entry → ledger → trial balance with the same figures, on the demo company in a real browser:
//   every entry balances; the general ledger's debits equal its credits; no operation is posted twice; each control account
//   (receivables 1200, payables 2100) equals its named parties plus the movements that name none; every receipt names its
//   supplier; every posted sale carries VAT at the company's policy rate; and changing the company's VAT policy changes the
//   rate of the next sale (Saudi 15% → UAE 5% → not registered).
//   node tools/books_integrity_e2e.mjs http://127.0.0.1:8765/app-safe.html
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
  await p.waitForFunction(() => window.SK && SK.demo && SK.demo.settled && SK.demo.settled() && window.SKosifLedger && window.SKosifCompanyPlatform, null, { timeout: 90000 });
  const B = await p.evaluate(() => {
    const F = SKEngines.finance, d = SK.load('skosif_ledger_v1', {}), A = d.accounts, id = (c) => (A.find((a) => a.code === c) || {}).id;
    const r2 = (x) => Math.round(x * 100) / 100, live = d.entries.filter((e) => !e.reversedBy && !e.reversalOf);
    const gl = F.ledger.buildGeneralLedger(d.entries), dr = r2(gl.reduce((s, x) => s + x.debit, 0)), cr = r2(gl.reduce((s, x) => s + x.credit, 0));
    const bal = (c) => { const r = gl.find((x) => x.accountId === id(c)); return r ? r2(r.balance) : 0; };
    const src = live.map((e) => e.sourceId).filter(Boolean), dup = src.filter((s, i) => src.indexOf(s) !== i);
    const ctl = (c, side) => { const pb = F.partyLedger.partyBalances(d.entries, id(c), side, '2099-12-31'); return { gl: side === 'debit' ? bal(c) : r2(-bal(c)), parties: r2(pb.rows.reduce((s, x) => s + x.balance, 0)), unassigned: pb.unassigned }; };
    const rate = SKosifCompanyPlatform.vatPolicy().rate;
    const offRate = live.filter((e) => String(e.sourceId || '').startsWith('sale:') || e.source === 'مبيعات').filter((e) => {
      const rev = e.lines.filter((l) => l.accountId === id('4000')).reduce((s, l) => s + l.credit - l.debit, 0), vat = e.lines.filter((l) => l.accountId === id('2200')).reduce((s, l) => s + l.credit - l.debit, 0);
      return Math.abs(vat - rev * rate) > 0.02 * Math.max(1, e.lines.length);
    }).map((e) => e.id);
    return { entries: d.entries.length, bad: d.entries.filter((e) => !F.ledger.validateJournalEntry(e).valid).map((e) => e.id), dr, cr, dup,
      ar: ctl('1200', 'debit'), ap: ctl('2100', 'credit'), rate, offRate,
      receiptsNoParty: live.filter((e) => String(e.sourceId || '').startsWith('receipt:') && !e.party).map((e) => e.id) };
  });
  ok('demo books exist', B.entries > 50, String(B.entries));
  ok('every entry balances', B.bad.length === 0, B.bad.join(','));
  ok('the general ledger debits equal its credits', B.dr === B.cr && B.dr > 0, B.dr + ' / ' + B.cr);
  ok('no operation posted twice', B.dup.length === 0, B.dup.join(','));
  for (const k of ['ar', 'ap']) ok(k + ' control account = named parties + unassigned', Math.abs(B[k].gl - B[k].parties - B[k].unassigned) < 0.01, JSON.stringify(B[k]));
  ok('every receipt entry names its supplier', B.receiptsNoParty.length === 0, B.receiptsNoParty.join(','));
  ok('the demo company (Saudi) posts at 15%', B.rate === 0.15, String(B.rate));
  ok('every posted sale carries VAT at the company rate', B.offRate.length === 0, B.offRate.join(','));

  const P = await p.evaluate(() => {
    const d = SK.load('skosif_ledger_v1', {}), x = { id: 'e2e-sale', date: new Date().toISOString().slice(0, 10), item: 'نعيمي', qty: 1, unitPrice: 115, customer: 'عميل الاختبار', payment: 'آجل' };
    const id = (c) => (d.accounts.find((a) => a.code === c) || {}).id, vat = (r) => r ? r.entry.lines.filter((l) => l.accountId === id('2200')).reduce((s, l) => s + l.credit, 0) : null;
    const CP = SKosifCompanyPlatform, before = CP.profile(), out = {};
    try {
      out.sa = vat(SKosifLedger.saleEntry(d, x));
      CP.setProfile({ country: 'AE', currency: 'AED' }); out.ae = vat(SKosifLedger.saleEntry(d, x)); out.aeLabel = CP.vatPolicy().label;
      CP.setProfile({ vatRegistered: false }); out.none = vat(SKosifLedger.saleEntry(d, x));
    } finally { CP.setProfile({ country: before.country, currency: before.currency, vatRegistered: before.vatRegistered, vatRate: before.vatRate }); }
    out.restored = CP.vatPolicy().rate;
    return out;
  });
  ok('a new sale at the Saudi rate', P.sa === 15, String(P.sa));
  ok('the same sale after the company moves to the UAE: 5%', P.ae === 5.48, String(P.ae) + ' ' + P.aeLabel);
  ok('not registered: no output VAT', P.none === 0, String(P.none));
  ok('the profile is restored', P.restored === 0.15, String(P.restored));

  await p.evaluate(() => SKosifCore.go('masterdata')); await p.waitForTimeout(1200);
  const form = await p.evaluate(() => ({ reg: !!document.querySelector('[data-md-profile="vatRegistered"]'), rate: !!document.querySelector('[data-md-profile="vatRate"]'), hint: (document.querySelector('[data-md-vat-policy]') || {}).textContent || '' }));
  ok('the company form carries the VAT registration and rate', form.reg && form.rate && /15%/.test(form.hint), JSON.stringify(form));
  ok('no page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
} finally { await browser.close(); }

if (fails.length) { console.error('Books integrity: ' + fails.length + ' failed\n- ' + fails.join('\n- ')); process.exit(1); }
console.log('Books integrity: all checks OK');
