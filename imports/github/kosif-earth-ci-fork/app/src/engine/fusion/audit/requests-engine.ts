/* Document requests (PBC — «قائمة ما يُعدّه العميل») — what an audit firm asks the entity for, when, why, and what it does
   when a document cannot be had. Two layers, as the published auditor's reports of the research bundle show them:
   • the routine evidence every audit collects (ISA 500–580): the signed trial balance, confirmations, registers, counts,
     minutes, legal letters, representations — rarely named in a published report because every audit does it;
   • the evidence behind the judgemental areas the world's auditors wrote about in their key audit matters: forecasts and
     approved business plans (30 of the 40 reports read), contracts (24), external market data (21), valuation and actuarial
     reports (17), IT general controls (33), completeness and accuracy of the data behind a model (18), sensitivity and
     management-bias tests (13), legal counsel letters (15) — counted over the auditor's reports extracted from the bundle.
   Every request carries its evidence kind (and how reliable that kind is, ISA 500.A31), the assertions it proves, the
   standard, the priority and the alternative procedure if it is refused or unavailable (ISA 505.12, ISA 500.A6). A request
   the entity declares unavailable becomes a scope limitation whose weight against materiality decides the opinion
   (ISA 705.7–10): immaterial — no effect; material — «except for»; material and pervasive — disclaimer. */
import type { Theme } from './global-benchmarks-engine';
import type { AssertionKey } from './confidence-engine';

export type EvidenceKind = 'confirmation' | 'bank' | 'contract' | 'invoice' | 'register' | 'count' | 'minutes' | 'legal' | 'forecast' | 'valuation' | 'market'
  | 'controls' | 'itgc' | 'data' | 'recalc' | 'tax' | 'journal' | 'sensitivity' | 'disclosure' | 'specialist' | 'loan' | 'regulatory' | 'policy' | 'representation'
  | 'reconciliation' | 'schedule';
/** reliability: 3 external and sent to the auditor directly, 2 external held by the entity, 1 produced by the entity (ISA 500.A31) */
export const EVIDENCE: Record<EvidenceKind, { ar: string; reliability: 1 | 2 | 3; bundle?: [number, number] }> = {
  confirmation: { ar: 'مصادقة خارجية مباشرة', reliability: 3, bundle: [4, 40] }, bank: { ar: 'كشوف ومصادقات بنكية', reliability: 3, bundle: [2, 40] },
  legal: { ar: 'خطاب المستشار القانوني', reliability: 3, bundle: [15, 40] }, contract: { ar: 'عقود واتفاقيات', reliability: 2, bundle: [24, 40] },
  invoice: { ar: 'فواتير ومستندات تسليم وشحن', reliability: 2, bundle: [8, 40] }, loan: { ar: 'اتفاقيات تمويل وتعهدات', reliability: 2, bundle: [5, 40] },
  regulatory: { ar: 'مراسلات الجهات الرقابية', reliability: 2, bundle: [23, 40] }, tax: { ar: 'إقرارات وربوط ومراسلات ضريبية وزكوية', reliability: 2, bundle: [10, 40] },
  valuation: { ar: 'تقارير تقييم واكتواري من خبير', reliability: 2, bundle: [17, 40] }, market: { ar: 'بيانات سوق ومصادر خارجية', reliability: 2, bundle: [21, 40] },
  minutes: { ar: 'محاضر المجلس واللجان', reliability: 2, bundle: [4, 40] }, count: { ar: 'حضور الجرد والفحص المادي', reliability: 3, bundle: [6, 40] },
  register: { ar: 'سجلات تفصيلية', reliability: 1 }, schedule: { ar: 'كشوف تحليلية من الإدارة', reliability: 1 }, reconciliation: { ar: 'مطابقات', reliability: 1 },
  forecast: { ar: 'موازنات وتوقعات وخطط أعمال معتمدة', reliability: 1, bundle: [30, 40] }, policy: { ar: 'سياسات وإجراءات موثقة', reliability: 1 },
  controls: { ar: 'توثيق الضوابط واختبارها', reliability: 1, bundle: [17, 40] }, itgc: { ar: 'ضوابط تقنية المعلومات العامة', reliability: 1, bundle: [33, 40] },
  data: { ar: 'بيانات أساسية لاختبار الاكتمال والدقة', reliability: 1, bundle: [18, 40] }, recalc: { ar: 'نماذج قابلة لإعادة الاحتساب', reliability: 1, bundle: [15, 40] },
  journal: { ar: 'مجتمع القيود اليومية', reliability: 1, bundle: [7, 40] }, sensitivity: { ar: 'تحليل حساسية وتقديرات سابقة', reliability: 1, bundle: [13, 40] },
  disclosure: { ar: 'مسودة الإيضاحات ومصادرها', reliability: 1, bundle: [37, 40] }, specialist: { ar: 'عمل خبير (ضرائب، تقييم، اكتواري، تقنية)', reliability: 2, bundle: [19, 40] },
  representation: { ar: 'إقرارات مكتوبة من الإدارة', reliability: 1 },
};
export type Stage = 'planning' | 'area' | 'kam' | 'completion';
export const STAGE_AR: Record<Stage, string> = { planning: 'التخطيط وفهم المنشأة', area: 'بنود القوائم', kam: 'المناطق الحكمية (الأمور الرئيسية)', completion: 'الإقفال والتقرير' };
/** when: always — every audit; significant — the line is significant; estimate / fraud — the line carries one; prior — comparatives exist */
export type When = 'always' | 'significant' | 'estimate' | 'fraud' | 'prior' | 'material';
export type Template = { id: string; stage: Stage; title: string; purpose: string; kind: EvidenceKind; assertions: AssertionKey[]; isa: string; lines?: string[]; theme?: Theme;
  when: When; from: string; alt: string };

