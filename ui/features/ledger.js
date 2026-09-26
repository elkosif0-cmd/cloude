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
  ["4000","إيرادات المبيعات","revenue"],["5000","تكلفة المبيعات","expense"],["6100","الرواتب والأجور","expense"],["6200","الإيجار","expense"],["6300","مصروفات تشغيلية أخرى","expense"],["2250","ضريبة القيمة المضافة — صافي مستحق للهيئة","liability"],["5100","فروقات الجرد والهدر","expense"],["4900","إيرادات أخرى","revenue"]];
const ISSUE={JOURNAL_UNBALANCED:"القيد غير متزن: المدين لا يساوي الدائن",LINE_BOTH_SIDES:"سطر فيه مدين ودائن معاً",LINE_NEGATIVE_AMOUNT:"مبلغ سالب",LINE_ZERO_AMOUNT:"سطر بلا مبلغ"};
let tab="",draft=null,glAcc="",vatQ="";
const db=()=>{const d=load(KEY,{})||{};return{...d,accounts:Array.isArray(d.accounts)?d.accounts:[],entries:Array.isArray(d.entries)?d.entries:[],lockDate:typeof d.lockDate==="string"?d.lockDate:""}};
const locked=(d,date)=>E().ledger.isPeriodLocked(date,d.lockDate);
/* operations already in the books: a reversed entry frees its operation to be posted again */
const postedSources=d=>new Set(d.entries.filter(e=>!e.reversedBy).map(e=>e.sourceId).filter(Boolean));
/* every save seals the entries posted since the last one into the journal's audit trail (edit log): a SHA-256 chain,
   so an edited, deleted or inserted entry shows (journal-chain-engine). Entries that were already in the books when
   the trail began stay «legacy» until sealed once; entries that appear in storage without passing through here are
   recorded as an integrity event before being sealed. Demo entries never enter the chain. */
const put=d=>{
  const CH=E().journalChain;
  if(CH){const now=new Date().toISOString(),stored=(load(KEY,{})||{}).entries||[];
    if(!d.chain){const had=new Set(stored.map(e=>e.id));d.entries.forEach(e=>{if(!e.hash&&!e.demo&&had.has(e.id))e.legacy=true});d.chain={since:now,events:[]}}
    else{const ext=CH.externalInserts(stored);if(ext.length){d.chain={...d.chain,events:[...(d.chain.events||[]),{at:now,ids:ext}].slice(-50)};d.entries.forEach(e=>{if(ext.includes(e.id))e.external=true})}}
    CH.sealNew(d.entries,now)}
  save(KEY,d);
};
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
function reconHTML(d){return controlHTML(d)+trailHTML(d)+revReconHTML(d)+bankHTML(d)+countHTML(d)}
/* ---------- the journal's audit trail (edit log) ---------- */
function trailOf(d){const CH=E().journalChain,p=period();if(!CH)return null;return{v:CH.verifyChain(d.entries),cov:p?CH.coversPeriod(d.entries,p.startDate,p.endDate):null,p,since:d.chain&&d.chain.since,events:(d.chain&&d.chain.events)||[]}}
function trailHTML(d){
  const t=trailOf(d);if(!t||!d.entries.length)return "";
  const v=t.v,ok=v.ok&&!t.events.length,fmt=x=>x?String(x).slice(0,10):"—";
  return '<section class="card"><div class="card-h"><div><h3>سجل التعديلات وسلامة القيود</h3><p>كل قيد يُختم عند حفظه في سلسلة SHA-256 مرتبطة بالقيد السابق — التصحيح بقيد عكسي لا بالحذف، فأي تعديل أو حذف أو إدراج خارج الدفاتر يظهر هنا. على نهج مراجعي ريلاينس وإنفوسيس الذين يشهدون أن سجل التعديلات «عمل طوال السنة ولم يُتلاعب به»، وسلسلة فواتير هيئة الزكاة والضريبة.</p></div><span class="sk-pill '+(ok?'good':'bad')+'">'+(ok?(v.legacy?'سليم — مع قيود سابقة للتفعيل':'سليم'):'يحتاج مراجعة')+'</span></div><div class="card-b">'+
    '<div class="lg-kpis"><div><small>قيود مختومة</small><b>'+v.sealed+'</b><span>من '+(v.total-v.demo)+(v.demo?' (عدا '+v.demo+' تجريبي)':'')+'</span></div><div><small>سابقة للتفعيل</small><b>'+v.legacy+'</b><span>مفعل منذ '+fmt(t.since)+'</span></div><div><small>القيود العكسية</small><b>'+v.reversals+'</b><span>يدوية '+v.manual+'</span></div><div><small>ختم السلسلة</small><b class="mono">'+esc(v.head.slice(0,12))+'…</b><span>'+fmt(v.firstDate)+' ← '+fmt(v.lastDate)+'</span></div></div>'+
    (t.cov?'<p class="hint">الفترة النشطة ('+esc(t.p.label||"")+'): '+(t.cov.throughout?'السجل يغطي كل قيودها ('+t.cov.entries+' قيداً).':t.cov.entries?t.cov.uncovered+' من '+t.cov.entries+' قيداً خارج السجل — اختمها لتكتمل التغطية.':'لا قيود بعد.')+'</p>':'')+
    (v.issues.length?'<ul class="lg-issues">'+v.issues.slice(0,12).map(i=>'<li><span class="sk-pill bad">'+esc(i.ar)+'</span> '+esc(i.id)+(i.seq?' (#'+i.seq+')':'')+'</li>').join("")+'</ul>':'')+
    (t.events.length?'<p class="lg-warn">رُصد '+t.events.length+' حدث إدراج قيود من خارج الدفاتر (آخره '+fmt(t.events[t.events.length-1].at)+')، ثم خُتمت. راجع القيود المعلّمة «من خارج الدفاتر».</p>':'')+
    (ok&&t.cov&&t.cov.throughout?'<p class="lg-ok">تستخدم الدفاتر سجل تعديلات يعمل على جميع القيود المرحّلة للفترة، ولم يُرصد أي تلاعب به، ويُحفظ مع النسخ الاحتياطية.</p>':'')+
    '<div class="sk-actions">'+(v.legacy?'<button type="button" class="btn sm" data-l="trail-seal">ختم القيود السابقة للتفعيل ('+v.legacy+')</button>':'')+'<button type="button" class="btn sm" data-l="trail-csv">تصدير سجل التعديلات</button></div></div></section>';
}
/* ---------- revenue: the sales register against the ledger ---------- */
function revReconOf(d){
  const RR=window.SKEngines.audit&&SKEngines.audit.revenueRecon,p=period();if(!RR)return null;
  const rev=d.accounts.filter(a=>a.type==="revenue").map(a=>a.id);if(!rev.length)return null;
  const yr=String(new Date().getFullYear()),start=p?p.startDate:yr+"-01-01",end=p?p.endDate:yr+"-12-31";
  const sales=(load("aghnam-v12-manual-sales",[])||[]).filter(x=>x&&x.id).map(x=>{const q=Number(x.qty)||1,g=(Number(x.unitPrice)||((Number(x.amount)||0)/q))*q;return{id:String(x.id),date:String(x.date||"").slice(0,10),gross:Math.round(g*100)}});
  const cents=l=>({accountId:l.accountId,debit:Math.round((Number(l.debit)||0)*100),credit:Math.round((Number(l.credit)||0)*100)});
  const entries=d.entries.map(e=>({id:e.id,date:String(e.date).slice(0,10),source:e.source,sourceId:e.sourceId,memo:e.memo,reversalOf:e.reversalOf,reversedBy:e.reversedBy,lines:(e.lines||[]).map(cents)}));
  return {start,end,r:RR.reconcileRevenue({sales,entries,revenueAccounts:rev,start,end})};
}
function revReconHTML(d){
  const x=revReconOf(d);if(!x||(!x.r.rows.length&&!x.r.unposted.length))return "";
  const r=x.r,h=v=>money(v/100);
  return '<section class="card"><div class="card-h"><div><h3>مطابقة الإيرادات: سجل المبيعات ↔ دفتر الأستاذ</h3><p>كما يفعل مراجعو e& ودويتشه تيليكوم: مطابقة المبيعات المسجلة (بعد الضريبة) مع إيرادات الأستاذ لكل شهر، وحصر القيود اليدوية على الإيرادات، والمبيعات المعكوسة بعد نهاية الفترة (القطع).</p></div><span class="sk-pill '+(r.reconciled?'good':'bad')+'">'+(r.reconciled?'مطابق':'فروقات')+'</span></div><div class="card-b">'+
    '<div class="sk-table-wrap"><table class="sk-table" data-sk-plain><thead><tr><th>الشهر</th><th>سجل المبيعات</th><th>الأستاذ</th><th>منها قيود أخرى</th><th>الفرق</th></tr></thead><tbody>'+
    r.rows.map(m=>'<tr><td class="n">'+esc(m.month)+'</td><td class="n">'+h(m.source)+'</td><td class="n">'+h(m.ledger)+'</td><td class="n">'+(m.other?h(m.other):'—')+'</td><td class="n">'+(m.diff?h(m.diff):'✓')+'</td></tr>').join("")+
    '<tr class="tot"><td>المجموع</td><td class="n">'+h(r.source)+'</td><td class="n">'+h(r.ledger)+'</td><td class="n">'+h(r.otherRevenue)+'</td><td class="n">'+h(r.diff)+'</td></tr></tbody></table></div>'+
    (r.unposted.length?'<p class="lg-warn">'+r.unposted.length+' عملية بيع لم تُرحّل بعد بمبلغ '+h(r.unposted.reduce((s,u)=>s+u.amount,0))+' — رحّلها من «القيود».</p>':'')+
    (r.manual.length?'<h4>قيود على الإيرادات من غير سجل المبيعات ('+r.manual.length+')</h4><ul class="lg-issues">'+r.manual.slice(0,10).map(m=>'<li>'+esc(m.date)+' · '+esc(m.source)+' · '+esc(m.memo||m.id)+' — <b>'+h(m.amount)+'</b></li>').join("")+'</ul><p class="hint">اطلب مستند كل قيد يدوي على الإيرادات — من أهم اختبارات تجاوز الإدارة للرقابة.</p>':'')+
    (r.reversedAfter.length?'<p class="lg-warn">'+r.reversedAfter.length+' قيد إيراد من داخل الفترة عُكس بعد نهايتها — تحقق من صحة القطع.</p>':'')+
    '<p class="hint">نافذة القطع: '+esc(r.cutoff.from)+' ← '+esc(r.cutoff.to)+' — '+r.cutoff.count+' عملية بمبلغ '+h(r.cutoff.amount)+' لاختبار عينة منها مع إثباتات التسليم.</p></div></section>';
}
function controlHTML(d){
  const gl=E().ledger.buildGeneralLedger(d.entries),byCode=c=>(d.accounts.find(a=>a.code===c)||{}).id;
  const credit=load("skosif_v38_ledger",[]),arSub=Array.isArray(credit)?credit.reduce((s,c)=>s+(Number(c.balance)||0),0):0;
  /* supplier bills of ERP+ are {rows:[{amount, paid}]} where paid is a flag or an amount */
  const ap=load("skosif_erp_payables_v1",{}),apList=Array.isArray(ap)?ap:(ap.rows||ap.invoices||ap.bills||[]);
  const apSub=Array.isArray(apList)?apList.reduce((s,x)=>s+(x.balance!=null?Number(x.balance)||0:x.paid===true?0:(Number(x.amount)||0)-(Number(x.paid)||0)),0):0;
  const rows=[["1200","الذمم المدينة ↔ ائتمان المطاعم",arSub,1],["2100","الذمم الدائنة ↔ ذمم الموردين (ERP+)",apSub,-1]].map(([code,label,sub,sign])=>{
    const id=byCode(code);if(!id)return '<tr><td>'+esc(label)+'</td><td colspan="4">الحساب '+code+' غير موجود في الدليل</td></tr>';
    const r=E().reconciliation.reconcileSubledger({glAccountId:id,ledger:gl.map(x=>sign<0?{...x,balance:-x.balance}:x),subledgerBalance:r2(sub)});
    return '<tr><td>'+esc(label)+'</td><td class="n">'+money(r.glBalance)+'</td><td class="n">'+money(r.subledgerBalance)+'</td><td class="n">'+money(r.difference)+'</td><td>'+(r.matched?'<span class="sk-pill good">مطابق</span>':'<span class="sk-pill warn">فرق</span>')+'</td></tr>';
  }).join("");
  return '<section class="card"><div class="card-h"><div><h3>مطابقة الحسابات الرقابية</h3><p>رصيد الحساب في الأستاذ مقابل رصيد السجل التشغيلي نفسه في التطبيق.</p></div></div><div class="card-b"><div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>المطابقة</th><th>الأستاذ</th><th>السجل الفرعي</th><th>الفرق</th><th>الحالة</th></tr></thead><tbody>'+rows+'</tbody></table></div></div></section>';
}

