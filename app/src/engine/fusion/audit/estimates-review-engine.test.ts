import { describe, expect, it } from 'vitest';
import { ESTIMATE_KINDS, reviewEstimates } from './estimates-review-engine';

const m = { overall: 100_000_00, performance: 75_000_00, trivial: 5_000_00 };
describe('retrospective review of estimates (ISA 540)', () => {
  it('classifies each estimate by direction and against materiality', () => {
    const r = reviewEstimates([
      { key: 'ecl', label: 'ECL', priorEstimate: 200_000_00, outcome: 290_000_00 },
      { key: 'zakat', label: 'زكاة', priorEstimate: 80_000_00, outcome: 81_000_00 },
      { key: 'eosb', label: 'نهاية الخدمة', priorEstimate: 50_000_00, outcome: null },
    ], m);
    expect(r.rows[0]).toMatchObject({ direction: 'under', significance: 'above-performance', pct: 45 });
    expect(r.rows[1]).toMatchObject({ direction: 'accurate', significance: 'trivial' });
    expect(r.rows[2].direction).toBe('pending');
    expect(r.pending).toBe(1);
  });
  it('flags one-way optimism as a bias indicator (Unilever, bp)', () => {
    const r = reviewEstimates([
      { key: 'ecl', label: 'ECL', priorEstimate: 100_000_00, outcome: 130_000_00 },
      { key: 'inventory', label: 'مخزون', priorEstimate: 40_000_00, outcome: 60_000_00 },
      { key: 'accruals', label: 'خصومات', priorEstimate: 90_000_00, outcome: 100_000_00 },
    ], m);
    expect(r.bias).toBe(true);
    expect(r.side).toBe('optimistic');
    expect(r.message).toContain('ISA 240');
  });
  it('sees no bias when differences are small or balanced', () => {
    const r = reviewEstimates([
      { key: 'ecl', label: 'ECL', priorEstimate: 100_000_00, outcome: 120_000_00 },
      { key: 'inventory', label: 'مخزون', priorEstimate: 40_000_00, outcome: 25_000_00 },
    ], m);
    expect(r.bias).toBe(false);
    expect(ESTIMATE_KINDS.find((k) => k.key === 'zakat')!.kws.test('مخصص الزكاة')).toBe(true);
  });
});
