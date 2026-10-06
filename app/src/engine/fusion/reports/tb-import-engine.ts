/* Trial balance import — ported from kosif-audit-pro (lib/kosif/trial-balance.mjs) and extended:
   CSV / TSV / text pasted from Excel, Arabic or English headers, net-balance or debit/credit
   columns, and an optional prior-year column (net, or prior debit/credit) for comparatives.
   Classification by the chart-of-accounts first digit, then by account-name hints (Moon, SEE). */
import { SOURCE_MARKER } from './published-source-engine';
import { normalizeDigits, parseMinor, type Minor } from './money-engine';

export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense' | 'suspense';
export type TbRow = {
  line: number; code: string; name: string;
  type: AccountType; classifiedBy: 'code' | 'name' | 'manual' | 'none';
  debit: Minor; credit: Minor;
  /** debit − credit (signed) */ balance: Minor;
  /** in the account's natural direction (credit-positive for liabilities, equity, revenue) */ net: Minor;
  /** prior-year debit − credit, or null when no comparative column */ prior: Minor | null;
};
export type TbError = { line: number; code: 'EMPTY_INPUT' | 'AMOUNT_NOT_NUMERIC' | 'DUPLICATE_ACCOUNT'; message: string };
export type TrialBalance = {
  /** Origin survives adjustments and never establishes audit evidence. */
  sourceKind?: 'published-statements'; sourceId?: string;
  /** the published source's original text, kept so a replay can prove it is the reviewed source (reports/source-replay-engine) */
  sourceTransport?: string;
  ok: boolean; rows: TbRow[]; errors: TbError[];
  totals: { debit: Minor; credit: Minor }; difference: Minor; balanced: boolean;
  hasPrior: boolean; priorDifference: Minor | null; unclassified: number;
  columns: Record<string, number>; delimiter: string;
};

export const TYPE_LABELS: Record<AccountType, string> = {
  asset: 'أصول', liability: 'التزامات', equity: 'حقوق ملكية', revenue: 'إيرادات', expense: 'مصروفات', suspense: 'غير مصنّف',
};
export const NATURE: Record<AccountType, 'debit' | 'credit'> = {
  asset: 'debit', liability: 'credit', equity: 'credit', revenue: 'credit', expense: 'debit', suspense: 'debit',
};

const CODE_PREFIX: Record<string, AccountType> = { 1: 'asset', 2: 'liability', 3: 'equity', 4: 'revenue', 5: 'expense', 6: 'expense', 7: 'expense', 8: 'expense' };
export const norm = (s: unknown): string => normalizeDigits(s).toLowerCase()
  .replace(/[ً-ٰٟ]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/ـ/g, '').replace(/\s+/g, ' ').trim();

const NAME_HINTS: { type: AccountType; words: string[] }[] = [
  /* checked first: «مدخلات» (VAT inputs) contains «دخل» */
  { type: 'asset', words: ['مدخلات', 'ضريبه مدفوعه', 'ضريبه المدخلات', 'input vat'] },
  { type: 'equity', words: ['راس المال', 'راسمال', 'احتياطي', 'ارباح مبقاه', 'ارباح مدوره', 'خسائر متراكمه', 'حقوق الملكيه', 'جاري الشريك', 'جاري الشركاء', 'مسحوبات', 'capital', 'reserve', 'retained', 'equity', 'drawings'] },
  { type: 'revenue', words: ['ايراد', 'مبيعات', 'دخل', 'عموله مكتسبه', 'revenue', 'sales', 'income'] },
  { type: 'expense', words: ['مصروف', 'مصاريف', 'تكلفه', 'رواتب', 'اجور', 'ايجار', 'اهلاك', 'استهلاك', 'مشتريات', 'زكاه الفتره', 'expense', 'cost', 'salary', 'rent', 'depreciation', 'purchase'] },
  { type: 'liability', words: ['دائن', 'دائنه', 'موردين', 'موردون', 'قرض', 'التزام', 'مستحق', 'مخصص', 'زكاه مستحقه', 'ضريبه مستحقه', 'نهايه الخدمه', 'payable', 'loan', 'liability', 'accrued', 'provision'] },
  { type: 'asset', words: ['نقد', 'صندوق', 'بنك', 'مدين', 'مدينه', 'عملاء', 'مخزون', 'بضاعه', 'اصل', 'اصول', 'عهده', 'مقدم', 'استثمار', 'مباني', 'معدات', 'سيارات', 'اثاث', 'cash', 'bank', 'receivable', 'inventory', 'asset', 'prepaid'] },
];

