import { describe, expect, it } from 'vitest';
import { validateJournalEntry } from './ledger-engine';
import { buildSettlementEntry, partyBalances, partyStatement, type PartyEntry } from './party-ledger-engine';

const sale = (id: string, date: string, party: string, amount: number): PartyEntry => ({
  id, date, party, reference: id,
  lines: [{ accountId: 'ar', debit: amount, credit: 0 }, { accountId: 'rev', debit: 0, credit: amount }],
});
const collect = (id: string, date: string, party: string, amount: number) =>
  buildSettlementEntry({ id, date, kind: 'collection', party, amount, cashAccountId: 'cash', controlAccountId: 'ar' });

describe('customers and suppliers from the books', () => {
  const entries: PartyEntry[] = [
    sale('s1', '2026-01-10', 'مطعم الوادي', 1000),
    sale('s2', '2026-02-20', 'مطعم الوادي', 500),
    collect('c1', '2026-03-01', 'مطعم الوادي', 1200),
    sale('s3', '2026-03-05', 'فندق النخيل', 300),
    { id: 'sum', date: '2026-03-31', lines: [{ accountId: 'ar', debit: 50, credit: 0 }, { accountId: 'rev', debit: 0, credit: 50 }] },
  ];

  it('settles the oldest charges first and ages what is left', () => {
    const r = partyBalances(entries, 'ar', 'debit', '2026-04-15');
    const wadi = r.rows.find((x) => x.party === 'مطعم الوادي')!;
    expect(wadi).toMatchObject({ balance: 300, charged: 1500, settled: 1200, oldestOpen: '2026-02-20' });
    expect(wadi.aging['31-60']).toBe(300);
    expect(r.rows.find((x) => x.party === 'فندق النخيل')!.aging['31-60']).toBe(300);
    expect(r.balance).toBe(600);
    expect(r.unassigned).toBe(50);
  });

  it('applies credit terms before a charge falls due', () => {
    const r = partyBalances(entries, 'ar', 'debit', '2026-04-15', 60);
    expect(r.totals.current).toBe(600);
  });

  it('carries an advance payment into later charges', () => {
    const r = partyBalances([collect('c0', '2026-01-01', 'عميل', 100), sale('s', '2026-01-05', 'عميل', 250)], 'ar', 'debit', '2026-01-06');
    expect(r.rows[0].balance).toBe(150);
    expect(r.rows[0].aging['1-30']).toBe(150);
  });

  it('reads supplier balances on the credit side', () => {
    const bill: PartyEntry = { id: 'b', date: '2026-01-01', party: 'مسلخ', lines: [{ accountId: 'inv', debit: 800, credit: 0 }, { accountId: 'ap', debit: 0, credit: 800 }] };
    const pay = buildSettlementEntry({ id: 'p', date: '2026-01-20', kind: 'payment', party: 'مسلخ', amount: 500, cashAccountId: 'cash', controlAccountId: 'ap' });
    expect(validateJournalEntry(pay).valid).toBe(true);
    expect(pay.lines[0]).toMatchObject({ accountId: 'ap', debit: 500 });
    expect(partyBalances([bill, pay], 'ap', 'credit', '2026-02-01').rows[0].balance).toBe(300);
  });

  it('prints a statement with the running balance', () => {
    expect(partyStatement(entries, 'ar', 'debit', 'مطعم الوادي').map((l) => [l.charge, l.settlement, l.balance])).toEqual([[1000, 0, 1000], [500, 0, 1500], [0, 1200, 300]]);
  });

  it('refuses a settlement without an amount or a party', () => {
    expect(() => collect('x', '2026-01-01', 'عميل', 0)).toThrow('AMOUNT_MUST_BE_POSITIVE');
    expect(() => collect('x', '2026-01-01', ' ', 10)).toThrow('PARTY_REQUIRED');
  });
});
