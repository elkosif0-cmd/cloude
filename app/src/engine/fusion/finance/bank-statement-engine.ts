import type { BookLine } from './bank-reconciliation-engine';
import { sha256 } from './journal-chain-engine';

/* Bank statement import and continuous reconciliation, on top of bank-reconciliation-engine (which matches one bank
   line to one book line on the exact amount and draws the classic statement). This file adds what the daily work
   needs: (1) reading the CSV/XLSX a Saudi bank exports — columns found by their Arabic/English header names,
   Arabic-Indic digits, dd/mm/yyyy, thousands separators, negatives in parentheses, a trailing «SAR»/«ر.س» — into
   normalised lines each with a stable hash so a re-import adds nothing twice; (2) richer matching with a confidence and
   reasons: a reference in the description, the exact amount within a window, several invoices settled by one credit,
   bank fees and the VAT on them, and recurring transfers learned from the matches the accountant confirmed;
   (3) a continuous state — unmatched lines on both sides with their age, suggestions awaiting confirmation, the learned
   rules, and the certified periods (who, when, evidence hash) that the month close consumes.
   Pure and deterministic: every timestamp is injected; amounts are numbers in riyals, money in positive. */

/* ---------- types ---------- */
export type StatementLine = {
  id: string; // the stable hash (lineHash)
  seq: number; // position in the import, 1-based
  date: string; // ISO yyyy-mm-dd, '' when the date could not be read (see dateFlag)
  amount: number; // + money in, − money out
  description: string;
  reference: string;
  balance: number | null;
  dateFlag?: 'hijri' | 'unparsed';
  raw: string[];
};
export type BankGuess = 'alrajhi' | 'snb' | 'riyad' | 'alinma' | 'sab' | 'unknown';
export type ColumnMap = { date: number; description: number; debit: number; credit: number; amount: number; balance: number; reference: number; type: number };
export type ParsedStatement = { lines: StatementLine[]; warnings_ar: string[]; bank: { guess: BankGuess; confidence: number; evidence_ar: string }; columns: ColumnMap; headerRow: number; skipped: number };

export type MatchKind = 'reference' | 'amount' | 'many-to-one' | 'rule' | 'fee' | 'fee+vat' | 'rule-post' | 'manual';
export type MatchSuggestion = {
  id: string; // deterministic: hash of the bank and book ids
  kind: MatchKind;
  bankIds: string[];
  bookIds: string[]; // empty for a bank-only suggestion (fee, recurring transfer with no entry yet)
  amountBank: number;
  amountBook: number;
  diff: number;
  confidence: number; // 0..1
  reasons_ar: string[];
  ruleId?: string;
  suggestedAccountCode?: string; // for a bank-only suggestion: where the ledger usually posts it
};
export type ConfirmedMatch = MatchSuggestion & { who: string; ts: string };
export type LearnedRule = {
  id: string;
  pattern: string[]; // the description's stable tokens (no digits, no dates)
  side: 'in' | 'out';
  amount: number | null; // the amount when it repeats, else null
  bookRefPrefix: string; // the book reference's letters, e.g. «RENT» from RENT-2026-05
  bookMemo: string;
  label_ar: string;
  kind: 'recurring' | 'fee';
  hits: number;
  lastTs: string;
};
export type Certification = { period: string; who: string; ts: string; evidenceHash: string; unmatchedCount: number; range: { start: string; end: string }; matched: number };
export type ImportLog = { ts: string; bank: BankGuess; count: number; added: number; duplicates: number; from: string; to: string };
export type ReconState = {
  lines: StatementLine[];
  confirmed: ConfirmedMatch[];
  rejected: { id: string; who: string; ts: string }[];
  rules: LearnedRule[];
  certifications: Certification[];
  imports: ImportLog[];
};
export const emptyState = (): ReconState => ({ lines: [], confirmed: [], rejected: [], rules: [], certifications: [], imports: [] });

