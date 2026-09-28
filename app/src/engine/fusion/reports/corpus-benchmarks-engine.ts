/* Corpus benchmarks for the accountant — the company's own ratios against the 35 non-financial groups whose primary
   statements the research bundle carries (corpus-companies-engine, each with its bundle pages). Banks and insurers
   are left out: their revenue, receivables and payables mean something else.
   For every ratio: where the company sits in the corpus (quartile, median, range), the three closest companies, and,
   when it sits on the weak side, what an accountant checks first and which helper screen does that check.
   Comparison is context, not a target: scale, business model, framework (IFRS / US GAAP / others) and year differ.
   The bundle's statements carry no cash-flow lines here, so cash conversion and capex are not compared. */
import { SECTOR_AR, type Sector } from '../audit/global-benchmarks-engine';
import { corpusCompanies, type CorpusCompany } from './corpus-companies-engine';
import { inputsFromStatements, metricsOf, METRICS, type MetricKey } from './peer-benchmarks-engine';
import { type FinancialStatements } from './statements-engine';

/** The ratios the bundle's statements support (income statement and balance sheet only). */
export const KEYS: MetricKey[] = ['grossMargin', 'operatingMargin', 'netMargin', 'roe', 'roa', 'currentRatio', 'equityRatio', 'dso', 'dio', 'dpo'];

/* what to check first when a ratio sits on the weak side, and the helper screen that does it */
export const CHECKS: Partial<Record<MetricKey, { ar: string; screen: string; screenAr: string }>> = {
  grossMargin: { ar: 'راجع تكلفة الأصناف الأعلى مبيعاً وأسعار البيع مقابل التكلفة الفعلية، والهدر في الإنتاج', screen: 'costs', screenAr: 'التكاليف والمصروفات' },
  operatingMargin: { ar: 'حلّل المصروفات التشغيلية حسب البند مقابل الإيرادات، وابحث عن بنود نمت أسرع من المبيعات', screen: 'costs', screenAr: 'التكاليف والمصروفات' },
  netMargin: { ar: 'افصل أثر البنود غير المتكررة والتمويل والزكاة/الضريبة عن الربح التشغيلي', screen: 'execreports', screenAr: 'التقارير التنفيذية' },
  roe: { ar: 'قارن الربح بحقوق الملكية: هل الربح منخفض أم رأس المال غير مستغل؟', screen: 'finance', screenAr: 'الهندسة المالية' },
  roa: { ar: 'راجع الأصول غير المنتجة: مخزون راكد، ذمم متأخرة، أصول ثابتة غير مستخدمة', screen: 'inventory', screenAr: 'المخزون' },
  currentRatio: { ar: 'راجع توقيت التزامات الأجل القصير مقابل التحصيل المتوقع — خطة نقدية لـ 13 أسبوعاً', screen: 'cash', screenAr: 'التدفق النقدي' },
  equityRatio: { ar: 'راجع مصادر التمويل: قروض قصيرة تموّل أصولاً طويلة؟', screen: 'finance', screenAr: 'الهندسة المالية' },
  dso: { ar: 'راجع أعمار الذمم والعملاء المتأخرين وشروط الائتمان الممنوحة', screen: 'receivables', screenAr: 'الذمم والتحصيل' },
  dio: { ar: 'راجع الأصناف بطيئة الحركة والمنتهية الصلاحية واختبر صافي القيمة القابلة للتحقق', screen: 'inventory', screenAr: 'المخزون' },
};

const r1 = (x: number) => Math.round(x * 10) / 10, r2 = (x: number) => Math.round(x * 100) / 100;
/** Linear-interpolated quantile of a sorted list. */
export function quantile(sorted: number[], q: number) {
  if (!sorted.length) return null;
  const at = (sorted.length - 1) * q, lo = Math.floor(at), hi = Math.ceil(at);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (at - lo);
}

export type CorpusPeer = { id: string; company: string; sector: Sector; sectorAr: string; fy: string; framework: string; pages: { is: number; bs: number }; metrics: Record<MetricKey, number | null> };
/** The non-financial companies with their ratios (optionally one sector). */
export function corpusPeers(sector: Sector | '' = ''): CorpusPeer[] {
  return corpusCompanies()
    .filter((c: CorpusCompany) => c.figures.kind === 'corporate' && c.figures.rev && (!sector || c.sector === sector))
    .map((c) => {
      const f = c.figures, v = (p?: readonly [number, number]) => (p ? p[0] : 0);
      const m = metricsOf({ revenue: v(f.rev), cogs: f.cogs ? f.cogs[0] : null, operating: f.op ? f.op[0] : f.pbt[0], net: f.net[0], assets: f.assets[0], equity: f.equity[0],
        ca: v(f.ca), cl: v(f.cl), inventory: v(f.inv), receivables: v(f.recv), payables: f.pay ? f.pay[0] : null, cfo: null, capex: null });
      /* a ratio whose inputs the bundle does not break out is not a zero */
      if (!f.ca || !f.cl) m.currentRatio = null;
      if (!f.recv) m.dso = null;
      if (!f.inv || !f.cogs) m.dio = null;
      return { id: c.id, company: c.company, sector: c.sector, sectorAr: SECTOR_AR[c.sector], fy: c.fy, framework: c.framework, pages: f.pages, metrics: m };
    });
}
/** Sectors with at least `min` non-financial companies, for the sector filter. */
export function sectors(min = 3) {
  const n: Partial<Record<Sector, number>> = {};
  corpusPeers().forEach((p) => { n[p.sector] = (n[p.sector] ?? 0) + 1; });
  return (Object.entries(n) as [Sector, number][]).filter(([, k]) => k >= min).map(([id, k]) => ({ id, ar: SECTOR_AR[id], companies: k })).sort((a, b) => b.companies - a.companies);
}

