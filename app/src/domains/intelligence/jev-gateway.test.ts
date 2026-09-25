import {describe,expect,it} from 'vitest';
import {JevGateway} from './jev-gateway';

describe('Jev gateway',()=>{
  it('accepts only a known closed-set option',async()=>{
    const gateway=new JevGateway({choice:async()=>({choice:'A',confidence:0.8,probabilities:{A:0.8,B:0.2}})});
    const result=await gateway.decide({state:{x:1},instructions:'choose',criteria:{A:'first',B:'second'}});
    expect(result.choice).toBe('A');
    expect(result.confidence).toBe(0.8);
  });

  it('rejects unknown returned options',async()=>{
    const gateway=new JevGateway({choice:async()=>({choice:'X',confidence:0.5,probabilities:{X:1}})});
    await expect(gateway.decide({state:{},instructions:'choose',criteria:{A:null,B:null}})).rejects.toThrow('JEV_RETURNED_UNKNOWN_OPTION');
  });
});
