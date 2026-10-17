import { describe, expect, it } from 'vitest';
import { checkDocument, decodeZatcaQr, encodeZatcaQr, findDuplicates, validVatNumber } from './document-check-engine';

const qr = encodeZatcaQr({ seller: 'مؤسسة الوادي', vatNumber: '310122393500003', timestamp: '2025-12-30T10:00:00Z', total: '1150.00', vat: '150.00' });

describe('document checks', () => {
  it('decodes the ZATCA QR (TLV)', () => {
    expect(decodeZatcaQr(qr)).toMatchObject({ seller: 'مؤسسة الوادي', vatNumber: '310122393500003', total: 115000, vat: 15000, tags: [1, 2, 3, 4, 5] });
    expect(decodeZatcaQr('!!!')).toBeNull();
  });
  it('validates VAT numbers', () => {
    expect(validVatNumber('310122393500003')).toBe(true);
    expect(validVatNumber('410122393500003')).toBe(false);
    expect(validVatNumber('31012239350003')).toBe(false);
  });
  it('accepts a clean invoice and flags VAT math, period and QR mismatches', () => {
    expect(checkDocument({ qr }, { periodStart: '2025-01-01', periodEnd: '2025-12-31', today: '2026-09-25' }).verdict).toBe('سليم');
    const bad = checkDocument({ qr, vatNumber: '300000000000003', amount: '1150', vatAmount: '120', documentDate: '2026-01-15' }, { periodEnd: '2025-12-31', today: '2026-09-25' });
    expect(bad.issues.map((i) => i.code)).toEqual(['QR_MISMATCH', 'VAT_MATH', 'SUBSEQUENT']);
    expect(bad.verdict).toBe('مرفوض');
    expect(checkDocument({ documentDate: '2027-01-01' }, { today: '2026-09-25' }).issues[0].code).toBe('FUTURE');
  });
  it('finds duplicate documents', () => {
    expect(findDuplicates([{ vatNumber: '310122393500003', reference: 'INV-9' }, { vatNumber: '310122393500003', reference: 'INV-9' }, { vatNumber: '310122393500003', reference: 'INV-10' }])).toEqual([[0, 1]]);
  });
});