export type Band = 'top' | 'upper' | 'lower' | 'bottom' | 'n/a';
export type Benchmark = { key: MetricKey; ar: string; unit: '%' | 'x' | 'days'; formula: string; higherIsBetter: boolean | null;
  you: number | null; n: number; p25: number | null; median: number | null; p75: number | null; min: number | null; max: number | null;
  /** the company's percentile in the corpus, 0–100 */ percentile: number | null; band: Band; weak: boolean;
  closest: { company: string; value: number; sectorAr: string; page: number }[]; check: { ar: string; screen: string; screenAr: string } | null;
  /** why the company's ratio is not compared (e.g. no receivables at period end: cash sales) */ note: string | null };

/* a zero balance at period end is not «the best collection days»: the ratio does not apply */
const ZERO_NOTE: Partial<Record<MetricKey, string>> = {
  dso: 'لا ذمم مدينة في نهاية الفترة (مبيعات نقدية) — لا تنطبق', dio: 'لا مخزون في نهاية الفترة — لا تنطبق', dpo: 'لا ذمم دائنة تجارية في نهاية الفترة — لا تنطبق',
};
/** The company's own ratios. The corpus is full years; a shorter period (e.g. the year to date) is put on the same
 *  basis: returns on the period's profit are annualised, and days are counted over the period's own length. */
export function companyMetrics(fs: FinancialStatements, periodDays = 365) {
  const i = inputsFromStatements(fs), m = metricsOf(i), notes: Partial<Record<MetricKey, string>> = {};
  const d = Math.max(1, Math.min(366, Math.round(periodDays))), toYear = 365 / d, toPeriod = d / 365;
  if (m.roe !== null) m.roe = r1(m.roe * toYear);
  if (m.roa !== null) m.roa = r1(m.roa * toYear);
  for (const k of ['dso', 'dio', 'dpo'] as const) if (m[k] !== null) m[k] = Math.round(m[k]! * toPeriod);
  if (!i.receivables) { m.dso = null; notes.dso = ZERO_NOTE.dso; }
  if (!i.inventory) { m.dio = null; notes.dio = ZERO_NOTE.dio; }
  if (!i.payables) { m.dpo = null; notes.dpo = ZERO_NOTE.dpo; }
  return { m, notes };
}

/** The company's ratios (from its statements) against the corpus. */
export function benchmark(fs: FinancialStatements | null, opts: { sector?: Sector | ''; periodDays?: number } = {}): Benchmark[] {
  const peers = corpusPeers(opts.sector ?? ''), own = fs ? companyMetrics(fs, opts.periodDays ?? 365) : null, mine = own ? own.m : null;
  return KEYS.map((key) => {
    const m = METRICS.find((x) => x.key === key)!;
    const rows = peers.filter((p) => p.metrics[key] !== null).map((p) => ({ p, v: p.metrics[key] as number }));
    const vals = rows.map((r) => r.v).sort((a, b) => a - b), you = mine ? mine[key] : null;
    const round = (x: number | null) => (x === null ? null : m.unit === 'days' ? Math.round(x) : m.unit === '%' ? r1(x) : r2(x));
    const percentile = you === null || !vals.length ? null : Math.round((vals.filter((x) => x < you).length + vals.filter((x) => x === you).length / 2) / vals.length * 100);
    /* the band is read in the direction that is better for the company */
    const good = percentile === null ? null : m.higherIsBetter === false ? 100 - percentile : percentile;
    const band: Band = good === null ? 'n/a' : good >= 75 ? 'top' : good >= 50 ? 'upper' : good >= 25 ? 'lower' : 'bottom';
    const weak = m.higherIsBetter !== null && band === 'bottom';
    const closest = you === null ? [] : [...rows].sort((a, b) => Math.abs(a.v - you) - Math.abs(b.v - you)).slice(0, 3)
      .map((r) => ({ company: r.p.company, value: r.v, sectorAr: r.p.sectorAr, page: key === 'dso' || key === 'dio' || key === 'dpo' || key === 'currentRatio' || key === 'equityRatio' ? r.p.pages.bs : r.p.pages.is }));
    return { key, ar: m.ar, unit: m.unit, formula: m.formula, higherIsBetter: m.higherIsBetter, you, n: vals.length,
      p25: round(quantile(vals, 0.25)), median: round(quantile(vals, 0.5)), p75: round(quantile(vals, 0.75)), min: vals.length ? vals[0] : null, max: vals.length ? vals[vals.length - 1] : null,
      percentile, band, weak, closest, check: weak ? CHECKS[key] ?? null : null, note: own?.notes[key] ?? null };
  });
}

/** One line per result, for the summary card and the assistant. */
export function summary(rows: Benchmark[]) {
  const scored = rows.filter((r) => r.band !== 'n/a' && r.higherIsBetter !== null);
  return { compared: rows.filter((r) => r.you !== null).length, strong: scored.filter((r) => r.band === 'top').map((r) => r.ar), weak: scored.filter((r) => r.weak).map((r) => r.ar) };
}
