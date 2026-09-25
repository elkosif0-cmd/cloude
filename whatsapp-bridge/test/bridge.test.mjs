// End-to-end test of Worker -> Durable Object -> container/server.mjs with Baileys and the
// Cloudflare runtime stubbed out. Run: npm test (from whatsapp-bridge/).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { build } from 'esbuild';

const here = dirname(fileURLToPath(import.meta.url));
const tmp = mkdtempSync(join(tmpdir(), 'wa-bridge-test-'));
const SENT_LOG = join(tmp, 'sent.log');
const KEY = 'test-key';
const PDF = Buffer.from('%PDF-1.4 test');

let container, files, worker, env, instance, waitUntils;

function sent() {
  try { return readFileSync(SENT_LOG, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l)); } catch { return []; }
}
function resetSent() { writeFileSync(SENT_LOG, ''); }

function memoryStorage() {
  const m = new Map();
  return {
    map: m,
    async get(k) { return Array.isArray(k) ? new Map(k.filter((x) => m.has(x)).map((x) => [x, structuredClone(m.get(x))])) : structuredClone(m.get(k)); },
    async put(obj) { for (const [k, v] of Object.entries(obj)) m.set(k, structuredClone(v)); },
    async delete(k) { for (const x of [].concat(k)) m.delete(x); },
  };
}

