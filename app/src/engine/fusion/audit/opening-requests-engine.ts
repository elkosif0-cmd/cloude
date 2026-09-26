/* The first request list — what the auditors of the research bundle relied on, turned into what this engagement
   asks the client for in the first round.
   Source: the key / critical audit matter pages of the bundle's auditor's reports (global-benchmarks-engine KAMS,
   95 matters in 43 reports). Each matter's page (and the next, where the response continues) was read for the
   procedures the auditor describes — the same patterns global-corpus-engine counts over every auditor-report page —
   and counted per theme: THEME_PROCS['impairment-intangibles'].procs.forecasts = 9 means 9 of the 10 reports with
   a goodwill matter describe testing the forecasts. A procedure is performed on documents the client holds, so each
   one maps to the documents requested (PROC_DOCS). The engagement's own matters (kam-engine) choose the themes;
   the request list is ranked by how many auditors relied on each procedure, with the cited matters as precedent. */
import { KAMS, REPORTS, THEMES, type Theme } from './global-benchmarks-engine';
import type { DocRequest } from './tb-review-engine';

export type ProcKey = 'test_controls' | 'evaluate_assumptions' | 'specialists' | 'sensitivity' | 'compare_history' | 'recalculate' | 'confirmations' | 'inspect_contracts'
  | 'legal_letters' | 'subsequent' | 'disclosures' | 'data_completeness' | 'retrospective' | 'third_party' | 'independent_estimate' | 'journal_entries' | 'cut_off'
  | 'site_visits' | 'discount_rates' | 'forecasts' | 'it_systems' | 'component_auditors';

/* procedures per theme, counted on the matters' pages (reports with the theme, reports describing the procedure) */
export const THEME_PROCS: Record<string, { reports: number; procs: Partial<Record<ProcKey, number>> }> = {
  'tax-uncertainty': { reports: 11, procs: { test_controls: 7, confirmations: 4, legal_letters: 4, forecasts: 2, retrospective: 1, specialists: 1, compare_history: 1, data_completeness: 1 } },
  'credit-losses': { reports: 11, procs: { forecasts: 8, test_controls: 3, recalculate: 2, evaluate_assumptions: 1, specialists: 1 } },
  'impairment-intangibles': { reports: 10, procs: { forecasts: 9, discount_rates: 7, specialists: 6, recalculate: 4, third_party: 4, sensitivity: 3, independent_estimate: 2, test_controls: 2, disclosures: 2, compare_history: 2, journal_entries: 1, retrospective: 1 } },
  'provisions-litigation': { reports: 9, procs: { test_controls: 6, legal_letters: 5, forecasts: 5, discount_rates: 4, disclosures: 3, inspect_contracts: 2, confirmations: 2, data_completeness: 2, independent_estimate: 2, specialists: 2, it_systems: 2, evaluate_assumptions: 1, recalculate: 1, compare_history: 1 } },
  'revenue-recognition': { reports: 8, procs: { discount_rates: 4, specialists: 4, forecasts: 4, test_controls: 3, it_systems: 3, cut_off: 2, compare_history: 2, data_completeness: 1, disclosures: 1, sensitivity: 1, recalculate: 1, journal_entries: 1 } },
  'fair-value': { reports: 8, procs: { specialists: 5, test_controls: 4, forecasts: 3, independent_estimate: 2, recalculate: 1, journal_entries: 1, third_party: 1, confirmations: 1, discount_rates: 1, it_systems: 1 } },
  'revenue-deductions': { reports: 8, procs: { independent_estimate: 5, third_party: 3, journal_entries: 2, forecasts: 2, retrospective: 2, test_controls: 2, recalculate: 1, specialists: 1, sensitivity: 1, discount_rates: 1, disclosures: 1, data_completeness: 1, compare_history: 1, legal_letters: 1 } },
  'impairment-assets': { reports: 8, procs: { forecasts: 6, test_controls: 5, discount_rates: 5, sensitivity: 2, specialists: 2, recalculate: 2, third_party: 2, subsequent: 1, compare_history: 1, disclosures: 1, data_completeness: 1 } },
  'complex-transactions': { reports: 3, procs: { data_completeness: 1, discount_rates: 1, specialists: 1, recalculate: 1, inspect_contracts: 1 } },
  'parent-investments': { reports: 3, procs: { sensitivity: 2, third_party: 2, discount_rates: 2, test_controls: 2, inspect_contracts: 1, component_auditors: 1, disclosures: 1, data_completeness: 1, independent_estimate: 1, specialists: 1, recalculate: 1, forecasts: 1 } },
  'actuarial': { reports: 2, procs: { independent_estimate: 2, specialists: 1, compare_history: 1, test_controls: 1, disclosures: 1, data_completeness: 1, site_visits: 1, discount_rates: 1, component_auditors: 1 } },
  'it-controls': { reports: 2, procs: { it_systems: 2, test_controls: 1, specialists: 1 } },
  'inventory': { reports: 1, procs: { site_visits: 1, it_systems: 1 } },
  'climate': { reports: 1, procs: { discount_rates: 1, forecasts: 1 } },
  'fraud-override': { reports: 1, procs: { sensitivity: 1, discount_rates: 1, forecasts: 1 } },
  'related-parties': { reports: 1, procs: { confirmations: 1, inspect_contracts: 1, disclosures: 1 } },};

