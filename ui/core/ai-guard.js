/* S.kosif core — the AI trust layer (SK.aiGuard). FOUNDATION §3.0 rule 9: the AI session is bound to the workspace and the
   company's data never leaves the device unmasked. ui/core/ai.js opens a guard session around every provider call:
     open(body, meta)  → {body: the masked request, done(res, model) → the un-masked answer, fail(err, model)}
   Before the text leaves: phones, emails, IBANs, national IDs, commercial registrations, VAT numbers and the names of the
   company's own customers/suppliers (the company definitions, the customers the sales screens read from IndexedDB, the
   customers already sold to) become stable tokens «[عميل-7]»; the reverse map lives only in this page's memory and un-masks
   the answer on the device. A preflight blocks a request whose masked text still carries identifiers or a customer table.
   Every call — ok, error or blocked — appends one row to the unified AI trace log (docs/registry/EXTERNAL_BACKLOG_ar.md §4-1):
   hash of the masked prompt, counts and sizes, never the prompt. The log is company data (its key matches HELPER_KEY in
   ui/core/helper-space.js, so it swaps with the company); the screen is ui/features/ai-trace.js.
   The engine is SKEngines.system.aiGuard (app/src/engine/fusion/system/ai-guard-engine.ts); until engines.js is regenerated
   the module passes the request through unmasked and says so in the row's note. */
