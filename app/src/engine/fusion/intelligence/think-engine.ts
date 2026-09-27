import {resolveCouncil,type CouncilResult} from './council-engine';

export type ThinkMode='fast'|'council'|'deep';
export type ThinkStage='independent'|'critique'|'revision';

export type ThinkArtifact={
  agentId:string;
  provider:string;
  role:string;
  recommendationId:string|null;
  answer:string;
  evidence:string[];
  assumptions:string[];
  risks:string[];
  objections:string[];
  confidence:number;
};

export type ThinkAgentInput={
  question:string;
  context?:unknown;
  options?:Record<string,string>;
  stage:ThinkStage;
  peerArtifacts?:ThinkArtifact[];
};

export type ThinkAgent={
  id:string;
  provider:string;
  role:string;
  run:(input:ThinkAgentInput)=>Promise<Partial<ThinkArtifact>>;
};

export type JevVerdict={
  type:'noul'|'choice'|'score';
  decision:string|null;
  confidence:number|null;
  raw?:unknown;
};

export type JevAdapter={
  noul?:(input:{state:string;instructions:string;trueCriteria?:string;falseCriteria?:string})=>Promise<JevVerdict>;
  choice?:(input:{state:string;instructions:string;criteria:Record<string,string>})=>Promise<JevVerdict>;
  score?:(input:{state:string;instructions:string;criteria:string[]})=>Promise<JevVerdict>;
};

export type ThinkRequest={
  question:string;
  context?:unknown;
  options?:Record<string,string>;
  mode?:ThinkMode;
  minAgreementPercent?:number;
  minJevConfidence?:number;
};

export type ThinkResult={
  mode:ThinkMode;
  artifacts:ThinkArtifact[];
  failures:{agentId:string;message:string}[];
  council:CouncilResult|null;
  jev:JevVerdict|null;
  gate:{passed:boolean;reasons:string[]};
  finalAnswer:string;
};

export type ThinkDeps={
  agents:ThinkAgent[];
  jev?:JevAdapter;
  synthesize?:(input:{
    question:string;
    context?:unknown;
    options?:Record<string,string>;
    artifacts:ThinkArtifact[];
    council:CouncilResult|null;
    jev:JevVerdict|null;
    gate:{passed:boolean;reasons:string[]};
  })=>Promise<string>;
};

const clamp=(n:number)=>Math.max(0,Math.min(1,Number.isFinite(n)?n:0));
const cleanList=(v:unknown,limit=12)=>Array.isArray(v)?v.map(x=>String(x??'').trim()).filter(Boolean).slice(0,limit):[];
const cleanText=(v:unknown,max=12000)=>String(v??'').trim().slice(0,max);

function normalizeArtifact(agent:ThinkAgent,value:Partial<ThinkArtifact>):ThinkArtifact{
  return {
    agentId:agent.id,
    provider:agent.provider,
    role:agent.role,
    recommendationId:value.recommendationId==null?null:cleanText(value.recommendationId,120),
    answer:cleanText(value.answer),
    evidence:cleanList(value.evidence),
    assumptions:cleanList(value.assumptions),
    risks:cleanList(value.risks),
    objections:cleanList(value.objections),
    confidence:clamp(Number(value.confidence??0)),
  };
}

async function runStage(
  stage:ThinkStage,
  agents:ThinkAgent[],
  request:ThinkRequest,
  peers:ThinkArtifact[]|undefined,
){
  const settled=await Promise.allSettled(agents.map(async agent=>{
    const peerArtifacts=peers?.filter(x=>x.agentId!==agent.id);
    const raw=await agent.run({
      question:request.question,
      context:request.context,
      options:request.options,
      stage,
      peerArtifacts,
    });
    return normalizeArtifact(agent,raw);
  }));
  const artifacts:ThinkArtifact[]=[];
  const failures:{agentId:string;message:string}[]=[];
  settled.forEach((item,i)=>{
    if(item.status==='fulfilled')artifacts.push(item.value);
    else failures.push({agentId:agents[i].id,message:item.reason instanceof Error?item.reason.message:String(item.reason)});
  });
  return {artifacts,failures};
}

function compactState(artifacts:ThinkArtifact[],council:CouncilResult|null){
  return JSON.stringify({
    agents:artifacts.map(a=>({
      agentId:a.agentId,
      provider:a.provider,
      role:a.role,
      recommendationId:a.recommendationId,
      answer:a.answer,
      evidence:a.evidence,
      assumptions:a.assumptions,
      risks:a.risks,
      objections:a.objections,
      confidence:a.confidence,
    })),
    council,
  });
}