const CONTRA = ['خسائر ائتمانيه', 'ديون مشكوك', 'مجمع اهلاك', 'مجمع الاهلاك', 'مجمع استهلاك', 'اهلاك متراكم', 'استهلاك متراكم', 'accumulated depreciation', 'allowance for'];

export function classifyAccount(code: string, name: string): { type: AccountType; basis: TbRow['classifiedBy'] } {
  const digits = normalizeDigits(code).replace(/\D/g, '');
  if (digits && CODE_PREFIX[digits[0]]) return { type: CODE_PREFIX[digits[0]], basis: 'code' };
  const hay = norm(name);
  /* contra-asset accounts carry a credit balance but belong to assets (receivables, PPE) */
  if (CONTRA.some((w) => hay.includes(w)) && !/مصروف|مصاريف|expense/.test(hay)) return { type: 'asset', basis: 'name' };
  for (const h of NAME_HINTS) if (h.words.some((w) => hay.includes(w))) return { type: h.type, basis: 'name' };
  return { type: 'suspense', basis: 'none' };
}

const HEADERS: Record<string, string[]> = {
  code: ['code', 'account', 'accountcode', 'acct', 'accountno', 'رقم', 'الرقم', 'كود', 'الكود', 'رقمالحساب', 'رمزالحساب', 'الحساب'],
  name: ['name', 'accountname', 'description', 'اسم', 'الاسم', 'اسمالحساب', 'البيان', 'الوصف'],
  debit: ['debit', 'dr', 'مدين', 'المدين', 'مدينه', 'رصيدمدين'],
  credit: ['credit', 'cr', 'دائن', 'الدائن', 'دائنه', 'رصيددائن'],
  balance: ['balance', 'net', 'current', 'currentbalance', 'رصيد', 'الرصيد', 'صافي', 'الرصيدالحالي', 'السنهالحاليه', 'الحالي'],
  prior: ['prior', 'previous', 'prioryear', 'comparative', 'السابق', 'الرصيدالسابق', 'السنهالسابقه', 'المقارن', 'العامالسابق'],
  priorDebit: ['priordebit', 'priordr', 'مدينسابق', 'المدينالسابق', 'مدينالسنهالسابقه'],
  priorCredit: ['priorcredit', 'priorcr', 'دائنسابق', 'الدائنالسابق', 'دائنالسنهالسابقه'],
};
function headerKey(cell: string): string | null {
  const k = norm(cell).replace(/[\s_\-.()]/g, '');
  for (const [field, aliases] of Object.entries(HEADERS)) if (aliases.includes(k)) return field;
  return null;
}

export function splitLine(line: string, delimiter: string): string[] {
  const cells: string[] = []; let cur = ''; let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { if (quoted && line[i + 1] === '"') { cur += '"'; i++; } else quoted = !quoted; }
    else if (ch === delimiter && !quoted) { cells.push(cur); cur = ''; }
    else cur += ch;
  }
  cells.push(cur);
  return cells.map((c) => c.trim());
}
export function detectDelimiter(text: string): string {
  const lines = String(text).split(/\r?\n/).filter((l) => l.trim()).slice(0, 12);
  let best = ','; let bestScore = -1;
  for (const d of ['\t', ',', ';', '|']) {
    const counts = lines.map((l) => splitLine(l, d).length);
    if (!counts.length || counts[0] < 2) continue;
    const score = counts.filter((c) => c === counts[0]).length * 10 + counts[0];
    if (score > bestScore) { bestScore = score; best = d; }
  }
  return best;
}

