/* Going concern and viability (ISA 570 Revised 2024 · IAS 1.25–26) — how the world's auditors and boards test it,
   brought down to a twelve-month cash view an owner-managed business can run:
   • a cash forecast built from the entity's own numbers and agreed to its budget (AstraZeneca: «agreeing the
     underlying cash flow projections to Board approved budgets… assessing the accuracy of management's forecasts»);
   • «severe but plausible» scenarios, each linked to a principal risk, run one by one and as a cluster (bp, Unilever,
     GSK and AstraZeneca viability statements);
   • realistic mitigating actions (bp: «reductions in capital expenditure, divestments and dividend reductions»), whose
     feasibility is itself judged;
   • a reverse stress test: how far revenue can fall before cash runs out;
   • the conclusion and the auditor's «Conclusions relating to going concern» section (bp, AstraZeneca), which ISA 570
     (Revised 2024) makes part of every auditor's report for periods beginning on or after 15 December 2026.
   Amounts in minor units; months 1–12 after the reporting date. */
import type { FinancialStatements } from '../reports/statements-engine';

export type GcBaseline = { openingCash: number; monthlyRevenue: number; grossMargin: number; monthlyFixedCosts: number;
  dsoDays: number; dpoDays: number; openingReceivables: number; openingPayables: number; monthlyDebtService: number; monthlyCapex: number;
  zakatDue?: { month: number; amount: number }; undrawnFacilities: number };
export type GcScenario = { key: string; ar: string; risk: string; revenuePct: number; marginPts: number; dsoDelta: number; fixedPct?: number; oneOff?: { month: number; amount: number } };
export type GcMitigation = { ar: string; monthly: number; fromMonth: number; feasible: boolean };
export type GcPath = { key: string; ar: string; risk: string; months: { m: number; cash: number }[]; minCash: number; minMonth: number; headroom: number; shortfallMonth: number | null; mitigated?: { minCash: number; headroom: number } };
export type GcConclusion = 'no-material-uncertainty' | 'close-call' | 'material-uncertainty';

export const DEFAULT_SCENARIOS: GcScenario[] = [
  { key: 'demand', ar: 'انخفاض الطلب', risk: 'تراجع السوق أو دخول منافسين', revenuePct: -0.2, marginPts: 0, dsoDelta: 0 },
  { key: 'margin', ar: 'ضغط الهوامش وارتفاع التكاليف', risk: 'ارتفاع أسعار الشراء والتكاليف الثابتة', revenuePct: 0, marginPts: -0.05, dsoDelta: 0, fixedPct: 0.1 },
  { key: 'collections', ar: 'تأخر التحصيل', risk: 'تعثر العملاء وطول فترة الائتمان', revenuePct: 0, marginPts: 0, dsoDelta: 15 },
  { key: 'customer', ar: 'فقدان أكبر عميل', risk: 'تركز الإيرادات في عملاء قليلين', revenuePct: -0.15, marginPts: 0, dsoDelta: 0 },
  { key: 'combined', ar: 'مخاطر مجتمعة (سيناريو عنقودي)', risk: 'تزامن تراجع الطلب وضغط الهوامش وتأخر التحصيل', revenuePct: -0.15, marginPts: -0.03, dsoDelta: 10 },
];

/** The twelve-month baseline from the statements: revenue, margin and cash costs spread evenly, working-capital days
 *  from the year-end balances, current borrowings repaid over the year, zakat paid in the fourth month (the return and
 *  payment fall due 120 days after the year end). */
export function baselineFromStatements(fs: FinancialStatements, o: { undrawnFacilities?: number } = {}): GcBaseline {
  const v = (k: string) => fs.lines.find((l) => l.key === k)?.current ?? 0;
  const rev = Math.abs(fs.keys.revenue.current), cogs = Math.abs(v('cogs'));
  const opexCash = Math.abs(v('selling')) + Math.abs(v('admin'));
  const capex = Math.abs(fs.cf?.find((r) => r.key === 'cf-inv-ppe')?.current ?? 0);
  const zakat = Math.abs(v('zakatPayable'));
  return { openingCash: v('cash'), monthlyRevenue: Math.round(rev / 12), grossMargin: rev ? Math.max(-1, Math.min(1, (rev - cogs) / rev)) : 0,
    monthlyFixedCosts: Math.round(opexCash / 12), dsoDays: rev ? Math.round((Math.abs(v('receivables')) / rev) * 365) : 0,
    dpoDays: cogs ? Math.round((Math.abs(v('payables')) / cogs) * 365) : 0, openingReceivables: Math.abs(v('receivables')), openingPayables: Math.abs(v('payables')),
    monthlyDebtService: Math.round(Math.abs(v('loansCl')) / 12), monthlyCapex: Math.round(capex / 12),
    zakatDue: zakat ? { month: 4, amount: zakat } : undefined, undrawnFacilities: o.undrawnFacilities ?? 0 };
}

