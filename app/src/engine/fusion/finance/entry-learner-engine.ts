/* The entry simulator's memory — how this business records its entries, learnt from its own journal.
   learn() reads journal rows (date, entry number, account, debit, credit, description), groups them into entries and
   folds each entry into a pattern: the same accounts on the same sides are one pattern, whose words are the words of
   its descriptions and whose legs carry each account's usual share of the entry (and the VAT rate when one leg is VAT).
   learnReport() keeps the sentences of a finance manager's report that say how something is recorded, with the
   accounts they name. suggest() reads a document's text and amount, scores every pattern by the document's
   distinctive words (rare words weigh more), and builds the balanced entry and the book to record it in. When the
   best pattern is not clearly ahead, or the words barely match, it says so and asks, offering the candidates;
   teach() records the answer as a rule, so the same kind of document is recognised next time. Everything is plain
   JSON, kept per company by the screen. */

export type JeRow = { date?: string; ref?: string; account: string; name?: string; debit?: number; credit?: number; memo?: string };
export type Line = { account: string; name: string; debit: number; credit: number };
export type Entry = { ref: string; date: string; memo: string; lines: Line[] };
export type Leg = { account: string; name: string; side: 'D' | 'C'; share: number; vat?: boolean };
export type Pattern = {
  id: string; title: string; journal: string; legs: Leg[]; words: Record<string, number>; count: number; confirmed: number;
  samples: string[]; vatRate?: number; from?: string; to?: string; source: 'journal' | 'user';
};
export type Rule = { id: string; words: string[]; patternId: string; at: string; example: string };
export type Note = { id: string; text: string; source: string; accounts: string[]; words: string[]; at: string };
export type Memory = {
  v: 1; accounts: Record<string, { name: string; d: number; c: number }>; patterns: Pattern[]; rules: Rule[]; notes: Note[];
  stats: { entries: number; lines: number; from: string; to: string; files: string[] }; log: { at: string; what: string }[];
};
export type Doc = { text: string; amount: number; date?: string; vatIncluded?: boolean };
export type Suggestion = {
  status: 'sure' | 'unsure' | 'unknown'; confidence: number; patternId: string | null; title: string; journal: string; lines: Line[];
  balanced: boolean; reasons: string[]; alternatives: { patternId: string; title: string; score: number }[]; question: string | null;
};

export const emptyMemory = (): Memory => ({ v: 1, accounts: {}, patterns: [], rules: [], notes: [], stats: { entries: 0, lines: 0, from: '', to: '', files: [] }, log: [] });
const r2 = (x: number) => Math.round((x + Number.EPSILON) * 100) / 100;
const now = () => new Date().toISOString();

/* ---------- words ---------- */
const STOP = new Set(['من', 'الى', 'علي', 'في', 'عن', 'مع', 'او', 'و', 'ثم', 'رقم', 'بتاريخ', 'تاريخ', 'قيد', 'قيمه', 'مبلغ', 'عدد', 'شهر', 'سند', 'فاتوره', 'لشهر', 'عن', 'هذا', 'هذه', 'الي', 'بقيمه', 'بمبلغ', 'ريال', 'رس', 'sar', 'the', 'of', 'to', 'for', 'and', 'no', 'inv', 'ref']);
export function tokens(text: string): string[] {
  const n = String(text || '').toLowerCase().replace(/[ً-ٰٟ]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/ـ/g, '')
    .replace(/[^\p{L}\s]/gu, ' ');
  const out: string[] = [];
  for (let w of n.split(/\s+/)) {
    if (!w) continue;
    if (/^(وال|بال|لل|فال|كال)/.test(w) && w.length > 5) w = w.replace(/^(وال|بال|فال|كال)/, '').replace(/^لل/, '');
    else if (w.startsWith('ال') && w.length > 4) w = w.slice(2);
    if (w.length < 2 || STOP.has(w)) continue;
    out.push(w);
  }
  return out;
}

/* ---------- reading the journal ---------- */
/** Journal rows grouped into entries: by entry number, or — when a file carries none — by date and description.
 *  Rows without a number continue the entry above them (files that print the number once per entry). */