function makeRow(line: number, code: string, name: string, debit: Minor, credit: Minor, prior: Minor | null, override?: AccountType): TbRow {
  if (debit < 0) { credit += -debit; debit = 0; }
  if (credit < 0) { debit += -credit; credit = 0; }
  const cls = override ? { type: override, basis: 'manual' as const } : classifyAccount(code, name);
  const balance = debit - credit;
  return { line, code, name, type: cls.type, classifiedBy: cls.basis, debit, credit, balance, net: NATURE[cls.type] === 'debit' ? balance : -balance, prior };
}

function finish(rows: TbRow[], errors: TbError[], columns: Record<string, number>, delimiter: string): TrialBalance {
  const debit = rows.reduce((a, r) => a + r.debit, 0), credit = rows.reduce((a, r) => a + r.credit, 0);
  const hasPrior = rows.some((r) => r.prior !== null);
  const priorDifference = hasPrior ? rows.reduce((a, r) => a + (r.prior ?? 0), 0) : null;
  return { ok: rows.length > 0, rows, errors, totals: { debit, credit }, difference: debit - credit, balanced: debit === credit,
    hasPrior, priorDifference, unclassified: rows.filter((r) => r.type === 'suspense').length, columns, delimiter };
}

/** Parse tabular text into a trial balance. overrides: {accountCode: type} from the user's mapping review. */
export function parseTrialBalance(text: string, opts: { delimiter?: string; overrides?: Record<string, AccountType> } = {}): TrialBalance {
  const raw = String(text ?? '').replace(/^﻿/, '');
  const marked = raw.split(/\r?\n/).find(l => l.startsWith(SOURCE_MARKER));
  const source = raw.split(/\r?\n/).filter(l => !l.startsWith(SOURCE_MARKER)).join('\n');
  const lines = source.split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return finish([], [{ line: 0, code: 'EMPTY_INPUT', message: 'لا توجد بيانات للاستيراد' }], {}, ',');
  const delimiter = opts.delimiter || detectDelimiter(source);
  const head = splitLine(lines[0], delimiter), columns: Record<string, number> = {};
  head.forEach((cell, i) => { const f = headerKey(cell); if (f && columns[f] === undefined) columns[f] = i; });
  const hasHeader = Object.keys(columns).length >= 2;
  if (!hasHeader) Object.assign(columns, { code: 0, name: 1, debit: 2, credit: 3 });
  const errors: TbError[] = [], rows: TbRow[] = [], seen = new Map<string, number>();
  (hasHeader ? lines.slice(1) : lines).forEach((raw, i) => {
    const lineNo = i + (hasHeader ? 2 : 1), cells = splitLine(raw, delimiter);
    const code = String(cells[columns.code] ?? '').trim(), name = String(cells[columns.name] ?? '').trim() || code;
    if (!code && !name) return;
    if ([code, name].some((v) => /^(الاجمالي|الإجمالي|المجموع|total|totals)$/i.test(v))) return;
    const cell = (k: string) => (columns[k] !== undefined ? parseMinor(cells[columns[k]]) : 0);
    let debit = cell('debit'), credit = cell('credit');
    if (columns.debit === undefined && columns.credit === undefined && columns.balance !== undefined) {
      const net = cell('balance'); if (net !== null) { debit = net >= 0 ? net : 0; credit = net < 0 ? -net : 0; } else debit = null;
    }
    if (debit === null || credit === null) { errors.push({ line: lineNo, code: 'AMOUNT_NOT_NUMERIC', message: `مبلغ غير صالح في السطر ${lineNo}` }); return; }
    let prior: Minor | null = null;
    if (columns.priorDebit !== undefined || columns.priorCredit !== undefined) {
      const pd = cell('priorDebit') ?? 0, pc = cell('priorCredit') ?? 0; prior = pd - pc;
    } else if (columns.prior !== undefined) prior = cell('prior');
    if (seen.has(code) && code) errors.push({ line: lineNo, code: 'DUPLICATE_ACCOUNT', message: `الحساب ${code} مكرر (السطر ${seen.get(code)} والسطر ${lineNo})` });
    else seen.set(code, lineNo);
    rows.push(makeRow(lineNo, code, name, debit, credit, prior, opts.overrides?.[code]));
  });
  const result = finish(rows, errors, columns, delimiter);
  return marked ? {...result,sourceKind:'published-statements',sourceId:marked.slice(SOURCE_MARKER.length).trim(),sourceTransport:text} : result;
}

