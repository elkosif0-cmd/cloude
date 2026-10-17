import { describe, expect, it } from 'vitest';
import { auditApproach, auditCommitteeReport, classifyDeficiency, icfrReport, type Materiality } from './governance-engine';

const mat: Materiality = { benchmark: 'pbz', benchmarkAr: 'الربح قبل الزكاة', base: 9200000, rate: 0.05, overall: 460000, performance: 345000, trivial: 23000 };

describe('our audit approach (Aramco / ISA (UK) 700)', () => {
  it('states materiality, how and why it was set, performance materiality and the reporting threshold', () => {
    const s = auditApproach({ materiality: mat, currency: 'ر.س', kamTitles: ['المخزون', 'الإيراد'] });
    expect(s.title).toBe('نهجنا في المراجعة');
    expect(s.paragraphs[0]).toContain('4,600 ر.س');
    expect(s.paragraphs[0]).toContain('5%');
    expect(s.paragraphs.join(' ')).toContain('المخزون؛ الإيراد');
    const rows = Object.fromEntries(s.table!.rows);
    expect(rows['الأهمية النسبية التنفيذية']).toContain('75%');
    expect(rows['حد الإبلاغ للمكلفين بالحوكمة']).toContain('230 ر.س');
    expect(rows['مبرر الأساس المختار']).toContain('الهادفة للربح');
  });
  it('uses the effective rate when materiality was overridden, and income-tax wording for Egypt', () => {
    const s = auditApproach({ materiality: { ...mat, overall: 920000 }, currency: 'ج.م', kamTitles: [], taxWord: 'الضريبة' });
    expect(s.paragraphs[0]).toContain('10%');
    expect(s.paragraphs[0]).toContain('ضريبة الدخل');
  });
});

describe('audit committee report (HSBC GAC structure)', () => {
  const base = { company: 'شركة', period: '2025', currency: 'ر.س', kams: [{ title: 'المخزون', how: 'حضور الجرد' }], materiality: mat,
    corrected: { count: 2, profitEffect: -50000 }, uncorrected: { count: 1, effect: 10000 }, findings: { high: 1, medium: 2, low: 0, controlTitles: ['قطع المبيعات'] },
    opinionAr: 'رأي غير معدل', goingConcern: false, framework: 'IFRS' as const };
  it('covers responsibilities, discharge, the significant issues table, going concern and the recommendation', () => {
    const r = auditCommitteeReport(base);
    expect(r.sections.map((s) => s.title)).toEqual(['المسؤوليات الرئيسية للجنة', 'كيف أدت اللجنة مسؤولياتها', 'الأمور الهامة التي نظرت فيها اللجنة', 'الاستمرارية', 'توصية اللجنة']);
    expect(r.sections[2].table!.rows[0][0]).toBe('المخزون');
    expect(r.sections[1].paragraphs.join(' ')).toContain('دون الأهمية النسبية');
  });
  it('asks for correction when uncorrected misstatements exceed materiality', () => {
    const r = auditCommitteeReport({ ...base, uncorrected: { count: 3, effect: 900000 }, goingConcern: true });
    expect(r.sections[1].paragraphs.join(' ')).toContain('تتجاوز الأهمية النسبية');
    expect(r.sections[3].paragraphs[0]).toContain('عدم التأكد الجوهري');
  });
});

describe("management's report on internal control (Item 9A, COSO 2013)", () => {
  it('classifies deficiencies the way AS 2201 defines them', () => {
    expect(classifyDeficiency({ title: 'x', severity: 'high', kind: 'fraud' }, mat)).toBe('material-weakness');
    expect(classifyDeficiency({ title: 'x', severity: 'high', kind: 'balance', amount: 500000 }, mat)).toBe('material-weakness');
    expect(classifyDeficiency({ title: 'x', severity: 'high', kind: 'balance', amount: 1000 }, mat)).toBe('significant-deficiency');
    expect(classifyDeficiency({ title: 'x', severity: 'medium', kind: 'balance', amount: 400000 }, mat)).toBe('significant-deficiency');
    expect(classifyDeficiency({ title: 'x', severity: 'medium', kind: 'balance' }, mat)).toBe('deficiency');
    expect(classifyDeficiency({ title: 'x', severity: 'high', kind: 'balance' }, mat, 600000)).toBe('material-weakness');
  });
  it('concludes effective without a material weakness and not effective with one', () => {
    const ok = icfrReport({ company: 'شركة', periodEnd: '31 ديسمبر 2025', materiality: mat, findings: [{ title: 'تسوية بنكية متأخرة', severity: 'medium', kind: 'balance' }] });
    expect(ok.effective).toBe(true);
    expect(ok.sections[2].paragraphs[0]).toContain('كانت فعالة');
    const bad = icfrReport({ company: 'شركة', periodEnd: '31 ديسمبر 2025', materiality: mat, findings: [{ title: 'قيود يدوية بلا اعتماد', severity: 'high', kind: 'fraud' }, { title: 'رأي', severity: 'high', kind: 'going-concern' }] });
    expect(bad.effective).toBe(false);
    expect(bad.counts).toEqual({ materialWeakness: 1, significant: 0, deficiency: 0 }); // going concern is not a control deficiency
    expect(bad.sections[2].paragraphs[0]).toContain('لم تكن فعالة');
  });
});
