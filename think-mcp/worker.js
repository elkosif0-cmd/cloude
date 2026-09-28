const VERSION = "0.5.0";
const FAST_AGENTS = [
  { id:"solver", source:"cloudflare", model:"@cf/meta/llama-3.3-70b-instruct-fp8-fast", role:"Lead solver: build the strongest answer and test feasibility." },
  { id:"skeptic", source:"cloudflare", model:"@cf/mistralai/mistral-small-3.1-24b-instruct", role:"Skeptical critic: find weak assumptions, contradictions, missing evidence, and downside risk." },
  { id:"alternatives", source:"cloudflare", model:"@cf/meta/llama-4-scout-17b-16e-instruct", role:"Alternatives analyst: compare approaches, identify overlooked options, and test trade-offs." }
];
const FRONTIER_AGENTS = [
  { id:"gpt", source:"cleanapis", model:"gpt-5.6-sol", role:"Lead frontier solver: produce the strongest feasible solution and challenge hidden assumptions." },
  { id:"claude", source:"cleanapis", model:"claude-opus-5", role:"Deep skeptical reviewer: stress-test logic, evidence, edge cases, and downside risk." },
  { id:"gemini", source:"cleanapis", model:"gemini-3.7-flash", micro:true, role:"Alternative-path analyst: compare approaches, surface missing options, and test trade-offs." },
  { id:"mythos", source:"cleanapis", model:"claude-mythos-preview", micro:true, role:"Adversarial scenario architect: test counterfactuals, failure modes, and hidden second-order effects." },
  { id:"fable", source:"cleanapis", model:"claude-fable-5.1", micro:true, role:"Creative synthesis challenger: seek unconventional but defensible alternatives and expose framing bias." }
];

