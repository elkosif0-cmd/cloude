import {describe,expect,it} from 'vitest';
import {calculateBoxEconomics,validateBoxRecipe,type BoxRecipe} from './box-engine';

const items=[
  {id:'a',sku:'A',name:'A',unit:'kg' as const,vatRate:.15,defaultCost:50,active:true},
  {id:'b',sku:'B',name:'B',unit:'kg' as const,vatRate:.15,defaultCost:20,active:true},
];
const recipe:BoxRecipe={id:'BOX1',name:'بوكس',lines:[{itemId:'a',quantity:2},{itemId:'b',quantity:1}],sellingPriceIncVat:172.5,vatRate:.15,targetMarginPercent:20,active:true};

describe('box builder',()=>{
  it('calculates composition cost and margin',()=>{
    const result=calculateBoxEconomics(recipe,items);
    expect(result.totalCostExVat).toBe(120);
    expect(result.sellingPriceExVat).toBe(150);
    expect(result.profitExVat).toBe(30);
    expect(result.marginPercent).toBe(20);
    expect(result.minimumPriceForTargetMarginIncVat).toBe(172.5);
  });
  it('validates recipe lines',()=>{
    expect(validateBoxRecipe(recipe).valid).toBe(true);
    expect(validateBoxRecipe({...recipe,lines:[]}).issues).toContain('LINES_REQUIRED');
  });
});
