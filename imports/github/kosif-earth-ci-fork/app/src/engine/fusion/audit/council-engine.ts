/* The audit council (research «مجلس المراجعة الذكي», chapters 7 and 8) — the deterministic half:
     • six integrity checks on the inputs; a failed check becomes a request in the first round
     • journal tests over the whole population: unusual entries (weekends, back-dated after close, round
       amounts, manual entries on sensitive accounts, no description, rare account pairs), Benford's first
       digit (χ² and MAD, Nigrini's conformity bands) and the cut-off window around period end
     • the numbered evidence register the members must cite (TB-…, T-ANL-…, T-VAL-…, T-INT-…, T-JE-…,
       T-BEN-001, T-CUT-…, DOC-…): a member cannot speak of a number that is not in a cited evidence
     • the members (sceptic, analyst, standards expert, tax & zakat expert, chair), their weights per line,
       their structured output schema and prompt, and the anti-hallucination guards: an opinion citing an
       evidence that does not exist is rejected; numbers not found in the cited evidence are flagged
     • the weighted vote and the disagreements sent back for the structured debate.
   The language model never computes: every number comes from here or from the review engines. */
import { formatMinor, type Minor } from '../reports/money-engine';
import type { TrialBalance } from '../reports/tb-import-engine';
import type { Finding } from './tb-review-engine';
import { ASSERTIONS, type AssertionKey, type Effort } from './confidence-engine';

