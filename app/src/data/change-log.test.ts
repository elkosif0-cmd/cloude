import {describe,expect,it} from 'vitest';
import {CHANGE_LOG_KEY,readRepositoryChanges,recordRepositoryChange} from './change-log';

describe('repository change log',()=>{
  it('records metadata without record payloads',()=>{
    let raw:string|null=null;
    const storage={getItem:()=>raw,setItem:(_key:string,value:string)=>{raw=value;}};
    const event=recordRepositoryChange(storage,{key:'skosif.v1.c1.p1.sales.orders',action:'CREATE',entityId:'SO1'});
    expect(event).toEqual(expect.objectContaining({action:'CREATE',entity:'c1.p1.sales.orders',entityId:'SO1'}));
    expect(JSON.stringify(event)).not.toContain('customerName');
    expect(readRepositoryChanges(storage)).toHaveLength(1);
  });

  it('does not recursively log the audit trail itself',()=>{
    let writes=0;
    const storage={getItem:()=>null,setItem:()=>{writes+=1;}};
    expect(recordRepositoryChange(storage,{key:CHANGE_LOG_KEY,action:'UPDATE'})).toBeNull();
    expect(writes).toBe(0);
  });
});