const HOST_TOOL_CATALOG = [
  {name:"Acumen by Talarion",lanes:["research"],cost:"existing_plan",priority:100,hints:["blind spot","missing","coverage","what am i missing","نقطة عمياء","ناقص"]},
  {name:"Tavily",lanes:["research"],cost:"existing_plan",priority:92,hints:["search","current","latest","web","بحث","حديث"]},
  {name:"Parallel Search",lanes:["research"],cost:"existing_plan",priority:90,hints:["parallel","compare sources","مصادر","مقارنة"]},
  {name:"Firecrawl",lanes:["research","browser"],cost:"existing_plan",priority:86,hints:["crawl","scrape","extract","website","موقع","استخراج"]},
  {name:"Consensus",lanes:["research","science"],cost:"existing_plan",priority:96,hints:["paper","study","evidence","دراسة","بحث علمي"]},
  {name:"Scite",lanes:["research","science"],cost:"existing_plan",priority:94,hints:["citation","cited","paper","استشهاد","مرجع"]},
  {name:"Readwise",lanes:["research","memory","docs"],cost:"existing_plan",priority:82,hints:["library","highlight","saved","مكتبة","ملاحظات"]},
  {name:"Legal Data Hunter",lanes:["research","legal"],cost:"existing_plan",priority:100,hints:["law","regulation","case","قانون","لائحة","نظام","امتثال"]},
  {name:"TinyFish",lanes:["browser","research"],cost:"included",priority:100,hints:["browser","click","form","navigate","متصفح","اضغط","افتح"]},
  {name:"Remote Desktop Commander",lanes:["browser","dev"],cost:"included",priority:92,hints:["computer","desktop","terminal","file","كمبيوتر","جهاز","ترمينال"]},
  {name:"Opera Browser Connector",lanes:["browser"],cost:"existing_plan",priority:80,hints:["opera","tab","screenshot","تبويب","متصفح"]},
  {name:"GitHub",lanes:["dev"],cost:"existing_plan",priority:100,hints:["repo","pull request","code","github","كود","مستودع"]},
  {name:"Superpowers",lanes:["dev"],cost:"included",priority:96,hints:["tdd","debug","plan","test","اختبار","تصحيح"]},
  {name:"Codex Security",lanes:["dev"],cost:"included",priority:94,hints:["security","vulnerability","scan","أمن","ثغرة"]},
  {name:"Cloudflare",lanes:["deploy","dev"],cost:"existing_plan",priority:100,hints:["worker","pages","cloudflare","deploy","نشر"]},
  {name:"Vercel",lanes:["deploy","dev"],cost:"existing_plan",priority:94,hints:["vercel","deploy","hosting","نشر","استضافة"]},
  {name:"Supabase",lanes:["dev","deploy"],cost:"existing_plan",priority:90,hints:["database","postgres","auth","sql","قاعدة","مصادقة"]},
  {name:"PostHog",lanes:["observe","dev"],cost:"existing_plan",priority:100,hints:["analytics","error","feature flag","logs","تحليلات","أخطاء"]},
  {name:"Datadog",lanes:["observe","dev"],cost:"existing_plan",priority:95,hints:["logs","trace","rum","incident","monitor","سجل","تتبع"]},
  {name:"Replit",lanes:["dev"],cost:"existing_plan",priority:75,hints:["prototype","app","build","تطبيق","برمجة"]},
  {name:"Lovable",lanes:["dev","design"],cost:"existing_plan",priority:78,hints:["frontend","tailwind","shadcn","واجهة","تصميم"]},
  {name:"Base44",lanes:["dev"],cost:"existing_plan",priority:72,hints:["full stack","app","تطبيق"]},
  {name:"Webflow",lanes:["design","dev","deploy"],cost:"existing_plan",priority:82,hints:["website","cms","webflow","واجهة","موقع"]},
  {name:"WordPress.com",lanes:["docs","design","deploy"],cost:"existing_plan",priority:76,hints:["wordpress","site","blog","موقع","مدونة"]},
  {name:"Railway",lanes:["deploy","observe"],cost:"existing_plan",priority:72,hints:["railway","service","deploy","logs","نشر"]},
  {name:"Floot",lanes:["dev","deploy"],cost:"existing_plan",priority:70,hints:["full stack","host","database","تطبيق"]},
  {name:"Figma",lanes:["design","image"],cost:"existing_plan",priority:100,hints:["figma","ui","ux","layout","font","واجهة","خط","تصميم"]},
  {name:"Adobe Express",lanes:["design","image"],cost:"free",priority:98,hints:["poster","flyer","social","template","بوستر","فلاير","تصميم"]},
  {name:"Canva",lanes:["design","image"],cost:"mixed",priority:88,hints:["canva","poster","brand","social","بوستر","هوية"]},
  {name:"Runway",lanes:["image","video"],cost:"credits",priority:88,hints:["video","animate","image edit","فيديو","تحريك","صورة"]},
  {name:"OpenArt",lanes:["image","video"],cost:"unknown",priority:84,hints:["image","video","model","صورة","فيديو"]},
  {name:"Higgsfield",lanes:["image","video","design"],cost:"unknown",priority:86,hints:["hero shot","product","creative","إعلان","منتج","صورة"]},
  {name:"Adobe",lanes:["image","design","video"],cost:"mixed",priority:90,hints:["retouch","photoshop","lightroom","تنقيح","إضاءة","ألوان"]},
  {name:"HeyGen",lanes:["video"],cost:"unknown",priority:82,hints:["avatar","voice","presenter","أفاتار","مقدم"]},
  {name:"Descript",lanes:["video"],cost:"unknown",priority:80,hints:["edit video","captions","b-roll","مونتاج","ترجمة"]},
  {name:"Google Drive",lanes:["docs","memory"],cost:"existing_plan",priority:100,hints:["drive","docs","sheets","slides","ملف","مستند","شيت"]},
  {name:"Notion",lanes:["docs","memory"],cost:"existing_plan",priority:90,hints:["notion","wiki","knowledge","ملاحظات","معرفة"]},
  {name:"Dropbox Dash",lanes:["memory","docs"],cost:"existing_plan",priority:86,hints:["workspace","knowledge","ملفات","معرفة"]},
  {name:"Granola",lanes:["memory","docs"],cost:"existing_plan",priority:88,hints:["meeting","decision","transcript","اجتماع","قرار"]},
  {name:"Gmail",lanes:["communication","docs"],cost:"existing_plan",priority:90,hints:["email","mail","بريد","ايميل"]},
  {name:"Resend",lanes:["communication","dev"],cost:"existing_plan",priority:82,hints:["transactional email","broadcast","webhook","بريد","ويب هوك"]}
];
const COST_CLASSES = new Set(["free","included","existing_plan","mixed","credits","paid","unknown"]);
const AUTO_COST_CLASSES = new Set(["free","included","existing_plan"]);
const LANE_RULES = [
  ["legal",/(legal|law|regulat|compliance|contract|case\b|قانون|لائحة|نظام|امتثال|عقد|قضية)/i],
  ["science",/(study|paper|journal|scientific|evidence|clinical|دراسة|ورقة|بحث علمي|دليل علمي)/i],
  ["browser",/(browser|website|page\b|click|navigate|form|screenshot|متصفح|موقع|صفحة|اضغط|افتح|سكرين)/i],
  ["dev",/(code|coding|program|bug|debug|api\b|github|frontend|backend|react|css|javascript|typescript|كود|برمج|خطأ|واجهة برمجية)/i],
  ["deploy",/(deploy|hosting|cloudflare|vercel|worker|railway|production|نشر|استضافة|كلاودفلر|فيرسل)/i],
  ["observe",/(log|trace|monitor|analytics|error tracking|incident|rum\b|سجل|تتبع|مراقبة|تحليلات|أخطاء)/i],
  ["design",/(design|ui\b|ux\b|layout|font|typography|figma|webflow|واجهة|تصميم|خط|ألوان|تنسيق)/i],
  ["image",/(image|photo|poster|graphic|illustration|picture|صورة|بوستر|رسم|جرافيك|تصوير)/i],
  ["video",/(video|animation|avatar|motion|reel|فيديو|تحريك|أفاتار|موشن)/i],
  ["docs",/(document|pdf|doc\b|sheet|slide|report|مستند|ملف|اكسل|عرض|تقرير)/i],
  ["memory",/(meeting|notes|highlight|library|history|context|اجتماع|ملاحظات|مكتبة|سياق|سابق)/i],
  ["communication",/(email|mail|message|whatsapp|بريد|رسالة|واتساب)/i],
  ["research",/(research|search|source|verify|latest|current|compare|fact|بحث|ابحث|مصدر|تحقق|أحدث|مقارنة|معلومة)/i]
];

/* ---- access control ----------------------------------------------------------------------------------------------
   /mcp spends paid model calls (the Clean APIs key and Workers AI), so it is closed unless the caller proves itself:
     • KOSIF_THINK_TOKEN (a Worker secret, at least 32 characters) sent as "Authorization: Bearer <token>"; only when
       THINK_ALLOW_PATH_TOKEN is "true" (for MCP clients that cannot send headers) also as /mcp/<token>. Compared in
       constant time. With no token configured, or a short one, /mcp answers 503 and runs nothing.
     • per caller: THINK_RPM requests and THINK_MODEL_RPM model-running tool calls a minute, enforced by the
       THINK_RATE_LIMITER / THINK_MODEL_LIMITER rate-limit bindings, or by a window in this isolate when they are not
       bound (or fail); THINK_AUTH_FAILS_PER_MIN failed sign-ins a minute per IP, then 429 without checking the token.
     • THINK_FRONTIER_ENABLED "false" stops every Clean APIs call (kosif_agent) at once.
     • browsers only from the origins in THINK_ALLOWED_ORIGINS; any other Origin gets 403 (the MCP transport rule
       against DNS rebinding). POST with a JSON body only; bodies over THINK_MAX_BODY_BYTES get 413.
   Nothing returned carries a secret, a token or an upstream error text. */
