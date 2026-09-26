/* Deterministic checks on the documents the reviewer reads — Gemini extracts the fields, this engine
   verifies them (the model never has the last word on a number):
     • ZATCA simplified-invoice QR (TLV, base64): 1 seller, 2 VAT number, 3 timestamp, 4 total incl. VAT, 5 VAT
     • VAT registration number: 15 digits, starts and ends with 3
     • VAT arithmetic at 15% (tolerance one halala per line, 1 SAR overall)
     • date inside the audited period (or subsequent — flagged for ISA 560), not in the future
     • duplicates across the uploaded documents (same seller, reference, amount, date)
   Ported from kosif-audit-pro (document evidence), SEE (evidence bundles) and the ZATCA e-invoicing rules. */
import { parseMinor, type Minor } from '../reports/money-engine';

export type ZatcaQr = { seller: string; vatNumber: string; timestamp: string; total: Minor | null; vat: Minor | null; tags: number[] };

function b64bytes(b64: string): Uint8Array {
  const clean = String(b64 || '').replace(/[\s-]/g, (c) => (c === '-' ? '+' : '')).replace(/_/g, '/');
  const bin = atob(clean);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}
/** Decode the TLV payload of a ZATCA QR code (phase 1 tags 1–5; later tags are listed but not interpreted). */
export function decodeZatcaQr(b64: string): ZatcaQr | null {
  let bytes: Uint8Array;
  try { bytes = b64bytes(b64); } catch { return null; }
  const dec = new TextDecoder(), out: Record<number, string> = {}, tags: number[] = [];
  for (let i = 0; i + 2 <= bytes.length;) {
    const tag = bytes[i], len = bytes[i + 1];
    if (!tag || i + 2 + len > bytes.length) return null;
    out[tag] = dec.decode(bytes.slice(i + 2, i + 2 + len)); tags.push(tag); i += 2 + len;
  }
  if (!out[1] || !out[2]) return null;
  return { seller: out[1], vatNumber: out[2], timestamp: out[3] ?? '', total: out[4] ? parseMinor(out[4]) : null, vat: out[5] ? parseMinor(out[5]) : null, tags };
}
/** Encode (for tests and for printing a QR on the app's own invoices). */
export function encodeZatcaQr(f: { seller: string; vatNumber: string; timestamp: string; total: string; vat: string }): string {
  const enc = new TextEncoder(), parts: number[] = [];
  [f.seller, f.vatNumber, f.timestamp, f.total, f.vat].forEach((v, i) => { const b = enc.encode(v); parts.push(i + 1, b.length, ...b); });
  return btoa(String.fromCharCode(...parts));
}

/** Saudi VAT number: 15 digits starting and ending with 3; Egyptian tax registration number: 9 digits. */
export function validVatNumber(v: string, jurisdiction: 'SA' | 'EG' = 'SA'): boolean {
  const x = String(v || '').replace(/[\s-]/g, '');
  return jurisdiction === 'EG' ? /^\d{9}$/.test(x) : /^3\d{13}3$/.test(x);
}

export type DocFields = { fileName?: string; reference?: string; counterparty?: string; vatNumber?: string; documentDate?: string; amount?: string | Minor; vatAmount?: string | Minor; qr?: string };
export type DocIssue = { code: 'QR_INVALID' | 'QR_MISMATCH' | 'VAT_NUMBER' | 'VAT_MATH' | 'OUT_OF_PERIOD' | 'SUBSEQUENT' | 'FUTURE' | 'DUPLICATE' | 'MISSING'; severity: 'high' | 'medium' | 'low'; message: string };

const m = (v: string | Minor | undefined) => (typeof v === 'number' ? v : v === undefined || v === '' ? null : parseMinor(v));

