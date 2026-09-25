import {describe,expect,it} from 'vitest';
import {JsonStorageRepository} from './json-storage-repository';

function fakeStorage(){
  const state=new Map<string,string>();
  return {
    state,
    getItem:(key:string)=>state.get(key)??null,
    setItem:(key:string,value:string)=>{state.set(key,value);},
    removeItem:(key:string)=>{state.delete(key);},
  };
}

describe('JSON storage repository',()=>{
  it('persists and reloads records through one versioned envelope',async()=>{
    const storage=fakeStorage();
    const first=new JsonStorageRepository<{id:string;name:string}>(storage,'finance.journals');
    await first.put({id:'J1',name:'Opening'});
    const second=new JsonStorageRepository<{id:string;name:string}>(storage,'finance.journals');
    expect(await second.get('J1')).toEqual({id:'J1',name:'Opening'});
    expect(JSON.parse(storage.state.get('finance.journals')??'{}').version).toBe(1);
  });

  it('treats corrupt content as empty instead of mutating it during read',async()=>{
    const storage=fakeStorage();
    storage.state.set('x','not-json');
    const repo=new JsonStorageRepository<{id:string}>(storage,'x');
    expect(await repo.list()).toEqual([]);
    expect(storage.state.get('x')).toBe('not-json');
  });
});
