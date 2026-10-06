/* SQC — مساحات الأدوات المساعدة: كل شركة لها بياناتها (window.SKosifSpace).
   استوديوهات الشركة (المنتج، المبيعات، المخزون، الدفاتر، التقارير) تعمل كتطبيق مستقل داخل SQC: عند الدخول إليها تختار الشركة التي تعمل عليها (أو شركة جديدة)،
   فلا يظهر إلا ما يخصها — الأصناف والأسعار والبوكسات، المخزون، الموردون والمشتريات، العملاء والمبيعات والطلبات، الدفاتر،
   الملاحظات والمتابعة، شجرة المنتجات، محاكي القيود.
   الآلية: بيانات الأدوات مخزنة في مفاتيح localStorage معروفة (HELPER_KEY أدناه) وفي قاعدة IndexedDB «aghnam-app-v7».
   عند التبديل تُحفظ لقطة كاملة من بيانات الشركة الحالية في قاعدة «sqc-spaces»، وتُستعاد لقطة الشركة المختارة (أو تُفرّغ
   لشركة جديدة)، ثم تُعاد تهيئة التطبيق. ما لا يخص شركة بعينها يبقى مشتركاً: الإعدادات والمظهر، ملف المراجعة (له اختياره
   الخاص)، المهام والإشعارات والمخاطر، Jev ومجلس القرار، مفاتيح الذكاء الاصطناعي، سجل التدقيق. */
(()=>{
"use strict";
const {esc,load,save,toast}=SK;
const REG="sqc_helper_space_v1",ASKED="sqc_space_chosen",USERS="sqc_helper_users_v1",USER_ASKED="sqc_helper_user_chosen",DB="sqc-spaces",APPDB="aghnam-app-v7";
/* the front door (index.html): its one-time choice, the last company opened, and the space that holds the private
   company's data (it opens only through the front door's password, never as an open card) */
const INTENT="sqc_company_intent",LAST="sqc_last_company",PRIVATE="sqc_private_space",AFTER="sqc_company_after_open";
/* the entry chosen at the door (FOUNDATION §3: accounting · audit · tools) and a bundle company chosen at the audit door —
   read by ui/core/gate.js */
const GATE="sqc_gate",GATE_CORPUS="sqc_gate_corpus",GATE_AUDIT_NEW="sqc_gate_audit_new",GATE_PIN="sqc_gate_pin";
const gateOf=g=>{g=String(g||"");return SK.caps&&SK.caps.gateway&&SK.caps.gateway(g)?g:""};
const sessionGate=()=>{try{return sessionStorage.getItem(GATE)||""}catch{return ""}};
/* the helper tools' own data — per company */
const HELPER_KEY=k=>/^aghnam(?!-v12-theme|-pricing-auth|-pricing-pass|-pricing-ui|-typesafe|-v17-runtime|-v19-(leader|tabs|write)|-v21-)/.test(k)&&!/^aghnam_v29_jev_log$/.test(k)
  ||/^skosif_(v3\d|v38)_/.test(k)||/^skosif_(ledger_v1|advances_v1|erp_[a-z_]+|purchasing_v1|followup_v1|inv_[a-z_]+|rep_pl|report_pack_v1|ar_paste|commerce_warm_v1|cost_rules_v1|income_statements_v1|product_flow_v1|ops_[a-z_]+|company_profile_v1|company_definitions_v1|company_tools_v1|reporting_intake_v1)$/.test(k)
  ||/^sqc_(ptree|geo|jesim|salesup)_/.test(k)||k==="skosif_demo_v1"
  ||k==="skosif_company_platform_v1"||/^sales_customer_followup/.test(k); /* the original CRM V8.2 (الأنظمة الأصلية) */
const reg=()=>{const r=load(REG,{})||{};return{active:r.active||null,spaces:r.spaces||{}}};
const setReg=r=>{const ok=save(REG,r);if(ok!==true)scopeTainted=true;return ok};
const profileName=()=>{const p=load("skosif_profile_v1",{})||{};return String(p.name||"").trim()||"المحاسب الرئيسي"};
function userReg(){
  let u=load(USERS,null);
  if(!u||!u.users||!Object.keys(u.users).length){
    const legacy=reg(),id="user-main";
    u={active:id,users:{[id]:{id,name:profileName(),createdAt:new Date().toISOString(),pinSalt:null,pinHash:null,lastSpace:legacy.active||null,spaces:legacy.spaces||{}}}};
    save(USERS,u);
  }
  if(!u.active||!u.users[u.active])u.active=Object.keys(u.users)[0];
  return u;
}
const setUserReg=u=>{const ok=save(USERS,u);if(ok!==true)scopeTainted=true;return ok};
const user=()=>{const u=userReg();return u.users[u.active]};
const users=()=>Object.values(userReg().users);
const enc=v=>new TextEncoder().encode(String(v||""));
const b64=v=>btoa(String.fromCharCode(...new Uint8Array(v)));
async function pinHash(pin,salt){
  if(!pin)return "";
  if(!(crypto&&crypto.subtle))throw new Error("هذا المتصفح لا يدعم القفل المحلي الآمن");
  const key=await crypto.subtle.importKey("raw",enc(pin),"PBKDF2",false,["deriveBits"]);
  const bits=await crypto.subtle.deriveBits({name:"PBKDF2",salt:Uint8Array.from(atob(salt),c=>c.charCodeAt(0)),iterations:120000,hash:"SHA-256"},key,256);
  return b64(bits);
}
const salt=()=>{const b=new Uint8Array(16);crypto.getRandomValues(b);return b64(b)};
async function verifyUser(u,pin){return !u.pinHash||await pinHash(pin||"",u.pinSalt)===u.pinHash}
const snapId=(spaceId,userId=user().id)=>userId+"::"+spaceId;
const bizName=()=>{try{const s=JSON.parse(localStorage.getItem("aghnam-pricing-v3")||"{}");return(s.settings&&s.settings.biz)||""}catch{return""}};
const companies=()=>{const d=load("skosif_companies_v1",{})||{};return d.companies||[]};
/* the space the app is on now: the registered one, else the data already on the device (named after the business) */
function current(){const u=user();if(u.lastSpace&&u.spaces&&u.spaces[u.lastSpace])return{id:u.lastSpace,...u.spaces[u.lastSpace]};
  /* before any switch: the data on the device belongs to the active company of the books (the demo company, or the user's own) */
  const cd=load("skosif_companies_v1",{})||{},a=(cd.active||{}).companyId,c=(cd.companies||[]).find(x=>x.id===a);
  return c?{id:c.id,name:c.name,at:null}:{id:"space-main",name:bizName()||"الشركة الحالية",at:null}}

/* ---------- IndexedDB: the spaces' snapshots, and the helper tools' own database ---------- */
const openDb=(name,ver,up)=>new Promise((res,rej)=>{const q=ver?indexedDB.open(name,ver):indexedDB.open(name);if(up)q.onupgradeneeded=()=>up(q.result);q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)});
const spacesDb=()=>openDb(DB,1,db=>{if(!db.objectStoreNames.contains("spaces"))db.createObjectStore("spaces")});
const tx=(db,store,mode,fn)=>new Promise((res,rej)=>{const t=db.transaction(store,mode),s=t.objectStore(store),out=fn(s);t.oncomplete=()=>res(out&&out.result!==undefined?out.result:out);t.onerror=()=>rej(t.error)});
async function appDbExists(){try{if(!indexedDB.databases)return true;return(await indexedDB.databases()).some(d=>d.name===APPDB)}catch{return true}}
async function dumpApp(){
  if(!await appDbExists())return null;
  const db=await openDb(APPDB),out={};
  for(const name of [...db.objectStoreNames]){
    out[name]=await new Promise((res,rej)=>{const t=db.transaction(name,"readonly"),s=t.objectStore(name),keys=[],vals=[];
      const c=s.openCursor();c.onsuccess=()=>{const cur=c.result;if(cur){keys.push(cur.primaryKey);vals.push(cur.value);cur.continue()}else res({inline:s.keyPath!=null,keys,vals})};c.onerror=()=>rej(c.error);t.onerror=()=>rej(t.error)});
  }
  db.close();return out;
}
async function restoreApp(dump){
  if(!await appDbExists())return;
  const db=await openDb(APPDB);
  for(const name of [...db.objectStoreNames]){
    await new Promise((res,rej)=>{const t=db.transaction(name,"readwrite"),s=t.objectStore(name);s.clear();
      const d=dump&&dump[name];if(d)d.vals.forEach((v,i)=>{s.keyPath!=null?s.put(v):s.put(v,d.keys[i])});t.oncomplete=res;t.onerror=()=>rej(t.error)});
  }
  db.close();
}
async function snapshot(){
  const ls={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(HELPER_KEY(k))ls[k]=localStorage.getItem(k)}
  return{ls,app:await dumpApp(),at:new Date().toISOString()};
}
async function putSnap(id,snap,userId=user().id){const db=await spacesDb();await tx(db,"spaces","readwrite",s=>s.put(snap,snapId(id,userId)));db.close()}
async function getSnap(id,userId=user().id){const db=await spacesDb();let r=await tx(db,"spaces","readonly",s=>s.get(snapId(id,userId)));if(!r&&userId==="user-main")r=await tx(db,"spaces","readonly",s=>s.get(id));db.close();return r||null}
function clearHelperKeys(){const ks=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(HELPER_KEY(k))ks.push(k)}ks.forEach(k=>localStorage.removeItem(k))}

