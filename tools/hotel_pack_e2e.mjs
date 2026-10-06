// FOUNDATION §3.7 «عمق قطاع الفنادق» / P3 — the hospitality pack behaves, not just labels: a hotel created from the door
// gets «الغرف والإقفال الليلي»; a deposit, a night audit settled from it, a channel booking on account with its commission,
// and the KPIs (occupancy, ADR, RevPAR) agree with the books. A company of another sector (the demo meat company) has no such tab.
//   node tools/hotel_pack_e2e.mjs http://127.0.0.1:8765/
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
  ok('a meat company has no hotel tab', await p.evaluate(() => !document.querySelector('[data-sk-tabs="ledger"] [data-tab="hotel"]')));
  await door('hospitality'); await p.waitForFunction(() => !document.getElementById('companies').hidden, null, { timeout: 10000 });
  await p.click('#co-add'); await p.fill('#co-name', 'فندق الاختبار'); await p.click('#co-form button[type="submit"]');
  await p.waitForURL(/app-safe\.html/, { timeout: 30000 }); await ready(p); await p.waitForTimeout(800);
  await p.evaluate(() => SKosifLedger.open('hotel')); await p.waitForTimeout(1000);
  ok('a hotel has the rooms and night audit tab with its pack accounts', await p.evaluate(() => !!document.getElementById('ht-guest')), await p.evaluate(() => SK.company.current().sector + ' ' + SKosifLedger.accounts().map((a) => a.code).join(',')));
  const B = (codes) => p.evaluate((codes) => Object.fromEntries(codes.map((c) => [c, SKosifLedger.balance(c)])), codes);
  const D = '2026-07-02';
  // a deposit of 1,000 + VAT 150
  await p.fill('#ht-dguest', 'حجز 501'); await p.fill('#ht-damt', '1000'); await p.fill('#ht-ddate', '2026-07-01'); await p.click('[data-l="ht-dep"]'); await p.waitForTimeout(600);
  const b1 = await B(['1100', '2300', '2200']);
  ok('deposit: 1,150 in cash, the deposit liability 1,000, VAT 150', b1['1100'] === 1150 && b1['2300'] === -1000 && b1['2200'] === -150, JSON.stringify(b1));
  const night = async (o) => { for (const [k, v] of Object.entries(o)) { if (k === 'settle') await p.selectOption('#ht-settle', v); else await p.fill('#ht-' + k, v); } await p.click('[data-l="ht-night"]'); await p.waitForTimeout(700); };
  // the guest's night: rooms 1,200 + F&B 300, settled from the deposit and the rest (500 + VAT 75) in cash
  await night({ guest: 'حجز 501', avail: '20', sold: '2', room: '1200', fb: '300', settle: 'cash', ch: '', pct: '0', date: D });
  const b2 = await B(['1100', '2300', '4050', '4060', '2200']);
  ok('night audit: deposit used first, VAT only on the 500 left, 575 collected', b2['2300'] === 0 && b2['1100'] === 1725 && b2['4050'] === -1200 && b2['4060'] === -300 && b2['2200'] === -225, JSON.stringify(b2));
  // a channel's three rooms on account with a 15% commission
  await night({ guest: 'Booking.com', avail: '20', sold: '3', room: '1500', fb: '0', settle: 'receivable', ch: 'Booking.com', pct: '15', date: D });
  const b3 = await B(['1200', '5120', '2160']);
  ok('channel booking: 1,725 owed by the channel, commission 225 accrued', b3['1200'] === 1725 && b3['5120'] === 225 && b3['2160'] === -225, JSON.stringify(b3));
  ok('the channel is the party of its receivable and of its commission', await p.evaluate(() => SKosifLedger.entries().filter((e) => e.hotel && e.hotel.channel === 'Booking.com').every((e) => e.party === 'Booking.com')));
  await night({ guest: 'زائر', avail: '20', sold: '25', room: '100', fb: '0', settle: 'cash', ch: '', pct: '0', date: D });
  ok('more rooms sold than the hotel has is refused', await p.evaluate(() => /أكثر من المتاحة/.test(document.getElementById('ht-err2').textContent)));
  const kpi = await p.evaluate(() => Object.fromEntries([...document.querySelectorAll('[data-ht-kpis] [data-kpi]')].map((b) => [b.dataset.kpi, b.textContent.trim()])));
  // one date, 20 rooms: 5 sold, room revenue 2,700 → occupancy 25%, ADR 540, RevPAR 135
  ok('KPIs: occupancy 25%, ADR 540, RevPAR 135', kpi.avail === '20' && kpi.sold === '5' && kpi.occ === '25٪' && /540/.test(kpi.adr) && /135/.test(kpi.revpar), JSON.stringify(kpi));
  const ch = await p.evaluate(() => [...document.querySelectorAll('[data-ht-channels] tr[data-channel]')].map((r) => [...r.cells].map((c) => c.textContent.trim())));
  ok('channels table: Booking.com 3 rooms 55.56%, direct 2 rooms', ch.length === 2 && ch[0][0] === 'Booking.com' && ch[0][1] === '3' && ch[0][3] === '55.56٪' && ch[1][1] === '2', JSON.stringify(ch));
  ok('the hotel remembers its room count', await p.evaluate(() => document.getElementById('ht-avail').value === '20'));
  const tb = await p.evaluate(() => { const g = SKEngines.finance.ledger.buildGeneralLedger(SKosifLedger.entries()); return Math.round((g.reduce((s, x) => s + x.debit, 0) - g.reduce((s, x) => s + x.credit, 0)) * 100); });
  ok('the books stay balanced', tb === 0, String(tb));
  ok('no page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
} finally { await browser.close(); }

if (fails.length) { console.error('Hotel pack: ' + fails.length + ' failed\n- ' + fails.join('\n- ')); process.exit(1); }
console.log('Hotel pack: all checks OK');
