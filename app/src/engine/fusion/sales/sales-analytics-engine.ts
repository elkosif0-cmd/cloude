/**
 * Sales lab — the analytical chapters of the owner's sales dashboard, as a pure engine:
 * the time pulse (daily trend with a 7-day moving average, monthly revenue, invoices and growth,
 * a 30-day linear forecast with an 80% band), invoice distribution and price bands, the
 * momentum race (rising and falling items), month heatmaps by channel and item, the statistics
 * lab (mean, median, standard deviation, IQR, skewness, CV, concentration, correlation) and
 * rule-based growth ideas drawn from those numbers.
 * Money in halalas (integers); every figure is reproducible from the lines.
 */

export type SaleLine = { date: string; amount: number; qty: number; product: string; customerId?: string; invoice?: string; channel?: string };
export type Series = { labels: string[]; values: number[] };

const DAY = 86400000;
const isoDay = (t: number) => new Date(t).toISOString().slice(0, 10);
const dayT = (d: string) => Date.parse(d + 'T00:00:00Z');
const round = (v: number, p = 2) => { const f = 10 ** p; return Math.round(v * f) / f; };
const valid = (l: SaleLine) => /^\d{4}-\d{2}-\d{2}/.test(l.date) && Number.isFinite(l.amount);
const clean = (lines: SaleLine[]) => lines.filter(valid).map((l) => ({ ...l, date: l.date.slice(0, 10), qty: Number(l.qty) || 0 }));

/** daily totals from the first to the last sale day (or the given window), missing days as 0 */
export function dailySeries(lines: SaleLine[], opts: { from?: string; to?: string } = {}): Series {
  const L = clean(lines);
  if (!L.length) return { labels: [], values: [] };
  const days = L.map((l) => l.date).sort();
  const from = dayT(opts.from ?? days[0]), to = dayT(opts.to ?? days[days.length - 1]);
  const map = new Map<string, number>();
  L.forEach((l) => map.set(l.date, (map.get(l.date) ?? 0) + l.amount));
  const labels: string[] = [], values: number[] = [];
  for (let t = from; t <= to; t += DAY) { const d = isoDay(t); labels.push(d); values.push(map.get(d) ?? 0); }
  return { labels, values };
}

/** trailing moving average (null until the window is full) */
export function movingAverage(values: number[], window = 7): (number | null)[] {
  let sum = 0;
  return values.map((v, i) => { sum += v; if (i >= window) sum -= values[i - window]; return i >= window - 1 ? Math.round(sum / window) : null; });
}

/** revenue, invoice count and growth by calendar month */
export function monthlySeries(lines: SaleLine[]): { month: string; revenue: number; invoices: number; growth: number | null }[] {
  const m = new Map<string, { revenue: number; inv: Set<string> }>();
  clean(lines).forEach((l, i) => { const k = l.date.slice(0, 7); const x = m.get(k) ?? { revenue: 0, inv: new Set<string>() }; x.revenue += l.amount; x.inv.add(l.invoice || 'line-' + i); m.set(k, x); });
  const keys = [...m.keys()].sort();
  return keys.map((k, i) => { const x = m.get(k)!, prev = i ? m.get(keys[i - 1])!.revenue : 0; return { month: k, revenue: x.revenue, invoices: x.inv.size, growth: i && prev ? round((x.revenue - prev) / prev * 100, 1) : null }; });
}

/** least-squares line through the last `basis` days, projected `horizon` days ahead with a two-sided band */
export function linearForecast(values: number[], horizon = 30, opts: { basis?: number; z?: number } = {}) {
  const basis = Math.min(values.length, opts.basis ?? 90), z = opts.z ?? 1.2816, y = values.slice(values.length - basis);
  const n = y.length;
  if (n < 7) return { slope: 0, intercept: 0, residStd: 0, forecast: [] as number[], total: 0, low: 0, high: 0, basis: n };
  const xm = (n - 1) / 2, ym = y.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0; y.forEach((v, i) => { sxy += (i - xm) * (v - ym); sxx += (i - xm) ** 2; });
  const slope = sxx ? sxy / sxx : 0, intercept = ym - slope * xm;
  const resid = y.map((v, i) => v - (intercept + slope * i)), residStd = Math.sqrt(resid.reduce((a, r) => a + r * r, 0) / Math.max(1, n - 2));
  const forecast = Array.from({ length: horizon }, (_, k) => Math.max(0, Math.round(intercept + slope * (n + k))));
  const total = forecast.reduce((a, b) => a + b, 0), spread = z * residStd * Math.sqrt(horizon);
  return { slope: round(slope), intercept: round(intercept), residStd: round(residStd), forecast, total, low: Math.max(0, Math.round(total - spread)), high: Math.round(total + spread), basis: n };
}

