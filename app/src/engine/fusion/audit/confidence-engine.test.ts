import { describe, expect, it } from 'vitest';
import {
  agreement, approve, assertionKey, confidence, confidenceMatrix, coverage, derivedState, expectedGain, materialityWeight, newEngagement,
  rankRequests, stopRule, testScore, thresholdFor, transition, type EvidenceItem,
} from './confidence-engine';

describe('the confidence model of the audit council (research ch. 9)', () => {
  it('maps the statement lines’ Arabic assertions to the six ISA 315 assertions', () => {
    expect(['الوجود', 'الحقوق', 'الاكتمال', 'الدقه', 'القطع', 'التقييم', 'العرض', 'الالتزامات', 'غير معروف'].map(assertionKey))
      .toEqual(['existence', 'existence', 'completeness', 'accuracy', 'cutoff', 'valuation', 'presentation', 'existence', null]);
  });

  it('computes E from reliability-weighted coverage, T from misstatements vs PM, A from agreement', () => {
    // a 100,000 balance: a bank confirmation of 60,000 (1.0) and an internal document of 50,000 in a weak control environment (0.4)
    const E = coverage([{ kind: 'confirmation', amount: 6_000_000, accepted: true }, { kind: 'internal-weak', amount: 5_000_000, accepted: true }, { kind: 'external', amount: 9_000_000, accepted: false }], 10_000_000);
    expect(E).toBeCloseTo(0.8, 5);
    // reliability caps what one document can prove: an external document covering the whole balance gives 0.8
    expect(coverage([{ kind: 'external', amount: 50_000_000, accepted: true }], 10_000_000)).toBe(0.8);
    expect(testScore(0, 1_000_000)).toBe(1);
    expect(testScore(250_000, 1_000_000)).toBe(0.75);
    expect(testScore(3_000_000, 1_000_000)).toBe(0);
    expect(agreement([0.8, 0.8, 0.8])).toBe(1);
    expect(agreement([0.2, 0.9])!).toBeCloseTo(0.3, 5);
    expect(agreement([])).toBeNull();
    expect(confidence({ E: 0.8, T: 0.75, A: 1 })).toBe(0.83);
    // no council vote: A's weight is shared by E and T (0.5/0.8 and 0.3/0.8)
    expect(confidence({ E: 0.8, T: 0.75, A: null })).toBe(0.78);
  });

  it('sets thresholds by materiality and risk and builds the line × assertion matrix', () => {
    expect([thresholdFor({ significant: true, level: 'عالٍ' }), thresholdFor({ significant: true, level: 'متوسط' }), thresholdFor({ significant: true, level: 'منخفض' }), thresholdFor({ significant: false, level: 'عالٍ' })])
      .toEqual([0.9, 0.8, 0.7, null]);
    const ev: EvidenceItem[] = [{ id: 'DOC-1', lineKey: 'receivables', assertions: ['existence'], kind: 'confirmation', amount: 8_000_000, accepted: true }];
    const m = confidenceMatrix({
      lines: [{ lineKey: 'receivables', ar: 'ذمم مدينة', amount: 8_000_000, level: 'عالٍ', significant: true }, { lineKey: 'cash', ar: 'النقد', amount: 100_000, level: 'منخفض', significant: false }],
      assertions: { receivables: ['existence', 'valuation'], cash: ['existence'] }, evidence: ev, misstatements: { 'receivables|valuation': 500_000 },
      council: { 'receivables|existence': [0.9, 0.95], 'receivables|valuation': [0.4, 0.8] }, pm: 1_000_000,
    });
    const rec = m.rows[0];
    expect(rec.threshold).toBe(0.9);
    expect(rec.cells.map((c) => [c.assertion, c.E, c.T, c.C, c.met])).toEqual([['existence', 1, 1, 0.99, true], ['valuation', 0, 0.5, 0.27, false]]);
    expect(rec.met).toBe(false);
    expect(m.rows[1].threshold).toBeNull();
    expect(m.rows[1].met).toBeNull();
    expect(m.open.map((r) => r.lineKey)).toEqual(['receivables']);
    expect(m.avgOpen).toBe(0.27);
    // the reviewer may lower a line's threshold with a documented reason
    const o = confidenceMatrix({ lines: [{ lineKey: 'cash', ar: 'النقد', amount: 100, level: 'منخفض', significant: true }], assertions: { cash: ['existence'] }, evidence: [], misstatements: {}, pm: 1000, overrides: { cash: { threshold: 0.5, reason: 'إجراءات بديلة موثقة' } } });
    expect([o.rows[0].threshold, o.rows[0].cells[0].C, o.allMet]).toEqual([0.5, 0.37, false]);
  });

  it('stops on sufficiency, escalates on fraud, disagreement, no improvement or the round limit', () => {
    expect(stopRule({ avgOpen: [0.5], allMet: true, round: 2, maxRounds: 6 }).decision).toBe('sufficient');
    expect(stopRule({ avgOpen: [0.5], allMet: false, round: 1, maxRounds: 6, fraud: true }).code).toBe('fraud');
    expect(stopRule({ avgOpen: [0.5], allMet: false, round: 1, maxRounds: 6, disagreement: true }).code).toBe('disagreement');
    expect(stopRule({ avgOpen: [0.4, 0.5, 0.6], allMet: false, round: 6, maxRounds: 6 }).code).toBe('max-rounds');
    expect(stopRule({ avgOpen: [0.62, 0.63], allMet: false, round: 2, maxRounds: 6 }).code).toBe('stalled');
    expect(stopRule({ avgOpen: [0.4, 0.6], allMet: false, round: 2, maxRounds: 6 }).decision).toBe('continue');
  });

  it('ranks requests by expected gain × materiality weight ÷ client effort', () => {
    const m = confidenceMatrix({ lines: [{ lineKey: 'revenue', ar: 'الإيرادات', amount: 50_000_000, level: 'عالٍ', significant: true }], assertions: { revenue: ['existence'] }, evidence: [], misstatements: {}, pm: 1_000_000 });
    const big = expectedGain(m.rows[0], 'existence', 'confirmation', 20_000_000, { evidence: [] }), small = expectedGain(m.rows[0], 'existence', 'internal-weak', 2_000_000, { evidence: [] });
    expect(big).toBeGreaterThan(small);
    const ranked = rankRequests([
      { id: 'twenty-invoices', expectedGain: small * 20, materialityWeight: materialityWeight(50_000_000, 2_000_000), effort: 'high' as const },
      { id: 'top-customer-confirmation', expectedGain: big, materialityWeight: materialityWeight(50_000_000, 2_000_000), effort: 'low' as const },
    ]);
    expect(ranked.map((r) => r.id)).toEqual(['top-customer-confirmation', 'twenty-invoices']);
    expect(materialityWeight(50_000_000, 2_000_000)).toBe(10);
  });

  it('runs the engagement as a state machine with mandatory human approvals', () => {
    let e = newEngagement();
    e = transition(e, 'setup', 'م. أحمد', 'ميزان مستلم');
    expect(() => transition(e, 'analysis', 'م. أحمد', '')).toThrow('اعتمد الأهمية النسبية');
    e = approve(e, 'plan', 'م. أحمد', 'الأساس: الربح قبل الزكاة');
    e = transition(e, 'analysis', 'م. أحمد', 'بدء الجولة');
    expect(() => transition(e, 'approved', 'x', '')).toThrow('انتقال غير مسموح');
    e = transition(transition(e, 'council', 'النظام', 'الجولة 1'), 'draft-report', 'النظام', 'اكتفاء');
    expect(() => transition(e, 'approved', 'م. أحمد', '')).toThrow('اعتماد التقرير');
    e = approve(e, 'requests', 'م. أحمد', '', new Date(), 1);
    e = transition(approve(e, 'report', 'م. أحمد'), 'approved', 'م. أحمد', 'توقيع');
    expect(e.state).toBe('approved');
    expect(e.history.map((h) => h.to)).toEqual(['setup', 'analysis', 'council', 'draft-report', 'approved']);
    expect(e.requestsApproved).toEqual([1]);
    expect(() => approve(e, 'plan', '  ')).toThrow('اسم المراجع');
    expect([derivedState({ hasTb: false, planApproved: false, rounds: 0, reportApproved: false }), derivedState({ hasTb: true, planApproved: true, rounds: 2, lastDecision: 'escalate', reportApproved: false }), derivedState({ hasTb: true, planApproved: true, rounds: 1, lastDecision: 'continue', reportApproved: false })])
      .toEqual(['new', 'human-review', 'awaiting-client']);
  });
});
