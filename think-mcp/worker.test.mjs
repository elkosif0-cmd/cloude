/* Access control and tool catalog of the KOSIF Think MCP Worker (think-mcp/worker.js). The Worker runs here as it
   runs on Cloudflare: a Request goes in, a Response comes out. Every paid or stateful binding is stubbed and counted —
   Workers AI (env.AI), Full Pro state (KV), the Full Pro queue, the Secure Executor and the Jev service — so each test
   can prove that a refused request spent and touched nothing. Auth0 is replaced by a local RSA key served as the JWKS. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import worker from './worker.js';

const HOST = 'https://kosif-think-mcp.example.workers.dev';
const ISSUER = 'https://dev-zn5bwigg38b13ui8.us.auth0.com/';
const AUDIENCE = 'https://kosif-think-mcp.kosif199022.workers.dev';
const JWKS_URL = ISSUER + '.well-known/jwks.json';
const LEGACY = 'legacy-bearer-value-that-must-never-leak-0123456789';

let seq = 0;
const newIp = () => { seq++; return `10.${(seq >> 16) & 255}.${(seq >> 8) & 255}.${seq & 255}`; }; /* a fresh caller per request: rate windows never cross tests */

/* ---- a local stand-in for the Auth0 tenant ---- */
const b64u = (bytes) => Buffer.from(bytes).toString('base64url');
const rsa = { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' };
const tenantKey = await crypto.subtle.generateKey(rsa, true, ['sign', 'verify']);
const strangerKey = await crypto.subtle.generateKey(rsa, true, ['sign', 'verify']);
const jwk = { ...(await crypto.subtle.exportKey('jwk', tenantKey.publicKey)), kid: 'test-kid', alg: 'RS256', use: 'sig' };
async function jwt(claims = {}, key = tenantKey.privateKey) {
  const now = Math.floor(Date.now() / 1000);
  const head = b64u(JSON.stringify({ alg: 'RS256', kid: 'test-kid', typ: 'JWT' }));
  const body = b64u(JSON.stringify({ iss: ISSUER, aud: [AUDIENCE, ISSUER + 'userinfo'], sub: 'auth0|owner', iat: now, exp: now + 600, ...claims }));
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(head + '.' + body));
  return head + '.' + body + '.' + b64u(new Uint8Array(sig));
}

const calls = { ai: 0, kvGet: 0, kvPut: 0, queue: 0, secure: 0, jev: 0, otherFetch: 0 };
globalThis.fetch = async (url) => {
  if (String(url) === JWKS_URL) return Response.json({ keys: [jwk] });
  calls.otherFetch++;
  throw new Error('unexpected network call to ' + url);
};
let aiReply = () => ({ response: JSON.stringify({ answer: 'fast answer', confidence: 0.7, evidence: ['e'] }) });

function env(extra = {}) {
  const kv = new Map();
  return {
    AI: { run: async (model, input) => { calls.ai++; return aiReply(model, input); } },
    FULL_PRO_STATE: {
      get: async (k) => { calls.kvGet++; return kv.has(k) ? JSON.parse(kv.get(k)) : null; },
      put: async (k, v) => { calls.kvPut++; kv.set(k, v); },
    },
    FULL_PRO_QUEUE: { send: async () => { calls.queue++; } },
    SECURE_EXECUTOR: { fetch: async () => { calls.secure++; return Response.json({ ok: true, status: 'IDLE' }); } },
    KOSIF_JEV: { fetch: async () => { calls.jev++; return Response.json({ ok: true, result: { choice: 'a' } }); } },
    ...extra,
  };
}
function req(path, { method = 'POST', token, body, headers = {}, ip } = {}) {
  const h = { 'content-type': 'application/json', 'cf-connecting-ip': ip || newIp(), ...headers };
  if (token) h.authorization = `Bearer ${token}`;
  return new Request(HOST + path, { method, headers: h, body: body === undefined ? (method === 'POST' ? JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }) : undefined) : body });
}
const call = (name, args) => JSON.stringify({ jsonrpc: '2.0', id: 7, method: 'tools/call', params: { name, arguments: args } });
async function spent(fn) {
  const before = { ...calls };
  const r = await fn();
  const d = Object.fromEntries(Object.keys(calls).map((k) => [k, calls[k] - before[k]]));
  return { r, ...d, total: d.ai + d.kvGet + d.kvPut + d.queue + d.secure + d.jev + d.otherFetch };
}
const result = async (r) => JSON.parse(await r.text()).result;
const sc = async (r) => (await result(r)).structuredContent;
const listTools = async (e = env()) => (await result(await worker.fetch(req('/mcp'), e))).tools;

