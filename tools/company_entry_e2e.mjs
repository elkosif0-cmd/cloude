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
    /* one company everywhere: the rail, the top bar and the books name the open company */
    const names = async () => page.evaluate(() => ({ space: SKosifSpace.current().name, company: SK.company.current().name, rail: (document.getElementById('biz-name') || {}).textContent, top: (document.querySelector('#sk-tb-co b') || {}).textContent, books: (JSON.parse(localStorage.getItem('skosif_companies_v1') || '{}').active || {}).companyId, id: SKosifSpace.current().id }));
    await page.evaluate(() => SKosifCore.go('dash'));
    await page.waitForFunction(() => SK.company && SK.company.ready(), null, { timeout: 30000 });
    await page.waitForTimeout(500);
    const n1 = await names();
    check(`${tag}: rail, top bar and books all name the open company`, n1.rail === 'شركة الوادي التجريبية للحوم' && n1.top === n1.rail && n1.company === n1.rail && n1.books === n1.id, JSON.stringify(n1));
    await page.evaluate(() => SK.company.rename('شركة الوادي — اسم معدل'));
    await page.waitForTimeout(800);
    const n2 = await names();
    check(`${tag}: renaming the company renames it in the rail, the top bar and the spaces`, n2.rail === 'شركة الوادي — اسم معدل' && n2.top === n2.rail && n2.space === n2.rail, JSON.stringify(n2));
    await page.evaluate(() => SK.company.rename('شركة الوادي التجريبية للحوم'));
    await page.waitForTimeout(500);
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
    await page.waitForFunction(() => SK.company && SK.company.ready(), null, { timeout: 30000 });
    await page.waitForTimeout(500);
    const n3 = await page.evaluate(() => ({ rail: (document.getElementById('biz-name') || {}).textContent, top: (document.querySelector('#sk-tb-co b') || {}).textContent }));
    check(`${tag}: the new company's name is in the rail and the top bar`, n3.rail === 'مؤسسة الاختبار للحوم' && n3.top === n3.rail, JSON.stringify(n3));
    /* switching from the top bar's company menu switches the data, not only a label */
    await page.evaluate(() => SKosifCore.go('dash'));
    await page.waitForTimeout(500);
    await page.click('#sk-tb-co');
    await page.waitForSelector('.sk-menu [data-m="co"][data-id="demo-co"]', { timeout: 10000 });
    await page.click('.sk-menu [data-m="co"][data-id="demo-co"]');
    await page.waitForFunction(() => window.SKosifSpace && SKosifSpace.current().id === 'demo-co', null, { timeout: 60000 }).catch(() => {});
    await settled(page);
    const viaTop = await page.evaluate(async () => ({ id: SKosifSpace.current().id, rail: (document.getElementById('biz-name') || {}).textContent, customers: ((r) => r.empty ? 0 : r.customers.length)(await SKosifSalesIntel.snapshot('all')) }));
    check(`${tag}: the top bar's company menu opens the demo company with its data`, viaTop.id === 'demo-co' && viaTop.rail === 'شركة الوادي التجريبية للحوم' && viaTop.customers === demoCustomers, JSON.stringify(viaTop));

    /* 4. back at the door both companies are listed; the demo company comes back with its data */
    await page.goto(base + 'index.html');
    await page.waitForSelector('#co-list .co', { timeout: 30000 });
    const listed = await page.evaluate(() => [...document.querySelectorAll('#co-list .co')].map((b) => [b.dataset.name, b.getAttribute('aria-current') === 'true']));
    check(`${tag}: both companies are listed, the last one opened is marked, and no empty phantom company`, listed.some(([n]) => n === 'مؤسسة الاختبار للحوم') && listed.some(([n, l]) => n === 'شركة الوادي التجريبية للحوم' && l) && !listed.some(([n]) => n === 'الشركة الحالية'), JSON.stringify(listed));
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
    /* 6. the private company never takes over another company's data: on a device that never held it, opening it
          (simulated here: a preview build has no password page) starts its own empty space */
    await page.evaluate(() => { sessionStorage.setItem('sqc_company_intent', JSON.stringify({ id: 'co-private', name: 'قصيف', locked: true })); });
    await page.goto(base + 'app-safe.html');
    await page.waitForFunction(() => window.SKosifSpace && SKosifSpace.current().id === 'space-private', null, { timeout: 60000 }).catch(() => {});
    await settled(page);
    const priv = await page.evaluate(async () => ({ id: SKosifSpace.current().id, bound: localStorage.getItem('sqc_private_space'), demo: SK.demo.active(), customers: ((r) => r.empty ? 0 : r.customers.length)(await SKosifSalesIntel.snapshot('all')), name: SK.company.current().name, inMenu: SK.company.list().filter((c) => c.id === 'demo-co').length }));
    check(`${tag}: the private company gets its own empty space, never the demo data`, priv.id === 'space-private' && priv.bound === 'space-private' && priv.demo === false && priv.customers === 0 && priv.name === 'قصيف', JSON.stringify(priv));
    await page.goto(base + 'index.html');
    await page.waitForSelector('#co-list .co', { timeout: 30000 });
    check(`${tag}: the private space is not an open card in the gallery`, await page.evaluate(() => ![...document.querySelectorAll('#co-list .co')].some((b) => b.dataset.id === 'space-private')));
    await page.click('#co-list .co[data-id="demo-co"]');
    await page.waitForURL(/app-safe\.html/, { timeout: 30000 });
    await settled(page);
    const back = await page.evaluate(async () => ({ id: SKosifSpace.current().id, customers: ((r) => r.empty ? 0 : r.customers.length)(await SKosifSalesIntel.snapshot('all')), privInList: SK.company.list().some((c) => c.id === 'space-private' && !c.locked) }));
    check(`${tag}: the demo company keeps its data and the private one stays locked in the switcher`, back.id === 'demo-co' && back.customers === demoCustomers && !back.privInList, JSON.stringify(back));
    check(`${tag}: no page or console errors`, errs.length === 0, errs.slice(0, 3).join(' | '));
    await ctx.close();
  }
} finally { await browser.close(); }
if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log(`Company front door: ${checks} checks OK`);
