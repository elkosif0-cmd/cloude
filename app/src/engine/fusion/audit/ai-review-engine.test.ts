import { describe, expect, it } from 'vitest';
import { parseTrialBalance, SAMPLE_TB_CSV } from '../reports/tb-import-engine';
import { reviewTrialBalance } from './tb-review-engine';
import { accountStandards, addRound, addUpload, buildFinalBody, buildRoundBody, deriveOpinion, extractText, friendlyError, markUnavailable, mergedFindings,
  newSession, normalizeFinal, normalizeRound, outstanding, parseJsonLoose, pendingUploads, ROUND_SCHEMA, sessionState, systemPrompt } from './ai-review-engine';

const tb = parseTrialBalance(SAMPLE_TB_CSV);
const review = reviewTrialBalance(tb);
const ctx = { company: 'شركة تجريبية', period: '2025', framework: 'IFRS' as const };
const T0 = new Date('2026-09-25T10:00:00Z');

const round1 = {
  status: 'needs_docs', executiveSummary: 'الميزان متوازن مع حاجة لأدلة الإيراد والمخزون.', riskScore: 140,
  boardOpinions: [{ reviewer: 'مدقق المخاطر والأدلة', opinion: 'الإيراد خطر مفترض.' }],
  accountStandards: [{ accountCode: '1141', standards: ['IAS2', 'ISA 501', 'IAS 77'], note: 'قياس بالتكلفة أو صافي القيمة' }, { accountCode: '9999', standards: ['IAS 1'] }],
  findings: [{ accountCode: '1141', accountName: 'مخزون بضاعة', standardCode: 'ias 2', issueType: 'قياس', severity: 'عالية', amount: '50,000', comment: 'لا يوجد دليل على اختبار صافي القيمة. يلزم تحليل.', recommendation: 'طلب تقرير الراكد' }],
  requestedDocuments: [{ id: 'REQ-1', title: 'قوائم الجرد الموقعة', purpose: 'الوجود', relatedAccounts: ['1141'], priority: 'عالية' }, { id: 'REQ-1', title: 'تحليل الإيراد الشهري', purpose: 'تحليلي', priority: 'متوسطة' }],
  documentsReviewed: [],
  proposedAdjustments: [
    { title: 'تخفيض المخزون', reason: 'راكد', standardCode: 'IAS 2', lines: [{ accountCode: '5101', accountName: 'تكلفة المبيعات', debit: '2,500', credit: '0' }, { accountCode: '1141', accountName: 'مخزون بضاعة', debit: '0', credit: '2500' }] },
    { title: 'قيد غير متوازن', reason: 'x', standardCode: 'IAS 1', lines: [{ accountCode: '6101', accountName: 'رواتب', debit: '100', credit: '0' }, { accountCode: '2101', accountName: 'موردون', debit: '0', credit: '90' }] },
  ],
  nextStepGuidance: 'ارفع قوائم الجرد.',
};

