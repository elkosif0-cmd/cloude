import { describe, expect, it } from 'vitest';
import { depositJournal, hotelKpis, nightAudit } from './hotel-engine';
import { validateJournalEntry } from './ledger-engine';

const A = { cashAccountId: 'a1100', receivableAccountId: 'a1200', depositAccountId: 'a2300', roomRevenueAccountId: 'a4050', fbRevenueAccountId: 'a4060',
  outputVatAccountId: 'a2200', commissionExpenseAccountId: 'a5120', commissionPayableAccountId: 'a2160' };
const by = (lines: { accountId: string; debit: number; credit: number }[], id: string) => Math.round(lines.filter((l) => l.accountId === id).reduce((s, l) => s + l.debit - l.credit, 0) * 100) / 100;

describe('the hospitality pack', () => {
  it('a deposit: cash with VAT against the deposits liability', () => {
    const { journal } = depositJournal({ id: 'd1', date: '2026-07-01', guest: 'حجز 501', amountHalalas: 100_000 }, 0.15, A);
    expect(validateJournalEntry(journal).valid).toBe(true);
    expect(by(journal.lines, 'a1100')).toBe(1150); expect(by(journal.lines, 'a2300')).toBe(-1000); expect(by(journal.lines, 'a2200')).toBe(-150);
  });
  it('the night audit settles from the deposit first; VAT only on the rest', () => {
    // rooms 1,200 + F&B 300 = 1,500; deposit 1,000 applied; VAT 15% × 500 = 75; cash 575
    const r = nightAudit({ id: 'n1', date: '2026-07-02', guest: 'حجز 501', roomsSold: 2, roomRevenueHalalas: 120_000, fbRevenueHalalas: 30_000, settleBy: 'cash', depositLeftHalalas: 100_000 }, 0.15, A);
    expect(validateJournalEntry(r.journal).valid).toBe(true);
    expect([r.applied, r.vat, r.rest]).toEqual([100_000, 7_500, 57_500]);
    expect(by(r.journal.lines, 'a2300')).toBe(1000); expect(by(r.journal.lines, 'a1100')).toBe(575);
    expect(by(r.journal.lines, 'a4050')).toBe(-1200); expect(by(r.journal.lines, 'a4060')).toBe(-300); expect(by(r.journal.lines, 'a2200')).toBe(-75);
  });
  it('a channel booking on account: the commission accrued to the channel', () => {
    const r = nightAudit({ id: 'n2', date: '2026-07-02', guest: 'Booking.com', roomsSold: 3, roomRevenueHalalas: 150_000, settleBy: 'receivable', channel: 'Booking.com', commissionPct: 15 }, 0.15, A);
    expect(r.journal.party).toBe('Booking.com'); expect(by(r.journal.lines, 'a1200')).toBe(1725);
    expect(validateJournalEntry(r.commissionJournal!).valid).toBe(true);
    expect(by(r.commissionJournal!.lines, 'a5120')).toBe(225); expect(by(r.commissionJournal!.lines, 'a2160')).toBe(-225);
    expect(r.commissionJournal!.party).toBe('Booking.com');
  });
  it('a deposit larger than the night leaves the rest for later nights and posts no VAT now', () => {
    const r = nightAudit({ id: 'n3', date: '2026-07-03', guest: 'حجز 9', roomsSold: 1, roomRevenueHalalas: 50_000, settleBy: 'cash', depositLeftHalalas: 80_000 }, 0.15, A);
    expect([r.applied, r.vat, r.rest]).toEqual([50_000, 0, 0]); expect(r.journal.lines.length).toBe(2);
  });
  it('refuses a night without a guest, revenue or valid rooms', () => {
    expect(() => nightAudit({ id: 'x', date: '2026-07-02', guest: '', roomsSold: 1, roomRevenueHalalas: 1, settleBy: 'cash' }, 0.15, A)).toThrow();
    expect(() => nightAudit({ id: 'x', date: '2026-07-02', guest: 'g', roomsSold: 1, roomRevenueHalalas: 0, settleBy: 'cash' }, 0.15, A)).toThrow(/لا إيراد/);
    expect(() => nightAudit({ id: 'x', date: '2026-07-02', guest: 'g', roomsSold: -1, roomRevenueHalalas: 1, settleBy: 'cash' }, 0.15, A)).toThrow();
  });
  it('occupancy, ADR and RevPAR overall and by channel', () => {
    const k = hotelKpis([
      { date: '2026-07-02', roomsAvailable: 20, roomsSold: 2, roomRevenueHalalas: 120_000 },
      { date: '2026-07-02', roomsAvailable: 20, roomsSold: 3, roomRevenueHalalas: 150_000, channel: 'Booking.com' },
      { date: '2026-07-03', roomsAvailable: 20, roomsSold: 5, roomRevenueHalalas: 230_000 },
    ]);
    expect(k).toMatchObject({ roomsAvailable: 40, roomsSold: 10, occupancyPct: 25, adrHalalas: 50_000, revparHalalas: 12_500 });
    expect(k.channels[0]).toMatchObject({ channel: 'مباشر', roomsSold: 7, sharePct: 70 });
  });
});
