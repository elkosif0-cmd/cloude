/* the education pack (FOUNDATION §3.6 «المدارس»): a term's fees billed in advance to the parents and earned month by month
   as the term is taught (IFRS 15 over time: deferred 2410 → revenue 4090), scholarships and sibling discounts (5160), a
   withdrawn student's unearned fees credited back, collections, and the KPIs a school is judged by (collection rate,
   revenue per student). VAT follows the student, as for private healthcare: in Saudi Arabia a citizen's private
   education carries VAT borne by the state (invoiced at 0%), a resident's the standard rate; in Egypt educational
   services are exempt. A term's state is read back from the entries it posted. Money is in halalas. */

export type TuitionAccounts = { receivableAccountId: string; cashAccountId: string; deferredAccountId: string; revenueAccountId: string; discountAccountId: string; outputVatAccountId?: string };
export type StudentCategory = 'citizen' | 'resident';
export type TuitionVat = 'standard' | 'state-borne' | 'exempt' | 'none';
export type Term = { id: string; label: string; startMonth: string; months: number; feeHalalas: number; citizens: number; residents: number };
/** what a term's entries add up to: fee amounts are before VAT; `open` is what the parents still owe, VAT included */
export type TermState = { recognisedMonths: string[]; recognisedHalalas: number; discountHalalas: number; creditedHalalas: number;
  withdrawnCitizens: number; withdrawnResidents: number; collectedHalalas: number; openHalalas: number };
type Vat = { country?: string; policyRate?: number };

const sar = (h: number) => h / 100;
const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;
const addMonths = (m: string, n: number) => { const [y, mo] = m.split('-').map(Number); const t = y * 12 + (mo - 1) + n; return Math.floor(t / 12) + '-' + String((t % 12) + 1).padStart(2, '0'); };
export const emptyTermState = (): TermState => ({ recognisedMonths: [], recognisedHalalas: 0, discountHalalas: 0, creditedHalalas: 0, withdrawnCitizens: 0, withdrawnResidents: 0, collectedHalalas: 0, openHalalas: 0 });

export function tuitionVat(o: Vat & { category: StudentCategory }): { treatment: TuitionVat; rate: number } {
  const rate = Number(o.policyRate) > 0 ? Number(o.policyRate) : 0, country = String(o.country || '').toUpperCase();
  if (!rate) return { treatment: 'none', rate: 0 };
  if (country === 'EG') return { treatment: 'exempt', rate: 0 };
  if (country === 'SA' && o.category === 'citizen') return { treatment: 'state-borne', rate: 0 };
  return { treatment: 'standard', rate };
}

function check(t: Term) {
  if (!String(t.label || '').trim()) throw new Error('سمِّ الفصل الدراسي');
  if (!MONTH.test(t.startMonth)) throw new Error('شهر بداية الفصل غير صالح');
  if (!Number.isInteger(t.months) || t.months < 1 || t.months > 12) throw new Error('مدة الفصل بين شهر و12 شهراً');
  if (!Number.isInteger(t.feeHalalas) || t.feeHalalas <= 0) throw new Error('رسوم الطالب للفصل يجب أن تكون أكبر من صفر');
  for (const n of [t.citizens, t.residents]) if (!Number.isInteger(n) || n < 0) throw new Error('عدد الطلاب غير صالح');
  if (t.citizens + t.residents <= 0) throw new Error('لا طلاب في الفصل');
}

/** the months a term is taught */
export const termMonths = (t: Term) => { check(t); return Array.from({ length: t.months }, (_, i) => addMonths(t.startMonth, i)); };
/** the term's fees still to be earned: billed, less discounts and credits, less what is already revenue */
export const deferredLeft = (t: Term, s: TermState) => (t.citizens + t.residents) * t.feeHalalas - s.discountHalalas - s.creditedHalalas - s.recognisedHalalas;

