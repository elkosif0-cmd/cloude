import { describe, expect, it } from 'vitest';
import { STANDARDS } from './codex-engine';
import { applyApproved, buildUpdateCheckBody, isOfficial, parseUpdateResponse } from './standards-update-engine';

describe('standards updates from official sources', () => {
  it('asks with Google Search grounding for the listed standards', () => {
    const b = buildUpdateCheckBody(['IFRS 18', 'ISA 240', 'XYZ'], '2026-09-25');
    expect(b.tools).toEqual([{ google_search: {} }]);
    expect(b.contents[0].parts[0].text).toContain('IFRS 18 — Presentation and Disclosure');
    expect(b.contents[0].parts[0].text).not.toContain('XYZ');
  });
  it('recognizes official domains only', () => {
    expect(isOfficial('https://www.ifrs.org/news')).toBe(true);
    expect(isOfficial('https://socpa.org.sa/x')).toBe(true);
    expect(isOfficial('https://ifrs.org.example.com')).toBe(false);
    expect(isOfficial('not a url')).toBe(false);
  });
  it('keeps updates backed by an official source and drops the rest', () => {
    const api = { candidates: [{ content: { parts: [{ text: '```json\n{"updates":[' +
      '{"code":"ias 21","change":"تعديل انعدام قابلية التبادل","effective":"2025-01-01","kind":"amendment","sources":["https://www.ifrs.org/projects/completed-projects/2023/lack-of-exchangeability/"]},' +
      '{"code":"IFRS 18","change":"اعتماد SOCPA","kind":"endorsement","sources":["https://blog.example.com/x"]},' +
      '{"code":"IAS 2","change":"شائعة","sources":[]}]}\n```' }] }, groundingMetadata: { groundingChunks: [{ web: { uri: 'https://vertexaisearch.cloud.google.com/redirect/abc', title: 'socpa.org.sa' } }] } }] };
    const r = parseUpdateResponse(api, '2026-09-25T10:00:00Z');
    expect(r.items.map((i) => [i.code, i.official, i.status])).toEqual([['IAS 21', true, 'pending'], ['IFRS 18', false, 'pending'], ['IAS 2', false, 'pending']]);
    expect(r.items[1].sources[0].title).toBe('socpa.org.sa');
    const none = parseUpdateResponse({ candidates: [{ content: { parts: [{ text: '{"updates":[{"code":"IAS 2","change":"x","sources":[]}]}' }] } }] }, 't');
    expect(none).toMatchObject({ items: [], dropped: 1 });
  });
  it('applies only approved updates', () => {
    const r = parseUpdateResponse({ candidates: [{ content: { parts: [{ text: '{"updates":[{"code":"IAS 21","change":"تعديل","effective":"2025","sources":["https://www.ifrs.org/a"]}]}' }] } }] }, '2026-09-25T10:00:00Z');
    expect(applyApproved(STANDARDS, r.items).find((s) => s.code === 'IAS 21')!.latest).not.toContain('تحقق');
    const approved = r.items.map((i) => ({ ...i, status: 'approved' as const }));
    const s = applyApproved(STANDARDS, approved).find((x) => x.code === 'IAS 21')!;
    expect(s.latest).toBe('تعديل (السريان: 2025) — تحقق 2026-09-25');
    expect(s.url).toBe('https://www.ifrs.org/a');
  });
});
