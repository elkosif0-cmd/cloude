/* The report outputs, modelled on how Apple (Form 10-K, fiscal 2024) and Amazon (annual report and
   quarterly results release, 2024) present their numbers — rebuilt for any company's trial balance:
     • Apple 10-K, Item 7 (MD&A): net sales by category with year-over-year change; products vs services
       gross margin and gross-margin %; operating expenses with change and % of total net sales; provision
       for income taxes and the effective rate; liquidity and capital resources; critical accounting estimates
     • Apple 10-K, Item 8 notes: revenue disaggregation, property, plant and equipment (gross, accumulated
       depreciation, net), other balance-sheet details, income taxes, debt
     • Amazon: free cash flow and free cash flow less lease repayments as reconciled non-GAAP measures
       (under IFRS 18: management-defined performance measures reconciled to the nearest IFRS subtotal);
       the results release — headline bullets with growth, then condensed statements and supplemental metrics
     • EY's reports on both: opinion, basis for opinion, critical (key) audit matters written as
       «description of the matter» and «how we addressed the matter in our audit»
   Every number is derived from the statements engine (halalas); nothing is typed or estimated here. */
import { formatMinor, type Minor } from './money-engine';
import { norm } from './tb-import-engine';
import { type FinancialStatements, type FsLine } from './statements-engine';

const pc = (a: Minor, b: Minor | null | undefined) => (b ? Math.round(((a - b) / Math.abs(b)) * 1000) / 10 : null);
const share = (a: Minor, b: Minor) => (b ? Math.round((a / b) * 1000) / 10 : null);
const line = (fs: FinancialStatements, k: string): FsLine | undefined => fs.lines.find((l) => l.key === k);
const cur = (fs: FinancialStatements, k: string) => line(fs, k)?.current ?? 0;
const pri = (fs: FinancialStatements, k: string) => (fs.hasPrior ? line(fs, k)?.prior ?? 0 : null);

export type Row = { ar: string; current: Minor; prior: Minor | null; change: number | null; pctOfRevenue?: number | null; pctOfRevenuePrior?: number | null; level?: 'line' | 'total' };

/* ---------- MD&A tables (Apple Item 7) ---------- */
/** Net sales by category — each revenue account is a category, the smallest folded into «أخرى» beyond `max`. */
export function revenueByCategory(fs: FinancialStatements, max = 8) {
  const accs = (line(fs, 'revenue')?.accounts ?? []).map((a) => ({ ar: a.name, current: a.current, prior: a.prior })).sort((a, b) => b.current - a.current);
  const head = accs.slice(0, max - (accs.length > max ? 1 : 0)), rest = accs.slice(head.length);
  if (rest.length) head.push({ ar: 'أخرى', current: rest.reduce((s, a) => s + a.current, 0), prior: fs.hasPrior ? rest.reduce((s, a) => s + (a.prior ?? 0), 0) : null });
  const total = cur(fs, 'revenue'), totalPrior = pri(fs, 'revenue');
  const rows: Row[] = head.map((a) => ({ ...a, change: pc(a.current, a.prior), pctOfRevenue: share(a.current, total) }));
  rows.push({ ar: 'إجمالي الإيرادات', current: total, prior: totalPrior, change: pc(total, totalPrior), pctOfRevenue: total ? 100 : null, level: 'total' });
  return rows;
}

const SERVICE = /خدم|اتعاب|استشار|صيان|اشتراك|عمول|تاجير|ايجار|تركيب|تدريب|نقل|service|fee|consult|subscription|rent|commission|maintenance/;
/** Products vs services (Apple's gross-margin table) — only when the accounts reveal both. */
export function productsServices(fs: FinancialStatements) {
  const rev = line(fs, 'revenue')?.accounts ?? [], cogs = line(fs, 'cogs')?.accounts ?? [];
  const isSvc = (n: string) => SERVICE.test(norm(n));
  const sum = (xs: { current: Minor; prior: Minor | null }[], p: boolean) => xs.reduce((s, a) => s + (p ? a.prior ?? 0 : a.current), 0);
  const rs = rev.filter((a) => isSvc(a.name)), rp = rev.filter((a) => !isSvc(a.name)), cs = cogs.filter((a) => isSvc(a.name)), cp = cogs.filter((a) => !isSvc(a.name));
  if (!rs.length || !rp.length) return null;
  const seg = (r: typeof rev, c: typeof cogs, ar: string) => {
    const revenue = sum(r, false), cost = sum(c, false), revenueP = fs.hasPrior ? sum(r, true) : null, costP = fs.hasPrior ? sum(c, true) : null;
    const margin = revenue - cost, marginP = revenueP === null ? null : revenueP - (costP ?? 0);
    return { ar, revenue, cost, margin, marginPct: share(margin, revenue), revenuePrior: revenueP, marginPrior: marginP, marginPctPrior: marginP === null ? null : share(marginP, revenueP ?? 0) };
  };
  return { products: seg(rp, cp, 'المنتجات'), services: seg(rs, cs, 'الخدمات'), costSplit: cs.length > 0,
    total: { revenue: cur(fs, 'revenue'), margin: fs.keys.gross.current, marginPct: share(fs.keys.gross.current, fs.keys.revenue.current), marginPctPrior: fs.hasPrior ? share(fs.keys.gross.prior ?? 0, fs.keys.revenue.prior ?? 0) : null } };
}

