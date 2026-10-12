import { describe, expect, it } from 'vitest';
import { candidateNames, maskText, unmask, maskBody, unmaskResponse, preflight, traceRecord, traceSafe, traceSummary, filterTrace, sha256Hex, tokenCount, utf8Bytes, DEFAULT_POLICY, responseText } from './ai-guard-engine';

const NAMES = ['مؤسسة الريان للتجارة', 'شركة الوادي للحوم', 'أغنام الوادي', 'Al Rayan Trading', 'محمد عبدالله السالم'];

describe('maskText — identifiers', () => {
  it('Saudi phones in every written form share one token when they are the same number', () => {
    const r = maskText('اتصل على 0512345678 أو +966 51 234 5678 أو 00966512345678 أو 966512345678 أو 051-234-5678، والثاني 0598765432');
    expect(r.counts.phone).toBe(6);
    expect(r.masked).toBe('اتصل على [هاتف-1] أو [هاتف-1] أو [هاتف-1] أو [هاتف-1] أو [هاتف-1]، والثاني [هاتف-2]');
    expect(Object.keys(r.map)).toEqual(['[هاتف-1]', '[هاتف-2]']);
    expect(r.map['[هاتف-1]']).toBe('0512345678');
  });
  it('international numbers and Arabic-Indic digits', () => {
    const r = maskText('UK +44 20 7946 0958 — جوال ٠٥١٢٣٤٥٦٧٨');
    expect(r.counts.phone).toBe(2);
    expect(r.masked).toBe('UK [هاتف-1] — جوال [هاتف-2]');
    expect(r.map['[هاتف-2]']).toBe('٠٥١٢٣٤٥٦٧٨');
  });
  it('IBAN with or without spaces is one token; its digits are not re-read as IDs or phones', () => {
    const r = maskText('IBAN: SA03 8000 0000 6080 1016 7519 ثم SA0380000000608010167519 ثم sa44 2000 0001 2345 6789 1234');
    expect(r.counts).toMatchObject({ iban: 3, phone: 0, nationalId: 0, cr: 0, vat: 0 });
    expect(r.masked).toBe('IBAN: [آيبان-1] ثم [آيبان-1] ثم [آيبان-2]');
  });
  it('emails, VAT numbers, national IDs and commercial registrations', () => {
    const r = maskText('البريد a.b-c@example.com والرقم الضريبي 310123456700003 وهوية 1012345678 وإقامة 2345678901 وس.ت 1010123456 و CR: 4030123456 و 7001234567');
    expect(r.counts).toMatchObject({ email: 1, vat: 1, nationalId: 2, cr: 3, phone: 0 });
    expect(r.masked).toBe('البريد [بريد-1] والرقم الضريبي [ضريبي-1] وهوية [هوية-1] وإقامة [هوية-2] و[سجل-1] و [سجل-2] و [سجل-3]');
    expect(r.map['[سجل-1]']).toBe('س.ت 1010123456');
  });
  it('a 15-digit VAT number is not split into a phone or an ID; plain amounts and dates are left alone', () => {
    const r = maskText('المبلغ 1250000.50 ريال بتاريخ 2026-10-12 والفاتورة رقم 1234 والضريبي 300000000000003');
    expect(r.total).toBe(1);
    expect(r.masked).toBe('المبلغ 1250000.50 ريال بتاريخ 2026-10-12 والفاتورة رقم 1234 والضريبي [ضريبي-1]');
  });
  it('nothing to mask returns the text unchanged with zero counts', () => {
    const r = maskText('ميزان المراجعة متزن والفروق صفر.');
    expect(r.masked).toBe('ميزان المراجعة متزن والفروق صفر.'); expect(r.total).toBe(0); expect(r.map).toEqual({});
  });
});

