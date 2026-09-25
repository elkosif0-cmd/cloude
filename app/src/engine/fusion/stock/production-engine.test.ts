import {describe,expect,it} from 'vitest';
import {agingEconomics,butcherYield} from './production-engine';

describe('meat production',()=>{
  it('calculates carcass yield and reconciliation',()=>{
    const result=butcherYield({id:'S1',butcher:'A',carcassTag:'T1',hangingKg:20,primeKg:12,boneKg:4,fatKg:3,wasteKg:1,date:'2026-09-25'});
    expect(result.yieldPercent).toBe(60);
    expect(result.balanced).toBe(true);
  });
  it('calculates dry-aging cost uplift',()=>{
    const result=agingEconomics({id:'A1',tag:'Ribeye',cut:'Ribeye',type:'dry',rawKg:10,rawCostKg:100,entryDate:'2026-09-01',targetDays:30,marginPercent:35,status:'ACTIVE'},new Date('2026-09-21T00:00:00Z'));
    expect(result.daysElapsed).toBe(20);
    expect(result.usableKg).toBeLessThan(10);
    expect(result.realCostPerKg).toBeGreaterThan(100);
  });
});
