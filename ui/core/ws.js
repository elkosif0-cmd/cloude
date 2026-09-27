/* SQC core — a workspace per company for the accountant's helper tools (SK.ws).
   The helper tools work on one company at a time: its items and costs, customers and orders, stock,
   suppliers, books and notes. Switching company parks the current company's data (every helper key in
   localStorage and every store of the aghnam-app-v7 database) in its own snapshot, loads the other
   company's snapshot (or an empty company), and reloads so every screen reads it.
   What stays shared across companies: the audit (engagement files and their documents), the command
   centre (tasks, notifications, risks), Jev, the appearance and navigation preferences, the company
   register itself, the audit trail, and what never leaves the device (the AI key, the chat).
   The companies are the same register the ledger and the top bar use (skosif_companies_v1). */
(()=>{
"use strict";
const {load,save}=SK;
const CO="skosif_companies_v1",WSDB="skosif-workspaces",APPDB="aghnam-app-v7";
const SHARED=new Set(["skosif_prefs","skosif_nav_v1","skosif_profile_v1",CO,"skosif_audit_trail","skosif_ai_keys","skosif_chat_v1","skosif_error_log",
  "aghnam-v12-theme","skosif_tbreview_v1","skosif_engagements_v1","skosif_notify_v1","skosif_tasks_v1","skosif_risks_v1","skosif_council_v1","skosif_ws_meta_v1"]);
const SHARED_PREFIX=["skosif_eng_","skosif_codex","skosif_std","skosif_bench","skosif_jev","skosif_device","skosif_perm","skosif_user","skosif_role","aghnamJev"];
const APP=/^(aghnam|skosif|kosif|s_kosif|sales_customer_followup)/;
/* a key that belongs to the company on screen (and moves with it) */
const isWsKey=k=>APP.test(k)&&!SHARED.has(k)&&!SHARED_PREFIX.some(p=>k.startsWith(p));

const reqP=q=>new Promise((res,rej)=>{q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)});
function openDb(name,upgrade){
  return new Promise(res=>{
    if(!("indexedDB" in window))return res(null);
    let r;try{r=upgrade?indexedDB.open(name,1):indexedDB.open(name)}catch{return res(null)}
    r.onupgradeneeded=()=>{if(upgrade)upgrade(r.result)};r.onsuccess=()=>res(r.result);r.onerror=()=>res(null);
  });
}
const wsDb=()=>openDb(WSDB,db=>{if(!db.objectStoreNames.contains("snap"))db.createObjectStore("snap")});
async function readApp(){const db=await openDb(APPDB);if(!db)return{};const out={};for(const n of [...db.objectStoreNames])out[n]=await reqP(db.transaction(n).objectStore(n).getAll());db.close();return out}
async function writeApp(stores,clearAll){
  const db=await openDb(APPDB);if(!db)return;
  for(const n of [...db.objectStoreNames]){
    if(!clearAll&&!(n in (stores||{})))continue;
    await new Promise((res,rej)=>{const tx=db.transaction(n,"readwrite"),st=tx.objectStore(n);st.clear();((stores||{})[n]||[]).forEach(r=>{try{st.put(r)}catch{}});tx.oncomplete=res;tx.onerror=()=>rej(tx.error);tx.onabort=()=>rej(tx.error)});
  }
  db.close();
}
async function getSnap(id){const db=await wsDb();if(!db)return null;const v=await reqP(db.transaction("snap").objectStore("snap").get(id));db.close();return v||null}
async function putSnap(id,v){const db=await wsDb();if(!db)throw new Error("قاعدة البيانات المحلية غير متاحة لحفظ بيانات الشركة");await new Promise((res,rej)=>{const tx=db.transaction("snap","readwrite");tx.objectStore("snap").put(v,id);tx.oncomplete=res;tx.onerror=()=>rej(tx.error)});db.close()}
/* every parked company, for the full backup and the device transfer (SK.store) */
async function allSnaps(){const db=await wsDb();if(!db)return{};const st=db.transaction("snap").objectStore("snap");const [ks,vs]=await Promise.all([reqP(st.getAllKeys()),reqP(st.getAll())]);db.close();return Object.fromEntries(ks.map((k,i)=>[k,vs[i]]))}
async function putSnaps(o){for(const [id,v] of Object.entries(o||{}))if(v&&typeof v==="object")await putSnap(id,v)}
async function delSnap(id){const db=await wsDb();if(!db)return;await new Promise(res=>{const tx=db.transaction("snap","readwrite");tx.objectStore("snap").delete(id);tx.oncomplete=res;tx.onerror=res});db.close()}

const reg=()=>{const d=load(CO,{})||{};return{companies:d.companies||[],periods:d.periods||[],active:d.active||{}}};
const activeId=()=>{const d=reg();return d.active.companyId||(d.companies[0]||{}).id||""};
const wsKeys=()=>{const o=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&isWsKey(k))o.push(k)}return o};
/* what a company holds, in the figures the helper centre shows beside it: products and costs (the pricing
   record), suppliers (the supplier deliveries, the purchase orders and the master list), customers and
   orders (the base app's database), and the journal entries */
