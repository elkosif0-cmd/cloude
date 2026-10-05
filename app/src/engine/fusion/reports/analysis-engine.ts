/* Financial analysis on the statements engine — what a global annual report and an auditor's
   analytical review (ISA 520) look at: ratios with comparatives, common-size and horizontal analysis,
   DuPont, Altman Z″ (non-manufacturers / emerging markets), Beneish M (two years), Benford first
   digit (Nigrini MAD), key highlights and a deterministic management discussion (MD&A).
   Ported from kosif-audit-pro (analysis.mjs, analytics-v52: financialRatios, benfordFirstDigit,
   altmanZScore) and Moon; every figure is derived from the trial balance, never typed. */
import { type Minor } from './money-engine';
import { type FinancialStatements } from './statements-engine';

export type RatioGroup = 'liquidity' | 'profitability' | 'efficiency' | 'leverage' | 'cash';
export type Ratio = { key: string; group: RatioGroup; ar: string; en: string; unit: '%' | 'x' | 'days';
  current: number | null; prior: number | null; better: 'up' | 'down'; formula: string };

const r2 = (n: number) => Math.round(n * 100) / 100;
const div = (a: number, b: number) => (b ? a / b : null);
const pctOf = (a: number, b: number) => { const x = div(a, b); return x === null ? null : r2(x * 100); };
const times = (a: number, b: number) => { const x = div(a, b); return x === null ? null : r2(x); };
const days = (a: number, b: number) => { const x = div(a, b); return x === null ? null : Math.round(x * 365); };

type Snap = { revenue: Minor; cogs: Minor; gross: Minor; operating: Minor; pbz: Minor; finance: Minor; profit: Minor; assets: Minor;
  ca: Minor; cl: Minor; cash: Minor; inventory: Minor; receivables: Minor; payables: Minor; equity: Minor; debt: Minor; liabilities: Minor; ppe: Minor };

function snap(fs: FinancialStatements, prior: boolean): Snap | null {
  if (prior && !fs.hasPrior) return null;
  const k = (key: string) => { const x = fs.keys[key]; return x ? (prior ? x.prior ?? 0 : x.current) : 0; };
  return { revenue: k('revenue'), cogs: k('cogs'), gross: k('gross'), operating: k('operating'), pbz: k('pbz'), finance: k('finance'), profit: k('profit'),
    assets: k('assets'), ca: k('ca'), cl: k('cl'), cash: k('cash'), inventory: k('inventory'), receivables: k('receivables'), payables: k('payables'),
    equity: k('equity'), debt: k('loansCl') + k('loansNcl') + k('leaseNcl'), liabilities: k('liabilities'), ppe: k('ppe') };
}

/** Ratios of one year (s) — averages use the prior year when present (ROE, turnover). */
function ratiosOf(s: Snap, p: Snap | null, cfo: Minor | null, capex: Minor | null) {
  const avg = (a: number, b: number | undefined) => (b === undefined ? a : (a + b) / 2);
  const netDebt = s.debt - s.cash;
  return {
    current: times(s.ca, s.cl), quick: times(s.ca - s.inventory, s.cl), cashRatio: times(s.cash, s.cl),
    grossMargin: pctOf(s.gross, s.revenue), operatingMargin: pctOf(s.operating, s.revenue), netMargin: pctOf(s.profit, s.revenue),
    roa: pctOf(s.profit, avg(s.assets, p?.assets)), roe: pctOf(s.profit, avg(s.equity, p?.equity)),
    roce: pctOf(s.operating, avg(s.assets - s.cl, p ? p.assets - p.cl : undefined)),
    dso: days(s.receivables, s.revenue), dio: days(s.inventory, s.cogs), dpo: days(s.payables, s.cogs),
    assetTurnover: times(s.revenue, avg(s.assets, p?.assets)),
    debtToEquity: times(s.debt, s.equity), gearing: pctOf(netDebt, netDebt + s.equity), liabilitiesToAssets: pctOf(s.liabilities, s.assets),
    interestCover: s.finance ? times(s.operating, s.finance) : null,
    cfoToProfit: cfo === null ? null : times(cfo, s.profit), fcf: cfo === null ? null : cfo + (capex ?? 0), cfoMargin: cfo === null ? null : pctOf(cfo, s.revenue),
  };
}

