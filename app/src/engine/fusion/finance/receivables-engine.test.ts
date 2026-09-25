import {describe, expect, it} from 'vitest';
import {ageReceivables} from './receivables-engine';

describe('receivables aging', () => {
  it('calculates outstanding balances and aging buckets', () => {
    const result = ageReceivables([
      {id:'I1',customerId:'C1',invoiceDate:'2026-08-01',dueDate:'2026-09-25',amount:1000,paid:200},
      {id:'I2',customerId:'C2',invoiceDate:'2026-07-01',dueDate:'2026-08-20',amount:500,paid:0},
      {id:'I3',customerId:'C3',invoiceDate:'2026-04-01',dueDate:'2026-05-01',amount:300,paid:300},
    ], '2026-09-25');

    expect(result.outstanding).toBe(1300);
    expect(result.totals.current).toBe(800);
    expect(result.totals['31-60']).toBe(500);
    expect(result.rows).toHaveLength(2);
  });

  it('never produces a negative outstanding balance', () => {
    const result = ageReceivables([
      {id:'I4',customerId:'C4',invoiceDate:'2026-09-01',dueDate:'2026-09-10',amount:100,paid:150},
    ], '2026-09-25');
    expect(result.outstanding).toBe(0);
    expect(result.rows).toHaveLength(0);
  });
});
