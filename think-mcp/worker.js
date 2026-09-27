const VERSION = "0.1.0";
const AGENTS = [
  { id:"solver", model:"@cf/meta/llama-3.3-70b-instruct-fp8-fast", role:"Lead solver: build the strongest answer and test feasibility." },
  { id:"skeptic", model:"@cf/mistralai/mistral-small-3.1-24b-instruct", role:"Skeptical critic: find weak assumptions, contradictions, missing evidence, and downside risk." },
  { id:"alternatives", model:"@cf/meta/llama-4-scout-17b-16e-instruct", role:"Alternatives analyst: compare approaches, identify overlooked options, and test trade-offs." }
];

function json(data,status){ return new Response(JSON.stringify(data),{status:status||200,headers:{"content-type":"application/json; charset=utf-8"}}); }
function rpc(id,result){ return json({jsonrpc:"2.0",id:id,result:result}); }
function rpcErr(id,code,message){ return json({jsonrpc:"2.0",id:id==null?null:id,error:{code:code,message:message}}); }
function toolResult(data,isError){ return {content:[{type:"text",text:JSON.stringify(data)}],structuredContent:data,isError:!!isError}; }
function text(v,max){ const s=String(v==null?"":v).trim(); return s.slice(0,max||12000); }
function cleanOptions(v){
  if(!v||typeof v!=="object"||Array.isArray(v)) return {};
  return Object.fromEntries(Object.entries(v).slice(0,12).map(e=>[text(e[0],80),text(e[1],1000)]).filter(e=>e[0]&&e[1]));
}
function list(v,max){ return Array.isArray(v)?v.map(x=>text(x,500)).filter(Boolean).slice(0,max||8):[]; }
function clamp(v){ const n=Number(v); return Number.isFinite(n)?Math.max(0,Math.min(1,n)):0; }
function extractAI(r){
  if(typeof r==="string") return r;
  if(typeof r?.response==="string") return r.response;
  if(typeof r?.result?.response==="string") return r.result.response;
  if(typeof r?.choices?.[0]?.message?.content==="string") return r.choices[0].message.content;
  if(typeof r?.result?.choices?.[0]?.message?.content==="string") return r.result.choices[0].message.content;
  if(Array.isArray(r?.output)) return r.output.map(x=>typeof x==="string"?x:(x?.content||x?.text||"")).join("");
  return "";
}
function parseJson(raw){
  let s=text(raw,24000).replace(/^\s*```(?:json)?\s*/i,"").replace(/\s*```\s*$/,"");
  try{return JSON.parse(s);}catch(_){}
  const a=s.indexOf("{"),b=s.lastIndexOf("}");
  if(a>=0&&b>a) return JSON.parse(s.slice(a,b+1));
  throw new Error("AGENT_JSON_INVALID");
}
function artifact(agent,x){
  return {
    agentId:agent.id, model:agent.model, role:agent.role,
    recommendationId:x?.recommendationId==null?null:text(x.recommendationId,80),
    answer:text(x?.answer,3500), evidence:list(x?.evidence,8), assumptions:list(x?.assumptions,8),
    risks:list(x?.risks,8), objections:list(x?.objections,8), confidence:clamp(x?.confidence)
  };
}
function agentPrompt(agent,stage,input,peers){
  const shape={recommendationId:"option key when options exist, otherwise null",answer:"concise reviewable conclusion",evidence:["facts"],assumptions:["assumptions"],risks:["risks"],objections:["objections"],confidence:0.0};
  const stageRule=stage==="independent"?"Work independently. Do not anchor on another model.":stage==="critique"?"Review peer artifacts. Identify material conflicts or unsupported claims and return your revised position.":"Produce your final revised position after peer criticism.";
  return [
    "You are a member of KOSIF Think.","Role: "+agent.role,stageRule,
    "Do not reveal private chain-of-thought. Return only a compact decision artifact.",
    "Return one valid JSON object only, matching this shape: "+JSON.stringify(shape),
    "Task: "+JSON.stringify({question:input.question,context:input.context,options:input.options,peerArtifacts:peers||[]})
  ].join("\n");
}
async function callAgent(env,agent,stage,input,peers){
  const result=await env.AI.run(agent.model,{
    messages:[
      {role:"system",content:"You are KOSIF Think. Be rigorous, concise, and evidence-aware. Output valid JSON only."},
      {role:"user",content:agentPrompt(agent,stage,input,peers)}
    ],
    max_tokens:550,
    response_format:{type:"json_object"}
  });
  return artifact(agent,parseJson(extractAI(result)));
}
async function stage(env,name,agents,input,peers){
  const settled=await Promise.allSettled(agents.map(a=>{
    const p=(peers||[]).filter(x=>x.agentId!==a.id).map(x=>({agentId:x.agentId,recommendationId:x.recommendationId,answer:text(x.answer,1800),evidence:x.evidence,risks:x.risks,objections:x.objections,confidence:x.confidence}));
    return callAgent(env,a,name,input,p);
  }));
  const artifacts=[],failures=[];
  settled.forEach((x,i)=>{
    if(x.status==="fulfilled") artifacts.push(x.value);
    else failures.push({agentId:agents[i].id,model:agents[i].model,error:text(x.reason?.message||x.reason,500)});
  });
  return {artifacts,failures};
}
function council(artifacts,options){
  const keys=new Set(Object.keys(options));
  const votes=artifacts.filter(a=>a.recommendationId&&keys.has(a.recommendationId));
  if(!votes.length) return null;
  const rows={};
  votes.forEach(v=>{
    const k=v.recommendationId,c=clamp(v.confidence);
    rows[k]=rows[k]||{count:0,weight:0,totalConfidence:0};
    rows[k].count++; rows[k].weight+=c; rows[k].totalConfidence+=c;
  });
  const ranked=Object.entries(rows).sort((a,b)=>b[1].weight-a[1].weight||b[1].count-a[1].count||a[0].localeCompare(b[0]));
  const first=ranked[0],second=ranked[1];
  const tied=!!(second&&Math.abs(first[1].weight-second[1].weight)<1e-9&&first[1].count===second[1].count);
  return {
    winningOptionId:tied?null:first[0],
    agreementPercent:Math.round((first[1].count/votes.length)*10000)/100,
    confidence:Math.round((first[1].totalConfidence/first[1].count)*10000)/10000,
    tied,
    votes:votes.map(v=>({agentId:v.agentId,optionId:v.recommendationId,confidence:v.confidence}))
  };
}
async function synthesize(env,input,artifacts,c,mode){
  const prompt=[
    "You are the chair of KOSIF Think.",
    "Synthesize the structured agent artifacts into a concise Arabic answer.",
    "Do not reveal chain-of-thought. State the conclusion, strongest evidence, material disagreement, and remaining uncertainty.",
    "Return valid JSON only: {\"finalAnswer\":\"...\",\"confidence\":0.0,\"remainingUncertainty\":[\"...\"]}.",
    JSON.stringify({question:input.question,context:input.context,options:input.options,artifacts,council:c})
  ].join("\n");
  const r=await env.AI.run("@cf/moonshotai/kimi-k2.6",{messages:[{role:"user",content:prompt}],max_tokens:mode==="deep"?2500:900,reasoning_effort:mode==="deep"?"high":"none",response_format:{type:"json_object"}});
  const x=parseJson(extractAI(r));
  return {finalAnswer:text(x.finalAnswer,6000),confidence:clamp(x.confidence),remainingUncertainty:list(x.remainingUncertainty,8)};
}
function jevPayload(input,artifacts,c){
  const state={question:input.question,context:input.context,artifacts,council:c};
  if(Object.keys(input.options).length>=2){
    return {type:"choice",state,instructions:"Choose the option most consistent with the evidence, constraints, agent objections, and risk analysis produced by KOSIF Think.",criteria:input.options};
  }
  return {
    type:"noul",state,
    instructions:"Is the current KOSIF Think conclusion sufficiently supported and internally consistent to rely on without another analysis round?",
    true_criteria:"Evidence is coherent, material objections are resolved, and no major assumption is unsupported.",
    false_criteria:"A material conflict, unsupported assumption, or unresolved risk could change the conclusion."
  };
}
async function runThink(env,args){
  const input={question:text(args?.question,12000),context:text(args?.context,24000),options:cleanOptions(args?.options)};
  if(!input.question) throw new Error("QUESTION_REQUIRED");
  const mode=["fast","council","deep"].includes(args?.mode)?args.mode:"council";
  let failures=[];
  let r=await stage(env,"independent",AGENTS,input,[]);
  let artifacts=r.artifacts; failures=failures.concat(r.failures);
  if(mode!=="fast"&&artifacts.length>1){
    const active=AGENTS.filter(a=>artifacts.some(x=>x.agentId===a.id));
    r=await stage(env,"critique",active,input,artifacts);
    if(r.artifacts.length) artifacts=r.artifacts;
    failures=failures.concat(r.failures);
  }
  if(mode==="deep"&&artifacts.length>1){
    const active=AGENTS.filter(a=>artifacts.some(x=>x.agentId===a.id));
    r=await stage(env,"revision",active,input,artifacts);
    if(r.artifacts.length) artifacts=r.artifacts;
    failures=failures.concat(r.failures);
  }
  if(!artifacts.length) throw new Error("ALL_AGENTS_FAILED");
  const c=council(artifacts,input.options);
  let synthesis;
  try{synthesis=await synthesize(env,input,artifacts,c);}
  catch(e){
    const top=artifacts.slice().sort((a,b)=>b.confidence-a.confidence)[0];
    synthesis={finalAnswer:top.answer,confidence:top.confidence,remainingUncertainty:[]};
    failures.push({agentId:"chair",model:"@cf/moonshotai/kimi-k2.6",error:text(e?.message||e,500)});
  }
  const preJevReasons=[];
  if(c?.tied) preJevReasons.push("COUNCIL_TIED");
  if(c&&c.agreementPercent<80) preJevReasons.push("COUNCIL_AGREEMENT_BELOW_80");
  return {
    version:VERSION,mode,
    agents:AGENTS.map(a=>({id:a.id,model:a.model,role:a.role})),
    artifacts,failures,council:c,
    preJevGate:{passed:preJevReasons.length===0,reasons:preJevReasons},
    synthesis,
    jev_payload:jevPayload(input,artifacts,c),
    next_step:"Submit jev_payload to the matching Jev Bridge tool, then reconcile the Jev verdict with this council result before answering the user."
  };
}

