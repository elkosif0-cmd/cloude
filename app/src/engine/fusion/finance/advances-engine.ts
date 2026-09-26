/* Advances (السلف والعهد والدفعات المقدمة) — money handed out ahead of the work, the goods or the salary, and money received
   ahead of an order. One record per advance, its instalment schedule, and its repayments; the books follow from the record:
   • an employee advance        Dr سلف الموظفين            / Cr النقدية       — repaid in cash or deducted from the salary;
   • an advance to a supplier   Dr دفعات مقدمة للموردين     / Cr النقدية       — settled against his invoice (Dr الموردون) or refunded;
   • a deposit from a customer  Dr النقدية                  / Cr دفعات مقدمة من العملاء — settled against her invoice (Cr الذمم) or refunded.
   Every entry names the party, so its balance and statement come out of the party ledger like any customer or supplier. */

export type AdvanceKind = 'employee' | 'supplier' | 'customer';
export type RepaymentMethod = 'cash' | 'salary' | 'offset';
export type Repayment = { id: string; date: string; amount: number; method: RepaymentMethod; note?: string };
export type Advance = { id: string; number: string; kind: AdvanceKind; party: string; date: string; amount: number; installments: number;
  firstDue?: string; purpose?: string; repayments: Repayment[]; writtenOff?: boolean };
export type AdvanceAccounts = { cash: string; employee: string; supplier: string; customer: string; payable: string; receivable: string };
export type AdvanceEntry = { id: string; date: string; reference: string; memo: string; party: string; source: string; sourceId: string;
  lines: { accountId: string; debit: number; credit: number; description?: string }[] };

export const KIND_AR: Record<AdvanceKind, string> = { employee: 'سلفة موظف', supplier: 'دفعة مقدمة لمورد', customer: 'عربون من عميل' };
export const METHOD_AR: Record<RepaymentMethod, string> = { cash: 'نقداً', salary: 'خصم من الراتب', offset: 'تسوية مع فاتورة' };

const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const month = (d: string) => String(d).slice(0, 7);
function addMonths(ym: string, n: number) { const [y, m] = ym.split('-').map(Number); const t = new Date(Date.UTC(y, m - 1 + n, 1)); return t.toISOString().slice(0, 7); }

/** Equal monthly instalments from the first due month (the month after the advance by default); the last one takes the rounding. */
export function schedule(a: Advance): { month: string; due: number }[] {
  const n = Math.max(1, Math.floor(a.installments || 1)), first = a.firstDue ? month(a.firstDue) : addMonths(month(a.date), 1), each = r2(a.amount / n);
  return Array.from({ length: n }, (_, i) => ({ month: addMonths(first, i), due: i === n - 1 ? r2(a.amount - each * (n - 1)) : each }));
}

export type AdvanceStatus = { paid: number; balance: number; dueToDate: number; overdue: number; nextDue: { month: string; due: number } | null;
  state: 'open' | 'overdue' | 'settled' | 'written-off'; progress: number; rows: { month: string; due: number; paid: number; left: number }[] };
/** Where the advance stands on a date: paid, balance, what should have been repaid by then, and each instalment filled oldest first. */
export function advanceStatus(a: Advance, asOf: string): AdvanceStatus {
  const paid = r2(a.repayments.filter((p) => p.date <= asOf).reduce((t, p) => t + p.amount, 0));
  const balance = r2(Math.max(0, a.amount - paid));
  let pool = paid;
  const rows = schedule(a).map((s) => { const got = r2(Math.min(s.due, pool)); pool = r2(pool - got); return { month: s.month, due: s.due, paid: got, left: r2(s.due - got) }; });
  const dueToDate = r2(rows.filter((r) => r.month <= month(asOf)).reduce((t, r) => t + r.due, 0));
  const overdue = r2(Math.max(0, dueToDate - paid));
  const next = rows.find((r) => r.left > 0);
  const state = a.writtenOff ? 'written-off' : balance <= 0.004 ? 'settled' : overdue > 0.004 ? 'overdue' : 'open';
  return { paid, balance, dueToDate, overdue, nextDue: next ? { month: next.month, due: next.left } : null, state, progress: a.amount > 0 ? Math.min(1, paid / a.amount) : 1, rows };
}