/** the term billed in advance: each category's fees with its own VAT, all deferred until taught */
export function termInvoiceJournal(t: Term, x: Vat & { id: string; date: string }, a: TuitionAccounts) {
  check(t);
  const parts = (['citizen', 'resident'] as StudentCategory[]).map((category) => {
    const n = category === 'citizen' ? t.citizens : t.residents, fees = n * t.feeHalalas, v = tuitionVat({ ...x, category });
    return { category, students: n, fees, vat: Math.round(fees * v.rate), treatment: v.treatment };
  }).filter((p) => p.students);
  const fees = parts.reduce((s, p) => s + p.fees, 0), vat = parts.reduce((s, p) => s + p.vat, 0);
  if (vat && !a.outputVatAccountId) throw new Error('حساب ضريبة المخرجات غير موجود');
  return { fees, vat, parts, journal: { id: x.id, date: x.date, reference: 'FEES-' + t.id, memo: 'فوترة رسوم ' + t.label + ' — ' + (t.citizens + t.residents) + ' طالب', party: t.label, lines: [
    { accountId: a.receivableAccountId, debit: sar(fees + vat), credit: 0, description: 'أولياء الأمور — ' + t.label },
    { accountId: a.deferredAccountId, debit: 0, credit: sar(fees), description: 'رسوم مقبوضة مقدماً — ' + t.label },
    ...(vat ? [{ accountId: a.outputVatAccountId as string, debit: 0, credit: sar(vat), description: 'ضريبة رسوم غير السعوديين' }] : []),
  ] } };
}

/** the months taught up to `throughMonth` and not yet recognised: what is left deferred is spread over the months left, so a
    discount or a withdrawal during the term lowers the months after it, and the last month takes the remainder */
export function recognitionJournal(t: Term, s: TermState, throughMonth: string, x: { id: string; date: string }, a: TuitionAccounts) {
  if (!MONTH.test(throughMonth)) throw new Error('الشهر غير صالح');
  const done = new Set(s.recognisedMonths), left = termMonths(t).filter((m) => !done.has(m)), due = left.filter((m) => m <= throughMonth);
  if (!due.length) throw new Error('لا أشهر مستحقة الاعتراف حتى ' + throughMonth);
  const remaining = deferredLeft(t, s), amount = due.length === left.length ? remaining : Math.floor(remaining / left.length) * due.length;
  return { months: due, amount, journal: { id: x.id, date: x.date, reference: 'EARN-' + t.id + '-' + throughMonth, memo: 'الاعتراف بإيراد رسوم ' + t.label + ' — ' + due.join('، '), lines: [
    { accountId: a.deferredAccountId, debit: sar(amount), credit: 0, description: t.label },
    { accountId: a.revenueAccountId, debit: 0, credit: sar(amount), description: 'إيرادات الرسوم — ' + t.label },
  ] } };
}

/** a scholarship or sibling discount on fees not yet earned: an expense of the school, a lower bill for the parents (a
    resident's discount takes its VAT with it), and less left deferred */
export function discountJournal(t: Term, s: TermState, x: Vat & { id: string; date: string; category: StudentCategory; amountHalalas: number; reason: string }, a: TuitionAccounts) {
  check(t);
  if (!Number.isInteger(x.amountHalalas) || x.amountHalalas <= 0) throw new Error('قيمة المنحة أو الخصم يجب أن تكون أكبر من صفر');
  if (!String(x.reason || '').trim()) throw new Error('سبب المنحة أو الخصم مطلوب');
  if (x.amountHalalas > deferredLeft(t, s)) throw new Error('الخصم يتجاوز رسوم الفصل التي لم تُكتسب بعد');
  const vat = Math.round(x.amountHalalas * tuitionVat({ ...x }).rate);
  if (vat && !a.outputVatAccountId) throw new Error('حساب ضريبة المخرجات غير موجود');
  return { vat, journal: { id: x.id, date: x.date, reference: 'GRANT-' + t.id, memo: 'منحة/خصم — ' + t.label + ': ' + x.reason.trim(), party: t.label, lines: [
    { accountId: a.deferredAccountId, debit: sar(x.amountHalalas), credit: 0, description: 'رسوم لن تُكتسب — ' + x.reason.trim() },
    ...(vat ? [{ accountId: a.outputVatAccountId as string, debit: sar(vat), credit: 0, description: 'ضريبة الخصم' }] : []),
    { accountId: a.receivableAccountId, debit: 0, credit: sar(x.amountHalalas + vat), description: 'أولياء الأمور — ' + t.label },
    { accountId: a.discountAccountId, debit: sar(x.amountHalalas), credit: 0, description: x.reason.trim() },
    { accountId: a.revenueAccountId, debit: 0, credit: sar(x.amountHalalas), description: 'إجمالي الرسوم قبل المنحة' },
  ] } };
}