export function groupEntries(rows: JeRow[]): Entry[] {
  const map = new Map<string, Entry>(); let last = '';
  for (const r of rows) {
    const acc = String(r.account ?? '').trim(); if (!acc) continue;
    const debit = Math.abs(Number(r.debit) || 0), credit = Math.abs(Number(r.credit) || 0); if (!debit && !credit) continue;
    let key = String(r.ref ?? '').trim();
    if (!key) key = last && !String(r.date ?? '').trim() && !String(r.memo ?? '').trim() ? last : (String(r.date ?? '') + '|' + String(r.memo ?? '').trim());
    last = key;
    const e = map.get(key) ?? { ref: key, date: String(r.date ?? '').slice(0, 10), memo: '', lines: [] };
    if (!e.date && r.date) e.date = String(r.date).slice(0, 10);
    if (r.memo && !e.memo.includes(String(r.memo).trim())) e.memo = (e.memo ? e.memo + ' — ' : '') + String(r.memo).trim();
    e.lines.push({ account: acc, name: String(r.name ?? '').trim(), debit, credit });
    map.set(key, e);
  }
  return [...map.values()];
}
const VAT_RE = /ضريب|قيمه مضافه|القيمة المضافة|vat/i;
const CASH_RE = /نقد|صندوق|خزين|بنك|مصرف|راجحي|اهلي|الأهلي|انماء|cash|bank/i;
const SALES_RE = /مبيعات|ايراد|إيراد|revenue|sales/i;
const AP_RE = /مورد|دائن|ذمم دائن|payable|supplier/i;
const AR_RE = /عميل|عملاء|مدين|ذمم مدين|receivable|customer/i;
const STOCK_RE = /مخزون|مشتريات|بضاع|inventory|purchase/i;
const PAY_RE = /رواتب|اجور|أجور|salar|payroll/i;
const FA_RE = /اصول ثابت|أصول ثابت|آلات|معدات|سيارات|اثاث|أثاث|fixed asset|equipment/i;

/** The book a pattern is recorded in and the voucher that carries it, from the accounts on each side. */
export function journalOf(legs: Leg[]): string {
  const has = (re: RegExp, side?: 'D' | 'C') => legs.some((l) => (!side || l.side === side) && re.test(l.name + ' ' + l.account));
  if (has(PAY_RE, 'D')) return 'يومية الرواتب — مسير الرواتب';
  if (has(SALES_RE, 'C')) return has(CASH_RE, 'D') ? 'يومية المبيعات — فاتورة بيع نقدي / سند قبض' : 'يومية المبيعات — فاتورة بيع آجل';
  if (has(CASH_RE, 'D') && has(AR_RE, 'C')) return 'يومية المقبوضات — سند قبض من عميل';
  if (has(CASH_RE, 'C') && has(AP_RE, 'D')) return 'يومية المدفوعات — سند صرف لمورد';
  if (has(AP_RE, 'C') && (has(STOCK_RE, 'D') || has(VAT_RE, 'D'))) return 'يومية المشتريات — فاتورة مورد';
  if (has(FA_RE, 'D')) return 'اليومية العامة — إضافة أصل ثابت';
  if (has(CASH_RE, 'C')) return 'يومية المدفوعات — سند صرف';
  if (has(CASH_RE, 'D')) return 'يومية المقبوضات — سند قبض';
  return 'اليومية العامة — قيد يومية';
}
/** An entry's shape: each account, its side and its share of the entry's side total; VAT legs marked with their rate. */
export function shapeOf(e: Entry): { key: string; legs: Leg[]; vatRate?: number } {
  const by = new Map<string, { account: string; name: string; d: number; c: number }>();
  for (const l of e.lines) { const x = by.get(l.account) ?? { account: l.account, name: l.name, d: 0, c: 0 }; x.d += l.debit; x.c += l.credit; if (!x.name && l.name) x.name = l.name; by.set(l.account, x); }
  const legs: Leg[] = [];
  for (const x of by.values()) { const net = x.d - x.c; if (Math.abs(net) < 0.005) continue; legs.push({ account: x.account, name: x.name, side: net > 0 ? 'D' : 'C', share: Math.abs(net), vat: VAT_RE.test(x.name + ' ' + x.account) || undefined }); }
  const tot = { D: 0, C: 0 }; legs.forEach((l) => { tot[l.side] += l.share; });
  let vatRate: number | undefined;
  for (const side of ['D', 'C'] as const) {
    const vat = legs.filter((l) => l.side === side && l.vat).reduce((s, l) => s + l.share, 0), net = tot[side] - vat;
    if (vat > 0 && net > 0) vatRate = Math.round((vat / net) * 1000) / 1000;
  }
  legs.forEach((l) => { l.share = tot[l.side] ? Math.round((l.share / tot[l.side]) * 10000) / 10000 : 0; });
  legs.sort((a, b) => (a.side === b.side ? a.account.localeCompare(b.account) : a.side === 'D' ? -1 : 1));
  return { key: legs.map((l) => l.side + ':' + l.account).join('|'), legs, vatRate };
}
const keyOf = (p: Pattern) => p.legs.map((l) => l.side + ':' + l.account).join('|');
const bump = (w: Record<string, number>, list: string[], by = 1) => { for (const t of list) w[t] = (w[t] ?? 0) + by; };

