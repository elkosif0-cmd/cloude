/* Governance reports modelled on the research bundle, drafted from the engagement's own numbers:
     • «نهجنا في المراجعة» — the extended auditor's report section Aramco's auditor publishes (PwC, bundle
       p. 10162–10163) and UK auditors require (ISA (UK) 700): overall materiality, how it was determined and
       why, performance materiality, the reporting threshold, the scope and the list of key audit matters
     • the audit committee report — the structure of HSBC's Group Audit Committee report (bundle p. 6153–6157):
       responsibilities, how they were discharged, and the significant issues table (area → issue →
       conclusions and actions), plus the external auditor and ISA 450 misstatements
     • management's report on internal control over financial reporting — Item 9A of the Forms 10-K in the
       bundle (Adobe p. 539, Apple, Amazon): COSO 2013 criteria, the assessment and its conclusion, with each
       deficiency classified the way PCAOB AS 2201 defines deficiency / significant deficiency / material weakness
   Drafts only: the committee, management and the engagement partner own the words and the conclusions. */

export type Materiality = { benchmark: 'pbz' | 'revenue' | 'assets'; benchmarkAr: string; base: number; rate: number; overall: number; performance: number; trivial: number };
export type Section = { title: string; paragraphs: string[]; table?: { columns: string[]; rows: string[][] } };
const money = (v: number, cur: string) => `${Math.round(v / 100).toLocaleString('en')} ${cur}`;
const pct = (v: number) => `${Math.round(v * 1000) / 10}%`;

const RATIONALE: Record<Materiality['benchmark'], string> = {
  pbz: 'الربح قبل الزكاة مقياس مهم لمستخدمي القوائم المالية وأساس مقبول عموماً للمنشآت الهادفة للربح.',
  revenue: 'اخترنا الإيرادات أساساً لأن الربح متذبذب أو منخفض نسبةً إلى حجم النشاط، والإيرادات أكثر استقراراً وتعبيراً عن حجم المنشأة.',
  assets: 'اخترنا مجموع الموجودات أساساً لأن الربح ليس مقياس الأداء الرئيس لمستخدمي هذه القوائم.',
};

/** «Our audit approach» (Aramco / ISA (UK) 700): materiality, scope and the key audit matters at a glance. */
export function auditApproach(i: { materiality: Materiality; currency: string; kamTitles: string[]; taxWord?: 'الزكاة' | 'الضريبة'; components?: string }): Section {
  const m = i.materiality, cur = i.currency, rate = m.base ? m.overall / m.base : m.rate;
  const benchmarkAr = i.taxWord === 'الضريبة' ? m.benchmarkAr.replace('الزكاة', 'ضريبة الدخل') : m.benchmarkAr;
  return { title: 'نهجنا في المراجعة', paragraphs: [
    `حددنا الأهمية النسبية للقوائم المالية ككل بمبلغ ${money(m.overall, cur)}، بنسبة ${pct(rate)} من ${benchmarkAr}.`,
    `واتفقنا مع المكلفين بالحوكمة على أن نبلغهم بالتحريفات التي تتجاوز ${money(m.trivial, cur)}، وبما يقل عنها إن استدعت أسباب نوعية ذلك.`,
    i.components ? `النطاق: ${i.components}.` : 'النطاق: مراجعة كاملة للمنشأة، وصُممت الإجراءات لكل بند جوهري على ضوء تقييم مخاطر التحريف الجوهري فيه.',
    ...(i.kamTitles.length ? [`الأمور الرئيسية للمراجعة: ${i.kamTitles.join('؛ ')}.`] : []),
    'وكما في كل مراجعة، عالجنا خطر تجاوز الإدارة لأدوات الرقابة الداخلية، بما في ذلك النظر في وجود تحيز يمثل خطر تحريف جوهري بسبب الغش.' ],
    table: { columns: ['', ''], rows: [
      ['الأهمية النسبية العامة', money(m.overall, cur)],
      ['كيف حددناها', `${pct(rate)} من ${benchmarkAr} (${money(m.base, cur)})`],
      ['مبرر الأساس المختار', RATIONALE[m.benchmark]],
      ['الأهمية النسبية التنفيذية', `${money(m.performance, cur)} (${pct(m.overall ? m.performance / m.overall : 0)} من الأهمية العامة)`],
      ['حد الإبلاغ للمكلفين بالحوكمة', `${money(m.trivial, cur)} (${pct(m.overall ? m.trivial / m.overall : 0)} من الأهمية العامة)`] ] } };
}

/* ---------- the audit committee report (HSBC GAC structure) ---------- */
export type CommitteeInput = { company: string; period: string; currency: string; firm?: string;
  kams: { title: string; description?: string; how: string }[]; materiality: Materiality;
  corrected: { count: number; profitEffect: number }; uncorrected: { count: number; effect: number };
  findings: { high: number; medium: number; low: number; controlTitles: string[] }; opinionAr: string; goingConcern: boolean; framework: 'IFRS' | 'SME' | 'EAS' };
