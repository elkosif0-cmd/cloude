/* S.kosif — كشف البنك والمطابقة المستمرة (window.SKosifBankStatement): the continuous layer on top of «مطابقة البنك» in
   «الدفاتر المحاسبية ← المطابقة». Imports the bank's own CSV/XLSX export (Al Rajhi, SNB, Riyad, Alinma, SAB — the
   columns are found by their Arabic/English names, SKEngines.finance.bankStatement.parseStatement), keeps every line
   under a stable hash so a re-import adds nothing twice, proposes matches with a confidence and reasons (a reference in
   the description, the exact amount, one credit for several invoices, bank fees and their VAT, recurring transfers
   learned from the confirmed matches), shows the two unmatched sides side by side with their age, and certifies a
   period (who, when, evidence hash) for the month close. The imported lines also feed the existing statement card
   (skosif_ledger_v1.bank.lines), so the classic reconciliation statement keeps working from the same import.
   Data: skosif_erp_bank_statement_v1 (per company — HELPER_KEY) = the engine's ReconState + {period}. */
(()=>{
"use strict";
const {$,esc,load,save,money,toast}=SK;
const KEY="skosif_erp_bank_statement_v1",LEDGER_KEY="skosif_ledger_v1";
const E=()=>window.SKEngines&&SKEngines.finance&&SKEngines.finance.bankStatement;
const BR=()=>window.SKEngines&&SKEngines.finance&&SKEngines.finance.bankReconciliation;
const nowIso=()=>new Date().toISOString(),today=()=>nowIso().slice(0,10);
const KIND={reference:"مرجع في البيان",amount:"المبلغ والتاريخ",'many-to-one':"تحصيل مجمّع",rule:"قاعدة متعلَّمة",fee:"رسوم بنكية",'fee+vat':"رسوم + ضريبتها",'rule-post':"حوالة متكررة بلا قيد",manual:"يدوي"};
const BANK={alrajhi:"الراجحي",snb:"الأهلي",riyad:"الرياض",alinma:"الإنماء",sab:"ساب",unknown:"بنك غير محدد"};
const who=()=>{try{const u=window.SKosifSpace&&SKosifSpace.user&&SKosifSpace.user();if(u&&u.name)return String(u.name)}catch{}try{return SK.perm&&SK.perm.label?SK.perm.label():"المستخدم"}catch{return "المستخدم"}};

/* ---------- the data ---------- */
function db(){const s=load(KEY,null),e=E();const base=e?e.emptyState():{lines:[],confirmed:[],rejected:[],rules:[],certifications:[],imports:[]};
  if(!s||typeof s!=="object")return{...base,period:""};
  const arr=k=>Array.isArray(s[k])?s[k]:base[k];
  return{lines:arr("lines"),confirmed:arr("confirmed"),rejected:arr("rejected"),rules:arr("rules"),certifications:arr("certifications"),imports:arr("imports"),period:typeof s.period==="string"?s.period:""}}
function put(s){save(KEY,s);SK.bus&&SK.bus.emit&&SK.bus.emit("data",{key:KEY})}
/* the cash account's book lines (bank-reconciliation-engine), from the ledger */
function bookLines(){
  const L=window.SKosifLedger,br=BR();if(!L||!br)return{book:[],cash:null};
  const accounts=L.accounts(),cash=accounts.find(a=>a.code==="1100");if(!cash)return{book:[],cash:null};
  return{book:br.bookCashLines(L.entries(),cash.id),cash}}
/* the pure model the card draws from: the engine's state, the suggestions and the period */
function model(s,book,t){
  const e=E();if(!e)return null;
  const r=e.reconState(s,book,{today:t}),sugg=e.suggestMatches(s.lines,r.unmatchedBook,s.rules,{days:5},s);
  const months=[...new Set(s.lines.map(l=>l.date.slice(0,7)).filter(Boolean))].sort();
  const period=s.period&&/^\d{4}-\d{2}$/.test(s.period)?s.period:(months[months.length-1]||t.slice(0,7));
  return{r,sugg,period,months,cert:e.certificationOf(s,period),lineOf:id=>s.lines.find(l=>l.id===id),bookOf:id=>book.find(k=>k.id===id)}}
/* the counter «نبض اليوم» shows: open items since the last certification */
function pulse(){
  const e=E();if(!e)return null;const s=db();if(!s.lines.length)return null;
  const {book}=bookLines(),r=e.reconState(s,book,{today:today()}),n=r.sinceLast.unmatchedBank+r.sinceLast.unmatchedBook;
  return{unmatched:n,bank:r.sinceLast.unmatchedBank,book:r.sinceLast.unmatchedBook,certifiedUntil:r.sinceLast.certifiedUntil,oldest:Math.max(r.agingBank.oldest,r.agingBook.oldest),
    sub:r.sinceLast.certifiedUntil?"منذ اعتماد "+r.sinceLast.certifiedUntil+" — "+r.sinceLast.unmatchedBank+" بنك · "+r.sinceLast.unmatchedBook+" دفاتر":"لم تُعتمد فترة بعد — "+r.sinceLast.unmatchedBank+" بنك · "+r.sinceLast.unmatchedBook+" دفاتر",
    tone:n===0?"ok":r.agingBank.d31_90+r.agingBank.d90p+r.agingBook.d31_90+r.agingBook.d90p>0?"bad":"warn"}}

/* ---------- import ---------- */
async function readRows(file){
  if(/\.xlsx$/i.test(file.name)){if(!window.SKXlsx)throw new Error("قارئ Excel غير متاح — احفظ الكشف بصيغة CSV");return SKXlsx.rows(file)}
  return SK.templates.parse(await file.text())}
async function importFile(file){
  const e=E();if(!e)return toast("محرك كشف البنك غير محمّل","warn");
  let rows;try{rows=await readRows(file)}catch(err){return toast(err&&err.message||"تعذر قراءة الملف","bad")}
  const p=e.parseStatement(rows);
  if(!p.lines.length){toast(p.warnings_ar[0]||"لم يُقرأ أي سطر","warn");return}
  const s=db(),m=e.mergeImport(s,p,nowIso());
  const next={...m.state,period:s.period};put(next);
  feedLedger(next);
  SK.audit&&SK.audit.log("ledger",{act:"bank-statement-import",bank:p.bank.guess,lines:p.lines.length,added:m.added,duplicates:m.duplicates});
  toast("استُورد كشف "+BANK[p.bank.guess]+": "+m.added+" سطراً جديداً"+(m.duplicates?" و"+m.duplicates+" مكرراً تُرك":""),"ok");
  p.warnings_ar.slice(0,2).forEach(w=>toast(w,"info"));
}
/* the existing statement card reads skosif_ledger_v1.bank.lines (the template importer's shape): the continuous lines feed it */
function feedLedger(s){
  try{const d=load(LEDGER_KEY,{})||{},dated=s.lines.filter(l=>l.date);if(!dated.length)return;
    const last=dated[dated.length-1],closing=last.balance==null?((d.bank||{}).closing??null):last.balance;
    d.bank={...(d.bank||{}),lines:dated.map(l=>({id:l.id,date:l.date,amount:l.amount,description:l.description,reference:l.reference})),manual:(d.bank||{}).manual||[],closing};
    save(LEDGER_KEY,d)}catch(err){SK.errors&&SK.errors.report&&SK.errors.report(err,"bank-statement:feed")}}

/* ---------- the card ---------- */
const age=(d,t)=>{const n=Math.round((Date.parse(t)-Date.parse(d))/864e5);return Number.isFinite(n)?(n<=0?"اليوم":n+" يوماً"):"—"};
const pct=c=>Math.round(c*100)+"٪",tone=c=>c>=0.9?"good":c>=0.7?"info":"warn";
function sideList(title,items,t,draw){
  return '<section class="skbs-side"><h4>'+esc(title)+'<small>'+items.length+'</small></h4>'+(items.length?'<ul>'+items.slice(0,40).map(x=>draw(x)).join("")+'</ul>'+(items.length>40?'<p class="hint">و'+(items.length-40)+' أخرى…</p>':''):'<p class="skbs-empty">لا شيء معلّقاً.</p>')+'</section>'}
function html(s,m,t){
  const r=m.r,sl=r.sinceLast,tiles=[
    ["سطور مستوردة",String(r.lines),s.imports.length?"آخر استيراد "+esc(String(s.imports[s.imports.length-1].ts).slice(0,10)):"لا استيراد بعد","info"],
    ["مطابقات مؤكدة",String(r.confirmed),sl.confirmed+" منذ آخر اعتماد","ok"],
    ["في البنك بلا مطابقة",String(r.unmatchedBank.length),money(r.unmatchedBankAmount)+(r.agingBank.oldest?" · الأقدم "+r.agingBank.oldest+" يوماً":""),r.unmatchedBank.length?(r.agingBank.d31_90+r.agingBank.d90p?"bad":"warn"):"ok"],
    ["في الدفاتر بلا مطابقة",String(r.unmatchedBook.length),money(r.unmatchedBookAmount)+(r.agingBook.oldest?" · الأقدم "+r.agingBook.oldest+" يوماً":""),r.unmatchedBook.length?(r.agingBook.d31_90+r.agingBook.d90p?"bad":"warn"):"ok"]];
  const since=sl.certifiedUntil?'<p class="skbs-since">منذ آخر مطابقة معتمدة (<b>'+esc(sl.certifiedUntil)+'</b>): '+sl.importedLines+' سطراً مستورداً، '+sl.confirmed+' مطابقة مؤكدة، <b>'+sl.unmatchedBank+'</b> في البنك و<b>'+sl.unmatchedBook+'</b> في الدفاتر بلا مطابقة.</p>':'<p class="skbs-since">لم تُعتمد أي فترة بعد — كل السطور المعلّقة تُحسب «منذ البداية».</p>';
  const sug=m.sugg.length?'<div class="sk-table-wrap"><table class="sk-table skbs-sugg"><thead><tr><th>النوع</th><th>سطر البنك</th><th>القيد في الدفاتر</th><th>الثقة</th><th></th></tr></thead><tbody>'+m.sugg.slice(0,30).map(x=>{
      const bl=x.bankIds.map(m.lineOf).filter(Boolean),bk=x.bookIds.map(m.bookOf).filter(Boolean);
      return '<tr data-sid="'+esc(x.id)+'"><td><span class="sk-pill">'+esc(KIND[x.kind]||x.kind)+'</span></td>'+
        '<td>'+bl.map(l=>'<div><span class="n">'+esc(l.date)+'</span> · '+esc(l.description||l.reference||"")+' · <b class="n">'+money(l.amount)+'</b></div>').join("")+'</td>'+
        '<td>'+(bk.length?bk.map(k=>'<div><span class="n">'+esc(k.date)+'</span> · '+esc([k.reference,k.memo].filter(Boolean).join(" — "))+' · <b class="n">'+money(k.amount)+'</b></div>').join(""):'<span class="hint">بلا قيد — '+(x.suggestedAccountCode?'يُرحَّل إلى '+esc(x.suggestedAccountCode)+' من بطاقة «مطابقة البنك»':'رحّله من بطاقة «مطابقة البنك»')+'</span>')+'</td>'+
        '<td><span class="sk-pill '+tone(x.confidence)+'">'+pct(x.confidence)+'</span><ul class="skbs-why">'+x.reasons_ar.map(w=>'<li>'+esc(w)+'</li>').join("")+'</ul></td>'+
        '<td class="skbs-act"><button type="button" class="btn sm primary" data-bs="confirm" data-id="'+esc(x.id)+'">تأكيد</button><button type="button" class="btn sm" data-bs="reject" data-id="'+esc(x.id)+'">رفض</button></td></tr>'}).join("")+'</tbody></table></div>'
    :'<p class="skbs-empty">'+(s.lines.length?"لا اقتراحات جديدة — ما بقي يحتاج قيداً أو مطابقة يدوية.":"استورد كشف البنك لتظهر الاقتراحات.")+'</p>';
  const sides='<div class="skbs-sides">'+
    sideList("في البنك بلا مطابقة",r.unmatchedBank,t,l=>'<li><span class="n">'+esc(l.date||("؟ "+(l.dateFlag==="hijri"?"تاريخ هجري":"تاريخ غير مقروء")))+'</span><span class="d">'+esc(l.description||l.reference||"")+'</span><b class="n">'+money(l.amount)+'</b><small>'+(l.date?age(l.date,t):"")+'</small></li>')+
    sideList("في الدفاتر بلا مطابقة",r.unmatchedBook,t,k=>'<li><span class="n">'+esc(k.date)+'</span><span class="d">'+esc([k.reference,k.memo].filter(Boolean).join(" — "))+'</span><b class="n">'+money(k.amount)+'</b><small>'+age(k.date,t)+'</small></li>')+'</div>';
  const rules=s.rules.length?'<ul class="skbs-rules">'+s.rules.map(x=>'<li><b>'+esc(x.label_ar)+'</b><small>'+esc(x.kind==="fee"?"رسوم":"متكررة")+' · '+esc(x.side==="in"?"وارد":"صادر")+' · '+(x.amount==null?"المبلغ يتغير":money(Math.abs(x.amount)))+' · '+x.hits+' مطابقة · كلمات: '+esc(x.pattern.join(" "))+'</small><button type="button" class="linkish" data-bs="forget" data-id="'+esc(x.id)+'">حذف</button></li>').join("")+'</ul>':'<p class="skbs-empty">تُتعلَّم القواعد من كل مطابقة تؤكدها: الكلمات الثابتة في بيان البنك، الجهة والمبلغ.</p>';
  const certs=s.certifications.slice().reverse().slice(0,6);
  const cert='<div class="skbs-cert"><label class="sk-field"><span>الفترة</span><input type="month" id="skbs-period" value="'+esc(m.period)+'"></label>'+
    '<button type="button" class="btn primary" data-bs="certify">اعتماد مطابقة الفترة</button>'+
    (m.cert?'<span class="sk-pill good">معتمدة: '+esc(m.cert.who)+' · '+esc(String(m.cert.ts).slice(0,10))+' · '+m.cert.unmatchedCount+' معلّق · '+esc(String(m.cert.evidenceHash).slice(0,10))+'…</span>':'<span class="hint">الاعتماد يسجّل مَن ومتى وبصمة الأدلة وعدد المعلّق، ويقرأه الإقفال الشهري.</span>')+'</div>'+
    (certs.length?'<div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>الفترة</th><th>مَن</th><th>متى</th><th>مطابق</th><th>معلّق</th><th>بصمة الأدلة</th></tr></thead><tbody>'+certs.map(c=>'<tr><td class="n">'+esc(c.period)+'</td><td>'+esc(c.who)+'</td><td class="n">'+esc(String(c.ts).replace("T"," ").slice(0,16))+'</td><td class="n">'+c.matched+'</td><td class="n">'+c.unmatchedCount+'</td><td class="n skbs-hash">'+esc(String(c.evidenceHash).slice(0,16))+'…</td></tr>').join("")+'</tbody></table></div>':'');
  const imports=s.imports.length?'<p class="hint">الاستيرادات: '+s.imports.slice(-4).reverse().map(i=>esc(String(i.ts).slice(0,10))+" "+esc(BANK[i.bank]||i.bank)+" ("+i.added+" جديد"+(i.duplicates?"، "+i.duplicates+" مكرر":"")+")").join(" · ")+'</p>':'';
  return '<section class="card skbs" aria-label="كشف البنك والمطابقة المستمرة"><div class="card-h"><div><h3>كشف البنك والمطابقة المستمرة</h3><p>استورد كشف البنك كما صدّره البنك (CSV أو Excel — الراجحي، الأهلي، الرياض، الإنماء، ساب): تُقرأ الأعمدة بأسمائها، ولا يُضاف سطر مرتين، وتُقترح المطابقات بثقة وأسباب، ويُعتمد كل شهر بتوقيع وبصمة.</p></div>'+
    '<div class="sk-actions"><label class="btn primary skbs-import">استيراد كشف البنك<input type="file" accept=".csv,.txt,.tsv,.xlsx" data-bs-file hidden></label>'+(s.lines.length?'<button type="button" class="btn" data-bs="clear">مسح السطور المستوردة</button>':'')+'</div></div>'+
    '<div class="card-b sk-stack">'+
    '<div class="skbs-g">'+tiles.map(([k,v,sub,tn])=>'<div class="skbs-t tone-'+tn+'"><span class="k">'+esc(k)+'</span><b>'+esc(v)+'</b><small>'+esc(sub)+'</small></div>').join("")+'</div>'+since+
    '<h4>اقتراحات المطابقة<small>'+m.sugg.length+'</small></h4>'+sug+sides+
    '<h4>القواعد المتعلَّمة<small>'+s.rules.length+'</small></h4>'+rules+
    '<h4>اعتماد الفترة</h4>'+cert+imports+'</div></section>';
}

/* ---------- actions ---------- */
function act(a,id,root){
  const e=E();if(!e)return;let s=db();const {book}=bookLines(),t=today(),m=model(s,book,t),ts=nowIso(),w=who();
  if(a==="confirm"||a==="reject"){const x=m.sugg.find(y=>y.id===id);if(!x)return toast("الاقتراح لم يبقَ — أعيد الحساب","info");
    if(a==="confirm"){s=e.applyConfirmation(s,x,w,ts);s=e.learnRule(s,x,book,ts);SK.audit&&SK.audit.log("ledger",{act:"bank-match-confirm",kind:x.kind,confidence:x.confidence});toast("أُكِّدت المطابقة ("+(KIND[x.kind]||x.kind)+")","ok")}
    else{s=e.rejectMatch(s,x,w,ts);toast("رُفض الاقتراح ولن يُعرض مجدداً","info")}}
  else if(a==="forget"){s=e.forgetRule(s,id);toast("حُذفت القاعدة","info")}
  else if(a==="certify"){const inp=$("#skbs-period",root),period=inp&&/^\d{4}-\d{2}$/.test(inp.value)?inp.value:m.period;
    if(!s.lines.length)return toast("لا سطور مستوردة لاعتمادها","warn");
    const c=e.certify(s,period,w,ts,undefined,book);s={...c.state,period};
    SK.audit&&SK.audit.log("ledger",{act:"bank-recon-certified",period,unmatched:c.certification.unmatchedCount,evidenceHash:c.certification.evidenceHash});
    toast("اعتُمدت مطابقة "+period+(c.certification.unmatchedCount?" مع "+c.certification.unmatchedCount+" بنداً معلّقاً":" بلا بنود معلّقة"),"ok")}
  else if(a==="clear"){if(!confirm("مسح كل السطور المستوردة والمطابقات المؤكدة؟ القواعد المتعلَّمة والاعتمادات تبقى."))return;s={...s,lines:[],confirmed:[],rejected:[],imports:[]};toast("مُسحت السطور المستوردة","info")}
  else return;
  put(s);
}

/* ---------- mounting under «مطابقة البنك» in the ledger's reconciliation tab ---------- */
let timer=0,lastRoot=null;
function anchorOf(root){const h=[...root.querySelectorAll("section.card h3")].find(x=>(x.textContent||"").trim()==="مطابقة البنك");return h?h.closest("section.card"):null}
function mount(root){
  if(!root||!root.isConnected)return;const card=anchorOf(root),mine=root.querySelector(":scope .skbs");
  if(!card||!E()){if(mine)mine.remove();return}
  const s=db(),{book}=bookLines(),t=today(),m=model(s,book,t);if(!m)return;
  const h=html(s,m,t);
  if(mine){if(mine.outerHTML!==h)mine.outerHTML=h}else card.insertAdjacentHTML("afterend",h);
}
function later(root){lastRoot=root;clearTimeout(timer);timer=setTimeout(()=>mount(root),40)}
function watch(root){
  if(!root||root.dataset.skbsWatch)return;root.dataset.skbsWatch="1";
  /* the ledger repaints its tab by innerHTML: when «مطابقة البنك» is there and this card is not (or the reverse), remount */
  if("MutationObserver" in window)new MutationObserver(()=>{const has=!!root.querySelector(".skbs"),need=!!anchorOf(root);if(has!==need)later(root)}).observe(root,{childList:true,subtree:true});
  later(root);
}
function boot(){
  const c=window.SKosifCore;
  if(c&&c.onView)c.onView("ledger",root=>setTimeout(()=>watch(root),0));
  else if(SK.bus&&SK.bus.on){SK.bus.on("render",()=>{const v=document.getElementById("view");if(v&&c&&c.view&&c.view()==="ledger")watch(v)})}
  else setTimeout(boot,300);
}
boot();
/* One delegate on the document for the card's buttons and file input: the view element is shared by every screen, so a
   listener left on it would stay there on the command center and all the others (tools/phone_layout.mjs counts them). */
const cardRoot=e=>e.target.closest&&e.target.closest(".skbs")?lastRoot||document.getElementById("view"):null;
if(typeof document!=="undefined"&&document.addEventListener){
document.addEventListener("click",e=>{const root=cardRoot(e);if(!root)return;const b=e.target.closest(".skbs [data-bs]");if(b){act(b.dataset.bs,b.dataset.id,root);later(root)}});
document.addEventListener("change",async e=>{const root=cardRoot(e);if(!root)return;const f=e.target.closest(".skbs [data-bs-file]");if(!f||!f.files||!f.files[0])return;const file=f.files[0];f.value="";await importFile(file);later(root)});
}
if(SK.bus&&SK.bus.on){SK.bus.on("data",e=>{if(e&&(e.key===KEY||e.key===LEDGER_KEY)&&lastRoot)later(lastRoot)});SK.bus.on("company",()=>{lastRoot=null})}
window.SKosifBankStatement=Object.freeze({KEY,state:db,model,pulse,importRows:rows=>{const e=E();if(!e)return null;const p=e.parseStatement(rows),s=db(),m=e.mergeImport(s,p,nowIso());put({...m.state,period:s.period});feedLedger(m.state);return{...m,warnings_ar:p.warnings_ar,bank:p.bank}},
  certification:period=>{const e=E();return e?e.certificationOf(db(),period):null},html,version:"1.0.0"});
})();