(()=>{
"use strict";
const {load,save}=SK;
const KEY="skosif_ops_ai_trace"; /* per company: matches HELPER_KEY (skosif_ops_[a-z_]+) */
const MAX_ROWS=500,NAMES_TTL=45000;
const ENG=()=>{try{const e=window.SKEngines&&SKEngines.system&&SKEngines.system.aiGuard;return e&&typeof e.maskBody==="function"?e:null}catch{return null}};
const DEFAULT_POLICY=Object.freeze({maxUnmasked:0,maxUnmaskedNames:0,maxBytes:600000,tableRows:40,maskNames:true});

/* ---------- the store: {v, policy, rows} under one company key ---------- */
const read=()=>{const d=load(KEY,null);return d&&typeof d==="object"&&Array.isArray(d.rows)?d:{v:1,policy:{},rows:[]}};
const write=d=>save(KEY,d);
const policy=()=>Object.assign({},DEFAULT_POLICY,read().policy||{});
function setPolicy(patch){const d=read();d.policy=Object.assign({},d.policy||{},patch||{});for(const k of Object.keys(d.policy))if(!(k in DEFAULT_POLICY))delete d.policy[k];write(d);return policy()}
const trace=()=>read().rows.slice();
function clear(){const d=read();d.rows=[];write(d);SK.bus&&SK.bus.emit("ai-trace",null)}
function record(row){
  const E=ENG();if(E&&E.traceSafe&&!E.traceSafe(row))return null; /* a prompt, body or map never reaches the log */
  const d=read();d.rows.unshift(row);if(d.rows.length>MAX_ROWS)d.rows.length=MAX_ROWS;write(d);
  SK.bus&&SK.bus.emit("ai-trace",row);return row;
}

/* ---------- the context of a call: the company, the section, the screen ---------- */
function context(){
  let company="",gate="",screen="";
  try{company=SK.company&&SK.company.current?SK.company.current().id:""}catch{}
  try{gate=SK.gate&&SK.gate.current?SK.gate.current():""}catch{}
  try{screen=window.SKosifCore&&SKosifCore.view?SKosifCore.view():""}catch{}
  return{company,gate,screen};
}

/* ---------- the company's master-data names, cached per company for a short while ---------- */
let cache={companyId:null,at:0,list:[]};
const clean=v=>String(v==null?"":v).replace(/\s+/g," ").trim();
async function names(){
  const {company}=context();
  if(cache.companyId===company&&Date.now()-cache.at<NAMES_TTL)return cache.list;
  const out=new Set();
  const add=v=>{const s=clean(v);if(s.length>=3)out.add(s)};
  try{const P=window.SKosifCompanyPlatform;if(P&&P.definitions){P.definitions("customers").forEach(x=>add(x&&x.name));P.definitions("suppliers").forEach(x=>add(x&&x.name))}}catch{}
  try{(load("aghnam-v12-manual-sales",[])||[]).forEach(x=>add(x&&x.customer))}catch{}
  try{if(SK.store&&SK.store.idbAll){const cs=await SK.store.idbAll("customers").catch(()=>[]);(cs||[]).forEach(c=>add(c&&c.name))}}catch{}
  cache={companyId:company,at:Date.now(),list:[...out]};
  return cache.list;
}
const invalidate=()=>{cache.at=0};
if(SK.bus){SK.bus.on("company",invalidate);SK.bus.on("data",e=>{if(e&&/manual-sales|company_platform/.test(String(e.key||"")))invalidate()})}

/* ---------- a guard session around one provider call ---------- */
const bytes=s=>{const E=ENG();if(E&&E.utf8Bytes)return E.utf8Bytes(s);try{return new TextEncoder().encode(s).length}catch{return String(s).length}};
async function open(body,meta={}){
  const E=ENG(),ctx=context(),pol=policy(),t0=Date.now();
  const base={company:ctx.company,gate:ctx.gate,screen:ctx.screen,provider:meta.provider||"",model:meta.model||"",purpose:meta.purpose||ctx.screen||"",userNote:meta.userNote||""};
  const finish=(patch)=>{const row=E&&E.traceRecord?E.traceRecord({...base,...patch}):{id:"ai-"+Date.now().toString(36),ts:new Date().toISOString(),...base,promptHash:"",maskedCount:0,maskedKinds:{},inputBytes:0,outputBytes:0,outcome:"ok",durationMs:0,error:"",...patch};return record(row)};
  if(!E){
    const text=JSON.stringify(body||{});
    console.warn("SK.aiGuard: SKEngines.system.aiGuard is not loaded — the request leaves unmasked");
    return{body,map:{},masked:0,blocked:false,
      done:(res,model)=>{finish({model:model||base.model,inputBytes:bytes(text),outputBytes:bytes(JSON.stringify(res||{})),outcome:"ok",durationMs:Date.now()-t0,userNote:(base.userNote?base.userNote+" · ":"")+"محرك التقنيع غير محمّل — أُرسل دون تقنيع"});return res},
      fail:(err,model)=>{finish({model:model||base.model,inputBytes:bytes(text),outcome:"error",durationMs:Date.now()-t0,error:err&&err.message||String(err),userNote:(base.userNote?base.userNote+" · ":"")+"محرك التقنيع غير محمّل"})}};
  }
  const list=pol.maskNames?await names():[];
  const m=E.maskBody(body||{},{names:list});
  const pre=E.preflight(m.text,{maxUnmasked:pol.maxUnmasked,maxUnmaskedNames:pol.maxUnmaskedNames,maxBytes:pol.maxBytes,tableRows:pol.tableRows,names:list});
  const hash=E.sha256Hex(m.text),inputBytes=bytes(JSON.stringify(m.body));
  const common={promptHash:hash,maskedCount:m.total,maskedKinds:m.counts,inputBytes};
  if(!pre.allowed){
    finish({...common,outcome:"blocked",durationMs:Date.now()-t0,error:pre.reasons.join("؛ ")});
    const e=new Error("أوقف حارس الذكاء الاصطناعي الطلب: "+pre.reasons.join("؛ ")+".");e.code="ai-blocked";e.reasons=pre.reasons;throw e;
  }
  return{body:m.body,map:m.map,masked:m.total,blocked:false,
    done:(res,model)=>{const out=E.unmaskResponse(res,m.map);finish({...common,model:model||base.model,outputBytes:bytes(JSON.stringify(res||{})),outcome:"ok",durationMs:Date.now()-t0});return out},
    fail:(err,model)=>{finish({...common,model:model||base.model,outcome:"error",durationMs:Date.now()-t0,error:err&&err.message||String(err)})}};
}
/* the engine's pure helpers for screens (empty results when the engine is absent) */
const summary=rows=>{const E=ENG();return E&&E.traceSummary?E.traceSummary(rows||trace()):{total:(rows||trace()).length,ok:0,error:0,blocked:0,masked:0,inputBytes:0,outputBytes:0,byProvider:{},byPurpose:{},byOutcome:{ok:0,error:0,blocked:0}}};
const filter=(rows,f)=>{const E=ENG();return E&&E.filterTrace?E.filterTrace(rows,f||{}):rows};
const maskText=(text,opts)=>{const E=ENG();return E?E.maskText(text,opts||{}):{masked:String(text||""),map:{},counts:{},total:0}};

SK.aiGuard=Object.freeze({KEY,open,trace,clear,record,policy,setPolicy,DEFAULT_POLICY,summary,filter,maskText,names,invalidate,engine:ENG,context});
})();
