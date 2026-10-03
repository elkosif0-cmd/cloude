import { describe, expect, it } from 'vitest';
import { countAr, CUSTOMERS_AR, dayAdd, daysBetween, forecastDaily, ORDERS_AR, quintile, salesInsights, segmentOf, wapeWeekly, type InsightLine } from './sales-insights-engine';

const L = (date: string, amount: number, extra: Partial<InsightLine> = {}): InsightLine => ({ date, amount, qty: 1, product: 'نعيمي', ...extra });
/* n consecutive days from `from`, each with value f(day, index) */
const days = (from: string, n: number, f: (d: string, i: number) => number, extra: (d: string, i: number) => Partial<InsightLine> = () => ({})) =>
  Array.from({ length: n }, (_, i) => { const d = dayAdd(from, i); return L(d, f(d, i), { invoice: 'd' + i, ...extra(d, i) }); });

describe('sales insights — days, periods and KPIs', () => {
  it('does day arithmetic on UTC days, whatever the device time zone', () => {
    expect(dayAdd('2026-09-30', -29)).toBe('2026-09-01');
    expect(dayAdd('2026-09-30', 0)).toBe('2026-09-30');
    expect(dayAdd('2026-02-28', 1)).toBe('2026-03-01');
    expect(daysBetween('2026-08-31', '2026-09-30')).toBe(30);
  });

  it('compares exactly 30 days with the 30 days before them (no 31-day window)', () => {
    const r = salesInsights([L('2026-08-01', 700, { invoice: 'e' }), L('2026-08-02', 500, { invoice: 'd' }), L('2026-08-31', 1000, { invoice: 'a' }),
      L('2026-09-01', 2000, { invoice: 'b' }), L('2026-09-30', 3000, { invoice: 'c' })], [], { period: '30' });
    if (r.empty) throw new Error('empty');
    expect(r.period).toMatchObject({ from: '2026-09-01', to: '2026-09-30', days: 30, prevFrom: '2026-08-02', prevTo: '2026-08-31' });
    expect(r.kpis.revenue).toEqual({ cur: 5000, prev: 1500, delta: 233.3 });
    expect(r.trend.labels.length).toBe(30);
  });

  it('measures orders, average order, customers, new and repeat customers; a return is not a visit', () => {
    const r = salesInsights([L('2026-09-05', 1000, { invoice: 'o1', customerId: 'c1', qty: 2 }), L('2026-09-10', 2000, { invoice: 'o2', customerId: 'c1' }),
      L('2026-09-07', 4000, { invoice: 'o3', customerId: 'c2' }), L('2026-09-08', -500, { invoice: 'r1', customerId: 'c2' })], [], { period: '30' });
    if (r.empty) throw new Error('empty');
    const v = Object.fromEntries(Object.entries(r.kpis).map(([k, x]) => [k, x.cur]));
    expect(v).toEqual({ revenue: 6500, orders: 3, avgOrder: 2333, customers: 2, newCustomers: 2, repeatRate: 0.5, returns: 500, units: 5 });
    expect(r.kpis.revenue).toMatchObject({ prev: null, delta: null }); // no history before the window: no comparison, not «+∞»
    expect(r.period.prevFrom).toBeNull();
    expect(r.customers.find((c) => c.id === 'c2')).toMatchObject({ orders: 1, revenue: 3500, last: '2026-09-07' });
  });

  it('filters by channel and lists every channel for the picker', () => {
    const lines = [L('2026-09-01', 100, { channel: 'المتجر', invoice: 'a' }), L('2026-09-02', 300, { channel: 'التطبيق', invoice: 'b' })];
    const r = salesInsights(lines, [], { period: '30', channel: 'المتجر' });
    if (r.empty) throw new Error('empty');
    expect(r.kpis.revenue.cur).toBe(100);
    expect(r.channels).toEqual(['التطبيق', 'المتجر']);
    expect(salesInsights([], [], {}).empty).toBe(true);
  });

  it('averages each weekday over its occurrences in the period', () => {
    const r = salesInsights([L('2026-03-01', 1000, { invoice: 'a' }), L('2026-03-08', 3000, { invoice: 'b' }), L('2026-03-14', 600, { invoice: 'c' })], [], { period: 'all' });
    if (r.empty) throw new Error('empty');
    expect(r.period.days).toBe(14);
    expect(r.weekdays[0]).toMatchObject({ name: 'الأحد', days: 2, total: 4000, avg: 2000, orders: 2 });
    expect(r.weekdays[6]).toMatchObject({ name: 'السبت', days: 2, avg: 300 });
  });
});

