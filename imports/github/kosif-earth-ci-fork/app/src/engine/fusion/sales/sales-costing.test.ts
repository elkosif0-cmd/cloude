import { describe, expect, it } from 'vitest';
import { validateJournalEntry } from '../finance/ledger-engine';
import { weightedAverageCosts } from '../stock/inventory-engine';
import { calculateSalesTotals, splitVatInclusive } from './sales-engine';
import { buildSalesPosting } from './sales-posting-engine';

const accounts = { receivableAccountId: 'ar', revenueAccountId: 'rev', vatPayableAccountId: 'vat' };
const doc = (lines: Parameters<typeof calculateSalesTotals>[0]) => ({ id: 's1', number: 'S-1', date: '2026-05-01', dueDate: '2026-05-01', customerId: 'c', status: 'DRAFT' as const, lines });

describe('VAT-inclusive sales', () => {
  it('takes the tax out of the amount paid so the parts add back to the halala', () => {
    expect(splitVatInclusive(30, 0.15)).toEqual({ gross: 30, net: 26.09, vat: 3.91 });
    const t = calculateSalesTotals([{ itemId: 'x', quantity: 3, unitPrice: 10, vatRate: 0.15, priceIncludesVat: true }]);
    expect(t.total).toBe(30);
    expect(t.taxable + t.vat).toBe(30);
  });

  it('keeps an inclusive discount out of the tax base', () => {
    const t = calculateSalesTotals([{ itemId: 'x', quantity: 2, unitPrice: 57.5, discount: 11.5, vatRate: 0.15, priceIncludesVat: true }]);
    expect(t).toEqual({ subtotal: 100, discount: 10, taxable: 90, vat: 13.5, total: 103.5 });
  });

  it('builds a balanced journal for any price, the total being the sum of the rounded parts', () => {
    for (const price of [0.01, 0.99, 1.13, 7.77, 10, 33.33, 99.99, 12345.67]) {
      for (const qty of [1, 2, 3, 7]) {
        for (const inc of [true, false]) {
          const b = buildSalesPosting(doc([{ itemId: 'x', quantity: qty, unitPrice: price, vatRate: 0.15, priceIncludesVat: inc }]), accounts);
          expect(validateJournalEntry(b.journal).valid).toBe(true);
          if (inc) expect(b.receivable.amount).toBe(Math.round(price * qty * 100) / 100);
        }
      }
    }
  });
});

describe('cost of sales with each sale', () => {
  const costing = { cogsAccountId: 'cogs', inventoryAccountId: 'inv', unitCost: (id: string) => ({ lamb: 40, goat: 0 } as Record<string, number>)[id] };

  it('moves the known cost from inventory to cost of sales in the same balanced entry', () => {
    const b = buildSalesPosting(doc([{ itemId: 'lamb', quantity: 2, unitPrice: 69, vatRate: 0.15, priceIncludesVat: true }]), accounts, costing);
    expect(b.cost).toBe(80);
    expect(b.uncosted).toEqual([]);
    expect(b.journal.lines).toContainEqual(expect.objectContaining({ accountId: 'cogs', debit: 80, credit: 0 }));
    expect(b.journal.lines).toContainEqual(expect.objectContaining({ accountId: 'inv', debit: 0, credit: 80 }));
    expect(validateJournalEntry(b.journal).valid).toBe(true);
  });

  it('reports items without a cost instead of posting a zero cost', () => {
    const b = buildSalesPosting(doc([{ itemId: 'goat', quantity: 1, unitPrice: 50, vatRate: 0.15 }, { itemId: 'veal', quantity: 1, unitPrice: 50, vatRate: 0.15 }]), accounts, costing);
    expect(b.cost).toBe(0);
    expect(b.uncosted).toEqual(['goat', 'veal']);
    expect(b.journal.lines.some((l) => l.accountId === 'cogs')).toBe(false);
  });

  it('refuses costing without both accounts', () => {
    expect(() => buildSalesPosting(doc([{ itemId: 'lamb', quantity: 1, unitPrice: 10 }]), accounts, { ...costing, cogsAccountId: '' })).toThrow('COSTING_ACCOUNTS_REQUIRED');
  });
});

describe('weighted-average cost', () => {
  it('weights each receipt by its quantity and groups spellings of one item', () => {
    const w = weightedAverageCosts([
      { itemId: 'Lamb ', quantity: 10, unitCost: 30 },
      { itemId: 'lamb', quantity: 30, unitCost: 40 },
      { itemId: 'goat', quantity: 0, unitCost: 99 },
      { itemId: 'veal', quantity: 5, unitCost: -1 },
    ], (id) => id.trim().toLowerCase());
    expect(w).toEqual({ lamb: 37.5 });
  });
});
