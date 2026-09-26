/* Key audit matters (ISA 701) — a library distilled from the key and critical audit matters of ~45 global groups
   (Aramco/PwC, Unilever/KPMG, Nestlé/EY, AstraZeneca/PwC, GSK/Deloitte, bp/Deloitte, Volkswagen, Mercedes, HSBC,
   Emirates NBD/EY, e&/EY, Home Depot/KPMG, P&G/Deloitte, Walmart/EY, Apple/EY, Amazon/EY…), rewritten for the
   entities this app audits. What those reports share, and every template here follows:
   • the matter: the amount, its share of the statements, and why it needs judgement («Description of the matter»);
   • the response: controls first, then an independent expectation, a retrospective review of last year's estimate
     against what actually happened (Unilever rebates, Novartis rebates, Berkshire claims, VW warranties), data analytics
     and cut-off around the year end (Nestlé, Deutsche Telekom, e&), specialists where needed, and the disclosures;
   • the result («Key observations», «Our results: acceptable», «did not lead to any reservations»);
   • the references to the notes.
   The suggestions rank the engine's line risks; a human chooses what goes in the report. */
import { formatMinor, type Minor } from '../reports/money-engine';
import type { FinancialStatements } from '../reports/statements-engine';

export type KamContext = { ar: string; amount: Minor; pctAssets: number; pctRevenue: number; money: (m: Minor) => string; framework: string };
export type KamTemplate = { key: string; lines: string[]; title: string; estimate: boolean; fraud?: boolean; standards: string[];
  why: (x: KamContext) => string; response: string[] };
export type Kam = { key: string; title: string; description: string; how: string; observation: string; refs: string[]; lineKeys: string[];
  amount: Minor; pctAssets: number; score: number; selected: boolean; trend: 'new' | 'same' | null; source: 'library' };
export type KamRisk = { lineKey: string; ar: string; amount: Minor; score: number; significant: boolean };

const pc = (x: number) => (Math.round(x * 10) / 10).toString();
const share = (x: KamContext) => ' (' + pc(x.pctAssets) + '% من مجموع الموجودات)';

