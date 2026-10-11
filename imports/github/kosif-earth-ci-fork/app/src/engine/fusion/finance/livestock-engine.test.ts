import { describe, expect, it } from 'vitest';
import { costPerHead, cycleKpis, emptyCycleState, fairValueJournal, feedingJournal, feedPurchaseJournal, mortalityJournal, saleJournals, stockingJournal, type CycleState } from './livestock-engine';
import { validateJournalEntry } from './ledger-engine';

const A = { biologicalAccountId: 'a1395', feedAccountId: 'a1396', cashAccountId: 'a1100', receivableAccountId: 'a1200', payableAccountId: 'a2100', inputVatAccountId: 'a1400',
  outputVatAccountId: 'a2200', revenueAccountId: 'a4000', cogsAccountId: 'a5000', mortalityAccountId: 'a5190', fairValueAccountId: 'a4950' };
const C = { id: 'barn-1', name: 'حظيرة 1 — نعيمي', unit: 'رأس' };
const by = (lines: { accountId: string; debit: number; credit: number }[], id: string) => Math.round(lines.filter((l) => l.accountId === id).reduce((s, l) => s + l.debit - l.credit, 0) * 100) / 100;

describe('the agriculture pack', () => {
  it('a flock through its cycle: stocking, feed, births, deaths and a sale at the average cost per head', () => {
    let s: CycleState = emptyCycleState();
    const st = stockingJournal(C, { id: 's', date: '2026-01-03', heads: 100, amountHalalas: 9_000_000 }, 0.15, A);
    expect(validateJournalEntry(st.journal).valid).toBe(true); expect(by(st.journal.lines, 'a1395')).toBe(90_000); expect(by(st.journal.lines, 'a1100')).toBe(-103_500);
    s = { ...s, heads: 100, bought: 100, costHalalas: 9_000_000 };
    const fp = feedPurchaseJournal({ id: 'f', date: '2026-01-04', supplier: 'شركة الأعلاف', amountHalalas: 2_000_000 }, 0.15, A);
    expect(validateJournalEntry(fp.journal).valid).toBe(true);
    const fd = feedingJournal(C, s, { id: 'fd', date: '2026-01-31', amountHalalas: 1_000_000, feedOnHandHalalas: 2_000_000 }, A);
    expect(validateJournalEntry(fd.journal).valid).toBe(true);
    s = { ...s, costHalalas: 10_000_000, feedHalalas: 1_000_000 };
    expect(costPerHead(s)).toBe(100_000);
    s = { ...s, heads: 125, born: 25 }; /* lambing: 25 heads with no purchase cost — the cost per head falls to 800 */
    expect(costPerHead(s)).toBe(80_000);
    const mt = mortalityJournal(C, s, { id: 'm', date: '2026-02-10', heads: 5, cause: 'مرض تنفسي' }, A);
    expect(mt.cost).toBe(400_000); expect(validateJournalEntry(mt.journal).valid).toBe(true);
    s = { ...s, heads: 120, dead: 5, costHalalas: 9_600_000 };
    const sl = saleJournals(C, s, { id: 'x', date: '2026-03-20', heads: 60, amountHalalas: 8_700_000, customer: 'ملحمة الوادي', onCredit: true }, 0.15, A);
    expect(validateJournalEntry(sl.journal).valid).toBe(true); expect(validateJournalEntry(sl.costJournal).valid).toBe(true);
    expect(sl.cost).toBe(4_800_000); expect(by(sl.journal.lines, 'a1200')).toBe(100_050); expect(sl.journal.party).toBe('ملحمة الوادي');
    s = { ...s, heads: 60, sold: 60, costHalalas: 4_800_000, revenueHalalas: 8_700_000, cogsHalalas: 4_800_000 };
    expect(cycleKpis(s)).toEqual({ heads: 60, costPerHeadHalalas: 80_000, mortalityPct: 4, birthPct: 25, feedPerHeadHalalas: 8_000, marginHalalas: 3_900_000, marginPct: 44.83 });
    /* the last heads take exactly what is left, so no cost remains on an empty cycle */
    expect(saleJournals(C, { ...s, costHalalas: 4_800_001 }, { id: 'y', date: '2026-03-21', heads: 60, amountHalalas: 1 }, 0, A).cost).toBe(4_800_001);
  });
  it('IAS 41: remeasured to fair value less costs to sell, a gain or a loss', () => {
    const s = { ...emptyCycleState(), heads: 60, costHalalas: 4_800_000 };
    const up = fairValueJournal(C, s, { id: 'v', date: '2026-06-30', fairValuePerHeadHalalas: 100_000, costsToSellPerHeadHalalas: 5_000 }, A);
    expect(up.change).toBe(900_000); expect(by(up.journal.lines, 'a4950')).toBe(-9_000); expect(validateJournalEntry(up.journal).valid).toBe(true);
    const down = fairValueJournal(C, s, { id: 'v', date: '2026-06-30', fairValuePerHeadHalalas: 75_000, costsToSellPerHeadHalalas: 5_000 }, A);
    expect(down.change).toBe(-600_000); expect(by(down.journal.lines, 'a1395')).toBe(-6_000);
  });
  it('refuses what cannot be', () => {
    const s = { ...emptyCycleState(), heads: 10, costHalalas: 1_000_000 };
    expect(() => mortalityJournal(C, s, { id: 'm', date: '2026-02-10', heads: 11, cause: 'x' }, A)).toThrow(/أكثر/);
    expect(() => mortalityJournal(C, s, { id: 'm', date: '2026-02-10', heads: 1, cause: ' ' }, A)).toThrow(/سبب/);
    expect(() => saleJournals(C, s, { id: 'x', date: '2026-03-20', heads: 11, amountHalalas: 1 }, 0.15, A)).toThrow(/أكثر/);
    expect(() => saleJournals(C, s, { id: 'x', date: '2026-03-20', heads: 1, amountHalalas: 1, onCredit: true }, 0.15, A)).toThrow(/العميل/);
    expect(() => feedingJournal(C, s, { id: 'f', date: '2026-01-31', amountHalalas: 10, feedOnHandHalalas: 5 }, A)).toThrow(/أكثر/);
    expect(() => feedingJournal(C, emptyCycleState(), { id: 'f', date: '2026-01-31', amountHalalas: 1, feedOnHandHalalas: 5 }, A)).toThrow(/لا رؤوس/);
    expect(() => fairValueJournal(C, s, { id: 'v', date: '2026-06-30', fairValuePerHeadHalalas: 100_000, costsToSellPerHeadHalalas: 0 }, A)).toThrow(/تساوي/);
  });
});
