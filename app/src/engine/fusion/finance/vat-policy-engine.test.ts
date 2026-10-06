import { describe, expect, it } from 'vitest';
import { normalizeRate, splitInclusive, STANDARD_RATES, vatPolicy } from './vat-policy-engine';

describe('the company VAT policy decides the posting rate', () => {
  it('follows the country standard rate', () => {
    expect(vatPolicy({ country: 'SA' })).toMatchObject({ registered: true, rate: 0.15, source: 'country' });
    expect(vatPolicy({ country: 'eg' })).toMatchObject({ rate: 0.14, country: 'EG' });
    expect(vatPolicy({ country: 'AE' }).rate).toBe(0.05);
    expect(vatPolicy({ country: 'BH' }).rate).toBe(0.1);
    expect(vatPolicy({ country: 'OM' }).rate).toBe(0.05);
  });
  it('posts no VAT where there is none, where the company is not registered, or where the country is unknown', () => {
    for (const c of ['KW', 'QA']) expect(vatPolicy({ country: c })).toMatchObject({ registered: false, rate: 0, source: 'none' });
    expect(vatPolicy({ country: 'SA', vatRegistered: false })).toMatchObject({ registered: false, rate: 0 });
    expect(vatPolicy({ country: 'XX' })).toMatchObject({ registered: false, rate: 0, source: 'none' });
    expect(vatPolicy({})).toMatchObject({ rate: 0 });
  });
  it('a rate set in the profile wins over the country table (fraction or percentage)', () => {
    expect(vatPolicy({ country: 'SA', vatRate: 0.05 })).toMatchObject({ rate: 0.05, source: 'profile', registered: true });
    expect(vatPolicy({ country: 'XX', vatRate: 15 })).toMatchObject({ rate: 0.15, source: 'profile' });
    expect(vatPolicy({ country: 'SA', vatRate: 0 })).toMatchObject({ rate: 0, registered: false, source: 'profile' });
    expect(vatPolicy({ country: 'SA', vatRate: null }).source).toBe('country');
    expect(vatPolicy({ country: 'SA', vatRegistered: false, vatRate: 0.15 }).rate).toBe(0);
  });
  it('ignores rates that are not rates', () => {
    for (const v of [-1, 250, 'abc', '', NaN, Infinity, undefined, null]) expect(normalizeRate(v)).toBeNull();
    expect(normalizeRate('14')).toBe(0.14);
    expect(normalizeRate(0.075)).toBe(0.075);
  });
  it('splits a VAT-inclusive amount so net + VAT is the gross to the halala', () => {
    expect(splitInclusive(115, 0.15)).toEqual({ net: 100, vat: 15 });
    expect(splitInclusive(114, 0.14)).toEqual({ net: 100, vat: 14 });
    expect(splitInclusive(50, 0)).toEqual({ net: 50, vat: 0 });
    const s = splitInclusive(99.99, 0.15);
    expect(Math.round((s.net + s.vat) * 100)).toBe(9999);
  });
  it('the table is frozen', () => {
    expect(Object.isFrozen(STANDARD_RATES)).toBe(true);
  });
});
