import { describe, expect, it } from 'vitest';
import { campaignProfitability, mediaSpendJournal, rebillJournal, recognitionJournal, retainerInvoiceJournal, retainerSchedule } from './agency-engine';
import { validateJournalEntry } from './ledger-engine';

const A = { receivableAccountId: 'a1200', deferredAccountId: 'a2400', revenueAccountId: 'a4080', outputVatAccountId: 'a2200', mediaCostAccountId: 'a5150', platformPayableAccountId: 'a2170' };
const R = { id: 'r1', client: 'متجر الورد', campaign: 'رمضان', monthlyHalalas: 500_000, months: 3, startMonth: '2026-11' };
const by = (lines: { accountId: string; debit: number; credit: number }[], id: string) => Math.round(lines.filter((l) => l.accountId === id).reduce((s, l) => s + l.debit - l.credit, 0) * 100) / 100;

describe('the digital-marketing pack', () => {
  it('a retainer covers its months across the year end', () => {
    expect(retainerSchedule(R).map((m) => m.month)).toEqual(['2026-11', '2026-12', '2027-01']);
  });
  it('the retainer billed in advance is deferred revenue with its VAT', () => {
    const r = retainerInvoiceJournal(R, { id: 'i1', date: '2026-11-01' }, 0.15, A);
    expect(validateJournalEntry(r.journal).valid).toBe(true);
    expect(by(r.journal.lines, 'a1200')).toBe(17250); expect(by(r.journal.lines, 'a2400')).toBe(-15000); expect(by(r.journal.lines, 'a2200')).toBe(-2250);
    expect(r.journal.party).toBe('متجر الورد');
  });
  it('recognition: only the months served and not yet recognised', () => {
    const r = recognitionJournal(R, ['2026-11'], '2026-12', { id: 'x', date: '2026-12-31' }, A);
    expect(r.months).toEqual(['2026-12']); expect(by(r.journal.lines, 'a4080')).toBe(-5000); expect(validateJournalEntry(r.journal).valid).toBe(true);
    expect(() => recognitionJournal(R, ['2026-11', '2026-12'], '2026-12', { id: 'y', date: '2026-12-31' }, A)).toThrow(/لا أشهر/);
  });
  it('ad spend is owed to the platform; the rebill carries the markup and VAT', () => {
    const m = mediaSpendJournal({ id: 'm1', date: '2026-11-10', campaign: 'رمضان', platform: 'Meta', amountHalalas: 800_000 }, A);
    expect(by(m.journal.lines, 'a5150')).toBe(8000); expect(by(m.journal.lines, 'a2170')).toBe(-8000); expect(m.journal.party).toBe('Meta');
    const b = rebillJournal({ id: 'b1', date: '2026-11-30', client: 'متجر الورد', campaign: 'رمضان', spendHalalas: 800_000, markupPct: 10 }, 0.15, A);
    expect([b.amount, b.vat]).toEqual([880_000, 132_000]); expect(by(b.journal.lines, 'a1200')).toBe(10120); expect(validateJournalEntry(b.journal).valid).toBe(true);
  });
  it('refuses a retainer without a client, a term or a valid month', () => {
    expect(() => retainerSchedule({ ...R, client: '' })).toThrow(); expect(() => retainerSchedule({ ...R, months: 0 })).toThrow(); expect(() => retainerSchedule({ ...R, startMonth: '2026-13' })).toThrow();
    expect(() => rebillJournal({ id: 'b', date: '2026-11-30', client: 'c', campaign: 'k', spendHalalas: 1, markupPct: 150 }, 0.15, A)).toThrow();
  });
  it('campaign profitability, ROAS and CAC', () => {
    const [c] = campaignProfitability([{ campaign: 'رمضان', revenueHalalas: 1_880_000, mediaCostHalalas: 800_000, attributedSalesHalalas: 4_000_000, newCustomers: 94 }]);
    expect(c).toMatchObject({ marginHalalas: 1_080_000, marginPct: 57.45, roas: 5, cacHalalas: 20_000 });
  });
});
