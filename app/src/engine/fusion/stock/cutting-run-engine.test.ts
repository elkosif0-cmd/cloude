import { describe, expect, it } from 'vitest';
import { allocateExact, cuttingRun, cuttingRunJournal } from './cutting-run-engine';
import { validateJournalEntry } from '../finance/ledger-engine';

const lamb = {
  id: 'r1', date: '2026-05-02', carcassWeightKg: 20, carcassCostHalalas: 100_000, // 1,000.00 SAR
  cuts: [{ name: 'فخذ', weightKg: 6, pricePerKgHalalas: 9_000 }, { name: 'كتف', weightKg: 5, pricePerKgHalalas: 8_000 }, { name: 'ريش', weightKg: 3, pricePerKgHalalas: 12_000 }],
  byProducts: [{ name: 'كبدة ومعلاق', weightKg: 1.5, nrvPerKgHalalas: 4_000 }],
  wasteKg: 1, normalWastePct: 3,
};

describe('a cutting run assigns the carcass cost as IAS 2 allows for joint products', () => {
  it('keeps every halala: cuts + by-products + abnormal waste = carcass cost', () => {
    const r = cuttingRun(lamb);
    const total = r.cuts.reduce((s, c) => s + c.costHalalas, 0) + r.byProducts.reduce((s, b) => s + b.valueHalalas, 0) + r.waste.abnormalCostHalalas;
    expect(total).toBe(100_000);
    expect(r.balanced).toBe(true);
  });
  it('by-products at net realisable value reduce the joint cost; main cuts share the rest by sales value', () => {
    const r = cuttingRun(lamb);
    expect(r.byProducts[0].valueHalalas).toBe(6_000);
    expect(r.waste.normalKg).toBe(0.6); expect(r.waste.abnormalKg).toBe(0.4); expect(r.waste.abnormalCostHalalas).toBe(2_000);
    // joint = 100,000 − 2,000 − 6,000 = 92,000 over sales values 54,000 / 40,000 / 36,000
    expect(r.cuts.map((c) => c.costHalalas)).toEqual([38_215, 28_308, 25_477]);
    expect(r.basis).toBe('sales-value');
    expect(r.yieldPct).toBe(70);
    expect(r.unaccountedKg).toBe(3.5); // 20 − 14 cuts − 1.5 by-products − 1 waste
  });
  it('falls back to weight when a cut has no price, and waste within tolerance stays in the cuts', () => {
    const r = cuttingRun({ ...lamb, cuts: [{ name: 'أ', weightKg: 10 }, { name: 'ب', weightKg: 9 }], byProducts: [], wasteKg: 0.5 });
    expect(r.basis).toBe('weight');
    expect(r.waste.abnormalCostHalalas).toBe(0);
    expect(r.cuts.map((c) => c.costHalalas)).toEqual([52_632, 47_368]);
  });
  it('a by-product worth more than the joint cost cannot create value from nothing', () => {
    const r = cuttingRun({ ...lamb, byProducts: [{ name: 'جلد', weightKg: 5, nrvPerKgHalalas: 1_000_000 }] });
    expect(r.byProducts[0].valueHalalas + r.waste.abnormalCostHalalas).toBe(100_000);
    expect(r.cuts.every((c) => c.costHalalas === 0)).toBe(true);
    expect(r.balanced).toBe(true);
  });
  it('rejects a run without weight, cost or cuts', () => {
    expect(() => cuttingRun({ ...lamb, carcassWeightKg: 0 })).toThrow();
    expect(() => cuttingRun({ ...lamb, carcassCostHalalas: 10.5 })).toThrow();
    expect(() => cuttingRun({ ...lamb, cuts: [] })).toThrow();
  });
  it('allocateExact never loses or invents a unit', () => {
    for (const [t, w] of [[100, [1, 1, 1]], [7, [3, 3, 3, 1]], [1, [5, 5]], [0, [1, 2]]] as const) expect(allocateExact(t, [...w]).reduce((s, v) => s + v, 0)).toBe(t);
  });
  it('posts a balanced entry that moves the cost out of the carcass account', () => {
    const { journal } = cuttingRunJournal(lamb, { carcassAccountId: 'a1310', cutsAccountId: 'a1320', byProductsAccountId: 'a1330', abnormalWasteAccountId: 'a5100' });
    expect(validateJournalEntry(journal).valid).toBe(true);
    const by = (id: string) => journal.lines.filter((l) => l.accountId === id).reduce((s, l) => s + l.debit - l.credit, 0);
    expect(by('a1310')).toBe(-1000); expect(by('a1320')).toBe(920); expect(by('a1330')).toBe(60); expect(by('a5100')).toBe(20);
  });
});