const DEF: [string, RatioGroup, string, string, Ratio['unit'], Ratio['better'], string][] = [
  ['current', 'liquidity', 'نسبة التداول', 'Current ratio', 'x', 'up', 'الموجودات المتداولة ÷ المطلوبات المتداولة'],
  ['quick', 'liquidity', 'النسبة السريعة', 'Quick ratio', 'x', 'up', '(المتداولة − المخزون) ÷ المطلوبات المتداولة'],
  ['cashRatio', 'liquidity', 'نسبة النقدية', 'Cash ratio', 'x', 'up', 'النقد ÷ المطلوبات المتداولة'],
  ['grossMargin', 'profitability', 'هامش مجمل الربح', 'Gross margin', '%', 'up', 'مجمل الربح ÷ الإيرادات'],
  ['operatingMargin', 'profitability', 'هامش الربح التشغيلي', 'Operating margin', '%', 'up', 'الربح التشغيلي ÷ الإيرادات (IFRS 18)'],
  ['netMargin', 'profitability', 'هامش صافي الربح', 'Net margin', '%', 'up', 'صافي الربح ÷ الإيرادات'],
  ['roa', 'profitability', 'العائد على الموجودات', 'Return on assets', '%', 'up', 'صافي الربح ÷ متوسط الموجودات'],
  ['roe', 'profitability', 'العائد على حقوق الملكية', 'Return on equity', '%', 'up', 'صافي الربح ÷ متوسط حقوق الملكية'],
  ['roce', 'profitability', 'العائد على رأس المال المستخدم', 'Return on capital employed', '%', 'up', 'الربح التشغيلي ÷ متوسط (الموجودات − المطلوبات المتداولة)'],
  ['dso', 'efficiency', 'أيام التحصيل', 'Days sales outstanding', 'days', 'down', 'الذمم المدينة ÷ الإيرادات × 365'],
  ['dio', 'efficiency', 'أيام المخزون', 'Days inventory outstanding', 'days', 'down', 'المخزون ÷ تكلفة الإيرادات × 365'],
  ['dpo', 'efficiency', 'أيام السداد للموردين', 'Days payables outstanding', 'days', 'up', 'الذمم الدائنة ÷ تكلفة الإيرادات × 365'],
  ['ccc', 'efficiency', 'دورة التحويل النقدي', 'Cash conversion cycle', 'days', 'down', 'أيام التحصيل + أيام المخزون − أيام السداد'],
  ['assetTurnover', 'efficiency', 'معدل دوران الموجودات', 'Asset turnover', 'x', 'up', 'الإيرادات ÷ متوسط الموجودات'],
  ['debtToEquity', 'leverage', 'الديون إلى حقوق الملكية', 'Debt to equity', 'x', 'down', 'القروض والتزامات الإيجار ÷ حقوق الملكية'],
  ['gearing', 'leverage', 'نسبة المديونية (Gearing)', 'Gearing', '%', 'down', 'صافي الدين ÷ (صافي الدين + حقوق الملكية)'],
  ['liabilitiesToAssets', 'leverage', 'المطلوبات إلى الموجودات', 'Liabilities to assets', '%', 'down', 'مجموع المطلوبات ÷ مجموع الموجودات'],
  ['interestCover', 'leverage', 'تغطية تكاليف التمويل', 'Interest cover', 'x', 'up', 'الربح التشغيلي ÷ تكاليف التمويل'],
  ['cfoToProfit', 'cash', 'جودة الأرباح (التشغيلي ÷ الربح)', 'Cash conversion of profit', 'x', 'up', 'صافي النقد من التشغيل ÷ صافي الربح'],
  ['cfoMargin', 'cash', 'هامش التدفق التشغيلي', 'Operating cash-flow margin', '%', 'up', 'صافي النقد من التشغيل ÷ الإيرادات'],
];

