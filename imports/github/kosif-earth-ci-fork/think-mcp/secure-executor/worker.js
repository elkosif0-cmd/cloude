
const VERSION="1.4.3";
const QA_PROFILE_VERSION="active-values-v3";
const MODEL="@cf/black-forest-labs/flux-2-klein-9b";
const QUALITY_MODEL="@cf/black-forest-labs/flux-2-dev";
const QA_MODEL="@cf/mistralai/mistral-small-3.1-24b-instruct";
const QA_SECONDARY_MODEL="@cf/qwen/qwen3.8-27b";
const enc=new TextEncoder();

function json(data,status=200,headers={}){
  return new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store",...headers}});
}
async function readJson(req){try{return await req.json();}catch{return null;}}
function canonical(v){
  if(v===null||typeof v!=="object") return JSON.stringify(v);
  if(Array.isArray(v)) return "["+v.map(canonical).join(",")+"]";
  return "{"+Object.keys(v).sort().map(k=>JSON.stringify(k)+":"+canonical(v[k])).join(",")+"}";
}
async function sha256HexText(s){
  const b=await crypto.subtle.digest("SHA-256",enc.encode(s));
  return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("");
}
async function sha256HexBuffer(buf){
  const b=await crypto.subtle.digest("SHA-256",buf);
  return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("");
}
function toB64(bytes){
  let s="";const u=bytes instanceof Uint8Array?bytes:new Uint8Array(bytes);
  for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode(...u.subarray(i,i+0x8000));
  return btoa(s);
}
function fromB64(s){
  const raw=atob(s),u=new Uint8Array(raw.length);
  for(let i=0;i<raw.length;i++)u[i]=raw.charCodeAt(i);
  return u.buffer;
}
function inferImageMime(buf,fallback=""){
  const u=buf instanceof Uint8Array?buf:new Uint8Array(buf||new ArrayBuffer(0));
  if(u.length>=3&&u[0]===0xff&&u[1]===0xd8&&u[2]===0xff)return "image/jpeg";
  if(u.length>=8&&u[0]===0x89&&u[1]===0x50&&u[2]===0x4e&&u[3]===0x47)return "image/png";
  if(u.length>=12&&u[0]===0x52&&u[1]===0x49&&u[2]===0x46&&u[3]===0x46&&u[8]===0x57&&u[9]===0x45&&u[10]===0x42&&u[11]===0x50)return "image/webp";
  return String(fallback||"image/png").split(";")[0].trim()||"image/png";
}
async function aiToBytes(resp){
  if(resp instanceof Response){const bytes=await resp.arrayBuffer();return {bytes,mime:inferImageMime(bytes,resp.headers.get("content-type")||"")};}
  if(resp instanceof ReadableStream){const bytes=await new Response(resp).arrayBuffer();return {bytes,mime:inferImageMime(bytes,"")};}
  if(resp instanceof ArrayBuffer)return {bytes:resp,mime:inferImageMime(resp,"")};
  if(ArrayBuffer.isView(resp)){const bytes=resp.buffer.slice(resp.byteOffset,resp.byteOffset+resp.byteLength);return {bytes,mime:inferImageMime(bytes,"")};}
  if(resp&&typeof resp.image==="string"){const bytes=fromB64(resp.image);return {bytes,mime:inferImageMime(bytes,"")};}
  if(resp&&typeof resp.data==="string"){const bytes=fromB64(resp.data);return {bytes,mime:inferImageMime(bytes,"")};}
  throw new Error("PROVIDER_RESULT_INVALID");
}
function parseQaJson(v){
  let base=v&&typeof v==="object"&&"response" in v?v.response:v;
  let t=String(base||"").trim();
  t=t.replace(/^```(?:json)?\s*/i,"").replace(/```\s*$/,"").trim();
  try{return JSON.parse(t);}catch(e){}
  const a=t.indexOf("{"),b=t.lastIndexOf("}");
  if(a>=0&&b>a){try{return JSON.parse(t.slice(a,b+1));}catch(e){}}
  return null;
}
async function runNoTextFocusedJudge(env,model,dataUrl,requestId,resultDigest){
  const prompt="Inspect ONLY for visible text-like artifacts. Ignore all unrelated image qualities. Is there any visible letter, word, number, caption, sign, label, watermark text, pseudo-letter, glyph, symbol resembling writing, or accidental typography anywhere? Return JSON only with keys text_artifacts_present (boolean), confidence (number 0..1), locations (array of strings), note (string). Request ID: "+requestId+" Result digest: "+resultDigest;
  let out;
  if(model===QA_MODEL){
    out=await env.AI.run(model,{messages:[{role:"user",content:[{type:"text",text:prompt},{type:"image_url",image_url:{url:dataUrl}}]}],max_tokens:280,temperature:0,guided_json:{type:"object",properties:{text_artifacts_present:{type:"boolean"},confidence:{type:"number"},locations:{type:"array",items:{type:"string"}},note:{type:"string"}},required:["text_artifacts_present","confidence","locations","note"]}});
  }else{
    out=await env.AI.run(model,{messages:[{role:"user",content:[{type:"text",text:prompt},{type:"image_url",image_url:{url:dataUrl}}]}],max_completion_tokens:280,temperature:0,response_format:{type:"json_object"},chat_template_kwargs:{enable_thinking:false}});
  }
  const raw=typeof out?.response==="string"?out.response:(typeof out?.choices?.[0]?.message?.content==="string"?out.choices[0].message.content:"");
  const parsed=parseQaJson(raw);if(!parsed||typeof parsed!=="object")throw new Error("FOCUSED_TEXT_QA_INVALID");
  return {observed:true,model,text_artifacts_present:parsed.text_artifacts_present===true,confidence:Math.max(0,Math.min(1,Number(parsed.confidence||0))),locations:Array.isArray(parsed.locations)?parsed.locations.slice(0,20):[],note:String(parsed.note||"").slice(0,800)};
}

