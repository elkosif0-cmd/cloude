// Caller authentication of the KOSIF WhatsApp MCP Worker (workers/mcp). The bridge binding is stubbed and counted,
// so each test proves that a refused call never reached the linked WhatsApp account. Auth0 is replaced by a local
// RSA key served as the JWKS, and the KOSIF Think relay by a stub that records what it was sent.
import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../workers/mcp/index.js';

const HOST = 'https://wa-kosif-mcp.example.workers.dev';
const ISSUER = 'https://dev-zn5bwigg38b13ui8.us.auth0.com/';
const THINK = 'https://kosif-think-mcp.kosif199022.workers.dev/mcp';
const SHARED = 'shared-secret-for-server-callers-0123456789';
const THINK_TOKEN = 'think-server-secret-0123456789-0123456789';

const b64u = (bytes) => Buffer.from(bytes).toString('base64url');
const rsa = { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' };
const tenant = await crypto.subtle.generateKey(rsa, true, ['sign', 'verify']);
const stranger = await crypto.subtle.generateKey(rsa, true, ['sign', 'verify']);
const jwk = { ...(await crypto.subtle.exportKey('jwk', tenant.publicKey)), kid: 'k1', alg: 'RS256' };
const thinkCalls = [];
globalThis.fetch = async (url, init) => {
  if (String(url) === ISSUER + '.well-known/jwks.json') return Response.json({ keys: [jwk] });
  if (String(url) === THINK) {
    thinkCalls.push({ auth: new Headers(init.headers).get('authorization'), body: JSON.parse(init.body) });
    return Response.json({ jsonrpc: '2.0', id: 1, result: { content: [{ type: 'text', text: '{"ok":true}' }] } });
  }
  throw new Error('unexpected network call to ' + url);
};
async function jwt(claims = {}, key = tenant.privateKey) {
  const now = Math.floor(Date.now() / 1000);
  const head = b64u(JSON.stringify({ alg: 'RS256', kid: 'k1', typ: 'JWT' }));
  const body = b64u(JSON.stringify({ iss: ISSUER, aud: HOST, sub: 'auth0|owner', iat: now, exp: now + 600, ...claims }));
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(head + '.' + body));
  return head + '.' + body + '.' + b64u(new Uint8Array(sig));
}

let bridgeCalls = 0;
const env = (extra = {}) => ({
  BRIDGE_KEY: 'bridge-key',
  BRIDGE: { fetch: async (req) => { bridgeCalls++; return Response.json(new URL(req.url).pathname === '/send' ? { sent: true, id: 'm1' } : { linked: true, connection: 'open' }); } },
  KOSIF_OWNER_SUBS: 'auth0|owner',
  ...extra,
});
const rpc = (method, params) => JSON.stringify({ jsonrpc: '2.0', id: 1, method, params });
const post = (body, token) => new Request(HOST + '/mcp', { method: 'POST', headers: { 'content-type': 'application/json', ...(token ? { authorization: 'Bearer ' + token } : {}) }, body });
const status = rpc('tools/call', { name: 'get_whatsapp_status', arguments: {} });
const send = rpc('tools/call', { name: 'send_whatsapp_message', arguments: { to: '+15550000000', message: 'hi', idempotencyKey: 'k1' } });
const fullPro = rpc('tools/call', { name: 'kosif_full_pro_execute', arguments: { request_id: 'r1', subject: 's', confirmed_full_pro: true } });
async function counted(fn) { const b = bridgeCalls, t = thinkCalls.length; const r = await fn(); return { r, bridge: bridgeCalls - b, think: thinkCalls.length - t }; }
const listed = async () => (await (await worker.fetch(post(rpc('tools/list')), env())).json()).result.tools;

test('tools/list is public, every tool declares OAuth, and no tool shares a name with KOSIF Think', async () => {
  const tools = await listed();
  const names = tools.map((t) => t.name);
  assert.equal(new Set(names).size, names.length);
  assert.ok(!names.includes('kosif_full_pro_execute'), 'KOSIF Think already lists kosif_full_pro_execute');
  for (const n of ['kosif_mobile_think', 'kosif_mobile_call', 'send_whatsapp_message', 'get_whatsapp_status']) assert.ok(names.includes(n), n);
  for (const t of tools) assert.deepEqual(t.securitySchemes.map((s) => s.type), ['oauth2'], t.name);
});