/** Folds a journal (rows as read from a file) into the memory. Returns what was learnt. */
export function learn(mem: Memory, rows: JeRow[], file = 'ملف قيود'): { entries: number; newPatterns: number; accounts: number; skipped: number } {
  const entries = groupEntries(rows); let fresh = 0, skipped = 0;
  const byKey = new Map(mem.patterns.map((p) => [keyOf(p), p]));
  for (const e of entries) {
    for (const l of e.lines) { const a = mem.accounts[l.account] ?? { name: l.name, d: 0, c: 0 }; if (l.name) a.name = l.name; a.d += l.debit; a.c += l.credit; mem.accounts[l.account] = a; }
    const d = e.lines.reduce((s, l) => s + l.debit, 0), c = e.lines.reduce((s, l) => s + l.credit, 0);
    if (Math.abs(d - c) > 0.01 || e.lines.length < 2) { skipped++; continue; }
    const s = shapeOf(e); if (s.legs.length < 2) { skipped++; continue; }
    s.legs.forEach((l) => { if (!l.name) l.name = mem.accounts[l.account]?.name ?? ''; });
    let p = byKey.get(s.key);
    if (!p) {
      p = { id: 'p' + (mem.patterns.length + 1) + '-' + s.key.length, title: e.memo.slice(0, 70) || s.legs.map((l) => l.name || l.account).join(' / '), journal: journalOf(s.legs), legs: s.legs, words: {}, count: 0, confirmed: 0, samples: [], source: 'journal' };
      mem.patterns.push(p); byKey.set(s.key, p); fresh++;
    } else {
      /* a running mean of the shares keeps the usual split of a recurring entry */
      p.legs.forEach((l) => { const n = s.legs.find((x) => x.side === l.side && x.account === l.account); if (n) l.share = Math.round(((l.share * p!.count + n.share) / (p!.count + 1)) * 10000) / 10000; });
    }
    p.count++;
    if (s.vatRate) p.vatRate = p.vatRate ? Math.round(((p.vatRate * (p.count - 1) + s.vatRate) / p.count) * 1000) / 1000 : s.vatRate;
    bump(p.words, [...new Set(tokens(e.memo))]);
    if (e.memo && p.samples.length < 4 && !p.samples.includes(e.memo)) p.samples.push(e.memo.slice(0, 140));
    if (e.date) { if (!p.from || e.date < p.from) p.from = e.date; if (!p.to || e.date > p.to) p.to = e.date; }
    if (e.date) { if (!mem.stats.from || e.date < mem.stats.from) mem.stats.from = e.date; if (!mem.stats.to || e.date > mem.stats.to) mem.stats.to = e.date; }
  }
  mem.stats.entries += entries.length - skipped; mem.stats.lines += entries.reduce((s, e) => s + e.lines.length, 0);
  if (!mem.stats.files.includes(file)) mem.stats.files.push(file);
  mem.log.unshift({ at: now(), what: 'تعلّم من «' + file + '»: ' + (entries.length - skipped) + ' قيداً، ' + fresh + ' نمطاً جديداً' + (skipped ? '، ' + skipped + ' قيداً غير متزن تُرك' : '') });
  mem.log = mem.log.slice(0, 60);
  return { entries: entries.length - skipped, newPatterns: fresh, accounts: Object.keys(mem.accounts).length, skipped };
}

