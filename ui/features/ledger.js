/* S.kosif — الدفاتر المحاسبية: دليل الحسابات، القيود، الأستاذ العام، ميزان المراجعة، المطابقة.
   الحساب يتم بمحركات مختبرة (SKEngines.finance.*، app/src/engine/fusion/finance).
   البيانات: skosif_ledger_v1 = {accounts:[], entries:[]} — لا توجد قيود افتراضية؛ دليل الحسابات الأساسي
   قالب يضيفه المستخدم بضغطة ويعدّله. */
(()=>{
"use strict";
const {$,esc,load,save,money,toast}=SK;
const E=()=>window.SKEngines.finance;
const KEY="skosif_ledger_v1",CO_KEY="skosif_companies_v1";
const TYPES={asset:"أصول",liability:"خصوم",equity:"حقوق ملكية",revenue:"إيرادات",expense:"مصروفات",other:"أخرى"};
const BASIC=[["1100","النقدية والبنوك","asset"],["1200","الذمم المدينة","asset"],["1300","المخزون","asset"],["1400","ضريبة القيمة المضافة — مدخلات","asset"],
  ["2100","الذمم الدائنة (الموردون)","liability"],["2200","ضريبة القيمة المضافة — مخرجات","liability"],["3000","رأس المال","equity"],["3100","الأرباح المبقاة","equity"],
  ["4000","إيرادات المبيعات","revenue"],["5000","تكلفة المبيعات","expense"],["6100","الرواتب والأجور","expense"],["6200","الإيجار","expense"],["6300","مصروفات تشغيلية أخرى","expense"]];
const ISSUE={JOURNAL_UNBALANCED:"القيد غير متزن: المدين لا يساوي الدائن",LINE_BOTH_SIDES:"سطر فيه مدين ودائن معاً",LINE_NEGATIVE_AMOUNT:"مبلغ سالب",LINE_ZERO_AMOUNT:"سطر بلا مبلغ"};
let tab="accounts",draft=null,glAcc="";
const db=()=>{const d=load(KEY,{});return{accounts:Array.isArray(d.accounts)?d.accounts:[],entries:Array.isArray(d.entries)?d.entries:[],lockDate:typeof d.lockDate==="string"?d.lockDate:""}};
const locked=(d,date)=>E().ledger.isPeriodLocked(date,d.lockDate);
/* operations already in the books: a reversed entry frees its operation to be posted again */
const postedSources=d=>new Set(d.entries.filter(e=>!e.reversedBy).map(e=>e.sourceId).filter(Boolean));
const put=d=>save(KEY,d);
const r2=v=>Math.round((Number(v)||0)*100)/100;
function period(){const c=load(CO_KEY,{});const a=c.active||{};const p=(c.periods||[]).find(x=>x.id===a.periodId);return p||null}
function inPeriod(e,p){return !p||(e.date>=p.startDate&&e.date<=p.endDate)}
const accName=(d,id)=>{const a=d.accounts.find(x=>x.id===id);return a?a.code+" · "+a.name:id==="__re__"?"أرباح مبقاة (نتائج سنوات سابقة)":id};
/* the period's trial balance: balance-sheet accounts to the period end (opening balances included), revenue and
   expenses for the period, and earlier results carried into retained earnings (3100) */
function periodTB(d,p){
  if(!p)return E().ledger.buildTrialBalance(d.entries);
  const re=d.accounts.find(a=>a.code==="3100")||d.accounts.find(a=>/مبق|محتجز/.test(a.name));
  return E().ledger.periodTrialBalance(d.entries,id=>(d.accounts.find(a=>a.id===id)||{}).type,{start:p.startDate,end:p.endDate},re?re.id:"__re__");
}
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
      list.slice(0,200).map(e=>'<tr><td class="n">'+esc(e.date)+'</td><td>'+esc(e.reference||"")+'</td><td>'+esc(e.memo||"")+'</td><td class="n">'+money(e.lines.reduce((s,l)=>s+l.debit,0))+'</td><td>'+esc(e.source||"يدوي")+'</td><td>'+entryState(d,e)+'</td></tr>').join("")+'</tbody></table></div>':SK.ui.state.empty({title:"لا توجد قيود في هذه الفترة"}))+
  '</div></section>'+postingHTML(d)+lockHTML(d);
}
/* a posted entry is corrected by a reversing entry, never deleted: the trail stays complete */
function entryState(d,e){
  if(e.reversedBy)return '<span class="sk-pill">معكوس</span>';
  if(e.reversalOf)return '<span class="sk-pill warn">قيد عكس</span>';
  return (locked(d,e.date)?'<span class="sk-pill" title="الفترة مقفلة">مقفل</span> ':'')+'<button type="button" class="linkish" data-l="rev-entry" data-id="'+esc(e.id)+'">عكس</button>';
}
function lockHTML(d){
  const l=d.lockDate,p=period();
  return '<section class="card"><div class="card-h"><div><h3>إقفال الدفاتر</h3><p>'+(l?'الدفاتر مقفلة حتى <b>'+esc(l)+'</b>: لا قيد ولا ترحيل ولا عكس بتاريخ في هذه المدة، فتبقى أرقام الفترات المعتمدة كما هي.':'لم تُقفل أي فترة. أقفل الفترة بعد اعتماد قوائمها حتى لا تتغير أرقامها بعد التقرير.')+'</p></div></div>'+
    '<div class="card-b"><div class="sk-actions"><label class="sk-field"><span>إقفال حتى تاريخ</span><input type="date" id="lg-lock" value="'+esc(l||(p&&p.endDate)||"")+'"></label><button type="button" class="btn" data-l="lock">إقفال الدفاتر</button>'+(l?'<button type="button" class="btn" data-l="unlock">فتح الإقفال</button>':'')+'</div></div></section>';
}
/* sales recorded in «تسجيل بيع» and receipts from «المشتريات» can be posted once */
function postingHTML(d){
  const posted=postedSources(d);
  const sales=(load("aghnam-v12-manual-sales",[])||[]).filter(x=>x&&x.id&&!posted.has("sale:"+x.id));
  const pur=load("skosif_purchasing_v1",{}),rec=(pur.receipts||[]).filter(r=>r.status==="RECEIVED"&&!posted.has("receipt:"+r.id));
  if(!sales.length&&!rec.length)return "";
  return '<section class="card"><div class="card-h"><div><h3>بانتظار الترحيل</h3><p>عمليات مسجلة في التطبيق ولم تُرحّل للدفاتر بعد. الأسعار في «تسجيل بيع» شاملة الضريبة، وتُرحّل معها تكلفة المبيعات من المخزون.</p></div></div><div class="card-b sk-stack">'+
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
  const p=period(),tb=periodTB(d,p);
  if(!tb.rows.length)return SK.ui.state.empty({title:"لا يوجد ميزان بعد",text:"الميزان يُبنى من القيود المسجلة."});
  const byType={};tb.rows.forEach(r=>{const a=d.accounts.find(x=>x.id===r.accountId);const t=a?a.type:"other";byType[t]=r2((byType[t]||0)+r.balance)});
  return '<section class="card"><div class="card-h"><div><h3>ميزان المراجعة</h3><p>'+(tb.balanced?'<span class="sk-pill good">متزن</span>':'<span class="sk-pill bad">غير متزن</span>')+(p?' — '+esc(p.label):'')+'</p></div><div class="sk-actions"><button type="button" class="btn" data-l="tb-csv">تصدير CSV</button><button type="button" class="btn primary" data-l="to-review">'+SK.icon("tbreview")+' إلى مركز المراجعة</button><button type="button" class="btn" data-l="to-studio">الاستوديو المتقدم</button></div></div><div class="card-b sk-stack">'+
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
/* unit cost excluding VAT for a sold item: weighted average of the goods received, else the dated cost rules of the sales lab, else the catalog cost */
const ckey=v=>String(v||"").trim().toLowerCase().replace(/[أإآ]/g,"ا").replace(/ة/g,"ه").replace(/ى/g,"ي").replace(/\s+/g," ");
function costResolver(){
  const pur=load("skosif_purchasing_v1",{}),layers=[];
  (pur.receipts||[]).filter(r=>r&&r.status==="RECEIVED").forEach(r=>{const po=(pur.orders||[]).find(o=>o.id===r.orderId);if(!po)return;
    (r.lines||[]).forEach(l=>{const pl=(po.lines||[]).find(x=>x.item===l.item);if(pl)layers.push({itemId:l.item,quantity:Number(l.qty)||0,unitCost:Number(pl.cost)||0})})});
  const wac=window.SKEngines.stock.inventory.weightedAverageCosts(layers,ckey),rules=load("skosif_cost_rules_v1",[]),cat=new Map();
  try{(window.SKosifCore.catalog().items||[]).forEach(i=>{if(Number(i.cost)>0)cat.set(ckey(i.name),Number(i.cost))})}catch{}
  return (item,date,channel)=>{const k=ckey(item);if(wac[k]>0)return wac[k];
    const r=(Array.isArray(rules)?rules:[]).filter(x=>x&&ckey(x.product)===k&&(!x.channel||x.channel===channel)&&(!x.from||x.from<=date)&&(!x.to||x.to>=date))
      .sort((a,b)=>Number(!!b.channel)-Number(!!a.channel)||String(b.from||"").localeCompare(String(a.from||"")))[0];
    if(r&&Number(r.cost)>0)return Number(r.cost);return cat.get(k)||null};
}
/* one sale from «تسجيل بيع» (prices include VAT) as a balanced entry with its cost of sales; shared with the demo company */
function saleEntry(d,x,costOf){
  const date=String(x.date||"").slice(0,10),qty=Number(x.qty)||1,gross=Number(x.unitPrice)||((Number(x.amount)||0)/qty);if(!(gross>0))return null;
  const withCost=d.accounts.some(a=>a.code==="5000")&&d.accounts.some(a=>a.code==="1300");
  const b=window.SKEngines.sales.salesPosting.buildSalesPosting({id:x.id,number:x.id,date,dueDate:date,customerId:x.customer||x.phone||"عميل",status:"DRAFT",
      lines:[{itemId:x.item||"بيع",quantity:qty,unitPrice:gross,vatRate:0.15,priceIncludesVat:true}]},
    {receivableAccountId:idOf(d,"1200"),revenueAccountId:idOf(d,"4000"),vatPayableAccountId:idOf(d,"2200")},
    withCost?{cogsAccountId:idOf(d,"5000"),inventoryAccountId:idOf(d,"1300"),unitCost:id=>costOf(id,date,x.category)}:undefined);
  if(!E().ledger.validateJournalEntry(b.journal).valid)return null;
  return {entry:{...b.journal,id:SK.ui.uid("je"),memo:"بيع: "+(x.item||"")+" — "+(x.customer||""),reference:x.id,source:"مبيعات",sourceId:"sale:"+x.id},cost:b.cost,uncosted:b.uncosted.length>0};
}
function postSales(d){
  if(!ensureAcc(d,["1200","4000","2200"]))return;
  const posted=postedSources(d),costOf=costResolver();let n=0,skipped=0,held=0,noCost=0,cost=0;
  (load("aghnam-v12-manual-sales",[])||[]).forEach(x=>{try{
    if(!x||!x.id||posted.has("sale:"+x.id))return;
    if(locked(d,String(x.date||"").slice(0,10))){held++;return}
    const r=saleEntry(d,x,costOf);if(!r){skipped++;return}
    d.entries.push(r.entry);cost+=r.cost;if(r.uncosted)noCost++;n++;
  }catch{skipped++}});
  put(d);
  toast((n?"رُحّلت "+n+" عملية بيع"+(cost?" مع تكلفة مبيعات "+money(cost):""):"لم تُرحّل أي عملية")+(noCost?" — "+noCost+" بلا تكلفة معروفة (أضف التكلفة في أوامر الشراء أو قواعد التكلفة)":"")+
    (held?" — "+held+" في فترة مقفلة":"")+(skipped?" — تُرك "+skipped+" غير مكتمل":""),n&&!skipped&&!noCost&&!held?"ok":"warn");
}
function postReceipts(d){
  if(!ensureAcc(d,["1300","1400","2100"]))return;
  const pur=load("skosif_purchasing_v1",{}),posted=postedSources(d);let n=0,skipped=0,held=0;
  (pur.receipts||[]).forEach(r=>{try{
    if(r.status!=="RECEIVED"||posted.has("receipt:"+r.id))return;
    if(locked(d,String(r.date||"").slice(0,10))){held++;return}
    const po=(pur.orders||[]).find(o=>o.id===r.orderId);if(!po)return;
    const bundle=window.SKEngines.procurement.procurementPosting.buildReceiptPosting(
      {id:po.id,number:po.number,date:po.date,dueDate:po.dueDate||po.date,supplierId:po.supplier,status:"OPEN",lines:po.lines.map(l=>({itemId:l.item,quantity:Number(l.qty)||0,unitCostExVat:Number(l.cost)||0,vatRate:Number(l.vat)||0}))},
      {id:r.id,number:r.id,date:r.date,purchaseOrderId:po.id,status:"DRAFT",lines:r.lines.map(l=>({itemId:l.item,quantity:Number(l.qty)||0}))},
      {inventoryAccountId:idOf(d,"1300"),inputVatAccountId:idOf(d,"1400"),payableAccountId:idOf(d,"2100")});
    if(!E().ledger.validateJournalEntry(bundle.journal).valid){skipped++;return}
    d.entries.push({...bundle.journal,id:SK.ui.uid("je"),memo:"استلام من "+po.supplier+" — أمر "+po.number,reference:po.number,source:"مشتريات",sourceId:"receipt:"+r.id});n++;
  }catch{skipped++}});
  put(d);toast((n?"رُحّل "+n+" استلام":"لم يُرحّل أي استلام")+(skipped?" — تُرك "+skipped+" بلا تكلفة أو كمية (أكمل أسعار أمر الشراء)":"")+(held?" — "+held+" في فترة مقفلة":""),n&&!skipped&&!held?"ok":"warn");
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
      if(locked(d,entry.date)){err.textContent="التاريخ داخل فترة مقفلة (حتى "+d.lockDate+") — اختر تاريخاً بعدها أو افتح الإقفال";return}
      d.entries.push(entry);put(d);draft=null;toast("حُفظ القيد","ok");
    }
    else if(a==="rev-entry"){
      const en=d.entries.find(x=>x.id===b.dataset.id);if(!en||en.reversedBy||en.reversalOf)return;
      const today=new Date().toISOString().slice(0,10);
      if(locked(d,today))return toast("اليوم داخل فترة مقفلة — افتح الإقفال أولاً","warn");
      if(!await SK.confirm("عكس القيد «"+(en.reference||en.memo||en.id)+"» بقيد مقابل بتاريخ اليوم؟ يبقى القيد الأصلي في السجل"+(en.sourceId?"، وتعود العملية إلى «بانتظار الترحيل» لترحيلها من جديد.":"."),{ok:"عكس القيد"}))return;
      const rv={...E().ledger.reverseJournalEntry(en,{id:SK.ui.uid("je"),date:today}),memo:"عكس: "+(en.memo||en.reference||""),source:"عكس",reversalOf:en.id,...(en.demo?{demo:true}:{})};
      en.reversedBy=rv.id;d.entries.push(rv);put(d);SK.audit&&SK.audit.log("ledger",{act:"reverse",id:en.id});toast("عُكس القيد","ok");
    }
    else if(a==="lock"){
      const v=$("#lg-lock",root).value;if(!/^\d{4}-\d{2}-\d{2}$/.test(v))return toast("اختر تاريخ الإقفال","warn");
      if(!await SK.confirm("إقفال الدفاتر حتى "+v+"؟ لن يُقبل بعدها قيد أو ترحيل أو عكس بتاريخ في هذه المدة.",{ok:"إقفال"}))return;
      d.lockDate=v;put(d);SK.audit&&SK.audit.log("ledger",{act:"lock",to:v});toast("أُقفلت الدفاتر حتى "+v,"ok");
    }
    else if(a==="unlock"){
      if(!await SK.confirm("فتح إقفال الدفاتر؟ يسمح بتغيير أرقام فترات معتمدة، ويُسجَّل في سجل التدقيق.",{danger:true,ok:"فتح الإقفال"}))return;
      SK.audit&&SK.audit.log("ledger",{act:"unlock",from:d.lockDate});d.lockDate="";put(d);
    }
    else if(a==="post-sales")postSales(d);
    else if(a==="post-receipts")postReceipts(d);
    else if(a==="gl-acc"){glAcc=b.dataset.id}
    else if(a==="tb-csv"){const tb=periodTB(d,period());SK.csv.download("trial-balance",["رمز الحساب","اسم الحساب","مدين","دائن","الرصيد"],tb.rows.map(r=>{const acc=d.accounts.find(x=>x.id===r.accountId)||(r.accountId==="__re__"?{code:"3199",name:accName(d,"__re__")}:{});return[acc.code||r.accountId,acc.name||"",r.debit,r.credit,r.balance]}));return}
    else if(a==="to-studio"){if(window.SKosifTBReview)SKosifTBReview.studio("documents");else window.SKosifCore.go("auditdocs");return}
    else if(a==="to-review"){if(window.SKosifTBReview)await SKosifTBReview.fromBooks();else window.SKosifCore.go("tbreview");return}
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
window.SKosifLedger=Object.freeze({entries:()=>db().entries,accounts:()=>db().accounts,lockDate:()=>db().lockDate,saleEntry:(d,x)=>saleEntry(d,x,costResolver())});
})();
