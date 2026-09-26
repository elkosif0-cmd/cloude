// KOSIF WhatsApp MCP v1.3 — receipt-aware transport semantics.
// IMPORTANT: a successful Baileys send is ACCEPTED, not delivered. Delivered/read
// are reported only after receipt reconciliation in the bridge.
const VERSION = '1.3.0';
const PUBLIC_BRIDGE = 'https://wa-kosif.kosif199022.workers.dev';
const STORED = ['cv-ar', 'cv-en'];

function rpc(id, result) {
  return new Response(JSON.stringify({ jsonrpc: '2.0', id, result }), { headers: { 'content-type': 'application/json; charset=utf-8' } });
}
function err(id, code, message) {
  return new Response(JSON.stringify({ jsonrpc: '2.0', id: id ?? null, error: { code, message } }), { headers: { 'content-type': 'application/json; charset=utf-8' } });
}
function toolText(text, isError = false, structuredContent) {
  return { content: [{ type: 'text', text }], ...(structuredContent ? { structuredContent } : {}), ...(isError ? { isError: true } : {}) };
}
function normalizeTo(value) {
  const raw = String(value ?? '').trim();
  if (/^[0-9-]+@g\.us$/.test(raw)) return raw;
  let digits = raw
    .replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 1632))
    .replace(/[۰-۹]/g, (c) => String(c.charCodeAt(0) - 1776));
  if (!/^[+0-9 ()-]+$/.test(digits)) throw new Error('INVALID_RECIPIENT');
  digits = digits.replace(/[^0-9]/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (/^05[0-9]{8}$/.test(digits)) digits = '966' + digits.slice(1);
  if (!/^[1-9][0-9]{7,14}$/.test(digits)) throw new Error('INVALID_RECIPIENT');
  return digits;
}
async function callBridge(env, path, key, init = {}) {
  const effectiveKey = (typeof key === 'string' && key) ? key : env.BRIDGE_KEY;
  if (!effectiveKey || typeof effectiveKey !== 'string') throw new Error('BRIDGE_KEY_REQUIRED');
  const headers = new Headers(init.headers || {});
  headers.set('authorization', 'Bearer ' + effectiveKey);
  if (init.body) headers.set('content-type', 'application/json');
  const req = new Request((env.BRIDGE ? 'https://wa-kosif.internal' : PUBLIC_BRIDGE) + path, {
    ...init, headers, signal: AbortSignal.timeout(60000),
  });
  return env.BRIDGE ? env.BRIDGE.fetch(req) : fetch(req);
}
async function bodyOf(r) {
  const text = await r.text();
  try { return JSON.parse(text); } catch { return { error: text }; }
}
const post = (env, path, key, body) => callBridge(env, path, key, { method: 'POST', body: JSON.stringify(body) });

const keyProp = { type: 'string', description: 'Private bridge key; normally supplied by the MCP Worker secret.' };
const toProp = { type: 'string', description: 'Recipient phone in international format, or a WhatsApp group id ending in @g.us.' };
const idemProp = {
  type: 'string',
  minLength: 1,
  maxLength: 128,
  description: 'Required for immediate sends. Reuse the same key only when retrying the same exact payload.',
};
const fileProps = {
  stored: { type: 'string', enum: STORED, description: 'Reusable R2 file alias: cv-ar or cv-en.' },
  fileUrl: { type: 'string', description: 'HTTPS file URL. Prefer stored R2 files for repeated documents.' },
  fileBase64: { type: 'string', description: 'Compatibility path for Base64 file bytes; avoid for large production files.' },
  filename: { type: 'string', description: 'File name, e.g. CV.pdf.' },
  mimetype: { type: 'string', description: 'MIME type, e.g. application/pdf.' },
  caption: { type: 'string', description: 'Optional caption.' },
  asDocument: { type: 'boolean', description: 'Force sending as a document.' },
};
const schema = (properties, required = []) => {
  const p = { ...properties };
  delete p.key;
  return { type: 'object', properties: p, required: required.filter((x) => x !== 'key'), additionalProperties: false };
};

