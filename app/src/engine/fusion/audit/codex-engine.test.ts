import { describe, expect, it } from 'vitest';
import { frameworkApplicability, normalizeCode, relationOf, searchCodex, STANDARD, STANDARDS, standardsFor } from './codex-engine';

describe('accounting codex', () => {
  it('holds unique, sourced records', () => {
    const codes = STANDARDS.map((s) => s.code);
    expect(new Set(codes).size).toBe(codes.length);
    for (const s of STANDARDS) { expect(s.url).toMatch(/^https:\/\//); expect(s.titleAr).toBeTruthy(); expect(s.purpose).toBeTruthy(); }
    expect(STANDARD['IFRS 18'].status).toBe('upcoming');
    expect(STANDARD['IAS 1'].replacedBy).toBe('IFRS 18');
  });
  it('normalizes codes written in many ways', () => {
    expect(normalizeCode('ias16')).toBe('IAS 16');
    expect(normalizeCode('IFRS-15')).toBe('IFRS 15');
    expect(normalizeCode('معيار المحاسبة الدولي رقم 2')).toBe('IAS 2');
    expect(normalizeCode('المعيار الدولي للتقرير المالي 16')).toBe('IFRS 16');
    expect(normalizeCode('مخصص الزكاة')).toBe('لائحة الزكاة');
    expect(normalizeCode('IAS 99')).toBeNull();
  });
  it('explains how a standard relates to an account', () => {
    expect(relationOf('IAS 16', 'ppe')).toContain('العمر الإنتاجي');
    expect(relationOf('IAS 2', null)).toBe(STANDARD['IAS 2'].purpose);
    const list = standardsFor(['IAS 16', 'ias16', 'IAS 36'], 'ppe', 'SME');
    expect(list.map((x) => x.code)).toEqual(['IAS 16', 'IAS 36']);
    expect(list[0].sme).toBe('القسم 17');
  });
  it('applies SOCPA guidance section 1 on the framework', () => {
    expect(frameworkApplicability({ listedOrIssuing: true }).framework).toBe('IFRS');
    expect(frameworkApplicability({ fiduciaryForBroadGroup: true }).mandatory).toBe(true);
    expect(frameworkApplicability({ fiduciaryForBroadGroup: true, incidentalDepositsOnly: true }).framework).toBe('SME');
    expect(frameworkApplicability({ electedFullIfrs: true })).toMatchObject({ framework: 'IFRS', mandatory: false });
    expect(frameworkApplicability({}).framework).toBe('SME');
  });
  it('searches by code or words', () => {
    expect(searchCodex('ifrs 16')[0].code).toBe('IFRS 16');
    expect(searchCodex('المخزون').some((s) => s.code === 'IAS 2')).toBe(true);
  });
});
