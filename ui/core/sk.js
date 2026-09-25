/* S.kosif core — shared helpers for every feature module (window.SK).
   No UI of its own: layout lives in ui/layouts/shell.js, styles in ui/ds/.
   The core services (bus, errors, store, audit, perm, caps, ui) attach to SK in the
   files that follow; SK is frozen by ui/layouts/shell.js once they are all loaded. */
(()=>{
"use strict";
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const num=v=>{const n=Number(String(v??"").replace(/[٠-٩]/g,d=>"٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/[٬,\s]/g,"").replace("٫","."));return Number.isFinite(n)?n:0};
const load=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v??d}catch{return d}};
const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){if(window.SK&&SK.errors)SK.errors.report(e,"storage:"+k);return false}};
const nf2=new Intl.NumberFormat("ar-SA-u-nu-latn",{minimumFractionDigits:2,maximumFractionDigits:2});
const money=v=>nf2.format(Number(v)||0)+" ر.س";
const pct=v=>new Intl.NumberFormat("ar-SA-u-nu-latn",{maximumFractionDigits:1}).format(Number(v)||0)+"٪";
const core=()=>window.SKosifCore;
function toast(msg,type){const c=core();if(c)c.toast(msg,type);else console.info(msg)}

/* ---------- icons (one set for nav, palette and command center) ---------- */
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
  zatca:SV('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M16 13H8M16 17H8"/>'),
  blending:SV('<circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/>'),
  labels:SV('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8v8M10 8v6M13 8v8M16 8v6"/>'),
  traceability:SV('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'),
  culinary:SV('<path d="M6 13.8V4a2 2 0 0 1 4 0v9.8a3.5 3.5 0 1 1-4 0z"/>'),
  scanner:SV('<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10"/>'),
  b2bcredit:SV('<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>'),
  execreports:SV('<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>'),
  operations:SV('<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>'),
  dash:SV('<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>'),
  search:SV('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/>'),
  alert:SV('<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>'),
  check:SV('<path d="M20 6 9 17l-5-5"/>'),
  lock:SV('<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
  cloudoff:SV('<path d="m2 2 20 20"/><path d="M5.8 8.2A6 6 0 0 0 7 20h10a4 4 0 0 0 1.7-.4M10.6 6.2A6 6 0 0 1 18 11a4 4 0 0 1 3.4 5.3"/>'),
  action:SV('<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>'),
  item:SV('<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/>'),
  calc:SV('<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01M8 18h8"/>'),
  user:SV('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
  /* core screens */
  decision:SV('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>'),
  commerce:SV('<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/>'),
  customers:SV('<circle cx="9" cy="8" r="4"/><path d="M1 21a8 8 0 0 1 16 0"/><path d="M17 11a3 3 0 1 0 0-6M23 21a6 6 0 0 0-4-5.6"/>'),
  catalog:SV('<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>'),
  builder:SV('<path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.7z"/><path d="M3.3 7 12 12l8.7-5M12 22V12"/>'),
  sim:SV('<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>'),
  memo:SV('<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>'),
  reports:SV('<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>'),
  archive:SV('<rect x="2" y="3" width="20" height="5" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8M10 12h4"/>'),
  settings:SV('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
  salesintel:SV('<path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/>'),
  economics:SV('<path d="M1 3h15v13H1zM16 8h4l3 3v5h-7z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>'),
  intelligence:SV('<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>'),
  finance:SV('<path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>'),
  risklab:SV('<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.2"/><circle cx="15.5" cy="15.5" r="1.2"/><circle cx="12" cy="12" r="1.2"/>'),
  compare:SV('<path d="M21.2 15.9A10 10 0 1 1 8 2.8"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>'),
  costs:SV('<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>'),
  analyzer:SV('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/>'),
  yieldlab:SV('<path d="M9 2v6L4 18a2 2 0 0 0 1.8 3h12.4a2 2 0 0 0 1.8-3L15 8V2M8 2h8M7 14h10"/>'),
  nrv:SV('<path d="M12 3v18M5 7l-3 7a4 4 0 0 0 6 0zM19 7l-3 7a4 4 0 0 0 6 0zM5 7h14"/>'),
  health:SV('<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21.2l8.8-8.8a5.5 5.5 0 0 0 0-7.8z"/>'),
  governance:SV('<path d="M3 21h18M5 21V10M19 21V10M9 21v-7M15 21v-7M2 10 12 3l10 7z"/>'),
  capabilitiesv2:SV('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>'),
  tasks:SV('<path d="M9 6h11M9 12h11M9 18h11"/><path d="m3 6 1.5 1.5L7 5M3 12l1.5 1.5L7 11M3 18l1.5 1.5L7 17"/>'),
  followup:SV('<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>'),
  purchasing:SV('<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L22 7H6"/>'),
  ledger:SV('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5M9 7h7M9 11h5"/>'),
  companies:SV('<path d="M3 21h18M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M10 7h4M10 11h4M10 15h4"/>'),
  council:SV('<circle cx="12" cy="7" r="3"/><circle cx="5" cy="10" r="2.5"/><circle cx="19" cy="10" r="2.5"/><path d="M7 21v-2a5 5 0 0 1 10 0v2M1 21v-1a4 4 0 0 1 5-3.9M23 21v-1a4 4 0 0 0-5-3.9"/>'),
  exports:SV('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>')
};
const icon=id=>ICONS[id]||(core()&&core().navIcon(id))||ICONS.action;

/* ---------- screen registration ---------- */
const pending=[];
function view(id,def){
  const d={...def,icon:def.icon||ICONS[id]||""};
  const cap=window.SK&&SK.caps&&SK.caps.get(id);
  if(cap){d.title=cap.label;d.sub=d.sub||cap.sub;d.adv=!cap.primary}
  if(core()&&core().registerView){try{core().registerView(id,d)}catch(e){report(e,"register:"+id)}}else pending.push([id,d]);
}
function flush(){while(pending.length&&core()){const [id,d]=pending.shift();try{core().registerView(id,d)}catch(e){report(e,"register:"+id)}}}
function report(e,where){if(window.SK&&SK.errors)SK.errors.report(e,where);else console.error(where,e)}

/* ---------- safe CSV (no spreadsheet formula injection) ---------- */
function safeCell(v){let s=v==null?"":String(v);if(/^[=+\-@\t\r]/.test(s))s="'"+s;if(/[",\n\r]/.test(s))s='"'+s.replace(/"/g,'""')+'"';return s}
function csv(headers,rows){return "﻿"+[headers,...rows].map(r=>r.map(safeCell).join(",")).join("\r\n")}
function download(name,blob){const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000)}
function downloadCsv(name,headers,rows){download(name.endsWith(".csv")?name:name+".csv",new Blob([csv(headers,rows)],{type:"text/csv;charset=utf-8"}))}

/* ---------- strip personal data before anything leaves the device (Jev) ---------- */
function redact(text){
  let s=String(text??"");
  s=s.replace(/\b[A-Z]{2}\d{2}[A-Z0-9]{10,30}\b/gi,"[IBAN]");
  s=s.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,"[EMAIL]");
  s=s.replace(/(?:\+?966[\s-]?5\d|05\d)(?:[\s-]?\d){7,8}\b/g,"[PHONE]");
  s=s.replace(/\b(?:\d[\s-]?){10,15}\b/g,"[ID]");
  return s;
}

/* ---------- confirm dialog (replaces window.confirm / alert) ---------- */
function confirmDialog(message,opts={}){
  return new Promise(resolve=>{
    const prev=document.activeElement;
    const w=document.createElement("div");w.className="skd-wrap";w.setAttribute("role","presentation");
    w.innerHTML='<div class="skd" role="alertdialog" aria-modal="true" aria-labelledby="skd-t"><h3 id="skd-t">'+esc(opts.title||"تأكيد")+'</h3><p>'+esc(message)+'</p><div class="skd-acts">'+
      (opts.alert?'':'<button type="button" class="btn" data-r="0">'+esc(opts.cancel||"إلغاء")+'</button>')+
      '<button type="button" class="btn '+(opts.danger?'danger':'primary')+'" data-r="1">'+esc(opts.ok||(opts.alert?"حسناً":"تأكيد"))+'</button></div></div>';
    const done=r=>{w.remove();document.removeEventListener("keydown",key,true);try{prev&&prev.focus()}catch{}resolve(r)};
    const key=e=>{if(e.key==="Escape"){e.preventDefault();e.stopPropagation();done(!!opts.alert)}};
    w.addEventListener("click",e=>{const b=e.target.closest("[data-r]");if(b)done(b.dataset.r==="1");else if(e.target===w)done(!!opts.alert)});
    document.addEventListener("keydown",key,true);
    document.body.appendChild(w);
    (w.querySelector('[data-r="1"]')).focus();
  });
}
const notify=(message,opts)=>confirmDialog(message,{...opts,alert:true});

/* ---------- auto-lock ---------- */
const LOCK_KEY="skosif_autolock_min";
function lockNow(){try{sessionStorage.removeItem("aghnamJevSession")}catch{}location.replace("./index.html")}
let last=Date.now();
["pointerdown","keydown","touchstart","wheel"].forEach(ev=>addEventListener(ev,()=>{last=Date.now()},{passive:true,capture:true}));
function idleCheck(){const m=num(load(LOCK_KEY,0));if(m>0&&Date.now()-last>m*60000)lockNow()}
setInterval(idleCheck,30000);
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")idleCheck()});

/* ---------- one letterhead for every printed document ----------
   Feature modules build their print window as before and then call SK.brandPrint(w):
   their ad-hoc <style> blocks are replaced by the heritage print style and the
   letterhead (emblem, business name, VAT/CR numbers from «الإعدادات») is added on top. */
function org(){try{return(JSON.parse(localStorage.getItem("aghnam-pricing-v3")||"{}").settings)||{}}catch{return{}}}
const PRINT_CSS='@page{size:A4;margin:12mm}*{box-sizing:border-box}body{margin:0;padding:0 4mm;font-family:"Amiri","Noto Naskh Arabic",Tahoma,serif;color:#2b1a0f;background:#fff;font-size:13.5px;line-height:1.7;direction:rtl}'+
 'h1,h2,h3{font-family:"Aref Ruqaa","Amiri",serif;color:#5b3519;margin:.3em 0}h1{font-size:22px}h2{font-size:18px}h3{font-size:15px}'+
 'table{width:100%;border-collapse:collapse;margin:10px 0}th,td{padding:6px 8px;border-bottom:1px solid #e3d3b8;text-align:right;vertical-align:top}th{background:#f6eddd;color:#5b4330;font-weight:700}'+
 'b,strong{color:#2b1a0f}small,.muted{color:#8c735a}hr{border:0;border-top:1px solid #e3d3b8}'+
 '.skp-orn{height:14px;margin:0 0 6px;background-repeat:repeat-x;background-position:center;border-top:1px solid #8a5a2b;border-bottom:1px solid #8a5a2b;padding:1px 0}'+
 '.skp-head{display:flex;align-items:center;gap:14px;padding:6px 0 12px;margin-bottom:14px;border-bottom:3px double #8a5a2b}'+
 '.skp-head img{width:62px;height:62px;padding:4px;border:2px solid #8a5a2b;border-radius:50%;background:#fbf5ea}.skp-org{flex:1}.skp-org b{display:block;font-family:"Aref Ruqaa","Amiri",serif;font-size:22px;color:#5b3519}'+
 '.skp-org span{display:block;font-size:11.5px;color:#8c735a}.skp-meta{text-align:left;font-size:11.5px;color:#8c735a}.skp-meta b{display:block;font-size:14px;color:#2b1a0f}'+
 '.skp-foot{margin-top:18px;padding-top:8px;border-top:1px solid #e3d3b8;font-size:10.5px;color:#8c735a;text-align:center}'+
 '.r{display:flex;justify-content:space-between;border-bottom:1px solid #e3d3b8;padding:8px 2px}.t{font-weight:700;border-top:2px solid #8a5a2b}'+
 '@media print{.no-print{display:none}}';
function letterhead(title){
  const o=org(),base=location.href.replace(/[^/]*$/,"");
  const ids=[o.vatNo?"الرقم الضريبي "+esc(o.vatNo):"",o.crNo?"السجل التجاري "+esc(o.crNo):"",o.phone?esc(o.phone):"",o.addr?esc(o.addr):""].filter(Boolean).join(" · ");
  return '<div class="skp-orn" style="background-image:url('+base+'art/ornament.svg)"></div><header class="skp-head"><img src="'+base+'art/ram.svg" alt=""><div class="skp-org"><b>'+esc(o.biz||"أغنام الوادي")+'</b>'+(ids?'<span>'+ids+'</span>':'')+'</div>'+
    '<div class="skp-meta"><b>'+esc(title||"")+'</b>'+esc(new Date().toLocaleDateString("ar-SA-u-ca-gregory-nu-latn",{day:"numeric",month:"long",year:"numeric"}))+'</div></header>';
}
function brandPrint(w,title){
  try{
    const d=w.document;if(!d||!d.body)return;
    d.querySelectorAll("style").forEach(x=>x.remove());
    const st=d.createElement("style");st.textContent=PRINT_CSS;(d.head||d.documentElement).appendChild(st);
    const f=d.createElement("link");f.rel="stylesheet";f.href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Aref+Ruqaa:wght@700&display=swap";(d.head||d.documentElement).appendChild(f);
    d.documentElement.setAttribute("dir","rtl");
    if(title&&!d.title)d.title=title;
    d.body.insertAdjacentHTML("afterbegin",letterhead(title||d.title));
    const o=org();d.body.insertAdjacentHTML("beforeend",'<footer class="skp-foot">'+esc(o.biz||"أغنام الوادي")+' · صدر من S.kosif'+(o.preparer?' · أعدّه: '+esc(o.preparer):'')+'</footer>');
  }catch(e){report(e,"print")}
}

function askJev(opts){save("skosif_jev_draft",opts||{});if(core())core().go("jev")}

window.SK={$,$$,esc,num,load,save,money,pct,toast,view,redact,askJev,icon,icons:ICONS,download,
  confirm:confirmDialog,notify,brandPrint,org,
  csv:Object.freeze({cell:safeCell,build:csv,download:downloadCsv}),
  lock:Object.freeze({now:lockNow,key:LOCK_KEY,touch:()=>{last=Date.now()}}),
  _flush:flush,version:"2.0"};
})();
