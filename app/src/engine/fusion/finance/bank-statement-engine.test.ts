import { describe, expect, it } from 'vitest';
import type { BookLine } from './bank-reconciliation-engine';
import { applyConfirmation, certificationOf, certify, emptyState, learnRule, lineHash, matchId, mergeImport, parseAmount, parseDate, parseStatement, reconState, rejectMatch, suggestMatches } from './bank-statement-engine';

/* ---------- three synthetic bank layouts (no customer data) ---------- */
/* Al Rajhi-like: title rows, Arabic headers, debit/credit columns, dd/mm/yyyy, Arabic-Indic digits, «ر.س» */
const RAJHI = [
  ['مصرف الراجحي — كشف حساب', '', '', '', '', ''],
  ['رقم الحساب', 'SA00 0000 0000', '', '', '', ''],
  ['التاريخ', 'البيان', 'المرجع', 'مدين', 'دائن', 'الرصيد'],
  ['٠٢/٠٥/٢٠٢٦', 'حوالة واردة من مطعم الوادي INV-1001', 'TRX-88121', '', '١٬١٥٠٫٠٠ ر.س', '٤٨٬٢٥٠٫٧٥'],
  ['٠٣/٠٥/٢٠٢٦', 'سداد مورد الأعلاف', 'TRX-88122', '٨٠٠٫٠٠ ر.س', '', '٤٧٬٤٥٠٫٧٥'],
  ['٠٣/٠٥/٢٠٢٦', 'رسوم خدمات بنكية', 'FEE-05', '٣٥٫٠٠', '', '٤٧٬٤١٥٫٧٥'],
  ['٠٣/٠٥/٢٠٢٦', 'ضريبة القيمة المضافة على الرسوم', 'FEE-05V', '٥٫٢٥', '', '٤٧٬٤١٠٫٥٠'],
  ['', 'المجموع', '', '٨٤٠٫٢٥', '١٬١٥٠٫٠٠', ''],
];
/* SNB-like: English headers, a single signed amount column with parentheses, SAR suffix, thousands separators */
const SNB = [
  ['Saudi National Bank', 'Account statement'],
  ['Transaction Date', 'Description', 'Reference No', 'Amount (SAR)', 'Balance'],
  ['2026-05-02', 'Incoming transfer MATAAM ALWADI INV-1001', 'TRX-88121', '1,150.00', '48,250.75'],
  ['2026-05-03', 'Outgoing SADAD feed supplier', 'TRX-88122', '(800.00)', '47,450.75'],
  ['2026-05-10', 'POS settlement mada 2 txns', 'POS-0510', '650.00 SAR', '48,100.75'],
];
/* Riyad-like: Arabic headers in another wording, unsigned «المبلغ» + «نوع العملية», dd-mm-yyyy with a time */
const RIYAD = [
  ['بنك الرياض'],
  ['تاريخ العملية', 'تفاصيل العملية', 'المبلغ', 'نوع العملية', 'رقم العملية'],
  ['02-05-2026 10:15', 'حوالة واردة INV-1001', '1150', 'دائن', 'R1'],
  ['03-05-2026 09:00', 'سداد مورد', '800', 'مدين', 'R2'],
  ['03-05-2026 09:01', 'سداد مورد', '800', 'مدين', 'R3'],
];

const book: BookLine[] = [
  { id: 'e1', date: '2026-05-01', amount: 1150, reference: 'INV-1001', memo: 'تحصيل مطعم الوادي' },
  { id: 'e2', date: '2026-05-03', amount: -800, reference: 'PO-77', memo: 'سداد مورد الأعلاف' },
  { id: 'e3', date: '2026-05-09', amount: 400, reference: 'INV-1002', memo: 'بيع نقدي' },
  { id: 'e4', date: '2026-05-09', amount: 250, reference: 'INV-1003', memo: 'بيع نقدي' },
  { id: 'e5', date: '2026-05-20', amount: 90, reference: 'INV-1009', memo: 'بيع نقدي' },
];

