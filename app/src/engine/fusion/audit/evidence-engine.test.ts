import {describe,expect,it} from 'vitest';
import {createEvidenceRecord,updateEvidenceStatus} from './evidence-engine';

describe('audit evidence',()=>{
  it('creates deterministic SHA-256 metadata',async()=>{
    const blob=Object.assign(new Blob(['abc'],{type:'text/plain'}),{name:'test.txt'});
    const record=await createEvidenceRecord({id:'E1',file:blob,now:new Date('2026-09-25T00:00:00Z')});
    expect(record.sha256).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    expect(record.status).toBe('RECEIVED');
  });
  it('changes review status without changing hash',async()=>{
    const blob=Object.assign(new Blob(['x'],{type:'text/plain'}),{name:'x.txt'});
    const record=await createEvidenceRecord({id:'E2',file:blob});
    expect(updateEvidenceStatus(record,'REVIEWED')).toEqual(expect.objectContaining({id:'E2',sha256:record.sha256,status:'REVIEWED'}));
  });
});
