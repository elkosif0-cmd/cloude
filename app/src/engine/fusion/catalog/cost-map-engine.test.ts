import { describe, expect, it } from 'vitest';
import { breakevenUnits, classifyExpense, costCeiling, costChecks, inventoryView, priceForMargin, productCostMap, roundPrice, scenario, sensitivity, type PricingState } from './cost-map-engine';

// the demo pricing record (ui/core/demo.js): VAT 15%, waste by yield, margin on the VAT-inclusive price, target 25%, rounding «nine»
const S: PricingState = {
  settings: { vat: 15, waste: 'yield', base: 'gross', target: 25, good: 15, excellent: 25, round: 'nine' },
  raws: [
    { id: 'r1', name: 'نعيمي طازج', buy: 52, vat: 'incl', waste: 8, price: 69, kind: 'main' },
    { id: 'r8', name: 'كبدة غنم', buy: 28, vat: 'incl', waste: 0, price: 39, kind: 'main' },
    { id: 'r9', name: 'لية نعيمي', buy: 18, vat: 'incl', waste: 0, price: 12, kind: 'main' },
  ],
  boxes: [
    { id: 'b1', name: 'بوكس النعيمي العائلي', price: 329, dishes: 12, dishCost: 0, comps: [{ t: 'raw', id: 'r1', q: 4 }, { t: 'raw', id: 'r8', q: 0.5 }], ohs: [{ id: 'o1', label: 'تغليف وصحون', amt: 12, vat: 'incl' }] },
    { id: 'b6', name: 'بوكس مضاعف', price: 700, dishes: 0, comps: [{ t: 'box', id: 'b1', q: 2 }], ohs: [] },
    { id: 'b7', name: 'حلقة أ', price: 100, comps: [{ t: 'box', id: 'b8', q: 1 }] },
    { id: 'b8', name: 'حلقة ب', price: 100, comps: [{ t: 'box', id: 'b7', q: 1 }] },
  ],
  exps: [
    { id: 'e1', name: 'توصيل مبرد للعميل', amt: 15, method: 'fixed', vat: 'none', links: ['b1'] },
    { id: 'e3', name: 'خلطة بهارات وتتبيل', amt: 6, method: 'fixed', vat: 'incl', links: ['b1'] },
    { id: 'ek', name: 'تقطيع', amt: 2, method: 'kg', vat: 'excl', links: ['b1'] },
    { id: 'ep', name: 'تجهيز', amt: 5, method: 'pct', links: ['b1'] },
  ],
};
const r1Cost = 52 / 1.15 / 0.92, r8Net = 28 / 1.15, comp = r1Cost * 4 + r8Net * 0.5;

