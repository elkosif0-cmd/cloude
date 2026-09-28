// SQC — links open their screen (regression test for …/#sales opening the start screen instead).
// A link names a screen with ?go=<id> (and an action with ?do=<name>), or after # : #<id>, #go=<id>&do=<name>, or one of
// the everyday words (#sales → Sales Intelligence, #orders → Orders & Collections). On a laptop and on a phone, from a
// fresh start (the first start fills the sample data and reloads, and the link must survive that) and on a later start:
//   • each link lands on its screen, and the used link is taken out of the address (a refresh does not jump again);
//   • an unknown # word moves nowhere (the app reopens the screen it remembers) and raises no error;
//   • a # link followed inside the running app opens its screen too.
// Usage: node tools/deeplink_e2e.mjs [url]
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright'); /* resolved through NODE_PATH in CI, like ui_smoke */

const URL_ = (process.argv[2] || 'http://localhost:8765/app-safe.html').replace(/[?#].*$/, '');
const failures = [], passed = [];
const ok = (tag, name, cond, extra = '') => { const l = `${tag} ${cond ? '✓' : '✗'} ${name}${extra ? ' — ' + extra : ''}`; (cond ? passed : failures).push(l); console.log(l); };
const watchdog = setTimeout(() => { console.error('deeplink E2E timed out'); process.exit(2); }, 8 * 60 * 1000);
const browser = await chromium.launch(process.env.SQC_INSECURE ? { args: ['--ignore-certificate-errors'] } : {});

const CASES = [
  ['#sales', 'salesintel'], ['#orders', 'commerce'], ['#inventory', 'inventory'], ['#go=zatca', 'zatca'], ['?go=tbreview', 'tbreview'], ['#SALES', 'salesintel'],
];
for (const [tag, opts] of [['laptop', { viewport: { width: 1366, height: 900 } }], ['phone', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }]]) {
  const ctx = await browser.newContext(opts);
  ctx.setDefaultTimeout(30000);
  await ctx.addInitScript(() => { try { sessionStorage.setItem('sqc_space_chosen', '1'); } catch { /* private mode */ } });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  const ready = async () => {
    await p.waitForFunction(() => window.SKosifCore && document.querySelector('.topbar') && !document.querySelector('.skdemo-overlay'), null, { timeout: 60000 });
    await p.waitForTimeout(1500);
  };
  const view = () => p.evaluate(() => SKosifCore.view());
  const address = () => p.evaluate(() => location.search + location.hash);

  /* a fresh start: the sample data is filled and the page reloads; the link must still land */
  await p.goto(URL_ + '#sales', { waitUntil: 'load' }); await ready();
  await p.waitForFunction(() => SKosifCore.view() === 'salesintel', null, { timeout: 20000 }).catch(() => {});
  ok(tag, 'fresh start: #sales opens Sales Intelligence', (await view()) === 'salesintel', `${await view()}`);
  ok(tag, 'fresh start: the used link is taken out of the address', (await address()) === '', await address());

  for (const [link, want] of CASES) {
    await p.goto('about:blank');
    await p.goto(URL_ + link, { waitUntil: 'load' }); await ready();
    await p.waitForFunction((w) => SKosifCore.view() === w, want, { timeout: 15000 }).catch(() => {});
    ok(tag, `${link} opens ${want}`, (await view()) === want, `${await view()}`);
    ok(tag, `${link} is taken out of the address`, (await address()) === '', await address());
  }

  /* an unknown word moves nowhere: the app reopens the screen it remembers (here the home screen), with no error */
  await p.evaluate(() => SKosifCore.go('dash')); await p.waitForTimeout(800);
  await p.goto('about:blank');
  const before = errs.length;
  await p.goto(URL_ + '#no-such-screen', { waitUntil: 'load' }); await ready();
  ok(tag, 'an unknown # word moves nowhere (the remembered screen opens)', (await view()) === 'dash', `${await view()}`);
  ok(tag, 'an unknown # word is left in the address', (await address()) === '#no-such-screen', await address());
  ok(tag, 'an unknown # word raises no error', errs.length === before, errs.slice(before).join(' | '));

  /* a # link followed inside the running app */
  await p.evaluate(() => { location.hash = '#orders'; });
  await p.waitForFunction(() => SKosifCore.view() === 'commerce', null, { timeout: 10000 }).catch(() => {});
  ok(tag, 'a # link inside the running app opens its screen', (await view()) === 'commerce', `${await view()}`);
  await p.evaluate(() => { location.hash = '#sales'; });
  await p.waitForFunction(() => SKosifCore.view() === 'salesintel', null, { timeout: 10000 }).catch(() => {});
  ok(tag, '…and the next one too', (await view()) === 'salesintel', `${await view()}`);

  ok(tag, 'no page errors', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

clearTimeout(watchdog);
await browser.close();
console.log(`\ndeeplink E2E: ${passed.length} passed, ${failures.length} failed`);
if (failures.length) { console.log(failures.join('\n')); process.exit(1); }
