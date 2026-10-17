import { describe, expect, it } from 'vitest';
import { ALTERNATIVES, followUpRequests, followUpSummary, openingRequests, procedureLeague, PROC_DOCS, THEME_PROCS, type RoundOneState } from './opening-requests-engine';
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

describe('the second round: what the engagement asks for once the first answers are in', () => {
  const first = openingRequests(['impairment-intangibles', 'credit-losses']);
  const state = (m: Record<string, RoundOneState>) => (id: string) => m[id] ?? 'open';
  const id = (theme: string, proc: string) => 'PBC-W-' + theme + '-' + proc;

  it('replaces an unavailable forecast with an independent estimate and a look-back at last year (ISA 540)', () => {
    const r = followUpRequests(first, state({ [id('impairment-intangibles', 'forecasts')]: 'unavailable' }));
    const alt = r.filter((x) => x.reason === 'alternative' && x.theme === 'impairment-intangibles');
    expect(alt.map((x) => x.proc).sort()).toEqual(['independent_estimate', 'retrospective']);
    for (const x of alt) { expect(x.round).toBe(2); expect(x.basis).toMatch(/ISA 540/); expect(x.from).toBe(id('impairment-intangibles', 'forecasts')); expect(x.priority).toBe('عالية'); }
  });
  it('asks again, for what is missing, when a document came back incomplete', () => {
    const r = followUpRequests(first, state({ [id('credit-losses', 'forecasts')]: 'partial' }));
    const s = r.find((x) => x.reason === 'supplement');
    expect(s?.proc).toBe('forecasts'); expect(s?.theme).toBe('credit-losses'); expect(s?.title).toMatch(/^استكمال: /);
  });
  it('deepens a theme whose first answers were accepted with the next procedures the bundle auditors relied on', () => {
    const r = followUpRequests(first, state({ [id('impairment-intangibles', 'forecasts')]: 'accepted' }));
    const deep = r.filter((x) => x.reason === 'deepen' && x.theme === 'impairment-intangibles');
    const round1 = new Set(first.filter((x) => x.theme === 'impairment-intangibles').map((x) => x.proc));
    expect(deep.length).toBe(2);
    for (const x of deep) { expect(round1.has(x.proc)).toBe(false); expect(x.used).toBe(4); expect(x.of).toBe(10); }
  });
  it('repeats nothing for a theme still unanswered, and never re-asks a procedure the first round asked', () => {
    expect(followUpRequests(first, () => 'open')).toEqual([]);
    const all = followUpRequests(first, () => 'unavailable');
    const round1 = new Map<string, Set<string>>();
    for (const x of first) round1.set(x.theme, new Set([...(round1.get(x.theme) ?? []), x.proc]));
    for (const x of all) expect(round1.get(x.theme)?.has(x.proc)).toBe(false);
    expect(new Set(all.map((x) => x.id)).size).toBe(all.length);
  });
  it('covers every procedure the first round can ask with an alternative the standards allow, citing an ISA', () => {
    for (const [k, v] of Object.entries(ALTERNATIVES)) { expect(PROC_DOCS[k as keyof typeof PROC_DOCS]).toBeTruthy(); expect(v!.basis).toMatch(/ISA \d{3}/); for (const t of v!.to) expect(PROC_DOCS[t]).toBeTruthy(); }
    const askable = new Set(first.map((x) => x.proc));
    for (const k of askable) expect(ALTERNATIVES[k], k).toBeTruthy();
  });
  it('summarises the second round per theme', () => {
    const st = state({ [id('impairment-intangibles', 'forecasts')]: 'unavailable', [id('impairment-intangibles', 'discount_rates')]: 'accepted' });
    const s = followUpSummary(first, st).find((x) => x.theme === 'impairment-intangibles')!;
    expect(s.accepted).toBe(1); expect(s.alternative).toBeGreaterThan(0); expect(s.deepen).toBeGreaterThan(0);
    expect(followUpSummary(first, st).find((x) => x.theme === 'credit-losses')!.open).toBe(first.filter((x) => x.theme === 'credit-losses').length);
  });
});
