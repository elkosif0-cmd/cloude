import {describe,expect,it} from 'vitest';
import {selectAuditSample} from './sampling-engine';

describe('audit sampling',()=>{
  const pop=Array.from({length:20},(_,i)=>({id:`I${i+1}`,amount:(i+1)*100}));
  it('is deterministic for a fixed seed',()=>{
    expect(selectAuditSample(pop,{sampleSize:5,seed:7})).toEqual(selectAuditSample(pop,{sampleSize:5,seed:7}));
  });
  it('always includes items above the mandatory threshold',()=>{
    const result=selectAuditSample(pop,{sampleSize:4,seed:1,includeAllAbove:1900});
    expect(result.map((x)=>x.id)).toEqual(expect.arrayContaining(['I19','I20']));
  });
});
