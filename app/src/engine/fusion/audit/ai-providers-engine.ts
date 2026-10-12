/* One reviewer, three providers — the pure half of ui/core/ai.js.
   Every feature builds its request once in the Gemini shape (systemInstruction, contents with text / inlineData / functionCall /
   functionResponse parts, tools.functionDeclarations, generationConfig with an optional responseSchema) and reads the answer
   in the Gemini shape (candidates[0].content.parts). This engine translates both ways for:
     • Google Gemini       generativelanguage.googleapis.com/v1beta  (x-goog-api-key)       — native, passed through
     • OpenAI              api.openai.com/v1/chat/completions         (Authorization: Bearer)
     • Anthropic Claude    api.anthropic.com/v1/messages              (x-api-key, anthropic-version, and the header that
                                                                        allows a direct browser call with the user's own key)
   No network here and no key: ui/core/ai.js sends what this returns. */

export type ProviderId = 'gemini' | 'openai' | 'anthropic';
export type Provider = { id: ProviderId; ar: string; base: string; keyHint: string; keyPattern: RegExp; keyLink: string; models: string[]; host: string };

export const PROVIDERS: Record<ProviderId, Provider> = {
  // AI Studio issues keys in two shapes: the older «AIza…» and the newer «AQ.…» (with a dot). The «-latest» aliases follow Google's
  // current model, so a retired model id (gemini-2.5-* for new keys) never strands the reviewer.
  gemini: { id: 'gemini', ar: 'Google Gemini', base: 'https://generativelanguage.googleapis.com/v1beta/', keyHint: 'AIza… أو AQ.…', keyPattern: /^[\w.-]{20,}$/,
    keyLink: 'https://aistudio.google.com/app/apikey', models: ['gemini-flash-latest', 'gemini-3.7-flash', 'gemini-3.5-flash', 'gemini-flash-lite-latest', 'gemini-pro-latest'], host: 'generativelanguage.googleapis.com' },
  openai: { id: 'openai', ar: 'OpenAI', base: 'https://api.openai.com/v1/', keyHint: 'sk-…', keyPattern: /^sk-[\w-]{20,}$/,
    keyLink: 'https://platform.openai.com/api-keys', models: ['gpt-5', 'gpt-5-mini', 'gpt-4.1'], host: 'api.openai.com' },
  anthropic: { id: 'anthropic', ar: 'Anthropic Claude', base: 'https://api.anthropic.com/v1/', keyHint: 'sk-ant-…', keyPattern: /^sk-ant-[\w-]{20,}$/,
    keyLink: 'https://platform.claude.com/settings/keys', models: ['claude-opus-5-5', 'claude-sonnet-5-5', 'claude-haiku-5-5'], host: 'api.anthropic.com' },
};
export const isProvider = (x: unknown): x is ProviderId => x === 'gemini' || x === 'openai' || x === 'anthropic';

/* ---------- the Gemini request shape (the common language of the app) ---------- */
type GPart = { text?: string; inlineData?: { mimeType: string; data: string }; functionCall?: { name: string; args?: Record<string, unknown>; id?: string };
  functionResponse?: { name: string; response?: unknown; id?: string } };
type GContent = { role?: string; parts: GPart[] };
type GSchema = { type?: string; description?: string; enum?: string[]; items?: GSchema; properties?: Record<string, GSchema>; required?: string[] };
export type GeminiBody = { systemInstruction?: { parts: GPart[] }; contents: GContent[];
  tools?: { functionDeclarations?: { name: string; description?: string; parameters?: GSchema }[] }[];
  generationConfig?: { temperature?: number; responseMimeType?: string; responseSchema?: GSchema; maxOutputTokens?: number } };

