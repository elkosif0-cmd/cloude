import {describe,expect,it} from 'vitest';
import {logClientError,readErrorLog} from './error-log';

describe('error log',()=>{
  it('normalizes and persists thrown values',()=>{
    let raw:string|null=null;
    const storage={getItem:()=>raw,setItem:(_k:string,v:string)=>{raw=v;}};
    logClientError(storage,new Error('boom'),'test');
    expect(readErrorLog(storage)[0]).toEqual(expect.objectContaining({message:'boom',context:'test'}));
  });
});
