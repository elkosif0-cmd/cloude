import { describe, expect, it } from 'vitest';
import { AUDIT_QUALITY, benchmarkReport, REFERENCE_REPORTS, SOURCES } from './research-library-engine';

describe('global financial reports centre', () => {
  it('carries the 30 sources of the bundle index plus the Saudi and Egyptian ones', () => {
    expect(SOURCES.filter((s) => s.origin === 'bundle')).toHaveLength(30);
    expect(new Set(SOURCES.map((s) => s.url)).size).toBe(SOURCES.length);
    for (const s of SOURCES) expect(s.url).toMatch(/^https:\/\//);
    expect(SOURCES.some((s) => s.region === 'مصر')).toBe(true);
    expect(REFERENCE_REPORTS.find((r) => r.company === 'Amazon' && r.year === '2023')!.evidence).toContain('ص3');
  });
  it('benchmarks a report pack against global annual reports', () => {
    const b = benchmarkReport({ highlights: true, mdna: true, statements: true, cashFlow: true, notes: true, ratios: true, kams: true, opinion: true, managementLetter: true, comparatives: true });
    expect(b.covered).toBe(10);
    expect(b.gaps).toEqual(['المعلومات القطاعية (IFRS 8)', 'الاستدامة والمناخ (IFRS S1/S2)', 'تقرير عن فعالية الرقابة الداخلية']);
    expect(AUDIT_QUALITY.length).toBeGreaterThanOrEqual(6);
  });
});
