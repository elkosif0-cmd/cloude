import { describe, expect, it } from 'vitest';
import { validateJournalEntry } from '../finance/ledger-engine';
import { buildStockCountAdjustment, stockCountValuation, weightedAverageCostsAsOf } from './inventory-engine';

describe('cost as of a date and the stock count', () => {
  const layers = [
    { itemId: 'lamb', quantity: 10, unitCost: 30, date: '2026-01-01' },
    { itemId: 'lamb', quantity: 10, unitCost: 50, date: '2026-03-01' },
  ];

  it('never uses receipts dated after the sale', () => {
    expect(weightedAverageCostsAsOf(layers, '2026-02-15')).toEqual({ lamb: 30 });
    expect(weightedAverageCostsAsOf(layers, '2026-03-01')).toEqual({ lamb: 40 });
    expect(weightedAverageCostsAsOf(layers, '2025-12-31')).toEqual({});
  });

  it('values the count and lists items without a cost', () => {
    const v = stockCountValuation([{ itemId: 'lamb', countedQty: 12.5 }, { itemId: 'veal', countedQty: 3 }, { itemId: 'goat', countedQty: 0 }], (id) => ({ lamb: 40 } as Record<string, number>)[id]);
    expect(v.value).toBe(500);
    expect(v.uncosted).toEqual(['veal']);
  });

  it('posts a shortfall to the variance account and a surplus back', () => {
    const short = buildStockCountAdjustment({ id: 'a', date: '2026-06-30', bookValue: 5200, countedValue: 5000, inventoryAccountId: 'inv', varianceAccountId: 'var' });
    expect(validateJournalEntry(short).valid).toBe(true);
    expect(short.lines[0]).toMatchObject({ accountId: 'var', debit: 200 });
    expect(short.difference).toBe(-200);
    const over = buildStockCountAdjustment({ id: 'b', date: '2026-06-30', bookValue: 5000, countedValue: 5075.5, inventoryAccountId: 'inv', varianceAccountId: 'var' });
    expect(over.lines[0]).toMatchObject({ accountId: 'inv', debit: 75.5 });
    expect(() => buildStockCountAdjustment({ id: 'c', date: '2026-06-30', bookValue: 1, countedValue: 1, inventoryAccountId: 'inv', varianceAccountId: 'var' })).toThrow('NO_DIFFERENCE');
  });
});
