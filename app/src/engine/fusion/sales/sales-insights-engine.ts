/**
 * Sales insights — the «ذكاء المبيعات» hub as one pure engine: a chosen period against the equal period before it
 * (KPIs with deltas), a weekday-aware 30-day forecast whose model is chosen by a backtest on the last 30 days,
 * full RFM scoring (quintiles) with named segments that always add up to the customer count, follow-up by each
 * customer's own buying rhythm (not one fixed 45-day rule), basket affinity with support / confidence / lift,
 * ABC/Pareto with item momentum, weekday averages per occurrence, channel mix, monthly acquisition cohorts,
 * data quality, a health score whose parts are shown, and rule-based recommendations that name their number.
 * Money in halalas (integers). Days are ISO dates compared as UTC days — never local midnight, which shifts every
 * window by a day east of UTC (Riyadh, Cairo).
 */

export type InsightLine = { date: string; amount: number; qty?: number; product?: string; customerId?: string; invoice?: string; channel?: string };
export type InsightCustomer = { id: string; name?: string; phone?: string; city?: string };
export type PeriodKey = '30' | '90' | '365' | 'all';
export type InsightOpts = { asOf?: string; period?: PeriodKey; channel?: string; horizon?: number };
export type Delta = { cur: number; prev: number | null; delta: number | null };
export type Tone = 'bad' | 'warn' | 'ok' | 'info';

