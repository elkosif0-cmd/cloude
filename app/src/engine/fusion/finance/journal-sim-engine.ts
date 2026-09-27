/**
 * The journal simulator (محاكي القيود): learn how a company books from a period of its journal entries,
 * then suggest the entry for a new document — which accounts, which amounts, which book, what to check —
 * and ask when it is not sure. What the accountant confirms is remembered and outweighs the history.
 *
 * learn(lines)            the period's journal lines → a model: the accounts and what each is used for, the
 *                         booking patterns (the same debit and credit accounts), their words, parties, amounts,
 *                         VAT and months, and the recurring entries.
 * suggest(model, doc)     a document (its text, and whatever is known: amount, VAT, party, payment) → the
 *                         entry, its confidence, why, where it is recorded, the steps, and the questions to ask.
 * remember(memory, …)     the confirmed entry becomes an example the next suggestion weighs first.
 * parseJournal(rows)      a sheet of journal lines (Arabic or English headers) → lines.
 * extract(text)           the amount, VAT, date, party and payment read from a document's text.
 * Pure functions; the screen keeps the model and the memory with the company.
 */

export type JLine = { entry: string; date: string; code: string; name?: string; debit: number; credit: number; memo?: string; party?: string };
export type AccountKind = 'cash' | 'bank' | 'receivable' | 'payable' | 'vat_in' | 'vat_out' | 'vat' | 'revenue' | 'expense' | 'payroll'
  | 'inventory' | 'asset' | 'equity' | 'other';
export type Book = 'purchases' | 'sales' | 'cash' | 'bank' | 'payroll' | 'assets' | 'general';
export type SideShare = { code: string; name: string; share: number; kind: AccountKind };
export type LearnedAccount = { code: string; name: string; kind: AccountKind; debit: number; credit: number; lines: number };
export type Pattern = {
  sig: string; label: string; book: Book; debit: SideShare[]; credit: SideShare[]; count: number; total: number; min: number; max: number;
  tokens: Record<string, number>; parties: string[]; months: string[]; vat: boolean; examples: string[];
};
export type Model = {
  from: string; to: string; entries: number; lines: number; accounts: LearnedAccount[]; patterns: Pattern[];
  recurring: { sig: string; label: string; months: number; avg: number }[]; unbalanced: string[]; idf: Record<string, number>;
};
export type Doc = { text: string; amount?: number; date?: string; party?: string; vat?: 'incl' | 'excl' | 'none' | 'unknown'; method?: 'cash' | 'bank' | 'credit' | ''; sig?: string };
export type Example = { id: string; at: string; tokens: string[]; party: string; sig: string; label: string; book: Book; debit: SideShare[]; credit: SideShare[]; amount: number; vat: boolean };
export type Memory = { examples: Example[] };
export type Question = { id: 'kind' | 'amount' | 'vat' | 'method'; text: string; options?: { value: string; label: string }[] };
export type SuggestedLine = { code: string; name: string; debit: number; credit: number };
export type Suggestion = {
  confidence: number; sig: string; label: string; book: Book; lines: SuggestedLine[]; where: string; steps: string[]; why: string[];
  questions: Question[]; alternatives: { sig: string; label: string; score: number }[];
  extracted: { amount: number | null; vatAmount: number | null; date: string | null; party: string | null; vat: Doc['vat']; method: Doc['method'] };
  source: 'memory' | 'history' | 'none';
};

const VAT = 0.15;
const r2 = (v: number) => Math.round((Number(v) || 0) * 100) / 100;
const num = (v: unknown) => { const n = Number(String(v ?? '').replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[,،\s]/g, '').replace('٫', '.')); return Number.isFinite(n) ? n : 0; };

/* ---------- words ---------- */
export function normalize(s: string): string {
  return String(s || '').replace(/[ً-ْٰـ]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')
    .replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).toLowerCase();
}
const STOP = new Set(['من', 'الي', 'الى', 'في', 'علي', 'على', 'عن', 'مع', 'او', 'و', 'ال', 'هذا', 'هذه', 'ذلك', 'رقم', 'تاريخ', 'بتاريخ', 'مبلغ', 'قيمه', 'بقيمه', 'عدد', 'شهر', 'لشهر', 'سنه', 'عام',
  'the', 'of', 'for', 'to', 'and', 'a', 'an', 'no', 'on', 'by', 'at', 'in', 'ريال', 'رس', 'sar', 'sr']);
