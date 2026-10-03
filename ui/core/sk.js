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
  inventory:SV('<path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35a2 2 0 0 1 1.26-1.85l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35z"/><path d="M6 22V11h12v11M6 14h12M6 18h12"/>'),
  suppliers:SV('<path d="M3 17h2l2-9h11l2 9h1"/><circle cx="8" cy="19" r="1.6"/><circle cx="17" cy="19" r="1.6"/><path d="M9 8V5h6v3"/>'),
  cash:SV('<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9v.01M18 15v.01"/>'),
  receivables:SV('<path d="M12 8v4l2.5 2.5"/><circle cx="12" cy="12" r="8.5"/>'),
  jev:SV('<path d="M12 3a6 6 0 0 1 6 6c0 2.3-1.2 3.8-2.5 5-.8.8-1.5 1.6-1.5 3h-4c0-1.4-.7-2.2-1.5-3C7.2 12.8 6 11.3 6 9a6 6 0 0 1 6-6z"/><path d="M10 21h4"/>'),
  sensitivity:SV('<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>'),
  kernel:SV('<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>'),
  carcass:SV('<path d="M4 14c0-5 4-9 9-9 4 0 7 3 7 6 0 4-4 8-9 8-4 0-7-2-7-5z"/><path d="M9 11c1.5 1 3.5 1 5 0"/>'),
  smartmatch:SV('<circle cx="5" cy="6" r="3"/><path d="M12 6h5a2 2 0 0 1 2 2v7"/><path d="m15 9-3-3 3-3"/><circle cx="19" cy="18" r="3"/><path d="M12 18H7a2 2 0 0 1-2-2V9"/><path d="m9 15 3 3-3 3"/>'),
  excelrecon:SV('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>'),
  zatca:SV('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M16 13H8M16 17H8"/>'),
  blending:SV('<circle cx="9" cy="12" r="6"/><circle cx="15" cy="12" r="6"/>'),
  labels:SV('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8v8M10 8v6M13 8v8M16 8v6"/>'),
  traceability:SV('<path d="M2 12h20M12 2v20"/><path d="m20 16-4-4 4-4M4 8l4 4-4 4M16 4l-4 4-4-4M8 20l4-4 4 4"/>'),
  culinary:SV('<path d="M6 13.8V4a2 2 0 0 1 4 0v9.8a3.5 3.5 0 1 1-4 0z"/>'),
  scanner:SV('<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10"/>'),
  b2bcredit:SV('<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>'),
  execreports:SV('<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>'),
  operations:SV('<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>'),
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
  helperdesk:SV('<circle cx="12" cy="12" r="2.5"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3"/>'),
  productflow:SV('<circle cx="12" cy="12" r="3"/><path d="M12 3v6M12 15v6M3 12h6M15 12h6"/><circle cx="12" cy="3" r="1.5"/><circle cx="12" cy="21" r="1.5"/><circle cx="3" cy="12" r="1.5"/><circle cx="21" cy="12" r="1.5"/>'),
  builder:SV('<path d="M16 16h6M19 13v6"/><path d="M21 10V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l2-1.1"/><path d="M3.3 7 12 12l8.7-5M12 22V12"/>'),
  sim:SV('<path d="m12 14 4-4"/><path d="M3.3 19a10 10 0 1 1 17.4 0"/><circle cx="12" cy="14" r="1.2"/>'),
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
  costs:SV('<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z"/><path d="M15.5 8H10a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8.5M12 6.5v11"/>'),
  analyzer:SV('<path d="M21 10V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4"/><path d="M3.3 7 12 12l8.7-5M12 22V12"/><circle cx="18" cy="17" r="3"/><path d="m22 21-1.9-1.9"/>'),
  yieldlab:SV('<path d="M9 2v6L4 18a2 2 0 0 0 1.8 3h12.4a2 2 0 0 0 1.8-3L15 8V2M8 2h8M7 14h10"/>'),
  nrv:SV('<path d="M12 3v18M5 7l-3 7a4 4 0 0 0 6 0zM19 7l-3 7a4 4 0 0 0 6 0zM5 7h14"/>'),
  health:SV('<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21.2l8.8-8.8a5.5 5.5 0 0 0 0-7.8z"/>'),
  governance:SV('<path d="M3 21h18M5 21V10M19 21V10M9 21v-7M15 21v-7M2 10 12 3l10 7z"/>'),
  capabilitiesv2:SV('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>'),
  tasks:SV('<path d="M9 6h11M9 12h11M9 18h11"/><path d="m3 6 1.5 1.5L7 5M3 12l1.5 1.5L7 11M3 18l1.5 1.5L7 17"/>'),
  followup:SV('<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>'),
  purchasing:SV('<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L22 7H6"/>'),
  advances:SV('<path d="M3 11h3.5l2.2-1.6a2 2 0 0 1 2.3 0l3.3 2.4a1.4 1.4 0 0 1-1.6 2.3L11 13"/><path d="M6.5 17H14l5.4-3.6a1.5 1.5 0 0 0-1.7-2.5L14 13"/><circle cx="16.5" cy="5.5" r="2.5"/><path d="M3 11v8h3.5"/>'),
  ledger:SV('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5M9 7h7M9 11h5"/>'),
  companies:SV('<path d="M3 21h18M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M10 7h4M10 11h4M10 15h4"/>'),
  council:SV('<circle cx="12" cy="7" r="3"/><circle cx="5" cy="10" r="2.5"/><circle cx="19" cy="10" r="2.5"/><path d="M7 21v-2a5 5 0 0 1 10 0v2M1 21v-1a4 4 0 0 1 5-3.9M23 21v-1a4 4 0 0 0-5-3.9"/>'),
  exports:SV('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>'),
  devices:SV('<rect x="2" y="4" width="14" height="10" rx="1.5"/><path d="M1 17h16"/><rect x="17" y="8" width="6" height="12" rx="1.5"/><path d="M20 17.5h.01"/>'),
  phone:SV('<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/>'),
  laptop:SV('<rect x="4" y="4" width="16" height="11" rx="1.5"/><path d="M2 19h20"/>'),
  share:SV('<path d="M12 3v13M7 8l5-5 5 5"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>'),
  keyboard:SV('<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>'),
  risks:SV('<path d="M12 3 2.5 20h19z"/><path d="M12 10v4M12 17h.01"/>'),
  notifications:SV('<path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>'),
  tbreview:SV('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 9v12"/><path d="m12.5 15.5 2 2 4-4.5"/>'),
  auditdesk:SV('<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>'),
  auditdocs:SV('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M12 11v5M9.5 13.5 12 11l2.5 2.5"/>'),
  auditissues:SV('<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/>'),
  auditcouncil:SV('<path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.8-.9L3 20.5l1.5-4.6a8.4 8.4 0 0 1-.9-3.9A8.5 8.5 0 0 1 12 3.5a8.4 8.4 0 0 1 9 8z"/><path d="M8 12h.01M12 12h.01M16 12h.01"/>'),
  auditfin:SV('<path d="M4 4h16v16H4zM4 9h16M9 9v11"/>'),
  auditreport:SV('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h6"/><path d="M14 2v6h6v3"/><circle cx="18" cy="16" r="3"/><path d="m16.5 18.6-.8 3.4 2.3-1.2 2.3 1.2-.8-3.4"/><path d="M8 13h4M8 17h3"/>'),
  auditanalytics:SV('<circle cx="11" cy="11" r="7.5"/><path d="m21 21-4.3-4.3"/><path d="m7.5 12.5 2.2-2.2 2 2 3-3.3"/>'),
  auditlab:SV('<path d="M6 18h8M3 22h18M14 22a7 7 0 1 0 0-14h-1M9 14h2M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2zM12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/>'),
  codex:SV('<path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"/>'),
  benchmarks:SV('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/><circle cx="16" cy="9" r="2"/>'),
  salesmap:SV('<path d="M9 4 3 6.5v13.5l6-2.5 6 2.5 6-2.5V4l-6 2.5z"/><path d="M9 4v13.5M15 6.5V20"/>'),
  jesim:SV('<path d="M5 4h10l4 4v12H5z"/><path d="M15 4v4h4M8 12h8M8 16h5"/><circle cx="17.5" cy="17.5" r="2.5"/><path d="m19.3 19.3 1.7 1.7"/>'),
  ptree:SV('<circle cx="12" cy="5" r="2.2"/><circle cx="5" cy="19" r="2.2"/><circle cx="12" cy="19" r="2.2"/><circle cx="19" cy="19" r="2.2"/><path d="M12 7.2v9.6M12 11H6v5.8M12 11h7v5.8"/>'),
  corpuslab:SV('<path d="M9 3h6M10 3v6.5L4.6 18.2A1.8 1.8 0 0 0 6.1 21h11.8a1.8 1.8 0 0 0 1.5-2.8L14 9.5V3"/><path d="M7.5 15h9"/>'),
  auditbench:SV('<circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19M12 2.5c2.6 2.6 3.8 5.8 3.8 9.5s-1.2 6.9-3.8 9.5c-2.6-2.6-3.8-5.8-3.8-9.5s1.2-6.9 3.8-9.5z"/>')
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
function safeCell(v){let s=v==null?"":String(v);if(/^(?:[\t\r\n]|\s*[=+\-@])/.test(s))s="'"+s;if(/[",\n\r]/.test(s))s='"'+s.replace(/"/g,'""')+'"';return s}
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

/* Shared, nested-safe focus containment. Call the returned release after removing/closing
   the panel. Capture the invoker before focusing a dialog; never use a global last button. */
const modalStack=[];
function modalFocus(root,invoker=document.activeElement){
  const entry={root},focusable=()=>[...root.querySelectorAll('button,[href],input,select,textarea,[tabindex]')]
    .filter(el=>!el.disabled&&el.tabIndex>=0&&!el.hidden&&!el.closest('[hidden],[inert]')&&el.getClientRects().length&&getComputedStyle(el).visibility!=="hidden");
  let released=false;
  const first=()=>{const items=focusable();if(items.length)items[0].focus({preventScroll:true});else{root.setAttribute("tabindex","-1");root.focus({preventScroll:true})}};
  const key=e=>{if(modalStack.at(-1)!==entry||e.key!=="Tab")return;const items=focusable(),at=document.activeElement;
    if(!items.length){e.preventDefault();first();return}
    if(!root.contains(at)||(e.shiftKey?at===items[0]:at===items.at(-1))){e.preventDefault();(e.shiftKey?items.at(-1):items[0]).focus()}};
  const contain=e=>{if(modalStack.at(-1)===entry&&!root.contains(e.target))first()};
  modalStack.push(entry);document.addEventListener("keydown",key,true);document.addEventListener("focusin",contain,true);
  return()=>{if(released)return;released=true;const top=modalStack.at(-1)===entry,at=modalStack.indexOf(entry);if(at>=0)modalStack.splice(at,1);
    document.removeEventListener("keydown",key,true);document.removeEventListener("focusin",contain,true);
    if(top){const target=invoker&&invoker.isConnected?invoker:document.getElementById("pg-title");if(target){if(target===document.getElementById("pg-title"))target.setAttribute("tabindex","-1");try{target.focus({preventScroll:true})}catch{}}}};
}
let dialogId=0;

/* ---------- confirm dialog (replaces window.confirm / alert) ---------- */
function confirmDialog(message,opts={}){
  return new Promise(resolve=>{
    const prev=document.activeElement,id="sk-dialog-"+(++dialogId);
    const w=document.createElement("div");w.className="skd-wrap";w.setAttribute("role","presentation");
    w.innerHTML='<div class="skd" role="alertdialog" aria-modal="true" aria-labelledby="'+id+'"><h3 id="'+id+'">'+esc(opts.title||"تأكيد")+'</h3><p>'+esc(message)+'</p><div class="skd-acts">'+
      (opts.alert?'':'<button type="button" class="btn" data-r="0">'+esc(opts.cancel||"إلغاء")+'</button>')+
      '<button type="button" class="btn '+(opts.danger?'danger':'primary')+'" data-r="1">'+esc(opts.ok||(opts.alert?"حسناً":"تأكيد"))+'</button></div></div>';
    let settled=false,release=()=>{};
    const done=r=>{if(settled)return;settled=true;w.remove();document.removeEventListener("keydown",key,true);release();resolve(r)};
    const key=e=>{if(e.key==="Escape"&&modalStack.at(-1)?.root===w.querySelector(".skd")){e.preventDefault();e.stopImmediatePropagation();done(!!opts.alert)}};
    w.addEventListener("click",e=>{const b=e.target.closest("[data-r]");if(b)done(b.dataset.r==="1");else if(e.target===w)done(!!opts.alert)});
    document.addEventListener("keydown",key,true);
    document.body.appendChild(w);release=modalFocus(w.querySelector(".skd"),prev);
    (w.querySelector('[data-r="1"]')).focus();
  });
}
const notify=(message,opts)=>confirmDialog(message,{...opts,alert:true});
/* a small form in the same dialog (replaces window.prompt): fields [{key,label,type,value,required,options,min,max,step,hint}] → values or null */
function formDialog(title,fields,opts={}){
  return new Promise(resolve=>{
    const prev=document.activeElement,id="sk-dialog-"+(++dialogId);
    const w=document.createElement("div");w.className="skd-wrap";w.setAttribute("role","presentation");
    const field=f=>{const fid=id+"-"+esc(f.key),v=f.value==null?"":String(f.value),req=f.required?' required':'';
      const ctl=f.type==="textarea"?'<textarea id="'+fid+'" name="'+esc(f.key)+'" rows="3"'+req+'>'+esc(v)+'</textarea>':
        f.type==="select"?'<select id="'+fid+'" name="'+esc(f.key)+'"'+req+'>'+(f.options||[]).map(o=>{const [ov,ol]=Array.isArray(o)?o:[o,o];return '<option value="'+esc(ov)+'"'+(String(ov)===v?' selected':'')+'>'+esc(ol)+'</option>'}).join("")+'</select>':
        '<input id="'+fid+'" name="'+esc(f.key)+'" type="'+(f.type==="number"?"number":"text")+'" value="'+esc(v)+'"'+(f.min!=null?' min="'+f.min+'"':'')+(f.max!=null?' max="'+f.max+'"':'')+(f.step!=null?' step="'+f.step+'"':'')+(f.placeholder?' placeholder="'+esc(f.placeholder)+'"':'')+req+' autocomplete="off">';
      return '<label class="skd-f" for="'+fid+'"><span>'+esc(f.label)+(f.required?' <i aria-hidden="true">*</i>':'')+'</span>'+ctl+(f.hint?'<small>'+esc(f.hint)+'</small>':'')+'</label>'};
    w.innerHTML='<form class="skd" role="dialog" aria-modal="true" aria-labelledby="'+id+'" novalidate><h3 id="'+id+'">'+esc(title)+'</h3>'+(opts.message?'<p>'+esc(opts.message)+'</p>':'')+
      fields.map(field).join("")+'<p class="skd-err" role="alert" hidden></p><div class="skd-acts"><button type="button" class="btn" data-r="0">'+esc(opts.cancel||"إلغاء")+'</button><button type="submit" class="btn '+(opts.danger?'danger':'primary')+'">'+esc(opts.ok||"حفظ")+'</button></div></form>';
    const form=w.querySelector("form"),err=w.querySelector(".skd-err");
    let settled=false,release=()=>{};
    const done=r=>{if(settled)return;settled=true;w.remove();document.removeEventListener("keydown",key,true);release();resolve(r)};
    const key=e=>{if(e.key==="Escape"&&modalStack.at(-1)?.root===w.querySelector(".skd")){e.preventDefault();e.stopImmediatePropagation();done(null)}};
    form.addEventListener("submit",e=>{e.preventDefault();if(settled)return;const out={};
      for(const f of fields){const el=form.elements[f.key],raw=String(el.value).trim();
        if(f.required&&!raw){err.textContent="أكمل: "+f.label;err.hidden=false;el.focus();return}
        if(f.type==="number"&&raw){const n=Number(raw.replace("٫",".").replace(/[٠-٩]/g,x=>"٠١٢٣٤٥٦٧٨٩".indexOf(x)));
          if(!Number.isFinite(n)||(f.min!=null&&n<f.min)||(f.max!=null&&n>f.max)){err.textContent=f.label+": قيمة غير صالحة"+(f.min!=null&&f.max!=null?" ("+f.min+" – "+f.max+")":"");err.hidden=false;el.focus();return}
          out[f.key]=n}else out[f.key]=raw}
      const bad=opts.validate&&opts.validate(out);if(bad){err.textContent=bad;err.hidden=false;return}
      done(out)});
    w.addEventListener("click",e=>{if(e.target.closest('[data-r="0"]')||e.target===w)done(null)});
    document.addEventListener("keydown",key,true);
    document.body.appendChild(w);release=modalFocus(form,prev);
    const first=form.querySelector("input,textarea,select");(first||form.querySelector('[type="submit"]')).focus();
  });
}

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
/* the KOSIF identity (default look): same letterhead, navy/blue palette, a gradient rule instead of the ornament */
/* the KOSIF Luxe letterhead (default look): navy band with the cloud mark and wordmark, document
   title and date on the band, identity numbers under it, navy table heads, numbered pages */
const PRINT_KOSIF='@page{size:A4;margin:14mm 12mm 16mm;@bottom-center{content:"صفحة " counter(page) " من " counter(pages);font:9.5px "IBM Plex Sans Arabic",sans-serif;color:#8292a8}}'+
 '*{-webkit-print-color-adjust:exact;print-color-adjust:exact}body{padding:0;font-family:"IBM Plex Sans Arabic","Segoe UI",Tahoma,sans-serif;color:#0b1c33;font-size:12.5px;line-height:1.65}'+
 'h1,h2,h3{font-family:"IBM Plex Sans Arabic","Segoe UI",sans-serif;color:#0b1f3a;font-weight:700}h2{font-size:16px;margin:18px 0 8px;padding-inline-start:10px;border-inline-start:4px solid #1668e3}'+
 'table{border:1px solid #e4eaf2;border-radius:10px;overflow:hidden;border-collapse:separate;border-spacing:0}th,td{border-bottom:1px solid #edf1f7;padding:7px 9px}th{background:#0b1f3a!important;color:#fff;font-weight:600;font-size:11.5px}'+
 'tr:nth-child(even) td{background:#f8fafd}hr,.r,.skp-foot{border-color:#e4eaf2}small,.muted{color:#8292a8}b,strong{color:#0b1c33}.t{border-top-color:#1668e3}'+
 '.skp-lux{margin:0 0 16px}.skp-band{display:flex;align-items:center;gap:14px;padding:14px 18px;border-radius:14px;background:linear-gradient(120deg,#0b1f3a 0%,#123a6b 60%,#1668e3 100%)!important;color:#fff}'+
 '.skp-band img{width:88px;height:32px}.skp-mark{flex:1}.skp-mark b{display:block;font:800 24px/1 Montserrat,"Segoe UI",sans-serif;letter-spacing:.06em;color:#fff}'+
 '.skp-mark span{display:block;margin-top:4px;font-size:12px;color:#cfe0f5}.skp-doc{text-align:left}.skp-doc b{display:block;font-size:15px;color:#fff}.skp-doc span{font-size:11px;color:#cfe0f5}'+
 '.skp-ids{display:flex;flex-wrap:wrap;gap:4px 14px;padding:8px 6px 0;font-size:10.5px;color:#8292a8}.skp-foot{margin-top:22px;padding-top:8px;border-top:1px solid #e4eaf2;font-size:10px;color:#8292a8;text-align:center}';
/* one print identity: the KOSIF letterhead for every look except «تراث الوادي» and «الدفتر» */
const kosifLook=()=>!["heritage","notebook"].includes(document.documentElement.getAttribute("data-look")||"kosif");
/* the preparer: the name set in the user menu (skosif_profile_v1), else الإعدادات */
function preparer(){try{const p=JSON.parse(localStorage.getItem("skosif_profile_v1")||"{}");if(p&&p.name)return p.name+(p.title?" — "+p.title:"")}catch{}return org().preparer||""}
/* who issues the printed page: in the audit section the audit firm (the profile's «المكتب المهني» and licence),
   elsewhere the company open in the helper tools (its name, VAT and CR numbers from the settings) */
function issuer(){
  let sec="";try{const c=core();sec=c&&SK.caps?SK.caps.sectionOf(c.view()):""}catch{}
  if(sec==="audit"){let p={};try{p=JSON.parse(localStorage.getItem("skosif_profile_v1")||"{}")||{}}catch{}
    return{name:String(p.firm||"").trim()||"المراجعة والمراجعة المالية",ids:[p.license?"ترخيص رقم "+esc(p.license):"",p.city?esc(p.city):""].filter(Boolean)}}
  const o=org();return{name:o.biz||"أغنام الوادي",ids:[o.vatNo?"الرقم الضريبي "+esc(o.vatNo):"",o.crNo?"السجل التجاري "+esc(o.crNo):"",o.phone?esc(o.phone):"",o.addr?esc(o.addr):""].filter(Boolean)};
}
function letterhead(title){
  const who=issuer(),o={biz:who.name},base=location.href.replace(/[^/?#]*([?#].*)?$/,"");
  const ids=who.ids;
  const date=esc(new Date().toLocaleDateString("ar-SA-u-ca-gregory-nu-latn",{day:"numeric",month:"long",year:"numeric"}));
  if(kosifLook())return '<header class="skp-lux"><div class="skp-band"><img src="'+base+'art/sqc-mark.svg" alt=""><div class="skp-mark"><b>SQC</b><span>'+esc(o.biz||"أغنام الوادي")+'</span></div>'+
    '<div class="skp-doc"><b>'+esc(title||"")+'</b><span>'+date+'</span></div></div>'+(ids.length?'<div class="skp-ids">'+ids.map(x=>'<span>'+x+'</span>').join("")+'</div>':'')+'</header>';
  return '<div class="skp-orn" style="background-image:url('+base+'art/ornament.svg)"></div><header class="skp-head"><img src="'+base+'art/ram.svg" alt=""><div class="skp-org"><b>'+esc(o.biz||"أغنام الوادي")+'</b>'+(ids.length?'<span>'+ids.join(" · ")+'</span>':'')+'</div>'+
    '<div class="skp-meta"><b>'+esc(title||"")+'</b>'+date+'</div></header>';
}
/* ---------- print preview: every printed document opens with a bar of options first ----------
   paper · orientation · margins · text size · colour or grey · watermark · letterhead on/off · page
   numbers; the choice is remembered on this device (skosif_print_v1). The window's own print call
   waits for «طباعة», so each feature keeps building its print window as before. */
const PKEY="skosif_print_v1";
const PDEF={paper:"A4",orient:"portrait",margin:"normal",scale:100,gray:false,wm:"",head:true,pages:true,preview:true};
const popts=()=>Object.assign({},PDEF,load(PKEY,{}));
const MARG={narrow:"7mm",normal:"12mm",wide:"18mm"};
function optCSS(o){
  return '@page{size:'+o.paper+' '+o.orient+';margin:'+MARG[o.margin]+(o.pages?';@bottom-center{content:"صفحة " counter(page) " من " counter(pages);font:9.5px sans-serif;color:#8292a8}':';@bottom-center{content:none}')+'}'+
    'body{zoom:'+(o.scale/100)+'}'+(o.gray?'html{filter:grayscale(1)}':'')+(o.head?'':'.skp-lux,.skp-head,.skp-orn{display:none!important}')+
    (o.wm?'body::before{content:"'+String(o.wm).replace(/["\\]/g,"")+'";position:fixed;inset:0;display:grid;place-items:center;font:800 96px/1 "IBM Plex Sans Arabic",sans-serif;color:rgba(11,31,58,.07);transform:rotate(-28deg);pointer-events:none;z-index:0}':'');
}
const BAR_CSS='.skp-bar{position:sticky;top:0;z-index:50;display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:0 -4mm 12px;padding:10px 14px;background:#0b1f3a;color:#fff;font:600 12.5px "IBM Plex Sans Arabic","Segoe UI",sans-serif;box-shadow:0 6px 20px -10px rgba(0,0,0,.5)}'+
  '.skp-bar b{font-size:14px;margin-inline-end:auto}.skp-bar label{display:inline-flex;align-items:center;gap:6px}.skp-bar select,.skp-bar input[type=text]{min-height:32px;padding:0 8px;border:1px solid #2a4a74;border-radius:8px;background:#122a4d;color:#fff;font:inherit}'+
  '.skp-bar input[type=text]{width:110px}.skp-bar button{min-height:34px;padding:0 14px;border:0;border-radius:9px;font:inherit;cursor:pointer}.skp-bar .go{background:#22b8e6;color:#06101f;font-weight:800}.skp-bar .x{background:#1e3a60;color:#fff}'+
  '@media print{.skp-bar{display:none!important}}';
function previewBar(w,d){
  const o=popts(),sel=(k,opts)=>'<select data-k="'+k+'">'+opts.map(([v,l])=>'<option value="'+v+'"'+(String(o[k])===String(v)?' selected':'')+'>'+l+'</option>').join("")+'</select>';
  const chk=(k,l)=>'<label><input type="checkbox" data-k="'+k+'"'+(o[k]?' checked':'')+'> '+l+'</label>';
  const bar=d.createElement("div");bar.className="skp-bar no-print";bar.setAttribute("dir","rtl");
  bar.innerHTML='<b>معاينة الطباعة</b>'+
    '<label>الورق '+sel("paper",[["A4","A4"],["A5","A5"],["letter","Letter"],["A3","A3"]])+'</label>'+
    '<label>الاتجاه '+sel("orient",[["portrait","طولي"],["landscape","عرضي"]])+'</label>'+
    '<label>الهوامش '+sel("margin",[["narrow","ضيقة"],["normal","عادية"],["wide","واسعة"]])+'</label>'+
    '<label>الحجم '+sel("scale",[[85,"85%"],[90,"90%"],[100,"100%"],[110,"110%"],[125,"125%"]])+'</label>'+
    '<label>علامة مائية <input type="text" data-k="wm" list="skp-wm" value="'+esc(o.wm)+'" placeholder="بلا"><datalist id="skp-wm"><option value="مسودة"><option value="سري"><option value="نسخة"><option value="للمراجعة"></datalist></label>'+
    chk("gray","رمادي")+chk("head","الترويسة")+chk("pages","أرقام الصفحات")+
    '<button type="button" class="go" data-a="print">طباعة / حفظ PDF</button><button type="button" class="x" data-a="close">إغلاق</button>';
  d.body.insertBefore(bar,d.body.firstChild);
  const st=d.createElement("style");st.id="skp-opts";(d.head||d.documentElement).appendChild(st);
  const apply=()=>{const x=popts();st.textContent=optCSS(x);(d.head||d.documentElement).appendChild(st)};
  const set=(k,v)=>{const x=popts();x[k]=v;save(PKEY,x);apply()};
  bar.addEventListener("change",e=>{const el=e.target;if(!el.dataset.k)return;set(el.dataset.k,el.type==="checkbox"?el.checked:el.dataset.k==="scale"?Number(el.value):el.value)});
  bar.addEventListener("input",e=>{if(e.target.dataset.k==="wm")set("wm",e.target.value.slice(0,24))});
  bar.addEventListener("click",e=>{const b=e.target.closest("[data-a]");if(!b)return;if(b.dataset.a==="print")w.__skRealPrint();else w.close()});
  apply();
  /* features add their own styles after brandPrint: the options stay last */
  setTimeout(apply,60);w.addEventListener&&w.addEventListener("load",apply);
}
function brandPrint(w,title){
  try{
    const d=w.document;if(!d||!d.body)return;
    d.querySelectorAll("style").forEach(x=>x.remove());
    const st=d.createElement("style");st.id="sk-print-brand";st.textContent=PRINT_CSS+(kosifLook()?PRINT_KOSIF:"");(d.head||d.documentElement).appendChild(st);
    const f=d.createElement("link");f.rel="stylesheet";f.href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Aref+Ruqaa:wght@700&family=IBM+Plex+Sans+Arabic:wght@400;600;700&family=Montserrat:wght@800&display=swap";(d.head||d.documentElement).appendChild(f);
    d.documentElement.setAttribute("dir","rtl");
    if(title&&!d.title)d.title=title;
    d.body.insertAdjacentHTML("afterbegin",letterhead(title||d.title));
    const pr=preparer();d.body.insertAdjacentHTML("beforeend",'<footer class="skp-foot">'+esc(issuer().name)+' · صدر من '+'SQC — Smart Quality Control · AI-Powered Audit &amp; Assurance'+(pr?' · أعدّه: '+esc(pr):'')+'</footer>');
    /* in the app's own preview (SK.output) the toolbar lives outside the page */
    if(w.__skEmbedded){if(window.SKCharts&&d.querySelector(".skch-fig,.skch,.skhb")){const cs=d.createElement("style");cs.id="sk-print-charts";cs.textContent=SKCharts.printCSS;(d.head||d.documentElement).appendChild(cs)}
      setTimeout(()=>SK.output&&SK.output.css(d),0);return}
    /* the preview: options apply live; the window's own print() waits for «طباعة» */
    const bs=d.createElement("style");bs.textContent=BAR_CSS;(d.head||d.documentElement).appendChild(bs);
    if(!w.__skRealPrint){const real=w.print.bind(w);w.__skRealPrint=()=>{try{w.focus();real()}catch{}};
      if(popts().preview)w.print=()=>{try{w.focus();const b=d.querySelector(".skp-bar .go");if(b)b.focus()}catch{}};else w.print=w.__skRealPrint}
    if(window.SKCharts&&d.querySelector(".skch-fig,.skch,.skhb")){const cs=d.createElement("style");cs.id="sk-print-charts";cs.textContent=SKCharts.printCSS;(d.head||d.documentElement).appendChild(cs)}
    previewBar(w,d);
  }catch(e){report(e,"print")}
}

function askJev(opts){save("skosif_jev_draft",opts||{});if(core())core().go("jev")}

window.SK={$,$$,esc,num,load,save,money,pct,toast,view,redact,askJev,icon,icons:ICONS,download,
  confirm:confirmDialog,notify,form:formDialog,modalFocus,brandPrint,org,
  print:Object.freeze({options:popts,set:(k,v)=>{const x=popts();x[k]=v;save(PKEY,x)},css:optCSS}),
  csv:Object.freeze({cell:safeCell,build:csv,download:downloadCsv}),
  lock:Object.freeze({now:lockNow,key:LOCK_KEY,touch:()=>{last=Date.now()}}),
  _flush:flush,version:"2.0"};
})();