/* ---------- text and number normalisation ---------- */
const money = (v: number) => Math.round((v + Number.EPSILON) * 100) / 100;
const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩', FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
export const latinDigits = (s: string) => String(s ?? '').replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d))).replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d)));
/** Arabic text folded for comparison: digits Latin, tashkeel gone, alef/ya/ta-marbuta unified, lower case, one space */
export function normText(s: string) {
  return latinDigits(s).replace(/[ً-ْـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/[^\p{L}\p{N}\s\-/]/gu, ' ').toLowerCase().replace(/\s+/g, ' ').trim();
}
/** «1,234.50» «١٬٢٣٤٫٥٠» «(1,234)» «1 234,50 SAR» «−35 ر.س» «35 CR» → number; null when it is not a number */
export function parseAmount(v: unknown): number | null {
  if (typeof v === 'number') return Number.isFinite(v) ? money(v) : null;
  let t = latinDigits(String(v ?? '')).trim();
  if (!t) return null;
  /* no \b around Arabic: JS word boundaries are ASCII-only */
  t = t.replace(/\b(sar|rs|s\.r\.?)\b/gi, '').replace(/ريال|ر\.?\s?س\.?/g, '').replace(/[‎‏‪-‮]/g, '').trim();
  let sign = 1;
  if (/^\(.*\)$/.test(t)) { sign = -1; t = t.slice(1, -1); }
  if (/^[-−–]/.test(t)) { sign = -1; t = t.slice(1); }
  else if (/[-−–]$/.test(t)) { sign = -1; t = t.slice(0, -1); }
  if (/\b(dr|debit|مدين)\b/i.test(t)) { sign = -1; t = t.replace(/\b(dr|debit|مدين)\b/gi, ''); }
  if (/\b(cr|credit|دائن)\b/i.test(t)) { t = t.replace(/\b(cr|credit|دائن)\b/gi, ''); }
  t = t.replace(/[\s ]/g, '').replace(/٫/g, '.').replace(/٬/g, ',').replace(/^\+/, '');
  if (/^\d{1,3}(\.\d{3})+,\d{1,2}$/.test(t)) t = t.replace(/\./g, '').replace(',', '.'); // 1.234,50 (European)
  else if (/^\d+,\d{1,2}$/.test(t) && !/^\d{1,3},\d{3}$/.test(t)) t = t.replace(',', '.'); // 1234,50
  else t = t.replace(/,/g, '');
  if (!/^\d+(\.\d+)?$/.test(t)) return null;
  return money(sign * parseFloat(t));
}
/** ISO date or '' with a flag: dd/mm/yyyy, dd-mm-yyyy, dd.mm.yyyy, yyyy-mm-dd, yyyy/mm/dd, two-digit years, a time after
   the date; a year between 1300 and 1499 is Hijri-looking and is flagged, never converted */
export function parseDate(v: unknown): { iso: string; flag?: 'hijri' | 'unparsed' } {
  if (v instanceof Date && !isNaN(v.getTime())) return { iso: v.toISOString().slice(0, 10) };
  let t = latinDigits(String(v ?? '')).trim().replace(/[‎‏]/g, '');
  if (!t) return { iso: '', flag: 'unparsed' };
  t = t.replace(/\s*[T ]\s*\d{1,2}:\d{2}(:\d{2})?.*$/, '').replace(/هـ|ه$|AH$/i, '').trim();
  let y = 0, m = 0, d = 0, mt: RegExpMatchArray | null;
  if ((mt = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/.exec(t))) { y = +mt[1]; m = +mt[2]; d = +mt[3]; }
  else if ((mt = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/.exec(t))) { d = +mt[1]; m = +mt[2]; y = +mt[3]; }
  else if ((mt = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2})$/.exec(t))) { d = +mt[1]; m = +mt[2]; y = 2000 + +mt[3]; }
  else if ((mt = /^(\d{4})(\d{2})(\d{2})$/.exec(t))) { y = +mt[1]; m = +mt[2]; d = +mt[3]; }
  else return { iso: '', flag: 'unparsed' };
  if (y >= 1300 && y <= 1499) return { iso: '', flag: 'hijri' };
  if (m > 12 && d <= 12) [m, d] = [d, m]; // mm/dd slipped in
  if (m < 1 || m > 12 || d < 1 || d > 31 || y < 1900 || y > 2200) return { iso: '', flag: 'unparsed' };
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCMonth() !== m - 1) return { iso: '', flag: 'unparsed' };
  return { iso: dt.toISOString().slice(0, 10) };
}
const dayDiff = (a: string, b: string) => {
  const x = Date.parse(a + 'T00:00:00Z'), y = Date.parse(b + 'T00:00:00Z');
  return Number.isFinite(x) && Number.isFinite(y) ? Math.round(Math.abs(x - y) / 86_400_000) : Number.POSITIVE_INFINITY;
};
const ageDays = (from: string, to: string) => {
  const x = Date.parse(from + 'T00:00:00Z'), y = Date.parse(to + 'T00:00:00Z');
  return Number.isFinite(x) && Number.isFinite(y) ? Math.max(0, Math.round((y - x) / 86_400_000)) : 0;
};