/** students who withdraw: the fees of the months not yet taught are credited back (a credit note), with their VAT */
export function withdrawalJournal(t: Term, s: TermState, x: Vat & { id: string; date: string; category: StudentCategory; students: number; fromMonth: string }, a: TuitionAccounts) {
  const all = termMonths(t);
  if (!Number.isInteger(x.students) || x.students <= 0) throw new Error('عدد الطلاب المنسحبين غير صالح');
  const enrolled = x.category === 'citizen' ? t.citizens - s.withdrawnCitizens : t.residents - s.withdrawnResidents;
  if (x.students > enrolled) throw new Error('المنسحبون أكثر من المسجلين في هذه الفئة');
  if (!MONTH.test(x.fromMonth) || !all.includes(x.fromMonth)) throw new Error('شهر الانسحاب خارج الفصل');
  if (s.recognisedMonths.includes(x.fromMonth)) throw new Error('شهر الانسحاب اعتُرف بإيراده — الانسحاب من الشهر التالي');
  const unearned = all.filter((m) => m >= x.fromMonth).length, credit = Math.min(deferredLeft(t, s), Math.round((x.students * t.feeHalalas * unearned) / t.months));
  const vat = Math.round(credit * tuitionVat({ ...x }).rate);
  if (vat && !a.outputVatAccountId) throw new Error('حساب ضريبة المخرجات غير موجود');
  return { credit, vat, months: unearned, journal: { id: x.id, date: x.date, reference: 'CN-' + t.id, memo: 'انسحاب ' + x.students + ' طالب من ' + t.label + ' — إشعار دائن عن ' + unearned + ' شهر', party: t.label, lines: [
    { accountId: a.deferredAccountId, debit: sar(credit), credit: 0, description: 'رسوم لم تُكتسب' },
    ...(vat ? [{ accountId: a.outputVatAccountId as string, debit: sar(vat), credit: 0, description: 'ضريبة الإشعار الدائن' }] : []),
    { accountId: a.receivableAccountId, debit: 0, credit: sar(credit + vat), description: 'أولياء الأمور — ' + t.label },
  ] } };
}

/** fees collected from the parents, never more than they owe for the term */
export function collectionJournal(t: Term, s: TermState, x: { id: string; date: string; amountHalalas: number }, a: TuitionAccounts) {
  if (!Number.isInteger(x.amountHalalas) || x.amountHalalas <= 0) throw new Error('مبلغ التحصيل يجب أن يكون أكبر من صفر');
  if (x.amountHalalas > s.openHalalas) throw new Error('التحصيل يتجاوز المستحق على أولياء أمور ' + t.label);
  return { journal: { id: x.id, date: x.date, reference: 'COL-' + t.id, memo: 'تحصيل رسوم — ' + t.label, party: t.label, lines: [
    { accountId: a.cashAccountId, debit: sar(x.amountHalalas), credit: 0, description: t.label },
    { accountId: a.receivableAccountId, debit: 0, credit: sar(x.amountHalalas), description: 'أولياء الأمور — ' + t.label },
  ] } };
}

/** a term's figures: students enrolled, earned, deferred left, collected, open, collection rate, revenue per student */
export function termSummary(t: Term, s: TermState) {
  const students = t.citizens + t.residents - s.withdrawnCitizens - s.withdrawnResidents, r2 = (v: number) => Math.round(v * 100) / 100;
  const due = s.collectedHalalas + s.openHalalas;
  return { students, gross: (t.citizens + t.residents) * t.feeHalalas, discounts: s.discountHalalas, credited: s.creditedHalalas, earned: s.recognisedHalalas,
    deferred: deferredLeft(t, s), collected: s.collectedHalalas, open: s.openHalalas, collectionPct: due > 0 ? r2((s.collectedHalalas / due) * 100) : null,
    revenuePerStudent: students ? Math.round(s.recognisedHalalas / students) : null };
}
