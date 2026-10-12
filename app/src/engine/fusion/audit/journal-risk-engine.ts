/* 100% journal-entry risk scoring — every entry in the ledger gets a score, no sampling (ISA 240.33(a)(ii): the auditor
   «shall… select journal entries and other adjustments made at the end of a reporting period» and consider the characteristics
   of fraudulent entries: unrelated or seldom-used accounts, individuals who do not typically post, end-of-period or post-closing
   entries with little explanation, round numbers, suspense accounts, related parties). The sixteen signals below are the
   deterministic reading of those characteristics plus the classic data-analytics screens (duplicates, weekend/holiday postings,
   Benford's law). Each signal is an independent pure function over one entry and the population statistics; the score is the
   capped sum of the weights, and every label is Arabic for the screen. Reference implementations harvested (not copied):
   SEE journal-signals.ts and KOSIF audit studio engine.js. Amounts are numbers in major units, as in ledger-engine. Nothing here
   reads the clock: the period end and the posting timestamps come from the caller. The result is an indicator for the auditor's
   judgement, never a conclusion. */

export type RiskLine = { accountId: string; debit: number; credit: number; description?: string };
export type RiskEntry = {
  id: string;
  date: string;              // YYYY-MM-DD — the accounting date
  lines: RiskLine[];
  source?: string;           // «يدوي», «مبيعات», «عكس»… — missing means manual
  memo?: string;
  reference?: string;
  user?: string;             // the preparer, when the books record one
  postedAt?: string;         // ISO date or datetime the entry was written, when known
  reversalOf?: string;
  reversedBy?: string;
  manual?: boolean;          // an explicit flag beats the source text
};
export type RiskAccount = { id: string; code?: string; name?: string; type?: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense' | 'other' | string };

export type SignalCode =
  | 'UNBALANCED' | 'EMPTY_ENTRY' | 'MANUAL_ENTRY' | 'ROUND_AMOUNT' | 'LARGE_AMOUNT' | 'SUSPENSE_ACCOUNT' | 'RELATED_PARTY'
  | 'UNUSUAL_SIDE' | 'WEEKEND_POSTING' | 'HOLIDAY_POSTING' | 'PERIOD_END' | 'POSTED_AFTER_PERIOD' | 'DUPLICATE'
  | 'RARE_USER' | 'SENSITIVE_TEXT' | 'NO_MEMO' | 'REVERSAL';

export type Signal = { code: SignalCode; label_ar: string; weight: number; detail: string };
export type Band = 'low' | 'medium' | 'high';
export type EntryScore = {
  id: string; date: string; amount: number; source: string; memo: string; user: string;
  score: number; band: Band; signals: Signal[]; duplicateKey: string | null;
};

export type RiskOptions = {
  periodEnd?: string;                 // YYYY-MM-DD; enables PERIOD_END and POSTED_AFTER_PERIOD
  periodEndWindowDays?: number;       // entries dated within this many days up to the period end (default 5)
  backdateDays?: number;              // postedAt this many days after the accounting date is a late posting (default 30)
  weekendDays?: number[];             // UTC weekday numbers; default Friday+Saturday [5, 6]
  holidays?: string[];                // YYYY-MM-DD dates
  accounts?: RiskAccount[];           // names/codes/types for the account-based signals
  suspenseAccounts?: string[];        // account ids named explicitly
  suspenseTerms?: string[];
  relatedPartyAccounts?: string[];
  relatedPartyTerms?: string[];
  sensitiveTerms?: string[];
  roundUnit?: number;                 // the amount is a multiple of this (default 1000)
  roundMin?: number;                  // and at least this (default 1000)
  materiality?: number;               // enables LARGE_AMOUNT
  rareUserMaxEntries?: number;        // a preparer with this many entries or fewer is rare (default 1)
  manualSources?: string[];           // source texts that mean a manual entry (besides «يدوي»/manual)
};

/* the registry: one row per signal, the weights the auditor sees on the screen */
export const SIGNALS: Record<SignalCode, { label_ar: string; weight: number; isa: string }> = {
  UNBALANCED: { label_ar: 'قيد غير متزن', weight: 30, isa: 'ISA 240.33' },
  EMPTY_ENTRY: { label_ar: 'قيد بلا مبلغ أو بلا سطور', weight: 10, isa: 'ISA 240.33' },
  MANUAL_ENTRY: { label_ar: 'قيد يدوي', weight: 20, isa: 'ISA 240.A42' },
  ROUND_AMOUNT: { label_ar: 'مبلغ مستدير', weight: 15, isa: 'ISA 240.A43' },
  LARGE_AMOUNT: { label_ar: 'مبلغ يبلغ الأهمية النسبية', weight: 15, isa: 'ISA 320' },
  SUSPENSE_ACCOUNT: { label_ar: 'حساب وسيط أو معلّق', weight: 25, isa: 'ISA 240.A43' },
  RELATED_PARTY: { label_ar: 'طرف ذو علاقة', weight: 20, isa: 'ISA 550' },
  UNUSUAL_SIDE: { label_ar: 'حركة على الجانب غير المعتاد للحساب', weight: 15, isa: 'ISA 240.A43' },
  WEEKEND_POSTING: { label_ar: 'ترحيل في عطلة نهاية الأسبوع', weight: 10, isa: 'ISA 240.A43' },
  HOLIDAY_POSTING: { label_ar: 'ترحيل في عطلة رسمية', weight: 12, isa: 'ISA 240.A43' },
  PERIOD_END: { label_ar: 'قيد في أيام الإقفال', weight: 15, isa: 'ISA 240.33(a)(ii)' },
  POSTED_AFTER_PERIOD: { label_ar: 'مرحَّل بعد نهاية الفترة أو بأثر رجعي', weight: 20, isa: 'ISA 240.33(a)(ii)' },
  DUPLICATE: { label_ar: 'قيد مكرر (نفس المبلغ والحسابات)', weight: 20, isa: 'ISA 240.A43' },
  RARE_USER: { label_ar: 'مُعِدّ نادر الترحيل', weight: 10, isa: 'ISA 240.A43' },
  SENSITIVE_TEXT: { label_ar: 'وصف يستدعي فحصاً مهنياً', weight: 10, isa: 'ISA 240.A43' },
  NO_MEMO: { label_ar: 'بلا بيان ولا مرجع', weight: 5, isa: 'ISA 240.A43' },
  REVERSAL: { label_ar: 'قيد عكس', weight: 8, isa: 'ISA 240.A43' },
};

export const BANDS: { key: Band; label_ar: string; min: number }[] = [
  { key: 'high', label_ar: 'مرتفع', min: 60 },
  { key: 'medium', label_ar: 'متوسط', min: 30 },
  { key: 'low', label_ar: 'منخفض', min: 0 },
];
export const bandOf = (score: number): Band => (score >= 60 ? 'high' : score >= 30 ? 'medium' : 'low');

const DEFAULT_SUSPENSE = ['معلق', 'معلقه', 'تسويه', 'وسيط', 'فروقات', 'مؤقت', 'suspense', 'clearing', 'temporary'];
const DEFAULT_RELATED = ['طرف ذو علاقه', 'اطراف ذات علاقه', 'جاري الشريك', 'جاري الشركاء', 'جاري المالك', 'شركاء', 'related party', 'shareholder', 'director'];
const DEFAULT_SENSITIVE = ['تسويه', 'تجاوز', 'تعديل يدوي', 'نهايه الفتره', 'اقفال', 'override', 'adjustment', 'correction', 'plug'];
const MONEY_TOLERANCE = 0.005;
const DAY = 86_400_000;

/* Arabic-aware folding so «تسوية» and «تسويه», «أطراف» and «اطراف» compare equal */
export function normalizeText(value: unknown): string {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[ً-ْـ]/g, '')
    .replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim();
}
const hasTerm = (text: string, terms: string[]) => { const t = normalizeText(text); return !!t && terms.some((k) => t.includes(normalizeText(k))); };
const isIsoDate = (v: unknown): v is string => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v);
const dayOf = (iso: string) => String(iso).slice(0, 10);
const epoch = (iso: string) => { const t = Date.parse(dayOf(iso) + 'T00:00:00Z'); return Number.isFinite(t) ? t : NaN; };
const weekday = (iso: string) => { const t = epoch(iso); return Number.isFinite(t) ? new Date(t).getUTCDay() : -1; };
const r2 = (v: number) => Math.round((v + Number.EPSILON) * 100) / 100;
const num = (v: unknown) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };

