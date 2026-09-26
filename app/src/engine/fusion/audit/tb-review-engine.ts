/* Trial-balance review — the deterministic reviewer that runs before (and alongside) Gemini:
     1. materiality (ISA 320) from the statements
     2. every account mapped to its statement line, its standards (with the relation text), its assertions
     3. diagnostics: balance, classification, abnormal signs, missing expected accounts, analytics (ISA 520),
        suspense accounts, going-concern indicators, fraud indicators (ISA 240)
     4. risk score per line (Moon: size ≤35 + estimate 15/4 + change ≤15 + evidence gap 25/10/0 + nature 10/4; ≥70 significant)
     5. document requests (PBC) per line and risk
     6. proposed adjusting entries that are determinable from the numbers (always balanced, validated)
     7. standards-compliance discussion per standard
   Sources: kosif-audit-pro (reviewer-board, v38-core journalRiskFlags, aggregateMisstatements), Moon
   (assessRisks, buildProcedures), SEE (classification, readiness), smart-trial-balance-review (mapping). */
import { formatMinor, type Minor } from '../reports/money-engine';
import { classifyAccount, NATURE, norm, type TbRow, type TrialBalance } from '../reports/tb-import-engine';
import { buildStatements, LINE, lineFor, type FinancialStatements } from '../reports/statements-engine';
import { beneishM } from '../reports/analysis-engine';
import { inFramework, standardsFor, STANDARD, type Framework } from './codex-engine';

export type Severity = 'high' | 'medium' | 'low';
export type Finding = { id: string; severity: Severity; kind: 'balance' | 'classification' | 'measurement' | 'disclosure' | 'completeness' | 'analytical' | 'fraud' | 'going-concern';
  code?: string; account?: string; lineKey?: string; standard: string; title: string; detail: string; basis: string; action: string; source: 'engine' | 'gemini'; round?: number;
  /** numbered evidence the council cited (audit council rounds) */ citations?: string[] };
export type DocRequest = { id: string; title: string; purpose: string; lineKey?: string; accounts: string[]; standard: string; priority: 'عالية' | 'متوسطة' | 'منخفضة'; source: 'engine' | 'gemini'; round?: number;
  /** the smart request of the audit council: the assertion it proves, the client's effort, the evidence behind it */ assertion?: string; effort?: 'low' | 'medium' | 'high'; citations?: string[] };
export type AdjLine = { code: string; name: string; debit: Minor; credit: Minor; /** for an account not yet in the trial balance */ type?: TbRow['type'] };
export type Adjustment = { id: string; title: string; reason: string; standard: string; lines: AdjLine[]; estimate: boolean; source: 'engine' | 'gemini'; round?: number };
export type Materiality = { benchmark: 'pbz' | 'revenue' | 'assets'; benchmarkAr: string; base: Minor; rate: number; overall: Minor; performance: Minor; trivial: Minor };

/* ---------- 1. materiality ---------- */
export function materiality(fs: FinancialStatements, override?: Partial<Pick<Materiality, 'overall'>> & { performanceRate?: number; trivialRate?: number }): Materiality {
  const pbz = fs.keys.pbz.current, rev = fs.keys.revenue.current, ta = fs.keys.assets.current;
  const pick = pbz > 0 && rev > 0 && pbz >= rev * 0.02 ? { benchmark: 'pbz' as const, benchmarkAr: 'الربح قبل الزكاة', base: pbz, rate: 0.05 }
    : rev > 0 ? { benchmark: 'revenue' as const, benchmarkAr: 'الإيرادات', base: rev, rate: 0.01 }
    : { benchmark: 'assets' as const, benchmarkAr: 'مجموع الموجودات', base: Math.abs(ta), rate: 0.01 };
  const overall = override?.overall && override.overall > 0 ? override.overall : Math.max(100, Math.round((pick.base * pick.rate) / 100) * 100);
  /* performance and trivial rates from the materiality plan (planMateriality): 50%–75% and up to 5% */
  const pr = Math.min(0.75, Math.max(0.5, override?.performanceRate ?? 0.75)), tr = Math.min(0.05, Math.max(0.01, override?.trivialRate ?? 0.05));
  return { ...pick, overall, performance: Math.round((overall * pr) / 100) * 100, trivial: Math.round((overall * tr) / 100) * 100 };
}

