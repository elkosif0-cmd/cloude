/* S.kosif component — command palette (Ctrl+K · ⌘K · /).
   One place to reach everything: screens (from the registry, filtered by role), actions,
   items from the pricing engine, customers/orders search (the core's global search),
   pinned and recent entries, and a calculator (= 12.5*38). */
(()=>{
"use strict";
const {$,esc,load,save}=SK;
const core=()=>window.SKosifCore;
const REC_KEY="skosif_palette_recent",PIN_KEY="aghnam-v21-pins";

function norm(s){return String(s||"").toLowerCase().replace(/[ً-ٰٟ]/g,"").replace(/[أإآٱ]/g,"ا").replace(/ة/g,"ه").replace(/ى/g,"ي").replace(/ـ/g,"").replace(/\s+/g," ").trim()}
function score(q,t){const n=norm(t);if(!q)return 1;const i=n.indexOf(q);if(i>=0)return 100-Math.min(i,60);let qi=0,s=0,last=-2;for(let k=0;k<n.length&&qi<q.length;k++){if(n[k]===q[qi]){s+=last===k-1?3:1;last=k;qi++}}return qi===q.length?s:0}
function calc(q){
  let ex=String(q).replace(/^=/,"").trim();if(!ex||!/^[0-9+\-*/().,%\sxX×÷]+$/.test(ex))return null;
  ex=ex.replace(/[xX×]/g,"*").replace(/÷/g,"/").replace(/,/g,"").replace(/(\d+(?:\.\d+)?)%/g,"($1/100)");
  try{const v=Function('"use strict";return('+ex+')')();return typeof v==="number"&&isFinite(v)?Math.round(v*1000)/1000:null}catch{return null}
}
const go=id=>core()&&core().go(id);
const act=(name,data)=>()=>core()&&core().act(name,data);
/* The assistant awaits delayed commands and supplies a local-context guard. Ordinary palette
   callers retain their behavior. Unsupported asynchronous commands need their own integration. */
const delayedAction=(view,name,data)=>(_q,contextCurrent)=>{
  go(view);return new Promise(resolve=>setTimeout(()=>{if(contextCurrent&&!contextCurrent()){resolve(false);return}act(name,data)();resolve(true)},150));
};
const ACTIONS=[
  {id:"sale",t:"تسجيل عملية بيع",s:"إضافة بيع يدوي إلى مؤشرات المبيعات",ic:"commerce",run:act("v12-sale-new"),perm:["commerce","create"]},
  {id:"pos",t:"فاتورة ضريبية جديدة",s:"نقطة البيع برمز QR",ic:"zatca",run:()=>go("zatca"),perm:["zatca","view"]},
  {id:"item",t:"إضافة صنف جديد",s:"صنف خام في سجل الأسعار",ic:"catalog",run:delayedAction("catalog","item-new",{source:"catalog"}),perm:["catalog","create"]},
  {id:"box",t:"بناء بوكس جديد",s:"هندسة بوكس ومكوناته",ic:"builder",run:delayedAction("builder","bld-new"),perm:["builder","create"]},
  {id:"search",t:"بحث في العملاء والطلبات",s:"جوال، رقم طلب، وصف مبيعات",ic:"customers",run:q=>core()&&core().search(q||""),perm:["customers","view"]},
  {id:"templates",t:"قوالب الاستيراد",s:"قالب Excel لكل قسم تملؤه ثم تستورده",ic:"exports",run:()=>SK.templates&&SK.templates.panel(),perm:["exports","view"]},
  {id:"demo",t:"البيانات التجريبية",s:"املأ الأقسام الفارغة ببيانات شركة وهمية أو امسحها",ic:"archive",run:()=>SK.demo&&SK.demo.panel(),perm:["settings","view"]},
  {id:"backup",t:"نسخة كاملة للتطبيق",s:"كل البيانات في ملف واحد · Ctrl+S",ic:"archive",run:()=>SK.store.backup().catch(e=>SK.errors.report(e,"backup")),perm:["settings","export"]},
  {id:"csv",t:"تصدير الأسعار (CSV)",s:"كل جداول التسعير",ic:"excelrecon",run:act("csv-all"),perm:["catalog","export"]},
  {id:"assistant",t:"المساعد المباشر",s:"اطلب بالكلام أو الكتابة: افتح، لخّص، صدّر، اطبع، غيّر المظهر · Ctrl+J",ic:"council",run:()=>window.SKosifAssistant&&SKosifAssistant.open()},
  {id:"jev",t:"اسأل Jev",s:"قرار منظم من بيانات مجمعة",ic:"jev",run:()=>go("jev"),perm:["jev","view"]},
  {id:"theme",t:"تبديل المظهر نهاري/ليلي",s:"الثيم الحالي ↔ نسخته الليلية",ic:"settings",run:()=>SKosifShell.toggleAppearance()},
  {id:"looks",t:"اختيار الثيم",s:"تراث الوادي · التنفيذي · المراجعة · ليل التحليل · الدفتر",ic:"settings",run:()=>go("settings")},
  {id:"task",t:"مهمة جديدة",s:"بتاريخ استحقاق وأولوية",ic:"memo",run:()=>go("tasks"),perm:["tasks","view"]},
  {id:"journal",t:"قيد محاسبي جديد",s:"الدفاتر المحاسبية",ic:"finance",run:()=>go("ledger"),perm:["ledger","create"]},
  {id:"adv",t:"إظهار/إخفاء الأدوات المتقدمة",s:"التحليل والهندسة والمطابقة والمحاسبة",ic:"sensitivity",run:()=>core()&&core().setMode(core().mode()==="advanced"?"standard":"advanced")},
  {id:"lock",t:"قفل التطبيق الآن",s:"يتطلب كلمة المرور لفتحه",ic:"lock",run:()=>SK.lock.now()},
  {id:"keys",t:"اختصارات لوحة المفاتيح",s:"للابتوب: التنقل بالمجالات والحروف · ?",ic:"calc",run:()=>window.SKosifKeys&&SKosifKeys.help()},
  {id:"rail",t:"طيّ القائمة الجانبية / توسيعها",s:"أيقونات فقط لمساحة عمل أوسع على اللابتوب",ic:"dash",run:()=>SKosifShell.toggleRail()},
  {id:"install",t:"تثبيت SQC كتطبيق على هذا الجهاز",s:"الشاشة الرئيسية للآيفون أو Dock/قائمة ابدأ للابتوب",ic:"action",run:()=>SK.device&&SK.device.install()},
  {id:"transfer",t:"نقل البيانات بين الآيفون واللابتوب",s:"حزمة مشفرة عبر AirDrop أو واتساب أو الملفات",ic:"devices",run:()=>go("devices"),perm:["devices","view"]}
];
function allowed(a){return !a.perm||SK.perm.can(a.perm[0],a.perm[1])}
function items(){
  try{return(core().catalog().items||[]).filter(i=>i.status!=="archived").map(i=>({id:i.id,name:i.name,sub:(i.kind==="box"?"بوكس":"خام")+(i.price!=null?" · "+SK.money(i.price):" · بلا سعر")}))}catch{return[]}
}
const pins=()=>{const a=load(PIN_KEY,[]);return Array.isArray(a)?a:[]};
const recents=()=>{const a=load(REC_KEY,[]);return Array.isArray(a)?a.slice(0,6):[]};
function remember(ref){save(REC_KEY,[ref,...recents().filter(r=>JSON.stringify(r)!==JSON.stringify(ref))].slice(0,6))}

let wrap,inp,list,rows=[],sel=0,q="";
function build(){
  const M=SK.device?SK.device.mod:"Ctrl";
  wrap=document.createElement("div");wrap.className="skp-wrap";wrap.id="sk-palette";
  wrap.innerHTML='<div class="skp-backdrop" data-close></div><div class="skp" role="dialog" aria-modal="true" aria-label="بحث وانتقال سريع">'+
    '<div class="skp-head">'+SK.icons.search+'<input type="text" id="skp-inp" autocomplete="off" enterkeyhint="go" placeholder="ابحث أو انتقل… شاشة، صنف، عميل، إجراء، أو =12*4" aria-label="بحث" aria-controls="skp-list"><kbd>Esc</kbd></div>'+
    '<div class="skp-list" id="skp-list" role="listbox"></div>'+
    '<div class="skp-foot"><span><kbd>↑↓</kbd> تنقّل</span><span><kbd>Enter</kbd> فتح</span><span><kbd>'+M+'</kbd>+<kbd>P</kbd> تثبيت صنف</span><span><kbd>=</kbd> حاسبة</span><span><kbd>'+M+'</kbd>+<kbd>S</kbd> نسخة كاملة</span><span><kbd>F2</kbd> فاتورة · <kbd>F9</kbd> مخزون</span><span><kbd>?</kbd> كل الاختصارات</span></div></div>';
  document.body.appendChild(wrap);
  inp=$("#skp-inp",wrap);list=$("#skp-list",wrap);
  inp.addEventListener("input",()=>fill(inp.value));
  inp.addEventListener("keydown",e=>{
    if(e.key==="ArrowDown"){e.preventDefault();sel=Math.min(rows.length-1,sel+1);paint(true)}
    else if(e.key==="ArrowUp"){e.preventDefault();sel=Math.max(0,sel-1);paint(true)}
    else if(e.key==="Enter"){e.preventDefault();run()}
    else if(e.key==="Escape"){e.preventDefault();close()}
    else if((e.ctrlKey||e.metaKey)&&(e.key.toLowerCase()==="p"||e.code==="KeyP")){e.preventDefault();togglePin()}
  });
  list.addEventListener("click",e=>{const b=e.target.closest(".skp-i");if(!b)return;sel=+b.dataset.i;run()});
  wrap.addEventListener("click",e=>{if(e.target.hasAttribute("data-close"))close()});
}
function fill(v){
  q=v||"";
  const c=q.startsWith("=")?calc(q):null;
  if(c!=null){rows=[{g:"حاسبة",ic:"calc",t:"النتيجة: "+c,s:"Enter لنسخ النتيجة",run:()=>{navigator.clipboard&&navigator.clipboard.writeText(String(c)).then(()=>SK.toast("نُسخت: "+c,"ok"),()=>{})}}];sel=0;paint();return}
  const nq=norm(q),screens=[],acts=[],its=[];
  SK.caps.all().forEach(cap=>{if(!SK.perm.can(cap.id))return;const s=nq?score(nq,cap.label+" "+cap.sub+" "+cap.kw+" "+cap.groupLabel+" "+cap.hubLabel):0;if(!nq||s>0)screens.push({g:"الشاشات",ic:cap.id,t:cap.label,s:(cap.primary?"":"متقدم · ")+SK.caps.path(cap.id),sc:s,ref:{t:"v",id:cap.id},run:()=>go(cap.id)})});
  ACTIONS.filter(allowed).forEach(a=>{const s=nq?score(nq,a.t+" "+a.s):0;if(!nq||s>0)acts.push({g:"إجراءات",ic:a.ic,t:a.t,s:a.s,sc:s,ref:{t:"a",id:a.id},run:()=>a.run(q)})});
  if(nq.length>=2&&SK.perm.can("catalog")){const P=pins();items().forEach(it=>{const s=score(nq,it.name);if(s>0)its.push({g:"الأصناف",ic:"item",t:it.name+(P.includes(it.id)?" ★":""),s:it.sub,sc:s+(P.includes(it.id)?20:0),pin:it.id,ref:{t:"i",id:it.id,name:it.name},run:()=>core().openItem(it.id)})})}
  if(!nq){
    const P=pins(),all=items();
    const pinned=P.map(id=>all.find(x=>x.id===id)).filter(Boolean).map(it=>({g:"المثبّتة",ic:"item",t:it.name+" ★",s:it.sub,pin:it.id,ref:{t:"i",id:it.id,name:it.name},run:()=>core().openItem(it.id)}));
    const rec=recents().map(r=>r.t==="v"&&SK.caps.get(r.id)&&SK.perm.can(r.id)?{g:"الأخيرة",ic:r.id,t:SK.caps.get(r.id).label,s:SK.caps.path(r.id),ref:r,run:()=>go(r.id)}:
      r.t==="a"?(a=>a&&allowed(a)?{g:"الأخيرة",ic:a.ic,t:a.t,s:a.s,ref:r,run:()=>a.run("")}:null)(ACTIONS.find(x=>x.id===r.id)):
      r.t==="i"?{g:"الأخيرة",ic:"item",t:r.name,s:"صنف",ref:r,run:()=>core().openItem(r.id)}:null).filter(Boolean);
    rows=[...pinned,...rec,...acts.slice(0,6),...screens.filter(s=>SK.caps.get(s.ref.id).primary).slice(0,8)];
  }else{
    rows=[...screens,...acts,...its].sort((a,b)=>b.sc-a.sc).slice(0,16);
    if(SK.perm.can("customers"))rows.push({g:"بحث",ic:"customers",t:"ابحث عن «"+q+"» في العملاء والطلبات",s:"البحث الشامل",run:()=>core().search(q)});
  }
  sel=0;paint();
}
function hi(t){const e=esc(t);if(!q||q[0]==="=")return e;const i=t.toLowerCase().indexOf(q.toLowerCase());return i<0?e:esc(t.slice(0,i))+"<mark>"+esc(t.slice(i,i+q.length))+"</mark>"+esc(t.slice(i+q.length))}
function paint(scroll){
  if(!rows.length){list.innerHTML='<div class="skp-empty">لا نتائج — جرّب كلمة أخرى</div>';return}
  let h="",g="";
  rows.forEach((r,i)=>{if(r.g!==g){h+='<div class="skp-g">'+esc(r.g)+'</div>';g=r.g}
    h+='<button type="button" class="skp-i" role="option" id="skp-o'+i+'" data-i="'+i+'" aria-selected="'+(i===sel)+'"><span class="ic">'+SK.icon(r.ic)+'</span><span class="tx"><b>'+hi(r.t)+'</b><small>'+esc(r.s||"")+'</small></span></button>'});
  list.innerHTML=h;inp.setAttribute("aria-activedescendant","skp-o"+sel);
  if(scroll){const el=list.querySelector('[aria-selected="true"]');el&&el.scrollIntoView({block:"nearest"})}
}
function togglePin(){const r=rows[sel];if(!r||!r.pin)return;let P=pins();if(P.includes(r.pin)){P=P.filter(x=>x!==r.pin);SK.toast("أُلغي التثبيت","info")}else{P.unshift(r.pin);SK.toast("ثُبّت الصنف ★","ok")}save(PIN_KEY,P.slice(0,40));fill(inp.value)}
let releaseFocus=null,top=true;
function open(initial){
  if(document.querySelector("#pr-modal .modal"))return;
  if(!wrap)build();
  if(isOpen()){if(top){if(initial!==undefined){inp.value=initial||"";fill(inp.value)}inp.focus()}return}
  const opener=document.activeElement;wrap.classList.add("open");
  releaseFocus=SK.modalFocus(wrap.querySelector(".skp"),opener,{onTopChange:value=>{top=value}});
  inp.value=initial||"";fill(inp.value);inp.focus();
}
function close(){if(!isOpen())return;wrap.classList.remove("open");const release=releaseFocus;releaseFocus=null;release?.()}
function run(){const r=rows[sel];if(!r)return;close();if(r.ref)remember(r.ref);setTimeout(()=>{try{r.run()}catch(e){SK.errors.report(e,"palette")}},30)}
const isOpen=()=>!!(wrap&&wrap.classList.contains("open"));

document.addEventListener("keydown",e=>{
  const k=String(e.key||"").toLowerCase(),t=e.target;
  if(isOpen()&&!top)return;
  if(isOpen()&&e.key==="Escape"){e.preventDefault();e.stopImmediatePropagation();close();return}
  const typing=t&&(t.isContentEditable||/^(input|textarea|select)$/i.test(t.tagName));
  /* e.code keeps the shortcuts on the same keys with an Arabic keyboard layout */
  if((e.ctrlKey||e.metaKey)&&(k==="k"||e.code==="KeyK")){e.preventDefault();e.stopPropagation();isOpen()?close():open();return}
  if((e.ctrlKey||e.metaKey)&&(k==="s"||e.code==="KeyS")){e.preventDefault();SK.store.backup().catch(err=>SK.errors.report(err,"backup"));return}
  if(!typing&&!isOpen()&&(e.key==="/"||e.code==="Slash"&&!e.shiftKey)&&!e.ctrlKey&&!e.metaKey&&!e.altKey){e.preventDefault();open()}
  /* counter shortcuts: F2 invoice · F3 scale labels · F4 barcode · F8 events · F9 inventory */
  const F={F2:"zatca",F3:"labels",F4:"scanner",F8:"operations",F9:"inventory"}[e.key];
  if(F&&!typing&&!isOpen()&&SK.perm.can(F)&&SK.caps.get(F)){e.preventDefault();go(F)}
},true);
document.addEventListener("click",e=>{if(e.target.closest&&e.target.closest("[data-sk-palette]")){e.preventDefault();open()}});
window.SKosifCommand=Object.freeze({open,close,isOpen,
  /* the live assistant runs the same actions */
  actions:()=>ACTIONS.filter(allowed).map(a=>({id:a.id,t:a.t,s:a.s})),run:(id,q,contextCurrent)=>{const a=ACTIONS.find(x=>x.id===id);
    if(!a||!allowed(a)||contextCurrent&&(!contextCurrent()||["backup","install","demo"].includes(id)))return false;
    const result=a.run(q||"",contextCurrent);return contextCurrent&&result&&typeof result.then==="function"?result.then(v=>v!==false&&contextCurrent()):true}});
})();
