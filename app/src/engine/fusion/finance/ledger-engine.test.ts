import { describe, expect, it } from 'vitest';
import { buildGeneralLedger, buildTrialBalance, periodTrialBalance, validateJournalEntry, type JournalEntry, type LedgerAccountType } from './ledger-engine';

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

  it('builds a period trial balance with opening balances and the prior result in retained earnings', () => {
    const types: Record<string, LedgerAccountType> = { cash: 'asset', ar: 'asset', capital: 'equity', re: 'equity', sales: 'revenue', cogs: 'expense' };
    const je = (id: string, date: string, lines: [string, number, number][]): JournalEntry => ({ id, date, lines: lines.map(([accountId, debit, credit]) => ({ accountId, debit, credit })) });
    const entries = [
      je('o1', '2024-01-01', [['cash', 50000, 0], ['capital', 0, 50000]]),
      je('o2', '2024-06-01', [['ar', 20000, 0], ['sales', 0, 20000]]),
      je('o3', '2024-07-01', [['cogs', 8000, 0], ['cash', 0, 8000]]),
      je('c1', '2025-03-10', [['ar', 60000, 0], ['sales', 0, 60000]]),
      je('c2', '2025-04-01', [['cogs', 30000, 0], ['cash', 0, 30000]]),
      je('late', '2026-01-05', [['cash', 1, 0], ['sales', 0, 1]]),
    ];
    const tb = periodTrialBalance(entries, (id) => types[id], { start: '2025-01-01', end: '2025-12-31' }, 're');
    const bal = Object.fromEntries(tb.rows.map((r) => [r.accountId, r.balance]));
    expect(bal).toEqual({ ar: 80000, capital: -50000, cash: 12000, cogs: 30000, re: -12000, sales: -60000 });
    expect(tb.carried).toBe(-12000);
    expect(tb.balanced).toBe(true);
    expect(periodTrialBalance(entries, (id) => types[id], { start: '2024-01-01', end: '2024-12-31' }, 're').carried).toBe(0);
  });
});
