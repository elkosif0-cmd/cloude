import {describe,expect,it,vi} from 'vitest';
import {runMigration} from './migration-runner';

describe('migration runner',()=>{
  it('returns without writing when migration is not needed',async()=>{
    const result=await runMigration({
      id:'noop',
      detect:()=>false,
      backup:async(v)=>v.source,
      migrate:async(v)=>v.source,
      verify:()=>true,
      rollback:async()=>{},
    },{version:2});
    expect(result.changed).toBe(false);
    expect(result.output).toEqual({version:2});
  });

  it('rolls back exact backup if verification fails',async()=>{
    const rollback=vi.fn(async()=>{});
    await expect(runMigration({
      id:'v1-v2',
      detect:()=>true,
      backup:async(v)=>structuredClone(v.source),
      migrate:async()=>({version:2}),
      verify:()=>false,
      rollback,
    },{version:1})).rejects.toThrow('MIGRATION_VERIFICATION_FAILED');
    expect(rollback).toHaveBeenCalledWith({version:1});
  });
});
