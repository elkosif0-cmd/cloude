import { describe, expect, it } from 'vitest';
import { parseTrialBalance } from './tb-import-engine';

describe('comparative trial-balance numeric integrity', () => {
  it('rejects a malformed prior-year net amount rather than silently using zero', () => {
    const tb = parseTrialBalance(
      'code,name,debit,credit,prior\n1100,Cash,100,,not-a-number\n3100,Capital,,100,-100');
    expect(tb.errors).toMatchObject([{ line: 2, code: 'AMOUNT_NOT_NUMERIC' }]);
    expect(tb.ok).toBe(false);
    expect(tb.rows.map(r => r.code)).toEqual(['3100']);
    expect(tb.rows[0].prior).toBe(-10000);
  });

  it('rejects a malformed prior-year debit and omits that source row', () => {
    const tb = parseTrialBalance(
      'code,name,debit,credit,priorDebit,priorCredit\n1100,Cash,100,,wrong,0\n3100,Capital,,100,0,100');
    expect(tb.errors).toMatchObject([{ line: 2, code: 'AMOUNT_NOT_NUMERIC' }]);
    expect(tb.ok).toBe(false);
    expect(tb.rows).toHaveLength(1);
    expect(tb.rows[0].prior).toBe(-10000);
  });

  it('rejects a malformed prior-year credit and omits that source row', () => {
    const tb = parseTrialBalance(
      'code,name,debit,credit,priorDebit,priorCredit\n1100,Cash,100,,100,wrong\n3100,Capital,,100,0,100');
    expect(tb.errors).toMatchObject([{ line: 2, code: 'AMOUNT_NOT_NUMERIC' }]);
    expect(tb.ok).toBe(false);
    expect(tb.rows.map(r => r.code)).toEqual(['3100']);
  });

  it('keeps valid blank comparative columns as zero without errors', () => {
    const tb = parseTrialBalance(
      'code,name,debit,credit,priorDebit,priorCredit\n1100,Cash,100,,100,\n3100,Capital,,100,,100');
    expect(tb.errors).toEqual([]);
    expect(tb.ok).toBe(true);
    expect(tb.balanced).toBe(true);
    expect(tb.hasPrior).toBe(true);
    expect(tb.priorDifference).toBe(0);
  });

  it('preserves true physical line number for a multiline quoted account name', () => {
    const tb = parseTrialBalance(
      'code,name,debit,credit,prior\n1100,"Cash, bank\nand hand",100,,not-a-number\n3100,Capital,,100,-100');
    expect(tb.errors).toMatchObject([{ line: 2, code: 'AMOUNT_NOT_NUMERIC' }]);
    expect(tb.ok).toBe(false);
    expect(tb.rows[0]).toMatchObject({ code: '3100', line: 4 });
  });
});
