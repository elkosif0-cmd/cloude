import { describe, expect, it } from 'vitest';
import { validateJournalEntry, type JournalEntry } from './ledger-engine';

const balanced = (accountId: string): JournalEntry => ({
  id: 'JE-ACCOUNT-GUARD',
  date: '2026-10-12',
  lines: [
    { accountId, debit: 115, credit: 0 },
    { accountId: 'revenue', debit: 0, credit: 100 },
    { accountId: 'output-vat', debit: 0, credit: 15 },
  ],
});

describe('journal account identifier integrity', () => {
  it('rejects missing, blank, or whitespace identifiers on an otherwise balanced journal', () => {
    for (const accountId of ['', ' ', '\t', null, undefined, 101] as unknown[]) {
      const result = validateJournalEntry(balanced(accountId as string));
      expect(result.valid).toBe(false);
      expect(result.issues).toContainEqual({ code: 'LINE_ACCOUNT_REQUIRED', lineIndex: 0 });
    }
  });

  it('allows a balanced invoice with input account and output VAT', () => {
    expect(validateJournalEntry(balanced('accounts-receivable'))).toEqual({ valid: true, issues: [] });
  });
});
