/* SQC — مساحات الأدوات المساعدة: كل شركة لها بياناتها (window.SKosifSpace).
   الأدوات المساعدة للمحاسب تعمل كتطبيق مستقل داخل SQC: عند الدخول إليها تختار الشركة التي تعمل عليها (أو شركة جديدة)،
   فلا يظهر إلا ما يخصها — الأصناف والأسعار والبوكسات، المخزون، الموردون والمشتريات، العملاء والمبيعات والطلبات، الدفاتر،
   الملاحظات والمتابعة، شجرة المنتجات، محاكي القيود.
   الآلية: بيانات الأدوات مخزنة في مفاتيح localStorage معروفة (HELPER_KEY أدناه) وفي قاعدة IndexedDB «aghnam-app-v7».
   عند التبديل تُحفظ لقطة كاملة من بيانات الشركة الحالية في قاعدة «sqc-spaces»، وتُستعاد لقطة الشركة المختارة (أو تُفرّغ
   لشركة جديدة)، ثم تُعاد تهيئة التطبيق. ما لا يخص شركة بعينها يبقى مشتركاً: الإعدادات والمظهر، ملف المراجعة (له اختياره
   الخاص)، المهام والإشعارات والمخاطر، Jev ومجلس القرار، مفاتيح الذكاء الاصطناعي، سجل التدقيق. */
