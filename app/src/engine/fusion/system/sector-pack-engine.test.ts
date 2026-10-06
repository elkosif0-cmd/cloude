import { describe, expect, it } from 'vitest';
import { BASE_ACCOUNTS, packAdditions, SECTOR_PACKS, sectorPack } from './sector-pack-engine';

const SECTORS = ['health', 'hospitality', 'construction', 'meat', 'digital', 'education', 'manufacturing', 'bakery', 'agriculture', 'trade'];

describe('sector packs: the same company structure behaves by sector', () => {
  it('every registry sector has a pack, built on the same base chart', () => {
    expect(Object.keys(SECTOR_PACKS).sort()).toEqual([...SECTORS].sort());
    for (const s of SECTORS) {
      const p = sectorPack(s), codes = p.accounts.map((a) => a[0]);
      for (const [code] of BASE_ACCOUNTS) expect(codes).toContain(code);
      expect(new Set(codes).size).toBe(codes.length);
      expect(p.costCenters.length).toBeGreaterThan(0);
    }
  });
  it('meat is a deep pack with the accounts its cutting run posts to', () => {
    const p = sectorPack('meat'), codes = p.accounts.map((a) => a[0]);
    expect(p.depth).toBe('deep');
    for (const c of ['1310', '1320', '1330', '5100']) expect(codes).toContain(c);
    expect(p.units).toContain('رأس'); expect(p.tools).toContain('carcass');
  });
  it('different sectors get different structures, not new labels on the same one', () => {
    const meat = sectorPack('meat'), health = sectorPack('health'), trade = sectorPack('trade');
    expect(meat.accounts.map((a) => a[0])).not.toEqual(health.accounts.map((a) => a[0]));
    expect(health.accounts.map((a) => a[0])).toContain('1210');
    expect(trade.accounts).toEqual(BASE_ACCOUNTS);
    expect(sectorPack('unknown')).toBe(trade); expect(sectorPack('')).toBe(trade);
  });
  it('applying a pack only adds what is missing', () => {
    const p = sectorPack('meat');
    const a = packAdditions(p, { accountCodes: ['1100', '1310'], definitions: { units: ['كجم'] }, tools: ['carcass'] });
    expect(a.accounts.map((x) => x[0])).not.toContain('1100');
    expect(a.accounts.map((x) => x[0])).not.toContain('1310');
    expect(a.definitions.units).not.toContain('كجم');
    expect(a.tools).not.toContain('carcass');
    const all = packAdditions(p, { accountCodes: p.accounts.map((x) => x[0]), definitions: { costCenters: [...p.costCenters], units: [...p.units], warehouses: [...p.warehouses] }, tools: [...p.tools] });
    expect(all.accounts).toEqual([]); expect(all.tools).toEqual([]); expect(all.definitions.units).toEqual([]);
  });
  it('the packs are frozen', () => {
    expect(Object.isFrozen(SECTOR_PACKS)).toBe(true); expect(Object.isFrozen(sectorPack('meat'))).toBe(true);
  });
});
