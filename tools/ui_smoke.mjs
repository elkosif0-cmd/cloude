// UI smoke test for CI: a fresh device fills itself with the demo company, then every screen in the
// capability registry is opened on a laptop and a phone viewport. Fails on any page error, a console
// error from the app, a horizontal overflow, or a screen that renders nothing.
// usage: node tools/ui_smoke.mjs http://localhost:8765/app-safe.html
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const url = process.argv[2] || 'http://localhost:8765/app-safe.html';
const caps = JSON.parse(fs.readFileSync(new URL('../ui/core/capabilities.json', import.meta.url), 'utf8')).capabilities;
const browser = await chromium.launch();
const failures = [];
for (const [tag, opts] of [['laptop', { viewport: { width: 1440, height: 900 } }], ['phone', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }]]) {
  const page = await (await browser.newContext(opts)).newPage();
  let errs = [];
  page.on('pageerror', (e) => errs.push('page: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/ERR_|net::|Failed to load resource|favicon/.test(m.text())) errs.push('console: ' + m.text().slice(0, 200)); });
  page.on('dialog', (d) => d.dismiss());
  await page.goto(url);
  await page.waitForTimeout(6000);
  await page.waitForLoadState('load');
  await page.waitForTimeout(2500);
  const demo = await page.evaluate(async () => (await SK.demo.status()).filter((x) => x.demo).length);
  if (demo < 10) failures.push(`${tag}: demo data filled only ${demo} sections`);
  for (const c of caps) {
    errs = [];
    await page.evaluate((id) => SKosifCore.go(id), c.id);
    await page.waitForTimeout(500);
    const r = await page.evaluate(() => ({ len: document.querySelector('#view').innerText.length, over: document.documentElement.scrollWidth - innerWidth }));
    if (errs.length) failures.push(`${tag} ${c.id}: ${errs[0]}`);
    if (r.over > 2) failures.push(`${tag} ${c.id}: horizontal overflow ${r.over}px`);
    if (r.len < 40) failures.push(`${tag} ${c.id}: nothing rendered`);
  }
}
await browser.close();
if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log(`UI smoke: ${caps.length} screens × 2 viewports OK`);
