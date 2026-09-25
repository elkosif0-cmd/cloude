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
const ADV_NOTE="الأدوات المتقدمة ظاهرة داخل كل مجال — أخفها من «التشغيل اليومي».";

/* ---------- preferences: theme (look) + density ----------
   look: heritage (default) | heritage-night | executive | audit | midnight | notebook | auto (heritage by day / night by device) */
const LOOKS=[
  ["heritage","تراث الوادي","الهوية الافتراضية: رَقّ وحبر بني ورسوم الوادي",["#f4ead8","#8a5a2b","#efe2cc","#2b1a0f"]],
  ["heritage-night","ليل الوادي","نفس الهوية بإضاءة ليلية",["#16110c","#d09a5e","#201811","#f4ead8"]],
  ["executive","التنفيذي","مساحة فاتحة، بنفسجي وأزرق، أرقام قوية",["#f5f6fb","#5b4ee6","#3d7bf5","#1d2340"]],
  ["audit","المراجعة الاحترافية","كثيف ورصين للجداول والأدلة",["#f3f4f6","#1f3b68","#172235","#161b26"]],
  ["midnight","ليل التحليل","داكن للوحات والجلسات الطويلة",["#0d1117","#7c8cff","#4fd1c5","#e8edf5"]],
  ["notebook","الدفتر","ورق مسطّر وعناوين بخط اليد",["#f7f3e8","#2c5aa0","#c0392b","#23252b"]],
  ["auto","حسب الجهاز","تراث الوادي نهاراً وليل الوادي ليلاً",["#f4ead8","#8a5a2b","#16110c","#d09a5e"]]];