/* ---------- audit knowledge per statement line ---------- */
type LineAudit = { estimate?: boolean; fraud?: boolean; risk: string; procedures: string[]; docs: [string, string][] };
export const LINE_AUDIT: Record<string, LineAudit> = {
  cash: { fraud: true, risk: 'وجود الأرصدة وملكيتها واكتمال الحسابات البنكية', procedures: ['مصادقات بنكية مباشرة (ISA 505)', 'فحص التسويات البنكية والبنود المعلقة', 'قطع التحويلات بين الحسابات'],
    docs: [['كشوف الحسابات البنكية لشهر الإقفال وما بعده', 'إثبات الرصيد في تاريخ الإقفال'], ['التسويات البنكية في تاريخ الإقفال', 'مطابقة الدفاتر مع البنك وتحليل البنود المعلقة'], ['نموذج مصادقة بنكية موقّع', 'دليل خارجي مستقل (ISA 505)']] },
  receivables: { estimate: true, fraud: true, risk: 'الوجود والتقييم (الخسائر الائتمانية المتوقعة) والقطع', procedures: ['مصادقات العملاء لعينة', 'تحليل أعمار الديون', 'التحصيل اللاحق بعد الإقفال', 'تقييم مخصص الخسائر المتوقعة (IFRS 9)'],
    docs: [['كشف أعمار الذمم المدينة في تاريخ الإقفال', 'تقييم قابلية التحصيل والمخصص'], ['التحصيلات اللاحقة لأكبر العملاء', 'إثبات الوجود والتقييم'], ['سياسة ومصفوفة مخصص الخسائر الائتمانية', 'التحقق من IFRS 9']] },
  inventory: { estimate: true, risk: 'الوجود والتقييم بالتكلفة أو صافي القيمة القابلة للتحقق', procedures: ['حضور الجرد (ISA 501)', 'اختبار التسعير وطريقة التكلفة', 'اختبار صافي القيمة القابلة للتحقق بالمبيعات اللاحقة', 'فحص الأصناف الراكدة'],
    docs: [['قوائم الجرد الفعلي الموقعة في تاريخ الإقفال', 'إثبات الوجود والكميات'], ['تقييم المخزون بالأصناف وطريقة التكلفة', 'التحقق من IAS 2'], ['تقرير الأصناف الراكدة وبطيئة الحركة', 'تقييم الانخفاض']] },
  ppe: { estimate: true, risk: 'الوجود والملكية والاستهلاك والانخفاض', procedures: ['مطابقة سجل الأصول', 'فحص الإضافات بالمستندات', 'إعادة احتساب الاستهلاك', 'فحص الاستبعادات'],
    docs: [['سجل الأصول الثابتة التفصيلي (التكلفة، الاستهلاك، الأعمار)', 'مطابقة الأستاذ وإعادة احتساب الاستهلاك'], ['فواتير وعقود الإضافات الجوهرية', 'إثبات التكلفة والملكية'], ['صكوك واستمارات ملكية الأصول الرئيسة', 'إثبات الحقوق']] },
  rou: { estimate: true, risk: 'اكتمال عقود الإيجار وقياسها', procedures: ['حصر العقود', 'إعادة احتساب القيمة الحالية'], docs: [['عقود الإيجار السارية وجدول احتساب IFRS 16', 'التحقق من القياس والاكتمال']] },
  intangibles: { estimate: true, risk: 'شروط الرسملة والإطفاء', procedures: ['فحص الرسملة', 'إعادة احتساب الإطفاء'], docs: [['مستندات تكلفة الأصول غير الملموسة وأعمارها', 'التحقق من IAS 38']] },
  investments: { estimate: true, risk: 'التصنيف والتقييم', procedures: ['مصادقة المحافظ', 'تقييم أساس القياس'], docs: [['كشوف المحافظ أو القوائم المالية للمستثمر فيها', 'إثبات الوجود والتقييم']] },
  biological: { estimate: true, risk: 'الوجود والقيمة العادلة', procedures: ['جرد القطيع', 'تقييم أساس القيمة العادلة'], docs: [['سجل القطيع وجرده في تاريخ الإقفال', 'إثبات الوجود'], ['أساس تقدير القيمة العادلة ناقصاً تكاليف البيع', 'التحقق من IAS 41']] },
  vatAsset: { risk: 'الدقة والقابلية للاسترداد', procedures: ['مطابقة الإقرارات'], docs: [['إقرارات ضريبة القيمة المضافة للسنة وسداداتها', 'مطابقة الأرصدة مع الإقرارات']] },
  vatLiability: { risk: 'الاكتمال والدقة', procedures: ['مطابقة الإقرارات مع الإيراد'], docs: [['إقرارات ضريبة القيمة المضافة للسنة وسداداتها', 'مطابقة الأرصدة والإيراد الخاضع']] },
  prepayments: { risk: 'الوجود والقطع', procedures: ['فحص المستندات وتوزيع الفترات'], docs: [['تحليل المصروفات المقدمة والسلف والعهد', 'إثبات الوجود والفترة']] },
  capital: { risk: 'الوجود والعرض', procedures: ['مطابقة السجل التجاري وعقد التأسيس'], docs: [['السجل التجاري وعقد التأسيس وتعديلاته', 'مطابقة رأس المال والشركاء']] },
  reserves: { risk: 'سند التحويلات', procedures: ['فحص قرارات التحويل'], docs: [['قرارات الشركاء أو الجمعية بالتحويل إلى الاحتياطيات', 'سند الحركة']] },
  partners: { risk: 'الاكتمال والإفصاح (طرف ذو علاقة)', procedures: ['مصادقة الشركاء', 'فحص الحركة'], docs: [['كشف حركة جاري الشركاء ومصادقتهم عليه', 'IAS 24 والاكتمال']] },
  retained: { risk: 'مطابقة الافتتاح', procedures: ['مقارنة الافتتاح مع القوائم المراجعة السابقة (ISA 510)'], docs: [['القوائم المالية المراجعة للسنة السابقة', 'مطابقة الأرصدة الافتتاحية'], ['قرارات توزيع الأرباح', 'سند الحركة']] },
  eosb: { estimate: true, risk: 'الاكتمال والتقييم الاكتواري', procedures: ['مطابقة بيانات الموظفين', 'تقييم عمل الخبير الاكتواري'], docs: [['كشف الموظفين بالرواتب وتواريخ التعيين', 'إعادة احتساب الالتزام'], ['التقرير الاكتواري (أو احتساب الإدارة المبسط)', 'التحقق من IAS 19']] },
  leaseNcl: { estimate: true, risk: 'الاكتمال والقياس', procedures: ['إعادة احتساب الالتزام'], docs: [['عقود الإيجار وجدول الاستهلاك والفائدة', 'التحقق من IFRS 16']] },
  loansNcl: { risk: 'الاكتمال والتصنيف والتعهدات', procedures: ['مصادقة البنك', 'فحص التعهدات والتصنيف'], docs: [['عقود التمويل وجداول السداد', 'التصنيف والفائدة والتعهدات'], ['مصادقة البنك على أرصدة التمويل', 'دليل خارجي']] },
  loansCl: { risk: 'الاكتمال والتصنيف', procedures: ['مصادقة البنك'], docs: [['عقود التمويل وكشوفها في تاريخ الإقفال', 'إثبات الرصيد والشروط']] },
  zakatPayable: { estimate: true, risk: 'الاكتمال والدقة', procedures: ['إعادة احتساب الوعاء الزكوي', 'مطابقة الإقرار والربوط'], docs: [['الإقرار الزكوي وإيصال السداد وشهادة الزكاة', 'مطابقة المخصص'], ['الربوط والاعتراضات القائمة', 'تقييم الالتزامات المحتملة']] },
  contractLiab: { risk: 'القطع والاعتراف', procedures: ['فحص العقود والدفعات المقدمة'], docs: [['قائمة الدفعات المقدمة من العملاء مع العقود', 'التحقق من IFRS 15']] },
  payables: { risk: 'الاكتمال والقطع', procedures: ['مطابقة كشوف الموردين', 'البحث عن الالتزامات غير المسجلة'], docs: [['كشوف حساب أكبر الموردين في تاريخ الإقفال', 'مطابقة الأرصدة'], ['المدفوعات بعد الإقفال لأول شهرين', 'البحث عن الالتزامات غير المسجلة']] },
  accruals: { estimate: true, risk: 'الاكتمال', procedures: ['فحص المدفوعات اللاحقة'], docs: [['تحليل المصروفات المستحقة وأساس احتسابها', 'الاكتمال والقطع']] },
  provisions: { estimate: true, risk: 'الاعتراف والتقدير', procedures: ['خطابات المحامين', 'فحص الاستخدام اللاحق'], docs: [['تحليل المخصصات وحركتها وأساس تقديرها', 'التحقق من IAS 37'], ['خطاب المستشار القانوني بالقضايا القائمة', 'الالتزامات المحتملة']] },
  revenue: { fraud: true, risk: 'الحدوث والقطع (خطر غش مفترض)', procedures: ['فحص عينة فواتير وعقود', 'اختبار القطع', 'مطابقة الإيراد مع إقرارات الضريبة', 'تحليل الإيراد الشهري'],
    docs: [['تحليل الإيراد الشهري حسب النشاط أو العميل', 'الإجراءات التحليلية (ISA 520)'], ['عينة فواتير المبيعات الإلكترونية مع رموز QR', 'التحقق من الحدوث والدقة'], ['آخر وأول الفواتير حول تاريخ الإقفال', 'اختبار القطع']] },
  cogs: { risk: 'الاكتمال والتطابق مع الإيراد', procedures: ['تحليل هامش الربح', 'مطابقة حركة المخزون'], docs: [['تحليل تكلفة المبيعات وحركة المخزون', 'التحقق من IAS 2']] },
  depreciation: { estimate: true, risk: 'الدقة', procedures: ['إعادة الاحتساب'], docs: [['جدول الاستهلاك للسنة', 'إعادة الاحتساب']] },
  impairment: { estimate: true, risk: 'التقييم', procedures: ['تقييم الأساس'], docs: [['احتساب الخسائر الائتمانية أو الانخفاض', 'تقييم التقدير (ISA 540)']] },
  financeCost: { risk: 'الاكتمال والدقة', procedures: ['إعادة احتساب الفائدة'], docs: [['كشوف احتساب تكلفة التمويل', 'مطابقة مع العقود']] },
  zakatExpense: { estimate: true, risk: 'الاكتمال', procedures: ['مطابقة مع المخصص والإقرار'], docs: [['احتساب الزكاة للسنة', 'التحقق من اللائحة']] },
  selling: { risk: 'الحدوث والتصنيف', procedures: ['فحص عينة'], docs: [['تحليل مصروفات البيع والتوزيع', 'فحص الحدوث والتصنيف']] },
  admin: { risk: 'الحدوث والتصنيف', procedures: ['فحص عينة', 'الرواتب مقابل التأمينات الاجتماعية'], docs: [['مسير الرواتب ومطابقته مع التأمينات الاجتماعية (GOSI)', 'اكتمال ودقة الرواتب'], ['تحليل المصروفات العمومية والإدارية', 'فحص الحدوث']] },
  investIncome: { risk: 'الحدوث', procedures: ['مطابقة مع كشوف الاستثمار'], docs: [['إشعارات العوائد والتوزيعات', 'إثبات الحدوث']] },
  otherIncome: { risk: 'الحدوث والتصنيف', procedures: ['فحص طبيعة البنود'], docs: [['تحليل الإيرادات الأخرى ومستنداتها', 'التصنيف (IFRS 18)']] },
};
const GENERAL_DOCS: [string, string][] = [['ميزان المراجعة النهائي موقعاً من الإدارة', 'أساس القوائم وإقرار الإدارة بمسؤوليتها'], ['خطاب إقرارات الإدارة (ISA 580)', 'إقرارات مكتوبة في تاريخ التقرير']];