/** Results of operations — Apple's statement lines with change and % of net sales. */
export function resultsTable(fs: FinancialStatements): Row[] {
  const k = fs.keys, rev = k.revenue.current, revP = k.revenue.prior;
  const r = (ar: string, c: Minor, p: Minor | null, level: Row['level'] = 'line'): Row => ({ ar, current: c, prior: p, change: pc(c, p), pctOfRevenue: share(c, rev), pctOfRevenuePrior: p === null || !revP ? null : share(p, revP), level });
  const P = (key: string) => (fs.hasPrior ? k[key]?.prior ?? 0 : null);
  return [
    r('الإيرادات', rev, P('revenue')), r('تكلفة الإيرادات', k.cogs.current, P('cogs')), r('مجمل الربح', k.gross.current, P('gross'), 'total'),
    r('المصروفات التشغيلية', k.opex.current, P('opex')), r('الربح التشغيلي', k.operating.current, P('operating'), 'total'),
    r('إيرادات الاستثمار وتكاليف التمويل (صافي)', k.pbz.current - k.operating.current, fs.hasPrior ? (k.pbz.prior ?? 0) - (k.operating.prior ?? 0) : null),
    r('الربح قبل الزكاة/الضريبة', k.pbz.current, P('pbz'), 'total'), r('الزكاة/ضريبة الدخل', k.zakat.current, P('zakat')), r('صافي الربح', k.profit.current, P('profit'), 'total'),
  ];
}

/** Operating expenses — amount, change, % of total net sales (Apple Item 7). */
export function operatingExpenses(fs: FinancialStatements): Row[] {
  const rev = fs.keys.revenue.current, revP = fs.keys.revenue.prior;
  const rows = (['selling', 'admin', 'depreciation', 'impairment'] as const).map((k) => ({ k, l: line(fs, k) })).filter((x) => x.l && (x.l.current || x.l.prior))
    .map(({ l }) => ({ ar: l!.ar, current: l!.current, prior: l!.prior, change: pc(l!.current, l!.prior), pctOfRevenue: share(l!.current, rev), pctOfRevenuePrior: l!.prior === null || !revP ? null : share(l!.prior, revP) }));
  const tc = rows.reduce((s, r) => s + r.current, 0), tp = fs.hasPrior ? rows.reduce((s, r) => s + (r.prior ?? 0), 0) : null;
  return [...rows, { ar: 'إجمالي المصروفات التشغيلية', current: tc, prior: tp, change: pc(tc, tp), pctOfRevenue: share(tc, rev), pctOfRevenuePrior: tp === null || !revP ? null : share(tp, revP), level: 'total' }];
}

/** Provision for zakat / income tax and the effective rate (Apple «Provision for Income Taxes»). */
export function taxProvision(fs: FinancialStatements, jurisdiction: 'SA' | 'EG' = 'SA') {
  const pbz = fs.keys.pbz.current, exp = fs.keys.zakat.current, eff = share(exp, pbz);
  const statutory = jurisdiction === 'EG' ? 22.5 : null;
  const atStatutory = statutory === null ? null : Math.round((pbz * statutory) / 1000) * 10;
  return { expense: exp, pbz, effectiveRate: eff, effectiveRatePrior: fs.hasPrior ? share(fs.keys.zakat.prior ?? 0, fs.keys.pbz.prior ?? 0) : null, statutory,
    reconciliation: atStatutory === null ? [] : [
      { ar: 'الضريبة بالسعر القانوني (22.5%)', amount: atStatutory }, { ar: 'أثر البنود غير الخاضعة وغير القابلة للخصم والفروق الأخرى', amount: exp - atStatutory }, { ar: 'مصروف ضريبة الدخل', amount: exp }],
    basis: jurisdiction === 'EG' ? 'ضريبة الدخل على الربح الضريبي (قانون 91 لسنة 2005)' : 'الزكاة على الوعاء الزكوي بسعر 2.5% (لائحة 1445هـ) — ليست نسبة من الربح، فالمعدل الظاهر يعكس حجم الوعاء لا سعر الضريبة' };
}

