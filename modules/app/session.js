/* S.kosif V36 — Browser & Session Recovery
   Adapted from the uploaded browser capability-check flow.
   S.kosif does not require third-party cookies; this checks storage,
   Safari/iOS, PWA and Jev session prerequisites and offers safe recovery. */
(()=>{
"use strict";
if(window.SKosifSessionHealthV36)return;
const VER="36.0",JKEY="aghnamJevSession",API="https://aghnam-jev-api.kosif199022.workers.dev",PROBE="skosif_v36_probe";
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
let latest=null;

function env(){
  const ua=navigator.userAgent||"";
  return {
    ios:/iPhone|iPad|iPod/i.test(ua),
    safari:/Safari/i.test(ua)&&!/Chrome|CriOS|Edg|OPR|FxiOS/i.test(ua),
    standalone:matchMedia("(display-mode: standalone)").matches||navigator.standalone===true,
    secure:isSecureContext,
    online:navigator.onLine
  };
}
function probeStore(store){
  try{const v=Date.now()+"-"+Math.random();store.setItem(PROBE,v);const ok=store.getItem(PROBE)===v;store.removeItem(PROBE);return ok}catch{return false}
}
async function probeIDB(){
  if(!("indexedDB" in window))return false;
  return new Promise(resolve=>{
    let q;try{q=indexedDB.open("skosif-v36-probe",1)}catch{return resolve(false)}
    q.onupgradeneeded=()=>{try{q.result.createObjectStore("p")}catch{}};
    q.onerror=()=>resolve(false);
    q.onsuccess=()=>{const db=q.result;try{const tx=db.transaction("p","readwrite");tx.objectStore("p").put("ok","status");tx.oncomplete=()=>{db.close();indexedDB.deleteDatabase("skosif-v36-probe");resolve(true)};tx.onerror=()=>{db.close();resolve(false)}}catch{db.close();resolve(false)}};
  });
}
async function probeAccess(){
  if(typeof document.hasStorageAccess!=="function")return {supported:false,granted:true};
  try{return {supported:true,granted:await document.hasStorageAccess()}}catch{return {supported:true,granted:false}}
}
async function probeSW(){
  if(!("serviceWorker" in navigator))return {supported:false,registered:false,controlled:false,waiting:false};
  try{const r=await navigator.serviceWorker.getRegistration();return {supported:true,registered:!!r,controlled:!!navigator.serviceWorker.controller,waiting:!!r?.waiting}}catch{return {supported:true,registered:false,controlled:false,waiting:false}}
}
async function probeJev(){
  let token=false;try{token=!!sessionStorage.getItem(JKEY)}catch{}
  let api=false;
  if(navigator.onLine){try{const c=new AbortController(),t=setTimeout(()=>c.abort(),4500);const r=await fetch(API+"/health",{cache:"no-store",signal:c.signal});clearTimeout(t);api=r.ok}catch{}}
  return {token,api};
}
async function probeQuota(){
  try{
    const e=await navigator.storage?.estimate?.();
    const persistent=await navigator.storage?.persisted?.();
    return {usage:e?.usage||0,quota:e?.quota||0,persistent:persistent??null};
  }catch{return {usage:0,quota:0,persistent:null}}
}
async function diagnose(){
  const e=env(),idbP=probeIDB(),accP=probeAccess(),swP=probeSW(),jevP=probeJev(),quotaP=probeQuota();
  const [idb,access,sw,jev,quota]=await Promise.all([idbP,accP,swP,jevP,quotaP]);
  const r={at:new Date().toISOString(),env:e,sessionStorage:probeStore(sessionStorage),localStorage:probeStore(localStorage),indexedDB:idb,storageAccess:access,serviceWorker:sw,jev,quota};
  r.critical=[
    !e.secure?"الاتصال غير آمن — HTTPS مطلوب":"",
    !r.sessionStorage?"sessionStorage غير متاح — جلسة Jev لن تستمر":"",
    !r.localStorage?"localStorage غير متاح — بعض إعدادات التطبيق لن تحفظ":"",
    !r.indexedDB?"IndexedDB غير متاح — التخزين المحلي المتقدم محدود":""
  ].filter(Boolean);
  r.warnings=[
    !e.online?"الجهاز دون اتصال":"",
    access.supported&&!access.granted?"Storage Access غير ممنوح في هذا السياق":"",
    sw.supported&&!sw.registered?"Service Worker غير مسجل":"",
    e.online&&jev.api&&!jev.token?"Jev API متاح لكن جلسة Jev غير مفعلة — افتح التطبيق من شاشة كلمة المرور":"",
    e.online&&!jev.api?"تعذر الوصول إلى Jev API":"",
    quota.persistent===false?"التخزين غير مثبت وقد ينظفه النظام عند ضغط المساحة":""
  ].filter(Boolean);
  r.ok=!r.critical.length;
  return r;
}
function bytes(n){if(!n)return "—";const u=["B","KB","MB","GB"],i=Math.min(3,Math.floor(Math.log(n)/Math.log(1024)));return (n/1024**i).toFixed(i>1?1:0)+" "+u[i]}
function toast(msg){
  let t=$("#sk36-toast");if(!t){document.body.insertAdjacentHTML("beforeend",'<div id="sk36-toast" class="sk36-toast"></div>');t=$("#sk36-toast")}
  t.textContent=msg;t.classList.add("show");clearTimeout(t._x);t._x=setTimeout(()=>t.classList.remove("show"),2600);
}
function modal(){
  if($("#sk36-modal"))return;
  document.body.insertAdjacentHTML("beforeend",[
    '<div id="sk36-modal" class="sk36-backdrop" aria-hidden="true"><section class="sk36-panel" role="dialog" aria-modal="true">',
    '<header class="sk36-head"><div class="sk36-mark">S</div><div><b>سلامة الجلسة والمتصفح</b><span>Safari / iPhone / Storage / Jev / PWA</span></div><button id="sk36-x" type="button">×</button></header>',
    '<div id="sk36-body" class="sk36-body"><div class="sk36-loading">جارٍ الفحص…</div></div></section></div>'
  ].join(""));
  $("#sk36-x").onclick=close;
  $("#sk36-modal").onclick=e=>{if(e.target===$("#sk36-modal"))close()};
}
function open(){modal();$("#sk36-modal").classList.add("open");$("#sk36-modal").setAttribute("aria-hidden","false");run()}
function close(){$("#sk36-modal")?.classList.remove("open");$("#sk36-modal")?.setAttribute("aria-hidden","true")}
function card(a,b,state,note){
  return '<div class="sk36-card '+state+'"><span>'+esc(a)+'</span><b>'+esc(b)+'</b>'+(note?'<small>'+esc(note)+'</small>':'')+'</div>';
}
function render(r){
  const e=r.env,q=r.quota,a=r.storageAccess,sw=r.serviceWorker,j=r.jev,issues=[...r.critical,...r.warnings];
  const pct=q.quota?((q.usage/q.quota)*100).toFixed(1)+"%":"";
  const cards=[
    card("Secure Context",e.secure?"HTTPS":"غير آمن",e.secure?"ok":"bad",""),
    card("sessionStorage",r.sessionStorage?"متاح":"غير متاح",r.sessionStorage?"ok":"bad",""),
    card("localStorage",r.localStorage?"متاح":"غير متاح",r.localStorage?"ok":"bad",""),
    card("IndexedDB",r.indexedDB?"متاح":"غير متاح",r.indexedDB?"ok":"bad",""),
    card("Storage Access",a.supported?(a.granted?"ممنوح":"غير ممنوح"):"غير مطلوب",(!a.supported||a.granted)?"ok":"warn",""),
    card("Persistent Storage",q.persistent===null?"غير معروف":q.persistent?"مثبت":"غير مثبت",q.persistent===false?"warn":"ok",""),
    card("Service Worker",sw.registered?"مسجل":"غير مسجل",sw.registered?"ok":"warn",sw.controlled?"يسيطر على الصفحة":""),
    card("Jev Session",j.token?"مفعلة":"غير مفعلة",j.token?"ok":"warn",j.api?"Jev API متاح":"Jev API غير متاح"),
    card("الشبكة",e.online?"متصل":"دون اتصال",e.online?"ok":"warn",""),
    card("وضع التطبيق",e.standalone?"PWA مستقل":e.ios&&e.safari?"Safari iPhone":"متصفح","ok",""),
    card("التخزين المستخدم",bytes(q.usage),"ok",q.quota?"من "+bytes(q.quota)+" · "+pct:""),
    card("تحديث PWA",sw.waiting?"جاهز":"لا تحديث معلق",sw.waiting?"warn":"ok","")
  ].join("");
  const issueHTML=issues.length?'<section class="sk36-issues"><h4>التشخيص</h4>'+issues.map((x,i)=>'<p class="'+(i<r.critical.length?"bad":"warn")+'"><i>'+(i<r.critical.length?"!":"•")+'</i><span>'+esc(x)+'</span></p>').join("")+'</section>':'<div class="sk36-success">لا توجد مشاكل حرجة مكتشفة.</div>';
  const actions=[
    a.supported&&!a.granted?'<button id="sk36-access" type="button">منح Storage Access</button>':'',
    q.persistent===false&&navigator.storage?.persist?'<button id="sk36-persist" type="button">تثبيت التخزين</button>':'',
    sw.waiting?'<button id="sk36-update" type="button">تطبيق تحديث PWA</button>':'',
    !j.token?'<button id="sk36-login" class="primary" type="button">إعادة فتح شاشة الدخول لتفعيل Jev</button>':'',
    '<button id="sk36-refresh" type="button">إعادة الفحص</button>'
  ].join("");
  const ios=e.ios&&e.safari&&!e.standalone?'<section class="sk36-ios"><b>iPhone / Safari</b><span>لثبات أفضل: مشاركة ← «إضافة إلى الشاشة الرئيسية»، ثم شغّل S.kosif من الأيقونة.</span></section>':'';
  $("#sk36-body").innerHTML=[
    '<section class="sk36-overview '+(r.critical.length?"bad":r.warnings.length?"warn":"ok")+'"><div><b>'+(r.critical.length?"تحتاج تدخل":r.warnings.length?"يعمل مع ملاحظات":"البيئة سليمة")+'</b><span>'+(r.critical.length?"هناك متطلبات تمنع بعض الوظائف.":r.warnings.length?"S.kosif يعمل مع تنبيهات قابلة للإصلاح.":"التخزين والجلسة والـPWA جاهزة.")+'</span></div><strong>'+(r.critical.length?r.critical.length+" حرج":r.warnings.length?r.warnings.length+" تنبيه":"✓")+'</strong></section>',
    '<div class="sk36-grid">'+cards+'</div>',issueHTML,
    '<section class="sk36-recovery"><h4>إجراءات الاسترداد</h4><div>'+actions+'</div></section>',ios,
    '<details class="sk36-tech"><summary>تفاصيل تقنية</summary><pre>'+esc(JSON.stringify(r,null,2))+'</pre></details>'
  ].join("");
  bind();
}
function bind(){
  $("#sk36-refresh")?.addEventListener("click",run);
  $("#sk36-login")?.addEventListener("click",()=>{try{sessionStorage.removeItem(JKEY)}catch{}location.reload()});
  $("#sk36-access")?.addEventListener("click",async()=>{try{await document.requestStorageAccess();toast("تم منح إذن التخزين.");await run()}catch{toast("لم يمنح المتصفح إذن التخزين.")}});
  $("#sk36-persist")?.addEventListener("click",async()=>{try{const ok=await navigator.storage.persist();toast(ok?"تم تثبيت التخزين.":"لم يوافق المتصفح على تثبيت التخزين.");await run()}catch{toast("تعذر طلب تثبيت التخزين.")}});
  $("#sk36-update")?.addEventListener("click",async()=>{try{const reg=await navigator.serviceWorker.getRegistration();if(reg?.waiting){reg.waiting.postMessage({type:"SKIP_WAITING"});toast("جارٍ تطبيق التحديث…");setTimeout(()=>location.reload(),650)}}catch{toast("تعذر تطبيق التحديث.")}});
}
async function run(){
  if($("#sk36-body"))$("#sk36-body").innerHTML='<div class="sk36-loading">جارٍ الفحص…</div>';
  latest=await diagnose();if($("#sk36-body"))render(latest);badge(latest);return latest;
}
function ensureBadge(){
  if($("#sk36-health"))return;
  const b=document.createElement("button");b.id="sk36-health";b.type="button";b.className="sk36-health";b.innerHTML='<i></i><span>الجلسة</span>';b.onclick=open;
  const host=$("#sx-taskbar .sx-status");if(host)host.prepend(b);else document.body.appendChild(b);
}
function badge(r){
  ensureBadge();const b=$("#sk36-health");if(!b)return;
  b.classList.toggle("bad",!!r.critical.length);b.classList.toggle("warn",!r.critical.length&&!!r.warnings.length);
  const s=b.querySelector("span");if(s)s.textContent=r.critical.length?"مشكلة":r.warnings.length?"تنبيه":"سليم";
}
function augmentJev(){
  let token=false;try{token=!!sessionStorage.getItem(JKEY)}catch{}
  const off=$(".jev-offline");if(!off||off.dataset.sk36==="1"||token)return;
  off.dataset.sk36="1";const b=document.createElement("button");b.type="button";b.className="sk36-inline";b.textContent="تشخيص الجلسة";b.onclick=open;off.insertAdjacentElement("afterend",b);
}
async function boot(){
  ensureBadge();latest=await diagnose();badge(latest);
  const mo=new MutationObserver(augmentJev);mo.observe(document.documentElement,{childList:true,subtree:true});
  addEventListener("online",async()=>badge(await diagnose()));addEventListener("offline",async()=>badge(await diagnose()));
  window.SKosifSessionHealthV36=Object.freeze({version:VER,open,diagnose,get latest(){return latest}});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();