export function ratios(fs: FinancialStatements): Ratio[] {
  const s = snap(fs, false)!, p = snap(fs, true);
  const cur = ratiosOf(s, p, fs.keys.cfo?.current ?? null, fs.keys.capex?.current ?? null);
  const pri = p ? ratiosOf(p, null, null, null) : null;
  const ccc = (x: typeof cur | null) => (x && x.dso !== null && x.dio !== null && x.dpo !== null ? x.dso + x.dio - x.dpo : null);
  return DEF.map(([key, group, ar, en, unit, better, formula]) => ({ key, group, ar, en, unit, better, formula,
    current: key === 'ccc' ? ccc(cur) : ((cur as Record<string, number | null>)[key] ?? null),
    prior: key === 'ccc' ? ccc(pri) : pri ? ((pri as Record<string, number | null>)[key] ?? null) : null }));
}

/** Free cash flow (Aramco-style KPI): operating cash flow + capital expenditure (negative). */
export function freeCashFlow(fs: FinancialStatements): Minor | null {
  return fs.keys.cfo ? fs.keys.cfo.current + (fs.keys.capex?.current ?? 0) : null;
}

/** Common-size: P&L lines as % of revenue, position lines as % of total assets. */
export function commonSize(fs: FinancialStatements) {
  const rev = fs.keys.revenue, ta = fs.keys.assets;
  const pc = (a: Minor, b: Minor | null | undefined) => (b ? r2((a / b) * 100) : null);
  return {
    pl: fs.pl.map((r) => ({ key: r.key, ar: r.ar, current: pc(r.current, rev.current), prior: r.prior === null ? null : pc(r.prior, rev.prior) })),
    sfp: fs.sfp.filter((r) => r.level !== 'heading').map((r) => ({ key: r.key, ar: r.ar, current: pc(r.current, ta.current), prior: r.prior === null ? null : pc(r.prior, ta.prior) })),
  };
}

/** Horizontal: change and % change of every line against the prior year. */
export function horizontal(fs: FinancialStatements) {
  if (!fs.hasPrior) return [];
  return [...fs.pl, ...fs.sfp].filter((r) => r.level !== 'heading' && r.prior !== null).map((r) => ({
    key: r.key, ar: r.ar, current: r.current, prior: r.prior as Minor, change: r.current - (r.prior as Minor),
    changePct: r.prior ? r2(((r.current - (r.prior as Minor)) / Math.abs(r.prior as Minor)) * 100) : null,
  }));
}

/** DuPont: ROE = net margin × asset turnover × equity multiplier (year-end balances). */
export function dupont(fs: FinancialStatements) {
  const k = fs.keys, one = (rev: Minor, profit: Minor, ta: Minor, eq: Minor) => {
    const nm = div(profit, rev), at = div(rev, ta), em = div(ta, eq);
    return { netMargin: nm === null ? null : r2(nm * 100), assetTurnover: at === null ? null : r2(at), equityMultiplier: em === null ? null : r2(em),
      roe: nm === null || at === null || em === null ? null : r2(nm * at * em * 100) };
  };
  return { current: one(k.revenue.current, k.profit.current, k.assets.current, k.equity.current),
    prior: fs.hasPrior ? one(k.revenue.prior ?? 0, k.profit.prior ?? 0, k.assets.prior ?? 0, k.equity.prior ?? 0) : null };
}

/** Altman Z″ (1995, non-manufacturing and emerging-market firms): 6.56·X1 + 3.26·X2 + 6.72·X3 + 1.05·X4. */
export function altmanZ(fs: FinancialStatements) {
  const k = fs.keys, ta = k.assets.current, tl = k.liabilities.current;
  if (!ta) return null;
  const retained = fs.lines.filter((l) => l.key === 'retained').reduce((a, l) => a + l.current, 0) + k.profit.current;
  const x1 = (k.ca.current - k.cl.current) / ta, x2 = retained / ta, x3 = k.operating.current / ta, x4 = tl ? k.equity.current / tl : 0;
  const z = r2(6.56 * x1 + 3.26 * x2 + 6.72 * x3 + 1.05 * x4);
  return { z, zone: z > 2.6 ? 'safe' : z >= 1.1 ? 'grey' : 'distress' as 'safe' | 'grey' | 'distress',
    zoneAr: z > 2.6 ? 'منطقة الأمان' : z >= 1.1 ? 'المنطقة الرمادية' : 'منطقة التعثر',
    components: { x1: r2(x1), x2: r2(x2), x3: r2(x3), x4: r2(x4) } };
}

