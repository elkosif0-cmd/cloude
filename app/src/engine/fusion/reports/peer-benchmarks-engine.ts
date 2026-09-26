/* Global peer benchmarks — the headline figures of eight groups, transcribed from the primary statements
   in the research bundle (global_financial_and_audit_research_bundle_extended_verified.pdf), each with the
   bundle page of its income statement, balance sheet and cash-flow statement. Figures are in millions of
   the reporting currency as published; only ratios are compared, so currencies never mix.
   Chosen for a food-trading business in Saudi Arabia: food and consumer goods (Nestlé, Unilever, PepsiCo,
   P&G), retail (Walmart, Home Depot, Amazon) and the Kingdom's largest reporter (Aramco).
   Comparison is context, not a target: scale, business model and framework differ (IFRS vs US GAAP). */
import { type FinancialStatements } from './statements-engine';

export type Peer = { id: string; company: string; sector: 'fmcg' | 'retail' | 'energy'; framework: 'IFRS' | 'US GAAP'; fy: string; currency: string;
  pages: { is: number; bs: number; cf: number; /** when the balance sheet runs onto a second page */ bsTo?: number };
  revenue: number; cogs: number | null; operating: number; net: number; assets: number; equity: number; ca: number; cl: number;
  inventory: number; receivables: number; payables: number; payablesScope: 'trade' | 'trade-and-other'; cfo: number; capex: number; cash: number };

export const PEERS: Peer[] = [
  { id: 'nestle-2025', company: 'Nestlé', sector: 'fmcg', framework: 'IFRS', fy: 'FY2025', currency: 'CHF', pages: { is: 2210, bs: 2212, bsTo: 2213, cf: 2214 },
    revenue: 89490, cogs: 48694, operating: 12277, net: 9254, assets: 127151, equity: 33058, ca: 31969, cl: 40694, inventory: 12813, receivables: 10561, payables: 20023, payablesScope: 'trade-and-other', cfo: 15904, capex: 4527, cash: 4579 },
  { id: 'unilever-2025', company: 'Unilever', sector: 'fmcg', framework: 'IFRS', fy: 'FY2025', currency: 'EUR', pages: { is: 5231, bs: 5234, cf: 5235 },
    revenue: 50503, cogs: null, operating: 9037, net: 6213, assets: 70471, equity: 17587, ca: 17066, cl: 21662, inventory: 4043, receivables: 7346, payables: 16939, payablesScope: 'trade-and-other', cfo: 8350, capex: 1417, cash: 3941 },
  { id: 'pepsico-2025', company: 'PepsiCo', sector: 'fmcg', framework: 'US GAAP', fy: 'FY2025', currency: 'USD', pages: { is: 1884, bs: 1888, cf: 1886 },
    revenue: 93925, cogs: 43066, operating: 11498, net: 8295, assets: 107399, equity: 20547, ca: 27949, cl: 32764, inventory: 5845, receivables: 11506, payables: 25903, payablesScope: 'trade-and-other', cfo: 12087, capex: 4415, cash: 9159 },
  { id: 'pg-2026', company: 'Procter & Gamble', sector: 'fmcg', framework: 'US GAAP', fy: 'FY2026', currency: 'USD', pages: { is: 2004, bs: 2005, cf: 2007 },
    revenue: 87032, cogs: 43362, operating: 19748, net: 16144, assets: 126521, equity: 54311, ca: 26208, cl: 38694, inventory: 8170, receivables: 6056, payables: 16306, payablesScope: 'trade', cfo: 19556, capex: 4409, cash: 9942 },
  { id: 'walmart-2023', company: 'Walmart', sector: 'retail', framework: 'US GAAP', fy: 'FY2023', currency: 'USD', pages: { is: 402, bs: 404, cf: 406 },
    revenue: 611289, cogs: 463721, operating: 20428, net: 11292, assets: 243197, equity: 83754, ca: 75655, cl: 92198, inventory: 56576, receivables: 7933, payables: 53742, payablesScope: 'trade', cfo: 28841, capex: 16857, cash: 8625 },
  { id: 'homedepot-2025', company: 'The Home Depot', sector: 'retail', framework: 'US GAAP', fy: 'FY2025', currency: 'USD', pages: { is: 2087, bs: 2086, cf: 2090 },
    revenue: 164683, cogs: 109818, operating: 20890, net: 14156, assets: 105095, equity: 12813, ca: 34391, cl: 32424, inventory: 25817, receivables: 5597, payables: 11491, payablesScope: 'trade', cfo: 16325, capex: 3679, cash: 1389 },
  { id: 'amazon-2024', company: 'Amazon', sector: 'retail', framework: 'US GAAP', fy: 'FY2024', currency: 'USD', pages: { is: 1065, bs: 1067, cf: 1064 },
    revenue: 637959, cogs: 326288, operating: 68593, net: 59248, assets: 624894, equity: 285970, ca: 190867, cl: 179431, inventory: 34214, receivables: 55451, payables: 94363, payablesScope: 'trade', cfo: 115877, capex: 82999, cash: 78779 },
  { id: 'aramco-2025', company: 'Saudi Aramco', sector: 'energy', framework: 'IFRS', fy: 'FY2025', currency: 'SAR', pages: { is: 10171, bs: 10173, cf: 10175 },
    revenue: 1559342, cogs: null, operating: 706822, net: 350210, assets: 2551964, equity: 1721744, ca: 596277, cl: 298349, inventory: 70542, receivables: 165444, payables: 157708, payablesScope: 'trade-and-other', cfo: 510798, capex: 190444, cash: 243099 },
];