function run(b: GcBaseline, s: GcScenario, mit: GcMitigation[] = []): { months: { m: number; cash: number }[] } {
  const months: { m: number; cash: number }[] = [];
  let cash = b.openingCash, rec = b.openingReceivables, pay = b.openingPayables;
  const margin = Math.max(-1, Math.min(1, b.grossMargin + s.marginPts)), dso = Math.max(0, b.dsoDays + s.dsoDelta);
  for (let m = 1; m <= 12; m++) {
    const revenue = Math.max(0, b.monthlyRevenue * (1 + s.revenuePct)), cogs = revenue * (1 - margin);
    const recEnd = revenue * dso / 30, payEnd = cogs * b.dpoDays / 30;
    const op = revenue - cogs - b.monthlyFixedCosts * (1 + (s.fixedPct ?? 0)) - (recEnd - rec) + (payEnd - pay);
    rec = recEnd; pay = payEnd;
    cash += op - b.monthlyDebtService - b.monthlyCapex;
    if (b.zakatDue && b.zakatDue.month === m) cash -= b.zakatDue.amount;
    if (s.oneOff && s.oneOff.month === m) cash -= s.oneOff.amount;
    for (const x of mit) if (x.feasible && m >= x.fromMonth) cash += x.monthly;
    months.push({ m, cash: Math.round(cash) });
  }
  return { months };
}
function summarise(b: GcBaseline, s: GcScenario, mit: GcMitigation[]): GcPath {
  const { months } = run(b, s);
  const min = months.reduce((a, x) => (x.cash < a.cash ? x : a), months[0]);
  const short = months.find((x) => x.cash + b.undrawnFacilities < 0);
  const path: GcPath = { key: s.key, ar: s.ar, risk: s.risk, months, minCash: min.cash, minMonth: min.m, headroom: min.cash + b.undrawnFacilities, shortfallMonth: short ? short.m : null };
  if (mit.some((x) => x.feasible)) { const mm = run(b, s, mit).months, mn = Math.min(...mm.map((x) => x.cash)); path.mitigated = { minCash: mn, headroom: mn + b.undrawnFacilities }; }
  return path;
}

/** Reverse stress test: the fall in revenue (0–100%) at which the lowest cash plus undrawn facilities reaches zero. */
export function reverseStress(b: GcBaseline): number | null {
  const head = (p: number) => Math.min(...run(b, { key: 'r', ar: '', risk: '', revenuePct: -p, marginPts: 0, dsoDelta: 0 }).months.map((x) => x.cash)) + b.undrawnFacilities;
  if (head(0) < 0) return 0;
  if (head(1) >= 0) return null;
  let lo = 0, hi = 1;
  for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2; if (head(mid) >= 0) lo = mid; else hi = mid; }
  return Math.round(lo * 1000) / 10;
}