const T = (id: string, stage: Stage, title: string, purpose: string, kind: EvidenceKind, assertions: AssertionKey[], isa: string, when: When, from: string, alt: string, x: { lines?: string[]; theme?: Theme } = {}): Template =>
  ({ id, stage, title, purpose, kind, assertions, isa, when, from, alt, ...x });
const E_: AssertionKey = 'existence', C: AssertionKey = 'completeness', A: AssertionKey = 'accuracy', K: AssertionKey = 'cutoff', V: AssertionKey = 'valuation', P: AssertionKey = 'presentation';
const MGT = 'الإدارة المالية';

export const LIBRARY: Template[] = [
  /* ---------- planning: understanding the entity (ISA 210, 300, 315, 550, 570, 600) ---------- */
  T('PL-01', 'planning', 'ميزان المراجعة النهائي بالأرصدة الافتتاحية والحركة والختامية، موقعاً من الإدارة', 'أساس القوائم ومطابقتها مع الأستاذ العام', 'schedule', [C, A], 'ISA 500', 'always', MGT, 'مطابقة الميزان مع الأستاذ العام المستخرج من النظام مباشرة'),
  T('PL-02', 'planning', 'القوائم المالية ومسودة الإيضاحات للسنة محل المراجعة', 'ربط الميزان بالقوائم وفحص الإفصاحات', 'disclosure', [P], 'ISA 700', 'always', MGT, 'إعداد الربط من الميزان ومطالبة الإدارة بالإيضاحات الناقصة'),
  T('PL-03', 'planning', 'القوائم المالية المراجعة للسنة السابقة وتقرير المراجع السابق', 'الأرصدة الافتتاحية والمقارنة', 'disclosure', [E_, P], 'ISA 510', 'prior', MGT, 'فحص الأرصدة الافتتاحية بإجراءات بديلة (التحصيلات والمدفوعات اللاحقة)'),
  T('PL-04', 'planning', 'السجل التجاري وعقد التأسيس والنظام الأساس وآخر تعديلاته', 'الكيان النظامي ورأس المال والصلاحيات', 'contract', [E_, P], 'ISA 315', 'always', 'الشؤون القانونية', 'الاستعلام من السجل الرسمي للجهة المختصة'),
  T('PL-05', 'planning', 'الهيكل التنظيمي وهيكل المجموعة والشركات التابعة والزميلة ونسب الملكية', 'نطاق التوحيد ومكونات المجموعة', 'schedule', [C, P], 'ISA 600', 'always', MGT, 'بناء الهيكل من محاضر المجلس والسجلات الرسمية'),
  T('PL-06', 'planning', 'محاضر اجتماعات مجلس الإدارة ولجنة المراجعة والجمعيات للسنة وحتى تاريخ التقرير', 'القرارات المؤثرة في القوائم والالتزامات والقضايا', 'minutes', [C, P], 'ISA 315', 'always', 'أمين سر المجلس', 'إقرار مكتوب بعدم وجود قرارات أخرى، مع الاستفسار من أعضاء المجلس'),
  T('PL-07', 'planning', 'قائمة الأطراف ذات العلاقة ومعاملاتها وأرصدتها خلال السنة', 'اكتمال الإفصاح عن الأطراف ذات العلاقة (IAS 24)', 'schedule', [C, P], 'ISA 550', 'always', MGT, 'مطابقة الأسماء مع السجل التجاري وسجل المساهمين والحسابات الجارية'),
  T('PL-08', 'planning', 'دليل السياسات المحاسبية والتقديرات والأحكام الهامة', 'ملاءمة السياسات للإطار (IAS 8)', 'policy', [P, V], 'ISA 315', 'always', MGT, 'استخلاص السياسات من الإيضاحات ومناقشتها مع الإدارة'),
  T('PL-09', 'planning', 'وصف الأنظمة المحاسبية وتقنية المعلومات وصلاحيات المستخدمين وسجل التغييرات', 'فهم بيئة التقنية وتقييم مخاطرها', 'itgc', [A, C], 'ISA 315', 'always', 'إدارة تقنية المعلومات', 'الاعتماد على الإجراءات الأساسية الموسعة بدل الضوابط الآلية'),
  T('PL-10', 'planning', 'تقارير المراجعة الداخلية وخطابات الإدارة السابقة وردود الإدارة', 'المخاطر المعروفة وحالة معالجتها', 'controls', [E_, A], 'ISA 610', 'always', 'المراجعة الداخلية', 'الاستفسار من لجنة المراجعة'),
  T('PL-11', 'planning', 'الموازنة المعتمدة للسنة والتقارير الإدارية الشهرية (الفعلي مقابل الموازنة)', 'الإجراءات التحليلية وتوقعات الإدارة', 'forecast', [A, C], 'ISA 520', 'always', MGT, 'تحليل الاتجاهات الشهرية من الأستاذ العام'),
  T('PL-12', 'planning', 'تقييم الإدارة للاستمرارية مع توقعات التدفق النقدي لاثني عشر شهراً على الأقل وخطط التمويل', 'تقييم الاستمرارية (ISA 570 المحدث)', 'forecast', [P, V], 'ISA 570', 'always', MGT, 'بناء نموذج تدفق مستقل من القوائم واختبار سيناريوهات الضغط'),
  T('PL-13', 'planning', 'قائمة القضايا والمطالبات والنزاعات القائمة والمحتملة', 'الالتزامات المحتملة والمخصصات (IAS 37)', 'legal', [C, V], 'ISA 501', 'always', 'الشؤون القانونية', 'خطاب مباشر للمستشار القانوني وفحص مصروفات الأتعاب القانونية'),
  T('PL-14', 'planning', 'مجتمع القيود اليومية الكامل للسنة (رقم القيد، التاريخ، المستخدم، الحساب، المبلغ، البيان)', 'اختبار القيود وتجاوز الإدارة للضوابط', 'journal', [E_, A], 'ISA 240', 'always', 'إدارة تقنية المعلومات', 'استخراج القيود من النظام بحضور المراجع'),

  /* ---------- the areas (ISA 500, 501, 505, 540) ---------- */
  T('CA-01', 'area', 'مصادقات بنكية مباشرة لكل الحسابات (بما فيها المقفلة خلال السنة) والتسهيلات والضمانات', 'وجود الأرصدة واكتمال الالتزامات والرهونات', 'bank', [E_, C, P], 'ISA 505', 'always', 'البنوك (يرسلها المراجع)', 'كشوف الحساب الأصلية لشهر الإقفال وما بعده مع اختبار البنود المعلقة', { lines: ['cash', 'loansCl', 'loansNcl'] }),
  T('CA-02', 'area', 'التسويات البنكية في تاريخ الإقفال مع الكشوف الداعمة والبنود المعلقة', 'اكتمال النقد والقطع', 'reconciliation', [E_, K], 'ISA 500', 'always', MGT, 'فحص كشف الشهر اللاحق لتسوية البنود المعلقة', { lines: ['cash'] }),
  T('CA-04', 'area', 'كشوف الحسابات البنكية لشهر الإقفال والشهر اللاحق لكل حساب', 'إثبات الرصيد في تاريخ الإقفال وتسوية البنود المعلقة لاحقاً', 'bank', [E_, K], 'ISA 500', 'always', MGT, 'طلب الكشوف من البنك مباشرة عبر المصادقة البنكية', { lines: ['cash'] }),
  T('CA-03', 'area', 'محاضر جرد النقدية والعهد في تاريخ الإقفال', 'وجود النقد بالصندوق', 'count', [E_], 'ISA 501', 'material', 'أمين الصندوق', 'فحص الحركة اللاحقة للعهد وتسويتها', { lines: ['cash'] }),
  T('AR-01', 'area', 'كشف أعمار الذمم المدينة بالعميل في تاريخ الإقفال مطابقاً للأستاذ', 'التقييم والوجود', 'schedule', [E_, V], 'ISA 500', 'significant', MGT, 'إعداد الأعمار من دفتر الأستاذ المساعد', { lines: ['receivables'] }),
  T('AR-02', 'area', 'مصادقات أرصدة لعينة من العملاء (إيجابية)', 'وجود الأرصدة وحقوق المنشأة', 'confirmation', [E_], 'ISA 505', 'significant', 'العملاء (يرسلها المراجع)', 'التحصيلات اللاحقة وفواتير البيع ومستندات التسليم للأرصدة غير المؤكدة', { lines: ['receivables'] }),
  T('AR-03', 'area', 'سياسة ومصفوفة الخسائر الائتمانية المتوقعة وافتراضاتها المستقبلية وبيانات التعثر التاريخية', 'تقييم المخصص (IFRS 9)', 'recalc', [V], 'ISA 540', 'estimate', MGT, 'تقدير مستقل للمخصص من الأعمار والتحصيلات اللاحقة', { lines: ['receivables', 'impairment'] }),
  T('AR-04', 'area', 'التحصيلات اللاحقة لتاريخ الإقفال لأكبر العملاء', 'الوجود وقابلية التحصيل', 'bank', [E_, V], 'ISA 500', 'significant', MGT, 'مصادقة مباشرة للأرصدة الجوهرية', { lines: ['receivables'] }),
  T('IN-01', 'area', 'تعليمات الجرد وقوائم الجرد الفعلي الموقعة وحضور المراجع للجرد', 'وجود المخزون وحالته', 'count', [E_, C], 'ISA 501', 'significant', 'إدارة المستودعات', 'جرد لاحق مع تتبع الحركة عكسياً إلى تاريخ الإقفال', { lines: ['inventory'] }),
  T('IN-02', 'area', 'تقييم المخزون بالصنف وطريقة التكلفة وفواتير الشراء لعينة', 'التكلفة وصافي القيمة القابلة للتحقق (IAS 2)', 'invoice', [V, A], 'ISA 500', 'significant', MGT, 'إعادة احتساب التكلفة من فواتير الموردين', { lines: ['inventory', 'cogs'] }),
  T('IN-03', 'area', 'تقرير الأصناف الراكدة وبطيئة الحركة وأسعار البيع اللاحقة', 'مخصص التقادم وصافي القيمة القابلة للتحقق', 'schedule', [V], 'ISA 540', 'estimate', MGT, 'مقارنة التكلفة بأسعار البيع اللاحقة لتاريخ الإقفال', { lines: ['inventory'] }),
  T('PP-01', 'area', 'سجل الأصول الثابتة التفصيلي (التكلفة، الإضافات، الاستبعادات، الاستهلاك، الأعمار) مطابقاً للأستاذ', 'الوجود والدقة وإعادة احتساب الاستهلاك', 'register', [E_, A, V], 'ISA 500', 'significant', MGT, 'بناء الحركة من الأستاذ العام وفحص عينة مادية', { lines: ['ppe', 'depreciation'] }),
  T('PP-02', 'area', 'فواتير وعقود ومحاضر استلام الإضافات الجوهرية ومشروعات تحت التنفيذ', 'التكلفة والملكية والرسملة (IAS 16)', 'invoice', [E_, A], 'ISA 500', 'significant', MGT, 'فحص المدفوعات البنكية المقابلة', { lines: ['ppe'] }),
  T('PP-03', 'area', 'صكوك ووثائق ملكية الأصول الرئيسة والرهونات عليها', 'الحقوق والقيود على الأصول', 'contract', [E_, P], 'ISA 500', 'material', 'الشؤون القانونية', 'الاستعلام من السجل العقاري ومصادقة البنوك الدائنة', { lines: ['ppe'] }),
  T('PP-04', 'area', 'دراسة مؤشرات الانخفاض واختبار القيمة القابلة للاسترداد لوحدات توليد النقد', 'التقييم (IAS 36)', 'forecast', [V], 'ISA 540', 'estimate', MGT, 'تقييم مستقل للمؤشرات من الأداء الفعلي وخطط التشغيل', { lines: ['ppe', 'impairment'] }),
  T('RO-01', 'area', 'سجل عقود الإيجار وجداول الالتزام والأصل وأسعار الخصم المستخدمة', 'الاكتمال والقياس (IFRS 16)', 'contract', [C, V], 'ISA 540', 'significant', MGT, 'فحص مصروفات الإيجار والدفعات لاكتشاف عقود غير مسجلة', { lines: ['rou', 'leaseNcl'] }),
  T('IA-01', 'area', 'سجل الأصول غير الملموسة والشهرة وتوزيعها على وحدات توليد النقد', 'الوجود والتقييم (IAS 38، IFRS 3)', 'register', [E_, V], 'ISA 500', 'significant', MGT, 'إعادة بناء الرصيد من اتفاقيات الاستحواذ والتراخيص', { lines: ['intangibles'] }),
  T('IV-01', 'area', 'كشوف الاستثمارات ومصادقات أمناء الحفظ وتقارير القيمة العادلة', 'الوجود والتقييم (IFRS 9/13)', 'confirmation', [E_, V], 'ISA 505', 'significant', 'أمين الحفظ', 'أسعار السوق المعلنة وشهادات الملكية الأصلية', { lines: ['investments', 'investIncome'] }),
  T('AP-01', 'area', 'كشف أرصدة الموردين مع مطابقات كشوف حسابات الموردين الرئيسيين', 'اكتمال الالتزامات', 'reconciliation', [C, A], 'ISA 500', 'significant', MGT, 'مصادقة مباشرة للموردين الرئيسيين', { lines: ['payables'] }),
  T('AP-02', 'area', 'المدفوعات والفواتير المستلمة بعد تاريخ الإقفال حتى تاريخ العمل الميداني', 'البحث عن الالتزامات غير المسجلة والقطع', 'invoice', [C, K], 'ISA 500', 'always', MGT, 'فحص كشوف البنك اللاحقة مباشرة', { lines: ['payables', 'accruals'] }),
  T('AP-03', 'area', 'مصادقات أرصدة لعينة من الموردين (بما فيها الأرصدة الصفرية)', 'اكتمال الالتزامات', 'confirmation', [C], 'ISA 505', 'material', 'الموردون (يرسلها المراجع)', 'كشوف حسابات الموردين والمدفوعات اللاحقة', { lines: ['payables'] }),
  T('AC-01', 'area', 'تحليل المصروفات المستحقة والمطلوبات الأخرى مع أساس كل تقدير', 'الاكتمال والتقييم', 'schedule', [C, V], 'ISA 540', 'estimate', MGT, 'تقدير مستقل من المدفوعات اللاحقة', { lines: ['accruals', 'otherCl'] }),
  T('PR-01', 'area', 'تحليل حركة المخصصات وأساس كل مخصص ورأي المستشارين', 'الاعتراف والقياس (IAS 37)', 'legal', [C, V], 'ISA 540', 'estimate', MGT, 'فحص المحاضر والمراسلات والمدفوعات اللاحقة', { lines: ['provisions'] }),
  T('LN-01', 'area', 'اتفاقيات القروض والتسهيلات وجداول السداد واحتساب التعهدات المالية', 'الاكتمال والتصنيف والالتزام بالتعهدات (IAS 1.74)', 'loan', [C, P], 'ISA 500', 'significant', MGT, 'مصادقة البنوك المقرضة مباشرة', { lines: ['loansCl', 'loansNcl', 'financeCost'] }),
  T('EB-01', 'area', 'التقرير الاكتواري لمكافأة نهاية الخدمة وبيانات الموظفين المستخدمة فيه', 'القياس (IAS 19)', 'valuation', [V, C], 'ISA 540', 'estimate', 'الموارد البشرية', 'احتساب مستقل وفق نظام العمل وسجل الرواتب', { lines: ['eosb'] }),
  T('EB-02', 'area', 'مسيرات الرواتب الشهرية وعقود عينة من الموظفين وسجل التأمينات الاجتماعية', 'حدوث ودقة مصروف الرواتب', 'register', [E_, A], 'ISA 500', 'significant', 'الموارد البشرية', 'مطابقة مسيرات الرواتب مع التحويلات البنكية وسجل التأمينات', { lines: ['admin', 'selling', 'cogs'] }),
  T('TX-01', 'area', 'الإقرارات الزكوية والضريبية والربوط والاعتراضات ومراسلات الهيئة', 'الاكتمال والتقييم (IAS 12، أنظمة الزكاة)', 'tax', [C, V], 'ISA 540', 'always', MGT, 'إشراك مختص الزكاة والضريبة وإعادة احتساب الوعاء', { lines: ['zakatPayable', 'zakatExpense'] }),
  T('TX-02', 'area', 'إقرارات ضريبة القيمة المضافة للفترة ومطابقتها مع الإيرادات والمشتريات', 'الاكتمال والدقة', 'reconciliation', [C, A], 'ISA 500', 'always', MGT, 'مطابقة مستقلة من الأستاذ العام', { lines: ['vatAsset', 'vatLiability', 'revenue'] }),
  T('EQ-01', 'area', 'سجل المساهمين/الشركاء وقرارات زيادة رأس المال والتوزيعات والاحتياطيات', 'الوجود والعرض', 'minutes', [E_, P], 'ISA 500', 'always', 'أمين سر المجلس', 'الاستعلام من السجل الرسمي', { lines: ['capital', 'reserves', 'partners', 'retained'] }),
  T('RV-01', 'area', 'عقود البيع الرئيسية وسياسة الاعتراف بالإيراد وشروط التسليم والخصومات', 'الحدوث والقطع (IFRS 15)', 'contract', [E_, K], 'ISA 500', 'always', MGT, 'فحص عينة من الفواتير ومستندات التسليم', { lines: ['revenue', 'contractLiab'] }),
  T('RV-02', 'area', 'فواتير ومستندات تسليم لعينة من المبيعات وحول تاريخ الإقفال', 'الحدوث والقطع', 'invoice', [E_, K], 'ISA 500', 'always', MGT, 'فحص التحصيلات البنكية المقابلة للمبيعات', { lines: ['revenue', 'receivables'] }),
  T('RV-03', 'area', 'تحليل المرتجعات والخصومات والحوافز بعد تاريخ الإقفال', 'تقدير المقابل المتغير والقطع', 'schedule', [K, V], 'ISA 540', 'estimate', MGT, 'فحص إشعارات الدائن اللاحقة', { lines: ['revenue'] }),
  T('CS-01', 'area', 'تحليل تكلفة المبيعات وربطها بحركة المخزون والمشتريات', 'الاكتمال والتطابق مع الإيراد', 'reconciliation', [C, A], 'ISA 520', 'always', MGT, 'إعادة بناء التكلفة من حركة المخزون', { lines: ['cogs', 'inventory'] }),
  T('OX-01', 'area', 'تحليل المصروفات التشغيلية الجوهرية وفواتير عينة منها', 'الحدوث والتصنيف', 'invoice', [E_, P], 'ISA 500', 'significant', MGT, 'فحص المدفوعات البنكية المقابلة', { lines: ['selling', 'admin', 'otherIncome'] }),

  /* ---------- the judgemental areas, as the bundle's key audit matters addressed them ---------- */
  T('KM-01', 'kam', 'نموذج اختبار انخفاض الشهرة والأصول غير الملموسة مع الخطة الخمسية المعتمدة من المجلس', 'منهجية التقييم والتدفقات (IAS 36) — كما في 30 من 40 تقريراً', 'forecast', [V], 'ISA 540', 'estimate', MGT, 'نموذج مستقل بافتراضات السوق بمساعدة مختص تقييم', { theme: 'impairment-intangibles', lines: ['intangibles', 'impairment'] }),
  T('KM-02', 'kam', 'مصادر معدل الخصم ومعدل النمو طويل الأجل وتحليل الحساسية وهامش الأمان', 'معقولية الافتراضات مقابل بيانات السوق — 21 من 40 تقريراً', 'market', [V], 'ISA 540', 'estimate', MGT, 'احتساب مستقل لمعدل الخصم من بيانات السوق', { theme: 'impairment-intangibles', lines: ['intangibles', 'ppe'] }),
  T('KM-03', 'kam', 'تقرير المقيّم المستقل (العقارات أو الأصول أو الأدوات غير المتداولة) مع خطاب التكليف', 'كفاءة الخبير واستقلاله ومدخلاته (ISA 500.8)', 'valuation', [V], 'ISA 500', 'estimate', MGT, 'تعيين خبير المراجع لإعادة تقييم عينة', { theme: 'fair-value', lines: ['investments', 'ppe'] }),
  T('KM-04', 'kam', 'توثيق نموذج الخسائر الائتمانية المتوقعة: المراحل، السيناريوهات وأوزانها، والتعديلات الإدارية', 'التقييم وتحيز الإدارة (IFRS 9)', 'recalc', [V], 'ISA 540', 'estimate', MGT, 'إعادة أداء النموذج لعينة وتقدير مستقل للتعديلات', { theme: 'credit-losses', lines: ['receivables', 'impairment'] }),
  T('KM-05', 'kam', 'بيانات المصدر لاختبار اكتمال ودقة البيانات المدخلة في النماذج', 'سلامة المدخلات — 18 من 40 تقريراً', 'data', [C, A], 'ISA 500', 'estimate', MGT, 'مطابقة عينة من البيانات مع المستندات الأصلية', { lines: ['receivables', 'inventory', 'eosb', 'provisions'] }),
  T('KM-06', 'kam', 'مقارنة التقديرات السابقة بنتائجها الفعلية (ما قُدر العام الماضي وما تحقق)', 'مؤشرات تحيز الإدارة (ISA 540.14)', 'sensitivity', [V], 'ISA 540', 'estimate', MGT, 'مراجعة لاحقة مستقلة للتقديرات من الحركة اللاحقة', { lines: ['provisions', 'receivables', 'inventory', 'accruals'] }),
  T('KM-07', 'kam', 'خطابات المستشارين القانونيين الداخليين والخارجيين عن القضايا والتحقيقات (مباشرة للمراجع)', 'الاكتمال والتقييم والإفصاح — 15 من 40 تقريراً', 'legal', [C, V, P], 'ISA 501', 'always', 'المستشارون القانونيون (يرسلها المراجع)', 'اجتماع مع المستشار بحضور الإدارة وإقرار مكتوب', { theme: 'provisions-litigation', lines: ['provisions'] }),
  T('KM-08', 'kam', 'مراسلات الجهات الرقابية والفحوص والتحقيقات وأي مخالفات', 'الالتزام بالأنظمة (ISA 250) — 23 من 40 تقريراً', 'regulatory', [C, P], 'ISA 250', 'always', 'الالتزام', 'الاستعلام من الجهات وإقرار مكتوب من الإدارة', { theme: 'provisions-litigation' }),
  T('KM-09', 'kam', 'قوائم صلاحيات المستخدمين وسجلات تغييرات الأنظمة وفصل المهام في النظام المالي', 'الضوابط العامة لتقنية المعلومات — 33 من 40 تقريراً', 'itgc', [A, C], 'ISA 315', 'always', 'إدارة تقنية المعلومات', 'توسيع الإجراءات الأساسية وتحليل البيانات الكاملة', { theme: 'it-controls' }),
  T('KM-10', 'kam', 'تقييم الإدارة للمواقف الضريبية والزكوية غير المؤكدة ورأي مستشارها الضريبي', 'الاعتراف والقياس (IFRIC 23)', 'tax', [V, C], 'ISA 540', 'estimate', MGT, 'إشراك مختص الضرائب في تقييم مستقل للمواقف', { theme: 'tax-uncertainty', lines: ['zakatPayable', 'zakatExpense', 'provisions'] }),
  T('KM-11', 'kam', 'اتفاقيات الاستحواذ أو البيع وتقرير توزيع سعر الشراء', 'المعالجة المحاسبية للمعاملات المعقدة (IFRS 3/10)', 'contract', [V, P], 'ISA 540', 'material', MGT, 'تقييم مستقل للأصول المستحوذ عليها بمساعدة مختص', { theme: 'complex-transactions', lines: ['intangibles', 'investments'] }),
  T('KM-12', 'kam', 'التقرير الاكتواري الكامل وافتراضات الخصم والتضخم والوفيات', 'القياس (IAS 19) مقابل نطاق مستقل', 'valuation', [V], 'ISA 540', 'estimate', 'الموارد البشرية', 'مقارنة الافتراضات بنطاق خبير المراجع', { theme: 'actuarial', lines: ['eosb'] }),
  T('KM-13', 'kam', 'تحليل الخصومات والحوافز المستحقة للعملاء وأساس الاستحقاق والتسويات الفعلية اللاحقة', 'تقدير المقابل المتغير — كما في تقارير السلع الاستهلاكية', 'schedule', [V, K], 'ISA 540', 'estimate', MGT, 'توقع مستقل من المطالبات الفعلية والاتجاهات', { theme: 'revenue-deductions', lines: ['revenue', 'accruals'] }),
  T('KM-14', 'kam', 'عقود طويلة الأجل ونسبة الإنجاز وتقديرات التكلفة حتى الإكمال', 'توقيت الاعتراف بالإيراد وهوامش العقود (IFRS 15)', 'contract', [V, K], 'ISA 540', 'estimate', MGT, 'زيارات ميدانية ومقارنة التكاليف الفعلية بالتقديرات السابقة', { theme: 'revenue-recognition', lines: ['revenue', 'contractLiab'] }),
  T('KM-15', 'kam', 'قائمة الأطراف ذات العلاقة من النظام ومصادقات أرصدتهم وعقود معاملاتهم', 'الاكتمال والشروط التجارية (IAS 24)', 'confirmation', [C, P], 'ISA 550', 'always', MGT, 'فحص المعاملات غير المعتادة وقرارات المجلس', { theme: 'related-parties', lines: ['partners', 'receivables', 'payables'] }),

  /* ---------- completion (ISA 450, 560, 580, 700) ---------- */
  T('CM-01', 'completion', 'الأحداث اللاحقة لتاريخ القوائم حتى تاريخ التقرير (محاضر، عقود، قضايا، تحصيلات)', 'التعديل أو الإفصاح (IAS 10)', 'minutes', [C, P], 'ISA 560', 'always', MGT, 'الاستفسار الموثق وفحص الحسابات اللاحقة'),
  T('CM-02', 'completion', 'خطابات المستشارين القانونيين المحدثة حتى تاريخ التقرير', 'تحديث القضايا والالتزامات المحتملة', 'legal', [C], 'ISA 501', 'always', 'المستشارون القانونيون (يرسلها المراجع)', 'اجتماع مع المستشار وإقرار الإدارة'),
  T('CM-03', 'completion', 'خطاب إقرارات الإدارة موقعاً بتاريخ التقرير', 'إقرارات مكتوبة مطلوبة (ISA 580)', 'representation', [C, P], 'ISA 580', 'always', 'الإدارة والمجلس', 'لا بديل — امتناع الإدارة يعني الامتناع عن إبداء الرأي (ISA 580.20)'),
  T('CM-04', 'completion', 'القوائم المالية النهائية والإيضاحات بعد قيود التسوية المعتمدة', 'اتساق القوائم مع نتائج المراجعة', 'disclosure', [P], 'ISA 700', 'always', MGT, 'تعديل المسودة من قبل المراجع ومطالبة الإدارة باعتمادها'),
  T('CM-05', 'completion', 'التقرير السنوي ومعلومات مجلس الإدارة (المعلومات الأخرى)', 'قراءة المعلومات الأخرى واتساقها (ISA 720)', 'disclosure', [P], 'ISA 720', 'always', 'أمين سر المجلس', 'الإشارة في التقرير إلى عدم استلام المعلومات الأخرى'),
];

