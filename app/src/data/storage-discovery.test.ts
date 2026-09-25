import {describe,expect,it} from 'vitest';
import {discoverLocalStorage} from './storage-discovery';

describe('storage discovery',()=>{
  it('finds unknown keys without writing or deleting',()=>{
    const state=new Map([['aghnam-pricing-v3','{}'],['mystery-key','abc']]);
    const storage={length:state.size,key:(i:number)=>[...state.keys()][i]??null,getItem:(k:string)=>state.get(k)??null};
    const rows=discoverLocalStorage(storage);
    expect(rows.find((r)=>r.key==='mystery-key')?.classification).toBe('unknown');
    expect(state.get('mystery-key')).toBe('abc');
  });
});