/** Beneish M-score (8 variables) — needs the prior year. M > −1.78 flags possible earnings manipulation. */
export function beneishM(fs: FinancialStatements) {
  if (fs.sourceKind === 'published-statements' && (!fs.keys.cfo || !fs.lines.some(l => l.key === 'depreciation'))) return null;
  if (!fs.hasPrior) return null;
  const k = fs.keys, c = (x: string) => k[x]?.current ?? 0, p = (x: string) => k[x]?.prior ?? 0;
  const q = (a: number, b: number) => (b ? a / b : 1);
  const sga = (f: (x: string) => number) => f('selling') + f('admin');
  const dsri = q(q(c('receivables'), c('revenue')), q(p('receivables'), p('revenue')));
  const gmi = q(q(p('gross'), p('revenue')), q(c('gross'), c('revenue')));
  const aqi = q(1 - q(c('ca') + c('ppe'), c('assets')), 1 - q(p('ca') + p('ppe'), p('assets')));
  const sgi = q(c('revenue'), p('revenue'));
  const depi = q(q(p('depreciation'), p('depreciation') + p('ppe')), q(c('depreciation'), c('depreciation') + c('ppe')));
  const sgai = q(q(sga(c), c('revenue')), q(sga(p), p('revenue')));
  const lvgi = q(q(c('cl') + c('loansNcl') + c('leaseNcl'), c('assets')), q(p('cl') + p('loansNcl') + p('leaseNcl'), p('assets')));
  const tata = fs.keys.cfo ? q(c('profit') - fs.keys.cfo.current, c('assets')) : 0;
  const m = r2(-4.84 + 0.92 * dsri + 0.528 * gmi + 0.404 * aqi + 0.892 * sgi + 0.115 * depi - 0.172 * sgai + 4.679 * tata - 0.327 * lvgi);
  const f = (x: number) => Math.round(x * 1000) / 1000;
  return { m, flagged: m > -1.78, components: { dsri: f(dsri), gmi: f(gmi), aqi: f(aqi), sgi: f(sgi), depi: f(depi), sgai: f(sgai), lvgi: f(lvgi), tata: f(tata) } };
}

/** Benford first digit with Nigrini's mean absolute deviation conformity bands. */
export function benford(amounts: Minor[]) {
  const firsts = amounts.map((a) => Math.abs(a)).filter((a) => a >= 1000).map((a) => Number(String(a)[0]));
  const n = firsts.length, counts = Array(10).fill(0);
  firsts.forEach((d) => { counts[d]++; });
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => { const expected = Math.log10(1 + 1 / d), actual = n ? counts[d] / n : 0;
    return { digit: d, count: counts[d], expected: Math.round(expected * 10000) / 10000, actual: Math.round(actual * 10000) / 10000 }; });
  const mad = n ? Math.round((digits.reduce((a, d) => a + Math.abs(d.actual - d.expected), 0) / 9) * 100000) / 100000 : null;
  const conformity = mad === null ? 'insufficient' : mad <= 0.006 ? 'close' : mad <= 0.012 ? 'acceptable' : mad <= 0.015 ? 'marginal' : 'nonconformity';
  const ar = { insufficient: 'بيانات غير كافية', close: 'مطابقة قريبة', acceptable: 'مطابقة مقبولة', marginal: 'مطابقة هامشية', nonconformity: 'عدم مطابقة' }[conformity];
  return { n, digits, mad, conformity, conformityAr: ar, reliable: n >= 300 };
}

/** «The year at a glance» — the KPI strip that opens a global annual report. */
export function highlights(fs: FinancialStatements) {
  const k = fs.keys, rs = ratios(fs), by = (x: string) => rs.find((r) => r.key === x)!;
  const money = (key: string, ar: string) => ({ key, ar, kind: 'money' as const, current: k[key]?.current ?? 0, prior: fs.hasPrior ? k[key]?.prior ?? 0 : null });
  const rat = (key: string) => { const r = by(key); return { key, ar: r.ar, kind: r.unit, current: r.current, prior: r.prior }; };
  const fcf = freeCashFlow(fs);
  const items = [money('revenue', 'الإيرادات'), money('gross', 'مجمل الربح'), money('operating', 'الربح التشغيلي'), money('profit', 'صافي الربح'),
    ...(k.cfo ? [money('cfo', 'النقد من التشغيل')] : []), ...(fcf !== null ? [{ key: 'fcf', ar: 'التدفق النقدي الحر', kind: 'money' as const, current: fcf, prior: null }] : []),
    rat('gearing'), rat('roe'), rat('current')];
  return items.map((i) => ({ ...i, change: i.prior === null || i.current === null || !i.prior ? null : r2(((i.current - i.prior) / Math.abs(i.prior)) * 100) }));
}