export function checkDocument(d: DocFields, opts: { periodStart?: string; periodEnd?: string; today?: string; rate?: number; jurisdiction?: 'SA' | 'EG' } = {}): { issues: DocIssue[]; qr: ZatcaQr | null; verdict: 'سليم' | 'يحتاج مراجعة' | 'مرفوض' } {
  const eg = opts.jurisdiction === 'EG', issues: DocIssue[] = [], rate = opts.rate ?? (eg ? 0.14 : 0.15);
  let total = m(d.amount), vat = m(d.vatAmount), vatNo = d.vatNumber ?? '';
  const qr = d.qr && !eg ? decodeZatcaQr(d.qr) : null;
  if (d.qr && !eg && !qr) issues.push({ code: 'QR_INVALID', severity: 'high', message: 'رمز QR لا يطابق صيغة هيئة الزكاة والضريبة والجمارك (TLV).' });
  if (qr) {
    if (vatNo && qr.vatNumber !== vatNo) issues.push({ code: 'QR_MISMATCH', severity: 'high', message: `الرقم الضريبي في الرمز ${qr.vatNumber} يخالف المطبوع ${vatNo}.` });
    if (total !== null && qr.total !== null && Math.abs(qr.total - total) > 100) issues.push({ code: 'QR_MISMATCH', severity: 'high', message: 'إجمالي الفاتورة في الرمز يخالف المطبوع.' });
    vatNo = vatNo || qr.vatNumber; total = total ?? qr.total; vat = vat ?? qr.vat;
  }
  if (vatNo && !validVatNumber(vatNo, eg ? 'EG' : 'SA')) issues.push({ code: 'VAT_NUMBER', severity: 'medium', message: eg ? `رقم التسجيل الضريبي ${vatNo} غير صحيح الصيغة (9 أرقام).` : `الرقم الضريبي ${vatNo} غير صحيح الصيغة (15 خانة تبدأ وتنتهي بـ3).` });
  if (total !== null && vat !== null && vat > 0) {
    const expected = Math.round((total * rate) / (1 + rate));
    if (Math.abs(expected - vat) > 100) issues.push({ code: 'VAT_MATH', severity: 'medium', message: `الضريبة ${(vat / 100).toFixed(2)} لا تساوي ${eg ? '14/114' : '15/115'} من الإجمالي (${(expected / 100).toFixed(2)}).` });
  }
  const date = (d.documentDate || qr?.timestamp || '').slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    if (opts.today && date > opts.today) issues.push({ code: 'FUTURE', severity: 'high', message: 'تاريخ المستند لاحق لتاريخ اليوم.' });
    else if (opts.periodEnd && date > opts.periodEnd) issues.push({ code: 'SUBSEQUENT', severity: 'low', message: 'مستند بعد نهاية الفترة — يُفحص كحدث لاحق أو لاختبار القطع (ISA 560).' });
    if (opts.periodStart && date < opts.periodStart) issues.push({ code: 'OUT_OF_PERIOD', severity: 'medium', message: 'مستند قبل بداية الفترة المراجعة.' });
  } else if (!d.documentDate && !qr) issues.push({ code: 'MISSING', severity: 'low', message: 'لم يُستخرج تاريخ المستند.' });
  const verdict = issues.some((i) => i.severity === 'high') ? 'مرفوض' : issues.some((i) => i.severity === 'medium') ? 'يحتاج مراجعة' : 'سليم';
  return { issues, qr, verdict };
}

/** Same counterparty or VAT number, same reference or same amount and date → possible duplicate. */
export function findDuplicates(docs: DocFields[]): [number, number][] {
  const out: [number, number][] = [];
  const who = (d: DocFields) => (d.vatNumber || d.counterparty || '').replace(/\s/g, '');
  for (let i = 0; i < docs.length; i++) for (let j = i + 1; j < docs.length; j++) {
    const a = docs[i], b = docs[j];
    if (!who(a) || who(a) !== who(b)) continue;
    const sameRef = !!a.reference && a.reference === b.reference, sameAmt = m(a.amount) !== null && m(a.amount) === m(b.amount) && (a.documentDate ?? '') === (b.documentDate ?? '');
    if (sameRef || sameAmt) out.push([i, j]);
  }
  return out;
}