/* ---------- building the list for one engagement ---------- */
/** without these no opinion can be formed: the signed TB, the statements and notes, the minutes, the journal population, the representations */
const ESSENTIAL = new Set(['PL-01', 'PL-02', 'PL-06', 'PL-14', 'CM-03', 'CM-04']);
export type LineRisk = { lineKey: string; ar: string; amount: number; significant: boolean; estimate?: boolean; fraud?: boolean; score?: number };
export type Request = { id: string; stage: Stage; title: string; purpose: string; kind: EvidenceKind; evidenceAr: string; reliability: 1 | 2 | 3; assertions: AssertionKey[];
  isa: string; from: string; alt: string; lineKeys: string[]; lines: string[]; theme?: Theme; priority: 'عالية' | 'متوسطة' | 'منخفضة'; why: string; bundle?: [number, number]; round: number };
export type BuildInput = { risks: LineRisk[]; materiality: number; hasPrior?: boolean; themes?: Theme[]; goingConcernIssue?: boolean; round?: number;
  /** an entity outside the Kingdom that pays income tax: the Saudi-specific requests are asked in their international form */ intl?: boolean };
/* the Saudi-specific requests (zakat, the end-of-service award) as asked of an international entity */
const INTL: Record<string, [string, string]> = {
  'TX-01': ['احتساب ضريبة الدخل (الجارية والمؤجلة) وإقراراتها وإيصالات السداد والربوط والنزاعات ومراسلات الجهات الضريبية', 'الاكتمال والتقييم (IAS 12، IFRIC 23)'],
  'EB-01': ['التقرير الاكتواري لالتزامات منافع الموظفين (المعاشات ونهاية الخدمة) وبياناته', 'القياس (IAS 19)'],
  'KM-10': ['تقييم الإدارة للمواقف الضريبية غير المؤكدة ورأي مستشارها الضريبي', 'الاعتراف والقياس (IFRIC 23)'],
};

