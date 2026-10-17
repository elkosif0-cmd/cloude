/* KOSIF — cross-cutting standards service.
   Reads the deterministic codex already bundled in SKEngines, resolves the active company's reporting framework,
   and records trace references. It never approves an accounting treatment or audit conclusion automatically. */
(()=>{
"use strict";
const clean=(v,n=300)=>String(v==null?"":v).replace(/\s+/g," ").trim().slice(0,n);
const codex=()=>window.SKEngines&&SKEngines.audit&&SKEngines.audit.codex;
const company=()=>window.SKosifCompanyPlatform;
const framework=()=>company()?.profile?.().framework||((SK.company?.current?.().country==="EG")?"EAS":"IFRS");
const country=()=>clean(company()?.profile?.().country||SK.company?.current?.().country||"",3).toUpperCase();
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
function canonicalRecord(C,x,fw,jurisdiction){
  const original=C.STANDARD?.[x?.code];if(!original)return null;
  const legal=original.family==="SAUDI"||original.family==="EGYPT";
  if(legal){
    if(jurisdiction==="SA")return original.family==="SAUDI"?original:null;
    if(jurisdiction!=="EG")return null;
    const code=original.family==="EGYPT"?original.code:C.inFramework?.(original.code,"EAS"),mapped=C.STANDARD?.[code];
    return mapped?.family==="EGYPT"?mapped:null;
  }
  if(original.family==="ISA")return original;
  if(fw==="SME")return original.code==="IFRS for SMEs"?original:null;
  if(fw==="EAS"){
    const code=original.family==="EAS"?original.code:C.inFramework?.(original.code,"EAS"),mapped=C.STANDARD?.[code];
    return mapped?.family==="EAS"?mapped:null;
  }
  if(fw!=="IFRS")return null;
  const mapped=original.family==="EAS"?C.STANDARD?.[original.ifrs]:original;
  return mapped&&["IFRS","IAS"].includes(mapped.family)&&mapped.code!=="IFRS for SMEs"?mapped:null;
}
function search(query,{limit=8,family=null}={}){
  const C=codex(),fw=framework(),jurisdiction=country(),results=[],unavailable=[];
  if(!C||typeof C.searchCodex!=="function")return{framework:fw,country:jurisdiction,registryDate:C?.REGISTRY_DATE||"",results,unavailable};
  const seen=new Set(),max=Math.max(1,Math.min(30,Number(limit)||8));
  for(const x of C.searchCodex(String(query||""))||[]){
    const record=canonicalRecord(C,x,fw,jurisdiction);
    if(!record){unavailable.push({requestedCode:clean(x.code,40),available:false,reason:"لا يتوفر مرجع مطابق موثق لإطار الشركة ودولتها في المدونة الحالية."});continue;}
    if(family&&record.family!==family||seen.has(record.code))continue;
    seen.add(record.code);results.push({...normalizeRecord(record),frameworkCode:record.code,requestedCode:clean(x.code,40),available:true});
    if(results.length>=max)break;
  }
  return{framework:fw,country:jurisdiction,registryDate:C.REGISTRY_DATE||"",results,unavailable};
}
function trace(operation,record,result,approved=false){
  const CP=company(),C=codex();if(!CP||!CP.addStandardTrace||!record||record.available===false||!C)return null;
  const canonical=canonicalRecord(C,record,framework(),country());
  if(!canonical||canonical.code!==record.code)return null;
  return CP.addStandardTrace({operation,standard:canonical.code,source:[canonical.org,canonical.url].filter(Boolean).join(" · "),result,provider:"deterministic-codex",approved});
}
function explain(query){
  const s=search(query,{limit:5});
  if(!s.results.length)return{...s,text:"غير متاح: لم أجد مرجعًا مطابقًا لإطار الشركة ودولتها في المدونة الحالية. افتح «المعايير والمدونة» للتحقق من المصادر الرسمية."};
  const text="إطار الشركة: "+s.framework+" · سجل المدونة: "+(s.registryDate||"—")+"\n"+s.results.map(r=>
    "• "+(r.frameworkCode||r.code)+" — "+r.titleAr+" ["+r.status+"]\n  "+r.purpose+
    (r.effective?"\n  السريان: "+r.effective:"")+
    (r.latest?"\n  آخر ملاحظة: "+r.latest:"")+
    (r.org?"\n  المصدر: "+r.org:"")+
    (r.url?" — "+r.url:"")
  ).join("\n");
  return{...s,text:text+(s.unavailable.length?"\nمراجع غير متاحة لهذا الإطار أو الدولة: "+s.unavailable.map(r=>r.requestedCode).join("، "):"")};
}
window.SKosifStandards=Object.freeze({framework,search,explain,trace});
SK.standards=window.SKosifStandards;
})();