describe('maskText — master-data names', () => {
  it('Arabic names with spelling variants (alef, ta marbuta, tashkeel, spacing) and Latin names case-insensitively', () => {
    const r = maskText('فاتورة لمؤسسة الرّيان للتجاره ومبيعات اغنام  الوادي وتحويل من AL RAYAN trading إلى محمد عبدالله السالم', { names: NAMES });
    expect(r.counts.name).toBe(4);
    expect(r.masked).toBe('فاتورة ل[عميل-1] ومبيعات [عميل-2] وتحويل من [عميل-3] إلى [عميل-4]');
    expect(r.map['[عميل-2]']).toBe('اغنام  الوادي');
  });
  it('the longest name wins an overlap; a name inside another word is not a match', () => {
    const r = maskText('شركة الوادي للحوم ثم شركة الواديان', { names: ['شركة الوادي', 'شركة الوادي للحوم'] });
    expect(r.masked).toBe('[عميل-1] ثم شركة الواديان');
    expect(r.map['[عميل-1]']).toBe('شركة الوادي للحوم');
  });
  it('a name and its phone side by side: two tokens, no overlap, same spelling → same token across the text', () => {
    const r = maskText('محمد عبدالله السالم 0501112233\nمحمد عبدالله السالم 0501112233', { names: NAMES });
    expect(r.masked).toBe('[عميل-1] [هاتف-1]\n[عميل-1] [هاتف-1]');
    expect(r.total).toBe(4);
  });
  it('short or empty names are ignored; the list may carry duplicates', () => {
    const r = maskText('ab و cd', { names: ['ab', '', '  ', 'cd', 'cd'] });
    expect(r.total).toBe(0);
  });
  it('candidateNames keeps only the names whose words occur in the text (clitics and spelling folded); 30,000 names stay fast', () => {
    expect(candidateNames(NAMES, 'تحويل لمؤسسة الريان للتجارة واغنام الوادى')).toEqual(['مؤسسة الريان للتجارة', 'أغنام الوادي']);
    expect(candidateNames(NAMES, 'لا شيء هنا')).toEqual([]);
    const big = Array.from({ length: 30000 }, (_, i) => `عميل رقم ${i} ${['الحربي', 'العتيبي', 'القحطاني', 'الشمري'][i % 4]} ${i}`);
    big.push('شركة الوادي للحوم');
    const text = ('الميزان متزن؛ البائع شركة الوادي للحوم باع إلى عميل رقم 776 الحربي 776 بمبلغ 5000.\n').repeat(40);
    const t0 = Date.now(); const r = maskText(text, { names: big }); const ms = Date.now() - t0;
    expect(r.counts.name).toBe(80); expect(Object.keys(r.map)).toEqual(['[عميل-1]', '[عميل-2]']);
    expect(ms).toBeLessThan(1500);
  });
  it('a map passed back keeps earlier tokens stable and numbers new ones after them', () => {
    const a = maskText('0512345678', {});
    const b = maskText('0598765432 ثم 0512345678', { map: a.map });
    expect(b.masked).toBe('[هاتف-2] ثم [هاتف-1]');
    expect(b.map).toEqual({ '[هاتف-1]': '0512345678', '[هاتف-2]': '0598765432' });
  });
});

describe('unmask / idempotence', () => {
  const text = 'العميل مؤسسة الريان للتجارة (س.ت 1010123456) هاتفه +966 51 234 5678 وآيبانه SA03 8000 0000 6080 1016 7519 وبريده x@y.sa';
  it('mask → unmask returns the original text exactly', () => {
    const r = maskText(text, { names: NAMES });
    expect(r.total).toBe(5);
    expect(unmask(r.masked, r.map)).toBe(text);
  });
  it('masking an already-masked text changes nothing and adds no tokens', () => {
    const r = maskText(text, { names: NAMES });
    const again = maskText(r.masked, { names: NAMES, map: r.map });
    expect(again.masked).toBe(r.masked); expect(again.total).toBe(0); expect(again.map).toEqual(r.map);
    expect(tokenCount(r.masked)).toBe(5); expect(tokenCount(unmask(r.masked, r.map))).toBe(0);
  });
  it('an unknown token stays; the AI may reuse a token many times', () => {
    expect(unmask('[عميل-1] و[عميل-1] و[عميل-9]', { '[عميل-1]': 'أغنام الوادي' })).toBe('أغنام الوادي وأغنام الوادي و[عميل-9]');
  });
});

