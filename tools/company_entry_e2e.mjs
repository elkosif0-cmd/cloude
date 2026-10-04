// Browser acceptance for the company-first front door on a preview build (demo data only, no private company):
// the gallery lists the demo company; opening it boots the app on that company without any chooser; a new company
// starts empty and separate; going back shows both; reopening the demo company restores its data; a shortcut link
// resumes the last company and lands on its screen. Laptop and phone.
// usage: node tools/company_entry_e2e.mjs http://localhost:8765/
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const base = (process.argv[2] || 'http://localhost:8765/').replace(/[?#].*$/, '').replace(/index\.html$/, '').replace(/\/?$/, '/');
const browser = await chromium.launch();
const failures = []; let checks = 0;
const check = (name, ok, info = '') => { checks++; if (!ok) failures.push(name + (info ? ' — ' + info : '')); };
const appReady = (page) => page.waitForFunction(() => window.SK && window.SKosifCore && window.SKosifSpace && SK.demo && SK.demo.settled() && !document.querySelector('.skdemo-overlay') && !SKosifSpace.busy(), null, { timeout: 90000 });
const settled = async (page) => { await appReady(page); await page.waitForTimeout(800); await appReady(page); };
try {
  for (const [tag, opts] of [['laptop', { viewport: { width: 1440, height: 900 } }], ['phone', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }]]) {
    const ctx = await browser.newContext(opts);
    const page = await ctx.newPage(); const errs = [];
    page.on('pageerror', (e) => errs.push('page: ' + e.message));
    page.on('console', (m) => { if (m.type() === 'error' && !/ERR_|net::|Failed to load resource|favicon/.test(m.text())) errs.push('console: ' + m.text().slice(0, 200)); });
    page.on('dialog', (d) => d.dismiss());

    /* 1. the gallery on a blank device */
    await page.goto(base + 'index.html');
    await page.waitForSelector('#co-list .co', { timeout: 30000 });
    check(`${tag}: gallery lists the demo company and no locked card`, await page.evaluate(() => { const c = [...document.querySelectorAll('#co-list .co')]; return c.some((b) => b.dataset.id === 'demo-co') && !c.some((b) => b.dataset.locked) && !document.getElementById('f'); }));
    check(`${tag}: gallery has no horizontal overflow`, await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth <= 2));

    /* 2. open the demo company: the app boots on it, with no chooser dialog */
    await page.click('#co-list .co[data-id="demo-co"]');
    await page.waitForURL(/app-safe\.html/, { timeout: 30000 });
    await settled(page);
    const demoState = await page.evaluate(async () => ({ id: SKosifSpace.current().id, chooser: !!document.querySelector('#sqc-space,#sqc-user-space'), demo: SK.demo.active(), last: JSON.parse(localStorage.getItem('sqc_last_company') || 'null'), intent: sessionStorage.getItem('sqc_company_intent') }));
    check(`${tag}: the demo company is the open space`, demoState.id === 'demo-co', demoState.id);
    check(`${tag}: no chooser dialog after the front door`, !demoState.chooser);
    check(`${tag}: the demo company carries demo data`, demoState.demo === true);
    check(`${tag}: the last company is remembered`, demoState.last && demoState.last.id === 'demo-co' && demoState.last.locked === false, JSON.stringify(demoState.last));
    check(`${tag}: the intent is consumed`, demoState.intent === null);
    await page.evaluate(() => SKosifCore.go('customers'));
    await page.waitForTimeout(600);
    check(`${tag}: the helper screens name the company and link back to the front door`, await page.evaluate(() => { const b = document.querySelector('.sqc-space-bar'); return !!b && b.textContent.includes('شركة الوادي التجريبية للحوم') && !!b.querySelector('[data-space-door][href="./"]'); }));
    const demoCustomers = await page.evaluate(async () => ((r) => r.empty ? 0 : r.customers.length)(await SKosifSalesIntel.snapshot('all')));
    check(`${tag}: demo customers exist`, demoCustomers > 0, String(demoCustomers));

    /* 3. a new company starts empty, on its own */
    await page.goto(base + 'index.html');
    await page.waitForSelector('#co-add', { timeout: 30000 });
    await page.click('#co-add');
    await page.fill('#co-name', 'مؤسسة الاختبار للحوم');
    await page.click('#co-form button[type="submit"]');
    await page.waitForURL(/app-safe\.html/, { timeout: 30000 });
    await settled(page);
    const fresh = await page.evaluate(async () => ({ name: SKosifSpace.current().name, demo: SK.demo.active(), customers: ((r) => r.empty ? 0 : r.customers.length)(await SKosifSalesIntel.snapshot('all')), books: (JSON.parse(localStorage.getItem('skosif_companies_v1') || '{}').companies || []).some((c) => c.name === 'مؤسسة الاختبار للحوم'), chooser: !!document.querySelector('#sqc-space,#sqc-user-space') }));
    check(`${tag}: the new company is open by name`, fresh.name === 'مؤسسة الاختبار للحوم', fresh.name);
    check(`${tag}: the new company is empty, not demo-filled`, fresh.demo === false && fresh.customers === 0, JSON.stringify(fresh));
    check(`${tag}: the new company is registered for the books`, fresh.books === true);
    check(`${tag}: no chooser dialog for the new company`, !fresh.chooser);

    /* 4. back at the door both companies are listed; the demo company comes back with its data */
    await page.goto(base + 'index.html');
    await page.waitForSelector('#co-list .co', { timeout: 30000 });
    const listed = await page.evaluate(() => [...document.querySelectorAll('#co-list .co')].map((b) => [b.dataset.name, b.getAttribute('aria-current') === 'true']));
    check(`${tag}: both companies are listed and the new one is marked last`, listed.some(([n, l]) => n === 'مؤسسة الاختبار للحوم' && l) && listed.some(([n]) => n === 'شركة الوادي التجريبية للحوم'), JSON.stringify(listed));
    await page.click('#co-list .co[data-id="demo-co"]');
    await page.waitForURL(/app-safe\.html/, { timeout: 30000 });
    await settled(page);
    const again = await page.evaluate(async () => ({ id: SKosifSpace.current().id, demo: SK.demo.active(), customers: ((r) => r.empty ? 0 : r.customers.length)(await SKosifSalesIntel.snapshot('all')) }));
    check(`${tag}: the demo company's data is restored on return`, again.id === 'demo-co' && again.demo === true && again.customers === demoCustomers, JSON.stringify(again));

    /* 5. a shortcut link resumes the last company and opens its screen */
    await page.goto(base + 'index.html?go=tbreview');
    await page.waitForURL(/app-safe\.html\?go=tbreview/, { timeout: 30000 });
    await settled(page);
    await page.waitForFunction(() => SKosifCore.view() === 'tbreview', null, { timeout: 30000 }).catch(() => {});
    check(`${tag}: a shortcut resumes the last company on its screen`, await page.evaluate(() => SKosifSpace.current().id === 'demo-co' && SKosifCore.view() === 'tbreview'), await page.evaluate(() => SKosifSpace.current().id + ' ' + SKosifCore.view()));
    check(`${tag}: no page or console errors`, errs.length === 0, errs.slice(0, 3).join(' | '));
    await ctx.close();
  }
} finally { await browser.close(); }
if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log(`Company front door: ${checks} checks OK`);