test('annotations: sends, schedules, pairing and contact changes are not read-only; deleting a contact is destructive', async () => {
  const by = Object.fromEntries((await listed()).map((t) => [t.name, t.annotations]));
  for (const n of ['send_whatsapp_message', 'send_whatsapp_bundle', 'send_whatsapp_file', 'schedule_whatsapp_message', 'schedule_whatsapp_bundle', 'pair_whatsapp', 'save_whatsapp_contact', 'delete_saved_whatsapp_contact', 'kosif_mobile_call'])
    assert.equal(by[n].readOnlyHint, false, n);
  assert.equal(by.delete_saved_whatsapp_contact.destructiveHint, true);
  for (const n of ['get_whatsapp_status', 'list_whatsapp_messages', 'get_whatsapp_delivery_report', 'kosif_mobile_capabilities']) assert.equal(by[n].readOnlyHint, true, n);
});

test('protected-resource metadata points at the Auth0 tenant for this Worker', async () => {
  for (const path of ['/.well-known/oauth-protected-resource', '/.well-known/oauth-protected-resource/mcp']) {
    const m = await (await worker.fetch(new Request(HOST + path), env())).json();
    assert.equal(m.resource, HOST, path);
    assert.deepEqual(m.authorization_servers, [ISSUER], path);
  }
});

test('no token: 401 with the sign-in challenge; neither WhatsApp nor KOSIF Think is reached', async () => {
  for (const body of [status, send, fullPro]) {
    const { r, bridge, think } = await counted(() => worker.fetch(post(body), env()));
    assert.equal(r.status, 401);
    assert.match(r.headers.get('www-authenticate'), /^Bearer resource_metadata="https:\/\/wa-kosif-mcp\.example\.workers\.dev\/\.well-known\/oauth-protected-resource"/);
    const res = (await r.json()).result;
    assert.equal(res.isError, true);
    assert.ok(res._meta['mcp/www_authenticate'][0].startsWith('Bearer resource_metadata='));
    assert.equal(bridge + think, 0);
  }
});

test('fails closed: with no owner list and no shared secret, no tool runs, whatever is sent', async () => {
  const { r, bridge } = await counted(async () => worker.fetch(post(send, await jwt()), env({ KOSIF_OWNER_SUBS: '' })));
  assert.equal((await r.json()).error.code, -32001);
  assert.equal(bridge, 0);
  const short = env({ KOSIF_OWNER_SUBS: '', WA_MCP_TOKEN: 'short' });
  assert.equal((await (await worker.fetch(post(send, 'short'), short)).json()).error.code, -32001, 'a short shared secret is never usable');
});

test('only the owner passes: other tenant accounts, other audiences, expired or foreign-signed tokens are refused', async () => {
  const now = Math.floor(Date.now() / 1000);
  for (const [label, token] of Object.entries({
    otherAccount: await jwt({ sub: 'auth0|someone-who-signed-up' }),
    thinkAudience: await jwt({ aud: 'https://kosif-think-mcp.kosif199022.workers.dev' }),
    expired: await jwt({ exp: now - 5 }),
    foreignKey: await jwt({}, stranger.privateKey),
    garbage: 'x.y.z',
  })) {
    const { r, bridge } = await counted(() => worker.fetch(post(send, token), env()));
    assert.equal(r.status, 401, label);
    assert.equal(bridge, 0, label);
  }
});

test('the owner token and the shared secret both work', async () => {
  const owner = await counted(async () => worker.fetch(post(send, await jwt()), env()));
  assert.equal(owner.r.status, 200);
  assert.equal((await owner.r.json()).result.structuredContent.status, 'accepted', 'bridge accepted the transport request; delivery is unconfirmed');
  assert.equal(owner.bridge, 1);
  const server = await worker.fetch(post(status, SHARED), env({ KOSIF_OWNER_SUBS: '', WA_MCP_TOKEN: SHARED }));
  assert.equal(server.status, 200);
  assert.equal(JSON.parse((await server.json()).result.content[0].text).linked, true);
  assert.equal((await worker.fetch(post(status, SHARED + 'x'), env({ WA_MCP_TOKEN: SHARED }))).status, 401);
});

test('the KOSIF Think relay sends the server secret, and the hidden kosif_full_pro_execute stays callable', async () => {
  const { r, think } = await counted(async () => worker.fetch(post(fullPro, await jwt()), env({ KOSIF_THINK_TOKEN: THINK_TOKEN })));
  assert.equal(r.status, 200);
  assert.equal(think, 1);
  const sent = thinkCalls.at(-1);
  assert.equal(sent.auth, 'Bearer ' + THINK_TOKEN);
  assert.equal(sent.body.params.name, 'kosif_full_pro_execute');
  const think2 = rpc('tools/call', { name: 'kosif_mobile_think', arguments: { question: 'q' } });
  await worker.fetch(post(think2, await jwt()), env());
  assert.equal(thinkCalls.at(-1).auth, null, 'without the secret configured, no authorization header is invented');
  assert.equal(thinkCalls.at(-1).body.params.name, 'kosif_auto');
});