/* ---------- journals ---------- */
export type JournalLine = { account: string; debit: number; credit: number };
export type Journal = { id: string; ref?: string; date: string; memo?: string; user?: string; source?: string; createdAt?: string; lines: JournalLine[] };
const nd = (s: unknown) => String(s ?? '').replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[٬,\s]/g, '').replace('٫', '.');
const num = (s: unknown) => { const t = nd(s), neg = /^\(.*\)$/.test(t), v = parseFloat(t.replace(/[()]/g, '')); return Number.isFinite(v) ? (neg ? -v : v) : 0; };
const norm = (s: string) => String(s || '').toLowerCase().replace(/[ً-ٰٟ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').trim();
const HEAD: [RegExp, keyof Omit<Journal, 'lines' | 'id'> | 'account' | 'debit' | 'credit'][] = [
  [/رقم القيد|القيد|المرجع|ref|entry|voucher|سند/, 'ref'], [/تاريخ|date/, 'date'], [/رقم الحساب|الحساب|كود|account|code/, 'account'],
  [/مدين|debit|dr/, 'debit'], [/دائن|credit|cr/, 'credit'], [/البيان|الوصف|شرح|memo|description|narration/, 'memo'], [/المستخدم|user|بواسطه|by/, 'user'],
  [/المصدر|source|نوع/, 'source'], [/وقت التسجيل|created|posted/, 'createdAt'],
];
function split(line: string, d: string): string[] {
  const out: string[] = []; let cur = '', q = false;
  for (let i = 0; i < line.length; i++) { const c = line[i]; if (c === '"') { if (q && line[i + 1] === '"') { cur += '"'; i++ } else q = !q } else if (c === d && !q) { out.push(cur); cur = '' } else cur += c }
  out.push(cur); return out.map((x) => x.trim());
}
/** A journal export (CSV/TSV, one row per line) → entries grouped by their reference. */
export function parseJournal(text: string): { entries: Journal[]; errors: string[] } {
  const lines = String(text || '').replace(/^﻿/, '').split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return { entries: [], errors: ['الملف فارغ أو بلا صفوف قيود'] };
  const d = lines[0].includes('\t') ? '\t' : lines[0].includes(';') && !lines[0].includes(',') ? ';' : ',';
  const head = split(lines[0], d).map(norm), col: Record<string, number> = {};
  head.forEach((h, i) => { const hit = HEAD.find(([re, k]) => re.test(h) && col[k] === undefined); if (hit) col[hit[1]] = i; });
  const errors: string[] = [];
  if (col.date === undefined || col.account === undefined || (col.debit === undefined && col.credit === undefined)) return { entries: [], errors: ['لم أتعرف على أعمدة التاريخ والحساب والمدين/الدائن'] };
  const map = new Map<string, Journal>();
  lines.slice(1).forEach((l, i) => {
    const c = split(l, d), get = (k: string) => (col[k] === undefined ? '' : c[col[k]] ?? '');
    const date = normDate(get('date'));
    if (!date) { errors.push('السطر ' + (i + 2) + ': تاريخ غير مفهوم'); return; }
    const ref = get('ref') || date + '#' + (i + 2), key = ref;
    const j = map.get(key) ?? { id: 'JE-' + ref, ref, date, memo: get('memo'), user: get('user'), source: get('source'), createdAt: normDate(get('createdAt'), true) || undefined, lines: [] };
    if (!j.memo && get('memo')) j.memo = get('memo');
    j.lines.push({ account: get('account'), debit: Math.abs(num(get('debit'))), credit: Math.abs(num(get('credit'))) });
    map.set(key, j);
  });
  return { entries: [...map.values()], errors };
}
function normDate(s: string, keepTime = false): string {
  const t = nd(s).replace(/\//g, '-');
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T ](\d{1,2}:\d{2}))?/.exec(t);
  if (m) return m[1] + '-' + m[2].padStart(2, '0') + '-' + m[3].padStart(2, '0') + (keepTime && m[4] ? 'T' + m[4].padStart(5, '0') : '');
  m = /^(\d{1,2})-(\d{1,2})-(\d{4})/.exec(t);
  if (m) return m[3] + '-' + m[2].padStart(2, '0') + '-' + m[1].padStart(2, '0');
  return '';
}
const amountOf = (j: Journal) => Math.round(j.lines.reduce((s, l) => s + l.debit, 0) * 100) / 100;

/* ---------- 1. the six integrity checks (7.2) ---------- */
export type Check = { id: string; ar: string; ok: boolean | null; detail: string; request?: string };
export function integrityChecks(i: { tb: TrialBalance; entries?: Journal[]; period?: { start: string; end: string } }): Check[] {
  const { tb } = i, E = i.entries ?? [], has = E.length > 0, m = (v: Minor) => formatMinor(v, { decimals: 2 });
  const checks: Check[] = [];
  checks.push({ id: 'INT-1', ar: 'تساوي المدين والدائن في الميزان', ok: tb.balanced, detail: tb.balanced ? 'متزن' : 'فرق ' + m(tb.difference), request: tb.balanced ? undefined : 'ميزان مراجعة مكتمل ومتزن مصدّر من النظام المحاسبي مباشرة' });
  checks.push({ id: 'INT-2', ar: 'مطابقة أرصدة أول المدة مع آخر السنة السابقة', ok: tb.hasPrior ? tb.priorDifference === 0 : null,
    detail: !tb.hasPrior ? 'لا يوجد عمود للسنة السابقة' : tb.priorDifference === 0 ? 'أرصدة السنة السابقة متزنة' : 'أرصدة السنة السابقة غير متزنة بفرق ' + m(tb.priorDifference ?? 0),
    request: tb.hasPrior && tb.priorDifference !== 0 ? 'القوائم المعتمدة للسنة السابقة وأرصدة الإقفال لمطابقة أرصدة أول المدة' : !tb.hasPrior ? 'ميزان السنة السابقة المعتمد لمطابقة أرصدة أول المدة' : undefined });
  const nums = E.map((j) => Number(nd(j.ref).replace(/\D/g, ''))).filter((n) => Number.isFinite(n) && n > 0).sort((a, b) => a - b);
  const gaps: number[] = [];
  for (let k = 1; k < nums.length && gaps.length < 20; k++) for (let g = nums[k - 1] + 1; g < nums[k] && gaps.length < 20; g++) gaps.push(g);
  checks.push({ id: 'INT-3', ar: 'اكتمال تسلسل أرقام القيود', ok: nums.length >= 2 ? gaps.length === 0 : null,
    detail: nums.length < 2 ? 'لا توجد قيود مرقمة للفحص' : gaps.length ? 'أرقام مفقودة: ' + gaps.slice(0, 10).join('، ') + (gaps.length > 10 ? '…' : '') : 'التسلسل مكتمل (' + nums.length + ' قيداً)',
    request: gaps.length ? 'تفسير القيود المفقودة من التسلسل: ' + gaps.slice(0, 10).join('، ') : undefined });
  let mism: string[] = [];
  if (has) {
    const bal = new Map<string, number>();
    E.forEach((j) => j.lines.forEach((l) => bal.set(l.account, (bal.get(l.account) ?? 0) + l.debit - l.credit)));
    mism = tb.rows.filter((r) => bal.has(r.code) && Math.abs(Math.round((bal.get(r.code) ?? 0) * 100) - r.balance) > 100).map((r) => r.code);
  }
  checks.push({ id: 'INT-4', ar: 'تطابق مجاميع القيود مع أرصدة الميزان', ok: has ? mism.length === 0 : null,
    detail: !has ? 'لم يُرفع دفتر القيود' : mism.length ? 'حسابات لا تطابق القيود: ' + mism.slice(0, 8).join('، ') : 'مجاميع القيود تطابق الميزان',
    request: mism.length ? 'دفتر القيود الكامل للسنة للحسابات ' + mism.slice(0, 8).join('، ') + ' أو تفسير الفروق' : undefined });
  const dup = tb.errors.filter((e) => e.code === 'DUPLICATE_ACCOUNT').length;
  checks.push({ id: 'INT-5', ar: 'كشف الحسابات المكررة أو غير المصنفة', ok: dup === 0 && tb.unclassified === 0,
    detail: dup || tb.unclassified ? dup + ' مكرر · ' + tb.unclassified + ' غير مصنف' : 'لا مكرر ولا غير مصنف',
    request: dup || tb.unclassified ? 'دليل الحسابات المعتمد مع تصنيف الحسابات غير المصنفة ودمج المكررة' : undefined });
  const out = has && i.period ? E.filter((j) => j.date < i.period!.start || j.date > i.period!.end) : [];
  checks.push({ id: 'INT-6', ar: 'صحة الفترة المالية وتواريخ القيود', ok: has && i.period ? out.length === 0 : null,
    detail: !has ? 'لم يُرفع دفتر القيود' : !i.period ? 'حدد بداية الفترة ونهايتها' : out.length ? out.length + ' قيداً خارج الفترة (أولها ' + out[0].date + ')' : 'كل القيود داخل الفترة',
    request: out.length ? 'تفسير القيود المسجلة خارج الفترة المالية (' + out.length + ')' : undefined });
  return checks;
}

/* ---------- 2. Benford's first digit (7.4 — an indicator worth examining, never proof of fraud) ---------- */
export const BENFORD = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => Math.log10(1 + 1 / d));
export function benford(amounts: number[]) {
  const firsts = amounts.map((a) => Math.abs(a)).filter((a) => a >= 10).map((a) => Number(String(a).replace(/^0\.?0*/, '')[0])).filter((d) => d >= 1 && d <= 9);
  const n = firsts.length, counts = Array(9).fill(0);
  firsts.forEach((d) => counts[d - 1]++);
  const observed = counts.map((c) => (n ? c / n : 0));
  const chi2 = n ? counts.reduce((s, c, i) => s + (c - n * BENFORD[i]) ** 2 / (n * BENFORD[i]), 0) : 0;
  const mad = observed.reduce((s, o, i) => s + Math.abs(o - BENFORD[i]), 0) / 9;
  const conformity: 'insufficient' | 'close' | 'acceptable' | 'marginal' | 'nonconformity' = n < 50 ? 'insufficient' : mad < 0.006 ? 'close' : mad < 0.012 ? 'acceptable' : mad < 0.015 ? 'marginal' : 'nonconformity';
  let top = 0; observed.forEach((o, i) => { if (Math.abs(o - BENFORD[i]) > Math.abs(observed[top] - BENFORD[top])) top = i; });
  return { n, counts, observed: observed.map((o) => Math.round(o * 1e4) / 1e4), expected: BENFORD.map((e) => Math.round(e * 1e4) / 1e4), chi2: Math.round(chi2 * 100) / 100,
    mad: Math.round(mad * 1e4) / 1e4, conformity, conformityAr: { insufficient: 'عدد غير كافٍ (أقل من 50)', close: 'مطابقة قريبة', acceptable: 'مطابقة مقبولة', marginal: 'مطابقة حدية', nonconformity: 'عدم مطابقة — يستحق الفحص' }[conformity],
    top: { digit: top + 1, observed: Math.round(observed[top] * 1e4) / 1e4, expected: Math.round(BENFORD[top] * 1e4) / 1e4 } };
}