const FULL_PRO_TOOLS = {
  kosif_full_pro_execute: { request_id: 'r1', subject: 's', confirmed_full_pro: true },
  kosif_full_pro_status: { request_id: 'r1' },
  kosif_full_pro_cancel: { request_id: 'r1' },
  kosif_full_pro_secure_authorize: { request_id: 'r1', scene_spec: {}, cross_expert_receipts: [{}], einstein_stage_receipts: [{}, {}, {}, {}, {}, {}, {}], final_stability_receipts: [{}, {}], gates: { deterministic: 'pass', risk: 'pass', self_critic: 'pass', verifier: 'pass' } },
  kosif_secure_image_execute: { request_id: 'r1', scene_spec: {} },
  kosif_secure_executor_status: { request_id: 'r1' },
  kosif_full_pro_bypass: { request_id: 'r1', reason: 'x' },
  kosif_secure_artifact_qa: { request_id: 'r1', pass: true, result_digest: 'd' },
  kosif_expert_harvest: { request_id: 'r1', expert_id: 'e1', role: 'r', subject: 's', shard: 0 },
  kosif_full_pro_jev_batch: { actions: [{ request_id: 'r1', action_id: 'a1', expert_id: 'e1', packet_id: 'p1', decision_type: 'noul', instructions: 'q' }] },
};
const bridge = (prefix, payload) => prefix + JSON.stringify(payload);
const BRIDGE_CONTEXTS = {
  mobile_start: bridge('KOSIF_FULL_PRO_MOBILE_V1:', { action: 'start', request_id: 'm1', subject: 's' }),
  mobile_canary_start: bridge('KOSIF_FULL_PRO_MOBILE_V1:', { action: 'canary_start', request_id: 'canary-m1', subject: 's' }),
  canary_start: bridge('KOSIF_FULL_PRO_CANARY_START_V1:', { request_id: 'canary-c1', subject: 's' }),
  canary_status: bridge('KOSIF_FULL_PRO_CANARY_STATUS_V1:', { request_id: 'canary-c1' }),
  canary_cancel: bridge('KOSIF_FULL_PRO_CANARY_CANCEL_V1:', { request_id: 'canary-c1' }),
  harvest: bridge('KOSIF_FULL_PRO_HARVEST_V1:', { request_id: 'r1', expert_id: 'e1', role: 'r', subject: 's', shard: 0 }),
  jev_batch: bridge('KOSIF_FULL_PRO_JEV_BATCH_V1:', FULL_PRO_TOOLS.kosif_full_pro_jev_batch),
};
const assertChallenge = async (r, label) => {
  assert.equal(r.status, 401, label);
  assert.match(r.headers.get('www-authenticate') || '', /^Bearer resource_metadata="https:\/\/kosif-think-mcp\.kosif199022\.workers\.dev\/\.well-known\/oauth-protected-resource"/, label);
  const res = await result(r);
  assert.equal(res.isError, true, label);
  assert.equal(res.structuredContent.error, 'authentication_required', label);
  assert.ok(res._meta['mcp/www_authenticate'][0].startsWith('Bearer resource_metadata='), label);
};

/* ---- catalog ---- */

test('tools/list is public and lists every tool once; the merged names are not listed', async () => {
  const names = (await listTools()).map((t) => t.name);
  assert.equal(new Set(names).size, names.length, 'no duplicate tool names');
  for (const merged of ['kosif_think', 'kosif_preflight', 'kosif_self_test', 'kosif_diagnostics', 'kosif_full_pro_start']) assert.ok(!names.includes(merged), merged);
  for (const kept of ['kosif_auto', 'kosif_think_status', 'kosif_route', 'kosif_agent', 'kosif_council', ...Object.keys(FULL_PRO_TOOLS)]) assert.ok(names.includes(kept), kept);
  assert.equal(names.length, 17);
});

test('security schemes: Full Pro needs OAuth, kosif_auto takes an optional token, every other tool is public', async () => {
  for (const t of await listTools()) {
    const types = t.securitySchemes.map((s) => s.type).join('+');
    assert.deepEqual(t._meta.securitySchemes, t.securitySchemes, t.name);
    if (t.name in FULL_PRO_TOOLS) assert.equal(types, 'oauth2', t.name);
    else if (t.name === 'kosif_auto') assert.equal(types, 'noauth+oauth2', t.name);
    else assert.equal(types, 'noauth', t.name);
  }
});

