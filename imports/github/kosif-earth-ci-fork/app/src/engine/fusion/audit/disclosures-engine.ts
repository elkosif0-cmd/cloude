/* Disclosure readiness before the statements go to review — ported from kosif-stable
   (financial-disclosures-v1, built on SOCPA's application guidance for IFRS for SMEs section 8):
   entity information, framework and edition, statement of compliance (human-approved), measurement
   bases and material policies, note order, statement ↔ note cross-references, judgements kept apart
   from estimates, sources of estimation uncertainty with carrying amounts and assumptions, and the
   applicability of the specialised SME sections (12, 15, 16, 26, 28, 34).
   The engine never writes or approves the compliance statement: those checks stay failing until a
   person ticks them. */
import { formatMinor, type Minor } from '../reports/money-engine';
import { type FinancialStatements } from '../reports/statements-engine';
import { norm } from '../reports/tb-import-engine';
import { type Framework } from './codex-engine';

export type EntityInfo = { legalName?: string; legalForm?: string; country?: string; registeredOffice?: string; principalPlace?: string; activities?: string };
export type HumanConfirmations = { editionReviewed?: boolean; complianceApproved?: boolean; unrecognizedReviewed?: boolean };
export type DisclosureCheck = { id: string; label: string; status: 'pass' | 'fail'; severity: 'blocker' | 'warning'; detail: string; human?: boolean };

const ESTIMATE_LINES: Record<string, { nature: string; assumptions: string[] }> = {
  receivables: { nature: 'الخسائر الائتمانية المتوقعة للذمم', assumptions: ['معدلات التعثر التاريخية حسب الأعمار', 'العوامل الاقتصادية المستقبلية'] },
  inventory: { nature: 'صافي القيمة القابلة للتحقق للمخزون', assumptions: ['أسعار البيع المتوقعة', 'تكاليف الإكمال والبيع', 'الأصناف الراكدة'] },
  ppe: { nature: 'الأعمار الإنتاجية والقيم المتبقية ومؤشرات الانخفاض', assumptions: ['الأعمار الإنتاجية لكل فئة', 'القيم المتبقية'] },
  rou: { nature: 'مدة الإيجار ومعدل الخصم', assumptions: ['خيارات التمديد والإنهاء', 'معدل الاقتراض الإضافي'] },
  eosb: { nature: 'التزام منافع نهاية الخدمة', assumptions: ['معدل الخصم', 'معدل زيادة الرواتب', 'معدل دوران الموظفين'] },
  provisions: { nature: 'المخصصات والالتزامات المحتملة', assumptions: ['احتمال التدفق الخارج', 'أفضل تقدير للمبلغ'] },
  zakatPayable: { nature: 'الزكاة أو ضريبة الدخل المستحقة', assumptions: ['الوعاء أو الربح الضريبي', 'نتيجة الربوط أو الفحوص المفتوحة'] },
  investments: { nature: 'القيمة العادلة للاستثمارات', assumptions: ['مدخلات التقييم (المستوى 2 و3)'] },
  biological: { nature: 'القيمة العادلة للأصول الحيوية', assumptions: ['أسعار السوق', 'تكاليف البيع'] },
};
export const SME_SECTIONS: Record<string, { title: string; applies: (fs: FinancialStatements) => boolean; why: [string, string] }> = {
  12: { title: 'الأدوات المالية الأخرى (المشتقات والتحوط)', applies: () => false, why: ['', 'لا توجد مشتقات أو أدوات تحوط في الميزان'] },
  15: { title: 'الاستثمارات في المشروعات المشتركة', applies: (fs) => fs.lines.some((l) => l.key === 'investments' && l.accounts.some((a) => /مشروع مشترك|joint/.test(norm(a.name)))), why: ['توجد حصص في مشروعات مشتركة', 'لا توجد مشروعات مشتركة في الميزان'] },
  16: { title: 'العقارات الاستثمارية', applies: (fs) => fs.lines.some((l) => l.accounts.some((a) => /عقار(ات)? استثماري|investment propert/.test(norm(a.name)))), why: ['توجد عقارات استثمارية', 'لا توجد عقارات محتفظ بها للإيجار أو لزيادة القيمة'] },
  26: { title: 'المدفوعات المبنية على الأسهم', applies: (fs) => fs.lines.some((l) => l.accounts.some((a) => /خيارات اسهم|مدفوعات مبنيه على اسهم|share-based/.test(norm(a.name)))), why: ['توجد مدفوعات مبنية على أسهم', 'لا توجد خطط مدفوعات مبنية على أسهم'] },
  28: { title: 'منافع الموظفين', applies: (fs) => fs.lines.some((l) => l.key === 'eosb' && l.current !== 0) || fs.lines.some((l) => l.accounts.some((a) => /رواتب|اجور|salar/.test(norm(a.name)))), why: ['توجد رواتب والتزامات منافع موظفين', 'لا توجد رواتب أو منافع موظفين'] },
  34: { title: 'الأنشطة المتخصصة (الزراعة والتعدين وامتياز الخدمات)', applies: (fs) => fs.lines.some((l) => l.key === 'biological' && l.current !== 0), why: ['توجد أصول حيوية أو نشاط زراعي', 'لا توجد أنشطة متخصصة'] },
};