/* ---------- header detection ---------- */
const SYN: Record<keyof ColumnMap, RegExp> = {
  date: /^(تاريخ|التاريخ|تاريخ (العمليه|المعامله|القيد|الحركه|التنفيذ|الاستحقاق)|date|transaction date|posting date|value date|txn date|trans\.? date)$/,
  description: /^(البيان|الوصف|التفاصيل|تفاصيل|وصف (العمليه|المعامله)|تفاصيل (العمليه|المعامله)|description|details|narrative|particulars|transaction details|remarks|memo|narration)$/,
  debit: /^(مدين|خصم|صادر|سحب|مسحوبات|المسحوبات|مبلغ مدين|debit|debits|withdrawal|withdrawals|dr|money out|paid out|debit amount)$/,
  credit: /^(دائن|ايداع|وارد|ايداعات|الايداعات|مبلغ دائن|credit|credits|deposit|deposits|cr|money in|paid in|credit amount)$/,
  amount: /^(المبلغ|مبلغ|القيمه|قيمه|مبلغ العمليه|amount|transaction amount|value|net amount)$/,
  balance: /^(الرصيد|رصيد|الرصيد بعد|الرصيد الجاري|الرصيد المتبقي|balance|running balance|closing balance|available balance|ledger balance)$/,
  reference: /^(المرجع|رقم المرجع|رقم العمليه|رقم المعامله|رقم الحواله|رقم الاشاره|الرقم المرجعي|reference|ref|ref no|ref\.? no\.?|reference no|reference number|transaction id|txn id|transaction ref|trace no|رقم الايصال)$/,
  type: /^(نوع العمليه|النوع|نوع|type|transaction type|d\/c|dr\/cr|مدين\/دائن|cr\/dr)$/,
};
function findHeader(rows: string[][]) {
  let best = { row: -1, score: 0, map: null as ColumnMap | null };
  for (let r = 0; r < Math.min(rows.length, 25); r++) {
    const map: ColumnMap = { date: -1, description: -1, debit: -1, credit: -1, amount: -1, balance: -1, reference: -1, type: -1 };
    let score = 0;
    (rows[r] || []).forEach((cell, i) => {
      const h = normText(String(cell ?? '')).replace(/[()]/g, '').replace(/\s*\(?(sar|ر س|ريال)\)?$/, '').trim();
      if (!h) return;
      for (const k of Object.keys(SYN) as (keyof ColumnMap)[]) if (map[k] < 0 && SYN[k].test(h)) { map[k] = i; score += k === 'date' ? 3 : k === 'type' ? 1 : 2; break; }
    });
    const hasMoney = map.amount >= 0 || map.debit >= 0 || map.credit >= 0;
    if (map.date >= 0 && hasMoney && score > best.score) best = { row: r, score, map };
  }
  return best;
}
const BANKS: { id: BankGuess; re: RegExp; label: string }[] = [
  { id: 'alrajhi', re: /الراجحي|al ?rajhi|rajhi/i, label: 'مصرف الراجحي' },
  { id: 'snb', re: /الاهلي|الأهلي|snb|alahli|al ?ahli|ncb|البنك الاهلي السعودي|saudi national bank/i, label: 'البنك الأهلي السعودي' },
  { id: 'riyad', re: /بنك الرياض|riyad ?bank|riyadbank/i, label: 'بنك الرياض' },
  { id: 'alinma', re: /الانماء|الإنماء|alinma/i, label: 'مصرف الإنماء' },
  { id: 'sab', re: /\bsab\b|sabb|ساب|البنك السعودي الاول|البنك السعودي الأول|saudi awwal|saudi british/i, label: 'البنك السعودي الأول (ساب)' },
];
function guessBank(rows: string[][], headerRow: number, lines: StatementLine[]): ParsedStatement['bank'] {
  const title = rows.slice(0, Math.max(headerRow, 0) + 1).flat().map((c) => String(c ?? '')).join(' ');
  for (const b of BANKS) if (b.re.test(title)) return { guess: b.id, confidence: 0.9, evidence_ar: 'اسم البنك في رأس الكشف: ' + b.label };
  const counts = new Map<BankGuess, number>();
  for (const l of lines) for (const b of BANKS) if (b.re.test(l.description + ' ' + l.reference)) counts.set(b.id, (counts.get(b.id) || 0) + 1);
  const top = [...counts].sort((a, b) => b[1] - a[1])[0];
  if (top && top[1] >= Math.max(2, lines.length * 0.2)) return { guess: top[0], confidence: 0.5, evidence_ar: 'اسم البنك يتكرر في البيان (' + top[1] + ' سطراً)' };
  return { guess: 'unknown', confidence: 0, evidence_ar: 'لم يظهر اسم البنك في الكشف' };
}

/* ---------- the stable hash of a line ---------- */
/** sha256 over date | amount | folded description | reference | balance | occurrence (n-th identical line of the import) */
export function lineHash(line: { date: string; amount: number; description?: string; reference?: string; balance?: number | null; dateRaw?: string }, occurrence = 1) {
  const key = [line.date || ('raw:' + (line.dateRaw ?? '')), money(line.amount).toFixed(2), normText(line.description ?? ''), normText(line.reference ?? ''), line.balance == null ? '' : money(line.balance).toFixed(2), String(occurrence)].join('|');
  return sha256(key).slice(0, 24);
}

