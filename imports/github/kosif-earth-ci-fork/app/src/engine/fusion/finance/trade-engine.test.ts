import { describe, expect, it } from 'vitest';
import { branchKpis, branchPurchaseJournal, branchSaleJournals, creditPosition, transferJournal } from './trade-engine';
import { validateJournalEntry } from './ledger-engine';

const A = { cashAccountId: 'a1100', receivableAccountId: 'a1200', payableAccountId: 'a2100', inventoryAccountId: 'a1300', inputVatAccountId: 'a1400', outputVatAccountId: 'a2200',
  revenueAccountId: 'a4000', discountAccountId: 'a4100', cogsAccountId: 'a5000' };
const by = (lines: { accountId: string; debit: number; credit: number }[], id: string) => Math.round(lines.filter((l) => l.accountId === id).reduce((s, l) => s + l.debit - l.credit, 0) * 100) / 100;

describe('the general-trade pack', () => {
  it('a branch buys on credit; a sale with a discount, VAT on the net, and its cost out of the branch stock', () => {
    const p = branchPurchaseJournal({ id: 'p', date: '2026-07-01', branch: 'الرياض', supplier: 'المورد', amountHalalas: 1_000_000 }, 0.15, A);
    expect(validateJournalEntry(p.journal).valid).toBe(true); expect(by(p.journal.lines, 'a2100')).toBe(-11_500);
    const s = branchSaleJournals({ id: 's', date: '2026-07-05', branch: 'الرياض', grossHalalas: 500_000, discountHalalas: 50_000, costHalalas: 300_000, branchStockHalalas: 1_000_000 }, 0.15, A);
    expect(validateJournalEntry(s.journal).valid).toBe(true); expect(validateJournalEntry(s.costJournal).valid).toBe(true);
    expect([s.net, s.vat, s.total]).toEqual([450_000, 67_500, 517_500]);
    expect(by(s.journal.lines, 'a4000')).toBe(-5_000); expect(by(s.journal.lines, 'a4100')).toBe(500); expect(by(s.costJournal.lines, 'a1300')).toBe(-3_000);
  });
  it('credit: refused without a limit or beyond it; allowed within it, with the customer as party', () => {
    const base = { id: 's', date: '2026-07-05', branch: 'جدة', customer: 'مؤسسة الريان', onCredit: true, grossHalalas: 100_000, costHalalas: 60_000, branchStockHalalas: 100_000 };
    expect(() => branchSaleJournals({ ...base, creditLimitHalalas: null }, 0.15, A)).toThrow(/لا حد ائتمان/);
    expect(() => branchSaleJournals({ ...base, customerBalanceHalalas: 450_000, creditLimitHalalas: 500_000 }, 0.15, A)).toThrow(/يتجاوز حد ائتمان/);
    const ok = branchSaleJournals({ ...base, customerBalanceHalalas: 300_000, creditLimitHalalas: 500_000 }, 0.15, A);
    expect(ok.journal.party).toBe('مؤسسة الريان'); expect(by(ok.journal.lines, 'a1200')).toBe(1_150);
    expect(creditPosition(415_000, 500_000)).toEqual({ limit: 500_000, available: 85_000, usedPct: 83, over: false });
  });
  it('refuses a sale costing more than the branch holds, a discount as large as the sale, a transfer to itself or above stock', () => {
    expect(() => branchSaleJournals({ id: 's', date: '2026-07-05', branch: 'جدة', grossHalalas: 100, costHalalas: 60, branchStockHalalas: 50 }, 0.15, A)).toThrow(/أكثر من مخزون/);
    expect(() => branchSaleJournals({ id: 's', date: '2026-07-05', branch: 'جدة', grossHalalas: 100, discountHalalas: 100, costHalalas: 1, branchStockHalalas: 50 }, 0.15, A)).toThrow(/الخصم/);
    expect(() => transferJournal({ id: 't', date: '2026-07-06', from: 'جدة', to: 'جدة', costHalalas: 1, fromStockHalalas: 5 }, A)).toThrow(/متماثلان/);
    expect(() => transferJournal({ id: 't', date: '2026-07-06', from: 'جدة', to: 'الرياض', costHalalas: 10, fromStockHalalas: 5 }, A)).toThrow(/أكثر من مخزون/);
    expect(validateJournalEntry(transferJournal({ id: 't', date: '2026-07-06', from: 'جدة', to: 'الرياض', costHalalas: 5, fromStockHalalas: 5 }, A).journal).valid).toBe(true);
  });
  it('branch KPIs: stock, net sales, margin, discount rate and turnover', () => {
    const k = branchKpis([
      { branch: 'الرياض', kind: 'purchase', amount: 1_000_000 }, { branch: 'الرياض', kind: 'sale', gross: 500_000, discount: 50_000, cost: 300_000 },
      { branch: 'الرياض', kind: 'transfer-out', amount: 200_000 }, { branch: 'جدة', kind: 'transfer-in', amount: 200_000 }, { branch: 'جدة', kind: 'sale', gross: 150_000, cost: 100_000 },
    ]);
    expect(k[0]).toMatchObject({ branch: 'الرياض', stock: 500_000, net: 450_000, margin: 150_000, marginPct: 33.33, discountPct: 10, turnover: 0.6 });
    expect(k[1]).toMatchObject({ branch: 'جدة', stock: 100_000, marginPct: 33.33, turnover: 1 });
  });
});