/* ---------- switching ---------- */
let busy=false,scopeEpoch=0,scopeTainted=false,scopeTransitions=0,chatLocked=false,chatForeign=false;
/* A lifecycle generation, not an authentication credential. Other open tabs must reload before
   using their cached company data after a switch/lock anywhere on this device. */
const CHAT_GENERATION="sqc_chat_scope_generation_v1";
let chatGeneration=load(CHAT_GENERATION,null);
const scopeNotify=()=>{SK.bus&&SK.bus.emit&&SK.bus.emit("scope",{})};
/* Redundant same-origin notification when a persisted generation cannot be written. No chat,
   company identity, credentials, or source data is transmitted. Delivery is asynchronous. */
let chatChannel=null;
try{if(typeof BroadcastChannel!=="undefined"){chatChannel=new BroadcastChannel("sqc-chat-lifecycle-v1");chatChannel.onmessage=e=>{if(e.data==="invalidate"){chatForeign=true;scopeNotify()}}}}catch{/* persisted generation remains the primary boundary */}
function advanceChatGeneration(){
  const next=JSON.stringify([Date.now(),Math.random(),scopeEpoch]);
  if(save(CHAT_GENERATION,next)!==true)scopeTainted=true;
  else chatGeneration=next;
  try{if(chatChannel)chatChannel.postMessage("invalidate")}catch{/* no reliable cross-tab signal if both transports fail */}
}
const scopeBegin=()=>{if(scopeTransitions)scopeTainted=true;scopeTransitions++;scopeEpoch++;advanceChatGeneration();scopeNotify()};
const scopeEnd=()=>{scopeTransitions--;scopeEpoch++;scopeNotify()};
/* Local-user/company routing only. This is not backend tenant authentication. Unlike report
   scope, chat does not require an accounting period. Reads never initialize or adopt ownership. */
function chatScopeSnapshot(){
  const obj=v=>v&&typeof v==="object"&&!Array.isArray(v),id=v=>typeof v==="string"&&v.trim()?v:null;
  const own=(v,k)=>obj(v)&&k!==null&&Object.prototype.hasOwnProperty.call(v,k);
  let userId=null,companyId=null,valid=false,persisted=null;
  try{
    const ur=load(USERS,null),r=load(REG,null),cd=load("skosif_companies_v1",null);
    persisted=load(CHAT_GENERATION,null);userId=id(ur&&ur.active);
    const u=own(ur&&ur.users,userId)?ur.users[userId]:null;
    companyId=id(cd&&cd.active&&cd.active.companyId);
    valid=!!(obj(u)&&u.id===userId&&id(u.lastSpace)===companyId&&own(u.spaces,companyId)&&obj(u.spaces[companyId])&&obj(r)&&r.active===companyId&&own(r.spaces,companyId)&&obj(r.spaces[companyId])&&Array.isArray(cd.companies)&&cd.companies.filter(c=>obj(c)&&c.id===companyId).length===1);
  }catch{/* fail closed */}
  const status=chatLocked?"locked":chatForeign||persisted!==chatGeneration?"stale":busy||scopeTransitions?"busy":scopeTainted?"tainted":valid?"stable":"unknown";
  return Object.freeze({status,userId,companyId,token:JSON.stringify([scopeEpoch,status,userId,companyId,persisted])});
}
SK.bus&&SK.bus.on("lock",()=>{chatLocked=true;scopeEpoch++;advanceChatGeneration();scopeNotify()});
/* Read-only report context, not ownership or user attestation. Never initialize user registries here.
   Taint is conservative for this runtime: a failed/partially acknowledged switch cannot be cleared
   by selecting a label or by the same-ID fast path. No new persisted binding is introduced. */