export function assessGoingConcern(input: { baseline: GcBaseline; scenarios?: GcScenario[]; mitigations?: GcMitigation[];
  indicators?: { title: string; severity: 'high' | 'medium' | 'low' }[] }) {
  const b = input.baseline, mit = input.mitigations ?? [], scen = input.scenarios ?? DEFAULT_SCENARIOS;
  const base = summarise(b, { key: 'base', ar: 'الحالة الأساسية', risk: 'استمرار أداء السنة المنتهية', revenuePct: 0, marginPts: 0, dsoDelta: 0 }, mit);
  const paths = scen.map((s) => summarise(b, s, mit));
  const breakPoint = reverseStress(b);
  const worst = paths.reduce((a, x) => (x.headroom < a.headroom ? x : a), paths[0] ?? base);
  const severeOk = paths.every((p) => p.headroom >= 0), mitigatedOk = paths.every((p) => p.headroom >= 0 || (p.mitigated?.headroom ?? -1) >= 0);
  const high = (input.indicators ?? []).filter((x) => x.severity === 'high').length;
  const conclusion: GcConclusion = base.headroom < 0 ? 'material-uncertainty' : severeOk && !high ? 'no-material-uncertainty' : mitigatedOk ? 'close-call' : 'material-uncertainty';
  const ar = { 'no-material-uncertainty': 'لا يوجد عدم تأكد جوهري — أساس الاستمرارية ملائم',
    'close-call': 'أساس الاستمرارية ملائم مع حكم مهم يستوجب الإفصاح (حالة قريبة)', 'material-uncertainty': 'عدم تأكد جوهري محتمل يتعلق بالاستمرارية' }[conclusion];
  const why = conclusion === 'material-uncertainty'
    ? (base.headroom < 0 ? 'حتى في الحالة الأساسية ينفد النقد والتسهيلات خلال الاثني عشر شهراً القادمة (الشهر ' + base.shortfallMonth + ').'
      : 'سيناريو «' + worst.ar + '» يستنفد النقد والتسهيلات ولا تكفي الإجراءات المخففة المتاحة لتغطيته.')
    : conclusion === 'close-call' ? 'بعض السيناريوهات الحادة تستنفد النقد لولا الإجراءات المخففة؛ يُفصح عن الحكم المهم وتقييم قابلية تنفيذ الإجراءات (IAS 1.122).'
    : 'يبقى النقد والتسهيلات موجبة في كل السيناريوهات الحادة المعقولة خلال الاثني عشر شهراً.';
  return { base, paths, breakPoint, worst, conclusion, ar, why, highIndicators: high };
}

/** The auditor's report section on going concern (ISA 570 Revised 2024, as bp and AstraZeneca report it). */
export function goingConcernSection(conclusion: GcConclusion, o: { framework?: 'IFRS' | 'SME' | 'EAS'; note?: string } = {}) {
  const note = o.note || 'الإيضاح المتعلق بأساس الإعداد';
  if (conclusion === 'material-uncertainty') return { title: 'عدم تأكد جوهري يتعلق بالاستمرارية', paragraphs: [
    `نلفت الانتباه إلى ${note} في القوائم المالية، الذي يبين أحداثاً وظروفاً تشير إلى وجود عدم تأكد جوهري قد يثير شكاً كبيراً في قدرة المنشأة على البقاء كمنشأة مستمرة. ولم يُعدَّل رأينا فيما يتعلق بهذا الأمر.`] };
  return { title: 'الاستنتاجات المتعلقة بالاستمرارية', paragraphs: [
    'عند مراجعتنا للقوائم المالية، استنتجنا أن استخدام الإدارة لأساس الاستمرارية المحاسبي في إعداد القوائم المالية ملائم.',
    'وشمل تقييمنا لتقييم الإدارة لقدرة المنشأة على البقاء كمنشأة مستمرة: مطابقة توقعات التدفقات النقدية مع الموازنة المعتمدة، وتقييم دقة توقعات الإدارة في السنوات السابقة، وتقييم الافتراضات الرئيسية واتساقها مع اختبارات الانخفاض، ومراجعة السيولة والتسهيلات المتاحة وتواريخ استحقاقها، وتحليل سيناريوهات حادة لكنها معقولة واختبار الضغط العكسي، وتقييم قابلية تنفيذ الإجراءات المخففة، وتقييم الإفصاحات ذات الصلة.',
    ...(conclusion === 'close-call' ? [`ونلفت الانتباه إلى ${note} الذي يفصح عن الأحكام المهمة التي استخدمتها الإدارة في تقييم الاستمرارية والإجراءات المخففة المعتمد عليها.`] : []),
    'واستناداً إلى العمل الذي قمنا به، لم نحدد عدم تأكد جوهري يتعلق بأحداث أو ظروف قد تثير، منفردة أو مجتمعة، شكاً كبيراً في قدرة المنشأة على البقاء كمنشأة مستمرة لفترة لا تقل عن اثني عشر شهراً من تاريخ اعتماد القوائم المالية.',
    'ومع ذلك، ولأنه لا يمكن التنبؤ بجميع الأحداث أو الظروف المستقبلية، فإن هذا الاستنتاج ليس ضماناً لقدرة المنشأة على البقاء كمنشأة مستمرة.'] };
}