/** Gemini's OpenAPI subset (OBJECT, STRING …) → standard JSON Schema (object, string …). */
export function toJsonSchema(s: GSchema | undefined): Record<string, unknown> {
  if (!s) return { type: 'object' };
  const out: Record<string, unknown> = {};
  if (s.type) out.type = String(s.type).toLowerCase();
  if (s.description) out.description = s.description;
  if (s.enum) out.enum = [...s.enum];
  if (s.items) out.items = toJsonSchema(s.items);
  if (s.properties) out.properties = Object.fromEntries(Object.entries(s.properties).map(([k, v]) => [k, toJsonSchema(v)]));
  if (s.required) out.required = [...s.required];
  return out;
}
/** Anthropic constrained JSON output requires closed object schemas.
 * Apply it recursively without mutating the caller's Gemini schema. */
export function strictJsonSchema(s: GSchema): Record<string, unknown> {
  const json = toJsonSchema(s);
  if (json.type === 'object') {
    const props = (s.properties ?? {});
    if (!Object.keys(props).length) return json;
    json.properties = Object.fromEntries(Object.entries(props).map(([k, v]) => [k, strictJsonSchema(v)]));
    json.additionalProperties = false;
  }
  if (json.type === 'array' && s.items) json.items = strictJsonSchema(s.items);
  return json;
}
const systemText = (b: GeminiBody) => (b.systemInstruction?.parts ?? []).map((p) => p.text ?? '').filter(Boolean).join('\n\n');
/* JSON answers: OpenAI's json_object mode and Claude both follow a schema given in the instructions; the answer is still parsed
   leniently and normalized by the calling engine, exactly as for Gemini */
function jsonInstruction(b: GeminiBody): string {
  const g = b.generationConfig;
  if (g?.responseMimeType !== 'application/json') return '';
  return '\n\nأجب بكائن JSON واحد صالح فقط، دون أي نص قبله أو بعده ودون علامات ```' +
    (g.responseSchema ? '، مطابق لهذا المخطط (JSON Schema):\n' + JSON.stringify(toJsonSchema(g.responseSchema)) : '.');
}
const fileName = (mime: string, i: number) => `document-${i + 1}.${mime === 'application/pdf' ? 'pdf' : (mime.split('/')[1] || 'bin')}`;

/* tool-call ids: Gemini has none; the other two need one per call and the same id on its result */
function callIds(contents: GContent[]): string[][] {
  let n = 0;
  return contents.map((c) => c.parts.map((p) => (p.functionCall ? p.functionCall.id || `call_${++n}` : '')));
}

export type Wire = { url: string; headers: Record<string, string>; body: Record<string, unknown> };

