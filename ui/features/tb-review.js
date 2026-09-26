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
const E=()=>window.SKEngines,RV=()=>E().audit.tbReview,AI=()=>E().audit.aiReview,DC=()=>E().audit.documentCheck,CX=()=>E().audit.codex,PG=()=>E().audit.programme,DS=()=>E().audit.disclosures;
const TI=()=>E().reports.tbImport,FS=()=>E().reports.statements,AN=()=>E().reports.analysis,MN=()=>E().reports.money;
const TABS=[["tb","الميزان والمعايير"],["ai","جولات المراجعة"],["docs","المستندات"],["adj","التسويات والامتثال"],["fs","القوائم والتقارير"]];
let root=null,tab="tb",filter="all",busy="",abort=null,cache=null,setup=false,fsAfter=true,doc="issue";

/* ---------- state ---------- */
const blank=()=>({ctx:{company:"",period:"",periodStart:"",periodEnd:"",activity:"",country:"SA",framework:"IFRS",currency:"الريال السعودي",legalForm:"",registeredOffice:"",principalPlace:""},fw:{},tbText:"",overrides:{},materiality:null,session:null,accepted:[],rejected:[],ecl:null,
  confirm:{independence:false,edition:false,compliance:false,unrecognized:false,partner:false}});
const st=()=>{const d=load(KEY,null);return d&&typeof d==="object"?{...blank(),...d,ctx:{...blank().ctx,...(d.ctx||{})},confirm:{...blank().confirm,...(d.confirm||{})}}:blank()};
let CUR="ر.س";const egypt=d=>d.ctx.country==="EG"||d.ctx.framework==="EAS";
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
async function docClear(){try{const db=await idb();await new Promise(res=>{const t=db.transaction("docs","readwrite");t.objectStore("docs").clear();t.oncomplete=res;t.onerror=res})}catch{}}
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
  const inP=(e,a,b)=>(!a||e.date>=a)&&(!b||e.date<=b);
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
/* load a trial balance into the review (replaces the current one after confirmation) */
async function loadTB(text,label,ctx){
  const tb=TI().parseTrialBalance(text);if(!tb.ok){toast("لم أتعرف على أعمدة الميزان","bad");return false}
  const d=st();
  if(d.tbText&&d.session&&d.session.rounds&&d.session.rounds.length&&!await SK.confirm("توجد مراجعة جارية بجولات Gemini — استبدالها بميزان «"+label+"»؟",{danger:true,ok:"استبدال"}))return false;
  Object.entries(ctx||{}).forEach(([k,v])=>{if(v)d.ctx[k]=v});
  d.tbText=text;d.session=null;d.accepted=[];d.rejected=[];d.overrides={};put(d);await docClear();tab="tb";setup=false;
  SK.audit&&SK.audit.log("tbreview",{act:"import",source:label,accounts:tb.rows.length,balanced:tb.balanced});
  toast("استُلم ميزان "+label+": "+tb.rows.length+" حساباً"+(tb.balanced?"، متزن":" — غير متزن، راجع الفرق"),tb.balanced?"ok":"warn");
  return true;
}
async function fromBooks(){
  const b=await booksTB();
  if(!b){toast("لا توجد قيود في الدفاتر المحاسبية ولا مبيعات أو مشتريات مسجلة للفترة","warn");return false}
  const ok=await loadTB(b.text,b.source,b.ctx);
  if(ok){if(window.SKosifCore&&SKosifCore.view()!=="tbreview")SKosifCore.go("tbreview");else paint()}
  return ok;
}
window.SKosifTBReview=Object.freeze({fromBooks,booksTB});

/* ---------- computation (memoized) ---------- */
function compute(){
  const d=st();CUR=egypt(d)?"ج.م":"ر.س";if(!d.tbText)return null;
  const sig=JSON.stringify([MN().fingerprint(d.tbText),d.overrides,d.ctx,d.materiality,d.session&&d.session.rounds.length,d.session&&d.session.unavailable,d.accepted,d.rejected,!!(d.session&&d.session.final),d.ecl,d.confirm]);
  if(cache&&cache.sig===sig)return cache;
  const tb=TI().parseTrialBalance(d.tbText);
  const fw=egypt(d)?"EAS":d.ctx.framework,tax=egypt(d)?"income":"zakat";
  const opts={framework:fw,currency:CUR,overrides:d.overrides,materiality:d.materiality||undefined};
  let base=RV().reviewTrialBalance(tb,opts);
  const s=d.session;
  if(s&&s.rounds.length){const ev=AI().evidenceFromSession(base,s);if(Object.keys(ev).length)base=RV().reviewTrialBalance(tb,{...opts,evidence:ev})}
  const gem=s?s.rounds.flatMap(r=>r.findings):[];
  const all=gem.length?RV().reviewTrialBalance(tb,{...opts,evidence:s?AI().evidenceFromSession(base,s):{},extraFindings:gem}):base;
  const stdMap=s?AI().accountStandards(base,s):Object.fromEntries(base.accounts.map(a=>[a.code,a.standards.map(x=>x.code)]));
  const notes={};if(s)for(const r of s.rounds)for(const [code,v] of Object.entries(r.accountStandards))if(v.note)notes[code]=v.note;
  const eclM=d.ecl?RV().eclMatrix(d.ecl):null,eclA=eclM?RV().eclAdjustment(tb,eclM,fw):null;
  const pool=[...base.adjustments,...(eclA?[eclA]:[]),...(s?s.rounds.flatMap(r=>r.adjustments.filter(a=>a.valid)):[]),...(s&&s.final?s.final.adjustments.filter(a=>a.valid):[])];
  const accepted=pool.filter(a=>d.accepted.includes(a.id));
  const adjusted=accepted.length?RV().applyAdjustments(tb,accepted):tb;
  const fsBefore=base.fs,fsAfterAdj=accepted.length?FS().buildStatements(adjusted,d.overrides,{tax}):base.fs;
  const derived=AI().deriveOpinion(tb,base,s||AI().newSession({...d.ctx,framework:fw}),accepted);
  const evidence=s?AI().evidenceFromSession(base,s):{},c=d.ctx,cf=d.confirm;
  const disclosures=DS().disclosureReadiness({fs:fsAfterAdj,framework:fw,periodEnd:c.periodEnd,currency:CUR,confirm:{editionReviewed:cf.edition,complianceApproved:cf.compliance,unrecognizedReviewed:cf.unrecognized},
    entity:{legalName:c.company,legalForm:c.legalForm,country:egypt(d)?"مصر":"المملكة العربية السعودية",registeredOffice:c.registeredOffice,principalPlace:c.principalPlace,activities:c.activity}});
  const decided=pool.every(a=>d.accepted.includes(a.id)||d.rejected.includes(a.id));
  const programme=PG().auditProgramme({review:base,framework:fw,evidence,company:c.company,period:c.period,activity:c.activity,independenceConfirmed:cf.independence,partnerApproved:cf.partner,
    rounds:s?s.rounds.length:0,finalIssued:!!(s&&s.final),adjustmentsDecided:decided,disclosuresValid:disclosures.valid});
  cache={sig,d,fw,tb,base,all,stdMap,notes,pool,accepted,adjusted,fsBefore,fsAfterAdj,derived,session:s,eclM,disclosures,programme,decided};
  return cache;
}
const session=d=>d.session||AI().newSession(d.ctx,window.SKosifAI?SKosifAI.conf().model:AI().DEFAULT_MODEL);

