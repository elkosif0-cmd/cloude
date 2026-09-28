/* Access control of the KOSIF Think MCP Worker (think-mcp/worker.js). The Worker runs here as it runs on Cloudflare:
   a Request goes in, a Response comes out. The paid upstreams are stubbed — Clean APIs (global fetch) and Workers AI
   (env.AI) — and every call to them is counted, so each test can prove that a refused request spent nothing. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import worker from './worker.js';

const UPSTREAM_KEY = 'test-cleanapis-value-that-must-never-leak';
const HOST = 'https://kosif-think-mcp.example.workers.dev';
let seq = 0;
const newToken = () => `tok-${++seq}-${'x'.repeat(40)}`; /* a fresh caller per test: rate windows never cross tests */
const newIp = () => `203.0.113.${++seq % 250}`;

const calls = { fetch: 0, ai: 0 };
let upstream = () => Response.json({ choices: [{ message: { content: JSON.stringify({ answer: 'ok', confidence: 0.8, recommendationId: null }) } }] });
globalThis.fetch = async (url, init) => { calls.fetch++; assert.equal(String(url), 'https://cleanapis.com/v1/chat/completions'); return upstream(url, init); };

function env(extra = {}) {
  return {
    KOSIF_THINK_TOKEN: extra.token ?? newToken(),
    cleanapis: UPSTREAM_KEY,
    AI: { run: async () => { calls.ai++; return { response: JSON.stringify({ answer: 'fast', confidence: 0.7 }) }; } },
    ...extra,
  };
}
function req(path, { method = 'POST', token, body, headers = {}, ip } = {}) {
  const h = { 'content-type': 'application/json', 'cf-connecting-ip': ip || newIp(), ...headers };
  if (token) h.authorization = `Bearer ${token}`;
  return new Request(HOST + path, { method, headers: h, body: body === undefined ? (method === 'POST' ? JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }) : undefined) : body });
}
const call = (name, args) => JSON.stringify({ jsonrpc: '2.0', id: 7, method: 'tools/call', params: { name, arguments: args } });
const agentCall = call('kosif_agent', { agent: 'claude', question: 'Is the going-concern basis appropriate?' });
async function spent(fn) { const f = calls.fetch, a = calls.ai; const r = await fn(); return { r, fetch: calls.fetch - f, ai: calls.ai - a }; }
const noLeak = async (res) => { const t = await res.clone().text(); assert.ok(!t.includes(UPSTREAM_KEY), 'the Clean APIs key never appears in a response'); return t; };

test('no Authorization: 401, and no model is called', async () => {
  const e = env();
  const { r, fetch, ai } = await spent(() => worker.fetch(req('/mcp', { body: agentCall }), e));
  assert.equal(r.status, 401);
  assert.match(r.headers.get('www-authenticate'), /^Bearer realm="kosif-think"$/);
  assert.deepEqual(await r.json(), { error: 'unauthorized' });
  assert.equal(fetch + ai, 0);
});

test('a wrong token, a token of another length and a non-Bearer scheme are all refused', async () => {
  const e = env();
  for (const authorization of [`Bearer ${e.KOSIF_THINK_TOKEN.slice(0, -1)}X`, `Bearer ${e.KOSIF_THINK_TOKEN}extra`, 'Bearer short', `Basic ${e.KOSIF_THINK_TOKEN}`, e.KOSIF_THINK_TOKEN]) {
    const { r, fetch } = await spent(() => worker.fetch(req('/mcp', { body: agentCall, headers: { authorization } }), e));
    assert.equal(r.status, 401, authorization.slice(0, 12));
    assert.equal(fetch, 0);
  }
});

test('fails closed: no token configured, or one shorter than 32 characters, answers 503 whatever is sent', async () => {
  for (const token of ['', 'short-token-under-32-chars']) {
    const e = env({ token });
    const { r, fetch, ai } = await spent(() => worker.fetch(req('/mcp', { token: token || 'anything-at-all-anything-at-all-anything', body: agentCall }), e));
    assert.equal(r.status, 503, `token length ${token.length}`);
    assert.deepEqual(await r.json(), { error: 'service_unavailable' });
    assert.equal(fetch + ai, 0);
  }
});