/* ---------- a finance manager's report ---------- */
const POLICY_RE = /يسجل|تسجل|يُسجل|تُسجل|يقيد|تقيد|يُقيد|قيد|يحمل|تحمل|يُحمل|يرحل|ترحل|تثبت|يثبت|يعالج|تعالج|يستهلك|تستهلك|يخصص|مخصص|تُرسمل|يرسمل|recorded|recognis|recogniz|charged|capitali[sz]|accrued|posted/i;
/** Keeps the sentences of a report that say how something is recorded, with the known accounts they name. */
export function learnReport(mem: Memory, text: string, source = 'تقرير'): { notes: number } {
  const names = Object.entries(mem.accounts).filter(([, a]) => a.name && a.name.length > 2);
  let n = 0;
  for (const raw of String(text || '').split(/(?<=[.!؟?\n])\s+|\n+/)) {
    const s = raw.replace(/\s+/g, ' ').trim(); if (s.length < 12 || s.length > 400 || !POLICY_RE.test(s)) continue;
    const accounts = names.filter(([code, a]) => s.includes(a.name) || new RegExp('(^|\\D)' + code + '(\\D|$)').test(s)).map(([code]) => code);
    if (mem.notes.some((x) => x.text === s)) continue;
    mem.notes.push({ id: 'n' + (mem.notes.length + 1) + '-' + s.length, text: s, source, accounts, words: [...new Set(tokens(s))], at: now() }); n++;
  }
  mem.log.unshift({ at: now(), what: 'قرأ «' + source + '»: ' + n + ' ملاحظة عن طريقة التسجيل' }); mem.log = mem.log.slice(0, 60);
  return { notes: n };
}

/* ---------- suggesting ---------- */
function idf(mem: Memory) {
  const df = new Map<string, number>(); for (const p of mem.patterns) for (const w of Object.keys(p.words)) df.set(w, (df.get(w) ?? 0) + 1);
  const N = Math.max(mem.patterns.length, 1); return (w: string) => Math.log(1 + N / (df.get(w) ?? 0.5));
}
/** The entry's lines for an amount: VAT split out at the pattern's rate, each side shared as usual, rounded and balanced. */
export function linesFor(p: Pattern, amount: number, vatIncluded = true): Line[] {
  const A = Math.abs(Number(amount) || 0), rate = p.vatRate ?? 0;
  const sideTotal = (side: 'D' | 'C') => {
    const hasVat = p.legs.some((l) => l.side === side && l.vat);
    return { total: rate && !vatIncluded ? A * (1 + rate) : A, net: rate && hasVat ? (vatIncluded ? A / (1 + rate) : A) : null };
  };
  const out: Line[] = [];
  for (const side of ['D', 'C'] as const) {
    const legs = p.legs.filter((l) => l.side === side); if (!legs.length) continue;
    const { total, net } = sideTotal(side);
    const nonVat = legs.filter((l) => !l.vat), nonShare = nonVat.reduce((s, l) => s + l.share, 0) || 1;
    const amounts = legs.map((l) => net == null ? total * l.share : l.vat ? (total - net) * (l.share / (legs.filter((x) => x.vat).reduce((s, x) => s + x.share, 0) || 1)) : net * (l.share / nonShare));
    const rounded = amounts.map(r2), diff = r2(r2(total) - rounded.reduce((s, x) => s + x, 0));
    if (diff) { const i = rounded.indexOf(Math.max(...rounded)); rounded[i] = r2(rounded[i] + diff); }
    legs.forEach((l, i) => out.push({ account: l.account, name: l.name, debit: side === 'D' ? rounded[i] : 0, credit: side === 'C' ? rounded[i] : 0 }));
  }
  return out;
}
export const isBalanced = (lines: Line[]) => lines.length >= 2 && Math.abs(lines.reduce((s, l) => s + l.debit - l.credit, 0)) < 0.005 && lines.some((l) => l.debit > 0);

