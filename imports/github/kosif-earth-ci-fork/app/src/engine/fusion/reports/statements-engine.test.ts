import { describe, expect, it } from 'vitest';
import { parseTrialBalance, SAMPLE_TB_CSV } from './tb-import-engine';
import { buildStatements, lineFor } from './statements-engine';

const tb = parseTrialBalance(SAMPLE_TB_CSV);
const fs = buildStatements(tb);
const pl = (k: string) => fs.pl.find((r) => r.key === k);
const sfp = (k: string) => fs.sfp.find((r) => r.key === k);
const cf = (k: string) => fs.cf?.find((r) => r.key === k);

describe('financial statements from a trial balance', () => {
  it('maps accounts to statement lines by name, then code, then type', () => {
    expect(lineFor({ code: '2301', name: 'مخصص مكافأة نهاية الخدمة', type: 'liability' }).key).toBe('eosb');
    expect(lineFor({ code: '1509', name: 'مجمع إهلاك المعدات', type: 'asset' }).key).toBe('ppe');
    expect(lineFor({ code: '1111', name: 'حساب', type: 'asset' })).toEqual({ key: 'cash', basis: 'code' });
    expect(lineFor({ code: '', name: 'حساب', type: 'expense' })).toEqual({ key: 'admin', basis: 'type' });
    expect(lineFor({ code: '9', name: 'حساب', type: 'suspense' }).key).toBeNull();
    expect(lineFor({ code: '1101', name: 'بنك', type: 'asset' }, { 1101: 'otherCa' })).toEqual({ key: 'otherCa', basis: 'manual' });
    expect(fs.checks.mappedPct).toBe(100);
  });
  it('presents profit or loss in IFRS 18 categories with comparatives', () => {
    expect(pl('revenue')).toMatchObject({ current: 50000000, prior: 40000000 });
    expect(pl('gross')).toMatchObject({ current: 20000000, prior: 15000000 });
    expect(pl('operating')).toMatchObject({ current: 10000000, prior: 6500000 });
    expect(pl('pbz')?.current).toBe(9200000);
    expect(pl('profit')).toMatchObject({ current: 8700000, prior: 5200000, level: 'total' });
  });
  it('balances the statement of financial position including the result for the year', () => {
    expect(fs.checks.balanced).toBe(true);
    expect(fs.checks.priorBalanced).toBe(true);
    expect(sfp('assets')).toMatchObject({ current: 42000000, prior: 34000000 });
    expect(sfp('equity')).toMatchObject({ current: 23000000, prior: 15400000 });
    expect(sfp('ppe')).toMatchObject({ current: 14000000, prior: 14000000 });
  });
  it('derives an indirect cash-flow statement that ties to cash', () => {
    expect(fs.checks.cashTies).toBe(true);
    expect(cf('cf-op')?.current).toBe(10100000);
    expect(cf('cf-inv')?.current).toBe(-2000000);
    expect(cf('cf-fin')?.current).toBe(-3100000);
    expect(cf('cf-fin-div')?.current).toBe(-1100000);
    expect(cf('cf-close')?.current).toBe(15000000);
    expect(fs.keys.cfo.current).toBe(10100000);
    expect(fs.keys.capex.current).toBe(-2000000);
  });
  it('rolls equity forward and numbers one note per line', () => {
    const close = fs.soce.rows[fs.soce.rows.length - 1].values;
    expect(close[4]).toBe(23000000);
    expect(fs.soce.rows[0].values[3]).toBe(5400000);
    expect(fs.notes[4]).toMatchObject({ no: 5, kind: 'line', lineKey: 'ppe' });
    expect(sfp('cash')?.note).toBeGreaterThan(4);
    const ppe = fs.lines.find((l) => l.key === 'ppe')!;
    expect(ppe.accounts.map((a) => a.code)).toEqual(['1501', '1509']);
    expect(ppe.standards).toContain('IAS 16');
  });
  it('works without comparatives and lists unmapped accounts', () => {
    const one = buildStatements(parseTrialBalance('code,name,debit,credit\n1101,بنك,100,\n9999,حساب معلق,,100'));
    expect(one.cf).toBeNull();
    expect(one.unmapped).toEqual([{ code: '9999', name: 'حساب معلق', balance: -10000 }]);
    expect(one.checks.mappedPct).toBe(50);
  });
});

describe('discontinued operations (IFRS 5.33)', () => {
  it('sits after tax on its own line: profit before tax and materiality exclude it', () => {
    const tb = parseTrialBalance(['رقم الحساب,اسم الحساب,مدين,دائن', '1101,النقد,1300,', '3101,رأس المال,,700',
      '4101,المبيعات,,1000', '5101,تكلفة المبيعات,600,', '8101,ضريبة الدخل,100,', '4951,Gain on disposal of discontinued operations,,300'].join('\n'));
    const fs = buildStatements(tb);
    expect(fs.keys.pbz.current).toBe(40000);
    expect(fs.keys.continuing.current).toBe(30000);
    expect(fs.keys.disc.current).toBe(30000);
    expect(fs.keys.profit.current).toBe(60000);
    const keys = fs.pl.map((r) => r.key);
    expect(keys.indexOf('discontinued')).toBeGreaterThan(keys.indexOf('zakatExpense'));
    expect(keys).toContain('continuing');
    expect(fs.checks.balanced).toBe(true);
  });
});
