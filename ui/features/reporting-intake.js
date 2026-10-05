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
  '<label class="dropzone"><input id="ri-files" type="file" multiple accept=".csv,.tsv,.txt,.xlsx,.xls,.pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"><strong>اسحب أو اختر ملفات الشركة</strong><span>Excel · CSV · PDF · Word · صور</span><small>تُحفظ بصمة SHA-256 ومصدر الملف. لا يتحول أي ملف إلى دليل مراجعة إلا بأمر صريح.</small></label>'+
  '<div class="sk-actions"><button type="button" class="btn primary" id="ri-build">بناء القوائم من ميزان CSV/TXT</button><button type="button" class="btn" id="ri-audit">فتح المراجعة الذكية</button></div>'+
  lastHTML(s)+'</div></section>';
}
function lastHTML(s){
  const t=s.lastTrialBalance,f=s.lastStatements;if(!t)return'<div class="sk-note">لم تُبنَ قوائم بعد. ارفع ميزان مراجعة بصيغة CSV/TXT ثم اختر «بناء القوائم».</div>';
  return '<div class="sk-kpis"><div class="sk-kpi"><span>الحسابات</span><b>'+esc(t.rows)+'</b><small>'+esc(t.sourceName||"")+'</small></div><div class="sk-kpi"><span>اتزان الميزان</span><b>'+(t.balanced?"نعم":"لا")+'</b><small>أخطاء '+esc(t.errors)+'</small></div><div class="sk-kpi"><span>التصنيف</span><b>'+esc(f?.mappedPct??0)+'%</b><small>غير مربوط '+esc(f?.unmapped??0)+'</small></div></div>'+
  (f&&f.keys?'<div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>المؤشر</th><th>القيمة</th></tr></thead><tbody>'+
  [["الإيرادات","revenue"],["مجمل الربح","gross"],["الربح التشغيلي","operating"],["صافي الربح","profit"],["الأصول","assets"],["الالتزامات","liabilities"],["حقوق الملكية","equity"]].map(([l,k])=>'<tr><td>'+l+'</td><td class="n">'+sarMinor(f.keys[k]?.current)+'</td></tr>').join("")+'</tbody></table></div>':"");
}
function docsHTML(){
  const docs=CP().documents();if(!docs.length)return'<section class="card"><div class="card-b">'+SK.ui.state.empty("لا ملفات مرفوعة","ارفع ملفاتك من البطاقة أعلاه.")+'</div></section>';
  return '<section class="card"><div class="card-h"><div><h3>مصادر الشركة</h3><p>كل ملف يحمل نوعًا وبصمة ومصدرًا. الإرسال للمراجعة اختياري وصريح.</p></div></div><div class="card-b"><div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>الملف</th><th>النوع</th><th>الحجم</th><th>البصمة</th><th></th></tr></thead><tbody>'+
  docs.map(d=>'<tr><td><b>'+esc(d.name)+'</b><small>'+esc(d.importedAt.slice(0,16).replace("T"," "))+'</small></td><td>'+esc(typeLabel[d.type]||d.type)+'</td><td class="n">'+Math.ceil(d.size/1024)+' KB</td><td class="n" title="'+esc(d.sha256||"")+'">'+esc((d.sha256||"").slice(0,12)||"—")+'</td><td><button type="button" class="linkish" data-ri-review="'+d.id+'">أرسل للمراجعة</button> · <button type="button" class="linkish danger" data-ri-del="'+d.id+'">حذف</button></td></tr>').join("")+
  '</tbody></table></div></div></section>';
}
function paint(root){root.innerHTML=statusHTML()+docsHTML()}
async function build(root){
  const docs=CP().documents().filter(d=>d.type==="trial-balance"&&/\.(csv|tsv|txt)$/i.test(d.name));
  if(!docs.length){toast("ارفع ميزان مراجعة CSV/TXT أولًا","warn");return}
  const pick=docs[docs.length-1];
  try{
    const db=await new Promise((res,rej)=>{const q=indexedDB.open("skosif-company-documents-v1",1);q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)}),
      rec=await new Promise((res,rej)=>{const tx=db.transaction("documents","readonly"),q=tx.objectStore("documents").get(pick.id);q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)});db.close();
    if(!rec?.blob)throw new Error("تعذر قراءة الملف المخزن");
    const text=await rec.blob.text(),tb=SKEngines.reports.tbImport.parseTrialBalance(text);
    if(!tb.ok)throw new Error("لم يمكن قراءة ميزان المراجعة");
    if(!tb.balanced){toast("الميزان غير متزن؛ تم التحليل لكن لن نعرضه كقوائم جاهزة للاعتماد","warn")}
    const fs=SKEngines.reports.statements.buildStatements(tb,{}, {tax:(SK.company.current().country==="EG"?"income":"zakat")});
    CP().saveReportResult(tb,fs,pick.name);paint(root);
    toast("تم بناء القوائم حتميًا من "+tb.rows.length+" حسابًا","ok");
  }catch(e){toast(e.message||String(e),"bad")}
}
function bind(root){
  if(root.dataset.riBound==="1")return;root.dataset.riBound="1";
  root.addEventListener("change",async e=>{
    if(e.target.id==="ri-target"){CP().reportingTarget(e.target.value);paint(root)}
    if(e.target.id==="ri-files"&&e.target.files?.length){try{await CP().ingestFiles(e.target.files,"reporting");toast("تم حفظ "+e.target.files.length+" ملف/ملفات مع البصمة","ok");paint(root)}catch(err){toast(err.message,"bad")}}
  });
  root.addEventListener("click",async e=>{
    if(e.target.closest("#ri-build")){await build(root);return}
    if(e.target.closest("#ri-audit")){window.SKosifCore&&SKosifCore.go("tbreview");return}
    const hand=e.target.closest("[data-ri-review]");if(hand){if(await SK.confirm("إرسال مرجع هذا المستند إلى ملف المراجعة؟ لن يُعتبر دليلًا مقبولًا قبل فحصه واعتماده.",{ok:"إرسال"})){CP().requestAuditHandoff(hand.dataset.riReview);toast("أُضيف إلى قائمة التسليم للمراجعة","ok")}return}
    const del=e.target.closest("[data-ri-del]");if(del&&await SK.confirm("حذف الملف من مخزن هذه الشركة؟",{danger:true,ok:"حذف"})){await CP().removeDocument(del.dataset.riDel);paint(root)}
  });
}
SK.view("reportingintake",{render(root){if(!CP()){root.innerHTML=SK.ui.state.error("تعذر تحميل طبقة بيانات الشركة");return}bind(root);paint(root)}});
})();