export function tokens(s: string): string[] {
  const out: string[] = [];
  for (let w of normalize(s).split(/[^a-zء-ي]+/)) {
    if (!w) continue;
    if (w.length > 4 && w.startsWith('ال')) w = w.slice(2);
    else if (w.length > 5 && (w.startsWith('بال') || w.startsWith('وال') || w.startsWith('لل'))) w = w.slice(w.startsWith('لل') ? 2 : 3);
    if (w.length < 2 || STOP.has(w)) continue;
    out.push(w);
  }
  return out;
}

/* ---------- accounts ---------- */
export function accountKind(code: string, name = ''): AccountKind {
  const n = normalize(name);
  if (/ضريب|vat/.test(n)) return /مدخلات|مشتريات|input|recoverable|قابله للاسترداد/.test(n) ? 'vat_in' : /مخرجات|مبيعات|output|payable|مستحقه/.test(n) ? 'vat_out' : 'vat';
  if (/رواتب|اجور|مرتبات|salar|wage|payroll/.test(n)) return 'payroll';
  if (/صندوق|نقديه بالصندوق|نقد|cash|petty/.test(n) && !/بنك|bank/.test(n)) return 'cash';
  if (/بنك|مصرف|bank|راجحي|اهلي|انماء|رياض|بلاد/.test(n)) return 'bank';
  if (/عملاء|مدينون|ذمم مدينه|receivable|debtors|customers/.test(n)) return 'receivable';
  if (/موردون|موردين|دائنون|ذمم دائنه|payable|creditors|suppliers|مستحقات/.test(n)) return 'payable';
  if (/مخزون|بضاعه|inventory|stock/.test(n)) return 'inventory';
  if (/مبيعات|ايراد|revenue|sales|income/.test(n) && !/تكلفه|cost/.test(n)) return 'revenue';
  if (/راس المال|جاري الشريك|جاري المالك|capital|equity|ارباح مبقاه|محتجزه/.test(n)) return 'equity';
  if (/اصول|معدات|سيارات|اثاث|اجهزه|مباني|اراضي|equipment|vehicle|furniture|asset/.test(n) && !/اهلاك|استهلاك|depreciation expense/.test(n)) return 'asset';
  if (/مصروف|مصاريف|تكلفه|ايجار|كهرباء|مياه|صيانه|اتصالات|نقل|تسويق|اهلاك|expense|cost|rent|utilities/.test(n)) return 'expense';
  const c = String(code).trim()[0];
  return c === '1' ? 'asset' : c === '2' ? 'payable' : c === '3' ? 'equity' : c === '4' ? 'revenue' : c === '5' || c === '6' ? 'expense' : 'other';
}
const SETTLE: AccountKind[] = ['cash', 'bank', 'payable', 'receivable'];
function bookOf(d: SideShare[], c: SideShare[]): Book {
  const k = new Set([...d, ...c].map(x => x.kind));
  if (k.has('revenue') || k.has('vat_out')) return 'sales';
  if (k.has('payroll')) return 'payroll';
  if (d.some(x => x.kind === 'asset')) return 'assets';
  if ((k.has('vat_in') || c.some(x => x.kind === 'payable')) && d.some(x => x.kind === 'inventory' || x.kind === 'expense')) return 'purchases';
  if (k.has('bank')) return 'bank';
  if (k.has('cash')) return 'cash';
  return 'general';
}
export const BOOK_AR: Record<Book, string> = { purchases: 'دفتر المشتريات', sales: 'دفتر المبيعات', cash: 'دفتر الصندوق', bank: 'دفتر البنك', payroll: 'قيود الرواتب', assets: 'سجل الأصول الثابتة', general: 'دفتر اليومية العامة' };

