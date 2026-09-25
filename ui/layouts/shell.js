/* S.kosif layout — the app shell (window.SKosifShell).
   Paints the rail from the capability registry (one source of truth), filtered by role and by
   the daily/advanced switch; keeps the topbar title, breadcrumb and search in sync; owns the
   appearance preferences, the phone drawer, the offline notice, the update notice and the
   no-permission state. The core calls SKosifShell.paint() after every chrome paint. */
(()=>{
"use strict";
const {$,$$,esc,load,save}=SK;
const core=()=>window.SKosifCore;
const PREF_KEY="skosif_prefs";
const ADV_NOTE="تحليل وهندسة ومطابقة ومحاسبة — تظهر مع «أدوات متقدمة».";

/* ---------- preferences: appearance (light | dark | auto) + density ---------- */
function prefs(){return Object.assign({appearance:"light",density:"cozy"},load(PREF_KEY,{}))}
function migrate(){
  const p=load(PREF_KEY,null);if(p&&p.migrated)return;
  const out={appearance:"light",density:"cozy",migrated:1};
  try{
    const oldTheme=load("skosif_theme",""),dark=["royal","notte","cyber"].includes(oldTheme);
    const v12=localStorage.getItem("aghnam-v12-theme");
    out.appearance=dark||(!oldTheme&&v12==="dark")?"dark":"light";
    if(localStorage.getItem("aghnam-v21-density")==="compact")out.density="compact";
    ["skosif_theme","skosif_theme_dark","skosif_theme_light","aghnam-v21-accent","aghnam-v21-density","aghnam-v21-tour","aghnam-v21-whatsnew","aghnam-v21-ux-v1","aghnam-v203-magic-v1"].forEach(k=>localStorage.removeItem(k));
  }catch{}
  save(PREF_KEY,Object.assign({},p||{},out));
}
const mq=matchMedia("(prefers-color-scheme: dark)");
function resolved(){const a=prefs().appearance;return a==="auto"?(mq.matches?"dark":"light"):a}
function applyPrefs(){
  const de=document.documentElement,mode=resolved(),p=prefs();
  de.setAttribute("data-theme",mode);de.setAttribute("data-density",p.density==="compact"?"compact":"cozy");
  try{localStorage.setItem("aghnam-v12-theme",mode)}catch{}
  $$('meta[name="theme-color"]').forEach(m=>m.setAttribute("content",mode==="dark"?"#1b140e":"#efe2cc"));
}
function setPref(k,v){const p=prefs();p[k]=v;save(PREF_KEY,p);applyPrefs()}
function setAppearance(a){setPref("appearance",["light","dark","auto"].includes(a)?a:"light");SK.toast({light:"المظهر: نهاري",dark:"المظهر: ليلي",auto:"المظهر: حسب الجهاز"}[prefs().appearance],"info")}
function toggleAppearance(){setAppearance(resolved()==="dark"?"light":"dark")}
mq.addEventListener&&mq.addEventListener("change",()=>{if(prefs().appearance==="auto")applyPrefs()});
migrate();applyPrefs();

/* ---------- rail ---------- */
function navButton(c,cur){
  const icon=SK.icons[c.id]||(core()&&core().navIcon(c.id))||SK.icons.action;
  const badge=core()?core().navBadge(c.id):"";
  return '<button type="button" class="nav-btn" data-act="nav" data-v="'+c.id+'"'+(c.id===cur?' aria-current="page"':'')+'>'+icon+'<span>'+esc(c.label)+'</span>'+(badge||"")+'</button>';
}
let lastSig="";
function paintNav(){
  const nav=$("#nav");if(!nav||!core())return;
  const adv=core().mode()==="advanced",cur=core().view();
  let html="",firstAdv=true;
  SK.caps.groups().forEach(g=>{
    if(!g.primary&&!adv)return;
    const items=SK.caps.inGroup(g.id).filter(c=>SK.perm.can(c.id));
    if(!items.length)return;
    html+='<div class="skn-group" role="group" aria-label="'+esc(g.label)+'"><div class="nav-group"><span>'+esc(g.label)+'</span>'+(g.primary?'':'<span class="pro">متقدم</span>')+'</div>';
    if(!g.primary&&firstAdv){html+='<p class="skn-note">'+ADV_NOTE+'</p>';firstAdv=false}
    html+=items.map(c=>navButton(c,cur)).join("")+'</div>';
  });
  if(html!==lastSig||!nav.querySelector(".skn-group")){nav.innerHTML=html;lastSig=html}
}
function paintTop(){
  const c=core();if(!c)return;
  const cap=SK.caps.get(c.view());
  const t=$("#pg-title"),cr=$("#pg-crumb");
  if(cap){if(t&&t.textContent!==cap.label)t.textContent=cap.label;if(cr)cr.textContent=(cap.primary?"":"أدوات متقدمة · ")+cap.groupLabel}
  else if(cr)cr.textContent="";
  document.title=(cap?cap.label:(t&&t.textContent)||"")+" · S.kosif";
  const rail=$("#rail");document.body.classList.toggle("skn-locked",!!(rail&&rail.classList.contains("open"))&&innerWidth<=900);
}
function paint(){paintNav();paintTop()}

/* ---------- permission gate: a screen outside the role shows the no-permission state ---------- */
function gate(){
  const c=core();if(!c)return;
  const id=c.view();
  if(SK.caps.get(id)&&!SK.perm.can(id)){const v=$("#view");if(v)v.innerHTML=SK.ui.state.denied()}
}

/* ---------- offline + update notices (in the page flow, never floating) ---------- */
function offline(){
  let bar=$("#sk-offline");
  if(navigator.onLine){if(bar)bar.remove();return}
  if(bar)return;
  bar=document.createElement("div");bar.id="sk-offline";bar.className="sk-offline-bar";bar.setAttribute("role","status");
  bar.textContent="أنت دون اتصال — كل شيء يعمل ويُحفظ على هذا الجهاز؛ Jev والربط السحابي يعودان مع الاتصال.";
  ($(".maincol")||document.body).insertBefore(bar,$(".main"));
}
function updates(){
  if(!("serviceWorker" in navigator)||!/^https?:$/.test(location.protocol))return;
  const hadController=!!navigator.serviceWorker.controller;let reloading=false;
  navigator.serviceWorker.addEventListener("controllerchange",()=>{if(!hadController||reloading)return;reloading=true;location.reload()});
  navigator.serviceWorker.register("./sw.js").then(reg=>{
    const offer=w=>{
      if(!w||!hadController||$("#sk-update"))return;
      const bar=document.createElement("div");bar.id="sk-update";bar.className="sk-update";bar.setAttribute("role","status");
      bar.innerHTML='<span>نسخة أحدث من S.kosif جاهزة.</span><button type="button" class="btn sm primary">تحديث الآن</button>';
      bar.querySelector("button").onclick=()=>w.postMessage({type:"SKIP_WAITING"});
      ($(".maincol")||document.body).insertBefore(bar,$(".main"));
    };
    if(reg.waiting)offer(reg.waiting);
    reg.addEventListener("updatefound",()=>{const w=reg.installing;if(w)w.addEventListener("statechange",()=>{if(w.state==="installed")offer(w)})});
  }).catch(e=>SK.errors.report(e,"sw",{silent:true}));
}

/* ---------- settings: appearance, security, role, full backup ---------- */
function settingsCards(root){
  if(!root||root.querySelector("#skx-prefs"))return;
  const p=prefs(),lock=SK.num(load(SK.lock.key,0)),role=SK.perm.role(),isAdmin=role==="admin";
  const seg=(name,cur,opts)=>'<div class="sk-seg" role="group" data-pref="'+name+'">'+opts.map(([v,l])=>'<button type="button" data-v="'+v+'" aria-pressed="'+(v===cur)+'">'+l+'</button>').join("")+'</div>';
  const html=
  '<section class="card" id="skx-prefs"><div class="card-h"><div><h3>المظهر والأمان</h3><p>نظام تصميم واحد «تراث الوادي» بوضعين، والقفل التلقائي لهذا الجهاز.</p></div></div><div class="card-b sk-stack">'+
    '<div class="sk-grid-2"><div class="sk-field"><span>المظهر</span>'+seg("appearance",p.appearance,[["light","نهاري"],["dark","ليلي"],["auto","حسب الجهاز"]])+'</div>'+
    '<div class="sk-field"><span>كثافة الواجهة</span>'+seg("density",p.density,[["cozy","مريحة"],["compact","مضغوطة"]])+'</div></div>'+
    '<div class="sk-actions"><label class="sk-field" style="flex:1;min-width:200px"><span>القفل التلقائي بعد عدم النشاط</span><select id="skx-lock">'+
      [[0,"متوقف"],[5,"5 دقائق"],[15,"15 دقيقة"],[30,"30 دقيقة"],[60,"ساعة"]].map(o=>'<option value="'+o[0]+'"'+(o[0]===lock?' selected':'')+'>'+o[1]+'</option>').join("")+
    '</select></label><button type="button" class="btn sk-end" id="skx-lock-now">قفل الآن</button></div></div></section>'+
  '<section class="card" id="skx-role"><div class="card-h"><div><h3>الدور والصلاحيات</h3><p>الدور يحدد الشاشات الظاهرة والإجراءات المسموحة على هذا الجهاز. الحماية بين المستخدمين في مساحة عمل مشتركة تتم عبر «الصلاحيات ومساحات العمل».</p></div></div><div class="card-b sk-stack">'+
    '<div class="sk-seg" role="group" id="skx-roles">'+SK.perm.list().map(r=>'<button type="button" data-role="'+r.id+'" aria-pressed="'+(r.id===role)+'"'+(isAdmin||r.id===role?'':' disabled')+'>'+esc(r.label)+'</button>').join("")+'</div>'+
    (isAdmin?'':'<p class="sk-note">تغيير الدور متاح لدور «مدير النظام» فقط.</p>')+
    '<div class="sk-actions"><button type="button" class="btn" id="skx-audit-csv">تصدير سجل التدقيق</button><span class="hint">'+SK.audit.all().length+' حدثاً مسجلاً على هذا الجهاز</span></div></div></section>'+
  '<section class="card" id="skx-backup"><div class="card-h"><div><h3>نسخة كاملة للتطبيق</h3><p>كل بياناتك في ملف واحد: الأسعار والعملاء والمبيعات والطلبات والمخزون والموردون والتقارير. الاستعادة تعرض ما سيتغير أولاً، وتحتفظ بنقطة رجوع.</p></div></div><div class="card-b sk-stack">'+
    '<div class="sk-actions"><button type="button" class="btn primary" id="skx-bk">تنزيل نسخة كاملة</button><label class="btn" style="cursor:pointer">استعادة من ملف…<input type="file" id="skx-rs" accept=".json,application/json" hidden></label>'+
    '<button type="button" class="btn" id="skx-rb"'+(SK.store.hasSnapshot()?'':' hidden')+'>التراجع عن آخر استعادة</button></div>'+
    '<div id="skx-bk-out" class="hint">'+usageText()+'</div></div></section>';
  root.insertAdjacentHTML("afterbegin",html);
  $$("[data-pref]",root).forEach(g=>g.addEventListener("click",e=>{const b=e.target.closest("button[data-v]");if(!b)return;
    const k=g.dataset.pref;if(k==="appearance")setAppearance(b.dataset.v);else{setPref(k,b.dataset.v);SK.toast(b.dataset.v==="compact"?"واجهة مضغوطة":"واجهة مريحة","info")}
    $$("button",g).forEach(x=>x.setAttribute("aria-pressed",String(x===b)))}));
  $("#skx-lock",root).onchange=e=>{save(SK.lock.key,SK.num(e.target.value));SK.lock.touch();SK.toast(SK.num(e.target.value)?"القفل التلقائي: "+e.target.selectedOptions[0].text:"أُوقف القفل التلقائي","info")};
  $("#skx-lock-now",root).onclick=()=>SK.lock.now();
  $("#skx-roles",root).addEventListener("click",e=>{const b=e.target.closest("button[data-role]");if(!b||b.disabled)return;
    if(SK.perm.setRole(b.dataset.role)){SK.toast("الدور الحالي: "+SK.perm.label(),"ok");lastSig="";core().go("settings")}});
  $("#skx-audit-csv",root).onclick=()=>SK.audit.csv();
  const out=$("#skx-bk-out",root);
  $("#skx-bk",root).onclick=async()=>{out.textContent="جارٍ تجهيز النسخة…";try{const c=await SK.store.backup();out.textContent="تم تنزيل النسخة: "+c.keys+" مفتاحاً و"+Object.values(c.rows).reduce((a,b)=>a+b,0)+" سجلاً."}catch(e){out.textContent="";SK.errors.report(e,"backup")}};
  $("#skx-rs",root).onchange=async e=>{
    const f=e.target.files&&e.target.files[0];e.target.value="";if(!f)return;
    try{
      const p=await SK.store.restore(f,{dryRun:true});
      const rows=Object.entries(p.rows).filter(([,n])=>n).map(([k,n])=>k+": "+n).join("، ")||"لا سجلات قاعدة بيانات";
      const msg="نسخة بتاريخ "+String(p.createdAt||"غير معروف").slice(0,16).replace("T"," ")+"\n"+
        "مفاتيح جديدة: "+p.keys.add.length+" · ستتغير: "+p.keys.change.length+" · مطابقة: "+p.keys.same.length+"\n"+
        "سجلات قاعدة البيانات (تستبدل الحالية): "+rows+"\n"+
        "مفاتيح غير موجودة في الملف تبقى كما هي: "+p.untouched.length+"\n\nسيُحتفظ بنقطة رجوع قبل الكتابة.";
      if(!await SK.confirm(msg,{title:"معاينة الاستعادة (تجربة دون كتابة)",ok:"استعادة الآن"}))return;
      await SK.store.restore(f);
      out.innerHTML='تمت الاستعادة. <button type="button" class="btn sm" id="skx-snap">تنزيل نقطة الرجوع</button> <button type="button" class="btn sm primary" id="skx-reload">إعادة التحميل لتطبيقها</button>';
      $("#skx-rb",root).hidden=false;
      $("#skx-snap",root).onclick=()=>SK.store.downloadSnapshot();
      $("#skx-reload",root).onclick=()=>location.reload();
    }catch(err){SK.errors.report(err,"restore")}
  };
  $("#skx-rb",root).onclick=async()=>{if(!await SK.confirm("إرجاع البيانات كما كانت قبل آخر استعادة؟",{ok:"تراجع"}))return;try{await SK.store.rollback();SK.toast("تم التراجع — أعد التحميل","ok");setTimeout(()=>location.reload(),900)}catch(e){SK.errors.report(e,"rollback")}};
}
function usageText(){const u=SK.store.usage();return "على هذا الجهاز: "+u.keys+" مفتاح بيانات (~"+(u.bytes/1024).toFixed(0)+" ك.ب) + قاعدة بيانات العملاء والمبيعات."}

/* ---------- phones: customer cards instead of a wide table ---------- */
function customerCards(root){
  if(!root||!matchMedia("(max-width:760px)").matches)return;
  const wrap=root.querySelector(".customer-table"),body=wrap&&wrap.querySelector("table tbody");if(!body)return;
  const rows=[...body.rows].filter(r=>r.cells.length>=7);
  let list=wrap.parentElement.querySelector(":scope > .sk-customer-list");
  if(!list){list=document.createElement("div");list.className="sk-customer-list";wrap.before(list)}
  list.innerHTML=rows.map(r=>{const c=r.cells;return '<article class="sk-customer-card"><div class="sk-cc-head"><b>'+c[0].innerHTML+'</b><span dir="ltr">'+esc(c[1].textContent.trim())+'</span></div>'+
    '<dl><div><dt>الموقع</dt><dd>'+c[2].innerHTML+'</dd></div><div><dt>المشتريات</dt><dd>'+esc(c[3].textContent.trim())+'</dd></div><div><dt>آخر شراء</dt><dd>'+esc(c[5].textContent.trim())+'</dd></div><div><dt>التفاصيل</dt><dd>'+c[6].innerHTML+'</dd></div></dl>'+
    '<div class="sk-cc-actions">'+(c[7]?c[7].innerHTML:"")+'</div></article>'}).join("");
}

window.SKosifShell=Object.freeze({paint,toggleAppearance,setAppearance,prefs,resolved});

function boot(){
  const c=core();
  SK._flush();
  if(c){
    c.setAdvanced(SK.caps.advancedIds());
    c.onView("settings",settingsCards);
    c.onView("customers",customerCards);
  }
  addEventListener("sk:render",gate);
  addEventListener("resize",()=>{if(innerWidth>900){const r=$("#rail");if(r&&r.classList.contains("open")&&c)c.act("rail-close")}},{passive:true});
  addEventListener("online",offline);addEventListener("offline",offline);offline();
  SK.bus.on("role",()=>{lastSig="";paint()});
  paint();gate();updates();
  Object.freeze(window.SK);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();
