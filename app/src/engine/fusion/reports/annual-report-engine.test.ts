import { describe, expect, it } from 'vitest';
import { parseTrialBalance, SAMPLE_TB_CSV } from './tb-import-engine';
import { buildStatements } from './statements-engine';
import { auditorsReport, balanceSheetDetails, lam, debtNote, liquidity, operatingExpenses, performanceMeasures, ppeNote, productsServices, resultsRelease, resultsTable, revenueByCategory, taxProvision } from './annual-report-engine';

const withServices = SAMPLE_TB_CSV.replace('4101,المبيعات,,500000,-400000', '4101,مبيعات البضائع,,420000,-350000\n4102,إيرادات خدمات الصيانة,,80000,-50000')
  .replace('5101,تكلفة المبيعات,300000,,250000', '5101,تكلفة البضاعة المباعة,270000,,230000\n5102,تكلفة خدمات الصيانة,30000,,20000');
const fs = buildStatements(parseTrialBalance(SAMPLE_TB_CSV)), fs2 = buildStatements(parseTrialBalance(withServices));

describe('report outputs in the style of Apple and Amazon', () => {
  it('tabulates net sales by category with change and share (Apple Item 7)', () => {
    const r = revenueByCategory(fs2);
    expect(r.map((x) => x.ar)).toEqual(['مبيعات البضائع', 'إيرادات خدمات الصيانة', 'إجمالي الإيرادات']);
    expect(r[1]).toMatchObject({ current: 8000000, prior: 5000000, change: 60, pctOfRevenue: 16 });
    expect(r[2]).toMatchObject({ current: 50000000, change: 25, level: 'total' });
  });
  it('splits gross margin into products and services when the accounts reveal both', () => {
    const p = productsServices(fs2)!;
    expect(p.products).toMatchObject({ revenue: 42000000, cost: 27000000, margin: 15000000, marginPct: 35.7 });
    expect(p.services).toMatchObject({ revenue: 8000000, cost: 3000000, marginPct: 62.5, marginPctPrior: 60 });
    expect(p.total.marginPct).toBe(40);
    expect(productsServices(fs)).toBeNull();
  });
  it('shows results and operating expenses with change and % of net sales', () => {
    const r = resultsTable(fs);
    expect(r.find((x) => x.ar === 'مجمل الربح')).toMatchObject({ current: 20000000, change: 33.3, pctOfRevenue: 40, pctOfRevenuePrior: 37.5 });
    const o = operatingExpenses(fs);
    expect(o.map((x) => x.ar)).toEqual(['المصروفات العمومية والإدارية', 'الاستهلاك والإطفاء', 'إجمالي المصروفات التشغيلية']);
    expect(o[2]).toMatchObject({ current: 10000000, pctOfRevenue: 20, pctOfRevenuePrior: 21.3 });
  });
  it('reconciles free cash flow and EBITDA as management-defined measures (Amazon)', () => {
    const m = performanceMeasures(fs);
    expect(m.find((x) => x.key === 'fcf')!.value).toBe(8100000);
    expect(m.find((x) => x.key === 'ebitda')).toMatchObject({ value: 12000000, prior: 8000000 });
    expect(m.some((x) => x.key === 'fcfLeases')).toBe(false);
  });
  it('builds the notes: PPE gross/accumulated/net, balance-sheet details, debt, tax', () => {
    expect(ppeNote(fs)).toMatchObject({ gross: 20000000, accumulated: -6000000, net: 14000000, grossPrior: 18000000 });
    expect(balanceSheetDetails(fs)).toEqual([]);
    expect(debtNote(fs)).toMatchObject({ total: 10000000, netDebt: -5000000 });
    expect(taxProvision(fs).effectiveRate).toBe(5.4);
    const eg = taxProvision(fs, 'EG');
    expect(eg.reconciliation[0].amount).toBe(2070000);
    expect(eg.reconciliation[2].amount).toBe(500000);
    expect(liquidity(fs)).toMatchObject({ cash: 15000000, netCash: 5000000, workingCapital: 20500000, currentRatio: 3.73 });
  });
  it('writes a results release with growth bullets (Amazon/Apple)', () => {
    const r = resultsRelease(fs, 'شركة تجريبية', 'السنة المالية 2025');
    expect(r.headline).toBe('شركة تجريبية تعلن نتائج السنة المالية 2025');
    expect(r.bullets[0]).toBe('ارتفعت الإيرادات 25% إلى 500,000 ر.س، مقارنة بـ 400,000 ر.س في السنة السابقة.');
    expect(r.bullets.some((b) => b.includes('التدفق النقدي الحر'))).toBe(true);
  });
  it('drafts the auditor’s report with KAMs in the EY form', () => {
    const a = auditorsReport({ company: 'شركة تجريبية', periodEnd: '31 ديسمبر 2025', framework: 'IFRS', opinion: 'unmodified', basis: [], kams: [{ title: 'الاعتراف بالإيراد', description: 'وصف', how: 'إجراءات' }] });
    expect(a.sections.map((s) => s.title)).toEqual(['الرأي', 'أساس الرأي', 'الأمور الرئيسية للمراجعة', 'المعلومات الأخرى', 'مسؤوليات الإدارة والمكلفين بالحوكمة عن القوائم المالية', 'مسؤوليات المراجع عن مراجعة القوائم المالية']);
    expect(a.sections[0].paragraphs[1]).toContain('المعتمدة في المملكة العربية السعودية');
    expect(a.sections[0].paragraphs[0]).toContain('القوائم المالية لشركة تجريبية');
    expect(a.sections[0].paragraphs[1]).toContain('وفقاً للمعايير الدولية');
    expect(a.sections[0].paragraphs.join('')).not.toContain('لـ');
    expect([lam('الشركة'), lam('شركة')]).toEqual(['للشركة', 'لشركة']);
    const q = auditorsReport({ company: 'x', framework: 'EAS', opinion: 'disclaimer', basis: ['تعذر'], kams: [{ title: 't', description: 'd', how: 'h' }], goingConcern: true });
    expect(q.sections[0].title).toBe('الامتناع عن إبداء الرأي');
    expect(q.sections.some((s) => s.title === 'الأمور الرئيسية للمراجعة')).toBe(false);
    expect(q.sections[1].paragraphs).toEqual(['تعذر']);
    expect(q.signature.city).toBe('القاهرة');
  });
});

