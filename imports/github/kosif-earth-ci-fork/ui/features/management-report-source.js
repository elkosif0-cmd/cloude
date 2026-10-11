/* SQC management capture: strict read-only facts, no normalized-empty fallback or attestation. */
(()=>{
"use strict";
const KEY="skosif_ledger_v1",CO="skosif_companies_v1";
const model=()=>window.SKosifManagementModel;
const object=v=>v!==null&&typeof v==="object"&&!Array.isArray(v);
const text=v=>typeof v==="string"&&v.trim().length>0;
const date=v=>typeof v==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(Date.parse(v+"T00:00:00Z"))&&new Date(v+"T00:00:00Z").toISOString().slice(0,10)===v;
const freeze=v=>{if(v&&typeof v==="object"){Object.values(v).forEach(freeze);Object.freeze(v)}return v};
const fault=code=>{const e=new Error(code);e.code=code;throw e};
const safeCodes=new Set(["SOURCE_UNAVAILABLE","SOURCE_INVALID_JSON","SOURCE_INVALID_SHAPE","SOURCE_FIELD_UNSUPPORTED","CONTEXT_INVALID","CONTEXT_SCOPE_MISMATCH","SCOPE_UNAVAILABLE","SCOPE_CHANGED","HASH_FAILED","SOURCE_CHECKS_INVALID"]);
const error=code=>freeze({ok:false,issues:[{code,message:code}]});
const secret=k=>/^(apikey|accesstoken|refreshtoken|token|password|secret|credentials|pinhash|pinsalt|authorization|auth)$/i.test(k.replace(/[_-]/g,""));
const ACCOUNT=["id","code","name","type","parentId","active","currency"];
const ENTRY=["id","date","reference","memo","source","sourceId","reversedBy","reversalOf","party","method","vatSettlement","demo","legacy","external","seq","sealedAt","prev","hash","currency"];
const LINE=["accountId","debit","credit","description","currency"];
const SIDE_SECTIONS=new Set(["bank","count","chain","termsDays"]);
function fields(value,allow){
  if(!object(value))fault("SOURCE_INVALID_SHAPE");
  const out={};for(const k of Object.keys(value)){
    if(secret(k))continue;
    if(!allow.includes(k))fault("SOURCE_FIELD_UNSUPPORTED");
    const v=value[k];if(v!==null&&!["string","number","boolean"].includes(typeof v))fault("SOURCE_INVALID_SHAPE");
    if(typeof v==="number"&&!Number.isFinite(v))fault("SOURCE_INVALID_SHAPE");out[k]=v;
  }return out;
}
function ledgerFacts(raw){
  if(raw===null||raw===undefined)fault("SOURCE_UNAVAILABLE");
  if(typeof raw!=="string")fault("SOURCE_INVALID_SHAPE");
  let d;try{d=JSON.parse(raw)}catch{fault("SOURCE_INVALID_JSON")}
  if(!object(d)||!Array.isArray(d.accounts)||!Array.isArray(d.entries))fault("SOURCE_INVALID_SHAPE");
  const omitted=[];
  for(const k of Object.keys(d))if(!["accounts","entries","lockDate"].includes(k)&&!secret(k)){
    if(SIDE_SECTIONS.has(k))omitted.push(k);else fault("SOURCE_FIELD_UNSUPPORTED");
  }
  const result={accounts:d.accounts.map(a=>fields(a,ACCOUNT)),entries:d.entries.map(e=>{
    if(!object(e)||!Array.isArray(e.lines))fault("SOURCE_INVALID_SHAPE");
    const {lines,...rest}=e;return{...fields(rest,ENTRY),lines:lines.map(l=>fields(l,LINE))};
  })};
  if(Object.prototype.hasOwnProperty.call(d,"lockDate")){if(typeof d.lockDate!=="string")fault("SOURCE_INVALID_SHAPE");result.lockDate=d.lockDate}
  return {ledger:result,omitted:omitted.sort()};
}
function scopeValue(s){
  if(!object(s))fault("SCOPE_UNAVAILABLE");
  return {status:s.status,token:s.token,userId:s.userId,spaceId:s.spaceId,entityId:s.entityId,periodId:s.periodId,context:object(s.context)?{entityName:s.context.entityName,start:s.context.start,end:s.context.end,currency:s.context.currency}:null};
}
function scopeValid(s){return s.status==="stable"&&[s.token,s.userId,s.spaceId,s.entityId,s.periodId].every(text)&&s.spaceId===s.entityId&&s.context&&Object.values(s.context).every(text)}
function contextValue(c,s){
  if(!object(c)||![c.entityId,c.entityName,c.start,c.end,c.currency].every(text)||c.currencyExponent!==2||!date(c.start)||!date(c.end)||c.start>c.end||(c.scale!==undefined&&c.scale!==1)||c.basis!=="management-ledger"||!(c.retainedAccountId===null||text(c.retainedAccountId)))fault("CONTEXT_INVALID");
  if(c.entityId!==s.entityId||["entityName","start","end","currency"].some(k=>c[k]!==s.context[k]))fault("CONTEXT_SCOPE_MISMATCH");
  return{entityId:c.entityId,entityName:c.entityName,start:c.start,end:c.end,currency:c.currency,currencyExponent:2,basis:"management-ledger",scopeToken:s.token};
}
function checksValue(values,omitted){
  if(values!==undefined&&!Array.isArray(values))fault("SOURCE_CHECKS_INVALID");
  const seen=new Set(),statuses=new Set(["supported","incomplete","discrepancy","stale","not_tested"]);
  const checks=(values||[]).map(v=>{
    if(!object(v)||!text(v.id)||v.id==="ledgerSideSections"||seen.has(v.id))fault("SOURCE_CHECKS_INVALID");seen.add(v.id);
    const supported=["sales","receipts","advances"].includes(v.id);
    return{id:v.id,status:supported&&statuses.has(v.status)?v.status:"not_tested",message:supported&&typeof v.message==="string"?v.message:"لم يُختبر اكتمال هذا المصدر في التقاط الدفاتر"};
  });
  for(const id of ["sales","receipts","advances","otherModules"])if(!checks.some(c=>c.id===id))checks.push({id,status:"not_tested",message:"لم يُختبر اكتمال هذا المصدر في التقاط الدفاتر"});
  if(omitted.length)checks.push({id:"ledgerSideSections",status:"not_tested",message:"أقسام خارج إسقاط الأرصدة: "+omitted.join(", ")});
  return checks.sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0);
}
function defaultContext(){
  let d;try{d=JSON.parse(localStorage.getItem(CO))}catch{fault("CONTEXT_INVALID")}
  if(!object(d)||!object(d.active)||!Array.isArray(d.companies)||!Array.isArray(d.periods))fault("CONTEXT_INVALID");
  const cs=d.companies.filter(c=>c?.id===d.active.companyId),ps=d.periods.filter(p=>p?.id===d.active.periodId);
  if(cs.length!==1||ps.length!==1||ps[0].companyId!==cs[0].id)fault("CONTEXT_INVALID");
  const c=cs[0],p=ps[0];if(!["SAR","EGP","AED","USD"].includes(c.currency))fault("CONTEXT_INVALID");
  return{entityId:c.id,entityName:c.name,currency:c.currency,currencyExponent:2,start:p.startDate,end:p.endDate,basis:"management-ledger",retainedAccountId:null};
}
async function defaultHash(value){
  const bytes=new TextEncoder().encode(value),digest=await window.crypto.subtle.digest("SHA-256",bytes);
  return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,"0")).join("");
}
const captured=new WeakMap();
function readFacts(options={}){
  const scopeReader=options.scopeReader||(()=>window.SKosifSpace.scopeSnapshot()),ledgerReader=options.ledgerReader||(()=>localStorage.getItem(KEY)),contextReader=options.contextReader||defaultContext;
  const capturedAt=new Date().toISOString();
  let before;try{before=scopeValue(scopeReader())}catch{fault("SCOPE_UNAVAILABLE")}
  if(!scopeValid(before))fault("SCOPE_UNAVAILABLE");
  let raw;try{raw=ledgerReader()}catch{fault("SOURCE_UNAVAILABLE")}
  const projected=ledgerFacts(raw);
  let chosen;try{chosen=contextReader()}catch{fault("CONTEXT_INVALID")}
  const context=contextValue(chosen,before),retainedAccountId=chosen.retainedAccountId;
  const input=freeze({ledger:projected.ledger,context,retainedAccountId,sourceChecks:checksValue(chosen.sourceChecks,projected.omitted)});
  const contextPayload={context,retainedAccountId,userId:before.userId,spaceId:before.spaceId,periodId:before.periodId};
  const originalScope=model().canonical(before),contextText=model().canonical(contextPayload),inputText=model().canonical({ledger:input.ledger,context:contextPayload}),evidenceText=model().canonical(input.sourceChecks);
  let after;try{after=scopeValue(scopeReader())}catch{fault("SCOPE_CHANGED")}
  if(!scopeValid(after)||model().canonical(after)!==originalScope)fault("SCOPE_CHANGED");
  return{input,before,scopeReader,ledgerReader,contextReader,capturedAt,originalScope,contextText,inputText,evidenceText};
}
async function capture(options={}){
  try{
    const facts=readFacts(options),sha256=options.sha256||defaultHash;
    let inputHash,contextHash,evidenceHash;
    try{inputHash=await sha256(facts.inputText);contextHash=await sha256(facts.contextText);evidenceHash=await sha256(facts.evidenceText);if(![inputHash,contextHash,evidenceHash].every(x=>typeof x==="string"&&/^[a-f0-9]{64}$/.test(x)))fault("HASH_FAILED")}catch{fault("HASH_FAILED")}
    let after;try{after=scopeValue(facts.scopeReader())}catch{fault("SCOPE_CHANGED")}
    if(!scopeValid(after)||model().canonical(after)!==facts.originalScope)fault("SCOPE_CHANGED");
    const result=freeze({ok:true,input:facts.input,inputHash,contextHash,evidenceHash,capturedAt:facts.capturedAt,scopeToken:facts.before.token});
    captured.set(result,facts);return result;
  }catch(e){return error(safeCodes.has(e?.code)?e.code:"SOURCE_INVALID_SHAPE")}
}
async function checkFresh(expected,options={}){
  if(!expected||![expected.inputHash,expected.contextHash,expected.evidenceHash].every(x=>typeof x==="string"&&/^[a-f0-9]{64}$/.test(x))||!text(expected.scopeToken))return freeze({fresh:false,reason:"BINDING_INVALID"});
  const now=await capture(options);
  if(!now.ok)return freeze({fresh:false,reason:now.issues[0].code});
  if(now.scopeToken!==expected.scopeToken)return freeze({fresh:false,reason:"SCOPE_CHANGED"});
  if(now.contextHash!==expected.contextHash)return freeze({fresh:false,reason:"CONTEXT_CHANGED"});
  if(now.inputHash!==expected.inputHash)return freeze({fresh:false,reason:"SOURCE_CHANGED"});
  if(now.evidenceHash!==expected.evidenceHash)return freeze({fresh:false,reason:"EVIDENCE_CHANGED"});
  // Final synchronous sample closes the async-hash drift window. It never replaces the model.
  try{
    const final=readFacts(options),prior=captured.get(now);
    if(final.originalScope!==prior.originalScope)return freeze({fresh:false,reason:"SCOPE_CHANGED"});
    if(final.contextText!==prior.contextText)return freeze({fresh:false,reason:"CONTEXT_CHANGED"});
    if(final.inputText!==prior.inputText)return freeze({fresh:false,reason:"SOURCE_CHANGED"});
    if(final.evidenceText!==prior.evidenceText)return freeze({fresh:false,reason:"EVIDENCE_CHANGED"});
  }catch(e){return freeze({fresh:false,reason:safeCodes.has(e?.code)?e.code:"SOURCE_INVALID_SHAPE"})}
  return freeze({fresh:true});
}
/* A final synchronous boundary check. Only this module's original capture is accepted;
   no asynchronous hash or mutable replacement model is allowed at native beforeprint. */
function isCurrent(expected){
  const prior=captured.get(expected);if(!prior)return false;
  try{const now=readFacts({scopeReader:prior.scopeReader,ledgerReader:prior.ledgerReader,contextReader:prior.contextReader});
    return now.originalScope===prior.originalScope&&now.contextText===prior.contextText&&now.inputText===prior.inputText&&now.evidenceText===prior.evidenceText;
  }catch{return false}
}
window.SKosifManagementSource=Object.freeze({capture,checkFresh,isCurrent});
})();
