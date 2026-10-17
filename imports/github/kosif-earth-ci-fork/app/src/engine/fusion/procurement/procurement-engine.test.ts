import {describe,expect,it} from 'vitest';
import {matchReceipt,purchaseOrderValue} from './procurement-engine';

describe('procurement engine',()=>{
  it('matches ordered and received quantities',()=>{
    const rows=matchReceipt(
      [{itemId:'A',orderedQty:10,unitCost:5},{itemId:'B',orderedQty:4,unitCost:8}],
      [{itemId:'A',receivedQty:9},{itemId:'B',receivedQty:4},{itemId:'C',receivedQty:1}],
    );
    expect(rows.find((x)=>x.itemId==='A')?.status).toBe('SHORT');
    expect(rows.find((x)=>x.itemId==='B')?.status).toBe('MATCH');
    expect(rows.find((x)=>x.itemId==='C')?.status).toBe('UNPLANNED');
  });

  it('calculates purchase order value',()=>{
    expect(purchaseOrderValue([{itemId:'A',orderedQty:10,unitCost:5.25}])).toBe(52.5);
  });
});
