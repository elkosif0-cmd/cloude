import {describe,expect,it} from 'vitest';
import {calculateMateriality} from './materiality-engine';

describe('materiality engine',()=>{
  it('calculates overall performance and trivial materiality',()=>{
    expect(calculateMateriality({
      benchmark:'revenue',benchmarkAmount:10_000_000,benchmarkRate:0.01,performanceRate:0.75,trivialRate:0.05
    })).toEqual({overall:100000,performance:75000,trivial:5000});
  });
});

import {planMateriality} from './materiality-engine';
describe('materiality plan (ISA 320) from global practice',()=>{
  const base={pbt:2_000_000_00,revenue:30_000_000_00,assets:25_000_000_00,equity:12_000_000_00};
  it('uses 5% of profit before zakat for a profitable entity, 75% performance and 5% trivial',()=>{
    const p=planMateriality(base);
    expect(p.benchmark).toBe('pbt');expect(p.rate).toBe(0.05);expect(p.overall).toBe(100_000_00);
    expect(p.performanceRate).toBe(0.75);expect(p.performance).toBe(75_000_00);expect(p.trivial).toBe(5_000_00);
    expect(p.crossCheck.find(x=>x.ar==='الإيرادات')!.pct).toBeCloseTo(0.33,2);
  });
  it('normalises profit by adding back impairment and removing a disposal gain (Unilever, AstraZeneca)',()=>{
    const p=planMateriality({...base,addBacks:[{label:'انخفاض قيمة',amount:500_000_00},{label:'ربح بيع أصل',amount:-100_000_00}]});
    expect(p.base).toBe(2_400_000_00);expect(p.overall).toBe(120_000_00);expect(p.why).toContain('انخفاض قيمة');
  });
  it('falls back to revenue when profit is near break-even and to assets for a holding company',()=>{
    expect(planMateriality({...base,pbt:100_000_00}).benchmark).toBe('revenue');
    const h=planMateriality({...base,holding:true});expect(h.benchmark).toBe('assets');expect(h.rate).toBe(0.005);
  });
  it('lowers performance materiality for risk factors and never below 50% (bp 65%)',()=>{
    expect(planMateriality({...base,risk:{priorMisstatements:'few',controlDeficiencies:true}}).performanceRate).toBe(0.6);
    expect(planMateriality({...base,risk:{firstYear:true,priorMisstatements:'many',controlDeficiencies:true,managementCorrects:false}}).performanceRate).toBe(0.5);
  });
  it('caps the profit rate at 5% for a public-interest entity and rounds to three significant figures',()=>{
    const p=planMateriality({...base,rate:0.08,risk:{publicInterest:true}});expect(p.rate).toBe(0.05);
    expect(planMateriality({...base,pbt:2_345_678_91}).overall).toBe(117_000_00);
  });
});
