import { describe, expect, it } from 'vitest';
import { buildRequest, claudeModelForTier, fallbackModels, friendlyError, modelsFrom, PROVIDERS, retryWithOtherModel, toGeminiResponse, toJsonSchema, type GeminiBody } from './ai-providers-engine';

const body: GeminiBody = {
  systemInstruction: { parts: [{ text: 'أنت مراجع.' }] },
  contents: [{ role: 'user', parts: [{ text: 'راجع' }, { inlineData: { mimeType: 'application/pdf', data: 'JVBERi0=' } }, { inlineData: { mimeType: 'image/png', data: 'iVBO' } }] }],
  generationConfig: { temperature: 0.2, responseMimeType: 'application/json', responseSchema: { type: 'OBJECT', properties: { status: { type: 'STRING', enum: ['a', 'b'] } }, required: ['status'] } },
};

describe('schemas', () => {
  it('turns the Gemini subset into JSON Schema', () => {
    expect(toJsonSchema(body.generationConfig!.responseSchema)).toEqual({ type: 'object', properties: { status: { type: 'string', enum: ['a', 'b'] } }, required: ['status'] });
  });
});

describe('requests', () => {
  it('passes Gemini through with the key in the header', () => {
    const w = buildRequest('gemini', body, 'gemini-2.5-pro', 'AIzaKEY');
    expect(w.url).toContain('models/gemini-2.5-pro:generateContent');
    expect(w.headers['x-goog-api-key']).toBe('AIzaKEY');
    expect(w.body).toBe(body);
  });
  it('builds an OpenAI chat request with the schema in the system message and files as data URLs', () => {
    const w = buildRequest('openai', body, 'gpt-5', 'sk-KEY');
    const msgs = w.body.messages as { role: string; content: unknown }[];
    expect(w.headers.Authorization).toBe('Bearer sk-KEY');
    expect(msgs[0].role).toBe('system');
    expect(String(msgs[0].content)).toContain('"required":["status"]');
    const parts = msgs[1].content as { type: string }[];
    expect(parts.map((p) => p.type)).toEqual(['text', 'file', 'image_url']);
    expect(w.body.response_format).toEqual({ type: 'json_object' });
    expect(w.body).not.toHaveProperty('temperature');
  });
  it('builds a Claude Messages request for the browser: document and image blocks, no sampling parameters', () => {
    const w = buildRequest('anthropic', body, 'claude-opus-5', 'sk-ant-KEY');
    expect(w.url).toBe('https://api.anthropic.com/v1/messages');
    expect(w.headers).toMatchObject({ 'x-api-key': 'sk-ant-KEY', 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' });
    expect(w.body.system).toContain('أنت مراجع.');
    const m = (w.body.messages as { role: string; content: { type: string }[] }[])[0];
    expect(m.role).toBe('user');
    expect(m.content.map((b) => b.type)).toEqual(['text', 'document', 'image']);
    expect(w.body).not.toHaveProperty('temperature');
    expect(w.body.max_tokens).toBeGreaterThan(1000);
    expect(buildRequest('anthropic', body, 'claude-haiku-4-5', 'k').body).not.toHaveProperty('fallbacks');
  });
  it('round-trips function calls with matching ids', () => {
    const chat: GeminiBody = { contents: [
      { role: 'user', parts: [{ text: 'افتح' }] },
      { role: 'model', parts: [{ functionCall: { name: 'go', args: { s: 'x' } } }] },
      { role: 'user', parts: [{ functionResponse: { name: 'go', response: { ok: true } } }] }],
      tools: [{ functionDeclarations: [{ name: 'go', description: 'd', parameters: { type: 'OBJECT', properties: { s: { type: 'STRING' } } } }] }] };
    const a = buildRequest('anthropic', chat, 'claude-sonnet-5', 'k').body as { messages: { role: string; content: { type: string; id?: string; tool_use_id?: string }[] }[]; tools: unknown[] };
    expect(a.messages[1].content[0]).toMatchObject({ type: 'tool_use', id: 'call_1' });
    expect(a.messages[2].content[0]).toMatchObject({ type: 'tool_result', tool_use_id: 'call_1' });
    expect(a.tools).toHaveLength(1);
    const o = buildRequest('openai', chat, 'gpt-5', 'k').body as { messages: { role: string; tool_call_id?: string; tool_calls?: { id: string }[] }[] };
    expect(o.messages[1].tool_calls![0].id).toBe('call_1');
    expect(o.messages[2]).toMatchObject({ role: 'tool', tool_call_id: 'call_1' });
  });
});

describe('responses', () => {
  const text = (r: unknown) => (r as { candidates: { content: { parts: { text?: string }[] }; finishReason: string }[] }).candidates[0];
  it('reads OpenAI and Claude answers in the Gemini shape', () => {
    expect(text(toGeminiResponse('openai', { choices: [{ message: { content: '{"a":1}' }, finish_reason: 'stop' }] })).content.parts[0].text).toBe('{"a":1}');
    const c = text(toGeminiResponse('anthropic', { content: [{ type: 'thinking', thinking: '' }, { type: 'text', text: 'تم' }], stop_reason: 'end_turn' }));
    expect(c.content.parts).toEqual([{ text: 'تم' }]);
    expect(text(toGeminiResponse('anthropic', { content: [], stop_reason: 'refusal' })).finishReason).toBe('SAFETY');
    expect(text(toGeminiResponse('openai', { choices: [{ message: { content: 'x' }, finish_reason: 'length' }] })).finishReason).toBe('MAX_TOKENS');
  });
  it('lists models and explains errors per provider', () => {
    expect(modelsFrom('openai', { data: [{ id: 'gpt-5' }, { id: 'text-embedding-3' }, { id: 'gpt-4o-audio' }] })).toEqual(['gpt-5']);
    expect(modelsFrom('anthropic', { data: [{ id: 'claude-opus-5' }] })).toEqual(['claude-opus-5']);
    expect(friendlyError('anthropic', 401)).toContain('Anthropic Claude');
    expect(friendlyError('openai', 0)).toContain('api.openai.com');
  });
  it('exposes current Claude 5.5 API models and chooses the right effort tier', () => {
    expect(PROVIDERS.anthropic.models).toEqual([
      'claude-opus-5-5', 'claude-sonnet-5-5', 'claude-haiku-5-5',
    ]);
    expect(claudeModelForTier('routine')).toBe('claude-haiku-5-5');
    expect(claudeModelForTier('financial')).toBe('claude-sonnet-5-5');
    expect(claudeModelForTier('critical')).toBe('claude-opus-5-5');
    for (const model of PROVIDERS.anthropic.models) {
      const w = buildRequest('anthropic', { contents: [{ role: 'user', parts: [{ text: 'test' }] }] }, model, 'sk-ant-TEST');
      expect(w.body.model).toBe(model);
      expect(w.url).toBe('https://api.anthropic.com/v1/messages');
    }
    expect(fallbackModels('anthropic', 'claude-sonnet-5')).toContain('claude-sonnet-5-5');
    expect(fallbackModels('anthropic', 'claude-haiku-4-5')).toContain('claude-haiku-5-5');
  });
  it('accepts both AI Studio key shapes and falls back to another model when one is retired or overloaded', () => {
    expect(PROVIDERS.gemini.keyPattern.test('AIzaSyA-1234567890abcdefghijk')).toBe(true);
    expect(PROVIDERS.gemini.keyPattern.test('AQ.Ab8RN6LPQrY57xCW5hbb_9NMmEM')).toBe(true);
    expect(PROVIDERS.gemini.keyPattern.test('short')).toBe(false);
    expect(PROVIDERS.gemini.models[0]).toBe('gemini-flash-latest');
    expect([404, 429, 500, 503, 529].every(retryWithOtherModel)).toBe(true);
    expect([400, 401, 403].some(retryWithOtherModel)).toBe(false);
    const f = fallbackModels('gemini', 'gemini-2.5-flash', ['gemini-3.8-flash']);
    expect(f[0]).toBe('gemini-flash-latest');
    expect(f).not.toContain('gemini-2.5-flash');
    expect(f.length).toBeLessThanOrEqual(4);
  });
});
