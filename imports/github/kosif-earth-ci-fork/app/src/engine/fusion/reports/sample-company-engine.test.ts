import { describe, expect, it } from 'vitest';
import { parseTrialBalance } from './tb-import-engine';
import { buildStatements } from './statements-engine';
import { WAHA_COMPANY, WAHA_CONTEXT, WAHA_TB_CSV } from './sample-company-engine';

describe('شركة الواحة — the sample company', () => {
  const tb = parseTrialBalance(WAHA_TB_CSV);
  it('is a balanced trial balance of 40 accounts with the prior year', () => {
    expect(tb.ok).toBe(true);
    expect(tb.balanced).toBe(true);
    expect(tb.rows).toHaveLength(40);
  });
  it('builds statements that balance in both years with the expected headline figures', () => {
    const fs = buildStatements(tb);
    expect(fs.hasPrior).toBe(true);
    expect(fs.checks.balanced).toBe(true);
    expect(fs.checks.priorBalanced).toBe(true);
    expect(fs.keys.revenue.current).toBe(412_600_000_00);
    expect(fs.keys.profit.current).toBe(31_300_000_00);
    expect(fs.checks.mappedPct).toBe(100);
  });
  it('carries a full engagement context and the company record', () => {
    expect(WAHA_CONTEXT.company).toBe(WAHA_COMPANY.name);
    expect(WAHA_CONTEXT.periodEnd).toBe('2025-12-31');
    expect(WAHA_COMPANY.periods.map((p) => p.label)).toEqual(['2025', '2024']);
  });
});
