/* S.kosif — مراجعة ميزان المراجعة (شاشة «tbreview»): مراجعة حسابات أي شركة بالخطوات:
     1 استلام الميزان من الشركة (Excel أو CSV أو لصق) مع السنة السابقة إن وجدت
     2 التطبيق يضع أرقام المعايير المناسبة بجوار كل حساب؛ الضغط على رقم المعيار يعرض علاقة المعيار
       بالحساب ومتطلباته وإجراءات مراجعته ومصدره الرسمي (SKosifCodex)
     3 Gemini يراجع (بمفتاح المستخدم): يؤكد المعايير، يكتشف الأخطاء، يطلب مستندات إضافية
     4 رفع المستندات → Gemini يراجعها في جولة ثانية … وتستمر الجولات حتى ينهي طلباته
     5 قيود التسوية المقترحة (المحرك + Gemini، كلها متوازنة ومتحقق منها) ومناقشة الامتثال لكل معيار
     6 التقارير: القوائم المالية بعرض IFRS 18 قبل التسويات وبعدها، التحليل المالي، تقرير الإدارة،
       الرأي المشتق وفق ISA 705 والأمور الرئيسية للمراجعة وخطاب الإدارة — للطباعة والتصدير
   يعمل المحرك الآلي دون مفتاح؛ Gemini يضيف الحكم المهني وقراءة المستندات.
   البيانات: skosif_tbreview_v1 (الميزان والجولات والقرارات) + IndexedDB «skosif-tbreview-docs» لمحتوى
   المستندات المرفوعة (لا يدخل في النسخة الكاملة لحجمه). */