describe('sales insights — forecast chosen by a backtest', () => {
  it('picks the weekday model for a weekly pattern and keeps Friday high', () => {
    const vals = Array.from({ length: 120 }, (_, i) => (new Date(Date.parse('2026-01-01T00:00:00Z') + i * 86400000).getUTCDay() === 5 ? 3000 : 1000));
    const asOf = dayAdd('2026-01-01', 119), f = forecastDaily(vals, asOf);
    expect(f.model).toBe('seasonal');
    expect(f.wape).toBeLessThan(0.05);
    expect(f.candidates.map((c) => c.model)).toEqual(['mean', 'linear', 'seasonal']);
    expect(f.labels[0]).toBe(dayAdd(asOf, 1));
    const fri = f.labels.findIndex((d) => new Date(d + 'T00:00:00Z').getUTCDay() === 5), sat = fri + 1;
    expect(f.daily[fri] / f.daily[sat]).toBeGreaterThan(2.5);
    expect(f.low).toBeLessThanOrEqual(f.total);
    expect(f.high).toBeGreaterThanOrEqual(f.total);
  });

  it('scores the backtest on weekly sums, so a sale landing a day early is not an error', () => {
    const a = Array.from({ length: 30 }, (_, i) => (i % 7 === 0 ? 700 : 0)), f = Array.from({ length: 30 }, (_, i) => (i % 7 === 1 ? 700 : 0));
    expect(wapeWeekly(a, f)).toBe(0);
    expect(wapeWeekly(a, a.map(() => 0))).toBe(1);
    expect(wapeWeekly([0, 0, 0], [1, 1, 1])).toBeNull();
  });

  it('refuses to forecast from fewer than 14 days', () => {
    expect(forecastDaily([5, 5, 5, 5, 5, 5, 5, 5, 5, 5], '2026-01-10')).toMatchObject({ model: null, daily: [], total: 0 });
  });
});

describe('Arabic counts', () => {
  it('agrees the noun with the number', () => {
    expect([1, 2, 3, 10, 11, 103, 111].map((n) => countAr(n, ORDERS_AR))).toEqual(['طلب واحد', 'طلبان', '3 طلبات', '10 طلبات', '11 طلباً', '103 طلبات', '111 طلباً']);
    expect(countAr(5, CUSTOMERS_AR)).toBe('5 عملاء');
  });
});