/* ---------- header: steps ---------- */
function stepper(c){
  const s=c&&c.session,rounds=s?s.rounds.length:0,out=s?AI().outstanding(s).length:0,decided=c?c.pool.every(a=>c.d.accepted.includes(a.id)||c.d.rejected.includes(a.id)):false;
  const steps=[["استلام الميزان",!!c],["المعايير لكل حساب",!!c&&c.tb.ok],["مراجعة Gemini",rounds>0],["المستندات",rounds>0&&!out],["التسويات والامتثال",!!c&&decided],["التقارير",!!(s&&s.final)]];
  const cur=steps.findIndex(x=>!x[1]);
  return '<ol class="tbr-steps">'+steps.map(([l,done],i)=>'<li class="'+(done?"done":i===cur?"cur":"")+'"><i>'+(done?"✓":i+1)+'</i><span>'+esc(l)+'</span></li>').join("")+'</ol>';
}
function hero(c){
  const d=c?c.d:st(),ctx=d.ctx,s=c&&c.session,state=s?AI().sessionState(s):{label:c?"الميزان جاهز — ابدأ جولة Gemini أو تابع بالمحرك الآلي":"ابدأ باستلام ميزان المراجعة"};
  return '<section class="tbr-hero"><div class="tx"><span class="eyebrow">مراجعة الحسابات بالمعايير</span><h2>'+esc(ctx.company||"منشأة جديدة")+'</h2><p>'+esc([ctx.period,FW_LABEL[egypt(d)?"EAS":ctx.framework],ctx.activity].filter(Boolean).join(" · "))+'</p>'+
    '<p class="tbr-state">'+esc(state.label)+'</p></div><div class="sk-actions">'+(c?'<button type="button" class="btn sm" data-a="setup">بيانات المراجعة</button><button type="button" class="btn sm" data-a="reset">مراجعة جديدة</button>':'')+'</div></section>'+stepper(c)+
    (c?'<div class="tbr-tabs" role="tablist">'+TABS.map(([k,l])=>'<button type="button" role="tab" data-tab="'+k+'" aria-selected="'+(tab===k)+'">'+esc(l)+badge(c,k)+'</button>').join("")+'</div>':'');
}
function badge(c,k){
  const n=k==="tb"?c.base.accounts.filter(a=>a.findings.length).length:k==="ai"?(c.session?c.session.rounds.length:0):k==="docs"?(c.session?AI().outstanding(c.session).length:c.base.requests.length):k==="adj"?c.pool.filter(a=>!c.d.accepted.includes(a.id)&&!c.d.rejected.includes(a.id)).length:0;
  return n?'<i class="tbr-n">'+n+'</i>':'';
}

/* ---------- setup (company, period, framework, trial balance) ---------- */
function setupHTML(d,withTb){
  const c=d.ctx,fw=d.fw||{},app=CX().frameworkApplicability(fw),eg=egypt(d);
  const q=(k,l)=>'<label class="checkline"><input type="checkbox" data-fw="'+k+'"'+(fw[k]?' checked':'')+'> '+esc(l)+'</label>';
  return '<section class="card"><div class="card-h"><div><h3>'+(withTb?"استلام ميزان المراجعة":"بيانات المراجعة")+'</h3><p>اطلب من الشركة ميزان المراجعة (Excel أو CSV) بأعمدة: رقم الحساب، اسم الحساب، مدين، دائن — ويفضّل عمود السنة السابقة للمقارنة وقائمة التدفقات.</p></div></div><div class="card-b">'+
    '<div class="sk-grid2"><label class="sk-field"><span>بلد المنشأة</span><select data-ctx="country"><option value="SA"'+(eg?'':' selected')+'>المملكة العربية السعودية — IFRS المعتمدة / SOCPA</option><option value="EG"'+(eg?' selected':'')+'>جمهورية مصر العربية — معايير المحاسبة المصرية</option></select></label>'+
      '<label class="sk-field"><span>الشكل القانوني</span><input data-ctx="legalForm" value="'+esc(c.legalForm)+'" placeholder="ذات مسؤولية محدودة، مساهمة…"></label></div>'+
    '<div class="sk-grid2"><label class="sk-field"><span>المنشأة</span><input data-ctx="company" value="'+esc(c.company)+'" placeholder="اسم الشركة"></label><label class="sk-field"><span>النشاط</span><input data-ctx="activity" value="'+esc(c.activity)+'" placeholder="تجارة، مقاولات، خدمات…"></label></div>'+
    '<div class="sk-grid2"><label class="sk-field"><span>الفترة</span><input data-ctx="period" value="'+esc(c.period)+'" placeholder="السنة المنتهية في 31 ديسمبر 2025"></label><div class="sk-grid2"><label class="sk-field"><span>من</span><input type="date" data-ctx="periodStart" value="'+esc(c.periodStart)+'"></label><label class="sk-field"><span>إلى</span><input type="date" data-ctx="periodEnd" value="'+esc(c.periodEnd)+'"></label></div></div>'+
    '<div class="sk-grid2"><label class="sk-field"><span>المكتب المسجل</span><input data-ctx="registeredOffice" value="'+esc(c.registeredOffice)+'" placeholder="المدينة والعنوان"></label><label class="sk-field"><span>المقر الرئيسي للنشاط</span><input data-ctx="principalPlace" value="'+esc(c.principalPlace)+'"></label></div>'+
    (eg?'<div class="tbr-fw"><div><h4>الإطار المحاسبي</h4><p class="hint">معايير المحاسبة المصرية الصادرة بقرارات وزير الاستثمار وتعديلاتها، وقانون الضريبة على الدخل 91 لسنة 2005 (22.5%)، وقانون الضريبة على القيمة المضافة 67 لسنة 2016 (14%)، وقانون الشركات 159 لسنة 1981. العملة: الجنيه المصري.</p></div>'+
      '<div class="tbr-fw-r"><b>معايير المحاسبة المصرية</b><p>تظهر أرقام المعايير المصرية بجوار الحسابات مع ما يقابلها في IFRS، وتُعامل ضريبة الدخل بدلاً من الزكاة.</p><small>الهيئة العامة للرقابة المالية · مصلحة الضرائب المصرية</small></div></div>':
    '<div class="tbr-fw"><div><h4>الإطار المحاسبي (إرشادات SOCPA — القسم 1)</h4>'+q("listedOrIssuing","أسهم أو أدوات دين متداولة أو في طور الإدراج")+q("fiduciaryForBroadGroup","تحتفظ بأموال مجموعة عريضة من الغير كنشاط رئيس (بنك، تأمين، صندوق)")+q("incidentalDepositsOnly","الاحتفاظ بأموال العملاء عرضي (مدارس، وكالات سفر)")+q("electedFullIfrs","غير خاضعة للمساءلة واختارت المعايير الكاملة")+'</div>'+
      '<div class="tbr-fw-r"><b>'+esc(app.label)+'</b><p>'+esc(app.reason)+'</p><small>'+esc(app.cite.join(" · "))+'</small></div></div>')+
    (withTb?'<div class="tbr-in"><label class="btn primary" style="cursor:pointer">'+SK.icon("excelrecon")+' رفع ملف الميزان<input type="file" data-tbfile accept=".xlsx,.csv,.tsv,.txt,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" hidden></label><button type="button" class="btn" data-a="books" title="ميزان الشركة النشطة من الدفاتر المحاسبية أو السجلات التشغيلية">'+SK.icon("ledger")+' من دفاتر التطبيق</button><button type="button" class="btn" data-a="sample">ميزان تجريبي</button><span class="hint">أو الصق الميزان من Excel:</span></div>'+
      '<textarea data-tbtext rows="7" dir="ltr" placeholder="رقم الحساب\tاسم الحساب\tمدين\tدائن\tالسنة السابقة">'+esc(d.tbText)+'</textarea><div class="sk-actions"><button type="button" class="btn primary" data-a="analyze">تحليل الميزان</button></div>':
      '<div class="sk-actions"><button type="button" class="btn primary" data-a="setup-done">تم</button><label class="sk-field tbr-mat"><span>الأهمية النسبية (ريال) — فارغ = تلقائي</span><input type="number" min="0" step="100" data-mat value="'+(d.materiality?d.materiality/100:"")+'"></label></div>')+
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
      tile("calc","warn",'الأهمية النسبية',sar(m.overall),m.benchmarkAr+' × '+(m.rate*100)+'% · التنفيذية '+sar(m.performance))+
      tile("risks",b.summary.high?"bad":"ok",'الملاحظات',b.findings.length,b.summary.high+' عالية · '+b.summary.medium+' متوسطة')+
    '</div>'+
    (topF.length?'<section class="card"><div class="card-h"><div><h3>أهم ما اكتشفته المراجعة</h3><p>المحرك الآلي'+(c.session&&c.session.rounds.length?' و Gemini':'')+' — كل ملاحظة بأساسها الرقمي ومعيارها.</p></div></div><div class="card-b tbr-flist">'+topF.map(fItem).join("")+'</div></section>':'')+
    '<section class="card"><div class="card-h"><div><h3>الحسابات ومعاييرها</h3><p>اضغط رقم المعيار بجوار الحساب لتعرف علاقته بالحساب ومتطلباته ومصدره الرسمي.</p></div><div class="sk-seg">'+[["all","الكل"],["flag","عليها ملاحظات"],["map","تحتاج تبويب"]].map(([v,l])=>'<button type="button" data-flt="'+v+'" aria-pressed="'+(filter===v)+'">'+l+'</button>').join("")+'</div></div>'+
    '<div class="card-b tbr-tw"><table class="sk-table tbr-t"><thead><tr><th>الرقم</th><th>الحساب</th><th>البند في القوائم</th><th>الرصيد</th><th>السابق</th><th>التغير</th><th>المعايير</th><th>ملاحظات</th></tr></thead><tbody>'+rows.map(row).join("")+'</tbody></table></div></section>';
}
function fItem(f){
  return '<div class="tbr-fi"><span class="sev '+sevCls(f.severity)+'"></span><div class="tx"><b>'+esc(f.title)+(f.account?' — '+esc(f.account):'')+'</b><small>'+esc(f.detail)+'</small><small class="tbr-basis">'+esc(f.basis)+' · الإجراء: '+esc(f.action)+'</small></div>'+
    '<div class="tbr-fi-m"><button type="button" class="std-b '+famCls(f.standard)+'" data-std="'+esc(f.standard)+'"'+(f.code?' data-acc="'+esc(f.code)+'"':'')+'>'+esc(f.standard)+'</button><span class="tbr-src">'+(f.source==="gemini"?'Gemini ج'+f.round:'المحرك')+'</span></div></div>';
}

