import { describe, expect, it } from 'vitest';
import { buildRequest, fallbackModels, PROVIDERS, toGeminiResponse, type GeminiBody } from './ai-providers-engine';

describe('KOSIF EARTH Claude 5.5 accounting and audit adapter', () => {
  it('defaults to real Claude Opus 5.5, then current Sonnet and Haiku fallback models', () => {
    expect(PROVIDERS.anthropic.models).toEqual(['claude-opus-5-5', 'claude-sonnet-5-5', 'claude-haiku-5-5']);
    expect(fallbackModels('anthropic', 'claude-opus-5-5')).toEqual(['claude-sonnet-5-5', 'claude-haiku-5-5']);
  });

  it('sends finance questions and tool contracts to Anthropic without leaking key into JSON body', () => {
    const query: GeminiBody = {
      systemInstruction: { parts: [{ text: 'Strict company isolation; never invent ledger data.' }] },
      contents: [{ role: 'user', parts: [{ text: 'هل ميزان مراجعة شركتي متوازن؟' }] }],
      tools: [{ functionDeclarations: [{
        name: 'company_search',
        description: 'Search the selected company only',
        parameters: { type: 'OBJECT', properties: { query: { type: 'STRING' } }, required: ['query'] }
      }] }],
    };
    const request = buildRequest('anthropic', query, 'claude-opus-5-5', 'sk-ant-PROTECTED');
    expect(request.url).toBe('https://api.anthropic.com/v1/messages');
    expect(request.headers['x-api-key']).toBe('sk-ant-PROTECTED');
    expect(JSON.stringify(request.body)).not.toContain('sk-ant-PROTECTED');
    expect(request.body.system).toContain('Strict company isolation');
    expect(request.body.tools).toMatchObject([{ name: 'company_search', input_schema: { type: 'object', required: ['query'] } }]);
  });

  it('translates Claude accounting-review tool calls and round trips tool results', () => {
    const result = toGeminiResponse('anthropic', {
      content: [{ type: 'tool_use', id: 'toolu_finance1', name: 'company_search', input: { query: 'trial balance' } }],
      stop_reason: 'tool_use', usage: { input_tokens: 72, output_tokens: 14 }
    }) as { candidates: { content: { parts: { functionCall?: { name: string; id: string } }[] } }[] };
    expect(result.candidates[0].content.parts[0].functionCall).toMatchObject({ name: 'company_search', id: 'toolu_finance1' });
    const req = buildRequest('anthropic', {
      contents: [
        { role: 'user', parts: [{ text: 'افحص ميزان الشركة الحالية' }] },
        { role: 'model', parts: [{ functionCall: { name: 'company_search', id: 'toolu_finance1', args: { query: 'trial balance' } } }] },
        { role: 'user', parts: [{ functionResponse: { id: 'toolu_finance1', name: 'company_search', response: { ok: false, error: 'scope_denied' } } }] },
      ],
    }, 'claude-sonnet-5-5', 'sk-ant-PROTECTED');
    const messages = req.body.messages as { content: { type: string; tool_use_id?: string; content?: string }[] }[];
    expect(messages[2].content[0]).toMatchObject({ type: 'tool_result', tool_use_id: 'toolu_finance1' });
    expect(messages[2].content[0].content).toContain('scope_denied');
  });

  it('respects Claude refusal and token limit rather than claiming successful accounting output', () => {
    const refusal = toGeminiResponse('anthropic', { content: [], stop_reason: 'refusal' }) as { candidates: { finishReason: string }[] };
    const trunc = toGeminiResponse('anthropic', { content: [{ type: 'text', text: 'partial' }], stop_reason: 'max_tokens' }) as { candidates: { finishReason: string }[] };
    expect(refusal.candidates[0].finishReason).toBe('SAFETY');
    expect(trunc.candidates[0].finishReason).toBe('MAX_TOKENS');
  });
});
