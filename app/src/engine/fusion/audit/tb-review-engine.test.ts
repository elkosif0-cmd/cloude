import { describe, expect, it } from 'vitest';
import { parseTrialBalance, SAMPLE_TB_CSV } from '../reports/tb-import-engine';
import { buildStatements } from '../reports/statements-engine';
import { adjustmentEffect, applyAdjustments, materiality, reviewTrialBalance, validateAdjustment } from './tb-review-engine';

const sample = parseTrialBalance(SAMPLE_TB_CSV);
/* a problem trial balance: overdraft, customer credit, no zakat, no depreciation, no EOSB, suspense */
const PROBLEM = [
  'code,name,debit,credit',
  '1101,البنك الأهلي,,20000',
  '1102,الصندوق,5000,',
  '1121,عملاء,150000,',
  '1122,عميل - دفعة مقدمة,,10000',
  '1501,سيارات,120000,',
  '1901,حساب معلق,30000,',
  '2101,موردون,,60000',
  '3101,رأس المال,,100000',
  '4101,المبيعات,,400000',
  '5101,تكلفة المبيعات,200000,',
  '6101,رواتب وأجور,85000,',
].join('\n');
const bad = parseTrialBalance(PROBLEM);

describe('trial balance review', () => {
  it('sets materiality from profit before zakat', () => {
    const m = materiality(buildStatements(sample));
    expect(m).toMatchObject({ benchmark: 'pbz', overall: 460000, performance: 345000, trivial: 23000 });
  });
  it('maps every account to standards with the relation text', () => {
    const r = reviewTrialBalance(sample);
    const ppe = r.accounts.find((a) => a.code === '1501')!;
    expect(ppe.standards.map((s) => s.code)).toEqual(['IAS 16', 'IAS 36']);
    expect(ppe.standards[0].relation).toContain('الاستهلاك');
    expect(r.accounts.find((a) => a.code === '4101')!.standards.map((s) => s.code)).toContain('ISA 240');
    expect(r.findings.filter((f) => f.severity === 'high')).toHaveLength(0);
  });
  it('finds the errors of a problem trial balance and proposes balanced entries', () => {
    const r = reviewTrialBalance(bad);
    const titles = r.findings.map((f) => f.title);
    expect(bad.balanced).toBe(true);
    expect(titles).toContain('رصيد بنكي دائن (سحب على المكشوف)');
    expect(titles).toContain('ذمم مدينة برصيد دائن');
    expect(titles).toContain('حساب معلق/وسيط برصيد قائم');
    expect(titles).toContain('لا يوجد مصروف زكاة رغم تحقق ربح');
    expect(titles).toContain('أصول ثابتة دون مصروف استهلاك');
    expect(titles).toContain('رواتب دون التزام مكافأة نهاية الخدمة');
    expect(r.adjustments.map((a) => a.title)).toEqual(['إعادة تبويب السحب على المكشوف', 'إعادة تبويب الأرصدة الدائنة للعملاء', 'استحقاق زكاة السنة (تقديري)']);
    for (const a of r.adjustments) expect(validateAdjustment(a, bad)).toMatchObject({ balanced: true, valid: true });
    expect(r.accounts.find((a) => a.code === '1101')!.findings.length).toBeGreaterThan(0);
    expect(r.requests.some((q) => q.title.includes('كشوف الحسابات البنكية'))).toBe(true);
    expect(r.compliance[0].status).toBe('غير ممتثل');
    expect(r.summary.high).toBeGreaterThanOrEqual(3);
  });
  it('reports an out-of-balance trial balance with a diagnosis', () => {
    const r = reviewTrialBalance(parseTrialBalance('code,name,debit,credit\n1101,بنك,1000,\n4101,مبيعات,,1000\n6101,إيجار,500,'));
    const f = r.findings.find((x) => x.title === 'ميزان المراجعة غير متوازن')!;
    expect(f.detail).toContain('6101');
  });
  it('applies accepted adjustments and measures their effect', () => {
    const r = reviewTrialBalance(bad);
    const adjusted = applyAdjustments(bad, r.adjustments);
    expect(adjusted.balanced).toBe(true);
    const fs = buildStatements(adjusted);
    expect(fs.lines.find((l) => l.key === 'loansCl')?.current).toBe(2000000);
    expect(fs.lines.find((l) => l.key === 'contractLiab')?.current).toBe(1000000);
    expect(fs.keys.cash.current).toBe(500000);
    const zakat = r.adjustments[2].lines[0].debit;
    expect(adjustmentEffect(bad, r.adjustments).profit).toBe(-zakat);
    expect(validateAdjustment({ ...r.adjustments[0], lines: [{ code: '1101', name: 'x', debit: 100, credit: 0 }, { code: '2101', name: 'y', debit: 0, credit: 90 }] }, bad).balanced).toBe(false);
  });
  it('compares each line with an expectation (ISA 520) instead of flagging growth', () => {
    const r = reviewTrialBalance(sample);
    expect(r.findings.filter((f) => f.kind === 'analytical')).toHaveLength(0);
    const jump = parseTrialBalance(SAMPLE_TB_CSV.replace('6101,رواتب وأجور إدارية,80000,,70000', '6101,رواتب وأجور إدارية,130000,,70000').replace('4101,المبيعات,,500000,-400000', '4101,المبيعات,,550000,-400000'));
    const f = reviewTrialBalance(jump).findings.find((x) => x.kind === 'analytical' && x.lineKey === 'admin')!;
    expect(f.basis).toContain('المتوقع 96,250');
    expect(f.detail).toContain('37.5%');
  });
  it('raises the risk of lines with findings and no evidence', () => {
    const r = reviewTrialBalance(sample), again = reviewTrialBalance(sample, { evidence: { revenue: 'accepted' } });
    const rev = (x: typeof r) => x.risks.find((k) => k.lineKey === 'revenue')!;
    expect(rev(r).parts.evidence).toBe(25);
    expect(rev(again).score).toBe(rev(r).score - 25);
    expect(rev(r).parts.nature).toBe(10);
  });
});