describe('cost map', () => {
  it('opens a raw into purchase and waste, with the pricing engine’s margin, break-even and rounded target', () => {
    const m = productCostMap(S, 'r1')!;
    expect(m.kind).toBe('raw');
    expect(m.lines.map((l) => l.kind)).toEqual(['purchase', 'waste']);
    expect(m.total).toBeCloseTo(r1Cost, 2);
    expect(m.priceNet).toBe(60);
    expect(m.margin!).toBeCloseTo((60 - r1Cost) / 69, 5);          // margin on the VAT-inclusive price (base: gross)
    expect(m.breakeven).toBeCloseTo(r1Cost * 1.15, 2);
    expect(m.target).toBe(79.9);                                     // 49.15 ÷ (1/1.15 − 0.25) = 79.33 → «nine» → 79.90
    expect(m.band).toBe('good');
    expect(m.lines[1].formula.join(' ')).toContain('8%');
  });

  it('rolls a box up from its components, overheads and every linked expense method', () => {
    const m = productCostMap(S, 'b1')!;
    const exp = 15 + 6 / 1.15 + 2 * 4.5 + 0.05 * comp;
    expect(m.components).toBeCloseTo(comp, 2);
    expect(m.weight).toBe(4.5);
    expect(m.total).toBeCloseTo(comp + 12 / 1.15 + exp, 2);
    expect(m.lines.find((l) => l.key === 'e:e1')!.cls).toBe('selling');
    expect(m.lines.find((l) => l.key === 'e:e3')!.cls).toBe('conversion');
    expect(m.lines.find((l) => l.key === 'o0')!.cls).toBe('materials');
    expect(m.lines.reduce((s, l) => s + l.share, 0)).toBeCloseTo(1, 6);
    // a nested box counts at its component cost, and a cycle is reported instead of looping
    const n = productCostMap(S, 'b6')!;
    expect(n.total).toBeCloseTo(comp * 2, 2);
    expect(n.weight).toBe(9);
    expect(productCostMap(S, 'b7')!.cycle).toBe(true);
    expect(productCostMap(S, 'nope')).toBeNull();
  });

  it('re-prices a what-if: a new quantity moves the per-kg and %-of-components expenses with it', () => {
    const m = productCostMap(S, 'b1')!;
    const s = scenario(m, { lines: { c0: { qty: 5 } } });
    const comp2 = r1Cost * 5 + r8Net * 0.5;
    expect(s.weight).toBe(5.5);
    expect(s.total).toBeCloseTo(comp2 + 12 / 1.15 + 15 + 6 / 1.15 + 2 * 5.5 + 0.05 * comp2, 1);
    expect(s.deltaMarginPts!).toBeLessThan(0);
    // a draft packaging line (VAT-inclusive) and a new price
    const d = scenario(m, { priceGross: 349, drafts: [{ id: 'd1', type: 'packaging', label: 'علبة', qty: 2, unitCost: 2.3, vat: 'incl' }] });
    expect(d.drafts[0].amount).toBe(4);
    expect(d.total).toBeCloseTo(m.total + 4, 2);
    expect(d.price).toBe(349);
    // waste on a raw input re-derives its unit cost
    const w = scenario(productCostMap(S, 'r1')!, { lines: { waste: { waste: 0 } } });
    expect(w.total).toBeCloseTo(52 / 1.15, 2);
    expect(scenario(m, {}).total).toBe(m.total);
  });

  it('ranks the drivers, finds the price for a margin and the cost ceiling', () => {
    const m = productCostMap(S, 'b1')!;
    const s = sensitivity(m);
    expect(s[0].key).toBe('price');                                  // the price moves the margin most, then the main raw
    expect(s[1].key).toBe('c0');
    const p = priceForMargin(m, 0.25)!;
    expect(p % 10).toBe(9);                                          // ≥ 100 → ends in 9
    expect(p * (1 / 1.15 - 0.25)).toBeGreaterThanOrEqual(m.total - 0.01);
    const c = costCeiling(m)!;
    expect(c.ceiling).toBeCloseTo(329 / 1.15 - 0.25 * 329, 2);
    expect(c.headroom).toBeCloseTo(c.ceiling - m.total, 2);
    expect(roundPrice(145.23, 'half')).toBe(145.5);
    expect(breakevenUnits(m, 5000)!.units).toBe(Math.ceil(5000 / m.profit));
  });

  it('gives the IAS 2 view and the controls', () => {
    const m = productCostMap(S, 'b1')!;
    const iv = inventoryView(m);
    expect(iv.selling).toBe(15);
    expect(iv.inventoriable).toBeCloseTo(m.total - 15, 2);
    expect(iv.nrv).toBeCloseTo(329 / 1.15 - 15, 2);
    expect(iv.writeDown).toBe(0);
    const ok = costChecks(m, { catalogCost: m.total });
    expect(ok[0]).toMatchObject({ level: 'ok', code: 'reconciled' });
    expect(costChecks(m, { catalogCost: m.total + 1 })[0].code).toBe('unreconciled');
    const loss = costChecks(productCostMap(S, 'r9')!);                // bought at 18 incl., sold at 12
    expect(loss.map((c) => c.code)).toEqual(expect.arrayContaining(['loss', 'nrv']));
    expect(classifyExpense('جل ثلجي للنقل')).toBe('selling');
    expect(classifyExpense('صحون وتغليف مفرغ')).toBe('materials');
    expect(classifyExpense('رسوم إدارية')).toBe('admin');
  });
});