describe('maskBody / unmaskResponse — the Gemini shape', () => {
  it('masks the system instruction and every turn with one shared map, leaves inline documents, un-masks the answer', () => {
    const body = { systemInstruction: { parts: [{ text: 'أنت مراجع لشركة أغنام الوادي' }] },
      contents: [{ role: 'user', parts: [{ text: 'عميلنا أغنام الوادي هاتفه 0512345678' }, { inlineData: { mimeType: 'application/pdf', data: 'QUJD' } }] }, { role: 'model', parts: [{ text: 'حسناً' }] }],
      generationConfig: { temperature: 0 } };
    const m = maskBody(body, { names: NAMES });
    expect(m.body.systemInstruction!.parts![0].text).toBe('أنت مراجع لشركة [عميل-1]');
    expect(m.body.contents![0].parts![0].text).toBe('عميلنا [عميل-1] هاتفه [هاتف-1]');
    expect(m.body.contents![0].parts![1]).toEqual({ inlineData: { mimeType: 'application/pdf', data: 'QUJD' } });
    expect(m.body.generationConfig).toEqual({ temperature: 0 });
    expect(m.total).toBe(3); expect(m.counts).toMatchObject({ name: 2, phone: 1 });
    expect(m.text).toBe('أنت مراجع لشركة [عميل-1]\nعميلنا [عميل-1] هاتفه [هاتف-1]\nحسناً');
    expect(body.contents[0].parts[0].text).toBe('عميلنا أغنام الوادي هاتفه 0512345678'); /* the input is not mutated */
    const res = { candidates: [{ content: { role: 'model', parts: [{ text: 'راجعت [عميل-1]؛ اتصل على [هاتف-1]' }] }, finishReason: 'STOP' }], usageMetadata: { totalTokenCount: 9 } };
    const u = unmaskResponse(res, m.map);
    expect(responseText(u)).toBe('راجعت أغنام الوادي؛ اتصل على 0512345678');
    expect(u.usageMetadata).toEqual({ totalTokenCount: 9 });
    expect(unmaskResponse(undefined as never, m.map)).toBeUndefined();
  });
});

describe('preflight', () => {
  it('a clean masked text passes', () => {
    const r = maskText('العميل أغنام الوادي هاتفه 0512345678', { names: NAMES });
    const p = preflight(r.masked, { names: NAMES });
    expect(p).toMatchObject({ allowed: true, reasons: [], tableLines: 1 });
  });
  it('a residual phone or master-data name blocks; the policy may allow some', () => {
    const p = preflight('اتصل على 0512345678 لمؤسسة الريان للتجارة', { names: NAMES });
    expect(p.allowed).toBe(false); expect(p.reasons).toHaveLength(2);
    expect(p.reasons[0]).toMatch(/1 معرّفاً/); expect(p.reasons[1]).toMatch(/1 اسماً/);
    expect(preflight('اتصل على 0512345678', { maxUnmasked: 1 }).allowed).toBe(true);
  });
  it('a customer table (many lines of names/phones, masked or raw) is blocked; a short list is not', () => {
    const rows = Array.from({ length: 45 }, (_, i) => `عميل ${i};[عميل-${i + 1}];[هاتف-${i + 1}]`).join('\n');
    const p = preflight(rows);
    expect(p.allowed).toBe(false); expect(p.tableLines).toBe(45); expect(p.reasons[0]).toMatch(/جدول عملاء/);
    const raw = Array.from({ length: DEFAULT_POLICY.tableRows }, (_, i) => `زبون ${i}, 05${String(10000000 + i).padStart(8, '0')}`).join('\n');
    expect(preflight(raw).reasons.some((x) => /جدول عملاء/.test(x))).toBe(true);
    expect(preflight(rows.split('\n').slice(0, 10).join('\n')).allowed).toBe(true);
    expect(preflight(rows, { tableRows: 100 }).allowed).toBe(true);
  });
  it('an oversize request is blocked', () => {
    const p = preflight('ن'.repeat(1000), { maxBytes: 1500 });
    expect(p.allowed).toBe(false); expect(p.bytes).toBe(2000); expect(p.reasons[0]).toMatch(/2000 بايت/);
    expect(utf8Bytes('a€😀')).toBe(1 + 3 + 4);
  });
});

