import {describe,expect,it} from 'vitest';
import {runThink,type ThinkAgent} from './think-engine';

const agent=(id:string,recommendationId:string,confidence:number):ThinkAgent=>({
  id,
  provider:id,
  role:'reviewer',
  async run(input){
    return {
      answer:`${input.stage}:${id}`,
      recommendationId,
      evidence:['fact'],
      assumptions:[],
      risks:[],
      objections:[],
      confidence,
    };
  },
});

describe('KOSIF Think orchestrator',()=>{
  it('runs independent agents and Jev choice through the gate',async()=>{
    const result=await runThink({
      question:'اختر البديل',
      options:{A:'الخيار أ',B:'الخيار ب'},
      mode:'council',
      minAgreementPercent:60,
      minJevConfidence:0.8,
    },{
      agents:[agent('openai','A',0.9),agent('claude','A',0.8),agent('gemini','B',0.7)],
      jev:{
        async choice(){return {type:'choice',decision:'A',confidence:0.93};},
      },
    });
    expect(result.council?.winningOptionId).toBe('A');
    expect(result.council?.agreementPercent).toBe(66.67);
    expect(result.jev?.decision).toBe('A');
    expect(result.gate.passed).toBe(true);
  });

  it('continues when one agent fails',async()=>{
    const bad:ThinkAgent={
      id:'bad',provider:'bad',role:'critic',
      async run(){throw new Error('provider unavailable');},
    };
    const result=await runThink({question:'حلل',mode:'fast'},{
      agents:[agent('good','A',0.9),bad],
    });
    expect(result.artifacts).toHaveLength(1);
    expect(result.failures).toEqual([{agentId:'bad',message:'provider unavailable'}]);
  });

  it('blocks low-confidence Jev consensus',async()=>{
    const result=await runThink({question:'هل نعتمد؟',mode:'fast',minJevConfidence:0.8},{
      agents:[agent('openai','A',0.9)],
      jev:{
        async noul(){return {type:'noul',decision:'نعم',confidence:0.55};},
      },
    });
    expect(result.gate.passed).toBe(false);
    expect(result.gate.reasons).toContain('LOW_JEV_CONFIDENCE');
  });

  it('runs three stages in deep mode without exposing hidden reasoning',async()=>{
    const seen:string[]=[];
    const a:ThinkAgent={
      id:'a',provider:'openai',role:'solver',
      async run(input){
        seen.push(input.stage);
        return {answer:'structured conclusion',recommendationId:null,evidence:['e1'],confidence:0.8};
      },
    };
    const b:ThinkAgent={...a,id:'b',provider:'claude'};
    await runThink({question:'حلل',mode:'deep'},{agents:[a,b]});
    expect(seen.filter(x=>x==='independent')).toHaveLength(2);
    expect(seen.filter(x=>x==='critique')).toHaveLength(2);
    expect(seen.filter(x=>x==='revision')).toHaveLength(2);
  });
});