test('the right token: tools/list, then kosif_agent reaches Clean APIs with the Worker secret, which is never returned', async () => {
  const e = env();
  const list = await worker.fetch(req('/mcp', { token: e.KOSIF_THINK_TOKEN }), e);
  assert.equal(list.status, 200);
  assert.deepEqual((await list.json()).result.tools.map((t) => t.name), ['kosif_agent', 'kosif_council', 'kosif_think', 'kosif_route', 'kosif_think_status']);
  let sentAuth = null;
  upstream = (url, init) => { sentAuth = init.headers.authorization; return Response.json({ choices: [{ message: { content: '{"answer":"basis appropriate","confidence":0.9}' } }] }); };
  const { r, fetch } = await spent(() => worker.fetch(req('/mcp', { token: e.KOSIF_THINK_TOKEN, body: agentCall }), e));
  assert.equal(r.status, 200);
  assert.equal(fetch, 1);
  assert.equal(sentAuth, `Bearer ${UPSTREAM_KEY}`, 'the key goes only to Clean APIs');
  const body = JSON.parse(await noLeak(r));
  assert.equal(body.result.structuredContent.artifact.answer, 'basis appropriate');
});

test('an upstream error text is not passed back: only the Worker error code', async () => {
  const e = env();
  upstream = () => Response.json({ error: { message: `insufficient balance for key ${UPSTREAM_KEY} at account acct-123` } }, { status: 402 });
  const r = await worker.fetch(req('/mcp', { token: e.KOSIF_THINK_TOKEN, body: agentCall }), e);
  const t = await noLeak(r);
  assert.ok(!t.includes('acct-123') && !t.includes('insufficient'), t);
  assert.equal(JSON.parse(t).result.structuredContent.error, 'CLEANAPIS_402');
  upstream = () => { throw new TypeError(`connect ECONNREFUSED 10.0.0.1 ${UPSTREAM_KEY}`); };
  const n = await worker.fetch(req('/mcp', { token: e.KOSIF_THINK_TOKEN, body: agentCall }), e);
  assert.equal(JSON.parse(await noLeak(n)).result.structuredContent.error, 'CLEANAPIS_NETWORK');
});

test('the path token is off by default and works only when THINK_ALLOW_PATH_TOKEN is "true"', async () => {
  const e = env();
  const off = await worker.fetch(req(`/mcp/${e.KOSIF_THINK_TOKEN}`), e);
  assert.equal(off.status, 404);
  const on = env({ THINK_ALLOW_PATH_TOKEN: 'true' });
  assert.equal((await worker.fetch(req(`/mcp/${on.KOSIF_THINK_TOKEN}`), on)).status, 200);
  assert.equal((await worker.fetch(req(`/mcp/${on.KOSIF_THINK_TOKEN}x`), on)).status, 401);
});

test('HTTP methods: /mcp takes POST (and a CORS preflight) only; /health takes GET and HEAD only', async () => {
  const e = env();
  for (const method of ['GET', 'PUT', 'DELETE', 'PATCH']) {
    const r = await worker.fetch(req('/mcp', { method, token: e.KOSIF_THINK_TOKEN, body: method === 'GET' ? undefined : '{}' }), e);
    assert.equal(r.status, 405, method);
    assert.equal(r.headers.get('allow'), 'POST, OPTIONS');
  }
  assert.equal((await worker.fetch(req('/health', { method: 'POST', body: '{}' }), e)).status, 405);
  assert.equal((await worker.fetch(req('/health', { method: 'HEAD' }), e)).status, 200);
  assert.equal((await worker.fetch(req('/anything-else', { method: 'GET' }), e)).status, 404);
});

test('public /health says nothing about configuration or models', async () => {
  const r = await worker.fetch(req('/health', { method: 'GET' }), env());
  assert.deepEqual(Object.keys(await r.json()).sort(), ['ok', 'service', 'version']);
  assert.equal(r.headers.get('cache-control'), 'no-store');
  assert.equal(r.headers.get('x-content-type-options'), 'nosniff');
});

