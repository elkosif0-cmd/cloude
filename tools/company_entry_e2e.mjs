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
const overflow = (page) => page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - document.documentElement.clientWidth);
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
    /* the crystal world: mounted after the page painted, animating, sized to the viewport; or absent without WebGL */
    await page.waitForFunction(() => window.SQCEntry && (SQCEntry.world() || !window.SQCCrystal || document.readyState === 'complete'), null, { timeout: 20000 }).catch(() => {});
    await page.waitForTimeout(600);
    const world = await page.evaluate(async () => { const w = SQCEntry.world(); if (!w) return { mounted: false, gl: !!document.createElement('canvas').getContext('webgl') }; /* two one-second windows, the better one counts: a shared CI runner draws with software GL and hiccups */ let fps = 0; for (let i = 0; i < 2; i++) { const f0 = w.frames(); await new Promise((r) => setTimeout(r, 1000)); fps = Math.max(fps, w.frames() - f0); } const c = document.getElementById('sqc-world'); return { mounted: true, fps, shards: w.shards(), still: w.still(), w: c.width, h: c.height, vw: innerWidth, vh: innerHeight, on: c.classList.contains('on') }; });
    if (world.mounted) {
      /* 20 fps on a real GPU; a CI runner has no GPU and only proves the world keeps animating */
      const minFps = process.env.CI ? 12 : 20;
      check(`${tag}: the crystal world animates (≥ ${minFps} fps)`, world.fps >= minFps, JSON.stringify(world));
      check(`${tag}: the world canvas is sized to the viewport`, world.w >= world.vw && world.h >= world.vh && world.on && !world.still, JSON.stringify(world));
    } else check(`${tag}: no WebGL here, the gallery still works without the world`, !world.gl, JSON.stringify(world));

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
    /* the command center carries the world behind the company's name; leaving the screen frees it */
    await page.evaluate(() => SKosifCore.go('dash'));
    await page.waitForFunction(() => document.querySelector('.skc-world-c.on'), null, { timeout: 20000 }).catch(() => {});
    const hero = await page.evaluate(() => ({ canvas: !!document.querySelector('.skc-world-c'), on: !!document.querySelector('.skc-world-c.on'), name: (document.querySelector('.skc-world-tx b') || {}).textContent }));
    check(`${tag}: the command center hero shows the world and the company`, hero.canvas && hero.name === 'شركة الوادي التجريبية للحوم' && (hero.on || !(await page.evaluate(() => !!document.createElement('canvas').getContext('webgl')))), JSON.stringify(hero));
    /* the motion layer: opening a screen choreographs its blocks (and never scrolls sideways) */
    await page.evaluate(() => SKosifCore.go('customers'));
    await page.waitForTimeout(120);
    const motion = await page.evaluate(() => { const v = document.getElementById('view'); const first = v && v.querySelector(':scope > *:not(.skdemo):not(.sqc-space-bar)'); return { entering: !!v && v.classList.contains('sk-enter'), anim: first ? getComputedStyle(first).animationName : 'none', count: window.SK.motion ? SK.motion.count() : -1 }; });
    check(`${tag}: a new screen enters with the choreography`, motion.entering && motion.anim === 'sk-view-in' && motion.count >= 1, JSON.stringify(motion));
    await page.waitForTimeout(1000);
    check(`${tag}: the choreography marks are cleaned up`, await page.evaluate(() => !document.getElementById('view').classList.contains('sk-enter')));
    check(`${tag}: no horizontal overflow after the screen entered`, (await overflow(page)) <= 2, String(await overflow(page)));
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
    /* the app drops ?go= from the address once it has opened the screen, so the query may already be gone */
    await page.waitForURL(/app-safe\.html/, { timeout: 30000 });
    await settled(page);
    await page.waitForFunction(() => SKosifCore.view() === 'tbreview', null, { timeout: 30000 }).catch(() => {});
    check(`${tag}: a shortcut resumes the last company on its screen`, await page.evaluate(() => SKosifSpace.current().id === 'demo-co' && SKosifCore.view() === 'tbreview'), await page.evaluate(() => SKosifSpace.current().id + ' ' + SKosifCore.view()));
    /* 6. the private company never takes over another company's data: on a device that never held it, opening it
          (simulated here: a preview build has no password page) starts its own empty space */
    await page.evaluate(() => { sessionStorage.setItem('sqc_company_intent', JSON.stringify({ id: 'co-private', name: 'تصيف', locked: true })); });
    await page.goto(base + 'app-safe.html');
    await page.waitForFunction(() => window.SKosifSpace && SKosifSpace.current().id === 'space-private', null, { timeout: 60000 }).catch(() => {});
    await settled(page);
    const priv = await page.evaluate(async () => ({ id: SKosifSpace.current().id, bound: localStorage.getItem('sqc_private_space'), demo: SK.demo.active(), customers: ((r) => r.empty ? 0 : r.customers.length)(await SKosifSalesIntel.snapshot('all')), name: SK.company.current().name, inMenu: SK.company.list().filter((c) => c.id === 'demo-co').length }));
    check(`${tag}: the private company gets its own empty space, never the demo data`, priv.id === 'space-private' && priv.bound === 'space-private' && priv.demo === false && priv.customers === 0 && priv.name === 'تصيف', JSON.stringify(priv));
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
    if (tag === 'laptop') {
      /* reduced motion: one still frame, no animation loop */
      const rc = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
      const rp = await rc.newPage();
      await rp.goto(base + 'index.html');
      await rp.waitForFunction(() => window.SQCEntry && (SQCEntry.world() || document.readyState === 'complete'), null, { timeout: 20000 }).catch(() => {});
      await rp.waitForTimeout(500);
      const still = await rp.evaluate(async () => { const w = SQCEntry.world(); if (!w) return { mounted: false }; const f0 = w.frames(); await new Promise((r) => setTimeout(r, 800)); return { mounted: true, still: w.still(), extra: w.frames() - f0, drew: w.frames() >= 1 }; });
      if (still.mounted) check('reduced motion: the world draws one still frame and does not animate', still.still && still.drew && still.extra <= 1, JSON.stringify(still));
      /* reduced motion inside the app: no screen choreography */
      await rp.evaluate(() => { sessionStorage.setItem('sqc_company_intent', JSON.stringify({ id: 'demo-co', name: 'شركة الوادي التجريبية للحوم', demo: true })); sessionStorage.setItem('sqc_space_chosen', '1'); sessionStorage.setItem('sqc_helper_user_chosen', '1'); });
      await rp.goto(base + 'app-safe.html');
      await rp.waitForFunction(() => window.SK && SK.motion && window.SKosifCore && SK.demo && SK.demo.settled(), null, { timeout: 90000 }).catch(() => {});
      await rp.evaluate(() => SKosifCore.go('customers'));
      await rp.waitForTimeout(150);
      check('reduced motion: screens open without the choreography', await rp.evaluate(() => SK.motion.reduced() && SK.motion.count() === 0 && !document.getElementById('view').classList.contains('sk-enter')));
      await rc.close();
    }
  }
} finally { await browser.close(); }
if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log(`Company front door: ${checks} checks OK`);