async function call(path, { method = 'POST', body, key = KEY, headers = {} } = {}) {
  const req = new Request('https://wa.test' + path, {
    method,
    headers: { ...(key ? { authorization: 'Bearer ' + key } : {}), 'content-type': 'application/json', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const t0 = Date.now();
  const res = await worker.fetch(req, env);
  return { status: res.status, body: await res.json().catch(() => null), ms: Date.now() - t0 };
}

before(async () => {
  resetSent();
  files = createServer((req, res) => {
    if (req.url === '/ok.pdf') { res.writeHead(200, { 'content-type': 'application/pdf' }); return res.end(PDF); }
    res.writeHead(404); res.end();
  }).listen(0);
  await new Promise((r) => files.once('listening', r));

  container = spawn(process.execPath, ['--import', join(here, 'register.mjs'), join(here, '../container/server.mjs')], {
    env: { ...process.env, SENT_LOG, LOG_LEVEL: 'silent' },
    stdio: 'inherit',
  });
  for (let i = 0; i < 50; i++) {
    try { await fetch('http://127.0.0.1:8080/status'); break; } catch { await new Promise((r) => setTimeout(r, 100)); }
  }
  process.env.CONTAINER_ORIGIN = 'http://127.0.0.1:8080';

  const out = join(tmp, 'worker.mjs');
  await build({
    entryPoints: [join(here, '../src/index.ts')],
    bundle: true, format: 'esm', platform: 'neutral', outfile: out, logLevel: 'error',
    alias: { '@cloudflare/containers': join(here, 'stub-containers.mjs') },
  });
  globalThis.scheduler = { wait: (ms) => new Promise((r) => setTimeout(r, ms)) };
  const mod = await import(out);
  worker = mod.default;

  waitUntils = [];
  const ctx = { storage: memoryStorage(), waitUntil: (p) => waitUntils.push(p) };
  instance = new mod.WaBridge(ctx, {});
  env = {
    API_KEY_SHA256: createHash('sha256').update(KEY).digest('hex'),
    WA: { get: () => instance },
    FILES: {
      async get(key) {
        if (key !== 'cv/CV-Arabic.pdf') return null;
        return { size: PDF.length, arrayBuffer: async () => PDF.buffer.slice(PDF.byteOffset, PDF.byteOffset + PDF.length), httpMetadata: {} };
      },
    },
  };
});

after(async () => {
  await Promise.all(waitUntils.splice(0));
  container?.kill();
  files?.close();
});

test('rejects a wrong key', async () => {
  const r = await call('/send', { key: 'nope', body: { to: '201011111111', message: 'x' } });
  assert.equal(r.status, 401);
});

test('/send keeps its response shape and no longer waits 1.5s', async () => {
  resetSent();
  await call('/status', { method: 'GET' }); // warm-up: restore + connect
  const r = await call('/send', { body: { to: '01011111111', message: ' hi ' } });
  assert.equal(r.status, 200);
  assert.equal(r.body.sent, true);
  assert.equal(r.body.to, '201011111111@s.whatsapp.net');
  assert.match(r.body.id, /^MSG/);
  assert.ok(r.ms < 1000, `took ${r.ms}ms`);
  assert.deepEqual(sent().map((s) => s.text), ['hi']);
});

test('auth is saved after the reply', async () => {
  await Promise.all(waitUntils.splice(0));
  const st = instance.ctx.storage.map;
  assert.ok(st.get('auth:chunks') >= 1);
  const saved = JSON.parse(st.get('auth:0'));
  assert.ok(Object.keys(saved.auth.keys.session).length >= 1);
});

test('/send-bundle sends text then stored CV in one call', async () => {
  resetSent();
  const r = await call('/send-bundle', { body: { to: '201022222222', message: 'السلام عليكم', attachments: ['cv-ar'] } });
  assert.equal(r.status, 200);
  assert.equal(r.body.sent, true);
  assert.equal(r.body.results.length, 2);
  const s = sent();
  assert.deepEqual(s.map((x) => x.type), ['text', 'document']);
  assert.equal(s[1].fileName, 'Mahmoud_ElDesouki_CV_Arabic_2026.pdf');
  assert.equal(s[1].bytes, PDF.length);
});

test('a missing stored file fails before anything is sent', async () => {
  resetSent();
  const r = await call('/send-bundle', { body: { to: '201022222222', message: 'x', attachments: ['cv-ar', 'cv-en'] } });
  assert.equal(r.status, 424);
  assert.match(r.body.error, /CV-English/);
  assert.equal(sent().length, 0);
});

test('unknown stored name and too many items are rejected', async () => {
  assert.equal((await call('/send-bundle', { body: { to: '201022222222', attachments: ['cv-fr'] } })).status, 400);
  const many = Array.from({ length: 10 }, () => ({ fileUrl: 'http://x/ok.pdf' }));
  assert.equal((await call('/send-bundle', { body: { to: '201022222222', message: 'x', attachments: many } })).status, 400);
});

test('the same idempotency key never sends twice', async () => {
  resetSent();
  const body = { to: '201033333333', message: 'once', attachments: ['cv-ar'], idempotencyKey: 'job-1' };
  const a = await call('/send-bundle', { body });
  const b = await call('/send-bundle', { body });
  assert.equal(a.status, 200);
  assert.equal(b.status, 200);
  assert.equal(b.body.duplicate, true);
  assert.equal(sent().length, 2);
  const job = await call('/jobs/job-1', { method: 'GET' });
  assert.equal(job.body.state, 'done');
  assert.equal(job.body.total, 2);
});

test('Idempotency-Key header works for /send', async () => {
  resetSent();
  const opts = { body: { to: '201033333333', message: 'hdr' }, headers: { 'idempotency-key': 'hdr-1' } };
  await call('/send', opts);
  const again = await call('/send', opts);
  assert.equal(again.body.duplicate, true);
  assert.equal(sent().length, 1);
});

test('a retry after a partial failure sends only what is missing', async () => {
  resetSent();
  const port = files.address().port;
  const body = {
    to: '201044444444', message: 'partial', idempotencyKey: 'job-2',
    attachments: [{ fileUrl: `http://127.0.0.1:${port}/ok.pdf`, filename: 'a.pdf' }, { fileUrl: `http://127.0.0.1:${port}/missing.pdf`, filename: 'b.pdf' }],
  };
  const first = await call('/send-bundle', { body });
  assert.equal(first.status, 502);
  assert.equal(first.body.sent, false);
  assert.deepEqual(first.body.results.map((r) => r.ok), [true, true, false]);
  assert.equal((await call('/jobs/job-2', { method: 'GET' })).body.state, 'partial');
  assert.equal(sent().length, 2);

  resetSent();
  body.attachments[1].fileUrl = `http://127.0.0.1:${port}/ok.pdf`;
  const retry = await call('/send-bundle', { body });
  assert.equal(retry.status, 200);
  assert.equal(retry.body.resumed, true);
  assert.deepEqual(sent().map((s) => s.fileName), ['b.pdf']);
});

test('/send-media accepts a stored file and reports its filename', async () => {
  resetSent();
  const r = await call('/send-media', { body: { to: '201055555555', stored: 'cv-ar' } });
  assert.equal(r.status, 200);
  assert.equal(r.body.filename, 'Mahmoud_ElDesouki_CV_Arabic_2026.pdf');
});

test('a number not on WhatsApp is a 404 and nothing is sent', async () => {
  resetSent();
  const r = await call('/send', { body: { to: '999123456789', message: 'x' } });
  assert.equal(r.status, 404);
  assert.match(r.body.error, /not on WhatsApp/);
  assert.equal(sent().length, 0);
});

// ---- dispatcher, queue consumer and MCP, wired to the bridge above ----
const bridgeBinding = { fetch: (req) => worker.fetch(req, env) };
const DISPATCH_TOKEN = 'dispatch-token';

async function workerModule(name) {
  return (await import(join(here, `../workers/${name}/index.js`))).default;
}

test('dispatcher queues a paced batch with idempotency keys, consumer delivers it once', async () => {
  const dispatch = await workerModule('dispatch');
  const consumer = await workerModule('queue-consumer');
  const queued = [];
  const denv = {
    BRIDGE: bridgeBinding, BRIDGE_KEY: KEY,
    DISPATCH_TOKEN_SHA256: createHash('sha256').update(DISPATCH_TOKEN).digest('hex'),
    WA_QUEUE: { sendBatch: async (msgs) => { queued.push(...msgs); } },
  };
  const post = (path, body) => dispatch.fetch(new Request('https://d.test' + path, {
    method: 'POST', headers: { authorization: 'Bearer ' + DISPATCH_TOKEN }, body: JSON.stringify(body),
  }), denv);

  assert.equal((await dispatch.fetch(new Request('https://d.test/send', { method: 'POST', body: '{}' }), denv)).status, 401);

  const r = await post('/send-bundle', { to: '201066666661, 201066666662', message: 'batch', attachments: ['cv-ar'], minDelayMinutes: 3, maxDelayMinutes: 3 });
  const out = await r.json();
  assert.equal(r.status, 200);
  assert.equal(out.count, 2);
  assert.deepEqual(queued.map((m) => m.delaySeconds), [0, 180]);
  assert.equal(queued[0].body.idempotencyKey, `${out.batchId}-1`);

  resetSent();
  const acked = [];
  const deliver = (m) => consumer.queue({ messages: [{ body: m.body, attempts: 1, ack: () => acked.push(m.body.to), retry: () => {} }] }, { BRIDGE: bridgeBinding, BRIDGE_KEY: KEY });
  for (const m of queued) await deliver(m);
  await deliver(queued[0]); // a redelivery must not send again
  assert.equal(sent().length, 4);
  assert.equal(acked.length, 3);

  const st = await (await dispatch.fetch(new Request(`https://d.test/batch/${out.batchId}?count=2`, { headers: { authorization: 'Bearer ' + DISPATCH_TOKEN } }), denv)).json();
  assert.deepEqual(st.tally, { done: 2 });
});

test('dispatcher refuses big inline files in a batch and schedules past 12 hours', async () => {
  const dispatch = await workerModule('dispatch');
  const denv = {
    BRIDGE: bridgeBinding, BRIDGE_KEY: KEY,
    DISPATCH_TOKEN_SHA256: createHash('sha256').update(DISPATCH_TOKEN).digest('hex'),
    WA_QUEUE: { sendBatch: async () => { throw new Error('should not queue'); } },
  };
  const post = (body) => dispatch.fetch(new Request('https://d.test/send-media', {
    method: 'POST', headers: { authorization: 'Bearer ' + DISPATCH_TOKEN }, body: JSON.stringify(body),
  }), denv);
  assert.equal((await post({ to: '201011111111,201022222222', fileBase64: 'A'.repeat(200_000) })).status, 413);
  const thirty = Array.from({ length: 30 }, (_, i) => '2010' + String(10000000 + i)).join(',');
  assert.equal((await post({ to: thirty, stored: 'cv-ar', minDelayMinutes: 30, maxDelayMinutes: 30 })).status, 400);
});

test('dispatcher single send keeps the old /send shape', async () => {
  const dispatch = await workerModule('dispatch');
  const denv = { BRIDGE: bridgeBinding, BRIDGE_KEY: KEY, DISPATCH_TOKEN_SHA256: createHash('sha256').update(DISPATCH_TOKEN).digest('hex') };
  resetSent();
  const r = await dispatch.fetch(new Request('https://d.test/send', {
    method: 'POST', headers: { authorization: 'Bearer ' + DISPATCH_TOKEN }, body: JSON.stringify({ to: '+20 101 777 7777', message: 'direct' }),
  }), denv);
  const b = await r.json();
  assert.equal(r.status, 200);
  assert.equal(b.sent, true);
  assert.match(b.id, /^MSG/);
});

test('MCP send_whatsapp_bundle sends message and CV in one call', async () => {
  const mcp = await workerModule('mcp');
  const rpcCall = async (method, params) => (await (await mcp.fetch(new Request('https://m.test/mcp', {
    method: 'POST', body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  }), { BRIDGE: bridgeBinding })).json()).result;

  const tools = await rpcCall('tools/list');
  assert.ok(tools.tools.some((t) => t.name === 'send_whatsapp_bundle'));
  resetSent();
  const res = await rpcCall('tools/call', { name: 'send_whatsapp_bundle', arguments: { key: KEY, to: '201088888888', message: 'mcp', attachments: [{ stored: 'cv-ar' }], idempotencyKey: 'mcp-1' } });
  assert.equal(res.isError, undefined);
  assert.equal(res.content[0].text, 'sent 2 item(s)');
  const again = await rpcCall('tools/call', { name: 'send_whatsapp_bundle', arguments: { key: KEY, to: '201088888888', message: 'mcp', attachments: [{ stored: 'cv-ar' }], idempotencyKey: 'mcp-1' } });
  assert.match(again.content[0].text, /already sent/);
  assert.equal(sent().length, 2);
  const bad = await rpcCall('tools/call', { name: 'send_whatsapp_bundle', arguments: { key: 'wrong', to: '201088888888', message: 'x' } });
  assert.equal(bad.isError, true);
});