describe('traceRecord', () => {
  it('builds a complete row with defaults, never a prompt', () => {
    const r = traceRecord({ company: 'co-1', gate: 'accounting', screen: 'ledger', provider: 'gemini', model: 'gemini-2.5-flash', promptHash: sha256Hex('x'), maskedCount: 3, maskedKinds: { phone: 2, name: 1, iban: 0 }, inputBytes: 120, outputBytes: 80, outcome: 'ok', durationMs: 1234.6, userNote: ' ملاحظة  طويلة ' });
    expect(r).toMatchObject({ company: 'co-1', gate: 'accounting', screen: 'ledger', purpose: 'ledger', provider: 'gemini', maskedCount: 3, maskedKinds: { phone: 2, name: 1 }, inputBytes: 120, outputBytes: 80, outcome: 'ok', durationMs: 1235, userNote: 'ملاحظة طويلة', error: '' });
    expect(r.id).toMatch(/^ai-/); expect(Date.parse(r.ts)).toBeGreaterThan(0); expect(r.promptHash).toHaveLength(64);
    expect(traceSafe(r)).toBe(true);
    expect(traceSafe({ ...r, prompt: 'x' })).toBe(false); expect(traceSafe({ ...r, body: {} })).toBe(false);
  });
  it('normalises bad input: unknown outcome → ok, negative sizes → 0, a bad hash → empty, an error only on failures', () => {
    const r = traceRecord({ outcome: 'weird' as never, inputBytes: -5, promptHash: 'nope', error: 'x' });
    expect(r).toMatchObject({ outcome: 'ok', inputBytes: 0, promptHash: '', error: '', purpose: 'عام' });
    expect(traceRecord({ outcome: 'blocked', error: 'بقي معرّف' }).error).toBe('بقي معرّف');
  });
  it('summary and filters', () => {
    const rows = [traceRecord({ provider: 'gemini', purpose: 'ledger', outcome: 'ok', maskedCount: 2, inputBytes: 10, outputBytes: 5 }), traceRecord({ provider: 'openai', purpose: 'tb-review', outcome: 'error', maskedCount: 1, inputBytes: 7 }), traceRecord({ provider: 'gemini', purpose: 'ledger', outcome: 'blocked', screen: 'ledger', userNote: 'جدول' })];
    const s = traceSummary(rows);
    expect(s).toMatchObject({ total: 3, ok: 1, error: 1, blocked: 1, masked: 3, inputBytes: 17, outputBytes: 5, byProvider: { gemini: 2, openai: 1 }, byPurpose: { ledger: 2, 'tb-review': 1 } });
    expect(filterTrace(rows, { provider: 'gemini' })).toHaveLength(2);
    expect(filterTrace(rows, { outcome: 'blocked' })).toHaveLength(1);
    expect(filterTrace(rows, { purpose: 'ledger', q: 'جدول' })).toHaveLength(1);
    expect(filterTrace(rows, {})).toHaveLength(3);
  });
});

describe('sha256Hex', () => {
  it('matches the published vectors and hashes UTF-8', () => {
    expect(sha256Hex('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    expect(sha256Hex('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    expect(sha256Hex('The quick brown fox jumps over the lazy dog')).toBe('d7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592');
    expect(sha256Hex('a'.repeat(1000))).toBe('41edece42d63e8d9bf515a9ba6932e1c20cbc9f5a5d134645adb5db1b9737ea3');
    expect(sha256Hex('مرحبا')).toMatch(/^[0-9a-f]{64}$/);
    expect(sha256Hex('مرحبا')).not.toBe(sha256Hex('مرحبا '));
  });
});
