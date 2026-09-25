/* Exact money for the reporting and audit engines: amounts are integer halalas (minor units)
   carried in a JS number, exact up to Number.MAX_SAFE_INTEGER halalas (~90 trillion SAR).
   Ported from the BigInt money rules of kosif-audit-pro (v38-core) and Moon (Money.parse):
   parsing never goes through floating point, rounding is half-up at the third decimal. */

export type Minor = number;

const AR = '٠١٢٣٤٥٦٧٨٩';
const FA = '۰۱۲۳۴۵۶۷۸۹';

export function normalizeDigits(input: unknown): string {
  return Array.from(String(input ?? '')).map((ch) => {
    const a = AR.indexOf(ch);
    if (a >= 0) return String(a);
    const f = FA.indexOf(ch);
    return f >= 0 ? String(f) : ch;
  }).join('');
}

/** "1,234.50" · "(500)" · "١٬٢٣٤٫٥" · "500-" · "-12" · "SAR 90" → integer halalas; null when not a number. */
export function parseMinor(input: unknown): Minor | null {
  if (typeof input === 'number') return Number.isFinite(input) ? Math.round(input * 100) : null;
  let text = normalizeDigits(input).trim();
  if (!text || text === '-' || text === '—') return 0;
  let negative = false;
  if (/^\(.*\)$/.test(text)) { negative = true; text = text.slice(1, -1); }
  text = text.replace(/٫/g, '.').replace(/[٬،,_\s]/g, '').replace(/ر\.?س|SAR|ريال/gi, '').replace(/[^\d.+-]/g, '');
  if (text.endsWith('-')) { negative = !negative; text = text.slice(0, -1); }
  if (text.startsWith('-')) { negative = !negative; text = text.slice(1); }
  if (text.startsWith('+')) text = text.slice(1);
  if (!/^\d+(?:\.\d*)?$/.test(text) && !/^\.\d+$/.test(text)) return null;
  const [integer = '0', fraction = ''] = text.split('.');
  let minor = Number(integer || '0') * 100 + Number((fraction + '00').slice(0, 2));
  if (fraction.length > 2 && Number(fraction[2]) >= 5) minor += 1;
  if (!Number.isSafeInteger(minor)) return null;
  return negative ? -minor : minor;
}

export const fromMajor = (major: number): Minor => Math.round((Number(major) || 0) * 100);
export const toMajor = (minor: Minor): number => minor / 100;
export const abs = (m: Minor): Minor => (m < 0 ? -m : m);
export const sum = (items: Minor[]): Minor => items.reduce((a, b) => a + b, 0);

/** rate is a fraction (0.15 = 15%); result rounded half away from zero to a halala. */
export function applyRate(m: Minor, rate: number): Minor {
  const v = m * rate;
  return v < 0 ? -Math.round(-v) : Math.round(v);
}

/** percentage (numerator / denominator × 100), rounded; null when the denominator is zero. */
export function pct(numerator: Minor, denominator: Minor, digits = 1): number | null {
  if (!denominator) return null;
  const f = 10 ** digits;
  return Math.round((numerator / denominator) * 100 * f) / f;
}

export function ratio(numerator: Minor, denominator: Minor, digits = 2): number | null {
  if (!denominator) return null;
  const f = 10 ** digits;
  return Math.round((numerator / denominator) * f) / f;
}

/** 1234567 → "12,345.67"; negatives in parentheses (accounting style) unless parens:false. */
export function formatMinor(m: Minor, opts: { decimals?: 0 | 2; parens?: boolean; currency?: string } = {}): string {
  const decimals = opts.decimals ?? 2;
  const neg = m < 0;
  let a = abs(m);
  if (decimals === 0) a = Math.round(a / 100) * 100;
  const int = Math.floor(a / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const body = decimals === 2 ? int + '.' + String(a % 100).padStart(2, '0') : int;
  const withCur = opts.currency ? body + ' ' + opts.currency : body;
  if (!neg) return withCur;
  return opts.parens === false ? '−' + withCur : '(' + withCur + ')';
}

/** FNV-1a over a stable JSON of the value — a short reproducibility fingerprint (Moon textHash). */
export function fingerprint(value: unknown): string {
  const stable = (v: unknown): string => {
    if (v === null || v === undefined) return 'null';
    if (Array.isArray(v)) return '[' + v.map(stable).join(',') + ']';
    if (typeof v === 'object') return '{' + Object.keys(v as object).sort().map((k) => JSON.stringify(k) + ':' + stable((v as Record<string, unknown>)[k])).join(',') + '}';
    return JSON.stringify(v);
  };
  let h = 2166136261;
  for (const ch of stable(value)) { h ^= ch.codePointAt(0) as number; h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(16).padStart(8, '0');
}