test('annotations: tools that change Full Pro state are not read-only, and cancel/bypass are destructive', async () => {
  const by = Object.fromEntries((await listTools()).map((t) => [t.name, t.annotations]));
  for (const name of ['kosif_full_pro_execute', 'kosif_full_pro_cancel', 'kosif_full_pro_secure_authorize', 'kosif_secure_image_execute', 'kosif_full_pro_bypass', 'kosif_secure_artifact_qa'])
    assert.equal(by[name].readOnlyHint, false, name);
  assert.equal(by.kosif_full_pro_cancel.destructiveHint, true);
  assert.equal(by.kosif_full_pro_bypass.destructiveHint, true);
  assert.equal(by.kosif_secure_image_execute.idempotentHint, false, 'a one-use ticket is consumed');
  for (const name of ['kosif_full_pro_status', 'kosif_secure_executor_status', 'kosif_think_status', 'kosif_route']) assert.equal(by[name].readOnlyHint, true, name);
});

test('initialize reports the running version and sends the host to kosif_auto first', async () => {
  const health = await (await worker.fetch(req('/health', { method: 'GET' }), env())).json();
  const init = await result(await worker.fetch(req('/mcp', { body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} }) }), env()));
  assert.equal(init.serverInfo.version, health.version);
  assert.ok(init.instructions.startsWith('KOSIF Think ' + health.version));
  assert.match(init.instructions, /call kosif_auto first/);
});

/* ---- Full Pro needs a sign-in, by every path ---- */

test('every Full Pro tool without a token: 401 with the resource-metadata challenge, and nothing is spent or read', async () => {
  for (const [name, args] of Object.entries(FULL_PRO_TOOLS)) {
    const { r, total } = await spent(() => worker.fetch(req('/mcp', { body: call(name, args) }), env()));
    await assertChallenge(r, name);
    assert.equal(total, 0, name);
  }
});

test('the merged kosif_full_pro_start stays callable and still needs a sign-in', async () => {
  const { r, total } = await spent(() => worker.fetch(req('/mcp', { body: call('kosif_full_pro_start', { request_id: 'r1', subject: 's' }) }), env()));
  await assertChallenge(r, 'kosif_full_pro_start');
  assert.equal(total, 0);
  const e = env();
  const ok = await worker.fetch(req('/mcp', { token: await jwt(), body: call('kosif_full_pro_start', { request_id: 'r2', subject: 's' }) }), e);
  assert.equal(ok.status, 200);
  assert.equal((await sc(ok)).status, 'running');
});

test('the Full Pro bridge inside kosif_think and kosif_auto needs a sign-in too: no start, read, harvest or Jev call', async () => {
  for (const [label, context] of Object.entries(BRIDGE_CONTEXTS)) {
    for (const [tool, args] of [['kosif_think', { question: 'q', context }], ['kosif_auto', { question: 'q', context, forceMode: 'fast' }]]) {
      const { r, total } = await spent(() => worker.fetch(req('/mcp', { body: call(tool, args) }), env()));
      await assertChallenge(r, `${tool}/${label}`);
      assert.equal(total, 0, `${tool}/${label}`);
    }
  }
});

test('a token-bound mobile action still needs the per-request bridge token', async () => {
  const e = env();
  const token = await jwt();
  const start = await sc(await worker.fetch(req('/mcp', { token, body: call('kosif_think', { question: 'q', context: BRIDGE_CONTEXTS.mobile_canary_start }) }), e));
  assert.ok(start.mobile_bridge_token, 'an authenticated start hands out a bridge token');
  const status = (bridge_token) => call('kosif_think', { question: 'q', context: bridge('KOSIF_FULL_PRO_MOBILE_V1:', { action: 'status', request_id: 'canary-m1', bridge_token }) });
  assert.equal((await sc(await worker.fetch(req('/mcp', { body: status('wrong') }), e))).error, 'FULL_PRO_MOBILE_TOKEN_INVALID');
  assert.equal((await sc(await worker.fetch(req('/mcp', { body: status(undefined) }), e))).error, 'FULL_PRO_MOBILE_TOKEN_REQUIRED');
  const ok = await sc(await worker.fetch(req('/mcp', { body: status(start.mobile_bridge_token) }), e));
  assert.equal(ok.request_id, 'canary-m1');
  assert.equal(ok.status, 'running');
});

test('a valid Auth0 token opens Full Pro: a canary start is queued, and status reads it back', async () => {
  const e = env();
  const token = await jwt();
  const { r, queue, secure } = await spent(() => worker.fetch(req('/mcp', { token, body: call('kosif_think', { question: 'q', context: BRIDGE_CONTEXTS.canary_start }) }), e));
  assert.equal(r.status, 200);
  const out = await sc(r);
  assert.equal(out.request_id, 'canary-c1');
  assert.equal(out.canary, true);
  assert.equal(queue, 1);
  assert.equal(secure, 0, 'a canary never reaches the Secure Executor');
  const status = await worker.fetch(req('/mcp', { token, body: call('kosif_full_pro_status', { request_id: 'canary-c1' }) }), e);
  assert.equal(status.status, 200);
  assert.equal((await sc(status)).status, 'running');
});

