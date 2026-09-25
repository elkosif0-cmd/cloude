import {describe,expect,it} from 'vitest';
import {createStorageSnapshot,parseStorageSnapshot,previewRestore,restoreStorageSnapshot} from './backup';

function memory(seed:Record<string,string>={}){
  const map=new Map(Object.entries(seed));
  return {
    get length(){return map.size;},
    key:(i:number)=>[...map.keys()][i]??null,
    getItem:(k:string)=>map.get(k)??null,
    setItem:(k:string,v:string)=>{map.set(k,v);},
    map,
  };
}

describe('backup engine',()=>{
  it('exports only canonical application keys',()=>{
    const storage=memory({'skosif.v1.a':'1','legacy.x':'2'});
    expect(Object.keys(createStorageSnapshot(storage).entries)).toEqual(['skosif.v1.a']);
  });
  it('previews replacements before restoring',()=>{
    const storage=memory({'skosif.v1.a':'old'});
    const snapshot=parseStorageSnapshot(JSON.stringify({version:1,createdAt:'2026-09-25T00:00:00Z',entries:{'skosif.v1.a':'new','skosif.v1.b':'2'}}))!;
    expect(previewRestore(storage,snapshot)).toEqual({valid:true,incomingKeys:2,createKeys:1,replaceKeys:1,ignoredKeys:0});
    restoreStorageSnapshot(storage,snapshot);
    expect(storage.getItem('skosif.v1.a')).toBe('new');
  });
});