/** The requests of this engagement: the routine ones every audit needs, the areas that are material or significant, and the
    judgemental areas its risks point to — each with why it is asked. Ordered by stage, then priority. */
export function buildRequests(i: BuildInput): Request[] {
  const byLine = new Map(i.risks.map((r) => [r.lineKey, r])), themes = new Set(i.themes ?? []), round = i.round ?? 1, out: Request[] = [];
  const has = (t: Template) => (t.lines ?? []).map((k) => byLine.get(k)).filter((r): r is LineRisk => !!r && r.amount !== 0);
  for (const t of LIBRARY) {
    const lines = has(t), anyLine = !t.lines || lines.length > 0;
    const sig = lines.some((r) => r.significant), mat = lines.some((r) => Math.abs(r.amount) >= i.materiality), est = lines.some((r) => r.estimate), fr = lines.some((r) => r.fraud);
    const themed = !!t.theme && themes.has(t.theme);
    let take = false;
    if (t.when === 'always') take = anyLine;
    else if (t.when === 'prior') take = !!i.hasPrior;
    else if (t.when === 'significant') take = sig || mat || themed;
    else if (t.when === 'material') take = mat || themed;
    else if (t.when === 'estimate') take = (est && (sig || mat)) || themed;
    else if (t.when === 'fraud') take = fr;
    if (t.stage === 'kam' && t.theme && !themed && !(est && mat)) take = false;
    if (t.id === 'PL-12' && i.goingConcernIssue) take = true;
    if (!take) continue;
    const pri: Request['priority'] = themed || fr || (t.id === 'PL-12' && i.goingConcernIssue) || ESSENTIAL.has(t.id) ? 'عالية'
      : sig || mat || est || t.stage === 'planning' || t.stage === 'completion' ? 'متوسطة' : 'منخفضة';
    const amount = lines.reduce((s, r) => s + Math.abs(r.amount), 0);
    const why = [themed ? 'منطقة حكمية في هذا الملف' : '', fr ? 'خطر احتيال مفترض' : '', mat ? 'رصيد أكبر من الأهمية النسبية' : sig ? 'بند مهم' : '', est ? 'يتضمن تقديرات' : '',
      t.id === 'PL-12' && i.goingConcernIssue ? 'مؤشرات شك في الاستمرارية' : '', amount ? 'الرصيد ' + Math.round(amount).toLocaleString('en') : ''].filter(Boolean).join(' · ') || 'مطلوب في كل مراجعة';
    const ev = i.intl && t.kind === 'tax' ? { ...EVIDENCE.tax, ar: 'إقرارات وربوط ومراسلات ضريبية' } : EVIDENCE[t.kind];
    const [title, purpose] = i.intl && INTL[t.id] ? INTL[t.id] : [t.title, t.purpose];
    out.push({ id: t.id, stage: t.stage, title, purpose, kind: t.kind, evidenceAr: ev.ar, reliability: ev.reliability, assertions: t.assertions, isa: t.isa, from: t.from, alt: t.alt,
      lineKeys: lines.map((r) => r.lineKey), lines: lines.map((r) => r.ar), theme: t.theme, priority: pri, why, bundle: ev.bundle, round });
  }
  const so: Record<Stage, number> = { planning: 0, area: 1, kam: 2, completion: 3 }, po = { 'عالية': 0, 'متوسطة': 1, 'منخفضة': 2 };
  return out.sort((a, b) => so[a.stage] - so[b.stage] || po[a.priority] - po[b.priority]);
}