(()=>{
"use strict";
const {esc,load,save,toast}=SK;
const KEY="skosif_tbreview_v1",MAX_FILE=15*1024*1024,MAX_ROUND=18*1024*1024;
const FW=()=>window.SKosifFieldwork&&window.SKEngines&&SKEngines.audit.fieldwork?window.SKosifFieldwork:null;
const E=()=>window.SKEngines,RV=()=>E().audit.tbReview,AI=()=>E().audit.aiReview,DC=()=>E().audit.documentCheck,CX=()=>E().audit.codex,PG=()=>E().audit.programme,DS=()=>E().audit.disclosures;
const TI=()=>E().reports.tbImport,FS=()=>E().reports.statements,AN=()=>E().reports.analysis,MN=()=>E().reports.money;
const TABS=[["tb","الميزان والمعايير"],["plan","العمل الميداني"],["ai","جولات المراجعة"],["conf","الثقة والمجلس"],["docs","المستندات"],["adj","التسويات والامتثال"],["close","الإكمال"],["fs","القوائم والتقارير"]];
const CU=()=>window.SKosifCouncilUI,AP=()=>window.SKosifAuditPractice,CP=()=>window.SKosifCompanyPlatform;
let root=null,tab="tb",filter="all",busy="",abort=null,cache=null,setup=false,fsAfter=true,doc="issue",confHTML={sig:"",h:""},confSeq=0;

/* ---------- state ---------- */
const blank=()=>({ctx:{company:"",period:"",periodStart:"",periodEnd:"",activity:"",country:"SA",framework:"IFRS",currency:"الريال السعودي",legalForm:"",registeredOffice:"",principalPlace:""},fw:{},tbText:"",overrides:{},materiality:null,session:null,accepted:[],rejected:[],ecl:null,
  confirm:{independence:false,edition:false,compliance:false,unrecognized:false,partner:false}});
const st=()=>{const d=load(KEY,null);return d&&typeof d==="object"?{...blank(),...d,ctx:{...blank().ctx,...(d.ctx||{})},confirm:{...blank().confirm,...(d.confirm||{})}}:blank()};
let CUR="ر.س";const egypt=d=>d.ctx.country==="EG"||d.ctx.framework==="EAS";
/* a new trial balance starts a new file: rounds, decisions and the council's record (approvals, states, checklists, exceptions, thresholds, journal) */
const fresh=d=>{d.session=null;d.accepted=[];d.rejected=[];d.overrides={};["engagement","checklists","exceptions","thOverrides","evidenceMeta","journalSource","journalMeta","letterResponses"].forEach(k=>delete d[k]);confHTML={sig:"",h:""};return d};
const put=d=>{try{save(KEY,d)}catch{toast("مساحة التخزين لا تكفي — صدّر التقرير ثم ابدأ مراجعة جديدة","bad")}cache=null};
const m0=v=>MN().formatMinor(v||0,{decimals:0});
const sar=v=>m0(v)+" "+CUR;
const sevCls=s=>s==="high"?"bad":s==="medium"?"warn":"info";
const SEV_AR={high:"عالية",medium:"متوسطة",low:"منخفضة"};
const famCls=code=>{const s=CX().STANDARD[code];return "std-"+String(s?s.family:"x").toLowerCase()};
const FW_LABEL={IFRS:"IFRS المعتمدة في المملكة",SME:"معيار المنشآت الصغيرة والمتوسطة (المملكة)",EAS:"معايير المحاسبة المصرية"};

/* ---------- documents (IndexedDB) ---------- */
function idb(){return new Promise((res,rej)=>{if(!("indexedDB" in window))return rej(new Error("المتصفح لا يدعم التخزين المحلي للمستندات"));const r=indexedDB.open("skosif-tbreview-docs",1);r.onupgradeneeded=()=>r.result.createObjectStore("docs");r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
async function docPut(k,v){const db=await idb();return new Promise((res,rej)=>{const t=db.transaction("docs","readwrite");t.objectStore("docs").put(v,k);t.oncomplete=()=>res();t.onerror=()=>rej(t.error)})}
async function docGet(k){const db=await idb();return new Promise((res,rej)=>{const t=db.transaction("docs","readonly"),q=t.objectStore("docs").get(k);q.onsuccess=()=>res(q.result||null);q.onerror=()=>rej(q.error)})}
/* only the open file's documents (their keys begin with its review session id): the other client files keep theirs */
async function docClear(){try{const sid=(st().session||{}).id;if(!sid)return;const db=await idb();await new Promise(res=>{const t=db.transaction("docs","readwrite"),c=t.objectStore("docs").openCursor();
  c.onsuccess=()=>{const x=c.result;if(!x)return;if(String(x.key).startsWith(sid+"|"))x.delete();x.continue()};t.oncomplete=res;t.onerror=res})}catch{}}

/* ---------- the engagement register: several client files on one device ----------
   The open file stays in skosif_tbreview_v1 (every module reads it there); the others wait in skosif_eng_<id>. */
const searchText=s=>String(s||"").toLowerCase().replace(/[أإآٱ]/g,"ا").replace(/[\u064b-\u065f\u0670]/g,"").replace(/امازون/g,"amazon").trim();
const ENG="skosif_engagements_v1";
const reg=()=>{const r=load(ENG,null);return r&&Array.isArray(r.list)?r:{active:"main",list:[]}};
function register(){
  const r=reg(),d=st(),id=r.active||"main";let e=r.list.find(x=>x.id===id);
  if(!e){e={id,at:new Date().toISOString()};r.list.push(e)}
  Object.assign(e,{company:d.ctx.company||"ملف بلا اسم",period:d.ctx.periodEnd||d.ctx.period||"",country:d.ctx.country||"",source:d.source||e.source||"user",hasTB:!!d.tbText,
    rounds:d.session&&d.session.rounds?d.session.rounds.length:0,updatedAt:new Date().toISOString()});
  r.active=id;save(ENG,r);return r;
}
function openFile(id){
  const r=register();if(id===r.active)return;
  save("skosif_eng_"+r.active,st());put(load("skosif_eng_"+id,null)||blank());r.active=id;save(ENG,r);register();
  tab="tb";setup=false;confHTML={sig:"",h:""};paint();
}
function newFile(state,meta={}){
  const r=register();save("skosif_eng_"+r.active,st());
  const id=SK.ui.uid("eng");put(state||blank());r.active=id;r.list.push({id,at:new Date().toISOString(),...meta});save(ENG,r);register();
  tab="tb";setup=false;confHTML={sig:"",h:""};paint();return id;
}
async function closeFile(id){
  const r=register();if(r.list.length<2){toast("هذا هو الملف الوحيد — استخدم «مراجعة جديدة» لتفريغه","info");return}
  const e=r.list.find(x=>x.id===id);if(!e||!await SK.confirm("حذف ملف «"+e.company+"» من هذا الجهاز؟ تُحذف جولاته وقراراته.",{danger:true,ok:"حذف الملف"}))return;
  if(id===r.active){const next=r.list.find(x=>x.id!==id);await docClear();put(load("skosif_eng_"+next.id,null)||blank());r.active=next.id}
  localStorage.removeItem("skosif_eng_"+id);r.list=r.list.filter(x=>x.id!==id);save(ENG,r);register();paint();
}
function filesBar(){
  const r=register(),L=r.list.slice().sort((a,b)=>(a.id===r.active?-1:b.id===r.active?1:0)||String(b.updatedAt).localeCompare(String(a.updatedAt)));
  return '<section class="tbr-files" aria-label="ملفات المراجعة"><div class="tbr-files-h"><b>ملفات المراجعة</b><small>'+r.list.length+' ملف على هذا الجهاز</small></div><div class="tbr-files-l">'+
    L.map(e=>'<div class="tbr-file'+(e.id===r.active?' on':'')+'"><button type="button" data-file-open="'+esc(e.id)+'" title="فتح الملف"><b>'+esc(e.company)+'</b><small>'+esc([e.period,e.source==="bundle"?"من الحزمة العالمية":"",e.rounds?e.rounds+" جولة":"",e.hasTB?"":"بلا ميزان"].filter(Boolean).join(" · "))+'</small></button>'+
      (r.list.length>1?'<button type="button" class="tbr-file-x" data-file-close="'+esc(e.id)+'" aria-label="حذف الملف">×</button>':'')+'</div>').join("")+
    '<button type="button" class="tbr-file-new" data-file-new>+ ملف جديد</button><button type="button" class="tbr-file-new tbr-file-show" data-bundle-open>نماذج التقارير المنشورة</button></div></section>';
}
/* ---------- the bundle's companies as audit clients (ui/data/bundle-clients.json, loaded on demand), and as the
   showcase of the whole app: pick one, and it is audited end to end without an AI key, then toured screen by screen ---------- */
let bundle=null;const pick={q:"",sector:""};
async function bundleData(){if(bundle)return bundle;const r=await fetch("./data/bundle-clients.json");if(!r.ok)throw new Error("تعذر تحميل بيانات الشركات");bundle=await r.json();return bundle}
/* each client with its sector from the corpus (banks and insurers included), named in Arabic */
function bundleList(B){
  const CC=E().reports.corpusCompanies;
  return CC&&CC.auditModelCatalog?CC.auditModelCatalog():[];
}
function bundleRows(L){
  const have=new Set(reg().list.filter(e=>e.bundleId).map(e=>e.bundleId)),q=searchText(pick.q);
  const list=L.filter(c=>(!pick.sector||c.sector===pick.sector)&&(!q||searchText([c.company,c.countryAr,c.auditor,c.sectorAr,c.fy,c.modelStatusAr,c.reference?.review_label_ar].join(" ")).includes(q)));
  return list.length?list.map(c=>'<tr data-model-id="'+esc(c.id)+'" data-model-status="'+esc(c.modelStatus)+'"><td><b>'+esc(c.company)+' — '+esc(c.fy)+'</b><small>'+esc([c.sectorAr,c.countryAr,c.unitAr].filter(Boolean).join(" · "))+'</small><p>'+esc(c.supportReason)+'</p></td><td>'+esc(c.frameworkAr)+'<br><strong>نموذج التطبيق: '+esc(c.modelStatusAr)+'</strong><small>حالة المصدر: '+esc(c.reference?.review_label_ar||'حالة مراجعة المصدر غير متاحة')+'</small></td><td class="tbr-bundle-a">'+(c.auditFile?'<button type="button" class="btn sm" data-bundle-show="'+esc(c.id)+'">عرض القدرات</button>':'')+
    (c.auditFile?'<button type="button" class="btn primary sm" data-bundle-add="'+esc(c.id)+'">'+(c.modelStatus==='pending-review'?'فتح كملف مراجعة':c.modelStatus==='partially-supported'?'فتح النموذج الجزئي':'فتح نموذج المصدر')+'</button>'+(have.has(c.id)?'<button type="button" class="btn sm" data-bundle-go="'+esc(c.id)+'">إعادة فتح النموذج المحفوظ</button>':''):'<button type="button" class="btn sm" disabled>'+esc(c.modelStatusAr)+'</button>')+'</td></tr>').join("")
    :'<tr><td colspan="3" class="muted">لا يوجد نموذج بهذا البحث.</td></tr>';
}
/* R16: the reviewed published sources (Home Depot, McDonald's, Mercedes, Volkswagen) live in ui/data/engines-sources.js and
   join the engines on demand; the audit file asks for them before it opens or lists a bundle company, and repaints once
   they arrive so a saved source file is verified against them */
const sources=()=>{try{return window.SKEngines&&SKEngines.loadSources?SKEngines.loadSources():Promise.resolve()}catch{return Promise.resolve()}};
let sourcesAsked=false;
async function bundlePicker(){
  try{await sources()}catch{}
  let B;try{B=await bundleData()}catch(e){toast(e.message,"bad");return}
  document.getElementById("tbr-bundle")?.remove();
  const L=bundleList(B),n={};L.forEach(c=>{if(c.sector)n[c.sector]=(n[c.sector]||0)+1});
  const w=document.createElement("div");w.className="skd-wrap";w.id="tbr-bundle";
  w.innerHTML='<div class="skd tbr-bundle" role="dialog" aria-modal="true" aria-labelledby="tbr-bundle-t"><span class="eyebrow">المراجعة · نماذج المصادر</span><h3 id="tbr-bundle-t">نماذج التقارير المنشورة</h3><small class="muted">'+L.filter(c=>c.modelStatus==='source-replayed').length+' نماذج مطابقة للمصدر · '+L.filter(c=>c.modelStatus==='partially-supported').length+' مدعوم جزئياً · '+L.filter(c=>c.modelStatus==='pending-review').length+' بانتظار اعتماد نموذج التطبيق · '+L.filter(c=>c.modelStatus==='unavailable').length+' غير متاح</small>'+
    '<p>القوائم المنشورة تُعرض كمرجع مصدر بفتراتها ووحداتها الأصلية، وليست دفتر أستاذ أو دليل مراجعة. السجلات الباقية ليست نماذج مكتملة الاختبار؛ تبقى حالتها معلنة ولا تثبت تنفيذ إجراءات تأكيد.</p>'+
    '<div class="tbr-bundle-f"><input type="search" data-bundle-q placeholder="ابحث باسم الشركة أو الدولة أو المراجع" aria-label="بحث في الشركات" value="'+esc(pick.q)+'">'+
    '<select data-bundle-sector aria-label="القطاع"><option value="">كل القطاعات ('+L.length+')</option>'+Object.keys(n).map(k=>'<option value="'+esc(k)+'"'+(k===pick.sector?' selected':'')+'>'+esc((L.find(c=>c.sector===k)||{}).sectorAr||k)+' ('+n[k]+')</option>').join("")+'</select></div>'+
    '<div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>الشركة</th><th>الإطار</th><th></th></tr></thead><tbody data-bundle-rows>'+bundleRows(L)+'</tbody></table></div>'+
    '<div class="skd-acts"><button type="button" class="btn" data-bundle-close>إغلاق</button></div></div>';
  document.body.appendChild(w);
  const redraw=()=>{const t=w.querySelector("[data-bundle-rows]");if(t)t.innerHTML=bundleRows(L)};
  w.addEventListener("input",e=>{if(e.target.matches("[data-bundle-q]")){pick.q=e.target.value;redraw()}});
  w.addEventListener("change",e=>{if(e.target.matches("[data-bundle-sector]")){pick.sector=e.target.value;redraw()}});
  w.addEventListener("click",e=>{if(e.target===w||e.target.closest("[data-bundle-close]")){w.remove();return}
    const add=e.target.closest("[data-bundle-add]"),go=e.target.closest("[data-bundle-go]"),show=e.target.closest("[data-bundle-show]");
    if(show){w.remove();showcase(show.dataset.bundleShow);return}
    if(go){const f=reg().list.find(x=>x.bundleId===go.dataset.bundleGo);w.remove();if(f)openFile(f.id);return}
    if(add){w.remove();openClient(add.dataset.bundleAdd)}});
  const i=w.querySelector("[data-bundle-q]");i&&!matchMedia("(pointer:coarse)").matches&&i.focus();
}
/* the showcase: the company's own file (opened again if it exists), its full audit run once, then the tour */
async function showcase(id){
  if(busy)return null;
  const fid=await openClient(id);if(!fid)return null;
  let d=st();
  if(compute()?.sourceReplay){tab="fs";paint();return fid;}
  if(!(d.session&&d.session.final&&d.demoRun)){await runDemo();d=st()}
  if(!(d.session&&d.session.final))return null;
  d.showcase={at:new Date().toISOString()};put(d);tab="tb";paint();
  SK.audit&&SK.audit.log("tbreview",{act:"showcase",id});
  const t=root&&root.querySelector(".tbr-tour");if(t)t.scrollIntoView({block:"start"});
  return fid;
}
/* the tour: what the app produced for this company, each step opening the screen or tab that holds it */
function tourHTML(c){
  const d=c.d;if(!d.showcase||!d.bundleId)return"";
  const s=d.session||{},rounds=(s.rounds||[]).length,G=E().audit.globalBenchmarks,R=E().audit.corpusReplay;
  let rp=null;try{rp=R&&R.replayCompany?R.replayCompany(d.bundleId):null}catch{/* the replay is optional */}
  const hit=rp?rp.actual.filter(a=>a.found!=="missed").length:0,rep=G&&G.reportOf?G.reportOf(d.bundleId):null,form={US:"PCAOB",UK:"ISA (UK) الموسّع",SA:"النموذج السعودي",AE:"النموذج الإماراتي",EG:"النموذج المصري",INT:"ISA 700"}[d.ctx.reportForm]||"ISA 700";
  const can=v=>SK.caps&&SK.caps.get(v)&&(!SK.perm||SK.perm.can(v));
  const steps=[
    ["tab:tb","الميزان والمعايير",c.tb.rows.length+" حساباً من قوائمها المنشورة · الأهمية النسبية "+m0(c.base.materiality.overall)],
    ["tab:plan","العمل الميداني","مصفوفة المخاطر ("+(c.base.risks||[]).length+") والاستراتيجية وأوراق العمل والمعاينة"],
    ["tab:ai","جولات المراجعة",rounds+" جولات · "+((d.demoRun&&d.demoRun.docs)||0)+" مستنداً مرفوعاً ومقيّماً"],
    ["tab:conf","الثقة ومجلس المراجعين","درجة ثقة لكل حساب وفحوص المجلس"],
    ["tab:adj","التسويات والامتثال",((d.accepted||[]).length?(d.accepted||[]).length+" قيد تسوية معتمد":"لا تسويات مقترحة على ميزانها")+" · فحص الامتثال"],
    ["tab:close","الإكمال","الاستمرارية والأحداث اللاحقة وخطاب الإفادات وبوابة الإصدار"],
    ["doc:auditor","تقرير المراجع المستقل",c.derived.ar+" · بشكل "+form],
    ["doc:integrated","التقرير السنوي المتكامل","القصة والحوكمة والقوائم والإيضاحات، بترتيب تقارير الحزمة"],
    ["view:auditanalytics","التحليل والاختبارات","بنفورد والمعاينة واختبار القيود والنسب على ميزانها"],
    ["view:corpuslab","مقارنتها بمراجعها الفعلي",rp?(rp.auditor||"المراجع")+": "+rp.actual.length+" أمور رئيسية — وجدنا منها "+hit:"مقارنة بما أصدره مراجعها الفعلي"],
    ["view:auditbench","المرجع العالمي","سوابق قطاعها"+(rep&&rep.sector?" ("+((G.SECTOR_AR||{})[rep.sector]||rep.sector)+")":"")+" وأهميتها النسبية والأمور الرئيسية"]
  ].filter(([k])=>!k.startsWith("view:")||can(k.slice(5)));
  return '<section class="card tbr-tour" aria-labelledby="tbr-tour-t"><div class="tbr-tour-h"><div><span class="eyebrow">جولة القدرات</span><h3 id="tbr-tour-t">ماذا فعل SQC مع «'+esc(d.ctx.company)+'»</h3>'+
    '<p>مراجعة كاملة دون مفتاح ذكاء اصطناعي: المستندات مولّدة من أرقام ميزانها لعرض القدرات. اضغط أي خطوة لترى نتيجتها.</p></div>'+
    '<div class="sk-actions"><button type="button" class="btn sm" data-bundle-open>شركة أخرى</button><button type="button" class="btn sm" data-tour-hide>إخفاء الجولة</button></div></div>'+
    '<ol class="tbr-tour-l">'+steps.map(([k,t,x],i)=>'<li><button type="button" data-tour="'+esc(k)+'"><span class="tbr-tour-n">'+(i+1)+'</span><b>'+esc(t)+'</b><small>'+esc(x)+'</small></button></li>').join("")+'</ol></section>';
}
/* one way to open a company of the research bundle: its own engagement file (opened again if it exists), the
   trial balance built from its published statements (line by line), its auditor, year end and report form, and
   the benchmark context (sector, currency, tax, framework, auditing standard) the key matters and requests use */
async function openClient(id){
  /* the reviewed adapters (ui/data/engines-sources.js) decide how a company opens; no wait once they have joined */
  if(!(E().reports&&E().reports.volkswagenSource))try{await sources()}catch{}
  /* R16: a company with a reviewed published source opens as its source replay (#143); every other bundle company with
     statements still opens as an audit file from its corpus model, so the file reaches the corpus replay (PRODUCT_MANDATE,
     P5). Only a company with no usable statements stays closed, with the reason. */
  const CCx=E().reports.corpusCompanies,unavailable=CCx.sourceUnavailableReason?.(id);
  if(unavailable&&!(CCx.companyTrialBalance&&CCx.companyTrialBalance(id))){toast(unavailable,"warn");return null;}
  const f=reg().list.find(x=>x.bundleId===id);if(f){openFile(f.id);if(window.SKosifCore&&SKosifCore.view()!=="tbreview")SKosifCore.go("tbreview");return f.id}
  let B=null;try{B=await bundleData()}catch{}
  const c=B&&B.clients.find(x=>x.id===id),CC=E().reports.corpusCompanies,t=CC&&CC.companyTrialBalance?CC.companyTrialBalance(id):null;
  if(!c&&!t){toast("الشركة غير موجودة في الحزمة","bad");return null}
  const d=blank();d.source="bundle";d.bundleId=id;d.loadedAt=new Date().toISOString();
  /* one company, one set of figures: where the verified corpus model exists (its figures are checked against the bundle pages by
     tools/bundle_verify.mjs) the file takes its trial balance, overrides, currency and unit, so the audit file reaches the same
     materiality, risks and requests as the corpus replay; the older bundle-clients rows only describe the company */
  if(c){d.tbText=t?t.csv:c.tb;if(t)d.overrides={...t.overrides};d.loadedFrom="الحزمة العالمية — "+c.company;
    Object.assign(d.ctx,{company:c.company,period:"السنة المنتهية في "+c.periodEndAr,periodStart:c.periodStart||"",periodEnd:c.periodEnd,country:c.country==="SA"?"SA":c.country==="EG"?"EG":"INTL",
      framework:"IFRS",currency:c.unitAr,activity:c.activityAr||"",legalForm:"شركة مساهمة عامة",consolidated:true,auditFirm:c.auditor,...bundleForm(c)});
    if(t){const x=t.ctx;Object.assign(d.ctx,{country:x.country,corpusId:x.corpusId,currency:x.currency,curSym:x.curSym,taxKind:x.taxKind,sector:x.sector,reportingFramework:x.reportingFramework,auditStandard:x.auditStandard,...(x.unclassified?{unclassified:true}:{})})}
    else if(d.ctx.country==="INTL")d.ctx.taxKind="income";}
  else{d.tbText=t.csv;d.overrides={...t.overrides};d.loadedFrom="الحزمة العالمية — "+t.company.company;d.ctx={...d.ctx,...t.ctx}}
  if(t&&t.ctx.sourceModel){
    d.tbText=t.csv;d.overrides={...t.overrides};d.ctx={...d.ctx,...t.ctx};
    d.sourceKind="published-statements";d.sourceId=id;
    d.loadedFrom="نموذج قوائم منشورة — "+t.ctx.sourceModel.issuer;
  }
  d.fw={listedOrIssuing:true};
  const fid=newFile(d,{bundleId:id,source:"bundle"});if(d.sourceKind==="published-statements"){tab="fs";paint();}SK.audit&&SK.audit.log("tbreview",{act:"bundle-client",id});
  toast(d.sourceKind==="published-statements"?"فُتح نموذج القوائم المنشورة — ليس دفتر أستاذ أو دليل مراجعة":"فُتح ملف «"+d.ctx.company+"» — ميزانه من قوائمه المنشورة. جرّب «المراجعة التجريبية الكاملة» لترى الجولات حتى التقرير","ok");
  if(window.SKosifCore&&SKosifCore.view()!=="tbreview")SKosifCore.go("tbreview");
  return fid;
}
/* the report the company's own auditor issued decides the form of ours: PCAOB for the SEC filers, the extended ISA (UK) report for the
   UK-listed groups (and Airbus's Dutch report, written the same way), the local form for Saudi, UAE and Egyptian companies, ISA 700 for the rest */
const FW_AR={"US GAAP":"مبادئ المحاسبة المقبولة عموماً في الولايات المتحدة الأمريكية","J-GAAP":"مبادئ المحاسبة المقبولة عموماً في اليابان","K-IFRS":"المعايير الدولية للتقرير المالي المعتمدة في جمهورية كوريا",
  "TIFRS":"المعايير الدولية للتقرير المالي المعتمدة من هيئة الرقابة المالية في تايوان","Ind AS":"معايير المحاسبة الهندية (Ind AS) الصادرة بموجب قانون الشركات لعام 2013","AASB (IFRS)":"معايير المحاسبة الأسترالية المتوافقة مع المعايير الدولية للتقرير المالي"};
const EU=new Set(["DE","FR","NL"]);
function bundleForm(c){
  const G=E().audit.globalBenchmarks,r=G&&G.reportOf?G.reportOf(c.id)||{}:{},fwk=r.framework||c.framework||"";
  const form=c.auditStd==="PCAOB"?"US":c.country==="UK"||c.country==="NL"?"UK":["SA","AE","EG"].includes(c.country)?c.country:"INT";
  const frameworkAr=FW_AR[fwk]||(fwk==="IFRS"&&form!=="UK"?(EU.has(c.country)?"المعايير الدولية للتقرير المالي كما اعتمدها الاتحاد الأوروبي":"المعايير الدولية للتقرير المالي الصادرة عن مجلس معايير المحاسبة الدولية"):"");
  /* the sector, written so the benchmarks recognise it (the KAM precedents, a bank's going concern) */
  const activity=r.sector?((G.SECTOR_AR||{})[r.sector]||"")+" ("+r.sector+")":"";
  return{reportForm:form,frameworkAr,auditSince:r.since||"",countryAr:c.countryAr||"",activity};
}
const docKey=(sid,u)=>sid+"|"+u.requestId+"|"+u.fileName;
const readAs=(file,how)=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=()=>rej(r.error||new Error("تعذرت قراءة الملف"));how==="text"?r.readAsText(file):r.readAsDataURL(file)});
const isText=f=>/^text\/|csv|json|xml/.test(f.type)||/\.(csv|txt|tsv|json|xml)$/i.test(f.name);
const mimeOf=f=>f.type||(/\.pdf$/i.test(f.name)?"application/pdf":/\.png$/i.test(f.name)?"image/png":/\.jpe?g$/i.test(f.name)?"image/jpeg":"application/octet-stream");

/* ---------- the app's own books → a trial balance for review ----------
   the double-entry ledger («الدفاتر المحاسبية») for the active period, with the same dates a year earlier as
   the comparative; without journal entries, the operational records (sales, supplier batches, payments,
   credit) through the audit bridge. The active company and period fill the review's details. */
function activeCo(){const d=load("skosif_companies_v1",{})||{},a=d.active||{};return{co:(d.companies||[]).find(x=>x.id===a.companyId)||null,p:(d.periods||[]).find(x=>x.id===a.periodId)||null}}
const yearBack=iso=>{const x=new Date(iso+"T00:00:00Z");x.setUTCFullYear(x.getUTCFullYear()-1);return x.toISOString().slice(0,10)};
async function booksTB(){
  const {co,p}=activeCo(),L=window.SKosifLedger,LE=E().finance&&E().finance.ledger;
  let rows=[],source="";
  if(L&&LE&&L.entries().length){
    /* balance-sheet accounts to the period end, results for the period, earlier results in retained earnings */
    const acc=L.accounts(),re=acc.find(a=>a.code==="3100")||acc.find(a=>/مبق|محتجز/.test(a.name));
    const reId=re?re.id:"__re__",info=id=>acc.find(a=>a.id===id)||(id==="__re__"?{code:"3199",name:"أرباح مبقاة (نتائج سنوات سابقة)"}:{code:id,name:id});
    const typeOf=id=>(acc.find(a=>a.id===id)||{}).type;
    const ptb=(a,b)=>LE.periodTrialBalance(L.entries(),typeOf,{start:a,end:b},reId);
    const cur=p?ptb(p.startDate,p.endDate):LE.buildTrialBalance(L.entries());
    let prior=null;
    if(p){const pt=ptb(yearBack(p.startDate),yearBack(p.endDate));if(pt.rows.length)prior=Object.fromEntries(pt.rows.map(r=>[r.accountId,r.balance]))}
    const ids=[...new Set([...cur.rows.map(r=>r.accountId),...Object.keys(prior||{})])];
    rows=ids.map(id=>{const a=info(id),r=cur.rows.find(x=>x.accountId===id);return{code:String(a.code),name:String(a.name),balance:r?r.balance:0,prior:prior?(prior[id]||0):null}});
    source="الدفاتر المحاسبية";
  }else if(window.SKosifAuditBridge){
    const key=p?String(p.endDate||"").slice(0,4):String(new Date().getFullYear());
    const tb=await SKosifAuditBridge.buildTB(key||"all");
    rows=tb.rows.map(r=>({code:r[0],name:r[1],balance:r[2]-r[3]}));
    source="السجلات التشغيلية (المبيعات والمشتريات والمصروفات والآجل)";
  }
  if(!rows.length)return null;
  const end=p&&p.endDate,eg=co&&co.country==="EG";
  return{text:TI().booksToCsv(rows),source,rows:rows.length,ctx:{company:co?co.name:"",period:p?p.label:"",periodStart:p?p.startDate:"",periodEnd:end||"",country:eg?"EG":"SA"}};
}
/* Import-only commit: a save must acknowledge true before any success effects.
   Old document blobs are deliberately retained; no cross-store rollback or recovery is promised. */
function sourceImportBlock(tb,ctx){
  const ids=[tb&&tb.sourceId,ctx&&ctx.corpusId,ctx&&ctx.sourceId,ctx&&ctx.sourceModel&&ctx.sourceModel.id].filter(Boolean);
  for(const id of ids){const reason=E().reports.corpusCompanies.sourceUnavailableReason(id);if(reason)return reason;}
  return null;
}
function commitTB(text,label,ctx,overrides,stillCurrent,tb){
  try{if(!tb)tb=TI().parseTrialBalance(text)}catch{toast("تعذرت قراءة ميزان المصدر — لم يُستورد الميزان","bad");return false}
  const sourceBlock=sourceImportBlock(tb,ctx);if(sourceBlock){toast(sourceBlock,"warn");return false;}
  if(!tb.ok){toast(tb.errors.find(e=>e.code==="SOURCE_REPORT_REIMPORT_UNSUPPORTED")?.message||"لم أتعرف على أعمدة الميزان","bad");return false}
  if(!stillCurrent()){toast("تغيّر ملف المراجعة أو مصدر الميزان — أعد الاستيراد لتأكيد البيانات الحالية","warn");return false}
  const d=st();
  if(!(ctx&&ctx.corpusId))["corpusId","curSym","taxKind","sector","reportingFramework","auditStandard"].forEach(k=>delete d.ctx[k]);
  Object.entries(ctx||{}).forEach(([k,v])=>{if(v)d.ctx[k]=v});
  // A replacement inside a source-model record cannot silently promote it to real ledger evidence.
  if(tb.sourceKind||ctx&&(ctx.sourceKind==="published-statements"||ctx.sourceModel&&ctx.sourceModel.kind==="published-statements")){d.sourceKind="published-statements";d.sourceId=tb.sourceId||(ctx&&ctx.sourceModel&&ctx.sourceModel.id)||d.sourceId||"";}
  d.tbText=text;d.loadedAt=new Date().toISOString();d.loadedFrom=label||"";
  const previousConf=confHTML;fresh(d);if(overrides)d.overrides={...overrides};
  let saved=false;try{saved=save(KEY,d)===true}catch{/* preserve the active stored file on a rejected write */}
  if(!saved){confHTML=previousConf;toast("لم يُحفظ الميزان — تعذر التخزين المحلي. بقي ملف المراجعة السابق وروابط مستنداته كما هي","bad");return false}
  cache=null;tab="tb";setup=false;
  SK.audit&&SK.audit.log("tbreview",{act:"import",source:label,accounts:tb.rows.length,balanced:tb.balanced});
  toast("استُلم ميزان "+label+": "+tb.rows.length+" حساباً"+(tb.balanced?"، متزن":" — غير متزن، راجع الفرق"),tb.balanced?"ok":"warn");
  return true;
}
/* Other imports retain their existing confirmation boundary; only their save acknowledgement is fixed here. */
async function loadTB(text,label,ctx,overrides){
  let tb;try{tb=TI().parseTrialBalance(text)}catch{toast("تعذرت قراءة ميزان المصدر — لم يُستورد الميزان","bad");return false}
  const sourceBlock=sourceImportBlock(tb,ctx);if(sourceBlock){toast(sourceBlock,"warn");return false;}
  if(!tb.ok){toast(tb.errors.find(e=>e.code==="SOURCE_REPORT_REIMPORT_UNSUPPORTED")?.message||"لم أتعرف على أعمدة الميزان","bad");return false}
  const target=[localStorage.getItem(KEY),localStorage.getItem(ENG)],d=st();
  if(d.tbText&&d.session&&d.session.rounds&&d.session.rounds.length&&!await SK.confirm("توجد مراجعة جارية بجولات المراجع الذكي — استبدالها بميزان «"+label+"»؟",{danger:true,ok:"استبدال"}))return false;
  return commitTB(text,label,ctx,overrides,()=>target[0]===localStorage.getItem(KEY)&&target[1]===localStorage.getItem(ENG),tb);
}
/* a company of the research bundle as the client: its published statements as a two-year trial balance, its auditor and year end */
async function loadCorpus(id){return !!(await openClient(id))}
/* Pure reads until acceptance. The decision binds review/register/company/period and direct ledger bytes;
   operational records are read after acceptance, not captured as a cross-store snapshot. */
const booksImportSnapshot=()=>[KEY,ENG,"skosif_companies_v1","skosif_ledger_v1"].map(k=>localStorage.getItem(k));
const importPeriod=c=>[c.period||"",c.periodStart||"تاريخ البداية غير محدد",c.periodEnd||"تاريخ النهاية غير محدد"].filter(Boolean).join(" · ");
function booksImportDisclosure(d,source){
  const {co,p,kind}=source,c={period:p?p.label:"كل التواريخ",periodStart:p?p.startDate:"",periodEnd:p?p.endDate:""};
  const existing=!!(d.tbText||d.session||(d.accepted||[]).length||(d.rejected||[]).length||Object.keys(d.overrides||{}).length||["engagement","checklists","exceptions","thOverrides","evidenceMeta","journalSource","journalMeta","letterResponses"].some(k=>d[k]!=null));
  let message="شركة المصدر: "+(co?co.name:"شركة غير محددة")+"\nالفترة المختارة: "+importPeriod(c)+"\nنوع المصدر: "+kind+"\nملف المراجعة المستهدف: "+(d.ctx.company||"ملف بلا اسم")+"\nفترة الملف المستهدف: "+importPeriod(d.ctx);
  if(source.operational)message+="\nنطاق السجلات التشغيلية: المبيعات والمشتريات والمدفوعات: "+(source.year?"السنة "+source.year:"كل السنوات")+"؛ لا تُصفّى بالتاريخين المختارين.\nذمم العملاء: الأرصدة الحالية من سجل الآجل، دون تصفية بالفترة.\nالنقدية رصيد موازن محسوب، وليست رصيداً بنكياً فعلياً. الضريبة مشتقة بنسبة 15٪. وقد يشمل الميزان تقدير المصروفات الشهرية عند غياب مدفوعات المصروفات.\nتُقرأ التفاصيل التشغيلية وقت الاستيراد بعد تأكيدك؛ راجع الأرصدة الناتجة قبل اعتمادها.";
  if(existing){
    message+="\n\nسيُستبدل ميزان ملف المراجعة الحالي بميزان شركة المصدر وفق النطاق الموضح أعلاه. ستُصفّر جلسة المراجعة وجولاتها وقرارات قبول ورفض التسويات وتصنيفات الحسابات، وتُزال سجلات الارتباط وقوائم الفحص والاستثناءات وتجاوزات حدود الفحص وربط الأدلة والقيود وردود الخطاب المرتبطة بها. لن تبقى روابط مستندات الجلسة السابقة متاحة ضمن المراجعة النشطة. بعض إعدادات الملف تبقى كما هي. لا يوجد تراجع تلقائي مضمون لهذه العملية.";
    const session=d.session||{},count=v=>Array.isArray(v)?v.length:v==null?0:"غير متاح";
    message+="\nالجولات: "+count(session.rounds)+" · المستندات المرتبطة: "+count(session.uploads)+" · القبول: "+count(d.accepted)+" · الرفض: "+count(d.rejected);
  }
  return{message,options:{title:existing?"استبدال ميزان ملف المراجعة الحالي":"استيراد الميزان إلى المراجعة",danger:existing,ok:existing?"استيراد واستبدال المراجعة":"استيراد الميزان إلى المراجعة",cancel:"إلغاء",defaultCancel:true}};
}
/* A front-door Audit start creates an engagement owned by Audit itself. It deliberately copies no company, period, ledger or helper-space context. */
function newEngagement(){
  const id=newFile(blank(),{source:"user"});
  SK.audit&&SK.audit.log("tbreview",{act:"new-independent",id});
  toast("ملف مراجعة مستقل جديد — ارفع الميزان والمستندات، أو اربط بيانات المحاسبة لاحقًا باختيارك","ok");
  if(window.SKosifCore&&SKosifCore.view()!=="tbreview")SKosifCore.go("tbreview");else paint();
  return id;
}
async function fromBooks(contextCurrent=()=>true){
  const scopeRead=()=>window.SKosifSpace&&SKosifSpace.chatScopeSnapshot?SKosifSpace.chatScopeSnapshot():null;
  const importScope=scopeRead();
  const lifecycleCurrent=()=>{try{const now=scopeRead();return!!(contextCurrent()&&importScope&&importScope.status==="stable"&&now&&now.status==="stable"&&now.token===importScope.token)}catch{return false}};
  if(!lifecycleCurrent()){toast("تعذر تثبيت سياق المستخدم والشركة — افتح المساحة الحالية من جديد قبل الاستيراد","warn");return false}
  let snapshot,source,disclosure;
  try{
    snapshot=booksImportSnapshot();const {co,p}=activeCo(),L=window.SKosifLedger,LE=E().finance&&E().finance.ledger,posted=!!(L&&LE&&L.entries().length);
    source={co,p,operational:!posted,year:p?String(p.endDate||"").slice(0,4):String(new Date().getFullYear()),kind:posted?"الدفاتر المحاسبية":"السجلات التشغيلية (المبيعات والمشتريات والمصروفات والآجل)"};
    disclosure=booksImportDisclosure(st(),source);
  }catch{toast("تعذرت قراءة مصدر الميزان أو ملف المراجعة — لم يُستورد الميزان","bad");return false}
  if(await SK.confirm(disclosure.message,disclosure.options)!==true)return false;
  const stillCurrent=()=>{try{if(!lifecycleCurrent())return false;const now=booksImportSnapshot();return snapshot.every((v,i)=>v===now[i])}catch{return false}};
  if(!stillCurrent()){toast("تغيّر ملف المراجعة أو مصدر الميزان — أعد الاستيراد لتأكيد البيانات الحالية","warn");return false}
  let b;try{b=await booksTB()}catch{toast("تعذر بناء ميزان المصدر — لم يُستورد الميزان","bad");return false}
  if(!stillCurrent()){toast("تغيّر ملف المراجعة أو مصدر الميزان — أعد الاستيراد لتأكيد البيانات الحالية","warn");return false}
  if(!b){toast("لا توجد قيود في الدفاتر المحاسبية ولا مبيعات أو مشتريات مسجلة للفترة","warn");return false}
  if(b.source!==source.kind){toast("تغيّر نوع مصدر الميزان — أعد الاستيراد لتأكيد المصدر الحالي","warn");return false}
  const ok=commitTB(b.text,b.source,b.ctx,null,stillCurrent);
  if(ok){if(window.SKosifCore&&SKosifCore.view()!=="tbreview")SKosifCore.go("tbreview");else paint()}
  return ok;
}
/* open the engagement on a tab (and a studio page): used by the studio's own deep links and other screens */
function openTab(t,view){if(t==="studio")t=Object.keys(ADV).find(k=>ADV[k]===view)||"docs";if(t)tab=t;if(window.SKosifCore&&SKosifCore.view()!=="tbreview")SKosifCore.go("tbreview");else paint()}
/* Display terminology follows the engagement tax kind without changing engine mappings or amounts. */
function taxDisplay(fs,c){
  if(c.d.ctx.taxKind!=="income")return fs;
  const rows=xs=>xs.map(r=>({...r,ar:r.ar.replaceAll("الزكاة وضريبة الدخل","ضريبة الدخل")}));
  return {...fs,pl:rows(fs.pl),sfp:rows(fs.sfp),lines:rows(fs.lines),notes:rows(fs.notes)};
}
/* The secondary preview shares the primary computed statements; it must never reclassify their account names. */
function canonicalStatements(c){
  if(!c||c.sourceOnly||!c.d.ctx.corpusId||!Object.keys(c.d.overrides||{}).length)return null;
  const model=E().reports.corpusCompanies.companyTrialBalance(c.d.ctx.corpusId);if(!model)return null;
  const co=model.company,ctx=c.d.ctx,fig=co.figures||{},copy=raw=>{const fs=taxDisplay(raw,c);return {hasPrior:fs.hasPrior,keys:fs.keys,pl:fs.pl,sfp:fs.sfp,checks:fs.checks,lines:fs.lines.map(l=>({key:l.key,ar:l.ar,accounts:l.accounts}))}};
  if(["curSym","currency","reportingFramework"].some(k=>ctx[k]&&ctx[k]!==model.ctx[k]))return null;
  const sorted=o=>JSON.stringify(Object.entries(o||{}).sort(([a],[b])=>a.localeCompare(b)));
  return JSON.parse(JSON.stringify({version:1,entity:ctx.company,period:ctx.periodEnd||ctx.period,priorPeriodEnd:model.ctx.priorPeriodEnd||null,
    framework:ctx.reportingFramework||co.framework||"غير محدد",jurisdiction:ctx.issuerCountry||co.country||"غير محددة",
    currency:fig.currency||ctx.currency||"غير محددة",unit:fig.unit==="m"?"million":fig.unit||"غير محددة",displayUnit:ctx.curSym||ctx.currency||"غير محددة",
    before:copy(c.fsBefore),after:copy(c.fsAfterAdj),acceptedIds:c.accepted.map(a=>a.id),
    provenance:{statementBasis:"primary-computed-model",corpusId:ctx.corpusId,sourceLabel:c.d.loadedFrom||"الحزمة العالمية",pages:fig.pages||{},
      modifiedFromModel:c.d.tbText!==model.csv||sorted(c.d.overrides)!==sorted(model.overrides),mapping:c.d.overrides},
    limitation:"عرض تحليلي من ربط الميزان في الملف الرئيسي، وليس نسخة كاملة من التقرير المنشور أو إثبات امتثال للإطار. التقرير الكامل وفق إطار المصدر غير مدعوم هنا؛ غير صالح للإصدار. تبقى التسويات والأدلة والاعتمادات في الملف الرئيسي."}));
}
window.SKosifTBReview=Object.freeze({newEngagement,fromBooks,loadCorpus,
  /* R20: the audit menu opens a stage of the open file (FOUNDATION §3.12 «داخل ملف المراجعة»); with no file open the
     register shows, and no stage is current */
  /* The public open method is openTab (declared once below); avoid duplicate
     object keys that shadow the stage handler and fail production ESLint. */
  current:()=>compute()?tab:"",
  openClient,showcase,picker:()=>bundlePicker(),demo:()=>runDemo(),booksTB,rows:()=>{const c=compute();if(c&&c.sourceOnly)return {sourceOnly:true,sourceKind:"published-statements",rows:[],sig:c.sig,label:c.sourceModel?c.sourceModel.issuer:"source model",ctx:{...c.d.ctx,sourceKind:"published-statements"},unavailableReason:"The embedded studio does not support source provenance; no ledger or audit-evidence transport is permitted."};return c&&c.tb.ok?{mappingUnsupported:!!(c.d.ctx.corpusId&&Object.keys(c.d.overrides||{}).length),canonicalStatements:canonicalStatements(c),rows:studioRows(c),sig:c.sig,label:c.d.ctx.company||"file",ctx:{...c.d.ctx}}:null},load:(text,label,ctx)=>loadTB(text,label,ctx),open:openTab,studio:view=>openTab("studio",view)});

/* ---------- computation (memoized) ---------- */
function compute(){
  const d=st();CUR=d.ctx.curSym||(d.source==="bundle"&&d.ctx.currency?d.ctx.currency:egypt(d)?"ج.م":"ر.س");if(!d.tbText)return null;
  const sig=JSON.stringify([MN().fingerprint(d.tbText),d.overrides,d.ctx,d.sourceKind,d.sourceId,d.bundleId,d.materiality,d.session&&d.session.rounds.length,d.session&&d.session.unavailable,d.accepted,d.rejected,!!(d.session&&d.session.final),d.ecl,d.confirm,d.field&&d.field.so,d.matPlanOn&&d.matPlan]);
  /* a file bound to a published-source model is re-verified on every compute (#143): the signature serialises NaN as
     null, so a tampered source value would otherwise ride a cached verified result. A corpus-model file (P5) keeps the cache. */
  const sourceBound=d.sourceKind!==undefined||d.ctx.sourceKind!==undefined||d.ctx.sourceModel!==undefined;
  if(cache&&cache.sig===sig&&!sourceBound)return cache;
  const tb=TI().parseTrialBalance(d.tbText);
  const PS=E().reports.publishedSource,sourceId=d.sourceId||d.bundleId||tb.sourceId||(d.ctx.sourceModel&&d.ctx.sourceModel.id)||d.ctx.corpusId||"";
  const reviewedSource=PS&&PS.reviewedPublishedSource?PS.reviewedPublishedSource(sourceId):null;
  const hasSourceOrigin=d.sourceKind!==undefined||d.sourceId!==undefined||d.ctx.sourceKind!==undefined||d.ctx.sourceModel!==undefined;
  const sourceOnly=tb.sourceKind==="published-statements"||hasSourceOrigin||!!reviewedSource;
  if(sourceOnly){tb.sourceKind="published-statements";tb.sourceId=sourceId;}
  const sourceModel=reviewedSource&&reviewedSource.sourceModel;
  // Source context uses the disclosed basis; normalize the loaded clone, never persisted storage.
  if(sourceModel&&sourceModel.sourceAuditLabel)d.ctx.auditStandard=sourceModel.sourceAuditLabel;
  const sortedMap=o=>JSON.stringify(Object.entries(o||{}).sort(([a],[b])=>a.localeCompare(b)));
  const sourceVerified=!!(sourceModel&&[d.sourceId,d.bundleId,tb.sourceId,d.ctx.corpusId,d.ctx.sourceModel&&d.ctx.sourceModel.id].filter(v=>v!==undefined&&v!==null&&v!=="").every(v=>v===sourceModel.id)&&[d.sourceKind,d.ctx.sourceKind].filter(v=>v!==undefined).every(v=>v==="published-statements")&&d.tbText===reviewedSource.csv&&sortedMap(d.overrides)===sortedMap(reviewedSource.overrides)&&
    d.ctx.company===sourceModel.issuer&&(!sourceModel.periodStart||d.ctx.periodStart===sourceModel.periodStart)&&d.ctx.periodEnd===sourceModel.periodEnd&&d.ctx.priorPeriodEnd===sourceModel.priorPeriodEnd&&
    d.ctx.sourceModel&&E().reports.sourceReplay.sourceModelsEqual(d.ctx.sourceModel,sourceModel)&&d.ctx.sourceModel.sourceSha256===sourceModel.sourceSha256&&d.ctx.sourceModel.accountingBasis===sourceModel.accountingBasis&&
    d.ctx.sourceModel.currency===sourceModel.currency&&d.ctx.sourceModel.unit===sourceModel.unit&&
    d.ctx.sourceModel.issuer===sourceModel.issuer&&d.ctx.sourceModel.scope===sourceModel.scope&&d.ctx.sourceModel.issuerCountry===sourceModel.issuerCountry&&
    d.ctx.sourceModel.periodEnd===sourceModel.periodEnd&&d.ctx.sourceModel.priorPeriodEnd===sourceModel.priorPeriodEnd&&
    d.ctx.sourceModel.id===sourceModel.id&&d.ctx.sourceModel.kind===sourceModel.kind&&d.ctx.consolidated===true&&
    d.ctx.reportingFramework===sourceModel.accountingBasis&&d.ctx.currency===sourceModel.currency&&d.ctx.curSym===sourceModel.currency+" "+sourceModel.unit&&d.ctx.issuerCountry===sourceModel.issuerCountry);
  if(sourceOnly&&(!sourceVerified||!reviewedSource||sourceModel&&sourceModel.replay||d.ctx.sourceModel&&d.ctx.sourceModel.replay)){
    const fs=E().reports.sourceReplay.buildReplayStatements(tb,d.overrides),valid=sourceVerified&&!(d.accepted||[]).length&&fs.replay.status==="available";
    if(!valid)fs.replay={...fs.replay,status:"unavailable",reason:"Source identity, observations, or adjustments do not match the reviewed source.",tables:[],checks:[]};
    cache={sig,d,tb,sourceOnly:true,sourceReplay:true,sourceModel,sourceVerified:valid,base:{fs},fsBefore:fs,fsAfterAdj:fs,accepted:d.accepted||[],pool:[],session:AI().referenceSession(d.session||AI().newSession(d.ctx),tb),derived:{opinion:"not-assessed",ar:"مرجع مصدر فقط — لم يُجر تقييم تأكيد"}};
    return cache;
  }
  const fw=egypt(d)?"EAS":d.ctx.framework,tax=egypt(d)?"income":d.ctx.taxKind==="income"?"income":"zakat";
  const opts={framework:fw,currency:CUR,overrides:d.overrides,materiality:d.materiality||undefined,tax,unclassified:!!d.ctx.unclassified};
  let base=RV().reviewTrialBalance(tb,opts);
  /* the materiality plan (ISA 320), once adopted, sets materiality and the performance and trivial rates of the whole review */
  const k0=base.fs.keys,plan=d.matPlanOn&&E().audit.materiality.planMateriality?E().audit.materiality.planMateriality({pbt:k0.pbz.current,revenue:k0.revenue.current,assets:k0.assets.current,equity:k0.equity.current,...(d.matPlan||{})}):null;
  if(plan){opts.materiality=d.materiality||plan.overall;opts.materialityRates={performanceRate:plan.performanceRate,trivialRate:plan.trivialRate};base=RV().reviewTrialBalance(tb,opts)}
  /* the first-round requests of the auditors in the global reports, for this engagement's likely key matters */
  const OR=E().audit.openingRequests,KMx=E().audit.kam,GBx=E().audit.globalBenchmarks,CRx=E().audit.corpusReplay;
  let opening=[];
  if(OR&&KMx&&GBx){const sector=d.ctx.sector||GBx.sectorFromActivity(d.ctx.activity||""),prior=CRx?CRx.sectorPrior(sector,d.ctx.corpusId||undefined):{};
    const ks=KMx.suggestKams({fs:base.fs,risks:base.risks,materiality:base.materiality.overall,currency:CUR,sector,sectorPrior:prior});
    const have=new Set(base.requests.map(q=>q.title));opening=OR.openingRequests(ks.slice(0,4).map(k=>k.key),{lineOf:t=>(ks.find(k=>k.key===t)||{lineKeys:[]}).lineKeys[0]}).filter(q=>!have.has(q.title))}
  /* the second round follows the client's answers to the first: alternatives for what is unavailable or rejected,
     supplements for what came back incomplete, the next procedures where the first answers were accepted */
  const second=opening.length&&OR.followUpRequests&&d.session?OR.followUpRequests(opening,r1State(d.session)):[];
  const withOpening=r=>{const extra=[...opening,...second];return extra.length?{...r,requests:[...r.requests,...extra.filter(q=>!r.requests.some(x=>x.id===q.id))]}:r};
  base=withOpening(base);
  const s=d.session&&AI().referenceSession?AI().referenceSession(d.session,tb):d.session;if(s&&s.origin)d.session=s;
  /* evidence: the council's accepted documents and the working papers signed in the fieldwork tab (ISA 330) */
  const FWE=E().audit.fieldwork,so=d.field&&d.field.so||{};
  const fieldEv=FWE&&FWE.evidenceFromFieldwork&&Object.keys(so).length?FWE.evidenceFromFieldwork(FWE.workingPapers(base,{activity:d.ctx.activity||""}),so):{};
  {const ev=AI().mergeEvidence(s&&s.rounds.length?AI().evidenceFromSession(base,s):{},fieldEv);if(Object.keys(ev).length)base=withOpening(RV().reviewTrialBalance(tb,{...opts,evidence:ev}))}
  const gem=s?s.rounds.flatMap(r=>r.findings):[];
  let all=gem.length?withOpening(RV().reviewTrialBalance(tb,{...opts,evidence:AI().mergeEvidence(s?AI().evidenceFromSession(base,s):{},fieldEv),extraFindings:gem})):base;
  if(plan){const withPlan=r=>({...r,materiality:{...r.materiality,benchmark:plan.benchmark==="pbt"?"pbz":plan.benchmark==="equity"?r.materiality.benchmark:plan.benchmark,benchmarkAr:plan.benchmarkAr,base:plan.base,rate:plan.rate}});
    const same=all===base;base=withPlan(base);all=same?base:withPlan(all)}
  const stdMap=s?AI().accountStandards(base,s):Object.fromEntries(base.accounts.map(a=>[a.code,a.standards.map(x=>x.code)]));
  const notes={};if(s)for(const r of s.rounds)for(const [code,v] of Object.entries(r.accountStandards))if(v.note)notes[code]=v.note;
  const eclM=d.ecl?RV().eclMatrix(d.ecl):null,eclA=eclM?RV().eclAdjustment(tb,eclM,fw):null;
  const pool=[...base.adjustments,...(eclA?[eclA]:[]),...(s?s.rounds.flatMap(r=>r.adjustments.filter(a=>a.valid)):[]),...(s&&s.final?s.final.adjustments.filter(a=>a.valid):[])];
  const accepted=pool.filter(a=>d.accepted.includes(a.id));
  const adjusted=accepted.length?RV().applyAdjustments(tb,accepted):tb;
  const fsBefore=base.fs,fsAfterAdj=accepted.length?FS().buildStatements(adjusted,d.overrides,{tax}):base.fs;
  const derived=AI().deriveOpinion(tb,base,s||AI().newSession({...d.ctx,framework:fw}),accepted,fieldEv);
  const evidence=AI().mergeEvidence(s?AI().evidenceFromSession(base,s):{},fieldEv),c=d.ctx,cf=d.confirm;
  const disclosures=DS().disclosureReadiness({fs:fsAfterAdj,framework:fw,periodEnd:c.periodEnd,currency:CUR,confirm:{editionReviewed:cf.edition,complianceApproved:cf.compliance,unrecognizedReviewed:cf.unrecognized},
    entity:{legalName:c.company,legalForm:c.legalForm,country:egypt(d)?"مصر":"المملكة العربية السعودية",registeredOffice:c.registeredOffice,principalPlace:c.principalPlace,activities:c.activity}});
  const decided=pool.every(a=>d.accepted.includes(a.id)||d.rejected.includes(a.id));
  const programme=PG().auditProgramme({review:base,framework:fw,evidence,company:c.company,period:c.period,activity:c.activity,independenceConfirmed:cf.independence,partnerApproved:cf.partner,
    rounds:s?s.rounds.length:0,finalIssued:!!(s&&s.final),adjustmentsDecided:decided,disclosuresValid:disclosures.valid});
  cache={sig,d,fw,tb,sourceOnly,sourceModel,sourceVerified,base,all,stdMap,notes,pool,accepted,adjusted,fsBefore,fsAfterAdj,derived,session:s,eclM,disclosures,programme,decided,fieldEv,plan};
  return cache;
}
const session=d=>d.session||AI().newSession(d.ctx,window.SKosifAI?SKosifAI.conf().model:AI().DEFAULT_MODEL);

/* ---------- header: steps ---------- */
function stepper(c){
  const ss=c&&c.session,rounds=ss?ss.rounds.length:0,out=ss?AI().outstanding(ss).length:0,decided=c?c.pool.every(a=>c.d.accepted.includes(a.id)||c.d.rejected.includes(a.id)):false;
  const e=c&&c.d&&c.d.engagement,plan=!!(e&&e.approvals&&e.approvals.plan),hasCouncil=!!(ss&&ss.rounds.some(r=>r.council&&r.council.opinions&&r.council.opinions.length));
  const steps=[
    ["tb","الميزان والقوائم",!!c,"اربط ميزان المراجعة بالقوائم والحسابات"],
    ["plan","الأهمية والخطة",plan,"الأهمية النسبية، المخاطر وبرنامج العمل"],
    ["docs","طلبات أولية",!!c&&c.base.requests.length>0,"PBC والمستندات المطلوبة قبل/بعد كل جولة"],
    ["conf","مجلس المراجعين",hasCouncil,"آراء مستقلة ثم تحكيم وقرار"],
    ["docs","الأدلة",rounds>0&&!out,"المستندات المقبولة والناقصة"],
    ["ai","جولة جديدة",rounds>0,"تُعاد الجولة ما دامت الأدلة غير كافية"],
    ["adj","التسويات والملاحظات",!!c&&decided,"قيود التسوية والملاحظات والامتثال"],
    ["close","الإكمال",!!(ss&&ss.final),"بوابات الإكمال والإقرارات"],
    ["fs","التقارير النهائية",!!(ss&&ss.final),"تقرير المراجع والقوائم والمخرجات"]
  ];
  const cur=steps.findIndex(x=>!x[2]);
  return '<nav class="tbr-flowmap" aria-label="خريطة دورة المراجعة"><div class="tbr-flowtrack">'+steps.map(([k,l,done,sub],i)=>'<button type="button" data-tab="'+k+'" class="tbr-flow-node '+(done?"done":i===cur?"cur":"")+'" title="'+esc(sub)+'"><i>'+(done?"✓":i+1)+'</i><span><b>'+esc(l)+'</b><small>'+esc(sub)+'</small></span></button>').join("")+'</div><div class="tbr-flowloop">↺ إذا لم تكفِ الأدلة: مستندات إضافية ← مجلس ← جولة جديدة، وتتكرر حتى الاكتفاء أو إقرار عدم توفر مستندات أخرى.</div></nav>';
}
function hero(c){
  const d=c?c.d:st(),ctx=d.ctx,s=c&&c.session,state=s?AI().sessionState(s):{label:c?"الميزان جاهز — ابدأ جولة المراجع الذكي أو تابع بالمحرك الآلي":"ابدأ باستلام ميزان المراجعة"};
  return '<section class="tbr-hero"><div class="tx"><span class="eyebrow">مراجعة الحسابات بالمعايير</span><h2>'+esc(ctx.company||"منشأة جديدة")+'</h2><p>'+esc([ctx.period,ctx.frameworkAr||(ctx.corpusId?(ctx.reportingFramework||"IFRS")+" · مراجعها "+(ctx.auditFirm||""):FW_LABEL[egypt(d)?"EAS":ctx.framework]),ctx.activity].filter(Boolean).join(" · "))+'</p>'+
    '<p class="tbr-state">'+esc(busy==="demo"&&fullStep?fullStep:state.label)+'</p>'+(c&&d.source==="bundle"&&!(s&&s.rounds.length)?'<p class="tbr-demo-cta">شركة من الحزمة العالمية: شغّل «المراجعة التجريبية الكاملة» لترى الطلبات الأولى والمستندات والجولات حتى التقرير النهائي — دون مفتاح ذكاء اصطناعي.</p>':'')+(d.demoRun?'<p class="tbr-demo-cta">مراجعة تجريبية: المستندات مولّدة من أرقام الميزان لعرض القدرات.</p>':'')+'</div><div class="sk-actions">'+(c?'<button type="button" class="btn sm'+(d.source==="bundle"&&!(s&&s.rounds.length)?' primary':'')+'" data-a="demo-audit"'+(busy?' disabled':'')+'>'+(busy==="demo"?'جارٍ…':'▶ المراجعة التجريبية الكاملة')+'</button><button type="button" class="btn sm" data-a="setup">بيانات المراجعة</button><button type="button" class="btn sm" data-a="reset">مراجعة جديدة</button>':'')+'</div></section>'+stepper(c)+
    (c?'<div class="tbr-tabs" role="tablist">'+TABS.map(([k,l])=>'<button type="button" role="tab" data-tab="'+k+'" aria-selected="'+(tab===k)+'">'+esc(l)+badge(c,k)+'</button>').join("")+'</div>':'');
}
function badge(c,k){
  const n=k==="tb"?c.base.accounts.filter(a=>a.findings.length).length:k==="ai"?(c.session?c.session.rounds.length:0):k==="docs"?(c.session?AI().outstanding(c.session).length:c.base.requests.length):k==="adj"?c.pool.filter(a=>!c.d.accepted.includes(a.id)&&!c.d.rejected.includes(a.id)).length:k==="conf"?(c.d.engagement&&c.d.engagement.state==="human-review"?1:0):0;
  return n?'<i class="tbr-n">'+n+'</i>':'';
}

/* ---------- setup (company, period, framework, trial balance) ---------- */
function setupHTML(d,withTb){
  const c=d.ctx,fw=d.fw||{},app=CX().frameworkApplicability(fw),eg=egypt(d),intl=c.country==="INTL";
  const q=(k,l)=>'<label class="checkline"><input type="checkbox" data-fw="'+k+'"'+(fw[k]?' checked':'')+'> '+esc(l)+'</label>';
  return '<section class="card"><div class="card-h"><div><h3>'+(withTb?"استلام ميزان المراجعة":"بيانات المراجعة")+'</h3><p>اطلب من الشركة ميزان المراجعة (Excel أو CSV) بأعمدة: رقم الحساب، اسم الحساب، مدين، دائن — ويفضّل عمود السنة السابقة للمقارنة وقائمة التدفقات.</p></div></div><div class="card-b">'+
    '<div class="sk-grid2"><label class="sk-field"><span>بلد المنشأة</span><select data-ctx="country"><option value="SA"'+(eg?'':' selected')+'>المملكة العربية السعودية — IFRS المعتمدة / SOCPA</option><option value="EG"'+(eg?' selected':'')+'>جمهورية مصر العربية — معايير المحاسبة المصرية</option>'+(intl?'<option value="INTL" selected>'+esc(c.registeredOffice||"دولية")+' — '+esc(c.reportingFramework||"IFRS")+' (شركة من التقارير العالمية)</option>':'')+'</select></label>'+
      '<label class="sk-field"><span>الشكل القانوني</span><input data-ctx="legalForm" value="'+esc(c.legalForm)+'" placeholder="ذات مسؤولية محدودة، مساهمة…"></label></div>'+
    '<div class="sk-grid2"><label class="sk-field"><span>المنشأة</span><input data-ctx="company" value="'+esc(c.company)+'" placeholder="اسم الشركة"></label><label class="sk-field"><span>النشاط</span><input data-ctx="activity" value="'+esc(c.activity)+'" placeholder="تجارة، مقاولات، خدمات…"></label></div>'+
    '<div class="sk-grid2"><label class="sk-field"><span>الفترة</span><input data-ctx="period" value="'+esc(c.period)+'" placeholder="السنة المنتهية في 31 ديسمبر 2025"></label><div class="sk-grid2"><label class="sk-field"><span>من</span><input type="date" data-ctx="periodStart" value="'+esc(c.periodStart)+'"></label><label class="sk-field"><span>إلى</span><input type="date" data-ctx="periodEnd" value="'+esc(c.periodEnd)+'"></label></div></div>'+
    '<div class="sk-grid2"><label class="sk-field"><span>المكتب المسجل</span><input data-ctx="registeredOffice" value="'+esc(c.registeredOffice)+'" placeholder="المدينة والعنوان"></label><label class="sk-field"><span>المقر الرئيسي للنشاط</span><input data-ctx="principalPlace" value="'+esc(c.principalPlace)+'"></label></div>'+
    (intl?'<div class="tbr-fw"><div><h4>الإطار المحاسبي</h4><p class="hint">شركة مدرجة من التقارير العالمية: قوائمها معدة وفق '+esc(c.reportingFramework||"IFRS")+' ومراجعة وفق '+esc(c.auditStandard==="PCAOB"?"معايير PCAOB":"معايير المراجعة الدولية ISA")+'. يراجعها SQC بالمعايير الدولية؛ الأرقام بالعملة والوحدة المنشورة ('+esc(c.curSym||"")+').</p></div>'+
      '<div class="tbr-fw-r"><b>'+esc(c.reportingFramework||"IFRS")+'</b><p>مراجعها الفعلي: '+esc(c.auditFirm||"—")+'. قارن ما يصل إليه SQC بتقريره من «مختبر الشركات العالمية».</p><small>حزمة البحث العالمية · 12,506 صفحة</small></div></div>':
    eg?'<div class="tbr-fw"><div><h4>الإطار المحاسبي</h4><p class="hint">معايير المحاسبة المصرية الصادرة بقرارات وزير الاستثمار وتعديلاتها، وقانون الضريبة على الدخل 91 لسنة 2005 (22.5%)، وقانون الضريبة على القيمة المضافة 67 لسنة 2016 (14%)، وقانون الشركات 159 لسنة 1981. العملة: الجنيه المصري.</p></div>'+
      '<div class="tbr-fw-r"><b>معايير المحاسبة المصرية</b><p>تظهر أرقام المعايير المصرية بجوار الحسابات مع ما يقابلها في IFRS، وتُعامل ضريبة الدخل بدلاً من الزكاة.</p><small>الهيئة العامة للرقابة المالية · مصلحة الضرائب المصرية</small></div></div>':
    '<div class="tbr-fw"><div><h4>الإطار المحاسبي (إرشادات SOCPA — القسم 1)</h4>'+q("listedOrIssuing","أسهم أو أدوات دين متداولة أو في طور الإدراج")+q("fiduciaryForBroadGroup","تحتفظ بأموال مجموعة عريضة من الغير كنشاط رئيس (بنك، تأمين، صندوق)")+q("incidentalDepositsOnly","الاحتفاظ بأموال العملاء عرضي (مدارس، وكالات سفر)")+q("electedFullIfrs","غير خاضعة للمساءلة واختارت المعايير الكاملة")+'</div>'+
      '<div class="tbr-fw-r"><b>'+esc(app.label)+'</b><p>'+esc(app.reason)+'</p><small>'+esc(app.cite.join(" · "))+'</small></div></div>')+
    (withTb?'<div class="tbr-in"><label class="btn primary" style="cursor:pointer">'+SK.icon("excelrecon")+' رفع ملف الميزان<input type="file" data-tbfile accept=".xlsx,.csv,.tsv,.txt,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" hidden></label><button type="button" class="btn" data-a="books" title="استيراد يدوي من أدوات المحاسب — لا توجد مزامنة تلقائية مع ملف المراجعة">'+SK.icon("ledger")+' استيراد يدوي من الأدوات</button><button type="button" class="btn" data-a="waha" title="شركة وهمية كاملة: 40 حساباً بسنتين وبيانات المنشأة والمراجع">شركة الواحة — ملف كامل</button>'+corpusPicker()+'<button type="button" class="btn" data-a="sample">ميزان تجريبي</button><span class="hint">أو الصق الميزان من Excel:</span></div>'+
      '<textarea data-tbtext rows="7" dir="ltr" placeholder="رقم الحساب\tاسم الحساب\tمدين\tدائن\tالسنة السابقة">'+esc(d.tbText)+'</textarea><div class="sk-actions"><button type="button" class="btn primary" data-a="analyze">تحليل الميزان</button></div>':
      '<div class="sk-actions"><button type="button" class="btn primary" data-a="setup-done">تم</button><label class="sk-field tbr-mat"><span>الأهمية النسبية ('+esc(c.curSym||(eg?"جنيه":"ريال"))+') — فارغ = تلقائي</span><input type="number" min="0" step="100" data-mat value="'+(d.materiality?d.materiality/100:"")+'"></label></div>')+
  '</div></section>';
}

/* ---------- tab 1: accounts with their standards ---------- */
function tbTab(c){
  const b=c.all,m=b.materiality,k=b.fs.keys;
  const tile=(ic,cls,l,v,sub)=>'<div class="skk4-t"><span class="chip '+cls+'">'+SK.icon(ic)+'</span><span class="tx"><span>'+l+'</span><b>'+v+'</b><small>'+sub+'</small></span></div>';
  const rows=b.accounts.filter(a=>filter==="all"||(filter==="flag"&&a.findings.length)||(filter==="map"&&(a.basis==="type"||a.basis==="none")));
  const lineOpts=FS().LINES.map(l=>[l.key,l.ar]);
  const row=a=>{
    const codes=c.stdMap[a.code]||[],fs=a.findings.map(id=>b.findings.find(f=>f.id===id)).filter(Boolean),worst=fs.some(f=>f.severity==="high")?"high":fs.some(f=>f.severity==="medium")?"medium":fs.length?"low":"";
    const pc=a.changePct;
    return '<tr'+(worst?' class="tbr-'+worst+'"':'')+'><td class="mono c-code">'+esc(a.code)+'</td><td class="c-name"><b>'+esc(a.name)+'</b><small class="tbr-sub">'+esc(TI().TYPE_LABELS[a.type])+'</small></td>'+
      '<td class="c-line">'+(a.basis==="type"||a.basis==="none"||c.d.overrides[a.code]?'<select data-ov="'+esc(a.code)+'" aria-label="بند القوائم"><option value="">'+esc(a.lineAr)+'</option>'+lineOpts.map(([v,l])=>'<option value="'+v+'"'+(c.d.overrides[a.code]===v?' selected':'')+'>'+esc(l)+'</option>').join("")+'</select>':esc(a.lineAr))+'</td>'+
      '<td class="num c-bal" data-l="الرصيد">'+m0(a.natural)+'</td><td class="num c-prior" data-l="السابق">'+(a.prior===null?'—':m0(a.prior))+'</td><td class="num c-chg '+(pc>0?'pos':pc<0?'neg':'')+'" data-l="التغير">'+(pc===null?'—':(pc>0?'+':'')+pc+'%')+'</td>'+
      '<td class="tbr-stds c-std">'+codes.map(s=>'<button type="button" class="std-b '+famCls(s)+'" data-std="'+esc(s)+'" data-acc="'+esc(a.code)+'" title="'+esc((CX().STANDARD[s]||{}).titleAr||s)+'">'+esc(s)+'</button>').join("")+'</td>'+
      '<td class="c-fl">'+(fs.length?'<button type="button" class="tbr-fl" data-acc-f="'+esc(a.code)+'"><span class="sev '+sevCls(worst)+'"></span>'+fs.length+'</button>':'<span class="muted">—</span>')+'</td></tr>';
  };
  const topF=b.findings.slice().sort((x,y)=>({high:0,medium:1,low:2})[x.severity]-({high:0,medium:1,low:2})[y.severity]).slice(0,8);
  return '<div class="skk4">'+
      tile("ledger","",'الحسابات',b.accounts.length,b.fs.checks.mappedPct+'% مبوبة في القوائم')+
      tile(c.tb.balanced?"check":"alert",c.tb.balanced?"ok":"bad",'التوازن',c.tb.balanced?'متوازن':'غير متوازن',c.tb.balanced?'مدين = دائن '+sar(c.tb.totals.debit):'الفرق '+sar(c.tb.difference))+
      tile("calc","warn",'الأهمية النسبية',sar(m.overall),(c.plan?c.plan.benchmarkAr+' × '+Math.round(c.plan.rate*10000)/100:m.benchmarkAr+' × '+(m.rate*100))+'% · التنفيذية '+sar(m.performance))+
      tile("risks",b.summary.high?"bad":"ok",'الملاحظات',b.findings.length,b.summary.high+' عالية · '+b.summary.medium+' متوسطة')+
    '</div>'+(window.SKosifAuditBench?SKosifAuditBench.materialityNote(m):'')+
    (topF.length?'<section class="card"><div class="card-h"><div><h3>أهم ما اكتشفته المراجعة</h3><p>المحرك الآلي'+(c.session&&c.session.rounds.length?' و المراجع الذكي':'')+' — كل ملاحظة بأساسها الرقمي ومعيارها.</p></div></div><div class="card-b tbr-flist">'+topF.slice(0,3).map(fItem).join("")+
      /* R14 (#24): the three most severe in full, the rest a click away (eight full cards ran ~600 px above the accounts) */
      (topF.length>3?'<details class="tbr-more"><summary>بقية الملاحظات ('+(topF.length-3)+')</summary>'+topF.slice(3).map(fItem).join("")+'</details>':'')+'</div></section>':'')+
    '<section class="card"><div class="card-h"><div><h3>الحسابات ومعاييرها</h3><p>اضغط رقم المعيار بجوار الحساب لتعرف علاقته بالحساب ومتطلباته ومصدره الرسمي.</p></div><div class="sk-seg">'+[["all","الكل"],["flag","عليها ملاحظات"],["map","تحتاج تبويب"]].map(([v,l])=>'<button type="button" data-flt="'+v+'" aria-pressed="'+(filter===v)+'">'+l+'</button>').join("")+'</div></div>'+
    '<div class="card-b tbr-tw"><table class="sk-table tbr-t"><thead><tr><th>الرقم</th><th>الحساب</th><th>البند في القوائم</th><th>الرصيد</th><th>السابق</th><th>التغير</th><th>المعايير</th><th>ملاحظات</th></tr></thead><tbody>'+rows.map(row).join("")+'</tbody></table></div></section>';
}
function fItem(f){
  return '<div class="tbr-fi"><span class="sev '+sevCls(f.severity)+'"></span><div class="tx"><b>'+esc(f.title)+(f.account?' — '+esc(f.account):'')+'</b><small>'+esc(f.detail)+'</small><small class="tbr-basis">'+esc(f.basis)+' · الإجراء: '+esc(f.action)+'</small></div>'+
    '<div class="tbr-fi-m"><button type="button" class="std-b '+famCls(f.standard)+'" data-std="'+esc(f.standard)+'"'+(f.code?' data-acc="'+esc(f.code)+'"':'')+'>'+esc(f.standard)+'</button><span class="tbr-src">'+(f.source==="gemini"?'المراجع الذكي ج'+f.round:'المحرك')+'</span>'+
    (SK.flow?SK.flow.actions({title:f.title+(f.account?' — '+f.account:''),detail:f.detail+' ('+f.standard+')',sev:f.severity,cap:"tbreview"}):'')+'</div></div>';
}

/* ---------- tab 2: Gemini rounds ---------- */
function aiTab(c){
  if(c.sourceOnly)return '<section class="card"><div class="card-b"><h3>محاكاة ومرجع مصدر — لم يُقيّم</h3><p>الجولات المحاكية لا تمثل إجراءات مراجعة منفذة أو أدلة مهنية مقبولة. عدد الجولات: '+(c.session?c.session.rounds.length:0)+'.</p></div></section>';
  const ready=window.SKosifAI&&SKosifAI.ready(),s=c.session,state=s?AI().sessionState(s):{state:"start",label:"جاهز للجولة الأولى"};
  const next=s?s.rounds.length+1:1,size=CU()?Number(c.d.councilSize)||1:1;
  let action="";
  if(ready){
    if(state.state==="start"||state.state==="ready"||state.state==="awaiting-docs")action='<button type="button" class="btn primary" data-a="round"'+(busy?' disabled':'')+'>'+(busy==="round"?'المراجع الذكي يراجع…':busy==="council"?'المجلس منعقد…':(size>1?'اعقد المجلس — ':'')+(state.state==="start"?'ابدأ الجولة الأولى':'أرسل للجولة '+next))+'</button>';
    if(s&&s.rounds.length)action+='<button type="button" class="btn'+(state.state==="complete"||state.state==="limit"?' primary':'')+'" data-a="final"'+(busy?' disabled':'')+'>'+(busy==="final"?'يُعد التقرير…':s.final?'إعادة إصدار التقرير النهائي':'إصدار التقرير النهائي')+'</button>';
    if(ready)action+='<button type="button" class="btn" data-a="full-audit"'+(busy?' disabled':'')+' title="جولة مراجعة (أو المجلس) ثم التقرير النهائي ثم التقرير السنوي المتكامل بصياغة الذكاء الاصطناعي">'+(busy==="full"?esc(fullStep||"المراجعة الكاملة جارية…"):'✦ المراجعة الكاملة حتى التقرير المتكامل')+'</button>';
    if(busy)action+='<button type="button" class="btn danger" data-a="cancel">إلغاء</button>';
  }
  const rounds=s?s.rounds.slice().reverse():[];
  return (ready?'':SKosifAI.cardHTML()+'<p class="hint tbr-pad">بدون مفتاح تعمل المراجعة بالمحرك الآلي: المعايير والملاحظات والطلبات والقيود والقوائم متاحة في بقية التبويبات.</p>')+
    '<section class="card tbr-run"><div class="card-b"><div class="tbr-run-h"><div><b>'+esc(state.label)+'</b><small>'+(s?s.rounds.length+' جولة · '+AI().outstanding(s).length+' مستند مطلوب · '+AI().pendingUploads(s).length+' مرفوع للجولة القادمة':(size>1?'يعرض الميزان وسجل الأدلة المرقمة على '+(size-1)+' أعضاء بآراء مستقلة، ثم يقرر الرئيس — والقرار النهائي من درجات الثقة المحسوبة.':'يرسل الميزان ونتائج المحرك الآلي إلى المراجع الذكي ليراجعها بصفة مجلس من ثلاثة مراجعين.'))+'</small></div><div class="sk-actions">'+action+'</div></div>'+
      (CU()?CU().aiControls(c)+(ready?'':'<p class="hint">المجلس يحتاج مفتاح الذكاء الاصطناعي (Gemini أو OpenAI أو Claude) (أدناه)؛ بدونه تعمل المراجعة بالمحرك الآلي.</p>'):'')+
      (busy&&busy!=="council"?'<div class="tbr-busy"><i></i><span>'+(busy==="round"?'يراجع المراجع الذكي الميزان والمستندات — قد يستغرق دقيقة أو أكثر.':'يُعد المراجع الذكي التقرير النهائي…')+'</span></div>':'')+'</div></section>'+
    rounds.map(r=>roundCard(r,c)).join("")+
    (ready?'<details class="tbr-key"><summary>إعداد المراجع الذكي (المفتاح والنموذج)</summary>'+SKosifAI.cardHTML()+'</details>':'');
}
function roundCard(r,c){
  const today=new Date().toISOString().slice(0,10),ctx=c.d.ctx;
  const docRow=x=>{const chk=DC().checkDocument({...x.extracted,amount:x.extracted.amount,vatAmount:x.extracted.vatAmount,fileName:x.fileName},{periodStart:ctx.periodStart||undefined,periodEnd:ctx.periodEnd||undefined,today,jurisdiction:egypt(c.d)?"EG":"SA"});
    return '<tr><td>'+esc(x.fileName)+'</td><td class="mono">'+esc(x.requestId)+'</td><td><span class="sksev '+(x.verdict==="مقبول"?"ok":x.verdict==="مرفوض"?"bad":"warn")+'">'+esc(x.verdict)+'</span></td><td>'+esc(x.notes)+
      (Object.keys(x.extracted).length?'<small class="tbr-sub">'+Object.entries(x.extracted).map(([k,v])=>esc(k)+': '+esc(v)).join(" · ")+'</small>':'')+'</td><td>'+(chk.issues.length?'<span class="sksev '+(chk.verdict==="مرفوض"?"bad":"warn")+'" title="'+esc(chk.issues.map(i=>i.message).join("\n"))+'">تحقق آلي: '+esc(chk.verdict)+'</span>':Object.keys(x.extracted).length?'<span class="sksev ok">تحقق آلي: سليم</span>':'—')+'</td></tr>'};
  return '<section class="card tbr-round"><div class="card-h"><div><h3>الجولة '+r.no+' <span class="sksev '+(r.status==="complete"?"ok":"warn")+'">'+(r.status==="complete"?"اكتملت":"تطلب مستندات")+'</span></h3><p>'+esc(r.model)+' · '+esc(new Date(r.at).toLocaleString("ar-SA-u-ca-gregory-nu-latn",{dateStyle:"medium",timeStyle:"short"}))+'</p></div>'+SKCharts.ring(r.riskScore,{cls:r.riskScore>=70?"bad":r.riskScore>=45?"warn":"ok",size:54})+'</div><div class="card-b">'+
    '<p class="tbr-sum">'+esc(r.summary)+'</p>'+
    (r.opinions.length?'<div class="tbr-ops">'+r.opinions.map(o=>'<div><b>'+esc(o.reviewer)+'</b><p>'+esc(o.opinion)+'</p></div>').join("")+'</div>':'')+
    (CU()?CU().roundExtras(r,c):'')+
    (r.findings.length?'<h4>الملاحظات ('+r.findings.length+')</h4><div class="tbr-flist">'+r.findings.map(fItem).join("")+'</div>':'')+
    (r.requests.filter(q=>q.round===r.no).length?'<h4>المستندات المطلوبة</h4><div class="tbr-reqs">'+r.requests.filter(q=>q.round===r.no).map(q=>reqRow(q,c)).join("")+'</div>':'')+
    (r.reviewed.length?'<h4>المستندات التي راجعها</h4><div class="tbr-tw"><table class="sk-table" data-sk-plain><thead><tr><th>الملف</th><th>الطلب</th><th>الحكم</th><th>الملاحظات والبيانات المستخرجة</th><th>التحقق الآلي</th></tr></thead><tbody>'+r.reviewed.map(docRow).join("")+'</tbody></table></div>':'')+
    (r.adjustments.length?'<h4>قيود مقترحة</h4>'+r.adjustments.map(a=>'<p class="tbr-adjl"><span class="sksev '+(a.valid?"ok":"bad")+'">'+(a.valid?"متوازن":"مرفوض آلياً")+'</span> '+esc(a.title)+' — '+esc(a.reason)+'</p>').join("")+'<p class="hint">القيود المتوازنة تظهر في تبويب «التسويات والامتثال» لتعتمدها أو ترفضها.</p>':'')+
    (Object.keys(r.accountStandards).length?'<p class="hint">أكّد المجلس أو صحّح معايير '+Object.keys(r.accountStandards).length+' حساباً — تظهر بجوار الحسابات.</p>':'')+
    (r.warnings.length?'<div class="tbr-warn">'+r.warnings.map(w=>'<p>'+esc(w)+'</p>').join("")+'</div>':'')+
    (r.guidance?'<p class="tbr-next"><b>الخطوة التالية:</b> '+esc(r.guidance)+'</p>':'')+
  '</div></section>';
}

/* ---------- the audit studio's tools, inside the tab they belong to ----------
   No separate studio and no second menu: each step of the engagement shows, under its own work, the studio page for
   the same step (overview under the trial balance, council under the rounds, issues under confidence, documents under
   documents, statements and entries under adjustments, the report builder under reports). The studio always works on
   this file's own trial balance, synced automatically (audit-bridge.js). */
const ADV={tb:"overview",ai:"council",conf:"issues",docs:"documents",adj:"financials",fs:"report"};
function advHTML(t){
  const v=(window.SKosifAuditBridge?SKosifAuditBridge.STUDIO_VIEWS:[]).find(x=>x.view===ADV[t]);if(!v)return "";
  return '<section class="tbr-adv" aria-label="'+esc(v.label)+'"><header><h3>'+esc(v.label)+'</h3><p>'+esc(v.sub)+' — على ميزان هذا الملف نفسه، ويتحدّث معه تلقائياً.</p></header>'+
    (t==="docs"?SKosifAuditBridge.docAIHTML():'')+'<div class="tbr-studio-host" data-studio-host></div></section>';
}
function studioRows(c){return c.tb.rows.map(r=>{const b=r.balance/100;return [r.code,r.name,b>0?b:0,b<0?-b:0,TI().TYPE_LABELS[r.type]||""]})}

/* ---------- tab 3: documents ---------- */
/* the state of a first-round request's answer, as the second round reads it */
const r1State=s=>id=>{const [l]=reqStatus({id},s);return l==="مقبول"?"accepted":l==="غير متوفر"?"unavailable":l==="مرفوض"?"rejected":l==="غير كافٍ"?"partial":"open"};
function roundTwoCard(c){
  const OR=E().audit.openingRequests,first=c.base.requests.filter(q=>/^PBC-W-/.test(q.id));
  if(!OR||!OR.followUpSummary||!first.length)return "";
  const s=c.session,second=c.base.requests.filter(q=>q.round===2&&/^PBC-R2-/.test(q.id));
  const rows=OR.followUpSummary(first,r1State(s),second);
  return '<section class="card tbr-r2card"><div class="card-h"><div><h3>الجولة الثانية من الطلبات</h3><p>تُبنى من ردود العميل على الجولة الأولى: إجراء بديل لما لم يتوفر أو رُفض، واستكمال لما وصل ناقصاً، وتعميق الفحص بالإجراء التالي لدى مراجعي التقارير العالمية حيث قُبلت الأدلة. الطلب الذي لم يُجب بعد يبقى في الجولة الأولى.</p></div></div>'+
    '<table class="sk-table" data-sk-plain><thead><tr><th>الموضوع</th><th>مقبول</th><th>بلا رد</th><th>بديل</th><th>استكمال</th><th>تعميق</th></tr></thead><tbody>'+
    rows.map(r=>'<tr><td>'+esc(r.themeAr)+'</td><td class="num">'+r.accepted+'</td><td class="num">'+r.open+'</td><td class="num">'+r.alternative+'</td><td class="num">'+r.supplement+'</td><td class="num">'+r.deepen+'</td></tr>').join("")+
    '</tbody></table><p class="tbr-note">'+(second.length?'طلبات الجولة الثانية: '+second.length+' — مدرجة في قائمة المستندات أدناه بعلامة «ج2».':'لا طلبات في الجولة الثانية بعد — تظهر حين يرد العميل على طلبات الجولة الأولى.')+'</p></section>';
}
function reqStatus(q,s){
  if(!s)return ["قائم","warn"];
  const rev=s.rounds.flatMap(r=>r.reviewed).filter(x=>x.requestId===q.id),last=rev[rev.length-1];
  if(last&&last.verdict==="مقبول")return ["مقبول","ok"];
  if(s.unavailable.includes(q.id))return ["غير متوفر","bad"];
  if(AI().pendingUploads(s).some(u=>u.requestId===q.id))return ["مرفوع — بانتظار الجولة","info"];
  if(last)return [last.verdict,last.verdict==="مرفوض"?"bad":"warn"];
  return ["قائم","warn"];
}
function reqRow(q,c){
  const s=c.session,[l,cls]=reqStatus(q,s),files=s?s.uploads.filter(u=>u.requestId===q.id):[];
  const un=s&&s.unavailable.includes(q.id);
  return '<div class="tbr-req'+(un?' tbr-req-un':'')+'"><div class="tx"><b><span class="mono">'+esc(q.id)+'</span> '+esc(q.title)+'</b><small>'+esc(q.purpose)+(q.accounts&&q.accounts.length?' · الحسابات: '+esc(q.accounts.join("، ")):'')+'</small>'+
    (q.evidenceAr?'<small class="tbr-req-ev"><span class="tbr-rel r'+(q.reliability||1)+'" title="موثوقية الدليل (ISA 500)">'+"●".repeat(q.reliability||1)+"○".repeat(3-(q.reliability||1))+'</span> '+esc(q.evidenceAr)+(q.from?' · يقدمه: '+esc(q.from):'')+(q.why?' · '+esc(q.why):'')+'</small>':'')+
    (q.alt?'<small class="tbr-req-alt'+(un?' on':'')+'">'+(un?'غير متوفر — الإجراء البديل: ':'البديل إن تعذر: ')+esc(q.alt)+'</small>':'')+
    (q.round===2&&q.reasonAr?'<small class="tbr-r2">ج2 · '+esc(q.reasonAr)+' · '+esc(q.basis||"")+'</small>':'')+
    (files.length?'<small class="tbr-files">'+files.map(f=>'📎 '+esc(f.fileName)+' ('+Math.max(1,Math.round(f.size/1024))+' ك.ب · ج'+f.round+')').join(" · ")+'</small>':'')+(CU()&&s?CU().evidenceTagger(q,s,c.d):'')+'</div>'+
    '<div class="tbr-req-m"><span class="sksev '+(q.priority==="عالية"?"bad":q.priority==="متوسطة"?"warn":"info")+'">'+esc(q.priority)+'</span><span class="sksev '+cls+'">'+esc(l)+'</span>'+
    (l==="مقبول"?'':'<label class="btn sm" style="cursor:pointer">رفع<input type="file" multiple data-up="'+esc(q.id)+'" accept=".pdf,.png,.jpg,.jpeg,.webp,.csv,.txt,.tsv,.json" hidden></label>'+
      '<button type="button" class="btn sm" data-a="unavail" data-id="'+esc(q.id)+'">'+(s&&s.unavailable.includes(q.id)?'متوفر':'غير متوفر')+'</button>')+'</div></div>';
}
function companyHandoffCard(c){
  const cp=CP();if(!cp||!cp.auditHandoffs)return "";
  const items=cp.auditHandoffs().filter(h=>h.status==="pending");if(!items.length)return "";
  const aiReq=c.session?c.session.rounds.flatMap(r=>r.requests||[]):[],reqs=[...new Map([...c.base.requests,...aiReq].map(q=>[q.id,q])).values()];
  return '<section class="card"><div class="card-h"><div><h3>مصادر واردة من مساعد التقارير</h3><p>هذه ملفات أرسلها المستخدم صراحة من بوابة التقارير. اختر طلب المراجعة الذي تخدمه؛ النقل لا يعني قبول الدليل.</p></div><span class="sksev info">'+items.length+' وارد</span></div><div class="card-b tbr-reqs">'+
    items.map(h=>{const d=h.document;return '<div class="tbr-req"><div class="tx"><b>📎 '+esc(d.name)+'</b><small>'+esc(d.type)+' · '+Math.max(1,Math.round(d.size/1024))+' ك.ب · SHA-256 '+esc((d.sha256||"").slice(0,12))+'</small></div><div class="tbr-req-m"><select data-handoff-request="'+esc(h.id)+'" aria-label="طلب المراجعة للمستند"><option value="">اختر طلب المراجعة…</option>'+reqs.map(q=>'<option value="'+esc(q.id)+'">'+esc(q.id+' — '+q.title)+'</option>').join("")+'</select><button type="button" class="btn sm" data-a="handoff-import" data-id="'+esc(h.id)+'">إرفاق بالطلب</button></div></div>'}).join("")+
  '</div></section>';
}
async function importCompanyHandoff(id){
  const cp=CP(),h=cp&&cp.auditHandoffs().find(x=>x.id===id);if(!h)return toast("لم أجد المصدر الوارد","warn");
  const sel=[...root.querySelectorAll("[data-handoff-request]")].find(x=>x.dataset.handoffRequest===id),reqId=sel&&sel.value;
  if(!reqId)return toast("اختر طلب المراجعة الذي يخدمه المستند","warn");
  try{
    const rec=await cp.readDocument(h.documentId);if(!rec||!rec.blob)throw new Error("المصدر لم يعد متاحًا داخل مساحة الشركة");
    const file=new File([rec.blob],rec.name,{type:rec.mime||rec.blob.type||"application/octet-stream"});
    await upload(reqId,[file]);cp.markAuditHandoff(id,"attached",reqId);toast("نُقل المستند إلى الطلب "+reqId+" — بانتظار المراجعة في الجولة التالية","ok");paint();
  }catch(e){toast(e.message||String(e),"bad")}
}
function docsTab(c){
  const s=c.session,gem=s?[...new Map(s.rounds.flatMap(r=>r.requests).map(q=>[q.id,q])).values()]:[];
  return companyHandoffCard(c)+'<section class="card"><div class="card-h"><div><h3>طلبات المراجع الذكي</h3><p>'+(gem.length?gem.length+' طلباً عبر الجولات. ارفع المستند ثم أرسل الجولة التالية من تبويب «جولات المراجعة».':'تظهر هنا بعد الجولة الأولى.')+'</p></div></div><div class="card-b tbr-reqs">'+(gem.map(q=>reqRow(q,c)).join("")||'<p class="empty">لا طلبات بعد.</p>')+'</div></section>'+
    roundTwoCard(c)+
    '<section class="card"><div class="card-h"><div><h3>قائمة المستندات المطلوبة من العميل (PBC)</h3><p>أعدها المحرك الآلي حسب البنود والمخاطر — '+c.base.requests.length+' مستنداً. ما ترفعه هنا يُرسل أيضاً إلى المراجع الذكي في الجولة التالية.</p></div><div class="sk-actions"><button type="button" class="btn primary sm" data-a="pbc-letter">'+SK.icon("reports")+' خطاب طلب المستندات</button><button type="button" class="btn sm" data-a="pbc-csv">تصدير القائمة</button></div></div><div class="card-b tbr-reqs">'+[["planning","التخطيط وفهم المنشأة"],["area","بنود القوائم"],["kam","المناطق الحكمية (الأمور الرئيسية)"],["completion","الإقفال والتقرير"],["",""]].map(([k,l])=>{const qs=c.base.requests.filter(q=>(q.stage||"")===k);return qs.length?(l?'<h4 class="tbr-stage">'+esc(l)+' <small>'+qs.length+'</small></h4>':'')+qs.map(q=>reqRow(q,c)).join(""):""}).join("")+'</div></section>';
}

/* ---------- tab 4: adjustments and compliance ---------- */
function eclCard(c){
  const rec=c.base.fs.lines.find(l=>l.key==="receivables");if(!rec||!rec.current)return "";
  const b=c.d.ecl||RV().DEFAULT_ECL_BUCKETS.map(x=>({...x})),m=RV().eclMatrix(b),ex=RV().existingAllowance(c.tb),gross=rec.current+ex;
  return '<section class="card"><div class="card-h"><div><h3>الخسائر الائتمانية المتوقعة — '+esc(CX().inFramework("IFRS 9",c.fw))+'</h3><p>مصفوفة أعمار الذمم (النهج المبسط): أدخل رصيد كل فئة من كشف الأعمار ومعدل خسارتها، فيُنشأ القيد الذي يوصل المخصص إلى النتيجة. إجمالي الذمم '+sar(gross)+' · المخصص القائم '+sar(ex)+'.</p></div></div><div class="card-b tbr-tw">'+
    '<table class="sk-table tbr-ecl" data-sk-plain><thead><tr><th>فئة العمر</th><th>الرصيد</th><th>معدل الخسارة %</th><th>الخسارة المتوقعة</th></tr></thead><tbody>'+
    m.rows.map((r,i)=>'<tr><td>'+esc(r.label)+'</td><td><input type="number" min="0" step="1" inputmode="decimal" data-ecl-x="'+i+'" value="'+(r.exposure?r.exposure/100:"")+'" aria-label="رصيد '+esc(r.label)+'"></td><td><input type="number" min="0" max="100" step="0.1" inputmode="decimal" data-ecl-r="'+i+'" value="'+r.rateBps/100+'" aria-label="معدل '+esc(r.label)+'"></td><td class="num">'+m0(r.loss)+'</td></tr>').join("")+
    '<tr class="tot"><td>المجموع</td><td class="num">'+m0(m.exposure)+'</td><td class="num">'+(m.weightedBps/100)+'%</td><td class="num">'+m0(m.loss)+'</td></tr></tbody></table>'+
    (m.exposure&&m.exposure!==gross?'<p class="tbr-warn">مجموع كشف الأعمار '+sar(m.exposure)+' لا يطابق إجمالي الذمم في الميزان '+sar(gross)+' — طابق الكشف قبل اعتماد القيد.</p>':'')+
    '<div class="sk-actions"><button type="button" class="btn primary sm" data-a="ecl-save">احتساب وإنشاء القيد</button>'+(c.d.ecl?'<button type="button" class="btn sm" data-a="ecl-clear">إزالة الحاسبة</button>':'')+'</div></div></section>';
}
function adjTab(c){
  const d=c.d,m=c.base.materiality,uncorr=c.pool.filter(a=>!d.accepted.includes(a.id));
  const eff=c.accepted.length?RV().adjustmentEffect(c.tb,c.accepted):{profit:0,assets:0,equity:0};
  const un=uncorr.length?RV().adjustmentEffect(c.tb,uncorr):{profit:0};
  const card=a=>{const v=RV().validateAdjustment(a,c.tb),on=d.accepted.includes(a.id),off=d.rejected.includes(a.id);
    return '<div class="tbr-adj'+(on?' on':off?' off':'')+'"><div class="tbr-adj-h"><div><b><span class="mono">'+esc(a.id)+'</span> '+esc(a.title)+'</b><small>'+esc(a.reason)+'</small></div><div class="tbr-adj-m"><button type="button" class="std-b '+famCls(CX().normalizeCode(a.standard)||"")+'" data-std="'+esc(CX().normalizeCode(a.standard)||a.standard)+'">'+esc(a.standard)+'</button><span class="tbr-src">'+(a.source==="gemini"?"المراجع الذكي"+(a.round?" ج"+a.round:""):"المحرك")+'</span>'+(a.estimate?'<span class="sksev warn">تقديري</span>':'')+'<span class="sksev '+(v.balanced?"ok":"bad")+'">'+(v.balanced?"متوازن":"غير متوازن")+'</span></div></div>'+
      '<table class="sk-table tbr-jl" data-sk-plain><thead><tr><th>الحساب</th><th>مدين</th><th>دائن</th></tr></thead><tbody>'+a.lines.map(l=>'<tr><td><span class="mono">'+esc(l.code)+'</span> '+esc(l.name)+(v.newAccounts.some(n=>n.startsWith(l.code+" "))?' <span class="sksev info">حساب جديد</span>':'')+'</td><td class="num">'+(l.debit?m0(l.debit):'')+'</td><td class="num">'+(l.credit?m0(l.credit):'')+'</td></tr>').join("")+
      '<tr class="tot"><td>المجموع</td><td class="num">'+m0(v.debit)+'</td><td class="num">'+m0(v.credit)+'</td></tr></tbody></table>'+
      '<div class="sk-actions"><button type="button" class="btn sm '+(on?'primary':'')+'" data-adj="accept" data-id="'+esc(a.id)+'"'+(v.valid?'':' disabled')+'>'+(on?'✓ معتمد':'اعتماد القيد')+'</button><button type="button" class="btn sm" data-adj="reject" data-id="'+esc(a.id)+'">'+(off?'مرفوض':'رفض')+'</button></div></div>'};
  const comp=c.all.compliance,cnt=k=>comp.filter(x=>x.status===k).length;
  return '<div class="skk4">'+
      '<div class="skk4-t"><span class="chip">'+SK.icon("ledger")+'</span><span class="tx"><span>قيود مقترحة</span><b>'+c.pool.length+'</b><small>'+c.accepted.length+' معتمد · '+d.rejected.length+' مرفوض</small></span></div>'+
      '<div class="skk4-t"><span class="chip ok">'+SK.icon("check")+'</span><span class="tx"><span>أثر المعتمد على الربح</span><b>'+sar(eff.profit)+'</b><small>حقوق الملكية '+sar(eff.equity)+'</small></span></div>'+
      '<div class="skk4-t"><span class="chip '+(Math.abs(un.profit)>m.overall?"bad":"warn")+'">'+SK.icon("alert")+'</span><span class="tx"><span>تحريفات غير مصححة</span><b>'+sar(Math.abs(un.profit))+'</b><small>مقابل أهمية نسبية '+sar(m.overall)+' (ISA 450)</small></span></div>'+
      '<div class="skk4-t"><span class="chip '+(cnt("غير ممتثل")?"bad":"ok")+'">'+SK.icon("governance")+'</span><span class="tx"><span>الامتثال للمعايير</span><b>'+cnt("ممتثل")+' / '+comp.length+'</b><small>'+cnt("غير ممتثل")+' غير ممتثل · '+cnt("ممتثل جزئياً")+' جزئي · '+cnt("يتطلب أدلة")+' بانتظار أدلة</small></span></div>'+
    '</div>'+
    eclCard(c)+
    '<section class="card"><div class="card-h"><div><h3>قيود التسوية المقترحة</h3><p>كل قيد متوازن ومتحقق من حساباته قبل عرضه؛ المعتمد منها يدخل في القوائم «بعد التسويات».</p></div><div class="sk-actions"><button type="button" class="btn sm" data-a="jev-adj"'+(c.pool.length>1?'':' disabled')+'>'+SK.icon("jev")+' أولوية القيود مع Jev</button><button type="button" class="btn sm" data-a="adj-csv">تصدير القيود</button></div></div><div class="card-b">'+(c.pool.map(card).join("")||'<p class="empty">لا قيود مقترحة — لم يظهر ما يستوجب التسوية من الأرقام.</p>')+'</div></section>'+
    '<section class="card"><div class="card-h"><div><h3>مناقشة الامتثال للمعايير</h3><p>لكل معيار: الحسابات التي يحكمها، الملاحظات، الأدلة المنتظرة، والحكم.</p></div></div><div class="card-b tbr-comp">'+
      comp.map(x=>'<div class="tbr-ci"><div class="tbr-ci-h"><button type="button" class="std-b '+famCls(x.code)+'" data-std="'+esc(x.code)+'">'+esc(x.code)+'</button><b>'+esc(x.title)+'</b><span class="sksev '+(x.status==="ممتثل"?"ok":x.status==="غير ممتثل"?"bad":x.status==="ممتثل جزئياً"?"warn":"info")+'">'+esc(x.status)+'</span></div><p>'+esc(x.discussion)+'</p></div>').join("")+
      (c.session&&c.session.final&&c.session.final.compliance.length?'<h4>رأي المراجع الذكي في الامتثال (التقرير النهائي)</h4>'+c.session.final.compliance.map(x=>'<div class="tbr-ci"><div class="tbr-ci-h"><button type="button" class="std-b '+famCls(x.standardCode)+'" data-std="'+esc(x.standardCode)+'">'+esc(x.standardCode)+'</button><span class="sksev '+(x.status==="ممتثل"?"ok":x.status==="غير ممتثل"?"bad":"warn")+'">'+esc(x.status)+'</span></div><p>'+esc(x.discussion)+'</p></div>').join(""):'')+
    '</div></section>';
}

/* ---------- tab 5: statements and reports ---------- */
const STG={"منجز":"ok","قيد التنفيذ":"warn","لم يبدأ":"info","غير منطبق":""};
function programmeCard(c){
  const p=c.programme,pct=PG().programmeProgress(p),cf=c.d.confirm;
  return '<section class="card"><div class="card-h"><div><h3>برنامج المراجعة — عشر مراحل</h3><p>حالة كل مرحلة من بيانات المراجعة نفسها: الأدلة المقبولة والقيود المحسومة والإفصاحات والاعتمادات.</p></div>'+SKCharts.ring(pct,{cls:pct>=80?"ok":pct>=40?"warn":"bad",size:58})+'</div><div class="card-b"><ol class="tbr-prog">'+
    p.map(x=>'<li class="'+(STG[x.status]||"na")+'"><span class="mono">'+esc(x.id)+'</span><div><b>'+esc(x.title)+'</b><small>'+esc(x.detail)+'</small><small class="tbr-sub">'+x.standards.map(z=>'<button type="button" class="std-b '+famCls(z)+'" data-std="'+esc(z)+'">'+esc(z)+'</button>').join(" ")+'</small></div><span class="sksev '+(STG[x.status]||"")+'">'+esc(x.status)+'</span></li>').join("")+'</ol>'+
    '<div class="tbr-conf"><label class="checkline"><input type="checkbox" data-conf="independence"'+(cf.independence?' checked':'')+'><span><b>أؤكد استقلال فريق المراجعة وقبول التكليف</b><small>ISA 220 · ISQM 1 — شرط لإنجاز R01</small></span></label>'+
    '<label class="checkline"><input type="checkbox" data-conf="partner"'+(cf.partner?' checked':'')+'><span><b>اعتماد الشريك المسؤول</b><small>لا يصدر الرأي دون هذا الاعتماد — شرط لإنجاز R10</small></span></label></div></div></section>';
}
function disclosuresCard(c){
  const r=c.disclosures,cf=c.d.confirm,HUM={"framework.editionReviewed":"edition","compliance.humanApproved":"compliance","unrecognized-items":"unrecognized"};
  return '<section class="card"><div class="card-h"><div><h3>جاهزية الإفصاحات</h3><p>'+(r.valid?'جاهزة للمراجعة البشرية':'تنقصها '+r.summary.blockers+' متطلبات أساسية')+' · '+r.summary.passed+' من '+r.summary.total+' مستوفاة'+(r.summary.warnings?' · '+r.summary.warnings+' تنبيه':'')+'.</p></div><span class="sksev '+(r.valid?"ok":"bad")+'">'+(r.valid?"جاهزة":"غير مكتملة")+'</span></div><div class="card-b tbr-dsc">'+
    r.checks.map(k=>'<div class="tbr-dc '+k.status+'"><i>'+(k.status==="pass"?"✓":"!")+'</i><div><b>'+esc(k.label)+'</b>'+(k.detail?'<small>'+esc(k.detail)+'</small>':'')+'</div>'+
      (HUM[k.id]?'<label class="tbr-dc-h"><input type="checkbox" data-conf="'+HUM[k.id]+'"'+(cf[HUM[k.id]]?' checked':'')+'> اعتماد بشري</label>':'<span class="sksev '+(k.status==="pass"?"ok":k.severity==="blocker"?"bad":"warn")+'">'+(k.status==="pass"?"مستوفى":k.severity==="blocker"?"أساسي":"تنبيه")+'</span>')+'</div>').join("")+
    (r.uncertainties.length?'<h4>مصادر عدم التأكد في التقديرات</h4><ul class="tbr-ul">'+r.uncertainties.map(u=>'<li><b>'+esc(u.nature)+'</b> — '+esc(u.affected)+' '+sar(u.carrying)+' · الافتراضات: '+esc(u.assumptions.join("، "))+'</li>').join("")+'</ul>':'')+
    (r.sections.length?'<h4>الأقسام المتخصصة في معيار المنشآت الصغيرة</h4><ul class="tbr-ul">'+r.sections.map(x=>'<li>القسم '+esc(x.section)+' — '+esc(x.title)+': <b>'+(x.status==="applicable"?"ينطبق":"لا ينطبق")+'</b> ('+esc(x.rationale)+')</li>').join("")+'</ul>':'')+
  '</div></section>';
}
function stmt(rows,hasPrior,cls=""){
  return '<table class="sk-table tbr-fs '+cls+'" data-sk-plain><thead><tr><th></th><th>إيضاح</th><th>'+(hasPrior?'السنة الحالية':'المبلغ')+'</th>'+(hasPrior?'<th>السنة السابقة</th>':'')+'</tr></thead><tbody>'+
    rows.map(r=>r.level==="heading"?'<tr class="h"><td colspan="'+(hasPrior?4:3)+'">'+esc(r.ar)+'</td></tr>':'<tr class="'+r.level+'"><td>'+esc(r.ar)+'</td><td class="mono">'+(r.note||'')+'</td><td class="num">'+m0(r.current)+'</td>'+(hasPrior?'<td class="num">'+(r.prior===null?'':m0(r.prior))+'</td>':'')+'</tr>').join("")+'</tbody></table>';
}
function kamsOf(c){
  const f=c.session&&c.session.final;
  if(f&&f.kams.length)return f.kams;
  /* the matters of most significance (ISA 701), drafted by the KAM engine from the line risks and the global precedents
     (global-benchmarks: why each kind of matter needs judgement and what the bundle's auditors did about it, with pages),
     with the result from the evidence (rounds and signed working papers), references and new/continuing against last year */
  const ks=AP()?AP().kamList(c):[];
  if(ks.length)return ks.filter(k=>k.selected).map(k=>({title:k.title,why:k.description,how:k.how,observation:k.observation,refs:k.refs,trend:k.trend}));
  return [];
}
function reportParts(c){
  const fs=fsAfter?c.fsAfterAdj:c.fsBefore,hp=fs.hasPrior,rs=AN().ratios(fs),z=AN().altmanZ(fs),bm=AN().beneishM(fs),du=AN().dupont(fs).current,hl=AN().highlights(fs),md=AN().mdna(fs);
  const fmt=(v,u)=>v===null||v===undefined?'—':u==="%"?v+'%':u==="days"?v+' يوم':v+'×';
  return {fs,hp,rs,z,bm,du,hl,md,fmt};
}
const DOCS=[["issue","الإصدار والاعتماد"],["integrated","التقرير السنوي المتكامل"],["statements","القوائم المالية"],["annual","التقرير السنوي (نموذج 10-K)"],["release","بيان النتائج"],["auditor","تقرير المراجع المستقل"],["notes","الإيضاحات المتممة"],["committee","تقرير لجنة المراجعة"],["icfr","الرقابة الداخلية"],["analysis","التحليل المالي"],["peers","المقارنة العالمية"]];
const DOC_GROUPS=[["القوائم والإصدار",["issue","statements","notes"]],["التقارير المنشورة",["integrated","annual","release","auditor"]],["الحوكمة",["committee","icfr"]],["التحليل",["analysis","peers"]]];
const PAPER=new Set(["integrated","annual","release","auditor","notes","committee","icfr","peers"]);
let docStyled=false;
function fmtDate(iso,eg){if(!/^\d{4}-\d{2}-\d{2}$/.test(iso||""))return "";try{return new Date(iso+"T12:00:00").toLocaleDateString(eg?"ar-EG-u-nu-latn":"ar-SA-u-ca-gregory-nu-latn",{day:"numeric",month:"long",year:"numeric"})}catch{return iso}}
function docX(c){
  if(c.sourceOnly){
    const model=c.sourceModel?structuredClone(c.sourceModel):null,ctx=structuredClone(c.d.ctx);ctx.auditFirm="";ctx.auditCity="";
    // Return before any Saudi policy, tax, narrative, audit-opinion or ICFR template runs.
    return {c,fs:structuredClone(fsAfter?c.fsAfterAdj:c.fsBefore),sourceOnly:true,sourceVerified:c.sourceVerified&&!c.accepted.length,
      sourceModel:model,ctx,fw:model?model.accountingBasis:"unavailable",cur:model?model.currency+" "+model.unit:"unavailable",
      periodEnd:model?model.periodEnd:"",priorPeriodEnd:model?model.priorPeriodEnd:"",
      opinion:{opinion:"not-assessed",ar:"مرجع مصدر فقط — لم يُجر تقييم تأكيد",basis:[],goingConcern:false},
      simulation:!!(c.d.demoRun||(c.session&&c.session.rounds&&c.session.rounds.length))};
  }
  const fs=fsAfter?c.fsAfterAdj:c.fsBefore,m=c.base.materiality,ctx=c.d.ctx,eg=c.fw==="EAS",kams=kamsOf(c).map(k=>({title:k.title,description:k.why,how:k.how,observation:k.observation,refs:k.refs,trend:k.trend}));
  const x={c,fs,cur:CUR,ctx,fw:c.fw,periodEnd:fmtDate(ctx.periodEnd,eg),priorPeriodEnd:ctx.periodEnd?fmtDate(yearBack(ctx.periodEnd),eg):"",kams,opinion:c.derived,goingConcernSection:AP()?AP().gcSection(c):undefined};
  const GV=E().audit.governance;if(!GV)return x;
  x.approach=GV.auditApproach({materiality:m,currency:CUR,kamTitles:kams.map(k=>k.title),taxWord:eg?"الضريبة":"الزكاة"});
  x.notesPkg=E().reports.notes.notesPackage(fs,{country:eg?"EG":"SA"});
  x.policies=Object.fromEntries([1,2,3,4].map(n=>[n,policyNote(n,c)]));
  const eff=c.accepted.length?RV().adjustmentEffect(c.tb,c.accepted):{profit:0};
  x.committee={company:ctx.company,period:ctx.period,currency:CUR,firm:ctx.auditFirm,kams,materiality:m,corrected:{count:c.accepted.length,profitEffect:eff.profit},
    uncorrected:{count:c.pool.filter(a=>!c.d.accepted.includes(a.id)).length,effect:c.derived.misstatement},
    findings:{high:c.all.summary.high,medium:c.all.summary.medium,low:c.all.findings.filter(f=>f.severity==="low").length,controlTitles:c.all.findings.filter(f=>f.severity==="high").map(f=>f.title)},
    opinionAr:c.derived.ar,goingConcern:c.derived.goingConcern,framework:c.fw};
  x.icfr={company:ctx.company,periodEnd:x.periodEnd,materiality:m,uncorrectedEffect:c.derived.misstatement,findings:c.all.findings.map(f=>({title:f.title+(f.account?" — "+f.account:""),severity:f.severity,kind:f.kind}))};
  /* the integrated report's narrative: the AI's saved draft while the figures it was written on still hold, else the engine's */
  const NR=E().reports.narrative;
  if(NR){
    x.pack=NR.facts({fs,review:c.base,ctx:{...ctx,country:eg?"EG":"SA"},framework:c.fw,currency:CUR,kams,adjustments:{count:c.accepted.length,profitEffect:eff.profit},
      opinion:{ar:c.derived.ar,modified:c.derived.opinion!=="unmodified",basis:c.derived.basis,goingConcern:c.derived.goingConcern},
      peers:E().reports.peerBenchmarks?E().reports.peerBenchmarks.compare(fs,{}).map(r=>({ar:r.ar,you:r.you,median:r.median,unit:r.unit})):[],
      findings:{high:c.all.summary.high,medium:c.all.summary.medium,low:c.all.findings.filter(f=>f.severity==="low").length}});
    const saved=c.d.narrative,sig=narrSig(x.pack);
    x.narrStale=!!(saved&&saved.sig!==sig);
    x.narr=saved&&saved.sig===sig?saved.result:NR.normalizeNarrative(NR.fallbackNarrative(x.pack),x.pack,{origin:"engine"});
    x.q=NR.quality(x.narr,x.pack);
  }
  return x;
}
/* the narrative belongs to the figures it was written on */
const narrSig=pack=>MN().fingerprint([pack.facts.map(f=>[f.key,f.value,f.prior]),pack.kams.map(k=>k.title),pack.opinion.ar]);
function docView(c,kind){
  if(!docStyled&&window.SKosifReportDocs){const st=document.createElement("style");st.id="rd-css";st.textContent=(window.SK&&SK.brandCSS?SK.brandCSS:String)(SKosifReportDocs.CSS+(window.SKosifIntegrated?SKosifIntegrated.CSS:""));document.head.appendChild(st);docStyled=true}
  const ctx=c.d.ctx;
  if(kind==="integrated"&&window.SKosifIntegrated)return narrBar(c)+'<div class="rd-paper">'+SKosifIntegrated.render(docX(c))+'</div>';
  return (kind==="auditor"?'<section class="card"><div class="card-h"><div><h3>بيانات التوقيع</h3><p>تظهر في تقرير المراجع؛ الخانات الفارغة تبقى بين قوسين لتُستكمل.</p></div></div><div class="card-b"><div class="tbr-sig">'+
    [["auditFirm","مكتب المراجعة"],["auditPartner","الشريك المسؤول"],["auditLicence","رقم الترخيص"],["auditCity","المدينة"]].map(([k,l])=>'<label class="sk-field"><span>'+l+'</span><input data-ctx="'+k+'" value="'+esc(ctx[k]||"")+'"></label>').join("")+
    '</div><div class="sk-actions"><button type="button" class="btn sm primary" data-a="sig-save">حفظ</button></div></div></section>':'')+
    (kind==="auditor"&&window.SKosifAuditBench?SKosifAuditBench.precedentsHTML(c.base.risks.filter(r=>r.significant).map(r=>r.lineKey),ctx.activity):'')+
    '<div class="rd-paper">'+SKosifReportDocs[kind](docX(c))+'</div>';
}
function fsTab(c){
  if(c.sourceOnly){const kinds=[['annual','القوائم من المصدر'],['notes','الإيضاحات'],['auditor','مرجع المراجع الأصلي'],['icfr','حالة الرقابة']],kind=kinds.some(([k])=>k===doc)?doc:'annual';
    return '<nav class="tbr-docs" aria-label="تقارير المصدر">'+kinds.map(([k,l])=>'<button type="button" data-doc="'+k+'" aria-pressed="'+(kind===k)+'">'+esc(l)+'</button>').join('')+'</nav><div class="sk-actions"><button type="button" class="btn" data-a="print">معاينة وطباعة مرجع المصدر</button><button type="button" class="btn" data-a="fs-csv">تصدير القوائم مع بيانات المصدر</button></div>'+SKosifReportDocs[kind](docX(c));
  }
  const p=reportParts(c),fs=p.fs,d=c.derived,f=c.session&&c.session.final,GROUP={liquidity:"السيولة",profitability:"الربحية",efficiency:"الكفاءة",leverage:"الرفع المالي",cash:"التدفق النقدي"};
  const hl=p.hl.map(h=>'<div class="skk4-t"><span class="tx"><span>'+esc(h.ar)+'</span><b>'+(h.kind==="money"?sar(h.current):p.fmt(h.current,h.kind))+'</b><small>'+(h.change===null?(h.prior===null?'':'السابق '+(h.kind==="money"?sar(h.prior):p.fmt(h.prior,h.kind))):(h.change>=0?'▲ ':'▼ ')+Math.abs(h.change)+'% عن السابق')+'</small></span></div>').join("");
  const L=Object.fromEntries(DOCS),btn=k=>'<button type="button" data-doc="'+k+'" aria-pressed="'+(doc===k)+'">'+esc(L[k])+'</button>';
  const fwDocs=FW()?Object.entries(FW().docs).map(([k,[,l]])=>'<button type="button" data-fw-doc="'+k+'" title="يفتح في المعاينة">'+esc(l)+' ↗</button>').join(""):"";
  const docBar='<nav class="tbr-docs tbr-docg" aria-label="مركز التقارير">'+DOC_GROUPS.map(([g,ks])=>'<div class="tbr-dg"><small>'+esc(g)+'</small><div>'+ks.map(btn).join("")+'</div></div>').join("")+
    (fwDocs?'<div class="tbr-dg"><small>أوراق المراجعة</small><div>'+fwDocs+'</div></div>':'')+'</nav>';
  const body=PAPER.has(doc)?docView(c,doc):doc==="statements"?fsStatements(c,p,fs,d,f,hl,GROUP):doc==="analysis"?fsAnalysis(c,p,fs,d,f,hl,GROUP):fsIssue(c,p,fs,d,f,hl,GROUP);
  return docBar+'<section class="card tbr-op"><div class="card-b"><div class="tbr-op-h"><div><span class="eyebrow">رأي المراجع — مشتق وفق '+esc(d.isa)+'</span><h3>'+esc(d.ar)+'</h3>'+d.basis.map(x=>'<p>'+esc(x)+'</p>').join("")+(d.goingConcern?'<p class="tbr-warn">مؤشرات استمرارية تتطلب تقييماً وإفصاحاً (ISA 570).</p>':'')+'</div>'+
      '<div class="tbr-op-s">'+(f?'<small>اقتراح المراجع الذكي</small><b>'+esc(f.aiOpinion||"—")+'</b>':'<small>لا يوجد تقرير المراجع الذكي نهائي</small>')+'<small class="hint">لا يصدر الرأي إلا باعتماد الشريك المسؤول.</small></div></div>'+
      '<div class="sk-actions"><div class="sk-seg" role="group"><button type="button" data-fsv="after" aria-pressed="'+fsAfter+'">بعد التسويات ('+c.accepted.length+')</button><button type="button" data-fsv="before" aria-pressed="'+!fsAfter+'">قبل التسويات</button></div>'+
      '<button type="button" class="btn primary" data-a="print">'+SK.icon("reports")+' معاينة وطباعة</button><button type="button" class="btn" data-a="jev-op">'+SK.icon("jev")+' رأي ثانٍ من Jev</button><button type="button" class="btn" data-a="fs-csv">تصدير القوائم</button></div></div></section>'+
    body;
}
/* management letter in the research's format (appendix C): observation · effect · recommendation · management's
   response (the client's reply, typed by the reviewer and kept with the file). المراجع الذكي's final letter when issued,
   otherwise a draft from the engine's high and medium findings. */
function letterItems(c){
  const f=c.session&&c.session.final;
  if(f&&f.letter.length)return {src:"gemini",items:f.letter.map(x=>({title:x.title,priority:x.priority,observation:x.observation,effect:x.effect||"",recommendation:x.recommendation}))};
  const pr={high:"عالية",medium:"متوسطة",low:"منخفضة"};
  return {src:"engine",items:c.all.findings.filter(x=>x.severity!=="low").slice(0,12).map(x=>({title:x.title+(x.account?" — "+x.account:""),priority:pr[x.severity],observation:x.detail,
    effect:(x.severity==="high"?"قد يؤدي إلى تحريف جوهري في القوائم المالية":"قد يؤثر على دقة القوائم المالية أو كفاية الإفصاح")+(x.standard?" — المعيار: "+x.standard:"")+(x.basis?" — "+x.basis:""),recommendation:x.action}))};
}
function letterCard(c){
  const L=letterItems(c),resp=c.d.letterResponses||{};if(!L.items.length)return "";
  return '<section class="card tbr-letter"><div class="card-h"><div><h3>خطاب الإدارة</h3><p>'+(L.src==="gemini"?'من التقرير النهائي':'مسودة من ملاحظات المحرك الآلي — تكتمل بالتقرير النهائي')+' · الصيغة: الملاحظة، الأثر، التوصية، رد الإدارة (ISA 265).</p></div><div class="sk-actions"><button type="button" class="btn sm" data-a="letter-print">طباعة الخطاب</button></div></div><div class="card-b">'+
    L.items.map((x,i)=>'<article class="tbr-li"><header><i>'+(i+1)+'</i><b>'+esc(x.title)+'</b><span class="sksev '+(x.priority==="عالية"?"bad":x.priority==="متوسطة"?"warn":"info")+'">'+esc(x.priority)+'</span></header>'+
      '<dl><dt>الملاحظة</dt><dd>'+esc(x.observation||"—")+'</dd>'+(x.effect?'<dt>الأثر</dt><dd>'+esc(x.effect)+'</dd>':'')+'<dt>التوصية</dt><dd>'+esc(x.recommendation||"—")+'</dd>'+
      '<dt>رد الإدارة</dt><dd><textarea rows="2" data-lr="'+esc(x.title)+'" placeholder="يُكتب رد الإدارة وتاريخ التنفيذ المتوقع">'+esc(resp[x.title]||"")+'</textarea></dd></dl></article>').join("")+'</div></section>';
}
function letterHTML(c){
  const L=letterItems(c),resp=c.d.letterResponses||{},ctx=c.d.ctx;
  return '<p>السادة/ إدارة '+esc(ctx.company||"الشركة")+' المحترمين،</p><p>في إطار مراجعتنا للقوائم المالية عن '+esc(ctx.period||"السنة المالية")+'، نود إبلاغكم بالملاحظات التالية على الرقابة الداخلية والممارسات المحاسبية. لا تمثل هذه الملاحظات جميع أوجه القصور المحتملة، وإنما ما لفت انتباهنا أثناء المراجعة.</p>'+
    L.items.map((x,i)=>'<h3>'+(i+1)+'. '+esc(x.title)+' <small>(الأولوية: '+esc(x.priority)+')</small></h3><table><tr><th>الملاحظة</th><td>'+esc(x.observation||"—")+'</td></tr>'+(x.effect?'<tr><th>الأثر</th><td>'+esc(x.effect)+'</td></tr>':'')+'<tr><th>التوصية</th><td>'+esc(x.recommendation||"—")+'</td></tr><tr><th>رد الإدارة</th><td>'+(resp[x.title]?esc(resp[x.title]):'&nbsp;')+'</td></tr></table>').join("")+
    '<p>وتفضلوا بقبول فائق الاحترام،</p><p>'+esc(ctx.auditFirm||"[مكتب المراجعة]")+'<br>'+esc(ctx.auditPartner||"[الشريك المسؤول]")+'</p>';
}
function printLetter(c){
  if(c.sourceOnly)return printDoc(c,"committee");
  const w=window.open("","_blank");if(!w){toast("اسمح بالنوافذ المنبثقة للطباعة","warn");return}
  const title="خطاب الإدارة — "+(c.d.ctx.company||"");
  w.document.open();w.document.write('<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>'+esc(title)+'</title></head><body><h1>خطاب الإدارة</h1>'+letterHTML(c)+'</body></html>');w.document.close();
  SK.brandPrint(w,title);
  const s=w.document.createElement("style");s.textContent="table{width:100%;border-collapse:collapse;margin:6px 0 14px;font-size:12px}th,td{border:1px solid #dfe6ef;padding:6px 8px;text-align:right;vertical-align:top}th{background:#f3f6fa;width:110px}h3 small{font-weight:400;color:#667}";w.document.head.appendChild(s);
  SK.audit&&SK.audit.log("report",{act:"tbreview-letter"});
  setTimeout(()=>{try{w.focus();w.print()}catch{}},700);
}
function fsIssue(c,p,fs,d,f,hl,GROUP){
  return ''+
    programmeCard(c)+disclosuresCard(c)+
    (f?'<section class="card"><div class="card-h"><div><h3>'+esc(f.headline||"ملخص التقرير")+'</h3><p>التقرير النهائي من المراجع الذكي · '+esc(f.at.slice(0,10))+'</p></div></div><div class="card-b"><p>'+esc(f.summary)+'</p>'+(f.limitations.length?'<h4>القيود على النطاق</h4><ul>'+f.limitations.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ul>':'')+'</div></section>':'')+
    (AP()&&!(f&&f.kams.length)?AP().kamCard(c):'<section class="card"><div class="card-h"><div><h3>الأمور الرئيسية للمراجعة (ISA 701)</h3></div></div><div class="card-b">'+(kamsOf(c).map(k=>'<div class="tbr-kam"><b>'+esc(k.title)+'</b><p><small>لماذا:</small> '+esc(k.why)+'</p><p><small>كيف عولج:</small> '+esc(k.how)+'</p></div>').join("")||'<p class="empty">لا مخاطر جوهرية مصنفة.</p>')+'</div></section>')+
    letterCard(c)+
  '';
}
function fsAnalysis(c,p,fs,d,f,hl,GROUP){
  const fig=window.SKosifReportDocs?SKosifReportDocs.figures(fs,CUR,{width:560,taxLabel:c.fw==="EAS"?"ضريبة الدخل":"الزكاة"}):{};
  const card=(t,s2,b)=>b?'<section class="card"><div class="card-h"><div><h3>'+t+'</h3><p>'+s2+'</p></div></div><div class="card-b">'+b+'</div></section>':'';
  return ''+
    '<div class="tbr-2">'+card("من الإيرادات إلى صافي الربح","كل بند يحرّك الرصيد حتى صافي الربح — الأزرق زيادة والأحمر نقص.",fig.bridge)+card("السنة الحالية مقابل السابقة","البنود الرئيسية لقائمة الربح أو الخسارة.",fig.compare||fig.opex)+'</div>'+
    '<div class="tbr-2">'+card("الإيرادات حسب الفئة","حصة كل حساب إيراد.",fig.categories)+(fig.compare?card("المصروفات التشغيلية","مرتبة من الأكبر.",fig.opex):'')+'</div>'+
    '<section class="card"><div class="card-h"><div><h3>التحليل المالي</h3><p>النسب مع المقارنة، ومؤشرات Altman وBeneish وDuPont.</p></div></div><div class="card-b"><div class="tbr-an">'+
      (p.z?'<div><small>Altman Z″</small><b>'+p.z.z+'</b><span class="sksev '+(p.z.zone==="safe"?"ok":p.z.zone==="grey"?"warn":"bad")+'">'+esc(p.z.zoneAr)+'</span></div>':'')+
      (p.bm?'<div><small>Beneish M</small><b>'+p.bm.m+'</b><span class="sksev '+(p.bm.flagged?"bad":"ok")+'">'+(p.bm.flagged?'فوق الحد −1.78':'ضمن الحدود')+'</span></div>':'')+
      '<div><small>DuPont — العائد على حقوق الملكية</small><b>'+p.fmt(p.du.roe,"%")+'</b><span>'+p.fmt(p.du.netMargin,"%")+' × '+p.fmt(p.du.assetTurnover,"x")+' × '+p.fmt(p.du.equityMultiplier,"x")+'</span></div></div>'+
      '<table class="sk-table" data-sk-plain><thead><tr><th>المؤشر</th><th>الحالي</th>'+(p.hp?'<th>السابق</th>':'')+'<th>الصيغة</th></tr></thead><tbody>'+
      Object.entries(GROUP).map(([g,l])=>'<tr class="h"><td colspan="'+(p.hp?4:3)+'">'+l+'</td></tr>'+p.rs.filter(r=>r.group===g).map(r=>'<tr><td>'+esc(r.ar)+'</td><td class="num">'+p.fmt(r.current,r.unit)+'</td>'+(p.hp?'<td class="num">'+p.fmt(r.prior,r.unit)+'</td>':'')+'<td class="muted">'+esc(r.formula)+'</td></tr>').join("")).join("")+'</tbody></table></div></section>'+
    '<section class="card"><div class="card-h"><div><h3>تقرير الإدارة (MD&A)</h3><p>سرد مولّد من الأرقام فقط.</p></div></div><div class="card-b tbr-md">'+p.md.map(s=>'<h4>'+esc(s.title)+'</h4>'+s.body.map(x=>'<p>'+esc(x)+'</p>').join("")).join("")+'</div></section>'+
  '';
}
function fsStatements(c,p,fs,d,f,hl,GROUP){
  fs=taxDisplay(fs,c);
  return ''+
    '<h3 class="tbr-sec">السنة في لمحة</h3><div class="skk4 tbr-hl">'+hl+'</div>'+
    '<div class="tbr-2"><section class="card"><div class="card-h"><div><h3>قائمة الربح أو الخسارة</h3><p>'+(c.d.ctx.country==="INTL"?'عرض تحليلي من الميزان · إطار المصدر: '+esc(c.d.ctx.reportingFramework||"غير محدد")+' — لا يمثل إثبات امتثال أو تقريراً كاملاً وفق إطار المصدر':'عرض IFRS 18: التشغيل ← الاستثمار ← التمويل ← الزكاة')+'</p></div></div><div class="card-b">'+stmt(fs.pl,p.hp)+'</div></section>'+
      '<section class="card"><div class="card-h"><div><h3>قائمة المركز المالي</h3><p>'+(fs.checks.balanced?'متوازنة':'فرق '+sar(fs.checks.difference))+'</p></div></div><div class="card-b">'+stmt(fs.sfp,p.hp)+'</div></section></div>'+
    '<section class="card"><div class="card-h"><div><h3>قائمة التغيرات في حقوق الملكية</h3></div></div><div class="card-b tbr-tw"><table class="sk-table tbr-fs" data-sk-plain><thead><tr><th></th>'+fs.soce.columns.map(x=>'<th>'+esc(x)+'</th>').join("")+'</tr></thead><tbody>'+fs.soce.rows.map((r,i)=>'<tr class="'+(i===fs.soce.rows.length-1?'total':'')+'"><td>'+esc(r.ar)+'</td>'+r.values.map(v=>'<td class="num">'+m0(v)+'</td>').join("")+'</tr>').join("")+'</tbody></table></div></section>'+
    '<section class="card"><div class="card-h"><div><h3>قائمة التدفقات النقدية (الطريقة غير المباشرة)</h3><p>'+(fs.cf?(fs.checks.cashTies?'تطابق حركة النقد':'فرق '+sar(fs.checks.cfDifference)):'تتطلب أرصدة السنة السابقة')+'</p></div></div><div class="card-b">'+(fs.cf?stmt(fs.cf,false):'<p class="empty">أضف عمود السنة السابقة في الميزان لاشتقاق القائمة.</p>')+'</div></section>'+
    '<section class="card"><div class="card-h"><div><h3>الإيضاحات</h3><p>إيضاح لكل بند بالحسابات التي كوّنته.</p></div></div><div class="card-b tbr-notes">'+fs.notes.map(n=>{const l=n.lineKey&&fs.lines.find(x=>x.key===n.lineKey);
      return '<details><summary><span class="mono">'+n.no+'</span> '+esc(n.ar)+(l?' — '+sar(l.current):'')+'</summary>'+(l?'<table class="sk-table" data-sk-plain><tbody>'+l.accounts.map(a=>'<tr><td class="mono">'+esc(a.code)+'</td><td>'+esc(a.name)+'</td><td class="num">'+m0(a.current)+'</td>'+(fs.hasPrior?'<td class="num">'+(a.prior===null?'':m0(a.prior))+'</td>':'')+'</tr>').join("")+'</tbody></table><p class="hint">المعايير: '+esc(l.standards.join("، "))+'</p>':'<p class="hint">'+esc(policyNote(n.no,c))+'</p>')+'</details>'}).join("")+'</div></section>';

}

function policyNote(no,c){
  const ctx=c.d.ctx;
  if(c.sourceOnly)return no===1?(c.sourceModel?c.sourceModel.entities:"هوية المصدر غير متاحة"):no===2?(c.sourceModel?c.sourceModel.accountingBasis+" · "+c.sourceModel.currency+" "+c.sourceModel.unit:"أساس المصدر غير متاح"):"تفاصيل السياسة أو الإيضاح غير متاحة في هذا النموذج؛ تُراجع في التقرير الأصلي. لا يمثل ذلك تأكيداً أو رأياً مهنياً.";
  if(ctx.country==="INTL"&&no===2)return "إطار المصدر: "+(ctx.reportingFramework||"غير محدد")+" · "+(ctx.countryAr||ctx.issuerCountry||"دولي")+" · "+(ctx.curSym||ctx.currency||"غير محددة")+". عرض تحليلي مشتق من نموذج الميزان؛ لا يمثل تقريراً كاملاً وفق إطار المصدر أو إثبات امتثال. تُراجع السياسات في التقرير الأصلي.";
  return no===1?(ctx.company||"المنشأة")+(ctx.activity?' — '+ctx.activity:'')+'. '+(ctx.period||''):
    no===2&&egypt(c.d)?'أُعدت القوائم وفق معايير المحاسبة المصرية الصادرة بقرارات وزير الاستثمار وتعديلاتها وفي ضوء القوانين واللوائح المصرية السارية، على أساس التكلفة التاريخية ما لم يُذكر خلاف ذلك، وبالجنيه المصري.':
    no===2?'أُعدت القوائم وفق '+(ctx.framework==="SME"?'المعيار الدولي للتقرير المالي للمنشآت الصغيرة ومتوسطة الحجم':'المعايير الدولية للتقرير المالي')+' المعتمدة في المملكة العربية السعودية والمعايير والإصدارات الأخرى المعتمدة من SOCPA، على أساس التكلفة التاريخية ما لم يُذكر خلاف ذلك، وبالريال السعودي.':
    no===3&&egypt(c.d)?'الإيراد عند انتقال السيطرة (معيار 48)؛ المخزون بالتكلفة أو صافي القيمة البيعية (معيار 2)؛ الأصول الثابتة بالتكلفة ناقصاً الإهلاك (معيار 10)؛ عقود التأجير (معيار 49)؛ ضريبة الدخل الجارية والمؤجلة (معيار 24)؛ الأدوات المالية وخسائر الائتمان المتوقعة (معيار 47).':
    no===3?'الإيراد عند انتقال السيطرة (IFRS 15)؛ المخزون بالتكلفة أو صافي القيمة القابلة للتحقق (IAS 2)؛ الممتلكات بالتكلفة ناقصاً الاستهلاك (IAS 16)؛ الإيجارات (IFRS 16)؛ مكافأة نهاية الخدمة (IAS 19)؛ الزكاة وفق لائحة 1445هـ؛ الأدوات المالية بالتكلفة المطفأة مع خسائر ائتمانية متوقعة (IFRS 9).':
    'التقديرات الهامة: الخسائر الائتمانية المتوقعة، صافي القيمة القابلة للتحقق للمخزون، الأعمار الإنتاجية، مخصص الزكاة، التزام نهاية الخدمة.';
}

/* ---------- print & export ---------- */
function printReport(c){
  if(c.sourceOnly)return printDoc(c,"annual");
  const w=window.open("","_blank");if(!w){toast("اسمح بالنوافذ المنبثقة لطباعة التقرير","warn");return}
  const p=reportParts(c),fs=p.fs,d=c.derived,ctx=c.d.ctx,f=c.session&&c.session.final;
  const tbl=(rows,hp)=>'<table><tr><th></th><th>إيضاح</th><th>'+(hp?'الحالية':'المبلغ')+'</th>'+(hp?'<th>السابقة</th>':'')+'</tr>'+rows.map(r=>r.level==="heading"?'<tr><td colspan="4"><b>'+esc(r.ar)+'</b></td></tr>':'<tr'+(r.level!=="line"?' style="font-weight:700"':'')+'><td>'+esc(r.ar)+'</td><td>'+(r.note||'')+'</td><td>'+m0(r.current)+'</td>'+(hp?'<td>'+(r.prior===null?'':m0(r.prior))+'</td>':'')+'</tr>').join("")+'</table>';
  let b='<h1>تقرير مراجعة ميزان المراجعة</h1><p><b>'+esc(ctx.company||"")+'</b> — '+esc(ctx.period||"")+' — '+esc(ctx.corpusId?(ctx.reportingFramework||'IFRS'):FW_LABEL[c.fw])+'</p>'+
    '<h2>الرأي المشتق ('+esc(d.isa)+')</h2><p><b>'+esc(d.ar)+'</b></p>'+d.basis.map(x=>'<p>'+esc(x)+'</p>').join("")+(f?'<p>اقتراح المراجع الذكي: '+esc(f.aiOpinion)+'</p><p>'+esc(f.summary)+'</p>':'')+
    '<h2>برنامج المراجعة</h2><table><tr><th>المرحلة</th><th>الحالة</th><th>التفاصيل</th></tr>'+c.programme.map(x=>'<tr><td>'+esc(x.id+' '+x.title)+'</td><td>'+esc(x.status)+'</td><td>'+esc(x.detail)+'</td></tr>').join("")+'</table>'+
    '<p>جاهزية الإفصاحات: '+(c.disclosures.valid?'جاهزة للمراجعة البشرية':'غير مكتملة — '+c.disclosures.checks.filter(k=>k.status==="fail").map(k=>esc(k.label)).join("، "))+'</p>'+
    '<h2>الأمور الرئيسية للمراجعة</h2>'+kamsOf(c).map(k=>'<p><b>'+esc(k.title)+'</b> — '+esc(k.why)+' '+esc(k.how)+(k.observation?' النتيجة: '+esc(k.observation):'')+'</p>').join("")+
    '<h2>القوائم المالية '+(fsAfter?'بعد التسويات المعتمدة':'قبل التسويات')+'</h2><h3>الربح أو الخسارة</h3>'+tbl(fs.pl,p.hp)+'<h3>المركز المالي</h3>'+tbl(fs.sfp,p.hp)+(fs.cf?'<h3>التدفقات النقدية</h3>'+tbl(fs.cf,false):'')+
    '<h2>قيود التسوية</h2>'+(c.pool.length?c.pool.map(a=>'<p><b>'+esc(a.id)+' '+esc(a.title)+'</b> ('+esc(a.standard)+') — '+(c.d.accepted.includes(a.id)?'معتمد':c.d.rejected.includes(a.id)?'مرفوض':'مقترح')+'</p><table><tr><th>الحساب</th><th>مدين</th><th>دائن</th></tr>'+a.lines.map(l=>'<tr><td>'+esc(l.code+' '+l.name)+'</td><td>'+(l.debit?m0(l.debit):'')+'</td><td>'+(l.credit?m0(l.credit):'')+'</td></tr>').join("")+'</table>').join(""):'<p>لا قيود.</p>')+
    '<h2>مناقشة الامتثال للمعايير</h2><table><tr><th>المعيار</th><th>الحكم</th><th>المناقشة</th></tr>'+c.all.compliance.map(x=>'<tr><td>'+esc(x.code+' '+x.title)+'</td><td>'+esc(x.status)+'</td><td>'+esc(x.discussion)+'</td></tr>').join("")+'</table>'+
    '<h2>الملاحظات</h2><table><tr><th>الأثر</th><th>الملاحظة</th><th>المعيار</th><th>الأساس</th><th>الإجراء</th></tr>'+c.all.findings.map(x=>'<tr><td>'+SEV_AR[x.severity]+'</td><td>'+esc(x.title+(x.account?' — '+x.account:''))+'</td><td>'+esc(x.standard)+'</td><td>'+esc(x.basis)+'</td><td>'+esc(x.action)+'</td></tr>').join("")+'</table>'+
    '<h2>تقرير الإدارة</h2>'+p.md.map(s=>'<h3>'+esc(s.title)+'</h3>'+s.body.map(x=>'<p>'+esc(x)+'</p>').join("")).join("")+
    (letterItems(c).items.length?'<h2>خطاب الإدارة</h2>'+letterHTML(c):'')+
    '<p style="margin-top:24px;font-size:11px;color:#667">الرأي مسودة مشتقة آلياً وفق ISA 705 ولا يصدر إلا باعتماد الشريك المسؤول. الأرقام محسوبة من ميزان المراجعة بالهللة؛ ملاحظات المراجع الذكي حكم مساعد يُراجع مهنياً.</p>';
  w.document.open();w.document.write('<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>تقرير مراجعة ميزان المراجعة</title></head><body>'+b+'</body></html>');w.document.close();
  SK.brandPrint(w,"تقرير مراجعة ميزان المراجعة");
  const s=w.document.createElement("style");s.textContent="table{width:100%;border-collapse:collapse;margin:6px 0 14px;font-size:11.5px}th,td{border:1px solid #dfe6ef;padding:4px 7px;text-align:right}th{background:#f3f6fa}td:nth-child(n+3){direction:ltr;text-align:left}h2{margin-top:18px}";w.document.head.appendChild(s);
  SK.audit&&SK.audit.log("report",{act:"tbreview-print"});
  setTimeout(()=>{try{w.focus();w.print()}catch{}},700);
}
/* the formal request letter to the client (PBC): what the auditor asks for, grouped by stage as the auditors of the
   global reports ask it — first the planning documents, then the balances, then the judgemental areas, then completion —
   each with its purpose, the standard, who provides it, the date it is due and the alternative if it cannot be had */
function printPbcLetter(c){
  if(c.sourceOnly)return printDoc(c,"committee");
  const ctx=c.d.ctx,reqs=c.base.requests,end=ctx.periodEnd||"",due=n=>{if(!/^\d{4}-\d{2}-\d{2}/.test(end))return"";const x=new Date(end.slice(0,10)+"T00:00:00Z");x.setUTCDate(x.getUTCDate()+n);return x.toISOString().slice(0,10)};
  const D={"عالية":due(15),"متوسطة":due(30),"منخفضة":due(45)},ST=[["planning","أولاً: التخطيط وفهم المنشأة"],["area","ثانياً: أرصدة القوائم المالية"],["kam","ثالثاً: المناطق الحكمية (الأمور الرئيسية للمراجعة)"],["completion","رابعاً: الإقفال وإصدار التقرير"]];
  let pr={};try{pr=JSON.parse(localStorage.getItem("skosif_profile_v1")||"{}")||{}}catch{}
  const firm=pr.firm||"فريق المراجعة",mat=c.base.materiality;let n=0;
  const rows=st=>reqs.filter(q=>(q.stage||"area")===st).map(q=>'<tr><td>'+(++n)+'</td><td><b>'+esc(q.title)+'</b>'+(q.purpose?'<br><small>'+esc(q.purpose)+'</small>':'')+'</td><td>'+esc(q.evidenceAr||"")+(q.reliability?'<br><small>'+"●".repeat(q.reliability)+"○".repeat(3-q.reliability)+'</small>':'')+'</td><td>'+esc(q.from||"الإدارة المالية")+'</td><td>'+esc(q.standard||"")+'</td><td>'+esc(q.priority)+'<br><small>'+esc(D[q.priority]||"")+'</small></td><td><small>'+esc(q.alt||"")+'</small></td></tr>').join("");
  const w=window.open("","_blank");if(!w){toast("اسمح بالنوافذ المنبثقة للطباعة","warn");return}
  const body='<p style="text-align:left">التاريخ: '+esc(new Date().toISOString().slice(0,10))+'</p><p>السادة/ إدارة <b>'+esc(ctx.company||"المنشأة")+'</b> المحترمين،</p><p>الموضوع: <b>طلب المستندات اللازمة لمراجعة القوائم المالية '+esc(ctx.period||"")+'</b></p>'+
    '<p>السلام عليكم ورحمة الله وبركاته، وبعد: تنفيذاً لخطاب التكليف، نرجو التكرم بتزويدنا بالمستندات التالية في المواعيد المبينة. رُتّبت الطلبات بحسب مراحل المراجعة كما تطلبها مكاتب المراجعة في التقارير العالمية، وحُدد لكل طلب الغرض منه والمعيار ومن يقدمه والبديل إن تعذر توفيره.'+
    (mat?' الأهمية النسبية المخططة: '+esc(sar(mat.overall))+' على أساس '+esc(mat.benchmarkAr)+'.':'')+'</p>'+
    ST.map(([k,l])=>{const r=rows(k);return r?'<h2>'+esc(l)+'</h2><table><tr><th>#</th><th>المستند والغرض</th><th>نوع الدليل وموثوقيته</th><th>يقدمه</th><th>المعيار</th><th>الأولوية والموعد</th><th>البديل إن تعذر</th></tr>'+r+'</table>':""}).join("")+
    '<h2>ملاحظات</h2><ul><li>تُرسل المصادقات الخارجية (البنوك، العملاء، الموردون، المستشار القانوني) من الجهة مباشرة إلى المراجع (ISA 505).</li><li>المستند الذي يتعذر توفيره يُبلَّغ به كتابياً؛ يُطبق الإجراء البديل، وإن لم يكفِ يُقيَّم أثره على الرأي (ISA 705).</li><li>قد نطلب مستندات إضافية بعد فحص ما يرد، وفق نتائج الجولات.</li></ul>'+
    '<p>وتفضلوا بقبول فائق الاحترام،</p><p><b>'+esc(firm)+'</b>'+(pr.license?' — ترخيص رقم '+esc(pr.license):'')+(pr.name?'<br>'+esc(pr.name)+(pr.title?' — '+esc(pr.title):''):'')+'</p>';
  w.document.open();w.document.write('<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>خطاب طلب المستندات — '+esc(ctx.company||"")+'</title></head><body><h1>خطاب طلب المستندات</h1>'+body+'</body></html>');w.document.close();
  SK.brandPrint(w,"خطاب طلب المستندات");
  const st=w.document.createElement("style");st.textContent="table{width:100%;border-collapse:collapse;margin:6px 0 14px;font-size:11px}th,td{border:1px solid #dfe6ef;padding:5px 7px;text-align:right;vertical-align:top}th{background:#f3f6fa}small{color:#667}h2{margin-top:16px;font-size:14px}";w.document.head.appendChild(st);
  SK.audit&&SK.audit.log("report",{act:"pbc-letter",n:reqs.length});
}
function printDoc(c,kind){
  const w=window.open("","_blank");if(!w){toast("اسمح بالنوافذ المنبثقة للطباعة","warn");return}
  const sourceKind=c.sourceOnly&&!["annual","release","notes","auditor","committee","icfr","peers"].includes(kind)?"annual":kind;
  const fw=!c.sourceOnly&&FW()&&FW().docs[kind],render=c.sourceOnly?SKosifReportDocs[sourceKind]:fw?fw[0]:kind==="integrated"&&window.SKosifIntegrated?SKosifIntegrated.render:SKosifReportDocs[kind];
  const title=(fw?fw[1]:{integrated:"التقرير السنوي المتكامل",annual:"التقرير السنوي",release:"بيان النتائج",auditor:"تقرير المراجع المستقل",notes:"الإيضاحات المتممة",committee:"تقرير لجنة المراجعة",icfr:"تقرير الرقابة الداخلية",peers:"المقارنة بالنظراء العالميين"}[kind]||"مستند")+" — "+(c.d.ctx.company||"");
  w.document.open();w.document.write('<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>'+esc(title)+'</title></head><body>'+render(docX(c))+'</body></html>');w.document.close();
  if(!c.sourceOnly)SK.brandPrint(w,title);
  const st=w.document.createElement("style");st.textContent=(window.SK&&SK.brandCSS?SK.brandCSS:String)(SKosifReportDocs.CSS+(window.SKosifIntegrated?SKosifIntegrated.CSS:""))+"body{background:#fff}";w.document.head.appendChild(st);
  SK.audit&&SK.audit.log("report",{act:"tbreview-"+kind});
  setTimeout(()=>{try{w.focus();w.print()}catch{}},700);
}
// The visible value preserves source notation; any normalized arithmetic carrier is technical only.
function sourceCellCsv(cell){
  const sourceStatus=cell.status==="unavailable"?"unavailable":/^[—–-]$/.test(cell.display||"")?"reported_dash":cell.status==="blank"?"blank":"reported_number";
  const value=sourceStatus==="unavailable"?"unavailable":sourceStatus==="blank"?"":cell.display!==undefined?cell.display:cell.value;
  return {value,normalizedValue:cell.value===null?"":cell.value,valueRole:sourceStatus==="reported_dash"&&cell.value!==null?"rendering_only_carrier":cell.value===null?"no_numeric_value":"normalized_model_value",sourceStatus,sourceValue:sourceStatus==="reported_number"?cell.value:"",sourceDisplay:value};
}
function sourceCsv(c){
  const x=docX(c),s=x.sourceModel;if(!x.sourceVerified||!s)return null;
  if(s.replay){
    if(x.fs.replay?.status!=="available")return null;
    const headers=["issuer","accounting_basis","currency","scope","source_sha256","origin","statement","line","column","period_kind","period_start","period_end","unit","value","cell_status","source_page","source_fact_id","source_format","source_model_id","normalized_value","value_role","source_status","source_value","source_display"];
    const rows=x.fs.replay.tables.flatMap(t=>t.rows.flatMap(r=>t.columns.map(col=>{const cell=r.cells[col.id],p=cell.period||col.period,f=sourceCellCsv(cell);return [s.issuer,s.accountingBasis,s.currency,s.scope,s.sourceSha256,"published-statement-replay; not ledger or assurance",t.title,r.label,col.label,p.kind,p.start||"",p.end,col.unit||r.unit,f.value,cell.status,r.sourcePage,cell.sourceFactId||"","SQC_PUBLISHED_REPORT_V1",s.id,f.normalizedValue,f.valueRole,f.sourceStatus,f.sourceValue,f.sourceDisplay];})));
    return {filename:s.issuer+"-source-statements-"+s.periodEnd+".csv",headers,rows};
  }
  const rows=[...x.fs.pl.map(r=>["income",r]),...x.fs.sfp.map(r=>["position",r])].filter(([,r])=>r.level!=="heading");
  const identity=[s.issuer,s.accountingBasis,s.currency,s.unit,s.scope,s.periodEnd,s.priorPeriodEnd,s.sourceSha256,"source-only; not ledger or audit evidence"];
  return {filename:s.issuer+"-source-statements-"+s.periodEnd+".csv",headers:["issuer","accounting_basis","currency","unit","scope","current_period_end","prior_period_end","source_sha256","origin","statement","line","current","prior","status","source_format","source_model_id"],
    rows:[...rows.map(([st,r])=>[...identity,st,r.en,(r.current/100).toFixed(2),r.prior===null?"":(r.prior/100).toFixed(2),"source-model","SQC_PUBLISHED_REPORT_V1",s.id]),[...identity,"cash_flow","Source cash-flow statement has not been imported","","","unavailable; cash-tie not-tested","SQC_PUBLISHED_REPORT_V1",s.id]]};
}
const csvName=(c,x)=>(c.d.ctx.company||"مراجعة")+"-"+x+"-"+new Date().toISOString().slice(0,10)+".csv";

/* ---------- actions ---------- */
async function loadFile(file){
  if(file.size>10*1024*1024){toast("ملف الميزان أكبر من 10 ميجابايت","bad");return}
  try{
    const text=/\.xlsx$/i.test(file.name)?await SKXlsx.toTsv(file):await readAs(file,"text");
    const ta=root.querySelector("[data-tbtext]");if(ta)ta.value=text;
    const tb=TI().parseTrialBalance(text);
    toast(tb.ok?"قُرئ "+tb.rows.length+" حساباً"+(tb.balanced?" — الميزان متوازن":" — الميزان غير متوازن"):"لم أتعرف على أعمدة الميزان",tb.ok?"ok":"bad");
  }catch(e){toast(e.message,"bad")}
}
/* the companies of the global reports, grouped by sector, for the engagement picker */
function corpusPicker(){
  const CC=E().reports.corpusCompanies;if(!CC||!CC.auditModelCatalog)return"";
  const list=CC.auditModelCatalog(),by={};list.forEach(c=>{(by[c.modelStatusAr]=by[c.modelStatusAr]||[]).push(c)});
  return '<span class="tbr-corpus"><select data-corpus aria-label="نموذج تقرير منشور في المراجعة"><option value="">اختر نموذج مصدر بحسب حالة دعمه…</option>'+
    Object.entries(by).map(([status,models])=>'<optgroup label="'+esc(status)+'">'+models.map(c=>'<option value="'+esc(c.id)+'"'+(c.auditFile?'':' disabled')+'>'+esc(c.company+' — '+c.fy+' · نموذج التطبيق: '+c.modelStatusAr+' · حالة المصدر: '+(c.reference?.review_label_ar||'حالة مراجعة المصدر غير متاحة'))+'</option>').join('')+'</optgroup>').join('')+
    '</select><button type="button" class="btn" data-a="corpus" title="افتح البيانات المدعومة كمراجع مصدر؛ ليست قيوداً أو رأياً مهنياً">فتح نموذج المصدر</button></span>';
}
function readCtx(d){root.querySelectorAll("[data-ctx]").forEach(i=>{d.ctx[i.dataset.ctx]=i.value.trim()});if(d.ctx.country==="INTL"){d.ctx.framework="IFRS";return d}d.ctx.framework=d.ctx.country==="EG"?"EAS":CX().frameworkApplicability(d.fw||{}).framework;d.ctx.currency=d.ctx.country==="EG"?"الجنيه المصري":"الريال السعودي";return d}
async function upload(reqId,files){
  let d=st(),s=session(d);const pend=AI().pendingUploads(s).reduce((a,u)=>a+u.size,0);let added=0,total=pend;
  for(const f of files){
    if(f.size>MAX_FILE){toast("«"+f.name+"» أكبر من 15 ميجابايت — قسّمه أو اضغطه","bad");continue}
    if(total+f.size>MAX_ROUND){toast("تجاوزت 18 ميجابايت للجولة الواحدة — أرسل الجولة ثم ارفع الباقي","warn");break}
    try{
      const text=isText(f)?await readAs(f,"text"):null,data=text===null?String(await readAs(f,"url")).split(",")[1]:null,mime=isText(f)?"text/plain":mimeOf(f);
      if(s.uploads.some(u=>u.requestId===reqId&&u.fileName===f.name&&u.round===s.rounds.length+1))continue;
      await docPut(docKey(s.id,{requestId:reqId,fileName:f.name}),{data,text});
      s=AI().addUpload(s,{requestId:reqId,fileName:f.name,mimeType:mime,size:f.size});added++;total+=f.size;
    }catch(e){toast(e.message,"bad")}
  }
  d.session=s;put(d);if(added)toast("رُفع "+added+" مستند — أرسله في الجولة "+(s.rounds.length+1),"ok");paint();
}
async function runRound(){
  const c=compute();if(!c||busy)return;
  if(c.sourceOnly){toast("نموذج المصدر لا يصدر تكليفاً أو رأي تأكيد. راجع مرجع المصدر أو المحاكاة فقط.","warn");return}
  if(!c.tb.ok){toast("الميزان غير صالح","bad");return}
  let d=st(),s=session(d);
  const pend=AI().pendingUploads(s),withData={...s,uploads:await Promise.all(s.uploads.map(async u=>{if(u.round!==s.rounds.length+1)return u;const x=await docGet(docKey(s.id,u)).catch(()=>null);return x?{...u,data:x.data||undefined,text:x.text||undefined}:u}))};
  if(pend.length&&withData.uploads.filter(u=>u.round===s.rounds.length+1&&!u.data&&!u.text).length){toast("بعض المستندات المرفوعة لم تعد متاحة على هذا الجهاز — ارفعها مجدداً","warn")}
  busy="round";abort=new AbortController();paint();
  try{
    const model=SKosifAI.conf().model,api=await SKosifAI.generate(AI().buildRoundBody(withData,c.tb,c.base),{signal:abort.signal,timeout:300000});
    const ex=AI().extractText(api);if(ex.blocked)throw new Error("رفض النموذج الرد لأسباب تتعلق بسياسة المحتوى.");
    const raw=AI().parseJsonLoose(ex.text);if(!raw)throw new Error("رد النموذج لم يكن بالصيغة المتوقعة"+(ex.finishReason?" ("+ex.finishReason+")":"")+" — أعد المحاولة.");
    d=st();s=session(d);s.model=model;
    const r=AI().normalizeRound(raw,s,c.tb,model);
    d.session=AI().addRound(s,r);put(d);
    if(CU())await CU().afterRound({govern:false}).catch(()=>null);
    SK.audit&&SK.audit.log("tbreview",{act:"round",no:r.no,status:r.status,findings:r.findings.length,requests:r.requests.length});
    toast(r.status==="complete"?"أنهى المراجع الذكي طلباته — أصدر التقرير النهائي":"انتهت الجولة "+r.no+": "+r.requests.filter(q=>q.round===r.no).length+" طلب جديد","ok");
  }catch(e){toast(e.message,"bad")}
  finally{busy="";abort=null;paint()}
}
/* ---------- the integrated report written by the AI reviewer, and the whole engagement in one run ---------- */
function narrBar(c){
  const x=docX(c),ready=window.SKosifAI&&SKosifAI.ready(),cf=ready?SKosifAI.conf():null,q=x.q,ai=x.narr&&Object.values(x.narr.source||{}).some(v=>v==="ai");
  const G=E().reports.globalCorpus,sum=G?G.summary():null;
  return '<section class="card sqc-nb"><div class="card-b"><div class="sqc-nb-h"><div><span class="eyebrow">التقرير السنوي المتكامل — إحصاءات بنية تاريخية من '+(sum?sum.sectionStatisticsReports:49)+' تقريراً عالمياً</span>'+
    '<h3>'+(ai?'صاغه '+esc(x.narr.model||"الذكاء الاصطناعي"):'مسودة محرك SQC')+'</h3><p>يتضمن فهرس الحزمة '+(sum?sum.reports:50)+' تقريراً ('+(sum?sum.pages.toLocaleString("en-US"):"12,506")+' صفحة). فحص حدود التقارير لا يعني مراجعتها كاملة أو قبول نماذجها؛ إحصاءات البنية التاريخية تحتاج مراجعة مستقلة. '+
    (ready?'يكتب '+esc(cf.label)+' السرد كاملاً بأرقام المنشأة فقط، ثم يُطابَق كل رقم ويُقاس التقرير بالحزمة.':'أضف مفتاح Gemini أو OpenAI أو Claude في «جولات المراجعة» ليكتب الذكاء الاصطناعي السرد؛ المسودة الحالية من المحرك وأرقامها من القوائم.')+'</p>'+
    (x.narrStale?'<p class="tbr-warn">تغيرت الأرقام بعد آخر صياغة — عُرضت مسودة المحرك؛ أعد الصياغة.</p>':'')+
    (x.narr&&x.narr.unverified&&x.narr.unverified.length?'<p class="tbr-warn">'+x.narr.unverified.reduce((a,u)=>a+u.numbers.length,0)+' رقماً في السرد لا يطابق أرقام المنشأة — مذكورة في الملحق.</p>':'')+'</div>'+
    '<div class="sqc-nb-s"><b>'+(q?q.score:0)+'%</b><small>مطابقة للتقارير العالمية</small></div></div>'+
    '<div class="sk-actions">'+(ready?'<button type="button" class="btn primary" data-a="narr-ai"'+(busy?' disabled':'')+'>'+(busy==="narr"?'يكتب '+esc(cf.label)+' التقرير…':'✦ صياغة التقرير بالذكاء الاصطناعي')+'</button>'+
      '<button type="button" class="btn" data-a="full-audit"'+(busy?' disabled':'')+'>'+(busy==="full"?esc(fullStep||"المراجعة الكاملة جارية…"):'المراجعة الكاملة: جولة ← تقرير نهائي ← التقرير المتكامل')+'</button>':'')+
    (busy==="narr"||busy==="full"?'<button type="button" class="btn danger" data-a="cancel">إيقاف</button>':'')+
    (c.d.narrative?'<button type="button" class="btn" data-a="narr-reset">العودة لمسودة المحرك</button>':'')+
    '<button type="button" class="btn" data-a="print">'+SK.icon("reports")+' معاينة وطباعة</button></div></div></section>';
}
async function runNarrative(){
  const c=compute();if(!c||busy)return false;const x=docX(c);if(!x.pack)return false;
  const NR=E().reports.narrative;busy="narr";abort=new AbortController();paint();
  try{
    const api=await SKosifAI.generate(NR.buildNarrativeBody(x.pack),{signal:abort.signal,timeout:420000});
    const ex=AI().extractText(api);if(ex.blocked)throw new Error("رفض النموذج الرد لأسباب تتعلق بسياسة المحتوى.");
    const raw=AI().parseJsonLoose(ex.text);if(!raw)throw new Error("رد النموذج لم يكن بالصيغة المتوقعة"+(ex.finishReason?" ("+ex.finishReason+")":"")+" — أعد المحاولة.");
    const cf=SKosifAI.conf(),r=NR.normalizeNarrative(raw,x.pack,{model:cf.label+" · "+cf.model,at:new Date().toISOString()});
    const d=st();d.narrative={sig:narrSig(x.pack),result:r};put(d);tab="fs";doc="integrated";
    const q=NR.quality(r,x.pack),bad=r.unverified.reduce((a,u)=>a+u.numbers.length,0);
    SK.audit&&SK.audit.log("tbreview",{act:"narrative",provider:cf.provider,model:cf.model,score:q.score,unverified:bad});
    toast("اكتمل التقرير المتكامل: مطابقة "+q.score+"%"+(bad?" — "+bad+" رقم يحتاج مراجعة":""),bad?"warn":"ok");return true;
  }catch(e){toast(e.message,"bad");return false}
  finally{busy="";abort=null;paint()}
}
let fullStep="";
/* one run: a review round (or the council) when none was held, the final report, then the integrated report.
   Documents the reviewer requests stay open and are reported as limitations; the opinion stays the engine's. */
async function runFull(){
  if(busy)return;const c0=compute();if(!c0)return;
  if(c0.sourceOnly){toast("استخدم مرجع المصدر أو المحاكاة فقط؛ لا يوجد تكليف مراجعة لهذا النموذج.","warn");return}
  const step=async(label,fn,ok)=>{fullStep=label;paint();await fn();if(!ok())throw new Error("توقفت المراجعة الكاملة عند: "+label)};
  try{
    const rounds=()=>(st().session&&st().session.rounds.length)||0,r0=rounds();
    if(!r0)await step("الجولة الأولى: مراجعة الميزان والمعايير",()=>CU()&&(Number(st().councilSize)||1)>1?CU().run():runRound(),()=>rounds()>r0);
    await step("إصدار التقرير النهائي والقيود وخطاب الإدارة",runFinal,()=>!!(st().session&&st().session.final));
    await step("صياغة التقرير السنوي المتكامل",runNarrative,()=>!!st().narrative);
    SK.audit&&SK.audit.log("tbreview",{act:"full-audit"});
  }catch(e){toast(e.message,"warn")}
  finally{fullStep="";tab="fs";doc="integrated";paint()}
}
/* a demonstration engagement without an AI key: three council rounds written by the engine, the client's documents
   generated from the trial balance, the proposed entries accepted, and the final report — the whole cycle in one run */
async function runDemo(){
  if(compute()?.sourceReplay){tab="fs";paint();return;}
  if(busy)return;let c=compute();if(!c||!c.tb.ok){toast("حمّل الميزان أولاً","warn");return}
  let d=st();if(d.session&&d.session.rounds&&d.session.rounds.length&&!await SK.confirm("في الملف جولات سابقة — استبدالها بمراجعة تجريبية كاملة؟",{danger:true,ok:"استبدال"}))return;
  const DE=E().audit.demoEngagement,MODEL="محاكاة SQC (دون مفتاح)",pause=ms=>new Promise(r=>setTimeout(r,ms));
  const ctx={company:d.ctx.company||"المنشأة",periodEnd:d.ctx.periodEnd||"",currency:CUR,auditFirm:d.ctx.auditFirm||""};
  const up=async(s,list)=>{for(const x of list){await docPut(docKey(s.id,x),{text:x.text});s=AI().addUpload(s,{requestId:x.requestId,fileName:x.fileName,mimeType:"text/plain",size:x.text.length,origin:x.origin||"simulation"})}return s};
  const save1=async s=>{const dd=st();dd.session=s;put(dd);if(CU())await CU().afterRound({govern:false}).catch(()=>null)};
  busy="demo";
  try{
    await docClear();d=st();d.session=null;d.accepted=[];d.rejected=[];put(d);c=compute();
    let s=session(st());
    fullStep="الجولة ١: المجلس يقرأ الميزان ويطلب المستندات";paint();await pause(450);
    const r1=AI().normalizeRound(DE.round1(c.base,ctx),s,c.tb,MODEL);s=AI().addRound(s,r1);await save1(s);
    fullStep="الإدارة ترفع "+r1.requests.length+" مستنداً";paint();await pause(450);
    const docs=DE.documents(c.base,r1.requests,ctx,1);s=await up(s,docs);await save1(s);
    fullStep="الجولة ٢: المجلس يراجع المستندات";paint();await pause(450);
    c=compute();const r2=AI().normalizeRound(DE.round2(c.base,r1.requests,docs,ctx),s,c.tb,MODEL);s=AI().addRound(s,r2);await save1(s);
    const follow=r2.requests.find(q=>q.round===2);let n=docs.length;
    if(follow){fullStep="الإدارة تستكمل المستند غير الكافي";paint();await pause(450);
      const weak=r1.requests.find(q=>r2.reviewed.some(v=>v.requestId===q.id&&v.verdict!=="مقبول"));
      const fu=DE.followUpDocuments(c.base,weak,follow,ctx);s=await up(s,fu);n+=fu.length;await save1(s);
      fullStep="الجولة ٣: الاكتفاء بالأدلة";paint();await pause(450);
      c=compute();const r3=AI().normalizeRound(DE.round3(c.base,fu,ctx),s,c.tb,MODEL);s=AI().addRound(s,r3);await save1(s)}
    fullStep="قيود التسوية";paint();
    c=compute();d=st();d.accepted=c.pool.filter(a=>!d.rejected.includes(a.id)).map(a=>a.id);put(d);
    fullStep="التقرير النهائي";paint();await pause(350);
    c=compute();d=st();
    const KMx=E().audit.kam,GBx=E().audit.globalBenchmarks,sector=d.ctx.sector||(GBx?GBx.sectorFromActivity(d.ctx.activity||""):"");
    const kams=KMx?KMx.suggestKams({fs:c.fsAfterAdj,risks:c.base.risks,materiality:c.base.materiality.overall,currency:CUR,periodEnd:d.ctx.periodEnd,sector,exclude:d.ctx.corpusId||d.bundleId||undefined}).map(k=>({title:k.title,why:k.description,how:k.how})):[];
    const f=AI().normalizeFinal(DE.final(c.base,c.derived,kams,ctx),s,c.tb);
    d=st();d.session={...s,final:f};d.demoRun={at:new Date().toISOString(),docs:n};put(d);
    SK.audit&&SK.audit.log("tbreview",{act:"demo-audit",rounds:s.rounds.length,docs:n});
    toast("اكتملت المراجعة التجريبية: "+s.rounds.length+" جولات و"+n+" مستنداً وقيود التسوية والتقرير النهائي","ok");
  }catch(e){toast(e.message||String(e),"bad")}
  finally{busy="";fullStep="";tab="fs";paint()}
}
async function runFinal(){
  const c=compute();if(!c||busy||!c.session)return;
  if(c.sourceOnly){toast("نموذج المصدر غير مقيّم للتأكيد؛ لا يصدر رأياً مهنياً.","warn");return}
  busy="final";abort=new AbortController();paint();
  try{
    const api=await SKosifAI.generate(AI().buildFinalBody(c.session,c.tb,c.base,c.derived),{signal:abort.signal,timeout:300000});
    const ex=AI().extractText(api),raw=AI().parseJsonLoose(ex.text);if(!raw)throw new Error("رد النموذج لم يكن بالصيغة المتوقعة — أعد المحاولة.");
    const d=st();d.session={...session(d),final:AI().normalizeFinal(raw,session(d),c.tb)};put(d);tab="fs";
    SK.audit&&SK.audit.log("tbreview",{act:"final"});toast("صدر التقرير النهائي","ok");
  }catch(e){toast(e.message,"bad")}
  finally{busy="";abort=null;paint()}
}
function bind(node){
  window.SKosifAI&&SKosifAI.bindCard(node,()=>paint());
  node.addEventListener("click",async e=>{
    const fo=e.target.closest("[data-file-open]");if(fo){openFile(fo.dataset.fileOpen);return}
    const fx=e.target.closest("[data-file-close]");if(fx){closeFile(fx.dataset.fileClose);return}
    if(e.target.closest("[data-file-new]")){newEngagement();return}
    if(e.target.closest("[data-bundle-open]")){bundlePicker();return}
    const tg=e.target.closest("[data-tour]");if(tg){const [k,v]=tg.dataset.tour.split(":");if(k==="tab"){tab=v;paint()}else if(k==="doc"){tab="fs";doc=v;paint()}else if(window.SKosifCore)SKosifCore.go(v);return}
    if(e.target.closest("[data-tour-hide]")){const d=st();delete d.showcase;put(d);paint();return}
    if(CU()&&e.target.closest("[data-cc]")){CU().onClick(e);return}
    if(AP()&&AP().onClick(e))return;
    const sb=e.target.closest("[data-std]");
    if(sb){const c=compute(),code=sb.dataset.std,acc=sb.dataset.acc&&c?c.all.accounts.find(a=>a.code===sb.dataset.acc):null;
      const la=acc&&acc.lineKey?RV().LINE_AUDIT[acc.lineKey]:null;
      SKosifCodex.open(code,{account:acc?{code:acc.code,name:acc.name,lineKey:acc.lineKey,lineAr:acc.lineAr,basis:acc.basis,assertions:acc.assertions}:null,note:acc&&c.notes[acc.code]||"",
        findings:acc?c.all.findings.filter(f=>f.code===acc.code):[],procedures:la?la.procedures:[],framework:c?c.fw:"IFRS"});return}
    const t=e.target.closest("[data-tab]");if(t){tab=t.dataset.tab;paint();return}
    const fl=e.target.closest("[data-flt]");if(fl){filter=fl.dataset.flt;paint();return}
    const dc=e.target.closest("[data-doc]");if(dc){doc=dc.dataset.doc;paint();return}
    const fv=e.target.closest("[data-fsv]");if(fv){fsAfter=fv.dataset.fsv==="after";paint();return}
    const af=e.target.closest("[data-acc-f]");if(af){const c=compute(),a=c.all.accounts.find(x=>x.code===af.dataset.accF);const s=(c.stdMap[a.code]||[])[0];if(s)SKosifCodex.open(s,{account:{code:a.code,name:a.name,lineKey:a.lineKey,lineAr:a.lineAr,basis:a.basis,assertions:a.assertions},note:c.notes[a.code]||"",findings:c.all.findings.filter(f=>f.code===a.code),framework:c.fw});return}
    const ad=e.target.closest("[data-adj]");
    if(ad){const d=st(),id=ad.dataset.id;d.accepted=d.accepted.filter(x=>x!==id);d.rejected=d.rejected.filter(x=>x!==id);
      if(ad.dataset.adj==="accept"&&!ad.classList.contains("primary"))d.accepted.push(id);else if(ad.dataset.adj==="reject"&&ad.textContent!=="مرفوض")d.rejected.push(id);
      put(d);paint();return}
    if(FW()&&e.target.closest("[data-fw-doc],[data-fw-sign],[data-fw-reopen]")){const cc=compute();if(cc&&FW().onClick(e,cc))return}
    const b=e.target.closest("[data-a]");if(!b)return;
    const a=b.dataset.a;
    if(a==="handoff-import"){await importCompanyHandoff(b.dataset.id);return}
    if(a==="books"){await fromBooks();return}
    if(a==="corpus"){const sel=root.querySelector("[data-corpus]");if(sel&&sel.value)await openClient(sel.value);else toast("اختر شركة من القائمة","warn");return}
    if(a==="demo-audit"){runDemo();return}
    if(a==="pbc-letter"){const cc=compute();if(cc)printPbcLetter(cc);return}
    if(a==="waha"){const SC=E().reports.sampleCompany;if(!SC)return;
      if(await loadTB(SC.WAHA_TB_CSV,"شركة الواحة الذهبية",{...SC.WAHA_CONTEXT})){const d=st();d.ctx={...d.ctx,...SC.WAHA_CONTEXT};d.fw={};put(d);paint()}return}
    if(a==="sample"){const ta=root.querySelector("[data-tbtext]");if(ta)ta.value=TI().SAMPLE_TB_CSV;const co=root.querySelector('[data-ctx="company"]');if(co&&!co.value)co.value="شركة تجريبية للتجارة";const pe=root.querySelector('[data-ctx="period"]');if(pe&&!pe.value)pe.value="السنة المنتهية في 31 ديسمبر 2025";return}
    if(a==="analyze"){const d=readCtx(st()),text=String((root.querySelector("[data-tbtext]")||{}).value||"").trim();if(!text){toast("ارفع ملف الميزان أو الصقه أولاً","warn");return}
      const tb=TI().parseTrialBalance(text),sourceBlock=sourceImportBlock(tb,d.ctx);if(sourceBlock){toast(sourceBlock,"warn");return}if(!tb.ok){toast(tb.errors.find(e=>e.code==="SOURCE_REPORT_REIMPORT_UNSUPPORTED")?.message||"لم أتعرف على أعمدة الميزان — تأكد من وجود رقم الحساب والمدين والدائن","bad");return}
      if(tb.sourceKind){d.sourceKind="published-statements";d.sourceId=tb.sourceId||d.sourceId||"";}
      d.tbText=text;d.loadedAt=new Date().toISOString();d.loadedFrom="ملف أو لصق";fresh(d);put(d);await docClear();tab="tb";setup=false;
      SK.audit&&SK.audit.log("tbreview",{act:"import",accounts:tb.rows.length,balanced:tb.balanced});paint();return}
    if(a==="setup"){setup=!setup;paint();return}
    if(a==="setup-done"){const d=readCtx(st()),mv=Number((root.querySelector("[data-mat]")||{}).value||0);d.materiality=mv>0?Math.round(mv*100):null;put(d);setup=false;paint();return}
    if(a==="reset"){if(!await SK.confirm("بدء مراجعة جديدة يحذف الميزان والجولات والمستندات المرفوعة على هذا الجهاز. هل صدّرت التقرير؟",{danger:true,ok:"مراجعة جديدة"}))return;put(blank());await docClear();tab="tb";setup=false;paint();return}
    if(a==="round"){if(CU()&&(Number(st().councilSize)||1)>1)CU().run();else runRound();return}
    if(a==="final"){runFinal();return}
    if(a==="narr-ai"){runNarrative();return}
    if(a==="full-audit"){runFull();return}
    if(a==="narr-reset"){const d=st();delete d.narrative;put(d);paint();return}
    if(a==="cancel"){abort&&abort.abort();return}
    if(a==="unavail"){const d=st(),s=session(d),id=b.dataset.id;d.session=s.unavailable.includes(id)?{...s,unavailable:s.unavailable.filter(x=>x!==id)}:AI().markUnavailable(s,id);put(d);paint();return}
    const c=compute();if(!c)return;
    if(a==="print"){if(PAPER.has(doc))printDoc(c,doc);else printReport(c);return}
    if(a==="letter-print"){printLetter(c);return}
    if(a==="sig-save"){put(readCtx(st()));toast("حُفظت بيانات التوقيع","ok");paint();return}
    if(a==="ecl-save"){const d=st(),b=RV().DEFAULT_ECL_BUCKETS.map((x,i)=>{const ex=root.querySelector('[data-ecl-x="'+i+'"]'),rt=root.querySelector('[data-ecl-r="'+i+'"]');
        return {...x,exposure:Math.round((Number(ex&&ex.value)||0)*100),rateBps:Math.round((Number(rt&&rt.value)||0)*100)}});
      if(!b.some(x=>x.exposure>0)){toast("أدخل أرصدة كشف الأعمار أولاً","warn");return}
      d.ecl=b;put(d);toast("أُنشئ قيد الخسائر الائتمانية المتوقعة — اعتمده من القائمة","ok");paint();return}
    if(a==="ecl-clear"){const d=st();d.ecl=null;d.accepted=d.accepted.filter(x=>x!=="AJE-ECL");d.rejected=d.rejected.filter(x=>x!=="AJE-ECL");put(d);paint();return}
    /* Jev: aggregated numbers only (no company or account holder names), redacted again by the Jev screen */
    const facts=()=>{const k=c.base.fs.keys,m=c.base.materiality;return ["مراجعة ميزان مراجعة: "+c.base.accounts.length+" حساباً","الإيرادات "+m0(k.revenue.current)+" · صافي الربح "+m0(k.profit.current)+" · الموجودات "+m0(k.assets.current),
      "الأهمية النسبية "+m0(m.overall)+" · ملاحظات عالية "+c.all.summary.high+" · متوسطة "+c.all.summary.medium,"الرأي المشتق: "+c.derived.ar+" — "+c.derived.basis.join(" ")].join("\n")};
    if(a==="jev-adj"){const list=c.pool.filter(x=>!c.d.rejected.includes(x.id)).slice(0,6);
      SK.askJev({type:"choice",question:"أي قيود التسوية المقترحة يجب اعتماده أولاً قبل إصدار القوائم المالية؟",options:list.map(x=>x.title+" ("+x.standard+") — "+m0(x.lines.reduce((t,l)=>t+l.debit,0))),context:facts()});return}
    if(a==="jev-op"){SK.askJev({type:"choice",question:"ما نوع رأي المراجع الأنسب بناءً على نتائج المراجعة؟",options:["رأي غير معدل","رأي متحفظ","رأي عكسي","امتناع عن إبداء الرأي"],context:facts()});return}
    if(a==="adj-csv"){SK.csv.download(csvName(c,"قيود-التسوية"),["القيد","البيان","المعيار","المصدر","الحالة","رقم الحساب","اسم الحساب","مدين","دائن"],c.pool.flatMap(x=>x.lines.map(l=>[x.id,x.title,x.standard,x.source==="gemini"?"المراجع الذكي":"المحرك",c.d.accepted.includes(x.id)?"معتمد":c.d.rejected.includes(x.id)?"مرفوض":"مقترح",l.code,l.name,(l.debit/100).toFixed(2),(l.credit/100).toFixed(2)])));return}
    if(a==="pbc-csv"){SK.csv.download(csvName(c,"قائمة-المستندات"),["الرقم","المستند","الغرض","الأولوية","المعيار","الحسابات"],c.base.requests.map(q=>[q.id,q.title,q.purpose,q.priority,q.standard,(q.accounts||[]).join(" ")]));return}
    if(a==="fs-csv"&&c.sourceOnly){const x=sourceCsv(c);if(!x){toast("التصدير غير متاح: تحقق من المصدر والهوية أولاً","warn");return}SK.csv.download(x.filename,x.headers,x.rows);return}
    if(a==="fs-csv"){const fs=fsAfter?c.fsAfterAdj:c.fsBefore,rows=[...fs.pl.map(r=>["الربح أو الخسارة",r]),...fs.sfp.map(r=>["المركز المالي",r]),...(fs.cf||[]).map(r=>["التدفقات النقدية",r])].filter(([,r])=>r.level!=="heading");
      SK.csv.download(csvName(c,"القوائم-المالية"),["القائمة","البند","إيضاح","الحالية","السابقة"],rows.map(([s,r])=>[s,r.ar,r.note||"",(r.current/100).toFixed(2),r.prior===null?"":(r.prior/100).toFixed(2)]));return}
  });
  node.addEventListener("change",e=>{
    if(FW()&&FW().onChange(e))return;
    if(CU()&&e.target.closest("[data-ck],[data-rd],[data-jfile],[data-evk]")){CU().onChange(e);return}
    if(AP()&&AP().onChange(e))return;
    const lr=e.target.closest("[data-lr]");if(lr){const d=st();d.letterResponses={...(d.letterResponses||{}),[lr.dataset.lr]:lr.value.trim()};put(d);toast("حُفظ رد الإدارة","ok");return}
    const f=e.target.closest("[data-tbfile]");if(f&&f.files[0]){loadFile(f.files[0]);f.value="";return}
    const u=e.target.closest("[data-up]");if(u&&u.files.length){upload(u.dataset.up,Array.from(u.files));u.value="";return}
    const o=e.target.closest("[data-ov]");if(o){const d=st();if(o.value)d.overrides[o.dataset.ov]=o.value;else delete d.overrides[o.dataset.ov];put(d);paint();return}
    const cf=e.target.closest("[data-conf]");if(cf){const d=st();d.confirm={...d.confirm,[cf.dataset.conf]:cf.checked};put(d);paint();return}
    const co=e.target.closest('[data-ctx="country"]');if(co){put(readCtx(st()));paint();return}
    const w=e.target.closest("[data-fw]");if(w){const d=readCtx(st());d.fw={...d.fw,[w.dataset.fw]:w.checked};d.ctx.framework=d.ctx.country==="EG"?"EAS":CX().frameworkApplicability(d.fw).framework;put(d);paint();return}
  });
}
/* R17: a bundle company opened on its corpus model says what it is inside the file, not only in the picker (P5 keeps it
   open; the label keeps it honest). Keyed on the id and whether the on-demand source adapters have joined. */
let modelNoteMemo={key:null,h:""};
function modelNote(c){
  const id=c&&c.d&&(c.d.bundleId||c.d.ctx&&c.d.ctx.corpusId);if(!id)return "";
  const key=id+(E().reports&&E().reports.volkswagenSource?"+":"");if(modelNoteMemo.key===key)return modelNoteMemo.h;
  let h="";try{const CC=E().reports.corpusCompanies,cid=(CC.corpusCompany&&CC.corpusCompany(id)||{}).id||id,m=CC.auditModelCatalog().find(x=>x.id===cid);
    if(m&&m.modelStatus==="pending-review")h='<p class="tbr-warn" role="note" data-model-note="'+esc(m.id)+'">'+esc(m.company+" — "+m.fy)+': نموذج التطبيق '+esc(m.modelStatusAr)+'. الميزان مبني من أرقام القوائم المنشورة في الحزمة، وما يُنتج في هذا الملف محاكاة لعمل المراجع للمقارنة بنتائجه — لا تأكيد مهني.</p>'}catch{}
  modelNoteMemo={key,h};return h;
}
function paint(){
  if(!root)return;
  if(!window.SKEngines||!SKEngines.audit||!SKEngines.audit.tbReview){root.innerHTML='<p class="empty">محركات المراجعة غير محملة.</p>';return}
  let c=null;try{c=compute()}catch(e){SK.errors&&SK.errors.report(e,"tbreview");root.innerHTML=hero(null)+'<p class="empty">تعذر تحليل الميزان: '+esc(e.message)+'</p>'+setupHTML(st(),true);return}
  const y=window.scrollY;
  if(!c){root.innerHTML=filesBar()+hero(null)+setupHTML(st(),true)+(window.SKosifAI&&!SKosifAI.ready()?SKosifAI.cardHTML():'');return}
  if(c.sourceOnly){root.innerHTML='<div class="tbr tbr-source-replay">'+filesBar()+'<h2>عرض القوائم المنشورة من المصدر</h2><p>ليست إعادة إنشاء من قيود أو دفتر أستاذ؛ حالة التأكيد: لم يُقيّم.</p>'+fsTab(c)+'</div>';return;}
  if(!ADV[tab]&&!TABS.some(x=>x[0]===tab))tab="tb";
  const conf=tab==="conf"&&CU();
  const body=conf?'<div class="tbc" data-tbc-body aria-busy="true">'+(confHTML.sig===c.sig&&confHTML.h||'<p class="empty">يحسب درجات الثقة والفحوص…</p>')+'</div>':tab==="plan"&&FW()?(AP()?AP().planCard(c)+AP().estCard(c):'')+FW().planTab(c):tab==="close"&&FW()?FW().closeTab(c)+(AP()?AP().gcCard(c):''):tab==="ai"?aiTab(c):tab==="docs"?docsTab(c):tab==="adj"?adjTab(c):tab==="fs"?fsTab(c):tbTab(c);
  const adv=!c.sourceOnly&&window.SKosifAuditBridge&&ADV[tab]?advHTML(tab):"";
  root.innerHTML='<div class="tbr">'+filesBar()+modelNote(c)+tourHTML(c)+hero(c)+(setup?setupHTML(c.d,false):'')+body+adv+'</div>';
  /* the flow map scrolls sideways: bring the current step into view without moving the page */
  {const tr=root.querySelector(".tbr-flowtrack"),cu=tr&&tr.querySelector(".cur,.tbr-flow-node:not(.done)");if(tr&&cu){const a=tr.getBoundingClientRect(),b=cu.getBoundingClientRect();tr.scrollLeft+=(b.left+b.width/2)-(a.left+a.width/2)}}
  window.scrollTo(0,y);
  if(adv){const h=root.querySelector("[data-studio-host]");if(h)SKosifAuditBridge.mountStudio(h,ADV[tab])}
  if(conf){const seq=++confSeq;CU().confTab(c).then(h=>{if(seq!==confSeq||tab!=="conf"||!root)return;confHTML={sig:c.sig,h};const el=root.querySelector("[data-tbc-body]");if(el){el.innerHTML=h;el.removeAttribute("aria-busy");window.scrollTo(0,y)}})
    .catch(e=>{SK.errors&&SK.errors.report(e,"tbreview-council");const el=root.querySelector("[data-tbc-body]");if(el)el.innerHTML='<p class="empty">تعذر حساب درجات الثقة: '+esc(e.message)+'</p>'})}
}
FW()&&FW().init({st,put,paint,root:()=>root,print:k=>{const c=compute();if(c)printDoc(c,k)}});
CU()&&CU().init({st,put,compute,session,paint,docGet,docPut,docKey,getBusy:()=>busy,setBusy:v=>{busy=v;paint()},setAbort:a=>{abort=a}});
AP()&&AP().init({st,put,compute,paint});
SK.view("tbreview",{render(node){root=node;if(!node.dataset.bound){bind(node);node.dataset.bound="1"}paint();
  if(!sourcesAsked){sourcesAsked=true;sources().then(()=>{cache=null;if(root&&root.isConnected)paint()}).catch(()=>{sourcesAsked=false})}}});
})();