async function runJev(request:ThinkRequest,jev:JevAdapter|undefined,artifacts:ThinkArtifact[],council:CouncilResult|null){
  if(!jev)return null;
  const state=compactState(artifacts,council);
  const options=request.options??{};
  if(Object.keys(options).length>=2 && jev.choice){
    return jev.choice({
      state,
      instructions:'اختر البديل الأكثر اتساقاً مع الأدلة والقيود، واعتبر الاعتراضات والمخاطر المذكورة من جميع الوكلاء.',
      criteria:options,
    });
  }
  if(jev.noul){
    return jev.noul({
      state,
      instructions:'هل التوافق الحالي قوي بما يكفي لاعتماد النتيجة دون جولة تفكير إضافية؟',
      trueCriteria:'الأدلة متسقة، الاعتراضات الجوهرية محلولة، والثقة مرتفعة.',
      falseCriteria:'يوجد تعارض جوهري أو افتراض غير محسوم أو مخاطرة قد تغيّر النتيجة.',
    });
  }
  return null;
}

function gateResult(request:ThinkRequest,council:CouncilResult|null,jev:JevVerdict|null){
  const minAgreement=Math.max(0,Math.min(100,request.minAgreementPercent??80));
  const minJev=Math.max(0,Math.min(1,request.minJevConfidence??0.8));
  const reasons:string[]=[];
  if(council){
    if(council.tied)reasons.push('COUNCIL_TIED');
    if(council.agreementPercent<minAgreement)reasons.push('LOW_COUNCIL_AGREEMENT');
  }
  if(jev?.confidence!=null && jev.confidence<minJev)reasons.push('LOW_JEV_CONFIDENCE');
  if(jev?.type==='noul' && jev.decision && !/^(true|yes|نعم)$/i.test(jev.decision))reasons.push('JEV_REJECTED_CONSENSUS');
  return {passed:reasons.length===0,reasons};
}

function defaultAnswer(artifacts:ThinkArtifact[],gate:{passed:boolean;reasons:string[]}){
  const ranked=[...artifacts].sort((a,b)=>b.confidence-a.confidence);
  const best=ranked[0];
  if(!best)return 'لم ينجح أي وكيل في إنتاج نتيجة.';
  return gate.passed?best.answer:`النتيجة تحتاج مراجعة إضافية قبل الاعتماد. ${best.answer}`;
}

export async function runThink(request:ThinkRequest,deps:ThinkDeps):Promise<ThinkResult>{
  const question=cleanText(request.question,8000);
  if(!question)throw new Error('THINK_QUESTION_REQUIRED');
  if(deps.agents.length<1)throw new Error('THINK_AGENT_REQUIRED');
  if(deps.agents.length>12)throw new Error('THINK_TOO_MANY_AGENTS');

  const normalizedRequest={...request,question};
  const mode=request.mode??'council';

  const first=await runStage('independent',deps.agents,normalizedRequest,undefined);
  let artifacts=first.artifacts;
  const failures=[...first.failures];

  if(mode!=='fast' && artifacts.length>1){
    const liveAgents=deps.agents.filter(a=>artifacts.some(x=>x.agentId===a.id));
    const critique=await runStage('critique',liveAgents,normalizedRequest,artifacts);
    failures.push(...critique.failures);
    if(critique.artifacts.length)artifacts=critique.artifacts;
  }

  if(mode==='deep' && artifacts.length>1){
    const liveAgents=deps.agents.filter(a=>artifacts.some(x=>x.agentId===a.id));
    const revision=await runStage('revision',liveAgents,normalizedRequest,artifacts);
    failures.push(...revision.failures);
    if(revision.artifacts.length)artifacts=revision.artifacts;
  }

  const optionIds=new Set(Object.keys(request.options??{}));
  const votes=artifacts
    .filter(a=>a.recommendationId && optionIds.has(a.recommendationId))
    .map(a=>({provider:a.provider,optionId:a.recommendationId!,confidence:a.confidence,rationale:a.answer.slice(0,600)}));
  const council=votes.length?resolveCouncil(votes):null;

  const jev=await runJev(normalizedRequest,deps.jev,artifacts,council);
  const gate=gateResult(normalizedRequest,council,jev);
  const finalAnswer=deps.synthesize
    ? cleanText(await deps.synthesize({question,context:request.context,options:request.options,artifacts,council,jev,gate}))
    : defaultAnswer(artifacts,gate);

  return {mode,artifacts,failures,council,jev,gate,finalAnswer};
}
