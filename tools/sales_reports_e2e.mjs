// Browser acceptance for Sales Intelligence across screens, demo company data only, laptop and phone:
// the hub's «حتى تاريخ» day drives the hub and the lab and resets; each KPI explains itself on keyboard focus; the
// executive reports' churn radar lists the hub engine's follow-up customers with the same counts; no errors, no
// horizontal overflow.
// usage: node tools/sales_reports_e2e.mjs http://localhost:8765/app-safe.html
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const url = process.argv[2] || 'http://localhost:8765/app-safe.html';
const browser = await chromium.launch();
const failures = []; let checks = 0;
const check = (name, ok, info = '') => { checks++; if (!ok) failures.push(name + (info ? ' — ' + info : '')); };
const overflow = (page) => page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - document.documentElement.clientWidth);
try {
  for (const [tag, opts] of [['laptop', { viewport: { width: 1440, height: 900 } }], ['phone', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }]]) {
    const ctx = await browser.newContext(opts);
    await ctx.addInitScript(() => { try { sessionStorage.setItem('sqc_space_chosen', '1'); sessionStorage.setItem('sqc_helper_user_chosen', '1'); } catch {} });
    const page = await ctx.newPage(); const errs = [];
    page.on('pageerror', (e) => errs.push('page: ' + e.message));
    page.on('console', (m) => { if (m.type() === 'error' && !/ERR_|net::|Failed to load resource|favicon/.test(m.text())) errs.push('console: ' + m.text().slice(0, 200)); });
    page.on('dialog', (d) => d.dismiss());
    await page.goto(url);
    await page.waitForFunction(() => window.SK && window.SK.demo && window.SKosifCore && window.SKosifSalesIntel, null, { timeout: 60000 });
    for (let i = 0; i < 120; i++) { if (await page.evaluate(async () => (await SK.demo.status()).filter((x) => x.demo).length >= 10)) break; await page.waitForTimeout(500); }

    /* the hub: as-of day */
    await page.evaluate(() => SKosifCore.go('salesintel'));
    await page.waitForSelector('[data-si-host] .si-kpi', { timeout: 30000 });
    const base = await page.evaluate(() => SKosifSalesIntel.result().period.to);
    const input = page.locator('[data-si-asof]');
    check(`${tag}: «حتى تاريخ» shows the last sale`, (await input.inputValue()) === base, await input.inputValue());
    check(`${tag}: «حتى تاريخ» cannot pass the last sale`, (await input.getAttribute('max')) === base);
    const past = await page.evaluate((d) => SKEngines.sales.salesInsights.dayAdd(d, -30), base);
    await input.fill(past);
    await page.waitForFunction((p) => SKosifSalesIntel.result() && SKosifSalesIntel.result().period.to === p, past, { timeout: 15000 }).catch(() => {});
    check(`${tag}: the hub analyses up to the chosen day`, await page.evaluate(() => SKosifSalesIntel.result().period.to) === past);
    check(`${tag}: the range line names the chosen day`, (await page.locator('.si-range').innerText()).includes(past));
    const labDay = await page.evaluate(async () => { const l = window.SKosifSalesLab && await SKosifSalesLab.lab(); return l && l.scope ? l.scope.asOf : null; });
    check(`${tag}: the lab below follows the same day`, labDay === past, String(labDay));
    check(`${tag}: a reset button appears`, (await page.locator('[data-si-asof-reset]').count()) === 1);
    await page.locator('[data-si-asof-reset]').click();
    await page.waitForFunction((t) => SKosifSalesIntel.result().period.to === t, base, { timeout: 15000 }).catch(() => {});
    check(`${tag}: reset returns to the last sale`, (await page.evaluate(() => SKosifSalesIntel.result().period.to)) === base && (await page.locator('[data-si-asof-reset]').count()) === 0);
    check(`${tag}: hub has no horizontal overflow`, (await overflow(page)) <= 2, String(await overflow(page)));

    /* the hub: every KPI explains itself to keyboard and screen-reader users */
    await page.locator('.si-kpi').first().focus();
    const how = await page.evaluate(() => { const k = document.activeElement, h = k && k.querySelector('.si-how'); return h ? getComputedStyle(h).visibility : 'none'; });
    check(`${tag}: a focused KPI shows how it is computed`, how === 'visible', how);
    check(`${tag}: every KPI has an accessible description`, await page.evaluate(() => [...document.querySelectorAll('.si-kpi')].every((k) => { const d = document.getElementById(k.getAttribute('aria-describedby') || ''); return d && d.textContent.trim().length > 10; })));

    /* the executive reports: churn radar on the hub engine */
    await page.evaluate(() => SKosifCore.go('execreports'));
    await page.waitForSelector('.sk-rep-nav button[data-t="churn"]', { timeout: 20000 });
    await page.click('.sk-rep-nav button[data-t="churn"]');
    await page.waitForSelector('#sk-rep-body table.sk-churn', { timeout: 20000 });
    const eng = await page.evaluate(async () => { const r = await SKosifSalesIntel.snapshot('90'); return { names: r.followup.slice(0, 40).map((c) => c.name || 'بدون اسم'), late: r.followup.filter((c) => c.status === 'overdue').length, all: r.followup.length }; });
    const shown = await page.evaluate(() => [...document.querySelectorAll('#sk-rep-body table.sk-churn tbody tr')].map((tr) => (tr.querySelector('td b') || {}).textContent));
    const n = Math.min(10, eng.names.length);
    check(`${tag}: churn rows are the engine's follow-up order`, n > 0 && JSON.stringify(shown.slice(0, n)) === JSON.stringify(eng.names.slice(0, n)), JSON.stringify(shown.slice(0, 3)) + ' vs ' + JSON.stringify(eng.names.slice(0, 3)));
    const kpi = await page.locator('#sk-rep-body .sk-kpi.bad b').first().innerText();
    check(`${tag}: overdue count matches the engine`, Number(kpi.replace(/\D/g, '')) === eng.late, kpi + ' vs ' + eng.late);
    check(`${tag}: reports have no horizontal overflow`, (await overflow(page)) <= 2, String(await overflow(page)));
    check(`${tag}: no page or console errors`, errs.length === 0, errs.slice(0, 3).join(' | '));
    await ctx.close();
  }
} finally { await browser.close(); }
if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log(`Sales across screens: ${checks} checks OK`);
