import {describe,expect,it} from 'vitest';
import {buildStockPositions,negativeStockItems} from './inventory-engine';

describe('inventory engine',()=>{
  it('builds quantity by item from movements',()=>{
    const rows=buildStockPositions([
      {id:'1',itemId:'lamb',date:'2026-09-01',type:'OPENING',quantity:10,unitCost:500},
      {id:'2',itemId:'lamb',date:'2026-09-02',type:'PURCHASE',quantity:5,unitCost:520},
      {id:'3',itemId:'lamb',date:'2026-09-03',type:'SALE',quantity:4},
    ]);
    expect(rows[0].quantity).toBe(11);
    expect(rows[0].inbound).toBe(15);
    expect(rows[0].outbound).toBe(4);
  });

  it('detects negative stock',()=>{
    const bad=negativeStockItems([
      {id:'1',itemId:'goat',date:'2026-09-01',type:'SALE',quantity:2},
    ]);
    expect(bad.map((x)=>x.itemId)).toEqual(['goat']);
  });
});