/* ---------- parsing ---------- */
export function parseStatement(input: string[][] | { headers: string[]; rows: string[][] }, opts: { bank?: BankGuess } = {}): ParsedStatement {
  const rows: string[][] = Array.isArray(input) ? input.map((r) => (Array.isArray(r) ? r.map((c) => String(c ?? '')) : [String(r ?? '')])) : [input.headers.map(String), ...input.rows.map((r) => r.map((c) => String(c ?? '')))];
  const warnings_ar: string[] = [];
  const empty: ColumnMap = { date: -1, description: -1, debit: -1, credit: -1, amount: -1, balance: -1, reference: -1, type: -1 };
  const h = findHeader(rows);
  if (!h.map) {
    warnings_ar.push('لم أجد صف العناوين: يلزم عمود للتاريخ وعمود للمبلغ (أو مدين/دائن). الأسماء المعروفة: التاريخ، البيان، مدين، دائن، المبلغ، الرصيد، المرجع.');
    return { lines: [], warnings_ar, bank: { guess: opts.bank ?? 'unknown', confidence: 0, evidence_ar: '' }, columns: empty, headerRow: -1, skipped: rows.length };
  }
  const map = h.map;
  if (map.description < 0) warnings_ar.push('لا عمود للبيان — ستُطابق السطور بالمبلغ والتاريخ فقط.');
  if (map.debit < 0 && map.credit < 0 && map.type < 0 && map.balance < 0) warnings_ar.push('عمود مبلغ واحد بلا مدين/دائن ولا رصيد: الإشارة تُقرأ من علامة المبلغ كما وردت.');
  const pre: { date: string; amount: number; description: string; reference: string; balance: number | null; dateFlag?: 'hijri' | 'unparsed'; raw: string[]; dateRaw: string }[] = [];
  let skipped = 0, hijri = 0, unparsed = 0, noAmount = 0;
  for (let r = h.row + 1; r < rows.length; r++) {
    const row = rows[r] || [];
    if (!row.some((c) => String(c ?? '').trim())) { skipped++; continue; }
    const cell = (i: number) => (i >= 0 ? String(row[i] ?? '').trim() : '');
    const dateRaw = cell(map.date), dt = parseDate(dateRaw);
    const description = cell(map.description), reference = cell(map.reference);
    const balance = map.balance >= 0 ? parseAmount(cell(map.balance)) : null;
    let amount: number | null = null;
    if (map.debit >= 0 || map.credit >= 0) {
      const dr = map.debit >= 0 ? parseAmount(cell(map.debit)) : null, cr = map.credit >= 0 ? parseAmount(cell(map.credit)) : null;
      if (dr == null && cr == null) amount = null;
      else amount = money((cr == null ? 0 : Math.abs(cr)) - (dr == null ? 0 : Math.abs(dr)));
    } else if (map.amount >= 0) {
      amount = parseAmount(cell(map.amount));
      if (amount != null && map.type >= 0) {
        const t = normText(cell(map.type));
        if (/^(d|dr|debit|مدين|خصم|سحب|صادر)$/.test(t)) amount = -Math.abs(amount);
        else if (/^(c|cr|credit|دائن|ايداع|وارد)$/.test(t)) amount = Math.abs(amount);
      }
    }
    /* a totals row (no date, a balance or an amount only) is a footer, not a line */
    if (!dateRaw && (amount == null || /المجموع|الاجمالي|total|closing|opening|الرصيد الافتتاحي|رصيد افتتاحي/i.test(normText(description)))) { skipped++; continue; }
    if (amount == null || amount === 0) { noAmount++; skipped++; continue; }
    if (dt.flag === 'hijri') hijri++; else if (dt.flag === 'unparsed') unparsed++;
    pre.push({ date: dt.iso, amount, description, reference, balance, dateFlag: dt.flag, raw: row.map((c) => String(c ?? '')), dateRaw });
  }
  /* a single unsigned amount column with a running balance: the sign is what the balance did */
  if (map.debit < 0 && map.credit < 0 && map.type < 0 && map.balance >= 0 && pre.length > 1 && pre.every((l) => l.amount > 0 && l.balance != null)) {
    let fixed = 0;
    for (let i = 1; i < pre.length; i++) {
      const delta = money((pre[i].balance as number) - (pre[i - 1].balance as number));
      if (Math.abs(delta) === pre[i].amount && delta < 0) { pre[i].amount = -pre[i].amount; fixed++; }
    }
    if (fixed) warnings_ar.push('قُرئت إشارة ' + fixed + ' سطراً من حركة الرصيد (عمود مبلغ واحد بلا مدين/دائن).');
  }
  /* the hash: an n-th identical line of the same import gets its occurrence number, so two equal POS settlements stay two */
  const seen = new Map<string, number>();
  const lines: StatementLine[] = pre.map((l, i) => {
    const base = lineHash(l, 1), n = (seen.get(base) || 0) + 1; seen.set(base, n);
    const { dateRaw: _d, ...rest } = l; void _d;
    return { id: n === 1 ? base : lineHash(l, n), seq: i + 1, ...rest };
  });
  if (hijri) warnings_ar.push(hijri + ' سطراً بتاريخ هجري (سنة 13xx–14xx) — لم يُحوَّل؛ صدّر الكشف بالتقويم الميلادي أو أدخل التاريخ يدوياً.');
  if (unparsed) warnings_ar.push(unparsed + ' سطراً بتاريخ لم يُقرأ — تظهر بلا تاريخ ولا تُطابق تلقائياً.');
  if (noAmount) warnings_ar.push(noAmount + ' صفاً بلا مبلغ تُركت (عناوين فرعية أو مجاميع).');
  if (!lines.length) warnings_ar.push('لم يُقرأ أي سطر بعد صف العناوين.');
  const bank = opts.bank ? { guess: opts.bank, confidence: 1, evidence_ar: 'حدده المستخدم' } : guessBank(rows, h.row, lines);
  return { lines, warnings_ar, bank, columns: map, headerRow: h.row, skipped };
}

