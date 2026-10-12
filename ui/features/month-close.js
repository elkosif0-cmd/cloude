/* S.kosif — الإقفال الشهري والملخص الصباحي وتنبيهات الدفاتر (window.SKosifClose).
   آلية عمل واحدة واضحة: كل شهر يمر بخطواته بالترتيب — ترحيل العمليات، متابعة التحصيل، مطابقة البنك، الجرد،
   الضريبة، ميزان المراجعة، سلامة سجل التعديلات، مطابقة الإيرادات، الإرسال إلى المراجعة، ثم إقفال الفترة. حالة كل خطوة تُقرأ من البيانات نفسها (لا علامات
   يدوية)، وكل خطوة تفتح الشاشة التي تُنجز فيها. الملخص الصباحي في مركز القيادة وتنبيهات الجرس تقرأ من المصدر نفسه
   (SKosifLedger)، فلا يختلف رقم بين شاشة وأخرى. */
(()=>{
"use strict";
const {esc,load,save,money}=SK;
const L=()=>window.SKosifLedger;
const DAY=864e5,iso=t=>new Date(t).toISOString().slice(0,10),today=()=>iso(Date.now());
const endOf=m=>iso(Date.UTC(+m.slice(0,4),+m.slice(5,7),0));
const MONTHS=["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
const label=m=>MONTHS[+m.slice(5,7)-1]+" "+m.slice(0,4);
const prevMonth=(m,k=1)=>new Date(Date.UTC(+m.slice(0,4),+m.slice(5,7)-1-k,1)).toISOString().slice(0,7);
const days=(a,b)=>Math.round((Date.parse(b)-Date.parse(a))/DAY);
let month=null;

/* ---------- close management (close-checklist-engine): the checklist with owners, sign-offs and certified
   reconciliations, and the period locks with their append-only log. One per-company key (HELPER_KEY: skosif_erp_*):
   {owners:{month:{task:role}}, signOffs:{month:{task:SignOff}}, certifications:{month:{task:Certification}},
   lock:{locks:[],log:[]}}. The engine decides every status; this file only reads the books and stores decisions. */
const CL_KEY="skosif_erp_close_v1";
const CE=()=>{try{return window.SKEngines&&SKEngines.finance&&SKEngines.finance.closeChecklist||null}catch{return null}};
const obj=v=>v&&typeof v==="object"&&!Array.isArray(v)?v:{};
const clState=()=>{const s=obj(load(CL_KEY,{}));const lk=obj(s.lock);return{owners:obj(s.owners),signOffs:obj(s.signOffs),certifications:obj(s.certifications),lock:{locks:Array.isArray(lk.locks)?lk.locks:[],log:Array.isArray(lk.log)?lk.log:[]}}};
const clSave=(s,act,detail)=>{save(CL_KEY,s);SK.audit&&SK.audit.log&&SK.audit.log("close",{act,...(detail||{})})};
const periodOf=m=>({id:m,start:m+"-01",end:endOf(m),label:label(m)});
/* the person acting: the helper-space user when one is chosen, else the role's label */
function who(){try{const u=window.SKosifSpace&&SKosifSpace.user&&SKosifSpace.user();if(u&&u.name)return String(u.name)}catch{}try{return SK.perm&&SK.perm.label?SK.perm.label():"المستخدم"}catch{return "المستخدم"}}
const roleId=()=>{try{return SK.perm&&SK.perm.role?SK.perm.role():""}catch{return ""}};
const roles=()=>{try{return SK.perm&&SK.perm.list?SK.perm.list():[]}catch{return []}};
/* what the books can tell the engine about the month (system facts); nothing here is a human decision */
function booksFacts(m){
  const l=L();if(!l)return{};const d=l.snapshot(),end=endOf(m),mm=+m.slice(5,7);
  const hist=((d.bank||{}).history||[]).map(h=>h.end).sort(),c=d.count||{};
  const name=re=>d.accounts.some(a=>re.test(String(a.name||"")));
  let v=null;if(mm%3===0){try{v=l.vat(m.slice(0,4)+"-Q"+(mm/3))}catch{v=null}}
  let tb=null,p=null;try{tb=l.trialBalance(end);p=l.pending(end)}catch{}
  const cur=(()=>{try{return SK.company.current().currency||"SAR"}catch{return "SAR"}})();
  return{bankReconciledTo:hist[hist.length-1]||null,inventoryCountDate:c.posted&&c.date?c.date:null,
    hasInventory:d.accounts.some(a=>String(a.code)==="1300")||name(/مخزون/),
    vatSettled:v?!!v.settled:null,vatDue:v?v.q.due:null,
    hasFixedAssets:name(/أصول ثابتة|معدات|سيارات|مبان|آلات|أثاث|إهلاك/),
    hasForeignCurrency:d.entries.some(e=>e.currency&&String(e.currency).toUpperCase()!==cur),
    hasIntercompany:name(/شقيقة|ذات علاقة|intercompany/i),
    trialBalanceBalanced:tb?!!tb.balanced:undefined,pendingPostings:p?p.total||0:0};
}
function checklist(m){
  const E=CE();if(!E||!L())return null;const s=clState();
  try{return E.buildChecklist(periodOf(m),booksFacts(m),{today:today(),owners:s.owners[m]||{},signOffs:s.signOffs[m]||{},certifications:s.certifications[m]||{},lock:s.lock})}
  catch(e){SK.errors&&SK.errors.report&&SK.errors.report(e,"close-checklist");return null}
}
const readinessOf=m=>{const E=CE(),c=checklist(m);return E&&c?E.readiness(c):null};
/* the ledger's question before any posting: {ok} without the engine or without locks (unchanged behaviour) */
function canPost(date){const E=CE();if(!E)return{ok:true};try{return E.canPost(clState().lock,date)}catch{return{ok:true}}}
function lockMonth(m,by,ts){
  const E=CE(),l=L();if(!l)return{ok:false,reason_ar:"الدفاتر غير متاحة"};
  const end=endOf(m);let r={ok:true};
  if(E){const s=clState();r=E.lockPeriod(s.lock,periodOf(m),by||who(),ts||new Date().toISOString());if(!r.ok)return r;s.lock=r.state;clSave(s,"lock",{period:m,who:r.event.who})}
  /* the books' single lock date follows, so every older guard agrees */
  if(!(l.snapshot().lockDate>=end))l.lockTo(end);
  return r;
}
function unlockMonth(m,by,reason,ts){
  const E=CE(),l=L();if(!E||!l)return{ok:false,reason_ar:"محرك الإقفال غير متاح"};
  const s=clState(),r=E.unlockPeriod(s.lock,periodOf(m),by||who(),reason,ts||new Date().toISOString());if(!r.ok)return r;
  s.lock=r.state;clSave(s,"unlock",{period:m,who:r.event.who,reason:r.event.reason});
  /* the single lock date steps back to the day before the period; any other locked period keeps refusing through canPost */
  const d=l.snapshot();if(d.lockDate&&d.lockDate>=endOf(m)&&l.unlockTo)l.unlockTo(iso(Date.parse(m+"-01")-DAY));
  return r;
}
function setOwner(m,taskId,role){const s=clState();s.owners[m]={...(s.owners[m]||{}),[taskId]:String(role||"")};clSave(s,"owner",{period:m,task:taskId,role})}
function sign(m,taskId,note,by,ts){
  const E=CE(),c=checklist(m);if(!E||!c)return{ok:false,reason_ar:"محرك الإقفال غير متاح"};
  const t=c.tasks.find(x=>x.id===taskId);if(!t)return{ok:false,reason_ar:"مهمة غير معروفة"};
  try{const out=E.signOff(t,by||who(),note||"",ts||new Date().toISOString(),roleId());const s=clState();s.signOffs[m]={...(s.signOffs[m]||{}),[taskId]:out.signOff};clSave(s,"signoff",{period:m,task:taskId,who:out.signOff.who});return{ok:true,task:out}}
  catch(e){return{ok:false,reason_ar:String(e&&e.message||e)}}
}
function certifyTask(m,taskId,hash,by,ts,note){
  const E=CE(),c=checklist(m);if(!E||!c)return{ok:false,reason_ar:"محرك الإقفال غير متاح"};
  const t=c.tasks.find(x=>x.id===taskId);if(!t)return{ok:false,reason_ar:"مهمة غير معروفة"};
  try{const out=E.certify(t,hash,by||who(),ts||new Date().toISOString(),note);const s=clState();s.certifications[m]={...(s.certifications[m]||{}),[taskId]:out.certification};clSave(s,"certify",{period:m,task:taskId,hash:out.certification.evidenceHash});return{ok:true,task:out}}
  catch(e){return{ok:false,reason_ar:String(e&&e.message||e)}}
}
async function hashFile(file){const b=await file.arrayBuffer();if(!(globalThis.crypto&&crypto.subtle))throw new Error("لا تتوفر بصمة SHA-256 في هذا المتصفح");const d=await crypto.subtle.digest("SHA-256",b);return [...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,"0")).join("")}
const ST={done:["good","تم"],pending:["warn","بانتظار"],blocked:["bad","متوقف"],na:["","لا ينطبق"]},MODE={system:"من الدفاتر",human:"قرار بشري"};
const ERR={CLOSE_CERTIFY_HASH_INVALID:"بصمة الدليل غير صالحة",CLOSE_SIGNOFF_HUMAN_ONLY:"هذه المهمة تُحسم من الدفاتر لا بالتوقيع",CLOSE_SIGNOFF_NOT_APPLICABLE:"المهمة لا تنطبق"};
function checklistHTML(m){
  const E=CE();if(!E)return '<section class="card skcl"><div class="card-h"><div><h3>قائمة الإقفال</h3><p>محرك قائمة الإقفال غير مُحمّل في هذه النسخة.</p></div></div></section>';
  const c=checklist(m);if(!c)return "";
  const R=E.readiness(c),log=E.lockLog(clState().lock).filter(e=>e.periodId===m).slice(-6).reverse(),rs=roles(),p=c.period;
  const locked=R.locked,tone=locked?"ok":R.ready?"ok":R.blockers.some(b=>b.status==="blocked")?"bad":"warn";
  const row=t=>{const st=ST[t.status]||ST.pending,owner=rs.length?'<select class="skcl-owner" data-cl-owner="'+esc(t.id)+'" aria-label="مسؤول '+esc(t.title_ar)+'"'+(locked?' disabled':'')+'>'+rs.map(r=>'<option value="'+esc(r.id)+'"'+(r.id===t.owner?' selected':'')+'>'+esc(r.label||r.id)+'</option>').join("")+'</select>':'<span class="skcl-owner">'+esc(t.owner)+'</span>';
    const act=t.status==="na"||locked?"":t.mode==="human"?(t.status==="done"?"":'<button type="button" class="btn sm primary" data-cl="sign" data-task="'+esc(t.id)+'">توقيع</button>')
      :t.requiresEvidence&&t.status!=="done"&&t.fact?'<label class="skcl-ev"><span>اعتماد بدليل (ملف الكشف)</span><input type="file" data-cl-file="'+esc(t.id)+'" aria-label="دليل '+esc(t.title_ar)+'"></label>':"";
    return '<li class="st-'+t.status+(t.overdue?' late':'')+'"><div class="tx"><b>'+esc(t.title_ar)+'</b><small>'+esc(t.why_ar)+' · '+MODE[t.mode]+'</small><span class="note">'+esc(t.detail_ar)+'</span></div>'+
      '<div class="skcl-meta">'+owner+'<time datetime="'+esc(t.due)+'">'+(t.overdue?'متأخر منذ ':'يستحق ')+esc(t.due)+'</time></div>'+
      '<span class="sk-pill '+st[0]+'">'+st[1]+'</span><div class="skcl-act">'+act+'</div></li>'};
  return '<section class="card skcl" aria-label="قائمة الإقفال"><div class="card-h"><div><h3>قائمة إقفال '+esc(label(m))+'</h3><p>مهام الإقفال بمسؤول وموعد وتوقيع لكل مهمة؛ ما تحسمه الدفاتر يُقرأ منها، وما يحتاج قراراً يُوقَّع، والمطابقات تُعتمد بدليل ببصمة SHA-256.</p></div>'+
      '<div class="skcl-ring tone-'+tone+'" style="--p:'+R.pct+'" role="img" aria-label="الجاهزية '+R.pct+'٪"><i>'+R.pct+'%</i></div></div>'+
    '<div class="card-b"><p class="hint">'+R.done+' من '+R.of+' مهام مكتملة'+(R.overdue?' · '+R.overdue+' متأخرة':'')+(locked?' — الفترة مقفلة':R.ready?' — جاهزة للإقفال النهائي':R.blockers.length?' — التالية: <b>'+esc(R.blockers[0].title_ar)+'</b>':'')+'</p>'+
    '<ol class="skclose-steps skcl-tasks">'+c.tasks.map(row).join("")+'</ol>'+
    '<div class="skcl-lock"><div class="tx"><b>'+(locked?'الفترة مقفلة':'إقفال الفترة')+'</b><small>'+(locked?'لا يُقبل قيد بتاريخ بين '+esc(p.start)+' و'+esc(p.end)+'؛ فتح الإقفال يحتاج سبباً ويُسجَّل.':'بعد الإقفال يرفض محرك الدفاتر أي قيد بتاريخ داخل الفترة ويعرض السبب.')+'</small></div>'+
      '<div class="sk-actions">'+(locked?'<button type="button" class="btn" data-cl="punlock">فتح الإقفال بسبب</button>':'<button type="button" class="btn primary" data-cl="plock"'+(R.ready?'':' disabled')+'>إقفال الفترة</button>')+'</div></div>'+
    (log.length?'<ol class="skcl-log" aria-label="سجل الإقفال">'+log.map(e=>'<li><span class="sk-pill '+(e.kind==="lock"?"good":"warn")+'">'+(e.kind==="lock"?"إقفال":"فتح")+'</span><b>'+esc(e.who)+'</b><small>'+esc(String(e.ts).slice(0,16).replace("T"," "))+(e.reason?' — '+esc(e.reason):'')+'</small></li>').join("")+'</ol>':'')+
    '</div></section>';
}

/* the month to close: the first ended month after the lock date, else the last ended month */
function defaultMonth(){
  const last=prevMonth(today().slice(0,7)),lock=(L()&&L().snapshot().lockDate)||"";
  if(lock){const next=iso(Date.parse(lock)+DAY).slice(0,7);if(next<=last)return next}
  return last;
}
/* the quarter that ended most recently: the one whose return is due now */
function currentQuarter(){const d=new Date();return d.getUTCFullYear()+"-Q"+(Math.floor(d.getUTCMonth()/3)+1)}
function lastQuarter(){const d=new Date(),q=Math.floor(d.getUTCMonth()/3);return q?d.getUTCFullYear()+"-Q"+q:(d.getUTCFullYear()-1)+"-Q4"}

function steps(m){
  const l=L();if(!l)return [];
  const d=l.snapshot(),end=endOf(m),start=m+"-01",t=today(),S=[];
  const add=(id,title,why,st,note,act)=>S.push({id,title,why,st,note,act});
  if(!d.accounts.length)return [{id:"setup",title:"دليل الحسابات",why:"الإقفال يقرأ من الدفاتر",st:"bad",note:"أنشئ دليل الحسابات أولاً",act:{tab:"accounts",label:"إنشاء الدليل"}}];
  const p=l.pending(end);
  add("post","ترحيل عمليات الشهر","كل بيع واستلام حتى نهاية الشهر مرحّل بقيده",p.total?"warn":"ok",p.total?p.total+" عملية بانتظار الترحيل، أقدمها "+p.oldest:"كل العمليات مرحّلة",{tab:"entries",label:"ترحيل"});
  const ar=l.parties("ar",end),lateRows=ar?ar.rows.filter(r=>r.aging["61-90"]+r.aging["90+"]>0):[],late=ar?ar.totals["61-90"]+ar.totals["90+"]:0;
  add("collect","متابعة التحصيل","العملاء المتأخرون أكثر من 60 يوماً في نهاية الشهر",late>0?"warn":"ok",late>0?lateRows.length+" عميل متأخر بمبلغ "+money(late):"لا متأخرات تزيد على 60 يوماً",{tab:"cash",label:"التحصيل"});
  const hist=((d.bank||{}).history||[]).map(h=>h.end).sort(),rec=hist[hist.length-1]||null;
  add("bank","مطابقة البنك","كشف البنك مطابق لحساب النقدية حتى نهاية الشهر",rec&&rec>=end?"ok":"warn",rec?(rec>=end?"طوبق حتى "+rec:"آخر مطابقة معتمدة "+rec):"لم تُعتمد مطابقة بعد",{tab:"recon",label:"مطابقة البنك"});
  const c=d.count||{},counted=!!(c.posted&&c.date&&c.date>=start);
  add("count","جرد المخزون","الكميات على الرفوف مقابل حساب المخزون",counted?"ok":"warn",counted?"جُرد في "+c.date:"لم يُرحّل جرد لهذا الشهر",{tab:"recon",label:"الجرد"});
  const mm=+m.slice(5,7);
  if(mm%3===0){const qid=m.slice(0,4)+"-Q"+(mm/3),v=l.vat(qid);
    if(v)add("vat","إقرار الضريبة","الربع ينتهي هذا الشهر: الإقرار وقيد إقفال الضريبة",v.settled?"ok":t>v.q.due?"bad":"warn",
      v.settled?"أُقفلت ضريبة "+v.q.label+" — صافي "+money(v.r.net):"صافي "+(v.r.net>=0?"المستحق ":"المسترد ")+money(Math.abs(v.r.net))+" · آخر موعد "+v.q.due,{tab:"vat",q:qid,label:"الإقرار"});
  }else add("vat","إقرار الضريبة","الإقرار ربع سنوي","na","لا إقرار هذا الشهر — الربع ينتهي في "+label(m.slice(0,5)+String(Math.ceil(mm/3)*3).padStart(2,"0")),{tab:"vat",label:"عرض"});
  const tb=l.trialBalance(end);
  add("tb","ميزان المراجعة","المدين يساوي الدائن في نهاية الشهر",tb.balanced?"ok":"bad",tb.balanced?"متزن — "+tb.rows.length+" حساباً":"غير متزن — فرق "+money(tb.totals.debit-tb.totals.credit),{tab:"tb",label:"الميزان"});
  /* the journal's audit trail covers the month, and the month's revenue ties to the sales register (research: Reliance,
     Infosys edit-log reporting; e& and Deutsche Telekom revenue reconciliations) */
  const CH=window.SKEngines&&SKEngines.finance.journalChain,tr=l.trail&&l.trail();
  if(CH&&tr){const cv=CH.coversPeriod(d.entries,start,end);
    add("trail","سلامة سجل التعديلات","كل قيود الشهر مختومة في السلسلة ولا تعديل أو حذف بعد الترحيل",!tr.ok||tr.events?"bad":cv.entries&&!cv.throughout?"warn":"ok",
      !tr.ok||tr.events?[tr.issues.length?tr.issues.length+" قيد تغيّر أو انقطع تسلسله":"",tr.events?tr.events+" إدراج من خارج الدفاتر":""].filter(Boolean).join(" · "):cv.entries?(cv.throughout?"كل قيود الشهر مختومة ("+cv.entries+")":cv.uncovered+" قيداً سابقاً للتفعيل — اختمها"):"لا قيود في الشهر",{tab:"recon",label:"سجل التعديلات"});}
  const rr=l.revenueRecon&&l.revenueRecon();
  if(rr&&(rr.rows.length||rr.unposted.length)){const row=rr.rows.find(x=>x.month===m),unp=rr.unposted.filter(u=>u.date.slice(0,7)===m),man=rr.manual.filter(x=>x.date.slice(0,7)===m);
    const diff=row?row.ledger-row.other-row.source:0,ok=!unp.length&&Math.abs(diff)<=Math.max(100,rr.tolerance);
    add("revenue","مطابقة الإيرادات","مبيعات الشهر في السجل = إيرادات الأستاذ، والقيود اليدوية على الإيرادات موثقة",ok?(man.length?"warn":"ok"):"warn",
      !ok?(unp.length?unp.length+" بيع غير مرحّل":"فرق "+money(diff/100)):man.length?man.length+" قيد يدوي على الإيرادات — وثّقه":"مطابقة",{tab:"recon",label:"مطابقة الإيرادات"});}
  const r=load("skosif_tbreview_v1",{})||{},sent=!!(r.tbText&&r.loadedAt&&r.loadedAt.slice(0,10)>=end);
  add("review","الإرسال إلى المراجعة","ميزان الشهر في ملف المراجعة (المعايير والمجلس الذكي) — اختياري",sent?"ok":"na",sent?"أُرسل في "+r.loadedAt.slice(0,10):"لم يُرسل ميزان هذا الشهر",{run:"review",label:"إرسال الميزان"});
  S[S.length-1].optional=true;
  /* the lock: the books' single lock date or a close-management lock on the month; when the checklist engine is
     loaded, the final lock also waits for its sign-offs and certifications */
  const R=readinessOf(m),locked=!!(d.lockDate&&d.lockDate>=end)||!!(R&&R.locked),ready=S[0].st==="ok"&&S.find(x=>x.id==="tb").st==="ok"&&t>end&&(!R||R.ready);
  add("lock","إقفال الفترة","بعد الإقفال لا يتغير رقم في الشهر",locked?"ok":ready?"warn":"bad",locked?"مقفلة حتى "+(d.lockDate>=end?d.lockDate:end):ready?"جاهز للإقفال":t<=end?"الشهر لم ينته بعد":R&&!R.ready&&R.blockers.length?"قائمة الإقفال: "+R.blockers.length+" مهمة مفتوحة":"رحّل العمليات ووازن الميزان أولاً",{run:"lock",label:"إقفال الشهر",disabled:!ready||locked});
  return S;
}
function progress(S){const a=S.filter(x=>!x.optional&&x.st!=="na");return{done:a.filter(x=>x.st==="ok").length,of:a.length,next:a.find(x=>x.st!=="ok")||null}}
const PILL={ok:["good","تم"],warn:["warn","يحتاج إجراء"],bad:["bad","متوقف"],na:["","لا يلزم"]};
const btn=(x,cls)=>'<button type="button" class="btn sm'+(cls||"")+'" data-cl="'+(x.act.run||"go")+'" data-go-tab="'+esc(x.act.tab||"")+'" data-q="'+esc(x.act.q||"")+'"'+(x.act.disabled?' disabled':'')+'>'+esc(x.act.label)+'</button>';

function html(){
  if(!L())return "";
  month=month||defaultMonth();
  const S=steps(month),P=progress(S),cur=today().slice(0,7),opts=[1,2,3].map(k=>prevMonth(cur,k));if(!opts.includes(month))opts.unshift(month);
  const pct=P.of?Math.round(P.done/P.of*100):0;
  return '<section class="card skclose"><div class="card-h"><div><h3>إقفال شهر '+esc(label(month))+'</h3><p>'+S.length+' خطوات معروضة: '+P.of+' مطلوبة، و'+(S.length-P.of)+' غير مطلوبة (اختيارية أو لا تنطبق). حالة كل خطوة من الدفاتر نفسها، والزر يفتح مكان إنجازها.</p></div>'+
      '<div class="sk-chips">'+opts.map(x=>'<button type="button" class="chip'+(x===month?' active':'')+'" data-cl="month" data-m="'+x+'" aria-pressed="'+(x===month)+'">'+esc(label(x))+'</button>').join("")+'</div></div>'+
    '<div class="card-b"><div class="skclose-bar" role="progressbar" aria-label="تقدم الإقفال" aria-valuemin="0" aria-valuemax="'+P.of+'" aria-valuenow="'+P.done+'"><span style="width:'+pct+'%"></span></div>'+
    '<p class="hint">'+P.done+' من '+P.of+' خطوات مكتملة'+(P.next?' — التالية: <b>'+esc(P.next.title)+'</b>':' — الشهر مكتمل ومقفل')+'</p>'+
    '<ol class="skclose-steps">'+S.map((x,i)=>'<li class="st-'+x.st+'"><span class="n">'+(i+1)+'</span><div class="tx"><b>'+esc(x.title)+'</b><small>'+esc(x.why)+'</small><span class="note">'+esc(x.note)+'</span></div>'+
      '<span class="sk-pill '+PILL[x.st][0]+'">'+PILL[x.st][1]+(x.optional?' · اختياري':'')+'</span>'+btn(x,x.st==="warn"||x.st==="bad"?" primary":"")+'</li>').join("")+'</ol></div></section>'+checklistHTML(month);
}

/* ---------- alerts for the bell: what the books say needs attention now ---------- */
function alerts(){
  const l=L();if(!l)return [];
  const d=l.snapshot();if(!d.accounts.length||!d.entries.length)return [];
  const out=[],t=today(),q=lastQuarter(),v=l.vat(q);
  if(v&&!v.settled&&(v.r.outputVat||v.r.inputVat)){const left=days(t,v.q.due);
    if(left<=20)out.push({id:"vat:"+q,sev:left<=5?"bad":"warn",title:left<0?"فات موعد إقرار الضريبة":"موعد إقرار الضريبة يقترب",detail:v.q.label+" "+q.slice(0,4)+" — صافي "+money(v.r.net)+" · آخر موعد "+v.q.due+(left>=0?" (بعد "+left+" يوماً)":""),tab:"vat",q})}
  const ar=l.parties("ar",t);
  if(ar){const late=ar.totals["61-90"]+ar.totals["90+"];if(late>0)out.push({id:"ar60:"+Math.round(late),sev:"warn",title:"عملاء متأخرون أكثر من 60 يوماً",detail:money(late)+" لدى "+ar.rows.filter(r=>r.aging["61-90"]+r.aging["90+"]>0).length+" عميل",tab:"cash"})}
  const p=l.pending(t);
  if(p.total&&p.oldest&&days(p.oldest,t)>3)out.push({id:"post:"+p.total+":"+p.oldest,sev:"warn",title:"عمليات لم تُرحّل للدفاتر",detail:p.total+" عملية، أقدمها "+p.oldest,tab:"entries"});
  const hist=((d.bank||{}).history||[]).map(h=>h.end).sort(),last=hist[hist.length-1];
  if(!last||days(last,t)>35)out.push({id:"bank:"+(last||"none"),sev:"info",title:"مطابقة البنك متأخرة",detail:last?"آخر مطابقة معتمدة "+last:"لم تُعتمد مطابقة بنكية بعد",tab:"recon"});
  const pm=prevMonth(t.slice(0,7));
  if(+t.slice(8,10)>15&&!(d.lockDate&&d.lockDate>=endOf(pm)))out.push({id:"close:"+pm,sev:"info",title:"شهر "+label(pm)+" لم يُقفل بعد",detail:"أكمل خطوات الإقفال الشهري",tab:"close"});
  return out;
}

/* ---------- the morning brief on the command centre ---------- */
function idbAll(store){return new Promise(res=>{let q;try{q=indexedDB.open("aghnam-app-v7")}catch{return res([])}q.onerror=()=>res([]);q.onsuccess=()=>{const db=q.result;
  if(!db.objectStoreNames.contains(store)){db.close();return res([])}const r=db.transaction(store).objectStore(store).getAll();r.onsuccess=()=>{db.close();res(r.result||[])};r.onerror=()=>{db.close();res([])}}})}
async function briefHTML(){
  const l=L(),t=today(),y=iso(Date.now()-DAY),tiles=[];
  const tile=(k,title,value,sub,tone,go)=>tiles.push('<button type="button" class="skbrief-t tone-'+tone+'" '+(go.tab?'data-cl="go" data-go-tab="'+go.tab+'" data-q="'+esc(go.q||"")+'"':'data-flow-go="'+go.view+'"')+'><span class="k">'+esc(title)+'</span><b>'+esc(value)+'</b><small>'+esc(sub)+'</small></button>');
  /* sales: yesterday against the last 30 days */
  const byDay={},put=(d,v)=>{d=String(d||"").slice(0,10);if(d&&v)byDay[d]=(byDay[d]||0)+v};
  (await idbAll("sales_lines")).forEach(x=>put(x.date,Number(x.amountHalalas)?Number(x.amountHalalas)/100:Number(x.amount)||0));
  (load("aghnam-v12-manual-sales",[])||[]).forEach(x=>put(x&&x.date,Number(x&&x.amount)||0));
  const avg=[...Array(30)].reduce((s,_,i)=>s+(byDay[iso(Date.now()-(i+1)*DAY)]||0),0)/30,ys=byDay[y]||0;
  tile("sales","مبيعات أمس",money(ys),avg?(ys>=avg?"فوق":"دون")+" متوسط 30 يوماً ("+money(avg)+")":"لا مبيعات في آخر 30 يوماً",avg&&ys<avg*0.7?"warn":"ok",{view:"salesintel"});
  if(l&&l.snapshot().accounts.length){
    const ar=l.parties("ar",t);
    if(ar){const over=ar.totals["1-30"]+ar.totals["31-60"]+ar.totals["61-90"]+ar.totals["90+"],late=ar.totals["61-90"]+ar.totals["90+"];
      tile("ar","مستحق من العملاء",money(ar.balance+ar.unassigned),over?"متأخر "+money(over)+(late?"، منه "+money(late)+" فوق 60 يوماً":""):"لا متأخرات",late?"bad":over?"warn":"ok",{tab:"cash"})}
    const cash=l.balance("1100",t),hist=((l.snapshot().bank||{}).history||[]).map(h=>h.end).sort(),last=hist[hist.length-1];
    if(cash!=null)tile("cash","النقدية والبنوك",money(cash),last?"آخر مطابقة بنكية قبل "+days(last,t)+" يوماً":"لم تُطابق مع البنك بعد",!last||days(last,t)>35?"warn":"ok",{tab:"recon"});
    /* the return due now if it is still open, else the current quarter so far */
    const q=lastQuarter(),v=l.vat(q),cq=currentQuarter(),c=l.vat(cq);
    if(v&&!v.settled&&(v.r.outputVat||v.r.inputVat)){const left=days(t,v.q.due);
      tile("vat","ضريبة القيمة المضافة",money(Math.abs(v.r.net)),(v.r.net>=0?"مستحق":"مسترد")+" عن "+v.q.label+" · آخر موعد "+v.q.due+(left>=0?" (بعد "+left+" يوماً)":" (فات)"),left<=5?"bad":left<=20?"warn":"ok",{tab:"vat",q})}
    else if(c)tile("vat","ضريبة القيمة المضافة",money(Math.abs(c.r.net)),(c.r.net>=0?"مستحق":"مسترد")+" حتى الآن عن "+c.q.label+" · يُقدَّم حتى "+c.q.due,"ok",{tab:"vat",q:cq});
    const m=defaultMonth(),P=progress(steps(m));
    tile("close","إقفال "+label(m),P.done+" من "+P.of,P.next?"التالي: "+P.next.title:"مكتمل ومقفل",P.next?"warn":"ok",{tab:"close"});
  }
  const tasks=(load("skosif_tasks_v1",[])||[]).filter(k=>k&&!k.done&&k.due),over=tasks.filter(k=>k.due<t).length,due=tasks.filter(k=>k.due===t).length;
  tile("tasks","المهام",String(due+over),over?over+" متأخرة و"+due+" اليوم":due?due+" مستحقة اليوم":"لا مهام مستحقة اليوم",over?"bad":due?"warn":"ok",{view:"tasks"});
  const R=load("skosif_risks_v1",{})||{},high=(R.risks||[]).filter(r=>r.status!=="closed"&&(+r.likelihood||1)*(+r.impact||1)>=6).length+(R.findings||[]).filter(f=>f.status!=="resolved"&&f.severity==="high").length;
  tile("risks","مخاطر وملاحظات عالية",String(high),high?"مفتوحة وتحتاج قراراً":"لا شيء عالي الأثر مفتوح",high?"warn":"ok",{view:"risks"});
  const h=new Date().getHours(),date=new Date().toLocaleDateString("ar-SA-u-ca-gregory-nu-latn",{weekday:"long",day:"numeric",month:"long"});
  return '<section class="skbrief" aria-label="ملخص اليوم"><header><b>'+(h<12?"صباح الخير":"مساء الخير")+'</b><span>ملخص '+esc(date)+' — من بيانات التطبيق نفسها</span></header><div class="skbrief-g">'+tiles.join("")+'</div></section>';
}
async function brief(root){
  if(!root||root.querySelector(".skbrief"))return;
  let h;try{h=await briefHTML()}catch(e){SK.errors&&SK.errors.report(e,"brief");return}
  if(root.querySelector(".skbrief"))return;
  const w=document.createElement("div");w.innerHTML=h;const el=w.firstElementChild;
  const jr=root.querySelector(":scope>.skjr"),demo=root.querySelector(":scope>.skdemo");
  if(jr)jr.before(el);else if(demo)demo.after(el);else root.prepend(el);
}
function boot(){const c=window.SKosifCore;if(c&&c.onView)c.onView("dash",r=>setTimeout(()=>brief(r),0));else setTimeout(boot,300)}
boot();

document.addEventListener("click",async e=>{
  const b=e.target.closest("[data-cl]");if(!b||b.disabled)return;
  const a=b.dataset.cl,l=L();if(!l)return;
  if(a==="month"){month=b.dataset.m;l.open("close");return}
  if(a==="go"){l.open(b.dataset.goTab||"close",{q:b.dataset.q||undefined});return}
  if(a==="review"){await l.sendToReview();return}
  const m=month||defaultMonth();
  if(a==="lock"||a==="plock"){const end=endOf(m);
    if(!await SK.confirm("إقفال الدفاتر حتى "+end+"؟ لن يُقبل بعدها قيد أو ترحيل أو عكس بتاريخ في "+label(end.slice(0,7))+" أو قبله.",{ok:"إقفال"}))return;
    const r=lockMonth(m);if(r.ok)SK.toast("أُقفل شهر "+label(end.slice(0,7)),"ok");else SK.toast(r.reason_ar||"لم يُقفل","warn");l.open("close");return}
  if(a==="punlock"){
    const v=await SK.form("فتح إقفال "+label(m),[{key:"reason",label:"سبب فتح الإقفال",type:"textarea",required:true,hint:"يُسجَّل مع اسمك والوقت في سجل الإقفال"}],{danger:true,ok:"فتح الإقفال",message:"يسمح بتغيير أرقام فترة معتمدة."});
    if(!v)return;const r=unlockMonth(m,undefined,v.reason);SK.toast(r.ok?"فُتح إقفال "+label(m):r.reason_ar||"لم يُفتح",r.ok?"ok":"warn");l.open("close");return}
  if(a==="sign"){const c=checklist(m),t=c&&c.tasks.find(x=>x.id===b.dataset.task);if(!t)return;
    const v=await SK.form("توقيع: "+t.title_ar,[{key:"note",label:"ملاحظة التوقيع",type:"textarea",hint:t.why_ar}],{ok:"توقيع باسم "+who()});
    if(!v)return;const r=sign(m,t.id,v.note);SK.toast(r.ok?"وُقّعت المهمة":ERR[r.reason_ar]||r.reason_ar,r.ok?"ok":"warn");l.open("close")}
});
/* a reconciliation's evidence file: hashed in the browser, the hash and the certifier go to the engine */
document.addEventListener("change",async e=>{
  const i=e.target.closest&&e.target.closest("[data-cl-file]");if(i){const f=i.files&&i.files[0],l=L();if(!f||!l)return;
    try{const h=await hashFile(f),r=certifyTask(month||defaultMonth(),i.dataset.clFile,h,undefined,undefined,f.name);SK.toast(r.ok?"اعتُمدت المطابقة بدليل "+h.slice(0,12)+"…":ERR[r.reason_ar]||r.reason_ar,r.ok?"ok":"warn")}
    catch(err){SK.toast(String(err&&err.message||err),"warn")}l.open("close");return}
  const s=e.target.closest&&e.target.closest("[data-cl-owner]");if(s){setOwner(month||defaultMonth(),s.dataset.clOwner,s.value);SK.toast("حُفظ المسؤول","ok")}
});
window.SKosifClose=Object.freeze({html,steps:m=>steps(m||defaultMonth()),alerts,month:()=>month||defaultMonth(),
  /* close management: the checklist, its readiness, the period locks and the ledger's question */
  checklist:m=>checklist(m||defaultMonth()),readiness:m=>readinessOf(m||defaultMonth()),canPost,lock:lockMonth,unlock:unlockMonth,sign,certify:certifyTask,setOwner,lockLog:()=>{const E=CE();return E?E.lockLog(clState().lock):[]},STORAGE_KEY:CL_KEY});
})();
