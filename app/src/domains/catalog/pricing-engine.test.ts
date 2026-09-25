import {describe,expect,it} from 'vitest';
import {calculatePricing} from './pricing-engine';

describe('pricing engine',()=>{
  it('removes VAT and applies waste to usable cost',()=>{
    const result=calculatePricing({purchaseInclusiveVat:35,sellingInclusiveVat:61.99,vatRate:0.15,wasteRate:0.27});
    expect(result.purchaseExVat).toBe(30.43);
    expect(result.usableCostExVat).toBe(41.69);
  });

  it('calculates margin against VAT-inclusive selling value',()=>{
    const result=calculatePricing({purchaseInclusiveVat:25.3,sellingInclusiveVat:39.93,vatRate:0.15,wasteRate:0});
    expect(result.grossProfitInclusiveVat).toBe(14.63);
    expect(result.grossMarginPercentOnInclusiveSales).toBeCloseTo(36.64,2);
  });
});