/* ---------- non-GAAP / management-defined performance measures (Amazon) ---------- */
export type Measure = { key: string; ar: string; rows: { ar: string; amount: Minor }[]; value: Minor; prior: Minor | null; note: string };
export function performanceMeasures(fs: FinancialStatements): Measure[] {
  const out: Measure[] = [], cf = fs.cf, k = fs.keys;
  const cfRow = (key: string) => cf?.find((r) => r.key === key)?.current ?? 0;
  if (cf) {
    const cfo = cfRow('cf-op'), capex = cfRow('cf-inv-ppe') + cfRow('cf-inv-intangibles'), fcf = cfo + capex;
    out.push({ key: 'fcf', ar: 'التدفق النقدي الحر', rows: [{ ar: 'صافي النقد من الأنشطة التشغيلية', amount: cfo }, { ar: 'شراء ممتلكات ومعدات وأصول غير ملموسة', amount: capex }], value: fcf, prior: null,
      note: 'مقياس تحدده الإدارة ولا يعرّفه IFRS؛ يقيس النقد المتاح بعد الاستثمار في الأصول. الأقرب في المعايير: صافي النقد من الأنشطة التشغيلية.' });
    const leases = cfRow('cf-fin-leaseNcl');
    if (leases < 0) out.push({ key: 'fcfLeases', ar: 'التدفق النقدي الحر بعد سداد التزامات الإيجار', rows: [{ ar: 'التدفق النقدي الحر', amount: fcf }, { ar: 'صافي سداد التزامات عقود الإيجار', amount: leases }], value: fcf + leases, prior: null,
      note: 'على نهج أمازون: يقرّب النقد المتاح بعد مدفوعات الإيجار التي يعرضها IFRS 16 ضمن الأنشطة التمويلية.' });
  }
  const da = line(fs, 'depreciation');
  const e = (op: Minor, d: Minor) => op + d;
  out.push({ key: 'ebitda', ar: 'الربح قبل الفوائد والزكاة والاستهلاك (EBITDA)', rows: [{ ar: 'الربح التشغيلي', amount: k.operating.current }, { ar: 'الاستهلاك والإطفاء', amount: da?.current ?? 0 }],
    value: e(k.operating.current, da?.current ?? 0), prior: fs.hasPrior ? e(k.operating.prior ?? 0, da?.prior ?? 0) : null,
    note: 'مقياس أداء تحدده الإدارة؛ يُطابق مع «الربح التشغيلي» — المجموع الإلزامي في IFRS 18 — ويُفصح عن سبب استخدامه.' });
  return out;
}

/* ---------- notes (Apple Item 8) ---------- */
const ACCUM = /مجمع|متراكم|accumulated/;
export function ppeNote(fs: FinancialStatements) {
  const accs = line(fs, 'ppe')?.accounts ?? [];
  if (!accs.length) return null;
  const acc = accs.filter((a) => ACCUM.test(norm(a.name))), gross = accs.filter((a) => !ACCUM.test(norm(a.name)));
  const s = (xs: typeof accs, p: boolean) => xs.reduce((t, a) => t + (p ? a.prior ?? 0 : a.current), 0);
  return { rows: gross.map((a) => ({ ar: a.name, current: a.current, prior: a.prior })), gross: s(gross, false), grossPrior: fs.hasPrior ? s(gross, true) : null,
    accumulated: s(acc, false), accumulatedPrior: fs.hasPrior ? s(acc, true) : null, net: s(accs, false), netPrior: fs.hasPrior ? s(accs, true) : null,
    depreciation: cur(fs, 'depreciation') };
}
/** «Other balance sheet details»: the composition of every position line made of two or more accounts. */
export function balanceSheetDetails(fs: FinancialStatements) {
  return fs.lines.filter((l) => ['ca', 'cl', 'ncl'].includes(l.section) && l.accounts.length >= 2 && l.key !== 'cash')
    .map((l) => ({ key: l.key, ar: l.ar, note: l.note, rows: l.accounts.map((a) => ({ ar: a.name, current: a.current, prior: a.prior })), total: l.current, totalPrior: l.prior }));
}
export function debtNote(fs: FinancialStatements) {
  const items = (['loansCl', 'loansNcl', 'leaseNcl'] as const).map((k) => ({ k, l: line(fs, k) })).filter((x) => x.l && (x.l.current || x.l.prior))
    .map(({ k, l }) => ({ ar: l!.ar, current: l!.current, prior: l!.prior, maturity: k === 'loansCl' ? 'خلال سنة' : 'بعد سنة' }));
  const total = items.reduce((s, x) => s + x.current, 0);
  return items.length ? { items, total, netDebt: total - cur(fs, 'cash'), financeCost: fs.keys.finance.current } : null;
}

