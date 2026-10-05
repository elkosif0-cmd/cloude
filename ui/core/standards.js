/* KOSIF — cross-cutting standards service.
   Reads the deterministic codex already bundled in SKEngines, resolves the active company's reporting framework,
   and records trace references. It never approves an accounting treatment or audit conclusion automatically. */
(()=>{
"use strict";
const clean=(v,n=300)=>String(v==null?"":v).replace(/\s+/g," ").trim().slice(0,n);
const codex=()=>window.SKEngines&&SKEngines.audit&&SKEngines.audit.codex;
const company=()=>window.SKosifCompanyPlatform;
const framework=()=>company()?.profile?.().framework||((SK.company?.current?.().country==="EG")?"EAS":"IFRS");
function normalizeRecord(x){
  if(!x)return null;
  return {
    code:clean(x.code,40),family:clean(x.family,20),titleAr:clean(x.titleAr,180),titleEn:clean(x.titleEn,180),
    purpose:clean(x.purpose,800),requirements:Array.isArray(x.requirements)?x.requirements.map(v=>clean(v,400)):[],
    disclosures:Array.isArray(x.disclosures)?x.disclosures.map(v=>clean(v,400)):[],audit:Array.isArray(x.audit)?x.audit.map(v=>clean(v,400)):[],
    effective:clean(x.effective,180),latest:clean(x.latest,300),status:clean(x.status,30),org:clean(x.org,100),url:clean(x.url,500),
    sme:clean(x.sme,100),replacedBy:clean(x.replacedBy,80)
  };
}
function search(query,{limit=8,family=null}={}){
  const C=codex();if(!C||typeof C.searchCodex!=="function")return{framework:framework(),registryDate:C?.REGISTRY_DATE||"",results:[]};
  let list=C.searchCodex(String(query||""))||[];
  if(family)list=list.filter(x=>x.family===family);
  const fw=framework();
  const results=list.slice(0,Math.max(1,Math.min(30,Number(limit)||8))).map(x=>{
    const n=normalizeRecord(x);
    if(fw==="EAS"&&typeof C.inFramework==="function")n.frameworkCode=C.inFramework(n.code,"EAS");
    else n.frameworkCode=n.code;
    return n;
  });
  return{framework:fw,registryDate:C.REGISTRY_DATE||"",results};
}
function trace(operation,record,result,approved=false){
  const CP=company();if(!CP||!CP.addStandardTrace||!record)return null;
  return CP.addStandardTrace({operation,standard:record.frameworkCode||record.code,source:[record.org,record.url].filter(Boolean).join(" · "),result,provider:"deterministic-codex",approved});
}
function explain(query){
  const s=search(query,{limit:5});
  if(!s.results.length)return{...s,text:"لم أجد مرجعًا مطابقًا في المدونة الحالية. افتح «المعايير والمدونة» للتحقق أو حدّث سجل المعايير من المصادر الرسمية."};
  const text="إطار الشركة: "+s.framework+" · سجل المدونة: "+(s.registryDate||"—")+"\n"+s.results.map(r=>
    "• "+(r.frameworkCode||r.code)+" — "+r.titleAr+" ["+r.status+"]\n  "+r.purpose+
    (r.effective?"\n  السريان: "+r.effective:"")+
    (r.latest?"\n  آخر ملاحظة: "+r.latest:"")+
    (r.org?"\n  المصدر: "+r.org:"")+
    (r.url?" — "+r.url:"")
  ).join("\n");
  return{...s,text};
}
window.SKosifStandards=Object.freeze({framework,search,explain,trace});
SK.standards=window.SKosifStandards;
})();
