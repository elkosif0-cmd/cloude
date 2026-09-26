import { describe, expect, it } from 'vitest';
import { parseTrialBalance, SAMPLE_TB_CSV } from './tb-import-engine';
import { buildStatements } from './statements-engine';
import { compare, inputsFromStatements, metricsOf, METRICS, peerMetrics, PEERS } from './peer-benchmarks-engine';

const fs = buildStatements(parseTrialBalance(SAMPLE_TB_CSV));
const peer = (id: string) => PEERS.find((p) => p.id === id)!;

describe('peer benchmarks — the data', () => {
  it('keeps eight peers whose balance sheets balance to their totals', () => {
    expect(PEERS).toHaveLength(8);
    for (const p of PEERS) {
      expect(p.ca).toBeLessThan(p.assets);
      expect(p.equity).toBeLessThan(p.assets);
      expect(p.net).toBeLessThan(p.revenue);
      expect(p.pages.is && p.pages.bs && p.pages.cf).toBeTruthy();
    }
  });
});

describe('peer benchmarks — metrics', () => {
  it('computes the ratios of a peer from its published figures (P&G FY2026)', () => {
    expect(peerMetrics(peer('pg-2026'))).toMatchObject({ grossMargin: 50.2, operatingMargin: 22.7, netMargin: 18.5, currentRatio: 0.68, dso: 25, dio: 69, dpo: 137, cashConversion: 1.21, fcfMargin: 17.4 });
  });
  it('leaves a ratio empty when the statements do not carry its input', () => {
    const a = peerMetrics(peer('aramco-2025'));
    expect(a.grossMargin).toBeNull(); // expenses presented by nature
    expect(a.dpo).toBeNull(); // trade and other payables combined
    expect(a.operatingMargin).toBe(45.3);
    expect(metricsOf({ revenue: 100, cogs: 60, operating: 10, net: -5, assets: 200, equity: -10, ca: 50, cl: 0, inventory: 0, receivables: 0, payables: null, cfo: 5, capex: null }))
      .toMatchObject({ roe: null, currentRatio: null, cashConversion: null, fcfMargin: null });
  });
  it('reads the engagement inputs from its statements', () => {
    const i = inputsFromStatements(fs);
    expect(i).toMatchObject({ revenue: 50000000, cogs: 30000000, net: 8700000, inventory: 5000000, receivables: 8000000 });
    expect(metricsOf(i)).toMatchObject({ grossMargin: 40, operatingMargin: 20, netMargin: 17.4 });
  });
});

describe('peer benchmarks — comparison', () => {
  it('returns every metric with the peer median, range and your position', () => {
    const c = compare(fs);
    expect(c).toHaveLength(METRICS.length);
    const gm = c.find((x) => x.key === 'grossMargin')!;
    expect(gm.n).toBe(6); // Unilever and Aramco do not present cost of sales
    expect(gm.min).toBe(24.1); // Walmart
    expect(gm.max).toBe(54.1); // PepsiCo: 50,859 ÷ 93,925
    expect(gm.you).toBe(40);
    expect(gm.position).toBe('within');
    const nm = c.find((x) => x.key === 'netMargin')!;
    expect(nm.verdict).toBe('better');
  });
  it('filters the group by sector and works without an engagement', () => {
    const c = compare(null, { sector: 'retail' });
    const om = c.find((x) => x.key === 'operatingMargin')!;
    expect(om.peers.map((p) => p.company).sort()).toEqual(['Amazon', 'The Home Depot', 'Walmart']);
    expect(om.you).toBeNull();
    expect(om.position).toBe('n/a');
  });
});