const ACCUM = /مجمع|متراكم|accumulated|مخصص اهلاك|مخصص استهلاك/;
/* the loss allowance is a contra-receivable: its credit balance is its nature, not a customer advance */
const ALLOWANCE = /خسائر ائتمانيه|ديون مشكوك|اضمحلال|allowance|credit loss|impairment/;
const SUSPENSE = /معلق|تحت التسويه|وسيط|حساب مؤقت|suspense|clearing/;
const RELATED = /طرف ذو علاقه|اطراف ذات علاقه|شركه شقيقه|جاري المدير|جاري الشريك|جاري الشركاء|related part/;
const SALARIES = /رواتب|اجور|salar|wages/;
/* estimates and accruals — where a round balance suggests a guess rather than a calculation */
const ROUND_PRONE = new Set(['provisions', 'accruals', 'zakatPayable', 'zakatExpense', 'eosb', 'impairment', 'depreciation', 'otherIncome', 'contractLiab']);

export type AccountReview = { code: string; name: string; type: TbRow['type']; lineKey: string | null; lineAr: string; basis: string;
  balance: Minor; natural: Minor; prior: Minor | null; change: Minor | null; changePct: number | null;
  standards: ReturnType<typeof standardsFor>; assertions: string[]; findings: string[] };
export type LineRisk = { lineKey: string; ar: string; amount: Minor; score: number; level: 'عالٍ' | 'متوسط' | 'منخفض'; significant: boolean;
  parts: { size: number; estimate: number; change: number; evidence: number; nature: number }; risk: string; procedures: string[] };
export type ComplianceItem = { code: string; title: string; status: 'ممتثل' | 'ممتثل جزئياً' | 'غير ممتثل' | 'يتطلب أدلة'; accounts: string[]; amount: Minor; findings: string[]; discussion: string; url: string | null };
export type Review = { materiality: Materiality; fs: FinancialStatements; accounts: AccountReview[]; findings: Finding[]; requests: DocRequest[];
  adjustments: Adjustment[]; risks: LineRisk[]; compliance: ComplianceItem[];
  summary: { accounts: number; flagged: number; high: number; medium: number; low: number; significantRisks: number; score: number } };

export type ReviewOptions = { framework?: Framework; currency?: string; overrides?: Record<string, string>; materiality?: number;
  /** performance and trivial rates from the materiality plan */ materialityRates?: { performanceRate?: number; trivialRate?: number };
  evidence?: Record<string, 'accepted' | 'partial' | 'none'>; extraFindings?: Finding[];
  /** the tax the entity pays when it is neither Saudi (zakat) nor Egyptian (income tax under EAS) */ tax?: 'zakat' | 'income' };

const money = (m: Minor) => formatMinor(m, { decimals: 0 }) + ' ر.س';

