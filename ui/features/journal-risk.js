/* S.kosif — مخاطر القيود (شاشة «journalrisk» في الأدوات المساعدة، مشتركة مع المراجعة) + window.SKosifJournalRisk.
   درجة مخاطر لكل قيد في دفاتر الشركة المفتوحة — كل القيود بلا عينة (ISA 240.33): القيد اليدوي، المبلغ المستدير،
   الحساب الوسيط، الطرف ذو العلاقة، الترحيل في العطلة، أيام الإقفال، الترحيل بعد الفترة، التكرار، الجانب غير المعتاد،
   وقانون بنفورد على الرقم الأول. تقرأ القيود والحسابات من SKosifLedger (الدفاتر نفسها، لا نسخة)، وتاريخ الإقفال
   كنهاية الفترة. لا تخزين: الحالة (التبويب والتصفية والترتيب) تعيش في الذاكرة فقط. المحرك: SKEngines.audit.journalRisk
   (مختبر في app/src/engine/fusion/audit/journal-risk-engine.test.ts). النتيجة مؤشر للمراجع، لا حكم. */
(()=>{
"use strict";
const {esc,money}=SK;
const JR=()=>window.SKEngines&&SKEngines.audit&&SKEngines.audit.journalRisk;
const L=()=>window.SKosifLedger;
const nf=new Intl.NumberFormat("en",{maximumFractionDigits:1}),pct=v=>nf.format(Math.round((Number(v)||0)*1000)/10)+"%";
const BAND_AR={high:"مرتفع",medium:"متوسط",low:"منخفض"},BAND_CLS={high:"bad",medium:"warn",low:"good"};
const TABS=[["overview","النظرة العامة"],["entries","القيود حسب المخاطر"],["benford","بنفورد والتكرار"]];
const COLS=[["score","الدرجة"],["date","التاريخ"],["amount","المبلغ"],["source","المصدر"],["signals","الإشارات"]];
const PAGE=50;
let root=null,state={tab:"overview",signal:"",sort:"score",dir:-1,limit:PAGE};

/* ---------- the open company's books, in the engine's shape ---------- */
function source(){
  const l=L();if(!l)return{entries:[],accounts:[],lockDate:""};
  let entries=[],accounts=[],lockDate="";
  try{entries=l.entries()||[];accounts=l.accounts()||[];lockDate=l.lockDate()||""}catch(e){SK.errors&&SK.errors.report(e,"journalrisk:source")}
  return{entries,accounts,lockDate};
}
function model(src,opts={}){
  const E=JR();if(!E)return null;
  const entries=(src.entries||[]).map(e=>({id:String(e.id),date:String(e.date||"").slice(0,10),source:e.source,memo:e.memo,reference:e.reference,user:e.user||e.createdBy,postedAt:e.postedAt||e.createdAt,
    reversalOf:e.reversalOf,reversedBy:e.reversedBy,lines:(e.lines||[]).map(l=>({accountId:String(l.accountId||""),debit:Number(l.debit)||0,credit:Number(l.credit)||0,description:l.description}))}));
  const accounts=(src.accounts||[]).map(a=>({id:String(a.id),code:String(a.code||""),name:a.name||"",type:a.type}));
  const options={accounts,...(src.lockDate?{periodEnd:src.lockDate}:{}),...opts};
  const scores=E.scoreEntries(entries,options);
  return{scores,summary:E.summarize(scores,{top:10}),options,signals:E.SIGNALS};
}
/* the table rows: filtered by one signal («حسب الإشارة») and sorted by a column */
function rows(m,s=state){
  const key=s.sort||"score",dir=s.dir||-1;
  const list=s.signal?m.scores.filter(x=>x.signals.some(g=>g.code===s.signal)):m.scores.slice();
  const val=x=>key==="signals"?x.signals.length:key==="amount"?x.amount:key==="score"?x.score:String(x[key]||"");
  return list.sort((a,b)=>{const va=val(a),vb=val(b);const c=typeof va==="number"?va-vb:va.localeCompare(vb,"ar");return c?c*dir:a.id.localeCompare(b.id)});
}

/* ---------- pieces ---------- */
const tile=(ic,l,v,sub,tone)=>'<div class="skk4-t jr-t'+(tone?" tone-"+tone:"")+'"><span class="chip">'+SK.icon(ic)+'</span><span class="tx"><span>'+l+'</span><b>'+v+'</b><small>'+sub+'</small></span></div>';
function tiles(m){
  const S=m.summary,d=S.distribution;
  return '<div class="skk4 jr-k">'+
    tile("ledger","القيود المقيَّمة",S.total,S.scored+" قيداً يحمل إشارة واحدة على الأقل")+
    tile("risks","مخاطر مرتفعة",d.high,"الدرجة 60 وأكثر — تُفحص كلها",d.high?"bad":"")+
    tile("tbreview","مخاطر متوسطة",d.medium,"من 30 إلى 59 — تُفحص بالعينة",d.medium?"warn":"")+
    tile("calc","متوسط الدرجة",nf.format(S.averageScore),"من 100 · "+(S.benford.sufficient?"بنفورد: "+esc(JR().BENFORD_AR[S.benford.conformity]):"بنفورد يحتاج 50 قيداً"))+'</div>';
}
function distributionBar(m){
  const d=m.summary.distribution,t=m.summary.total||1;
  return '<div class="jr-dist" role="img" aria-label="توزيع الدرجات">'+["high","medium","low"].map(b=>d[b]?'<i class="jr-'+b+'" style="flex-grow:'+d[b]+'" title="'+BAND_AR[b]+': '+d[b]+'"></i>':"").join("")+'</div>'+
    '<div class="jr-legend">'+["high","medium","low"].map(b=>'<span><i class="jr-'+b+'"></i>'+BAND_AR[b]+' <b>'+d[b]+'</b> ('+pct(d[b]/t)+')</span>').join("")+'</div>';
}
function bySignal(m){
  const list=m.summary.bySignal;if(!list.length)return '<p class="hint">لا إشارة على أي قيد.</p>';
  const rowsH=list.map(x=>({label:x.label_ar,value:x.count,sub:money(x.amount)}));
  if(window.SKCharts&&SKCharts.hbars)return SKCharts.hbars({rows:rowsH,fmt:v=>nf.format(v)+" قيد",valueLabel:"القيود",title:"القيود حسب الإشارة",sort:false});
  return '<div class="jr-bars">'+list.map(x=>'<div class="jr-bar"><span>'+esc(x.label_ar)+'</span><i style="width:'+Math.round(x.count/list[0].count*100)+'%"></i><b>'+x.count+'</b></div>').join("")+'</div>';
}
function signalFilter(m){
  const list=m.summary.bySignal;
  return '<div class="sk-seg jr-seg" role="group" aria-label="حسب الإشارة"><button type="button" data-jr-sig="" aria-pressed="'+(!state.signal)+'">الكل ('+m.summary.total+')</button>'+
    list.map(x=>'<button type="button" data-jr-sig="'+x.code+'" aria-pressed="'+(state.signal===x.code)+'">'+esc(x.label_ar)+' ('+x.count+')</button>').join("")+'</div>';
}
const signalsCell=x=>x.signals.length?x.signals.map(g=>'<span class="sk-pill jr-sig" title="'+esc(g.detail)+'">'+esc(g.label_ar)+' +'+g.weight+'</span>').join(" "):'<span class="hint">—</span>';
function table(m){
  const all=rows(m),shown=all.slice(0,state.limit);
  const th=([k,l])=>'<th scope="col" aria-sort="'+(state.sort===k?(state.dir<0?"descending":"ascending"):"none")+'"><button type="button" class="jr-th" data-jr-sort="'+k+'">'+l+(state.sort===k?(state.dir<0?" ↓":" ↑"):"")+'</button></th>';
  if(!all.length)return '<p class="empty">لا قيود تحمل هذه الإشارة.</p>';
  return '<div class="sk-table-wrap"><table class="sk-table jr-table"><thead><tr><th scope="col">القيد</th>'+COLS.map(th).join("")+'</tr></thead><tbody>'+
    shown.map(x=>'<tr data-jr-row="'+esc(x.id)+'"><td><button type="button" class="jr-id" data-jr-open="'+esc(x.id)+'" title="'+esc(x.memo||"")+'">'+esc(x.id)+'</button>'+(x.memo?'<small>'+esc(x.memo)+'</small>':"")+'</td>'+
      '<td><span class="sk-pill '+BAND_CLS[x.band]+'">'+x.score+' · '+BAND_AR[x.band]+'</span></td><td>'+esc(x.date)+'</td><td class="n">'+money(x.amount)+'</td><td>'+esc(x.source||"يدوي")+'</td><td class="jr-sigs">'+signalsCell(x)+'</td></tr>').join("")+
    '</tbody></table></div>'+(all.length>shown.length?'<p class="jr-more"><button type="button" class="btn sm" data-jr-more>عرض '+Math.min(PAGE,all.length-shown.length)+' قيداً إضافياً من '+(all.length-shown.length)+'</button></p>':"");
}
function benfordCard(m){
  const B=m.summary.benford,E=JR();
  const note=B.sufficient?'<span class="sk-pill '+(B.conformity==="nonconforming"?"bad":B.conformity==="marginal"?"warn":"good")+'">'+esc(E.BENFORD_AR[B.conformity])+'</span> متوسط الانحراف المطلق '+nf.format(B.mad*1000)+'‰ على '+B.n+' مبلغاً':
    '<span class="sk-pill">'+esc(E.BENFORD_AR.insufficient)+'</span> '+B.n+' من 50 مبلغاً على الأقل';
  const labels=B.digits.map(d=>String(d.digit)),obs=B.digits.map(d=>Math.round(d.observed*1000)/10),exp=B.digits.map(d=>Math.round(d.expected*1000)/10);
  const chart=window.SKCharts&&SKCharts.bars?SKCharts.bars({labels,series:[{name:"الملاحَظ %",values:obs}],line:{name:"المتوقع %",values:exp},fmt:v=>nf.format(v)+"%",height:220,width:root?Math.max(300,root.clientWidth-80):720,title:"الرقم الأول"}):
    '<div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>الرقم</th><th>العدد</th><th>الملاحَظ</th><th>المتوقع</th></tr></thead><tbody>'+B.digits.map(d=>'<tr><td>'+d.digit+'</td><td>'+d.count+'</td><td>'+pct(d.observed)+'</td><td>'+pct(d.expected)+'</td></tr>').join("")+'</tbody></table></div>';
  return '<section class="card"><div class="card-h"><div><h3>قانون بنفورد — الرقم الأول من مبلغ كل قيد</h3><p>التوزيع المتوقع log10(1+1/d): الرقم 1 يتصدر بنحو 30%. الانحراف مؤشر لفحص المبالغ المصنوعة، لا دليل بذاته.</p></div></div><div class="card-b"><p class="jr-note">'+note+'</p>'+chart+'</div></section>';
}
function duplicatesCard(m){
  const G=m.summary.duplicateGroups;
  return '<section class="card"><div class="card-h"><div><h3>القيود المكررة</h3><p>نفس المبلغ ونفس مجموعة الحسابات — القيد العكسي لا يُحسب تكراراً لأصله.</p></div></div><div class="card-b">'+
    (G.length?'<div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>المبلغ</th><th>العدد</th><th>القيود</th></tr></thead><tbody>'+G.map(g=>'<tr><td class="n">'+money(g.amount)+'</td><td>'+g.count+'</td><td class="jr-sigs">'+g.ids.map(id=>'<button type="button" class="jr-id" data-jr-open="'+esc(id)+'">'+esc(id)+'</button>').join(" ")+'</td></tr>').join("")+'</tbody></table></div>':'<p class="empty">لا تكرار بين القيود.</p>')+'</div></section>';
}

/* ---------- the screen ---------- */
function html(m,s=state){
  state=s;
  if(!m)return SK.ui.state.empty({icon:"risks",title:"محرك مخاطر القيود غير محمَّل",text:"أعد بناء المحركات (tools/build_engines.mjs) ليظهر SKEngines.audit.journalRisk."});
  if(!m.scores.length)return SK.ui.state.empty({icon:"ledger",title:"لا قيود في دفاتر هذه الشركة",text:"تُقيَّم المخاطر على قيود الدفاتر المحاسبية للشركة المفتوحة — كل القيود، بلا عينة.",action:{go:"ledger",label:"الدفاتر المحاسبية"}});
  const period=m.options.periodEnd?'نهاية الفترة: تاريخ الإقفال '+esc(m.options.periodEnd):'لا تاريخ إقفال بعد — إشارتا أيام الإقفال والترحيل بعد الفترة معطّلتان';
  const seg='<div class="sk-seg jr-tabs" role="tablist">'+TABS.map(([k,l])=>'<button type="button" role="tab" data-jr-tab="'+k+'" aria-selected="'+(state.tab===k)+'" aria-pressed="'+(state.tab===k)+'">'+l+'</button>').join("")+'</div>';
  const body=state.tab==="entries"?
      '<section class="card"><div class="card-h"><div><h3>كل القيود مرتبة بالدرجة</h3><p>اضغط عموداً للترتيب، وإشارةً للتصفية. القيد يفتح في الدفاتر.</p></div></div><div class="card-b">'+signalFilter(m)+table(m)+'</div></section>':
    state.tab==="benford"?benfordCard(m)+duplicatesCard(m):
      '<section class="card"><div class="card-h"><div><h3>توزيع الدرجات</h3><p>'+period+'</p></div></div><div class="card-b">'+distributionBar(m)+'</div></section>'+
      '<section class="card"><div class="card-h"><div><h3>القيود حسب الإشارة</h3><p>كم قيداً يحمل كل إشارة، ومجموع مبالغها.</p></div></div><div class="card-b">'+bySignal(m)+'</div></section>'+
      '<section class="card"><div class="card-h"><div><h3>أعلى عشرة قيود</h3><p>الدرجة مجموع أوزان الإشارات، بحد 100.</p></div><button type="button" class="btn sm" data-jr-tab="entries">كل القيود</button></div><div class="card-b">'+
        '<div class="sk-table-wrap"><table class="sk-table jr-table"><thead><tr><th>القيد</th><th>الدرجة</th><th>التاريخ</th><th>المبلغ</th><th>الإشارات</th></tr></thead><tbody>'+
        m.summary.top.map(x=>'<tr><td><button type="button" class="jr-id" data-jr-open="'+esc(x.id)+'">'+esc(x.id)+'</button>'+(x.memo?'<small>'+esc(x.memo)+'</small>':"")+'</td><td><span class="sk-pill '+BAND_CLS[x.band]+'">'+x.score+'</span></td><td>'+esc(x.date)+'</td><td class="n">'+money(x.amount)+'</td><td class="jr-sigs">'+signalsCell(x)+'</td></tr>').join("")+'</tbody></table></div></div></section>';
  return '<div class="jr">'+tiles(m)+seg+body+'<p class="hint jr-foot">الأوزان: '+Object.entries(m.signals).map(([c,d])=>esc(d.label_ar)+' '+d.weight).join(" · ")+'. مؤشر للمراجع وفق ISA 240؛ القرار المهني له.</p></div>';
}
let cache=null;
function paint(){if(!root)return;cache=model(source());root.innerHTML=html(cache,state)}
function bind(node){
  node.addEventListener("click",e=>{
    const t=e.target.closest("[data-jr-tab]");if(t){state.tab=t.dataset.jrTab;paint();return}
    const g=e.target.closest("[data-jr-sig]");if(g){state.signal=g.dataset.jrSig;state.limit=PAGE;paint();return}
    const s=e.target.closest("[data-jr-sort]");if(s){const k=s.dataset.jrSort;if(state.sort===k)state.dir=-state.dir;else{state.sort=k;state.dir=k==="date"||k==="source"?1:-1}paint();return}
    const mo=e.target.closest("[data-jr-more]");if(mo){state.limit+=PAGE;paint();return}
    const o=e.target.closest("[data-jr-open]");if(o){const l=L();if(l&&l.open)l.open("entries",{q:o.dataset.jrOpen})}
  });
}
SK.bus&&SK.bus.on&&SK.bus.on("data",e=>{if(root&&e&&e.key==="skosif_ledger_v1"&&root.isConnected)paint()});
window.SKosifJournalRisk=Object.freeze({model,rows,html,BAND_AR,TABS,COLS});
SK.view("journalrisk",{render(node){root=node;if(!node.dataset.bound){bind(node);node.dataset.bound="1"}paint()}});
})();