export type MetricKey = 'grossMargin' | 'operatingMargin' | 'netMargin' | 'roe' | 'roa' | 'currentRatio' | 'equityRatio' | 'dso' | 'dio' | 'dpo' | 'cashConversion' | 'capexIntensity' | 'fcfMargin';
export const METRICS: { key: MetricKey; ar: string; unit: '%' | 'x' | 'days'; higherIsBetter: boolean | null; formula: string }[] = [
  { key: 'grossMargin', ar: 'هامش مجمل الربح', unit: '%', higherIsBetter: true, formula: '(الإيرادات − تكلفة الإيرادات) ÷ الإيرادات' },
  { key: 'operatingMargin', ar: 'هامش الربح التشغيلي', unit: '%', higherIsBetter: true, formula: 'الربح التشغيلي ÷ الإيرادات' },
  { key: 'netMargin', ar: 'هامش صافي الربح', unit: '%', higherIsBetter: true, formula: 'صافي الربح ÷ الإيرادات' },
  { key: 'roe', ar: 'العائد على حقوق الملكية', unit: '%', higherIsBetter: true, formula: 'صافي الربح ÷ حقوق الملكية في نهاية السنة' },
  { key: 'roa', ar: 'العائد على الموجودات', unit: '%', higherIsBetter: true, formula: 'صافي الربح ÷ مجموع الموجودات' },
  { key: 'currentRatio', ar: 'نسبة التداول', unit: 'x', higherIsBetter: null, formula: 'الموجودات المتداولة ÷ المطلوبات المتداولة' },
  { key: 'equityRatio', ar: 'نسبة حقوق الملكية إلى الموجودات', unit: '%', higherIsBetter: null, formula: 'حقوق الملكية ÷ مجموع الموجودات' },
  { key: 'dso', ar: 'أيام التحصيل', unit: 'days', higherIsBetter: false, formula: 'الذمم المدينة ÷ الإيرادات × 365' },
  { key: 'dio', ar: 'أيام المخزون', unit: 'days', higherIsBetter: false, formula: 'المخزون ÷ تكلفة الإيرادات × 365' },
  { key: 'dpo', ar: 'أيام السداد للموردين', unit: 'days', higherIsBetter: null, formula: 'الذمم الدائنة التجارية ÷ تكلفة الإيرادات × 365' },
  { key: 'cashConversion', ar: 'تحويل الربح إلى نقد', unit: 'x', higherIsBetter: true, formula: 'صافي النقد من التشغيل ÷ صافي الربح' },
  { key: 'capexIntensity', ar: 'كثافة الإنفاق الرأسمالي', unit: '%', higherIsBetter: null, formula: 'الإنفاق الرأسمالي ÷ الإيرادات' },
  { key: 'fcfMargin', ar: 'هامش التدفق النقدي الحر', unit: '%', higherIsBetter: true, formula: '(النقد من التشغيل − الإنفاق الرأسمالي) ÷ الإيرادات' },
];

