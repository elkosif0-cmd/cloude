/* KOSIF — company-scoped master data for the unified financial OS.
   These keys are included in ui/core/helper-space.js snapshots, therefore each open company owns
   its profile, definitions, installed helper tools and reporting-intake state. */
(()=>{
"use strict";
const {load,save}=SK;
const PROFILE="skosif_company_profile_v1",DEFS="skosif_company_definitions_v1",TOOLS="skosif_company_tools_v1",REPORTING="skosif_reporting_intake_v1";
const TYPES=Object.freeze({
  products:"المنتجات",services:"الخدمات",customers:"العملاء",suppliers:"الموردون",employees:"الموظفون",
  branches:"الفروع",warehouses:"المخازن",costCenters:"مراكز التكلفة",projects:"المشاريع",units:"وحدات القياس"
});
const clean=(v,n=120)=>String(v==null?"":v).replace(/\s+/g," ").trim().slice(0,n);
const num=v=>{const n=Number(v);return Number.isFinite(n)?n:0};
const cur=()=>SK.company&&SK.company.current?SK.company.current():{id:"",name:"شركتي",country:"SA",currency:"SAR"};
function profile(){
  const c=cur(),p=load(PROFILE,{})||{};
  return Object.freeze({
    companyId:c.id,name:c.name,activity:clean(p.activity),country:clean(p.country||c.country||"SA",3).toUpperCase(),
    currency:clean(p.currency||c.currency||"SAR",3).toUpperCase(),fiscalYearStart:clean(p.fiscalYearStart||"01-01",5),
    taxMode:p.taxMode==="income"?"income":"zakat",vatNo:clean(p.vatNo,40),crNo:clean(p.crNo,40),
    address:clean(p.address,240),notes:clean(p.notes,500)
  });
}
function setProfile(patch={}){
  const before=profile(),p={...before,...patch};
  const out={activity:clean(p.activity),country:clean(p.country||"SA",3).toUpperCase(),currency:clean(p.currency||"SAR",3).toUpperCase(),
    fiscalYearStart:/^\d{2}-\d{2}$/.test(String(p.fiscalYearStart||""))?String(p.fiscalYearStart):"01-01",
    taxMode:p.taxMode==="income"?"income":"zakat",vatNo:clean(p.vatNo,40),crNo:clean(p.crNo,40),address:clean(p.address,240),notes:clean(p.notes,500)};
  if(save(PROFILE,out)!==true)return false;
  if(SK.company&&SK.company.updateMeta)SK.company.updateMeta({country:out.country,currency:out.currency});
  SK.audit&&SK.audit.log("company",{act:"profile",companyId:cur().id,fields:Object.keys(patch)});
  SK.bus&&SK.bus.emit("company-profile",{companyId:cur().id});
  return true;
}
function definitions(){
  const raw=load(DEFS,{})||{},out={};
  for(const t of Object.keys(TYPES))out[t]=Array.isArray(raw[t])?raw[t].filter(x=>x&&x.id):[];
  return out;
}
function addDefinition(type,input={}){
  if(!TYPES[type])throw new Error("نوع تعريف غير معروف");
  const all=definitions(),name=clean(input.name);if(!name)throw new Error("الاسم مطلوب");
  const id=SK.ui&&SK.ui.uid?SK.ui.uid(type.slice(0,3)):type+"-"+Date.now().toString(36);
  const row={id,code:clean(input.code,40),name};
  if(type==="products"||type==="services")Object.assign(row,{salePrice:num(input.salePrice),purchasePrice:num(input.purchasePrice),cost:num(input.cost),wastePct:Math.max(0,Math.min(100,num(input.wastePct)))});
  all[type]=[...all[type],row];if(save(DEFS,all)!==true)return null;
  SK.audit&&SK.audit.log("company",{act:"definition-add",companyId:cur().id,type,id});
  return row;
}
function removeDefinition(type,id){
  if(!TYPES[type])return false;const all=definitions(),before=all[type].length;
  all[type]=all[type].filter(x=>x.id!==id);if(before===all[type].length)return false;
  if(save(DEFS,all)!==true)return false;SK.audit&&SK.audit.log("company",{act:"definition-remove",companyId:cur().id,type,id});return true;
}
function installedTools(){const d=load(TOOLS,{})||{};return Array.isArray(d.installed)?[...new Set(d.installed.map(String))]:[]}
function toolInstalled(id){return installedTools().includes(String(id))}
function setTool(id,on=true){
  id=clean(id,80);if(!id)return false;let installed=installedTools();
  installed=on?[...new Set([...installed,id])]:installed.filter(x=>x!==id);
  if(save(TOOLS,{installed,updatedAt:new Date().toISOString()})!==true)return false;
  SK.audit&&SK.audit.log("helpers",{act:on?"install-tool":"remove-tool",companyId:cur().id,capability:id});SK.bus&&SK.bus.emit("company-tools",{companyId:cur().id,id,on});return true;
}
function reporting(){
  const d=load(REPORTING,{})||{};
  return {sources:Array.isArray(d.sources)?d.sources:[],latest:d.latest||null,requirements:d.requirements||{},updatedAt:d.updatedAt||null};
}
function saveReporting(patch={}){
  const d=reporting(),next={...d,...patch,updatedAt:new Date().toISOString()};
  if(save(REPORTING,next)!==true)return false;SK.audit&&SK.audit.log("reports",{act:"intake",companyId:cur().id,sources:(next.sources||[]).length});return true;
}
window.SKCompanyData=Object.freeze({PROFILE,DEFS,TOOLS,REPORTING,TYPES,profile,setProfile,definitions,addDefinition,removeDefinition,installedTools,toolInstalled,setTool,reporting,saveReporting});
SK.companyData=window.SKCompanyData;
})();