/** A deterministic management discussion: sentences generated from the numbers only. */
export function mdna(fs: FinancialStatements, opts: { currency?: string; risks?: string[] } = {}): { title: string; body: string[] }[] {
  const cur = opts.currency ?? 'ريال', k = fs.keys, rs = ratios(fs), by = (x: string) => rs.find((r) => r.key === x)!;
  const m = (v: Minor) => Math.round(v / 100).toLocaleString('en-US') + ' ' + cur;
  const ch = (key: string) => { const x = k[key]; if (!x || x.prior === null || !x.prior) return null; return r2(((x.current - x.prior) / Math.abs(x.prior)) * 100); };
  const dir = (v: number | null, up: string, down: string) => (v === null ? '' : v >= 0 ? `${up} ${Math.abs(v)}%` : `${down} ${Math.abs(v)}%`);
  const out: { title: string; body: string[] }[] = [];
  const rev = ch('revenue'), prof = ch('profit');
  out.push({ title: 'الأداء', body: [
    `بلغت الإيرادات ${m(k.revenue.current)}${rev === null ? '' : '، ' + dir(rev, 'بنمو', 'بانخفاض') + ' عن السنة السابقة'}.`,
    `هامش مجمل الربح ${by('grossMargin').current ?? '—'}%${by('grossMargin').prior !== null ? ' مقابل ' + by('grossMargin').prior + '%' : ''}، والهامش التشغيلي ${by('operatingMargin').current ?? '—'}%.`,
    `صافي ربح السنة ${m(k.profit.current)}${prof === null ? '' : '، ' + dir(prof, 'بارتفاع', 'بانخفاض')}؛ العائد على حقوق الملكية ${by('roe').current ?? '—'}%.`,
  ] });
  const cash: string[] = [];
  if (k.cfo) {
    const q = by('cfoToProfit').current, fcf = freeCashFlow(fs);
    cash.push(`ولّدت الأنشطة التشغيلية ${m(k.cfo.current)}${q !== null ? ` (${q} ضعف صافي الربح)` : ''}، والتدفق النقدي الحر ${fcf === null ? '—' : m(fcf)}.`);
    if (q !== null && q < 0.8) cash.push('التدفق التشغيلي أقل بوضوح من الربح المحاسبي — تستحق جودة الأرباح وتحصيل الذمم متابعة.');
  } else cash.push('لا تتوفر أرصدة السنة السابقة لاشتقاق قائمة التدفقات النقدية.');
  cash.push(`نسبة التداول ${by('current').current ?? '—'} مرة، ودورة التحويل النقدي ${by('ccc').current ?? '—'} يوماً.`);
  out.push({ title: 'السيولة والتدفقات النقدية', body: cash });
  const g = by('gearing').current, ic = by('interestCover').current;
  out.push({ title: 'هيكل التمويل', body: [
    `نسبة المديونية (صافي الدين إلى رأس المال) ${g === null ? '—' : g + '%'}${g !== null && g <= 0 ? ' — المنشأة في مركز نقدي صافٍ' : ''}.`,
    ic === null ? 'لا توجد تكاليف تمويل مسجلة.' : `يغطي الربح التشغيلي تكاليف التمويل ${ic} مرة.`,
  ] });
  const z = altmanZ(fs), b = beneishM(fs), risk: string[] = [];
  if (z) risk.push(`مؤشر Altman Z″ = ${z.z} (${z.zoneAr}).`);
  if (b) risk.push(`مؤشر Beneish M = ${b.m}${b.flagged ? ' — أعلى من حد −1.78: يستدعي تعميق فحص الإيرادات والذمم والاستحقاقات (ISA 240)' : ' — ضمن الحدود المعتادة'}.`);
  for (const x of opts.risks ?? []) risk.push(x);
  if (risk.length) out.push({ title: 'المخاطر والمؤشرات', body: risk });
  return out;
}
