import { describe, expect, it } from 'vitest';
import { absorbJournal, batchJournal, completeJournal, costOfSalesJournal, emptyOrderState, issueJournal, materialsPurchaseJournal, priceForMargin, productionKpis, standardCost, wasteJournal } from './production-order-engine';
import { validateJournalEntry } from './ledger-engine';

const A = { materialsAccountId: 'a1370', wipAccountId: 'a1380', finishedAccountId: 'a1390', labourAccountId: 'a6100', overheadAccountId: 'a6300', scrapAccountId: 'a5100',
  varianceAccountId: 'a5170', wasteAccountId: 'a5180', cogsAccountId: 'a5000', payableAccountId: 'a2100', inputVatAccountId: 'a1400' };
/* a one-litre bottle: 0.05 kg of polyethylene at 8.00 a kg and a cap at 0.15; 0.20 labour and 0.10 overhead a unit → 0.85 */
const BOTTLE = { id: 'p1', name: 'عبوة 1 لتر', unit: 'عبوة', bom: [{ material: 'حبيبات بولي إيثيلين', qtyPerUnit: 0.05, unitCostHalalas: 800 }, { material: 'غطاء', qtyPerUnit: 1, unitCostHalalas: 15 }], labourPerUnitHalalas: 20, overheadPerUnitHalalas: 10 };
const ORDER = { id: 'MO-1', productId: 'p1', plannedQty: 10_000 };
const by = (lines: { accountId: string; debit: number; credit: number }[], id: string) => Math.round(lines.filter((l) => l.accountId === id).reduce((s, l) => s + l.debit - l.credit, 0) * 100) / 100;

describe('production: the factory order and the bakery batch', () => {
  it('a standard cost from the bill of materials, labour and overhead', () => {
    expect(standardCost(BOTTLE)).toEqual({ materials: 55, labour: 20, overhead: 10, total: 85 });
    expect(() => standardCost({ ...BOTTLE, bom: [] })).toThrow(/فارغة/);
  });
  it('materials bought on credit with input VAT', () => {
    const r = materialsPurchaseJournal({ id: 'b', date: '2026-07-01', supplier: 'مورد', amountHalalas: 1_000_000 }, 0.15, A);
    expect(validateJournalEntry(r.journal).valid).toBe(true); expect(by(r.journal.lines, 'a2100')).toBe(-11_500);
  });
  it('an order: issue, absorb, complete — an adverse variance closes the work in progress to zero', () => {
    const s = emptyOrderState();
    const i = issueJournal(ORDER, { id: 'i', date: '2026-07-02', amountHalalas: 560_000, materialsOnHandHalalas: 1_000_000 }, A); s.issuedHalalas = 560_000;
    const ab = absorbJournal(ORDER, BOTTLE, { id: 'a', date: '2026-07-20', units: 10_000 }, A); s.absorbedHalalas = ab.labour + ab.overhead;
    expect([ab.labour, ab.overhead]).toEqual([200_000, 100_000]);
    const c = completeJournal(ORDER, BOTTLE, s, { id: 'c', date: '2026-07-31', goodQty: 9_800, scrapQty: 200 }, A);
    for (const j of [i.journal, ab.journal, c.journal]) expect(validateJournalEntry(j).valid).toBe(true);
    expect([c.good, c.scrap, c.variance]).toEqual([833_000, 11_000, 16_000]);
    expect(by(i.journal.lines, 'a1380') + by(ab.journal.lines, 'a1380') + by(c.journal.lines, 'a1380')).toBe(0);
    expect(by(c.journal.lines, 'a5170')).toBe(160);
    expect(() => completeJournal(ORDER, BOTTLE, { ...s, closed: true }, { id: 'x', date: '2026-07-31', goodQty: 1, scrapQty: 0 }, A)).toThrow(/أُقفل/);
  });
  it('a favourable variance is a credit; issuing more than the store holds is refused', () => {
    const s = { ...emptyOrderState(), issuedHalalas: 500_000, absorbedHalalas: 300_000 };
    const c = completeJournal(ORDER, BOTTLE, s, { id: 'c', date: '2026-07-31', goodQty: 9_800, scrapQty: 200 }, A);
    expect(c.variance).toBe(-44_000); expect(by(c.journal.lines, 'a5170')).toBe(-440); expect(validateJournalEntry(c.journal).valid).toBe(true);
    expect(() => issueJournal(ORDER, { id: 'i', date: '2026-07-02', amountHalalas: 10, materialsOnHandHalalas: 5 }, A)).toThrow(/أكثر من رصيد/);
  });
  it('a bakery batch at actual cost, its yield, waste and cost of sales; a price at a target margin', () => {
    const BREAD = { id: 'b1', name: 'خبز صامولي', unit: 'قطعة', bom: [{ material: 'دقيق', qtyPerUnit: 0.2, unitCostHalalas: 300 }], labourPerUnitHalalas: 15, overheadPerUnitHalalas: 5 };
    const b = batchJournal(BREAD, { id: 'bt', date: '2026-07-05', plannedQty: 1_000, goodQty: 950, ingredientsHalalas: 60_000, wagesHalalas: 20_000, ingredientsOnHandHalalas: 100_000 }, A);
    expect(validateJournalEntry(b.journal).valid).toBe(true);
    expect([b.cost, b.unitCost, b.yieldPct, b.standardUnit]).toEqual([80_000, 84, 95, 80]);
    expect(by(b.journal.lines, 'a1390')).toBe(800); expect(by(b.journal.lines, 'a6100')).toBe(-200);
    expect(validateJournalEntry(wasteJournal({ id: 'w', date: '2026-07-06', amountHalalas: 4_000, reason: 'انتهاء الصلاحية', finishedOnHandHalalas: 80_000 }, A).journal).valid).toBe(true);
    expect(() => wasteJournal({ id: 'w', date: '2026-07-06', amountHalalas: 90_000, reason: 'تلف', finishedOnHandHalalas: 80_000 }, A)).toThrow(/أكثر من رصيد/);
    expect(validateJournalEntry(costOfSalesJournal({ id: 's', date: '2026-07-06', amountHalalas: 70_000, finishedOnHandHalalas: 76_000 }, A).journal).valid).toBe(true);
    expect(productionKpis({ plannedQty: 10_000, goodQty: 9_800, scrapQty: 200, actualHalalas: 860_000, standardHalalas: 844_000 })).toEqual({ yieldPct: 98, scrapPct: 2, variancePct: 1.9, unitCostHalalas: 88 });
    expect(priceForMargin(84, 40, 0.15)).toEqual({ net: 140, gross: 161 });
  });
});
