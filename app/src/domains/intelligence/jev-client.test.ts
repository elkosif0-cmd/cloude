import {describe,expect,it,vi} from 'vitest';
import {createJevSession,readJevSession,remainingSessionMinutes,saveJevSession} from './jev-client';

function storage(){
  const map=new Map<string,string>();
  return {
    getItem:(k:string)=>map.get(k)??null,
    setItem:(k:string,v:string)=>{map.set(k,v);},
    removeItem:(k:string)=>{map.delete(k);},
  } as Storage;
}

describe('Jev client',()=>{
  it('persists and reads non-expired session',()=>{
    const store=storage();
    const session=saveJevSession(store,'abc',3600);
    expect(readJevSession(store)?.token).toBe('abc');
    expect(remainingSessionMinutes(session)).toBeGreaterThan(0);
  });

  it('creates session through gateway without exposing secrets',async()=>{
    const fetcher=vi.fn(async()=>new Response(JSON.stringify({ok:true,token:'tok',expires_in:3600}),{status:200,headers:{'content-type':'application/json'}}));
    const result=await createJevSession('password123',fetcher as unknown as typeof fetch);
    expect(result).toEqual({token:'tok',expiresIn:3600});
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
