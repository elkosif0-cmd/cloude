import { describe, expect, it } from 'vitest';
import { openingRequests, procedureLeague, PROC_DOCS, THEME_PROCS } from './opening-requests-engine';
import { KAMS } from './global-benchmarks-engine';

describe('the first request list from what the bundle auditors relied on', () => {
  it('counts every theme of the bundle matters', () => {
    const themes = new Set(KAMS.map((k) => k.theme));
    for (const t of themes) expect(THEME_PROCS[t], t).toBeTruthy();
    for (const tp of Object.values(THEME_PROCS)) for (const [k, n] of Object.entries(tp.procs)) { expect(PROC_DOCS[k as keyof typeof PROC_DOCS]).toBeTruthy(); expect(n).toBeLessThanOrEqual(tp.reports); }
  });
  it('asks, for a goodwill matter, for the forecasts, the discount-rate workings and the valuation experts first', () => {
    const r = openingRequests(['impairment-intangibles']);
    expect(r[0].proc).toBe('forecasts');
    expect(r.map((x) => x.proc)).toEqual(['forecasts', 'discount_rates', 'specialists']);
    expect(r[0].used).toBe(9);
    expect(r[0].priority).toBe('عالية');
    expect(r[0].precedents.length).toBeGreaterThan(0);
    expect(r[0].lineKey).toBe('intangibles');
  });
  it('never repeats a document and ranks the league of procedures', () => {
    const r = openingRequests(['credit-losses', 'tax-uncertainty', 'provisions-litigation']);
    expect(new Set(r.map((x) => x.id)).size).toBe(r.length);
    expect(procedureLeague()[0].matters).toBeGreaterThanOrEqual(procedureLeague()[1].matters);
  });
});
