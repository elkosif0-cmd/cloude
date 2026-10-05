/* Company definitions / master data: one company-scoped catalogue feeding accounting, reporting and tools. */
(()=>{
"use strict";
const {esc,toast}=SK,CP=()=>window.SKosifCompanyPlatform;
let active="products";
const money=v=>v==null||v===""?"—":Number(v).toLocaleString("ar-SA",{maximumFractionDigits:2});
function categoryButtons(){
  return Object.entries(CP().types()).map(([id,x])=>'<button type="button" class="btn sm" data-md-type="'+id+'" aria-pressed="'+(id===active)+'">'+(SK.icons[x.icon]||"")+esc(x.label)+'</button>').join("");
}
function rows(){
  const items=CP().definitions(active);
  if(!items.length)return SK.ui.state.empty("لا توجد تعريفات في هذا القسم","أضف أول عنصر ليصبح متاحًا للحسابات والتقارير والأدوات.");
  return '<div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>الكود</th><th>الاسم</th><th>حساب الربط</th><th>مركز التكلفة</th><th>تكلفة</th><th>بيع</th><th></th></tr></thead><tbody>'+
    items.map(x=>'<tr><td class="n">'+esc(x.code||"—")+'</td><td><b>'+esc(x.name)+'</b>'+(x.notes?'<small class="muted">'+esc(x.notes)+'</small>':"")+'</td><td class="n">'+esc(x.accountCode||"—")+'</td><td>'+esc(x.costCenter||"—")+'</td><td class="n">'+money(x.cost)+'</td><td class="n">'+money(x.salePrice)+'</td><td><button class="linkish" type="button" data-md-ai="'+esc(x.id)+'">اقتراح AI</button> · <button class="linkish danger" type="button" data-md-del="'+esc(x.id)+'">حذف</button></td></tr>').join("")+
    '</tbody></table></div>';
}
function paint(root){
  const c=SK.company&&SK.company.current?SK.company.current():null,t=CP().types()[active];
  root.innerHTML='<section class="card"><div class="card-h"><div><span class="eyebrow">MASTER DATA</span><h2>التعريفات — '+esc(c?.name||"الشركة")+'</h2><p>عرّف العناصر مرة واحدة، ثم استخدمها في القيود والتقارير والتكاليف والمراجعة. البيانات مرتبطة بالشركة المفتوحة فقط.</p></div><span class="sk-pill">'+esc(t.label)+'</span></div><div class="card-b sk-stack">'+
    '<div class="sk-actions" role="group" aria-label="أنواع التعريفات">'+categoryButtons()+'</div>'+
    '<div class="sk-actions"><button type="button" class="btn primary" data-md-add>إضافة '+esc(t.label)+'</button><button type="button" class="btn" data-md-ledger>فتح شجرة الحسابات والدفاتر</button></div>'+rows()+
    '<p class="hint">اقتراح AI لا يغيّر الربط تلقائيًا؛ يظهر كاقتراح للمستخدم. الحسابات والترحيل تظل حتمية وتحت اعتماد بشري.</p></div></section>';
}
async function add(root){
  const t=CP().types()[active],fields=[{key:"name",label:"الاسم",required:true},{key:"code",label:"الكود / الرقم"},{key:"accountCode",label:"حساب الربط (اختياري)",placeholder:"مثال: 4101"},{key:"costCenter",label:"مركز التكلفة / المشروع"},{key:"unit",label:"وحدة القياس"},{key:"notes",label:"ملاحظات",type:"textarea"}];
  if(["products","services"].includes(active))fields.splice(4,0,{key:"purchasePrice",label:"سعر الشراء",type:"number"},{key:"cost",label:"التكلفة",type:"number"},{key:"salePrice",label:"سعر البيع",type:"number"},{key:"wastePct",label:"الهدر %",type:"number"},{key:"marginPct",label:"هامش مستهدف %",type:"number"});
  const v=await SK.form("إضافة "+t.label,fields,{ok:"حفظ التعريف",message:"سيُحفظ داخل مساحة الشركة الحالية ويمكن استخدامه من بقية البوابات."});
  if(!v)return;try{CP().addDefinition(active,v);toast("تمت إضافة "+v.name,"ok");paint(root)}catch(e){toast(e.message,"bad")}
}
async function aiSuggest(id){
  const item=CP().definitions(active).find(x=>x.id===id);if(!item)return;
  if(!(window.SKosifAI&&SKosifAI.ready())){toast("اضبط مزود AI أولًا من إعدادات المراجع الذكي","warn");return}
  const company=SK.company.current(),prompt='أنت مساعد محاسبي. اقترح فقط ولا تنفذ. للشركة '+company.name+' وبعملة '+company.currency+'، نريد ربط تعريف من نوع '+CP().types()[active].label+' واسمه "'+item.name+'". أجب بالعربية في 4 أسطر: طبيعة الحساب، مثال كود حساب مناسب، بند القوائم المالية، ومركز تكلفة/بعد مقترح. إذا كانت المعلومات غير كافية قل ما الذي ينقص.';
  try{
    const body={contents:[{role:"user",parts:[{text:prompt}]}]},res=await SKosifAI.generate(body,{timeout:90000}),txt=SKEngines.audit.aiReview.extractText(res).text||"لا اقتراح";
    await SK.form("اقتراح AI — لا يُطبّق تلقائيًا",[{key:"t",label:"الاقتراح",type:"textarea",value:txt}],{ok:"إغلاق",cancel:"إغلاق"});
    try{CP().addStandardTrace({operation:"master-data-account-suggestion",standard:"سياسة محاسبية داخلية",source:"AI suggestion only",result:txt,provider:SKosifAI.provider(),approved:false})}catch{}
  }catch(e){toast(e.message,"bad")}
}
function bind(root){
  if(root.dataset.mdBound==="1")return;root.dataset.mdBound="1";
  root.addEventListener("click",async e=>{
    const type=e.target.closest("[data-md-type]");if(type){active=type.dataset.mdType;paint(root);return}
    if(e.target.closest("[data-md-add]")){await add(root);return}
    if(e.target.closest("[data-md-ledger]")){window.SKosifCore&&SKosifCore.go("ledger");return}
    const del=e.target.closest("[data-md-del]");if(del&&await SK.confirm("حذف هذا التعريف من الشركة؟",{danger:true,ok:"حذف"})){CP().removeDefinition(active,del.dataset.mdDel);paint(root);return}
    const ai=e.target.closest("[data-md-ai]");if(ai){await aiSuggest(ai.dataset.mdAi)}
  });
}
SK.view("masterdata",{render(root){if(!CP()){root.innerHTML=SK.ui.state.error("تعذر تحميل طبقة بيانات الشركة");return}bind(root);paint(root)}});
})();