import { describe, expect, it } from 'vitest';
import { advanceEntries, advancesSummary, advanceStatus, schedule, validateAdvance, type Advance } from './advances-engine';
import { validateJournalEntry } from './ledger-engine';

const acc = { cash: 'a1100', employee: 'a1150', supplier: 'a1160', customer: 'a2150', payable: 'a2100', receivable: 'a1200' };
const emp: Advance = { id: 'x1', number: 'ADV-001', kind: 'employee', party: 'سالم المطيري', date: '2026-03-10', amount: 3000, installments: 3,
  repayments: [{ id: 'p1', date: '2026-04-27', amount: 1000, method: 'salary' }] };

describe('advances', () => {
  it('schedules equal instalments from the month after, the last one taking the rounding', () => {
    expect(schedule(emp)).toEqual([{ month: '2026-04', due: 1000 }, { month: '2026-05', due: 1000 }, { month: '2026-06', due: 1000 }]);
    expect(schedule({ ...emp, amount: 1000, installments: 3 }).map((s) => s.due)).toEqual([333.33, 333.33, 333.34]);
    expect(schedule({ ...emp, firstDue: '2026-07-01' })[0].month).toBe('2026-07');
  });

  it('knows what is paid, what should have been, and what is overdue', () => {
    const s = advanceStatus(emp, '2026-06-15');
    expect(s.paid).toBe(1000);
    expect(s.balance).toBe(2000);
    expect(s.dueToDate).toBe(3000);
    expect(s.overdue).toBe(2000);
    expect(s.state).toBe('overdue');
    expect(s.rows.map((r) => r.left)).toEqual([0, 1000, 1000]);
    expect(advanceStatus(emp, '2026-04-30').state).toBe('open');
    const done = { ...emp, repayments: [...emp.repayments, { id: 'p2', date: '2026-05-27', amount: 2000, method: 'cash' as const }] };
    expect(advanceStatus(done, '2026-06-15').state).toBe('settled');
  });

  it('posts balanced entries naming the party, for each kind and method', () => {
    const e = advanceEntries(emp, acc);
    expect(e).toHaveLength(2);
    expect(e[0].lines).toEqual([expect.objectContaining({ accountId: 'a1150', debit: 3000 }), expect.objectContaining({ accountId: 'a1100', credit: 3000 })]);
    expect(e[1].lines[0]).toMatchObject({ accountId: 'a1100', debit: 1000 });
    expect(e.every((x) => x.party === 'سالم المطيري' && validateJournalEntry(x as never).valid)).toBe(true);
    const sup = advanceEntries({ ...emp, id: 'x2', kind: 'supplier', party: 'مؤسسة المراعي', repayments: [{ id: 'q', date: '2026-04-01', amount: 3000, method: 'offset' }] }, acc);
    expect(sup[1].lines).toEqual([expect.objectContaining({ accountId: 'a2100', debit: 3000 }), expect.objectContaining({ accountId: 'a1160', credit: 3000 })]);
    const cus = advanceEntries({ ...emp, id: 'x3', kind: 'customer', party: 'مطعم الديرة', repayments: [{ id: 'q', date: '2026-04-01', amount: 500, method: 'offset' }] }, acc);
    expect(cus[0].lines[0]).toMatchObject({ accountId: 'a1100', debit: 3000 });
    expect(cus[1].lines).toEqual([expect.objectContaining({ accountId: 'a2150', debit: 500 }), expect.objectContaining({ accountId: 'a1200', credit: 500 })]);
    expect(advanceEntries({ ...emp, party: '' }, acc)).toEqual([]);
  });

  it('sums the register and validates before saving', () => {
    const sum = advancesSummary([emp, { ...emp, id: 'x2', party: 'منيرة', repayments: [] }], '2026-06-15');
    expect(sum.kinds.employee).toMatchObject({ count: 2, given: 6000, balance: 5000 });
    expect(sum.overdueCount).toBe(2);
    expect(sum.parties[0].party).toBe('منيرة');
    expect(validateAdvance({ ...emp, amount: 0, party: '', repayments: [] })).toHaveLength(2);
    expect(validateAdvance({ ...emp, repayments: [{ id: 'p', date: '2026-03-01', amount: 5000, method: 'cash' }] })).toHaveLength(2);
    expect(validateAdvance({ ...emp, id: 'new' }, [emp])[0]).toContain('سلفة أخرى مفتوحة');
  });
});
