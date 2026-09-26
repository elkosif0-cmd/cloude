import { describe, expect, it } from 'vitest';
import { BUNDLE, checkMateriality, KAMS, kamLibrary, MATERIALITY, materialityPractice, precedentsFor, REPORTS, reportOf, sectorFromActivity, SOURCES, summary, THEMES, themeStats } from './global-benchmarks-engine';

describe('global benchmarks — the data', () => {
  it('covers the whole bundle with contiguous, non-overlapping page ranges', () => {
    const sorted = [...REPORTS].sort((a, b) => a.pages[0] - b.pages[0]);
    expect(sorted[0].pages[0]).toBe(2); // page 1 is the source index
    for (let i = 1; i < sorted.length; i++) expect(sorted[i].pages[0]).toBe(sorted[i - 1].pages[1] + 1);
    expect(sorted.at(-1)!.pages[1]).toBe(BUNDLE.pages);
    expect(new Set(REPORTS.map((r) => r.id)).size).toBe(REPORTS.length);
  });
  it('every KAM belongs to a report, cites a page inside it and has a known theme', () => {
    for (const k of KAMS) {
      const r = reportOf(k.report);
      expect(r, k.report).toBeTruthy();
      expect(k.page).toBeGreaterThanOrEqual(r.pages[0]);
      expect(k.page).toBeLessThanOrEqual(r.pages[1]);
      expect(THEMES[k.theme]).toBeTruthy();
    }
  });
  it('every materiality case belongs to a report and keeps its figures consistent', () => {
    for (const m of MATERIALITY) {
      const r = reportOf(m.report);
      expect(m.page).toBeGreaterThanOrEqual(r.pages[0]);
      expect(m.page).toBeLessThanOrEqual(r.pages[1]);
      if (m.threshold) expect(m.threshold).toBeLessThan(m.overall);
      if (m.performancePct) expect(m.performancePct).toBeLessThan(1);
    }
  });
  it('lists the 30 official sources of the bundle cover, all https', () => {
    expect(SOURCES).toHaveLength(30);
    expect(SOURCES.every((s) => s.url.startsWith('https://'))).toBe(true);
    expect(SOURCES.some((s) => s.name === 'Saudi Tadawul')).toBe(true);
  });
  it('keeps the Saudi report: Aramco, PwC, SAR 26.25bn on income before income taxes and zakat', () => {
    const a = MATERIALITY.find((m) => m.report === 'aramco-2025')!;
    expect(a.currency).toBe('SAR');
    expect(a.overall).toBe(26.25e9);
    expect(a.threshold).toBe(1.88e9);
    expect(reportOf('aramco-2025').auditor).toMatch(/Pricewaterhouse/);
    expect(KAMS.filter((k) => k.report === 'aramco-2025')).toHaveLength(3);
  });
});

describe('global benchmarks — queries', () => {
  it('filters the library by theme, sector, standard and text', () => {
    const ecl = kamLibrary({ theme: 'credit-losses' });
    expect(ecl.length).toBeGreaterThan(5);
    expect(ecl.every((k) => k.theme === 'credit-losses')).toBe(true);
    expect(kamLibrary({ sector: 'pharma', theme: 'revenue-deductions' }).every((k) => k.sector === 'pharma')).toBe(true);
    expect(kamLibrary({ standard: 'PCAOB' }).every((k) => k.standard === 'PCAOB')).toBe(true);
    expect(kamLibrary({ q: 'gillette' })).toHaveLength(1);
    expect(kamLibrary({ q: 'خسائر' }).length).toBeGreaterThan(0); // Arabic theme label
  });
  it('ranks themes by frequency and counts every KAM once', () => {
    const s = themeStats();
    expect(s.reduce((n, t) => n + t.count, 0)).toBe(KAMS.length);
    for (let i = 1; i < s.length; i++) expect(s[i - 1].count).toBeGreaterThanOrEqual(s[i].count);
  });
  it('reads a sector from Arabic or English activity text', () => {
    expect(sectorFromActivity('تجارة اللحوم والأغنام')).toBe('fmcg');
    expect(sectorFromActivity('مصرف تجاري')).toBe('banking');
    expect(sectorFromActivity('Software as a service')).toBe('tech');
    expect(sectorFromActivity('')).toBe('');
  });
  it('finds precedents for a statement line, same sector first', () => {
    const p = precedentsFor('revenue', { sector: 'pharma', limit: 2 });
    expect(p.map((x) => x.theme)).toContain('revenue-deductions');
    const rd = p.find((x) => x.theme === 'revenue-deductions')!;
    expect(rd.examples).toHaveLength(2);
    expect(rd.examples[0].sector).toBe('pharma');
    expect(rd.procedures.length).toBeGreaterThan(2);
    expect(precedentsFor('receivables').some((x) => x.theme === 'credit-losses')).toBe(true);
    expect(precedentsFor('no-such-line')).toEqual([]);
  });
});

describe('global benchmarks — materiality', () => {
  it('derives the observed ranges from the disclosures', () => {
    const p = materialityPractice();
    expect(p.performance).toEqual({ min: 0.65, max: 0.75, n: 5 });
    expect(p.profit!.min).toBeLessThanOrEqual(0.05);
    expect(p.profit!.max).toBeCloseTo(0.0559, 4);
    expect(p.threshold!.min).toBeGreaterThan(0.03);
    expect(p.parentAssets).toEqual({ min: 0.0035, max: 0.0075, n: 4 });
  });
  it('the app default (5% of profit before zakat, 75%, 5%) sits within disclosed practice', () => {
    const c = checkMateriality({ benchmark: 'pbz', rate: 0.05, performanceRate: 0.75, trivialRate: 0.05 });
    expect(c.map((x) => x.status)).toEqual(['within', 'within', 'within']);
  });
  it('ignores rounding of the engagement amounts (performance 75,100 of 100,100 is still 75%)', () => {
    expect(checkMateriality({ benchmark: 'pbz', rate: 0.05, performanceRate: 75100 / 100100, trivialRate: 5000 / 100100 }).map((x) => x.status)).toEqual(['within', 'within', 'within']);
  });
  it('flags choices outside disclosed practice', () => {
    const c = checkMateriality({ benchmark: 'pbz', rate: 0.1, performanceRate: 0.9, trivialRate: 0.2 });
    expect(c.map((x) => x.status)).toEqual(['above', 'above', 'above']);
    expect(checkMateriality({ benchmark: 'assets', rate: 0.01, performanceRate: 0.75, trivialRate: 0.05 })[0].status).toBe('above');
    expect(checkMateriality({ benchmark: 'revenue', rate: 0.01, performanceRate: 0.75, trivialRate: 0.05 })[0].status).toBe('no-precedent');
  });
  it('summarises the bundle', () => {
    const s = summary();
    expect(s.reports).toBe(REPORTS.length);
    expect(s.kams).toBe(KAMS.length);
    expect(s.pcaob + s.isa).toBe(KAMS.length);
    expect(s.auditors.map(([f]) => f).slice(0, 4).sort()).toEqual(['Deloitte', 'EY', 'KPMG', 'PwC']);
  });
});
