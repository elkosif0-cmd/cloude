import {describe,expect,it} from 'vitest';
import {createCatalogItem,inspectCatalog} from './items-engine';

describe('catalog item master',()=>{
  it('creates normalized catalog items',()=>{
    expect(createCatalogItem({sku:' LAMB-1 ',name:' نعيمي ',unit:'kg',vatRate:0.15,defaultCost:50,defaultPrice:70})).toEqual({
      id:'item-lamb-1',sku:'LAMB-1',name:'نعيمي',unit:'kg',vatRate:0.15,defaultCost:50,defaultPrice:70,active:true
    });
  });

  it('detects duplicate SKU and invalid VAT',()=>{
    const issues=inspectCatalog([
      createCatalogItem({sku:'A',name:'أ',unit:'piece',vatRate:0.15}),
      createCatalogItem({sku:'a',name:'ب',unit:'piece',vatRate:1.2}),
    ]);
    expect(issues.map(x=>x.code)).toEqual(expect.arrayContaining(['DUPLICATE_SKU','INVALID_VAT']));
  });
});
