import {describe,expect,it} from 'vitest';
import {readAuditTrail,recordAuditEvent} from './audit-trail';

describe('audit trail',()=>{
  it('records events in newest-first order',()=>{
    let raw:string|null=null;
    const storage={getItem:()=>raw,setItem:(_k:string,v:string)=>{raw=v;}};
    recordAuditEvent(storage,{action:'CREATE',entity:'customer',entityId:'1'});
    recordAuditEvent(storage,{action:'POST',entity:'sale',entityId:'2'});
    const rows=readAuditTrail(storage);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual(expect.objectContaining({action:'POST',entity:'sale',entityId:'2'}));
  });
});
