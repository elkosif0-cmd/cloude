import { describe, expect, it } from 'vitest';
import { fromRows, parseTrialBalance, SAMPLE_TB_CSV } from './tb-import-engine';
import { buildStatements } from './statements-engine';
import { capitalManagement, creditRisk, eosbMovement, estimateSensitivities, expensesByNature, financingReconciliation, maturityAnalysis, natureOf, notesPackage, zakatNote, ZAKAT_RATE } from './notes-engine';

const fs = buildStatements(parseTrialBalance(SAMPLE_TB_CSV));
const vals = (t: { rows: { ar: string; values: (number | null)[] }[] }, ar: string) => t.rows.find((r) => r.ar === ar)?.values;

describe('notes — expenses by nature (IFRS 18.83)', () => {
  it('classifies expense accounts by nature and ties to cost of revenue plus operating expenses', () => {
    const n = expensesByNature(fs);
    expect(vals(n.table, 'تكلفة البضاعة والمواد المستخدمة')).toEqual([30000000, 25000000]);
    expect(vals(n.table, 'منافع الموظفين')).toEqual([8000000, 7000000]);
    expect(vals(n.table, 'الاستهلاك والإطفاء')).toEqual([2000000, 1500000]);
    expect(n.total).toBe(40000000);
    expect(n.totalPrior).toBe(33500000);
    expect(n.ties).toBe(true);
  });
  it('reads the nature from Arabic and English account names', () => {
    expect(natureOf('إيجار المستودع', 'admin').key).toBe('rent');
    expect(natureOf('Fuel for trucks', 'selling').key).toBe('transport');
    expect(natureOf('رسوم تجديد الإقامات', 'admin').key).toBe('fees');
    expect(natureOf('شيء آخر', 'cogs').key).toBe('goods');
    expect(natureOf('شيء آخر', 'admin').key).toBe('other');
  });
});

describe('notes — zakat', () => {
  it('moves the provision from opening to closing with the paid amount derived (Aramco note 8(c) layout)', () => {
    const z = zakatNote(fs);
    expect(z.movement.rows.map((r) => r.values[0])).toEqual([400000, 500000, -400000, 500000]);
  });
  it('estimates an indicative zakat base and compares it with the recorded charge', () => {
    const z = zakatNote(fs);
    // sources 143,000 + 15,000 + 100,000 − PPE 140,000 + adjusted profit 92,000 = 210,000 SAR
    expect(vals(z.base, 'الوعاء الزكوي التقديري (لا يقل عن صافي الربح المعدل)')).toEqual([21000000]);
    expect(z.estimate).toBe(Math.round(21000000 * ZAKAT_RATE.gregorian));
    expect(z.charge).toBe(500000);
    expect(z.flag).toBe(false);
    expect(zakatNote(fs, { calendar: 'hijri' }).estimate).toBe(525000);
  });
  it('never lets the base fall below adjusted profit', () => {
    const tb = fromRows([{ code: '1101', name: 'بنك', debit: 1000 }, { code: '1501', name: 'معدات', debit: 90000 }, { code: '3101', name: 'رأس المال', credit: 1000 },
      { code: '2201', name: 'قرض طويل الأجل', credit: 70000 }, { code: '4101', name: 'المبيعات', credit: 50000 }, { code: '5101', name: 'تكلفة المبيعات', debit: 30000 }], { majorUnits: true });
    const z = zakatNote(buildStatements(tb));
    expect(vals(z.base, 'الوعاء الزكوي التقديري (لا يقل عن صافي الربح المعدل)')).toEqual([2000000]); // profit 20,000
  });
});

describe('notes — financing, risk and capital', () => {
  it('reconciles liabilities arising from financing activities (IAS 7.44A)', () => {
    const t = financingReconciliation(fs)!;
    expect(t.columns).toHaveLength(5);
    expect(t.rows.at(-1)!.values).toEqual([12000000, -2000000, 0, 10000000]);
  });
  it('states credit exposure and the loss-allowance coverage', () => {
    const c = creditRisk(fs);
    expect(c.gross).toBe(8000000);
    expect(c.allowance).toBe(0);
    expect(c.maxExposure).toBe(23000000);
    const withAllowance = creditRisk(buildStatements(fromRows([{ code: '1121', name: 'عملاء', debit: 1000 }, { code: '1122', name: 'مخصص خسائر ائتمانية متوقعة', credit: 100 },
      { code: '3101', name: 'رأس المال', credit: 900 }], { majorUnits: true })));
    expect(withAllowance).toMatchObject({ gross: 100000, allowance: 10000, coverage: 10 });
  });
  it('splits financial liabilities by maturity', () => {
    const m = maturityAnalysis(fs);
    expect(vals(m, 'تستحق خلال سنة')).toEqual([7000000]);
    expect(vals(m, 'تستحق بعد سنة')).toEqual([10000000]);
    expect(vals(m, 'مجموع المطلوبات المالية')).toEqual([17000000]);
  });
  it('computes gearing and ROACE the way Aramco defines them', () => {
    const k = capitalManagement(fs);
    expect(k.current.netDebt).toBe(-5000000); // net cash
    expect(k.current.gearing).toBe(-27.8);
    expect(k.prior!.gearing).toBe(11.5);
    expect(k.roace).toBe(31.5);
  });
  it('shows the end-of-service movement even without a separate expense account', () => {
    expect(eosbMovement(fs)!.rows.map((r) => r.values[0])).toEqual([1200000, 300000, 1500000]);
  });
  it('gives illustrative sensitivities for the key estimates', () => {
    const s = Object.fromEntries(estimateSensitivities(fs).map((x) => [x.ar, x.effect]));
    expect(s['أسعار العمولة']).toBe(-100000);
    expect(s['الأعمار الإنتاجية للممتلكات والمعدات']).toBe(-200000);
    expect(s['منافع نهاية الخدمة']).toBe(-75000);
  });
});

describe('notes — the package', () => {
  it('numbers the supplementary notes after the statement notes and keeps every table reconciled', () => {
    const p = notesPackage(fs);
    const last = Math.max(...fs.notes.map((n) => n.no));
    expect(p.supplementary[0].no).toBe(last + 1);
    expect(p.supplementary.map((s) => s.key)).toEqual(['nature', 'risk', 'capital', 'financing', 'sensitivity']);
    expect(p.checks).toEqual({ byNatureTies: true, financingTies: true });
    expect(Object.keys(p.lineTables).sort()).toEqual(['eosb', 'zakatExpense', 'zakatPayable']);
  });
  it('drops zakat for Egyptian entities and words currency risk for the pound', () => {
    const p = notesPackage(fs, { country: 'EG' });
    expect(p.zakat).toBeNull();
    expect(p.supplementary.find((s) => s.key === 'risk')!.text.join(' ')).toContain('الجنيه المصري');
  });
});
