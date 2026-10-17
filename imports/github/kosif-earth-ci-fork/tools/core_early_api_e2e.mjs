// SQC — the core's public API is safe before the core has finished booting (regression test).
// window.SKosifCore is published when the core script runs, but the pricing model is computed later, in bootApp().
// A screen that asked for SKosifCore.stats() in between (the command centre's first render on a slow first start)
// threw «Cannot read properties of null (reading 'B')». This calls stats(), catalog() and raws() the instant the API
// appears, on a first start and on a later start, and checks the app then boots with no page error.
// Usage: node tools/core_early_api_e2e.mjs [url]
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright'); /* resolved through NODE_PATH in CI, like ui_smoke */

const URL_ = (process.argv[2] || 'http://localhost:8765/app-safe.html').replace(/[?#].*$/, '');
const failures = [], passed = [];
const ok = (name, cond, extra = '') => { const l = `${cond ? '✓' : '✗'} ${name}${extra ? ' — ' + extra : ''}`; (cond ? passed : failures).push(l); console.log(l); };
const browser = await chromium.launch(process.env.SQC_INSECURE ? { args: ['--ignore-certificate-errors'] } : {});
const ctx = await browser.newContext();
await ctx.addInitScript(() => {
  let v; Object.defineProperty(window, 'SKosifCore', { configurable: true, get: () => v, set: (x) => { v = x;
    const out = {}; for (const k of ['stats', 'catalog', 'raws']) { try { x[k](); out[k] = 'ok'; } catch (e) { out[k] = e.message; } }
    try { sessionStorage.setItem('early_api', JSON.stringify(out)); } catch { /* private mode */ } } });
});
const p = await ctx.newPage();
const errs = []; p.on('pageerror', (e) => errs.push(e.message));
for (const start of ['first start', 'later start']) {
  await p.goto(URL_, { waitUntil: 'load' });
  /* the first start fills the sample data and reloads; wait until the demo reports itself settled on a booted page, and
     if a reload still lands in between, wait for the new page and ask again */
  const booted = () => p.waitForFunction(() => window.SKosifCore && document.querySelector('.topbar') && !document.querySelector('.skdemo-overlay') && (!window.SK || !SK.demo || SK.demo.settled()), undefined, { timeout: 90000 });
  const settled = async (fn) => { for (let i = 0; i < 4; i++) { await booted(); await p.waitForTimeout(i ? 1500 : 2500); try { return await p.evaluate(fn); } catch (e) { if (i === 3 || !/SKosifCore|Execution context|navigation/.test(String(e.message))) throw e; } } };
  const r = await settled(() => JSON.parse(sessionStorage.getItem('early_api') || '{}'));
  ok(`${start}: stats(), catalog() and raws() answer before the core has booted`, ['stats', 'catalog', 'raws'].every((k) => r[k] === 'ok'), JSON.stringify(r));
  ok(`${start}: the core then boots and its stats are real`, await settled(() => SKosifCore.stats().boxes >= 0 && typeof SKosifCore.stats().target === 'number'));
}
ok('no page errors', !errs.length, [...new Set(errs)].slice(0, 3).join(' | '));
await browser.close();
if (failures.length) { console.error(`core early-API E2E: ${passed.length} passed, ${failures.length} failed`); process.exit(1); }
console.log(`core early-API E2E: ${passed.length} passed, 0 failed`);
