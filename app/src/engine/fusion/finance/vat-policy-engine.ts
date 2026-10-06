/* the company's VAT policy — one place that decides the rate every posting uses (FOUNDATION P2: the company profile, not a
   constant in each screen). The rate follows the country's standard rate unless the company is not registered for VAT
   (no output or input tax is posted) or the profile sets its own rate (a registered rate change, a free zone).
   Standard rates: Saudi Arabia 15% (since July 2020), Egypt 14%, Bahrain 10% (since January 2022), the UAE and Oman 5%;
   Kuwait and Qatar levy no VAT. A country outside this table posts no VAT until the profile names a rate. */

export type VatPolicyInput = { country?: string; vatRegistered?: boolean | null; vatRate?: number | null };
export type VatPolicy = {
  registered: boolean;
  rate: number;
  /** where the rate comes from: the profile, the country table, or none (not registered / no VAT / unknown country) */
  source: 'profile' | 'country' | 'none';
  country: string;
  label: string;
};

export const STANDARD_RATES: Readonly<Record<string, number>> = Object.freeze({ SA: 0.15, EG: 0.14, BH: 0.1, AE: 0.05, OM: 0.05, KW: 0, QA: 0 });

const pct = (r: number) => Math.round(r * 10000) / 100 + '%';

/** a profile rate is a fraction between 0 and 1 (0.15), or a percentage above 1 (15); anything else is ignored */
export function normalizeRate(v: unknown): number | null {
  const n = typeof v === 'string' && v.trim() !== '' ? Number(v) : typeof v === 'number' ? v : NaN;
  if (!Number.isFinite(n) || n < 0) return null;
  const r = n > 1 ? n / 100 : n;
  return r <= 1 ? Math.round(r * 10000) / 10000 : null;
}

export function vatPolicy(input: VatPolicyInput = {}): VatPolicy {
  const country = String(input.country || '').trim().toUpperCase();
  const table = Object.prototype.hasOwnProperty.call(STANDARD_RATES, country) ? STANDARD_RATES[country] : null;
  if (input.vatRegistered === false) return { registered: false, rate: 0, source: 'none', country, label: 'غير مسجلة في ضريبة القيمة المضافة' };
  const own = normalizeRate(input.vatRate);
  if (own !== null) return { registered: own > 0, rate: own, source: 'profile', country, label: 'نسبة ملف الشركة ' + pct(own) };
  if (table === null) return { registered: false, rate: 0, source: 'none', country, label: 'لا نسبة معروفة لهذه الدولة — حددها في ملف الشركة' };
  if (table === 0) return { registered: false, rate: 0, source: 'none', country, label: 'لا ضريبة قيمة مضافة في هذه الدولة' };
  return { registered: true, rate: table, source: 'country', country, label: 'النسبة الأساسية للدولة ' + pct(table) };
}

/** the tax in a VAT-inclusive amount and the amount before it, rounded to the halala/piastre */
export function splitInclusive(gross: number, rate: number) {
  const r2 = (x: number) => Math.round((x + Number.EPSILON) * 100) / 100;
  if (!(rate > 0)) return { net: r2(gross), vat: 0 };
  const net = r2(gross / (1 + rate));
  return { net, vat: r2(gross - net) };
}
