import { describe, expect, it } from 'vitest';
import { accountKind, describe as describeModel, extract, learn, parseJournal, remember, suggest, tokens, type JLine } from './journal-sim-engine';

/* a small company's year: rent from the bank, meat bought on credit with VAT, cash sales with VAT, salaries */
function journal(): JLine[] {
  const L: JLine[] = [];
  let n = 0;
  const e = (date: string, memo: string, party: string, rows: [string, string, number, number][]) => { n++; rows.forEach(([code, name, d, c]) => L.push({ entry: 'JE' + n, date, code, name, debit: d, credit: c, memo, party })); };
  for (let m = 1; m <= 12; m++) {
    const mm = String(m).padStart(2, '0');
    e('2025-' + mm + '-01', 'سداد إيجار المحل لشهر ' + m, 'مكتب العقار', [['5100', 'مصروف الإيجار', 5000, 0], ['1110', 'البنك الأهلي', 0, 5000]]);
    e('2025-' + mm + '-05', 'فاتورة شراء لحوم طازجة', 'مؤسسة المراعي الذهبية', [['1300', 'المخزون', 10000 + m * 100, 0], ['1410', 'ضريبة المدخلات', (10000 + m * 100) * 0.15, 0], ['2100', 'الموردون', 0, (10000 + m * 100) * 1.15]]);
    e('2025-' + mm + '-15', 'مبيعات نقدية للمعرض', '', [['1100', 'الصندوق', 23000, 0], ['4100', 'المبيعات', 0, 20000], ['2310', 'ضريبة المخرجات', 0, 3000]]);
    e('2025-' + mm + '-28', 'رواتب الموظفين', '', [['5200', 'الرواتب والأجور', 30000, 0], ['1110', 'البنك الأهلي', 0, 30000]]);
  }
  return L;
}