/** The suggested entry for a document, how sure the memory is, and — when unsure — the question to ask. */
export function suggest(mem: Memory, doc: Doc, opts: { sureAt?: number } = {}): Suggestion {
  const sureAt = opts.sureAt ?? 0.6, words = [...new Set(tokens(doc.text))], W = idf(mem);
  const none: Suggestion = { status: 'unknown', confidence: 0, patternId: null, title: '', journal: '', lines: [], balanced: false, reasons: [], alternatives: [], question: null };
  if (!mem.patterns.length) return { ...none, reasons: ['الذاكرة فارغة — ارفع قيود فترة سابقة أولاً ليتعلم المحاكي طريقة التسجيل'], question: 'لم أتعلم بعد طريقة التسجيل في هذه الشركة. ارفع قيود فترة سابقة، أو حدّد القيد بنفسك وسأحفظه.' };
  const docWeight = words.reduce((s, w) => s + W(w), 0) || 1;
  const maxCount = Math.max(...mem.patterns.map((p) => p.count + p.confirmed), 1);
  const scored = mem.patterns.map((p) => {
    const hit = words.filter((w) => p.words[w]); let s = hit.reduce((a, w) => a + W(w) * (1 + Math.log(p.words[w])), 0) / docWeight;
    const rules = mem.rules.filter((r) => r.patternId === p.id && r.words.length && r.words.every((w) => words.includes(w)));
    if (rules.length) s += 2;
    const notes = mem.notes.filter((n) => n.accounts.some((a) => p.legs.some((l) => l.account === a)) && n.words.filter((w) => words.includes(w)).length >= 2);
    if (notes.length) s += 0.25;
    s += 0.05 * ((p.count + p.confirmed) / maxCount);
    return { p, s, hit, rules, notes, coverage: hit.reduce((a, w) => a + W(w), 0) / docWeight };
  }).sort((a, b) => b.s - a.s);
  const top = scored[0], second = scored[1];
  if (!top || (!top.hit.length && !top.rules.length)) {
    return { ...none, alternatives: scored.slice(0, 3).map((x) => ({ patternId: x.p.id, title: x.p.title, score: Math.round(x.s * 100) / 100 })),
      reasons: ['لا تطابق كلمات المستند أي نمط في الذاكرة'], question: 'لم أجد قيداً مشابهاً في قيود الشركة. ما نوع هذا المستند؟ اختر من الأنماط أو حدّد الحسابات بنفسك.' };
  }
  const margin = second ? (top.s - second.s) / (top.s || 1) : 1;
  /* how much of the document the pattern explains, discounted when another pattern explains it almost as well */
  let confidence = Math.min(1, top.coverage * 1.25) * (0.5 + 0.5 * margin);
  if (top.rules.length) confidence = Math.max(confidence, 0.92);
  confidence = Math.round(confidence * 100) / 100;
  const lines = linesFor(top.p, doc.amount, doc.vatIncluded !== false);
  const reasons = [
    top.rules.length ? 'قاعدة علّمتها للمحاكي: «' + top.rules[0].example.slice(0, 60) + '»' : '',
    top.hit.length ? 'كلمات مطابقة: ' + top.hit.slice(0, 6).join('، ') : '',
    'تكرر هذا القيد ' + top.p.count + ' مرة في القيود المرفوعة' + (top.p.confirmed ? ' وأكدته ' + top.p.confirmed + ' مرة' : ''),
    top.p.vatRate ? 'فُصلت ضريبة القيمة المضافة بنسبة ' + Math.round(top.p.vatRate * 1000) / 10 + '٪ كما في القيود السابقة' : '',
    ...top.notes.slice(0, 2).map((n) => 'من «' + n.source + '»: ' + n.text.slice(0, 90)),
  ].filter(Boolean);
  const status = confidence >= sureAt ? 'sure' : 'unsure';
  const alts = scored.slice(0, 4).filter((x) => x.s > 0).map((x) => ({ patternId: x.p.id, title: x.p.title, score: Math.round(x.s * 100) / 100 }));
  return {
    status, confidence, patternId: top.p.id, title: top.p.title, journal: top.p.journal, lines, balanced: isBalanced(lines), reasons, alternatives: alts,
    question: status === 'sure' ? null : 'لست متأكداً: هذا المستند يشبه «' + top.p.title + '»' + (second && second.s > 0 ? ' ويشبه أيضاً «' + second.p.title + '»' : '') + '. أيهما الصحيح؟ جوابك يُحفظ في الذاكرة.',
  };
}

