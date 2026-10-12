/* KOSIF EARTH — company/gateway scoped activity audit (SK.audit).
   Inspired by SEE's provenance-first event isolation, reimplemented for KOSIF.
   Legacy device-global skosif_audit_trail is retained untouched, not imported
   into any company. Local event logs are not a server security boundary. */
(()=>{
"use strict";
const KEY="earth_audit_events_v1:",LEGACY_KEY="skosif_audit_trail",MAX=500;
const buckets=new Map(),dirty=new Set();
let timer=0;
const role=()=>SK.perm?.role?.()||"admin";
/* Audit engagements are independent client files; the accounting company must
   never decide where their events are recorded. A missing/invalid context fails
   closed rather than silently reusing another file's or company's history. */
function scopeKey(){
  const gate=SK.gate?.current?.();
  if(!["accounting","audit","tools"].includes(gate))return "";
  if(gate==="audit"){
    const register=SK.load("skosif_engagements_v1",null);
    const active=register?.active;
    if(!active||!Array.isArray(register.list)||
       !register.list.some(e=>e&&e.id===active))return "";
    return KEY+"audit:"+encodeURIComponent(active);
  }
  if(window.SKosifSpace?.busy?.())return "";
  if(gate==="tools"){
    const user=window.SKosifSpace?.user?.();
    const space=window.SKosifSpace?.current?.();
    if(!user?.id||!space?.id||space.id==="space-main")return "";
    return KEY+"tools:"+encodeURIComponent(user.id)+":"+encodeURIComponent(space.id);
  }
  const company=SK.company?.current?.();
  if(!company?.id||company.id==="space-main"||
     company.ownerScope&&company.ownerScope!=="FULL_ACCOUNTING")return "";
  return KEY+"accounting:"+encodeURIComponent(company.id);
}
function bucket(key){
  if(!buckets.has(key)){
    const saved=SK.load(key,[]);
    buckets.set(key,Array.isArray(saved)?saved.slice(0,MAX):[]);
  }
  return buckets.get(key);
}
function all(){
  const key=scopeKey();
  return key?bucket(key):[];
}
function flush(){
  timer=0;
  for(const key of [...dirty]){
    const events=buckets.get(key)||[];
    try{localStorage.setItem(key,JSON.stringify(events.slice(0,MAX)));dirty.delete(key)}
    catch(err){SK.errors?.report?.(err,"audit:save")}
  }
}
function schedule(key){
  dirty.add(key);
  if(!timer)timer=setTimeout(flush,800);
}
function log(type,detail={}){
  const key=scopeKey();
  if(!key)return false;
  const e={at:new Date().toISOString(),type,role:role(),
    view:window.SKosifCore?.view?.()||"",...detail};
  const events=bucket(key);
  if(type==="data"&&events[0]?.type==="data"&&events[0]?.key===e.key&&
     Date.parse(e.at)-Date.parse(events[0].at)<60000){
    events[0].at=e.at;events[0].n=(events[0].n||1)+1;
  }else events.unshift(e);
  if(events.length>MAX)events.length=MAX;
  schedule(key);
  return true;
}
function clear(){
  const key=scopeKey();
  if(!key)return false;
  buckets.set(key,[]);schedule(key);return true;
}
function csv(){
  SK.csv.download("SQC-audit-trail",
    ["التاريخ","النوع","الدور","الشاشة","الإجراء"],
    all().map(e=>[e.at,e.type,e.role,e.view,e.act||e.to||e.key||e.msg||
      (e.keys!=null?e.keys+" مفتاح":"")]));
}
addEventListener("pagehide",flush);
if(SK.bus){
  SK.bus.on("nav",d=>log("nav",{to:d.to}));
  SK.bus.on("action",d=>{
    if(d.act!=="nav"&&d.act!=="mode"&&!/^rail-/.test(d.act))
      log("action",{act:d.act});
  });
  SK.bus.on("data",d=>log("data",{key:d.key}));
  SK.bus.on("backup",d=>log("backup",{keys:d.keys}));
  SK.bus.on("restore",d=>log("restore",d.rollback?{msg:"rollback"}:{keys:d.keys}));
  SK.bus.on("role",d=>log("role",{to:d.role}));
  SK.bus.on("error",d=>log("error",{msg:String(d.msg||"").slice(0,120),where:d.where}));
}
SK.audit=Object.freeze({log,all,clear,csv,scopeKey,flush,KEY,LEGACY_KEY});
})();
