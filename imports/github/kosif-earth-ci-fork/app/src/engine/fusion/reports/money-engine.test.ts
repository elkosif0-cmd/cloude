import { describe, expect, it } from 'vitest';
import { applyRate, fingerprint, formatMinor, normalizeDigits, parseMinor, pct, ratio } from './money-engine';

describe('exact money', () => {
  it('parses accounting formats into integer halalas without floating point', () => {
    expect(parseMinor('1,234.50')).toBe(123450);
    expect(parseMinor('(500)')).toBe(-50000);
    expect(parseMinor('500-')).toBe(-50000);
    expect(parseMinor('١٬٢٣٤٫٥')).toBe(123450);
    expect(parseMinor('SAR 90')).toBe(9000);
    expect(parseMinor('90 ر.س')).toBe(9000);
    expect(parseMinor('')).toBe(0);
    expect(parseMinor('—')).toBe(0);
    expect(parseMinor('abc')).toBeNull();
    expect(parseMinor('0.105')).toBe(11);
    expect(parseMinor('0.104')).toBe(10);
    expect(parseMinor('90071992547409.91')).toBe(9007199254740991);
    expect(parseMinor('90071992547409.92')).toBeNull();
  });
  it('normalizes Arabic and Persian digits', () => {
    expect(normalizeDigits('٠١٢٣ ۴۵۶')).toBe('0123 456');
  });
  it('rounds rates half away from zero and computes ratios', () => {
    expect(applyRate(100001, 0.15)).toBe(15000);
    expect(applyRate(-333, 0.5)).toBe(-167);
    expect(pct(25, 200)).toBe(12.5);
    expect(pct(1, 0)).toBeNull();
    expect(ratio(300, 200)).toBe(1.5);
  });
  it('formats in accounting style', () => {
    expect(formatMinor(123456789)).toBe('1,234,567.89');
    expect(formatMinor(-50000)).toBe('(500.00)');
    expect(formatMinor(-50000, { parens: false, decimals: 0 })).toBe('−500');
    expect(formatMinor(12345, { currency: 'ر.س' })).toBe('123.45 ر.س');
  });
  it('fingerprints values independent of key order', () => {
    expect(fingerprint({ a: 1, b: [2, 3] })).toBe(fingerprint({ b: [2, 3], a: 1 }));
    expect(fingerprint({ a: 1 })).not.toBe(fingerprint({ a: 2 }));
  });
});