const MIN_TOKEN_LENGTH = 32;
const MODEL_TOOLS = new Set(["kosif_agent","kosif_think"]);
const BASE_HEADERS = { "cache-control":"no-store", "x-content-type-options":"nosniff", "referrer-policy":"no-referrer" };
const PREFLIGHT_HEADERS = { "access-control-allow-methods":"POST", "access-control-allow-headers":"authorization, content-type, mcp-protocol-version, mcp-session-id", "access-control-max-age":"600" };

function num(env,name,def,min,max){ const n=Number(env[name]); return Number.isFinite(n)&&n>=min&&n<=max?Math.floor(n):def; }
function limits(env){
  return {
    maxBody:num(env,"THINK_MAX_BODY_BYTES",131072,1024,1048576),
    rpm:num(env,"THINK_RPM",30,1,10000),
    modelRpm:num(env,"THINK_MODEL_RPM",10,1,10000),
    authFails:num(env,"THINK_AUTH_FAILS_PER_MIN",20,1,10000)
  };
}
const enc = new TextEncoder();
async function sha256(v){ return new Uint8Array(await crypto.subtle.digest("SHA-256",enc.encode(String(v)))); }
/* both sides are hashed first, so the comparison takes the same time whatever the lengths or the first difference */
async function sameSecret(a,b){ const [x,y]=await Promise.all([sha256(a),sha256(b)]); let d=0; for(let i=0;i<x.length;i++) d|=x[i]^y[i]; return d===0; }
async function callerKey(token){ return "caller:"+Array.from((await sha256("kosif-think:"+token)).slice(0,12),b=>b.toString(16).padStart(2,"0")).join(""); }

/* a fixed one-minute window per key in this isolate: the fallback when no rate-limit binding is present or it fails */
const windows = new Map();
function windowCount(key){ const w=windows.get(key); return w&&Date.now()-w.start<60000?w.count:0; }
function windowHit(key,limit){
  const now=Date.now(),w=windows.get(key);
  if(!w||now-w.start>=60000){
    if(windows.size>=5000) for(const [k,v] of windows) if(now-v.start>=60000) windows.delete(k);
    windows.set(key,{start:now,count:1});
    return true;
  }
  if(w.count>=limit) return false;
  w.count++;
  return true;
}
async function allow(env,binding,key,limit){
  const b=env[binding];
  if(b&&typeof b.limit==="function"){
    try{ const r=await b.limit({key}); return !!(r&&r.success); }catch(_){ /* never fail open: use the local window */ }
  }
  return windowHit(binding+"|"+key,limit);
}
function allowedOrigins(env){ return String(env.THINK_ALLOWED_ORIGINS||"").split(",").map(s=>s.trim()).filter(Boolean); }
function corsFor(origin){ return origin?{"access-control-allow-origin":origin,"access-control-expose-headers":"retry-after","vary":"Origin"}:{}; }
function bearer(req){ const m=/^Bearer[ \t]+([^\s]+)$/i.exec(req.headers.get("authorization")||""); return m?m[1]:""; }
/* only this Worker's own error codes go back to a caller; anything else (an upstream or runtime message) is replaced */
function publicError(e){ const m=String(e?.message||e||""); return /^[A-Z][A-Z0-9_]{2,60}$/.test(m)?m:"AGENT_FAILED"; }
async function readBody(req,max){
  const declared=Number(req.headers.get("content-length"));
  if(Number.isFinite(declared)&&declared>max) throw new Error("BODY_TOO_LARGE");
  if(!req.body) return "";
  const reader=req.body.getReader(),chunks=[];let size=0;
  for(;;){
    const {done,value}=await reader.read();
    if(done) break;
    size+=value.byteLength;
    if(size>max){ try{await reader.cancel();}catch(_){} throw new Error("BODY_TOO_LARGE"); }
    chunks.push(value);
  }
  const all=new Uint8Array(size);let at=0;
  for(const c of chunks){ all.set(c,at); at+=c.byteLength; }
  return new TextDecoder().decode(all);
}

