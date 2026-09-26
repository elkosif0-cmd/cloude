import { describe, expect, it } from 'vitest';
import { parseTrialBalance, SAMPLE_TB_CSV } from '../reports/tb-import-engine';
import { reviewTrialBalance, type Adjustment } from './tb-review-engine';
import { areaOf, completion, evidenceFromFieldwork, HUMAN_CHECKS, leadSchedules, representationLetter, riskMatrix, sampleSize, signOff, workingPapers, wpStatus } from './fieldwork-engine';

const tb = parseTrialBalance(SAMPLE_TB_CSV);
const review = reviewTrialBalance(tb);

describe('risk × assertion matrix (ISA 315)', () => {
  it('lists every line with a balance, its assertions, WP reference and the presumed revenue fraud risk', () => {
    const m = riskMatrix(review, { activity: 'تجارة اللحوم' });
    const rev = m.find((r) => r.lineKey === 'revenue')!;
    expect(rev.ref).toBe('B');
    expect(rev.fraud).toBe(true);
    expect(rev.assertions).toContain('الحدوث');
    expect(rev.theme).toBeTruthy();
    for (let i = 1; i < m.length; i++) expect(m[i - 1].score).toBeGreaterThanOrEqual(m[i].score);
  });
});

describe('sample size (MUS, ISA 530)', () => {
  it('follows n = ⌈population × factor ÷ (PM − expected × expansion)⌉', () => {
    expect(sampleSize({ population: 1_000_000, performance: 50_000, risk: 'high' }).n).toBe(60);
    expect(sampleSize({ population: 1_000_000, performance: 50_000, risk: 'low' }).n).toBe(33); // 1.61 × 20
    expect(sampleSize({ population: 1_000_000, performance: 50_000, risk: 'high', expected: 10_000 }).n).toBe(89); // 3,000,000 ÷ 34,000
  });
  it('tests key items in full and refuses when the expected error uses up performance materiality', () => {
    const s = sampleSize({ population: 1_000_000, performance: 50_000, risk: 'moderate', keyItems: 400_000 });
    expect(s.keyItems).toBe(400_000);
    expect(s.n).toBe(Math.ceil((600_000 * 2.31) / 50_000));
    expect(sampleSize({ population: 1_000, performance: 100, risk: 'high', expected: 100 }).n).toBeNull();
  });
});

describe('working papers (ISA 330 / 230)', () => {
  const wps = workingPapers(review, { activity: 'تجارة اللحوم' });
  it('opens one paper per area with a balance, with numbered steps and a sample', () => {
    expect(wps.map((w) => w.ref)).toContain('A');
    expect(wps.map((w) => w.ref)).toContain('B');
    for (const w of wps) {
      expect(w.steps[0].text).toContain('Lead');
      expect(w.steps.every((s, i) => s.id === `${w.ref}-${i + 1}`)).toBe(true);
      expect(new Set(w.steps.map((s) => s.text)).size).toBe(w.steps.length);
    }
    expect(wps.find((w) => w.ref === 'B')!.steps.some((s) => s.source === 'fraud')).toBe(true);
    for (const w of wps) if (!['A', 'M', 'Q', 'T'].includes(w.ref)) expect(w.sample.n).toBeGreaterThan(0);
    expect(wps.find((w) => w.ref === 'A')!.sample).toMatchObject({ n: null, confidence: 100 });
  });
  it('adds the procedures the bundle auditors performed when an area carries a significant risk', () => {
    const sig = wps.filter((w) => w.significant && w.lines.some((k) => ['revenue', 'receivables', 'inventory', 'ppe', 'eosb'].includes(k)));
    expect(sig.length).toBeGreaterThan(0);
    for (const w of sig) {
      expect(w.steps.some((s) => s.source === 'global' && s.cite)).toBe(true);
      expect(w.precedents.length).toBeGreaterThan(0);
    }
  });
  it('signs off preparer then a different reviewer, only when steps and conclusion are complete', () => {
    const w = wps[0], all = w.steps.map((s) => s.id);
    expect(signOff(w, { done: all.slice(1) }, 'preparer', 'سارة').ok).toBe(false);
    expect(signOff(w, { done: all }, 'preparer', 'سارة').ok).toBe(false); // no conclusion
    const p = signOff(w, { done: all, conclusion: 'الرصيد عادل' }, 'preparer', 'سارة');
    expect(p.ok).toBe(true);
    const s1 = (p as { value: object }).value;
    expect(signOff(w, s1, 'reviewer', 'سارة')).toEqual({ ok: false, error: expect.stringContaining('فصل المهام') });
    const r = signOff(w, s1, 'reviewer', 'خالد');
    expect(r.ok && wpStatus(w, r.value).status).toBe('reviewed');
    expect(signOff(w, {}, 'reviewer', 'خالد').ok).toBe(false);
  });
});

