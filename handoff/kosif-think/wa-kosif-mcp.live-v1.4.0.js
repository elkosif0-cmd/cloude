--eb32796adf28cb50b82ce62ae3eacc60189b76aa5ddb623ef0c0dd8cf0ca
Content-Disposition: form-data; name="worker.js"

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// index.js
var VERSION = "1.4.0";
var PUBLIC_BRIDGE = "https://wa-kosif.kosif199022.workers.dev";

// KOSIF THINK MOBILE BRIDGE v2 - adaptive router
const KOSIF_THINK_MCP = "https://kosif-think-mcp.kosif199022.workers.dev/mcp";
const KOSIF_THINK_ALLOWED = new Set([
  "kosif_preflight","kosif_route","kosif_council","kosif_verify_evidence",
  "kosif_auto","kosif_self_test","kosif_diagnostics","kosif_compare_candidates","kosif_think_status","kosif_think","kosif_agent"
]);
async function callKosifThinkRpc(method, params = {}) {
  const id = crypto.randomUUID();
  const response = await fetch(KOSIF_THINK_MCP, {
    method: "POST",
    headers: { "content-type": "application/json", "accept": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
    signal: AbortSignal.timeout(120000)
  });
  const raw = await response.text();
  let payload;
  try { payload = JSON.parse(raw); }
  catch { return toolText(JSON.stringify({ error: "KOSIF_THINK_BAD_RESPONSE", httpStatus: response.status }), true); }
  if (!response.ok || payload?.error) {
    return toolText(JSON.stringify({ error: "KOSIF_THINK_CALL_FAILED", httpStatus: response.status, detail: payload?.error || null }), true);
  }
  return payload?.result;
}
async function callKosifThinkTool(toolName, args = {}) {
  if (!KOSIF_THINK_ALLOWED.has(toolName)) return toolText("KOSIF_THINK_TOOL_NOT_ALLOWED", true);
  const result = await callKosifThinkRpc("tools/call", { name: toolName, arguments: args || {} });
  return result || toolText("KOSIF_THINK_EMPTY_RESULT", true);
}

var STORED = ["cv-ar", "cv-en"];
function rpc(id, result) {
  return new Response(JSON.stringify({ jsonrpc: "2.0", id, result }), { headers: { "content-type": "application/json; charset=utf-8" } });
}
__name(rpc, "rpc");
function err(id, code, message) {
  return new Response(JSON.stringify({ jsonrpc: "2.0", id: id ?? null, error: { code, message } }), { headers: { "content-type": "application/json; charset=utf-8" } });
}
__name(err, "err");
function toolText(text, isError = false) {
  return { content: [{ type: "text", text }], ...isError ? { isError: true } : {} };
}
__name(toolText, "toolText");
export function normalizeTo(value) {
  const raw = String(value ?? '').trim();
  if (/^[0-9-]+@g\.us$/.test(raw)) return raw;
  let digits = raw.replace(/[٠-٩]/g, c => String(c.charCodeAt(0) - 1632)).replace(/[۰-۹]/g, c => String(c.charCodeAt(0) - 1776));
  if (!/^[+0-9 ()-]+$/.test(digits)) throw new Error('INVALID_RECIPIENT');
  digits = digits.replace(/[^0-9]/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (/^05[0-9]{8}$/.test(digits)) digits = '966' + digits.slice(1);
  if (!/^[1-9][0-9]{7,14}$/.test(digits)) throw new Error('INVALID_RECIPIENT');
  return digits;
}
function normalizeRecipientInput(value) {
  const raw = String(value ?? "").normalize("NFKC").trim().replace(/\s+/g, " ");
  if (!raw) throw new Error("INVALID_RECIPIENT");
  try { return normalizeTo(raw); } catch (e) {
    if (e?.message !== "INVALID_RECIPIENT") throw e;
    if (raw.length > 80) throw e;
    return raw;
  }
}
__name(normalizeRecipientInput, "normalizeRecipientInput");
async function callBridge(env, path, key, init = {}) {
  const effectiveKey = (typeof key === "string" && key) ? key : env.BRIDGE_KEY;
  if (!effectiveKey || typeof effectiveKey !== "string") throw new Error("BRIDGE_KEY_REQUIRED");
  const headers = new Headers(init.headers || {});
  headers.set("authorization", "Bearer " + effectiveKey);
  if (init.body) headers.set("content-type", "application/json");
  const req = new Request((env.BRIDGE ? "https://wa-kosif.internal" : PUBLIC_BRIDGE) + path, { ...init, headers, signal: AbortSignal.timeout(60000) });
  return env.BRIDGE ? env.BRIDGE.fetch(req) : fetch(req);
}
__name(callBridge, "callBridge");
async function bodyOf(r) {
  const text = await r.text();
  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}
__name(bodyOf, "bodyOf");
var post = /* @__PURE__ */ __name((env, path, key, body) => callBridge(env, path, key, { method: "POST", body: JSON.stringify(body) }), "post");
var keyProp = { type: "string", description: "Private KOSIF WhatsApp bridge key." };
var toProp = { type: "string", description: "Recipient phone/group id, or a saved KOSIF contact alias such as أحمد المدير." };
var idemProp = { type: "string", description: "Required for sending. Reuse the same key for retries of this operation; use a fresh key for a new send. Delivery after an uncertain timeout must be checked before retrying." };
var fileProps = {
  stored: { type: "string", enum: STORED, description: "A file already stored on the bridge: cv-ar (Arabic CV) or cv-en (English CV)." },
  fileUrl: { type: "string", description: "HTTPS URL of the file." },
  fileBase64: { type: "string", description: "Base64-encoded file bytes." },
  filename: { type: "string", description: "File name, e.g. CV.pdf." },
  mimetype: { type: "string", description: "MIME type, e.g. application/pdf or image/jpeg." },
  caption: { type: "string", description: "Optional caption." }
};
var schema = /* @__PURE__ */ __name((properties, required) => { const p = { ...properties }; delete p.key; return { type: "object", properties: p, required: (required || []).filter((x) => x !== "key"), additionalProperties: false }; }, "schema");
var TOOLS = [

  {
    name: "kosif_mobile_think",
    description: "Run the real KOSIF Think engine from mobile/iPhone through the KOSIF WhatsApp mobile bridge. Use this as the first substantive step when the user explicitly invokes KOSIF Think on mobile.",
    inputSchema: schema({
      question: { type: "string", minLength: 1 },
      context: { type: "string" },
      options: { type: "object", additionalProperties: { type: "string" } },
      mode: { type: "string", enum: ["auto","fast","council","deep"], description: "Default auto uses KOSIF adaptive routing." }
    }, ["question"])
  },
  {
    name: "kosif_mobile_capabilities",
    description: "Fetch the live KOSIF Think MCP tool catalog and schemas from the cloud. Use before an advanced mobile bridge call when you need the exact current arguments.",
    inputSchema: schema({}, [])
  },
  {
    name: "kosif_mobile_call",
    description: "Call an advanced KOSIF Think tool from mobile. Includes adaptive routing, self-test, diagnostics, preflight, route, evidence, council and frontier tools. Use kosif_mobile_capabilities first if argument schema is uncertain.",
    inputSchema: schema({
      tool: { type: "string", enum: ["kosif_auto","kosif_self_test","kosif_diagnostics","kosif_preflight","kosif_route","kosif_council","kosif_verify_evidence","kosif_compare_candidates","kosif_think_status","kosif_think","kosif_agent"] },
      arguments: { type: "object", additionalProperties: true }
    }, ["tool"])
  },

  { name: 'pair_whatsapp', description: 'Link WhatsApp using a QR or phone pairing code. QR/code completion requires the account owner in WhatsApp.', inputSchema: schema({ key: keyProp, method: {type: 'string', enum: ['qr','code']}, phone: {type:'string', description:'Account phone, required for code pairing.'} }, ['key','method']) },
  {
    name: "send_whatsapp_bundle",
    description: "Send a message together with files (for example a message plus both CVs) to one recipient: one call, delivered in order. Prefer this over separate message and file calls.",
    inputSchema: schema({
      key: keyProp,
      to: toProp,
      message: { type: "string", description: "Text sent first." },
      attachments: { type: "array", maxItems: 9, items: schema(fileProps, []) },
      idempotencyKey: idemProp
    }, ["key", "to", "idempotencyKey"])
  },
  {
    name: "send_whatsapp_message",
    description: "Send one WhatsApp text message immediately. Do not run a separate status check first.",
    inputSchema: schema({ key: keyProp, to: toProp, message: { type: "string", minLength: 1, description: "Exact text to send." }, idempotencyKey: idemProp }, ["key", "to", "message", "idempotencyKey"])
  },
  {
    name: "send_whatsapp_file",
    description: "Send one image, PDF, or other file immediately. Use stored for the CVs, fileUrl when available, otherwise fileBase64.",
    inputSchema: schema({ key: keyProp, to: toProp, ...fileProps, idempotencyKey: idemProp }, ["key", "to", "idempotencyKey"])
  },
  {
    name: "list_whatsapp_messages",
    description: "Read messages received on WhatsApp, newest first. Use when the user asks what someone sent or wants to reply to a message.",
    inputSchema: schema({
      key: keyProp,
      from: { type: "string", description: "Only messages from this phone number (optional)." },
      chat: { type: "string", description: "Only messages in this chat or group id (optional)." },
      limit: { type: "integer", minimum: 1, maximum: 200, description: "Default 30." },
      sync: { type: "boolean", description: "true (default) connects to WhatsApp first to fetch new messages; false reads the cache instantly." }
    }, ["key"])
  },
  {
    name: "list_whatsapp_groups",
    description: "Groups the linked number is a member of, with the id to use as a recipient.",
    inputSchema: schema({ key: keyProp }, ["key"])
  },
  {
    name: "save_whatsapp_contact",
    description: "Save or update a private KOSIF contact alias so future sends can use the saved name instead of the phone number.",
    inputSchema: schema({ key: keyProp, name: { type: "string", minLength: 1, maxLength: 80, description: "Saved name/alias." }, to: { type: "string", description: "WhatsApp phone number in international format, or a group id." } }, ["key", "name", "to"])
  },
  {
    name: "list_saved_whatsapp_contacts",
    description: "List private KOSIF saved contact aliases.",
    inputSchema: schema({ key: keyProp }, ["key"])
  },
  {
    name: "resolve_whatsapp_recipient",
    description: "Resolve a saved KOSIF contact alias to its WhatsApp recipient.",
    inputSchema: schema({ key: keyProp, name: { type: "string", minLength: 1, maxLength: 80 } }, ["key", "name"])
  },
  {
    name: "delete_saved_whatsapp_contact",
    description: "Delete a saved KOSIF contact alias.",
    inputSchema: schema({ key: keyProp, name: { type: "string", minLength: 1, maxLength: 80 } }, ["key", "name"])
  },
  {
    name: "schedule_whatsapp_message",
    description: "Send a text message at a future time (ISO-8601 with timezone).",
    inputSchema: schema({ key: keyProp, to: toProp, message: { type: "string", minLength: 1 }, at: { type: "string", description: "e.g. 2026-10-01T09:00:00+03:00" } }, ["key", "to", "message", "at"])
  },
  {
    name: "schedule_whatsapp_bundle",
    description: "Schedule a future WhatsApp message together with files such as the Arabic/English CV PDFs. The bridge keeps a persistent status record.",
    inputSchema: schema({ key: keyProp, to: toProp, message: { type: "string", description: "Optional text sent first." }, attachments: { type: "array", maxItems: 9, items: schema(fileProps, []) }, at: { type: "string", description: "ISO-8601 with timezone." } }, ["key", "to", "at"])
  },
  {
    name: "list_whatsapp_schedule",
    description: "List WhatsApp messages that are still waiting to be sent, with recipient numbers and scheduled times.",
    inputSchema: schema({ key: keyProp }, ["key"])
  },
  {
    name: "get_whatsapp_delivery_report",
    description: "Get the unified WhatsApp delivery report: totals and per-recipient status for scheduled and tracked immediate sends (scheduled, sending, sent, partial, failed, cancelled).",
    inputSchema: schema({ key: keyProp, status: { type: "string", enum: ["all","scheduled","sending","sent","partial","failed","cancelled"], description: "Optional status filter." }, limit: { type: "integer", minimum: 1, maximum: 1000, description: "Default 200." } }, ["key"])
  },
  {
    name: "get_whatsapp_job",
    description: "Check bridge job results by idempotency key. A successful send is not evidence of delivered or read receipts.",
    inputSchema: schema({ key: keyProp, jobKey: { type: "string" } }, ["key", "jobKey"])
  },
  {
    name: "get_whatsapp_status",
    description: "Check the WhatsApp connection only when the user explicitly asks for status, or after a connection error.",
    inputSchema: schema({ key: keyProp }, ["key"])
  }
];
function sendResult(r, b) {
  const data = { ...b, httpStatus: r.status };
  data.status = b.sent === true ? 'sent' : r.status === 202 ? 'queued' : 'failed';
  if (b.id) data.messageId = b.id;
  data.messageIds = (b.results || []).filter(x => x.ok && x.id).map(x => x.id);
  return { content: [{ type: 'text', text: JSON.stringify(data) }], structuredContent: data, isError: !r.ok || b.sent !== true && r.status !== 202 };
}
const bundleSummary = sendResult;
const singleSummary = sendResult;
var fmtTime = /* @__PURE__ */ __name((ms) => new Date(ms).toISOString().replace("T", " ").slice(0, 16), "fmtTime");
async function callTool(env, name, a) {

  if (name === "kosif_mobile_think") {
    const args = { question: String(a.question || "") };
    if (a.context !== undefined) args.context = String(a.context);
    if (a.options && typeof a.options === "object" && !Array.isArray(a.options)) args.options = a.options;
    const requestedMode = String(a.mode || "auto");
    if (requestedMode === "auto") return await callKosifThinkTool("kosif_auto", args);
    args.mode = requestedMode;
    return await callKosifThinkTool("kosif_think", args);
  }
  if (name === "kosif_mobile_capabilities") {
    const result = await callKosifThinkRpc("tools/list", {});
    return result?.tools ? toolText(JSON.stringify({ tools: result.tools })) : result || toolText("KOSIF_THINK_CAPABILITIES_UNAVAILABLE", true);
  }
  if (name === "kosif_mobile_call") {
    return await callKosifThinkTool(String(a.tool || ""), a.arguments && typeof a.arguments === "object" ? a.arguments : {});
  }

  const to = a.to === undefined ? undefined : normalizeRecipientInput(a.to);
  if (['send_whatsapp_message','send_whatsapp_bundle','send_whatsapp_file'].includes(name) && !/^[\w:.\-]{1,128}$/.test(a.idempotencyKey || '')) return toolText('IDEMPOTENCY_KEY_REQUIRED: supply a stable operation key and reuse it on retries.', true);
  if (name === 'pair_whatsapp') {
    const r = a.method === 'code'
      ? await post(env, '/pair/code', a.key, { phone: normalizeTo(a.phone) })
      : await callBridge(env, '/pair/qr', a.key);
    return toolText(await r.text(), !r.ok);
  }
  if (name === "send_whatsapp_bundle") {
    const message = String(a.message || "").trim();
    const attachments = Array.isArray(a.attachments) ? a.attachments : [];
    if (!to || !message && !attachments.length) return toolText("Missing recipient, or both message and attachments.", true);
    const r = await post(env, "/send-bundle", a.key, { to, message, attachments, idempotencyKey: a.idempotencyKey });
    return bundleSummary(r, await bodyOf(r));
  }
  if (name === "send_whatsapp_message") {
    const message = String(a.message || "").trim();
    if (!to || !message) return toolText("Missing recipient or message.", true);
    const r = await post(env, "/send", a.key, { to, message, idempotencyKey: a.idempotencyKey });
    return singleSummary(r, await bodyOf(r));
  }
  if (name === "send_whatsapp_file") {
    if (!to || !a.stored && !a.fileUrl && !a.fileBase64) return toolText("Missing recipient or file.", true);
    const { stored, fileUrl, fileBase64, filename, mimetype, caption, idempotencyKey } = a;
    const r = await post(env, "/send-media", a.key, { to, stored, fileUrl, fileBase64, filename, mimetype, caption: caption || "", idempotencyKey });
    return singleSummary(r, await bodyOf(r));
  }
  if (name === "list_whatsapp_messages") {
    const q = new URLSearchParams({ limit: String(a.limit || 30), sync: a.sync === false ? "0" : "1" });
    if (a.from) q.set("from", normalizeTo(a.from));
    if (a.chat) q.set("chat", String(a.chat));
    const r = await callBridge(env, "/messages?" + q, a.key);
    const b = await bodyOf(r);
    if (!r.ok) return toolText(b.error || "failed to read messages", true);
    if (!b.messages?.length) return toolText("no messages");
    const lines = b.messages.map((m) => `[${fmtTime(m.timestamp)}] ${m.name || m.phone || m.sender}${m.group ? ` (group ${m.chat})` : ""}: ${m.type === "text" ? m.text : `<${m.type}> ${m.text}`.trim()}`);
    return toolText(lines.join("\n"));
  }
  if (name === "list_whatsapp_groups") {
    const r = await callBridge(env, "/groups", a.key);
    const b = await bodyOf(r);
    if (!r.ok) return toolText(b.error || "failed to list groups", true);
    return toolText((b.groups || []).map((g) => `${g.name} \u2014 ${g.id} (${g.participants})`).join("\n") || "no groups");
  }
  if (name === "save_whatsapp_contact") {
    const contactName = String(a.name || "").normalize("NFKC").trim().replace(/\s+/g, " ");
    if (!contactName || !a.to) return toolText("Missing contact name or recipient.", true);
    let target;
    try { target = normalizeTo(a.to); } catch { return toolText("INVALID_RECIPIENT", true); }
    const r = await post(env, "/aliases", a.key, { name: contactName, to: target });
    const b = await bodyOf(r);
    return toolText(JSON.stringify(b), !r.ok);
  }
  if (name === "list_saved_whatsapp_contacts") {
    const r = await callBridge(env, "/aliases", a.key);
    const b = await bodyOf(r);
    return toolText(JSON.stringify(b), !r.ok);
  }
  if (name === "resolve_whatsapp_recipient") {
    const contactName = String(a.name || "").normalize("NFKC").trim().replace(/\s+/g, " ");
    if (!contactName) return toolText("Missing contact name.", true);
    const r = await callBridge(env, "/aliases/resolve?name=" + encodeURIComponent(contactName), a.key);
    const b = await bodyOf(r);
    return toolText(JSON.stringify(b), !r.ok);
  }
  if (name === "delete_saved_whatsapp_contact") {
    const contactName = String(a.name || "").normalize("NFKC").trim().replace(/\s+/g, " ");
    if (!contactName) return toolText("Missing contact name.", true);
    const r = await callBridge(env, "/aliases/" + encodeURIComponent(contactName), a.key, { method: "DELETE" });
    const b = await bodyOf(r);
    return toolText(JSON.stringify(b), !r.ok);
  }
  if (name === "schedule_whatsapp_message") {
    if (!to || !String(a.message || "").trim() || !a.at) return toolText("Missing recipient, message or time.", true);
    const r = await post(env, "/schedule", a.key, { to, message: String(a.message).trim(), at: a.at });
    const b = await bodyOf(r);
    return toolText(r.ok ? `scheduled for ${b.at} (id ${b.id})` : b.error || "scheduling failed", !r.ok);
  }
  if (name === "schedule_whatsapp_bundle") {
    const message = String(a.message || "").trim();
    const attachments = Array.isArray(a.attachments) ? a.attachments : [];
    if (!to || (!message && !attachments.length) || !a.at) return toolText("Missing recipient, time, or both message and attachments.", true);
    const r = await post(env, "/schedule", a.key, { to, message, attachments, at: a.at });
    const b = await bodyOf(r);
    return toolText(r.ok ? JSON.stringify({ scheduled: true, id: b.id, to: b.to, at: b.at, attachments: (b.attachments || []).map((x) => x.stored || x.filename || x.fileUrl || "file") }) : b.error || "scheduling failed", !r.ok);
  }
  if (name === "list_whatsapp_schedule") {
    const r = await callBridge(env, "/schedule", a.key);
    const b = await bodyOf(r);
    return toolText(JSON.stringify(b), !r.ok);
  }
  if (name === "get_whatsapp_delivery_report") {
    const q = new URLSearchParams({ limit: String(a.limit || 200) });
    if (a.status && a.status !== "all") q.set("status", a.status);
    const r = await callBridge(env, "/delivery-report?" + q, a.key);
    const b = await bodyOf(r);
    return toolText(JSON.stringify(b), !r.ok);
  }
  if (name === "get_whatsapp_job") {
    const r = await callBridge(env, "/jobs/" + encodeURIComponent(String(a.jobKey || "")), a.key);
    return toolText(await r.text(), !r.ok);
  }
  if (name === "get_whatsapp_status") {
    const r = await callBridge(env, "/status", a.key);
    return toolText(await r.text(), !r.ok);
  }
  return null;
}
__name(callTool, "callTool");
var index_default = {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname === "/") return new Response("KOSIF WhatsApp MCP online\n");
    if (url.pathname !== "/mcp") return new Response("Not found", { status: 404 });
    if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
    let msg;
    try {
      msg = await req.json();
    } catch {
      return err(null, -32700, "Parse error");
    }
    const id = msg.id;
    if (msg.method === "initialize") {
      return rpc(id, { protocolVersion: msg.params?.protocolVersion || "2025-06-18", capabilities: { tools: {} }, serverInfo: { name: "kosif-whatsapp", version: VERSION } });
    }
    if (msg.method === "notifications/initialized") return new Response(null, { status: 202 });
    if (msg.method === "ping") return rpc(id, {});
    if (msg.method === "tools/list") return rpc(id, { tools: TOOLS });
    if (msg.method === "tools/call") {
      try {
        const result = await callTool(env, msg.params?.name, msg.params?.arguments || {});
        return result ? rpc(id, result) : err(id, -32602, "Unknown tool");
      } catch (e) {
        return rpc(id, toolText(["BRIDGE_KEY_REQUIRED", "INVALID_RECIPIENT"].includes(e?.message) ? e.message : "BRIDGE_REQUEST_FAILED: check the job before retrying an uncertain send.", true));
      }
    }
    return err(id, -32601, "Method not found");
  }
};
export {
  index_default as default
};



--32763de0d745e6e677e92655ae6a000fd2d9c6abd63b9b64beb00538327e--