/** The journal entries of one advance: the advance itself and each repayment (the same ids every time, so re-posting replaces). */
export function advanceEntries(a: Advance, acc: AdvanceAccounts): AdvanceEntry[] {
  const out: AdvanceEntry[] = [], amt = r2(a.amount), ctl = acc[a.kind];
  if (!(amt > 0) || !String(a.party || '').trim()) return out;
  const L = (accountId: string, debit: number, credit: number, description: string) => ({ accountId, debit: r2(debit), credit: r2(credit), description });
  const what = KIND_AR[a.kind] + ' — ' + a.party;
  out.push({ id: 'adv-' + a.id, date: a.date, reference: a.number, memo: what + (a.purpose ? ' (' + a.purpose + ')' : ''), party: a.party, source: 'سلف', sourceId: 'advance:' + a.id,
    lines: a.kind === 'customer' ? [L(acc.cash, amt, 0, what), L(ctl, 0, amt, what)] : [L(ctl, amt, 0, what), L(acc.cash, 0, amt, what)] });
  a.repayments.forEach((p, i) => {
    const v = r2(p.amount); if (!(v > 0)) return;
    const d = (a.kind === 'customer' ? (p.method === 'offset' ? 'تسوية العربون مع فاتورة ' : 'رد العربون إلى ') : p.method === 'salary' ? 'خصم قسط من راتب ' : p.method === 'offset' ? 'تسوية الدفعة مع فاتورة ' : 'سداد من ') + a.party;
    const other = p.method === 'offset' ? (a.kind === 'supplier' ? acc.payable : acc.receivable) : acc.cash;
    out.push({ id: 'adv-' + a.id + '-r' + (i + 1), date: p.date, reference: a.number + '/' + (i + 1), memo: d + (p.note ? ' — ' + p.note : ''), party: a.party, source: 'سلف', sourceId: 'advance:' + a.id + ':r' + (i + 1),
      lines: a.kind === 'customer' ? [L(ctl, v, 0, d), L(other, 0, v, d)] : [L(other, v, 0, d), L(ctl, 0, v, d)] });
  });
  return out;
}

/** The register's totals: per kind, per party, and what is overdue. */
export function advancesSummary(list: Advance[], asOf: string) {
  const kinds: Record<AdvanceKind, { count: number; given: number; balance: number; overdue: number }> = {
    employee: { count: 0, given: 0, balance: 0, overdue: 0 }, supplier: { count: 0, given: 0, balance: 0, overdue: 0 }, customer: { count: 0, given: 0, balance: 0, overdue: 0 } };
  const parties = new Map<string, { party: string; kind: AdvanceKind; balance: number; overdue: number; count: number }>();
  let overdueCount = 0;
  for (const a of list) {
    const s = advanceStatus(a, asOf), k = kinds[a.kind];
    k.count++; k.given = r2(k.given + a.amount); if (!a.writtenOff) { k.balance = r2(k.balance + s.balance); k.overdue = r2(k.overdue + s.overdue); }
    if (s.state === 'overdue') overdueCount++;
    const key = a.kind + '|' + a.party, p = parties.get(key) ?? { party: a.party, kind: a.kind, balance: 0, overdue: 0, count: 0 };
    p.count++; if (!a.writtenOff) { p.balance = r2(p.balance + s.balance); p.overdue = r2(p.overdue + s.overdue); } parties.set(key, p);
  }
  return { kinds, parties: [...parties.values()].sort((x, y) => y.balance - x.balance), overdueCount, open: list.filter((a) => advanceStatus(a, asOf).balance > 0.004 && !a.writtenOff).length };
}

/** Checks before saving: what makes an advance unusable or suspicious. */
export function validateAdvance(a: Advance, others: Advance[] = []): string[] {
  const out: string[] = [];
  if (!String(a.party || '').trim()) out.push('اسم الطرف مطلوب');
  if (!(a.amount > 0)) out.push('المبلغ يجب أن يكون أكبر من صفر');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(a.date)) out.push('التاريخ غير صالح');
  const paid = a.repayments.reduce((t, p) => t + p.amount, 0);
  if (paid - a.amount > 0.004) out.push('المسدد (' + r2(paid) + ') أكبر من السلفة (' + r2(a.amount) + ')');
  if (a.repayments.some((p) => p.date < a.date)) out.push('سداد بتاريخ قبل السلفة');
  if (a.kind === 'employee' && others.some((o) => o.id !== a.id && o.kind === 'employee' && o.party === a.party && !o.writtenOff && o.amount - o.repayments.reduce((t, p) => t + p.amount, 0) > 0.004))
    out.push('للموظف سلفة أخرى مفتوحة — تأكد قبل صرف سلفة جديدة');
  return out;
}