export const KAM_LIBRARY: KamTemplate[] = [
  { key: 'revenue', lines: ['revenue'], title: 'إثبات الإيرادات والخصومات الممنوحة للعملاء', estimate: true, fraud: true, standards: ['IFRS 15', 'ISA 240'],
    why: (x) => `بلغت الإيرادات ${x.money(x.amount)}. تفترض معايير المراجعة وجود مخاطر غش في إثبات الإيراد، ويتأثر الإيراد بالخصومات والحوافز والمرتجعات التي تُقدَّر عند البيع، وبحجم كبير من العمليات الصغيرة المسجلة من نظام المبيعات، وبخطر تسجيل مبيعات في غير فترتها قرب نهاية السنة. لذلك عددنا إثبات الإيرادات من الأمور ذات الأهمية القصوى.`,
    response: ['فهمنا دورة المبيعات والتحصيل وقيّمنا تصميم الضوابط وتطبيقها، بما فيها ضوابط نظام المبيعات',
      'طابقنا إجمالي المبيعات في نظام المبيعات مع الإيرادات المسجلة في دفتر الأستاذ لكل شهر وحققنا في الفروق',
      'حللنا اتجاه الإيرادات الشهرية ونسبة الخصومات إلى المبيعات لكل عميل وصنف وحققنا في الانحرافات غير المتوقعة',
      'اختبرنا عينة من المبيعات بمطابقتها مع الفواتير وإثباتات التسليم والتحصيل',
      'اختبرنا القطع بفحص المبيعات والمرتجعات والإشعارات الدائنة قبل نهاية السنة وبعدها',
      'قارنّا مخصصات الخصومات في السنة السابقة بما دُفع فعلاً لتقييم دقة التقدير واحتمال التحيز',
      'فحصنا القيود اليدوية المسجلة على حسابات الإيرادات ذات الخصائص غير المعتادة وطلبنا مستنداتها',
      'قيّمنا كفاية الإفصاحات المتعلقة بالإيرادات'] },
  { key: 'ecl', lines: ['receivables'], title: 'الخسائر الائتمانية المتوقعة على الذمم المدينة التجارية', estimate: true, standards: ['IFRS 9', 'IFRS 7', 'ISA 540'],
    why: (x) => `بلغ صافي الذمم المدينة التجارية ${x.money(x.amount)}${share(x)}. يتطلب قياس الخسائر الائتمانية المتوقعة وفق النهج المبسط حكماً في تقسيم الذمم حسب أعمارها وتحديد معدلات الخسارة التاريخية وتعديلها بمعلومات مستقبلية، وفي تقييم العملاء المتعثرين منفردين. لذلك عددناه من الأمور ذات الأهمية القصوى.`,
    response: ['اختبرنا دقة كشف أعمار الذمم بمطابقة عينة من الأرصدة مع الفواتير وتواريخها',
      'قيّمنا منهجية مصفوفة المخصص ومعدلات الخسارة التاريخية والتعديلات المستقبلية المستخدمة',
      'قيّمنا العملاء المتعثرين والمتأخرين منفردين، وفحصنا المتحصلات اللاحقة لنهاية السنة',
      'قارنّا مخصص السنة السابقة بالديون المعدومة الفعلية خلال السنة لتقييم دقة التقدير',
      'أرسلنا مصادقات مباشرة لعينة من أرصدة العملاء وطبقنا إجراءات بديلة لما لم يرد',
      'قيّمنا إفصاحات مخاطر الائتمان'] },
  { key: 'inventory', lines: ['inventory'], title: 'وجود المخزون وتقييمه بالتكلفة أو صافي القيمة القابلة للتحقق', estimate: true, standards: ['IAS 2', 'ISA 501'],
    why: (x) => `بلغ المخزون ${x.money(x.amount)}${share(x)}. قد يكون جزء منه قابلاً للتلف أو بطيء الحركة، ويتطلب تحديد التكلفة (المتوسط المرجح) وصافي القيمة القابلة للتحقق حكماً، ويعتمد وجوده على دقة الجرد. لذلك عددناه من الأمور ذات الأهمية القصوى.`,
    response: ['حضرنا الجرد الفعلي في نهاية السنة واختبرنا عينات من السجلات إلى الموجود ومن الموجود إلى السجلات',
      'طابقنا نتائج الجرد مع السجلات واختبرنا قيود فروقات الجرد',
      'أعدنا احتساب تكلفة عينة من الأصناف بالمتوسط المرجح ومطابقتها مع فواتير الشراء',
      'قارنّا التكلفة بأسعار البيع اللاحقة لنهاية السنة لتقييم صافي القيمة القابلة للتحقق',
      'حللنا الأصناف بطيئة الحركة والقريبة من انتهاء الصلاحية وقيّمنا كفاية المخصص',
      'قارنّا مخصص السنة السابقة بالشطب الفعلي خلال السنة',
      'قيّمنا الإفصاح عن سياسة المخزون ومخصصه'] },
  { key: 'impairment', lines: ['intangibles', 'investments'], title: 'قابلية استرداد الشهرة والأصول غير الملموسة والاستثمارات', estimate: true, standards: ['IAS 36', 'IAS 38', 'ISA 540'],
    why: (x) => `بلغت القيمة الدفترية ${x.money(x.amount)}${share(x)}. يعتمد اختبار الانخفاض على تقديرات الإدارة للتدفقات النقدية المستقبلية ومعدل النمو طويل الأجل ومعدل الخصم، وتغير أي منها قد يغير النتيجة جوهرياً. لذلك عددناه من الأمور ذات الأهمية القصوى.`,
    response: ['قيّمنا تحديد الوحدات المولدة للنقد وتوزيع الشهرة عليها واختبرنا الدقة الحسابية لنموذج القيمة المستخدمة',
      'طابقنا التدفقات المتوقعة مع الموازنات المعتمدة من مجلس الإدارة',
      'قارنّا نتائج الفعلية بتوقعات الإدارة في السنوات السابقة لتقييم دقة التنبؤ',
      'قارنّا معدل الخصم ومعدل النمو طويل الأجل بمدى مستقل مستمد من بيانات السوق',
      'أعدنا تحليل الحساسية وحددنا التغير في الافتراضات الذي يلغي الفائض',
      'قيّمنا الإفصاحات المطلوبة في IAS 36 بما فيها الحساسية'] },
  { key: 'ppe', lines: ['ppe', 'rou'], title: 'القيمة الدفترية للممتلكات والمعدات وأعمارها الإنتاجية', estimate: true, standards: ['IAS 16', 'IAS 36', 'IFRS 16'],
    why: (x) => `بلغ صافي الممتلكات والمعدات ${x.money(x.amount)}${share(x)}. يتطلب تحديد الأعمار الإنتاجية وتقييم مؤشرات الانخفاض حكماً، ويؤثر ذلك مباشرة في الاستهلاك والربح. لذلك عددناه من الأمور ذات الأهمية القصوى.`,
    response: ['اختبرنا الإضافات بمطابقتها مع الفواتير والعقود وتحققنا من استيفائها شروط الرسملة',
      'أعدنا احتساب الاستهلاك وقيّمنا معقولية الأعمار الإنتاجية مقارنة بالاستخدام الفعلي',
      'قيّمنا مؤشرات الانخفاض، وعند وجودها اختبرنا تقدير القيمة القابلة للاسترداد',
      'فحصنا الاستبعادات وأرباحها وخسائرها ومطابقة السجل التفصيلي مع دفتر الأستاذ',
      'قيّمنا إفصاحات الممتلكات والمعدات'] },
  { key: 'provisions', lines: ['provisions', 'accruals'], title: 'المخصصات والالتزامات المحتملة والقضايا', estimate: true, standards: ['IAS 37', 'ISA 501'],
    why: (x) => `بلغت المخصصات والمستحقات ${x.money(x.amount)}${share(x)}. يتطلب تقدير احتمال خروج الموارد ومبلغه، وتقرير الإثبات أو الإفصاح عن التزام محتمل، حكماً مهماً من الإدارة. لذلك عددناه من الأمور ذات الأهمية القصوى.`,
    response: ['حصلنا على مصادقات مباشرة من المستشارين القانونيين عن القضايا والمطالبات القائمة',
      'قرأنا محاضر مجلس الإدارة والمراسلات مع الجهات الرقابية لتحديد أي التزامات غير مسجلة',
      'حللنا حركة المخصصات: الإضافات الجديدة والاستخدامات مقابل التسويات والمدفوعات الفعلية',
      'قارنّا تقديرات السنة السابقة بما تمت تسويته فعلاً لتقييم دقة التقدير',
      'قيّمنا إفصاحات الالتزامات المحتملة'] },
  { key: 'zakat', lines: ['zakatPayable', 'zakatExpense'], title: 'الزكاة وضريبة الدخل والربوط غير المنتهية', estimate: true, standards: ['لائحة الزكاة', 'IAS 12', 'IAS 37'],
    why: (x) => `بلغ ${x.ar} ${x.money(x.amount)}. يتطلب احتساب الوعاء الزكوي تفسير لائحة جباية الزكاة في البنود المضافة والمحسومة، وقد تبقى سنوات سابقة دون ربط نهائي من هيئة الزكاة والضريبة والجمارك بما يستلزم تقدير أي فروقات محتملة. لذلك عددناه من الأمور ذات الأهمية القصوى.`,
    response: ['أعدنا احتساب الوعاء الزكوي وفق اللائحة بمشاركة مختصين في الزكاة والضريبة',
      'طابقنا المخصص مع الإقرارات المقدمة وسداد الزكاة',
      'فحصنا مراسلات الهيئة والربوط الصادرة والاعتراضات القائمة',
      'قارنّا مخصص السنوات السابقة بالربوط النهائية لتقييم دقة التقدير',
      'قيّمنا الإفصاح عن حالة الربوط والسنوات المفتوحة'] },
  { key: 'eosb', lines: ['eosb'], title: 'التزام مكافأة نهاية الخدمة للموظفين', estimate: true, standards: ['IAS 19', 'ISA 500'],
    why: (x) => `بلغ التزام نهاية الخدمة ${x.money(x.amount)}${share(x)}. يعتمد قياسه على افتراضات اكتوارية (معدل الخصم وزيادة الرواتب ومعدل ترك الخدمة) وعلى اكتمال بيانات الموظفين. لذلك عددناه من الأمور ذات الأهمية القصوى.`,
    response: ['اختبرنا اكتمال بيانات الموظفين ودقتها بمطابقتها مع مسيرات الرواتب وعقود العمل',
      'قيّمنا كفاءة الخبير الاكتواري وموضوعيته',
      'قارنّا الافتراضات الرئيسية ببيانات السوق وبخبرة المنشأة الفعلية',
      'أعدنا احتساب الالتزام لعينة من الموظفين وفق نظام العمل',
      'قيّمنا إفصاحات منافع الموظفين والحساسية'] },
  { key: 'biological', lines: ['biological'], title: 'قياس الموجودات الحيوية بالقيمة العادلة ناقصاً تكاليف البيع', estimate: true, standards: ['IAS 41', 'IFRS 13'],
    why: (x) => `بلغت الموجودات الحيوية ${x.money(x.amount)}${share(x)}. يعتمد قياسها على أسعار السوق للأعمار والأوزان المماثلة وعلى تقدير تكاليف البيع والنفوق، ويتطلب التحقق من العدد والحالة. لذلك عددناه من الأمور ذات الأهمية القصوى.`,
    response: ['حضرنا العدّ الفعلي للقطيع وطابقنا الأعداد مع السجلات',
      'قارنّا الأسعار المستخدمة بأسعار السوق الموثقة للأعمار والأوزان المماثلة',
      'قيّمنا تقدير تكاليف البيع ومعدلات النفوق مقارنة بالخبرة الفعلية',
      'قيّمنا إفصاحات IAS 41'] },
  { key: 'loans', lines: ['loansCl', 'loansNcl'], title: 'التمويل والالتزام بتعهدات القروض وتصنيفها', estimate: false, standards: ['IFRS 9', 'IAS 1', 'ISA 570'],
    why: (x) => `بلغ التمويل ${x.money(x.amount)}${share(x)}. قد يترتب على الإخلال بتعهدات القروض استحقاقها فوراً وتغيير تصنيفها إلى متداولة، وهو ما يؤثر في تقييم الاستمرارية. لذلك عددناه من الأمور ذات الأهمية القصوى.`,
    response: ['حصلنا على مصادقات مباشرة من البنوك بالأرصدة والتسهيلات والضمانات',
      'أعدنا احتساب نسب تعهدات القروض في نهاية السنة وتحققنا من الالتزام بها',
      'قيّمنا تصنيف القروض بين المتداولة وغير المتداولة وتحليل الاستحقاقات',
      'ربطنا نتائج التمويل بتقييم الإدارة للاستمرارية',
      'قيّمنا إفصاحات القروض ومخاطر السيولة'] },
  { key: 'related', lines: ['partners'], title: 'المعاملات والأرصدة مع الأطراف ذات العلاقة', estimate: false, standards: ['IAS 24', 'نظام الشركات'],
    why: (x) => `بلغت أرصدة الشركاء والأطراف ذات العلاقة ${x.money(x.amount)}${share(x)}. هذه المعاملات قد لا تتم بشروط السوق وتتطلب اعتمادات نظامية وإفصاحاً كاملاً. لذلك عددناها من الأمور ذات الأهمية القصوى.`,
    response: ['حصلنا على قائمة الأطراف ذات العلاقة وقارنّاها بالسجلات والمحاضر لتحديد أي معاملات غير مفصح عنها',
      'حصلنا على مصادقات بالأرصدة القائمة في نهاية السنة',
      'اختبرنا عينة من المعاملات ومستنداتها واعتماداتها',
      'قيّمنا إفصاحات IAS 24'] },
];

