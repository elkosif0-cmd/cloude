import { describe, expect, it } from 'vitest';
import { buildGeneralLedger, buildTrialBalance, validateJournalEntry, type JournalEntry } from './ledger-engine';

const balancedEntry: JournalEntry = {
  id: 'JV-001',
  date: '2026-09-25',
  reference: 'OPENING',
  lines: [
    { accountId: '1100-cash', debit: 1000, credit: 0 },
    { accountId: '3000-equity', debit: 0, credit: 1000 },
  ],
};

describe('double-entry journal validation', () => {
  it('accepts a balanced journal entry with positive debit and credit lines', () => {
    expect(validateJournalEntry(balancedEntry)).toEqual({ valid: true, issues: [] });
  });

  it('rejects an unbalanced journal entry', () => {
    const result = validateJournalEntry({
      ...balancedEntry,
      id: 'JV-002',
      lines: [
        { accountId: '1100-cash', debit: 1000, credit: 0 },
        { accountId: '3000-equity', debit: 0, credit: 900 },
      ],
    });

    expect(result.valid).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: 'JOURNAL_UNBALANCED' }));
  });

  it('rejects lines that are zero, negative, or carry debit and credit together', () => {
    const result = validateJournalEntry({
      ...balancedEntry,
      id: 'JV-003',
      lines: [
        { accountId: '1100-cash', debit: 100, credit: 100 },
        { accountId: '3000-equity', debit: -1, credit: 0 },
        { accountId: '9999-zero', debit: 0, credit: 0 },
      ],
    });

    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining(['LINE_BOTH_SIDES', 'LINE_NEGATIVE_AMOUNT', 'LINE_ZERO_AMOUNT']),
    );
  });
});

describe('general ledger and trial balance', () => {
  const entries: JournalEntry[] = [
    balancedEntry,
    {
      id: 'JV-004',
      date: '2026-09-25',
      reference: 'EXPENSE',
      lines: [
        { accountId: '5100-expense', debit: 250, credit: 0 },
        { accountId: '1100-cash', debit: 0, credit: 250 },
      ],
    },
  ];

  it('aggregates debit, credit, and net balance by account', () => {
    expect(buildGeneralLedger(entries)).toEqual([
      { accountId: '1100-cash', debit: 1000, credit: 250, balance: 750 },
      { accountId: '3000-equity', debit: 0, credit: 1000, balance: -1000 },
      { accountId: '5100-expense', debit: 250, credit: 0, balance: 250 },
    ]);
  });

  it('produces a balanced trial balance with equal total debits and credits', () => {
    const trialBalance = buildTrialBalance(entries);

    expect(trialBalance.totals).toEqual({ debit: 1250, credit: 1250 });
    expect(trialBalance.balanced).toBe(true);
    expect(trialBalance.rows).toHaveLength(3);
  });
});
