import {describe,expect,it} from 'vitest';
import {makeScopedKey,readActiveScope,writeActiveScope} from './scope-key';

describe('data scope',()=>{
  it('builds company and period isolated keys',()=>{
    expect(makeScopedKey('finance.journals',{companyId:'c1',periodId:'p1'})).toBe('skosif.v1.c1.p1.finance.journals');
    expect(makeScopedKey('finance.journals',null)).toBe('skosif.v1.unscoped.finance.journals');
  });

  it('persists active scope without other secrets',()=>{
    let raw:string|null=null;
    const storage={getItem:()=>raw,setItem:(_k:string,v:string)=>{raw=v;}};
    writeActiveScope(storage,{companyId:'c1',periodId:'p1'});
    expect(readActiveScope(storage)).toEqual({companyId:'c1',periodId:'p1'});
  });
});