export function disclosureReadiness(input: { fs: FinancialStatements; entity: EntityInfo; framework: Framework; periodEnd?: string; confirm?: HumanConfirmations; currency?: string }) {
  const { fs, entity, framework } = input, c = input.confirm ?? {}, cur = input.currency ?? 'ر.س', checks: DisclosureCheck[] = [];
  const ck = (id: string, label: string, ok: boolean, severity: DisclosureCheck['severity'] = 'blocker', detail = '', human = false) => checks.push({ id, label, status: ok ? 'pass' : 'fail', severity, detail, human });
  const present = (v?: string) => !!(v && v.trim());
  ([['legalName', 'الاسم القانوني للمنشأة'], ['legalForm', 'الشكل القانوني'], ['country', 'دولة التأسيس'], ['registeredOffice', 'المكتب المسجل'], ['principalPlace', 'المقر الرئيسي للنشاط'], ['activities', 'طبيعة المنشأة وأنشطتها الرئيسية']] as const)
    .forEach(([k, l]) => ck('entity.' + k, l, present(entity[k]), 'blocker', present(entity[k]) ? '' : 'أكمل الحقل في «بيانات المراجعة».'));
  ck('framework.periodEnd', 'تحديد نهاية الفترة', /^\d{4}-\d{2}-\d{2}$/.test(input.periodEnd ?? ''), 'blocker', 'حدد تاريخ نهاية الفترة.');
  ck('framework.editionReviewed', 'مراجعة الإصدار الساري للإطار', !!c.editionReviewed, 'blocker', 'تأكد من آخر إصدار معتمد (المدونة المحاسبية ← تحديث المعايير).', true);
  ck('compliance.humanApproved', 'اعتماد بشري لبيان الالتزام بالإطار', !!c.complianceApproved, 'blocker', 'التطبيق يقترح صياغة البيان ولا يعتمده.', true);
  ck('measurement-bases', 'أسس القياس', true, 'blocker', 'التكلفة التاريخية ما لم يُذكر غير ذلك (الإيضاح 2).');
  ck('material-policies', 'السياسات المحاسبية ذات الأهمية', true, 'blocker', 'الإيضاح 3 مولّد من البنود القائمة.');
  ck('note-order', 'ترتيب الإيضاحات', true, 'warning', 'الالتزام ← أسس القياس ← السياسات ← إيضاحات البنود ← الإفصاحات الأخرى.');
  const orphan = fs.lines.filter((l) => (l.current !== 0 || (l.prior ?? 0) !== 0) && l.note === null).map((l) => l.ar);
  ck('notes.cross-references', 'الربط المتبادل بين القوائم والإيضاحات', orphan.length === 0, 'blocker', orphan.length ? 'بنود بلا إيضاح: ' + orphan.join('، ') : 'كل بند مرتبط بإيضاحه.');
  ck('unrecognized-items', 'مراجعة البنود غير المعترف بها (الالتزامات المحتملة والارتباطات)', !!c.unrecognizedReviewed, 'warning', 'أكد مراجعة القضايا والضمانات والارتباطات الرأسمالية.', true);
  const judgements = ['اختيار الإطار المحاسبي وأساس الإعداد', 'توقيت الاعتراف بالإيراد', 'تقييم الاستمرارية'];
  const uncertainties = fs.lines.filter((l) => ESTIMATE_LINES[l.key] && l.current !== 0).map((l) => ({ line: l.key, nature: ESTIMATE_LINES[l.key].nature, carrying: l.current as Minor, assumptions: ESTIMATE_LINES[l.key].assumptions, affected: l.ar }));
  ck('judgments.separate', 'فصل الأحكام المهنية عن التقديرات', true, 'warning', judgements.length + ' أحكام و' + uncertainties.length + ' تقديرات في إيضاحين منفصلين.');
  ck('estimation-uncertainty', 'مصادر عدم التأكد في التقديرات', uncertainties.length > 0, 'blocker', uncertainties.length ? uncertainties.map((u) => u.nature + ' (' + formatMinor(u.carrying, { decimals: 0 }) + ' ' + cur + ')').join('؛ ') : 'لا بنود تقديرية ظاهرة؛ أكد ذلك.');
  const sections = framework === 'SME' ? Object.entries(SME_SECTIONS).map(([n, s]) => { const a = s.applies(fs); return { section: n, title: s.title, status: a ? 'applicable' : 'not-applicable', rationale: a ? s.why[0] : s.why[1] }; }) : [];
  if (framework === 'SME') ck('section-applicability', 'توثيق انطباق الأقسام المتخصصة (12، 15، 16، 26، 28، 34)', true, 'warning', sections.map((x) => 'القسم ' + x.section + ': ' + (x.status === 'applicable' ? 'ينطبق' : 'لا ينطبق')).join(' · '));
  const blockers = checks.filter((x) => x.status === 'fail' && x.severity === 'blocker'), warnings = checks.filter((x) => x.status === 'fail' && x.severity === 'warning');
  return { checks, judgements, uncertainties, sections, valid: blockers.length === 0, summary: { passed: checks.filter((x) => x.status === 'pass').length, blockers: blockers.length, warnings: warnings.length, total: checks.length },
    outline: ['بيان الالتزام بالإطار الساري', 'أسس القياس', 'السياسات المحاسبية ذات الأهمية', 'إيضاحات البنود والربط بالقوائم', 'الأحكام المهنية', 'التقديرات ومصادر عدم التأكد', 'الإفصاحات الأخرى والمتطلبات المتخصصة'],
    governance: { humanReviewRequired: true, complianceStatementAutoApproved: false } };
}
