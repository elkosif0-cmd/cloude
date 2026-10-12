import { describe, expect, it } from 'vitest';
import { postJournalEntry, postingAllowed, validateJournalEntry, type JournalEntry } from './ledger-engine';
import { lockPeriod } from './close-checklist-engine';

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

describe('period-close lock as an optional posting guard (close-checklist-engine → ledger-engine)', () => {
  const ok: JournalEntry = { id: 'sep', date: '2026-09-15', lines: [{ accountId: 'bank', debit: 100, credit: 0 }, { accountId: 'revenue', debit: 0, credit: 100 }] };
  const locked = lockPeriod(undefined, { id: '2026-09', start: '2026-09-01', end: '2026-09-30' }, 'المدير', '2026-10-12T09:00:00Z').state;

  it('without a context the validation is unchanged', () => {
    expect(validateJournalEntry(ok)).toEqual({ valid: true, issues: [] });
    expect(validateJournalEntry(ok, null)).toEqual({ valid: true, issues: [] });
    expect(validateJournalEntry(ok, {})).toEqual({ valid: true, issues: [] });
    expect(postingAllowed('2026-09-15')).toEqual({ ok: true });
  });

  it('refuses a date inside a locked period with the engine\'s Arabic reason, and accepts a date outside it', () => {
    const r = validateJournalEntry(ok, { lockState: locked });
    expect(r.valid).toBe(false);
    expect(r.issues[0].code).toBe('PERIOD_LOCKED');
    expect(r.issues[0].reason_ar).toContain('2026-09-01 → 2026-09-30 مقفلة');
    expect(r.issues[0].reason_ar).toContain('المدير');
    expect(validateJournalEntry({ ...ok, date: '2026-10-01' }, { lockState: locked })).toEqual({ valid: true, issues: [] });
  });

  it('honours the books\' single lock date through the same context', () => {
    const r = validateJournalEntry(ok, { lockDate: '2026-09-30' });
    expect(r.issues.map((i) => i.code)).toEqual(['PERIOD_LOCKED']);
    expect(r.issues[0].reason_ar).toBe('الفترة مقفلة حتى 2026-09-30');
    expect(validateJournalEntry(ok, { lockDate: '2026-09-14' }).valid).toBe(true);
  });

  it('a locked period is reported together with the other issues, the lock first', () => {
    const r = validateJournalEntry({ ...ok, lines: [{ accountId: 'bank', debit: 100, credit: 0 }] }, { lockState: locked });
    expect(r.issues.map((i) => i.code)).toEqual(['PERIOD_LOCKED', 'JOURNAL_TOO_FEW_LINES', 'JOURNAL_EMPTY_TOTAL', 'JOURNAL_UNBALANCED']);
  });

  it('postJournalEntry appends only when allowed and never mutates the given list', () => {
    const before: JournalEntry[] = [];
    const yes = postJournalEntry(before, ok);
    expect(yes.ok).toBe(true); expect(yes.entries).toHaveLength(1); expect(before).toHaveLength(0);
    const no = postJournalEntry(before, ok, { lockState: locked });
    expect(no.ok).toBe(false); expect(no.entries).toBe(before);
    if (!no.ok) { expect(no.reason_ar).toContain('مقفلة'); expect(no.issues[0].code).toBe('PERIOD_LOCKED'); }
    const bad = postJournalEntry(before, { ...ok, lines: [] });
    expect(bad.ok).toBe(false); if (!bad.ok) expect(bad.reason_ar).toBeUndefined();
  });
});