function countsOf(get,idb){
  const j=k=>{try{return JSON.parse(get(k)||"null")}catch{return null}};
  const p=j("aghnam-pricing-v3")||{},led=j("skosif_ledger_v1")||{},pur=j("skosif_purchasing_v1")||{},ml=j("aghnam-v15-master-lists")||{};
  const sup=new Set();(j("skosif_v31_supplier_batches")||[]).forEach(b=>b&&b.supplier&&sup.add(b.supplier));
  (pur.orders||[]).forEach(o=>o&&o.supplier&&sup.add(o.supplier));(ml.suppliers||[]).forEach(x=>x&&sup.add(typeof x==="string"?x:x.name||x.id));
  (p.raws||[]).forEach(r=>r&&r.supplier&&sup.add(r.supplier));
  return{items:(p.raws||[]).length,boxes:(p.boxes||[]).length,suppliers:sup.size,entries:(led.entries||led.journal||[]).length,
    customers:idb.customers||0,orders:idb.orders||0};
}
async function idbCounts(){
  const db=await openDb(APPDB);if(!db)return{};const o={};
  for(const n of ["customers","orders"])if(db.objectStoreNames.contains(n))o[n]=await reqP(db.transaction(n).objectStore(n).count());
  db.close();return o;
}
/* the company on screen */
async function summary(){return{...countsOf(k=>localStorage.getItem(k),await idbCounts()),keys:wsKeys().length}}
async function park(id){
  const local={};wsKeys().forEach(k=>{local[k]=localStorage.getItem(k)});
  const idb=await readApp();
  await putSnap(id,{local,idb,savedAt:new Date().toISOString(),summary:countsOf(k=>local[k],{customers:(idb.customers||[]).length,orders:(idb.orders||[]).length})});
}
/* an empty company: the pricing record keeps its shape (so the base app does not fall back to the sample catalogue) */
function blankPricing(name){
  const cur=load("aghnam-pricing-v3",null);if(!cur)return null;
  const s=JSON.parse(JSON.stringify(cur));
  Object.assign(s,{raws:[],boxes:[],exps:[],memo:null,memos:[],log:[],snaps:[],salesAliases:[]});
  s.settings={...(s.settings||{}),biz:name||(s.settings||{}).biz||""};
  return s;
}
/* the data already on the device belongs to a company: the first time, the register gets one (named after
   the business in the settings) so switching away parks that data instead of dropping it */
