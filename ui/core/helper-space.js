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
const REG="sqc_helper_space_v1",ASKED="sqc_space_chosen",USERS="sqc_helper_users_v1",USER_ASKED="sqc_helper_user_chosen",DB="sqc-spaces",APPDB="aghnam-app-v7";
/* the helper tools' own data — per company */
const HELPER_KEY=k=>/^aghnam(?!-v12-theme|-pricing-auth|-pricing-pass|-pricing-ui|-typesafe|-v17-runtime|-v19-(leader|tabs|write)|-v21-)/.test(k)&&!/^aghnam_v29_jev_log$/.test(k)
  ||/^skosif_(v3\d|v38)_/.test(k)||/^skosif_(ledger_v1|erp_[a-z_]+|purchasing_v1|followup_v1|inv_[a-z_]+|rep_pl|report_pack_v1|ar_paste|commerce_warm_v1|cost_rules_v1|income_statements_v1|product_flow_v1|ops_[a-z_]+)$/.test(k)
  ||/^sqc_(ptree|geo|jesim|salesup)_/.test(k)||k==="skosif_demo_v1"
  ||/^sales_customer_followup/.test(k); /* the original CRM V8.2 (الأنظمة الأصلية) */
const reg=()=>{const r=load(REG,{})||{};return{active:r.active||null,spaces:r.spaces||{}}};
const setReg=r=>save(REG,r);
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
const setUserReg=u=>save(USERS,u);
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
let busy=false;
async function switchTo(id,name,opts={}){
  if(busy)return false;const cur=current(),who=user();
  if(id===cur.id&&!opts.fresh){sessionStorage.setItem(ASKED,"1");hideChooser();return true}
  busy=true;
  try{
    await putSnap(cur.id,await snapshot(),who.id);
    const ur=userReg(),me=ur.users[who.id];me.spaces=me.spaces||{};me.spaces[cur.id]={name:cur.name,at:new Date().toISOString()};
    const snap=opts.fresh?null:await getSnap(id,who.id);
    clearHelperKeys();
    if(snap){Object.entries(snap.ls||{}).forEach(([k,v])=>localStorage.setItem(k,v));await restoreApp(snap.app)}
    else{await restoreApp(null);
      localStorage.setItem("aghnam-pricing-v3",JSON.stringify({raws:[],boxes:[],exps:[],settings:{biz:name}}))}
    me.spaces[id]={...(me.spaces[id]||{}),name,at:new Date().toISOString()};me.lastSpace=id;setUserReg(ur);
    const r=reg();r.spaces[id]={...(r.spaces[id]||{}),name,at:new Date().toISOString()};r.active=id;setReg(r);
    const cd=load("skosif_companies_v1",{})||{};if((cd.companies||[]).some(c=>c.id===id)){cd.active={companyId:id};save("skosif_companies_v1",cd)}
    sessionStorage.setItem(ASKED,"1");
    SK.audit&&SK.audit.log("helpers",{act:"space",user:who.id,to:id,fresh:!snap});
    toast((snap?"فُتحت بيانات «":"بدأت مساحة جديدة لـ «")+name+"» للمحاسب "+who.name+" — يُعاد تحميل الأدوات…","ok");
    if(opts.reload!==false)setTimeout(()=>location.reload(),600);else busy=false;
    return true;
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
  const u=user(),cur=current(),seen=new Set([cur.id]),list=[{id:cur.id,name:cur.name,note:"البيانات المفتوحة الآن",on:true}];
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
  if(id===from.id){sessionStorage.setItem(USER_ASKED,"1");hideUserChooser();return true}
  if(!await verifyUser(target,pin)){toast("رمز الدخول غير صحيح","bad");return false}
  busy=true;
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
  }catch(e){busy=false;SK.errors&&SK.errors.report(e,"helper-user");toast("تعذر تبديل المستخدم: "+e.message,"bad");return false}
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
function onNav(){if(inHelpers()){banner();sessionStorage.setItem(USER_ASKED,"1");if(!sessionStorage.getItem(ASKED))chooser()}else{hideUserChooser();hideChooser()}}
/* the strip at the top of every helper screen: which company, and the way to change it */
function banner(){
  setTimeout(()=>{const v=document.getElementById("view");if(!v||!inHelpers())return;
    let b=v.querySelector(":scope > .sqc-space-bar");const cur=current(),who=user();
    const html='<span>'+SK.icon("user")+' <b>'+esc(who.name)+'</b> · '+SK.icon("companies")+' <b>'+esc(cur.name)+'</b></span><span class="sqc-space-bar-actions"><button type="button" class="btn sm" data-user-open>تبديل المستخدم</button><button type="button" class="btn sm" data-space-open>تبديل الشركة</button></span>';
    if(!b){b=document.createElement("div");b.className="sqc-space-bar";const d=v.querySelector(":scope > .skn-domain");d?d.after(b):v.prepend(b)}
    if(b.innerHTML!==html)b.innerHTML=html},0);
}
document.addEventListener("click",e=>{if(e.target.closest("[data-user-open]"))userChooser();else if(e.target.closest("[data-space-open]"))chooser()});
SK.bus&&SK.bus.on("nav",()=>setTimeout(onNav,50));
SK.bus&&SK.bus.on("render",()=>setTimeout(()=>{if(inHelpers())banner()},0));
window.SKosifSpace=Object.freeze({current,list:options,switchTo,newCompany,choose:chooser,isHelperKey:HELPER_KEY,user,users,createUser,switchUser,newUser,chooseUser:userChooser});
})();
