// SQC — advances (السلف والدفعات المقدمة): the register and the books stay in step.
// On a laptop and on a phone, from a fresh start (the demo fills the register and posts it):
//   • the demo register is there (employees, a supplier prepayment, a customer deposit), one advance is behind schedule,
//     and the advances account in the books equals what the employees still owe;
//   • a new advance typed in the first row is posted; a repayment is posted; correcting the repayment and then the
//     advance's amount reverses the old entry (dated today) and posts the new one — the journal keeps its history and
//     the edit log stays whole; deleting the advance reverses what is left;
//   • the phone page never scrolls sideways; no page error.
// Usage: node tools/advances_e2e.mjs [url]
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright'); /* resolved through NODE_PATH in CI, like ui_smoke */

const URL_ = (process.argv[2] || 'http://localhost:8765/app-safe.html').replace(/[?#].*$/, '');
const failures = [], passed = [];
const ok = (tag, name, cond, extra = '') => { const l = `${tag} ${cond ? '✓' : '✗'} ${name}${extra ? ' — ' + extra : ''}`; (cond ? passed : failures).push(l); console.log(l); };
const watchdog = setTimeout(() => { console.error('advances E2E timed out'); process.exit(2); }, 8 * 60 * 1000);
const browser = await chromium.launch(process.env.SQC_INSECURE ? { args: ['--ignore-certificate-errors'] } : {});

for (const [tag, opts] of [['laptop', { viewport: { width: 1366, height: 900 } }], ['phone', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }]]) {
  const ctx = await browser.newContext(opts);
  ctx.setDefaultTimeout(30000);
  await ctx.addInitScript(() => { try { sessionStorage.setItem('sqc_space_chosen', '1'); } catch { /* private mode */ } });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  const ready = () => p.waitForFunction(() => window.SKosifCore && window.SKosifAdvances && document.querySelector('.topbar') && !document.querySelector('.skdemo-overlay'), null, { timeout: 60000 });
  /* the first start fills the demo and reloads: wait until the register is there and the page has settled */
  await p.goto(URL_, { waitUntil: 'load' });
  for (let i = 0; i < 3; i++) { try { await ready(); await p.waitForFunction(() => SKosifAdvances.list().length >= 5, null, { timeout: 20000 }); break; } catch { await p.waitForTimeout(1500); } }
  await p.waitForTimeout(1200);
  await p.evaluate(() => SKosifCore.go('advances'));
  await p.waitForSelector('.adv-table', { timeout: 15000 });

  /* the books, read the same way for every check: open entries with an advance source, and the 1150 balance */
  const books = () => p.evaluate(() => {
    const L = SKosifLedger, acc = L.accounts().find((a) => a.code === '1150'), es = L.entries();
    const mine = es.filter((e) => String(e.sourceId || '').startsWith('advance:'));
    const bal = acc ? es.reduce((t, e) => t + (e.lines || []).filter((l) => l.accountId === acc.id).reduce((s, l) => s + l.debit - l.credit, 0), 0) : null;
    const t = L.trail();
    return { live: mine.filter((e) => !e.reversedBy).length, reversals: es.filter((e) => e.reversalOf).length, bal: bal == null ? null : Math.round(bal * 100) / 100,
      balanced: mine.every((e) => Math.abs(e.lines.reduce((s, l) => s + l.debit - l.credit, 0)) < 0.005), chain: t ? t.ok : null };
  });
  const owed = () => p.evaluate(() => { const s = SKosifAdvances.summary(); return s ? s.kinds.employee.balance : null; });

  /* the demo register */
  const demo = await p.evaluate(() => ({ n: SKosifAdvances.list().length, kinds: [...new Set(SKosifAdvances.list().map((a) => a.kind))].sort().join(','), rows: document.querySelectorAll('.adv-row').length, overdue: SKosifAdvances.summary().overdueCount }));
  ok(tag, 'the demo register: employees, a supplier prepayment and a customer deposit', demo.n >= 5 && demo.kinds === 'customer,employee,supplier' && demo.rows >= 5, JSON.stringify(demo));
  ok(tag, 'an advance behind its schedule shows as overdue', demo.overdue >= 1, String(demo.overdue));
  let b = await books(), o = await owed();
  ok(tag, 'the demo is posted: every advance entry balances', b.live >= 5 && b.balanced, JSON.stringify(b));
  ok(tag, 'the advances account in the books equals what the employees owe', b.bal === o, `${b.bal} / ${o}`);
  const base = { live: b.live, reversals: b.reversals, bal: b.bal };

  /* a new advance in the first row */
  const party = 'موظف اختبار ' + tag;
  await p.selectOption('.adv-new [data-n="kind"]', 'employee');
  await p.fill('.adv-new [data-n="party"]', party);
  await p.fill('.adv-new [data-n="amount"]', '1200');
  await p.fill('.adv-new [data-n="installments"]', '3');
  await p.click('[data-adv="add"]');
  await p.waitForSelector('.adv-detail', { timeout: 10000 });
  b = await books();
  ok(tag, 'a new advance is posted (Dr advances / Cr cash)', b.live === base.live + 1 && b.bal === base.bal + 1200, JSON.stringify(b));

  /* a repayment, then its correction */
  await p.fill('.adv-rnew [data-rn="amount"]', '400');
  await p.click('[data-adv="rep-add"]');
  await p.waitForSelector('[data-rep]', { timeout: 10000 });
  b = await books();
  ok(tag, 'a repayment is posted', b.live === base.live + 2 && b.bal === base.bal + 800, JSON.stringify(b));
  await p.fill('[data-rep] [data-r="amount"]', '300');
  await p.click('[data-rep] [data-adv="rep-save"]');
  await p.waitForTimeout(600);
  b = await books();
  ok(tag, 'correcting the repayment reverses the old entry and posts the new one', b.live === base.live + 2 && b.reversals === base.reversals + 1 && b.bal === base.bal + 900, JSON.stringify(b));

  /* the advance's amount, edited in place */
  await p.fill('.adv-detail [data-f="amount"]', '1500');
  await p.click('[data-adv="save"]');
  await p.waitForTimeout(600);
  b = await books();
  ok(tag, 'editing the amount reverses and reposts the advance', b.live === base.live + 2 && b.reversals === base.reversals + 2 && b.bal === base.bal + 1200, JSON.stringify(b));
  ok(tag, 'the books stay balanced and the edit log stays whole', b.balanced && b.chain !== false, JSON.stringify(b));
  ok(tag, 'the register and the books agree', b.bal === (await owed()), `${b.bal} / ${await owed()}`);

  /* the phone page never scrolls sideways, with the advance open */
  const sw = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth }));
  ok(tag, 'no sideways scrolling with the advance open', sw.sw <= sw.iw + 1, JSON.stringify(sw));

  /* delete: what is left is reversed */
  await p.click('[data-adv="del"]');
  await p.click('.skd [data-r="1"]');
  await p.waitForTimeout(700);
  b = await books();
  ok(tag, 'deleting the advance reverses its entries; the account is back where it was', b.live === base.live && b.bal === base.bal && !(await p.evaluate((x) => SKosifAdvances.list().some((a) => a.party === x), party)), JSON.stringify(b));

  ok(tag, 'no page errors', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

clearTimeout(watchdog);
await browser.close();
console.log(`\nadvances E2E: ${passed.length} passed, ${failures.length} failed`);
if (failures.length) { console.log(failures.join('\n')); process.exit(1); }