/** Suggest key audit matters from the engine's line risks. `priorKeys` marks what is new versus last year's report. */
export function suggestKams(input: { fs: FinancialStatements; risks: KamRisk[]; materiality: Minor; framework?: string; currency?: string;
  evidence?: Record<string, 'accepted' | 'partial' | 'none'>; priorKeys?: string[]; max?: number }): Kam[] {
  const { fs, risks, materiality } = input, cur = input.currency ?? 'ر.س';
  const money = (m: Minor) => formatMinor(m, { decimals: 0 }) + ' ' + cur;
  const assets = Math.abs(fs.keys.assets.current) || 1, revenue = Math.abs(fs.keys.revenue.current) || 1;
  const out: Kam[] = [];
  for (const t of KAM_LIBRARY) {
    const rs = risks.filter((r) => t.lines.includes(r.lineKey));
    const amount = t.lines.reduce((s, k) => s + Math.abs(fs.lines.find((l) => l.key === k)?.current ?? 0), 0);
    if (!rs.length || amount === 0) continue;
    const top = rs.reduce((a, b) => (b.score > a.score ? b : a));
    const score = Math.min(100, top.score + (amount >= materiality * 3 ? 10 : 0) + (t.estimate ? 5 : 0) + (t.fraud ? 8 : 0));
    const x: KamContext = { ar: top.ar, amount, pctAssets: (amount / assets) * 100, pctRevenue: (amount / revenue) * 100, money, framework: input.framework ?? 'IFRS' };
    const ev = t.lines.map((k) => input.evidence?.[k]).find(Boolean);
    const observation = ev === 'accepted' ? 'لم تسفر إجراءاتنا عن تحفظات، وحصلنا على أدلة كافية ومناسبة تؤيد ما سجلته الإدارة.'
      : ev === 'partial' ? 'ما زالت بعض الأدلة المؤيدة قيد الاستكمال؛ تُحدَّث النتيجة قبل إصدار التقرير.'
      : 'النتيجة معلقة حتى استكمال الأدلة المطلوبة من المنشأة.';
    const notes = t.lines.map((k) => fs.lines.find((l) => l.key === k)?.note).filter((n): n is number => !!n);
    out.push({ key: t.key, title: t.title, description: t.why(x), how: 'شملت إجراءاتنا: ' + t.response.join('؛ ') + '.', observation,
      refs: [...t.standards, ...notes.map((n) => 'إيضاح ' + n)], lineKeys: t.lines, amount, pctAssets: Math.round(x.pctAssets * 10) / 10, score,
      selected: false, trend: input.priorKeys ? (input.priorKeys.includes(t.key) ? 'same' : 'new') : null, source: 'library' });
  }
  out.sort((a, b) => b.score - a.score);
  const max = input.max ?? 3;
  let n = 0;
  for (const k of out) if (n < max && (k.score >= 70 || (k.score >= 55 && k.amount >= materiality))) { k.selected = true; n++; }
  if (!n && out.length) out[0].selected = true;
  return out.slice(0, 6);
}
/** Matters reported last year and not this year («no longer included because…», AstraZeneca). */
export const removedKams = (priorKeys: string[], current: Kam[]) =>
  priorKeys.filter((k) => !current.some((c) => c.selected && c.key === k)).map((k) => KAM_LIBRARY.find((t) => t.key === k)?.title ?? k);