/* ---------- reading a sheet of journal lines ---------- */
const HEAD: Record<keyof JLine, RegExp> = {
  entry: /رقم القيد|القيد|entry|voucher|je\b|سند/i, date: /تاريخ|date/i, code: /رمز|رقم الحساب|كود|code|account no|acct/i, name: /اسم الحساب|الحساب|account name|account/i,
  debit: /مدين|debit|dr\b/i, credit: /دائن|credit|cr\b/i, memo: /بيان|البيان|الوصف|شرح|description|memo|narration/i, party: /الطرف|المورد|العميل|party|vendor|customer/i
};
export function parseJournal(rows: string[][]): { lines: JLine[]; issues: string[]; columns: Partial<Record<keyof JLine, number>> } {
  const issues: string[] = [];
  const hi = rows.findIndex(r => r.some(c => HEAD.debit.test(String(c))) && r.some(c => HEAD.credit.test(String(c))));
  if (hi < 0) return { lines: [], issues: ['لم أجد عمودي «مدين» و«دائن» في الملف'], columns: {} };
  const h = rows[hi].map(c => String(c || '').trim());
  const col: Partial<Record<keyof JLine, number>> = {};
  const used = new Set<number>();
  (['debit', 'credit', 'date', 'entry', 'code', 'memo', 'party', 'name'] as (keyof JLine)[]).forEach(k => {
    const i = h.findIndex((c, j) => !used.has(j) && HEAD[k].test(c));
    if (i >= 0) { col[k] = i; used.add(i); }
  });
  if (col.code == null && col.name == null) issues.push('لم أجد عمود الحساب');
  const lines: JLine[] = [];
  let lastEntry = '', lastDate = '', autoNo = 0, bal = 0;
  for (const r of rows.slice(hi + 1)) {
    if (!r || r.every(c => !String(c ?? '').trim())) continue;
    const g = (k: keyof JLine) => col[k] == null ? '' : String(r[col[k] as number] ?? '').trim();
    const debit = num(g('debit')), credit = num(g('credit'));
    if (!debit && !credit) continue;
    let entry = g('entry'), date = toIso(g('date'));
    if (!entry) { if (Math.abs(bal) < 0.005) autoNo++; entry = lastEntry && Math.abs(bal) >= 0.005 ? lastEntry : 'JE-' + autoNo; }
    if (!date) date = lastDate;
    if (entry !== lastEntry) bal = 0;
    bal += debit - credit;
    const code = g('code') || g('name');
    lines.push({ entry, date, code, name: g('name') || g('code'), debit: r2(debit), credit: r2(credit), memo: g('memo'), party: g('party') });
    lastEntry = entry; lastDate = date;
  }
  if (!lines.length) issues.push('لا سطور بمبالغ في الملف');
  return { lines, issues, columns: col };
}
export function toIso(s: string): string {
  const t = String(s || '').trim().replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
  let m = t.match(/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (m) return m[1] + '-' + m[2].padStart(2, '0') + '-' + m[3].padStart(2, '0');
  m = t.match(/(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (m) return m[3] + '-' + m[2].padStart(2, '0') + '-' + m[1].padStart(2, '0');
  const n = Number(t);
  if (n > 30000 && n < 80000) { const d = new Date(Date.UTC(1899, 11, 30) + n * 864e5); return d.toISOString().slice(0, 10); }
  return '';
}

/* ---------- learning ---------- */
export function learn(all: JLine[], opts: { from?: string; to?: string } = {}): Model {
  const lines = all.filter(l => (!opts.from || !l.date || l.date >= opts.from) && (!opts.to || !l.date || l.date <= opts.to));
  const acc = new Map<string, LearnedAccount>();
  lines.forEach(l => {
    const a = acc.get(l.code) || { code: l.code, name: l.name || l.code, kind: accountKind(l.code, l.name || ''), debit: 0, credit: 0, lines: 0 };
    a.debit += l.debit; a.credit += l.credit; a.lines++; if (l.name && a.name === a.code) a.name = l.name; acc.set(l.code, a);
  });
  const byEntry = new Map<string, JLine[]>();
  lines.forEach(l => { const k = l.entry || l.date + '|' + (l.memo || ''); if (!byEntry.has(k)) byEntry.set(k, []); byEntry.get(k)!.push(l); });
  const pats = new Map<string, Pattern & { dAmt: Map<string, number>; cAmt: Map<string, number> }>();
  const unbalanced: string[] = [];
  const df = new Map<string, number>();
  byEntry.forEach((ls, id) => {
    const dr = ls.reduce((s, l) => s + l.debit, 0), cr = ls.reduce((s, l) => s + l.credit, 0);
    if (Math.abs(dr - cr) > 0.01) unbalanced.push(id);
    const dC = [...new Set(ls.filter(l => l.debit > 0).map(l => l.code))].sort(), cC = [...new Set(ls.filter(l => l.credit > 0).map(l => l.code))].sort();
    if (!dC.length || !cC.length) return;
    const sig = 'D:' + dC.join('+') + '|C:' + cC.join('+');
    const words = [...new Set(tokens(ls.map(l => (l.memo || '') + ' ' + (l.party || '')).join(' ')))];
    words.forEach(w => df.set(w, (df.get(w) || 0) + 1));
    let p = pats.get(sig);
    if (!p) { p = { sig, label: '', book: 'general', debit: [], credit: [], count: 0, total: 0, min: Infinity, max: 0, tokens: {}, parties: [], months: [], vat: false, examples: [], dAmt: new Map(), cAmt: new Map() }; pats.set(sig, p); }
    p.count++; p.total += dr; p.min = Math.min(p.min, dr); p.max = Math.max(p.max, dr);
    ls.forEach(l => { if (l.debit) p!.dAmt.set(l.code, (p!.dAmt.get(l.code) || 0) + l.debit); if (l.credit) p!.cAmt.set(l.code, (p!.cAmt.get(l.code) || 0) + l.credit); });
    words.forEach(w => { p!.tokens[w] = (p!.tokens[w] || 0) + 1; });
    ls.forEach(l => { if (l.party && !p!.parties.includes(l.party)) p!.parties.push(l.party); });
    const mo = (ls[0].date || '').slice(0, 7); if (mo && !p.months.includes(mo)) p.months.push(mo);
    if (p.examples.length < 5) p.examples.push(id);
  });
  const N = Math.max(1, byEntry.size), idf: Record<string, number> = {};
  df.forEach((v, w) => { idf[w] = Math.log(1 + N / v); });
  const share = (m: Map<string, number>): SideShare[] => { const t = [...m.values()].reduce((s, v) => s + v, 0) || 1; return [...m.entries()].map(([code, v]) => { const a = acc.get(code)!; return { code, name: a.name, share: v / t, kind: a.kind }; }).sort((x, y) => y.share - x.share); };
  const patterns: Pattern[] = [...pats.values()].map(p => {
    const debit = share(p.dAmt), credit = share(p.cAmt);
    const vat = [...debit, ...credit].some(x => x.kind === 'vat' || x.kind === 'vat_in' || x.kind === 'vat_out');
    const book = bookOf(debit, credit);
    const main = (s: SideShare[]) => (s.find(x => !/vat/.test(x.kind)) || s[0]);
    const label = main(debit).name + ' ← ' + main(credit).name;
    const { dAmt: _d, cAmt: _c, ...rest } = p;
    return { ...rest, debit, credit, vat, book, label, min: r2(p.min), max: r2(p.max), total: r2(p.total), months: p.months.sort() };
  }).sort((a, b) => b.count - a.count);
  const dates = lines.map(l => l.date).filter(Boolean).sort();
  const recurring = patterns.filter(p => p.months.length >= 3 && p.count <= p.months.length * 1.5).map(p => ({ sig: p.sig, label: p.label, months: p.months.length, avg: r2(p.total / p.count) }));
  return { from: opts.from || dates[0] || '', to: opts.to || dates[dates.length - 1] || '', entries: byEntry.size, lines: lines.length, accounts: [...acc.values()].sort((a, b) => a.code.localeCompare(b.code)), patterns, recurring, unbalanced, idf };
}

/* ---------- reading a document ---------- */
export function extract(text: string): Suggestion['extracted'] {
  const t = normalize(text);
  /* the first amount after a keyword (a percentage is not an amount) */
  const numsAt = (re: RegExp) => { const out: number[] = []; let m: RegExpExecArray | null; const g = new RegExp(re.source, 'g');
    while ((m = g.exec(t))) { const w = t.slice(m.index, m.index + 60), nr = /(\d[\d,]*(?:\.\d+)?)\s*([%٪])?/g; let x: RegExpExecArray | null; while ((x = nr.exec(w))) { if (!x[2]) { out.push(num(x[1])); break; } } } return out; };
  const totals = numsAt(/(اجمالي|الاجمالي|المجموع|الصافي|المستحق|total|amount due|net amount|المبلغ)/);
  const vatNums = numsAt(/(ضريبه القيمه المضافه|الضريبه|ضريبه|vat)/);
  /* any other number, except dates, years, percentages and reference numbers (رقم 44, no. 12, #7) */
  const all: number[] = []; { const nr = /(رقم|no\.?|#|ref|مرجع)?\s*(\d[\d,]*(?:\.\d+)?)\s*([%٪/-])?/g; let x: RegExpExecArray | null;
    while ((x = nr.exec(t))) { if (x[1] || x[3]) continue; const v = num(x[2]); if (v >= 1 && !(v >= 1900 && v <= 2100 && Number.isInteger(v)) && String(Math.round(v)).length <= 8) all.push(v); } }
  const amount = totals.length ? Math.max(...totals) : all.length ? Math.max(...all) : null;
  const mentionsVat = /ضريب|vat|15 ?%|15٪/.test(t);
  const vat: Doc['vat'] = /غير شامل|قبل الضريبه|excl|exclusive/.test(t) ? 'excl' : /شامل|incl|inclusive/.test(t) ? 'incl' : /معفي|بدون ضريبه|exempt|zero.rated/.test(t) ? 'none' : mentionsVat ? 'incl' : 'unknown';
  const method: Doc['method'] = /نقدا|نقدي|كاش|cash/.test(t) ? 'cash' : /تحويل|بنك|شيك|مدي|بطاقه|transfer|bank|cheque|card/.test(t) ? 'bank' : /اجل|على الحساب|علي الحساب|credit|net 30|مستحق/.test(t) ? 'credit' : '';
  const pm = String(text).match(/(?:المورد|من|السادة|السيد|العميل|لصالح|سداد|تحصيل من|supplier|vendor|from|bill to|paid to|to)\s*[:：/]?\s*([^\n,،:—–|\d٠-٩]{3,50})/i);
  /* a company-like name first (شركة…، مؤسسة…), then what follows «المورد:» / «من» — never the bank or the cash box */
  const cm = String(text).match(/((?:شركة|شركه|مؤسسة|مؤسسه|مكتب|مصنع|مطعم|مطاعم|محل|مجموعة|مجموعه|مستشفى|صيدلية)\s[^\n,،:—–|\d٠-٩]{2,40}|[A-Z][\w&.' ]{1,40}\s(?:Co\.?|Company|LLC|Ltd\.?|Est\.?))/);
  const clean = (v: string) => v.replace(/\s+(?:بتاريخ|تاريخ|رقم|الاجمالي|الإجمالي|المبلغ|لشهر|عن شهر|شامل|قبل|المستحق|تسدد|يسدد).*$/, '').trim().split(/\s+/).slice(0, 5).join(' ');
  const generic = /^(ال)?(بنك|صندوق|حساب|خزينه)/;
  const cand = [cm && cm[1], pm && pm[1]].filter((v): v is string => !!v).map(clean).find(v => v.length >= 3 && !generic.test(normalize(v)));
  const party = cand || null;
  const d = toIso(String(text));
  return { amount: amount ? r2(amount) : null, vatAmount: vatNums.length ? r2(Math.min(...vatNums)) : null, date: d || null, party, vat, method };
}

/* ---------- what kind of document, what kind of entry ---------- */
export type DocType = 'purchase' | 'payment' | 'receipt' | 'sales' | 'payroll' | 'asset' | null;
export function docType(text: string): DocType {
  const t = normalize(text);
  if (/رواتب|مسير|اجور|payroll|salar/.test(t)) return 'payroll';
  if (/سند قبض|تحصيل|استلام مبلغ|استلمنا مبلغ|receipt voucher|received from|collection/.test(t)) return 'receipt';
  if (/سند صرف|سداد|دفعه|دفعنا|تحويل الي|payment voucher|paid to|remittance/.test(t) && !/فاتوره ضريبيه|tax invoice/.test(t)) return 'payment';
  if (/فاتوره مبيعات|فاتوره بيع|بيع الي|مبيعات الي|sales invoice/.test(t)) return 'sales';
  if (/شراء (سياره|معدات|جهاز|اجهزه|اثاث|ثلاجه)|اصل ثابت|fixed asset/.test(t)) return 'asset';
  if (/فاتوره|فاتوره ضريبيه|invoice|bill|مشتريات|شراء|توريد|استلام بضاعه|اشعار استلام/.test(t)) return 'purchase';
  return null;
}
export function patternType(debit: SideShare[], credit: SideShare[]): DocType {
  const dk = new Set(debit.map(x => x.kind)), ck = new Set(credit.map(x => x.kind));
  if (dk.has('payroll')) return 'payroll';
  if (ck.has('revenue') || ck.has('vat_out')) return 'sales';
  if (dk.has('asset')) return 'asset';
  if ((dk.has('inventory') || dk.has('expense')) && (ck.has('payable') || ck.has('cash') || ck.has('bank'))) return 'purchase';
  if (dk.has('payable') && (ck.has('cash') || ck.has('bank'))) return 'payment';
  if ((dk.has('cash') || dk.has('bank')) && ck.has('receivable')) return 'receipt';
  return null;
}

/* ---------- suggesting ---------- */
function simTokens(doc: string[], p: Record<string, number>, idf: Record<string, number>, count: number): { s: number; hits: string[] } {
  const hits: string[] = []; let s = 0, norm = 0;
  doc.forEach(w => { const i = idf[w] ?? 1; norm += i; if (p[w]) { s += i * Math.min(1, p[w] / Math.max(1, count) * 2); hits.push(w); } });
  return { s: norm ? s / norm : 0, hits };
}
const jaccard = (a: string[], b: string[]) => { const A = new Set(a), B = new Set(b); let n = 0; A.forEach(x => { if (B.has(x)) n++; }); return A.size + B.size ? n / (A.size + B.size - n) : 0; };
function settleAccount(model: Model, kind: AccountKind): LearnedAccount | null {
  return model.accounts.filter(a => a.kind === kind).sort((a, b) => b.lines - a.lines)[0] || null;
}
function buildLines(model: Model, debit: SideShare[], credit: SideShare[], amount: number, vatState: Doc['vat'], method: Doc['method']): SuggestedLine[] {
  const isVat = (x: SideShare) => x.kind === 'vat' || x.kind === 'vat_in' || x.kind === 'vat_out';
  const hasVat = [...debit, ...credit].some(isVat);
  let net = amount, vat = 0, gross = amount;
  if (hasVat && vatState !== 'none') { if (vatState === 'excl') { vat = r2(amount * VAT); gross = r2(amount + vat); } else { net = r2(amount / (1 + VAT)); vat = r2(amount - net); } }
  /* the settlement side follows how it was paid */
  const want: AccountKind | null = method === 'cash' ? 'cash' : method === 'bank' ? 'bank' : method === 'credit' ? null : null;
  const swap = (side: SideShare[]) => side.map(x => {
    if (!want || !SETTLE.includes(x.kind) || x.kind === want) return x;
    if (method === 'credit') return x;
    const a = settleAccount(model, want); return a ? { ...x, code: a.code, name: a.name, kind: a.kind } : x;
  });
  const toCredit = (side: SideShare[]) => method === 'credit' ? side.map(x => { if (x.kind === 'cash' || x.kind === 'bank') { const k: AccountKind = debit.some(d => d.kind === 'revenue') || side.some(s => s.kind === 'revenue') ? 'receivable' : 'payable'; const a = settleAccount(model, k); return a ? { ...x, code: a.code, name: a.name, kind: a.kind } : x; } return x; }) : side;
  const D = toCredit(swap(debit)), C = toCredit(swap(credit));
  const spread = (side: SideShare[], total: number, vatLine: number, dr: boolean): SuggestedLine[] => {
    const plain = side.filter(x => !isVat(x)), vats = side.filter(isVat);
    const t = plain.reduce((s, x) => s + x.share, 0) || 1;
    const out = plain.map(x => ({ code: x.code, name: x.name, debit: dr ? r2(total * x.share / t) : 0, credit: dr ? 0 : r2(total * x.share / t) }));
    if (vats.length && vatLine) out.push({ code: vats[0].code, name: vats[0].name, debit: dr ? vatLine : 0, credit: dr ? 0 : vatLine });
    /* rounding onto the biggest line */
    const sum = out.reduce((s, l) => s + (dr ? l.debit : l.credit), 0), want2 = r2(total + (vats.length ? vatLine : 0));
    if (out.length && Math.abs(sum - want2) >= 0.005) { const big = out[0]; if (dr) big.debit = r2(big.debit + want2 - sum); else big.credit = r2(big.credit + want2 - sum); }
    return out;
  };
  const dVat = D.some(isVat), cVat = C.some(isVat);
  const dLines = spread(D, dVat ? net : (cVat ? gross : amount), dVat ? vat : 0, true);
  const cLines = spread(C, cVat ? net : (dVat ? gross : amount), cVat ? vat : 0, false);
  return [...dLines, ...cLines].filter(l => l.debit || l.credit);
}
export function suggest(model: Model, doc: Doc, memory: Memory = { examples: [] }): Suggestion {
  const ex = extract(doc.text || '');
  const amount = doc.amount != null && doc.amount > 0 ? doc.amount : ex.amount;
  const party = (doc.party || ex.party || '').trim();
  const vatState: Doc['vat'] = doc.vat && doc.vat !== 'unknown' ? doc.vat : ex.vat;
  const method: Doc['method'] = doc.method || ex.method;
  const words = [...new Set(tokens((doc.text || '') + ' ' + party))];
  const dt = docType(doc.text || '');
  const typeFit = (d: SideShare[], c: SideShare[]) => { if (!dt) return 0; const pt = patternType(d, c); return pt === dt ? 0.3 : pt ? -0.2 : 0; };
  type Cand = { sig: string; label: string; book: Book; debit: SideShare[]; credit: SideShare[]; score: number; why: string[]; src: 'memory' | 'history'; p?: Pattern };
  const cands = new Map<string, Cand>();
  const put = (c: Cand) => { const o = cands.get(c.sig); if (!o || c.score > o.score) cands.set(c.sig, o ? { ...c, score: Math.max(c.score, o.score) + 0.05, why: [...c.why, ...o.why] } : c); };
  model.patterns.forEach(p => {
    const { s, hits } = simTokens(words, p.tokens, model.idf, p.count);
    let score = s; const why: string[] = [];
    if (hits.length) why.push('كلمات تتكرر في هذا النوع من القيود: ' + hits.slice(0, 5).join('، '));
    if (party && p.parties.some(x => normalize(x).includes(normalize(party)) || normalize(party).includes(normalize(x)))) { score += 0.35; why.push('الطرف «' + party + '» سُجّل بهذا الشكل من قبل'); }
    if (amount && p.count > 1 && amount >= p.min * 0.5 && amount <= p.max * 1.6) score += 0.06;
    score += Math.min(0.08, Math.log(1 + p.count) * 0.02);
    const tf = typeFit(p.debit, p.credit); score += tf; if (tf > 0) why.push('نوع المستند يوافق هذا القيد');
    if (score > 0.05) put({ sig: p.sig, label: p.label, book: p.book, debit: p.debit, credit: p.credit, score, why, src: 'history', p });
  });
  memory.examples.forEach(e => {
    const j = jaccard(words, e.tokens);
    let score = j * 1.4; const why = ['يشبه مستنداً اعتمدته بتاريخ ' + e.at.slice(0, 10)];
    if (party && e.party && normalize(e.party) === normalize(party)) { score += 0.5; why.push('نفس الطرف «' + e.party + '»'); }
    score += typeFit(e.debit, e.credit);
    if (score > 0.2) put({ sig: e.sig, label: e.label, book: e.book, debit: e.debit, credit: e.credit, score, why, src: 'memory', p: model.patterns.find(p => p.sig === e.sig) });
  });
  let ranked = [...cands.values()].sort((a, b) => b.score - a.score);
  if (doc.sig) { const forced = ranked.find(c => c.sig === doc.sig) || (() => { const p = model.patterns.find(x => x.sig === doc.sig); return p ? { sig: p.sig, label: p.label, book: p.book, debit: p.debit, credit: p.credit, score: 1, why: ['اخترت هذا النوع'], src: 'history' as const, p } : null; })(); if (forced) ranked = [{ ...forced, score: Math.max(1, forced.score), why: ['اخترت هذا النوع', ...forced.why] }, ...ranked.filter(c => c.sig !== doc.sig)]; }
  const top = ranked[0], second = ranked[1];
  const questions: Question[] = [];
  const extracted = { ...ex, amount: amount ?? null, party: party || null, vat: vatState, method };
  if (!top) {
    return { confidence: 0, sig: '', label: '', book: 'general', lines: [], where: '', steps: ['لم أجد قيداً يشبه هذا المستند في القيود التي تعلمتها — سجّله يدوياً مرة وسأتعلمه'], why: [],
      questions: [{ id: 'kind', text: 'ما نوع هذا المستند؟', options: model.patterns.slice(0, 6).map(p => ({ value: p.sig, label: p.label })) }], alternatives: [], extracted, source: 'none' };
  }
  const abs = Math.min(1, top.score / 0.7), margin = second ? (top.score - second.score) / (top.score || 1) : 1;
  let confidence = Math.round(Math.max(0, Math.min(1, abs * 0.6 + margin * 0.4)) * 100) / 100;
  if (doc.sig) confidence = Math.max(confidence, 0.8);
  if (confidence < 0.55 && ranked.length > 1 && !doc.sig) questions.push({ id: 'kind', text: 'لست متأكداً من نوع المستند — أيها أقرب؟', options: ranked.slice(0, 4).map(c => ({ value: c.sig, label: c.label })) });
  if (!amount) questions.push({ id: 'amount', text: 'ما مبلغ المستند؟' });
  const hasVat = [...top.debit, ...top.credit].some(x => /vat/.test(x.kind));
  if (hasVat && (vatState === 'unknown' || !vatState)) questions.push({ id: 'vat', text: 'هل المبلغ شامل ضريبة القيمة المضافة؟', options: [{ value: 'incl', label: 'شامل الضريبة' }, { value: 'excl', label: 'قبل الضريبة' }, { value: 'none', label: 'بدون ضريبة' }] });
  const settles = [...top.debit, ...top.credit].some(x => SETTLE.includes(x.kind));
  const kindsSeen = new Set(model.accounts.filter(a => SETTLE.includes(a.kind)).map(a => a.kind));
  if (settles && !method && kindsSeen.size > 1) questions.push({ id: 'method', text: 'كيف دُفع أو سيُدفع؟', options: [{ value: 'cash', label: 'نقداً' }, { value: 'bank', label: 'تحويل أو شيك أو بطاقة' }, { value: 'credit', label: 'آجل (على الحساب)' }] });
  const lines = amount ? buildLines(model, top.debit, top.credit, amount, hasVat ? (vatState === 'unknown' ? 'incl' : vatState) : 'none', method) : [];
  const steps: string[] = ['أرفق صورة المستند بالقيد واحفظ رقمه في المرجع'];
  if (hasVat) steps.push('تأكد أن المستند فاتورة ضريبية: الرقم الضريبي للطرف وتاريخ التوريد ومبلغ الضريبة');
  if (top.book === 'assets') steps.push('أضف الأصل إلى سجل الأصول الثابتة وحدد عمره الإنتاجي وتاريخ بدء الإهلاك');
  if ([...top.debit, ...top.credit].some(x => x.kind === 'payable')) steps.push('سجّل الاستحقاق على المورد في دفتر الموردين وتابعه للسداد في موعده');
  if ([...top.debit, ...top.credit].some(x => x.kind === 'receivable')) steps.push('أضف المبلغ لرصيد العميل وتابع التحصيل');
  const p = top.p;
  if (p && amount && p.count > 2 && amount > p.max * 1.5) steps.push('المبلغ أكبر من المعتاد لهذا النوع (أعلى ما سُجّل ' + p.max.toLocaleString('en') + ') — راجعه مع المدير المالي قبل الترحيل');
  if (p && model.recurring.some(r => r.sig === p.sig)) steps.push('هذا قيد متكرر شهرياً — تأكد أنه لم يُسجّل لنفس الشهر من قبل');
  if (confidence < 0.55) steps.push('الثقة منخفضة: أجب عن الأسئلة أو اختر النوع الصحيح قبل الاعتماد');
  const where = BOOK_AR[top.book] + (party && [...top.debit, ...top.credit].some(x => x.kind === 'payable' || x.kind === 'receivable') ? ' — وفي الحساب الفرعي للطرف «' + party + '»' : '') + (extracted.date ? ' بتاريخ ' + extracted.date : '');
  return { confidence, sig: top.sig, label: top.label, book: top.book, lines, where, steps, why: [...new Set(top.why)], questions, alternatives: ranked.slice(1, 4).map(c => ({ sig: c.sig, label: c.label, score: Math.round(c.score * 100) / 100 })), extracted, source: top.src };
}

/* ---------- remembering ---------- */
export function remember(memory: Memory, doc: Doc, s: { sig: string; label: string; book: Book; lines: SuggestedLine[] }, model: Model, at = new Date().toISOString()): Memory {
  const words = [...new Set(tokens((doc.text || '') + ' ' + (doc.party || '')))];
  const kinds = new Map(model.accounts.map(a => [a.code, a.kind]));
  const tD = s.lines.reduce((t, l) => t + l.debit, 0) || 1, tC = s.lines.reduce((t, l) => t + l.credit, 0) || 1;
  const side = (dr: boolean): SideShare[] => s.lines.filter(l => dr ? l.debit : l.credit).map(l => ({ code: l.code, name: l.name, share: (dr ? l.debit / tD : l.credit / tC), kind: kinds.get(l.code) || accountKind(l.code, l.name) }));
  const debit = side(true), credit = side(false);
  const sig = 'D:' + [...new Set(debit.map(x => x.code))].sort().join('+') + '|C:' + [...new Set(credit.map(x => x.code))].sort().join('+');
  const e: Example = { id: 'ex-' + at.replace(/\D/g, '').slice(0, 14) + '-' + memory.examples.length, at, tokens: words, party: (doc.party || '').trim(), sig, label: s.label || (debit[0]?.name + ' ← ' + credit[0]?.name),
    book: s.book || bookOf(debit, credit), debit, credit, amount: r2(tD), vat: [...debit, ...credit].some(x => /vat/.test(x.kind)) };
  const rest = memory.examples.filter(x => !(x.sig === e.sig && jaccard(x.tokens, e.tokens) > 0.9 && x.party === e.party));
  return { examples: [e, ...rest].slice(0, 500) };
}

/* ---------- a compact description for the AI (no amounts of individual entries) ---------- */
export function describe(model: Model, max = 25): string {
  const acc = model.accounts.slice(0, 80).map(a => a.code + ' ' + a.name + ' [' + a.kind + ']').join('\n');
  const pats = model.patterns.slice(0, max).map(p => '- ' + p.label + ' (' + BOOK_AR[p.book] + '): مدين ' + p.debit.map(x => x.code + ' ' + Math.round(x.share * 100) + '%').join(' + ') + ' / دائن ' + p.credit.map(x => x.code + ' ' + Math.round(x.share * 100) + '%').join(' + ') +
    ' · ' + p.count + ' مرة · كلمات: ' + Object.entries(p.tokens).sort((a, b) => b[1] - a[1]).slice(0, 6).map(x => x[0]).join('، ') + (p.vat ? ' · بضريبة' : '')).join('\n');
  return 'الفترة: ' + model.from + ' إلى ' + model.to + ' · ' + model.entries + ' قيداً\nالحسابات:\n' + acc + '\nأنماط التسجيل:\n' + pats +
    (model.recurring.length ? '\nقيود متكررة: ' + model.recurring.map(r => r.label + ' (' + r.months + ' شهراً)').join('، ') : '');
}