/** Run the whole deterministic review of a trial balance. */
export function reviewTrialBalance(tb: TrialBalance, opts: ReviewOptions = {}): Review {
  const framework = opts.framework ?? 'IFRS', egypt = framework === 'EAS', cur = opts.currency ?? (egypt ? 'ج.م' : 'ر.س');
  const money = (m: Minor) => formatMinor(m, { decimals: 0 }) + ' ' + cur;
  const fs = buildStatements(tb, opts.overrides ?? {}, { tax: opts.tax ?? (egypt ? 'income' : 'zakat') });
  const mat0 = materiality(fs, { overall: opts.materiality, ...(opts.materialityRates ?? {}) });
  /* an entity that pays income tax rather than zakat: the benchmark carries its name */
  const mat = opts.tax === 'income' && mat0.benchmark === 'pbz' ? { ...mat0, benchmarkAr: 'الربح قبل ضريبة الدخل' } : mat0;
  const findings: Finding[] = [], adjustments: Adjustment[] = [];
  let seq = 0;
  const add = (f: Omit<Finding, 'id' | 'source'>) => { const x = { ...f, id: 'F-' + String(++seq).padStart(2, '0'), source: 'engine' as const }; findings.push(x); return x; };
  const adj = (a: Omit<Adjustment, 'id' | 'source'>) => { adjustments.push({ ...a, id: 'AJE-' + String(adjustments.length + 1).padStart(2, '0'), source: 'engine' }); };
  const kv = (k: string) => fs.keys[k]?.current ?? 0;

  /* accounts */
  const accounts: AccountReview[] = tb.rows.map((r) => {
    const { key, basis } = lineFor(r, opts.overrides ?? {}); const d = key ? LINE[key] : null;
    const natural = NATURE[r.type] === 'debit' ? r.balance : -r.balance;
    const priorNat = r.prior === null ? null : NATURE[r.type] === 'debit' ? r.prior : -r.prior;
    const change = priorNat === null ? null : natural - priorNat;
    return { code: r.code, name: r.name, type: r.type, lineKey: key, lineAr: d?.ar ?? 'غير مبوّب', basis, balance: r.balance, natural, prior: priorNat, change,
      changePct: change === null || !priorNat ? null : Math.round((change / Math.abs(priorNat)) * 1000) / 10,
      standards: standardsFor(d ? [...d.standards, ...(LINE_AUDIT[key!]?.fraud ? ['ISA 240'] : [])] : ['IAS 1'], key, framework), assertions: d?.assertions ?? [], findings: [] };
  });
  const acc = (code: string) => accounts.find((a) => a.code === code);
  const tag = (f: Finding) => { if (f.code) acc(f.code)?.findings.push(f.id); return f; };

  /* balance of the trial balance */
  if (!tb.balanced) {
    const diff = tb.difference, ad = Math.abs(diff);
    const omitted = tb.rows.find((r) => Math.abs(r.balance) === ad), wrongSide = tb.rows.find((r) => Math.abs(r.balance) * 2 === ad);
    const hint = omitted ? `الفرق يساوي رصيد الحساب ${omitted.code} ${omitted.name} — احتمال حذف أو تكرار.` : wrongSide ? `الفرق ضعف رصيد الحساب ${wrongSide.code} ${wrongSide.name} — احتمال ترحيله في الجانب الخطأ.`
      : ad % 900 === 0 ? 'الفرق يقبل القسمة على 9 — احتمال قلب أرقام (Transposition).' : 'افحص الترحيل والإقفال.';
    add({ severity: 'high', kind: 'balance', standard: 'ISA 500', title: 'ميزان المراجعة غير متوازن', detail: hint, basis: `مدين ${money(tb.totals.debit)} − دائن ${money(tb.totals.credit)} = ${money(diff)}`, action: 'تصحيح الفرق قبل أي تحليل؛ لا تصدر قوائم من ميزان غير متوازن.' });
  }
  if (tb.hasPrior && tb.priorDifference) add({ severity: 'medium', kind: 'balance', standard: 'ISA 510', title: 'أرصدة السنة السابقة غير متوازنة', detail: 'عمود المقارنة لا يتوازن فتتأثر المقارنات وقائمة التدفقات.', basis: `الفرق ${money(tb.priorDifference)}`, action: 'مطابقة المقارنة مع القوائم المراجعة للسنة السابقة.' });
  for (const e of tb.errors) add({ severity: e.code === 'DUPLICATE_ACCOUNT' ? 'medium' : 'high', kind: 'balance', standard: 'ISA 500', title: e.code === 'DUPLICATE_ACCOUNT' ? 'حساب مكرر في الميزان' : 'مبلغ غير صالح', detail: e.message, basis: 'السطر ' + e.line, action: 'تصحيح الملف المصدر وإعادة الاستيراد.' });

  /* classification */
  for (const a of accounts) {
    const n = norm(a.name), big = Math.abs(a.balance) >= mat.trivial;
    if (a.type === 'suspense' || !a.lineKey) tag(add({ severity: big ? 'medium' : 'low', kind: 'classification', code: a.code, account: a.name, standard: 'IAS 1', title: 'حساب غير مبوّب', detail: 'تعذر تحديد طبيعة الحساب من رقمه أو اسمه.', basis: 'الرصيد ' + money(a.balance), action: 'حدد نوع الحساب وبنده في القوائم يدوياً.' }));
    if (SUSPENSE.test(n) && a.balance !== 0) tag(add({ severity: Math.abs(a.balance) >= mat.performance ? 'high' : 'medium', kind: 'completeness', code: a.code, account: a.name, standard: 'IAS 1', title: 'حساب معلق/وسيط برصيد قائم', detail: 'الحسابات الوسيطة يجب أن تُصفّى قبل الإقفال وتوزع على بنودها.', basis: 'الرصيد ' + money(a.balance), action: 'طلب تحليل الحساب وتصفيته بقيود تسوية.' }));
    /* abnormal sign in the natural direction */
    if (a.natural < 0 && big) {
      const accum = a.lineKey === 'ppe' && ACCUM.test(n);
      if (accum) continue;
      if (a.lineKey === 'receivables' && ALLOWANCE.test(n)) continue;
      if (a.lineKey === 'cash') {
        tag(add({ severity: 'high', kind: 'classification', code: a.code, account: a.name, lineKey: 'cash', standard: 'IAS 7', title: 'رصيد بنكي دائن (سحب على المكشوف)', detail: 'الرصيد الدائن التزام تمويلي لا يُطرح من النقد إلا إذا كان جزءاً من إدارة النقد اليومية وتتقلب أرصدته.', basis: 'الرصيد ' + money(a.balance), action: 'إعادة التبويب إلى القروض قصيرة الأجل.' }));
        adj({ title: 'إعادة تبويب السحب على المكشوف', reason: `رصيد ${a.name} دائن ${money(-a.natural)}`, standard: 'IAS 7 / IAS 32', estimate: false,
          lines: [{ code: a.code, name: a.name, debit: -a.natural, credit: 0 }, { code: 'RCL-OD', name: 'سحب على المكشوف — قروض قصيرة الأجل', debit: 0, credit: -a.natural, type: 'liability' }] });
      } else if (a.lineKey === 'receivables') {
        tag(add({ severity: 'medium', kind: 'classification', code: a.code, account: a.name, lineKey: 'receivables', standard: 'IFRS 15', title: 'ذمم مدينة برصيد دائن', detail: 'الرصيد الدائن لعميل هو دفعة مقدمة (مطلوبات عقد) ولا يُطرح من الذمم.', basis: 'الرصيد ' + money(a.balance), action: 'إعادة التبويب إلى مطلوبات العقود.' }));
        adj({ title: 'إعادة تبويب الأرصدة الدائنة للعملاء', reason: `رصيد ${a.name} دائن ${money(-a.natural)}`, standard: 'IFRS 15', estimate: false,
          lines: [{ code: a.code, name: a.name, debit: -a.natural, credit: 0 }, { code: 'RCL-CL', name: 'التزامات عقود (دفعات مقدمة من عملاء)', debit: 0, credit: -a.natural, type: 'liability' }] });
      } else if (a.lineKey === 'payables') {
        tag(add({ severity: 'medium', kind: 'classification', code: a.code, account: a.name, lineKey: 'payables', standard: 'IAS 1', title: 'ذمم دائنة برصيد مدين', detail: 'الرصيد المدين لمورد دفعة مقدمة تعرض ضمن الموجودات المتداولة.', basis: 'الرصيد ' + money(a.balance), action: 'إعادة التبويب إلى الدفعات المقدمة للموردين.' }));
        adj({ title: 'إعادة تبويب الأرصدة المدينة للموردين', reason: `رصيد ${a.name} مدين ${money(-a.natural)}`, standard: 'IAS 1', estimate: false,
          lines: [{ code: 'RCL-SA', name: 'دفعات مقدمة للموردين', debit: -a.natural, credit: 0, type: 'asset' }, { code: a.code, name: a.name, debit: 0, credit: -a.natural }] });
      } else if (a.type === 'revenue') tag(add({ severity: 'high', kind: 'measurement', code: a.code, account: a.name, lineKey: a.lineKey ?? undefined, standard: 'IFRS 15', title: 'حساب إيراد برصيد مدين', detail: 'رصيد مدين في حساب إيراد يدل على مردودات أو قيود عكسية غير مصنفة أو خطأ ترحيل.', basis: 'الرصيد ' + money(a.balance), action: 'تحليل الحركة وتبويب المردودات والخصومات.' }));
      else if (a.type === 'expense') tag(add({ severity: 'medium', kind: 'measurement', code: a.code, account: a.name, lineKey: a.lineKey ?? undefined, standard: 'IAS 1', title: 'حساب مصروف برصيد دائن', detail: 'رصيد دائن في مصروف قد يكون عكس استحقاق أو إيراداً مبوباً خطأ.', basis: 'الرصيد ' + money(a.balance), action: 'تحليل الحركة وإعادة التبويب.' }));
      else if (a.type === 'asset') tag(add({ severity: 'medium', kind: 'classification', code: a.code, account: a.name, lineKey: a.lineKey ?? undefined, standard: 'IAS 1', title: 'أصل برصيد دائن', detail: 'رصيد عكس طبيعة الحساب.', basis: 'الرصيد ' + money(a.balance), action: 'تحليل الحساب وتبويبه.' }));
      else if (a.type === 'liability') tag(add({ severity: 'medium', kind: 'classification', code: a.code, account: a.name, lineKey: a.lineKey ?? undefined, standard: 'IAS 1', title: 'التزام برصيد مدين', detail: 'رصيد عكس طبيعة الحساب.', basis: 'الرصيد ' + money(a.balance), action: 'تحليل الحساب وتبويبه.' }));
    }
    if (a.lineKey === 'ppe' && ACCUM.test(n) && a.balance > 0 && big) tag(add({ severity: 'high', kind: 'measurement', code: a.code, account: a.name, lineKey: 'ppe', standard: 'IAS 16', title: 'مجمع استهلاك برصيد مدين', detail: 'مجمع الاستهلاك رصيده دائن بطبيعته.', basis: 'الرصيد ' + money(a.balance), action: 'مراجعة قيود الاستبعاد والاستهلاك.' }));
    if (RELATED.test(n) && a.balance !== 0) tag(add({ severity: 'low', kind: 'disclosure', code: a.code, account: a.name, lineKey: a.lineKey ?? undefined, standard: 'IAS 24', title: 'رصيد مع طرف ذي علاقة', detail: 'يتطلب إفصاحاً عن طبيعة العلاقة والمعاملات والأرصدة وشروطها.', basis: 'الرصيد ' + money(a.balance), action: 'الحصول على قائمة الأطراف ذات العلاقة ومصادقة الرصيد (ISA 550).' }));
    if (Math.abs(a.balance) >= Math.max(mat.performance, 1000000) && Math.abs(a.balance) % 1000000 === 0 && a.lineKey && ROUND_PRONE.has(a.lineKey))
      tag(add({ severity: 'low', kind: 'fraud', code: a.code, account: a.name, lineKey: a.lineKey, standard: 'ISA 240', title: 'تقدير برصيد مقرّب', detail: 'رصيد تقديري أو استحقاق بمضاعفات عشرة آلاف قد يدل على تقدير غير محسوب أو قيد يدوي.', basis: 'الرصيد ' + money(a.balance), action: 'طلب المستند المؤيد وتحليل القيود اليدوية.' }));
  }

  /* missing expected accounts */
  const pbz = kv('pbz'), zakatExp = kv('zakat'), zakatPay = fs.lines.find((l) => l.key === 'zakatPayable')?.current ?? 0;
  if (egypt && pbz > 0 && zakatExp === 0) {
    const est = Math.round((pbz * 0.225) / 100) * 100;
    add({ severity: est >= mat.trivial ? 'high' : 'medium', kind: 'completeness', lineKey: 'zakatExpense', standard: 'EAS 24', title: 'لا يوجد مصروف ضريبة دخل رغم تحقق ربح', detail: 'ضريبة الدخل الجارية التزام عن السنة (قانون 91 لسنة 2005، 22.5%). التقدير الأولي على الربح المحاسبي قبل الضريبة؛ الاحتساب النهائي من الإقرار بعد تسوية الربح الضريبي والضريبة المؤجلة.', basis: `الربح قبل الضريبة ${money(pbz)} × 22.5% = ${money(est)}`, action: 'قيد ضريبة الدخل المستحقة وطلب الإقرار الضريبي وتسوية الربح الضريبي.' });
    if (est > 0) adj({ title: 'استحقاق ضريبة الدخل عن السنة (تقديري)', reason: 'لا يوجد مصروف ضريبة دخل في الميزان', standard: 'EAS 24', estimate: true,
      lines: [{ code: 'ADJ-TE', name: 'مصروف ضريبة الدخل', debit: est, credit: 0, type: 'expense' }, { code: 'ADJ-TP', name: 'ضريبة الدخل المستحقة', debit: 0, credit: est, type: 'liability' }] });
  } else if (egypt && zakatExp > 0 && zakatPay === 0) add({ severity: 'low', kind: 'completeness', lineKey: 'zakatPayable', standard: 'ضريبة الدخل (مصر)', title: 'مصروف ضريبة دخل دون التزام قائم', detail: 'إن سُددت الضريبة أو خُصمت تحت الحساب فيلزم الدليل، وإلا فيلزم قيد الالتزام.', basis: 'مصروف الضريبة ' + money(zakatExp), action: 'طلب الإقرار وإيصالات السداد ونماذج الخصم تحت الحساب.' });
  else if (pbz > 0 && zakatExp === 0) {
    const sources = kv('equity') + kv('ncl'), deductions = kv('nca'), base = Math.max(sources - deductions, pbz), est = Math.round((base * 0.025) / 100) * 100;
    add({ severity: est >= mat.trivial ? 'high' : 'medium', kind: 'completeness', lineKey: 'zakatExpense', standard: 'لائحة الزكاة', title: 'لا يوجد مصروف زكاة رغم تحقق ربح', detail: 'الزكاة التزام عن السنة يجب قيده. التقدير الأولي على وعاء مبسط (حقوق الملكية + الالتزامات غير المتداولة − الموجودات غير المتداولة، وبحد أدنى الربح قبل الزكاة) بسعر 2.5%؛ الاحتساب النهائي من الإقرار مع مراعاة حدي الوعاء في اللائحة.', basis: `وعاء تقديري ${money(base)} × 2.5% = ${money(est)}`, action: 'قيد مخصص الزكاة وطلب الإقرار الزكوي.' });
    if (est > 0) adj({ title: 'استحقاق زكاة السنة (تقديري)', reason: 'لا يوجد مصروف زكاة في الميزان', standard: 'لائحة الزكاة / IAS 37', estimate: true,
      lines: [{ code: 'ADJ-ZE', name: 'مصروف الزكاة', debit: est, credit: 0, type: 'expense' }, { code: 'ADJ-ZP', name: 'مخصص الزكاة المستحقة', debit: 0, credit: est, type: 'liability' }] });
  } else if (zakatExp > 0 && zakatPay === 0) add({ severity: 'low', kind: 'completeness', lineKey: 'zakatPayable', standard: 'لائحة الزكاة', title: 'مصروف زكاة دون مخصص قائم', detail: 'إن سُددت الزكاة قبل الإقفال فيلزم إيصال السداد، وإلا فيلزم قيد المخصص.', basis: 'مصروف الزكاة ' + money(zakatExp), action: 'طلب إيصال السداد أو قيد المخصص.' });
  const ppeNet = kv('ppe');
  if (ppeNet > 0 && kv('depreciation') === 0) add({ severity: ppeNet >= mat.overall ? 'high' : 'medium', kind: 'completeness', lineKey: 'ppe', standard: 'IAS 16', title: 'أصول ثابتة دون مصروف استهلاك', detail: 'يجب استهلاك الأصول على أعمارها الإنتاجية؛ غياب المصروف يضخم الربح والأصول.', basis: 'صافي الأصول الثابتة ' + money(ppeNet), action: 'طلب سجل الأصول واحتساب استهلاك السنة ثم قيده.' });
  if (ppeNet < 0) add({ severity: 'high', kind: 'measurement', lineKey: 'ppe', standard: 'IAS 16', title: 'مجمع الاستهلاك يتجاوز التكلفة', detail: 'صافي القيمة الدفترية سالب.', basis: 'الصافي ' + money(ppeNet), action: 'مراجعة سجل الأصول والاستبعادات.' });
  const salaries = accounts.filter((a) => a.type === 'expense' && SALARIES.test(norm(a.name))).reduce((s, a) => s + a.natural, 0);
  if (!egypt && salaries > 0 && !fs.lines.some((l) => l.key === 'eosb' && l.current !== 0)) add({ severity: salaries >= mat.overall ? 'high' : 'medium', kind: 'completeness', lineKey: 'eosb', standard: 'IAS 19', title: 'رواتب دون التزام مكافأة نهاية الخدمة', detail: 'نظام العمل يوجب مكافأة نهاية الخدمة؛ الالتزام يقاس وفق IAS 19 (أو بالتبسيط المسموح في معيار المنشآت الصغيرة).', basis: 'الرواتب ' + money(salaries), action: 'طلب كشف الموظفين واحتساب الالتزام.' });
  const loans = kv('loansCl') + kv('loansNcl');
  if (loans > 0 && kv('finance') === 0) add({ severity: 'medium', kind: 'completeness', lineKey: 'loansNcl', standard: 'IFRS 9', title: 'قروض دون تكلفة تمويل', detail: 'إما أن التمويل بلا تكلفة (يلزم دليل)، أو رُسملت (IAS 23)، أو لم تُقيد.', basis: 'القروض ' + money(loans), action: 'طلب عقود التمويل وكشوف احتساب الفائدة.' });
  const rec = kv('receivables');
  if (rec >= mat.performance && !fs.lines.some((l) => l.key === 'impairment' && l.current !== 0) && !accounts.some((a) => a.lineKey === 'receivables' && /خسائر|مخصص|مشكوك/.test(norm(a.name))))
    add({ severity: 'medium', kind: 'measurement', lineKey: 'receivables', standard: 'IFRS 9', title: 'ذمم مدينة دون مخصص خسائر ائتمانية متوقعة', detail: 'المعيار يوجب تقدير الخسائر الائتمانية المتوقعة ولو كانت صغيرة.', basis: 'الذمم ' + money(rec), action: 'طلب أعمار الديون ومصفوفة المخصص.' });
  if (kv('inventory') > 0 && kv('cogs') === 0) add({ severity: 'medium', kind: 'completeness', lineKey: 'cogs', standard: 'IAS 2', title: 'مخزون دون تكلفة مبيعات', detail: 'وجود مخزون ومبيعات دون تكلفة مبيعات يدل على جرد دوري لم يُقفل.', basis: 'المخزون ' + money(kv('inventory')), action: 'طلب حركة المخزون وقيد تكلفة المبيعات.' });
  const vatA = fs.lines.find((l) => l.key === 'vatAsset')?.current ?? 0, vatL = fs.lines.find((l) => l.key === 'vatLiability')?.current ?? 0;
  if (kv('revenue') > 0 && vatA === 0 && vatL === 0) add({ severity: 'low', kind: 'completeness', lineKey: 'revenue', standard: 'ZATCA VAT', title: 'لا توجد أرصدة ضريبة قيمة مضافة', detail: 'منشأة ذات إيراد دون أرصدة ضريبة؛ تحقق من التسجيل والإقرارات أو من إقفال الأرصدة.', basis: 'الإيراد ' + money(kv('revenue')), action: 'طلب شهادة التسجيل والإقرارات.' });
  if (vatA > 0 && vatL > 0) {
    const off = Math.min(vatA, vatL);
    add({ severity: 'low', kind: 'classification', lineKey: 'vatLiability', standard: 'IAS 32', title: 'ضريبة مدخلات ومخرجات قائمتان معاً', detail: 'تُعرض بالصافي لأنها تُسوّى في إقرار واحد مع الهيئة.', basis: `مدخلات ${money(vatA)} · مخرجات ${money(vatL)}`, action: 'مقاصة الرصيدين حتى الأقل منهما.' });
    const aIn = accounts.find((a) => a.lineKey === 'vatAsset' && a.natural > 0), aOut = accounts.find((a) => a.lineKey === 'vatLiability' && a.natural > 0);
    if (aIn && aOut) adj({ title: 'مقاصة ضريبة القيمة المضافة', reason: 'تسوية في إقرار واحد', standard: 'IAS 32', estimate: false,
      lines: [{ code: aOut.code, name: aOut.name, debit: Math.min(off, aOut.natural), credit: 0 }, { code: aIn.code, name: aIn.name, debit: 0, credit: Math.min(off, aOut.natural) }] });
  }

  /* analytics (ISA 520) */
  if (fs.hasPrior) {
    /* an expectation per line (ISA 520): activity-driven lines move with revenue, the rest stay flat;
       only a deviation from the expectation beyond performance materiality and 20% is a finding */
    const rev0 = fs.keys.revenue.prior ?? 0, g = rev0 > 0 ? kv('revenue') / rev0 - 1 : 0;
    const ACTIVITY = new Set(['cogs', 'selling', 'admin', 'depreciation', 'receivables', 'inventory', 'payables', 'accruals', 'vatAsset', 'vatLiability', 'contractLiab', 'otherIncome']);
    const SKIP = new Set(['revenue', 'retained', 'cash', 'zakatExpense', 'zakatPayable']);
    for (const l of fs.lines) {
      if (l.prior === null || SKIP.has(l.key)) continue;
      const expected = ACTIVITY.has(l.key) ? Math.round(l.prior * (1 + g)) : l.prior, dev = l.current - expected;
      const rel = expected ? Math.abs(dev / expected) : l.current ? 1 : 0;
      if (Math.abs(dev) >= mat.performance && rel >= 0.2)
        add({ severity: Math.abs(dev) >= mat.overall * 2 ? 'medium' : 'low', kind: 'analytical', lineKey: l.key, standard: 'ISA 520', title: `تغير غير متوقع في ${l.ar}`,
          detail: ACTIVITY.has(l.key) ? `المتوقع أن يتحرك البند مع نمو الإيرادات (${Math.round(g * 1000) / 10}%)؛ الفرق عن التوقع يتطلب تفسيراً مؤيداً بأدلة.` : 'المتوقع ثبات البند ما لم تقع معاملات جوهرية؛ الحركة تتطلب تفسيراً ومستندات.',
          basis: `السابق ${money(l.prior)} · المتوقع ${money(expected)} · الفعلي ${money(l.current)} (فرق ${money(dev)})`, action: 'الحصول على تفسير الإدارة وتأييده بالمستندات.' });
    }
    const gm = (c: boolean) => { const r = c ? kv('revenue') : fs.keys.revenue.prior ?? 0, g = c ? kv('gross') : fs.keys.gross.prior ?? 0; return r ? (g / r) * 100 : null; };
    const g1 = gm(true), g0 = gm(false);
    if (g1 !== null && g0 !== null && Math.abs(g1 - g0) >= 5) add({ severity: 'medium', kind: 'analytical', lineKey: 'cogs', standard: 'ISA 520', title: 'تغير هامش مجمل الربح', detail: 'تغير الهامش بخمس نقاط فأكثر قد يدل على أخطاء قطع أو تقييم مخزون أو تسعير.', basis: `${Math.round(g0 * 10) / 10}% ← ${Math.round(g1 * 10) / 10}%`, action: 'تحليل الهامش شهرياً وفحص القطع وتقييم المخزون.' });
    const b = beneishM(fs);
    if (b?.flagged) add({ severity: 'medium', kind: 'fraud', lineKey: 'revenue', standard: 'ISA 240', title: 'مؤشر Beneish يتجاوز الحد', detail: 'نمط المؤشرات يشبه الشركات التي تلاعبت بأرباحها؛ ليس دليلاً بذاته.', basis: 'M = ' + b.m + ' > −1.78', action: 'توسيع فحص الإيراد والذمم والاستحقاقات وقيود اليومية.' });
    if (fs.checks.cashTies === false) add({ severity: 'low', kind: 'classification', standard: 'IAS 7', title: 'قائمة التدفقات لا تطابق حركة النقد', detail: 'بعض الحسابات غير مبوبة أو مبوبة في بند غير مناسب.', basis: 'الفرق ' + money(fs.checks.cfDifference ?? 0), action: 'مراجعة تبويب الحسابات.' });
  }
  /* going concern indicators (ISA 570) */
  if (kv('equity') < 0) add({ severity: 'high', kind: 'going-concern', standard: 'ISA 570', title: 'حقوق ملكية سالبة', detail: 'مؤشر جوهري على عدم التأكد بشأن الاستمرارية؛ قد تنطبق أحكام نظام الشركات عند بلوغ الخسائر نصف رأس المال.', basis: 'حقوق الملكية ' + money(kv('equity')), action: 'تقييم خطط الإدارة والدعم المالي والإفصاح.' });
  else if (kv('cl') > 0 && kv('ca') < kv('cl')) add({ severity: 'medium', kind: 'going-concern', standard: 'ISA 570', title: 'المطلوبات المتداولة تتجاوز الموجودات المتداولة', detail: 'عجز رأس المال العامل مؤشر على مخاطر السيولة.', basis: `${money(kv('ca'))} مقابل ${money(kv('cl'))}`, action: 'الحصول على التدفقات النقدية المتوقعة لـ12 شهراً.' });

  if (egypt) { for (const f of findings) f.standard = inFramework(f.standard, framework); for (const a of adjustments) a.standard = a.standard.split(' / ').map((x) => inFramework(x, framework)).join(' / '); }
  for (const f of opts.extraFindings ?? []) { findings.push(f); if (f.code) acc(f.code)?.findings.push(f.id); }

  /* risk per line */
  const risks: LineRisk[] = fs.lines.filter((l) => l.current !== 0 || (l.prior ?? 0) !== 0).map((l) => {
    const la = LINE_AUDIT[l.key] ?? { risk: 'التحقق من الرصيد', procedures: ['فحص عينة'], docs: [] };
    const amount = l.current, size = Math.min(35, Math.round((35 * Math.abs(amount)) / Math.max(1, mat.overall * 3)));
    const pc = l.prior ? Math.abs((l.current - l.prior) / l.prior) * 100 : null;
    const ev = opts.evidence?.[l.key] ?? 'none';
    const parts = { size, estimate: la.estimate ? 15 : 4, change: pc === null ? 8 : Math.min(15, Math.round(pc / 4)), evidence: ev === 'accepted' ? 0 : ev === 'partial' ? 10 : 25, nature: la.fraud ? 10 : 4 };
    const hits = findings.filter((f) => f.lineKey === l.key || (f.code && l.accounts.some((a) => a.code === f.code)));
    const bump = hits.some((f) => f.severity === 'high') ? 10 : hits.some((f) => f.severity === 'medium') ? 5 : 0;
    const score = Math.min(100, parts.size + parts.estimate + parts.change + parts.evidence + parts.nature + bump);
    const level: LineRisk['level'] = score >= 70 ? 'عالٍ' : score >= 45 ? 'متوسط' : 'منخفض';
    /* ISA 315.12(l): a significant risk sits at the upper end of the inherent-risk spectrum — size and missing evidence alone
       do not make one; it needs a qualitative factor (estimation uncertainty, fraud, an engine finding, or an unusual movement) */
    const qualitative = !!la.estimate || !!la.fraud || bump > 0 || (pc !== null && pc >= 25);
    /* significance is inherent (ISA 315.12(l), 701): assessed before evidence — evidence lowers the residual score and
       answers the risk, it does not make a KAM or a significant risk disappear */
    const inherent = Math.min(100, parts.size + parts.estimate + parts.change + 25 + parts.nature + bump);
    return { lineKey: l.key, ar: l.ar, amount, score, level, significant: inherent >= 70 && qualitative, parts, risk: la.risk, procedures: la.procedures };
  }).sort((a, b) => b.score - a.score);

  /* document requests */
  const requests: DocRequest[] = GENERAL_DOCS.map(([title, purpose], i) => ({ id: 'PBC-G' + (i + 1), title, purpose, accounts: [], standard: 'ISA 580', priority: 'عالية' as const, source: 'engine' as const }));
  if (fs.hasPrior) requests.push({ id: 'PBC-G3', title: 'القوائم المالية المراجعة للسنة السابقة', purpose: 'مطابقة الأرصدة الافتتاحية والمقارنة', accounts: [], standard: 'ISA 510', priority: 'عالية', source: 'engine' });
  for (const r of risks) {
    if (r.level === 'منخفض' && Math.abs(r.amount) < mat.performance) continue;
    const la = LINE_AUDIT[r.lineKey]; if (!la) continue;
    const accs = fs.lines.find((l) => l.key === r.lineKey)!.accounts.map((a) => a.code);
    la.docs.forEach(([title, purpose], i) => { if (requests.some((q) => q.title === title)) return;
      requests.push({ id: 'PBC-' + r.lineKey + '-' + (i + 1), title, purpose, lineKey: r.lineKey, accounts: accs, standard: inFramework(LINE[r.lineKey]?.standards[0] ?? 'ISA 500', framework), priority: r.level === 'عالٍ' ? 'عالية' : r.level === 'متوسط' ? 'متوسطة' : 'منخفضة', source: 'engine' }); });
  }

  const compliance = complianceOf(fs, findings, requests, opts.evidence ?? {}, framework, cur);
  const high = findings.filter((f) => f.severity === 'high').length, medium = findings.filter((f) => f.severity === 'medium').length, low = findings.length - high - medium;
  const score = Math.min(100, Math.round(risks.slice(0, 5).reduce((s, r) => s + r.score, 0) / Math.max(1, Math.min(5, risks.length)) * 0.7 + Math.min(30, high * 10 + medium * 3)));
  return { materiality: mat, fs, accounts, findings, requests, adjustments, risks, compliance,
    summary: { accounts: accounts.length, flagged: accounts.filter((a) => a.findings.length).length, high, medium, low, significantRisks: risks.filter((r) => r.significant).length, score } };
}