function json(data,status,headers){ return new Response(JSON.stringify(data),{status:status||200,headers:{...BASE_HEADERS,"content-type":"application/json; charset=utf-8",...(headers||{})}}); }
function empty(status,headers){ return new Response(null,{status,headers:{...BASE_HEADERS,...(headers||{})}}); }
function rpc(id,result,headers){ return json({jsonrpc:"2.0",id:id,result:result},200,headers); }
function rpcErr(id,code,message,status,headers){ return json({jsonrpc:"2.0",id:id==null?null:id,error:{code:code,message:message}},status||200,headers); }
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
    agentId:agent.id, source:agent.source||"cloudflare", model:agent.model, role:agent.role, micro:!!agent.micro,
    recommendationId:x?.recommendationId==null?null:text(x.recommendationId,80),
    answer:text(x?.answer,3500), evidence:list(x?.evidence,8), assumptions:list(x?.assumptions,8),
    risks:list(x?.risks,8), objections:list(x?.objections,8), confidence:clamp(x?.confidence)
  };
}
function agentPrompt(agent,stage,input,peers){
  const shape={recommendationId:"option key when options exist, otherwise null",answer:"concise reviewable conclusion",evidence:["facts"],assumptions:["assumptions"],risks:["risks"],objections:["objections"],confidence:0.0};
  const stageRule=stage==="independent"?"Work independently. Do not anchor on another model.":stage==="critique"?"Review peer artifacts. Identify material conflicts or unsupported claims and return your revised position.":"Produce the final revised position after criticism.";
  return [
    "You are a member of KOSIF Think.","Role: "+agent.role,stageRule,
    "Be rigorous and concise. Do not reveal private chain-of-thought.",
    "Return one valid JSON object only, matching this shape: "+JSON.stringify(shape),
    "Task: "+JSON.stringify({question:input.question,context:input.context,options:input.options,peerArtifacts:peers||[]})
  ].join("\n");
}
async function cleanApisChat(env,model,messages,maxTokens=320){
  if(!env.cleanapis)throw new Error("CLEANAPIS_KEY_MISSING");
  const ac=new AbortController(),timer=setTimeout(()=>ac.abort(),25000);
  let r;
  try{
    r=await fetch("https://cleanapis.com/v1/chat/completions",{
      method:"POST",
      headers:{"content-type":"application/json",authorization:"Bearer "+env.cleanapis},
      body:JSON.stringify({model,messages,max_tokens:maxTokens,response_format:{type:"json_object"}}),
      signal:ac.signal
    });
  }catch(e){
    throw new Error(ac.signal.aborted?"CLEANAPIS_TIMEOUT":"CLEANAPIS_NETWORK");
  }finally{clearTimeout(timer)}
  const d=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error("CLEANAPIS_"+r.status);
  const out=d?.choices?.[0]?.message?.content;
  if(!out)throw new Error("CLEANAPIS_EMPTY_RESPONSE");
  return out;
}
async function cleanApisMicro(env,agent,stage,input,peers){
  if(!env.cleanapis)throw new Error("CLEANAPIS_KEY_MISSING");
  const optionKeys=Object.keys(input.options||{});
  const format=optionKeys.length?"<one option key from "+optionKeys.join(",")+" or NONE>|<confidence 0 to 1>|<one decision-changing insight, max 45 words>":"NONE|<confidence 0 to 1>|<one decision-changing insight, max 45 words>";
  const peerText=(peers||[]).slice(0,5).map(x=>({agentId:x.agentId,recommendationId:x.recommendationId,answer:text(x.answer,450)}));
  const prompt=[
    "You are a KOSIF Think specialist.",
    "Role: "+agent.role,
    stage==="independent"?"Work independently.":"Use the peer summaries only to challenge or refine the decision.",
    "Return EXACTLY one line in this format: "+format,
    "No chain-of-thought. No markdown. No extra commentary.",
    "Task: "+JSON.stringify({question:input.question,context:input.context,options:input.options,peerSummaries:peerText})
  ].join("\n");
  const ac=new AbortController(),timer=setTimeout(()=>ac.abort(),12000);
  let r;
  try{
    r=await fetch("https://cleanapis.com/v1/chat/completions",{
      method:"POST",
      headers:{"content-type":"application/json",authorization:"Bearer "+env.cleanapis},
      body:JSON.stringify({model:agent.model,messages:[{role:"user",content:prompt}],max_tokens:95}),
      signal:ac.signal
    });
  }catch(e){
    throw new Error(ac.signal.aborted?"MICRO_TIMEOUT":"MICRO_NETWORK");
  }finally{clearTimeout(timer)}
  const d=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error("MICRO_"+r.status);
  const raw=text(d?.choices?.[0]?.message?.content,1200).replace(/\n+/g," ").trim();
  const parts=raw.split("|");
  const rec=parts[0]&&optionKeys.includes(parts[0].trim())?parts[0].trim():null;
  const conf=clamp(parseFloat(parts[1]));
  const insight=text(parts.slice(2).join("|")||raw,700);
  return artifact(agent,{recommendationId:rec,answer:insight,evidence:insight?[insight]:[],assumptions:[],risks:agent.id==="mythos"&&insight?[insight]:[],objections:agent.id==="fable"&&insight?[insight]:[],confidence:conf||0.7});
}