describe('journal simulator', () => {
  const model = learn(journal());

  it('learns the accounts, what they are for, and the booking patterns', () => {
    expect(model.entries).toBe(48);
    expect(model.unbalanced).toEqual([]);
    expect(model.patterns).toHaveLength(4);
    const kinds = Object.fromEntries(model.accounts.map(a => [a.code, a.kind]));
    expect(kinds).toMatchObject({ '1110': 'bank', '1100': 'cash', '1300': 'inventory', '1410': 'vat_in', '2100': 'payable', '2310': 'vat_out', '4100': 'revenue', '5100': 'expense', '5200': 'payroll' });
    const buy = model.patterns.find(p => p.sig === 'D:1300+1410|C:2100')!;
    expect(buy.book).toBe('purchases');
    expect(buy.vat).toBe(true);
    expect(buy.parties).toContain('مؤسسة المراعي الذهبية');
    expect(model.patterns.find(p => p.sig.includes('4100'))!.book).toBe('sales');
    expect(model.recurring.length).toBe(4);
  });

  it('suggests a purchase invoice with VAT split and the supplier on credit', () => {
    const s = suggest(model, { text: 'فاتورة ضريبية — المورد: مؤسسة المراعي الذهبية\nشراء لحوم طازجة\nالإجمالي شامل الضريبة 11,500' });
    expect(s.sig).toBe('D:1300+1410|C:2100');
    expect(s.confidence).toBeGreaterThan(0.6);
    expect(s.lines).toEqual([
      { code: '1300', name: 'المخزون', debit: 10000, credit: 0 },
      { code: '1410', name: 'ضريبة المدخلات', debit: 1500, credit: 0 },
      { code: '2100', name: 'الموردون', debit: 0, credit: 11500 }
    ]);
    expect(s.where).toContain('دفتر المشتريات');
    expect(s.steps.some(x => x.includes('فاتورة ضريبية'))).toBe(true);
  });

  it('follows the payment: the same purchase paid in cash credits the cash box', () => {
    const s = suggest(model, { text: 'شراء لحوم طازجة من مؤسسة المراعي الذهبية 1150 شامل الضريبة', method: 'cash' });
    expect(s.lines.find(l => l.credit)!.code).toBe('1100');
  });

  it('reads the monthly rent', () => {
    const s = suggest(model, { text: 'سداد إيجار المحل لشهر مارس — 5000 ريال تحويل بنكي' });
    expect(s.sig).toBe('D:5100|C:1110');
    expect(s.lines).toEqual([{ code: '5100', name: 'مصروف الإيجار', debit: 5000, credit: 0 }, { code: '1110', name: 'البنك الأهلي', debit: 0, credit: 5000 }]);
    expect(s.steps.some(x => x.includes('متكرر'))).toBe(true);
  });

  it('asks when it is not sure, and asks for what is missing', () => {
    const s = suggest(model, { text: 'مستند رقم 44' });
    expect(s.confidence).toBeLessThan(0.55);
    expect(s.questions.map(q => q.id)).toContain('amount');
    const k = s.questions.find(q => q.id === 'kind');
    if (s.sig) expect(k?.options?.length).toBeGreaterThan(0);
    const v = suggest(model, { text: 'فاتورة شراء لحوم مؤسسة المراعي الذهبية المبلغ 2300', vat: 'unknown' });
    expect(v.questions.map(q => q.id)).toContain('vat');
  });

  it('remembers what the accountant confirmed and weighs it first', () => {
    const doc = { text: 'فاتورة صيانة ثلاجات العرض من شركة التبريد المتقدمة 2300', party: 'شركة التبريد المتقدمة' };
    const before = suggest(model, doc);
    const mem = remember({ examples: [] }, doc, { sig: '', label: 'مصروف صيانة ← الموردون', book: 'purchases', lines: [
      { code: '5300', name: 'مصروف الصيانة', debit: 2000, credit: 0 }, { code: '1410', name: 'ضريبة المدخلات', debit: 300, credit: 0 }, { code: '2100', name: 'الموردون', debit: 0, credit: 2300 }] }, model, '2026-01-10T00:00:00Z');
    expect(mem.examples).toHaveLength(1);
    const after = suggest(model, { text: 'فاتورة صيانة ثلاجات من شركة التبريد المتقدمة 4600 شامل', party: 'شركة التبريد المتقدمة' }, mem);
    expect(after.source).toBe('memory');
    expect(after.confidence).toBeGreaterThan(before.confidence);
    expect(after.lines.find(l => l.code === '5300')!.debit).toBe(4000);
    expect(after.lines.find(l => l.code === '1410')!.debit).toBe(600);
  });

  it('tells a purchase invoice from a payment to the same supplier', () => {
    const L = journal();
    ['2025-02-20', '2025-03-20'].forEach((d, i) => { L.push({ entry: 'PAY' + i, date: d, code: '2100', name: 'الموردون', debit: 11500, credit: 0, memo: 'سداد مؤسسة المراعي الذهبية', party: 'مؤسسة المراعي الذهبية' }, { entry: 'PAY' + i, date: d, code: '1110', name: 'البنك الأهلي', debit: 0, credit: 11500, memo: 'سداد مؤسسة المراعي الذهبية', party: 'مؤسسة المراعي الذهبية' }); });
    const m = learn(L);
    expect(suggest(m, { text: 'فاتورة ضريبية من مؤسسة المراعي الذهبية — استلام لحوم — الإجمالي 5,750 شامل الضريبة' }).sig).toBe('D:1300+1410|C:2100');
    const pay = suggest(m, { text: 'سند صرف: سداد مؤسسة المراعي الذهبية 5000 تحويل بنكي' });
    expect(pay.sig).toBe('D:2100|C:1110');
    expect(pay.extracted.party).toBe('مؤسسة المراعي الذهبية');
  });

  it('reads documents and journal sheets', () => {
    const x = extract('Tax invoice\nSupplier: Cold Chain Co.\nDate: 12/03/2026\nVAT 15%: 150.00\nTotal amount due: 1,150.00\nPaid by bank transfer');
    expect(x).toMatchObject({ amount: 1150, vatAmount: 150, date: '2026-03-12', method: 'bank', vat: 'incl' });
    expect(x.party).toContain('Cold Chain');
    expect(extract('فاتورة كهرباء شركة الكهرباء السعودية لشهر أغسطس المبلغ 1,725 شامل الضريبة — تسدد من البنك').party).toBe('شركة الكهرباء السعودية');
    const p = parseJournal([['رقم القيد', 'التاريخ', 'رمز الحساب', 'اسم الحساب', 'مدين', 'دائن', 'البيان'], ['1', '2026-01-02', '5100', 'مصروف الإيجار', '5,000', '', 'إيجار'], ['1', '2026-01-02', '1110', 'البنك', '', '5000', 'إيجار']]);
    expect(p.issues).toEqual([]);
    expect(p.lines).toHaveLength(2);
    expect(p.lines[1]).toMatchObject({ entry: '1', code: '1110', credit: 5000 });
    expect(accountKind('2310', 'VAT payable')).toBe('vat_out');
    expect(tokens('بالمبيعات النقدية للمعرض')).toEqual(['مبيعات', 'نقديه', 'معرض']);
    expect(describeModel(model)).toContain('أنماط التسجيل');
  });
});
