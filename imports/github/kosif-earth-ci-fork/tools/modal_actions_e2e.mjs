// SQC — dialog actions stay on the screen (regression test for the helpers' company chooser at 320px, where
// «+ شركة جديدة» was pushed 62px past the right edge by a long «متابعة مع «…»» button and clipped).
// On a 320px phone, a 390px phone and a laptop, for the chooser reached the way a user reaches it (…/#sales on a first
// start), for the same chooser with a long company name (words, and one unbroken word), for the new-company form it
// opens, and for the other dialogs that share the action row (confirm, form, the demo-data panel):
//   • every visible action lies inside the screen (left ≥ 0, right ≤ viewport) and inside its dialog;
//   • no label is cut (the button's content fits its box) and no two actions overlap;
//   • each action is tappable: the point at its centre hits that action (and «+ شركة جديدة» is tapped for real);
//   • on touch screens the row's actions are at least 44px high, and at 360px or less they stack full width;
//   • the page does not scroll sideways, and no page error is raised.
// Usage: node tools/modal_actions_e2e.mjs [url]   (SQC_SHOTS=<dir> also saves a screenshot of each chooser)
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright'); /* resolved through NODE_PATH in CI, like ui_smoke */

const URL_ = (process.argv[2] || 'http://localhost:8765/app-safe.html').replace(/[?#].*$/, '');
const SHOTS = process.env.SQC_SHOTS || '';
const failures = [], passed = [];
const ok = (tag, name, problems) => { const l = `${tag} ${problems.length ? '✗' : '✓'} ${name}${problems.length ? ' — ' + problems.join('; ') : ''}`; (problems.length ? failures : passed).push(l); console.log(l); };
const watchdog = setTimeout(() => { console.error('modal actions E2E timed out'); process.exit(2); }, 8 * 60 * 1000);
const browser = await chromium.launch(process.env.SQC_INSECURE ? { args: ['--ignore-certificate-errors'] } : {});

const LONG = ['مؤسسة أغنام الوادي للتجارة والمواشي واللحوم المبردة المحدودة', 'AlWadiLivestockTradingAndChilledMeatCompanyLimited'];

/* measures one open dialog: the problems found, as short strings */
const MEASURE = (sel) => {
  const d = document.querySelector(sel); if (!d) return ['dialog not open: ' + sel];
  const de = document.documentElement, W = de.clientWidth, dr = d.getBoundingClientRect(), out = [];
  const touch = matchMedia('(pointer:coarse)').matches;
  const acts = [...d.querySelectorAll('.skd-acts > *, .sqc-space-o')].filter((b) => b.offsetParent && b.getClientRects().length);
  if (!acts.length) out.push('no visible action');
  const name = (b) => '«' + (b.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 24) + '»';
  for (const b of acts) {
    b.scrollIntoView({ block: 'nearest' });
    const r = b.getBoundingClientRect();
    if (r.left < -0.5 || r.right > W + 0.5) out.push(`${name(b)} off screen (left ${r.left.toFixed(1)}, right ${r.right.toFixed(1)}, viewport ${W})`);
    if (r.left < dr.left - 0.5 || r.right > dr.right + 0.5) out.push(`${name(b)} outside its dialog (${r.left.toFixed(1)}–${r.right.toFixed(1)} vs ${dr.left.toFixed(1)}–${dr.right.toFixed(1)})`);
    if (b.scrollWidth > b.clientWidth + 1 || b.scrollHeight > b.clientHeight + 1) out.push(`${name(b)} label cut (${b.scrollWidth}×${b.scrollHeight} in ${b.clientWidth}×${b.clientHeight})`);
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    if (!hit || !(hit === b || b.contains(hit))) out.push(`${name(b)} not tappable (its centre hits ${hit ? hit.tagName + '.' + hit.className : 'nothing'})`);
    if (touch && b.parentElement.classList.contains('skd-acts') && r.height < 43.5) out.push(`${name(b)} ${r.height.toFixed(1)}px high, under 44px`);
  }
  for (let i = 0; i < acts.length; i++) for (let j = i + 1; j < acts.length; j++) {
    const a = acts[i].getBoundingClientRect(), b = acts[j].getBoundingClientRect();
    const w = Math.min(a.right, b.right) - Math.max(a.left, b.left), h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
    if (w > 0.5 && h > 0.5) out.push(`${name(acts[i])} overlaps ${name(acts[j])}`);
  }
  if (W <= 360) for (const row of d.querySelectorAll('.skd-acts')) {
    const rr = row.getBoundingClientRect();
    for (const b of row.children) if (b.offsetParent && Math.abs(b.getBoundingClientRect().width - rr.width) > 1) out.push(`${name(b)} not stacked full width at ${W}px`);
  }
  const over = Math.max(de.scrollWidth, document.body.scrollWidth) - W;
  if (over > 1) out.push(`page scrolls sideways by ${over}px`);
  return out;
};

for (const [tag, opts] of [['320px', { viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true }], ['390px', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }], ['laptop', { viewport: { width: 1366, height: 900 } }]]) {
  const ctx = await browser.newContext(opts);
  ctx.setDefaultTimeout(30000);
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  const shot = async (n) => { if (SHOTS) await p.screenshot({ path: `${SHOTS}/modal-${tag}-${n}.png` }); };

  /* the chooser as a user meets it: …/#sales on a first start (the sample data is filled and the page reloads first) */
  await p.goto(URL_ + '#sales', { waitUntil: 'load' });
  /* settled: the fill is recorded, its overlay is gone, and the page is the one reloaded after it (or 4s passed quietly) */
  for (let t0 = Date.now(), quiet = 0; Date.now() - t0 < 90000; await p.waitForTimeout(250)) {
    const s = await p.evaluate(() => { let at = false; try { at = !!JSON.parse(localStorage.getItem('skosif_demo_v1') || '{}').at; } catch { /* unreadable */ }
      return { at, ready: !!(window.SKosifCore && document.querySelector('.topbar')) && !document.querySelector('.skdemo-overlay'), reloaded: (performance.getEntriesByType('navigation')[0] || {}).type === 'reload' }; }).catch(() => null);
    quiet = s && s.at && s.ready ? quiet + 1 : 0;
    if (s && s.at && s.ready && (s.reloaded || quiet >= 16)) break;
  }
  await p.waitForFunction(() => document.querySelector('#sqc-space .skd-acts'), undefined, { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(600);
  ok(tag, '#sales: company chooser actions fit', await p.evaluate(MEASURE, '#sqc-space .skd'));
  await shot('chooser');

  /* the same chooser for a company with a long name: the «متابعة مع «…»» button that pushed the other one off */
  /* (only the labels are lengthened: the app's company registry is left as it is) */
  for (const [i, nm] of LONG.entries()) {
    await p.evaluate((n) => { document.getElementById('sqc-space')?.remove(); SKosifSpace.choose();
      const d = document.getElementById('sqc-space'); d.querySelector('.skd-acts .primary').textContent = 'متابعة مع «' + n + '»';
      d.querySelectorAll('.sqc-space-o b').forEach((b) => { b.textContent = n; }); }, nm);
    await p.waitForTimeout(300);
    ok(tag, `long company name ${i + 1}: chooser actions fit`, await p.evaluate(MEASURE, '#sqc-space .skd'));
    await shot('long-' + (i + 1));
  }

  /* «+ شركة جديدة» tapped for real opens the new-company form; its actions fit too */
  const nb = p.locator('#sqc-space [data-space-new]');
  const tapErr = await (opts.hasTouch ? nb.tap({ timeout: 5000 }) : nb.click({ timeout: 5000 })).then(() => '', (e) => String(e.message).split('\n').find((l) => /outside|intercept|not visible/.test(l)) || String(e.message).split('\n')[0]);
  const form = !tapErr && await p.waitForFunction(() => document.querySelector('.skd-wrap form.skd'), undefined, { timeout: 5000 }).then(() => true).catch(() => false);
  ok(tag, '«+ شركة جديدة» opens the new-company form', form ? await p.evaluate(MEASURE, '.skd-wrap form.skd') : [tapErr ? '«+ شركة جديدة» cannot be tapped: ' + tapErr.trim() : 'the tap did not open the form']);
  if (form) await p.evaluate(() => document.querySelector('.skd-wrap form.skd [data-r="0"]').click());
  await p.evaluate(() => { sessionStorage.setItem('sqc_space_chosen', '1'); document.getElementById('sqc-space')?.remove(); });

  /* the other dialogs that share the action row */
  let pr = p.evaluate(() => SK.confirm('نص تأكيد للاختبار', { title: 'تأكيد', ok: 'نعم، احذف كل البيانات التجريبية الآن', cancel: 'لا، أبقِ البيانات كما هي' }));
  await p.waitForTimeout(300);
  ok(tag, 'confirm with long labels: actions fit', await p.evaluate(MEASURE, '.skd-wrap .skd'));
  await p.evaluate(() => document.querySelector('.skd-wrap .skd-acts .btn').click()); await pr;
  pr = p.evaluate(() => SK.confirm('نص تأكيد قصير', { title: 'تأكيد' }));
  await p.waitForTimeout(300);
  const row = await p.evaluate(() => { const b = [...document.querySelectorAll('.skd-wrap .skd-acts .btn')].map((x) => Math.round(x.getBoundingClientRect().top)); return b.length === 2 && b[0] === b[1]; });
  ok(tag, 'confirm with short labels: actions fit', [...await p.evaluate(MEASURE, '.skd-wrap .skd'), ...(tag !== '320px' && !row ? ['two short actions no longer share a row'] : [])]);
  await p.evaluate(() => document.querySelector('.skd-wrap .skd-acts .btn').click()); await pr;
  await p.evaluate(() => { const b = document.createElement('button'); b.dataset.demo = 'panel'; b.hidden = true; document.body.appendChild(b); b.click(); b.remove(); });
  const panel = await p.waitForFunction(() => document.querySelector('.skd.skdemo-panel .skd-acts'), undefined, { timeout: 8000 }).then(() => true).catch(() => false);
  ok(tag, 'demo-data panel: actions fit', panel ? await p.evaluate(MEASURE, '.skd.skdemo-panel') : ['the panel did not open']);
  if (panel) await p.evaluate(() => document.querySelector('.skdemo-panel [data-demo="close"]').click());

  ok(tag, 'no page errors', [...new Set(errs)].slice(0, 3));
  await ctx.close();
}
await browser.close(); clearTimeout(watchdog);
if (failures.length) { console.error(`modal actions E2E: ${passed.length} passed, ${failures.length} failed`); process.exit(1); }
console.log(`modal actions E2E: ${passed.length} passed, 0 failed`);