/** add an import to the state; lines whose hash is already there are duplicates and are not added */
export function mergeImport(state: ReconState, parsed: { lines: StatementLine[]; bank?: { guess: BankGuess } }, ts: string) {
  const have = new Set(state.lines.map((l) => l.id));
  const added = parsed.lines.filter((l) => !have.has(l.id));
  const dated = parsed.lines.map((l) => l.date).filter(Boolean).sort();
  const log: ImportLog = { ts, bank: parsed.bank?.guess ?? 'unknown', count: parsed.lines.length, added: added.length, duplicates: parsed.lines.length - added.length, from: dated[0] || '', to: dated[dated.length - 1] || '' };
  const lines = [...state.lines, ...added].sort((a, b) => (a.date || '9999').localeCompare(b.date || '9999') || a.seq - b.seq || a.id.localeCompare(b.id));
  return { state: { ...state, lines, imports: [...state.imports, log] }, added: added.length, duplicates: log.duplicates };
}

/* ---------- matching ---------- */
const FEE_RE = /رسوم|رسم|عموله|عمولة|اجور|fee|fees|charge|charges|commission|svc chg|service charge|اشتراك|subscription/i;
const VAT_RE = /ضريبه|ضريبة|القيمه المضافه|القيمة المضافة|vat|tax/i;
const STOP = new Set(['من', 'الى', 'إلى', 'في', 'على', 'عن', 'و', 'the', 'of', 'to', 'from', 'for', 'and', 'at', 'by', 'ref', 'no', 'rrn', 'id']);
/** the stable tokens of a description: words of 3+ letters, no digits, no dates, no stop words */
export function tokens(s: string) {
  return [...new Set(normText(s).split(' ').filter((w) => w.length >= 3 && !/\d/.test(w) && !STOP.has(w)))].sort();
}
/** the alphabetic prefix of a reference: «RENT-2026-05» → «rent», «INV0042» → «inv» */
const refPrefix = (ref?: string) => (normText(ref ?? '').match(/^[a-z؀-ۿ]{2,}/) || [''])[0];
const refToken = (ref?: string) => normText(ref ?? '').replace(/\s+/g, '');
export const matchId = (bankIds: string[], bookIds: string[]) => sha256([...bankIds].sort().join(',') + '|' + [...bookIds].sort().join(',')).slice(0, 16);
const r2c = (c: number) => Math.round(Math.max(0, Math.min(1, c)) * 100) / 100;

export type SuggestOpts = { days?: number; today?: string; maxGroup?: number; feeAccountCode?: string; vatRate?: number; vatAccountCode?: string };
/** suggestions for the unmatched bank lines against the unmatched book lines, best first; confirmed and rejected ones
   (state) are left out */
