import { describe, expect, it } from 'vitest';
import { reverseJournalEntry, validateJournalEntry } from './ledger-engine';
import { buildVatSettlementEntry, vatReturn, type VatEntry } from './vat-return-engine';

const types: Record<string, string> = { ar: 'asset', cash: 'asset', ap: 'liability', rev: 'revenue', inv: 'asset', cogs: 'expense', vout: 'liability', vin: 'asset', rent: 'expense', net: 'liability' };
const base = { outputVatAccountId: 'vout', inputVatAccountId: 'vin', typeOf: (id: string) => types[id], controlAccountIds: ['ar', 'ap', 'cash'] };
const sale: VatEntry = { id: 's', date: '2026-02-10', lines: [
  { accountId: 'ar', debit: 115, credit: 0 }, { accountId: 'rev', debit: 0, credit: 100 }, { accountId: 'vout', debit: 0, credit: 15 },
  { accountId: 'cogs', debit: 60, credit: 0 }, { accountId: 'inv', debit: 0, credit: 60 }] };
const receipt: VatEntry = { id: 'r', date: '2026-03-01', lines: [{ accountId: 'inv', debit: 400, credit: 0 }, { accountId: 'vin', debit: 60, credit: 0 }, { accountId: 'ap', debit: 0, credit: 460 }] };

describe('VAT return from the books', () => {
  it('reads each side\'s base from the entries that carry the tax', () => {
    const r = vatReturn({ ...base, entries: [sale, receipt], start: '2026-01-01', end: '2026-03-31' });
    expect(r).toEqual({ salesBase: 100, outputVat: 15, purchasesBase: 400, inputVat: 60, net: -45, salesEntries: 1, purchaseEntries: 1, offRate: [] });
  });

  it('nets a reversed sale and ignores other periods and settlements', () => {
    const rev = reverseJournalEntry(sale, { id: 'sr', date: '2026-03-02' });
    const r = vatReturn({ ...base, entries: [sale, rev, receipt, { ...receipt, id: 'late', date: '2026-04-01' }], start: '2026-01-01', end: '2026-03-31' });
    expect([r.salesBase, r.outputVat, r.inputVat]).toEqual([0, 0, 60]);
  });

  it('flags VAT that is not the standard rate of its base', () => {
    const odd: VatEntry = { id: 'odd', date: '2026-02-11', lines: [{ accountId: 'cash', debit: 110, credit: 0 }, { accountId: 'rev', debit: 0, credit: 100 }, { accountId: 'vout', debit: 0, credit: 10 }] };
    expect(vatReturn({ ...base, entries: [odd], start: '2026-01-01', end: '2026-12-31' }).offRate).toEqual(['odd']);
  });

  it('closes output and input VAT into the net account, balanced either way', () => {
    const due = buildVatSettlementEntry({ id: 'v', date: '2026-03-31', reference: 'Q1', outputVat: 150, inputVat: 60, outputVatAccountId: 'vout', inputVatAccountId: 'vin', netAccountId: 'net' });
    expect(validateJournalEntry(due).valid).toBe(true);
    expect(due.lines).toContainEqual(expect.objectContaining({ accountId: 'net', credit: 90 }));
    const refund = buildVatSettlementEntry({ id: 'v2', date: '2026-03-31', reference: 'Q1', outputVat: 15, inputVat: 60, outputVatAccountId: 'vout', inputVatAccountId: 'vin', netAccountId: 'net' });
    expect(validateJournalEntry(refund).valid).toBe(true);
    expect(refund.lines).toContainEqual(expect.objectContaining({ accountId: 'net', debit: 45 }));
    expect(vatReturn({ ...base, entries: [sale, due], start: '2026-01-01', end: '2026-12-31' }).outputVat).toBe(15);
    expect(() => buildVatSettlementEntry({ id: 'z', date: '2026-03-31', reference: 'Q1', outputVat: 0, inputVat: 0, outputVatAccountId: 'vout', inputVatAccountId: 'vin', netAccountId: 'net' })).toThrow('NOTHING_TO_SETTLE');
  });
});
