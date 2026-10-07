// Page-by-page review: every screen of the registry opened in a real browser, on a desktop and a phone, in the demo
// company (which fills every section with data) — and, for the books, each sector's model company. For each screen it
// records the page errors and console errors it raised, broken values shown to the user (undefined, NaN, null,
// [object Object], Infinity), horizontal overflow, an empty view, how long it took, and a screenshot.
//   node tools/page_review.mjs https://s-kosif.pages.dev/ [out-dir]
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const base = (process.argv[2] || 'http://127.0.0.1:8765/').replace(/[?#].*$/, '').replace(/(index|app-safe)(\.html)?$/, '').replace(/\/?$/, '/');
const out = process.argv[3] || 'page-review';
fs.mkdirSync(out, { recursive: true });
const ready = (p) => p.waitForFunction(() => window.SK && window.SKosifCore && window.SKosifSpace && SK.demo && SK.demo.settled() && !document.querySelector('.skdemo-overlay') && !SKosifSpace.busy() && window.SKosifLedger, null, { timeout: 120000 });
const BAD = /(^|[\s:،(])(undefined|NaN|null|\[object Object\]|Infinity)([\s.،)]|$)/m;

const browser = await chromium.launch();
const report = [];
try {
  for (const [device, viewport] of [['desktop', { width: 1400, height: 900 }], ['phone', { width: 390, height: 844 }]]) {
    const ctx = await browser.newContext({ viewport, ...(device === 'phone' ? { isMobile: true, hasTouch: true } : {}) });
    await ctx.addInitScript(() => { try { sessionStorage.setItem('sqc_space_chosen', '1'); } catch {} });
    const p = await ctx.newPage();
    let pageErrors = [], consoleErrors = [];
    p.on('pageerror', (e) => pageErrors.push(String(e.message || e).slice(0, 200)));
    p.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 200)); });
    p.on('dialog', (d) => d.dismiss());
    const enter = async (sector, id) => { await p.goto(base + 'index.html', { waitUntil: 'domcontentloaded', timeout: 90000 }); await p.waitForSelector('#gate-list .gate', { timeout: 30000 });
      await p.click('#gate-list .gate[data-gate="accounting"]'); await p.click('#sector-list .sector[data-sector="' + sector + '"]');
      await p.waitForSelector('#co-list .co[data-id="' + id + '"]', { timeout: 15000 }); await p.click('#co-list .co[data-id="' + id + '"]');
      await p.waitForURL(/\/app-safe(\.html)?([?#]|$)/, { timeout: 30000 }); await ready(p); await p.waitForTimeout(1500); };
    await enter('meat', 'demo-co');
    const views = await p.evaluate(() => SK.caps.visible().map((c) => ({ id: c.id, label: c.label, gateway: c.gateway || '' })));
    const look = async (row, shot) => {
      const r = await p.evaluate((BADsrc) => {
        const BAD = new RegExp(BADsrc, 'm'), root = document.querySelector('main') || document.querySelector('[role="main"]') || document.body;
        const text = root.innerText || '', lines = text.split('\n').filter((l) => BAD.test(l)).slice(0, 4);
        return { chars: text.trim().length, bad: lines, overflowX: document.documentElement.scrollWidth - window.innerWidth, title: document.title };
      }, BAD.source);
      Object.assign(row, r, { pageErrors: pageErrors.splice(0), consoleErrors: consoleErrors.splice(0).filter((t) => !/favicon|fonts\.g|ERR_BLOCKED_BY_CLIENT/.test(t)) });
      if (shot) await p.screenshot({ path: path.join(out, device + '-' + shot + '.jpg'), type: 'jpeg', quality: 55 }).catch(() => {});
      report.push(row);
    };
    pageErrors = []; consoleErrors = [];
    for (const v of views) {
      const t0 = Date.now();
      await p.evaluate((id) => SKosifCore.go(id), v.id).catch((e) => pageErrors.push('go: ' + e.message));
      await p.waitForTimeout(1200);
      await look({ device, company: 'demo-co', view: v.id, label: v.label, gateway: v.gateway, ms: Date.now() - t0 }, v.id);
    }
    /* the books of each sector, in its model company: the sector's own tabs and the shared ones */
    if (device === 'desktop') for (const [sector, id] of [['health', 'model-health'], ['education', 'model-education'], ['manufacturing', 'model-manufacturing'], ['bakery', 'model-bakery'], ['agriculture', 'model-agriculture'], ['trade', 'model-trade']]) {
      await enter(sector, id); await p.waitForFunction(() => SKosifLedger.entries().length > 0, null, { timeout: 60000 }).catch(() => {});
      const tabs = await p.evaluate(() => { SKosifLedger.open('close'); return null; }).then(() => p.waitForTimeout(1500)).then(() => p.evaluate(() => [...document.querySelectorAll('[data-sk-tabs="ledger"] [data-tab]')].map((t) => t.dataset.tab)));
      for (const tab of tabs) {
        const t0 = Date.now();
        await p.evaluate((t) => SKosifLedger.open(t), tab); await p.waitForTimeout(1300);
        await look({ device, company: id, view: 'ledger:' + tab, label: tab, gateway: 'accounting', ms: Date.now() - t0 }, id + '-' + tab);
      }
    }
    await ctx.close();
  }
} finally { await browser.close(); }

const issues = report.filter((r) => r.pageErrors.length || r.consoleErrors.length || r.bad.length || r.overflowX > 2 || r.chars < 40);
fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 1));
console.log('screens reviewed: ' + report.length + ' (' + new Set(report.map((r) => r.view)).size + ' distinct), with issues: ' + issues.length);
for (const r of issues) console.log('- [' + r.device + '] ' + r.company + ' › ' + r.view + ' (' + r.label + '): ' + [r.pageErrors.length && 'pageerror ' + r.pageErrors.join(' | '),
  r.consoleErrors.length && 'console ' + r.consoleErrors.slice(0, 2).join(' | '), r.bad.length && 'shows ' + JSON.stringify(r.bad), r.overflowX > 2 && 'overflows by ' + r.overflowX + 'px', r.chars < 40 && 'nearly empty (' + r.chars + ' chars)'].filter(Boolean).join(' ; '));
