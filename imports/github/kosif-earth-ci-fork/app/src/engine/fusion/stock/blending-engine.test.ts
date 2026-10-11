import {describe,expect,it} from 'vitest';
import {calculateBlend,validateBlend,type BlendRecipe} from './blending-engine';

const recipe:BlendRecipe={
  id:'B1',name:'Blend',leanKg:20,fatKg:5,leanCostPerKg:48,fatCostPerKg:15,
  spicesCost:85,packagingCost:45,shrinkPercent:6,pieceGrams:150,targetMarginPercent:35,
};

describe('blending engine',()=>{
  it('calculates yield cost pieces and target pricing',()=>{
    const result=calculateBlend(recipe);
    expect(result.rawWeightKg).toBe(25);
    expect(result.leanPercent).toBe(80);
    expect(result.fatPercent).toBe(20);
    expect(result.netYieldKg).toBe(23.5);
    expect(result.totalCost).toBe(1165);
    expect(result.pieces).toBe(156);
    expect(result.expectedProfit).toBeGreaterThan(0);
  });
  it('validates recipe inputs',()=>{
    expect(validateBlend(recipe).valid).toBe(true);
    expect(validateBlend({...recipe,leanKg:0,fatKg:0}).issues).toContain('WEIGHT_REQUIRED');
  });
});