/** percentile with linear interpolation (p in 0..1) */
export function percentile(sorted: number[], p: number): number {
  if (!sorted.length) return 0;
  const i = (sorted.length - 1) * p, lo = Math.floor(i), hi = Math.ceil(i);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (i - lo);
}

export type Described = { n: number; mean: number; median: number; std: number; q1: number; q3: number; iqr: number; skew: number; cv: number | null; min: number; max: number };
/** descriptive statistics of a sample */
export function describe(values: number[]): Described {
  const x = values.filter(Number.isFinite), n = x.length;
  if (!n) return { n: 0, mean: 0, median: 0, std: 0, q1: 0, q3: 0, iqr: 0, skew: 0, cv: null, min: 0, max: 0 };
  const s = [...x].sort((a, b) => a - b), mean = x.reduce((a, b) => a + b, 0) / n;
  const std = n > 1 ? Math.sqrt(x.reduce((a, v) => a + (v - mean) ** 2, 0) / (n - 1)) : 0;
  const skew = n > 2 && std ? (n / ((n - 1) * (n - 2))) * x.reduce((a, v) => a + ((v - mean) / std) ** 3, 0) : 0;
  const q1 = percentile(s, 0.25), q3 = percentile(s, 0.75);
  return { n, mean: round(mean), median: round(percentile(s, 0.5)), std: round(std), q1: round(q1), q3: round(q3), iqr: round(q3 - q1), skew: round(skew, 3), cv: mean ? round(std / mean, 3) : null, min: s[0], max: s[n - 1] };
}

/** Pearson correlation of two equal-length samples (null when undefined) */
export function pearson(a: number[], b: number[]): number | null {
  const n = Math.min(a.length, b.length);
  if (n < 3) return null;
  const am = a.slice(0, n).reduce((s, v) => s + v, 0) / n, bm = b.slice(0, n).reduce((s, v) => s + v, 0) / n;
  let sab = 0, saa = 0, sbb = 0;
  for (let i = 0; i < n; i++) { sab += (a[i] - am) * (b[i] - bm); saa += (a[i] - am) ** 2; sbb += (b[i] - bm) ** 2; }
  return saa && sbb ? round(sab / Math.sqrt(saa * sbb), 3) : null;
}

/** invoice totals: typical value, the big-deal threshold, a histogram and the price bands that make the revenue */
export function invoiceStats(lines: SaleLine[], bandEdges: number[] = [0, 10000, 30000, 60000, 100000]) {
  const inv = new Map<string, number>();
  clean(lines).forEach((l, i) => { const k = l.invoice || 'line-' + i; inv.set(k, (inv.get(k) ?? 0) + l.amount); });
  const totals = [...inv.values()].filter((v) => v > 0).sort((a, b) => a - b), n = totals.length, revenue = totals.reduce((a, b) => a + b, 0);
  const bands = bandEdges.map((from, i) => {
    const to = bandEdges[i + 1] ?? Infinity, inB = totals.filter((v) => v >= from && v < to), rev = inB.reduce((a, b) => a + b, 0);
    return { from, to: Number.isFinite(to) ? to : null, count: inB.length, revenue: rev, share: revenue ? round(rev / revenue, 4) : 0 };
  });
  const bins = 10, lo = totals[0] ?? 0, hi = totals[n - 1] ?? 0, w = Math.max(1, Math.ceil((hi - lo) / bins));
  const histogram = Array.from({ length: bins }, (_, i) => ({ from: lo + i * w, to: lo + (i + 1) * w, count: 0 }));
  totals.forEach((v) => { histogram[Math.min(bins - 1, Math.floor((v - lo) / w))].count++; });
  return { count: n, revenue, mean: n ? Math.round(revenue / n) : 0, median: Math.round(percentile(totals, 0.5)), p90: Math.round(percentile(totals, 0.9)), max: hi, histogram, bands };
}

/** the momentum race: items whose last-window revenue rose or fell most against the window before */
export function momentum(lines: SaleLine[], asOf: string, opts: { window?: number; minBase?: number; top?: number } = {}) {
  const w = opts.window ?? 30, minBase = opts.minBase ?? 50000, top = opts.top ?? 5, end = dayT(asOf);
  const cur = new Map<string, number>(), prev = new Map<string, number>();
  clean(lines).forEach((l) => {
    const age = (end - dayT(l.date)) / DAY;
    if (age >= 0 && age < w) cur.set(l.product, (cur.get(l.product) ?? 0) + l.amount);
    else if (age >= w && age < 2 * w) prev.set(l.product, (prev.get(l.product) ?? 0) + l.amount);
  });
  const rows = [...new Set([...cur.keys(), ...prev.keys()])].map((product) => {
    const c = cur.get(product) ?? 0, p = prev.get(product) ?? 0;
    return { product, prev: p, cur: c, change: p ? round((c - p) / p * 100, 1) : null, delta: c - p };
  }).filter((r) => Math.max(r.prev, r.cur) >= minBase);
  return {
    risers: rows.filter((r) => r.delta > 0 && (r.change === null || r.change >= 10)).sort((a, b) => b.delta - a.delta).slice(0, top),
    fallers: rows.filter((r) => r.delta < 0 && (r.change ?? 0) <= -10).sort((a, b) => a.delta - b.delta).slice(0, top),
  };
}