function scopeSnapshot(){
  const obj=v=>v&&typeof v==="object"&&!Array.isArray(v),id=v=>typeof v==="string"&&v.trim()?v:null;
  const own=(v,k)=>obj(v)&&k!==null&&Object.prototype.hasOwnProperty.call(v,k);
  const date=v=>typeof v==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(Date.parse(v+"T00:00:00Z"))&&new Date(v+"T00:00:00Z").toISOString().slice(0,10)===v;
  let userId=null,spaceId=null,entityId=null,periodId=null,context=null,valid=false;
  try{
    const ur=load(USERS,null),r=load(REG,null),cd=load("skosif_companies_v1",null);
    userId=id(ur&&ur.active);const u=own(ur&&ur.users,userId)?ur.users[userId]:null;
    spaceId=id(u&&u.lastSpace);entityId=id(cd&&cd.active&&cd.active.companyId);periodId=id(cd&&cd.active&&cd.active.periodId);
    const cos=obj(cd)&&Array.isArray(cd.companies)?cd.companies.filter(c=>obj(c)&&c.id===entityId):[];
    const ps=obj(cd)&&Array.isArray(cd.periods)?cd.periods.filter(p=>obj(p)&&p.id===periodId):[];
    const co=cos.length===1?cos[0]:null,p=ps.length===1?ps[0]:null;
    valid=!!(obj(u)&&u.id===userId&&own(u.spaces,spaceId)&&obj(u.spaces[spaceId])&&obj(r)&&r.active===spaceId&&own(r.spaces,spaceId)&&obj(r.spaces[spaceId])&&entityId===spaceId&&co&&id(co.name)&&typeof co.currency==="string"&&/^[A-Z]{3}$/.test(co.currency)&&p&&p.companyId===entityId&&date(p.startDate)&&date(p.endDate)&&p.startDate<=p.endDate);
    if(valid)context=Object.freeze({entityName:co.name,start:p.startDate,end:p.endDate,currency:co.currency});
  }catch{/* unavailable/corrupt context is not an empty initialized company */}
  const status=busy||scopeTransitions?"busy":scopeTainted?"tainted":valid?"stable":"unknown";
  const token=JSON.stringify([scopeEpoch,status,userId,spaceId,entityId,periodId,context]);
  return Object.freeze({status,token,userId,spaceId,entityId,periodId,context});
}
/* nothing of a company's own yet: no items, no sales or orders, no journal */
function blank(snap){
  if(!snap)return true;const ls=snap.ls||{},app=snap.app||{};
  const rows=Object.entries(app).some(([n,s])=>n!=="meta"&&s&&s.keys&&s.keys.length);
  let pricing={};try{pricing=JSON.parse(ls["aghnam-pricing-v3"]||"{}")||{}}catch{}
  const items=(pricing.raws||[]).length+(pricing.boxes||[]).length;
  let ledger=null;try{ledger=JSON.parse(ls["skosif_ledger_v1"]||"null")}catch{}
  const books=ledger&&((ledger.journal||ledger.entries||[]).length||(ledger.accounts||[]).length);
  return !rows&&!items&&!books&&!ls["skosif_demo_v1"];
}
/* Explicit same-company confirmation is an admission operation, never a read-side migration.
   Only the canonical, genuinely seeded public demo may bind an initially unregistered local
   main user. Unknown real/private/legacy datasets require a separate recovery flow. */
/* Conservative eligibility for unowned public-demo data, not authentication. The company seed
   marker alone says nothing about other stores. Unknown shapes or non-demo rows require recovery. */