/* ---------- the rounds ---------- */
export type Verdict = 'accepted' | 'partial' | 'rejected' | 'unavailable' | 'open';
export type Evaluation = { id: string; verdict: Verdict; note?: string; round: number };
export type FollowUp = { id: string; of: string; title: string; reason: string; kind: EvidenceKind; round: number };
/** What the next round asks: a partial answer asks for the missing part, a rejected document for the alternative evidence,
    an unavailable one becomes a limitation (asked again only if it is the management representation, which has no substitute). */
export function nextRound(reqs: Request[], evals: Evaluation[], round: number): { followUps: FollowUp[]; limitations: Request[]; satisfied: string[]; open: string[] } {
  const last = new Map<string, Evaluation>();
  for (const e of evals) { const p = last.get(e.id); if (!p || e.round >= p.round) last.set(e.id, e); }
  const followUps: FollowUp[] = [], limitations: Request[] = [], satisfied: string[] = [], open: string[] = [];
  for (const r of reqs) {
    const e = last.get(r.id);
    if (!e || e.verdict === 'open') { open.push(r.id); continue; }
    if (e.verdict === 'accepted') { satisfied.push(r.id); continue; }
    if (e.verdict === 'unavailable') { limitations.push(r); continue; }
    followUps.push({ id: r.id + '-F' + round, of: r.id, round, kind: e.verdict === 'rejected' ? 'schedule' : r.kind,
      title: e.verdict === 'partial' ? 'استكمال: ' + r.title : 'بديل: ' + r.alt,
      reason: (e.verdict === 'partial' ? 'المستند المقدم لا يغطي كل المطلوب' : 'المستند مرفوض') + (e.note ? ' — ' + e.note : '') });
  }
  return { followUps, limitations, satisfied, open };
}

