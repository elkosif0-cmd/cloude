import { describe, expect, it } from 'vitest';
import { validateJournalEntry, type JournalEntry } from './ledger-engine';

const entry = (lines: JournalEntry['lines']): JournalEntry =>
  ({ id: 'control', date: '2026-10-12', lines });

describe('posting guards imported from the cross-repository accounting review', () => {
  it('rejects an empty journal (zero lines cannot be a valid balanced posting)', () => {
    const result = validateJournalEntry(entry([]));
    expect(result.valid).toBe(false);
    expect(result.issues.map(x => x.code)).toContain('JOURNAL_TOO_FEW_LINES');
    expect(result.issues.map(x => x.code)).toContain('JOURNAL_EMPTY_TOTAL');
  });

  it('rejects a single-line posting even if it contains a monetary amount', () => {
    const result = validateJournalEntry(entry([{ accountId: 'bank', debit: 10, credit: 0 }]));
    expect(result.valid).toBe(false);
    expect(result.issues.map(x => x.code)).toContain('JOURNAL_TOO_FEW_LINES');
  });

  it('rejects balanced-looking all-zero journals', () => {
    const result = validateJournalEntry(entry([
      { accountId: 'bank', debit: 0, credit: 0 },
      { accountId: 'revenue', debit: 0, credit: 0 },
    ]));
    expect(result.valid).toBe(false);
    expect(result.issues.map(x => x.code)).toContain('JOURNAL_EMPTY_TOTAL');
  });

  it('rejects NaN, Infinity and unknown numeric input rather than silently skipping it', () => {
    for (const value of [NaN, Infinity, -Infinity, 'not money' as unknown as number]) {
      const result = validateJournalEntry(entry([
        { accountId: 'bank', debit: value, credit: 0 },
        { accountId: 'revenue', debit: 0, credit: 100 },
      ]));
      expect(result.valid).toBe(false);
      expect(result.issues.map(x => x.code)).toContain('LINE_NON_FINITE_AMOUNT');
    }
  });

  it('keeps legitimate multi-line VAT postings valid', () => {
    const result = validateJournalEntry(entry([
      { accountId: 'receivables', debit: 115, credit: 0 },
      { accountId: 'revenue', debit: 0, credit: 100 },
      { accountId: 'output-vat', debit: 0, credit: 15 },
    ]));
    expect(result).toEqual({ valid: true, issues: [] });
  });
});
