/* SQC executive pack: limited read-only management-ledger draft.
   Operational/global stores are deliberately unavailable until they can bind an immutable scope.
   Captured scope consistency does not establish historical ownership or professional assurance. */
(()=>{
"use strict";
const {$$,esc,load,save,toast}=SK;
const OPT="skosif_report_pack_v1";
const SECT=[["summary","الملخص التنفيذي"],["books","الدفاتر والإقفال"],["trend","اتجاهات المبيعات والمشتريات"],["sales","ذكاء المبيعات"],["risks","المخاطر"],["findings","الملاحظات المفتوحة"],["decisions","ما يحتاج قراراً"],["tasks","حالة المهام"],["signoff","الاعتماد والتوقيع"]];
const FIRST=["summary","trend","risks","findings","decisions","tasks","signoff"];
const opts=()=>{const raw=load(OPT,{})||{},o={sections:SECT.map(s=>s[0]),reviewer:"",approver:"",...raw};
  const seen=Array.isArray(o.seen)?o.seen:FIRST,chosen=Array.isArray(o.sections)?o.sections:[];
  o.sections=SECT.map(s=>s[0]).filter(k=>chosen.includes(k)||!seen.includes(k));return o};
const source=()=>window.SKosifManagementSource,model=()=>window.SKosifManagementModel;
const scope=()=>window.SKosifSpace?.scopeSnapshot?.();
const can=action=>!!(SK.perm?.can("execreports")&&SK.perm.can("ledger")&&SK.perm.can("execreports",action)&&SK.perm.can("ledger",action));
const freeze=v=>{if(v&&typeof v==="object"){Object.values(v).forEach(freeze);Object.freeze(v)}return v};
const text=v=>typeof v==="string"?v:"";
let revision=0,sequence=0,active=null;
const WATCH=new Set(["skosif_ledger_v1","skosif_companies_v1","sqc_helper_space_v1","sqc_helper_users_v1","aghnam-pricing-v3","skosif_profile_v1"]);
function invalidate(){revision++;if(active){active.stale=true;SK.output?.invalidate(active.w)}}
SK.onSave?.(key=>{if(WATCH.has(key))invalidate()});
SK.bus?.on("data",e=>{if(WATCH.has(e?.key))invalidate()});
for(const event of ["company","restore","role"])SK.bus?.on(event,invalidate);
addEventListener("storage",e=>{if(e.key===null||WATCH.has(e.key))invalidate()});
addEventListener("sk:org",invalidate);
/* A BFCache return must never resume a captured draft from a previous document visit. */
addEventListener("pagehide",invalidate);
function identityValue(){
  const s=scope(),o=SK.org(),p=load("skosif_profile_v1",{})||{};
  if(s?.status!=="stable"||text(o.biz).trim()!==s.context.entityName)throw new Error("IDENTITY_SCOPE_MISMATCH");
  return {name:s.context.entityName,fileStem:"SQC-executive-"+encodeURIComponent(s.entityId)+"-"+s.context.start+"-"+s.context.end,preparer:text(p.name)?text(p.name)+(text(p.title)?" — "+text(p.title):""):text(o.preparer),
    ids:[o.vatNo?"الرقم الضريبي "+esc(o.vatNo):"",o.crNo?"السجل التجاري "+esc(o.crNo):"",o.phone?esc(o.phone):"",o.addr?esc(o.addr):""].filter(Boolean)};
}
const current=s=>active===s&&!s.closed&&!s.stale&&!s.w.closed&&s.revision===revision;
function sync(s){
  if(!current(s)||!s.capture||!can("export"))return false;
  try{return model().canonical(identityValue())===s.identityText&&source().isCurrent(s.capture)}catch{return false}
}
async function fresh(s){
  if(!sync(s))return false;
  try{const f=await source().checkFresh(s.capture);return f.fresh&&sync(s)}catch{return false}
}
function close(s){if(!s||s.closed)return;s.closed=true;if(active===s)active=null;try{s.w.close()}catch{}}
function html(){
  const o=opts(),s=scope(),c=s?.status==="stable"?s.context:null;
  return '<div class="rp"><div class="rp-hero"><div><h3>الحزمة التنفيذية</h3><p>مسودة تنفيذية محدودة من الدفاتر الملتقطة للشركة والفترة المحددتين. الأقسام التشغيلية غير المتحققة تظهر غير متاحة.</p></div><button type="button" class="btn primary" data-rp="print">'+SK.icon("reports")+' معاينة المسودة</button></div>'+
    '<p class="note" data-rp-period>'+(c?esc(c.entityName)+" · "+esc(c.start)+" — "+esc(c.end)+" · "+esc(c.currency):'اختر شركة وفترة مالية صريحتين قبل إنشاء المسودة.')+'</p>'+
    '<div class="rp-opts"><div class="sk-field"><span>الأقسام</span><div class="rp-sec">'+SECT.map(([k,l])=>'<label class="sk-check"><input type="checkbox" value="'+k+'"'+(o.sections.includes(k)?' checked':'')+'> '+l+'</label>').join("")+'</div></div>'+
    '<div class="sk-grid2"><label class="sk-field"><span>راجعه</span><input id="rp-rev" value="'+esc(o.reviewer)+'"></label><label class="sk-field"><span>اعتمده</span><input id="rp-app" value="'+esc(o.approver)+'"></label></div></div></div>';
}
function bind(root){
  if(!root)return;
  root.addEventListener("click",e=>{if(e.target.closest('[data-rp="print"]'))print()});
  root.addEventListener("change",e=>{const o=opts();
    if(e.target.matches(".rp-sec input"))o.sections=$$(".rp-sec input:checked",root).map(x=>x.value);
    if(e.target.id==="rp-rev")o.reviewer=e.target.value.trim();
    if(e.target.id==="rp-app")o.approver=e.target.value.trim();
    o.seen=SECT.map(x=>x[0]);save(OPT,o);
  });
}
const money=(minor,currency)=>{const n=BigInt(minor),abs=n<0n?-n:n;return(n<0n?"−":"")+(abs/100n).toLocaleString("en-US")+"."+(abs%100n).toString().padStart(2,"0")+" "+currency};
const value=(v,calm)=>calm?'<bdi dir="ltr">'+esc(v)+'</bdi>':esc(v);
const unavailable=label=>'<section data-rp-unavailable><h2>'+esc(label)+'</h2><p class="note">غير متاح في هذه المسودة: لا يوجد مصدر مثبت لهذه الشركة والفترة لهذا القسم. لا يعني ذلك أن الرصيد أو العدد صفر.</p></section>';
function body(s,built){
  const c=s.capture.input.context,o=s.options,calm=s.calm,has=k=>o.sections.includes(k),m=built.model;
  const val=n=>value(money(n,c.currency),calm);
  let b='<div class="rp-cover"><div class="en">LIMITED EXECUTIVE DRAFT</div><h1>مسودة تنفيذية محدودة</h1><p>'+esc(c.entityName)+'</p><div class="meta"><span>الفترة المالية المختارة</span><b>'+esc(c.start)+" — "+esc(c.end)+'</b><span>العملة</span><b>'+esc(c.currency)+'</b><span>أعدّه</span><b>'+esc(s.identity.preparer||"—")+'</b><span>تاريخ الالتقاط</span><b>'+esc(s.capture.capturedAt)+'</b></div><div class="sky"></div></div>'+
    '<p class="note">النطاق: الدفاتر الملتقطة فقط. هذه مسودة إدارية وليست تقرير مراجعة أو اعتمادًا مهنيًا، ولا تثبت ملكية تاريخية للبيانات. اكتمال المبيعات والمقبوضات والعهد والوحدات الأخرى لم يُختبر.</p>';
  if(has("summary"))b+=m.summary?'<section><h2>الملخص التنفيذي</h2><p class="note">نتائج الفترة من قيود الدفاتر، وليست تدفقات نقدية أو مجاميع مبيعات تشغيلية.</p><div class="rp-k">'+[["إيرادات الدفاتر",m.summary.revenueMinor],["مصروفات الدفاتر",m.summary.expenseMinor],["نتيجة الدفاتر",m.summary.resultMinor]].map(([label,n])=>'<div><span>'+label+'</span><b>'+val(n)+'</b></div>').join("")+'</div></section>':unavailable("الملخص التنفيذي");
  if(has("books"))b+='<section><h2>الدفاتر والإقفال</h2><p class="note">أرصدة الدفاتر في '+esc(c.end)+'، بما فيها الأرصدة السابقة. حالة الإقفال والمطابقة البنكية والضريبة غير متاحة في هذه المسودة.</p><table class="rp-table rp-books"><thead><tr><th scope="col">الحساب</th><th scope="col">مدين</th><th scope="col">دائن</th></tr></thead><tbody>'+m.rows.map(r=>'<tr><td>'+esc(r.code+" "+r.label)+'</td><td class="rp-n">'+val(r.closingDebitMinor)+'</td><td class="rp-n">'+val(r.closingCreditMinor)+'</td></tr>').join("")+'<tr class="rp-total"><td>الإجمالي</td><td class="rp-n">'+val(m.totals.closingDebitMinor)+'</td><td class="rp-n">'+val(m.totals.closingCreditMinor)+'</td></tr></tbody></table></section>';
  for(const [k,label] of SECT)if(!["summary","books","signoff"].includes(k)&&has(k))b+=unavailable(label);
  if(has("signoff"))b+='<section><h2>الاعتماد والتوقيع</h2><p class="note">حقول مراجعة المسودة فقط؛ إدراج الأسماء لا يعني اعتمادًا أو إصدارًا.</p><div class="sign">'+[["أعدّه",s.identity.preparer],["راجعه",o.reviewer],["اعتمده",o.approver]].map(([l,v])=>'<div><span>'+l+'</span><b>'+esc(v||" ")+'</b><i>التوقيع والتاريخ</i></div>').join("")+'</div></section>';
  const provenance=[["الشركة",c.entityName],["معرّف الشركة",c.entityId],["بداية الفترة",c.start],["نهاية الفترة",c.end],["العملة",c.currency],["تاريخ الالتقاط",s.capture.capturedAt],["SHA-256 الدفاتر",s.capture.inputHash],["SHA-256 النطاق",s.capture.contextHash]];
  return b+'<table class="rp-table rp-binding" data-rp-binding><thead><tr><th scope="col">نطاق المسودة</th><th scope="col">القيمة الملتقطة</th></tr></thead><tbody>'+provenance.map(([k,v])=>'<tr><td>'+esc(k)+'</td><td>'+esc(v)+'</td></tr>').join("")+'</tbody></table>';
}
const PACK_CSS='.rp-cover{padding:34px 0 18px;text-align:center;break-after:page}.rp-cover h1{margin:40px 0 6px;font-size:32px;color:#0b1030}.rp-cover .en{font:700 13px Montserrat,sans-serif;letter-spacing:.2em;color:#2340c4}'+
 '.rp-cover .meta{display:inline-grid;grid-template-columns:auto auto;gap:8px 24px;margin-top:36px;padding:18px 26px;border:1px solid #e4eaf2;border-radius:14px;text-align:start;font-size:13px}.rp-cover .meta span{color:#5a6a80}'+
 '.rp-cover .sky{height:170px;margin:26px 0 0;border-radius:18px;background:#0b1030 url(ART) center/cover no-repeat}'+
 'section{break-inside:avoid;margin-bottom:16px}.rp-k{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.rp-k div{padding:10px 12px;border:1px solid #e4eaf2;border-radius:10px;background:#f8fafd}.rp-k span{display:block;font-size:10.5px;color:#5a6a80}.rp-k b{display:block;font:800 17px Montserrat,"IBM Plex Sans Arabic",sans-serif;color:#0b1030}.rp-k b.bad{color:#d3322a}.rp-k b.ok{color:#12884a}'+
 '.skch-legend{display:flex;gap:14px;font-size:10.5px;color:#44566f;margin:4px 0}.skch-legend span{display:inline-flex;align-items:center;gap:5px}.skch-legend i{width:10px;height:10px;border-radius:3px;display:inline-block}.skch-legend i.ln{height:3px;width:14px}'+
 '.skch svg{width:100%;height:auto}.skch .grid line{stroke:#edf1f7}.skch text{fill:#5a6a80;font-size:10.5px;font-family:"IBM Plex Sans Arabic",sans-serif}.skch .hit{fill:transparent}.skch .line{fill:none;stroke-width:2.2}.skch .pt{stroke:#fff;stroke-width:2}'+
 '.skhm{display:grid;grid-template-columns:auto 1fr;gap:4px 8px;align-items:center;max-width:360px}.skhm-y{writing-mode:vertical-rl;transform:rotate(180deg);font-size:10px;color:#5a6a80}.skhm-grid{display:grid;grid-template-columns:auto repeat(3,1fr);gap:3px}.skhm-grid .lab{font-size:10px;color:#5a6a80;text-align:center}'+
 '.skhm-cell{min-height:38px;border:0;border-radius:6px;font:700 13px Montserrat,sans-serif;color:#0b1030}.skhm-cell.h1{background:#bfe9cf}.skhm-cell.h2{background:#f8e38b}.skhm-cell.h3{background:#f8b27e}.skhm-cell.h4{background:#f27f7f}.skhm-x{grid-column:2;text-align:center;font-size:10px;color:#5a6a80}'+
 '.two{display:grid;grid-template-columns:auto 1fr;gap:18px;align-items:start}.sev{display:inline-block;padding:1px 8px;border-radius:6px;font-size:10.5px;font-weight:700}.sev.high{background:#fdebea;color:#d3322a}.sev.medium{background:#fff2dc;color:#b86204}.sev.low{background:#e8ecfd;color:#2340c4}'+
 '.sign{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:10px}.sign div{padding:12px;border:1px solid #e4eaf2;border-radius:10px;min-height:92px}.sign span{display:block;font-size:10.5px;color:#5a6a80}.sign b{display:block;margin:4px 0 26px}.sign i{display:block;border-top:1px dashed #b8c4d4;padding-top:4px;font-style:normal;font-size:10px;color:#5a6a80}'+
 '.note{font-size:10.5px;color:#5a6a80}';

/* Compact financial paper, scoped to this report. Other looks retain PACK_CSS. */
const CALM_PACK_CSS='.rp-paper{font-size:14px;line-height:1.65;color:#25242b;font-variant-numeric:tabular-nums}'+
 '.rp-paper .skp-band{background:#fff!important;border-radius:0;border-bottom:2px solid #2340c4;padding:0 0 12px;color:#25242b}.rp-paper .skp-mark b,.rp-paper .skp-doc b{color:#25242b}.rp-paper .skp-mark span,.rp-paper .skp-doc span,.rp-paper .skp-ids{color:#64636d}'+
 '.rp-paper .rp-cover{padding:0 0 16px;text-align:start;break-after:auto;border-bottom:1px solid #dedee4;margin-bottom:20px}.rp-paper .rp-cover h1{margin:8px 0;font-size:26px;color:#25242b}.rp-paper .rp-cover .en{font-size:11px;letter-spacing:.08em;color:#64636d}.rp-paper .rp-cover p{margin:4px 0}'+
 '.rp-paper .rp-cover .meta{display:grid;grid-template-columns:auto minmax(0,1fr) auto minmax(0,1fr);gap:6px 18px;margin-top:14px;padding:0;border:0;border-radius:0;font-size:13px}.rp-paper .rp-cover .meta span{color:#64636d}.rp-paper .rp-cover .meta b{overflow-wrap:anywhere}.rp-paper .rp-cover .sky{display:none}'+
 '.rp-paper section{break-inside:auto;margin-bottom:22px}.rp-paper h2{color:#25242b;font-size:18px;border:0;padding:0;margin:18px 0 10px;break-after:avoid}.rp-paper .rp-k{gap:10px;break-inside:avoid}.rp-paper .rp-k div{background:#fff;border:1px solid #dedee4;border-radius:6px;padding:10px}.rp-paper .rp-k span{font-size:12px;color:#64636d}.rp-paper .rp-k b{font-size:18px;font-weight:600;overflow-wrap:anywhere}'+
 '.rp-paper table{border:0;border-radius:0;border-collapse:collapse;overflow:visible;font-size:14px;table-layout:fixed}.rp-paper th,.rp-paper td{padding:8px 6px;border-bottom:1px solid #dedee4;vertical-align:top;overflow-wrap:anywhere}.rp-paper th{background:#fff!important;color:#4b4a54;border-bottom:1px solid #898793;font-size:12px;font-weight:600}.rp-paper tr:nth-child(even) td{background:#fff}.rp-paper thead{display:table-header-group}.rp-paper tr{break-inside:avoid;page-break-inside:avoid}.rp-paper .rp-n{direction:ltr;unicode-bidi:isolate;text-align:right;font-variant-numeric:tabular-nums}.rp-paper .rp-total td{border-top:2px solid #898793;border-bottom:0;font-weight:700}'+
 '.rp-paper .rp-findings th:first-child{width:12%}.rp-paper .rp-findings th:nth-child(2){width:50%}.rp-paper .rp-findings th:nth-child(3){width:14%}.rp-paper .rp-findings th:nth-child(4){width:10%}.rp-paper .rp-findings th:nth-child(5){width:14%}.rp-paper .rp-decisions th:first-child{width:15%}.rp-paper .rp-decisions th:nth-child(2){width:30%}.rp-paper .rp-decisions th:nth-child(3){width:55%}.rp-paper .rp-tasks th:first-child{width:50%}.rp-paper .rp-tasks th:nth-child(2),.rp-paper .rp-tasks th:nth-child(3){width:25%}'+
 '.rp-paper .rp-risks th:nth-child(2){width:30%}.rp-paper .rp-books th:first-child,.rp-paper .rp-trend th:first-child{width:28%}.rp-paper .two{display:block}.rp-paper .two .skhm{margin-bottom:16px}.rp-paper .note,.rp-paper small,.rp-paper .muted{font-size:12px;color:#64636d;orphans:3;widows:3}.rp-paper .sign{break-inside:avoid}.rp-paper .sign div{border-color:#dedee4;border-radius:6px}.rp-paper .sign span,.rp-paper .sign i{font-size:12px;color:#64636d}.rp-paper .skp-foot{color:#64636d;border-color:#dedee4}'+
 '.rp-paper .rp-sales-recs th:first-child{width:13%}.rp-paper .rp-sales-recs th:nth-child(2){width:57%}.rp-paper .rp-sales-follow th:first-child{width:30%}.rp-paper .rp-k small{display:block;margin-top:2px}'+
 '@media screen and (max-width:600px){.rp-paper .rp-cover .meta{grid-template-columns:auto minmax(0,1fr)}.rp-paper .rp-k{grid-template-columns:repeat(2,minmax(0,1fr))}.rp-paper .sign{grid-template-columns:minmax(0,1fr)}}';
async function print(){
  if(!can("view")||!can("export")){toast("صلاحية عرض الدفاتر والتقرير أو التصدير غير متاحة.","warn");return}
  if(!source()?.capture||!source()?.isCurrent||!SK.output?.guard||!SK.onSave){toast("تعذر تثبيت نطاق التقرير. أعد تحميل التطبيق.","warn");return}
  close(active);
  let identity;try{identity=identityValue()}catch{toast("تعذر تثبيت الشركة والفترة وهوية الترويسة. أعد اختيار النطاق.","warn");return}
  const w=window.open("","_blank");if(!w){toast("اسمح بمعاينة التقرير","warn");return}
  const s={id:++sequence,w,revision,closed:false,stale:false,capture:null,options:freeze(opts()),calm:document.documentElement.getAttribute("data-look")==="kosif"&&document.documentElement.getAttribute("data-theme")==="light"};active=s;
  s.identityText=model().canonical(identity);s.identity=freeze({...identity,date:new Date().toLocaleDateString("ar-SA-u-ca-gregory-nu-latn",{day:"numeric",month:"long",year:"numeric"})});
  const guard={identity:s.identity,checkSync:()=>sync(s),check:()=>fresh(s),onClose:()=>{s.closed=true;if(active===s)active=null}};
  w.document.write('<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>جارٍ التقاط المسودة</title></head><body><p>جارٍ التحقق من نطاق الشركة والدفاتر…</p></body></html>');w.document.close();
  if(!SK.output.guard(w,guard)){close(s);return}
  try{
    const captured=await source().capture();if(!current(s))return;
    if(!captured.ok)throw new Error("CAPTURE_UNAVAILABLE");s.capture=captured;
    if(captured.input.context.entityName!==s.identity.name||!await fresh(s))throw new Error("CAPTURE_STALE");
    const built=model().build(captured.input);if(!built.ok)throw new Error("LEDGER_UNAVAILABLE");
    const content=body(s,built);if(!sync(s))throw new Error("CAPTURE_STALE");
    const base=location.href.replace(/[^/?#]*([?#].*)?$/,"");
    w.document.open();w.document.write('<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>مسودة تنفيذية محدودة — '+esc(s.identity.name)+'</title><meta name="sqc-company" content="'+esc(captured.input.context.entityId)+'"><meta name="sqc-period" content="'+esc(captured.input.context.start+"/"+captured.input.context.end)+'"><meta name="sqc-source-sha256" content="'+esc(captured.inputHash)+'"></head><body>'+content+'</body></html>');w.document.close();
    SK.brandPrint(w,"مسودة تنفيذية محدودة",s.identity);
    if(s.calm){w.document.body.classList.add("rp-paper");const mark=w.document.querySelector(".skp-band img");if(mark)mark.src=base+"art/sqc-mark-dark.svg"}
    const st=w.document.createElement("style");st.textContent=(window.SK&&SK.brandCSS?SK.brandCSS:String)(PACK_CSS.replace("ART",base+"art/kosif-sky.svg")+(s.calm?CALM_PACK_CSS:""));w.document.head.appendChild(st);
    /* document.open clears event listeners: the output guard is installed only after final close/branding. */
    if(!SK.output.guard(w,guard)){close(s);return}
    if(!sync(s)){SK.output.invalidate(w);return}
    SK.audit?.log("report",{act:"executive-pack-limited"});
  }catch{if(current(s)){toast("تعذر إنشاء المسودة: تحقق من الشركة والفترة والعملة وسلامة الدفاتر، ثم أعد الالتقاط.","warn");close(s)}}
  finally{if((s.stale||s.closed||active!==s)&&!w.closed)close(s)}
}
window.SKosifReportPack=Object.freeze({html,bind,print});
})();