export function entryAmount(entry: Pick<RiskEntry, 'lines'>): number {
  const lines = Array.isArray(entry.lines) ? entry.lines : [];
  const d = lines.reduce((s, l) => s + Math.abs(num(l.debit)), 0), c = lines.reduce((s, l) => s + Math.abs(num(l.credit)), 0);
  return r2(Math.max(d, c));
}
const imbalance = (lines: RiskLine[]) => r2(lines.reduce((s, l) => s + num(l.debit) - num(l.credit), 0));

const sig = (code: SignalCode, detail: string): Signal => ({ code, label_ar: SIGNALS[code].label_ar, weight: SIGNALS[code].weight, detail });

/* the population facts the per-entry signals need (users, duplicate groups) — computed once */
type Population = { userCounts: Map<string, number>; dupGroups: Map<string, string[]>; accounts: Map<string, RiskAccount> };

export function duplicateKey(entry: RiskEntry): string | null {
  const lines = Array.isArray(entry.lines) ? entry.lines : [];
  const amount = entryAmount(entry);
  if (!amount) return null;
  const ids = [...new Set(lines.map((l) => String(l.accountId || '')))].sort();
  return amount.toFixed(2) + '|' + ids.join(',');
}

function population(entries: RiskEntry[], opts: RiskOptions): Population {
  const userCounts = new Map<string, number>(), dupGroups = new Map<string, string[]>();
  for (const e of entries) {
    const u = normalizeText(e.user); if (u) userCounts.set(u, (userCounts.get(u) || 0) + 1);
    if (e.reversalOf) continue;                    // a reversal legitimately repeats its original
    const k = duplicateKey(e); if (!k) continue;
    const g = dupGroups.get(k) || []; g.push(e.id); dupGroups.set(k, g);
  }
  const accounts = new Map<string, RiskAccount>();
  for (const a of opts.accounts || []) if (a && a.id) accounts.set(String(a.id), a);
  return { userCounts, dupGroups, accounts };
}

