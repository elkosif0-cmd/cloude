import { describe, expect, it } from 'vitest';
import { classifyAccount, detectDelimiter, fromRows, largestBalances, parseTrialBalance, SAMPLE_TB_CSV } from './tb-import-engine';

describe('trial balance import', () => {
  it('reads the sample with Arabic headers and a prior-year column', () => {
    const tb = parseTrialBalance(SAMPLE_TB_CSV);
    expect(tb.ok).toBe(true);
    expect(tb.rows).toHaveLength(17);
    expect(tb.balanced).toBe(true);
    expect(tb.totals.debit).toBe(89300000);
    expect(tb.hasPrior).toBe(true);
    expect(tb.priorDifference).toBe(0);
    expect(tb.unclassified).toBe(0);
    const cash = tb.rows.find((r) => r.code === '1101')!;
    expect(cash).toMatchObject({ type: 'asset', classifiedBy: 'code', balance: 15000000, net: 15000000, prior: 10000000 });
    const sales = tb.rows.find((r) => r.code === '4101')!;
    expect(sales).toMatchObject({ type: 'revenue', balance: -50000000, net: 50000000 });
  });
  it('classifies by code first, then by the account name', () => {
    expect(classifyAccount('2101', 'x').type).toBe('liability');
    expect(classifyAccount('', 'ضريبة المدخلات').type).toBe('asset');
    expect(classifyAccount('', 'إيرادات أخرى').type).toBe('revenue');
    expect(classifyAccount('', 'رأس المال')).toEqual({ type: 'equity', basis: 'name' });
    expect(classifyAccount('', 'حساب معلق')).toEqual({ type: 'suspense', basis: 'none' });
    expect(classifyAccount('', 'مخصص خسائر ائتمانية متوقعة').type).toBe('asset');
    expect(classifyAccount('', 'مجمع إهلاك السيارات').type).toBe('asset');
    expect(classifyAccount('', 'مصروف خسائر ائتمانية متوقعة').type).toBe('expense');
  });
  it('reports out-of-balance, bad amounts, duplicates and skips total rows', () => {
    const tb = parseTrialBalance('code\tname\tdebit\tcredit\n1\tنقد\t100\t\n1\tنقد مكرر\t5\t\n2\tموردون\t\tx\n4\tمبيعات\t\t90\nالإجمالي\t\t105\t90');
    expect(tb.delimiter).toBe('\t');
    expect(tb.errors.map((e) => e.code)).toEqual(['DUPLICATE_ACCOUNT', 'AMOUNT_NOT_NUMERIC']);
    expect(tb.rows).toHaveLength(3);
    expect(tb.difference).toBe(1500);
    expect(tb.balanced).toBe(false);
  });
  it('accepts a single net-balance column and moves negatives to the other side', () => {
    const tb = parseTrialBalance('الحساب;الاسم;الرصيد\n1101;بنك;(1,000)\n3101;رأس المال;1000');
    expect(tb.delimiter).toBe(';');
    expect(tb.rows[0]).toMatchObject({ debit: 0, credit: 100000 });
    expect(tb.rows[1]).toMatchObject({ debit: 100000, credit: 0 });
  });
  it('builds from app rows and ranks the largest balances', () => {
    const tb = fromRows([{ code: '1101', name: 'بنك', debit: 10 }, { code: '4101', name: 'مبيعات', credit: 10 }, { code: '6101', name: 'رواتب', debit: 0.5 }]);
    expect(tb.rows[2].debit).toBe(50);
    expect(detectDelimiter('a,b,c\n1,2,3')).toBe(',');
    expect(largestBalances(parseTrialBalance(SAMPLE_TB_CSV), 2).map((r) => r.code)).toEqual(['4101', '5101']);
  });
});