/* what each procedure is performed on — the documents the client provides, and the standard behind the request */
export const PROC_DOCS: Record<ProcKey, { ar: string; docs: [title: string, purpose: string][]; standard: string }> = {
  forecasts: { ar: 'اختبار التوقعات وخطط الأعمال', standard: 'ISA 540', docs: [['الموازنة وخطة الأعمال المعتمدة من مجلس الإدارة وتوقعات التدفقات النقدية', 'اختبار الافتراضات المستقبلية ومقارنتها بالأداء الفعلي']] },
  discount_rates: { ar: 'معدلات الخصم والنمو', standard: 'ISA 540', docs: [['احتساب معدل الخصم ومعدل النمو طويل الأجل ومصادر مدخلاتهما', 'مقارنتها بنطاق مستقل من بيانات السوق']] },
  specialists: { ar: 'الاستعانة بالخبراء', standard: 'ISA 500 / ISA 620', docs: [['تقارير خبراء الإدارة (التقييم، الاكتواري، الضريبي) وخطابات تكليفهم', 'تقييم كفاءة الخبير وموضوعيته والاعتماد على عمله']] },
  test_controls: { ar: 'اختبار الضوابط', standard: 'ISA 315 / ISA 330', docs: [['توثيق الضوابط الرئيسية على العملية (السياسات، مصفوفة الصلاحيات، أدلة الاعتماد)', 'اختبار تصميم الضوابط وتطبيقها وفاعلية تشغيلها']] },
  confirmations: { ar: 'المصادقات الخارجية', standard: 'ISA 505', docs: [['بيانات الأطراف للمصادقة (العملاء، الموردون، البنوك، الجهات الضريبية) وتفويض الإدارة بالمصادقة', 'الحصول على أدلة خارجية مباشرة']] },
  legal_letters: { ar: 'خطابات المستشارين القانونيين', standard: 'ISA 501', docs: [['قائمة القضايا والمطالبات والمستشارين القانونيين، ومراسلات الجهات الرقابية', 'تقييم الالتزامات المحتملة والمخصصات (IAS 37)']] },
  recalculate: { ar: 'إعادة الاحتساب', standard: 'ISA 500', docs: [['جداول احتساب الإدارة للتقدير (ملف العمل بالمعادلات)', 'إعادة الاحتساب واختبار الدقة الحسابية']] },
  inspect_contracts: { ar: 'فحص العقود والمحاضر', standard: 'ISA 500', docs: [['العقود والاتفاقيات الجوهرية ومحاضر مجلس الإدارة واللجان للسنة وما بعدها', 'فهم الشروط المؤثرة في الاعتراف والقياس']] },
  independent_estimate: { ar: 'التقدير المستقل', standard: 'ISA 540', docs: [['البيانات التاريخية التي بُني عليها التقدير (المطالبات، الاستخدام، المرتجعات)', 'بناء توقع مستقل ومقارنته بتقدير الإدارة']] },
  third_party: { ar: 'مصادر خارجية', standard: 'ISA 500', docs: [['مصادر البيانات الخارجية المستخدمة (أسعار السوق، المؤشرات، تقارير الصناعة)', 'مقارنة المدخلات بمصادر مستقلة']] },
  sensitivity: { ar: 'تحليل الحساسية', standard: 'ISA 540', docs: [['تحليلات الحساسية التي أعدتها الإدارة للافتراضات الرئيسية', 'تقييم أثر التغيرات المعقولة الممكنة وكفاية الإفصاح']] },
  compare_history: { ar: 'المقارنة بالنتائج الفعلية', standard: 'ISA 540', docs: [['تقديرات السنة السابقة وما تحقق منها فعلاً', 'تقييم دقة تقديرات الإدارة السابقة']] },
  retrospective: { ar: 'المراجعة بأثر رجعي', standard: 'ISA 540', docs: [['تسوية مخصصات السنة السابقة مع ما سُدد أو استُخدم فعلاً', 'اكتشاف التحيز في التقديرات']] },
  data_completeness: { ar: 'اكتمال البيانات ودقتها', standard: 'ISA 500', docs: [['البيانات التفصيلية الأساسية للتقدير مطابقةً للأستاذ العام', 'اختبار اكتمال ودقة المدخلات']] },
  disclosures: { ar: 'كفاية الإفصاحات', standard: 'ISA 700', docs: [['مسودة الإيضاحات المتعلقة بالبند وافتراضاته وحساسيته', 'تقييم كفاية الإفصاح']] },
  journal_entries: { ar: 'قيود اليومية', standard: 'ISA 240', docs: [['تصدير كامل لقيود اليومية للسنة من النظام (المُدخل، المعتمد، التاريخ، الوصف)', 'اختبار القيود اليدوية وغير المعتادة']] },
  cut_off: { ar: 'القطع', standard: 'ISA 500', docs: [['فواتير ومستندات الشحن والاستلام قبل نهاية السنة وبعدها بأسبوعين', 'اختبار قطع المعاملات']] },
  site_visits: { ar: 'الجرد وزيارة المواقع', standard: 'ISA 501', docs: [['تعليمات الجرد وجدوله وقوائم الجرد الموقعة', 'حضور الجرد وإثبات الوجود']] },
  subsequent: { ar: 'الأحداث والمتحصلات اللاحقة', standard: 'ISA 560', docs: [['كشوف التحصيلات والمدفوعات والتسويات اللاحقة لنهاية السنة', 'إثبات الوجود والتقييم بالأحداث اللاحقة']] },
  it_systems: { ar: 'أنظمة المعلومات', standard: 'ISA 315', docs: [['قائمة الأنظمة المالية ومستخدميها وصلاحياتهم وسجل التغييرات', 'اختبار الضوابط العامة لتقنية المعلومات']] },
  evaluate_assumptions: { ar: 'معقولية الافتراضات', standard: 'ISA 540', docs: [['مذكرة الإدارة بالافتراضات الرئيسية ومبرراتها', 'تقييم معقولية الافتراضات']] },
  component_auditors: { ar: 'مراجعو المكونات', standard: 'ISA 600', docs: [['قائمة الشركات التابعة ومراجعيها وحزم التقرير الخاصة بها', 'توجيه أعمال مراجعي المكونات ومراجعتها']] },
};

