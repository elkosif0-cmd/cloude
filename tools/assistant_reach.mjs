// The assistant reaches every capability: asking it to open a screen by its Arabic name, its hub's name or its id
// lands on that screen (hidden sub-screens land on the hub that hosts them), in both sections, with no page error.
// It also lists every visible hub, and refuses a name that matches nothing instead of opening a wrong screen.
// usage: node tools/assistant_reach.mjs http://localhost:8765/app-safe.html
import { createRequire } from 'module';
const require = createRequire(import.meta.url), { chromium } = require('playwright');
const URL_ = process.argv[2] || 'http://localhost:8765/app-safe.html';
const watchdog = setTimeout(() => { console.error('[assistant-reach] HARD TIMEOUT'); process.exit(2); }, 600000);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1280, height: 850 } });
const p = await ctx.newPage(), errs = [];
p.on('pageerror', (e) => errs.push(e.message.slice(0, 120)));
const ready = () => p.waitForFunction(() => window.SKosifAssistant && window.SKosifCore && window.SK?.caps && window.SKosifSpace?.current?.()?.id === 'demo-co' && window.SK?.demo?.settled?.() && !window.SKosifSpace?.busy?.() && !document.querySelector('.skdemo-overlay'), { timeout: 90000 });
// Start from the real three-step front door. A sessionStorage flag is NOT company
// admission and must not bypass the current company's owner/selection guard.
const doorURL = new URL(URL_);
doorURL.pathname = doorURL.pathname.replace(/\\/app-safe(?:\\.html)?$/, '/index.html');
await p.goto(doorURL.href);
await p.locator('#gate-list .gate[data-gate="accounting"]').click();
await p.locator('#sector-list .sector[data-sector="meat"]').click();
await p.locator('#co-list .co[data-id="demo-co"]').click();
await p.waitForURL(/\\/app-safe(?:\\.html)?(?:[?#]|$)/, { timeout: 30000 });
await ready();
await p.waitForTimeout(800); await ready();
const caps = await p.evaluate(() => SK.caps.all().map((c) => ({ id: c.id, group: c.group, label: c.label, hubLabel: c.hubLabel, hub: c.hub || null })));
const fails = [];
let n = 0;
for (const c of caps) for (const [how, q] of [['label', c.label], ['hub name', c.hubLabel], ['id', c.id]]) {
  if (!q) continue;
  const land = (x) => [x.id, x.hub].filter(Boolean); // a sub-screen opens as itself or inside the hub that hosts it
  const expect = how === 'hub name' ? caps.filter((x) => x.hubLabel === q).flatMap(land) : land(c);
  let x;
  try {
    x = await p.evaluate(async (q) => { SKosifCore.go('home'); await new Promise((r) => setTimeout(r, 60));
      const res = await SKosifAssistant.run('go_to_screen', { screen: q }); await new Promise((r) => setTimeout(r, 150));
      return { ok: res.ok, text: res.text, view: SKosifCore.view() }; }, q);
  } catch (e) { x = { ok: false, text: 'page navigated away: ' + e.message.slice(0, 60), view: '?' }; await p.waitForLoadState('load').catch(() => {}); await ready(); }
  n++;
  if (!x.ok || !expect.includes(x.view)) fails.push(`${c.group}/${c.id} by ${how} «${q}» → ${x.view} (expected ${expect.join('|')}) ${x.ok ? '' : x.text}`);
}
const listed = await p.evaluate(async () => (await SKosifAssistant.run('list_screens', {})).text);
const hubs = await p.evaluate(() => SK.caps.all().filter((c) => c.isHub && !c.hidden).map((c) => c.hubLabel));
const missing = hubs.filter((h) => !listed.includes(h));
const unknown = await p.evaluate(async () => { SKosifCore.go('home'); const r = await SKosifAssistant.run('go_to_screen', { screen: 'زززز غير موجودة' }); return { ok: r.ok, view: SKosifCore.view() }; });
await b.close(); clearTimeout(watchdog);
const groups = [...new Set(caps.map((c) => c.group))];
console.log(`assistant reached ${n - fails.length}/${n} requests across ${caps.length} capabilities in ${groups.length} sections (${groups.join(', ')})`);
if (missing.length) fails.push('list_screens omits: ' + missing.join('، '));
if (unknown.ok || unknown.view !== 'home') fails.push('an unknown screen name was not refused');
if (errs.length) fails.push('page errors: ' + errs.slice(0, 3).join(' | '));
fails.forEach((f) => console.log('✗ ' + f));
console.log(fails.length ? `\n${fails.length} assistant reach problem(s)` : '\nThe assistant reaches every capability.');
process.exit(fails.length ? 1 : 0);
