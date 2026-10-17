import { describe, expect, it } from 'vitest';
import { detectColumns, emptyMemory, forget, groupEntries, isBalanced, learn, learnReport, linesFor, memoryText, rowsFrom, suggest, teach, tokens, verifyAi } from './entry-learner-engine';

const J = [
  { date: '2026-01-05', ref: 'JV-1', account: '1110', name: 'البنك الأهلي', debit: 1150, memo: 'مبيعات نقدية فرع جدة' },
  { ref: 'JV-1', account: '4000', name: 'إيرادات المبيعات', credit: 1000 },
  { ref: 'JV-1', account: '2200', name: 'ضريبة القيمة المضافة — مخرجات', credit: 150 },
  { date: '2026-01-31', ref: 'JV-2', account: '6200', name: 'مصروف الإيجار', debit: 5000, memo: 'إيجار المستودع شهر يناير' },
  { ref: 'JV-2', account: '1110', name: 'البنك الأهلي', credit: 5000 },
  { date: '2026-02-05', ref: 'JV-3', account: '1110', name: 'البنك الأهلي', debit: 2300, memo: 'مبيعات نقدية فرع الرياض' },
  { ref: 'JV-3', account: '4000', name: 'إيرادات المبيعات', credit: 2000 },
  { ref: 'JV-3', account: '2200', name: 'ضريبة القيمة المضافة — مخرجات', credit: 300 },
  { date: '2026-02-10', ref: 'JV-4', account: '1300', name: 'المخزون', debit: 800, memo: 'شراء لحوم من مؤسسة المراعي آجل' },
  { ref: 'JV-4', account: '1400', name: 'ضريبة القيمة المضافة — مدخلات', debit: 120 },
  { ref: 'JV-4', account: '2100', name: 'الموردون', credit: 920 },
  { date: '2026-02-11', ref: 'JV-5', account: '6100', name: 'الرواتب', debit: 1000, memo: 'غير متزن' },
  { ref: 'JV-5', account: '1110', name: 'البنك الأهلي', credit: 900 },
];

describe('the entry simulator memory', () => {
  it('groups rows into entries and reads Arabic words without their article', () => {
    expect(groupEntries(J).map((e) => e.ref)).toEqual(['JV-1', 'JV-2', 'JV-3', 'JV-4', 'JV-5']);
    expect(tokens('إيجار المستودع لشهر يناير')).toEqual(['ايجار', 'مستودع', 'يناير']);
  });
  it('learns one pattern per shape, with its VAT rate and its book, and leaves unbalanced entries out', () => {
    const m = emptyMemory(), r = learn(m, J, 'قيود 2026');
    expect(r).toMatchObject({ entries: 4, newPatterns: 3, skipped: 1 });
    const sales = m.patterns.find((p) => p.count === 2)!;
    expect(sales.vatRate).toBe(0.15);
    expect(sales.journal).toMatch(/المبيعات/);
    expect(m.patterns.find((p) => p.legs.some((l) => l.account === '2100'))!.journal).toMatch(/المشتريات/);
  });
  it('suggests the entry for a document, VAT split out and balanced, and is sure when the words say so', () => {
    const m = emptyMemory(); learn(m, J);
    const s = suggest(m, { text: 'مبيعات نقدية فرع الدمام', amount: 575 });
    expect(s.status).toBe('sure');
    expect(s.lines).toEqual([{ account: '1110', name: 'البنك الأهلي', debit: 575, credit: 0 }, { account: '2200', name: 'ضريبة القيمة المضافة — مخرجات', debit: 0, credit: 75 }, { account: '4000', name: 'إيرادات المبيعات', debit: 0, credit: 500 }]);
    expect(isBalanced(s.lines)).toBe(true);
    const rent = suggest(m, { text: 'إيجار المستودع فبراير', amount: 5000 });
    expect(rent.lines.map((l) => l.account)).toEqual(['6200', '1110']);
  });
  it('asks when it does not know, and remembers the answer as a rule', () => {
    const m = emptyMemory(); learn(m, J);
    const q = suggest(m, { text: 'فاتورة كهرباء الفرع', amount: 230 });
    expect(suggest(m, { text: 'غرامة مرورية', amount: 300 }).status).toBe('unknown');
    expect(q.status).toBe('unsure');
    expect(q.question).toBeTruthy();
    const rentId = m.patterns.find((p) => p.legs.some((l) => l.account === '6200'))!.id;
    teach(m, { text: 'فاتورة كهرباء الفرع', amount: 230 }, { patternId: rentId });
    const again = suggest(m, { text: 'فاتورة كهرباء الفرع شهر مارس', amount: 410 });
    expect(again).toMatchObject({ status: 'sure', patternId: rentId });
    const own = teach(m, { text: 'سلفة موظف', amount: 1000 }, { title: 'سلفة موظف', legs: [{ account: '1250', name: 'سلف الموظفين', side: 'D', share: 1 }, { account: '1110', name: 'البنك الأهلي', side: 'C', share: 1 }] });
    expect(own.source).toBe('user');
    expect(m.accounts['1250'].name).toBe('سلف الموظفين');
    expect(forget(m, own.id)).toBe(true);
  });
  it('keeps how the finance manager says things are recorded, and gives the AI only known accounts', () => {
    const m = emptyMemory(); learn(m, J);
    const n = learnReport(m, 'تحمل مصروفات الإيجار على مصروف الإيجار شهرياً. ارتفعت المبيعات هذا الربع.', 'تقرير المدير المالي');
    expect(n.notes).toBe(1);
    expect(m.notes[0].accounts).toEqual(['6200']);
    expect(memoryText(m)).toContain('مصروف الإيجار');
    const local = suggest(m, { text: 'مبيعات', amount: 115 });
    const bad = verifyAi(m, { title: 'x', journal: 'y', lines: [{ account: '9999', name: 'مجهول', debit: '115', credit: '0' }, { account: '4000', name: '', debit: '0', credit: '115' }], confidence: 0.95, reason: 'r' }, local);
    expect(bad.status).toBe('unsure');
    expect(bad.unknownAccounts).toEqual(['9999']);
    expect(bad.lines[1].name).toBe('إيرادات المبيعات');
  });
  it('reads a journal file with a single amount column and a side column', () => {
    const head = ['التاريخ', 'رقم القيد', 'رقم الحساب', 'اسم الحساب', 'البيان', 'المبلغ', 'مدين/دائن'];
    const map = detectColumns(head);
    expect(map).toMatchObject({ date: 0, ref: 1, account: 2, name: 3, memo: 4, amount: 5 });
    const rows = rowsFrom([['2026-03-01', '7', '1110', 'البنك', 'تحصيل', '١٬٢٠٠', 'مدين'], ['2026-03-01', '7', '1200', 'العملاء', '', '1,200', 'دائن']], { ...map, side: 6 });
    expect(rows.map((r) => [r.account, r.debit, r.credit])).toEqual([['1110', 1200, 0], ['1200', 0, 1200]]);
    const p = { id: 'x', title: '', journal: '', legs: [{ account: 'a', name: '', side: 'D' as const, share: 1 }, { account: 'b', name: '', side: 'C' as const, share: 0.5 }, { account: 'c', name: '', side: 'C' as const, share: 0.5 }], words: {}, count: 1, confirmed: 0, samples: [], source: 'journal' as const };
    expect(isBalanced(linesFor(p, 100.01))).toBe(true);
  });
});