const TOOLS = [
  {
    name: 'pair_whatsapp',
    description: 'Link WhatsApp using QR or a phone pairing code. Completion requires the account owner in WhatsApp.',
    inputSchema: schema({
      key: keyProp,
      method: { type: 'string', enum: ['qr', 'code'] },
      phone: { type: 'string', description: 'Account phone number; required for code pairing.' },
    }, ['key', 'method']),
  },
  {
    name: 'send_whatsapp_bundle',
    description: 'Send one message plus files to one recipient. A successful result means ACCEPTED by transport, not delivered/read.',
    inputSchema: schema({
      key: keyProp, to: toProp,
      message: { type: 'string', description: 'Optional text sent first.' },
      attachments: { type: 'array', maxItems: 9, items: schema(fileProps) },
      idempotencyKey: idemProp,
    }, ['key', 'to', 'idempotencyKey']),
  },
  {
    name: 'send_whatsapp_message',
    description: 'Send one WhatsApp text message immediately. Success means ACCEPTED; query the delivery report for delivered/read.',
    inputSchema: schema({
      key: keyProp, to: toProp,
      message: { type: 'string', minLength: 1, description: 'Exact text to send.' },
      idempotencyKey: idemProp,
    }, ['key', 'to', 'message', 'idempotencyKey']),
  },
  {
    name: 'send_whatsapp_file',
    description: 'Send one image, PDF, or file. Success means ACCEPTED; use the delivery report for receipt-confirmed status.',
    inputSchema: schema({ key: keyProp, to: toProp, ...fileProps, idempotencyKey: idemProp }, ['key', 'to', 'idempotencyKey']),
  },
  {
    name: 'list_whatsapp_messages',
    description: 'Read received WhatsApp messages, newest first.',
    inputSchema: schema({
      key: keyProp,
      from: { type: 'string', description: 'Only messages from this phone number.' },
      chat: { type: 'string', description: 'Only messages in this chat/group id.' },
      limit: { type: 'integer', minimum: 1, maximum: 200 },
      sync: { type: 'boolean', description: 'true connects first; false reads durable cache only.' },
    }, ['key']),
  },
  {
    name: 'list_whatsapp_groups',
    description: 'List WhatsApp groups for the linked account.',
    inputSchema: schema({ key: keyProp }, ['key']),
  },
  {
    name: 'resolve_whatsapp_recipient',
    description: 'Safely search known contacts/groups and return candidates without sending anything.',
    inputSchema: schema({
      key: keyProp,
      query: { type: 'string', minLength: 1, description: 'Name, phone digits, or group-name fragment.' },
      includeGroups: { type: 'boolean', description: 'Default true.' },
    }, ['key', 'query']),
  },
  {
    name: 'schedule_whatsapp_message',
    description: 'Schedule a future WhatsApp text message. The task remains queryable after execution.',
    inputSchema: schema({ key: keyProp, to: toProp, message: { type: 'string', minLength: 1 }, at: { type: 'string', description: 'ISO-8601 with timezone.' } }, ['key', 'to', 'message', 'at']),
  },
  {
    name: 'schedule_whatsapp_bundle',
    description: 'Schedule a message together with files such as the Arabic/English CV PDFs.',
    inputSchema: schema({
      key: keyProp, to: toProp,
      message: { type: 'string' },
      attachments: { type: 'array', maxItems: 9, items: schema(fileProps) },
      at: { type: 'string', description: 'ISO-8601 with timezone.' },
    }, ['key', 'to', 'at']),
  },
  {
    name: 'list_whatsapp_schedule',
    description: 'List WhatsApp jobs still waiting for their scheduled execution time.',
    inputSchema: schema({ key: keyProp }, ['key']),
  },
  {
    name: 'get_whatsapp_delivery_report',
    description: 'Unified receipt-aware report. accepted is not delivered; delivered/read require provider receipt evidence.',
    inputSchema: schema({
      key: keyProp,
      status: { type: 'string', enum: ['all','scheduled','sending','accepted','delivered','read','partial','failed','cancelled'] },
      limit: { type: 'integer', minimum: 1, maximum: 1000 },
    }, ['key']),
  },
  {
    name: 'diagnose_whatsapp_bridge',
    description: 'Run a non-destructive self-test of session, receipt channel, durable state and stored R2 CV integrity. Sends no WhatsApp message.',
    inputSchema: schema({ key: keyProp }, ['key']),
  },
  {
    name: 'get_whatsapp_job',
    description: 'Check the transport/idempotency job by key. A done job means accepted by transport, not receipt-confirmed delivery.',
    inputSchema: schema({ key: keyProp, jobKey: { type: 'string' } }, ['key', 'jobKey']),
  },
  {
    name: 'get_whatsapp_status',
    description: 'Check the WhatsApp connection when explicitly requested or after a connection error.',
    inputSchema: schema({ key: keyProp }, ['key']),
  },
];

