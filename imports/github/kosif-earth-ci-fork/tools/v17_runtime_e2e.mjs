// SQC — the core's error banner shows this session's errors only, and the stored log keeps every error for diagnostics
// (regression test for the stale banner: an error stored by an older release showed on every screen, with no time or
// build, e.g. «window.error · reports — Cannot set properties of null (setting 'innerHTML')» on Product Flow Studio).
// On a laptop and on a phone:
//   • a stored log from earlier sessions (an entry from before builds were recorded, one from another build, one from
//     this build but an earlier session) never reaches the banner, on any screen, visited and revisited;
//   • that log is kept whole for diagnostics (SKosifCore.runtimeErrors, marked not current);
//   • a live uncaught error and a live rejected promise still show at once, with their time, the build number and the
//     stack; the page still reports the error (nothing is swallowed) and SK.errors keeps its stack;
//   • «إخفاء» hides the banner but keeps the log, and the next error shows again; after a reload the previous session's
//     errors are in the log, not in the banner; the banner never makes the phone page scroll sideways.
// Usage: node tools/v17_runtime_e2e.mjs [url]
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright'); /* resolved through NODE_PATH in CI, like ui_smoke */

const URL_ = process.argv[2] || 'http://localhost:8765/app-safe.html';
const failures = [], passed = [];
const ok = (tag, name, cond, extra = '') => { const l = `${tag} ${cond ? '✓' : '✗'} ${name}${extra ? ' — ' + extra : ''}`; (cond ? passed : failures).push(l); console.log(l); };
const watchdog = setTimeout(() => { console.error('v17 runtime E2E timed out'); process.exit(2); }, 8 * 60 * 1000);
const browser = await chromium.launch(process.env.SQC_INSECURE ? { args: ['--ignore-certificate-errors'] } : {});
const KEY = 'aghnam-v17-runtime-errors';
const STALE = "Cannot set properties of null (setting 'innerHTML')";
const SCREENS = ['reports', 'productflow', 'dash', 'health', 'reports', 'productflow'];

