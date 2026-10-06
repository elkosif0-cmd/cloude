import { describe, expect, it } from 'vitest';
import { collectionJournal, discountJournal, emptyTermState, recognitionJournal, termInvoiceJournal, termMonths, termSummary, tuitionVat, withdrawalJournal, type TermState } from './tuition-engine';
import { validateJournalEntry } from './ledger-engine';

const A = { receivableAccountId: 'a1200', cashAccountId: 'a1100', deferredAccountId: 'a2410', revenueAccountId: 'a4090', discountAccountId: 'a5160', outputVatAccountId: 'a2200' };
const T = { id: 't2', label: 'الفصل الثاني 2026', startMonth: '2026-01', months: 5, feeHalalas: 900_000, citizens: 80, residents: 20 };
const SA = { country: 'SA', policyRate: 0.15 };
const by = (lines: { accountId: string; debit: number; credit: number }[], id: string) => Math.round(lines.filter((l) => l.accountId === id).reduce((s, l) => s + l.debit - l.credit, 0) * 100) / 100;

describe('the education pack', () => {
  it('VAT follows the student: citizens state-borne, residents standard, Egypt exempt', () => {
    expect(tuitionVat({ ...SA, category: 'citizen' })).toEqual({ treatment: 'state-borne', rate: 0 });
    expect(tuitionVat({ ...SA, category: 'resident' })).toEqual({ treatment: 'standard', rate: 0.15 });
    expect(tuitionVat({ country: 'EG', policyRate: 0.14, category: 'resident' }).treatment).toBe('exempt');
    expect(tuitionVat({ country: 'SA', policyRate: 0, category: 'resident' }).treatment).toBe('none');
  });
  it('a term billed in advance: 900,000 deferred, VAT only on the 20 residents', () => {
    const r = termInvoiceJournal(T, { id: 'i', date: '2026-01-05', ...SA }, A);
    expect(validateJournalEntry(r.journal).valid).toBe(true);
    expect(by(r.journal.lines, 'a2410')).toBe(-900_000); expect(by(r.journal.lines, 'a2200')).toBe(-27_000); expect(by(r.journal.lines, 'a1200')).toBe(927_000);
    expect(termMonths(T)).toEqual(['2026-01', '2026-02', '2026-03', '2026-04', '2026-05']);
  });
  it('earned month by month; a discount and a withdrawal lower the months after them; the last month takes the remainder', () => {
    let s: TermState = emptyTermState();
    const earn = (through: string) => { const r = recognitionJournal(T, s, through, { id: 'e', date: through + '-28' }, A); expect(validateJournalEntry(r.journal).valid).toBe(true); s = { ...s, recognisedMonths: [...s.recognisedMonths, ...r.months], recognisedHalalas: s.recognisedHalalas + r.amount }; return r; };
    expect(earn('2026-01').amount).toBe(18_000_000);
    const d = discountJournal(T, s, { id: 'd', date: '2026-02-01', category: 'resident', amountHalalas: 1_200_000, reason: 'خصم الإخوة', ...SA }, A);
    expect(validateJournalEntry(d.journal).valid).toBe(true); expect(d.vat).toBe(180_000); expect(by(d.journal.lines, 'a1200')).toBe(-13_800); expect(by(d.journal.lines, 'a2410')).toBe(12_000);
    s = { ...s, discountHalalas: 1_200_000 };
    const w = withdrawalJournal(T, s, { id: 'w', date: '2026-03-01', category: 'citizen', students: 2, fromMonth: '2026-03', ...SA }, A);
    expect(w.credit).toBe(1_080_000); expect(w.vat).toBe(0); expect(w.months).toBe(3);
    s = { ...s, creditedHalalas: w.credit, withdrawnCitizens: 2 };
    expect(earn('2026-02').amount).toBe(Math.floor((90_000_000 - 18_000_000 - 1_200_000 - 1_080_000) / 4));
    earn('2026-05');
    expect(s.recognisedHalalas).toBe(90_000_000 - 1_200_000 - 1_080_000);
    expect(() => recognitionJournal(T, s, '2026-05', { id: 'x', date: '2026-05-31' }, A)).toThrow(/لا أشهر/);
  });
  it('refuses what cannot be: a discount above the unearned fees, a withdrawal from a month already earned, an over-collection', () => {
    const s = { ...emptyTermState(), recognisedMonths: ['2026-01'], recognisedHalalas: 18_000_000, openHalalas: 500_000 };
    expect(() => discountJournal(T, s, { id: 'd', date: '2026-02-01', category: 'citizen', amountHalalas: 80_000_000, reason: 'منحة', ...SA }, A)).toThrow(/يتجاوز/);
    expect(() => discountJournal(T, s, { id: 'd', date: '2026-02-01', category: 'citizen', amountHalalas: 100, reason: ' ', ...SA }, A)).toThrow(/سبب/);
    expect(() => withdrawalJournal(T, s, { id: 'w', date: '2026-02-01', category: 'citizen', students: 1, fromMonth: '2026-01', ...SA }, A)).toThrow(/اعتُرف/);
    expect(() => withdrawalJournal(T, s, { id: 'w', date: '2026-02-01', category: 'resident', students: 21, fromMonth: '2026-02', ...SA }, A)).toThrow(/أكثر/);
    expect(() => collectionJournal(T, s, { id: 'c', date: '2026-02-01', amountHalalas: 600_000 }, A)).toThrow(/يتجاوز/);
    expect(validateJournalEntry(collectionJournal(T, s, { id: 'c', date: '2026-02-01', amountHalalas: 500_000 }, A).journal).valid).toBe(true);
  });
  it('the term summary: collection rate and revenue per student', () => {
    const s = { ...emptyTermState(), recognisedHalalas: 36_000_000, collectedHalalas: 60_000_000, openHalalas: 32_700_000, withdrawnCitizens: 2 };
    expect(termSummary(T, s)).toMatchObject({ students: 98, earned: 36_000_000, deferred: 54_000_000, collectionPct: 64.72, revenuePerStudent: 367_347 });
  });
});