test('CORS: no browser origin is allowed by default; an allow-listed origin gets its own origin back, never "*"', async () => {
  const e = env();
  const evil = await worker.fetch(req('/mcp', { token: e.KOSIF_THINK_TOKEN, headers: { origin: 'https://evil.example' } }), e);
  assert.equal(evil.status, 403, 'a valid token from a foreign page is still refused');
  assert.equal(evil.headers.get('access-control-allow-origin'), null);
  const pre = await worker.fetch(req('/mcp', { method: 'OPTIONS', headers: { origin: 'https://evil.example' } }), e);
  assert.equal(pre.status, 403);
  const ok = env({ THINK_ALLOWED_ORIGINS: 'https://s-kosif.pages.dev, https://other.example' });
  const pf = await worker.fetch(req('/mcp', { method: 'OPTIONS', headers: { origin: 'https://s-kosif.pages.dev' } }), ok);
  assert.equal(pf.status, 204);
  assert.equal(pf.headers.get('access-control-allow-origin'), 'https://s-kosif.pages.dev');
  assert.equal(pf.headers.get('access-control-allow-methods'), 'POST');
  assert.match(pf.headers.get('access-control-allow-headers'), /authorization/);
  assert.equal(pf.headers.get('vary'), 'Origin');
  const post = await worker.fetch(req('/mcp', { token: ok.KOSIF_THINK_TOKEN, headers: { origin: 'https://s-kosif.pages.dev' } }), ok);
  assert.equal(post.status, 200);
  assert.equal(post.headers.get('access-control-allow-origin'), 'https://s-kosif.pages.dev');
  const unauth = await worker.fetch(req('/mcp', { headers: { origin: 'https://s-kosif.pages.dev' } }), ok);
  assert.equal(unauth.status, 401, 'an allowed origin still needs the token');
});

test('request body: JSON only, capped by Content-Length and by the bytes actually sent', async () => {
  const e = env({ THINK_MAX_BODY_BYTES: '2048' });
  const big = call('kosif_agent', { agent: 'gpt', question: 'q'.repeat(5000) });
  const byHeader = await spent(() => worker.fetch(req('/mcp', { token: e.KOSIF_THINK_TOKEN, body: big }), e));
  assert.equal(byHeader.r.status, 413);
  assert.equal(byHeader.fetch, 0);
  /* no Content-Length: the body arrives as a stream and is cut off while it is read */
  const stream = new ReadableStream({ start(c) { for (let i = 0; i < 8; i++) c.enqueue(new TextEncoder().encode('x'.repeat(1024))); c.close(); } });
  const chunked = new Request(HOST + '/mcp', { method: 'POST', body: stream, duplex: 'half', headers: { 'content-type': 'application/json', authorization: `Bearer ${e.KOSIF_THINK_TOKEN}` } });
  assert.equal((await worker.fetch(chunked, e)).status, 413);
  const wrongType = await worker.fetch(req('/mcp', { token: e.KOSIF_THINK_TOKEN, headers: { 'content-type': 'text/plain' } }), e);
  assert.equal(wrongType.status, 415);
});

test('JSON-RPC shape: a batch array or a message without a method is an Invalid Request', async () => {
  const e = env();
  for (const body of ['[{"jsonrpc":"2.0","id":1,"method":"tools/list"}]', '{"jsonrpc":"2.0","id":1}', 'null', '"x"']) {
    const r = await worker.fetch(req('/mcp', { token: e.KOSIF_THINK_TOKEN, body }), e);
    assert.equal((await r.json()).error.code, -32600, body);
  }
  const bad = await worker.fetch(req('/mcp', { token: e.KOSIF_THINK_TOKEN, body: '{not json' }), e);
  assert.equal((await bad.json()).error.code, -32700);
});

test('per-caller request limit (local window): the request past THINK_RPM gets 429 with Retry-After', async () => {
  const e = env({ THINK_RPM: '3' });
  for (let i = 0; i < 3; i++) assert.equal((await worker.fetch(req('/mcp', { token: e.KOSIF_THINK_TOKEN }), e)).status, 200);
  const over = await worker.fetch(req('/mcp', { token: e.KOSIF_THINK_TOKEN }), e);
  assert.equal(over.status, 429);
  assert.equal(over.headers.get('retry-after'), '60');
});

test('model-running tools have their own, tighter limit; listing tools and the deterministic council are not charged to it', async () => {
  const e = env({ THINK_MODEL_RPM: '2' });
  for (let i = 0; i < 2; i++) assert.equal((await worker.fetch(req('/mcp', { token: e.KOSIF_THINK_TOKEN, body: agentCall }), e)).status, 200);
  const { r, fetch } = await spent(() => worker.fetch(req('/mcp', { token: e.KOSIF_THINK_TOKEN, body: call('kosif_think', { question: 'q' }) }), e));
  assert.equal(r.status, 429, 'kosif_think runs Workers AI and counts too');
  assert.equal(fetch, 0);
  assert.equal((await worker.fetch(req('/mcp', { token: e.KOSIF_THINK_TOKEN }), e)).status, 200);
  const council = call('kosif_council', { question: 'q', artifacts: [{ agentId: 'gpt', answer: 'a', confidence: 0.9 }] });
  assert.equal((await worker.fetch(req('/mcp', { token: e.KOSIF_THINK_TOKEN, body: council }), e)).status, 200);
});

