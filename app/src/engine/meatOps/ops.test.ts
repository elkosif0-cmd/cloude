import { describe, expect, it } from 'vitest';
import { ageReceivables, allocateCarcassCost, customerBalanceHalalas, dressingPct, suggestPriceHalalas, toHalalas } from './ops';

describe('S.kosif Meat Economics V37', () => {
  it('calculates dressing percentage', () => {
    expect(dressingPct({ liveWeightKg: 50, carcassWeightKg: 30 })).toBeCloseTo(60, 8);
  });

  it('allocates carcass cost across cuts without losing material cost', () => {
    const rows=allocateCarcassCost(
      { id:'c1', name:'نعيمي', liveWeightKg:50, carcassWeightKg:30, totalCostHalalas:toHalalas(1200) },
      [
        { id:'leg', name:'فخذ', yieldPct:40, pricePerKgHalalas:toHalalas(90) },
        { id:'shoulder', name:'كتف', yieldPct:30, pricePerKgHalalas:toHalalas(75) },
        { id:'other', name:'أخرى', yieldPct:30, pricePerKgHalalas:toHalalas(55) },
      ]
    );
    expect(rows.reduce((s,x)=>s+x.allocatedCostHalalas,0)).toBe(toHalalas(1200));
    expect(rows.reduce((s,x)=>s+x.weightKg,0)).toBeCloseTo(30,8);
  });

  it('produces true cost/kg and margin from allocated carcass cost', () => {
    const [row]=allocateCarcassCost(
      { id:'c1', name:'نعيمي', liveWeightKg:50, carcassWeightKg:30, totalCostHalalas:toHalalas(1200) },
      [{ id:'all', name:'الكل', yieldPct:100, pricePerKgHalalas:toHalalas(60) }]
    );
    expect(row.costPerKgHalalas).toBe(toHalalas(40));
    expect(row.marginPerKgHalalas).toBe(toHalalas(20));
    expect(row.marginPct).toBeCloseTo(33.333333,5);
  });

  it('suggests a price from target margin', () => {
    expect(suggestPriceHalalas(toHalalas(100),25)).toBe(13334);
  });

  it('calculates customer balance as opening + billed - paid', () => {
    expect(customerBalanceHalalas(1000,5000,2500)).toBe(3500);
  });

  it('ages receivables into standard buckets', () => {
    const a=ageReceivables([
      {id:'a',customerId:'c',invoiceDate:'2026-09-24',totalHalalas:1000,paidHalalas:0},
      {id:'b',customerId:'c',invoiceDate:'2026-09-10',totalHalalas:2000,paidHalalas:500},
      {id:'c',customerId:'c',invoiceDate:'2026-08-10',totalHalalas:3000,paidHalalas:0},
      {id:'d',customerId:'c',invoiceDate:'2026-07-01',totalHalalas:4000,paidHalalas:0},
      {id:'e',customerId:'c',invoiceDate:'2026-05-01',totalHalalas:5000,paidHalalas:0},
    ],'2026-09-24');
    expect(a.current).toBe(1000);
    expect(a.d1_30).toBe(1500);
    expect(a.d31_60).toBe(3000);
    expect(a.d61_90).toBe(4000);
    expect(a.d90plus).toBe(5000);
    expect(a.total).toBe(14500);
  });
});
