/* Reporting assistant intake — receive external financial data, identify gaps and build deterministic statements from a trial balance. */
(()=>{
"use strict";
const {esc,toast}=SK,CP=()=>window.SKosifCompanyPlatform;
const typeLabel={"trial-balance":"ميزان مراجعة","general-ledger":"دفتر أستاذ","bank-statement":"كشف بنك",aging:"أعمار الذمم",inventory:"مخزون","fixed-assets-register":"سجل أصول",payroll:"رواتب",sales:"مبيعات",purchases:"مشتريات","tax-document":"ضريبة/زكاة","financial-statements":"قوائم مالية",contract:"عقد",invoice:"فاتورة",other:"أخرى"};
const sarMinor=v=>(Number(v||0)/100).toLocaleString("ar-SA",{maximumFractionDigits:2});
function statusHTML(){
  const s=CP().reportingStatus(),targets=CP().reportTargets();
  return '<section class="card"><div class="card-h"><div><span class="eyebrow">REPORTING ASSISTANT</span><h2>مساعد إعداد القوائم والتقارير</h2><p>ارفع بياناتك من أي نظام محاسبي. KOSIF يحدد الناقص، ثم يبني المخرجات من البيانات المتاحة دون اختراع أرقام.</p></div><span class="sk-pill '+(s.missing.length?"warn":"good")+'">'+(s.missing.length?"ناقص "+s.missing.length:"الحد الأدنى مكتمل")+'</span></div><div class="card-b sk-stack">'+
  '<label class="sk-field"><span>المخرج المطلوب</span><select id="ri-target">'+Object.entries(targets).map(([id,x])=>'<option value="'+id+'"'+(id===s.target?' selected':'')+'>'+esc(x.label)+'</option>').join("")+'</select></label>'+
  '<div class="sk-note"><b>المطلوب:</b> '+s.requires.map(x=>esc(typeLabel[x]||x)).join("، ")+'<br><b>الناقص الآن:</b> '+(s.missing.length?s.missing.map(x=>esc(typeLabel[x]||x)).join("، "):"لا شيء في الحد الأدنى")+'<br><small>قد يطلب النظام مستندات إضافية لتحسين التدفقات النقدية والإيضاحات والتحليل.</small></div>'+
  '<label class="dropzone"><input id="ri-files" type="file" multiple accept=".csv,.tsv,.txt,.xlsx,.pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"><strong>اسحب أو اختر ملفات الشركة</strong><span>XLSX · CSV · PDF · Word · صور</span><small>تُحفظ بصمة SHA-256 ومصدر الملف. لا يتحول أي ملف إلى دليل مراجعة إلا بأمر صريح.</small></label>'+
  '<div class="sk-actions"><button type="button" class="btn primary" id="ri-build">بناء القوائم من ميزان CSV/TXT/XLSX</button><button type="button" class="btn" id="ri-audit">فتح المراجعة الذكية</button></div>'+
  lastHTML(s)+'</div></section>';
}
function lastHTML(s){
  const t=s.lastTrialBalance,f=s.lastStatements;if(!t)return'<div class="sk-note">لم تُبنَ قوائم بعد. ارفع ميزان مراجعة بصيغة CSV/TXT ثم اختر «بناء القوائم».</div>';
  return '<div class="sk-kpis"><div class="sk-kpi"><span>الحسابات</span><b>'+esc(t.rows)+'</b><small>'+esc(t.sourceName||"")+'</small></div><div class="sk-kpi"><span>اتزان الميزان</span><b>'+(t.balanced?"نعم":"لا")+'</b><small>أخطاء '+esc(t.errors)+'</small></div><div class="sk-kpi"><span>التصنيف</span><b>'+esc(f?.mappedPct??0)+'%</b><small>غير مربوط '+esc(f?.unmapped??0)+'</small></div></div>'+
  (f&&f.keys?'<div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>المؤشر</th><th>القيمة</th></tr></thead><tbody>'+
  [["الإيرادات","revenue"],["مجمل الربح","gross"],["الربح التشغيلي","operating"],["صافي الربح","profit"],["الأصول","assets"],["الالتزامات","liabilities"],["حقوق الملكية","equity"]].map(([l,k])=>'<tr><td>'+l+'</td><td class="n">'+sarMinor(f.keys[k]?.current)+'</td></tr>').join("")+'</tbody></table></div>':"");
}
function mpmHTML(){
  const st=CP().state(),suggested=st.reporting?.suggestedMeasures||[],registered=CP().mpms(),subs=CP().mpmSubtotals();
  if(!st.reporting?.lastStatements)return '<section class="card"><div class="card-h"><div><h3>IFRS 18 — مقاييس الأداء المحددة من الإدارة</h3><p>ابنِ القوائم أولًا حتى نستطيع مطابقة المقاييس مع المجاميع.</p></div></div></section>';
  const regKeys=new Set(registered.map(x=>x.sourceKey));
  const suggestions=suggested.length?suggested.map(m=>'<div class="tbr-req"><div class="tx"><b>'+esc(m.name)+'</b><small>'+sarMinor(m.value)+' · '+esc(m.note||"")+'</small></div><div class="tbr-req-m">'+
    (m.ifrs18Candidate?'<span class="sksev warn">مرشح MPM</span>'+(regKeys.has(m.key)?'<span class="sksev ok">مسجل</span>':'<button type="button" class="btn sm" data-ri-mpm-register="'+esc(m.key)+'">سجل كمقياس MPM</button>'):'<span class="sksev info">KPI — ليس MPM تلقائيًا</span>')+'</div></div>').join(""):'<div class="sk-note">لا توجد مقاييس مشتقة من البيانات الحالية.</div>';
  const rows=registered.length?registered.map(m=>{const r=CP().mpmReconciliation(m.id),diff=r&&r.difference!=null?sarMinor(r.difference):"—";return '<tr><td><b>'+esc(m.name)+'</b><small>'+esc(m.communicationSource)+'</small></td><td>'+esc(r?.nearestLabel||subs[m.nearestSubtotal]||m.nearestSubtotal)+'</td><td class="n">'+(r?.measure?sarMinor(r.measure.value):"—")+'</td><td class="n">'+(r?.nearestValue!=null?sarMinor(r.nearestValue):"—")+'</td><td class="n">'+diff+'</td><td>'+(m.approved?'<span class="sksev ok">معتمد بشريًا</span>':'<span class="sksev warn">مسودة</span>')+'</td><td><button type="button" class="linkish" data-ri-mpm-approve="'+esc(m.id)+'">'+(m.approved?'إلغاء الاعتماد':'اعتماد')+'</button> · <button type="button" class="linkish danger" data-ri-mpm-del="'+esc(m.id)+'">حذف</button></td></tr>'}).join(""):"";
  return '<section class="card"><div class="card-h"><div><span class="eyebrow">IFRS 18</span><h3>مقاييس الأداء المحددة من الإدارة (MPM)</h3><p>المحرك يقترح فقط. التسجيل يحتاج مصدر استخدام عام وسببًا، ثم تتم المطابقة حتميًا مع أقرب subtotal؛ الاعتماد بشري.</p></div><span class="sk-pill">'+registered.length+' مسجل</span></div><div class="card-b sk-stack">'+
    '<div class="tbr-reqs">'+suggestions+'</div>'+
    (rows?'<div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>المقياس</th><th>أقرب مجموع IFRS</th><th>المقياس</th><th>المجموع</th><th>فرق المطابقة</th><th>الحالة</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>':'<div class="sk-note">لم تسجل الإدارة MPM بعد.</div>')+
    '<p class="hint">وجود KPI في تقرير الإدارة لا يجعله تلقائيًا MPM وفق IFRS 18. يجب تقييم تعريف المعيار ونطاق الاتصالات العامة.</p></div></section>';
}
async function registerSuggestedMpm(key,root){
  const st=CP().state(),m=(st.reporting?.suggestedMeasures||[]).find(x=>x.key===key);if(!m)return toast("لم أجد المقياس المقترح","warn");
  if(!m.ifrs18Candidate)return toast("هذا المقياس ليس مرشح MPM تلقائيًا في هذا المسار","warn");
  const opts=Object.entries(CP().mpmSubtotals()).map(([id,label])=>[id,label]);
  const v=await SK.form("تسجيل MPM — "+m.name,[
    {key:"purpose",label:"لماذا ترى الإدارة أن هذا المقياس يعبّر عن جانب من الأداء؟",type:"textarea",required:true},
    {key:"communicationSource",label:"أين يُستخدم في الاتصالات العامة؟",placeholder:"مثال: بيان النتائج / عرض المستثمرين",required:true},
    {key:"nearestSubtotal",label:"أقرب مجموع IFRS للمطابقة",type:"select",value:m.nearestSubtotal||"operating",options:opts}
  ],{ok:"تسجيل كمسودة",message:"التسجيل لا يعني أن المقياس مستوفٍ تلقائيًا لمتطلبات IFRS 18، ولا يعتمد الإفصاح دون مراجعة بشرية."});
  if(!v)return;
  try{CP().registerMpm({name:m.name,sourceKey:m.key,purpose:v.purpose,communicationSource:v.communicationSource,nearestSubtotal:v.nearestSubtotal,method:m.note});toast("سُجل المقياس كمسودة IFRS 18","ok");paint(root)}catch(err){toast(err.message,"bad")}
}
function lineageHTML(){
  const rows=CP().lineage(30);if(!rows.length)return "";
  const label=t=>({"document":"مستند","report-run":"تشغيل قوائم","mpm":"MPM","audit-handoff":"تسليم مراجعة","pbc-request":"طلب PBC"}[t]||t);
  return '<section class="card"><div class="card-h"><div><h3>سجل التتبع</h3><p>روابط مصدر → نتيجة داخل الشركة الحالية. هذا السجل لا يعتمد النتيجة؛ يثبت فقط من أين جاءت وإلى أين انتقلت.</p></div><span class="sk-pill">'+rows.length+' رابط</span></div><div class="card-b"><div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>من</th><th>العلاقة</th><th>إلى</th><th>الوقت</th></tr></thead><tbody>'+
    rows.slice().reverse().map(x=>'<tr><td>'+esc(label(x.fromType))+'<small>'+esc(x.fromId)+'</small></td><td>'+esc(x.relation)+(x.sourceHash?'<small>SHA '+esc(x.sourceHash.slice(0,12))+'</small>':'')+'</td><td>'+esc(label(x.toType))+'<small>'+esc(x.toId)+'</small></td><td class="n">'+esc((x.at||"").slice(0,16).replace("T"," "))+'</td></tr>').join("")+
    '</tbody></table></div></div></section>';
}
function docsHTML(){
  const docs=CP().documents();if(!docs.length)return'<section class="card"><div class="card-b">'+SK.ui.state.empty("لا ملفات مرفوعة","ارفع ملفاتك من البطاقة أعلاه.")+'</div></section>';
  return '<section class="card"><div class="card-h"><div><h3>مصادر الشركة</h3><p>كل ملف يحمل نوعًا وبصمة ومصدرًا. الإرسال للمراجعة اختياري وصريح.</p></div></div><div class="card-b"><div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>الملف</th><th>النوع</th><th>الحجم</th><th>البصمة</th><th></th></tr></thead><tbody>'+
  docs.map(d=>'<tr><td><b>'+esc(d.name)+'</b><small>'+esc(d.importedAt.slice(0,16).replace("T"," "))+'</small></td><td><select data-ri-type="'+d.id+'" aria-label="نوع '+esc(d.name)+'">'+Object.entries(typeLabel).map(([id,label])=>'<option value="'+id+'"'+(id===d.type?' selected':'')+'>'+esc(label)+'</option>').join("")+'</select></td><td class="n">'+Math.ceil(d.size/1024)+' KB</td><td class="n" title="'+esc(d.sha256||"")+'">'+esc((d.sha256||"").slice(0,12)||"—")+'</td><td><button type="button" class="linkish" data-ri-review="'+d.id+'">أرسل للمراجعة</button> · <button type="button" class="linkish danger" data-ri-del="'+d.id+'">حذف</button></td></tr>').join("")+
  '</tbody></table></div></div></section>';
}
function paint(root){root.innerHTML=statusHTML()+mpmHTML()+docsHTML()+lineageHTML()}
async function build(root){
  const docs=CP().documents().filter(d=>d.type==="trial-balance"&&/\.(csv|tsv|txt|xlsx)$/i.test(d.name));
  if(!docs.length){toast("ارفع ميزان مراجعة CSV/TXT/XLSX أولًا","warn");return}
  const pick=docs[docs.length-1];
  try{
    const db=await new Promise((res,rej)=>{const q=indexedDB.open("skosif-company-documents-v1",1);q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)}),
      rec=await new Promise((res,rej)=>{const tx=db.transaction("documents","readonly"),q=tx.objectStore("documents").get(pick.id);q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)});db.close();
    if(!rec?.blob||rec.companyId!==SK.company.current().id)throw new Error("تعذر قراءة الملف داخل مساحة هذه الشركة");
    const text=/\.xlsx$/i.test(pick.name)?await SKXlsx.toTsv(rec.blob):await rec.blob.text(),tb=SKEngines.reports.tbImport.parseTrialBalance(text);
    if(!tb.ok)throw new Error("لم يمكن قراءة ميزان المراجعة");
    if(!tb.balanced){toast("الميزان غير متزن؛ تم التحليل لكن لن نعرضه كقوائم جاهزة للاعتماد","warn")}
    const fs=SKEngines.reports.statements.buildStatements(tb,{}, {tax:CP().profile().taxMode});
    const measures=SKEngines.reports.annualReport&&SKEngines.reports.annualReport.performanceMeasures?SKEngines.reports.annualReport.performanceMeasures(fs):[];
    CP().saveReportResult(tb,fs,pick.name,measures,pick.id);paint(root);
    toast("تم بناء القوائم حتميًا من "+tb.rows.length+" حسابًا","ok");
  }catch(e){toast(e.message||String(e),"bad")}
}
function bind(root){
  if(root.dataset.riBound==="1")return;root.dataset.riBound="1";
  root.addEventListener("change",async e=>{
    if(e.target.id==="ri-target"){CP().reportingTarget(e.target.value);paint(root)}
    if(e.target.matches("[data-ri-type]")){try{CP().setDocumentType(e.target.dataset.riType,e.target.value);toast("تم تحديث نوع المستند","ok");paint(root)}catch(err){toast(err.message,"bad")}}
    if(e.target.id==="ri-files"&&e.target.files?.length){try{await CP().ingestFiles(e.target.files,"reporting");toast("تم حفظ "+e.target.files.length+" ملف/ملفات مع البصمة","ok");paint(root)}catch(err){toast(err.message,"bad")}}
  });
  root.addEventListener("click",async e=>{
    if(e.target.closest("#ri-build")){await build(root);return}
    if(e.target.closest("#ri-audit")){window.SKosifCore&&SKosifCore.go("tbreview");return}
    const reg=e.target.closest("[data-ri-mpm-register]");if(reg){await registerSuggestedMpm(reg.dataset.riMpmRegister,root);return}
    const app=e.target.closest("[data-ri-mpm-approve]");if(app){const m=CP().mpms().find(x=>x.id===app.dataset.riMpmApprove);if(m){CP().approveMpm(m.id,!m.approved);toast(m.approved?"أُلغي اعتماد المقياس":"اعتمد المستخدم المقياس","ok");paint(root)}return}
    const md=e.target.closest("[data-ri-mpm-del]");if(md&&await SK.confirm("حذف تعريف MPM من الشركة؟",{danger:true,ok:"حذف"})){CP().removeMpm(md.dataset.riMpmDel);paint(root);return}
    const hand=e.target.closest("[data-ri-review]");if(hand){if(await SK.confirm("إرسال مرجع هذا المستند إلى ملف المراجعة؟ لن يُعتبر دليلًا مقبولًا قبل فحصه واعتماده.",{ok:"إرسال"})){CP().requestAuditHandoff(hand.dataset.riReview);toast("أُضيف إلى قائمة التسليم للمراجعة","ok")}return}
    const del=e.target.closest("[data-ri-del]");if(del&&await SK.confirm("حذف الملف من مخزن هذه الشركة؟",{danger:true,ok:"حذف"})){await CP().removeDocument(del.dataset.riDel);paint(root)}
  });
}
SK.view("reportingintake",{render(root){if(!CP()){root.innerHTML=SK.ui.state.error("تعذر تحميل طبقة بيانات الشركة");return}bind(root);paint(root)}});
})();