function qaSceneValueText(sceneSpec={},includeNegativeConstraints=false){
  if(typeof sceneSpec==="string")return sceneSpec;
  const values=[];
  const walk=(value,key="")=>{
    if(key==="render_prompt")return;
    if(key==="negative_constraints"&&!includeNegativeConstraints)return;
    if(value===undefined||value===null)return;
    if(typeof value==="string"){
      const t=value.trim();
      if(!t)return;
      if(/^(?:not applicable|n\/?a|none)(?:\b|\s)/i.test(t))return;
      if(/^(?:use only|only use).*(?:explicitly requested|requested).*otherwise not applicable/i.test(t))return;
      values.push(t);
      return;
    }
    if(Array.isArray(value)){for(const v of value)walk(v,key);return;}
    if(typeof value==="object"){for(const [k,v] of Object.entries(value))walk(v,k);return;}
    values.push(String(value));
  };
  walk(sceneSpec);
  return values.join(" ");
}
function qaStripNegatedClauses(value=""){
  return String(value)
    .replace(/\b(?:do\s+not|don't|does\s+not|doesn't|must\s+not|should\s+not|cannot|can't|no|without|avoid|exclude|excluding|never)\b[^.!;\n]*/gi," ")
    .replace(/(?:بدون|من غير|من دون|دون|لا يوجد|ليس هناك|لا تضع|لا تضف|لا تستخدم|لا يظهر|لا تظهر|ممنوع|تجنب)[^.!؛\n،]*/gi," ")
    .replace(/\s+/g," ")
    .trim();
}
function artifactQaProfile(sceneSpec={}){
  const positive=qaStripNegatedClauses(qaSceneValueText(sceneSpec,false)).toLowerCase();
  const constraintText=qaSceneValueText(sceneSpec,true).toLowerCase();
  const neg=Array.isArray(sceneSpec?.negative_constraints)?sceneSpec.negative_constraints.map(x=>String(x||"").toLowerCase()):[];
  const has=(re)=>re.test(positive);
  const profile={
    profile_version:QA_PROFILE_VERSION,
    bird:has(/\b(?:duck|duckling|bird|avian|goose|swan|chicken|eagle|hawk|owl|penguin)s?\b|بطة|بط|طائر|طيور/i),
    dragon:has(/\b(?:dragon|wyvern|drake)s?\b|تنين|تنانين/i),
    fire:has(/\b(?:fire|flame|burning|ember|lava|torch|blaze)s?\b|نار|لهب/i),
    rain:has(/\b(?:rain|storm|downpour|drizzle|wet weather)\b|مطر|عاصفة/i),
    scale_relation:has(/\b(?:colossal|giant|huge|massive|miniature|scale contrast|size contrast|towering|tiny versus|tiny vs)\b|ضخم|عملاق|فرق الحجم|تباين الحجم/i),
    human_hand_constraint:neg.some(x=>/no human hands?|no fingers?|no humanoid|impossible .*grip/.test(x))||/\bno human hands?\b|\bno fingers?\b|\bno humanoid hands?\b/i.test(constraintText)
  };
  const required=["subject_integrity","anatomy_or_structure","pose_readability","contact_physics","lighting_consistency","shadows","composition","focal_hierarchy","cinematic_depth","visual_storytelling","no_text_artifacts","no_extra_limbs","no_malformed_anatomy","no_graphic_injury","no_watermark_logo"];
  if(profile.bird)required.push("bird_anatomy","feather_detail","no_malformed_bill_wings");
  if(profile.dragon)required.push("dragon_anatomy","scale_detail");
  if(profile.fire)required.push("fire_direction");
  if(profile.rain)required.push("rain_interaction");
  if(profile.scale_relation)required.push("scale_relation");
  if(profile.human_hand_constraint)required.push("no_human_hands");
  return {profile,required:[...new Set(required)]};
}

async function runNoHumanHandsFocusedJudge(env,model,dataUrl,requestId,resultDigest,sceneSpec={}){
  const subject=String(sceneSpec?.subject||"the depicted subject").slice(0,1200);
  const prompt="Inspect only unintended human or humanoid hand anatomy. Requested subject: "+subject+". For any non-human subject that should not have human hands, detect unintended palms, fingers, thumbs, wrists, forearms, glove-hand silhouettes, or finger-based grips. Subject-appropriate limbs and support mechanisms explicitly requested by the SceneSpec are allowed. Normal human hands on explicitly requested human characters are allowed unless forbidden by the SceneSpec. Return JSON only with keys human_hand_present, confidence, locations, note. Request ID: "+requestId+" Result digest: "+resultDigest;
  let out;
  if(model===QA_MODEL){
    out=await env.AI.run(model,{messages:[{role:"user",content:[{type:"text",text:prompt},{type:"image_url",image_url:{url:dataUrl}}]}],max_tokens:320,temperature:0,guided_json:{type:"object",properties:{human_hand_present:{type:"boolean"},confidence:{type:"number"},locations:{type:"array",items:{type:"string"}},note:{type:"string"}},required:["human_hand_present","confidence","locations","note"]}});
  }else{
    out=await env.AI.run(model,{messages:[{role:"user",content:[{type:"text",text:prompt},{type:"image_url",image_url:{url:dataUrl}}]}],max_completion_tokens:320,temperature:0,response_format:{type:"json_object"},chat_template_kwargs:{enable_thinking:false}});
  }
  const raw=typeof out?.response==="string"?out.response:(typeof out?.choices?.[0]?.message?.content==="string"?out.choices[0].message.content:"");
  const parsed=parseQaJson(raw);
  if(!parsed||typeof parsed!=="object")throw new Error("FOCUSED_HUMAN_HAND_QA_INVALID");
  return {observed:true,model,human_hand_present:parsed.human_hand_present===true,confidence:Math.max(0,Math.min(1,Number(parsed.confidence||0))),locations:Array.isArray(parsed.locations)?parsed.locations.slice(0,20):[],note:String(parsed.note||"").slice(0,800)};
}

async function runArtifactVisionQa(env,bytes,mime,resultDigest,requestId,sceneSpec={}){
  const qa=artifactQaProfile(sceneSpec);
  const profile=qa.profile,required=qa.required;
  const sceneDigest=await sha256HexText(canonical(sceneSpec||{}));
  const sceneSummary=JSON.stringify(sceneSpec||{}).slice(0,10000);
  const prompt=[
    "You are the independent KOSIF task-aware visual QA verifier.",
    "Inspect the generated image against the supplied frozen SceneSpec.",
    "Return JSON only with keys pass, score, checks, findings.",
    "checks must contain exactly these boolean keys: "+required.join(", ")+".",
    "Pass may be true only if every ACTIVE required check is true. Do not judge inactive concepts that were not requested.",
    "SceneSpec: "+sceneSummary,
    "Evaluate subject fidelity; subject-appropriate anatomy or structural geometry; pose/action readability; contact/support physics; camera/composition; lighting, shadows and reflections; materials; depth and storytelling. Evaluate fire, rain, feathers, scales, size contrast, or no-human-hands only when their checks are active. Verify absence of unwanted text artifacts, extra limbs, malformed anatomy, graphic injury, watermark or logo.",
    "Request ID: "+requestId,
    "Result digest: "+resultDigest
  ].join("\n");
  const actualMime=inferImageMime(bytes,mime);
  const dataUrl="data:"+actualMime+";base64,"+toB64(bytes);
  let out=null,lastErr="";
  const attempts=[
    async()=>await env.AI.run(QA_MODEL,{messages:[{role:"user",content:prompt}],image:dataUrl,max_tokens:1600,temperature:0}),
    async()=>await env.AI.run(QA_MODEL,{messages:[{role:"user",content:[{type:"text",text:prompt},{type:"image_url",image_url:{url:dataUrl}}]}],max_tokens:1600,temperature:0}),
    async()=>await env.AI.run(QA_MODEL,{prompt,image:toB64(bytes),max_tokens:1600,temperature:0})
  ];
  for(const fn of attempts){
    try{out=await fn();if(out)break;}
    catch(e){lastErr=String(e?.message||e||"VISION_QA_ERROR").slice(0,500);}
  }
  try{
    if(!out)throw new Error(lastErr||"VISION_QA_PROVIDER_FAILED");
    const report=parseQaJson(out);
    if(!report||typeof report!=="object")throw new Error("VISION_QA_REPORT_INVALID");
    const rawChecks=report.checks&&typeof report.checks==="object"?report.checks:{};
    const checks=Object.fromEntries(required.map(k=>[k,rawChecks[k]===true]));

    let focused_text_adjudication=null;
    if(checks.no_text_artifacts===false){
      try{
        const primary=await runNoTextFocusedJudge(env,QA_MODEL,dataUrl,requestId,resultDigest);
        const secondary=await runNoTextFocusedJudge(env,QA_SECONDARY_MODEL,dataUrl,requestId,resultDigest);
        const resolved=primary.text_artifacts_present===false&&secondary.text_artifacts_present===false&&primary.confidence>=0.90&&secondary.confidence>=0.90;
        focused_text_adjudication={observed:true,contract_version:"focused_text_dual_vision_v1",threshold:0.90,resolved,judges:[primary,secondary]};
        if(resolved)checks.no_text_artifacts=true;
      }catch(e){
        focused_text_adjudication={observed:true,contract_version:"focused_text_dual_vision_v1",threshold:0.90,resolved:false,error:String(e?.message||e||"FOCUSED_TEXT_QA_FAILED").slice(0,500)};
      }
    }

    let focused_human_hand_adjudication=null;
    if(required.includes("no_human_hands")){
      try{
        const primary=await runNoHumanHandsFocusedJudge(env,QA_MODEL,dataUrl,requestId,resultDigest,sceneSpec);
        const secondary=await runNoHumanHandsFocusedJudge(env,QA_SECONDARY_MODEL,dataUrl,requestId,resultDigest,sceneSpec);
        const confidentHuman=(primary.human_hand_present===true&&primary.confidence>=0.80)||(secondary.human_hand_present===true&&secondary.confidence>=0.80);
        const confidentClean=primary.human_hand_present===false&&secondary.human_hand_present===false&&primary.confidence>=0.80&&secondary.confidence>=0.80;
        if(confidentHuman)checks.no_human_hands=false;
        else if(confidentClean)checks.no_human_hands=true;
        focused_human_hand_adjudication={observed:true,contract_version:"focused_human_hand_dual_vision_v2",threshold:0.80,confident_human:confidentHuman,confident_clean:confidentClean,judges:[primary,secondary]};
      }catch(e){
        focused_human_hand_adjudication={observed:true,contract_version:"focused_human_hand_dual_vision_v2",threshold:0.80,error:String(e?.message||e||"FOCUSED_HUMAN_HAND_QA_FAILED").slice(0,500)};
      }
    }

    const pass=required.every(k=>checks[k]===true);
    const score=required.filter(k=>checks[k]===true).length/required.length;
    let findings=Array.isArray(report.findings)?report.findings.slice(0,30):[];
    if(focused_text_adjudication?.resolved){
      findings=findings.filter(x=>!/text|letter|word|number|caption|sign|label|watermark text|pseudo-letter|glyph|typograph/i.test(String(x)));
      findings.push("FOCUSED_DUAL_VISION_RESOLVED:no_text_artifacts");
    }
    if(focused_human_hand_adjudication?.confident_clean){
      findings=findings.filter(x=>!/human|humanoid|hand|finger|thumb|wrist|forearm|grip/i.test(String(x)));
      findings.push("FOCUSED_DUAL_VISION_RESOLVED:no_human_hands");
    }
    const normalized={observed:true,request_id:requestId,result_digest:resultDigest,provider:"cloudflare-workers-ai",model:QA_MODEL,secondary_model:QA_SECONDARY_MODEL,qa_contract_version:"vision_task_aware_v5",qa_profile_version:QA_PROFILE_VERSION,active_checks:required,profile,scene_spec_digest:sceneDigest,mime:actualMime,pass,score,primary_score:Math.max(0,Math.min(1,Number(report.score||0))),checks,findings,focused_text_adjudication,focused_human_hand_adjudication};
    normalized.report_digest=await sha256HexText(canonical(normalized));
    return normalized;
  }catch(e){
    const err=String(e?.message||e||lastErr||"VISION_QA_PROVIDER_FAILED").slice(0,500);
    const normalized={observed:true,request_id:requestId,result_digest:resultDigest,provider:"cloudflare-workers-ai",model:QA_MODEL,qa_contract_version:"vision_task_aware_v5",qa_profile_version:QA_PROFILE_VERSION,active_checks:required,profile,scene_spec_digest:sceneDigest,mime:actualMime,pass:false,score:0,checks:Object.fromEntries(required.map(k=>[k,false])),findings:["VISION_QA_PROVIDER_FAILED:"+err]};
    normalized.report_digest=await sha256HexText(canonical(normalized));
    return normalized;
  }
}

async function getReq(env,id){return env.DB.prepare("SELECT * FROM requests WHERE request_id=?").bind(id).first();}
async function event(env,id,type,payload={}){
  const d=await sha256HexText(canonical(payload));
  await env.DB.prepare("INSERT INTO events(request_id,type,ts,payload_digest) VALUES(?,?,?,?)").bind(id,type,Date.now(),d).run();
}
function proofOk(p){
  if(!p||typeof p!=="object") return false;
  const e=Number(p.experts_required||0),v=Number(p.experts_validated||0);
  const common=e>0&&v===e&&Number(p.einstein_stages)===7&&p.cross_expert_complete===true&&p.final_stable===true&&p.gates_pass===true&&p.candidate_frozen===true;
  if(!common) return false;
  if(String(p.contract_version||"")==="council500_v1"){
    return e===500 &&
      Number(p.expert_outputs_observed)>=500 &&
      Number(p.proposals_observed)>=500 &&
      Number(p.jev_calls_observed)>=2 &&
      Number(p.finalists_count)>=1 &&
      Number(p.finalists_count)<=13;
  }
  return Number(p.ideas_validated)===e*100 &&
    Number(p.questions_validated)===e*100 &&
    Number(p.jev_calls_observed)>=e*112;
}

export default {
  async fetch(request,env){
    const u=new URL(request.url),p=u.pathname;

    if(p==="/health"&&request.method==="GET"){
      const d=await env.DB.prepare("SELECT 1 ok").first();
      return json({ok:true,service:"kosif-full-pro-secure-executor",version:VERSION,private_service:true,d1:!!d,workers_ai:!!env.AI,provider:"cloudflare-workers-ai",model:MODEL,qa_contract:"vision_task_aware_v5",qa_profile:QA_PROFILE_VERSION,execution_binding:"execution_contract_digest_v1"});
    }

    if(p.startsWith("/status/")&&request.method==="GET"){
      const id=decodeURIComponent(p.slice(8)),r=await getReq(env,id);
      if(!r) return json({ok:false,error:"NOT_FOUND"},404);
      const t=await env.DB.prepare("SELECT COUNT(*) c,SUM(consumed) used FROM tickets WHERE request_id=?").bind(id).first();
      const q=await env.DB.prepare("SELECT result_digest,model,pass,score,report_digest,created_at FROM artifact_qa_receipts WHERE request_id=?").bind(id).first();
      const qa=q?{observed:true,result_digest:q.result_digest,model:q.model,pass:Number(q.pass||0)===1,score:Number(q.score||0),report_digest:q.report_digest,created_at:q.created_at}:null;
      const ep=await env.DB.prepare("SELECT COUNT(*) c,COALESCE(SUM(receipt_count),0) receipts FROM expert_completions WHERE request_id=?").bind(id).first();
      const fc=await env.DB.prepare("SELECT claimed_at FROM finalizer_claims WHERE request_id=?").bind(id).first();
      return json({ok:true,request:r,tickets:Number(t?.c||0),tickets_consumed:Number(t?.used||0),artifact_qa:qa,expert_completions:Number(ep?.c||0),expert_receipts_observed:Number(ep?.receipts||0),finalizer_claimed:!!fc,finalizer_claimed_at:fc?.claimed_at||null});
    }

    if(p==="/runtime/start"&&request.method==="POST"){
      const b=await readJson(request);
      if(!b?.request_id||b.executor!=="image") return json({ok:false,error:"INVALID_START"},400);
      const old=await getReq(env,b.request_id);
      if(old) return json({ok:true,idempotent:true,request_id:b.request_id,status:old.status});
      const now=Date.now();
      await env.DB.prepare("INSERT INTO requests(request_id,status,executor,created_at,updated_at) VALUES(?,?,?,?,?)")
        .bind(b.request_id,"INITIALIZED","image",now,now).run();
      await event(env,b.request_id,"RUNTIME_INITIALIZED",{executor:"image"});
      return json({ok:true,request_id:b.request_id,status:"INITIALIZED"});
    }


    if(p==="/runtime/expert-claim"&&request.method==="POST"){
      const b=await readJson(request);
      const id=String(b?.request_id||"").slice(0,160),eid=String(b?.expert_id||"").slice(0,160),owner=String(b?.owner||"").slice(0,200);
      const leaseMs=Math.max(15000,Math.min(Number(b?.lease_ms||90000),180000));
      if(!id||!eid||!owner) return json({ok:false,error:"INVALID_EXPERT_CLAIM"},400);
      const r=await getReq(env,id);if(!r) return json({ok:false,error:"NOT_FOUND"},404);
      if(["CANCELLED","BYPASS_DETECTED","COMPLETE"].includes(r.status)) return json({ok:false,error:"REQUEST_NOT_ACTIVE",status:r.status},409);
      const now=Date.now(),until=now+leaseMs;
      const sql="INSERT INTO expert_job_leases(request_id,expert_id,owner,lease_until,updated_at) VALUES(?,?,?,?,?) ON CONFLICT(request_id,expert_id) DO UPDATE SET owner=excluded.owner,lease_until=excluded.lease_until,updated_at=excluded.updated_at WHERE expert_job_leases.lease_until < ? OR expert_job_leases.owner = excluded.owner";
      const claim=await env.DB.prepare(sql).bind(id,eid,owner,until,now,now).run();
      const claimed=Number(claim.meta?.changes||0)===1;
      const row=await env.DB.prepare("SELECT owner,lease_until,updated_at FROM expert_job_leases WHERE request_id=? AND expert_id=?").bind(id,eid).first();
      if(claimed) await event(env,id,"EXPERT_LEASE_CLAIMED",{expert_id:eid,lease_until:until});
      return json({ok:true,request_id:id,expert_id:eid,claimed,lease_until:Number(row?.lease_until||0),owner_match:String(row?.owner||"")===owner});
    }

    if(p==="/runtime/expert-release"&&request.method==="POST"){
      const b=await readJson(request);
      const id=String(b?.request_id||"").slice(0,160),eid=String(b?.expert_id||"").slice(0,160),owner=String(b?.owner||"").slice(0,200);
      if(!id||!eid||!owner) return json({ok:false,error:"INVALID_EXPERT_RELEASE"},400);
      const rel=await env.DB.prepare("DELETE FROM expert_job_leases WHERE request_id=? AND expert_id=? AND owner=?").bind(id,eid,owner).run();
      const released=Number(rel.meta?.changes||0)===1;
      if(released) await event(env,id,"EXPERT_LEASE_RELEASED",{expert_id:eid});
      return json({ok:true,request_id:id,expert_id:eid,released});
    }

    if(p==="/runtime/expert-complete"&&request.method==="POST"){
      const b=await readJson(request);
      const id=String(b?.request_id||"").slice(0,160),eid=String(b?.expert_id||"").slice(0,160),rc=Number(b?.receipt_count||0);
      const contract=String(b?.contract_version||"legacy"); const minReceipts=contract==="council500_v1"?1:112; if(!id||!eid||!Number.isInteger(rc)||rc<minReceipts) return json({ok:false,error:"INVALID_EXPERT_COMPLETION"},400);
      const r=await getReq(env,id);if(!r) return json({ok:false,error:"NOT_FOUND"},404);
      if(["CANCELLED","BYPASS_DETECTED"].includes(r.status)) return json({ok:false,error:"REQUEST_NOT_ACTIVE",status:r.status},409);
      const ins=await env.DB.prepare("INSERT OR IGNORE INTO expert_completions(request_id,expert_id,receipt_count,completed_at) VALUES(?,?,?,?)").bind(id,eid,rc,Date.now()).run();
      if(Number(ins.meta?.changes||0)===0) await env.DB.prepare("UPDATE expert_completions SET receipt_count=MAX(receipt_count,?) WHERE request_id=? AND expert_id=?").bind(rc,id,eid).run();
      const pgr=await env.DB.prepare("SELECT COUNT(*) c,COALESCE(SUM(receipt_count),0) receipts FROM expert_completions WHERE request_id=?").bind(id).first();
      if(Number(ins.meta?.changes||0)===1) await event(env,id,"EXPERT_COMPLETE",{expert_id:eid,receipt_count:rc});
      return json({ok:true,request_id:id,expert_id:eid,idempotent:Number(ins.meta?.changes||0)!==1,expert_completions:Number(pgr?.c||0),expert_receipts_observed:Number(pgr?.receipts||0)});
    }

    if(p==="/runtime/finalizer-claim"&&request.method==="POST"){
      const b=await readJson(request);
      const id=String(b?.request_id||"").slice(0,160),expected=Number(b?.expected_experts||0);
      if(!id||!Number.isInteger(expected)||expected<1) return json({ok:false,error:"INVALID_FINALIZER_CLAIM"},400);
      const r=await getReq(env,id);if(!r) return json({ok:false,error:"NOT_FOUND"},404);
      const pgr=await env.DB.prepare("SELECT COUNT(*) c,COALESCE(SUM(receipt_count),0) receipts FROM expert_completions WHERE request_id=?").bind(id).first();
      if(Number(pgr?.c||0)!==expected) return json({ok:false,error:"EXPERTS_NOT_COMPLETE",expert_completions:Number(pgr?.c||0),expected_experts:expected},409);
      const ins=await env.DB.prepare("INSERT OR IGNORE INTO finalizer_claims(request_id,claimed_at) VALUES(?,?)").bind(id,Date.now()).run();
      const claimed=Number(ins.meta?.changes||0)===1;
      if(claimed) await event(env,id,"FINALIZER_CLAIMED",{expected_experts:expected,expert_receipts_observed:Number(pgr?.receipts||0)});
      return json({ok:true,request_id:id,claimed,expert_completions:Number(pgr?.c||0),expert_receipts_observed:Number(pgr?.receipts||0)});
    }
    if(p==="/runtime/cancel"&&request.method==="POST"){
      const b=await readJson(request),r=b?.request_id?await getReq(env,b.request_id):null;
      if(!r) return json({ok:false,error:"NOT_FOUND"},404);
      if(["EXECUTED","COMPLETE"].includes(r.status)) return json({ok:false,error:"ALREADY_EXECUTED"},409);
      await env.DB.prepare("UPDATE requests SET status='CANCELLED',updated_at=? WHERE request_id=?").bind(Date.now(),b.request_id).run();
      await event(env,b.request_id,"CANCELLED",{});
      return json({ok:true,request_id:b.request_id,status:"CANCELLED"});
    }

    if(p==="/runtime/bypass"&&request.method==="POST"){
      const b=await readJson(request),r=b?.request_id?await getReq(env,b.request_id):null;
      if(!r) return json({ok:false,error:"NOT_FOUND"},404);
      if(r.status==="COMPLETE") return json({ok:false,error:"ALREADY_COMPLETE"},409);
      const reason=String(b?.reason||"direct_host_native_execution").slice(0,300);
      await env.DB.prepare("UPDATE requests SET status='BYPASS_DETECTED',bypass_reason=?,updated_at=? WHERE request_id=?")
        .bind(reason,Date.now(),b.request_id).run();
      await event(env,b.request_id,"BYPASS_DETECTED",{reason});
      return json({ok:true,request_id:b.request_id,status:"BYPASS_DETECTED"});
    }

    if(p==="/runtime/qa-regenerate-authorize"&&request.method==="POST"){
      const b=await readJson(request),r=b?.request_id?await getReq(env,b.request_id):null;
      if(!r)return json({ok:false,error:"NOT_FOUND"},404);
      if(r.status!=="EXECUTED")return json({ok:false,error:"QA_REGEN_REQUIRES_EXECUTED",status:r.status},409);
      if(String(b?.candidate_digest||"")!==String(r.candidate_digest||"")||String(b?.state_digest||"")!==String(r.state_digest||"")||String(b?.execution_lock||"")!==String(r.execution_lock||""))return json({ok:false,error:"QA_REGEN_BINDING_MISMATCH"},409);
      if(String(b?.failed_result_digest||"")!==String(r.result_digest||""))return json({ok:false,error:"QA_REGEN_RESULT_DIGEST_MISMATCH"},409);
      const q=await env.DB.prepare("SELECT * FROM artifact_qa_receipts WHERE request_id=?").bind(b.request_id).first();
      if(!q||String(q.result_digest||"")!==String(r.result_digest||"")||Number(q.pass||0)===1)return json({ok:false,error:"QA_REGEN_NOT_ELIGIBLE"},409);
      let report={};try{report=JSON.parse(String(q.report_json||"{}"));}catch(_){report={};}
      const checks=report?.checks&&typeof report.checks==="object"?report.checks:{};
      const failed=Object.entries(checks).filter(([,v])=>v!==true).map(([k])=>k);
      if(failed.length!==1||failed[0]!=="no_text_artifacts")return json({ok:false,error:"QA_REGEN_ONLY_TEXT_ARTIFACT_ALLOWED",failed},409);
      const ec=await env.DB.prepare("SELECT COUNT(*) c FROM executions WHERE request_id=?").bind(b.request_id).first();
      const executions=Number(ec?.c||0);
      if(executions>=2)return json({ok:false,error:"QA_REGEN_LIMIT_REACHED",executions},409);
      const now=Date.now();
      await env.DB.prepare("UPDATE requests SET status='AUTHORIZED',updated_at=? WHERE request_id=?").bind(now,b.request_id).run();
      const ticket={ticket_id:crypto.randomUUID(),request_id:b.request_id,executor:"image",candidate_digest:r.candidate_digest,state_digest:r.state_digest,execution_lock:r.execution_lock,execution_contract_digest:r.execution_contract_digest,nonce:crypto.randomUUID(),issued_at:now,expires_at:now+300000};
      await env.DB.prepare("INSERT INTO tickets(ticket_id,request_id,executor,candidate_digest,state_digest,execution_lock,execution_contract_digest,nonce,issued_at,expires_at,consumed) VALUES(?,?,?,?,?,?,?,?,?,?,0)").bind(ticket.ticket_id,ticket.request_id,ticket.executor,ticket.candidate_digest,ticket.state_digest,ticket.execution_lock,ticket.execution_contract_digest,ticket.nonce,ticket.issued_at,ticket.expires_at).run();
      await event(env,b.request_id,"QA_REGEN_AUTHORIZED",{failed_result_digest:r.result_digest,qa_report_digest:q.report_digest,ticket_id:ticket.ticket_id,executions_before:executions});
      return json({ok:true,request_id:b.request_id,status:"AUTHORIZED",ticket_id:ticket.ticket_id,expires_at:ticket.expires_at,reason:"qa_text_artifact_regeneration",failed_result_digest:r.result_digest});
    }

    if(p==="/runtime/authorize"&&request.method==="POST"){
      const b=await readJson(request);
      if(!b?.request_id||!b.candidate_digest||!b.state_digest||!b.execution_lock||!b.execution_contract_digest||!proofOk(b.proof))
        return json({ok:false,error:"FULL_PRO_PROOF_INCOMPLETE"},409);
      const r=await getReq(env,b.request_id);
      if(!r) return json({ok:false,error:"NOT_FOUND"},404);
      if(r.status==="BYPASS_DETECTED") return json({ok:false,error:"BYPASS_TAINTED"},409);
      if(["EXECUTED","COMPLETE","EXECUTING"].includes(r.status)) return json({ok:false,error:"ALREADY_EXECUTED"},409);

      const now=Date.now();
      await env.DB.prepare("UPDATE requests SET status='AUTHORIZED',candidate_digest=?,state_digest=?,execution_lock=?,execution_contract_digest=?,updated_at=? WHERE request_id=?")
        .bind(b.candidate_digest,b.state_digest,b.execution_lock,b.execution_contract_digest,now,b.request_id).run();

      const ticket={
        ticket_id:crypto.randomUUID(),request_id:b.request_id,executor:"image",
        candidate_digest:b.candidate_digest,state_digest:b.state_digest,execution_lock:b.execution_lock,execution_contract_digest:b.execution_contract_digest,
        nonce:crypto.randomUUID(),issued_at:now,expires_at:now+300000
      };
      await env.DB.prepare("INSERT INTO tickets(ticket_id,request_id,executor,candidate_digest,state_digest,execution_lock,execution_contract_digest,nonce,issued_at,expires_at,consumed) VALUES(?,?,?,?,?,?,?,?,?,?,0)")
        .bind(ticket.ticket_id,ticket.request_id,ticket.executor,ticket.candidate_digest,ticket.state_digest,ticket.execution_lock,ticket.execution_contract_digest,ticket.nonce,ticket.issued_at,ticket.expires_at).run();
      await event(env,b.request_id,"AUTHORIZED",{candidate_digest:b.candidate_digest,execution_contract_digest:b.execution_contract_digest,ticket_id:ticket.ticket_id});
      return json({ok:true,request_id:b.request_id,status:"AUTHORIZED",ticket_id:ticket.ticket_id,expires_at:ticket.expires_at,execution_contract_digest:b.execution_contract_digest});
    }

    if(p==="/runtime/artifact-retry"&&request.method==="POST"){
      const b=await readJson(request),r=b?.request_id?await getReq(env,b.request_id):null;
      if(!r)return json({ok:false,error:"NOT_FOUND"},404);
      if(!["EXECUTED","COMPLETE"].includes(r.status))return json({ok:false,error:"ARTIFACT_RETRY_INVALID_STATUS",status:r.status},409);
      if(String(b?.candidate_digest||"")!==String(r.candidate_digest||"")||String(b?.state_digest||"")!==String(r.state_digest||"")||String(b?.execution_lock||"")!==String(r.execution_lock||""))return json({ok:false,error:"ARTIFACT_RETRY_BINDING_MISMATCH"},409);
      if(String(b?.prior_result_digest||"")!==String(r.result_digest||""))return json({ok:false,error:"ARTIFACT_RETRY_RESULT_MISMATCH"},409);
      const q=await env.DB.prepare("SELECT * FROM artifact_qa_receipts WHERE request_id=?").bind(b.request_id).first();
      if(!q||String(q.result_digest||"")!==String(r.result_digest||"")||Number(q.pass||0)===1)return json({ok:false,error:"ARTIFACT_RETRY_QA_NOT_FAILED"},409);
      if(String(b?.qa_report_digest||"")!==String(q.report_digest||""))return json({ok:false,error:"ARTIFACT_RETRY_QA_RECEIPT_MISMATCH"},409);
      let report={};try{report=JSON.parse(String(q.report_json||"{}"));}catch(_){report={};}
      const failedChecks=Object.entries(report?.checks||{}).filter(([,v])=>v!==true).map(([k])=>k);
      if(!failedChecks.length)return json({ok:false,error:"ARTIFACT_RETRY_NO_FAILED_CHECKS"},409);
      const ex=await env.DB.prepare("SELECT COUNT(*) c FROM executions WHERE request_id=?").bind(b.request_id).first();
      const attempts=Number(ex?.c||0);
      const qaContract=String(report?.qa_contract_version||"");
      const maxAttempts=((qaContract==="vision_ensemble_v3"||qaContract==="vision_task_aware_v4"||qaContract==="vision_task_aware_v5")&&failedChecks.includes("no_human_hands"))?8:4;
      if(attempts>=maxAttempts)return json({ok:false,error:"ARTIFACT_RETRY_LIMIT",attempts,maxAttempts,qa_contract_version:qaContract,failed_checks:failedChecks},409);
      const now=Date.now();
      const ticket={ticket_id:crypto.randomUUID(),request_id:b.request_id,executor:"image",candidate_digest:r.candidate_digest,state_digest:r.state_digest,execution_lock:r.execution_lock,nonce:crypto.randomUUID(),issued_at:now,expires_at:now+300000};
      await env.DB.prepare("INSERT INTO tickets(ticket_id,request_id,executor,candidate_digest,state_digest,execution_lock,execution_contract_digest,nonce,issued_at,expires_at,consumed) VALUES(?,?,?,?,?,?,?,?,?,?,0)").bind(ticket.ticket_id,ticket.request_id,ticket.executor,ticket.candidate_digest,ticket.state_digest,ticket.execution_lock,ticket.execution_contract_digest,ticket.nonce,ticket.issued_at,ticket.expires_at).run();
      const upd=await env.DB.prepare("UPDATE requests SET status='AUTHORIZED',updated_at=? WHERE request_id=? AND status IN ('EXECUTED','COMPLETE')").bind(now,b.request_id).run();
      if(Number(upd.meta?.changes||0)!==1)return json({ok:false,error:"ARTIFACT_RETRY_STATE_RACE"},409);
      await event(env,b.request_id,"ARTIFACT_RETRY_AUTHORIZED",{candidate_digest:r.candidate_digest,prior_result_digest:r.result_digest,qa_report_digest:q.report_digest,failed_checks:failedChecks,attempt:attempts+1,ticket_id:ticket.ticket_id});
      return json({ok:true,request_id:b.request_id,status:"AUTHORIZED",ticket_id:ticket.ticket_id,expires_at:ticket.expires_at,attempt:attempts+1,failed_checks:failedChecks,prior_result_digest:r.result_digest});
    }

    if(p==="/execute/image"&&request.method==="POST"){
      const b=await readJson(request);
      if(!b?.request_id||!b.scene_spec||!b.execution_contract_digest) return json({ok:false,error:"INVALID_EXECUTION_REQUEST"},400);
      const r=await getReq(env,b.request_id);
      if(!r) return json({ok:false,error:"NOT_FOUND"},404);
      if(r.status!=="AUTHORIZED") return json({ok:false,error:"NOT_AUTHORIZED",status:r.status},409);

      const digest=await sha256HexText(canonical(b.scene_spec));
      if(digest!==r.candidate_digest) return json({ok:false,error:"CANDIDATE_DIGEST_MISMATCH",computed:digest},409);
      if(String(b.execution_contract_digest||"")!==String(r.execution_contract_digest||"")) return json({ok:false,error:"EXECUTION_CONTRACT_MISMATCH"},409);

      const t=await env.DB.prepare("SELECT * FROM tickets WHERE request_id=? AND consumed=0 AND expires_at>=? ORDER BY issued_at DESC LIMIT 1")
        .bind(b.request_id,Date.now()).first();
      if(!t) return json({ok:false,error:"NO_VALID_TICKET"},409);
      if(String(t.request_id||"")!==String(r.request_id||"")||
         String(t.executor||"")!=="image"||
         String(t.candidate_digest||"")!==String(r.candidate_digest||"")||
         String(t.state_digest||"")!==String(r.state_digest||"")||
         String(t.execution_lock||"")!==String(r.execution_lock||"")||
         String(t.execution_contract_digest||"")!==String(r.execution_contract_digest||"")){
        await event(env,b.request_id,"TICKET_BINDING_MISMATCH",{ticket_id:t.ticket_id});
        return json({ok:false,error:"TICKET_BINDING_MISMATCH"},409);
      }

      const consume=await env.DB.prepare("UPDATE tickets SET consumed=1 WHERE ticket_id=? AND consumed=0 AND expires_at>=?")
        .bind(t.ticket_id,Date.now()).run();
      if(Number(consume.meta?.changes||0)!==1) return json({ok:false,error:"TICKET_REPLAY_REJECTED"},409);

      await env.DB.prepare("UPDATE requests SET status='EXECUTING',scene_spec_json=?,updated_at=? WHERE request_id=? AND status='AUTHORIZED'")
        .bind(JSON.stringify(b.scene_spec),Date.now(),b.request_id).run();

      let prompt=String(b.scene_spec.render_prompt||"").trim();
      const retryDirectives=[];
      let renderModel=MODEL;
      if(r.result_digest){
        const priorQa=await env.DB.prepare("SELECT * FROM artifact_qa_receipts WHERE request_id=?").bind(b.request_id).first();
        if(priorQa&&String(priorQa.result_digest||"")===String(r.result_digest||"")&&Number(priorQa.pass||0)!==1){
          let priorReport={};try{priorReport=JSON.parse(String(priorQa.report_json||"{}"));}catch(_){priorReport={};}
          const neg=Array.isArray(b.scene_spec?.negative_constraints)?b.scene_spec.negative_constraints.map(x=>String(x||"").toLowerCase()):[];
          if(priorReport?.checks?.no_text_artifacts===false&&neg.some(x=>x.includes("no text"))){
            retryDirectives.push("ZERO TEXT ARTIFACTS: render absolutely no letters, words, numbers, captions, subtitles, signage, inscriptions, logos, watermarks, UI, symbols, glyphs, pseudo-letters, or text-like marks anywhere in the image; all surfaces and environmental textures must remain purely non-linguistic and must not resemble writing.");
          }
          if(priorReport?.checks?.no_watermark_logo===false&&neg.some(x=>x.includes("watermark")||x.includes("logo"))){
            retryDirectives.push("ZERO BRANDING ARTIFACTS: no watermark, logo, emblem, signature, badge, stamp, label, or brand-like mark anywhere.");
          }
          if(priorReport?.checks?.no_human_hands===false){
            renderModel=QUALITY_MODEL;
            retryDirectives.push("NO UNINTENDED HUMAN HANDS: for every non-human subject or explicit no-human-hands constraint, remove humanoid palms, fingers, thumbs, wrists, forearms, glove-hand silhouettes, and finger-based grips. Preserve only the subject-appropriate anatomy and support mechanism already described by the frozen SceneSpec. Do not invent a duck, sword, brace, or other replacement element.");
          }
          if(priorReport?.checks?.contact_physics===false){
            retryDirectives.push("CONTACT PHYSICS LOCK: correct only the requested subjects and elements. Remove accidental overlap, penetration, floating, impossible support, or contradictory contact. Preserve plausible center of mass, weight, separation or collision, and material interaction without inventing new entities or effects.");
          }
          if(priorReport?.checks?.rain_interaction===false){
            retryDirectives.push("RAIN INTERACTION LOCK: because rain is active in this SceneSpec, make directional rain, wetness, droplets, puddles, splashes, and surface response visibly coherent on only the subjects and materials actually present. Do not invent feathers, scales, armor, or other absent materials.");
          }
          if(neg.some(x=>x.includes("no human hands")||x.includes("no fingers")||(x.includes("impossible")&&x.includes("grip")))){
            retryDirectives.push("SUBJECT-ANATOMY LOCK: enforce the frozen SceneSpec explicit no-human-hands or no-impossible-grip constraint using subject-appropriate anatomy only. Do not add a new animal, prop, support system, or body part.");
          }
          if(retryDirectives.length)await event(env,b.request_id,"ARTIFACT_RETRY_PROMPT_ADAPTATION",{prior_result_digest:r.result_digest,qa_report_digest:priorQa.report_digest,directive_count:retryDirectives.length,failed_checks:Object.entries(priorReport?.checks||{}).filter(([,v])=>v!==true).map(([k])=>k)});
        }
      }
      if(retryDirectives.length)prompt=prompt+"\nSTRICT ARTIFACT-QA RETRY DIRECTIVES (reinforcing existing frozen negative constraints only): "+retryDirectives.join(" ");
      if(!prompt){
        await env.DB.prepare("UPDATE requests SET status='FAILED',updated_at=? WHERE request_id=?").bind(Date.now(),b.request_id).run();
        return json({ok:false,error:"SCENESPEC_RENDER_PROMPT_REQUIRED"},400);
      }
      const width=Math.max(512,Math.min(Number(b.width||1024),1024));
      const height=Math.max(512,Math.min(Number(b.height||1024),1024));
      const form=new FormData();form.append("prompt",prompt);form.append("width",String(width));form.append("height",String(height));
      const fr=new Response(form);

      let ai;
      try{
        ai=await env.AI.run(renderModel,{multipart:{body:fr.body,contentType:fr.headers.get("content-type")}});
      }catch(e){
        await env.DB.prepare("UPDATE requests SET status='PROVIDER_FAILED',updated_at=? WHERE request_id=?").bind(Date.now(),b.request_id).run();
        await event(env,b.request_id,"PROVIDER_FAILURE",{ticket_id:t.ticket_id});
        return json({ok:false,error:"PROVIDER_FAILURE"},502);
      }

      let out;
      try{out=await aiToBytes(ai);}catch{
        await env.DB.prepare("UPDATE requests SET status='PROVIDER_FAILED',updated_at=? WHERE request_id=?").bind(Date.now(),b.request_id).run();
        return json({ok:false,error:"PROVIDER_RESULT_INVALID"},502);
      }
      const resultDigest=await sha256HexBuffer(out.bytes);
      const qaReceipt=await runArtifactVisionQa(env,out.bytes,out.mime,resultDigest,b.request_id,b.scene_spec);
      await env.DB.prepare("INSERT OR REPLACE INTO artifact_qa_receipts(request_id,result_digest,model,pass,score,report_json,report_digest,created_at) VALUES(?,?,?,?,?,?,?,?)").bind(b.request_id,resultDigest,qaReceipt.model,qaReceipt.pass?1:0,qaReceipt.score,JSON.stringify(qaReceipt),qaReceipt.report_digest,Date.now()).run();
      const providerResultId="cfai_"+resultDigest.slice(0,24);
      await env.DB.prepare("INSERT INTO executions(request_id,ticket_id,provider,model,result_digest,execution_contract_digest,created_at) VALUES(?,?,?,?,?,?,?)")
        .bind(b.request_id,t.ticket_id,"cloudflare-workers-ai",renderModel,resultDigest,r.execution_contract_digest,Date.now()).run();
      await env.DB.prepare("UPDATE requests SET status='EXECUTED',result_digest=?,provider_result_id=?,updated_at=? WHERE request_id=?")
        .bind(resultDigest,providerResultId,Date.now(),b.request_id).run();
      const receipt={observed:true,request_id:b.request_id,executor:"image",ticket_id:t.ticket_id,candidate_digest:r.candidate_digest,state_digest:r.state_digest,execution_lock:r.execution_lock,execution_contract_digest:r.execution_contract_digest,provider:"cloudflare-workers-ai",model:renderModel,provider_result_id:providerResultId,result_digest:resultDigest,artifact_qa:{observed:true,model:qaReceipt.model,pass:qaReceipt.pass,score:qaReceipt.score,report_digest:qaReceipt.report_digest}};
      await event(env,b.request_id,"EXECUTED",receipt);
      const receipt64=toB64(enc.encode(JSON.stringify(receipt)));
      return new Response(out.bytes,{status:200,headers:{
        "content-type":out.mime||"image/png","cache-control":"no-store",
        "x-kosif-receipt":receipt64,"x-kosif-result-digest":resultDigest,"x-kosif-provider-result-id":providerResultId
      }});
    }

    if(p==="/artifact/vision-recheck"&&request.method==="POST"){
      const b=await readJson(request),r=b?.request_id?await getReq(env,b.request_id):null;
      if(!r)return json({ok:false,error:"NOT_FOUND"},404);
      if(!["EXECUTED","COMPLETE"].includes(r.status))return json({ok:false,error:"QA_RECHECK_BEFORE_EXECUTION",status:r.status},409);
      if(String(b?.result_digest||"")!==String(r.result_digest||""))return json({ok:false,error:"QA_RECHECK_RESULT_DIGEST_MISMATCH"},409);
      if(typeof b?.data!=="string"||b.data.length<64)return json({ok:false,error:"QA_RECHECK_IMAGE_REQUIRED"},400);
      let bytes;try{bytes=fromB64(b.data);}catch{return json({ok:false,error:"QA_RECHECK_IMAGE_INVALID"},400);}
      const computed=await sha256HexBuffer(bytes);
      if(computed!==r.result_digest)return json({ok:false,error:"QA_RECHECK_BYTES_DIGEST_MISMATCH",computed},409);
      let storedScene={};try{storedScene=JSON.parse(String(r.scene_spec_json||"{}"));}catch(_){storedScene={};}
      const qaReceipt=await runArtifactVisionQa(env,bytes,String(b.mime||"image/png"),r.result_digest,b.request_id,storedScene);
      await env.DB.prepare("INSERT OR REPLACE INTO artifact_qa_receipts(request_id,result_digest,model,pass,score,report_json,report_digest,created_at) VALUES(?,?,?,?,?,?,?,?)").bind(b.request_id,r.result_digest,qaReceipt.model,qaReceipt.pass?1:0,qaReceipt.score,JSON.stringify(qaReceipt),qaReceipt.report_digest,Date.now()).run();
      await event(env,b.request_id,"ARTIFACT_QA_RECHECK",{result_digest:r.result_digest,pass:qaReceipt.pass,score:qaReceipt.score,report_digest:qaReceipt.report_digest});
      return json({ok:qaReceipt.pass,request_id:b.request_id,status:r.status,artifact_qa:qaReceipt},qaReceipt.pass?200:409);
    }

    if(p==="/artifact/qa/retry"&&request.method==="POST"){
      const b=await readJson(request),r=b?.request_id?await getReq(env,b.request_id):null;
      if(!r)return json({ok:false,error:"NOT_FOUND"},404);
      if(r.status!=="EXECUTED")return json({ok:false,error:"QA_RETRY_BEFORE_EXECUTION",status:r.status},409);
      if(!b?.image_b64||!b?.result_digest)return json({ok:false,error:"QA_RETRY_INPUT_INVALID"},400);
      const bytes=fromB64(String(b.image_b64)),digest=await sha256HexBuffer(bytes);
      if(digest!==String(r.result_digest||"")||digest!==String(b.result_digest||""))return json({ok:false,error:"QA_RETRY_DIGEST_MISMATCH"},409);
      const actualMime=inferImageMime(bytes,String(b.mime||""));
      let storedScene={};try{storedScene=JSON.parse(String(r.scene_spec_json||"{}"));}catch(_){storedScene={};}
      const qaReceipt=await runArtifactVisionQa(env,bytes,actualMime,digest,b.request_id,storedScene);
      await env.DB.prepare("INSERT INTO artifact_qa_receipts(request_id,result_digest,model,pass,score,report_json,report_digest,created_at) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(request_id) DO UPDATE SET result_digest=excluded.result_digest,model=excluded.model,pass=excluded.pass,score=excluded.score,report_json=excluded.report_json,report_digest=excluded.report_digest,created_at=excluded.created_at").bind(b.request_id,digest,qaReceipt.model,qaReceipt.pass?1:0,qaReceipt.score,JSON.stringify(qaReceipt),qaReceipt.report_digest,Date.now()).run();
      await event(env,b.request_id,"ARTIFACT_QA_RETRY",{result_digest:digest,pass:qaReceipt.pass,score:qaReceipt.score,report_digest:qaReceipt.report_digest,mime:actualMime});
      return json({ok:true,request_id:b.request_id,result_digest:digest,mime:actualMime,artifact_qa:qaReceipt});
    }

    if(p==="/artifact/qa"&&request.method==="POST"){
      const b=await readJson(request),r=b?.request_id?await getReq(env,b.request_id):null;
      if(!r) return json({ok:false,error:"NOT_FOUND"},404);
      if(r.status!=="EXECUTED") return json({ok:false,error:"QA_BEFORE_EXECUTION",status:r.status},409);
      const q=await env.DB.prepare("SELECT * FROM artifact_qa_receipts WHERE request_id=?").bind(b.request_id).first();
      if(!q||q.result_digest!==r.result_digest||Number(q.pass||0)!==1) return json({ok:false,error:"VISION_QA_NOT_PASSED",artifact_qa:q?{observed:true,model:q.model,pass:false,score:Number(q.score||0),report_digest:q.report_digest}:null},409);
      if(b.pass!==true||b.result_digest!==r.result_digest) return json({ok:false,error:"QA_FAILED"},409);
      await env.DB.prepare("UPDATE requests SET status='COMPLETE',updated_at=? WHERE request_id=?").bind(Date.now(),b.request_id).run();
      await event(env,b.request_id,"ARTIFACT_QA_PASS",{checks:Array.isArray(b.checks)?b.checks:[]});
      return json({ok:true,request_id:b.request_id,status:"COMPLETE"});
    }

    return json({ok:false,error:"NOT_FOUND"},404);
  }
};