function demoSnapshotEligible(snap,demo,co){
  const obj=v=>v&&typeof v==="object"&&!Array.isArray(v),empty=v=>v==null||v===""||Array.isArray(v)&&!v.length||obj(v)&&!Object.keys(v).length;
  const rows=v=>Array.isArray(v)&&v.every(r=>obj(r)&&r.demo===true);
  const only=(v,keys)=>obj(v)&&Object.keys(v).every(k=>keys.includes(k));
  const section=s=>!!(demo.sections&&demo.sections[s]);
  const arrays={"aghnam-v12-manual-sales":"sales","skosif_v31_supplier_batches":"supply","aghnam_v29_inventory":"stock","skosif_inv_expiry_batches":"stock","skosif_v38_batches":"stock","skosif_v38_coldchain":"stock","skosif_v38_ledger":"credit"};
  const wrappers={"skosif_erp_finance_v1":["supply","flows"],"skosif_erp_payables_v1":["supply","rows"],"skosif_purchasing_v1":["purchasing","orders","receipts","prices"],"skosif_followup_v1":["followup","records","queue"],"skosif_advances_v1":["advances","advances"]};
  const data={};for(const [k,raw] of Object.entries(snap.ls||{})){if(k==="skosif_ar_paste")data[k]=raw;else try{data[k]=JSON.parse(raw)}catch{return false}}
  for(const [k,v] of Object.entries(data)){
    if(empty(v))continue;
    if(k==="skosif_demo_v1")continue;
    if(arrays[k]){if(!rows(v)||v.length&&!section(arrays[k]))return false;continue}
    if(wrappers[k]){const [s,...fields]=wrappers[k];if(!only(v,[...fields,"seq"])||v.seq!=null&&!Number.isFinite(v.seq))return false;
      if(fields.some(f=>v[f]!=null&&(!rows(v[f])||v[f].length&&!section(s))))return false;continue}
    if(k==="skosif_v31_monthly_opex"){if(v!==26500||!demo.opex||!section("supply"))return false;continue}
    if(k==="skosif_rep_pl"){if(!section("reports")||v.demo!==true)return false;continue}
    if(k==="skosif_ar_paste"){
      const names=["مطعم الديرة للمشويات","مطبخ الضيافة الملكية","مطعم نجد الأصيل","مطاعم سفرة الخير","مطعم البحر الأحمر"],lines=v.split("\n");
      if(!demo.ar||!section("credit")||lines.shift()!=="العميل,التاريخ,المبلغ,المسدد"||lines.length!==names.length||lines.some((line,i)=>{const cells=line.split(",");return cells.length!==4||cells[0]!==names[i]||!/^\d{4}-\d{2}-\d{2}$/.test(cells[1])||cells.slice(2).some(n=>!/^\d+(\.\d+)?$/.test(n))}))return false;continue;
    }
    if(k==="skosif_ledger_v1"){
      if(!only(v,["accounts","entries","bank","lockDate","chain"])||!rows(v.entries||[])||!Array.isArray(v.accounts)||v.lockDate||v.bank&&v.bank.demo!==true||v.chain&&(!only(v.chain,["since","events"])||!Array.isArray(v.chain.events)||v.chain.events.length))return false;
      if((v.accounts.length||v.entries&&v.entries.length)&&!section("ledger"))return false;
      const advances=data.skosif_advances_v1,controls={"1150":["سلف الموظفين","asset"],"1160":["دفعات مقدمة للموردين","asset"],"2150":["دفعات مقدمة من العملاء","liability"]};
      for(const a of v.accounts){if(obj(a)&&a.demo===true)continue;
        /* Actual advances.post creates these three canonical controls without a demo flag.
           Accept only their exact generated shape with demo advance provenance and demo entries. */
        const c=obj(a)&&controls[a.code],linked=(v.entries||[]).some(e=>String(e.sourceId||"").startsWith("advance:")&&(e.lines||[]).some(l=>l.accountId===a.id));
        if(!c||!section("advances")||!advances||!rows(advances.advances)||!advances.advances.length||!linked||!only(a,["id","code","name","type","active"])||a.id!=="account-"+a.code||a.name!==c[0]||a.type!==c[1]||a.active!==true)return false;
      }continue;
    }
    if(k==="aghnam-pricing-v3"){
      const fields=["raws","boxes","exps","salesAliases","memos","log","snaps","priceHistory"];
      if(!only(v,[...fields,"v","settings","memo","reps","meta","seq","yt","categories"])||fields.some(f=>v[f]!=null&&(!rows(v[f])||v[f].length&&!section("catalog"))))return false;
      const st=v.settings||{};if(!only(st,["vat","waste","base","show","target","excellent","good","round","biz","preparer","logo","vatNo","crNo","phone","addr","vatReviewed","sv"])||st.biz&&st.biz!==co.name&&!(v.meta&&v.meta.source==="excel"&&st.biz==="أغنام الوادي")||["logo","vatNo","crNo","phone","addr"].some(f=>st[f])||st.preparer&&!["فريق التسعير","فريق دراسة التكاليف والتسعير"].includes(st.preparer))return false;
      if(v.meta&&(!only(v.meta,["created","updated","source"])||!["demo","excel"].includes(v.meta.source)))return false;
      if(v.seq&&(!obj(v.seq)||Object.values(v.seq).some(n=>!Number.isFinite(n))))return false;
      if(v.reps&&(!only(v.reps,["prefs","seq","log"])||!empty(v.reps.prefs)||!empty(v.reps.log)))return false;
      if(v.memo&&(!only(v.memo,["ref","date","reason","items","sign"])||v.memo.reason||!empty(v.memo.items)||!only(v.memo.sign||{},["prepName","prepNotes","finName","finNotes","decision","execName","execNotes"])||Object.entries(v.memo.sign||{}).some(([f,x])=>x&&!(f==="prepName"&&["فريق التسعير","فريق دراسة التكاليف والتسعير"].includes(x))&&!(f==="decision"&&x==="approved"))))return false;
      if(v.categories!=null&&(!Array.isArray(v.categories)||v.categories.some(c=>!only(c,["id","name","kind","active","createdAt"])||c.active!==true||!/^c\d+$/.test(c.id)||![...(v.raws||[]).map(r=>({name:r.cat,kind:"raw"})),...(v.boxes||[]).map(b=>({name:b.cat,kind:"box"}))].some(x=>x.name===c.name&&x.kind===c.kind))))return false;
      const factoryYield={src:"r14",inKg:27.2,buy:35,vat:"incl",method:"zero",lines:[{name:"لحم صافي بعد التقطيع",kg:20.43,type:"main",val:0},{name:"عظم بقري",kg:2.7,type:"by",val:7.5},{name:"مخرجات أخرى غير لحم (الخلية AG44)",kg:4.07,type:"waste",val:0}],apply:["r14","r15","r21","r25"]};
      if(v.yt&&JSON.stringify(v.yt)!==JSON.stringify(factoryYield)&&JSON.stringify(v.yt)!==JSON.stringify({src:"r1",inKg:27.2,buy:52,vat:"incl",method:"zero",lines:[{name:"لحم صافي بعد التقطيع",kg:20.4,type:"main",val:0},{name:"عظم",kg:2.7,type:"by",val:7.5},{name:"مخرجات أخرى",kg:4.1,type:"waste",val:0}],apply:["r1"]}))return false;
      continue;
    }
    return false;
  }
  for(const [name,store] of Object.entries(snap.app||{})){
    if(!store||!Array.isArray(store.vals))return false;
    if(name==="meta"){if(store.vals.some(v=>!obj(v)||v.key!=="dataset"||!obj(v.value)||v.value.demo!==true))return false}
    else if(!rows(store.vals)||store.vals.length&&!section("sales"))return false;
  }
  return true;
}

/* Keep one readonly transaction across all app stores. The synchronous handoff validates and
   binds local selection while that transaction is still active, before queued writers can run.
   This does not authorize or police later mutations by other app modules. */
async function admissionSnapshot(handoff){
  const ls={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(HELPER_KEY(k))ls[k]=localStorage.getItem(k)}
  if(!await appDbExists())return handoff({ls,app:null});
  const db=await openDb(APPDB),names=[...db.objectStoreNames];if(!names.length){db.close();return handoff({ls,app:{}})}
  return new Promise((resolve,reject)=>{
    const t=db.transaction(names,"readonly"),app={};let left=names.length,handed=false,result;
    const fail=()=>{db.close();reject(t.error||new Error("تعذرت قراءة لقطة متسقة"))};
    t.onerror=fail;t.onabort=fail;t.oncomplete=()=>{db.close();if(handed)resolve(result);else reject(new Error("لم تكتمل قراءة اللقطة"))};
    for(const name of names){const store=t.objectStore(name),keys=[],vals=[];app[name]={inline:store.keyPath!=null,keys,vals};const q=store.openCursor();
      q.onerror=fail;q.onsuccess=()=>{const cursor=q.result;if(cursor){keys.push(cursor.primaryKey);vals.push(cursor.value);cursor.continue();return}
        if(--left===0){try{result=handoff({ls,app});handed=true}catch(e){try{t.abort()}catch{}db.close();reject(e)}}};
    }
  });
}