/* ---------- the cash cycle: what customers owe, what is owed to suppliers, straight from the books ---------- */
const byCode=(d,c)=>(d.accounts.find(a=>a.code===c)||{}).id;
const today=()=>new Date().toISOString().slice(0,10);
/* the customer or supplier of an entry: named on new entries, read from the operation for older ones */
function withParties(d){
  const sales=load("aghnam-v12-manual-sales",[])||[],pur=load("skosif_purchasing_v1",{});
  const sale=new Map(sales.filter(x=>x&&x.id).map(x=>[String(x.id),x.customer||x.phone||""]));
  const rec=new Map((pur.receipts||[]).map(r=>{const po=(pur.orders||[]).find(o=>o.id===r.orderId);return [String(r.id),po?po.supplier||"":""]}));
  return d.entries.map(e=>{if(e.party||!e.sourceId)return e;const s=String(e.sourceId);
    const party=s.startsWith("sale:")?sale.get(s.slice(5)):s.startsWith("receipt:")?rec.get(s.slice(8)):"";return party?{...e,party}:e});
}
const BUCKETS=[["current","غير مستحق"],["1-30","1–30"],["31-60","31–60"],["61-90","61–90"],["90+","أكثر من 90"]];
function partyTable(r,kind,glBal){
  const who=kind==="ar"?"العميل":"المورد",act=kind==="ar"?"تحصيل":"سداد";
  if(!r.rows.length&&!r.unassigned)return SK.ui.state.empty({title:kind==="ar"?"لا ذمم عملاء في الدفاتر":"لا ذمم موردين في الدفاتر",text:kind==="ar"?"رحّل المبيعات الآجلة من «القيود».":"رحّل استلامات المشتريات من «القيود»."});
  const open=r.rows.filter(x=>Math.abs(x.balance)>0.004);
  return '<div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>'+who+'</th><th>الرصيد</th>'+BUCKETS.map(b=>'<th>'+b[1]+'</th>').join("")+'<th>أقدم مستحق</th><th></th></tr></thead><tbody>'+
    open.map(x=>'<tr><td>'+esc(x.party)+'</td><td class="n"><b>'+money(x.balance)+'</b></td>'+BUCKETS.map(b=>'<td class="n">'+(x.aging[b[0]]?money(x.aging[b[0]]):"")+'</td>').join("")+'<td class="n">'+esc(x.oldestOpen||"—")+'</td>'+
      '<td><button type="button" class="linkish" data-l="cash-fill" data-kind="'+kind+'" data-party="'+esc(x.party)+'" data-amt="'+Math.max(0,x.balance)+'">'+act+'</button> · <button type="button" class="linkish" data-l="stmt" data-kind="'+kind+'" data-party="'+esc(x.party)+'">كشف حساب</button></td></tr>').join("")+
    '<tr><td><b>الإجمالي</b></td><td class="n"><b>'+money(r.balance)+'</b></td>'+BUCKETS.map(b=>'<td class="n"><b>'+money(r.totals[b[0]])+'</b></td>').join("")+'<td></td><td></td></tr></tbody></table></div>'+
    '<p class="hint">'+(r.unassigned?'أرصدة في قيود لا تسمّي '+who+' (ملخصات أو أرصدة افتتاحية): '+money(r.unassigned)+'. ':'')+
    'رصيد الحساب في الأستاذ: '+money(glBal)+(Math.abs(r.balance+r.unassigned-glBal)<0.01?' <span class="sk-pill good">يطابق</span>':' <span class="sk-pill warn">فرق '+money(r.balance+r.unassigned-glBal)+'</span>')+'</p>';
}
function cashHTML(d){
  const ar=byCode(d,"1200"),ap=byCode(d,"2100"),cash=byCode(d,"1100");
  if(!ar||!ap||!cash)return SK.ui.state.empty({title:"أكمل دليل الحسابات",text:"التحصيل والسداد يحتاج الحسابات 1100 و1200 و2100 (أنشئ الدليل الأساسي)."});
  const ents=withParties(d),t=today(),terms=Number.isFinite(d.termsDays)?d.termsDays:30;
  const R=E().partyLedger.partyBalances(ents,ar,"debit",t,terms),P=E().partyLedger.partyBalances(ents,ap,"credit",t,terms);
  const gl=E().ledger.buildGeneralLedger(d.entries),glOf=(id,sign)=>{const x=gl.find(g=>g.accountId===id);return x?sign*x.balance:0};
  const late=k=>k.totals["61-90"]+k.totals["90+"],names=[...new Set([...R.rows,...P.rows].map(x=>x.party))];
  return '<div class="sk-kpis">'+
      '<div class="sk-kpi"><span>مستحق من العملاء</span><b>'+money(R.balance+R.unassigned)+'</b></div>'+
      '<div class="sk-kpi '+(late(R)>0?'bad':'good')+'"><span>متأخر أكثر من 60 يوماً</span><b>'+money(late(R))+'</b></div>'+
      '<div class="sk-kpi"><span>مستحق للموردين</span><b>'+money(P.balance+P.unassigned)+'</b></div>'+
      '<div class="sk-kpi accent"><span>النقدية والبنوك</span><b>'+money(glOf(cash,1))+'</b></div></div>'+
    '<section class="card"><div class="card-h"><div><h3>تسجيل تحصيل أو سداد</h3><p>يُرحّل فوراً بقيد متزن يسمّي العميل أو المورد، فتظهر أرصدتهم وأعمارهم وكشوف حساباتهم من الدفاتر نفسها.</p></div></div><div class="card-b sk-stack">'+
      '<div class="sk-grid2"><label class="sk-field"><span>العملية</span><select id="lg-ck"><option value="ar">تحصيل من عميل</option><option value="ap">سداد إلى مورد</option></select></label>'+
      '<label class="sk-field"><span>الاسم</span><input id="lg-cp" list="lg-parties" autocomplete="off" data-sk-required></label>'+
      '<label class="sk-field"><span>المبلغ (ر.س)</span><input id="lg-ca" inputmode="decimal" data-sk-required></label>'+
      '<label class="sk-field"><span>التاريخ</span><input id="lg-cd" type="date" value="'+t+'"></label>'+
      '<label class="sk-field"><span>الطريقة</span><select id="lg-cm"><option>نقدي</option><option>مدى</option><option>تحويل بنكي</option><option>شيك</option></select></label>'+
      '<label class="sk-field"><span>المرجع (اختياري)</span><input id="lg-cr" placeholder="رقم السند أو الحوالة"></label></div>'+
      '<datalist id="lg-parties">'+names.map(n=>'<option value="'+esc(n)+'">').join("")+'</datalist>'+
      '<div class="sk-error" id="lg-cerr" role="alert"></div><div class="sk-actions"><button type="button" class="btn primary" data-l="settle">تسجيل وترحيل</button>'+
      '<label class="sk-field"><span>مدة الائتمان (يوم)</span><input id="lg-terms" type="number" min="0" max="365" value="'+terms+'" style="width:90px"></label></div></div></section>'+
    '<section class="card"><div class="card-h"><div><h3>أعمار ذمم العملاء</h3><p>التحصيلات تسدد أقدم الفواتير أولاً، والعمر يُحسب من تاريخ الاستحقاق (تاريخ البيع + مدة الائتمان).</p></div></div><div class="card-b">'+partyTable(R,"ar",glOf(ar,1))+'</div></section>'+
    '<section class="card"><div class="card-h"><div><h3>أعمار ذمم الموردين</h3><p>من استلامات المشتريات المرحّلة ومدفوعاتها.</p></div></div><div class="card-b">'+partyTable(P,"ap",glOf(ap,-1))+'</div></section>';
}
function printStatement(d,party,kind){
  const acc=byCode(d,kind==="ap"?"2100":"1200");if(!acc)return;
  const lines=E().partyLedger.partyStatement(withParties(d),acc,kind==="ap"?"credit":"debit",party),last=lines.length?lines[lines.length-1].balance:0;
  const w=window.open("","_blank");if(!w)return toast("اسمح بالنوافذ المنبثقة لعرض كشف الحساب","warn");
  w.document.write('<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>كشف حساب — '+esc(party)+'</title></head><body>'+
    '<h1>كشف حساب '+(kind==="ap"?"مورد":"عميل")+'</h1><p><b>'+esc(party)+'</b> · حتى '+today()+'</p>'+
    '<table><thead><tr><th>التاريخ</th><th>المرجع</th><th>البيان</th><th>'+(kind==="ap"?"فواتير":"مبيعات")+'</th><th>'+(kind==="ap"?"مدفوعات":"تحصيلات")+'</th><th>الرصيد</th></tr></thead><tbody>'+
    lines.map(l=>'<tr><td>'+esc(l.date)+'</td><td>'+esc(l.reference||"")+'</td><td>'+esc(l.memo||"")+'</td><td>'+(l.charge?money(l.charge):"")+'</td><td>'+(l.settlement?money(l.settlement):"")+'</td><td>'+money(l.balance)+'</td></tr>').join("")+
    '</tbody></table><p>'+(last>=0?'الرصيد المستحق':'رصيد دائن (دفعة مقدمة)')+': <b>'+money(Math.abs(last))+'</b></p></body></html>');
  w.document.close();SK.brandPrint(w,"كشف حساب — "+party);
}
/* ---------- bank reconciliation: the cash account against the bank statement ---------- */
const addDays=(iso,n)=>new Date(Date.parse(iso+"T00:00:00Z")+n*864e5).toISOString().slice(0,10);
const ACC_OPTS=(d,sel)=>d.accounts.filter(a=>a.active!==false).slice().sort((a,b)=>a.code.localeCompare(b.code)).map(a=>'<option value="'+esc(a.id)+'"'+(a.id===sel?' selected':'')+'>'+esc(a.code+" · "+a.name)+'</option>').join("");
/* the usual other side of a line only the bank knows: fees to operating expenses, profit to other income, transfers to receivables */
const bankDefault=(d,l)=>l.amount<0?byCode(d,"6300"):(/أرباح|فائد|عائد|profit|interest/i.test(l.description||"")&&byCode(d,"4900"))||byCode(d,"1200");
function bankCalc(d){
  const B=d.bank||{},lines=Array.isArray(B.lines)?B.lines:[],cash=byCode(d,"1100");if(!cash||!lines.length)return null;
  const dates=lines.map(l=>l.date).sort(),start=dates[0],end=dates[dates.length-1],cleared=new Set(B.cleared||[]),BR=E().bankReconciliation;
  const allBook=BR.bookCashLines(d.entries,cash),bookBalance=r2(allBook.filter(l=>l.date<=end).reduce((t,l)=>t+l.amount,0));
  const book=allBook.filter(l=>!cleared.has(l.id)&&l.date>=addDays(start,-10)&&l.date<=end);
  const m=BR.matchBankLines(lines,book,{days:5,manual:B.manual||[]});
  const closing=Number.isFinite(B.closing)?B.closing:null;
  return {B,lines,start,end,m,closing,st:closing==null?null:BR.bankReconciliationStatement({statementBalance:closing,bookBalance,unmatchedBank:m.unmatchedBank,unmatchedBook:m.unmatchedBook})};
}
function bankHTML(d){
  const c=bankCalc(d),hist=((d.bank||{}).history||[]).slice(-4).reverse();
  const head='<section class="card"><div class="card-h"><div><h3>مطابقة البنك</h3><p>كشف الحساب البنكي مقابل حساب النقدية والبنوك (1100): تُطابق المبالغ المتساوية خلال 5 أيام، ويُعد بيان التسوية تلقائياً.</p></div>'+
    '<div class="sk-actions"><button type="button" class="btn" data-l="bank-tpl">قالب الكشف</button><button type="button" class="btn primary" data-l="bank-import">استيراد كشف البنك</button>'+(c?'<button type="button" class="btn" data-l="bank-clear">مسح الكشف</button>':'')+'</div></div><div class="card-b sk-stack">';
  const histH=hist.length?'<p class="hint">آخر المطابقات المعتمدة: '+hist.map(h=>esc(h.end)+' ('+money(h.closing)+')').join(" · ")+'</p>':'';
  if(!c)return head+(byCode(d,"1100")?SK.ui.state.empty({title:"لا يوجد كشف بنكي",text:"نزّل القالب واملأه من كشف البنك (التاريخ، البيان، وارد، صادر، الرصيد) ثم استورده."}):SK.ui.state.empty({title:"أنشئ حساب النقدية والبنوك 1100 أولاً"}))+histH+'</div></section>';
  const {m,st,start,end}=c,row=(l,x)=>'<td class="n">'+esc(l.date)+'</td><td>'+esc(x)+'</td><td class="n">'+money(l.amount)+'</td>';
  return head+
    '<div class="sk-grid2"><p>الكشف من <b>'+esc(start)+'</b> إلى <b>'+esc(end)+'</b> — '+c.lines.length+' سطراً، طوبق منها '+m.matches.length+'.</p>'+
      '<label class="sk-field"><span>رصيد الكشف في '+esc(end)+'</span><input id="lg-bclose" inputmode="decimal" value="'+(c.closing==null?"":c.closing)+'" placeholder="من آخر سطر في الكشف"></label></div>'+
    (st?'<div class="sk-table-wrap"><table class="sk-table"><tbody>'+
      [["رصيد كشف البنك",st.statementBalance],["+ إيداعات في الدفاتر لم تظهر في البنك بعد",st.depositsInTransit],["− مدفوعات في الدفاتر لم تُصرف بعد",st.outstandingPayments],["= الرصيد المعدل للبنك",st.adjustedBank,1],
       ["رصيد الدفاتر",st.bookBalance],["+ إيداعات في البنك غير مسجلة في الدفاتر",st.bankOnlyIn],["− خصومات في البنك غير مسجلة (رسوم، عمولات)",st.bankOnlyOut],["= الرصيد المعدل للدفاتر",st.adjustedBook,1]]
        .map(([l,v,b])=>'<tr><td>'+(b?'<b>'+l+'</b>':l)+'</td><td class="n">'+(b?'<b>'+money(v)+'</b>':money(v))+'</td></tr>').join("")+
      '<tr><td><b>الفرق</b></td><td class="n">'+(st.reconciled?'<span class="sk-pill good">مطابق</span>':'<span class="sk-pill bad">'+money(st.difference)+'</span>')+'</td></tr></tbody></table></div>':'<div class="sk-note warn">أدخل رصيد الكشف في نهايته ليُعد بيان التسوية.</div>')+
    (m.unmatchedBank.length?'<h4>في البنك فقط — رحّلها بقيد</h4><div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>التاريخ</th><th>البيان</th><th>المبلغ</th><th>الحساب المقابل</th><th></th></tr></thead><tbody>'+
      m.unmatchedBank.map(l=>'<tr>'+row(l,l.description||l.reference||"")+'<td><select data-bacc="'+esc(l.id)+'" aria-label="الحساب المقابل">'+ACC_OPTS(d,bankDefault(d,l))+'</select></td><td><button type="button" class="linkish" data-l="bank-post" data-id="'+esc(l.id)+'">ترحيل</button></td></tr>').join("")+'</tbody></table></div>':'')+
    (m.unmatchedBook.length?'<h4>في الدفاتر فقط — معلقة أو تحتاج مطابقة يدوية</h4><div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>التاريخ</th><th>البيان</th><th>المبلغ</th><th>مطابقة يدوية</th><th></th></tr></thead><tbody>'+
      m.unmatchedBook.map(l=>'<tr>'+row(l,[l.reference,l.memo].filter(Boolean).join(" — "))+'<td><select data-bpair="'+esc(l.id)+'" aria-label="سطر الكشف"><option value="">—</option>'+m.unmatchedBank.map(b=>'<option value="'+esc(b.id)+'">'+esc(b.date+" · "+money(b.amount)+" · "+(b.description||""))+'</option>').join("")+'</select></td><td><button type="button" class="linkish" data-l="bank-pair" data-id="'+esc(l.id)+'">ربط</button></td></tr>').join("")+'</tbody></table></div>':'')+
    '<div class="sk-actions">'+(st&&st.reconciled?'<button type="button" class="btn primary" data-l="bank-save">اعتماد المطابقة</button>':'')+'<span class="hint">الاعتماد يثبّت السطور المطابقة فلا تظهر في الكشف التالي.</span></div>'+histH+'</div></section>';
}
/* ---------- stock count: the inventory account brought to what is on the shelves ---------- */
function countHTML(d){
  const inv=byCode(d,"1300");if(!inv)return "";
  const C=d.count||{},date=C.date||today(),qty=C.qty||{},costOf=costResolver();
  const items=[...new Set([...costLayers().map(l=>l.itemId),...Object.keys(qty)])].sort((a,b)=>a.localeCompare(b,"ar"));
  const v=window.SKEngines.stock.inventory.stockCountValuation(items.map(i=>({itemId:i,countedQty:Number(qty[i])||0})),i=>costOf(i,date));
  const gl=E().ledger.buildGeneralLedger(d.entries.filter(e=>String(e.date).slice(0,10)<=date)),book=r2(((gl.find(g=>g.accountId===inv)||{}).balance)||0);
  const entered=Object.values(qty).some(x=>Number(x)>0),diff=r2(v.value-book);
  return '<section class="card"><div class="card-h"><div><h3>الجرد وتسوية المخزون</h3><p>أدخل الكميات المعدودة؛ تُقيّم بمتوسط تكلفة الاستلامات حتى تاريخ الجرد، ويُرحّل الفرق مع حساب المخزون إلى «فروقات الجرد والهدر» (5100).</p></div></div><div class="card-b sk-stack">'+
    '<label class="sk-field" style="max-width:220px"><span>تاريخ الجرد</span><input type="date" id="lg-cntd" value="'+esc(date)+'"></label>'+
    (items.length?'<div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>الصنف</th><th>الكمية المعدودة</th><th>تكلفة الوحدة</th><th>القيمة</th></tr></thead><tbody>'+
      v.rows.map(r=>'<tr><td>'+esc(r.itemId)+'</td><td><input data-cnt="'+esc(r.itemId)+'" inputmode="decimal" value="'+(qty[r.itemId]==null?"":esc(qty[r.itemId]))+'" style="width:110px" aria-label="كمية '+esc(r.itemId)+'"></td><td class="n">'+(r.unitCost==null?"—":money(r.unitCost))+'</td><td class="n">'+money(r.value)+'</td></tr>').join("")+
      '<tr><td><b>قيمة الجرد</b></td><td></td><td></td><td class="n"><b>'+money(v.value)+'</b></td></tr></tbody></table></div>':SK.ui.state.empty({title:"لا أصناف مستلمة بعد",text:"الأصناف تأتي من استلامات المشتريات."}))+
    (v.uncosted.length?'<div class="sk-note warn">بلا تكلفة معروفة: '+v.uncosted.map(esc).join("، ")+' — قيمتها صفر في الجرد.</div>':'')+
    '<p>رصيد المخزون في الدفاتر في '+esc(date)+': <b>'+money(book)+'</b>'+(entered?' — الفرق: <b>'+money(diff)+'</b> '+(diff<0?'(عجز)':diff>0?'(زيادة)':''):'')+'</p>'+
    (entered&&Math.abs(diff)>=0.01?'<div class="sk-actions"><button type="button" class="btn primary" data-l="count-post">ترحيل فرق الجرد</button><span class="hint">تأكد من عدّ كل الأصناف الموجودة: الصنف غير المدخل يُعد صفراً.</span></div>':'')+
  '</div></section>';
}
/* ---------- the VAT return from the books (ZATCA layout), quarter by quarter ---------- */
function quarters(year){
  const p=period(),y=Number(year||((p&&p.startDate)||today()).slice(0,4)),iso=(m,dd)=>new Date(Date.UTC(y,m,dd)).toISOString().slice(0,10);
  return [0,1,2,3].map(q=>({id:y+"-Q"+(q+1),label:"الربع "+["الأول","الثاني","الثالث","الرابع"][q],start:iso(q*3,1),end:iso(q*3+3,0),due:iso(q*3+4,0)}))
    .concat([{id:String(y),label:"السنة "+y,start:iso(0,1),end:iso(12,0),due:iso(13,0)}]);
}
function vatCalc(d,qid){
  const out=byCode(d,"2200"),inp=byCode(d,"1400");if(!out||!inp)return null;
  const want=qid||vatQ,Q=quarters(want&&want.slice(0,4)),t=today(),q=Q.find(x=>x.id===want)||Q.find(x=>x.id.includes("Q")&&t>=x.start&&t<=x.end)||Q[0];
  const r=E().vatReturn.vatReturn({entries:d.entries,start:q.start,end:q.end,outputVatAccountId:out,inputVatAccountId:inp,
    typeOf:id=>(d.accounts.find(a=>a.id===id)||{}).type,controlAccountIds:["1100","1200","2100","2250"].map(c=>byCode(d,c)).filter(Boolean)});
  return {Q,q,r,out,inp,settled:d.entries.find(e=>e.sourceId==="vat:"+q.id&&!e.reversedBy)};
}
function vatHTML(d){
  const v=vatCalc(d);
  if(!v)return SK.ui.state.empty({title:"أكمل دليل الحسابات",text:"الإقرار يحتاج حسابي ضريبة المخرجات 2200 والمدخلات 1400."});
  const {Q,q,r,settled}=v;
  return '<section class="card"><div class="card-h"><div><h3>إقرار ضريبة القيمة المضافة — '+esc(q.label)+'</h3><p>من القيود المرحّلة بين '+esc(q.start)+' و'+esc(q.end)+' بنموذج هيئة الزكاة والضريبة والجمارك. آخر موعد للتقديم: <b>'+esc(q.due)+'</b>.</p></div></div><div class="card-b sk-stack">'+
    '<div class="sk-chips">'+Q.map(x=>'<button type="button" class="chip'+(x.id===q.id?' active':'')+'" data-l="vatq" data-q="'+x.id+'" aria-pressed="'+(x.id===q.id)+'">'+esc(x.label)+'</button>').join("")+'</div>'+
    '<div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>البند</th><th>المبلغ (بلا ضريبة)</th><th>الضريبة</th></tr></thead><tbody>'+
      '<tr><td>1. المبيعات الخاضعة للنسبة الأساسية (15%)</td><td class="n">'+money(r.salesBase)+'</td><td class="n">'+money(r.outputVat)+'</td></tr>'+
      '<tr><td>7. المشتريات الخاضعة للنسبة الأساسية (15%)</td><td class="n">'+money(r.purchasesBase)+'</td><td class="n">'+money(r.inputVat)+'</td></tr>'+
      '<tr><td><b>'+(r.net>=0?'صافي الضريبة المستحقة للهيئة':'صافي الضريبة المستردة من الهيئة')+'</b></td><td></td><td class="n"><b>'+money(Math.abs(r.net))+'</b></td></tr></tbody></table></div>'+
    '<p class="hint">'+r.salesEntries+' قيد مبيعات و'+r.purchaseEntries+' قيد مشتريات. القيود المعكوسة تُطرح تلقائياً.</p>'+
    (r.offRate.length?'<div class="sk-note warn">'+r.offRate.length+' قيد ضريبته لا تساوي 15% من أساسه (مبيعات صفرية أو خطأ إدخال) — راجعها قبل التقديم.</div>':'')+
    '<div class="sk-actions"><button type="button" class="btn" data-l="vat-csv">تصدير CSV</button><button type="button" class="btn" data-l="vat-print">طباعة الإقرار</button>'+
      (settled?'<span class="sk-pill good">أُقفلت ضريبة الفترة بقيد '+esc(settled.reference||"")+'</span>':(r.outputVat>0||r.inputVat>0)&&r.outputVat>=0&&r.inputVat>=0?'<button type="button" class="btn primary" data-l="vat-settle">قيد إقفال الضريبة</button>':'')+
    '</div><p class="hint">قيد الإقفال ينقل المخرجات والمدخلات إلى حساب 2250 (صافي المستحق للهيئة)، ومنه يُسجل السداد.</p></div></section>';
}
function vatRows(v){const r=v.r;return [["1","المبيعات الخاضعة للنسبة الأساسية",r.salesBase,r.outputVat],["7","المشتريات الخاضعة للنسبة الأساسية",r.purchasesBase,r.inputVat],["","صافي الضريبة "+(r.net>=0?"المستحقة":"المستردة"),"",Math.abs(r.net)]]}
/* ---------- posting (engines build the balanced entries) ---------- */
function ensureAcc(d,codes){const miss=codes.filter(c=>!d.accounts.some(a=>a.code===c));if(miss.length){toast("أضف الحسابات "+miss.join("، ")+" للدليل أولاً (أو أنشئ الدليل الأساسي)","warn");return false}return true}
const idOf=(d,c)=>d.accounts.find(a=>a.code===c).id;
/* unit cost excluding VAT for a sold item, from the goods received, the dated cost rules of the sales lab or the catalog */
const ckey=v=>String(v||"").trim().toLowerCase().replace(/[أإآ]/g,"ا").replace(/ة/g,"ه").replace(/ى/g,"ي").replace(/\s+/g," ");
function costLayers(){
  const pur=load("skosif_purchasing_v1",{}),layers=[];
  (pur.receipts||[]).filter(r=>r&&r.status==="RECEIVED").forEach(r=>{const po=(pur.orders||[]).find(o=>o.id===r.orderId);if(!po)return;
    (r.lines||[]).forEach(l=>{const pl=(po.lines||[]).find(x=>x.item===l.item);if(pl)layers.push({itemId:l.item,quantity:Number(l.qty)||0,unitCost:Number(pl.cost)||0,date:String(r.date||po.date||"").slice(0,10)})})});
  return layers;
}
function costResolver(){
  const layers=costLayers(),inv=window.SKEngines.stock.inventory,all=inv.weightedAverageCosts(layers,ckey),byDate=new Map(),rules=load("skosif_cost_rules_v1",[]),cat=new Map();
  try{(window.SKosifCore.catalog().items||[]).forEach(i=>{if(Number(i.cost)>0)cat.set(ckey(i.name),Number(i.cost))})}catch{}
  /* receipts up to the sale date first (never the cost of goods bought later), then dated cost rules, catalog cost, and the overall average */
  return (item,date,channel)=>{const k=ckey(item),d=String(date||"").slice(0,10)||"9999-12-31";
    if(!byDate.has(d))byDate.set(d,inv.weightedAverageCostsAsOf(layers,d,ckey));const w=byDate.get(d);if(w[k]>0)return w[k];
    const r=(Array.isArray(rules)?rules:[]).filter(x=>x&&ckey(x.product)===k&&(!x.channel||x.channel===channel)&&(!x.from||x.from<=d)&&(!x.to||x.to>=d))
      .sort((a,b)=>Number(!!b.channel)-Number(!!a.channel)||String(b.from||"").localeCompare(String(a.from||"")))[0];
    if(r&&Number(r.cost)>0)return Number(r.cost);return cat.get(k)||all[k]||null};
}
const paidNow=p=>!!p&&!/آجل|اجل|ائتمان|credit/i.test(String(p));
/* one sale from «تسجيل بيع» (prices include VAT) as a balanced entry with its cost of sales; shared with the demo company */
function saleEntry(d,x,costOf){
  const date=String(x.date||"").slice(0,10),qty=Number(x.qty)||1,gross=Number(x.unitPrice)||((Number(x.amount)||0)/qty);if(!(gross>0))return null;
  const withCost=d.accounts.some(a=>a.code==="5000")&&d.accounts.some(a=>a.code==="1300");
  const b=window.SKEngines.sales.salesPosting.buildSalesPosting({id:x.id,number:x.id,date,dueDate:date,customerId:x.customer||x.phone||"عميل",status:"DRAFT",
      lines:[{itemId:x.item||"بيع",quantity:qty,unitPrice:gross,vatRate:0.15,priceIncludesVat:true}]},
    {receivableAccountId:idOf(d,"1200"),revenueAccountId:idOf(d,"4000"),vatPayableAccountId:idOf(d,"2200")},
    withCost?{cogsAccountId:idOf(d,"5000"),inventoryAccountId:idOf(d,"1300"),unitCost:id=>costOf(id,date,x.category)}:undefined);
  const party=x.customer||x.phone||"عميل",lines=b.journal.lines.slice();
  /* paid at the till (cash, mada, transfer): collected in the same entry, so only credit sales stay in receivables */
  if(paidNow(x.payment)&&d.accounts.some(a=>a.code==="1100")){const t=b.receivable.amount,why="تحصيل فوري ("+x.payment+")";
    lines.push({accountId:idOf(d,"1100"),debit:t,credit:0,description:why},{accountId:idOf(d,"1200"),debit:0,credit:t,description:why})}
  const journal={...b.journal,lines};
  if(!E().ledger.validateJournalEntry(journal).valid)return null;
  return {entry:{...journal,id:SK.ui.uid("je"),memo:"بيع: "+(x.item||"")+" — "+(x.customer||""),reference:x.id,source:"مبيعات",sourceId:"sale:"+x.id,party},cost:b.cost,uncosted:b.uncosted.length>0};
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
    d.entries.push({...bundle.journal,id:SK.ui.uid("je"),memo:"استلام من "+po.supplier+" — أمر "+po.number,reference:po.number,source:"مشتريات",sourceId:"receipt:"+r.id,party:po.supplier||""});n++;
  }catch{skipped++}});
  put(d);toast((n?"رُحّل "+n+" استلام":"لم يُرحّل أي استلام")+(skipped?" — تُرك "+skipped+" بلا تكلفة أو كمية (أكمل أسعار أمر الشراء)":"")+(held?" — "+held+" في فترة مقفلة":""),n&&!skipped&&!held?"ok":"warn");
}

