import {describe,expect,it} from 'vitest';
import {calculateCatering,type CateringQuote} from './catering-engine';

const quote:CateringQuote={
  id:'Q1',title:'BBQ',guests:25,profile:'bbq',meatCostPerKg:48,marginPercent:35,vatRate:.15,
  marinated:true,marinationCostPerKg:6,toolsPack:true,toolsCostPerGuest:4,createdAt:'2026-09-25',
};

describe('catering engine',()=>{
  it('calculates quantities cost margin VAT and price per guest',()=>{
    const result=calculateCatering(quote);
    expect(result.gramsPerGuest).toBe(450);
    expect(result.totalRawKg).toBe(11.25);
    expect(result.meatCost).toBe(540);
    expect(result.marinationCost).toBe(67.5);
    expect(result.toolsCost).toBe(100);
    expect(result.finalPriceIncVat).toBeGreaterThan(result.totalCostExVat);
    expect(result.pricePerGuestIncVat).toBeGreaterThan(0);
  });
  it('supports custom grams per guest',()=>{
    expect(calculateCatering({...quote,profile:'custom',gramsPerGuest:400}).totalRawKg).toBe(10);
  });
});