describe('evidence from the signed papers', () => {
  it('counts a reviewed paper as accepted evidence for its lines and a prepared one as partial', () => {
    const wps = workingPapers(review);
    const a = wps.find((w) => w.ref === 'A')!, b = wps.find((w) => w.ref === 'B')!;
    const ev = evidenceFromFieldwork(wps, { A: { preparer: 'أ', reviewer: 'ب' }, B: { preparer: 'أ' } });
    for (const k of a.lines) expect(ev[k]).toBe('accepted');
    for (const k of b.lines) expect(ev[k]).toBe('partial');
    expect(Object.keys(evidenceFromFieldwork(wps, {}))).toHaveLength(0);
  });
});

describe('lead schedules', () => {
  it('shows unadjusted, adjustments and final per account and ties to the accepted entries', () => {
    const adj: Adjustment = { id: 'AJE-1', title: 'مخصص', reason: 'ECL', standard: 'IFRS 9', estimate: true, source: 'engine',
      lines: [{ code: '6901', name: 'خسائر ائتمانية متوقعة', debit: 100000, credit: 0, type: 'expense' }, { code: '1129', name: 'مخصص خسائر ائتمانية متوقعة', debit: 0, credit: 100000, type: 'asset' }] };
    const before = leadSchedules(tb, []), after = leadSchedules(tb, [adj]);
    expect(before.every((l) => l.totals.adjustments === 0)).toBe(true);
    const b = after.find((l) => l.ref === 'B')!;
    expect(b.rows.find((r) => r.code === '1129')).toMatchObject({ unadjusted: 0, adjustments: -100000, final: -100000 });
    expect(b.totals.final).toBe(b.totals.unadjusted + b.totals.adjustments);
    expect(areaOf('cash')!.ref).toBe('A');
  });
});

describe('completion gate and representations', () => {
  const wps = workingPapers(review);
  const base = { papers: wps, signoffs: {}, uncorrected: 0, materiality: review.materiality.overall, goingConcernIssue: false, confirmations: {}, kamsDrafted: true, highOpenRequests: 0 };
  it('is not ready until papers are reviewed and every human check is confirmed', () => {
    const c = completion(base);
    expect(c.ready).toBe(false);
    const signed = Object.fromEntries(wps.map((w) => [w.ref, { preparer: 'أ', reviewer: 'ب' }]));
    const all = Object.fromEntries(HUMAN_CHECKS.map((h) => [h.id, true]));
    expect(completion({ ...base, signoffs: signed, confirmations: all }).ready).toBe(true);
    expect(completion({ ...base, signoffs: signed, confirmations: all, uncorrected: review.materiality.overall + 1 }).ready).toBe(false);
    expect(completion({ ...base, signoffs: signed, confirmations: all, goingConcernIssue: true }).ready).toBe(false);
  });
  it('drafts the ISA 580 letter with the uncorrected misstatements listed', () => {
    const l = representationLetter({ company: 'شركة', periodEnd: '31 ديسمبر 2025', framework: 'IFRS', currency: 'ر.س', uncorrected: [{ title: 'قطع المبيعات', amount: 250000 }] });
    expect(l.paragraphs.join(' ')).toContain('قطع المبيعات (2,500 ر.س)');
    expect(l.paragraphs.join(' ')).toContain('ISA 580');
  });
});
