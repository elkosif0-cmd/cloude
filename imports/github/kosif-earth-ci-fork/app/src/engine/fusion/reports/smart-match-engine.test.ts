import {describe,expect,it} from 'vitest';
import {bestCatalogMatch,learnAlias,matchSalesRows,nameSimilarity,normalizeArabic,parseSalesMatchText} from './smart-match-engine';

const items=[
  {id:'item-1',sku:'LAMB-1',name:'خروف نعيمي فاخر',unit:'kg' as const,vatRate:.15,active:true},
  {id:'item-2',sku:'GOAT-1',name:'تيس حري',unit:'kg' as const,vatRate:.15,active:true},
];

describe('smart sales matching',()=>{
  it('normalizes Arabic forms and digits',()=>{
    expect(normalizeArabic('نَعِيمي ١٢')).toBe('نعيمي 12');
  });
  it('scores exact and token similarity',()=>{
    expect(nameSimilarity('خروف نعيمي فاخر','خروف نعيمي فاخر')).toBe(100);
    expect(nameSimilarity('نعيمي فاخر','خروف نعيمي فاخر')).toBeGreaterThanOrEqual(75);
  });
  it('matches free sales text to catalog',()=>{
    expect(bestCatalogMatch('نعيمي فاخر',items).item?.id).toBe('item-1');
  });
  it('learns an alias from human correction',()=>{
    const aliases=learnAlias({},'النعيمي الكبير','item-1');
    expect(bestCatalogMatch('النعيمي الكبير',items,aliases)).toEqual(expect.objectContaining({score:100,reason:'ALIAS'}));
  });
  it('parses pasted tabular sales rows',()=>{
    const rows=parseSalesMatchText('نعيمي فاخر\t2\t500\nتيس حري\t1\t300');
    expect(matchSalesRows(rows,items)[0]).toEqual(expect.objectContaining({quantity:2,amount:500}));
  });
});