export type OpeningRequest = DocRequest & { proc: ProcKey; procAr: string; theme: string; themeAr: string; share: number; used: number; of: number; precedents: { company: string; page: number }[] };
const REPORT_NAME = new Map(REPORTS.map((r) => [r.id, r.company]));
const THEME_LINES = (t: string) => (THEMES as Record<string, { lines: string[] }>)[t]?.lines ?? [];

/** The first-round requests for the engagement's matters: per theme, the procedures most auditors relied on (at least `minShare` of them). */
export function openingRequests(themes: string[], opts: { minShare?: number; perTheme?: number; lineOf?: (theme: string) => string | undefined } = {}): OpeningRequest[] {
  const out: OpeningRequest[] = [], seen = new Set<string>(), min = opts.minShare ?? 0.25, per = opts.perTheme ?? 3;
  for (const t of themes) {
    const tp = THEME_PROCS[t];
    if (!tp) continue;
    const ranked = (Object.entries(tp.procs) as [ProcKey, number][]).map(([k, n]) => ({ k, n, share: n / tp.reports })).filter((x) => x.share >= min).sort((a, b) => b.n - a.n).slice(0, per);
    const precedents = KAMS.filter((k) => k.theme === t).slice(0, 3).map((k) => ({ company: REPORT_NAME.get(k.report) ?? k.report, page: k.page }));
    for (const { k, n, share } of ranked) {
      for (const [title, purpose] of PROC_DOCS[k].docs) {
        const key = title + '|' + t;
        if (seen.has(key)) continue;
        seen.add(key);
        const themeAr = (THEMES as Record<string, { ar: string }>)[t]?.ar ?? t;
        out.push({ id: 'PBC-W-' + t + '-' + k, title: title + ' — ' + themeAr, purpose: purpose + ' (' + n + ' من ' + tp.reports + ' مراجعين في التقارير العالمية)', lineKey: opts.lineOf?.(t) ?? THEME_LINES(t)[0],
          accounts: [], standard: PROC_DOCS[k].standard, priority: share >= 0.5 ? 'عالية' : 'متوسطة', source: 'engine', proc: k, procAr: PROC_DOCS[k].ar, theme: t, themeAr,
          share: Math.round(share * 100) / 100, used: n, of: tp.reports, precedents });
      }
    }
  }
  return out.sort((a, b) => b.share - a.share);
}

/** What auditors rely on across all matters — the procedures ranked by how many matter themes they serve and how often. */
export function procedureLeague() {
  const agg = new Map<ProcKey, { n: number; themes: number }>();
  for (const tp of Object.values(THEME_PROCS)) for (const [k, n] of Object.entries(tp.procs) as [ProcKey, number][]) {
    const a = agg.get(k) ?? { n: 0, themes: 0 }; a.n += n; a.themes++; agg.set(k, a);
  }
  return [...agg.entries()].map(([k, v]) => ({ key: k, ar: PROC_DOCS[k].ar, matters: v.n, themes: v.themes, docs: PROC_DOCS[k].docs.map((d) => d[0]) })).sort((a, b) => b.matters - a.matters);
}
export const themeOf = (t: string): Theme | null => (t in THEMES ? (t as Theme) : null);