export function suggestMatches(lines: StatementLine[], book: BookLine[], rules: LearnedRule[] = [], opts: SuggestOpts = {}, state?: Pick<ReconState, 'confirmed' | 'rejected'>): MatchSuggestion[] {
  const windowDays = opts.days ?? 5, maxGroup = opts.maxGroup ?? 6, feeCode = opts.feeAccountCode ?? '6300', vatRate = opts.vatRate ?? 0.15;
  const usedBank = new Set<string>(), usedBook = new Set<string>();
  for (const c of state?.confirmed ?? []) { c.bankIds.forEach((x) => usedBank.add(x)); c.bookIds.forEach((x) => usedBook.add(x)); }
  const rejected = new Set((state?.rejected ?? []).map((r) => r.id));
  const bank = lines.filter((l) => !usedBank.has(l.id) && l.date).sort((a, b) => a.date.localeCompare(b.date) || a.seq - b.seq);
  const books = book.filter((k) => !usedBook.has(k.id)).sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
  const out: MatchSuggestion[] = [];
  const takenBank = new Set<string>(), takenBook = new Set<string>();
  const push = (m: Omit<MatchSuggestion, 'id' | 'diff'>) => {
    const id = matchId(m.bankIds, m.bookIds);
    if (rejected.has(id)) return false;
    out.push({ id, diff: money(m.amountBank - m.amountBook), ...m, confidence: r2c(m.confidence) });
    m.bankIds.forEach((x) => takenBank.add(x)); m.bookIds.forEach((x) => takenBook.add(x));
    return true;
  };
  const text = (l: StatementLine) => normText(l.description + ' ' + l.reference);
  const inWindow = (b: StatementLine, k: BookLine) => dayDiff(b.date, k.date) <= windowDays;

  /* 1 — the book reference appears in the bank description or reference */
  for (const b of bank) {
    if (takenBank.has(b.id)) continue;
    const t = text(b).replace(/\s+/g, '');
    const cands = books.filter((k) => !takenBook.has(k.id) && refToken(k.reference).length >= 3 && t.includes(refToken(k.reference)));
    if (!cands.length) continue;
    const exact = cands.filter((k) => money(k.amount) === money(b.amount));
    const pick = (exact.length ? exact : cands).sort((x, y) => dayDiff(b.date, x.date) - dayDiff(b.date, y.date))[0];
    const d = dayDiff(b.date, pick.date), same = money(pick.amount) === money(b.amount);
    const reasons = ['المرجع «' + pick.reference + '» ورد في بيان البنك'];
    if (same) reasons.push('المبلغ متساوٍ'); else reasons.push('المبلغ مختلف: ' + money(b.amount - pick.amount).toFixed(2));
    if (Number.isFinite(d)) reasons.push(d === 0 ? 'نفس اليوم' : 'فارق ' + d + ' يوم');
    push({ kind: 'reference', bankIds: [b.id], bookIds: [pick.id], amountBank: b.amount, amountBook: pick.amount, confidence: same ? 0.98 - Math.min(d, 30) * 0.002 : 0.6, reasons_ar: reasons });
  }
  /* 2 — a learned rule: the description's tokens match, the book side carries the rule's reference prefix or memo */
  const ruleFor = (b: StatementLine) => {
    const tk = new Set(tokens(b.description + ' ' + b.reference)), side = b.amount >= 0 ? 'in' : 'out';
    return rules.filter((r) => r.side === side && r.pattern.length && r.pattern.every((p) => tk.has(p))).sort((x, y) => y.pattern.length - x.pattern.length || y.hits - x.hits)[0];
  };
  for (const b of bank) {
    if (takenBank.has(b.id)) continue;
    const r = ruleFor(b); if (!r) continue;
    const cands = books.filter((k) => !takenBook.has(k.id) && Math.sign(k.amount) === Math.sign(b.amount) && inWindow(b, k) && ((r.bookRefPrefix && refPrefix(k.reference) === r.bookRefPrefix) || (r.bookMemo && normText(k.memo ?? '') === r.bookMemo)));
    if (cands.length) {
      const pick = cands.sort((x, y) => Math.abs(x.amount - b.amount) - Math.abs(y.amount - b.amount) || dayDiff(b.date, x.date) - dayDiff(b.date, y.date))[0];
      const same = money(pick.amount) === money(b.amount), close = Math.abs(pick.amount - b.amount) <= Math.abs(b.amount) * 0.01;
      if (same || close) push({ kind: 'rule', bankIds: [b.id], bookIds: [pick.id], amountBank: b.amount, amountBook: pick.amount, confidence: same ? 0.95 : 0.75, reasons_ar: ['قاعدة متعلَّمة «' + r.label_ar + '» (' + r.hits + ' مطابقة سابقة)', same ? 'المبلغ متساوٍ' : 'فارق صغير في المبلغ ' + money(b.amount - pick.amount).toFixed(2)], ruleId: r.id });
    }
  }
  /* 3 — the exact amount within the window (the engine's classic rule), ambiguity lowers the confidence */
  for (const b of bank) {
    if (takenBank.has(b.id)) continue;
    const cands = books.filter((k) => !takenBook.has(k.id) && money(k.amount) === money(b.amount) && inWindow(b, k)).sort((x, y) => dayDiff(b.date, x.date) - dayDiff(b.date, y.date));
    if (!cands.length) continue;
    const pick = cands[0], d = dayDiff(b.date, pick.date), amb = cands.length > 1 && dayDiff(b.date, cands[1].date) === d;
    const reasons = ['المبلغ متساوٍ', d === 0 ? 'نفس اليوم' : 'فارق ' + d + ' يوم'];
    if (amb) reasons.push(cands.length + ' قيود بالمبلغ نفسه في النافذة — تأكد قبل الاعتماد');
    push({ kind: 'amount', bankIds: [b.id], bookIds: [pick.id], amountBank: b.amount, amountBook: pick.amount, confidence: (amb ? 0.7 : 0.9) - d * 0.04, reasons_ar: reasons });
  }
  /* 4 — many to one: one bank credit (or debit) equals a few book lines of the same sign in the window */
  for (const b of bank) {
    if (takenBank.has(b.id)) continue;
    const pool = books.filter((k) => !takenBook.has(k.id) && Math.sign(k.amount) === Math.sign(b.amount) && inWindow(b, k) && Math.abs(k.amount) <= Math.abs(b.amount)).slice(0, 14);
    if (pool.length < 2) continue;
    const target = Math.round(Math.abs(b.amount) * 100), cents = pool.map((k) => Math.round(Math.abs(k.amount) * 100));
    let found: number[] | null = null;
    const walk = (i: number, sum: number, picked: number[]) => {
      if (found || picked.length > maxGroup) return;
      if (sum === target && picked.length >= 2) { found = picked.slice(); return; }
      if (sum >= target || i >= pool.length) return;
      walk(i + 1, sum + cents[i], [...picked, i]);
      walk(i + 1, sum, picked);
    };
    walk(0, 0, []);
    if (!found) continue;
    const ks: BookLine[] = (found as number[]).map((i) => pool[i]);
    push({ kind: 'many-to-one', bankIds: [b.id], bookIds: ks.map((k) => k.id), amountBank: b.amount, amountBook: money(ks.reduce((s, k) => s + k.amount, 0)), confidence: 0.8 - Math.max(0, ks.length - 2) * 0.03, reasons_ar: [(b.amount >= 0 ? 'تحصيل مجمّع' : 'سداد مجمّع') + ' لـ ' + ks.length + ' قيود مجموعها يساوي سطر البنك', 'المراجع: ' + ks.map((k) => k.reference || k.id).join('، ')] });
  }
  /* 5 — bank fees and the VAT on them: bank-only, with the usual account; a VAT line of 15% on the same day joins its fee */
  const feeLines = bank.filter((b) => !takenBank.has(b.id) && b.amount < 0 && FEE_RE.test(normText(b.description)) && !VAT_RE.test(normText(b.description)));
  const vatLines = bank.filter((b) => !takenBank.has(b.id) && b.amount < 0 && VAT_RE.test(normText(b.description)));
  for (const f of feeLines) {
    const v = vatLines.find((x) => !takenBank.has(x.id) && x.date === f.date && Math.abs(money(Math.abs(f.amount) * vatRate) - Math.abs(x.amount)) <= 0.01);
    if (v) push({ kind: 'fee+vat', bankIds: [f.id, v.id], bookIds: [], amountBank: money(f.amount + v.amount), amountBook: 0, confidence: 0.8, reasons_ar: ['رسوم بنكية وضريبتها (' + Math.round(vatRate * 100) + '٪) في اليوم نفسه', 'تُرحَّل إلى ' + feeCode + ' والضريبة إلى حساب ضريبة المدخلات'], suggestedAccountCode: feeCode });
    else push({ kind: 'fee', bankIds: [f.id], bookIds: [], amountBank: f.amount, amountBook: 0, confidence: 0.7, reasons_ar: ['بيان رسوم/عمولة بنكية بلا قيد في الدفاتر', 'تُرحَّل إلى ' + feeCode], suggestedAccountCode: feeCode });
  }
  for (const v of vatLines) {
    if (takenBank.has(v.id)) continue;
    push({ kind: 'fee', bankIds: [v.id], bookIds: [], amountBank: v.amount, amountBook: 0, confidence: 0.55, reasons_ar: ['بيان ضريبة على خدمة بنكية بلا رسوم مرافقة في اليوم نفسه'], suggestedAccountCode: opts.vatAccountCode ?? '1400' });
  }
  /* 6 — a learned recurring transfer with no entry yet: propose the posting */
  for (const b of bank) {
    if (takenBank.has(b.id)) continue;
    const r = ruleFor(b); if (!r || r.kind !== 'recurring') continue;
    const sameAmt = r.amount != null && money(r.amount) === money(b.amount);
    push({ kind: 'rule-post', bankIds: [b.id], bookIds: [], amountBank: b.amount, amountBook: 0, confidence: sameAmt ? 0.65 : 0.5, reasons_ar: ['يشبه «' + r.label_ar + '» المتكرر (' + r.hits + ' مرة) ولا قيد له في الدفاتر بعد', sameAmt ? 'المبلغ المعتاد' : 'المبلغ يختلف عن المعتاد'], ruleId: r.id });
  }
  return out.sort((a, b) => b.confidence - a.confidence || a.bankIds[0].localeCompare(b.bankIds[0]));
}