describe('number and date normalisation', () => {
  it('reads Saudi bank number spellings', () => {
    expect(parseAmount('١٬١٥٠٫٠٠ ر.س')).toBe(1150);
    expect(parseAmount('(1,234.50)')).toBe(-1234.5);
    expect(parseAmount('650.00 SAR')).toBe(650);
    expect(parseAmount('−35')).toBe(-35);
    expect(parseAmount('1 234,50')).toBe(1234.5);
    expect(parseAmount('35.00 DR')).toBe(-35);
    expect(parseAmount('')).toBeNull();
    expect(parseAmount('البيان')).toBeNull();
  });
  it('reads dd/mm/yyyy, ISO, two-digit years and flags Hijri-looking years without converting', () => {
    expect(parseDate('٠٢/٠٥/٢٠٢٦')).toEqual({ iso: '2026-05-02' });
    expect(parseDate('03-05-2026 09:00')).toEqual({ iso: '2026-05-03' });
    expect(parseDate('2026/05/31')).toEqual({ iso: '2026-05-31' });
    expect(parseDate('31/05/26')).toEqual({ iso: '2026-05-31' });
    expect(parseDate('14/11/1447')).toEqual({ iso: '', flag: 'hijri' });
    expect(parseDate('yesterday')).toEqual({ iso: '', flag: 'unparsed' });
  });
});

describe('parseStatement — three bank layouts', () => {
  it('Al Rajhi-like: Arabic headers after title rows, debit/credit, Arabic-Indic digits, totals row skipped', () => {
    const p = parseStatement(RAJHI);
    expect(p.headerRow).toBe(2);
    expect(p.bank.guess).toBe('alrajhi');
    expect(p.lines.map((l) => [l.date, l.amount, l.reference])).toEqual([['2026-05-02', 1150, 'TRX-88121'], ['2026-05-03', -800, 'TRX-88122'], ['2026-05-03', -35, 'FEE-05'], ['2026-05-03', -5.25, 'FEE-05V']]);
    expect(p.lines[0].balance).toBe(48250.75);
    expect(p.skipped).toBe(1);
    expect(p.warnings_ar).toEqual([]);
  });
  it('SNB-like: one signed amount column with parentheses and a SAR suffix', () => {
    const p = parseStatement(SNB);
    expect(p.bank.guess).toBe('snb');
    expect(p.lines.map((l) => l.amount)).toEqual([1150, -800, 650]);
    expect(p.columns).toMatchObject({ date: 0, description: 1, reference: 2, amount: 3, balance: 4, debit: -1, credit: -1 });
  });
  it('Riyad-like: unsigned amount + type column, a time after the date; two identical lines keep two hashes', () => {
    const p = parseStatement(RIYAD);
    expect(p.bank.guess).toBe('riyad');
    expect(p.lines.map((l) => l.amount)).toEqual([1150, -800, -800]);
    expect(p.lines[1].id).not.toBe(p.lines[2].id);
    expect(p.lines.every((l) => l.date === '2026-05-02' || l.date === '2026-05-03')).toBe(true);
  });
  it('a single unsigned amount column with a running balance takes its sign from the balance', () => {
    const p = parseStatement([['date', 'details', 'amount', 'balance'], ['2026-05-01', 'in', '100', '1100'], ['2026-05-02', 'out', '40', '1060'], ['2026-05-03', 'in', '10', '1070']]);
    expect(p.lines.map((l) => l.amount)).toEqual([100, -40, 10]);
    expect(p.warnings_ar.some((w) => w.includes('حركة الرصيد'))).toBe(true);
  });
  it('accepts {headers, rows}, flags Hijri dates and reports a missing header', () => {
    const p = parseStatement({ headers: ['التاريخ', 'البيان', 'وارد', 'صادر'], rows: [['14/11/1447', 'حوالة', '500', ''], ['2026-06-01', 'سحب', '', '20']] });
    expect(p.lines.map((l) => [l.date, l.dateFlag, l.amount])).toEqual([['', 'hijri', 500], ['2026-06-01', undefined, -20]]);
    expect(p.warnings_ar.some((w) => w.includes('هجري'))).toBe(true);
    const bad = parseStatement([['a', 'b'], ['1', '2']]);
    expect(bad.lines).toEqual([]);
    expect(bad.headerRow).toBe(-1);
    expect(bad.warnings_ar[0]).toContain('صف العناوين');
  });
  it('the line hash is stable across layouts of the same facts, and a re-import adds nothing twice', () => {
    const a = lineHash({ date: '2026-05-02', amount: 1150, description: 'حوالة واردة', reference: 'TRX-1' });
    expect(a).toBe(lineHash({ date: '2026-05-02', amount: 1150.0, description: 'حوالَة  وارِدة', reference: 'trx-1' }));
    expect(a).not.toBe(lineHash({ date: '2026-05-02', amount: 1150, description: 'حوالة واردة', reference: 'TRX-2' }));
    const first = mergeImport(emptyState(), parseStatement(RAJHI), '2026-05-04T08:00:00Z');
    expect([first.added, first.duplicates]).toEqual([4, 0]);
    const again = mergeImport(first.state, parseStatement(RAJHI), '2026-05-05T08:00:00Z');
    expect([again.added, again.duplicates, again.state.lines.length]).toEqual([0, 4, 4]);
    expect(again.state.imports.map((i) => i.duplicates)).toEqual([0, 4]);
    /* a longer export of the same account adds only its new lines */
    const longer = parseStatement([...RAJHI.slice(0, 7), ['٠٤/٠٥/٢٠٢٦', 'إيداع نقدي', 'DEP-1', '', '٩٠', '٤٧٬٥٠٠٫٥٠']]);
    const third = mergeImport(again.state, longer, '2026-05-06T08:00:00Z');
    expect([third.added, third.duplicates]).toEqual([1, 4]);
  });
});