const DAY = 86400000;
const dayT = (d: string) => Date.parse(d.slice(0, 10) + 'T00:00:00Z');
const isoDay = (t: number) => new Date(t).toISOString().slice(0, 10);
const validDay = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d) && Number.isFinite(dayT(d)) && isoDay(dayT(d)) === d;
export const dayAdd = (d: string, n: number) => isoDay(dayT(d) + n * DAY);
export const daysBetween = (a: string, b: string) => Math.round((dayT(b) - dayT(a)) / DAY);
const weekday = (d: string) => new Date(dayT(d)).getUTCDay();
const round = (v: number, p = 2) => { const f = 10 ** p; return Math.round(v * f) / f; };
const pctChange = (cur: number, prev: number | null) => (prev == null || prev === 0 ? null : round(((cur - prev) / Math.abs(prev)) * 100, 1));
const delta = (cur: number, prev: number | null): Delta => ({ cur, prev, delta: pctChange(cur, prev) });
const median = (xs: number[]) => { if (!xs.length) return 0; const s = [...xs].sort((a, b) => a - b), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
/** an Arabic count with its noun: 1 طلب · 2 طلبان · 3–10 طلبات · 11+ طلباً */
export function countAr(n: number, f: { one: string; two: string; few: string; many: string }): string {
  const a = Math.abs(n), r = a % 100;
  return a === 1 ? f.one : a === 2 ? f.two : r >= 3 && r <= 10 ? n.toLocaleString('en-US') + ' ' + f.few : n.toLocaleString('en-US') + ' ' + f.many;
}
/** a signed percentage that reads correctly inside Arabic text: the LRM keeps «−21.6٪» from showing as «21.6٪-» */
export const signed = (v: number) => '‎' + (v > 0 ? '+' : '') + v + '٪';
export const ORDERS_AR = { one: 'طلب واحد', two: 'طلبان', few: 'طلبات', many: 'طلباً' };
export const CUSTOMERS_AR = { one: 'عميل واحد', two: 'عميلان', few: 'عملاء', many: 'عميلاً' };
export const DAYS_AR = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
export const PERIODS: Record<PeriodKey, string> = { '30': 'آخر 30 يوماً', '90': 'آخر 90 يوماً', '365': 'آخر 12 شهراً', all: 'كل الفترة' };

type Line = { date: string; amount: number; qty: number; product: string; customerId: string; invoice: string; channel: string };
type Order = { key: string; date: string; customerId: string; channel: string; amount: number; qty: number; items: Map<string, number> };

/** valid lines only: an ISO day and a finite amount; empty names become «غير محدد» */
export function normalize(lines: InsightLine[]): Line[] {
  const out: Line[] = [];
  lines.forEach((l, i) => {
    const date = String(l.date ?? '').slice(0, 10), amount = Number(l.amount);
    if (!validDay(date) || !Number.isFinite(amount)) return;
    out.push({ date, amount: Math.round(amount), qty: Number(l.qty) || 0, product: String(l.product ?? '').trim() || 'غير محدد',
      customerId: String(l.customerId ?? ''), invoice: String(l.invoice ?? '') || 'line-' + i, channel: String(l.channel ?? '').trim() || 'غير محدد' });
  });
  return out;
}

/** invoice references are scoped to transaction day, channel and customer; same-day multiline purchases stay together */
const orderKey = (l: Line) => JSON.stringify([l.invoice, l.date, l.channel, l.customerId]);
/** lines grouped into dated orders, sorted by day; later credits never move into the original sale's period */
export function ordersOf(lines: Line[]): Order[] {
  const m = new Map<string, Order>();
  lines.forEach((l) => {
    const key = orderKey(l);
    let o = m.get(key);
    if (!o) { o = { key, date: l.date, customerId: l.customerId, channel: l.channel, amount: 0, qty: 0, items: new Map() }; m.set(key, o); }
    o.amount += l.amount; o.qty += l.qty; o.items.set(l.product, (o.items.get(l.product) ?? 0) + l.amount);
  });
  return [...m.values()].sort((a, b) => a.date.localeCompare(b.date) || a.key.localeCompare(b.key));
}

/** daily totals over [from, to], missing days as 0 */
export function dailyTotals(orders: { date: string; amount: number }[], from: string, to: string) {
  const map = new Map<string, number>();
  orders.forEach((o) => { if (o.date >= from && o.date <= to) map.set(o.date, (map.get(o.date) ?? 0) + o.amount); });
  const labels: string[] = [], values: number[] = [];
  for (let t = dayT(from), end = dayT(to); t <= end; t += DAY) { const d = isoDay(t); labels.push(d); values.push(map.get(d) ?? 0); }
  return { labels, values };
}

/* ---------- forecasting: three simple models, chosen by their error on the last 30 known days ---------- */
export type ForecastModel = 'linear' | 'seasonal' | 'mean';
export const MODEL_AR: Record<ForecastModel, string> = { linear: 'اتجاه خطي', seasonal: 'اتجاه × نمط أيام الأسبوع', mean: 'متوسط آخر 4 أسابيع' };

function lsq(y: number[]) {
  const n = y.length, xm = (n - 1) / 2, ym = y.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0; y.forEach((v, i) => { sxy += (i - xm) * (v - ym); sxx += (i - xm) ** 2; });
  const slope = sxx ? sxy / sxx : 0; return { slope, intercept: ym - slope * xm };
}
/** fit one model on `y` (whose first day is `start`) and predict `h` days after it; also return the in-sample fit */
export function fitModel(model: ForecastModel, y: number[], start: string, h: number): { fit: number[]; pred: number[]; slope: number } {
  const n = y.length;
  if (model === 'mean') { const w = y.slice(-28), m = w.reduce((a, b) => a + b, 0) / Math.max(1, w.length); return { fit: y.map(() => m), pred: Array(h).fill(m), slope: 0 }; }
  const { slope, intercept } = lsq(y), trend = (i: number) => intercept + slope * i;
  if (model === 'linear') return { fit: y.map((_, i) => trend(i)), pred: Array.from({ length: h }, (_, k) => trend(n + k)), slope };
  /* seasonal: the weekday index is the mean of actual / trend for that weekday, normalised to average 1 */
  const sum = Array(7).fill(0), cnt = Array(7).fill(0);
  y.forEach((v, i) => { const t = trend(i); if (t > 0) { const w = weekday(dayAdd(start, i)); sum[w] += v / t; cnt[w]++; } });
  const raw = sum.map((s, w) => (cnt[w] ? s / cnt[w] : 1)), avg = raw.reduce((a, b) => a + b, 0) / 7 || 1, idx = raw.map((r) => r / avg);
  return { fit: y.map((_, i) => trend(i) * idx[weekday(dayAdd(start, i))]), pred: Array.from({ length: h }, (_, k) => trend(n + k) * idx[weekday(dayAdd(start, n + k))]), slope };
}
/* the error is measured on weekly sums: a 30-day forecast is read by the week and the month, and a day-level error
   punishes an order that merely landed a day early (sparse daily sales would show «8% accurate» for a good month) */
/* whole weeks; the days left over (30 = 4 × 7 + 2) join the last week */
const weekly = (xs: number[]) => { const full = Math.max(1, Math.floor(xs.length / 7)), out: number[] = Array(full).fill(0); xs.forEach((v, i) => { out[Math.min(full - 1, Math.floor(i / 7))] += v; }); return out; };
export function wapeDaily(a: number[], f: number[]): number | null { const s = a.reduce((x, v) => x + Math.abs(v), 0); return s ? round(a.reduce((x, v, i) => x + Math.abs(v - Math.max(0, f[i] ?? 0)), 0) / s, 4) : null; }
export function wapeWeekly(a: number[], f: number[]): number | null {
  const fa = f.map((v) => Math.max(0, v)), A = weekly(a), F = weekly(fa), s = A.reduce((x, v) => x + Math.abs(v), 0);
  return s ? round(A.reduce((x, v, i) => x + Math.abs(v - (F[i] ?? 0)), 0) / s, 4) : null;
}

/** a 30-day forecast from daily totals ending on `asOf`: each model is fitted on the 90 days before the last 30 and
 *  scored (WAPE) on those 30; the best one is refitted on the last 90 days. The 80% band uses the in-sample residuals. */
export function forecastDaily(values: number[], asOf: string, horizon = 30) {
  const n = values.length, basis = Math.min(90, n), y = values.slice(n - basis), start = dayAdd(asOf, -(basis - 1));
  const empty = { model: null as ForecastModel | null, wape: null as number | null, candidates: [] as { model: ForecastModel; wape: number | null; daily: number | null; totalError: number | null }[], totalError: null as number | null, labels: [] as string[], daily: [] as number[], total: 0, low: 0, high: 0, slope: 0, residStd: 0, basis: n };
  if (n < 14 || !values.some((v) => v)) return empty;
  let model: ForecastModel = 'linear';
  const candidates: { model: ForecastModel; wape: number | null; daily: number | null; totalError: number | null }[] = [];
  if (n >= 60) {
    const hold = values.slice(-30), trainAll = values.slice(0, n - 30), train = trainAll.slice(-90), tStart = dayAdd(asOf, -(30 + train.length - 1));
    (['mean', 'linear', 'seasonal'] as ForecastModel[]).forEach((m) => { const pred = fitModel(m, train, tStart, 30).pred, sa = hold.reduce((x, v) => x + v, 0);
      candidates.push({ model: m, wape: wapeWeekly(hold, pred), daily: wapeDaily(hold, pred), totalError: sa ? round(Math.abs(sa - pred.reduce((x, v) => x + Math.max(0, v), 0)) / Math.abs(sa), 4) : null }); });
    /* the weekly error decides; models within 2 points of the best tie, and the tie goes to the one that also places
       the days better (the screen draws the forecast day by day) */
    const ok = candidates.filter((c) => c.wape != null), best = Math.min(...ok.map((c) => c.wape as number));
    const near = ok.filter((c) => (c.wape as number) <= best + 0.02).sort((a, b) => (a.daily ?? 1) - (b.daily ?? 1));
    if (near.length) model = near[0].model;
  } else if (n >= 28) model = 'seasonal';
  const f = fitModel(model, y, start, horizon), resid = y.map((v, i) => v - f.fit[i]);
  const residStd = Math.sqrt(resid.reduce((a, r) => a + r * r, 0) / Math.max(1, y.length - 2));
  const daily = f.pred.map((v) => Math.max(0, Math.round(v))), total = daily.reduce((a, b) => a + b, 0), spread = 1.2816 * residStd * Math.sqrt(horizon);
  const chosen = candidates.find((c) => c.model === model);
  return { model, wape: chosen?.wape ?? null, totalError: chosen?.totalError ?? null, candidates, labels: daily.map((_, k) => dayAdd(asOf, k + 1)), daily, total,
    low: Math.max(0, Math.round(total - spread)), high: Math.round(total + spread), slope: round(f.slope), residStd: round(residStd), basis: y.length };
}

/* ---------- RFM: quintile scores 1–5 (ties share a score) and named segments ---------- */
export type SegmentKey = 'cantLose' | 'atRisk' | 'lost' | 'hibernating' | 'champions' | 'loyal' | 'newcomers' | 'potential' | 'attention';
export const SEGMENTS: { key: SegmentKey; label: string; tone: Tone; desc: string; action: string }[] = [
  { key: 'champions', label: 'الأبطال', tone: 'ok', desc: 'اشتروا حديثاً وكثيراً وبقيمة عالية', action: 'كافئهم واطلب توصيتهم؛ أول من يجرّب الجديد' },
  { key: 'loyal', label: 'الأوفياء', tone: 'ok', desc: 'يشترون بانتظام ومنذ مدة', action: 'عروض الترقية والباقات الأكبر' },
  { key: 'potential', label: 'واعدون بالولاء', tone: 'info', desc: 'حديثو الشراء وتكرارهم يتصاعد', action: 'برنامج نقاط أو اشتراك أسبوعي' },
  { key: 'newcomers', label: 'جدد', tone: 'info', desc: 'أول طلب حديث', action: 'رسالة ترحيب وعرض الطلب الثاني' },
  { key: 'attention', label: 'يحتاجون انتباهاً', tone: 'warn', desc: 'متوسطون في الحداثة والتكرار', action: 'عرض محدود المدة قبل أن يبردوا' },
  { key: 'cantLose', label: 'لا يجب خسارتهم', tone: 'bad', desc: 'كانوا من الأعلى قيمة وتكراراً وغابوا', action: 'اتصال شخصي اليوم — قيمتهم الأعلى' },
  { key: 'atRisk', label: 'معرّضون للفقد', tone: 'bad', desc: 'اشتروا كثيراً سابقاً وغابوا', action: 'حملة استعادة بعرض شخصي' },
  { key: 'hibernating', label: 'خاملون', tone: 'warn', desc: 'قليلو الشراء وغابوا مدة', action: 'تذكير خفيف بالعروض الموسمية' },
  { key: 'lost', label: 'مفقودون', tone: 'info', desc: 'آخر شراء بعيد جداً وتكرار منخفض', action: 'لا تنفق كثيراً؛ رسالة واحدة' },
];
/** score 1..5 by the share of values below (ties share the mid-rank) */
export function quintile(values: number[]): number[] {
  const n = values.length, s = [...values].sort((a, b) => a - b);
  const lower = (v: number) => { let lo = 0, hi = n; while (lo < hi) { const m = (lo + hi) >> 1; if (s[m] < v) lo = m + 1; else hi = m; } return lo; };
  const upper = (v: number) => { let lo = 0, hi = n; while (lo < hi) { const m = (lo + hi) >> 1; if (s[m] <= v) lo = m + 1; else hi = m; } return lo; };
  return values.map((v) => { const a = lower(v), b = upper(v), p = (a + (b - a) / 2) / Math.max(1, n); return clamp(1 + Math.floor(p * 5), 1, 5); });
}
export function segmentOf(r: number, f: number, m: number): SegmentKey {
  if (r <= 2 && f >= 4 && m >= 4) return 'cantLose';
  if (r <= 2 && (f >= 3 || m >= 3)) return 'atRisk';
  if (r === 1) return 'lost';
  if (r === 2) return 'hibernating';
  if (r >= 4 && f >= 4 && m >= 4) return 'champions';
  if (f >= 4) return 'loyal';
  if (r >= 4 && f === 1) return 'newcomers';
  if (r >= 4) return 'potential';
  return 'attention';
}

/* ---------- the hub ---------- */
export function salesInsights(input: InsightLine[], customers: InsightCustomer[] = [], opts: InsightOpts = {}) {
  const all = normalize(input), channelsAll = [...new Set(all.map((l) => l.channel))].sort((a, b) => a.localeCompare(b, 'ar'));
  const lastSale = all.reduce((a, l) => (l.date > a ? l.date : a), '');
  const asOf = opts.asOf && validDay(opts.asOf) && lastSale && opts.asOf < lastSale ? opts.asOf : lastSale;
  const L = all.filter((l) => l.date <= asOf && (!opts.channel || l.channel === opts.channel));
  const key: PeriodKey = opts.period && PERIODS[opts.period] ? opts.period : '90';
  if (!L.length) return { empty: true as const, asOf, channels: channelsAll, period: { key, label: PERIODS[key] } };
  const first = L.reduce((a, l) => (l.date < a ? l.date : a), L[0].date);
  const len = key === 'all' ? daysBetween(first, asOf) + 1 : Number(key);
  const from = key === 'all' ? first : dayAdd(asOf, -(len - 1));
  const prevTo = dayAdd(from, -1), prevFrom = dayAdd(from, -len), hasPrev = key !== 'all' && first <= prevTo;
  const period = { key, label: PERIODS[key], from, to: asOf, days: len, prevFrom: hasPrev ? prevFrom : null, prevTo: hasPrev ? prevTo : null };

  const O = ordersOf(L), inCur = (d: string) => d >= from && d <= asOf, inPrev = (d: string) => hasPrev && d >= prevFrom && d <= prevTo;
  const cur = O.filter((o) => inCur(o.date)), prev = O.filter((o) => inPrev(o.date));
  const purchases = O.filter((o) => o.amount > 0), curPurchases = purchases.filter((o) => inCur(o.date));
  const purchaseByKey = new Map(purchases.map((o) => [o.key, o]));
  /* a purchase is an order above zero: returns and credit notes never count as a visit */
  const firstBuy = new Map<string, string>(); purchases.forEach((o) => { if (o.customerId && !firstBuy.has(o.customerId)) firstBuy.set(o.customerId, o.date); });

  /* KPIs with the same measure for the period before */
  const measure = (os: Order[], inside: (d: string) => boolean) => {
    const pos = os.filter((o) => o.amount > 0), per = new Map<string, number>();
    pos.forEach((o) => { if (o.customerId) per.set(o.customerId, (per.get(o.customerId) ?? 0) + 1); });
    const revenue = os.reduce((a, o) => a + o.amount, 0);
    return { revenue, orders: pos.length, avgOrder: pos.length ? Math.round(pos.reduce((a, o) => a + o.amount, 0) / pos.length) : 0,
      customers: per.size, newCustomers: [...firstBuy.entries()].filter(([, d]) => inside(d)).length,
      repeatRate: per.size ? round([...per.values()].filter((c) => c > 1).length / per.size, 4) : 0,
      returns: Math.abs(L.filter((l) => inside(l.date) && l.amount < 0).reduce((a, l) => a + l.amount, 0)), units: os.reduce((a, o) => a + o.qty, 0) };
  };
  const mc = measure(cur, inCur), mp = hasPrev ? measure(prev, inPrev) : null;
  const kpis = Object.fromEntries((Object.keys(mc) as (keyof typeof mc)[]).map((k) => [k, delta(mc[k], mp ? mp[k] : null)])) as Record<keyof typeof mc, Delta>;

  /* daily trend in the period (and the period before, aligned day by day) */
  const trend = dailyTotals(cur, from, asOf), trendPrev = hasPrev ? dailyTotals(prev, prevFrom, prevTo).values : null;
  const fc = forecastDaily(dailyTotals(O, first, asOf).values, asOf, opts.horizon ?? 30);

  /* weekdays: average per occurrence of that weekday inside the period */
  const wd = DAYS_AR.map((name, i) => ({ i, name, total: 0, orders: 0, days: 0, avg: 0 }));
  trend.labels.forEach((d, i) => { const w = wd[weekday(d)]; w.days++; w.total += trend.values[i]; });
  curPurchases.forEach((o) => { wd[weekday(o.date)].orders++; });
  wd.forEach((w) => { w.avg = w.days ? Math.round(w.total / w.days) : 0; });

  /* channels and items with their share and their change against the period before */
  const group = (dim: 'channel' | 'product') => {
    const m = new Map<string, { name: string; revenue: number; prev: number; qty: number; orders: Set<string> }>();
    L.forEach((l) => {
      const c = inCur(l.date), p = inPrev(l.date); if (!c && !p) return;
      const k = l[dim], x = m.get(k) ?? { name: k, revenue: 0, prev: 0, qty: 0, orders: new Set<string>() };
      if (c) { x.revenue += l.amount; x.qty += l.qty; const k = orderKey(l), purchase = purchaseByKey.get(k); if (purchase && (dim === 'channel' || (purchase.items.get(l.product) ?? 0) > 0)) x.orders.add(k); } else x.prev += l.amount;
      m.set(k, x);
    });
    const tot = [...m.values()].reduce((a, x) => a + Math.max(0, x.revenue), 0) || 1;
    return [...m.values()].filter((x) => x.revenue !== 0 || x.prev !== 0).map((x) => ({ name: x.name, revenue: x.revenue, prev: hasPrev ? x.prev : null, qty: x.qty, orders: x.orders.size,
      share: round(Math.max(0, x.revenue) / tot, 4), growth: hasPrev ? pctChange(x.revenue, x.prev) : null })).sort((a, b) => b.revenue - a.revenue);
  };
  const channels = group('channel');
  let cum = 0;
  const products = group('product').map((p) => { const before = cum; cum += p.share; return { ...p, cum: round(cum, 4), cls: (before < 0.8 ? 'A' : before < 0.95 ? 'B' : 'C') as 'A' | 'B' | 'C' }; });
  const pos = products.filter((p) => p.revenue > 0);
  const abc = (['A', 'B', 'C'] as const).map((c) => { const xs = pos.filter((p) => p.cls === c); return { cls: c, count: xs.length, revenue: xs.reduce((a, p) => a + p.revenue, 0), share: round(xs.reduce((a, p) => a + p.share, 0), 4) }; });
  const top10Share = round(pos.slice(0, 10).reduce((a, p) => a + p.share, 0), 4), hhi = Math.round(pos.reduce((a, p) => a + (p.share * 100) ** 2, 0));
  const movers = products.filter((p) => p.growth != null && Math.max(p.revenue, p.prev ?? 0) >= 0.02 * (mc.revenue || 1));
  const momentum = { risers: movers.filter((p) => (p.growth as number) >= 10).sort((a, b) => (b.revenue - (b.prev ?? 0)) - (a.revenue - (a.prev ?? 0))).slice(0, 5),
    fallers: movers.filter((p) => (p.growth as number) <= -10).sort((a, b) => (a.revenue - (a.prev ?? 0)) - (b.revenue - (b.prev ?? 0))).slice(0, 5) };

  /* affinity uses the same positive purchases as the KPI; refunded and zero-net items are not bought together */
  const baskets = curPurchases.map((o) => ({ ...o, items: new Map([...o.items].filter(([, amount]) => amount > 0)) }));
  const multi = baskets.filter((o) => o.items.size > 1), nOrders = curPurchases.length || 1, itemCount = new Map<string, number>(), pairM = new Map<string, { a: string; b: string; count: number; revenue: number }>();
  baskets.forEach((o) => o.items.forEach((_, k) => itemCount.set(k, (itemCount.get(k) ?? 0) + 1)));
  multi.forEach((o) => { const ks = [...o.items.keys()].sort((x, y) => x.localeCompare(y)).slice(0, 15);
    for (let i = 0; i < ks.length; i++) for (let j = i + 1; j < ks.length; j++) { const k = ks[i] + '\u0000' + ks[j], x = pairM.get(k) ?? { a: ks[i], b: ks[j], count: 0, revenue: 0 }; x.count++; x.revenue += o.amount; pairM.set(k, x); } });
  const minPair = curPurchases.length >= 200 ? 3 : 2;
  const pairs = [...pairM.values()].filter((p) => p.count >= minPair).map((p) => { const ca = itemCount.get(p.a) ?? 1, cb = itemCount.get(p.b) ?? 1;
    return { ...p, support: round(p.count / nOrders, 4), confAB: round(p.count / ca, 3), confBA: round(p.count / cb, 3), lift: round((p.count * nOrders) / (ca * cb), 2) }; })
    .sort((x, y) => y.count - x.count || y.lift - x.lift).slice(0, 20);

  /* customers: RFM on the history up to asOf, and follow-up by each one's own rhythm */
  const cmap = new Map(customers.map((c) => [String(c.id), c]));
  const cs = new Map<string, { id: string; days: Set<string>; orders: number; revenue: number; last: string; first: string }>();
  O.forEach((o) => { if (!o.customerId) return; const x = cs.get(o.customerId) ?? { id: o.customerId, days: new Set<string>(), orders: 0, revenue: 0, last: '', first: '' };
    x.revenue += o.amount; cs.set(o.customerId, x); if (o.amount <= 0) return;
    x.days.add(o.date); x.orders++; if (o.date > x.last) x.last = o.date; if (!x.first || o.date < x.first) x.first = o.date; });
  const carr = [...cs.values()].filter((c) => c.orders > 0), R = quintile(carr.map((c) => -daysBetween(c.last, asOf))), F = quintile(carr.map((c) => c.orders)), M = quintile(carr.map((c) => c.revenue));
  const gapsAll: number[] = [];
  const people = carr.map((c, i) => {
    const ds = [...c.days].sort(), gaps = ds.slice(1).map((d, j) => daysBetween(ds[j], d)); gapsAll.push(...gaps);
    const info = cmap.get(c.id) ?? { id: c.id };
    return { id: c.id, name: info.name ?? '', phone: info.phone ?? '', city: info.city ?? '', orders: c.orders, revenue: c.revenue, first: c.first, last: c.last,
      daysSince: daysBetween(c.last, asOf), avgOrder: Math.round(c.revenue / Math.max(1, c.orders)), cadence: gaps.length ? median(gaps) : null as number | null,
      r: R[i], f: F[i], m: M[i], segment: segmentOf(R[i], F[i], M[i]) };
  });
  const typical = gapsAll.length ? median(gapsAll) : 30;
  const followup = people.map((p) => {
    const cadence = p.cadence ?? typical, ratio = cadence > 0 ? round(p.daysSince / cadence, 2) : 0;
    const status = p.daysSince > Math.max(1.5 * cadence, cadence + 7) ? 'overdue' : p.daysSince > cadence ? 'due' : 'ok';
    const monthly = Math.round(p.avgOrder * (30 / Math.max(7, cadence)));
    return { ...p, cadenceUsed: round(cadence, 1), personal: p.cadence != null, ratio, status: status as 'overdue' | 'due' | 'ok', expected: dayAdd(p.last, Math.round(cadence)), monthlyValue: monthly, priority: Math.round(monthly * Math.min(3, ratio)) };
  }).filter((p) => p.status !== 'ok' && p.revenue > 0).sort((a, b) => b.priority - a.priority);
  const totalRev = people.reduce((a, p) => a + Math.max(0, p.revenue), 0) || 1;
  const segments = SEGMENTS.map((s) => { const xs = people.filter((p) => p.segment === s.key); return { ...s, count: xs.length, revenue: xs.reduce((a, p) => a + p.revenue, 0), share: round(xs.reduce((a, p) => a + Math.max(0, p.revenue), 0) / totalRev, 4) }; });

  /* monthly acquisition cohorts: the share of each month's new customers who bought again k months later */
  const ym = (d: string) => d.slice(0, 7), mAdd = (m: string, k: number) => { const [y, mo] = m.split('-').map(Number), t = y * 12 + mo - 1 + k; return Math.floor(t / 12) + '-' + String((t % 12) + 1).padStart(2, '0'); };
  const active = new Map<string, Set<string>>(); O.forEach((o) => { if (!o.customerId || o.amount <= 0) return; const s = active.get(o.customerId) ?? new Set<string>(); s.add(ym(o.date)); active.set(o.customerId, s); });
  const cohortOf = new Map<string, string[]>(); firstBuy.forEach((d, id) => { const k = ym(d); (cohortOf.get(k) ?? cohortOf.set(k, []).get(k)!).push(id); });
  const cohortKeys = [...cohortOf.keys()].sort().slice(-12), lastM = ym(asOf), maxK = 6;
  const cohorts = { rows: cohortKeys, sizes: cohortKeys.map((k) => cohortOf.get(k)!.length), cols: Array.from({ length: maxK + 1 }, (_, k) => k),
    values: cohortKeys.map((k) => Array.from({ length: maxK + 1 }, (_, j) => { const m = mAdd(k, j); if (m > lastM) return null;
      const ids = cohortOf.get(k)!; return round((ids.filter((id) => active.get(id)?.has(m)).length / ids.length) * 100, 1); })) };

  /* data quality over every line of the store (not only the period) */
  const raw = input.length || 1, missingDate = input.filter((l) => !validDay(String(l.date ?? '').slice(0, 10))).length;
  const missingCustomer = all.filter((l) => !l.customerId).length, nonPositive = all.filter((l) => l.amount <= 0).length, noProduct = all.filter((l) => l.product === 'غير محدد').length;
  const seen = new Set<string>(); let duplicates = 0;
  input.forEach((l) => { const k = [l.date, l.invoice, l.product, l.amount, l.qty, l.customerId].join('\u0001'); if (l.invoice && seen.has(k)) duplicates++; else seen.add(k); });
  const qualityScore = Math.round(clamp(100 - (missingDate / raw) * 35 - (missingCustomer / raw) * 25 - (noProduct / raw) * 20 - (nonPositive / raw) * 10 - (duplicates / raw) * 10, 0, 100));
  const quality = { lines: input.length, missingDate, missingCustomer, nonPositive, noProduct, duplicates, score: qualityScore };

  /* health: five parts of 20 points, each shown with the number behind it */
  /* complete 7-day weeks counted back from asOf (a partial first week would look like a slump) */
  const wk: number[] = []; for (let i = trend.values.length; i >= 7; i -= 7) wk.push(trend.values.slice(i - 7, i).reduce((a, b) => a + b, 0));
  const wm = wk.reduce((a, b) => a + b, 0) / Math.max(1, wk.length), wcv = wk.length > 1 && wm ? Math.sqrt(wk.reduce((a, v) => a + (v - wm) ** 2, 0) / (wk.length - 1)) / Math.abs(wm) : null;
  const lifeRepeat = people.length ? people.filter((p) => p.orders > 1).length / people.length : 0;
  const g = kpis.revenue.delta;
  const health = [
    { key: 'growth', label: 'النمو', points: Math.round(g == null ? 10 : clamp(10 + g / 2, 0, 20)), note: g == null ? 'لا فترة سابقة للمقارنة' : signed(g) + ' عن الفترة السابقة' },
    { key: 'stability', label: 'الاستقرار', points: Math.round(wcv == null ? 10 : clamp(20 * (1 - wcv), 0, 20)), note: wcv == null ? 'أسابيع غير كافية' : 'تذبذب أسبوعي ' + Math.round(wcv * 100) + '٪' },
    { key: 'diversity', label: 'تنوع الإيراد', points: Math.round(clamp(20 * (1 - (hhi - 1500) / 2500), 0, 20)), note: 'مؤشر هيرفندال ' + hhi + ' · أعلى 10 أصناف ' + Math.round(top10Share * 100) + '٪' },
    { key: 'retention', label: 'الاحتفاظ', points: Math.round(clamp((lifeRepeat / 0.6) * 20, 0, 20)), note: Math.round(lifeRepeat * 100) + '٪ من العملاء اشتروا أكثر من مرة' },
    { key: 'data', label: 'جودة البيانات', points: Math.round(qualityScore / 5), note: qualityScore + '٪' },
  ];
  const healthScore = health.reduce((a, h) => a + h.points, 0);

  /* recommendations: each fires only when its number calls for it */
  type Rec = { id: string; tone: Tone; title: string; body: string; metric: string; seg?: SegmentKey; go?: string; follow?: boolean };
  const recs: Rec[] = [], sar = (h: number) => Math.round(h / 100).toLocaleString('en-US'), segN = (k: SegmentKey) => segments.find((s) => s.key === k)!;
  if (g != null && g <= -5) recs.push({ id: 'slowdown', tone: 'bad', title: 'الإيراد يتراجع', body: 'ابدأ بالعملاء المعرّضين للفقد والأصناف المتراجعة في هذه الفترة.', metric: signed(g) + ' عن الفترة السابقة', seg: 'atRisk' });
  if (segN('cantLose').count) recs.push({ id: 'cant-lose', tone: 'bad', title: segN('cantLose').count === 1 ? 'عميل كبير توقف عن الشراء' : segN('cantLose').count + ' من كبار العملاء توقفوا', body: 'كانوا من الأعلى قيمة وتكراراً — اتصال شخصي اليوم قبل أي حملة عامة.', metric: sar(segN('cantLose').revenue) + (segN('cantLose').count === 1 ? ' ر.س مشترياته السابقة' : ' ر.س مشترياتهم السابقة'), seg: 'cantLose' });
  const overdue = followup.filter((p) => p.status === 'overdue');
  if (overdue.length) recs.push({ id: 'overdue', tone: 'warn', title: countAr(overdue.length, CUSTOMERS_AR) + (overdue.length === 1 ? ' تأخر عن موعده المعتاد' : ' تأخروا عن موعدهم المعتاد'), body: 'كل عميل يُقاس بإيقاعه الخاص: تأخر أكثر من 1.5 مرة من متوسط الفاصل بين طلباته.', metric: 'قيمة شهرية متوقعة ' + sar(overdue.reduce((a, p) => a + p.monthlyValue, 0)) + ' ر.س', follow: true });
  if (top10Share > 0.65 || hhi > 2500) recs.push({ id: 'concentration', tone: 'warn', title: 'تركّز الإيراد مرتفع', body: 'أمّن مورداً بديلاً للأصناف الأعلى وجرّب صنفين جديدين كل شهر.', metric: 'أعلى 10 أصناف ' + Math.round(top10Share * 100) + '٪ · HHI ' + hhi, go: 'productflow' });
  const nc = kpis.newCustomers; if (nc.delta != null && nc.delta <= -20 && (nc.prev ?? 0) >= 3) recs.push({ id: 'acquisition', tone: 'warn', title: 'عملاء جدد أقل', body: 'قنوات الاكتساب تبرد — راجع الإعلانات والإحالات والعروض الأولى.', metric: nc.cur + ' مقابل ' + nc.prev + ' في الفترة السابقة' });
  const fallingCh = channels.find((c) => c.growth != null && c.growth <= -15 && c.share >= 0.1);
  if (fallingCh) recs.push({ id: 'channel', tone: 'warn', title: 'قناة «' + fallingCh.name + '» تتراجع', body: 'حصتها مؤثرة وتراجعت عن الفترة السابقة — افحص التسعير والتوفر وخدمة القناة.', metric: signed(fallingCh.growth as number) + ' · حصة ' + Math.round(fallingCh.share * 100) + '٪' });
  if (g != null && g >= 5) recs.push({ id: 'momentum', tone: 'ok', title: 'الزخم موجب', body: 'ثبّت التوريد وارفع حدود المخزون للأصناف الصاعدة قبل أن تنفد.', metric: signed(g) + ' عن الفترة السابقة', go: 'inventory' });
  const bundle = pairs.filter((p) => p.lift >= 1.2 && p.count >= 3).sort((a, b) => b.lift * b.count - a.lift * a.count)[0];
  if (bundle) recs.push({ id: 'bundle', tone: 'info', title: 'باقة «' + bundle.a + '» + «' + bundle.b + '»', body: 'يظهران معاً أكثر من المتوقع بالصدفة — جرّب باقة أو توصية عند الطلب.', metric: countAr(bundle.count, ORDERS_AR) + ' · رفع ×' + bundle.lift, go: 'offers' });
  const wdOk = wd.filter((w) => w.days), wdMean = wdOk.reduce((a, w) => a + w.avg, 0) / Math.max(1, wdOk.length), weak = [...wdOk].sort((a, b) => a.avg - b.avg)[0];
  if (weak && wdMean && weak.avg < wdMean * 0.8) recs.push({ id: 'slow-day', tone: 'info', title: 'يوم ' + weak.name + ' الأضعف', body: 'عرض خاص أو توصيل مجاني فيه يوزّع الطلب ويخفف أيام الذروة.', metric: 'متوسطه ' + sar(weak.avg) + ' ر.س مقابل ' + sar(wdMean) + ' لبقية الأيام' });
  if (fc.wape != null && fc.wape > 0.5) recs.push({ id: 'forecast', tone: 'info', title: 'التوقع تقريبي جداً', body: 'المبيعات اليومية متقلبة؛ اعتمد على النطاق لا على الرقم الواحد، واقرأ التوقع أسبوعياً.', metric: 'خطأ الاختبار ' + Math.round(fc.wape * 100) + '٪' });
  if (qualityScore < 90) recs.push({ id: 'data', tone: 'warn', title: 'ارفع جودة بيانات المبيعات', body: 'أسطر بلا عميل أو صنف أو مكررة تُضعف كل تحليل في هذه الشاشة.', metric: 'جودة ' + qualityScore + '٪', go: 'smartmatch' });
  const order: Tone[] = ['bad', 'warn', 'ok', 'info'];
  recs.sort((a, b) => order.indexOf(a.tone) - order.indexOf(b.tone));

  return { empty: false as const, asOf, first, period, channels: channelsAll, channel: opts.channel ?? '', kpis, trend, trendPrev, forecast: fc,
    weekdays: wd, channelMix: channels, products, abc, top10Share, hhi, momentum, pairs, ordersInPeriod: curPurchases.length, multiItemOrders: multi.length,
    customers: people, segments, followup, typicalCadence: round(typical, 1), cohorts, quality, health: { score: healthScore, parts: health }, recs: recs.slice(0, 8) };
}
export type SalesInsights = ReturnType<typeof salesInsights>;
