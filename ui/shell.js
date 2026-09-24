/* S.kosif — shared shell for the app's own screens.
   Every tool is a normal screen in the side menu (registered through
   SKosifCore.registerView). No floating buttons, docks or overlay hubs.
   This file holds what the screens share: helpers, nav icons, themes,
   auto-lock, safe CSV and the update notice. */
(()=>{
"use strict";
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const num=v=>{const n=Number(String(v??"").replace(/,/g,""));return Number.isFinite(n)?n:0};
const load=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v??d}catch{return d}};
const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}};
const nf2=new Intl.NumberFormat("ar-SA-u-nu-latn",{minimumFractionDigits:2,maximumFractionDigits:2});
const money=v=>nf2.format(Number(v)||0)+" ر.س";
const pct=v=>new Intl.NumberFormat("ar-SA-u-nu-latn",{maximumFractionDigits:1}).format(Number(v)||0)+"٪";
const core=()=>window.SKosifCore;
function toast(msg,type){const c=core();if(c)c.toast(msg,type);else console.info(msg)}

/* ---------- أيقونات القائمة ---------- */
const SV=p=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>';
const ICONS={
  offers:SV('<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/>'),
  inventory:SV('<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>'),
  suppliers:SV('<path d="M3 17h2l2-9h11l2 9h1"/><circle cx="8" cy="19" r="1.6"/><circle cx="17" cy="19" r="1.6"/><path d="M9 8V5h6v3"/>'),
  cash:SV('<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9v.01M18 15v.01"/>'),
  receivables:SV('<path d="M12 8v4l2.5 2.5"/><circle cx="12" cy="12" r="8.5"/>'),
  jev:SV('<path d="M12 3a6 6 0 0 1 6 6c0 2.3-1.2 3.8-2.5 5-.8.8-1.5 1.6-1.5 3h-4c0-1.4-.7-2.2-1.5-3C7.2 12.8 6 11.3 6 9a6 6 0 0 1 6-6z"/><path d="M10 21h4"/>'),
  sensitivity:SV('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
  kernel:SV('<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>'),
  carcass:SV('<path d="M4 14c0-5 4-9 9-9 4 0 7 3 7 6 0 4-4 8-9 8-4 0-7-2-7-5z"/><path d="M9 11c1.5 1 3.5 1 5 0"/>'),
  smartmatch:SV('<path d="M4 7h11M4 12h7M4 17h11"/><path d="m16 14 2.5 2.5L22 12"/>'),
  excelrecon:SV('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>')
};

/* ---------- تسجيل الشاشات ---------- */
const pending=[];
function view(id,def){
  const d={...def,icon:def.icon||ICONS[id]||""};
  if(core()&&core().registerView)core().registerView(id,d);else pending.push([id,d]);
}
function flush(){while(pending.length&&core()){const [id,d]=pending.shift();core().registerView(id,d)}}

/* ---------- CSV آمن (يمنع حقن الصيغ في Excel) ---------- */
function safeCell(v){let s=v==null?"":String(v);if(/^[=+\-@\t\r]/.test(s))s="'"+s;if(/[",\n\r]/.test(s))s='"'+s.replace(/"/g,'""')+'"';return s}
function csv(headers,rows){return "﻿"+[headers,...rows].map(r=>r.map(safeCell).join(",")).join("\r\n")}
function downloadCsv(name,headers,rows){
  const blob=new Blob([csv(headers,rows)],{type:"text/csv;charset=utf-8"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name.endsWith(".csv")?name:name+".csv";a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}

/* ---------- حجب البيانات الشخصية قبل أي إرسال لـ Jev ---------- */
function redact(text){
  let s=String(text??"");
  s=s.replace(/\b[A-Z]{2}\d{2}[A-Z0-9]{10,30}\b/gi,"[IBAN]");
  s=s.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,"[EMAIL]");
  s=s.replace(/(?:\+?966[\s-]?5\d|05\d)(?:[\s-]?\d){7,8}\b/g,"[PHONE]");
  s=s.replace(/\b(?:\d[\s-]?){10,15}\b/g,"[ID]");
  return s;
}

/* ---------- الثيمات: نظام واحد للتطبيق كله ----------
   «الأصلي» لا يغيّر شيئاً. كل ثيم آخر يعيد تعريف متغيرات الألوان التي
   يبني عليها التطبيق (الأرضية، الأسطح، الحبر، الهوية، الشريط الجانبي). */
const THEME_KEY="skosif_theme";
const THEMES=[
  {id:"",name:"الأصلي",desc:"بنفسجي هادئ وشريط كحلي",dark:false,c:{bg:"#edf0fa",s:"#ffffff",s2:"#f7f8fd",s3:"#eff1f8",ink:"#1d2a4d",ink2:"#4d5670",ink3:"#8a91a8",line:"#e7eaf3",pri:"#5b3fd6",pri2:"#7859d4",soft:"#efebfd",side:"#2c3048",side2:"#33374f",sink:"#d5d8e6",smute:"#8d92ab"}},
  {id:"eataly",name:"إيتالي الذواقة",desc:"عاجي دافئ وإسبريسو وعنابي",dark:false,c:{bg:"#faf8f5",s:"#ffffff",s2:"#f6f2ea",s3:"#efe9de",ink:"#1e201d",ink2:"#4a4e46",ink3:"#82877e",line:"#e8e3d8",pri:"#a82a2a",pri2:"#c28b28",soft:"#f7e9e4",side:"#1e201d",side2:"#2a2c28",sink:"#ede7dc",smute:"#9a9c94"}},
  {id:"sinam",name:"سِنام الأصيل",desc:"أحجار الصحراء وعنابي ملكي ونحاسي",dark:false,c:{bg:"#fdfbf7",s:"#ffffff",s2:"#f8f3ea",s3:"#f1e9db",ink:"#291a10",ink2:"#5a4636",ink3:"#8c7a6b",line:"#eadfcf",pri:"#881337",pri2:"#c2410c",soft:"#f9e7ec",side:"#291a10",side2:"#37251a",sink:"#f3e8da",smute:"#a89080"}},
  {id:"pasture",name:"المراعي الخضراء",desc:"زمردي طبيعي ولمسة ذهبية",dark:false,c:{bg:"#f2f9f5",s:"#ffffff",s2:"#eaf5ef",s3:"#ddeee4",ink:"#0f291e",ink2:"#3b5a4c",ink3:"#6f8c7e",line:"#d5e8dd",pri:"#047857",pri2:"#d97706",soft:"#e3f6ee",side:"#0f291e",side2:"#173a2b",sink:"#ddf1e6",smute:"#86a898"}},
  {id:"amber",name:"الزعفران والتوابل",desc:"كستناء محمص وزعفران ذهبي",dark:false,c:{bg:"#fffdf7",s:"#ffffff",s2:"#fbf4e6",s3:"#f5ead3",ink:"#331a05",ink2:"#664425",ink3:"#97785a",line:"#efe2c8",pri:"#b45309",pri2:"#d97706",soft:"#fcefd9",side:"#331a05",side2:"#45260c",sink:"#f8ebd5",smute:"#b09474"}},
  {id:"graphite",name:"الرخام والغرافيت",desc:"أبيض ناصع ورمادي غرافيتي",dark:false,c:{bg:"#f6f6f7",s:"#ffffff",s2:"#f4f4f5",s3:"#e9e9ec",ink:"#18181b",ink2:"#3f3f46",ink3:"#71717a",line:"#e4e4e7",pri:"#27272a",pri2:"#4f46e5",soft:"#eef0fb",side:"#18181b",side2:"#27272a",sink:"#f4f4f5",smute:"#a1a1aa"}},
  {id:"lavender",name:"خزامى نجد",desc:"بنفسجي ملكي وخزامى برية",dark:false,c:{bg:"#faf7fd",s:"#ffffff",s2:"#f4eefb",s3:"#ebe2f6",ink:"#2d1445",ink2:"#5b4476",ink3:"#8d7aa3",line:"#e6dcf2",pri:"#7e22ce",pri2:"#be185d",soft:"#f3e8ff",side:"#2d1445",side2:"#3b1d59",sink:"#f1e8fb",smute:"#a591bd"}},
  {id:"qahwa",name:"القهوة النجدية",desc:"موكا وهيل وأخضر النخيل",dark:false,c:{bg:"#f9f6f0",s:"#ffffff",s2:"#f4eee3",s3:"#ebe2d2",ink:"#2c180e",ink2:"#5c4232",ink3:"#8d7766",line:"#e7dccb",pri:"#6c2e12",pri2:"#b45309",soft:"#f5e8df",side:"#2c180e",side2:"#3b2216",sink:"#f2e6d8",smute:"#a68c79"}},
  {id:"royal",name:"الفخامة الملكية",desc:"كحلي داكن وياقوتي وذهب",dark:true,c:{bg:"#0f172a",s:"#16213a",s2:"#1c2946",s3:"#243353",ink:"#f8fafc",ink2:"#cbd5e1",ink3:"#94a3b8",line:"#2a3a5c",pri:"#3b82f6",pri2:"#f59e0b",soft:"#1e2f57",side:"#0b1222",side2:"#131d33",sink:"#e2e8f0",smute:"#7c8ba5"}},
  {id:"notte",name:"ليل الذواقة",desc:"إسبريسو داكن ونحاس عتيق",dark:true,c:{bg:"#141312",s:"#1d1b19",s2:"#252220",s3:"#2e2a27",ink:"#faf7f2",ink2:"#d8d0c4",ink3:"#a39a8e",line:"#3a3531",pri:"#d84d4d",pri2:"#e5ac44",soft:"#3a2222",side:"#0e0d0c",side2:"#1a1817",sink:"#ede6db",smute:"#8f877c"}},
  {id:"cyber",name:"سايبر أوبسيديان",desc:"حجر السج وتركواز وبنفسجي",dark:true,c:{bg:"#09090b",s:"#121216",s2:"#18181d",s3:"#202027",ink:"#f4f4f5",ink2:"#d4d4d8",ink3:"#a1a1aa",line:"#2a2a33",pri:"#14b8a6",pri2:"#8b5cf6",soft:"#0f2e2c",side:"#050507",side2:"#101014",sink:"#e4e4e7",smute:"#7a7a85"}}
];
const themeById=id=>THEMES.find(t=>t.id===id)||THEMES[0];
function themeNow(){const t=load(THEME_KEY,"");return THEMES.some(x=>x.id===t)?t:""}
function themeCSS(t){
  const c=t.c,R='html[data-sk-theme]:not(#sk)';
  return R+'{color-scheme:'+(t.dark?'dark':'light')+
    ';--ground:'+c.bg+';--surface:'+c.s+';--surface-2:'+c.s2+';--surface-3:'+c.s3+';--fill-2:'+c.s3+
    ';--ink:'+c.ink+';--ink-2:'+c.ink2+';--ink-3:'+c.ink3+';--line:'+c.line+';--line-2:'+c.line+
    ';--brand:'+c.pri+';--brand-2:'+c.pri2+';--brand-soft:'+c.soft+';--brand-ink:#fff;--focus:'+c.pri+
    ';--rail:'+c.side+';--rail-2:'+c.side2+';--rail-ink:'+c.sink+';--rail-ink-2:'+c.smute+';--rail-line:rgba(255,255,255,.07)'+
    ';--glass:'+c.s+';--glass-line:'+c.line+
    ';--f-side:'+c.side+';--f-side-2:'+c.side2+';--f-side-ink:'+c.sink+';--f-side-mute:'+c.smute+
    ';--f-bg:'+c.bg+';--f-card:'+c.s+';--f-ink:'+c.ink+';--f-ink2:'+c.ink2+';--f-ink3:'+c.ink3+';--f-line:'+c.line+
    ';--f-pri:'+c.pri+';--f-pri2:'+c.pri2+';--f-search:'+c.s3+';--f-purple:linear-gradient(135deg,'+c.pri+' 0%,'+c.pri2+' 100%)'+
    ';--v21-ga:'+c.pri+';--v21-gb:'+c.pri2+';--v21-ac:'+c.pri+
    ';--sk-pri:'+c.pri+';--sk-pri2:'+c.pri2+'}\n'+
  R+' body,'+R+' .app,'+R+' .maincol{background:'+c.bg+'!important;color:'+c.ink+'}\n'+
  R+' .rail{background:'+c.side+'!important}\n'+
  R+' .rail .brand h1::after{color:'+c.pri2+'!important}\n'+
  R+' .brand-mark{background:linear-gradient(160deg,'+c.pri2+','+c.pri+')!important}\n'+
  R+' .nav-btn[aria-current="page"]{background:linear-gradient(135deg,'+c.pri+','+c.pri2+')!important;color:#fff!important;box-shadow:none!important}\n'+
  R+' .modeseg button[aria-pressed="true"]{background:'+c.pri+'!important;color:#fff!important}\n'+
  R+' .btn.primary,'+R+' .v24-date{background:'+c.pri+'!important;border-color:'+c.pri+'!important;color:#fff!important}\n'+
  R+' .topbar,'+R+' .card,'+R+' .dlg{background:'+c.s+'!important;border-color:'+c.line+'!important;color:'+c.ink+'}\n'+
  R+' #v23-topsearch{background:'+c.s3+'!important;color:'+c.ink2+'!important}\n'+
  R+' .seg button[aria-pressed="true"],'+R+' .tabs button[aria-selected="true"]{background:'+c.pri+'!important;color:#fff!important}\n'+
  R+' .v24-dl,'+R+' .v195-teaser,'+R+' .v197-teaser{background:'+c.s+'!important;color:'+c.ink+'!important;border-color:'+c.line+'!important}\n'+
  R+' .t th,'+R+' table th{background:'+c.s2+'!important;color:'+c.ink2+'!important;border-color:'+c.line+'!important}\n'+
  R+' .topbar .v24-ico,'+R+' .topbar .menu-btn,'+R+' #v24-icons svg{color:'+c.ink2+'!important}\n';
}
function applyTheme(id){
  const t=themeById(id??themeNow()),de=document.documentElement;
  let st=document.getElementById("sk-theme-css");
  if(!t.id){de.removeAttribute("data-sk-theme");if(st)st.textContent="";return}
  if(!st){st=document.createElement("style");st.id="sk-theme-css";document.head.appendChild(st)}
  st.textContent=themeCSS(t);
  de.setAttribute("data-sk-theme",t.id);
  de.setAttribute("data-theme",t.dark?"dark":"light");
  try{localStorage.setItem("aghnam-v12-theme",t.dark?"dark":"light")}catch{}
  const m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",t.c.side);
}
function setTheme(id){
  const t=themeById(id);save(THEME_KEY,t.id);
  if(t.id)save(t.dark?"skosif_theme_dark":"skosif_theme_light",t.id);
  else{try{localStorage.setItem("aghnam-v12-theme","light")}catch{}document.documentElement.setAttribute("data-theme","light")}
  applyTheme(t.id);
  toast("المظهر: "+t.name,"ok");
}
/* زر الفاتح/الداكن في الشريط العلوي يبدّل بين آخر ثيم فاتح وآخر ثيم داكن */
addEventListener("click",e=>{
  const b=e.target.closest&&e.target.closest('[data-act="v12-theme"]');
  if(!b||!themeNow())return;
  e.preventDefault();e.stopImmediatePropagation();
  setTheme(themeById(themeNow()).dark?load("skosif_theme_light","eataly"):load("skosif_theme_dark","notte"));
},true);

/* ---------- القفل التلقائي ---------- */
const LOCK_KEY="skosif_autolock_min";
function lockNow(){try{sessionStorage.removeItem("aghnamJevSession")}catch{}location.replace("./index.html")}
let last=Date.now();
["pointerdown","keydown","touchstart","wheel"].forEach(ev=>addEventListener(ev,()=>{last=Date.now()},{passive:true,capture:true}));
function idleCheck(){const m=num(load(LOCK_KEY,0));if(m>0&&Date.now()-last>m*60000)lockNow()}
setInterval(idleCheck,30000);
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")idleCheck()});

/* ---------- بطاقة المظهر والقفل داخل «الإعدادات» ---------- */
function settingsCard(root){
  if(!root||root.querySelector("#sk-look"))return;
  const cur=themeNow(),lock=num(load(LOCK_KEY,0));
  root.insertAdjacentHTML("afterbegin",'<section class="card sk-look" id="sk-look"><div class="card-h"><div><h3>المظهر والأمان</h3><p>ثيم واحد يُطبَّق على التطبيق كله، ويُحفظ على هذا الجهاز.</p></div></div><div class="card-b">'+
    '<div class="sk-theme-grid" role="radiogroup" aria-label="ثيم التطبيق">'+THEMES.map(t=>
      '<button type="button" class="sk-theme'+(t.id===cur?' on':'')+'" role="radio" aria-checked="'+(t.id===cur)+'" data-sk-theme-pick="'+t.id+'">'+
      '<span class="sk-theme-sw" style="background:'+t.c.bg+'"><i style="background:'+t.c.side+'"></i><i style="background:'+t.c.pri+'"></i><i style="background:'+t.c.pri2+'"></i></span>'+
      '<b>'+esc(t.name)+(t.dark?' <small>داكن</small>':'')+'</b><span>'+esc(t.desc)+'</span></button>').join("")+'</div>'+
    '<div class="sk-look-row"><label class="sk-field"><span>القفل التلقائي بعد عدم الاستخدام</span><select id="sk-lock-min">'+
      [[0,"متوقف"],[5,"5 دقائق"],[15,"15 دقيقة"],[30,"30 دقيقة"],[60,"ساعة"]].map(o=>'<option value="'+o[0]+'"'+(o[0]===lock?' selected':'')+'>'+o[1]+'</option>').join("")+
    '</select></label><button type="button" class="btn" id="sk-lock-now">قفل الآن</button></div></div></section>');
  $$("[data-sk-theme-pick]",root).forEach(b=>b.onclick=()=>{setTheme(b.dataset.skThemePick);$$("[data-sk-theme-pick]",root).forEach(x=>{const on=x===b;x.classList.toggle("on",on);x.setAttribute("aria-checked",String(on))})});
  $("#sk-lock-min",root).onchange=e=>{save(LOCK_KEY,num(e.target.value));last=Date.now();toast(num(e.target.value)?"القفل التلقائي: "+e.target.selectedOptions[0].text:"أُوقف القفل التلقائي","info")};
  $("#sk-lock-now",root).onclick=lockNow;
}

/* ---------- إشعار التحديث (داخل الصفحة، يظهر فقط عند وجود نسخة أحدث) ---------- */
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
      ($(".maincol")||document.body).prepend(bar);
    };
    if(reg.waiting)offer(reg.waiting);
    reg.addEventListener("updatefound",()=>{const w=reg.installing;if(w)w.addEventListener("statechange",()=>{if(w.state==="installed")offer(w)})});
  }).catch(()=>{});
}

/* ---------- الجوال: زر إغلاق القائمة وبطاقات العملاء ---------- */
function drawerClose(){
  const rail=$("#rail");if(!rail||rail.querySelector(".sk-rail-close"))return;
  const b=document.createElement("button");b.type="button";b.className="sk-rail-close";b.dataset.act="rail-close";b.setAttribute("aria-label","إغلاق القائمة");b.textContent="×";
  rail.prepend(b);
}
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

/* ---------- الواجهة المشتركة ---------- */
function askJev(opts){save("skosif_jev_draft",opts||{});if(core())core().go("jev")}
window.SK=Object.freeze({$,$$,esc,num,load,save,money,pct,toast,view,redact,askJev,
  csv:Object.freeze({cell:safeCell,build:csv,download:downloadCsv}),
  theme:Object.freeze({list:()=>THEMES.map(t=>({id:t.id,name:t.name,dark:t.dark})),current:themeNow,set:setTheme}),
  lock:lockNow,version:"1.0"});

applyTheme();
function boot(){
  flush();drawerClose();applyTheme();
  const c=core();
  if(c){c.onView("settings",settingsCard);c.onView("customers",customerCards)}
  addEventListener("resize",()=>{if(innerWidth>760)$("#rail")?.classList.remove("open")});
  updates();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();