export type LimitationImpact = { amount: number; pervasive: boolean; opinion: 'unmodified' | 'qualified' | 'disclaimer'; basis: string; items: { id: string; title: string; amount: number }[] };
/** Documents the entity declared unavailable, weighed against materiality (ISA 705.7–10 and 580.20). */
export function limitationImpact(limits: Request[], risks: LineRisk[], materiality: number, totalAssets = 0): LimitationImpact {
  const byLine = new Map(risks.map((r) => [r.lineKey, r]));
  const items = limits.map((r) => ({ id: r.id, title: r.title, amount: r.lineKeys.reduce((s, k) => s + Math.abs(byLine.get(k)?.amount ?? 0), 0) }));
  const amount = items.reduce((s, x) => s + x.amount, 0);
  if (limits.some((r) => r.id === 'CM-03')) return { amount, pervasive: true, opinion: 'disclaimer', items, basis: 'امتنعت الإدارة عن تقديم الإقرارات المكتوبة (ISA 580.20) — امتناع عن إبداء الرأي' };
  const areas = new Set(limits.flatMap((r) => r.lineKeys)).size;
  const pervasive = amount >= Math.max(materiality * 5, totalAssets * 0.2) || areas >= 4;
  const opinion = amount < materiality ? 'unmodified' : pervasive ? 'disclaimer' : 'qualified';
  return { amount, pervasive, opinion, items,
    basis: opinion === 'unmodified' ? 'القيود على النطاق دون الأهمية النسبية — لا أثر على الرأي' : opinion === 'qualified'
      ? 'تعذر الحصول على أدلة كافية لأرصدة جوهرية غير منتشرة — رأي متحفظ «باستثناء» (ISA 705.7ب)' : 'تعذر الحصول على أدلة كافية لأرصدة جوهرية ومنتشرة — امتناع عن إبداء الرأي (ISA 705.9)' };
}

/** Whether the rounds can stop: every request is satisfied, or what remains was declared unavailable (then the report says so). */
export function canConclude(reqs: Request[], evals: Evaluation[], round: number) {
  const n = nextRound(reqs, evals, round);
  const done = n.open.length === 0 && n.followUps.length === 0;
  return { done, reason: done ? (n.limitations.length ? 'اكتملت الأدلة المتاحة، وما تبقى أقرت الإدارة بعدم توفره — يُصدر التقرير بأثر القيود' : 'اكتملت الأدلة المطلوبة — يُصدر التقرير')
    : n.open.length + ' طلب لم يُقدَّم بعد و' + n.followUps.length + ' طلب متابعة', ...n };
}