describe('suggestMatches', () => {
  const lines = parseStatement(RAJHI).lines;
  it('reference in the description, exact amount, fee + VAT grouped — each with a confidence and reasons', () => {
    const s = suggestMatches(lines, book, [], { days: 5 });
    const ref = s.find((m) => m.kind === 'reference'), amt = s.find((m) => m.kind === 'amount'), fee = s.find((m) => m.kind === 'fee+vat');
    expect(ref).toMatchObject({ bookIds: ['e1'], confidence: 0.98 });
    expect(ref!.reasons_ar[0]).toContain('INV-1001');
    expect(amt).toMatchObject({ bookIds: ['e2'], amountBank: -800, confidence: 0.9 });
    expect(fee).toMatchObject({ bankIds: [lines[2].id, lines[3].id], amountBank: -40.25, suggestedAccountCode: '6300', confidence: 0.8 });
    expect(s.map((m) => m.confidence)).toEqual([...s.map((m) => m.confidence)].sort((a, b) => b - a));
    expect(s.every((m) => m.id === matchId(m.bankIds, m.bookIds))).toBe(true);
  });
  it('a fee without its VAT twin is a bank-only fee suggestion', () => {
    const s = suggestMatches(lines.slice(0, 3), [], [], {});
    expect(s.map((m) => m.kind)).toEqual(['fee']);
    expect(s[0].bankIds).toEqual([lines[2].id]);
  });
  it('many to one: one POS credit settles several invoices of the window', () => {
    const pos = parseStatement(SNB).lines.filter((l) => l.reference === 'POS-0510');
    const s = suggestMatches(pos, book, [], { days: 5 });
    expect(s).toHaveLength(1);
    expect(s[0]).toMatchObject({ kind: 'many-to-one', bookIds: ['e3', 'e4'], amountBook: 650, diff: 0, confidence: 0.8 });
    expect(s[0].reasons_ar[1]).toContain('INV-1002');
  });
  it('ambiguous amounts lower the confidence; rejected and confirmed suggestions are left out', () => {
    const twins: BookLine[] = [{ id: 'x1', date: '2026-05-03', amount: -800, reference: 'A' }, { id: 'x2', date: '2026-05-03', amount: -800, reference: 'B' }];
    const s = suggestMatches(lines, twins, [], { days: 5 });
    const amb = s.find((m) => m.kind === 'amount')!;
    expect(amb.confidence).toBe(0.7);
    expect(amb.reasons_ar.some((r) => r.includes('قيود بالمبلغ نفسه'))).toBe(true);
    let st = mergeImport(emptyState(), parseStatement(RAJHI), '2026-05-04T08:00:00Z').state;
    st = rejectMatch(st, amb, 'سارة', '2026-05-04T09:00:00Z');
    expect(suggestMatches(lines, twins, [], { days: 5 }, st).some((m) => m.id === amb.id)).toBe(false);
    const ref = suggestMatches(lines, book, [], { days: 5 }).find((m) => m.kind === 'reference')!;
    st = applyConfirmation(st, ref, 'سارة', '2026-05-04T09:01:00Z');
    expect(suggestMatches(lines, book, [], { days: 5 }, st).some((m) => m.bookIds.includes('e1'))).toBe(false);
    /* confirming a second time, or a match that reuses a confirmed line, changes nothing */
    expect(applyConfirmation(st, ref, 'x', '2026-05-04T09:02:00Z')).toBe(st);
    expect(applyConfirmation(st, { ...ref, id: 'other', bookIds: ['e9'] }, 'x', '2026-05-04T09:02:00Z')).toBe(st);
  });
  it('a learned rule applies next time, even when the reference changes, and is strengthened by its next confirmation', () => {
    /* month 1: rent paid, matched by amount, confirmed and learned */
    const may = parseStatement([['التاريخ', 'البيان', 'مدين', 'دائن'], ['05/05/2026', 'حوالة صادرة إيجار المستودع شركة العقار', '12000', '']]).lines;
    const mayBook: BookLine[] = [{ id: 'r1', date: '2026-05-05', amount: -12000, reference: 'RENT-2026-05', memo: 'إيجار المستودع' }];
    let st = mergeImport(emptyState(), { lines: may }, '2026-05-06T00:00:00Z').state;
    const m1 = suggestMatches(may, mayBook, st.rules, { days: 5 }, st)[0];
    expect(m1.kind).toBe('amount');
    st = applyConfirmation(st, m1, 'سارة', '2026-05-06T00:00:00Z');
    st = learnRule(st, m1, mayBook, '2026-05-06T00:00:00Z');
    expect(st.rules).toHaveLength(1);
    expect(st.rules[0]).toMatchObject({ side: 'out', amount: -12000, bookRefPrefix: 'rent', kind: 'recurring', hits: 1 });
    expect(st.rules[0].pattern).toEqual(expect.arrayContaining(['ايجار', 'المستودع']));
    /* month 2: the rent went up and the book entry is dated 9 days away — the plain amount rule would miss it; the learned rule finds it */
    const jun = parseStatement([['التاريخ', 'البيان', 'مدين', 'دائن'], ['05/06/2026', 'حوالة صادرة إيجار المستودع شركة العقار 7781', '12100', '']]).lines;
    const junBook: BookLine[] = [{ id: 'r2', date: '2026-06-09', amount: -12100, reference: 'RENT-2026-06', memo: 'إيجار المستودع' }, { id: 'o9', date: '2026-06-05', amount: -12100, reference: 'PO-9', memo: 'مورد' }];
    st = mergeImport(st, { lines: jun }, '2026-06-10T00:00:00Z').state;
    const m2 = suggestMatches(jun, junBook, st.rules, { days: 5 }, st)[0];
    expect(m2).toMatchObject({ kind: 'rule', bookIds: ['r2'], confidence: 0.95, ruleId: st.rules[0].id });
    expect(m2.reasons_ar[0]).toContain('قاعدة متعلَّمة');
    st = applyConfirmation(st, m2, 'سارة', '2026-06-10T00:00:00Z');
    st = learnRule(st, m2, junBook, '2026-06-10T00:00:00Z');
    expect(st.rules).toHaveLength(1);
    expect(st.rules[0]).toMatchObject({ hits: 2, amount: null });
    /* month 3: the transfer arrived, no entry in the books yet — the rule proposes the posting */
    const jul = parseStatement([['التاريخ', 'البيان', 'مدين', 'دائن'], ['05/07/2026', 'حوالة صادرة إيجار المستودع شركة العقار', '12100', '']]).lines;
    const m3 = suggestMatches(jul, [], st.rules, { days: 5 })[0];
    expect(m3).toMatchObject({ kind: 'rule-post', bookIds: [], ruleId: st.rules[0].id });
    /* a credit with the same words is another side: the rule does not fire */
    const credit = parseStatement([['التاريخ', 'البيان', 'مدين', 'دائن'], ['05/07/2026', 'إيجار المستودع مرتجع', '', '12100']]).lines;
    expect(suggestMatches(credit, [], st.rules, {})).toEqual([]);
  });
  it('is deterministic: the same inputs give the same suggestion ids and order', () => {
    const a = suggestMatches(lines, book, [], { days: 5 }), b = suggestMatches([...lines].reverse(), [...book].reverse(), [], { days: 5 });
    expect(a).toEqual(b);
  });
});