/** month heatmap: the top items (or channels) by revenue × the last months */
export function monthMatrix(lines: SaleLine[], dim: 'product' | 'channel', opts: { months?: number; top?: number } = {}) {
  const L = clean(lines), months = [...new Set(L.map((l) => l.date.slice(0, 7)))].sort().slice(-(opts.months ?? 12));
  const key = (l: SaleLine) => (dim === 'product' ? l.product : l.channel) || 'غير محدد';
  const totals = new Map<string, number>(); L.forEach((l) => totals.set(key(l), (totals.get(key(l)) ?? 0) + l.amount));
  const rows = [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, opts.top ?? 8).map(([k]) => k);
  const values = rows.map((r) => months.map((m) => L.filter((l) => key(l) === r && l.date.startsWith(m)).reduce((a, l) => a + l.amount, 0)));
  return { rows, cols: months, values, max: Math.max(0, ...values.flat()) };
}

export type Idea = { id: string; title: string; body: string; metric: string };

/** the whole lab for one set of lines */
export function salesLab(lines: SaleLine[], asOf: string) {
  const L = clean(lines).filter((l) => l.date <= asOf);
  const daily = dailySeries(L, { to: L.length ? asOf : undefined });
  const ma7 = movingAverage(daily.values, 7);
  const monthly = monthlySeries(L);
  const fc = linearForecast(daily.values, 30);
  const invoices = invoiceStats(L);
  const race = momentum(L, asOf);
  const desc = describe(daily.values.slice(-90));
  /* concentration: the top ten items' share and the Herfindahl index over items */
  const byItem = new Map<string, number>(); L.forEach((l) => byItem.set(l.product, (byItem.get(l.product) ?? 0) + l.amount));
  const tot = [...byItem.values()].reduce((a, b) => a + b, 0), shares = [...byItem.values()].sort((a, b) => b - a).map((v) => (tot ? v / tot : 0));
  const top10Share = round(shares.slice(0, 10).reduce((a, b) => a + b, 0), 4), hhi = Math.round(shares.reduce((a, s) => a + (s * 100) ** 2, 0));
  const qtyRevenue = pearson(L.map((l) => l.qty), L.map((l) => l.amount));
  /* weekdays (0 = Sunday) and channels over the last 60 days vs the 60 before */
  const wd = Array(7).fill(0); daily.labels.forEach((d, i) => { wd[new Date(d + 'T00:00:00Z').getUTCDay()] += daily.values[i]; });
  const end = dayT(asOf), chan = new Map<string, { cur: number; prev: number }>();
  L.forEach((l) => { const age = (end - dayT(l.date)) / DAY, k = l.channel || 'غير محدد', x = chan.get(k) ?? { cur: 0, prev: 0 }; if (age < 60) x.cur += l.amount; else if (age < 120) x.prev += l.amount; chan.set(k, x); });
  const customers = new Map<string, Set<string>>(); L.forEach((l, i) => { if (!l.customerId) return; const s = customers.get(l.customerId) ?? new Set<string>(); s.add(l.invoice || 'line-' + i); customers.set(l.customerId, s); });
  const repeatRate = customers.size ? round([...customers.values()].filter((s) => s.size > 1).length / customers.size, 3) : null;
  const monthCv = describe(monthly.map((m) => m.revenue)).cv;
  return { asOf, daily, ma7, monthly, forecast: fc, invoices, momentum: race, stats: { daily: desc, top10Share, hhi, qtyRevenue, trendSlope: fc.slope, repeatRate, monthCv },
    weekdays: wd, channels: [...chan.entries()].map(([name, x]) => ({ name, cur: x.cur, prev: x.prev, growth: x.prev ? round((x.cur - x.prev) / x.prev * 100, 1) : null })).sort((a, b) => b.cur - a.cur),
    ideas: growthIdeas({ invoices, weekdays: wd, channels: [...chan.entries()].map(([name, x]) => ({ name, growth: x.prev ? (x.cur - x.prev) / x.prev * 100 : null })), repeatRate, top10Share, monthly, slope: fc.slope, products: [...byItem.keys()] }) };
}