/** Records the right answer for a document: a rule on its distinctive words, and the words on the pattern. */
export function teach(mem: Memory, doc: Doc, answer: { patternId: string } | { legs: Leg[]; title: string; vatRate?: number }): Pattern {
  let p: Pattern | undefined;
  if ('patternId' in answer) p = mem.patterns.find((x) => x.id === answer.patternId);
  else {
    const legs = answer.legs.map((l) => ({ ...l })), key = legs.map((l) => l.side + ':' + l.account).sort().join('|');
    p = mem.patterns.find((x) => keyOf(x).split('|').sort().join('|') === key);
    if (!p) { p = { id: 'u' + (mem.patterns.length + 1) + '-' + key.length, title: answer.title || doc.text.slice(0, 60), journal: journalOf(legs), legs, words: {}, count: 0, confirmed: 0, samples: [], vatRate: answer.vatRate, source: 'user' }; mem.patterns.push(p); }
    legs.forEach((l) => { if (!mem.accounts[l.account]) mem.accounts[l.account] = { name: l.name, d: 0, c: 0 }; });
  }
  if (!p) throw new Error('PATTERN_NOT_FOUND');
  const W = idf(mem), words = [...new Set(tokens(doc.text))];
  bump(p.words, words, 2); p.confirmed++;
  if (doc.text && p.samples.length < 6 && !p.samples.includes(doc.text.slice(0, 140))) p.samples.push(doc.text.slice(0, 140));
  const key = words.sort((a, b) => W(b) - W(a)).slice(0, 3);
  if (key.length) {
    mem.rules = mem.rules.filter((r) => r.words.join(' ') !== key.join(' '));
    mem.rules.push({ id: 'r' + (mem.rules.length + 1) + '-' + key.join('').length, words: key, patternId: p.id, at: now(), example: doc.text.slice(0, 120) });
  }
  mem.log.unshift({ at: now(), what: 'تعلّم من جوابك: «' + doc.text.slice(0, 50) + '» ← ' + p.title }); mem.log = mem.log.slice(0, 60);
  return p;
}
export function forget(mem: Memory, id: string): boolean {
  const n = mem.patterns.length + mem.rules.length + mem.notes.length;
  mem.patterns = mem.patterns.filter((p) => p.id !== id); mem.rules = mem.rules.filter((r) => r.id !== id && r.patternId !== id); mem.notes = mem.notes.filter((x) => x.id !== id);
  return mem.patterns.length + mem.rules.length + mem.notes.length < n;
}

