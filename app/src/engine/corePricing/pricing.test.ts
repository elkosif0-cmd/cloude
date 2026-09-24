import { describe, expect, it } from 'vitest';
import {
  PricingCycleError,
  applyRoundingPolicy,
  calculateBoxBreakdown,
  calculateBoxPricing,
  calculateRawPricing,
  calculateUsableUnitCost,
  evaluatePrice,
  extractNetPrice,
  fromHalalas,
  hasCircularDependency,
  nrvAllocate,
  roundToPrecision,
  toHalalas,
  yieldTrial,
} from './pricing';
import type { BoxDefinition, EngineSettings, RawItem } from './types';

const settings: EngineSettings = {
  defaultVatRate: 0.15,
  wasteMethod: 'yield',
  marginMode: 'net',
  roundingPolicy: 'ending_dot_90',
  marginThresholds: { excellent: 0.25, good: 0.15 },
};

const raw: RawItem = {
  id: 'r1',
  name: 'نعيمي',
  purchasePrice: 115,
  isVatInclusive: true,
  wastePercent: 0.10,
  sellingPriceNet: 140,
  category: 'غنم',
  unit: 'kg',
  supplierId: 's1',
};

describe('S.kosif strict pricing kernel', () => {
  it('extracts reclaimable VAT from a gross purchase price', () => {
    expect(extractNetPrice(115, true, 0.15)).toBeCloseTo(100, 8);
    expect(extractNetPrice(100, false, 0.15)).toBe(100);
  });

  it('implements yield and markup waste methods exactly', () => {
    expect(calculateUsableUnitCost(100, 0.10, 'yield')).toBeCloseTo(111.111111, 5);
    expect(calculateUsableUnitCost(100, 0.10, 'markup')).toBeCloseTo(110, 8);
    expect(() => calculateUsableUnitCost(100, 1, 'yield')).toThrow();
  });

  it('implements all six rounding policies and never goes below floor cost', () => {
    expect(applyRoundingPolicy(145.236, 'none')).toBe(145.236);
    expect(applyRoundingPolicy(145.236, 'two_decimals')).toBe(145.24);
    expect(applyRoundingPolicy(145.23, 'whole_riyal_up')).toBe(146);
    expect(applyRoundingPolicy(145.23, 'half_riyal_up')).toBe(145.5);
    expect(applyRoundingPolicy(145.23, 'ending_dot_90')).toBe(145.9);
    expect(applyRoundingPolicy(142, 'ending_9')).toBe(149);
    expect(applyRoundingPolicy(149, 'ending_9')).toBe(149);
    expect(applyRoundingPolicy(150, 'ending_9')).toBe(159);
    expect(applyRoundingPolicy(140, 'ending_dot_90', 145.23)).toBeGreaterThanOrEqual(145.23);
  });

  it('keeps the rounding floor invariant across a price range', () => {
    const policies: EngineSettings['roundingPolicy'][] = [
      'none','two_decimals','whole_riyal_up','half_riyal_up','ending_dot_90','ending_9'
    ];
    for (const policy of policies) {
      for (let i = 1; i <= 400; i += 7) {
        const floor = i + 0.37;
        const value = i - 3.11;
        expect(applyRoundingPolicy(value, policy, floor)).toBeGreaterThanOrEqual(floor - 1e-9);
      }
    }
  });

  it('prices a raw item using the same pure kernel', () => {
    const out = calculateRawPricing(raw, settings, 0.25);
    expect(out.totalCostNet).toBeCloseTo(111.1111, 4);
    expect(out.sellingPriceNet).toBe(140);
    expect(out.profitNet).toBeCloseTo(28.8889, 4);
    expect(out.marginPercent).toBeCloseTo(28.8889 / 140, 5);
  });

  it('solves target price for net and gross_excel margin modes', () => {
    const net = evaluatePrice(100, 138, 0.25, settings);
    expect(net.targetPriceGross).toBe(153.9);
    const gross = evaluatePrice(100, 138, 0.15, { ...settings, marginMode: 'gross_excel', roundingPolicy: 'two_decimals' });
    expect(gross.targetPriceGross).toBeGreaterThan(gross.breakEvenPriceGross);
    expect(gross.marginPercent).toBeCloseTo((120 - 100) / 138, 6);
  });

  it('allocates all four linked expense methods to a box', () => {
    const box: BoxDefinition = {
      id: 'b1',
      name: 'بوكس تجريبي',
      components: [{ type: 'raw', itemId: 'r1', quantity: 2, applyWaste: true }],
      packaging: [{ id: 'p1', name: 'صحن', count: 3, unitCostNet: 2 }],
      linkedExpenses: [
        { id: 'e1', name: 'ثابت', method: 'fixed', value: 11.5, isVatInclusive: true },
        { id: 'e2', name: 'لكل كجم', method: 'per_kg', value: 2, isVatInclusive: false },
        { id: 'e3', name: 'لكل صحن', method: 'per_dish', value: 1.15, isVatInclusive: true },
        { id: 'e4', name: 'نسبة', method: 'percent_of_component_cost', value: 0.05, isVatInclusive: false },
      ],
      targetMargin: 0.25,
      sellingPriceNet: 400,
    };
    const b = calculateBoxBreakdown(box, [raw], [box], settings);
    expect(b.rawComponentsCostNet).toBeCloseTo(222.2222, 4);
    expect(b.packagingCostNet).toBe(6);
    expect(b.totalWeightKg).toBe(2);
    expect(b.dishesCount).toBe(3);
    expect(b.expensesCostNet).toBeCloseTo(28.1111, 4);
    expect(b.totalCostNet).toBeCloseTo(256.3333, 4);
  });

  it('supports nested boxes and calculates their cost recursively', () => {
    const child: BoxDefinition = {
      id: 'child', name: 'فرعي',
      components: [{ type: 'raw', itemId: 'r1', quantity: 1, applyWaste: false }],
      packaging: [], linkedExpenses: [], sellingPriceNet: 150,
    };
    const parent: BoxDefinition = {
      id: 'parent', name: 'رئيسي',
      components: [{ type: 'box', boxId: 'child', quantity: 2 }],
      packaging: [{ id: 'bag', name: 'تغليف', count: 1, unitCostNet: 5 }],
      linkedExpenses: [], sellingPriceNet: 300,
    };
    const b = calculateBoxBreakdown(parent, [{ ...raw, wastePercent: 0 }], [child, parent], settings);
    expect(b.totalCostNet).toBeCloseTo(205, 8);
  });

  it('detects and rejects circular nested boxes', () => {
    const a: BoxDefinition = { id:'a', name:'A', components:[{type:'box',boxId:'b',quantity:1}], packaging:[], linkedExpenses:[] };
    const b: BoxDefinition = { id:'b', name:'B', components:[{type:'box',boxId:'a',quantity:1}], packaging:[], linkedExpenses:[] };
    expect(hasCircularDependency('a','b',[a,b])).toBe(true);
    expect(() => calculateBoxBreakdown(a, [], [a,b], settings)).toThrow(PricingCycleError);
  });

  it('returns a full box pricing output including target and grade', () => {
    const box: BoxDefinition = {
      id:'b1', name:'بوكس',
      components:[{type:'raw',itemId:'r1',quantity:1,applyWaste:false}],
      packaging:[], linkedExpenses:[], targetMargin:0.25, sellingPriceNet:150,
    };
    const out=calculateBoxPricing(box,[{...raw,wastePercent:0}],[box],settings);
    expect(out.totalCostNet).toBeCloseTo(100,8);
    expect(out.profitNet).toBeCloseTo(50,8);
    expect(out.marginGrade).toBe('excellent');
    expect(out.targetPriceNet).toBeGreaterThanOrEqual(out.breakEvenPriceNet);
  });

  it('allocates NRV without losing joint cost', () => {
    const rows=nrvAllocate(1000,[
      {id:'leg',kg:10,pricePerKgNet:80},
      {id:'shoulder',kg:8,pricePerKgNet:60,furtherCostNet:20},
    ]);
    expect(rows.reduce((s,x)=>s+x.allocatedJointCostNet,0)).toBeCloseTo(1000,4);
    expect(rows.reduce((s,x)=>s+x.share,0)).toBeCloseTo(1,7);
  });

  it('calculates yield trial waste and effective usable cost', () => {
    const r=yieldTrial({inputKg:27.2,purchaseCostNet:952,usableKg:20.4});
    expect(r.wastePercent).toBeCloseTo(0.25,8);
    expect(r.effectiveKgCostNet).toBeCloseTo(46.6667,4);
  });

  it('uses integer halalas at money boundaries', () => {
    expect(toHalalas(61.995)).toBe(6200);
    expect(fromHalalas(6200)).toBe(62);
    expect(roundToPrecision(0.1 + 0.2, 2)).toBe(0.3);
  });
});
