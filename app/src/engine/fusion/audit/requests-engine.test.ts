import { describe, expect, it } from 'vitest';
import { buildRequests, canConclude, EVIDENCE, LIBRARY, limitationImpact, nextRound, type LineRisk } from './requests-engine';

const risks: LineRisk[] = [
  { lineKey: 'cash', ar: 'النقد', amount: 400_000, significant: true, fraud: true },
  { lineKey: 'receivables', ar: 'الذمم المدينة', amount: 2_500_000, significant: true, estimate: true, fraud: true },
  { lineKey: 'inventory', ar: 'المخزون', amount: 60_000, significant: false, estimate: true },
  { lineKey: 'intangibles', ar: 'الشهرة', amount: 9_000_000, significant: true, estimate: true },
  { lineKey: 'revenue', ar: 'الإيرادات', amount: 30_000_000, significant: true, fraud: true },
  { lineKey: 'provisions', ar: 'المخصصات', amount: 700_000, significant: true, estimate: true },
];

describe('document requests', () => {
  it('has a routine layer, an area layer, the judgemental areas and completion, every one with an alternative', () => {
    expect(LIBRARY.length).toBeGreaterThan(55);
    expect(new Set(LIBRARY.map((t) => t.id)).size).toBe(LIBRARY.length);
    expect(LIBRARY.every((t) => t.alt && t.purpose && t.isa && EVIDENCE[t.kind])).toBe(true);
    expect(new Set(LIBRARY.map((t) => t.stage))).toEqual(new Set(['planning', 'area', 'kam', 'completion']));
  });

  it('asks what this engagement needs: material areas, the judgemental themes, and not what is immaterial', () => {
    const r = buildRequests({ risks, materiality: 500_000, hasPrior: true, themes: ['impairment-intangibles', 'provisions-litigation'] });
    const ids = r.map((x) => x.id);
    expect(ids).toEqual(expect.arrayContaining(['PL-01', 'PL-03', 'CA-01', 'AR-02', 'AR-03', 'KM-01', 'KM-02', 'KM-07', 'CM-03']));
    expect(ids).not.toContain('IN-01');                                 // inventory 60k: below materiality and not significant
    expect(ids).not.toContain('KM-12');                                 // no actuarial theme or balance
    expect(r.find((x) => x.id === 'KM-01')!.priority).toBe('عالية');
    expect(r.find((x) => x.id === 'KM-01')!.why).toContain('منطقة حكمية');
    expect(r[0].stage).toBe('planning');
    expect(r[r.length - 1].stage).toBe('completion');
    expect(r.find((x) => x.id === 'AR-02')!.reliability).toBe(3);      // a confirmation sent to the auditor directly
    expect(buildRequests({ risks, materiality: 500_000 }).map((x) => x.id)).not.toContain('PL-03');
  });

  it('runs the rounds: follow-ups for partial and rejected, limitations for unavailable, and knows when to stop', () => {
    const r = buildRequests({ risks, materiality: 500_000, themes: ['impairment-intangibles'] });
    const evals = r.map((x) => ({ id: x.id, verdict: 'accepted' as const, round: 1 }));
    evals.find((e) => e.id === 'AR-02')!.verdict = 'partial' as never;
    evals.find((e) => e.id === 'KM-01')!.verdict = 'unavailable' as never;
    const n = nextRound(r, evals, 2);
    expect(n.followUps).toHaveLength(1);
    expect(n.followUps[0].title).toContain('استكمال');
    expect(n.limitations.map((x) => x.id)).toEqual(['KM-01']);
    expect(canConclude(r, evals, 2).done).toBe(false);
    evals.find((e) => e.id === 'AR-02')!.verdict = 'accepted' as never;
    const c = canConclude(r, evals, 3);
    expect(c.done).toBe(true);
    expect(c.reason).toContain('أقرت الإدارة');
  });

  it('weighs what could not be obtained: no effect, except-for, or disclaimer', () => {
    const r = buildRequests({ risks, materiality: 500_000, themes: ['impairment-intangibles'] });
    const km = r.filter((x) => x.id === 'KM-01');
    expect(limitationImpact(km, risks, 500_000, 50_000_000).opinion).toBe('qualified');       // 9m of goodwill, one area
    expect(limitationImpact([], risks, 500_000).opinion).toBe('unmodified');
    expect(limitationImpact(r.filter((x) => x.id === 'CM-03'), risks, 500_000).opinion).toBe('disclaimer');
    const wide = r.filter((x) => ['AR-02', 'KM-01', 'RV-02', 'PR-01'].includes(x.id));
    expect(limitationImpact(wide, risks, 500_000, 50_000_000).opinion).toBe('disclaimer');
  });
});