/* ---------- the state ---------- */
export function applyConfirmation(state: ReconState, match: MatchSuggestion, who: string, ts: string): ReconState {
  if (state.confirmed.some((c) => c.id === match.id)) return state;
  const used = new Set(state.confirmed.flatMap((c) => [...c.bankIds, ...c.bookIds]));
  if ([...match.bankIds, ...match.bookIds].some((x) => used.has(x))) return state;
  return { ...state, confirmed: [...state.confirmed, { ...match, who: String(who || ''), ts }], rejected: state.rejected.filter((r) => r.id !== match.id) };
}
export function rejectMatch(state: ReconState, match: Pick<MatchSuggestion, 'id'>, who: string, ts: string): ReconState {
  if (state.rejected.some((r) => r.id === match.id)) return state;
  return { ...state, rejected: [...state.rejected, { id: match.id, who: String(who || ''), ts }] };
}
/** undo a confirmation: the lines go back to the unmatched lists (a certified period is not touched) */
export function unconfirm(state: ReconState, matchId: string): ReconState {
  return { ...state, confirmed: state.confirmed.filter((c) => c.id !== matchId) };
}
/** learn from a confirmed match: the bank description's tokens, the side, the amount when fixed, and the book side's
   reference prefix / memo; the same pattern seen again raises its hits */
export function learnRule(state: ReconState, match: MatchSuggestion, book: BookLine[], ts: string): ReconState {
  const bl = state.lines.filter((l) => match.bankIds.includes(l.id)); if (!bl.length) return state;
  const pattern = tokens(bl.map((l) => l.description).join(' ')); if (!pattern.length) return state;
  const side: 'in' | 'out' = bl[0].amount >= 0 ? 'in' : 'out';
  const ks = book.filter((k) => match.bookIds.includes(k.id));
  const isFee = match.kind === 'fee' || match.kind === 'fee+vat' || (!ks.length && FEE_RE.test(normText(bl[0].description)));
  const prefix = ks.length ? refPrefix(ks[0].reference) : '', memo = ks.length ? normText(ks[0].memo ?? '') : '';
  const label = ks.length ? (ks[0].memo || ks[0].reference || bl[0].description) : bl[0].description;
  const key = pattern.join(' ') + '|' + side;
  const idx = state.rules.findIndex((r) => r.pattern.join(' ') + '|' + r.side === key);
  const amount = money(match.amountBank);
  if (idx >= 0) {
    const r = state.rules[idx], next: LearnedRule = { ...r, hits: r.hits + 1, lastTs: ts, amount: r.amount != null && money(r.amount) === amount ? r.amount : null, bookRefPrefix: r.bookRefPrefix || prefix, bookMemo: r.bookMemo || memo };
    return { ...state, rules: state.rules.map((x, i) => (i === idx ? next : x)) };
  }
  const rule: LearnedRule = { id: 'rule-' + sha256(key).slice(0, 12), pattern, side, amount, bookRefPrefix: prefix, bookMemo: memo, label_ar: String(label).slice(0, 60), kind: isFee ? 'fee' : 'recurring', hits: 1, lastTs: ts };
  return { ...state, rules: [...state.rules, rule] };
}
export function forgetRule(state: ReconState, ruleId: string): ReconState { return { ...state, rules: state.rules.filter((r) => r.id !== ruleId) }; }