async function confirmCurrentSelection(id){
  const initial=chatScopeSnapshot();
  if(initial.status==="stable")return initial.companyId===id;
  const refuse=()=>{toast("لم يُثبت سياق الشركة. أكّد الشركة التجريبية من مبدّل الشركات؛ البيانات القديمة أو المتعارضة تحتاج مراجعة مستقلة، ثم أعد التحميل.","warn");return false};
  if(initial.status!=="unknown")return refuse();
  const obj=v=>v&&typeof v==="object"&&!Array.isArray(v),own=(v,k)=>obj(v)&&Object.prototype.hasOwnProperty.call(v,k);
  const ur=load(USERS,null),r=load(REG,null),cd=load("skosif_companies_v1",null),demo=load("skosif_demo_v1",null);
  const me=obj(ur)&&obj(ur.users)&&own(ur.users,ur.active)?ur.users[ur.active]:null;
  const companies=obj(cd)&&Array.isArray(cd.companies)?cd.companies.filter(c=>obj(c)&&c.id===id):[];
  const co=companies.length===1?companies[0]:null;
  if(id!=="demo-co"||localStorage.getItem(PRIVATE)===id||!co||co.demo!==true||typeof co.name!=="string"||!co.name.trim()||!obj(demo)||!obj(demo.sections)||!demo.sections.company||
    !obj(cd.active)||cd.active.companyId!==id||!obj(me)||me.id!=="user-main"||ur.active!==me.id||!obj(me.spaces)||
    me.lastSpace!=null&&me.lastSpace!==id||own(me.spaces,id)&&!obj(me.spaces[id])||Object.entries(ur.users).some(([userId,u])=>userId!==me.id&&obj(u)&&(own(u.spaces,id)||u.lastSpace===id))||
    localStorage.getItem(REG)!==null&&(!obj(r)||!obj(r.spaces)||r.active!=null&&r.active!==id||own(r.spaces,id)&&!obj(r.spaces[id])))return refuse();
  const contextKeys=[USERS,REG,"skosif_companies_v1","skosif_demo_v1",PRIVATE,CHAT_GENERATION];
  const contextBytes=contextKeys.map(k=>localStorage.getItem(k)),admissionEpoch=scopeEpoch;
  const previous=[[USERS,localStorage.getItem(USERS)],[REG,localStorage.getItem(REG)]];
  const entry={...(me.spaces[id]||{}),name:co.name,at:new Date().toISOString()};
  const nextUsers={...ur,users:{...ur.users,[me.id]:{...me,lastSpace:id,spaces:{...me.spaces,[id]:entry}}}};
  const nextReg={...(r||{}),active:id,spaces:{...(r&&r.spaces||{}),[id]:{...(r&&r.spaces[id]||{}),...entry}}};
  const proposed={[USERS]:JSON.stringify(nextUsers),[REG]:JSON.stringify(nextReg)};
  const rollback=()=>{scopeTainted=true;for(const [key,value] of previous)try{
    /* Never overwrite a conflicting peer's new registry with our rollback. */
    if(localStorage.getItem(key)!==proposed[key])continue;
    if(value===null)localStorage.removeItem(key);else localStorage.setItem(key,value);
  }catch{/* remain closed; no success/reload */}};
  let bound=false;busy=true;scopeNotify();
  try{
    const ok=await admissionSnapshot(snap=>{
      if(scopeEpoch!==admissionEpoch||scopeTransitions||scopeTainted||chatLocked||chatForeign||contextKeys.some((k,i)=>localStorage.getItem(k)!==contextBytes[i])||!demoSnapshotEligible(snap,demo,co))return false;
      const live={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(HELPER_KEY(k))live[k]=localStorage.getItem(k)}
      if(Object.keys(live).length!==Object.keys(snap.ls).length||Object.entries(live).some(([k,v])=>snap.ls[k]!==v))return false;
      scopeBegin();
      try{
        if(scopeTainted||load(CHAT_GENERATION,null)!==chatGeneration)throw new Error("تعذر تثبيت جيل السياق");
        if(setUserReg(nextUsers)!==true||setReg(nextReg)!==true||
          JSON.stringify(load(USERS,null))!==proposed[USERS]||JSON.stringify(load(REG,null))!==proposed[REG]||
          load(CHAT_GENERATION,null)!==chatGeneration)throw new Error("تعذر التحقق من حفظ اختيار الشركة");
        bound=true;return true;
      }catch(e){rollback();SK.errors&&SK.errors.report(e,"space:confirm");return false}
      finally{scopeEnd()}
    });
    busy=false;scopeNotify();
    if(!ok||chatScopeSnapshot().status!=="stable")return refuse();
    return true;
  }catch(e){if(bound)rollback();busy=false;scopeNotify();SK.errors&&SK.errors.report(e,"space:confirm-read");return refuse()}

}
async function switchTo(id,name,opts={}){
  if(busy)return false;if(opts.after)sessionStorage.setItem(AFTER,String(opts.after));const cur=current(),who=user();
  if(id===cur.id&&!opts.fresh){if(!await confirmCurrentSelection(id))return false;try{sessionStorage.setItem(ASKED,"1")}catch{/* chooser preference is not ownership */}hideChooser();return true}
  busy=true;scopeBegin();
  try{
    /* the unnamed data of a brand-new device holds nothing yet: it is left, not listed as a company of its own */
    const leaving=await snapshot(),drop=cur.id==="space-main"&&blank(leaving);
    if(!drop)await putSnap(cur.id,leaving,who.id);
    const ur=userReg(),me=ur.users[who.id];me.spaces=me.spaces||{};if(!drop)me.spaces[cur.id]={name:cur.name,at:new Date().toISOString()};
    const snap=opts.fresh?null:await getSnap(id,who.id);
    clearHelperKeys();
    if(snap){Object.entries(snap.ls||{}).forEach(([k,v])=>localStorage.setItem(k,v));await restoreApp(snap.app)}
    else{await restoreApp(null);
      localStorage.setItem("aghnam-pricing-v3",JSON.stringify({raws:[],boxes:[],exps:[],settings:{biz:name}}));
      /* a company the owner created starts empty: the demo company fills only itself */
      if(opts.demo===false)localStorage.setItem("skosif_demo_v1",JSON.stringify({sections:{},at:null,off:true,dismissed:true}))}
    me.spaces[id]={...(me.spaces[id]||{}),name,at:new Date().toISOString()};me.lastSpace=id;setUserReg(ur);
    const r=reg();r.spaces[id]={...(r.spaces[id]||{}),name,at:new Date().toISOString()};r.active=id;setReg(r);
    const cd=load("skosif_companies_v1",{})||{};if((cd.companies||[]).some(c=>c.id===id)){cd.active={companyId:id};if(save("skosif_companies_v1",cd)!==true)scopeTainted=true}
    sessionStorage.setItem(ASKED,"1");rememberLast(id,name,localStorage.getItem(PRIVATE)===id);
    SK.audit&&SK.audit.log("helpers",{act:"space",user:who.id,to:id,fresh:!snap});
    toast((snap?"فُتحت بيانات «":"بدأت مساحة جديدة لـ «")+name+"» للمحاسب "+who.name+" — يُعاد تحميل الأدوات…","ok");
    if(opts.reload!==false)setTimeout(()=>location.reload(),600);else busy=false;
    return true;
  }catch(e){scopeTainted=true;busy=false;SK.errors&&SK.errors.report(e,"space");toast("تعذر التبديل: "+e.message,"bad");return false}
  finally{scopeEnd()}
}
async function newCompany(){
  const v=await SK.form("شركة جديدة للأدوات المساعدة",[{key:"name",label:"اسم الشركة",required:true,placeholder:"مثال: مؤسسة النخبة للحوم"},
    {key:"cur",label:"العملة",type:"select",value:"SAR",options:[["SAR","ريال سعودي"],["EGP","جنيه مصري"],["AED","درهم إماراتي"],["USD","دولار أمريكي"]]}],{ok:"إنشاء والانتقال إليها",message:"تبدأ الشركة الجديدة بأدوات فارغة: أصنافها وموردوها ومخزونها ومبيعاتها وملاحظاتها لها وحدها."});
  if(!v)return;
  const id=SK.ui&&SK.ui.uid?SK.ui.uid("co"):"co-"+Date.now().toString(36);
  const cd=load("skosif_companies_v1",{})||{};cd.companies=cd.companies||[];cd.periods=cd.periods||[];cd.companies.push({id,name:v.name,country:v.cur==="EGP"?"EG":"SA",currency:v.cur});save("skosif_companies_v1",cd);
  await switchTo(id,v.name,{fresh:true,after:"masterdata"});
}

