import { describe, expect, it } from 'vitest';
import { replayAll, replayCompany, sectorPrior, typicalKamCount } from './corpus-replay-engine';

describe('replaying the audit on the bundle companies', () => {
  const withPrior = replayAll(), without = replayAll({ prior: false });
  it('runs the full review on all 47 companies and compares with the 43 auditor reports that carry matters', () => {
    expect(withPrior.companies).toBe(47);
    expect(withPrior.withKams).toBe(43);
    expect(withPrior.list.every((r) => r.balanced && r.requests > 0)).toBe(true);
    /* #143: the replay is labelled for what it is — a simulation on published figures, not an audit engagement */
    expect(withPrior.status).toBe('simulation-only');
    expect(withPrior.reason).toMatch(/do not establish an audit engagement/);
  });
  it('reaches more of the reported matters when the sector practice of the bundle ranks them (leave-one-out)', () => {
    expect(withPrior.recall).toBeGreaterThan(without.recall);
    expect(withPrior.rankedRecall).toBeGreaterThanOrEqual(0.7);
    expect(withPrior.precision).toBeGreaterThan(without.precision);
  });
  it('never lets a company inform its own ranking', () => {
    const own = sectorPrior('banking'), loo = sectorPrior('banking', 'bofa-2025');
    expect(own['credit-losses']).toBe(1);
    expect(loo['credit-losses']).toBe(1);
    expect(Object.keys(sectorPrior('industrial', 'airbus-2023'))).toEqual([]);
  });
  it('sets its materiality against the materiality the auditors disclosed', () => {
    expect(withPrior.materiality.map((m) => m.id).sort()).toEqual(['airbus-2023', 'aramco-2025', 'astrazeneca-2025', 'bp-2025', 'gsk-2025', 'hsbc-2025', 'unilever-2025']);
    for (const m of withPrior.materiality) expect(m.ratio).toBeGreaterThan(0.4), expect(m.ratio).toBeLessThan(2);
    expect(typicalKamCount('PCAOB')).toBeLessThan(typicalKamCount('ISA'));
  });
  it('lays out its report with the sections the companies\' own reports carry', () => {
    expect(withPrior.structure).toBeGreaterThan(0.5);
    const r = replayCompany('aramco-2025')!;
    expect(r.structure.theirs).toBeGreaterThan(10);
    expect(r.structure.covered).toBeLessThanOrEqual(r.structure.theirs);
  });
  it('shows, for one company, what the auditor reported, with the pages, and whether the engine found it', () => {
    const r = replayCompany('jpmorgan-2025')!;
    expect(r.actual.find((a) => a.theme === 'credit-losses')!.found).toBe('selected');
    expect(r.actual[0].pages[0]).toBeGreaterThan(1342);
  });
});
