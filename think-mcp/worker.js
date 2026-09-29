const VERSION = "0.5.9";
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
  {name:"KOSIF Computer",lanes:["computer","browser","automation","dev","docs"],cost:"included",priority:125,hints:["computer","desktop","device","windows","browser","playwright","cdp","uia","file dialog","screen state","excel","android","متصفح","جهاز","كمبيوتر","ويندوز","تحكم","اكسل"]},
  {name:"Jev Bridge",lanes:["decision","browser","automation"],cost:"included",priority:120,hints:["jev","choice","noul","ambiguous","ambiguity","decision","candidate","اختيار","قرار","غموض","مرشح"]},
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
  ["decision",/(jev|choice|noul|decision|ambiguous|ambiguity|candidate|اختيار|قرار|غموض|مرشح)/i],
  ["computer",/(computer|desktop|device|windows|uia|mouse|keyboard|file dialog|screen state|excel|android|كمبيوتر|جهاز|ويندوز|ماوس|كيبورد|اكسل|اندرويد)/i],
  ["automation",/(automation|workflow|agent loop|autonomous|batch|orchestrat|أتمتة|سير عمل|وكيل ذاتي|دفعة)/i],
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

const BROWSER_JEV_CONTRACT = {
  source:"uploaded jev-browser.rar source review",
  executionAuthority:"KOSIF Computer",
  system1:"stable local KOSIF action graph",
  ambiguityResolver:"bounded Jev choice over observed stable candidates only",
  previewContract:{readOnly:true,preferredBeforeSubstantialWrites:true,returns:["stable_plan","risk_counts","top_candidates","closed_packet_if_ambiguous"]},
  executionBudget:{maxDurationSeconds:120,maxActions:12,maxJevEscalations:4,maxRecoveries:4,maxStalls:2,terminalStatus:"budget_exhausted"},
  decisionTicket:{packetIdRequiredForJev:true,ttlSeconds:30,oneTime:true,candidateDigest:true,replayRejected:true},
  compatibilityOperations:["CLICK","TYPE","SCROLL_DOWN","SCROLL_UP","GO_BACK","FINISH"],
  sequence:["observe_or_analyze","action_space","assess","jev_choice_if_needed","apply_decision","adaptive_settle","verify","delta_or_recover"],
  completionRule:"FINISH, short action history, transport success, state change, or model probability are hypotheses only; require an observable postcondition.",
  cancellationRule:"Honor cancellation or budget exhaustion before the next side effect.",
  verificationContract:{
    operators:["all_of","any_of","not"],
    predicates:["url_contains","url_regex","title_contains","title_regex","text_contains","text_absent","text_regex","dialog_text_contains","dialog_text_absent","action_id_present","action_id_absent","context_alias_present","context_alias_absent","changed_from","node_count_min","node_count_max"],
    stateChangeRule:"A changed page is action evidence, not task-completion evidence."
  },
  recoveryContract:{
    adaptiveSettle:true,
    repeatedNoChangeEscalation:2,
    metrics:["action_latency","settle_latency","jev_escalations","stalls","recoveries"]
  },
  sourceFixes:[
    "replace transient numeric data-jev-id authority with stable semantic action IDs and fresh-state revalidation",
    "add contextual target aliases that prioritize durable selector/name/ARIA/placeholder/href shape and normalize dynamic counters",
    "group candidate filter predicates so ARIA-role nodes cannot bypass recent-action and exclusion rules",
    "treat target index zero as a valid candidate",
    "replace fixed-delay-only action handling with adaptive semantic settle polling",
    "support richer observable verification with all/any/not and absence/regex/dialog predicates",
    "escalate repeated no-change actions to bounded recovery instead of blind repetition",
    "remove raw dashboard secret entry and storage",
    "reject unauthenticated public remote-control binding",
    "prefer DOM, event, and screen deltas over continuous full-frame reasoning streams",
    "classify Arabic and English action intent with multilingual risk gates",
    "bound browser sessions by duration, action, Jev-escalation, recovery and stall budgets"
  ],
  riskAuthority:"Jev may disambiguate a closed candidate set but never grants approval for a high-risk action.",
  humanGates:["captcha_or_antibot","otp_or_mfa","credential_or_security","payment_confirmation"]
};

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
const PUBLIC_TOOLS = new Set(["kosif_preflight","kosif_route","kosif_council","kosif_verify_evidence","kosif_compare_candidates","kosif_think_status"]);
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
  if(!text(x?.answer,3500)) throw new Error("AGENT_EMPTY_ANSWER");
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
  const peer --- TRUNCATED --- 63,340 char