/* ---------- liquidity (Apple «Liquidity and Capital Resources») ---------- */
export function liquidity(fs: FinancialStatements) {
  const k = fs.keys, cash = cur(fs, 'cash'), debt = cur(fs, 'loansCl') + cur(fs, 'loansNcl') + cur(fs, 'leaseNcl');
  const wc = k.ca.current - k.cl.current, fcf = performanceMeasures(fs).find((m) => m.key === 'fcf');
  return { cash, cashPrior: pri(fs, 'cash'), debt, netCash: cash - debt, workingCapital: wc, currentRatio: k.cl.current ? Math.round((k.ca.current / k.cl.current) * 100) / 100 : null,
    cfo: k.cfo?.current ?? null, fcf: fcf ? fcf.value : null };
}

/* ---------- the results release (Amazon / Apple quarterly results) ---------- */
export function resultsRelease(fs: FinancialStatements, company: string, period: string, currency = 'ر.س') {
  const k = fs.keys, m = (v: Minor) => formatMinor(v, { decimals: 0 }) + ' ' + currency;
  const grew = (key: string, ar: string, fem = false) => {
    const c = k[key]?.current ?? 0, p = fs.hasPrior ? k[key]?.prior ?? null : null, ch = pc(c, p);
    if (p === null || ch === null) return `بلغ ${ar} ${m(c)}.`;
    const verb = (ch >= 0 ? 'ارتفع' : 'انخفض') + (fem ? 'ت' : '');
    return `${verb} ${ar} ${Math.abs(ch)}% إلى ${m(c)}، مقارنة بـ ${m(p)} في السنة السابقة.`;
  };
  const measures = performanceMeasures(fs), fcf = measures.find((x) => x.key === 'fcf');
  const bullets = [grew('revenue', 'الإيرادات', true), grew('operating', 'الربح التشغيلي'), grew('profit', 'صافي الربح'),
    ...(k.cfo ? [`بلغ صافي النقد من الأنشطة التشغيلية ${m(k.cfo.current)}.`] : []), ...(fcf ? [`بلغ التدفق النقدي الحر ${m(fcf.value)}.`] : [])];
  const headline = `${company || 'المنشأة'} تعلن نتائج ${period || 'السنة'}`;
  return { headline, bullets, results: resultsTable(fs), categories: revenueByCategory(fs), measures,
    supplemental: [
      { ar: 'نمو الإيرادات على أساس سنوي', value: pc(k.revenue.current, fs.hasPrior ? k.revenue.prior : null), unit: '%' },
      { ar: 'هامش مجمل الربح', value: share(k.gross.current, k.revenue.current), unit: '%' },
      { ar: 'هامش الربح التشغيلي', value: share(k.operating.current, k.revenue.current), unit: '%' },
      { ar: 'هامش صافي الربح', value: share(k.profit.current, k.revenue.current), unit: '%' },
    ] };
}

/* ---------- the independent auditor's report (EY on Apple and Amazon; ISA 700/701/705) ---------- */
/** Arabic "لـ" joined to a word: «ل» + «الشركة» → «للشركة», «ل» + «شركة» → «لشركة». */
export const lam = (w: string) => w.startsWith('ال') ? 'لل' + w.slice(2) : 'ل' + w;
export type KeyMatter = { title: string; description: string; how: string; /** «Key observations» / «Our results» */ observation?: string; refs?: string[]; trend?: 'new' | 'same' | null };
export type ReportSection = { title: string; paragraphs: string[]; kams?: KeyMatter[]; table?: { columns: string[]; rows: string[][] } };
export type Opinion = 'unmodified' | 'qualified' | 'adverse' | 'disclaimer';
export type Jurisdiction = 'SA' | 'AE' | 'EG';
/** The independent auditor's report as the bundle's reports write it — Saudi Aramco (PwC, ISA endorsed in the Kingdom),
    Emirates NBD and e& (UAE Federal Decree-Law No. 32 of 2021), and the Egyptian form: opinion; what we have audited; basis;
    independence; going concern; our audit approach with the materiality table and the scope; the key audit matters in two
    columns; other information; the board's and the auditor's responsibilities in full; the report on other legal and
    regulatory requirements where the law asks for one; the signature with the licence. */