/** The HTTP request for one generate call (the key goes in the headers). */
export function buildRequest(provider: ProviderId, body: GeminiBody, model: string, key: string): Wire {
  const P = PROVIDERS[provider];
  if (provider === 'gemini') return { url: `${P.base}models/${encodeURIComponent(model)}:generateContent`, headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key }, body: body as unknown as Record<string, unknown> };
  const sys = systemText(body) + jsonInstruction(body), ids = callIds(body.contents);
  const decl = (body.tools ?? []).flatMap((t) => t.functionDeclarations ?? []);
  const maxOut = body.generationConfig?.maxOutputTokens ?? 16000;

  if (provider === 'openai') {
    const messages: Record<string, unknown>[] = [];
    if (sys) messages.push({ role: 'system', content: sys });
    body.contents.forEach((c, ci) => {
      const calls = c.parts.map((p, pi) => ({ p, id: ids[ci][pi] })).filter((x) => x.p.functionCall);
      if (c.role === 'model') {
        const text = c.parts.map((p) => p.text ?? '').join('');
        messages.push({ role: 'assistant', content: text || null, ...(calls.length ? { tool_calls: calls.map((x) => ({ id: x.id, type: 'function', function: { name: x.p.functionCall!.name, arguments: JSON.stringify(x.p.functionCall!.args ?? {}) } })) } : {}) });
        return;
      }
      const prev = ci > 0 ? body.contents[ci - 1].parts.map((p, pi) => (p.functionCall ? { name: p.functionCall.name, id: ids[ci - 1][pi] } : null)).filter((x): x is { name: string; id: string } => !!x) : [];
      const results = c.parts.filter((p) => p.functionResponse);
      results.forEach((p, i) => messages.push({ role: 'tool', tool_call_id: p.functionResponse!.id || prev.find((x) => x.name === p.functionResponse!.name)?.id || prev[i]?.id || `call_${i + 1}`, content: JSON.stringify(p.functionResponse!.response ?? {}) }));
      const content = c.parts.filter((p) => !p.functionResponse).map((p, i) => p.inlineData
        ? (p.inlineData.mimeType.startsWith('image/') ? { type: 'image_url', image_url: { url: `data:${p.inlineData.mimeType};base64,${p.inlineData.data}` } }
          : { type: 'file', file: { filename: fileName(p.inlineData.mimeType, i), file_data: `data:${p.inlineData.mimeType};base64,${p.inlineData.data}` } })
        : { type: 'text', text: p.text ?? '' }).filter((x) => x.type !== 'text' || (x as { text: string }).text);
      if (content.length) messages.push({ role: 'user', content });
    });
    const out: Record<string, unknown> = { model, messages, max_completion_tokens: maxOut };
    if (body.generationConfig?.responseMimeType === 'application/json' && !decl.length) out.response_format = { type: 'json_object' };
    if (decl.length) out.tools = decl.map((d) => ({ type: 'function', function: { name: d.name, description: d.description ?? '', parameters: toJsonSchema(d.parameters) } }));
    return { url: `${P.base}chat/completions`, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` }, body: out };
  }

  /* Anthropic Messages API. Sampling parameters are left out (the current models fix them); thinking stays at the model's
     default, and the most capable models may refuse a request: the answer then reads as blocked. */
  const messages: { role: 'user' | 'assistant'; content: Record<string, unknown>[] }[] = [];
  const push = (role: 'user' | 'assistant', blocks: Record<string, unknown>[]) => {
    if (!blocks.length) return;
    const last = messages[messages.length - 1];
    if (last && last.role === role) last.content.push(...blocks); else messages.push({ role, content: blocks });
  };
  body.contents.forEach((c, ci) => {
    if (c.role === 'model') {
      push('assistant', c.parts.map((p, pi) => p.functionCall ? { type: 'tool_use', id: ids[ci][pi], name: p.functionCall.name, input: p.functionCall.args ?? {} }
        : { type: 'text', text: p.text ?? '' }).filter((b) => b.type !== 'text' || b.text));
      return;
    }
    const prev = ci > 0 ? body.contents[ci - 1].parts.map((p, pi) => (p.functionCall ? { name: p.functionCall.name, id: ids[ci - 1][pi] } : null)).filter((x): x is { name: string; id: string } => !!x) : [];
    let r = 0;
    const blocks = c.parts.map((p) => {
      if (p.functionResponse) { const id = p.functionResponse.id || prev.find((x) => x.name === p.functionResponse!.name)?.id || prev[r]?.id || `call_${r + 1}`; r++;
        return { type: 'tool_result', tool_use_id: id, content: JSON.stringify(p.functionResponse.response ?? {}) }; }
      if (p.inlineData) return p.inlineData.mimeType === 'application/pdf'
        ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: p.inlineData.data } }
        : p.inlineData.mimeType.startsWith('image/') ? { type: 'image', source: { type: 'base64', media_type: p.inlineData.mimeType, data: p.inlineData.data } }
          : { type: 'text', text: '[مرفق بصيغة غير مدعومة: ' + p.inlineData.mimeType + ']' };
      return { type: 'text', text: p.text ?? '' };
    }).filter((b) => b.type !== 'text' || (b as { text: string }).text);
    /* tool results first in their turn, as the API expects */
    push('user', [...blocks.filter((b) => b.type === 'tool_result'), ...blocks.filter((b) => b.type !== 'tool_result')]);
  });
  const out: Record<string, unknown> = { model, max_tokens: maxOut, messages };
  if (sys) out.system = sys;
  // Unlike a free-text JSON instruction, Claude structured output gives a
  // machine-validated response for financial/audit schemas. Never combine it
  // with function-calling requests, whose output is already tool-structured.
  if (body.generationConfig?.responseMimeType === 'application/json' &&
      body.generationConfig.responseSchema?.properties &&
      Object.keys(body.generationConfig.responseSchema.properties).length && !decl.length) {
    out.output_config = { format: { type: 'json_schema',
      schema: strictJsonSchema(body.generationConfig.responseSchema) } };
  }
  if (decl.length) out.tools = decl.map((d) => ({ name: d.name, description: d.description ?? '', input_schema: toJsonSchema(d.parameters ?? { type: 'OBJECT', properties: {} }) }));
  const headers: Record<string, string> = { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' };
  /* refusal fallback on the models that support it: the server re-runs a declined request on a suitable model */
  if (/^claude-(opus-5|fable-5)/.test(model)) { headers['anthropic-beta'] = 'server-side-fallback-2026-07-01'; out.fallbacks = 'default'; }
  return { url: `${P.base}messages`, headers, body: out };
}

/** The provider's answer → the Gemini answer shape every feature already reads. */
export function toGeminiResponse(provider: ProviderId, api: unknown): { candidates: { content: { role: 'model'; parts: GPart[] }; finishReason: string }[]; usageMetadata?: Record<string, number> } | unknown {
  if (provider === 'gemini') return api;
  const a = (api ?? {}) as Record<string, unknown>;
  if (provider === 'openai') {
    const ch = ((a.choices as unknown[]) ?? [])[0] as { message?: { content?: string | null; refusal?: string | null; tool_calls?: { id: string; function: { name: string; arguments: string } }[] }; finish_reason?: string } | undefined;
    const m = ch?.message ?? {}, parts: GPart[] = [];
    if (m.content) parts.push({ text: m.content });
    for (const t of m.tool_calls ?? []) { let args: Record<string, unknown> = {}; try { args = JSON.parse(t.function.arguments || '{}'); } catch { /* keep empty */ } parts.push({ functionCall: { name: t.function.name, args, id: t.id } }); }
    const fr = m.refusal ? 'SAFETY' : ch?.finish_reason === 'length' ? 'MAX_TOKENS' : ch?.finish_reason === 'content_filter' ? 'SAFETY' : 'STOP';
    const u = a.usage as { prompt_tokens?: number; completion_tokens?: number } | undefined;
    return { candidates: [{ content: { role: 'model', parts }, finishReason: fr }], ...(u ? { usageMetadata: { promptTokenCount: u.prompt_tokens ?? 0, candidatesTokenCount: u.completion_tokens ?? 0 } } : {}) };
  }
  const blocks = ((a.content as unknown[]) ?? []) as { type: string; text?: string; id?: string; name?: string; input?: Record<string, unknown> }[];
  const parts: GPart[] = [];
  for (const b of blocks) {
    if (b.type === 'text' && b.text) parts.push({ text: b.text });
    else if (b.type === 'tool_use' && b.name) parts.push({ functionCall: { name: b.name, args: b.input ?? {}, id: b.id } });
  }
  const sr = a.stop_reason;
  const fr = sr === 'refusal' ? 'SAFETY' : sr === 'max_tokens' ? 'MAX_TOKENS' : 'STOP';
  const u = a.usage as { input_tokens?: number; output_tokens?: number } | undefined;
  return { candidates: [{ content: { role: 'model', parts }, finishReason: fr }], ...(u ? { usageMetadata: { promptTokenCount: u.input_tokens ?? 0, candidatesTokenCount: u.output_tokens ?? 0 } } : {}) };
}

/** The provider's error body → its message. */
export function errorMessage(api: unknown): string {
  const e = (api as { error?: { message?: string } | string } | null)?.error;
  return typeof e === 'string' ? e : e?.message ?? '';
}
/** Arabic error text for any provider. */
export function friendlyError(provider: ProviderId, status: number, message = ''): string {
  const P = PROVIDERS[provider];
  if (status === 401 || (status === 400 && /api key not valid|API_KEY_INVALID|invalid x-api-key|incorrect api key/i.test(message))) return `مفتاح ${P.ar} غير صالح — تحقق منه.`;
  if (status === 400) return 'رفض الطلب (400): ' + (message || 'صيغة غير مقبولة') + '.';
  if (status === 403) return 'المفتاح مرفوض أو غير مصرح له بهذا النموذج (403).';
  if (status === 404) return 'النموذج غير متاح لهذا المفتاح (404) — اختر نموذجاً آخر من القائمة.';
  if (status === 413) return 'حجم المستندات أكبر من المسموح في طلب واحد — ارفعها على جولات.';
  if (status === 429) return 'تجاوزت حصة الاستخدام أو حد المعدل (429) — انتظر قليلاً أو اختر نموذجاً أخف.';
  if (status === 529 || status >= 500) return `خطأ مؤقت من خدمات ${P.ar} (${status}) — أعد المحاولة.`;
  if (status === 0) return `تعذر الاتصال — تحقق من الشبكة أو من مانع يحجب ${P.host}.`;
  return 'خطأ ' + status + (message ? ': ' + message : '');
}
/** Whether another model may succeed where this one failed: retired or unknown (404), overloaded (5xx/529), or out of quota
    for this model (429 — a lighter model often has its own quota). A bad key (400/401/403) fails on every model. */
export function retryWithOtherModel(status: number): boolean { return status === 404 || status === 429 || status === 529 || status >= 500; }
/** The models to try after `current` failed, best first: the provider's defaults, then the models the key listed, lighter last. */
export function fallbackModels(provider: ProviderId, current: string, known: string[] = []): string[] {
  const seen = new Set([current]), out: string[] = [];
  for (const m of [...PROVIDERS[provider].models, ...known]) if (m && !seen.has(m)) { seen.add(m); out.push(m); }
  return out.slice(0, 4);
}
/** Model ids from each provider's list endpoint (GET …/models), filtered to text-generation models. */
export function modelsFrom(provider: ProviderId, api: unknown): string[] {
  const a = (api ?? {}) as { models?: { name?: string; supportedGenerationMethods?: string[] }[]; data?: { id?: string }[] };
  if (provider === 'gemini') return (a.models ?? []).filter((m) => (m.supportedGenerationMethods ?? []).includes('generateContent')).map((m) => String(m.name ?? '').replace(/^models\//, ''))
    .filter((n) => /^gemini/.test(n) && !/embedding|aqa|tts|image|live/.test(n)).sort((x, y) => y.localeCompare(x, 'en'));
  const ids = (a.data ?? []).map((m) => String(m.id ?? '')).filter(Boolean);
  if (provider === 'openai') return ids.filter((n) => /^(gpt-|o\d)/.test(n) && !/audio|realtime|transcribe|tts|image|search|embedding|instruct/.test(n)).sort((x, y) => y.localeCompare(x, 'en'));
  return ids.filter((n) => /^claude-/.test(n));
}
/** The URL (without key) that lists the models, and its headers. */
export function modelsRequest(provider: ProviderId, key: string): { url: string; headers: Record<string, string> } {
  const P = PROVIDERS[provider];
  if (provider === 'gemini') return { url: `${P.base}models?pageSize=200`, headers: { 'x-goog-api-key': key } };
  if (provider === 'openai') return { url: `${P.base}models`, headers: { Authorization: `Bearer ${key}` } };
  return { url: `${P.base}models?limit=100`, headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' } };
}