import { approachSection, auditorsReport as ar2, zakatNote } from './annual-report-engine';
import { parseTrialBalance as ptb2, SAMPLE_TB_CSV as S2 } from './tb-import-engine';
import { buildStatements as bs2 } from './statements-engine';
describe('auditor report sections from global practice', () => {
  const m = { overall: 100_000_00, benchmarkAr: 'الربح قبل الزكاة والضريبة المعدّل', rate: 0.05, why: 'مؤشر الأداء', performance: 75_000_00, performanceRate: 0.75, trivial: 5_000_00 };
  it('«our audit approach» shows materiality, basis, performance and the reporting threshold (Aramco/PwC)', () => {
    const s = approachSection({ materiality: m }, [{ title: 'إثبات الإيرادات', description: '', how: '', trend: 'new' }]);
    expect(s.title).toBe('منهجنا في المراجعة');
    expect(s.table!.map((r) => r[0])).toContain('حد إبلاغ المكلفين بالحوكمة بالتحريفات');
    expect(s.table![1][1]).toContain('5%');
    expect(s.paragraphs.join(' ')).toContain('جديد هذا العام');
  });
  it('puts the going-concern conclusion and the approach before the key audit matters', () => {
    const r = ar2({ company: 'شركة', framework: 'IFRS', opinion: 'unmodified', basis: [], kams: [{ title: 'ك', description: 'د', how: 'ه', observation: 'ن' }],
      goingConcernSection: { title: 'الاستنتاجات المتعلقة بالاستمرارية', paragraphs: ['ملائم'] }, approach: { materiality: m } });
    const t = r.sections.map((x) => x.title);
    expect(t.indexOf('الاستنتاجات المتعلقة بالاستمرارية')).toBeGreaterThan(t.indexOf('أساس الرأي'));
    expect(t.indexOf('منهجنا في المراجعة')).toBeLessThan(t.indexOf('الأمور الرئيسية للمراجعة'));
  });
  it('the zakat note rolls the obligation forward (Aramco note 8c)', () => {
    const n = zakatNote(bs2(ptb2(S2)));
    expect(n.rows).toHaveLength(4);
    expect(n.policy).toContain('أيهما أعلى');
    const [o, c, p, e] = n.rows.map((x) => x.amount);
    if (o !== null && p !== null) expect((o as number) + (c as number) + (p as number)).toBe(e);
  });
});