/* ---------- 3. unusual entries and cut-off over the whole population (7.4) ---------- */
export type Unusual = { entryId: string; ref: string; date: string; amount: number; reasons: { code: string; ar: string }[] };
export function unusualEntries(E: Journal[], o: { periodEnd?: string; sensitive: (account: string) => boolean; weekend?: number[]; roundUnit?: number; minRound?: number }): Unusual[] {
  const weekend = o.weekend ?? [5, 6], unit = o.roundUnit ?? 1000, min = o.minRound ?? 10000;
  const pairs = new Map<string, number>();
  const pairOf = (j: Journal) => { const dr = j.lines.filter((l) => l.debit).map((l) => l.account).sort().join('+'), cr = j.lines.filter((l) => l.credit).map((l) => l.account).sort().join('+'); return dr + '|' + cr; };
  E.forEach((j) => pairs.set(pairOf(j), (pairs.get(pairOf(j)) ?? 0) + 1));
  const out: Unusual[] = [];
  E.forEach((j) => {
    const r: { code: string; ar: string }[] = [], amt = amountOf(j), dt = new Date(j.date + 'T00:00:00Z');
    if (weekend.includes(dt.getUTCDay())) r.push({ code: 'weekend', ar: 'مسجل في عطلة نهاية الأسبوع' });
    if (o.periodEnd && j.createdAt && j.createdAt.slice(0, 10) > o.periodEnd && j.date <= o.periodEnd) r.push({ code: 'backdated', ar: 'سُجل بعد الإقفال بتاريخ سابق له' });
    if (amt >= min && Math.abs(amt % unit) < 0.005) r.push({ code: 'round', ar: 'مبلغ مقرب (' + amt.toLocaleString('en-US') + ')' });
    if (/يدوي|manual/i.test(j.source ?? '') && j.lines.some((l) => o.sensitive(l.account))) r.push({ code: 'manual-sensitive', ar: 'قيد يدوي على حساب حساس (إيرادات/مخصصات)' });
    if (!String(j.memo ?? '').trim()) r.push({ code: 'no-memo', ar: 'بلا وصف' });
    if (E.length >= 20 && pairs.get(pairOf(j)) === 1 && j.lines.length >= 2) r.push({ code: 'rare-pair', ar: 'يجمع حسابات نادراً ما تجتمع' });
    if (r.length) out.push({ entryId: j.id, ref: j.ref ?? j.id, date: j.date, amount: amt, reasons: r });
  });
  const weight = (u: Unusual) => u.reasons.reduce((s, x) => s + ({ backdated: 5, 'manual-sensitive': 3, 'rare-pair': 2, round: 2, weekend: 1, 'no-memo': 1 }[x.code] ?? 1), 0);
  return out.sort((a, b) => weight(b) - weight(a) || b.amount - a.amount);
}
export function cutoffEntries(E: Journal[], periodEnd: string, isResult: (account: string) => boolean, days = 5) {
  const end = new Date(periodEnd + 'T00:00:00Z').getTime(), win = days * 864e5;
  return E.filter((j) => { const t = new Date(j.date + 'T00:00:00Z').getTime(); return Math.abs(t - end) <= win && j.lines.some((l) => isResult(l.account)); })
    .map((j) => ({ entryId: j.id, ref: j.ref ?? j.id, date: j.date, amount: amountOf(j), side: j.date <= periodEnd ? 'before' as const : 'after' as const, memo: j.memo ?? '' }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
export function journalTests(E: Journal[], o: { periodEnd?: string; sensitive: (a: string) => boolean; isResult: (a: string) => boolean }) {
  const unusual = unusualEntries(E, o), ben = benford(E.map(amountOf)), cutoff = o.periodEnd ? cutoffEntries(E, o.periodEnd, o.isResult) : [];
  const backdatedRevenue = unusual.some((u) => u.reasons.some((r) => r.code === 'backdated') && E.find((j) => j.id === u.entryId)!.lines.some((l) => o.sensitive(l.account)));
  const fraudSignal = backdatedRevenue || (ben.conformity === 'nonconformity' && unusual.length >= Math.max(5, E.length * 0.05));
  return { count: E.length, total: Math.round(E.reduce((s, j) => s + amountOf(j), 0) * 100) / 100, unusual, benford: ben, cutoff, fraudSignal };
}

/* ---------- 4. the numbered evidence register (7.5) ---------- */
export type Evidence = { id: string; family: 'TB' | 'ANL' | 'VAL' | 'INT' | 'JE' | 'BEN' | 'CUT' | 'DOC'; lineKey?: string; title: string; detail: string; amount?: number; aboveTolerance?: boolean };
export function evidenceRegister(i: {
  tb: TrialBalance; lineOf: (code: string) => string | null; findings: Finding[]; checks?: Check[];
  journal?: ReturnType<typeof journalTests> | null; docs?: { requestId: string; fileName: string; verdict: string; lineKey?: string; amount?: number }[]; pm: Minor; maxTb?: number;
}): Evidence[] {
  const out: Evidence[] = [], pad = (n: number) => String(n).padStart(3, '0'), M = (v: Minor) => v / 100;
  i.tb.rows.slice().sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance)).slice(0, i.maxTb ?? 80)
    .forEach((r) => out.push({ id: 'TB-' + r.code, family: 'TB', lineKey: i.lineOf(r.code) ?? undefined, title: r.name, detail: 'الرصيد ' + formatMinor(r.balance, { decimals: 2 }) + (r.prior !== null ? ' · السابق ' + formatMinor(r.prior, { decimals: 2 }) : ''), amount: M(r.balance), aboveTolerance: Math.abs(r.balance) > i.pm }));
  let a = 0, v = 0;
  i.findings.forEach((f) => {
    const anl = f.kind === 'analytical', id = anl ? 'T-ANL-' + pad(++a) : 'T-VAL-' + pad(++v);
    const amt = /[\d٠-٩][\d٠-٩٬,.]*/.exec(f.detail)?.[0];
    out.push({ id, family: anl ? 'ANL' : 'VAL', lineKey: f.lineKey ?? (f.code ? i.lineOf(f.code) ?? undefined : undefined), title: f.title, detail: f.detail + (f.code ? ' [TB-' + f.code + ']' : ''), amount: amt ? num(amt) : undefined });
  });
  (i.checks ?? []).filter((c) => c.ok === false).forEach((c, k) => out.push({ id: 'T-INT-' + (k + 1), family: 'INT', title: c.ar, detail: c.detail }));
  if (i.journal && i.journal.count) {
    i.journal.unusual.slice(0, 40).forEach((u, k) => out.push({ id: 'T-JE-' + pad(k + 1), family: 'JE', title: 'قيد ' + u.ref + ' — ' + u.date, detail: u.reasons.map((r) => r.ar).join('، '), amount: u.amount }));
    const b = i.journal.benford;
    out.push({ id: 'T-BEN-001', family: 'BEN', title: 'تحليل بنفورد للرقم الأول (' + b.n + ' قيداً)', detail: b.conformityAr + ' — MAD ' + b.mad + ' · χ² ' + b.chi2 + ' · أكبر انحراف للرقم ' + b.top.digit + ' (' + Math.round(b.top.observed * 1000) / 10 + '٪ مقابل ' + Math.round(b.top.expected * 1000) / 10 + '٪)' });
    i.journal.cutoff.slice(0, 20).forEach((c, k) => out.push({ id: 'T-CUT-' + pad(k + 1), family: 'CUT', title: 'قيد حول الإقفال ' + c.ref + ' — ' + c.date + (c.side === 'after' ? ' (بعد)' : ' (قبل)'), detail: c.memo || '—', amount: c.amount }));
  }
  (i.docs ?? []).forEach((d, k) => out.push({ id: 'DOC-' + (k + 1), family: 'DOC', lineKey: d.lineKey, title: d.fileName + ' ← ' + d.requestId, detail: 'الحكم: ' + d.verdict, amount: d.amount }));
  return out;
}
export const registerText = (reg: Evidence[]) => reg.map((e) => '[' + e.id + '] ' + (e.lineKey ? '(' + e.lineKey + ') ' : '') + e.title + ' — ' + e.detail).join('\n');

/* ---------- 5. the members (8.1) and their weight per line (8.3, stage 3) ---------- */
export type MemberKey = 'skeptic' | 'analyst' | 'standards' | 'tax' | 'chair';
export const MEMBERS: { key: MemberKey; ar: string; seeks: string; tools: string; weighs: string; persona: string }[] = [
  { key: 'skeptic', ar: 'المراجع المتشكك', seeks: 'الاستثناءات والتناقضات والأدلة الناقصة', tools: 'القيود غير المعتادة، تحليل بنفورد، مطابقة المستندات', weighs: 'بنود الخطر المرتفع',
    persona: 'افترض أن كل رصيد قد يكون مبالغاً فيه أو ناقصاً حتى يثبت العكس بدليل مستقل. غياب الدليل نقص لا نفي. ابحث عن الاستثناءات والتناقضات بين الأدلة، ومؤشرات الغش (ISA 240).' },
  { key: 'analyst', ar: 'المحلل المالي', seeks: 'الاتجاهات والنسب الشاذة والعلاقات غير المنطقية', tools: 'الإجراءات التحليلية، بيانات السنوات السابقة', weighs: 'الإيرادات والتكاليف والهوامش',
    persona: 'اختبر العلاقات المنطقية بين البنود (تكلفة المبيعات بالإيرادات، الذمم بالمبيعات، المصروفات بالنشاط) والتغيرات عن السنة السابقة، وحدد الانحرافات التي تتجاوز أهمية الأداء (ISA 520).' },
  { key: 'standards', ar: 'خبير المعايير', seeks: 'صحة الاعتراف والقياس والعرض والإفصاح', tools: 'قاعدة المعرفة بالمعايير المحاسبية', weighs: 'المعالجات المحاسبية المعقدة والتقديرات',
    persona: 'افحص الاعتراف والقياس والعرض والإفصاح لكل بند مقابل الإطار المطبق، وخاصة التقديرات (ISA 540): المخصصات، الخسائر الائتمانية المتوقعة، صافي القيمة القابلة للتحقق، انخفاض القيمة.' },
  { key: 'tax', ar: 'خبير الضرائب والزكاة', seeks: 'الأثر الضريبي والزكوي لكل ملاحظة', tools: 'قواعد الضريبة والزكاة المحلية', weighs: 'المخصصات والوعاء الزكوي وضريبة الدخل',
    persona: 'قدّر الأثر الضريبي والزكوي لكل ملاحظة: الوعاء الزكوي والزكاة المستحقة أو ضريبة الدخل (مصر 22.5٪)، ضريبة القيمة المضافة، والفروقات مع الإقرارات.' },
  { key: 'chair', ar: 'رئيس المجلس', seeks: 'كفاية الأدلة وتوازن الآراء', tools: 'كل المخرجات ودرجات الثقة', weighs: 'القرار النهائي للجولة',
    persona: 'اجمع نقاط الاتفاق والخلاف، وقرر المسار: طلب أدلة، أو تصعيد للمراجع البشري، أو اكتفاء. سجل كل رأي مخالف لم يُحسم.' },
];
export const COUNCIL: Record<1 | 3 | 5, MemberKey[]> = { 1: [], 3: ['skeptic', 'analyst'], 5: ['skeptic', 'analyst', 'standards', 'tax'] };
const TAX_LINES = /zakat|tax/i, ANALYST_LINES = /^(revenue|cogs|selling|admin|opex|otherIncome|financeCost)$/, EST_LINES = /^(provisions|receivables|inventory|ppe|impairment|eosb|intangibles|rou|biological|investments)$/;
/** A member's vote weighs more on the lines of its trade. */
export function roleWeight(member: MemberKey, lineKey: string, highRisk = false): number {
  if (member === 'tax') return TAX_LINES.test(lineKey) ? 2 : 0.75;
  if (member === 'analyst') return ANALYST_LINES.test(lineKey) ? 2 : 1;
  if (member === 'standards') return EST_LINES.test(lineKey) ? 2 : 1;
  if (member === 'skeptic') return highRisk ? 2 : 1;
  return 1;
}

/* ---------- 6. the member's structured output and prompt (8.2) ---------- */
const S = (description?: string) => ({ type: 'STRING', ...(description ? { description } : {}) });
const ARR = (items: object) => ({ type: 'ARRAY', items });
const OBJ = (properties: Record<string, object>, required: string[]) => ({ type: 'OBJECT', properties, required });
const ASSERT_ENUM = { type: 'STRING', enum: ASSERTIONS.map((a) => a.key) };
export const MEMBER_SCHEMA = OBJ({
  position: S('موقفك في جملة واحدة'), reasoning: S('التعليل مع أرقام الأدلة بين معقوفين مثل [T-ANL-001]'),
  citations: ARR(S('رقم دليل من السجل فقط')),
  items: ARR(OBJ({ lineKey: S('مفتاح البند كما في السجل'), assertion: ASSERT_ENUM, sufficient: { type: 'BOOLEAN' }, finding: { type: 'BOOLEAN' }, confidence: { type: 'NUMBER', description: '0 إلى 1' }, citations: ARR(S()) }, ['lineKey', 'assertion', 'sufficient', 'finding', 'confidence', 'citations'])),
  requests: ARR(OBJ({ lineKey: S(), assertion: ASSERT_ENUM, evidence: S('المستند المطلوب بدقة: من، ماذا، أي فترة'), reason: S('السبب مع رقم الدليل'), citations: ARR(S()), effort: { type: 'STRING', enum: ['low', 'medium', 'high'] } }, ['lineKey', 'assertion', 'evidence', 'reason', 'citations', 'effort'])),
}, ['position', 'reasoning', 'citations', 'items', 'requests']);
export type MemberOpinion = { member: MemberKey; position: string; reasoning: string; citations: string[];
  items: { lineKey: string; assertion: AssertionKey; sufficient: boolean; finding: boolean; confidence: number; citations: string[] }[];
  requests: { lineKey: string; assertion: AssertionKey; evidence: string; reason: string; citations: string[]; effort: Effort }[];
  unknownCitations: string[]; unsupportedNumbers: string[]; rejected: boolean; reply?: string };
export function memberBody(member: MemberKey, i: { company: string; period: string; framework: string; register: Evidence[]; lines: string; outstanding: string; round: number; debate?: string }) {
  const m = MEMBERS.find((x) => x.key === member)!;
  const system = 'أنت «' + m.ar + '» في مجلس مراجعة ذكي من خمسة أعضاء يراجع القوائم المالية لـ«' + (i.company || 'المنشأة') + '» — ' + (i.period || '') + ' — الإطار: ' + i.framework + '.\n' + m.persona + '\n' +
    'قواعد ملزمة: (1) كل ادعاء يرتبط برقم دليل من السجل بين معقوفين، والاستشهاد برقم غير موجود يرفض رأيك آلياً. (2) لا تحسب أرقاماً جديدة ولا تذكر رقماً غير موجود في الدليل الذي تستشهد به. ' +
    '(3) حدد ثقتك من 0 إلى 1 لكل بند وتأكيد تتحدث عنه، وغياب الدليل نقص لا نفي. (4) الطلب الذكي محدد: المستند، والسبب برقم الدليل، والبند والتأكيد، والعبء على العميل. (5) أجب بالعربية وبصيغة JSON المطلوبة فقط.';
  const user = 'الجولة ' + i.round + '.\nالبنود الجوهرية وعتباتها ودرجات الثقة الحالية:\n' + i.lines + '\n\nالطلبات القائمة:\n' + (i.outstanding || '—') + '\n\nسجل الأدلة المرقمة:\n' + registerText(i.register) + (i.debate ? '\n\nنقاط الخلاف التي أعادها الرئيس إليك (رد باستشهاد):\n' + i.debate : '');
  return { systemInstruction: { parts: [{ text: system }] }, contents: [{ role: 'user', parts: [{ text: user }] }], generationConfig: { temperature: member === 'skeptic' ? 0.4 : 0.2, responseMimeType: 'application/json', responseSchema: MEMBER_SCHEMA } };
}

/* ---------- 7. the anti-hallucination guards (8.4) ---------- */
const IDS = /\b(TB-[\w.-]+|T-(?:ANL|VAL|INT|JE|BEN|CUT)-\d+|DOC-\d+)\b/g;
const numbersIn = (t: string) => (nd(t).replace(/(ISA|IFRS|IAS|EAS|SOCPA|معيار|المعيار|البند|الجولة|REQ|TB|T-[A-Z]+|DOC)[\s-]*\d+/gi, ' ').match(/\d+(\.\d+)?/g) ?? []).map(Number).filter((x) => x >= 100 && !(x >= 1900 && x <= 2100));
/** Keep only what the register supports: unknown citations reject the opinion; free numbers are flagged. */
export function verifyOpinion(raw: unknown, member: MemberKey, reg: Evidence[]): MemberOpinion {
  const o = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>, A = (v: unknown) => (Array.isArray(v) ? v : []);
  const ids = new Set(reg.map((e) => e.id)), text = String(o.reasoning ?? '') + ' ' + String(o.position ?? '');
  const cited = [...new Set([...A(o.citations).map(String), ...(text.match(IDS) ?? [])])];
  const clampC = (x: unknown) => Math.max(0, Math.min(1, Number(x) || 0));
  const keyOf = (x: unknown): AssertionKey => (ASSERTIONS.some((a) => a.key === x) ? x as AssertionKey : 'existence');
  const items = A(o.items).map((x) => x as Record<string, unknown>).map((x) => ({ lineKey: String(x.lineKey ?? ''), assertion: keyOf(x.assertion), sufficient: !!x.sufficient, finding: !!x.finding, confidence: clampC(x.confidence), citations: A(x.citations).map(String) })).filter((x) => x.lineKey);
  const requests = A(o.requests).map((x) => x as Record<string, unknown>).map((x) => ({ lineKey: String(x.lineKey ?? ''), assertion: keyOf(x.assertion), evidence: String(x.evidence ?? '').slice(0, 400), reason: String(x.reason ?? '').slice(0, 400), citations: A(x.citations).map(String), effort: (['low', 'medium', 'high'].includes(String(x.effort)) ? x.effort : 'medium') as Effort })).filter((x) => x.evidence);
  const all = [...cited, ...items.flatMap((x) => x.citations), ...requests.flatMap((x) => x.citations)];
  const unknownCitations = [...new Set(all.filter((c) => !ids.has(c)))];
  const pool = reg.filter((e) => all.includes(e.id)), known = pool.flatMap((e) => [e.amount ?? NaN, ...numbersIn(e.title + ' ' + e.detail)]).filter(Number.isFinite).map(Math.abs);
  const unsupportedNumbers = [...new Set(numbersIn(text).filter((x) => !known.some((k) => Math.abs(k - x) <= Math.max(1, k * 0.01))).map(String))].slice(0, 8);
  return { member, position: String(o.position ?? '').slice(0, 300), reasoning: String(o.reasoning ?? '').slice(0, 2400), citations: cited.filter((c) => ids.has(c)), items, requests,
    unknownCitations, unsupportedNumbers, rejected: unknownCitations.length > 0 || (!cited.length && !items.length) };
}

/* ---------- 8. the weighted vote and the disagreements (8.3) ---------- */
export function weightedVote(ops: MemberOpinion[], lineKey: string, assertion: AssertionKey, highRisk = false) {
  const votes = ops.filter((o) => !o.rejected).flatMap((o) => o.items.filter((x) => x.lineKey === lineKey && x.assertion === assertion).map((x) => ({ ...x, w: roleWeight(o.member, lineKey, highRisk) * (o.unsupportedNumbers.length ? 0.5 : 1), member: o.member })));
  const W = votes.reduce((s, v) => s + v.w, 0);
  if (!W) return null;
  return { sufficient: votes.reduce((s, v) => s + (v.sufficient ? v.w : 0), 0) / W, finding: votes.reduce((s, v) => s + (v.finding ? v.w : 0), 0) / W,
    confidence: Math.round((votes.reduce((s, v) => s + v.confidence * v.w, 0) / W) * 100) / 100, values: votes.map((v) => v.confidence), members: votes.map((v) => v.member) };
}
/** Items the members disagree on (spread > 0.35 or a split on sufficiency) — sent back for the debate. */
export function disagreements(ops: MemberOpinion[]) {
  const keys = [...new Set(ops.filter((o) => !o.rejected).flatMap((o) => o.items.map((x) => x.lineKey + '|' + x.assertion)))];
  return keys.map((k) => { const [lineKey, assertion] = k.split('|') as [string, AssertionKey];
    const xs = ops.filter((o) => !o.rejected).flatMap((o) => o.items.filter((x) => x.lineKey === lineKey && x.assertion === assertion).map((x) => ({ member: o.member, ...x })));
    const cs = xs.map((x) => x.confidence), spread = cs.length ? Math.max(...cs) - Math.min(...cs) : 0, split = xs.some((x) => x.sufficient) && xs.some((x) => !x.sufficient);
    return { lineKey, assertion, spread: Math.round(spread * 100) / 100, split, members: xs };
  }).filter((d) => d.members.length >= 2 && (d.spread > 0.35 || d.split));
}
/** The council's opinions as context for the chair (and for the round's working papers). */
export function councilText(ops: MemberOpinion[], dis: ReturnType<typeof disagreements>) {
  const name = (k: MemberKey) => MEMBERS.find((m) => m.key === k)!.ar;
  return ops.map((o) => '— ' + name(o.member) + (o.rejected ? ' [مرفوض آلياً: استشهاد بدليل غير موجود ' + o.unknownCitations.join('، ') + ']' : '') + ': ' + o.position + '\n  ' + o.reasoning + (o.reply ? '\n  الرد في النقاش: ' + o.reply : '') +
    (o.items.length ? '\n  الثقة: ' + o.items.map((x) => x.lineKey + '/' + x.assertion + '=' + x.confidence).join('، ') : '')).join('\n') +
    (dis.length ? '\nنقاط الخلاف: ' + dis.map((d) => d.lineKey + '/' + d.assertion + ' (فارق ' + d.spread + (d.split ? '، انقسام على الكفاية' : '') + ')').join('؛ ') : '\nلا خلاف جوهري بين الأعضاء.');
}
