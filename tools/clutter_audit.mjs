// Clutter audit: how much chrome stands between the user and each screen's content, and how dense the screen is.
// Opens every visible screen of the demo company on a desktop and a phone and measures, per screen:
//   chrome   — the rows above the content (top bar, page head, flow chips, domain/hub tabs, space bar, sector strip)
//              with their heights and the number of controls in each; contentTop = where the screen's own content starts
//   content  — controls, headings, cards, tabs, words, scroll height, and the words a user reads before the first control
//   nav      — the sidebar's groups and hubs in this screen's entry, and the labels the sidebar repeats inside the page
// Output: <out>/clutter.json and a ranked table on stdout.
//   node tools/clutter_audit.mjs http://127.0.0.1:8766/ [out-dir]
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const base = (process.argv[2] || 'http://127.0.0.1:8766/').replace(/[?#].*$/, '').replace(/(index|app-safe)(\.html)?$/, '').replace(/\/?$/, '/');
const out = process.argv[3] || 'artifacts/clutter';
fs.mkdirSync(out, { recursive: true });
const ready = (p) => p.waitForFunction(() => window.SK && window.SKosifCore && window.SKosifSpace && SK.demo && SK.demo.settled() && !document.querySelector('.skdemo-overlay') && !SKosifSpace.busy() && window.SKosifLedger, null, { timeout: 120000 });

const MEASURE = () => {
  const q = (s, r = document) => [...r.querySelectorAll(s)];
  const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const ctrl = (r) => q('button,a[href],input,select,textarea,[role=tab],[role=button]', r).filter(vis).length;
  const rect = (el) => el ? el.getBoundingClientRect() : null;
  const view = document.getElementById('view');
  const rows = [];
  const add = (name, el, extra = {}) => { if (!el || !vis(el)) return; const r = rect(el); rows.push({ name, height: Math.round(r.height), top: Math.round(r.top + scrollY), controls: ctrl(el), ...extra }); };
  add('topbar', document.querySelector('.topbar'));
  add('pagehead', document.querySelector('.sk-ph'), { words: (document.querySelector('.sk-ph')?.innerText || '').split(/\s+/).filter(Boolean).length });
  add('flow', document.querySelector('.skflow'), { chips: q('.skflow-c').length });
  add('domain', view && view.querySelector(':scope > .skn-domain'), { hub: !!(view && view.querySelector(':scope > .skn-domain.skn-hubtabs')) });
  add('spacebar', view && view.querySelector(':scope > .sqc-space-bar'));
  add('sector', view && view.querySelector('.lg-sector'));
  const chromeEls = new Set(rows.map((r) => r.name));
  /* the first element of the screen's own content: the first visible child of #view that is not a chrome row */
  const kids = view ? [...view.children].filter((el) => vis(el) && !el.matches('.skn-domain,.sqc-space-bar,.skdemo,.skdemo-overlay')) : [];
  const first = kids[0];
  const contentTop = first ? Math.round(rect(first).top + scrollY) : null;
  const text = view ? view.innerText || '' : '';
  const words = text.split(/\s+/).filter(Boolean).length;
  /* words before the first control inside the content */
  let wordsBefore = 0;
  if (view) { const firstCtrl = q('button,a[href],input,select', view).filter(vis).find((el) => !el.closest('.skn-domain,.sqc-space-bar')); if (firstCtrl) { const range = document.createRange(); range.setStart(view, 0); range.setEndBefore(firstCtrl); wordsBefore = range.toString().split(/\s+/).filter(Boolean).length; } }
  const tabStrips = view ? q('[data-sk-tabs],[role=tablist],.tabs,.sk-tabs', view).filter(vis) : [];
  const nav = document.getElementById('nav');
  const navLabels = nav ? q('.nav-btn span', nav).map((s) => s.textContent.trim()).filter(Boolean) : [];
  const pageLabels = view ? q('button,[role=tab]', view).filter(vis).map((b) => b.textContent.trim()).filter((t) => t && t.length < 40) : [];
  const repeated = navLabels.filter((l) => pageLabels.includes(l));
  return {
    rows, contentTop, chrome: rows.filter((r) => r.name !== 'topbar').reduce((a, r) => a + r.height, 0),
    chromeControls: rows.reduce((a, r) => a + r.controls, 0),
    controls: view ? ctrl(view) : 0, headings: view ? q('h1,h2,h3,h4', view).filter(vis).length : 0,
    cards: view ? q('section,.card,.sk-card,.skc-card,.tile,.box', view).filter(vis).length : 0,
    tabStrips: tabStrips.length, tabs: tabStrips.reduce((a, s) => a + q('[data-tab],[role=tab],button', s).filter(vis).length, 0),
    words, wordsBefore, scrollHeight: document.documentElement.scrollHeight, viewport: innerHeight,
    navGroups: nav ? q('.skn-group', nav).length : 0, navHubs: nav ? q('.nav-btn', nav).filter(vis).length : 0, navRepeatedInPage: [...new Set(repeated)],
    gate: (window.SK.gate && SK.gate.current()) || '', badText: (text.match(/\b(undefined|NaN|null|\[object Object\])\b/g) || []).length,
  };
};

const browser = await chromium.launch();
const report = [];
try {
  for (const [device, viewport] of [['desktop', { width: 1400, height: 900 }], ['phone', { width: 390, height: 844 }]]) {
    const ctx = await browser.newContext({ viewport, ...(device === 'phone' ? { isMobile: true, hasTouch: true } : {}) });
    await ctx.addInitScript(() => { try { sessionStorage.setItem('sqc_space_chosen', '1'); } catch {} });
    const p = await ctx.newPage();
    p.on('dialog', (d) => d.dismiss());
    await p.goto(base + 'index.html', { waitUntil: 'domcontentloaded', timeout: 90000 });
    await p.waitForSelector('#gate-list .gate', { timeout: 30000 });
    /* the door's cards animate in; a DOM click skips Playwright's stability wait (the door listens on the lists) */
    const tap = (sel) => p.waitForSelector(sel, { timeout: 15000 }).then(() => p.evaluate((s) => document.querySelector(s).click(), sel));
    await tap('#gate-list .gate[data-gate="accounting"]'); await tap('#sector-list .sector[data-sector="meat"]'); await tap('#co-list .co[data-id="demo-co"]');
    await p.waitForURL(/\/app-safe(\.html)?([?#]|$)/, { timeout: 30000 }); await ready(p); await p.waitForTimeout(1500);
    const views = await p.evaluate(() => SK.caps.visible().map((c) => ({ id: c.id, label: c.label, group: c.group, gateway: c.gateway || '', also: c.also || [], hub: c.hub || '', hubLabel: c.hubLabel || '' })));
    for (const v of views) {
      await p.evaluate((id) => SKosifCore.go(id), v.id).catch(() => {});
      await p.waitForTimeout(1100);
      const m = await p.evaluate(MEASURE).catch((e) => ({ error: e.message }));
      report.push({ device, ...v, ...m });
    }
    await ctx.close();
  }
} finally { await browser.close(); }
fs.writeFileSync(path.join(out, 'clutter.json'), JSON.stringify(report, null, 1));
const d = report.filter((r) => r.device === 'desktop' && !r.error);
/* the ratchet (like tools/identity_audit.mjs): tools/fixtures/clutter-baseline.json holds the last accepted numbers and none may
   get worse (--check exits 1 on a regression); --write-baseline records the current numbers after a deliberate improvement */
{
  const phones = report.filter((r) => r.device === 'phone' && !r.error);
  const mean = (xs, k) => Math.round(xs.reduce((a, r) => a + (r[k] || 0), 0) / xs.length);
  const now = { avgContentTopDesktop: mean(d, 'contentTop'), maxContentTopDesktop: Math.max(...d.map((r) => r.contentTop || 0)), avgContentTopPhone: mean(phones, 'contentTop'),
    avgChromeRowsDesktop: Math.round(d.reduce((a, r) => a + r.rows.length, 0) / d.length * 100) / 100, avgChromeControlsDesktop: mean(d, 'chromeControls'), screensRepeatingSidebar: d.filter((r) => r.navRepeatedInPage.length).length };
  const file = new URL('fixtures/clutter-baseline.json', import.meta.url);
  const base = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null;
  /* pixel metrics carry an 8 px tolerance: the baseline may be recorded on another machine (Windows Edge vs the CI's Linux
     Chromium render fonts a few pixels apart); counts and row averages carry none */
  const tol = (k) => (/ContentTop/.test(k) ? 8 : 0);
  const worse = base ? Object.keys(now).filter((k) => now[k] > base[k] + tol(k)) : [];
  console.log('ratchet:', Object.entries(now).map(([k, v]) => `${k} ${v}${base ? ' (was ' + base[k] + ')' : ''}`).join(' · '));
  if (process.argv.includes('--write-baseline') || !base) fs.writeFileSync(file, JSON.stringify({ ...now, recordedAt: new Date().toISOString().slice(0, 10) }, null, 1) + '\n');
  if (process.argv.includes('--check') && worse.length) { console.error('clutter regression: ' + worse.join(', ')); process.exitCode = 1; }
}
const avg = (k) => Math.round(d.reduce((a, r) => a + (r[k] || 0), 0) / d.length);
console.log(`screens: ${d.length} · avg contentTop ${avg('contentTop')}px · avg chrome ${avg('chrome')}px (${avg('chromeControls')} controls) · avg page controls ${avg('controls')} · avg words ${avg('words')} · avg tab strips ${avg('tabStrips')}`);
console.log('rows above content (how often):', Object.entries(d.flatMap((r) => r.rows.map((x) => x.name)).reduce((a, n) => (a[n] = (a[n] || 0) + 1, a), {})).map(([k, v]) => k + ' ' + v).join(' · '));
console.log('\nmost chrome before content (desktop):');
for (const r of [...d].sort((a, b) => b.contentTop - a.contentTop).slice(0, 12)) console.log(`- ${r.id} (${r.label}): content starts at ${r.contentTop}px — ${r.rows.map((x) => x.name + ' ' + x.height + 'px/' + x.controls).join(', ')}`);
console.log('\nmost controls on one screen (desktop):');
for (const r of [...d].sort((a, b) => b.controls - a.controls).slice(0, 12)) console.log(`- ${r.id} (${r.label}): ${r.controls} controls · ${r.tabStrips} tab strips (${r.tabs} tabs) · ${r.words} words · ${r.headings} headings · scroll ${r.scrollHeight}px`);
console.log('\nsidebar labels repeated inside the page:');
for (const r of d.filter((r) => r.navRepeatedInPage.length).slice(0, 15)) console.log(`- ${r.id}: ${r.navRepeatedInPage.join(' · ')}`);
const ph = report.filter((r) => r.device === 'phone' && !r.error);
console.log(`\nphone: avg contentTop ${Math.round(ph.reduce((a, r) => a + (r.contentTop || 0), 0) / ph.length)}px of a ${ph[0] && ph[0].viewport}px viewport; screens whose content starts below the fold: ${ph.filter((r) => r.contentTop > r.viewport).map((r) => r.id).join(', ') || 'none'}`);