type Inputs = { revenue: number; cogs: number | null; operating: number; net: number; assets: number; equity: number; ca: number; cl: number;
  inventory: number; receivables: number; payables: number | null; cfo: number | null; capex: number | null };
const r1 = (x: number) => Math.round(x * 10) / 10, r2 = (x: number) => Math.round(x * 100) / 100;
const div = (a: number | null, b: number | null) => (a === null || b === null || !b ? null : a / b);
export function metricsOf(i: Inputs): Record<MetricKey, number | null> {
  const p = (x: number | null) => (x === null ? null : r1(x * 100)), d = (x: number | null) => (x === null ? null : Math.round(x * 365)), x2 = (x: number | null) => (x === null ? null : r2(x));
  return {
    grossMargin: p(i.cogs === null ? null : div(i.revenue - i.cogs, i.revenue)), operatingMargin: p(div(i.operating, i.revenue)), netMargin: p(div(i.net, i.revenue)),
    roe: p(i.equity > 0 ? div(i.net, i.equity) : null), roa: p(div(i.net, i.assets)), currentRatio: x2(div(i.ca, i.cl)), equityRatio: p(div(i.equity, i.assets)),
    dso: d(div(i.receivables, i.revenue)), dio: d(div(i.inventory, i.cogs)), dpo: d(div(i.payables, i.cogs)),
    cashConversion: x2(i.net > 0 ? div(i.cfo, i.net) : null), capexIntensity: p(div(i.capex, i.revenue)),
    fcfMargin: p(i.cfo === null || i.capex === null ? null : div(i.cfo - i.capex, i.revenue)),
  };
}
export const peerMetrics = (p: Peer) => metricsOf({ ...p, payables: p.payablesScope === 'trade' ? p.payables : null });

/** The engagement's own inputs from its statements (capex as a positive outflow). */
export function inputsFromStatements(fs: FinancialStatements): Inputs {
  const k = fs.keys;
  return { revenue: k.revenue.current, cogs: k.cogs.current || null, operating: k.operating.current, net: k.profit.current, assets: k.assets.current, equity: k.equity.current,
    ca: k.ca.current, cl: k.cl.current, inventory: k.inventory?.current ?? 0, receivables: k.receivables?.current ?? 0, payables: k.payables?.current ?? null,
    cfo: k.cfo?.current ?? null, capex: k.capex ? -k.capex.current : null };
}

const median = (xs: number[]) => { const s = [...xs].sort((a, b) => a - b), m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : r2((s[m - 1] + s[m]) / 2); };
export type Comparison = { key: MetricKey; ar: string; unit: '%' | 'x' | 'days'; formula: string; you: number | null; median: number | null; min: number | null; max: number | null;
  n: number; position: 'above' | 'below' | 'within' | 'n/a'; verdict: 'better' | 'weaker' | 'typical' | 'n/a'; peers: { company: string; value: number }[] };
/** Your ratios against the peer group (optionally one sector): the median, the range and where you sit. */
export function compare(fs: FinancialStatements | null, opts: { sector?: Peer['sector'] | '' } = {}): Comparison[] {
  const group = PEERS.filter((p) => !opts.sector || p.sector === opts.sector), mine = fs ? metricsOf(inputsFromStatements(fs)) : null;
  return METRICS.map((m) => {
    const peers = group.map((p) => ({ company: p.company, value: peerMetrics(p)[m.key] })).filter((x): x is { company: string; value: number } => x.value !== null);
    const vals = peers.map((x) => x.value), you = mine ? mine[m.key] : null;
    const round = (x: number) => (m.unit === 'days' ? Math.round(x) : m.unit === '%' ? r1(x) : r2(x));
    const min = vals.length ? Math.min(...vals) : null, max = vals.length ? Math.max(...vals) : null, med = vals.length ? round(median(vals)) : null;
    const position = you === null || min === null || max === null ? 'n/a' : you > max ? 'above' : you < min ? 'below' : 'within';
    const verdict = position === 'n/a' || med === null || you === null || m.higherIsBetter === null ? (position === 'n/a' ? 'n/a' : 'typical')
      : Math.abs(you - med) <= Math.abs(med) * 0.1 ? 'typical' : (you > med) === m.higherIsBetter ? 'better' : 'weaker';
    return { key: m.key, ar: m.ar, unit: m.unit, formula: m.formula, you, median: med, min, max, n: vals.length, position, verdict, peers };
  });
}