function ensure(){
  const r=load(CO,{})||{};r.companies=r.companies||[];r.periods=r.periods||[];r.active=r.active||{};
  let changed=false;
  if(!r.companies.length){
    const name=String((SK.org&&SK.org().biz)||"").trim()||"شركتي",y=new Date().getFullYear();
    r.companies.push({id:"co-main",name,country:"SA",currency:"SAR",createdAt:new Date().toISOString()});
    r.periods.push({id:"p-co-main",companyId:"co-main",label:"السنة المالية "+y,startDate:y+"-01-01",endDate:y+"-12-31",status:"open"});
    changed=true;
  }
  if(!r.companies.some(c=>c.id===r.active.companyId)){r.active={companyId:r.companies[0].id,periodId:(r.periods.find(p=>p.companyId===r.companies[0].id)||{}).id||null};changed=true}
  if(changed)save(CO,r);
  return r.companies.find(c=>c.id===r.active.companyId);
}
/* the helper tools ask «which company?» once per session */
const CHOSEN="skosif_ws_chosen";
function chosen(){try{return sessionStorage.getItem(CHOSEN)===activeId()}catch{return true}}
function markChosen(id){try{sessionStorage.setItem(CHOSEN,id||activeId())}catch{}}
async function switchTo(id,opts={}){
  const d=reg(),to=d.companies.find(c=>c.id===id);if(!to)throw new Error("الشركة غير موجودة");
  ensure();
  const from=activeId();
  if(from===id&&!opts.force){markChosen(id);return false}
  const blank=blankPricing(to.name);
  if(from)await park(from);
  const snap=await getSnap(id);
  wsKeys().forEach(k=>localStorage.removeItem(k));
  if(snap){Object.entries(snap.local||{}).forEach(([k,v])=>{try{localStorage.setItem(k,v)}catch{throw new Error("مساحة التخزين لا تكفي لبيانات الشركة")}});await writeApp(snap.idb||{},true)}
  else{await writeApp({},true);if(blank)save("aghnam-pricing-v3",blank)}
  const r=load(CO,{})||{};r.active={...(r.active||{}),companyId:id,periodId:((r.periods||[]).find(p=>p.companyId===id)||{}).id||null};save(CO,r);
  const meta=load("skosif_ws_meta_v1",{})||{};meta.switchedAt=new Date().toISOString();meta.last=id;save("skosif_ws_meta_v1",meta);
  SK.audit&&SK.audit.log("companies",{act:"switch-workspace",from,to:id});
  markChosen(id);
  if(opts.reload!==false)location.reload();
  return true;
}
/* a new company in the register, then open it (empty, or with the demo data) */
async function create(o){
  const name=String(o.name||"").trim();if(!name)throw new Error("اسم الشركة مطلوب");
  const r=load(CO,{})||{};r.companies=r.companies||[];r.periods=r.periods||[];
  const id="co-"+Date.now().toString(36);const y=new Date().getFullYear();
  r.companies.push({id,name,country:o.country||"SA",currency:o.currency||"SAR",activity:o.activity||"",city:o.city||"",vatNo:o.vatNo||"",createdAt:new Date().toISOString()});
  r.periods.push({id:"p-"+id,companyId:id,label:"السنة المالية "+y,startDate:y+"-01-01",endDate:y+"-12-31",status:"open"});
  save(CO,r);
  if(o.demo){const meta=load("skosif_ws_meta_v1",{})||{};meta.seedDemo=id;save("skosif_ws_meta_v1",meta)}
  await switchTo(id,{force:true});
  return id;
}
async function info(id){const s=await getSnap(id);return s?{savedAt:s.savedAt,summary:s.summary||null}:null}
async function remove(id){if(id===activeId())throw new Error("لا يمكن حذف الشركة المفتوحة — افتح شركة أخرى أولاً");await delSnap(id);const r=load(CO,{})||{};r.companies=(r.companies||[]).filter(c=>c.id!==id);r.periods=(r.periods||[]).filter(p=>p.companyId!==id);save(CO,r)}
/* after a switch into a new company created «with demo data», load the demo once */
addEventListener("load",()=>setTimeout(()=>{
  const meta=load("skosif_ws_meta_v1",{})||{};
  if(!meta.seedDemo||meta.seedDemo!==activeId()||!SK.demo||!SK.demo.fill)return;
  delete meta.seedDemo;save("skosif_ws_meta_v1",meta);
  Promise.resolve(SK.demo.fill(undefined,{quiet:true})).then(()=>{SK.toast&&SK.toast("تم تحميل البيانات التجريبية للشركة الجديدة","ok")}).catch(()=>{});
},2500));

SK.ws=Object.freeze({isWsKey,activeId,ensure,chosen,markChosen,list:()=>reg().companies,active:()=>reg().companies.find(c=>c.id===activeId())||null,summary,switchTo,create,info,remove,park,allSnaps,putSnaps});
})();
