// KOSIF WhatsApp dispatcher: one recipient is sent now through the bridge, several are
// spread over the paced queue. Every queued send carries an idempotency key, so queue
// retries never deliver the same message twice.
const MAX_RECIPIENTS = 30;
const MAX_QUEUE_DELAY_S = 12 * 60 * 60; // Cloudflare Queues limit per message
const MAX_QUEUED_INLINE_BYTES = 96 * 1024; // queue messages are capped at 128 KB

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });
}
async function sha256Hex(value) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
function safeEqual(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
async function authorized(req, env) {
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  return !!token && safeEqual(await sha256Hex(token), String(env.DISPATCH_TOKEN_SHA256 || '').toLowerCase());
}
const normalizePhone = (v) => String(v || '').replace(/\D/g, '');
const recipientsFrom = (v) => String(v || '').split(/[,;\n]+/).map(normalizePhone).filter(Boolean);
function randomInt(min, max) {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return min + (a[0] % (max - min + 1));
}
function bridge(env, path, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set('authorization', 'Bearer ' + env.BRIDGE_KEY);
  if (init.body) headers.set('content-type', 'application/json');
  return env.BRIDGE.fetch(new Request('https://wa-kosif.internal' + path, { ...init, headers }));
}
async function relay(r) {
  return new Response(await r.text(), { status: r.status, headers: { 'content-type': 'application/json; charset=utf-8' } });
}

// One request shape for everything that gets queued: text first, then attachments.
function bundleOf(path, body) {
  if (path === '/send-bundle') return { message: body.message || '', attachments: body.attachments || [] };
  const file = body.fileUrl || body.fileBase64 || body.stored || body.r2Key;
  if (path === '/send-media' || file) {
    const { fileUrl, fileBase64, stored, r2Key, filename, mimetype } = body;
    return { message: '', attachments: [{ fileUrl, fileBase64, stored, r2Key, filename, mimetype, caption: body.caption || body.message || '' }] };
  }
  return { message: String(body.message || '').trim(), attachments: [] };
}

async function queueBatch(env, path, body, recipients) {
  if (recipients.length > MAX_RECIPIENTS) return json({ error: `maximum ${MAX_RECIPIENTS} recipients per batch` }, 400);
  const bundle = bundleOf(path, body);
  if (!bundle.message && !bundle.attachments.length) return json({ error: 'message or attachments are required' }, 400);
  const inline = bundle.attachments.reduce((n, a) => n + String((a && a.fileBase64) || '').length, 0);
  if (inline > MAX_QUEUED_INLINE_BYTES) {
    return json({ error: 'fileBase64 is too large for a queued batch; use a stored file (e.g. "cv-ar") or fileUrl' }, 413);
  }
  const min = Math.max(1, Math.min(30, Number(body.minDelayMinutes ?? 3) || 3));
  const max = Math.max(min, Math.min(30, Number(body.maxDelayMinutes ?? 10) || 10));
  const batchId = 'b' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  let delaySeconds = 0;
  const messages = [];
  const schedule = [];
  for (let i = 0; i < recipients.length; i++) {
    if (i > 0) delaySeconds += randomInt(min, max) * 60;
    if (delaySeconds > MAX_QUEUE_DELAY_S) {
      return json({ error: 'the schedule would exceed the 12-hour queue limit; send fewer recipients or shorter delays' }, 400);
    }
    const idempotencyKey = `${batchId}-${i + 1}`;
    messages.push({ body: { to: recipients[i], ...bundle, idempotencyKey }, delaySeconds });
    schedule.push({ index: i + 1, idempotencyKey, delayMinutesFromStart: Math.round(delaySeconds / 60) });
  }
  await env.WA_QUEUE.sendBatch(messages);
  return json({ queued: true, batchId, count: recipients.length, minDelayMinutes: min, maxDelayMinutes: max, schedule });
}

// Summary of a queued batch, read from the bridge's job records.
async function batchStatus(env, batchId, count) {
  if (!/^b[a-z0-9]{4,20}$/.test(batchId) || !(count >= 1 && count <= MAX_RECIPIENTS)) return json({ error: 'bad batch id or count' }, 400);
  const jobs = await Promise.all(Array.from({ length: count }, async (_, i) => {
    const key = `${batchId}-${i + 1}`;
    const r = await bridge(env, '/jobs/' + key);
    if (r.status === 404) return { index: i + 1, key, state: 'waiting' };
    const job = await r.json();
    return { index: i + 1, key, state: job.state, to: job.to, at: job.at };
  }));
  const tally = {};
  for (const j of jobs) tally[j.state] = (tally[j.state] || 0) + 1;
  return json({ batchId, count, tally, jobs });
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname === '/') return new Response('KOSIF WhatsApp dispatcher online\n');

    // Private service-binding entry point used only by the queue consumer.
    if (url.hostname === 'wa-kosif-dispatch.internal' && url.pathname === '/internal-bundle' && req.method === 'POST') {
      let body;
      try { body = await req.json(); } catch { return json({ error: 'invalid JSON' }, 400); }
      const to = normalizePhone(body.to);
      if (!to) return json({ error: 'to is required' }, 400);
      return relay(await bridge(env, '/send-bundle', { method: 'POST', body: JSON.stringify({ ...body, to }) }));
    }

    if (!(await authorized(req, env))) return json({ error: 'unauthorized' }, 401);

    const batch = url.pathname.match(/^\/batch\/([^/]+)$/);
    if (batch && req.method === 'GET') return batchStatus(env, batch[1], Number(url.searchParams.get('count')));
    const job = url.pathname.match(/^\/jobs\/([^/]+)$/);
    if (job && req.method === 'GET') return relay(await bridge(env, '/jobs/' + job[1]));

    if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);
    if (!['/send', '/send-media', '/send-bundle'].includes(url.pathname)) return json({ error: 'not found' }, 404);
    let body;
    try { body = await req.json(); } catch { return json({ error: 'invalid JSON' }, 400); }
    const recipients = recipientsFrom(body.to);
    if (!recipients.length) return json({ error: 'to is required' }, 400);
    if (recipients.length > 1) return queueBatch(env, url.pathname, body, recipients);

    const bundle = bundleOf(url.pathname, body);
    const out = { to: recipients[0], ...bundle, idempotencyKey: body.idempotencyKey };
    if (url.pathname === '/send-bundle') return relay(await bridge(env, '/send-bundle', { method: 'POST', body: JSON.stringify(out) }));
    // Keep the original single-send response shapes for existing callers.
    if (!bundle.attachments.length) {
      if (!bundle.message) return json({ error: 'message is required' }, 400);
      return relay(await bridge(env, '/send', { method: 'POST', body: JSON.stringify({ to: out.to, message: out.message, idempotencyKey: out.idempotencyKey }) }));
    }
    return relay(await bridge(env, '/send-media', { method: 'POST', body: JSON.stringify({ to: out.to, ...bundle.attachments[0], idempotencyKey: out.idempotencyKey }) }));
  },
};