export function auditCommitteeReport(i: CommitteeInput) {
  const cur = i.currency, firm = i.firm || '[مكتب المراجعة]', fwAr = i.framework === 'EAS' ? 'معايير المحاسبة المصرية' : i.framework === 'SME' ? 'المعيار الدولي للمنشآت الصغيرة ومتوسطة الحجم المعتمد في المملكة' : 'المعايير الدولية للتقرير المالي المعتمدة في المملكة';
  const unMat = i.uncorrected.effect > i.materiality.overall;
  const sections: Section[] = [
    { title: 'المسؤوليات الرئيسية للجنة', paragraphs: [
      'تتولى لجنة المراجعة الإشراف على: سلامة القوائم المالية؛ ملاءمة السياسات والتقديرات المحاسبية؛ فاعلية الرقابة الداخلية وإدارة المخاطر؛ أعمال المراجعة الداخلية؛ واستقلال المراجع الخارجي وفاعليته والتوصية بتعيينه وأتعابه.'] },
    { title: 'كيف أدت اللجنة مسؤولياتها', paragraphs: [
      `التقرير المالي: ناقشت اللجنة مع الإدارة والمراجع الخارجي القوائم المالية لـ${i.period || 'السنة'} المعدة وفق ${fwAr}، والأحكام والتقديرات المحاسبية الهامة، وكفاية الإفصاحات.`,
      `الرقابة الداخلية: اطلعت اللجنة على ملاحظات المراجع (عالية الأثر: ${i.findings.high}، متوسطة: ${i.findings.medium})${i.findings.controlTitles.length ? '، أبرزها: ' + i.findings.controlTitles.slice(0, 3).join('؛ ') : ''}، وتابعت خطط الإدارة لمعالجتها.`,
      `المراجع الخارجي: اطلعت اللجنة على خطة المراجعة ونطاقها، والأهمية النسبية المحددة بمبلغ ${money(i.materiality.overall, cur)}، وتحققت من استقلال ${firm} وعدم تقديمه خدمات تخل باستقلاله، وقيّمت فاعلية أعماله.`,
      `التحريفات (ISA 450): ${i.corrected.count ? `اعتمدت الإدارة ${i.corrected.count} من قيود التسوية أثرها على الربح ${money(i.corrected.profitEffect, cur)}` : 'لم تعتمد الإدارة قيود تسوية بعد'}؛ ${i.uncorrected.count ? `وبقيت ${i.uncorrected.count} من التحريفات غير المصححة أثرها ${money(i.uncorrected.effect, cur)}${unMat ? '، وتتجاوز الأهمية النسبية، وقد طلبت اللجنة تصحيحها أو بيان أثرها على الرأي' : '، وهي دون الأهمية النسبية'}` : 'ولا توجد تحريفات غير مصححة'}.`] },
    { title: 'الأمور الهامة التي نظرت فيها اللجنة', paragraphs: i.kams.length ? ['الجدول التالي يلخص الأمور الهامة وما خلصت إليه اللجنة.'] : ['لم تُحدد أمور رئيسية للمراجعة لهذه السنة.'],
      ...(i.kams.length ? { table: { columns: ['مجال التركيز', 'الأمر', 'الاستنتاجات والإجراءات'], rows: i.kams.map((k) => [k.title, k.description || 'حكم وتقدير محاسبي هام', `ناقشت اللجنة معالجة الإدارة وإجراءات المراجع: ${k.how}`]) } } : {}) },
    { title: 'الاستمرارية', paragraphs: [i.goingConcern ? 'نظرت اللجنة في مؤشرات تثير شكاً حول قدرة المنشأة على الاستمرار، وطلبت من الإدارة خطتها وتدفقاتها النقدية المتوقعة لاثني عشر شهراً على الأقل من تاريخ القوائم، وتأكدت من كفاية الإفصاح عن عدم التأكد الجوهري.'
      : 'راجعت اللجنة تقييم الإدارة لقدرة المنشأة على الاستمرار لاثني عشر شهراً على الأقل ولم يتبين لها عدم تأكد جوهري.'] },
    { title: 'توصية اللجنة', paragraphs: [`بناءً على ما سبق، وفي ضوء ${i.opinionAr} المشتق من أعمال المراجعة، توصي اللجنة مجلس الإدارة/الشركاء باعتماد القوائم المالية بعد استكمال ما أشير إليه أعلاه.`] },
  ];
  return { title: 'تقرير لجنة المراجعة', company: i.company, sections, draft: true };
}