test('tokens that are expired, for another audience or issuer, without a subject, or signed by another key are refused', async () => {
  const now = Math.floor(Date.now() / 1000);
  const bad = {
    expired: await jwt({ exp: now - 10 }),
    audience: await jwt({ aud: 'https://someone-else.example' }),
    issuer: await jwt({ iss: 'https://evil.auth0.com/' }),
    subject: await jwt({ sub: '' }),
    notYet: await jwt({ nbf: now + 3600 }),
    stranger: await jwt({}, strangerKey.privateKey),
    garbage: 'not.a.jwt',
  };
  for (const [label, token] of Object.entries(bad)) {
    const { r, total } = await spent(() => worker.fetch(req('/mcp', { token, body: call('kosif_full_pro_status', { request_id: 'r1' }) }), env()));
    await assertChallenge(r, label);
    assert.equal(total, 0, label);
  }
});

test('KOSIF_OWNER_SUBS: when set, only the listed Auth0 accounts pass', async () => {
  const e = env({ KOSIF_OWNER_SUBS: 'auth0|owner, google-oauth2|42' });
  const body = call('kosif_full_pro_status', { request_id: 'missing' });
  await assertChallenge(await worker.fetch(req('/mcp', { token: await jwt({ sub: 'auth0|someone-who-signed-up' }), body }), e), 'stranger');
  for (const sub of ['auth0|owner', 'google-oauth2|42']) {
    const r = await worker.fetch(req('/mcp', { token: await jwt({ sub }), body }), e);
    assert.equal(r.status, 200, sub);
    assert.equal((await sc(r)).error, 'FULL_PRO_REQUEST_NOT_FOUND');
  }
});

test('the legacy bearer works only when KOSIF_THINK_TOKEN holds at least 32 characters', async () => {
  const body = call('kosif_full_pro_status', { request_id: 'missing' });
  const on = env({ KOSIF_THINK_TOKEN: LEGACY });
  assert.equal((await worker.fetch(req('/mcp', { token: LEGACY, body }), on)).status, 200);
  await assertChallenge(await worker.fetch(req('/mcp', { token: LEGACY + 'x', body }), on), 'wrong value');
  const short = env({ KOSIF_THINK_TOKEN: 'short' });
  await assertChallenge(await worker.fetch(req('/mcp', { token: 'short', body }), short), 'short secret is never accepted');
});

test('the path token is off by default and works only when THINK_ALLOW_PATH_TOKEN is "true"', async () => {
  const body = call('kosif_full_pro_status', { request_id: 'missing' });
  assert.equal((await worker.fetch(req(`/mcp/${LEGACY}`, { body }), env({ KOSIF_THINK_TOKEN: LEGACY }))).status, 404);
  const on = env({ KOSIF_THINK_TOKEN: LEGACY, THINK_ALLOW_PATH_TOKEN: 'true' });
  assert.equal((await worker.fetch(req(`/mcp/${LEGACY}`, { body }), on)).status, 200);
  assert.equal((await worker.fetch(req(`/mcp/${LEGACY}x`, { body }), on)).status, 401);
  assert.equal((await worker.fetch(req('/mcp/v0.9.3'), env())).status, 200, 'the legacy versioned path is not a token');
});

test('failed sign-ins: after THINK_AUTH_FAILS_PER_MIN failures from one IP, further wrong tokens get 429; a valid one still passes', async () => {
  const e = env({ KOSIF_THINK_TOKEN: LEGACY, THINK_AUTH_FAILS_PER_MIN: '3' });
  const ip = '198.51.100.77';
  const body = call('kosif_full_pro_status', { request_id: 'missing' });
  for (let i = 0; i < 3; i++) assert.equal((await worker.fetch(req('/mcp', { token: `wrong-${i}`, ip, body }), e)).status, 401);
  const over = await worker.fetch(req('/mcp', { token: 'wrong-3', ip, body }), e);
  assert.equal(over.status, 429);
  assert.equal(over.headers.get('retry-after'), '60');
  assert.equal((await worker.fetch(req('/mcp', { token: LEGACY, ip, body }), e)).status, 200, 'someone spraying from a shared IP cannot lock the owner out');
  assert.equal((await worker.fetch(req('/mcp', { token: 'wrong-4', ip: '198.51.100.78', body }), e)).status, 401, 'other IPs keep their own count');
});