/* ---------- the signals, one function each ---------- */
export const signalUnbalanced = (e: RiskEntry): Signal | null => {
  const lines = Array.isArray(e.lines) ? e.lines : [];
  const diff = imbalance(lines);
  return Math.abs(diff) > MONEY_TOLERANCE ? sig('UNBALANCED', 'الفرق بين المدين والدائن ' + diff.toFixed(2)) : null;
};
export const signalEmpty = (e: RiskEntry): Signal | null => {
  const lines = Array.isArray(e.lines) ? e.lines : [];
  return lines.length < 2 || entryAmount(e) === 0 ? sig('EMPTY_ENTRY', lines.length < 2 ? 'أقل من سطرين' : 'مجموع الحركة صفر') : null;
};
export const signalManual = (e: RiskEntry, opts: RiskOptions = {}): Signal | null => {
  if (e.manual === false) return null;
  const src = String(e.source || '').trim();
  const manual = e.manual === true || !src || /يدوي|manual/i.test(src) || (opts.manualSources || []).some((s) => normalizeText(s) === normalizeText(src));
  return manual ? sig('MANUAL_ENTRY', src ? 'المصدر: ' + src : 'بلا مصدر مسجَّل') : null;
};
export const signalRound = (e: RiskEntry, opts: RiskOptions = {}): Signal | null => {
  const unit = opts.roundUnit ?? 1000, min = opts.roundMin ?? 1000, a = entryAmount(e);
  if (unit <= 0 || a < min) return null;
  const cents = Math.round(a * 100), unitCents = Math.round(unit * 100);
  return cents % unitCents === 0 ? sig('ROUND_AMOUNT', 'المبلغ ' + a.toFixed(2) + ' من مضاعفات ' + unit) : null;
};
export const signalLarge = (e: RiskEntry, opts: RiskOptions = {}): Signal | null => {
  const m = opts.materiality; if (!m || m <= 0) return null;
  const a = entryAmount(e);
  return a >= m ? sig('LARGE_AMOUNT', 'المبلغ ' + a.toFixed(2) + ' ≥ الأهمية النسبية ' + m) : null;
};
function accountMatches(e: RiskEntry, pop: Pick<Population, 'accounts'>, explicit: string[], terms: string[]): string[] {
  const ex = new Set(explicit.map(String)), hits: string[] = [];
  for (const l of Array.isArray(e.lines) ? e.lines : []) {
    const id = String(l.accountId || ''), a = pop.accounts.get(id);
    const label = a ? (a.code ? a.code + ' ' : '') + (a.name || '') : id;
    if (ex.has(id) || (a && a.code && ex.has(String(a.code))) || hasTerm(a ? a.name || '' : '', terms)) hits.push(label.trim() || id);
  }
  return [...new Set(hits)];
}
export const signalSuspense = (e: RiskEntry, opts: RiskOptions = {}, pop?: Pick<Population, 'accounts'>): Signal | null => {
  const p = pop || population([], opts);
  const hits = accountMatches(e, p, opts.suspenseAccounts || [], opts.suspenseTerms || DEFAULT_SUSPENSE);
  return hits.length ? sig('SUSPENSE_ACCOUNT', hits.join('، ')) : null;
};
export const signalRelatedParty = (e: RiskEntry, opts: RiskOptions = {}, pop?: Pick<Population, 'accounts'>): Signal | null => {
  const p = pop || population([], opts), terms = opts.relatedPartyTerms || DEFAULT_RELATED;
  const hits = accountMatches(e, p, opts.relatedPartyAccounts || [], terms);
  if (hasTerm(e.memo || '', terms)) hits.push('البيان');
  return hits.length ? sig('RELATED_PARTY', [...new Set(hits)].join('، ')) : null;
};
export const signalUnusualSide = (e: RiskEntry, opts: RiskOptions = {}, pop?: Pick<Population, 'accounts'>): Signal | null => {
  if (e.reversalOf) return null;                 // a reversal moves every account on its unusual side by design
  const p = pop || population([], opts), hits: string[] = [];
  for (const l of Array.isArray(e.lines) ? e.lines : []) {
    const a = p.accounts.get(String(l.accountId || '')); if (!a || !a.type) continue;
    if (a.type === 'revenue' && num(l.debit) > 0) hits.push('مدين على إيراد ' + (a.name || a.code || a.id));
    if (a.type === 'expense' && num(l.credit) > 0) hits.push('دائن على مصروف ' + (a.name || a.code || a.id));
  }
  return hits.length ? sig('UNUSUAL_SIDE', hits.join('، ')) : null;
};
export const signalWeekend = (e: RiskEntry, opts: RiskOptions = {}): Signal | null => {
  if (!isIsoDate(e.date)) return null;
  const days = opts.weekendDays ?? [5, 6], d = weekday(e.date);
  return d >= 0 && days.includes(d) ? sig('WEEKEND_POSTING', 'تاريخ القيد ' + dayOf(e.date) + ' يوم ' + ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'][d]) : null;
};
export const signalHoliday = (e: RiskEntry, opts: RiskOptions = {}): Signal | null => {
  if (!isIsoDate(e.date) || !opts.holidays || !opts.holidays.length) return null;
  return opts.holidays.map(dayOf).includes(dayOf(e.date)) ? sig('HOLIDAY_POSTING', 'تاريخ القيد ' + dayOf(e.date) + ' عطلة رسمية') : null;
};
export const signalPeriodEnd = (e: RiskEntry, opts: RiskOptions = {}): Signal | null => {
  if (!isIsoDate(e.date) || !isIsoDate(opts.periodEnd)) return null;
  const gap = Math.round((epoch(opts.periodEnd) - epoch(e.date)) / DAY), win = Math.max(0, opts.periodEndWindowDays ?? 5);
  return gap >= 0 && gap <= win ? sig('PERIOD_END', gap === 0 ? 'بتاريخ نهاية الفترة ' + dayOf(opts.periodEnd) : 'قبل نهاية الفترة بـ' + gap + ' يوم') : null;
};
export const signalPostedAfter = (e: RiskEntry, opts: RiskOptions = {}): Signal | null => {
  if (!isIsoDate(e.date) || !isIsoDate(e.postedAt)) return null;
  const posted = dayOf(e.postedAt), lag = Math.round((epoch(posted) - epoch(e.date)) / DAY);
  if (isIsoDate(opts.periodEnd) && dayOf(e.date) <= dayOf(opts.periodEnd) && posted > dayOf(opts.periodEnd))
    return sig('POSTED_AFTER_PERIOD', 'مؤرَّخ ' + dayOf(e.date) + ' ورُحِّل ' + posted + ' بعد نهاية الفترة');
  const back = Math.max(0, opts.backdateDays ?? 30);
  return lag > back ? sig('POSTED_AFTER_PERIOD', 'رُحِّل بعد تاريخه بـ' + lag + ' يوماً') : null;
};
export const signalDuplicate = (e: RiskEntry, pop: Pick<Population, 'dupGroups'>): Signal | null => {
  if (e.reversalOf) return null;
  const k = duplicateKey(e); if (!k) return null;
  const g = pop.dupGroups.get(k) || [];
  if (g.length < 2) return null;
  return sig('DUPLICATE', 'نفس المبلغ والحسابات في: ' + g.filter((id) => id !== e.id).join('، '));
};
export const signalRareUser = (e: RiskEntry, opts: RiskOptions, pop: Pick<Population, 'userCounts'>): Signal | null => {
  const u = normalizeText(e.user); if (!u) return null;
  const max = Math.max(0, opts.rareUserMaxEntries ?? 1), total = [...pop.userCounts.values()].reduce((s, n) => s + n, 0), mine = pop.userCounts.get(u) || 0;
  return mine <= max && total > max + 1 ? sig('RARE_USER', String(e.user) + ' رحّل ' + mine + ' من ' + total) : null;
};
export const signalSensitive = (e: RiskEntry, opts: RiskOptions = {}): Signal | null => {
  const terms = opts.sensitiveTerms || DEFAULT_SENSITIVE, text = [e.memo, ...(Array.isArray(e.lines) ? e.lines.map((l) => l.description) : [])].filter(Boolean).join(' ');
  const hit = terms.find((t) => hasTerm(text, [t]));
  return hit ? sig('SENSITIVE_TEXT', 'ورد في البيان: «' + hit + '»') : null;
};
export const signalNoMemo = (e: RiskEntry): Signal | null => (!String(e.memo || '').trim() && !String(e.reference || '').trim() ? sig('NO_MEMO', 'لا بيان ولا مرجع') : null);
export const signalReversal = (e: RiskEntry): Signal | null => (e.reversalOf ? sig('REVERSAL', 'يعكس القيد ' + e.reversalOf) : null);

/* ---------- the score of one entry ---------- */
export function scoreEntry(e: RiskEntry, opts: RiskOptions, pop: Population): EntryScore {
  const signals = [
    signalUnbalanced(e), signalEmpty(e), signalManual(e, opts), signalRound(e, opts), signalLarge(e, opts),
    signalSuspense(e, opts, pop), signalRelatedParty(e, opts, pop), signalUnusualSide(e, opts, pop),
    signalWeekend(e, opts), signalHoliday(e, opts), signalPeriodEnd(e, opts), signalPostedAfter(e, opts),
    signalDuplicate(e, pop), signalRareUser(e, opts, pop), signalSensitive(e, opts), signalNoMemo(e), signalReversal(e),
  ].filter((s): s is Signal => s !== null);
  const score = Math.min(100, signals.reduce((s, x) => s + x.weight, 0));
  return { id: String(e.id), date: isIsoDate(e.date) ? dayOf(e.date) : String(e.date || ''), amount: entryAmount(e), source: String(e.source || ''), memo: String(e.memo || ''), user: String(e.user || ''),
    score, band: bandOf(score), signals, duplicateKey: e.reversalOf ? null : duplicateKey(e) };
}

/* every entry, highest risk first; ties by id so the order never depends on input order */
export function scoreEntries(entries: RiskEntry[], opts: RiskOptions = {}): EntryScore[] {
  const list = (Array.isArray(entries) ? entries : []).filter((e) => e && e.id != null);
  const pop = population(list, opts);
  return list.map((e) => scoreEntry(e, opts, pop)).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}

/* ---------- Benford's law on the first digit of the amounts ---------- */
export const BENFORD_EXPECTED = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => Math.log10(1 + 1 / d));
export type BenfordDigit = { digit: number; count: number; observed: number; expected: number; deviation: number };
export type Benford = { n: number; sufficient: boolean; digits: BenfordDigit[]; mad: number; conformity: 'insufficient' | 'close' | 'acceptable' | 'marginal' | 'nonconforming' };
export const firstDigit = (amount: number): number => {
  const a = Math.abs(Number(amount)); if (!Number.isFinite(a) || a < 10) return 0;   // below 10 the first digit says little
  return Number(String(Math.floor(a))[0]);
};
export function benford(amounts: number[], minSample = 50): Benford {
  const counts = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (const a of amounts) { const d = firstDigit(a); if (d >= 1) counts[d - 1] += 1; }
  const n = counts.reduce((s, c) => s + c, 0);
  const digits = counts.map((count, i) => { const observed = n ? count / n : 0, expected = BENFORD_EXPECTED[i]; return { digit: i + 1, count, observed, expected, deviation: observed - expected }; });
  const mad = n ? digits.reduce((s, d) => s + Math.abs(d.deviation), 0) / 9 : 0;
  /* Nigrini's first-digit thresholds */
  const conformity: Benford['conformity'] = n < minSample ? 'insufficient' : mad < 0.006 ? 'close' : mad < 0.012 ? 'acceptable' : mad < 0.015 ? 'marginal' : 'nonconforming';
  return { n, sufficient: n >= minSample, digits, mad, conformity };
}
export const BENFORD_AR: Record<Benford['conformity'], string> = {
  insufficient: 'العينة أصغر من أن تُقرأ', close: 'مطابقة قريبة', acceptable: 'مطابقة مقبولة', marginal: 'مطابقة هامشية', nonconforming: 'انحراف عن التوزيع المتوقع',
};

