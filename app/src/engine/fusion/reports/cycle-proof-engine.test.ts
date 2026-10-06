import { describe, expect, it } from 'vitest';
import { cycleProof, type ProofEntry } from './cycle-proof-engine';
import { MODEL_COMPANIES, modelBooks } from '../system/model-books-engine';

/* the model companies' books with account ids = codes, as the books screen would hold them */
const books = (id: string) => { const b = modelBooks(id); const entries: ProofEntry[] = b.entries; return { accounts: b.accounts.map(([code, name, type]) => ({ id: code, code, name, type })), entries, end: b.lockDate, lockDate: b.lockDate }; };

describe('the accounting-cycle proof', () => {
  it.each(MODEL_COMPANIES.map((c) => [c.id]))('%s: operation → entry → ledger → trial balance → statements with the same numbers, closed', (id) => {
    const p = cycleProof(books(id));
    expect(p.steps.map((s) => [s.id, s.status, s.status === 'ok' ? '' : s.detail])).toEqual([
      ['entries', 'ok', ''], ['ledger', 'ok', ''], ['statements', 'ok', ''], ['same', 'ok', ''], ['subledgers', 'ok', ''], ['close', 'ok', ''],
    ]);
    expect(p.ok).toBe(true);
    expect(p.statements.checks.mappedPct).toBe(100);
  });
  it('catches an entry that does not balance and an account outside the chart', () => {
    const b = books('model-trade');
    b.entries = [...b.entries, { id: 'x', date: '2026-09-01', reference: 'x', lines: [{ accountId: '1100', debit: 10, credit: 0 }, { accountId: '9999', debit: 0, credit: 5 }] }];
    const s = cycleProof(b).steps.find((x) => x.id === 'entries')!;
    expect(s.status).toBe('fail'); expect(s.figures).toMatchObject({ unbalanced: 1, orphan: 1 });
  });
  it('names a receivable posted without a party, and an open period', () => {
    const b = books('model-trade');
    b.entries = [...b.entries, { id: 'y', date: '2026-09-29', reference: 'y', source: 'يدوي', lines: [{ accountId: '1200', debit: 100, credit: 0 }, { accountId: '4000', debit: 0, credit: 100 }] }];
    b.lockDate = '2026-06-30';
    const p = cycleProof(b);
    expect(p.steps.find((x) => x.id === 'subledgers')!.status).toBe('warn');
    expect(p.steps.find((x) => x.id === 'close')!.status).toBe('warn');
    expect(p.ok).toBe(true);
  });
});
