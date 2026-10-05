/* KOSIF — company definition screen: legal/business profile + master data used by accounting, reports and audit. */
(()=>{
"use strict";
const {esc,toast}=SK,D=()=>SK.companyData;
const LABEL={products:"المنتجات",services:"الخدمات",customers:"العملاء",suppliers:"الموردون",employees:"الموظفون",branches:"الفروع",warehouses:"المخازن",costCenters:"مراكز التكلفة",projects:"المشاريع",units:"وحدات القياس"};
function profileHTML(p){
 return '<section class="card"><div class="card-h"><div><span class="eyebrow">COMPANY PROFILE</span><h3>تعريف الشركة</h3><p>بيانات مرجعية واحدة تستخدمها المحاسبة والتقارير والمراجعة.</p></div></div><div class="card-b">'+
 '<div class="sk-grid2"><label class="sk-field"><span>النشاط</span><input id="cdf-activity" value="'+esc(p.activity)+'" placeholder="مثال: تجارة أغذية"></label>'+
 '<label class="sk-field"><span>الدولة</span><input id="cdf-country" value="'+esc(p.country)+'" maxlength="3"></label>'+
 '<label class="sk-field"><span>العملة</span><input id="cdf-currency" value="'+esc(p.currency)+'" maxlength="3"></label>'+
 '<label class="sk-field"><span>بداية السنة المالية</span><input id="cdf-fy" value="'+esc(p.fiscalYearStart)+'" placeholder="01-01"></label>'+
 '<label class="sk-field"><span>المعالجة الضريبية</span><select id="cdf-tax"><option value="zakat"'+(p.taxMode==="zakat"?" selected":"")+'>زكاة</option><option value="income"'+(p.taxMode==="income"?" selected":"")+'>ضريبة دخل</option></select></label>'+
 '<label class="sk-field"><span>الرقم الضريبي / VAT</span><input id="cdf-vat" value="'+esc(p.vatNo)+'"></label>'+
 '<label class="sk-field"><span>السجل التجاري</span><input id="cdf-cr" value="'+esc(p.crNo)+'"></label>'+
 '<label class="sk-field"><span>العنوان</span><input id="cdf-address" value="'+esc(p.address)+'"></label></div>'+
 '<label class="sk-field"><span>ملاحظات تعريفية</span><textarea id="cdf-notes" rows="3">'+esc(p.notes)+'</textarea></label>'+
 '<div class="sk-actions"><button type="button" class="btn primary" data-cdf="save-profile">حفظ تعريف الشركة</button></div></div></section>';
}
function defCard(type,rows){
 const product=type==="products"||type==="services";
 return '<section class="card"><div class="card-h"><div><h3>'+esc(LABEL[type])+'</h3><p>'+rows.length+' تعريف</p></div><button type="button" class="btn sm" data-cdf-add="'+type+'">+ إضافة</button></div><div class="card-b">'+
 (rows.length?'<div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>الكود</th><th>الاسم</th>'+(product?'<th>بيع</th><th>شراء</th><th>تكلفة</th><th>هدر %</th>':'')+'<th></th></tr></thead><tbody>'+
 rows.map(r=>'<tr><td>'+esc(r.code||"—")+'</td><td>'+esc(r.name)+'</td>'+(product?'<td class="n">'+esc(r.salePrice||0)+'</td><td class="n">'+esc(r.purchasePrice||0)+'</td><td class="n">'+esc(r.cost||0)+'</td><td class="n">'+esc(r.wastePct||0)+'</td>':'')+
 '<td><button type="button" class="linkish" data-cdf-remove="'+esc(type)+'" data-id="'+esc(r.id)+'">حذف</button></td></tr>').join("")+'</tbody></table></div>':'<div class="sk-note">لا توجد تعريفات بعد.</div>')+'</div></section>';
}
function render(root){
 const d=D();if(!d){root.innerHTML='<div class="sk-note">تعذر تحميل طبقة بيانات الشركة.</div>';return}
 const p=d.profile(),defs=d.definitions();
 root.innerHTML='<div class="sk-stack">'+profileHTML(p)+'<section class="card"><div class="card-h"><div><span class="eyebrow">MASTER DATA</span><h3>التعريفات</h3><p>عرّف العناصر مرة واحدة لتستخدمها القيود والتقارير والتحليل.</p></div></div></section>'+
 Object.keys(LABEL).map(t=>defCard(t,defs[t]||[])).join("")+'</div>';
 if(root.dataset.cdfBound==="1")return;root.dataset.cdfBound="1";
 root.addEventListener("click",async e=>{
   const b=e.target.closest("[data-cdf],[data-cdf-add],[data-cdf-remove]");if(!b)return;
   if(b.dataset.cdf==="save-profile"){
     const ok=d.setProfile({activity:root.querySelector("#cdf-activity").value,country:root.querySelector("#cdf-country").value,currency:root.querySelector("#cdf-currency").value,
       fiscalYearStart:root.querySelector("#cdf-fy").value,taxMode:root.querySelector("#cdf-tax").value,vatNo:root.querySelector("#cdf-vat").value,crNo:root.querySelector("#cdf-cr").value,
       address:root.querySelector("#cdf-address").value,notes:root.querySelector("#cdf-notes").value});
     toast(ok?"حُفظ تعريف الشركة":"تعذر الحفظ",ok?"ok":"bad");return;
   }
   if(b.dataset.cdfAdd){
     const type=b.dataset.cdfAdd,product=type==="products"||type==="services";
     const fields=[{key:"code",label:"الكود"},{key:"name",label:"الاسم",required:true}];
     if(product)fields.push({key:"salePrice",label:"سعر البيع",type:"number"},{key:"purchasePrice",label:"سعر الشراء",type:"number"},{key:"cost",label:"التكلفة",type:"number"},{key:"wastePct",label:"الهدر %",type:"number"});
     const v=await SK.form("إضافة "+LABEL[type],fields,{ok:"إضافة"});if(!v)return;
     try{d.addDefinition(type,v);render(root);toast("تمت الإضافة","ok")}catch(err){toast(err.message,"bad")}return;
   }
   if(b.dataset.cdfRemove){
     if(!await SK.confirm("حذف هذا التعريف؟",{danger:true,ok:"حذف"}))return;
     if(d.removeDefinition(b.dataset.cdfRemove,b.dataset.id)){render(root);toast("تم الحذف","ok")}return;
   }
 });
}
SK.view("definitions",{render});
})();