/* ---------- tab 2: Gemini rounds ---------- */
function aiTab(c){
  const ready=window.SKosifAI&&SKosifAI.ready(),s=c.session,state=s?AI().sessionState(s):{state:"start",label:"جاهز للجولة الأولى"};
  const next=s?s.rounds.length+1:1;
  let action="";
  if(ready){
    if(state.state==="start"||state.state==="ready"||state.state==="awaiting-docs")action='<button type="button" class="btn primary" data-a="round"'+(busy?' disabled':'')+'>'+(busy==="round"?'Gemini يراجع…':state.state==="start"?'ابدأ الجولة الأولى':'أرسل للجولة '+next)+'</button>';
    if(s&&s.rounds.length)action+='<button type="button" class="btn'+(state.state==="complete"||state.state==="limit"?' primary':'')+'" data-a="final"'+(busy?' disabled':'')+'>'+(busy==="final"?'يُعد التقرير…':s.final?'إعادة إصدار التقرير النهائي':'إصدار التقرير النهائي')+'</button>';
    if(busy)action+='<button type="button" class="btn danger" data-a="cancel">إلغاء</button>';
  }
  const rounds=s?s.rounds.slice().reverse():[];
  return (ready?'':SKosifAI.cardHTML()+'<p class="hint tbr-pad">بدون مفتاح تعمل المراجعة بالمحرك الآلي: المعايير والملاحظات والطلبات والقيود والقوائم متاحة في بقية التبويبات.</p>')+
    '<section class="card tbr-run"><div class="card-b"><div class="tbr-run-h"><div><b>'+esc(state.label)+'</b><small>'+(s?s.rounds.length+' جولة · '+AI().outstanding(s).length+' مستند مطلوب · '+AI().pendingUploads(s).length+' مرفوع للجولة القادمة':'يرسل الميزان ونتائج المحرك الآلي إلى Gemini ليراجعها بصفة مجلس من ثلاثة مراجعين.')+'</small></div><div class="sk-actions">'+action+'</div></div>'+
      (busy?'<div class="tbr-busy"><i></i><span>'+(busy==="round"?'يراجع Gemini الميزان والمستندات — قد يستغرق دقيقة أو أكثر.':'يُعد Gemini التقرير النهائي…')+'</span></div>':'')+'</div></section>'+
    rounds.map(r=>roundCard(r,c)).join("")+
    (ready?'<details class="tbr-key"><summary>إعداد Gemini (المفتاح والنموذج)</summary>'+SKosifAI.cardHTML()+'</details>':'');
}
function roundCard(r,c){
  const today=new Date().toISOString().slice(0,10),ctx=c.d.ctx;
  const docRow=x=>{const chk=DC().checkDocument({...x.extracted,amount:x.extracted.amount,vatAmount:x.extracted.vatAmount,fileName:x.fileName},{periodStart:ctx.periodStart||undefined,periodEnd:ctx.periodEnd||undefined,today,jurisdiction:egypt(c.d)?"EG":"SA"});
    return '<tr><td>'+esc(x.fileName)+'</td><td class="mono">'+esc(x.requestId)+'</td><td><span class="sksev '+(x.verdict==="مقبول"?"ok":x.verdict==="مرفوض"?"bad":"warn")+'">'+esc(x.verdict)+'</span></td><td>'+esc(x.notes)+
      (Object.keys(x.extracted).length?'<small class="tbr-sub">'+Object.entries(x.extracted).map(([k,v])=>esc(k)+': '+esc(v)).join(" · ")+'</small>':'')+'</td><td>'+(chk.issues.length?'<span class="sksev '+(chk.verdict==="مرفوض"?"bad":"warn")+'" title="'+esc(chk.issues.map(i=>i.message).join("\n"))+'">تحقق آلي: '+esc(chk.verdict)+'</span>':Object.keys(x.extracted).length?'<span class="sksev ok">تحقق آلي: سليم</span>':'—')+'</td></tr>'};
  return '<section class="card tbr-round"><div class="card-h"><div><h3>الجولة '+r.no+' <span class="sksev '+(r.status==="complete"?"ok":"warn")+'">'+(r.status==="complete"?"اكتملت":"تطلب مستندات")+'</span></h3><p>'+esc(r.model)+' · '+esc(new Date(r.at).toLocaleString("ar-SA-u-ca-gregory-nu-latn",{dateStyle:"medium",timeStyle:"short"}))+'</p></div>'+SKCharts.ring(r.riskScore,{cls:r.riskScore>=70?"bad":r.riskScore>=45?"warn":"ok",size:54})+'</div><div class="card-b">'+
    '<p class="tbr-sum">'+esc(r.summary)+'</p>'+
    (r.opinions.length?'<div class="tbr-ops">'+r.opinions.map(o=>'<div><b>'+esc(o.reviewer)+'</b><p>'+esc(o.opinion)+'</p></div>').join("")+'</div>':'')+
    (r.findings.length?'<h4>الملاحظات ('+r.findings.length+')</h4><div class="tbr-flist">'+r.findings.map(fItem).join("")+'</div>':'')+
    (r.requests.filter(q=>q.round===r.no).length?'<h4>المستندات المطلوبة</h4><div class="tbr-reqs">'+r.requests.filter(q=>q.round===r.no).map(q=>reqRow(q,c)).join("")+'</div>':'')+
    (r.reviewed.length?'<h4>المستندات التي راجعها</h4><div class="tbr-tw"><table class="sk-table" data-sk-plain><thead><tr><th>الملف</th><th>الطلب</th><th>الحكم</th><th>الملاحظات والبيانات المستخرجة</th><th>التحقق الآلي</th></tr></thead><tbody>'+r.reviewed.map(docRow).join("")+'</tbody></table></div>':'')+
    (r.adjustments.length?'<h4>قيود مقترحة</h4>'+r.adjustments.map(a=>'<p class="tbr-adjl"><span class="sksev '+(a.valid?"ok":"bad")+'">'+(a.valid?"متوازن":"مرفوض آلياً")+'</span> '+esc(a.title)+' — '+esc(a.reason)+'</p>').join("")+'<p class="hint">القيود المتوازنة تظهر في تبويب «التسويات والامتثال» لتعتمدها أو ترفضها.</p>':'')+
    (Object.keys(r.accountStandards).length?'<p class="hint">أكّد المجلس أو صحّح معايير '+Object.keys(r.accountStandards).length+' حساباً — تظهر بجوار الحسابات.</p>':'')+
    (r.warnings.length?'<div class="tbr-warn">'+r.warnings.map(w=>'<p>'+esc(w)+'</p>').join("")+'</div>':'')+
    (r.guidance?'<p class="tbr-next"><b>الخطوة التالية:</b> '+esc(r.guidance)+'</p>':'')+
  '</div></section>';
}

