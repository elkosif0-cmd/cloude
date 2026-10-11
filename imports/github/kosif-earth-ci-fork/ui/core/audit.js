/* S.kosif core — audit trail (SK.audit).
   Who did what, when, on which screen: navigation, actions, saved data keys, backups,
   restores, role changes and errors. Bounded and local; values are never copied into the
   trail (only key names and counts), so it holds no business data. */
(()=>{
"use strict";
const KEY="skosif_audit_trail",MAX=500;
let buf=null,timer=0;
const role=()=>SK.perm?SK.perm.role():"admin";
function all(){if(!buf)buf=SK.load(KEY,[]);return buf}
function flush(){timer=0;try{localStorage.setItem(KEY,JSON.stringify(all().slice(0,MAX)))}catch{}}
function log(type,detail){
  const e={at:new Date().toISOString(),type,role:role(),view:window.SKosifCore?SKosifCore.view():"",...detail};
  const l=all();
  /* collapse repeated saves of the same key within a minute */
  if(type==="data"&&l[0]&&l[0].type==="data"&&l[0].key===e.key&&Date.parse(e.at)-Date.parse(l[0].at)<60000){l[0].at=e.at;l[0].n=(l[0].n||1)+1}
  else l.unshift(e);
  if(l.length>MAX)l.length=MAX;
  if(!timer)timer=setTimeout(flush,800);
}
function clear(){buf=[];flush()}
function csv(){SK.csv.download("SQC-audit-trail",["الوقت","الحدث","الدور","الشاشة","التفاصيل"],all().map(e=>[e.at,e.type,e.role,e.view,e.act||e.to||e.key||e.msg||(e.keys!=null?e.keys+" مفتاح":"")]))}
addEventListener("pagehide",flush);
if(SK.bus){
  SK.bus.on("nav",d=>log("nav",{to:d.to}));
  SK.bus.on("action",d=>{if(d.act!=="nav"&&d.act!=="mode"&&!/^rail-/.test(d.act))log("action",{act:d.act})});
  SK.bus.on("data",d=>log("data",{key:d.key}));
  SK.bus.on("backup",d=>log("backup",{keys:d.keys}));
  SK.bus.on("restore",d=>log("restore",d.rollback?{msg:"rollback"}:{keys:d.keys}));
  SK.bus.on("role",d=>log("role",{to:d.role}));
  SK.bus.on("error",d=>log("error",{msg:d.msg.slice(0,120),where:d.where}));
}
SK.audit=Object.freeze({log,all,clear,csv,KEY});
})();
