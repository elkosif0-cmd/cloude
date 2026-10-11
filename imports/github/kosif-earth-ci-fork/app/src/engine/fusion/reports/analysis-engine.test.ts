import { describe, expect, it } from 'vitest';
import { parseTrialBalance, SAMPLE_TB_CSV } from './tb-import-engine';
import { buildStatements } from './statements-engine';
import { altmanZ, benford, beneishM, commonSize, dupont, freeCashFlow, highlights, horizontal, mdna, ratios } from './analysis-engine';

const fs = buildStatements(parseTrialBalance(SAMPLE_TB_CSV));
const R = (k: string) => ratios(fs).find((r) => r.key === k)!;

describe('financial analysis', () => {
  it('computes ratios with comparatives', () => {
    expect(R('grossMargin')).toMatchObject({ current: 40, prior: 37.5 });
    expect(R('operatingMargin').current).toBe(20);
    expect(R('netMargin').current).toBe(17.4);
    expect(R('current').current).toBe(3.73);
    expect(R('quick').current).toBe(3.07);
    expect(R('dso').current).toBe(58);
    expect(R('dio').current).toBe(61);
    expect(R('dpo').current).toBe(85);
    expect(R('ccc').current).toBe(34);
    expect(R('interestCover').current).toBe(12.5);
    expect(R('gearing').current).toBe(-27.78);
    expect(R('cfoToProfit').current).toBe(1.16);
    expect(R('cfoToProfit').prior).toBeNull();
  });
  it('derives free cash flow, common-size and horizontal analysis', () => {
    expect(freeCashFlow(fs)).toBe(8100000);
    expect(commonSize(fs).pl.find((r) => r.key === 'gross')?.current).toBe(40);
    expect(commonSize(fs).sfp.find((r) => r.key === 'assets')?.current).toBe(100);
    const rev = horizontal(fs).find((r) => r.key === 'revenue')!;
    expect(rev).toMatchObject({ change: 10000000, changePct: 25 });
  });
  it('decomposes ROE (DuPont) and scores Altman Z″ and Beneish M', () => {
    const d = dupont(fs).current;
    expect(d.roe).toBeCloseTo(37.83, 1);
    const z = altmanZ(fs)!;
    expect(z.zone).toBe('safe');
    expect(z.components.x1).toBe(0.49);
    const b = beneishM(fs)!;
    expect(b.components.sgi).toBe(1.25);
    expect(typeof b.flagged).toBe('boolean');
  });
  it('tests Benford conformity with Nigrini bands', () => {
    const ideal: number[] = [];
    [301, 176, 125, 97, 79, 67, 58, 51, 46].forEach((n, i) => { for (let j = 0; j < n; j++) ideal.push((i + 1) * 100000 + j * 7); });
    const b = benford(ideal);
    expect(b.n).toBe(1000);
    expect(b.conformity).toBe('close');
    expect(benford([5000000, 5100000, 5200000]).conformity).toBe('nonconformity');
    expect(benford([]).conformity).toBe('insufficient');
  });
  it('builds the highlights strip and a numbers-only MD&A', () => {
    const h = highlights(fs);
    expect(h.find((x) => x.key === 'revenue')?.change).toBe(25);
    expect(h.find((x) => x.key === 'fcf')?.current).toBe(8100000);
    const text = mdna(fs).flatMap((s) => s.body).join(' ');
    expect(text).toContain('500,000 ريال');
    expect(text).toContain('بنمو 25%');
    expect(text).toContain('Altman');
  });
});