/* ---------- 7. standards compliance discussion ---------- */
export function complianceOf(fs: FinancialStatements, findings: Finding[], requests: DocRequest[], evidence: Record<string, string> = {}, framework: Framework = 'IFRS', cur = 'ر.س'): ComplianceItem[] {
  const F = (c: string) => inFramework(c, framework);
  const by = new Map<string, { accounts: Set<string>; amount: Minor; lines: Set<string> }>();
  const touch = (code: string, line?: { key: string; current: Minor; accounts: { code: string; name: string }[] }) => {
    if (!by.has(code)) by.set(code, { accounts: new Set(), amount: 0, lines: new Set() });
    const x = by.get(code)!; if (line) { x.lines.add(line.key); x.amount += Math.abs(line.current); line.accounts.forEach((a) => x.accounts.add(a.code + ' ' + a.name)); }
  };
  for (const l of fs.lines) for (const s0 of l.standards) { const s = F(s0); if (STANDARD[s] && STANDARD[s].family !== 'ISA') touch(s, l); }
  (framework === 'EAS' ? ['EAS 1', 'EAS 4', 'EAS 5', 'EAS 7'] : ['IAS 1', 'IFRS 18', 'IAS 7', 'IAS 8', 'IAS 10']).forEach((s) => touch(s));
  for (const f of findings) if (STANDARD[f.standard] && STANDARD[f.standard].family !== 'ISA') touch(f.standard);
  const out: ComplianceItem[] = [];
  for (const [code, x] of by) {
    const s = STANDARD[code], fx = findings.filter((f) => f.standard === code || f.standard.startsWith(code + ' ') || (f.lineKey && x.lines.has(f.lineKey) && F(LINE[f.lineKey]?.standards[0] ?? '') === code));
    const open = requests.filter((r) => (r.lineKey && x.lines.has(r.lineKey)) || r.standard === code).filter((r) => !r.lineKey || evidence[r.lineKey] !== 'accepted');
    const status: ComplianceItem['status'] = fx.some((f) => f.severity === 'high') ? 'غير ممتثل' : fx.some((f) => f.severity === 'medium') ? 'ممتثل جزئياً' : open.length ? 'يتطلب أدلة' : 'ممتثل';
    const parts = [
      x.accounts.size ? `يحكم ${x.accounts.size} حساباً بمجموع ${formatMinor(x.amount, { decimals: 0 })} ${cur}.` : 'متطلب عرض وإفصاح عام على مستوى القوائم.',
      s ? s.purpose : '',
      fx.length ? 'الملاحظات: ' + fx.map((f) => f.title + ' (' + f.basis + ')').join('؛ ') + '.' : 'لم تظهر ملاحظات من تحليل الأرقام.',
      open.length ? 'بانتظار أدلة: ' + open.slice(0, 4).map((r) => r.title).join('، ') + (open.length > 4 ? ' وغيرها' : '') + '.' : '',
      s?.status === 'upcoming' ? 'تنبيه تطبيق: ' + s.latest + '.' : '',
    ].filter(Boolean);
    out.push({ code, title: s?.titleAr ?? code, status, accounts: [...x.accounts], amount: x.amount, findings: fx.map((f) => f.id), discussion: parts.join(' '), url: s?.url ?? null });
  }
  const rank = { 'غير ممتثل': 0, 'ممتثل جزئياً': 1, 'يتطلب أدلة': 2, 'ممتثل': 3 };
  return out.sort((a, b) => rank[a.status] - rank[b.status] || b.amount - a.amount);
}

