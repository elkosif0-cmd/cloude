import {describe,expect,it} from 'vitest';
import {calculateInvoice} from './invoice-engine';

describe('invoice engine',()=>{
  it('calculates net VAT and inclusive total',()=>{
    const result=calculateInvoice([{description:'Item',quantity:2,unitPriceExVat:100,vatRate:0.15,discountExVat:20}]);
    expect(result.subtotalExVat).toBe(180);
    expect(result.vat).toBe(27);
    expect(result.totalIncVat).toBe(207);
  });
});
