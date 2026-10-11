import { describe, expect, it } from 'vitest';
import { parseTrialBalance, SAMPLE_TB_CSV } from '../reports/tb-import-engine';
import { addRound, addUpload, deriveOpinion, newSession, normalizeFinal, normalizeRound, outstanding, sessionState } from './ai-review-engine';
import { documents, final, followUpDocuments, pickInsufficient, round1, round2, round3 } from './demo-engagement-engine';
import { reviewTrialBalance } from './tb-review-engine';

describe('demonstration engagement', () => {
  const tb = parseTrialBalance(SAMPLE_TB_CSV);
  const review = reviewTrialBalance(tb, {});
  const ctx = { company: 'شركة تجريبية للتجارة', periodEnd: '2025-12-31', currency: 'ر.س', auditFirm: 'مكتب المراجعة' };

  it('retains three-round simulation flow without converting synthetic documents into professional assurance', () => {
    let s = newSession({ company: ctx.company, period: '2025', periodEnd: ctx.periodEnd, framework: 'IFRS' }, 'محاكاة SQC');
    const r1 = normalizeRound(round1(review, ctx), s, tb, 'محاكاة SQC');
    expect(r1.status).toBe('needs_docs');
    expect(r1.requests.length).toBeGreaterThan(2);
    expect(r1.opinions).toHaveLength(3);
    expect(r1.origin).toBe('simulation');
    expect(r1.warnings.join(' ')).toContain('محاكاة');
    s = addRound(s, r1);
    expect(sessionState(s).state).toBe('awaiting-docs');

    const docs = documents(review, r1.requests, ctx);
    expect(docs).toHaveLength(r1.requests.length);
    expect(docs[0].text).toContain('مستند تجريبي');
    docs.forEach((d) => { s = addUpload(s, { requestId: d.requestId, fileName: d.fileName, mimeType: 'text/plain', size: d.text.length }); });
    const weak = pickInsufficient(review, r1.requests);
    const r2 = normalizeRound(round2(review, r1.requests, docs, ctx), s, tb, 'محاكاة SQC');
    expect(r2.reviewed).toHaveLength(docs.length);
    expect(r2.reviewed.every((d) => d.verdict === 'غير كافٍ' && d.origin === 'simulation')).toBe(true);
    expect(r2.requests.filter((q) => q.round === 2)).toHaveLength(1);
    s = addRound(s, r2);
    const follow = r2.requests.find((q) => q.round === 2)!;
    expect(outstanding(s).map((q) => q.id)).toEqual(expect.arrayContaining([weak, follow.id]));

    const fu = followUpDocuments(review, r1.requests.find((q) => q.id === weak), follow, ctx);
    fu.forEach((d) => { s = addUpload(s, { requestId: d.requestId, fileName: d.fileName, mimeType: 'text/plain', size: d.text.length }); });
    const r3 = normalizeRound(round3(review, fu, ctx), s, tb, 'محاكاة SQC');
    expect(r3.warnings.join(' ')).toContain('محاكاة');
    expect(r3.status).toBe('needs_docs');
    expect(r3.decision).toBe('escalate');
    s = addRound(s, r3);
    expect(outstanding(s).length).toBeGreaterThan(0);
    expect(sessionState(s).state).not.toBe('complete');

    const derived = deriveOpinion(tb, review, s, review.adjustments);
    const f = normalizeFinal(final(review, derived, [{ title: 'الاعتراف بالإيرادات', why: 'حجمها', how: 'اختبار القطع' }], ctx), s, tb);
    expect(derived.opinion).toBe('not-assessed');
    expect(f.aiOpinion).toBe('لم يُقيّم');
    expect(f.origin).toBe('simulation');
    expect(f.kams).toHaveLength(0);
    expect(f.compliance).toEqual([]);
    expect(f.letter).toEqual([]);
    expect(f.closing).toContain('تجريبية');
  });
});