for (const [tag, opts] of [['laptop', { viewport: { width: 1366, height: 900 } }], ['phone', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }]]) {
  const ctx = await browser.newContext(opts);
  ctx.setDefaultTimeout(30000);
  await ctx.addInitScript(() => { try { sessionStorage.setItem('sqc_space_chosen', '1'); } catch { /* private mode */ } });
  const p = await ctx.newPage();
  const pageErrors = []; p.on('pageerror', (e) => pageErrors.push(e.message));
  const ready = async () => { await p.waitForFunction(() => window.SKosifCore && document.querySelector('.topbar')); await p.waitForTimeout(800); };
  const go = async (id) => { await p.evaluate((x) => SKosifCore.go(x), id); await p.waitForTimeout(900); };
  const banner = () => p.evaluate(() => {
    const el = document.querySelector('#v17-runtime-banner');
    if (!el || !el.classList.contains('show') || getComputedStyle(el).display === 'none') return null;
    const t = el.querySelector('time'), pre = el.querySelector('details.v17-stack pre');
    return { text: el.innerText.replace(/\s+/g, ' ').trim(), at: t && t.getAttribute('datetime'), when: t && t.textContent, stack: pre ? pre.textContent : '' };
  });
  const log = () => p.evaluate(() => SKosifCore.runtimeErrors());

  await p.goto(URL_, { waitUntil: 'load' }); await ready();
  const build = await p.evaluate(() => (document.querySelector('meta[name="sqc-build"]') || {}).content || '');
  const v = await p.evaluate(() => { const s = document.querySelector('script[src*="skosif.js?v="]'); return s ? new URL(s.src).searchParams.get('v') : ''; });
  ok(tag, 'the page carries its build number, the same as the bundle ?v=', /^[0-9a-f]{10}$/.test(build) && build === v, `${build} / ${v}`);

  /* the stored log from earlier sessions */
  const seeded = [
    { at: new Date(Date.now() - 60000).toISOString(), phase: 'promise', msg: 'same build, earlier session', view: 'dash', build, session: 'earlier-session' },
    { at: '2026-09-26T08:00:00.000Z', phase: 'window.error', msg: 'older release error', view: 'dash', build: '0000000000', session: 'old-session' },
    { at: '2026-09-20T10:15:00.000Z', phase: 'window.error', msg: STALE, view: 'reports' },
  ];
  await p.evaluate(([k, rows]) => localStorage.setItem(k, JSON.stringify(rows)), [KEY, seeded]);
  await p.reload({ waitUntil: 'load' }); await ready();
  let shown = [];
  for (const id of SCREENS) { await go(id); const b = await banner(); if (b) shown.push(`${id}: ${b.text.slice(0, 80)}`); }
  ok(tag, `no stored error reaches the banner on ${SCREENS.length} screen visits`, shown.length === 0, shown.join(' | '));
  const status = await p.evaluate(() => { const s = document.querySelector('.v17-stability'); return s ? s.innerText.trim() : null; });
  ok(tag, 'the status card does not count earlier sessions', status === null || !/احتواء/.test(status), String(status));
  let rows = await log();
  ok(tag, 'the stored log is kept whole for diagnostics', rows.length === 3 && rows.some((r) => r.msg === STALE) && rows.every((r) => r.current === false), JSON.stringify(rows.map((r) => [r.msg.slice(0, 20), r.current])));
  ok(tag, 'the stored log is still in localStorage', JSON.parse(await p.evaluate((k) => localStorage.getItem(k), KEY)).length === 3);
  ok(tag, 'no page error while visiting', pageErrors.length === 0, pageErrors.join(' | '));

  /* a live uncaught error: shown at once, with time, build and stack; the page still sees it */
  const before = pageErrors.length;
  await p.evaluate((t) => { setTimeout(() => { throw new Error('v17 live probe ' + t); }, 0); }, tag);
  await p.waitForTimeout(600);
  let b = await banner();
  ok(tag, 'a live error shows in the banner', !!b && b.text.includes('v17 live probe ' + tag), b && b.text.slice(0, 120));
  ok(tag, 'the banner shows the error time', !!b && !!b.at && Math.abs(Date.parse(b.at) - Date.now()) < 60000 && /\d{2}\/\d{2}\/\d{4}/.test(b.when || ''), b && `${b.at} ${b.when}`);
  ok(tag, 'the banner shows the build number', !!b && b.text.includes('build ' + build), b && b.text.slice(0, 160));
  ok(tag, 'the stack is kept in the banner details', !!b && b.stack.includes('v17 live probe ' + tag) && /\n\s*at /.test(b.stack), b && b.stack.slice(0, 120));
  ok(tag, 'the page still reports the error (not swallowed)', pageErrors.slice(before).some((m) => m.includes('v17 live probe ' + tag)));
  const sk = await p.evaluate(() => (SK.errors.list() || [])[0] || {});
  ok(tag, 'SK.errors keeps the stack too', String(sk.msg).includes('v17 live probe') && String(sk.stack).includes('v17 live probe'), String(sk.stack).slice(0, 80));
  rows = await log();
  ok(tag, 'the live error is logged first with its build, session and stack', rows.length === 4 && rows[0].current === true && rows[0].build === build && !!rows[0].session && String(rows[0].stack).includes('v17 live probe'));
  for (const id of ['productflow', 'dash']) { await go(id); const x = await banner(); ok(tag, `the live error stays visible on ${id}`, !!x && x.text.includes('v17 live probe ' + tag)); }

  /* a live rejected promise */
  await p.evaluate(() => { Promise.reject(new Error('v17 promise probe')); });
  await p.waitForTimeout(600);
  b = await banner();
  ok(tag, 'a live rejected promise shows as the newest error', !!b && b.text.includes('v17 promise probe') && b.text.includes('promise'), b && b.text.slice(0, 100));

  /* the stack details open: nothing scrolls sideways (phone) */
  await p.evaluate(() => { const d = document.querySelector('#v17-runtime-banner details'); if (d) d.open = true; });
  await p.waitForTimeout(300);
  const wide = await p.evaluate(() => {
    const r = document.querySelector('#v17-runtime-banner').getBoundingClientRect(), v = document.querySelector('#view'), vr = v.getBoundingClientRect(), cs = getComputedStyle(v);
    return { sw: document.documentElement.scrollWidth, iw: innerWidth, left: Math.round(r.left), right: Math.round(r.right), contentLeft: Math.round(vr.left + parseFloat(cs.paddingLeft)), contentRight: Math.round(vr.right - parseFloat(cs.paddingRight)) };
  });
  ok(tag, 'the banner with open details stays inside the page width', wide.sw <= wide.iw + 1 && wide.left >= 0 && wide.right <= wide.iw, JSON.stringify(wide));
  ok(tag, 'the banner lines up with the page content (same side gutters)', Math.abs(wide.left - wide.contentLeft) <= 1 && Math.abs(wide.right - wide.contentRight) <= 1, JSON.stringify(wide));
  if (tag === 'phone') await p.screenshot({ path: process.env.V17_SHOT ? `${process.env.V17_SHOT}-${tag}.png` : '/dev/null' }).catch(() => {});

  /* «إخفاء»: the banner goes, the log stays, the next error shows again */
  await p.evaluate(() => document.querySelector('#v17-runtime-banner [data-act="v17-runtime-clear"]').click());
  await p.waitForTimeout(500);
  ok(tag, '«إخفاء» hides the banner', !(await banner()));
  ok(tag, '«إخفاء» keeps the stored log', (await log()).length === 5);
  await p.evaluate(() => { setTimeout(() => { throw new Error('v17 after hide'); }, 0); });
  await p.waitForTimeout(600);
  b = await banner();
  ok(tag, 'the next error after «إخفاء» shows again', !!b && b.text.includes('v17 after hide'));

  /* a new session: the previous session's errors are in the log, not in the banner */
  await p.reload({ waitUntil: 'load' }); await ready();
  shown = [];
  for (const id of ['productflow', 'reports']) { await go(id); const x = await banner(); if (x) shown.push(x.text.slice(0, 80)); }
  ok(tag, 'after a reload the previous session\'s errors stay out of the banner', shown.length === 0, shown.join(' | '));
  rows = await log();
  ok(tag, 'after a reload they are all in the log, none current', rows.length === 6 && rows.every((r) => r.current === false) && rows[0].msg === 'v17 after hide', JSON.stringify(rows.map((r) => r.msg.slice(0, 18))));
  await ctx.close();
}

clearTimeout(watchdog);
await browser.close();
console.log(`\nv17 runtime E2E: ${passed.length} passed, ${failures.length} failed`);
if (failures.length) { console.log(failures.join('\n')); process.exit(1); }
