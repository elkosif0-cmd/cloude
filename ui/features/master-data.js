/* Company definitions / master data: one company-scoped catalogue feeding accounting, reporting and tools. */
(()=>{
"use strict";
const {esc,toast}=SK,CP=()=>window.SKosifCompanyPlatform;
let active="products";
const money=v=>v==null||v===""?"—":Number(v).toLocaleString("ar-SA",{maximumFractionDigits:2});
const minorMoney=v=>(Number(v||0)/100).toLocaleString("ar-SA",{minimumFractionDigits:2,maximumFractionDigits:2});
const asOfDate=()=>{const c=SK.company&&SK.company.current?SK.company.current():null;return c&&c.period&&c.period.endDate?c.period.endDate:new Date().toISOString().slice(0,10)};
function categoryButtons(){
  return Object.entries(CP().types()).map(([id,x])=>'<button type="button" class="btn sm" data-md-type="'+id+'" aria-pressed="'+(id===active)+'">'+(SK.icons[x.icon]||"")+esc(x.label)+'</button>').join("");
}
function fixedAssetRows(){
  const asOf=asOfDate(),items=CP().fixedAssetSummary(asOf);
  if(!items.length)return SK.ui.state.empty("لا توجد أصول ثابتة","أضف الأصل وتاريخ وضعه في الخدمة والعمر الإنتاجي وحسابات الإهلاك.");
  return '<div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>الأصل</th><th>في الخدمة</th><th>التكلفة</th><th>العمر</th><th>مجمع الإهلاك</th><th>القيمة الدفترية</th><th>إهلاك الشهر</th><th></th></tr></thead><tbody>'+
    items.map(x=>'<tr><td><b>'+esc((x.code?x.code+" · ":"")+x.name)+'</b><small>'+esc(x.accountCode||"حساب الأصل غير محدد")+'</small></td><td class="n">'+esc(x.inServiceDate)+'</td><td class="n">'+money(x.cost)+'</td><td class="n">'+esc(x.usefulLifeMonths)+' شهر</td><td class="n">'+minorMoney(x.depreciation.accumulatedMinor)+'</td><td class="n">'+minorMoney(x.depreciation.carryingMinor)+'</td><td class="n">'+minorMoney(x.depreciation.currentMonthChargeMinor)+'</td><td><button class="linkish" type="button" data-md-dep="'+esc(x.id)+'">عرض القيد المقترح</button> · <button class="linkish danger" type="button" data-md-del="'+esc(x.id)+'">حذف</button></td></tr>').join("")+
    '</tbody></table></div>'+fixedAssetJournalCard(asOf);
}
function fixedAssetJournalCard(asOf){
  const j=CP().fixedAssetJournal(asOf),missing=j.proposals.filter(x=>!x.ready).length;
  return '<div class="sk-note"><b>إهلاك الفترة حتى '+esc(asOf)+':</b> إجمالي قيد الشهر المقترح '+minorMoney(j.totalMinor)+' '+esc(SK.company.current().currency)+
    (missing?' · <span class="sksev warn">'+missing+' أصل يحتاج حساب مصروف/مجمع إهلاك</span>':'')+
    '<br><small>القيد مسودة حتمية بالقسط الثابت وفق بيانات الأصل. لا يُرحّل ولا يعتمد تلقائيًا؛ افتح الدفاتر وراجعه قبل التسجيل.</small></div>';
}
function rows(){
  if(active==="fixedAssets")return fixedAssetRows();
  const items=CP().definitions(active);
  if(!items.length)return SK.ui.state.empty("لا توجد تعريفات في هذا القسم","أضف أول عنصر ليصبح متاحًا للحسابات والتقارير والأدوات.");
  return '<div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>الكود</th><th>الاسم</th><th>حساب الربط</th><th>مركز التكلفة</th><th>تكلفة</th><th>بيع</th><th></th></tr></thead><tbody>'+
    items.map(x=>'<tr><td class="n">'+esc(x.code||"—")+'</td><td><b>'+esc(x.name)+'</b>'+(x.notes?'<small class="muted">'+esc(x.notes)+'</small>':"")+'</td><td class="n">'+esc(x.accountCode||"—")+'</td><td>'+esc(x.costCenter||"—")+'</td><td class="n">'+money(x.cost)+'</td><td class="n">'+money(x.salePrice)+'</td><td><button class="linkish" type="button" data-md-ai="'+esc(x.id)+'">اقتراح AI</button> · <button class="linkish danger" type="button" data-md-del="'+esc(x.id)+'">حذف</button></td></tr>').join("")+
    '</tbody></table></div>';
}
function profileCard(){
  const p=CP().profile(),c=SK.company.current();
  return '<section class="card"><div class="card-h"><div><span class="eyebrow">COMPANY PROFILE</span><h2>تعريف الشركة — '+esc(c.name)+'</h2><p>مرجع موحد تستخدمه المحاسبة والتقارير والمراجعة والمعايير.</p></div><span class="sk-pill">'+esc(p.currency)+'</span></div><div class="card-b sk-stack">'+
  '<div class="sk-grid2"><label class="sk-field"><span>النشاط</span><input data-md-profile="activity" value="'+esc(p.activity)+'" placeholder="مثال: تجارة مواد غذائية"></label>'+
  '<label class="sk-field"><span>الدولة</span><input data-md-profile="country" maxlength="3" value="'+esc(p.country)+'"></label>'+
  '<label class="sk-field"><span>العملة</span><input data-md-profile="currency" maxlength="3" value="'+esc(p.currency)+'"></label>'+
  '<label class="sk-field"><span>إطار التقارير</span><select data-md-profile="framework"><option value="IFRS"'+(p.framework==="IFRS"?" selected":"")+'>IFRS الكاملة</option><option value="SME"'+(p.framework==="SME"?" selected":"")+'>IFRS للمنشآت الصغيرة والمتوسطة</option><option value="EAS"'+(p.framework==="EAS"?" selected":"")+'>معايير المحاسبة المصرية EAS</option></select></label>'+
   '<label class="sk-field"><span>بداية السنة المالية</span><input data-md-profile="fiscalYearStart" maxlength="5" value="'+esc(p.fiscalYearStart)+'" placeholder="01-01"></label>'+
  '<label class="sk-field"><span>الزكاة / ضريبة الدخل</span><select data-md-profile="taxMode"><option value="zakat"'+(p.taxMode==="zakat"?" selected":"")+'>زكاة</option><option value="income"'+(p.taxMode==="income"?" selected":"")+'>ضريبة دخل</option></select></label>'+
  '<label class="sk-field"><span>الرقم الضريبي / VAT</span><input data-md-profile="vatNo" value="'+esc(p.vatNo)+'"></label>'+
  '<label class="sk-field"><span>السجل التجاري</span><input data-md-profile="crNo" value="'+esc(p.crNo)+'"></label>'+
  '<label class="sk-field"><span>العنوان</span><input data-md-profile="address" value="'+esc(p.address)+'"></label></div>'+
  '<label class="sk-field"><span>ملاحظات تعريفية</span><textarea data-md-profile="notes" rows="3">'+esc(p.notes)+'</textarea></label>'+
  '<div class="sk-actions"><button type="button" class="btn primary" data-md-profile-save>حفظ تعريف الشركة</button></div></div></section>';
}
function paint(root){
  const c=SK.company&&SK.company.current?SK.company.current():null,t=CP().types()[active];
  root.innerHTML=profileCard()+'<section class="card"><div class="card-h"><div><span class="eyebrow">MASTER DATA</span><h2>التعريفات — '+esc(c?.name||"الشركة")+'</h2><p>عرّف العناصر مرة واحدة، ثم استخدمها في القيود والتقارير والتكاليف والمراجعة. البيانات مرتبطة بالشركة المفتوحة فقط.</p></div><span class="sk-pill">'+esc(t.label)+'</span></div><div class="card-b sk-stack">'+
    '<div class="sk-actions" role="group" aria-label="أنواع التعريفات">'+categoryButtons()+'</div>'+
    '<div class="sk-actions"><button type="button" class="btn primary" data-md-add>إضافة '+esc(t.label)+'</button><button type="button" class="btn" data-md-ledger>فتح شجرة الحسابات والدفاتر</button></div>'+rows()+
    '<p class="hint">اقتراح AI لا يغيّر الربط تلقائيًا؛ يظهر كاقتراح للمستخدم. الحسابات والترحيل تظل حتمية وتحت اعتماد بشري.</p></div></section>';
}
async function add(root){
  const t=CP().types()[active];
  let fields=[{key:"name",label:"الاسم",required:true},{key:"code",label:"الكود / الرقم"},{key:"accountCode",label:"حساب الربط (اختياري)",placeholder:"مثال: 4101"},{key:"costCenter",label:"مركز التكلفة / المشروع"},{key:"unit",label:"وحدة القياس"},{key:"notes",label:"ملاحظات",type:"textarea"}];
  if(["products","services"].includes(active))fields.splice(4,0,{key:"purchasePrice",label:"سعر الشراء",type:"number"},{key:"cost",label:"التكلفة",type:"number"},{key:"salePrice",label:"سعر البيع",type:"number"},{key:"wastePct",label:"الهدر %",type:"number"},{key:"marginPct",label:"هامش مستهدف %",type:"number"});
  if(active==="fixedAssets")fields=[
    {key:"name",label:"اسم الأصل",required:true},{key:"code",label:"رقم / كود الأصل"},{key:"inServiceDate",label:"تاريخ وضع الأصل في الخدمة",type:"date",required:true},
    {key:"cost",label:"التكلفة",type:"number",required:true},{key:"residualValue",label:"القيمة التخريدية",type:"number",value:"0"},
    {key:"usefulLifeMonths",label:"العمر الإنتاجي بالأشهر",type:"number",required:true,placeholder:"مثال: 60"},
    {key:"accountCode",label:"حساب الأصل",placeholder:"مثال: 1501"},{key:"accumAccount",label:"حساب مجمع الإهلاك",placeholder:"مثال: 1509"},
    {key:"expenseAccount",label:"حساب مصروف الإهلاك",placeholder:"مثال: 6201"},{key:"costCenter",label:"مركز التكلفة / المشروع"},
    {key:"notes",label:"ملاحظات",type:"textarea"}
  ];
  const v=await SK.form("إضافة "+t.label,fields,{ok:"حفظ التعريف",message:active==="fixedAssets"?"يُحسب الإهلاك بالقسط الثابت حتميًا. أي قيد يظهر بعد الحفظ هو مقترح فقط ولا يُرحّل تلقائيًا.":"سيُحفظ داخل مساحة الشركة الحالية ويمكن استخدامه من بقية البوابات."});
  if(!v)return;try{CP().addDefinition(active,v);toast("تمت إضافة "+v.name,"ok");paint(root)}catch(e){toast(e.message,"bad")}
}
async function showDepreciationProposal(id){
  const asOf=asOfDate(),j=CP().fixedAssetJournal(asOf),p=j.proposals.find(x=>x.assetId===id);
  if(!p){toast("لا يوجد إهلاك مستحق لهذا الأصل في الفترة الحالية","info");return}
  const text=[
    "قيد مقترح فقط — لا ترحيل تلقائي",
    "المعيار المرجعي: "+p.standard,
    "التاريخ: "+p.date,
    "البيان: "+p.memo,
    "",
    "مدين: "+(p.lines[0].accountCode||"[حدد حساب مصروف الإهلاك]")+" — "+minorMoney(p.lines[0].debitMinor),
    "دائن: "+(p.lines[1].accountCode||"[حدد حساب مجمع الإهلاك]")+" — "+minorMoney(p.lines[1].creditMinor),
    "",
    p.ready?"الحسابات محددة؛ راجع القيد ثم سجله من الدفاتر.":"القيد غير جاهز للتسجيل لأن حساب المصروف أو مجمع الإهلاك غير محدد."
  ].join("\n");
  try{CP().addStandardTrace({operation:"fixed-asset-depreciation-proposal",standard:"IAS 16",source:"deterministic straight-line schedule",result:p.memo+" · "+minorMoney(p.amountMinor),approved:false})}catch{}
  await SK.form("مسودة قيد الإهلاك — "+p.assetName,[{key:"t",label:"المسودة",type:"textarea",value:text}],{ok:"إغلاق",cancel:"إغلاق"});
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
    if(e.target.closest("[data-md-profile-save]")){
      const patch={};root.querySelectorAll("[data-md-profile]").forEach(el=>patch[el.dataset.mdProfile]=el.value);
      try{CP().setProfile(patch);toast("حُفظ تعريف الشركة","ok");paint(root)}catch(err){toast(err.message,"bad")}return
    }
    if(e.target.closest("[data-md-add]")){await add(root);return}
    if(e.target.closest("[data-md-ledger]")){window.SKosifCore&&SKosifCore.go("ledger");return}
    const dep=e.target.closest("[data-md-dep]");if(dep){await showDepreciationProposal(dep.dataset.mdDep);return}
    const del=e.target.closest("[data-md-del]");if(del&&await SK.confirm("حذف هذا التعريف من الشركة؟",{danger:true,ok:"حذف"})){CP().removeDefinition(active,del.dataset.mdDel);paint(root);return}
    const ai=e.target.closest("[data-md-ai]");if(ai){await aiSuggest(ai.dataset.mdAi)}
  });
}
SK.view("masterdata",{render(root){if(!CP()){root.innerHTML=SK.ui.state.error("تعذر تحميل طبقة بيانات الشركة");return}bind(root);paint(root)}});
})();