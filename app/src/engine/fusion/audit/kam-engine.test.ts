import { describe, expect, it } from 'vitest';
import { parseTrialBalance, SAMPLE_TB_CSV } from '../reports/tb-import-engine';
import { reviewTrialBalance } from './tb-review-engine';
import { KAM_LIBRARY, removedKams, suggestKams } from './kam-engine';

const tb = parseTrialBalance(SAMPLE_TB_CSV);
const r = reviewTrialBalance(tb);

describe('key audit matters library (ISA 701)', () => {
  it('every template carries a matter, a response with a retrospective or independent check, and standards', () => {
    for (const t of KAM_LIBRARY) {
      expect(t.response.length).toBeGreaterThanOrEqual(4);
      expect(t.standards.length).toBeGreaterThan(0);
    }
    const retro = KAM_LIBRARY.filter((t) => t.response.some((s) => /السنة السابقة|السنوات السابقة/.test(s)));
    expect(retro.map((t) => t.key)).toEqual(expect.arrayContaining(['revenue', 'ecl', 'inventory', 'provisions', 'zakat']));
  });
  it('suggests matters from the line risks with amounts, shares and note references', () => {
    const ks = suggestKams({ fs: r.fs, risks: r.risks, materiality: r.materiality.overall });
    expect(ks.length).toBeGreaterThan(0);
    const sel = ks.filter((k) => k.selected);
    expect(sel.length).toBeGreaterThanOrEqual(1);
    expect(sel.length).toBeLessThanOrEqual(3);
    const rev = ks.find((k) => k.key === 'revenue')!;
    expect(rev.description).toContain('ر.س');
    expect(rev.how).toContain('قبل نهاية السنة وبعدها');
    expect(rev.refs).toContain('IFRS 15');
    expect(ks.every((k, i) => i === 0 || ks[i - 1].score >= k.score)).toBe(true);
  });
  it('states the result from the evidence and marks new matters against last year', () => {
    const ks = suggestKams({ fs: r.fs, risks: r.risks, materiality: r.materiality.overall, evidence: { revenue: 'accepted' }, priorKeys: ['revenue', 'eosb'] });
    const rev = ks.find((k) => k.key === 'revenue')!;
    expect(rev.observation).toContain('لم تسفر');
    expect(rev.trend).toBe('same');
    expect(ks.filter((k) => !['revenue', 'eosb'].includes(k.key)).every((k) => k.trend === 'new')).toBe(true);
    expect(removedKams(['revenue', 'eosb'], ks.map((k) => ({ ...k, selected: k.key === 'revenue' })))).toEqual(['التزام مكافأة نهاية الخدمة للموظفين']);
  });
});
