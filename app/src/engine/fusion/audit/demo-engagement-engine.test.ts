import { describe, expect, it } from 'vitest';
import { parseTrialBalance, SAMPLE_TB_CSV } from '../reports/tb-import-engine';
import { addRound, addUpload, deriveOpinion, newSession, normalizeFinal, normalizeRound, outstanding, sessionState } from './ai-review-engine';
import { documents, final, followUpDocuments, pickInsufficient, round1, round2, round3 } from './demo-engagement-engine';
import { reviewTrialBalance } from './tb-review-engine';

describe('demonstration engagement', () => {
  const tb = parseTrialBalance(SAMPLE_TB_CSV);
  const review = reviewTrialBalance(tb, {});
  const ctx = { company: 'شركة تجريبية للتجارة', periodEnd: '2025-12-31', currency: 'ر.س', auditFirm: 'مكتب المراجعة' };

  it('walks three rounds through the same guard rails as the AI reviewer, then the final report', () => {
    let s = newSession({ company: ctx.company, period: '2025', periodEnd: ctx.periodEnd, framework: 'IFRS' }, 'محاكاة SQC');
    const r1 = normalizeRound(round1(review, ctx), s, tb, 'محاكاة SQC');
    expect(r1.status).toBe('needs_docs');
    expect(r1.requests.length).toBeGreaterThan(2);
    expect(r1.opinions).toHaveLength(3);
    expect(r1.warnings).toEqual([]);
    s = addRound(s, r1);
    expect(sessionState(s).state).toBe('awaiting-docs');

    const docs = documents(review, r1.requests, ctx);
    expect(docs).toHaveLength(r1.requests.length);
    expect(docs[0].text).toContain('مستند تجريبي');
    docs.forEach((d) => { s = addUpload(s, { requestId: d.requestId, fileName: d.fileName, mimeType: 'text/plain', size: d.text.length }); });
    const weak = pickInsufficient(review, r1.requests);
    const r2 = normalizeRound(round2(review, r1.requests, docs, ctx), s, tb, 'محاكاة SQC');
    expect(r2.reviewed).toHaveLength(docs.length);
    expect(r2.reviewed.filter((d) => d.verdict === 'غير كافٍ').map((d) => d.requestId)).toEqual([weak]);
    expect(r2.requests.filter((q) => q.round === 2)).toHaveLength(1);
    s = addRound(s, r2);
    const follow = r2.requests.find((q) => q.round === 2)!;
    expect(outstanding(s).map((q) => q.id).sort()).toEqual([weak, follow.id].sort());

    const fu = followUpDocuments(review, r1.requests.find((q) => q.id === weak), follow, ctx);
    fu.forEach((d) => { s = addUpload(s, { requestId: d.requestId, fileName: d.fileName, mimeType: 'text/plain', size: d.text.length }); });
    const r3 = normalizeRound(round3(review, fu, ctx), s, tb, 'محاكاة SQC');
    expect(r3.warnings).toEqual([]);
    expect(r3.status).toBe('complete');
    s = addRound(s, r3);
    expect(outstanding(s)).toEqual([]);
    expect(sessionState(s).state).toBe('complete');

    const derived = deriveOpinion(tb, review, s, review.adjustments);
    const f = normalizeFinal(final(review, derived, [{ title: 'الاعتراف بالإيرادات', why: 'حجمها', how: 'اختبار القطع' }], ctx), s, tb);
    expect(f.aiOpinion).toBe(({ unmodified: 'غير معدل', qualified: 'متحفظ', adverse: 'عكسي', disclaimer: 'امتناع عن إبداء الرأي' } as Record<string, string>)[derived.opinion]);
    expect(f.kams).toHaveLength(1);
    expect(f.compliance.length).toBeGreaterThan(0);
    expect(f.closing).toContain('تجريبية');
  });
});
