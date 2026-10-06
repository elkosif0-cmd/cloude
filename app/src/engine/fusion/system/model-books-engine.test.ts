import { describe, expect, it } from 'vitest';
import { checkModelBooks, MODEL_COMPANIES, modelBooks } from './model-books-engine';
import { validateJournalEntry } from '../finance/ledger-engine';

describe('the §3.6 model companies', () => {
  it.each(MODEL_COMPANIES.map((c) => [c.id]))('%s has been through a full, balanced, closed cycle', (id) => {
    const b = modelBooks(id), c = checkModelBooks(b);
    expect(c.issues).toEqual([]);
    expect(c.ok).toBe(true);
    expect(c.trialBalanceHalalas).toBe(0);
    expect(b.lockDate).toBe('2026-09-30');
    for (const e of b.entries) expect(validateJournalEntry(e).valid, e.id).toBe(true);
    expect(c.revenueHalalas).toBeGreaterThan(0);
    /* a corrected error: the duplicate and its reversal cancel out */
    const dup = b.entries.find((e) => e.reversedBy)!, rev = b.entries.find((e) => e.id === dup.reversedBy)!;
    expect(rev.reversalOf).toBe(dup.id);
    /* the first two quarters' VAT is closed and paid; the third is still payable at the period end */
    expect(b.entries.filter((e) => e.vatClose).length).toBe(3);
    expect(c.balance('2250')).toBeLessThanOrEqual(0);
  });
  it('is deterministic', () => {
    expect(JSON.stringify(modelBooks('model-trade'))).toBe(JSON.stringify(modelBooks('model-trade')));
  });
  it('the hospital: monthly revenue above 10 million and a large volume of visits through the claims engine', () => {
    const b = modelBooks('model-health'), c = checkModelBooks(b);
    expect(c.revenueHalalas / 9).toBeGreaterThan(1_000_000_000);
    expect(b.entries.filter((e) => e.visit).length).toBeGreaterThan(2000);
    /* the payers' receivable holds only the claims not yet remitted (September's, and the 3% left open each month) */
    const claimed = b.entries.filter((e) => (e.claim as { kind: string } | undefined)?.kind === 'claim').reduce((s, e) => s + (e.claim as { billed: number }).billed, 0);
    const settled = b.entries.filter((e) => (e.claim as { kind: string } | undefined)?.kind === 'remittance').reduce((s, e) => s + (e.claim as { paid: number; rejected: number }).paid + (e.claim as { rejected: number }).rejected, 0);
    expect(c.balance('1210')).toBe(claimed - settled);
    expect(c.balance('5110')).toBeGreaterThan(0);
  });
  it('the factory leaves no work in progress and the farm counts its flock', () => {
    expect(checkModelBooks(modelBooks('model-manufacturing')).balance('1380')).toBe(0);
    const f = modelBooks('model-agriculture');
    expect(checkModelBooks(f).balance('1395')).toBeGreaterThan(0);
    expect(f.entries.some((e) => (e.flock as { born?: number } | undefined)?.born)).toBe(true);
  });
  it('the school defers its fees and earns them month by month', () => {
    const c = checkModelBooks(modelBooks('model-education'));
    expect(c.balance('4090')).toBeLessThan(0);
    expect(c.balance('2410')).toBeLessThan(0);
  });
});
