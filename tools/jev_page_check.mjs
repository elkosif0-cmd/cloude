// SQC — the public Jev decision page (jev-api/worker.js), checked without Cloudflare:
//   1. every <script> embedded in the HTML the worker serves compiles (node --check cannot see inside the template);
//   2. no response of the worker — pages, health, errors, a bridge failure that echoes its URL — ever contains the
//      bridge credential (a fake token stands in for it);
//   3. in a browser, on a phone and a laptop: GET /jev renders with no page error and no sideways scrolling, the
//      tabs switch, and POST /api/public-jev answers each decision type (yes/no, choice, score) end to end through a
//      stubbed bridge, and the result is drawn.
// Usage: node tools/jev_page_check.mjs
import { createRequire } from 'module';
import http from 'node:http';
import vm from 'node:vm';
const { chromium } = createRequire(import.meta.url)('playwright');
const worker = (await import('../jev-api/worker.js')).default;

const FAKE = 'FAKE-BRIDGE-TOKEN-7f3c9a1e5b2d4c6e8a0f';
const failures = [], passed = [];
const ok = (name, cond, extra = '') => { (cond ? passed : failures).push(`${cond ? '✓' : '✗'} ${name}${extra ? ' — ' + extra : ''}`); };
const watchdog = setTimeout(() => { console.error('jev page check: timed out'); process.exit(2); }, 5 * 60 * 1000);

/* the bridge, stubbed: a structured decision per tool, or a failure that names its own URL (as a real one might) */
let bridgeMode = 'ok';
const env = {
  SESSION_SECRET: 'test-session-secret', JEV_BRIDGE_TOKEN: FAKE,
  JEV_BRIDGE: { fetch: async (req) => {
    if (bridgeMode === 'fail') throw new Error('upstream failed for ' + req.url);
    const rpc = await req.json(), tool = rpc.params.name;
    const decision = tool.includes('choice') ? { type: 'choice', choice: 'B', probabilities: { A: 0.2, B: 0.7, C: 0.1 }, confidence: 0.8 }
      : tool.includes('score') ? { type: 'score', score: 3.2, probabilities: { 1: 0.05, 2: 0.15, 3: 0.4, 4: 0.4 }, legend: { 1: 'ضعيف', 2: 'مقبول', 3: 'جيد', 4: 'ممتاز' }, confidence: 0.7 }
        : { type: 'noul', noul: 0.73 };
    return new Response(JSON.stringify({ jsonrpc: '2.0', id: rpc.id, result: { structuredContent: { answers: { decision }, model: 'jev-test' } } }), { headers: { 'content-type': 'application/json' } });
  } },
};
const call = async (path, init = {}) => { const r = await worker.fetch(new Request('https://jev.test' + path, init), env); return { status: r.status, text: await r.text(), headers: r.headers }; };

/* 1. the embedded scripts compile */
const page = await call('/jev');
const scripts = [...page.text.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
ok('GET /jev serves the page', page.status === 200 && /text\/html/.test(page.headers.get('content-type')) && scripts.length >= 1, page.status + ' · ' + scripts.length + ' script(s)');
for (const [i, src] of scripts.entries()) { try { new vm.Script(src, { filename: 'PUBLIC_PAGE-script-' + i + '.js' }); ok('embedded script ' + i + ' compiles', true); } catch (e) { ok('embedded script ' + i + ' compiles', false, e.message); } }

/* 2. no response carries the credential */
const probes = [['GET /', await call('/')], ['GET /public', await call('/public')], ['GET /health', await call('/health')], ['GET /api/public-jev', await call('/api/public-jev')], ['GET /nope', await call('/nope')]];
bridgeMode = 'fail';
probes.push(['POST /api/public-jev (bridge failing)', await call('/api/public-jev', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ type: 'noul', instructions: 'هل نعتمد؟', state: 'x' }) })]);
bridgeMode = 'ok';
for (const [name, r] of probes) ok(name + ' never contains the bridge credential or its path', !r.text.includes(FAKE) && !/\/mcp\/(?!\[redacted\])/.test(r.text), 'status ' + r.status);

/* 3. the page in a browser, served by the worker itself */
const server = http.createServer(async (req, res) => {
  const chunks = []; for await (const c of req) chunks.push(c);
  const body = chunks.length ? Buffer.concat(chunks) : undefined;
  const r = await worker.fetch(new Request('http://127.0.0.1' + req.url, { method: req.method, headers: req.headers, body: req.method === 'GET' ? undefined : body }), env);
  res.writeHead(r.status, Object.fromEntries(r.headers)); res.end(Buffer.from(await r.arrayBuffer()));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = 'http://127.0.0.1:' + server.address().port;
const browser = await chromium.launch();
for (const [tag, opts] of [['phone', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }], ['laptop', { viewport: { width: 1366, height: 900 } }]]) {
  const ctx = await browser.newContext(opts); ctx.setDefaultTimeout(10000);
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(base + '/jev'); await p.waitForTimeout(400);
  const over = await p.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - document.documentElement.clientWidth);
  ok(tag + ': GET /jev renders with no page error and no sideways scrolling', !errs.length && over <= 2, errs.slice(0, 2).join(' | ') + ' over=' + over);
  const ask = async (type, text) => {
    await p.click(`.tab[data-type="${type}"]`); await p.fill('#q', text); await p.click('#go');
    await p.waitForFunction(() => document.querySelector('#status').textContent !== 'جارٍ التحليل', null, { timeout: 8000 });
    return p.evaluate(() => ({ status: document.querySelector('#status').textContent, html: document.querySelector('#result').innerText, err: getComputedStyle(document.querySelector('#err')).display !== 'none' ? document.querySelector('#err').textContent : '' }));
  };
  const yn = await ask('noul', 'هل نعتمد المورد الجديد؟');
  ok(tag + ': yes/no decision end to end', yn.status === 'تم' && /73%/.test(yn.html) && /نعم/.test(yn.html) && !yn.err, JSON.stringify(yn).slice(0, 160));
  const ch = await ask('choice', 'أي عرض نختار؟');
  ok(tag + ': choice decision end to end (labels from the page)', ch.status === 'تم' && /الخيار الثاني/.test(ch.html) && /70%/.test(ch.html) && !ch.err, JSON.stringify(ch).slice(0, 160));
  const sc = await ask('score', 'قيّم جودة التوريد');
  ok(tag + ': score decision end to end', sc.status === 'تم' && /3\.20/.test(sc.html) && /جيد|ممتاز/.test(sc.html) && !sc.err, JSON.stringify(sc).slice(0, 160));
  ok(tag + ': tabs switch the fields', await p.evaluate(() => !document.querySelector('#scoreFields').hidden && document.querySelector('#choiceFields').hidden && document.querySelectorAll('.tab.active').length === 1));
  ok(tag + ': no page errors during the flows', !errs.length, errs.slice(0, 2).join(' | '));
  await ctx.close();
}
await browser.close(); server.close(); clearTimeout(watchdog);
console.log(passed.concat(failures).join('\n'));
if (failures.length) { console.error(`jev page check: ${failures.length} failure(s)`); process.exit(1); }
console.log(`jev page check: ${passed.length} checks OK`);