test('rate-limit bindings are used when bound; a binding that throws falls back to the local window, never open', async () => {
  const seen = [];
  const deny = env({ THINK_RATE_LIMITER: { limit: async ({ key }) => { seen.push(key); return { success: false }; } } });
  const r = await worker.fetch(req('/mcp', { token: deny.KOSIF_THINK_TOKEN }), deny);
  assert.equal(r.status, 429);
  assert.match(seen[0], /^caller:[0-9a-f]{24}$/, 'the limit key is a hash, not the token');
  assert.ok(!seen[0].includes(deny.KOSIF_THINK_TOKEN));
  const broken = env({ THINK_RPM: '1', THINK_RATE_LIMITER: { limit: async () => { throw new Error('binding down'); } } });
  assert.equal((await worker.fetch(req('/mcp', { token: broken.KOSIF_THINK_TOKEN }), broken)).status, 200);
  assert.equal((await worker.fetch(req('/mcp', { token: broken.KOSIF_THINK_TOKEN }), broken)).status, 429);
});

test('failed sign-ins: after THINK_AUTH_FAILS_PER_MIN failures from one IP, that IP gets 429 before any token check', async () => {
  const e = env({ THINK_AUTH_FAILS_PER_MIN: '3' });
  const ip = '198.51.100.77';
  for (let i = 0; i < 3; i++) assert.equal((await worker.fetch(req('/mcp', { token: `wrong-${i}-${'y'.repeat(40)}`, ip }), e)).status, 401);
  assert.equal((await worker.fetch(req('/mcp', { token: e.KOSIF_THINK_TOKEN, ip }), e)).status, 429);
  assert.equal((await worker.fetch(req('/mcp', { token: e.KOSIF_THINK_TOKEN, ip: '198.51.100.78' }), e)).status, 200, 'other IPs are unaffected');
});

test('THINK_FRONTIER_ENABLED "false" stops Clean APIs calls without a code change', async () => {
  const e = env({ THINK_FRONTIER_ENABLED: 'false' });
  const { r, fetch } = await spent(() => worker.fetch(req('/mcp', { token: e.KOSIF_THINK_TOKEN, body: agentCall }), e));
  assert.equal(fetch, 0);
  assert.equal((await r.json()).result.structuredContent.error, 'FRONTIER_DISABLED');
});

test('kosif_think_status (authenticated) reports how access is configured, never a value', async () => {
  const e = env({ THINK_RATE_LIMITER: { limit: async () => ({ success: true }) }, THINK_ALLOWED_ORIGINS: 'https://s-kosif.pages.dev' });
  const r = await worker.fetch(req('/mcp', { token: e.KOSIF_THINK_TOKEN, body: call('kosif_think_status', {}) }), e);
  const t = await noLeak(r);
  assert.ok(!t.includes(e.KOSIF_THINK_TOKEN));
  const access = JSON.parse(t).result.structuredContent.access;
  assert.deepEqual({ ...access, limits: undefined }, { auth: 'bearer', pathToken: false, frontierEnabled: true, rateLimiter: true, modelLimiter: false, limits: undefined, browserOrigins: 1 });
});


test('kosif_route is deterministic, host-mediated, and spends no model calls', async () => {
  const e = env();
  const body = call('kosif_route', {
    task: 'راجع واجهة التطبيق واكتشف أخطاء الكود ثم جهّز النشر',
    availableTools: [
      { name: 'GitHub', connected: true, costClass: 'existing_plan' },
      { name: 'Figma', connected: true, costClass: 'existing_plan' },
      { name: 'PostHog', connected: true, costClass: 'existing_plan' },
      { name: 'Cloudflare', connected: true, costClass: 'existing_plan' },
      { name: 'Runway', connected: true, costClass: 'credits' }
    ]
  });
  const { r, fetch, ai } = await spent(() => worker.fetch(req('/mcp', { token: e.KOSIF_THINK_TOKEN, body }), e));
  assert.equal(fetch + ai, 0, 'routing itself never runs a model or paid upstream');
  const out = (await r.json()).result.structuredContent;
  assert.equal(out.mode, 'host-mediated');
  assert.equal(out.directPluginCalls, false);
  const names = out.useNow.map(x => x.name);
  assert.ok(names.includes('GitHub'));
  assert.ok(names.includes('Figma'));
  assert.ok(names.includes('Cloudflare'));
  assert.equal(out.hostContract.truthfulness.includes('Never claim'), true);
});

