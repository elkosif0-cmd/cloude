import {describe,expect,it} from 'vitest';
import {agePayables} from './payables-engine';

describe('payables aging',()=>{
  it('calculates supplier outstanding buckets',()=>{
    const result=agePayables([
      {id:'P1',supplierId:'S1',invoiceDate:'2026-08-01',dueDate:'2026-09-10',amount:1000,paid:250},
      {id:'P2',supplierId:'S2',invoiceDate:'2026-07-01',dueDate:'2026-07-20',amount:500,paid:0},
    ],'2026-09-25');
    expect(result.outstanding).toBe(1250);
    expect(result.totals['1-30']).toBe(750);
    expect(result.totals['61-90']).toBe(500);
  });
});