export type Aging = { d0_7: number; d8_30: number; d31_90: number; d90p: number; oldest: number };
const aging = (dates: string[], today: string): Aging => {
  const a: Aging = { d0_7: 0, d8_30: 0, d31_90: 0, d90p: 0, oldest: 0 };
  for (const d of dates) { const n = d ? ageDays(d, today) : 0; a.oldest = Math.max(a.oldest, n); if (n <= 7) a.d0_7++; else if (n <= 30) a.d8_30++; else if (n <= 90) a.d31_90++; else a.d90p++; }
  return a;
};
/** the continuous picture: both unmatched sides with their age, what changed since the last certification */
export function reconState(state: ReconState, book: BookLine[], opts: { today: string }) {
  const usedBank = new Set<string>(), usedBook = new Set<string>();
  for (const c of state.confirmed) { c.bankIds.forEach((x) => usedBank.add(x)); c.bookIds.forEach((x) => usedBook.add(x)); }
  const unmatchedBank = state.lines.filter((l) => !usedBank.has(l.id)), unmatchedBook = book.filter((k) => !usedBook.has(k.id));
  const last = state.certifications.length ? state.certifications[state.certifications.length - 1] : null;
  const sinceTs = last ? last.ts : '', sinceDate = last ? last.range.end : '';
  const sinceLast = {
    certifiedUntil: sinceDate, certifiedAt: sinceTs,
    importedLines: state.imports.filter((i) => !sinceTs || i.ts > sinceTs).reduce((s, i) => s + i.added, 0),
    confirmed: state.confirmed.filter((c) => !sinceTs || c.ts > sinceTs).length,
    unmatchedBank: unmatchedBank.filter((l) => !sinceDate || !l.date || l.date > sinceDate).length,
    unmatchedBook: unmatchedBook.filter((k) => !sinceDate || k.date > sinceDate).length,
  };
  return {
    lines: state.lines.length, confirmed: state.confirmed.length, rules: state.rules.length,
    unmatchedBank, unmatchedBook,
    unmatchedBankAmount: money(unmatchedBank.reduce((s, l) => s + l.amount, 0)), unmatchedBookAmount: money(unmatchedBook.reduce((s, k) => s + k.amount, 0)),
    agingBank: aging(unmatchedBank.map((l) => l.date), opts.today), agingBook: aging(unmatchedBook.map((k) => k.date), opts.today),
    lastCertification: last, sinceLast,
  };
}
/** 'YYYY-MM' → its first and last day; 'YYYY-MM-DD..YYYY-MM-DD' as given */
export function periodRange(period: string) {
  const m = /^(\d{4})-(\d{2})$/.exec(period);
  if (m) { const y = +m[1], mo = +m[2]; return { start: `${m[1]}-${m[2]}-01`, end: new Date(Date.UTC(y, mo, 0)).toISOString().slice(0, 10) }; }
  const r = /^(\d{4}-\d{2}-\d{2})\.\.(\d{4}-\d{2}-\d{2})$/.exec(period);
  if (r) return { start: r[1], end: r[2] };
  return { start: '', end: '' };
}
/** certify a period: who, when, the evidence hash (given, or sha256 of the confirmed matches and the open items of the
   period) and how many items were still unmatched — the shape the close checklist reads */
export function certify(state: ReconState, period: string, who: string, ts: string, evidenceHash: string | undefined, book: BookLine[] = []): { state: ReconState; certification: Certification } {
  const range = periodRange(period);
  const within = (d: string) => !!d && (!range.start || d >= range.start) && (!range.end || d <= range.end);
  const usedBank = new Set<string>(), usedBook = new Set<string>();
  for (const c of state.confirmed) { c.bankIds.forEach((x) => usedBank.add(x)); c.bookIds.forEach((x) => usedBook.add(x)); }
  const openBank = state.lines.filter((l) => within(l.date) && !usedBank.has(l.id)).map((l) => l.id).sort();
  const openBook = book.filter((k) => within(k.date) && !usedBook.has(k.id)).map((k) => k.id).sort();
  const matched = state.confirmed.filter((c) => state.lines.some((l) => c.bankIds.includes(l.id) && within(l.date)));
  const hash = evidenceHash || sha256(JSON.stringify({ period, matched: matched.map((c) => c.id).sort(), openBank, openBook }));
  const certification: Certification = { period, who: String(who || ''), ts, evidenceHash: hash, unmatchedCount: openBank.length + openBook.length, range, matched: matched.length };
  return { state: { ...state, certifications: [...state.certifications.filter((c) => c.period !== period), certification] }, certification };
}
/** the certification of a period, for the close checklist (null when the period was never certified) */
export const certificationOf = (state: ReconState, period: string): Certification | null => state.certifications.find((c) => c.period === period) ?? null;
