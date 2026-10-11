import { describe, expect, it } from 'vitest';
import { parseTrialBalance, SAMPLE_TB_CSV } from '../reports/tb-import-engine';
import { reviewTrialBalance } from './tb-review-engine';
import { removedKams, suggestKams } from './kam-engine';

const r = reviewTrialBalance(parseTrialBalance(SAMPLE_TB_CSV));
const base = { fs: r.fs, risks: r.risks, materiality: r.materiality.overall };

describe('key audit matters drafted from line risks and the global precedents (ISA 701)', () => {
  it('ranks matters, selects at most three and writes each with amount, share, response and references', () => {
    const ks = suggestKams(base);
    expect(ks.length).toBeGreaterThan(0);
    const sel = ks.filter((k) => k.selected);
    expect(sel.length).toBeGreaterThanOrEqual(1);
    expect(sel.length).toBeLessThanOrEqual(3);
    expect(ks.every((k, i) => i === 0 || ks[i - 1].weight >= k.weight)).toBe(true);
    const k = ks[0];
    expect(k.description).toContain('ر.س');
    expect(k.description).toContain('% من مجموع الموجودات');
    expect(k.how.startsWith('شملت إجراءاتنا: ')).toBe(true);
    expect(k.refs.length).toBeGreaterThan(0);
  });
  it('uses the global theme and its real precedents when the line has one (one matter per theme)', () => {
    const ks = suggestKams(base);
    const withPrec = ks.filter((k) => k.examples.length);
    expect(withPrec.length).toBeGreaterThan(0);
    expect(new Set(ks.map((k) => k.key)).size).toBe(ks.length);
    expect(withPrec[0].examples[0].page).toBeGreaterThan(0);
  });
  it('states the result from the evidence and marks new or continuing matters against last year', () => {
    const first = suggestKams(base)[0];
    const ks = suggestKams({ ...base, evidence: Object.fromEntries(first.lineKeys.map((l) => [l, 'accepted'])), priorKeys: [first.key] });
    expect(ks[0].observation).toContain('لم تسفر');
    expect(ks[0].trend).toBe('same');
    expect(ks.slice(1).every((k) => k.trend === 'new')).toBe(true);
    expect(removedKams([first.key, 'actuarial'], ks.map((k) => ({ ...k, selected: k.key === first.key })))).toEqual(['الالتزامات الاكتوارية ومنافع الموظفين']);
  });
});