const TOOLS=[
  {
    name:"kosif_think",
    description:"Run KOSIF Think: a multi-agent reasoning council with independent analysis, peer critique, optional deep revision, deterministic option consensus, and a Jev-ready decision payload. After this tool returns, submit jev_payload to Jev Bridge before giving the final answer when Jev is available.",
    inputSchema:{
      type:"object",
      properties:{
        question:{type:"string",description:"The problem, question, or decision to analyze."},
        context:{type:"string",description:"Relevant facts, constraints, evidence, numbers, or document summary."},
        options:{type:"object",description:"Optional closed set of alternatives, keyed A/B/C or other short labels.",additionalProperties:{type:"string"}},
        mode:{type:"string",enum:["fast","council","deep"],description:"fast = independent round only; council = independent + critique; deep = independent + critique + revision."}
      },
      required:["question"],additionalProperties:false
    }
  },
  {
    name:"kosif_think_status",
    description:"Show the KOSIF Think version, active Cloudflare AI agents, modes, and Jev handoff behavior.",
    inputSchema:{type:"object",properties:{},additionalProperties:false}
  }
];

async function callTool(env,name,args){
  if(name==="kosif_think") return toolResult(await runThink(env,args),false);
  if(name==="kosif_think_status") return toolResult({
    ok:true,version:VERSION,modes:["fast","council","deep"],
    agents:AGENTS.map(a=>({id:a.id,model:a.model,role:a.role})),
    jevIntegration:"kosif_think returns jev_payload; ChatGPT should call the matching Jev Bridge tool before the final synthesis."
  },false);
  return null;
}

