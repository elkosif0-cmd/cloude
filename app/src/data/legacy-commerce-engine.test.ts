import {describe,expect,it} from 'vitest';
import {applyItemMappings,extractLegacyCommerce,toHistoricalOrder} from './legacy-commerce-engine';

describe('legacy commerce review',()=>{
  const records=[
    {id:'o1',store:'orders',row:{id:'10',number:'ORD-10',date:'2026-08-01',customer_name:'Ali',total:115}},
    {id:'l1',store:'order_items',row:{id:'1',order_id:'10',sku:'A1',quantity:2,unit_price:50}},
    {id:'p1',store:'payments',row:{id:'P1',order_id:'10',date:'2026-08-01',amount:115,method:'mada'}},
  ];

  it('maps known item and customer automatically',()=>{
    const result=extractLegacyCommerce(records,[{id:'item-a1',sku:'A1',name:'Item'}],[{id:'customer-1',name:'Ali'}]);
    expect(result.orders[0].readiness).toBe('READY');
    expect(result.orders[0].lines[0].mappedItemId).toBe('item-a1');
    expect(result.orders[0].customerId).toBe('customer-1');
    expect(result.payments[0].amount).toBe(115);
  });

  it('requires review when item cannot be mapped then accepts manual mapping',()=>{
    const result=extractLegacyCommerce(records,[],[]);
    expect(result.orders[0].readiness).toBe('REVIEW');
    const mapped=applyItemMappings(result.orders[0],{'10:0':'item-manual'});
    expect(mapped.readiness).toBe('READY');
    expect(toHistoricalOrder(mapped).postingPolicy).toBe('HISTORICAL_NO_AUTO_POST');
  });
});
