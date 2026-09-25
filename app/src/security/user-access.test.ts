import {describe,expect,it} from 'vitest';
import {activeUsers,createUserAccess} from './user-access';

describe('user access',()=>{
  it('creates normalized active users',()=>{
    expect(createUserAccess({id:' user-1 ',displayName:' محمود ',role:'admin'})).toEqual({id:'user-1',displayName:'محمود',role:'admin',active:true});
  });
  it('filters disabled users',()=>{
    expect(activeUsers([
      {id:'1',displayName:'A',role:'viewer',active:true},
      {id:'2',displayName:'B',role:'viewer',active:false},
    ])).toHaveLength(1);
  });
});