export default {
  async fetch(req,env){
    const url=new URL(req.url);
    if(url.pathname==="/"||url.pathname==="/health") return json({ok:true,service:"KOSIF Think MCP",version:VERSION,agents:AGENTS.map(a=>a.model),mcp:"/mcp"});
    if(url.pathname!=="/mcp") return new Response("Not found",{status:404});
    if(req.method!=="POST") return new Response("Method not allowed",{status:405,headers:{allow:"POST"}});
    let msg;
    try{msg=await req.json();}catch(_){return rpcErr(null,-32700,"Parse error");}
    const id=msg.id;
    if(msg.method==="initialize") return rpc(id,{protocolVersion:msg.params?.protocolVersion||"2025-06-18",capabilities:{tools:{}},serverInfo:{name:"kosif-think",version:VERSION},instructions:"Use kosif_think for difficult reasoning. If jev_payload is returned, call the matching Jev Bridge tool before finalizing."});
    if(msg.method==="notifications/initialized") return new Response(null,{status:202});
    if(msg.method==="ping") return rpc(id,{});
    if(msg.method==="tools/list") return rpc(id,{tools:TOOLS});
    if(msg.method==="tools/call"){
      try{
        const result=await callTool(env,msg.params?.name,msg.params?.arguments||{});
        return result?rpc(id,result):rpcErr(id,-32602,"Unknown tool");
      }catch(e){
        return rpc(id,toolResult({error:text(e?.message||e,1000)},true));
      }
    }
    return rpcErr(id,-32601,"Method not found");
  }
};