describe('continuous reconciliation state and certification', () => {
  it('counts and ages the unmatched sides and what moved since the last certification', () => {
    let st = mergeImport(emptyState(), parseStatement(RAJHI), '2026-05-04T08:00:00Z').state;
    const s = suggestMatches(st.lines, book, [], { days: 5 });
    st = applyConfirmation(st, s.find((m) => m.kind === 'reference')!, 'سارة', '2026-05-04T09:00:00Z');
    const r = reconState(st, book, { today: '2026-06-15' });
    expect(r.unmatchedBank.map((l) => l.amount)).toEqual([-800, -35, -5.25]);
    expect(r.unmatchedBook.map((k) => k.id)).toEqual(['e2', 'e3', 'e4', 'e5']);
    expect(r.unmatchedBankAmount).toBe(-840.25);
    expect(r.agingBank).toEqual({ d0_7: 0, d8_30: 0, d31_90: 3, d90p: 0, oldest: 43 });
    expect(r.agingBook.d8_30).toBe(1);
    expect(r.lastCertification).toBeNull();
    expect(r.sinceLast).toMatchObject({ certifiedUntil: '', importedLines: 4, confirmed: 1, unmatchedBank: 3, unmatchedBook: 4 });
  });
  it('certify records who/when/evidenceHash/unmatchedCount for the period, replaces a re-certification, and feeds «since last»', () => {
    let st = mergeImport(emptyState(), parseStatement(RAJHI), '2026-05-04T08:00:00Z').state;
    const s = suggestMatches(st.lines, book, [], { days: 5 });
    for (const m of s) st = applyConfirmation(st, m, 'سارة', '2026-05-04T09:00:00Z');
    const c1 = certify(st, '2026-05', 'سارة', '2026-06-01T07:00:00Z', undefined, book);
    expect(c1.certification).toMatchObject({ period: '2026-05', who: 'سارة', ts: '2026-06-01T07:00:00Z', unmatchedCount: 3, matched: 3, range: { start: '2026-05-01', end: '2026-05-31' } });
    expect(c1.certification.evidenceHash).toMatch(/^[0-9a-f]{64}$/);
    /* the same facts give the same evidence hash; a given hash is kept as is */
    expect(certify(st, '2026-05', 'أحمد', '2026-06-02T07:00:00Z', undefined, book).certification.evidenceHash).toBe(c1.certification.evidenceHash);
    expect(certify(st, '2026-05', 'أحمد', '2026-06-02T07:00:00Z', 'abc', book).certification.evidenceHash).toBe('abc');
    const c2 = certify(c1.state, '2026-05', 'أحمد', '2026-06-03T07:00:00Z', undefined, book);
    expect(c2.state.certifications).toHaveLength(1);
    expect(certificationOf(c2.state, '2026-05')!.who).toBe('أحمد');
    expect(certificationOf(c2.state, '2026-04')).toBeNull();
    /* after certification: a June import shows up as «since last», May's open items do not */
    const june = parseStatement([['date', 'details', 'debit', 'credit'], ['2026-06-02', 'POS settlement', '', '300']]);
    const st3 = mergeImport(c2.state, june, '2026-06-03T10:00:00Z').state;
    const r = reconState(st3, [...book, { id: 'j1', date: '2026-06-02', amount: 120 }], { today: '2026-06-10' });
    expect(r.sinceLast).toMatchObject({ certifiedUntil: '2026-05-31', certifiedAt: '2026-06-03T07:00:00Z', importedLines: 1, confirmed: 0, unmatchedBank: 1, unmatchedBook: 1 });
    expect(r.unmatchedBook.map((k) => k.id)).toEqual(['e3', 'e4', 'e5', 'j1']);
  });
});
