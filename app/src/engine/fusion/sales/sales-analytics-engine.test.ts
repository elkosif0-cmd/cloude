import { describe, expect, it } from 'vitest';
import { dailySeries, describe as desc, growthIdeas, invoiceStats, linearForecast, momentum, monthlySeries, monthMatrix, movingAverage, pearson, percentile, salesLab, type SaleLine } from './sales-analytics-engine';

const L = (date: string, amount: number, product = 'نعيمي', extra: Partial<SaleLine> = {}): SaleLine => ({ date, amount, qty: 1, product, ...extra });

describe('sales lab (the attached dashboard, as an engine)', () => {
  it('builds the daily series with gaps as zero and a 7-day moving average', () => {
    const s = dailySeries([L('2026-01-01', 100), L('2026-01-03', 300), L('2026-01-03', 50)]);
    expect(s).toEqual({ labels: ['2026-01-01', '2026-01-02', '2026-01-03'], values: [100, 0, 350] });
    expect(movingAverage([7, 7, 7, 7, 7, 7, 7, 14], 7)).toEqual([null, null, null, null, null, null, 7, 8]);
    expect(dailySeries([])).toEqual({ labels: [], values: [] });
  });

  it('reports monthly revenue, invoices and growth', () => {
    const m = monthlySeries([L('2026-01-05', 1000, 'a', { invoice: 'I1' }), L('2026-01-06', 500, 'b', { invoice: 'I1' }), L('2026-02-02', 3000, 'a', { invoice: 'I2' })]);
    expect(m).toEqual([{ month: '2026-01', revenue: 1500, invoices: 1, growth: null }, { month: '2026-02', revenue: 3000, invoices: 1, growth: 100 }]);
  });

  it('forecasts 30 days on a least-squares line with an 80% band', () => {
    const y = Array.from({ length: 60 }, (_, i) => 1000 + i * 10);
    const f = linearForecast(y, 30);
    expect(f.slope).toBe(10);
    expect(f.forecast[0]).toBe(1600);
    expect(f.total).toBe(Array.from({ length: 30 }, (_, k) => 1600 + k * 10).reduce((a, b) => a + b, 0));
    expect([f.low, f.high]).toEqual([f.total, f.total]); // a perfect line has no residual spread
    expect(linearForecast([1, 2, 3], 30).forecast).toEqual([]);
  });

  it('describes a sample: median, quartiles, skewness, CV; percentiles and correlation', () => {
    const d = desc([1, 2, 3, 4, 100]);
    expect([d.n, d.median, d.q1, d.q3, d.iqr, d.min, d.max]).toEqual([5, 3, 2, 4, 2, 1, 100]);
    expect(d.skew).toBeGreaterThan(2);
    expect(d.cv).toBeGreaterThan(1);
    expect(percentile([10, 20, 30, 40], 0.5)).toBe(25);
    expect(pearson([1, 2, 3, 4], [2, 4, 6, 8])).toBe(1);
    expect(pearson([1, 2], [1, 2])).toBeNull();
  });

  it('measures invoices: typical value, the top-10% threshold and the price bands', () => {
    const lines = [5000, 8000, 12000, 20000, 25000, 40000, 45000, 70000, 90000, 150000].map((a, i) => L('2026-03-0' + ((i % 9) + 1), a, 'x', { invoice: 'I' + i }));
    const s = invoiceStats(lines);
    expect([s.count, s.median, s.max]).toEqual([10, 32500, 150000]);
    expect(s.p90).toBe(96000);
    expect(s.bands.map((b) => b.count)).toEqual([2, 3, 2, 2, 1]);
    expect(s.bands.reduce((a, b) => a + b.share, 0)).toBeCloseTo(1, 3);
    expect(s.histogram.reduce((a, b) => a + b.count, 0)).toBe(10);
  });

  it('runs the momentum race over the last 30 days against the 30 before', () => {
    const lines = [L('2026-05-25', 200000, 'حري'), L('2026-04-20', 60000, 'حري'), L('2026-05-20', 20000, 'سواكني'), L('2026-04-15', 120000, 'سواكني'), L('2026-05-28', 900, 'صغير')];
    const m = momentum(lines, '2026-05-31');
    expect(m.risers.map((r) => [r.product, r.change])).toEqual([['حري', 233.3]]);
    expect(m.fallers.map((r) => [r.product, r.change])).toEqual([['سواكني', -83.3]]);
  });

  it('builds month heatmaps and fires growth ideas only when the numbers call for them', () => {
    const lines = [L('2026-01-02', 100, 'a', { channel: 'المتجر' }), L('2026-02-02', 300, 'a', { channel: 'التطبيق' }), L('2026-02-03', 50, 'b', { channel: 'المتجر' })];
    const mx = monthMatrix(lines, 'channel');
    expect([mx.rows, mx.cols, mx.values]).toEqual([['التطبيق', 'المتجر'], ['2026-01', '2026-02'], [[0, 300], [100, 50]]]);
    const inv = invoiceStats([L('2026-01-01', 15000, 'بوكس', { invoice: 'a' }), L('2026-01-02', 20000, 'بوكس', { invoice: 'b' })]);
    const ideas = growthIdeas({ invoices: inv, weekdays: [100, 100, 100, 100, 100, 100, 10], channels: [{ name: 'التطبيق', growth: 40 }], repeatRate: 0.2, top10Share: 0.9, monthly: [], slope: -50, products: ['بوكس الشواء'] });
    expect(ideas.map((i) => i.id)).toEqual(['voucher', 'subscription', 'referral', 'slow-day', 'pricing', 'concentration', 'slowdown']);
    expect(ideas.find((i) => i.id === 'slow-day')!.title).toBe('إنعاش يوم السبت');
    const lab = salesLab([...lines, L('2026-02-10', 400, 'a', { customerId: 'c1', invoice: 'x1' }), L('2026-02-12', 300, 'a', { customerId: 'c1', invoice: 'x2' })], '2026-02-28');
    expect(lab.daily.labels.at(-1)).toBe('2026-02-28');
    expect(lab.stats.repeatRate).toBe(1);
    expect(lab.monthly.length).toBe(2);
  });
});