/* ---------- the AI's view of the memory ---------- */
/** A compact text of what the memory knows, for the AI's instructions (accounts, patterns with their words, rules, notes). */
export function memoryText(mem: Memory, limit = 30): string {
  const acc = Object.entries(mem.accounts).slice(0, 120).map(([c, a]) => c + ' ' + a.name).join('؛ ');
  const pats = [...mem.patterns].sort((a, b) => b.count + b.confirmed - (a.count + a.confirmed)).slice(0, limit).map((p) => '[' + p.id + '] ' + p.title + ' (' + p.count + ' مرة، ' + p.journal + ')' +
    ': ' + p.legs.map((l) => (l.side === 'D' ? 'من ' : 'إلى ') + l.account + ' ' + l.name + ' ' + Math.round(l.share * 100) + '٪').join('، ') + (p.vatRate ? '، ض.ق.م ' + Math.round(p.vatRate * 100) + '٪' : '') +
    ' — كلمات: ' + Object.entries(p.words).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([w]) => w).join(' '));
  return 'دليل الحسابات: ' + acc + '\n\nأنماط القيود المتعلمة:\n' + pats.join('\n') +
    (mem.rules.length ? '\n\nقواعد علمها المحاسب:\n' + mem.rules.slice(-20).map((r) => '«' + r.example.slice(0, 60) + '» ← [' + r.patternId + ']').join('\n') : '') +
    (mem.notes.length ? '\n\nمن تقارير المدير المالي:\n' + mem.notes.slice(-15).map((n) => '• ' + n.text.slice(0, 200)).join('\n') : '');
}
const S = (description?: string) => ({ type: 'STRING', ...(description ? { description } : {}) });
const OBJ = (properties: Record<string, object>, required: string[]) => ({ type: 'OBJECT', properties, required });
export const AI_SCHEMA = OBJ({
  patternId: S('معرّف النمط من الذاكرة إن طابق، أو فارغ'),
  title: S('وصف قصير للقيد'), journal: S('الدفتر أو اليومية والمستند الذي يُسجل فيه'),
  lines: { type: 'ARRAY', items: OBJ({ account: S('رقم الحساب من الدليل'), name: S(), debit: S('مبلغ أو 0'), credit: S('مبلغ أو 0') }, ['account', 'name', 'debit', 'credit']) },
  confidence: { type: 'NUMBER', description: '0 إلى 1' }, reason: S('لماذا هذا القيد، من الذاكرة'),
  question: S('سؤال للمحاسب إن لم تكن متأكداً، وإلا فارغ'), extracted: OBJ({ amount: S(), date: S(), party: S(), vatIncluded: { type: 'BOOLEAN' } }, []),
}, ['title', 'journal', 'lines', 'confidence', 'reason']);
/** The request (Gemini shape) asking the AI for the entry of a document, grounded in the memory and the local suggestion. */
export function aiBody(mem: Memory, doc: Doc, local: Suggestion, attachment?: { mime: string; data: string }) {
  const sys = 'أنت محاسب أول في هذه الشركة. مهمتك اقتراح قيد اليومية لمستند، بالطريقة التي تسجل بها هذه الشركة قيودها بالضبط كما تظهر في الذاكرة أدناه. ' +
    'استخدم أرقام الحسابات الموجودة في الدليل فقط، واجعل القيد متزناً، وافصل ضريبة القيمة المضافة كما تفعل الشركة. إذا لم تكن متأكداً فاكتب سؤالاً محدداً للمحاسب في question وأعط confidence أقل من 0.6. لا تخترع حسابات.\n\n' + memoryText(mem);
  const parts: object[] = [{ text: 'المستند: ' + (doc.text || '(مرفق)') + '\nالمبلغ: ' + (doc.amount || 'غير محدد — استخرجه من المرفق') + (doc.date ? '\nالتاريخ: ' + doc.date : '') + '\nالمبلغ ' + (doc.vatIncluded === false ? 'قبل' : 'شامل') + ' الضريبة.' +
    '\n\nاقتراح المحرك المحلي: ' + (local.patternId ? '[' + local.patternId + '] ' + local.title + ' بثقة ' + local.confidence : 'لا يوجد') }];
  if (attachment) parts.push({ inlineData: { mimeType: attachment.mime, data: attachment.data } });
  return { systemInstruction: { parts: [{ text: sys }] }, contents: [{ role: 'user', parts }], generationConfig: { temperature: 0.1, responseMimeType: 'application/json', responseSchema: AI_SCHEMA } };
}
/** The AI's answer checked against the memory: known accounts only, balanced, or it falls back to asking. */
export function verifyAi(mem: Memory, raw: unknown, local: Suggestion): Suggestion & { unknownAccounts: string[]; extracted?: { amount?: number; date?: string; party?: string } } {
  const r = (raw ?? {}) as Record<string, unknown>;
  const num = (v: unknown) => Math.abs(Number(String(v ?? '').replace(/[^\d.\-]/g, '')) || 0);
  const lines: Line[] = (Array.isArray(r.lines) ? r.lines : []).map((l: Record<string, unknown>) => ({ account: String(l.account ?? '').trim(), name: String(l.name ?? '').trim(), debit: r2(num(l.debit)), credit: r2(num(l.credit)) }))
    .filter((l) => l.account && (l.debit || l.credit));
  lines.forEach((l) => { if (mem.accounts[l.account]) l.name = mem.accounts[l.account].name || l.name; });
  const unknownAccounts = lines.filter((l) => !mem.accounts[l.account]).map((l) => l.account);
  const balanced = isBalanced(lines), pid = String(r.patternId ?? '');
  let confidence = Math.max(0, Math.min(1, Number(r.confidence) || 0));
  if (!balanced || unknownAccounts.length) confidence = Math.min(confidence, 0.4);
  const q = String(r.question ?? '').trim();
  const ex = (r.extracted ?? {}) as Record<string, unknown>;
  const status: Suggestion['status'] = !lines.length ? 'unknown' : confidence >= 0.6 && !q ? 'sure' : 'unsure';
  return {
    status, confidence: Math.round(confidence * 100) / 100, patternId: mem.patterns.some((p) => p.id === pid) ? pid : null, title: String(r.title ?? local.title ?? ''), journal: String(r.journal ?? local.journal ?? ''),
    lines, balanced, reasons: [String(r.reason ?? ''), !balanced ? 'القيد المقترح من الذكاء الاصطناعي غير متزن' : '', unknownAccounts.length ? 'حسابات غير موجودة في الدليل: ' + unknownAccounts.join('، ') : ''].filter(Boolean),
    alternatives: local.alternatives, question: q || (status === 'sure' ? null : local.question ?? 'تحقق من القيد قبل اعتماده.'), unknownAccounts,
    extracted: { amount: num(ex.amount) || undefined, date: String(ex.date ?? '') || undefined, party: String(ex.party ?? '') || undefined },
  };
}

