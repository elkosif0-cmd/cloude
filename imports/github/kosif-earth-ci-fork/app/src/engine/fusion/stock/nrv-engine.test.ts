import {describe,expect,it} from 'vitest';
import {allocateNrv,nrvAllocationCheck} from './nrv-engine';

describe('NRV allocation',()=>{
  it('allocates joint cost based on net realizable value',()=>{
    const rows=allocateNrv(1000,[
      {id:'A',name:'Prime',kg:10,pricePerKgNet:100,furtherCostNet:100},
      {id:'B',name:'Secondary',kg:20,pricePerKgNet:40,furtherCostNet:0},
    ]);
    expect(rows[0].nrv).toBe(900);
    expect(rows[1].nrv).toBe(800);
    expect(rows[0].share).toBeCloseTo(900/1700,6);
    expect(nrvAllocationCheck(1000,rows).balanced).toBe(true);
  });
  it('falls back to equal shares when all NRV is zero',()=>{
    const rows=allocateNrv(100,[{id:'A',name:'A',kg:0,pricePerKgNet:0},{id:'B',name:'B',kg:0,pricePerKgNet:0}]);
    expect(rows.map(r=>r.allocatedJointCostNet)).toEqual([50,50]);
  });
});
