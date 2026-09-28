import { describe, expect, it } from 'vitest';
import { parseTrialBalance, SAMPLE_TB_CSV } from './tb-import-engine';
import { buildStatements } from './statements-engine';
import { benchmark, companyMetrics, corpusPeers, KEYS, quantile, sectors, summary } from './corpus-benchmarks-engine';

const fs = buildStatements(parseTrialBalance(SAMPLE_TB_CSV));

describe('corpus benchmarks — the peer set', () => {
  it('takes the 35 non-financial companies, never a bank or an insurer', () => {
    const all = corpusPeers();
    expect(all).toHaveLength(35);
    expect(all.some((p) => p.sector === 'banking' || p.sector === 'insurance')).toBe(false);
    for (const p of all) expect(p.pages.is && p.pages.bs).toBeTruthy();
  });
  it('leaves a ratio empty when the bundle does not break out its inputs, rather than scoring it zero', () => {
    const noInv = corpusPeers().filter((p) => p.metrics.dio === null);
    for (const p of noInv) expect(p.metrics.dio).toBeNull();
    expect(corpusPeers().every((p) => p.metrics.dso === null || p.metrics.dso > 0)).toBe(true);
  });
  it('offers only sectors with enough companies to compare', () => {
    const s = sectors(3);
    expect(s.length).toBeGreaterThan(2);
    expect(s.every((x) => x.companies >= 3)).toBe(true);
    expect(corpusPeers(s[0].id)).toHaveLength(s[0].companies);
  });
});

describe('corpus benchmarks — the company against the corpus', () => {
  it('quantiles interpolate', () => {
    expect(quantile([1, 2, 3, 4], 0.5)).toBe(2.5);
    expect(quantile([10], 0.25)).toBe(10);
    expect(quantile([], 0.5)).toBeNull();
  });
  it('compares every supported ratio with an ordered quartile band and three closest companies with pages', () => {
    const rows = benchmark(fs);
    expect(rows.map((r) => r.key)).toEqual(KEYS);
    for (const r of rows.filter((x) => x.n)) {
      expect(r.p25!).toBeLessThanOrEqual(r.median!);
      expect(r.median!).toBeLessThanOrEqual(r.p75!);
      if (r.you !== null) {
        expect(r.percentile).toBeGreaterThanOrEqual(0);
        expect(r.percentile).toBeLessThanOrEqual(100);
        expect(r.closest.length).toBe(Math.min(3, r.n));
        expect(r.closest.every((c) => c.page > 0)).toBe(true);
      }
    }
  });
  it('reads days in the direction that is better: long collection days are the weak side', () => {
    const base = benchmark(fs).find((r) => r.key === 'dso')!;
    const slow = { ...fs, keys: { ...fs.keys, receivables: { current: fs.keys.revenue.current * 2, prior: 0 } } } as typeof fs;
    const r = benchmark(slow).find((x) => x.key === 'dso')!;
    expect(r.you!).toBeGreaterThan(base.max ?? 0);
    expect(r.band).toBe('bottom');
    expect(r.weak).toBe(true);
    expect(r.check?.screen).toBe('receivables');
  });
  it('a ratio with no better direction is never called weak', () => {
    for (const r of benchmark(fs).filter((x) => x.higherIsBetter === null)) { expect(r.weak).toBe(false); expect(r.check).toBeNull(); }
  });
  it('without statements, shows the corpus alone', () => {
    const rows = benchmark(null);
    expect(rows.every((r) => r.you === null && r.band === 'n/a' && !r.weak)).toBe(true);
    expect(summary(rows).compared).toBe(0);
  });
  it('a sector filter narrows the corpus', () => {
    const s = sectors(3)[0].id;
    const all = benchmark(fs).find((r) => r.key === 'netMargin')!, one = benchmark(fs, { sector: s }).find((r) => r.key === 'netMargin')!;
    expect(one.n).toBeLessThan(all.n);
  });
});

describe('corpus benchmarks — the company on the corpus basis', () => {
  it('a year-to-date period annualises returns and counts days over the period itself', () => {
    const year = companyMetrics(fs, 365).m, half = companyMetrics(fs, 182.5).m;
    if (year.roa !== null) expect(half.roa).toBeCloseTo(year.roa * 2, 0);
    if (year.dso !== null) expect(half.dso).toBe(Math.round(year.dso / 2));
    expect(half.grossMargin).toBe(year.grossMargin);
  });
  it('no receivables at period end is «does not apply», never the best collection days', () => {
    const cash = { ...fs, keys: { ...fs.keys, receivables: { current: 0, prior: 0 } } } as typeof fs;
    const r = benchmark(cash).find((x) => x.key === 'dso')!;
    expect(r.you).toBeNull();
    expect(r.band).toBe('n/a');
    expect(r.note).toMatch(/لا ذمم مدينة/);
  });
});