/* ---------- tab 3: documents ---------- */
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
  return '<div class="tbr-req"><div class="tx"><b><span class="mono">'+esc(q.id)+'</span> '+esc(q.title)+'</b><small>'+esc(q.purpose)+(q.accounts&&q.accounts.length?' · الحسابات: '+esc(q.accounts.join("، ")):'')+'</small>'+
    (files.length?'<small class="tbr-files">'+files.map(f=>'📎 '+esc(f.fileName)+' ('+Math.max(1,Math.round(f.size/1024))+' ك.ب · ج'+f.round+')').join(" · ")+'</small>':'')+'</div>'+
    '<div class="tbr-req-m"><span class="sksev '+(q.priority==="عالية"?"bad":q.priority==="متوسطة"?"warn":"info")+'">'+esc(q.priority)+'</span><span class="sksev '+cls+'">'+esc(l)+'</span>'+
    (l==="مقبول"?'':'<label class="btn sm" style="cursor:pointer">رفع<input type="file" multiple data-up="'+esc(q.id)+'" accept=".pdf,.png,.jpg,.jpeg,.webp,.csv,.txt,.tsv,.json" hidden></label>'+
      '<button type="button" class="btn sm" data-a="unavail" data-id="'+esc(q.id)+'">'+(s&&s.unavailable.includes(q.id)?'متوفر':'غير متوفر')+'</button>')+'</div></div>';
}
function docsTab(c){
  const s=c.session,gem=s?[...new Map(s.rounds.flatMap(r=>r.requests).map(q=>[q.id,q])).values()]:[];
  return '<section class="card"><div class="card-h"><div><h3>طلبات Gemini</h3><p>'+(gem.length?gem.length+' طلباً عبر الجولات. ارفع المستند ثم أرسل الجولة التالية من تبويب «جولات المراجعة».':'تظهر هنا بعد الجولة الأولى.')+'</p></div></div><div class="card-b tbr-reqs">'+(gem.map(q=>reqRow(q,c)).join("")||'<p class="empty">لا طلبات بعد.</p>')+'</div></section>'+
    '<section class="card"><div class="card-h"><div><h3>قائمة المستندات المطلوبة من العميل (PBC)</h3><p>أعدها المحرك الآلي حسب البنود والمخاطر — '+c.base.requests.length+' مستنداً. ما ترفعه هنا يُرسل أيضاً إلى Gemini في الجولة التالية.</p></div><div class="sk-actions"><button type="button" class="btn sm" data-a="pbc-csv">تصدير القائمة</button></div></div><div class="card-b tbr-reqs">'+c.base.requests.map(q=>reqRow(q,c)).join("")+'</div></section>';
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
    return '<div class="tbr-adj'+(on?' on':off?' off':'')+'"><div class="tbr-adj-h"><div><b><span class="mono">'+esc(a.id)+'</span> '+esc(a.title)+'</b><small>'+esc(a.reason)+'</small></div><div class="tbr-adj-m"><button type="button" class="std-b '+famCls(CX().normalizeCode(a.standard)||"")+'" data-std="'+esc(CX().normalizeCode(a.standard)||a.standard)+'">'+esc(a.standard)+'</button><span class="tbr-src">'+(a.source==="gemini"?"Gemini"+(a.round?" ج"+a.round:""):"المحرك")+'</span>'+(a.estimate?'<span class="sksev warn">تقديري</span>':'')+'<span class="sksev '+(v.balanced?"ok":"bad")+'">'+(v.balanced?"متوازن":"غير متوازن")+'</span></div></div>'+
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
      (c.session&&c.session.final&&c.session.final.compliance.length?'<h4>رأي Gemini في الامتثال (التقرير النهائي)</h4>'+c.session.final.compliance.map(x=>'<div class="tbr-ci"><div class="tbr-ci-h"><button type="button" class="std-b '+famCls(x.standardCode)+'" data-std="'+esc(x.standardCode)+'">'+esc(x.standardCode)+'</button><span class="sksev '+(x.status==="ممتثل"?"ok":x.status==="غير ممتثل"?"bad":"warn")+'">'+esc(x.status)+'</span></div><p>'+esc(x.discussion)+'</p></div>').join(""):'')+
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
  const ev=c.session?AI().evidenceFromSession(c.base,c.session):{};
  return c.base.risks.filter(r=>r.significant).slice(0,3).map(r=>({title:r.ar,
    why:'بلغ رصيد '+r.ar+' '+sar(r.amount)+'، وقُيّم خطره بدرجة '+r.score+' من 100 لأن '+r.risk+(r.parts.estimate>=15?' ويتضمن تقديرات محاسبية تتطلب حكماً مهنياً (ISA 540)':'')+'. لذلك عُدّ من الأمور ذات الأهمية القصوى في مراجعتنا.',
    how:'شملت إجراءاتنا: '+r.procedures.join('؛ ')+'.'+(ev[r.lineKey]==="accepted"?' وحصلنا على المستندات المؤيدة وقيّمناها في جولات المراجعة.':ev[r.lineKey]==="partial"?' وما زالت بعض المستندات المؤيدة قيد الاستكمال.':'')}));
}
function reportParts(c){
  const fs=fsAfter?c.fsAfterAdj:c.fsBefore,hp=fs.hasPrior,rs=AN().ratios(fs),z=AN().altmanZ(fs),bm=AN().beneishM(fs),du=AN().dupont(fs).current,hl=AN().highlights(fs),md=AN().mdna(fs);
  const fmt=(v,u)=>v===null||v===undefined?'—':u==="%"?v+'%':u==="days"?v+' يوم':v+'×';
  return {fs,hp,rs,z,bm,du,hl,md,fmt};
}
const DOCS=[["issue","الإصدار والاعتماد"],["statements","القوائم المالية"],["annual","التقرير السنوي (نموذج 10-K)"],["release","بيان النتائج"],["auditor","تقرير المراجع المستقل"],["analysis","التحليل المالي"]];
let docStyled=false;
function fmtDate(iso,eg){if(!/^\d{4}-\d{2}-\d{2}$/.test(iso||""))return "";try{return new Date(iso+"T12:00:00").toLocaleDateString(eg?"ar-EG-u-nu-latn":"ar-SA-u-ca-gregory-nu-latn",{day:"numeric",month:"long",year:"numeric"})}catch{return iso}}
function docX(c){return {c,fs:fsAfter?c.fsAfterAdj:c.fsBefore,cur:CUR,ctx:c.d.ctx,fw:c.fw,periodEnd:fmtDate(c.d.ctx.periodEnd,c.fw==="EAS"),kams:kamsOf(c).map(k=>({title:k.title,description:k.why,how:k.how})),opinion:c.derived}}
function docView(c,kind){
  if(!docStyled&&window.SKosifReportDocs){const st=document.createElement("style");st.id="rd-css";st.textContent=SKosifReportDocs.CSS;document.head.appendChild(st);docStyled=true}
  const ctx=c.d.ctx;
  return (kind==="auditor"?'<section class="card"><div class="card-h"><div><h3>بيانات التوقيع</h3><p>تظهر في تقرير المراجع؛ الخانات الفارغة تبقى بين قوسين لتُستكمل.</p></div></div><div class="card-b"><div class="tbr-sig">'+
    [["auditFirm","مكتب المراجعة"],["auditPartner","الشريك المسؤول"],["auditLicence","رقم الترخيص"],["auditCity","المدينة"]].map(([k,l])=>'<label class="sk-field"><span>'+l+'</span><input data-ctx="'+k+'" value="'+esc(ctx[k]||"")+'"></label>').join("")+
    '</div><div class="sk-actions"><button type="button" class="btn sm primary" data-a="sig-save">حفظ</button></div></div></section>':'')+
    '<div class="rd-paper">'+SKosifReportDocs[kind](docX(c))+'</div>';
}
function fsTab(c){
  const p=reportParts(c),fs=p.fs,d=c.derived,f=c.session&&c.session.final,GROUP={liquidity:"السيولة",profitability:"الربحية",efficiency:"الكفاءة",leverage:"الرفع المالي",cash:"التدفق النقدي"};
  const hl=p.hl.map(h=>'<div class="skk4-t"><span class="tx"><span>'+esc(h.ar)+'</span><b>'+(h.kind==="money"?sar(h.current):p.fmt(h.current,h.kind))+'</b><small>'+(h.change===null?(h.prior===null?'':'السابق '+(h.kind==="money"?sar(h.prior):p.fmt(h.prior,h.kind))):(h.change>=0?'▲ ':'▼ ')+Math.abs(h.change)+'% عن السابق')+'</small></span></div>').join("");
  const docBar='<nav class="tbr-docs" aria-label="مستندات التقارير">'+DOCS.map(([k,l])=>'<button type="button" data-doc="'+k+'" aria-pressed="'+(doc===k)+'">'+esc(l)+'</button>').join("")+'</nav>';
  const body=doc==="annual"||doc==="release"||doc==="auditor"?docView(c,doc):doc==="statements"?fsStatements(c,p,fs,d,f,hl,GROUP):doc==="analysis"?fsAnalysis(c,p,fs,d,f,hl,GROUP):fsIssue(c,p,fs,d,f,hl,GROUP);
  return docBar+'<section class="card tbr-op"><div class="card-b"><div class="tbr-op-h"><div><span class="eyebrow">رأي المراجع — مشتق وفق '+esc(d.isa)+'</span><h3>'+esc(d.ar)+'</h3>'+d.basis.map(x=>'<p>'+esc(x)+'</p>').join("")+(d.goingConcern?'<p class="tbr-warn">مؤشرات استمرارية تتطلب تقييماً وإفصاحاً (ISA 570).</p>':'')+'</div>'+
      '<div class="tbr-op-s">'+(f?'<small>اقتراح Gemini</small><b>'+esc(f.aiOpinion||"—")+'</b>':'<small>لا يوجد تقرير Gemini نهائي</small>')+'<small class="hint">لا يصدر الرأي إلا باعتماد الشريك المسؤول.</small></div></div>'+
      '<div class="sk-actions"><div class="sk-seg" role="group"><button type="button" data-fsv="after" aria-pressed="'+fsAfter+'">بعد التسويات ('+c.accepted.length+')</button><button type="button" data-fsv="before" aria-pressed="'+!fsAfter+'">قبل التسويات</button></div>'+
      '<button type="button" class="btn primary" data-a="print">طباعة المستند</button><button type="button" class="btn" data-a="jev-op">'+SK.icon("jev")+' رأي ثانٍ من Jev</button><button type="button" class="btn" data-a="fs-csv">تصدير القوائم</button></div></div></section>'+
    body;
}
function fsIssue(c,p,fs,d,f,hl,GROUP){
  return ''+
    programmeCard(c)+disclosuresCard(c)+
    (f?'<section class="card"><div class="card-h"><div><h3>'+esc(f.headline||"ملخص التقرير")+'</h3><p>التقرير النهائي من Gemini · '+esc(f.at.slice(0,10))+'</p></div></div><div class="card-b"><p>'+esc(f.summary)+'</p>'+(f.limitations.length?'<h4>القيود على النطاق</h4><ul>'+f.limitations.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ul>':'')+'</div></section>':'')+
    '<section class="card"><div class="card-h"><div><h3>الأمور الرئيسية للمراجعة (ISA 701)</h3></div></div><div class="card-b">'+(kamsOf(c).map(k=>'<div class="tbr-kam"><b>'+esc(k.title)+'</b><p><small>لماذا:</small> '+esc(k.why)+'</p><p><small>كيف عولج:</small> '+esc(k.how)+'</p></div>').join("")||'<p class="empty">لا مخاطر جوهرية مصنفة.</p>')+'</div></section>'+
    (f&&f.letter.length?'<section class="card"><div class="card-h"><div><h3>خطاب الإدارة</h3></div></div><div class="card-b">'+f.letter.map(x=>'<div class="tbr-kam"><b>'+esc(x.title)+' <span class="sksev '+(x.priority==="عالية"?"bad":x.priority==="متوسطة"?"warn":"info")+'">'+esc(x.priority)+'</span></b><p>'+esc(x.observation)+'</p><p><small>التوصية:</small> '+esc(x.recommendation)+'</p></div>').join("")+'</div></section>':'')+
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
  return ''+
    '<h3 class="tbr-sec">السنة في لمحة</h3><div class="skk4 tbr-hl">'+hl+'</div>'+
    '<div class="tbr-2"><section class="card"><div class="card-h"><div><h3>قائمة الربح أو الخسارة</h3><p>عرض IFRS 18: التشغيل ← الاستثمار ← التمويل ← الزكاة</p></div></div><div class="card-b">'+stmt(fs.pl,p.hp)+'</div></section>'+
      '<section class="card"><div class="card-h"><div><h3>قائمة المركز المالي</h3><p>'+(fs.checks.balanced?'متوازنة':'فرق '+sar(fs.checks.difference))+'</p></div></div><div class="card-b">'+stmt(fs.sfp,p.hp)+'</div></section></div>'+
    '<section class="card"><div class="card-h"><div><h3>قائمة التغيرات في حقوق الملكية</h3></div></div><div class="card-b tbr-tw"><table class="sk-table tbr-fs" data-sk-plain><thead><tr><th></th>'+fs.soce.columns.map(x=>'<th>'+esc(x)+'</th>').join("")+'</tr></thead><tbody>'+fs.soce.rows.map((r,i)=>'<tr class="'+(i===fs.soce.rows.length-1?'total':'')+'"><td>'+esc(r.ar)+'</td>'+r.values.map(v=>'<td class="num">'+m0(v)+'</td>').join("")+'</tr>').join("")+'</tbody></table></div></section>'+
    '<section class="card"><div class="card-h"><div><h3>قائمة التدفقات النقدية (الطريقة غير المباشرة)</h3><p>'+(fs.cf?(fs.checks.cashTies?'تطابق حركة النقد':'فرق '+sar(fs.checks.cfDifference)):'تتطلب أرصدة السنة السابقة')+'</p></div></div><div class="card-b">'+(fs.cf?stmt(fs.cf,false):'<p class="empty">أضف عمود السنة السابقة في الميزان لاشتقاق القائمة.</p>')+'</div></section>'+
    '<section class="card"><div class="card-h"><div><h3>الإيضاحات</h3><p>إيضاح لكل بند بالحسابات التي كوّنته.</p></div></div><div class="card-b tbr-notes">'+fs.notes.map(n=>{const l=n.lineKey&&fs.lines.find(x=>x.key===n.lineKey);
      return '<details><summary><span class="mono">'+n.no+'</span> '+esc(n.ar)+(l?' — '+sar(l.current):'')+'</summary>'+(l?'<table class="sk-table" data-sk-plain><tbody>'+l.accounts.map(a=>'<tr><td class="mono">'+esc(a.code)+'</td><td>'+esc(a.name)+'</td><td class="num">'+m0(a.current)+'</td>'+(fs.hasPrior?'<td class="num">'+(a.prior===null?'':m0(a.prior))+'</td>':'')+'</tr>').join("")+'</tbody></table><p class="hint">المعايير: '+esc(l.standards.join("، "))+'</p>':'<p class="hint">'+esc(policyNote(n.no,c))+'</p>')+'</details>'}).join("")+'</div></section>';

}

function policyNote(no,c){
  const ctx=c.d.ctx;
  return no===1?(ctx.company||"المنشأة")+(ctx.activity?' — '+ctx.activity:'')+'. '+(ctx.period||''):
    no===2&&egypt(c.d)?'أُعدت القوائم وفق معايير المحاسبة المصرية الصادرة بقرارات وزير الاستثمار وتعديلاتها وفي ضوء القوانين واللوائح المصرية السارية، على أساس التكلفة التاريخية ما لم يُذكر خلاف ذلك، وبالجنيه المصري.':
    no===2?'أُعدت القوائم وفق '+(ctx.framework==="SME"?'المعيار الدولي للتقرير المالي للمنشآت الصغيرة ومتوسطة الحجم':'المعايير الدولية للتقرير المالي')+' المعتمدة في المملكة العربية السعودية والمعايير والإصدارات الأخرى المعتمدة من SOCPA، على أساس التكلفة التاريخية ما لم يُذكر خلاف ذلك، وبالريال السعودي.':
    no===3&&egypt(c.d)?'الإيراد عند انتقال السيطرة (معيار 48)؛ المخزون بالتكلفة أو صافي القيمة البيعية (معيار 2)؛ الأصول الثابتة بالتكلفة ناقصاً الإهلاك (معيار 10)؛ عقود التأجير (معيار 49)؛ ضريبة الدخل الجارية والمؤجلة (معيار 24)؛ الأدوات المالية وخسائر الائتمان المتوقعة (معيار 47).':
    no===3?'الإيراد عند انتقال السيطرة (IFRS 15)؛ المخزون بالتكلفة أو صافي القيمة القابلة للتحقق (IAS 2)؛ الممتلكات بالتكلفة ناقصاً الاستهلاك (IAS 16)؛ الإيجارات (IFRS 16)؛ مكافأة نهاية الخدمة (IAS 19)؛ الزكاة وفق لائحة 1445هـ؛ الأدوات المالية بالتكلفة المطفأة مع خسائر ائتمانية متوقعة (IFRS 9).':
    'التقديرات الهامة: الخسائر الائتمانية المتوقعة، صافي القيمة القابلة للتحقق للمخزون، الأعمار الإنتاجية، مخصص الزكاة، التزام نهاية الخدمة.';
}

/* ---------- print & export ---------- */
function printReport(c){
  const w=window.open("","_blank");if(!w){toast("اسمح بالنوافذ المنبثقة لطباعة التقرير","warn");return}
  const p=reportParts(c),fs=p.fs,d=c.derived,ctx=c.d.ctx,f=c.session&&c.session.final;
  const tbl=(rows,hp)=>'<table><tr><th></th><th>إيضاح</th><th>'+(hp?'الحالية':'المبلغ')+'</th>'+(hp?'<th>السابقة</th>':'')+'</tr>'+rows.map(r=>r.level==="heading"?'<tr><td colspan="4"><b>'+esc(r.ar)+'</b></td></tr>':'<tr'+(r.level!=="line"?' style="font-weight:700"':'')+'><td>'+esc(r.ar)+'</td><td>'+(r.note||'')+'</td><td>'+m0(r.current)+'</td>'+(hp?'<td>'+(r.prior===null?'':m0(r.prior))+'</td>':'')+'</tr>').join("")+'</table>';
  let b='<h1>تقرير مراجعة ميزان المراجعة</h1><p><b>'+esc(ctx.company||"")+'</b> — '+esc(ctx.period||"")+' — '+esc(FW_LABEL[c.fw])+'</p>'+
    '<h2>الرأي المشتق ('+esc(d.isa)+')</h2><p><b>'+esc(d.ar)+'</b></p>'+d.basis.map(x=>'<p>'+esc(x)+'</p>').join("")+(f?'<p>اقتراح Gemini: '+esc(f.aiOpinion)+'</p><p>'+esc(f.summary)+'</p>':'')+
    '<h2>برنامج المراجعة</h2><table><tr><th>المرحلة</th><th>الحالة</th><th>التفاصيل</th></tr>'+c.programme.map(x=>'<tr><td>'+esc(x.id+' '+x.title)+'</td><td>'+esc(x.status)+'</td><td>'+esc(x.detail)+'</td></tr>').join("")+'</table>'+
    '<p>جاهزية الإفصاحات: '+(c.disclosures.valid?'جاهزة للمراجعة البشرية':'غير مكتملة — '+c.disclosures.checks.filter(k=>k.status==="fail").map(k=>esc(k.label)).join("، "))+'</p>'+
    '<h2>الأمور الرئيسية للمراجعة</h2>'+kamsOf(c).map(k=>'<p><b>'+esc(k.title)+'</b> — '+esc(k.why)+' '+esc(k.how)+'</p>').join("")+
    '<h2>القوائم المالية '+(fsAfter?'بعد التسويات المعتمدة':'قبل التسويات')+'</h2><h3>الربح أو الخسارة</h3>'+tbl(fs.pl,p.hp)+'<h3>المركز المالي</h3>'+tbl(fs.sfp,p.hp)+(fs.cf?'<h3>التدفقات النقدية</h3>'+tbl(fs.cf,false):'')+
    '<h2>قيود التسوية</h2>'+(c.pool.length?c.pool.map(a=>'<p><b>'+esc(a.id)+' '+esc(a.title)+'</b> ('+esc(a.standard)+') — '+(c.d.accepted.includes(a.id)?'معتمد':c.d.rejected.includes(a.id)?'مرفوض':'مقترح')+'</p><table><tr><th>الحساب</th><th>مدين</th><th>دائن</th></tr>'+a.lines.map(l=>'<tr><td>'+esc(l.code+' '+l.name)+'</td><td>'+(l.debit?m0(l.debit):'')+'</td><td>'+(l.credit?m0(l.credit):'')+'</td></tr>').join("")+'</table>').join(""):'<p>لا قيود.</p>')+
    '<h2>مناقشة الامتثال للمعايير</h2><table><tr><th>المعيار</th><th>الحكم</th><th>المناقشة</th></tr>'+c.all.compliance.map(x=>'<tr><td>'+esc(x.code+' '+x.title)+'</td><td>'+esc(x.status)+'</td><td>'+esc(x.discussion)+'</td></tr>').join("")+'</table>'+
    '<h2>الملاحظات</h2><table><tr><th>الأثر</th><th>الملاحظة</th><th>المعيار</th><th>الأساس</th><th>الإجراء</th></tr>'+c.all.findings.map(x=>'<tr><td>'+SEV_AR[x.severity]+'</td><td>'+esc(x.title+(x.account?' — '+x.account:''))+'</td><td>'+esc(x.standard)+'</td><td>'+esc(x.basis)+'</td><td>'+esc(x.action)+'</td></tr>').join("")+'</table>'+
    '<h2>تقرير الإدارة</h2>'+p.md.map(s=>'<h3>'+esc(s.title)+'</h3>'+s.body.map(x=>'<p>'+esc(x)+'</p>').join("")).join("")+
    (f&&f.letter.length?'<h2>خطاب الإدارة</h2>'+f.letter.map(x=>'<p><b>'+esc(x.title)+'</b> ('+esc(x.priority)+'): '+esc(x.observation)+' — '+esc(x.recommendation)+'</p>').join(""):'')+
    '<p style="margin-top:24px;font-size:11px;color:#667">الرأي مسودة مشتقة آلياً وفق ISA 705 ولا يصدر إلا باعتماد الشريك المسؤول. الأرقام محسوبة من ميزان المراجعة بالهللة؛ ملاحظات Gemini حكم مساعد يُراجع مهنياً.</p>';
  w.document.open();w.document.write('<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>تقرير مراجعة ميزان المراجعة</title></head><body>'+b+'</body></html>');w.document.close();
  SK.brandPrint(w,"تقرير مراجعة ميزان المراجعة");
  const s=w.document.createElement("style");s.textContent="table{width:100%;border-collapse:collapse;margin:6px 0 14px;font-size:11.5px}th,td{border:1px solid #dfe6ef;padding:4px 7px;text-align:right}th{background:#f3f6fa}td:nth-child(n+3){direction:ltr;text-align:left}h2{margin-top:18px}";w.document.head.appendChild(s);
  SK.audit&&SK.audit.log("report",{act:"tbreview-print"});
  setTimeout(()=>{try{w.focus();w.print()}catch{}},700);
}
function printDoc(c,kind){
  const w=window.open("","_blank");if(!w){toast("اسمح بالنوافذ المنبثقة للطباعة","warn");return}
  const title={annual:"التقرير السنوي",release:"بيان النتائج",auditor:"تقرير المراجع المستقل"}[kind]+" — "+(c.d.ctx.company||"");
  w.document.open();w.document.write('<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>'+esc(title)+'</title></head><body>'+SKosifReportDocs[kind](docX(c))+'</body></html>');w.document.close();
  SK.brandPrint(w,title);
  const st=w.document.createElement("style");st.textContent=SKosifReportDocs.CSS+"body{background:#fff}";w.document.head.appendChild(st);
  SK.audit&&SK.audit.log("report",{act:"tbreview-"+kind});
  setTimeout(()=>{try{w.focus();w.print()}catch{}},700);
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
function readCtx(d){root.querySelectorAll("[data-ctx]").forEach(i=>{d.ctx[i.dataset.ctx]=i.value.trim()});d.ctx.framework=d.ctx.country==="EG"?"EAS":CX().frameworkApplicability(d.fw||{}).framework;d.ctx.currency=d.ctx.country==="EG"?"الجنيه المصري":"الريال السعودي";return d}
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
  if(!c.tb.ok){toast("الميزان غير صالح","bad");return}
  let d=st(),s=session(d);
  const pend=AI().pendingUploads(s),withData={...s,uploads:await Promise.all(s.uploads.map(async u=>{if(u.round!==s.rounds.length+1)return u;const x=await docGet(docKey(s.id,u)).catch(()=>null);return x?{...u,data:x.data||undefined,text:x.text||undefined}:u}))};
  if(pend.length&&withData.uploads.filter(u=>u.round===s.rounds.length+1&&!u.data&&!u.text).length){toast("بعض المستندات المرفوعة لم تعد متاحة على هذا الجهاز — ارفعها مجدداً","warn")}
  busy="round";abort=new AbortController();paint();
  try{
    const model=SKosifAI.conf().model,api=await SKosifAI.generate(AI().buildRoundBody(withData,c.tb,c.base),{signal:abort.signal,timeout:300000});
    const ex=AI().extractText(api);if(ex.blocked)throw new Error("رفض النموذج الرد لأسباب تتعلق بسياسة المحتوى.");
    const raw=AI().parseJsonLoose(ex.text);if(!raw)throw new Error("رد Gemini لم يكن بالصيغة المتوقعة"+(ex.finishReason?" ("+ex.finishReason+")":"")+" — أعد المحاولة.");
    d=st();s=session(d);s.model=model;
    const r=AI().normalizeRound(raw,s,c.tb,model);
    d.session=AI().addRound(s,r);put(d);
    SK.audit&&SK.audit.log("tbreview",{act:"round",no:r.no,status:r.status,findings:r.findings.length,requests:r.requests.length});
    toast(r.status==="complete"?"أنهى Gemini طلباته — أصدر التقرير النهائي":"انتهت الجولة "+r.no+": "+r.requests.filter(q=>q.round===r.no).length+" طلب جديد","ok");
  }catch(e){toast(e.message,"bad")}
  finally{busy="";abort=null;paint()}
}
async function runFinal(){
  const c=compute();if(!c||busy||!c.session)return;
  busy="final";abort=new AbortController();paint();
  try{
    const api=await SKosifAI.generate(AI().buildFinalBody(c.session,c.tb,c.base,c.derived),{signal:abort.signal,timeout:300000});
    const ex=AI().extractText(api),raw=AI().parseJsonLoose(ex.text);if(!raw)throw new Error("رد Gemini لم يكن بالصيغة المتوقعة — أعد المحاولة.");
    const d=st();d.session={...session(d),final:AI().normalizeFinal(raw,session(d),c.tb)};put(d);tab="fs";
    SK.audit&&SK.audit.log("tbreview",{act:"final"});toast("صدر التقرير النهائي","ok");
  }catch(e){toast(e.message,"bad")}
  finally{busy="";abort=null;paint()}
}
function bind(node){
  window.SKosifAI&&SKosifAI.bindCard(node,()=>paint());
  node.addEventListener("click",async e=>{
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
    const b=e.target.closest("[data-a]");if(!b)return;
    const a=b.dataset.a;
    if(a==="books"){await fromBooks();return}
    if(a==="sample"){const ta=root.querySelector("[data-tbtext]");if(ta)ta.value=TI().SAMPLE_TB_CSV;const co=root.querySelector('[data-ctx="company"]');if(co&&!co.value)co.value="شركة تجريبية للتجارة";const pe=root.querySelector('[data-ctx="period"]');if(pe&&!pe.value)pe.value="السنة المنتهية في 31 ديسمبر 2025";return}
    if(a==="analyze"){const d=readCtx(st()),text=String((root.querySelector("[data-tbtext]")||{}).value||"").trim();if(!text){toast("ارفع ملف الميزان أو الصقه أولاً","warn");return}
      const tb=TI().parseTrialBalance(text);if(!tb.ok){toast("لم أتعرف على أعمدة الميزان — تأكد من وجود رقم الحساب والمدين والدائن","bad");return}
      d.tbText=text;d.session=null;d.accepted=[];d.rejected=[];d.overrides={};put(d);await docClear();tab="tb";setup=false;
      SK.audit&&SK.audit.log("tbreview",{act:"import",accounts:tb.rows.length,balanced:tb.balanced});paint();return}
    if(a==="setup"){setup=!setup;paint();return}
    if(a==="setup-done"){const d=readCtx(st()),mv=Number((root.querySelector("[data-mat]")||{}).value||0);d.materiality=mv>0?Math.round(mv*100):null;put(d);setup=false;paint();return}
    if(a==="reset"){if(!await SK.confirm("بدء مراجعة جديدة يحذف الميزان والجولات والمستندات المرفوعة على هذا الجهاز. هل صدّرت التقرير؟",{danger:true,ok:"مراجعة جديدة"}))return;put(blank());await docClear();tab="tb";setup=false;paint();return}
    if(a==="round"){runRound();return}
    if(a==="final"){runFinal();return}
    if(a==="cancel"){abort&&abort.abort();return}
    if(a==="unavail"){const d=st(),s=session(d),id=b.dataset.id;d.session=s.unavailable.includes(id)?{...s,unavailable:s.unavailable.filter(x=>x!==id)}:AI().markUnavailable(s,id);put(d);paint();return}
    const c=compute();if(!c)return;
    if(a==="print"){if(doc==="annual"||doc==="release"||doc==="auditor")printDoc(c,doc);else printReport(c);return}
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
    if(a==="adj-csv"){SK.csv.download(csvName(c,"قيود-التسوية"),["القيد","البيان","المعيار","المصدر","الحالة","رقم الحساب","اسم الحساب","مدين","دائن"],c.pool.flatMap(x=>x.lines.map(l=>[x.id,x.title,x.standard,x.source==="gemini"?"Gemini":"المحرك",c.d.accepted.includes(x.id)?"معتمد":c.d.rejected.includes(x.id)?"مرفوض":"مقترح",l.code,l.name,(l.debit/100).toFixed(2),(l.credit/100).toFixed(2)])));return}
    if(a==="pbc-csv"){SK.csv.download(csvName(c,"قائمة-المستندات"),["الرقم","المستند","الغرض","الأولوية","المعيار","الحسابات"],c.base.requests.map(q=>[q.id,q.title,q.purpose,q.priority,q.standard,(q.accounts||[]).join(" ")]));return}
    if(a==="fs-csv"){const fs=fsAfter?c.fsAfterAdj:c.fsBefore,rows=[...fs.pl.map(r=>["الربح أو الخسارة",r]),...fs.sfp.map(r=>["المركز المالي",r]),...(fs.cf||[]).map(r=>["التدفقات النقدية",r])].filter(([,r])=>r.level!=="heading");
      SK.csv.download(csvName(c,"القوائم-المالية"),["القائمة","البند","إيضاح","الحالية","السابقة"],rows.map(([s,r])=>[s,r.ar,r.note||"",(r.current/100).toFixed(2),r.prior===null?"":(r.prior/100).toFixed(2)]));return}
  });
  node.addEventListener("change",e=>{
    const f=e.target.closest("[data-tbfile]");if(f&&f.files[0]){loadFile(f.files[0]);f.value="";return}
    const u=e.target.closest("[data-up]");if(u&&u.files.length){upload(u.dataset.up,Array.from(u.files));u.value="";return}
    const o=e.target.closest("[data-ov]");if(o){const d=st();if(o.value)d.overrides[o.dataset.ov]=o.value;else delete d.overrides[o.dataset.ov];put(d);paint();return}
    const cf=e.target.closest("[data-conf]");if(cf){const d=st();d.confirm={...d.confirm,[cf.dataset.conf]:cf.checked};put(d);paint();return}
    const co=e.target.closest('[data-ctx="country"]');if(co){put(readCtx(st()));paint();return}
    const w=e.target.closest("[data-fw]");if(w){const d=readCtx(st());d.fw={...d.fw,[w.dataset.fw]:w.checked};d.ctx.framework=d.ctx.country==="EG"?"EAS":CX().frameworkApplicability(d.fw).framework;put(d);paint();return}
  });
}
function paint(){
  if(!root)return;
  if(!window.SKEngines||!SKEngines.audit||!SKEngines.audit.tbReview){root.innerHTML='<p class="empty">محركات المراجعة غير محملة.</p>';return}
  let c=null;try{c=compute()}catch(e){SK.errors&&SK.errors.report(e,"tbreview");root.innerHTML=hero(null)+'<p class="empty">تعذر تحليل الميزان: '+esc(e.message)+'</p>'+setupHTML(st(),true);return}
  const y=window.scrollY;
  if(!c){root.innerHTML=hero(null)+setupHTML(st(),true)+(window.SKosifAI&&!SKosifAI.ready()?SKosifAI.cardHTML():'');return}
  const body=tab==="ai"?aiTab(c):tab==="docs"?docsTab(c):tab==="adj"?adjTab(c):tab==="fs"?fsTab(c):tbTab(c);
  root.innerHTML='<div class="tbr">'+hero(c)+(setup?setupHTML(c.d,false):'')+body+'</div>';
  window.scrollTo(0,y);
}
SK.view("tbreview",{render(node){root=node;if(!node.dataset.bound){bind(node);node.dataset.bound="1"}paint()}});
})();