(()=>{
"use strict";
const {esc,load,save,toast}=SK;
const REG="sqc_helper_space_v1",ASKED="sqc_space_chosen",DB="sqc-spaces",APPDB="aghnam-app-v7";
/* the helper tools' own data — per company */
const HELPER_KEY=k=>/^aghnam(?!-v12-theme|-pricing-auth|-pricing-pass|-pricing-ui|-typesafe|-v17-runtime|-v19-(leader|tabs|write)|-v21-)/.test(k)&&!/^aghnam_v29_jev_log$/.test(k)
  ||/^skosif_(v3\d|v38)_/.test(k)||/^skosif_(ledger_v1|advances_v1|erp_[a-z_]+|purchasing_v1|followup_v1|inv_[a-z_]+|rep_pl|report_pack_v1|ar_paste|commerce_warm_v1|cost_rules_v1|income_statements_v1|product_flow_v1|ops_[a-z_]+)$/.test(k)
  ||/^sqc_(ptree|geo|jesim|salesup)_/.test(k)||k==="skosif_demo_v1"
  ||/^sales_customer_followup/.test(k); /* the original CRM V8.2 (الأنظمة الأصلية) */
const reg=()=>{const r=load(REG,{})||{};return{active:r.active||null,spaces:r.spaces||{}}};
const setReg=r=>save(REG,r);
const bizName=()=>{try{const s=JSON.parse(localStorage.getItem("aghnam-pricing-v3")||"{}");return(s.settings&&s.settings.biz)||""}catch{return""}};
const companies=()=>{const d=load("skosif_companies_v1",{})||{};return d.companies||[]};
/* the space the app is on now: the registered one, else the data already on the device (named after the business) */
function current(){const r=reg();if(r.active&&r.spaces[r.active])return{id:r.active,...r.spaces[r.active]};
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
async function putSnap(id,snap){const db=await spacesDb();await tx(db,"spaces","readwrite",s=>s.put(snap,id));db.close()}
async function getSnap(id){const db=await spacesDb();const r=await tx(db,"spaces","readonly",s=>s.get(id));db.close();return r||null}
function clearHelperKeys(){const ks=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(HELPER_KEY(k))ks.push(k)}ks.forEach(k=>localStorage.removeItem(k))}

/* ---------- switching ---------- */
let busy=false;
async function switchTo(id,name,opts={}){
  if(busy)return false;const cur=current();
  if(id===cur.id&&!opts.fresh){sessionStorage.setItem(ASKED,"1");hideChooser();return true}
  busy=true;
  try{
    await putSnap(cur.id,await snapshot());
    const r=reg();r.spaces[cur.id]={name:cur.name,at:new Date().toISOString()};
    const snap=opts.fresh?null:await getSnap(id);
    clearHelperKeys();
    if(snap){Object.entries(snap.ls||{}).forEach(([k,v])=>localStorage.setItem(k,v));await restoreApp(snap.app)}
    else{await restoreApp(null);
      /* a new company starts empty under its own name — without this the pricing workbook would seed the sample catalogue */
      localStorage.setItem("aghnam-pricing-v3",JSON.stringify({raws:[],boxes:[],exps:[],settings:{biz:name}}))}
    r.spaces[id]={...(r.spaces[id]||{}),name,at:new Date().toISOString()};r.active=id;setReg(r);
    /* the company picked for the helpers becomes the active company of the books and the top bar */
    const cd=load("skosif_companies_v1",{})||{};if((cd.companies||[]).some(c=>c.id===id)){cd.active={companyId:id};save("skosif_companies_v1",cd)}
    sessionStorage.setItem(ASKED,"1");
    SK.audit&&SK.audit.log("helpers",{act:"space",to:id,fresh:!snap});
    toast((snap?"فُتحت بيانات «":"بدأت مساحة جديدة لـ «")+name+"» — يُعاد تحميل الأدوات…","ok");
    setTimeout(()=>location.reload(),600);return true;
  }catch(e){busy=false;SK.errors&&SK.errors.report(e,"space");toast("تعذر التبديل: "+e.message,"bad");return false}
}
async function newCompany(){
  const v=await SK.form("شركة جديدة للأدوات المساعدة",[{key:"name",label:"اسم الشركة",required:true,placeholder:"مثال: مؤسسة النخبة للحوم"},
    {key:"cur",label:"العملة",type:"select",value:"SAR",options:[["SAR","ريال سعودي"],["EGP","جنيه مصري"],["AED","درهم إماراتي"],["USD","دولار أمريكي"]]}],{ok:"إنشاء والانتقال إليها",message:"تبدأ الشركة الجديدة بأدوات فارغة: أصنافها وموردوها ومخزونها ومبيعاتها وملاحظاتها لها وحدها."});
  if(!v)return;
  const id=SK.ui&&SK.ui.uid?SK.ui.uid("co"):"co-"+Date.now().toString(36);
  const cd=load("skosif_companies_v1",{})||{};cd.companies=cd.companies||[];cd.periods=cd.periods||[];cd.companies.push({id,name:v.name,country:v.cur==="EGP"?"EG":"SA",currency:v.cur});save("skosif_companies_v1",cd);
  await switchTo(id,v.name,{fresh:true});
}

/* ---------- the chooser: asked once per session when the helpers are first opened ---------- */
function options(){
  const r=reg(),cur=current(),seen=new Set([cur.id]),list=[{id:cur.id,name:cur.name,note:"البيانات المفتوحة الآن",on:true}];
  Object.entries(r.spaces).forEach(([id,s])=>{if(!seen.has(id)){seen.add(id);list.push({id,name:s.name,note:s.at?"آخر عمل "+new Date(s.at).toLocaleDateString("ar-SA-u-ca-gregory-nu-latn"):""})}});
  companies().forEach(c=>{if(!seen.has(c.id)){seen.add(c.id);list.push({id:c.id,name:c.name,note:"من الشركات المسجلة — تبدأ أدواتها فارغة"})}});
  return list;
}
function hideChooser(){const w=document.getElementById("sqc-space");if(w)w.remove()}
function chooser(){
  if(document.getElementById("sqc-space"))return;
  const w=document.createElement("div");w.id="sqc-space";w.className="skd-wrap";w.setAttribute("role","presentation");
  w.innerHTML='<div class="skd sqc-space" role="dialog" aria-modal="true" aria-labelledby="sqc-space-t"><span class="eyebrow">ACCOUNTANT HELPERS</span><h3 id="sqc-space-t">الأدوات المساعدة — لأي شركة؟</h3>'+
    '<p>اختر الشركة التي تعمل على أدواتها الآن. لكل شركة أصنافها ومخزونها ومورّدوها ومبيعاتها وملاحظاتها، منفصلة تماماً عن غيرها وعن ملف المراجعة.</p>'+
    '<div class="sqc-space-list">'+options().map(o=>'<button type="button" class="sqc-space-o'+(o.on?' on':'')+'" data-space="'+esc(o.id)+'" data-name="'+esc(o.name)+'"><b>'+esc(o.name)+'</b><small>'+esc(o.note)+'</small></button>').join("")+'</div>'+
    '<div class="skd-acts"><button type="button" class="btn" data-space-new>+ شركة جديدة</button><button type="button" class="btn primary" data-space="'+esc(current().id)+'" data-name="'+esc(current().name)+'">متابعة مع «'+esc(current().name)+'»</button></div></div>';
  w.addEventListener("click",e=>{const b=e.target.closest("[data-space]");if(b){switchTo(b.dataset.space,b.dataset.name);return}
    if(e.target.closest("[data-space-new]")){hideChooser();newCompany();return}
    if(e.target===w){sessionStorage.setItem(ASKED,"1");hideChooser()}});
  document.body.appendChild(w);
  const f=w.querySelector(".skd-acts .primary");f&&f.focus();
}
function inHelpers(){const c=window.SKosifCore,cap=c&&SK.caps&&SK.caps.get(c.view());return!!(cap&&cap.group==="helpers")}
function onNav(){if(inHelpers()){banner();if(!sessionStorage.getItem(ASKED))chooser()}}
/* the strip at the top of every helper screen: which company, and the way to change it */
function banner(){
  setTimeout(()=>{const v=document.getElementById("view");if(!v||!inHelpers())return;
    let b=v.querySelector(":scope > .sqc-space-bar");const cur=current();
    const html='<span>'+SK.icon("companies")+' أدوات <b>'+esc(cur.name)+'</b></span><button type="button" class="btn sm" data-space-open>تبديل الشركة</button>';
    if(!b){b=document.createElement("div");b.className="sqc-space-bar";const d=v.querySelector(":scope > .skn-domain");d?d.after(b):v.prepend(b)}
    if(b.innerHTML!==html)b.innerHTML=html},0);
}
document.addEventListener("click",e=>{if(e.target.closest("[data-space-open]"))chooser()});
SK.bus&&SK.bus.on("nav",()=>setTimeout(onNav,50));
SK.bus&&SK.bus.on("render",()=>setTimeout(()=>{if(inHelpers())banner()},0));
window.SKosifSpace=Object.freeze({current,list:options,switchTo,newCompany,choose:chooser,isHelperKey:HELPER_KEY});
})();