/* ---------- the chooser: asked once per session when the helpers are first opened ---------- */
function options(){
  const u=user(),cur=current(),seen=new Set([cur.id]),list=[{id:cur.id,name:cur.name,note:"البيانات المفتوحة الآن",on:true}];
  const priv=localStorage.getItem(PRIVATE);if(priv&&priv!==cur.id)seen.add(priv); /* the private company opens from the front door only */
  Object.entries(u.spaces||{}).forEach(([id,s])=>{if(!seen.has(id)){seen.add(id);list.push({id,name:s.name,note:s.at?"آخر عمل "+new Date(s.at).toLocaleDateString("ar-SA-u-ca-gregory-nu-latn"):""})}});
  companies().forEach(c=>{if(!seen.has(c.id)){seen.add(c.id);list.push({id:c.id,name:c.name,note:"شركة متاحة لهذا المحاسب — تبدأ أدواتها فارغة إن لم يعمل عليها من قبل"})}});
  return list;
}
async function createUser(name,pin=""){
  name=String(name||"").trim();if(!name)throw new Error("اسم المحاسب مطلوب");
  const ur=userReg(),id=SK.ui&&SK.ui.uid?SK.ui.uid("usr"):"usr-"+Date.now().toString(36),p=String(pin||"");
  let pinSalt=null,pinHashValue=null;if(p){pinSalt=salt();pinHashValue=await pinHash(p,pinSalt)}
  ur.users[id]={id,name,createdAt:new Date().toISOString(),pinSalt,pinHash:pinHashValue,lastSpace:null,spaces:{}};setUserReg(ur);
  return ur.users[id];
}
async function switchUser(id,pin="",opts={}){
  if(busy)return false;const ur=userReg(),target=ur.users[id],from=user(),cur=current();if(!target)return false;
  if(id===from.id){if(chatScopeSnapshot().status!=="stable"){toast("المستخدم الحالي محدد؛ افتح مبدّل الشركات وأكّد الشركة المطلوبة لإكمال اختيار المساحة.","warn");return false}sessionStorage.setItem(USER_ASKED,"1");hideUserChooser();return true}
  if(!await verifyUser(target,pin)){toast("رمز الدخول غير صحيح","bad");return false}
  busy=true;scopeBegin();
  try{
    await putSnap(cur.id,await snapshot(),from.id);
    from.spaces=from.spaces||{};from.spaces[cur.id]={name:cur.name,at:new Date().toISOString()};from.lastSpace=cur.id;
    ur.active=id;target.spaces=target.spaces||{};
    const targetId=target.lastSpace||cur.id,targetName=(target.spaces[targetId]&&target.spaces[targetId].name)||(companies().find(c=>c.id===targetId)||{}).name||cur.name;
    const snap=await getSnap(targetId,id);clearHelperKeys();
    if(snap){Object.entries(snap.ls||{}).forEach(([k,v])=>localStorage.setItem(k,v));await restoreApp(snap.app)}
    else{await restoreApp(null);localStorage.setItem("aghnam-pricing-v3",JSON.stringify({raws:[],boxes:[],exps:[],settings:{biz:targetName}}))}
    target.spaces[targetId]={...(target.spaces[targetId]||{}),name:targetName,at:new Date().toISOString()};target.lastSpace=targetId;setUserReg(ur);
    const r=reg();r.active=targetId;r.spaces[targetId]={...(r.spaces[targetId]||{}),name:targetName,at:new Date().toISOString()};setReg(r);
    sessionStorage.setItem(USER_ASKED,"1");sessionStorage.setItem(ASKED,"1");
    SK.audit&&SK.audit.log("helpers",{act:"user",from:from.id,to:id,space:targetId});
    toast("فُتحت أدوات "+target.name+" — البيانات منفصلة على هذا الجهاز","ok");
    if(opts.reload!==false)setTimeout(()=>location.reload(),500);else busy=false;
    return true;
  }catch(e){scopeTainted=true;busy=false;SK.errors&&SK.errors.report(e,"helper-user");toast("تعذر تبديل المستخدم: "+e.message,"bad");return false}
  finally{scopeEnd()}
}
async function newUser(){
  const v=await SK.form("مستخدم جديد للأدوات المساعدة",[{key:"name",label:"اسم المحاسب / المستخدم",required:true,placeholder:"مثال: محمود الدسوقي"},
    {key:"pin",label:"رمز دخول اختياري",type:"password",placeholder:"اختياري — قفل محلي على هذا الجهاز"}],
    {ok:"إنشاء وفتح مساحته",message:"لكل مستخدم بيانات أدوات مستقلة لكل شركة. رمز الدخول — إن أضفته — قفل محلي على هذا الجهاز وليس حساباً سحابياً."});
  if(!v)return;const u=await createUser(v.name,v.pin||"");await switchUser(u.id,v.pin||"");
}
function hideUserChooser(){const w=document.getElementById("sqc-user-space");if(w)w.remove()}
async function chooseUser(id){const u=userReg().users[id];if(!u)return;let ok=false;if(!u.pinHash)ok=await switchUser(id);else{
  const v=await SK.form("فتح أدوات "+u.name,[{key:"pin",label:"رمز الدخول",type:"password",required:true}],{ok:"فتح",message:"هذا القفل محلي على هذا الجهاز."});
  if(v)ok=await switchUser(id,v.pin||"");
}
  if(ok&&inHelpers()&&!sessionStorage.getItem(ASKED))chooser();
}
function userChooser(){
  if(document.getElementById("sqc-user-space"))return;const cur=user(),w=document.createElement("div");w.id="sqc-user-space";w.className="skd-wrap";w.setAttribute("role","presentation");
  w.innerHTML='<div class="skd sqc-space" role="dialog" aria-modal="true" aria-labelledby="sqc-user-space-t"><span class="eyebrow">ACCOUNTANT WORKSPACES</span><h3 id="sqc-user-space-t">أدوات مَن؟</h3>'+
    '<p>اختر المحاسب. كل مستخدم يملك بياناته المستقلة لكل شركة. رمز الدخول اختياري ومحلي على هذا الجهاز فقط.</p><div class="sqc-space-list">'+users().map(u=>'<button type="button" class="sqc-space-o'+(u.id===cur.id?' on':'')+'" data-user="'+esc(u.id)+'"><b>'+esc(u.name)+'</b><small>'+(u.pinHash?'محمي برمز محلي':'بدون رمز')+(u.lastSpace?' · آخر شركة: '+esc((u.spaces[u.lastSpace]||{}).name||''):'')+'</small></button>').join("")+'</div>'+
    '<div class="skd-acts"><button type="button" class="btn" data-user-new>+ مستخدم جديد</button><button type="button" class="btn primary" data-user="'+esc(cur.id)+'">متابعة كـ «'+esc(cur.name)+'»</button></div></div>';
  w.addEventListener("click",e=>{const b=e.target.closest("[data-user]");if(b){chooseUser(b.dataset.user);return}if(e.target.closest("[data-user-new]")){hideUserChooser();newUser();return}
    if(e.target===w){sessionStorage.setItem(USER_ASKED,"1");hideUserChooser();if(!sessionStorage.getItem(ASKED))chooser()}});
  document.body.appendChild(w);const f=w.querySelector(".skd-acts .primary");f&&f.focus();
}
function hideChooser(){const w=document.getElementById("sqc-space");if(w)w.remove()}
function chooser(){
  if(document.getElementById("sqc-space"))return;
  const w=document.createElement("div");w.id="sqc-space";w.className="skd-wrap";w.setAttribute("role","presentation");
  w.innerHTML='<div class="skd sqc-space" role="dialog" aria-modal="true" aria-labelledby="sqc-space-t"><span class="eyebrow">COMPANY</span><h3 id="sqc-space-t">الأدوات المساعدة — لأي شركة؟</h3>'+
    '<p>اختر الشركة التي تعمل على أدواتها الآن. لكل شركة أصنافها ومخزونها ومورّدوها ومبيعاتها وملاحظاتها، منفصلة تماماً عن غيرها وعن ملف المراجعة.</p>'+
    '<div class="sqc-space-list">'+options().map(o=>'<button type="button" class="sqc-space-o'+(o.on?' on':'')+'" data-space="'+esc(o.id)+'" data-name="'+esc(o.name)+'"><b>'+esc(o.name)+'</b><small>'+esc(o.note)+'</small></button>').join("")+'</div>'+
    '<div class="skd-acts"><button type="button" class="btn" data-space-new>+ شركة جديدة</button><button type="button" class="btn primary" data-space="'+esc(current().id)+'" data-name="'+esc(current().name)+'">متابعة مع «'+esc(current().name)+'»</button></div></div>';
  w.addEventListener("click",e=>{const b=e.target.closest("[data-space]");if(b){switchTo(b.dataset.space,b.dataset.name);return}
    if(e.target.closest("[data-space-new]")){hideChooser();newCompany();return}
    if(e.target===w){sessionStorage.setItem(ASKED,"1");hideChooser()}});
  document.body.appendChild(w);
  const f=w.querySelector(".skd-acts .primary");f&&f.focus();
}
function inHelpers(){const c=window.SKosifCore,cap=c&&SK.caps&&SK.caps.get(c.view());return!!(cap&&cap.company)}
function onNav(){if(inHelpers()){banner();sessionStorage.setItem(USER_ASKED,"1");if(!sessionStorage.getItem(ASKED))chooser()}else{hideUserChooser();hideChooser()}}
/* the strip at the top of every helper screen: which company, and the way to change it */
function banner(){
  setTimeout(()=>{const v=document.getElementById("view");if(!v||!inHelpers())return;
    let b=v.querySelector(":scope > .sqc-space-bar");const cur=current(),who=user();
    const html='<span>'+SK.icon("user")+' <b>'+esc(who.name)+'</b> · '+SK.icon("companies")+' <b>'+esc(cur.name)+'</b></span><span class="sqc-space-bar-actions"><button type="button" class="btn sm" data-user-open>تبديل المستخدم</button><button type="button" class="btn sm" data-space-open>تبديل الشركة</button><a class="btn sm" href="./" data-space-door>كل الشركات</a></span>';
    if(!b){b=document.createElement("div");b.className="sqc-space-bar";const d=v.querySelector(":scope > .skn-domain");d?d.after(b):v.prepend(b)}
    if(b.innerHTML!==html)b.innerHTML=html},0);
}
document.addEventListener("click",e=>{if(e.target.closest("[data-user-open]"))userChooser();else if(e.target.closest("[data-space-open]"))chooser()});
SK.bus&&SK.bus.on("nav",()=>setTimeout(onNav,50));
SK.bus&&SK.bus.on("render",()=>setTimeout(()=>{if(inHelpers())banner()},0));
/* ---------- the front door's choice, applied once per page load ---------- */
/* a new name for a space, everywhere this device lists it */
function rename(id,name){name=String(name||"").trim();if(!id||!name)return false;
  const ur=userReg();Object.values(ur.users).forEach(u=>{if(u.spaces&&u.spaces[id])u.spaces[id]={...u.spaces[id],name}});setUserReg(ur);
  const r=reg();if(r.spaces[id]){r.spaces[id]={...r.spaces[id],name};setReg(r)}
  try{const l=JSON.parse(localStorage.getItem(LAST)||"null");if(l&&l.id===id)localStorage.setItem(LAST,JSON.stringify({...l,name}))}catch{}
  return true}
