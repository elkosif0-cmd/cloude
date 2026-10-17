import { describe, expect, it } from 'vitest';
import { advanceJournal, certificate, certificateJournal, emptyState, projectProfitability, retentionReleaseJournal } from './progress-billing-engine';
import { validateJournalEntry } from './ledger-engine';

const C = { id: 'k1', project: 'برج الواحة', customer: 'شركة التطوير', valueHalalas: 100_000_000, retentionPct: 10, advanceRecoveryPct: 20 }; // 1,000,000.00
const A = { cashAccountId: 'a1100', receivableAccountId: 'a1200', retentionAccountId: 'a1220', advanceAccountId: 'a2320', revenueAccountId: 'a4070', outputVatAccountId: 'a2200' };
const by = (lines: { accountId: string; debit: number; credit: number }[], id: string) => Math.round(lines.filter((l) => l.accountId === id).reduce((s, l) => s + l.debit - l.credit, 0) * 100) / 100;

describe('construction progress billing', () => {
  it('an advance: cash in, the advance liability and its VAT', () => {
    const { journal } = advanceJournal(C, { id: 'a', date: '2026-01-10', amountHalalas: 15_000_000 }, 0.15, A);
    expect(validateJournalEntry(journal).valid).toBe(true);
    expect(by(journal.lines, 'a1100')).toBe(172_500); expect(by(journal.lines, 'a2320')).toBe(-150_000); expect(by(journal.lines, 'a2200')).toBe(-22_500);
  });
  it('a certificate: work this period, 10% retention, 20% advance recovery, VAT on the work less the recovery', () => {
    const s = { ...emptyState(), advanceReceivedHalalas: 15_000_000 };
    const r = certificateJournal(C, s, { id: '1', date: '2026-03-31', certifiedToDateHalalas: 30_000_000 }, 0.15, A);
    // work 300,000; retention 30,000; recovery 60,000; VAT 15% × 240,000 = 36,000; receivable 300,000 − 30,000 − 60,000 + 36,000 = 246,000
    expect([r.work, r.retention, r.recovery, r.vat, r.receivable]).toEqual([30_000_000, 3_000_000, 6_000_000, 3_600_000, 24_600_000]);
    expect(validateJournalEntry(r.journal).valid).toBe(true);
    expect(by(r.journal.lines, 'a4070')).toBe(-300_000); expect(by(r.journal.lines, 'a1220')).toBe(30_000); expect(by(r.journal.lines, 'a2320')).toBe(60_000);
    expect(r.completionPct).toBe(30);
    // the next certificate counts only the new work, and the recovery stops at the advance left
    const r2 = certificate(C, r.next, { id: '2', date: '2026-06-30', certifiedToDateHalalas: 90_000_000 }, 0.15);
    expect(r2.work).toBe(60_000_000); expect(r2.recovery).toBe(9_000_000); expect(r2.next.advanceRecoveredHalalas).toBe(15_000_000);
  });
  it('refuses work above the contract, no new work, or a contract without parties', () => {
    expect(() => certificate(C, emptyState(), { id: 'x', date: '2026-01-01', certifiedToDateHalalas: 100_000_001 }, 0.15)).toThrow(/أمر التغيير/);
    expect(() => certificate(C, { ...emptyState(), certifiedHalalas: 30_000_000 }, { id: 'x', date: '2026-01-01', certifiedToDateHalalas: 30_000_000 }, 0.15)).toThrow(/لا أعمال/);
    expect(() => certificate({ ...C, customer: '' }, emptyState(), { id: 'x', date: '2026-01-01', certifiedToDateHalalas: 1 }, 0)).toThrow();
  });
  it('releases the retention held into the receivable at handover, once', () => {
    const s = { ...emptyState(), retentionHeldHalalas: 9_000_000 };
    const r = retentionReleaseJournal(C, s, { id: 'r', date: '2026-12-31' }, A);
    expect(validateJournalEntry(r.journal).valid).toBe(true);
    expect(by(r.journal.lines, 'a1200')).toBe(90_000); expect(by(r.journal.lines, 'a1220')).toBe(-90_000);
    expect(() => retentionReleaseJournal(C, r.next, { id: 'r2', date: '2026-12-31' }, A)).toThrow(/لا محتجزات/);
  });
  it('a company without VAT posts no VAT line', () => {
    const r = certificateJournal(C, emptyState(), { id: '1', date: '2026-03-31', certifiedToDateHalalas: 10_000_000 }, 0, A);
    expect(r.vat).toBe(0); expect(r.journal.lines.some((l) => l.accountId === 'a2200')).toBe(false);
  });
  it('project margin, completion by cost and expected margin', () => {
    expect(projectProfitability([{ project: 'برج', valueHalalas: 100_000_000, budgetCostHalalas: 80_000_000, revenueHalalas: 30_000_000, costHalalas: 22_000_000 }])[0])
      .toMatchObject({ margin: 8_000_000, marginPct: 26.67, completionByCostPct: 27.5, expectedMarginHalalas: 20_000_000 });
  });
});