/* ---------- reading a journal file ---------- */
const COLS: [keyof JeRow | 'amount' | 'side', RegExp][] = [
  ['date', /تاريخ|date/], ['ref', /رقم القيد|القيد|مستند|سند|ref|entry|voucher|journal no|je/], ['account', /رقم الحساب|رمز الحساب|كود|account code|acc(ount)? ?no|code/],
  ['name', /اسم الحساب|الحساب|account name|account/], ['debit', /مدين|debit|dr/], ['credit', /دائن|credit|cr/], ['memo', /بيان|وصف|شرح|ملاحظ|description|memo|narration|details/],
  ['amount', /مبلغ|amount|value/], ['side', /نوع|طبيعه|طبيعة|side|d\/c|dr\/cr/],
];
/** Which column holds which field, from a file's header row (the screen lets the user correct it). */
export function detectColumns(head: string[]): Partial<Record<keyof JeRow | 'amount' | 'side', number>> {
  const h = head.map((x) => String(x ?? '').trim().toLowerCase()), out: Partial<Record<keyof JeRow | 'amount' | 'side', number>> = {}, used = new Set<number>();
  for (const [f, re] of COLS) { const i = h.findIndex((x, j) => !used.has(j) && re.test(x)); if (i >= 0) { out[f] = i; used.add(i); } }
  return out;
}
/** Rows of a journal file as journal rows, given the column map (a single amount column with a side column is supported). */
export function rowsFrom(rows: string[][], map: Partial<Record<keyof JeRow | 'amount' | 'side', number>>): JeRow[] {
  const g = (r: string[], f: keyof typeof map) => (map[f] == null || map[f]! < 0 ? '' : String(r[map[f]!] ?? '').trim());
  const num = (v: string) => { const s = v.replace(/[٬,\s]/g, '').replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))); const neg = /^\(.*\)$/.test(s); const n = Number(s.replace(/[^\d.\-]/g, '')) || 0; return neg ? -n : n; };
  return rows.map((r) => {
    let debit = num(g(r, 'debit')), credit = num(g(r, 'credit'));
    if (!debit && !credit && map.amount != null) { const a = num(g(r, 'amount')), side = g(r, 'side').toLowerCase(); if (/دائن|^c|cr/.test(side) || (!side && a < 0)) credit = Math.abs(a); else debit = Math.abs(a); }
    const acc = g(r, 'account') || g(r, 'name');
    return { date: g(r, 'date'), ref: g(r, 'ref'), account: acc, name: g(r, 'name') !== acc ? g(r, 'name') : '', debit, credit, memo: g(r, 'memo') };
  }).filter((x) => x.account);
}