export function auditorsReport(i: { company: string; periodEnd?: string; framework: 'IFRS' | 'SME' | 'EAS'; opinion: Opinion; basis: string[]; kams: KeyMatter[];
  goingConcern?: boolean; firm?: string; partner?: string; licence?: string; city?: string; date?: string; jurisdiction?: Jurisdiction; group?: boolean;
  /** the other information (annual report) was read before the report date */ otherInfoRead?: boolean;
  /** the going-concern section from goingConcernSection() (ISA 570 Revised 2024) */ goingConcernSection?: { title: string; paragraphs: string[] };
  /** «Our audit approach» (materiality, scope, KAMs at a glance) — Aramco / ISA (UK) 700; from governance-engine.auditApproach */
  approach?: { title: string; paragraphs: string[]; table?: { columns: string[]; rows: string[][] } } }) {
  const J: Jurisdiction = i.framework === 'EAS' ? 'EG' : i.jurisdiction ?? 'SA', eg = J === 'EG', ae = J === 'AE';
  const co = i.company || 'المنشأة', end = i.periodEnd || '[تاريخ نهاية الفترة]', g = !!i.group;
  const fw = eg ? 'معايير المحاسبة المصرية وفي ضوء القوانين واللوائح المصرية السارية'
    : ae ? 'المعايير الدولية للتقرير المالي الصادرة عن مجلس معايير المحاسبة الدولية'
    : i.framework === 'SME' ? 'المعيار الدولي للتقرير المالي للمنشآت الصغيرة ومتوسطة الحجم المعتمد في المملكة العربية السعودية والمعايير والإصدارات الأخرى المعتمدة من الهيئة السعودية للمراجعين والمحاسبين'
    : 'المعايير الدولية للتقرير المالي المعتمدة في المملكة العربية السعودية والمعايير والإصدارات الأخرى المعتمدة من الهيئة السعودية للمراجعين والمحاسبين';
  const isa = eg ? 'معايير المراجعة المصرية' : ae ? 'المعايير الدولية للمراجعة' : 'المعايير الدولية للمراجعة المعتمدة في المملكة العربية السعودية';
  const ethics = eg ? 'متطلبات السلوك المهني ذات الصلة في جمهورية مصر العربية'
    : ae ? 'الميثاق الدولي لسلوك وآداب المهنة للمحاسبين المهنيين (بما في ذلك معايير الاستقلال الدولية) الصادر عن مجلس المعايير الدولية لأخلاقيات المحاسبين، والمتطلبات الأخلاقية ذات الصلة بمراجعة القوائم المالية في دولة الإمارات العربية المتحدة'
    : 'الميثاق الدولي لسلوك وآداب المهنة للمحاسبين المهنيين (بما في ذلك معايير الاستقلال الدولية) المعتمد في المملكة العربية السعودية';
  const law = eg ? '' : ae ? 'والأحكام السارية من النظام الأساسي للشركة والمرسوم بقانون اتحادي رقم (32) لسنة 2021' : 'والمتطلبات المعمول بها في نظام الشركات والنظام الأساس للشركة';
  const fs = g ? 'القوائم المالية الموحدة' : 'القوائم المالية', ent = g ? 'المجموعة' : 'الشركة', board = eg ? 'الإدارة' : 'مجلس الإدارة';
  const who = g ? `${co} («الشركة») وشركاتها التابعة (يُشار إليها معاً بـ«المجموعة»)` : co;
  const title = { unmodified: 'الرأي', qualified: 'الرأي المتحفظ', adverse: 'الرأي العكسي', disclaimer: 'الامتناع عن إبداء الرأي' }[i.opinion];
  const listed = [`قائمة ${g ? 'المركز المالي الموحدة' : 'المركز المالي'} كما في ${end}؛`, `قائمة ${g ? 'الربح أو الخسارة والدخل الشامل الآخر الموحدة' : 'الربح أو الخسارة والدخل الشامل الآخر'} للسنة المنتهية في ذلك التاريخ؛`,
    `قائمة ${g ? 'التغيرات في حقوق الملكية الموحدة' : 'التغيرات في حقوق الملكية'} للسنة المنتهية في ذلك التاريخ؛`, `قائمة ${g ? 'التدفقات النقدية الموحدة' : 'التدفقات النقدية'} للسنة المنتهية في ذلك التاريخ؛`,
    `الإيضاحات المرفقة ب${fs}، والتي تتضمن معلومات السياسات المحاسبية الجوهرية والمعلومات التفسيرية الأخرى.`];
  const fair = `المركز المالي ${g ? 'الموحد ' : ''}${lam(ent)} كما في ${end}، وأداءها المالي ${g ? 'الموحد ' : ''}وتدفقاتها النقدية ${g ? 'الموحدة ' : ''}للسنة المنتهية في ذلك التاريخ وفقاً ${lam(fw)}`;
  const opinionText = i.opinion === 'disclaimer'
    ? [`كُلفنا بمراجعة ${fs} ${lam(who)}. نحن لا نبدي رأياً في ${fs} المرفقة، وبسبب أهمية الأمور الموضحة في قسم «أساس الامتناع عن إبداء الرأي» لم نتمكن من الحصول على ما يكفي من أدلة المراجعة المناسبة لتوفير أساس لرأي في هذه ${fs}.`]
    : [`لقد راجعنا ${fs} ${lam(who)}.`,
      i.opinion === 'unmodified' ? `وفي رأينا، فإن ${fs} المرفقة تعرض بعدل، من جميع الجوانب الجوهرية، ${fair}.`
        : i.opinion === 'qualified' ? `وفي رأينا، باستثناء آثار الأمور الموضحة في قسم «أساس الرأي المتحفظ»، فإن ${fs} المرفقة تعرض بعدل، من جميع الجوانب الجوهرية، ${fair}.`
        : `وفي رأينا، بسبب أهمية الأمور الموضحة في قسم «أساس الرأي العكسي»، فإن ${fs} المرفقة لا تعرض بعدل ${fair}.`];
  const basisTitle = { unmodified: 'أساس الرأي', qualified: 'أساس الرأي المتحفظ', adverse: 'أساس الرأي العكسي', disclaimer: 'أساس الامتناع عن إبداء الرأي' }[i.opinion];
  const nd = i.opinion !== 'disclaimer';
  const sections: ReportSection[] = [
    { title, paragraphs: opinionText },
    ...(nd ? [{ title: 'ما قمنا بمراجعته', paragraphs: [`تتكون ${fs} ${lam(ent)} مما يلي:`, ...listed.map((x) => '• ' + x)] }] : []),
    { title: basisTitle, paragraphs: [...(i.opinion === 'unmodified' ? [] : i.basis),
      ...(nd ? [`لقد قمنا بالمراجعة وفقاً ${lam(isa)}. ومسؤولياتنا بموجب تلك المعايير موضحة في قسم «مسؤوليات المراجع عن مراجعة ${fs}» في تقريرنا. ونعتقد أن أدلة المراجعة التي حصلنا عليها كافية ومناسبة لتوفير أساس لرأينا.`] : [])] },
    ...(nd ? [{ title: 'الاستقلال', paragraphs: [`نحن مستقلون عن ${ent} وفقاً ${lam(ethics)}${g ? '، وذلك بالقدر المنطبق على مراجعة القوائم المالية للمنشآت ذات المصلحة العامة' : ''}. وقد وفينا أيضاً بمسؤولياتنا المسلكية الأخرى وفقاً لمتطلبات ذلك الميثاق.`] }] : []),
    ...(i.goingConcernSection && nd ? [i.goingConcernSection]
      : i.goingConcern ? [{ title: 'عدم تأكد جوهري يتعلق بالاستمرارية', paragraphs: [`نلفت الانتباه إلى الإيضاح المتعلق بأساس الإعداد في ${fs}، الذي يبين أحداثاً وظروفاً تشير إلى وجود عدم تأكد جوهري قد يثير شكاً كبيراً في قدرة ${ent} على البقاء كمنشأة مستمرة. ولم يُعدَّل رأينا فيما يتعلق بهذا الأمر.`] }] : []),
    ...(i.approach && nd ? [i.approach] : []),
    ...(nd && i.kams.length ? [{ title: 'الأمور الرئيسية للمراجعة', paragraphs: [`الأمور الرئيسية للمراجعة هي تلك الأمور التي كانت، بحسب حكمنا المهني، لها الأهمية القصوى عند مراجعتنا ل${fs} للفترة الحالية. وقد تناولنا هذه الأمور في سياق مراجعتنا ل${fs} ككل وعند تكوين رأينا فيها، ولا نبدي رأياً منفصلاً في هذه الأمور.`], kams: i.kams }] : []),
    { title: 'المعلومات الأخرى', paragraphs: [
      `إن ${board} هو المسؤول عن المعلومات الأخرى. وتتضمن المعلومات الأخرى التقرير السنوي، ولكنها لا تتضمن ${fs} وتقريرنا عنها.`,
      `ولا يغطي رأينا في ${fs} المعلومات الأخرى، ولا نبدي أي شكل من أشكال الاستنتاج التأكيدي بشأنها.`,
      `وفيما يتعلق بمراجعتنا ل${fs}، فإن مسؤوليتنا هي قراءة المعلومات الأخرى المحددة أعلاه، وعند القيام بذلك، النظر فيما إذا كانت المعلومات الأخرى غير متسقة بشكل جوهري مع ${fs} أو مع المعرفة التي حصلنا عليها أثناء المراجعة، أو يظهر بطريقة أخرى أنها محرفة بشكل جوهري.`,
      i.otherInfoRead === false ? 'ولم تُتح لنا المعلومات الأخرى قبل تاريخ هذا التقرير؛ وعندما نقرؤها، إذا استنتجنا وجود تحريف جوهري فيها، فإنه يتعين علينا إبلاغ المكلفين بالحوكمة بالأمر.'
        : 'وإذا استنتجنا، بناءً على العمل الذي قمنا به، وجود تحريف جوهري في هذه المعلومات الأخرى، فإنه يتعين علينا التقرير عن تلك الحقيقة. وليس لدينا ما نقرره في هذا الشأن.'] },
    { title: `مسؤوليات ${board} والمكلفين بالحوكمة عن ${fs}`, paragraphs: [
      `إن ${board} هو المسؤول عن إعداد ${fs} وعرضها بعدل وفقاً ${lam(fw)}${law ? ' ' + law : ''}، وعن الرقابة الداخلية التي يراها ضرورية لتمكينه من إعداد ${fs} خالية من تحريف جوهري، سواء بسبب غش أو خطأ.`,
      `وعند إعداد ${fs}، فإن ${board} هو المسؤول عن تقييم قدرة ${ent} على البقاء كمنشأة مستمرة، وعن الإفصاح، بحسب ما يقتضيه الحال، عن الأمور ذات العلاقة بالاستمرارية، واستخدام أساس الاستمرارية في المحاسبة، ما لم يكن لديه نية لتصفية ${ent} أو إيقاف عملياتها، أو ليس لديه خيار واقعي بخلاف ذلك.`,
      `والمكلفون بالحوكمة هم المسؤولون عن الإشراف على آلية التقرير المالي في ${ent}.`] },
    { title: `مسؤوليات المراجع عن مراجعة ${fs}`, paragraphs: [
      `تتمثل أهدافنا في الحصول على تأكيد معقول عما إذا كانت ${fs} ككل خالية من تحريف جوهري، سواء بسبب غش أو خطأ، وإصدار تقرير المراجع الذي يتضمن رأينا. والتأكيد المعقول هو مستوى عالٍ من التأكيد، إلا أنه ليس ضماناً على أن المراجعة التي تُنفذ وفقاً ${lam(isa)} ستكشف دائماً عن التحريف الجوهري عند وجوده. ويمكن أن تنشأ التحريفات عن غش أو خطأ، وتُعد جوهرية إذا كان يمكن بشكل معقول توقع أنها ستؤثر، منفردة أو في مجملها، على القرارات الاقتصادية التي يتخذها المستخدمون على أساس هذه ${fs}.`,
      `وكجزء من المراجعة وفقاً ${lam(isa)}، فإننا نمارس الحكم المهني ونحافظ على نزعة الشك المهني خلال المراجعة. كما نقوم بما يلي:`,
      `• تحديد مخاطر التحريف الجوهري في ${fs} وتقييمها، سواء بسبب غش أو خطأ، وتصميم وتنفيذ إجراءات مراجعة استجابةً لتلك المخاطر، والحصول على أدلة مراجعة كافية ومناسبة لتوفير أساس لرأينا. ويُعد خطر عدم اكتشاف تحريف جوهري ناتج عن غش أعلى من الخطر الناتج عن خطأ، لأن الغش قد ينطوي على تواطؤ أو تزوير أو حذف متعمد أو إفادات مضللة أو تجاوز للرقابة الداخلية.`,
      `• الحصول على فهم للرقابة الداخلية ذات الصلة بالمراجعة لتصميم إجراءات مراجعة مناسبة للظروف، وليس بغرض إبداء رأي في فاعلية الرقابة الداخلية ${lam(ent)}.`,
      `• تقييم مدى مناسبة السياسات المحاسبية المستخدمة، ومدى معقولية التقديرات المحاسبية والإفصاحات ذات العلاقة التي قام بها ${board}.`,
      `• استنتاج مدى مناسبة استخدام ${board} لأساس الاستمرارية في المحاسبة، واستناداً إلى أدلة المراجعة التي تم الحصول عليها، ما إذا كان هناك عدم تأكد جوهري متعلق بأحداث أو ظروف قد تثير شكاً كبيراً في قدرة ${ent} على البقاء كمنشأة مستمرة. وإذا استنتجنا وجود عدم تأكد جوهري، فإنه يتعين علينا لفت الانتباه في تقريرنا إلى الإفصاحات ذات العلاقة في ${fs}، أو تعديل رأينا إذا كانت تلك الإفصاحات غير كافية. وتستند استنتاجاتنا إلى أدلة المراجعة التي تم الحصول عليها حتى تاريخ تقريرنا، ومع ذلك فإن أحداثاً أو ظروفاً مستقبلية قد تتسبب في توقف ${ent} عن البقاء كمنشأة مستمرة.`,
      `• تقييم العرض العام ل${fs} وهيكلها ومحتواها، بما في ذلك الإفصاحات، وما إذا كانت ${fs} تعبر عن المعاملات والأحداث التي تمثلها بطريقة تحقق العرض العادل.`,
      ...(g ? [`• تخطيط مراجعة المجموعة وتنفيذها للحصول على أدلة مراجعة كافية ومناسبة فيما يتعلق بالمعلومات المالية للمنشآت أو وحدات الأعمال داخل المجموعة كأساس لتكوين رأي في ${fs}. ونحن مسؤولون عن توجيه أعمال المراجعة المنفذة لأغراض مراجعة المجموعة والإشراف عليها وفحصها، ونظل المسؤولين الوحيدين عن رأينا.`] : []),
      'ونتواصل مع المكلفين بالحوكمة فيما يتعلق، من بين أمور أخرى، بالنطاق والتوقيت المخطط للمراجعة والنتائج المهمة للمراجعة، بما في ذلك أي أوجه قصور مهمة في الرقابة الداخلية نكتشفها أثناء المراجعة.',
      'ونقدم أيضاً للمكلفين بالحوكمة بياناً بأننا قد التزمنا بالمتطلبات الأخلاقية ذات الصلة بالاستقلال، ونبلغهم بجميع العلاقات والأمور الأخرى التي قد يُعتقد بشكل معقول أنها تؤثر على استقلالنا، وبحسب مقتضى الحال، بالإجراءات المتخذة لإزالة المخاطر أو الضمانات المطبقة.',
      `ومن الأمور التي تم إبلاغها للمكلفين بالحوكمة، نحدد تلك الأمور التي كانت لها الأهمية القصوى عند مراجعة ${fs} للفترة الحالية، وبناءً على ذلك تُعد الأمور الرئيسية للمراجعة. ونوضح هذه الأمور في تقريرنا ما لم يمنع نظام أو لائحة الإفصاح العلني عن الأمر، أو عندما نقرر، في ظروف نادرة للغاية، أن الأمر لا ينبغي الإبلاغ عنه في تقريرنا لأنه من المتوقع بشكل معقول أن تفوق التبعات السلبية لذلك منافع المصلحة العامة من هذا الإبلاغ.`] },
    ...(ae ? [{ title: 'التقرير عن المتطلبات القانونية والتنظيمية الأخرى', paragraphs: ['وفقاً لمتطلبات المرسوم بقانون اتحادي رقم (32) لسنة 2021 نفيد بما يلي:',
      '• أننا قد حصلنا على جميع المعلومات والإيضاحات التي اعتبرناها ضرورية لأغراض مراجعتنا؛',
      `• أن ${fs} قد أُعدت، من جميع الجوانب الجوهرية، وفقاً للأحكام المعمول بها في المرسوم بقانون اتحادي رقم (32) لسنة 2021؛`,
      `• أن ${ent} قد احتفظت بدفاتر محاسبية منتظمة، وأن المعلومات المالية الواردة في تقرير ${board} تتفق مع دفاتر ${ent} المحاسبية؛`,
      `• أنه، استناداً إلى المعلومات التي أتيحت لنا، لم يلفت انتباهنا ما يجعلنا نعتقد أن ${ent} قد خالفت خلال السنة أياً من الأحكام المعمول بها في المرسوم بقانون أو نظامها الأساسي بشكل قد يؤثر جوهرياً على أنشطتها أو مركزها المالي.`] }] : []),
    ...(eg ? [{ title: 'تقرير عن المتطلبات القانونية والتنظيمية الأخرى', paragraphs: [
      'تمسك الشركة حسابات مالية منتظمة تتضمن كل ما نص القانون ونظام الشركة على وجوب إثباته فيها، وقد وُجدت القوائم المالية متفقة مع ما هو وارد بتلك الحسابات.',
      'وقد تم جرد المخزون بمعرفة إدارة الشركة وفقاً للأصول المرعية.',
      'والبيانات المالية الواردة بتقرير مجلس الإدارة المُعد وفقاً لمتطلبات قانون الشركات ولائحته التنفيذية متفقة مع ما هو وارد بدفاتر الشركة وذلك في الحدود التي تثبت بها مثل تلك البيانات في الدفاتر.'] }] : []),
  ];
  return { title: 'تقرير المراجع المستقل', addressee: `إلى السادة ${eg ? 'مساهمي' : 'المساهمين في'} ${co}`, sections,
    signature: { firm: i.firm || '[اسم مكتب المراجعة]', partner: i.partner || '[اسم الشريك]', licence: i.licence || '[رقم الترخيص]', city: i.city || (eg ? 'القاهرة' : ae ? 'دبي' : 'الرياض'), date: i.date || '[تاريخ التقرير]' },
    draft: true };
}