/* ---------- screen ---------- */
function paint(root){
  const d=db(),p=period();if(!tab)tab=d.accounts.length?"close":"accounts";
  root.innerHTML=SK.ui.tabs([["close","الإقفال الشهري"],["accounts","دليل الحسابات",d.accounts.length],["entries","القيود",d.entries.length],["cash","التحصيل والسداد"],["gl","الأستاذ العام"],["tb","ميزان المراجعة"],["vat","إقرار الضريبة"],["recon","المطابقة"]],tab,"ledger")+
    (p?'<p class="hint">الفترة المالية النشطة: <b>'+esc(p.label)+'</b> ('+esc(p.startDate)+' → '+esc(p.endDate)+') — من «الشركات والفترات».</p>':'')+
    ({close:closeHTML,accounts:accountsHTML,entries:entriesHTML,cash:cashHTML,gl:glHTML,tb:tbHTML,vat:vatHTML,recon:reconHTML}[tab]||accountsHTML)(d);
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
      const rv={...E().ledger.reverseJournalEntry(en,{id:SK.ui.uid("je"),date:today}),memo:"عكس: "+(en.memo||en.reference||""),source:"عكس",reversalOf:en.id,...(en.party?{party:en.party}:{}),...(en.vatSettlement?{vatSettlement:true}:{}),...(en.demo?{demo:true}:{})};
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
    else if(a==="cash-fill"){const k=$("#lg-ck",root),pp=$("#lg-cp",root),am=$("#lg-ca",root);if(k)k.value=b.dataset.kind;if(pp)pp.value=b.dataset.party;if(am){am.value=b.dataset.amt;am.focus();am.select()}return}
    else if(a==="settle"){
      const err=$("#lg-cerr",root);err.textContent="";if(!SK.ui.validate(root))return;
      const kind=$("#lg-ck",root).value,party=$("#lg-cp",root).value.trim(),amount=r2(String($("#lg-ca",root).value).replace("٫",".").replace(/[٠-٩]/g,x=>"٠١٢٣٤٥٦٧٨٩".indexOf(x))),date=$("#lg-cd",root).value||today(),method=$("#lg-cm",root).value;
      if(!(amount>0)){err.textContent="أدخل مبلغاً أكبر من صفر";return}
      if(locked(d,date)){err.textContent="التاريخ داخل فترة مقفلة (حتى "+d.lockDate+")";return}
      const ref=$("#lg-cr",root).value.trim(),en=E().partyLedger.buildSettlementEntry({id:SK.ui.uid("je"),date,kind:kind==="ar"?"collection":"payment",party,amount,cashAccountId:byCode(d,"1100"),controlAccountId:byCode(d,kind==="ar"?"1200":"2100"),reference:ref||undefined});
      d.entries.push({...en,memo:(kind==="ar"?"تحصيل من ":"سداد إلى ")+party+" ("+method+")",source:kind==="ar"?"تحصيل":"سداد",method});put(d);
      SK.audit&&SK.audit.log("ledger",{act:kind==="ar"?"collection":"payment",amount});toast((kind==="ar"?"سُجّل التحصيل: ":"سُجّل السداد: ")+money(amount),"ok");
    }
    else if(a==="stmt"){printStatement(d,b.dataset.party,b.dataset.kind);return}
    else if(a==="vatq"){vatQ=b.dataset.q}
    else if(a==="vat-csv"){const v=vatCalc(d);if(!v)return;SK.csv.download("vat-return-"+v.q.id,["البند","الوصف","المبلغ بلا ضريبة","الضريبة"],vatRows(v));return}
    else if(a==="vat-print"){const v=vatCalc(d);if(!v)return;const w=window.open("","_blank");if(!w)return toast("اسمح بالنوافذ المنبثقة للطباعة","warn");
      w.document.write('<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>إقرار ضريبة القيمة المضافة — '+esc(v.q.label)+'</title></head><body><h1>إقرار ضريبة القيمة المضافة</h1><p>'+esc(v.q.label)+' · '+esc(v.q.start)+' → '+esc(v.q.end)+' · آخر موعد للتقديم '+esc(v.q.due)+'</p>'+
        '<table><thead><tr><th>البند</th><th>الوصف</th><th>المبلغ بلا ضريبة</th><th>الضريبة</th></tr></thead><tbody>'+vatRows(v).map(x=>'<tr><td>'+x[0]+'</td><td>'+esc(x[1])+'</td><td>'+(x[2]===""?"":money(x[2]))+'</td><td>'+money(x[3])+'</td></tr>').join("")+'</tbody></table>'+
        '<p>مصدر الأرقام: القيود المرحّلة في الدفاتر ('+v.r.salesEntries+' مبيعات، '+v.r.purchaseEntries+' مشتريات).</p></body></html>');
      w.document.close();SK.brandPrint(w,"إقرار ضريبة القيمة المضافة");return}
    else if(a==="vat-settle"){
      const v=vatCalc(d);if(!v||v.settled)return;
      if(locked(d,v.q.end))return toast("نهاية الفترة داخل إقفال الدفاتر — افتح الإقفال أولاً","warn");
      if(!await SK.confirm("إقفال ضريبة "+v.q.label+" بقيد بتاريخ "+v.q.end+"؟ المستحق للهيئة: "+money(v.r.net),{ok:"ترحيل قيد الإقفال"}))return;
      if(!byCode(d,"2250"))d.accounts.push(E().accounts.createAccount({code:"2250",name:"ضريبة القيمة المضافة — صافي مستحق للهيئة",type:"liability"}));
      const en=E().vatReturn.buildVatSettlementEntry({id:SK.ui.uid("je"),date:v.q.end,reference:"VAT-"+v.q.id,outputVat:v.r.outputVat,inputVat:v.r.inputVat,outputVatAccountId:v.out,inputVatAccountId:v.inp,netAccountId:byCode(d,"2250")});
      d.entries.push({...en,memo:"إقفال ضريبة القيمة المضافة — "+v.q.label,source:"ضريبة",sourceId:"vat:"+v.q.id});put(d);
      SK.audit&&SK.audit.log("ledger",{act:"vat-settle",period:v.q.id});toast("رُحّل قيد إقفال الضريبة","ok");
    }
    else if(a==="bank-tpl"){SK.templates.download("bank");return}
    else if(a==="bank-import"){await SK.templates.import("bank");paint(root);return}
    else if(a==="bank-clear"){if(!await SK.confirm("مسح الكشف البنكي المستورد؟ القيود المرحّلة منه تبقى.",{ok:"مسح"}))return;d.bank={...(d.bank||{}),lines:[],manual:[],closing:null};put(d)}
    else if(a==="bank-pair"){const sel=root.querySelector('[data-bpair="'+CSS.escape(b.dataset.id)+'"]');if(!sel||!sel.value)return toast("اختر سطر الكشف","warn");
      d.bank=d.bank||{};d.bank.manual=(d.bank.manual||[]).concat([{bankId:sel.value,bookId:b.dataset.id}]);put(d)}
    else if(a==="bank-post"){
      const c=bankCalc(d),l=c&&c.lines.find(x=>x.id===b.dataset.id),acc=root.querySelector('[data-bacc="'+CSS.escape(b.dataset.id)+'"]');if(!l||!acc)return;
      if(locked(d,l.date))return toast("تاريخ السطر داخل فترة مقفلة","warn");
      if(d.entries.some(e=>e.sourceId==="bank:"+l.id&&!e.reversedBy))return toast("رُحّل هذا السطر من قبل","info");
      const cash=byCode(d,"1100"),amt=Math.abs(l.amount),other=acc.value,en={id:SK.ui.uid("je"),date:l.date,reference:l.reference||"BANK",memo:"من كشف البنك: "+(l.description||""),source:"بنك",sourceId:"bank:"+l.id,
        lines:l.amount<0?[{accountId:other,debit:amt,credit:0,description:l.description||""},{accountId:cash,debit:0,credit:amt,description:l.description||""}]:[{accountId:cash,debit:amt,credit:0,description:l.description||""},{accountId:other,debit:0,credit:amt,description:l.description||""}]};
      if(!E().ledger.validateJournalEntry(en).valid)return toast("تعذر بناء القيد","warn");
      d.entries.push(en);put(d);SK.audit&&SK.audit.log("ledger",{act:"bank-post",amount:l.amount});toast("رُحّل سطر الكشف","ok");
    }
    else if(a==="bank-save"){
      const c=bankCalc(d);if(!c||!c.st||!c.st.reconciled)return;
      d.bank={...c.B,cleared:[...new Set([...(c.B.cleared||[]),...c.m.matches.map(x=>x.bookId)])],history:(c.B.history||[]).concat([{end:c.end,closing:c.closing,at:today(),matched:c.m.matches.length}]),lines:[],manual:[],closing:null};
      put(d);SK.audit&&SK.audit.log("ledger",{act:"bank-reconciled",end:c.end});toast("اعتُمدت مطابقة البنك حتى "+c.end,"ok");
    }
    else if(a==="count-post"){
      const C=d.count||{},date=C.date||today(),inv=byCode(d,"1300");if(!inv)return;
      if(locked(d,date))return toast("تاريخ الجرد داخل فترة مقفلة","warn");
      const costOf=costResolver(),items=[...new Set([...costLayers().map(l=>l.itemId),...Object.keys(C.qty||{})])];
      const v=window.SKEngines.stock.inventory.stockCountValuation(items.map(i=>({itemId:i,countedQty:Number((C.qty||{})[i])||0})),i=>costOf(i,date));
      const gl=E().ledger.buildGeneralLedger(d.entries.filter(e=>String(e.date).slice(0,10)<=date)),book=r2(((gl.find(g=>g.accountId===inv)||{}).balance)||0);
      if(Math.abs(v.value-book)<0.01)return toast("لا فرق بين الجرد والدفاتر","info");
      if(!await SK.confirm("ترحيل فرق الجرد بتاريخ "+date+"؟ الدفاتر "+money(book)+" والجرد "+money(v.value)+" — الفرق "+money(v.value-book)+".",{ok:"ترحيل الفرق"}))return;
      if(!byCode(d,"5100"))d.accounts.push(E().accounts.createAccount({code:"5100",name:"فروقات الجرد والهدر",type:"expense"}));
      const en=window.SKEngines.stock.inventory.buildStockCountAdjustment({id:SK.ui.uid("je"),date,bookValue:book,countedValue:v.value,inventoryAccountId:inv,varianceAccountId:byCode(d,"5100")});
      d.entries.push({id:en.id,date:en.date,reference:en.reference,lines:en.lines,memo:"تسوية الجرد — "+(en.difference<0?"عجز ":"زيادة ")+money(Math.abs(en.difference)),source:"جرد"});
      d.count={...C,posted:today()};put(d);SK.audit&&SK.audit.log("ledger",{act:"count-adjust",diff:en.difference});toast("رُحّل فرق الجرد","ok");
    }
    else if(a==="trail-seal"){if(!await SK.confirm("ختم القيود السابقة لتفعيل سجل التعديلات يدخلها في السلسلة بتاريخ اليوم. متابعة؟",{ok:"ختم"}))return;const n=E().journalChain.sealLegacy(d.entries,new Date().toISOString());put(d);SK.audit&&SK.audit.log("ledger",{act:"trail-seal-legacy",n});toast("خُتم "+n+" قيداً","ok")}
    else if(a==="trail-csv"){SK.csv.download("S.kosif-journal-audit-trail",["التسلسل","القيد","التاريخ","المرجع","المصدر","البيان","وقت الختم","الختم السابق","الختم","الحالة"],d.entries.map(e=>[e.seq||"",e.id,e.date,e.reference||"",e.source||"يدوي",e.memo||"",e.sealedAt||"",e.prev||"",e.hash||"",e.demo?"تجريبي":e.legacy?"سابق للتفعيل":e.reversedBy?"معكوس":e.external?"من خارج الدفاتر":"مختوم"]));return}
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
    const el=e.target;
    if(e.type==="change"&&(el.id==="lg-bclose"||el.id==="lg-cntd"||el.dataset.cnt!=null)){const d=db();
      if(el.id==="lg-bclose"){const v=String(el.value).trim();d.bank={...(d.bank||{}),closing:v===""?null:r2(v.replace("٫",".").replace(/[٠-٩]/g,x=>"٠١٢٣٤٥٦٧٨٩".indexOf(x)))}}
      else if(el.id==="lg-cntd")d.count={...(d.count||{}),date:el.value||today()};
      else{const q={...((d.count||{}).qty||{})},v=String(el.value).trim();if(v==="")delete q[el.dataset.cnt];else q[el.dataset.cnt]=Number(v.replace("٫",".").replace(/[٠-٩]/g,x=>"٠١٢٣٤٥٦٧٨٩".indexOf(x)))||0;d.count={...(d.count||{}),qty:q}}
      put(d);paint(root);return}
    if(el.id==="lg-terms"){if(e.type!=="change")return;const v=Math.round(Number(el.value));if(!(v>=0&&v<=365))return;const d=db();d.termsDays=v;put(d);paint(root);return}
    if(!draft)return;
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
/* the month-end close lives in month-close.js; it reads the books through the api below */
function closeHTML(){return window.SKosifClose?SKosifClose.html():SK.ui.state.empty({title:"الإقفال الشهري غير متاح"})}
function pendingOps(d,until){
  const posted=postedSources(d),u=until||"9999-12-31",pur=load("skosif_purchasing_v1",{});
  const sales=(load("aghnam-v12-manual-sales",[])||[]).filter(x=>x&&x.id&&!posted.has("sale:"+x.id)&&String(x.date||"").slice(0,10)<=u);
  const rec=(pur.receipts||[]).filter(r=>r&&r.status==="RECEIVED"&&!posted.has("receipt:"+r.id)&&String(r.date||"").slice(0,10)<=u);
  const oldest=[...sales.map(x=>String(x.date||"").slice(0,10)),...rec.map(r=>String(r.date||"").slice(0,10))].filter(Boolean).sort()[0]||null;
  return {sales:sales.length,receipts:rec.length,total:sales.length+rec.length,oldest};
}
function partiesOf(d,kind,asOf){const acc=byCode(d,kind==="ap"?"2100":"1200");if(!acc)return null;
  return E().partyLedger.partyBalances(withParties(d).filter(e=>String(e.date).slice(0,10)<=asOf),acc,kind==="ap"?"credit":"debit",asOf,Number.isFinite(d.termsDays)?d.termsDays:30)}
function balanceOf(d,code,asOf){const id=byCode(d,code);if(!id)return null;const g=E().ledger.buildGeneralLedger(d.entries.filter(e=>String(e.date).slice(0,10)<=asOf)).find(x=>x.accountId===id);return g?g.balance:0}
/* any screen can open a ledger tab: data-ledger-open="vat" */
document.addEventListener("click",e=>{const b=e.target.closest("[data-ledger-open]");if(b){tab=b.dataset.ledgerOpen||"accounts";window.SKosifCore.go("ledger")}});
/* a screen that edits its records in place keeps its entries in step with them (the record's entries are those whose sourceId is
   the key itself or the key followed by «:»): what is new is posted, what changed is
   reversed (dated today) and posted again, what disappeared is reversed. The books keep their history and the edit log
   stays whole; dates inside a locked period are refused, never rewritten. */
function syncSource(prefix,want){
  const d=db(),today=new Date().toISOString().slice(0,10),out={posted:0,reversed:0,blocked:[]};
  const sig=e=>JSON.stringify([String(e.date).slice(0,10),e.party||"",(e.lines||[]).map(l=>[l.accountId,r2(l.debit),r2(l.credit)])]);
  const wantBy=new Map((want||[]).map(w=>[w.sourceId,w]));
  const mine=sid=>sid===prefix||sid.startsWith(prefix+":");
  d.entries.filter(e=>!e.reversedBy&&!e.reversalOf&&mine(String(e.sourceId||""))).forEach(e=>{
    const w=wantBy.get(e.sourceId);if(w&&sig(w)===sig(e)){wantBy.delete(e.sourceId);return}
    if(locked(d,today)||locked(d,String(e.date).slice(0,10))){out.blocked.push(e.sourceId);wantBy.delete(e.sourceId);return}
    const rv={...E().ledger.reverseJournalEntry(e,{id:SK.ui.uid("je"),date:today}),memo:"عكس بعد تعديل: "+(e.memo||e.reference||""),source:"عكس",reversalOf:e.id,...(e.party?{party:e.party}:{}),...(e.demo?{demo:true}:{})};
    e.reversedBy=rv.id;d.entries.push(rv);out.reversed++});
  wantBy.forEach(w=>{if(locked(d,String(w.date).slice(0,10))){out.blocked.push(w.sourceId);return}
    const v=E().ledger.validateJournalEntry(w);if(!v.valid){out.blocked.push(w.sourceId);return}
    d.entries.push({...w,id:SK.ui.uid("je")});out.posted++});
  if(out.posted||out.reversed)put(d);
  return out;
}
/* the accounts a screen posts to, created once with the chart's own builder */
function ensureAccounts(list){const d=db();let added=0;const ids={};
  list.forEach(([code,name,type])=>{let a=d.accounts.find(x=>x.code===code);if(!a){a=E().accounts.createAccount({code,name,type});d.accounts.push(a);added++}ids[code]=a.id});
  if(added)put(d);return ids}
window.SKosifLedger=Object.freeze({entries:()=>db().entries,accounts:()=>db().accounts,lockDate:()=>db().lockDate,saleEntry:(d,x)=>saleEntry(d,x,costResolver()),
  open:(t,o={})=>{tab=t||"accounts";if(o.q)vatQ=o.q;window.SKosifCore.go("ledger")},
  /* read-only views of the books for the month-end close, the morning brief and the alerts */
  snapshot:()=>db(),pending:until=>pendingOps(db(),until),parties:(kind,asOf)=>partiesOf(db(),kind,asOf||today()),
  vat:qid=>vatCalc(db(),qid),quarters:y=>quarters(y),balance:(code,asOf)=>balanceOf(db(),code,asOf||today()),
  trialBalance:end=>E().ledger.buildTrialBalance(db().entries.filter(e=>String(e.date).slice(0,10)<=end)),
  lockTo:date=>{const d=db();if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||(d.lockDate&&d.lockDate>=date))return false;d.lockDate=date;put(d);SK.audit&&SK.audit.log("ledger",{act:"lock",to:date});return true},
  sendToReview:async()=>window.SKosifTBReview?SKosifTBReview.fromBooks():false,
  /* the audit trail and the revenue reconciliation for the month-end close and the report pack */
  trail:()=>{const t=trailOf(db());return t?{...t.v,ok:t.v.ok&&!t.events.length,coverage:t.cov,events:t.events.length,since:t.since}:null},
  revenueRecon:()=>{const x=revReconOf(db());return x?{...x.r,start:x.start,end:x.end}:null},
  sync:(prefix,want)=>syncSource(prefix,want),ensureAccounts,locked:date=>locked(db(),date)});
})();