const DARK=new Set(["heritage-night","midnight"]);
function prefs(){return Object.assign({look:"heritage",density:"cozy",lastLight:"heritage"},load(PREF_KEY,{}))}
function migrate(){
  const p=load(PREF_KEY,null);
  if(p&&p.migrated&&p.look)return;
  const out=Object.assign({look:"heritage",density:"cozy",migrated:1},p||{});
  try{
    if(!out.look||out.appearance){out.look=out.appearance==="dark"?"heritage-night":out.appearance==="auto"?"auto":"heritage";delete out.appearance}
    if(!p){
      const oldTheme=load("skosif_theme",""),dark=["royal","notte","cyber"].includes(oldTheme),v12=localStorage.getItem("aghnam-v12-theme");
      out.look=dark||(!oldTheme&&v12==="dark")?"heritage-night":"heritage";
      if(localStorage.getItem("aghnam-v21-density")==="compact")out.density="compact";
    }
    ["skosif_theme","skosif_theme_dark","skosif_theme_light","aghnam-v21-accent","aghnam-v21-density","aghnam-v21-tour","aghnam-v21-whatsnew","aghnam-v21-ux-v1","aghnam-v203-magic-v1"].forEach(k=>localStorage.removeItem(k));
  }catch{}
  save(PREF_KEY,out);
}
const mq=matchMedia("(prefers-color-scheme: dark)");
function lookNow(){const l=prefs().look;return l==="auto"?(mq.matches?"heritage-night":"heritage"):(LOOKS.some(x=>x[0]===l)?l:"heritage")}
function resolved(){return DARK.has(lookNow())?"dark":"light"}
function fonts(look){
  if(look.startsWith("heritage")||document.getElementById("sk-font-plex"))return;
  const l=document.createElement("link");l.id="sk-font-plex";l.rel="stylesheet";
  l.href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;700&display=swap";document.head.appendChild(l);
}
function applyPrefs(){
  const de=document.documentElement,look=lookNow(),mode=resolved(),p=prefs();
  de.setAttribute("data-look",look==="heritage-night"?"heritage":look);
  de.setAttribute("data-theme",mode);de.setAttribute("data-density",p.density==="compact"?"compact":"cozy");
  fonts(look);
  try{localStorage.setItem("aghnam-v12-theme",mode)}catch{}
  const bar=getComputedStyle(de).getPropertyValue("--sk-rail").trim()||(mode==="dark"?"#1b140e":"#efe2cc");
  $$('meta[name="theme-color"]').forEach(m=>m.setAttribute("content",bar));
}
function setPref(k,v){const p=prefs();p[k]=v;save(PREF_KEY,p);applyPrefs()}
function setLook(l){const p=prefs();if(!LOOKS.some(x=>x[0]===l))l="heritage";p.look=l;if(!DARK.has(l)&&l!=="auto")p.lastLight=l;save(PREF_KEY,p);applyPrefs();SK.toast("المظهر: "+LOOKS.find(x=>x[0]===l)[1],"info")}
/* the topbar moon button: light look ↔ its night counterpart */
function toggleAppearance(){const cur=lookNow(),p=prefs();if(DARK.has(cur))setLook(p.lastLight||"heritage");else setLook(cur==="heritage"?"heritage-night":"midnight")}
const setAppearance=a=>setLook(a==="dark"?"heritage-night":a==="auto"?"auto":"heritage");
mq.addEventListener&&mq.addEventListener("change",()=>{if(prefs().look==="auto")applyPrefs()});
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
  let html="";
  SK.caps.groups().forEach(g=>{
    const items=SK.caps.inGroup(g.id).filter(c=>(adv||c.primary||c.id===cur)&&SK.perm.can(c.id));
    if(!items.length)return;
    html+='<div class="skn-group" role="group" aria-label="'+esc(g.label)+'"><div class="nav-group"><span>'+esc(g.label)+'</span></div>'+
      items.map(c=>navButton(c,cur)).join("")+'</div>';
  });
  if(adv)html+='<p class="skn-note">'+ADV_NOTE+'</p>';
  if(html!==lastSig||!nav.querySelector(".skn-group")){nav.innerHTML=html;lastSig=html}
}
/* domain tab bar on top of every screen: sibling screens of the same domain */
function domainTabs(){
  const c=core();if(!c)return;const v=$("#view");if(!v)return;
  const old=v.querySelector(":scope > .skn-domain");
  const id=c.view(),cap=SK.caps.get(id);
  const adv=c.mode()==="advanced";
  const sibs=cap?SK.caps.siblings(id).filter(x=>(adv||x.primary||x.id===id)&&SK.perm.can(x.id)):[];
  if(sibs.length<2){if(old)old.remove();return}
  const html='<nav class="skn-domain" aria-label="'+esc(cap.groupLabel)+'">'+sibs.map(x=>'<button type="button" data-act="nav" data-v="'+x.id+'"'+(x.id===id?' aria-current="page"':'')+'>'+(SK.icons[x.id]||c.navIcon(x.id)||"")+'<span>'+esc(x.label)+'</span>'+(x.primary?'':'<i>متقدم</i>')+'</button>').join("")+'</nav>';
  if(old){if(old.outerHTML!==html)old.outerHTML=html}else v.insertAdjacentHTML("afterbegin",html);
  const on=v.querySelector(".skn-domain [aria-current]");if(on&&on.scrollIntoView)on.scrollIntoView({block:"nearest",inline:"nearest"});
}
function paintTop(){
  const c=core();if(!c)return;
  const cap=SK.caps.get(c.view());
  const t=$("#pg-title"),cr=$("#pg-crumb");
  if(cap){if(t&&t.textContent!==cap.label)t.textContent=cap.label;if(cr)cr.textContent=cap.groupLabel+(cap.primary?"":" · متقدم")}
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
  '<section class="card" id="skx-prefs"><div class="card-h"><div><h3>المظهر والأمان</h3><p>نظام تصميم واحد بستة ثيمات كاملة، والقفل التلقائي لهذا الجهاز.</p></div></div><div class="card-b sk-stack">'+
    '<div class="sk-field"><span>الثيم — يغيّر شكل التطبيق كله دون أي تغيير في البيانات</span><div class="skx-themes" id="skx-themes">'+LOOKS.map(([id,name,desc,c])=>'<button type="button" class="skx-theme" data-look="'+id+'" aria-pressed="'+(p.look===id)+'"><span class="sw">'+c.map(x=>'<i style="background:'+x+'"></i>').join("")+'</span><b>'+esc(name)+'</b><small>'+esc(desc)+'</small></button>').join("")+'</div></div>'+
    '<div class="sk-field"><span>كثافة الواجهة</span>'+seg("density",p.density,[["cozy","مريحة"],["compact","مضغوطة"]])+'</div>'+
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
    setPref(g.dataset.pref,b.dataset.v);SK.toast(b.dataset.v==="compact"?"واجهة مضغوطة":"واجهة مريحة","info");
    $$("button",g).forEach(x=>x.setAttribute("aria-pressed",String(x===b)))}));
  $("#skx-themes",root).addEventListener("click",e=>{const b=e.target.closest("[data-look]");if(!b)return;setLook(b.dataset.look);$$("[data-look]",root).forEach(x=>x.setAttribute("aria-pressed",String(x===b)))});
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

window.SKosifShell=Object.freeze({paint,toggleAppearance,setAppearance,setLook,looks:()=>LOOKS.map(x=>({id:x[0],name:x[1]})),prefs,resolved});

function boot(){
  const c=core();
  SK._flush();
  if(c){
    c.setAdvanced(SK.caps.advancedIds());
    c.onView("settings",settingsCards);
    c.onView("customers",customerCards);
  }
  addEventListener("sk:render",()=>{gate();domainTabs()});
  addEventListener("resize",()=>{if(innerWidth>900){const r=$("#rail");if(r&&r.classList.contains("open")&&c)c.act("rail-close")}},{passive:true});
  addEventListener("online",offline);addEventListener("offline",offline);offline();
  SK.bus.on("role",()=>{lastSig="";paint()});
  paint();gate();updates();
  Object.freeze(window.SK);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();
