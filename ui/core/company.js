/* SQC — one company for the whole app (SK.company).
   The open company is the space the front door (or a switcher) opened: its data is what every screen shows. Before this
   service the app held three different «active companies» — the books' active company (skosif_companies_v1.active),
   the open space (window.SKosifSpace) and the business name in the pricing settings (the rail and print letterheads) —
   so the top bar could name one company while the rail named another and the data belonged to a third.
   Now the open space is the truth and the other two follow it:
   • the books always point at the open company (a books record is created for it when missing);
   • the business name in the settings (rail, letterheads) is the company's name, and renaming the business in
     «الإعدادات» renames the company everywhere;
   • switching from the top bar or «الشركات والفترات» switches the data, never only a label; the private company opens
     only from the front door, with its password. */
(()=>{
"use strict";
const {load,save}=SK;
const CO="skosif_companies_v1",PRIVATE="sqc_private_space",AFTER="sqc_company_after_open",DEMO={id:"demo-co",name:"شركة الوادي التجريبية للحوم",sector:"meat"};
const space=()=>window.SKosifSpace||null;
function books(){
  const d=load(CO,{})||{};
  return{companies:Array.isArray(d.companies)?d.companies.filter(c=>c&&c.id):[],periods:Array.isArray(d.periods)?d.periods.filter(p=>p&&p.id):[],
    active:d.active&&typeof d.active==="object"?{...d.active}:{},rest:d};
}
const privateId=()=>{try{return localStorage.getItem(PRIVATE)||""}catch{return ""}};
const clean=v=>String(v==null?"":v).replace(/\s+/g," ").trim().slice(0,80);
function current(){
  const s=space()&&space().current?space().current():null,d=books();
  const id=(s&&s.id)||d.active.companyId||"",rec=d.companies.find(c=>c.id===id)||null;
  const name=clean(rec&&rec.name)||clean(s&&s.name)||"شركتي";
  /* a period saved without a company (older data, imported books) belongs to the open company */
  const periods=d.periods.filter(p=>p.companyId===id||!p.companyId),period=periods.find(p=>p.id===d.active.periodId)||null;
  /* the sector (FOUNDATION §3.7) is the company's own; the demo company is a meat company; a company recorded before
     sectors existed is general trade */
  return Object.freeze({id,name,currency:(rec&&rec.currency)||"SAR",country:(rec&&rec.country)||"SA",sector:(rec&&rec.sector)||(id===DEMO.id?DEMO.sector:"trade"),packPending:!!(rec&&rec.packPending),locked:!!id&&privateId()===id,demo:id===DEMO.id,period,periods});
}
/* every company this device knows: the open one first; the private one only while it is the open one */
function list(){
  const cur=current(),out=[{id:cur.id,name:cur.name,currency:cur.currency,open:true,locked:cur.locked,demo:cur.demo}],seen=new Set([cur.id]),priv=privateId();
  if(priv&&!seen.has(priv)){seen.add(priv);out.push({id:priv,name:"الشركة الخاصة",locked:true,note:"تُفتح من الباب الأمامي بكلمة المرور"})}
  const d=books(),fromBooks=id=>d.companies.find(c=>c.id===id);
  ((space()&&space().list&&space().list())||[]).forEach(o=>{if(o&&o.id&&!seen.has(o.id)){seen.add(o.id);const b=fromBooks(o.id);out.push({id:o.id,name:clean(b&&b.name)||clean(o.name)||o.id,currency:b&&b.currency,demo:o.id===DEMO.id})}});
  d.companies.forEach(c=>{if(!seen.has(c.id)){seen.add(c.id);out.push({id:c.id,name:clean(c.name)||c.id,currency:c.currency,demo:c.id===DEMO.id})}});
  if(!seen.has(DEMO.id))out.push({id:DEMO.id,name:DEMO.name,demo:true});
  return out;
}
/* open a company: its data replaces the open one (the app reloads); the private company goes through the front door */
async function open(id){
  const cur=current();if(!id)return false;
  if(id===cur.id)return space()&&space().switchTo?space().switchTo(id,cur.name):false;
  if(id===privateId()){location.href="./";return false}
  const c=list().find(x=>x.id===id);if(!c)return false;
  return space()&&space().switchTo?space().switchTo(id,c.name,{demo:id===DEMO.id?undefined:false}):false;
}
/* a new company: registered for the books and opened empty (never filled with demo data) */
async function create(name,currency="SAR",sector="trade"){
  name=clean(name);if(!name)throw new Error("اسم الشركة مطلوب");
  const id=SK.ui&&SK.ui.uid?SK.ui.uid("co"):"co-"+Date.now().toString(36);
  sector=SK.caps&&SK.caps.sector&&SK.caps.sector(sector)?sector:"trade";
  const d=books();d.rest.companies=[...d.companies,{id,name,country:currency==="EGP"?"EG":"SA",currency,sector}];save(CO,d.rest);
  try{sessionStorage.setItem(AFTER,"masterdata")}catch{}
  return space()&&space().switchTo?space().switchTo(id,name,{fresh:true,demo:false,after:"masterdata"}):false;
}
function setOrgName(name){const c=window.SKosifCore;return!!(c&&c.setOrg&&c.setOrg("biz",name))}
/* rename the open company everywhere: the books, the spaces, the business name */
function rename(name){
  name=clean(name);if(!name)return false;const cur=current(),d=books();
  d.rest.companies=d.companies.map(c=>c.id===cur.id?{...c,name}:c);if(!d.rest.companies.some(c=>c.id===cur.id))d.rest.companies.push({id:cur.id,name,country:"SA",currency:"SAR"});
  save(CO,d.rest);
  if(space()&&space().rename)space().rename(cur.id,name);
  setOrgName(name);
  SK.bus&&SK.bus.emit("company",{companyId:cur.id,name});
  return true;
}
function setPeriod(periodId){
  const cur=current(),d=books();if(periodId&&!cur.periods.some(p=>p.id===periodId))return false;
  d.rest.active={companyId:cur.id};if(periodId)d.rest.active.periodId=periodId;save(CO,d.rest);
  SK.bus&&SK.bus.emit("company",d.rest.active);return true;
}
function updateMeta(patch={}){
  const cur=current(),d=books(),country=clean(patch.country||cur.country||"SA").toUpperCase().slice(0,3),currency=clean(patch.currency||cur.currency||"SAR").toUpperCase().slice(0,3);
  const want=clean(patch.sector||cur.sector||"trade"),sector=SK.caps&&SK.caps.sector&&SK.caps.sector(want)?want:cur.sector||"trade";
  let found=false;
  d.rest.companies=d.companies.map(c=>{if(c.id!==cur.id)return c;found=true;return{...c,country,currency,sector,...("packPending" in patch?{packPending:!!patch.packPending}:{})}});
  if(!found)d.rest.companies.push({id:cur.id,name:cur.name,country,currency,sector});
  if(save(CO,d.rest)!==true)return false;
  SK.bus&&SK.bus.emit("company",{companyId:cur.id,country,currency,sector});
  return true;
}
/* make the books and the business name follow the open company; returns what it changed */
/* the unnamed data of a brand-new device (space «space-main» before any company was chosen) is provisional: the demo
   company or the owner's first company names it; registering it in the books would hide the demo company's own record */
function provisional(){const cur=current();if(cur.id!=="space-main")return false;const d=books();return !d.companies.some(c=>c.id===cur.id)}
function reconcile(){
  const cur=current(),d=books(),changed=[];if(!cur.id||provisional())return changed;
  if(!d.companies.some(c=>c.id===cur.id)){d.rest.companies=[...d.companies,{id:cur.id,name:cur.name,country:cur.country,currency:cur.currency}];changed.push("books-record")}
  if(d.active.companyId!==cur.id){d.rest.active={companyId:cur.id};changed.push("books-active")}
  else if(d.active.periodId&&!d.periods.some(p=>p.id===d.active.periodId&&(p.companyId===cur.id||!p.companyId))){d.rest.active={companyId:cur.id};changed.push("books-period")}
  if(changed.length)save(CO,d.rest);
  if(setOrgName(cur.name))changed.push("business-name");
  return changed;
}
/* the rail shows the business name the core paints; keep it the company's even before the core's settings catch up */
function paintRail(){if(provisional())return;const el=document.getElementById("biz-name"),n=current().name;if(el&&el.textContent!==n)el.textContent=n}
let ready=false;
async function boot(){
  const s=space(),c=window.SKosifCore;
  if(!s||!c||!SK.bus){setTimeout(boot,250);return}
  if(s.intent)await s.intent();
  if(s.busy&&s.busy())return; /* a switch is reloading the page: the next load reconciles */
  reconcile();ready=true;if(!provisional())paintRail();
  SK.bus.on("render",()=>setTimeout(paintRail,0));
  /* the business renamed in «الإعدادات» renames the company */
  addEventListener("sk:org",e=>{const x=e.detail||{};if(x.f==="biz"&&clean(x.v)&&clean(x.v)!==current().name)rename(x.v)});
  SK.bus.emit("company",{companyId:current().id});
  try{const after=sessionStorage.getItem(AFTER);if(after){sessionStorage.removeItem(AFTER);setTimeout(()=>{const core=window.SKosifCore,cap=SK.caps&&SK.caps.get?SK.caps.get(after):null;if(core&&cap&&(!SK.perm||SK.perm.can(after)))core.go(after)},0)}}catch{}
}
boot();
SK.company=Object.freeze({current,list,open,create,rename,setPeriod,updateMeta,reconcile,provisional,ready:()=>ready,DEMO});
})();
