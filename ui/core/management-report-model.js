/* SQC management report: pure exact-minor model. No storage, posting, network or issuance. */
(()=>{
"use strict";
const CAP=1000000000000n,SYNTHETIC="derived:prior-results";
const TYPES=new Set(["asset","liability","equity","revenue","expense"]);
const obj=v=>v!==null&&typeof v==="object"&&!Array.isArray(v);
const text=v=>typeof v==="string"&&v.trim().length>0;
const date=v=>typeof v==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(Date.parse(v+"T00:00:00Z"))&&new Date(v+"T00:00:00Z").toISOString().slice(0,10)===v;
const cmp=(a,b)=>a<b?-1:a>b?1:0;
function freeze(v){if(v&&typeof v==="object"){Object.values(v).forEach(freeze);Object.freeze(v)}return v}
/* Only root envelope timestamps are volatile; identically named source fields remain evidence. */
function canonical(value){
  const stack=new Set();
  function visit(v,root=false){
    if(v===null||typeof v==="string"||typeof v==="boolean")return JSON.stringify(v);
    if(typeof v==="number"){if(!Number.isFinite(v))throw new TypeError("NONFINITE_CANONICAL_VALUE");return JSON.stringify(v)}
    if(typeof v!=="object"||(!Array.isArray(v)&&Object.prototype.toString.call(v)!=="[object Object]"))throw new TypeError("UNSUPPORTED_CANONICAL_VALUE");
    if(stack.has(v))throw new TypeError("CYCLIC_CANONICAL_VALUE");stack.add(v);
    let result;
    if(Array.isArray(v)){const parts=[];for(let i=0;i<v.length;i++)parts.push(visit(v[i]));result="["+parts.join(",")+"]"}
    else result="{"+Object.keys(v).filter(k=>!root||!['exportedAt','confirmedAt'].includes(k)).sort(cmp).map(k=>JSON.stringify(k)+":"+visit(v[k])).join(",")+"}";
    stack.delete(v);return result;
  }
  return visit(value,true);
}
function minor(v){
  if((typeof v!=="number"&&typeof v!=="string")||(typeof v==="number"&&(!Number.isFinite(v)||v<0)))return{code:"AMOUNT_INVALID"};
  const s=String(v);
  if(/^\d+\.\d{3,}$/.test(s))return{code:"AMOUNT_PRECISION_UNSUPPORTED"};
  if(!/^\d+(?:\.\d{1,2})?$/.test(s)||s.length>40)return{code:"AMOUNT_INVALID"};
  const [whole,fraction=""]=s.split(".");return{value:BigInt(whole)*100n+BigInt(fraction.padEnd(2,"0"))};
}
function build(input){
  const issues=[];
  const issue=(code,details={})=>issues.push({code,...details});
  const failed=()=>freeze({ok:false,model:null,issues});
  const c=input&&input.context,l=input&&input.ledger;
  if(!obj(c)||!text(c.entityId)||!text(c.entityName)||!text(c.scopeToken)||!date(c.start)||!date(c.end)||c.start>c.end||c.currencyExponent!==2||typeof c.currency!=="string"||!/^[A-Z]{3}$/.test(c.currency)||c.basis!=="management-ledger"){
    issue("CONTEXT_INVALID");return failed();
  }
  if(!obj(l)||!Array.isArray(l.accounts)||!Array.isArray(l.entries)){issue("LEDGER_SHAPE_INVALID");return failed()}
  if(!l.entries.length){issue("LEDGER_EMPTY");return failed()}
  const accounts=new Map();let fatal=false,unresolved=false;
  const currencyOK=v=>!Object.prototype.hasOwnProperty.call(v,"currency")||v.currency===c.currency;
  for(const a of l.accounts){
    if(!obj(a)||!text(a.id)||typeof a.code!=="string"||!text(a.name)){issue("ACCOUNT_SHAPE_INVALID");fatal=true;continue}
    if(!currencyOK(a)){issue("MIXED_CURRENCY_UNSUPPORTED",{accountId:a.id});fatal=true}
    if(a.id===SYNTHETIC){issue("ACCOUNT_ID_RESERVED",{accountId:a.id});fatal=true;continue}
    if(accounts.has(a.id)){issue("ACCOUNT_ID_DUPLICATE",{accountId:a.id});fatal=true;continue}
    const unknown=!TYPES.has(a.type);
    accounts.set(a.id,{id:a.id,code:a.code,label:a.name,type:unknown?null:a.type,unresolved:unknown});
    if(unknown){unresolved=true;issue("ACCOUNT_TYPE_UNRESOLVED",{accountId:a.id})}
  }
  const retained=input.retainedAccountId;
  if(retained!==null&&(!text(retained)||!accounts.has(retained)||accounts.get(retained).type!=="equity")){
    issue("RETAINED_MAPPING_INVALID");fatal=true;
  }
  const entries=[],ids=new Set();let aggregate=0n;
  for(const e of l.entries){
    if(!obj(e)||!text(e.id)){issue("ENTRY_SHAPE_INVALID");fatal=true;continue}
    if(!currencyOK(e)){issue("MIXED_CURRENCY_UNSUPPORTED",{entryId:e.id});fatal=true}
    if(ids.has(e.id)){issue("ENTRY_ID_DUPLICATE",{entryId:e.id});fatal=true}ids.add(e.id);
    if(!date(e.date)){issue("ENTRY_DATE_INVALID",{entryId:e.id});fatal=true}
    if(!Array.isArray(e.lines)||e.lines.length<2){issue("ENTRY_LINES_INVALID",{entryId:e.id});fatal=true;continue}
    const lines=[];let debit=0n,credit=0n,valid=true;
    for(const [index,line] of e.lines.entries()){
      if(!obj(line)||!text(line.accountId)){issue("LINE_ACCOUNT_INVALID",{entryId:e.id,lineIndex:index});fatal=true;valid=false;continue}
      if(line.accountId===SYNTHETIC){issue("ACCOUNT_ID_RESERVED",{accountId:line.accountId});fatal=true}
      if(!currencyOK(line)){issue("MIXED_CURRENCY_UNSUPPORTED",{entryId:e.id,lineIndex:index});fatal=true}
      const dr=minor(line.debit),cr=minor(line.credit);
      if(dr.code||cr.code){issue(dr.code||cr.code,{entryId:e.id,lineIndex:index});fatal=true;valid=false;continue}
      if(dr.value&&cr.value){issue("LINE_BOTH_SIDES",{entryId:e.id,lineIndex:index});fatal=true;valid=false}
      if(!dr.value&&!cr.value){issue("LINE_ZERO_AMOUNT",{entryId:e.id,lineIndex:index});fatal=true;valid=false}
      aggregate+=dr.value+cr.value;debit+=dr.value;credit+=cr.value;
      if(!accounts.has(line.accountId)){
        accounts.set(line.accountId,{id:line.accountId,code:"",label:"حساب غير معروف: "+line.accountId,type:null,unresolved:true});
        unresolved=true;issue("ACCOUNT_UNRESOLVED",{accountId:line.accountId});
      }
      lines.push({accountId:line.accountId,balance:dr.value-cr.value});
    }
    if(valid&&debit!==credit){issue("JOURNAL_UNBALANCED",{entryId:e.id});fatal=true}
    entries.push({id:e.id,date:e.date,lines});
  }
  if(aggregate>CAP){issue("AGGREGATE_RANGE_UNSUPPORTED");fatal=true}
  if(fatal)return failed();
  const rows=new Map([...accounts].map(([id,a])=>[id,{...a,balance:0n,sourceIds:new Set(),role:"detail"}]));
  let carried=0n;const carrySources=new Set();
  for(const e of entries){
    if(e.date>c.end){issue("ENTRY_AFTER_PERIOD",{entryId:e.id});continue}
    for(const line of e.lines){
      const r=rows.get(line.accountId),result=r.type==="revenue"||r.type==="expense";
      if(result&&e.date<c.start){carried+=line.balance;carrySources.add(e.id);continue}
      r.balance+=line.balance;r.sourceIds.add(e.id);
    }
  }
  if(carried){
    const id=retained||SYNTHETIC;
    if(!rows.has(id))rows.set(id,{id,code:"",label:"نتائج فترات سابقة — رصيد مشتق",type:"equity",unresolved:false,balance:0n,sourceIds:new Set(),role:"derived"});
    const r=rows.get(id);r.balance+=carried;for(const s of carrySources)r.sourceIds.add(s);
    r.derivedAdjustment={kind:"prior-results",amountMinor:String(carried),formula:"sum(prior revenue/expense debit-minus-credit)",sourceIds:[...carrySources].sort(cmp)};
  }
  let dr=0n,cr=0n,revenue=0n,expense=0n;
  const output=[...rows.values()].sort((a,b)=>cmp(a.id,b.id)).map(r=>{
    const d=r.balance>0n?r.balance:0n,k=r.balance<0n?-r.balance:0n;dr+=d;cr+=k;
    if(r.type==="revenue")revenue-=r.balance;if(r.type==="expense")expense+=r.balance;
    return{id:r.id,code:r.code,label:r.label,role:r.role,unresolved:r.unresolved,balanceMinor:String(r.balance),closingDebitMinor:String(d),closingCreditMinor:String(k),sourceIds:[...r.sourceIds].sort(cmp),...(r.derivedAdjustment?{derivedAdjustment:r.derivedAdjustment}:{})};
  });
  if(dr!==cr){issue("CLOSING_BALANCE_MISMATCH");return failed()}
  const checks=Array.isArray(input.sourceChecks)?input.sourceChecks.map(x=>({id:typeof x?.id==="string"?x.id:"unknown",status:typeof x?.status==="string"?x.status:"not_tested",message:typeof x?.message==="string"?x.message:""})):[];
  const evidence=checks.some(x=>["incomplete","discrepancy","stale"].includes(x.status))?"incomplete":checks.length&&checks.every(x=>x.status==="supported")?"supported":"not_tested";
  const model={schemaVersion:1,status:"draft",assuranceScopes:[],context:{entityId:c.entityId,entityName:c.entityName,currency:c.currency,currencyExponent:2,start:c.start,end:c.end,basis:c.basis,scopeToken:c.scopeToken},rows:output,totals:{closingDebitMinor:String(dr),closingCreditMinor:String(cr)},summary:unresolved?null:{revenueMinor:String(revenue),expenseMinor:String(expense),resultMinor:String(revenue-expense)},validation:{numeric:unresolved?"incomplete":"reconciled",evidence,human:"draft"},sourceChecks:checks,issues};
  return freeze({ok:true,model,issues});
}
window.SKosifManagementModel=Object.freeze({build,canonical});
})();