/* ---------- adjusting entries ---------- */
export function validateAdjustment(a: Adjustment, tb: TrialBalance) {
  const debit = a.lines.reduce((s, l) => s + l.debit, 0), credit = a.lines.reduce((s, l) => s + l.credit, 0);
  const codes = new Set(tb.rows.map((r) => r.code));
  const unknown = a.lines.filter((l) => !codes.has(l.code)).map((l) => l.code + ' ' + l.name);
  const bad = a.lines.filter((l) => l.debit < 0 || l.credit < 0 || (l.debit > 0 && l.credit > 0) || !Number.isSafeInteger(l.debit) || !Number.isSafeInteger(l.credit));
  return { balanced: debit === credit && debit > 0, debit, credit, difference: debit - credit, newAccounts: unknown, valid: debit === credit && debit > 0 && !bad.length && a.lines.length >= 2, problems: bad.length ? ['مبالغ غير صالحة في ' + bad.length + ' سطر'] : [] };
}

/** The trial balance after the accepted adjustments (new accounts are appended and classified by name). */
export function applyAdjustments(tb: TrialBalance, adjs: Adjustment[]): TrialBalance {
  const rows = tb.rows.map((r) => ({ ...r }));
  let line = rows.length;
  for (const a of adjs) {
    if (!validateAdjustment(a, tb).valid) continue;
    for (const l of a.lines) {
      let r = rows.find((x) => x.code === l.code);
      if (!r) { const c = l.type ? { type: l.type, basis: 'manual' as const } : classifyAccount(/^\d/.test(l.code) ? l.code : '', l.name);
        r = { line: ++line, code: l.code, name: l.name, type: c.type, classifiedBy: c.basis, debit: 0, credit: 0, balance: 0, net: 0, prior: tb.hasPrior ? 0 : null }; rows.push(r); }
      const bal = r.balance + l.debit - l.credit;
      r.debit = bal > 0 ? bal : 0; r.credit = bal < 0 ? -bal : 0; r.balance = bal; r.net = NATURE[r.type] === 'debit' ? bal : -bal;
    }
  }
  const debit = rows.reduce((s, r) => s + r.debit, 0), credit = rows.reduce((s, r) => s + r.credit, 0);
  return { ...tb, rows, totals: { debit, credit }, difference: debit - credit, balanced: debit === credit, unclassified: rows.filter((r) => r.type === 'suspense').length };
}