test('kosif_full_pro_jev_batch takes at most 10 decisions per tool call', async () => {
  const one = FULL_PRO_TOOLS.kosif_full_pro_jev_batch.actions[0];
  const actions = Array.from({ length: 11 }, (_, i) => ({ ...one, action_id: 'a' + i, packet_id: 'p' + i }));
  const { r, jev } = await spent(async () => worker.fetch(req('/mcp', { token: await jwt(), body: call('kosif_full_pro_jev_batch', { actions }) }), env()));
  assert.equal((await sc(r)).error, 'FULL_PRO_JEV_BATCH_SIZE');
  assert.equal(jev, 0);
  const ok = await sc(await worker.fetch(req('/mcp', { token: await jwt(), body: call('kosif_full_pro_jev_batch', { actions: actions.slice(0, 2) }) }), env()));
  assert.equal(ok.observed_calls, 2);
});

/* ---- merged tools ---- */

test('the merged names stay callable for existing callers', async () => {
  for (const [name, args] of [['kosif_preflight', { question: 'q' }], ['kosif_self_test', {}], ['kosif_diagnostics', {}], ['kosif_think', { question: 'q', mode: 'fast' }]]) {
    const r = await worker.fetch(req('/mcp', { body: call(name, args) }), env());
    assert.equal(r.status, 200, name);
    assert.equal((await result(r)).isError, false, name);
  }
});

test('kosif_think_status is the single status tool: self-test and diagnostics included, no secret values', async () => {
  const e = env({ KOSIF_THINK_TOKEN: LEGACY, THINK_RATE_LIMITER: { limit: async () => ({ success: true }) }, THINK_ALLOWED_ORIGINS: 'https://s-kosif.pages.dev', KOSIF_OWNER_SUBS: 'auth0|owner' });
  const r = await worker.fetch(req('/mcp', { body: call('kosif_think_status', {}) }), e);
  const t = await r.clone().text();
  assert.ok(!t.includes(LEGACY) && !t.includes('auth0|owner'), 'only counts and flags, never a value');
  const out = await sc(r);
  assert.equal(out.selfTest.allPassed, true);
  assert.equal(out.selfTest.total, out.selfTest.tests.length);
  assert.equal(out.diagnostics.scope, 'ephemeral-worker-isolate');
  assert.deepEqual(out.mergedTools.kosif_auto, ['kosif_think', 'kosif_preflight']);
  assert.deepEqual(out.mergedTools.kosif_full_pro_execute, ['kosif_full_pro_start']);
  assert.equal(out.access.ownerAllowlist, 1);
  assert.equal(out.access.fullProBridgeRequiresAuth, true);
  assert.equal(out.access.rateLimiter, true);
  assert.equal(out.access.browserOrigins, 1);
  assert.equal(out.hostToolRouting.mode, 'host-mediated');
  assert.equal(out.hostToolRouting.directPluginCalls, false);
  assert.ok(out.hostToolRouting.catalogSize >= 30);
  assert.deepEqual(out.hostToolRouting.autoCostClasses.sort(), ['existing_plan', 'free', 'included']);
});

test('kosif_auto: planOnly spends no model call; Fast runs the Cloudflare fast council', async () => {
  const plan = await spent(() => worker.fetch(req('/mcp', { body: call('kosif_auto', { question: 'Summarize this short paragraph.', planOnly: true }) }), env()));
  assert.equal(plan.ai, 0);
  assert.equal((await sc(plan.r)).assessment.preflight.modelCalls, false);
  const fast = await spent(() => worker.fetch(req('/mcp', { body: call('kosif_auto', { question: 'Summarize this short paragraph.' }) }), env()));
  assert.equal(fast.ai, 3, 'the three fast agents');
  assert.equal((await sc(fast.r)).result.backend, 'cloudflare-fast');
});

/* ---- transport ---- */

