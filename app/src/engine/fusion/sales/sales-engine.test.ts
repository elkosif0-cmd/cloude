import {describe,expect,it} from 'vitest';
import {calculateSalesTotals,grossMargin} from './sales-engine';

describe('sales engine',()=>{
  it('calculates discounts and VAT per line',()=>{
    const result=calculateSalesTotals([
      {itemId:'A',quantity:2,unitPrice:100,discount:20,vatRate:0.15},
      {itemId:'B',quantity:1,unitPrice:50,vatRate:0.15},
    ]);
    expect(result).toEqual({subtotal:250,discount:20,taxable:230,vat:34.5,total:264.5});
  });

  it('calculates margin as profit divided by revenue',()=>{
    expect(grossMargin({revenue:100,cost:70})).toEqual({profit:30,marginPercent:30});
  });
});