async function callAgent(env,agent,stage,input,peers){
  if(agent.source==="cleanapis"&&agent.micro) return cleanApisMicro(env,agent,stage,input,peers);
  const messages=[
    {role:"system",content:"You are KOSIF Think. Be rigorous, concise, and evidence-aware. Output valid JSON only. Never reveal hidden chain-of-thought."},
    {role:"user",content:agentPrompt(agent,stage,input,peers)}
  ];
  if(agent.source==="cleanapis"){
    const raw=await cleanApisChat(env,agent.model,messages,260);
    return artifact(agent,parseJson(raw));
  }
  const result=await env.AI.run(agent.model,{messages,max_tokens:550,response_format:{type:"json_object"}});
  return artifact(agent,parseJson(extractAI(result)));
}
async function stage(env,name,agents,input,peers){
  const artifacts=[],failures=[];
  const runOne=async(agent)=>{
    const p=(peers||[]).filter(x=>x.agentId!==agent.id).map(x=>({agentId:x.agentId,recommendationId:x.recommendationId,answer:text(x.answer,1400),evidence:x.evidence,risks:x.risks,objections:x.objections,confidence:x.confidence}));
    try{artifacts.push(await callAgent(env,agent,name,input,p));}
    catch(e){failures.push({agentId:agent.id,model:agent.model,error:publicError(e)});}
  };
  const clean=agents.filter(a=>a.source==="cleanapis");
  const local=agents.filter(a=>a.source!=="cleanapis");
  if(local.length) await Promise.all(local.map(runOne));
  for(let i=0;i<clean.length;i+=2) await Promise.all(clean.slice(i,i+2).map(runOne));
  return {artifacts,failures};
}
function mergeArtifacts(base,updates){
  const by=new Map(base.map(x=>[x.agentId,x]));
  for(const x of updates)by.set(x.agentId,x);
  return Array.from(by.values());
}
async function stageWithFallback(env,name,preferred,input,peers){
  let r=await stage(env,name,preferred,input,peers);
  const isFrontier=preferred.some(a=>a.source==="cleanapis");
  if(isFrontier&&r.artifacts.length<3){
    const frontierFailures=r.failures;
    const fallback=await stage(env,name,FAST_AGENTS,input,peers);
    if(fallback.artifacts.length){
      return {artifacts:fallback.artifacts,failures:frontierFailures.concat(fallback.failures),agents:FAST_AGENTS,backend:"cloudflare-fallback",fallback:true};
    }
  }
  const active=preferred.filter(a=>r.artifacts.some(x=>x.agentId===a.id));
  return {artifacts:r.artifacts,failures:r.failures,agents:active.length?active:preferred,backend:isFrontier?"cleanapis-frontier":"cloudflare-fast",fallback:false};
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
function provisionalSynthesis(artifacts,c){
  const ranked=artifacts.slice().sort((a,b)=>b.confidence-a.confidence);
  const top=ranked[0]||null;
  const uncertainty=[];
  for(const a of ranked){
    for(const x of [...(a.risks||[]),...(a.objections||[])]) if(x&&!uncertainty.includes(x)) uncertainty.push(x);
  }
  return {
    finalAnswer:top?.answer||"",
    confidence:top?.confidence||0,
    remainingUncertainty:uncertainty.slice(0,8),
    chair:{source:"chatgpt",model:"caller",pendingJev:true},
    note:"Provisional only. ChatGPT should reconcile all artifacts with Jev and produce the final answer."
  };
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
function routeLanes(task){
  const q=text(task,12000),out=[];
  for(const [lane,re] of LANE_RULES) if(re.test(q)) out.push(lane);
  if(out.includes("legal")&&!out.includes("research")) out.push("research");
  if(out.includes("science")&&!out.includes("research")) out.push("research");
  if(out.includes("design")&&/(web|site|app|واجهة|موقع|تطبيق)/i.test(q)&&!out.includes("dev")) out.push("dev");
  return Array.from(new Set(out));
}
function normalizeAvailableTools(v){
  if(!Array.isArray(v)) return new Map();
  const m=new Map();
  for(const x of v.slice(0,120)){
    if(!x||typeof x!=="object"||Array.isArray(x)) continue;
    const name=text(x.name,120);
    if(!name) continue;
    const cc=COST_CLASSES.has(String(x.costClass||""))?String(x.costClass):"unknown";
    const lanes=Array.isArray(x.lanes)?x.lanes.slice(0,12).map(y=>text(y,40)).filter(Boolean):[];
    m.set(name.toLowerCase(),{name,connected:x.connected!==false,costClass:cc,description:text(x.description,1200),lanes});
  }
  return m;
}
function routeTool(env,args){
  const task=text(args?.task,12000);
  if(!task) throw new Error("TASK_REQUIRED");
  const lanes=routeLanes(task);
  const available=normalizeAvailableTools(args?.availableTools);
  const approved=new Set((Array.isArray(args?.approvedTools)?args.approvedTools:[]).slice(0,80).map(x=>text(x,120).toLowerCase()).filter(Boolean));
  const preferred=new Set((Array.isArray(args?.preferredTools)?args.preferredTools:[]).slice(0,40).map(x=>text(x,120).toLowerCase()).filter(Boolean));
  const strictFree=args?.budgetMode==="strict_free";
  const autoCosts=strictFree?new Set(["free","included"]):AUTO_COST_CLASSES;
  const maxTools=Math.max(1,Math.min(20,Number(args?.maxTools)||10));
  const q=task.toLowerCase();

  const catalogNames=new Set(HOST_TOOL_CATALOG.map(t=>t.name.toLowerCase()));
  const dynamicTools=Array.from(available.values()).filter(st=>!catalogNames.has(st.name.toLowerCase())).map(st=>{
    const inferred=st.lanes.length?st.lanes:routeLanes(st.name+" "+st.description);
    return {name:st.name,lanes:inferred,cost:st.costClass,priority:60,hints:[]};
  });
  const scored=HOST_TOOL_CATALOG.concat(dynamicTools).map(t=>{
    const laneHits=t.lanes.filter(l=>lanes.includes(l)).length;
    const hintHits=(t.hints||[]).filter(h=>q.includes(String(h).toLowerCase())).length;
    const forced=preferred.has(t.name.toLowerCase())?1:0;
    const state=available.get(t.name.toLowerCase());
    const availabilityBoost=available.size?(state?.connected?10000:state?5000:0):0;
    return {...t,score:availabilityBoost+laneHits*100+hintHits*20+forced*500};
  }).filter(t=>t.score>0).sort((a,b)=>b.score-a.score||b.priority-a.priority||a.name.localeCompare(b.name)).slice(0,maxTools);

  const useNow=[],needsApproval=[],needsAvailabilityCheck=[],missingConnections=[];
  for(const t of scored){
    const st=available.get(t.name.toLowerCase());
    const connected=st?st.connected:null;
    const costClass=st?.costClass&&st.costClass!=="unknown"?st.costClass:t.cost;
    const item={name:t.name,lanes:t.lanes.filter(l=>lanes.includes(l)),costClass,reason:t.hints.find(h=>q.includes(String(h).toLowerCase()))||t.lanes.filter(l=>lanes.includes(l))[0]||"preferred"};
    if(connected===null){ needsAvailabilityCheck.push(item); continue; }
    if(!connected){ missingConnections.push(item); continue; }
    if(autoCosts.has(costClass)||approved.has(t.name.toLowerCase())) useNow.push({...item,approved:approved.has(t.name.toLowerCase())});
    else needsApproval.push({...item,warning:costClass==="credits"?"May consume credits.":costClass==="paid"?"May require a paid plan.":costClass==="mixed"?"Some capabilities may consume credits or require a paid plan.":"Cost is not verified; ask before use."});
  }

  return {
    version:VERSION,
    mode:"host-mediated",
    directPluginCalls:false,
    task,
    lanes,
    budgetPolicy:{
      mode:strictFree?"strict_free":"free_or_included_or_existing_plan",
      autoCostClasses:Array.from(autoCosts),
      approvalRequired:["mixed","credits","paid","unknown"],
      rule:"Never execute a paid, credit-based, mixed, or unknown-cost host tool unless the user has explicitly approved that tool for this task."
    },
    useNow,
    needsApproval,
    needsAvailabilityCheck,
    missingConnections,
    hostContract:{
      preflight:"KOSIF Think reasons first.",
      route:"Call kosif_route with the task and the host's currently connected tools. Pass costClass when the host knows it.",
      execute:"The ChatGPT host, not this Worker, calls tools listed in useNow. Do not call needsApproval until the user explicitly approves them.",
      returnEvidence:"Summarize or attach host-tool results back into KOSIF Think context for synthesis/council.",
      finalReview:"If KOSIF returns jev_payload, run Jev before the final answer.",
      truthfulness:"Never claim that KOSIF Think directly invoked a host plugin; routing is advisory and host-mediated."
    }
  };
}

async function runThink(env,args){
  const input={question:text(args?.question,12000),context:text(args?.context,24000),options:cleanOptions(args?.options)};
  if(!input.question) throw new Error("QUESTION_REQUIRED");
  const mode=args?.mode||"fast";
  if(mode!=="fast"){
    return {
      version:VERSION,
      mode,
      orchestrationRequired:true,
      frontierAgents:FRONTIER_AGENTS.map(a=>({id:a.id,model:a.model,role:a.role})),
      instruction:"For Council or Deep, call kosif_agent for the frontier agents, then call kosif_council with the returned artifacts. This avoids a single long-running fan-out request."
    };
  }
  const r=await stage(env,"independent",FAST_AGENTS,input,[]);
  if(!r.artifacts.length) throw new Error("ALL_FAST_AGENTS_FAILED");
  const c=council(r.artifacts,input.options);
  return {
    version:VERSION,mode:"fast",backend:"cloudflare-fast",
    agents:FAST_AGENTS.map(a=>({id:a.id,source:a.source,model:a.model,role:a.role})),
    artifacts:r.artifacts,failures:r.failures,council:c,
    preJevGate:{passed:!c?.tied&&(!c||c.agreementPercent>=80),reasons:[...(c?.tied?["COUNCIL_TIED"]:[]),...(c&&c.agreementPercent<80?["COUNCIL_AGREEMENT_BELOW_80"]:[])]},
    synthesis:provisionalSynthesis(r.artifacts,c),
    jev_payload:jevPayload(input,r.artifacts,c),
    next_step:"Submit jev_payload to Jev Bridge, then let ChatGPT produce the final answer."
  };
}

function frontierById(id){
  return FRONTIER_AGENTS.find(a=>a.id===id)||null;
}
function sanitizePeer(x){
  return {
    agentId:text(x?.agentId,80),
    recommendationId:x?.recommendationId==null?null:text(x.recommendationId,80),
    answer:text(x?.answer,1800),
    evidence:list(x?.evidence,6),
    assumptions:list(x?.assumptions,6),
    risks:list(x?.risks,6),
    objections:list(x?.objections,6),
    confidence:clamp(x?.confidence)
  };
}
async function runAgentTool(env,args){
  const agent=frontierById(text(args?.agent,40));
  if(!agent)throw new Error("UNKNOWN_FRONTIER_AGENT");
  if(String(env.THINK_FRONTIER_ENABLED||"true").toLowerCase()==="false")throw new Error("FRONTIER_DISABLED");
  const stageName=["independent","critique","revision"].includes(args?.stage)?args.stage:"independent";
  const input={question:text(args?.question,12000),context:text(args?.context,24000),options:cleanOptions(args?.options)};
  if(!input.question)throw new Error("QUESTION_REQUIRED");
  const peers=Array.isArray(args?.peers)?args.peers.slice(0,10).map(sanitizePeer).filter(x=>x.agentId):[];
  const artifactResult=await callAgent(env,agent,stageName,input,peers);
  return {
    version:VERSION,
    stage:stageName,
    agent:{id:agent.id,source:agent.source,model:agent.model,role:agent.role,micro:!!agent.micro},
    artifact:artifactResult
  };
}
function sanitizeArtifact(x){
  return {
    agentId:text(x?.agentId,80),
    source:text(x?.source,40),
    model:text(x?.model,120),
    role:text(x?.role,500),
    recommendationId:x?.recommendationId==null?null:text(x.recommendationId,80),
    answer:text(x?.answer,4000),
    evidence:list(x?.evidence,8),
    assumptions:list(x?.assumptions,8),
    risks:list(x?.risks,8),
    objections:list(x?.objections,8),
    confidence:clamp(x?.confidence)
  };
}
function aggregateCouncilTool(args){
  const input={question:text(args?.question,12000),context:text(args?.context,24000),options:cleanOptions(args?.options)};
  if(!input.question)throw new Error("QUESTION_REQUIRED");
  const artifacts=(Array.isArray(args?.artifacts)?args.artifacts.slice(0,10):[]).map(sanitizeArtifact).filter(x=>x.agentId&&x.answer);
  if(!artifacts.length)throw new Error("ARTIFACTS_REQUIRED");
  const c=council(artifacts,input.options);
  const reasons=[];
  if(c?.tied)reasons.push("COUNCIL_TIED");
  if(c&&c.agreementPercent<80)reasons.push("COUNCIL_AGREEMENT_BELOW_80");
  const expected=new Set(FRONTIER_AGENTS.map(a=>a.id));
  const present=new Set(artifacts.map(a=>a.agentId));
  const missing=Array.from(expected).filter(id=>!present.has(id));
  if(missing.length)reasons.push("MISSING_FRONTIER_AGENTS");
  return {
    version:VERSION,
    artifacts,
    council:c,
    coverage:{present:Array.from(present),missing,frontierTotal:FRONTIER_AGENTS.length},
    preJevGate:{passed:reasons.length===0,reasons},
    synthesis:provisionalSynthesis(artifacts,c),
    jev_payload:jevPayload(input,artifacts,c),
    next_step:"Call the matching Jev Bridge tool with jev_payload. ChatGPT is the final chair and should reconcile Jev with all agent artifacts and the deterministic council."
  };
}

const ARTIFACT_SCHEMA={
  type:"object",
  properties:{
    agentId:{type:"string"},source:{type:"string"},model:{type:"string"},role:{type:"string"},
    recommendationId:{type:["string","null"]},answer:{type:"string"},
    evidence:{type:"array",items:{type:"string"}},assumptions:{type:"array",items:{type:"string"}},
    risks:{type:"array",items:{type:"string"}},objections:{type:"array",items:{type:"string"}},confidence:{type:"number"}
  },
  required:["agentId","answer","confidence"],
  additionalProperties:true
};
const TOOLS=[
  {
    name:"kosif_agent",
    description:"Run exactly one KOSIF frontier agent through Clean APIs. Use separate calls for gpt, claude, gemini, mythos, and fable; this avoids one long fan-out request. Returns a structured artifact, not hidden chain-of-thought.",
    inputSchema:{
      type:"object",
      properties:{
        agent:{type:"string",enum:["gpt","claude","gemini","mythos","fable"]},
        stage:{type:"string",enum:["independent","critique","revision"]},
        question:{type:"string"},
        context:{type:"string"},
        options:{type:"object",additionalProperties:{type:"string"}},
        peers:{type:"array",items:ARTIFACT_SCHEMA}
      },
      required:["agent","question"],
      additionalProperties:false
    }
  },
  {
    name:"kosif_council",
    description:"Aggregate KOSIF frontier agent artifacts deterministically, calculate option agreement, prepare the Jev payload, and hand control back to ChatGPT as final chair.",
    inputSchema:{
      type:"object",
      properties:{
        question:{type:"string"},
        context:{type:"string"},
        options:{type:"object",additionalProperties:{type:"string"}},
        artifacts:{type:"array",items:ARTIFACT_SCHEMA,minItems:1,maxItems:10}
      },
      required:["question","artifacts"],
      additionalProperties:false
    }
  },
  {
    name:"kosif_think",
    description:"Mandatory first-step KOSIF preflight when the user explicitly selects or invokes KOSIF Think. For simple tasks call kosif_think with mode fast before any substantive answer or downstream tool. For frontier Council or Deep work, use kosif_agent + kosif_council so GPT, Claude, Gemini, Mythos, and Fable return independently.",
    inputSchema:{
      type:"object",
      properties:{
        question:{type:"string"},
        context:{type:"string"},
        options:{type:"object",additionalProperties:{type:"string"}},
        mode:{type:"string",enum:["fast","council","deep"]}
      },
      required:["question"],additionalProperties:false
    }
  },
  {
    name:"kosif_route",
    description:"Plan host-side tool/plugin usage after KOSIF reasoning. This Worker does not call host plugins directly. The host passes connected tools and cost classes; free, included, or existing-plan tools may be used automatically, while mixed/credit/paid/unknown-cost tools require explicit user approval.",
    inputSchema:{
      type:"object",
      properties:{
        task:{type:"string"},
        availableTools:{type:"array",maxItems:120,items:{type:"object",properties:{name:{type:"string"},connected:{type:"boolean"},costClass:{type:"string",enum:["free","included","existing_plan","mixed","credits","paid","unknown"]},description:{type:"string"},lanes:{type:"array",items:{type:"string"},maxItems:12}},required:["name"],additionalProperties:false}},
        approvedTools:{type:"array",items:{type:"string"},maxItems:80},
        preferredTools:{type:"array",items:{type:"string"},maxItems:40},
        maxTools:{type:"integer",minimum:1,maximum:20},
        budgetMode:{type:"string",enum:["safe","strict_free"]}
      },
      required:["task"],additionalProperties:false
    }
  },
  {
    name:"kosif_think_status",
    description:"Show KOSIF Think version, mandatory-on-selection preflight behavior, frontier agents, fast agents, host-tool routing/cost policy, Clean APIs availability, and Jev handoff behavior.",
    inputSchema:{type:"object",properties:{},additionalProperties:false}
  }
];

async function callTool(env,name,args){
  if(name==="kosif_agent") return toolResult(await runAgentTool(env,args),false);
  if(name==="kosif_council") return toolResult(aggregateCouncilTool(args),false);
  if(name==="kosif_think") return toolResult(await runThink(env,args),false);
  if(name==="kosif_route") return toolResult(routeTool(env,args),false);
  if(name==="kosif_think_status") return toolResult({
    ok:true,version:VERSION,cleanApisConfigured:!!env.cleanapis,
    fastAgents:FAST_AGENTS.map(a=>({id:a.id,source:a.source,model:a.model,role:a.role})),
    frontierAgents:FRONTIER_AGENTS.map(a=>({id:a.id,source:a.source,model:a.model,role:a.role,micro:!!a.micro})),
    mandatoryOnSelection:true,
    access:{auth:"bearer",pathToken:String(env.THINK_ALLOW_PATH_TOKEN||"").toLowerCase()==="true",frontierEnabled:String(env.THINK_FRONTIER_ENABLED||"true").toLowerCase()!=="false",
      rateLimiter:typeof env.THINK_RATE_LIMITER?.limit==="function",modelLimiter:typeof env.THINK_MODEL_LIMITER?.limit==="function",limits:limits(env),browserOrigins:allowedOrigins(env).length},
    routing:{
      preflight:"When KOSIF Think is explicitly selected or invoked, run KOSIF first before any substantive answer or downstream tool; simple tasks use fast.",
      fast:"kosif_think -> Cloudflare fast council",
      council:"ChatGPT calls kosif_agent independently for gpt + claude + gemini + mythos + fable, then kosif_council",
      deep:"Same five independent agents; then targeted critique/revision agent calls; then kosif_council",
      finalChair:"Jev review followed by ChatGPT final synthesis",
      hostTools:"kosif_route plans host-mediated plugin/tool calls; the host executes only useNow and returns evidence to KOSIF.",
      tinyFish:"Browser/web interaction is routed through kosif_route when available; it is not part of the hidden reasoning bus."
    },
    hostToolRouting:{mode:"host-mediated",directPluginCalls:false,routeTool:"kosif_route",catalogSize:HOST_TOOL_CATALOG.length,dynamicToolsSupported:true,autoCostClasses:Array.from(AUTO_COST_CLASSES),approvalRequired:["mixed","credits","paid","unknown"]},
    jevIntegration:"kosif_council returns jev_payload; pass it to Jev Bridge before the final ChatGPT answer."
  },false);
  return null;
}

const PATH_TOKEN = /^\/mcp\/([^/]+)$/;

async function handleMcp(req,env,url){
  const lim=limits(env);
  /* browsers: only the allow-listed origins; a request without Origin is a server-side MCP client */
  const origin=req.headers.get("origin");
  if(origin&&!allowedOrigins(env).includes(origin)) return json({error:"origin_not_allowed"},403);
  const cors=corsFor(origin);
  if(req.method==="OPTIONS") return empty(204,{...cors,...(origin?PREFLIGHT_HEADERS:{}),allow:"POST, OPTIONS"});
  if(req.method!=="POST") return json({error:"method_not_allowed"},405,{...cors,allow:"POST, OPTIONS"});

  /* closed until a real token is configured */
  const expected=String(env.KOSIF_THINK_TOKEN||"");
  if(expected.length<MIN_TOKEN_LENGTH) return json({error:"service_unavailable"},503,cors);
  const ip=req.headers.get("cf-connecting-ip")||"unknown",failKey="auth-fail|ip:"+ip;
  if(windowCount(failKey)>=lim.authFails) return json({error:"too_many_requests"},429,{...cors,"retry-after":"60"});
  const pathMatch=PATH_TOKEN.exec(url.pathname);
  const presented=bearer(req)||(pathMatch?pathMatch[1]:"");
  if(!presented||!(await sameSecret(presented,expected))){
    windowHit(failKey,Number.MAX_SAFE_INTEGER);
    return json({error:"unauthorized"},401,{...cors,"www-authenticate":presented?'Bearer realm="kosif-think", error="invalid_token"':'Bearer realm="kosif-think"'});
  }
  const caller=await callerKey(expected);
  if(!(await allow(env,"THINK_RATE_LIMITER",caller,lim.rpm))) return json({error:"too_many_requests"},429,{...cors,"retry-after":"60"});

  /* JSON only, and never more than the body limit */
  if(!/^application\/json\b/i.test(req.headers.get("content-type")||"")) return json({error:"unsupported_media_type"},415,cors);
  let raw;
  try{raw=await readBody(req,lim.maxBody);}catch(_){return json({error:"payload_too_large",maxBytes:lim.maxBody},413,cors);}
  let msg;
  try{msg=JSON.parse(raw);}catch(_){return rpcErr(null,-32700,"Parse error",200,cors);}
  if(!msg||typeof msg!=="object"||Array.isArray(msg)||typeof msg.method!=="string") return rpcErr(null,-32600,"Invalid Request",200,cors);
  const id=msg.id;
  if(msg.method==="initialize") return rpc(id,{protocolVersion:msg.params?.protocolVersion||"2025-06-18",capabilities:{tools:{}},serverInfo:{name:"kosif-think",version:VERSION},instructions:"MANDATORY-ON-SELECTION: If the user explicitly selects or invokes KOSIF Think in the current turn, call KOSIF Think before any substantive answer or other tool, even for a simple task. Use kosif_think with mode fast for simple preflight; use kosif_agent + kosif_council for Council/Deep work. When external evidence or execution would help, call kosif_route next and pass currently connected host tools plus costClass when known. The ChatGPT host executes only route.useNow; never execute route.needsApproval until the user explicitly approves that tool for the task. Return host-tool evidence to KOSIF for synthesis. If a KOSIF result returns jev_payload, call the matching Jev Bridge tool before finalizing. KOSIF routing is host-mediated: this Worker does not directly invoke arbitrary ChatGPT plugins and must never claim that it did. Avoid redundant preflight calls in the same user turn."},cors);
  if(msg.method.startsWith("notifications/")) return empty(202,cors);
  if(msg.method==="ping") return rpc(id,{},cors);
  if(msg.method==="tools/list") return rpc(id,{tools:TOOLS},cors);
  if(msg.method==="tools/call"){
    const name=text(msg.params?.name,80);
    /* tools that run a model spend money: a second, tighter limit per caller */
    if(MODEL_TOOLS.has(name)&&!(await allow(env,"THINK_MODEL_LIMITER",caller,lim.modelRpm)))
      return rpcErr(id,-32000,"Rate limit exceeded",429,{...cors,"retry-after":"60"});
    try{
      const result=await callTool(env,name,msg.params?.arguments||{});
      return result?rpc(id,result,cors):rpcErr(id,-32602,"Unknown tool",200,cors);
    }catch(e){
      return rpc(id,toolResult({error:publicError(e)},true),cors);
    }
  }
  return rpcErr(id,-32601,"Method not found",200,cors);
}

export default {
  async fetch(req,env){
    const url=new URL(req.url);
    if(url.pathname==="/"||url.pathname==="/health"){
      if(req.method!=="GET"&&req.method!=="HEAD") return json({error:"method_not_allowed"},405,{allow:"GET, HEAD"});
      /* public: no configuration, no model list */
      return json({ok:true,service:"KOSIF Think MCP",version:VERSION});
    }
    const pathToken=PATH_TOKEN.test(url.pathname)&&String(env.THINK_ALLOW_PATH_TOKEN||"").toLowerCase()==="true";
    if(url.pathname!=="/mcp"&&!pathToken) return json({error:"not_found"},404);
    return handleMcp(req,env,url);
  }
};
