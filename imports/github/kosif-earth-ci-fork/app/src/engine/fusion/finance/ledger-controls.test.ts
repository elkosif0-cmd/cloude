import { describe, expect, it } from 'vitest';
import { buildTrialBalance, isPeriodLocked, reverseJournalEntry, validateJournalEntry, type JournalEntry } from './ledger-engine';

const sale: JournalEntry = {
  id: 'JE-1',
  date: '2026-03-10',
  reference: 'INV-7',
  lines: [
    { accountId: 'ar', debit: 115, credit: 0, description: 'ذمم' },
    { accountId: 'rev', debit: 0, credit: 100 },
    { accountId: 'vat', debit: 0, credit: 15 },
  ],
};

describe('ledger controls', () => {
  it('reverses an entry into a balanced mirror that nets every account to zero', () => {
    const rev = reverseJournalEntry(sale, { id: 'JE-2', date: '2026-04-01' });
    expect(validateJournalEntry(rev).valid).toBe(true);
    expect(rev.reference).toBe('عكس INV-7');
    expect(rev.lines[0]).toEqual({ accountId: 'ar', debit: 0, credit: 115, description: 'عكس: ذمم' });
    const tb = buildTrialBalance([sale, rev]);
    expect(tb.rows.every((r) => r.balance === 0)).toBe(true);
  });

  it('refuses to reverse an empty entry', () => {
    expect(() => reverseJournalEntry({ id: 'x', date: '2026-01-01', lines: [] }, { id: 'y', date: '2026-01-02' })).toThrow('NOTHING_TO_REVERSE');
  });

  it('locks every date on or before the lock date', () => {
    expect(isPeriodLocked('2026-03-31', '2026-03-31')).toBe(true);
    expect(isPeriodLocked('2026-01-05', '2026-03-31')).toBe(true);
    expect(isPeriodLocked('2026-04-01', '2026-03-31')).toBe(false);
    expect(isPeriodLocked('2026-04-01', '')).toBe(false);
    expect(isPeriodLocked('2026-04-01', null)).toBe(false);
  });
});