/* ---------- management's report on ICFR (Item 9A; COSO 2013; PCAOB AS 2201 severity) ---------- */
export type ControlFinding = { title: string; severity: 'high' | 'medium' | 'low'; kind: string; amount?: number };
export type Severity = 'material-weakness' | 'significant-deficiency' | 'deficiency';
export const SEVERITY_AR: Record<Severity, string> = { 'material-weakness': 'ضعف جوهري', 'significant-deficiency': 'قصور هام', deficiency: 'قصور' };
/** AS 2201 A7 / A11: a material weakness makes a material misstatement reasonably possible; a significant
    deficiency merits the attention of those charged with governance; the rest are deficiencies. */
export function classifyDeficiency(f: ControlFinding, m: Pick<Materiality, 'overall' | 'performance'>, uncorrectedEffect = 0): Severity {
  const amt = Math.abs(f.amount ?? 0);
  if ((f.severity === 'high' && (f.kind === 'fraud' || amt >= m.overall)) || (f.severity === 'high' && uncorrectedEffect > m.overall)) return 'material-weakness';
  if (f.severity === 'high' || (f.severity === 'medium' && amt >= m.performance)) return 'significant-deficiency';
  return 'deficiency';
}
const CONTROL_KINDS = new Set(['balance', 'classification', 'measurement', 'completeness', 'fraud', 'disclosure']);
export function icfrReport(i: { company: string; periodEnd: string; findings: ControlFinding[]; materiality: Pick<Materiality, 'overall' | 'performance'>; uncorrectedEffect?: number }) {
  const rows = i.findings.filter((f) => CONTROL_KINDS.has(f.kind)).map((f) => ({ ...f, class: classifyDeficiency(f, i.materiality, i.uncorrectedEffect ?? 0) }));
  const mw = rows.filter((r) => r.class === 'material-weakness'), sd = rows.filter((r) => r.class === 'significant-deficiency');
  const effective = mw.length === 0, co = i.company || 'المنشأة', end = i.periodEnd || '[تاريخ نهاية الفترة]';
  const sections: Section[] = [
    { title: 'مسؤولية الإدارة', paragraphs: [`إدارة ${co} مسؤولة عن وضع رقابة داخلية كافية على التقرير المالي والمحافظة عليها. وهي عملية مصممة لتوفير تأكيد معقول بشأن موثوقية التقرير المالي وإعداد القوائم المالية للأغراض الخارجية وفق الإطار المحاسبي المطبق.`] },
    { title: 'الإطار المستخدم في التقييم', paragraphs: ['قيّمت الإدارة فاعلية الرقابة الداخلية على التقرير المالي باستخدام معايير «الرقابة الداخلية — الإطار المتكامل» (2013) الصادر عن لجنة المنظمات الراعية (COSO): بيئة الرقابة، تقييم المخاطر، أنشطة الرقابة، المعلومات والاتصال، وأنشطة المتابعة.'] },
    { title: 'نتيجة التقييم', paragraphs: [effective
      ? `بناءً على هذا التقييم، خلصت الإدارة إلى أن الرقابة الداخلية على التقرير المالي كانت فعالة كما في ${end}${sd.length ? `، مع ${sd.length} قصور هام أُبلغ به المكلفون بالحوكمة وخطة لمعالجته` : ''}.`
      : `بناءً على هذا التقييم، خلصت الإدارة إلى أن الرقابة الداخلية على التقرير المالي لم تكن فعالة كما في ${end} بسبب ${mw.length} ضعف جوهري موضح أدناه.`],
      ...(rows.length ? { table: { columns: ['الملاحظة', 'التصنيف', 'الأثر'], rows: rows.map((r) => [r.title, SEVERITY_AR[r.class], r.class === 'material-weakness' ? 'احتمال معقول لعدم منع تحريف جوهري أو اكتشافه في الوقت المناسب' : r.class === 'significant-deficiency' ? 'يستحق عناية المكلفين بالحوكمة' : 'يعالج ضمن خطة التحسين']) } } : {}) },
    { title: 'القيود الملازمة', paragraphs: ['قد لا تمنع الرقابة الداخلية التحريفات أو تكتشفها بسبب قيودها الملازمة، كما أن إسقاط أي تقييم للفاعلية على فترات مستقبلية يخضع لخطر عدم كفاية الضوابط بسبب تغير الظروف أو تراجع الالتزام بالسياسات والإجراءات.'] },
    { title: 'التغيرات في الرقابة الداخلية', paragraphs: [rows.length ? 'تعمل الإدارة على معالجة الملاحظات المذكورة؛ ولم تحدث تغيرات أخرى خلال الربع الأخير أثرت جوهرياً في الرقابة الداخلية على التقرير المالي.' : 'لم تحدث تغيرات خلال الربع الأخير أثرت جوهرياً، أو يحتمل أن تؤثر جوهرياً، في الرقابة الداخلية على التقرير المالي.'] },
  ];
  return { title: 'تقرير الإدارة عن الرقابة الداخلية على التقرير المالي', effective, counts: { materialWeakness: mw.length, significant: sd.length, deficiency: rows.length - mw.length - sd.length }, rows, sections, draft: true };
}
