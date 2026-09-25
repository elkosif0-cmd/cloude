import {describe,expect,it} from 'vitest';
import {MemoryRepository} from './repository';

describe('repository boundary',()=>{
  it('stores and reads records without leaking mutable references',async()=>{
    const repo=new MemoryRepository([{id:'1',name:'A'}]);
    const row=await repo.get('1') as {id:string;name:string};
    row.name='changed';
    expect((await repo.get('1') as {id:string;name:string}).name).toBe('A');
  });

  it('upserts and removes records',async()=>{
    const repo=new MemoryRepository<{id:string;value:number}>();
    await repo.put({id:'1',value:10});
    await repo.put({id:'1',value:20});
    expect((await repo.get('1'))?.value).toBe(20);
    await repo.remove('1');
    expect(await repo.get('1')).toBeNull();
  });
});
