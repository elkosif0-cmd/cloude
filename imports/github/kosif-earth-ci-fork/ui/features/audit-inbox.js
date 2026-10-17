/* KOSIF — explicit inbox between reporting and audit. */
(()=>{"use strict";
const {esc,toast}=SK,CP=()=>window.SKosifCompanyPlatform;
const L={"trial-balance":"ميزان مراجعة","general-ledger":"دفتر أستاذ","bank-statement":"كشف بنك",inventory:"مخزون","financial-statements":"قوائم مالية",other:"أخرى"};
const canImport=d=>d&&d.type==="trial-balance"&&/\.(csv|tsv|txt|xlsx)$/i.test(d.name||"");
function paint(root){
 const cp=CP();if(!cp){root.innerHTML=SK.ui.state.error("تعذر تحميل بيانات الشركة");return}
 const p=cp.auditHandoffs("pending"),done=[...cp.auditHandoffs("received"),...cp.auditHandoffs("rejected")];
 root.innerHTML='<div class="sk-stack"><section class="card"><div class="card-h"><div><span class="eyebrow">صندوق الاستلام</span><h2>صندوق استلام المراجعة</h2><p>مستندات أرسلها المستخدم صراحة من مساعد التقارير. الاستلام لا يعني قبول الدليل.</p></div><span class="sk-pill">'+p.length+' معلّق</span></div><div class="card-b">'+
 (p.length?'<div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>الملف</th><th>النوع</th><th>البصمة</th><th></th></tr></thead><tbody>'+p.map(h=>{const d=h.document||{};return '<tr><td>'+esc(d.name||"—")+'</td><td>'+esc(L[d.type]||d.type||"—")+'</td><td class="n">'+esc((d.sha256||"").slice(0,12)||"—")+'</td><td><button class="btn sm primary" data-in="'+esc(h.id)+'">'+(canImport(d)?"استلام وفتح الميزان":"استلام كمرجع")+'</button> <button class="btn sm" data-rej="'+esc(h.id)+'">رفض</button></td></tr>'}).join("")+'</tbody></table></div>':SK.ui.state.empty("لا توجد مستندات معلقة","أرسل ملفًا من مساعد التقارير."))+
 '<div class="sk-actions"><button class="btn" data-audit>فتح ملف المراجعة</button><button class="btn" data-report>مساعد التقارير</button></div></div></section>'+
 (done.length?'<section class="card"><div class="card-h"><h3>سجل التسليم</h3></div><div class="card-b"><ul>'+done.slice(-20).reverse().map(h=>'<li>'+esc(h.document?.name||"—")+' · '+esc(h.status)+'</li>').join("")+'</ul></div></section>':'')+'</div>';
}
async function accept(root,id){
 const cp=CP(),h=cp.auditHandoffs("pending").find(x=>x.id===id);if(!h)return;
 const d=h.document||{};
 if(canImport(d)){
  try{
   const rec=await cp.readDocument(d.id);if(!rec?.blob)throw new Error("تعذر قراءة الملف");
   const text=/\.xlsx$/i.test(d.name)?await SKXlsx.toTsv(rec.blob):await rec.blob.text();
   const co=SK.company.current(),p=co.period,ok=await SKosifTBReview.load(text,"مساعد التقارير — "+d.name,{company:co.name,period:p?.label||"",periodStart:p?.startDate||"",periodEnd:p?.endDate||"",country:co.country||"SA"});
   if(!ok)return;cp.setAuditHandoffStatus(id,"received");toast("تم ربط الميزان بملف المراجعة","ok");SKosifCore.go("tbreview");return;
  }catch(e){toast(e.message||String(e),"bad");return}
 }
 cp.setAuditHandoffStatus(id,"received");
 cp.addStandardTrace({operation:"audit-document-handoff",standard:"ISA 500",source:(d.sha256||"")+" "+(d.name||""),result:"مرجع مستلم ولم يُعتمد كدليل بعد",provider:"deterministic",approved:false});
 toast("تم استلام المرجع؛ يحتاج فحصًا داخل المراجعة","ok");paint(root);
}
function bind(root){if(root.dataset.aiBox)return;root.dataset.aiBox="1";root.addEventListener("click",async e=>{
 const a=e.target.closest("[data-in]");if(a){await accept(root,a.dataset.in);return}
 const r=e.target.closest("[data-rej]");if(r&&await SK.confirm("رفض هذا التسليم؟",{ok:"رفض"})){CP().setAuditHandoffStatus(r.dataset.rej,"rejected");paint(root);return}
 if(e.target.closest("[data-audit]"))SKosifCore.go("tbreview");if(e.target.closest("[data-report]"))SKosifCore.go("reportingintake");
})}
SK.view("auditinbox",{render(root){bind(root);paint(root)}});
})();