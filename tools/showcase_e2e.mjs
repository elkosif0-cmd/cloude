// SQC — the showcase: any company of the research bundle, audited end to end, then toured (regression test).
// On a laptop, a 390px phone and a 320px phone, from a first start:
//   • «▶ نموذج عرض القدرات» opens the picker with every audit-file model in the current catalog; search and sector
//     filter narrow it; every visible control of the picker stays on the screen;
//   • «عرض القدرات» on a company opens its own engagement file (its trial balance from its published statements), runs
//     the full audit without an AI key (rounds, documents, adjustments, final report) and shows the tour;
//   • every step of the tour opens what it names: the engagement tab, the document (auditor's report, integrated
//     report), or the screen (analytics, the global replay against the real auditor, the global reference);
//   • choosing the same company again reopens the same file (no duplicate), the ?do=showcase link opens the picker,
//     nothing scrolls sideways and no page error is raised.
// Usage: node tools/showcase_e2e.mjs [url]
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright'); /* resolved through NODE_PATH in CI, like ui_smoke */

const URL_ = (process.argv[2] || 'http://localhost:8765/app-safe.html').replace(/[?#].*$/, '');
const failures = [], passed = [];
const ok = (tag, name, cond, extra = '') => { const l = `${tag} ${cond ? '✓' : '✗'} ${name}${extra ? ' — ' + extra : ''}`; (cond ? passed : failures).push(l); console.log(l); };
const watchdog = setTimeout(() => { console.error('showcase E2E timed out'); process.exit(2); }, 12 * 60 * 1000);
const browser = await chromium.launch(process.env.SQC_INSECURE ? { args: ['--ignore-certificate-errors'] } : {});

/* every visible control inside the screen; the page does not scroll sideways */
const FITS = (sel) => { const de = document.documentElement, W = de.clientWidth, bad = [];
  for (const b of document.querySelectorAll(sel + ' button, ' + sel + ' input, ' + sel + ' select')) {
    if (!b.offsetParent) continue; const r = b.getBoundingClientRect();
    if (r.left < -0.5 || r.right > W + 0.5) bad.push(`«${(b.textContent || b.getAttribute('aria-label') || '').trim().slice(0, 20)}» ${r.left.toFixed(0)}–${r.right.toFixed(0)}`); }
  const over = Math.max(de.scrollWidth, document.body.scrollWidth) - W; if (over > 1) bad.push(`page scrolls sideways by ${over}px`);
  return bad; };

for (const [tag, opts] of [['laptop', { viewport: { width: 1366, height: 900 } }], ['390px', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }], ['320px', { viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true }]]) {
  const ctx = await browser.newContext(opts);
  ctx.setDefaultTimeout(30000);
  const p = await ctx.newPage();
  /* a page error names the step it happened in and where it was thrown, so a failure in CI can be traced */
  let phase = 'start';
  const errs = []; p.on('pageerror', (e) => errs.push(`${e.message} [during ${phase}] at ${String(e.stack || '').split('\n').slice(1, 4).map((l) => l.trim()).join(' < ')}`));
  phase = 'first start';
  await p.goto(URL_, { waitUntil: 'load' });
  /* settled: the first start's sample data is recorded, its overlay is gone, and the page is the one reloaded after it */
  for (let t0 = Date.now(), quiet = 0; Date.now() - t0 < 90000; await p.waitForTimeout(250)) {
    const s = await p.evaluate(() => { let at = false; try { at = !!JSON.parse(localStorage.getItem('skosif_demo_v1') || '{}').at; } catch { /* unreadable */ }
      return { at, ready: !!(window.SKosifCore && document.querySelector('.topbar')) && !document.querySelector('.skdemo-overlay'), reloaded: (performance.getEntriesByType('navigation')[0] || {}).type === 'reload' }; }).catch(() => null);
    quiet = s && s.at && s.ready ? quiet + 1 : 0;
    if (s && s.at && s.ready && (s.reloaded || quiet >= 16)) break;
  }
  await p.evaluate(() => { sessionStorage.setItem('sqc_space_chosen', '1'); SKosifCore.go('tbreview'); });
  await p.waitForSelector('#view [data-bundle-open]', { timeout: 20000 });

  /* the picker */
  phase = 'picker';
  await p.click('#view .tbr-files [data-bundle-open]');
  await p.waitForSelector('#tbr-bundle [data-bundle-show]', { timeout: 15000 });
  // The published-source catalog changes as verified models are added: assert identities, not a stale fixed count.
  const expected = await p.evaluate(() => (window.SKEngines?.reports?.corpusCompanies?.auditModelCatalog?.() || [])
    .filter((c) => c.auditFile).map((c) => c.id).sort());
  const actual = await p.locator('#tbr-bundle [data-bundle-show]').evaluateAll((buttons) =>
    buttons.map((b) => b.getAttribute('data-bundle-show')).sort());
  const all = actual.length;
  ok(tag, 'the picker lists every auditable company in the current catalog', expected.length > 0 && JSON.stringify(actual) === JSON.stringify(expected), `${all}/${expected.length}`);
  const pf = await p.evaluate(FITS, '#tbr-bundle'); if (pf.length) { failures.push(`${tag} ✗ picker controls off screen — ${pf.join('; ')}`); console.log(failures.at(-1)); }
  await p.fill('#tbr-bundle [data-bundle-q]', 'Aramco');
  const q = await p.locator('#tbr-bundle [data-bundle-show]').count();
  ok(tag, 'the search narrows the list', q >= 1 && q < all, `${q}`);
  await p.fill('#tbr-bundle [data-bundle-q]', '');
  const sec = await p.evaluate(() => { const s = document.querySelector('#tbr-bundle [data-bundle-sector]'); const o = [...s.options].find((x) => x.value === 'banking'); if (!o) return null; s.value = 'banking'; s.dispatchEvent(new Event('change', { bubbles: true })); return document.querySelectorAll('#tbr-bundle [data-bundle-show]').length; });
  ok(tag, 'the sector filter narrows the list', sec !== null && sec >= 1 && sec < all, `${sec}`);
  await p.evaluate(() => { const s = document.querySelector('#tbr-bundle [data-bundle-sector]'); s.value = ''; s.dispatchEvent(new Event('change', { bubbles: true })); });
  await p.fill('#tbr-bundle [data-bundle-q]', 'Aramco');

  /* «عرض القدرات»: the file, the full audit, the tour */
  phase = 'showcase run';
  const t0 = Date.now();
  const btn = p.locator('#tbr-bundle [data-bundle-show]').first();
  await (opts.hasTouch ? btn.tap() : btn.click());
  const tour = await p.waitForSelector('#view .tbr-tour', { timeout: 120000 }).then(() => true).catch(() => false);
  ok(tag, '«عرض القدرات» audits the company and shows the tour', tour, `${((Date.now() - t0) / 1000).toFixed(1)}s`);
  if (!tour) { ok(tag, 'no page errors', !errs.length, errs.slice(0, 2).join(' | ')); await ctx.close(); continue; }
  const info = await p.evaluate(() => { const f = JSON.parse(localStorage.getItem('sqc_eng_files_v1') || localStorage.getItem('skosif_eng_files_v1') || 'null');
    return { title: document.querySelector('.tbr-tour h3').textContent, steps: [...document.querySelectorAll('.tbr-tour [data-tour]')].map((b) => b.dataset.tour), files: document.querySelectorAll('.tbr-file').length }; });
  ok(tag, 'the tour names the company', /Aramco|أرامكو/i.test(info.title), info.title);
  ok(tag, 'the tour has its steps', info.steps.length >= 9, info.steps.join(' '));
  const tf = await p.evaluate(FITS, '.tbr-tour'); ok(tag, 'the tour fits the screen', !tf.length, tf.join('; '));

  /* every step opens what it names */
  for (const k of info.steps) {
    phase = 'tour step ' + k;
    await p.evaluate(() => { if (SKosifCore.view() !== 'tbreview') SKosifCore.go('tbreview'); });
    await p.waitForSelector(`#view .tbr-tour [data-tour="${k}"]`, { timeout: 15000 });
    await p.evaluate((kk) => document.querySelector(`#view .tbr-tour [data-tour="${kk}"]`).click(), k);
    await p.waitForTimeout(700);
    const [kind, v] = k.split(':');
    const r = await p.evaluate(({ kind, v }) => {
      const view = SKosifCore.view(), pressed = [...document.querySelectorAll('#view [aria-selected="true"], #view [aria-pressed="true"], #view [aria-current="page"]')].map((x) => (x.textContent || '').trim()).join(' | ');
      const doc = document.querySelector(`#view [data-doc="${v}"]`);
      return { view, pressed, docOn: doc ? doc.getAttribute('aria-pressed') === 'true' : null, empty: !(document.querySelector('#view') || {}).textContent };
    }, { kind, v });
    const good = kind === 'view' ? r.view === v : kind === 'doc' ? r.view === 'tbreview' && r.docOn === true : r.view === 'tbreview';
    ok(tag, `tour step ${k} opens it`, good && !r.empty, `view ${r.view}${kind === 'doc' ? ', doc pressed ' + r.docOn : ''}`);
  }

  /* the same company again: the same file, no duplicate and no second run */
  phase = 'same company again';
  await p.evaluate(() => SKosifCore.go('tbreview')); await p.waitForTimeout(400);
  const before = await p.locator('#view .tbr-file').count();
  await p.evaluate(() => SKosifTBReview.showcase('aramco-2025'));
  await p.waitForSelector('#view .tbr-tour', { timeout: 60000 });
  const after = await p.locator('#view .tbr-file').count();
  ok(tag, 'choosing the same company again reopens its file', after === before, `${before} → ${after}`);
  await p.click('#view .tbr-tour [data-tour-hide]');
  ok(tag, 'the tour can be hidden', !(await p.locator('#view .tbr-tour').count()));
  ok(tag, 'no page errors', !errs.length, [...new Set(errs)].slice(0, 3).join(' | '));
  await ctx.close();
}

/* the link: …?do=showcase opens the picker */
{
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } }), p = await ctx.newPage();
  await ctx.addInitScript(() => { try { sessionStorage.setItem('sqc_space_chosen', '1'); } catch { /* private mode */ } });
  await p.goto(URL_ + '?do=showcase', { waitUntil: 'load' });
  const opened = await p.waitForSelector('#tbr-bundle [data-bundle-show]', { timeout: 90000 }).then(() => true).catch(() => false);
  ok('link', '?do=showcase opens the picker', opened);
  await ctx.close();
}
await browser.close(); clearTimeout(watchdog);
if (failures.length) { console.error(`showcase E2E: ${passed.length} passed, ${failures.length} failed`); process.exit(1); }
console.log(`showcase E2E: ${passed.length} passed, 0 failed`);
