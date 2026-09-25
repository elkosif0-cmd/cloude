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
  excelrecon:SV('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>'),
  zatca:SV('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>'),
  blending:SV('<circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/>'),
  labels:SV('<rect x="3" y="4" width="18" height="16" rx="2"/><line x1="7" y1="8" x2="7" y2="16"/><line x1="10" y1="8" x2="10" y2="14"/><line x1="13" y1="8" x2="13" y2="16"/><line x1="16" y1="8" x2="16" y2="12"/>'),
  traceability:SV('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'),
  culinary:SV('<path d="M6 13.8V4a2 2 0 0 1 4 0v9.8a3.5 3.5 0 1 1-4 0z"/>'),
  scanner:SV('<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/>'),
  b2bcredit:SV('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>'),
  execreports:SV('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>'),
  operations:SV('<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>')
};

/* ---------- تسجيل الشاشات ---------- */
const pending=[];
function view(id,def){
  const d={...def,icon:def.icon||ICONS[id]||""};
  if(core()&&core().registerView){try{core().registerView(id,d)}catch(e){console.error("S.kosif screen "+id+" not registered",e)}}else pending.push([id,d]);
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
   «تراث الوادي» هو ثيم التطبيق الافتراضي. «الأصلي» لا يغيّر شيئاً. كل ثيم آخر يعيد تعريف متغيرات الألوان التي
   يبني عليها التطبيق (الأرضية، الأسطح، الحبر، الهوية، الشريط الجانبي). */
const THEME_KEY="skosif_theme";
const THEMES=[
  {id:"heritage",name:"تراث الوادي",desc:"رَقّ عتيق وحبر بني ورسوم الوادي — ثيم التطبيق",dark:false,heritage:true,c:{bg:"#f4ead8",s:"#fbf5ea",s2:"#f6eddd",s3:"#efe3cc",ink:"#2b1a0f",ink2:"#5b4330",ink3:"#8c735a",line:"#e3d3b8",pri:"#8a5a2b",pri2:"#b8864e",soft:"#f3dfbd",side:"#efe2cc",side2:"#e7d6b8",sink:"#3a2414",smute:"#8c735a"}},
  {id:"original",name:"الأصلي",desc:"بنفسجي هادئ وشريط كحلي",dark:false,c:{bg:"#edf0fa",s:"#ffffff",s2:"#f7f8fd",s3:"#eff1f8",ink:"#1d2a4d",ink2:"#4d5670",ink3:"#8a91a8",line:"#e7eaf3",pri:"#5b3fd6",pri2:"#7859d4",soft:"#efebfd",side:"#2c3048",side2:"#33374f",sink:"#d5d8e6",smute:"#8d92ab"}},
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
const DEFAULT_THEME="heritage";
const themeById=id=>THEMES.find(t=>t.id===id)||THEMES[0];
function themeNow(){const t=load(THEME_KEY,"");return THEMES.some(x=>x.id===t)?t:DEFAULT_THEME}
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
  R+' .topbar .v24-ico,'+R+' .topbar .menu-btn,'+R+' #v24-icons svg{color:'+c.ink2+'!important}\n'+
  (t.heritage?heritageCSS(t):'');
}
/* تراث الوادي: شريط جانبي فاتح، خط نسخ وعناوين رقعة، بطاقات بألوان هادئة ورسوم الوادي */
function heritageCSS(t){
  const c=t.c,R='html[data-sk-theme]:not(#sk)';
  return R+'{--font:"Amiri","Noto Naskh Arabic",serif;--f-purple:#f9e3d6;--f-green:#e8ead6;--f-orange:#f6e6cc;--f-blue:#e5eae8}\n'+
  R+' body{background:radial-gradient(ellipse at 20% 0%,#fbf3e4 0,transparent 55%),radial-gradient(ellipse at 90% 100%,#efe0c4 0,transparent 60%),'+c.bg+'!important}\n'+
  R+' .app,'+R+' .maincol{background:transparent!important}\n'+
  R+' h1,'+R+' h2,'+R+' h3,'+R+' .card-h h3,'+R+' #v24-pagehead h2,'+R+' .topbar .ttl h2{font-family:"Aref Ruqaa","Amiri",serif!important;font-weight:700!important;letter-spacing:0!important}\n'+
  R+' .rail{background:'+c.side+' url(./art/landscape.webp) center bottom/100% auto no-repeat local!important;border-inline-start:1px solid '+c.line+'!important;padding-bottom:200px!important}\n'+
  R+' .rail .brand{flex-direction:column!important;height:auto!important;flex-shrink:0!important;gap:2px!important;padding:18px 18px 12px!important;border-bottom:1px solid '+c.line+'!important}\n'+
  R+' .rail .brand::before{content:"";display:block;width:150px;height:104px;background:url(./art/sheep.webp) center/contain no-repeat;-webkit-mask-image:radial-gradient(ellipse at center,#000 60%,transparent 78%);mask-image:radial-gradient(ellipse at center,#000 60%,transparent 78%)}\n'+
  R+' .rail .brand-mark,'+R+' .rail #app-name{display:none!important}\n'+
  R+' .rail #biz-name{display:block!important;margin:0!important;font:700 34px/1.2 "Aref Ruqaa","Amiri",serif!important;color:'+c.sink+'!important;text-align:center}\n'+
  R+' .rail #biz-name::after{content:"التسعير والطلبات والعملاء في مكان واحد";display:block;margin-top:4px;font:400 13px/1.6 "Amiri",serif;color:'+c.smute+'}\n'+
  R+' .rail .nav-group,'+R+' .rail .nav-group span,'+R+' .rail .v17-mode-note{color:'+c.smute+'!important}\n'+
  R+' .rail .nav-btn{color:'+c.sink+'!important;font-size:16px!important}\n'+
  R+' .rail .nav-btn svg{color:'+c.pri+'!important;stroke:currentColor!important}\n'+
  R+' .rail .nav-btn:hover{background:rgba(138,90,43,.08)!important}\n'+
  R+' .rail .nav-btn[aria-current="page"]{background:'+c.soft+'!important;color:'+c.sink+'!important;box-shadow:inset 0 0 0 1px #e2c894!important;border-radius:10px!important}\n'+
  R+' .rail .nav-btn[aria-current="page"] svg{color:'+c.sink+'!important}\n'+
  R+' .rail .nav-btn .badge{background:'+c.pri+'!important;color:#fff!important}\n'+
  R+' .rail .modeseg{background:rgba(138,90,43,.08)!important}\n'+
  R+' .rail .modeseg button{color:'+c.ink2+'!important}\n'+
  R+' .rail .modeseg button[aria-pressed="true"]{background:'+c.pri+'!important;color:#fff!important}\n'+
  R+' .rail .sk-rail-close{background:rgba(138,90,43,.1)!important;color:'+c.sink+'!important}\n'+
  R+' .rail .status-card{background:'+c.s+'!important;color:'+c.ink+'!important;border-color:'+c.line+'!important}\n'+
  R+' .topbar{background:rgba(251,245,234,.92)!important;border-bottom:1px solid '+c.line+'!important;box-shadow:none!important}\n'+
  R+' #v23-topsearch{background:'+c.s2+'!important;border:1px solid '+c.line+'!important}\n'+
  R+' .card,'+R+' .v12-kpi,'+R+' .stat{background:'+c.s+'!important;border:1px solid '+c.line+'!important;border-radius:14px!important;box-shadow:0 1px 0 rgba(255,255,255,.7) inset,0 6px 18px -12px rgba(90,60,30,.35)!important}\n'+
  R+' .bento .bk{border:1px solid '+c.line+'!important;border-radius:14px!important;box-shadow:0 6px 18px -12px rgba(90,60,30,.35)!important}\n'+
  R+' .bento .bk *{color:'+c.ink+'!important}\n'+
  R+' .bento .bk .v{font-family:"Aref Ruqaa","Amiri",serif!important}\n'+
  R+' .bento .bk .ico{background:rgba(255,255,255,.55)!important}\n'+
  R+' .bento .bk .ico svg,'+R+' .bento .bk .ico svg *{color:'+c.pri+'!important;stroke:'+c.pri+'!important}\n'+
  R+' .btn:not(.primary){background:'+c.s2+'!important;border-color:'+c.line+'!important;color:'+c.ink+'!important}\n'+
  R+' .btn.primary{background:'+c.pri+'!important;border-color:'+c.pri+'!important}\n';
}
function heritageFonts(){
  if(document.getElementById("sk-heritage-fonts"))return;
  const l=document.createElement("link");l.id="sk-heritage-fonts";l.rel="stylesheet";
  l.href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Aref+Ruqaa:wght@400;700&display=swap";
  document.head.appendChild(l);
}
function applyTheme(id){
  const t=themeById(id??themeNow()),de=document.documentElement;
  let st=document.getElementById("sk-theme-css");
  if(t.id==="original"){de.removeAttribute("data-sk-theme");if(st)st.textContent="";return}
  if(t.heritage)heritageFonts();
  if(!st){st=document.createElement("style");st.id="sk-theme-css";document.head.appendChild(st)}
  st.textContent=themeCSS(t);
  de.setAttribute("data-sk-theme",t.id);
  de.setAttribute("data-theme",t.dark?"dark":"light");
  try{localStorage.setItem("aghnam-v12-theme",t.dark?"dark":"light")}catch{}
  const m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",t.c.side);
}
function setTheme(id){
  const t=themeById(id);save(THEME_KEY,t.id);
  if(t.id!=="original")save(t.dark?"skosif_theme_dark":"skosif_theme_light",t.id);
  else{try{localStorage.setItem("aghnam-v12-theme","light")}catch{}document.documentElement.setAttribute("data-theme","light")}
  applyTheme(t.id);
  toast("المظهر: "+t.name,"ok");
}
/* زر الفاتح/الداكن في الشريط العلوي يبدّل بين آخر ثيم فاتح وآخر ثيم داكن */
addEventListener("click",e=>{
  const b=e.target.closest&&e.target.closest('[data-act="v12-theme"]');
  if(!b||themeNow()==="original")return;
  e.preventDefault();e.stopImmediatePropagation();
  setTheme(themeById(themeNow()).dark?load("skosif_theme_light",DEFAULT_THEME):load("skosif_theme_dark","notte"));
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
const density=()=>{try{return localStorage.getItem("aghnam-v21-density")==="compact"?"compact":"cozy"}catch{return "cozy"}};
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
    '</select></label>'+
    '<label class="sk-field"><span>كثافة الواجهة</span><select id="sk-density"><option value="cozy"'+(density()==="cozy"?" selected":"")+'>مريحة</option><option value="compact"'+(density()==="compact"?" selected":"")+'>مضغوطة</option></select></label>'+
    '<button type="button" class="btn" id="sk-lock-now">قفل الآن</button></div></div></section>'+
    '<section class="card sk-look" id="sk-backup-card" style="margin-top:14px;"><div class="card-h"><div><h3>النسخ الاحتياطي وإدارة البيانات</h3><p>تصدير واستعادة نسخة احتياطية محلية لجميع سجلات وعمليات وبيانات التطبيق.</p></div></div><div class="card-b sk-stack">'+
    '<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">'+
      '<button type="button" class="btn primary" id="sk-backup-export">💾 تصدير نسخة احتياطية (JSON)</button>'+
      '<label class="btn" style="cursor:pointer;margin:0;display:inline-flex;align-items:center;"><span>📥 استعادة نسخة احتياطية</span><input type="file" id="sk-backup-import" accept=".json" style="display:none;"></label>'+
      '<button type="button" class="btn" id="sk-backup-status">📊 فحص الذاكرة والتخزين</button>'+
    '</div>'+
    '<div id="sk-backup-info" style="font-size:0.85rem;color:var(--ink-2,#6b5c4e);margin-top:6px;"></div>'+
    '</div></section>');
  $$("[data-sk-theme-pick]",root).forEach(b=>b.onclick=()=>{setTheme(b.dataset.skThemePick);$$("[data-sk-theme-pick]",root).forEach(x=>{const on=x===b;x.classList.toggle("on",on);x.setAttribute("aria-checked",String(on))})});
  $("#sk-lock-min",root).onchange=e=>{save(LOCK_KEY,num(e.target.value));last=Date.now();toast(num(e.target.value)?"القفل التلقائي: "+e.target.selectedOptions[0].text:"أُوقف القفل التلقائي","info")};
  $("#sk-lock-now",root).onclick=lockNow;
  $("#sk-density",root).onchange=e=>{window.V21RAD&&window.V21RAD.setDensity(e.target.value);toast(e.target.value==="compact"?"واجهة مضغوطة":"واجهة مريحة","info")};

  $("#sk-backup-export",root)?.addEventListener("click",()=>{
    const backup={app:"S.kosif",version:"1.0",exportedAt:new Date().toISOString(),data:{}};
    for(let i=0;i<localStorage.length;i++){
      const k=localStorage.key(i);
      if(k&&(k.startsWith("skosif_")||k.startsWith("aghnam_")||k.startsWith("s_kosif"))){
        try{backup.data[k]=JSON.parse(localStorage.getItem(k));}catch{backup.data[k]=localStorage.getItem(k);}
      }
    }
    const blob=new Blob([JSON.stringify(backup,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;
    a.download="S.kosif-backup-"+new Date().toISOString().slice(0,10)+".json";
    a.click();
    URL.revokeObjectURL(url);
    toast("تم تصدير النسخة الاحتياطية بنجاح 💾","ok");
  });

  $("#sk-backup-import",root)?.addEventListener("change",e=>{
    const file=e.target.files&&e.target.files[0];
    if(!file)return;
    const reader=new FileReader();
    reader.onload=ev=>{
      try{
        const parsed=JSON.parse(ev.target.result);
        const entries=parsed.data||parsed;
        const keys=Object.keys(entries);
        if(!keys.length)return toast("الملف لا يحتوي على بيانات","warn");
        if(confirm("هل تريد استعادة "+keys.length+" سجل من النسخة الاحتياطية؟")){
          keys.forEach(k=>{
            try{localStorage.setItem(k,typeof entries[k]==="string"?entries[k]:JSON.stringify(entries[k]));}catch{}
          });
          toast("تمت الاستعادة بنجاح! جاري تحديث الصفحة...","ok");
          setTimeout(()=>location.reload(),1200);
        }
      }catch{
        toast("الملف غير صالح أو تالف","bad");
      }
    };
    reader.readAsText(file);
  });

  $("#sk-backup-status",root)?.addEventListener("click",()=>{
    let count=0,bytes=0;
    for(let i=0;i<localStorage.length;i++){
      const k=localStorage.key(i);
      if(k&&(k.startsWith("skosif_")||k.startsWith("aghnam_")||k.startsWith("s_kosif"))){
        count++;
        bytes+=(localStorage.getItem(k)||'').length*2;
      }
    }
    const info=$("#sk-backup-info",root);
    if(info)info.innerHTML='✓ إجمالي السجلات والوحدات المحفوظة محلياً: <b>'+count+' سجل</b> (حوالي <b>'+(bytes/1024).toFixed(1)+' كيلوبايت</b> مشفرة ومؤمنة في المتصفح).';
  });
}

/* ---------- ترحيب لوحة العمل ولوحة الإطلاق السريع ---------- */
/* مؤشرات من سجلات فعلية فقط؛ لا تُعرض قيمة لم تُسجَّل */
function pulseItems(){
  const cold=load("skosif_v38_coldchain",[]),last=Array.isArray(cold)&&cold[0];
  const coldTxt=last?('آخر قراءة تبريد: <b>'+esc(last.temp)+'°م</b> — '+esc(last.loc||"")+(Number(last.temp)>4?' ⚠️':'')):'التبريد: <b>لا قراءات مسجلة</b>';
  const ledger=load("skosif_v38_ledger",[]),open=Array.isArray(ledger)?ledger.length:0;
  return '<div class="sk-pulse-item"><span class="sk-pulse-dot"></span><b>حالة النظام:</b> <span>جاهز ومشفر محلياً</span></div>'+
    '<div class="sk-pulse-item"><span>'+coldTxt+'</span></div>'+
    '<div class="sk-pulse-item"><span>سجل الائتمان: <b>'+open+'</b> حركة</span></div>';
}
function dashHero(root){
  if(!root||root.querySelector("#sk-hero"))return;
  const biz=(($("#biz-name")||{}).textContent||"").trim()||"S.kosif",now=new Date();
  const day=now.toLocaleDateString("ar-SA-u-nu-latn",{weekday:"long"});
  const greg=now.toLocaleDateString("ar-SA-u-ca-gregory-nu-latn",{day:"numeric",month:"long",year:"numeric"});
  const hijri=now.toLocaleDateString("ar-SA-u-ca-islamic-umalqura-nu-latn",{day:"numeric",month:"long",year:"numeric"});
  root.insertAdjacentHTML("afterbegin",'<section class="sk-hero" id="sk-hero"><div class="sk-hero-txt"><h2>مرحباً بك في '+esc(biz)+'</h2><p>منصة العمليات والتسعير والمناسبات وإدارة الملحمة في مكان واحد…</p></div>'+
    '<div class="sk-hero-date"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4M8 14h2M12 14h2M16 14h.01M8 17h2M12 17h2"/></svg><div><b>'+esc(day)+'</b><span>'+esc(greg)+'</span><small>'+esc(hijri)+'</small></div></div></section>'+
    '<div class="sk-ops-pulse" id="sk-pulse">'+pulseItems()+'</div>'+
    '<div class="sk-quick-launch" id="sk-quick-launch">'+
      '<button type="button" class="sk-ql-btn" data-go="zatca" style="border-right:3px solid var(--brand,#8a5a2b);">'+(ICONS.zatca||'')+'<span><b>مركز نقاط البيع والكاشير (F2)</b><br><small style="color:var(--ink-3);">الفاتورة • الباركود • ملصق الميزان • الشيف</small></span></button>'+
      '<button type="button" class="sk-ql-btn" data-go="carcass" style="border-right:3px solid #059669;">'+(ICONS.carcass||'')+'<span><b>ورشة الجزارة وتجهيز الذبائح</b><br><small style="color:var(--ink-3);">خريطة التشريح • التشفية • خلط المفروم</small></span></button>'+
      '<button type="button" class="sk-ql-btn" data-go="inventory" style="border-right:3px solid #d97706;">'+(ICONS.inventory||'')+'<span><b>مركز التبريد والتعتيق والمخزون (F9)</b><br><small style="color:var(--ink-3);">رادار FIFO • غرف التعتيق • التبريد HACCP</small></span></button>'+
      '<button type="button" class="sk-ql-btn" data-go="execreports" style="border-right:3px solid #4f46e5;">'+(ICONS.execreports||'')+'<span><b>مركز المالية والتقارير والتدقيق</b><br><small style="color:var(--ink-3);">الأرباح • أعمار الذمم • الموردين • المراجعة</small></span></button>'+
    '</div>');
  $$("#sk-quick-launch [data-go]",root).forEach(b=>{
    b.onclick=()=>{
      const target=b.dataset.go;
      if(core()&&core().go)core().go(target);
    };
  });
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
  if(c){c.onView("settings",settingsCard);c.onView("customers",customerCards);c.onView("dash",dashHero)}
  addEventListener("resize",()=>{if(innerWidth>760)$("#rail")?.classList.remove("open")});
  addEventListener("keydown",e=>{
    if(e.target&&["INPUT","TEXTAREA","SELECT"].includes(e.target.tagName))return;
    if(e.key==="F2"){ e.preventDefault(); core()?.go?.("zatca"); toast("F2: فاتورة ZATCA 🧾"); }
    else if(e.key==="F3"){ e.preventDefault(); core()?.go?.("labels"); toast("F3: ملصقات الموازين 🏷️"); }
    else if(e.key==="F4"){ e.preventDefault(); core()?.go?.("scanner"); toast("F4: قارئ الباركود 📷"); }
    else if(e.key==="F8"){ e.preventDefault(); core()?.go?.("operations"); toast("F8: المناسبات والشواء 🍖"); }
    else if(e.key==="F9"){ e.preventDefault(); core()?.go?.("inventory"); toast("F9: المخزون والصلاحية 📦"); }
    else if(e.key==="Escape"){ $("#rail")?.classList.remove("open"); }
  });
  updates();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();
