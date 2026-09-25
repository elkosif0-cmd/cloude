/* S.kosif — الدفاتر المحاسبية: دليل الحسابات، القيود، الأستاذ العام، ميزان المراجعة، المطابقة.
   الحساب يتم بمحركات مختبرة (SKEngines.finance.*، app/src/engine/fusion/finance).
   البيانات: skosif_ledger_v1 = {accounts:[], entries:[]} — لا توجد قيود افتراضية؛ دليل الحسابات الأساسي
   قالب يضيفه المستخدم بضغطة ويعدّله. */
(()=>{
"use strict";
const {$,$$,esc,load,save,money,toast}=SK;
const E=()=>window.SKEngines.finance;
const KEY="skosif_ledger_v1",CO_KEY="skosif_companies_v1";
const TYPES={asset:"أصول",liability:"خصوم",equity:"حقوق ملكية",revenue:"إيرادات",expense:"مصروفات",other:"أخرى"};
const BASIC=[["1100","النقدية والبنوك","asset"],["1200","الذمم المدينة","asset"],["1300","المخزون","asset"],["1400","ضريبة القيمة المضافة — مدخلات","asset"],
  ["2100","الذمم الدائنة (الموردون)","liability"],["2200","ضريبة القيمة المضافة — مخرجات","liability"],["3000","رأس المال","equity"],["3100","الأرباح المبقاة","equity"],
  ["4000","إيرادات المبيعات","revenue"],["5000","تكلفة المبيعات","expense"],["6100","الرواتب والأجور","expense"],["6200","الإيجار","expense"],["6300","مصروفات تشغيلية أخرى","expense"]];
const ISSUE={JOURNAL_UNBALANCED:"القيد غير متزن: المدين لا يساوي الدائن",LINE_BOTH_SIDES:"سطر فيه مدين ودائن معاً",LINE_NEGATIVE_AMOUNT:"مبلغ سالب",LINE_ZERO_AMOUNT:"سطر بلا مبلغ"};
let tab="accounts",draft=null,glAcc="";
const db=()=>{const d=load(KEY,{});return{accounts:Array.isArray(d.accounts)?d.accounts:[],entries:Array.isArray(d.entries)?d.entries:[]}};
const put=d=>save(KEY,d);
const r2=v=>Math.round((Number(v)||0)*100)/100;
function period(){const c=load(CO_KEY,{});const a=c.active||{};const p=(c.periods||[]).find(x=>x.id===a.periodId);return p||null}
function inPeriod(e,p){return !p||(e.date>=p.startDate&&e.date<=p.endDate)}
const accName=(d,id)=>{const a=d.accounts.find(x=>x.id===id);return a?a.code+" · "+a.name:id};
const newDraft=()=>({date:new Date().toISOString().slice(0,10),reference:"",memo:"",lines:[{accountId:"",debit:"",credit:""},{accountId:"",debit:"",credit:""}]});

/* ---------- tabs ---------- */
function accountsHTML(d){
  const issues=E().accounts.inspectChartOfAccounts(d.accounts);
  return '<section class="card"><div class="card-h"><div><h3>دليل الحسابات</h3><p>'+d.accounts.length+' حساباً. كل قيد يستخدم حسابات من هذا الدليل.</p></div>'+
    (d.accounts.length?'':'<button type="button" class="btn primary" data-l="basic">إنشاء دليل حسابات أساسي</button>')+'</div><div class="card-b sk-stack">'+
    (issues.length?'<div class="sk-note warn">ملاحظات على الدليل: '+issues.map(i=>esc(i.code)+" ("+esc(i.accountId)+")").join("، ")+'</div>':'')+
    '<div class="sk-grid2"><label class="sk-field"><span>رمز الحساب</span><input id="lg-code" inputmode="numeric" data-sk-required></label><label class="sk-field"><span>اسم الحساب</span><input id="lg-name" data-sk-required></label>'+
    '<label class="sk-field"><span>النوع</span><select id="lg-type">'+Object.entries(TYPES).map(([k,v])=>'<option value="'+k+'">'+v+'</option>').join("")+'</select></label>'+
    '<label class="sk-field"><span>الحساب الأب (اختياري)</span><select id="lg-parent"><option value="">—</option>'+d.accounts.map(a=>'<option value="'+esc(a.id)+'">'+esc(a.code+" · "+a.name)+'</option>').join("")+'</select></label></div>'+
    '<div class="sk-actions"><button type="button" class="btn primary" data-l="add-acc">إضافة حساب</button></div>'+
    (d.accounts.length?'<div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>الرمز</th><th>الاسم</th><th>النوع</th><th>الحالة</th><th></th></tr></thead><tbody>'+
      d.accounts.slice().sort((a,b)=>a.code.localeCompare(b.code)).map(a=>'<tr><td class="n">'+esc(a.code)+'</td><td>'+esc(a.name)+'</td><td>'+esc(TYPES[a.type]||a.type)+'</td><td>'+(a.active?'<span class="sk-pill good">نشط</span>':'<span class="sk-pill">موقوف</span>')+'</td><td><button type="button" class="linkish" data-l="toggle" data-id="'+esc(a.id)+'">'+(a.active?'إيقاف':'تفعيل')+'</button></td></tr>').join("")+'</tbody></table></div>':SK.ui.state.empty({title:"لا توجد حسابات بعد",text:"ابدأ بالدليل الأساسي ثم عدّل أو أضف حساباتك."}))+
  '</div></section>';
}
function entriesHTML(d){
  const acc=d.accounts.filter(a=>a.active);
  if(!acc.length)return SK.ui.state.empty({title:"أنشئ دليل الحسابات أولاً",text:"القيود تُسجّل على حسابات الدليل."});
  draft=draft||newDraft();
  const td=draft.lines.reduce((s,l)=>s+(Number(l.debit)||0),0),tc=draft.lines.reduce((s,l)=>s+(Number(l.credit)||0),0);
  const p=period(),list=d.entries.filter(e=>inPeriod(e,p)).slice().reverse();
  const opt=cur=>'<option value="">اختر الحساب</option>'+acc.map(a=>'<option value="'+esc(a.id)+'"'+(a.id===cur?' selected':'')+'>'+esc(a.code+" · "+a.name)+'</option>').join("");
  return '<section class="card"><div class="card-h"><div><h3>قيد يومية جديد</h3><p>قيد مزدوج متزن. يُرفض القيد غير المتزن قبل الحفظ.</p></div></div><div class="card-b sk-stack">'+
    '<div class="sk-grid2"><label class="sk-field"><span>التاريخ</span><input type="date" id="lg-date" value="'+esc(draft.date)+'"></label><label class="sk-field"><span>المرجع</span><input id="lg-ref" value="'+esc(draft.reference)+'" placeholder="رقم فاتورة/سند"></label></div>'+
    '<label class="sk-field"><span>البيان</span><input id="lg-memo" value="'+esc(draft.memo)+'"></label>'+
    '<div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>الحساب</th><th>مدين</th><th>دائن</th><th></th></tr></thead><tbody>'+
      draft.lines.map((l,i)=>'<tr><td><select data-ln="'+i+'" data-f="accountId">'+opt(l.accountId)+'</select></td><td><input data-ln="'+i+'" data-f="debit" inputmode="decimal" value="'+esc(l.debit)+'" style="width:110px"></td><td><input data-ln="'+i+'" data-f="credit" inputmode="decimal" value="'+esc(l.credit)+'" style="width:110px"></td><td>'+(draft.lines.length>2?'<button type="button" class="linkish" data-l="rm-line" data-i="'+i+'">حذف</button>':'')+'</td></tr>').join("")+
      '<tr><td><b>الإجمالي</b></td><td class="n"><b id="lg-td">'+money(td)+'</b></td><td class="n"><b id="lg-tc">'+money(tc)+'</b></td><td id="lg-st">'+(Math.abs(td-tc)<0.005&&td>0?'<span class="sk-pill good">متزن</span>':'<span class="sk-pill warn">فرق '+money(td-tc)+'</span>')+'</td></tr></tbody></table></div>'+
    '<div class="sk-actions"><button type="button" class="btn" data-l="add-line">إضافة سطر</button><button type="button" class="btn primary" data-l="save-entry">حفظ القيد</button></div>'+
    '<div class="sk-error" id="lg-err"></div></div></section>'+
    '<section class="card"><div class="card-h"><div><h3>القيود المسجلة</h3><p>'+list.length+' قيداً'+(p?' في الفترة «'+esc(p.label)+'»':'')+'.</p></div></div><div class="card-b">'+
    (list.length?'<div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>التاريخ</th><th>المرجع</th><th>البيان</th><th>المبلغ</th><th>المصدر</th><th></th></tr></thead><tbody>'+
      list.slice(0,200).map(e=>'<tr><td class="n">'+esc(e.date)+'</td><td>'+esc(e.reference||"")+'</td><td>'+esc(e.memo||"")+'</td><td class="n">'+money(e.lines.reduce((s,l)=>s+l.debit,0))+'</td><td>'+esc(e.source||"يدوي")+'</td><td><button type="button" class="linkish" data-l="del-entry" data-id="'+esc(e.id)+'">حذف</button></td></tr>').join("")+'</tbody></table></div>':SK.ui.state.empty({title:"لا توجد قيود في هذه الفترة"}))+
  '</div></section>'+postingHTML(d);
}
/* sales recorded in «تسجيل بيع» and receipts from «المشتريات» can be posted once */
function postingHTML(d){
  const posted=new Set(d.entries.map(e=>e.sourceId).filter(Boolean));
  const sales=(load("aghnam-v12-manual-sales",[])||[]).filter(x=>x&&x.id&&!posted.has("sale:"+x.id));
  const pur=load("skosif_purchasing_v1",{}),rec=(pur.receipts||[]).filter(r=>r.status==="RECEIVED"&&!posted.has("receipt:"+r.id));
  if(!sales.length&&!rec.length)return "";
  return '<section class="card"><div class="card-h"><div><h3>بانتظار الترحيل</h3><p>عمليات مسجلة في التطبيق ولم تُرحّل للدفاتر بعد. الأسعار في «تسجيل بيع» شاملة الضريبة.</p></div></div><div class="card-b sk-stack">'+
    (sales.length?'<div class="sk-actions"><span>'+sales.length+' عملية بيع يدوية</span><button type="button" class="btn primary" data-l="post-sales">ترحيل المبيعات</button></div>':'')+
    (rec.length?'<div class="sk-actions"><span>'+rec.length+' استلام مشتريات</span><button type="button" class="btn primary" data-l="post-receipts">ترحيل الاستلامات</button></div>':'')+
  '</div></section>';
}
function glHTML(d){
  const p=period(),entries=d.entries.filter(e=>inPeriod(e,p)),rows=E().ledger.buildGeneralLedger(entries);
  if(!rows.length)return SK.ui.state.empty({title:"الأستاذ العام فارغ",text:"سجّل قيوداً أو رحّل المبيعات والمشتريات."});
  const sel=glAcc&&rows.find(r=>r.accountId===glAcc)?glAcc:rows[0].accountId;
  let bal=0;const moves=[];entries.slice().sort((a,b)=>a.date.localeCompare(b.date)).forEach(e=>e.lines.forEach(l=>{if(l.accountId===sel){bal=r2(bal+l.debit-l.credit);moves.push([e,l,bal])}}));
  return '<section class="card"><div class="card-h"><div><h3>الأستاذ العام</h3><p>أرصدة الحسابات من القيود المرحّلة'+(p?' — '+esc(p.label):'')+'.</p></div></div><div class="card-b sk-stack">'+
    '<div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>الحساب</th><th>مدين</th><th>دائن</th><th>الرصيد</th></tr></thead><tbody>'+
    rows.map(r=>'<tr'+(r.accountId===sel?' style="background:var(--sk-brand-soft)"':'')+'><td><button type="button" class="linkish" data-l="gl-acc" data-id="'+esc(r.accountId)+'">'+esc(accName(d,r.accountId))+'</button></td><td class="n">'+money(r.debit)+'</td><td class="n">'+money(r.credit)+'</td><td class="n"><b>'+money(r.balance)+'</b></td></tr>').join("")+'</tbody></table></div>'+
    '<h4 class="sk-h4">حركة: '+esc(accName(d,sel))+'</h4><div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>التاريخ</th><th>المرجع</th><th>البيان</th><th>مدين</th><th>دائن</th><th>الرصيد</th></tr></thead><tbody>'+
    moves.map(([e,l,b])=>'<tr><td class="n">'+esc(e.date)+'</td><td>'+esc(e.reference||"")+'</td><td>'+esc(l.description||e.memo||"")+'</td><td class="n">'+(l.debit?money(l.debit):"")+'</td><td class="n">'+(l.credit?money(l.credit):"")+'</td><td class="n">'+money(b)+'</td></tr>').join("")+'</tbody></table></div></div></section>';
}
function tbHTML(d){
  const p=period(),tb=E().ledger.buildTrialBalance(d.entries.filter(e=>inPeriod(e,p)));
  if(!tb.rows.length)return SK.ui.state.empty({title:"لا يوجد ميزان بعد",text:"الميزان يُبنى من القيود المسجلة."});
  const byType={};tb.rows.forEach(r=>{const a=d.accounts.find(x=>x.id===r.accountId);const t=a?a.type:"other";byType[t]=r2((byType[t]||0)+r.balance)});
  return '<section class="card"><div class="card-h"><div><h3>ميزان المراجعة</h3><p>'+(tb.balanced?'<span class="sk-pill good">متزن</span>':'<span class="sk-pill bad">غير متزن</span>')+(p?' — '+esc(p.label):'')+'</p></div><div class="sk-actions"><button type="button" class="btn" data-l="tb-csv">تصدير CSV</button><button type="button" class="btn" data-l="to-audit">فتح في المستندات والأدلة</button></div></div><div class="card-b sk-stack">'+
    '<div class="sk-kpis">'+Object.entries(byType).map(([t,v])=>'<div class="sk-kpi"><span>'+esc(TYPES[t]||t)+'</span><b>'+money(Math.abs(v))+'</b></div>').join("")+'</div>'+
    '<div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>الحساب</th><th>مدين</th><th>دائن</th><th>رصيد مدين</th><th>رصيد دائن</th></tr></thead><tbody>'+
    tb.rows.map(r=>'<tr><td>'+esc(accName(d,r.accountId))+'</td><td class="n">'+money(r.debit)+'</td><td class="n">'+money(r.credit)+'</td><td class="n">'+(r.balance>0?money(r.balance):"")+'</td><td class="n">'+(r.balance<0?money(-r.balance):"")+'</td></tr>').join("")+
    '<tr><td><b>الإجمالي</b></td><td class="n"><b>'+money(tb.totals.debit)+'</b></td><td class="n"><b>'+money(tb.totals.credit)+'</b></td><td></td><td></td></tr></tbody></table></div></div></section>';
}
/* control accounts against the operational sub-ledgers kept in the app */
function reconHTML(d){
  const gl=E().ledger.buildGeneralLedger(d.entries),byCode=c=>(d.accounts.find(a=>a.code===c)||{}).id;
  const credit=load("skosif_v38_ledger",[]),arSub=Array.isArray(credit)?credit.reduce((s,c)=>s+(Number(c.balance)||0),0):0;
  const ap=load("skosif_erp_payables_v1",{}),apList=Array.isArray(ap)?ap:(ap.invoices||ap.bills||[]);
  const apSub=Array.isArray(apList)?apList.reduce((s,x)=>s+(Number(x.balance!=null?x.balance:(Number(x.amount)||0)-(Number(x.paid)||0))||0),0):0;
  const rows=[["1200","الذمم المدينة ↔ ائتمان المطاعم",arSub,1],["2100","الذمم الدائنة ↔ ذمم الموردين (ERP+)",apSub,-1]].map(([code,label,sub,sign])=>{
    const id=byCode(code);if(!id)return '<tr><td>'+esc(label)+'</td><td colspan="4">الحساب '+code+' غير موجود في الدليل</td></tr>';
    const r=E().reconciliation.reconcileSubledger({glAccountId:id,ledger:gl.map(x=>sign<0?{...x,balance:-x.balance}:x),subledgerBalance:r2(sub)});
    return '<tr><td>'+esc(label)+'</td><td class="n">'+money(r.glBalance)+'</td><td class="n">'+money(r.subledgerBalance)+'</td><td class="n">'+money(r.difference)+'</td><td>'+(r.matched?'<span class="sk-pill good">مطابق</span>':'<span class="sk-pill warn">فرق</span>')+'</td></tr>';
  }).join("");
  return '<section class="card"><div class="card-h"><div><h3>مطابقة الحسابات الرقابية</h3><p>رصيد الحساب في الأستاذ مقابل رصيد السجل التشغيلي نفسه في التطبيق.</p></div></div><div class="card-b"><div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>المطابقة</th><th>الأستاذ</th><th>السجل الفرعي</th><th>الفرق</th><th>الحالة</th></tr></thead><tbody>'+rows+'</tbody></table></div></div></section>';
}

/* ---------- posting (engines build the balanced entries) ---------- */
function ensureAcc(d,codes){const miss=codes.filter(c=>!d.accounts.some(a=>a.code===c));if(miss.length){toast("أضف الحسابات "+miss.join("، ")+" للدليل أولاً (أو أنشئ الدليل الأساسي)","warn");return false}return true}
const idOf=(d,c)=>d.accounts.find(a=>a.code===c).id;
function postSales(d){
  if(!ensureAcc(d,["1200","4000","2200"]))return;
  const vat=0.15,posted=new Set(d.entries.map(e=>e.sourceId));let n=0;
  let skipped=0;
  (load("aghnam-v12-manual-sales",[])||[]).forEach(x=>{try{
    if(!x||!x.id||posted.has("sale:"+x.id))return;
    const qty=Number(x.qty)||1,gross=Number(x.unitPrice)||((Number(x.amount)||0)/qty);if(!(gross>0))return;
    const bundle=window.SKEngines.sales.salesPosting.buildSalesPosting({id:x.id,number:x.id,date:String(x.date||"").slice(0,10),dueDate:String(x.date||"").slice(0,10),customerId:x.customer||x.phone||"عميل",status:"DRAFT",
      lines:[{itemId:x.item||"بيع",quantity:qty,unitPrice:r2(gross/(1+vat)),vatRate:vat}]},{receivableAccountId:idOf(d,"1200"),revenueAccountId:idOf(d,"4000"),vatPayableAccountId:idOf(d,"2200")});
    d.entries.push({...bundle.journal,id:SK.ui.uid("je"),memo:"بيع: "+(x.item||"")+" — "+(x.customer||""),reference:x.id,source:"مبيعات",sourceId:"sale:"+x.id});n++;
  }catch(err){skipped++}});
  put(d);toast((n?"رُحّلت "+n+" عملية بيع":"لم تُرحّل أي عملية")+(skipped?" — تُرك "+skipped+" غير مكتمل":""),n&&!skipped?"ok":"warn");
}
function postReceipts(d){
  if(!ensureAcc(d,["1300","1400","2100"]))return;
  const pur=load("skosif_purchasing_v1",{}),posted=new Set(d.entries.map(e=>e.sourceId));let n=0,skipped=0;
  (pur.receipts||[]).forEach(r=>{try{
    if(r.status!=="RECEIVED"||posted.has("receipt:"+r.id))return;
    const po=(pur.orders||[]).find(o=>o.id===r.orderId);if(!po)return;
    const bundle=window.SKEngines.procurement.procurementPosting.buildReceiptPosting(
      {id:po.id,number:po.number,date:po.date,dueDate:po.dueDate||po.date,supplierId:po.supplier,status:"OPEN",lines:po.lines.map(l=>({itemId:l.item,quantity:Number(l.qty)||0,unitCostExVat:Number(l.cost)||0,vatRate:Number(l.vat)||0}))},
      {id:r.id,number:r.id,date:r.date,purchaseOrderId:po.id,status:"DRAFT",lines:r.lines.map(l=>({itemId:l.item,quantity:Number(l.qty)||0}))},
      {inventoryAccountId:idOf(d,"1300"),inputVatAccountId:idOf(d,"1400"),payableAccountId:idOf(d,"2100")});
    d.entries.push({...bundle.journal,id:SK.ui.uid("je"),memo:"استلام من "+po.supplier+" — أمر "+po.number,reference:po.number,source:"مشتريات",sourceId:"receipt:"+r.id});n++;
  }catch(err){skipped++}});
  put(d);toast((n?"رُحّل "+n+" استلام":"لم يُرحّل أي استلام")+(skipped?" — تُرك "+skipped+" بلا تكلفة أو كمية (أكمل أسعار أمر الشراء)":""),n&&!skipped?"ok":"warn");
}

/* ---------- screen ---------- */
function paint(root){
  const d=db(),p=period();
  root.innerHTML=SK.ui.tabs([["accounts","دليل الحسابات",d.accounts.length],["entries","القيود",d.entries.length],["gl","الأستاذ العام"],["tb","ميزان المراجعة"],["recon","المطابقة"]],tab,"ledger")+
    (p?'<p class="hint">الفترة المالية النشطة: <b>'+esc(p.label)+'</b> ('+esc(p.startDate)+' → '+esc(p.endDate)+') — من «الشركات والفترات».</p>':'')+
    ({accounts:accountsHTML,entries:entriesHTML,gl:glHTML,tb:tbHTML,recon:reconHTML}[tab]||accountsHTML)(d);
}
function bind(root){
  root.addEventListener("click",async e=>{
    const t=e.target.closest("[data-tab]");if(t&&t.closest('[data-sk-tabs="ledger"]')){tab=t.dataset.tab;paint(root);return}
    const b=e.target.closest("[data-l]");if(!b)return;const a=b.dataset.l,d=db();
    if(a==="basic"){BASIC.forEach(([code,name,type])=>{if(!d.accounts.some(x=>x.code===code))d.accounts.push(E().accounts.createAccount({code,name,type}))});put(d);toast("أُنشئ دليل الحسابات الأساسي — عدّله حسب نشاطك","ok")}
    else if(a==="add-acc"){if(!SK.ui.validate(root))return;const acc=E().accounts.createAccount({code:$("#lg-code",root).value,name:$("#lg-name",root).value,type:$("#lg-type",root).value,parentId:$("#lg-parent",root).value});
      if(d.accounts.some(x=>x.code===acc.code))return toast("الرمز مستخدم لحساب آخر","warn");d.accounts.push(acc);put(d);toast("أُضيف الحساب","ok")}
    else if(a==="toggle"){const x=d.accounts.find(y=>y.id===b.dataset.id);if(x){x.active=!x.active;put(d)}}
    else if(a==="add-line"){draft.lines.push({accountId:"",debit:"",credit:""})}
    else if(a==="rm-line"){draft.lines.splice(+b.dataset.i,1)}
    else if(a==="save-entry"){
      const entry={id:SK.ui.uid("je"),date:draft.date,reference:draft.reference.trim(),memo:draft.memo.trim(),source:"يدوي",
        lines:draft.lines.filter(l=>l.accountId&&(Number(l.debit)||Number(l.credit))).map(l=>({accountId:l.accountId,debit:r2(l.debit),credit:r2(l.credit)}))};
      const err=$("#lg-err",root);
      if(entry.lines.length<2){err.textContent="القيد يحتاج سطرين على الأقل بحسابات ومبالغ";return}
      const v=E().ledger.validateJournalEntry(entry);
      if(!v.valid){err.textContent=[...new Set(v.issues.map(i=>ISSUE[i.code]||i.code))].join(" · ");return}
      d.entries.push(entry);put(d);draft=null;toast("حُفظ القيد","ok");
    }
    else if(a==="del-entry"){if(!await SK.confirm("حذف هذا القيد من الدفاتر؟",{danger:true,ok:"حذف"}))return;d.entries=d.entries.filter(x=>x.id!==b.dataset.id);put(d)}
    else if(a==="post-sales")postSales(d);
    else if(a==="post-receipts")postReceipts(d);
    else if(a==="gl-acc"){glAcc=b.dataset.id}
    else if(a==="tb-csv"){const tb=E().ledger.buildTrialBalance(d.entries.filter(x=>inPeriod(x,period())));SK.csv.download("trial-balance",["رمز الحساب","اسم الحساب","مدين","دائن","الرصيد"],tb.rows.map(r=>{const acc=d.accounts.find(x=>x.id===r.accountId)||{};return[acc.code||r.accountId,acc.name||"",r.debit,r.credit,r.balance]}));return}
    else if(a==="to-audit"){window.SKosifCore.go("auditdocs");return}
    paint(root);
  });
  /* typing updates the draft and the totals in place — no repaint, so focus and typing are never lost */
  const sync=e=>{
    const el=e.target;if(!draft)return;
    if(el.dataset.ln!=null)draft.lines[+el.dataset.ln][el.dataset.f]=el.value;
    if(el.id==="lg-date")draft.date=el.value;if(el.id==="lg-ref")draft.reference=el.value;if(el.id==="lg-memo")draft.memo=el.value;
    const td=draft.lines.reduce((s,l)=>s+(Number(l.debit)||0),0),tc=draft.lines.reduce((s,l)=>s+(Number(l.credit)||0),0);
    const a=root.querySelector("#lg-td"),b=root.querySelector("#lg-tc"),st=root.querySelector("#lg-st");
    if(a)a.textContent=money(td);if(b)b.textContent=money(tc);
    if(st)st.innerHTML=Math.abs(td-tc)<0.005&&td>0?'<span class="sk-pill good">متزن</span>':'<span class="sk-pill warn">فرق '+money(td-tc)+'</span>';
  };
  root.addEventListener("input",sync);root.addEventListener("change",sync);
}
SK.view("ledger",{render(node){if(!node.dataset.bound){bind(node);node.dataset.bound="1"}paint(node)}});
window.SKosifLedger=Object.freeze({entries:()=>db().entries,accounts:()=>db().accounts});
})();