const DAYS_AR = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const sar = (h: number) => Math.round(h / 100).toLocaleString('en-US');

/** rule-based growth ideas: each fires only when the numbers call for it, and says which number */
export function growthIdeas(x: { invoices: ReturnType<typeof invoiceStats>; weekdays: number[]; channels: { name: string; growth: number | null }[]; repeatRate: number | null; top10Share: number; monthly: { month: string; revenue: number }[]; slope: number; products: string[] }): Idea[] {
  const out: Idea[] = [];
  const avg = x.invoices.mean;
  if (avg > 0 && avg < 30000) { const t = Math.max(10000, Math.ceil(x.invoices.p90 * 0.8 / 5000) * 5000); out.push({ id: 'voucher', title: 'قسيمة الحظ بعد الفاتورة', body: 'كل فاتورة فوق ' + sar(t) + ' ر.س تدخل سحباً أسبوعياً — يرفع متوسط السلة ويحفّز العودة.', metric: 'متوسط الفاتورة ' + sar(avg) + ' ر.س' }); }
  if (x.repeatRate !== null && x.repeatRate < 0.45) out.push({ id: 'subscription', title: 'اشتراك «بوكس الأسبوع»', body: 'صندوق أسبوعي بسعر ثابت يحوّل المشتري لمرة واحدة إلى دخل متكرر يمكن التخطيط له.', metric: 'نسبة العملاء المكررين ' + Math.round(x.repeatRate * 100) + '٪' });
  const growing = x.channels.filter((c) => c.growth !== null && c.growth >= 15).sort((a, b) => (b.growth ?? 0) - (a.growth ?? 0))[0];
  if (growing) out.push({ id: 'referral', title: 'إحالة في قناة ' + growing.name, body: 'القناة تنمو — حوّل أفضل عملائها إلى مسوّقين بكود إحالة شخصي بعمولة صغيرة.', metric: 'نمو ' + Math.round(growing.growth ?? 0) + '٪ خلال 60 يوماً' });
  const tw = x.weekdays.reduce((a, b) => a + b, 0), avgD = tw / 7, weakest = x.weekdays.indexOf(Math.min(...x.weekdays));
  if (tw > 0 && x.weekdays[weakest] < avgD * 0.8) out.push({ id: 'slow-day', title: 'إنعاش يوم ' + DAYS_AR[weakest], body: 'عرض خاص أو توصيل مجاني في أضعف أيام الأسبوع يوزّع الطلب ويخفف ضغط أيام الذروة.', metric: 'إيراد ' + DAYS_AR[weakest] + ' أقل من المتوسط بـ' + Math.round((1 - x.weekdays[weakest] / avgD) * 100) + '٪' });
  if (x.products.some((p) => /بوكس/.test(p))) out.push({ id: 'pricing', title: 'تسعير نفسي للبوكسات', body: 'أسعار تنتهي بـ9 وثلاث درجات (اقتصادي، عائلي، فاخر) توجّه الاختيار نحو الوسط الأعلى هامشاً.', metric: 'بوكسات في الكتالوج' });
  const mc = x.monthly.length >= 4 ? describe(x.monthly.map((m) => m.revenue)) : null;
  if (mc && (mc.cv ?? 0) > 0.2) { const peaks = [...x.monthly].sort((a, b) => b.revenue - a.revenue).slice(0, 2).map((m) => m.month); out.push({ id: 'seasons', title: 'تقويم المواسم', body: 'جهّز المخزون والعروض قبل أشهر الذروة (' + peaks.join('، ') + ') واحجز أسعار الموردين مبكراً.', metric: 'تذبذب شهري ' + Math.round((mc.cv ?? 0) * 100) + '٪' }); }
  if (x.top10Share > 0.7) out.push({ id: 'concentration', title: 'إدارة مخاطر التركّز', body: 'عشرة أصناف تصنع معظم الإيراد — أمّن مورداً بديلاً لأعلاها وجرّب صنفين جديدين كل شهر.', metric: 'حصة أعلى 10 أصناف ' + Math.round(x.top10Share * 100) + '٪' });
  if (x.slope < 0) out.push({ id: 'slowdown', title: 'كسر موجة التباطؤ', body: 'الاتجاه اليومي هابط — حملة استعادة للعملاء الغائبين وعرض محدود المدة قبل نهاية الشهر.', metric: 'ميل الاتجاه ' + sar(x.slope) + ' ر.س/يوم' });
  else if (x.slope > 0) out.push({ id: 'growth', title: 'ركوب موجة النمو', body: 'الاتجاه صاعد — ثبّت التوريد وارفع حدود المخزون للأصناف الصاعدة قبل أن تنفد.', metric: 'ميل الاتجاه +' + sar(x.slope) + ' ر.س/يوم' });
  return out;
}
