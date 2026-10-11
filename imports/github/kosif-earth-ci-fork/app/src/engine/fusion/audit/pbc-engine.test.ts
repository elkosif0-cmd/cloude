import {describe,expect,it} from 'vitest';
import {derivePbcStatus,pbcCompletionPercent} from './pbc-engine';

describe('PBC engine',()=>{
  it('derives partial and received states',()=>{
    expect(derivePbcStatus({id:'1',title:'Bank',requiredItems:3,receivedItems:1,round:1})).toBe('PARTIAL');
    expect(derivePbcStatus({id:'2',title:'AP',requiredItems:2,receivedItems:2,round:2})).toBe('RECEIVED');
  });
  it('calculates completion across requests',()=>{
    expect(pbcCompletionPercent([
      {id:'1',title:'A',requiredItems:2,receivedItems:1,round:1},
      {id:'2',title:'B',requiredItems:2,receivedItems:2,round:1},
    ])).toBe(75);
  });
});