/** Build a trial balance from rows the app already has (the ledger engine, the audit bridge). */
export function fromRows(input: { code: string; name?: string; debit?: number; credit?: number; prior?: number | null }[], opts: { overrides?: Record<string, AccountType>; majorUnits?: boolean } = {}): TrialBalance {
  const m = (v: unknown) => (opts.majorUnits === false ? Math.round(Number(v) || 0) : Math.round((Number(v) || 0) * 100));
  const rows = input.map((r, i) => makeRow(i + 1, String(r.code), String(r.name || r.code), m(r.debit), m(r.credit), r.prior == null ? null : m(r.prior), opts.overrides?.[String(r.code)]));
  return finish(rows, [], {}, '');
}

/** Largest balances by absolute value — the natural population head for sampling. */
export function largestBalances(tb: TrialBalance, limit = 10): TbRow[] {
  return [...tb.rows].sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance) || a.code.localeCompare(b.code, 'en')).slice(0, limit);
}

/** A balance kept by the app's own books (ledger or operational records), in major units:
 *  positive = debit balance, negative = credit balance; `prior` the same for the comparative year. */
export type BookBalance = { code: string; name: string; balance: number; prior?: number | null };

const csvCell = (v: string): string => (/[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v);
const amt = (v: number): string => (Math.round(v * 100) / 100).toFixed(2).replace(/\.00$/, '');

/** The app's books as a trial-balance CSV the review reads (رقم الحساب، اسم الحساب، مدين، دائن، السنة السابقة):
 *  debit balances in مدين, credit balances in دائن, the comparative as one signed column. Zero lines are
 *  dropped; the prior column appears only when a comparative exists. */
export function booksToCsv(rows: BookBalance[]): string {
  const withPrior = rows.some((r) => r.prior !== null && r.prior !== undefined);
  const lines = rows
    .filter((r) => Math.abs(r.balance) >= 0.005 || (withPrior && Math.abs(r.prior || 0) >= 0.005))
    .sort((a, b) => a.code.localeCompare(b.code, 'en'))
    .map((r) => [csvCell(r.code), csvCell(r.name), r.balance > 0 ? amt(r.balance) : '', r.balance < 0 ? amt(-r.balance) : '', ...(withPrior ? [amt(r.prior || 0)] : [])].join(','));
  return [['رقم الحساب', 'اسم الحساب', 'مدين', 'دائن', ...(withPrior ? ['السنة السابقة'] : [])].join(','), ...lines].join('\n');
}

/** A balanced two-year sample (SAR) for the demo button and the tests: a small trading company. */
export const SAMPLE_TB_CSV = [
  'رقم الحساب,اسم الحساب,مدين,دائن,السنة السابقة',
  '1101,النقد لدى البنك,150000,,100000',
  '1121,ذمم مدينة - عملاء,80000,,60000',
  '1141,مخزون بضاعة,50000,,40000',
  '1501,معدات وآلات,200000,,180000',
  '1509,مجمع إهلاك المعدات,,60000,-40000',
  '2101,موردون,,70000,-50000',
  '2105,زكاة مستحقة,,5000,-4000',
  '2201,قرض طويل الأجل,,100000,-120000',
  '2301,مخصص مكافأة نهاية الخدمة,,15000,-12000',
  '3101,رأس المال,,100000,-100000',
  '3301,أرباح مبقاة,,43000,-2000',
  '4101,المبيعات,,500000,-400000',
  '5101,تكلفة المبيعات,300000,,250000',
  '6101,رواتب وأجور إدارية,80000,,70000',
  '6201,مصروف إهلاك,20000,,15000',
  '7101,تكاليف تمويل,8000,,9000',
  '8101,مصروف الزكاة,5000,,4000',
].join('\n');
