import { describe, expect, it } from 'vitest';
import { bankReconciliationStatement, bookCashLines, matchBankLines, type BankLine } from './bank-reconciliation-engine';

const entries = [
  { id: 'e1', date: '2026-05-01', reference: 'RCV-1', lines: [{ accountId: 'cash', debit: 1150, credit: 0 }, { accountId: 'ar', debit: 0, credit: 1150 }] },
  { id: 'e2', date: '2026-05-03', reference: 'CHQ-9', lines: [{ accountId: 'ap', debit: 800, credit: 0 }, { accountId: 'cash', debit: 0, credit: 800 }] },
  { id: 'e3', date: '2026-05-30', reference: 'RCV-2', lines: [{ accountId: 'cash', debit: 400, credit: 0 }, { accountId: 'ar', debit: 0, credit: 400 }] },
  { id: 'e4', date: '2026-05-29', reference: 'CHQ-10', lines: [{ accountId: 'ap', debit: 250, credit: 0 }, { accountId: 'cash', debit: 0, credit: 250 }] },
  { id: 'e5', date: '2026-05-02', lines: [{ accountId: 'rev', debit: 0, credit: 10 }, { accountId: 'ar', debit: 10, credit: 0 }] },
];
const bank: BankLine[] = [
  { id: 'b1', date: '2026-05-02', amount: 1150, description: 'حوالة واردة' },
  { id: 'b2', date: '2026-05-06', amount: -800, description: 'شيك', reference: 'chq-9' },
  { id: 'b3', date: '2026-05-31', amount: -35, description: 'رسوم بنكية' },
  { id: 'b4', date: '2026-05-20', amount: 60, description: 'أرباح حساب' },
];

describe('bank reconciliation', () => {
  it('reads the cash account one line per entry, money in positive', () => {
    expect(bookCashLines(entries, 'cash').map((l) => [l.id, l.amount])).toEqual([['e1', 1150], ['e2', -800], ['e4', -250], ['e3', 400]]);
  });

  it('matches exact amounts within the window and leaves the rest on each side', () => {
    const r = matchBankLines(bank, bookCashLines(entries, 'cash'), { days: 5 });
    expect(r.matches.map((m) => [m.bankId, m.bookId])).toEqual([['b1', 'e1'], ['b2', 'e2']]);
    expect(r.unmatchedBank.map((b) => b.id)).toEqual(['b3', 'b4']);
    expect(r.unmatchedBook.map((b) => b.id)).toEqual(['e4', 'e3']);
  });

  it('never matches outside the window, and a manual pair always wins', () => {
    const late = [{ id: 'bx', date: '2026-05-20', amount: 1150 }];
    expect(matchBankLines(late, bookCashLines(entries, 'cash'), { days: 5 }).matches).toEqual([]);
    expect(matchBankLines(late, bookCashLines(entries, 'cash'), { days: 5, manual: [{ bankId: 'bx', bookId: 'e1' }] }).matches[0]).toMatchObject({ bookId: 'e1', manual: true, days: 19 });
  });

  it('draws up a statement that reconciles', () => {
    const r = matchBankLines(bank, bookCashLines(entries, 'cash'));
    // books: 1150 − 800 − 250 + 400 = 500; bank: 1150 − 800 − 35 + 60 = 375
    const s = bankReconciliationStatement({ statementBalance: 375, bookBalance: 500, unmatchedBank: r.unmatchedBank, unmatchedBook: r.unmatchedBook });
    expect(s).toMatchObject({ depositsInTransit: 400, outstandingPayments: 250, bankOnlyIn: 60, bankOnlyOut: 35, adjustedBank: 525, adjustedBook: 525, difference: 0, reconciled: true });
    expect(bankReconciliationStatement({ statementBalance: 370, bookBalance: 500, unmatchedBank: r.unmatchedBank, unmatchedBook: r.unmatchedBook }).difference).toBe(-5);
  });
});
