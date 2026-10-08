import {describe,expect,it} from 'vitest';
import {excelCostDiagnosis,parseExcelReconText,reconcileExcelRows} from './excel-recon-engine';

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

describe('the Excel cost diagnosis (moved from the screen, #22)',()=>{
  const base={vatMode:'net' as const,vat:.15,netBase:true,yieldMethod:true};
  it('a sheet cost within 0.3% of the true cost matches, with both margins on the net base',()=>{
    const d=excelCostDiagnosis({...base,excelCost:50.1,item:{name:'نعيمي',cost:50,price:115}});
    expect(d.code).toBe('MATCH');
    expect(d.trueMargin).toBeCloseTo((100-50)/100,6);
    expect(d.excelMargin).toBeCloseTo((100-50.1)/100,6);
  });
  it('the sign: positive gap = the sheet shows less than the truth',()=>{
    expect(excelCostDiagnosis({...base,excelCost:40,item:{name:'x',cost:50,price:115}})).toMatchObject({code:'UNDER',gap:10,gapPct:.25});
    expect(excelCostDiagnosis({...base,excelCost:60,item:{name:'x',cost:50,price:115}}).code).toBe('OVER');
  });
  it('names the waste-method difference both ways (exactly 1/((1−w)(1+w)))',()=>{
    const w=.2,truth=40/(1-w),sheet=40*(1+w);
    expect(excelCostDiagnosis({...base,excelCost:sheet,item:{name:'x',cost:truth,price:115,kind:'raw',waste:20}}).code).toBe('WASTE_EXCEL_ADDS');
    expect(excelCostDiagnosis({...base,yieldMethod:false,excelCost:truth,item:{name:'x',cost:sheet,price:115,kind:'raw',waste:20}}).code).toBe('WASTE_EXCEL_DIVIDES');
    expect(excelCostDiagnosis({...base,excelCost:sheet,item:{name:'x',cost:truth,price:115,kind:'box',waste:20}}).code).toBe('UNDER');
  });
  it('spots a VAT-inclusive cost typed as net, and nets a gross sheet',()=>{
    expect(excelCostDiagnosis({...base,excelCost:57.5,item:{name:'x',cost:50,price:115}}).code).toBe('VAT_INCLUSIVE');
    const g=excelCostDiagnosis({...base,vatMode:'gross',excelCost:57.5,item:{name:'x',cost:50,price:115}});
    expect(g.code).toBe('MATCH');expect(g.xcNet).toBeCloseTo(50,9);
  });
  it('a price in the sheet replaces the catalog price; the gross base divides by the gross price',()=>{
    const d=excelCostDiagnosis({...base,netBase:false,excelCost:50,excelPrice:230,item:{name:'x',cost:50,price:115}});
    expect(d.price).toBe(230);
    expect(d.trueMargin).toBeCloseTo((200-50)/230,6);
  });
});