describe('Gemini review rounds', () => {
  it('builds a structured round request with the trial balance and the engine findings', () => {
    const s = newSession(ctx, 'gemini-2.5-flash', T0);
    const body = buildRoundBody(s, tb, review);
    expect(body.generationConfig.responseMimeType).toBe('application/json');
    expect(body.generationConfig.responseSchema).toBe(ROUND_SCHEMA);
    const text = body.contents[0].parts.map((p) => ('text' in p ? p.text : '')).join('\n');
    expect(text).toContain('1141 | مخزون بضاعة');
    expect(text).toContain('الأهمية النسبية');
    expect(systemPrompt(ctx)).toContain('IFRS 18');
  });
  it('normalizes a round: codes, severities, request ids, balanced entries only', () => {
    const s = newSession(ctx, 'gemini-2.5-flash', T0);
    const r = normalizeRound(round1, s, tb, 'gemini-2.5-flash', T0);
    expect(r.riskScore).toBe(100);
    expect(r.accountStandards['1141']).toEqual({ standards: ['IAS 2', 'ISA 501'], unknown: ['IAS 77'], note: 'قياس بالتكلفة أو صافي القيمة' });
    expect(r.accountStandards['9999']).toBeUndefined();
    expect(r.findings[0]).toMatchObject({ severity: 'high', kind: 'measurement', code: '1141', standard: 'IAS 2', basis: 'المبلغ المتأثر 50,000 ر.س', source: 'gemini', round: 1 });
    expect(r.requests.map((q) => q.id)).toEqual(['REQ-1', 'REQ-2']);
    expect(r.adjustments[0]).toMatchObject({ valid: true, lines: [{ debit: 250000 }, { credit: 250000 }] });
    expect(r.adjustments[1].valid).toBe(false);
    expect(r.warnings.join(' ')).toContain('غير متوازن');
  });
  it('runs uploads through the next round until complete', () => {
    let s = addRound(newSession(ctx, 'm', T0), normalizeRound(round1, newSession(ctx, 'm', T0), tb, 'm', T0));
    expect(outstanding(s).map((q) => q.id)).toEqual(['REQ-1', 'REQ-2']);
    expect(sessionState(s).state).toBe('awaiting-docs');
    s = addUpload(s, { requestId: 'REQ-1', fileName: 'جرد.pdf', mimeType: 'application/pdf', size: 2048, data: 'JVBERi0=' });
    expect(pendingUploads(s)).toHaveLength(1);
    expect(sessionState(s).state).toBe('ready');
    const body = buildRoundBody(s, tb, review);
    expect(body.contents[0].parts.some((p) => 'inlineData' in p && p.inlineData.mimeType === 'application/pdf')).toBe(true);
    s = markUnavailable(s, 'REQ-2');
    const r2 = normalizeRound({ status: 'complete', executiveSummary: 'اكتملت', riskScore: 30, boardOpinions: [], findings: [], requestedDocuments: [],
      documentsReviewed: [{ fileName: 'جرد', verdict: 'مقبول', notes: 'موقعة', extracted: { documentDate: '2025-12-31', amount: '50000' } }], nextStepGuidance: '' }, s, tb, 'm', T0);
    expect(r2.reviewed[0]).toMatchObject({ requestId: 'REQ-1', fileName: 'جرد.pdf', verdict: 'مقبول' });
    s = addRound(s, r2);
    expect(outstanding(s)).toHaveLength(0);
    expect(sessionState(s).state).toBe('complete');
    expect(accountStandards(review, s)['1141']).toEqual(['IAS 2', 'ISA 501']);
    expect(mergedFindings(review, s).some((f) => f.source === 'gemini')).toBe(true);
  });
  it('has no round cap, and concludes when every remaining request is declared unavailable by the entity', () => {
    let s = addRound(newSession(ctx, 'm', T0), normalizeRound(round1, newSession(ctx, 'm', T0), tb, 'm', T0));
    for (let i = 0; i < 12; i++) s = { ...s, rounds: [...s.rounds, { ...s.rounds[0], no: s.rounds.length + 1 }] };
    expect(sessionState(s).state).toBe('awaiting-docs');                  // twelve rounds and still asking: no «limit»
    s = markUnavailable(markUnavailable(s, 'REQ-1'), 'REQ-2');
    const st = sessionState(s);
    expect(st.state).toBe('complete');
    expect(st.label).toContain('أقرت الإدارة بعدم توفره');
    expect(sessionState(s, 5).state).toBe('complete');                    // a firm's own cap still applies only while documents are awaited
  });
  it('refuses «complete» when the same round asks for documents', () => {
    const r = normalizeRound({ ...round1, status: 'complete' }, newSession(ctx, 'm', T0), tb, 'm', T0);
    expect(r.status).toBe('needs_docs');
  });
  it('derives the opinion from uncorrected misstatements and scope limitations (ISA 705)', () => {
    const s0 = addRound(newSession(ctx, 'm', T0), normalizeRound(round1, newSession(ctx, 'm', T0), tb, 'm', T0));
    expect(deriveOpinion(tb, review, s0, s0.rounds[0].adjustments).opinion).toBe('unmodified');
    const big = normalizeRound({ ...round1, proposedAdjustments: [{ title: 'إيراد غير متحقق', reason: 'قطع', standardCode: 'IFRS 15', lines: [{ accountCode: '4101', accountName: 'المبيعات', debit: '10000', credit: '0' }, { accountCode: '1121', accountName: 'عملاء', debit: '0', credit: '10000' }] }] }, newSession(ctx, 'm', T0), tb, 'm', T0);
    const s1 = addRound(newSession(ctx, 'm', T0), big);
    expect(deriveOpinion(tb, review, s1, []).opinion).toBe('qualified');
    expect(deriveOpinion(tb, review, s1, s1.rounds[0].adjustments).opinion).toBe('unmodified');
    const s2 = markUnavailable(s1, 'REQ-1');
    expect(deriveOpinion(tb, review, s2, s1.rounds[0].adjustments)).toMatchObject({ opinion: 'qualified', isa: 'ISA 705.7' });
  });
  it('builds and normalizes the final report', () => {
    const s = addRound(newSession(ctx, 'm', T0), normalizeRound(round1, newSession(ctx, 'm', T0), tb, 'm', T0));
    const d = deriveOpinion(tb, review, s, []);
    const body = buildFinalBody(s, tb, review, d);
    expect(JSON.stringify(body)).toContain('ISA 705');
    const f = normalizeFinal({ overallOpinion: 'غير معدل', headline: 'h', summary: 's', keyAuditMatters: [{ title: 'الإيراد', why: 'خطر', how: 'فحص' }],
      complianceDiscussion: [{ standardCode: 'ifrs15', status: 'ممتثل', discussion: 'd' }], adjustments: [], managementLetter: [], closingStatement: 'c' }, s, tb, T0);
    expect(f.compliance[0].standardCode).toBe('IFRS 15');
    expect(f.kams).toHaveLength(1);
  });
  it('parses API envelopes and loose JSON and explains errors', () => {
    expect(extractText({ candidates: [{ content: { parts: [{ text: '{"a":' }, { text: '1}' }] }, finishReason: 'STOP' }] })).toEqual({ text: '{"a":1}', finishReason: 'STOP', blocked: false });
    expect(parseJsonLoose('```json\n{"x":2}\n```')).toEqual({ x: 2 });
    expect(parseJsonLoose('نص {"x":3} نص')).toEqual({ x: 3 });
    expect(parseJsonLoose('لا شيء')).toBeNull();
    expect(friendlyError(400, 'API key not valid')).toContain('غير صالح');
    expect(friendlyError(429)).toContain('429');
  });

  it('carries the council chair’s decision, confidences and dissent, and drops citations to evidence that does not exist', () => {
    const s = newSession(ctx, 'm', T0);
    const r = normalizeRound({ ...round1, decision: 'escalate', confidence: [{ lineKey: 'revenue', assertion: 'existence', value: 1.4 }],
      dissent: [{ member: 'المراجع المتشكك', note: 'هامش غير معتاد', citations: ['T-ANL-001', 'T-ANL-099'] }],
      findings: [{ accountCode: '4101', accountName: 'المبيعات', standardCode: 'IFRS 15', severity: 'متوسطة', comment: 'ارتفاع', recommendation: 'فحص', citations: ['TB-4101', 'X-1'] }],
      requestedDocuments: [{ id: 'REQ-1', title: 'عقود أكبر ثلاثة عملاء', purpose: 'الحدوث', priority: 'عالية', lineKey: 'revenue', assertion: 'existence', effort: 'low', citations: ['T-ANL-001'] }] },
      s, tb, 'm', T0, new Set(['T-ANL-001', 'TB-4101']));
    expect(r.decision).toBe('escalate');
    expect(r.confidence).toEqual([{ lineKey: 'revenue', assertion: 'existence', value: 1 }]);
    expect(r.dissent![0].citations).toEqual(['T-ANL-001']);
    expect(r.findings[0].citations).toEqual(['TB-4101']);
    expect([r.requests[0].assertion, r.requests[0].effort, r.requests[0].lineKey]).toEqual(['existence', 'low', 'revenue']);
    expect(r.warnings.filter((w) => w.startsWith('استشهاد')).length).toBe(2);
    const body = buildRoundBody(s, tb, review, { council: 'آراء الأعضاء…' });
    expect(JSON.stringify(body)).toContain('أنت رئيس المجلس');
  });
});