describe('sales insights — RFM, follow-up, baskets and cohorts', () => {
  it('scores quintiles with shared scores for ties', () => {
    expect(quintile([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5]);
    expect(quintile([1, 1, 1, 1, 10])).toEqual([3, 3, 3, 3, 5]);
  });

  it('names a segment for every R/F/M combination', () => {
    expect([[1, 5, 5], [2, 3, 1], [1, 1, 1], [2, 1, 2], [5, 5, 5], [3, 4, 2], [5, 1, 1], [4, 2, 3], [3, 2, 2]].map(([r, f, m]) => segmentOf(r, f, m)))
      .toEqual(['cantLose', 'atRisk', 'lost', 'hibernating', 'champions', 'loyal', 'newcomers', 'potential', 'attention']);
  });

  it('flags a big customer who stopped buying, and segments always add up', () => {
    const big = Array.from({ length: 10 }, (_, i) => L(dayAdd('2026-01-01', i * 7), 9000, { invoice: 'big' + i, customerId: 'big' }));
    const small = Array.from({ length: 9 }, (_, i) => L(dayAdd('2026-08-20', i * 3), 500, { invoice: 's' + i, customerId: 'c' + i }));
    const r = salesInsights([...big, ...small], [{ id: 'big', name: 'مطعم الريف', phone: '0500000000' }], { period: '90' });
    if (r.empty) throw new Error('empty');
    expect(r.customers.find((c) => c.id === 'big')).toMatchObject({ segment: 'cantLose', name: 'مطعم الريف', orders: 10 });
    expect(r.segments.reduce((a, s) => a + s.count, 0)).toBe(r.customers.length);
    expect(r.recs.find((x) => x.id === 'cant-lose')).toMatchObject({ tone: 'bad', seg: 'cantLose' });
  });

  it('follows each customer up by their own rhythm', () => {
    const weekly = Array.from({ length: 6 }, (_, i) => L(dayAdd('2026-05-01', i * 7), 1000, { invoice: 'w' + i, customerId: 'c1' }));
    const monthly = ['2026-04-01', '2026-05-01', '2026-05-31'].map((d, i) => L(d, 2000, { invoice: 'm' + i, customerId: 'c2' }));
    const r = salesInsights([...weekly, ...monthly, L('2026-06-30', 800, { invoice: 'x', customerId: 'c3' }), L('2026-03-01', 5000, { invoice: 'y', customerId: 'c4' })], [], { period: '90' });
    if (r.empty) throw new Error('empty');
    expect(r.typicalCadence).toBe(7);
    expect(r.followup.map((p) => p.id)).toEqual(['c4', 'c1']);
    expect(r.followup[1]).toMatchObject({ status: 'overdue', personal: true, cadenceUsed: 7, daysSince: 25, expected: '2026-06-12', monthlyValue: 4286 });
    expect(r.followup[0]).toMatchObject({ personal: false, daysSince: 121 });
  });

  it('measures basket affinity with support, confidence and lift', () => {
    const o = (inv: string, d: string, items: string[]) => items.map((p) => L(d, 100, { invoice: inv, product: p }));
    const r = salesInsights([...o('o1', '2026-09-01', ['a', 'b']), ...o('o2', '2026-09-02', ['a', 'b']), ...o('o3', '2026-09-03', ['a']), ...o('o4', '2026-09-04', ['b', 'c']), ...o('o5', '2026-09-05', ['c'])], [], { period: '30' });
    if (r.empty) throw new Error('empty');
    expect(r.pairs).toEqual([{ a: 'a', b: 'b', count: 2, revenue: 400, support: 0.4, confAB: 0.667, confBA: 0.667, lift: 1.11 }]);
  });

  it('builds monthly acquisition cohorts', () => {
    const r = salesInsights([L('2026-01-10', 100, { invoice: 'a', customerId: 'c1' }), L('2026-02-05', 100, { invoice: 'b', customerId: 'c1' }),
      L('2026-01-20', 100, { invoice: 'c', customerId: 'c2' }), L('2026-02-03', 100, { invoice: 'd', customerId: 'c3' })], [], { period: 'all' });
    if (r.empty) throw new Error('empty');
    expect(r.cohorts.rows).toEqual(['2026-01', '2026-02']);
    expect(r.cohorts.sizes).toEqual([2, 1]);
    expect(r.cohorts.values[0].slice(0, 3)).toEqual([100, 50, null]);
    expect(r.cohorts.values[1].slice(0, 2)).toEqual([100, null]);
  });

  it('reports data quality, ABC and a health score of five visible parts', () => {
    const r = salesInsights([L('2026-09-01', 100, { invoice: 'a', customerId: 'c1' }), L('2026-09-01', 100, { invoice: 'a', customerId: 'c1' }), L('bad', 100), L('2026-09-02', 900, { invoice: 'b', product: 'حري' })], [], { period: '30' });
    if (r.empty) throw new Error('empty');
    expect(r.quality).toMatchObject({ lines: 4, missingDate: 1, missingCustomer: 1, duplicates: 1 });
    expect(r.quality.score).toBeLessThan(90);
    expect(r.products.map((p) => [p.name, p.cls])).toEqual([['حري', 'A'], ['نعيمي', 'B']]);
    expect(r.health.parts.map((p) => p.key)).toEqual(['growth', 'stability', 'diversity', 'retention', 'data']);
    expect(r.health.score).toBe(r.health.parts.reduce((a, p) => a + p.points, 0));
    expect(r.recs.some((x) => x.id === 'data')).toBe(true);
  });
});
