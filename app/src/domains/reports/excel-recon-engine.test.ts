import {describe,expect,it} from 'vitest';
import {parseExcelReconText,reconcileExcelRows} from './excel-recon-engine';

const items=[{id:'item-1',sku:'A1',name:'نعيمي',unit:'kg' as const,vatRate:.15,defaultCost:50,defaultPrice:70,active:true}];

describe('Excel reconciliation',()=>{
  it('parses pasted cost and price rows',()=>{
    expect(parseExcelReconText('نعيمي\t50\t70')).toEqual([{sourceName:'نعيمي',cost:50,price:70}]);
  });

  it('marks equal net values as matched',()=>{
    const rows=reconcileExcelRows({rows:[{sourceName:'نعيمي',cost:50,price:70}],items,vatMode:'net'});
    expect(rows[0]).toEqual(expect.objectContaining({status:'MATCH',costDifference:0,priceDifference:0}));
  });

  it('converts VAT-inclusive spreadsheet values before comparison',()=>{
    const rows=reconcileExcelRows({rows:[{sourceName:'نعيمي',cost:57.5,price:80.5}],items,vatMode:'inclusive'});
    expect(rows[0]).toEqual(expect.objectContaining({excelCostNet:50,excelPriceNet:70,status:'MATCH'}));
  });

  it('flags meaningful cost differences for review',()=>{
    const rows=reconcileExcelRows({rows:[{sourceName:'نعيمي',cost:60,price:70}],items,vatMode:'net',tolerancePercent:.5});
    expect(rows[0].status).toBe('REVIEW');
    expect(rows[0].costDifferencePercent).toBe(20);
  });
});