/** Effect of adjustments on profit (credits to income / debits to expense). */
export function adjustmentEffect(tb: TrialBalance, adjs: Adjustment[]) {
  const before = buildStatements(tb).keys, after = buildStatements(applyAdjustments(tb, adjs)).keys;
  return { profit: after.profit.current - before.profit.current, assets: after.assets.current - before.assets.current, equity: after.equity.current - before.equity.current };
}

/* ---------- expected credit losses (IFRS 9 / EAS 47 simplified approach), from Aurora's matrix ---------- */
export type EclBucket = { label: string; exposure: Minor; rateBps: number };
export const DEFAULT_ECL_BUCKETS: EclBucket[] = [
  { label: 'غير مستحقة', exposure: 0, rateBps: 100 }, { label: '1–30 يوماً', exposure: 0, rateBps: 300 }, { label: '31–90 يوماً', exposure: 0, rateBps: 800 },
  { label: '91–180 يوماً', exposure: 0, rateBps: 2000 }, { label: '181–365 يوماً', exposure: 0, rateBps: 5000 }, { label: 'أكثر من سنة', exposure: 0, rateBps: 10000 },
];
export function eclMatrix(buckets: EclBucket[]) {
  const rows = buckets.map((b) => {
    const exposure = Math.max(0, Math.round(Number(b.exposure) || 0)), rateBps = Math.max(0, Math.min(10000, Math.round(Number(b.rateBps) || 0)));
    return { label: b.label, exposure, rateBps, loss: Math.round((exposure * rateBps) / 10000) };
  });
  const exposure = rows.reduce((a, r) => a + r.exposure, 0), loss = rows.reduce((a, r) => a + r.loss, 0);
  return { rows, exposure, loss, weightedBps: exposure ? Math.round((loss * 10000) / exposure) : 0 };
}
/** The allowance already booked: credit balances of the receivables line's allowance accounts. */
export function existingAllowance(tb: TrialBalance): Minor {
  return tb.rows.filter((r) => lineFor(r).key === 'receivables' && /خسائر|مخصص|مشكوك|allowance/.test(norm(r.name))).reduce((a, r) => a + Math.max(0, -r.balance), 0);
}
/** The entry that brings the allowance to the matrix result (up or down); null when nothing changes. */
export function eclAdjustment(tb: TrialBalance, matrix: ReturnType<typeof eclMatrix>, framework: Framework = 'IFRS'): Adjustment | null {
  const diff = matrix.loss - existingAllowance(tb);
  if (!diff) return null;
  const amt = Math.abs(diff), up = diff > 0, std = inFramework('IFRS 9', framework);
  return { id: 'AJE-ECL', title: up ? 'تكوين مخصص الخسائر الائتمانية المتوقعة' : 'رد جزء من مخصص الخسائر الائتمانية المتوقعة', source: 'engine', estimate: true, standard: std,
    reason: `مصفوفة أعمار الذمم: تعرض ${formatMinor(matrix.exposure, { decimals: 0 })} × معدل مرجح ${matrix.weightedBps / 100}% = ${formatMinor(matrix.loss, { decimals: 0 })}؛ الرصيد القائم ${formatMinor(existingAllowance(tb), { decimals: 0 })}`,
    lines: up ? [{ code: 'ADJ-ECLE', name: 'مصروف خسائر ائتمانية متوقعة', debit: amt, credit: 0, type: 'expense' }, { code: 'ADJ-ECLA', name: 'مخصص خسائر ائتمانية متوقعة', debit: 0, credit: amt, type: 'asset' }]
      : [{ code: 'ADJ-ECLA', name: 'مخصص خسائر ائتمانية متوقعة', debit: amt, credit: 0, type: 'asset' }, { code: 'ADJ-ECLE', name: 'مصروف خسائر ائتمانية متوقعة', debit: 0, credit: amt, type: 'expense' }] };
}