/* ---------- the summary the screen opens with ---------- */
export type Summary = {
  total: number; scored: number; averageScore: number;
  distribution: Record<Band, number>;
  top: EntryScore[];
  bySignal: { code: SignalCode; label_ar: string; count: number; amount: number }[];
  duplicateGroups: { key: string; ids: string[]; amount: number; count: number }[];
  counts: { suspense: number; round: number; weekend: number; holiday: number; manual: number; duplicates: number; unbalanced: number; afterPeriod: number; periodEnd: number; relatedParty: number };
  benford: Benford;
};
export function summarize(scores: EntryScore[], opts: { top?: number; benfordMinSample?: number } = {}): Summary {
  const list = Array.isArray(scores) ? scores : [];
  const distribution: Record<Band, number> = { low: 0, medium: 0, high: 0 };
  const by = new Map<SignalCode, { count: number; amount: number }>();
  const groups = new Map<string, { ids: string[]; amount: number }>();
  let totalScore = 0;
  for (const s of list) {
    distribution[s.band] += 1; totalScore += s.score;
    const seen = new Set<SignalCode>();
    for (const x of s.signals) { if (seen.has(x.code)) continue; seen.add(x.code); const r = by.get(x.code) || { count: 0, amount: 0 }; r.count += 1; r.amount = r2(r.amount + s.amount); by.set(x.code, r); }
    if (s.duplicateKey) { const g = groups.get(s.duplicateKey) || { ids: [], amount: s.amount }; g.ids.push(s.id); groups.set(s.duplicateKey, g); }
  }
  const has = (c: SignalCode) => (by.get(c) || { count: 0 }).count;
  const sorted = list.slice().sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  return {
    total: list.length, scored: list.filter((s) => s.signals.length).length, averageScore: list.length ? Math.round((totalScore / list.length) * 10) / 10 : 0,
    distribution,
    top: sorted.slice(0, Math.max(0, opts.top ?? 20)),
    bySignal: [...by.entries()].map(([code, r]) => ({ code, label_ar: SIGNALS[code].label_ar, count: r.count, amount: r.amount })).sort((a, b) => b.count - a.count || a.code.localeCompare(b.code)),
    duplicateGroups: [...groups.entries()].filter(([, g]) => g.ids.length > 1).map(([key, g]) => ({ key, ids: g.ids.slice().sort(), amount: g.amount, count: g.ids.length })).sort((a, b) => b.amount - a.amount || a.key.localeCompare(b.key)),
    counts: { suspense: has('SUSPENSE_ACCOUNT'), round: has('ROUND_AMOUNT'), weekend: has('WEEKEND_POSTING'), holiday: has('HOLIDAY_POSTING'), manual: has('MANUAL_ENTRY'), duplicates: has('DUPLICATE'),
      unbalanced: has('UNBALANCED'), afterPeriod: has('POSTED_AFTER_PERIOD'), periodEnd: has('PERIOD_END'), relatedParty: has('RELATED_PARTY') },
    benford: benford(list.map((s) => s.amount), opts.benfordMinSample ?? 50),
  };
}