/* the last company opened, with the entry it was opened through (the door resumes both) */
function rememberLast(id,name,locked,gate=sessionGate()){try{localStorage.setItem(LAST,JSON.stringify({id,name,locked:!!locked,gate:gateOf(gate)||undefined,at:new Date().toISOString()}))}catch{}}
async function applyIntent(){
  let it=null;try{it=JSON.parse(sessionStorage.getItem(INTENT)||"null");sessionStorage.removeItem(INTENT)}catch{}
  if(!it||typeof it!=="object")return false;
  /* the entry chosen at the door: the shell paints that section's menu, and its first screen opens — unless the link
     already names a screen, or the company is new to the accounting entry (its definitions come first, FOUNDATION §3.2) */
  const gate=gateOf(it.gate);if(gate)sessionStorage.setItem(GATE,gate);
  if(gate==="audit"&&it.corpus){sessionStorage.removeItem(GATE_AUDIT_NEW);sessionStorage.setItem(GATE_CORPUS,String(it.corpus).slice(0,80))}
  else if(gate==="audit"&&it.auditNew){sessionStorage.removeItem(GATE_CORPUS);sessionStorage.setItem(GATE_AUDIT_NEW,"1")}
  const landing=()=>{if(!gate)return "";if(it.create&&gate==="accounting")return "masterdata";return SK.caps.gatewayHome?SK.caps.gatewayHome(gate):""};
  /* the landing is pinned: the screen the app restores first (the last one opened, maybe of another section) must not
     switch the section before the section's own screen arrives (ui/core/gate.js, shell.js) */
  const land=()=>{if(location.search||location.hash)return;const to=landing();if(to){sessionStorage.setItem(AFTER,to);sessionStorage.setItem(GATE_PIN,to)}};
  /* Independent Audit entry does not claim or switch an accounting/helper company. */
  if(gate==="audit"&&!it.id&&(it.auditNew||it.corpus)){
    land();
    try{sessionStorage.setItem(ASKED,"1");sessionStorage.setItem(USER_ASKED,"1")}catch{}
    return true;
  }
  const cur=current();
  if(it.locked){
    sessionStorage.setItem(ASKED,"1");sessionStorage.setItem(USER_ASKED,"1");
    /* the private company = the data this device held before the front door existed (the space «space-main», open now or
       kept as a snapshot); a device that never held it gets a space of its own — never the demo or another company's data */
    let pid=localStorage.getItem(PRIVATE),fresh=false;
    if(!pid){const known=!!((user().spaces||{})["space-main"]);pid=cur.id==="space-main"||known?"space-main":"space-private";fresh=pid==="space-private";localStorage.setItem(PRIVATE,pid)}
    const name=String(it.name||"").trim()||cur.name;rememberLast(pid,name,true,gate);land();
    if(pid!==cur.id)await switchTo(pid,name,{fresh:fresh&&!(user().spaces||{})[pid],demo:false});
    return true;
  }
  const id=String(it.id||"").trim(),name=String(it.name||"").trim()||id;if(!id)return false;
  /* the sector the company was chosen or created under (FOUNDATION §3.7); a company recorded before sectors existed takes it */
  const sector=SK.caps&&SK.caps.sector&&SK.caps.sector(it.sector)?String(it.sector):"";
  const cd=load("skosif_companies_v1",{})||{};cd.companies=cd.companies||[];cd.periods=cd.periods||[];
  const rec=cd.companies.find(c=>c&&c.id===id);
  if(it.create&&!rec){cd.companies.push({id,name,country:"SA",currency:"SAR",sector:sector||"trade",packPending:true,...(it.model?{model:true}:{})});save("skosif_companies_v1",cd)}
  else if(rec&&sector&&!rec.sector){rec.sector=sector;save("skosif_companies_v1",cd)}
  land();
  /* explicit selection is an admission, also for the company already open (#143): the switch decides, and only an
     opened company is remembered or marks the choice as made */
  const opened=await switchTo(id,name,{fresh:!!it.create,demo:it.create?false:undefined});
  if(opened){sessionStorage.setItem(USER_ASKED,"1");rememberLast(id,name,false,gate)}
  return opened;
}
const intentDone=applyIntent().catch(e=>{SK.errors&&SK.errors.report(e,"space:intent");return false});
window.SKosifSpace=Object.freeze({scopeSnapshot,chatScopeSnapshot,current,list:options,switchTo,newCompany,choose:chooser,isHelperKey:HELPER_KEY,user,users,createUser,switchUser,newUser,chooseUser:userChooser,
  busy:()=>busy,intent:()=>intentDone,privateSpace:()=>localStorage.getItem(PRIVATE)||"",rename});
})();

