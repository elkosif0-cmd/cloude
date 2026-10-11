import {describe,expect,it} from 'vitest';
import {calculateYield} from './yield-engine';

describe('yield engine',()=>{
  it('calculates usable yield and cost per kg',()=>{
    expect(calculateYield({purchaseCost:1000,grossWeight:20,usableWeight:15,byproductRecovery:100})).toEqual({
      yieldPercent:75,
      wasteWeight:5,
      netCost:900,
      costPerUsableKg:60,
    });
  });
});