function sendResult(r, b) {
  const accepted = r.ok && (b.accepted === true || b.sent === true);
  const data = { ...b, httpStatus: r.status };
  data.status = accepted ? 'accepted' : r.status === 202 ? 'queued' : 'failed';
  data.deliveryStatus = b.deliveryStatus || (accepted ? 'accepted' : data.status);
  if (b.id) data.messageId = b.id;
  data.messageIds = (b.results || []).filter((x) => x.ok && x.id).map((x) => x.id);
  const label = accepted
    ? (b.duplicate ? 'already accepted earlier (not sent again)' : 'accepted by WhatsApp transport; delivery/read are not yet confirmed')
    : (b.error || 'send failed');
  return toolText(label + '\n' + JSON.stringify(data), !r.ok || !accepted, data);
}
const fmtTime = (ms) => new Date(ms).toISOString().replace('T', ' ').slice(0, 16);

async function callTool(env, name, a) {
  const to = a.to === undefined ? undefined : normalizeTo(a.to);

  if (name === 'pair_whatsapp') {
    if (a.method === 'code') {
      if (!a.phone) return toolText('Phone is required for code pairing.', true);
      const r = await post(env, '/pair/code', a.key, { phone: String(a.phone) });
      const b = await bodyOf(r);
      return toolText(JSON.stringify(b), !r.ok, b);
    }
    const r = await callBridge(env, '/pair/qr', a.key);
    const b = await bodyOf(r);
    return toolText(JSON.stringify(b), !r.ok, b);
  }

  if (name === 'send_whatsapp_bundle') {
    const message = String(a.message || '').trim();
    const attachments = Array.isArray(a.attachments) ? a.attachments : [];
    if (!to || (!message && !attachments.length) || !a.idempotencyKey) return toolText('Missing recipient/content/idempotencyKey.', true);
    const r = await post(env, '/send-bundle', a.key, { to, message, attachments, idempotencyKey: a.idempotencyKey });
    return sendResult(r, await bodyOf(r));
  }
  if (name === 'send_whatsapp_message') {
    const message = String(a.message || '').trim();
    if (!to || !message || !a.idempotencyKey) return toolText('Missing recipient/message/idempotencyKey.', true);
    const r = await post(env, '/send', a.key, { to, message, idempotencyKey: a.idempotencyKey });
    return sendResult(r, await bodyOf(r));
  }
  if (name === 'send_whatsapp_file') {
    if (!to || (!a.stored && !a.fileUrl && !a.fileBase64) || !a.idempotencyKey) return toolText('Missing recipient/file/idempotencyKey.', true);
    const { stored, fileUrl, fileBase64, filename, mimetype, caption, asDocument, idempotencyKey } = a;
    const r = await post(env, '/send-media', a.key, { to, stored, fileUrl, fileBase64, filename, mimetype, caption: caption || '', asDocument, idempotencyKey });
    return sendResult(r, await bodyOf(r));
  }
  if (name === 'list_whatsapp_messages') {
    const q = new URLSearchParams({ limit: String(a.limit || 30), sync: a.sync === false ? '0' : '1' });
    if (a.from) q.set('from', normalizeTo(a.from));
    if (a.chat) q.set('chat', String(a.chat));
    const r = await callBridge(env, '/messages?' + q, a.key);
    const b = await bodyOf(r);
    if (!r.ok) return toolText(b.error || 'failed to read messages', true);
    if (!b.messages?.length) return toolText('no messages');
    const lines = b.messages.map((m) => `[${fmtTime(m.timestamp)}] ${m.name || m.phone || m.sender}${m.group ? ` (group ${m.chat})` : ''}: ${m.type === 'text' ? m.text : `<${m.type}> ${m.text}`.trim()}`);
    return toolText(lines.join('\n'), false, b);
  }
  if (name === 'list_whatsapp_groups') {
    const r = await callBridge(env, '/groups', a.key);
    const b = await bodyOf(r);
    if (!r.ok) return toolText(b.error || 'failed to list groups', true);
    return toolText((b.groups || []).map((g) => `${g.name} — ${g.id} (${g.participants})`).join('\n') || 'no groups', false, b);
  }
  if (name === 'resolve_whatsapp_recipient') {
    const needle = String(a.query || '').trim().toLowerCase();
    if (!needle) return toolText('query is required', true);
    const digits = needle.replace(/\D/g, '');
    const cr = await callBridge(env, '/contacts', a.key);
    const contacts = cr.ok ? (await bodyOf(cr)).contacts || [] : [];
    let groups = [];
    if (a.includeGroups !== false) {
      const gr = await callBridge(env, '/groups', a.key);
      groups = gr.ok ? (await bodyOf(gr)).groups || [] : [];
    }
    const contactMatches = contacts.filter((c) =>
      String(c.name || '').toLowerCase().includes(needle) ||
      (!!digits && String(c.phone || '').includes(digits))
    ).slice(0, 20);
    const groupMatches = groups.filter((g) => String(g.name || '').toLowerCase().includes(needle)).slice(0, 20);
    const data = { query: a.query, contacts: contactMatches, groups: groupMatches, requiresConfirmation: contactMatches.length + groupMatches.length !== 1 };
    return toolText(JSON.stringify(data), false, data);
  }
  if (name === 'schedule_whatsapp_message') {
    if (!to || !String(a.message || '').trim() || !a.at) return toolText('Missing recipient, message or time.', true);
    const r = await post(env, '/schedule', a.key, { to, message: String(a.message).trim(), at: a.at });
    const b = await bodyOf(r);
    return toolText(JSON.stringify(b), !r.ok, b);
  }
  if (name === 'schedule_whatsapp_bundle') {
    const message = String(a.message || '').trim();
    const attachments = Array.isArray(a.attachments) ? a.attachments : [];
    if (!to || (!message && !attachments.length) || !a.at) return toolText('Missing recipient/content/time.', true);
    const r = await post(env, '/schedule', a.key, { to, message, attachments, at: a.at });
    const b = await bodyOf(r);
    return toolText(JSON.stringify(b), !r.ok, b);
  }
  if (name === 'list_whatsapp_schedule') {
    const r = await callBridge(env, '/schedule', a.key);
    const b = await bodyOf(r);
    return toolText(JSON.stringify(b), !r.ok, b);
  }
  if (name === 'get_whatsapp_delivery_report') {
    const q = new URLSearchParams({ limit: String(a.limit || 200) });
    if (a.status && a.status !== 'all') q.set('status', a.status);
    const r = await callBridge(env, '/delivery-report?' + q, a.key);
    const b = await bodyOf(r);
    return toolText(JSON.stringify(b), !r.ok, b);
  }
  if (name === 'diagnose_whatsapp_bridge') {
    const r = await callBridge(env, '/diagnostics', a.key);
    const b = await bodyOf(r);
    return toolText(JSON.stringify(b), !r.ok || b.ok === false, b);
  }
  if (name === 'get_whatsapp_job') {
    const r = await callBridge(env, '/jobs/' + encodeURIComponent(String(a.jobKey || '')), a.key);
    const b = await bodyOf(r);
    return toolText(JSON.stringify(b), !r.ok, b);
  }
  if (name === 'get_whatsapp_status') {
    const r = await callBridge(env, '/status', a.key);
    const b = await bodyOf(r);
    return toolText(JSON.stringify(b), !r.ok, b);
  }
  return null;
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname === '/') return new Response('KOSIF WhatsApp MCP online\n');
    if (url.pathname !== '/mcp') return new Response('Not found', { status: 404 });
    if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

    let msg;
    try { msg = await req.json(); } catch { return err(null, -32700, 'Parse error'); }
    const id = msg.id;
    if (msg.method === 'initialize') {
      return rpc(id, { protocolVersion: msg.params?.protocolVersion || '2025-06-18', capabilities: { tools: {} }, serverInfo: { name: 'kosif-whatsapp', version: VERSION } });
    }
    if (msg.method === 'notifications/initialized') return new Response(null, { status: 202 });
    if (msg.method === 'ping') return rpc(id, {});
    if (msg.method === 'tools/list') return rpc(id, { tools: TOOLS });
    if (msg.method === 'tools/call') {
      try {
        const result = await callTool(env, msg.params?.name, msg.params?.arguments || {});
        return result ? rpc(id, result) : err(id, -32602, 'Unknown tool');
      } catch (e) {
        const message = e?.message === 'BRIDGE_KEY_REQUIRED' ? 'Bridge key is required.' : (e?.message || 'Request failed.');
        return rpc(id, toolText(message, true));
      }
    }
    return err(id, -32601, 'Method not found');
  },
};
