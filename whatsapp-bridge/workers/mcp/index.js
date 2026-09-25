// MCP server for the KOSIF WhatsApp plugin. The caller passes the bridge key per call.
const VERSION = '0.4.0';
const PUBLIC_BRIDGE = 'https://wa-kosif.kosif199022.workers.dev';
const STORED = ['cv-ar', 'cv-en'];

function rpc(id, result) {
  return new Response(JSON.stringify({ jsonrpc: '2.0', id, result }), { headers: { 'content-type': 'application/json; charset=utf-8' } });
}
function err(id, code, message) {
  return new Response(JSON.stringify({ jsonrpc: '2.0', id: id ?? null, error: { code, message } }), { headers: { 'content-type': 'application/json; charset=utf-8' } });
}
function toolText(text, isError = false) {
  return { content: [{ type: 'text', text }], ...(isError ? { isError: true } : {}) };
}
const normalizePhone = (v) => String(v || '').replace(/\D/g, '');

async function callBridge(env, path, key, init = {}) {
  if (!key || typeof key !== 'string') throw new Error('BRIDGE_KEY_REQUIRED');
  const headers = new Headers(init.headers || {});
  headers.set('authorization', 'Bearer ' + key);
  if (init.body) headers.set('content-type', 'application/json');
  const req = new Request((env.BRIDGE ? 'https://wa-kosif.internal' : PUBLIC_BRIDGE) + path, { ...init, headers });
  return env.BRIDGE ? env.BRIDGE.fetch(req) : fetch(req);
}
async function bodyOf(r) {
  const text = await r.text();
  try { return JSON.parse(text); } catch { return { error: text }; }
}

const keyProp = { type: 'string', description: 'Private KOSIF WhatsApp bridge key.' };
const toProp = { type: 'string', description: 'Recipient phone in international format.' };
const idemProp = { type: 'string', description: 'Optional. Reusing the same key never sends the same item twice.' };
const fileProps = {
  stored: { type: 'string', enum: STORED, description: 'A file already stored on the bridge: cv-ar (Arabic CV) or cv-en (English CV).' },
  fileUrl: { type: 'string', description: 'HTTPS URL for the file.' },
  fileBase64: { type: 'string', description: 'Base64-encoded file bytes.' },
  filename: { type: 'string', description: 'File name, e.g. CV.pdf.' },
  mimetype: { type: 'string', description: 'MIME type, e.g. application/pdf or image/jpeg.' },
  caption: { type: 'string', description: 'Optional caption.' },
};

const TOOLS = [
  {
    name: 'send_whatsapp_bundle',
    description: 'Fastest way to send a message together with files (for example a message plus both CVs) to one recipient: one call, sent in order. Prefer this over separate message and file calls.',
    inputSchema: { type: 'object', properties: {
      key: keyProp, to: toProp,
      message: { type: 'string', description: 'Text sent first.' },
      attachments: { type: 'array', maxItems: 9, items: { type: 'object', properties: fileProps, additionalProperties: false } },
      idempotencyKey: idemProp,
    }, required: ['key', 'to'], additionalProperties: false },
  },
  {
    name: 'send_whatsapp_message',
    description: 'Send one WhatsApp text message immediately. Do not run a separate status check first.',
    inputSchema: { type: 'object', properties: {
      key: keyProp, to: toProp,
      message: { type: 'string', minLength: 1, description: 'Exact text to send.' },
      idempotencyKey: idemProp,
    }, required: ['key', 'to', 'message'], additionalProperties: false },
  },
  {
    name: 'send_whatsapp_file',
    description: 'Send one image, PDF, or other file immediately. Use stored for the CVs, fileUrl when available, otherwise fileBase64.',
    inputSchema: { type: 'object', properties: { key: keyProp, to: toProp, ...fileProps, idempotencyKey: idemProp }, required: ['key', 'to'], additionalProperties: false },
  },
  {
    name: 'get_whatsapp_job',
    description: 'Delivery result for an idempotency key (including queued batch keys like b123abc-1).',
    inputSchema: { type: 'object', properties: { key: keyProp, jobKey: { type: 'string' } }, required: ['key', 'jobKey'], additionalProperties: false },
  },
  {
    name: 'get_whatsapp_status',
    description: 'Check WhatsApp connection only when the user explicitly asks for status.',
    inputSchema: { type: 'object', properties: { key: keyProp }, required: ['key'], additionalProperties: false },
  },
];

function bundleSummary(r, b) {
  if (r.ok && b.sent) return toolText(b.duplicate ? 'already sent earlier (not sent again)' : `sent ${b.results.length} item(s)`);
  const done = (b.results || []).filter((x) => x.ok).length;
  const failed = (b.results || []).find((x) => !x.ok);
  return toolText(`not fully sent: ${done} item(s) delivered; error: ${b.error || failed?.error || 'send failed'}`, true);
}

async function callTool(env, name, a) {
  if (name === 'send_whatsapp_bundle') {
    const to = normalizePhone(a.to);
    const message = String(a.message || '').trim();
    const attachments = Array.isArray(a.attachments) ? a.attachments : [];
    if (!to || (!message && !attachments.length)) return toolText('Missing recipient, or both message and attachments.', true);
    const r = await callBridge(env, '/send-bundle', a.key, { method: 'POST', body: JSON.stringify({ to, message, attachments, idempotencyKey: a.idempotencyKey }) });
    return bundleSummary(r, await bodyOf(r));
  }
  if (name === 'send_whatsapp_message') {
    const to = normalizePhone(a.to), message = String(a.message || '').trim();
    if (!to || !message) return toolText('Missing recipient or message.', true);
    const r = await callBridge(env, '/send', a.key, { method: 'POST', body: JSON.stringify({ to, message, idempotencyKey: a.idempotencyKey }) });
    const b = await bodyOf(r);
    return toolText(r.ok ? (b.duplicate ? 'already sent earlier (not sent again)' : 'sent') : (b.error || 'send failed'), !r.ok);
  }
  if (name === 'send_whatsapp_file') {
    const to = normalizePhone(a.to);
    if (!to || (!a.stored && !a.fileUrl && !a.fileBase64)) return toolText('Missing recipient or file.', true);
    const { stored, fileUrl, fileBase64, filename, mimetype, caption, idempotencyKey } = a;
    const r = await callBridge(env, '/send-media', a.key, { method: 'POST', body: JSON.stringify({ to, stored, fileUrl, fileBase64, filename, mimetype, caption: caption || '', idempotencyKey }) });
    const b = await bodyOf(r);
    return toolText(r.ok ? (b.duplicate ? 'already sent earlier (not sent again)' : 'sent') : (b.error || 'send failed'), !r.ok);
  }
  if (name === 'get_whatsapp_job') {
    const r = await callBridge(env, '/jobs/' + encodeURIComponent(String(a.jobKey || '')), a.key);
    return toolText(await r.text(), !r.ok);
  }
  if (name === 'get_whatsapp_status') {
    const r = await callBridge(env, '/status', a.key);
    return toolText(await r.text(), !r.ok);
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
        return rpc(id, toolText(e?.message === 'BRIDGE_KEY_REQUIRED' ? 'Bridge key is required.' : 'Request failed.', true));
      }
    }
    return err(id, -32601, 'Method not found');
  },
};
