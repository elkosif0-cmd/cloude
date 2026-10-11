import { describe, expect, it } from 'vitest';
import { parseTrialBalance, SAMPLE_TB_CSV } from '../reports/tb-import-engine';
import { buildStatements } from '../reports/statements-engine';
import { assessGoingConcern, baselineFromStatements, goingConcernSection, reverseStress, type GcBaseline } from './going-concern-engine';

const healthy: GcBaseline = { openingCash: 500_000_00, monthlyRevenue: 1_000_000_00, grossMargin: 0.3, monthlyFixedCosts: 200_000_00, dsoDays: 30, dpoDays: 30,
  openingReceivables: 1_000_000_00, openingPayables: 700_000_00, monthlyDebtService: 20_000_00, monthlyCapex: 10_000_00, undrawnFacilities: 0 };

describe('going concern and viability (ISA 570)', () => {
  it('builds a twelve-month baseline from the statements with zakat due in month four', () => {
    const b = baselineFromStatements(buildStatements(parseTrialBalance(SAMPLE_TB_CSV)));
    expect(b.monthlyRevenue).toBeGreaterThan(0);
    expect(b.grossMargin).toBeGreaterThan(0);
    expect(b.grossMargin).toBeLessThan(1);
    if (b.zakatDue) expect(b.zakatDue.month).toBe(4);
  });
  it('finds no material uncertainty when every severe scenario keeps cash positive', () => {
    const r = assessGoingConcern({ baseline: healthy });
    expect(r.base.minCash).toBeGreaterThan(0);
    expect(r.paths).toHaveLength(5);
    expect(r.conclusion).toBe('no-material-uncertainty');
    expect(r.breakPoint).toBeGreaterThan(20);
  });
  it('calls a close call when only mitigations rescue the severe scenarios, and a material uncertainty when they cannot', () => {
    const thin = { ...healthy, openingCash: 50_000_00, monthlyFixedCosts: 270_000_00, undrawnFacilities: 300_000_00 };
    const none = assessGoingConcern({ baseline: thin });
    expect(none.conclusion).toBe('material-uncertainty');
    const saved = assessGoingConcern({ baseline: thin, mitigations: [{ ar: 'خفض المصروفات الثابتة', monthly: 250_000_00, fromMonth: 1, feasible: true }] });
    expect(saved.conclusion).toBe('close-call');
    const infeasible = assessGoingConcern({ baseline: thin, mitigations: [{ ar: 'تمويل من الشركاء', monthly: 250_000_00, fromMonth: 1, feasible: false }] });
    expect(infeasible.conclusion).toBe('material-uncertainty');
  });
  it('reverse stress test: the revenue fall that exhausts cash and facilities', () => {
    const p = reverseStress(healthy)!;
    expect(p).toBeGreaterThan(0);
    expect(p).toBeLessThan(100);
    expect(reverseStress({ ...healthy, openingCash: -5_000_000_00 })).toBe(0);
  });
  it('writes the auditor report section for each conclusion', () => {
    expect(goingConcernSection('no-material-uncertainty').title).toBe('الاستنتاجات المتعلقة بالاستمرارية');
    expect(goingConcernSection('close-call').paragraphs.join(' ')).toContain('الأحكام المهمة');
    expect(goingConcernSection('material-uncertainty').title).toBe('عدم تأكد جوهري يتعلق بالاستمرارية');
  });
});

describe('going concern for large groups and financial institutions (the bundle testing the model)', () => {
  const base = { openingCash: 3_940_000, monthlyRevenue: 4_200_000, grossMargin: 1, monthlyFixedCosts: 3_460_000, dsoDays: 53, dpoDays: 0, openingReceivables: 7_300_000,
    openingPayables: 16_900_000, monthlyDebtService: 0, monthlyCapex: 220_000, undrawnFacilities: 0 };
  it('measures supplier days on all cash costs when there is no cost of sales, so year-end payables are not all paid in month one', () => {
    const naive = assessGoingConcern({ baseline: base });
    expect(naive.conclusion).toBe('material-uncertainty');
    const fixed = assessGoingConcern({ baseline: { ...base, dpoDays: Math.round(16_900_000 / (3_460_000 * 12) * 365), dpoOnCosts: true } });
    expect(fixed.conclusion).not.toBe('material-uncertainty');
  });
  it('does not run a trading forecast for a bank: indicators decide, and the reason names the regulator ratios', () => {
    const r = assessGoingConcern({ baseline: { ...base, financial: true } });
    expect(r.conclusion).toBe('no-material-uncertainty');
    expect(r.why).toContain('نسب السيولة');
    expect(assessGoingConcern({ baseline: { ...base, financial: true }, indicators: [{ title: 'خسائر متراكمة', severity: 'high' }] }).conclusion).toBe('close-call');
  });
});