test('kosif_route enforces the user cost policy: free/included/current-plan auto, credits or unknown require approval', async () => {
  const e = env();
  const args = {
    task: 'أنشئ صورة احترافية وإعلان بصري ثم حرّك الصورة كفيديو',
    availableTools: [
      { name: 'Adobe Express', connected: true, costClass: 'free' },
      { name: 'Runway', connected: true, costClass: 'credits' },
      { name: 'OpenArt', connected: true, costClass: 'unknown' },
      { name: 'Higgsfield', connected: true, costClass: 'unknown' },
      { name: 'Canva', connected: true, costClass: 'mixed' }
    ],
    maxTools: 10
  };
  let r = await worker.fetch(req('/mcp', { token: e.KOSIF_THINK_TOKEN, body: call('kosif_route', args) }), e);
  let out = (await r.json()).result.structuredContent;
  assert.ok(out.useNow.some(x => x.name === 'Adobe Express'));
  for (const name of ['Runway', 'OpenArt', 'Higgsfield', 'Canva'])
    assert.ok(out.needsApproval.some(x => x.name === name), name + ' is gated');
  r = await worker.fetch(req('/mcp', { token: e.KOSIF_THINK_TOKEN, body: call('kosif_route', { ...args, approvedTools: ['Runway'] }) }), e);
  out = (await r.json()).result.structuredContent;
  assert.ok(out.useNow.some(x => x.name === 'Runway' && x.approved === true));
  assert.ok(!out.needsApproval.some(x => x.name === 'Runway'));
});

test('kosif_route never assumes a plugin is connected when the host did not provide availability', async () => {
  const e = env();
  const r = await worker.fetch(req('/mcp', { token: e.KOSIF_THINK_TOKEN, body: call('kosif_route', { task: 'ابحث في القانون واللوائح عن هذا الموضوع' }) }), e);
  const out = (await r.json()).result.structuredContent;
  assert.equal(out.useNow.length, 0);
  assert.ok(out.needsAvailabilityCheck.some(x => x.name === 'Legal Data Hunter'));
  assert.ok(out.hostContract.route.includes('currently connected'));
});


test('kosif_route can route future connected tools that are not hardcoded in the catalog', async () => {
  const e = env();
  const r = await worker.fetch(req('/mcp', {
    token: e.KOSIF_THINK_TOKEN,
    body: call('kosif_route', {
      task: 'راجع الواجهة والخطوط واكتشف مشاكل الكود',
      availableTools: [
        {
          name: 'Future UI Inspector',
          connected: true,
          costClass: 'included',
          description: 'Responsive UI, typography and accessibility checker',
          lanes: ['design', 'dev']
        }
      ]
    })
  }), e);
  const out = (await r.json()).result.structuredContent;
  assert.ok(out.useNow.some(x => x.name === 'Future UI Inspector'));
});

test('kosif_think_status exposes host routing and cost guardrails without claiming direct plugin access', async () => {
  const e = env();
  const r = await worker.fetch(req('/mcp', { token: e.KOSIF_THINK_TOKEN, body: call('kosif_think_status', {}) }), e);
  const out = (await r.json()).result.structuredContent;
  assert.equal(out.version, '0.5.0');
  assert.equal(out.hostToolRouting.mode, 'host-mediated');
  assert.equal(out.hostToolRouting.directPluginCalls, false);
  assert.equal(out.hostToolRouting.routeTool, 'kosif_route');
  assert.equal(out.hostToolRouting.dynamicToolsSupported, true);
  assert.ok(out.hostToolRouting.catalogSize >= 30);
  assert.deepEqual(out.hostToolRouting.autoCostClasses.sort(), ['existing_plan','free','included']);
  assert.ok(out.hostToolRouting.approvalRequired.includes('credits'));
});

test('the source carries no credential and every response path sets the security headers', () => {
  const src = readFileSync(new URL('./worker.js', import.meta.url), 'utf8');
  assert.ok(!/sk-[A-Za-z0-9_-]{16,}|Bearer [A-Za-z0-9_-]{20,}/.test(src), 'no key or bearer literal in the source');
  assert.ok(!/new Response\(/.test(src.replace(/function (json|empty)\([^)]*\)\{ return new Response\(/g, '')), 'responses are built only by json() and empty(), which add the security headers');
});