test('HTTP methods: /mcp takes POST (and a CORS preflight) only; /health takes GET and HEAD only', async () => {
  const e = env();
  for (const method of ['GET', 'PUT', 'DELETE', 'PATCH']) {
    const r = await worker.fetch(req('/mcp', { method, body: method === 'GET' ? undefined : '{}' }), e);
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

test('OAuth protected-resource metadata names the Auth0 issuer on every published path', async () => {
  for (const path of ['/.well-known/oauth-protected-resource', '/.well-known/oauth-protected-resource/mcp', '/.well-known/oauth-protected-resource/mcp/v0.9.3']) {
    const m = await (await worker.fetch(req(path, { method: 'GET' }), env())).json();
    assert.equal(m.resource, AUDIENCE, path);
    assert.deepEqual(m.authorization_servers, [ISSUER], path);
  }
});

test('CORS: no browser origin is allowed by default; an allow-listed origin gets its own origin back, never "*"', async () => {
  const evil = await worker.fetch(req('/mcp', { headers: { origin: 'https://evil.example' } }), env());
  assert.equal(evil.status, 403);
  assert.equal(evil.headers.get('access-control-allow-origin'), null);
  assert.equal((await worker.fetch(req('/mcp', { method: 'OPTIONS', headers: { origin: 'https://evil.example' } }), env())).status, 403);
  const ok = env({ THINK_ALLOWED_ORIGINS: 'https://s-kosif.pages.dev, https://other.example' });
  const pf = await worker.fetch(req('/mcp', { method: 'OPTIONS', headers: { origin: 'https://s-kosif.pages.dev' } }), ok);
  assert.equal(pf.status, 204);
  assert.equal(pf.headers.get('access-control-allow-origin'), 'https://s-kosif.pages.dev');
  assert.equal(pf.headers.get('access-control-allow-methods'), 'POST');
  assert.match(pf.headers.get('access-control-allow-headers'), /authorization/);
  assert.equal(pf.headers.get('vary'), 'Origin');
  const post = await worker.fetch(req('/mcp', { headers: { origin: 'https://s-kosif.pages.dev' } }), ok);
  assert.equal(post.status, 200);
  assert.equal(post.headers.get('access-control-allow-origin'), 'https://s-kosif.pages.dev');
  const unauth = await worker.fetch(req('/mcp', { headers: { origin: 'https://s-kosif.pages.dev' }, body: call('kosif_full_pro_status', { request_id: 'r1' }) }), ok);
  assert.equal(unauth.status, 401, 'an allowed origin still needs a sign-in for Full Pro');
});

test('request body: JSON only, capped by Content-Length and by the bytes actually sent', async () => {
  const e = env({ THINK_MAX_BODY_BYTES: '2048' });
  const big = call('kosif_agent', { agent: 'gpt', question: 'q'.repeat(5000) });
  const byHeader = await spent(() => worker.fetch(req('/mcp', { body: big }), e));
  assert.equal(byHeader.r.status, 413);
  assert.equal(byHeader.total, 0);
  /* no Content-Length: the body arrives as a stream and is cut off while it is read */
  const stream = new ReadableStream({ start(c) { for (let i = 0; i < 8; i++) c.enqueue(new TextEncoder().encode('x'.repeat(1024))); c.close(); } });
  const chunked = new Request(HOST + '/mcp', { method: 'POST', body: stream, duplex: 'half', headers: { 'content-type': 'application/json' } });
  assert.equal((await worker.fetch(chunked, e)).status, 413);
  assert.equal((await worker.fetch(req('/mcp', { headers: { 'content-type': 'text/plain' } }), e)).status, 415);
});

test('JSON-RPC shape: a batch array or a message without a method is an Invalid Request', async () => {
  for (const body of ['[{"jsonrpc":"2.0","id":1,"method":"tools/list"}]', '{"jsonrpc":"2.0","id":1}', 'null', '"x"']) {
    const r = await worker.fetch(req('/mcp', { body }), env());
    assert.equal((await r.json()).error.code, -32600, body);
  }
  assert.equal((await (await worker.fetch(req('/mcp', { body: '{not json' }), env())).json()).error.code, -32700);
  assert.equal((await (await worker.fetch(req('/mcp', { body: call('no_such_tool', {}) }), env())).json()).error.code, -32602);
});

/* ---- limits ---- */

test('per-IP limit on public tool calls: the call past THINK_RPM gets 429 with Retry-After', async () => {
  const e = env({ THINK_RPM: '3' });
  const ip = '192.0.2.10';
  const body = call('kosif_route', { task: 'q' });
  for (let i = 0; i < 3; i++) assert.equal((await worker.fetch(req('/mcp', { ip, body }), e)).status, 200);
  const over = await worker.fetch(req('/mcp', { ip, body }), e);
  assert.equal(over.status, 429);
  assert.equal(over.headers.get('retry-after'), '60');
});

test('public model calls have their own, tighter per-IP limit; deterministic tools are not charged to it', async () => {
  const e = env();
  const ip = '192.0.2.11';
  const fast = call('kosif_auto', { question: 'Summarize this short paragraph.' });
  for (let i = 0; i < 2; i++) assert.equal((await worker.fetch(req('/mcp', { ip, body: fast }), e)).status, 200);
  const { r, ai } = await spent(() => worker.fetch(req('/mcp', { ip, body: fast }), e));
  assert.equal(r.status, 429);
  assert.equal(ai, 0);
  const council = call('kosif_council', { question: 'q', artifacts: [{ agentId: 'gpt', answer: 'a', confidence: 0.9 }] });
  assert.equal((await worker.fetch(req('/mcp', { ip, body: council }), e)).status, 200);
});

test('rate-limit bindings are used when bound; a binding that throws falls back to the local window, never open', async () => {
  const seen = [];
  const deny = env({ THINK_RATE_LIMITER: { limit: async ({ key }) => { seen.push(key); return { success: false }; } } });
  assert.equal((await worker.fetch(req('/mcp', { body: call('kosif_route', { task: 'q' }) }), deny)).status, 429);
  assert.match(seen[0], /^public:ip:/);
  const token = await jwt({ sub: 'auth0|owner' });
  assert.equal((await worker.fetch(req('/mcp', { token, body: call('kosif_full_pro_status', { request_id: 'r1' }) }), deny)).status, 429);
  assert.match(seen[1], /^caller:[0-9a-f]{24}$/, 'the signed-in key is a hash, not the token or the account id');
  const broken = env({ THINK_RPM: '1', THINK_RATE_LIMITER: { limit: async () => { throw new Error('binding down'); } } });
  const ip = '192.0.2.12';
  assert.equal((await worker.fetch(req('/mcp', { ip, body: call('kosif_route', { task: 'q' }) }), broken)).status, 200);
  assert.equal((await worker.fetch(req('/mcp', { ip, body: call('kosif_route', { task: 'q' }) }), broken)).status, 429);
});

test('THINK_FRONTIER_ENABLED "false" stops frontier agent calls without a code change', async () => {
  const { r, ai } = await spent(() => worker.fetch(req('/mcp', { body: call('kosif_agent', { agent: 'claude', question: 'q' }) }), env({ THINK_FRONTIER_ENABLED: 'false' })));
  assert.equal(ai, 0);
  assert.equal((await sc(r)).error, 'FRONTIER_DISABLED');
});

/* ---- routing ---- */

test('kosif_route is deterministic, host-mediated, and spends no model calls', async () => {
  const body = call('kosif_route', {
    task: 'راجع واجهة التطبيق واكتشف أخطاء الكود ثم جهّز النشر',
    availableTools: [
      { name: 'GitHub', connected: true, costClass: 'existing_plan' },
      { name: 'Figma', connected: true, costClass: 'existing_plan' },
      { name: 'PostHog', connected: true, costClass: 'existing_plan' },
      { name: 'Cloudflare', connected: true, costClass: 'existing_plan' },
      { name: 'Runway', connected: true, costClass: 'credits' },
    ],
  });
  const { r, total } = await spent(() => worker.fetch(req('/mcp', { body }), env()));
  assert.equal(total, 0, 'routing itself never runs a model or paid upstream');
  const out = await sc(r);
  assert.equal(out.mode, 'host-mediated');
  assert.equal(out.directPluginCalls, false);
  const names = out.useNow.map((x) => x.name);
  for (const n of ['GitHub', 'Figma', 'Cloudflare']) assert.ok(names.includes(n), n);
  assert.equal(out.hostContract.truthfulness.includes('Never claim'), true);
});

test('kosif_route enforces the user cost policy: free/included/current-plan auto, credits or unknown require approval', async () => {
  const args = {
    task: 'أنشئ صورة احترافية وإعلان بصري ثم حرّك الصورة كفيديو',
    availableTools: [
      { name: 'Adobe Express', connected: true, costClass: 'free' },
      { name: 'Runway', connected: true, costClass: 'credits' },
      { name: 'OpenArt', connected: true, costClass: 'unknown' },
      { name: 'Higgsfield', connected: true, costClass: 'unknown' },
      { name: 'Canva', connected: true, costClass: 'mixed' },
    ],
    maxTools: 10,
  };
  let out = await sc(await worker.fetch(req('/mcp', { body: call('kosif_route', args) }), env()));
  assert.ok(out.useNow.some((x) => x.name === 'Adobe Express'));
  for (const name of ['Runway', 'OpenArt', 'Higgsfield', 'Canva']) assert.ok(out.needsApproval.some((x) => x.name === name), name + ' is gated');
  out = await sc(await worker.fetch(req('/mcp', { body: call('kosif_route', { ...args, approvedTools: ['Runway'] }) }), env()));
  assert.ok(out.useNow.some((x) => x.name === 'Runway' && x.approved === true));
  assert.ok(!out.needsApproval.some((x) => x.name === 'Runway'));
});

test('kosif_route never assumes a plugin is connected when the host did not provide availability', async () => {
  const out = await sc(await worker.fetch(req('/mcp', { body: call('kosif_route', { task: 'ابحث في القانون واللوائح عن هذا الموضوع' }) }), env()));
  assert.equal(out.useNow.length, 0);
  assert.ok(out.needsAvailabilityCheck.length > 0, 'catalog candidates are listed for an availability check');
  assert.ok(out.needsAvailabilityCheck.every((x) => x.connected !== true));
});

test('kosif_route treats an omitted or unknown cost as approval-gated even for a known tool', async () => {
  const out = await sc(await worker.fetch(req('/mcp', { body: call('kosif_route', { task: 'راجع كود GitHub واكتشف الخطأ', availableTools: [{ name: 'GitHub', connected: true }] }) }), env()));
  assert.ok(!out.useNow.some((x) => x.name === 'GitHub'));
  assert.ok(out.needsApproval.some((x) => x.name === 'GitHub' && x.costClass === 'unknown'));
});

test('kosif_route can route future connected tools that are not hardcoded in the catalog', async () => {
  const out = await sc(await worker.fetch(req('/mcp', {
    body: call('kosif_route', {
      task: 'راجع الواجهة والخطوط واكتشف مشاكل الكود',
      availableTools: [{ name: 'Future UI Inspector', connected: true, costClass: 'included', description: 'Responsive UI, typography and accessibility checker', lanes: ['design', 'dev'] }],
    }),
  }), env()));
  assert.ok(out.useNow.some((x) => x.name === 'Future UI Inspector'));
});

/* ---- source and council rules ---- */

test('the source carries no credential and every response path sets the security headers', () => {
  const src = readFileSync(new URL('./worker.js', import.meta.url), 'utf8');
  assert.ok(!/sk-[A-Za-z0-9_-]{16,}|Bearer [A-Za-z0-9_-]{20,}/.test(src), 'no key or bearer literal in the source');
  assert.ok(!/new Response\(/.test(src.replace(/function (json|empty)\([^)]*\)\{ return new Response\(/g, '')), 'responses are built only by json() and empty(), which add the security headers');
});

test('council: one artifact per known frontier agent, abstentions counted, a conservative readiness gate', async () => {
  const rpc = async (body) => sc(await worker.fetch(req('/mcp', { body }), env()));
  const dup = await rpc(call('kosif_council', { question: 'q', artifacts: [{ agentId: 'gpt', answer: 'a', confidence: 0.9 }, { agentId: 'gpt', answer: 'b', confidence: 0.9 }] }));
  assert.equal(dup.error, 'DUPLICATE_AGENT_ID');
  const unknown = await rpc(call('kosif_council', { question: 'q', artifacts: [{ agentId: 'intruder', answer: 'a', confidence: 0.9 }] }));
  assert.equal(unknown.error, 'UNKNOWN_FRONTIER_AGENT');
  const r = await rpc(call('kosif_council', { question: 'q', options: { A: 'keep', B: 'change' }, artifacts: [
    { agentId: 'gpt', answer: 'keep it', recommendationId: 'A', confidence: 0.9, evidence: ['x'] },
    { agentId: 'claude', answer: 'keep it', recommendationId: 'A', confidence: 0.8, evidence: ['y'] },
    { agentId: 'gemini', answer: 'no view', confidence: 0.4, evidence: ['z'] },
  ] }));
  assert.equal(r.council.winningOptionId, 'A');
  assert.equal(r.council.abstentions, 1);
  assert.equal(r.council.agreementPercent, 66.67, 'agreement counts every participating agent, abstentions included');
  assert.equal(r.preJevGate.passed, false);
  assert.ok(r.preJevGate.reasons.includes('MISSING_AGENTS') && r.preJevGate.reasons.includes('COUNCIL_AGREEMENT_BELOW_80'), r.preJevGate.reasons.join(','));
  assert.equal(r.synthesis.finalAnswer, 'keep it', 'the synthesis follows the winning option');
});

test('agents: an empty or malformed answer is a failure, never a made-up artifact; a zero confidence stays zero', async () => {
  const agent = async (name) => sc(await worker.fetch(req('/mcp', { body: call('kosif_agent', { agent: name, question: 'q' }) }), env()));
  try {
    aiReply = () => ({ response: '{"answer":"","confidence":0.9}' });
    assert.equal((await agent('claude')).error, 'AGENT_EMPTY_ANSWER');
    aiReply = () => ({ response: 'just prose without the format' });
    assert.equal((await agent('gemini')).error, 'AGENT_JSON_INVALID');
    aiReply = () => ({ response: '{"answer":"a real but unsure insight","confidence":0}' });
    const zero = await agent('gemini');
    assert.equal(zero.artifact.confidence, 0, 'a zero confidence stays zero');
    assert.deepEqual(zero.artifact.evidence, [], 'an insight is not counted as evidence');
  } finally {
    aiReply = () => ({ response: JSON.stringify({ answer: 'fast answer', confidence: 0.7, evidence: ['e'] }) });
  }
  assert.equal((await sc(await worker.fetch(req('/mcp', { body: call('kosif_think', { question: 'q', mode: 'turbo' }) }), env()))).error, 'INVALID_MODE');
});
