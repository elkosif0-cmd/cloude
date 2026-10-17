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
  zakatDue?: { month: number; amount: number }; undrawnFacilities: number;
  /** supplier days measured on all cash costs, when the statement shows no cost of sales (Unilever, the banks) */ dpoOnCosts?: boolean;
  /** a bank or insurer: liquidity is judged on the regulator's ratios, not on a trading cash forecast */ financial?: boolean;
  /** current borrowings rolled over (interest only) because the entity is profitable and covers its interest comfortably */ refinance?: boolean;
  /** the share of the cash costs that moves with sales (selling and distribution), and the operating margin that calibrates the shocks */
  variableCostShare?: number; operatingMargin?: number };
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
export function baselineFromStatements(fs: FinancialStatements, o: { undrawnFacilities?: number; financial?: boolean } = {}): GcBaseline {
  const v = (k: string) => fs.lines.find((l) => l.key === k)?.current ?? 0;
  const rev = Math.abs(fs.keys.revenue.current), cogs = Math.abs(v('cogs'));
  const opexCash = Math.abs(v('selling')) + Math.abs(v('admin'));
  const capex = Math.abs(fs.cf?.find((r) => r.key === 'cf-inv-ppe')?.current ?? 0);
  const zakat = Math.abs(v('zakatPayable'));
  /* supplier days on the cost of sales; on all cash costs when the statement does not analyse a cost of sales, else the year-end
     payables would all be paid in the first month with nothing bought to replace them */
  const costBase = cogs || cogs + opexCash, dpoOnCosts = !cogs && costBase > 0;
  /* a profitable entity that covers its interest three times rolls its current borrowings over (ISA 570.A3: the ability to refinance);
     otherwise they are repaid across the year */
  const k = fs.keys, finance = Math.abs(k.finance?.current ?? 0), refinance = (k.profit?.current ?? 0) > 0 && (k.operating?.current ?? 0) >= 3 * finance;
  return { openingCash: v('cash'), monthlyRevenue: Math.round(rev / 12), grossMargin: rev ? Math.max(-1, Math.min(1, (rev - cogs) / rev)) : 0,
    monthlyFixedCosts: Math.round(opexCash / 12), dsoDays: rev ? Math.round((Math.abs(v('receivables')) / rev) * 365) : 0,
    dpoDays: costBase ? Math.round((Math.abs(v('payables')) / costBase) * 365) : 0, openingReceivables: Math.abs(v('receivables')), openingPayables: Math.abs(v('payables')),
    monthlyDebtService: Math.round((refinance ? finance : Math.abs(v('loansCl'))) / 12), monthlyCapex: Math.round(capex / 12),
    zakatDue: zakat ? { month: 4, amount: zakat } : undefined, undrawnFacilities: o.undrawnFacilities ?? 0,
    ...(dpoOnCosts ? { dpoOnCosts } : {}), ...(o.financial ? { financial: true } : {}), ...(refinance ? { refinance } : {}),
    /* with no cost of sales on the face of the statement, the cost of what is sold sits inside those costs: at least half of them move with sales */
    ...(opexCash ? { variableCostShare: Math.round(Math.min(0.8, Math.max(cogs ? 0 : 0.5, Math.abs(v('selling')) / opexCash)) * 100) / 100 } : {}),
    ...(rev ? { operatingMargin: Math.round(((k.operating?.current ?? 0) / rev) * 1000) / 1000 } : {}) };
}

function run(b: GcBaseline, s: GcScenario, mit: GcMitigation[] = []): { months: { m: number; cash: number }[] } {
  const months: { m: number; cash: number }[] = [];
  let cash = b.openingCash, rec = b.openingReceivables, pay = b.openingPayables;
  const margin = Math.max(-1, Math.min(1, b.grossMargin + s.marginPts)), dso = Math.max(0, b.dsoDays + s.dsoDelta);
  for (let m = 1; m <= 12; m++) {
    const revenue = Math.max(0, b.monthlyRevenue * (1 + s.revenuePct)), cogs = revenue * (1 - margin);
    const recEnd = revenue * dso / 30, payEnd = (cogs + (b.dpoOnCosts ? b.monthlyFixedCosts * (1 + (s.fixedPct ?? 0)) : 0)) * b.dpoDays / 30;
    const vs = b.variableCostShare ?? 0, costs = b.monthlyFixedCosts * (1 + (s.fixedPct ?? 0)) * (1 - vs + vs * (1 + s.revenuePct));
    const op = revenue - cogs - costs - (recEnd - rec) + (payEnd - pay);
    rec = recEnd; pay = payEnd;
    cash += op - b.monthlyDebtService - b.monthlyCapex;
    if (b.zakatDue && b.zakatDue.month === m) cash -= b.zakatDue.amount;
    if (s.oneOff && s.oneOff.month === m) cash -= s.oneOff.amount;
    for (const x of mit) if (x.feasible && m >= x.fromMonth) cash += x.monthly;
    months.push({ m, cash: Math.round(cash) });
  }
  return { months };
}
/** «Severe but plausible» for this entity: a margin squeeze or cost rise sized to its own operating margin — five points off a
    3% retailer is not plausible, it is a different business (full shocks from a 10% operating margin up) — and a collections
    delay sized to the days of credit it actually gives. */
function calibrate(b: GcBaseline, s: GcScenario): GcScenario {
  /* and a collections delay sized to the credit it gives: a cash retailer collecting in five days does not wait fifteen more */
  const dso = s.dsoDelta > 0 ? { dsoDelta: Math.min(s.dsoDelta, Math.max(3, Math.round(b.dsoDays * 0.5))) } : {};
  if (b.operatingMargin === undefined || b.operatingMargin >= 0.1) return { ...s, ...dso };
  const k = Math.max(0.2, b.operatingMargin / 0.1);
  return { ...s, ...dso, marginPts: s.marginPts * k, ...(s.fixedPct ? { fixedPct: s.fixedPct * k } : {}) };
}
function summarise(b: GcBaseline, s0: GcScenario, mit: GcMitigation[]): GcPath {
  const s = calibrate(b, s0), { months } = run(b, s);
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
  /* a bank or insurer is not run through a trading cash forecast: its loans and deposits are its business, and its liquidity is judged
     on the regulator's ratios (liquidity coverage, net stable funding) and its capital — what HSBC's and UBS's auditors test */
  const conclusion: GcConclusion = b.financial ? (high ? 'close-call' : 'no-material-uncertainty')
    : base.headroom < 0 ? 'material-uncertainty' : severeOk && !high ? 'no-material-uncertainty' : mitigatedOk ? 'close-call' : 'material-uncertainty';
  const ar = { 'no-material-uncertainty': 'لا يوجد عدم تأكد جوهري — أساس الاستمرارية ملائم',
    'close-call': 'أساس الاستمرارية ملائم مع حكم مهم يستوجب الإفصاح (حالة قريبة)', 'material-uncertainty': 'عدم تأكد جوهري محتمل يتعلق بالاستمرارية' }[conclusion];
  const why = b.financial ? 'منشأة مالية: تُقيَّم الاستمرارية بنسب السيولة التي تفرضها الجهة الرقابية (تغطية السيولة وصافي التمويل المستقر) وكفاية رأس المال وخطط التمويل، لا بتوقع التدفق التشغيلي لمنشأة تجارية.'
    : conclusion === 'material-uncertainty'
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
